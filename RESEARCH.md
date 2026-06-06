# LessonOS — Research Journal (autoresearch ratchet, metodo Karpathy)
> Append-only. UNA riga per iterazione, scritta dal **driver** dopo il GATE FROZEN (`eval/gate.sh`) — è la voce AUTOREVOLE (metrica reale, non il "fatto" di Hermes).
> Hermes scrive la sua narrativa (ipotesi, cosa ha fatto, next, blocker) in `STATUS.md`. **Kimi legge la coda di ENTRAMBI prima di PLAN.**
> Ratchet: il commit sopravvive solo se gate verde (`exit=0` & `passed>=1`) e `passed` non regredisce; altrimenti `git reset --hard` automatico (status=REVERT).
> Riferimento metodo: github.com/karpathy/autoresearch (prepare.py frozen + train.py editabile + results.tsv + keep/revert via git).

| ts | iter | commit | passed | green | status | note |
|----|------|--------|--------|-------|--------|------|
| 2026-06-06T13:19:45Z | 1 | 0b8a91a | 76 | y | pass | kept; gate verde (passed=76) |
| 2026-06-06T19:33:15Z | 1 | 87539cd | 87 | y | blocked/noop | orch:HEAD invariato (244s) — vedi STATUS.md |
