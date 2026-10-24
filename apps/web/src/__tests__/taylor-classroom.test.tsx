// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../App";
import { clearResourceDrafts } from "../components/sessionDraftCache";
afterEach(() => {
  cleanup();
  clearResourceDrafts();
  vi.unstubAllGlobals();
  history.replaceState(null, "", "/");
});
test("the authorized Taylor classroom commits prediction and procedure to its own course and displays the server receipt", async () => {
  // Keep this course/receipt assertion independent of the real lazy module's
  // transform time. The separate loading probe retains Suspense and routing.
  await import("../features/Classroom");
  history.replaceState(null, "", "/?edition=analysis-2026&view=classroom");
  const cache = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => cache.get(k) ?? null,
    setItem: (k: string, v: string) => cache.set(k, v),
    removeItem: (k: string) => cache.delete(k),
  });
  const edition = {
    id: "analysis-2026",
    teacherId: "teacher",
    courseId: "analisi-1",
    packId: "taylor-exp-v1",
    packVersion: 1,
    packSha256: "a".repeat(64),
    title: "Analisi 1: Taylor e resto",
    subject: "analisi",
    duration: "Modulo DRAFT, durata non deliberata",
    capacity: 10,
    priceMinor: 0,
    state: "collecting",
    sessions: [],
    timezone: "Europe/Rome",
  };
  const calls: { path: string; body?: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(init.body as string) : undefined;
      calls.push({ path, body });
      const value =
        path === "/study/me"
          ? { id: "student", role: "student", synthetic: true }
          : path.includes("/editions?")
            ? { items: [edition], nextCursor: null }
            : path.includes("/workspace?")
              ? {
                  edition,
                  enrolled: true,
                  resources: [],
                  submissions: [],
                  layouts: [],
                  layoutSaved: false,
                  layoutVersion: "b".repeat(64),
                }
              : path === "/study/activities/evaluate"
                ? {
                    value: 1.6458333333333333,
                    degree: 3,
                    terms: 4,
                    remainderBound: 0.0078125,
                    domain: "Maclaurin, grado 0–12",
                    scientificApproval: "NOT_RUN",
                  }
                : {
                    receiptId: "receipt-taylor",
                    revision: 1,
                    courseContext: {
                      courseId: "analisi-1",
                      modelId: "taylor-exp-v1",
                      parameters: { x: 0.5, degree: 3 },
                    },
                  };
      return new Response(JSON.stringify(value));
    }),
  );
  render(<App />);
  await screen.findByRole("heading", {
    name: "Quanto basta per approssimare?",
  });
  expect(calls.some((call) => call.path === "/study/activities/evaluate")).toBe(
    false,
  );
  fireEvent.change(
    screen.getByLabelText("La tua previsione e il controllo del resto"),
    { target: { value: "Prevedo circa 1,65. M=3 sul segmento positivo." } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Registra la previsione e confronta" }),
  );
  await screen.findByText(/Maggiorante conservativo/);
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), {
    target: { value: "P3=1+1/2+1/8+1/48; il bound viene da 3(1/2)^4/4!." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/Consegnato · ricevuta receipt-taylor/);
  expect(
    calls.find((call) => call.path === "/study/submissions")?.body,
  ).toMatchObject({
    editionId: "analysis-2026",
    activityId: "taylor-exp-v1",
    activityParameters: { x: 0.5, degree: 3 },
    parentId: null,
  });
  expect(
    calls.find((call) => call.path === "/study/submissions")?.body?.text,
  ).toContain("Previsione: Prevedo circa 1,65");
  expect(
    calls.find((call) => call.path === "/study/submissions")?.body?.text,
  ).toContain("Procedimento: P3=1+");
  expect(screen.getByText(/parametri registrati:/).textContent).toContain(
    '{"x":0.5,"degree":3}',
  );
  expect(calls.some((call) => call.path.includes("editionId=fluidi"))).toBe(
    false,
  );
});
