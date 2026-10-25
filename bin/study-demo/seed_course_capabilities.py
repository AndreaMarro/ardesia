#!/usr/bin/env python3
"""Seed disposable browser QA for catalog, course switching and real PDF notes.

Use a fresh directory outside the repository for each complete run. Repeating
prepare() is safe, but browser journeys intentionally preserve their submissions.
This fixture admits synthetic members through the existing test-member helper;
it never offers an edition or approves/publishes any question-bank content.

From the repository root, after installing the existing project dependencies:

    export ARDESIA_QA_DIR="$(mktemp -d /tmp/ardesia-course-qa.XXXXXX)"
    python bin/study-demo/seed_course_capabilities.py --data-dir "$ARDESIA_QA_DIR"

Serve the ordinary Study API factory on 127.0.0.1:5321, with demo=True and the
database ARDESIA_QA_DIR/study.sqlite, and run Vite on 127.0.0.1:5210. The existing
Vite configuration proxies /study to port 5321. Set ARDESIA_DEMO_ACCESS to
ARDESIA_QA_DIR/demo-access.json and ARDESIA_NOTEBOOK_PDF to
ARDESIA_QA_DIR/synthetic-notebook.pdf for catalog-course-capabilities.spec.ts.
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "packages/engine"))

from lessonos.study.store import StudyStore
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
from seed import seed


def write_notebook_pdf(path: Path) -> None:
    """Create three actual PDF pages using the project's existing dependency."""
    writer = PdfWriter()
    font = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica"),
    })
    for number in range(1, 4):
        page = writer.add_blank_page(width=595, height=842)
        stream = DecodedStreamObject()
        stream.set_data((
            f"BT /F1 20 Tf 50 780 Td (Synthetic QA - page {number}) Tj ET\n"
            "BT /F1 12 Tf 50 745 Td (No real student content. Local browser test only.) Tj ET\n"
            f"BT /F1 12 Tf 50 705 Td (Notebook navigation target {number}.) Tj ET\n"
            "50 300 490 330 re S\n"
        ).encode("ascii"))
        page[NameObject("/Contents")] = writer._add_object(stream)
        page[NameObject("/Resources")] = DictionaryObject({
            NameObject("/Font"): DictionaryObject({NameObject("/F1"): font}),
        })
    writer.add_metadata({"/Title": "Synthetic local QA document"})
    writer.write(path)


def prepare(data_dir: Path) -> None:
    os.umask(0o077)
    access = json.loads(seed(data_dir).read_text())
    if access.get("synthetic") is not True:
        raise ValueError("synthetic_actors_required")
    store = StudyStore(data_dir / "study.sqlite")
    try:
        tutor = store.create_principal("tutor-synthetic", "teacher")
        if not store.connection.execute(
            "SELECT 1 FROM study_editions WHERE id='analisi'"
        ).fetchone():
            store.create_edition(tutor, "analisi", course_id="analisi-1", pack_id="taylor-exp-v1")
        for alias in ("student-01", "student-02"):
            student = store.create_principal(alias, "student")
            for edition in ("fluidi", "analisi"):
                if not store.connection.execute(
                    "SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?",
                    (edition, student.id),
                ).fetchone():
                    store.add_test_member(tutor, edition, student.id)
    finally:
        store.close()
    pdf = data_dir / "synthetic-notebook.pdf"
    if not pdf.exists():
        write_notebook_pdf(pdf)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, required=True)
    args = parser.parse_args()
    prepare(args.data_dir)
    print(f"Synthetic browser fixture ready: {args.data_dir} (private credentials are not printed).")
