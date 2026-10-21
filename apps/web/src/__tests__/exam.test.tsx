// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Exam } from "../features/Exam";
import type { Workspace } from "../api";

const pack = {
  id: "fisica-semestre-filtro-v1",
  version: 1,
  title: "Fisica — Prova di filtro",
  subtitle: "Semestre filtro 2026/27",
  durationSeconds: 3000,
  questionCount: 2,
  provenance: "Prova originale.",
  rules: {
    totalQuestions: 31,
    mcq: 21,
    completion: 10,
    correctTenths: 10,
    wrongTenths: -1,
    omittedTenths: 0,
    maxTenths: 310,
    scoring: "Risposta corretta +1,00; risposta errata -0,10; risposta omessa 0,00.",
    maxScore: 31,
  },
};

const questions = [
  {
    id: "q1",
    topic: "Meccanica",
    type: "mcq" as const,
    prompt: "Quanto vale 2 + 2?",
    options: ["3", "4", "5", "6"],
  },
  {
    id: "q2",
    topic: "Fluidi",
    type: "completion" as const,
    prompt: "Scrivi la velocità.",
    format: "Testo o numero",
  },
];

const attempt = {
  id: "attempt-1",
  editionId: "physics",
  packId: pack.id,
  packVersion: 1,
  status: "in_progress" as const,
  startedAt: 1000,
  deadlineAt: 4000,
  submittedAt: null,
  remainingSeconds: 3000,
  answers: {},
  title: pack.title,
  subtitle: pack.subtitle,
  durationSeconds: 3000,
  rules: pack.rules,
  questions,
  answerRevision: 0,
  result: null,
};

const result = {
  scoreTenths: 9,
  maxTenths: 310,
  score: 0.9,
  correct: 1,
  wrong: 1,
  omitted: 0,
  questions: [
    {
      questionId: "q1",
      topic: "Meccanica",
      type: "mcq",
      prompt: "Quanto vale 2 + 2?",
      options: ["3", "4", "5", "6"],
      given: 1,
      givenText: "4",
      expected: 1,
      expectedText: "4",
      accepted: null,
      status: "correct",
      pointsTenths: 10,
      explanation: "La somma è 4.",
    },
    {
      questionId: "q2",
      topic: "Fluidi",
      type: "completion",
      prompt: "Scrivi la velocità.",
      options: null,
      given: "3 m/s",
      givenText: "3 m/s",
      expected: "2 m/s",
      expectedText: "2 m/s",
      accepted: ["2 m/s"],
      status: "wrong",
      pointsTenths: -1,
      explanation: "La velocità è 2 m/s.",
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

test("the exam hides explanations, autosaves answers, submits and reviews errors", async () => {
  const calls: { path: string; method: string; body: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init: RequestInit = {}) => {
      const method = init.method ?? "GET";
      const body = init.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ path, method, body });
      if (path.includes("/exams?editionId=physics")) return response({ attempts: [], pack });
      if (path === "/study/exams" && method === "POST") return response(attempt);
      if (path === "/study/exams/attempt-1") return response(attempt);
      if (path === "/study/exams/attempt-1/answers")
        return response({
          ...attempt,
          answers: body.answers,
          answerRevision: body.expectedRevision + 1,
        });
      if (path === "/study/exams/attempt-1/submit")
        return response({ ...attempt, status: "submitted", submittedAt: 2000, remainingSeconds: 0, result });
      return response({ error: "not_found" });
    }),
  );

  render(<Exam data={workspace} />);
  await screen.findByText("La prova di fisica.");
  fireEvent.click(screen.getByRole("button", { name: "Inizia la prova" }));
  await screen.findByText("Quanto vale 2 + 2?");
  expect(screen.queryByText("La somma è 4.")).toBeNull();

  fireEvent.click(screen.getByRole("radio", { name: /4/ }));
  await waitFor(() =>
    expect(calls.some((call) => call.method === "PUT" && call.path.endsWith("/answers"))).toBe(true),
  );
  fireEvent.click(screen.getByRole("button", { name: "Successiva" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "3 m/s" } });
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText("Consegnare adesso?");
  fireEvent.click(screen.getByRole("button", { name: "Consegna definitivamente" }));

  await screen.findByText("La prova è consegnata.");
  expect(screen.getByText("0,9")).toBeTruthy();
  const submitted = calls.find((call) => call.method === "POST" && call.path.endsWith("/submit"));
  expect(submitted?.body).toEqual({
    answers: { q1: 1, q2: "3 m/s" },
    expectedRevision: 1,
  });
  expect(screen.getByText("La somma è 4.")).toBeTruthy();
  expect(screen.getByText("La velocità è 2 m/s.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Errate (1)" }));
  expect(screen.queryByText("La somma è 4.")).toBeNull();
  expect(screen.getByText("La velocità è 2 m/s.")).toBeTruthy();
});
