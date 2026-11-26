"""Independent energy balance derived before reading candidate168 editions.

This module does not import authoring code, read source answers, or approve an
edition. Exact conservation and physical-domain checks can be reused by the
subsequent individual candidate review.
"""
from fractions import Fraction


def _positive(value):
    value = Fraction(value)
    if value <= 0:
        raise ValueError('Positive physical quantity required')
    return value


def duration(power, loss, energy=120):
    power, loss, energy = map(_positive, (power, loss, energy))
    if power <= loss:
        raise ValueError('Heating requires input power strictly greater than loss')
    return energy / (power - loss)


def input_power(time, loss, energy=120):
    time, loss, energy = map(_positive, (time, loss, energy))
    return loss + energy / time


def loss_power(time, power, energy=120):
    time, power, energy = map(_positive, (time, power, energy))
    return _positive(power - energy / time)


def scaled_duration_ratio(power, loss, input_factor, loss_factor):
    input_factor, loss_factor = map(_positive, (input_factor, loss_factor))
    first = duration(power, loss)
    second = duration(Fraction(power) * input_factor, Fraction(loss) * loss_factor)
    return second / first


def affine_calibration(first_time, second_time, first_reading, second_reading):
    first_time, second_time = map(_positive, (first_time, second_time))
    if first_time == second_time:
        raise ValueError('Distinct reference times required to identify gain and offset')
    gain = _positive((Fraction(first_reading) - Fraction(second_reading)) / (first_time - second_time))
    return gain, Fraction(first_reading) - gain * first_time


def time_from_reading(reading, gain, offset=0):
    gain = _positive(gain)
    return _positive((Fraction(reading) - Fraction(offset)) / gain)


def numeric_primary():
    """Results of the prompt-only primary, never an original answer-key lookup."""
    first, second = duration(20, 5), duration(30, 10)
    gain, offset = affine_calibration(first, second, 17, 13)
    desired_time = Fraction(3, 4) * first
    desired_loss = loss_power(desired_time, 30)
    return {
        1: first,
        4: duration(30, 5) / first,
        5: input_power(8, 5),
        6: loss_power(8, 20),
        7: duration(20, 10) / first,
        8: 16 - first,
        11: second / first,
        12: (first + second) / 2,
        13: desired_loss / 5,
        14: input_power(time_from_reading(18, Fraction(24) / first), 10),
        15: input_power(time_from_reading(Fraction(53, 5), gain, offset), 5),
        16: Fraction(120, 8 * (4 - 1)),
    }
