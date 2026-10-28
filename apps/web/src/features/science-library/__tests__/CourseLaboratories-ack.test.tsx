// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {CourseLaboratories} from '../CourseLaboratories';
import {CoreFluidLab} from '../CoreFluidLab';
import {getLab} from '../FluidThermoActivity';
import type {Capability,SavedScience,Snapshot} from '../types';
import type {CourseLesson} from '../../../courseLearning';

const transport=vi.hoisted(()=>({catalog:vi.fn(),read:vi.fn(),evaluate:vi.fn(),save:vi.fn()}));
vi.mock('../scienceApi',()=>({scienceApi:transport}));

const definition=getLab('hydrostatic');
const capability:Capability={id:'hydrostatic-lab-v1',version:1,implementationSha256:'b'.repeat(64),title:definition.title,
 fluidLab:{modelId:'hydrostatic',pluginId:'io.ardesia.fluid-thermo',pluginVersion:'1.0.0',modelVersion:1},
 primaryOutput:{label:'Pressione',unit:'Pa'},domain:'Ideale',explanation:[],transfer:{},distribution:'BUNDLED_FIRST_PARTY',editorialStatus:'DRAFT',
 parameters:definition.parameters.map(p=>({key:p.key,label:p.label,unit:p.unit,default:p.default,minimum:p.min,maximum:p.max}))};
const lessonRef={id:'ds-2026-u3-02',version:1,sha256:'a'.repeat(64)};
const courseLesson={lessonRef,phase:'practice' as const};
const lesson={id:'ds-2026-u3-02',lessonRef} as CourseLesson;
const me={id:'learner',role:'student' as const,synthetic:true as const};
function answer(snapshot:Snapshot):SavedScience{return {snapshot:structuredClone(snapshot),supported:true,updatedAt:'2026-10-28T10:00:00Z',
 resource:{id:'res-1',revisionId:'rev-1',contextId:'ctx-1',ownerId:me.id,editionId:'edition',kind:'science-resource',visibility:'private',text:JSON.stringify(snapshot),sha256:'c'.repeat(64)}};}
let acknowledged:SavedScience|undefined;
beforeEach(()=>{
 vi.resetAllMocks();acknowledged=undefined;
 transport.catalog.mockResolvedValue({schemaVersion:1,capabilities:[capability],courses:[],referenceScope:'capability-definition'});
 transport.save.mockImplementation(async(_edition:string,snapshot:Snapshot)=>{acknowledged=answer(snapshot);return acknowledged;});
});
afterEach(cleanup);
const note=()=>screen.getByLabelText('Osservazioni') as HTMLTextAreaElement;
async function saveAThenEditB(onSaved:ReturnType<typeof vi.fn>){
 await screen.findByLabelText('Osservazioni');
 fireEvent.change(note(),{target:{value:'Nota A salvata'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
 await waitFor(()=>expect(onSaved).toHaveBeenCalledWith({resourceId:'res-1',revisionId:'rev-1',contextId:'ctx-1'}));
 await waitFor(()=>expect((screen.getByRole('button',{name:'Salva la configurazione nel corso'}) as HTMLButtonElement).disabled).toBe(false));
 expect(acknowledged?.snapshot.note).toBe('Nota A salvata');
 fireEvent.change(note(),{target:{value:'Nota B dopo ACK, ancora aperta'}});
 expect(note().value).toBe('Nota B dopo ACK, ancora aperta');
}
describe('laboratory identity across background saved revisions',()=>{
 it('control: CoreFluidLab without a parent key change preserves B after saved prop refresh',async()=>{
  const onSaved=vi.fn();
  const view=render(<CoreFluidLab me={me} editionId="edition" capability={capability} courseLesson={courseLesson} onSaved={onSaved}/>);
  await saveAThenEditB(onSaved);
  view.rerender(<CoreFluidLab me={me} editionId="edition" capability={capability} courseLesson={courseLesson} saved={acknowledged} onSaved={onSaved}/>);
  expect(note().value).toBe('Nota B dopo ACK, ancora aperta');
 });
 it('CourseLaboratories must preserve B when host.saved publishes the acknowledged A revision',async()=>{
  const onSaved=vi.fn(),onInvalidated=vi.fn();
  const host={me,editionId:'edition',saved:[] as SavedScience[],onSaved,onInvalidated};
  const view=render(<CourseLaboratories host={host} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await saveAThenEditB(onSaved);
  view.rerender(<CourseLaboratories host={{...host,saved:[acknowledged!]}} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  expect(note().value).toBe('Nota B dopo ACK, ancora aperta');
 });
 it('keeps the opened CAS revision when another tab publishes a newer saved snapshot',async()=>{
  const onSaved=vi.fn(),host={me,editionId:'edition',saved:[] as SavedScience[],onSaved,onInvalidated:vi.fn()};
  const view=render(<CourseLaboratories host={host} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await saveAThenEditB(onSaved);
  const other=structuredClone(acknowledged!);other.resource.revisionId='rev-2';other.snapshot.note='Nota C dell’altra scheda';other.snapshot.labSnapshot!.note=other.snapshot.note;
  view.rerender(<CourseLaboratories host={{...host,saved:[other]}} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  expect(note().value).toBe('Nota B dopo ACK, ancora aperta');
  transport.save.mockRejectedValueOnce(Error('revision_conflict'));
  fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
  await screen.findByText(/Un’altra scheda ha aggiornato questa risorsa/);
  expect(transport.save.mock.calls[1][3]).toEqual({resourceId:'res-1',revisionId:'rev-1'});
  expect(transport.save.mock.calls[1][1].note).toBe('Nota B dopo ACK, ancora aperta');
  expect(note().value).toBe('Nota B dopo ACK, ancora aperta');
 });
 it.each(['actor','edition'] as const)('starts the supplied exact snapshot at the next %s boundary',async boundary=>{
  const onSaved=vi.fn(),host={me,editionId:'edition',saved:[] as SavedScience[],onSaved,onInvalidated:vi.fn()};
  const view=render(<CourseLaboratories host={host} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await saveAThenEditB(onSaved);
  const nextMe=boundary==='actor'?{...me,id:'other-learner'}:me,nextEdition=boundary==='edition'?'other-edition':'edition';
  const next=structuredClone(acknowledged!);next.resource.ownerId=nextMe.id;next.resource.editionId=nextEdition;next.snapshot.note='Nota della nuova identità';next.snapshot.labSnapshot!.note=next.snapshot.note;
  view.rerender(<CourseLaboratories host={{...host,me:nextMe,editionId:nextEdition,saved:[next]}} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await waitFor(()=>expect(note().value).toBe('Nota della nuova identità'));
 });
 it('opens an explicitly selected unsupported historical revision in conserved read-only form',async()=>{
  const onSaved=vi.fn(),host={me,editionId:'edition',saved:[] as SavedScience[],onSaved,onInvalidated:vi.fn()};
  const view=render(<CourseLaboratories key="open-current" host={host} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await saveAThenEditB(onSaved);
  const historical=structuredClone(acknowledged!);historical.resource.revisionId='historical-revision';historical.supported=false;historical.snapshot.capabilityVersion=2;historical.snapshot.note='Nota storica originale';historical.snapshot.labSnapshot!.note=historical.snapshot.note;
  // The existing resource-navigation consumer deliberately remounts on an exact requested revision.
  view.rerender(<CourseLaboratories key="explicit-historical-revision" host={{...host,saved:[historical]}} lesson={lesson} phase="practice" initialActivityId="hydrostatic-lab-v1"/>);
  await screen.findByRole('heading',{name:'Revisione conservata'});expect(screen.getByText('Nota storica originale')).toBeTruthy();
  expect(screen.queryByLabelText('Osservazioni')).toBeNull();expect(screen.queryByRole('button',{name:'Confronta con il modello'})).toBeNull();
 });

});
