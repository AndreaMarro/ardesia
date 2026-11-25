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
FAMILY='spherical-intensity'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C5-L04'

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

    P,p,r,I,a,b=sp.symbols('P p r I a b',positive=True)
    surface=4*sp.pi*r*r
    law=sp.simplify((P/surface).subs(P,4*sp.pi*p))
    inv=sp.solve(sp.Eq(I,law),p)[0];invr=sp.solve(sp.Eq(I,law),r)[0]
    ratio=sp.simplify(law.subs({p:a*p,r:b*r})/law)
    unique([I*r*r,I/r**2,r**2/I,4*sp.pi*I*r*r,I*r],inv)
    unique([a/b**2,a*b**2,a/b,b**2/a,a*a/b**2],ratio)
    f=lambda u,v:law.subs({p:u,r:v})
    first,second=f(4,2),f(8,4)
    gain,offset=calibrate(first,second,3,2);assert(gain,offset)==(2,1)
    third=(9-offset)/gain
    assert (first+second)/2-f(6,3)==sp.Rational(1,12)
    c=sp.Symbol('c',positive=True)
    simplified=sp.simplify(law.subs(p,c*r));assert simplified==c/r
    root=sp.solve(sp.Eq(simplified.subs(c,2),1),r);assert root==[2]
    q=SI.Quantity
    assert (q(4,'W')/q(2,'m')**2).to('W/m**2').magnitude==1
    assert (q(1,'W/m**2')*q(2,'m')**2).to('W').magnitude==4
    return [first,'W/m²','Il suono richiede un mezzo materiale che sostenga perturbazioni di pressione e densità','Da 1 a 4 W/m²',inv.subs({I:first,r:2}),invr.subs({p:4,I:first}),f(4,1)/first,2-first,'p = I r²','κ₁ / κ₂²',second/first,(first+second)/2,sp.sqrt(2/sp.Rational(1,2)),inv.subs({I:sp.Rational(3,2)/(3/first),r:4}),inv.subs({I:third,r:2}),root[0]]

MANUAL=['p=4 W, r=2 m dà I=1 W/m²; P=16π W esatto.', 'intensità W/m², energia per tempo e area normale al flusso.', 'il suono richiede un mezzo materiale; vuoto ideale nell’interno elimina quel cammino acustico. Eventuali vibrazioni dei supporti o pareti non smentiscono l’assenza di propagazione sonora nel vuoto interno.', 'p=16, r=2 dà I=4 W/m², fattore 4.', 'p=Ir²=1·4=4 W, non P=16π W.', 'r²=p/I=4 m²; r=2 m positivo.', 'r=1 a p=4 dà I=4, rapporto 4 con la prova A.', 'e=2−1=+1 W/m².', 'p=Ir²; P invece 4πIr².', 'I_B/I_A=κ₁/κ₂².', 'p_B=8, r_B=4 dà I_B=1/2 W/m²; rapporto 1/2.', 'media (1+1/2)/2=3/4 W/m². Ingressi medi p=6, r=3 danno 2/3, inferiore per 1/12 W/m².', 'target I_B=1/2 a p_B=8 impone r_B²=16, r_B=4 m e rapporto 2.', 'gain 3/(1 W/m²)=3 m²/W; S_B=3/2 dà I_B=1/2; r_B=4 implica p_B=8 W.', 'gain (3−2)/(1−1/2)=2 m²/W, offset 1. S_C=9 dà I_C=4; r_C=2 implica p_C=16 W.', 'p=cr con c=2 W/m dà I=c/r. I=1 impone r=2 m, p=4 W, unica soluzione positiva. Un’eventuale radice r=0 introdotta moltiplicando per r² è estranea al dominio.']
DISTRACTORS=['Due usa p/r anziché p/r²; quattro copia p. Il valore 1/4 omette p e usa solo 1/r², non il reciproco di 4/4=1. Il finding dell’edizione originale è corretto dall’autore in 2 d 10 f 59 b e riletto separatamente.', 'W potenza, J energia, Pa pressione, W/m potenza per lunghezza. p in W non diventa pressione a causa del simbolo.', 'Vuoto senza mezzo non implica frequenza nulla né conversione spontanea in onde elettromagnetiche. Non è un fluido viscoso; supporti sono percorso escluso.', '1/4 inverte fattore 4; 16 quadra il fattore di potenza; 1 ignora variazione; zero viola positività.', '16π W è P, non p; 2 usa un r solo; dividere per r² non isola p e cambia unità.', '4 numero di r²; negativo non è distanza e r non è diametro. Richiede campo lontano per accettare il dato nel modello.', '2 omette quadrato; 1/2 e 1/4 seguono distanza nel verso sbagliato; 1 ignora espansione della sfera.', '−1 ordine inverso; 2 proposta; zero accetta; 1/2 dimezza scarto.', 'I/r² W/m⁴; r²/I m⁴/W; Ir W/m. 4πIr² ha unità W ma è P, non il parametro p.', 'Prodotto rende distanza diretta; una κ₂ perde quadrato; reciproco scambia stati; κ₁² quadra potenza senza motivo.', '2 solo p; 1/4 solo fattore area; 4 segue area direttamente; 8 moltiplica gli incrementi ignorando il denominatore.', '3/2 somma; 3/8 doppia metà; 1/2 sola B; 2/3 ingresso medio con scarto 1/12.', '4 rapporto aree; 1/2 reciproco; √2 manterrebbe I uguale anziché dimezzarla; 1/4 aumenterebbe I.', 'S 3/2 come I darebbe p 24 W; il raggio diverso impedisce di leggere direttamente rapporto potenze dalle letture.', 'p 8, 4, 32 W a r 2 m danno S 5, 3, 17; 64π W è P_C completa e non p_C.', 'Dopo p=cr resta I=c/r, non la radice del modello con p indipendente. c è W/m, non intensità o pressione; nessuna legge radiale crescente nella singola prova.']
ASSUMPTIONS=['Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Solo 03: sorgente continua a vibrare, aria rimossa fino al vuoto ideale; si considera soltanto il cammino interno, supporti solidi esclusi. Non si applica la legge sferica a un mezzo inesistente.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.', 'Sorgente puntiforme isotropa, mezzo omogeneo senza assorbimento o riflessioni, potenza media P positiva costante nella singola prova e misura in campo lontano. p=P/(4π) è potenza in W, non pressione; r>0 è distanza dal centro. Nel 03 il vuoto ideale rimuove il cammino materiale interno e i supporti solidi sono esclusi.']
UNITS={1: 'W/m**2', 2: 'W/m**2', 3: 'W/m**2', 4: 'W/m**2', 5: 'W', 6: 'm', 7: '', 8: 'W/m**2', 9: 'W', 10: '', 11: '', 12: 'W/m**2', 13: '', 14: 'W', 15: 'W', 16: 'm'}
NUMERIC_UNITS={1: 'W/m²', 5: 'W', 6: 'm', 14: 'W', 16: 'm'}
SUFFIX={8: ' W/m²', 12: ' W/m²', 15: ' W'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Cerchi concentrici 80/160 px a 40 px/m per sfere di raggi 2/4 m. Raggio obliquo(96, 128) px ha norma 160 px; i cerchi sono sezioni e non superfici sferiche. Barre area 100/400 px a 100 px per S₀=16π m², rapporto 4. Barre intensità 200/100 px a 200 px/(W/m²) per prove con p 4/8 W, r 2/4 m e I 1/1/2 W/m². Potenza costante radialmente solo entro una stessa prova.'

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


CANDIDATE_REF='2d10f59b6e6f78dc74d5f99cc526f95db27c4345'
SOURCE_READING='All 80 B135–139 U4-01 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A130–134 and knows oscillator laws from that work; no claim of ignorance of the physics. All 16 final candidate records, options, blocks, hints, feedback, metadata and figure captions read completely, with full SVG XML and native rendering. Never imports authoring. Existing C5-L01/L02/L03/L04/L05 and C1-L003/L005/L006/L008 lessons reread during this U4 work. Original 138-01 wrongly attributed 1/4 to reciprocal of 4/4=1. Author correction 2d10f59b reread from pinned Git, other 15 records and all keys/formulas/SVG byte-identical; final feedback correctly identifies omitted p.'
REVIEWED_PACKAGE_SHA256='468a355ab2ac44bcb00b9b93e52ada75dcf5161469e17567a4b2125fe352bc90'
REVIEWED_BINDINGS_SHA256='d40d07589144d9d429c8b47dbb2cb514ced20d951e7c98c5991d7e125b70c4a6'
REVIEWED_CANDIDATES={'AR-u4-spherical-intensity-01': '7145d2b5374c7c3d4deaea92fabde0d54df84c2847a0ca2fb28f0620e4637cf1', 'AR-u4-spherical-intensity-02': 'f1e7f1a07020996464f3285d4f6108b4f913d1eab67298cd3598a62f1cc5c1a1', 'AR-u4-spherical-intensity-03': '1b95f267b885c7d950dc8d89239fe1073a8f1f2f08ce167d823d0a621aaae61d', 'AR-u4-spherical-intensity-04': 'fac9ed11286b5eb363d4b0249c49183e7e83dcad2e7abca99419626679d623f1', 'AR-u4-spherical-intensity-05': 'a7753911238302e8ed24db486c6bcf47b4bb1121d4d06fff1353432deee2de39', 'AR-u4-spherical-intensity-06': '2c5a9f901725f110854fb5e4e9c902bf63a77e3986d47b16dbc4b4c57cc04aca', 'AR-u4-spherical-intensity-07': 'f67482683a43074d03b4185d89552af06b3f4bf953505944304cbf78232ec56e', 'AR-u4-spherical-intensity-08': 'c2390b3f2b4e6c713537c27b30a10cf2ad0f8c1fd385ab3a6ba5118f2801ef41', 'AR-u4-spherical-intensity-09': 'f7da765ae6fea8a27e19a9eb344d7113b0918b055020a76f6e7b4cb5a17663f7', 'AR-u4-spherical-intensity-10': '5cf99e0144eae1857a2328480fefd0ee5f1f93bcb4be075eb36df7dbb3aa544e', 'AR-u4-spherical-intensity-11': '8c19c60ef81cdf89d67f782b1e9fa86956fa32bdb8365423ea1ac92f22cbcb78', 'AR-u4-spherical-intensity-12': 'c0c46e46fe68ec0980fa9232d3e940bb2aadca84abfc9ca417c1ec3d32095289', 'AR-u4-spherical-intensity-13': '94bef8a1644c101a81c9533812ddefe32a1ca69c42f04602e1e2934849853e3d', 'AR-u4-spherical-intensity-14': '29e42adfe3eb0ff54a8e7251a4a46bdf0711333f0167815b48d0e474194ffbda', 'AR-u4-spherical-intensity-15': '9a1050e8a1d9ef5697082f448d446a65cad19560da11a1f259b89120b918578c', 'AR-u4-spherical-intensity-16': '9296d3ed14ae1fa8297b670903ac3f7b7bd6181543ea979a693c27dc192272fc'}
READ_SOURCE_SHA256={'u4-spherical-intensity-01': '85e8d1815bbc3844a3350e5839a6ad88c8b455ab405a9f22aa908346a8294733', 'u4-spherical-intensity-02': '53966d0ac9b30093aa99bf2ce5079533260e8aca115d0dba923b324efe74ddf2', 'u4-spherical-intensity-03': 'de9e9da768ebeca19f1e2be9676ffa96c153854e78c3afbcc7fde68f7b395b9d', 'u4-spherical-intensity-04': '94d6ee14c2b8ee5ee8feb77996fa3a03d1d267c3d939dabb6a52e6f403d2f1ec', 'u4-spherical-intensity-05': '83f17b6c211065217a29ffc9d5562b2eefc0dc86f044b826d7a020edfca24c56', 'u4-spherical-intensity-06': '06c397b773559a11f290b9c88bd0d5a30d196a4626e42983a6732c16c2a76e2d', 'u4-spherical-intensity-07': 'f23b64faaf9b4cd4644aad30456f93b52cf8b1d84370cd632144779fc11d6e7a', 'u4-spherical-intensity-08': '5b7070ab7bc4357fe32144e9c7babfcf1bf98f6a672a7ee62a90d15b40be5ea7', 'u4-spherical-intensity-09': 'b1405576741b24c70869d0f60015a2408db0f47320196348a33792038b02d61f', 'u4-spherical-intensity-10': '9d14ed9c4ad5dd86aaed11afd5c5b68bbf5d74f0b00ed02b985e8ba7892cd4a5', 'u4-spherical-intensity-11': '042b03f714fc113f9cec163391b331dea039c5389c8ee3f308cf4697180cf919', 'u4-spherical-intensity-12': 'af3825dfe59178d323e03a826c43c937bc8ca164369e109945d3f1565f8077c1', 'u4-spherical-intensity-13': '20d0e623a342de57d2c27351c96639aa531e6f6e1e0f1f2ffd3b16dd49bd99db', 'u4-spherical-intensity-14': '2e2ee74445492d67f6b14d7dbe1455e8e66c66a3608991a0714454c4d4356461', 'u4-spherical-intensity-15': '99896abdf57696f3ee50f69e552e82796f324ddbfd72f4e583cabbc20650c2d8', 'u4-spherical-intensity-16': '0539bb10ccf26cd6ee244dc221f24e629ebe9db8c0b9588fda82c594ada1fd4f'}
