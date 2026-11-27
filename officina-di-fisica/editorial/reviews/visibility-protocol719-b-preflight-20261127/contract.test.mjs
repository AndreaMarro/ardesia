import assert from 'node:assert/strict';
import test from 'node:test';
import {assertOwnerRecord,assertObservedControls} from './experiment_visibility_ui.mjs';

// Contract fixtures, never a claim that an owner/guest endpoint was observed.
test('719 preserves v2 and the whole normalized owner payload',()=>{
 const draft={id:'fixture',baseVersion:1,version:2,review:'pending',control:{min:0,max:8,step:.5}};
 const saved={id:'fixture',version:2,review:'bozza',control:{min:0,max:8,step:.5}};
 assertOwnerRecord(saved,draft);
 assert.throws(()=>assertOwnerRecord({...saved,control:{...saved.control,max:9}},draft));
 assert.throws(()=>assertOwnerRecord({...saved,version:3},draft));
});
test('719 requires the next individual edition, without a fixed v2 assumption',()=>{
 assertOwnerRecord({id:'fixture',version:3,review:'bozza'},{id:'fixture',baseVersion:2,version:3});
 for(const [baseVersion,version]of [[2,2],[2,4],[true,2],[0,1],[1.5,2.5]]) {
  assert.throws(()=>assertOwnerRecord({id:'fixture',version,review:'bozza'},{id:'fixture',baseVersion,version}));
 }
});
test('secondary-clock fixtures retain the chosen control while time changes',()=>{
 const row={record:{control:{min:0,step:1}},hasClock:true,clockInput:false};
 const state={kind:'clock',index:0,x:7,time:3};
 const measured={actualDOMControls:[{name:'x',value:'7'}],sourceReplayedX:7,sourceReplayedClockTime:3,clockReadout:'3'};
 assertObservedControls(measured,state,row);
 assert.throws(()=>assertObservedControls({...measured,sourceReplayedX:8},state,row));
 assert.throws(()=>assertObservedControls({...measured,sourceReplayedClockTime:0},state,row));
});
