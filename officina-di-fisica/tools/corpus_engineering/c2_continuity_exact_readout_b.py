"""Exact readout rubric from historical independent continuity primary; no app imports."""
from fractions import Fraction as F
from decimal import Decimal

def rational(x):
 if type(x)is bool or type(x)is float:raise ValueError('Exact capture lexeme required')
 if type(x)is Decimal and not x.is_finite():raise ValueError('Finite capture required')
 if type(x)not in [int,str,F,Decimal]:raise ValueError('Rational capture scalar required')
 try:q=F(x)
 except (ValueError,ZeroDivisionError,TypeError)as e:raise ValueError('Finite rational required')from e
 return q

def expected_readout(v,t):
 v,t=map(rational,(v,t))
 if not 0<=v<=12 or not 0<=t<=6:raise ValueError('Outside frozen replay domain')
 return {'Q_mL_s':4*v,'distance_cm':v*t,'volume_mL':4*v*t}

if __name__=='__main__':
 assert [expected_readout(v,0)['Q_mL_s']for v in [0,1,6,7,12]]==[0,4,24,28,48]
 assert [expected_readout(v,t)['distance_cm']for v,t in [(0,6),(1,3),(7,3),(12,6)]]==[0,3,21,72]
 assert [expected_readout(v,t)['volume_mL']for v,t in [(0,6),(1,3),(7,3),(12,6)]]==[0,12,84,288]
 print('Frozen exact instrument rubric:5grid+4clockpoints; no current case outputs read')
