import type { Attendance, AttendanceRecord, PaymentRecord, Payments, RegisterAck } from "../register/contracts";
export const tutor = { id: "tutor", role: "teacher" as const, synthetic: true as const };
export const edition = { id: "fluidi", teacherId: tutor.id, capacity: 10, priceMinor: 4900,
  state: "offered", sessions: [], timezone: "Europe/Rome", title: "Fluidi" };
export const id = (character: string) => character.repeat(32);
export function attendance(editionId = "fluidi"): Attendance {
  const sessions = Array.from({ length: 4 }, (_, index) => ({ sessionId: id(String(index + 1)), ordinal: index + 1,
    startUtc: `2026-01-0${index + 1}T09:00:00Z`, endUtc: `2026-01-0${index + 1}T10:30:00Z`,
    startLocal: `2026-01-0${index + 1}T10:00:00`, endLocal: `2026-01-0${index + 1}T11:30:00`, displayTimezone: "Europe/Rome" }));
  return { editionId, managementRevision: 2, serverTime: 1792480000, timezone: "Europe/Rome", mode: "test", calendarReady: true,
    admission: { interestCount: 2, activeHoldCount: 1, confirmedCount: 1, waitlistedCount: 1 }, roster: [{ studentId: "student-01" }], sessions,
    cells: sessions.map((session) => ({ sessionId: session.sessionId, studentId: "student-01", status: "UNRECORDED", revision: 0,
      recordId: null, canRecord: false, canCorrect: false, calendarConflict: false, record: null })) };
}
export const emptyPayments = (): Payments => ({ items: [], nextCursor: null,
  summary: { totalMinor: 0, recordedCount: 0, voidedCount: 0, currency: "EUR", mode: "test", verification: "MANUAL_DECLARATIONS_ONLY" } });
export function payment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return { recordId: id("a"), entryId: id("b"), editionId: "fluidi", studentId: "student-01", revision: 1,
    supersedesRecordId: null, status: "RECORDED_MANUALLY", amountMinor: 4900, currency: "EUR", externalReference: "Ricevuta cartacea A/01",
    recordedBy: tutor.id, recordedAt: 1792480000, reason: "", offerSnapshot: { priceMinor: 4900, currency: "EUR", managementRevision: 2, editionState: "offered", mode: "test" },
    priceDiscrepancy: false, receiptId: id("c"), mode: "test", verification: "MANUAL_DECLARATION_ONLY", ...overrides };
}
export function attendanceRecord(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  const session = attendance().sessions[0];
  return { recordId: id("a"), editionId: "fluidi", sessionId: session.sessionId, studentId: "student-01", revision: 1,
    supersedesRecordId: null, status: "PRESENT", recordedBy: tutor.id, recordedAt: 1792480000, reason: "", managementRevision: 2,
    sessionSnapshot: { sessionId: session.sessionId, ordinal: 1, startUtc: session.startUtc, endUtc: session.endUtc, timezone: "Europe/Rome" },
    receiptId: id("c"), mode: "test", ...overrides };
}
export function ack(overrides: Partial<RegisterAck> = {}): RegisterAck {
  return { receiptId: id("d"), recordId: id("a"), entryId: id("b"), editionId: "fluidi", revision: 1, status: "RECORDED_MANUALLY", mode: "test", ...overrides };
}
export const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
