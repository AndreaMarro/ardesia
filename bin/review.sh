#!/bin/bash
# REVIEWER decorrelato = Claude Code (claude -p). Hermes COSTRUISCE, Claude RIVEDE.
# Rivede il diff NON committato del repo indicato da REVIEW_REPO (default ~/lessonos).
# v3 (10/06, Claude supervisore): ladder fable-5 -> opus-4-8 (retry+fallback); multi-repo via REVIEW_REPO;
# blurb progetto da REVIEW-CONTEXT.md se presente; auto-observation hook reso RAGGIUNGIBILE (prima: dead code dopo exit).
# Token re-iniettato (Hermes sanitizza l'env del subprocess). Usage: ./bin/review.sh [tier]  tier: fable(default)|opus|sonnet|haiku
# PATH esplicito: hermes sanitizza l'env del subprocess → claude/node invisibili senza questo (blocker attempt-2).
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
tier="${1:-fable}"
case "$tier" in
  haiku)  models="claude-haiku-4-5";;
  sonnet) models="claude-sonnet-4-6";;
  opus)   models="claude-opus-4-8";;
  *)      models="claude-fable-5 claude-opus-4-8";;
esac
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
REPO_DIR="${REVIEW_REPO:-$HOME/lessonos}"
cd "$REPO_DIR" || exit 1

diff="$(git --no-pager diff; git --no-pager diff --staged; echo '--- UNTRACKED ---'; git ls-files --others --exclude-standard | while read f; do echo "### $f"; sed -n '1,200p' "$f"; done)"
[ -z "$(echo "$diff" | tr -d '[:space:]')" ] && { echo "REVIEW: nessun diff da rivedere."; exit 0; }

# AUTO-LOAD SKILL: inietta le checklist di skills/*.md nel prompt (chiude il loop "skill creata ma non applicata", RETRO #6/#7).
skills=""
if compgen -G "skills/*.md" >/dev/null 2>&1; then
  for f in skills/*.md; do
    [ "$(basename "$f")" = "README.md" ] && continue
    skills+="
### SKILL: $(basename "$f")
$(cat "$f")
"
  done
fi
[ -n "$skills" ] && skills="=== SKILL CHECKLIST (applica OGNI item al diff) ===$skills"

# Blurb progetto: REVIEW-CONTEXT.md del repo se esiste, altrimenti default LessonOS.
if [ -f REVIEW-CONTEXT.md ]; then ctx="$(cat REVIEW-CONTEXT.md)"
else ctx="LessonOS (motore didattico Python headless: lezione -> Lesson Capsule -> Lesson Graph -> Path Memory -> Didactic Delta -> Learning Debt, grounded). Cerca anche: grounding non fondato (seg_id/citazioni inventati), scope-creep oltre il motore headless (NO iPad/web/cloud/UI), violazioni convenzioni (test su mock, dataclass frozen, ValueError su input invalido, no dipendenze ingiustificate)."
fi

prompt="Sei il REVIEWER decorrelato di questo progetto: $ctx
Un ALTRO agente ha appena scritto questo lavoro non committato. Rivedilo ADVERSARIALMENTE e ONESTAMENTE (NON COMPIACERE). Applica ESPLICITAMENTE ogni item delle SKILL CHECKLIST qui sotto al diff. Cerca: (1) bug reali; (2) test tautologici/fasulli che asseriscono cio che il codice fa per costruzione; (3) claim senza fonte reale; (4) scope-creep oltre gli ORDINI correnti (COORDINATION.md). Se trovi problemi VERI: elencali concisi con file:line + il FIX preciso. Se e solido: scrivi 'OK'. Massimo 240 parole. POI aggiungi SEMPRE 1 consiglio breve su come MIGLIORARE (processo/skill/architettura/memoria agentmemory) per le prossime iterazioni.

$skills

=== DIFF ===
$diff"

# AUTO-OBSERVATION (RETRO #9 fix #2) — chiamato PRIMA di ogni uscita (nella v2 stava dopo exit = mai eseguito).
record_observation() {
  obs_file="$REPO_DIR/observations.jsonl"
  head_sha="$(git rev-parse --short HEAD 2>/dev/null || echo 'pre-commit')"
  if [ -f "$obs_file" ] && ! grep -q "$head_sha" "$obs_file" 2>/dev/null; then
    ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    diff_files="$(git diff --name-only HEAD~1..HEAD 2>/dev/null | tr '\n' ',' | sed 's/,$//')"
    echo "{\"ts\":\"$ts\",\"commit\":\"$head_sha\",\"task\":\"(auto-observation review.sh pre-commit)\",\"files\":[\"$diff_files\"],\"cost_usd\":0.0,\"status\":\"pending\"}" >> "$obs_file"
  fi
}

# Ladder: fable-5 (3 tentativi) -> opus-4-8 (3 tentativi). Retry su auth-loop/timeout/rate-limit. Review MANDATORIA.
for m in $models; do
  for try in 1 2 3; do
    out="$(timeout 240 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$prompt" 2>&1)"; rc=$?
    if [ "$rc" = 124 ] || printf "%s" "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key|overloaded|rate.?limit|429|quota exceeded"; then sleep 8; continue; fi
    printf "[review: %s]\n%s\n" "$m" "$out"; record_observation; exit 0
  done
done
printf "%s\n" "$out"; record_observation; exit 1
