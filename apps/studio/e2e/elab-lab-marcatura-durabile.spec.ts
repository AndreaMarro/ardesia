// Issue #246 — la vista non deve dichiarare «segnato» prima che l'evento sia
// DURABILE. Causa misurata: ElabLab.tsx markMistake() emette sul bus e
// incrementa il contatore nella stessa funzione sincrona, mentre il binding
// host (busEventLogBinding.ts) fa `void log.append(...)`: fire-and-forget.
//
// Perche' l'e2e che esisteva non lo vedeva: elab-lab.spec.ts resta nella vista
// montata e non naviga MAI. Un difetto di durabilita' e' invisibile finche'
// nessuno spegne la luce — l'unico modo di misurarlo e' navigare MENTRE la
// scrittura e' in volo.
//
// Come si rende «in volo» in modo deterministico, senza mock e senza toccare il
// prodotto: il percorso reale dell'append passa da
//   IndexedDbEventLog.append() -> envelopeForLegacyAppend() ->
//   deterministicUuidV8() -> crypto.subtle.digest("SHA-256")
// (ElabLab usa createEventLogStore() senza trustedContext, quindi il sessionId
// e' derivato via digest a OGNI append). Qui si rallenta quella stessa API del
// browser: nessuno stub di IndexedDB, nessuna finestra di test nel prodotto —
// solo storage/crypto lento, che e' il caso reale che il difetto colpisce.
import { test, expect } from "@playwright/test"

const SCRITTURA_LENTA_MS = 3_000

test("ELAB Lab #246: il contatore non anticipa la memoria — l'errore segnato sopravvive al reload", async ({
  page,
}) => {
  // Il rallentamento e' spento all'avvio e riparte spento a ogni navigazione:
  // si accende SOLO per la finestra del click, cosi' il resto della vista
  // (mount, solve, apertura del log) gira alla velocita' di sempre.
  await page.addInitScript(() => {
    const finestra = window as unknown as {
      __ardesiaDigestLentoMs?: number
      __ardesiaDigestRallentati?: number
    }
    finestra.__ardesiaDigestLentoMs = 0
    finestra.__ardesiaDigestRallentati = 0
    const subtle = window.crypto?.subtle
    if (!subtle) return
    const originale = subtle.digest.bind(subtle)
    subtle.digest = ((algoritmo: AlgorithmIdentifier, dati: BufferSource) => {
      const attesa = finestra.__ardesiaDigestLentoMs ?? 0
      if (attesa <= 0) return originale(algoritmo, dati)
      finestra.__ardesiaDigestRallentati = (finestra.__ardesiaDigestRallentati ?? 0) + 1
      return new Promise<ArrayBuffer>((resolve, reject) => {
        setTimeout(() => {
          originale(algoritmo, dati).then(resolve, reject)
        }, attesa)
      })
    }) as SubtleCrypto["digest"]
  })

  await page.goto("/?vista=elab-lab")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })

  const marcatura = page.locator("[data-elab-lab-marcatura]")
  await expect(marcatura).toBeVisible()
  await marcatura.locator("input[name=elab-lab-concept]").first().check()
  const bottoneErrore = marcatura.locator("[data-mistake-id]").first()
  await expect(bottoneErrore).toBeEnabled({ timeout: 15_000 })

  // Da qui in poi la scrittura sull'event-log e' lenta.
  await page.evaluate((ms) => {
    ;(window as unknown as { __ardesiaDigestLentoMs?: number }).__ardesiaDigestLentoMs = ms
  }, SCRITTURA_LENTA_MS)

  await bottoneErrore.click()

  // Il docente legge la conferma della vista. E' l'unico segnale che ha.
  await expect(marcatura.locator("[data-marked-count]")).toHaveText("errori segnati: 1", {
    timeout: 20_000,
  })

  // ⚠️ L'oracolo verifica PRIMA DI TUTTO se stesso. Il rallentamento morde solo
  // finche' l'append passa davvero da `deterministicUuidV8` — cosa vera oggi
  // perche' la vista costruisce lo store senza `trustedContext`. Il giorno in
  // cui passasse da `openLessonOsSession` (che il trustedContext ce l'ha, e
  // salta il digest) questa spec resterebbe VERDE senza misurare piu' niente:
  // un test che si spegne in silenzio e' peggio di un test che manca. Se il
  // contatore e' zero, il seam e' sparito e questo test deve morire RUMOROSO.
  const digestRallentati = await page.evaluate(
    () => (window as unknown as { __ardesiaDigestRallentati?: number }).__ardesiaDigestRallentati ?? 0,
  )
  expect(
    digestRallentati,
    "il seam dell'oracolo e' sparito: l'append non passa piu' da crypto.subtle.digest, quindi la scrittura NON era in volo e questo test non misura piu' #246",
  ).toBeGreaterThan(0)

  // ...e ricarica subito. Se la conferma e' arrivata prima della durabilita',
  // questo reload uccide la scrittura ancora in volo.
  await page.reload()
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })

  // La verita' si legge dalla stessa superficie che usa il docente: l'export
  // della memoria della lezione, dopo il reload.
  const bottoneExport = page.getByRole("button", { name: "Esporta memoria (JSON)" })
  await expect(bottoneExport).toBeEnabled({ timeout: 15_000 })
  const download = page.waitForEvent("download")
  await bottoneExport.click()
  const scaricato = await download
  const stream = await scaricato.createReadStream()
  const pezzi: Buffer[] = []
  for await (const pezzo of stream) pezzi.push(pezzo as Buffer)
  const memoria = JSON.parse(Buffer.concat(pezzi).toString("utf8")) as {
    events: Array<{ kind: string }>
  }

  // L'invariante di #246: cio' che la vista ha dichiarato segnato, la memoria
  // della lezione lo contiene — anche se il docente ha navigato subito dopo.
  expect(memoria.events.map((evento) => evento.kind)).toContain("error.observed")
})
