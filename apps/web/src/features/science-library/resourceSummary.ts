import type {StudyResource} from '../../api';

export type ScienceSummary={note:string;prediction:string;capabilityId:string;capabilityVersion:number};
/** Display projection only, never model support, execution or authorization. */
export function scienceSummary(resource:StudyResource):ScienceSummary|null{
  if(resource.kind!=='science-resource'||resource.text.length>20000)return null;
  try{
    const value=JSON.parse(resource.text);
    if(value&&typeof value==='object'&&!Array.isArray(value)&&value.schemaVersion===1&&
      typeof value.capabilityId==='string'&&/^[a-z0-9-]{1,80}$/.test(value.capabilityId)&&
      Number.isSafeInteger(value.capabilityVersion)&&value.capabilityVersion>=1&&
      typeof value.note==='string'&&value.note.length<=4000&&!value.note.includes('\0')&&
      typeof value.prediction==='string'&&value.prediction.length<=200&&!value.prediction.includes('\0'))
      return {note:value.note,prediction:value.prediction,capabilityId:value.capabilityId,capabilityVersion:value.capabilityVersion};
  }catch{/* A malformed payload has no plain-text fallback. */}
  return null;
}
