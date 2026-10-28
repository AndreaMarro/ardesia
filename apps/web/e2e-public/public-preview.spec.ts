import { expect, test } from "@playwright/test";

for (const width of [360, 390, 820, 1440]) {
  test(`public experiment at ${width}px predicts, discovers, recovers and transfers with zero API traffic`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    const requests: string[] = [];
    const failedRequests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    page.on("requestfailed", request => failedRequests.push(request.url() + ": " + request.failure()?.errorText));
    await page.goto("/esperienza/?percorso=fluidi-termodinamica");
    await expect(page).toHaveTitle(/Ardesia Fisica/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Un tubo più largo.Che cosa cambia?");
    await expect(page.getByRole("link", { name: "Apri il microcorso" })).toHaveAttribute("href", "/corsi/fluidi-termodinamica/");
    await expect(page.getByRole("textbox", { name: "Contatto sintetico" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Accedi/ })).toHaveCount(0);
    await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
    await expect(page.getByTestId("flow-measures")).toHaveCount(0);
    await expect(page.getByTestId("poiseuille-graph")).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Metti alla prova"})).toBeDisabled();
    await expect(page.locator("audio")).toHaveCount(0);
    expect(await page.locator(".pipe-reference").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
    await page.screenshot({ path: `test-results/public-preview/initial-${width}.png`, fullPage: true });
    // Native input, select and range are usable by keyboard, including at 360px.
    await page.getByRole("slider", {name: "Rapporto dei raggi", exact: true}).focus();
    await page.keyboard.press("End");
    await expect(page.getByRole("slider", {name: "Rapporto dei raggi", exact: true})).toHaveValue("2");
    await page.getByLabel("Rapporto previsto").fill("4");
    await page.getByRole("button", { name: "Metti alla prova" }).press("Enter");
    await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 16");
    await expect(page.getByText(/Il raggio entra alla quarta potenza:/)).toBeVisible();
    await page.getByRole("button", {name: "Guarda il grafico"}).click();
    await expect(page.getByTestId("poiseuille-graph")).toBeVisible();
    expect(await page.locator(".flow-tracer").first().evaluate(element => getComputedStyle(element).animationName)).toBe("none");
    await page.getByRole("button", {name: "Riprendi il vincolo"}).click();
    await expect(page.getByRole("heading", {name: "Un passaggio alla volta."})).toBeVisible();
    const audio = page.locator("audio");
    await expect(audio).toHaveAttribute("preload", "none");
    expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
    await page.getByRole("button", {name: "Ascolta il passaggio", exact: true}).press("Enter");
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
    await page.getByRole("button", {name: "Pausa audio", exact: true}).click();
    await page.getByRole("link", {name: "Ritrova la formula collegata"}).click();
    await expect(page.locator("#poiseuille-formula")).toBeVisible();
    await page.getByText("Modello e limiti", {exact: true}).click();
    await page.screenshot({ path: `test-results/public-preview/recovery-${width}.png`, fullPage: true });
    await page.getByLabel("Grandezza fissata").selectOption("flow");
    await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
    await expect(page.getByTestId("poiseuille-graph")).toHaveCount(0);
    await page.getByLabel("Rapporto previsto").fill("0,0625");
    await page.getByRole("button", { name: "Metti alla prova" }).click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Δp/Δp0 = 0,0625");
    await expect(page.getByTestId("flow-measures")).toHaveAttribute("data-speed-ratio", "0.25");
    await page.getByRole("button", {name: "Un problema diverso"}).press("Enter");
    await expect(page.getByRole("slider", {name: "Rapporto dei raggi", exact: true})).toHaveValue("1");
    await expect(page.getByLabel("Rapporto previsto")).toHaveValue("");
    await expect(page.getByLabel("Rapporto previsto")).toBeFocused();
    await expect(page.getByText("Nuovo problema: Q e raggio restano costanti; viscosità e lunghezza raddoppiano.")).toHaveAttribute("role", "status");
    await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
    await page.getByLabel("Rapporto previsto").fill("4");
    await page.getByRole("button", {name: "Metti alla prova"}).click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Δp/Δp0 = 4");
    await expect(page.getByTestId("flow-measures")).toHaveAttribute("data-speed-ratio", "1");
    await expect(page.getByRole("button", {name: "Guarda il grafico"})).toHaveCount(0);
    await expect(page.getByText(/La previsione coincide/)).toBeVisible();
    await page.getByRole("button", {name: "Prova di nuovo"}).click();
    await expect(page.getByLabel("Rapporto previsto")).toHaveValue("");
    await expect(page.getByLabel("Rapporto previsto")).toBeFocused();
    await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
    await expect(page.getByTestId("lesson-demo")).toHaveCount(0);
    // A retry still belongs to the same prescribed problem. Manual edits leave it.
    await expect(page.getByText("Nuovo problema: Q e raggio restano costanti; viscosità e lunghezza raddoppiano.")).toBeVisible();
    await page.getByLabel("Grandezza fissata").selectOption("pressure");
    await expect(page.locator(".transfer-prompt")).toHaveCount(0);
    await page.getByRole("button", {name: "Ricomincia l’esperimento"}).click();
    await expect(page.getByLabel("Rapporto previsto")).toBeFocused();
    await expect(page.getByRole("slider", {name: "Rapporto dei raggi", exact: true})).toHaveValue("2");
    await expect(page.getByLabel("Grandezza fissata")).toHaveValue("pressure");
    await page.getByText("Modello e limiti", { exact: true }).click();
    await expect(page.getByText(/Questa anteprima esplora 62 configurazioni/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(requests.some((url) => url.includes("/study/"))).toBe(false);
    const origin = new URL(page.url()).origin;
    expect(requests.every((url) => url.startsWith(origin + "/esperienza/"))).toBe(true);
  });
}

test("public mount preserves course context, exact files and a closed static network policy", async ({ page, request }) => {
  await page.goto("/esperienza/?percorso=elettricita-magnetismo");
  await expect(page.getByRole("link", {name: "Apri il microcorso"})).toHaveAttribute("href", "/corsi/elettricita-magnetismo/");
  await page.goto("/esperienza/?percorso=unknown");
  await expect(page.getByRole("link", {name: "Apri il microcorso"})).toHaveAttribute("href", "/corsi/fluidi-termodinamica/");
  const home = await request.get("/esperienza/");
  expect(home.headers()["content-security-policy"]).toContain("connect-src 'none'");
  expect(home.headers()["content-security-policy"]).toContain("media-src 'self'");
  if (process.env.ARDESIA_PUBLIC_BASE_URL) {
    // The composed artifact also serves its real landing at the root.
    expect((await request.get("/")).status()).toBe(200);
  } else {
    expect((await request.get("/", {maxRedirects: 0})).headers().location).toBe("/esperienza/");
  }
  for (const path of ["/study/session", "/study/public/course", "/study/public/activities/evaluate", "/esperienza/study/session", "/esperienza/unknown-page", "/studio/", "/assets/unknown.js"]) {
    expect((await request.get(path)).status()).toBe(404);
    expect((await request.post(path, { data: {} })).status()).toBe(404);
  }
});

test("mean-transport motion pauses exactly, resumes, and reset returns to an unrevealed experiment", async ({ page }) => {
  await page.emulateMedia({reducedMotion: "no-preference"});
  await page.goto("/esperienza/");
  await page.getByLabel("Rapporto previsto").fill("16");
  await page.getByRole("button", {name: "Metti alla prova"}).click();
  const tracer = page.locator(".flow-tracer").first();
  const position = () => tracer.evaluate(element => getComputedStyle(element).transform);
  const moving = await position();
  await page.waitForTimeout(200); // compare actual animation frames, not a UI readiness delay
  expect(await position()).not.toBe(moving);
  const pause = page.getByRole("button", {name: "Ferma il flusso"});
  await pause.click();
  const resume = page.getByRole("button", {name: "Anima il flusso"});
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(50);
  const stopped = await position();
  await page.waitForTimeout(200);
  expect(await position()).toBe(stopped);
  await resume.press("Enter");
  await expect(page.getByRole("button", {name: "Ferma il flusso"})).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(200);
  expect(await position()).not.toBe(stopped);
  await page.getByRole("button", {name: "Ricomincia l’esperimento"}).click();
  await expect(page.getByRole("slider", {name: "Rapporto dei raggi", exact: true})).toHaveValue("2");
  await expect(page.getByLabel("Grandezza fissata")).toHaveValue("pressure");
  await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
  await expect(page.locator(".flow-tracer")).toHaveCount(0);
});


test("public entry exposes the four canonical microcourses without a fake registration", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/esperienza/");
  await expect(page.getByRole("heading", {name: "Quattro percorsi. Una fisica da capire."})).toBeVisible();
  for (const [slug, title] of [
    ["strumenti-meccanica", "Strumenti e meccanica"],
    ["fluidi-termodinamica", "Fluidi e termodinamica"],
    ["elettricita-magnetismo", "Elettricità e magnetismo"],
    ["onde-ottica-radiazioni", "Onde, ottica e radiazioni"],
  ]) {
    const link = page.getByRole("link", {name: `Apri il percorso ${title}`});
    await expect(link).toHaveAttribute("href", `/corsi/${slug}/`);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("button", {name: /Iscriviti|Paga ora/})).toHaveCount(0);
  await expect(page.getByText(/in revisione/).first()).toBeVisible();
});
