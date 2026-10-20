/** Explicit opt-in: real local Supabase runtime + the built candidate frontend.
 * ARDESIA_G0_WEB=1 ARDESIA_WEB_URL=http://127.0.0.1:5321 npm run e2e:web
 * Disable network traces: Auth JWTs and HttpOnly cookies must never be artifacts.
 */
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
const hash = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const sha = () =>
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: REPO,
    encoding: "utf8",
  }).trim();
type Access = {
  synthetic: boolean;
  authentication: string;
  tokens: Record<string, string>;
};
type HttpReport = {
  scenarioStatus: string;
  runId: string;
  runtime: { dataId: string };
  sha256: string;
  baseHeadAtStart: string;
  codeState: string;
};
type Checkpoint = { members: string[]; waitlist: string[]; actorIds: string[] };

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
    throw Error("supabase_auth_transport_failed");
  }
  expect(response.status()).toBe(200);
  const me = await response.json();
  expect(me.id).toBe(actor);
  expect(me.authentication).toBe("supabase");
  const session = (await context.cookies()).find(
    (cookie) => cookie.name === "study_session",
  );
  expect(Boolean(session?.httpOnly && session.sameSite === "Strict")).toBe(
    true,
  );
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
}
async function chooseReview(page: Page, text: string) {
  const candidates = page.locator(".submission-list button");
  await expect(candidates.first()).toBeVisible();
  for (let index = 0; index < (await candidates.count()); index++) {
    await candidates.nth(index).click();
    if ((await page.locator(".submission-answer").textContent()) === text)
      return;
  }
  throw Error("submitted_attempt_not_found_in_tutor_queue");
}

test.use({ trace: "off", video: "off", screenshot: "off" });
test.skip(
  process.env.ARDESIA_G0_WEB !== "1",
  "Requires explicit real Auth/Postgres/Storage candidate runtime.",
);

test("G0 candidate: real auth, preserved roster, media originals, manual diary transfer and portable reopen", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(180000);
  expect(
    Boolean(baseURL && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(baseURL)),
  ).toBe(true);
  await mkdir(QA, { recursive: true, mode: 0o700 });
  const access: Access = JSON.parse(await readFile(ACCESS, "utf8"));
  expect(
    access.synthetic && access.authentication === "real_local_supabase",
  ).toBe(true);
  const http: HttpReport = JSON.parse(
    await readFile(path.join(QA, "latest-report.json"), "utf8"),
  );
  expect(http.scenarioStatus).toBe("SCENARIO_ASSERTIONS_PASSED");
  const checkpoint: Checkpoint = JSON.parse(
    await readFile(
      path.join(QA, `checkpoint-${http.runtime.dataId}.json`),
      "utf8",
    ),
  );
  expect(checkpoint.members).toHaveLength(10);
  expect(checkpoint.waitlist).toHaveLength(2);
  const studentId = checkpoint.members[0];
  const student = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  const tutor = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1000 },
  });
  const waiter = await browser.newContext({
    baseURL,
    viewport: { width: 820, height: 1100 },
  });
  const errors: string[] = [],
    assertions: string[] = [],
    screenshots: { name: string; sha256: string }[] = [];
  const baseHeadAtStart = sha(),
    executionId = randomUUID();
  const gitStatus = execFileSync("git", ["status", "--porcelain"], {
    cwd: REPO,
    encoding: "utf8",
  }).trimEnd();
  const workingTreeDirty = Boolean(gitStatus);
  const builtFrontendFiles: { path: string; sha256: string }[] = [];
  let completed = false,
    phase = "runtime";
  async function capture(page: Page, name: string) {
    await noOverflow(page);
    const bytes = await page.screenshot({ path: path.join(QA, name) });
    screenshots.push({ name, sha256: hash(bytes) });
  }
  try {
    expect(http.baseHeadAtStart).toBe(baseHeadAtStart);
    if (process.env.STUDY_EXPECTED_SHA)
      expect(baseHeadAtStart).toBe(process.env.STUDY_EXPECTED_SHA);
    const index = await student.request.get("/");
    expect(index.status()).toBe(200);
    const indexBytes = await index.body();
    expect(hash(indexBytes)).toBe(
      hash(await readFile(path.join(REPO, "apps/web/dist/index.html"))),
    );
    builtFrontendFiles.push({ path: "index.html", sha256: hash(indexBytes) });
    const assetPaths = [
      ...indexBytes
        .toString("utf8")
        .matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g),
    ].map((match) => match[1]);
    expect(assetPaths.length > 0).toBe(true);
    for (const assetPath of assetPaths) {
      const served = await student.request.get(assetPath);
      expect(served.status()).toBe(200);
      const bytes = await served.body();
      expect(hash(bytes)).toBe(
        hash(
          await readFile(path.join(REPO, "apps/web/dist", assetPath.slice(1))),
        ),
      );
      builtFrontendFiles.push({ path: assetPath, sha256: hash(bytes) });
    }
    const healthResponse = await student.request.get("/study/health");
    expect(healthResponse.status()).toBe(200);
    const health = await healthResponse.json();
    expect(health.persistence).toBe("postgres");
    expect(health.authentication).toBe("supabase");
    expect(health.dataId).toBe(http.runtime.dataId);
    expect(health.apiSpendUsd).toBe(0);
    assertions.push(
      "built_candidate_uses_same_real_postgres_and_supabase_auth",
    );
    await authenticate(student, studentId, access);
    // Discover the assigned tutor from the authenticated edition, rather than its alias ordering.
    const workspace = await (
      await student.request.get("/study/workspace?editionId=fluidi")
    ).json();
    const tutorId = workspace.edition.teacherId;
    expect(checkpoint.actorIds.includes(tutorId)).toBe(true);
    await authenticate(tutor, tutorId, access);
    await authenticate(waiter, checkpoint.waitlist[0], access);
    const roster = await (
      await tutor.request.get("/study/editions/fluidi/access")
    ).json();
    expect([...roster.members].sort()).toEqual([...checkpoint.members].sort());
    expect([...roster.waitlist].sort()).toEqual(
      [...checkpoint.waitlist].sort(),
    );
    assertions.push("ten_members_two_waiters_survive_candidate_restart");

    const page = await student.newPage();
    const review = await tutor.newPage();
    const waiting = await waiter.newPage();
    for (const surface of [page, review, waiting])
      surface.on("pageerror", (error) => errors.push(error.name));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Riprendiamo il filo.", exact: true }),
    ).toBeVisible();
    await capture(page, "g0-student-today-390.png");
    phase = "waiting_list";
    await waiting.goto("/?view=courses");
    await expect(
      waiting.getByText(/Non risultano edizioni accessibili al tuo account/),
    ).toBeVisible();
    await expect(
      waiting.getByRole("button", {
        name: "Conferma partecipazione di test",
        exact: true,
      }),
    ).toHaveCount(0);
    const waitingCourses = await (
      await waiter.request.get("/study/editions?limit=50")
    ).json();
    expect(
      waitingCourses.items.some(
        (edition: { id: string }) => edition.id === "fluidi",
      ),
    ).toBe(false);
    await capture(waiting, "g0-waitlist-820.png");
    const stillFull = await (await student.request.get("/study/course")).json();
    expect(stillFull.confirmedTest).toBe(10);
    expect(stillFull.available).toBe(0);
    assertions.push(
      "waitlisted_user_has_read_only_fallback_without_membership_write",
    );

    phase = "student_originals";
    await page
      .getByRole("button", { name: "I miei corsi", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Apri l’aula", exact: true })
      .click();
    await page
      .getByLabel("La tua previsione")
      .fill("A pressione fissata la portata cresce con la quarta potenza.");
    await page
      .getByRole("button", { name: "Metti alla prova", exact: true })
      .click();
    await expect(page.getByTestId("physics-ratio")).toHaveText("Q/Q0 = 5,0625");
    const resultBounds = await page.getByTestId("physics-ratio").boundingBox();
    expect(
      Boolean(
        resultBounds &&
          resultBounds.y >= 0 &&
          resultBounds.y + resultBounds.height <= 844,
      ),
    ).toBe(true);
    const original = `G0 WEB ${executionId}: a pressione fissata Q cresce come r^2.`;
    await page
      .getByLabel("Una nota, una domanda, un procedimento")
      .fill(original);
    const createdSource = page.waitForResponse(
      (response) =>
        response.url().endsWith("/study/resources") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Salva nota privata", exact: true })
      .click();
    const source = await (await createdSource).json();
    await expect(
      page.getByText("Nota salvata nel tuo spazio privato.", { exact: true }),
    ).toBeVisible();
    const beforeDelivery = await tutor.request.get(
      `/study/resources/${source.id}/revisions/${source.revisionId}`,
    );
    expect([403, 404].includes(beforeDelivery.status())).toBe(true);
    const fixtures = ["source.png", "source.pdf", "tone.mp3"].map((name) =>
      path.join(QA, "fixtures", name),
    );
    await page.getByLabel("Aggiungi originale privato").setInputFiles(fixtures);
    await expect(page.getByText(/3 allegati privati/)).toBeVisible();
    await page.getByLabel("La tua spiegazione", { exact: true }).fill(original);
    const sent = page.waitForResponse(
      (response) =>
        response.url().endsWith("/study/submissions") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Consegna", exact: true }).click();
    const receipt = await (await sent).json();
    await expect(page.getByTestId("submission-status")).toContainText(
      receipt.receiptId,
    );
    expect(receipt.studentId).toBe(studentId);
    await page
      .getByRole("button", { name: "Il mio lavoro", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Consegne e feedback", exact: true })
      .click();
    const delivery = page
      .locator(".delivery-row")
      .filter({ hasText: original });
    await delivery
      .getByText("Originali, versione e ricevuta", { exact: true })
      .click();
    const image = delivery.getByRole("img", {
      name: "Originale privato 1 della consegna",
      exact: true,
    });
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(
      delivery.getByTitle("PDF originale 2", { exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        delivery
          .locator("audio")
          .evaluate(
            (node: HTMLAudioElement) =>
              node.readyState >= 1 && node.duration > 0,
          ),
      )
      .toBe(true);
    assertions.push(
      "ui_upload_submit_receipt_and_real_image_pdf_audio_previews",
    );
    await capture(page, "g0-originals-390.png");

    phase = "tutor_review";
    await review.goto("/?view=courses");
    await review
      .getByText("Persone e accessi dell’edizione", { exact: true })
      .click();
    await expect(
      review
        .getByRole("table", { name: "Iscritti confermati" })
        .locator("tbody tr"),
    ).toHaveCount(10);
    await expect(
      review.getByRole("table", { name: "Lista d’attesa" }).locator("tbody tr"),
    ).toHaveCount(2);
    await expect(
      review.getByRole("button", { name: "Crea invito monouso", exact: true }),
    ).toHaveCount(0);
    await capture(review, "g0-tutor-roster-1440.png");
    assertions.push(
      "real_roster_and_waitlist_ui_hide_unavailable_invitation_codes",
    );
    await review.goto("/?view=review");
    await chooseReview(review, original);
    await expect(review.getByLabel("Originale della fonte")).toHaveValue(
      original,
    );
    await review
      .getByRole("button", { name: "Inizia la correzione", exact: true })
      .click();
    await review
      .getByLabel("Spiegazione del tutor", { exact: true })
      .fill(
        "A pressione fissata la portata dipende dalla quarta potenza del raggio.",
      );
    await review
      .getByRole("button", { name: "Restituisci la correzione", exact: true })
      .click();
    await expect(
      review.getByText("Correzione restituita allo studente.", { exact: true }),
    ).toBeVisible();
    await capture(review, "g0-tutor-review-1440.png");
    const preciseSource = review.getByLabel("Originale della fonte");
    await preciseSource.focus();
    await preciseSource.press("ControlOrMeta+A");
    await review
      .getByText("Collega un passaggio al diario", { exact: true })
      .click();
    await review
      .getByRole("button", { name: "Proponi il passaggio", exact: true })
      .click();
    await review
      .getByRole("button", {
        name: "Apri il diario per il prossimo passo",
        exact: true,
      })
      .click();
    const entry = review.locator(".diary-entry").filter({ hasText: original });
    await entry
      .getByText("Verifica e prepara il prossimo passo", { exact: true })
      .click();
    await entry
      .getByLabel("Spiegazione del tutor", { exact: true })
      .fill(
        "La pressione resta fissata e il rapporto dei raggi compare alla quarta potenza.",
      );
    await entry
      .getByLabel("Criterio della rubrica")
      .fill(
        "Esplicita la pressione fissata e la quarta potenza nel procedimento.",
      );
    await entry
      .getByLabel("Prossimo passo")
      .fill("Prova una situazione con rapporto dei raggi pari a due.");
    await entry
      .getByLabel("Nuovo problema", { exact: true })
      .fill(
        "A pressione fissata raddoppia il raggio: spiega il rapporto della portata.",
      );
    await entry
      .getByRole("button", {
        name: "Conferma osservazione e assegna la nuova prova",
        exact: true,
      })
      .click();
    await expect(
      entry.getByText("Da riprovare", { exact: true }),
    ).toBeVisible();
    assertions.push(
      "manual_review_is_bound_to_submitted_source_and_assigns_new_problem",
    );

    phase = "new_proof";
    await page.goto("/?view=work");
    const own = page.locator(".diary-entry").filter({ hasText: original });
    await own
      .getByText("Affronta una situazione nuova", { exact: true })
      .click();
    const procedure =
      "Il rapporto dei raggi è due: a pressione fissata la portata dipende dalla quarta potenza, quindi 2^4 = 16.";
    await own.getByLabel("Spiega il tuo procedimento").fill(procedure);
    await own
      .getByRole("button", { name: "Consegna la nuova prova", exact: true })
      .click();
    await expect(
      own.getByText("Nuova prova consegnata. La verifica spetta al tutor.", {
        exact: true,
      }),
    ).toBeVisible();
    await review.reload();
    const practising = review
      .locator(".diary-entry")
      .filter({ hasText: original });
    await practising
      .getByText("Rivedi la nuova prova", { exact: true })
      .click();
    await practising
      .getByLabel("Passaggio del procedimento verificato")
      .fill("la portata dipende dalla quarta potenza, quindi 2^4 = 16");
    await practising
      .getByLabel("Motivazione della verifica")
      .fill(
        "Il procedimento conserva il vincolo e confronta esplicitamente la nuova quarta potenza.",
      );
    await practising
      .getByLabel("Che cosa rende diversa questa prova")
      .fill("Il rapporto dei raggi passa da 1.5 a 2.");
    await practising
      .getByRole("button", {
        name: "Registra la verifica del tutor",
        exact: true,
      })
      .click();
    await review
      .getByRole("button", { name: "Verificati", exact: true })
      .click();
    await expect(
      review
        .locator(".diary-entry")
        .filter({ hasText: original })
        .getByText("Verificato su una nuova prova", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Verificati", exact: true }).click();
    await expect(
      page
        .locator(".diary-entry")
        .filter({ hasText: original })
        .getByText("Verificato su una nuova prova", { exact: true }),
    ).toBeVisible();
    assertions.push(
      "distinct_procedure_requires_tutor_verification_and_survives_reopen",
    );
    await capture(page, "g0-verified-diary-390.png");

    phase = "portable_export";
    await page.getByRole("button", { name: "Quaderno", exact: true }).click();
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Esporta quaderno", exact: true })
      .click();
    const download = await downloadEvent;
    const notebookFile = path.join(QA, "g0-web-notebook.study.json");
    await download.saveAs(notebookFile);
    const notebookBytes = await readFile(notebookFile);
    const notebook = JSON.parse(notebookBytes.toString("utf8"));
    expect(
      notebook.submissions.some(
        (submission: { id: string }) => submission.id === receipt.submissionId,
      ),
    ).toBe(true);
    await page
      .getByLabel("Riapri quaderno .study.json")
      .setInputFiles(notebookFile);
    await expect(
      page.getByRole("heading", { name: "Quaderno riaperto", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/Quaderno riaperto in lettura:/)).toBeVisible();
    await expect(
      page.getByText(/Autenticità canonica non verificata/),
    ).toBeVisible();
    assertions.push(
      "downloaded_notebook_reopens_with_unsigned_internal_integrity_scope",
    );
    expect(errors).toEqual([]);
    completed = true;
  } finally {
    const result = {
      schemaVersion: 1,
      executionId,
      baseHeadAtStart,
      baseHeadAtEnd: sha(),
      codeState: workingTreeDirty
        ? "WORKING_TREE_UNCOMMITTED"
        : "COMMITTED_CANDIDATE",
      workingTreeDirty,
      provenance: {
        gitStatus: gitStatus ? gitStatus.split("\n") : [],
        builtFrontendFiles,
        httpCodeState: http.codeState,
      },
      httpEvidenceSha256: http.sha256,
      testFileSha256: hash(await readFile(fileURLToPath(import.meta.url))),
      scenarioStatus: completed ? "WEB_SCENARIO_PASSED" : "WEB_SCENARIO_FAILED",
      ...(completed ? {} : { failedPhase: phase }),
      assertions,
      screenshots,
      pageErrorNames: errors,
      globalG0Verdict: "NOT_EVALUATED",
      humanPilot: "NOT_RUN",
      launchAllowed: false,
    };
    const redacted = JSON.stringify(result, null, 2);
    expect(
      Object.values(access.tokens).some((token) => redacted.includes(token)),
    ).toBe(false);
    await writeFile(path.join(QA, "web-latest-report.json"), redacted + "\n", {
      mode: 0o600,
    });
    await student.close();
    await tutor.close();
    await waiter.close();
  }
});
