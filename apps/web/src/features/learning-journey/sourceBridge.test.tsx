// @vitest-environment jsdom
import {afterEach,expect,test,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import {LearningJourney} from './LearningJourney';
import {clearResourceDrafts} from '../../components/sessionDraftCache';
import type {StudyResource,Workspace} from '../../api';
afterEach(()=>{cleanup();clearResourceDrafts();vi.unstubAllGlobals();});

test('the actual journey offers shared typed PDF sources and annotations with readable labels',async()=>{
  const me={id:'student',role:'student' as const,synthetic:true as const};
  const resource=(id:string,kind:string,text:string,visibility:'group'|'private'='group'):StudyResource=>({id,kind,text,visibility,revisionId:'revision-'+id,contextId:'context-'+id,sha256:'a'.repeat(64),editionId:'fluidi',ownerId:'teacher'});
  const resources=[resource('pdf','living-source',JSON.stringify({title:'Poiseuille e il vincolo'})),
    resource('annotation','living-annotation',JSON.stringify({blocks:[{kind:'explanation',text:'Il raggio compare alla quarta potenza.'}]})),
    resource('private','living-annotation','{}','private')];
  const workspace:Workspace={edition:{id:'fluidi',teacherId:'teacher',capacity:4,priceMinor:0,state:'running',sessions:[],timezone:'Europe/Rome',packSha256:'a'.repeat(64)},
    enrolled:true,resources,submissions:[],layouts:[],layoutSaved:false,layoutVersion:'v1'};
  const experience={id:'poiseuille-boundary-v1',title:'Prevedi e spiega',objective:'Distingui il vincolo',editorialStatus:'DRAFT',scientificApproval:'NOT_ATTESTED',
    steps:[{id:'fixed-pressure',activityId:'poiseuille-v1',title:'Raggio doppio',prompt:'La pressione resta fissata.',parameters:{radiusRatio:2,boundary:'pressure'}}]};
  vi.stubGlobal('fetch',vi.fn(async(path:string)=>Response.json(path.endsWith('/me')?me:path.includes('learning-experiences')?{experiences:[experience]}:workspace)));
  render(<LearningJourney me={me} data={workspace}/>);
  const choices=within(await screen.findByRole('combobox',{name:'Fonte del percorso'})).getAllByRole('option');
  expect(choices.map(item=>(item as HTMLOptionElement).value)).toEqual(['','pdf','annotation']);
  expect(choices[1].textContent).toContain('Poiseuille e il vincolo');
  expect(choices[2].textContent).toContain('Il raggio compare alla quarta potenza.');
  expect(choices.map(item=>item.textContent).join('')).not.toContain('{');
});
