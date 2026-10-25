export type AttendanceStatus = "PRESENT" | "ABSENT" | "UNRECORDED";
export type PaymentStatus = "RECORDED_MANUALLY" | "VOIDED";
export type SessionSnapshot = {
  sessionId: string; ordinal: number; startUtc: string; endUtc: string; timezone: string;
};
export type AttendanceRecord = {
  recordId: string; editionId: string; sessionId: string; studentId: string;
  revision: number; supersedesRecordId: string | null; status: AttendanceStatus;
  recordedBy: string; recordedAt: number; reason: string; managementRevision: number;
  sessionSnapshot: SessionSnapshot; receiptId: string; mode: "test";
};
export type AttendanceCell = {
  sessionId: string; studentId: string; status: AttendanceStatus; revision: number;
  recordId: string | null; canRecord: boolean; canCorrect: boolean;
  calendarConflict: boolean; record: AttendanceRecord | null;
};
export type Attendance = {
  editionId: string; managementRevision: number; serverTime: number;
  timezone: string; mode: "test"; calendarReady: boolean;
  admission: { interestCount: number; activeHoldCount: number; confirmedCount: number; waitlistedCount: number };
  roster: { studentId: string }[];
  sessions: (Omit<SessionSnapshot, "timezone"> & { startLocal: string; endLocal: string; displayTimezone: string })[];
  cells: AttendanceCell[];
};
export type PaymentRecord = {
  recordId: string; entryId: string; editionId: string; studentId: string;
  revision: number; supersedesRecordId: string | null; status: PaymentStatus;
  amountMinor: number; currency: "EUR"; externalReference: string;
  recordedBy: string; recordedAt: number; reason: string;
  offerSnapshot: { priceMinor: number; currency: "EUR"; managementRevision: number; editionState: string; mode: "test" };
  priceDiscrepancy: boolean; receiptId: string; mode: "test"; verification: "MANUAL_DECLARATION_ONLY";
};
export type Page<T> = { items: T[]; nextCursor: string | null };
export type Payments = Page<PaymentRecord> & {
  summary: { totalMinor: number; recordedCount: number; voidedCount: number; currency: "EUR"; mode: "test"; verification: "MANUAL_DECLARATIONS_ONLY" };
};
export type RegisterAck = {
  receiptId: string; recordId: string; entryId?: string; editionId: string;
  revision: number; status: AttendanceStatus | PaymentStatus; mode: "test";
};
export const attendanceLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Presente", ABSENT: "Assente", UNRECORDED: "Non registrata",
};
export const paymentLabels: Record<PaymentStatus, string> = {
  RECORDED_MANUALLY: "Annotazione attiva", VOIDED: "Annotazione annullata",
};
export const countLabel = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;
export const registerPath = (id: string) => "/admin/editions/" + encodeURIComponent(id);
export const euro = (minor: number) => (minor / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
export const registerDate = (seconds: number, timezone: string) => new Intl.DateTimeFormat("it-IT", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: timezone,
}).format(new Date(seconds * 1000));
export const sessionDate = (instant: string, timezone: string) => registerDate(Date.parse(instant) / 1000, timezone);
/** Decimal input is converted exactly to cents; no floating-point rounding. */
export function parseEuro(value: string): number | null {
  const match = /^(\d{1,5})(?:[,.](\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const minor = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return minor >= 1 && minor <= 1_000_000 ? minor : null;
}
export function registerError(failure: unknown) {
  const code = failure instanceof Error ? failure.message : "";
  const text: Record<string, string> = {
    forbidden: "Il registro non è accessibile con questo account.",
    stale_admin_record: "Questo record è cambiato. Rileggi il registro prima di rivedere la bozza.",
    stale_edition: "Il calendario è cambiato. Rileggi le date prima di rivedere la bozza.",
    session_not_started: "Il server non consente ancora di registrare questo incontro.",
    member_required: "La persona non è attualmente iscritta a questa edizione.",
    duplicate_reference: "Questo riferimento è già usato nelle tue edizioni. Correggi l’annotazione esistente oppure usa un riferimento distinto.",
    idempotency_conflict: "La chiave è già associata a un’altra richiesta. Rivedi la bozza prima di inviare.",
    correction_reason_required: "Scrivi il motivo della rettifica.",
    invalid_manual_amount: "Scrivi un importo valido, da 0,01 a 10.000 euro.",
    register_response_invalid: "La risposta del registro non è leggibile. Nessuna conferma è stata mostrata.",
  };
  return { code, message: text[code] ?? "Il registro non è disponibile. La bozza resta qui: puoi riprovare." };
}
