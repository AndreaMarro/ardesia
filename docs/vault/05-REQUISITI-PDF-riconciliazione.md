# ARDESIA — Requisiti (PDF specifiche) ↔ già-fatto: riconciliazione (16/06/2026)

PDF letto interamente (`_inbox/01-specifiche-funzionali.pdf`, 16 pp): **"Piattaforma di Tutoring Online con Lavagna Estendibile" — Specifiche Funzionali v1.0 (bozza)**, placeholder *TutorBoard* → **ardesia**. Contiene: attori, RF moduli A-L, RNF, modello-dati §5, **SDK plugin §6**, flussi §7, scope §8, legale §9, roadmap §10, metriche §11. Collegato a [[03-UNIFICAZIONE-tutto-il-fatto]] · [[02-METAPIANO-ardesia]].

## Cosa CONFERMA (allineato a visione + già-fatto)
- **3 pilastri:** Booking · Aula virtuale (video 1:1 + lavagna) · **Ecosistema plugin** (il differenziatore).
- **Plugin (RF-G + §6 SDK):** mini-webapp in **iframe sandbox a origin separato** (`*.plugins.*`), comunica SOLO via postMessage/**SDK** (`sdk.ready/state.set+onChange`[CRDT=RF-G-03]/`context.get`[no-PII]/`canvas.exportSnapshot`/`ui.resize`); manifest (id/version/subjects/permissions/price/sdkVersion); bundle **immutabile+versionato+firmato**; CSP restrittiva; **pipeline revisione** (scan statico→sandbox-test→manuale→publish); **kill switch**; revenue-share **70/30**. → **matcha il ToolHost già fatto** (ed25519/sandbox/kill-list) ed è il contratto per `packages/plugin-sdk`. Stato plugin = **sotto-albero del CRDT della lavagna** (sync/persistenza/undo gratis).
- **§10 rationale = la nostra strategia "due piccioni":** plugin **first-party nell'MVP** per validare l'UX-widget e **stabilizzare l'API interna PRIMA di congelarla in SDK pubblico** → **ELAB-sim primo plugin**. Lo spec lo formalizza esattamente.
- **Già coperti:** Scheda-studente+storico (RF-D = CRM) · **PDF riepilogo post-lezione (RF-I) = lessonos `recap_export` esiste** · lavagna persistente riusabile (RF-F-07) · GDPR Mode A / minori<14 (D.lgs 101/2018) / dati-UE / WCAG 2.1 AA / audit-log immutabili.
- **Modello dati §5:** User-Role · Availability · Booking · **Lesson(teacher,student,subject,whiteboard,summary_pdf)** · **StudentRecord(notes_private,goals)** · Whiteboard-Page-**CRDTDocument** · Plugin-PluginVersion(manifest,review_status) · Payment(fee_platform) · Payout · Review/PluginReview.

## ⚠️ CONFLITTO da ratificare (max onestà)
**PDF RF-J-02: "commissione 15-20% sulle lezioni"** + escrow (RF-C-03) + take-rate (RF-L-02) **↔ Andrea (audio + ratificato): ZERO-fee sulle lezioni** ("lo strumento non fa l'esattore"; ricavi = SaaS abbonamento docente + marketplace). Il PDF è "bozza v1.0" → **vince Andrea.** Riconciliazione: la piattaforma può ancora **processare** i pagamenti lezione (escrow/payout restano per UX+dispute) ma **commissione 0% sulle lezioni**; ricavi = **SaaS docente + revenue-share 70/30 sui plugin** (RF-H resta). → emendare RF-J-02 / RF-L-02. **Ratifica Andrea.**

## Divergenza strategica (non conflitto)
**lessonos (AI-metodologica: grafo-del-metodo, StyleProfile, betweenness, dispense-nel-tuo-stile) è OLTRE lo spec.** Il PDF tiene l'AI leggera (RF-I-05 riepilogo-AI opzionale = fase 3) e **§8 mette "dispense/corsi vendibili" FUORI scope-v1**. → lessonos è il **differenziatore profondo di Andrea oltre "Superprof+lavagna+plugin"**; il flagship grafo→suggerisci-tool ci vive. **Decisione: mantenere lessonos come layer strategico, non degradare allo spec.**

## Matrice requisiti → già-fatto / greenfield
| Pilastro / Modulo | Stato | Dove (monorepo) |
|---|---|---|
| Lavagna RF-F (tools, canvas infinito, persistente, export PDF, permessi, LaTeX) | ~costruito | `apps/studio` |
| Plugin-host RF-G + SDK §6 (install, widget-canvas, state-sync, sandbox, kill) | ToolHost T0-T3 fatto; SDK da formalizzare | `packages/toolhost` + `packages/plugin-sdk` |
| Plugin first-party (RF-G-08, MVP) | ELAB-sim Blink fatto | `plugins/elab-tutor` |
| Riepilogo PDF RF-I | fatto (recap_export) | `packages/engine` (lessonos) |
| CRM scheda-studente RF-D | primitive engine; StudentRecord-prodotto da costruire | `packages/crm` + engine |
| **AI-metodologica (oltre-spec)** | M0-M4 fatti; flagship grafo→tool da fare | `packages/engine` + `packages/graph-suggest` |
| Account/profili/ruoli RF-A | **GREENFIELD** | nuovo |
| Calendario/disponibilità RF-B | **GREENFIELD** | `packages/booking` |
| Ricerca/prenotazione RF-C | **GREENFIELD** | `apps/web` + booking |
| Aula video WebRTC RF-E | **GREENFIELD** | nuovo (WebRTC self-host EU) |
| Pagamenti RF-J (escrow/payout/KYC, 0% lezioni) | **GREENFIELD** | `packages/payments` |
| Notifiche RF-K / Admin RF-L | **GREENFIELD** | nuovo |

**Lettura onesta:** il già-fatto copre il **cuore-differenziatore** (lavagna + plugin-host + AI-engine = i pezzi difficili/unici). Manca il **layer commerce/booking/video** dell'MVP-spec (account/calendario/ricerca/pagamento/WebRTC) = greenfield, ma plumbing SaaS "standard".

## Impatto su monorepo / roadmap
- Aggiungere al monorepo `ardesia`: `packages/{booking,payments,identity}` + `apps/web` (marketplace/booking/profili) + integrazione **video WebRTC self-host EU** (valutare LiveKit/Daily-self-host per GDPR).
- Roadmap PDF (MVP T0+4m / F2 +8m / F3 +12m) vs nostra: **partiamo avvantaggiati** — lavagna+plugin-host+engine GIÀ fatti = parte dell'MVP + oltre. MVP-residuo = **booking+video+account+payment**.
- L'**SDK pubblico §6 si congela DOPO i first-party** (ELAB) = la nostra Fase 2. Coerente.

## Aperti / ratifica per Andrea
1. **Zero-fee vs commissione lezioni** (sopra) — decisione business.
2. **WebRTC**: provider self-host EU (GDPR).
3. **lessonos AI-metodologica** come differenziatore oltre-spec — conferma (raccomandato: sì).
4. CRDT lavagna: confermare che `apps/studio` usa/userà CRDT (richiesto da RF-F + plugin-state §6.3).
