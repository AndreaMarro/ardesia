// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Classroom } from "../features/Classroom";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
import { createStudyPostit } from "../../../studio/src/study/postit";
import type { StudyResource } from "../api";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const original: StudyResource = {
  id: "source-1",
  revisionId: "revision-1",
  contextId: "context-1",
  ownerId: "student-01",
  editionId: "fluidi",
  visibility: "private",
  kind: "notes",
  text: "Originale: Q cresce come r².",
  sha256: "a".repeat(64),
};
const head: StudyResource = {
  ...original,
  revisionId: "revision-2",
  text: "Nuova versione privata: quarta potenza.",
};
const first = createStudyPostit("view-first", original, {
  x: 24,
  y: 24,
  width: 360,
  height: 300,
});
const second = createStudyPostit("view-second", original, {
  x: 440,
  y: 24,
  width: 360,
  height: 300,
});
const data = {
  enrolled: true,
  edition: {
    id: "fluidi",
    teacherId: "tutor-synthetic",
    capacity: 10,
    priceMinor: 4900,
    state: "collecting",
    sessions: [],
    timezone: "Europe/Rome",
  },
  resources: [head],
  submissions: [],
  layouts: [first, second],
  layoutSaved: true,
  layoutVersion: "b".repeat(64),
};
const me = {
  id: "student-01",
  role: "student" as const,
  synthetic: true as const,
};

test("classroom restores two independent views of the pinned original rather than substituting the current resource head", async () => {
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(url.includes("/revision-1") ? original : head),
        ),
    ),
  );
  render(<Classroom me={me} data={data} onUpdate={async () => {}} />);
  expect((await screen.findAllByText(original.text)).length).toBe(2);
  expect(document.querySelectorAll(".source-board-view").length).toBe(2);
});

test("portable notebook exports the requested edition instead of a hardcoded course", async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      return new Response(
        JSON.stringify({
          resources: [],
          submissions: [],
          assets: [],
          omissions: [],
        }),
      );
    }),
  );
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:synthetic"),
      revokeObjectURL: vi.fn(),
    }),
  );
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<NotebookPanel editionId="analisi" />);
  fireEvent.click(screen.getByRole("button", { name: "Esporta quaderno" }));
  await screen.findByText(
    "Quaderno esportato con hash degli originali e omissioni dichiarate.",
  );
  expect(calls).toEqual(["/study/notebook?editionId=analisi"]);
});

import { act, waitFor, within } from "@testing-library/react";
import { SourceBoard } from "../components/SourceBoard";
const base = { ...data, resources: [original], layouts: [first] };
function mountBoard(value = base) {
  return render(
    <SourceBoard
      me={me}
      data={value}
      onUpdate={async () => {}}
      onUse={vi.fn()}
    />,
  );
}
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status });
}

test("duplicating and keyboard moving persist two instance identities with one exact source and no new resource", async () => {
  const saved: { views: (typeof first)[]; expectedVersion: string }[] = [];
  const urls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      urls.push(url);
      if (url === "/study/layout") {
        saved.push(JSON.parse(options?.body as string));
        return json({ saved: true, layoutVersion: "c".repeat(64) });
      }
      return json(original);
    }),
  );
  mountBoard();
  await screen.findByText(original.text, { selector: ".original-text" });
  fireEvent.click(screen.getByRole("button", { name: "Duplica vista 1" }));
  await waitFor(() =>
    expect(document.querySelectorAll(".source-board-view")).toHaveLength(2),
  );
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Sposta vista 2 con le frecce" }),
    { key: "ArrowRight" },
  );
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Disposizione salvata.");
  expect(saved).toHaveLength(1);
  expect(saved[0].expectedVersion).toBe(base.layoutVersion);
  expect(saved[0].views.map((view) => view.pluginState)).toEqual([
    first.pluginState,
    first.pluginState,
  ]);
  expect(new Set(saved[0].views.map((view) => view.instanceId)).size).toBe(2);
  expect(saved[0].views.map((view) => view.bounds.x)).toEqual([24, 64]);
  expect(urls.every((url) => !url.endsWith("/resources"))).toBe(true);
});

test("failed layout save preserves views and retries the same snapshot without a false saved message", async () => {
  const bodies: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/study/layout") {
        bodies.push(options?.body as string);
        return bodies.length === 1
          ? json({ error: "storage_unavailable" }, 503)
          : json({ saved: true, layoutVersion: "c".repeat(64) });
      }
      return json(original);
    }),
  );
  mountBoard();
  await screen.findByText(original.text, { selector: ".original-text" });
  fireEvent.click(screen.getByRole("button", { name: "Duplica vista 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByRole("alert");
  expect(screen.getByTestId("board-save-state").textContent).toContain(
    "non salvate",
  );
  expect(screen.queryByText("Disposizione salvata.")).toBeNull();
  expect(document.querySelectorAll(".source-board-view")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Riprova salvataggio" }));
  await screen.findByText("Disposizione salvata.");
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toBe(bodies[1]);
});

test("a late save acknowledgement never marks edits made during that request as saved", async () => {
  let finish!: (response: Response) => void;
  const bodies: { views: (typeof first)[]; expectedVersion: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/study/layout") {
        bodies.push(JSON.parse(options?.body as string));
        if (bodies.length === 1)
          return new Promise<Response>((resolve) => {
            finish = resolve;
          });
        return json({ saved: true, layoutVersion: "d".repeat(64) });
      }
      return json(original);
    }),
  );
  mountBoard();
  await screen.findByText(original.text, { selector: ".original-text" });
  fireEvent.click(screen.getByRole("button", { name: "Duplica vista 1" }));
  const save = screen.getByRole("button", { name: "Salva disposizione" });
  fireEvent.click(save);
  fireEvent.click(save);
  fireEvent.click(screen.getByRole("button", { name: "Duplica vista 2" }));
  await act(async () => {
    finish(json({ saved: true, layoutVersion: "c".repeat(64) }));
  });
  expect(screen.getByTestId("board-save-state").textContent).toContain(
    "non salvate",
  );
  expect(bodies).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Disposizione salvata.");
  expect(bodies[0].views).toHaveLength(2);
  expect(bodies[1].views).toHaveLength(3);
  expect(bodies[1].expectedVersion).toBe("c".repeat(64));
});

test("detaching the last view persists an empty board and reopening never recreates the source", async () => {
  const saved: { views: (typeof first)[] }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/study/layout") {
        saved.push(JSON.parse(options?.body as string));
        return json({ saved: true, layoutVersion: "c".repeat(64) });
      }
      return json(original);
    }),
  );
  const view = mountBoard();
  await screen.findByText(original.text, { selector: ".original-text" });
  fireEvent.click(screen.getByRole("button", { name: "Stacca vista 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Disposizione salvata.");
  expect(saved[0].views).toEqual([]);
  view.rerender(
    <SourceBoard
      me={me}
      data={{
        ...base,
        layouts: [],
        layoutVersion: "c".repeat(64),
        layoutSaved: true,
      }}
      onUpdate={async () => {}}
      onUse={vi.fn()}
    />,
  );
  expect(document.querySelectorAll(".source-board-view")).toHaveLength(0);
  fireEvent.click(
    screen.getByRole("button", { name: "Apri fonte 1 sul tavolo" }),
  );
  await screen.findByText(original.text, { selector: ".original-text" });
  expect(document.querySelectorAll(".source-board-view")).toHaveLength(1);
});

test("a stale pin keeps its old text and refresh changes only the selected view reference", async () => {
  const bodies: { views: (typeof first)[] }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/study/layout") {
        bodies.push(JSON.parse(options?.body as string));
        return json({ saved: true, layoutVersion: "c".repeat(64) });
      }
      return json(url.endsWith("revision-2") ? head : original);
    }),
  );
  mountBoard(data);
  await waitFor(() =>
    expect(
      document.querySelectorAll(".source-board-view .original-text"),
    ).toHaveLength(2),
  );
  const cards = screen.getAllByRole("article", { name: /Vista della fonte/ });
  expect(within(cards[0]).getByText(original.text)).toBeTruthy();
  expect(within(cards[0]).queryByText(head.text)).toBeNull();
  expect(
    (
      within(cards[0]).getByRole("button", {
        name: "Usa nella consegna",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(
    within(cards[0]).getByRole("button", { name: "Aggiorna questa vista" }),
  );
  await within(cards[0]).findByText(head.text);
  expect(within(cards[1]).getByText(original.text)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Disposizione salvata.");
  expect(bodies[0].views.map((view) => view.pluginState.revisionId)).toEqual([
    head.revisionId,
    original.revisionId,
  ]);
});

test("a layout conflict preserves the draft until explicit discard and server reload", async () => {
  const server = {
    ...base,
    layouts: [{ ...first, bounds: { ...first.bounds, x: 160 } }],
    layoutVersion: "d".repeat(64),
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url === "/study/layout"
        ? json({ error: "stale_layout" }, 409)
        : url.startsWith("/study/workspace")
          ? json(server)
          : json(original),
    ),
  );
  mountBoard();
  await screen.findByText(original.text, { selector: ".original-text" });
  fireEvent.click(
    screen.getByText("Posizione e dimensioni della vista selezionata"),
  );
  const x = screen.getByLabelText(
    "Orizzontale della vista selezionata",
  ) as HTMLInputElement;
  fireEvent.change(x, { target: { value: "80" } });
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Una disposizione più recente è sul server.");
  expect(x.value).toBe("80");
  fireEvent.click(
    screen.getByRole("button", { name: "Ricarica disposizione del server" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Conserva le mie modifiche" }),
  );
  expect(x.value).toBe("80");
  fireEvent.click(
    screen.getByRole("button", { name: "Ricarica disposizione del server" }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ricarica e scarta le modifiche locali",
    }),
  );
  await screen.findByText("Disposizione del server ricaricata.");
  expect(x.value).toBe("160");
});

test("a tutor reopens an authorized submitted revision when the student's private head is absent", async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      return json(original);
    }),
  );
  const received = {
    ...base,
    resources: [],
    layouts: [],
    submissions: [
      {
        id: "submission-1",
        student_id: "student-01",
        revision: 1,
        source_refs: [
          { resourceId: original.id, revisionId: original.revisionId },
        ],
      },
    ],
  };
  render(
    <SourceBoard
      me={{ ...me, id: "tutor-synthetic", role: "teacher" }}
      data={received as unknown as typeof base}
      onUpdate={async () => {}}
      onUse={vi.fn()}
    />,
  );
  expect(document.querySelectorAll(".source-board-view")).toHaveLength(0);
  fireEvent.click(
    screen.getByRole("button", { name: "Apri fonte 1 sul tavolo" }),
  );
  await screen.findByText(original.text, { selector: ".original-text" });
  const card = document.querySelector(".source-board-view");
  expect(card).toBeTruthy();
  expect(
    calls.every(
      (url) => url === "/study/resources/source-1/revisions/revision-1",
    ),
  ).toBe(true);
  expect(calls.length).toBeGreaterThanOrEqual(1);
});

test("reopening an inaccessible revision does not add an empty or substituted view", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => json({ error: "forbidden" }, 403)),
  );
  mountBoard({ ...base, layouts: [] });
  fireEvent.click(
    screen.getByRole("button", { name: "Apri fonte 1 sul tavolo" }),
  );
  await screen.findByRole("alert");
  expect(document.querySelectorAll(".source-board-view")).toHaveLength(0);
});

test("keyboard resizing changes the selected view dimensions without moving its duplicate", async () => {
  const bodies: { views: (typeof first)[] }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url === "/study/layout") {
        bodies.push(JSON.parse(options?.body as string));
        return json({ saved: true, layoutVersion: "c".repeat(64) });
      }
      return json(original);
    }),
  );
  mountBoard({ ...base, layouts: [first, second] });
  await screen.findAllByText(original.text, { selector: ".original-text" });
  fireEvent.click(screen.getByRole("button", { name: "Tavolo" }));
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Ridimensiona vista 2" }),
    { key: "ArrowRight" },
  );
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Sposta vista 2 con le frecce" }),
    { key: "ArrowDown", shiftKey: true },
  );
  fireEvent.click(screen.getByRole("button", { name: "Salva disposizione" }));
  await screen.findByText("Disposizione salvata.");
  expect(bodies[0].views.map((view) => view.bounds)).toEqual([
    first.bounds,
    { ...second.bounds, width: 376, height: 316 },
  ]);
});
