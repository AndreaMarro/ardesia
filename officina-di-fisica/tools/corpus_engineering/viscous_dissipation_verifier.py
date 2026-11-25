"""Independent U3-04 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-04.json'
FAMILY='viscous-dissipation'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L008'

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

@lru_cache(maxsize=1)
def oracle():

    R,Q,P,p,k,l=sp.symbols('R Q P p k l',positive=True)
    # Net pressure work per time is pQ, then the linear resistor p=RQ.
    law=(p*Q).subs(p,R*Q)
    inv=sp.solve(sp.Eq(P,law),R)[0]
    invQ=sp.solve(sp.Eq(P,law),Q)[0]
    ratio=sp.simplify(law.subs({R:k*R,Q:l*Q})/law)
    unique([R*Q**2,R*Q,R/Q**2,Q**2/R,2*R*Q**2],law)
    unique([P/Q**2,P/Q,P*Q**2,Q**2/P,sp.sqrt(P/Q**2)],inv)
    unique([k*l**2,k*l,k*k*l,k/l**2,l**2/k],ratio)
    f=lambda r,q:law.subs({R:r,Q:q})
    first,second=f(2,3),f(3,2)
    gain,offset=calibrate(first,second,37,25);C=(55-offset)/gain
    if (gain,offset,C)!=(2,1,27):raise ValueError('Independent dissipation calibration failed')
    if f(sp.Rational(5,2),sp.Rational(5,2))-(first+second)/2!=sp.Rational(5,8):raise ValueError('Independent dissipation mean failed')
    x=sp.Symbol('x',positive=True);roots=sp.solve(sp.Eq(18,law.subs({R:sp.Rational(2,3)*x,Q:x})),x)
    if roots!=[3] or f(6,9)!=486:raise ValueError('Independent constrained dissipation cubic failed')
    u=SI.Quantity
    if (u(1,'kPa')*u(1,'L/s')).to('W').magnitude!=1:raise ValueError('Independent pressure-work unit conversion failed')
    if (u(18,'W')/u(3,'L/s')**2).to('kPa*s/L').magnitude!=2:raise ValueError('Independent resistance inverse units failed')
    if (u(18,'W')/u(Fraction(2,3),'kPa*s**2/L**2')).to('L**3/s**3').magnitude!=27:raise ValueError('Independent cubic coefficient dimensions failed')
    return [first,'W','P_d = R Q²','Da 18 a 27 W',inv.subs({P:18,Q:3}),invQ.subs({P:18,R:2}),f(2,2)/first,36-first,'R = P_d / Q²','κ₁ κ₂²',second/first,(first+second)/2,invQ.subs({P:12,R:3})/3,inv.subs({P:36/(54/first),Q:2}),inv.subs({P:C,Q:3}),roots[0]]

MANUAL=['R=2, Q=3: Δp=6 kPa e P_d=Δp Q=18 kPa·L/s=18 W. Esatto 1 kPa·L=1000·10⁻³ Pa·m³=1 J.', 'Pressione per volume al secondo dà energia per tempo, ML²/T³. I prefissi kPa e L si cancellano: 1 kPa·L/s=1 W. Nessun calcolo numerico autonomo richiesto.', 'Lavoro pressorio netto d W=Δp d V. Dividendo per dt: P_d=Δp Q. Sostituire Δp=RQ produce RQ²; le due Q hanno ruoli fisici distinti.', 'Q=3 costante, R da 2 a 3: P_d=2·9=18 e 3·9=27 W. Δp da 6 a 9 kPa.', 'R=P_d/Q²=18/9=2 kPa·s/L, perché W/(L²/s²)=kPa·s/L.', 'Q²=P_d/R=18/2=9 L²/s². Q=3 L/s, selezionata positiva dal verso dichiarato e non dalla sola dissipazione.', 'R=2, Q_B=2: P_B=8 contro P_A=18 W. Rapporto 8/18=4/9.', 'Scarto 36−18=+18 W. Non confondere segno dell’errore con potenza resistente −18 W nel bilancio meccanico.', 'R compare linearmente: dividere P_d=RQ² per Q²>0 dà R=P_d/Q², senza radici.', 'Scalare R→κ₁R e Q→κ₂Q dà P_B=κ₁κ₂² P_A. Il quadrato riguarda Q e non R.', 'B: R=3, Q=2, potenza 12 W; rapporto 12/18=2/3=(3/2)(4/9).', 'Media (18+12)/2=15 W. R_media=5/2, Q_media=5/2 dà 125/8 W, maggiore di 15 per 5/8 W.', 'Target (2/3)18=12 W, R_B=3: Q_B²=4, Q_B=2 L/s e rapporto 2/3.', 'Gain 54/(18 W)=3 W⁻¹. S_B=36 dà P_B=12 W; Q_B²=4 lascia R_B=3 kPa·s/L.', 'Gain (37−25)/(18−12)=2 W⁻¹, offset 1. S_C=55 dà P_C=27 W; Q_C=3 porta R_C=27/9=3 kPa·s/L.', 'R=c Q con c=2/3 kPa·s²/L². P_d=c Q³; 18/(2/3)=27 L³/s³ e Q=3 L/s, R=2. Cubo positivo crescente: unica soluzione. Controprova Q=9 dà c Q³=486 W, non 18.']
DISTRACTORS=['6 è Δp, 9 è solo Q² numerico. Potenza dissipata positiva distinta dal contributo resistente negativo.', 'J energia, kPa pressione, L/s portata, kPa·s/L resistenza; per energia occorre anche durata.', 'RQ è pressione; R/Q² e Q²/R hanno dipendenza e dimensioni errate; fattore 2 non richiesto.', '12 inverte fattore R; 81/2 quadra erroneamente 3/2; invariata e nulla non rispettano RQ² positivo.', 'Dividere solo per Q dà 6 kPa, non resistenza.', '9 è Q²; −3 viola Q>0, anche se RQ² resta positivo.', '9/4 reciproco; 2/3 solo rapporto Q; 3/2 inverso di Q; 1 ignora variazione.', '−18 ordine invertito; 36 proposta; 0 accetta; 9 dimezza errore.', 'P/Q pressione; P Q² operazione inversa; Q²/P conduttanza; radice altera dimensione.', 'κ₁κ₂ perde Q; κ₁²κ₂ quadra variabile errata; quozienti invertono dipendenze.', '3/2 solo R; 4/9 solo Q²; 1 compensazione falsa; 12 è potenza numerica.', '30 somma; 15/2 doppia metà; 125/8 ingressi medi; 6 differenza.', '3/2 reciproco; 4/9 quadrato del rapporto; 2 copia Q_B; 1 produrrebbe 27 W.', 'S grezzo 36 W darebbe R=9, triplo; quadrato di Q resta necessario dopo decodifica.', 'R=2,4,1,6 con Q=3 danno S=37,73,19,109; solo R=3 restituisce 55.', '27 è il cubo numerico, −3 non risolve il cubo positivo. Q=9 L/s produce 486 W, escluso dal bilancio; non attribuire 9 a √27.']
ASSUMPTIONS=['Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.', 'Elemento lineare R>0 e Q>0, liquido omogeneo incomprimibile stazionario. Sezioni di misura a uguale quota e uguale velocità media, nessuna macchina interna o accumulo meccanico. P_d positiva come conversione meccanica in energia interna, contributo resistente negativo al bilancio meccanico. Vincoli fra prove.']
UNITS={1: 'W', 2: 'W', 3: 'W', 4: 'W', 5: 'kPa*s/L', 6: 'L/s', 7: '', 8: 'W', 9: 'kPa*s/L', 10: '', 11: '', 12: 'W', 13: '', 14: 'kPa*s/L', 15: 'kPa*s/L', 16: 'L/s'}
NUMERIC_UNITS={1: 'W', 5: 'kPa·s/L', 6: 'L/s', 14: 'kPa·s/L', 16: 'L/s'}
SUFFIX={8: ' W', 12: ' W', 15: ' kPa·s/L'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Due frecce da 120 px a 40 px/(L/s) per Q=3, pressioni assolute 106/100 kPa. Diciotto caselle da 1 J in tre gruppi di sei per tre litri in 1 s: conteggi energetici, non geometria. Grafico a R=2: Q 50 px/(L/s), P 10 px/W, origine(100,1500); Bezier(100,1500),(200,1500),(300,1180) dà esattamente P=2 Q² con Q=4 t, P=32 t², punti(2,8),(3,18),(4,32).'

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
        if row.get('course')!='C2' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
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


CANDIDATE_REF='bd85f8e9e1d2429d751c817b9e6df6fcbbffdcd5'
SOURCE_READING='All80 original U3-04 prompts in B112–116 individually read from pinned Git source and derivations persisted before candidate packages were opened. No numeric result or key was handed off before source-first derivation for this family. All16 final candidates, every option, formula, hint, feedback and figure caption read in full; scientific SVG XML and full native rendering read. Never imports candidate authoring. Real C2-L005/L006/L007/L008/L009 lessons reread during this U3-04 work. Author correction bd85f8e9 independently reread: only113-16 invalid-root attribution or115-02 stress-unit wording and derived feedback/binding changed; other30 records, all keys/formulas/assets byte-identical.'
REVIEWED_PACKAGE_SHA256='cf11d0679d6fecf271cce52b6638dd6c36964bd0d67e64b4a708af6f39c6ec6c'
REVIEWED_BINDINGS_SHA256='b4ad452f1bc4c5f3d1229da2e5ef089f5868c1db37e9748e53f4fc01948b32b7'
REVIEWED_CANDIDATES={'AR-u3-viscous-dissipation-01': 'a79c3207dd514b2ca86c08d983a621b9aaa2db40129aa5a72ee89a1a8c10fb30', 'AR-u3-viscous-dissipation-02': 'bf16f16f26c74dab6be553271a9b79eb36b6fcfb024bb54d58276e1ecbcb054e', 'AR-u3-viscous-dissipation-03': 'd5ca7bc11adfab071f7df262d1eed41ccc164c3057d78d9eece616a748a2d806', 'AR-u3-viscous-dissipation-04': '5c718733605710b2f57a0d7c7ffe587e4a16f8d4a42d876fa58ab42fdada8a4c', 'AR-u3-viscous-dissipation-05': 'd0f6b418bd2ac9a39fd17ec0ab12fabe743f61f437815e564b515c51ac62a15a', 'AR-u3-viscous-dissipation-06': '89c2a39e12c546ae8c088297fea1decdf0e923c474a6b32c94b181239eb423f7', 'AR-u3-viscous-dissipation-07': 'e047054b9a6bde588cd412a4941adc053b3709c25590ab06695f4747773522c5', 'AR-u3-viscous-dissipation-08': 'a169039523b5062eb20bebf4aeebc07467b9df42c0b2fc6c00a78ac189dcfbe8', 'AR-u3-viscous-dissipation-09': '2db3a9fa120b9d3f2183fbbfaca7ed9a911e5887adeeabafd17fd63df0b54b5e', 'AR-u3-viscous-dissipation-10': '1923ee1aa845e62ed3a80148349703f41e3360326b39bc61809884b8709223d9', 'AR-u3-viscous-dissipation-11': '14e7dbcc68a9965118923d0ad1877d75f8673b3fde71ba388b9686708d32c469', 'AR-u3-viscous-dissipation-12': '016c67fd3831cc024a59097c68c4d5fa4cfdf071464f1adba76b91232424c287', 'AR-u3-viscous-dissipation-13': 'ba54808c805d8c0482e475817dab65d5aa6e6d1d4dc583fae6f4f17ecec17a47', 'AR-u3-viscous-dissipation-14': '7bfe14db2988aee04761dbe51595bbb7a4115a2dbc6458e68982ce8319bb296b', 'AR-u3-viscous-dissipation-15': '0661555e2ee626b22d11984a2a20a47f3a52f5d170e3d50bc873dee351ff132a', 'AR-u3-viscous-dissipation-16': '0a4b8240e12bd82656ff544a34282f84cea4d5a28064e8115b1c2e1a6fa54421'}
READ_SOURCE_SHA256={'u3-viscous-dissipation-01': 'd620bb0860462ee89177a2f2b1a6792cda7b5a6f7d2e07c314f2ecf260d1cf3e', 'u3-viscous-dissipation-02': '50d77dee057b7cc24a17e60316056555b90c0d2b81c622e879f2d3376b9097d4', 'u3-viscous-dissipation-03': '56cc8135b0b33268bbca566059fe1c6d5f2eb7135f58f15295e9d611e972b366', 'u3-viscous-dissipation-04': 'c556b6685fe75011f2b2a0ad569352e8758f1d75eb3f6ca6efece1f093758f6d', 'u3-viscous-dissipation-05': '8ab1f2faffe8966480574b7d8f7a4356731c45b93a78f70a5b7458a8cffa4691', 'u3-viscous-dissipation-06': 'd46e1b2a25f071d64c583db1a06778f6300844805f77973c561353b071d3e156', 'u3-viscous-dissipation-07': 'a3e9544b727374016bc17e405309e13951c85b01f8b64c592f8d66664186ca2d', 'u3-viscous-dissipation-08': 'd11cfd1a5b46ba046c9d25c28a522c2714d86583363705a711ec9652ef8502fe', 'u3-viscous-dissipation-09': '2f0f8ab82c2f2582b0a72332d788096276f5a33c1b886905d6c9152a48d410b6', 'u3-viscous-dissipation-10': 'a93233489d1d7299d891a28259cf3cab9e0ade1447b94eb0596cebcea9eb8fe2', 'u3-viscous-dissipation-11': '1a2d255271f8c6fe2e8e9fa1711f6ed36449824c70aa2ef0c49d5697d261d228', 'u3-viscous-dissipation-12': 'd04879d8ae0739c57b1470ee126c1eb5e3f5a77322769ba9b31639fdcb818b3e', 'u3-viscous-dissipation-13': '7400db3fcf15d182ec07f808c47100d666f7b27f44c20c049cedf6f8f8ee289f', 'u3-viscous-dissipation-14': 'e8eb0d450311057b6ed208b11d9986361ca8dc044b5638f6ef3f203806822c47', 'u3-viscous-dissipation-15': 'c9196eea7497f247acc381818b2060510fcb4a3d70b26f1785959546f868fea6', 'u3-viscous-dissipation-16': '7447a485d0618578cdc66a2af734ec77f07a3f735316952f91e828d836d0b9f3'}
