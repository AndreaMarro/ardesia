import { test, expect, type BrowserContext } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
async function login(context: BrowserContext, alias: string) {
  const path =
    process.env.ARDESIA_DEMO_ACCESS ??
    new URL("../../../../web-demo-data/demo-access.json", import.meta.url);
  const access = JSON.parse(await readFile(path, "utf8"));
  const response = await context.request.post("/study/session", {
    data: { token: access.tokens[alias] },
  });
  expect(response.ok()).toBe(true);
}
test("public laboratory, honest interest form and accessible login", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "La fisica. Un’idea alla volta." }),
  ).toBeVisible();
  const trigger = page.getByRole("button", { name: "Accedi al tuo spazio" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page
    .getByRole("link", { name: "Prova il laboratorio", exact: true })
    .click();
  await page
    .getByLabel("La tua previsione")
    .fill("La portata aumenta con la quarta potenza.");
  await page.getByRole("button", { name: "Metti alla prova" }).click();
  await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 5,0625");
  await page.getByLabel("Rapporto dei raggi", { exact: true }).focus();
  await page.getByLabel("Rapporto dei raggi", { exact: true }).press("End");
  await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
  await page.getByRole("button", { name: "Metti alla prova" }).click();
  await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 16");
  await page
    .getByLabel("Contatto sintetico")
    .fill(`web-${randomUUID()}@example.invalid`);
  await page
    .getByRole("checkbox", {
      name: "Acconsento alla registrazione di questa richiesta sintetica.",
    })
    .check();
  await page.getByRole("button", { name: "Invia richiesta di prova" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Richiesta registrata" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("submitted source → tutor observation → new student proof → tutor verification survives reload", async ({
  browser,
  baseURL,
}) => {
  const student = await browser.newContext({ baseURL });
  const tutor = await browser.newContext({ baseURL });
  await login(student, "student-01");
  await login(tutor, "tutor-synthetic");
  const workspace = await (
    await student.request.get("/study/workspace?editionId=fluidi")
  ).json();
  if (!workspace.enrolled) {
    const hold = await (
      await student.request.post("/study/editions/fluidi/holds", {
        data: {},
        headers: { "Idempotency-Key": randomUUID() },
      })
    ).json();
    if (hold.state !== "confirmed") {
      const confirmed = await student.request.post(
        "/study/holds/" + hold.id + "/confirm",
        { data: {}, headers: { "Idempotency-Key": randomUUID() } },
      );
      expect((await confirmed.json()).state).toBe("confirmed");
    }
  }

  const original = `Test web ${randomUUID()}: la portata cresce come il quadrato del raggio.`;
  const sent = await student.request.post("/study/submissions", {
    data: {
      editionId: "fluidi",
      activityId: "poiseuille-v1",
      text: original,
      assetRefs: [],
    },
    headers: { "Idempotency-Key": randomUUID() },
  });
  expect(sent.ok()).toBe(true);
  const receipt = await sent.json();
  const page = await tutor.newPage();
  await page.goto("/?view=review");
  await page
    .getByRole("button", { name: /student-01.*Da correggere/ })
    .last()
    .click();
  await expect(page.getByText(original, { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Inizia la correzione" }).click();
  await page
    .getByLabel("Spiegazione del tutor", { exact: true })
    .fill("A pressione fissata devi confrontare la quarta potenza del raggio.");
  await page.getByRole("button", { name: "Restituisci la correzione" }).click();
  await expect(
    page.getByText("Correzione restituita allo studente."),
  ).toBeVisible();
  const source = page.getByLabel("Originale della fonte");
  await source.focus();
  await source.press("ControlOrMeta+A");
  await page
    .getByText("Collega un passaggio al diario", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Proponi il passaggio", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apri il diario per il prossimo passo" })
    .click();
  const entry = page.locator(".diary-entry").filter({ hasText: original });
  await expect(entry).toBeVisible();
  await entry
    .getByText("Verifica e prepara il prossimo passo", { exact: true })
    .click();
  await entry
    .getByLabel("Spiegazione del tutor", { exact: true })
    .fill("Il vincolo è la pressione; la relazione usa la quarta potenza.");
  await entry
    .getByLabel("Criterio della rubrica")
    .fill("Esplicita la quarta potenza e il vincolo di pressione.");
  await entry
    .getByLabel("Prossimo passo")
    .fill("Confronta una situazione con raggio doppio.");
  await entry
    .getByLabel("Nuovo problema", { exact: true })
    .fill(
      "Raddoppia il raggio a pressione fissata: spiega il rapporto di portata.",
    );
  await entry
    .getByRole("button", {
      name: "Conferma osservazione e assegna la nuova prova",
    })
    .click();
  await expect(entry.getByText("Da riprovare", { exact: true })).toBeVisible();
  const learner = await student.newPage();
  await learner.goto("/?view=work");
  const own = learner.locator(".diary-entry").filter({ hasText: original });
  await own.getByText("Affronta una situazione nuova", { exact: true }).click();
  const procedure =
    "Il rapporto dei raggi è due; a pressione fissata la portata varia con la quarta potenza: 2^4 = 16.";
  await own.getByLabel("Spiega il tuo procedimento").fill(procedure);
  await own.getByRole("button", { name: "Consegna la nuova prova" }).click();
  await expect(
    own.getByText("Nuova prova consegnata. La verifica spetta al tutor."),
  ).toBeVisible();
  await page.reload();
  const practising = page.locator(".diary-entry").filter({ hasText: original });
  await practising.getByText("Rivedi la nuova prova", { exact: true }).click();
  await practising
    .getByLabel("Passaggio del procedimento verificato")
    .fill("la portata varia con la quarta potenza: 2^4 = 16");
  await practising
    .getByLabel("Motivazione della verifica")
    .fill(
      "Il procedimento individua il vincolo e confronta correttamente la quarta potenza.",
    );
  await practising
    .getByLabel("Che cosa rende diversa questa prova")
    .fill("Il rapporto del raggio cambia da 1,5 a 2.");
  await practising
    .getByRole("button", { name: "Registra la verifica del tutor" })
    .click();
  await page.getByRole("button", { name: "Verificati", exact: true }).click();
  await expect(
    page
      .locator(".diary-entry")
      .filter({ hasText: original })
      .getByText("Verificato su una nuova prova", { exact: true }),
  ).toBeVisible();
  await learner.reload();
  await learner
    .getByRole("button", { name: "Verificati", exact: true })
    .click();
  await expect(
    learner
      .locator(".diary-entry")
      .filter({ hasText: original })
      .getByText("Verificato su una nuova prova", { exact: true }),
  ).toBeVisible();
  const stored = await student.request.get(
    "/study/receipts/" + receipt.receiptId,
  );
  expect((await stored.json()).submissionId).toBe(receipt.submissionId);
  await tutor.close();
  await student.close();
});

test("mobile numerical feedback becomes visible after explicit commit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("link", { name: "Prova il laboratorio", exact: true })
    .click();
  await page
    .getByLabel("La tua previsione")
    .fill("Aumenta con la quarta potenza.");
  await page.getByRole("button", { name: "Metti alla prova" }).click();
  await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 5,0625");
  const bounds = await page.getByTestId("physics-ratio").boundingBox();
  expect(
    bounds !== null && bounds.y >= 0 && bounds.y + bounds.height <= 844,
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("shared material edits preserve the exact original revision and expose context", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(context, "tutor-synthetic");
  await page.goto("/?view=materials");
  await page
    .getByText("Aggiungi un materiale al gruppo", { exact: true })
    .click();
  const original = `Materiale sintetico QA ${randomUUID()}: prima il vincolo, poi il modello.`;
  await page.getByLabel("Traccia, spiegazione o riferimento").fill(original);
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith("/study/resources") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Condividi con il gruppo", exact: true })
    .click();
  const resource = await (await created).json();
  await expect(page.locator(".source-viewer .original-text")).toHaveText(
    original,
  );
  await page
    .getByText("Modifica e salva una nuova versione", { exact: true })
    .click();
  const revised = original + " Il raggio compare alla quarta potenza.";
  await page.getByLabel("Modifica il testo della fonte").fill(revised);
  await page
    .getByRole("button", { name: "Salva una nuova revisione", exact: true })
    .click();
  await expect(page.locator(".source-viewer .original-text")).toHaveText(
    revised,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const stored = await context.request.get(
    `/study/resources/${resource.id}/revisions/${resource.revisionId}`,
  );
  expect((await stored.json()).text).toBe(original);
  await page.getByText("Fonte, versione e contesto", { exact: true }).click();
  await page
    .getByRole("button", { name: "Apri il contesto di lavoro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Collegamenti revisionati",
      exact: true,
    }),
  ).toBeVisible();
});
