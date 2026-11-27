import unittest
from multidiscipline.rational import compare


def verdict(a,b,op="equivalent"):
    return compare({"expression":a,"candidate":b,"operation":op})["verdict"]


class RationalSteps(unittest.TestCase):
    def test_removable_holes_and_irrational_or_complex_roots(self):
        for a,b,expected in [
            ("(x^2-1)/(x-1)","x+1","different-domain"), ("(1/x)/(1/x)","1","different-domain"),
            ("0/(x^2-2)","0","different-domain"), ("0/(x^2+2)","0","equivalent"),
            ("0/(x^4-x^2)","0/(x^3-x)","equivalent"), ("x/(x*x)","1/x","equivalent"),
            ("x^2/x","x+1","different"), ("(x^2+1)/(x^2+1)","1","equivalent"),
            ("1/(1/(x+2))","x+2","different-domain"), ("-x^2","(-x)^2","different"),
        ]:
            with self.subTest(a=a,b=b):
                self.assertEqual(verdict(a,b), expected)

    def test_derivative_primitive_domains_and_unknowns(self):
        self.assertEqual(verdict("1/x","-1/x^2","derivative"),"equivalent")
        self.assertEqual(verdict("x/x","x","primitive"),"equivalent")
        self.assertEqual(verdict("1","x^2/x","primitive"),"different-domain")
        self.assertEqual(verdict("3*x^2","x^3+12","primitive"),"equivalent")
        for a in ("log(x)", "1/0","(x-x)^(-1)", "x^0", "x^12345", "x*"*130+"1", "a", "x//3", "x%3", ""):
            self.assertEqual(verdict(a,"1"),"undetermined")

    def test_exact_polynomial_identities_and_changed_signs(self):
        for a in range(-5,6):
            for b in range(-5,6):
                with self.subTest(a=a,b=b):
                    expr=f"(x+({a}))*(x+({b}))"
                    expected=f"x^2+({a+b})*x+({a*b})"
                    self.assertEqual(verdict(expr,expected), "equivalent")
                    self.assertEqual(verdict(expr,expected+"+1"), "different")
                    self.assertEqual(verdict(expr,f"2*x+({a+b})","derivative"), "equivalent")
