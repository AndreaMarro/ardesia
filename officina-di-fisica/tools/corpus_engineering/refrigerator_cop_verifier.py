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
FAMILY='refrigerator-cop'
BATCH='refrigerator-cop-162'
ASSET_NAME='refrigerator-cop-progressive.svg'
CANDIDATE_REF='4f06f0667faec8d74d76463cbfd8591f70e612af'
REVIEWED_PACKAGE_SHA256='1f87e8c51cdeb97e5cbd4104325c4a2ab2c68a9fb89e3cfa3b7460104ff29405'
REVIEWED_BINDINGS_SHA256='d360c0ad8b6f866aafc128e1fa73c9d7c0a3c54381b26ff3d072048320293402'
PRIMARY_SHA256='097f117b5082b44e84ae4171e538079a7aef07f6998a50da3ffbf328ba678009'
SOURCE_REFERENCE='Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.'
FALSE_PROOF='Il COP non può superare uno perché Q_c è ottenuto trasformando soltanto il lavoro in energia nuova.'
SVG_MUTATION=(b'width="120"', b'width="100"')
EXPECTED_MAPPING={1: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 2: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 3: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 4: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 5: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 6: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 7: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 8: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 9: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 10: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 11: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 12: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 13: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 14: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 15: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09']), 16: ('C3-L09', ['C3-L06', 'C3-L08', 'C3-L09'])}
NUMERIC_UNITS={1: '1', 5: 'J', 6: 'J', 14: 'J'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: '', 13: '', 15: ' J'}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'joule', 6: 'joule', 7: 'dimensionless', 8: 'dimensionless', 9: 'joule', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'joule', 15: 'joule', 16: 'dimensionless'}
MANUAL=['COP=Q_c/W_in=100/20=5, numero puro. Il bilancio ciclico impone Q_h=Q_c+W_in=120 J. COP>1 non è efficienza di conversione e non viola il primo principio.', 'Rapporto J/J=1. COP è numero puro, diverso daη del motore. Il lavoro entrante non è potenza elettrica senza durata.', 'Definizione frigorifera COP=Q_c/W_in, con lavoro ricevuto positivo. Il lavoro compiuto dal dispositivo sarebbe−W_in. Q_h/W_in è invece COP della pompa di calore, pari a COP frigorifero+1 se il ciclo ha soli questi trasferimenti.', 'Q_c 100→200 J a W 20 J fissa: COP 5→10. Senza sorgenti assegnate non si deve imporre un limite numerico di Carnot non dato; per dati termici successivi bisognerebbe verificarlo.', 'Q_c=COP·W_in=5·20=100 J, positivo.', 'W_in=Q_c/COP=100/5=20 J; non COP/Q_c che ha unità energia inversa.', 'A 5; B 100/40=5/2; rapporto(5/2)/5=1/2.', 'Proposta 10, corretto 5⇒scarto+5, numero puro.', 'Q_c=COP·W_in, con entrambe le grandezze positive; unità J. Non confondere calore freddo con Q_h=(COP+1)W_in.', 'COP_B/COP_A=(κ₁Q_c/(κ₂W_in))/(Q_c/W_in)=κ₁/κ₂. Riscalamentoenergeticocomune lascia COP invariato.', 'Originale A 5; BQ_c 1 J,W 1 J⇒COP 1; rapporto 1/5.', 'Media(5+1)/2=3. Agli ingressi medi Q_c 101/2 J,W 21/2 J si ottiene 101/21, diverso. Il COP aggregato peserebbe i lavori, non ugualmente le prove.', 'Bersaglio COP_B=(1/5)5=1. A Q_c,B 1 J⇒W_B 1 J. Rapporto W_B/W_A=1/20.', 'q 15/5=3. Nuova COP 3/3=1; W 1 J⇒Q_c 1 J.', 'q=(11−3)/(5−1)=2,b 1. C COP=(21−1)/2=10; W 20 J⇒Q_c 200 J. Non usare S 21 come COP.', 'Q_c=5 W_in⇒COP 5 indipendente dalla scala positiva di W. Infinite coppie con W>0; nessuna unicità né vincolo di interezza dei joule.']
DISTRACTORS=['1/5 è il reciproco,6 è COP della pompa di calore.80 J sottrae lavoro invece di sommarlo al bilancio caldo; COP non è un’energia creata.', 'J energia,W potenza,J/K capacità,K temperatura: nessuna nel rapporto. Essere puro non impone COP≤1.', 'W/Q_c reciproco,Q_h/W pompa di calore,1−Q_c/Q_h forma da motore con altri ruoli,Q_c+W energia in J non coefficiente.', '5/2 inverte la dipendenza da Q_c,5 ignora B,11 usa Q_h/W e 1/10 capovolge COP_B. Il limite reversibile quantitativo richiederebbe temperature non assegnate.', '4 J divide per COP,120 J è il calore caldo,20 J copia il lavoro.80 J non è il calore freddo richiesto.', '500 J moltiplica invece di dividere.−20 J sarebbe lavoro compiuto negativo,non ingresso positivo.100 J copia Q_c.', '2 segue il lavoro direttamente,1 ignora il costo maggiore,1/4 e 4 quadrano una dipendenza lineare inversa.', '−5 inverte lo scarto,10 copia la proposta,0 l’accetta,2 confronta un rapporto anziché una differenza.', 'W/COP non ricostruisce Q_c/W; COP/W ha J⁻¹. Sommare o sottrarre un coefficiente puro a J è dimensionalmente errato.', 'Prodotto fa crescere COP con il costo; quoziente inverso scambia le prove; quadrato e somma non derivano dal rapporto dei trasferimenti.', '5 reciproco; 1/100 rapporto dei calori; 1/20 rapporto dei lavori; 1 copia COP_B senza confrontarlo con COP_A.', '101/21 è prestazione aggregata pesata per il lavoro,non media statistica.6 somma,4 sottrae,5 ignora B; 101≠63 distingue le operazioni.', '20 reciproco; 1/5 bersaglio sui COP; 1/100 confronto dei calori.1 è il numero del lavoro B in J,non il rapporto con 20 J.', '3 J omette q; 2 J è Q_h,B; 1/3 J divide ancora dopo la decodifica. Il calore utile resta distinto dal display.', '100 J dà S 11; 20 J dà COP 1 e S 3; 210 J omette b e ricostruisce S 22; 400 J applica un raddoppio aggiuntivo non dato.', '20 J è un riferimento,non univocità.5 J scambia coefficiente e lavoro. Zero rende COP 0/0 e non rispetta i moduli positivi; infinite coppie sono ammesse.']
ASSUMPTIONS=['Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.', 'Frigorifero chiuso ciclico: calore freddo Q_c>0 e lavoro ricevuto W_in>0 sono energie per ciclo, mentre Q_h=Q_c+W_in è ceduto. COPfrigorifero non è rendimento di un motore né coefficiente di pompa di calore; le temperature non assegnate non impongono un limite numerico arbitrario.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-refrigerator-cop-01": "a1a8d7d83081bd3b5665eadd68d664719c943e39c2c7bc1e607a6b183068d1e4",
    "AR-u5-refrigerator-cop-02": "951b7e41a4c366a90f2cdec476b20caec4b66c4558ba6a92c6ca6c9e23008d87",
    "AR-u5-refrigerator-cop-03": "927f014d65add534560fc7eaa9a781216c368ec8cb6f0f043aa42683d1f92810",
    "AR-u5-refrigerator-cop-04": "b51827689fa9864d681d90b66019e441a4c10aed8b9c96933bd3c6de1c86f72d",
    "AR-u5-refrigerator-cop-05": "ebbc519c2d393cd26baeb003a47383bed115cd5ae8082a8817d1fa4947275972",
    "AR-u5-refrigerator-cop-06": "013fe3f8770d5904666dea823b27cfd51252f6106bb838773a548987d1c6cfaa",
    "AR-u5-refrigerator-cop-07": "a9a50712879a6458c7c767803e613a93655780137d6a9f47980b4d4b7486941d",
    "AR-u5-refrigerator-cop-08": "2d987aeb847da6db3fb0b49c3106c84db3c0c726834e84025d7ee0ceafa3a992",
    "AR-u5-refrigerator-cop-09": "ed07c9f442cb2da0b3b011806921be77225df8c00c97493ea05394d093a10ee5",
    "AR-u5-refrigerator-cop-10": "fe169ded0ae2ca91db18a4dabd3700f6ecbe8392112ae85c0e0992f86ed0d5f3",
    "AR-u5-refrigerator-cop-11": "b9f6c3870708bcdb54df3e02112dbe0f234e317fb65637b772df59c281d9a5fa",
    "AR-u5-refrigerator-cop-12": "cc0780bdf2aef98f984cb1c9a1ad75ea26cfddbcc2cc277c40578d675f9add52",
    "AR-u5-refrigerator-cop-13": "6b2769f91a10047c2e50450a8ceb22cf63c15a510e001d1a44ebebaa17aa3fcd",
    "AR-u5-refrigerator-cop-14": "c0446db851651293919d4519825e8dcdefe3c9beddaee55359435fc5937e9166",
    "AR-u5-refrigerator-cop-15": "1f16adcb1f6ec019813a939c62f33d7191f234530eb399ea204f872cc30eb1db",
    "AR-u5-refrigerator-cop-16": "6ca5908aac39bf0b9436b9662e97b1d0c164aedc1ad53b38b831167f06e35c4d"
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

def refrigerator_cop(cold,work):
    cold,work=map(Fraction,(cold,work))
    if min(cold,work)<=0:raise ValueError("Positive cold heat and incoming work required")
    return Fraction((SI.Quantity(cold,'J')/SI.Quantity(work,'J')).to('dimensionless').magnitude)
def cold_from_cop(cop,work):
    cop,work=map(Fraction,(cop,work))
    if min(cop,work)<=0:raise ValueError("Positive COP and incoming work required")
    return cop*work
def work_from_cop(cold,cop):
    cold,cop=map(Fraction,(cold,cop))
    if min(cold,cop)<=0:raise ValueError("Positive cold heat and COP required")
    return cold/cop
def cop_scaled(cold,work,a,b):
    cold,work,a,b=map(Fraction,(cold,work,a,b))
    if min(a,b)<=0:raise ValueError("Positive scaling factors required")
    return refrigerator_cop(a*cold,b*work)/refrigerator_cop(cold,work)
def redundant_cop(factor,cop):
    factor,cop=map(Fraction,(factor,cop))
    if min(factor,cop)<=0:raise ValueError("Positive heat-work ratio and COP required")
    if factor!=cop:raise ValueError("Inconsistent cold-heat constraint and COP")
    return 'infinite'
@lru_cache(maxsize=1)
def oracle():
    c,w,z,h,a,b=sp.symbols('c w z h a b',positive=True)
    hot=sp.solve(sp.Eq(0,c+w-h),h)[0];assert hot==c+w
    model=c/w
    assert sp.solve(sp.Eq(z,model),c)[0]==w*z
    assert sp.solve(sp.Eq(z,model),w)[0]==c/z
    assert sp.cancel(model.subs({c:a*c,w:b*w})/model-a/b)==0
    assert sp.simplify(hot/w-model-1)==0
    first=sp.Rational(refrigerator_cop(100,20));second=sp.Rational(refrigerator_cop(1,1))
    gain,offset,decoded,affine=calibrate(first,second,15,3,11,3,21,'dimensionless')
    assert (gain,offset,decoded,affine)==(3,1,1,10)
    assert (first+second)/2==3 and refrigerator_cop(Fraction(101,2),Fraction(21,2))==Fraction(101,21)
    assert redundant_cop(5,5)=='infinite'
    return [first,'1 (adimensionale)','COP = Q_c / W','Da 5 a 10',cold_from_cop(5,20),work_from_cop(100,5),sp.Rational(refrigerator_cop(100,40))/first,10-first,
      'Q_c = COP · W','κ₁ / κ₂',second/first,(first+second)/2,sp.Rational(work_from_cop(1,first/5))/20,cold_from_cop(decoded,1),cold_from_cop(affine,20),'Infiniti: ogni W>0, con Q_c=5W']

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    first=refrigerator_cop(100,20);second=refrigerator_cop(1,1)
    expected={(100,695,300,45),(400,695,60,45),(100,815,360,45),
      (140,1135,40*first,35),(140,1205,40*second,35),(140,1275,40*(first+second)/2,35)}
    if not expected<=rects:raise ValueError('Independent physical scale of refrigerator energy balance or COP mean changed')
    arrows={e.get('d') for e in root.iter() if e.tag.endswith('path') and e.get('marker-end')}
    if arrows!={'M200 195H225V245H240','M420 245H430V195H440','M330 430V345'}:raise ValueError('Independent physical scale or direction of refrigerator transfers changed')
    return 'Full XML and full-height Chrome rendering independently read. Two incoming schematic arrows distinguish cold heat 100 J and work 20 J from outgoing hot heat 120 J. At 3 px/J the adjacent 300 and 60 px input segments equal 360 px output; the work annotation is connected without crossing its text. At 40 px per COP unit, bars 200,40,120 px represent 5,1,3 from common x 140. COP of a heat pump 6 is explicitly different and no efficiency bound COP<=1 is imposed.'

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
