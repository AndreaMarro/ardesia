"""Independent review of the five unchanged LAB-C1..LAB-C5 activities.

The reviewer did not author these source records. No authoring/generator import,
no publication, and no claim about the linked 3D benches or lesson experiments.
Both the individually read source records and the read runtime are frozen below.
"""
from fractions import Fraction as F
from pathlib import Path
import json
import math
import subprocess

import pint
import sympy as sp

from .pipeline import canonical, digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/labs.json'
SOURCE_FILE_SHA256 = 'b8f94d6ee2b4794bea54b51f53e339da53ee635d4074d546a6afb15e732e61ab'
REVIEWED_SOURCES = {
    'LAB-C1': '89694d78cf909953dbc2c2dfe2ca4517ffffc6713f3080761367b14981fbf103',
    'LAB-C2': 'a05e3d9cd390b3550381523621c4847de9cb9b6c7cbcd9858a9d8f521c3ce722',
    'LAB-C3': '960bb624aa6034becaf3bd08f6e1516b94656025d602b409b6dcb5ae65eba61a',
    'LAB-C4': '178d74f9b654b5fdd502f9b26628d7db4edfb9f789b5cfb47d743e033b4b6bd3',
    'LAB-C5': '047b1f4c6d8e3798b58a6dcafcec0a47ca2d387dc28b551af944dae43d3b9fde',
}
REVIEWED_RUNTIME = {
    'static/js/models.js': '525733758bad90ae00913d497d0916ff683168370fc9a1e320dd16e0c7a9faa6',
    'static/lab-models.json': '2e4397ef2dc7e63ad2a75eae804228221ca74506d43f1cc73ef2de78ed1b6b27',
    'static/js/labs.js': '529893993dde3e2e67737835c85f9707fbcc0f6a3a7af690a7bde55152e76b63',
    'static/js/ui.js': '77e5f000f5e1a1fe028fff32dad97be29ad72b46d753787a19ad36164cb98f27',
}
SI = pint.UnitRegistry(non_int_type=F)


def independent_models():
    """Derive physics from balances, integration, circuit equations and lens rays."""
    checks = {key: [] for key in REVIEWED_SOURCES}
    oracles = {key: {} for key in REVIEWED_SOURCES}

    def add(key, name, ok, proof, mode='SYMPY_EXACT'):
        checks[key].append({'name': name, 'mode': mode, 'ok': bool(ok), 'proof': proof})

    # C1: vertical force balance and horizontal Newton equation, with a fresh rest
    # configuration for each setting (the activity explicitly declares this reset).
    mass, g, mu, applied, friction, acc, normal = sp.symbols('m g mu F f a N', positive=True)
    vertical = sp.solve(sp.Eq(normal-mass*g, 0), normal)[0]
    horizontal = sp.solve(sp.Eq(applied-friction, mass*acc), acc)[0]
    N = F(2)*F(981, 100)
    threshold = F(2, 5)*N
    kinetic = F(3, 4)*threshold
    a10 = (F(10)-kinetic)/2
    oracles['LAB-C1'] = {
        'normal_N': str(N), 'staticLimit_N': str(threshold),
        'frictionAt4N_N': '4', 'accelerationAt4N_m_s2': '0',
        'kineticFrictionAt10N_N': str(kinetic), 'accelerationAt10N_m_s2': str(a10),
        'doubleMassStaticLimit_N': str(2*threshold), 'doubleMassAccelerationAt10N_m_s2': '0',
    }
    add('LAB-C1', 'force balances', vertical == mass*g and sp.simplify(horizontal-(applied-friction)/mass) == 0,
        'N−mg=0 ⇒ N=mg; F−f=ma ⇒ a=(F−f)/m. The prescribed kinetic coefficient is 3/4 of the static one, not a universal law.')
    add('LAB-C1', 'rest and slip decision', F(4) < threshold < F(10) and kinetic < threshold and a10 > 0,
        'N=19.62 N; threshold=7.848 N. At 4 N static friction is 4 N and a=0; at 10 N kinetic friction=5.886 N and a=2.057 m/s².', 'FRACTION_EXACT')
    add('LAB-C1', 'doubling mass at fixed 10 N', F(10) < 2*threshold,
        'New setting restarts from rest: m=4 kg gives threshold=15.696 N, so F=10 N is balanced statically. This is not the history of a still-sliding old state.', 'FRACTION_EXACT')

    # C2: integrate the independent local parabolic velocity over annuli.
    r, s, dp, eta, length, rho = sp.symbols('r s dp eta L rho', positive=True)
    profile = dp*(r*r-s*s)/(4*eta*length)
    flow = sp.integrate(profile*2*sp.pi*s, (s, 0, r))
    mean = sp.simplify(flow/(sp.pi*r*r))
    reynolds = sp.simplify(rho*(2*r)*mean/eta)
    q0 = sp.simplify(flow.subs({r: sp.Rational(1,1000), dp:200, eta:sp.Rational(1,250), length:sp.Rational(1,4)})*10**6)
    qhalf = q0/16
    rounded_ratio = F(4909,78540)
    rounding_gap = rounded_ratio-F(1,16)
    re_max = sp.simplify(reynolds.subs({rho:1000,r:sp.Rational(1,500),dp:500,eta:sp.Rational(3,1000),length:sp.Rational(1,4)}))
    oracles['LAB-C2'] = {
        'flow_m3_s': str(flow), 'meanVelocity_m_s': str(mean), 'Reynolds': str(reynolds),
        'halfRadiusRatio': '1/16', 'doublePressureRatio': '2',
        'defaultFlow_mL_s': str(q0), 'halfRadiusFlow_mL_s': str(qhalf),
        'displayedDefaultFlow_mL_s': '0,07854', 'displayedHalfRadiusFlow_mL_s': '0,004909',
        'quotientOfDisplayedReadings': str(rounded_ratio), 'differenceFromOneSixteenth': str(rounding_gap),
        'maximumReynoldsInControlEnvelope': str(re_max),
        'roundingBins_mL_s': {'default':'[15707/200000,15709/200000)', 'halfRadius':'[9817/2000000,9819/2000000)'},
    }
    add('LAB-C2', 'annular integration and wall condition',
        sp.simplify(flow-sp.pi*r**4*dp/(8*eta*length)) == 0 and profile.subs(s,r) == 0 and sp.simplify(profile.subs(s,0)-2*mean) == 0,
        'Integrating v(s)·2πs ds from 0 to r gives Q; no-slip v(r)=0 and axis velocity=2 times mean velocity follow separately.')
    add('LAB-C2', 'radius and pressure factors',
        sp.simplify(flow.subs(r,r/2)/flow-sp.Rational(1,16)) == 0 and sp.simplify(flow.subs(dp,2*dp)/flow-2) == 0,
        'Four factors 1/2 give 1/16; pressure difference enters once. The ratios presume nonzero initial pressure difference; controls start at 200 Pa, not zero.')
    add('LAB-C2', 'actual rounded-reading manual division', rounded_ratio == F(4909,78540) and rounding_gap == F(1,314160),
        'Current formatter uses four significant digits, not four decimal places. 0.004909/0.07854=4909/78540; 4909·16=78544 versus 78540, so observed ratio exceeds 1/16 by exactly 1/314160. No decimal division is required.', 'FRACTION_EXACT')
    add('LAB-C2', 'rounding bins contain exact model values',
        sp.Rational(15707,200000) < q0 < sp.Rational(15709,200000) and sp.Rational(9817,2000000) < qhalf < sp.Rational(9819,2000000),
        'Default Q=π/40 and half-radius Q=π/640 lie in the displayed significant-digit rounding bins. Dividing rounded readings is an estimate of the model ratio, not the exact ratio 1/16.')
    add('LAB-C2', 'laminar control envelope', re_max == sp.Rational(4000,9) and re_max < 2000,
        'Re=ρ Δp r³/(4η²L); maximum positive r and Δp and minimum η give 4000/9, below the conventional laminar-flow bound 2000. This checks the declared parameter envelope, not real apparatus entrance effects.')

    # C3: derive pressures from thermodynamics; work is an independent integral.
    volume = sp.symbols('V', positive=True)
    gamma = sp.Rational(5,3)
    p_iso = 100/volume
    p_ad = 100/volume**gamma
    w_iso = sp.integrate(p_iso,(volume,1,2))
    w_ad = sp.integrate(p_ad,(volume,1,2))
    p_ad_final = sp.simplify(p_ad.subs(volume,2))
    t_ad_final = sp.simplify(300*p_ad_final*2/100)
    du_ad = sp.simplify(sp.Rational(3,2)*(p_ad_final*2-100))
    oracles['LAB-C3'] = {
        'isothermalFinalPressure_kPa':'50', 'adiabaticFinalPressure_kPa':str(p_ad_final),
        'isothermalTemperature_K':'300', 'adiabaticFinalTemperature_K':str(t_ad_final),
        'isothermalWork_J':str(w_iso), 'adiabaticWork_J':str(w_ad),
        'adiabaticDeltaU_J':str(du_ad), 'isothermalHeat_J':str(w_iso), 'adiabaticHeat_J':'0',
        'isochoricAtPressureRatio3over2':{'V_L':'1','p_kPa':'150','T_K':'450','W_J':'0','deltaU_J':'75','Q_J':'75'},
    }
    add('LAB-C3', 'first law and reversible adiabat', sp.simplify(du_ad+w_ad) == 0 and sp.simplify(w_iso-100*sp.log(2)) == 0,
        'For fixed n, T constant gives pV=100 J. For reversible Q=0, dU=−p dV and U=3pV/2 give dp/p=−(5/3)dV/V; integrate to pV^(5/3)=constant. Independent p dV integrals supply work.')
    add('LAB-C3', 'differential path identities', sp.simplify(sp.diff(sp.Rational(3,2)*p_ad*volume,volume)+p_ad) == 0 and sp.diff(p_iso*volume,volume) == 0,
        'The adiabatic path satisfies dU/dV=−p identically, not just at the final point; the isotherm satisfies d(pV)/dV=0 for every positive V.')
    add('LAB-C3', 'which pressure curve drops farther', sp.simplify(p_ad/p_iso-volume**(-sp.Rational(2,3))) == 0,
        'For 1<V≤2 the ratio p_ad/p_iso=V^(−2/3) is strictly below 1. The adiabatic curve lies lower; its positive expansion work is smaller because its integrand is lower everywhere after V=1. This qualitative ordering does not require evaluating ln2 or a cube root.', 'SYMPY_IDENTITY_AND_AI_PHYSICAL_REASONING')
    add('LAB-C3', 'temperature and heat interpretation', t_ad_final < 300 and du_ad < 0 and w_ad > 0,
        'Adiabatic expansion gives T/300=V^(−2/3)<1 and Q=0; W>0 removes internal energy. Isothermal ΔU=0 gives Q=W>0. On an isochore dV=0 gives W=0 even when pressure changes.')

    # C4: Kirchhoff equations solved independently instead of using the code's
    # equivalent-resistance implementation as a proof.
    current, v1, v2 = sp.symbols('I V1 V2')
    series = sp.solve([sp.Eq(v1,100*current),sp.Eq(v2,200*current),sp.Eq(v1+v2,6)],(current,v1,v2))
    parallel_i1,parallel_i2 = sp.Rational(6,100),sp.Rational(6,200)
    oracles['LAB-C4'] = {
        'series':{'I_A':str(series[current]),'V1_V':str(series[v1]),'V2_V':str(series[v2]),'R_ohm':'300','P_W':'3/25'},
        'parallel':{'V1_V':'6','V2_V':'6','I1_A':str(parallel_i1),'I2_A':str(parallel_i2),'I_A':str(parallel_i1+parallel_i2),'R_ohm':'200/3','P_W':'27/50'},
    }
    add('LAB-C4', 'series voltage ranking from Kirchhoff', series[v2] == 2*series[v1] and series[v2] > series[v1] and series[v1]+series[v2] == 6,
        'One current crosses both resistors; solve 100I+200I=6 ⇒ I=1/50 A, V1=2 V and V2=4 V. The 200 Ω resistor has the larger drop. Ranking follows R2>R1 without numerical calculation by the student.')
    add('LAB-C4', 'parallel nodes and currents', parallel_i1 == 2*parallel_i2 and parallel_i1+parallel_i2 == sp.Rational(9,100),
        'Both elements connect the same two ideal nodes: V1=V2=6 V. Separate Ohm equations give 3/50 A and 3/100 A, summed at the node. The smaller resistance now has larger current, not larger voltage.')
    add('LAB-C4', 'zero source and one-control changes', True,
        'For U=0 all drops and currents vanish. With fixed positive resistances each current and drop is proportional to U. Changing one resistor preserves series current equality or parallel voltage equality, not the numerical values.', 'AI_PHYSICAL_REASONING')

    # C5: solve the thin-lens relation, then prove branch signs and screen motion.
    focal, obj, image = sp.symbols('f p q', positive=True)
    image_solution = sp.solve(sp.Eq(1/focal,1/obj+1/image),image)[0]
    derivative = sp.factor(sp.diff(image_solution,obj))
    oracles['LAB-C5'] = {
        'imageDistance':str(image_solution), 'magnification':str(-image_solution/obj),
        'dq_dp':str(derivative), 'limitAsObjectApproachesFocusFromRight':str(sp.limit(image_solution,obj,focal,dir='+')),
        'pEquals2f':{'q':'2f','magnification':'−1','type':'real inverted'},
        'pEqualsF':{'q':'infinity','magnification':'not finite','type':'emergent rays parallel'},
        'pEqualsFover2':{'q':'−f','magnification':'2','type':'virtual upright'},
    }
    add('LAB-C5', 'lens inverse and screen displacement', sp.simplify(image_solution-focal*obj/(obj-focal)) == 0 and sp.simplify(derivative+focal**2/(obj-focal)**2) == 0,
        'q=fp/(p−f); dq/dp=−f²/(p−f)²<0 on p>f. Moving p down from 2f toward f sends q up from 2f toward positive infinity; move the screen farther right, with no finite screen position at p=f.')
    add('LAB-C5', 'virtual branch and ray geometry', sp.simplify(image_solution.subs(obj,focal/2)+focal) == 0 and sp.simplify((-image_solution/obj).subs(obj,focal/2)-2) == 0,
        'For 0<p<f, denominator p−f<0 gives q<0 and m=−q/p>0: back-projected rays meet left, upright virtual image. Actual outgoing rays do not meet on a screen.', 'SYMPY_IDENTITY_AND_AI_PHYSICAL_REASONING')
    add('LAB-C5', 'two-ray intersection', sp.simplify(1-image_solution/focal+image_solution/obj) == 0,
        'Taking object height 1, the parallel-then-refracted ray has height 1−x/f and the undeviated central ray has height −x/p. They intersect at x=q from the lens equation; at p=f their slopes coincide.')
    add('LAB-C5', 'focus as a singular case', sp.limit(image_solution,obj,focal,dir='+') == sp.oo,
        'The two emerging ray slopes are both −1/f when p=f. The runtime correctly reports q=Infinity and no finite magnification, rather than dividing by zero.')

    return checks,oracles


def dimensional_checks():
    Q = SI.Quantity
    probes = {
        'LAB-C1': [('normal',Q(2,'kg')*Q(F(981,100),'m/s**2'),'N'),('acceleration',Q(1,'N')/Q(1,'kg'),'m/s**2')],
        'LAB-C2': [('flow',Q(1,'m**4')*Q(1,'Pa')/(Q(1,'Pa*s')*Q(1,'m')),'m**3/s'),('profile',Q(1,'Pa')*Q(1,'m**2')/(Q(1,'Pa*s')*Q(1,'m')),'m/s'),('Reynolds',Q(1000,'kg/m**3')*Q(1,'m/s')*Q(1,'m')/Q(1,'Pa*s'),'dimensionless')],
        'LAB-C3': [('pressure-volume',Q(100,'kPa')*Q(1,'liter'),'J'),('temperature',Q(1,'J')/Q(1,'J/K'),'K')],
        'LAB-C4': [('current',Q(1,'V')/Q(1,'ohm'),'A'),('power',Q(1,'V')*Q(1,'A'),'W')],
        'LAB-C5': [('image distance',Q(1,'cm')*Q(1,'cm')/Q(1,'cm'),'cm'),('magnification',Q(1,'cm')/Q(1,'cm'),'dimensionless')],
    }
    result={}
    for key,values in probes.items():
        result[key]=[]
        for name,value,unit in values:
            converted=value.to(unit)
            result[key].append({'name':name,'mode':'PINT_DIMENSION','ok':True,'unit':unit,'dimension':{str(k):str(v) for k,v in converted.dimensionality.items()}})
    return result


# Runtime is a consumer to challenge, not the source of expected answers.
RUNTIME_INPUTS = {
    'LAB-C1': [{'m':2,'F':4,'mu':0.4},{'m':2,'F':10,'mu':0.4},{'m':4,'F':10,'mu':0.4},{'m':2,'F':7.848,'mu':0.4}],
    'LAB-C2': [{'r':1,'dp':200,'eta':4},{'r':0.5,'dp':200,'eta':4},{'r':1,'dp':400,'eta':4},{'r':2,'dp':500,'eta':3},{'r':1,'dp':0,'eta':4}],
    'LAB-C3': [{'ratio':2,'mode':'Isoterma'},{'ratio':2,'mode':'Adiabatica'},{'ratio':1.5,'mode':'Isocora'},{'ratio':2,'mode':'Isobara'}],
    'LAB-C4': [{'U':6,'R1':100,'R2':200,'mode':'Serie'},{'U':6,'R1':100,'R2':200,'mode':'Parallelo'},{'U':0,'R1':100,'R2':200,'mode':'Serie'},{'U':0,'R1':100,'R2':200,'mode':'Parallelo'}],
    'LAB-C5': [{'p':20,'f':10},{'p':15,'f':10},{'p':10,'f':10},{'p':5,'f':10}],
}


def runtime_values():
    code = "import {models} from './static/js/models.js';\nconst inputs=" + canonical(RUNTIME_INPUTS) + ";\n" + """
const out={};
for (const [id,cases] of Object.entries(inputs)) {
  const model=id.slice(4);
  out[id]=cases.map(input=>({input,output:models[model](input)}));
}
const fmt=new Intl.NumberFormat('it-IT',{maximumSignificantDigits:4});
out.displayedC2=out['LAB-C2'].slice(0,2).map(row=>fmt.format(row.output.q));
console.log(JSON.stringify(out,(_key,value)=>value===Infinity?'Infinity':value));
"""
    run=subprocess.run(['node','--input-type=module','-'],input=code,cwd=APP,capture_output=True,text=True,timeout=30)
    if run.returncode:raise ValueError('Canonical runtime did not execute: '+run.stderr[:500])
    return json.loads(run.stdout)


def runtime_expected():
    # Symbolic quantities come from integrals in independent_models, not JS.
    p_ad=sp.Rational(100)/2**sp.Rational(5,3)
    w_ad=sp.integrate(100/sp.Symbol('v',positive=True)**sp.Rational(5,3),(sp.Symbol('v',positive=True),1,2))
    return {
        'LAB-C1': [
            {'n':sp.Rational(981,50),'limit':sp.Rational(981,125),'moving':False,'friction':4,'a':0},
            {'n':sp.Rational(981,50),'limit':sp.Rational(981,125),'moving':True,'friction':sp.Rational(2943,500),'a':sp.Rational(2057,1000)},
            {'n':sp.Rational(981,25),'limit':sp.Rational(1962,125),'moving':False,'friction':10,'a':0},
            {'moving':False,'friction':sp.Rational(981,125),'a':0}],
        'LAB-C2': [
            {'q':sp.pi/40,'mean':sp.Rational(1,40),'re':sp.Rational(25,2),'relative':1},
            {'q':sp.pi/640,'mean':sp.Rational(1,160),'re':sp.Rational(25,16),'relative':sp.Rational(1,16)},
            {'q':sp.pi/20,'mean':sp.Rational(1,20),'re':25,'relative':1},
            {'q':4*sp.pi/3,'mean':sp.Rational(1,3),'re':sp.Rational(4000,9),'relative':16},
            {'q':0,'mean':0,'re':0,'relative':None}],
        'LAB-C3': [
            {'V':2,'p':50,'T':300,'W':100*sp.log(2),'U':0,'Q':100*sp.log(2)},
            {'V':2,'p':p_ad,'T':6*p_ad,'W':w_ad,'U':-w_ad,'Q':0},
            {'V':1,'p':150,'T':450,'W':0,'U':75,'Q':75},
            {'V':2,'p':100,'T':600,'W':100,'U':150,'Q':250}],
        'LAB-C4': [
            {'R':300,'I':sp.Rational(1,50),'I1':sp.Rational(1,50),'I2':sp.Rational(1,50),'V1':2,'V2':4,'P':sp.Rational(3,25)},
            {'R':sp.Rational(200,3),'I':sp.Rational(9,100),'I1':sp.Rational(3,50),'I2':sp.Rational(3,100),'V1':6,'V2':6,'P':sp.Rational(27,50)},
            {'I':0,'I1':0,'I2':0,'V1':0,'V2':0,'P':0},
            {'I':0,'I1':0,'I2':0,'V1':0,'V2':0,'P':0}],
        'LAB-C5': [
            {'q':20,'m':-1,'type':'reale, capovolta'},
            {'q':30,'m':-2,'type':'reale, capovolta'},
            {'q':'Infinity','m':None,'type':'all’infinito'},
            {'q':-10,'m':2,'type':'virtuale, diritta'}],
    }


def compare_value(got,want):
    if isinstance(want,(str,bool)) or want is None:return type(got) is type(want) and got==want
    return type(got) in (int,float) and math.isfinite(got) and math.isclose(got,float(want),rel_tol=1e-11,abs_tol=1e-12)


MANUAL = {
 'LAB-C1':'Previsione: 2·9,81=19,62 N; 0,40=2/5 e 19,62·2/5=7,848 N. Quindi 4<7,848<10. Per controllare il modello: 3/4 di 7,848=5,886 N; (10−5,886)/2=2,057 m/s². Raddoppiando la massa la soglia raddoppia a 15,696 N e 10 N non bastano a partire. Tutti i decimali sono finiti ed esatti nel modello assegnato.',
 'LAB-C2':'Previsione esatta: (1/2)^4=1/(2·2·2·2)=1/16; raddoppiare Δp dà 2Q. Procedura sulle letture reali a quattro cifre significative: 0,004909/0,07854=(4909/10^6)/(7854/10^5)=4909/78540. Per confrontarlo con 1/16: 4909·16=78544, contro 78540. Lo scarto è 4/(16·78540)=1/314160. Il quoziente dei numeri visualizzati non è dichiarato uguale al rapporto esatto dei valori fisici. Nessuna decimalizzazione o valutazione manuale di π è richiesta.',
 'LAB-C3':'Nessun calcolo numerico autonomo richiesto: lo studente confronta curve e letture. La prova qualitativa usa p_ad/p_iso=(V/Vi)^(−2/3)<1 per V>Vi; lavoro minore perché l’area sotto la curva è minore, temperatura adiabaticamente minore perché Q=0 e W>0. I valori con ln2 e radici sono output dello strumento; non sono richiesti come decimali calcolati dallo studente.',
 'LAB-C4':'Nessun calcolo numerico autonomo richiesto: si chiede quale caduta sia maggiore e che cosa cambi in parallelo, poi di confrontare le letture. La prova è proporzionale: in serie corrente comune e V2/V1=R2/R1=2; in parallelo tensione comune. Come controllo del revisore, 6/(100+200)=1/50 A dà 2 e 4 V; in parallelo 6/100=3/50 A e 6/200=3/100 A, somma 9/100 A.',
 'LAB-C5':'Nessun calcolo numerico autonomo richiesto: si chiede dove spostare lo schermo e di seguire i raggi. Per p>f, q=fp/(p−f) aumenta se p diminuisce verso f, da 2f verso infinito; a p=f non esiste uno schermo finito; per p<f il punto è virtuale a sinistra. La derivata e gli esempi numerici sono prove del revisore, non consegne aggiunte allo studente.',
}
ASSUMPTIONS = {
 'LAB-C1':'Piano orizzontale, forza applicata orizzontale, g=9,81 m/s², contatto asciutto; ogni nuova configurazione riparte da fermo. Attrito statico adattivo fino alla soglia inclusa e coefficiente dinamico del solo banco μk=0,75μs.',
 'LAB-C2':'Fluido newtoniano incomprimibile, regime stazionario laminare pienamente sviluppato, tubo cilindrico rigido L=25 cm, viscosità uniforme, no-slip alla parete; ρ=1000 kg/m³ per Reynolds. La differenza di pressione iniziale è positiva; a Δp=0 entrambi i flussi sono zero e il loro rapporto non è definito.',
 'LAB-C3':'Gas ideale monoatomico, stato iniziale 1 L/100 kPa/300 K; trasformazioni quasistatiche, pistone senza attrito; adiabatica reversibile con γ=5/3; lavoro del gas positivo in espansione. pV in kPa·L è in joule; temperature assolute.',
 'LAB-C4':'Generatore DC ideale, resistori ohmici positivi, fili e strumenti ideali; stessa corrente in serie e stessi due nodi in parallelo. Il controllo U=0 è ammesso e annulla correnti e cadute.',
 'LAB-C5':'Lente sottile convergente in aria, oggetto reale a sinistra, approssimazione parassiale; f,p>0, q positivo a destra. p=f è un limite singolare, non un’immagine a distanza finita. La figura dichiara scale grafiche adattate.',
}
PEDAGOGY = {
 'LAB-C1':'Previsione, variazione di una sola grandezza e confronto delle frecce separano attrito statico adattivo e dinamico. Il riavvio da fermo evita di interpretare il raddoppio di massa come la storia di un blocco già in scorrimento.',
 'LAB-C2':'Il compito distingue potenza quarta del raggio e prima potenza di Δp. La sezione trasversale ampliata e il profilo normalizzato sono dichiarati, perciò lunghezza della freccia grafica non è una lettura assoluta di velocità. Le letture arrotondate danno una verifica sperimentale approssimata del rapporto esatto.',
 'LAB-C3':'Il confronto fra due cammini con lo stesso stato iniziale separa p, T, area di lavoro e calore. L’isocora con traccia verticale rende visibile lavoro nullo anche con pressione variabile; nessuna moltiplicazione di due letture finali sostituisce l’integrale del cammino.',
 'LAB-C4':'Seguire i rami e identificare i nodi distingue serie e parallelo prima dei rapporti numerici. Azzerare il generatore dà un caso limite controllabile. Le letture di corrente e tensione hanno ruoli diversi nei due collegamenti.',
 'LAB-C5':'Tre casi p=2f,p=f,p<f distinguono immagine reale, limite senza schermo finito e immagine virtuale. I prolungamenti tratteggiati non sono raggi fisici che viaggiano a ritroso; la curva sul banco resta una costruzione parassiale.',
}
MISCONCEPTIONS = {
 'LAB-C1':['Attrito statico sempre uguale a μsN: a 4 N è invece 4 N.','μk=0,75μs come legge universale: è un parametro dichiarato di questo banco.','Raddoppiare massa di un blocco già in moto: ogni configurazione invece riparte da fermo.'],
 'LAB-C2':['Raggio dimezzato ⇒ Q/2 oppure Q/4: il modello dà Q/16.','Profilo normalizzato come velocità assoluta: la figura non fornisce tale scala.','Quoziente di letture arrotondate identico a 1/16: falso, lo scarto esatto qui è 1/314160.'],
 'LAB-C3':['Isoterma e adiabatica con stessa curva: γ=5/3 rende più ripida l’adiabatica.','Q=0 ⇒ W=0: in adiabatica W>0 e ΔU<0.','Isocora con lavoro pΔV non nullo: ΔV=0, quindi W=0.'],
 'LAB-C4':['Il resistore maggiore ha più corrente in serie: la corrente è comune.','Il resistore maggiore ha più tensione in parallelo: la tensione è comune.','La potenza totale è una caduta di tensione: P=VI ha unità W.'],
 'LAB-C5':['Oggetto più vicino ⇒ immagine reale più vicina: sul ramo p>f avviene il contrario.','A p=f basta uno schermo in una posizione finita: raggi paralleli.','Immagine virtuale proiettabile sullo schermo: si incontrano soltanto i prolungamenti.'],
}


def verify(sources):
    missing=set(REVIEWED_SOURCES)-set(sources)
    if missing:raise ValueError('Missing individually read labs: '+','.join(sorted(missing)))
    physics,oracles=independent_models()
    dimensions=dimensional_checks()
    runtime_hashes={name:sha((APP/name).read_bytes()) for name in REVIEWED_RUNTIME}
    runtime_ok=runtime_hashes==REVIEWED_RUNTIME
    actual=None;runtime_error=None
    if runtime_ok:
        try:actual=runtime_values()
        except (ValueError,OSError,subprocess.TimeoutExpired) as exc:runtime_error=str(exc)
    else:runtime_error='Runtime differs from the independently read implementation; previous runtime comparison is invalid'
    expected=runtime_expected()
    results=[]
    for key in sorted(REVIEWED_SOURCES):
        row=sources[key];errors=[]
        checks=list(physics[key])+dimensions[key]
        if digest(row)!=REVIEWED_SOURCES[key]:errors.append('Source differs from independently read edition')
        if runtime_error:errors.append(runtime_error)
        if actual is not None:
            cases=actual.get(key,[])
            if len(cases)!=len(expected[key]):errors.append('Runtime case count differs')
            for index,(case,wants) in enumerate(zip(cases,expected[key]),1):
                for field,want in wants.items():
                    ok=compare_value(case['output'].get(field),want)
                    checks.append({'name':f'runtime case {index} · {field}','mode':'INDEPENDENT_ORACLE_VS_CANONICAL_RUNTIME','ok':ok,'input':case['input'],'independentExact':str(want),'actual':case['output'].get(field)})
            if key=='LAB-C2':
                checks.append({'name':'actual significant-digit display','mode':'FROZEN_UI_FORMAT_SPECIFICATION','ok':actual.get('displayedC2')==['0,07854','0,004909'],'actual':actual.get('displayedC2'),'proof':'labs.js calls num(Q,4); ui.js specifies maximumSignificantDigits, not decimal places.'})
        for check in checks:
            if not check['ok']:errors.append('Independent check failed: '+check['name'])
        scope='EXACT_MANUAL_CALCULATION' if key in ('LAB-C1','LAB-C2') else 'NO_STUDENT_CALCULATION'
        results.append({'id':key,'sourceSha256':digest(row),'ok':not errors,'errors':errors,'checks':checks,
            'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_FILE_SHA256,
            'runtimeSha256':runtime_hashes,'reviewedRuntimeSha256':REVIEWED_RUNTIME,
            'calculationScope':scope,'manualArithmetic':MANUAL[key],'physicalAssumptions':ASSUMPTIONS[key],
            'dimension':dimensions[key],'pedagogicalReview':PEDAGOGY[key],'independentExactOracles':oracles[key],
            'distractors':{'mode':'NO_FIXED_OPTIONS_FREE_RESPONSE','review':'No multiple-choice distractors in these lab records; the following misconceptions were independently rejected.','rejectedClaims':MISCONCEPTIONS[key]},
            'verificationMode':'INDEPENDENT_EXISTING_EDITION','qualitativeReview':'AI_PHYSICAL_REASONING_EXPLICIT_PER_RECORD',
            'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE',
            'limits':'Only this LAB record and its read classic runtime. No certification of linked 3D benches, lesson experiments, accessibility or student use.'})
    return results


def report(sources):
    return {'schemaVersion':'1.0.0','batch':'labs-activities-002','records':verify(sources),
            'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,
            'originalEditionRetained':True,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
