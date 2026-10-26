import { expect, test } from "vitest";
import { agenda, appointmentLabel, attendanceCsv, csv, economics, paymentsCsv } from "./model";
import { attendance, attendanceRecord, edition, emptyPayments, payment } from "../../__tests__/register-fixtures";

test("appointments show clock time, year and the distinct offsets of Rome's repeated hour", () => {
  const evening = appointmentLabel("2026-11-03T17:00:00Z", "Europe/Rome");
  expect(evening).toContain("2026"); expect(evening).toContain("18:00");
  const first = appointmentLabel("2026-10-25T00:30:00Z", "Europe/Rome");
  const second = appointmentLabel("2026-10-25T01:30:00Z", "Europe/Rome");
  expect(first).toContain("02:30"); expect(second).toContain("02:30");
  expect(first).toMatch(/(?:GMT|UTC)\+2/); expect(second).toMatch(/(?:GMT|UTC)\+1/);
});

test("workload uses real elapsed time across Rome DST and excludes cancelled/other tutors", () => {
  const sessions = [{ start: "2026-10-25T02:30:00+02:00", end: "2026-10-25T03:00:00+01:00" }];
  const first = { ...edition, sessions };
  const result = agenda([first, { ...first, id: "other", teacherId: "other" }, { ...first, id: "cancelled", state: "cancelled" }], "tutor", Date.parse("2026-10-24T00:00:00Z"));
  expect(result.hours).toBe(1.5);
  expect(result.appointments).toHaveLength(1);
  expect(agenda([first], "tutor", Date.parse("2026-10-25T01:00:00Z")).hours).toBe(1);
});
test("overlap is explicit; adjacent intervals do not conflict", () => {
  const make = (id: string, start: string, end: string) => ({ ...edition, id, sessions: [{ start, end }] });
  const a = make("a", "2026-11-01T08:00Z", "2026-11-01T09:30Z");
  const b = make("b", "2026-11-01T09:30Z", "2026-11-01T11:00Z");
  expect(agenda([a, b], "tutor", 0).conflicts).toEqual([]);
  const c = make("c", "2026-11-01T09:00Z", "2026-11-01T10:00Z");
  expect(agenda([a, b, c], "tutor", 0).conflicts).toHaveLength(3);
});
test("manual total and nominal forecast remain independent; active holds consume capacity", () => {
  const register = attendance(), payments = emptyPayments();
  register.admission.confirmedCount = 9; register.admission.activeHoldCount = 1;
  payments.summary.totalMinor = 1200;
  expect(economics(edition, register, payments)).toEqual({ free: 0, forecastMinor: 44100, manualMinor: 1200 });
});
test("CSV neutralizes formula injection and preserves quotes, multiline and Unicode", () => {
  const value = csv([["=SUM(A1)", "\t +CMD", 'test;"x"\nè', "@evil", "-evil", 123]]);
  expect(value).toBe('\ufeff"\'=SUM(A1)";"\'\t +CMD";"test;""x""\nè";"\'@evil";"\'-evil";"123"\r\n');
});
test("attendance CSV retains historical date and declared status when calendar changed", () => {
  const data = attendance(), record = attendanceRecord();
  data.cells[0] = { ...data.cells[0], status: "UNRECORDED", calendarConflict: true, record, recordId: record.recordId, revision: 1 };
  data.sessions[0].startUtc = "2026-01-10T09:00:00Z";
  const output = attendanceCsv(data);
  expect(output).toContain('"PRESENT";"SI";"2026-01-01T09:00:00Z";"2026-01-10T09:00:00Z"');
});
test("payment CSV preserves void declarations rather than reclassifying them as cash", () => {
  const data = emptyPayments(); data.items = [payment({ status: "VOIDED", externalReference: "=unsafe" })];
  expect(paymentsCsv("fluidi", data)).toContain('"VOIDED";"4900";"\'=unsafe"');
  expect(paymentsCsv("fluidi", data)).toContain("MANUAL_DECLARATION_ONLY");
});
