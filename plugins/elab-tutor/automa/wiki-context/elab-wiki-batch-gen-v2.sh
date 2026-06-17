#!/bin/bash
# ELAB Wiki concept batch generator v2 (Mac Mini autonomous)
# Sprint S iter 2 ralph loop iter 18 — Andrea richiesta:
# "mac mini deve basarsi di più sui volumi (valuta l'idea)"
# "per macmini fai passare in rassegna i volumi e il materiale in tres jolie"
#
# v2 injects volumi text excerpt as PRIMARY source in claude --print prompt.
# Forces concept generation to ANCHOR in volumi content + cite Vol.X pag.Y.
#
# Volumi text source: automa/wiki-context/volumi-text/vol{1,2,3}.txt
# (pre-extracted on MacBook via pdftotext, committed to repo)

set -uo pipefail
eval "$(/opt/homebrew/bin/brew shellenv)"

CONCEPTS="$1"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_DIR="$HOME/Library/Logs/elab"
LOG_FILE="$LOG_DIR/wiki-batch-v2-$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

REPO="$HOME/Projects/elab-tutor"
cd "$REPO"

# Sprint S iter 23 fix: volumi-text vive su feature branch, non main.
# Fetch latest origin + checkout feature branch (auto-track if missing).
FEATURE_BRANCH="feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26"
git fetch origin --quiet 2>>"$LOG_FILE"
git checkout "$FEATURE_BRANCH" 2>>"$LOG_FILE" || git checkout -b "$FEATURE_BRANCH" "origin/$FEATURE_BRANCH" 2>>"$LOG_FILE"
git pull origin "$FEATURE_BRANCH" --quiet 2>>"$LOG_FILE" || true

VOLUMI_DIR="$REPO/automa/wiki-context/volumi-text"
if [ ! -d "$VOLUMI_DIR" ]; then
    echo "ERROR: $VOLUMI_DIR mancante anche su $FEATURE_BRANCH. Verifica branch+commit." >> "$LOG_FILE"
    exit 1
fi

BATCH_BRANCH="mac-mini/wiki-concepts-batch-v2-$TIMESTAMP"
git checkout -b "$BATCH_BRANCH" 2>>"$LOG_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BATCH_V2_START concepts=[$CONCEPTS] branch=$BATCH_BRANCH" >> "$LOG_FILE"

GENERATED=0
FAILED=0
for CONCEPT in $CONCEPTS; do
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] GEN_START $CONCEPT" >> "$LOG_FILE"

  if [ -f "docs/unlim-wiki/concepts/$CONCEPT.md" ]; then
    echo "  SKIP_EXISTS" >> "$LOG_FILE"
    continue
  fi

  # Convert concept slug to search terms (kebab-case → space-separated lowercase)
  CONCEPT_SEARCH=$(echo "$CONCEPT" | tr '-' ' ')

  # Extract relevant excerpts from each volume (~30 lines context per match)
  VOLUMI_EXCERPT=""
  for VOL in 1 2 3; do
      VOL_FILE="$VOLUMI_DIR/vol${VOL}.txt"
      [ ! -f "$VOL_FILE" ] && continue
      MATCHES=$(grep -B5 -A25 -i "$CONCEPT_SEARCH" "$VOL_FILE" 2>/dev/null | head -150)
      if [ -n "$MATCHES" ]; then
          VOLUMI_EXCERPT="${VOLUMI_EXCERPT}

=== ESTRATTO VOL.${VOL} (rilevante per ${CONCEPT}) ===
${MATCHES}
=== FINE ESTRATTO VOL.${VOL} ==="
      fi
  done

  if [ -z "$VOLUMI_EXCERPT" ]; then
      echo "  WARN_NO_VOLUMI_MATCH (concept non trovato in volumi, generazione fallback general knowledge)" >> "$LOG_FILE"
      VOLUMI_EXCERPT="(nessun match diretto nei volumi — usa knowledge generale Claude + flag mancanza in front-matter pagina_ref:null)"
  fi

  CONCEPT_UPPER=$(echo "$CONCEPT" | tr a-z A-Z)

  # NEW v2 prompt: VOLUMI FIRST, then general knowledge
  PROMPT="You are an ELAB Tutor Wiki content writer. Create new Wiki concept file docs/unlim-wiki/concepts/$CONCEPT.md.

PRIMARY SOURCE (USE THIS FIRST — anchor your content here):
$VOLUMI_EXCERPT

YOUR TASK:
Read the PRIMARY SOURCE above. Identify exact pagina + capitolo references. Write the wiki concept ANCHORED in this volume content. Cite Vol.X pag.Y inline using «extracted text» format. Then complement with general knowledge ONLY where volumi don't cover (mark these sections explicitly).

FORMAT (per docs/unlim-wiki/SCHEMA.md):
- Front-matter YAML: id, type, title, locale: it, volume_ref (Vol.N derived from MATCH), pagina_ref (page number from MATCH), tags, dates
- Definizione (start with «citazione esatta libro» if available + Vol.N pag.X)
- Analogia per la classe (start with 'Ragazzi,' plurale)
- Cosa succede fisicamente (formule + tabelle)
- Esperimenti correlati (cite which Cap they appear in)
- 3-5 Errori comuni
- 3-4 Domande tipiche degli studenti
- PRINCIPIO ZERO section (safety + narrative + cosa dire ai ragazzi)
- Link L1 (raw RAG queries)

LANGUAGE: bambino 10-14 anni, plurale inclusivo SEMPRE.

CRITICAL RULES:
1. Cite Vol.X pag.Y AT LEAST 2 times in the doc (drawn from PRIMARY SOURCE)
2. NEVER copy 3+ sentences verbatim from volumi — use «short quote» selettivamente
3. If PRIMARY SOURCE empty/no-match, set volume_ref:null + pagina_ref:null + add front-matter flag 'source_status: general_knowledge_only'
4. Do NOT git commit (script does)
5. End output with: ${CONCEPT_UPPER}_FILE_CREATED"

  echo "$PROMPT" | claude --print --max-turns 15 --permission-mode acceptEdits --add-dir "$REPO" >> "$LOG_FILE" 2>&1

  if [ -f "docs/unlim-wiki/concepts/$CONCEPT.md" ]; then
    git add "docs/unlim-wiki/concepts/$CONCEPT.md"
    git commit -m "feat(wiki): $CONCEPT concept v2 (Mac Mini volumi-anchored batch)" >>"$LOG_FILE" 2>&1
    GENERATED=$((GENERATED+1))
    echo "  OK_GENERATED" >> "$LOG_FILE"
  else
    FAILED=$((FAILED+1))
    echo "  FAIL_NO_FILE" >> "$LOG_FILE"
  fi

  sleep 5
done

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] BATCH_V2_END generated=$GENERATED failed=$FAILED branch=$BATCH_BRANCH" >> "$LOG_FILE"

cat > ~/.elab-batch-result << RESULT_EOF
branch=$BATCH_BRANCH
generated=$GENERATED
failed=$FAILED
log=$LOG_FILE
version=v2-volumi-anchored
RESULT_EOF

echo "Done v2. Generated $GENERATED, failed $FAILED. Branch: $BATCH_BRANCH"
