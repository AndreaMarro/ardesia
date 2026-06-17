#!/bin/bash
# MAESTRO — HERMES-2 v2 (red-team decorrelato, brain kimi-k2.6). Logica finder in adversarial.py.
# v2 (17/06): + HERMES-2.5 = opus AGGIUDICA i CRITICI di kimi (gated/capped/fallback), kimi resta il
# finder cross-family (decorrelazione intatta). Disattiva aggiudicazione: HERMES2_OPUS_ADJUDICATE=0.
export PATH="/opt/homebrew/bin:/usr/bin:/bin:$PATH"
REPO="${1:-lessonos}"
python3 "$HOME/lessonos/bin/adversarial.py" "$@"
[ "${HERMES2_OPUS_ADJUDICATE:-1}" = "1" ] && bash "$HOME/lessonos/bin/hermes2-adjudicate.sh" "$REPO" || true
exit 0
