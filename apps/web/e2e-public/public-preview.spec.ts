import { expect, test } from "@playwright/test";

for (const width of [390, 820, 1440]) {
  test(`static lab at ${width}px loads, navigates and evaluates with zero API traffic`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    const requests: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(page).toHaveTitle(/Ardesia Fisica/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({ path: `test-results/public-preview/home-${width}.png` });
    await expect(page.getByText("Quattro incontri proposti")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Contatto sintetico" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Accedi/ })).toHaveCount(0);
    await page.getByRole("link", { name: "Il laboratorio", exact: true }).click();
    await expect(page).toHaveURL(/#laboratorio$/);
    await page.getByLabel("La tua previsione").fill("Previsione privata: il rapporto cambia.");
    await page.getByRole("slider", { name: "Rapporto dei raggi" }).press("End");
    await page.getByRole("button", { name: "Metti alla prova" }).click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 16");
    await page.getByLabel("Grandezza fissata").selectOption("flow");
    await expect(page.getByTestId("physics-ratio")).toHaveCount(0);
    await page.getByRole("button", { name: "Metti alla prova" }).click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Δp/Δp0 = 0,0625");
    await page.getByText("Modello e limiti", { exact: true }).click();
    await expect(page.getByText(/Questa anteprima esplora 62 configurazioni/)).toBeVisible();
    await page.screenshot({ path: `test-results/public-preview/lab-${width}.png`, fullPage: true });
    await page.getByRole("link", { name: "Il simulatore", exact: true }).click();
    await expect(page).toHaveURL(/#esame$/);
    await expect(page.getByRole("heading", { name: "Simulazione d’esame non ancora disponibile" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(requests.some((url) => url.includes("/study/"))).toBe(false);
    expect(requests.every((url) => url.startsWith("http://127.0.0.1:5324/"))).toBe(true);
  });
}

test("missing API routes are 404s and the static policy forbids API connections", async ({ request }) => {
  const home = await request.get("/");
  expect(home.headers()["content-security-policy"]).toContain("connect-src 'none'");
  for (const path of ["/study/session", "/study/public/course", "/study/public/activities/evaluate"]) {
    expect((await request.get(path)).status()).toBe(404);
    expect((await request.post(path, { data: {} })).status()).toBe(404);
  }
});
