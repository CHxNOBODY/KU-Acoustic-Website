import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const db = new DatabaseSync(process.env.DATABASE_PATH || './data/club.sqlite', { readOnly: true });
const literal = (value: unknown) => value == null ? 'NULL' : "'" + String(value).replaceAll("'", "''") + "'";
const statements = ['begin;'];
for (const table of ['content', 'submissions']) {
  const rows = db.prepare(`select * from ${table}`).all();
  for (const row of rows) {
    const columns = Object.keys(row);
    statements.push(`insert into ku_acoustic.${table} (${columns.join(',')}) values (${columns.map(key => literal(row[key])).join(',')}) on conflict do nothing;`);
  }
  console.log(`${table}: ${rows.length} rows exported.`);
}
// Preserve committee access without copying the secret itself or local sessions.
if (process.env.ADMIN_TOKEN) {
  const hash = createHash('sha256').update(process.env.ADMIN_TOKEN).digest('hex');
  statements.push(`insert into ku_acoustic.settings(key,value) values ('admin_token_sha256',${literal(hash)}) on conflict (key) do update set value=excluded.value;`);
}
statements.push('commit;');
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/supabase-data.sql', statements.join('\n'));
db.close();
