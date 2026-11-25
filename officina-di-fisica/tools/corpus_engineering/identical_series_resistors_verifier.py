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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
FAMILY='identical-series-resistors'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L06'for n in range(1,17)}

def numbers(*values):
    if any(type(x) is bool or not isinstance(x,(int,Fraction,sp.Expr)) for x in values):
        raise ValueError('Numeric exact objects required; raw text is decoded only by the bounded AST codec')
    values=tuple(map(sp.sympify,values))
    if any(x.is_number is not True or x.is_real is not True or x.is_finite is not True or x.has(sp.Float) for x in values):
        raise ValueError('Finite real exact numeric parameters required; use lexical rationals, not binary floats')
    return values

def positive(*values):
    values=numbers(*values)
    if any(x<=0 for x in values):raise ValueError('Strictly positive physical parameters required')
    return values

def unique(options,want):
    if [i for i,x in enumerate(options)if sp.simplify(x-want)==0]!=[0]:raise AssertionError('Independent symbolic alternatives not unique')

def calibrate(x1,x2,y1,y2):
    x1,x2,y1,y2=numbers(x1,x2,y1,y2)
    if x1<=0 or x2<=0 or x1==x2:raise ValueError('Distinct positive reference outputs required')
    gain=sp.cancel((y2-y1)/(x2-x1));offset=sp.cancel(y1-gain*x1)
    if gain<=0:raise ValueError('Positive nonzero display gain required')
    return gain,offset

def count(value):
    value,=numbers(value)
    if value.is_Integer is not True or value<=0:raise ValueError('An exact positive integer count is required, no rounding')
    return value

def chain(element,number):
    element,=positive(element);number=count(number)
    return element*number

def inverse_element(total,number):
    total,=positive(total);number=count(number)
    return total/number

def inverse_count(total,element):
    total,element=positive(total,element)
    return count(total/element)

@lru_cache(maxsize=1)
def oracle():
    N=sp.symbols('N',positive=True,integer=True);r,R,I,k1,k2=sp.symbols('r R I k1 k2',positive=True)
    voltage=N*I*r;law=sp.cancel(voltage/I);assert law==N*r
    unique([law,r/N,N/r,r+N,N**2*r],law)
    unique([R/N,R*N,N/R,R-N,R/N**2],sp.solve(sp.Eq(R,law),r)[0])
    unique([k1*k2,k1/k2,k2/k1,k1+k2,k1*k2**2],sp.cancel((k2*N*k1*r)/(N*r)))
    aa,bb=chain(2,3),chain(3,4);assert(aa,bb)==(6,12)
    gain,offset=calibrate(aa,bb,13,25);assert(gain,offset)==(2,1)
    # The formal mean N=7/2 is not an admissible chain; no call accepting fractional count.
    assert sp.Rational(5,2)*sp.Rational(7,2)==sp.Rational(35,4)
    assert inverse_count(6,2)==3 and inverse_element((17-offset)/gain,2)==4
    assert count(sp.Rational(4,3)*3)==4
    x=sp.symbols('x',real=True);assert sp.solve(sp.Eq(sp.Rational(2,3)*x*x,6),x)==[-3,3]
    Q=SI.Quantity;assert (3*Q(Fraction(2),'ohm')).to('ohm').magnitude==6
    return [aa,'Ω','R = N r','Da 6 a 15 Ω',inverse_element(6,3),inverse_count(6,2),chain(2,1)/aa,12-aa,'r = R / N','κ₁ κ₂',bb/aa,(aa+bb)/2,sp.Rational(4,3),inverse_element(sp.Rational(36,3),4),inverse_element((17-offset)/gain,2),sp.Integer(3)]

MANUAL=['N elementi in serie hanno corrente uguale e cadute additive: R=Nr. Con N 3 e r 2 Ω: R 6 Ω. N è conteggio intero positivo, r resistenza positiva di ogni elemento.', 'La resistenza totale ha unità Ω, perché N è adimensionale. Conteggio privo di unità non significa resistenza priva di unità. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.', 'Ogni caduta è Ir; N elementi identici danno V=N·Ir, quindi R=V/I=Nr. N non compare al denominatore come in N rami paralleli identici.', 'N resta 3. r passa da 2 a 5 Ω: totale 6→15 Ω. La variazione è lineare in r e non cambia il numero degli elementi.', 'r=R/N=6/3=2 Ω. Divisione per un intero positivo; la resistenza di ciascun elemento è positiva.', 'N=R/r=6/2=3. Oltre alla positività serve integrità: il rapporto deve essere un intero positivo, non va arrotondato se i dati dessero un valore frazionario.', 'A N 3, r 2 Ω dà 6 Ω. B N 1 con stesso r dà 2 Ω; rapporto 1/3. Un singolo elemento è il confine N=1 ammesso.', 'Proposta 12 Ω meno corretto 6 Ω=+6 Ω; il rapporto 2 è puro, non lo scarto richiesto.', 'Da R=Nr si divide per N>0: r=R/N. Dimensione Ω perché N è puro; non R·N o N/R.', 'R_B/R_A=(κ₂N)(κ₁r)/(Nr)=κ₁κ₂. Occorre anche N e κ₂N interi positivi; κ₂ può essere razionale purché il numero finale sia intero. Non imporre senza motivo κ₂ intero.', 'A r 2, N 3⇒6 Ω; B r 3, N 4⇒12 Ω. Rapporto 2.', 'Media(6+12)/2=9 Ω. Il prodotto dei dati medi sarebbe(5/2)(7/2)=35/4 Ω, diverso di 1/4 Ω; inoltre N_medio 7/2 non è un conteggio ammesso per una catena reale. La media statistica delle resistenze non richiede una catena con N frazionario.', 'Bersaglio 2·6=12 Ω e r_B 3 Ω danno N_B=4, intero positivo. Rapporto N_B/N_A=4/3; il rapporto non deve essere un intero anche se entrambi i conteggi lo sono.', 'A R 6 Ω con lettura 18 dà a=3 Ω⁻¹. Lettura 36 indica R 12 Ω; N_C 4⇒r_C 3 Ω. Il conteggio 4 è ammesso.', 'A R 6, B R 12 Ω e letture 13,25 danno a=2 Ω⁻¹, b=1. S_C 17⇒R_C 8 Ω; N_C 2⇒r_C 4 Ω. L’offset viene sottratto prima di dividere per N.', 'Vincolo r=(2/3 Ω)N. Allora R=(2/3 Ω)N²=6 Ω ⇒N²=9. Radici±3, ma N deve essere intero positivo: N=3, r=2 Ω. Non aggiungere altri valori arrotondando una radice.']

DISTRACTORS=['2/3 Ω è il parallelo; 5 somma grandezze incompatibili r+N; 2 Ω rappresenta un solo elemento; 12 Ω raddoppia ancora il totale.', 'A, V e S misurano altre grandezze; 1 è l’unità del conteggio N, non della resistenza totale.', 'r/N è il parallelo; N/r ha unità S; r+N mescola Ω e numero puro; N²r introduce un fattore N non ottenuto sommando le cadute.', '5 Ω è un solo elemento; 10 Ω ne conta due anziché tre; 6 Ω ignora la modifica; 75/2 Ω quadra erroneamente il fattore 5/2.', '18 Ω moltiplica per N; 6 Ω copia il totale; 1/2 Ω non soddisfa R=6 Ω con tre elementi. Solo 2 Ω ricostruisce il totale.', '12 moltiplica invece di dividere; 1/3 non è un conteggio ammesso; zero è escluso. Non si arrotonda un rapporto R/r frazionario per costruire una catena esatta.', '3 inverte il rapporto; 1 ignora la rimozione; 1/9 usa N²; 2 copia il valore numerico della resistenza finale in Ω.', '−6 Ω inverte lo scarto; 12 Ω copia la proposta; zero la accetta; 2 è un rapporto e non una differenza in Ω.', 'RN non isola r; N/R ha unità S; R−N sottrae grandezze incompatibili; R/N² divide per un fattore N ulteriore privo di giustificazione.', 'I quozienti invertono un fattore; la somma darebbe 2 per due prove identiche; N² non segue dalla serie. κ₂ può essere 4/3 quando N_A=3 e N_B=4.', '1/2 è il reciproco; 3/2 segue solo r; 4/3 segue solo N; 4 copia N_B senza confrontare i prodotti Nr.', '35/4 Ω è il prodotto formale dei dati medi, con N=7/2 non ammesso come catena reale; 18 Ω omette la divisione per due; 3 Ω è metà della differenza; 6 Ω ripete la prima prova.', '3/4 è il reciproco; 2 copia il rapporto dei totali; 4 copia N_B; 3/2 segue solo r. Il rapporto di conteggi interi non deve essere intero.', '9 Ω usa la lettura 36 senza taratura; 12 Ω copia il totale; 4 Ω copia N e ricostruisce una lettura 48. Il display continuo non è un conteggio di resistori.', '17/4 Ω omette l’offset e ricostruisce 18; 2 Ω ricostruisce 9; 8 Ω ricostruisce 33; 1 Ω ricostruisce 5. Solo 4 Ω restituisce la lettura 17.', '9 copia N²; −3 è escluso; N=2 produrrebbe 8/3 Ω. La misura N²=9 seleziona il solo intero positivo 3 e non infinite soluzioni.']

ASSUMPTIONS=['N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.', 'N è un intero positivo esatto, r>0 finita; tutti gli elementi identici in serie senza derivazioni, fili ideali e temperatura fissata. N=1 ammesso. Le inverse devono conservare N intero e i fattori soddisfano NB=k 2 NA intero, non necessariamente k 2 intero. Medie statistiche di uscite non definiscono una catena con conteggio frazionario.']

UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm', 4: 'ohm', 5: 'ohm', 6: '', 7: '', 8: 'ohm', 9: 'ohm', 10: '', 11: '', 12: 'ohm', 13: '', 14: 'ohm', 15: 'ohm', 16: ''}

NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 14: 'Ω', 6: '1'}

SUFFIX={8: ' Ω', 12: ' Ω', 15: ' Ω'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite soluzioni positive'}}

SVG_REVIEW='XML e rendering nativo indipendente completo letti. I circuiti contengono esattamente tre e quattro resistori; i simboli schematici non codificano il valore con la larghezza. Le barre 6,12,9 Ω sono larghe 180,360,270, con origine 150 e scala comune 30 coordinate/Ω. N_medio=7/2 è dichiarato conteggio non ammesso per una catena reale; non viene disegnato alcun mezzo resistore. Gli zeri a x=125 sono liberi dagli assi.'

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
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
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


CANDIDATE_REF='07d1f0a80b73ea6f3768b6ff3aa7f3fc6fc2a4a0'

PRIMARY_SHA256='e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='860b4e067fd175e48d54808fbc656e24783ecec083ab9af359cc42b797c5bef8'

REVIEWED_BINDINGS_SHA256='7c2eed43adae4bf03b921a2e779a270bc1b8a8d4907e9ca87da6cef85ca20539'

REVIEWED_CANDIDATES={'AR-u6-identical-series-resistors-01': 'c2fac2d73043dcf96ed7e260e04328d8093b3f050b377cd3b1ffdcef58250cc1', 'AR-u6-identical-series-resistors-02': '27f549d5fb8e0a0e4be1ea9521f2ff2030ce07e5da016b5154571f871d26e180', 'AR-u6-identical-series-resistors-03': 'bd54aa28e9e0736e38fb87d8a98143518b5037b2d3b9a019ccfb78879b89812f', 'AR-u6-identical-series-resistors-04': 'd34286a26f49ce7e0ddce7e6169139d79b80f7a0695edb6f81e7610abb10e4d9', 'AR-u6-identical-series-resistors-05': 'f599e563ab3ab92591f926c075908e7fbf04f96c962a18047b99572879917f3e', 'AR-u6-identical-series-resistors-06': '37f164a64dc48a8278387a91a70dbbf9057cddec530f2d50336992dac709ef05', 'AR-u6-identical-series-resistors-07': '7d4e76ade8321f16512d6edbcfa23d74f0a1dbd3801be04d124beafb20adebf6', 'AR-u6-identical-series-resistors-08': 'dfd598e8156a443d391d100d918b4cad50b39ea934e9714cf83d0123657723b5', 'AR-u6-identical-series-resistors-09': '1a3561244e016fa4f362be51da8ab3a61c1e91e8a0ebd6af902c5b8aa66c3a4b', 'AR-u6-identical-series-resistors-10': 'b550aa1de814e031e18ddb4f80bd6ef62dab2f44c91046c9eb8bcb338c25096b', 'AR-u6-identical-series-resistors-11': '8f51a5e21151ef7443538c1f760958cca685d18f7a3293f7e2ccf24924a355b1', 'AR-u6-identical-series-resistors-12': '18cea2acec3d0860854c08357781bcfff5c665a7dcdf489c9d54686bab9d54df', 'AR-u6-identical-series-resistors-13': '25b8f01b9b4fee5925370887ae6ee3489ab0b4b2dd798041b3ffd75a86258b58', 'AR-u6-identical-series-resistors-14': '66b0a9e8fa4e8051cd62b730d15bbbfc33ca79d082dfdb3cdd0a6493bcb1b5a5', 'AR-u6-identical-series-resistors-15': '05c79c9fb457a83051816ede29b4576f3881518b09bdb857488ef13daf263ce6', 'AR-u6-identical-series-resistors-16': 'ecc4b6a33c44f132c875c7b485a6f2ea651e2f69b36771db2893e60aa8b0aa42'}

READ_SOURCE_SHA256={'u6-identical-series-resistors-01': 'a8825b510c25ff6f73209d473b8c5098612d51b5079e108f85374f8ecd7cdf65', 'u6-identical-series-resistors-02': 'a04fb047212f450b3236b1cff2a40b1b5bf1f21dedde5bd40ebe098b1b7224df', 'u6-identical-series-resistors-03': 'bb31bbbc0d82347ac500d1cb6ef5697da258e5d766fa20679fee578fefdcda9d', 'u6-identical-series-resistors-04': 'b4aafd2dcda403881b1324486547e5458758b655dfb4a6604e36cb039d03a3c9', 'u6-identical-series-resistors-05': '1f6cb4a99719857b89c59a024286ac08bebfadee2456450342fbde36e3fe8151', 'u6-identical-series-resistors-06': 'a0d92b976f10f248cb13c9788089647db0bb3fd24591d22e9934260e4a0db06c', 'u6-identical-series-resistors-07': '4ab983eaefe429360594a264ebb76ca46d43235b20b1eded8aef771527f9731e', 'u6-identical-series-resistors-08': '5a08d2b911049fafa6618f1fa1bb4dd68f0aaf4990f9638b00b5c40e5e34ef87', 'u6-identical-series-resistors-09': '72de31ce316513c397841570ed2d2f1e5952c7eeb975a3afd147852752a4865a', 'u6-identical-series-resistors-10': '2f45358a53692d903a92901fcb74a85191783e2a8e9ba4a495c752dc188ef78b', 'u6-identical-series-resistors-11': '038102c07e865f6209a5dffd43a93aef74cb6b6b4d89f596ea0304798bf99f0c', 'u6-identical-series-resistors-12': '91a5033643e8c11133506a1378ccc55cbbda67e32d1acc8215ca0f9c0eaff1f9', 'u6-identical-series-resistors-13': 'a08b2befbe73d6fafdb7133f297238970f26a70e93640cc1711655d7601ba5ba', 'u6-identical-series-resistors-14': '7f62bfa43c9c6914dd162a383b64a1a90b793384ec33fd1acb12341a013640de', 'u6-identical-series-resistors-15': '6d2f612e1d7ecba36432037c2490fb57b5346fa6805ba9cc93889765fd50dc84', 'u6-identical-series-resistors-16': '0e4d458831ef7c412bb7358e66d5962b480aa7fca06b4bd4992b8c679646132c'}

SOURCE_READING='Tutti gli 80 originali U6-02 B205–209 sono stati letti e derivati da prompt e dati prima di candidati, alternative o chiavi. La primaria e8b27ab5 resta immutata. Successivamente ogni campo di ciascun record finale, tutte le alternative e i cinque SVG XML/native completi sono stati letti separatamente. Le correzioni B sono state rilette prima del congelamento; nessun modulo autore importato. Catalogo reale C4-L05/L06 riletto. UI del prodotto e approvazione umana NOT_RUN. Nessun push o upload durante il vincolo operativo ROOT.'
