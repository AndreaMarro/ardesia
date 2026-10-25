/** Read-only public UI QA. Header values are read from the environment and never written. */
import {createRequire} from "node:module";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {resolve, join} from "node:path";
import {performance} from "node:perf_hooks";

const repo = resolve(process.env.ARDESIA_QA_REPO || process.cwd());
const require = createRequire(join(repo, "apps/web/package.json"));
const {chromium, expect} = require("@playwright/test");
const base = new URL(process.env.ARDESIA_PUBLIC_BASE_URL || "http://127.0.0.1:5325");
if (base.username || base.password || base.search || base.hash || base.pathname !== "/")
  throw new Error("Use a bare origin in ARDESIA_PUBLIC_BASE_URL; supply protection headers only through ARDESIA_PUBLIC_QA_HEADERS.");
const headers = JSON.parse(process.env.ARDESIA_PUBLIC_QA_HEADERS || "{}");
const output = resolve(process.env.ARDESIA_PUBLIC_QA_OUT || "/private/tmp/ardesia-release-20261025/public-physics/browser-qa");
await mkdir(output, {recursive: true});
const browser = await chromium.launch({headless: true, executablePath: process.env.ARDESIA_BROWSER || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const scenarios = [
  {id: "poiseuille", slug: "poiseuille", button: "Flusso e raggio", input: "Rapporto previsto", value: "16", compare: "Metti alla prova", result: "physics-ratio", expected: "Q/Q0 = 16", graph: "poiseuille-graph", transfer: "Un problema diverso", newValue: "4", newExpected: "Δp/Δp0 = 4"},
  {id: "hydrostatic", slug: "idrostatica", button: "Pressione e profondità", input: "Pressione prevista in Pa", value: "19620", compare: "Confronta la pressione", result: "hydrostatic-result", expected: "19.620 Pa", graph: "hydrostatic-graph", transfer: "Cambia fluido: una nuova prova", newValue: "23544", newExpected: "23.544 Pa"},
  {id: "spring", slug: "molla", button: "Molla e forza", input: "Allungamento previsto in m", value: "0,2", compare: "Confronta l’allungamento", result: "spring-result", expected: "0,2 m", graph: "spring-graph", transfer: "Una molla diversa: nuova prova", newValue: "0,075", newExpected: "0,075 m"},
];
const report = {origin: base.origin, viewports: [360, 390, 820, 1440], browser: "Chromium", reducedMotion: true, scenarios: [], passed: false};
try {
  for (const width of report.viewports) {
    const context = await browser.newContext({viewport: {width, height: 1000}, reducedMotion: "reduce", extraHTTPHeaders: headers});
    if (process.env.ARDESIA_PUBLIC_QA_ACCESS_FILE) {
      const access = JSON.parse(await readFile(process.env.ARDESIA_PUBLIC_QA_ACCESS_FILE, "utf8"));
      const accessUrl = new URL(access.url);
      if (accessUrl.origin !== base.origin || !accessUrl.searchParams.has("_vercel_share")) throw new Error("Invalid temporary access destination");
      // Share links set a scoped cookie; they are not automation bypass headers.
      // Keep cookies only in this context, with no storageState, HAR or trace.
      try {
        const response = await context.request.get(accessUrl.href);
        if (response.status() !== 200) throw new Error("Access failed");
      } catch { throw new Error("Temporary preview access failed; private URL omitted"); }
    }
    const page = await context.newPage();
    for (const model of scenarios) {
      const started = performance.now(), errors = [], unexpected = [], failed = [];
      const onError = error => errors.push(error.message);
      const onRequest = request => {
        const url = new URL(request.url());
        if (url.origin !== base.origin || !url.pathname.startsWith("/esperienza/")) unexpected.push(url.origin + url.pathname);
      };
      const onFailed = request => failed.push({path: new URL(request.url()).pathname,
        reason: request.failure()?.errorText || "UNKNOWN"});
      page.on("pageerror", onError); page.on("request", onRequest); page.on("requestfailed", onFailed);
      const result = {model: model.id, width, height: 1000, passed: false};
      try {
        await page.goto(new URL(`/esperienza/?modello=${model.slug}`, base.origin).href);
        await expect(page).toHaveTitle(/Ardesia Fisica/);
        await expect(page.getByRole("heading", {level: 1})).toBeVisible();
        await expect(page.getByRole("button", {name: model.button, exact: true})).toHaveAttribute("aria-pressed", "true");
        const expectedCourse = model.id === "spring" ? "strumenti-meccanica" : "fluidi-termodinamica";
        await expect(page.getByRole("link", {name: "Chiedi disponibilità"})).toHaveAttribute("href", `/?percorso=${expectedCourse}#contatto`);
        await expect(page.getByTestId(model.result)).toHaveCount(0);
        await expect(page.getByTestId(model.graph)).toHaveCount(0);
        await expect(page.getByRole("button", {name: model.compare, exact: true})).toBeDisabled();
        await page.getByLabel(model.input, {exact: true}).fill(model.value);
        await page.getByRole("button", {name: model.compare, exact: true}).press("Enter");
        await expect(page.getByTestId(model.result)).toHaveText(model.expected);
        if (model.id === "poiseuille") await page.getByRole("button", {name: "Guarda il grafico", exact: true}).click();
        await expect(page.getByTestId(model.graph)).toBeVisible();
        await page.screenshot({path: join(output, `${model.id}-${width}.png`), fullPage: true});
        await page.getByRole("button", {name: model.transfer, exact: true}).press("Enter");
        await expect(page.getByLabel(model.input, {exact: true})).toHaveValue("");
        await expect(page.getByLabel(model.input, {exact: true})).toBeFocused();
        await expect(page.getByTestId(model.result)).toHaveCount(0);
        await page.getByLabel(model.input, {exact: true}).fill(model.newValue);
        await page.getByRole("button", {name: "Salva una bozza in questo browser", exact: true}).click();
        await expect(page.getByText(/Bozza salvata solo in questo browser/)).toBeVisible();
        await page.waitForLoadState("networkidle");
        await page.reload();
        await expect(page.getByLabel(model.input, {exact: true})).toHaveValue(model.newValue);
        await expect(page.getByTestId(model.result)).toHaveCount(0);
        await page.getByRole("button", {name: model.compare, exact: true}).click();
        await expect(page.getByTestId(model.result)).toHaveText(model.newExpected);
        await page.getByRole("button", {name: "Cancella la bozza locale", exact: true}).click();
        await page.waitForLoadState("networkidle");
        await page.reload();
        await expect(page.getByLabel(model.input, {exact: true})).toHaveValue("");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.waitForLoadState("networkidle");
        expect(errors).toEqual([]); expect(unexpected).toEqual([]); expect(failed).toEqual([]);
        Object.assign(result, {passed: true, checks: ["page-identity", "visible-app", "prediction-before-output", "Core-oracle", "graph", "fresh-transfer", "local-reload", "local-erase", "keyboard-focus", "no-horizontal-overflow", "no-page-errors", "static-network"], elapsedMs: Math.round(performance.now() - started)});
        console.log(`PASS ${model.id} ${width}px`);
      } catch (error) {
        result.error = String(error.message).replace(/https?:\/\/[^\s)"']+/g, "[URL omitted]");
        result.pageErrors = errors.map(message => message.replace(/https?:\/\/[^\s)"']+/g, "[URL omitted]"));
        result.failedRequests = failed;
        await page.screenshot({path: join(output, `FAIL-${model.id}-${width}.png`), fullPage: true}).catch(() => {});
        console.log(`FAIL ${model.id} ${width}px`);
      } finally {
        report.scenarios.push(result);
        page.off("pageerror", onError); page.off("request", onRequest); page.off("requestfailed", onFailed);
      }
    }
    await context.close();
  }
  report.passed = report.scenarios.every(result => result.passed);
} finally {
  await browser.close();
  await writeFile(join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
if (!report.passed) process.exitCode = 1;
