import { test, expect } from "@playwright/test";
import fs from "node:fs";
const sessions = JSON.parse(
  fs.readFileSync(process.env.S19_SESSION_FILE!, "utf8"),
);
const start = "/s19/circuit-lab/?edition=s19-dc";
test.beforeEach(async ({ page }, info) => {
  await page.request.post("/study/session", {
    data: { token: sessions[info.project.name] },
  });
  await page.goto(start);
  await expect(
    page.getByRole("heading", { name: "Il circuito, passo dopo passo." }),
  ).toBeVisible();
});

test("DC prediction, supported and unsupported steps, mutation and Core cold reopen", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByLabel("Previsione", { exact: true })
    .fill("Positiva, circa 8 V nel verso a → 0");
  await page
    .getByRole("button", { name: "Verifica il passaggio", exact: true })
    .click();
  await expect(
    page.getByText("Passaggi supportati corretti fin qui", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("answer")).toContainText("8 V");
  await page.getByLabel("Secondo riferimento", { exact: true }).fill("+R1,+R2");
  await expect(page.getByTestId("answer")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Verifica il passaggio", exact: true })
    .click();
  await expect(
    page.getByText("Un passaggio richiede una correzione", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Operazione", { exact: true }).selectOption("altro");
  await page
    .getByRole("button", { name: "Verifica il passaggio", exact: true })
    .click();
  await expect(
    page.getByText("Passaggio non valutabile", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Valore componente", { exact: true }).fill("300");
  await expect(page.getByTestId("answer")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await expect(page.getByTestId("answer")).toContainText("9 V");
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  const url = page.url();
  expect(url).toContain("resource=");
  await page.reload();
  await expect(page.getByTestId("answer")).toContainText("9 V");
  await expect(
    page.getByLabel("Valore componente", { exact: true }),
  ).toHaveValue("300");
  await page
    .getByRole("button", { name: "Consegna al docente", exact: true })
    .click();
  await expect(page.getByTestId("receipt")).toBeVisible();
  const screenshot = process.env.S19_SCREENSHOT_DIR;
  if (screenshot) {
    fs.mkdirSync(screenshot, { recursive: true });
    await page.screenshot({
      path: `${screenshot}/${info.project.name}-circuit.png`,
      fullPage: true,
    });
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("keyboard and touch select nodes and reconnect branches through accessible controls", async ({
  page,
}, info) => {
  const node = page.getByRole("group", { name: "Nodo a", exact: true });
  await node.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await expect(node).toBeFocused();
  if (info.project.name === "desktop") {
    const before = await node.boundingBox();
    await page.mouse.move(before!.x + 22, before!.y + 22);
    await page.mouse.down();
    await page.mouse.move(before!.x + 90, before!.y + 50, { steps: 8 });
    await page.mouse.up();
    const after = await node.boundingBox();
    expect(after!.x).not.toBe(before!.x);
  }
  const editor = page.getByLabel("Ramo", { exact: true });
  await editor.selectOption("R1");
  if (info.project.name === "touch")
    await page.getByLabel("Al nodo", { exact: true }).tap();
  await page.getByLabel("Al nodo", { exact: true }).selectOption("0");
  await editor.selectOption("R2");
  await page.getByLabel("Dal nodo", { exact: true }).selectOption("b");
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await expect(page.getByTestId("answer")).toContainText("12 V");
});

test("late numerical response cannot survive a changed circuit", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/study/s19/circuits/solve", async (route) => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await page.getByLabel("Valore componente", { exact: true }).fill("400");
  release();
  await expect(
    page.getByRole("button", { name: "Calcola e mostra le equazioni" }),
  ).toBeEnabled();
  await expect(page.getByTestId("answer")).toHaveCount(0);
});

test("portable JSON contains inputs and import recalculates; forged proof is refused", async ({
  page,
}) => {
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Esporta input JSON", exact: true })
    .click();
  const download = await promise;
  const file = await download.path();
  const document = JSON.parse(fs.readFileSync(file!, "utf8"));
  expect(document.answer).toBeUndefined();
  document.components[2].value = "100";
  await page.getByLabel("Importa circuito JSON").setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(page.getByTestId("answer")).toContainText("6 V");
  document.answer = { exact: "777" };
  await page.getByLabel("Importa circuito JSON").setInputFiles({
    name: "forged.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(
    page.getByText(
      "Controlla valori, morsetti e procedimento: i dati non sono accettati.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByTestId("answer")).toContainText("6 V");
});

test("editing during an acknowledged save preserves revision and newer draft", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  const resource = new URL(page.url()).searchParams.get("resource");
  await page.getByLabel("Valore componente", { exact: true }).fill("300");
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/study/s19/circuits", async (route) => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await page.getByLabel("Valore componente", { exact: true }).fill("400");
  release();
  await expect(
    page.getByRole("button", { name: "Salva revisione Core", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Consegna al docente", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/study/s19/circuits");
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get("resource")).toBe(resource);
  await page.reload();
  await expect(
    page.getByLabel("Valore componente", { exact: true }),
  ).toHaveValue("400");
});

test("procedure editor persists before verification and hydrates on cold reopen", async ({
  page,
}) => {
  await page.getByLabel("Operazione", { exact: true }).selectOption("tensione");
  await page.getByLabel("Primo riferimento", { exact: true }).fill("R2");
  await page.getByLabel("Secondo riferimento", { exact: true }).fill("a,0");
  await page.getByLabel("Valore del passaggio", { exact: true }).fill("8");
  await page
    .getByLabel("Trascrizione", { exact: true })
    .fill("V(R2)=8V con riferimento a→0");
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Operazione", { exact: true })).toHaveValue(
    "tensione",
  );
  await expect(
    page.getByLabel("Primo riferimento", { exact: true }),
  ).toHaveValue("R2");
  await expect(
    page.getByLabel("Valore del passaggio", { exact: true }),
  ).toHaveValue("8");
  await expect(
    page.getByText("Passaggi supportati corretti fin qui", { exact: true }),
  ).toBeVisible();
});

test("controlled host preserves an edit made while save acknowledgement is pending", async ({
  page,
}) => {
  await page.goto("/s19/circuit-lab/tests/host.html");
  await page.getByLabel("Note", { exact: true }).fill("first notes");
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/study/s19/circuits", async (route) => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await page.getByLabel("Note", { exact: true }).fill("newer private notes");
  release();
  await expect(
    page.getByRole("button", { name: "Salva revisione Core", exact: true }),
  ).toBeEnabled();
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue(
    "newer private notes",
  );
  await expect(
    page.getByRole("button", { name: "Consegna al docente", exact: true }),
  ).toBeDisabled();
});

test("moving a node while a save is pending leaves the layout dirty", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/study/s19/circuits", async (route) => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  const node = page.getByRole("group", { name: "Nodo a", exact: true });
  const before = await node.boundingBox();
  await node.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => Math.round((await node.boundingBox())!.x))
    .not.toBe(Math.round(before!.x));
  release();
  await expect(
    page.getByRole("button", { name: "Salva revisione Core", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Consegna al docente", exact: true }),
  ).toBeDisabled();
});

test("host transport 401 clears private state even after an intervening edit", async ({
  page,
}) => {
  await page.goto("/s19/circuit-lab/tests/host.html");
  await page.getByLabel("Note", { exact: true }).fill("PRIVATE SENTINEL");
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/study/s19/circuits/solve", async (route) => {
    await gate;
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "unauthenticated" }),
    });
  });
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await page.getByLabel("Note", { exact: true }).fill("PRIVATE EDIT");
  release();
  await expect(
    page.getByRole("heading", { name: "Sessione scaduta", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Note", { exact: true })).toHaveCount(0);
  await expect(page.getByText("PRIVATE EDIT", { exact: true })).toHaveCount(0);
});

test("transfer circuit gets a distinct Core resource", async ({ page }) => {
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  const original = new URL(page.url()).searchParams.get("resource");
  await page
    .getByRole("button", { name: "Affronta un circuito nuovo ↗", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await expect(page.getByTestId("answer")).toContainText("4 V");
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get("resource")).not.toBe(original);
});

test("unavailable engine still reopens private inputs and notes", async ({
  page,
}) => {
  await page
    .getByLabel("Note", { exact: true })
    .fill("Conservo questa osservazione");
  await page
    .getByRole("button", { name: "Salva revisione Core", exact: true })
    .click();
  await expect(
    page.getByText("Input salvati nella revisione privata Core.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.route("**/study/s19/circuits/*", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    await route.fulfill({
      response,
      json: { ...data, result: null, assessmentState: "UNAVAILABLE" },
    });
  });
  await page
    .getByRole("button", { name: "Riapri dal Core", exact: true })
    .click();
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue(
    "Conservo questa osservazione",
  );
  await expect(
    page.getByText(
      "Input e note riaperti. La verifica non è disponibile con il motore attuale.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByTestId("answer")).toHaveCount(0);
});

test("Core session revocation removes the private circuit and result", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await expect(page.getByTestId("answer")).toBeVisible();
  await page.request.post("/study/session/revoke-all");
  await page
    .getByRole("button", { name: "Calcola e mostra le equazioni" })
    .click();
  await expect(page.getByTestId("answer")).toHaveCount(0);
  await expect(
    page.getByText("La sessione è scaduta. Accedi dal tuo spazio Ardesia.", {
      exact: true,
    }),
  ).toBeVisible();
  // Restore only for other synthetic scenarios; production UI has no login.
  const fresh = JSON.parse(
    fs.readFileSync(process.env.S19_SESSION_FILE!, "utf8"),
  );
  expect(fresh.desktop).toBeTruthy();
});
