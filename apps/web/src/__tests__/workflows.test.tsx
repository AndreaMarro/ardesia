// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { StudyResource } from "../api";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const resource: StudyResource = {
  id: "r-1",
  revisionId: "rev-original",
  contextId: "ctx-1",
  ownerId: "student-01",
  editionId: "fluidi",
  visibility: "private",
  kind: "notes",
  text: "Versione consegnata: r²",
  sha256: "a".repeat(64),
};

test("source viewer resolves the submitted revision and never substitutes the head", async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      calls.push(input);
      return new Response(JSON.stringify(resource), { status: 200 });
    }),
  );
  const { SourceViewer } = await import("../components/SourceViewer");
  render(
    <SourceViewer
      reference={{
        resourceId: "r-1",
        revisionId: "rev-original",
        contextId: "ctx-1",
      }}
    />,
  );
  await screen.findByText("Versione consegnata: r²");
  expect(calls).toEqual(["/study/resources/r-1/revisions/rev-original"]);
});

test("lab invalidates feedback after parameters change and commits once", async () => {
  const requests: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options: RequestInit) => {
      requests.push(JSON.parse(options.body as string));
      return new Response(
        JSON.stringify({
          ratio: 5.0625,
          calculatedVariable: "Q/Q0",
          fixedQuantity: "pressure",
          domain: "Modello laminare",
        }),
        { status: 200 },
      );
    }),
  );
  const { PhysicsLab } = await import("../components/PhysicsLab");
  render(<PhysicsLab />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata aumenta" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  expect((await screen.findByTestId("physics-ratio")).textContent).toBe("Q/Q0 = 5,0625");
  fireEvent.change(screen.getByLabelText("Rapporto dei raggi"), {
    target: { value: "2" },
  });
  expect(screen.queryByText(/5,0625/)).toBeNull();
  expect(screen.getByText(/Parametri cambiati/)).toBeTruthy();
  expect(requests).toHaveLength(1);
});

test("failed source request offers an explicit retry without rendering another revision", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      calls++;
      return calls === 1
        ? new Response(JSON.stringify({ error: "forbidden" }), { status: 403 })
        : new Response(JSON.stringify(resource), { status: 200 });
    }),
  );
  const { SourceViewer } = await import("../components/SourceViewer");
  render(
    <SourceViewer
      reference={{
        resourceId: "r-1",
        revisionId: "rev-original",
        contextId: "ctx-1",
      }}
    />,
  );
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await screen.findByText("Versione consegnata: r²");
  await waitFor(() => expect(calls).toBe(2));
});

test("lab makes no automatic request and guards double commit while pending", async () => {
  let finish!: (value: Response) => void;
  const fetcher = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  const { PhysicsLab } = await import("../components/PhysicsLab");
  render(<PhysicsLab />);
  expect(fetcher).toHaveBeenCalledTimes(0);
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata aumenta" },
  });
  const button = screen.getByRole("button", { name: "Metti alla prova" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(fetcher).toHaveBeenCalledTimes(1);
  finish(
    new Response(
      JSON.stringify({
        ratio: 5.0625,
        calculatedVariable: "Q/Q0",
        fixedQuantity: "pressure",
        domain: "Laminare",
      }),
    ),
  );
  expect((await screen.findByTestId("physics-ratio")).textContent).toBe("Q/Q0 = 5,0625");
});

test("editing during a request rejects the late result and permits a new commit", async () => {
  let finish!: (value: Response) => void;
  const fetcher = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  const { PhysicsLab } = await import("../components/PhysicsLab");
  render(<PhysicsLab />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata aumenta" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  fireEvent.change(screen.getByLabelText("Rapporto dei raggi"), {
    target: { value: "2" },
  });
  finish(
    new Response(
      JSON.stringify({
        ratio: 5.0625,
        calculatedVariable: "Q/Q0",
        fixedQuantity: "pressure",
        domain: "Laminare",
      }),
    ),
  );
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Metti alla prova",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  expect(screen.queryByText(/5,0625/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  expect(fetcher).toHaveBeenCalledTimes(2);
  finish(
    new Response(
      JSON.stringify({
        ratio: 16,
        calculatedVariable: "Q/Q0",
        fixedQuantity: "pressure",
        domain: "Laminare",
      }),
    ),
  );
  await screen.findByText("Q/Q0 = 16");
});

test("lab retry keeps the prediction and reuses the chosen parameters", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      ++calls === 1
        ? new Response(JSON.stringify({ error: "storage_unavailable" }), {
            status: 503,
          })
        : new Response(
            JSON.stringify({
              ratio: 5.0625,
              calculatedVariable: "Q/Q0",
              fixedQuantity: "pressure",
              domain: "Laminare",
            }),
          ),
    ),
  );
  const { PhysicsLab } = await import("../components/PhysicsLab");
  render(<PhysicsLab />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata aumenta" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  await screen.findByRole("alert");
  expect(
    (screen.getByLabelText("La tua previsione") as HTMLInputElement).value,
  ).toBe("La portata aumenta");
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  expect((await screen.findByTestId("physics-ratio")).textContent).toBe("Q/Q0 = 5,0625");
  expect(calls).toBe(2);
});

test("unmount cancels the pending numerical request", async () => {
  let signal: AbortSignal | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, options: RequestInit) => {
      signal = options.signal as AbortSignal;
      return new Promise(() => {});
    }),
  );
  const { PhysicsLab } = await import("../components/PhysicsLab");
  const view = render(<PhysicsLab />);
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata aumenta" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  view.unmount();
  expect(signal?.aborted).toBe(true);
});

test("a transfer partially received by the service stays frozen and retries the same request", async () => {
  const submissions: { body: string; key: string }[] = [];
  let attempts = 0;
  const thread = {
    threadId: "thread-1",
    studentId: "student-01",
    editionId: "fluidi",
    conceptId: "radius-power",
    category: "model_selection",
    status: "OPEN",
    sourceState: "CURRENT",
    source: { resourceId: "r-1", revisionId: "rev-1", quote: "r²" },
    contested: false,
    feedback: {
      explanation: "Quarta potenza",
      nextStep: "Prova un raggio doppio",
      rubric: { criterion: "Potenze" },
      verification: "REVIEWED_BY_TUTOR",
    },
    transferExercise: {
      exerciseId: "transfer-1",
      prompt: "Raddoppia il raggio e spiega.",
      parameters: { radiusRatio: 2 },
    },
    attempts: [],
    history: [],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.startsWith("/study/diary?"))
        return new Response(
          JSON.stringify({
            threads: [thread],
            confirmedOpenCount: 1,
            candidateCount: 0,
          }),
        );
      if (url === "/study/submissions") {
        submissions.push({
          body: options?.body as string,
          key: (options?.headers as Record<string, string>)["Idempotency-Key"],
        });
        return new Response(JSON.stringify({ submissionId: "attempt-1" }));
      }
      if (url.endsWith("/practice"))
        return ++attempts === 1
          ? new Response(JSON.stringify({ error: "storage_unavailable" }), {
              status: 503,
            })
          : new Response("{}");
      throw Error("Unexpected request " + url);
    }),
  );
  const { Diary } = await import("../features/Diary");
  render(
    <Diary
      me={{ id: "student-01", role: "student", synthetic: true }}
      editionId="fluidi"
    />,
  );
  fireEvent.click(await screen.findByText("Affronta una situazione nuova"));
  const field = screen.getByLabelText(
    "Spiega il tuo procedimento",
  ) as HTMLTextAreaElement;
  fireEvent.change(field, {
    target: { value: "Il rapporto è due alla quarta, cioè sedici." },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Consegna la nuova prova" }),
  );
  await screen.findByText(/Consegna non conclusa/);
  expect(field.disabled).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "Consegna la nuova prova" }),
  );
  await screen.findByText(/Nuova prova consegnata/);
  expect(submissions).toHaveLength(2);
  expect(submissions[0]).toEqual(submissions[1]);
});

test("a diary load failure can be retried without leaving a permanent loading state", async () => {
  let requests = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      ++requests === 1
        ? new Response(JSON.stringify({ error: "storage_unavailable" }), {
            status: 503,
          })
        : new Response(
            JSON.stringify({
              threads: [],
              confirmedOpenCount: 0,
              candidateCount: 0,
            }),
          ),
    ),
  );
  const { Diary } = await import("../features/Diary");
  render(
    <Diary
      me={{ id: "student-01", role: "student", synthetic: true }}
      editionId="fluidi"
    />,
  );
  await screen.findByRole("alert");
  expect(screen.queryByText("Sto aprendo il tuo diario…")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await screen.findByText("Qui ritroverai i passaggi su cui lavorare.");
  expect(requests).toBe(2);
});
