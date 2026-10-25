"""The finite public projection is complete and checked against rational SI oracles."""
from fractions import Fraction
import importlib.util
from pathlib import Path

import pytest


def test_all_public_spring_states_cover_the_controls_and_obey_force_balance_and_triangle_work():
    root = Path(__file__).resolve().parents[4]
    spec = importlib.util.spec_from_file_location('public_export', root / 'bin/web/export_public_preview.py')
    exporter = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(exporter)
    projection = exporter.build_projection()
    spring = projection['spring']
    states = spring['cases']
    expected = {(Fraction(force, 2), stiffness) for force in range(21) for stiffness in (20, 40, 80)}
    assert {(Fraction(str(case['parameters']['force'])), case['parameters']['stiffness']) for case in states} == expected
    assert len(states) == len(expected) == 63
    for case in states:
        force = Fraction(str(case['parameters']['force']))
        stiffness = Fraction(case['parameters']['stiffness'])
        extension = force / stiffness
        # Work is the area under the straight force-displacement graph, in N m.
        work = force * extension / 2
        assert case['result']['value'] == pytest.approx(float(extension), abs=1e-14)
        assert case['result']['elasticEnergyJ'] == pytest.approx(float(work), abs=1e-14)
        assert 0 <= case['result']['value'] <= spring['maxExtension']
    assert projection['demonstration']['provenance'] == 'DEMO'
    assert projection['demonstration']['humanEditorialApproval'] is False
