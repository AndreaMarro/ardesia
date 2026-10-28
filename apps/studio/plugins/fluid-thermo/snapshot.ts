import { defaultParameters, getLab } from './definitions';
import { evaluateLab } from './models';
import type { ExactRef, LabConfiguration, LabId, LabSnapshot } from './types';

export const PLUGIN_ID = 'io.ardesia.fluid-thermo' as const;
export const PLUGIN_VERSION = '1.0.0' as const;
const object = (value:unknown):value is Record<string,unknown> => !!value && typeof value==='object' && !Array.isArray(value);
function keys(value:Record<string,unknown>,required:string[],optional:string[]=[]){
  if(required.some(k=>!Object.hasOwn(value,k)) || Object.keys(value).some(k=>!required.includes(k)&&!optional.includes(k))) throw Error('Configurazione non riconosciuta.');
}
function exactRef(value:unknown):ExactRef{
  if(!object(value))throw Error('Riferimento non valido.');
  keys(value,['id','version','sha256']);
  if(typeof value.id!=='string'||!value.id||value.id.length>128||!Number.isSafeInteger(value.version)||(value.version as number)<1||typeof value.sha256!=='string'||!/^[a-f0-9]{64}$/.test(value.sha256)) throw Error('Riferimento non valido.');
  return {...value} as ExactRef;
}
export function validateConfiguration(value:unknown):LabConfiguration{
  if(!object(value))throw Error('Configurazione non valida.');
  keys(value,['schemaVersion','modelId','modelVersion','parameters'],['lessonRef','exerciseRef','sourceRefs']);
  if(value.schemaVersion!==1||value.modelVersion!==1||typeof value.modelId!=='string')throw Error('Versione del modello non disponibile. La configurazione originale resta conservata.');
  getLab(value.modelId as LabId);
  if(!object(value.parameters))throw Error('Parametri non validi.');
  evaluateLab(value.modelId as LabId,value.parameters as Record<string,number>);
  const result:LabConfiguration={schemaVersion:1,modelId:value.modelId as LabId,modelVersion:1,parameters:{...value.parameters} as Record<string,number>};
  if(value.lessonRef!==undefined)result.lessonRef=exactRef(value.lessonRef);
  if(value.exerciseRef!==undefined)result.exerciseRef=exactRef(value.exerciseRef);
  if(value.sourceRefs!==undefined){
    if(!Array.isArray(value.sourceRefs)||value.sourceRefs.length>20)throw Error('Fonti non valide.');
    result.sourceRefs=value.sourceRefs.map(r=>{
      if(!object(r))throw Error('Fonte non valida.');keys(r,['resourceId','revisionId']);
      if([r.resourceId,r.revisionId].some(v=>typeof v!=='string'||!v||v.length>128))throw Error('Fonte non valida.');
      return {resourceId:r.resourceId as string,revisionId:r.revisionId as string};
    });
  }
  return result;
}
export function newLabSnapshot(modelId:LabId='hydrostatic',configuration?:LabConfiguration):LabSnapshot{
  return {schema:'ardesia.fluid-thermo.snapshot/1',pluginId:PLUGIN_ID,pluginVersion:PLUGIN_VERSION,
    configuration:validateConfiguration(configuration??{schemaVersion:1,modelId,modelVersion:1,parameters:defaultParameters(modelId)}),
    prediction:'',note:'',supportUsed:[],view:'2d'};
}
export function validateSnapshot(value:unknown):LabSnapshot{
  if(!object(value))throw Error('Snapshot non valido.');
  keys(value,['schema','pluginId','pluginVersion','configuration','prediction','note','supportUsed','view']);
  if(value.schema!=='ardesia.fluid-thermo.snapshot/1'||value.pluginId!==PLUGIN_ID||value.pluginVersion!==PLUGIN_VERSION)throw Error('Versione del plugin non disponibile. Il file originale non viene modificato.');
  if(typeof value.prediction!=='string'||value.prediction.length>200||typeof value.note!=='string'||value.note.length>4000||/[\u0000]/.test(value.prediction+value.note))throw Error('Testo dello snapshot non valido.');
  if(!Array.isArray(value.supportUsed)||value.supportUsed.length>2||new Set(value.supportUsed).size!==value.supportUsed.length||value.supportUsed.some(v=>v!=='model'&&v!=='hint')||!['2d','3d'].includes(value.view as string))throw Error('Stato dello snapshot non valido.');
  const result={...value,configuration:validateConfiguration(value.configuration),supportUsed:[...value.supportUsed]} as LabSnapshot;
  if(result.view==='3d'&&!getLab(result.configuration.modelId).threeD)throw Error('Questo modello offre la vista 2D.');
  return result;
}
export function importLabSnapshot(text:string):LabSnapshot{
  if(typeof text!=='string'||text.length>20000)throw Error('Il file supera il limite di 20.000 caratteri.');
  return validateSnapshot(JSON.parse(text));
}
export const exportLabSnapshot=(snapshot:LabSnapshot)=>JSON.stringify(validateSnapshot(snapshot),null,2);
