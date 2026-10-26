from copy import deepcopy
from fractions import Fraction
import importlib.metadata
import json
import pytest
from s19_circuit_lab.adapter import (
    DEFAULT_DOCUMENT,
    SOURCE_SHA,
    netlist,
    solve,
    diagnose,
    export_document,
    read_document,
)


def circuit(v="12", r1="100", r2="200"):
    d = deepcopy(DEFAULT_DOCUMENT)
    for c, value in zip(d["components"], (v, r1, r2)):
        c["value"] = value
    return d


def test_installed_dependency_is_the_pinned_vcs_checkout():
    meta = importlib.metadata.distribution("kirchhoff")
    url = json.loads(meta.read_text("direct_url.json"))
    assert url["dir_info"]["editable"] is True
    import pathlib, subprocess, kirchhoff

    root = pathlib.Path(kirchhoff.__file__).resolve().parents[2]
    assert (
        subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
        ).strip()
        == SOURCE_SHA
    )


@pytest.mark.parametrize(
    "v,r1,r2",
    [
        ("12", "100", "200"),
        ("-9", "30", "60"),
        ("1/3", "7", "11"),
        ("0", "1", "2"),
        ("1000", "1/1000000", "1000000000"),
    ],
)
def test_voltage_divider_against_independent_formula(v, r1, r2):
    result = solve(circuit(v, r1, r2))
    assert result["lesson"]["outcome"] == "solved"
    answer = result["lesson"]["answer"]
    assert Fraction(answer["exact"]) == Fraction(v) * Fraction(r2) / (
        Fraction(r1) + Fraction(r2)
    )
    assert answer["unit"] == "V"
    assert result["lesson"]["verification"]["product_verified"] is False
    assert result["lesson"]["source_sha"] == SOURCE_SHA


def test_kcl_correct_incorrect_and_unsupported_use_upstream_diagnosis():
    d = circuit()
    fingerprint = solve(d)["fingerprint"]
    d["trace"] = {
        "schema": "student-trace.v1",
        "circuit_fingerprint": fingerprint,
        "steps": [
            {
                "transcription": "KCL al nodo a",
                "operation": "kcl",
                "first": "a",
                "second": "-R1,+R2",
            }
        ],
    }
    assert diagnose(d)["outcome"] == "valid_so_far"
    d["trace"]["steps"][0]["second"] = "+R1,+R2"
    assert diagnose(d)["outcome"] == "first_invalid"
    d["trace"]["steps"][0]["operation"] = "metodo-non-supportato"
    assert diagnose(d)["outcome"] == "not_assessable"


def test_parameter_or_topology_change_invalidates_old_steps():
    d = circuit()
    fp = solve(d)["fingerprint"]
    d["trace"] = {
        "schema": "student-trace.v1",
        "circuit_fingerprint": fp,
        "steps": [
            {
                "transcription": "8V",
                "operation": "tensione",
                "first": "R2",
                "second": "a,0",
                "claimed_value": "8",
            }
        ],
    }
    assert diagnose(d)["outcome"] == "valid_so_far"
    d["components"][2]["value"] = "300"
    with pytest.raises(ValueError, match="cambiato"):
        diagnose(d)
    d["trace"] = None
    assert solve(d)["lesson"]["answer"]["exact"] == "9"


@pytest.mark.parametrize(
    "mutate",
    [
        lambda d: d["components"][1].update(value="0"),
        lambda d: d["components"][1].update(value="nan"),
        lambda d: d["components"][1].update(value="1e100000"),
        lambda d: d["components"][1].update(a="b", b="b"),
        lambda d: d["components"][1].update(id="V1"),
        lambda d: d["components"][1].update(kind="C"),
        lambda d: d["components"][1].update(a="a\n? current V1"),
        lambda d: d.update(answer={"exact": "666"}),
    ],
)
def test_invalid_component_input_or_imported_result_is_rejected(mutate):
    d = circuit()
    mutate(d)
    with pytest.raises(ValueError):
        read_document(d)


def test_floating_and_contradictory_sources_do_not_claim_a_solution():
    d = circuit()
    d["components"][0]["b"] = "floating"
    result = solve(d)
    assert result["lesson"]["outcome"] in ("refusal", "failure")
    d = circuit()
    d["components"].append({"id": "V2", "kind": "V", "a": "b", "b": "0", "value": "7"})
    assert solve(d)["lesson"]["outcome"] != "solved"


def test_original_modified_export_and_cold_reopen_ignore_no_proofs():
    d = circuit()
    before = solve(d)
    saved = export_document(d, "json")
    reopened = read_document(json.loads(saved))
    assert solve(reopened)["lesson"]["answer"] == before["lesson"]["answer"]
    assert "R1 b a 100" in export_document(d, "spice")
    assert "circuitikz" in export_document(d, "circuitikz")
    d["components"][1]["b"] = "0"
    d["components"][2]["a"] = "b"
    after = solve(d)
    assert after["fingerprint"] != before["fingerprint"]
    assert after["lesson"]["answer"]["exact"] == "12"


def test_new_current_source_network_and_no_prediction_grader_duplication():
    d = circuit()
    d["components"] = [
        {"id": "I1", "kind": "I", "a": "0", "b": "a", "value": "3"},
        {"id": "R1", "kind": "R", "a": "a", "b": "0", "value": "2"},
        {"id": "R2", "kind": "R", "a": "a", "b": "0", "value": "4"},
    ]
    assert solve(d)["lesson"]["answer"]["exact"] == "4"
    d["question"] = {"quantity": "current", "target": "R1"}
    assert solve(d)["lesson"]["answer"]["exact"] == "2"


def test_wrong_engine_revision_is_rejected_without_solving():
    import pathlib, kirchhoff
    from s19_circuit_lab.engine import validate_checkout

    with pytest.raises(ValueError, match="revisione"):
        validate_checkout(
            pathlib.Path(kirchhoff.__file__).resolve().parents[2], "0" * 40
        )


def test_unbounded_trace_exponents_are_rejected_before_upstream_arithmetic(monkeypatch):
    import kirchhoff.domain.student_trace as upstream

    original = upstream.Fraction

    def bounded(value=0, *args, **kwargs):
        if isinstance(value, str) and "e" in value.lower():
            raise AssertionError("Unsafe exponent reached upstream arithmetic")
        return original(value, *args, **kwargs)

    monkeypatch.setattr(upstream, "Fraction", bounded)
    d = circuit()
    from hashlib import sha256

    d["trace"] = {
        "schema": "student-trace.v1",
        "circuit_fingerprint": sha256(netlist(d).encode()).hexdigest(),
        "steps": [
            {
                "transcription": "V",
                "operation": "tensione",
                "first": "R2",
                "second": "a,0",
                "claimed_value": "1e1000000000",
            }
        ],
    }
    with pytest.raises(ValueError):
        diagnose(d)


def test_huge_layout_integer_is_a_validation_error():
    d = circuit()
    d["layout"] = {"a": {"x": 10**400, "y": 0}}
    with pytest.raises(ValueError):
        read_document(d)


def test_kcl_topology_alone_does_not_assess_a_circuit_refused_by_the_lesson():
    from hashlib import sha256

    d = circuit()
    d["components"].append({"id": "V2", "kind": "V", "a": "b", "b": "0", "value": "7"})
    d["trace"] = {
        "schema": "student-trace.v1",
        "circuit_fingerprint": sha256(netlist(d).encode()).hexdigest(),
        "steps": [
            {
                "transcription": "KCL",
                "operation": "kcl",
                "first": "b",
                "second": "+V1,+R1,+V2",
            }
        ],
    }
    assert diagnose(d)["outcome"] == "not_assessable"


def test_missing_engine_checkout_is_a_bounded_availability_error(tmp_path):
    from s19_circuit_lab.engine import validate_checkout
    with pytest.raises(ValueError,match='non disponibile'):validate_checkout(tmp_path/'missing-engine')
