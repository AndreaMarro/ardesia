import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { defaultDocument } from "../src/model";
const sessions = JSON.parse(
  fs.readFileSync(process.env.S19_SESSION_FILE!, "utf8"),
);
const start = "/s19/circuit-lab/?edition=s19-dc";
test.beforeEach(async ({ page }, info) => {
  const session = info.title.startsWith("Core session revocation")
    ? "revocation-" + info.project.name : info.project.name;
  const login = await page.request.post("/study/session", {
    data: { token: sessions[session] },
  });
  expect(login.status()).toBe(200);
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

for (const status of [403, 404]) test(`host transport ${status} removes private state after a concurrent edit`, async ({ page }) => {
  await page.goto("/s19/circuit-lab/tests/host.html");
  await page.getByLabel("Note", { exact: true }).fill("PRIVATE ACCESS SENTINEL");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/study/s19/circuits/solve", async (route) => {
    await gate;
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: status === 403 ? "forbidden" : "not_found" }) });
  });
  await page.getByRole("button", { name: "Calcola e mostra le equazioni" }).click();
  await page.getByLabel("Note", { exact: true }).fill("PRIVATE ACCESS EDIT");
  release();
  await expect(page.getByLabel("Note", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("answer")).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText(status === 403 ? "non è accessibile" : "non è più disponibile");
});

test("a late forbidden response for A cannot erase authorized document B", async ({ page }) => {
  const create = async (notes: string) => {
    const response = await page.request.post("/study/s19/circuits", {
      data: { editionId: "s19-dc", document: { ...defaultDocument, notes } }, headers: { "Idempotency-Key": randomUUID() },
    });
    expect(response.ok()).toBe(true); return response.json();
  };
  const a = await create("PRIVATE A"), b = await create("AUTHORIZED B");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let started!: () => void;
  const requested = new Promise<void>((resolve) => { started = resolve; });
  await page.route("**/study/s19/circuits/" + a.id + "?*", async (route) => {
    started();
    await gate;
    await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ error: "forbidden" }) });
  });
  await page.goto(start + "&resource=" + a.id + "&revision=" + a.revisionId);
  await requested;
  await page.evaluate((resource) => {
    const url = new URL(location.href); url.searchParams.set("resource", resource.id); url.searchParams.set("revision", resource.revisionId);
    history.pushState(null, "", url); dispatchEvent(new PopStateEvent("popstate"));
  }, b);
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue("AUTHORIZED B");
  const denied = page.waitForResponse((r) => r.url().includes(a.id)); release(); await denied;
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue("AUTHORIZED B");
  await expect(page.getByRole("heading", { name: "Accesso non disponibile" })).toHaveCount(0);
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
  // This actor is dedicated to revocation; other scenarios keep independent sessions.
});


test("downloaded Unicode input bytes round-trip without rewriting the file", async ({ page }) => {
  const document = {
    schema: "s19-circuit.v1",
    components: [
      { id: "V1", kind: "V", a: "b", b: "0", value: "12" },
      { id: "R1", kind: "R", a: "b", b: "a", value: "100" },
      { id: "R2", kind: "R", a: "a", b: "0", value: "200" },
    ],
    question: { quantity: "voltage", target: "R2" },
    prediction: "8 V", notes: "😀".repeat(2000), layout: {},
    trace: {
      schema: "student-trace.v1",
      circuit_fingerprint: createHash("sha256").update("V1 b 0 12 volt\nR1 b a 100 ohm\nR2 a 0 200 ohm\n? voltage R2").digest("hex"),
      steps: Array.from({ length: 32 }, () => ({ transcription: "x".repeat(284), operation: "kcl", first: "a", second: "-R1,+R2" })),
    },
  };
  const saved = await page.request.post("/study/s19/circuits", {
    data: { editionId: "s19-dc", document }, headers: { "Idempotency-Key": randomUUID() },
  });
  expect(saved.status()).toBe(200);
  const resource = await saved.json();
  await page.goto(start + "&resource=" + resource.id);
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue(document.notes);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Esporta input JSON", exact: true }).click();
  const downloaded = await pending;
  const bytes = fs.readFileSync((await downloaded.path())!);
  expect(bytes.byteLength).toBeGreaterThan(20000);
  expect(bytes.byteLength).toBeLessThanOrEqual(64000);
  expect(JSON.parse(bytes.toString("utf8"))).toEqual(document);
  await page.getByRole("button", { name: "Affronta un circuito nuovo" }).click();
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue("");
  await page.getByLabel("Importa circuito JSON", { exact: true }).setInputFiles({
    name: downloaded.suggestedFilename(), mimeType: "application/json", buffer: bytes,
  });
  await expect(page.getByText("Input importati e ricalcolati. Il file non attribuisce permessi o certificazioni.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Note", { exact: true })).toHaveValue(document.notes);
});
