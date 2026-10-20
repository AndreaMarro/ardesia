// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useCourseWorkspace } from "../useCourseWorkspace";
import type { StudyMe } from "../api";
const me: StudyMe = { id: "student", role: "student", synthetic: true };
const edition = (id: string) => ({
  id,
  title: id,
  teacherId: "t",
  capacity: 10,
  priceMinor: 0,
  state: "collecting",
  sessions: [],
  timezone: "Europe/Rome",
  courseId: id,
  packId: id,
  packVersion: 1,
  packSha256: "a".repeat(64),
  subject: id,
  duration: "DRAFT",
});
const workspace = (id: string) => ({
  edition: edition(id),
  enrolled: true,
  resources: [],
  submissions: [],
  layouts: [],
  layoutSaved: false,
  layoutVersion: "v",
});
const json = (value: unknown) => new Response(JSON.stringify(value));
function Probe({ actor = me }: { actor?: StudyMe }) {
  const state = useCourseWorkspace(actor);
  return (
    <>
      <select
        aria-label="Corso"
        value={state.editionId ?? ""}
        onChange={(e) => state.selectEdition(e.target.value)}
      >
        {state.editions.map((e) => (
          <option key={e.id}>{e.id}</option>
        ))}
      </select>
      <p>{state.data?.edition.title ?? "Apertura"}</p>
      <button onClick={() => void state.refresh().catch(() => {})}>
        Rileggi
      </button>
      <p data-testid="session-expired">{String(state.sessionExpired)}</p>
      <button onClick={() => void state.retry()}>Riprova</button>
      <button
        disabled={!state.pagination.hasNext || state.pagination.loading}
        onClick={state.pagination.next}
      >
        Successive
      </button>
      <button
        disabled={!state.pagination.hasPrevious || state.pagination.loading}
        onClick={state.pagination.previous}
      >
        Precedenti
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  history.replaceState(null, "", "/");
});
test.each([
  ["different actor", { id: "student-b", role: "student", synthetic: true }],
  [
    "same id different role",
    { id: "student-a", role: "teacher", synthetic: true },
  ],
] as const)(
  "%s: a new principal cannot request the previous course before its discovery resolves",
  async (_name, nextActor) => {
    let phase = "actor-a";
    const requested: { phase: string; path: string }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string) => {
        requested.push({ phase, path });
        if (path.includes("/editions?"))
          return phase === "actor-a"
            ? json({ items: [edition("course-a")], nextCursor: null })
            : new Promise<Response>(() => {});
        return json(workspace("course-a"));
      }),
    );
    const view = render(
      <Probe actor={{ id: "student-a", role: "student", synthetic: true }} />,
    );
    await screen.findByText("course-a", { selector: "p" });
    phase = "new-principal";
    view.rerender(<Probe actor={nextActor} />);
    expect(screen.queryByText("course-a", { selector: "p" })).toBeNull();
    expect(
      requested.filter(
        (item) =>
          item.phase === "new-principal" && item.path.includes("/workspace?"),
      ),
    ).toEqual([]);
  },
);
test("URL edition and pagination select only authorized courses; late workspace cannot replace the selected course", async () => {
  history.replaceState(null, "", "/?edition=physics&view=classroom");
  let release!: (value: Response) => void;
  const paths: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      paths.push(path);
      if (path.includes("editionId=physics") && path.includes("/editions?"))
        return json({ items: [edition("physics")], nextCursor: null });
      if (path.includes("/editions?"))
        return json(
          path.includes("after=")
            ? { items: [edition("analysis")], nextCursor: null }
            : { items: [edition("physics")], nextCursor: "physics" },
        );
      if (path.endsWith("editionId=physics"))
        return new Promise<Response>((r) => {
          release = r;
        });
      return json(workspace("analysis"));
    }),
  );
  render(<Probe />);
  await waitFor(() => expect(release).toBeTypeOf("function"));
  expect(paths.filter((path) => path.includes("/editions?"))).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Successive" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Corso").children).toHaveLength(2),
  );
  fireEvent.change(screen.getByLabelText("Corso"), {
    target: { value: "analysis" },
  });
  await screen.findByText("analysis", { selector: "p" });
  await act(async () => {
    release(json(workspace("physics")));
  });
  await waitFor(() =>
    expect(screen.queryByText("physics", { selector: "p" })).toBeNull(),
  );
  expect(new URL(location.href).searchParams.get("edition")).toBe("analysis");
  expect(new URL(location.href).searchParams.get("view")).toBe("classroom");
  expect(paths).toContain("/study/editions?limit=50&after=physics");
});
test("changing actor removes the previous workspace before the next listing resolves", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      if (path.includes("/editions?")) {
        calls++;
        return calls === 1
          ? json({ items: [edition("physics")], nextCursor: null })
          : new Promise<Response>(() => {});
      }
      return json(workspace("physics"));
    }),
  );
  const view = render(<Probe />);
  await screen.findByText("physics", { selector: "p" });
  view.rerender(<Probe actor={{ ...me, id: "other-student" }} />);
  expect(screen.queryByText("physics", { selector: "p" })).toBeNull();
  expect(screen.getByLabelText("Corso").children).toHaveLength(0);
});
test("an empty authorized list never requests an arbitrary authenticated workspace", async () => {
  history.replaceState(null, "", "/?edition=private-peer-course");
  const fetcher = vi.fn(async (_path: string) =>
    json({ items: [], nextCursor: null }),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<Probe />);
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(fetcher.mock.calls[0][0]).toContain("/study/editions?");
  expect(fetcher.mock.calls[1][0]).toContain("editionId=private-peer-course");
  expect(
    fetcher.mock.calls.some(([path]) => path.includes("/workspace?")),
  ).toBe(false);
});

function ManagedProbe({ actor = me }: { actor?: StudyMe }) {
  const state = useCourseWorkspace(actor);
  return (
    <>
      <p data-testid="managed-selection">{state.editionId ?? "none"}</p>
      <p data-testid="managed-workspace">
        {state.data?.edition.title ?? "loading"}
      </p>
      <button onClick={() => state.reloadEditions("new-owned")}>
        Rileggi edizioni
      </button>
      <button onClick={() => void state.retry()}>Riprova</button>
      {state.error && <p role="alert">{state.error}</p>}
    </>
  );
}

test("management refresh re-fetches the authorized listing before selecting a created edition", async () => {
  let listings = 0;
  let release!: (value: Response) => void;
  const paths: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      paths.push(path);
      if (path.includes("/editions?")) {
        listings++;
        return listings === 1
          ? json({ items: [edition("physics")], nextCursor: null })
          : new Promise<Response>((resolve) => {
              release = resolve;
            });
      }
      return json(
        workspace(path.endsWith("new-owned") ? "new-owned" : "physics"),
      );
    }),
  );
  render(<ManagedProbe />);
  await waitFor(() =>
    expect(screen.getByTestId("managed-workspace").textContent).toBe("physics"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Rileggi edizioni" }));
  await waitFor(() => expect(release).toBeTypeOf("function"));
  expect(
    paths.some(
      (path) => path.includes("workspace?") && path.endsWith("new-owned"),
    ),
  ).toBe(false);
  await act(async () => {
    release(
      json({
        items: [edition("physics"), edition("new-owned")],
        nextCursor: null,
      }),
    );
  });
  await waitFor(() =>
    expect(screen.getByTestId("managed-workspace").textContent).toBe(
      "new-owned",
    ),
  );
  expect(screen.getByTestId("managed-selection").textContent).toBe("new-owned");
  expect(listings).toBe(2);
});

test("a preferred id absent from the fresh authorized listing is never selected", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) =>
      path.includes("editionId=new-owned") && path.includes("/editions?")
        ? json({ items: [], nextCursor: null })
        : path.includes("/editions?")
          ? json({ items: [edition("physics")], nextCursor: null })
          : json(workspace("physics")),
    ),
  );
  render(<ManagedProbe />);
  await waitFor(() =>
    expect(screen.getByTestId("managed-workspace").textContent).toBe("physics"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Rileggi edizioni" }));
  await waitFor(() =>
    expect(
      (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([path]) =>
        path.includes("/editions?"),
      ).length,
    ).toBe(3),
  );
  expect(screen.getByTestId("managed-selection").textContent).toBe("physics");
  expect(
    (fetch as ReturnType<typeof vi.fn>).mock.calls.some(
      ([path]) => path.includes("workspace?") && path.endsWith("new-owned"),
    ),
  ).toBe(false);
});

test("discovery failure retries discovery even when no edition was selected", async () => {
  let listings = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      if (path.includes("/editions?"))
        return ++listings === 1
          ? new Response(JSON.stringify({ error: "provider_unavailable" }), {
              status: 503,
            })
          : json({ items: [edition("physics")], nextCursor: null });
      return json(workspace("physics"));
    }),
  );
  render(<Probe />);
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Corso").children).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await screen.findByText("physics", { selector: "p" });
  expect(listings).toBe(2);
});

test("a deep URL needs one exact authorized lookup, without fetching every page", async () => {
  history.replaceState(null, "", "/?edition=deep&view=classroom");
  const paths: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      paths.push(path);
      if (path.includes("/editions?"))
        return json(
          path.includes("editionId=deep")
            ? { items: [edition("deep")], nextCursor: null }
            : {
                items: Array.from({ length: 50 }, (_, i) =>
                  edition("first-" + i),
                ),
                nextCursor: "first-49",
              },
        );
      return json(workspace("deep"));
    }),
  );
  render(<Probe />);
  await screen.findByText("deep", { selector: "p" });
  expect(screen.getByLabelText("Corso").children).toHaveLength(51);
  expect(paths.filter((path) => path.includes("/editions?"))).toHaveLength(2);
  expect(paths.some((path) => path.includes("after="))).toBe(false);
});

test("page changes keep the selected workspace and load only the requested page", async () => {
  const paths: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      paths.push(path);
      if (path.includes("/editions?"))
        return json(
          path.includes("editionId=physics")
            ? { items: [edition("physics")], nextCursor: null }
            : path.includes("after=")
              ? { items: [edition("analysis")], nextCursor: null }
              : { items: [edition("physics")], nextCursor: "physics" },
        );
      return json(workspace("physics"));
    }),
  );
  render(<Probe />);
  await screen.findByText("physics", { selector: "p" });
  fireEvent.click(screen.getByRole("button", { name: "Successive" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Corso").children).toHaveLength(2),
  );
  expect(screen.getByText("physics", { selector: "p" })).toBeTruthy();
  expect(new URL(location.href).searchParams.get("edition")).toBe("physics");
  expect(paths.filter((path) => path.includes("/workspace?"))).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Precedenti" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Corso").children).toHaveLength(1),
  );
  expect(paths.filter((path) => path.includes("after="))).toHaveLength(1);
});

test("a membership revoked between discovery and workspace clears cached course data", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) =>
      path.includes("/editions?")
        ? json({ items: [edition("physics")], nextCursor: null })
        : json({ ...workspace("physics"), enrolled: false }),
    ),
  );
  render(<Probe />);
  await screen.findByRole("alert");
  expect(screen.queryByText("physics", { selector: "p" })).toBeNull();
  expect(screen.getByLabelText("Corso").children).toHaveLength(0);
  expect(new URL(location.href).searchParams.has("edition")).toBe(false);
});

test("a created preference survives a failed exact lookup and uses a fresh listing on retry", async () => {
  let lookups = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      if (path.includes("/editions?")) {
        if (path.includes("editionId=new-owned"))
          return ++lookups === 1
            ? new Response(JSON.stringify({ error: "provider_unavailable" }), {
                status: 503,
              })
            : json({ items: [edition("new-owned")], nextCursor: null });
        return json({ items: [edition("physics")], nextCursor: "physics" });
      }
      return json(
        workspace(path.endsWith("new-owned") ? "new-owned" : "physics"),
      );
    }),
  );
  render(<ManagedProbe />);
  await waitFor(() =>
    expect(screen.getByTestId("managed-workspace").textContent).toBe("physics"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Rileggi edizioni" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await waitFor(() =>
    expect(screen.getByTestId("managed-workspace").textContent).toBe(
      "new-owned",
    ),
  );
  expect(lookups).toBe(2);
});

function ExpiryProbe() {
  const state = useCourseWorkspace(me);
  return (
    <>
      <p data-testid="current-data">{state.data?.edition.id ?? "none"}</p>
      <p data-testid="listed-data">
        {state.editions.map((item) => item.id).join(",")}
      </p>
      <p data-testid="expired">{String(state.sessionExpired)}</p>
      <button onClick={() => state.selectEdition("b")}>B</button>
      <button onClick={() => state.selectEdition("a")}>A</button>
      <button onClick={() => void state.refresh().catch(() => {})}>
        Refresh
      </button>
      <button onClick={state.pagination.next}>Next</button>
      {state.error && <p role="alert">{state.error}</p>}
    </>
  );
}

test.each(["not-enrolled", 403, 404] as const)(
  "a scoped denial %s still permits another independently listed course",
  async (denial) => {
    const paths: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string) => {
        paths.push(path);
        if (path.includes("/editions?"))
          return json({
            items: [edition("physics"), edition("b")],
            nextCursor: null,
          });
        if (path.endsWith("editionId=physics"))
          return denial === "not-enrolled"
            ? json({ ...workspace("physics"), enrolled: false })
            : new Response(
                JSON.stringify({
                  error: denial === 403 ? "forbidden" : "not_found",
                }),
                { status: denial },
              );
        return json(workspace("b"));
      }),
    );
    render(<Probe />);
    await screen.findByRole("alert");
    expect(screen.getByTestId("session-expired").textContent).toBe("false");
    fireEvent.change(screen.getByLabelText("Corso"), {
      target: { value: "b" },
    });
    await screen.findByText("b", { selector: "p" });
    expect(
      paths.filter((path) => path.endsWith("/workspace?editionId=b")),
    ).toHaveLength(1);
  },
);

test.each(["workspace", "discovery"] as const)(
  "a known session 401 from %s clears all cached courses until reauthentication",
  async (phase) => {
    let expired = false;
    const afterExpiry: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string) => {
        if (expired) {
          afterExpiry.push(path);
          return new Response(JSON.stringify({ error: "unauthenticated" }), {
            status: 401,
          });
        }
        if (path.includes("/editions?"))
          return json({ items: [edition("a"), edition("b")], nextCursor: "b" });
        return json(
          workspace(
            new URL(path, "http://localhost").searchParams.get("editionId")!,
          ),
        );
      }),
    );
    render(<ExpiryProbe />);
    await waitFor(() =>
      expect(screen.getByTestId("current-data").textContent).toBe("a"),
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    await waitFor(() =>
      expect(screen.getByTestId("current-data").textContent).toBe("b"),
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    await waitFor(() =>
      expect(screen.getByTestId("current-data").textContent).toBe("a"),
    );
    expired = true;
    fireEvent.click(
      screen.getByRole("button", {
        name: phase === "workspace" ? "Refresh" : "Next",
      }),
    );
    await screen.findByRole("alert");
    expect(screen.getByTestId("expired").textContent).toBe("true");
    expect(screen.getByTestId("listed-data").textContent).toBe("");
    expect(screen.getByTestId("current-data").textContent).toBe("none");
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(screen.getByTestId("current-data").textContent).toBe("none");
    expect(afterExpiry).toHaveLength(1);
  },
);
