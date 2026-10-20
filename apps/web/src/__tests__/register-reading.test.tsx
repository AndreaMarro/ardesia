// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import RegisterContent from "../register/RegisterContent";
import { isAttendance } from "../register/validation";
import { clearResourceDrafts } from "../components/sessionDraftCache";
import { studySessionEpoch } from "../../../studio/src/study/sessionBoundary";
import { attendance, attendanceRecord, deferred, edition, emptyPayments, json, payment, tutor } from "./register-fixtures";
afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); });
function content(editionId = "fluidi") { return <RegisterContent key={editionId} edition={{ ...edition, id: editionId }} me={tutor} epoch={studySessionEpoch()} scope={"tutor:" + editionId} />; }
test("incomplete/cross-person attendance cells are rejected instead of inventing unrecorded states", () => {
  const data = attendance(); data.cells.pop(); expect(isAttendance(data, "fluidi")).toBe(false);
  const crossed = attendance(); crossed.cells[0].studentId = "someone-else"; expect(isAttendance(crossed, "fluidi")).toBe(false);
  const duplicate = attendance(); duplicate.cells[1] = duplicate.cells[0]; expect(isAttendance(duplicate, "fluidi")).toBe(false);
  const badPin = attendance(); badPin.cells[0].record = attendanceRecord({ studentId: "someone-else" }); expect(isAttendance(badPin, "fluidi")).toBe(false);
});
test("zero calendar dates leaves manual ledger usable, without manufacturing attendance actions", async () => {
  const data = { ...attendance(), calendarReady: false, sessions: [], cells: [] };
  vi.stubGlobal("fetch", vi.fn(async (path: string) => json(path.includes("manual-payments") ? emptyPayments() : data)));
  render(content()); await screen.findByText(/Prepara le quattro date/);
  expect(screen.getByText("Nuova annotazione manuale", { selector: "summary" })).toBeTruthy();
  expect(screen.queryByLabelText("Incontro")).toBeNull();
});
test("late old-course reads and wrong-edition projections never appear beneath the next course", async () => {
  const old = deferred<Response>();
  const fetcher = vi.fn((path: string) => path.includes("/fluidi/") ? old.promise : Promise.resolve(json(path.includes("manual-payments") ? emptyPayments() : attendance("analisi"))));
  vi.stubGlobal("fetch", fetcher); const view = render(content());
  view.rerender(content("analisi")); await screen.findByRole("heading", { name: "Presenze" });
  await act(async () => old.resolve(json({ ...attendance(), roster: [{ studentId: "PRIVATE-OLD-STUDENT" }] })));
  expect(screen.queryByText("PRIVATE-OLD-STUDENT")).toBeNull();
  view.unmount(); fetcher.mockImplementation(async (path: string) => json(path.includes("manual-payments") ? emptyPayments() : attendance("fluidi")));
  render(content("analisi")); await screen.findByText(/risposta del registro non è leggibile/);
  expect(screen.queryByRole("heading", { name: "Presenze" })).toBeNull();
});
test("manual ledger page cursor is opaque and advances only on an explicit request; summary is server-wide", async () => {
  const cursor = "next:+/= Unicode à";
  const first = { ...emptyPayments(), nextCursor: cursor, summary: { ...emptyPayments().summary, totalMinor: 12300, recordedCount: 3 } };
  const fetcher = vi.fn(async (path: string) => json(!path.includes("manual-payments") ? attendance() : path.includes("after=") ? emptyPayments() : first));
  vi.stubGlobal("fetch", fetcher); render(content()); await screen.findByText(/123,00/);
  expect(fetcher).toHaveBeenCalledTimes(2);
  const pages = screen.getByRole("navigation", { name: "Pagine delle annotazioni manuali" });
  fireEvent.click(within(pages).getByRole("button", { name: "Pagina successiva" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  const url = new URL(fetcher.mock.calls[2][0], "http://local.invalid"); expect(url.searchParams.get("after")).toBe(cursor); expect(url.searchParams.get("limit")).toBe("20");
});
test("history mounts on disclosure and filters the exact historical session/person; arbitrary references render as inert text", async () => {
  const data = attendance(), record = attendanceRecord();
  data.cells[0] = { ...data.cells[0], recordId: record.recordId, record, revision: 1, status: "PRESENT", canCorrect: true };
  const manual = payment({ externalReference: '<img src=x onerror="alert(1)">' });
  const fetcher = vi.fn(async (path: string) => json(path.includes("/history") ? { items: [record], nextCursor: null } : path.includes("manual-payments") ? { ...emptyPayments(), items: [manual] } : data));
  vi.stubGlobal("fetch", fetcher); render(content()); await screen.findByRole("heading", { name: "Presenze" });
  expect(fetcher.mock.calls.some(([path]) => path.includes("/history"))).toBe(false);
  expect(screen.getByText(manual.externalReference)).toBeTruthy(); expect(document.querySelector("img")).toBeNull();
  fireEvent.click(screen.getByText("Storia per student-01", { selector: "summary" }));
  await screen.findByText("Revisione 1 · Presente");
  const path = fetcher.mock.calls.find(([path]) => path.includes("/attendance/history"))![0]; const url = new URL(path, "http://local.invalid");
  expect(url.searchParams.get("sessionId")).toBe(record.sessionId); expect(url.searchParams.get("studentId")).toBe(record.studentId); expect(url.searchParams.get("limit")).toBe("20");
});
test("history refuses a same-edition record belonging to another person/session instead of relabelling it", async () => {
  const data = attendance(), record = attendanceRecord();
  data.cells[0] = { ...data.cells[0], recordId: record.recordId, record, revision: 1, status: "PRESENT", canCorrect: true };
  const crossed = attendanceRecord({ studentId: "PRIVATE-OTHER-PERSON", reason: "Wrong historical source" });
  vi.stubGlobal("fetch", vi.fn(async (path: string) => json(path.includes("/history") ? { items: [crossed], nextCursor: null }
    : path.includes("manual-payments") ? emptyPayments() : data)));
  render(content()); await screen.findByRole("heading", { name: "Presenze" });
  fireEvent.click(screen.getByText("Storia per student-01", { selector: "summary" }));
  await screen.findByText(/risposta del registro non è leggibile/);
  expect(screen.queryByText("Wrong historical source")).toBeNull();
});
test("an explicit reread uses the new server permission when an encounter becomes recordable, with no client clock inference", async () => {
  let latest = attendance();
  const fetcher = vi.fn(async (path: string) => json(path.includes("manual-payments") ? emptyPayments() : latest)); vi.stubGlobal("fetch", fetcher);
  render(content()); await screen.findByRole("heading", { name: "Presenze" });
  expect(screen.queryByRole("button", { name: "Registra per student-01" })).toBeNull();
  latest = attendance(); latest.cells[0].canRecord = true;
  fireEvent.click(screen.getByRole("button", { name: "Rileggi le presenze" }));
  await screen.findByRole("button", { name: "Registra per student-01" });
  expect(fetcher.mock.calls.filter(([path]) => path.endsWith("/attendance"))).toHaveLength(2);
});
