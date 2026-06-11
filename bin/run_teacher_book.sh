#!/bin/bash
# run_teacher_book.sh — Build + render TeacherBook for one teacher in fisica1-sim.
set -euo pipefail
cd "$(dirname "$0")/.."

TEACHER_ID="${1:?Usage: $0 <teacher_id>}"
DB="$HOME/maestro-data/fisica1-sim/derived/db/fisica1.db"
OUT_DIR="$HOME/maestro-data/fisica1-sim/derived/teacher_book"
mkdir -p "$OUT_DIR"

uv run python -c "
import os, sys
from lessonos.store.sqlite import SQLiteStore
from lessonos.teacher_book import build_teacher_book
from lessonos.teacher_book_renderer import render_teacher_book

db = os.path.expandvars('${DB}')
store = SQLiteStore(db)

teacher_id = '${TEACHER_ID}'
book = build_teacher_book(store, teacher_id)
md = render_teacher_book(book)

out = os.path.expandvars('${OUT_DIR}/${TEACHER_ID}.md')
with open(out, 'w') as f:
    f.write(md)
print(f'Written: {out} ({len(md)} bytes)')
" 2>&1