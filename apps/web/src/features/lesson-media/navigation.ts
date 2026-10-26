/** A location claim only: the destination rereads the exact resource in Core. */
export type LessonMediaReference={resourceId:string;revisionId:string};
export type LessonMediaRoute=
  | {kind:'exact';reference:LessonMediaReference}
  | {kind:'legacy';resourceId:string}
  | {kind:'invalid'};

const identifier=(value:string)=>value.trim()===value&&value.length>0&&value.length<=128;
export function readLessonMediaRoute(search:string):LessonMediaRoute|null{
  const query=new URLSearchParams(search),sources=query.getAll('mediaSource'),revisions=query.getAll('mediaRevision');
  if(!sources.length&&!revisions.length)return null;
  if(sources.length!==1||!identifier(sources[0])||revisions.length>1)return {kind:'invalid'};
  if(!revisions.length)return {kind:'legacy',resourceId:sources[0]};
  if(!identifier(revisions[0]))return {kind:'invalid'};
  return {kind:'exact',reference:{resourceId:sources[0],revisionId:revisions[0]}};
}
export function lessonMediaLink(reference:LessonMediaReference,editionId:string,search=''):string{
  const query=new URLSearchParams(search);
  query.set('view','materials');query.set('edition',editionId);
  query.set('mediaSource',reference.resourceId);query.set('mediaRevision',reference.revisionId);
  return '/?'+query;
}
