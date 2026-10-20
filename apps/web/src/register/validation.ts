import type { Attendance, AttendanceRecord, Page, PaymentRecord, Payments } from "./contracts";
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const natural = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0;
const identifier = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{32}$/.test(value);
const text = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const instant = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const timestamp = (value: unknown): value is number => typeof value === "number" && Number.isFinite(new Date(value * 1000).getTime());
const cursor = (value: unknown) => value === null || typeof value === "string";
function timezone(value: unknown): value is string {
  if (!text(value)) return false;
  try { new Intl.DateTimeFormat("it-IT", { timeZone: value }); return true; } catch { return false; }
}
function record(value: Record<string, unknown>, editionId: string) {
  return value.editionId === editionId && value.mode === "test" && identifier(value.recordId) && identifier(value.receiptId)
    && text(value.studentId) && natural(value.revision) && Number(value.revision) > 0
    && (value.supersedesRecordId === null || identifier(value.supersedesRecordId))
    && typeof value.reason === "string" && text(value.recordedBy)
    && timestamp(value.recordedAt);
}
export function isAttendanceRecord(value: unknown, editionId: string): value is AttendanceRecord {
  return object(value) && record(value, editionId) && identifier(value.sessionId)
    && ["PRESENT", "ABSENT", "UNRECORDED"].includes(String(value.status)) && natural(value.managementRevision)
    && object(value.sessionSnapshot) && value.sessionSnapshot.sessionId === value.sessionId
    && natural(value.sessionSnapshot.ordinal) && Number(value.sessionSnapshot.ordinal) >= 1 && Number(value.sessionSnapshot.ordinal) <= 4
    && instant(value.sessionSnapshot.startUtc) && instant(value.sessionSnapshot.endUtc) && timezone(value.sessionSnapshot.timezone);
}
export function isAttendance(value: unknown, editionId: string): value is Attendance {
  if (!object(value) || value.editionId !== editionId || value.mode !== "test" || typeof value.calendarReady !== "boolean"
    || !timezone(value.timezone) || !timestamp(value.serverTime)
    || !natural(value.managementRevision) || !object(value.admission)
    || !["interestCount", "activeHoldCount", "confirmedCount", "waitlistedCount"].every((key) => natural((value.admission as Record<string, unknown>)[key]))
    || !Array.isArray(value.roster) || value.roster.length > 10 || !value.roster.every((row) => object(row) && text(row.studentId))
    || !Array.isArray(value.sessions) || value.sessions.length !== (value.calendarReady ? 4 : 0)
    || !value.sessions.every((session) => object(session) && identifier(session.sessionId) && instant(session.startUtc) && instant(session.endUtc)
      && timezone(session.displayTimezone) && natural(session.ordinal) && Number(session.ordinal) >= 1 && Number(session.ordinal) <= 4)
    || !Array.isArray(value.cells) || value.cells.length !== value.roster.length * value.sessions.length) return false;
  const people = new Set(value.roster.map((row) => row.studentId));
  const sessions = new Set(value.sessions.map((session) => session.sessionId));
  if (people.size !== value.roster.length || sessions.size !== value.sessions.length) return false;
  const pairs = new Set<string>();
  return value.cells.every((cell) => {
    if (!object(cell) || !sessions.has(cell.sessionId) || !people.has(cell.studentId)
      || !["PRESENT", "ABSENT", "UNRECORDED"].includes(String(cell.status)) || !natural(cell.revision)
      || !["canRecord", "canCorrect", "calendarConflict"].every((key) => typeof cell[key] === "boolean")) return false;
    const pair = JSON.stringify([cell.sessionId, cell.studentId]);
    if (pairs.has(pair)) return false;
    pairs.add(pair);
    if (cell.record === null) return cell.recordId === null && cell.revision === 0 && cell.status === "UNRECORDED" && !cell.canCorrect && !cell.calendarConflict;
    return isAttendanceRecord(cell.record, editionId) && cell.record.recordId === cell.recordId
      && cell.record.studentId === cell.studentId && cell.record.revision === cell.revision
      && (cell.calendarConflict || cell.record.sessionId === cell.sessionId);
  });
}
export function isPaymentRecord(value: unknown, editionId: string): value is PaymentRecord {
  return object(value) && record(value, editionId) && value.verification === "MANUAL_DECLARATION_ONLY" && identifier(value.entryId)
    && natural(value.amountMinor) && Number(value.amountMinor) >= 1 && Number(value.amountMinor) <= 1_000_000 && value.currency === "EUR"
    && ["RECORDED_MANUALLY", "VOIDED"].includes(String(value.status)) && text(value.externalReference)
    && typeof value.priceDiscrepancy === "boolean" && object(value.offerSnapshot) && natural(value.offerSnapshot.priceMinor)
    && value.offerSnapshot.currency === "EUR" && natural(value.offerSnapshot.managementRevision)
    && text(value.offerSnapshot.editionState) && value.offerSnapshot.mode === "test";
}
/** Revisions may change the declaration, never the entry's person, reference or original offer. */
export function isPaymentRevisionOf(value: unknown, anchor: PaymentRecord): value is PaymentRecord {
  return isPaymentRecord(value, anchor.editionId) && value.entryId === anchor.entryId
    && value.studentId === anchor.studentId && value.externalReference === anchor.externalReference
    && value.currency === anchor.currency && value.offerSnapshot.priceMinor === anchor.offerSnapshot.priceMinor
    && value.offerSnapshot.currency === anchor.offerSnapshot.currency
    && value.offerSnapshot.managementRevision === anchor.offerSnapshot.managementRevision
    && value.offerSnapshot.editionState === anchor.offerSnapshot.editionState && value.offerSnapshot.mode === anchor.offerSnapshot.mode;
}
export function isPage<T>(value: unknown, check: (item: unknown) => item is T): value is Page<T> {
  return object(value) && Array.isArray(value.items) && value.items.length <= 20 && value.items.every(check) && cursor(value.nextCursor);
}
export function isPayments(value: unknown, editionId: string): value is Payments {
  return object(value) && object(value.summary) && value.summary.mode === "test" && value.summary.currency === "EUR"
    && value.summary.verification === "MANUAL_DECLARATIONS_ONLY" && natural(value.summary.totalMinor)
    && natural(value.summary.recordedCount) && natural(value.summary.voidedCount)
    && isPage(value, (item): item is PaymentRecord => isPaymentRecord(item, editionId));
}
