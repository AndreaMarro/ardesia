import { publicPreviewData } from "./generated/publicPreviewData";

export const publicCourse = publicPreviewData.course;
export const publicRadius = publicPreviewData.radius;
export const publicCaseCount = publicPreviewData.cases.length;
export const publicLessonDemo = publicPreviewData.lessonDemo;
export const publicTransferCase = publicPreviewData.transferCase;
export const publicActivityDomain = publicPreviewData.cases[0].result.domain;
export const publicSpring = publicPreviewData.spring;
export const publicDemonstration = publicPreviewData.demonstration;

/** Public configuration lookup is exact. Physical values are produced only by Core. */
export function publicSpringCase(force: number, stiffness: number) {
  const state = publicSpring.cases.find(entry => entry.parameters.force === force && entry.parameters.stiffness === stiffness);
  if (!state) throw new Error("Configurazione non disponibile in questa demo.");
  return state;
}

export function publicSpringGraph(stiffness: number) {
  return publicSpring.cases.filter(entry => entry.parameters.stiffness === stiffness)
    .map(entry => ({force: entry.parameters.force, extension: entry.result.value}));
}

function publicCase(radiusRatio: number, boundary: string, scenario?: string) {
  if (scenario !== undefined) {
    if (scenario !== publicTransferCase.id || radiusRatio !== publicTransferCase.parameters.radiusRatio || boundary !== publicTransferCase.parameters.boundary)
      throw new Error("Configurazione non disponibile in questa anteprima.");
    return publicTransferCase;
  }
  const state = publicPreviewData.cases.find(entry => entry.parameters.radiusRatio === radiusRatio && entry.parameters.boundary === boundary);
  if (!state) throw new Error("Configurazione non disponibile in questa anteprima.");
  return state;
}
export function publicVisualState(radiusRatio: number, boundary: string, scenario?: string) {
  return publicCase(radiusRatio, boundary, scenario).visual;
}
export function publicGraphSeries(boundary: string) {
  return publicPreviewData.cases.filter(entry => entry.parameters.boundary === boundary)
    .map(entry => ({radius: entry.parameters.radiusRatio, ratio: entry.result.ratio}));
}

/** Exact lookup of Core results: never interpolate or accept unsupported inputs. */
export function publicActivityResult(radiusRatio: number, boundary: string, scenario?: string) {
  return publicCase(radiusRatio, boundary, scenario).result;
}
