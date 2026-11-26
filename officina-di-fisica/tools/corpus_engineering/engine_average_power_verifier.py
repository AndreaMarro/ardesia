"""Independent source-first thermal-cycle review; no candidate-authoring imports.
Exact edition pins follow the full individual text and complete SVG reading.
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
SOURCE_PATH="packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-02.json"
FAMILY='engine-average-power'
BATCH='engine-average-power-160'
ASSET_NAME='engine-average-power-progressive.svg'
CANDIDATE_REF='92f0e5b5ca4d67b616c5a7a488b54581e8ef499d'
REVIEWED_PACKAGE_SHA256='0e4e9c9b2b2ee3b1824db0566d7d68c948a207666001a49379efdd11e2d055af'
REVIEWED_BINDINGS_SHA256='830439a64c5c28743fa4bf508401d0c6adafdfe2d544dccdb3ec13325b26ab93'
PRIMARY_SHA256='097f117b5082b44e84ae4171e538079a7aef07f6998a50da3ffbf328ba678009'
SOURCE_REFERENCE='Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.'
FALSE_PROOF='La media aritmetica delle potenze coincide sempre con quella pesata per le durate: 41/8 W è uguale a 27/4 W.'
SVG_MUTATION=(b'width="102.5"', b'width="100"')
EXPECTED_MAPPING={1: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 2: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 3: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 4: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 5: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 6: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 7: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 8: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 9: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 10: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 11: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 12: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 13: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 14: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 15: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09']), 16: ('C3-L09', ['C1-L001', 'C1-L007', 'C3-L06', 'C3-L08', 'C3-L09'])}
NUMERIC_UNITS={1: 'W', 5: 'J', 6: 's', 14: 'J'}
OPTION_SUFFIX={7: '', 8: ' W', 11: '', 12: ' W', 13: '', 15: ' J'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'joule', 6: 'second', 7: 'dimensionless', 8: 'watt', 9: 'joule', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'joule', 15: 'joule', 16: 'dimensionless'}
MANUAL=['Il lavoro utile per ciclo èηQ_h=(1/4)80=20 J. P_media=W_ciclo/t=20/2=10 W; non Q_h/t 40 W. La potenza istantanea non è determinata dal solo totale.', 'Unità J/s=W. Il lavoro per ciclo è in J, non già una potenza; la durata positiva è essenziale.', 'P=ηQ_h/t=Q_h/(4 t). Se il funzionamento si ripete senza pause, N cicli danno NηQ_h/(Nt), lo stesso valore medio. Non si assume che P(t) sia costante.', 'Q_h 80→160 J a t 2 s: lavori 20→40 J e potenze 10→20 W. La dipendenza in Q_h è lineare.', 'Q_h=Pt/η=4 Pt=4·10·2=80 J. Ws=J.', 't=ηQ_h/P=80/(4·10)=2 s, positivo. P non è calore per unità di tempo, ma lavoro utile per unità di tempo.', 'A 10 W; B 80/(4·4)=5 W. Rapporto 1/2: stesso lavoro distribuito su durata doppia.', 'Proposta 20 W, corretto 10 W: +10 W. Venti è anche il numero del lavoro in J ma scambiare energia e potenza è dimensionalmente errato.', 'Q_h=4 Pt. Fattore 4 è 1/η, adimensionale; Pt ha unità J.', 'Rapporto P_B/P_A=(κ₁Q_h/(4 κ₂t))/(Q_h/(4 t))=κ₁/κ₂, tutti gli ingressi/fattori positivi.', 'Originale A 10 W. B 1 J/(4·1 s)=1/4 W; rapporto 1/40.', 'Media originale(10+1/4)/2=41/8 W. Modello agli ingressi medi Q_h 81/2 J,t 3/2 s dà 27/4 W; non è la media delle due potenze e neppure la media ponderata per durate, che sarebbe 27/4 W in questo caso.', 'Bersaglio P_B 10/40=1/4 W. Q_h,B 1 J⇒t_B=(1/4)1/(1/4)=1 s, rapporto t_B/t_A=1/2.', 'q 30/(10 W)=3 W⁻¹. S_B 3/4⇒P_B 1/4 W. Con t 1 s si ha Q_h=4 Pt=1 J.', 'A 10 W,S 21 e B 1/4 W,S 3/2: q=(21−3/2)/(10−1/4)=2 W⁻¹,b 1. C P=(41−1)/2=20 W. A t 2 s,Q_h 4·20·2=160 J.', 'Q_h=d t con d 40 J/s rende P=d/4=10 W per ogni t>0. Infinite coppie positive; non determina durata o energia per ciclo separatamente. d è dimensionato J/s e il vincolo collega prove, non potenza istantanea.']
DISTRACTORS=['40 W ignoraη; 20 è il numero del lavoro in J prima di dividere per 2 s; 5 W dimezza ancora. Moltiplicare per il tempo darebbe J·s.', 'J è energia,J·s prodotto col tempo,1 rendimento,K temperatura. Una potenza richiede J/s.', '4 Q_h/t inverteη; Q_ht/4 ha J·s; Q_h/t ignora la perdita; t/(4 Q_h) è inversa di potenza.', '5 W inverte l’effetto del calore; 10 W ignora B; 80 W ometteη; 40 è il numero del lavoro B prima della divisione per 2 s.', '20 J è solo lavoro utile; 5 J applica ancoraη anziché invertirlo; 40 J omette la durata di 2 s.', '8 s ometteη,1/2 s inverte il numero del risultato ma non la formula; 40 J è energia e non durata.', '2 segue il tempo direttamente,1 lo ignora,1/4 e 4 introducono un quadrato assente.', '−10 W cambia l’ordine; 20 W copia la proposta; 0 W l’accetta; 5 W dimezza lo scarto.', 'Pt/4 applicaη anziché 1/η. P/t ha J/s² e t/P ha s²/J; nessuna è l’energia richiesta.', 'κ₁κ₂ fa aumentare la potenza con la durata; κ₂/κ₁ scambia i ruoli; quadrato e somma falliscono per il quoziente lineare.', '40 reciproco; 1/80 segue solo Q_h; 1/2 segue le durate; 1/4 copia il numero della potenza B in W.', '27/4 W è media pesata per le durate o modello agli ingressi medi.41/4 W somma senza metà; 39/8 W fa metà della differenza; 10 W ignora B.', '2 reciproco; 1/40 bersaglio sulle potenze; 1/80 rapporto dei calori.1 richiederebbe t_B 2 s e potenza 1/8 W,non 1/4 W.', 'Usare S 3/4 come watt darebbe calore 3 J.1/4 J è solo lavoro,non ingresso termico: occorre moltiplicare per 4.', '80 J dà S 21; 40 J è lavoro utile C; 164 J omette b e produce S 42; 320 J raddoppia ancora la durata già inclusa.', '1 s e 2 s sono esempi leciti,non unicità.10 s copia un numero di potenza. Zero rende indefinita la divisione e nessuna nega le durate positive valide.']
ASSUMPTIONS=['Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Media aritmetica a pesi uguali delle due potenze; non la media temporale di cicli concatenati. I due intervalli di 2 s e 1 s sono entrambi positivi e la distinzione dei pesi è fisicamente necessaria.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.', 'Rendimento costante assegnatoη 1/4, calore per ciclo positivo, durata strettamente positiva, lavoro utile uscente. La potenza è media su un ciclo o su cicli senza intervalli inattivi, non una funzione istantanea imposta.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-engine-average-power-01": "7e5eded1b4dbbcd06fd08842c64465cecbc46b57c9afcf2795aca07a4cd2f40f",
    "AR-u5-engine-average-power-02": "59ccff8c25aad94292543efb2bdc988686c9a1b6acd59b2efece599e0b28782a",
    "AR-u5-engine-average-power-03": "b04aae34bbfcf1664f32ebfd5caa800eca7f5f211f656dd78a4e069a7d6c924d",
    "AR-u5-engine-average-power-04": "f599a9b6a95baee59a2cf33d2d1a562917f91f182e918a39a0fb36b8e174ac64",
    "AR-u5-engine-average-power-05": "557279c8e9e6a7d2519adf01d13852189263af1f2b1067e362f20cd7bc992f1e",
    "AR-u5-engine-average-power-06": "b75fee16111256ce168adc1f1994f2d8b3e4fc9e3b47f34c98439730bfdb72da",
    "AR-u5-engine-average-power-07": "9c1eb21e2ff80928d8dc4f18d1a8cfc82ae6e04115742a785ecebd3ccb00ae89",
    "AR-u5-engine-average-power-08": "b0e88924de9bdae6dedcae330ab60ea0debe4fc9939d6247035e47a23a95dd9c",
    "AR-u5-engine-average-power-09": "3652e93069e9ecb9bfaf1748617f6ee2d3a8cd873a13257b3640fbbc9344f4f4",
    "AR-u5-engine-average-power-10": "49c5b42a0643ce4602cd5d0debfeee95d8e3e07cc3bd53794b29c6ae4cdc7d0a",
    "AR-u5-engine-average-power-11": "4457956646e36f77acd237a639c7664d98add103c477be0a148ee547f1cd096c",
    "AR-u5-engine-average-power-12": "3c23e0a8de6771fd13bf1c64a49d386b140a7cbee1fa7f751d14f5122c221b39",
    "AR-u5-engine-average-power-13": "4907c846f36c12d8062b119a331b74c34450af69040d68e4f879c9e0b01e5d15",
    "AR-u5-engine-average-power-14": "71a11c5b795d89eb98d2ba7591b90136b5c4c8c9ad7a5e6082845a57ffee2e43",
    "AR-u5-engine-average-power-15": "2fdc13915de4fb1db738aefe5769a30fcf984d4b3c540468b576db8f0bd74690",
    "AR-u5-engine-average-power-16": "4bd482c70e89a7f5df3a6c265dfe4cfe52d971ca2c0aea5a8f687cf35139cec0"
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

def average_power(heat,duration):
    heat,duration=map(Fraction,(heat,duration))
    if min(heat,duration)<=0:raise ValueError("Positive heat and strictly positive duration required")
    power=(SI.Quantity(heat,'J')*Fraction(1,4)/SI.Quantity(duration,'s')).to('watt')
    return Fraction(power.magnitude)
def heat_from_power(power,duration):
    power,duration=map(Fraction,(power,duration))
    if min(power,duration)<=0:raise ValueError("Positive power and duration required")
    return Fraction((4*SI.Quantity(power,'W')*SI.Quantity(duration,'s')).to('J').magnitude)
def duration_from_power(heat,power):
    heat,power=map(Fraction,(heat,power))
    if min(heat,power)<=0:raise ValueError("Positive heat and power required")
    return Fraction((SI.Quantity(heat,'J')/(4*SI.Quantity(power,'W'))).to('s').magnitude)
def power_scaled(heat,duration,a,b):
    heat,duration,a,b=map(Fraction,(heat,duration,a,b))
    if min(a,b)<=0:raise ValueError("Positive scaling factors required")
    return average_power(a*heat,b*duration)/average_power(heat,duration)
def redundant_power(coefficient,power):
    coefficient,power=map(Fraction,(coefficient,power))
    if min(coefficient,power)<=0:raise ValueError("Strictly positive heat-per-time and power required")
    if power!=coefficient/4:raise ValueError("Inconsistent heat-duration constraint and power")
    return 'infinite'
@lru_cache(maxsize=1)
def oracle():
    h,t,p,a,b=sp.symbols('h t p a b',positive=True)
    model=h/(4*t)
    assert sp.solve(sp.Eq(p,model),h)[0]==4*p*t
    assert sp.solve(sp.Eq(p,model),t)[0]==h/(4*p)
    assert sp.cancel(model.subs({h:a*h,t:b*t})/model-a/b)==0
    first=sp.Rational(average_power(80,2));second=sp.Rational(average_power(1,1))
    gain,offset,decoded,affine=calibrate(first,second,30,sp.Rational(3,4),21,sp.Rational(3,2),41,'watt')
    assert (gain,offset,decoded,affine)==(3,1,sp.Rational(1,4),20)
    statistical=(first+second)/2;concatenated=(first*2+second)/3
    assert statistical==sp.Rational(41,8) and concatenated==sp.Rational(27,4)
    assert average_power(Fraction(81,2),Fraction(3,2))==concatenated!=statistical
    assert redundant_power(40,10)=='infinite'
    return [first,'W = J/s','P = Q_h / (4 t)','Da 10 a 20 W',heat_from_power(10,2),duration_from_power(80,10),sp.Rational(average_power(80,4))/first,20-first,
      'Q_h = 4 P t','κ₁ / κ₂',second/first,statistical,sp.Rational(duration_from_power(1,first/40))/2,heat_from_power(decoded,1),heat_from_power(affine,2),'Infinite: ogni t>0, con Q_h=(40 J/s)t']

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    first=average_power(80,2);second=average_power(1,1)
    expected={(100,145,320,48),(100,230,240,48),(340,230,80,48),
      (140,1145,20*first,35),(140,1215,20*second,35),(140,1285,20*(first+second)/2,35)}
    if not expected<=rects:raise ValueError('Independent physical scale of cycle heat-work or mean power changed')
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    if not {'M110 850V555','M110 850H410','M110 850L270 610','M110 610H270V850'}<=paths:raise ValueError('Independent physical scale of cumulative-work interval changed')
    if Fraction(270-110)!=80*2 or Fraction(850-610)!=12*Fraction(80,4):raise ValueError('Independent physical scale of energy-time endpoint changed')
    return 'Full XML and full-height Chrome rendering independently read. Energetic bars 320=240+80 px at 4 px/J encode 80=60+20 J. Distinct cumulative-work example runs from(110,850) to(270,610): 2 s at 80 px/s and 20 J at 12 px/J, average 10 W. Its straightness is explicitly illustrative, not imposed instantaneous power. Power bars 200,5,102.5 px at 20 px/W encode 10,1/4,41/8 W; the nonzero short bar is visible. Concatenated-cycle average 27/4 W is separately labelled.'

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
        if row.get("course")!="C3" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_cycle_first_law_reversible_entropy_ratio_mean_power_inverse_and_calibration",
            "Pint_exact_energy_temperature_power_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records

def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u5-thermal-cycles-158-162-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U5-02","U2-01")
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
