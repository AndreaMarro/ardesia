// Golden-path §8 — lezioni salvate: la route ?vista=lezioni-salvate monta
// SavedLessonsPanel sul client LessonOS e il producer quiz.attempted (#69)
// gira nel browser REALE fino all'event-log IndexedDB. Il backend è stubbato
// con page.route (locale-first: niente token reale, AUTH_STRICT resta gate);
// il percorso del token è comunque verificato: parte da localStorage e
// arriva come Bearer nell'header — MAI dall'URL.
import { test, expect } from "@playwright/test"

// Same-origin: nessun CORS/preflight da stubbare — il client accetta una
// baseUrl relativa e il Bearer viaggia identico.
const BASE = "/lessonos-e2e"

test("lezioni salvate: quiz svolto → correzione → quiz.attempted nell'event-log", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.addInitScript(() => {
    window.localStorage.setItem("ardesia.lessonos.baseUrl", "/lessonos-e2e")
    window.localStorage.setItem("ardesia.lessonos.token", "tok-e2e")
  })

  const authHeaders: Array<string | undefined> = []
  await page.route(`**${BASE}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    authHeaders.push(request.headers()["authorization"])
    if (path === `${BASE}/v1/saved-lessons`) {
      return route.fulfill({
        json: {
          saved_lessons: [
            { saved_id: "s1", lesson_id: "l1", title: "Il primo LED", n_quiz: 2 },
          ],
        },
      })
    }
    if (path === `${BASE}/v1/saved-lessons/s1/quiz`) {
      return route.fulfill({
        json: {
          saved_id: "s1",
          questions: [
            {
              atom_id: "a1",
              question: "Cosa serve per accendere il LED?",
              options: ["Un circuito chiuso", "Un circuito aperto"],
            },
            {
              atom_id: "a2",
              question: "Dove va il catodo?",
              options: ["Al polo positivo", "Al polo negativo"],
            },
          ],
        },
      })
    }
    if (path === `${BASE}/v1/saved-lessons/s1/flashcards`) {
      return route.fulfill({ json: { saved_id: "s1", flashcards: [] } })
    }
    if (path === `${BASE}/v1/saved-lessons/s1/quiz/grade`) {
      return route.fulfill({
        json: {
          saved_id: "s1",
          lesson_id: "l1",
          results: [
            { atom_id: "a1", correct: true, correct_index: 0 },
            { atom_id: "a2", correct: false, correct_index: 1 },
          ],
        },
      })
    }
    return route.fulfill({ status: 404, json: { detail: `stub mancante: ${path}` } })
  })

  await page.goto("/?vista=lezioni-salvate&room=e2e-room")

  // Lista dal backend (stub) → apertura della lezione.
  await page.getByRole("button", { name: "Il primo LED" }).click()

  // Svolgimento: una risposta giusta e una sbagliata (fatto reale del grade).
  await page.getByRole("radio", { name: "Un circuito chiuso" }).check()
  await page.getByRole("radio", { name: "Al polo positivo" }).check()
  await page.getByRole("button", { name: "Correggi il quiz" }).click()

  // Correzione del backend presentata (mai calcolata dal client).
  await expect(
    page.getByRole("status").filter({ hasText: "risposte corrette" }),
  ).toHaveText("1 risposte corrette su 2")
  // Registrazione riuscita: nessun avviso di memoria persa.
  await expect(page.getByText("Tentativo non registrato", { exact: false })).toHaveCount(0)

  // Il Bearer arriva dal localStorage su OGNI chiamata (mai dall'URL).
  expect(authHeaders.length).toBeGreaterThanOrEqual(4)
  for (const header of authHeaders) expect(header).toBe("Bearer tok-e2e")

  // quiz.attempted persistito nell'event-log IndexedDB della lezione.
  const kinds = await page.evaluate(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const open = indexedDB.open("lessonos-eventlog")
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const db = open.result
          const txn = db.transaction("lessonos_events", "readonly")
          const all = txn.objectStore("lessonos_events").getAll()
          all.onerror = () => reject(all.error)
          all.onsuccess = () =>
            resolve((all.result as Array<{ kind?: string }>).map((r) => r.kind ?? "?"))
        }
      }),
  )
  expect(kinds).toContain("quiz.attempted")

  expect(consoleErrors).toEqual([])
})
