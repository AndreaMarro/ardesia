// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Exam } from "../features/Exam";
import type { Workspace } from "../api";

const rules = {
  totalQuestions: 1,
  mcq: 1,
  completion: 0,
  correctTenths: 10,
  wrongTenths: -1,
  omittedTenths: 0,
  maxTenths: 310,
  scoring: "Risposta corretta +1,00; risposta errata -0,10; risposta omessa 0,00.",
  maxScore: 31,
};

const questions = [{
  id: "q1",
  topic: "Misure",
  type: "mcq" as const,
  prompt: "Quale opzione è corretta?",
  options: ["A-text", "B-text", "C-text", "D-text", "E-text"],
  answerType: "option_id" as const,
}];

const attempt = {
  id: "attempt-cas",
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
  answerRevision: 5,
  result: null,
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

function response(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("a 409 reloads the server revision and the next save uses that revision", async () => {
  const calls: { path: string; method: string; body: unknown }[] = [];
  let saves = 0;
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
      if (path === "/study/exams/attempt-cas/answers") {
        saves += 1;
        if (saves === 1)
          return response({ error: "exam_revision_conflict" }, 409);
        return response({
          ...attempt,
          answers: body.answers,
          answerRevision: body.expectedRevision + 1,
        });
      }
      if (path === "/study/exams/attempt-cas" && method === "GET")
        return response({ ...attempt, answers: { q1: "A" }, answerRevision: 7 });
      return response({ error: "not_found" }, 404);
    }),
  );

  render(<Exam data={workspace} />);
  await screen.findByText("La prova di fisica.");
  fireEvent.click(screen.getByRole("button", { name: "Inizia la prova" }));
  await screen.findByText("Quale opzione è corretta?");
  fireEvent.click(screen.getByRole("radio", { name: /C-text/ }));
  await screen.findByText(/Le risposte sono state salvate in un’altra scheda/);
  expect((screen.getByRole("radio", { name: /A-text/ }) as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: /B-text/ }));
  await waitFor(
    () => {
      const writes = calls.filter((call) => call.method === "PUT");
      expect(writes).toHaveLength(2);
      expect(writes[1].body).toEqual({
        answers: { q1: "B" },
        expectedRevision: 7,
      });
    },
    { timeout: 3000 },
  );
});
