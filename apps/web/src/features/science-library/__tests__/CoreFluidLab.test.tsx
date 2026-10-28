// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {CoreFluidLab} from '../CoreFluidLab';
import {getLab,newLabSnapshot} from '../FluidThermoActivity';
import type {Capability,SavedScience,ScienceApi,Snapshot} from '../types';
const definition=getLab('hydrostatic');
const capability:Capability={id:'hydrostatic-lab-v1',version:1,implementationSha256:'b'.repeat(64),title:definition.title,
 fluidLab:{modelId:'hydrostatic',pluginId:'io.ardesia.fluid-thermo',pluginVersion:'1.0.0',modelVersion:1},
 primaryOutput:{label:'Pressione',unit:'Pa'},domain:'Ideale',explanation:[],transfer:{},distribution:'BUNDLED_FIRST_PARTY',editorialStatus:'DRAFT',
 parameters:definition.parameters.map(p=>({key:p.key,label:p.label,unit:p.unit,default:p.default,minimum:p.min,maximum:p.max}))};
const lesson={lessonRef:{id:'ds-2026-u3-02',version:1,sha256:'a'.repeat(64)},phase:'practice' as const};
function answer(snapshot:Snapshot,revision='rev-1'):SavedScience{return{snapshot:structuredClone(snapshot),supported:true,updatedAt:'2026-10-28T10:00:00Z',resource:{id:'res-1',revisionId:revision,contextId:'ctx-1',ownerId:'learner',editionId:'edition',kind:'science-resource',visibility:'private',text:JSON.stringify(snapshot),sha256:'c'.repeat(64)}};}
const apiWith=(save:ScienceApi['save']):ScienceApi=>({save,catalog:vi.fn(),read:vi.fn(),evaluate:vi.fn()});
afterEach(cleanup);
describe('Core laboratory evidence boundary',()=>{
 it('saves exact model, lesson and support and links only the authoritative revision',async()=>{
  const save=vi.fn<ScienceApi['save']>().mockImplementation(async(_e,s)=>answer(s));const linked=vi.fn(),commit=vi.fn();
  render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} courseLesson={lesson} api={apiWith(save)} onSaved={linked} onCommit={commit}/>);
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La pressione cresce con la profondità'}});
  fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({activityId:capability.id,courseLesson:lesson}));
  fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Confronto due profondità a densità fissa.'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
  await waitFor(()=>expect(linked).toHaveBeenCalledWith({resourceId:'res-1',revisionId:'rev-1',contextId:'ctx-1'}));
  const body=save.mock.calls[0][1];expect(body.labSnapshot?.configuration.lessonRef).toEqual(lesson.lessonRef);
  expect(body.parameters).toEqual(body.labSnapshot?.configuration.parameters);expect(body.note).toBe('Confronto due profondità a densità fissa.');
  expect(screen.getByRole('link',{name:'Riapri questa revisione salvata'}).getAttribute('href')).toContain('scienceRevision=rev-1');
 });
 it('retries an ambiguous save with frozen data and key despite later edits',async()=>{
  const save=vi.fn<ScienceApi['save']>().mockRejectedValueOnce(Error('network')).mockImplementation(async(_e,s)=>answer(s));const linked=vi.fn();
  render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} courseLesson={lesson} api={apiWith(save)} onSaved={linked}/>);
  fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Prima versione'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
  await waitFor(()=>expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
  fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Seconda versione ancora aperta'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
  await waitFor(()=>expect(save).toHaveBeenCalledTimes(2));expect(save.mock.calls[1].slice(1,4)).toEqual(save.mock.calls[0].slice(1,4));
  expect(linked).not.toHaveBeenCalled();expect((screen.getByLabelText('Osservazioni') as HTMLTextAreaElement).value).toBe('Seconda versione ancora aperta');
  await waitFor(()=>expect(screen.queryByText('Salvataggio confermato dall’host.')).toBeNull());
 });
 it('does not execute or mutate a shared historical revision',()=>{
  const snapshot=newLabSnapshot('hydrostatic');snapshot.note='Testo originale';const saved=answer({schemaVersion:1,capabilityId:capability.id,capabilityVersion:1,implementationSha256:capability.implementationSha256,parameters:snapshot.configuration.parameters,prediction:'',note:snapshot.note,labSnapshot:snapshot});
  saved.resource.ownerId='other';const save=vi.fn();render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} saved={saved} api={apiWith(save)}/>);
  expect(screen.getByText('Testo originale')).toBeTruthy();expect(screen.queryByRole('button',{name:'Confronta con il modello'})).toBeNull();expect(save).not.toHaveBeenCalled();
 });
 it('keeps stale-tab conflict visible without overwriting the newer revision',async()=>{
  const snapshot=newLabSnapshot('hydrostatic');const saved=answer({schemaVersion:1,capabilityId:capability.id,capabilityVersion:1,implementationSha256:capability.implementationSha256,parameters:snapshot.configuration.parameters,prediction:'',note:'',labSnapshot:snapshot});
  const save=vi.fn<ScienceApi['save']>().mockRejectedValue(Error('revision_conflict'));render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} saved={saved} api={apiWith(save)}/>);
  fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Modifica in questa scheda'}});fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));
  await screen.findByText(/Un’altra scheda ha aggiornato/);expect(save.mock.calls[0][3]).toEqual({resourceId:'res-1',revisionId:'rev-1'});
  expect((screen.getByLabelText('Osservazioni') as HTMLTextAreaElement).value).toBe('Modifica in questa scheda');
 });
 it('invalid raw edits clear ready evidence and cannot acknowledge an earlier pending save',async()=>{
  let resolveSave!:(value:SavedScience)=>void;let frozen!:Snapshot;
  const save=vi.fn<ScienceApi['save']>().mockImplementation(async(_id,snapshot)=>{frozen=snapshot;return new Promise(resolve=>{resolveSave=resolve;});});
  const linked=vi.fn(),commit=vi.fn(),invalidated=vi.fn();
  render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} courseLesson={lesson} api={apiWith(save)} onSaved={linked} onCommit={commit} onInvalidated={invalidated}/>);
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'La pressione aumenta'}});fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));
  fireEvent.click(screen.getByRole('button',{name:'Salva la configurazione nel corso'}));await waitFor(()=>expect(resolveSave).toBeTypeOf('function'));
  commit.mockClear();invalidated.mockClear();fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:''}});
  expect(commit).toHaveBeenLastCalledWith(null);expect(invalidated).toHaveBeenCalled();expect(screen.getByLabelText('Profondità [m]')).toHaveProperty('value','');
  await act(async()=>resolveSave(answer(frozen)));expect(linked).not.toHaveBeenCalled();expect(screen.queryByText('Salvataggio confermato dall’host.')).toBeNull();
 });
 it('keeps an empty parameter guarded when the already selected 2D view emits an unchanged snapshot',()=>{
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
  render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} courseLesson={lesson}/>);
  fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:''}});
  fireEvent.click(screen.getByRole('button',{name:'Sezione e diagramma 2D'}));
  expect(screen.getByLabelText('Profondità [m]')).toHaveProperty('value','');
  const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);expect(event.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));expect(confirm).toHaveBeenCalled();expect(screen.getByLabelText('Profondità [m]')).toHaveProperty('value','');
  fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:String(definition.parameters.find(p=>p.key==='depth')!.default)}});
  const corrected=new Event('beforeunload',{cancelable:true});window.dispatchEvent(corrected);expect(corrected.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByLabelText('Profondità [m]'),{target:{value:''}});confirm.mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));
  const discarded=new Event('beforeunload',{cancelable:true});window.dispatchEvent(discarded);expect(discarded.defaultPrevented).toBe(false);expect(screen.getByLabelText('Profondità [m]')).toHaveProperty('value',String(definition.parameters.find(p=>p.key==='depth')!.default));
  confirm.mockRestore();
 });

});

 it('guards raw text before a scenario reset and retains unsaved notes after a receipt',()=>{
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false),commit=vi.fn();
  render(<CoreFluidLab me={{id:'learner',role:'student',synthetic:true}} editionId="edition" capability={capability} courseLesson={lesson} onCommit={commit}/>);
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'Cresce'}});fireEvent.change(screen.getByLabelText('Osservazioni'),{target:{value:'Osservazione da conservare'}});
  fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));expect(confirm).toHaveBeenCalled();expect(screen.getByLabelText('Osservazioni')).toHaveProperty('value','Osservazione da conservare');
  fireEvent.click(screen.getByRole('button',{name:'Confronta con il modello'}));commit.mock.calls.at(-1)![0].confirmDraft();
  const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);expect(event.defaultPrevented).toBe(true);
  confirm.mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Ripristina lo scenario'}));expect(screen.getByLabelText('Osservazioni')).toHaveProperty('value','');confirm.mockRestore();
 });
