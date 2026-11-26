"""Independent primary only: no candidate or scientific-approval claim."""
from fractions import Fraction as F
import unittest

from hypothesis import given, settings, strategies as st
import pint
import sympy as sp

from tools.corpus_engineering import heating_with_losses_oracle as m

POS = st.builds(F, st.integers(1, 100), st.integers(1, 20))
BOUNDED = settings(max_examples=40, derandomize=True, deadline=None)


class HeatingWithLossesPrimary(unittest.TestCase):
    def test_prompt_only_numeric_results_and_distinct_arithmetic_mean(self):
        self.assertEqual(m.numeric_primary(), {
            1: F(8), 4: F(3, 5), 5: F(20), 6: F(5), 7: F(3, 2),
            8: F(8), 11: F(3, 4), 12: F(7), 13: F(2),
            14: F(30), 15: F(30), 16: F(5),
        })
        model_at_means = m.duration(25, F(15, 2))
        self.assertEqual(model_at_means, F(48, 7))
        self.assertEqual(m.numeric_primary()[12] - model_at_means, F(1, 7))

    def test_conservation_integral_symbolic_inverses_and_scaling(self):
        p, loss, t, q, k1, k2 = sp.symbols('p loss t q k1 k2', positive=True)
        energy_in = sp.integrate(p, (t, 0, t))
        energy_out = sp.integrate(loss, (t, 0, t))
        equation = sp.Eq(q, energy_in - energy_out)
        law = sp.solve(equation, t)[0]
        self.assertEqual(sp.simplify(law - q / (p - loss)), 0)
        self.assertEqual(sp.simplify(sp.solve(equation, p)[0] - (loss + q / t)), 0)
        self.assertEqual(sp.simplify(sp.solve(equation, loss)[0] - (p - q / t)), 0)
        ratio = sp.cancel(law.subs({p: k1 * p, loss: k2 * loss}) / law)
        self.assertEqual(sp.simplify(ratio - (p - loss) / (k1 * p - k2 * loss)), 0)
        self.assertEqual(sp.simplify(ratio.subs(k2, k1) - 1 / k1), 0)
        self.assertEqual(sp.diff(law, p), -q / (p - loss)**2)
        self.assertEqual(sp.diff(law, loss), q / (p - loss)**2)

    def test_units_and_exact_calibration_with_offset(self):
        si = pint.UnitRegistry(non_int_type=F)
        q = si.Quantity
        time = q(120, 'joule') / (q(20, 'watt') - q(5, 'watt'))
        self.assertEqual(time.to('second').magnitude, F(8))
        self.assertEqual((q(120, 'joule') / q(8, 'second') + q(5, 'watt')).to('watt').magnitude, F(20))
        self.assertEqual(m.affine_calibration(8, 6, 17, 13), (F(2), F(1)))
        self.assertEqual(m.time_from_reading(F(53, 5), 2, 1), F(24, 5))
        self.assertNotEqual(m.time_from_reading(F(53, 5), 2, 0), F(24, 5))

    @BOUNDED
    @given(loss=POS, gap=POS, energy=POS, factor=POS)
    def test_positive_energy_balance_inverse_and_reciprocal_scale(self, loss, gap, energy, factor):
        power = loss + gap
        time = m.duration(power, loss, energy)
        self.assertEqual(power * time - loss * time, energy)
        self.assertEqual(m.input_power(time, loss, energy), power)
        self.assertEqual(m.loss_power(time, power, energy), loss)
        self.assertEqual(m.duration(factor * power, factor * loss, energy), time / factor)
        self.assertEqual(m.scaled_duration_ratio(power, loss, factor, factor), 1 / factor)

    @BOUNDED
    @given(loss=POS, gap=POS, increment=POS, energy=POS)
    def test_monotonicity_of_real_domain_and_nonlinear_mean(self, loss, gap, increment, energy):
        power = loss + gap
        first = m.duration(power, loss, energy)
        faster = m.duration(power + increment, loss, energy)
        self.assertLess(faster, first)
        self.assertGreater(m.duration(power + increment, loss + increment + gap / 2, energy), first)
        mean_of_times = (first + faster) / 2
        time_at_mean = m.duration(power + increment / 2, loss, energy)
        self.assertGreater(mean_of_times, time_at_mean)

    def test_nonphysical_and_unidentifiable_states_fail_before_division(self):
        for power, loss, energy in [(5, 5, 120), (4, 5, 120), (20, 0, 120), (20, -1, 120), (20, 5, 0)]:
            with self.subTest(power=power, loss=loss, energy=energy), self.assertRaises(ValueError):
                m.duration(power, loss, energy)
        for call in [lambda: m.input_power(0, 5), lambda: m.loss_power(8, 15),
                     lambda: m.affine_calibration(8, 8, 17, 13),
                     lambda: m.affine_calibration(8, 6, 13, 17),
                     lambda: m.time_from_reading(1, 2, 1),
                     lambda: m.scaled_duration_ratio(20, 5, F(1, 4), 1)]:
            with self.assertRaises(ValueError):
                call()


if __name__ == '__main__':
    unittest.main()
