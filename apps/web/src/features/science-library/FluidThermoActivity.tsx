/** Shared plugin consumer boundary. Core adapter/lesson navigation belong to 1A. */
export {FluidThermoLab as FluidThermoActivity} from '../../../../studio/plugins/fluid-thermo/FluidThermoLab';
export type {FluidThermoLabProps as FluidThermoActivityProps} from '../../../../studio/plugins/fluid-thermo/FluidThermoLab';
export {newLabSnapshot,validateSnapshot,validateConfiguration,importLabSnapshot,exportLabSnapshot} from '../../../../studio/plugins/fluid-thermo/snapshot';
export {labDefinitions,getLab,defaultParameters} from '../../../../studio/plugins/fluid-thermo/definitions';
export type {LabId,LabConfiguration,LabSnapshot,LabInteraction} from '../../../../studio/plugins/fluid-thermo/types';
