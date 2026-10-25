// @vitest-environment jsdom
import {expect,test,beforeEach} from 'vitest';
import {installPublicBrowserStorage} from '../../__tests__/public-storage-fixture';
import {saveDraft,readDraft,eraseDraft} from './storage';
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
