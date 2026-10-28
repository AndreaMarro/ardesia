// Founder Beta shell: il docente attraversa soltanto Lezione, Continuità e
// Materiali e torna alla stessa lezione (hash preservato).
import { test, expect } from "@playwright/test"

test("flusso docente: Lezione → Continuità → Materiali → stessa Lezione", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))

  // 1. Apri Ardesia: la lavagna assegna lo hash stanza.
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  const roomHash = new URL(page.url()).hash
  expect(roomHash).toMatch(/^#wbstudio-/)
  const nav = page.locator("[data-view-nav]").first()
  await expect(nav).toBeVisible()
  await expect(nav.locator('[data-view-nav-item="lezione"]')).toHaveAttribute(
    "aria-current",
    "page",
  )
  await expect(nav.locator("[data-view-nav-item]")).toHaveCount(3)
  await expect(nav).not.toContainText("Simulatore")
  await expect(nav).not.toContainText("ELABTutor")
  await expect(nav).not.toContainText("Marketplace")

  await expect(page.locator("[data-founder-plugin-id]")).toHaveCount(0)
  const lessonActions = page.locator(".st-actions")
  for (const excluded of [
    "invita studente",
    "audio",
    "Meet",
    "esporta lezione",
    "sim esp2",
    "sim esp3",
    "sim esp6",
  ]) {
    await expect(lessonActions).not.toContainText(excluded)
  }

  // 2. L'ultima mutazione journal deve diventare durevole PRIMA che la route
  // cambi. Ritardiamo la write reale, poi la sblocchiamo e verifichiamo il
  // marker dopo il ritorno a freddo sulla stessa Lezione.
  const lastEventMarker = `fb6c-last-event-${Date.now()}`
  await page.evaluate((marker) => {
    const harness = (window as any).__MAESTRO_TEST__
    if (!harness?.recorder || !harness?.store) throw new Error("Room harness non pronto")
    const originalWrite = harness.store.write.bind(harness.store)
    let releaseWrite!: () => void
    const writeGate = new Promise<void>((resolve) => { releaseWrite = resolve })
    ;(window as any).__FB6C_WRITE_STARTED__ = false
    ;(window as any).__FB6C_RELEASE_WRITE__ = releaseWrite
    harness.store.write = async (path: string, data: Blob) => {
      if (path === harness.PATHS.JOURNAL) {
        ;(window as any).__FB6C_WRITE_STARTED__ = true
        await writeGate
      }
      return originalWrite(path, data)
    }
    harness.recorder.recordMathInsert(marker)
    document.querySelector<HTMLAnchorElement>(
      '[data-view-nav-item="continuita"]',
    )?.click()
  }, lastEventMarker)
  await expect.poll(() => page.evaluate(
    () => Boolean((window as any).__FB6C_WRITE_STARTED__),
  )).toBe(true)
  expect(new URL(page.url()).hash).toBe(roomHash)
  expect(new URL(page.url()).search).toBe("")
  await page.evaluate(() => (window as any).__FB6C_RELEASE_WRITE__())

  // 3. Continuità è la superficie di ripresa, NON il cruscotto.
  //
  // Questo passo asseriva `[data-zstat]`, che esiste solo in
  // `TeacherDashboardView`. Il commit 9083f589 (29jul) ha ridiretto la voce di
  // nav "Continuità" da `?vista=cruscotto` a `?vista=continuita`, che monta
  // `ContinuityView`: una superficie diversa, con una promessa diversa. L'assert
  // era rimasto puntato su dove Continuità stava PRIMA, e fallendo qui il test
  // non arrivava mai al passo 4 — nascondendo il difetto vero, che era la nav
  // assente da `ContinuityView` in tutti e sette i suoi rami.
  //
  // La garanzia sulla projection non è stata persa: è al passo 6, sulla
  // superficie che la espone davvero.
  const superficie = page.getByTestId("continuity-surface")
  await expect(superficie).toBeVisible({ timeout: 15_000 })
  await expect(
    page.locator('[data-view-nav-item="continuita"][aria-current="page"]'),
  ).toBeVisible()
  // La nav deve esistere QUI: senza, il passo 4 non sarebbe raggiungibile da un
  // docente, solo da un test che conosce gli URL.
  await expect(page.locator("[data-view-nav] [data-view-nav-item]")).toHaveCount(3)
  expect(new URL(page.url()).hash).toBe(roomHash)

  // 4. Materiali usa l'alias profondo ma monta il workflow locale Founder Beta.
  await page.locator('[data-view-nav-item="materiali"]').click()
  await expect(
    page.locator('[data-view-nav-item="materiali"][aria-current="page"]'),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Materiali locali")).toBeVisible()
  await expect(page.getByLabel("Seleziona bundle .lesson")).toBeVisible()
  await expect(page.getByRole("button", { name: "Esporta .lesson" })).toBeVisible()
  await expect(page.getByText("LessonOS non configurato")).toHaveCount(0)
  expect(new URL(page.url()).hash).toBe(roomHash)

  // 5. Torna alla superficie Lezione: STESSA stanza e ultimo evento presente.
  await page.locator('[data-view-nav-item="lezione"]').click()
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  expect(new URL(page.url()).hash).toBe(roomHash)
  await expect.poll(() => page.evaluate(async (marker) => {
    const harness = (window as any).__MAESTRO_TEST__
    const journal = await harness?.store?.read(harness.PATHS.JOURNAL)
    return journal ? (await journal.text()).includes(marker) : false
  }, lastEventMarker)).toBe(true)

  // 6. Il cruscotto, ora che la write è durevole, deve PROIETTARE quell'evento:
  // la presenza del selettore non dice se la projection legge la lezione giusta.
  //
  // Si naviga esplicitamente a `?vista=cruscotto`: è lì che vive `[data-zstat]`
  // da quando la nav "Continuità" punta alla superficie di ripresa. L'assert è
  // lo stesso di prima — cambia il referente, non la garanzia.
  await page.goto(`/?vista=cruscotto${roomHash}`)
  const mathInserts = page.getByTestId("zstat-math.inserts.count")
  await expect(mathInserts).toBeVisible({ timeout: 15_000 })
  await expect
    .poll(async () => Number(await mathInserts.getAttribute("data-zstat-value")), {
      timeout: 15_000,
    })
    .toBeGreaterThanOrEqual(1)

  expect(consoleErrors).toEqual([])
})
