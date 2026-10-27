import {useEffect,useRef,useState} from 'react';
import {studyRequest,describeError} from '../api';
import {CourseScope} from '../features/PublicCoursePlayer';
import {ErrorNotice} from './Feedback';
import type {CourseRecord} from '../courseLearning';
import type {ActivityCommit} from '../course';
import type {CourseLessonContext} from '../../../studio/src/study/contracts';
export function CourseLearningWorkspace({editionId,onCommit,initialActivityId,initialCourseLesson}:{editionId:string;onCommit:(value:ActivityCommit|null)=>void;initialActivityId?:string;initialCourseLesson?:CourseLessonContext}){
 const [course,setCourse]=useState<CourseRecord|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 // Acknowledging a correction clears its submission parent, not the reader's
 // selected lesson/phase. Only a new explicit target or edition changes entry.
 const entry=useRef({editionId,initialActivityId,initialCourseLesson});
 if(entry.current.editionId!==editionId||initialActivityId||initialCourseLesson)
   entry.current={editionId,initialActivityId,initialCourseLesson};
 useEffect(()=>{let active=true;const controller=new AbortController();setCourse(null);setError('');onCommit(null);
 void studyRequest<{course:CourseRecord}>('/course-learning?editionId='+encodeURIComponent(editionId),undefined,{signal:controller.signal}).then(d=>{if(active)setCourse(d.course);}).catch(e=>{if(active&&!controller.signal.aborted)setError(describeError(e));});
 return()=>{active=false;controller.abort();};},[editionId,onCommit,retry]);
 return error?<ErrorNotice message={error} onRetry={()=>setRetry(value=>value+1)}/>:course?<CourseScope key={JSON.stringify([course.pathId,entry.current.initialActivityId,entry.current.initialCourseLesson])} course={course} allowLocalDrafts={false} onCommit={onCommit} initialActivityId={entry.current.initialActivityId} initialCourseLesson={entry.current.initialCourseLesson}/>:<p role="status">Apro la revisione del corso…</p>;
}
