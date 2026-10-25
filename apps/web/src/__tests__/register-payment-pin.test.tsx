// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ManualPayments } from "../register/ManualPayments";
import type { PaymentRecord } from "../register/contracts";
import { clearResourceDrafts } from "../components/sessionDraftCache";
import { studySessionEpoch } from "../../../studio/src/study/sessionBoundary";
import { ack, attendance, emptyPayments, id, json, payment } from "./register-fixtures";

afterEach(() => { cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); });
function view(items: PaymentRecord[]) {
  return <ManualPayments data={{ ...emptyPayments(), items }} attendance={attendance()} scope="tutor-fluidi"
    actor="tutor" epoch={studySessionEpoch()} refresh={() => {}} busy={false}
    onNext={() => {}} onBack={() => {}} canBack={false} />;
}
function startCorrection(original: PaymentRecord) {
  fireEvent.click(screen.getByRole("button", { name: "Rettifica annotazione " + original.externalReference }));
  fireEvent.change(screen.getByLabelText("Motivo della rettifica di incasso"), { target: { value: "Verifica della ricevuta della persona originaria" } });
  fireEvent.change(screen.getByLabelText("Importo rettificato (€)"), { target: { value: "48,20" } });
}
const changedAnchors: [string, (record: PaymentRecord) => PaymentRecord][] = [
  ["person", record => ({ ...record, studentId: "different-person" })],
  ["external reference", record => ({ ...record, externalReference: "different-reference" })],
  ["offer price", record => ({ ...record, offerSnapshot: { ...record.offerSnapshot, priceMinor: 5900 } })],
  ["offer revision", record => ({ ...record, offerSnapshot: { ...record.offerSnapshot, managementRevision: 3 } })],
  ["offer state", record => ({ ...record, offerSnapshot: { ...record.offerSnapshot, editionState: "active" } })],
];
test.each(changedAnchors)("off-page reread rejects changed immutable %s and preserves the origin draft", async (_field, change) => {
  const original = payment(), crossed = change(payment({ recordId: id("e"), revision: 2, supersedesRecordId: original.recordId }));
  const fetcher = vi.fn(async (_path: string, options?: RequestInit) => options?.method === "POST"
    ? json({ error: "stale_admin_record" }, 409) : json({ items: [crossed], nextCursor: null }));
  vi.stubGlobal("fetch", fetcher);
  const component = render(view([original])); startCorrection(original); await act(async () => fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" }))); expect(screen.getByText(/Questo record è cambiato/)).toBeTruthy();
  component.rerender(view([])); await act(async () => fireEvent.click(screen.getByRole("button", { name: "Rileggi le annotazioni" })));
  expect(screen.getByText(/risposta del registro non è leggibile/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Rivedi la rettifica sulla revisione corrente" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Rettifica per " + original.studentId })).toBeTruthy();
  expect((screen.getByLabelText("Importo rettificato (€)") as HTMLInputElement).value).toBe("48,20");
  expect((screen.getByLabelText("Motivo della rettifica di incasso") as HTMLTextAreaElement).value).toContain("persona originaria");
  expect(fetcher.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
});
test("a visible-page refresh with a crossed immutable anchor cannot be adopted or submitted", async () => {
  const original = payment(), crossed = payment({ studentId: "different-person", recordId: id("e"), revision: 2 });
  const fetcher = vi.fn().mockResolvedValue(json({ error: "stale_admin_record" }, 409)); vi.stubGlobal("fetch", fetcher);
  const component = render(view([original])); startCorrection(original); await act(async () => fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" }))); expect(screen.getByText(/Questo record è cambiato/)).toBeTruthy();
  component.rerender(view([crossed]));
  expect(screen.getByText(/risposta del registro non è leggibile/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Rivedi la rettifica sulla revisione corrente" })).toBeNull();
  fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" }));
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("heading", { name: "Rettifica per " + original.studentId })).toBeTruthy();
});
test("entry history rejects a changed immutable reference before rendering its text", async () => {
  const original = payment(), crossed = payment({ externalReference: "different-reference", reason: "CROSSED-HISTORY-TEXT" });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ items: [crossed], nextCursor: null })));
  render(view([original]));
  await act(async () => {
    const summary = screen.getByText("Storia dell’annotazione " + original.externalReference, { selector: "summary" });
    fireEvent.click(summary); fireEvent(summary.parentElement!, new Event("toggle", { bubbles: true }));
  });
  expect(screen.getByText(/risposta del registro non è leggibile/)).toBeTruthy();
  expect(screen.queryByText("CROSSED-HISTORY-TEXT")).toBeNull();
});
test("a legitimate off-page revision is adopted explicitly and keeps the origin anchor and draft in the next CAS", async () => {
  const original = payment(), newer = payment({ recordId: id("e"), revision: 2, supersedesRecordId: original.recordId,
    amountMinor: 5100, priceDiscrepancy: true, recordedAt: original.recordedAt + 10, reason: "Previous correction" });
  const fetcher = vi.fn(async (_path: string, options?: RequestInit) => options?.method === "POST"
    ? json({ error: "stale_admin_record" }, 409) : json({ items: [newer], nextCursor: null }));
  vi.stubGlobal("fetch", fetcher);
  const component = render(view([original])); startCorrection(original); await act(async () => fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" }))); expect(screen.getByText(/Questo record è cambiato/)).toBeTruthy();
  component.rerender(view([])); await act(async () => fireEvent.click(screen.getByRole("button", { name: "Rileggi le annotazioni" })));
  const accept = screen.getByRole("button", { name: "Rivedi la rettifica sulla revisione corrente" });
  expect(fetcher.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  fireEvent.click(accept);
  expect(screen.getByText(original.externalReference + " · revisione di partenza 2")).toBeTruthy();
  fetcher.mockResolvedValue(json(ack({ revision: 3 })));
  await act(async () => fireEvent.submit(screen.getByRole("form", { name: "Rettifica annotazione manuale" })));
  expect(screen.getByText(/Rettifica manuale acquisita/)).toBeTruthy();
  const writes = fetcher.mock.calls.filter(([, options]) => options?.method === "POST");
  expect(writes[1][0]).toBe(`/study/admin/editions/fluidi/manual-payments/${original.entryId}/revisions`);
  expect(JSON.parse(String(writes[1][1]?.body))).toEqual({ expectedRevision: 2, targetRecordId: newer.recordId,
    status: "RECORDED_MANUALLY", amountMinor: 4820, reason: "Verifica della ricevuta della persona originaria" });
});
