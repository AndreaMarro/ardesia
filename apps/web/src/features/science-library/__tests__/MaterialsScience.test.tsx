// @vitest-environment jsdom
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, test, vi} from 'vitest';
import {Materials} from '../../Materials';
import {SourceViewer} from '../../../components/SourceViewer';
import type {StudyResource, Workspace} from '../../../api';
import fixtures from './fixtures.json';

const me={id:'science-student',role:'student' as const,synthetic:true as const};
const resource:StudyResource={id:'science-r',revisionId:'science-v1',editionId:'fluidi',ownerId:me.id,
  contextId:'science-context',kind:'science-resource',visibility:'private',sha256:'a'.repeat(64),
  text:JSON.stringify({schemaVersion:1,capabilityId:'collision-1d-v1',capabilityVersion:1,
    implementationSha256:fixtures.catalog.capabilities[0].implementationSha256,
    parameters:{mass1:2,mass2:1,velocity1:3,velocity2:0,restitution:1},note:'Nota scientifica conservata',prediction:'1'})};
const data:Workspace={enrolled:true,edition:{id:'fluidi',teacherId:'tutor',capacity:10,priceMinor:0,state:'collecting',sessions:[],timezone:'Europe/Rome'},
  resources:[],submissions:[],layouts:[],layoutSaved:true,layoutVersion:'b'.repeat(64)};
function transport(){
  const fetcher=vi.fn(async(input:string|URL|Request)=>{
    const path=String(input);
    if(path.endsWith('/science-library/catalog'))return Response.json(fixtures.catalog);
    if(path.includes('/science-library/resources/science-r?revisionId=science-v1'))
      return Response.json({resource,snapshot:JSON.parse(resource.text),supported:true});
    if(path==='/study/resources/science-r/revisions/science-v1')return Response.json(resource);
    throw new Error('Unexpected request '+path);
  });
  vi.stubGlobal('fetch',fetcher);return fetcher;
}
afterEach(()=>{cleanup();history.replaceState(null,'','/');vi.unstubAllGlobals();});

test('Materials exposes an explicit lazy entry for the four course views',async()=>{
  const fetcher=transport();render(<Materials me={me} data={data} onUpdate={async()=>{}}/>);
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Apri la libreria scientifica'}));
  await screen.findByRole('heading',{name:'Urto e bilancio di energia'});
  expect(screen.getByLabelText('Percorso di studio').querySelectorAll('option')).toHaveLength(4);
  expect(screen.queryByTestId('science-result')).toBeNull();
});

test('Materials reopens only the pinned revision and invalid popstate never falls back to a new experiment',async()=>{
  history.replaceState(null,'','/?view=materials&edition=fluidi&scienceResource=science-r&scienceRevision=science-v1');
  const fetcher=transport();render(<Materials me={me} data={data} onUpdate={async()=>{}}/>);
  await screen.findByDisplayValue('Nota scientifica conservata');
  expect(fetcher.mock.calls.some(([path])=>String(path).includes('revisionId=science-v1'))).toBe(true);
  history.replaceState(null,'','/?view=materials&edition=fluidi&scienceResource=science-r');
  act(()=>window.dispatchEvent(new PopStateEvent('popstate')));
  expect(screen.getByRole('alert').textContent).toContain('Riferimento scientifico non valido');
  expect(screen.queryByDisplayValue('Nota scientifica conservata')).toBeNull();
  expect(screen.queryByRole('button',{name:'Confronta la previsione'})).toBeNull();
});

test('scientific sources have a typed exact-revision reader and cannot be edited as plain JSON',async()=>{
  transport();render(<Materials me={me} data={{...data,resources:[resource]}} onUpdate={async()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:/Esperimento scientifico/}));
  await screen.findByRole('heading',{name:'Configurazione scientifica salvata'});
  expect(screen.getByText('Nota scientifica conservata')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Apri questa configurazione'}).getAttribute('href'))
    .toBe('/?view=materials&edition=fluidi&scienceResource=science-r&scienceRevision=science-v1');
  expect(screen.queryByText('Modifica e salva una nuova versione')).toBeNull();
  expect(screen.queryByText(resource.text)).toBeNull();
});

test('an invalid science snapshot never reveals raw JSON, including when selection is requested',async()=>{
  const malformed={...resource,text:'{"privateRaw":"must-not-render"}'};
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json(malformed)));
  render(<SourceViewer reference={{resourceId:resource.id,revisionId:resource.revisionId,contextId:resource.contextId}} onSelect={vi.fn()}/>);
  await screen.findByRole('alert');
  expect(screen.queryByText(malformed.text)).toBeNull();
  expect(screen.queryByRole('textbox',{name:'Originale della fonte'})).toBeNull();
});

test('two scientific notes remain distinguishable without exposing their JSON',()=>{
  const second={...resource,id:'science-second',revisionId:'science-v2',text:JSON.stringify({...JSON.parse(resource.text),note:'Una lente divergente'})};
  transport();render(<Materials me={me} data={{...data,resources:[resource,second]}} onUpdate={async()=>{}}/>);
  expect(screen.getByRole('button',{name:/Esperimento scientifico · Nota scientifica conservata/})).toBeTruthy();
  expect(screen.getByRole('button',{name:/Esperimento scientifico · Una lente divergente/})).toBeTruthy();
  expect(screen.queryByText(resource.text)).toBeNull();expect(screen.queryByText(second.text)).toBeNull();
});
