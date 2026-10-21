import { test, expect, request, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

type FixtureQuestion = {
  id: string;
  type: "mcq" | "completion";
  answer: string;
};
type Actors = {
  synthetic: true;
  studentToken: string;
  tutorToken: string;
  bankId: string;
  questions: FixtureQuestion[];
};
type Attempt = {
  id: string;
  status: string;
  answerRevision: number;
  answers: Record<string, string | number | null>;
  questions: { id: string; type: "mcq" | "completion"; prompt: string }[];
  result: {
    scoreTenths: number;
    correct: number;
    wrong: number;
    omitted: number;
    validity?: { valid: boolean };
    questions: { questionId: string; explanation: string }[];
  } | null;
};

test.use({ trace: "on", screenshot: "only-on-failure" });
test.setTimeout(150_000);

async function actors(): Promise<Actors> {
  const path =
    process.env.ARDESIA_C1_ACTORS ??
    new URL("../../../.study-demo-c1/c1-actors.json", import.meta.url);
  return JSON.parse(await readFile(path, "utf8")) as Actors;
}

async function login(page: Page, token: string) {
  await page.goto("/?view=exam");
  await page.getByRole("button", { name: "Accedi al tuo spazio" }).click();
  await page.getByLabel("Codice di accesso sintetico").fill(token);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Navigazione principale" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Prova di fisica" }).click();
  await expect(
    page.getByRole("heading", { name: "La prova di fisica." }),
  ).toBeVisible();
}

async function fetchAttempt(page: Page): Promise<Attempt> {
  const response = await page.request.get("/study/exams?editionId=fluidi");
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as { attempts: { id: string }[] };
  expect(body.attempts).toHaveLength(1);
  const detail = await page.request.get(`/study/exams/${body.attempts[0].id}`);
  expect(detail.ok()).toBe(true);
  return (await detail.json()) as Attempt;
}

function noOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
}

test("C1: real Study API browser journey, CAS conflict, independent grading and permanent revocation invalidity", async ({
  page,
  context,
}, testInfo) => {
  const fixture = await actors();
  expect(fixture.synthetic).toBe(true);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await login(page, fixture.studentToken);
  await expect(
    page.getByText("31 quesiti approvati · 21 scelte + 10 completamenti"),
  ).toBeVisible();
  const start = page.getByRole("button", { name: "Inizia la prova" });
  await expect(start).toBeEnabled();
  await start.click();
  await expect(
    page
      .getByRole("navigation", { name: "Vai a una domanda" })
      .getByRole("button"),
  ).toHaveCount(31);
  await expect(
    page.getByRole("heading", { name: "Fisica — Prova di semestre" }),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await noOverflow(page)).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("exam-runner-390.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 820, height: 1180 });
  expect(await noOverflow(page)).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("exam-runner-820.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(await noOverflow(page)).toBe(true);

  const started = await fetchAttempt(page);
  const firstMcq = started.questions.findIndex(
    (question) => question.type === "mcq",
  );
  expect(firstMcq).toBeGreaterThanOrEqual(0);
  const conflictIndex = started.questions.findIndex(
    (question) =>
      question.type === "mcq" && question.id !== fixture.questions[1].id,
  );
  expect(conflictIndex).toBeGreaterThanOrEqual(0);
  await page.locator(".exam-palette button").nth(firstMcq).click();
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(5);
  const letters = await page.locator(".exam-option-letter").allTextContents();
  expect(letters).toEqual(["A", "B", "C", "D", "E"]);
  await radios.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toBeChecked();
  await page.locator(".exam-palette button").first().click();

  let sawCompletion = false;
  for (let index = 0; index < 31; index += 1) {
    await expect(page.getByText(`Domanda ${index + 1} di 31`)).toBeVisible();
    const prompt = await page.locator("#exam-question-title").innerText();
    const number = Number(prompt.match(/Quesito sintetico C1 (\d+)/)?.[1]);
    expect(number).toBeGreaterThan(0);
    if (number === 31) {
      if (index < 30)
        await page.getByRole("button", { name: "Successiva" }).click();
      continue;
    }
    if (await page.locator(".exam-options").count()) {
      const target =
        number === 2
          ? page.getByRole("radio").first()
          : page.getByRole("radio", { name: /Opzione B/ });
      await target.check();
    } else {
      sawCompletion = true;
      await page.locator(".exam-completion input").fill(String(number));
    }
    if (index < 30) {
      await page.getByRole("button", { name: "Successiva" }).click();
    }
  }
  expect(sawCompletion).toBe(true);
  await expect(page.getByText("30 risposte date")).toBeVisible();
  await expect(page.getByText("Risposte salvate")).toBeVisible();

  const saved = await fetchAttempt(page);
  expect(Object.keys(saved.answers)).toHaveLength(30);
  expect(saved.answers[fixture.questions[1].id]).toBe("A");
  expect(saved.answers[fixture.questions[30].id]).toBeUndefined();
  const savedRevision = saved.answerRevision;

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Riprendi la prova" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Riprendi la prova" }).click();
  await expect(page.getByText("Domanda 1 di 31")).toBeVisible();
  const wrongIndex = saved.questions.findIndex(
    (question) => question.id === fixture.questions[1].id,
  );
  expect(saved.questions[wrongIndex].type).toBe("mcq");
  await page.locator(".exam-palette button").nth(wrongIndex).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  const recovered = await fetchAttempt(page);
  expect(recovered.answerRevision).toBe(savedRevision);
  expect(recovered.answers).toEqual(saved.answers);

  const second = await context.newPage();
  await second.goto(page.url());
  await second.getByRole("button", { name: "Riprendi la prova" }).click();
  await second.locator(".exam-palette button").nth(conflictIndex).click();
  await second.getByRole("radio").nth(2).check();
  await expect(second.getByText("Risposte salvate")).toBeVisible();
  await expect
    .poll(async () => (await fetchAttempt(page)).answerRevision)
    .toBeGreaterThan(savedRevision);

  const conflictId = started.questions[conflictIndex].id;
  const conflictAnswer = fixture.questions.find(
    (question) => question.id === conflictId,
  )!.answer;
  const trigger = saved.answers[conflictId] === "A" ? "B" : "A";
  await page.locator(".exam-palette button").nth(conflictIndex).click();
  await page
    .getByRole("radio")
    .nth(trigger.charCodeAt(0) - "A".charCodeAt(0))
    .check();
  await expect(
    page.getByText(
      "Le risposte sono state salvate in un’altra scheda. Ho ricaricato l’ultima versione: controlla e riprova.",
    ),
  ).toBeVisible();
  await second.close();

  await expect(page.getByRole("radio").nth(2)).toBeChecked();
  await page
    .getByRole("radio")
    .nth(conflictAnswer.charCodeAt(0) - "A".charCodeAt(0))
    .check();
  await expect(page.getByText("Risposte salvate")).toBeVisible();

  await page.getByRole("button", { name: "Domanda 31" }).click();
  await page.getByRole("button", { name: "Consegna la prova" }).click();
  await page.getByRole("button", { name: "Consegna definitivamente" }).click();
  await expect(
    page.getByRole("heading", { name: "La prova è consegnata." }),
  ).toBeVisible();
  await expect(page.locator(".exam-score strong")).toHaveText("28,9");
  await expect(page.locator(".exam-score dd").nth(0)).toHaveText("29");
  await expect(page.locator(".exam-score dd").nth(1)).toHaveText("1");
  await expect(page.locator(".exam-score dd").nth(2)).toHaveText("1");

  const concluded = await fetchAttempt(page);
  expect(concluded.status).toBe("submitted");
  expect(concluded.result?.scoreTenths).toBe(29 * 10 - 1);
  expect(concluded.result?.correct).toBe(29);
  expect(concluded.result?.wrong).toBe(1);
  expect(concluded.result?.omitted).toBe(1);
  expect(concluded.result?.validity?.valid).toBe(true);

  const articles = page.locator(".exam-review-item");
  await expect(articles).toHaveCount(31);
  for (const [index, question] of concluded.result!.questions.entries()) {
    const text = await articles.nth(index).textContent();
    expect(text).toContain(question.explanation.trim());
  }
  await page.screenshot({
    path: testInfo.outputPath("exam-result-1440.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 720, height: 450 });
  expect(await noOverflow(page)).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("exam-result-zoom-200.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.getByRole("button", { name: "Torna alle prove" }).click();
  await expect(
    page.getByRole("heading", { name: "Le tue prove" }),
  ).toBeVisible();
  await page.locator(".exam-history button").first().click();
  await expect(
    page.getByRole("heading", { name: "La prova è consegnata." }),
  ).toBeVisible();

  const tutor = await request.newContext({
    baseURL: new URL(page.url()).origin,
  });
  try {
    const auth = await tutor.post("/study/session", {
      data: { token: fixture.tutorToken },
    });
    expect(auth.ok()).toBe(true);
    const review = await tutor.get(
      `/study/editions/fluidi/question-banks/${fixture.bankId}/review/questions/${fixture.questions[0].id}`,
    );
    expect(review.ok()).toBe(true);
    const state = (await review.json()) as {
      questionVersion: number;
      contentSha256: string;
      state: { approval: { approvalId: string } };
    };
    expect(state.state.approval.approvalId).toBeTruthy();
    const revoked = await tutor.post(
      `/study/editions/fluidi/question-banks/${fixture.bankId}/review/approvals/${state.state.approval.approvalId}/revoke`,
      { data: { reason: "C1 browser revocation proof" } },
    );
    expect(revoked.ok()).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "In attesa delle approvazioni" }),
    ).toBeDisabled();
    await expect(
      page.getByText("Servono 31 quesiti approvati per aprire la prova."),
    ).toBeVisible();
    await page.locator(".exam-history button").first().click();
    await expect(page.getByRole("alert")).toContainText("Prova non valida.");
    await page.screenshot({
      path: testInfo.outputPath("exam-invalid-1440.png"),
      fullPage: true,
    });

    const reapproved = await tutor.post(
      `/study/editions/fluidi/question-banks/${fixture.bankId}/review/approvals`,
      {
        data: {
          questionId: fixture.questions[0].id,
          questionVersion: state.questionVersion,
          contentSha256: state.contentSha256,
          decision: "APPROVED",
          motivation: "C1 browser reapproval proof",
          confirmPublication: true, // Explicit editorial action, separate from scientific review.
        },
      },
    );
    expect(reapproved.ok()).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Inizia la prova" }),
    ).toBeEnabled();
    await page.locator(".exam-history button").first().click();
    await expect(page.getByRole("alert")).toContainText("Prova non valida.");
  } finally {
    await tutor.dispose();
  }

  expect(pageErrors).toEqual([]);
});
