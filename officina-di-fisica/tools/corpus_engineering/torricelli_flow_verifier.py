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
FAMILY='torricelli-flow'
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
    A,g,H,v,Q=sp.symbols('A g H v Q',positive=True)
    speed=sp.solve(sp.Eq(g*H,v*v/2),v)[0]
    law=A*speed
    inverse=sp.solve(sp.Eq(Q,law),A)[0]
    inverse_H=sp.solve(sp.Eq(Q*Q,2*g*H*A*A),H)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({A:k*A,H:l*H})/law)
    for opts,want in [([A*sp.sqrt(2*g*H),sp.sqrt(2*g*H)/A,A*2*g*H,A*sp.sqrt(g*H),2*A*sp.sqrt(2*g*H)],law),
                      ([Q/sp.sqrt(2*g*H),Q*sp.sqrt(2*g*H),sp.sqrt(2*g*H)/Q,Q/(2*g*H),2*Q/sp.sqrt(2*g*H)],inverse),
                      ([k*sp.sqrt(l),k*l,sp.sqrt(k*l),k/sp.sqrt(l),k*k*sp.sqrt(l)],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Torricelli flow alternatives not unique as general laws')
    # The exact unit conversion mm²*m/s -> mL/s is one, checked below with Pint.
    F=lambda area,head:law.subs({A:area,g:10,H:head})
    first,second=F(1,5),F(2,20)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*first+z,21),sp.Eq(q*second+z,81)],(q,z))
    C=(41-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,20):raise ValueError('Torricelli flow exact affine calibration failed')
    mean=(first+second)/2
    mean_inputs=F(sp.Rational(3,2),sp.Rational(25,2))
    if mean!=25 or sp.simplify(mean_inputs**2)!=sp.Rational(1125,2) or mean**2==mean_inputs**2:raise ValueError('Flow nonlinear mean square comparison failed')
    x=sp.Symbol('x',positive=True);roots=sp.solve(sp.Eq(100,sp.Rational(4,5)*x**3),x)
    if roots!=[5] or F(1,roots[0])!=10:raise ValueError('Flow constrained cubic positive root failed')
    u=SI.Quantity
    unit_conversion=(u(1,'mm**2')*u(1,'m/s')).to('mL/s')
    flow=(u(1,'mm**2')*u(10,'m/s')).to('mL/s')
    area=(u(40,'mL/s')/u(20,'m/s')).to('mm**2')
    gain=(u(30,'')/flow).to('s/mL')
    coefficient=u(Fraction(1,5),'mm**2/m')
    cube=(u(10,'mL/s')**2/(coefficient**2*2*u(10,'m/s**2'))).to('m**3')
    if (unit_conversion.magnitude,flow.magnitude,area.magnitude,gain.magnitude,cube.magnitude)!=(1,10,2,3,125):raise ValueError('Pint Fraction mm²/mL/cubic dimensions failed')
    return [first,'mL/s','Q = A√(2gH)','Da10 a20 mL/s',inverse.subs({Q:10,g:10,H:5}),inverse_H.subs({Q:10,g:10,A:1}),F(1,20)/first,20-first,'A = Q/√(2gH)','κ₁√κ₂',second/first,mean,sp.Integer(4),inverse.subs({Q:40,g:10,H:20}),inverse.subs({Q:C,g:10,H:5}),roots[0]]


MANUAL=['Torricelli: v²=2·10·5=100 m²/s², v=10 m/s. A=1 mm²=10⁻⁶ m² dà Q=10·10⁻⁶ m³/s=10 mL/s.', 'Q=Av ha dimensioni L³/T. Conversione esatta: 1 mm²·1 m/s=10⁻⁶ m³/s=1 mL/s. Riconoscere mL/s non richiede un calcolo numerico autonomo.', 'Il modello dà v=√(2gH), uniforme nel foro. Con coefficiente ideale unitario e contrazione esclusa, il flusso volumetrico è Q=A√(2gH).', 'A da 1 a 2 mm² a H=5 m: v resta 10 m/s e Q da 10 a 20 mL/s. Si scala l’area assegnata, non un raggio.', 'A=Q/v. Q=10·10⁻⁶ m³/s e v=10 m/s danno A=10⁻⁶ m²=1 mm².', 'v=Q/A=10 m/s dopo conversione. H=v²/(2g)=100/20=5 m, battente istantaneo.', 'A fissa, H da 5 a 20 m: v 10→20 m/s e Q 10→20 mL/s; rapporto 2.', 'Corretto 10 mL/s; proposta meno corretto 20−10=+10 mL/s. A stessa area, proposta richiederebbe battente 20 m, non 5.', 'Dividere Q=A√(2gH) per la velocità positiva isola A=Q/√(2gH), dimensione area. Conversione in mm² solo dopo coerenza delle unità.', 'Area scala κ₁, velocità scala √κ₂ perché g è fisso e H sta nella radice. Q_B/Q_A=κ₁√κ₂, con coefficiente di efflusso uguale e unitario.', 'A: 1 mm² e 5 m→10 mL/s. B: 2 mm² e 20 m→40 mL/s. Rapporto 4=2·√4.', 'Media (10+40)/2=25 mL/s. Ingressi medi 3/2 mm² e 25/2 m danno 15√10/2 mL/s. I quadrati 625 e 1125/2 sono diversi: prova manuale esatta, senza √10 decimale.', 'Target 4·10=40 mL/s; A_B=2 mm² richiede v_B=20 m/s. H_B=20 m e rapporto H_B/H_A=20/5=4.', 'q=30/(10 mL/s)=3 s/mL. S_B=120→Q_B=40 mL/s; H=20 m→v=20 m/s, dunque A=2 mm².', 'Differenze ΔS=60 e ΔQ=30 mL/s danno q=2 s/mL, offset 1. S_C=41→Q_C=20 mL/s; H=5 m→v=10, dunque A_C=2 mm².', 'Con x=H/(1 m)>0, a=A/(1 mm²)=x/5, la portata numerica è a√(20x). Dato 10: 100=(4/5)x³, quindi x³=125 e x=5. H=5 m, A=1 mm²; unicità dal cubo crescente.']
DISTRACTORS=['La portata 10 mL/s non è la velocità 10 m/s. Omettere conversione mm²→m² moltiplica il valore SI per un milione.', 'm/s velocità, mm² area, mL volume senza tempo, kg/s flusso massico che richiederebbe densità.', '1/A dipendenza e dimensioni errate; A·2gH usa v²; √(gH) perde fattore 2 e doppio esterno non assegnato.', '√2 mette area sotto radice, 40 conta due volte il raddoppio, 5 inverte, 10 ignora il foro nuovo.', 'Qv non è area, v/Q area inversa; 1 m² cambia l’area corretta di un milione.', 'v/(2g) non lunghezza; omettere 2 darebbe 10 m. Senza conoscere A la sola portata non identifica H.', '4 tratta Q come lineare in H; 1/2 e 1/4 invertono; 20 è Q_B numerico, non rapporto.', '−10 ordine invertito; 20 proposta; 0 accetta; 5 metà dello scarto. Non si contano due volte i flussi ai due lati.', 'Prodotto per v e reciproco non area; dividere per v² errato; fattore 2 finale altera Q senza dato.', 'κ₁κ₂ perde radice su H; √κ₁ applica radice anche all’area; quoziente inverte H; κ₁² tratta l’area come un raggio.', '2 solo una variazione; 8 applica H linearmente; 1/4 reciproco; 40 portata B numerica.', '50 somma; 25/2 doppia metà; 15√10/2 ingressi medi; 30 differenza fra portate.', '2 segue velocità anziché suo quadrato; 1/4 reciproco; 8 conta ancora area; 20 è H_B numerico.', 'S=120 scambiato per mL/s darebbe A=6 mm². Il numero 2 corretto è area, non lato da quadrare.', 'A=1,3,4,1/2 mm² a H=5 m danno letture 21,61,81,11, non 41.', 'Il coefficiente c è area per lunghezza. H=5 e A=1 ricostruiscono Q=10; cubo positivo crescente esclude due soluzioni. Elevamento al quadrato applicato a grandezze positive, senza ramo spurio.']
ASSUMPTIONS=['Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.', 'Liquido omogeneo incomprimibile, grande serbatoio e piccolo foro, fotografia quasi stazionaria con superficie quasi ferma. Stessa pressione assoluta alla superficie e nel getto, fase liquida mantenuta. g=10 m/s² uniforme; nessuna macchina, perdita o contrazione, velocità uniforme nel foro, coefficiente ideale di efflusso 1. A>0 in mm², H>0 in m, Q>0 in mL/s. Vincoli fra apparati.']
UNITS={1: 'mL/s', 2: 'mL/s', 3: 'mL/s', 4: 'mL/s', 5: 'mm**2', 6: 'm', 7: '', 8: 'mL/s', 9: 'mm**2', 10: '', 11: '', 12: 'mL/s', 13: '', 14: 'mm**2', 15: 'mm**2', 16: 'm'}
NUMERIC_UNITS={1: 'mL/s', 5: 'mm²', 6: 'm', 14: 'mm²', 16: 'm'}
SUFFIX={8: ' mL/s', 12: ' mL/s', 15: ' mm²'}
SVG_REVIEW='XML e rendering completo letti. Dettagli rettangolari 20×20 e 20×40 px a 20 px/mm rappresentano aree 1 e 2 mm²; non sono cerchi e non rappresentano il serbatoio. Con H=5 m, velocità comune 10 m/s e barre 100/200 px a 10 px/(mL/s) per 10/20. Conversione mm²·m/s=mL/s dichiarata. Confronto finale A1,H5 e A2,H20: barre 100 e 400 px per 10 e 40 mL/s, stessa scala, senza confusione con quote o velocità.'

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

CANDIDATE_REF='ca03aa8250c49486f2d25da55d99e6ceabedad46'
SOURCE_READING='All 80 original U3-03 prompts in these five families individually read and solved before opening candidate packages. Disclosure: prior author handoff already exposed 104-06 equal ranges and doubled A speed, plus qualitative information about radicals, a quartic and renamed h/H. These facts independently rederived from source models; no claim of wholly blind key reading for 104-06. All 16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing. Never imports candidate authoring; real C2-L005/L006 lessons reread.'
REVIEWED_PACKAGE_SHA256='2af78f8f43d6718f051e3d03e6b87c058d71c1c5af0fa9ec473dc5a926e58b53'
REVIEWED_BINDINGS_SHA256='7e3d5e2c1820fa2348413f24483b1efbf5e7e27f81b183112862c61720380453'
REVIEWED_CANDIDATES={'AR-u3-torricelli-flow-01': '59c55bf4184111afd079a5be928623e3f6624791edc4bb661e34e3c42f3e6c58', 'AR-u3-torricelli-flow-02': '27f48ab0fa8994c2c4ee9f9e152416224aab721b508533cefb1e894a77db1205', 'AR-u3-torricelli-flow-03': 'eeada06ae19da48d2025a5afc48e5826e62a9f2043c83dca49b0f6635c9132b6', 'AR-u3-torricelli-flow-04': '76afc3caa0941ceb99a4cb8669bed72dc2d47fd9403585de6b39a00118b97f90', 'AR-u3-torricelli-flow-05': '27e7814dc5f48831c5d310d7272660e43c1f31318b7940d69b4506e5aade8a84', 'AR-u3-torricelli-flow-06': 'bacf3265bea7e007a879d0b5867e3c5e040e594d7aa836ad4b5aa7948aef974b', 'AR-u3-torricelli-flow-07': '30138da708102fa88a07fcfff27d377a5421f584dc0db7ef8b428a8455a0d3c4', 'AR-u3-torricelli-flow-08': '3f217ba33ff31cb14dee9f77e46c1b0ed45ef4ea7e00a14562ae61627852bcb6', 'AR-u3-torricelli-flow-09': 'f538464037d11aaa8ce572dedd36edab1a50dabe852ce1ede140ef661f95df8e', 'AR-u3-torricelli-flow-10': '1b94b9b6efaaf4cb2863c3655b9dd3275a95d44dcbaeec52f182d36c5da54fc8', 'AR-u3-torricelli-flow-11': 'e7f6817056741445f5ade5ef7c343cad5675de9b60e992f546d11b5a852263c6', 'AR-u3-torricelli-flow-12': 'b2045d42d0dd5fd651896c18269a748e5186138a054e956ade6586099548a8aa', 'AR-u3-torricelli-flow-13': '743e90f5debc51744a2cb3ae5c4d3b944f1e415e0421c44a738603027e118b71', 'AR-u3-torricelli-flow-14': '3428b70b0b5f6d555863ebf49184902f8b9219926b55920b28c06811f1ac6566', 'AR-u3-torricelli-flow-15': '6654eb4d0585d90a8f562bb4ac1efc51a79580d0be4f7cfe69a96bf67110953c', 'AR-u3-torricelli-flow-16': '06ccfc22ce2872981964f04a762d083991d815e66cda7a6826451a3201e95670'}
READ_SOURCE_SHA256={'u3-torricelli-flow-01': '04881237295418bde4a96484247e219d5fcf1b3a8da0ba02eb31a6aab86ca83b', 'u3-torricelli-flow-02': '19f0311b87169ec0262f3b26cfe86d5e14db35da2ddb77f7156e9e4d8bc33583', 'u3-torricelli-flow-03': '7e30469a2087d08b98f7a2f43bef0ea2b204956d57f40e343096ea2fd2599967', 'u3-torricelli-flow-04': '9f11989541f4ac9161f0f881494a2ee9a93ec11159a134754d9ab5bb9c2b7fc5', 'u3-torricelli-flow-05': '0a31f0a902416ef2f8b59ea509eaa44f4e9d5988d20500202b02e07c84a21f67', 'u3-torricelli-flow-06': '724297679493cb71fb8c1ac3739c5b286cb08b5eb87b049a70a9a2b709b424b0', 'u3-torricelli-flow-07': 'f3e5f5137244c3878c575bbfbae0393fdfff9263d353b0ab9d638d58c5493242', 'u3-torricelli-flow-08': '506f93fc975a3457ef6e110f222de13496c1b944de2723f10c8159642eea1bb3', 'u3-torricelli-flow-09': '01fdb0ba952bc002707d1faea3fc58ea748b10b94801ff613cb7d64c318a44fc', 'u3-torricelli-flow-10': '024274c730040997e5c62d2c184ef67a97fa81ad51ecc485eb4b1600ffc2499b', 'u3-torricelli-flow-11': '06e1cd674288013d1cc289b744141fe8810ee2717c573bed81327a622531f8c6', 'u3-torricelli-flow-12': 'fe22e4f30e560e7f491c7ac72472be793c8388f7f6b14b99a1dbffc4bafc19f4', 'u3-torricelli-flow-13': 'ee0f1171e5dff6ed95a9b3c4531401a45e37ca791fd9e73cd7c8ea44180d9977', 'u3-torricelli-flow-14': '17868908a805eb0f34a50b89895327ee8ad817ae6f76abd26117631b2de1c675', 'u3-torricelli-flow-15': 'b55c962167c6d48d75496383f9c8efa1553b83031ccad9d1b35fc66aa4db2a20', 'u3-torricelli-flow-16': '039a8aae7dcf3ee34d3321d73ac557481b444fc867f52a3d648e52c03746b9b6'}
