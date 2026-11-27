// Pure installed-consumer observations. No DOM/browser or acceptance claim.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {esperienza} from '../../static/js/banchi/voci/esperimento.js';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const transferred = new Map([
  ['SIM-C6-L02-01', ['Entrata', 'Uscita']],
  ['SIM-C6-L05-01', ['Carrello']],
]);
export async function collect() {
  const rows = [], stats = {models: 0, grid: 0, clock: 0};
  for (const course of ['C1','C2','C3','C4','C5','C6']) {
    const sources = JSON.parse(readFileSync(new URL(`../../content/esperienze-${course}.json`, import.meta.url)));
    for (const source of sources) {
      const bench = await esperienza(source), frames = [];
      const {min, max, step} = source.control;
      const count = Math.round((max-min)/step)+1;
      const remove = transferred.get(source.id) ?? [];
      function frame(x, time) {
        const actualX = bench.clock?.input && time !== undefined ? time : x;
        const solution = bench.model.solve({x: actualX});
        const elements = bench.elements(x, 2, time);
        return {x, time, solution, readings: bench.model.readings({x: actualX}, solution, time ?? 0),
          graphs: bench.model.graphs({x: actualX}, solution), steps: bench.model.steps({x: actualX}, solution),
          elementsSha256: hash(elements.filter(e => e.kind !== 'label' || !remove.includes(e.text))),
          labels: elements.filter(e => e.kind === 'label').map(e => e.text)};
      }
      for (let i=0; i<count; i++) {
        const x=min+i*step;
        frames.push(frame(x)); stats.grid++;
        if (bench.clock) {
          const duration = bench.clock.duration(x, bench.model.solve({x}).y);
          for (const part of [0,.25,.5,.75,1]) { frames.push(frame(x, duration*part)); stats.clock++; }
        }
      }
      rows.push({id: source.id, sourceSha256: hash(source), modelTeachingSha256: hash({record: bench.record,
        params: bench.model.params, spec: bench.scene.spec, observe: bench.observe}),
        legends: Object.fromEntries(['orbit','side','top','diagram'].map(view => [view,bench.legend(2,view)])), frames});
      stats.models++;
    }
  }
  return {schemaVersion: '1.0.0', scope: 'PURE_CODE_NOT_UI', stats, rows, activityCredit: 0,
    humanApproval: 'NOT_RUN', publicationAction: 'NONE'};
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  console.log(JSON.stringify(await collect()));
}
