import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";

const sessions = JSON.parse(fs.readFileSync(process.env.S19_SESSION_FILE!, "utf8"));
const base = "http://127.0.0.1:5198";

test("actual App: course, circuit, private material, receipt, exact teacher source and revocation", async ({ page, browser }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect((await page.request.post("/study/session", { data: { token: sessions[info.project.name] } })).ok()).toBe(true);
  await page.goto("/?edition=s19-dc&view=courses");
  const entry = page.getByRole("link", { name: "Apri laboratorio circuiti DC", exact: true });
  await expect(entry).toBeVisible();
  await entry.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Il circuito, passo dopo passo." })).toBeVisible();
  await page.getByLabel("Previsione", { exact: true }).fill("Prevedo 8 V sul resistore R2");
  await page.getByLabel("Note", { exact: true }).fill("R1: ragionamento consegnato");
  await page.getByRole("button", { name: "Calcola e mostra le equazioni" }).click();
  await expect(page.getByTestId("answer")).toContainText("8 V");
  await page.getByRole("button", { name: "Salva revisione Core", exact: true }).click();
  await expect(page.getByText("Input salvati nella revisione privata Core.", { exact: true })).toBeVisible();
  const firstURL = new URL(page.url());
  const id = firstURL.searchParams.get("resource")!, revision = firstURL.searchParams.get("revision")!;
  expect(id).toBeTruthy(); expect(revision).toBeTruthy();
  await page.goto("/?edition=s19-dc&view=materials");
  await page.locator(".material-list").getByRole("button", { name: /Circuito DC/ }).click();
  await expect(page.getByRole("article", { name: "Circuito DC salvato" })).toBeVisible();
  await expect(page.getByText("Modifica e salva una nuova versione", { exact: true })).toHaveCount(0);
  const reopen = page.getByRole("link", { name: "Apri questa revisione nel laboratorio" });
  expect(await reopen.getAttribute("href")).toContain("revision=" + revision);
  await reopen.click();
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue("R1: ragionamento consegnato");
  await page.getByRole("button", { name: "Consegna al docente", exact: true }).click();
  await expect(page.getByTestId("receipt")).toBeVisible();
  await page.getByLabel("Note", { exact: true }).fill("R2 privata, mai consegnata");
  await page.getByRole("button", { name: "Salva revisione Core", exact: true }).click();
  await expect(page.getByText("Input salvati nella revisione privata Core.", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("revision")).not.toBe(revision);

  const teacher = await browser.newContext({ viewport: info.project.use.viewport, reducedMotion: "reduce" });
  const tutorPage = await teacher.newPage(); tutorPage.on("pageerror", (error) => errors.push(error.message));
  expect((await teacher.request.post(base + "/study/session", { data: { token: sessions.teacher } })).ok()).toBe(true);
  await tutorPage.goto(base + "/?edition=s19-dc&view=review");
  await tutorPage.getByRole("complementary", { name: "Consegne del gruppo" }).getByRole("button").filter({ hasText: info.project.name === "touch" ? "s19-touch" : "s19-student" }).first().click();
  await expect(tutorPage.getByRole("region", { name: "Tentativo circuito DC" })).toContainText("Prevedo 8 V");
  await expect(tutorPage.getByRole("article", { name: "Circuito DC salvato" })).toContainText("R1: ragionamento consegnato");
  await expect(tutorPage.getByText("R2 privata, mai consegnata", { exact: true })).toHaveCount(0);
  await tutorPage.getByRole("link", { name: "Apri questa revisione nel laboratorio" }).click();
  await expect(tutorPage.getByLabel("Note", { exact: true })).toHaveValue("R1: ragionamento consegnato");
  await expect(tutorPage.getByRole("button", { name: "Salva revisione Core", exact: true })).toBeDisabled();
  await expect(tutorPage.getByRole("button", { name: "Consegna al docente", exact: true })).toHaveCount(0);
  expect(new URL(tutorPage.url()).searchParams.get("revision")).toBe(revision);
  await teacher.close();

  const peer = await browser.newContext();
  await peer.request.post(base + "/study/session", { data: { token: sessions.peer } });
  expect((await peer.request.get(base + "/study/s19/circuits/" + id + "?revisionId=" + revision)).status()).toBe(403);
  await peer.close();

  const cold = await browser.newContext({ viewport: info.project.use.viewport, reducedMotion: "reduce" });
  await cold.request.post(base + "/study/session", { data: { token: sessions[info.project.name] } });
  const coldPage = await cold.newPage();
  await coldPage.goto(firstURL.toString());
  await expect(coldPage.getByLabel("Note", { exact: true })).toHaveValue("R1: ragionamento consegnato");
  await expect(coldPage.getByRole("button", { name: "Salva revisione Core", exact: true })).toBeDisabled();
  expect(await coldPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const output = process.env.S19_SCREENSHOT_DIR;
  if (output) { fs.mkdirSync(output, { recursive: true }); await coldPage.screenshot({ path: output + "/product-" + info.project.name + ".png", fullPage: true }); }
  await coldPage.getByRole("button", { name: "Crea una copia privata", exact: true }).click();
  expect(new URL(coldPage.url()).searchParams.has("resource")).toBe(false);
  expect(new URL(coldPage.url()).searchParams.has("revision")).toBe(false);
  await coldPage.getByRole("button", { name: "Salva revisione Core", exact: true }).click();
  await expect(coldPage.getByText("Input salvati nella revisione privata Core.", { exact: true })).toBeVisible();
  expect(new URL(coldPage.url()).searchParams.get("resource")).not.toBe(id);
  await cold.request.post(base + "/study/session/revoke-all");
  await coldPage.reload();
  await expect(coldPage.getByLabel("Note", { exact: true })).toHaveCount(0);
  expect((await cold.request.get(base + "/study/s19/circuits/" + id + "?revisionId=" + revision)).status()).toBe(401);
  await cold.close();
  expect(errors).toEqual([]);
  if (output) {
    const root = path.resolve("../../..");
    const files = ["services/study-api/study_api/app.py", "packages/engine/lessonos/study/catalog.py", "packages/engine/lessonos/study/context.py", "apps/web/src/features/Courses.tsx", "apps/web/src/components/SourceViewer.tsx", "apps/web/src/features/Materials.tsx", "plugins/s19-circuit-lab/web/src/CircuitLab.tsx"];
    fs.writeFileSync(output + "/product-" + info.project.name + ".json", JSON.stringify({ status: "PASS", sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), files: files.map(file => ({ path: file, sha256: createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex") })), errors, scope: "Actual compiled App and create_app; no composition shim; local disposable Core with synthetic identities. No remote beta certification." }, null, 2) + "\n");
  }
});
