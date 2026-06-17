# script-errori-mascherati

Uno script ops che INGOIA il proprio errore mente al chiamante: cron/supervisore vede
"successo" e procede su stato corrotto. È il gemello shell di `commit-per-sottotask`
(lì il lavoro sparisce; qui il fallimento sparisce). Classe ricorrente del 2026-06-17
(>=5 occorrenze in 1 giorno, script distinti) NON coperta da nessuna skill esistente.

## When-to-apply

- Ogni diff su `bin/*.sh`, `.github/workflows/*.yml`, o qualunque entrypoint cron/driver.
- In review: ogni `|| true`, `exit 0` finale, `2>/dev/null`, `errors="replace"`, lock fatto a mano.
- Quando un comando può fallire e il suo rc decide se il passo a valle è sicuro.

## Checklist/Procedura

- [ ] **Niente `exit 0` / `|| true` che maschera il rc reale**: propaga (`exit $?`) o
  fallisci esplicito. Esempio VERO: `bin/adversarial.sh:8` finisce con `... || true`
  poi `exit 0` — se `adversarial.py` lancia eccezione lo script esce 0 e l'adjudication
  parte su report mancante (H2 9ac7de9:9). `|| true` su `driver-orch.sh:72`+`driver-studio.sh:72`
  maschera TUTTI gli errori di `architect.sh`, non solo il nop atteso (H2 9619331): usa
  exit code distinti (0=procedi, 1=blocca, 2=nop) e fallisci su 1.
- [ ] **`set -euo pipefail` in testa** a ogni script nuovo; dove un fallimento è atteso,
  gestiscilo con `|| { log; azione }` MIRATO sul singolo comando, mai globale.
- [ ] **Comando inline che può non esistere → guardia, non default silenzioso**: Esempio
  VERO `bin/replenish.sh:93` — `python3` inline senza guardia: se `python3` manca `key=""`,
  il test `-n` passa silenzioso e `grep` cerca pattern vuoto (H2 150edd1:7). Fix:
  `command -v python3 >/dev/null || die "python3 required"`.
- [ ] **Lock = atomico, mai `test -f` + write**: due processi leggono `-f` falso e
  scrivono entrambi il PID. Esempio VERO: `bin/hermes2-adjudicate.sh:32` usa `kill -0` su
  PID salvato; se il proc crasha senza pulire, il nuovo sovrascrive e due istanze
  aggiudicano lo stesso report (H2 9ac7de9:5); stesso difetto `bin/replenish.sh` (8a5aab1).
  Fix: `ln -s "$$" "$LCK" 2>/dev/null || exit 0` oppure `flock` su fd.
- [ ] **`errors="replace"` / `2>/dev/null` nascondono il bug, non lo risolvono**: Esempio
  VERO `tests/test_skills_frictions.py:67-77` — `errors="replace"` su output che può avere
  surrogate escape maschera l'encoding mismatch e perde la diagnostica (H2 a8ee748:9). Usa
  `errors="strict"` per far esplodere il problema. `2>/dev/null` solo su comando il cui
  fallimento è davvero benigno, mai su quello che decide il flusso.
- [ ] **CI: timeout/cancel non devono confondersi con "passed"**: Esempio VERO
  `.github/workflows/gate.yml:19` — `timeout-minutes:25` senza retry su step `uv sync`:
  hang di rete muore silenzioso e il bot non ha feedback (H2 946bc19); `cancel-in-progress`
  su push rapidi a `auto/main` killa il gate a metà. Isola il timeout sullo step di rete e
  distingui kill/timeout da fail nei log.

## Origine-RETRO

- H2 adversarial 2026-06-17: 9ac7de9 (`adversarial.sh:8` exit 0 + `hermes2-adjudicate.sh:32`
  lock race), 9619331 (`driver-orch/studio.sh:72` `|| true` larga), 150edd1
  (`replenish.sh:93` python3 silenzioso), 8a5aab1 (lock `test -f`+write), 946bc19
  (gate.yml timeout/cancel silenti), a8ee748 (`errors="replace"` maschera encoding).
- Classe distinta dalle 4 del giorno e dalle skill code/test/docs: nessuna copriva la
  robustezza degli script ops, dove un rc ingoiato si propaga a cron/supervisore.
