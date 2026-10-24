import { publicPreviewData } from "./generated/publicPreviewData";

export const publicCourse = publicPreviewData.course;
export const publicRadius = publicPreviewData.radius;
export const publicCaseCount = publicPreviewData.cases.length;
export const publicLessonDemo = publicPreviewData.lessonDemo;
export function publicVisualState(radiusRatio: number, boundary: string) {
  const state = publicPreviewData.cases.find(entry => entry.parameters.radiusRatio === radiusRatio && entry.parameters.boundary === boundary);
  if (!state) throw new Error("Configurazione non disponibile in questa anteprima.");
  return state.visual;
}
export function publicGraphSeries(boundary: string) {
  return publicPreviewData.cases.filter(entry => entry.parameters.boundary === boundary)
    .map(entry => ({radius: entry.parameters.radiusRatio, ratio: entry.result.ratio}));
}

/** Exact lookup of Core results: never interpolate or accept unsupported inputs. */
export function publicActivityResult(radiusRatio: number, boundary: string) {
  const entry = publicPreviewData.cases.find(
    ({ parameters }) =>
      parameters.radiusRatio === radiusRatio && parameters.boundary === boundary,
  );
  if (!entry) throw new Error("Configurazione non disponibile in questa anteprima.");
  return entry.result;
}
