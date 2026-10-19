import postgres from 'npm:postgres@3.4.7';
import { Buffer } from 'node:buffer';
import { createClubHandler, type ClubRequest, type ClubResponse } from './handler.ts';

// Supabase provides this server-only connection string automatically.
const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, {
  prepare: false, max: 2, idle_timeout: 10, connect_timeout: 10,
  connection: { search_path: 'ku_acoustic, public' },
});
const fallbackOrigins = 'https://ku-acoustic-website.vercel.app,http://localhost:5173,http://127.0.0.1:5173';

function database(transaction: any) {
  return {
    prepare(query: string) {
      let index = 0;
      const statement = query.replace(/\?/g, () => `$${++index}`);
      const execute = async (values: unknown[]) => {
        const rows = await transaction.unsafe(statement, values);
        for (const row of rows) if ('count' in row) row.count = Number(row.count);
        return rows;
      };
      return {
        all: (...values: unknown[]) => execute(values),
        get: async (...values: unknown[]) => (await execute(values))[0],
        run: async (...values: unknown[]) => ({ changes: (await execute(values)).count }),
      };
    },
  };
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS') || fallbackOrigins;
  const cors = new Headers({
    'Vary': 'Origin', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization,apikey',
  });
  if (origin && allowedOrigins.split(',').map(value => value.trim()).includes(origin)) {
    cors.set('Access-Control-Allow-Origin', origin);
    cors.set('Access-Control-Allow-Credentials', 'true');
  } else if (origin) {
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403, headers: cors });
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const url = new URL(request.url);
  // Hosted gateways strip /functions/v1 before forwarding to the runtime.
  const path = url.pathname.replace(/^\/(?:functions\/v1\/)?club-api/, '');
  if (!path.startsWith('/api/'))
    return Response.json({ error: 'Endpoint not found.' }, { status: 404, headers: cors });
  const writing = !['GET', 'HEAD'].includes(request.method);
  try {
    return await sql.begin(async (transaction: any) => {
      if (writing) {
        // Serialize decisions and inserts together: capacity and booking checks
        // must not race across separate Edge Function instances.
        await transaction`select pg_advisory_xact_lock(827401)`;
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
        const key = `${ip}:${Math.floor(Date.now() / 60000)}`;
        await transaction`delete from rate_limits where expires < now()`;
        const [rate] = await transaction`
          insert into rate_limits (key, count, expires) values (${key}, 1, now() + interval '2 minutes')
          on conflict (key) do update set count = rate_limits.count + 1 returning count`;
        if (rate.count > 50)
          return Response.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429, headers: cors });
      }
      const [setting] = await transaction`select value from settings where key = 'admin_token_sha256'`;
      const headers = Object.fromEntries(request.headers);
      headers.host = url.host;
      const req: ClubRequest = {
        url: path + url.search, method: request.method, headers,
        socket: { remoteAddress: 'edge' },
        async *[Symbol.asyncIterator]() {
          if (!request.body) return;
          const reader = request.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield Buffer.from(value);
            }
          } finally { await reader.cancel(); reader.releaseLock(); }
        },
      };
      let status = 200;
      let payload: string | null = null;
      const res: ClubResponse = {
        writeHead(code: number, values: Record<string, string>) {
          status = code;
          for (const [key, value] of Object.entries(values)) cors.set(key, value);
        },
        end(value) { payload = typeof value === 'string' ? value : null; },
      };
      const handler = createClubHandler({ db: database(transaction), adminTokenDigest: setting?.value, allowedOrigins, production: true });
      await handler(req, res);
      return new Response(request.method === 'HEAD' ? null : payload, { status, headers: cors });
    });
  } catch (error) {
    console.error('Club API transaction failed', error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500, headers: cors });
  }
});
