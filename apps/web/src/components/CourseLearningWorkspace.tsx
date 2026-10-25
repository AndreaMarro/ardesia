import {useEffect,useState} from 'react';
import {studyRequest,describeError} from '../api';
import {CourseScope} from '../features/PublicCoursePlayer';
import type {CourseRecord} from '../courseLearning';
import type {ActivityCommit} from '../course';
export function CourseLearningWorkspace({editionId,onCommit}:{editionId:string;onCommit:(value:ActivityCommit|null)=>void}){
 const [course,setCourse]=useState<CourseRecord|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;const controller=new AbortController();setCourse(null);setError('');onCommit(null);
 void studyRequest<{course:CourseRecord}>('/course-learning?editionId='+encodeURIComponent(editionId),undefined,{signal:controller.signal}).then(d=>{if(active)setCourse(d.course);}).catch(e=>{if(active&&!controller.signal.aborted)setError(describeError(e));});
 return()=>{active=false;controller.abort();};},[editionId,onCommit]);
 return error?<p role="alert">{error}</p>:course?<CourseScope course={course} allowLocalDrafts={false} onCommit={onCommit}/>:<p role="status">Apro la revisione del corso…</p>;
}
