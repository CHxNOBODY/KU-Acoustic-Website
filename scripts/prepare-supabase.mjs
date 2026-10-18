import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';

// Build the portable API handler from the existing, integration-tested Node API.
// Every transform below asserts that it matched: a silent no-op here would ship
// a subtly broken handler to production while the SQLite tests still passed.
const source = readFileSync('server/index.mjs', 'utf8');
let handler = source;
let transforms = 0;

function cut(open, close) {
  const start = handler.indexOf(open);
  const end = handler.indexOf(close);
  if (start < 0) throw new Error(`prepare-supabase: slice start not found: ${open}`);
  if (end < 0) throw new Error(`prepare-supabase: slice end not found: ${close}`);
  if (end <= start) throw new Error('prepare-supabase: slice boundaries are out of order.');
  transforms++;
  return handler.slice(start, end);
}

function apply(from, to, { all = false } = {}) {
  const hits = from instanceof RegExp
    ? (handler.match(new RegExp(from.source, from.flags.includes('g') ? from.flags : from.flags + 'g')) || []).length
    : handler.split(from).length - 1;
  if (hits === 0)
    throw new Error(`prepare-supabase: anchor not found: ${String(from).slice(0, 80)}`);
  if (!all && hits > 1)
    throw new Error(`prepare-supabase: anchor matched ${hits} times: ${String(from).slice(0, 80)}`);
  handler = all && typeof from === 'string' ? handler.replaceAll(from, to) : handler.replace(from, to);
  transforms += hits;
}

handler = cut('  const send =', '  server.on("close"');

apply(/const server = createServer\([\s\S]*?const url = new URL/, 'return async (req, res) => {\n    const url = new URL');
apply(/\}\);\s*$/, '};\n');

// Configuration arrives as factory options instead of process.env, which the
// Deno runtime does not populate the way a Node host does.
apply('process.env.ALLOWED_ORIGINS', 'configuredOrigins');
apply('process.env.NODE_ENV === "production"', 'production', { all: true });
// Edge requests always arrive through the gateway, so the forwarded address is
// the only meaningful rate-limit key there.
apply('process.env.TRUST_PROXY === "1"', 'trustProxy');

// Only the admin token digest is stored in production; the secret never is.
apply('if (!adminToken)', 'if (!adminTokenDigest)');
apply('hash(adminToken)', 'Buffer.from(adminTokenDigest, "hex")');

// The async driver needs awaits even inside array mapping callbacks, which the
// generic pass below cannot introduce on its own.
apply('events: list("events").map((event) => ({', 'events: await Promise.all((await list("events")).map(async (event) => ({');
apply('})),\n          news: list("news"),', '}))),\n          news: await list("news"),');
// Helpers that reach the database become async along with it.
apply('const overlapping = (date, hour, duration, exceptId) =>', 'const overlapping = async (date, hour, duration, exceptId) =>');

// Parse rather than regex-match call arguments, which can contain nested
// parentheses. Anything that touches the database — a prepared statement or one
// of the async helpers — is wrapped in an await unless it already has one.
const asyncHelpers = new Set(['list', 'overlapping']);
const ast = ts.createSourceFile('handler.js', handler, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const edits = [];
function visit(node) {
  if (ts.isCallExpression(node) && !ts.isAwaitExpression(node.parent)) {
    const callee = node.expression;
    const statement =
      ts.isPropertyAccessExpression(callee) &&
      ['get', 'all', 'run'].includes(callee.name.text) &&
      ts.isCallExpression(callee.expression) &&
      ts.isPropertyAccessExpression(callee.expression.expression) &&
      callee.expression.expression.name.text === 'prepare' &&
      callee.expression.expression.expression.getText(ast) === 'db';
    const helper = ts.isIdentifier(callee) && asyncHelpers.has(callee.text);
    if (statement || helper) edits.push([node.getStart(ast), node.end]);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
if (!edits.length) throw new Error('prepare-supabase: found no database calls to await.');
for (const [start, end] of edits.sort((a, b) => b[0] - a[0]))
  handler = handler.slice(0, start) + '(await ' + handler.slice(start, end) + ')' + handler.slice(end);

const imports = `import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { resolve, extname, sep } from "node:path";
import { readFileSync, existsSync } from "node:fs";
export function createClubHandler({ db, adminTokenDigest, allowedOrigins: configuredOrigins, production = true, trustProxy = true }) {
  const list = async (kind) => (await db.prepare("SELECT data FROM content WHERE kind=?").all(kind)).map(row => JSON.parse(row.data));
`;
const output = imports + handler + '\n}\n';
// A parse error here means a transform above produced invalid JavaScript.
const check = ts.createSourceFile('handler.mjs', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
if (check.parseDiagnostics?.length)
  throw new Error(`prepare-supabase: generated handler does not parse: ${ts.flattenDiagnosticMessageText(check.parseDiagnostics[0].messageText, ' ')}`);
writeFileSync('supabase/functions/club-api/handler.mjs', output);
console.log(`Prepared portable handler (${transforms} transforms, ${edits.length} awaited database operations).`);
