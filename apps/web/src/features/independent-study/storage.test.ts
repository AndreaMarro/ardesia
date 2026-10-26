// @vitest-environment jsdom
import {expect,test,beforeEach} from 'vitest';
import {installPublicBrowserStorage} from '../../__tests__/public-storage-fixture';
import * as storage from './storage';
import {saveDraft,readDraft,eraseDraft,readOffline,saveOffline} from './storage';
import type {StudyState} from './types';
beforeEach(installPublicBrowserStorage);
test('offline input is isolated by verified actor, edition, exact lesson and phase',()=>{
 const scope={actor:'student-a',edition:'mechanics',session:'session-1',revision:'rev1',lesson:'abc',phase:'practice'};
 expect(saveDraft(scope,{value:'4',reasoning:'uso il modello'})).toBe(true);
 expect(readDraft(scope)).toMatchObject({value:'4'});
 for(const other of [{actor:'student-b'},{edition:'other'},{lesson:'new'},{phase:'transfer'},{revision:'rev2'}])expect(readDraft({...scope,...other})).toBeNull();
 eraseDraft(scope);expect(readDraft(scope)).toBeNull();
});
test('malformed or oversized persisted input is ignored',()=>{
 const s={actor:'a',edition:'e',session:'s',revision:'r',lesson:'h',phase:'practice'};
 expect(saveDraft(s,{value:'0',reasoning:'x'.repeat(4001)})).toBe(false);
 expect(readDraft(s)).toBeNull();
});

test('a corrupt offline cache cannot become a rendered course or confirmed receipt',async()=>{
 const {readOffline}=await import('./storage');
 localStorage.setItem('ardesia.independent-study.v1.offline.'+JSON.stringify(['a','e']),JSON.stringify({savedAt:1,state:{id:'s',editionId:'e',lessonRef:{sha256:'fake'}}}));
 expect(readOffline('a','e')).toBeNull();
});

test('removing the device copy clears earlier revisions for this actor and edition only',async()=>{
 const {clearOffline}=await import('./storage');
 const s={actor:'a',edition:'e',session:'s',revision:'r1',lesson:'h',phase:'practice'};
 saveDraft(s,{value:'1',reasoning:'old private draft'});
 saveDraft({...s,revision:'r2'},{value:'2',reasoning:'current private draft'});
 saveDraft({...s,actor:'b'},{value:'3',reasoning:'another actor'});
 clearOffline('a','e');
 expect(readDraft(s)).toBeNull();expect(readDraft({...s,revision:'r2'})).toBeNull();
 expect(readDraft({...s,actor:'b'})).toMatchObject({value:'3'});
});

function reviewState():StudyState{return {
 id:'session',revisionId:'exact',editionId:'mechanics',lessonRef:{id:'spring',version:1,sha256:'abc'},
 sourceRef:{resourceId:'source',revisionId:'original',sha256:'def'},title:'Molla',phase:'review',phases:['practice','review'],cycle:0,
 diagnostic:'Controllo le unità',phaseSupport:[],hintLevel:0,attempts:[],prerequisites:[],reviewAt:1700000000,
 reviewReason:'Ripasso scelto',mastery:'NOT_INFERRED',tutorRequest:null,dispute:null,pendingAttempt:null,
 reviewScheduler:{engine:'py-fsrs',version:'6.3.2',basis:'learner_self_report',rated:false,lastRating:null,canUndo:false,
  choices:[{rating:'good',label:'Ricordato',due:1700000000}],manualOverride:null,explanation:'Una scelta personale'},
};}
const cacheKey=(actor='a',edition='mechanics')=>'ardesia.independent-study.v1.offline.'+JSON.stringify([actor,edition]);
function cache(state:unknown){localStorage.setItem(cacheKey(),JSON.stringify({savedAt:1700000000000,state}));}

test.each([
 ['unknown phase prototype',{phase:'__proto__',phases:['__proto__']}],
 ['unknown phase constructor',{phase:'constructor',phases:['constructor']}],
 ['unknown step prototype',{phases:['review','__proto__']}],
 ['scheduler choices object',{reviewScheduler:{...reviewState().reviewScheduler,choices:{unexpected:'object'}}}],
 ['scheduler item null',{reviewScheduler:{...reviewState().reviewScheduler,choices:[null]}}],
 ['scheduler label object',{reviewScheduler:{...reviewState().reviewScheduler,choices:[{rating:'good',label:{bad:true},due:1700000000}]}}],
 ['scheduler date string',{reviewScheduler:{...reviewState().reviewScheduler,choices:[{rating:'good',label:'Bene',due:'tomorrow'}]}}],
 ['scheduler explanation object',{reviewScheduler:{...reviewState().reviewScheduler,explanation:{bad:true}}}],
 ['task parameter object',{task:{prompt:'Calcola',unit:'m',parameters:{force:{bad:true}}}}],
 ['task parameters array',{task:{prompt:'Calcola',unit:'m',parameters:[1,2]}}],
 ['simulation controls scalar',{simulation:{activityId:'hooke-v1',parameters:{force:1},controls:{force:1}}}],
 ['simulation control object',{simulation:{activityId:'hooke-v1',parameters:{force:1},controls:{force:[{bad:true}]}}}],
 ['simulation parameters array',{simulation:{activityId:'hooke-v1',parameters:[1],controls:{force:[1]}}}],
 ['review reason object',{reviewReason:{bad:true}}],
 ['source explanation object',{source:{explanation:[{bad:true}],recap:[]}}],
 ['source reference id object',{sourceRef:{resourceId:{bad:true},revisionId:'original',sha256:'def'}}],
])('rejects malformed render input: %s',(_name,patch)=>{
 cache({...reviewState(),...patch});expect(readOffline('a','mechanics')).toBeNull();
});

test('valid review copy remains readable and does not restore receipts or pending commands',()=>{
 const state=reviewState();expect(saveOffline('a','mechanics',state)).toBe(true);
 expect(readOffline('a','mechanics')).toMatchObject({state});
 cache({...state,attempts:[{receipt:{receiptId:'forged'}}]});expect(readOffline('a','mechanics')).toBeNull();
 cache({...state,pendingAttempt:{key:'forged'}});expect(readOffline('a','mechanics')).toBeNull();
});

test('offline simulation retains inputs while explicitly omitting unverified results, including legacy caches',()=>{
 const state={...reviewState(),phase:'simulation',phases:['simulation'],simulation:{activityId:'hooke-v1',parameters:{force:1,stiffness:10},controls:{force:[1,2],stiffness:[10,20]},result:{value:.1,unit:'m',domain:'ideale'}}};
 expect(saveOffline('a','mechanics',state)).toBe(true);
 const stored=JSON.parse(localStorage.getItem(cacheKey())!);
 expect(stored.state.simulation).not.toHaveProperty('result');expect(stored.omissions).toEqual(['simulation-result']);
 expect(state.simulation).toHaveProperty('result');
 cache({...state,simulation:{...state.simulation,result:{unverified:'old cache'}}});
 const restored=readOffline('a','mechanics');
 expect(restored?.state.simulation).toEqual({activityId:'hooke-v1',parameters:state.simulation.parameters,controls:state.simulation.controls});
 expect(restored).toHaveProperty('omissions',['simulation-result']);
 expect(saveOffline('a','mechanics',restored!.state)).toBe(true);
 expect(readOffline('a','mechanics')).toHaveProperty('omissions',['simulation-result']);
});

test('session end clears every edition of one actor without touching peers or unrelated storage',()=>{
 for(const actor of ['a','b'])for(const edition of ['mechanics','waves']){
  saveDraft({actor,edition,session:'s',revision:'r',lesson:'h',phase:'practice'},{value:'1',reasoning:'private'});
  saveOffline(actor,edition,{...reviewState(),editionId:edition});
 }
 localStorage.setItem('unrelated','keep');localStorage.setItem('ardesia.independent-study.v1.offline.not-json','keep');
 expect(storage).toHaveProperty('clearActorOffline');
 (storage as unknown as {clearActorOffline:(actor:string)=>void}).clearActorOffline('a');
 for(const edition of ['mechanics','waves']){
  expect(readOffline('a',edition)).toBeNull();
  expect(readDraft({actor:'a',edition,session:'s',revision:'r',lesson:'h',phase:'practice'})).toBeNull();
  expect(readOffline('b',edition)).not.toBeNull();
  expect(readDraft({actor:'b',edition,session:'s',revision:'r',lesson:'h',phase:'practice'})).not.toBeNull();
 }
 expect(localStorage.getItem('unrelated')).toBe('keep');expect(localStorage.getItem('ardesia.independent-study.v1.offline.not-json')).toBe('keep');
});
