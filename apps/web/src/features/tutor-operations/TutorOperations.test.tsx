// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TutorOperations } from "./TutorOperations";
import { attendance, edition, emptyPayments, json, tutor, deferred } from "../../__tests__/register-fixtures";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
// details.toggle is queued by jsdom. Dispatch the same native event explicitly
// so the test controls when the deferred subtree is mounted.
const open = () => {
  const details = screen.getByText("Posti, persone e riepilogo economico").parentElement as HTMLDetailsElement;
  details.open = true;
  fireEvent(details, new Event("toggle"));
};
function reads() {
  const fetcher = vi.fn(async (path: string) => json(path.includes("manual-payments") ? emptyPayments() : path.endsWith("/access") ? { members: ["student-01"], waitlist: ["student-wait"] } : path.endsWith("/fluidi") ? { ...edition, managementRevision: 2 } : attendance()));
  vi.stubGlobal("fetch", fetcher); return fetcher;
}
test("private projections stay closed until requested and absent for another tutor/student", () => {
  const fetcher = reads();
  const first = render(<TutorOperations me={tutor} edition={edition} editions={[edition]} />);
  expect(fetcher).not.toHaveBeenCalled(); first.unmount();
  const second = render(<TutorOperations me={{ ...tutor, id: "other" }} edition={edition} editions={[edition]} />);
  expect(screen.queryByLabelText("Gestione operativa tutor")).toBeNull(); second.unmount();
  render(<TutorOperations me={{ ...tutor, role: "student" }} edition={edition} editions={[edition]} />);
  expect(fetcher).not.toHaveBeenCalled();
});
test("opens actual register endpoints and distinguishes forecast, manual declarations and dues", async () => {
  const fetcher = reads(); render(<TutorOperations me={tutor} edition={edition} editions={[edition]} />); open();
  await screen.findByRole("heading", { name: "Previsione e incassi, distinti" });
  expect(fetcher.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining([
    "/study/admin/editions/fluidi/attendance", "/study/admin/editions/fluidi/manual-payments?limit=20", "/study/editions/fluidi/access",
  ]));
  expect(screen.getByText("non determinati")).toBeTruthy();
  expect(screen.getByText("student-wait")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Esporta presenze CSV" })).toBeTruthy();
});
test("late responses from previous edition cannot display its people or money", async () => {
  const old = deferred<Response>();
  vi.stubGlobal("fetch", vi.fn((path: string) => path.includes("fluidi") ? old.promise : Promise.resolve(json(path.includes("manual-payments") ? emptyPayments() : path.endsWith("/access") ? { members: [], waitlist: [] } : path.endsWith("/new") ? { ...edition, id: "new", managementRevision: 2 } : { ...attendance("new"), admission: { interestCount: 0, activeHoldCount: 0, confirmedCount: 0, waitlistedCount: 0 }, roster: [], cells: [] }))));
  const view = render(<TutorOperations me={tutor} edition={edition} editions={[edition]} />); open();
  view.rerender(<TutorOperations me={tutor} edition={{ ...edition, id: "new" }} editions={[edition]} />); open();
  await screen.findByRole("heading", { name: "Previsione e incassi, distinti" });
  await act(async () => old.resolve(json(attendance())));
  expect(screen.queryByText("student-01")).toBeNull();
});
test("forbidden refresh removes data and export actions", async () => {
  const fetcher = reads(); render(<TutorOperations me={tutor} edition={edition} editions={[edition]} />); open();
  await screen.findByText("student-wait");
  fetcher.mockImplementation(async () => json({ error: "forbidden" }, 403));
  fireEvent.click(screen.getByRole("button", { name: "Aggiorna riepilogo" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("student-wait")).toBeNull();
  expect(screen.queryByRole("button", { name: "Esporta presenze CSV" })).toBeNull();
});
