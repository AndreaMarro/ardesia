import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";

// Run against a disposable API fixture, with student-01 and student-02 admitted
// as test members of Fluidi and Taylor. No live bank publication is performed.
// ARDESIA_NOTEBOOK_PDF must be an original synthetic PDF with exactly 3 pages.
async function login(context: BrowserContext, alias: string) {
  const path = process.env.ARDESIA_DEMO_ACCESS;
  if (!path) throw Error("ARDESIA_DEMO_ACCESS synthetic fixture is required");
  const access = JSON.parse(await readFile(path, "utf8"));
  expect(access.synthetic).toBe(true);
  const response = await context.request.post("/study/session", {
    data: { token: access.tokens[alias] },
  });
  expect(response.ok()).toBe(true);
}

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("teacher catalog separates configured programmes from draft collections at three widths", async ({ page, context, browser, baseURL }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await login(context, "tutor-synthetic");
  await page.goto("/?view=courses&edition=fluidi");
  const catalog = page.getByRole("region", { name: "Catalogo privato del docente" });
  const opening = page.waitForResponse(response => response.url().includes("/admin/coursepacks?includeInventory=true"));
  await catalog.getByRole("button", { name: "Apri catalogo e copertura" }).focus();
  await page.keyboard.press("Enter");
  const response = await opening;
  expect(response.ok()).toBe(true);
  const { inventory } = await response.json();
  expect(inventory.programmes.map((item: { packId: string }) => item.packId).sort()).toEqual(["relazioni-fluidi-v1", "taylor-exp-v1"]);
  expect(inventory.collections.length).toBeGreaterThan(0);
  expect(inventory.collections.every((item: { creatable: boolean; subject: string }) => !item.creatable && item.subject === "fisica")).toBe(true);
  await expect(catalog.getByRole("button", { name: "Programmi configurati (2)", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(catalog.getByRole("button", { name: "Apri edizione esistente" })).toHaveCount(2);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await catalog.evaluate(element => element.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: testInfo.outputPath("catalog-programmes-1440.png") });
  await catalog.getByRole("button", { name: /Raccolte da progettare/ }).click();
  await expect(catalog.getByRole("button", { name: "Apri edizione esistente" })).toHaveCount(0);
  await expect(catalog.getByText("Non è ancora un programma per un’edizione.", { exact: false }).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 1000 });
  await catalog.evaluate(element => element.scrollIntoView({ block: "start" }));
  await noHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("catalog-collections-390.png") });
  await catalog.getByLabel("Cerca nel catalogo").fill("inesistente-qa-nessuna-corrispondenza");
  await expect(catalog.getByRole("status")).toHaveText("Nessun risultato. Prova un argomento o un prerequisito diverso.");
  await catalog.getByLabel("Cerca nel catalogo").fill("");
  const first = catalog.getByRole("article").first();
  await first.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(first.getByRole("heading", { name: "Riferimenti di esempio" })).toBeVisible();
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await first.scrollIntoViewIfNeeded();
    await noHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`catalog-${width}.png`), fullPage: true });
    await catalog.getByLabel("Cerca nel catalogo").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`catalog-${width}-viewport.png`) });
  }
  const student = await browser.newContext({ baseURL });
  await login(student, "student-01");
  const forbidden = await student.request.get("/study/admin/coursepacks?includeInventory=true");
  expect(forbidden.status()).toBe(403);
  await student.close();
  expect(errors).toEqual([]);
});

test("Fluidi and Taylor keep drafts per course while resetting source and commit before each submission", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await login(context, "student-01");
  await page.goto("/?view=classroom&edition=fluidi");
  const physicsPrediction = `QA ${randomUUID()}: il rapporto di portata è la quarta potenza del rapporto dei raggi.`;
  const physicsProcedure = "A pressione costante, 1,5 alla quarta dà 5,0625.";
  const privateDraft = "Bozza Fluidi da riprendere consapevolmente, senza spostarla su Taylor.";
  await page.getByLabel("La tua previsione", { exact: true }).fill(physicsPrediction);
  await page.getByRole("button", { name: "Metti alla prova", exact: true }).click();
  await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 5,0625");
  await page.getByLabel("La tua spiegazione", { exact: true }).fill(physicsProcedure);
  await page.getByLabel("Una nota, una domanda, un procedimento").fill("Fonte privata Fluidi, selezionata prima del cambio corso.");
  await page.getByRole("button", { name: "Salva nota privata" }).click();
  await expect(page.getByText("Nota salvata nel tuo spazio privato.", { exact: true })).toBeVisible();
  await expect(page.locator(".study-submission")).toContainText("Fonte contestuale collegata");
  await page.getByLabel("Una nota, una domanda, un procedimento").fill(privateDraft);

  await page.getByLabel("Edizione corrente").selectOption("analisi");
  await expect(page.getByRole("heading", { name: "Quanto basta per approssimare?" })).toBeVisible();
  await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
  await expect(page.getByLabel("La tua spiegazione", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Una nota, una domanda, un procedimento")).toHaveValue("");
  await expect(page.locator(".study-submission")).toContainText("Nessuna fonte contestuale selezionata");
  await expect(page.getByRole("button", { name: "Consegna", exact: true })).toBeDisabled();
  await page.getByLabel("La tua previsione e il controllo del resto").fill("A x=1 il quarto grado somma cinque termini; controllo separatamente il resto.");
  await page.getByLabel("Argomento x").fill("1");
  await page.getByLabel("Grado del polinomio").fill("4");
  const evaluation = page.waitForResponse(response => response.url().endsWith("/activities/evaluate") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Registra la previsione e confronta" }).click();
  const evaluated = await (await evaluation).json();
  expect(evaluated.value).toBeCloseTo(65 / 24, 12);
  expect(evaluated.terms).toBe(5);
  expect(evaluated.scientificApproval).toBe("NOT_RUN");
  await page.getByLabel("La tua spiegazione", { exact: true }).fill("Sommo 1 + 1 + 1/2 + 1/6 + 1/24 = 65/24. Il resto è una questione distinta.");
  const taylorSend = page.waitForResponse(response => response.url().endsWith("/study/submissions") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Consegna", exact: true }).click();
  const taylorResponse = await taylorSend;
  expect(taylorResponse.ok()).toBe(true);
  const taylorPayload = taylorResponse.request().postDataJSON();
  expect(taylorPayload).toMatchObject({ editionId: "analisi", activityId: "taylor-exp-v1", activityParameters: { x: 1, degree: 4 }, sourceRefs: [] });
  expect(taylorPayload.text).not.toContain(physicsPrediction);
  expect((await taylorResponse.json()).courseContext.packId).toBe("taylor-exp-v1");
  await expect(page.getByTestId("submission-status")).toContainText("Consegnato");

  await page.getByLabel("Edizione corrente").selectOption("fluidi");
  await expect(page.getByLabel("La tua previsione", { exact: true })).toHaveValue(physicsPrediction);
  await expect(page.getByLabel("La tua spiegazione", { exact: true })).toHaveValue(physicsProcedure);
  await expect(page.getByLabel("Una nota, una domanda, un procedimento")).toHaveValue(privateDraft);
  await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
  await expect(page.locator(".study-submission")).toContainText("Nessuna fonte contestuale selezionata");
  await expect(page.getByRole("button", { name: "Consegna", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Metti alla prova", exact: true }).click();
  const fluidiSend = page.waitForResponse(response => response.url().endsWith("/study/submissions") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Consegna", exact: true }).click();
  const fluidiResponse = await fluidiSend;
  expect(fluidiResponse.ok()).toBe(true);
  expect(fluidiResponse.request().postDataJSON()).toMatchObject({ editionId: "fluidi", activityId: "poiseuille-v1", sourceRefs: [] });
  expect((await fluidiResponse.json()).courseContext.packId).toBe("relazioni-fluidi-v1");
  await expect(page.getByTestId("submission-status")).toContainText("Consegnato");
  expect(errors).toEqual([]);
});

test("real PDF worker saves notes and formulas; tutor opens the delivered revision and jumps to its page", async ({ page, context, browser, baseURL }, testInfo) => {
  test.setTimeout(120_000);
  const pdf = process.env.ARDESIA_NOTEBOOK_PDF;
  if (!pdf) throw Error("ARDESIA_NOTEBOOK_PDF synthetic 3-page fixture is required");
  const errors: string[] = [], workers: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("worker", worker => workers.push(worker.url()));
  await login(context, "student-02");
  await page.goto("/?view=classroom&edition=fluidi");
  const creation = page.waitForResponse(response => response.url().endsWith("/scientific-notebooks") && response.request().method() === "POST");
  await page.getByLabel("Apri un PDF nel quaderno").setInputFiles(pdf);
  const createdResponse = await creation;
  expect(createdResponse.ok()).toBe(true);
  const created = await createdResponse.json();
  const editor = page.getByRole("region", { name: "Editor del quaderno scientifico" });
  await expect(editor.getByRole("img", { name: "Pagina 1 di 3", exact: true })).toBeVisible();
  expect(workers.some(url => url.includes("pdf.worker"))).toBe(true);
  const title = `Quaderno sintetico ${randomUUID()}`;
  const originalNote = "Revisione consegnata: pagina tre, con la relazione di proporzionalità esplicitata.";
  const laterNote = "Modifica privata successiva alla consegna: non sostituire la fonte del tutor.";
  await editor.getByLabel("Titolo del quaderno").fill(title);
  await editor.getByLabel("Pagina del PDF", { exact: true }).selectOption("3");
  await expect(editor.getByRole("img", { name: "Pagina 3 di 3", exact: true })).toBeVisible();
  await editor.getByRole("button", { name: "＋ Nota", exact: true }).click();
  await editor.getByLabel("Testo dell’annotazione").fill(originalNote);
  await editor.getByLabel("Pagina del PDF", { exact: true }).selectOption("2");
  await editor.getByRole("button", { name: "ƒ Formula", exact: true }).click();
  await expect(editor.locator("math-field")).toBeVisible();
  // MathLive finishes assigning its keyboard sink after it becomes visible.
  // Wait for real focus before sending keys, as a user would before typing.
  await editor.locator("math-field").focus();
  await expect(editor.locator("math-field")).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("x^2");
  await editor.getByText("Codice LaTeX", { exact: true }).click();
  await expect(editor.getByLabel("Codice LaTeX", { exact: true })).toHaveValue(/x.*2/);
  const save = page.waitForResponse(response => response.url().endsWith(`/scientific-notebooks/${created.id}/revisions`) && response.request().method() === "POST");
  await editor.getByRole("button", { name: "Salva modifiche", exact: true }).click();
  const savedResponse = await save;
  expect(savedResponse.ok()).toBe(true);
  const delivered = await savedResponse.json();
  expect(delivered.notebook.state.annotations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "note", page: 3, content: originalNote }),
    expect.objectContaining({ kind: "formula", page: 2 }),
  ]));
  await expect(editor.getByRole("button", { name: "Usa questa versione nella consegna" })).toBeEnabled();
  await editor.getByRole("button", { name: "Usa questa versione nella consegna" }).click();
  await page.getByLabel("La tua previsione", { exact: true }).fill("Prevedo una quarta potenza e allego i passaggi del mio quaderno.");
  await page.getByRole("button", { name: "Metti alla prova", exact: true }).click();
  await page.getByLabel("La tua spiegazione", { exact: true }).fill("Il PDF è sintetico. La nota alla pagina tre e la formula alla pagina due appartengono alla versione consegnata.");
  const sent = page.waitForResponse(response => response.url().endsWith("/study/submissions") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Consegna", exact: true }).click();
  const sentResponse = await sent;
  expect(sentResponse.ok()).toBe(true);
  expect(sentResponse.request().postDataJSON().sourceRefs).toEqual([
    { resourceId: delivered.id, revisionId: delivered.revisionId, contextId: delivered.contextId },
  ]);
  const receipt = await sentResponse.json();
  await expect(page.getByTestId("submission-status")).toContainText("Consegnato");
  await editor.getByRole("button", { name: /Revisione consegnata: pagina tre/ }).click();
  await editor.getByLabel("Testo dell’annotazione").fill(laterNote);
  const resave = page.waitForResponse(response => response.url().endsWith(`/scientific-notebooks/${created.id}/revisions`) && response.request().method() === "POST");
  await editor.getByRole("button", { name: "Salva modifiche", exact: true }).click();
  const revised = await (await resave).json();
  expect(revised.revisionId).not.toBe(delivered.revisionId);

  const tutor = await browser.newContext({ baseURL });
  await login(tutor, "tutor-synthetic");
  const review = await tutor.newPage();
  review.on("pageerror", error => errors.push(error.message));
  await review.goto("/?view=review&edition=fluidi");
  await review.getByRole("button", { name: new RegExp(`student-02.*Tentativo ${receipt.revision}.*Da correggere`) }).click();
  const reading = review.getByRole("region", { name: "Quaderno scientifico in lettura" });
  await expect(reading.getByRole("heading", { name: title })).toBeVisible();
  await expect(reading.getByText(originalNote, { exact: true })).toBeVisible();
  await expect(reading.getByText(laterNote, { exact: true })).toHaveCount(0);
  await expect(reading.getByRole("img", { name: "Pagina 1 di 3", exact: true })).toBeVisible();
  const jump = reading.getByRole("button", { name: "Apri pagina 3, annotazione 1", exact: true });
  await jump.focus();
  await review.keyboard.press("Enter");
  await expect(reading.getByLabel("Pagina del PDF", { exact: true })).toHaveValue("3");
  await expect(reading.getByRole("img", { name: "Pagina 3 di 3", exact: true })).toBeVisible();
  await expect(reading.getByRole("region", { name: "Pagina PDF, area scorrevole" })).toBeFocused();
  await reading.getByLabel("Pagina del PDF", { exact: true }).selectOption("1");
  await jump.click();
  await expect(reading.getByRole("img", { name: "Pagina 3 di 3", exact: true })).toBeVisible();
  await reading.getByLabel("Zoom del PDF", { exact: true }).selectOption("2");
  await reading.getByRole("button", { name: "Ruota il PDF di 90 gradi" }).click();
  await expect(reading.getByRole("img", { name: "Pagina 3 di 3", exact: true })).toBeVisible();
  for (const width of [390, 820, 1440]) {
    await review.setViewportSize({ width, height: 1000 });
    await reading.scrollIntoViewIfNeeded();
    await noHorizontalOverflow(review);
    await reading.screenshot({ path: testInfo.outputPath(`notebook-review-${width}.png`) });
  }
  await reading.getByLabel("Zoom del PDF", { exact: true }).selectOption("1");
  for (let turn = 0; turn < 3; turn++) await reading.getByRole("button", { name: "Ruota il PDF di 90 gradi" }).click();
  await expect(reading.getByRole("img", { name: "Pagina 3 di 3", exact: true })).toBeVisible();
  await reading.screenshot({ path: testInfo.outputPath("notebook-review-readable-1440.png") });
  const download = review.waitForEvent("download");
  await reading.getByRole("link", { name: "Scarica il PDF originale" }).click();
  const downloaded = await download;
  const downloadedPath = await downloaded.path();
  expect(downloadedPath).not.toBeNull();
  const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  expect(digest(await readFile(downloadedPath!))).toBe(digest(await readFile(pdf)));
  await review.reload();
  await review.getByRole("button", { name: new RegExp(`student-02.*Tentativo ${receipt.revision}.*Da correggere`) }).click();
  await expect(review.getByRole("region", { name: "Quaderno scientifico in lettura" }).getByText(originalNote, { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await tutor.close();
});
