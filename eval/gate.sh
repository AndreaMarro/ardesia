#!/bin/bash
# FROZEN EVALUATOR — Hermes NON deve modificarlo (autorita del ratchet del driver).
# Gira la suite e stampa, sull'ULTIMA riga, un JSON: {"passed":N,"failed":N,"exit":code}
# green (deciso dal driver) = exit==0 AND passed>=1 AND passed non regredisce.
export PATH="$HOME/.local/bin:$HOME/node-local/bin:/opt/homebrew/bin:$PATH"
cd "$HOME/lessonos" || exit 2
out=$(uv run pytest -q --no-header 2>&1); ec=$?
passed=$(printf '%s' "$out" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | tail -1); passed=${passed:-0}
failed=$(printf '%s' "$out" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' | tail -1); failed=${failed:-0}
printf '{"passed":%s,"failed":%s,"exit":%s}\n' "$passed" "$failed" "$ec"
