import { publicPreviewData } from "./generated/publicPreviewData";

export const publicCourse = publicPreviewData.course;
export const publicRadius = publicPreviewData.radius;
export const publicCaseCount = publicPreviewData.cases.length;

/** Exact lookup of Core results: never interpolate or accept unsupported inputs. */
export function publicActivityResult(radiusRatio: number, boundary: string) {
  const entry = publicPreviewData.cases.find(
    ({ parameters }) =>
      parameters.radiusRatio === radiusRatio && parameters.boundary === boundary,
  );
  if (!entry) throw new Error("Configurazione non disponibile in questa anteprima.");
  return entry.result;
}
