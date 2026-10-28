/** Build-time only. Node >=26 strips the metadata's type-only imports. */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {labDefinitions} from './definitions.ts';

const target=fileURLToPath(new URL('../../../../packages/engine/lessonos/study/science_library/fluid_catalog.json',import.meta.url));
const text=JSON.stringify({schema:'ardesia.fluid-thermo.catalog/1',pluginId:'io.ardesia.fluid-thermo',pluginVersion:'1.0.0',definitions:labDefinitions},null,2)+'\n';
if(process.argv.includes('--check')){
 if(await readFile(target,'utf8')!==text)throw Error('Fluid/thermo catalog is stale. Run export-catalog.mjs.');
}else await writeFile(target,text,'utf8');
