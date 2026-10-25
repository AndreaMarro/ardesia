import {expect, test} from "@playwright/test";

for (const width of [360, 390, 820, 1440]) {
  test(`spring: prediction, graph, different problem and local reopen at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 1000});
    await page.emulateMedia({reducedMotion: "reduce"});
    const errors: string[] = [], requests: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => requests.push(request.url()));
    await page.goto("/esperienza/?percorso=strumenti-meccanica&modello=molla");
    await expect(page).toHaveTitle(/Ardesia Fisica/);
    await expect(page.getByRole("heading", {level: 1})).toHaveText("Tiri una molla.Quanto si allunga?");
    await expect(page.getByRole("button", {name: "Molla e forza"})).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("spring-result")).toHaveCount(0);
    await expect(page.getByTestId("spring-graph")).toHaveCount(0);
    await page.screenshot({path: test.info().outputPath(`spring-initial-${width}.png`), fullPage: true});
    const compare = page.getByRole("button", {name: "Confronta l’allungamento"});
    await expect(compare).toBeDisabled();
    await page.getByLabel("Allungamento previsto in m").fill("0,2");
    await compare.press("Enter");
    await expect(page.getByTestId("spring-result")).toHaveText("0,2 m");
    await expect(page.getByTestId("spring-energy")).toHaveText("Energia elastica: 0,4 J");
    await expect(page.getByTestId("spring-graph")).toBeVisible();
    await page.screenshot({path: test.info().outputPath(`spring-result-${width}.png`), fullPage: true});
    await page.getByRole("button", {name: "Una molla diversa: nuova prova"}).press("Enter");
    await expect(page.getByLabel("Forza applicata")).toHaveValue("6");
    await expect(page.getByLabel("Rigidità della molla")).toHaveValue("80");
    await expect(page.getByLabel("Allungamento previsto in m")).toBeFocused();
    await expect(page.getByTestId("spring-result")).toHaveCount(0);
    await page.getByLabel("Allungamento previsto in m").fill("0,075");
    await page.getByRole("button", {name: "Salva una bozza in questo browser"}).click();
    await expect(page.getByText(/Bozza salvata solo in questo browser/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Forza applicata")).toHaveValue("6");
    await expect(page.getByLabel("Rigidità della molla")).toHaveValue("80");
    await expect(page.getByLabel("Allungamento previsto in m")).toHaveValue("0,075");
    await expect(page.getByTestId("spring-result")).toHaveCount(0);
    await expect(page.getByTestId("spring-graph")).toHaveCount(0);
    await page.getByRole("button", {name: "Confronta l’allungamento"}).click();
    await expect(page.getByTestId("spring-result")).toHaveText("0,075 m");
    await page.getByRole("button", {name: "Cancella la bozza locale"}).click();
    await page.reload();
    await expect(page.getByLabel("Forza applicata")).toHaveValue("4");
    await expect(page.getByLabel("Allungamento previsto in m")).toHaveValue("");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(requests.every(url => url.startsWith(new URL(page.url()).origin + "/esperienza/"))).toBe(true);
  });
}

test("switching the three public models never reveals a result; hydrostatic and Poiseuille drafts survive a real reload", async ({page}) => {
  const models = [
    {name: "Flusso e raggio", label: "Rapporto previsto", value: "16", compare: "Metti alla prova", result: "physics-ratio"},
    {name: "Pressione e profondità", label: "Pressione prevista in Pa", value: "19620", compare: "Confronta la pressione", result: "hydrostatic-result"},
  ];
  await page.goto("/esperienza/");
  for (const model of models) {
    await page.getByRole("button", {name: model.name}).click();
    await page.getByLabel(model.label).fill(model.value);
    await page.getByRole("button", {name: model.compare}).click();
    await expect(page.getByTestId(model.result)).toBeVisible();
    await page.getByRole("button", {name: "Salva una bozza in questo browser"}).click();
    await page.reload();
    await page.getByRole("button", {name: model.name}).click();
    await expect(page.getByLabel(model.label)).toHaveValue(model.value);
    await expect(page.getByTestId(model.result)).toHaveCount(0);
    await page.getByRole("button", {name: "Molla e forza"}).click();
    await expect(page.getByTestId("spring-result")).toHaveCount(0);
  }
});
