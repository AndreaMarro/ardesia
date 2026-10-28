import {getLab} from './definitions';
import type {LabDefinition,LabResult,Parameters} from './types';

/** A linear volume projection, shared by the procedural and S16 pistons.
 * Scene units are normalized; this does not add another physical evaluator. */
export function pistonGeometry(definition:LabDefinition,parameters:Parameters,result:LabResult){
  const process=definition.id==='process',key=process?'volume1':'volume';
  const reference=getLab(definition.id).parameters.find(p=>p.key===key)!.default;
  const volume=process?result.measurements.find(m=>m.key==='finalVolume')!.value:parameters.volume;
  const height=1.2*volume/reference,floorY=-.8;
  const assetScale=25,assetFloor=.003,assetTranslation=assetFloor+height/assetScale;
  return {height,floorY,pistonY:floorY+height,assetScale,assetOffsetY:floorY-assetFloor*assetScale,
    assetTranslation,useS16:assetTranslation>=.012&&assetTranslation<=.082};
}
export const PIPE_ROTATION_Z=-Math.PI/2;
