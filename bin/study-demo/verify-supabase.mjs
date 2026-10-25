#!/usr/bin/env node
/**
 * Real loopback Auth/Postgres/Storage scenario, through Study HTTP contracts only.
 * No reset/SQL/admin seeding, no external mail, no AI calls, no global G0 verdict.
 * Re-running resumes the private checkpoint and reuses the same command keys.
 *
 * node bin/study-demo/verify-supabase.mjs [--base-url http://127.0.0.1:5322]
 *   [--access-file PRIVATE_JSON] [--output-dir PRIVATE_DIR] [--fixtures-dir DIR]
 *   [--run-id NONCE]   // a new nonce requires an empty edition; never resets it
 */
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const EDITION = "fluidi";
export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
export function canonical(value) {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value !== null && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ":" + canonical(value[key]))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
class ScenarioFailure extends Error {
  constructor(code, details = {}) {
    super(code);
    this.code = code;
    this.details = details;
  }
}
async function jsonFile(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
async function optionalJson(file) {
  try {
    return await jsonFile(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
async function privateJson(file, value) {
  const temporary = file + ".tmp";
  await writeFile(temporary, JSON.stringify(value, null, 2) + "\n", {
    mode: 0o600,
  });
  await rename(temporary, file);
}
function gitSha() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: REPO,
    encoding: "utf8",
  }).trim();
}
function dirty() {
  return (
    execFileSync("git", ["status", "--porcelain"], {
      cwd: REPO,
      encoding: "utf8",
    }).trim() !== ""
  );
}
async function sourceProvenance() {
  const status = execFileSync("git", ["status", "--porcelain"], {
    cwd: REPO,
    encoding: "utf8",
  }).trimEnd();
  const files = [
    ...new Set(
      execFileSync(
        "git",
        [
          "ls-files",
          "-z",
          "--cached",
          "--others",
          "--exclude-standard",
          "--",
          "packages/engine/lessonos",
          "services/study-api/study_api",
          "bin/study-demo/verify-supabase.mjs",
        ],
        { cwd: REPO, encoding: "utf8" },
      )
        .split("\0")
        .filter((file) => /\.(py|sql|mjs)$/.test(file)),
    ),
  ].sort();
  const sourceFiles = await Promise.all(
    files.map(async (file) => {
      try {
        return {
          path: file,
          sha256: sha256(await readFile(path.join(REPO, file))),
        };
      } catch (error) {
        if (error.code === "ENOENT") return { path: file, sha256: null };
        throw error;
      }
    }),
  );
  return {
    baseHead: gitSha(),
    workingTreeDirty: Boolean(status),
    codeState: status ? "WORKING_TREE_UNCOMMITTED" : "COMMITTED_CANDIDATE",
    gitStatus: status ? status.split("\n") : [],
    sourceFiles,
    sourceDigest: sha256(canonical(sourceFiles)),
    claim:
      "Working-tree source hashes; service process identified separately by health. No server-signed code attestation.",
  };
}
function options() {
  const { values } = parseArgs({
    options: {
      "base-url": { type: "string" },
      "access-file": { type: "string" },
      "output-dir": { type: "string" },
      "fixtures-dir": { type: "string" },
      "run-id": { type: "string" },
    },
  });
  const outputDir = path.resolve(
    values["output-dir"] ??
      process.env.ARDESIA_SUPABASE_QA_DIR ??
      path.join(REPO, "../qa-supabase"),
  );
  const base = new URL(
    values["base-url"] ??
      process.env.ARDESIA_SUPABASE_API_URL ??
      "http://127.0.0.1:5322",
  );
  if (
    base.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(base.hostname) ||
    base.username ||
    base.password ||
    base.pathname !== "/"
  )
    throw new ScenarioFailure("isolated_loopback_runtime_required");
  return {
    base: base.origin,
    outputDir,
    accessFile: path.resolve(
      values["access-file"] ??
        process.env.ARDESIA_SUPABASE_ACCESS ??
        path.join(REPO, "../g0-supabase-data/supabase-access.json"),
    ),
    fixturesDir: path.resolve(
      values["fixtures-dir"] ?? path.join(outputDir, "fixtures"),
    ),
    requestedRunId: values["run-id"] ?? process.env.ARDESIA_SUPABASE_RUN_ID,
  };
}

class HttpScenario {
  constructor(config, tokens) {
    this.config = config;
    this.tokens = tokens;
    this.clients = new Map();
    this.report = {
      schemaVersion: 1,
      scenario: "real-supabase-study-http",
      executionId: randomUUID(),
      startedAt: new Date().toISOString(),
      baseHeadAtStart: gitSha(),
      workingTreeDirty: dirty(),
      runnerSha256: null,
      runtime: null,
      assertions: [],
      failures: [],
      requests: [],
      artifacts: [],
      globalG0Verdict: "NOT_EVALUATED",
      humanPilot: "NOT_RUN",
      launchAllowed: false,
      apiSpendUsd: 0,
    };
  }
  check(name, condition, details = {}) {
    this.report.assertions.push({
      name,
      outcome: condition ? "PASS" : "FAIL",
      ...details,
    });
    if (!condition) throw new ScenarioFailure(name, details);
  }
  async phase(name, action) {
    try {
      await action();
      return true;
    } catch (error) {
      this.report.failures.push({
        phase: name,
        code:
          error instanceof ScenarioFailure
            ? error.code
            : "unexpected_runner_error",
        ...(error instanceof ScenarioFailure
          ? error.details
          : { errorType: error?.constructor?.name ?? "Unknown" }),
      });
      return false;
    }
  }
  safeArtifact(value) {
    const bytes = typeof value === "string" ? value : JSON.stringify(value);
    if (
      Object.values(this.tokens).some(
        (token) =>
          typeof token === "string" &&
          token.length > 20 &&
          bytes.includes(token),
      )
    )
      throw new ScenarioFailure("credential_in_artifact_blocked");
    return bytes;
  }
  async save() {
    this.safeArtifact(this.state);
    await privateJson(this.checkpoint, this.state);
  }
  key(command) {
    return `${this.state.runId}:${command}`;
  }
  async request(
    actor,
    endpoint,
    { method = "GET", body, binary, mime, key } = {},
  ) {
    const requestBytes =
      binary ?? (body === undefined ? undefined : JSON.stringify(body));
    const headers = {
      ...(actor && this.clients.get(actor)
        ? { Cookie: this.clients.get(actor) }
        : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(mime ? { "Content-Type": mime } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    };
    const startedMs = performance.now();
    let response;
    try {
      response = await fetch(this.config.base + "/study" + endpoint, {
        method,
        headers,
        body: requestBytes,
        signal: AbortSignal.timeout(30000),
        redirect: "error",
      });
    } catch {
      throw new ScenarioFailure("http_transport_failed", {
        actor: actor ?? "public",
        endpoint: endpoint.split("?")[0],
        method,
      });
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    let value;
    try {
      value = JSON.parse(bytes.toString("utf8"));
    } catch {
      value = null;
    }
    const record = {
      actor: actor ?? "public",
      method,
      endpoint: endpoint.split("?")[0],
      status: response.status,
      startedMs,
      finishedMs: performance.now(),
      requestSha256: requestBytes === undefined ? null : sha256(requestBytes),
      responseSha256: sha256(bytes),
      ...(value?.error && typeof value.error === "string"
        ? { errorCode: value.error }
        : {}),
    };
    // Session request hashes are sufficient evidence; never store its JWT or cookie.
    this.report.requests.push(record);
    return {
      status: response.status,
      value,
      bytes,
      record,
      retryAfterSeconds: Number(response.headers.get("retry-after") ?? 0),
      cookie:
        endpoint === "/session"
          ? response.headers.get("set-cookie")?.split(";")[0]
          : undefined,
    };
  }
  expectResponse(name, response, statuses = [200]) {
    this.check(name, statuses.includes(response.status), {
      status: response.status,
      expectedStatuses: statuses,
      ...(response.value?.error ? { errorCode: response.value.error } : {}),
    });
    return response.value;
  }
  async get(actor, endpoint, label) {
    const response = await this.request(actor, endpoint);
    return this.expectResponse(label, response);
  }
  async post(actor, endpoint, body, command, label = command) {
    const response = await this.request(actor, endpoint, {
      method: "POST",
      body,
      key: this.key(command),
    });
    return this.expectResponse(label, response);
  }
  async workspace(actor) {
    return this.get(
      actor,
      `/workspace?editionId=${EDITION}`,
      `workspace_${actor}`,
    );
  }
  async denied(actor, endpoint, secretText, options = {}) {
    const response = await this.request(actor, endpoint, options);
    this.expectResponse(
      `privacy_denied_${actor}_${endpoint.split("/")[1]}`,
      response,
      [403, 404],
    );
    this.check(
      `privacy_body_redacted_${actor}_${endpoint.split("/")[1]}`,
      !response.bytes.toString("utf8").includes(secretText),
    );
  }
  async authenticate() {
    const publicCourse = await this.get(
      null,
      "/course",
      "public_course_accessible",
    );
    this.check(
      "edition_has_four_sessions_and_capacity_ten",
      publicCourse.sessions?.length === 4 && publicCourse.capacity === 10,
    );
    const students = Object.keys(this.tokens)
      .filter((id) => /^student-\d+$/.test(id))
      .sort();
    const tutors = Object.keys(this.tokens).filter((id) =>
      id.startsWith("tutor-"),
    );
    this.check(
      "fourteen_real_auth_accounts_available",
      students.length === 12 && tutors.length === 2,
    );
    for (const actor of [...tutors, ...students]) {
      let response = await this.request(null, "/session", {
        method: "POST",
        body: { token: this.tokens[actor] },
      });
      for (let retry = 0; response.status === 429 && retry < 2; retry++) {
        const seconds = response.retryAfterSeconds;
        if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 60) break;
        this.report.authRateLimitBackoffs ??= [];
        this.report.authRateLimitBackoffs.push({ actor, seconds });
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        response = await this.request(null, "/session", {
          method: "POST",
          body: { token: this.tokens[actor] },
        });
      }
      const me = this.expectResponse(`supabase_session_${actor}`, response);
      this.check(
        `verified_identity_${actor}`,
        me.id === actor &&
          me.role === (students.includes(actor) ? "student" : "teacher") &&
          me.authentication === "supabase" &&
          Boolean(response.cookie),
      );
      this.clients.set(actor, response.cookie);
      const current = await this.get(actor, "/me", `authenticated_me_${actor}`);
      this.check(
        `cookie_identity_${actor}`,
        current.id === actor && current.role === me.role,
      );
    }
    const tutorWorkspace = await this.workspace(tutors[0]);
    const teacherId = tutorWorkspace.edition.teacherId;
    this.check(
      "edition_teacher_is_verified_account",
      tutors.includes(teacherId),
    );
    this.tutor = teacherId;
    this.otherTutor = tutors.find((id) => id !== teacherId);
    this.students = students;
    if (!this.state) {
      this.check(
        "new_nonce_starts_with_empty_edition",
        publicCourse.confirmedTest === 0,
      );
      const runId = this.config.requestedRunId ?? "supabase-" + randomUUID();
      this.check(
        "nonce_has_safe_bounded_format",
        /^[a-zA-Z0-9_-]{1,80}$/.test(runId),
      );
      this.state = {
        schemaVersion: 1,
        runId,
        dataId: this.report.runtime.dataId,
        baseHeadAtCreation: this.report.baseHeadAtStart,
        actorIds: [...tutors, ...students].sort(),
        originals: {},
        media: {},
        feedback: {},
        artifacts: {},
      };
      await this.save();
    }
    this.check(
      "checkpoint_matches_authenticated_fixture",
      this.state.dataId === this.report.runtime.dataId &&
        canonical(this.state.actorIds) ===
          canonical([...tutors, ...students].sort()),
    );
    this.report.runId = this.state.runId;
  }
  async enroll() {
    for (const actor of this.students.slice(0, 9)) {
      const hold = await this.post(
        actor,
        `/editions/${EDITION}/holds`,
        {},
        `hold-${actor}`,
      );
      this.check(
        `sequential_hold_${actor}`,
        ["hold", "confirmed"].includes(hold.state),
      );
      if (hold.id) {
        const confirmed = await this.post(
          actor,
          `/holds/${hold.id}/confirm`,
          {},
          `confirm-${actor}`,
        );
        this.check(
          `sequential_confirm_${actor}`,
          confirmed.state === "confirmed" && confirmed.paymentMode === "test",
        );
      }
    }
    if (!this.state.race) {
      const before = await this.get(
        null,
        "/course",
        "course_before_last_seat_race",
      );
      this.check(
        "nine_confirmed_before_last_seat_race",
        before.confirmedTest === 9 && before.available === 1,
      );
      const competitors = this.students.slice(9, 11);
      const responses = await Promise.all(
        competitors.map((actor) =>
          this.request(actor, `/editions/${EDITION}/holds`, {
            method: "POST",
            body: {},
            key: this.key(`hold-${actor}`),
          }),
        ),
      );
      this.state.race = {
        executionId: this.report.executionId,
        initialConfirmed: before.confirmedTest,
        results: responses.map((response, i) => ({
          actor: competitors[i],
          status: response.status,
          value: response.value,
          record: response.record,
        })),
      };
      await this.save();
    }
    const race = this.state.race.results;
    this.report.capacityRace = {
      originalExecutionId: this.state.race.executionId,
      mode:
        this.state.race.executionId === this.report.executionId
          ? "FRESH_LAST_SEAT_RACE"
          : "PERSISTED_EVIDENCE_RECHECK",
      responses: race.map(({ actor, status, record }) => ({
        actor,
        status,
        responseSha256: record.responseSha256,
      })),
    };
    this.check(
      "last_seat_requests_overlapped",
      Math.max(...race.map((item) => item.record.startedMs)) <
        Math.min(...race.map((item) => item.record.finishedMs)),
    );
    const winners = race.filter(
      (item) => item.status === 200 && item.value?.state === "hold",
    );
    const waiters = race.filter(
      (item) => item.status === 409 && item.value?.error === "group_full",
    );
    this.check(
      "one_last_seat_winner_one_waiter",
      winners.length === 1 && waiters.length === 1,
    );
    const winner = winners[0];
    const confirmed = await this.post(
      winner.actor,
      `/holds/${winner.value.id}/confirm`,
      {},
      `confirm-${winner.actor}`,
    );
    this.check(
      "last_seat_confirmed_through_http",
      confirmed.state === "confirmed" && confirmed.paymentMode === "test",
    );
    const twelfth = this.students[11];
    const full = await this.request(twelfth, `/editions/${EDITION}/holds`, {
      method: "POST",
      body: {},
      key: this.key(`hold-${twelfth}`),
    });
    this.expectResponse("twelfth_gets_group_full", full, [409]);
    this.check(
      "twelfth_capacity_error_is_explicit",
      full.value?.error === "group_full",
    );
    this.state.members = [...this.students.slice(0, 9), winner.actor];
    this.state.waitlist = [waiters[0].actor, twelfth].sort();
    await this.save();
    const roster = await this.get(
      this.tutor,
      `/editions/${EDITION}/access`,
      "tutor_reads_roster",
    );
    this.check(
      "exactly_ten_confirmed_members_persisted",
      canonical([...roster.members].sort()) ===
        canonical([...this.state.members].sort()),
    );
    const course = await this.get(
      null,
      "/course",
      "public_capacity_after_race",
    );
    this.check(
      "public_capacity_stops_at_ten",
      course.confirmedTest === 10 && course.available === 0,
    );
    for (const actor of this.students) {
      const workspace = await this.workspace(actor);
      this.check(
        `membership_scope_${actor}`,
        workspace.enrolled === this.state.members.includes(actor),
      );
    }
    this.check(
      "waitlist_read_contract_available",
      Array.isArray(roster.waitlist),
    );
    this.check(
      "exactly_two_waiters_persisted",
      canonical([...roster.waitlist].sort()) === canonical(this.state.waitlist),
    );
  }
  async media() {
    const actor = this.state.members[0];
    const fixtures = [
      {
        name: "image",
        file: "source.png",
        mime: "image/png",
        extraction: "manual_review",
      },
      {
        name: "pdf",
        file: "source.pdf",
        mime: "application/pdf",
        extraction: "native_text",
      },
      {
        name: "audio",
        file: "tone.mp3",
        mime: "audio/mpeg",
        extraction: "asr_not_run",
      },
    ];
    for (const fixture of fixtures) {
      let bytes;
      try {
        bytes = await readFile(
          path.join(this.config.fixturesDir, fixture.file),
        );
      } catch {
        throw new ScenarioFailure("synthetic_media_fixture_missing", {
          kind: fixture.name,
        });
      }
      if (!this.state.media[fixture.name]) {
        const response = await this.request(
          actor,
          `/assets?editionId=${EDITION}`,
          { method: "POST", binary: bytes, mime: fixture.mime, key: this.key(`upload-${fixture.name}`) },
        );
        this.state.media[fixture.name] = this.expectResponse(
          `storage_upload_${fixture.name}`,
          response,
        );
        await this.save();
      }
      const asset = this.state.media[fixture.name];
      this.check(
        `validated_original_${fixture.name}`,
        asset.sha256 === sha256(bytes) &&
          asset.bytes === bytes.length &&
          asset.mime === fixture.mime &&
          asset.private === true &&
          asset.extractionStatus === fixture.extraction,
      );
      const stored = await this.request(actor, "/assets/" + asset.id);
      this.expectResponse(`owner_reads_original_${fixture.name}`, stored);
      this.check(
        `storage_bytes_preserved_${fixture.name}`,
        sha256(stored.bytes) === sha256(bytes),
      );
      if (!this.state.originals[actor]?.receipt)
        await this.denied(
          this.tutor,
          "/assets/" + asset.id,
          bytes.toString("base64"),
        );
    }
    const malformed = await this.request(
      actor,
      `/assets?editionId=${EDITION}`,
      {
        method: "POST",
        binary: Buffer.from("This is not a PDF."),
        key: this.key("upload-malformed-pdf"),
        mime: "application/pdf",
      },
    );
    this.expectResponse("malformed_pdf_rejected", malformed, [415]);
    this.check(
      "malformed_media_error_is_explicit",
      malformed.value?.error === "malformed_media",
    );
  }
  async submitAll() {
    for (const actor of this.state.members) {
      const text = `G0 ${this.state.runId} ${actor}: a pressione fissata la portata cresce come r^2.`;
      let original = this.state.originals[actor];
      if (!original) {
        const workspace = await this.workspace(actor);
        const source =
          workspace.resources.find(
            (resource) => resource.ownerId === actor && resource.text === text,
          ) ??
          (await this.post(
            actor,
            "/resources",
            { editionId: EDITION, kind: "notes", text, visibility: "private" },
            `source-${actor}`,
          ));
        original = { text, source };
        this.state.originals[actor] = original;
        await this.save();
      }
      const revision = await this.get(
        actor,
        `/resources/${original.source.id}/revisions/${original.source.revisionId}`,
        `owner_exact_revision_${actor}`,
      );
      this.check(
        `source_content_and_hash_${actor}`,
        revision.text === text && revision.sha256 === sha256(text),
      );
      if (!original.receipt)
        await this.denied(
          this.tutor,
          `/resources/${original.source.id}/revisions/${original.source.revisionId}`,
          text,
        );
      const assets =
        actor === this.state.members[0]
          ? Object.values(this.state.media).map((asset) => asset.id)
          : [];
      const body = {
        editionId: EDITION,
        activityId: "poiseuille-v1",
        text,
        assetRefs: assets,
        sourceRefs: [
          {
            resourceId: original.source.id,
            revisionId: original.source.revisionId,
            contextId: original.source.contextId,
          },
        ],
      };
      const receipt = await this.post(
        actor,
        "/submissions",
        body,
        `submission-${actor}`,
      );
      this.check(
        `submission_receipt_${actor}`,
        receipt.studentId === actor &&
          receipt.state === "received" &&
          receipt.activityId === "poiseuille-v1" &&
          typeof receipt.receiptId === "string" &&
          typeof receipt.submissionId === "string",
      );
      original.receipt = receipt;
      await this.save();
      const replay = await this.post(
        actor,
        "/submissions",
        body,
        `submission-${actor}`,
      );
      this.check(
        `submission_retry_is_same_receipt_${actor}`,
        canonical(replay) === canonical(receipt),
      );
      const stored = await this.get(
        actor,
        "/receipts/" + receipt.receiptId,
        `persisted_receipt_${actor}`,
      );
      this.check(
        `receipt_reopened_${actor}`,
        canonical(stored) === canonical(receipt),
      );
      const visible = await this.get(
        this.tutor,
        `/resources/${original.source.id}/revisions/${original.source.revisionId}`,
        `tutor_exact_submitted_revision_${actor}`,
      );
      this.check(
        `tutor_receives_only_submitted_text_${actor}`,
        visible.text === text &&
          visible.revisionId === original.source.revisionId,
      );
    }
    const originals = Object.values(this.state.originals);
    this.check(
      "ten_distinct_submissions_and_receipts",
      originals.length === 10 &&
        new Set(originals.map((item) => item.receipt.submissionId)).size ===
          10 &&
        new Set(originals.map((item) => item.receipt.receiptId)).size === 10,
    );
    const workspace = await this.workspace(this.tutor);
    this.check(
      "tutor_sees_all_ten_submitted_attempts",
      originals.every((item) =>
        workspace.submissions.some(
          (submission) => submission.id === item.receipt.submissionId,
        ),
      ),
    );
    for (const [kind, asset] of Object.entries(this.state.media)) {
      const response = await this.request(this.tutor, "/assets/" + asset.id);
      this.expectResponse(`tutor_reads_submitted_original_${kind}`, response);
      this.check(
        `tutor_original_hash_${kind}`,
        sha256(response.bytes) === asset.sha256,
      );
    }
  }
  async manualFeedback() {
    for (const actor of this.state.members) {
      const original = this.state.originals[actor];
      const candidate = await this.post(
        this.tutor,
        "/feedback/drafts",
        { submissionId: original.receipt.submissionId },
        `feedback-draft-${actor}`,
      );
      this.check(
        `feedback_provider_is_declared_fake_${actor}`,
        candidate.authorType === "deterministic_fake",
      );
      const text =
        "Tutor sintetico: a pressione fissata la portata dipende dalla quarta potenza del raggio. Esplicita il vincolo prima del confronto.";
      const review = await this.post(
        this.tutor,
        `/feedback/${candidate.id}/publish`,
        {
          expectedRevision: original.receipt.revision,
          text,
          decision: "returned",
        },
        `feedback-publish-${actor}`,
      );
      this.check(
        `manual_tutor_review_${actor}`,
        review.humanReviewed === true &&
          review.syntheticTutor === true &&
          review.text === text &&
          review.decision === "returned",
      );
      this.state.feedback[actor] = {
        candidateId: candidate.id,
        reviewId: review.reviewId,
      };
      await this.save();
    }
  }
  async diary() {
    const actor = this.state.members[0],
      original = this.state.originals[actor];
    const anchor = {
      resourceId: original.source.id,
      revisionId: original.source.revisionId,
      start: 0,
      end: original.text.length,
      quote: original.text,
    };
    let thread = await this.post(
      this.tutor,
      "/diary/observations",
      {
        submissionId: original.receipt.submissionId,
        conceptId: "radius-power",
        category: "model_selection",
        anchor,
      },
      "diary-observe",
    );
    this.state.diaryFlow ??= {};
    const flow = this.state.diaryFlow;
    if (!flow.observed) {
      flow.observed = {
        threadId: thread.threadId,
        status: thread.status,
        verification: thread.verification,
      };
      await this.save();
    }
    this.check(
      "observation_starts_as_unverified_candidate",
      flow.observed.status === "CANDIDATE" &&
        flow.observed.verification === "UNVERIFIED" &&
        thread.threadId === flow.observed.threadId,
    );
    const threadId = thread.threadId,
      criterion =
        "Esplicita il vincolo di pressione e usa la quarta potenza del raggio.";
    const plan = {
      exerciseId: "g0-transfer-" + this.state.runId,
      prompt:
        "A pressione fissata raddoppia il raggio e spiega il rapporto della portata.",
      originalParameters: { radiusRatio: 1.5, boundary: "pressure" },
      parameters: { radiusRatio: 2, boundary: "pressure" },
    };
    thread = await this.post(
      this.tutor,
      `/diary/threads/${threadId}/confirm`,
      {
        rubric: { criterion, procedureRequired: true },
        explanation:
          "La dipendenza è alla quarta potenza, a pressione fissata.",
        nextStep: "Affronta una situazione con raggio doppio.",
        sourceChecked: false,
        transferExercise: plan,
      },
      "diary-confirm",
    );
    if (!flow.confirmed) {
      flow.confirmed = {
        status: thread.status,
        verification: thread.feedback.verification,
      };
      await this.save();
    }
    this.check(
      "tutor_confirmation_assigns_distinct_problem",
      flow.confirmed.status === "OPEN" &&
        flow.confirmed.verification === "REVIEWED_BY_TUTOR" &&
        canonical(thread.transferExercise.parameters) !==
          canonical(plan.originalParameters),
    );
    const answer =
      "Il rapporto dei raggi è due; a pressione fissata la portata dipende dalla quarta potenza: 2^4 = 16.";
    const transferBody = {
      editionId: EDITION,
      activityId: plan.exerciseId,
      diaryThreadId: threadId,
      activityParameters: plan.parameters,
      text: answer,
      assetRefs: [],
    };
    const transfer = await this.post(
      actor,
      "/submissions",
      transferBody,
      "diary-transfer-submission",
    );
    this.check(
      "new_proof_bound_to_assigned_activity_context",
      transfer.submissionId !== original.receipt.submissionId &&
        transfer.activityId === plan.exerciseId &&
        transfer.activityContext.threadId === threadId &&
        canonical(transfer.activityContext.parameters) ===
          canonical(plan.parameters),
    );
    thread = await this.post(
      actor,
      `/diary/threads/${threadId}/practice`,
      {
        submissionId: transfer.submissionId,
        exerciseId: plan.exerciseId,
        parameters: plan.parameters,
      },
      "diary-practice",
    );
    const attempt = thread.attempts.find(
      (item) => item.submissionId === transfer.submissionId,
    );
    if (!flow.practising) {
      flow.practising = {
        status: thread.status,
        attemptId: attempt?.attemptId,
        hasVerification: Boolean(thread.latestVerification),
      };
      await this.save();
    }
    this.check(
      "new_proof_is_practising_until_tutor_review",
      flow.practising.status === "PRACTISING" &&
        attempt?.attemptId === flow.practising.attemptId &&
        !flow.practising.hasVerification,
    );
    const selfVerify = await this.request(
      actor,
      `/diary/threads/${threadId}/verify`,
      { method: "POST", body: {}, key: this.key("self-verification-denied") },
    );
    this.expectResponse("learner_cannot_self_certify", selfVerify, [403]);
    const evidence = {
      criterion,
      procedureQuote: "la portata dipende dalla quarta potenza: 2^4 = 16",
      reasoning:
        "Il procedimento esplicita il vincolo e confronta la quarta potenza nella nuova situazione.",
      variationReason: "Il rapporto dei raggi cambia da 1.5 a 2.",
    };
    thread = await this.post(
      this.tutor,
      `/diary/threads/${threadId}/verify`,
      { attemptId: attempt.attemptId, rubricEvidence: evidence },
      "diary-verify",
    );
    this.check(
      "resolution_has_tutor_and_new_procedure_evidence",
      thread.status === "VERIFIED_RESOLVED" &&
        thread.latestVerification.reviewerId === this.tutor &&
        thread.latestVerification.submissionId === transfer.submissionId &&
        thread.latestVerification.verification === "REVIEWED_BY_TUTOR",
    );
    this.state.diary = {
      threadId,
      studentId: actor,
      transfer,
      attemptId: attempt.attemptId,
    };
    await this.save();
    const reopened = await this.get(
      actor,
      `/diary/threads/${threadId}`,
      "learner_reopens_verified_diary",
    );
    this.check(
      "verified_state_persists_over_new_http_request",
      reopened.status === "VERIFIED_RESOLVED" && reopened.history.length === 4,
    );
  }
  async privacyAndExport() {
    const actor = this.state.members[0],
      peer = this.state.members[1],
      original = this.state.originals[actor];
    for (const deniedActor of [peer, this.otherTutor]) {
      await this.denied(
        deniedActor,
        `/resources/${original.source.id}/revisions/${original.source.revisionId}`,
        original.text,
      );
      await this.denied(
        deniedActor,
        "/receipts/" + original.receipt.receiptId,
        original.text,
      );
      await this.denied(
        deniedActor,
        "/context/" + original.source.contextId,
        original.text,
      );
      if (this.state.diary)
        await this.denied(
          deniedActor,
          "/diary/threads/" + this.state.diary.threadId,
          original.text,
        );
      for (const asset of Object.values(this.state.media))
        await this.denied(deniedActor, "/assets/" + asset.id, original.text);
    }
    await this.denied(
      this.otherTutor,
      `/workspace?editionId=${EDITION}`,
      original.text,
    );
    await this.denied(peer, `/editions/${EDITION}/access`, original.text);
    const context = await this.get(
      actor,
      "/context/" + original.source.contextId,
      "owner_reads_grounded_context",
    );
    this.check(
      "context_links_review_to_exact_submission_and_revision",
      context.observations.some(
        (item) =>
          item.reviewId === this.state.feedback[actor]?.reviewId &&
          item.evidence.submissionId === original.receipt.submissionId &&
          item.evidence.revisionId === original.source.revisionId &&
          item.evidence.text === original.text &&
          item.evidence.segmentId &&
          item.relations.includes("supports"),
      ),
    );
    const notebook = await this.get(
      actor,
      `/notebook?editionId=${EDITION}`,
      "owner_exports_notebook",
    );
    this.check(
      "notebook_contains_own_receipt_and_originals",
      notebook.format === "ardesia-study-notebook-v1" &&
        notebook.submissions.some(
          (item) => item.id === original.receipt.submissionId,
        ) &&
        notebook.submissions.every((item) => item.student_id === actor) &&
        Object.values(this.state.media).every((asset) =>
          notebook.assets.some(
            (item) => item.id === asset.id && item.sha256 === asset.sha256,
          ),
        ),
    );
    const inspected = await this.post(
      actor,
      "/notebook/inspect",
      notebook,
      "inspect-exported-notebook",
    );
    this.check(
      "portable_export_passes_integrity_inspection",
      inspected.valid === true && inspected.sha256 === notebook.sha256,
    );
    for (const [name, value] of [
      ["context.json", context],
      ["notebook.json", notebook],
    ]) {
      this.safeArtifact(value);
      const file = path.join(this.config.outputDir, this.state.runId, name);
      await privateJson(file, value);
      this.report.artifacts.push({
        name,
        sha256: sha256(await readFile(file)),
        synthetic: true,
      });
    }
  }
}

export async function runHttpScenario(config = options()) {
  process.umask(0o077);
  await mkdir(config.outputDir, { recursive: true, mode: 0o700 });
  const lockPath = path.join(config.outputDir, "runner.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch {
    throw new ScenarioFailure("runner_already_active");
  }
  let scenario;
  try {
    const access = await jsonFile(config.accessFile);
    if (
      !access.synthetic ||
      access.authentication !== "real_local_supabase" ||
      !access.tokens
    )
      throw new ScenarioFailure("synthetic_supabase_credentials_required");
    scenario = new HttpScenario(config, access.tokens);
    scenario.report.provenanceAtStart = await sourceProvenance();
    scenario.report.codeState = scenario.report.provenanceAtStart.codeState;
    scenario.report.runnerSha256 = sha256(
      await readFile(fileURLToPath(import.meta.url)),
    );
    const health = await scenario.get(
      null,
      "/health",
      "runtime_health_accessible",
    );
    scenario.check(
      "real_postgres_and_supabase_auth_runtime",
      health.ok === true &&
        health.persistence === "postgres" &&
        health.authentication === "supabase" &&
        health.apiSpendUsd === 0,
    );
    scenario.report.runtime = {
      dataId: health.dataId,
      processId: health.processId,
      persistence: health.persistence,
      authentication: health.authentication,
      provider: health.provider,
    };
    scenario.checkpoint = path.join(
      config.outputDir,
      "checkpoint-" + health.dataId + ".json",
    );
    scenario.state = await optionalJson(scenario.checkpoint);
    if (
      config.requestedRunId &&
      scenario.state &&
      config.requestedRunId !== scenario.state.runId
    )
      throw new ScenarioFailure(
        "different_nonce_requires_separate_empty_fixture",
      );
    await scenario.phase("authenticate", () => scenario.authenticate());
    if (scenario.state && scenario.tutor) {
      await mkdir(path.join(config.outputDir, scenario.state.runId), {
        recursive: true,
        mode: 0o700,
      });
      await scenario.phase("capacity_and_waitlist", () => scenario.enroll());
      if (scenario.state.members?.length === 10) {
        const mediaReady = await scenario.phase(
          "validated_storage_originals",
          () => scenario.media(),
        );
        if (mediaReady)
          await scenario.phase("ten_submissions_and_receipts", () =>
            scenario.submitAll(),
          );
        if (
          Object.values(scenario.state.originals).filter((item) => item.receipt)
            .length === 10
        ) {
          await scenario.phase("manual_tutor_feedback", () =>
            scenario.manualFeedback(),
          );
          await scenario.phase("distinct_diary_transfer", () =>
            scenario.diary(),
          );
          await scenario.phase("privacy_context_and_export", () =>
            scenario.privacyAndExport(),
          );
        } else
          scenario.report.failures.push({
            phase: "dependent_scenarios",
            code: "ten_received_submissions_required",
          });
      } else
        scenario.report.failures.push({
          phase: "dependent_scenarios",
          code: "ten_confirmed_members_required",
        });
    }
    const finalHealth = await scenario.get(
      null,
      "/health",
      "runtime_still_available",
    );
    scenario.check(
      "same_runtime_process_and_data",
      finalHealth.processId === health.processId &&
        finalHealth.dataId === health.dataId,
    );
  } catch (error) {
    if (!scenario) throw error;
    scenario.report.failures.push({
      phase: "runner",
      code:
        error instanceof ScenarioFailure
          ? error.code
          : "unexpected_runner_error",
    });
  } finally {
    await lock.close();
    await unlink(lockPath);
    if (scenario) {
      scenario.report.finishedAt = new Date().toISOString();
      scenario.report.provenanceAtEnd = await sourceProvenance();
      scenario.report.baseHeadAtEnd = scenario.report.provenanceAtEnd.baseHead;
      scenario.report.workingTreeDirtyAtEnd =
        scenario.report.provenanceAtEnd.workingTreeDirty;
      scenario.report.sourcesChangedDuringRun =
        scenario.report.provenanceAtStart?.sourceDigest !==
        scenario.report.provenanceAtEnd.sourceDigest;
      scenario.report.baseHeadChangedDuringRun =
        scenario.report.baseHeadAtStart !== scenario.report.baseHeadAtEnd;
      scenario.report.scenarioStatus = scenario.report.failures.length
        ? "SCENARIO_ASSERTIONS_FAILED"
        : "SCENARIO_ASSERTIONS_PASSED";
      scenario.report.notChecked = [
        "Global G0 acceptance and launch authorization",
        "Human pilot and scientific approval",
        "Production deployment, payments, email delivery, live OCR/ASR or AI",
        "Cold server restart (requires separate candidate run)",
      ];
      scenario.safeArtifact(scenario.report);
      const content = {
        ...scenario.report,
        sha256: sha256(canonical(scenario.report)),
      };
      await privateJson(
        path.join(config.outputDir, "latest-report.json"),
        content,
      );
      if (scenario.state)
        await privateJson(
          path.join(
            config.outputDir,
            scenario.state.runId,
            scenario.report.executionId + ".json",
          ),
          content,
        );
    }
  }
  return scenario.report;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const report = await runHttpScenario();
    console.log(
      JSON.stringify({
        scenarioStatus: report.scenarioStatus,
        assertions: report.assertions.length,
        failures: report.failures.map(({ phase, code }) => ({ phase, code })),
        baseHeadAtStart: report.baseHeadAtStart,
        baseHeadAtEnd: report.baseHeadAtEnd,
        codeState: report.codeState,
        workingTreeDirty: report.workingTreeDirty,
        sourceDigest: report.provenanceAtStart?.sourceDigest,
        globalG0Verdict: "NOT_EVALUATED",
        launchAllowed: false,
      }),
    );
    if (report.failures.length) process.exitCode = 1;
  } catch (error) {
    console.log(
      JSON.stringify({
        scenarioStatus: "RUNNER_FAILED",
        code:
          error instanceof ScenarioFailure ? error.code : "runner_setup_failed",
        globalG0Verdict: "NOT_EVALUATED",
        launchAllowed: false,
      }),
    );
    process.exitCode = 1;
  }
}
