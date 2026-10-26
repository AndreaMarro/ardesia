// Reproduce with npm ci --ignore-scripts in an isolated directory containing package{-lock,}.json.
// Run: node build-vendor.mjs /absolute/isolated/directory /absolute/rolldown/dist/index.mjs
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const sandbox=path.resolve(process.argv[2]);
const {rolldown}=await import(pathToFileURL(process.argv[3]).href);
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const target=path.join(repo,'apps/web/src/features/learning-insights/vendor');await mkdir(target,{recursive:true});
const lock=JSON.parse(await readFile(path.join(sandbox,'package-lock.json'),'utf8'));
if(lock.packages['node_modules/@observablehq/plot'].version!=='0.6.17')throw Error('Unexpected Plot version');
const entry=path.join(sandbox,'entry.mjs');await writeFile(entry,"export {plot,barX,ruleX} from '@observablehq/plot';\n");
const build=await rolldown({input:entry,treeshake:true});
await build.write({file:path.join(target,'plot-engine.mjs'),format:'esm',minify:true,sourcemap:false,banner:'// Observable Plot 0.6.17 and dependencies; see THIRD_PARTY_NOTICES.txt and PROVENANCE.json.'});
await build.close();
const components=[];let notices='Vendored Observable Plot 0.6.17 dependency closure. See PROVENANCE.json.\n';
for(const [relative,pin] of Object.entries(lock.packages).filter(([k])=>k.startsWith('node_modules/')).sort(([a],[b])=>a.localeCompare(b))){
 const root=path.join(sandbox,relative);const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
 const names=(await readdir(root)).filter(n=>/^(licen[cs]e|copying|notice)(\.|$)/i.test(n)).sort();
 if(!names.length)throw Error('No license text: '+pkg.name);
 const licenses=[];for(const name of names){const body=await readFile(path.join(root,name),'utf8');notices+=`\n===== ${pkg.name}@${pkg.version} / ${name} =====\n${body}\n`;licenses.push(name);}
 components.push({name:pkg.name,version:pkg.version,license:pkg.license,resolved:pin.resolved,integrity:pin.integrity,licenseFiles:licenses});
}
await writeFile(path.join(target,'THIRD_PARTY_NOTICES.txt'),notices);
const digest=async name=>createHash('sha256').update(await readFile(path.join(target,name))).digest('hex');
await writeFile(path.join(target,'PROVENANCE.json'),JSON.stringify({schemaVersion:1,adopted:'@observablehq/plot@0.6.17',upstream:'https://github.com/observablehq/plot',upstreamGitHead:'42da60b3e817bb950be73d798f79b848d6b54de4',strategy:'REUSE: locally bundled ESM subset (plot, barX, ruleX); upstream source unmodified',tool:'rolldown@1.0.0',components,artifacts:{'plot-engine.mjs':await digest('plot-engine.mjs'),'THIRD_PARTY_NOTICES.txt':await digest('THIRD_PARTY_NOTICES.txt')},maintenance:'Pin updates require new official tarball/integrity, license inspection, reproducible build, consumer tests and browser checks. Rollback removes this namespace only.'},null,2)+'\n');
console.log(JSON.stringify({components:components.length,bundleSha256:await digest('plot-engine.mjs')}));
