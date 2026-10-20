/** Opt-in local Auth/Postgres/Storage proof. No credentials in browser forms or artifacts. */
import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const QA = path.resolve(
  process.env.ARDESIA_SUPABASE_QA_DIR ?? path.join(REPO, "../qa-supabase"),
);
const ACCESS = path.resolve(
  process.env.ARDESIA_SUPABASE_ACCESS ??
    path.join(REPO, "../g0-supabase-data/supabase-access.json"),
);
const hash = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trimEnd();
type Access = {
  authentication: string;
  synthetic: boolean;
  tokens: Record<string, string>;
};
type Reference = { resourceId: string; revisionId: string; contextId: string };
type View = {
  instanceId: string;
  pluginState: Reference;
  bounds: { x: number; y: number; width: number; height: number };
};
type Workspace = {
  resources: { id: string; revisionId: string }[];
  layouts: View[];
  layoutSaved: boolean;
  layoutVersion: string;
};
async function authenticate(
  context: BrowserContext,
  actor: string,
  access: Access,
) {
  let response;
  try {
    response = await context.request.post("/study/session", {
      data: { token: access.tokens[actor] },
    });
  } catch {
    throw Error("auth_transport_failed");
  }
  expect(response.status()).toBe(200);
  expect((await response.json()).id).toBe(actor);
  expect(
    (await context.cookies()).some(
      (cookie) =>
        cookie.name === "study_session" &&
        cookie.httpOnly &&
        cookie.sameSite === "Strict",
    ),
  ).toBe(true);
}
async function workspace(context: BrowserContext): Promise<Workspace> {
  const response = await context.request.get(
    "/study/workspace?editionId=fluidi",
  );
  expect(response.status()).toBe(200);
  return response.json();
}
async function saveBoard(page: Page) {
  const response = page.waitForResponse(
    (value) =>
      value.url().endsWith("/study/layout") &&
      value.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Salva disposizione", exact: true })
    .click();
  expect((await response).status()).toBe(200);
  await expect(page.getByTestId("board-save-state")).toHaveText(
    "Disposizione salvata.",
  );
}
async function drag(
  page: Page,
  locator: ReturnType<Page["locator"]>,
  dx: number,
  dy: number,
) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const start = {
    x: box!.x + Math.min(24, box!.width / 2),
    y: box!.y + box!.height / 2,
  };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + dx, start.y + dy, { steps: 4 });
  await page.mouse.up();
}
test.use({ trace: "off", video: "off", screenshot: "off" });
test.skip(
  process.env.ARDESIA_SOURCE_BOARD !== "1",
  "Requires explicit local real Auth/Postgres/Storage candidate runtime.",
);
test("one source keeps exact independent views, historical authorization and portable tutor export", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(180000);
  expect(
    Boolean(baseURL && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(baseURL)),
  ).toBe(true);
  await mkdir(QA, { recursive: true, mode: 0o700 });
  const access: Access = JSON.parse(await readFile(ACCESS, "utf8"));
  expect(access.authentication).toBe("real_local_supabase");
  expect(access.synthetic).toBe(true);
  const student = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1000 },
  });
  const tutor = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1000 },
  });
  const executionId = randomUUID(),
    baseHeadAtStart = git("rev-parse", "HEAD"),
    gitStatusAtStart = git("status", "--porcelain");
  const assertions: string[] = [],
    screenshots: { name: string; sha256: string }[] = [],
    errors: string[] = [];
  const builtFrontendFiles: { path: string; sha256: string }[] = [];
  let phase = "runtime",
    completed = false;
  async function capture(page: Page, name: string) {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const bytes = await page.screenshot({ path: path.join(QA, name) });
    screenshots.push({ name, sha256: hash(bytes) });
  }
  try {
    if (process.env.STUDY_EXPECTED_SHA)
      expect(baseHeadAtStart).toBe(process.env.STUDY_EXPECTED_SHA);
    const health = await (await student.request.get("/study/health")).json();
    expect(health.persistence).toBe("postgres");
    expect(health.authentication).toBe("supabase");
    const index = await student.request.get("/");
    const indexBytes = await index.body();
    expect(hash(indexBytes)).toBe(
      hash(await readFile(path.join(REPO, "apps/web/dist/index.html"))),
    );
    builtFrontendFiles.push({ path: "index.html", sha256: hash(indexBytes) });
    for (const match of indexBytes
      .toString()
      .matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) {
      const bytes = await (await student.request.get(match[1])).body();
      expect(hash(bytes)).toBe(
        hash(
          await readFile(path.join(REPO, "apps/web/dist", match[1].slice(1))),
        ),
      );
      builtFrontendFiles.push({ path: match[1], sha256: hash(bytes) });
    }
    await authenticate(student, "student-01", access);
    await authenticate(tutor, "tutor-synthetic", access);
    const baseline = await workspace(student),
      tutorBaseline = await workspace(tutor);
    expect(baseline.layoutVersion).toMatch(/^[a-f0-9]{64}$/);
    const page = await student.newPage(),
      review = await tutor.newPage();
    for (const surface of [page, review])
      surface.on("pageerror", (error) => errors.push(error.name));
    await page.goto("/?view=classroom");
    await expect(page).toHaveTitle(/Ardesia/i);
    await expect(
      page.getByRole("heading", {
        name: "Il tavolo delle fonti.",
        exact: true,
      }),
    ).toBeVisible();
    const original = `TAVOLO ${executionId}: Q cresce con r².`;
    const revised = `TAVOLO ${executionId}: Q cresce con r⁴.`;
    phase = "source_and_receipt";
    await page
      .getByLabel("La tua previsione", { exact: true })
      .fill("Prevedo Q proporzionale alla quarta potenza del raggio.");
    await page
      .getByRole("button", { name: "Metti alla prova", exact: true })
      .click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 5,0625");
    await page
      .getByLabel("Una nota, una domanda, un procedimento")
      .fill(original);
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/study/resources") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Salva nota privata", exact: true })
      .click();
    const createResponse = await created;
    expect(createResponse.status()).toBe(200);
    expect(createResponse.request().headers()["idempotency-key"]).toMatch(
      /^[a-f0-9-]{36}$/,
    );
    const source = await createResponse.json();
    await expect(
      page.getByText("Nota salvata nel tuo spazio privato.", { exact: true }),
    ).toBeVisible();
    expect([403, 404]).toContain(
      (
        await tutor.request.get(
          `/study/resources/${source.id}/revisions/${source.revisionId}`,
        )
      ).status(),
    );
    await page.getByLabel("La tua spiegazione", { exact: true }).fill(original);
    const delivered = page.waitForResponse(
      (response) =>
        response.url().endsWith("/study/submissions") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Consegna", exact: true }).click();
    const receipt = await (await delivered).json();
    await expect(page.getByTestId("submission-status")).toContainText(
      receipt.receiptId,
    );
    assertions.push("private_source_create_key_and_real_submitted_receipt");

    phase = "independent_views";
    const library = page.getByRole("complementary", {
      name: "Biblioteca delle fonti",
    });
    await library
      .locator("li")
      .filter({ hasText: original })
      .getByRole("button", { name: /Apri fonte/ })
      .click();
    const cards = page
      .locator(".source-board-view")
      .filter({ hasText: original });
    await expect(cards).toHaveCount(1);
    await cards
      .first()
      .getByRole("button", { name: /Duplica vista/ })
      .click();
    await expect(cards).toHaveCount(2);
    await page.getByRole("button", { name: "Tavolo", exact: true }).click();
    const copy = cards.last();
    await copy.locator(".board-view-handle").click();
    await page
      .getByText("Posizione e dimensioni della vista selezionata", {
        exact: true,
      })
      .click();
    await page.getByLabel("Orizzontale della vista selezionata").fill("416");
    await page.getByLabel("Verticale della vista selezionata").fill("24");
    await drag(page, copy.locator(".board-view-handle"), 24, 24);
    await copy.locator(".board-view-handle").press("ArrowLeft");
    await copy
      .getByRole("button", { name: /Ridimensiona vista/ })
      .press("ArrowRight");
    await drag(
      page,
      copy.getByRole("button", { name: /Ridimensiona vista/ }),
      16,
      16,
    );
    await saveBoard(page);
    const arranged = await workspace(student),
      views = arranged.layouts.filter(
        (view) => view.pluginState.resourceId === source.id,
      );
    expect(views).toHaveLength(2);
    expect(new Set(views.map((view) => view.instanceId)).size).toBe(2);
    expect(views.map((view) => view.pluginState)).toEqual(
      [0, 1].map(() => ({
        resourceId: source.id,
        revisionId: source.revisionId,
        contextId: source.contextId,
      })),
    );
    expect(views[0].bounds).toEqual({
      x: 24 + (baseline.layouts.length % 3) * 400,
      y: 24 + Math.floor(baseline.layouts.length / 3) * 344,
      width: 360,
      height: 300,
    });
    expect(views[1].bounds).toEqual({ x: 424, y: 48, width: 392, height: 316 });
    expect(
      arranged.resources.filter((resource) => resource.id === source.id),
    ).toHaveLength(1);
    await page
      .locator(".source-board-heading")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await capture(page, "source-board-table-1440.png");
    await page.reload();
    await expect(
      page.locator(".source-board-view").filter({ hasText: original }),
    ).toHaveCount(2);
    expect(
      (await workspace(student)).layouts.filter(
        (view) => view.pluginState.resourceId === source.id,
      ),
    ).toEqual(views);
    assertions.push(
      "one_resource_two_independent_exact_views_keyboard_pointer_persist_reload",
    );

    phase = "layout_conflict";
    const selected = page
      .locator(".source-board-view")
      .filter({ hasText: original })
      .first();
    await selected.locator(".board-view-handle").press("ArrowRight");
    await page
      .getByText("Posizione e dimensioni della vista selezionata", {
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("Orizzontale della vista selezionata"),
    ).toHaveValue(String(views[0].bounds.x + 16));
    const concurrent = arranged.layouts.map((view) =>
      view.instanceId === views[0].instanceId
        ? { ...view, bounds: { ...view.bounds, y: view.bounds.y + 8 } }
        : view,
    );
    const updatedByOtherTab = await student.request.post("/study/layout", {
      data: {
        editionId: "fluidi",
        views: concurrent,
        expectedVersion: arranged.layoutVersion,
      },
    });
    expect(updatedByOtherTab.status()).toBe(200);
    const rejected = page.waitForResponse(
      (response) =>
        response.url().endsWith("/study/layout") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Salva disposizione", exact: true })
      .click();
    expect((await rejected).status()).toBe(409);
    await expect(
      page.getByText("Una disposizione più recente è sul server.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Orizzontale della vista selezionata"),
    ).toHaveValue(String(views[0].bounds.x + 16));
    expect((await workspace(student)).layouts).toEqual(concurrent);
    await page
      .getByRole("button", {
        name: "Ricarica disposizione del server",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Ricarica e scarta le modifiche locali",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("board-save-state")).toHaveText(
      "Disposizione del server ricaricata.",
    );
    await expect(
      page.getByLabel("Orizzontale della vista selezionata"),
    ).toHaveValue(String(views[0].bounds.x));
    assertions.push("real_cas_conflict_preserves_draft_until_explicit_reload");

    phase = "private_new_revision";
    await page.getByRole("button", { name: "Materiali", exact: true }).click();
    await page
      .locator(".material-list li")
      .filter({ hasText: original })
      .getByRole("button")
      .click();
    await page
      .getByText("Modifica e salva una nuova versione", { exact: true })
      .click();
    await page.getByLabel("Modifica il testo della fonte").fill(revised);
    const revisionResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/study/resources/${source.id}/revise`) &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Salva una nuova revisione", exact: true })
      .click();
    const revision = await (await revisionResponse).json();
    expect(revision.revisionId).not.toBe(source.revisionId);
    await page.goto("/?view=classroom");
    const oldCards = page
      .locator(".source-board-view")
      .filter({ hasText: original });
    await expect(oldCards).toHaveCount(2);
    await oldCards
      .first()
      .getByRole("button", { name: "Aggiorna questa vista", exact: true })
      .click();
    await expect(
      page
        .locator(".source-board-view .original-text")
        .filter({ hasText: revised }),
    ).toHaveCount(1);
    await expect(
      page
        .locator(".source-board-view .original-text")
        .filter({ hasText: original }),
    ).toHaveCount(1);
    await saveBoard(page);
    expect(
      (await workspace(student)).layouts
        .filter((view) => view.pluginState.resourceId === source.id)
        .map((view) => view.pluginState.revisionId),
    ).toEqual([revision.revisionId, source.revisionId]);
    assertions.push(
      "private_revision_does_not_replace_pins_refresh_is_explicit_per_view",
    );

    phase = "tutor_historical_and_notebook";
    expect([403, 404]).toContain(
      (
        await tutor.request.get(
          `/study/resources/${source.id}/revisions/${revision.revisionId}`,
        )
      ).status(),
    );
    expect(
      (
        await tutor.request.get(
          `/study/resources/${source.id}/revisions/${source.revisionId}`,
        )
      ).status(),
    ).toBe(200);
    await review.goto("/?view=classroom");
    const oldEntry = review
      .getByRole("complementary", { name: "Biblioteca delle fonti" })
      .locator("li")
      .filter({ hasText: source.revisionId.slice(0, 8) });
    await expect(oldEntry).toContainText("Versione consegnata");
    await oldEntry.getByRole("button", { name: /Apri fonte/ }).click();
    const tutorCards = review
      .locator(".source-board-view")
      .filter({ hasText: original });
    await expect(tutorCards).toHaveCount(1);
    await tutorCards
      .first()
      .getByRole("button", { name: /Duplica vista/ })
      .click();
    await expect(tutorCards).toHaveCount(2);
    await saveBoard(review);
    await tutorCards
      .first()
      .getByText("Fonte, versione e contesto", { exact: true })
      .click();
    const contextResponse = review.waitForResponse((response) =>
      response.url().includes(`/study/context/${source.contextId}?`),
    );
    await tutorCards
      .first()
      .getByRole("button", { name: "Apri il contesto di lavoro", exact: true })
      .click();
    expect((await contextResponse).status()).toBe(200);
    await expect(
      tutorCards
        .first()
        .getByText("Contesto della versione consegnata", { exact: true }),
    ).toBeVisible();
    await review
      .locator(".source-board-heading")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await capture(review, "source-board-tutor-historical-1440.png");
    await review
      .getByRole("button", { name: "Materiali", exact: true })
      .click();
    await review
      .getByText("Quaderno portabile dell’edizione", { exact: true })
      .click();
    const download = review.waitForEvent("download");
    await review
      .getByRole("button", { name: "Esporta quaderno", exact: true })
      .click();
    const notebookPath = path.join(
      QA,
      `source-board-notebook-${executionId}.study.json`,
    );
    await (await download).saveAs(notebookPath);
    const notebookBytes = await readFile(notebookPath),
      notebook = JSON.parse(notebookBytes.toString());
    expect(
      notebook.layout.filter(
        (view: View) => view.pluginState.resourceId === source.id,
      ),
    ).toHaveLength(2);
    expect(
      notebook.layout
        .filter((view: View) => view.pluginState.resourceId === source.id)
        .every(
          (view: View) => view.pluginState.revisionId === source.revisionId,
        ),
    ).toBe(true);
    expect(notebook.layout).toHaveLength(tutorBaseline.layouts.length + 2);
    expect(
      notebook.resourceRevisions.some(
        (item: { id: string; revisionId: string; text: string }) =>
          item.id === source.id &&
          item.revisionId === source.revisionId &&
          item.text === original,
      ),
    ).toBe(true);
    await review
      .getByLabel("Riapri quaderno .study.json")
      .setInputFiles(notebookPath);
    await expect(
      review.getByText(/Quaderno riaperto in lettura:/),
    ).toBeVisible();
    await expect(
      review.getByText(/Autenticità canonica non verificata/),
    ).toBeVisible();
    const reopened = review
      .locator("article.study-postit")
      .filter({ hasText: original })
      .filter({ hasText: `Revisione: ${source.revisionId}` });
    await expect(reopened).toHaveCount(1);
    await expect(
      review.getByRole("heading", {
        name: "Omissioni dell’export",
        exact: true,
      }),
    ).toBeVisible();
    assertions.push(
      "tutor_exact_historical_context_private_new_revision_denied_portable_layout_and_integrity",
    );

    phase = "detach_reopen_mobile";
    let ownCards = page
      .locator(".source-board-view")
      .filter({ hasText: `TAVOLO ${executionId}` });
    await ownCards
      .first()
      .getByRole("button", { name: /Stacca vista/ })
      .click();
    await ownCards
      .first()
      .getByRole("button", { name: /Stacca vista/ })
      .click();
    await saveBoard(page);
    expect((await workspace(student)).layouts).toEqual(baseline.layouts);
    await page.reload();
    await expect(page.locator(".source-board-view")).toHaveCount(
      baseline.layouts.length,
    );
    expect((await workspace(student)).layoutSaved).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole("complementary", { name: "Biblioteca delle fonti" })
      .locator("li")
      .filter({ hasText: revised })
      .getByRole("button", { name: /Apri fonte/ })
      .click();
    await saveBoard(page);
    await expect(
      page
        .locator(".source-board-view .original-text")
        .filter({ hasText: revised }),
    ).toHaveCount(1);
    const navBounds = await page
      .getByRole("navigation", { name: "Navigazione principale" })
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        }),
      );
    expect(navBounds.every((rect) => rect.left >= 0 && rect.right <= 390)).toBe(
      true,
    );
    await page
      .locator(".sidebar")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await capture(page, "source-board-mobile-navigation-390.png");
    await page
      .locator(".source-board-heading")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await capture(page, "source-board-reading-390.png");
    await page.setViewportSize({ width: 820, height: 1100 });
    await page
      .locator(".source-board-heading")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await capture(page, "source-board-reading-820.png");
    assertions.push(
      "detach_preserves_sources_persisted_empty_if_initially_empty_reopen_and_mobile_navigation",
    );
    expect(errors).toEqual([]);
    expect(git("rev-parse", "HEAD")).toBe(baseHeadAtStart);
    completed = true;
  } finally {
    const report = {
      scenario: "SOURCE_BOARD_LOCAL_SUPABASE",
      status: completed ? "SCENARIO_ASSERTIONS_PASSED" : "SCENARIO_FAILED",
      globalG0: "NOT_EVALUATED",
      launchAccepted: false,
      phase,
      executionId,
      baseURL,
      baseHeadAtStart,
      baseHeadAtEnd: git("rev-parse", "HEAD"),
      codeState: gitStatusAtStart ? "WORKING_TREE" : "COMMITTED_CANDIDATE",
      workingTreeDirty: Boolean(gitStatusAtStart),
      gitStatusAtStart,
      assertions,
      screenshots,
      builtFrontendFiles,
      pageErrors: errors,
    };
    await writeFile(
      path.join(QA, `source-board-report-${executionId}.json`),
      JSON.stringify(report, null, 2),
    );
    await writeFile(
      path.join(QA, "source-board-latest-report.json"),
      JSON.stringify(report, null, 2),
    );
    await Promise.all([student.close(), tutor.close()]);
  }
});
