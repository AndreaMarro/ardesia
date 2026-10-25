// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ManualPayments } from "../register/ManualPayments";
import { AttendanceRegister } from "../register/AttendanceRegister";
import { clearResourceDrafts } from "../components/sessionDraftCache";
import { beginStudySessionCheck, studySessionEpoch } from "../../../studio/src/study/sessionBoundary";
import { ack, attendance, attendanceRecord, deferred, emptyPayments, id, json, payment } from "./register-fixtures";
const refresh = vi.fn();
afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); refresh.mockClear(); });
function paymentsView(editionId = "fluidi", actor = "tutor", data = emptyPayments()) {
  return <ManualPayments key={`${actor}:${editionId}:${studySessionEpoch()}`} data={data} attendance={attendance(editionId)} scope={actor + editionId}
    actor={actor} epoch={studySessionEpoch()} refresh={refresh} busy={false} onNext={() => {}} onBack={() => {}} canBack={false} />;
}
function fillPayment(reference = "Carta A/01") {
  fireEvent.click(screen.getByText("Nuova annotazione manuale", { selector: "summary" }));
  fireEvent.change(screen.getByLabelText("Partecipante"), { target: { value: "student-01" } });
  fireEvent.change(screen.getByLabelText("Importo (€)"), { target: { value: "49,01" } });
  fireEvent.change(screen.getByLabelText("Riferimento esterno"), { target: { value: reference } });
}
test("manual declaration waits for ACK, prevents double submit and retries exactly the same key/body after lost ACK", async () => {
  const response = deferred<Response>();
  const fetcher = vi.fn().mockReturnValueOnce(response.promise).mockResolvedValueOnce(json(ack())); vi.stubGlobal("fetch", fetcher);
  render(paymentsView()); fillPayment();
  const form = screen.getByRole("form", { name: "Nuova annotazione manuale" });
  fireEvent.submit(form); fireEvent.submit(form);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
  expect(screen.getByLabelText("Importo (€)").matches(":disabled")).toBe(true);
  await act(async () => response.resolve(json({ error: "temporarily_unavailable" }, 503)));
  expect((screen.getByLabelText("Importo (€)") as HTMLInputElement).value).toBe("49,01");
  fireEvent.submit(form);
  await screen.findByText(/Annotazione manuale acquisita/);
  expect(fetcher).toHaveBeenCalledTimes(2);
  const first = fetcher.mock.calls[0], retry = fetcher.mock.calls[1];
  expect(first[0]).toBe("/study/admin/editions/fluidi/manual-payments");
  expect(JSON.parse(first[1].body)).toEqual({ studentId: "student-01", amountMinor: 4901, currency: "EUR", externalReference: "Carta A/01" });
  expect(retry[1].body).toBe(first[1].body);
  expect(new Headers(retry[1].headers).get("Idempotency-Key")).toBe(new Headers(first[1].headers).get("Idempotency-Key"));
  expect(refresh).toHaveBeenCalledTimes(1);
});
test("a wrong-edition ACK keeps the declaration draft and never announces it saved", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(ack({ editionId: "other" })))); render(paymentsView()); fillPayment();
  fireEvent.submit(screen.getByRole("form", { name: "Nuova annotazione manuale" }));
  await screen.findByText(/risposta del registro non è leggibile/);
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("Carta A/01");
});
test("void is a reasoned new revision, omits amount, and summary uses the server latest-entry aggregate", async () => {
  const record = payment();
  const data = { ...emptyPayments(), items: [record], summary: { ...emptyPayments().summary, totalMinor: 0, recordedCount: 0, voidedCount: 1 } };
  const fetcher = vi.fn().mockResolvedValue(json(ack({ revision: 2, status: "VOIDED" }))); vi.stubGlobal("fetch", fetcher);
  render(paymentsView("fluidi", "tutor", data));
  expect(screen.getByText("Somma delle annotazioni attive").nextElementSibling?.textContent).toMatch(/0,00/);
  fireEvent.click(screen.getByRole("button", { name: "Rettifica annotazione " + record.externalReference }));
  fireEvent.change(screen.getByLabelText("Tipo di rettifica"), { target: { value: "VOIDED" } });
  const form = screen.getByRole("form", { name: "Rettifica annotazione manuale" });
  fireEvent.submit(form); expect(fetcher).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Motivo della rettifica di incasso"), { target: { value: "Destinatario errato: annullo prima di inserire una nuova dichiarazione." } });
  fireEvent.submit(form); await screen.findByText(/Rettifica manuale acquisita/);
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ expectedRevision: 1, targetRecordId: record.recordId, status: "VOIDED", reason: "Destinatario errato: annullo prima di inserire una nuova dichiarazione." });
  expect(fetcher.mock.calls[0][0]).toBe(`/study/admin/editions/fluidi/manual-payments/${record.entryId}/revisions`);
});
test("attendance correction keeps the exact historical session and management snapshot after calendar change", async () => {
  const data = attendance(), record = attendanceRecord();
  data.managementRevision = 3;
  data.cells[0] = { ...data.cells[0], record, recordId: record.recordId, revision: 1, canCorrect: true, calendarConflict: true };
  data.sessions[0].sessionId = id("e"); data.cells[0].sessionId = id("e");
  const fetcher = vi.fn().mockResolvedValue(json(ack({ revision: 2, status: "ABSENT", entryId: undefined }))); vi.stubGlobal("fetch", fetcher);
  render(<AttendanceRegister data={data} scope="tutor-fluidi" actor="tutor" epoch={studySessionEpoch()} refresh={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "Rettifica per student-01" }));
  fireEvent.change(screen.getByLabelText("Stato di presenza"), { target: { value: "ABSENT" } });
  const form = screen.getByRole("form", { name: "Dichiarazione di presenza" }); fireEvent.submit(form); expect(fetcher).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Motivo della rettifica"), { target: { value: "Correzione della dichiarazione del primo incontro." } });
  fireEvent.submit(form); await screen.findByText(/Dichiarazione manuale acquisita/);
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ sessionId: record.sessionId, studentId: record.studentId, status: "ABSENT", expectedRevision: 1,
    expectedManagementRevision: 2, targetRecordId: record.recordId, reason: "Correzione della dichiarazione del primo incontro." });
});
test("drafts follow actor and edition; late origin ACK clears only origin while another edition stays untouched", async () => {
  const response = deferred<Response>(); const fetcher = vi.fn().mockReturnValue(response.promise); vi.stubGlobal("fetch", fetcher);
  const view = render(paymentsView()); fillPayment("Origine A");
  fireEvent.submit(screen.getByRole("form", { name: "Nuova annotazione manuale" }));
  view.rerender(paymentsView("analisi")); fillPayment("Bozza B");
  await act(async () => response.resolve(json(ack())));
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("Bozza B");
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
  view.rerender(paymentsView());
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("");
  expect(screen.getByText(/Annotazione manuale acquisita/)).toBeTruthy();
  view.rerender(paymentsView("analisi"));
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("Bozza B");
  view.rerender(paymentsView("analisi", "other-tutor"));
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("");
});
test("logout epoch blocks a late ACK from recreating private drafts or confirmation on the next session", async () => {
  const response = deferred<Response>(); vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
  const view = render(paymentsView()); fillPayment("Prima del logout");
  fireEvent.submit(screen.getByRole("form", { name: "Nuova annotazione manuale" })); view.unmount();
  beginStudySessionCheck(); clearResourceDrafts();
  await act(async () => response.resolve(json(ack())));
  render(paymentsView()); expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("");
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
});
test("stale correction preserves fields and requires explicit adoption of the refreshed revision", async () => {
  const original = payment(), updated = payment({ recordId: id("e"), revision: 2 });
  const fetcher = vi.fn().mockResolvedValue(json({ error: "stale_admin_record" }, 409)); vi.stubGlobal("fetch", fetcher);
  const withRecord = (record: typeof original) => ({ ...emptyPayments(), items: [record] });
  const view = render(paymentsView("fluidi", "tutor", withRecord(original)));
  fireEvent.click(screen.getByRole("button", { name: "Rettifica annotazione " + original.externalReference }));
  fireEvent.change(screen.getByLabelText("Importo rettificato (€)"), { target: { value: "48,20" } });
  fireEvent.change(screen.getByLabelText("Motivo della rettifica di incasso"), { target: { value: "Verifica ricevuta cartacea" } });
  const form = screen.getByRole("form", { name: "Rettifica annotazione manuale" }); fireEvent.submit(form);
  await screen.findByText(/Questo record è cambiato/);
  fireEvent.click(screen.getByRole("button", { name: "Rileggi le annotazioni" })); expect(refresh).toHaveBeenCalledTimes(1);
  view.rerender(paymentsView("fluidi", "tutor", withRecord(updated)));
  expect((screen.getByLabelText("Importo rettificato (€)") as HTMLInputElement).value).toBe("48,20");
  fireEvent.submit(form); expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Rivedi la rettifica sulla revisione corrente" }));
  fetcher.mockResolvedValue(json(ack({ revision: 3 })));
  fireEvent.submit(form); await screen.findByText(/Rettifica manuale acquisita/);
  const first = fetcher.mock.calls[0][1], next = fetcher.mock.calls[1][1];
  expect(JSON.parse(next.body)).toEqual({ expectedRevision: 2, targetRecordId: updated.recordId, status: "RECORDED_MANUALLY", amountMinor: 4820, reason: "Verifica ricevuta cartacea" });
  expect(new Headers(first.headers).get("Idempotency-Key")).not.toBe(new Headers(next.headers).get("Idempotency-Key"));
});
test("a new edit on the origin course survives an older pending ACK and is never labelled saved", async () => {
  const response = deferred<Response>(); vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
  const view = render(paymentsView()); fillPayment("Prima dichiarazione");
  fireEvent.submit(screen.getByRole("form", { name: "Nuova annotazione manuale" }));
  view.rerender(paymentsView("analisi")); view.rerender(paymentsView());
  fireEvent.change(screen.getByLabelText("Riferimento esterno"), { target: { value: "Nuova bozza non inviata" } });
  await act(async () => response.resolve(json(ack())));
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("Nuova bozza non inviata");
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
});
test("manual ACK without its canonical entry/receipt identifiers does not confirm or clear the draft", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(ack({ entryId: undefined, receiptId: "not-a-receipt" }))));
  render(paymentsView()); fillPayment(); fireEvent.submit(screen.getByRole("form", { name: "Nuova annotazione manuale" }));
  await screen.findByText(/risposta del registro non è leggibile/);
  expect(screen.queryByText(/Annotazione manuale acquisita/)).toBeNull();
  expect((screen.getByLabelText("Riferimento esterno") as HTMLInputElement).value).toBe("Carta A/01");
});
test("a first attendance declaration sends only the selected server snapshot and explicit status, then waits for ACK", async () => {
  const data = attendance(); data.cells[0].canRecord = true;
  const response = deferred<Response>(); const fetcher = vi.fn().mockReturnValue(response.promise); vi.stubGlobal("fetch", fetcher);
  render(<AttendanceRegister data={data} scope="tutor-fluidi" actor="tutor" epoch={studySessionEpoch()} refresh={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "Registra per student-01" }));
  const form = screen.getByRole("form", { name: "Dichiarazione di presenza" });
  fireEvent.submit(form); expect(fetcher).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Stato di presenza"), { target: { value: "PRESENT" } });
  fireEvent.submit(form); fireEvent.submit(form); expect(fetcher).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ sessionId: data.sessions[0].sessionId, studentId: "student-01", status: "PRESENT",
    expectedRevision: 0, expectedManagementRevision: 2, targetRecordId: null });
  expect(screen.queryByText(/Dichiarazione manuale acquisita/)).toBeNull();
  await act(async () => response.resolve(json(ack({ status: "PRESENT", entryId: undefined }))));
  expect(screen.getByText(/Dichiarazione manuale acquisita/)).toBeTruthy();
});
test("an off-page stale correction can re-read its exact entry without scanning all ledger pages", async () => {
  const original = payment(), newer = payment({ recordId: id("e"), revision: 2 });
  const fetcher = vi.fn(async (_path: string, options?: RequestInit) => options?.method === "POST"
    ? json({ error: "stale_admin_record" }, 409) : json({ items: [newer], nextCursor: null }));
  vi.stubGlobal("fetch", fetcher);
  const view = render(paymentsView("fluidi", "tutor", { ...emptyPayments(), items: [original] }));
  fireEvent.click(screen.getByRole("button", { name: "Rettifica annotazione " + original.externalReference }));
  fireEvent.change(screen.getByLabelText("Motivo della rettifica di incasso"), { target: { value: "Riletta la ricevuta" } });
  fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" })); await screen.findByText(/Questo record è cambiato/);
  view.rerender(paymentsView("fluidi", "tutor", emptyPayments()));
  fireEvent.click(screen.getByRole("button", { name: "Rileggi le annotazioni" }));
  await screen.findByRole("button", { name: "Rivedi la rettifica sulla revisione corrente" });
  expect(fetcher.mock.calls.filter(([, options]) => options?.method !== "POST").map(([path]) => path))
    .toEqual([`/study/admin/editions/fluidi/manual-payments/${original.entryId}/history?limit=20`]);
});
