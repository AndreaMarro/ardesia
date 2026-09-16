// C2B — il digest del recap isola le lezioni per identita', non per tempo.
//
// Due lezioni con eventi temporalmente INDISTINGUIBILI (stesso occurredAt):
// il recap di A deve mostrare solo i fatti A, quello di B solo i fatti B.
// Attraversa il path production reale:
//   RecapView → createEventLogStore → IndexedDB del browser
//   → readEnvelopesByLesson(room) → buildLessonStudyDigest → anteprima.
// Nessun mock dello store, nessun backdoor: la semina usa lo store della
// sessione LessonOS esposto dall'harness DEV gia' versionato.
//
// VERIFICA:  cd apps/studio && npx playwright test e2e/recap-identity-isolation.spec.ts
import { test, expect, type Page } from "@playwright/test"

test.setTimeout(60_000)

const IFRAME_TITLE = "Anteprima del recap stampabile da consegnare"
const CONCETTO_A = "CONCETTO SOLO A"
const ERRORE_A = "ERRORE SOLO A"
const CONCETTO_B = "CONCETTO SOLO B"
const ERRORE_B = "ERRORE SOLO B"
// Stesso istante per A e B: il tempo NON puo' distinguerli, per disegno.
const STESSO_ISTANTE = "2026-08-01T00:02:30.000Z"

type Harness = {
  ready?: boolean
  recorder?: { recordMathInsert(x: string): void }
  flushPersist?: () => Promise<void>
  store?: { write(path: string, data: Blob): Promise<void> }
  lessonOs?: {
    current?: {
      store?: { appendEnvelope(e: unknown): Promise<{ appended: boolean }> }
      producer?: Record<string, unknown>
    } | null
  }
}

async function apriLezione(page: Page, room: string): Promise<void> {
  await page.goto(`/#${room}`)
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 20_000 })
  await expect
    .poll(() => page.evaluate(() => Boolean((window as unknown as { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready)), { timeout: 20_000 })
    .toBe(true)
  // Traccia lavagna: senza, buildRecap e' vuoto e l'anteprima non esiste.
  // NOTA: buildRecap legge il journal GLOBALE (raw/events.jsonl), mentre il
  // recorder scrive quello per-room — il recap base risulta vuoto per le
  // lezioni room-scoped (bug indipendente, registrato come debito, NON di
  // questa unita'). Qui si scrive il journal globale via store production
  // per rendere il recap non-vuoto; il digest resta da event-log (C2A).
  await page.evaluate(async (m) => {
    const h = (window as unknown as { __MAESTRO_TEST__?: Harness }).__MAESTRO_TEST__
    if (!h?.store) throw new Error("store Workspace non esposto")
    const riga = `${JSON.stringify({ kind: "journal", type: "math.insert", latex: m, t: Date.now() })}\n`
    await h.store.write("raw/events.jsonl", new Blob([riga], { type: "application/x-ndjson" }))
  }, `c2b-${room}`)
}

let contatoreEventi = 0

/** Semina UN envelope canonico con lessonId esplicito sullo store reale. */
async function semina(page: Page, args: {
  lessonId: string
  sessionId: string
  kind: string
  occurredAt: string
  payload: Record<string, unknown>
  tag: string
}): Promise<void> {
  contatoreEventi += 1
  const eventId = `70000000-0000-4000-8000-${String(contatoreEventi).padStart(12, "0")}`
  await page.evaluate(async (a) => {
    const h = (window as unknown as { __MAESTRO_TEST__?: Harness }).__MAESTRO_TEST__
    const runtime = h?.lessonOs?.current
    if (!runtime?.store) throw new Error("sessione LessonOS non pronta per la semina")
    if (!runtime.producer) throw new Error("producer LessonOS non esposto")
    const applicato = await runtime.store.appendEnvelope({
      schemaVersion: 2,
      eventId: a.eventId,
      lessonId: a.lessonId,
      sessionId: a.sessionId,
      kind: a.kind,
      occurredAt: a.occurredAt,
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: { ...(runtime.producer as Record<string, unknown>) },
      causationId: null,
      idempotencyKey: `c2b:${a.tag}`,
      evidence: [{ ref: `lesson:${a.lessonId}@${a.tag}`, resolution: "verified" }],
      payload: a.payload,
    })
    if (!applicato.appended) throw new Error("semina non applicata (retry/idempotenza?)")
  }, { ...args, eventId })
}

async function srcDocAnteprima(page: Page): Promise<string> {
  return page.evaluate((title) => {
    const frame = document.querySelector(`iframe[title="${title}"]`) as HTMLIFrameElement | null
    return frame?.srcdoc ?? ""
  }, IFRAME_TITLE)
}

test("recap identity isolation: lezioni sovrapposte, ogni recap mostra solo i suoi fatti", async ({
  page,
}, testInfo) => {
  const errori: string[] = []
  page.on("console", (m) => {
    if (m.type() !== "error") return
    // Rumore noto e pre-esistente: l'anteprima del recap e' un iframe
    // sandboxed (sandbox="") e il browser segnala gli script bloccati nel
    // srcdoc. Non e' un errore del prodotto ne' di questa unita': si ignora
    // SOLO questo messaggio, tutto il resto resta severamente contato.
    if (m.text().includes("about:srcdoc") && m.text().includes("sandboxed")) return
    errori.push(m.text())
  })
  page.on("pageerror", (e) => errori.push(`pageerror: ${e.message}`))

  const roomA = `c2b-a-w${testInfo.workerIndex}-r${testInfo.retry}`
  const roomB = `c2b-b-w${testInfo.workerIndex}-r${testInfo.retry}`

  // --- 1. lezione A: lavagna + fatti canonici A --------------------------
  await test.step("1. lezione A con fatti canonici", async () => {
    await apriLezione(page, roomA)
    const sessioneA = await page.evaluate(() => crypto.randomUUID())
    await semina(page, {
      lessonId: roomA, sessionId: sessioneA, kind: "concept.introduced",
      occurredAt: STESSO_ISTANTE, tag: "c2b-ca",
      payload: { conceptId: "concetto-solo-a", labels: { it: CONCETTO_A } },
    })
    await semina(page, {
      lessonId: roomA, sessionId: sessioneA, kind: "error.observed",
      occurredAt: STESSO_ISTANTE, tag: "c2b-ea",
      payload: { errorId: "err-solo-a", conceptId: "concetto-solo-a", labels: { it: ERRORE_A } },
    })
  })

  // --- 2. lezione B: STESSO istante, fatti B ------------------------------
  await test.step("2. lezione B allo stesso istante con fatti B", async () => {
    await apriLezione(page, roomB)
    const sessioneB = await page.evaluate(() => crypto.randomUUID())
    await semina(page, {
      lessonId: roomB, sessionId: sessioneB, kind: "concept.introduced",
      occurredAt: STESSO_ISTANTE, tag: "c2b-cb",
      payload: { conceptId: "concetto-solo-b", labels: { it: CONCETTO_B } },
    })
    await semina(page, {
      lessonId: roomB, sessionId: sessioneB, kind: "error.observed",
      occurredAt: STESSO_ISTANTE, tag: "c2b-eb",
      payload: { errorId: "err-solo-b", conceptId: "concetto-solo-b", labels: { it: ERRORE_B } },
    })
  })

  // --- 3. recap A: solo A -------------------------------------------------
  await test.step("3. recap A mostra solo i fatti A", async () => {
    await page.goto(`/?vista=recap#${roomA}`)
    await expect
      .poll(() => srcDocAnteprima(page), { timeout: 20_000 })
      .toContain(CONCETTO_A)
    const anteprima = await srcDocAnteprima(page)
    expect(anteprima, "recap A: concetto A presente").toContain(CONCETTO_A)
    expect(anteprima, "recap A: errore A presente").toContain(ERRORE_A)
    expect(anteprima, "recap A: concetto B ASSENTE").not.toContain(CONCETTO_B)
    expect(anteprima, "recap A: errore B ASSENTE").not.toContain(ERRORE_B)
  })

  // --- 4. recap B: solo B (simmetria: non basta che A filtri) --------------
  await test.step("4. recap B mostra solo i fatti B", async () => {
    await page.goto(`/?vista=recap#${roomB}`)
    // La Room cattura room al mount senza listener hashchange: passando da
    // un recap all'altro (stessa query) serve un reload, come in apertura
    // fresca. Senza, resterebbe montato il recap A (comportamento
    // pre-esistente, fuori scope C2B).
    await page.reload()
    await expect
      .poll(() => srcDocAnteprima(page), { timeout: 20_000 })
      .toContain(CONCETTO_B)
    const anteprima = await srcDocAnteprima(page)
    expect(anteprima, "recap B: concetto B presente").toContain(CONCETTO_B)
    expect(anteprima, "recap B: errore B presente").toContain(ERRORE_B)
    expect(anteprima, "recap B: concetto A ASSENTE").not.toContain(CONCETTO_A)
    expect(anteprima, "recap B: errore A ASSENTE").not.toContain(ERRORE_A)
  })

  expect(errori, "errori di console/pageerror durante il test").toEqual([])
})
