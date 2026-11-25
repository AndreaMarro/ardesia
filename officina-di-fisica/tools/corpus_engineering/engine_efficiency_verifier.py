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
FAMILY='engine-efficiency'
BATCH='engine-efficiency-159'
ASSET_NAME='engine-efficiency-progressive.svg'
CANDIDATE_REF='0b22b4011bbe952fcc12fbc541ac03cb9bce2b63'
REVIEWED_PACKAGE_SHA256='5892379dc777ec4a65de9facfede30064865190255b8dddf811b54cb7f1a3fd0'
REVIEWED_BINDINGS_SHA256='36533d09b8ed04ff70abaa6d057de075bfc60f662d1dac3b6a1caa7a7b8ff75f'
PRIMARY_SHA256='097f117b5082b44e84ae4171e538079a7aef07f6998a50da3ffbf328ba678009'
SOURCE_REFERENCE='Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.'
FALSE_PROOF='Una macchina ciclica con un’unica sorgente è sempre lecita se Q=W: il primo principio prova anche il secondo.'
SVG_MUTATION=(b'width="260"', b'width="250"')
EXPECTED_MAPPING={1: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 2: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 3: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 4: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 5: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 6: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 7: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 8: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 9: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 10: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 11: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 12: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 13: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 14: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 15: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09']), 16: ('C3-L09', ['C3-L06', 'C3-L07', 'C3-L08', 'C3-L09'])}
NUMERIC_UNITS={5: 'J', 6: 'J', 14: 'J'}
OPTION_SUFFIX={1: '', 7: '', 8: '', 11: '', 12: '', 13: '', 15: ' J'}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'joule', 6: 'joule', 7: 'dimensionless', 8: 'dimensionless', 9: 'joule', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'joule', 15: 'joule', 16: 'dimensionless'}
MANUAL=['ΔU_ciclo=0⇒W=Q_h−Q_c=80 J. η=W/Q_h=80/100=4/5. 0<η<1 deriva da 0<Q_c<Q_h.', 'η è rapporto di energie e quindi numero puro 1. La percentuale 80% rappresenta lo stesso 4/5, non 80 come numero puro.', 'Caso autonomo: macchina ciclica, una sola sorgente, unico effetto Q→W integrale. Il primo principio sarebbe rispettato con ΔU 0 e W=Q; il secondo principio nella forma Kelvin–Planck lo vieta. Non confondere questa impossibilità con una violazione della conservazione energetica o con un processo non ciclico.', 'Aη=1−20/100=4/5. Bη=1−20/200=9/10. Cresce ma non raddoppia, resta strettamente minore di 1.', '1−η=Q_c/Q_h: Q_h=Q_c/(1−η)=20/(1/5)=100 J. Richiesto 0<η<1.', 'Q_c=(1−η)Q_h=(1/5)100=20 J, positivo e minore di Q_h.', 'A 4/5; B 1−40/100=3/5. Rapporto(3/5)/(4/5)=3/4. Invertire il confronto darebbe 4/3.', 'Corretto 4/5, proposta 8/5: scarto+4/5. La proposta supera 1 ed è incompatibile con le energie dichiarate per il motore.', 'Q_h=Q_c/(1−η), η fra 0 e 1. Q_c/(η−1) negativo e Q_c/η non risolve il bilancio.', 'η_B=(κ₁Q_h−κ₂Q_c)/(κ₁Q_h). Rapportoη_B/η_A=(κ₁Q_h−κ₂Q_c)/[κ₁(Q_h−Q_c)]. Entrambe le differenze positive. Riscalamento comuneκ lasciaη invariato.', 'Originale Aη 4/5; BQ_h 2 J,Q_c 1 J⇒η 1/2. Rapporto(1/2)/(4/5)=5/8. Piccole energie per ciclo lecite nel modello; non sono temperature.', 'Originale media=(4/5+1/2)/2=13/20. Agli ingressi medi Q_h 51 J,Q_c 21/2 J si ottiene 27/34, diverso. Non mediare i calori prima della funzione senza motivo.', 'Originale bersaglio(5/8)(4/5)=1/2. Con Q_h,B 2 J, Q_c,B=(1−1/2)2=1 J. Rapportoal 20 J iniziale 1/20.', 'q=(12/5)/(4/5)=3. Nuovaη=(3/2)/3=1/2. Con Q_c 1 J, Q_h=1/(1−1/2)=2 J.', 'η_A 4/5,S 13/5 e η_B 1/2,S 2: q=(13/5−2)/(4/5−1/2)=2, b=1. Cη=(14/5−1)/2=9/10. Con Q_c 20 J, Q_h=20/(1/10)=200 J.', 'Q_h=5 Q_c rendeη=1−1/5=4/5 per ogni Q_c>0. Il rendimento misurato è ridondante: infinite coppie positive, nessuna scala energetica identificata. Non imporre una stessa coppia di sorgenti fra preparazioni se assente dal testo.']
DISTRACTORS=['1/5 è la frazione ceduta; 5 confronta ingresso e scarico; 6/5 somma i calori e 80 è il lavoro in J. Il rendimento puro è 4/5, equivalente a 80%.', 'J energia,W potenza,J/K capacità,K temperatura: nessuna rimane nel rapporto J/J.', 'Il primo principio permette il bilancio Q=W ma non rende lecita la macchina ciclica monosorgente. Aumentare Q,chiudere il ciclo o cambiare fluido non evita Kelvin–Planck.', '8/5 raddoppia erroneamenteη e supera 1; 2/5 lo dimezza; 1/10 è la quota ceduta.4/5 richiederebbe scarico anch’esso doppio.', '25 J usa Q_c/η; 4 J moltiplica per la quota persa anziché dividere.80 J è lavoro, non calore caldo.', '80 J è il lavoro.125 J divide perη; −20 J dà al modulo il segno del contributo del freddo al calore del fluido.', '4/3 reciproco,2 segue lo scarico,1/2 non valuta il complemento e 1 ignora la perdita aggiuntiva.', '−4/5 scambia lo scarto,8/5 copia la proposta,0 la accetta e 1/5 è la frazione ceduta.', 'Q_c/η confonde frazione utile e ceduta; moltiplicare per 1−η inverte male; η−1 dà ingresso negativo eη/Q_c dà J⁻¹.', 'Il rapporto senzaκ₁ al denominatore è quello dei lavori. Prodotto e differenza dei fattori falliscono a fattori comuni; il solo quoziente ignora il complemento.', '8/5 è reciproco; 1/80 confronta lavori; 1/50 ingressi; 1/20 scarichi. Tutti differiscono dal rapporto delle due quote utili.', '27/34 usa gli ingressi medi o il rendimento energetico aggregato,non i pesi uguali.13/10 è somma,3/10 differenza,1/2 sola B.', '20 reciproco; 5/8 è rapporto dei rendimenti; 1/50 rapporto degli ingressi.1 è il numero del calore B in J e non il suo rapporto con 20 J.', 'Usare S 3/2 direttamente perη violaη<1 e rende negativa l’inversa.1 J copia lo scarico. Il guadagno adimensionale non altera la dimensione del calore.', '100 J dà S 13/5; 20 J dàη 0.−50 J omette b e deriva daη 7/5 fuori dominio.200/9 J divide perη 9/10 anziché per il complemento 1/10.', '20 J e 4/5 J sono esempi o numeri scambiati di unità,non valori unici. Il vincolo dà una famiglia continua; zero annulla entrambi i calori e rendeη indefinito.']
ASSUMPTIONS=['Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Caso 03 autonomo Kelvin–Planck: dispositivo ciclico con una sola sorgente e nessun altro effetto. Non si impone Q_c>0 per dimostrare il divieto; il primo principio da solo ammetterebbe Q=W.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.', 'Macchina ciclica senza altre entrate, Q_h>Q_c>0, W uscente e 0<η<1 nei quesiti numerici. I calori sono moduli, le sorgenti non fissate comuni fra prove. Display continui adimensionali, guadagni positivi e offset costanti.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-engine-efficiency-01": "4620dac6f201efec4e13180ccb47f2fc5004f3001f741406b1116d9ecb156f27",
    "AR-u5-engine-efficiency-02": "f1211c481bcc7dd194195ca2bea05d2bf1132441bb26844ea005fed4b54ca951",
    "AR-u5-engine-efficiency-03": "c64fa0c0e784952c338866a3f77a98511861b036762815daf5f6398d3d8d5e46",
    "AR-u5-engine-efficiency-04": "8b3e6c49eadc1b57e4df0522d9b89ec15926b8c283f0735d540d516862b702bf",
    "AR-u5-engine-efficiency-05": "7d2d50ea83937f4a069c9e08a9b20395723cd21de0da68929269f066a59e4296",
    "AR-u5-engine-efficiency-06": "001c6e7be4eabd05098053c99774e41f876103364613aacc0e901102791e3b29",
    "AR-u5-engine-efficiency-07": "b06bd14a6bb005e88489cb0ff43bf5f7cbddaecec7072ff3b8f5e820172b95e4",
    "AR-u5-engine-efficiency-08": "1d15682fbd21f751f24d1c260c081d8e9a0e37d2302a6e624708c04c4c9becd9",
    "AR-u5-engine-efficiency-09": "cb553a17eed079ac8d0a0a4898a62f229cf7510f628595f152382e812b4d7f35",
    "AR-u5-engine-efficiency-10": "9712e52c6c27f0e3b7b4f4551e994be8d4aba86240c0df2ee2075d24b0915972",
    "AR-u5-engine-efficiency-11": "968a603e055df7766ed1b0ca59655ab5eda22bb1a137f10e3f2ca4ebcac2e49f",
    "AR-u5-engine-efficiency-12": "c7e32a674ea8e27759e3450ff534e75dbaa09b5e54b3d21d8a396f5b0de4a44d",
    "AR-u5-engine-efficiency-13": "822b371a34493fb3884f2bfd25347f27908224e41c35db7ebc81a0fd270b7489",
    "AR-u5-engine-efficiency-14": "59d0d2dfa2b259039d009024320023914c6797644d658683c9ac0c67b6793a95",
    "AR-u5-engine-efficiency-15": "a5330d47c95d6d75ddd609ffc9c37f1f864da342bdbb6440f016e66cde9c584d",
    "AR-u5-engine-efficiency-16": "681a134b7b37f073988744803d2d39a2fdb157c725d042afc970c9a6c5a637ed"
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

def efficiency(hot,cold):
    hot,cold=map(Fraction,(hot,cold))
    if not hot>cold>0:raise ValueError("Motor heat magnitudes require hot>cold>0")
    result=((SI.Quantity(hot,'J')-SI.Quantity(cold,'J'))/SI.Quantity(hot,'J')).to('dimensionless')
    return Fraction(result.magnitude)
def hot_from_eta(cold,eta):
    cold,eta=map(Fraction,(cold,eta))
    if cold<=0 or not 0<eta<1:raise ValueError("Efficiency inverse requires cold>0 and 0<eta<1")
    return cold/(1-eta)
def cold_from_eta(hot,eta):
    hot,eta=map(Fraction,(hot,eta))
    if hot<=0 or not 0<eta<1:raise ValueError("Efficiency inverse requires hot>0 and 0<eta<1")
    return (1-eta)*hot
def efficiency_scaled(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if min(a,b)<=0:raise ValueError("Positive scaling factors required")
    return efficiency(a*hot,b*cold)/efficiency(hot,cold)
def redundant_efficiency(factor,eta):
    factor,eta=map(Fraction,(factor,eta))
    if factor<=1 or not 0<eta<1:raise ValueError("Strict motor domain required")
    if eta!=1-1/factor:raise ValueError("Inconsistent efficiency and heat-ratio constraint")
    return 'infinite'
@lru_cache(maxsize=1)
def oracle():
    h,c,w,e,a,b=sp.symbols('h c w e a b',positive=True)
    work=sp.solve(sp.Eq(0,h-c-w),w)[0]
    eta=sp.cancel(work/h)
    assert sp.simplify(sp.solve(sp.Eq(e,eta),h)[0]-c/(1-e))==0
    assert sp.solve(sp.Eq(e,eta),c)[0]==h*(1-e)
    ratio=sp.cancel(eta.subs({h:a*h,c:b*c})/eta)
    assert sp.cancel(ratio-(a*h-b*c)/(a*(h-c)))==0
    first=sp.Rational(efficiency(100,20));second=sp.Rational(efficiency(2,1))
    gain,offset,decoded,affine=calibrate(first,second,sp.Rational(12,5),sp.Rational(3,2),sp.Rational(13,5),2,sp.Rational(14,5),'dimensionless')
    assert (first,second,gain,offset,decoded,affine)==(sp.Rational(4,5),sp.Rational(1,2),3,1,sp.Rational(1,2),sp.Rational(9,10))
    assert (first+second)/2!=efficiency(51,Fraction(21,2))
    assert redundant_efficiency(5,first)=='infinite'
    return [first,'1 (adimensionale)','È vietata dal secondo principio, pur potendo rispettare il bilancio energetico','Da 4/5 a 9/10',hot_from_eta(20,first),cold_from_eta(100,first),sp.Rational(efficiency(100,40))/first,sp.Rational(8,5)-first,
      'Q_h = Q_c / (1 − η)','(κ₁ Q_h − κ₂ Q_c) / [κ₁ (Q_h − Q_c)]',second/first,(first+second)/2,sp.Rational(cold_from_eta(2,sp.Rational(5,8)*first))/20,hot_from_eta(1,decoded),hot_from_eta(20,affine),'Infiniti: ogni Q_c>0, con Q_h=5Q_c']

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    first=efficiency(100,20);second=efficiency(2,1)
    expected={(100,670,400,45),(100,750,80,50),(180,750,320,50),
      (110,1085,400*first,35),(110,1155,400*second,35),(110,1225,400*(first+second)/2,35)}
    if not expected<=rects:raise ValueError('Independent physical scale of energy split or efficiency mean changed')
    arrows={e.get('d') for e in root.iter() if e.tag.endswith('path') and e.get('marker-end')}
    if arrows!={'M220 140H245V205H260','M260 265H245V375H230','M460 235H590'}:raise ValueError('Independent physical scale or direction of motor transfers changed')
    return 'Full XML and full-height Chrome rendering independently read. Energetic panel uses 4 px/J: 400 px is split into 80 and 320 px for rejected 20 J and useful 80 J. Separate efficiency panel uses 400 px per unit, lengths 320,200,260 px for 4/5,1/2,13/20 at common x 110. Schematic arrows retain correct input/output directions. Different panel units are explicitly separated; the Kelvin-Planck hypothetical device is a distinct question, not this real motor diagram.'

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
