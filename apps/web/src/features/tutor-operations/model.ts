import type { Edition } from "../../api";
import type { Attendance, Payments } from "../../register/contracts";

export type Appointment = { edition: Edition; ordinal: number; start: number; end: number };

/** Only the verified tutor's editions enter this projection. UTC measures duration. */
export function agenda(editions: Edition[], tutorId: string, now: number) {
  const appointments: Appointment[] = editions
    .filter((edition) => edition.teacherId === tutorId && edition.state !== "cancelled")
    .flatMap((edition) => edition.sessions.map((session, index) => ({
      edition, ordinal: index + 1, start: Date.parse(session.start), end: Date.parse(session.end),
    })))
    .filter((session) => Number.isFinite(session.start) && Number.isFinite(session.end) && session.end > session.start && session.end > now)
    .sort((first, second) => first.start - second.start || first.edition.id.localeCompare(second.edition.id));
  return {
    appointments,
    hours: appointments.reduce((sum, item) => sum + Math.max(0, item.end - Math.max(now, item.start)), 0) / 3_600_000,
    conflicts: appointments.filter((item, index) => appointments.some((other, ordinal) => ordinal !== index && item.start < other.end && item.end > other.start)),
  };
}

/** A nominal forecast is neither an amount due nor verified revenue. */
export function economics(edition: Edition, attendance: Attendance, payments: Payments) {
  return {
    free: Math.max(0, edition.capacity - attendance.admission.confirmedCount - attendance.admission.activeHoldCount),
    forecastMinor: edition.priceMinor * attendance.admission.confirmedCount,
    manualMinor: payments.summary.totalMinor,
  };
}

/** Quote every field and neutralize spreadsheet formulas, including whitespace prefixes. */
export function csv(rows: (string | number | null)[][]) {
  return "\ufeff" + rows.map((row) => row.map((value) => {
    let text = String(value ?? "");
    if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }).join(";")).join("\r\n") + "\r\n";
}

export function attendanceCsv(data: Attendance) {
  return csv([
    ["edizione", "incontro", "studente", "stato_dichiarato", "conflitto_calendario", "inizio_originale_UTC", "inizio_attuale_UTC", "revisione", "lettura_server", "ambiente"],
    ...data.cells.map((cell) => [data.editionId, cell.sessionId, cell.studentId, cell.record?.status ?? cell.status,
      cell.calendarConflict ? "SI" : "NO", cell.record?.sessionSnapshot.startUtc ?? "",
      data.sessions.find((session) => session.sessionId === cell.sessionId)?.startUtc ?? "", cell.revision, data.serverTime, "test"]),
  ]);
}

export function paymentsCsv(editionId: string, data: Payments) {
  return csv([
    ["edizione", "voce", "studente", "stato", "centesimi_EUR", "riferimento", "revisione", "registrato_il", "verifica", "ambiente"],
    ...data.items.map((item) => [editionId, item.entryId, item.studentId, item.status, item.amountMinor,
      item.externalReference, item.revision, item.recordedAt, item.verification, item.mode]),
  ]);
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
