import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { attendance, attendanceRecord, edition, emptyPayments, id, payment, tutor } from "../src/__tests__/register-fixtures";
import type { PaymentRecord } from "../src/register/contracts";

// Real Chromium and the product client, with a deliberately mocked HTTP contract.
// This does not exercise Auth, PostgreSQL, RLS, persistence or Core clock validation.
async function fixture(page: Page) {
  const state = attendance(); state.cells.forEach((cell) => { cell.canRecord = true; });
  const metadata = { ...edition, sessions: state.sessions.map((session) => ({ start: session.startUtc, end: session.endUtc })), subject: "fisica", duration: "4 incontri" };
  let records: PaymentRecord[] = [], manualAttempts = 0;
  const paymentHistory: PaymentRecord[] = [];
  const calls: { method: string; path: string; body: unknown; key: string | undefined }[] = [];
  const unexpected: string[] = [];
  const ack = (record: { receiptId: string; recordId: string; revision: number; status: string; entryId?: string }) => ({ ...record, editionId: edition.id, mode: "test" });
  await page.route("**/study/**", async (route) => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method();
    if (!path.startsWith("/study/")) { await route.continue(); return; }
    const body = method === "GET" ? null : req.postDataJSON();
    calls.push({ method, path: path + url.search, body, key: req.headers()["idempotency-key"] });
    const root = `/study/admin/editions/${edition.id}`;
    let result: unknown;
    if (method === "GET") {
      result = path === "/study/me" ? tutor
        : path === "/study/editions" ? { items: [metadata], nextCursor: null }
        : path === "/study/workspace" ? { edition: metadata, enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: "a".repeat(64) }
        : path === `/study/editions/${edition.id}/access` ? { members: state.roster.map((item) => item.studentId), waitlist: [], invitations: [], capabilities: { invitationCodes: false } }
        : path === root + "/attendance" ? state
        : path === root + "/attendance/history" ? { items: state.cells[0].record ? [state.cells[0].record] : [], nextCursor: null }
        : path === root + "/manual-payments" ? { ...emptyPayments(), items: records,
          summary: { ...emptyPayments().summary, totalMinor: records.filter((record) => record.status !== "VOIDED").reduce((total, record) => total + record.amountMinor, 0),
            recordedCount: records.filter((record) => record.status !== "VOIDED").length, voidedCount: records.filter((record) => record.status === "VOIDED").length } }
        : path === root + `/manual-payments/${id("b")}/history` ? { items: paymentHistory, nextCursor: null }
        : undefined;
    } else if (method === "POST" && path === root + "/attendance") {
      const previous = state.cells[0].record;
      const record = attendanceRecord({ status: body.status, revision: body.expectedRevision + 1, recordId: id(previous ? "e" : "a"), receiptId: id(previous ? "f" : "c"),
        supersedesRecordId: previous?.recordId ?? null, reason: body.reason ?? "" });
      state.cells[0] = { ...state.cells[0], status: record.status, revision: record.revision, recordId: record.recordId, record, canCorrect: true };
      result = ack(record);
    } else if (method === "POST" && path === root + "/manual-payments") {
      manualAttempts++;
      if (manualAttempts === 1) {
        // A simulated lost ACK: persisted mock entry, first response unavailable.
        records = [payment({ amountMinor: body.amountMinor, externalReference: body.externalReference, priceDiscrepancy: body.amountMinor !== 4900 })]; paymentHistory.unshift(records[0]);
        await route.fulfill({ status: 503, json: { error: "mock_lost_ack" } }); return;
      }
      result = ack(records[0]);
    } else if (method === "POST" && path === root + `/manual-payments/${id("b")}/revisions`) {
      const previous = records[0]; const record = { ...previous, recordId: id("e"), receiptId: id("f"), revision: 2, supersedesRecordId: previous.recordId,
        status: body.status, reason: body.reason };
      records = [record]; paymentHistory.unshift(record); result = ack(record);
    }
    if (result === undefined) unexpected.push(`${method} ${path}`);
    await route.fulfill({ status: result === undefined ? 404 : 200, json: result ?? { error: "unknown_mock_route" } });
  });
  return { calls, unexpected };
}
for (const width of [390, 820, 1440]) {
  test(`edition register: explicit declarations, retry and reasoned void at ${width}px @mock-ui`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const auditPath = process.env.ARDESIA_REGISTER_AXE;
    async function audit(step: string) {
      if (!auditPath) return;
      if (!await page.evaluate(() => "axe" in window)) {
        expect(createHash("sha256").update(await readFile(auditPath)).digest("hex")).toBe("20c09fe157a8a34a30e241aaa1fcdade657734f08ab379ecfbeb7d45cc46e878");
        await page.addScriptTag({ path: auditPath });
      }
      const result = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { version: string; run: (context: string) => Promise<{ violations: unknown[] }> } }).axe;
        return { version: axe.version, ...await axe.run(".edition-register") };
      });
      expect(result.version).toBe("4.14.0");
      if (process.env.ARDESIA_REGISTER_SHOTS) await writeFile(`${process.env.ARDESIA_REGISTER_SHOTS}/axe-${step}-${width}.json`, JSON.stringify(result, null, 2));
      expect(result.violations).toEqual([]);
    }
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    const { calls, unexpected } = await fixture(page);
    await page.goto("/?view=courses&edition=" + edition.id, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "I tuoi mini-corsi." })).toBeVisible();
    const summary = page.locator(".edition-register > summary");
    await expect(summary).toBeVisible(); expect(calls.filter((call) => call.path.startsWith("/study/admin/"))).toEqual([]);
    await summary.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Presenze", exact: true })).toBeVisible();
    await expect(page.locator(".loading-state:visible")).toHaveCount(0);
    await page.evaluate(async () => { await document.fonts.ready; await new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))); });
    const proof = process.env.ARDESIA_REGISTER_SHOTS;
    if (proof) { await mkdir(proof, { recursive: true }); await page.locator(".edition-register").screenshot({ path: `${proof}/register-overview-${width}.png` }); }
    await audit("overview");
    await page.getByRole("button", { name: "Registra per student-01", exact: true }).click();
    await page.getByRole("combobox", { name: "Stato di presenza", exact: true }).selectOption("PRESENT");
    await page.getByRole("button", { name: "Registra dichiarazione", exact: true }).click();
    await expect(page.getByText(/Dichiarazione manuale acquisita/)).toBeVisible();
    await page.getByRole("button", { name: "Rettifica per student-01", exact: true }).click();
    await page.getByRole("combobox", { name: "Stato di presenza", exact: true }).selectOption("ABSENT");
    await expect(page.getByRole("button", { name: "Registra dichiarazione", exact: true })).toBeDisabled();
    await page.getByLabel("Motivo della rettifica", { exact: true }).fill("Riletta la dichiarazione del primo incontro.");
    await page.getByRole("button", { name: "Registra dichiarazione", exact: true }).click();
    await expect(page.getByText(/Dichiarazione manuale acquisita · revisione 2/)).toBeVisible();
    await page.locator(".register-new > summary").click();
    await page.getByRole("combobox", { name: "Partecipante", exact: true }).selectOption("student-01");
    await page.getByLabel("Importo (€)", { exact: true }).fill("49,01");
    await page.getByLabel("Riferimento esterno", { exact: true }).fill("Carta A/01");
    if (proof) await page.getByRole("form", { name: "Nuova annotazione manuale", exact: true }).screenshot({ path: `${proof}/register-form-${width}.png` });
    await audit("form");
    await page.getByRole("button", { name: "Registra annotazione manuale", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("La bozza resta qui");
    await expect(page.getByText(/Annotazione manuale acquisita/)).toHaveCount(0);
    await page.getByRole("button", { name: "Registra annotazione manuale", exact: true }).click();
    await expect(page.getByText(/Annotazione manuale acquisita/)).toBeVisible();
    const requests = calls.filter((call) => call.method === "POST" && call.path.endsWith("/manual-payments"));
    expect(requests).toHaveLength(2); expect(requests[0].key).toBeTruthy(); expect(requests[1].key).toBe(requests[0].key); expect(requests[1].body).toEqual(requests[0].body);
    await page.getByRole("button", { name: "Rettifica annotazione Carta A/01", exact: true }).click();
    await page.getByRole("combobox", { name: "Tipo di rettifica", exact: true }).selectOption("VOIDED");
    await page.getByLabel("Motivo della rettifica di incasso", { exact: true }).fill("Annotazione duplicata nella documentazione cartacea.");
    await page.getByRole("button", { name: "Registra rettifica di incasso", exact: true }).click();
    await expect(page.getByText(/Rettifica manuale acquisita/)).toBeVisible();
    await expect(page.getByText("Somma delle annotazioni attive").locator(".." )).toContainText("0,00");
    const revision = calls.find((call) => call.path.endsWith("/revisions"))!;
    expect(revision.body).not.toHaveProperty("amountMinor");
    await page.getByText("Storia dell’annotazione Carta A/01", { exact: true }).click();
    await expect(page.getByText("Revisione 2 · Annotazione annullata", { exact: true })).toBeVisible();
    await expect(page.getByText("Revisione 1 · Annotazione attiva", { exact: true })).toBeVisible();
    if (proof) await page.locator(".register-payments").screenshot({ path: `${proof}/register-history-${width}.png` });
    await audit("history");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]); expect(unexpected).toEqual([]);
  });
}
