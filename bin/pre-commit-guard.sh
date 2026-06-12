#!/bin/bash
# LessonOS Pre-Commit Guard
# Blocca commit con pattern noti che hanno causato regressioni ricorrenti (RETRO):
#   - seg_id inventati nei test (pattern "test-seg-" — RETRO #9 attrito #3, pattern 3x)
#   - ">=" su conteggi deterministici non giustificati (RETRO #9 attrito #4, pattern 3x)
#
# Usage: ./bin/pre-commit-guard.sh [--files <file1 file2 ...>]
#   --files Specifica i file da controllare (default: git diff --cached --name-only)
# Exit 0 = OK, 1 = bloccato (pattern trovato)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
declare -a CHECK_FILES

# Parse args
while [[ $# -gt 0 ]]; do
    case "$1" in
        --files) shift; CHECK_FILES=("$@"); break ;;
        *) echo "Usage: $0 [--files <file1 ...>]"; exit 2 ;;
    esac
done

# ── COORD-FORMAT guard (12/06: edit Hermes cancellarono CLAUDE-SAYS e corruppero 177 righe) ──
if git diff --cached --name-only | grep -q "^COORDINATION.md$"; then
  CCHK=$(git show :COORDINATION.md)
  if printf "%s" "$CCHK" | grep -qE "^([0-9]+\|)+|^\|+- |^\|+\*|^\|+#|^\|+ *$"; then
    echo "COORD-FORMAT: prefissi numerati/pipe corrotti in COORDINATION.md — riscrivi le righe INTERE e pulite, mai output numerato." >&2; exit 1
  fi
  for h in "## ➡️ PROSSIMA TASK" "## NEEDS-CLAUDE" "## CLAUDE-SAYS"; do
    HN=$(printf "%s" "$CCHK" | grep -c "^$h")
    [ "$HN" -eq 1 ] || { echo "COORD-FORMAT: heading '$h' presente $HN volte (deve essere 1)" >&2; exit 1; }
    true || { echo "COORD-FORMAT: heading mancante: $h — le sezioni di COORDINATION non si cancellano MAI." >&2; exit 1; }
  done
fi

# COORD-PINCOUNT: esattamente UNA riga pin per repo (la mantiene SOLO supervisore/promote_pin)
if git diff --cached --name-only | grep -q "^COORDINATION.md$"; then
  CPIN=$(git show :COORDINATION.md)
  for r in lessonos studio; do
    PN=$(printf "%s" "$CPIN" | grep -cE "^\|*[[:space:]]*- \*\*$r\*\*:" || true)
    if [ "$PN" -ne 1 ]; then
      echo "COORD-PINCOUNT: $PN righe pin per '$r' (deve essere 1). Hermes: chiusure in NEEDS-CLAUDE, MAI nuove righe pin." >&2
      exit 1
    fi
  done
fi

# Se nessun file specificato, usa git diff --cached (staging area)
if [[ ${#CHECK_FILES[@]} -eq 0 ]]; then
    if ! CHECK_FILES=($(git -C "$ROOT_DIR" diff --cached --name-only -- '*.py' 2>/dev/null)); then
        exit 0
    fi
fi

if [[ ${#CHECK_FILES[@]} -eq 0 ]]; then
    exit 0
fi

HAS_ERRORS=false
ERROR_MSGS=""

# ============================================================
# GUARD 1: seg_id inventati nei test
# Pattern: test-seg- (es. seg_id="test-seg-1", "seg_id": "test-seg-1")
# ============================================================
for f in "${CHECK_FILES[@]}"; do
    case "$f" in
        tests/*.py) ;;
        test_*.py)  ;;
        *) continue ;;
    esac
    full="$ROOT_DIR/$f"
    [[ ! -f "$full" ]] && continue

    # Cerca pattern seg_id="test-seg-N" o seg_id='test-seg-N'
    # Copre anche spazi: seg_id = "test-seg-1" e dict: "seg_id": "test-seg-1"
    if awk '/seg_id[[:space:]]*[=:][[:space:]]*["'"'"']test-seg-[0-9]+["'"'"']/' "$full" | grep -q .; then
        HAS_ERRORS=true
        ERROR_MSGS+="  $f: contiene seg_id inventato (test-seg-*). Usa seg_id reali dalle fixture.\n"
    fi
done

# ============================================================
# GUARD 2: ">=" su conteggi deterministici nei test
# Pattern: assert len(x) >= N | assert N <= len(x) in test file
# ============================================================
for f in "${CHECK_FILES[@]}"; do
    case "$f" in
        tests/*.py) ;;
        test_*.py)  ;;
        *) continue ;;
    esac
    full="$ROOT_DIR/$f"
    [[ ! -f "$full" ]] && continue

    lineno=0
    while IFS= read -r line; do
        lineno=$((lineno + 1))
        # Skip comment lines (anche indentate)
        if echo "$line" | grep -qE '^[[:space:]]*#'; then
            continue
        fi

        # Cerca assert >= su conteggi: len(...) >= N  oppure  N <= len(...)
        detected=false
        if echo "$line" | awk '/assert.*(len\(|count\(|n_).*>=[[:space:]]*[0-9]+/ && !/1e-|epsilon|tolerance/' | grep -q .; then
            # Pattern: assert len(x) >= N
            detected=true
        fi
        if echo "$line" | awk '/assert.*[0-9]+[[:space:]]*<=[[:space:]]*(len\(|count\(|n_)/' | grep -q .; then
            # Pattern: assert N <= len(x)
            detected=true
        fi

        if $detected; then
            # Verifica eccezione: non-deterministic / LLM / timestamp
            if echo "$line" | grep -qiE '#[[:space:]]*(non-deterministic|not deterministic|LLM|timestamp|floating)'; then
                continue
            fi
            HAS_ERRORS=true
            ERROR_MSGS+="  $f:$lineno: '$line' — usa '>=' su conteggio. Se deterministico, usa '== N'. Se non lo è, aggiungi commento '# non-deterministic'.\n"
        fi
    done < "$full"
done

# ============================================================
# Output
# ============================================================
if $HAS_ERRORS; then
    echo "❌ PRE-COMMIT GUARD BLOCKED — pattern ricorrenti trovati:"
    printf "%b" "$ERROR_MSGS"
    echo ""
    echo "Se sai cosa stai facendo, salta con: git commit --no-verify"
    exit 1
fi


exit 0
