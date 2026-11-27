// Source-only characterization of installed outputs, not a raster verdict.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {esperienza} from '../../static/js/banchi/voci/esperimento.js';

export const affected = new Set(['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03']);
export const records = JSON.parse(readFileSync(new URL('../../content/esperienze-C4.json',import.meta.url)));
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalize = (id, elements) => affected.has(id)
  ? elements.filter(e => e.kind !== 'label' || !['Sonda','+','−'].includes(e.text))
  : elements;

export async function contract() {
  const result = [];
  for (const record of records) {
    const a = await esperienza(record), states = [];
    const {min,max,step} = record.control;
    for (let i=0;i<=Math.round((max-min)/step);i++) {
      const x=min+i*step, solved=a.model.solve({x});
      const entry={x,solved,readings:a.model.readings({x},solved),
        measurement:a.measurement(x),graphs:a.model.graphs({x},solved),
        steps:a.model.steps({x},solved),
        elements:[0,2].map(stage=>normalize(record.id,a.elements(x,stage)))};
      if (a.clock) {
        const duration=a.clock.duration(x,solved.y);
        entry.clock=[0,.25,.5,.75,1].map(fraction=>{
          const time=duration*fraction, input=a.clock.input?time:x, s=a.model.solve({x:input});
          return {time,input,solved:s,readings:a.model.readings({x:input},s,time),
            signal:a.clock.signal?.(input,time,s.y),
            elements:[0,2].map(stage=>normalize(record.id,a.elements(x,stage,time)))};
        });
      }
      states.push(entry);
    }
    result.push({id:record.id,controls:states.length,
      physicalAndTeachingSha256:sha({record:a.record,params:a.model.params,spec:a.scene.spec,
        observe:a.observe,states}),
      // Only the three accessible descriptions are deliberately extended.
      ...(affected.has(record.id)?{}:{legends:['orbit','side','top','diagram'].map(view=>a.legend(2,view))})});
  }
  return result;
}
