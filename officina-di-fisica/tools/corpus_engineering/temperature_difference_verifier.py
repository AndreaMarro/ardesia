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
FAMILY='temperature-difference'
BATCH='temperature-difference-148'
ASSET_NAME='temperature-difference-progressive.svg'
CANDIDATE_REF='ea13406a87b5c1eea4fe723f532b27fabab740f7'
REVIEWED_PACKAGE_SHA256='b372e78cec78a13ff23fd3859fc7f2ee6bae2993205e0b230a61ed29eea2d0d9'
REVIEWED_BINDINGS_SHA256='9fae280a309c8d39194c8fb783bfe18ea8f0b47f43b87a059e86274e9f087c05'
PRIMARY_SHA256='1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d'
SOURCE_REFERENCE='Convert each Celsius point to kelvin before ratios; equal offsets cancel only in differences. Candidate 10 explicitly scales absolute temperatures, candidate 13 uses a new exact conversion-friendly absolute ratio. Retain readings-only constraint 16.'
FALSE_PROOF='Ogni intervallo termico richiede aggiungere 273,15:20 K diventano 293,15 K.'
SVG_MUTATION=(b'width="290"', b'width="300"')
EXPECTED_MAPPING={1: ('C3-L01', ['C1-L001', 'C3-L01']), 2: ('C3-L01', ['C1-L001', 'C3-L01']), 3: ('C3-L01', ['C1-L001', 'C3-L01']), 4: ('C3-L01', ['C1-L001', 'C3-L01']), 5: ('C3-L01', ['C1-L001', 'C3-L01']), 6: ('C3-L01', ['C1-L001', 'C3-L01']), 7: ('C3-L01', ['C1-L001', 'C3-L01']), 8: ('C3-L01', ['C1-L001', 'C3-L01']), 9: ('C3-L01', ['C1-L001', 'C3-L01']), 10: ('C3-L01', ['C1-L001', 'C3-L01']), 11: ('C3-L01', ['C1-L001', 'C3-L01']), 12: ('C3-L01', ['C1-L001', 'C3-L01']), 13: ('C3-L01', ['C1-L001', 'C3-L01']), 14: ('C3-L01', ['C1-L001', 'C3-L01']), 15: ('C3-L01', ['C1-L001', 'C3-L01']), 16: ('C3-L01', ['C1-L001', 'C3-L01'])}
NUMERIC_UNITS={1: 'K', 5: '°C', 6: '°C', 14: '°C', 16: '°C'}
OPTION_SUFFIX={7: '', 8: ' K', 11: '', 12: ' K', 13: '', 15: ' °C'}
UNITS={1: 'kelvin', 2: 'kelvin', 3: 'kelvin', 4: 'kelvin', 5: 'kelvin', 6: 'kelvin', 7: 'dimensionless', 8: 'kelvin', 9: 'kelvin', 10: 'dimensionless', 11: 'dimensionless', 12: 'kelvin', 13: 'dimensionless', 14: 'kelvin', 15: 'kelvin', 16: 'kelvin'}
MANUAL=['(40+273,15)−(20+273,15)=20 K.', 'l’intervallo ha dimensione di temperatura; K è unità SI. Verificare le alternative finali senza confondere una capacità termica.', 'il passaggio 20→40 °C dà +20 K; 313,15/293,15=6263/5863 non è due. La lettura Celsius raddoppia, la temperatura assoluta no.', '60−20=40 K, contro 20 K iniziali: aumento di 20 K e fattore due.', 't_c=20+20=40 °C; somma di punto e intervallo con unità affine coerente.', 't_f=40−20=20 °C.', 'ΔT_A=20 K, ΔT_B=30 K; rapporto 3/2.', 'proposta meno corretta=40−20=20 K.', 't_c numerico Celsius=t_f numerico Celsius+ΔT numerico kelvin. È una relazione fra letture esplicitate; fisicamente punto più intervallo.', 'Il candidato dichiara qui temperature assolute in K: la sostituzione nelle due differenze dà (κ₁T_c−κ₂T_f)/(T_c−T_f), con T_c>T_f>0 e κ₁T_c>κ₂T_f. La formula non assegna gli stessi fattori alle letture Celsius. È un cambiamento di scala dichiarato rispetto al sorgente, ricalcolato separatamente.', 'ΔT_B=60−10=50 K; rapporto 50/20=5/2.', 'media (20+50)/2=35 K; coincide qui con differenza delle letture medie (50−15) per linearità.', 'Parametrizzazione candidata dichiarata:46,85/26,85 °C danno 320/300 K e intervallo 20 K. Il nuovo caldo 66,85 °C è340 K; il bersaglio 50 K impone freddo 290 K=16,85 °C. Il rapporto richiesto fra temperature assolute è290/300=29/30. La frazione delle letture Celsius sarebbe 337/537, diversa. Conversioni esatte, nessun arrotondamento.', 'q=60/(20 K)=3 K⁻¹; S=150 dà ΔT=50 K; con t_f=10 °C si ricava t_c=60 °C.', 'q=(101−41)/(50−20)=2 K⁻¹; b=1. S=81 implica ΔT=40 K; t_c=60 °C.', 'vincolo fra letture t_c=2 t_f, differenza 20 K: t_f=20 °C e t_c=40 °C. Non è T_c, K=2 T_f, K.']
DISTRACTORS=['293,15 K è il punto freddo assoluto;60 somma le letture e−20 rovescia la differenza.', 'J è energia, W potenza, Pa pressione e K⁻¹ inversa della temperatura; soltanto K misura l’intervallo.', 'Il rapporto dei numeri Celsius è2 ma quello dei kelvin è6263/5863;293,15 e 273,15 sono punto e offset, non aumenti.', '30 moltiplica il vecchio intervallo per il fattore del solo caldo;60 copia il caldo e 10 inverte l’effetto.', '0 sottrae l’intervallo al freddo;20 copia il dato freddo.313,15 appartiene ai kelvin e non a una lettura °C.', '60 °C supererebbe il corpo chiamato caldo;40 ignora l’intervallo. Il dominio positivo delle letture è una scelta del quesito.', '1/2 segue soltanto la lettura fredda,2/3 inverte gli intervalli e 2 ignora la sottrazione finale.', '−20 cambia l’ordine,40 copia la proposta,60 somma e 0 accetta la sovrastima.', 'Sottrarre d a t_f rende il caldo inferiore al freddo; d−t_f può essere negativo. Prodotto e quoziente non isolano un addendo.', 'κ₁−κ₂ dà zero per prove identiche; prodotto e quoziente perdono i pesi. Il rapporto delle somme non è quello delle differenze.', '2/5 è il reciproco,3/2 e 1/2 seguono singole letture e 5 perde il riferimento 20 K.', '70 è la somma,15 la semidifferenza e 20/50 copiano una prova; non sono temperature di equilibrio calorimetrico.', '16,85/26,85=337/537 è rapporto Celsius;30/29 è reciproco assoluto;5/2 è bersaglio degli intervalli e 3/2 non ricostruisce i dati.', '160 aggiunge il display grezzo;50 copia l’intervallo e 10 il freddo. Il guadagno va rimosso prima dell’inversa.', '40 è il numero dell’intervallo,80 è S−b non diviso per q,61 introduce l’offset strumentale nella lettura termometrica e 20 ignora l’aumento.', '10 tratta il vincolo come se mancasse il termine sottratto;40 è caldo e 0 viola il dato 20 K. Il raddoppio riguarda numeri Celsius, non kelvin.']
ASSUMPTIONS=['Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Caso 10 separato: si scalano temperature assolute in K, con ordine positivo iniziale e finale. Non si trasferiscono gli stessi fattori alle letture Celsius.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Caso 13 riparametrizzato e dichiarato: letture Celsius 46,85/26,85 e nuovo caldo 66,85; si cerca rapporto fra kelvin, non fra letture. Conversioni esatte allo zero 273,15.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.', 'Le letture Celsius sono numeri con t_c>t_f>0, convertiti come punti affini; gli intervalli hanno offset cancellato. La positività Celsius è il dominio scelto, non una legge universale. Display continuo e adimensionale, guadagni positivi costanti.']
PEDAGOGY=['La legge è motivata prima della sostituzione e il risultato resta legato alla grandezza chiesta, con unità esplicite.', 'È distinta la dimensione della grandezza dalla scala del prefisso e da grandezze fisiche di nome vicino.', 'Il caso concettuale o la legge richiesta sono spiegati con le loro ipotesi, senza una scorciatoia dal numero della chiave.', 'Il confronto controllato tiene fermi gli altri ingressi e non assegna al risultato automaticamente il fattore del solo ingresso.', 'L’inversa è svolta prima con i simboli e controllata per sostituzione e positività.', 'L’incognita o il caso separato sono riconosciuti prima di applicare la legge; sono esplicitati unità e dominio.', 'Le due risposte vengono valutate prima del rapporto e i singoli fattori non sono confusi con il risultato totale.', 'Il caso specifico è distinto dalla sola procedura numerica comune; lo scarto o la diversa legge sono motivati.', 'L’inversa simbolica include la condizione che rende lecita la divisione e mantiene le unità delle quantità.', 'I fattori sono sostituiti nei rispettivi ingressi prima del rapporto e le ipotesi di confronto sono esplicite.', 'Entrambi gli ingressi modificati sono valutati nello stesso modello prima di ridurre il rapporto.', 'La media statistica è distinta da un processo fisico; è spiegato quando il modello conserva o non conserva le medie.', 'Il bersaglio è ricostruito prima dell’inversa e il rapporto richiesto è distinto dal valore finale dell’ingresso.', 'La taratura del display continuo è separata dall’inversa della legge fisica.', 'Guadagno e offset sono ricavati da due riferimenti distinti e rimossi prima di ricostruire la grandezza fisica.', 'Il vincolo o il ciclo separato sono sostituiti nella legge prima di discutere unicità, dominio e grandezza richiesta.']
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_CANDIDATES={
    "AR-u5-temperature-difference-01": "032ef3f6c46800af64e790821761fcbdc27febb1331e3ab9fc255f335c9f899d",
    "AR-u5-temperature-difference-02": "0cc73d53e7e14fd9fadf3cc378f53f578612a830f0d8a23567deeacb318460bb",
    "AR-u5-temperature-difference-03": "fada17afbb5b3929aed7172de293247a655d5e4c600257f2a1f0b5c398ab87de",
    "AR-u5-temperature-difference-04": "d9bade3cf301b8721cd5950325467bc4388bdb4f3f9d96327773afe4032980a9",
    "AR-u5-temperature-difference-05": "cbe262982736ce9ceb0fb52bb8619c74deb66760b5f9c848dc7c5a5a00eb920a",
    "AR-u5-temperature-difference-06": "77b34a95a0f3eff8c1611b8eddebede1068188c9da6fbdb5678b1bed3a4ebcff",
    "AR-u5-temperature-difference-07": "18077e57d8e965fbeb51dee7859e3f675e469002f7cebe121bf2088024c3ab6f",
    "AR-u5-temperature-difference-08": "2d6b6579ef97400898827a6421457ecf27511b20cb431b5a1741ae0b4a235bce",
    "AR-u5-temperature-difference-09": "18c4ff854a885bced1a6450e9df28459ec0d7404916805ab047f359f2e87ca9e",
    "AR-u5-temperature-difference-10": "beea8157db42e3740471ad0a4c4852eba014a6854596cb5f006cfe9ab4fe6dee",
    "AR-u5-temperature-difference-11": "1bbf2927e90d9d4ed2a2b59b0e8339fc0fc87c9767fce468a75dee065280ffb1",
    "AR-u5-temperature-difference-12": "daf66fa2c36d94d199b1fd84825e18c76c54ef7938e0934e6835cb8455af9c6b",
    "AR-u5-temperature-difference-13": "a0bb40bb8e7f3af8980e750909a6e65bf98a4913cdf67491277d9d8fea6ea482",
    "AR-u5-temperature-difference-14": "354edbcdccae41e652f63d9bd9cce132f456ee3014777edafebb1c7f91974999",
    "AR-u5-temperature-difference-15": "741a1c139366413b84d28ef5133f2a7c6149f095f0f9b5ce53239cd7898846ed",
    "AR-u5-temperature-difference-16": "7bfee3aff7847b1c6f65b929ffacaf3a7c89ee6a46e3aa4636f425140cc5fc80"
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

def celsius_absolute(reading):
    reading=Fraction(reading)
    if reading<=-Fraction(5463,20):raise ValueError("Temperature must exceed absolute zero")
    return Fraction(SI.Quantity(reading,"degC").to("kelvin").magnitude)

def interval(hot,cold):
    hot,cold=map(Fraction,(hot,cold))
    if not hot>cold>0:raise ValueError("Reviewed numerical Celsius readings require hot>cold>0")
    return celsius_absolute(hot)-celsius_absolute(cold)

def absolute_scaled_ratio(hot,cold,a,b):
    hot,cold,a,b=map(Fraction,(hot,cold,a,b))
    if not hot>cold>0 or min(a,b)<=0 or a*hot<=b*cold:raise ValueError("Positive ordered absolute temperatures required in both trials")
    return (a*hot-b*cold)/(hot-cold)

@lru_cache(maxsize=1)
def oracle():
    x,z,d,o,a,b=sp.symbols("x z d o a b",real=True)
    assert sp.expand((x+o)-(z+o))==x-z
    inverse=sp.solve(sp.Eq(d,x-z),x)[0];assert inverse==d+z
    ratio=((a*x-b*z)/(x-z));assert sp.simplify(ratio.subs({a:1,b:1})-1)==0
    first=sp.Rational(interval(40,20));second=sp.Rational(interval(60,10))
    assert first==20 and celsius_absolute(40)==sp.Rational(6263,20) and celsius_absolute(20)==sp.Rational(5863,20)
    assert celsius_absolute(40)!=2*celsius_absolute(20)
    assert (first+second)/2==interval(50,15)
    gain,offset,decoded,affine=calibrate(first,second,60,150,41,101,81,"kelvin")
    assert (gain,offset,decoded,affine)==(3,1,50,40)
    initial_hot=sp.Rational(celsius_absolute(Fraction(937,20)))
    initial_cold=sp.Rational(celsius_absolute(Fraction(537,20)))
    next_hot=sp.Rational(celsius_absolute(Fraction(1337,20)))
    target=sp.Rational(5,2)*(initial_hot-initial_cold)
    next_cold=next_hot-target
    assert (initial_hot,initial_cold,next_hot,target,next_cold)==(320,300,340,50,290)
    constrained=sp.solve(sp.Eq(20,2*z-z),z)[0]
    return [first,"K","L’aumento è 20 K; la temperatura assoluta non raddoppia","Da 20 a 40 K",inverse.subs({d:20,z:20}),40-20,sp.Rational(interval(40,10))/first,40-first,
      "t_c = t_f + d","(κ₁ T_c − κ₂ T_f) / (T_c − T_f)",second/first,(first+second)/2,next_cold/initial_cold,decoded+10,affine+20,constrained]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,"0")) for k in ("x","y","width","height")) for e in root.iter() if e.tag.endswith("rect")}
    baseline=celsius_absolute(Fraction(537,20));target=oracle()[12]*baseline
    if not {(100,1205,baseline,38),(100,1340,target,38)}<=rects:raise ValueError("Independent physical scale of absolute-temperature bars changed")
    paths={e.get("d") for e in root.iter() if e.tag.endswith("path")}
    if not {"M130 500V200M390 500V200","M140 400H380M140 300H380","M250 400V300M240 400H260M240 300H260"}<=paths:raise ValueError("Independent physical scale of offset temperature axes changed")
    return "Full XML and full-height Chrome image independently read. At 5 px per interval, 0/20/40/60 Celsius ticks are y500/400/300/200 and correspond to 273.15/293.15/313.15/333.15 K; the absolute zero is explicitly outside that panel. The 100 px bracket is 20 K. In the distinct task13 panel, bars start at common x100 and lengths 300 and 290 px represent actual 300 and 290 K at 1 px/K, ratio 29/30. No source/candidate SVG edited."

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
