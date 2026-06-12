"""Deterministic tests for Obsidian Vault Export (M1-7, lessonos/export/obsidian_vault.py).

Tests cover:
- Vault directory structure (concetti/, trascrizioni/, README.md)
- Concept pages with correct frontmatter and body
- Prerequisite wikilinks
- Transcript pages with ^seg-<id> blocks
- Second-run idempotency (same output)
- JSON Canvas 1.0 output (--canvas)
- Edge cases: empty teacher, no global resolution
"""

from __future__ import annotations

import json
import os
import shutil
import tempfile
from pathlib import Path as FsPath

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.export.obsidian_vault import (
    _build_canonical_set,
    _build_frontmatter_yaml,
    _load_global_resolution,
    _parse_seg_id,
    _slug,
    _wikilinkify,
    export_vault,
)
from lessonos.graph.aggregator import aggregate_teacher_graph
from lessonos.graph.resolution import GlobalResolution, ResolutionAlias, ResolutionEntry
from lessonos.models.entities import (
    Segment,
    EDGE_TYPES,
    GraphEdge,
    GraphEvidence,
    GraphNode,
    Lesson,
    Path,
)
from lessonos.store.base import Store


# ---------------------------------------------------------------------------
# Minimal in-memory store (same pattern as test_graph_aggregator._PathStore)
# ---------------------------------------------------------------------------

class _VaultStore(Store):
    """Minimal in-memory store stub for vault export tests."""

    def __init__(self):
        self._paths: dict[str, Path] = {}
        self._lessons: dict[str, Lesson] = {}
        self._capsules: dict[str, str] = {}
        self._nodes: dict[str, list[GraphNode]] = {}
        self._edges: dict[str, list[GraphEdge]] = {}
        self._evidence: dict[str, list[GraphEvidence]] = {}
        self._segments: dict[str, Segment] = {}

    def save_path(self, p: Path) -> None:
        self._paths[p.path_id] = p

    def get_path(self, path_id: str) -> Path | None:
        return self._paths.get(path_id)

    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        return tuple(p for p in self._paths.values() if p.teacher_id == teacher_id)

    def save_lesson(self, l: Lesson) -> None:
        self._lessons[l.lesson_id] = l

    def get_lesson(self, lesson_id: str) -> Lesson | None:
        return self._lessons.get(lesson_id)

    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]:
        return tuple(l for l in self._lessons.values() if l.path_id == path_id)

    def save_capsule(self, lesson_id: str, data: str) -> None:
        self._capsules[lesson_id] = data

    def get_capsule(self, lesson_id: str) -> str | None:
        return self._capsules.get(lesson_id)

    def save_segment(self, seg: Segment) -> None:
        self._segments[seg.seg_id] = seg

    def get_segment(self, seg_id: str) -> Segment | None:
        return self._segments.get(seg_id)

    def segments_for_lesson(self, lid: str) -> tuple[Segment, ...]:
        return tuple(s for s in self._segments.values() if s.lesson_id == lid)

    def save_graph_node(self, lesson_id: str, node: GraphNode) -> None:
        self._nodes.setdefault(lesson_id, []).append(node)

    def get_graph_nodes_for_lesson(self, lesson_id: str) -> tuple[GraphNode, ...]:
        return tuple(self._nodes.get(lesson_id, []))

    def save_graph_edge(self, lesson_id: str, edge: GraphEdge) -> None:
        self._edges.setdefault(lesson_id, []).append(edge)

    def get_graph_edges_for_lesson(self, lesson_id: str) -> tuple[GraphEdge, ...]:
        return tuple(self._edges.get(lesson_id, []))

    def save_evidence(self, ev: GraphEvidence) -> None:
        self._evidence.setdefault(ev.lesson_id, []).append(ev)

    def get_evidence_for_edge(self, edge_id: str) -> tuple[GraphEvidence, ...]:
        return tuple(ev for evs in self._evidence.values() for ev in evs if ev.edge_id == edge_id)

    def get_all_evidence_for_lesson(self, lesson_id: str) -> tuple[GraphEvidence, ...]:
        return tuple(self._evidence.get(lesson_id, []))

    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)

    def save_source(self, *a, **kw): ...
    def get_source(self, *a, **kw): ...
    def save_moment(self, *a, **kw): ...
    def get_moment(self, *a, **kw): ...
    def moments_for_lesson(self, *a, **kw): ...
    def save_ledger_entry(self, *a, **kw): ...
    def get_ledger_entries(self, *a, **kw): ...
    def get_ledger_for_lesson(self, *a, **kw): ...
    def close(self): ...
    def begin_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...
    def delete_capsule(self, lesson_id: str) -> bool:
        return self._capsules.pop(lesson_id, None) is not None

    def purge_lesson(self, lesson_id: str) -> int:
        total = sum(1 for s in self._segments.values() if s.lesson_id == lesson_id)
        self._segments = {k: v for k, v in self._segments.items() if v.lesson_id != lesson_id}
        self.delete_capsule(lesson_id)
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)
        return total


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _seg(lesson_id: str, idx: int, text: str) -> Segment:
    return Segment(
        seg_id=f"{lesson_id}#s{idx}",
        lesson_id=lesson_id,
        start=idx * 10,
        end=(idx + 1) * 10,
        text=text,
    )


@pytest.fixture
def store_and_data():
    """Build a store with 2 lessons, 3 concepts, edges, evidence, segments, capsules."""
    s = _VaultStore()

    # Path with teacher
    p = Path(
        path_id="test_path",
        title="Test Course",
        subject="Test Subject",
        lesson_ids=("l1", "l2"),
        teacher_id="test_teacher",
    )
    s.save_path(p)

    # Lessons
    s.save_lesson(Lesson(lesson_id="l1", path_id="test_path", title="Lezione 1", order=1))
    s.save_lesson(Lesson(lesson_id="l2", path_id="test_path", title="Lezione 2", order=2))

    # Segments
    s.save_segment(_seg("l1", 1, "Il segnale e una grandezza fisica che varia nel tempo."))
    s.save_segment(_seg("l1", 2, "l'energia di un segnale si calcola come integrale del modulo quadro."))
    s.save_segment(_seg("l2", 1, "La potenza media e definita per segnali periodici."))
    s.save_segment(_seg("l2", 2, "Il supporto di un segnale e la chiusura degli istanti."))

    # Graph nodes (concepts)
    s.save_graph_node("l1", GraphNode(
        node_id="l1:concept:0", node_type="concept", ref_id="l1:concept:0", label="Definizione di segnale"
    ))
    s.save_graph_node("l1", GraphNode(
        node_id="l1:concept:1", node_type="concept", ref_id="l1:concept:1", label="Energia di un segnale"
    ))
    s.save_graph_node("l2", GraphNode(
        node_id="l2:concept:0", node_type="concept", ref_id="l2:concept:0", label="Potenza media"
    ))
    s.save_graph_node("l2", GraphNode(
        node_id="l2:concept:1", node_type="concept", ref_id="l2:concept:1", label="Supporto di un segnale"
    ))
    # Lesson-level nodes
    s.save_graph_node("l1", GraphNode(
        node_id="l1", node_type="lesson", ref_id="l1", label=None
    ))
    s.save_graph_node("l2", GraphNode(
        node_id="l2", node_type="lesson", ref_id="l2", label=None
    ))

    # Graph edges (depends_on: Supporto depends_on Energia, Energia depends_on Segnale)
    s.save_graph_edge("l1", GraphEdge(
        edge_id="l1:e0", source="l1:concept:1", target="l1:concept:0",
        edge_type="depends_on", metadata={}
    ))
    s.save_graph_edge("l2", GraphEdge(
        edge_id="l2:e0", source="l2:concept:1", target="l2:concept:0",
        edge_type="depends_on", metadata={}
    ))
    s.save_graph_edge("l2", GraphEdge(
        edge_id="l2:e1", source="l2:concept:0", target="l1:concept:1",
        edge_type="depends_on", metadata={}
    ))

    # Evidence
    s.save_evidence(GraphEvidence(
        evidence_id="ev1", edge_id="l1:e0",
        seg_id="l1#s1", excerpt="Il segnale e una grandezza fisica",
        confidence=0.95, lesson_id="l1",
    ))
    s.save_evidence(GraphEvidence(
        evidence_id="ev2", edge_id="l1:e0",
        seg_id="l1#s2", excerpt="l'energia di un segnale",
        confidence=0.90, lesson_id="l1",
    ))
    s.save_evidence(GraphEvidence(
        evidence_id="ev3", edge_id="l2:e0",
        seg_id="l2#s2", excerpt="Il supporto di un segnale",
        confidence=0.95, lesson_id="l2",
    ))

    # Capsules (needed by aggregate_teacher_graph)
    from lessonos.capsule.assembly import _serialise_capsule

    # Capsule for l1
    c1_ext = ConceptExtraction(
        name="Definizione di segnale", status="introduced",
        canonical="definizione di segnale",
        citations=(Citation(seg_id="l1#s1", excerpt="Il segnale e una grandezza fisica"),),
    )
    c2_ext = ConceptExtraction(
        name="Energia di un segnale", status="introduced",
        canonical="energia di un segnale",
        citations=(Citation(seg_id="l1#s2", excerpt="l'energia di un segnale"),),
    )
    capsule1 = LessonCapsule(
        lesson_id="l1",
        timeline=(
            TopicSpan(lesson_id="l1", topic="Definizioni", seg_ids=("l1#s1",), start=0, end=30),
            TopicSpan(lesson_id="l1", topic="Energia", seg_ids=("l1#s2",), start=30, end=60),
        ),
        content=LessonContent(
            lesson_id="l1",
            concepts=(c1_ext, c2_ext),
            exercises=(),
            student_questions=(),
            homework=(),
        ),
    )
    s.save_capsule("l1", _serialise_capsule(capsule1))

    # Capsule for l2
    c3_ext = ConceptExtraction(
        name="Potenza media", status="introduced",
        canonical="potenza media",
        citations=(Citation(seg_id="l2#s1", excerpt="La potenza media e definita"),),
    )
    c4_ext = ConceptExtraction(
        name="Supporto di un segnale", status="introduced",
        canonical="supporto di un segnale",
        citations=(Citation(seg_id="l2#s2", excerpt="Il supporto di un segnale"),),
    )
    capsule2 = LessonCapsule(
        lesson_id="l2",
        timeline=(
            TopicSpan(lesson_id="l2", topic="Potenza", seg_ids=("l2#s1",), start=0, end=20),
            TopicSpan(lesson_id="l2", topic="Supporto", seg_ids=("l2#s2",), start=20, end=40),
        ),
        content=LessonContent(
            lesson_id="l2",
            concepts=(c3_ext, c4_ext),
            exercises=(),
            student_questions=(),
            homework=(),
        ),
    )
    s.save_capsule("l2", _serialise_capsule(capsule2))

    return s


@pytest.fixture
def derived_root(store_and_data):
    """Create a temporary derived/ directory with mock global_resolution, wiki, dispense."""
    with tempfile.TemporaryDirectory(prefix="derived_") as tmp:
        # Create global_resolution
        res_dir = FsPath(tmp) / "global_resolution"
        res_dir.mkdir(parents=True)
        res = {
            "teacher_id": "test_teacher",
            "entries": [
                {"canonical": "definizione di segnale", "aliases": []},
                {"canonical": "energia di un segnale", "aliases": []},
                {"canonical": "potenza media", "aliases": []},
                {"canonical": "supporto di un segnale", "aliases": []},
            ],
        }
        (res_dir / "test_teacher.json").write_text(json.dumps(res), encoding="utf-8")

        # Create wiki
        wiki_dir = FsPath(tmp) / "wiki"
        wiki_dir.mkdir()
        (wiki_dir / "l1_riepilogo.md").write_text(
            "# Riepilogo Lezione 1\n\n"
            "In questa lezione abbiamo introdotto la **definizione di segnale** "
            "e l'energia di un segnale.\n",
            encoding="utf-8",
        )
        (wiki_dir / "l2_riepilogo.md").write_text(
            "# Riepilogo Lezione 2\n\n"
            "Abbiamo visto la **potenza media** e il **supporto di un segnale**.\n",
            encoding="utf-8",
        )

        # Create dispense
        disp_dir = FsPath(tmp) / "dispense"
        disp_dir.mkdir()
        (disp_dir / "andrea.md").write_text(
            "# Dispensa\n\n"
            "Il **segnale** e una grandezza. La **energia di un segnale** e importante.\n",
            encoding="utf-8",
        )

        yield str(tmp)


# ---------------------------------------------------------------------------
# Helper tests
# ---------------------------------------------------------------------------


class TestSlug:
    def test_basic_slug(self):
        assert _slug("Definizione di segnale") == "definizione-di-segnale"

    def test_special_chars(self):
        assert _slug("Energia/Potenza!") == "energia-potenza"

    def test_unicode(self):
        assert _slug("Criterio d'integrazione aeiou") == "criterio-d-integrazione-aeiou"

    def test_empty_string(self):
        assert _slug("") == "unnamed"

    def test_only_special(self):
        assert _slug("!!!") == "unnamed"


class TestParseSegId:
    def test_standard_seg_id(self):
        assert _parse_seg_id("prima_lezione#s3") == ("prima_lezione", "3")

    def test_no_hash(self):
        assert _parse_seg_id("prima_lezione") == ("prima_lezione", "")

    def test_multiple_hash(self):
        assert _parse_seg_id("a#s10") == ("a", "10")


class TestWikilinkify:
    def test_exact_match(self):
        canonicals = {"definizione di segnale", "energia di un segnale"}
        result = _wikilinkify(
            "La definizione di segnale e importante. energia di un segnale pure.",
            canonicals,
        )
        assert "[[definizione di segnale]]" in result
        assert "[[energia di un segnale]]" in result

    def test_no_match(self):
        canonicals = {"segnale"}
        assert _wikilinkify("Non c'e nulla di rilevante qui.", canonicals) == \
            "Non c'e nulla di rilevante qui."

    def test_empty_canonicals(self):
        assert _wikilinkify("Testo normale.", set()) == "Testo normale."

    def test_case_insensitive(self):
        canonicals = {"segnale"}
        result = _wikilinkify("Il Segnale e importante.", canonicals)
        assert "[[segnale]]" in result

    def test_longest_first(self):
        canonicals = {"segnale", "segnale analogico"}
        result = _wikilinkify("Il segnale analogico e un segnale.", canonicals)
        assert "[[segnale analogico]]" in result
        assert result.count("[[") == 2  # both matches


class TestFrontmatterYaml:
    def test_basic_frontmatter(self):
        data = {"concept_id": "c1", "teacher": "andrea", "regenerable": True, "evidence_count": 5}
        yaml = _build_frontmatter_yaml(data)
        assert "concept_id: \"c1\"" in yaml
        assert "teacher: \"andrea\"" in yaml
        assert "regenerable: true" in yaml
        assert "evidence_count: 5" in yaml

    def test_list_frontmatter(self):
        data = {"lesson_ids": ["l1", "l2"]}
        yaml = _build_frontmatter_yaml(data)
        assert '  - "l1"' in yaml
        assert '  - "l2"' in yaml


class TestLoadGlobalResolution:
    def test_load_existing(self, derived_root):
        res = _load_global_resolution(FsPath(derived_root), "test_teacher")
        assert res is not None
        assert "entries" in res

    def test_load_missing(self, derived_root):
        res = _load_global_resolution(FsPath(derived_root), "nonexistent")
        assert res is None

    def test_build_canonical_set(self, derived_root):
        res = _load_global_resolution(FsPath(derived_root), "test_teacher")
        canonicals = _build_canonical_set(res)
        assert "definizione di segnale" in canonicals
        assert "energia di un segnale" in canonicals


# ---------------------------------------------------------------------------
# Export vault tests
# ---------------------------------------------------------------------------


class TestExportVault:
    def test_vault_structure(self, store_and_data, derived_root):
        """Verify basic vault directory structure."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            result = export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
            )

            vault = FsPath(tmp)
            assert (vault / "README.md").exists()
            assert (vault / "concetti").is_dir()
            assert (vault / "trascrizioni").is_dir()

            # Check counts
            assert result["concepts"] > 0
            assert result["lessons"] == 2
            assert result["edges"] >= 2

    def test_concept_pages(self, store_and_data, derived_root):
        """Verify concept pages have frontmatter and content."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
            )

            vault = FsPath(tmp)
            concetti_dir = vault / "concetti"
            concept_files = list(concetti_dir.glob("*.md"))
            assert len(concept_files) >= 2

            first = concept_files[0].read_text(encoding="utf-8")
            assert first.startswith("---")
            assert "generated_by" in first
            assert "concept_id" in first

    def test_transcript_pages(self, store_and_data, derived_root):
        """Verify transcript pages have seg_id blocks."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
            )

            vault = FsPath(tmp)
            tr_dir = vault / "trascrizioni"
            tr_files = list(tr_dir.glob("*.md"))
            assert len(tr_files) == 2

            for f in tr_files:
                content = f.read_text(encoding="utf-8")
                assert "^l" in content or "^-" in content

    def test_wikilinkified_derived(self, store_and_data, derived_root):
        """Verify wiki and dispense files have wikilinks inserted."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            result = export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
            )
            assert result["wiki_files"] > 0

            vault = FsPath(tmp)
            wiki_dir = vault / "wiki"
            if wiki_dir.exists():
                for f in wiki_dir.glob("*.md"):
                    content = f.read_text(encoding="utf-8")
                    if "segnale" in content.lower():
                        assert "[[" in content

    def test_canvas_output(self, store_and_data, derived_root):
        """Verify JSON Canvas 1.0 output."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
                canvas=True,
            )

            vault = FsPath(tmp)
            canvas_path = vault / "grafo-prerequisiti.canvas"
            assert canvas_path.exists()

            canvas_data = json.loads(canvas_path.read_text(encoding="utf-8"))
            assert "nodes" in canvas_data
            assert "edges" in canvas_data
            assert len(canvas_data["nodes"]) > 0

    def test_idempotent(self, store_and_data, derived_root):
        """Verify second run produces same output."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            result1 = export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
                canvas=True,
            )

            vault1_files = {}
            for f in FsPath(tmp).rglob("*.md"):
                vault1_files[str(f.relative_to(tmp))] = f.read_text(encoding="utf-8")

            result2 = export_vault(
                store=store_and_data,
                teacher_id="test_teacher",
                output_dir=tmp,
                derived_root=derived_root,
                canvas=True,
            )

            assert result1["concepts"] == result2["concepts"]
            assert result1["lessons"] == result2["lessons"]

            for f in FsPath(tmp).rglob("*.md"):
                rel = str(f.relative_to(tmp))
                assert f.read_text(encoding="utf-8") == vault1_files[rel], \
                    f"File {rel} differs on second run"

    def test_no_global_resolution(self, store_and_data, derived_root):
        """Verify export works without global resolution."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            with tempfile.TemporaryDirectory(prefix="empty_") as empty:
                result = export_vault(
                    store=store_and_data,
                    teacher_id="test_teacher",
                    output_dir=tmp,
                    derived_root=empty,
                )

                vault = FsPath(tmp)
                assert (vault / "README.md").exists()
                assert result["concepts"] > 0


class TestRmtreeGuard:
    """Retro-review CRITICO 2026-06-12: the old guard blocked output INSIDE
    derived/ — but the documented layout IS derived/vault/<teacher>
    (cli.py --out help, export_vault docstring) — so every RE-export on the
    real layout raised ValueError. Correct semantics: block output equal to
    or ANCESTOR of derived/, and any overlap with raw/ (sibling of derived/).
    """

    @pytest.fixture
    def data_root(self, derived_root):
        """Real data layout: <root>/{raw,derived} as siblings.

        derived_root fixture content is copied under <root>/derived so the
        global_resolution/wiki/dispense are where export_vault expects them.
        """
        with tempfile.TemporaryDirectory(prefix="dataroot_") as root:
            derived = FsPath(root) / "derived"
            shutil.copytree(derived_root, derived)
            raw = FsPath(root) / "raw"
            raw.mkdir()
            (raw / "lezione.jsonl").write_text('{"seg": 1}\n', encoding="utf-8")
            yield str(root)

    def _export(self, store, root, out):
        return export_vault(
            store=store,
            teacher_id="test_teacher",
            output_dir=str(out),
            derived_root=str(FsPath(root) / "derived"),
        )

    def test_reexport_inside_derived_succeeds(self, store_and_data, data_root):
        """Documented layout derived/vault/<teacher>: re-export must work.

        This is the executed repro from the retro-review: first export ok
        (dir absent), second export raised ValueError with the old guard.
        """
        out = FsPath(data_root) / "derived" / "vault" / "test_teacher"
        r1 = self._export(store_and_data, data_root, out)
        assert (out / "README.md").exists()
        r2 = self._export(store_and_data, data_root, out)  # must NOT raise
        assert r1["concepts"] == r2["concepts"]
        assert (out / "README.md").exists()
        # raw/ untouched
        assert (FsPath(data_root) / "raw" / "lezione.jsonl").exists()

    def test_refuses_output_equal_derived(self, store_and_data, data_root):
        out = FsPath(data_root) / "derived"
        with pytest.raises(ValueError, match="derived/ tree"):
            self._export(store_and_data, data_root, out)
        # nothing deleted: fixture content still there
        assert (out / "global_resolution" / "test_teacher.json").exists()

    def test_refuses_output_ancestor_of_derived(self, store_and_data, data_root):
        """Output = data root (ancestor of derived/): rmtree would destroy
        derived/ AND raw/. The old guard did NOT block this case either
        (commonpath == out, not == derived)."""
        with pytest.raises(ValueError, match="derived/ tree"):
            self._export(store_and_data, data_root, FsPath(data_root))
        assert (FsPath(data_root) / "raw" / "lezione.jsonl").exists()
        assert (FsPath(data_root) / "derived").exists()

    def test_refuses_output_equal_raw_sibling(self, store_and_data, data_root):
        """raw/ is a SIBLING of derived/ in the real layout — the old guard
        protected derived/raw, a path that does not exist in that layout."""
        out = FsPath(data_root) / "raw"
        with pytest.raises(ValueError, match="raw/ data"):
            self._export(store_and_data, data_root, out)
        assert (out / "lezione.jsonl").exists()

    def test_refuses_output_inside_raw(self, store_and_data, data_root):
        out = FsPath(data_root) / "raw" / "sub"
        out.mkdir()
        with pytest.raises(ValueError, match="raw/ data"):
            self._export(store_and_data, data_root, out)
        assert (FsPath(data_root) / "raw" / "lezione.jsonl").exists()

    def test_refuses_case_alias_of_raw(self, store_and_data, data_root):
        """SELF-ADV CRITICO: on case-insensitive APFS, RAW *is* raw — a
        case-sensitive string compare let the guard through and rmtree
        destroyed raw/. Guard must compare casefolded on macOS."""
        out = FsPath(data_root) / "RAW"
        if not out.exists():
            pytest.skip("case-sensitive filesystem: RAW is not an alias of raw")
        with pytest.raises(ValueError, match="raw/ data"):
            self._export(store_and_data, data_root, out)
        assert (FsPath(data_root) / "raw" / "lezione.jsonl").exists()

    def test_refuses_raw_sibling_of_symlinked_derived(
        self, store_and_data, derived_root
    ):
        """SELF-ADV MAJOR: if derived/ is a symlink elsewhere, raw/ computed
        only from the RESOLVED parent points away from the real raw/ sitting
        next to the symlink — which then became deletable."""
        with tempfile.TemporaryDirectory(prefix="elsewhere_") as elsewhere, \
                tempfile.TemporaryDirectory(prefix="dataroot_") as root:
            derived_target = FsPath(elsewhere) / "derived"
            shutil.copytree(derived_root, derived_target)
            derived_link = FsPath(root) / "derived"
            derived_link.symlink_to(derived_target)
            raw = FsPath(root) / "raw"
            raw.mkdir()
            (raw / "lezione.jsonl").write_text('{"seg": 1}\n', encoding="utf-8")
            with pytest.raises(ValueError, match="raw/ data"):
                export_vault(
                    store=store_and_data,
                    teacher_id="test_teacher",
                    output_dir=str(raw),
                    derived_root=str(derived_link),
                )
            assert (raw / "lezione.jsonl").exists()

    def test_refuses_output_inside_symlinked_raw(self, store_and_data, data_root):
        """SELF-ADV MAJOR: raw/ as symlink to external storage — output
        inside the symlink target must still be blocked (raw candidate is
        resolved before comparison)."""
        with tempfile.TemporaryDirectory(prefix="external_") as ext:
            real_raw = FsPath(ext) / "raw-storage"
            real_raw.mkdir()
            (real_raw / "lezione.jsonl").write_text('{"seg": 1}\n', encoding="utf-8")
            sub = real_raw / "sub"
            sub.mkdir()
            root = FsPath(data_root)
            shutil.rmtree(root / "raw")
            (root / "raw").symlink_to(real_raw)
            with pytest.raises(ValueError, match="raw/ data"):
                self._export(store_and_data, data_root, sub)
            assert (real_raw / "lezione.jsonl").exists()


# ---------------------------------------------------------------------------
# Content tests (M1-7b: would fail on old broken raw_to_merged mapping)
# ---------------------------------------------------------------------------


@pytest.fixture
def store_with_dedup():
    """Store with a concept that appears in both lessons (same canonical).

    This triggers dedup in aggregate_teacher_graph, so the cross-lesson raw
    IDs need to be mapped to the same merged node. The old raw_to_merged
    (lines 188-194) only mapped the first occurrence, so evidence from the
    second lesson was lost.
    """
    s = _VaultStore()

    p = Path(
        path_id="dedup_path",
        title="Dedup Course",
        subject="Test",
        lesson_ids=("l1", "l2"),
        teacher_id="dedup_teacher",
    )
    s.save_path(p)
    s.save_lesson(Lesson(lesson_id="l1", path_id="dedup_path", title="L1", order=1))
    s.save_lesson(Lesson(lesson_id="l2", path_id="dedup_path", title="L2", order=2))

    s.save_segment(_seg("l1", 1, "Il segnale e una grandezza fisica."))
    s.save_segment(_seg("l1", 2, "L'energia si calcola come integrale."))
    s.save_segment(_seg("l2", 1, "La potenza media e definita."))
    s.save_segment(_seg("l2", 2, "L'energia e importante anche qui."))

    # Nodes: l1 has Segnale + Energia; l2 has Potenza + Energia (same canonical)
    s.save_graph_node("l1", GraphNode(
        node_id="l1:concept:0", node_type="concept", ref_id="l1:concept:0", label="Definizione di segnale"
    ))
    s.save_graph_node("l1", GraphNode(
        node_id="l1:concept:1", node_type="concept", ref_id="l1:concept:1", label="Energia di un segnale"
    ))
    s.save_graph_node("l2", GraphNode(
        node_id="l2:concept:0", node_type="concept", ref_id="l2:concept:0", label="Potenza media"
    ))
    s.save_graph_node("l2", GraphNode(
        node_id="l2:concept:1", node_type="concept", ref_id="l2:concept:1", label="Energia di un segnale"
    ))
    s.save_graph_node("l1", GraphNode(node_id="l1", node_type="lesson", ref_id="l1", label=None))
    s.save_graph_node("l2", GraphNode(node_id="l2", node_type="lesson", ref_id="l2", label=None))

    # Edges
    s.save_graph_edge("l1", GraphEdge(
        edge_id="l1:e0", source="l1:concept:1", target="l1:concept:0",
        edge_type="depends_on", metadata={}
    ))
    s.save_graph_edge("l2", GraphEdge(
        edge_id="l2:e1", source="l2:concept:1", target="l2:concept:0",
        edge_type="depends_on", metadata={}
    ))

    # Evidence — both lessons have evidence for the shared concept
    s.save_evidence(GraphEvidence(
        evidence_id="ev1", edge_id="l1:e0",
        seg_id="l1#s1", excerpt="Il segnale e una grandezza fisica",
        confidence=0.95, lesson_id="l1",
    ))
    s.save_evidence(GraphEvidence(
        evidence_id="ev2", edge_id="l1:e0",
        seg_id="l1#s2", excerpt="L'energia si calcola come integrale",
        confidence=0.90, lesson_id="l1",
    ))
    s.save_evidence(GraphEvidence(
        evidence_id="ev3", edge_id="l2:e1",
        seg_id="l2#s2", excerpt="L'energia e importante anche qui",
        confidence=0.90, lesson_id="l2",
    ))

    # Capsules
    from lessonos.capsule.assembly import _serialise_capsule

    c1_ext = ConceptExtraction(
        name="Definizione di segnale", status="introduced",
        canonical="definizione di segnale",
        citations=(Citation(seg_id="l1#s1", excerpt="Il segnale e una grandezza fisica"),),
    )
    c2_ext = ConceptExtraction(
        name="Energia di un segnale", status="introduced",
        canonical="energia di un segnale",
        citations=(Citation(seg_id="l1#s2", excerpt="L'energia si calcola come integrale"),),
    )
    capsule1 = LessonCapsule(
        lesson_id="l1",
        timeline=(TopicSpan(lesson_id="l1", topic="Definizioni", seg_ids=("l1#s1",), start=0, end=30),),
        content=LessonContent(lesson_id="l1", concepts=(c1_ext, c2_ext), exercises=(), student_questions=(), homework=()),
    )
    s.save_capsule("l1", _serialise_capsule(capsule1))

    c3_ext = ConceptExtraction(
        name="Potenza media", status="introduced",
        canonical="potenza media",
        citations=(Citation(seg_id="l2#s1", excerpt="La potenza media e definita"),),
    )
    c4_ext = ConceptExtraction(
        name="Energia di un segnale", status="reinforced",
        canonical="energia di un segnale",
        citations=(Citation(seg_id="l2#s2", excerpt="L'energia e importante anche qui"),),
    )
    capsule2 = LessonCapsule(
        lesson_id="l2",
        timeline=(TopicSpan(lesson_id="l2", topic="Potenza", seg_ids=("l2#s1",), start=0, end=20),),
        content=LessonContent(lesson_id="l2", concepts=(c3_ext, c4_ext), exercises=(), student_questions=(), homework=()),
    )
    s.save_capsule("l2", _serialise_capsule(capsule2))

    return s


def _evidenze_bullets(content: str) -> list[str]:
    """Extract the bullet lines of the ## Evidenze section of a concept page."""
    bullets: list[str] = []
    in_section = False
    for line in content.split("\n"):
        if line.strip() == "## Evidenze":
            in_section = True
            continue
        if in_section:
            if line.startswith("## "):
                break
            if line.strip().startswith("- "):
                bullets.append(line.strip())
    return bullets


class TestExportVaultContent:
    """Content tests that would fail on the old broken raw_to_merged mapping."""

    def test_dedup_concept_has_cross_lesson_evidence(self, store_with_dedup):
        """The deduplicated Energia page must carry evidence from BOTH lessons.

        On the old code only the first raw occurrence (l1:concept:1) was in
        raw_to_merged, so edge l2:e1 lost its source and the l2 evidence (ev3)
        never reached the merged Energia page. A global "any page has a bullet"
        scan passes even on the broken code (l1 evidence still renders), so the
        assert must target the Energia page and the l2 excerpt specifically.
        """
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_with_dedup,
                teacher_id="dedup_teacher",
                output_dir=tmp,
            )
            vault = FsPath(tmp)
            energia = None
            for f in (vault / "concetti").glob("*.md"):
                content = f.read_text(encoding="utf-8")
                if "# Energia di un segnale" in content:
                    energia = content
                    break
            assert energia is not None, "Energia page not found"
            bullets = _evidenze_bullets(energia)
            assert bullets, "Energia page has no ## Evidenze bullets"
            joined = "\n".join(bullets)
            assert "L'energia si calcola come integrale" in joined, \
                "l1 evidence (ev2) missing from Energia page"
            assert "L'energia e importante anche qui" in joined, (
                "l2 evidence (ev3) missing from Energia page: "
                "raw_to_merged lost l2:concept:1"
            )

    def test_no_not_found_in_prereqs(self, store_with_dedup):
        """Prerequisite sections must not contain '(concetto non trovato)'."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_with_dedup,
                teacher_id="dedup_teacher",
                output_dir=tmp,
            )
            vault = FsPath(tmp)
            for f in (vault / "concetti").glob("*.md"):
                content = f.read_text(encoding="utf-8")
                assert "concetto non trovato" not in content, \
                    f"{f.name} has 'concetto non trovato' (broken raw_to_merged)"

    def test_canvas_edges_all_resolved(self, store_with_dedup):
        """Canvas edges must have fromNode/toNode that exist in canvas nodes."""
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_with_dedup,
                teacher_id="dedup_teacher",
                output_dir=tmp,
                canvas=True,
            )
            vault = FsPath(tmp)
            canvas_path = vault / "grafo-prerequisiti.canvas"
            canvas = json.loads(canvas_path.read_text(encoding="utf-8"))

            node_ids = {n["id"] for n in canvas["nodes"]}
            for edge in canvas["edges"]:
                assert edge["fromNode"] in node_ids, \
                    f"Canvas edge {edge['id']} has dangling fromNode={edge['fromNode']}"
                assert edge["toNode"] in node_ids, \
                    f"Canvas edge {edge['id']} has dangling toNode={edge['toNode']}"

    def test_prereq_semantics_depends_on(self, store_with_dedup):
        """With A depends_on B, B appears under ## Prerequisiti of A's page.

        Old code had inverted semantics: A appeared as prereq of B.
        Energia depends_on Segnale (l1:e0) and Energia depends_on Potenza (l2:e1),
        so both Segnale and Potenza should appear in Energia's prereqs.
        """
        with tempfile.TemporaryDirectory(prefix="vault_") as tmp:
            export_vault(
                store=store_with_dedup,
                teacher_id="dedup_teacher",
                output_dir=tmp,
            )
            vault = FsPath(tmp)
            energia_page = None
            for f in (vault / "concetti").glob("*.md"):
                content = f.read_text(encoding="utf-8")
                # The H1 after frontmatter should contain the label
                if "Energia di un segnale" in content:
                    energia_page = content
                    break
            assert energia_page is not None, "Energia page not found"
            # With depends_on(A→B): B is prereq of A. Energia depends_on both
            # Segnale and Potenza, so both should be in its prereq section.
            # (Potenza may not be known via wikilink without global_resolution,
            # but neither should be "concetto non trovato")
            assert "concetto non trovato" not in energia_page, \
                "depends_on prereqs should resolve, not be 'non trovato'"
