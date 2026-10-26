import type {ResourceRef} from './types';

export type ScienceSelection = {open:boolean;invalid:boolean;resourceRef?:ResourceRef};
const validId = (value:string|null):value is string => Boolean(value && value.length<=128 && !value.includes('\0'));

/** A partial or ambiguous reference must never turn into a latest-revision read. */
export function readScienceSelection(search:string):ScienceSelection {
  const params=new URLSearchParams(search);
  const hasReference=params.has('scienceResource')||params.has('scienceRevision');
  if(!hasReference)return {open:params.get('scienceLibrary')==='1',invalid:false};
  const resourceId=params.get('scienceResource'),revisionId=params.get('scienceRevision');
  if(params.getAll('scienceResource').length!==1||params.getAll('scienceRevision').length!==1||
    !validId(resourceId)||!validId(revisionId))return {open:true,invalid:true};
  return {open:true,invalid:false,resourceRef:{resourceId,revisionId}};
}

/** Always target Aula, including when the source reader is embedded in Studio. */
export function scienceResourceHref(editionId:string,resourceRef?:ResourceRef):string {
  const params=new URLSearchParams({view:'materials',edition:editionId});
  if(resourceRef){params.set('scienceResource',resourceRef.resourceId);params.set('scienceRevision',resourceRef.revisionId);}
  else params.set('scienceLibrary','1');
  return '/?'+params;
}
