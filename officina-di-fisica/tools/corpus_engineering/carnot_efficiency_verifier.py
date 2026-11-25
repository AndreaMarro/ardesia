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
FAMILY='carnot-efficiency'
BATCH='carnot-efficiency-161'
ASSET_NAME='carnot-efficiency-progressive.svg'
CANDIDATE_REF='747d291eafeb6a8265c56cf6ee6b90d779a45aab'
REVIEWED_PACKAGE_SHA256='83377100497a3423ab82368d06fe1ff53f8da1647882c0102e98f9f47a7ec46e'
REVIEWED_BINDINGS_SHA256='9dba6b7d615b5df1558cff32b3fedd05d173c6a5aa0cab44d094ad87e41fea23'
PRIMARY_SHA256='097f117b5082b44e84ae4171e538079a7aef07f6998a50da3ffbf328ba678009'
SOURCE_REFERENCE='Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.'
FALSE_PROOF='Due macchine reversibili fra le stesse sorgenti hanno rendimenti diversi se cambia la massa molecolare.'
SVG_MUTATION=(b'height="200"', b'height="190"')
EXPECTED_MAPPING={1: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 2: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 3: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 4: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 5: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 6: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 7: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 8: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 9: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 10: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 11: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 12: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 13: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 14: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 15: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09']), 16: ('C3-L09', ['C3-L01', 'C3-L08', 'C3-L09'])}
NUMERIC_UNITS={5: 'K', 6: 'K', 14: 'K'}
OPTION_SUFFIX={1: '', 7: '', 8: '', 11: '', 12: '', 13: '', 15: ' K'}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'kelvin', 6: 'kelvin', 7: 'dimensionless', 8: 'dimensionless', 9: 'kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'kelvin', 15: 'kelvin', 16: 'dimensionless'}
MANUAL=['Un motore reversibile fra due sorgenti assolute ordinate ha Q_c/Q_h=T_c/T_h. η_C=1−200/400=1/2.', 'Kelvin su kelvin si cancella, quindi rendimento puro 1. Non è calore, lavoro o temperatura.', 'Teorema di Carnot: tutte le macchine reversibili fra le stesse due sorgenti hanno identico rendimento indipendente dalla sostanza di lavoro. La reversibilità e l’assenza di altre sorgenti sono necessarie; non promette identico lavoro per ciclo o identica potenza.', 'T_c 200 K fissa, T_h 400→600 K: η 1/2→1−1/3=2/3. Cresce, non diventa 1.', 'T_h=T_c/(1−η)=200/(1/2)=400 K, maggiore di T_c.', 'T_c=(1−η)T_h=(1/2)400=200 K, positiva.', 'A 1/2. B 1−300/400=1/4. Rapporto 1/2, non rapporto delle temperature fredde 3/2.', 'Proposta 1, corretto 1/2⇒scarto+1/2. La conversione integrale non è ammessa con T_c>0 e T_h finita.', 'T_h=T_c/(1−η_C), valido T_c>0 e 0<η_C<1. Non usare letture Celsius nei rapporti.', 'η_B/η_A=(κ₁T_h−κ₂T_c)/[κ₁(T_h−T_c)]. Occorrono T_h>T_c>0 eκ₁T_h>κ₂T_c>0; riscalamento comune lascia invariato il rendimento.', 'Il candidato dichiara una riparametrizzazione: B usa 900/300 K al posto di 3/1 K. Il rapporto freddo/caldo resta 1/3, quindi η_B 2/3 e confronto con A 1/2 pari 4/3. Ricalcolo distinto sui dati finali, non assunzione che i risultati restino tutti uguali.', 'Dati finali A 400/200 K e B 900/300 K: η_A 1/2,η_B 2/3, media 7/12. Il modello agli ingressi medi 650/250 K dà 8/13, diverso; 91≠96 prova la distinzione esatta. Il dato 202/403 apparteneva agli ingressi medi originali 3/1 K e non viene riusato sul candidato.', 'Dati finali: η_B=(4/3)(1/2)=2/3 e T_h,B 900 K. L’inversa T_c,B=(1−η_B)T_h,B dà 300 K; rispetto ai 200 K iniziali il rapporto è 3/2. Non si conserva il vecchio 1/200 del sorgente riparametrizzato.', 'Il riferimentoη_A 1/2 con S 3/2 fissa q 3. Nuova S 2 dàη_B 2/3; sul candidato T_c,B 300 K, quindi T_h,B=300/(1/3)=900 K. Le temperature sono assolute.', 'Riferimenti candidatiη_A 1/2 eη_B 2/3, S 2 e 7/3: q 2,b 1. C S 5/3 dàη_C 1/3. Il suo freddo 600 K richiede T_h,C=600/(2/3)=900 K; confronto per sostituzione conferma S 5/3.', 'T_h=2 T_c⇒η=1/2 per ogni T_c>0. Infinite coppie: la misura diη non identifica la scala assoluta. Nessuna temperatura nulla ammessa.']
DISTRACTORS=['2 è T_h/T_c; 1/4 quadra il rapporto; 1 ignora lo scarico con T_c>0; 200 è un intervallo termico in K,non un rendimento.', 'K temperatura,J energia,W potenza,K⁻¹ reciproco termico: il rapporto K/K è puro.', 'Fluido,massa molecolare,capacità e numero di moli possono cambiare energie e potenza,ma non il limite reversibile fra le stesse sorgenti. I calori non servono a confrontareη.', '3/4 moltiplicaη per il solo fattore della temperatura calda.1/3 è la quota ceduta,1/2 ignora il cambiamento e 1 non è raggiunto con T_c positiva e T_h finita.', '100 K moltiplica per 1/2 anziché dividere e viola T_h>T_c; 200 K dàη 0. Nessuna conversione Celsius è autorizzata.', '800 K inverte la moltiplicazione e viola T_c<T_h; 400 K dàη 0; 0 K non è il dato e non è nel dominio.', '2 reciproco,3/2 segue T_c,2/3 ne prende l’inverso e 1 ignora il cambiamento. Il complemento portaη_B 1/4,non 3/4.', '−1/2 cambia lo scarto,1 copia la proposta,0 l’accetta e 2 è il rapporto caldo/freddo. Reversibile non significaη 1.', 'T_c/η coincide solo accidentalmente aη 1/2,non in generale. Il prodotto inverte male; η−1 dà T_h negativa; η/T_c ha K⁻¹.', 'Senzaκ₁ al denominatore si confrontano salti,non rendimenti. Quoziente semplice,prodotto e differenza non conservano il limite a riscalamento comune.', '3/4 reciproco; 9/4 segue T_h; 3/2 segue T_c; 2/3 è il solo rendimento B. Un rapporto fra rendimenti può superare 1 senza violare ciascunη<1.', '8/13 è il rendimento alle temperature medie candidate 650/250 K; 7/6 somma,1/6 differenza,2/3 sola B.91≠96 prova 7/12≠8/13.', '2/3 reciproco; 4/3 bersaglio sui rendimenti; 9/4 confronto dei caldi; 1/3 usa T_h,B al denominatore invece di T_c,A.', '300 K copia il freddo e dàη 0.450 K divide perη_B invece del complemento. S 2 non èη 2: serve q 3.', '1200 K dà S 2; 1800 K divide perη_C anziché 1−η_C; 3600 K omette b e usaη 5/6; 300 K viola l’ordine rispetto al freddo 600 K.', '200 K è un esempio,non un valore fissato.1/2 K trasforma il numero del rendimento in temperatura. Zero viola positività e rende entrambe le sorgenti nulle; la famiglia non è vuota.']
ASSUMPTIONS=['Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.', 'Macchina ciclica reversibile con soli due serbatoi ideali a T_h>T_c>0; temperature assolute costanti entro ogni prova. Fra prove possono variare. Le energie e la potenza non sono fissate dalle sole temperature. In 11–15 la parametrizzazione finale dichiarata viene risolta separatamente.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-carnot-efficiency-01": "2608a544486ef3356e226ccaa73f3285de73355ce1b7c7a2b253f0946e58d969",
    "AR-u5-carnot-efficiency-02": "9d6f083e967bc00f5060bfea7884c3015e09c8e4389a5e0d5ebe5645e0da71c5",
    "AR-u5-carnot-efficiency-03": "81d036f76dfa21f50e20f747c370e3fc228f5e35b7e5cede6c844a2cf8b13794",
    "AR-u5-carnot-efficiency-04": "550812b0e46be1064b36406050e0f70a432f7d228e5c9cbabc4c416430dfba93",
    "AR-u5-carnot-efficiency-05": "e445634db5c98e1b142750589d6f2f6df9bb3c2f42321e4b1f9747c5e8820402",
    "AR-u5-carnot-efficiency-06": "0129debdb37399ce6f4f709665a527bceddbabb09364776c8f5fd9332b3198af",
    "AR-u5-carnot-efficiency-07": "6c8354a26ccf4f0a51d8999e29acd0dac8ca90b121eb96137672a8376a8610ce",
    "AR-u5-carnot-efficiency-08": "ca5a62e8c7bf8a9285f999fcc7534d49ae35a9af69ffd87f079b595e9799084b",
    "AR-u5-carnot-efficiency-09": "4d03326597b132e0dd7fcd081f0b42fe3b6623d2a68d5c20336631110ba8838b",
    "AR-u5-carnot-efficiency-10": "8f60d759b147d15b4518f7125ace40272550acd3beda14c63fbc10152ba807f1",
    "AR-u5-carnot-efficiency-11": "22f7398e0e72f337225eb1d3cffe44e9fd367bde43a2fef598bca4bdd5fa58da",
    "AR-u5-carnot-efficiency-12": "26ea74872ce3b7cdf4198fea128c1098d6ffd4923c864bc44883c70225d3ef1e",
    "AR-u5-carnot-efficiency-13": "afcb12d2a9bb56fff4977007e283445db446e72165c326ebc7c518d81679f57e",
    "AR-u5-carnot-efficiency-14": "751eb99b108e8a74f6e660200970299448f973a07f0dff8093f754ee4a4c4968",
    "AR-u5-carnot-efficiency-15": "dc3c357e47b2d858c41b7b31e5cf13eb386bfc79e15ecaf6f0f3e9eb6ec95764",
    "AR-u5-carnot-efficiency-16": "5291548fd7dad3dcbd7c4cb9a4a50618c243654370f6613d8c9a9f5a917e7e2b"
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

def carnot_efficiency(hot,cold):
    hot,cold=map(Fraction,(hot,cold))
    if not hot>cold>0:raise ValueError("Ordered positive absolute temperatures hot>cold>0 required")
    ratio=(SI.Quantity(cold,'kelvin')/SI.Quantity(hot,'kelvin')).to('dimensionless')
    return 1-Fraction(ratio.magnitude)
def hot_from_eta(cold,eta):
    cold,eta=map(Fraction,(cold,eta))
    if cold<=0 or not 0<eta<1:raise ValueError("Carnot inverse requires cold>0 and 0<eta<1")
    return cold/(1-eta)
def cold_from_eta(hot,eta):
    hot,eta=map(Fraction,(hot,eta))
    if hot<=0 or not 0<eta<1:raise ValueError("Carnot inverse requires hot>0 and 0<eta<1")
    return hot*(1-eta)
def carnot_scaled(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if min(a,b)<=0:raise ValueError("Positive scaling factors required")
    return carnot_efficiency(a*hot,b*cold)/carnot_efficiency(hot,cold)
def redundant_temperature(factor,eta):
    factor,eta=map(Fraction,(factor,eta))
    if factor<=1 or not 0<eta<1:raise ValueError("Strict motor temperature domain required")
    if eta!=1-1/factor:raise ValueError("Inconsistent temperature ratio and Carnot efficiency")
    return 'infinite'
@lru_cache(maxsize=1)
def oracle():
    th,tc,h,c,w,e,a,b=sp.symbols('th tc h c w e a b',positive=True)
    rejected=sp.solve(sp.Eq(c/tc,h/th),c)[0]
    work=sp.solve(sp.Eq(0,h-rejected-w),w)[0]
    eta=sp.cancel(work/h)
    assert sp.simplify(eta-(1-tc/th))==0
    assert sp.simplify(sp.solve(sp.Eq(e,eta),th)[0]-tc/(1-e))==0
    assert sp.solve(sp.Eq(e,eta),tc)[0]==th*(1-e)
    assert sp.cancel(eta.subs({th:a*th,tc:b*tc})/eta-(a*th-b*tc)/(a*(th-tc)))==0
    first=sp.Rational(carnot_efficiency(400,200));second=sp.Rational(carnot_efficiency(900,300))
    gain,offset,decoded,affine=calibrate(first,second,sp.Rational(3,2),2,2,sp.Rational(7,3),sp.Rational(5,3),'dimensionless')
    assert (first,second,gain,offset,decoded,affine)==(sp.Rational(1,2),sp.Rational(2,3),3,1,sp.Rational(2,3),sp.Rational(1,3))
    assert (first+second)/2==sp.Rational(7,12) and carnot_efficiency(650,250)==Fraction(8,13)
    assert (first+second)/2!=carnot_efficiency(650,250)
    assert redundant_temperature(2,first)=='infinite'
    return [first,'1 (adimensionale)','Hanno lo stesso rendimento 1 − T_c/T_h','Da 1/2 a 2/3',hot_from_eta(200,first),cold_from_eta(400,first),sp.Rational(carnot_efficiency(400,300))/first,1-first,
      'T_h = T_c / (1 − η)','(κ₁ T_h − κ₂ T_c) / [κ₁ (T_h − T_c)]',second/first,(first+second)/2,sp.Rational(cold_from_eta(900,sp.Rational(4,3)*first))/200,hot_from_eta(300,decoded),hot_from_eta(600,affine),'Infinite: ogni T_c>0, con T_h=2T_c']

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    first=carnot_efficiency(400,200);second=carnot_efficiency(900,300)
    expected={(140,160,85,Fraction(400,2)),(350,260,85,Fraction(200,2)),
      (100,675,300,45),(100,755,150,45),(250,755,150,45),
      (140,1125,360*first,35),(140,1195,360*second,35)}
    if not expected<=rects:raise ValueError('Independent physical scale of absolute temperatures or Carnot efficiencies changed')
    if 160+Fraction(400,2)!=360 or 260+Fraction(200,2)!=360:raise ValueError('Independent physical scale requires common absolute-zero baseline')
    return 'Full XML and full-height Chrome rendering independently read. Temperature columns share baseline y 360 at 0 K and 0.5 px/K: 200 px for 400 K,100 px for 200 K. A separate explicitly additional energy realization uses 100 J input and 50 J each as rejected heat and work, at 3 px/J; these energies are not deduced from temperatures alone. At 360 px per unit, common-origin efficiency bars 180 and 240 px encode 1/2 and 2/3 for AFraction(400,2)00 K and reparameterized B 900/300 K. Their ratio 4/3 is not an efficiency greater than one.'

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
