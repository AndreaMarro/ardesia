/** Analytical lab data. Rendering never supplies authoritative assessment. */
export type LabId = 'manometer'|'hydrostatic'|'pascal'|'buoyancy'|'continuity'|'venturi'|'poiseuille'|'hydraulic-network'|'capillary'|'ideal-gas'|'calorimetry'|'phase-change'|'heat-transfer'|'process'|'carnot'|'entropy';
export type Parameters = Record<string, number>;
export type Parameter = { key:string; label:string; unit:string; min:number; max:number; step:number; default:number };
export type Measurement = { key:string; label:string; unit:string; value:number };
export type Series = { label:string; unit:string; xUnit:string; points:[number,number][] };
export type LabResult = { primary:Measurement; measurements:Measurement[]; series:Series[]; warnings:string[] };
export type LabDefinition = { id:LabId; capabilityId:string; title:string; objectiveIds:string[]; objective:string; prediction:string;
  formula:string; assumptions:string[]; parameters:Parameter[]; presets:{id:string;title:string;parameters:Parameters}[];
  threeD:boolean; provenance:{source:string;license:string;kind:'ORIGINAL'|'BEHAVIORAL_INSPIRATION'}[] };
export type ExactRef = { id:string;version:number;sha256:string };
export type LabConfiguration = { schemaVersion:1; modelId:LabId; modelVersion:1; parameters:Parameters;
  lessonRef?:ExactRef; exerciseRef?:ExactRef; sourceRefs?:{resourceId:string;revisionId:string}[] };
export type LabSnapshot = { schema:'ardesia.fluid-thermo.snapshot/1';pluginId:'io.ardesia.fluid-thermo';pluginVersion:'1.0.0';
  configuration:LabConfiguration; prediction:string; note:string; supportUsed:('model'|'hint')[]; view:'2d'|'3d' };
export type LabInteraction = { type:'prediction'|'parameters'|'compare'|'reset'|'preset'|'support'; modelId:LabId; parameters:Parameters; prediction:string; supportUsed:('model'|'hint')[] };
