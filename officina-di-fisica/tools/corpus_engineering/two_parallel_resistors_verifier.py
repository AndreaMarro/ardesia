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
FAMILY='two-parallel-resistors'
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

def parallel(first,second):
    first,second=positive(first,second)
    return first*second/(first+second)

def inverse_branch(total,known):
    total,known=positive(total,known)
    if total>=known:raise ValueError('Finite positive parallel branch requires 0<total<known')
    return total*known/(known-total)

def opening_ratio(removed,remaining,voltage):
    removed,remaining,voltage=positive(removed,remaining,voltage)
    initial=voltage/removed+voltage/remaining;final=voltage/remaining
    return sp.cancel(final/initial)

@lru_cache(maxsize=1)
def oracle():
    R1,R2,S,k1,k2,V=sp.symbols('R1 R2 S k1 k2 V',positive=True)
    law=sp.cancel(1/(1/R1+1/R2));assert law==R1*R2/(R1+R2)
    inverse=sp.solve(sp.Eq(S,law),R1)[0]
    unique([S*R2/(R2-S),S*R2/(R2+S),R2-S,S-R2,R2/S],inverse)
    scaled=sp.cancel(law.subs({R1:k1*R1,R2:k2*R2})/law)
    unique([k1*k2*(R1+R2)/(k1*R1+k2*R2),k1*k2,k1/k2,(k1*R1+k2*R2)/(R1+R2),1/(k1*k2)],scaled)
    # Same-node voltage equality is universal; equal currents/powers are not.
    assert sp.Rational(6,2)!=sp.Rational(6,3) and 6**2/sp.Integer(2)!=6**2/sp.Integer(3)
    assert sp.cancel((V/6)/(V/3+V/6))==sp.Rational(1,3)
    aa,bb=parallel(2,2),parallel(3,6);assert(aa,bb)==(1,2)
    assert parallel(sp.Rational(5,2),4)==sp.Rational(20,13)
    gain,offset=calibrate(aa,bb,3,5);assert(gain,offset)==(2,1)
    assert inverse_branch((2-offset)/gain,1)==1
    assert opening_ratio(3,6,1)==sp.Rational(1,3)
    Q=SI.Quantity;assert (1/Q(Fraction(2),'ohm')+1/Q(Fraction(2),'ohm')).to('siemens').magnitude==1
    return [aa,'Ω','La tensione ai capi dei due resistori è la stessa','Da 1 a 2/3 Ω',inverse_branch(1,2),opening_ratio(3,6,1),parallel(2,1)/aa,2-aa,'R₁ = R_eq R₂ / (R₂ − R_eq)','κ₁ κ₂ (R₁ + R₂) / (κ₁ R₁ + κ₂ R₂)',bb/aa,(aa+bb)/2,sp.Integer(3),inverse_branch(sp.Rational(6,3),6),inverse_branch((2-offset)/gain,1),sp.Integer(2)]

MANUAL=['Stessi nodi implicano stessa tensione V; le correnti si sommano I=V/R₁+V/R₂. Quindi 1/R_eq=1/R₁+1/R₂ e R_eq=R₁R₂/(R₁+R₂). Con 2,2 Ω risulta 1 Ω, inferiore a ciascun ramo.', 'La resistenza equivalente è in Ω, dimensione V/A. Il reciproco è conduttanza in siemens, che non è la stessa grandezza. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza.', 'Due resistori fra gli stessi nodi hanno la stessa differenza di potenziale orientata con riferimenti concordi. Le correnti valgono V/R₁ e V/R₂ e non sono necessariamente uguali se le resistenze sono diverse; per tensione non nulla sono diverse.', 'A 2,2 Ω dà 1 Ω; B 1,2 Ω dà(1·2)/(1+2)=2/3 Ω. Il totale diminuisce perché cresce la conduttanza del ramo modificato.', 'Da S=R₁R₂/(R₁+R₂): S(R₁+R₂)=R₁R₂ ⇒SR₂=R₁(R₂−S) ⇒R₁=SR₂/(R₂−S). ConS 1, R₂2 Ω:2 Ω. Per valori finiti positivi occorre 0<S<R₂.', 'All’inizio G=1/3+1/6=1/2 Ω⁻¹, quindi I_i=V/2. Aperto solo 3 Ω rimane I_f=V/6. Per tensione imposta non nulla I_f/I_i=(1/6)/(1/2)=1/3. Se V=0 entrambe le correnti sono nulle e il rapporto è 0/0: questa condizione era da precisare nella fonte. Nella candidata finale V>0 è esplicita nel prompt, nel pannello e nella descrizione SVG.', 'A 2,2 Ω dà 1 Ω; B 2,1 Ω dà 2/3 Ω. Rapporto B/A=2/3, non 1/2 che considera solo il ramo modificato.', 'Il corretto è 1 Ω. Proposta 2 Ω meno corretto=+1 Ω; il parallelo di due elementi uguali dimezza il singolo valore.', 'Formula inversa R₁=R_eq R₂/(R₂−R_eq), con 0<R_eq<R₂. Il denominatore positivo garantisce R₁>0; R_eq=R₂ richiederebbe limite di ramo aperto infinito, non un resistore finito.', 'R_eq, B=(κ₁κ₂R₁R₂)/(κ₁R₁+κ₂R₂). Dividendo per R_eq, A dàκ₁κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂). I fattori ugualiκ producono rapportoκ, utile controllo.', 'A=1 Ω. B 3,6 Ω:18/9=2 Ω. Rapporto 2. R_eq, B resta inferiore al minimo 3 Ω.', 'Media delle uscite(1+2)/2=3/2 Ω. Ai dati medi R₁=5/2, R₂=4 Ω si avrebbe 10/(13/2)=20/13 Ω;20/13−3/2=1/26 Ω. Nessuna approssimazione decimale.', 'Bersaglio 2 Ω, R₁, B 3 Ω. Inversa sull’altro ramo: R₂, B=2·3/(3−2)=6 Ω. Rapporto R₂, B/R₂, A=6/2=3. La condizione bersaglio<R₁, B è rispettata.', 'Riferimento 1 Ω con S 3: a=3 Ω⁻¹. S 6 indica R_eq 2 Ω. R₂6 Ω: R₁=2·6/(6−2)=3 Ω.', 'Riferimenti 1 e 2 Ω, letture 3 e 5: a=2 Ω⁻¹, b=1. S_C 2 dà R_eq, C=1/2 Ω. Con R₂, C 1 Ω, inversa R₁=(1/2)·1/(1−1/2)=1 Ω, nel dominio 0<R_eq<R₂.', 'R₁=R₂=x>0 impone R_eq=x/2. Misura 1 Ω⇒x=2 Ω, dunque seconda resistenza 2 Ω e prima 2 Ω. La misura non è ridondante perché fissa la scala.']

DISTRACTORS=['4 Ω è la serie; 2 Ω omette un ramo; 1/2 Ω dimezza ancora il valore. La resistenza equivalente deve essere minore di ciascun ramo positivo finito.', 'S misura la somma delle conduttanze, non la resistenza equivalente; Ω² deriva da un prodotto senza denominatore; A e V misurano altre grandezze.', 'La tensione comune segue dai due nodi condivisi. Correnti e potenze possono differire: a 6 V, rami da 2 e 3 Ω hanno correnti 3 e 2 A e potenze 18 e 12 W.', '3 Ω usa la serie; 1/2 Ω dimezza entrambi i rami; 1 Ω ignora il cambiamento; 3/2 copia il valore numerico della conduttanza finale in S senza prenderne il reciproco.', '1 Ω copia l’equivalente e produce 2/3 Ω; 3 Ω somma invece di sottrarre le conduttanze nella ricostruzione. R_eq=R₂ corrisponderebbe a un ramo sconosciuto aperto, non a una resistenza finita.', '3 è il rapporto delle resistenze equivalenti finali e iniziali, reciproco del rapporto delle correnti; 1/2 presume rami uguali; 2/3 è la quota della corrente iniziale eliminata; 1 ignora l’apertura. La tensione positiva rende definito il rapporto.', '3/2 è il reciproco; 1/2 segue soltanto il ramo modificato; 2 implicherebbe R_eq,B=2 Ω, impossibile con un ramo da 1 Ω; 1 ignora la modifica. G_B/G_A=3/2 e non 2.', '−1 Ω inverte lo scarto; 2 Ω copia la proposta; zero la accetta; 2 senza unità è un rapporto e non la differenza richiesta.', 'Il segno più al denominatore non isola R₁; differenze semplici trattano i resistori come serie; R₂/R_eq è puro e non misura resistenza.', 'Prodotto e quoziente dei soli fattori omettono i pesi; il rapporto delle somme descrive una serie; l’inverso del prodotto non segue la somma delle conduttanze.', '1/2 è il reciproco; 3 segue soltanto R₂; 9/4 confronta le somme; 9/2 confronta i prodotti senza il denominatore del parallelo.', '20/13 Ω applica il modello ai dati medi; 3 Ω non dimezza la somma; 1/2 Ω è metà della differenza; 1 Ω ripete la prima prova.', '1/3 è il reciproco; 2 copia il rapporto dei totali; 6 copia il valore numerico finale di R₂ senza dividerlo per quello iniziale; 3/2 segue soltanto R₁.', 'R₁=6 Ω produce R_eq=3 Ω e lettura 9; R₁=2 Ω produce R_eq=3/2 Ω. Usare la lettura 6 come equivalente rende nullo il denominatore dell’inversa.', '2 Ω produce una lettura 7/3; 1/2 Ω produce 5/3; zero viola la passività; 3 Ω produce 5/2. Solo 1 Ω restituisce la lettura 2.', '1 Ω copia l’equivalente; 1/2 Ω dimezza nel verso errato; −2 Ω viola la passività. La misura del totale fissa la scala dei due rami uguali.']

ASSUMPTIONS=['Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.', 'Resistori ohmici positivi finiti, stessi due nodi e tensione comune, temperature fissate e regime stazionario. Correnti dei rami additive. Inverse con 0<Req<Rnoto. Caso 03 tensione comune necessaria, correnti non necessariamente uguali; caso 06 generatore ideale V>0 costante, soltanto ramo 3 Ωaperto e ramo 6 Ωintegro.']

UNITS={1: 'ohm', 2: 'ohm', 3: 'volt', 4: 'ohm', 5: 'ohm', 6: '', 7: '', 8: 'ohm', 9: 'ohm', 10: '', 11: '', 12: 'ohm', 13: '', 14: 'ohm', 15: 'ohm', 16: 'ohm'}

NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 14: 'Ω'}

SUFFIX={8: ' Ω', 12: ' Ω', 15: ' Ω', 16: ' Ω'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite resistenze positive'}}

SVG_REVIEW='XML finale e rendering nativo indipendente integrale letti. I due rami condividono i nodi (130,230) e (510,230). Nel caso separato, il contatto aperto del 3 Ω segue (180,655)→(220,620), separato dal contatto (240,655); il 6 Ω resta integro. V_AB>0 è dichiarato nel pannello e nella descrizione, rendendo definito il rapporto delle correnti. Le barre 1,2,3/2 Ω sono larghe 160,320,240, con origine 150 e scala comune 160 coordinate/Ω. Gli zeri a x=125 sono separati dagli assi.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

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


CANDIDATE_REF='c5cb085c15bdbadd305ef6295475a04cfed65d23'

PRIMARY_SHA256='e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='888291b226f2050f26f167c7bbbe1282444bf8090bd1fb6038784ba77737d722'

REVIEWED_BINDINGS_SHA256='e048771736cba0e3b0c867a67613c0904d47393f4ddf4d5dee47a3b9df66ffbc'

REVIEWED_CANDIDATES={'AR-u6-two-parallel-resistors-01': '56542ad61d6e147f6224deec983a9a0c43db194b46567c1c4dd16b88d12bf177', 'AR-u6-two-parallel-resistors-02': '120f5b29ca78910f0052f65fe23c1e6f315469c298a66adb3f51bd8464f6ff37', 'AR-u6-two-parallel-resistors-03': '43541a8f529893c479e03376648875726376409294ec3455b76605a01000d59d', 'AR-u6-two-parallel-resistors-04': 'a675fd62fa73f0beb38bf50c32615e19ad673005603cc330fc2e444cf12b7550', 'AR-u6-two-parallel-resistors-05': 'f10cb55d882f350fb71bd26483028efc14ccb0b9618feaf7a249d2e160ae7cc5', 'AR-u6-two-parallel-resistors-06': '22c6a7cf764c779b42de7e1ca60a70636de4561c7bf8b2504ac030c7f76a7b1c', 'AR-u6-two-parallel-resistors-07': '02d5d4e1b0f480d9a4cdc683ebde6c5db1333ad62f0ab18bd249a77ed2a5be65', 'AR-u6-two-parallel-resistors-08': 'ef034ed2d49d042a6ab9ddc26c9089f946fb039fd19adc93f2452c53a0b6a5a4', 'AR-u6-two-parallel-resistors-09': 'b861c4dca925c8787a68f8b4dd39828d728a8e1104a26b34066ffdc337ba0c41', 'AR-u6-two-parallel-resistors-10': 'b5584c194103b9f7c6ee32d35f860b4d00139de1d8223839aa1a8efc9261bf32', 'AR-u6-two-parallel-resistors-11': '766059dfa27232040fff28e7fbeaa8f46d096fc64a33ed1e1ed69114d44aaf77', 'AR-u6-two-parallel-resistors-12': 'ed160f3b1cefaa33dbcb501a2bb2af5e90a2473527de5984fb2280d45a1394cb', 'AR-u6-two-parallel-resistors-13': '96b51cbb2abdd52775abfd292ad97addba920b1031b30c248f5710bed70ed784', 'AR-u6-two-parallel-resistors-14': '94bf21428ad1ade8eaad1b307b3c955c6a46e5862388cb30ad735e276cae4b92', 'AR-u6-two-parallel-resistors-15': 'd38484fa65e2401f761f5628251db1c974036d50ab46ad00676d042c7a72d4ed', 'AR-u6-two-parallel-resistors-16': 'e350699c270963b570eef7998c72140a8de93c953c7ca043b64174fa4145f565'}

READ_SOURCE_SHA256={'u6-two-parallel-resistors-01': '2728a9d31a7d9f47c3ab2ed82a9ce7a56346b1cd08d75525f538863264a4538f', 'u6-two-parallel-resistors-02': 'daa43d73c86300a2811325f1d04db07748bb943ff777446c2ebae7960b462c6d', 'u6-two-parallel-resistors-03': '3f76e7600e6cc6373c56bb2da1a1a108752d0adfaac24c9311bd5b6d6a4dda99', 'u6-two-parallel-resistors-04': '76451bfbef980414eb7c31de9a33cafdcb77cc6b9cf1028b8351ee66ed4156eb', 'u6-two-parallel-resistors-05': '7ccbe7642ad903334e539bef2247744b4f5c2ff6d8a44bafb0a19627a4ce9d81', 'u6-two-parallel-resistors-06': 'c4eff2e689cf695d5a55f5ab50064d567ac2954e8161332fbda88f4c2b9165fb', 'u6-two-parallel-resistors-07': '46062f00400cc6a2773fc05dda13f295d8bfb0dc609f82e3cc5dd37a2e83c1cf', 'u6-two-parallel-resistors-08': '46ad6c04c1193006a52b1a270c5ae59e8a69c1d9bc5ec54476667f393e865ffc', 'u6-two-parallel-resistors-09': '7a7f9868fdfcf47101d2f05cfd2abcd5da656b33e8ba1ccee45daac08f8acb04', 'u6-two-parallel-resistors-10': '22b5528e1a568c033310ac9f55a16e3bb7ed561302eb3b5c4aa1cdfa623f8491', 'u6-two-parallel-resistors-11': 'ed6a1a28c862f2a7d6d9134f019fd3f7258d2fd7da05094633b8b1ea5cea4df8', 'u6-two-parallel-resistors-12': 'f63d25484fed1f5da02c4deecad6e2f99dfea8700567e1400af680c9ae860692', 'u6-two-parallel-resistors-13': '29d847859eb78610613457c4d105167e76cddb85d3828b78300b0716c2ea02c8', 'u6-two-parallel-resistors-14': 'af7fa6d793ead2c7aa31cd42c8e441ec74e82c613f4d90ec14cb8fb34ca2a8ff', 'u6-two-parallel-resistors-15': '858cd2f1e212b887038c8727a4aa1c3f77c6bdac264d490998528258c320e814', 'u6-two-parallel-resistors-16': '76820b638cd1c8ca46f5caa3878a710c5c4a5adf0925ac8712d12b88558e6a8a'}

SOURCE_READING='Tutti gli 80 originali U6-02 B205–209 sono stati letti e derivati da prompt e dati prima di candidati, alternative o chiavi. La primaria e8b27ab5 resta immutata. Successivamente ogni campo di ciascun record finale, tutte le alternative e i cinque SVG XML/native completi sono stati letti separatamente. Le correzioni B sono state rilette prima del congelamento; nessun modulo autore importato. Catalogo reale C4-L05/L06 riletto. UI del prodotto e approvazione umana NOT_RUN. Nessun push o upload durante il vincolo operativo ROOT.'
