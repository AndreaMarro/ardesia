"""Source-only independent models, frozen before opening Core6ae3 draft keys."""
from fractions import Fraction
from decimal import Decimal
import sympy as s
IDS=("SIM-C3-L03-01","SIM-C3-L03-03","SIM-C3-L03-04","SIM-C3-L04-01","SIM-C3-L04-02","SIM-C3-L04-03")
DOMAINS=((0,12,1),(0,20,1),(50,300,25),(0,s.Rational(167,5),s.Rational(167,100)),(-5,5,s.Rational(1,2)),(0,54,1))
def exact(x):
    if isinstance(x,bool) or isinstance(x,float):
        raise ValueError("exact finite real input required before any cast")
    if isinstance(x, Decimal):
        if not x.is_finite(): raise ValueError("nonfinite decimal")
        x=s.Rational(str(x))
    elif isinstance(x,Fraction): x=s.Rational(x.numerator,x.denominator)
    elif isinstance(x,int): x=s.Integer(x)
    if not isinstance(x,s.Expr) or x.is_number is not True or x.is_real is not True or x.is_finite is not True:
        raise ValueError("finite real number required")
    return x

def law(identifier,x):
    x=exact(x)
    try: i=IDS.index(identifier)
    except ValueError: raise ValueError("unknown source ID")
    lo,hi,_=DOMAINS[i]
    if not bool(lo<=x<=hi): raise ValueError("outside source domain")
    if i==0: return 50*x
    if i==1: return s.Rational(4157,500)*x
    if i==2: return (80*x+4000)/(x+200)
    if i==3: return s.Rational(500,167)*x
    if i==4: return s.Rational(113,50)*x
    if x<=2: return s.Integer(0)
    if x>=36: return s.Integer(100)
    return s.Rational(50,17)*(x-2)

def inverse(identifier,y):
    y=exact(y)
    if identifier not in IDS: raise ValueError("unknown source ID")
    i=IDS.index(identifier)
    ends=(law(identifier,DOMAINS[i][0]),law(identifier,DOMAINS[i][1]))
    if not bool(ends[0]<=y<=ends[1]): raise ValueError("outside inverse range")
    if i==0: return y/50
    if i==1: return s.Rational(500,4157)*y
    if i==2: return 200*(y-20)/(80-y)
    if i==3: return s.Rational(167,500)*y
    if i==4: return s.Rational(50,113)*y
    if y==0: return (s.Integer(0),s.Integer(2))
    if y==100: return (s.Integer(36),s.Integer(54))
    return 2+s.Rational(17,50)*y

def grids():
    for identifier,(lo,hi,step) in zip(IDS,DOMAINS):
        count=int((hi-lo)/step)+1
        yield identifier,tuple(s.sympify(lo)+step*j for j in range(count))
