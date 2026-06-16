# Checklist di riconciliazione SSOT — PROPOSTA O2 (15/06/2026, NON deployata)

Obiettivo: rendere VERA e VERIFICABILE la frase della carta §4 "i prompt puntano qui via AGENTS.md".
Tutto cio' che segue e' PROPOSTO; nessuna modifica e' stata applicata (READ-ONLY assoluto sul Mini).

## 0. Stato verificato al 15/06/2026 (FATTI, file:riga)
| Sorgente | Builder dichiarato | Coerente con carta? | Evidenza |
|---|---|---|---|
| Carta `ARDESIA-ALIGNMENT.md:24` | opus-4-8 (-> sonnet); DeepSeek=stale | (e' la carta) | copia locale `ardesia-audit-2026-06-15/mini/ARDESIA-ALIGNMENT.md` |
| `routes.env` (Mini) | `ROUTE_BUILDER="claude-opus-4-8 claude-sonnet-4-6"` | SI | probe ssh read-only |
| `~/lessonos/AGENTS.md` (Mini) | "DeepSeek v4-flash = ORCHESTRATORE PRINCIPALE + BUILDER" | **NO** | `ls`: 12296B mtime Jun13 07:37 (vedi nota A) |
| `maestro-mirror/lessonos/AGENTS.md` (MacBook) | idem riga 9 | **NO** | grep riga 9; 11882B Jun8 |
| `maestro-audit/orch/AGENTS.md` (MacBook) | idem riga 9 | **NO** | grep riga 9; 12296B Jun12 |
| AGENTS.md -> riferimento a ALIGNMENT? | nessuno | **NO (gap)** | `grep -l ALIGNMENT` = 0 match su entrambi i mirror |

Conclusione: carta + routes.env CONCORDANO (builder=opus); i 3 AGENTS.md CONTRADDICONO (DeepSeek-builder) e
NON puntano alla carta. La riconciliazione corregge gli AGENTS.md verso la carta + aggiunge l'header.

## 1. Inventario dei file da allineare (Mini + MacBook)
> Da fare a cura di Andrea / con un comando mutante sul Mini (qui NON eseguito).

### Mini (utente progettibelli) — SORGENTE LIVE, ha la precedenza operativa
- [ ] `~/lessonos/AGENTS.md` — prepend header SSOT (sezione A) + riformula riga-9 (sezione B). **File live.**
- [ ] `~/maestro-docs/ARDESIA-ALIGNMENT.md` — sostituire con `proposta-ALIGNMENT-riconciliata.md` (dopo ratifica). Bump `ARDESIA-SSOT-CHARTER v=2026-06-15`.
- [ ] `~/lessonos/routes.env` — gia' allineato (builder=opus). VERIFICARE che resti tale; nessuna modifica necessaria oggi.
- [ ] **DISCOVERY**: `find ~ -name AGENTS.md` sul Mini per scoprire eventuali AGENTS.md di altri repo (es. `studio`, `orch`) non presenti nei mirror MacBook. Se esistono, aggiungerli a questa lista e applicare header+riformulazione.

### MacBook (mirror/copie, allineare per consistenza, NON sono i file live)
- [ ] `/Users/andreamarro/maestro-mirror/lessonos/AGENTS.md` — header + riga-9.
- [ ] `/Users/andreamarro/maestro-audit/orch/AGENTS.md` — header + riga-9.
- [ ] (la carta riconciliata vive nel vault `_proposte/` finche' non ratificata; poi diventa la copia di riferimento MacBook.)

Nota A (onesta sull'incertezza): il contenuto integrale di `~/lessonos/AGENTS.md` sul Mini NON e' stato letto
riga-per-riga in questo audit (solo `ls` per size/mtime + grep sulle copie mirror MacBook). Inferenza ALTA-confidenza
che la riga-9 sia identica: stessa dimensione 12296B del mirror `maestro-audit/orch/AGENTS.md` (che ha la riga-9
stale verificata) e stesso lineage. Da confermare con un `grep -n` read-only sul Mini prima di applicare.

## 2. Cosa cambiare in ciascun AGENTS.md (operazione, identica per tutti)
1. Prepend del blocco `ARDESIA-SSOT-HEADER` (8 righe, vedi `AGENTS-header-da-prependere.md` §A) come prime righe, SOLO se assente.
2. Riformulare la riga "DeepSeek ... = ORCHESTRATORE PRINCIPALE + BUILDER" -> versione riconciliata (§B): Hermes=orchestratore/motore, build prodotto=Claude opus via `worker.sh`.
3. Lasciare invariate righe 10-11 (review decorrelata Claude; escalation build a `worker.sh opus`): gia' coerenti.
4. NON copiare la tabella ruoli/modelli dentro l'AGENTS.md (rimandare a carta §2).

## 3. Lint READ-ONLY che rende "la leggono tutti" verificabile — `eval/lint-ssot.sh` (PROPOSTO, NON deployare)
> NON tocca `eval/gate.sh`. Advisory finche' Andrea non lo promuove a pre-commit/CI. Exit!=0 = un AGENTS.md viola la SSOT.

```bash
#!/usr/bin/env bash
# eval/lint-ssot.sh — verifica che ogni AGENTS.md sia subordinato alla carta. READ-ONLY.
# Uso: ./eval/lint-ssot.sh [root]   (default root = $HOME)
# Exit 0 = tutti conformi. Exit 1 = almeno una violazione (stampata).
set -uo pipefail
ROOT="${1:-$HOME}"
CHARTER_VER="2026-06-15"   # deve combaciare con ARDESIA-SSOT-CHARTER v= nella carta
fail=0
# Scopri tutti gli AGENTS.md sotto root (esclude node_modules/.git)
while IFS= read -r f; do
  # (a) header SSOT presente?
  if ! grep -q 'ARDESIA-SSOT-HEADER START' "$f"; then
    echo "VIOLAZIONE [no-header]: $f manca dell'header SSOT (vedi _proposte/AGENTS-header-da-prependere.md)"
    fail=1
  else
    # (a2) header alla versione giusta?
    if ! grep -q "ARDESIA-ALIGNMENT v=${CHARTER_VER}" "$f"; then
      echo "WARN [header-stale]: $f punta a una versione di carta diversa da ${CHARTER_VER}"
    fi
  fi
  # (b) ridichiarazione vietata: DeepSeek come builder PRINCIPALE del codice-prodotto
  #     (regex tollerante a maiuscole/spazi; cattura la frase stale storica)
  if grep -Eiq 'deepseek[^\n]{0,60}(orchestratore principale|=)[^\n]{0,20}builder' "$f" \
     && ! grep -Eiq 'fallback|motore|grind|worker\.sh opus' "$f"; then
    echo "VIOLAZIONE [deepseek-builder]: $f assegna a DeepSeek il ruolo di builder principale (contraddice carta §2)"
    fail=1
  fi
done < <(find "$ROOT" -name AGENTS.md -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null)
[ "$fail" -eq 0 ] && echo "lint-ssot: OK — tutti gli AGENTS.md sono subordinati alla carta v=${CHARTER_VER}"
exit $fail
```

Note sul lint:
- (b) e' volutamente conservativo: la regex "deepseek...builder" SENZA le parole di salvaguardia (fallback/motore/grind/worker.sh opus) = violazione. La riga-9 riformulata (§B) contiene "fallback"+"worker.sh opus" -> PASSA. La riga-9 stale -> FALLISCE. Questo e' il test che avrebbe segnalato la contraddizione odierna.
- Idempotenza header rilevata via `ARDESIA-SSOT-HEADER START`.
- Mismatch di versione = WARN (non blocca) cosi un bump di carta non rompe la CI ma resta visibile.

## 4. Verifica post-applicazione (definizione di DONE per la riconciliazione)
- [ ] `find ~ -name AGENTS.md | xargs grep -L 'ARDESIA-SSOT-HEADER START'` -> output VUOTO (tutti hanno l'header).
- [ ] `grep -rl ALIGNMENT $(find ~ -name AGENTS.md)` -> elenca TUTTI gli AGENTS.md (la §4 della carta diventa vera).
- [ ] `eval/lint-ssot.sh ~` -> exit 0.
- [ ] `routes.env` ROUTE_BUILDER ancora = opus (nessuna regressione di routing).
- [ ] (opzionale, dopo OK Andrea) aggiungere `eval/lint-ssot.sh` a un hook pre-commit o a un tick dell'audit 2x/g come check advisory.

## 5. Cosa NON fare (paletti)
- NON modificare `eval/gate.sh` ne i test del gate frozen.
- NON copiare la tabella modelli dentro gli AGENTS.md (duplicazione = causa originaria della deriva).
- NON applicare nulla sul Mini senza ratifica di Andrea: questi file sono PROPOSTE.
