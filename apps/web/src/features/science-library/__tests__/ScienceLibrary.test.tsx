// @vitest-environment jsdom
import {StrictMode} from 'react';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {ScienceLibrary} from '../ScienceLibrary';
import type {Catalog,Comparison,ScienceApi,SavedScience,ScienceResult,Snapshot} from '../types';
import fixtures from './fixtures.json';

vi.mock('../ScientificPlot',()=>({ScientificPlot:()=> <div data-testid="graph-presentation"/>}));
const me={id:'student-01',role:'student' as const,synthetic:true as const};
const catalog=fixtures.catalog as unknown as Catalog;
const results=fixtures.results as unknown as Record<string,ScienceResult>;
function saved(snapshot:Snapshot):SavedScience{return {supported:true,snapshot,resource:{id:'resource-1',revisionId:'revision-1',ownerId:me.id,editionId:'fluidi',contextId:'context-1',visibility:'private',kind:'science-resource',text:JSON.stringify(snapshot),sha256:'a'.repeat(64)}};}
function api():ScienceApi{return {
  catalog:vi.fn(async()=>structuredClone(catalog)),
  evaluate:vi.fn<ScienceApi['evaluate']>(async(_edition,snapshot)=>({result:results[snapshot.capabilityId],prediction:snapshot.prediction,assessment:'MODEL_COMPARISON_NOT_A_GRADE'})),
  read:vi.fn(),save:vi.fn(async(_edition,snapshot)=>saved(structuredClone(snapshot))),
};}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

describe('science library consumer state',()=>{
 it('focuses the mobile result and returns to the first physical parameter on request',async()=>{
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  render(<ScienceLibrary me={me} editionId="fluidi" api={api()}/>);
  await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'1'}});
  fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
  const result=await screen.findByTestId('science-result');
  await waitFor(()=>expect(document.activeElement).toBe(result));
  fireEvent.click(screen.getByRole('button',{name:'Modifica i dati'}));
  expect(document.activeElement).toBe(screen.getByLabelText('Massa del corpo1 [kg]'));
 });

 it('survives development StrictMode remount without losing canonical comparisons',async()=>{
  const transport=api();render(<StrictMode><ScienceLibrary me={me} editionId="fluidi" api={transport}/></StrictMode>);
  await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'1'}});
  fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
  await screen.findByTestId('science-result');
 });

 it('requires prediction, uses canonical response and clears it when parameters change',async()=>{
  const transport=api();render(<ScienceLibrary me={me} editionId="fluidi" api={transport}/>);
  await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  expect(screen.queryByTestId('science-result')).toBeNull();
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'1'}});
  fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
  await waitFor(()=>expect(screen.getByTestId('science-result').textContent).toContain('1 m/s'));
  expect(screen.getByTestId('science-result').textContent).toContain('non è un voto');
  fireEvent.change(screen.getByLabelText('Massa del corpo1 [kg]'),{target:{value:'3'}});
  expect(screen.queryByTestId('science-result')).toBeNull();
  expect((screen.getByLabelText('La tua previsione') as HTMLInputElement).value).toBe('');
 });

 it('discards a delayed canonical result after a parameter edit',async()=>{
  let resolve!:(v:Comparison)=>void;const transport=api();transport.evaluate=vi.fn<ScienceApi['evaluate']>(()=>new Promise<Comparison>(r=>{resolve=r;}));
  render(<ScienceLibrary me={me} editionId="fluidi" api={transport}/>);await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'1'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
  fireEvent.change(screen.getByLabelText('Massa del corpo1 [kg]'),{target:{value:'3'}});
  await act(async()=>{resolve({result:results['collision-1d-v1'],prediction:'1',assessment:'MODEL_COMPARISON_NOT_A_GRADE'});});
  expect(screen.queryByTestId('science-result')).toBeNull();
 });

 it('saves private canonical configuration and freezes a failed request for retry',async()=>{
  const transport=api();const save=vi.fn<ScienceApi['save']>().mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(async(_edition,snapshot)=>saved(snapshot));transport.save=save;
  render(<ScienceLibrary me={me} editionId="fluidi" api={transport}/>);await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  fireEvent.change(screen.getByLabelText('Il tuo ragionamento'),{target:{value:'Nota prima del tentativo'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva nel quaderno'}));
  await screen.findByRole('alert');
  fireEvent.change(screen.getByLabelText('Il tuo ragionamento'),{target:{value:'Nuova nota ancora aperta'}});
  fireEvent.click(screen.getByRole('button',{name:'Riprova il salvataggio in attesa'}));
  await waitFor(()=>expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1].slice(0,4)).toEqual(save.mock.calls[0].slice(0,4));
  expect((screen.getByLabelText('Il tuo ragionamento') as HTMLTextAreaElement).value).toBe('Nuova nota ancora aperta');
  await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('modifiche aperte'));
 });

 it('reopens an exact version with notes and no answer; unsupported models remain readable',async()=>{
  const transport=api();const snapshot:Snapshot={schemaVersion:1,capabilityId:'collision-1d-v1',capabilityVersion:999,implementationSha256:'a'.repeat(64),parameters:{mass1:2},note:'Nota leggibile senza modello',prediction:'1'};
  transport.read=vi.fn(async()=>({...saved(snapshot),supported:false}));
  render(<ScienceLibrary me={me} editionId="fluidi" resourceRef={{resourceId:'resource-1',revisionId:'revision-1'}} api={transport}/>);
  await screen.findByText('Questa versione dello strumento non è disponibile.');
  expect(screen.getByDisplayValue('Nota leggibile senza modello')).toBeTruthy();expect(screen.queryByTestId('science-result')).toBeNull();
  expect(transport.evaluate).not.toHaveBeenCalled();
  expect(transport.read).toHaveBeenCalledWith({resourceId:'resource-1',revisionId:'revision-1'},expect.any(AbortSignal));
 });

 it('keeps four course views on the same definitions and resets before the different problem',async()=>{
  const transport=api();render(<ScienceLibrary me={me} editionId="fluidi" api={transport}/>);await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  fireEvent.change(screen.getByLabelText('Percorso di studio'),{target:{value:'fluidi-termodinamica'}});
  await screen.findByRole('heading',{name:'Continuità e Bernoulli'});
  fireEvent.change(screen.getByLabelText('La tua previsione'),{target:{value:'114000'}});fireEvent.click(screen.getByRole('button',{name:'Confronta la previsione'}));
  await screen.findByTestId('science-result');fireEvent.click(screen.getByRole('button',{name:'Un problema diverso'}));
  expect(screen.queryByTestId('science-result')).toBeNull();expect((screen.getByLabelText('Quota della seconda sezione [m]') as HTMLInputElement).value).toBe('2');
  expect((screen.getByLabelText('La tua previsione') as HTMLInputElement).value).toBe('');
 });
});
