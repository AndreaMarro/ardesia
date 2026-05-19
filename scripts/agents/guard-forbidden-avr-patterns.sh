#!/usr/bin/env bash
# guard-forbidden-avr-patterns — PreToolUse hook block AVR-specific patterns in Blockly/Scratch code generators
# Created: 2026-05-16 iter 70 TEAM G PART 1 A6
#
# Context: Arduino Nano R4 uses Renesas RA4M1 chip (NOT ATmega328p AVR).
# Blockly/Scratch code generators must emit portable Arduino API (digitalWrite, pinMode)
# and MUST NOT emit AVR-specific register manipulation (PORTB, DDRB, avr/io.h, etc.)
# which only works on ATmega328p and would silently fail / produce wrong results on Nano R4.
#
# Hook contract (PreToolUse):
# - reads JSON from stdin: {"tool_input":{"file_path":"...","content":"..."}}
# - returns JSON to stdout: {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask|allow","permissionDecisionReason":"..."}}
# - exit 0 = decision honored
# - timeout 5s
#
# Guarded files:
#   **/src/components/simulator/panels/scratchGenerator.js
#   **/src/data/blockly-blocks/*.js
#
# Forbidden AVR-specific patterns (ATmega328p register manipulation):
#   PORTB, PORTC, PORTD  — 8-bit I/O port output registers
#   DDRB, DDRC, DDRD     — data direction registers
#   PINB, PINC, PIND     — pin input registers
#   _BV(                 — bit-value macro (avr-libc)
#   ATmega328            — explicit chip name
#   avr/io.h             — AVR I/O header
#   avr/interrupt.h      — AVR interrupt header
#   sei()                — global interrupt enable (AVR)
#   cli()                — global interrupt disable (AVR)
#   ISR(                 — interrupt service routine macro (AVR)

set -euo pipefail

# Read stdin JSON fully
INPUT=$(cat)

# Extract file_path and content using jq
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
CONTENT=$(printf '%s' "$INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null || true)

# If no file_path or no content, allow (not a Write/Edit on a code file)
if [[ -z "$FILE_PATH" ]] || [[ -z "$CONTENT" ]]; then
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\n'
  exit 0
fi

# Check if file_path matches guarded file patterns
GUARDED=false

# Pattern 1: scratchGenerator.js (Scratch/Blockly C++ code generator for Arduino)
if [[ "$FILE_PATH" == */src/components/simulator/panels/scratchGenerator.js ]]; then
  GUARDED=true
fi

# Pattern 2: blockly-blocks/*.js (custom Blockly block definitions and generators)
if [[ "$FILE_PATH" == */src/data/blockly-blocks/*.js ]]; then
  GUARDED=true
fi

# If file is not in a guarded path, allow immediately
if [[ "$GUARDED" == false ]]; then
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\n'
  exit 0
fi

# Scan content for forbidden AVR-specific patterns
# Use grep -n to get line numbers for the warning message
FORBIDDEN_PATTERNS=(
  'PORTB'
  'PORTC'
  'PORTD'
  'DDRB'
  'DDRC'
  'DDRD'
  'PINB'
  'PINC'
  'PIND'
  '_BV('
  'ATmega328'
  'avr/io\.h'
  'avr/interrupt\.h'
  'sei()'
  'cli()'
  'ISR('
)

MATCHED_PATTERN=""
MATCHED_LINE=""

for PATTERN in "${FORBIDDEN_PATTERNS[@]}"; do
  # Search content for pattern (case-sensitive, line-by-line)
  # We write content to a temp pipe and grep it
  MATCH=$(printf '%s' "$CONTENT" | grep -n "$PATTERN" 2>/dev/null | head -1 || true)
  if [[ -n "$MATCH" ]]; then
    MATCHED_PATTERN="$PATTERN"
    MATCHED_LINE="$MATCH"
    break
  fi
done

# If a forbidden pattern was found, emit "ask" with warning
if [[ -n "$MATCHED_PATTERN" ]]; then
  # Escape the reason string for JSON (replace " with \", \ with \\, newlines)
  REASON="WARNING: AVR-specific pattern detectato in file Blockly/Scratch generator! "
  REASON+="File: $FILE_PATH | "
  REASON+="Pattern vietato: '$MATCHED_PATTERN' | "
  REASON+="Occorrenza: $MATCHED_LINE | "
  REASON+="MOTIVO: Arduino Nano R4 usa Renesas RA4M1 (NON ATmega328p). "
  REASON+="Il codice generato con registri AVR (PORTB/DDRB/PINB/_BV/avr/io.h/sei/cli/ISR) "
  REASON+="NON funzionerà su Nano R4 — usa ESCLUSIVAMENTE Arduino API portabile: "
  REASON+="digitalWrite(), digitalRead(), pinMode(), analogWrite(), analogRead(). "
  REASON+="Conferma se intenzionale (es. test legacy ATmega328p simulator avr8js, NON Nano R4)."

  # Escape for JSON: replace backslash first, then double-quote, then control chars
  REASON_JSON=$(printf '%s' "$REASON" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr -d '\n\r')

  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"%s"}}\n' "$REASON_JSON"
  exit 0
fi

# No forbidden pattern found — allow
printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"PASS: nessun pattern AVR-specifico rilevato in file Blockly/Scratch generator (porta Arduino API)"}}\n'
exit 0
