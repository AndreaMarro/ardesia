import {registerSimulationTool,type ToolEmbedLike} from '../../src/toolhost/simulationPluginRegistry';
import {EMBED_DATA_KEY} from '../../src/toolhost/caps/board';
import {FluidThermoLab} from './FluidThermoLab';
import {exportLabSnapshot,importLabSnapshot,newLabSnapshot,PLUGIN_ID,validateSnapshot} from './snapshot';
import type {LabConfiguration} from './types';

export function createFluidThermoEmbed(embedId='fluid-thermo-lab',configuration?:LabConfiguration){
  const snapshot=newLabSnapshot(configuration?.modelId,configuration);
  return {id:embedId,type:'embeddable',x:100,y:100,width:960,height:740,angle:0,
    strokeColor:'#263b41',backgroundColor:'transparent',fillStyle:'solid',strokeWidth:1,strokeStyle:'solid',roughness:0,opacity:100,
    groupIds:[],frameId:null,index:null,roundness:null,seed:1,version:1,versionNonce:1,isDeleted:false,boundElements:null,updated:0,locked:false,
    link:`maestro-tool://${PLUGIN_ID}/${embedId}`,customData:{[EMBED_DATA_KEY]:{owner:PLUGIN_ID,state:snapshot}}};
}
function stored(element:ToolEmbedLike):unknown{
  const marker=element.customData?.[EMBED_DATA_KEY];
  return marker&&typeof marker==='object'?'state' in marker?marker.state:undefined:undefined;
}
/** Called by the existing host bootstrap. Never installs itself implicitly. */
export function registerFluidThermoTool(){
  registerSimulationTool(PLUGIN_ID,{embedId:'fluid-thermo-lab',createEmbed:createFluidThermoEmbed,
    validate(value){try{validateSnapshot(value);return {ok:true,errors:[]};}catch(error){return {ok:false,errors:[error instanceof Error?error.message:'Snapshot non valido.']};}},
    render(element,link,host){
      return <FluidThermoLab authoringTools allowModelSelection initialSnapshot={stored(element)??newLabSnapshot()} onSnapshotChange={snapshot=>host?.persistEmbedState?.(link.embedId,snapshot,PLUGIN_ID)}/>;
    }});
}
export {exportLabSnapshot,importLabSnapshot};
