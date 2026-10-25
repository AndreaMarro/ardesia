// Narrow parse/query measurement; NOT equal work to a REA artifact graph.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const target = process.argv[2];
if (!target || target === '--help') {
  console.log('Usage: BABEL_PARSER_MODULE=/path/to/@babel/parser node compare_direct_ast.cjs /path/to/emitted-site.js');
  process.exit(target === '--help' ? 0 : 2);
}
const { parse } = require(process.env.BABEL_PARSER_MODULE || '@babel/parser');
const source = fs.readFileSync(target, 'utf8');
const functions = [];
const start = performance.now();
const ast = parse(source, { sourceType: 'unambiguous' });
function visit(value) {
  if (!value || typeof value !== 'object') return;
  if (value.type === 'FunctionDeclaration' && ['choose', 'fromURL'].includes(value.id?.name)) {
    functions.push({ name: value.id.name, start: value.loc.start.line, end: value.loc.end.line });
  }
  for (const [key, child] of Object.entries(value)) {
    if (['loc', 'tokens', 'comments'].includes(key)) continue;
    if (Array.isArray(child)) child.forEach(visit);
    else if (child && typeof child === 'object') visit(child);
  }
}
visit(ast);
const elapsed_ms = Number((performance.now() - start).toFixed(3));
console.log(JSON.stringify({
  method: 'Direct Babel AST parse and query over one emitted JavaScript asset',
  elapsed_ms,
  timing_scope: 'parse plus traversal; excludes Node startup, dependency load, file read and SHA256',
  source_bytes: Buffer.byteLength(source),
  source_sha256: crypto.createHash('sha256').update(source).digest('hex'),
  functions,
  comparability: 'Not equivalent to REA full artifact discovery, hashing and graph evidence',
}, null, 2));
