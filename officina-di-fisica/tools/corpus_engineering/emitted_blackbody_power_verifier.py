"""Independent source-first U5-04 thermal and entropy review; no candidate authoring imports."""
from fractions import Fraction
import ast,re
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json'
FAMILY='emitted-blackbody-power'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L05' for n in range(1,17)}
def exact_literal(raw):
    """Bounded arithmetic AST for rational, pi and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=raw.replace('π','p')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\(|p)', '*',raw)
    if not re.fullmatch(r'[0-9rp()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Name) and node.id=='p':return sp.pi
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
        if isinstance(node,ast.Constant) and type(node.value) is float and len(str(node.value))<=16:
            return sp.Rational(str(node.value))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('unsupported arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('nonreal numeric result')
    return value


def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]



def emission(area,theta):
    area,theta=map(sp.sympify,(area,theta))
    if area<=0 or theta<=0:raise ValueError('Positive area and absolute temperature required')
    return sp.Rational(3,5)*area*theta**4

def theta_inverse(power,area):
    power,area=map(sp.sympify,(power,area))
    if power<=0 or area<=0:raise ValueError('Positive emission and area required')
    return sp.real_root(5*power/(3*area),4)

@lru_cache(maxsize=1)
def oracle():
    area,t,p,k1,k2=sp.symbols('area t p k1 k2',positive=True)
    law=sp.Rational(3,5)*area*t**4
    unique([law,sp.Rational(3,5)*area*t,sp.Rational(3,5)*area*t**2,sp.Rational(3,5)*t**4/area,sp.Rational(3,5)*area/t**4],law)
    unique([(5*p/(3*area))**sp.Rational(1,4),5*p/(3*area),(3*area/(5*p))**sp.Rational(1,4),(p/area)**sp.Rational(1,4),p/(3*area)],(5*p/(3*area))**sp.Rational(1,4))
    ratio=sp.cancel(law.subs({t:k1*t,area:k2*area})/law)
    unique([k1**4*k2,k1*k2,k1**2*k2,k1**4/k2,k2/k1**4],ratio)
    Q=SI.Quantity
    physical=(Q(Fraction(6,10**8),'W/m^2/K^4')*Q(5,'cm^2')*Q(200,'K')**4).to('mW').magnitude
    assert physical==48 and SI.Quantity(1,'cm^2').to('m^2').magnitude==Fraction(1,10000)
    AA,BB=emission(5,2),emission(10,3);assert (AA,BB)==(48,486)
    gain,offset=calibrate(AA,BB,97,973);assert (gain,offset)==(2,1)
    assert emission(sp.Rational(15,2),sp.Rational(5,2))==sp.Rational(5625,32)
    z=sp.symbols('z',positive=True);positive=sp.solve(sp.Eq(sp.Rational(3,5)*z*(sp.Rational(2,5)*z)**4,48),z);assert positive==[5]
    assert theta_inverse(AA,5)==2 and theta_inverse((487-offset)/gain,5)==3
    return [AA,'mW','p = (3/5) a θ⁴','Da 48 a 243 mW',theta_inverse(AA,5),AA/(sp.Rational(3,5)*2**4),emission(10,2)/AA,96-AA,'θ = [5p/(3a)]^(1/4)','κ₁⁴ κ₂',BB/AA,(AA+BB)/2,(sp.Rational(81,8)*AA/(sp.Rational(3,5)*3**4))/5,theta_inverse(sp.Rational(1458,3),10),theta_inverse((487-offset)/gain,5),positive[0]]

MANUAL=['Conversioni: A[cm²]·10⁻⁴ m² e T=100θ K. σAT⁴ in W ha coefficiente 6·10⁻⁸·10⁻⁴·10⁸=6·10⁻⁴; in mW è (3/5)Aθ⁴. θ=2, A=5: P=3·16=48 mW. È emissione, non differenza con ambiente.', 'Potenza ha dimensione M L² t⁻³: W o un suo prefisso è compatibile; mW è la scala chiesta. Senza leggere le opzioni non si sceglie una lettera. Le alternative candidate sono state poi lette integralmente: unica unità compatibile mW.', 'Formula numerica nelle unità dichiarate: P_em[mW]=(3/5)A[cm²]θ⁴. La formula fisica resta σA(100θ K)⁴. θ è puro, A fisica in m² dopo conversione; nessuna temperatura Celsius nella quarta potenza.', 'A=5 cm² fissa: θ=2 dà 48 mW, θ=3 dà 3·81=243 mW. Rapporto 81/16. Non è un aumento lineare o quadratico.', '48=(3/5)·5·θ⁴ implica θ⁴=16. Si riconosce 16=2⁴ e si sceglie θ=2>0, quindi T=200 K. Radice negativa esclusa dalla temperatura assoluta positiva.', '48=(3/5)A·16; A=48·5/48=5 cm². I fattori di conversione sono già nel coefficiente numerico.', 'θ=2 costante: P proporzionale ad A. Passare da 5 a 10 cm² dà 48→96 mW e rapporto B/A=2.', 'Valore corretto 48 mW; proposta 96 mW. Scarto proposta meno corretto +48 mW, senza cambiare la convenzione della potenza emessa.', 'θ⁴=5 P_em[mW]/(3 A[cm²]); θ è la radice quarta positiva. In forma fisica T=(P/(σA))^(1/4), poi θ=T/(100 K). Richiesti A>0 e P>0.', 'P_B/P_A=(κ₁θ)⁴κ₂A/(θ⁴A)=κ₁⁴κ₂. Quarta potenza soltanto sul fattore di temperatura; area al primo grado.', 'A=48 mW; B=(3/5)·10·3⁴=6·81=486 mW. Rapporto 486/48=81/8. Entrambi i cambiamenti sono inclusi.', 'Media delle letture (48+486)/2=267 mW. Il modello sugli ingressi medi θ=5/2, A=15/2 darebbe (9/2)(625/16)=5625/32 mW, non la media delle uscite.', 'Bersaglio (81/8)·48=486 mW. A θ_B=3, ogni cm² contribuisce 243/5 mW; serve A_B=10 cm² e rapporto con A_A=5 pari a 2.', 'S_A=144 su P_A=48 mW dà guadagno 3 mW⁻¹. S_B=1458 implica P_B=486 mW. A_B=10 cm²: θ_B⁴=486/6=81=3⁴, quindi θ_B=3.', 'Riferimenti 48 e 486 mW, letture 97 e 973: a=(973−97)/(486−48)=876/438=2 mW⁻¹, b=1. S_C=487 dà P_C=243 mW. A_C=5 cm²: θ_C⁴=243/3=81, θ_C=3.', 'Fra preparazioni θ=(2/5)A nei numeri in cm²; il coefficiente fisico è (2/5) cm⁻². Sostituendo: P=(48/3125)A⁵ mW=48 mW. Quindi A⁵=3125=5⁵: A=5 cm² unico ramo positivo, θ=2. La legge è monotona per A>0; non è una massa o temperatura che varia durante il processo.']

DISTRACTORS=['3 mW isola il coefficiente a θ=1; 12 mW usa θ²; 96 mW duplica l’area; 48000 scambia W e mW.', 'mJ è energia, K temperatura, W/m² intensità e J/K entropia/capacità; solo mW è potenza.', 'Le altre leggi usano θ o θ², rendono inversa l’area o la temperatura. Solo la quarta potenza segue σAT⁴.', 'Il fattore corretto è81/16. Una variazione lineare o quadratica di θ non ricostruisce243 mW.', '16 è θ⁴, non θ; il ramo−2 viola T>0.', 'L’inversa deve dividere per (3/5)θ⁴; omettere la conversione cambia la scala dell’area.', '1/2 è reciproco;4 introduce un quadrato nell’area;1 ignora il raddoppio.', '−48 inverte lo scarto;96 copia la proposta;0 la accetta;2 è rapporto puro.', 'La radice è quarta e positiva; il reciproco, l’assenza di radice e il coefficiente omesso non invertono la legge.', 'Solo κ₁ è elevato alla quarta; area è lineare. Quozienti e quadrati alterano una dipendenza.', '81/16 segue solo temperatura;2 segue area;8/81 inverte tutto il confronto.', '5625/32 mW usa ingressi medi;534 omette la metà;48 e486 ignorano una prova.', '81/8 è fattore della potenza, non dell’area a temperatura cambiata;1/2 capovolge il rapporto.', 'Ignorare q porta θ⁴=243; usare l’area A al posto di B porta162, nessuno uguale81.', 'Omettere b dà θ⁴=487/6, non81; la radice3 predice487 solo con b=1.', '−5 viola area positiva;25 e2 non danno a⁵=3125; a>0 rende la quinta potenza monotona.']

ASSUMPTIONS=['Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera ideale di area positiva, temperatura assoluta T>0; σ*=6×10⁻⁸ W/(m² K⁴) è approssimazione di modello prescritta. Si cerca solo emissione totale, non scambio netto con ambiente. θ=T/(100 K), a=A/(1 cm²), p=P/(1 mW) sono puri. Nessuna legge di raffreddamento implicita. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.']

UNITS={1: 'mW', 2: 'mW', 3: 'mW', 4: 'mW', 5: '', 6: 'cm^2', 7: '', 8: 'mW', 9: '', 10: '', 11: '', 12: 'mW', 13: '', 14: '', 15: '', 16: 'cm^2'}

NUMERIC_UNITS={1: 'mW', 5: '1', 6: 'cm²', 14: '1'}

SUFFIX={8: ' mW', 12: ' mW', 16: ' cm²'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='XML e PNG nativo integrale letti. Frecce di emissione schematiche separate con punte visibili. Barre centrali3/48/243 mW con larghezze9/2,72,729/2 a origine comune; rapporto1:16:81. Barre finali48/486/267 mW con larghezze36,729/2,801/4. Scale intrinseche3/2 e3/4 coordinate/mW, ciascun pannello coerente. Zeri separati dagli assi; nessun pixel fisico dichiarato dopo resize.'

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite aree positive'}}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u5-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C3' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
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
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='1f06ede324e1aa8c7c2022429ad6a4fe491a668c'

SOURCE_READING='Primaria indipendente80 prompt-only U5-04 prima di candidati, opzioni o chiavi: SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Shard intero SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Poi lettura individuale completa dei16 candidati, ogni opzione/blocco/formula/hint/feedback/metadato/didascalia, confronto con derivazioni e dati finali; cinque SVG XML e rendering QuickLook integrali realmente letti sotto mutex e guardia2GiB. ROOT byte-identico al pin B finale. Lezioni reali C3-L01/L05/L06/L09/L10 rilette; nessun autore importato, nessuna approvazione da chiavi.'

REVIEWED_PACKAGE_SHA256='dbc3093d49bec30cf2c62804016dbfed918df96bca4fc1b8e54bdb86741cb45c'

REVIEWED_BINDINGS_SHA256='6bdab47cea1611e3f025bf10b4c509eafb42148771855ebf562b7e277b4da461'

REVIEWED_CANDIDATES={'AR-u5-emitted-blackbody-power-01': 'f7df32b938fee694bae531cc474604f647e4a08f0f71acf2b16f40aa0ca6283f', 'AR-u5-emitted-blackbody-power-02': '9cce952c4135997164ccb9363fddbfce5efc4bac96d9d07ef4654483c836de53', 'AR-u5-emitted-blackbody-power-03': '1587773a52a400be73744db41642cf13fb6561031141fa5f91c8729d371fcc10', 'AR-u5-emitted-blackbody-power-04': '80ce64419175b703865be90b89939e5ccb1fb2d56025e0858dbcb15ae1c36f33', 'AR-u5-emitted-blackbody-power-05': 'cd5fbecfee7cc3e56dcee858b087702892dd9da758e5464d0f9e069c30b7dfb0', 'AR-u5-emitted-blackbody-power-06': '9a2d43ee1ba560c8fe9d2904e9848707814cd713e229b5f1221794a243880a02', 'AR-u5-emitted-blackbody-power-07': '0e2a80cbfaca456600f9aa808043fddfb59f91a9a0f1b40c0e083afb7afea089', 'AR-u5-emitted-blackbody-power-08': 'd9d68f4765784449147e4fd18bf8ea415d3de8781b9322c830174d4ea94f0935', 'AR-u5-emitted-blackbody-power-09': '572027cf6c9b2ebbdfb287b07d2548ef399977fbaea15e672d0509efadb69097', 'AR-u5-emitted-blackbody-power-10': '09dc89b362c5f5b1d86974b57f290c801b35f8f1ef8e2ffdc82368e500949af1', 'AR-u5-emitted-blackbody-power-11': '484030ed95a2bc718be59278d514381eae06fdbed891da64e938f145f563026f', 'AR-u5-emitted-blackbody-power-12': 'e8b1e04052ec706aa8a0a4a838da00fb65b30c201c344fd0f68a458b7ea5e17d', 'AR-u5-emitted-blackbody-power-13': '89cbe586a12b6f094ce600cbe823d9b753b0c6a9790441513e65c7113ad04ac9', 'AR-u5-emitted-blackbody-power-14': 'de5b308b47bf84c26ee1721cd8d5d9184511ff812187b2408f85804306939768', 'AR-u5-emitted-blackbody-power-15': 'd708a2bad8f2171d6a14f8c38ee3ff47328960a04e14a0de69a158306a7b5cd9', 'AR-u5-emitted-blackbody-power-16': '54df3ee2d2e7870d8fc6867915ddbfd291c8cebc265f93b66530099ac8aae7fb'}

READ_SOURCE_SHA256={'u5-emitted-blackbody-power-01': '5f52557fef0221052f4444839b60408b5f3a35dd380ba4646f06b6e0044324b4', 'u5-emitted-blackbody-power-02': '9269b18c06446b0cf70c3dec6291d98f6b4111f6b67b358e52e119523cddef04', 'u5-emitted-blackbody-power-03': 'a88efa196942137acc39ef30f328ead28b7263dae50a3cee91ca0209d6108c14', 'u5-emitted-blackbody-power-04': 'd41aa69865754aaa7990cb2635f4c972bddaa57fee754eb765214ec167bce64e', 'u5-emitted-blackbody-power-05': 'ea063564a98d58afb2071d8fe9ef30ab3ff6ac69721343759413e669386992b9', 'u5-emitted-blackbody-power-06': '89a02e17f03b8c8d5d7fa754d66bdf1490f961e458dee84762716963a172d50c', 'u5-emitted-blackbody-power-07': 'a3b249d44a27539cf6d4d35ba5b46221abcf4ff688f025a2c80daaf26686fbb3', 'u5-emitted-blackbody-power-08': '322002b9b5b0a4d28804cb0a258cedca615886374afeb9298832bc63746235c6', 'u5-emitted-blackbody-power-09': '268088845384ed207ac3d59de711d06d8d6978bb48ea0d1ce137db791f8268be', 'u5-emitted-blackbody-power-10': '976b1a40dbeed7d55217ec7138d83e78eebcf125881315ed7c3e858c71361c6a', 'u5-emitted-blackbody-power-11': '324f6d16ed799c230f4b93a79f082430b84b2d72ef513af0d554b8d40ddb51fd', 'u5-emitted-blackbody-power-12': 'a0df792bc04e5c5b72f8d8f25213e21ecb7607731038f65010e42c6073c187b9', 'u5-emitted-blackbody-power-13': 'ab7156a907c647f7e5984fa652d4cd544f49e6743625fd3b341c5fed161c93b7', 'u5-emitted-blackbody-power-14': '0ce43c422fa43752aa7f2f57c96be0e3339986fb9efa83039cbb241495085c79', 'u5-emitted-blackbody-power-15': '712c385d43afebfa4992ebacb87125fd658dadbebe1ffb17b3db95e3c40ec227', 'u5-emitted-blackbody-power-16': 'c3c05c5b6d61998928079b7766e9d635fd54f335e0e7d475bc48ef018bcd0d0a'}
