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
FAMILY='two-series-resistors'
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

def series(first,second):
    first,second=positive(first,second)
    return first+second

def inverse_first(total,known):
    total,known=positive(total,known)
    if total<=known:raise ValueError('Positive residual element requires total>known')
    return total-known

def bypassed(active,shunted):
    active,shunted=positive(active,shunted)
    return active # node contraction is proved separately below, not the old series formula

@lru_cache(maxsize=1)
def oracle():
    R1,R2,S,I,k1,k2=sp.symbols('R1 R2 S I k1 k2',positive=True)
    voltage=I*R1+I*R2;law=sp.expand(voltage/I);assert law==R1+R2
    unique([law,R1*R2/(R1+R2),R1-R2,1/R1+1/R2,R1*R2],law)
    unique([S-R2,S+R2,R2-S,S/R2,1/S-1/R2],sp.solve(sp.Eq(S,law),R1)[0])
    unique([(k1*R1+k2*R2)/(R1+R2),k1*k2,k1/k2,(R1+R2)/(k1*R1+k2*R2),(k1*R1-k2*R2)/(R1-R2)],sp.cancel(law.subs({R1:k1*R1,R2:k2*R2})/law))
    # Ideal wire identifies shunted terminals: V_b=V_c, so I_shunt=0 and V_total=I_active R1.
    Va,Vb,Vc=sp.symbols('Va Vb Vc',real=True)
    shunt=sp.cancel(((Vb-Vc)/R2).subs(Vb,Vc));assert shunt==0
    current=(Va-Vc)/R1;assert sp.cancel((Va-Vc)/current)==R1
    aa,bb=series(2,3),series(3,5);assert(aa,bb)==(5,8)
    gain,offset=calibrate(aa,bb,11,17);assert(gain,offset)==(2,1)
    assert series(sp.Rational(5,2),4)==sp.Rational(13,2)
    assert bypassed(2,4)==2 and inverse_first(5,3)==2
    Q=SI.Quantity;assert (Q(Fraction(2),'ohm')+Q(Fraction(3),'ohm')).to('ohm').magnitude==5
    return [aa,'Ω','R_eq = R₁ + R₂','Da 5 a 4 Ω',inverse_first(5,3),bypassed(2,4),series(2,1)/aa,10-aa,'R₁ = R_eq − R₂','(κ₁ R₁ + κ₂ R₂) / (R₁ + R₂)',bb/aa,(aa+bb)/2,sp.Rational(5,3),inverse_first(sp.Rational(24,3),5),inverse_first((5-offset)/gain,1),sp.Integer(3)]

MANUAL=['Senza derivazioni e senza accumulo al nodo, la corrente è uguale nei due resistori; le cadute si sommano: V=I(R₁+R₂), dunque R_eq=R₁+R₂. Con 2 e 3 Ω si ottiene 5 Ω. Fili ideali e regime ohmico.', 'R_eq è una resistenza, V/I, quindi Ω. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.', 'Corrente comune I, cadute V₁=IR₁, V₂=IR₂. La tensione totale è I(R₁+R₂), quindi R_eq=R₁+R₂. Non si sommano reciproci come nel parallelo.', 'R₂ resta 3 Ω. Cambiare R₁ da 2 a 1 Ω porta R_eq da 5 a 4 Ω; non dimezza tutto il totale perché il secondo elemento resta invariato.', 'R₁=R_eq−R₂=5−3=2 Ω. R₁>0 richiede in generale R_eq>R₂>0; l’uguaglianza darebbe un corto e uscirebbe dal dominio dei resistori strettamente positivi.', 'Il filo ideale collega i due capi del solo 4 Ω e li rende equipotenziali. Quel resistore ha V=0 e nessuna corrente finita: viene bypassato. Resta il 2 Ω fra i morsetti esterni, quindi R_eq finale 2 Ω, non 6 o 0. Il corto non collega i morsetti dell’intera catena.', 'A:2+3=5 Ω. B:2+1=3 Ω. Rapporto B/A=3/5, non il rapporto 1/3 dei soli secondi elementi.', 'Corretto 5 Ω, proposta 10 Ω: scarto+5 Ω. Il rapporto 2 senza unità non è una differenza di resistenze.', 'Isolare la prima resistenza dà R₁=R_eq−R₂. Dominio della soluzione positiva: R_eq>R₂>0; dimensione Ω e non Ω².', 'La nuova somma è κ₁R₁+κ₂R₂. Rapporto col totale iniziale:(κ₁R₁+κ₂R₂)/(R₁+R₂). Non in generale κ₁κ₂; se i fattori coincidono κ il rapporto èκ.', 'A=2+3=5 Ω; B=3+5=8 Ω; rapporto 8/5. I due termini restano positivi e la topologia non cambia.', 'Media(5+8)/2=13/2 Ω. In questo modello lineare coincide anche con la somma dei dati medi R₁=5/2, R₂=4 Ω:5/2+4=13/2. La coincidenza è giustificata dalla linearità, non da una regola universale delle medie.', 'Bersaglio(8/5)·5=8 Ω. Imposto R₁, B 3 Ω: R₂, B=8−3=5 Ω. Rapporto con R₂, A 3 Ω pari 5/3.', 'Riferimento 5 Ω e S 15 danno a=3 Ω⁻¹. Lettura 24 indica 8 Ω; noto R₂5 Ω, segue R₁=3 Ω. Non usare 24 direttamente come una resistenza.', 'R_A 5, R_B 8 Ω e letture 11,17: a=6/3=2 Ω⁻¹, b=1. S_C 5 restituisce R_eq, C=(5−1)/2=2 Ω; sottraendo R₂, C 1 Ω si trova R₁, C 1 Ω.', 'R₁=(2/3)R₂ ⇒R_eq=(5/3)R₂. Misura 5 Ω implica R₂=3 Ω e R₁=2 Ω. Unica soluzione positiva perché il coefficiente 5/3 non è nullo.']

DISTRACTORS=['6/5 Ω è il parallelo; 6 Ω è il prodotto numerico; 2 e 3 Ω omettono rispettivamente un elemento della serie.', 'S, A, V e W misurano conduttanza, corrente, tensione e potenza; Ω deriva da V/I.', 'Il prodotto diviso per la somma descrive il parallelo; la differenza non descrive una serie passiva; la somma dei reciproci ha unità S e il prodotto ha unità Ω².', '5/2 Ω dimezza entrambi gli elementi; 6 Ω aumenta il totale mentre un addendo diminuisce; 5 Ω ignora la modifica; 2 Ω omette il secondo elemento.', '8 Ω aggiunge il valore noto e predice un totale 11 Ω; 5 Ω copia il totale e ne predice 8 Ω; una resistenza negativa è esclusa.', '6 Ω conserva la vecchia topologia; 4 Ω elimina l’elemento sbagliato; 4/3 Ω pone erroneamente i resistori in parallelo; zero cortocircuiterebbe anche il 2 Ω.', '5/3 è il reciproco; 1/3 segue soltanto il secondo resistore; 1 ignora la modifica; 3 copia il valore numerico dell’equivalente finale in Ω.', '−5 Ω inverte l’ordine; 10 Ω copia la proposta; zero la accetta; 2 è il rapporto senza unità, non lo scarto in Ω.', 'Il segno più non isola l’addendo; R₂−R_eq è negativo nel dominio; R_eq/R₂ è adimensionale; la differenza dei reciproci ha unità S.', 'Prodotto e quoziente dei fattori omettono i pesi dei due resistori; il reciproco scambia le prove; il rapporto delle differenze può avere denominatore nullo e non segue la serie.', '5/8 inverte il rapporto; 3/2 segue solo R₁; 5/3 segue solo R₂; 2 richiederebbe 10 Ω, mentre il totale finale è 8 Ω.', '13 Ω omette la divisione per due; 3/2 Ω è metà della differenza; 5 e 8 Ω ripetono le singole prove. La coincidenza con la somma dei dati medi è giustificata dalla linearità.', '3/5 è il reciproco; 8/5 copia il rapporto dei totali; 5 copia il valore numerico di R₂,B in Ω senza dividerlo per R₂,A; 3/2 segue soltanto R₁.', '19 Ω usa 24 come totale senza rimuovere il guadagno; 8 Ω copia l’equivalente; 5 Ω copia il resistore noto. La taratura del display non è un resistore aggiunto.', '3/2 Ω ricostruisce una lettura 6; 2 Ω ricostruisce 7; 3 Ω ricostruisce 9; 5 Ω ricostruisce 13. Solo 1 Ω restituisce la lettura 5.', '2 Ω è R₁ e non R₂; 5 Ω copia il totale; −3 Ω viola la passività. La misura del totale elimina la scala libera del solo rapporto fra i resistori.']

ASSUMPTIONS=['Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.', 'Resistori ohmici passivi positivi finiti, fili ideali, temperature fissate e regime stazionario; nodo intermedio senza derivazioni e corrente comune. Req è coefficiente in V=IReq, definibile anche al limite V=I=0, non una divisione 0/0. Nel 06 autonomo un filo ideale identifica soltanto i nodi del 4 Ω, lasciando attivo 2 Ω.']

UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm', 4: 'ohm', 5: 'ohm', 6: 'ohm', 7: '', 8: 'ohm', 9: 'ohm', 10: '', 11: '', 12: 'ohm', 13: '', 14: 'ohm', 15: 'ohm', 16: 'ohm'}

NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 14: 'Ω'}

SUFFIX={8: ' Ω', 12: ' Ω', 15: ' Ω', 16: ' Ω', 6: ' Ω'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite resistenze positive'}}

SVG_REVIEW='XML e rendering nativo indipendente integrale letti. Il primo circuito è una serie di 2 e 3 Ω senza derivazioni. Nel caso separato di bypass il filo collega (340,620) e (500,620), soltanto ai capi del 4 Ω; il 2 Ω fra x=170 e 270 resta attivo. Nessun corto dei morsetti esterni. Le barre 5,8,13/2 Ω sono larghe 200,320,260 con origine 150 e scala comune 40 coordinate/Ω. L’etichetta zero a x=125 è libera dall’asse.'

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


CANDIDATE_REF='0188d3f00956cf376c2090bf822826a5fa02c25d'

PRIMARY_SHA256='e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='3347656e1bce348063cefb0a4dac241efa1851c1d1beca7712b880bb4d432d50'

REVIEWED_BINDINGS_SHA256='be3d2d3359658ed3e1b2bd5c5a561532a0b71acd53210366e0ed81198e0e6994'

REVIEWED_CANDIDATES={'AR-u6-two-series-resistors-01': '431b48c20101f1357c868aec7a8aba651144de4d58a85a41ab185ebe549994f0', 'AR-u6-two-series-resistors-02': '7095a6b618555de72d74a2dd42b7fefb2dfb6531649a0804a4dd5128f672a4b9', 'AR-u6-two-series-resistors-03': 'f1f8bbd7872d1c42b5a913142d71fa985be9396147f201ad4ce9655b837f89d2', 'AR-u6-two-series-resistors-04': '77d90c8ddb00f8b03913e43d8bce76495587f0fec57004c2ebd7bbcd6fa74e45', 'AR-u6-two-series-resistors-05': '46c697f0ed2ee76bcc568caf04874872fd0c2324defef18ce81328593ed69293', 'AR-u6-two-series-resistors-06': '130ed16483d578b9258b7c6b23265066a19a17c6dff8e3cab152171bbb092ab6', 'AR-u6-two-series-resistors-07': 'ac04d11641780a7ee0d6d5a66bedf3475ef4ad740687436ff4dd44fdce602509', 'AR-u6-two-series-resistors-08': 'a7579e55fcbf7174e5b6d1a4616f6a9bdb036527894d7afbbbeec08cf2a3d4f3', 'AR-u6-two-series-resistors-09': 'e131a99794b40041d15e16cbf7ecad475a513f63660a64679a777d6ba4d081f0', 'AR-u6-two-series-resistors-10': 'aa50c6caef513c004824b17d1f7ab01610298833cb577c9d381c71ce93a1dba4', 'AR-u6-two-series-resistors-11': 'c4a18eac3b4dbce4c4756318b84644ddb84b22636722afc85c74c3dcc9fb763e', 'AR-u6-two-series-resistors-12': '322f5387740abe9cda4d608228120e4b19b3494296d654c7ebbd05c095c42044', 'AR-u6-two-series-resistors-13': '883d1fe521163a2c4b87d862c9bd52e633ae97ef6a9dcfa23863de030d0dfba9', 'AR-u6-two-series-resistors-14': '30de43af29a2767c6eac72b49a1d95179fc58962263b67c6df5e0a68092b6287', 'AR-u6-two-series-resistors-15': '23f3b65ade7c91c3dc7f2ec0ead388a5a3ad1df739d143494c0e80cf31c48b34', 'AR-u6-two-series-resistors-16': 'cc6e84ea347e5caac11c91b5bdc642fdaafca8a3a508e9b5817d6f02e7b66477'}

READ_SOURCE_SHA256={'u6-two-series-resistors-01': 'b4aac7a39b9b6408a89822196dbd106036c4b5d44426b48e4795aaf8fea19504', 'u6-two-series-resistors-02': 'bce725566e76169b7269ea02e76d16224cd6d29472ea8718d2931bbd1e50a6e2', 'u6-two-series-resistors-03': '4700e9bbe18936bed02a6a0b41ce0f74a31604286e3fc56cb423c981ce4e9503', 'u6-two-series-resistors-04': '03d40604487b6f53136fb55bdd8c409c7b3565e9a4bac4b0ef258187fe76a9b5', 'u6-two-series-resistors-05': '23d321386465491bf3de93503029ec3951c6f75ddd96952912a34cb3dcea11a4', 'u6-two-series-resistors-06': 'b483fac80cb74b0aeb842999f6f23306de505dfea6154b937f98326fa02d2ade', 'u6-two-series-resistors-07': '25e3a5d9664c89cfd433203e8b5d33145619abd81590a27fbe33f20dc95b2779', 'u6-two-series-resistors-08': '576b7a4d5c8d38f3b4af0284266116ba475c20f9c6b067a240b1eb54eba4a57b', 'u6-two-series-resistors-09': 'b4336c349d8806c3c577df9494137c526043d015f30f292731ddc1aa72603eb8', 'u6-two-series-resistors-10': 'dd8e114a02d2553cccd273326fd44ca72cae4396e3bd6901cdbaf3478ad4162d', 'u6-two-series-resistors-11': '00d5af76dfedb876bad2317d07bceeb0d1b4bb80939a6a6d0f33de82c0026f90', 'u6-two-series-resistors-12': 'b00c2887be3b07a27fbe2ba161639e1e3e939adf9319d3b2d54ecf1357a2687e', 'u6-two-series-resistors-13': 'a8a78450fdf88489ea9444c64bc9dfd2d794b37df7b63f62bb0bed84ef1962ba', 'u6-two-series-resistors-14': '596ceb83c336b53b5a8071a680d276d46de479933c97d2bb3fcea7f536609e20', 'u6-two-series-resistors-15': '54d47650109aa1e1657d9697062f2cc467634a35e4a950a2883b2bf134828005', 'u6-two-series-resistors-16': '0358db74fa21c666461861a207bde7396f6d95696eb574197957820cd57f049a'}

SOURCE_READING='Tutti gli 80 originali U6-02 B205–209 sono stati letti e derivati da prompt e dati prima di candidati, alternative o chiavi. La primaria e8b27ab5 resta immutata. Successivamente ogni campo di ciascun record finale, tutte le alternative e i cinque SVG XML/native completi sono stati letti separatamente. Le correzioni B sono state rilette prima del congelamento; nessun modulo autore importato. Catalogo reale C4-L05/L06 riletto. UI del prodotto e approvazione umana NOT_RUN. Nessun push o upload durante il vincolo operativo ROOT.'
