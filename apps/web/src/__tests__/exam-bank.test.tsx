// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Exam } from "../features/Exam";
import type { Workspace } from "../api";

const rules = {
  totalQuestions: 2,
  mcq: 1,
  completion: 1,
  correctTenths: 10,
  wrongTenths: -1,
  omittedTenths: 0,
  maxTenths: 310,
  scoring: "Risposta corretta +1,00; risposta errata -0,10; risposta omessa 0,00.",
  maxScore: 31,
};

const questions = [
  {
    id: "q1",
    topic: "Misure",
    type: "mcq" as const,
    prompt: "Quale opzione è corretta?",
    options: ["A-text", "B-text", "C-text", "D-text", "E-text"],
    answerType: "option_id" as const,
  },
  {
    id: "q2",
    topic: "Misure",
    type: "completion" as const,
    prompt: "Scrivi il valore.",
    format: "Testo o numero",
  },
];

const attempt = {
  id: "attempt-bank",
  editionId: "physics",
  packId: "physics-semestre-2026-semestre-2026-v1",
  packVersion: 1,
  status: "in_progress" as const,
  startedAt: 1000,
  deadlineAt: 4000,
  submittedAt: null,
  remainingSeconds: 3000,
  answers: {},
  title: "Fisica — Prova di semestre",
  subtitle: "31 quesiti approvati",
  durationSeconds: 3000,
  rules,
  questions,
  answerRevision: 3,
  result: null,
};

const result = {
  scoreTenths: 10,
  maxTenths: 310,
  score: 1,
  correct: 1,
  wrong: 0,
  omitted: 1,
  validity: {
    valid: false,
    invalidQuestionIds: ["q1"],
    checkedAt: 2100,
    gate: "scientific-editorial-approval-v1",
  },
  questions: [
    {
      questionId: "q1",
      topic: "Misure",
      type: "mcq",
      prompt: "Quale opzione è corretta?",
      options: ["A-text", "B-text", "C-text", "D-text", "E-text"],
      given: "C",
      givenText: "C-text",
      expected: "C",
      expectedText: "C-text",
      accepted: null,
      status: "correct",
      pointsTenths: 10,
      explanation: "Spiegazione completa.",
      solutionSteps: [
        { title: "Passo uno", explanation: "Leggi i dati." },
        { title: "Passo due", explanation: "Confronta le opzioni." },
      ],
    },
    {
      questionId: "q2",
      topic: "Misure",
      type: "completion",
      prompt: "Scrivi il valore.",
      options: null,
      given: null,
      givenText: null,
      expected: "4",
      expectedText: "4",
      accepted: ["4"],
      status: "omitted",
      pointsTenths: 0,
      explanation: "Il valore è 4.",
    },
  ],
};

const workspace = {
  edition: {
    id: "physics",
    title: "Fisica",
    teacherId: "t",
    capacity: 10,
    priceMinor: 0,
    state: "running",
    sessions: [],
    timezone: "Europe/Rome",
  },
  enrolled: true,
  resources: [],
  submissions: [],
  layouts: [],
  layoutSaved: false,
  layoutVersion: "v",
} as Workspace;

function response(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("a bank exam sends option ids, CAS revision and shows an invalid result", async () => {
  const calls: { path: string; method: string; body: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init: RequestInit = {}) => {
      const method = init.method ?? "GET";
      const body = init.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ path, method, body });
      if (path.includes("/exams?editionId=physics"))
        return response({
          attempts: [],
          pack: {
            id: attempt.packId,
            version: 1,
            title: attempt.title,
            subtitle: attempt.subtitle,
            durationSeconds: 3000,
            rules,
            provenance: "Banca approvata.",
            questionCount: 31,
          },
        });
      if (path === "/study/exams" && method === "POST") return response(attempt);
      if (path === "/study/exams/attempt-bank/answers")
        return response({
          ...attempt,
          answers: body.answers,
          answerRevision: body.expectedRevision + 1,
        });
      if (path === "/study/exams/attempt-bank/submit")
        return response({
          ...attempt,
          status: "submitted",
          submittedAt: 2000,
          remainingSeconds: 0,
          result,
        });
      return response({ error: "not_found" });
    }),
  );

  render(<Exam data={workspace} />);
  await screen.findByText("La prova di fisica.");
  fireEvent.click(screen.getByRole("button", { name: "Inizia la prova" }));
  await screen.findByText("Quale opzione è corretta?");
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  fireEvent.click(screen.getByRole("radio", { name: /C-text/ }));
  await waitFor(() => {
    const put = calls.find((call) => call.method === "PUT");
    expect(put?.body).toEqual({ answers: { q1: "C" }, expectedRevision: 3 });
  });
  fireEvent.click(screen.getByRole("button", { name: "Successiva" }));
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText("Consegnare adesso?");
  fireEvent.click(screen.getByRole("button", { name: "Consegna definitivamente" }));
  await screen.findByText("La prova è consegnata.");
  expect(screen.getByText("Prova non valida.")).toBeTruthy();
  expect(screen.getByText("Passo uno")).toBeTruthy();
  const submitted = calls.find(
    (call) => call.method === "POST" && call.path.endsWith("/submit"),
  );
  expect(submitted?.body).toEqual({
    answers: { q1: "C" },
    expectedRevision: 4,
  });
});
