// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PhysicsQuestionBank } from "../components/PhysicsQuestionBank";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const sha = "a".repeat(64);
const question = {
  id: "physics-test", prompt: "Quanto vale la metà di tre metri?", format: "multiple_choice",
  options: ["1", "3/2", "2", "3", "6"].map((text, index) => ({ id: "ABCDE"[index], text })),
  taxonomy: { unitId: "U1", macroarea: "Misure", microarea: "Rapporti", topic: "Un rapporto" },
  difficulty: { level: "base", reason: "Una divisione" }, familyId: "half", status: "DRAFT",
};
const catalog = { title: "Banca", questionCount: 4000, bankSha256: sha, countsByDifficulty: { base: 1000, facile: 1000, medio: 1000, difficile: 1000 } };
const page = { items: [question], total: 1, nextCursor: null, bankSha256: sha };
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

test("bank loads only when opened and reveals the complete explanation after a pinned answer", async () => {
  const attempts: unknown[] = [];
  const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
    if (url.endsWith("/attempts")) {
      attempts.push(JSON.parse(options?.body as string));
      return json({ questionId: question.id, outcome: "correct", score: 1, matchingPolicy: "choice_id",
        answer: { text: "3/2 m", correctOptionId: "B", unit: "m" },
        solution: "## Perché dividiamo\n\nLa misura va separata in due parti uguali.\n\n## Calcolo\n\n3 / 2 = 1,5 m.\n\n## Controllo\n\nDue parti da 1,5 m ricostruiscono i 3 m iniziali.", scientificApproval: "NOT_RUN" });
    }
    return json(url.includes("/questions?") ? page : catalog);
  });
  vi.stubGlobal("fetch", fetcher);
  render(<PhysicsQuestionBank editionId="fluidi" />);
  expect(fetcher).toHaveBeenCalledTimes(0);
  fireEvent.click(screen.getByText(/Allenati con la banca di fisica/));
  await screen.findByText(question.prompt);
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  expect(screen.queryByText(/ricostruiscono/)).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "B. 3/2" }));
  fireEvent.click(screen.getByRole("button", { name: "Verifica risposta" }));
  await screen.findByText("Due parti da 1,5 m ricostruiscono i 3 m iniziali.");
  expect(attempts).toEqual([{ questionId: question.id, response: "B", bankSha256: sha }]);
  expect(screen.getByRole("heading", { name: "Perché dividiamo" })).toBeTruthy();
});

test("filters are sent to the authenticated edition and completion accepts fractional text", async () => {
  const calls: { url: string; body?: unknown }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
    calls.push({ url, ...(options?.body ? { body: JSON.parse(options.body as string) } : {}) });
    if (url.endsWith("/attempts")) return json({ questionId: "completion-test", outcome: "correct", score: 1,
      matchingPolicy: "exact_rational", answer: { text: "3/2 m", unit: "m" }, solution: "Il rapporto è esatto.", scientificApproval: "NOT_RUN" });
    if (url.includes("/questions?")) return json({ ...page, items: [{ ...question, id: "completion-test", format: "completion", options: [] }] });
    return json(catalog);
  }));
  render(<PhysicsQuestionBank editionId="fisica-edizione-2" />);
  fireEvent.click(screen.getByText(/Allenati con la banca di fisica/));
  await screen.findByText(question.prompt);
  fireEvent.change(screen.getByLabelText("Difficoltà"), { target: { value: "medio" } });
  await waitFor(() => expect(calls.some(call => call.url.includes("difficulty=medio"))).toBe(true));
  expect(calls.find(call => call.url.includes("difficulty=medio"))?.url).toContain(`bankSha256=${sha}`);
  await screen.findByLabelText("La tua risposta");
  fireEvent.change(screen.getByLabelText("La tua risposta"), { target: { value: "6/4" } });
  fireEvent.click(screen.getByRole("button", { name: "Verifica risposta" }));
  await screen.findByText("Il rapporto è esatto.");
  expect(calls.every(call => call.url.startsWith("/study/editions/fisica-edizione-2/question-banks/"))).toBe(true);
  expect(calls.find(call => call.url.endsWith("/attempts"))?.body).toEqual({ questionId: "completion-test", response: "6/4", bankSha256: sha });
});

test("changing edition rejects a late response from the old course", async () => {
  let release!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("/old/") && url.includes("/questions?")) return new Promise<Response>(resolve => { release = resolve; });
    return json(url.includes("/questions?") ? { ...page, items: [{ ...question, prompt: "Quesito dell’edizione corrente" }] } : catalog);
  }));
  const { rerender } = render(<PhysicsQuestionBank editionId="old" />);
  fireEvent.click(screen.getByText(/Allenati con la banca di fisica/));
  await waitFor(() => expect(release).toBeTypeOf("function"));
  rerender(<PhysicsQuestionBank editionId="new" />);
  await screen.findByText("Quesito dell’edizione corrente");
  release(json(page));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(screen.queryByText(question.prompt)).toBeNull();
});

test("the training paper uses the pinned 2026 profile and returns to the filtered catalog", async () => {
  let examBody: { seed: string; profileId: string; bankSha256: string } | undefined;
  const questions = Array.from({ length: 31 }, (_, index) => ({ ...question,
    id: `exam-${index}`, prompt: `Domanda di allenamento ${index + 1}`,
    format: index < 21 ? "multiple_choice" : "completion",
    options: index < 21 ? question.options : [], familyId: `family-${index}`,
  }));
  vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
    if (url.endsWith("/exams")) {
      examBody = JSON.parse(options?.body as string);
      return json({ bankSha256: sha, seed: examBody?.seed, durationSeconds: 3000, questions });
    }
    return json(url.includes("/questions?") ? page : catalog);
  }));
  render(<PhysicsQuestionBank editionId="fluidi" />);
  fireEvent.click(screen.getByText(/Allenati con la banca di fisica/));
  await screen.findByText(question.prompt);
  fireEvent.click(screen.getByRole("button", { name: "Genera una prova 2026 · 31 quesiti" }));
  await screen.findByText("Domanda di allenamento 31");
  expect(examBody?.seed).toBeTruthy();
  expect(examBody?.profileId).toBe("semestre-2026");
  expect(examBody?.bankSha256).toBe(sha);
  expect(screen.getAllByRole("article")).toHaveLength(31);
  expect(screen.getAllByLabelText("La tua risposta")).toHaveLength(10);
  expect(screen.getByText(/Tempo di riferimento: 50 minuti/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Torna alla ricerca" }));
  await screen.findByText(question.prompt);
  expect(screen.getAllByRole("article")).toHaveLength(1);
});
