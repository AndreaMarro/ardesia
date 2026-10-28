import {describe,it,expect} from 'vitest';
import {labDefinitions} from './definitions';
import {exportLabSnapshot,importLabSnapshot,newLabSnapshot,validateConfiguration,validateSnapshot} from './snapshot';

describe('versioned lab scenarios',()=>{
  it('round trips every model with exact lesson, exercise and source references',()=>{
    for(const d of labDefinitions){
      const state=newLabSnapshot(d.id);state.prediction='La pressione aumenta';state.note='Confronto a volume costante';
      state.configuration.lessonRef={id:'lesson-original',version:2,sha256:'a'.repeat(64)};
      state.configuration.exerciseRef={id:'exercise-transfer',version:1,sha256:'b'.repeat(64)};
      state.configuration.sourceRefs=[{resourceId:'source',revisionId:'historical-revision'}];
      expect(importLabSnapshot(exportLabSnapshot(state))).toEqual(state);
    }
  });
  it('refuses future versions, injected fields, invalid domains and malformed references',()=>{
    const state=newLabSnapshot('hydrostatic');
    for(const value of [{...state,pluginVersion:'2.0.0'},{...state,injected:true},{...state,view:'webgl-foreign'},{...state,supportUsed:['model','model']}])expect(()=>validateSnapshot(value)).toThrow();
    expect(()=>validateConfiguration({...state.configuration,modelVersion:2})).toThrow();
    expect(()=>validateConfiguration({...state.configuration,parameters:{...state.configuration.parameters,depth:Infinity}})).toThrow();
    expect(()=>validateConfiguration({...state.configuration,parameters:{...state.configuration.parameters,density:true}})).toThrow();
    expect(()=>validateConfiguration({...state.configuration,lessonRef:{id:'lesson',version:1,sha256:'not-a-hash'}})).toThrow();
    expect(()=>importLabSnapshot('x'.repeat(20001))).toThrow();
  });
  it('takes ownership of nested data so an imported object cannot mutate a validated draft',()=>{
    const source=newLabSnapshot('hydrostatic'),copy=validateSnapshot(source);
    source.configuration.parameters.depth=3;source.supportUsed.push('model');
    expect(copy.configuration.parameters.depth).not.toBe(3);expect(copy.supportUsed).toEqual([]);
  });
});
