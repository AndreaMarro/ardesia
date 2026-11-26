"""Prompt-only numerical derivations before Cric C1-Q001..050 candidate keys.
Conceptual answers remain separately reasoned in the frozen primary; this is not a verifier.
"""
import sympy as sp
from fractions import Fraction
import pint

def source_only_predictions():
    q=sp.Rational
    # One calculation for each numerical original; no source answer field read.
    return {
        'C1-Q001':q(250)*q(10)**-9/q(10)**-9,
        'C1-Q004':q(4,100)/(q(80)*q(10)**-6),
        'C1-Q005':q(10)**-4 if q(7)**2>10 else q(10)**-5,
        'C1-Q007':q(546,10)-q(420,10000)*1000,
        'C1-Q009':q(125,100)*q(3600,1000),
        'C1-Q011':12*sp.cos(2*sp.pi/3),
        'C1-Q012':-7+11,
        'C1-Q013':sp.sqrt((5-2)**2+(1-(-3))**2),
        'C1-Q016':q(24,10)*sp.sin(sp.pi/6),
        'C1-Q018':q(45,100)/3,
        'C1-Q019':3*2+4*(-1),
        'C1-Q020':180+45,
        'C1-Q021':-12+q(25,10)*8,
        'C1-Q022':q(24)/(q(12,2)+q(12,3)),
        'C1-Q026':q(15,3),
        'C1-Q027':3*4-2*5,
        'C1-Q029':q(1-(-3),2),
        'C1-Q031':q(-(4**2),2*(-2)),
        'C1-Q033':q(2*6,10),
        'C1-Q034':q(10,2)*(2**2-1**2),
        'C1-Q036':q(60,30),
        'C1-Q037':q(3**2)/q(45,10),
        'C1-Q040':2+2*3*2,
        'C1-Q042':q(32,10)*10,
        'C1-Q044':5*10-12,
        'C1-Q046':sp.sqrt(6**2+8**2)/5,
        'C1-Q048':q(24,10)*4,
        'C1-Q050':2*10*sp.cos(sp.pi/3),
    }

def dimensional_crosschecks():
    si=pint.UnitRegistry(non_int_type=Fraction)
    return {
        'C1-Q001':si.Quantity(250,'microliter').to('millimeter**3').magnitude,
        'C1-Q007':(si.Quantity(Fraction(546,10),'gram')-si.Quantity(Fraction(42,1000),'kilogram')).to('gram').magnitude,
        'C1-Q008':str((si.Unit('meter')/si.Unit('second')**2).dimensionality),
        'C1-Q009':si.Quantity(Fraction(5,4),'meter/second').to('kilometer/hour').magnitude,
        'C1-Q019':(si.Quantity(3,'newton')*si.Quantity(2,'meter')-si.Quantity(4,'newton')*si.Quantity(1,'meter')).to('joule').magnitude,
    }
