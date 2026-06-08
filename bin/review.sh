#!/bin/bash
# LessonOS REVIEWER = Claude Code (claude -p). Hermes-DeepSeek COSTRUISCE, Claude Code RIVEDE (decorrelato).
# Rivede il diff NON committato (lavoro appena scritto da Hermes/DeepSeek) in modo adversariale.
# Token re-iniettato (Hermes sanitizza l'env del subprocess). Usage: ./bin/review.sh [tier]
tier="${1:-sonnet}"
case "$tier" in haiku) m="claude-haiku-4-5";; opus) m="claude-opus-4-8";; *) m="claude-sonnet-4-5";; esac
eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
cd "$HOME/lessonos" || exit 1
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
prompt="Sei il REVIEWER decorrelato di LessonOS (motore didattico Python headless: lezione -> Lesson Capsule -> Lesson Graph -> Path Memory -> Didactic Delta -> Learning Debt, grounded). Un ALTRO agente (DeepSeek) ha appena scritto questo lavoro non committato. Rivedilo ADVERSARIALMENTE e ONESTAMENTE (NON COMPIACERE). Applica ESPLICITAMENTE ogni item delle SKILL CHECKLIST qui sotto al diff. Cerca: (1) bug reali; (2) test tautologici/fasulli che asseriscono ciò che il codice fa per costruzione; (3) grounding non fondato (seg_id/citazioni inventati, claim senza fonte reale); (4) scope-creep oltre il motore headless (NO iPad/web/cloud/UI); (5) violazioni convenzioni (test su mock, dataclass frozen, ValueError su input invalido, no dipendenze ingiustificate). Se trovi problemi VERI: elencali concisi con file:line + il FIX preciso. Se è solido: scrivi 'OK'. Massimo 240 parole. POI aggiungi SEMPRE 1 consiglio breve su come MIGLIORARE (processo/skill/architettura/memoria agentmemory) per le prossime iterazioni.

$skills

=== DIFF ===
$diff"
# retry su auth-loop/timeout: la review Claude e MANDATORIA, non deve saltare (mirror opus.sh)
for try in 1 2 3; do
  out="$(timeout 240 env -u ANTHROPIC_API_KEY claude -p --dangerously-skip-permissions --model "$m" "$prompt" 2>&1)"; rc=$?
  if [ "$rc" = 124 ] || printf "%s" "$out" | grep -qiE "not logged in|please run /login|unauthorized|invalid api key"; then sleep 8; continue; fi
  printf "%s\n" "$out"; exit 0
done
printf "%s\n" "$out"; exit 1
