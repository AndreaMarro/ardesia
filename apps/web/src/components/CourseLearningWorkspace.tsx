import {useEffect,useRef,useState} from 'react';
import {studyRequest,describeError,type StudyMe,type StudyResource,type Submission} from '../api';
import {courseLessonFromContext} from '../course';
import {isStudySessionEpoch,studySessionTicket} from '../../../studio/src/study/sessionBoundary';
import {scienceTimestamp} from '../features/science-library/scienceTimestamp';
import {scienceApi} from '../features/science-library/scienceApi';
import type {ResourceRef,SavedScience} from '../features/science-library/types';
import type {PostitReference} from '../../../studio/src/study/contracts';
import {CourseScope} from '../features/PublicCoursePlayer';
import {ErrorNotice} from './Feedback';
import type {CourseRecord} from '../courseLearning';
import type {ActivityCommit} from '../course';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';

// The shared runtime role has 20 connections. Four revision reads leave room
// for the course request and other workspaces instead of exhausting that pool.
const RESUME_READ_CONCURRENCY=4;
async function readScienceRevisions(refs:ResourceRef[],signal:AbortSignal):Promise<SavedScience[]>{
 const values=new Array<SavedScience>(refs.length);
 let cursor=0,failed=false;
 async function worker(){
  while(!signal.aborted&&!failed){
   const index=cursor++;
   if(index>=refs.length)return;
   try{values[index]=await scienceApi.read(refs[index],signal);}
   catch(error){failed=true;throw error;}
  }
 }
 await Promise.all(Array.from({length:Math.min(RESUME_READ_CONCURRENCY,refs.length)},worker));
 return values;
}

type LoadedCourse={scope:string;course:CourseRecord;saved:SavedScience[]};
export function CourseLearningWorkspace({editionId,onCommit,initialActivityId,initialCourseLesson,me,resources=[],submissions=[],onSaved,onInvalidated}:{editionId:string;me?:StudyMe;resources?:StudyResource[];submissions?:Submission[];onSaved?:(ref:PostitReference)=>void;onInvalidated?:()=>void;onCommit:(value:ActivityCommit|null)=>void;initialActivityId?:string;initialCourseLesson?:CourseLessonContext}){
 const scope=JSON.stringify([editionId,me?.id,me?.role]);
 const [loaded,setLoaded]=useState<LoadedCourse|null>(null);
 const [error,setError]=useState<{scope:string;message:string}|null>(null),[retry,setRetry]=useState(0);
 // Acknowledging a correction clears its submission parent, not the reader's
 // selected lesson/phase. An actor/edition change always starts a new entry.
 const entry=useRef({scope,initialActivityId,initialCourseLesson});
 if(entry.current.scope!==scope||initialActivityId||initialCourseLesson)
   entry.current={scope,initialActivityId,initialCourseLesson};
 useEffect(()=>{
  let active=true;
  const controller=new AbortController(),session=studySessionTicket();
  setLoaded(null);setError(null);onCommit(null);
  const abortSession=()=>{
   controller.abort();
   if(active){setLoaded(null);setError({scope,message:'La sessione è cambiata. Riprova per riaprire il corso.'});onCommit(null);}
  };
  session.signal.addEventListener('abort',abortSession,{once:true});
  if(session.signal.aborted)abortSession();
  // Pin every exact reference before a bounded worker starts reading it.
  const refs=resources.filter(r=>r.kind==='science-resource'&&r.ownerId===me?.id&&r.editionId===editionId)
   .map(r=>({resourceId:r.id,revisionId:r.revisionId}));
  if(!controller.signal.aborted)void Promise.all([
   studyRequest<{course:CourseRecord}>('/course-learning?editionId='+encodeURIComponent(editionId),undefined,{signal:controller.signal}),
   readScienceRevisions(refs,controller.signal),
  ]).then(([data,reads])=>{
   if(active&&!controller.signal.aborted&&isStudySessionEpoch(session.epoch))setLoaded({scope,course:data.course,
    saved:reads.filter(value=>value.snapshot.courseLesson).sort((a,b)=>scienceTimestamp(b.updatedAt)-scienceTimestamp(a.updatedAt))});
  }).catch(error=>{
   if(active&&!controller.signal.aborted&&isStudySessionEpoch(session.epoch)){
    setError({scope,message:describeError(error,'Non riesco a riaprire il corso e tutte le configurazioni salvate. Riprova.')});
    controller.abort();
   }
  });
  return()=>{active=false;session.signal.removeEventListener('abort',abortSession);controller.abort();};
 },[scope,editionId,onCommit,retry]);
 // Do not paint the previous actor's/edition's data before effect cleanup runs.
 const current=loaded?.scope===scope?loaded:undefined,course=current?.course,saved=current?.saved||[];
 const currentError=error?.scope===scope?error.message:'';
 const lastAttempt=submissions.filter(s=>s.student_id===me?.id&&s.courseContext?.lessonRef).sort((a,b)=>(b.created_at||0)-(a.created_at||0))[0];
 const resumeAttempt=lastAttempt&&((lastAttempt.created_at||0)*1000>scienceTimestamp(saved[0]?.updatedAt)||!saved.length)?lastAttempt:undefined;
 return currentError?<ErrorNotice message={currentError} onRetry={()=>setRetry(value=>value+1)}/>:course?<CourseScope key={JSON.stringify([scope,course.pathId,entry.current.initialActivityId,entry.current.initialCourseLesson])} course={course} allowLocalDrafts={false} onCommit={onCommit} initialActivityId={entry.current.initialActivityId} initialCourseLesson={entry.current.initialCourseLesson} labHost={me?{me,editionId,saved,resume:courseLessonFromContext(resumeAttempt?.courseContext),resumeActivityId:resumeAttempt?.activity_id,lastAttempt,onSaved:onSaved||(()=>{}),onInvalidated:onInvalidated||(()=>{})}:undefined}/>:<p role="status">Apro la revisione del corso…</p>;
}
