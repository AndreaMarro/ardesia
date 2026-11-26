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
FAMILY='net-blackbody-exchange'
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



def net_power(surface,ambient,equilibrium=False):
    surface,ambient=map(sp.sympify,(surface,ambient))
    if ambient<=0 or surface<ambient or (surface==ambient and not equilibrium):raise ValueError('Positive absolute temperatures with hotter surface required')
    return 6*(surface**4-ambient**4)

def surface_inverse(power,ambient):
    power,ambient=map(sp.sympify,(power,ambient))
    if power<=0 or ambient<=0:raise ValueError('Positive net loss and environment temperature required')
    return sp.real_root(power/6+ambient**4,4)

def ambient_inverse(power,surface):
    power,surface=map(sp.sympify,(power,surface))
    if surface<=0 or not 0<power<6*surface**4:raise ValueError('Positive colder environment requires strict emission bound')
    return sp.real_root(surface**4-power/6,4)

@lru_cache(maxsize=1)
def oracle():
    p,v,u,k1,k2=sp.symbols('p v u k1 k2',positive=True)
    unique([(p+v)**sp.Rational(1,4),(p-v)**sp.Rational(1,4),p+v,(v/p)**sp.Rational(1,4),(p/v)**sp.Rational(1,4)],(p+v)**sp.Rational(1,4))
    ratio=(k1**4*u-k2**4*v)/(u-v)
    unique([ratio,k1**4/k2**4,k1/k2,(k1*u-k2*v)/(u-v),k1**4*k2**4],ratio)
    aa,bb=net_power(3,1),net_power(4,2);assert (aa,bb)==(480,1440)
    assert net_power(4,1)==1530 and net_power(3,2)==390
    assert net_power(sp.Rational(7,2),sp.Rational(3,2))==870
    assert net_power(2,2,True)==0 and 6*sp.Integer(2)**4>0
    gain,offset=calibrate(aa,bb,961,2881);assert (gain,offset)==(2,1)
    x=sp.symbols('x',positive=True);roots=sp.solve(sp.Eq(6*((3*x)**4-x**4),480),x);assert roots==[1]
    Q=SI.Quantity;assert (Q(Fraction(6,10**8),'W/m^2/K^4')*Q(1,'m^2')*(Q(300,'K')**4-Q(100,'K')**4)).to('W').magnitude==480
    assert surface_inverse(480,1)==3 and ambient_inverse(480,3)==1
    return [aa,'W','Emissione e assorbimento sono uguali e positivi; il saldo è zero','Da 480 a 1530 W',surface_inverse(aa,1),ambient_inverse(aa,3),net_power(3,2)/aa,960-aa,'θ_s = (p + θ_a⁴)^(1/4)','(κ₁⁴ u − κ₂⁴ v)/(u − v)',bb/aa,(aa+bb)/2,ambient_inverse(3*aa,4),surface_inverse(sp.Rational(4320,3),2),surface_inverse((3061-offset)/gain,1),roots[0]]

MANUAL=['σ·1 m²·(100 K)⁴=6 W. P_net=6(θ_s⁴−θ_a⁴) W. Con 3 e 1: 6(81−1)=480 W, positivi dal corpo caldo al grande ambiente.', 'La differenza fra potenze è una potenza in W, dimensione M L² t⁻³; un’energia J richiederebbe integrazione nel tempo. Nessuna opzione ancora letta. Le alternative candidate sono state poi lette integralmente: unica unità compatibile W.', 'Caso distinto: a T_s=T_a=T>0 emissione e assorbimento sono entrambe σAT⁴>0, uguali. Solo la potenza netta è zero. Equilibrio non significa arresto dei due flussi radiativi.', 'θ_a=1 fissa: θ_s=3 dà 480 W; θ_s=4 dà 6(256−1)=1530 W. Rapporto 1530/480=51/16, non (4/3)⁴ perché si sottrae l’ambiente.', '480/6+1⁴=80+1=81=3⁴. Radice quarta positiva θ_s=3; in generale θ_s=(P_net/(6 W)+θ_a⁴)^(1/4)>θ_a.', 'θ_a⁴=3⁴−480/6=81−80=1. θ_a=1>0. L’inversa richiede 0<P_net<6θ_s⁴ W per conservare ambiente positivo e più freddo.', 'A=6(81−1)=480 W. B con θ_a=2 dà 6(81−16)=390 W. Rapporto 390/480=13/16, diminuendo la cessione netta.', 'Proposta 960 W meno corretto 480 W: +480 W. Il segno dello scarto non è un’inversione del flusso reale.', 'Da P_net/(6 W)=θ_s⁴−θ_a⁴, si aggiunge θ_a⁴ e si estrae la radice quarta positiva. In unità fisiche T_s=[P_net/(σA)+T_a⁴]^(1/4).', 'Rapporto [κ₁⁴θ_s⁴−κ₂⁴θ_a⁴]/[θ_s⁴−θ_a⁴]. Le due prove richiedono θ_s>θ_a>0 e κ₁θ_s>κ₂θ_a>0; il denominatore è positivo. Nel candidato sono esplicitamente definiti u=θ_s,A⁴ e v=θ_a,A⁴.', 'A=480 W. B con θ_s=4, θ_a=2 dà 6(256−16)=1440 W. Rapporto B/A=3.', 'Media (480+1440)/2=960 W. Alle temperature medie θ_s=7/2 e θ_a=3/2: 6(2401−81)/16=870 W, diversa dalla media delle uscite di 90 W.', 'Target 3·480=1440 W a θ_s=4: θ_a⁴=256−1440/6=16=2⁴. θ_a,B=2 e rapporto con 1 pari a 2; ancora 4>2>0.', 'Guadagno da 1440/480=3 W⁻¹. Lettura 4320 dà P=1440 W; con θ_a=2, θ_s⁴=1440/6+16=256=4⁴, θ_s=4.', 'a=(2881−961)/(1440−480)=1920/960=2 W⁻¹; b=1. S_C=3061 dà P_C=1530 W. θ_a=1 implica θ_s⁴=255+1=256, θ_s=4.', 'Vincolo θ_s=3θ_a dà P_net=6(81−1)θ_a⁴=480θ_a⁴ W. A 480 W: θ_a⁴=1, quindi θ_a=1>0 unico e θ_s=3. Caso diverso dall’equilibrio del record03.']

DISTRACTORS=['486 W è sola emissione,6 assorbimento,492 somma dei moduli,0 non rispetta temperature diverse.', 'J è energia, K temperatura, W/m² intensità, J/K altra dimensione.', 'Equilibrio ammette due flussi uguali non nulli; due flussi nulli violano σAT⁴ con T>0.', '1536 W dimentica l’assorbimento6 W; il solo fattore(4/3)⁴ non scala la differenza.', '80 è differenza delle quarte potenze; aggiungere1 dà81 prima della radice.', 'Ambiente positivo richiede0<P<6θ_s⁴ W; uguaglianza darebbe temperatura zero esclusa.', '16/13 è reciproco;1 ignora assorbimento cresciuto;13/16 risulta da390/480.', '−480 inverte differenza;960 copia proposta;0 accetta errore;2 è rapporto senzaW.', 'Si aggiunge θ_a⁴, poi radice quarta; sottrarre ambiente o omettere radice non è inversa.', 'I pesi u,v restano: semplici quozienti dei κ non ricostruiscono la differenza delle emissioni.', '81/16 non è rapporto netto;3 segue1440/480;1/3 è reciproco.', '870 W usa temperature medie;1920 non dimezza;480 e1440 ignorano una prova.', 'Rapporto2 di temperatura ambiente è diverso dal rapporto3 della potenza; il reciproco sbaglia ordine.', 'Display4320/q3=1440 W, poi240+16=256:4⁴. Usare display comeW non dà la misura.', '3061/2 senza b dà1530,5 W e θ⁴=256+1/12;4 predice3061 solo con b=1.', '−1 viola temperatura assoluta;3 e80 non soddisfano θ_a⁴=1; il vincolo non elimina la scala dalla potenza.']

ASSUMPTIONS=['Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Superficie nera di area1 m² mantenuta e grande ambiente nero isotermo con fattore di vista unitario. Coefficiente σ* assegnato e temperature assolute. Nel ramo di cessione T_s>T_a>0; il quesito03 ammette separatamente T_s=T_a>0. Emissione e assorbimento restano simultanei e positivi; p=P_net/(6 W) è puro. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.']

UNITS={1: 'W', 2: 'W', 3: 'W', 4: 'W', 5: '', 6: '', 7: '', 8: 'W', 9: '', 10: '', 11: '', 12: 'W', 13: '', 14: '', 15: '', 16: ''}

NUMERIC_UNITS={1: 'W', 5: '1', 6: '1', 14: '1'}

SUFFIX={8: ' W', 12: ' W'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='XML e PNG nativo integrale letti. Frecce entrante6W e uscente486W schematiche esplicitamente non confrontabili per lunghezza. Barre emissione/assorbimento/netto486/6/480W con larghezze1701/5,21/5,336 a stessa scala7/10; finali480/1440/960W larghezze120/360/240 scala1/4. Origini comuni, zeri chiari. L’equilibrio03 è distinto dalla scena300/100K.'

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite temperature positive'}}

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


CANDIDATE_REF='9a91216d48df3b948e601e9fb06c7c4a70919973'

SOURCE_READING='Primaria indipendente80 prompt-only U5-04 prima di candidati, opzioni o chiavi: SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Shard intero SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Poi lettura individuale completa dei16 candidati, ogni opzione/blocco/formula/hint/feedback/metadato/didascalia, confronto con derivazioni e dati finali; cinque SVG XML e rendering QuickLook integrali realmente letti sotto mutex e guardia2GiB. ROOT byte-identico al pin B finale. Lezioni reali C3-L01/L05/L06/L09/L10 rilette; nessun autore importato, nessuna approvazione da chiavi.'

REVIEWED_PACKAGE_SHA256='910d632ddde6aafda180538285ee2d083729aee4df986b7d344032510995a9e0'

REVIEWED_BINDINGS_SHA256='4caaf0bc44fb8be62eb4b2974c74e7ed053525bd0caf5328707941d76899e3f5'

REVIEWED_CANDIDATES={'AR-u5-net-blackbody-exchange-01': '22c14f19c39131811545dd53fc99183ea93518785efac9c42748a29b54919c85', 'AR-u5-net-blackbody-exchange-02': 'd84149da34f3fa99e2d0167c0a13ca7f6d149810ed8c95aa8e3dcba71135aac0', 'AR-u5-net-blackbody-exchange-03': '13d01686676d9ca2022c38a41a56f9b3d54232cb3efb09147813febe1a129bb1', 'AR-u5-net-blackbody-exchange-04': 'e6c572a66ff73e9c14ce77b3c2066a80a5fff38a83d5740d151d3c79095ecb7a', 'AR-u5-net-blackbody-exchange-05': '9311b33c3176731e60658f8773c1b3b9985e93422a47bd637ee7c8093d283b54', 'AR-u5-net-blackbody-exchange-06': 'd8bd8ad327c389dd412922967fed5370bd825ef0354107b371d3f921349bc7ec', 'AR-u5-net-blackbody-exchange-07': 'e1d2f60e45c709e43f370991c2deab64897bb01441dd069b4d30fb7e489f3195', 'AR-u5-net-blackbody-exchange-08': '1693623c5b8f5a4425cdb98b8865deeb02151e4e135f126fff8633a50c9ff0c0', 'AR-u5-net-blackbody-exchange-09': '2d7e543a361b4a937331a844a27f7389c6480ee3a1a6ac978df2f692fd2611d3', 'AR-u5-net-blackbody-exchange-10': '7e4f5271a5779121de83e783642ad7bce7921d3c64e71d161e95dfbed18ef5fc', 'AR-u5-net-blackbody-exchange-11': '61c1708e2e7cfbb940db61a2dd206fdba2fca29dfdef6c88e5f804e73f25a8cc', 'AR-u5-net-blackbody-exchange-12': 'b89f1e76b96cb552825511e948de57b6bc1fb72058c7bfc2fd0c13d9284ca2c2', 'AR-u5-net-blackbody-exchange-13': 'b2937623e87f955554bd8f18089109888fecdc6d13a96910c5975e59bf428f6a', 'AR-u5-net-blackbody-exchange-14': 'fe493b5d6481b9ca669ecbfbd21f46e97c8b055f5e9ab2f628abf52c0c984268', 'AR-u5-net-blackbody-exchange-15': '978946b231ab9384b4c8e1197c8bebce5a39279ab84ed0f2886361a56bb58522', 'AR-u5-net-blackbody-exchange-16': 'a18a28d4aaf92a564f1bb60703345e6d1a724d7fb54afa4f5f08d55e0cc9134f'}

READ_SOURCE_SHA256={'u5-net-blackbody-exchange-01': 'df38f15e9d2e5fc1b074b0884156b80caddb03e17298f05f2c0b1f98c3b2e4a6', 'u5-net-blackbody-exchange-02': 'f2108abeb44664e723649a834a826662aa2f0254fb62b2337f48e34a365ccf14', 'u5-net-blackbody-exchange-03': 'b926470fbb3fde9a171248646b6ad29849d672f092e416acdfb86b0c4eac066b', 'u5-net-blackbody-exchange-04': 'ef34e10f6ff6ab7662a4c5290faf461c4a29f803abd4202444ed9363d29ac97d', 'u5-net-blackbody-exchange-05': '6f413637e501bf81be747f40006e2fccf6d21a1259d30e72b39ffcc41d42dc2c', 'u5-net-blackbody-exchange-06': '923279538c6f8a79f260c1efb30939bc439be0c9ec8c2cc6a619e5e3a3b3aaf5', 'u5-net-blackbody-exchange-07': '415a0020e5016f3409a5305c2aebe7554f993efee71d60b831b37ad6899d7c2d', 'u5-net-blackbody-exchange-08': '43a3f7705c63470a54b7dabcaa7272bb2cf625eb97840d714daa2522dbc2de98', 'u5-net-blackbody-exchange-09': '4ab4ef5fd73f530f510aeedc6633cb38f1b66dc14bd53f6f721669a33310fdcc', 'u5-net-blackbody-exchange-10': '1a2491b07017d1a1b6c3f3e7009a423623a1ea0c73acb49df1db93e8137691cc', 'u5-net-blackbody-exchange-11': 'f87a0c53d7f469f6baca27c52241fe79a9be3e914480c4ad21e81db766b9c184', 'u5-net-blackbody-exchange-12': 'f757ecb4b335ba57fdbd602eb95bbc63659a0d3297b8d6d9becbae0fa0ca7acc', 'u5-net-blackbody-exchange-13': 'c136ee158a9f6b3bbbaa77a4f347ddfcc400fda9d17a61e6cb54a47d5b53cf46', 'u5-net-blackbody-exchange-14': '0d8654c753e1e8da3b4b1c760cc96af6fe903dd14a6b6e77000920ee4fbe801c', 'u5-net-blackbody-exchange-15': '22cf6bfff33ee1531e5f67f6a1129091b401691475140ec16312a2cc277b0fe1', 'u5-net-blackbody-exchange-16': 'd3f7a72f58c6fd5425050317686a99c9dafe908739214007d63b3692671d299d'}
