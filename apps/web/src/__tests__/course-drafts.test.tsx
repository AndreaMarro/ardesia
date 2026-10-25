// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useResourceComposer } from "../components/useResourceComposer";
import { clearResourceDrafts } from "../components/sessionDraftCache";
import { TaylorLab } from "../components/TaylorLab";
import { PhysicsLab } from "../components/PhysicsLab";
function Composer({ actor, edition }: { actor: string; edition: string }) {
  const c = useResourceComposer({
    actorId: actor,
    editionId: edition,
    kind: "notes",
    visibility: "private",
    successMessage: "Salvato",
    onUpdate: async () => {},
  });
  return (
    <>
      <label>
        Nota
        <textarea value={c.text} onChange={(e) => c.edit(e.target.value)} />
      </label>
      <button onClick={() => void c.save()}>Salva</button>
      <p>{c.message}</p>
    </>
  );
}
afterEach(() => {
  cleanup();
  clearResourceDrafts();
  vi.unstubAllGlobals();
});
test("unsent notes remain course-scoped and a late create ACK tombstones only its origin draft; another actor gets no draft", async () => {
  let release!: (value: Response) => void;
  const calls: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_path: string, init: RequestInit) => {
      calls.push(JSON.parse(init.body as string));
      return new Promise<Response>((r) => {
        release = r;
      });
    }),
  );
  let view = render(<Composer actor="one" edition="physics" />);
  fireEvent.change(screen.getByLabelText("Nota"), {
    target: { value: "Nota di Fisica" },
  });
  view.unmount();
  view = render(<Composer actor="one" edition="analysis" />);
  expect(screen.getByLabelText("Nota")).toHaveProperty("value", "");
  fireEvent.change(screen.getByLabelText("Nota"), {
    target: { value: "Nota di Analisi" },
  });
  fireEvent.click(screen.getByText("Salva"));
  view.unmount();
  view = render(<Composer actor="one" edition="physics" />);
  expect(screen.getByLabelText("Nota")).toHaveProperty(
    "value",
    "Nota di Fisica",
  );
  release(
    new Response(JSON.stringify({ id: "a", revisionId: "v", contextId: "c" })),
  );
  await waitFor(() => expect(calls).toHaveLength(1));
  expect(screen.getByLabelText("Nota")).toHaveProperty(
    "value",
    "Nota di Fisica",
  );
  view.unmount();
  view = render(<Composer actor="one" edition="analysis" />);
  await waitFor(() =>
    expect(screen.getByLabelText("Nota")).toHaveProperty("value", ""),
  );
  view.unmount();
  render(<Composer actor="two" edition="physics" />);
  expect(screen.getByLabelText("Nota")).toHaveProperty("value", "");
  expect(calls[0]).toMatchObject({
    editionId: "analysis",
    text: "Nota di Analisi",
  });
});
test("Taylor requires a human prediction, validates bounded inputs, invalidates feedback, and ignores a late result", async () => {
  let release!: (r: Response) => void;
  const committed = vi.fn();
  const fetcher = vi.fn(
    async () =>
      new Promise<Response>((r) => {
        release = r;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<TaylorLab onCommit={committed} />);
  const button = screen.getByRole("button", {
    name: "Registra la previsione e confronta",
  });
  expect(fetcher).not.toHaveBeenCalled();
  expect(button).toHaveProperty("disabled", true);
  fireEvent.change(
    screen.getByLabelText("La tua previsione e il controllo del resto"),
    { target: { value: "Quattro termini; maggioro exp con 3 sul segmento." } },
  );
  fireEvent.change(screen.getByLabelText("Argomento x"), {
    target: { value: "1.1" },
  });
  expect(button).toHaveProperty("disabled", true);
  fireEvent.change(screen.getByLabelText("Argomento x"), {
    target: { value: "0.5" },
  });
  fireEvent.change(screen.getByLabelText("Grado del polinomio"), {
    target: { value: "2.5" },
  });
  expect(button).toHaveProperty("disabled", true);
  fireEvent.change(screen.getByLabelText("Grado del polinomio"), {
    target: { value: "3" },
  });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText("Argomento x"), {
    target: { value: "-0.5" },
  });
  release(
    new Response(
      JSON.stringify({
        value: 1.6458333333333333,
        degree: 3,
        terms: 4,
        remainderBound: 0.0078125,
        domain: "DRAFT",
      }),
    ),
  );
  await waitFor(() => expect(button).toHaveProperty("disabled", false));
  expect(screen.queryByText(/1,645833/)).toBeNull();
  expect(committed.mock.calls.every(([value]) => value === null)).toBe(true);
});
test("returning to a course restores its physics prediction without treating a cached result as a fresh commit", () => {
  const first = render(
    <PhysicsLab draftKey="one:physics:lab" onCommit={() => {}} />,
  );
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "La portata cresce alla quarta potenza" },
  });
  first.unmount();
  const other = render(
    <TaylorLab draftKey="one:analysis:lab" onCommit={() => {}} />,
  );
  expect(
    screen.getByLabelText("La tua previsione e il controllo del resto"),
  ).toHaveProperty("value", "");
  other.unmount();
  render(<PhysicsLab draftKey="one:physics:lab" onCommit={() => {}} />);
  expect(screen.getByLabelText("La tua previsione")).toHaveProperty(
    "value",
    "La portata cresce alla quarta potenza",
  );
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
});
