# PROMPT-NEXT-CODEX-PRODUCT-RC

Sei Codex Product-RC per ARDESIA/ELAB. Riprendi da `origin/main` e non usare il checkout storico
`/Users/andreamarro/VOLUME 3/ardesia` come base di implementazione.

## Stato base

- Base verificata: `origin/main 6386e172` (`Merge pull request #143 from AndreaMarro/feat/entitlement-api-20260715`).
- #142, #143, #144 risultano `MERGED`.
- #144 non e' persa: `6386e172` ha come parent `fa6fb6ce` (#144), quindi il renderer multi-pin/esp6 e' gia'
  nella storia di `main`.
- PR recovery Codex: #145 `docs(ops): Codex post-FABLE recovery audit`, draft, CI verde alla creazione.
- Documento di recovery: `docs/ops/CODEX-POST-FABLE-RECOVERY-2026-07-15.md`.

## Regole operative

- Mai push diretto su `main`, mai force push, mai `git reset --hard`, mai `git clean -fd`, mai `git add -A`.
- Branch piccoli, max 5 file quando possibile.
- Nessun segreto, PII reale, corpus grezzo o mail/pagamenti reali.
- Nessuna dipendenza nuova senza licenza, bundle impact e alternativa documentati.
- Per visual/UI: screenshot desktop/tablet/mobile e Playwright mirato.
- Per ogni PR: `tsc -b`, vitest full x3 con exit catturato, build, pytest se FastAPI, NUL scan, secret scan,
  PII scan, `gh pr checks`; `bin/pr-merge-verify.sh` prima di merge se disponibile.

## Cosa FABLE ha gia' chiuso

- #142: Product Readiness Audit, Ownership Matrix, Release Checklist.
- #144: renderer/bridge multi-pin; `v1-cap9-esp6` a `verified-structural` 4/8 con fixture, wire paths,
  overlay/report, crop pp.71-74, test ed e2e.
- #143: servizio `services/entitlement/` FastAPI sandbox/GDPR-ready tecnico con 51 pytest.

## Prossima PR consigliata: Dashboard Docente/Scuola

Obiettivo: trasformare il cruscotto da architettura corretta ma sottoutilizzata a superficie vendibile
con grafici e grafo navigabile da event-log reale, senza PII default.

Vincoli:

- Dati derivati solo da event-log LessonOS e journal reali/sintetici di test non-PII.
- Nessun secondo store parallelo per il grafo.
- `graph.query` resta read-only e auditato.
- Classi/studenti pseudonimi; niente nomi, email, telefoni.
- UI sobria, operativa, adatta a docente/scuola, no landing page.

Test RED iniziali suggeriti:

1. `TeacherDashboardView` in live passa `journalEvents` e `focusNodeId` a `projectTeacherDashboard`.
2. La shell produce `lesson.started` e `lesson.ended` reali quando una sessione inizia/finisce.
3. Il cruscotto mostra almeno un grafico derivato da event-log non vuoto.
4. La zona grafo e' navigabile: nodo focus selezionabile, vicini visibili, `graph.query` auditata.
5. E2E Playwright dashboard desktop/tablet/mobile con fixture non-PII.

File probabili:

- `apps/studio/src/design/TeacherDashboardView.tsx`
- `apps/studio/src/lessonos/teacherDashboardProjection.ts`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/toolhost/panelHost.ts`
- test in `apps/studio/src/__tests__/` ed e2e in `apps/studio/e2e/`

## Stato prodotto sintetico

- ELABTutorPlugin: contenuti e visibilita' 8/8 presenti, ma solo 4/8 con fixture/overlay structural.
- Simulation Plugin: esp1/2/3/6 solidi structural; Vol.2 e Vol.3 breakout restano il collo di bottiglia.
- FastAPI/GDPR-ready: servizio sandbox pronto, non ancora cablato alla UI/prodotto.
- UI/UX Studente/Tutor/Scuola: shell navigabile, ma LIM/iPad e dashboard vendibile ancora aperti.
- Plugin/Skill Factory: manifest/install/signing solidi; mancano plugin utili installabili e trust story remota.

## Handoff breve

Parti dal recovery audit #145, poi apri una PR dashboard chirurgica. Non rifare esp6: e' gia' dentro `main`.
Il prossimo valore vendibile e' cruscotto docente/scuola con metriche reali, grafo navigabile, pseudonimi e zero PII.
