import {studyRequest} from '../../api';
import type {ScienceApi} from './types';

const scope=(editionId:string)=>'/editions/'+encodeURIComponent(editionId)+'/science-library';
export const scienceApi:ScienceApi = {
  catalog:(editionId,signal)=>studyRequest(scope(editionId)+'/catalog',undefined,{signal}),
  read:(ref,signal)=>studyRequest('/science-library/resources/'+encodeURIComponent(ref.resourceId)+'?revisionId='+encodeURIComponent(ref.revisionId),undefined,{signal}),
  evaluate:(editionId,snapshot,signal)=>studyRequest(scope(editionId)+'/evaluate',{
    capabilityId:snapshot.capabilityId,capabilityVersion:snapshot.capabilityVersion,
    implementationSha256:snapshot.implementationSha256,parameters:snapshot.parameters,prediction:snapshot.prediction,
  },{signal}),
  save:(editionId,snapshot,key,ref,signal)=>studyRequest(scope(editionId)+'/resources'+(ref?'/'+encodeURIComponent(ref.resourceId)+'/revise':''),{
    snapshot,...(ref?{expectedRevision:ref.revisionId}:{}),
  },{signal,headers:{'Idempotency-Key':key}}),
};
