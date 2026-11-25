"""Independent source-first electric review; no candidate authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
FAMILY='charge-accelerating-voltage'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L03'for n in range(1,17)}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]




def speed(voltage,mass):
    voltage,mass=map(sp.sympify,(voltage,mass))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (voltage,mass)):raise ValueError('Finite positive voltage and mass required')
    result=sp.sqrt(2*voltage/mass) # q fixed at 1 microcoulomb; kV and g
    if result>=299792458:raise ValueError('Superluminal result outside nonrelativistic model')
    return result

def inverse_voltage(velocity,mass):
    velocity,mass=map(sp.sympify,(velocity,mass))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (velocity,mass)) or velocity>=299792458:raise ValueError('Finite positive subluminal speed and mass required; nonrelativistic hypothesis remains necessary')
    return sp.cancel(mass*velocity**2/2)

@lru_cache(maxsize=1)
def oracle():
    q,U,m,v,k1,k2=sp.symbols('q U m v k1 k2',positive=True)
    law=sp.sqrt(2*q*U/m);energy=sp.Eq(m*v**2/2,q*U)
    unique([law,2*q*U/m,sp.sqrt(q*U/m),sp.sqrt(2*m/(q*U)),q*U/m],law)
    inverse=sp.solve(energy,U)[0];unique([m*v**2/(2*q),2*q/(m*v**2),m*v/(2*q),q*v**2/(2*m),m*v**2/q],inverse)
    ratio=sp.simplify(law.subs({U:k1*U,m:k2*m})/law)
    unique([sp.sqrt(k1/k2),k1/k2,sp.sqrt(k2/k1),k1*k2,k1/sp.sqrt(k2)],ratio)
    aa,bb=speed(2,1),speed(9,2);assert (aa,bb)==(2,3)
    gain,offset=calibrate(aa,bb,5,7);assert(gain,offset)==(2,1)
    assert speed(sp.Rational(11,2),sp.Rational(3,2))==sp.sqrt(sp.Rational(22,3))
    assert sp.Rational(22,3)-sp.Rational(25,4)==sp.Rational(13,12)
    assert inverse_voltage(3,2)==9 and inverse_voltage((9-offset)/gain,1)==8
    # U=alpha*m only between preparations; alpha=2 kV/g, not a varying mass in a closed trial.
    scale=sp.symbols('scale',positive=True);assert speed(2*scale,scale)==2
    Q=SI.Quantity;assert (Q(1,'microcoulomb')*Q(2,'kilovolt')).to('millijoule').magnitude==2
    assert (Q(1,'gram')*Q(2,'meter/second')**2/2).to('millijoule').magnitude==2
    assert (Q(1,'microcoulomb')/Q(1,'coulomb')).to('').magnitude==Fraction(1,10**6)
    return [aa,'m/s','v = √(2 q U / m)','Da 2 a 4 m/s',inverse_voltage(2,1),sp.Rational(2)*2/2**2,speed(1,1)/aa,4-aa,'U = m v² / (2 q)','√(κ₁/κ₂)',bb/aa,(aa+bb)/2,sp.Rational(2),inverse_voltage(sp.Rational(9,3),2),inverse_voltage((9-offset)/gain,1),'Infinite coppie positive']

def decode_read_quantity(raw):
    if raw=='√(22/3)':return sp.sqrt(sp.Rational(22,3))
    return exact_literal(raw)

MANUAL=['qU=(1 μC)(2 kV)=2 mJ. Da fermo e con solo lavoro elettrico mv²/2=qU: v²=4 m²/s². La rapidità positiva è 2 m/s, distinta dalla componente orientata della velocità.', 'J/kg=m²/s² e la radice dà m/s. Dopo la primaria prompt-only ho letto tutte le cinque alternative: m/s è l’unica unità di rapidità; m/s² è accelerazione e joule è energia.', 'Il lavoro del campo è q(V_A−V_B)=qU>0. K_i=0 e nessun altro lavoro danno mv²/2=qU; moltiplico per 2/m>0 e prendo la radice positiva. La relazione presuppone velocità non relativistica.', 'A massa fissa quadruplicare U da 2 a 8 kV quadruplica v²: v passa da 2 a 4 m/s, non a 8. Entrambe le prove restano non relativistiche.', 'U=mv²/(2q). Con 1 g, 2 m/s e 1 μC il lavoro è 2 mJ e la caduta richiesta 2 kV. Il denominatore q è positivo.', 'm=2qU/v²=2(1 μC)(2 kV)/(4 m²/s²)=1 g. Massa positiva e v² non nullo; la carica non è una massa.', 'U dimezzata a 1 kV lascia v_B=√2 m/s. Rapporto con 2 m/s: √2/2. Mantengo il radicale esatto, senza decimali.', 'Proposta 4 m/s meno rapidità corretta 2 m/s=+2 m/s. Il rapporto puro 2 non è lo scarto richiesto.', 'Da mv²/2=qU divido per q>0: U=mv²/(2q). kg·m²/s²/C=J/C=V. Non invertire l’intero rapporto.', 'Nel rapporto v_B/v_A la carica fissa si cancella: il quadrato della rapidità cambia di κ₁/κ₂, quindi il modulo cambia di √(κ₁/κ₂). I fattori sono positivi e le due prove sono esplicitamente nel dominio non relativistico.', 'A ha v=2 m/s. B con U=9 kV e m=2 g ha v²=9 m²/s², quindi v=3 m/s. Rapporto 3/2.', 'Le uscite 2 e 3 m/s hanno media 5/2 m/s. Ai dati medi U=11/2 kV e m=3/2 g si ha v²=22/3, dunque √(22/3) m/s. I quadrati differiscono di 22/3−25/4=13/12: le due quantità positive non coincidono, senza approssimazioni.', 'Il bersaglio v_B/v_A=3/2 impone v_B=3 m/s e v_B²=9. Con U_B=9 kV segue m_B=2·9/9=2 g: m_B/m_A=2.', 'Display senza offset: A v=2 dà D=6, quindi a=3 s/m. C D=9 dà v_C=3 m/s; con massa 2 g l’inversa U=mv²/(2q) dà 9 kV.', 'A v=2 e B v=3 con D=5 e 7 danno a=2 s/m e b=1. D_C=9 restituisce v_C=(9−1)/2=4 m/s. Massa 1 g: U_C=8 kV.', 'Fra preparazioni U=αm con α=2 kV/g=2·10⁶ V/kg. Sostituzione: v²=2qα=4 m²/s², indipendente da m>0. Infinite coppie positive soddisfano la misura v=2 m/s, tutte nello stesso regime lento; non si varia la massa durante una prova.']

DISTRACTORS=['4 m/s confonde v² e v; 1 m/s darebbe K=1/2 mJ; 2 km/s tratterebbe 1 μC come 1 C: fattori 10⁶ in energia e 10³ in rapidità. Il fix01 finale è riletto contro la sostituzione diretta, non copiato dalla chiave.', 'm/s² è accelerazione; J energia; V potenziale; C carica. Solo m/s ha dimensione di rapidità.', '2qU/m è v²; omettere 2 dimezza v² e non v; invertire m/(qU) dà dimensione inversa di v². Il quoziente qU/m senza radice non è una rapidità.', '8 m/s rende lineare U; 1 m/s rende inversa la radice; 2 ignora il cambio; 16 applica un quadrato spurio.', 'Raddoppiare l’inversa o perdere il mezzo non ricostruisce qU=mv²/2. La tensione ha V, non J.', 'Invertire v² o scambiare carica e massa cambia dimensioni e bilancio. 1 kg perderebbe il fattore mille.', '1/2 usa direttamente il rapporto di U; 2 e √2 invertono; 1 ignora la variazione.', '−2 inverte lo scarto; 4 copia la proposta; zero accetta l’errore; 2 puro è rapporto e manca l’unità della differenza.', 'Gli altri rapporti non isolano U: omettere 2 raddoppia la caduta, invertire dà 1/V e usare v anziché v² altera dimensioni.', 'κ₁/κ₂ omette la radice; √(κ₂/κ₁) inverte; κ₁κ₂ rende diretta la massa; κ₁/√κ₂ perde la radice su U.', '2/3 reciproco; 9/2 è rapporto dei quadrati; 1/2 segue solo la massa e 1 ignora entrambi i cambiamenti.', '√(22/3) usa ingressi medi; 5 somma senza dividere; 1/2 è metà differenza; 3 copia B.', '1/2 inverte masse; 3/2 copia il bersaglio di rapidità, 9/4 ne copia il quadrato senza includere U_B.', 'D=9 non è una rapidità; usare il valore grezzo darebbe caduta molto maggiore. 9 kV si verifica con v3 e m2.', '81/8 kV omette l’offset e predice D10; 4/9/16 non producono v4 con massa1 g. La legge è quadratica in v.', 'Una singola coppia positiva è un esempio, non identifica la scala. Nessuna coppia è falso perché U2,m1 funziona. Non si tiene U fisso mentre si varia m ignorando il rapporto imposto.']

ASSUMPTIONS=['Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento.', 'Corpo ideale con carica positiva fissa +1 μC, partenza da fermo, caduta U=V_A−V_B>0 e nessun altro lavoro. Massa e tensione costanti entro prova, variabili fra preparazioni. Si chiede rapidità positiva; il modello mv²/2 richiede regime non relativistico. Tutti i dati finiti letti danno velocità di pochi m/s, non una pretesa validità per ogni rapporto arbitrariamente grande. Il guard sul limite c è solo necessario, non sufficiente a certificare regime lento. Il vincolo tra preparazioni rende la misura ridondante e lascia libera una scala positiva.']

UNITS={1: 'm/s', 2: 'm/s', 3: 'm/s', 4: 'm/s', 5: 'kilovolt', 6: 'gram', 7: '', 8: 'm/s', 9: 'V', 10: '', 11: '', 12: 'm/s', 13: '', 14: 'kilovolt', 15: 'kilovolt', 16: ''}

NUMERIC_UNITS={1: 'm/s', 5: 'kV', 6: 'g', 14: 'kV'}

SUFFIX={8: ' m/s', 12: ' m/s', 15: ' kV'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e PNG nativo completo effettivamente letti. Barre di lavoro e K finale sono entrambe 2 mJ e larghe200, non energie da sommare. Curva centrale M100830 Q300830500590: parametro x=100+400u,y=830−240u², v=4u e K=8u² mJ, quindi K=v²/2 alla massa fissa1 g. I punti(2,2) e(4,8) sono esatti; è grafico K(v), non traiettoria. Barre finali v2,3,5/2 hanno larghezze200,300,250 e origine130; prova B ha massa diversa dalla curva. Testi e zeri separati dagli assi.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u6-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C4' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=decode_read_quantity(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_read_quantity(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='48744edef2aa133813c6a23500422343a902a311'

PRIMARY_SHA256='3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='17d626552a2e5885c1172b653f271504378510054ff43cd2e461d392638b9b26'

REVIEWED_BINDINGS_SHA256='8bc2d2840d75ed99f5c9238a3855c755a6e1195e552cc7cb44c090a8b36a4f3b'

REVIEWED_CANDIDATES={'AR-u6-charge-accelerating-voltage-01': 'bef17c9f72613089e964532202a6f578d01ee9bf9309a80db1d3328ae151b598', 'AR-u6-charge-accelerating-voltage-02': '7e79c1a2bcc1302151a84c6e5fb5cf2852ec45a853e3e88e02613955f2fdacad', 'AR-u6-charge-accelerating-voltage-03': '5f7393efd6216db18c438cf8e1e0c4e423863d6a45fd9f73952e616b04c34fe2', 'AR-u6-charge-accelerating-voltage-04': 'b42b0c0754253ba87297143c5b1fde8093bf9c517ec0850139eb3b8b8c2ae6b9', 'AR-u6-charge-accelerating-voltage-05': 'b00018e306550e59cd3f1c8418b892979413a8465f04707d32d93e3c508f57de', 'AR-u6-charge-accelerating-voltage-06': '2aff28e310ea7fbe4407ba5a41a844a2bc59348502c5ef522f49a9edbd4ce572', 'AR-u6-charge-accelerating-voltage-07': '7bac01b984e3db5a541e5e23b73f68609606c874435bddfd1a65093ac7744825', 'AR-u6-charge-accelerating-voltage-08': 'ff76d4702c0c110ffd9d54f9e5d0d26d0ae22e191ab5573684a0d8b851888864', 'AR-u6-charge-accelerating-voltage-09': '811ea9c4052ac4371536b0c6e795e061b1139e1c3cc3b15776e51974168dc1e8', 'AR-u6-charge-accelerating-voltage-10': 'b13b7746f35ca93194673defe3bdc82271d7585c11609943aff9c50243a7f96e', 'AR-u6-charge-accelerating-voltage-11': '05b4900ad646aa0b7c345eac43d13c17b7fec8ceba5a34fb753f31b416f63bd3', 'AR-u6-charge-accelerating-voltage-12': '09016942f806b891b0e054175fe08910a0075bc50bfc90aec41306731d45be99', 'AR-u6-charge-accelerating-voltage-13': 'b4a3d349432db3b8c301a71ec08c2c75e197136620f5aed3066fe44a4218e0f5', 'AR-u6-charge-accelerating-voltage-14': 'ae5c6e5bbc1b2db0a4651971cd3766f7a53e974802feea123b08d3e8681b3308', 'AR-u6-charge-accelerating-voltage-15': '3cd263ecc06efaf87808d1a96c1032b434b7aeffa3e73d2879c682be4d615bc9', 'AR-u6-charge-accelerating-voltage-16': '60aa562b0e3e01dafd6790e6acd43581bc6d77eec3a31c8522b4cfde09cc3729'}

READ_SOURCE_SHA256={'u6-charge-accelerating-voltage-01': 'a8fe96abb6d728c40c2d37cb3517fc2ee2dd4f4e1853a700206c63f02838a4d8', 'u6-charge-accelerating-voltage-02': '738d86b7e7973ab07ce6dee7729373d44c5dffdd87190818d4682d427049b040', 'u6-charge-accelerating-voltage-03': 'e9fd04780e8a918883c832640501d4f3b3c816d5023462dee64389e90ee53290', 'u6-charge-accelerating-voltage-04': 'd5dfca0fd8e50beb574b6298cacbb72eb03abdafc58e2fa6e64faefff7f2827d', 'u6-charge-accelerating-voltage-05': 'a68f8ab7fbd835b33a457994a1f41a66fe33e187e427017667d7918feee31838', 'u6-charge-accelerating-voltage-06': 'ef46da0dea441b4c82cf63d691b0b5b65c776d9f6d1dd52dab8822cf5bf5780d', 'u6-charge-accelerating-voltage-07': 'd5da3bd293f127947b51e698347194a167e26b19f22ad77772ec01a466ae64bc', 'u6-charge-accelerating-voltage-08': 'd6f3cfffead134b4f48148b8f2b0a37684cc7d0267f39482ba3a7ccfc18cf6c0', 'u6-charge-accelerating-voltage-09': '6b5cd15d5dbd1aa531175fcee78714f03889f1f751cae5409b81af7cea6d9661', 'u6-charge-accelerating-voltage-10': '15fa3253cc3f79e144a061aa02601c01165572164a8b39de5d9ed893964858d9', 'u6-charge-accelerating-voltage-11': 'a9ab71a0c769164512f2909646146b91b13d115b71544d398f2558a87b30ca04', 'u6-charge-accelerating-voltage-12': 'eb95a67c6613396a341c8f29e95c8dbf0c50db514f917b851b892aff62d3bf47', 'u6-charge-accelerating-voltage-13': '21b1e5359d9b652fafa8281b39a72b12c3a19291cd6b011522da072ff8d32cc0', 'u6-charge-accelerating-voltage-14': 'afc17c996fbb6278a697fa10bd9ffc5a2d27bb12911b49ec8b37048aab5bf1d1', 'u6-charge-accelerating-voltage-15': '88cb7d2ba75e07f8e12240d300b38604f2184d7990829fded565ca59478e27d7', 'u6-charge-accelerating-voltage-16': '8b784a84c3028ff369f01a026272954cb23286769ed3c90f58c5958a90964b50'}

SOURCE_READING='Primaria indipendente3531 congelata dopo tutti80 originali prompt-only, prima delle candidate. Poi letti integralmente i16 record finali del lotto, tutte opzioni, blocchi, formule, hint/error, metadati, XML e rendering nativo completo realmente prodotto. Nessun autore importato. Lezioni reali C4-L02/L03 e prerequisiti di meccanica riletti; ipotesi e casi speciali confrontati individualmente. Byte congelati soltanto dopo lettura finale; UI prodotto NOT_RUN.'
