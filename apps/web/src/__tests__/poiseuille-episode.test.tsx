// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Classroom } from "../features/Classroom";
import type { Workspace } from "../api";
import { PoiseuilleEpisode } from "../components/PoiseuilleEpisode";
import { readPassageDescriptor } from "../components/lessonPassageReference";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const me = { id: "synthetic-student", role: "student" as const, synthetic: true as const };
const data: Workspace = {
  edition: { id: "fluidi", teacherId: "synthetic-tutor", state: "collecting", capacity: 10,
    priceMinor: 0, sessions: [], timezone: "Europe/Rome", packId: "relazioni-fluidi-v1", packVersion: 1,
    entryActivityId: "poiseuille-v1" }, enrolled: true, resources: [], submissions: [], layouts: [],
  layoutSaved: false, layoutVersion: "a".repeat(64),
};
const experience = {
  id: "poiseuille-boundary-v1", title: "Il vincolo cambia il risultato", objective: "Distingui pressione e portata fissata",
  steps: [
    { id: "fixed-pressure", title: "Raggio doppio, pressione fissata", prompt: "Raddoppia il raggio a Δp fissata.", activityId: "poiseuille-v1", parameters: {radiusRatio: 2, boundary: "pressure"}, exerciseRef: "RF-06" },
    { id: "fixed-flow", title: "Raggio doppio, portata fissata", prompt: "Raddoppia il raggio a Q fissata.", activityId: "poiseuille-v1", parameters: {radiusRatio: 2, boundary: "flow"} },
    { id: "transfer", title: "Un problema diverso", prompt: "Dimezza il raggio a Q fissata.", activityId: "poiseuille-v1", parameters: {radiusRatio: .5, boundary: "flow"}, exerciseRef: "RF-04" },
  ],
};

test("ordinary classroom records a prediction before revealing the model and offers constraint recovery", async () => {
  let submitted: Record<string, unknown> | undefined;
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    if (path.includes("learning-experiences")) return new Response(JSON.stringify({ experiences: [experience] }));
    if (path.endsWith("/submissions")) {
      submitted = JSON.parse(init!.body as string);
      return new Response(JSON.stringify({receiptId: "synthetic-receipt", submissionId: "synthetic-submission", revision: 1,
        activityEvidence: {...submitted!.activityEvidence as object,
          result: { ratio: 16, fixedQuantity: "pressure", calculatedVariable: "Q/Q0" },
          check: {ratioMatches: false, constraintMatches: false}, assistance: "NO_SUPPORT_REQUESTED"}}));
    }
    throw new Error("Unexpected request " + path);
  }));
  render(<Classroom me={me} data={data} onUpdate={async () => {}} />);
  fireEvent.click(screen.getByRole("button", {name: "Apri episodio guidato"}));
  await screen.findByRole("heading", { name: "Il vincolo cambia il risultato" });
  expect(screen.queryByTestId("episode-ratio")).toBeNull();
  const save = screen.getByRole("button", { name: "Registra previsione e confronta" });
  expect((save as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.change(screen.getByLabelText("Grandezza che resta fissata"), {target: {value: "flow"}});
  fireEvent.change(screen.getByLabelText("Spiega il vincolo e il procedimento"), {target: {value: "La portata è fissata e il raggio aumenta."}});
  fireEvent.click(save);
  expect(await screen.findByTestId("episode-ratio")).toBeTruthy();
  expect(submitted?.activityParameters).toEqual({radiusRatio: 2, boundary: "pressure"});
  expect(submitted?.activityEvidence).toMatchObject({prediction: {ratio: 4, fixedQuantity: "flow"}, supportUsed: []});
  expect(screen.getByText(/Hai scambiato il vincolo/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", {name: "Recupera il passaggio della lezione"}));
  expect(screen.getByText(/Il tutor non ha ancora collegato/)).toBeTruthy();
});

const descriptor = {
  schema: "ardesia.lesson-passage.v1", workspaceId: "local-default", lessonId: "synthetic-room",
  sessionId: "synthetic-session", recordingId: "synthetic-recording", startEpoch: 1000, endEpoch: 2000,
  sha256: "a".repeat(64), objectRefs: [{elementId: "synthetic-formula", version: 2, label: "Il vincolo è Q"}],
  replayUrl: "http://127.0.0.1:5173/?vista=replay&at=2000&recording=synthetic-recording&object=synthetic-formula&session=synthetic-session&sha=" + "a".repeat(64) + "&objectVersion=2#synthetic-room",
};
const passage = {id: "synthetic-passage", revisionId: "exact-revision", contextId: "synthetic-context",
  ownerId: "synthetic-tutor", editionId: "fluidi", visibility: "group" as const, kind: "lesson-passage", sha256: "b".repeat(64),
  text: JSON.stringify({schema: "ardesia.lesson-passage-source.v1", descriptor,
    transcript: "Qui Q è costante: isola la pressione nella legge di Poiseuille."})};

test("three predictions retain exact lesson reference and a new problem requests no support by default", async () => {
  const submissions: Record<string, any>[] = [];
  const sourceReads: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    if (path.includes("learning-experiences")) return new Response(JSON.stringify({experiences: [experience]}));
    if (path.includes("/resources/")) { sourceReads.push(path); return new Response(JSON.stringify(passage)); }
    if (path.endsWith("/submissions")) {
      const payload = JSON.parse(init!.body as string);
      submissions.push(payload);
      return new Response(JSON.stringify({receiptId: "receipt-" + submissions.length, submissionId: "submission-" + submissions.length, revision: 1,
        activityEvidence: {...payload.activityEvidence,
          result: {ratio: [16, .0625, 16][submissions.length - 1], fixedQuantity: payload.activityParameters.boundary,
            calculatedVariable: payload.activityParameters.boundary === "flow" ? "Δp/Δp0" : "Q/Q0"},
          check: {ratioMatches: true, constraintMatches: true},
          assistance: payload.activityEvidence.supportUsed.length ? "SUPPORT_REQUESTED" : "NO_SUPPORT_REQUESTED"}}));
    }
    throw new Error("Unexpected request " + path);
  }));
  render(<PoiseuilleEpisode me={me} data={{...data, resources: [passage]}} onUpdate={async () => {}} />);
  await screen.findByRole("heading", {name: experience.title});
  fireEvent.click(screen.getByRole("button", {name: "Recupera il passaggio della lezione"}));
  const link = await screen.findByRole("link", {name: "Torna al passaggio nella lavagna"});
  expect(link.getAttribute("href")).toBe(descriptor.replayUrl);
  expect(sourceReads).toEqual(["/study/resources/synthetic-passage/revisions/exact-revision"]);
  for (const [index, ratio, boundary] of [[0, "16", "pressure"], [1, "0,0625", "flow"], [2, "16", "flow"]] as const) {
    expect(screen.queryByTestId("episode-ratio")).toBeNull();
    fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: ratio}});
    fireEvent.change(screen.getByLabelText("Grandezza che resta fissata"), {target: {value: boundary}});
    fireEvent.change(screen.getByLabelText("Spiega il vincolo e il procedimento"), {target: {value: "Il vincolo determina quale grandezza isolare nella relazione."}});
    fireEvent.click(screen.getByRole("button", {name: "Registra previsione e confronta"}));
    await screen.findByTestId("episode-ratio");
    expect(submissions[index].activityEvidence.lessonPassageRef).toEqual({resourceId: passage.id, revisionId: passage.revisionId});
    if (index < 2) fireEvent.click(screen.getByRole("button", {name: index === 0 ? "Cambia il vincolo" : "Affronta il problema diverso"}));
  }
  expect(submissions[0].activityEvidence.supportUsed).toEqual(["lesson-passage"]);
  expect(submissions[2].activityEvidence.supportUsed).toEqual([]);
  expect(submissions[2].activityParameters).toEqual({radiusRatio: .5, boundary: "flow"});
  expect(screen.getByText(/Episodio consegnato/)).toBeTruthy();
});

test("a failed acknowledgement hides the result and retries the immutable original prediction", async () => {
  const calls: {body: string; key: string}[] = [];
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    if (path.includes("learning-experiences")) return new Response(JSON.stringify({experiences: [experience]}));
    calls.push({body: init!.body as string, key: (init!.headers as Record<string, string>)["Idempotency-Key"]});
    if (calls.length === 1) return new Response(JSON.stringify({error: "offline"}), {status: 503});
    const payload = JSON.parse(calls[0].body);
    return new Response(JSON.stringify({receiptId: "ack", submissionId: "received", revision: 1,
      activityEvidence: {...payload.activityEvidence, assistance: "NO_SUPPORT_REQUESTED",
        result: {ratio: 16, fixedQuantity: "pressure", calculatedVariable: "Q/Q0"}, check: {ratioMatches: true, constraintMatches: true}}}));
  }));
  render(<PoiseuilleEpisode me={me} data={data} onUpdate={async () => {}} />);
  await screen.findByRole("heading", {name: experience.title});
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "16"}});
  fireEvent.change(screen.getByLabelText("Grandezza che resta fissata"), {target: {value: "pressure"}});
  fireEvent.change(screen.getByLabelText("Spiega il vincolo e il procedimento"), {target: {value: "Uso la quarta potenza mantenendo la pressione costante."}});
  fireEvent.click(screen.getByRole("button", {name: "Registra previsione e confronta"}));
  await screen.findByText(/Consegna non confermata/);
  expect(screen.queryByTestId("episode-ratio")).toBeNull();
  expect((screen.getByLabelText("Rapporto previsto") as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", {name: "Un aiuto sul vincolo"}));
  fireEvent.click(screen.getByRole("button", {name: "Registra previsione e confronta"}));
  await screen.findByTestId("episode-ratio");
  expect(calls[1]).toEqual(calls[0]);
});

test("declared passage accepts the last visual instant and rejects mismatched reference pins", () => {
  expect(readPassageDescriptor(JSON.stringify(descriptor))).not.toBeNull();
  for (const changes of [{sessionId: "other"}, {sha256: "b".repeat(64)}, {replayUrl: descriptor.replayUrl.replace("at=2000", "at=2001")},
    {objectRefs: [{...descriptor.objectRefs[0], version: 3}]}, {replayUrl: "javascript:alert(1)"}]) {
    expect(readPassageDescriptor(JSON.stringify({...descriptor, ...changes}))).toBeNull();
  }
});

test.each(["recording", "session", "object"])("declared passage rejects duplicate %s pins even when their joined text matches an ID", pin => {
  const changed = structuredClone(descriptor);
  if (pin === "recording") changed.recordingId = "a,b";
  if (pin === "session") changed.sessionId = "a,b";
  if (pin === "object") changed.objectRefs[0].elementId = "a,b";
  const replay = new URL(changed.replayUrl);
  replay.searchParams.delete(pin); replay.searchParams.append(pin, "a"); replay.searchParams.append(pin, "b");
  changed.replayUrl = replay.href;
  expect(readPassageDescriptor(JSON.stringify(changed))).toBeNull();
  replay.searchParams.set(pin, "a,b"); changed.replayUrl = replay.href;
  expect(readPassageDescriptor(JSON.stringify(changed))).not.toBeNull();
});

test("the revised transfer uses the Core visual values and never the ordinary fixed-material graph", async () => {
  const transfer = {id: "transfer", title: "Due fattori diversi", prompt: "Il raggio resta uguale; viscosità e lunghezza raddoppiano a Q fissata.",
    activityId: "poiseuille-v1", parameters: {radiusRatio: 1, boundary: "flow", viscosity: 2, length: 2}};
  vi.stubGlobal("fetch", vi.fn(async (path: string) => {
    if (path.includes("learning-experiences")) return new Response(JSON.stringify({experiences: [{...experience, id: "poiseuille-boundary-v2", steps: [transfer]}]}));
    if (path.endsWith("/submissions")) return new Response(JSON.stringify({receiptId: "r1-receipt", submissionId: "r1-submission", revision: 1,
      activityEvidence: {result: {ratio: 4, fixedQuantity: "flow", calculatedVariable: "Δp/Δp0",
        visual: {flowRatio: 1, pressureRatio: 4, meanSpeedRatio: 1}}, check: {ratioMatches: true, constraintMatches: true}, assistance: "NO_SUPPORT_REQUESTED"}}));
    return new Response(JSON.stringify({resources: []}));
  }));
  render(<PoiseuilleEpisode data={data} me={me} onUpdate={async () => {}} />);
  fireEvent.change(await screen.findByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.change(screen.getByLabelText("Grandezza che resta fissata"), {target: {value: "flow"}});
  fireEvent.change(screen.getByLabelText("Spiega il vincolo e il procedimento"), {target: {value: "A Q fissata la pressione è proporzionale al prodotto di viscosità e lunghezza: i due fattori si moltiplicano."}});
  expect(screen.queryByTestId("flow-measures")).toBeNull();
  fireEvent.click(screen.getByRole("button", {name: "Registra previsione e confronta"}));
  const measures = await screen.findByTestId("flow-measures");
  expect(measures.textContent).toContain("Δp/Δp₀ = 4");
  expect(measures.textContent).toContain("v/v₀ = 1");
  expect(screen.queryByRole("button", {name: "Guarda la relazione nel grafico"})).toBeNull();
  expect(screen.getAllByText(/η\/η₀ = 2/).length).toBeGreaterThan(0);
});
