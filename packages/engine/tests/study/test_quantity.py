"""Dimensional quantities: canonical SI signatures and prompt-unit inheritance."""
from fractions import Fraction

import pytest

from lessonos.study.quantity import canonical_unit, expected_quantity, parse_quantity


def signature(unit):
    parsed = canonical_unit(unit)
    assert parsed is not None, unit
    return parsed


@pytest.mark.parametrize('left,right', [
    ('Pa', 'N/m^2'),
    ('N', 'kg*m/s^2'),
    ('J', 'N*m'),
    ('W', 'J/s'),
    ('kPa', '1000*Pa'),
    ('L', 'dm^3'),
    ('g/cm^3', '1000*kg/m^3'),
])
def test_derived_units_have_the_same_canonical_signature(left, right):
    if left == 'kPa':
        assert parse_quantity('1 kPa') == parse_quantity('1000 Pa') == 1000
    elif left == 'L':
        assert parse_quantity('1 L') == parse_quantity('1 dm^3') == Fraction(1, 1000)
    elif left == 'g/cm^3':
        assert parse_quantity('1 g/cm^3') == parse_quantity('1000 kg/m^3') == 1000
    else:
        assert signature(left)[0] == signature(right)[0]
        assert signature(left)[1] == signature(right)[1]


def test_bare_number_inherits_the_prompt_unit_instead_of_si_base():
    assert parse_quantity('20', expected_unit='kPa') == 20000
    assert parse_quantity('20.0', expected_unit='kPa') == 20000
    assert parse_quantity('2e1', expected_unit='kPa') == 20000
    assert parse_quantity('20 kPa', expected_unit='kPa') == 20000
    assert parse_quantity('20000 Pa', expected_unit='kPa') == 20000
    assert parse_quantity('20', expected_unit='m/s') == 20
    assert parse_quantity('20 m/s', expected_unit='m/s') == 20
    assert parse_quantity('20 km/h', expected_unit='m/s') == Fraction(50, 9)


def test_expected_values_use_the_same_canonical_scale_as_answers():
    assert expected_quantity(20, 'kPa') == 20000
    assert expected_quantity(Fraction(1, 8), None) == Fraction(1, 8)
    assert expected_quantity(1, 'g/cm^3') == 1000
    assert expected_quantity(1, 'L') == Fraction(1, 1000)


@pytest.mark.parametrize('value,expected', [
    ('1e100 Pa', Fraction(10 ** 100)),
    ('1e-100 Pa', Fraction(1, 10 ** 100)),
    ('1e101 Pa', None),
    ('1e-101 Pa', None),
    ('1e100/1e-100 Pa', None),
    ('9' * 65 + ' Pa', None),
])
def test_quantities_follow_the_bounded_rational_bank_contract(value, expected):
    assert parse_quantity(value, expected_unit='Pa') == expected


@pytest.mark.parametrize('value,unit', [
    ('20 Pa', 'K'),
    ('20 Pa', 'kPa'),
    ('1 N/m', 'Pa'),
    ('1 m/s', 'm/s^2'),
    ('20 °C', 'K'),
    ('20', 'banana'),
    ('NaN', 'Pa'),
    ('Infinity', 'Pa'),
    ('1e999999', 'Pa'),
    ('__import__("os").system("id")', 'Pa'),
    ('1' * 201, 'Pa'),
])
def test_incompatible_malformed_or_unsafe_values_fail_closed(value, unit):
    parsed = parse_quantity(value, expected_unit=unit)
    if value == '20 Pa' and unit == 'kPa':
        assert parsed == 20
    else:
        assert parsed is None


def test_long_exponents_and_spurious_units_fail_closed():
    assert parse_quantity('1e1000', expected_unit='Pa') is None
    assert parse_quantity('1 Pa^999', expected_unit='Pa') is None
    assert parse_quantity('1 Pa/s', expected_unit='Pa') is None
    assert parse_quantity('1', expected_unit='Pa^999') is None
    assert parse_quantity('1', expected_unit='') == 1
