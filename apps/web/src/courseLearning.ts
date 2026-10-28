import {courseLearningData} from './generated/courseLearningData';
export type ModelResult={activityId:string;version:number;value:number;unit:string;domain:string;[key:string]:unknown};
export type ModelCase={parameters:Record<string,number|string>;result:ModelResult};
export type CourseLesson={observableObjective?:string;prerequisiteRecovery?:{prerequisites:string[];miniReview:string};learningSequence?:{id:string;kind:string;title:string;prompt:string;labSpecId?:string}[];objectiveSections?:Record<string,number>;assessmentRefs?:{id:string;objectiveId:string;collection:string}[];id:string;title:string;objectiveIds:string[];activityId?:string;explanation:string[];
 workedExample:{prompt:string;steps:string[];answerDisplay:string};
 practice:{prompt:string;answer?:{value:number|string;unit:string};parameters?:Record<string,number|string>;result?:ModelResult;feedback?:string[]};
 transfer:{prompt:string;answer?:{value:number|string;unit:string};parameters?:Record<string,number|string>;result?:ModelResult;feedback?:string[]};
 recap:string[];transcript:string;editorialStatus:string;humanApproval:boolean;releaseScope:string;
 lessonRef:{id:string;version:number;sha256:string};modelCases?:ModelCase[];controls?:Record<string,(number|string)[]>;
 audioPath?:string;audioTranscript?:string;coverageWarning:string};
export type CourseExactRef={id:string;version:number;sha256:string};
export type CourseAssessmentItem={id:string;objectiveId:string;prompt:string;hintCount?:number;transfer:{prompt:string;hintCount?:number};assessmentRef:CourseExactRef};
export type CourseDiagnosticItem={id:string;objectiveId:string;prompt:string;recoveryTarget:{objectiveId:string;lessonId:string};assessmentRef:CourseExactRef;lessonRef:CourseExactRef};
export type CourseRecord={assessmentItems?:CourseAssessmentItem[];diagnosticItems?:CourseDiagnosticItem[];pathId:string;packId:string;packRef:{packId:string;packVersion:number;packSha256:string};title:string;
 unitIds:string[];requiredObjectives:number;completedObjectives:number;availableLessons:number;lessons:CourseLesson[];status:string;
 editorialStatus:string;humanApproval:boolean;requirements:Record<string,string|boolean>;gaps:string[];
 editorialMaterials?:Record<string,unknown[]>|null;
 objectiveFamilies:{id:string;title:string;subtargets:{id:string;label:string}[]}[]};
export type CourseProjection={schemaVersion:number;releaseScope:string;courses:CourseRecord[];bankIncluded:boolean;
 baseline:{year:string;requiredObjectives:number;familyCount:number;sha256:string;source:{pdf:string;crosscheck:string;authority:string;murDirect:string}}};
export const learningCourses=courseLearningData as unknown as CourseProjection;
const prefix='ardesia.public-course-draft.v1.';
export type CourseDraft={schemaVersion:1;packSha256:string;lessonSha256:string;lessonId:string;prediction:string;note:string;supportUsed:string[];
 parameters:Record<string,number|string>;phase:'practice'|'transfer'};
export function saveCourseDraft(course:CourseRecord,data:Omit<CourseDraft,'schemaVersion'|'packSha256'|'lessonSha256'>,lesson:CourseLesson){
 try{if(data.note.length>4000||data.prediction.length>2000) return false;
 localStorage.setItem(prefix+course.pathId+'.last',data.lessonId);
 localStorage.setItem(prefix+course.pathId+'.'+data.lessonId,JSON.stringify({...data,schemaVersion:1,packSha256:course.packRef.packSha256,lessonSha256:lesson.lessonRef.sha256}));return true;}catch{return false;}
}
export function readCourseDraft(course:CourseRecord,lessonId?:string):{kind:'current';data:CourseDraft}|{kind:'stale';note:string}|{kind:'none'}{
 try{const id=lessonId||localStorage.getItem(prefix+course.pathId+'.last');if(!id||!course.lessons.some(l=>l.id===id))return{kind:'none'};const raw=localStorage.getItem(prefix+course.pathId+'.'+id);if(!raw||raw.length>8000)return{kind:'none'};
 const d=JSON.parse(raw) as CourseDraft;const lesson=course.lessons.find(l=>l.id===d.lessonId);
 if(d.lessonId!==id||d.schemaVersion!==1||typeof d.note!=='string'||d.note.length>4000||typeof d.prediction!=='string'||d.prediction.length>2000||!Array.isArray(d.supportUsed)||d.supportUsed.some(x=>!['explanation','example','recap','transcript'].includes(x))||!['practice','transfer'].includes(d.phase))return{kind:'none'};
 if(!lesson||d.packSha256!==course.packRef.packSha256||d.lessonSha256!==lesson.lessonRef.sha256)return{kind:'stale',note:d.note};
 if(lesson.modelCases&&!lesson.modelCases.some(c=>Object.keys(c.parameters).length===Object.keys(d.parameters||{}).length&&Object.entries(c.parameters).every(([k,v])=>d.parameters[k]===v)))return{kind:'none'};
 return{kind:'current',data:d};}catch{return{kind:'none'};}
}
export function eraseCourseDraft(courseId:string,lessonId:string){try{localStorage.removeItem(prefix+courseId+'.'+lessonId);return true;}catch{return false;}}
