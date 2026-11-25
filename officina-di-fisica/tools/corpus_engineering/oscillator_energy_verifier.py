"""Independent U4-01 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-01.json'
FAMILY='oscillator-energy'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C5-L01'

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

@lru_cache(maxsize=1)
def oracle():

    k,A,x,E,a,b=sp.symbols('k A x E a b',positive=True)
    # Work to deform a linear spring from equilibrium, evaluated at turning point.
    law=sp.integrate(k*x,(x,0,A))
    inv=sp.solve(sp.Eq(E,law),k)[0];invA=sp.solve(sp.Eq(E,law),A)[0]
    ratio=sp.simplify(law.subs({k:a*k,A:b*A})/law)
    unique([2*E/A**2,E/(2*A**2),2*E*A**2,A**2/(2*E),2*E/A],inv)
    unique([a*b**2,a*b,a/b**2,b**2/a,a*a*b],ratio)
    f=lambda u,v:law.subs({k:u,A:v})
    first,second=f(2,2),f(4,3)
    gain,offset=calibrate(first,second,9,37);assert(gain,offset)==(2,1)
    third=(2-offset)/gain
    assert (first+second)/2-f(3,sp.Rational(5,2))==sp.Rational(13,8)
    c=sp.Symbol('c',positive=True)
    constrained=law.subs(k,c*A)
    root=sp.solve(sp.Eq(constrained.subs(c,1),4),A)[0]
    assert root==2 and sp.diff(constrained,A).is_positive
    assert f(2,1)/f(2,2)==sp.Rational(1,4) # damped turning points, not ideal-time conservation
    q=SI.Quantity
    assert (q(2,'N/m')*q(2,'m')**2/2).to('J').magnitude==4
    assert (q(1,'J')/q(1,'m')**2).to('N/m').magnitude==1
    return [first,'J','L’energia meccanica si trasforma in energia interna della massa, della molla o dell’ambiente','Da 4 a 2 J',inv.subs({E:first,A:2}),invA.subs({E:first,k:2}),f(2,4)/first,8-first,'k = 2 E / A²','κ₁ κ₂²',second/first,(first+second)/2,sp.sqrt((second/first)/2),inv.subs({E:54/(12/first),A:3}),inv.subs({E:third,A:1}),root]

MANUAL=['k=2 N/m, A=2 m: E=2·4/2=4 J.', '(N/m)m²=N·m=J; unità energetica.', 'in assenza di apporto esterno, attrito converte energia meccanica in energia interna del sistema e ambiente; ampiezza diminuisce, energia totale non viene distrutta. Non applicare la conservazione della sola K+U al sistema con attrito.', 'k=1, A=2 dà E=2 J, metà del valore iniziale.', 'k=2 E/A²=8/4=2 N/m.', 'A²=2 E/k=4 m², ramo A=2 m>0.', 'ampiezza doppia 2→4 m, energia 4→16 J, rapporto 4.', 'proposta meno corretto 8−4=+4 J.', 'k=2 E/A²; J/m²=N/m.', 'E_B/E_A=κ₁κ₂², k e A positivi in entrambe le prove.', 'B con k=4, A=3 dà E_B=18 J; rapporto 18/4=9/2.', 'media (4+18)/2=11 J. Ingressi medi k=3, A=5/2 danno 75/8 J, inferiore di 13/8 J.', 'target E_B/E_A=9/2 e k_B/k_A=2 implica (A_B/A_A)²=9/4; ramo positivo 3/2 e A_B=3 m.', 'gain 12/(4 J)=3 J⁻¹; S_B=54 dà E_B=18 J. A_B=3 m implica k_B=36/9=4 N/m.', 'gain (37−9)/(18−4)=2 J⁻¹, offset 1. S_C=2 dà E_C=1/2 J; A_C=1 m implica k_C=1 N/m.', 'k=cA con c=1 N/m² rende E=cA³/2; E=4 J impone A³=8 m³, unica A=2 m positiva, k=2 N/m. Il coefficiente è dimensionato e il vincolo lega prove diverse.']
DISTRACTORS=['Otto omette il mezzo del triangolo sotto kx; due non conserva A². U=0 al centro non significa E=0 perché K=E.', 'N forza, N/m rigidezza, m/s velocità, W potenza. J=N·m, non N/m.', 'Distruzione dell’energia totale è falsa; costanza della sola E_mecc contraddice ampiezza decrescente. Attrito passivo compie lavoro negativo; il periodo da solo non sostituisce il bilancio.', 'Otto inverte k, uno dimezza due volte, quattro ignora la nuova rigidezza; zero viola k, A>0.', 'Omettere il due dà 1 N/m; scambiare A con 2 A quadruplica il denominatore e riduce k di quattro.', 'Quattro è A² numerico e anche distanza fra estremi, non A; ramo negativo possibile per x ma escluso per ampiezza.', 'Due è il rapporto lineare di ampiezze o forze; 1/2 e 1/4 sono inversi; uno ignora la variazione.', '−4 ordine inverso, 8 proposta, 0 accetta, 2 dimezza ancora lo scarto.', 'E/(2 A²) quarto del corretto; 2 EA² ha unità J·m²; A²/(2 E) inversa di k; 2 E/A è forza.', 'Una sola potenza di κ₂ confonde energia e forza; quozienti invertono dipendenze; κ₁² quadra k anziché A.', '2 segue solo k, 9/4 solo A², 2/9 reciproco, 18 valore finale non rapporto.', '22 somma, 11/2 doppia metà, 14 differenza; 75/8 è il modello agli ingressi medi.', '9/4 è rapporto al quadrato; 2/3 reciproco; 9/2 target e 3 ampiezza B numerica, non rapporto.', 'La lettura 54 usata come J produce k 12 N/m, triplo. Prima rimuovere gain, poi usare A_B².', 'A 1 m con k 2, 4, 8, 1/2 dà S 3, 5, 9, 3/2; solo k 1 produce S 2.', 'Otto è il cubo numerico, non A. A³ crescente su A>0 garantisce unica radice fisica; non si varia k dentro una stessa prova.']
ASSUMPTIONS=['Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Solo 03: massa e molla reali con attrito debole passivo, nessun apporto da forzante. Si confrontano energie ai punti di inversione, senza assumere conservazione della sola E_mecc o una forma esatta continua dell’inviluppo. Energia totale con ambiente conservata.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.', 'Oscillatore orizzontale inerziale con m, k, A positivi, molla lineare senza massa, zero elastico in x=0. Nessun attrito o forzante nei quesiti numerici; k, A costanti entro prova. Nel solo 03 molla reale con attrito debole e nessun apporto esterno: conservare l’energia totale con ambiente, non la sola energia meccanica.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'N/m', 6: 'm', 7: '', 8: 'J', 9: 'N/m', 10: '', 11: '', 12: 'J', 13: '', 14: 'N/m', 15: 'N/m', 16: 'm'}
NUMERIC_UNITS={1: 'J', 5: 'N/m', 6: 'm', 14: 'N/m', 16: 'm'}
SUFFIX={8: ' J', 12: ' J', 15: ' N/m'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Posizioni 200/320/440 px per −2/0/+2 m a 60 px/m; ampiezza 120 px per 2 m distinta da distanza totale 4 m. Barre conservative 100 px a 25 px/J per E 4 J, elastiche all’estremo e cinetiche al centro. Caso smorzato separato: segmenti 120/60 px per A 2/1 m, barre 100/25 px per E 4/1 J. Si confrontano punti di inversione distinti, non un’esatta legge dell’inviluppo continuo.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u4-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
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


CANDIDATE_REF='e49b1ee7d32c2822dd14e7605019cf4c96416373'
SOURCE_READING='All 80 B135–139 U4-01 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A130–134 and knows oscillator laws from that work; no claim of ignorance of the physics. All 16 final candidate records, options, blocks, hints, feedback, metadata and figure captions read completely, with full SVG XML and native rendering. Never imports authoring. Existing C5-L01/L02/L03/L04/L05 and C1-L003/L005/L006/L008 lessons reread during this U4 work.'
REVIEWED_PACKAGE_SHA256='6aac0cdbf1f85a4476b52cd6fef2a4676574b1a3bf2e8481d79f162e4bb90f7f'
REVIEWED_BINDINGS_SHA256='c623fbd3e1a01149b9fea9493904841e660193a8127d99f5d99f177a4bf40164'
REVIEWED_CANDIDATES={'AR-u4-oscillator-energy-01': '69bc620e1856c2b85321a5e003752a7ccb2e15e120a4e1dd3f8d91f0917685a3', 'AR-u4-oscillator-energy-02': 'dc48a6ddcb7a285611a53568007ff29eea8afdd66c918a7bf35c0e93c2c93271', 'AR-u4-oscillator-energy-03': 'efedc9120501d82e8636b9f3a5a60c874496f6f660c142401b43ab002df1f91d', 'AR-u4-oscillator-energy-04': '228e6da077e1feb74cfdf07b2ef8fcfe92376444072bf3ffeef91346ce977fda', 'AR-u4-oscillator-energy-05': 'a4f65a27a2ed1cd8de7aabd32bd75ca90d1f92751cace5218f6c9d6ae43fcf83', 'AR-u4-oscillator-energy-06': 'e423bbc8959e92cc558560f6b9e0e648f3de7f4ca7421339df0dd3d3fb31db75', 'AR-u4-oscillator-energy-07': '6290bebbb948c985e6769977b8915b48306a115aa18c45673a4300f0aedd9291', 'AR-u4-oscillator-energy-08': 'f2a56e2a410bca1d6ad96118521f167e2f9ecd17f9888d7d93b22ad3fc4d513e', 'AR-u4-oscillator-energy-09': 'd2b8fa21da529c35ca5bd9e82f3ff4d4f160c21ce87eacf9040168a8b0cf2ce8', 'AR-u4-oscillator-energy-10': 'a10d54019a85fe7e4496a610a4480addaa83e5274312e8b28ee3ea5ec9593444', 'AR-u4-oscillator-energy-11': '3b45e6562bed8fbf533e9c3717c3009baa65b39e42b3c1191770d845367c5077', 'AR-u4-oscillator-energy-12': '00f8df32462eb9749a00b79dd46f17c4c6870413b0e5337f415e7cf108e60a6e', 'AR-u4-oscillator-energy-13': '249e783c760cefd829ecd6f0816c5ffcaa0253320ca7b3eaea2f4b6ecca7656e', 'AR-u4-oscillator-energy-14': 'c2861655ce0f9a0dbd039d21d83c9ea80d331e30881d15488cdbf9ddc7d21ba5', 'AR-u4-oscillator-energy-15': '5846231531562b2a4870a415f195ae3a6eb7da39e7e654e9baaab564a5f20ef3', 'AR-u4-oscillator-energy-16': '7b5409dd190f59e000fda8cf84a27565c0a306600b85da05c1ddf9bcdbac3522'}
READ_SOURCE_SHA256={'u4-oscillator-energy-01': '82410150947a3107d9905e37d1f78e621f357c92e22862748663705cf2dbfd2a', 'u4-oscillator-energy-02': 'b4550947fa06090f202a6fe26109f8cfa97aeed8ac0f2eba2ad845b78fe324fd', 'u4-oscillator-energy-03': 'af46c0c9ff57fbc4ac8a8014e1ebd49eb6955ef9b5721e5fc33781c4b8a3f64e', 'u4-oscillator-energy-04': 'd3e30b9dc7774e3dd984e50e18c3607c9f68d5395d2298477586914096936bad', 'u4-oscillator-energy-05': '656803edd4231aab9a247eda6d9674c5e0ffa573b666fb1df13a63fb2f36f822', 'u4-oscillator-energy-06': '61c42394d7868cd0b8045c74140b6eb476e374059fcced9eac9e5d410a37dce6', 'u4-oscillator-energy-07': 'c2f76af57cf336567d163cff3c32d9f985852bc94d8f35b65d3629198c04c8d0', 'u4-oscillator-energy-08': '51779c287c315b9343990e857458949b4f17e92e555039b67f87c8ff4b2ca192', 'u4-oscillator-energy-09': 'c56fb43c77aca69d58418b8f32996448bfe05616e0e0087d4c65a9672fff0136', 'u4-oscillator-energy-10': 'dbeb6cba1e661014781e67aba3607a9e57a20d4227feedcd9e3fad3b066113b4', 'u4-oscillator-energy-11': '7457ed61057321f6b849a5e26b1a3ea57f1fe3a28b27e56006295255c7e3552a', 'u4-oscillator-energy-12': 'af30cf50c929380bd8f34862c0a46994757234965237fc84e79fa9d0db4d506e', 'u4-oscillator-energy-13': '0e347db162874460d3f7977c6ecffb763b4c2a589b8386b101efb9592d56187e', 'u4-oscillator-energy-14': '04743f7f4f9ecc93b4df9f75415dbc971be3fe7ed587c8b7a61febb14957573f', 'u4-oscillator-energy-15': 'fdb31d98388fc9bec8519fe4470956885cb1e1e442de8c18e23973a479d21b52', 'u4-oscillator-energy-16': '7b18f9a876c4ea4c12fafb94013324e46ba69bde6973fc84d120f7ad9d13d0d8'}
