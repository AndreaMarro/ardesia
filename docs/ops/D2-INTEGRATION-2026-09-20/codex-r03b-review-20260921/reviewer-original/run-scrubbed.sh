#!/bin/zsh
set -u

if (( $# < 2 )); then
  print -u2 "usage: $0 <log-stem> <command> [args...]"
  exit 64
fi

name=$1
shift
root=${0:a:h}
out="$root/logs/${name}.stdout.log"
err="$root/logs/${name}.stderr.log"
meta="$root/logs/${name}.meta.txt"

{
  print -r -- "command: ${(j: :)${(q)@}}"
  print -r -- "started_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  print -r -- "node: $(node --version 2>&1)"
  print -r -- "npm: $(npm --version 2>&1)"
} > "$meta"

SECONDS=0
env -u KIMI_API_KEY -u DEEPSEEK_API_KEY -u OPENAI_API_KEY -u ANTHROPIC_API_KEY -u ARDESIA_CHROMIUM_NO_SANDBOX "$@" >"$out" 2>"$err"
exit_status=$?
{
  print -r -- "exit_code: $exit_status"
  print -r -- "duration_seconds: $SECONDS"
  print -r -- "finished_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >> "$meta"
exit $exit_status
