"""GeneratedArtifact — lineage tracking per Course Foundry.

REGOLA LINEAGE (COORDINATION.md §19): ogni GeneratedArtifact sa da quali
ContentAtoms/lezioni/fonti viene. Non serve un grafo complesso, basta
lineage: artifact -> atom_ids -> lesson_ids -> source_ids.

ZERO-LLM, deterministica, frozen dataclass con ValueError fail-fast.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Sequence

from lessonos.course.schema import CourseBlueprint
from lessonos.models import require_non_empty

# Export format vocab — bounded set di formati supportati.
ARTIFACT_FORMATS: tuple[str, ...] = (
    "markdown",
    "liascript",
    "quarto",
    "quarto-slides",
    "moodle-xml",
    "pdf",
    "html",
    "docx",
    "scorm",
    "h5p",
    "epub",
    "latex",
)

VALID_FORMATS: frozenset[str] = frozenset(ARTIFACT_FORMATS)


@dataclass(frozen=True)
class GeneratedArtifact:
    """Record di lineage per un artefatto generato dal Course Foundry.

    Ogni GeneratedArtifact traccia la provenienza di un file di output
    fino agli atomi, lezioni e fonti da cui deriva.

    Fields:
        artifact_id: Identificatore univoco dell'artefatto (es. 'course.md').
        format: Formato di esportazione (∈ VALID_FORMATS, obbligatorio).
        file_path: Percorso del file generato (non vuoto).
        atom_ids: Tuple di atom_id che hanno contribuito all'artefatto.
            Può essere vuota (es. file di configurazione senza atomi diretti).
        lesson_ids: Tuple di lesson_id coinvolte (dedotte da atom_ids o
            specificate esplicitamente). Può essere vuota.
        source_ids: Tuple di source_id da cui derivano i contenuti.
            Può essere vuota (es. artefatto puramente strutturale).
        generator: Nome del generatore che ha prodotto l'artefatto
            (es. 'export_course_markdown').
        generated_at: Timestamp ISO 8601 UTC della generazione.

    Raises:
        ValueError: Se format non ∈ VALID_FORMATS, o file_path vuoto.
    """

    artifact_id: str
    format: str
    file_path: str
    atom_ids: tuple[str, ...] = field(default_factory=tuple)
    lesson_ids: tuple[str, ...] = field(default_factory=tuple)
    source_ids: tuple[str, ...] = field(default_factory=tuple)
    generator: str = ""
    generated_at: str = field(default_factory=lambda: _now_iso())

    def __post_init__(self) -> None:
        """Validazione fail-fast."""
        require_non_empty(self.artifact_id, "artifact_id")
        if self.format not in VALID_FORMATS:
            raise ValueError(
                f"format={self.format!r} not in VALID_FORMATS; "
                f"must be one of {sorted(VALID_FORMATS)}"
            )
        require_non_empty(self.file_path, "file_path")


def _now_iso() -> str:
    """UTC now in ISO 8601."""
    return datetime.now(timezone.utc).isoformat()


def build_artifact_lineage(
    blueprint: CourseBlueprint,
    file_path: str,
    fmt: str,
    atom_ids: Sequence[str] = (),
    generator: str = "",
) -> GeneratedArtifact:
    """Costruisce GeneratedArtifact da CourseBlueprint + metadati.

    Args:
        blueprint: CourseBlueprint da cui estrarre lesson_ids e source_ids.
        file_path: Percorso del file generato.
        fmt: Formato di esportazione (∈ VALID_FORMATS).
        atom_ids: Atomi che hanno contribuito all'artefatto.
        generator: Nome del generatore.

    Returns:
        GeneratedArtifact con lineage popolato.

    Raises:
        ValueError: Se fmt non valido o file_path vuoto.
    """
    # Deduci lesson_ids UNIQUE ordinate da atom_ids se possibile,
    # altrimenti da blueprint.source_lessons.
    lesson_ids: list[str] = []
    seen_lessons: set[str] = set()
    for aid in atom_ids:
        lid = _lesson_id_from_atom_id(str(aid))
        if lid is not None and lid not in seen_lessons:
            lesson_ids.append(lid)
            seen_lessons.add(lid)
    if not lesson_ids:
        # Fallback: source_lessons dal blueprint (ordine preservato).
        lesson_ids = list(blueprint.source_lessons)

    source_ids = tuple(blueprint.source_lessons)  # source_lessons = le lezioni-fonti del corso;
    # usate sia come fallback lesson_ids (quando atom_ids non forniti) sia come
    # source_ids (provenienza ultima del contenuto).

    # Valida file_path prima di calcolare artifact_id
    require_non_empty(file_path, "file_path")

    artifact_id = Path(file_path).name

    return GeneratedArtifact(
        artifact_id=artifact_id,
        format=fmt,
        file_path=file_path,
        atom_ids=tuple(atom_ids),
        lesson_ids=tuple(lesson_ids),
        source_ids=source_ids,
        generator=generator,
    )


def _lesson_id_from_atom_id(atom_id: str) -> str | None:
    """Estrae il prefisso lesson_id da un atom_id formato '<lesson>/<type>/<n>'.

    Esempi:
        'l1_derivatives/definition/0' -> 'l1_derivatives'
        'l2_integrals/exercise/3' -> 'l2_integrals'
        'course.md' -> None (non è un atom_id valido)
    """
    parts = atom_id.split("/", 1)
    if len(parts) < 2:
        return None
    return parts[0]


def save_artifact_lineage(
    artifacts: Sequence[GeneratedArtifact],
    output_dir: str,
) -> str:
    """Salva la lista di GeneratedArtifact in lineage.json nell'output dir.

    Args:
        artifacts: Sequence di GeneratedArtifact da salvare.
        output_dir: Directory dove scrivere lineage.json (creata se non esiste).

    Returns:
        Percorso assoluto del file lineage.json creato.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    path = out / "lineage.json"

    data = []
    for a in artifacts:
        data.append({
            "artifact_id": a.artifact_id,
            "format": a.format,
            "file_path": a.file_path,
            "atom_ids": list(a.atom_ids),
            "lesson_ids": list(a.lesson_ids),
            "source_ids": list(a.source_ids),
            "generator": a.generator,
            "generated_at": a.generated_at,
        })

    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return str(path.resolve())


def load_artifact_lineage(lineage_path: str) -> list[GeneratedArtifact]:
    """Carica GeneratedArtifact da un file lineage.json.

    Args:
        lineage_path: Percorso del file lineage.json.

    Returns:
        Lista di GeneratedArtifact.

    Raises:
        FileNotFoundError: Se il file non esiste.
        ValueError: Se il JSON non è valido o ha formato errato.
    """
    p = Path(lineage_path)
    if not p.exists():
        raise FileNotFoundError(f"lineage file not found: {lineage_path}")

    raw = json.loads(p.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("lineage.json must contain a JSON array of artifacts")

    artifacts: list[GeneratedArtifact] = []
    for i, entry in enumerate(raw):
        if not isinstance(entry, dict):
            raise ValueError(f"entry {i}: expected a dict, got {type(entry).__name__}")
        try:
            artifacts.append(GeneratedArtifact(**entry))
        except TypeError as e:
            raise ValueError(f"entry {i}: invalid fields — {e}") from e
    return artifacts
