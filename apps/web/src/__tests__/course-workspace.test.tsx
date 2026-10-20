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
      <button onClick={() => void state.refresh()}>Rileggi</button>
      {state.error && <p role="alert">{state.error}</p>}
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  history.replaceState(null, "", "/");
});
test("URL edition and pagination select only authorized courses; late workspace cannot replace the selected course", async () => {
  history.replaceState(null, "", "/?edition=physics&view=classroom");
  let release!: (value: Response) => void;
  const paths: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      paths.push(path);
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
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  expect(fetcher.mock.calls[0][0]).toContain("/study/editions?");
});

function ManagedProbe({ actor = me }: { actor?: StudyMe }) {
  const state = useCourseWorkspace(actor);
  return <>
    <p data-testid="managed-selection">{state.editionId ?? "none"}</p>
    <p data-testid="managed-workspace">{state.data?.edition.title ?? "loading"}</p>
    <button onClick={() => state.reloadEditions("new-owned")}>Rileggi edizioni</button>
    {state.error && <p role="alert">{state.error}</p>}
  </>;
}

test("management refresh re-fetches the authorized listing before selecting a created edition", async () => {
  let listings = 0;
  let release!: (value: Response) => void;
  const paths: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (path: string) => {
    paths.push(path);
    if (path.includes("/editions?")) {
      listings++;
      return listings === 1 ? json({ items: [edition("physics")], nextCursor: null }) : new Promise<Response>((resolve) => { release = resolve; });
    }
    return json(workspace(path.endsWith("new-owned") ? "new-owned" : "physics"));
  }));
  render(<ManagedProbe />);
  await waitFor(() => expect(screen.getByTestId("managed-workspace").textContent).toBe("physics"));
  fireEvent.click(screen.getByRole("button", { name: "Rileggi edizioni" }));
  await waitFor(() => expect(release).toBeTypeOf("function"));
  expect(paths.some((path) => path.includes("workspace?") && path.endsWith("new-owned"))).toBe(false);
  await act(async () => { release(json({ items: [edition("physics"), edition("new-owned")], nextCursor: null })); });
  await waitFor(() => expect(screen.getByTestId("managed-workspace").textContent).toBe("new-owned"));
  expect(screen.getByTestId("managed-selection").textContent).toBe("new-owned");
  expect(listings).toBe(2);
});

test("a preferred id absent from the fresh authorized listing is never selected", async () => {
  vi.stubGlobal("fetch", vi.fn(async (path: string) => path.includes("/editions?") ? json({ items: [edition("physics")], nextCursor: null }) : json(workspace("physics"))));
  render(<ManagedProbe />);
  await waitFor(() => expect(screen.getByTestId("managed-workspace").textContent).toBe("physics"));
  fireEvent.click(screen.getByRole("button", { name: "Rileggi edizioni" }));
  await waitFor(() => expect((fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([path]) => path.includes("/editions?")).length).toBe(2));
  expect(screen.getByTestId("managed-selection").textContent).toBe("physics");
  expect((fetch as ReturnType<typeof vi.fn>).mock.calls.some(([path]) => path.includes("workspace?") && path.endsWith("new-owned"))).toBe(false);
});
