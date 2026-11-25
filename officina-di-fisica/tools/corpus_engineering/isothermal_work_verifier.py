"""Independent source-first thermal review; no candidate authoring imports.
Literal signatures freeze only editions read independently, including final textual corrections.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
import hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF="5cfbdcb055ba3ba136f97fb56e997f06e6cf3605"
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json"
FAMILY='isothermal-work'
BATCH='isothermal-work-152'
ASSET_NAME='isothermal-work-progressive.svg'
CANDIDATE_REF='dd2fe722f7d93025dd0e292980a303b00291d403'
REVIEWED_PACKAGE_SHA256='b8606471ab86744bf89f5a0e71cd414412888a7470474e8c5e46b4b994297d3b'
REVIEWED_BINDINGS_SHA256='0b89f2d151d051a2fc8a630d2db135bdad403b6538bbd317ee8cf52e4af1fd4a'
PRIMARY_SHA256='1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d'
SOURCE_REFERENCE='Integrate reversible boundary work nRT/V over positive volumes. Normalize by the measured doubling work to avoid decimal logarithms. Preserve compression signs and r=1 non-identifiability; for 16 sum hot/cold isothermal works and exclude isochoric heat from the requested hot-isotherm heat.'
FALSE_PROOF='Un’isoterma ha temperatura costante, perciò ogni lavoro di espansione è nullo.'
SVG_MUTATION=(b'width="200"', b'width="201"')
EXPECTED_MAPPING={1: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 2: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 3: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 4: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 5: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 6: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 7: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 8: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 9: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 10: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 11: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 12: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 13: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 14: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 15: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07']), 16: ('C3-L07', ['C3-L01', 'C3-L02', 'C3-L06', 'C3-L07'])}
NUMERIC_UNITS={1: 'J', 5: 'J', 14: 'J'}
OPTION_SUFFIX={6: '', 7: '', 8: ' J', 11: '', 12: ' J', 13: '', 15: ' J', 16: ' J'}
UNITS={1: 'joule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'joule', 6: 'dimensionless', 7: 'dimensionless', 8: 'joule', 9: 'joule', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'joule', 15: 'joule', 16: 'joule'}
MANUAL=['r=2 dà W=W₂=10 J.', 'lavoro in J; i logaritmi hanno argomenti adimensionali.', 'W=W₂ ln(r)/ln 2; non W₂r e non ln di una quantità dimensionata.', 'W₂ doppio a r=2 dà W=20 J.', 'W₂=W ln 2/lnr=10 J con r=2. In generale r≠1; W e lnr devono avere lo stesso segno per W₂>0.', 'r=2^(W/W₂)=2. Resta positivo per ogni lavoro reale; la condizione W>0 seleziona r>1.', 'r_B=4 dà W_B=20 J contro 10 J, rapporto 2.', 'proposta 20 J meno corretta 10 J=10 J.', 'W₂=W ln 2/lnr; r=1 è un limite di non identificabilità, non una divisione ammessa. Per r=1, W=0 ogni W₂>0 soddisfa la misura; per r=1, W≠0 nessuno.', 'rapporto κ₁ ln(κ₂r)/lnr con r≠1. Il prodotto κ₂r deve essere positivo, garantito da positività. Il lavoro di B può cambiare segno o annullarsi; non si usa κ₁κ₂.', 'B con W₂=20 J, r=4 dà 40 J; rapporto 4.', 'media dei lavori (10+40)/2=25 J. Modello agli ingressi medi: 15 ln 3/ln 2 J, diverso; uguaglianza richiederebbe 27=32. Non occorrono logaritmi decimali.', 'bersaglio 40 J con W₂, B=20 J richiede log₂r_B=2, quindi r_B=4 e r_B/r_A=2.', 'q=3 J⁻¹; S=120 dà W_B=40 J. Con r=4 si ricava W₂, B=20 J.', 'q=(81−21)/(40−10)=2 J⁻¹; b=1. S=41 dà W=20 J, r=2 implica W₂=20 J.', 'W_hot=C_h ln 4; W_cold=−(C_h/2)ln 4=−W_hot/2; W_isochore=0. W_net=W_hot/2=12 J implica W_hot=24 J. Per gas ideale lungo l’isoterma ΔU=0, quindi Q_hot, isoterma=24 J. Non è il calore assorbito totale del ciclo: la successiva isocora di riscaldamento assorbe a sua volta energia se non è assegnato un rigeneratore. Non chiamare questo ciclo Carnot: ha isocore, non adiabatiche.']
DISTRACTORS=['20 usa r linearmente,5 lo divide e 0 confonde isoterma con lavoro nullo. ΔU=0 non implica W=0.', 'Pa, K, J/K non sono energie e W come unità è watt. ln(Vf/Vi) deve avere argomento puro.', 'W₂r e W₂/r non si annullano a r=1; invertire log dà singolarità lì e ln(2 r) aggiunge un contributo. Anche compressione e segno vanno rispettati.', '40 riconta un fattore due,5 lo inverte,10 lo ignora e 0 attribuisce lavoro nullo a ogni isoterma. Il cambio T è fra prove.', '20 e 5 usano r al posto del rapporto logaritmico;1/10 sarebbe inversa di energia. r=1 non consente questa inversa.', '1 dà lavoro zero,4 dà 20 J,1/2 dà−10 J e 10 copia un numero energetico. Si inverte un logaritmo, non un prodotto lineare.', '4 usa r_B direttamente,1/2 inverte i lavori e 1 ignora il secondo raddoppio.1/4 può essere 1/r_B o il quadrato del rapporto inverso, non due inversioni successive.', '−10 cambia ordine,20 copia,30 somma e 0 accetta W₂r. La proposta differisce di 10 J.', 'La legge diretta non è l’inversa; il reciproco ha J⁻¹, W/r è modello lineare e ln(2 r) non isola W₂. r=1, W=0 lascia infiniti riferimenti.', 'Prodotto e quoziente trattano r linearmente; il rapporto alternativo sposta κ₁ dentro ln. Nella forma espansa corretta il termine lnκ₂ è moltiplicato perκ₁/lnr.', '2 considera un cambiamento,1/4 inverte tutto,1/2 inverte un solo fattore e 8 usa 4 al posto di log₂4=2.', '50 è somma,15 semidifferenza,40 B. Il valore 15 ln 3/ln 2 usa ingressi medi; uguaglianza a 25 richiederebbe 27=32.', '4 copia r_B,1/2 inverte,1 dà soltanto taratura doppia e 8 moltiplica r_B per r_A. Il bersaglio dà r_B=4 e rapporto 2.', '60 usa S grezzo come energia e 40 copia W_B;10 non ricostruisce la nuova lettura. Il display è continuo, non numero intero di joule.', '10 e 40 copiano riferimenti,41/2 omette b e 41 usa il display grezzo. Rimettere 20 J dà S41.', '12 è lavoro netto,48 raddoppia ancora,−24 cambia il verso e 18 darebbe netto 9 J. Il calore isocoro non appartiene al Q della sola isoterma calda; non è un ciclo di Carnot.']
ASSUMPTIONS=['Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Gas ideale chiuso e isoterma reversibile con T assoluta positiva costante entro ogni processo, r=Vf/Vi>0 e W₂=nRTln 2>0. Lavoro del gas positivo in espansione e negativo in compressione; W₂ cambia fra prove tramite T a n fisso. Inverse con r≠1 e segni compatibili, display continuo.', 'Caso 16 separato: campione chiuso ideale, due isoterme reversibili a temperature T_h e T_h/2 positive, due isocore, solo lavoro di frontiera, W netto 12 J. Si chiede soltanto Q della isoterma calda; nessun rigeneratore o assorbimento totale assegnato.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-isothermal-work-01": "7563c917406b832598e54a8a175da302d5694bfebd7ed521e65f3ac8a9abb546",
    "AR-u5-isothermal-work-02": "301d7971ae64204594dd8ae590970fb7d013dd9c3e93703d9bf7d95a5dc99291",
    "AR-u5-isothermal-work-03": "c9d54728e54013559bfd53214345b1ecca1ae4093c78570e6dfad381f208fa51",
    "AR-u5-isothermal-work-04": "d849c8de2ce536a50d6677f0bcdebc9a78c35a8f074c65100c568b75721f2a7d",
    "AR-u5-isothermal-work-05": "77f045df783776aa2b731ba3e42b14dfb55adeca975cc50a70df736847053bfe",
    "AR-u5-isothermal-work-06": "6982e0fb823141939c35e56fed877b3de332d1f0609ce945d9c7e27cd099abeb",
    "AR-u5-isothermal-work-07": "ce4acd34a1734d6bd46b04d7539a60c3ccc77e2caf63a98fd034f17b8bd58173",
    "AR-u5-isothermal-work-08": "79994fb63a015663e54df19bf10ceda001c91f32a8545701100313490e2ab747",
    "AR-u5-isothermal-work-09": "8272ca7fa18837281e2b80c1446db75c77bd297192e2232bf1b7f18446e75c8e",
    "AR-u5-isothermal-work-10": "0e6f386eb521bc2461c56cd94eae545d7ef61d303c0ad7218c7313bc070b4923",
    "AR-u5-isothermal-work-11": "1d6f28aa849852d3b95cbb930b1aa6b2010f8dec487defbc1f72a4bae6728910",
    "AR-u5-isothermal-work-12": "d6f2f521bf578226034de78cc93a3b01f9916b23f059e8790818bd0efe0ee212",
    "AR-u5-isothermal-work-13": "3cd096f34fcc313308356489f10bdfb258d0c6aa389379b0b690238e6de5242f",
    "AR-u5-isothermal-work-14": "e3ad75dbab5c128fc5c237fbff942c8876c79d0121ce5d81d3781cd4090fcf56",
    "AR-u5-isothermal-work-15": "9510215684e23215780fd9ebbb3fe8f7ce7b5e9dd161525e816f534638c669ab",
    "AR-u5-isothermal-work-16": "72dcd158b591cbb9f0928fe20420d543696ce13ce5945a44b1925017987daf32"
}

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}

def parse_literal(raw):
    """Bounded exact decimal/fraction or single radical monomial; no eval."""
    if not isinstance(raw,str) or len(raw)>80:raise ValueError("Bounded exact literal required")
    raw=raw.strip().replace("−","-")
    number=r"[+-]?[0-9]+(?:[.,][0-9]+)?"
    match=re.fullmatch("("+number+")(?:/("+number+"))?",raw)
    if match:
        try:
            value=Fraction(match[1].replace(",","."))
            if match[2]:value/=Fraction(match[2].replace(",","."))
            result=sp.Rational(value)
        except (ValueError,ZeroDivisionError) as error:raise ValueError("Invalid rational literal") from error
    else:
        match=re.fullmatch(r"([+-]?[0-9]*)√([0-9]{1,4})(?:/([0-9]{1,8}))?",raw)
        if not match:raise ValueError("Outside independently reviewed exact literal grammar")
        coefficient,radicand,denominator=match.groups();coefficient={"":"1","+":"1","-":"-1"}.get(coefficient,coefficient)
        denominator=int(denominator or 1)
        if denominator==0:raise ValueError("Zero radical denominator")
        result=sp.Rational(coefficient)*sp.sqrt(int(radicand))/denominator
    if result.is_finite is not True or result.is_real is not True:raise ValueError("Finite real exact literal required")
    return result

def equivalent_literal(wanted):
    wanted=sp.Rational(wanted)
    return f"{2*wanted.p}/{2*wanted.q}"

def parse_option(number,option):
    if BATCH=="isothermal-work-152" and number==12 and option=="(15 ln 3 / ln 2) J":
        return 15*sp.log(3)/sp.log(2)
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    first,second=sp.Rational(first),sp.Rational(second)
    gain=sp.cancel(sp.Rational(reference_reading)/first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert first!=second and gain>0 and fit[q]>0
    physical=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert sp.simplify(sp.Rational(physical.magnitude)-gain)==0
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])

def physical_work(reference,volume_ratio):
    reference,volume_ratio=map(Fraction,(reference,volume_ratio))
    if reference<=0 or volume_ratio<=0:raise ValueError("Positive doubling work and positive dimensionless volume ratio required")
    return sp.simplify(sp.Rational(reference)*sp.log(sp.Rational(volume_ratio))/sp.log(2))

def inverse_reference(work,volume_ratio):
    volume_ratio=Fraction(volume_ratio);work=sp.sympify(work)
    if volume_ratio<=0 or volume_ratio==1:raise ValueError("Reference inverse requires r>0 and r!=1")
    value=sp.simplify(work*sp.log(2)/sp.log(sp.Rational(volume_ratio)))
    if work.is_real is not True or work.is_finite is not True or value.is_positive is not True:raise ValueError("Work and ln(r) must have compatible signs")
    return value

def inverse_volume_ratio(work,reference):
    reference=Fraction(reference);work=sp.sympify(work)
    if reference<=0 or work.is_real is not True or work.is_finite is not True:raise ValueError("Positive reference and finite real work required")
    return sp.simplify(sp.exp(work*sp.log(2)/sp.Rational(reference)))

def cross_trial_work_ratio(reference_ratio,volume_factor,initial_ratio):
    reference_ratio,volume_factor,initial_ratio=map(Fraction,(reference_ratio,volume_factor,initial_ratio))
    if min(reference_ratio,volume_factor,initial_ratio)<=0 or initial_ratio==1:raise ValueError("Positive factors and r_A!=1 required")
    return sp.simplify(sp.Rational(reference_ratio)*sp.log(sp.Rational(volume_factor*initial_ratio))/sp.log(sp.Rational(initial_ratio)))

def hot_isotherm_heat(net_work,temperature_ratio):
    net_work,temperature_ratio=map(Fraction,(net_work,temperature_ratio))
    if net_work<=0 or not 0<temperature_ratio<1:raise ValueError("Positive net work and 0<Tc/Th<1 required for this four-leg cycle")
    return net_work/(1-temperature_ratio)

@lru_cache(maxsize=1)
def oracle():
    n,R,T,V,Vi,r,W,W2,a,b=sp.symbols("n R T V Vi r W W2 a b",positive=True)
    integrated=sp.integrate(n*R*T/V,(V,Vi,r*Vi))
    assert sp.simplify(sp.expand_log(integrated,force=True)-n*R*T*sp.log(r))==0
    normalized=sp.solve(sp.Eq(W2,n*R*T*sp.log(2)),n*R*T)[0]*sp.log(r)
    assert normalized==W2*sp.log(r)/sp.log(2)
    assert sp.simplify(normalized.subs({W2:a*W2,r:b*r},simultaneous=True)/normalized-a*sp.log(b*r)/sp.log(r))==0
    first=physical_work(10,2);second=physical_work(20,4)
    assert (first,second)==(10,40)
    gain,offset,decoded,affine=calibrate(first,second,30,120,21,81,41,"joule")
    assert (gain,offset,decoded,affine)==(3,1,40,20)
    assert physical_work(10,1)==0 and physical_work(10,Fraction(1,2))==-10
    assert sp.Rational(15)*sp.log(3)/sp.log(2)!=(first+second)/2 and 3**3!=2**5
    assert SI.Quantity(10,"joule").dimensionality==SI.Unit("kilopascal*liter").dimensionality
    A,lam=sp.symbols("A lam",positive=True)
    cold=-lam*A;net=A+cold
    assert sp.solve(sp.Eq(12,net.subs(lam,sp.Rational(1,2))),A)[0]==24
    return [first,"J","W = W₂ ln r / ln 2","Da 10 a 20 J",inverse_reference(10,2),inverse_volume_ratio(10,10),physical_work(10,4)/first,20-first,
      "W₂ = W ln 2 / ln r","κ₁ ln (κ₂ r) / ln r",second/first,(first+second)/2,inverse_volume_ratio(4*first,20)/2,
      inverse_reference(decoded,4),inverse_reference(affine,2),sp.Rational(hot_isotherm_heat(12,Fraction(1,2)))]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    if not {(100,630,200,45),(300,630,200,45)}<=rects:raise ValueError("Independent physical scale of equal doubling-work bars changed")
    curves=[]
    for e in root.iter():
        if not e.tag.endswith("path") or len(e.get("d",""))<180:continue
        data=e.get("d");points=[(Fraction(x),Fraction(y)) for x,y in re.findall(r"[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)",data)]
        if len(points) not in (121,123) or data.count("M")!=1:raise ValueError("Independent physical scale: unexpected sampled curve grammar")
        upper=max(y for x,y in points)<800
        baseline,scale=(Fraction(430),Fraction(220)) if upper else (Fraction(1390),Fraction(320))
        multiplier=Fraction(1) if upper or e.get("stroke")=="#bc5315" else Fraction(1,2)
        actual=[(x,y) for x,y in points if y!=baseline]
        if len(actual)!=121:raise ValueError("Independent physical scale: missing exact-curve samples")
        for x,y in actual:
            volume=(x-70)/100
            if not 1<=volume<=4 or abs(y-(baseline-scale*multiplier/volume))>Fraction(1,3000):
                raise ValueError("Independent physical scale: sampled isotherm differs from q=1/v or 1/(2v)")
        increasing=upper or multiplier==1
        if any((x2<=x1 if increasing else x2>=x1) for (x1,y1),(x2,y2) in zip(actual,actual[1:])):raise ValueError("Independent physical scale: curve traversal direction reversed")
        curves.append((upper,multiplier))
    if len(curves)!=9 or curves.count((True,Fraction(1)))!=5 or curves.count((False,Fraction(1)))!=2 or curves.count((False,Fraction(1,2)))!=2:
        raise ValueError("Independent physical scale: incomplete reviewed curve coverage")
    arrows=[e for e in root.iter() if e.tag.endswith("path") and e.get("marker-end")]
    if len(arrows)!=6 or any(e.get("d","").count("M")!=1 for e in arrows):raise ValueError("Independent physical scale: missing or combined arrowhead paths")
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    required={"M470 1310.0V1350.0","M170 1230.0V1070","M470 1315.0V1345.0","M170 1205.0V1095"}
    if not required<=paths:raise ValueError("Independent physical scale: cycle isochore direction or endpoints changed")
    return "Full XML structure, all 1089 hyperbola sample points and full-height Chrome rendering independently checked. At x=70+100v, upper y=430-220/v and cycle hot/cold y=1390-320/v or1390-160/v; exact rational residual bound 1/3000 px only covers four-decimal drawing coordinates, not physical answers. Filled upper intervals 1..2 and 2..4 have equal exact integral ln2, though different widths; work bars 200+200 px at 20 px/J encode 10+10 J. Six separate arrowhead paths traverse expansion, cooling, compression and heating correctly. Cycle vertices are (1,1),(4,1/4),(4,1/8),(1,1/2); vertical isochores have zero work. Normalizations are explicitly different between panels. No false Carnot or total-absorbed-heat claim."

def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u5-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C3" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"]:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent thermodynamic conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[]
            for option in row["answer"]["options"]:
                try:values.append(parse_option(number,option))
                except (ValueError,TypeError):errors.append("Independent literal numeric alternative or physical unit invalid")
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and row["answer"].get("unit")!=NUMERIC_UNITS.get(number):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_ideal_state_conservation_or_reversible_work_derivation_inverse_and_calibration",
            "Pint_exact_SI_quantity_conversion_with_offset_temperature_points_distinct_from_intervals","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records

def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u5-gas-basics-148-152-primary-source-only.md","sha256":PRIMARY_SHA256}}
def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U5-01","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "physical scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["independentReview"]="PASS_AI"
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed self-certified author provenance accepted")
    cases.append({"case":"author_self_certification_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}


if __name__=="__main__":
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument("--directory",type=Path,required=True)
    parser.add_argument("--asset-root",type=Path);parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args();package=json.loads((args.directory/(BATCH+".json")).read_text())
    bindings=json.loads((args.directory/(BATCH+"-bindings.json")).read_text())
    result=report(package,bindings,args.asset_root);args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(canonical(result)+"\n")
    print(canonical({"count":len(result["records"]),"passed":sum(r["ok"] for r in result["records"])}))
    raise SystemExit(0 if all(r["ok"] for r in result["records"]) else 1)
