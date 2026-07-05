// LessonOS C1 — Config manuali ELAB reali.
//
// Le chiavi sono documentId content-addressed con la STESSA semantica del
// runtime `loadFile.pdfToImages`: `document:sha256:<sha256 hex lowercase
// dell'intero file PDF>`. Nessun path locale: l'identità è il contenuto, quindi
// la config è portabile ovunque il docente carichi lo stesso file.
//
// Provenienza (verifica firsthand 2026-07-04, `shasum -a 256` + lettura PDF):
// - "MANUALE VOLUME 2 ITALIANO.pdf" (17.281.111 byte, 116 pagine):
//   il footer stampato coincide con l'indice pagina PDF (pageOffset 0).
// - "Manuale vol 3 versione 0.13.pdf" (20.663.651 byte, 172 pagine):
//   footer stampato == indice pagina PDF (pageOffset 0).
//
// Copie canoniche cartella "VOLUMI pdf e MD" (verifica firsthand 2026-07-05,
// shasum -a 256 + footer p.30 == indice PDF letto a vista su ogni file):
// - "MANUALE VOLUME 1 ITALIANO.pdf" (25.324.990 byte, 114 pagine)
// - "MANUALE VOLUME 2 ITALIANO.pdf" (17.289.808 byte, 116 pagine) — binario
//   DIVERSO dalla copia root con lo stesso nome: entrambe le entry restano
//   valide (stesso manual:vol2), l'identità è il contenuto.
// - "Manuale vol 3 versione 0.16.pdf" (21.166.639 byte, 172 pagine) — v0.16,
//   la v0.13 resta valida per i PDF già distribuiti.
//
// Aggiornare un manuale = nuova entry con il nuovo hash (il vecchio hash resta
// valido per i PDF già distribuiti). Hash non presente → il registry risolve
// undefined e NESSUN material.cited viene emesso (fail-closed).

import type { ManualRegistryEntry } from "./manualRegistry"

export const ELAB_MANUAL_ENTRIES: Record<string, ManualRegistryEntry> = {
  "document:sha256:31431a4b8af6784444e1d29121536248c7a84876b0cff139a94b1a14c758272a": {
    manualId: "manual:vol2",
    title: "ELAB Volume 2",
    pages: [1, 116],
  },
  "document:sha256:6b20832c245be960c62a513ceb233cf04b2443d3206b46fdcc23a327adebab21": {
    manualId: "manual:vol3",
    title: "ELAB Volume 3",
    pages: [1, 172],
  },
  "document:sha256:97ebc86e7e6014d05eebdec33dc3fbf62f96d1853b7a31641f08067685c9a5c8": {
    manualId: "manual:vol1",
    title: "ELAB Volume 1",
    pages: [1, 114],
  },
  "document:sha256:1eac0cc711426cbc5afb4f35d6c5d8b9ba44513b92134da0c483c6b1d4281b37": {
    manualId: "manual:vol2",
    title: "ELAB Volume 2",
    pages: [1, 116],
  },
  "document:sha256:95a690ca3c1ee5ddec051447994638aef825e58a4835815a4e97ded66fc04bd4": {
    manualId: "manual:vol3",
    title: "ELAB Volume 3",
    pages: [1, 172],
  },
}
