// Source-only characterization of installed outputs, not a raster verdict.
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {esperienza} from '../../static/js/banchi/voci/esperimento.js';
import {colore} from '../../static/js/banchi/voci/geometria.js';

export const affected = new Set(['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03']);
export const records = JSON.parse(readFileSync(new URL('../../content/esperienze-C4.json',import.meta.url)));
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function normalize(id, elements) {
  if (affected.has(id)) return elements.filter(e => e.kind !== 'label' || !['Sonda','+','−'].includes(e.text));
  return elements.map(element => {
    if (element.kind !== 'arrow') return element;
    if (id === 'SIM-C4-L02-01' && element.c === colore.ocra) {
      const { dettaglio, ...baseline } = element;
      assert.equal(dettaglio, true);
      return baseline;
    }
    if (id === 'SIM-C4-L02-02' && element.c === colore.viola) {
      const { a, b } = element;
      assert.deepEqual([a[1], b[1]], [1.46, 1.46]);
      return { ...element, a:[a[0], 0.96, a[2]], b:[b[0], 0.96, b[2]] };
    }
    return element;
  });
}

export async function contract({allowFrontalPlateView = false} = {}) {
  const result = [];
  for (const record of records) {
    const a = await esperienza(record), states = [];
    let characterizedSpec = a.scene.spec;
    if (allowFrontalPlateView && affected.has(record.id)) {
      assert.deepEqual(a.scene.spec.eye, [0,1.9,6.1], record.id + ' explicit native framing');
      characterizedSpec = {...a.scene.spec, eye:[2.6,1.9,6.1]};
    }
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
      physicalAndTeachingSha256:sha({record:a.record,params:a.model.params,spec:characterizedSpec,
        observe:a.observe,states}),
      // Only the three accessible descriptions are deliberately extended.
      ...(affected.has(record.id)?{}:{legends:['orbit','side','top','diagram'].map(view=>a.legend(2,view))})});
  }
  return result;
}
