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
