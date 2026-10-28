import {useEffect,useRef,useState} from 'react';
import {studyRequest,describeError,type StudyMe,type StudyResource,type Submission} from '../api';
import {courseLessonFromContext} from '../course';
import {scienceTimestamp} from '../features/science-library/scienceTimestamp';
import {scienceApi} from '../features/science-library/scienceApi';
import type {SavedScience} from '../features/science-library/types';
import type {PostitReference} from '../../../studio/src/study/contracts';
import {CourseScope} from '../features/PublicCoursePlayer';
import {ErrorNotice} from './Feedback';
import type {CourseRecord} from '../courseLearning';
import type {ActivityCommit} from '../course';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
export function CourseLearningWorkspace({editionId,onCommit,initialActivityId,initialCourseLesson,me,resources=[],submissions=[],onSaved,onInvalidated}:{editionId:string;me?:StudyMe;resources?:StudyResource[];submissions?:Submission[];onSaved?:(ref:PostitReference)=>void;onInvalidated?:()=>void;onCommit:(value:ActivityCommit|null)=>void;initialActivityId?:string;initialCourseLesson?:CourseLessonContext}){
 const [saved,setSaved]=useState<SavedScience[]>([]);
 const [course,setCourse]=useState<CourseRecord|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 // Acknowledging a correction clears its submission parent, not the reader's
 // selected lesson/phase. Only a new explicit target or edition changes entry.
 const entry=useRef({editionId,initialActivityId,initialCourseLesson});
 if(entry.current.editionId!==editionId||initialActivityId||initialCourseLesson)
   entry.current={editionId,initialActivityId,initialCourseLesson};
 useEffect(()=>{let active=true;const controller=new AbortController();setCourse(null);setError('');onCommit(null);
 void Promise.all([studyRequest<{course:CourseRecord}>('/course-learning?editionId='+encodeURIComponent(editionId),undefined,{signal:controller.signal}),Promise.allSettled(resources.filter(r=>r.kind==='science-resource'&&r.ownerId===me?.id&&r.editionId===editionId).map(r=>scienceApi.read({resourceId:r.id,revisionId:r.revisionId},controller.signal)))]).then(([d,reads])=>{if(active){setSaved(reads.flatMap(r=>r.status==='fulfilled'&&r.value.snapshot.courseLesson?[r.value]:[]).sort((a,b)=>scienceTimestamp(b.updatedAt)-scienceTimestamp(a.updatedAt)));setCourse(d.course);}}).catch(e=>{if(active&&!controller.signal.aborted)setError(describeError(e));});
 return()=>{active=false;controller.abort();};},[editionId,onCommit,retry]);
 const lastAttempt=submissions.filter(s=>s.student_id===me?.id&&s.courseContext?.lessonRef).sort((a,b)=>(b.created_at||0)-(a.created_at||0))[0];
 const resumeAttempt=lastAttempt&&((lastAttempt.created_at||0)*1000>scienceTimestamp(saved[0]?.updatedAt)||!saved.length)?lastAttempt:undefined;
 return error?<ErrorNotice message={error} onRetry={()=>setRetry(value=>value+1)}/>:course?<CourseScope key={JSON.stringify([course.pathId,entry.current.initialActivityId,entry.current.initialCourseLesson])} course={course} allowLocalDrafts={false} onCommit={onCommit} initialActivityId={entry.current.initialActivityId} initialCourseLesson={entry.current.initialCourseLesson} labHost={me?{me,editionId,saved,resume:courseLessonFromContext(resumeAttempt?.courseContext),resumeActivityId:resumeAttempt?.activity_id,lastAttempt,onSaved:onSaved||(()=>{}),onInvalidated:onInvalidated||(()=>{})}:undefined}/>:<p role="status">Apro la revisione del corso…</p>;
}
