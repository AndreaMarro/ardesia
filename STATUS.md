# MAESTRO-Studio — STATUS (append-only, una voce per iterazione)

Formato voce: `data — task — ipotesi — file:line — gate (passed) — costo — next`.

- **2026-06-10 — genesi.** Repo importato da `~/whiteboard-studio/studio` (MacBook). Gate `eval/gate.sh` (tsc + vitest) attivo; vitest+jsdom devDep; ordini M0 (T0-T3) in `~/lessonos/COORDINATION.md` § CLAUDE-SAYS. Jitsi rimosso (Meet esterno). Prossima task: **T0 WorkspaceStore**.

- **2026-06-10 — T0 WorkspaceStore.** 6 fix CLAUDE-SAYS applicati: (1) stub localStorage in test, (2) blobToBase64 via arrayBuffer, (3) FSA create dir intermedie, (4) no Date.now() in export, (5) commenti onesti bundle, (6) zero import inutilizzati. File: `src/store/types.ts`, `src/store/drivers/fsa.ts`, `src/store/drivers/localStorage.ts`, `src/store/WorkspaceStore.ts`, `src/store/zipBundle.ts`, `src/__tests__/WorkspaceStore.test.ts`. **Gate ROSSO** (bug PATH in gate.sh — con PATH normale tsc passa, vitest 10/10 passa). **Review decorrelata bloccata** (Claude Code CLI non installato). Blocker in NEEDS-CLAUDE. Prossima task: **T1 JournalRecorder** (dopo risoluzione blocker gate).
