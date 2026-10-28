/** HTTP study-resource shape, checked against the live API in the E2E journey. */
export type StudyResource = {
  id: string; revisionId: string; contextId: string; ownerId: string; editionId: string;
  kind: string; visibility: 'private'|'group'; text: string; sha256: string;
}
export type PostitReference = {resourceId:string; revisionId:string; contextId:string}
export type StudyMe={id:string;role:'teacher'|'student';synthetic:true}
export type Feedback={id:string;state:string;text:string;stale:boolean;authorType:string;submissionRevision:number;review?:{id:string;text:string;decision:string;syntheticTutor:true}}
export type CourseLessonContext = {lessonRef:{id:string;version:number;sha256:string};phase:'practice'|'transfer';stepId?:string;assessmentRef?:{id:string;version:number;sha256:string}}
export type SubmissionCourseContext = {courseId?:string;packId?:string;packVersion?:number;packSha256?:string;modelId:string|null;parameters:Record<string,unknown>|null;lessonRef?:CourseLessonContext['lessonRef'];phase?:CourseLessonContext['phase'];stepId?:string;assessmentRef?:CourseLessonContext['assessmentRef'];assessmentPrompt?:string}
export type Submission={id:string;student_id:string;activity_id:string;revision:number;parent_id:string|null;text:string;asset_refs:string[];source_refs:PostitReference[];receipt_id:string;state:string;feedback:Feedback[];courseContext?:SubmissionCourseContext;created_at?:number}
export type Edition={id:string;teacherId:string;capacity:number;priceMinor:number;state:string;sessions:{start:string;end:string}[];timezone:string}
export type Workspace={enrolled:boolean;edition:Edition;resources:StudyResource[];submissions:Submission[];layouts:import('./postit').StudyPostitView[]}
export type ContextPacket={contextId:string;resource:StudyResource;observations:{id:string;text:string;reviewId:string;evidence:{text:string;sourceId:string;submissionId:string;revisionId:string;segmentId:string}}[];omittedStale:number;limits:string[]}
