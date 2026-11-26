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
FAMILY='cyclic-work'
BATCH='cyclic-work-158'
ASSET_NAME='cyclic-work-progressive.svg'
CANDIDATE_REF='dbbd103fcf9ba5e3999e5892f09b8502a24bb632'
REVIEWED_PACKAGE_SHA256='2979eea898e3fd90274f53bea34cad0cea712f40dd9445d2b9113dd5340de1ec'
REVIEWED_BINDINGS_SHA256='1bfe5870701f282c7ddca5c885236d1faae97d8c2f14c6f952ee28206d9aa79f'
PRIMARY_SHA256='097f117b5082b44e84ae4171e538079a7aef07f6998a50da3ffbf328ba678009'
SOURCE_REFERENCE='Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.'
FALSE_PROOF='Il ritorno allo stato iniziale impone W=0 anche se Q_h>Q_c; il lavoro è una funzione di stato.'
SVG_MUTATION=(b'width="420"', b'width="400"')
EXPECTED_MAPPING={1: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 2: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 3: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 4: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 5: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 6: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 7: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 8: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 9: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 10: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 11: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 12: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 13: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 14: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 15: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08']), 16: ('C3-L08', ['C3-L01', 'C3-L06', 'C3-L07', 'C3-L08'])}
NUMERIC_UNITS={1: 'J', 5: 'J', 6: 'J', 14: 'J'}
OPTION_SUFFIX={7: '', 8: ' J', 11: '', 12: ' J', 13: '', 15: ' J', 16: ' J'}
UNITS={1: 'joule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'joule', 6: 'joule', 7: 'dimensionless', 8: 'joule', 9: 'joule', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'joule', 15: 'joule', 16: 'joule'}
MANUAL=['Il ritorno allo stato iniziale annulla ΔU e le energie macroscopiche sul ciclo; Q_net=Q_h−Q_c e ΔU=Q_net−W impongono W=100−40=60 J. Entrambi i Q sono moduli positivi e W>0.', 'Il lavoro è energia: J. La differenza di due energie conserva la dimensione; watt sarebbe energia divisa per tempo, non assegnato.', 'Da ΔU_ciclo=0 e nessun altro trasferimento, W=Q_h−Q_c. Il segno meno tiene conto del calore ceduto. La somma sarebbe il totale dei moduli scambiati e non il lavoro.', 'A: 100−40=60 J. B: 200−40=160 J. Il lavoro cresce di 100 J e ha rapporto 160/60=8/3, non raddoppia perché Q_c resta fisso.', 'Q_h=W+Q_c=60+40=100 J. W>0 e Q_c>0 garantiscono Q_h>Q_c.', 'Q_c=Q_h−W=100−60=40 J. Occorre 0<W<Q_h per rispettare Q_c>0.', 'W_A=100−40=60 J, W_B=100−60=40 J; W_B/W_A=40/60=2/3. Più calore scaricato riduce il lavoro a Q_h fisso.', 'Corretto 60 J; proposta 120 J. Proposta meno corretto=+60 J, non −60 J. La proposta supera anche Q_h e non rispetta il bilancio del modello.', 'W=Q_h−Q_c implica Q_h=W+Q_c, in J. Non si divide per Q_c né si cambia il segno di W.', 'W_B=κ₁Q_h−κ₂Q_c. Dividendo per W_A=Q_h−Q_c si ottiene (κ₁Q_h−κ₂Q_c)/(Q_h−Q_c). Richiesti Q_h>Q_c>0 e κ₁Q_h>κ₂Q_c>0. Per κ₁=κ₂=κ, rapporto κ.', 'A 60 J, B 200−60=140 J; rapporto 140/60=7/3.', 'Media=(60+140)/2=100 J. La legge è lineare: agli ingressi medi 150 e 50 J si trova 100 J, coincidenza motivata esattamente dalla linearità, non una legge generale per modelli non lineari.', 'Bersaglio=(7/3)60=140 J. A Q_h,B=200 J occorre Q_c,B=200−140=60 J. Rapporto Q_c,B/Q_c,A=60/40=3/2; entrambi i cicli hanno Q_h>Q_c>0.', 'Riferimento W 60 J, S 180: q=3 J⁻¹. Nuova W 420/q=140 J. Q_h=140+60=200 J. La lettura S non è un lavoro espresso in J.', 'A 60 J,S 121 e B 140 J,S 281: q=(281−121)/(140−60)=2 J⁻¹, b=121−2·60=1. C: W=(321−1)/2=160 J; Q_h=160+40=200 J.', 'Q_h=(5/2)Q_c, quindi W=(3/2)Q_c=60 J. Q_c=60·2/3=40 J e Q_h 100 J. Soluzione positiva unica; coefficiente 5/2 puro, non dimensionato in energia.']
DISTRACTORS=['La somma 140 J conta il calore ceduto come entrante.100 e 40 J sono trasferimenti singoli; zero confonde ΔU_ciclo con W.', 'W come unità è J/s; J/K misura capacità,K temperatura e Pa pressione. Il lavoro in J è il trasferimento, non un rapporto col tempo.', 'Somma e differenza opposta errano il segno del calore uscente; prodotto J² e rapporto puro non hanno dimensione di lavoro.', '120 J applica all’uscita il raddoppio del solo Q_h.240 J somma invece di sottrarre; −160 J usa lavoro entrante positivo e 60 J ignora B.', '20 J ricostruisce lavoro−20 J anziché 60 J.60/40 J copiano un trasferimento; un prodotto di energie non isola un addendo.', '−40 J è il contributo con segno al calore ricevuto dal gas, non il modulo scaricato.160 J somma lavoro e ingresso; 60 J copia il lavoro.', '3/2 è sia il reciproco dei lavori sia il rapporto degli scarichi.1 ignora la nuova uscita; 2 e−2/3 non soddisfano due lavori positivi 60 e 40 J.', '−60 J cambia l’ordine dello scarto.120 J copia la proposta,zero la accetta e 30 J dimezza ancora la differenza.', 'Sottrarre di nuovo Q_c non inverte il bilancio; Q_c−W può essere negativo. Prodotto e quoziente danno J² e 1.', 'κ₁κ₂ quadra il fattore comune,κ₁/κ₂ perde i pesi,le somme contano lo scarico come ingresso eκ₁−κ₂ dàzero a prove identiche.', '3/7 reciproco; 2 segue soltanto il calore caldo e 3/2 soltanto lo scarico.140 è il numero di joule del lavoro B, non un rapporto.', '200 J è la somma; 50 J dimezza due volte; 80 J è la differenza; 150 J copia l’ingresso medio senza scarico.', '2/3 reciproco; 7/3 è il bersaglio sui lavori. Rapporto 2 imporrebbe scarico 80 J e lavoro 120 J, non 140 J.60 copia un’energia.', 'Il display grezzo 420 non è in J e darebbe ingresso 480 J.140 J si ferma al lavoro senza aggiungere lo scarico.', '160 J si ferma al lavoro C.100/400 J danno S 121/721.401/2 J omette b e ricostruisce S 322 anziché 321.', '−40 J viola i moduli; 60 e 100 J copiano lavoro e ingresso.24 J divide per 5/2 anziché per il coefficiente netto 3/2.']
ASSUMPTIONS=['Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.', 'Sistema ciclico chiuso senza altre entrate energetiche, energie macroscopiche finali uguali alle iniziali. Q_h>Q_c>0 sono moduli, lavoro positivo uscente. Nessuna coppia di sorgenti è imposta comune fra prove; il bilancio ammette realizzazioni compatibili col secondo principio.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-cyclic-work-01": "c4631bb414e8aea64b24239276fa66b974db7e41ccff01a4f55ce90285d2ff19",
    "AR-u5-cyclic-work-02": "677f81799f0b5cd19782ff72e97bdd6588aea9707a8b8e5c939ae09cf413db50",
    "AR-u5-cyclic-work-03": "f77fc72ab723b4c7a792c19f8e40d81e5c449a67f21f573a503fd329da934b2a",
    "AR-u5-cyclic-work-04": "22867096eac08ddd0c8d9b1e4b02532db4b0a84c7b8e218f5b504343c9167110",
    "AR-u5-cyclic-work-05": "d7ec03bed6908fb57217ceabb7e5fdd9e4fa1452c6342884b63c927aadda7c55",
    "AR-u5-cyclic-work-06": "3cc28687d6c02e3f8beca5f3655bcf38bfdbdef997b6b116c1a3797a423712e0",
    "AR-u5-cyclic-work-07": "a8f50a713b4eff135f11fe53153aa805bed24957f5d72fcf995060be548511c6",
    "AR-u5-cyclic-work-08": "a65b043c70aa07216c43dcb3ceefdc9c211cb28f4c71ea2974998feb543dcc98",
    "AR-u5-cyclic-work-09": "f147ecb91834a23c5654d74a488f96585c976c0c8ecb51da9a2c1702c276dc29",
    "AR-u5-cyclic-work-10": "3172cb67644d4b3fba05f7065f7e4e66f3803a30358444165590babd5d5e695b",
    "AR-u5-cyclic-work-11": "c97b6b290ba3cb72b09da7747aa9b18979249aa6426dce1c6b8e2346614d9a21",
    "AR-u5-cyclic-work-12": "ed137f6634f95517cff305d4da3627726ee74f8b0202209cbd14ba80307a60cf",
    "AR-u5-cyclic-work-13": "b0e7ec869d01f96d25223bab8b92ff34611a7337418c001ed34c4f1d8eaca50b",
    "AR-u5-cyclic-work-14": "32ad7c7e66b5e4913fe63d581398e1e57ef06c88c46b4a970eaa01069c22bbe3",
    "AR-u5-cyclic-work-15": "38ab4ee4b85247e8084ff77c21ae5cf52c748853d8f56206cedf33ea72a76936",
    "AR-u5-cyclic-work-16": "c7b5a2c480dc437d7e138e7474d025d30fd1ce8a7117c4528541cb3f29bb8644"
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

def cycle_net(hot,cold):
    hot,cold=map(Fraction,(hot,cold))
    if not hot>cold>0:raise ValueError("Positive heat magnitudes and motor domain hot>cold required")
    energy=(SI.Quantity(hot,'joule')-SI.Quantity(cold,'joule')).to('joule')
    return Fraction(energy.magnitude)
def cycle_hot(work,cold):
    work,cold=map(Fraction,(work,cold))
    if min(work,cold)<=0:raise ValueError("Positive outgoing work and rejected heat required")
    return work+cold
def cycle_cold(hot,work):
    hot,work=map(Fraction,(hot,work))
    if not hot>work>0:raise ValueError("Motor inverse requires 0<work<hot")
    return hot-work
def cycle_scaled(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if min(a,b)<=0:raise ValueError("Positive scaling factors required")
    return cycle_net(a*hot,b*cold)/cycle_net(hot,cold)
def constrained_cold(work,factor):
    work,factor=map(Fraction,(work,factor))
    if work<=0 or factor<=1:raise ValueError("Positive motor work and factor>1 required")
    return work/(factor-1)
@lru_cache(maxsize=1)
def oracle():
    h,c,w,a,b=sp.symbols('h c w a b',positive=True)
    balance=sp.Eq(0,h-c-w)
    net=sp.solve(balance,w)[0]
    assert net==h-c and sp.solve(balance,h)[0]==w+c and sp.solve(balance,c)[0]==h-w
    first=sp.Rational(cycle_net(100,40));second=sp.Rational(cycle_net(200,60))
    assert first==60 and second==140
    scaled=sp.cancel(net.subs({h:a*h,c:b*c})/net)
    assert sp.cancel(scaled-(a*h-b*c)/(h-c))==0
    assert (first+second)/2==cycle_net(150,50)
    gain,offset,decoded,affine=calibrate(first,second,180,420,121,281,321,'joule')
    assert (gain,offset,decoded,affine)==(3,1,140,160)
    return [first,'J','W = Q_h − Q_c','Da 60 a 160 J',cycle_hot(60,40),cycle_cold(100,60),sp.Rational(cycle_net(100,60))/first,120-first,
      'Q_h = W + Q_c','(κ₁ Q_h − κ₂ Q_c) / (Q_h − Q_c)',second/first,(first+second)/2,sp.Rational(cycle_cold(200,sp.Rational(7,3)*first))/40,cycle_hot(decoded,60),cycle_hot(affine,40),constrained_cold(60,sp.Rational(5,2))]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    first=cycle_net(100,40);second=cycle_net(200,60)
    expected={(100,670,4*100,45),(100,750,4*40,50),(100+4*40,750,4*first,50),
      (110,1085,3*first,35),(110,1155,3*second,35),(110,1225,3*(first+second)/2,35)}
    if not expected<=rects:raise ValueError('Independent physical scale of cyclic energy split or mean changed')
    arrows={e.get('d') for e in root.iter() if e.tag.endswith('path') and e.get('marker-end')}
    if arrows!={'M220 140H245V205H260','M260 265H245V375H230','M460 235H590'}:raise ValueError('Independent physical scale or direction of three separate cyclic transfers changed')
    return 'Full XML and full-height Chrome rendering independently read. Schematic arrows: heat from hot source enters, cold heat and outgoing work leave. At 4 px/J the 400 px hot-energy bar equals adjacent 160 px cold and 240 px work segments. At 3 px/J distinct-work bars have lengths 180,420,300 px for 60,140,100 J, same x 110 origin. No source-temperature or instantaneous-power inference.'

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
