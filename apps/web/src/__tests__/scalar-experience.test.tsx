// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {ScalarExperienceEpisode} from "../components/ScalarExperienceEpisode";
import {PredictionEvidence} from "../components/PredictionEvidence";
import type {ActivityEvidenceV2, ComposableExperience} from "../components/experienceTypes";
import type {StudyMe, Workspace} from "../api";

afterEach(() => {cleanup(); vi.unstubAllGlobals();});
const experience: ComposableExperience = {
  compositionVersion: 1, id: "hydrostatic-reference-v1", version: 1,
  experienceRef: {id: "hydrostatic-reference-v1", version: 1, sha256: "a".repeat(64)},
  coursePackRef: {packId: "relazioni-fluidi-v1", packVersion: 1, packSha256: "b".repeat(64)},
  title: "La pressione rispetto a quale riferimento?", objective: "Distingui due riferimenti.",
  editorialStatus: "DRAFT", scientificApproval: "NOT_ATTESTED",
  steps: [{id: "relative", title: "Pressione dovuta alla profondità", prompt: "Prevedi la pressione relativa a2m.", activityId: "hydrostatic-v1", activityVersion: 1,
    parameters: {density: 1000, depth: 2, surfacePressure: 101325, g: 9.81, reference: "gauge"}, prediction: {kind: "scalar", unit: "Pa"},
    phases: ["situation", "prediction", "model", "visual", "explanation", "source"], hints: ["Individua lo zero alla superficie.", "Separa i due contributi alla pressione."], advanceWhen: "receipt-confirmed"},
    {id: "absolute", title: "Stesso punto, pressione assoluta", prompt: "Cambia il riferimento.", activityId: "hydrostatic-v1", activityVersion: 1,
      parameters: {density: 1000, depth: 2, surfacePressure: 101325, g: 9.81, reference: "absolute"}, prediction: {kind: "scalar", unit: "Pa"},
      phases: ["situation", "prediction", "model", "visual", "explanation", "source"], hints: [], advanceWhen: "receipt-confirmed"}],
};
const me = {id: "student", role: "student", synthetic: true} as StudyMe;
const data = {edition: {id: "fluidi", ...experience.coursePackRef}, resources: []} as unknown as Workspace;
function evidence(): ActivityEvidenceV2 {
  return {schemaVersion: 2, experienceRef: experience.experienceRef, stepId: "relative", prediction: {kind: "scalar", value: 2000, unit: "Pa"},
    supportUsed: ["constraint-hint"], assistance: "SUPPORT_REQUESTED", assistanceScope: "Client and previous receipts",
    result: {kind: "scalar", activityId: "hydrostatic-v1", version: 1, value: 19620, unit: "Pa", calculatedVariable: "Pressione relativa", fixedQuantity: "rho,g", domain: "Liquido fermo", editorialStatus: "DRAFT", numericalCheck: "deterministic"},
    check: {kind: "scalar", valueMatches: false, unitMatches: true}};
}

test("composable scalar prediction is pinned and receipt gated; failed transport retries the same body/key without losing the written context", async () => {
  const calls: {path: string; body: any; key: string | null}[] = [];
  let sends = 0;
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({path, body, key: new Headers(init?.headers).get("Idempotency-Key")});
    if (path.includes("learning-experiences")) return new Response(JSON.stringify({schemaVersion: 2, experiences: [experience]}));
    sends++;
    if (sends === 1) return new Response(JSON.stringify({error: "server_busy"}), {status: 503});
    return new Response(JSON.stringify({receiptId: "receipt-scalar", submissionId: "submission-scalar", revision: 1, activityEvidence: evidence()}));
  }));
  render(<ScalarExperienceEpisode me={me} data={data} onUpdate={async () => {throw new Error("Workspace temporarily unavailable");}} />);
  await screen.findByRole("heading", {name: "Pressione dovuta alla profondità"});
  expect(calls[0].path).toContain("format=composable");
  expect(screen.queryByTestId("scalar-episode-result")).toBeNull();
  expect(screen.queryByRole("button", {name: "Prosegui al prossimo problema"})).toBeNull();
  const prediction = screen.getByLabelText("Pressione prevista in Pa");
  const procedure = screen.getByLabelText("Spiega il riferimento e il procedimento");
  fireEvent.change(prediction, {target: {value: "2000"}});
  fireEvent.change(procedure, {target: {value: "Uso la superficie come zero; il mio procedimento originale."}});
  fireEvent.click(screen.getByRole("button", {name: "Un indizio sul riferimento"}));
  expect((prediction as HTMLInputElement).value).toBe("2000");
  expect(calls.filter(c => c.path.endsWith("/submissions"))).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", {name: "Registra previsione e confronta"}));
  await screen.findByRole("alert");
  expect(screen.queryByTestId("scalar-episode-result")).toBeNull();
  expect((prediction as HTMLInputElement).disabled).toBe(true);
  expect((procedure as HTMLTextAreaElement).value).toContain("procedimento originale");
  fireEvent.click(screen.getByRole("button", {name: "Riprova lo stesso invio"}));
  expect((await screen.findByTestId("scalar-episode-result")).textContent).toContain("19.620");
  const submissions = calls.filter(c => c.path.endsWith("/submissions"));
  expect(submissions).toHaveLength(2);
  expect(submissions[1]).toEqual(submissions[0]);
  expect(submissions[0].body.activityEvidence).toEqual({schemaVersion: 2, experienceRef: experience.experienceRef, stepId: "relative", prediction: {kind: "scalar", value: 2000, unit: "Pa"}, supportUsed: ["constraint-hint"]});
  expect(submissions[0].body.activityParameters).toEqual(experience.steps[0].parameters);
  await screen.findByText("Ricevuta confermata. Aggiorna le consegne per rileggerla.");
  fireEvent.click(screen.getByRole("button", {name: "Prosegui al prossimo problema"}));
  expect(document.activeElement).toBe(screen.getByRole("heading", {name: "Stesso punto, pressione assoluta"}));
  expect(screen.queryByTestId("scalar-episode-result")).toBeNull();
  expect((screen.getByLabelText("Pressione prevista in Pa") as HTMLInputElement).value).toBe("");
});

test("the tutor and student can reread scalar evidence without treating it as a Poiseuille ratio", () => {
  render(<PredictionEvidence value={evidence()} />);
  expect(screen.getByText(/Valore previsto/).textContent?.replaceAll(".", "")).toContain("2000 Pa");
  expect(screen.getByText(/Controllo numerico/).textContent).toContain("valore da rivedere");
  expect(screen.getByText(/Aiuto richiesto/)).toBeTruthy();
  expect(screen.getByText(/versione 1/)).toBeTruthy();
});

test("a manifest from a different CoursePack digest is unavailable rather than executed", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({experiences: [{...experience, coursePackRef: {...experience.coursePackRef, packSha256: "f".repeat(64)}}]}))));
  render(<ScalarExperienceEpisode me={me} data={data} onUpdate={async () => {}} />);
  await screen.findByText("Nessun percorso compatibile con questa versione del corso.");
  expect(screen.queryByLabelText("Pressione prevista in Pa")).toBeNull();
});

test("the last scalar hint retains keyboard focus and cannot reveal further hints", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({experiences: [experience]}))));
  render(<ScalarExperienceEpisode me={me} data={data} onUpdate={async () => {}} />);
  const trigger = await screen.findByRole("button", {name: "Un indizio sul riferimento"});
  trigger.focus(); fireEvent.click(trigger); fireEvent.click(trigger);
  expect((trigger as HTMLButtonElement).disabled).toBe(false);
  expect(trigger.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(trigger);
  fireEvent.click(trigger);
  expect(screen.getAllByText("Separa i due contributi alla pressione.")).toHaveLength(1);
});


// Cold reopens must use existing Core receipts rather than silently asking the
// student to submit the same already-accepted step again.
function storedStep(id: string, studentId: string, activityEvidence: ActivityEvidenceV2): Workspace["submissions"][number] {
  return {
    id, student_id: studentId, activity_id: "hydrostatic-v1", revision: 1,
    parent_id: null, text: "Saved prediction and procedure",
    asset_refs: [], source_refs: [], receipt_id: "receipt-" + id,
    state: "received", feedback: [], activityEvidence,
  };
}
function storedExperience(steps: Workspace["submissions"]): Workspace {
  return {...data, submissions: steps};
}
function stubComposition() {
  vi.stubGlobal("fetch", vi.fn(async (path: string) =>
    new Response(JSON.stringify(path.includes("learning-experiences") ? {schemaVersion: 2, experiences: [experience]} : {error: "unexpected_request"}))));
}

test("cold reopen resumes the first unsubmitted scalar step from exact Core receipt", async () => {
  stubComposition();
  render(<ScalarExperienceEpisode me={me}
    data={storedExperience([storedStep("first", me.id, evidence())])}
    onUpdate={async () => {}} />);
  await screen.findByRole("heading", {name: "Stesso punto, pressione assoluta"});
  expect(screen.queryByRole("heading", {name: "Pressione dovuta alla profondità"})).toBeNull();
  expect((screen.getByLabelText("Pressione prevista in Pa") as HTMLInputElement).value).toBe("");
});

test("cold reopen does not borrow a foreign student's receipt or a stale experience digest", async () => {
  stubComposition();
  const foreign = storedStep("foreign", "another-student", evidence());
  const stale = storedStep("stale", me.id, {
    ...evidence(), experienceRef: {...experience.experienceRef, sha256: "f".repeat(64)},
  });
  render(<ScalarExperienceEpisode me={me}
    data={storedExperience([foreign, stale])} onUpdate={async () => {}} />);
  await screen.findByRole("heading", {name: "Pressione dovuta alla profondità"});
  expect(screen.queryByRole("heading", {name: "Stesso punto, pressione assoluta"})).toBeNull();
});

test("cold reopen of all completed scalar steps shows a receipt-based summary, not a fresh duplicate attempt", async () => {
  stubComposition();
  const second: ActivityEvidenceV2 = {
    ...evidence(), stepId: "absolute",
    result: {...evidence().result, value: 120945, calculatedVariable: "Pressione assoluta"},
    prediction: {kind: "scalar", value: 120945, unit: "Pa"},
    check: {kind: "scalar", valueMatches: true, unitMatches: true},
  };
  render(<ScalarExperienceEpisode me={me} data={storedExperience([
    storedStep("first", me.id, evidence()), storedStep("second", me.id, second),
  ])} onUpdate={async () => {}} />);
  await screen.findByText(/Percorso già consegnato con ricevute del Core/);
  expect(screen.queryByLabelText("Pressione prevista in Pa")).toBeNull();
  expect(screen.queryByRole("button", {name: "Registra previsione e confronta"})).toBeNull();
});
