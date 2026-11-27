import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const app = pathToFileURL(resolve(process.argv[2]) + sep);
const read = async file => JSON.parse(await readFile(new URL(file, app), 'utf8'));
const { esperienza } = await import(new URL('static/js/banchi/voci/esperimento.js', app));
const source = await read('content/esperienze-C5.json');
const records = [];
for (const batch of process.argv.slice(3)) {
  const candidate = await read('editorial/batches/' + batch + '.json');
  for (const record of candidate.records) {
    const row = source.find(entry => entry.id === record.id);
    const live = await esperienza(row);
    const draft = await esperienza(record);
    records.push({id:row.id, sourceVersion:row.version, candidateVersion:record.version,
      sourceTasks:live.record.assessment, draftTasks:draft.record.assessment,
      draftPoints:record.assessmentSelection.points, unit:row.measure.unit});
  }
}
process.stdout.write(JSON.stringify({scope:'ACTUAL_INSTALLED_ASSESSMENT_ORIGINAL_AND_DRAFT', records}) + '\n');
