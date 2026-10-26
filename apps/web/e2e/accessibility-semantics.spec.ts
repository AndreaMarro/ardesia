import { expect, test, type Page } from "@playwright/test";

// Browser semantics only: this fixture is a mocked HTTP boundary, not an Auth/PG proof.
const edition = {
  id: "a11y-one", title: "Fisica: relazioni e fluidi", subject: "fisica",
  teacherId: "teacher", capacity: 10, priceMinor: 4900, state: "collecting",
  sessions: [], timezone: "Europe/Rome", duration: "4 incontri",
};
const resource = {
  id: "source", revisionId: "revision-original", contextId: "context",
  ownerId: "student", editionId: edition.id, kind: "notes", visibility: "private",
  text: "Confronto le unità prima del calcolo.", sha256: "a".repeat(64),
};
const workspace = {
  edition, enrolled: true, resources: [resource], layoutSaved: true, layoutVersion: "b".repeat(64),
  layouts: [{
    instanceId: "view-one", kind: "plugin-postit-object", pluginId: "ardesia.study",
    selected: false, hovered: false, proximity: "far",
    bounds: { x: 24, y: 24, width: 360, height: 300 }, zIndex: 0,
    pluginState: { resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId },
  }],
  submissions: [{
    id: "submission", student_id: "student", activity_id: "poiseuille-v1", revision: 1,
    parent_id: null, text: "Confronto le unità.", asset_refs: [], source_refs: [],
    receipt_id: "receipt", state: "submitted", feedback: [{
      id: "feedback", state: "reviewed", text: "", stale: false, authorType: "teacher", submissionRevision: 1,
      review: { id: "review", text: "Controlla la proporzione.", decision: "revise", syntheticTutor: true },
    }],
  }],
};

async function mockStudy(page: Page, role: "student" | "teacher" | "anonymous") {
  const unexpected: string[] = [];
  await page.route("**/study/**", async (route) => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (!path.startsWith("/study/")) { await route.continue(); return; }
    if (request.method() !== "GET") {
      unexpected.push(`${request.method()} ${path}`);
      await route.fulfill({ status: 503, json: { error: "mock_read_only" } });
      return;
    }
    if (path === "/study/me") {
      await route.fulfill(role === "anonymous"
        ? { status: 401, json: { error: "unauthenticated" } }
        : { json: { id: role, role, synthetic: true } });
      return;
    }
    const value = path === "/study/editions" ? { items: [edition, { ...edition, id: "a11y-two" }], nextCursor: null }
      : path === "/study/workspace" ? workspace
      : path === "/study/course" ? { ...edition, scope: "Contenuti di prova" }
      : path === "/study/diary" ? { threads: [] }
      : path === "/study/editions/a11y-one/access" ? { members: [], waitlist: [], invitations: [], capabilities: { invitationCodes: false } }
      : path === "/study/resources/source/revisions/revision-original" ? resource
      : undefined;
    if (value === undefined) unexpected.push(`GET ${path}`);
    await route.fulfill({ status: value === undefined ? 404 : 200, json: value ?? { error: "unknown_mock_route" } });
  });
  return unexpected;
}

for (const width of [390, 1440]) {
  test(`public skip link focuses main and preserves the brand name at ${width}px @mock-ui`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const unexpected = await mockStudy(page, "anonymous");
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "La fisica. Un’idea alla volta." })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: /^ardesia\s*\.$/ })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Vai al contenuto" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Prova il laboratorio" })).toBeFocused();
    expect(unexpected).toEqual([]);
  });

  for (const role of ["student", "teacher"] as const) {
    test(`${role} skip, editions and source commands at ${width}px @mock-ui`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      const unexpected = await mockStudy(page, role);
      await page.goto("/?view=courses&edition=" + edition.id);
      await expect(page.locator(".edition-row")).toHaveCount(2);
      await expect(page.getByRole("region", { name: edition.title })).toHaveCount(0);
      await expect(page.getByRole("article", { name: edition.title })).toHaveCount(2);
      await expect(page.getByRole("complementary", { name: "Navigazione e account" }).getByRole("link", { name: /^ardesia\s*\.$/ })).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Vai al contenuto" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
      await page.getByRole("button", { name: "Apri l’aula" }).first().click();
      await expect(page.getByRole("button", { name: "Fonte 01 rev. revision" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Apri una vista: fonte 1", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Altra vista: fonte 1", exact: true })).toBeVisible();
      if (role === "student") {
        await page.getByRole("button", { name: "Il mio lavoro", exact: true }).click();
        await page.getByRole("button", { name: "Consegne e feedback", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Tentativo 1 · Laboratorio Fluidi", level: 2 })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Il tutor ha scritto", level: 3 })).toBeVisible();
      }
      expect(unexpected).toEqual([]);
    });
  }
}
