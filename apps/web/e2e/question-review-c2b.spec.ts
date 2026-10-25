import { expect, test, request, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

type Actors = { synthetic: true; teacherToken: string; studentToken: string; bankId: string };

test.use({ trace: "on", screenshot: "only-on-failure" });

async function login(page: Page, token: string) {
  await page.goto("/?view=classroom&edition=fluidi");
  await page.getByRole("button", { name: "Accedi al tuo spazio" }).click();
  await page.getByLabel("Codice di accesso sintetico").fill(token);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Navigazione principale" })).toBeVisible();
  await page.goto("/?view=classroom&edition=fluidi");
  await page.getByText("Revisione scientifica dei quesiti · spazio docente", { exact: true }).click();
}

test("C2-B: saved private review, explicit publication, student isolation and revocation history", async ({ page, baseURL }, testInfo) => {
  const actorFile = process.env.ARDESIA_C2B_ACTORS ?? new URL("../../../.study-demo-c2b/review-actors.json", import.meta.url);
  const actors = JSON.parse(await readFile(actorFile, "utf8")) as Actors;
  expect(actors.synthetic).toBe(true);
  const bank = `/study/editions/fluidi/question-banks/${actors.bankId}`;
  const student = await request.newContext({ baseURL });
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  try {
    expect((await student.post("/study/session", { data: { token: actors.studentToken } })).ok()).toBe(true);
    const publishedCount = async () => {
      const response = await student.get(`${bank}/questions`);
      expect(response.ok()).toBe(true);
      const projection = await response.json();
      expect(JSON.stringify(projection)).not.toContain("Osservazione riservata C2-B");
      return projection.total;
    };
    expect(await publishedCount()).toBe(0);
    expect((await student.get(`${bank}/review/questions`)).status()).toBe(403);

    await login(page, actors.teacherToken);
    await page.getByLabel("Argomento della revisione").selectOption("U1");
    await expect(page.getByRole("status").filter({ hasText: "5 quesiti · pagina 1" })).toBeVisible();
    await page.getByLabel("Cerca nella coda").fill("Quesito sintetico C1 1:");
    await page.getByRole("button", { name: "Cerca quesiti da revisionare" }).click();
    await expect(page.getByRole("status").filter({ hasText: "1 quesiti · pagina 1" })).toBeVisible();
    await page.getByRole("button", { name: /^Quesito sintetico C1 1 U1/ }).click();
    const editor = page.getByRole("article", { name: "Revisione del quesito" });
    await expect(editor.getByText("Unità dichiarata:")).toBeVisible();
    await editor.getByText("Passaggi strutturati della soluzione", { exact: true }).click();
    await expect(editor.getByText("Confronta le alternative e concludi.")).toBeVisible();
    await expect(editor.getByRole("button", { name: "Prepara pubblicazione" })).toBeDisabled();
    await editor.getByLabel("Osservazioni della revisione").fill("Osservazione riservata C2-B: verificare unità e ipotesi.");
    await editor.getByRole("button", { name: "Salva revisione privata" }).click();
    await expect(editor.getByText("Revisione privata salvata. La pubblicazione non è cambiata.")).toBeVisible();

    await page.reload();
    await page.getByText("Revisione scientifica dei quesiti · spazio docente", { exact: true }).click();
    await page.getByRole("button", { name: /^Quesito sintetico C1 1 U1/ }).click();
    await expect(editor.getByLabel("Osservazioni della revisione")).toHaveValue("Osservazione riservata C2-B: verificare unità e ipotesi.");
    await editor.getByLabel("Esito scientifico").selectOption("APPROVED");
    await expect(editor.getByRole("button", { name: "Prepara pubblicazione" })).toBeDisabled();
    await editor.getByRole("button", { name: "Salva revisione privata" }).click();
    await expect(editor.getByText("Revisione privata salvata. La pubblicazione non è cambiata.")).toBeVisible();
    expect(await publishedCount()).toBe(0);
    await expect(editor.getByText("Non pubblicato: il quesito non è disponibile agli studenti.")).toBeVisible();

    for (const [width, height] of [[390, 844], [820, 1180], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await editor.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`private-review-${width}.png`), fullPage: true });
    }

    await editor.getByRole("button", { name: "Prepara pubblicazione" }).click();
    await expect(editor.getByRole("button", { name: "Pubblica il quesito" })).toBeDisabled();
    await editor.getByRole("checkbox", { name: /Confermo la pubblicazione/ }).check();
    await editor.getByRole("button", { name: "Pubblica il quesito" }).click();
    await expect(editor.getByText("Quesito pubblicato per questa edizione.")).toBeVisible();
    expect(await publishedCount()).toBe(1);
    expect((await student.get(`${bank}/review/questions/c1-synth-000/history`)).status()).toBe(403);

    await editor.getByLabel("Motivo della revoca").fill("Revoca sintetica C2-B: verifica editoriale sospesa.");
    await editor.getByRole("button", { name: "Revoca pubblicazione" }).click();
    await expect(editor.getByText("Pubblicazione revocata. Lo storico è conservato.")).toBeVisible();
    expect(await publishedCount()).toBe(0);
    await expect(editor.getByRole("button", { name: "Prepara pubblicazione" })).toBeDisabled();
    await expect(editor.getByRole("button", { name: "Salva nuova revisione privata" })).toBeEnabled();
    await editor.getByText("Storico privato della revisione e della pubblicazione", { exact: true }).click();
    await expect(editor.getByText("Revocato", { exact: true })).toBeVisible();
    await expect(editor.getByText("Revoca: Revoca sintetica C2-B: verifica editoriale sospesa.")).toBeVisible();
    const history = await page.request.get(`${bank}/review/questions/c1-synth-000/history`);
    const ledger = await history.json();
    expect(ledger.reviews.map((review: { status: string }) => review.status)).toEqual(["PENDING", "APPROVED"]);
    expect(ledger.approvals).toHaveLength(1);
    expect(ledger.approvals[0].editorialStatus).toBe("REVOKED");
    expect(pageErrors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("revoked-history-1440.png"), fullPage: true });
  } finally {
    await student.dispose();
  }
});
