import { circuitSummary } from "../features/circuit-lab/resourceSummary";
import type { StudyResource } from "../api";
import { scienceSummary } from "../features/science-library/resourceSummary";

export type LessonPassageDescriptor = {
  schema: "ardesia.lesson-passage.v1";
  workspaceId: "local-default";
  lessonId: string;
  sessionId: string;
  recordingId: string;
  startEpoch: number;
  endEpoch: number;
  sha256: string;
  objectRefs: { elementId: string; version: number; label: string }[];
  replayUrl: string;
};
export type LessonPassage = {
  schema: "ardesia.lesson-passage-source.v1";
  descriptor: LessonPassageDescriptor;
  transcript: string;
};

/** Untrusted JSON is a declared reference, never evidence that local media exists. */
export function readPassageDescriptor(text: string): LessonPassageDescriptor | null {
  try {
    const d = JSON.parse(text) as LessonPassageDescriptor;
    if (!d || typeof d !== "object" || Array.isArray(d) ||
        Object.keys(d).sort().join() !== ["schema", "workspaceId", "lessonId", "sessionId", "recordingId", "startEpoch", "endEpoch", "sha256", "objectRefs", "replayUrl"].sort().join() ||
        d.schema !== "ardesia.lesson-passage.v1" || d.workspaceId !== "local-default" ||
        ![d.lessonId, d.sessionId, d.recordingId].every(v => typeof v === "string" && v.length > 0 && v.length <= 128) ||
        ![d.startEpoch, d.endEpoch].every(v => Number.isSafeInteger(v) && v >= 0) || d.endEpoch < d.startEpoch ||
        typeof d.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(d.sha256) ||
        !Array.isArray(d.objectRefs) || !d.objectRefs.length || d.objectRefs.length > 20 ||
        !d.objectRefs.every(ref => ref && Object.keys(ref).sort().join() === ["elementId", "version", "label"].sort().join() &&
          typeof ref.elementId === "string" && ref.elementId.length > 0 && ref.elementId.length <= 128 &&
          Number.isInteger(ref.version) && ref.version >= 1 && typeof ref.label === "string" && ref.label.length > 0 && ref.label.length <= 500) ||
        typeof d.replayUrl !== "string" || d.replayUrl.length > 2000) return null;
    const url = new URL(d.replayUrl);
    const pinMatches = (name: string, value: string) => {
      const values = url.searchParams.getAll(name);
      return values.length === 1 && values[0] === value;
    };
    if (!["http:", "https:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
        url.username || url.password || !["/", "/studio/"].includes(url.pathname) ||
        !pinMatches("vista", "replay") ||
        url.searchParams.getAll("at").length !== 1 || !/^\d+$/.test(url.searchParams.get("at") ?? "") ||
        Number(url.searchParams.get("at")) < d.startEpoch || Number(url.searchParams.get("at")) > d.endEpoch ||
        !pinMatches("recording", d.recordingId) ||
        !pinMatches("object", d.objectRefs[0].elementId) ||
        !pinMatches("session", d.sessionId) ||
        !pinMatches("sha", d.sha256) ||
        !pinMatches("objectVersion", String(d.objectRefs[0].version)) ||
        decodeURIComponent(url.hash.slice(1)) !== d.lessonId) return null;
    return d;
  } catch { return null; }
}

export function readLessonPassage(resource: StudyResource): LessonPassage | null {
  if (resource.kind !== "lesson-passage" || resource.visibility !== "group") return null;
  try {
    const p = JSON.parse(resource.text) as LessonPassage;
    if (p.schema !== "ardesia.lesson-passage-source.v1" ||
        Object.keys(p).sort().join() !== ["schema", "descriptor", "transcript"].sort().join() ||
        typeof p.transcript !== "string" || !p.transcript.trim() || p.transcript.length > 8000) return null;
    return readPassageDescriptor(JSON.stringify(p.descriptor)) ? p : null;
  } catch { return null; }
}

/** A display projection: never changes source bytes, revisions or selection offsets. */
export function displaySourceTitle(resource: StudyResource, limit = 85): string {
  if (resource.kind === "s19-circuit") {
    const source = circuitSummary(resource);
    return (source ? `Circuito DC · ${source.quantity === "voltage" ? "tensione" : "corrente"} su ${source.target}` : "Circuito DC non leggibile").slice(0, limit);
  }
  if (resource.kind === "science-resource") {
    const summary=scienceSummary(resource);
    return ("Esperimento scientifico"+(summary?" · "+(summary.note.trim().split("\n")[0]||summary.capabilityId):" non leggibile")).slice(0,limit);
  }
  const passage = readLessonPassage(resource);
  if (passage) {
    const title = passage.descriptor.objectRefs.map(ref => ref.label).join(" · ");
    return title.slice(0, limit) || "Passaggio della lezione";
  }
  if (resource.kind === "lesson-passage") return "Passaggio della lezione non leggibile";
  return resource.text.split("\n")[0].slice(0, limit) || "Originale della consegna";
}
