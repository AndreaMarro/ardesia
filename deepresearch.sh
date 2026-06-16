#!/bin/bash
# MAESTRO — wrapper deep-research browser. Vive in ~/maestro-tools (fuori dai repo).
# Uso: deepresearch.sh --verify | --login | --engine gemini --query "..."
#   --login: apre Chrome HEADED sul profilo dedicato e ASPETTA — Andrea fa login (Gemini=musickant) e chiude.
set -uo pipefail
export PATH="$HOME/node-local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
cd "$HOME/maestro-tools" || exit 1
if [ "${1:-}" = "--login" ]; then
  echo "Apro Chrome sul profilo dedicato ~/.maestro-browser-profile con DUE schede — fai login a gemini.google.com (musickant) e chatgpt.com, poi CHIUDI la finestra."
  node -e "
import('playwright').then(async ({chromium}) => {
  const ctx = await chromium.launchPersistentContext(process.env.HOME + '/.maestro-browser-profile', {channel:'chrome', headless:false, viewport:null});
  const p1 = ctx.pages()[0] ?? await ctx.newPage();
  await p1.goto('https://gemini.google.com/app').catch(() => {});
  const p2 = await ctx.newPage();
  await p2.goto('https://chatgpt.com/').catch(() => {});
  await new Promise(res => ctx.on('close', res));
});"
  exit 0
fi
exec node deepresearch.mjs "$@"
