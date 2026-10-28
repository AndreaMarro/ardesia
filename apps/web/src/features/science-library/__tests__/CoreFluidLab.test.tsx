// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
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
});
