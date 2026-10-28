import {describe,it,expect,vi} from 'vitest';
import {registerFluidThermoTool,createFluidThermoEmbed} from '../../plugins/fluid-thermo/register';
import {defaultParameters} from '../../plugins/fluid-thermo/definitions';
import {getSimulationTool} from '../toolhost/simulationPluginRegistry';
import {buildSimulationInsert,renderToolCanvasEmbeddable} from '../toolhost/ToolCanvasEmbeddable';
import {buildDefaultPluginWindowCatalog,createPluginWindowInsertRequest,pluginMountedEventFromInsertRequest} from '../design/pluginWindowCatalog';
import {EMBED_DATA_KEY} from '../toolhost/caps/board';
const id='io.ardesia.fluid-thermo';
describe('scientific tool in the existing Studio host',()=>{
 it('discovers, inserts independent instances and reopens the exact saved state',()=>{
  registerFluidThermoTool();const item=buildDefaultPluginWindowCatalog().find(p=>p.pluginId===id)!;
  expect(item.availability).toBe('available');const first=buildSimulationInsert([],id)!;
  const second=buildSimulationInsert([first.embed],id)!;expect(second.embedId).not.toBe(first.embedId);
  const parameters={...defaultParameters('hydrostatic'),depth:2};
  const embed=createFluidThermoEmbed(first.embedId,{schemaVersion:1,modelId:'hydrostatic',modelVersion:1,parameters});
  const cold=JSON.parse(JSON.stringify(embed));const write=vi.fn();
  const rendered=renderToolCanvasEmbeddable(cold,{persistEmbedState:write})!;
  const props=rendered.props as {initialSnapshot:{configuration:{parameters:unknown}};onSnapshotChange:(v:unknown)=>void};
  expect(props.initialSnapshot.configuration.parameters).toEqual(parameters);
  props.onSnapshotChange({...props.initialSnapshot,note:'Cambio una grandezza alla volta.'});
  expect(write).toHaveBeenCalledWith(first.embedId,expect.objectContaining({note:'Cambio una grandezza alla volta.'}),id);
  expect((second.embed.customData as any)[EMBED_DATA_KEY].state.note).toBe('');
  const event=pluginMountedEventFromInsertRequest(createPluginWindowInsertRequest(item),{instanceId:first.embedId,elementId:first.embedId,t:10});
  expect(event.kind).toBe('plugin.mounted');if(event.kind!=='plugin.mounted')throw Error('unexpected event');expect(event.pluginId).toBe(id);expect(getSimulationTool(id)?.solve).toBeUndefined();
 });
});
