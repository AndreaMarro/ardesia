"""The plot is a bounded projection of the canonical model, never a UI solver."""
from decimal import Decimal, localcontext
from fractions import Fraction
import json
import math

import pytest

from lessonos.study.activities import evaluate_activity


@pytest.mark.parametrize('degree', [0, 3, 8])
def test_plot_samples_are_finite_canonical_values_with_independent_error_bound(degree):
    result = evaluate_activity('taylor-exp-v1', {'x': .5, 'degree': degree})
    plot = result['plot']
    assert plot['schemaVersion'] == 1 and plot['domain'] == [-1, 1]
    samples = plot['samples']
    assert len(samples) == 41
    assert [point['x'] for point in samples] == [i / 20 for i in range(-20, 21)]
    for point in samples:
        x = point['x']
        polynomial = sum((Fraction(x) ** k / math.factorial(k) for k in range(degree + 1)), Fraction(0))
        assert point['value'] == float(polynomial)
        assert all(math.isfinite(value) for value in point.values())
        with localcontext() as context:
            context.prec = 90
            exponential = Decimal.from_float(x).exp()
            assert abs(exponential - Decimal.from_float(point['value'])) <= Decimal.from_float(point['remainderBound'])
            assert point['referenceValue'] == pytest.approx(float(exponential), rel=2e-16)
        assert point['absoluteError'] == abs(point['referenceValue'] - point['value'])
        assert point['remainderBound'] >= 0
    assert result['x'] == .5
    selected = samples[30]
    for field in ('value', 'referenceValue', 'absoluteError', 'remainderBound'):
        assert result[field] == selected[field]
    json.dumps(result, allow_nan=False)
    assert result['scientificApproval'] == 'NOT_RUN'


def test_degree_changes_the_curve_and_the_bound_without_changing_the_domain():
    outputs = [evaluate_activity('taylor-exp-v1', {'x': 1, 'degree': n}) for n in (0, 3, 8)]
    assert [output['plot']['samples'][-1]['value'] for output in outputs] == [1, 8 / 3, 109601 / 40320]
    assert outputs[0]['remainderBound'] > outputs[1]['remainderBound'] > outputs[2]['remainderBound']
    assert all(output['plot']['samples'][20]['value'] == 1 for output in outputs)
    assert all(output['plot']['samples'][20]['remainderBound'] == 0 for output in outputs)
