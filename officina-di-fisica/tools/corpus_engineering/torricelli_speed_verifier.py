"""Independent full-record fluid review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json'
FAMILY='torricelli-speed'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

def exact_literal(raw):
    """Bounded arithmetic AST for rational and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\()', '*',raw)
    if not re.fullmatch(r'[0-9r()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
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

@lru_cache(maxsize=1)
def oracle():
    g,H,v=sp.symbols('g H v',positive=True)
    law=sp.solve(sp.Eq(g*H,v*v/2),v)[0]
    inverse_g=sp.solve(sp.Eq(v*v,2*g*H),g)[0]
    inverse_H=sp.solve(sp.Eq(v*v,2*g*H),H)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({g:k*g,H:l*H})/law)
    if sp.simplify(law-sp.sqrt(2*g*H))!=0 or ratio!=sp.sqrt(k*l):raise ValueError('Independent Torricelli energy/root scaling failed')
    for opts,want in [([sp.sqrt(2*g*H),2*g*H,sp.sqrt(g*H),sp.sqrt(2*g/H),-sp.sqrt(2*g*H)],law),
                      ([v*v/(2*H),v/(2*H),2*v*v/H,H/(2*v*v),v*v*H/2],inverse_g),
                      ([sp.sqrt(k*l),k*l,k/l,sp.sqrt(k/l),k+l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Torricelli speed symbolic alternatives not unique')
    F=lambda field,head:law.subs({g:field,H:head})
    A,B=F(10,5),F(2,20)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,21),sp.Eq(q*B+z,1+8*sp.sqrt(5))],(q,z))
    C=sp.simplify((1+4*sp.sqrt(5)-cal[z])/cal[q])
    if tuple(sp.simplify(t) for t in (cal[q],cal[z],C))!=(2,1,2*sp.sqrt(5)):raise ValueError('Torricelli exact radical affine calibration failed')
    mean=sp.simplify((A+B)/2)
    if mean!=5+2*sp.sqrt(5) or sp.simplify(mean-F(6,sp.Rational(25,2)))==0:raise ValueError('Torricelli speed nonlinear mean distinction failed')
    if not (5<sp.Rational(5,2)**2 and 6>4):raise ValueError('Manual no-decimal radical bound failed')
    x=sp.Symbol('x',real=True);roots=sp.solve(sp.Eq(100,4*x*x),x)
    if roots!=[-5,5]:raise ValueError('Torricelli constrained head branches failed')
    u=SI.Quantity
    square=(2*u(10,'m/s**2')*u(5,'m')).to('m**2/s**2')
    square_b=(2*u(2,'m/s**2')*u(20,'m')).to('m**2/s**2')
    inferred=(u(80,'m**2/s**2')/(2*u(20,'m'))).to('m/s**2')
    gain=(u(30,'')/u(10,'m/s')).to('s/m')
    constrained_square=(u(10,'m/s')**2/(2*u(2,'1/s**2'))).to('m**2')
    if (square.magnitude,square_b.magnitude,inferred.magnitude,gain.magnitude,constrained_square.magnitude)!=(100,80,2,3,25):raise ValueError('Pint Fraction Torricelli speed units failed')
    return [A,'m/s','v = √(2gH)','Da10 a2√5 m/s',inverse_g.subs({v:10,H:5}),inverse_H.subs({v:10,g:10}),F(10,20)/A,20-A,'g = v²/(2H)','√(κ₁ κ₂)',sp.simplify(B/A),mean,sp.Integer(4),inverse_g.subs({v:4*sp.sqrt(5),H:20}),inverse_g.subs({v:C,H:5}),roots[1]]


MANUAL=['Con pressioni uguali, superficie quasi ferma e battente H, Bernoulli dà gH=v²/2. 2·10·5=100 m²/s², radice positiva 10 m/s.', 'gH ha dimensione L²/T² e la radice restituisce L/T. La scelta m/s non richiede una decimalizzazione o un calcolo numerico autonomo.', 'Dalla stessa energia per massa gH=v²/2 si ricava v=√(2gH). Il ramo positivo è il modulo di uscita; velocità superficiale e perdite sono trascurate esplicitamente.', 'Con g ridotta da 10 a 2 m/s² e H=5 m, v² passa da 100 a 20. Scomporre 20=4·5 dà v_B=2√5 m/s, esatto e minore di 10.', 'g=v²/(2H)=100/(2·5)=10 m/s². L’inversa è lineare in g, non produce due gravità.', 'H=v²/(2g)=100/(2·10)=5 m. È un battente verticale, non una quota del foro sul suolo.', 'A g=10 fisso, H da 5 a 20 m quadruplica v²; velocità 10 e 20 m/s, rapporto 2.', 'Corretto 10 m/s, proposta 20: scarto +10 m/s. La proposta avrebbe v²/2=200 m²/s² contro i 50 disponibili dal battente.', 'Quadrare v=√(2gH), con v>0 e g,H>0, dà v²=2gH. Dividere per 2H isola g=v²/(2H).', 'Le scalature g_B=κ₁g_A, H_B=κ₂H_A moltiplicano v² per κ₁κ₂. Il rapporto dei moduli positivi è √(κ₁κ₂).', 'B ha v²=2·2·20=80 m²/s², quindi v_B=4√5 m/s. Rapporto a 10 m/s: 2√5/5; quadrato 4/5<1.', 'Media (10+4√5)/2=5+2√5 m/s. È minore di 10 perché √5<5/2; gli ingressi medi darebbero 5√6>10. Entrambi i confronti si provano quadrando numeri positivi: 20<25 e 6>4.', 'Target (2√5/5)·10=4√5 m/s; quadrato 80. Con g_B=2 m/s², H_B=80/4=20 m, rapporto 20/5=4.', 'q=30/(10 m/s)=3 s/m. S_B=12√5 significa v_B=4√5 m/s; v_B²=80, H=20 m→g_B=2 m/s².', 'Differenze dei riferimenti: ΔS=2(4√5−10), Δv=(4√5−10) m/s, fattore non nullo perché 80≠100. q=2 s/m, offset 1. S_C=1+4√5→v_C=2√5, v_C²=20; H=5 m→g_C=2 m/s².', 'Vincolo g=cH, c=2 s⁻²: v²=2cH². 100/(4 s⁻²)=25 m². Rami ±5 m; H=5 m dà g=10 m/s² ed è l’unico ramo con entrambi positivi.']
DISTRACTORS=['100 è v² nelle unità del quadrato; 20 raddoppia dopo la radice. La velocità 10 non è costante durante uno svuotamento con H variabile.', 'm²/s² è v², m lunghezza, s tempo e Pa pressione; non si conserva l’unità di g dopo prodotto e radice.', '2gH è v², √(gH) perde 2, √(2g/H) ha unità s⁻¹; il meno non è un modulo.', '2 applica linearmente il fattore 1/5; 50 lo inverte; 10 ignora g nuova e 20 cresce quando g diminuisce.', 'v/(2H) è s⁻¹; dimenticare il 2 darebbe 20 m/s², non 10.', '10 m omette il 2. Altezza del suolo non assegnata e non necessaria per la velocità di efflusso.', '4 riguarda v²; 1/2 e 1/4 invertono; 20 è la velocità B numerica, non rapporto.', '−10 ordine invertito; 20 proposta; 0 accetta; 5 dimezza lo scarto. Pressione comune non aggiunge energia differenziale.', 'v/(2H) dimensione errata; 2v²/H fattore quattro; H/(2v²) inverso di accelerazione; v²H/2 ha due potenze di lunghezza extra.', 'Prodotto senza radice è rapporto di v²; quozienti invertono H; somma vale 2 per stati identici.', '4/5 rapporto dei quadrati; √5/5 solo g; 2 solo H; 5/(2√5) è reciproco. Nessuna equivalenza esatta fra le opzioni.', '10+4√5 somma; ulteriore metà sbagliata; 5√6 ingressi medi; 2√5/5 rapporto invece di velocità media.', '2 segue la radice del rapporto di H; 1/4 reciproco; 4/5 rapporto di v²; 20 valore H_B numerico.', 'S_B scambiata per velocità darebbe v² nove volte maggiore e g=18 m/s². Rimuovere q prima del quadrato.', 'g=10,4,1,8 m/s² a H=5 darebbero S=21,1+4√10,1+2√10,1+8√5. Nessuna coincide con 1+4√5.', '25 è H², non H. Ramo negativo viola sia H>0 sia g=cH>0; il vincolo è fra prove, non durante lo svuotamento.']
ASSUMPTIONS=['Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.', 'Grande serbatoio rigido, liquido omogeneo incomprimibile, piccolo foro. Fotografia istantanea quasi stazionaria, velocità superficiale trascurata nel modello; stessa pressione assoluta esterna ai due punti, fase liquida compatibile, gravità uniforme positiva. Nessuna macchina o perdita lungo la stessa linea di corrente. H>0 è il battente e v>0 il modulo. I vincoli sono fra apparati.']
UNITS={1: 'm/s', 2: 'm/s', 3: 'm/s', 4: 'm/s', 5: 'm/s**2', 6: 'm', 7: '', 8: 'm/s', 9: 'm/s**2', 10: '', 11: '', 12: 'm/s', 13: '', 14: 'm/s**2', 15: 'm/s**2', 16: 'm'}
NUMERIC_UNITS={1: 'm/s', 5: 'm/s²', 6: 'm', 14: 'm/s²', 16: 'm'}
SUFFIX={8: ' m/s', 12: ' m/s', 15: ' m/s²'}
SVG_REVIEW='XML e rendering completo letti. Superficie y=180 e foro y=380: 200 px a 40 px/m per H=5 m. Freccia 100 px a 10 px/(m/s) per v=10 m/s. Barre separate gH e v²/2 entrambe lunghe 200 px a 4 px/(m²/s²), energia per massa 50. Nel confronto a g=10 m/s², battenti 5 e 20 m danno frecce separate di 100 e 200 px per 10 e 20 m/s. Scale di quota, velocità ed energia specifica distinte; niente extrapolazione temporale a H fisso.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u3-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_Bernoulli_continuity_or_ballistic_motion','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='c6894b2364ba4a7e64cac209d1f1ec6191ec551a'
SOURCE_READING='All 80 original U3-03 prompts in these five families individually read and solved before opening candidate packages. Disclosure: prior author handoff already exposed 104-06 equal ranges and doubled A speed, plus qualitative information about radicals, a quartic and renamed h/H. These facts independently rederived from source models; no claim of wholly blind key reading for 104-06. All 16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing. Never imports candidate authoring; real C2-L005/L006 lessons reread.'
REVIEWED_PACKAGE_SHA256='9ce671f3e1e1afc00bb9c15cfe51908ac7d50ea3e11c58eb01dc7cf412e1268c'
REVIEWED_BINDINGS_SHA256='f51b5a74db038579c5f722ceccfdc47d41f984bc3f0edca02c369391cbd84518'
REVIEWED_CANDIDATES={'AR-u3-torricelli-speed-01': 'b439ce6188e3e8df02cd7962a35042b6872191765fbd0d5c2c01777a5d50a460', 'AR-u3-torricelli-speed-02': '9e3a82ec7be0857731e4e173e28e0b10ac52e8148a6747dd77d5e5cf6e5d78a6', 'AR-u3-torricelli-speed-03': '4b87ec9b9af02ccdf23cd2556c623f98282177d357a0a52fe431dd99c864840a', 'AR-u3-torricelli-speed-04': '01e631d10ffd5925323bd6dfe1b1835098c9c3ef45b10ba40bc2ef1022b66e04', 'AR-u3-torricelli-speed-05': 'a9dda57bbec4442c232afdab0ef87f24f9c8ba8ec5a7a3d56068dd6197030748', 'AR-u3-torricelli-speed-06': 'ae7c79dd2845b8d32a4e93ef43a994b97bdc6dbc685f9c9c50dabe5d9a5064e5', 'AR-u3-torricelli-speed-07': '7637eeda90722d53fcd1c9f5eacdffdb8ca4bdc0377d6e4efea4deb70d01420f', 'AR-u3-torricelli-speed-08': 'af907e32bf829930a21e554bb4da633ffb05b2bc49bfbde56f77de7d813b0bfd', 'AR-u3-torricelli-speed-09': '70744205c681ad0214418cc34f87f48de9a45fdcf34ef792f0d36c537a0ee499', 'AR-u3-torricelli-speed-10': 'db456f01bd4327a9cd78d7d43bad1bd27cb6c1acfca47c50de5fb62b0a1be9eb', 'AR-u3-torricelli-speed-11': 'bdb812eb569252f67bd4da4de7ae8f4ccde304aa06193ee5952deb747851f54d', 'AR-u3-torricelli-speed-12': 'cf8841cecfda034e604d7b8f3025e408de7e4a23af67e9ffaf050bc407835d81', 'AR-u3-torricelli-speed-13': '9958982936438b25cd818ae6f6cf911165d887427dec59bf0ad9cab2bfe05e3b', 'AR-u3-torricelli-speed-14': '15cced3ec33720f21499479aaede6dcf88c58fafdfcc60a5003809fe83d02df6', 'AR-u3-torricelli-speed-15': 'd33afe56b6df142dc0c572a6128e7bd427b8cda49a0062362ef0fd0f5a60123e', 'AR-u3-torricelli-speed-16': 'e7beabd28e8d403be449513986f5f2abd532300b99b1c18de400021931e47f68'}
READ_SOURCE_SHA256={'u3-torricelli-speed-01': 'c02e46b9b5583e16a6e508da417e7dc02784dc31e18cb2250a9ec488422b7cd5', 'u3-torricelli-speed-02': '68ec4a8ba772ec0073d0601a37ece1bcdce65dd1062c0f016deab4cdcffa6112', 'u3-torricelli-speed-03': '6ad59f1ee08227111b8702512df97e3a83a0c414e04198a398dcad3ba0dd17a7', 'u3-torricelli-speed-04': 'ace6081165889f6a0db8e9f1bb36797e7534c52b05141024e03e7e442960c708', 'u3-torricelli-speed-05': 'f8759a670fb1aa3e3e92ad3b625b3806cfead1c77f3b80a01ebbaa0d03822bfe', 'u3-torricelli-speed-06': '2bbbc30b9822ac88218ae4e654b464333dc686c2f36f5afb21daefed8899adea', 'u3-torricelli-speed-07': '3ef9b7559942e26a5c5bdd0dea04914ac9ca5a954f9b85d626e08e02e3f6d290', 'u3-torricelli-speed-08': '461d2191977bd47f095292d7fe4cf47c93b28fc5f209948e14a8bdf35888e1f3', 'u3-torricelli-speed-09': 'bcb782c8f4a57ec0a9e65d567202dbf7b4671aa1fba429faf45368e7ecd2980a', 'u3-torricelli-speed-10': 'f4c91c674d477c481ff9569e3490beede1c7bad365524fb9faca7afa659a5f25', 'u3-torricelli-speed-11': 'f14c6d4729747b1cb9a7c92dc549bbfb0f181421bbd07b88dcb59aef2b88db2d', 'u3-torricelli-speed-12': '3fb8a856e35e72c87e9c53849ee18b8488c5a066abdff1e4d8ee8320c12c2bd4', 'u3-torricelli-speed-13': '16ebea1de3ffd7716f2dde4fd19a3c13e20798b95879559526ef52a93651845e', 'u3-torricelli-speed-14': '20c4d41cb2441f4131d53c3bc722f3a39e8601c8d17c46924e522ebce5e30985', 'u3-torricelli-speed-15': '125dff3d200fc7349d996e758b7921d59a277f29e3517aad19f456eb40e9754d', 'u3-torricelli-speed-16': '6fc61020dc13784b89397a77d91ed2cde82617f81af3da855878d88cf233679c'}
