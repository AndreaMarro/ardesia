// @vitest-environment jsdom
import {afterEach,expect,test} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {IndependentStudySource,isIndependentStudyResource,canCiteIndependentStudyAttempt,studySourceSelection} from './SourceProjection';
import type {StudyResource} from '../../api';
function source(kind:string,value:unknown):StudyResource{return {id:'source',revisionId:'exact',contextId:'context',kind,text:typeof value==='string'?value:JSON.stringify(value),ownerId:'student-s06',visibility:'private',sha256:'a'.repeat(64),editionId:'mechanics'};}
afterEach(cleanup);
test('editorial projection keeps future solutions out of the ordinary reader',()=>{
 const resource=source('independent-study-source-v1',{title:'Fonte molla',editorialStatus:'DRAFT',humanApproval:false,transfer:{answer:'CANARY_FUTURE_SOLUTION'}}),before={...resource};
 render(<IndependentStudySource resource={resource}/>);
 expect(screen.getByRole('heading',{name:'Fonte molla'})).toBeTruthy();expect(screen.queryByText(/CANARY_FUTURE_SOLUTION/)).toBeNull();
 expect(canCiteIndependentStudyAttempt(resource)).toBe(false);expect(resource).toEqual(before);
});
test('submitted procedure and observed help are readable without inferring mastery',()=>{
 const resource=source('independent-study-attempt-v1',{schemaVersion:1,phase:'practice',answer:{value:999,unit:'m',reasoning:'Controllo F/k < 2'},assistance:{observed:['hint-1'],external:'UNKNOWN'}});
 render(<IndependentStudySource resource={resource}/>);
 expect(screen.getByText('Controllo F/k < 2')).toBeTruthy();expect(screen.getByText('indizio 1')).toBeTruthy();expect(screen.getByText(/Aiuti esterni non determinati/)).toBeTruthy();
 expect(canCiteIndependentStudyAttempt(resource)).toBe(true);
});
test.each(['independent-study-source-v1','independent-study-attempt-v1','independent-study-plan-v1'])('malformed %s is never rendered as raw JSON',kind=>{
 const resource=source(kind,'CANARY_MALFORMED_JSON');render(<IndependentStudySource resource={resource}/>);
 expect(screen.getByRole('alert').textContent).toContain('non è leggibile');expect(screen.queryByText(/CANARY_MALFORMED_JSON/)).toBeNull();
 expect(canCiteIndependentStudyAttempt(resource)).toBe(false);
});
test('only the three exact reserved kinds are projected',()=>{
 expect(['independent-study-plan-v1','independent-study-source-v1','independent-study-attempt-v1'].every(isIndependentStudyResource)).toBe(true);
 expect(isIndependentStudyResource('notes')).toBe(false);expect(isIndependentStudyResource('independent-study-personal-note')).toBe(false);
});

test('a citation cannot split a surrogate pair or exceed the original source',()=>{
 const raw='🔬 F/k';expect(studySourceSelection(raw,3,6)).toEqual({start:2,end:5,quote:'F/k'});
 expect(studySourceSelection(raw,1,2)).toBeNull();expect(studySourceSelection(raw,0,1)).toBeNull();expect(studySourceSelection(raw,3,99)).toBeNull();
});

test('unverified resource fields are described as source-reported, never as established absence of help',()=>{
 const resource=source('independent-study-attempt-v1',{schemaVersion:1,phase:'practice',answer:{value:1,unit:'m',reasoning:'Testo dichiarato'},assistance:{observed:[],external:'NONE'}});
 render(<IndependentStudySource resource={resource}/>);
 expect(screen.getByText('Nessun aiuto riportato nella fonte.')).toBeTruthy();
 expect(screen.getByText(/non sono verificate da questa vista/)).toBeTruthy();
 expect(screen.queryByText(/Nessun aiuto richiesto in questa fase osservato/)).toBeNull();
});
