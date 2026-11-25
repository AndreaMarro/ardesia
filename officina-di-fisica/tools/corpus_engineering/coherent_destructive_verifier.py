"""Independent U4-02 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-02.json'
FAMILY='coherent-destructive'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C5-L03', 2: 'C5-L03', 3: 'C5-L03', 4: 'C5-L03', 5: 'C5-L03', 6: 'C5-L03', 7: 'C5-L03', 8: 'C5-L03', 9: 'C5-L03', 10: 'C5-L03', 11: 'C5-L03', 12: 'C5-L03', 13: 'C5-L03', 14: 'C5-L03', 15: 'C5-L03', 16: 'C5-L03'}

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

    small,delta,theta,res,a,b=sp.symbols('small delta theta res a b',positive=True)
    large=small+delta
    coordinate=sp.expand_trig(large*sp.cos(theta)+small*sp.cos(theta+sp.pi))
    assert sp.simplify(coordinate-delta*sp.cos(theta))==0
    x,y,r=sp.symbols('x y r',positive=True)
    law=x-y
    inv=sp.solve(sp.Eq(r,law),x)[0]
    other=sp.solve(sp.Eq(r,law),y)[0]
    ratio=sp.cancel(law.subs({x:a*x,y:b*y})/law)
    unique([x-y,x+y,y-x,x*y,sp.sqrt(x*x+y*y)],law)
    unique([r+y,r-y,y-r,r*y,r/y],inv)
    unique([(a*x-b*y)/(x-y),a-b,a/b,a*b,(a*x+b*y)/(x+y)],ratio)
    first,second=law.subs({x:4,y:1}),law.subs({x:6,y:4})
    gain,offset=calibrate(first,second,7,5);assert (gain,offset)==(2,1)
    third=(11-offset)/gain
    reduced=sp.solve(sp.Eq(3,law.subs(x,4*y)),y);assert reduced==[1]
    assert (sp.Rational(4+6,2)-sp.Rational(1+4,2))==(first+second)/2
    q=SI.Quantity;assert (q(4,'mm')-q(1,'mm')).to('m').magnitude==Fraction(3,1000)
    assert (q(9,'')/q(3,'mm')).to('1/mm').magnitude==3
    return [first,'mm','A_res = A₁ − A₂','Da 3 a 1 mm',inv.subs({r:3,y:1}),other.subs({r:3,x:4}),law.subs({x:4,y:2})/first,6-first,'A₁ = A_res + A₂','(κ₁ A₁ − κ₂ A₂) / (A₁ − A₂)',second/first,(first+second)/2,other.subs({x:6,r:sp.Rational(2,3)*first})/1,inv.subs({r:6/(9/first),y:4}),inv.subs({r:third,y:3}),reduced[0]]

MANUAL=['4−1=3 mm. La coordinata è 3 cosθ mm, quindi ampiezza 3 mm anche quando la coordinata è negativa o nulla.', 'Una differenza di lunghezze ha dimensione L. 1 mm=1/1000 m; soltanto mm fra le scelte ha dimensione di lunghezza.', 'cos(θ+π)=−cosθ; y=A₁cosθ−A₂cosθ=(A₁−A₂)cosθ. Poiché A₁>A₂>0, il modulo del coefficiente è A₁−A₂.', 'A iniziale 4−1=3 mm; nuova 2−1=1 mm, rapporto 1/3. Dimezzare il primo addendo non dimezza una differenza con il secondo fisso.', 'A₁=A_res+A₂=3+1=4 mm; sostituzione 4−1=3 e ordine 4>1>0.', 'A₂=A₁−A_res=4−3=1 mm. Dato ammissibile perché 0<A_res<A₁; ricostruisce 4>1>0.', 'Nuovo residuo 4−2=2 mm; iniziale 4−1=3 mm. Rapporto B/A=2/3.', 'Corretto residuo 3 mm, proposta 6 mm, errore 6−3=+3 mm. La proposta supera anche la somma geometrica massima 5 mm.', 'A_res=A₁−A₂ implica A₁=A_res+A₂. Con A_res,A₂ positivi l’inversa garantisce lo stesso ramo A₁>A₂.', 'Nuovo residuo κ₁A₁−κ₂A₂, vecchio A₁−A₂; rapporto fra le differenze. Entrambi i residui sono positivi per le disuguaglianze dichiarate.', 'A:4−1=3 mm. B:6−4=2 mm. B/A=2/3, non 6/4 né 4/1.', 'Media (3+2)/2=5/2 mm. Ingressi medi 5 e 5/2 mm danno ancora 5/2; la differenza è lineare nel ramo comune. Fuori da quel ramo la media dei moduli può non coincidere.', 'Target (2/3)·3=2 mm; A₂,B=6−2=4 mm. Rapporto rispetto a 1 mm iniziale:4; nuovo ordine 6>4>0.', 'Gain q=9/(3 mm)=3/mm. S_B=6 dà residuo 2 mm; A₁,B=2+4=6 mm. Il numero coincide con S solo per questi dati.', 'Gain (7−5)/(3−2) mm=2/mm, offset b=1. S_C=11 dà residuo (11−1)/2=5 mm; A₁,C=5+3=8 mm. Ricostruzione S=2(8−3)+1=11.', 'A₁=4A₂ porta A_res=3A₂. Residuo 3 mm impone A₂=1 mm, A₁=4 mm. Unica coppia positiva, legge lineare e scala determinata.']
DISTRACTORS=['5 mm sarebbe somma in fase; zero richiede ampiezze uguali, e il rapporto 4 è puro. Non si sommano due moduli ignorando la fase.', 'mm² area, Hz tempo inverso, s tempo e mm/s velocità sono dimensioni diverse da L.', 'A₁+A₂ corrisponde a fase zero; A₂−A₁ negativo; prodotto area. La radice della somma dei quadrati è una fase relativa in quadratura, non π.', '3/2 dimezza tutta la differenza; 5 usa la somma vecchia, 3 ignora il cambiamento e zero richiede uguaglianza non presente.', '2 mm sottrae A₂ una seconda volta; 3 mm copia il residuo. Le lunghezze non sono elevate al quadrato.', '7 mm somma invece di sottrarre, mentre un residuo superiore a 4 mm violerebbe il ramo positivo ricostruito.', '3/2 reciproco, 2 fattore della sola A₂, 1/2 reciproco di quel fattore, 1 ignora la cancellazione maggiore.', '−3 ordine inverso, 6 proposta, 0 accetta e 9 somma. Il residuo fisico positivo non obbliga uno scarto sempre positivo per proposte arbitrarie.', 'Le sottrazioni non invertono questa cancellazione; prodotto area e quoziente puro non sono A₁. A₂−A_res può anche diventare negativo.', 'κ₁−κ₂ vale zero a fattori unitari; prodotto e quoziente ignorano i pesi; rapporto delle somme è legge costruttiva. Nessuna alternativa è identità della differenza.', '3/2 reciproco e fattore della sola A₁; 3/8 divide i fattori delle singole ampiezze,4 segue solo A₂,2 copia il residuo B.', '5 è somma,1/2 semidifferenza,3 e2 conservano una sola prova. Non si inventa una non commutazione nel ramo lineare.', '2/3 copia il target,3/2 segue solo A₁,1/4 inverte il rapporto. Sostituzione necessaria nella differenza finale.', 'S_B=6 puro non è residuo6 mm: darebbe A₁10 mm e S18. Residuo2 mm non è A₁; il valore A₁6 è solo una coincidenza numerica.', '5 mm copia residuo,11 mm display. A₁6 mm darebbe S7; A₁4 mm darebbe S3. Solo8 mm restituisce11.', '3 mm copia il residuo,4 mm A₁. Radice indebita di una relazione lineare; coppia nulla viola sia misura sia positività.']
ASSUMPTIONS=['Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.', 'Mezzo lineare, somma orientata nello stesso punto; frequenza e polarizzazione uguali, fase relativa π stabile. A₁>A₂>0 e ordine preservato fra prove. A_res è massimo modulo, non coordinata istantanea.']
UNITS={1: 'mm', 2: 'mm', 3: 'mm', 4: 'mm', 5: 'mm', 6: 'mm', 7: '', 8: 'mm', 9: 'mm', 10: '', 11: '', 12: 'mm', 13: '', 14: 'mm', 15: 'mm', 16: 'mm'}
NUMERIC_UNITS={1: 'mm', 5: 'mm', 6: 'mm', 13: '1', 14: 'mm', 16: 'mm'}
SUFFIX={8: ' mm', 12: ' mm', 15: ' mm'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering intero letti. Tre zeri alle ordinate270/580/870 px; coseni con ampiezze100/25/75 px a25 px/mm e periodo400 px=2π rad. La seconda curva ha segno opposto e la terza somma ordinata per ordinata. Barre da zero115 px, larghezze160/40/120 e240/160/80 px a40 px/mm per le coppie4,1 e6,4; residui3 e2 mm.'

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
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
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



CANDIDATE_REF='3ff39ad559409bd5690138c16b97ac1f7ce12542'
SOURCE_READING='All 48 B145–147 U4-02 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A141–144 and already knows superposition laws; no claim of ignorance of the physics. All 16 final candidate records, every option, block, hint, feedback, metadata and caption read completely, with complete SVG XML structure and native rendering. Never imports authoring. Actual C5-L01/L02/L03/L05 and C1-L001 lessons reread. Edition 146 frequencies independently recalculated from its declared close-carrier parametrization; separate Doppler03/16 preserved. Edition147 frozen only after rereading final feedback15 at72861a39.'
REVIEWED_PACKAGE_SHA256='abb7d63143956e564313e3d607932af2b7cf385e90f6f50476e0c94784727d88'
REVIEWED_BINDINGS_SHA256='47b15756ccdb7540dff886b2cc8c49561f03fe22e873e5315e7e6849c39d14ac'
REVIEWED_CANDIDATES={'AR-u4-coherent-destructive-01': 'a4de6d2ffb806fd5b26303c00f9a270ccc8840333ba6123f64018f06b0e31fdc', 'AR-u4-coherent-destructive-02': 'dc4955d8e9472281b255d7f40113cc429b4cbc0e4c82a90c147a4b34a15cb051', 'AR-u4-coherent-destructive-03': '3339674c1291f54cf8d0291a5777d354e85a0e2046870786fec93170cc9f3f7d', 'AR-u4-coherent-destructive-04': '01c8d03dfbe948e6d23b77fdb0c78e065f3b2ed7212357e55e48f3633bc86ebc', 'AR-u4-coherent-destructive-05': '4f7f9e9cdbdf26b456905eaf6b0f3088c96d3ad892ad5bc7585d12533871642f', 'AR-u4-coherent-destructive-06': 'f883f0e27922e0e1faa39206b140bcfd3fa75cb2d9228926554ec5cc1af30cf5', 'AR-u4-coherent-destructive-07': '8cef3bee259838c01f247b233a1302f0d154190c620d7d657d3c527d43afe21b', 'AR-u4-coherent-destructive-08': '5e021070c39deaa19308dc23c2411694cdadf15cd60e1e155156a6abc7f152aa', 'AR-u4-coherent-destructive-09': '8f27f8f6ada231f1d9b1983e901b6a5e2388f77525404dd439834c5eae3a0fc5', 'AR-u4-coherent-destructive-10': '5d7a63ba663f4702839643917ebed0bcfd28c7772e1276da106e8e905386f870', 'AR-u4-coherent-destructive-11': '166e9df5ec9f32d52c6eb4ba74e4f04695c9c87cc30baf548a9cf71eb62b8b12', 'AR-u4-coherent-destructive-12': '861e53227315f74bba8d3f75e2da8da779c4a83152875f6ef07773e70f18d830', 'AR-u4-coherent-destructive-13': '6ff23c5469808c8e37f79e054b714972241602318d8d9e97bc0c3c3298d5cd9e', 'AR-u4-coherent-destructive-14': '4ed3d52ef95790555cfafc6fe53f7b53d566b2294d306f5a676288c50753d09e', 'AR-u4-coherent-destructive-15': 'b440dc9a51c1320005c2bf2ed6ab5591c858f81c96116fd31e0bf0ec670165e4', 'AR-u4-coherent-destructive-16': '2360e734b2371fee61aeb995f473c28400fe850cde291320a43e9ef2d9b39288'}
READ_SOURCE_SHA256={'u4-coherent-destructive-01': '8d6de831c05a6d74ec8ee123f98f48ed619408d32a2a1a0b8e043b6bc91d5ca1', 'u4-coherent-destructive-02': 'e56cedf3ad32e206c2f7eef1cbd9822fba9bc76d6cfb222249efaa1fe4f0b5b1', 'u4-coherent-destructive-03': '462271e61f54002a571e4bc489798cdace9dd22d20cae98d434f9340dc87cf49', 'u4-coherent-destructive-04': 'c1b4b27612a0db5d4acff822e5949a363cb845d99e57665ede655939951124c9', 'u4-coherent-destructive-05': '541b5467dd03bf41956894d8dbd8122391890a03552f992b023e75628ab0296d', 'u4-coherent-destructive-06': '9694cff9f499fdebc37ca83b1420fd600dee07b9b1ce602064816c33bb1b2497', 'u4-coherent-destructive-07': '0f711e58b6e0c99f4bb7f1c55d88dde202596a6ae876d12f16b8702e57505dea', 'u4-coherent-destructive-08': '8352bcdb01d1c19b67731afdebea90f92229a2ff908a54c6ade1caf2d7937512', 'u4-coherent-destructive-09': '65a07c3999c117fa52f2d115fcffc42060f91f77101e36aa5a82f0bdb18ce166', 'u4-coherent-destructive-10': 'c72dd209d0588cdcb598bf145b205bf25446d4c2aaf6b87fcdb5ae732509efe1', 'u4-coherent-destructive-11': '370480d972a1b91dd7ad8b7da0346ea1c799058fd6942a0f294480e41d2208c4', 'u4-coherent-destructive-12': '504cf88fd871bb74a8b9b84c43e6b31db2183d23bcad06ec201d338c43e2fad9', 'u4-coherent-destructive-13': 'c389261794476d3f685e1565bfc222782e42258d6bc98f16854020460b448200', 'u4-coherent-destructive-14': '8e251e5aaee5703cda9da3312bd1b5782f361bc737de6b0c1ab93bd4d107248e', 'u4-coherent-destructive-15': 'fce4eccde2c1181ad7dded982bf612458194ce61d8c0beff4e75f67850e1d0bf', 'u4-coherent-destructive-16': 'ae2b80e468daa1c5056dc67def64d42b1ccecc23c080f1c284dfbff71f1bb61c'}
