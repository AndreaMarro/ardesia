#!/bin/bash
# MAESTRO — extract-written-style.sh: Convert dispense PDFs to clean text (M2-2)
# Raw dispense directory is READ-ONLY — never modify raw/
# Usage: bash bin/extract-written-style.sh [--dispense-dir ...] [--out-dir ...]

set -euo pipefail

DISPENSE_DIR="${DISPENSE_DIR:-$HOME/maestro-data/teoria-segnali-2021/raw/dispense-2026}"
OUT_DIR="${OUT_DIR:-$HOME/maestro-data/teoria-segnali-2021/derived/dispense}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dispense-dir) DISPENSE_DIR="$2"; shift 2 ;;
    --out-dir) OUT_DIR="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

mkdir -p "$OUT_DIR"

count=0
for pdf in "$DISPENSE_DIR"/*.pdf; do
  [ -f "$pdf" ] || continue
  base="$(basename "$pdf" .pdf)"
  out="$OUT_DIR/${base}.raw.txt"
  if [ -f "$out" ]; then
    echo "  already exists: $out"
    continue
  fi
  echo "  converting: $pdf -> $out"
  /opt/homebrew/bin/pdftotext -layout "$pdf" "$out" 2>/dev/null || {
    echo "  WARNING: pdftotext failed on $pdf"
    continue
  }
  count=$((count + 1))
done

# Also handle DOCX if available
docx_file="$DISPENSE_DIR/PRIMA LEZIONE DI TEORIA DEI SEGNALI.docx"
docx_out="$OUT_DIR/PRIMA LEZIONE DI TEORIA DEI SEGNALI.raw.txt"
if [ -f "$docx_file" ] && ! [ -f "$docx_out" ]; then
  echo "  converting: $docx_file -> $docx_out"
  if command -v pandoc &>/dev/null; then
    pandoc "$docx_file" -t plain -o "$docx_out" 2>/dev/null || echo "  WARNING: pandoc failed on $docx_file"
  else
    echo "  WARNING: pandoc not available, skipping DOCX"
  fi
fi

echo "Done. $count new PDFs converted. Total raw txt in $OUT_DIR:"
ls "$OUT_DIR"/*.raw.txt 2>/dev/null | wc -l | tr -d ' '
