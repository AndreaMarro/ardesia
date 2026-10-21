// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuestionBankReview } from "../components/QuestionBankReview";

const sha = "a".repeat(64);
const question = { id: "fixture-0", title: "Quesito sintetico", prompt: "Metà di tre metri?",
  format: "multiple_choice", options: [{ id: "A", text: "1" }, { id: "B", text: "3/2" }],
  taxonomy: { unitId: "U1", microarea: "Rapporti", topic: "Divisione" },
  difficulty: { level: "base" }, answer: { text: "3/2 m", unit: "m", correctOptionId: "B" },
  solution: "## Controllo\n\nDue parti da 1,5 m ricostruiscono tre metri.",
  solutionSteps: [{ title: "Dividi", explanation: "Tre diviso due." }] };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function server(currentVersion = 1, currentSha = sha) {
  const reviews: Record<string, unknown>[] = [];
  const approvals: Record<string, unknown>[] = [];
  const calls: { path: string; body?: Record<string, unknown> }[] = [];
  let conflict = false;
  let published = false;
  vi.stubGlobal("fetch", vi.fn(async (path: string, options: RequestInit = {}) => {
    const body = options.body ? JSON.parse(String(options.body)) : undefined;
    calls.push({ path, body });
    if (path.endsWith("/review/reviews") && body) {
      if (conflict) return response({ error: "question_review_conflict" }, 409);
      const review = { ...body, reviewId: `review-${reviews.length + 1}`, createdAt: 1000 + reviews.length };
      reviews.push(review); return response(review);
    }
    if (path.endsWith("/publish")) {
      const approval = { approvalId: "publication-1", scientificStatus: "APPROVED", editorialStatus: "PUBLISHED", motivation: reviews.at(-1)?.notes };
      approvals.push(approval); published = true; return response(approval);
    }
    if (path.endsWith("/revoke")) {
      Object.assign(approvals[0], { editorialStatus: "REVOKED", revocationReason: body?.reason });
      published = false; return response(approvals[0]);
    }
    if (path.endsWith("/history")) return response({ reviews, approvals });
    if (path.endsWith("/review/questions/fixture-0")) return response({ question, questionVersion: currentVersion,
      contentSha256: currentSha, state: { review: reviews.at(-1) ?? null, approval: approvals.at(-1) ?? null,
        reviewPublication: approvals.at(-1) ?? null, servable: published } });
    if (path.includes("/review/questions?")) return response({ total: 1, nextCursor: null,
      items: [{ ...question, review: reviews.at(-1) ?? null, servable: published }] });
    throw Error(`unexpected request ${path}`);
  }));
  return { calls, reviews, approvals, conflict: () => { conflict = true; }, clearConflict: () => { conflict = false; } };
}

async function openQuestion() {
  fireEvent.click(screen.getByText(/Revisione scientifica dei quesiti/));
  fireEvent.click(await screen.findByRole("button", { name: /Quesito sintetico/ }));
  await screen.findByLabelText("Osservazioni della revisione");
}

test("private save, scientific decision, deliberate publication and revocation remain distinct", async () => {
  const api = server();
  render(<QuestionBankReview editionId="fluidi" />);
  expect(api.calls).toHaveLength(0);
  await openQuestion();
  expect(screen.getByText("Due parti da 1,5 m ricostruiscono tre metri.")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Osservazioni della revisione"), { target: { value: "Unità e passaggi verificati." } });
  fireEvent.click(screen.getByRole("button", { name: "Salva revisione privata" }));
  await screen.findByText("Revisione privata salvata. La pubblicazione non è cambiata.");
  expect(api.reviews[0]).toMatchObject({ status: "PENDING", contentSha256: sha, expectedReviewId: null });
  expect(api.calls.filter(call => call.path.endsWith("/publish"))).toHaveLength(0);
  fireEvent.change(screen.getByLabelText("Esito scientifico"), { target: { value: "APPROVED" } });
  expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Salva revisione privata" }));
  await waitFor(() => expect(api.reviews).toHaveLength(2));
  await waitFor(() => expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(false));
  expect(api.reviews[1]).toMatchObject({ status: "APPROVED", expectedReviewId: "review-1" });
  expect(api.approvals).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Prepara pubblicazione" }));
  expect((screen.getByRole("button", { name: "Pubblica il quesito" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox", { name: /Confermo la pubblicazione/ }));
  fireEvent.click(screen.getByRole("button", { name: "Pubblica il quesito" }));
  await screen.findByText("Quesito pubblicato per questa edizione.");
  expect(api.calls.find(call => call.path.endsWith("/publish"))).toMatchObject({
    path: "/study/editions/fluidi/question-banks/physics-semestre-2026/review/reviews/review-2/publish",
    body: { confirmPublication: true },
  });
  fireEvent.change(screen.getByLabelText("Motivo della revoca"), { target: { value: "Controllo aggiuntivo." } });
  fireEvent.click(screen.getByRole("button", { name: "Revoca pubblicazione" }));
  await screen.findByText("Pubblicazione revocata. Lo storico è conservato.");
  expect(api.approvals[0]).toMatchObject({ editorialStatus: "REVOKED", revocationReason: "Controllo aggiuntivo." });
  expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Salva nuova revisione privata" }));
  await waitFor(() => expect(api.reviews).toHaveLength(3));
  expect(api.reviews[2]).toMatchObject({ expectedReviewId: "review-2", status: "APPROVED", notes: "Unità e passaggi verificati." });
  await waitFor(() => expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(false));
  expect(api.approvals).toHaveLength(1);
});

test("a conflicting save keeps notes and explicitly reloads the latest review before resaving", async () => {
  const api = server(); api.conflict();
  render(<QuestionBankReview editionId="fluidi" />); await openQuestion();
  fireEvent.change(screen.getByLabelText("Osservazioni della revisione"), { target: { value: "Le mie note ancora da salvare." } });
  fireEvent.change(screen.getByLabelText("Esito scientifico"), { target: { value: "APPROVED" } });
  fireEvent.click(screen.getByRole("button", { name: "Salva revisione privata" }));
  await screen.findByRole("alert");
  expect((screen.getByLabelText("Osservazioni della revisione") as HTMLTextAreaElement).value).toBe("Le mie note ancora da salvare.");
  expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.approvals).toHaveLength(0);
  api.reviews.push({ reviewId: "review-remote", questionVersion: 1, contentSha256: sha,
    status: "REJECTED", notes: "Note correnti salvate nell’altra scheda." });
  api.clearConflict();
  fireEvent.click(screen.getByRole("button", { name: "Carica la revisione corrente" }));
  await screen.findByRole("region", { name: "Revisione corrente salvata" });
  expect((screen.getByLabelText("Osservazioni della revisione") as HTMLTextAreaElement).value).toBe("Le mie note ancora da salvare.");
  expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Salva revisione privata" }));
  await screen.findByText("Revisione privata salvata. La pubblicazione non è cambiata.");
  expect(api.calls.filter(call => call.path.endsWith("/review/reviews")).at(-1)?.body).toMatchObject({
    expectedReviewId: "review-remote", notes: "Le mie note ancora da salvare.", status: "APPROVED",
  });
  expect(api.approvals).toHaveLength(0);
});

test("filters use the private queue and a late old-edition response is discarded", async () => {
  let finish!: (reply: Response) => void;
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (path: string) => {
    calls.push(path);
    if (path.includes("/old/")) return new Promise<Response>(resolve => { finish = resolve; });
    return response({ total: 0, items: [], nextCursor: null });
  }));
  const { rerender } = render(<QuestionBankReview editionId="old" />);
  fireEvent.click(screen.getByText(/Revisione scientifica dei quesiti/));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  rerender(<QuestionBankReview editionId="new" />);
  await screen.findByText("Nessun quesito con questi filtri.");
  await act(async () => finish(response({ total: 1, items: [question], nextCursor: null })));
  expect(screen.queryByText("Quesito sintetico")).toBeNull();
  fireEvent.change(screen.getByLabelText("Difficoltà della revisione"), { target: { value: "difficile" } });
  await waitFor(() => expect(calls.some(path => path.includes("/new/") && path.includes("difficulty=difficile"))).toBe(true));
  expect(calls.every(path => path.includes("/review/questions?"))).toBe(true);
});

test("changed authored content requires an explicit fresh review even when notes and status are unchanged", async () => {
  const newSha = "b".repeat(64);
  const api = server(2, newSha);
  api.reviews.push({ reviewId: "review-v1", questionVersion: 1, contentSha256: sha,
    status: "APPROVED", notes: "Verifica salvata sulla prima versione." });
  render(<QuestionBankReview editionId="fluidi" />); await openQuestion();
  expect(screen.getByText(/Il quesito è cambiato rispetto alla revisione salvata/)).toBeTruthy();
  expect((screen.getByRole("button", { name: "Prepara pubblicazione" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Salva nuova revisione privata" }));
  await screen.findByText("Revisione privata salvata. La pubblicazione non è cambiata.");
  expect(api.reviews.at(-1)).toMatchObject({ questionVersion: 2, contentSha256: newSha,
    expectedReviewId: "review-v1", status: "APPROVED", notes: "Verifica salvata sulla prima versione." });
  expect(api.approvals).toHaveLength(0);
});
