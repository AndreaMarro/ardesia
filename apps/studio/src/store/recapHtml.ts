// Product-factory (P30) — primo deliverable UMANO-LEGGIBILE: un recap.html
// autosufficiente e stampabile che il docente consegna allo studente.
// Deriva SOLO da LessonRecap (già proiettato): nessuna nuova persistenza,
// ZERO PII (il recap non contiene nomi/dati studente), e rende LEGGIBILE la
// provenienza (pagine del manuale viste = fonti). Estetica "ardesioso":
// ardesia fredda + serif da display + un accento-mobile alla Calder.
import type { LessonRecap } from "./lessonRecap"
import { formatDuration } from "./lessonRecap"
import type { StudyDigest } from "../lessonos/studyDigest"
import type { EventEvidence } from "../core/contracts/eventEnvelope"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function evidenceHtml(evidence: readonly EventEvidence[]): string {
  return evidence.length ? `<small>${evidence.map(item => `<code>${esc(item.ref)}</code> (${item.resolution === "verified" ? "verificata" : "non verificata"})`).join(" · ")}</small>` : ""
}

function digestEvidence(refs: readonly string[]): string {
  return refs.length ? `<small>${refs.map(ref => `<code>${esc(ref)}</code>`).join(" · ")}</small>` : ""
}

/** Etichette IT per i tipi di elemento Excalidraw (mai gergo tecnico). */
const ELEMENT_LABEL_IT: Record<string, string> = {
  rectangle: "rettangoli",
  ellipse: "ellissi",
  diamond: "rombi",
  arrow: "frecce",
  line: "linee",
  draw: "tratti a mano",
  text: "testi",
  image: "immagini",
  freedraw: "tratti a mano",
}

/**
 * HTML autosufficiente (CSS inline, nessuna risorsa esterna), stampabile.
 * Deterministico: stesso recap → stesso documento.
 */
export function buildRecapHtml(recap: LessonRecap, digest?: StudyDigest): string {
  const title = esc(recap.title)
  const duration = formatDuration(recap.durationMs)
  const pages = [...recap.pdfPagesViewed].sort((a, b) => a - b)
  const formulas = recap.mathFormulas

  const coveredItems: string[] = []
  for (const [type, count] of Object.entries(recap.elementTypeCounts).sort((a, b) => b[1] - a[1])) {
    if (count <= 0) continue
    coveredItems.push(`${count}&nbsp;${esc(ELEMENT_LABEL_IT[type] ?? type)}`)
  }

  const fontiHtml = recap.pdfReferences !== undefined
    ? (recap.pdfReferences.length
      ? `<ul class="fonti">${recap.pdfReferences.map(ref => `<li>${esc(ref.documentName ?? ref.documentId ?? "Documento senza nome")} — pagina&nbsp;${ref.page} ${ref.status === "observed" ? "osservata" : "importata"}${evidenceHtml(ref.evidence)}</li>`).join("")}</ul>`
      : `<p class="empty">Nessuna pagina PDF registrata in questa lezione.</p>`)
    : (pages.length
      ? `<ul class="fonti">${pages.map(p => `<li>pagina&nbsp;${p} (registrazione legacy)</li>`).join("")}</ul>`
      : `<p class="empty">Nessuna pagina PDF registrata in questa lezione.</p>`)

  const formulasHtml = formulas.length
    ? `<ul class="formule">${formulas.map((f) => `<li><code>${esc(f)}</code></li>`).join("")}</ul>`
    : ""

  const coveredHtml = coveredItems.length
    ? `<p class="covered">${coveredItems.join(" · ")}</p>`
    : `<p class="empty">Lavagna senza elementi registrati.</p>`

  const conceptsHtml = digest && digest.concepts.length
    ? `<section><h2>Concetti trattati</h2><ul class="concetti">${digest.concepts.map((c) => `<li>${esc(c.label)}${digestEvidence(c.evidence)}</li>`).join("")}</ul></section>`
    : ""
  const errorsHtml = digest && digest.errors.length
    ? `<section><h2>Errori e correzioni</h2><ul class="errori">${digest.errors
        .map(
          (e) =>
            `<li>${esc(e.label)} — <span class="${e.corrected ? "ok" : "todo"}">${e.corrected ? "corretto" : "da rivedere"}</span>${digestEvidence(e.evidence)}</li>`,
        )
        .join("")}</ul></section>`
    : ""

  const boardHtml = recap.boardTexts?.length
    ? `<section><h2>Appunti sulla lavagna</h2>${recap.boardTexts.map(item => `<p>${esc(item.text).replace(/\n/g, "<br>")}${evidenceHtml(item.evidence)}</p>`).join("")}</section>` : ""
  const hasContent = recap.totalElementsAdded > 0 || formulas.length > 0 || pages.length > 0 || Boolean(boardHtml) || Boolean(recap.pdfReferences?.length)

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Ardesia">
<title>${title} — Recap</title>
<style>
  :root { --slate:#f5f6f8; --ink:#111420; --ink-3:#5f6577; --blue:#1763ff; --ochre:#d98a1f; --viridian:#1f9e73; --line:rgba(17,20,32,.10); }
  * { box-sizing: border-box; }
  html,body { margin:0; }
  body { background:var(--slate); color:var(--ink); font-family:-apple-system,system-ui,'Segoe UI',sans-serif; line-height:1.55; }
  .sheet { max-width:720px; margin:0 auto; padding:48px 40px 64px; }
  .brand { display:flex; align-items:baseline; gap:10px; margin-bottom:28px; }
  .brand .word { font-family:'Iowan Old Style',Palatino,Georgia,serif; font-size:22px; font-weight:600; letter-spacing:.2px; }
  /* Firma Calder: dischi primari su un perno */
  .brand .mobile { position:relative; width:7px; height:7px; border-radius:50%; background:var(--blue); align-self:center; }
  .brand .mobile::before,.brand .mobile::after { content:""; position:absolute; border-radius:50%; }
  .brand .mobile::before { width:5px; height:5px; background:var(--ochre); left:9px; top:-4px; }
  .brand .mobile::after { width:4px; height:4px; background:var(--viridian); left:15px; top:2px; }
  h1 { font-family:'Iowan Old Style',Palatino,Georgia,serif; font-size:34px; line-height:1.15; margin:0 0 6px; font-weight:600; }
  .meta { color:var(--ink-3); font-size:14px; margin:0 0 36px; }
  section { margin:0 0 30px; }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:2px; color:var(--ink-3); margin:0 0 12px; font-weight:600; }
  /* Taglio di Fontana: un accento deciso sotto il titolo di sezione */
  h2::after { content:""; display:block; width:34px; height:2px; margin-top:8px; background:linear-gradient(90deg,var(--blue),transparent); transform:skewX(-24deg); }
  .covered { font-size:16px; margin:0; }
  ul { margin:0; padding:0; list-style:none; }
  .fonti li,.formule li { padding:8px 0; border-bottom:1px solid var(--line); font-size:15px; }
  .formule code { font-family:ui-monospace,'SF Mono',Menlo,monospace; font-size:13px; }
  .empty { color:var(--ink-3); font-style:italic; margin:0; }
  footer { margin-top:44px; padding-top:16px; border-top:1px solid var(--line); color:var(--ink-3); font-size:12px; }
  .print-btn { display:inline-flex; align-items:center; margin:0 0 30px; padding:8px 16px; font:inherit; font-size:13px; color:var(--blue); background:transparent; border:1px solid var(--blue); border-radius:999px; cursor:pointer; }
  .print-btn:hover { background:rgba(23,99,255,.06); }
  .notes { margin-top:6px; }
  .notes .rule { height:30px; border-bottom:1px solid var(--line); }
  .concetti li,.errori li { padding:8px 0; border-bottom:1px solid var(--line); font-size:15px; }
  .errori .ok { color:var(--viridian); font-weight:600; }
  .errori .todo { color:var(--ochre); font-weight:600; }
  small { display:block; overflow-wrap:anywhere; color:var(--ink-3); }
  @media print { body { background:#fff; } .sheet { padding:24px 0; } .print-btn { display:none; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brand"><span class="mobile" aria-hidden="true"></span><span class="word">Ardesia</span></div>
    <h1>${title}</h1>
    <p class="meta">Recap della lezione · durata ${esc(duration)}</p>
    <button class="print-btn" type="button" onclick="window.print()">Stampa · salva come PDF</button>
    ${hasContent ? "" : `<p class="empty">Questa lezione non ha ancora attività registrata.</p>`}
    <section>
      <h2>In questa lezione</h2>
      ${coveredHtml}
      ${formulasHtml}
    </section>
    ${boardHtml}
    ${conceptsHtml}
    ${errorsHtml}
    <section>
      <h2>Fonti</h2>
      ${fontiHtml}
    </section>
    <section>
      <h2>I miei appunti</h2>
      <div class="notes">${'<div class="rule"></div>'.repeat(6)}</div>
    </section>
    <footer>Generato da Ardesia dagli appunti salvati. I riferimenti distinguono importazioni e osservazioni registrate.</footer>
  </div>
</body>
</html>`
}
