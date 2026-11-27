"""Partial prompt-only model of 31 protected C6 exam problems; no publication."""
from fractions import Fraction
import sympy as sp
import pint

def predictions():
    q=sp.Rational
    values={
        'C6-Q044':(q(12,8),q(18,12)),
        'C6-Q045':sp.sqrt(4),
        'C6-Q046':sp.Integer(180)/(1+1),
        'C6-Q047':sp.Integer(2)*1+q(1,2)*10*1**2,
        'C6-Q048':'Frequenza doppia, lunghezza d’onda dimezzata e suono più acuto',
        'C6-Q049':sp.Integer(8)*q(100,4),
        'C6-Q050':'Campo e forza nulli al punto medio, potenziale non nullo',
        'C6-Q051':(sp.Integer(1),q(8,2)),
        'C6-Q052':'Irraggiamento elettromagnetico',
        'C6-Q053':1/(q(1,32)+q(1,32)),
        'C6-Q054':'Velocità tangente e accelerazione centripeta, moduli costanti e direzioni variabili',
        'C6-Q055':'Massimo sull’asse per un flusso non nullo',
        'C6-Q056':'Rettilinea uniforme lungo il campo',
        'C6-Q057':sp.Integer(-12)-(40-15),
        'C6-Q058':q(4,2**2),
        'C6-Q059':q(12-2-7)*q(1,10**6)/(q(1,2)*q(1,10**4)),
        'C6-Q060':q(80)/(q(8)**2/4),
        'C6-Q061':-q(60)*2/40,
        'C6-Q062':-(q(60,300)+q(120,400)),
        'C6-Q063':'Tasso di fotoni emessi maggiore, stessa energia per fotone',
        'C6-Q064':'Verso sinistra, opposto allo scorrimento relativo',
        'C6-Q065':'scalare',
        'C6-Q066':'Archimede',
        'C6-Q067':'specifico',
        'C6-Q068':'polarizzazione',
        'C6-Q069':'lunghezza',
        'C6-Q070':'potenza',
        'C6-Q071':'viscosità',
        'C6-Q072':'adiabatica',
        'C6-Q073':'orario visto dal lettore, per la sola risposta indotta dalla variazione',
        'C6-Q074':'becquerel',
    }
    for value in values.values():
        items=value if isinstance(value,tuple) else [value]
        for item in items:
            if not isinstance(item,str):
                assert item.is_real is True and item.is_finite is True
                assert not item.has(sp.Float)
    return values

def symbolic_crosschecks():
    k,charge,d=sp.symbols('k Q d',positive=True)
    left=sp.Matrix([k*charge/d**2,0,0]);right=sp.Matrix([-k*charge/d**2,0,0])
    assert left+right==sp.zeros(3,1)
    assert (2*k*charge/d).is_positive is True
    coefficient,radius,r=sp.symbols('coefficient radius r',positive=True)
    profile=coefficient*(radius**2-r**2)
    assert sp.diff(profile,r).subs(r,0)==0 and sp.diff(profile,r,2).is_negative is True
    speed,field=sp.symbols('speed field',positive=True)
    assert sp.Matrix([0,0,speed]).cross(sp.Matrix([0,0,field]))==sp.zeros(3,1)
    work,height,load=sp.symbols('work height load',positive=True)
    assert sp.simplify((load*height/2)/(load*height/8))==4
    return 4

def dimensional_crosschecks():
    u=pint.UnitRegistry(non_int_type=Fraction)
    def quantity(n,unit):return u.Quantity(Fraction(n),unit)
    cases=[
        (quantity(12,'g')/quantity(8,'cm^3'),'kg/m^3',Fraction(1500)),
        (quantity(2,'m/s')*quantity(1,'s')+Fraction(1,2)*quantity(10,'m/s^2')*quantity(1,'s')**2,'m',Fraction(7)),
        (quantity(8,'N')*quantity(100,'cm^2')/quantity(4,'cm^2'),'N',Fraction(200)),
        (quantity(12,'kPa')*quantity(1,'L'),'J',Fraction(12)),
        ((quantity(12,'mL/s')-quantity(2,'mL/s')-quantity(7,'mL/s'))/quantity('1/2','cm^2'),'m/s',Fraction(3,50)),
        (quantity(80,'J')/(quantity(8,'V')**2/quantity(4,'ohm')),'s',Fraction(5)),
        (-(quantity(60,'J')/quantity(300,'K')+quantity(120,'J')/quantity(400,'K')),'J/K',Fraction(-1,2)),
    ]
    output=[]
    for value,unit,wanted in cases:
        converted=value.to(unit)
        assert isinstance(converted.magnitude,(Fraction,int)) and converted.magnitude==wanted
        output.append({'magnitude':str(converted.magnitude),'unit':unit})
    return output

def main():
    values=predictions()
    for key,value in {'C6-Q045':2,'C6-Q046':90,'C6-Q047':7,'C6-Q049':200,'C6-Q053':16,'C6-Q057':-37,'C6-Q058':1,'C6-Q059':sp.Rational(3,50),'C6-Q060':5,'C6-Q061':-3,'C6-Q062':sp.Rational(-1,2)}.items():assert values[key]==value
    assert values['C6-Q044']==(sp.Rational(3,2),sp.Rational(3,2)) and values['C6-Q051']==(1,4)
    symbolic=symbolic_crosschecks();units=dimensional_crosschecks()
    print({'scope':'partial protected-exam source-only preparation;no SCI credit','individualPromptDerivations':len(values),'exactScalarResults':11,'exactPairedComparisons':2,'symbolicPhysicalChecks':symbolic,'exactPintChecks':len(units),'values':{key:str(value) for key,value in values.items()},'unitChecks':units,'appProtectedExam':'default-deny'})
if __name__=='__main__':main()
