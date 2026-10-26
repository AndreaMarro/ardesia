import type {StudyResource} from '../../api';

export type Parameters = Record<string, number>;
export type Capability = {
  id:string; version:number; implementationSha256:string; title:string;
  primaryOutput:{label:string;unit:string}; domain:string; explanation:string[];
  transfer:Parameters; distribution:'BUNDLED_FIRST_PARTY';editorialStatus:'DRAFT';
  parameters:{key:string;label:string;unit:string;default:number;minimum:number;maximum:number}[];
};
export type Catalog = {schemaVersion:1;capabilities:Capability[];
  courses:{id:string;title:string;capabilityIds:string[]}[];referenceScope:string};
export type Snapshot = {schemaVersion:1;capabilityId:string;capabilityVersion:number;
  implementationSha256:string;parameters:Parameters;note:string;prediction:string;supportUsed?:('explanation'|'domain')[]};
export type SavedScience = {resource:StudyResource;snapshot:Snapshot;supported:boolean};
export type ResourceRef = {resourceId:string;revisionId:string};
export type Plot = {id:string;label:string;unit:string;xUnit?:string;x?:number[];categories?:string[];
  series:{label:string;values:number[]}[]};
export type ScienceResult = {activityId:string;version:1;dataVersion:1;parameters:Parameters;
  value:number;unit:string;domain:string;editorialStatus:'DRAFT';distribution:'BUNDLED_FIRST_PARTY';
  observables:{key:string;label:string;value:number;unit:string}[];plots:Plot[];
  raySegments?:{label:string;style:'solid'|'dashed';points:number[][]}[];
};
export type Comparison = {result:ScienceResult;prediction:string;assessment:'MODEL_COMPARISON_NOT_A_GRADE'};
export type ScienceApi = {
  catalog(editionId:string,signal:AbortSignal):Promise<Catalog>;
  read(ref:ResourceRef,signal:AbortSignal):Promise<SavedScience>;
  evaluate(editionId:string,snapshot:Snapshot,signal:AbortSignal):Promise<Comparison>;
  save(editionId:string,snapshot:Snapshot,key:string,ref:ResourceRef|null,signal:AbortSignal):Promise<SavedScience>;
};
