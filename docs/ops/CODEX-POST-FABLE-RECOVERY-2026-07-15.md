# CODEX POST-FABLE RECOVERY - 2026-07-15 label, verificato 2026-07-07

Recovery audit eseguito da Codex Product-RC dopo interruzione credito FABLE. Nota data:
i documenti e branch NOTTE-15 usano label `2026-07-15`, ma i merge GitHub osservati in questa
sessione hanno timestamp reali `2026-07-07T10:16-10:22Z`.

## 1. Base operativa verificata

Worktree usata per la verifica: `/Users/andreamarro/VOLUME 3/ardesia-wt-merge-verify`.

- `git status --short --branch` iniziale: `## HEAD (no branch)` pulita.
- `git log -1 --oneline origin/main`: `6386e172 Merge pull request #143 from AndreaMarro/feat/entitlement-api-20260715`.
- `gh pr list -R AndreaMarro/ardesia --state open`: solo draft storiche `#1`, `#2`, `#4`, `#5`, `#6`.
- `gh pr list -R AndreaMarro/ardesia --state all --limit 20`: `#144`, `#143`, `#142` risultano `MERGED`.
- `git log --oneline --decorate --graph -8 origin/main` mostra `6386e172` con parent `fa6fb6ce` (#144) e `44f2e86e` (#143 branch).

Conclusione: `origin/main` a `6386e172` contiene anche il merge #144. Il fatto che #144 non sia aperta
non indica perdita: #144 e' stata merged prima di #143, poi #143 ha chiuso la testa di `main`.

## 2. PR FABLE ricostruite

### #142 - Product readiness audit

- PR: `docs(ops): PR1 Product Readiness Audit NOTTE-15`.
- Branch: `docs/product-readiness-20260715`.
- Commit branch: `602e2786`.
- Merge commit: `1cb7a813`.
- Stato GitHub: `MERGED`.
- File aggiunti:
  - `docs/ops/PRODUCT-READINESS-AUDIT-2026-07-15.md`
  - `docs/ops/OWNERSHIP-MATRIX-2026-07-15.md`
  - `docs/ops/RELEASE-CHECKLIST-PRODUCT-RC.md`

Audit utile ma scritto su baseline `755179c8` pre-#143/#144: alcune criticita' sono ora superate
da FastAPI entitlement e renderer multi-pin.

### #144 - Renderer multi-pin + esp6

- PR: `feat(sim): multi-pin renderer+bridge - v1-cap9-esp6 lampada RGB verified-structural (4/8)`.
- Branch: `feat/multipin-scene-esp6-20260715`.
- Commit branch: `7ee5ff9f`.
- Merge commit: `fa6fb6ce`.
- Stato GitHub: `MERGED`.
- Worktree locale `/Users/andreamarro/VOLUME 3/ardesia-wt-notte15`: pulita, allineata a `origin/feat/multipin-scene-esp6-20260715`.
- `git log --oneline origin/main..feat/multipin-scene-esp6-20260715`: vuoto.

Contenuto recuperato dentro `main`:
- fixture `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json`;
- bridge multi-pin in `apps/studio/src/toolhost/elabSceneBridge.ts`;
- renderer potenziometro/RGB/resistori generalizzati in `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`;
- catalogo post-it `v1-cap9-esp6` in `apps/studio/src/toolhost/elabExperimentCatalog.ts`;
- overlay/report `docs/ops/overlays/v1-cap9-esp6-{overlay.png,report.json}`;
- crop manuale pp.71-74 in `apps/studio/public/elab/manuals/vol1/`;
- e2e `apps/studio/e2e/sim-esp6-rgb.spec.ts`;
- test unitari `ElabSceneEsp6.test.ts` e `ToolCanvasEsp6.test.tsx`.

Stato prodotto: PR2 e' sostanzialmente completata per la richiesta recovery. Resta fuori scope #144
solo il wiper interattivo/regolabile e la promozione `verified-human` dopo review umana.

### #143 - FastAPI entitlement

- PR: `feat(entitlement): FastAPI service GDPR-ready (sandbox) - PR7 NOTTE-15`.
- Branch: `feat/entitlement-api-20260715`.
- Commit branch: `44f2e86e`.
- Merge commit: `6386e172`.
- Stato GitHub: `MERGED`.
- Worktree locale `/Users/andreamarro/VOLUME 3/ardesia-wt-fastapi15`: pulita, allineata a `origin/feat/entitlement-api-20260715`.
- `git log --oneline origin/main..feat/entitlement-api-20260715`: vuoto.

Contenuto recuperato dentro `main`:
- nuovo servizio `services/entitlement/` con FastAPI;
- endpoint sandbox license/register, redeem, token issue/redeem, revoke, access, GDPR export/delete/purge;
- store astratto + FileStore;
- audit JSONL hash-only;
- mail sink sandbox JSONL;
- test pytest dichiarati nella PR: 51 passed.

Stato prodotto: il servizio backend esiste ed e' testato come sandbox. Manca ancora il cablaggio UI/prodotto:
feature gate reali nello Studio, flusso Tutor 15 euro, Scuola, e integrazione con eventuale provider pagamenti/email
restano da fare in PR separate.

## 3. Lavoro #144: recuperabile o perso?

Nessun lavoro perso rilevato.

- PR #144 e' merged.
- Remote branch `origin/feat/multipin-scene-esp6-20260715` esiste.
- Local branch `feat/multipin-scene-esp6-20260715` esiste nella worktree `ardesia-wt-notte15`.
- La worktree e' pulita.
- Il diff `origin/main..feat/multipin-scene-esp6-20260715` e' vuoto: non ci sono commit extra fuori da main.

Se servisse riprendere da #144 senza sovrascrivere nulla:

1. Usare `origin/main` come base, non la worktree storica `/Users/andreamarro/VOLUME 3/ardesia`.
2. Creare un branch nuovo, per esempio `feat/esp6-wiper-interactive-20260715`.
3. Leggere i file gia' merged da #144 e aggiungere solo il delta desiderato.
4. Non cherry-pickare `7ee5ff9f`: e' gia' antenato di `origin/main`.

## 4. Cosa manca davvero dopo #143/#144

Priorita' prodotto ancora aperte, ordinate per rischio vendibilita':

1. Dashboard docente/scuola: architecture `event-log`/`graph.query` esiste, ma il live resta incompleto.
   I punti da verificare/fissare sono producer `lesson.started/lesson.ended`, passaggio di `journalEvents`
   e `focusNodeId` al projector, grafici veri e grafo navigabile.
2. UI/UX LIM+iPad: audit #142 segnala touch target, ElabLab non touch-first, pannello assoluto 360px,
   e problema visuale dei token CSS nel plugin canvas. Serve PR visuale con screenshot desktop/tablet/mobile.
3. Student Pack Pro/GDPR-ready: student pack round-trip esiste, FastAPI sandbox esiste, ma mancano preview import
   completa, retention/audit trail prodotto nello Studio e scan PII dedicato.
4. Plugin/Skill Factory: manifest/install/signing sono solidi; mancano due plugin utili installabili con evidenza
   end-to-end e trust anchor/marketplace story non locale.
5. Vol.2 condensatore e Vol.3 breakout: restano static-only o quarantena caratterizzata; esp6 porta la parita'
   visiva a 4/8, non a 8/8.

## 5. Bug piccolo corretto in questa recovery

La matrice `docs/ops/ELAB-VISIBLE-EXPERIMENTS-VISUAL-REFERENCE-MATRIX-2026-07-13.md` era gia' aggiornata
a `verified-structural` 4/8 per esp6, ma nella cella simulazione conservava una frase pre-#144:
`bridge/renderer ancora fail-closed su multi-pin`.

Correzione applicata: la cella esp6 ora dichiara il renderer multi-pin e il bridge sbloccati in NOTTE-15
e lascia come gap solo wiper regolabile/review umana.

## 6. Handoff operativo

Base consigliata per il prossimo branch: `origin/main` a `6386e172`.

Prossima PR chirurgica consigliata: Dashboard docente/scuola, non altro esp6. Test RED attesi:

- `TeacherDashboardView` deve ricevere `journalEvents` e `focusNodeId` in live.
- `Room` o shell deve produrre `lesson.started` e `lesson.ended` reali, non solo commenti stand-in.
- Vista docente deve mostrare almeno un grafico derivato da event-log reale e un grafo navigabile da `graph.query`
  senza PII default.
- Playwright deve catturare dashboard desktop/tablet/mobile con dati sintetici non-PII e non demo finta.

CoV minima per quella PR: `tsc -b`, vitest full x3 con exit catturato, build, Playwright mirato,
NUL scan, secret scan, PII scan se introdotto, `gh pr checks`, `bin/pr-merge-verify.sh` se disponibile.
