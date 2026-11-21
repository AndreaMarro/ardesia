"""Rigenera i due file di seed e le relative tavole. Controlla le chiavi numeriche."""

from c34_base import records, save_course
import c34_termo
import c34_qtermo
import c34_elettro
import c34_qelettro
from c34_prompts import attach

if __name__ == "__main__":
    attach(records)
    for course in ("C3", "C4"):
        save_course(course)
        print(
            course,
            {
                kind: sum(r["course"] == course and r["kind"] == kind for r in records)
                for kind in ("lesson", "example", "question")
            },
        )
