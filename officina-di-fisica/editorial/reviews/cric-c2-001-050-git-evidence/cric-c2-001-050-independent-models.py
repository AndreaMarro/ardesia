"""Independent prompt-only fluid computations, before Cric C2 candidate keys."""
from fractions import Fraction
import sympy as sp
import pint

def source_only_predictions():
    q=sp.Rational
    return {
        'C2-Q002':q(45)/q(15,1000)/1000,
        'C2-Q004':99-12,
        'C2-Q005':(20*q(4,5)+30*q(6,5))/50,
        'C2-Q007':18*q(4,12),
        'C2-Q009':q(6,5)*q(6,4),
        'C2-Q011':q(4000,1000*10),
        'C2-Q013':13600*q(74,100)*q(981,100)/1000,
        'C2-Q015':1000*10*q(2,5)*q(1,5)**2/2,
        'C2-Q017':800*10*q(1,2)*sp.sin(sp.pi/6)/1000,
        'C2-Q019':4500/(10*q(1,2)),
        'C2-Q021':sp.Integer(7),
        'C2-Q022':25*q(6,2)**2,
        'C2-Q023':300*q(6,90),
        'C2-Q025':q(24,100)/8*100,
        'C2-Q027':12*q(5,10),
        'C2-Q029':150000*q(2,10000),
        'C2-Q031':1000*10*q(75,10**6),
        'C2-Q033':1000*10*q(200,10**6)-q(12,100)*10,
        'C2-Q036':1000*q(18,1000)-5,
        'C2-Q038':60+40*q(4,5),
        'C2-Q039':60/q(6,5),
        'C2-Q041':(9-5)*q(45,60),
        'C2-Q043':2*sp.sqrt((8*sp.pi/2)/sp.pi),
        'C2-Q044':36-q(840,60),
        'C2-Q046':q(85,100)*q(12,60),
        'C2-Q047':1/(2*q(1,2)),
        'C2-Q049':120/(q(2400,3*60)),
        'C2-Q050':6/q(20,100),
    }

def dimensional_crosschecks():
    si=pint.UnitRegistry(non_int_type=Fraction)
    q=si.Quantity
    return {
        'pressure':(q(45,'newton')/q(Fraction(15,1000),'meter**2')).to('kilopascal').magnitude,
        'density':(q(52,'gram')/q(50,'milliliter')).to('gram/milliliter').magnitude,
        'depth':(q(4000,'pascal')/(q(1000,'kg/meter**3')*q(10,'meter/second**2'))).to('meter').magnitude,
        'swept_volume':(q(12,'centimeter**2')*q(5,'millimeter')).to('milliliter').magnitude,
        'membrane_force':(q(150,'kilopascal')*q(2,'centimeter**2')).to('newton').magnitude,
        'buoyancy':(q(1000,'kg/meter**3')*q(10,'meter/second**2')*q(75,'centimeter**3')).to('newton').magnitude,
        'mass_flow':(q(Fraction(85,100),'kg/liter')*q(12,'liter/minute')).to('kg/second').magnitude,
        'area':(q(6,'milliliter/second')/q(Fraction(1,5),'centimeter/second')).to('centimeter**2').magnitude,
    }
