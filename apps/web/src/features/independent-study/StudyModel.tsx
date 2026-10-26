/** Projection of canonical model outputs; no scientific formula lives here. */
import {ScientificElectricalModel,type ElectricalResult} from '../../components/ScientificElectricalModel';
import {ScientificWaveModel,type WaveResult} from '../../components/ScientificWaveModel';
import {ScientificKinematicsModel,type KinematicsResult} from '../../components/ScientificKinematicsModel';
import {PublicSpringModel,type SpringResult} from '../../components/PublicSpringModel';
import {TaylorPlot,readTaylorResult} from '../../components/TaylorPlot';
import type {StudyState} from './types';
export function StudyModel({simulation}:{simulation:NonNullable<StudyState['simulation']>}){
 const result=simulation.result;if(!result)return null;
 if(simulation.activityId==='dc-resistance-v1')return <ScientificElectricalModel result={result as unknown as ElectricalResult}/>;
 if(simulation.activityId==='harmonic-wave-v1')return <ScientificWaveModel result={result as unknown as WaveResult}/>;
 if(simulation.activityId==='kinematics-v1')return <ScientificKinematicsModel result={result as unknown as KinematicsResult}/>;
 if(simulation.activityId==='hooke-v1')return <PublicSpringModel force={Number(simulation.parameters.force)} maxExtension={Math.max(result.value,.5)} result={result as unknown as SpringResult} points={[{force:Number(simulation.parameters.force),extension:result.value}]}/>;
 if(simulation.activityId==='taylor-exp-v1'){
  const p={x:Number(simulation.parameters.x),degree:Number(simulation.parameters.degree)};
  return <TaylorPlot result={readTaylorResult(result,p)} x={p.x}/>;
 }
 return <p>Confronta il risultato prima e dopo la variazione dei parametri, mantenendo esplicite le condizioni del modello.</p>;
}
