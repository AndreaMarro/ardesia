// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {AssessmentQuality} from './AssessmentQuality';
const report={auditVersion:'s04-quality-1',bankSha256:'a'.repeat(64),publishedRecords:0,
 editorialBaseline:{total:200,meaning:'internal_editorial_subobjectives',delta:0},
 summary:{records:4000,distinctRecords:3999,templateFamilies:250,quarantined:2,verifiedNumeric:400,unverifiedNumeric:1000,failedNumeric:1,notApplicableNumeric:2599},
 courses:[{id:'mechanics',title:'Strumenti e meccanica',records:1088,quarantined:2,requiredObjectives:52}],
 limitations:['Nessuna approvazione umana implicita.'],total:2,nextCursor:null,
 dossiers:[{id:'mru',title:'Moto con trasferimento',questionId:'q-1',seedRange:[0,31],distinctParameterSets:20,previewVersion:1,previewSha256:'c'.repeat(64),preview:{prompt:'Un carrello a 2 m/s per 2 s?',answer:'4',unit:'m',domain:'Velocità costante.',steps:['Due metri ogni secondo.','Due intervalli.','Quattro metri.'],distractors:[{answer:'2',feedback:'Hai considerato un secondo.'}],transfer:{prompt:'Ora torna indietro di 2 m.',answer:'2 m',feedback:'Somma con il segno.'}},limits:'Proposta DRAFT, non attività consegnabile.'}],
 items:[{id:'q-1',title:'Moto uniforme',unitId:'U2',familyId:'mru',contentSha256:'b'.repeat(64),numericStatus:'FAILED',quarantined:true,issues:['answer_mismatch']}]};
afterEach(()=>{cleanup();vi.unstubAllGlobals()});

test('private opt-in audit exposes denominators and opens existing reviewer without publishing',async()=>{
 const select=vi.fn(),calls:string[]=[];
 vi.stubGlobal('fetch',vi.fn(async(path:string)=>{calls.push(path);return new Response(JSON.stringify(report))}));
 render(<AssessmentQuality base='/editions/fluidi/question-banks/physics-semestre-2026' onSelect={select} disabled={false}/>);
 expect(calls).toHaveLength(0);
 fireEvent.click(screen.getByText('Qualità della banca e casi da verificare'));
 await screen.findByText('4000');
 expect(screen.getByText(/200 sotto-obiettivi editoriali interni/)).toBeTruthy();
 fireEvent.click(screen.getByText('Moto con trasferimento · bozza di autore'));
 expect(screen.getByText('Ora torna indietro di 2 m.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:/Rivedi Moto uniforme/}));
 expect(select).toHaveBeenCalledWith('q-1');
 expect(calls.every(path=>path.includes('/review/quality?'))).toBe(true);
});

test('revoked access clears report and offers retry without cached solutions',async()=>{
 let denied=false;
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(denied?{error:'forbidden'}:report),{status:denied?403:200})));
 render(<AssessmentQuality base='/editions/fluidi/question-banks/physics-semestre-2026' onSelect={()=>{}} disabled={false}/>);
 fireEvent.click(screen.getByText('Qualità della banca e casi da verificare'));
 await screen.findByRole('button',{name:/Rivedi Moto uniforme/});denied=true;
 fireEvent.click(screen.getByRole('button',{name:'Aggiorna audit'}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:/Rivedi Moto uniforme/})).toBeNull());
 expect(await screen.findByRole('alert')).toBeTruthy();
});
