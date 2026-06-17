#!/bin/bash
# run_all_teacher_books.sh — Build + render TeacherBook for ALL 10 sim teachers.
set -euo pipefail
cd "$(dirname "$0")/.."

DB="$HOME/maestro-data/fisica1-sim/derived/db/fisica1.db"
OUT_DIR="$HOME/maestro-data/fisica1-sim/derived/teacher_book"
mkdir -p "$OUT_DIR"

TEACHERS=(
  prof_rigoroso prof_caotico prof_dialettale prof_veloce prof_pedante
  prof_socratico prof_pratico prof_aneddotico prof_esitante prof_audiopessimo
)
export TEACHERS

echo "=== Building TeacherBooks for ${#TEACHERS[@]} teachers ==="

for tid in "${TEACHERS[@]}"; do
  echo "  $tid..."
  bash bin/run_teacher_book.sh "$tid"
done

# Generate comparative report
uv run python << 'PYEOF'
import os, json
from lessonos.store.sqlite import SQLiteStore
from lessonos.teacher_book import build_teacher_book
from lessonos.teacher_book_renderer import (
    render_qualitative_diff,
    render_teacher_book,
    render_comparative_report,
)

db = os.path.expandvars('$HOME/maestro-data/fisica1-sim/derived/db/fisica1.db')
store = SQLiteStore(db)

teachers_str = os.environ.get('TEACHERS', '')
if not teachers_str:
    print('ERROR: TEACHERS env var not set or empty')
    exit(1)
teachers = teachers_str.split()

out_dir = os.path.expandvars('$HOME/maestro-data/fisica1-sim/derived/teacher_book')
os.makedirs(out_dir, exist_ok=True)

books = {}
for tid in teachers:
    book = build_teacher_book(store, tid)
    books[tid] = book

    path = os.path.join(out_dir, f'{tid}.md')
    with open(path, 'w') as f:
        f.write(render_teacher_book(book))
    print(f'Written: {path} ({len(render_teacher_book(book))} bytes)')

# Comparative report
report_path = os.path.join(out_dir, 'REPORT.md')
report = render_comparative_report(books)
with open(report_path, 'w') as f:
    f.write(report)
print(f'Written: {report_path} ({len(report)} bytes)')

# Qualitative diff between 3 opposite styles
diff_path = os.path.join(out_dir, 'QUALITATIVE-DIFF.md')
diff = render_qualitative_diff(books)
with open(diff_path, 'w') as f:
    f.write(diff)
print(f'Written: {diff_path} ({len(diff)} bytes)')

print('DONE -- all 10 teacher books + report + qualitative diff generated.')
PYEOF
