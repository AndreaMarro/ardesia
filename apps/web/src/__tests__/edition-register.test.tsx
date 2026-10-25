// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EditionRegister } from "../register/EditionRegister";
import { parseEuro } from "../register/contracts";
import { clearResourceDrafts } from "../components/sessionDraftCache";
const me = { id: "tutor", role: "teacher" as const, synthetic: true as const };
const edition = { id: "fluidi", teacherId: me.id, capacity: 10, priceMinor: 4900,
  state: "offered", sessions: [], timezone: "Europe/Rome", title: "Fluidi" };
const session = { sessionId: "a".repeat(32), ordinal: 1, startUtc: "2026-01-01T09:00:00Z", endUtc: "2026-01-01T10:30:00Z",
  startLocal: "2026-01-01T10:00:00", endLocal: "2026-01-01T11:30:00", displayTimezone: "Europe/Rome" };
const attendance = { editionId: "fluidi", managementRevision: 2, serverTime: 1792480000,
  timezone: "Europe/Rome", mode: "test", calendarReady: true,
  admission: { interestCount: 2, activeHoldCount: 1, confirmedCount: 1, waitlistedCount: 1 },
  roster: [{ studentId: "student-01" }], sessions: Array.from({ length: 4 }, (_, index) => ({ ...session, sessionId: String(index + 1).repeat(32), ordinal: index + 1 })), cells: Array.from({ length: 4 }, (_, index) => ({
    sessionId: String(index + 1).repeat(32), studentId: "student-01", status: "UNRECORDED", revision: 0,
    recordId: null, canRecord: false, canCorrect: false, calendarConflict: false, record: null,
  })) };
const payments = { items: [], nextCursor: null,
  summary: { totalMinor: 0, recordedCount: 0, voidedCount: 0, currency: "EUR", mode: "test", verification: "MANUAL_DECLARATIONS_ONLY" } };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); });
function mockRead() {
  const fetcher = vi.fn(async (path: string) => json(path.includes("manual-payments") ? payments : attendance));
  vi.stubGlobal("fetch", fetcher); return fetcher;
}
function openRegister() {
  fireEvent.click(screen.getByText("Registro dell’edizione", { exact: true }));
}
test("registry stays unmounted when closed and is absent for student/other tutor", () => {
  const fetcher = mockRead();
  const view = render(<EditionRegister me={me} edition={edition} />);
  expect(fetcher).not.toHaveBeenCalled(); view.unmount();
  const other = render(<EditionRegister me={{ ...me, id: "other" }} edition={edition} />);
  expect(screen.queryByText("Registro dell’edizione")).toBeNull(); other.unmount();
  render(<EditionRegister me={{ ...me, role: "student" }} edition={edition} />);
  expect(screen.queryByText("Registro dell’edizione")).toBeNull(); expect(fetcher).not.toHaveBeenCalled();
});
test("opening reads the selected edition and keeps four lanes distinct; server canRecord forbids an old-date cell", async () => {
  const fetcher = mockRead(); render(<EditionRegister me={me} edition={edition} />); openRegister();
  await act(async () => { await vi.dynamicImportSettled(); });
  await screen.findByRole("heading", { name: "Presenze" });
  for (const name of ["Interesse", "Riserva e iscrizione", "Incassi manuali", "Presenze dichiarate"])
    expect(screen.getByText(name, { exact: true })).toBeTruthy();
  expect(screen.getByText("Non registrata", { exact: true })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Registra per student-01/ })).toBeNull();
  expect(fetcher.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining([
    "/study/admin/editions/fluidi/attendance", "/study/admin/editions/fluidi/manual-payments?limit=20",
  ]));
});
test("money input keeps cents exact and rejects ambiguous/zero/over-limit values", () => {
  expect(parseEuro("49,01")).toBe(4901); expect(parseEuro("0.01")).toBe(1);
  expect(parseEuro("10000")).toBe(1000000);
  for (const value of ["", "0", "1.000", "-1", "10000,01", "1e2"]) expect(parseEuro(value)).toBeNull();
});
