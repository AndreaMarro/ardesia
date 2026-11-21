const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '..'),
  context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'static/vendor/katex.min.js'), 'utf8'), context);
let total = 0,
  errors = 0;
for (const file of fs.readdirSync(path.join(root, 'content')).filter((f) => f.endsWith('.json'))) {
  for (const r of JSON.parse(fs.readFileSync(path.join(root, 'content', file), 'utf8'))) {
    for (const b of [...(r.blocks || []), ...(r.promptBlocks || [])]) {
      if (b.type !== 'formula') continue;
      total++;
      try {
        context.katex.renderToString(b.text, { throwOnError: true, strict: false, trust: false });
      } catch (e) {
        errors++;
        console.error(r.id, b.text, e.message);
      }
    }
  }
}
console.log(total + ' formule verificate' + ' · ' + errors + ' errori');
process.exitCode = errors ? 1 : 0;
