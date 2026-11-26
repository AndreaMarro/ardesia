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
FAMILY='wave-energy-through-area'
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

    I,A,T,E,a,b=sp.symbols('I A T E a b',positive=True)
    # Constant incident flux integrated over a normal section and duration.
    s,t=sp.symbols('s t',real=True)
    law=sp.integrate(sp.integrate(I,(s,0,A)),(t,0,T))
    inv=sp.solve(sp.Eq(E,law),I)[0];invA=sp.solve(sp.Eq(E,law),A)[0]
    ratio=sp.simplify(law.subs({I:a*I,A:b*A})/law)
    unique([E/(A*T),E*A/T,E*T/A,A*T/E,E/A],inv)
    unique([a*b,a/b,b/a,a*b*b,a+b],ratio)
    f=lambda u,v:law.subs({I:u,A:v,T:2})
    first,second=f(2,3),f(4,2)
    gain,offset=calibrate(first,second,25,33);assert(gain,offset)==(2,1)
    third=(21-offset)/gain
    assert f(3,sp.Rational(5,2))-(first+second)/2==1
    c=sp.Symbol('c',positive=True)
    root=sp.solve(sp.Eq(law.subs(I,c*A).subs({c:sp.Rational(2,3),T:2}),12),A)
    assert root==[3]
    # Incident energy alone leaves absorption indeterminate: both fractions valid.
    assert first*sp.Rational(1,2)==6 and first*sp.Rational(1,4)==3
    q=SI.Quantity
    assert (q(2,'W/m**2')*q(3,'m**2')*q(2,'s')).to('J').magnitude==12
    assert (q(12,'J')/(q(Fraction(2,3),'W/m**4')*q(2,'s'))).to('m**4').magnitude==9
    return [first,'J','Il suono può propagarsi in gas, liquidi e solidi; le sue proprietà dipendono dal mezzo','Da 12 a 6 J',inv.subs({E:first,A:3,T:2}),invA.subs({E:first,I:2,T:2}),f(2,1)/first,24-first,'I = E / (A Δt)','κ₁ κ₂',second/first,(first+second)/2,invA.subs({E:sp.Rational(4,3)*first,I:4,T:2})/3,inv.subs({E:48/(36/first),A:2,T:2}),inv.subs({E:third,A:5,T:2}),root[0]]

MANUAL=['I=2 W/m², A=3 m², Δt=2 s danno E=12 J.', 'W·s=J; intensità per area per tempo.', 'criterio fisico prima delle opzioni: il suono richiede un mezzo materiale e può propagarsi in gas, liquidi e solidi; la velocità dipende da inerzia e proprietà elastiche, non da una costante universale né dalla sola classificazione del materiale. Le opzioni sono ancora ignote e non anticipo una stringa chiave.', 'I=1 con A=3 dà E=6 J.', 'I=E/(AΔt)=12/(3·2)=2 W/m².', 'A=E/(IΔt)=12/(2·2)=3 m².', 'A=1 a I=2 dà E_B=4 J, rapporto 1/3.', 'e=24−12=+12 J.', 'I=E/(AΔt), con Δt=2 s come quantità dimensionata, non un due privo di secondi.', 'rapporto κ₁κ₂ per stessa durata.', 'B con I=4, A=2 dà E_B=16 J, rapporto 4/3.', 'media (12+16)/2=14 J; ingressi medi I=3, A=5/2 danno 15 J, maggiore per 1 J.', 'target E_B=16 a I_B=4 richiede A_B=2 m², rapporto con 3 pari a 2/3.', 'gain 36/(12 J)=3 J⁻¹; S_B=48 dà E_B=16; A_B=2 porta I_B=4 W/m².', 'gain (33−25)/(16−12)=2 J⁻¹, offset 1. S_C=21 dà E_C=10; A_C=5 porta I_C=1 W/m².', 'I=cA con c=2/3 W/m⁴; E=cΔt A². Dato E=12 J, A²=9 m⁴ e ramo A=3 m² positivo; I=2 W/m². Il quadrato dell’area ha dimensione m⁴, non m².']
DISTRACTORS=['6 è potenza W; 24 conta durata due volte. E_ass 12 richiederebbe assorbimento completo non assegnato.', 'W potenza, W/m² intensità, m² area, J/s² dimensione diversa. W·s=J.', 'Suono non solo aria, non velocità universale, non vuoto; oscillazione locale non richiede viaggio della singola particella. Nei solidi esistono anche modi elastici trasversali.', '24 inverte rapporto; 3 dimezza due volte; 12 ignora I nuova; zero fuori dominio positivo.', '4 omette tempo e dà J/m²; energia assorbita senza frazione non determina I incidente.', '6 omette durata; radice darebbe lunghezza, non area richiesta. La forma della superficie non serve per I uniforme.', '3 reciproco; 1/9 quadra un’area già data; 2 copia I; 1 ignora riduzione.', '−12 ordine inverso; 24 proposta; zero accetta; 6 copia la potenza numerica non lo scarto di energia.', 'EA/Δt W·m²; EΔt/A J·s/m²; AΔt/E intensità inversa; E/A energia per area senza durata.', 'Quozienti invertono dipendenze; κ₂² quadra l’area già assegnata; somma due per stati identici.', '3/4 reciproco; 2 solo I; 2/3 solo area; 16 energia finale numerica non rapporto.', '28 somma; 7 doppia metà; 4 differenza; 15 modello agli ingressi medi, maggiore 1 J.', '3/2 reciproco; 4/3 target; 2 numero di area B; 1/3 darebbe 8 J anziché 16.', 'S 48 come J dà 12 W/m², triplo; non misura direttamente intensità né assorbimento.', 'I 2, 4, 1/2 generano S 41, 81, 11; 21/10 usa S come E e genera S 43, non 21.', 'A²9 m⁴ implica A 3 m²; negativo viola A e I positive. Non applicare un’altra radice per un lato che non è richiesto.']
ASSUMPTIONS=['Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Solo 03: regime usuale di piccole perturbazioni meccaniche nei mezzi materiali. Gas e liquidi sostengono modi longitudinali, solidi anche modi trasversali; nessun valore universale della velocità o trasporto della stessa particella dalla sorgente al ricevitore.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.', 'Onda progressiva a incidenza normale; intensità media incidente I>0 uniforme sulla superficie A>0 e costante per Δt=2 s. Media definita su molti cicli, energia media del modello E=IAΔt. Riflessione, trasmissione e assorbimento successivi non determinati senza ulteriori dati. Vincoli fra prove non disuniformità all’interno della superficie.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'W/m**2', 6: 'm**2', 7: '', 8: 'J', 9: 'W/m**2', 10: '', 11: '', 12: 'J', 13: '', 14: 'W/m**2', 15: 'W/m**2', 16: 'm**2'}
NUMERIC_UNITS={1: 'J', 5: 'W/m²', 6: 'm²', 14: 'W/m²', 16: 'm²'}
SUFFIX={8: ' J', 12: ' J', 15: ' W/m²'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Tre quadrati 50×50 px a 50 px/m rappresentano 3 m², vista frontale; ⊙ verso il lettore e freccia laterale schematica indicano incidenza normale. Ogni m² riceve 2 W e in 2 s 4 J: 12 J totali. Timeline due caselle 60 px a 60 px/s, ciascuna 6 J. Esempio distinto assegna α=1/2: barre 120/60 px a 10 px/J per 12 J incidenti e 6 J assorbiti, senza inferire assorbimento nei quesiti.'

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


CANDIDATE_REF='9aa69c9434d1022c29202618b0a3c544e331478d'
SOURCE_READING='All 80 B135–139 U4-01 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A130–134 and knows oscillator laws from that work; no claim of ignorance of the physics. All 16 final candidate records, options, blocks, hints, feedback, metadata and figure captions read completely, with full SVG XML and native rendering. Never imports authoring. Existing C5-L01/L02/L03/L04/L05 and C1-L003/L005/L006/L008 lessons reread during this U4 work.'
REVIEWED_PACKAGE_SHA256='1d507f284147ab9d5d9a7c423f4f62a0ae591a477a827400e3f177c42ee69f6d'
REVIEWED_BINDINGS_SHA256='c94a7a86c998ed17a082842526ac72b77dcf61bd7970654826d45afd509621e8'
REVIEWED_CANDIDATES={'AR-u4-wave-energy-through-area-01': 'bc4825ad213b879b04ec0110cff596bc52d2329e401d99315cdd18b0ae32da9e', 'AR-u4-wave-energy-through-area-02': '401e1f74c5e5867fb1fe16d7981146d9c40747f21cb0a4e11cfb9c4f14efdb7a', 'AR-u4-wave-energy-through-area-03': 'bd91f63ed14509b5fa14fcb2d3886b675e5be58b38b88df84e02d0ee317c5504', 'AR-u4-wave-energy-through-area-04': '80e74ea979933dc71dc9d0f02159b539b829ab1f384c25543ecd15188a58904d', 'AR-u4-wave-energy-through-area-05': 'b73e472e3375bc3284fad1a1e931073d667fbe0798c7930e6e8ce3391aa46446', 'AR-u4-wave-energy-through-area-06': 'b9430d51cd624655beaed6edc16728199e59a46b7824f55b5b3fadb7a8f93da9', 'AR-u4-wave-energy-through-area-07': 'a9ece8d58ee7cc85f77223a7cb94d308f7cbc129bdb69af3fd4459185d7d17fe', 'AR-u4-wave-energy-through-area-08': '757c01ecbbdbda9b508e4decd8652d7d31a5b1ebf7a69eac0147a8915b575410', 'AR-u4-wave-energy-through-area-09': '10abcaa74485b32a8c0ad57cb9fe877bde8ceeb0365bc7febafcbbedf650b5df', 'AR-u4-wave-energy-through-area-10': '622100831760b7c3332ee18b3a710841722f8714929bcc0a4e8c1eee9edf3638', 'AR-u4-wave-energy-through-area-11': '17b0689353f11ac497b4c7e0f978bc37a4c6ce43bb3af42a2c8db9a12534ffc5', 'AR-u4-wave-energy-through-area-12': '32c2c19ffc677a250ce7c5cc7e0b42a22b51ac76ca191bb6d65a85da49fa71e2', 'AR-u4-wave-energy-through-area-13': '21fe92ae62cbd2afc0e646ed2b863e6663c500b9936ae1045a7ed84fccdbef4e', 'AR-u4-wave-energy-through-area-14': 'bd2f9867028c5aeb93b11879ea25a5af96590968e3d03429df95034376a06419', 'AR-u4-wave-energy-through-area-15': '2809bd25f81b76a2540bcf8eeb68c6735df6cb17f8e6b16c7cfa9da130e9e56e', 'AR-u4-wave-energy-through-area-16': '9350355a0783a366c8e852d9be7e82f28633a5725dc30f4d9d6e0855a65843b5'}
READ_SOURCE_SHA256={'u4-wave-energy-through-area-01': '4f5f89d9e3f9ad54e62122bc8a1d19acb4d755ab2fcf2dad998f2306a7339876', 'u4-wave-energy-through-area-02': 'a4ecd347e853877ec3e7239cb318c5a5ac33ef5a02249262db9c81b1879eeb29', 'u4-wave-energy-through-area-03': '4af022329f688974ab312fe15f4be8053f2102228f5d6cedd511b4550ac4b220', 'u4-wave-energy-through-area-04': 'dd93a780716fd7d105bd144cfe23fce16570a54eb85c786741f4f99eafe18397', 'u4-wave-energy-through-area-05': '5cac2048bc7fe8cd942e553f523714e128c27bc9d943b13d6fb2db9ff2b34305', 'u4-wave-energy-through-area-06': '23e11cc9250aba40ad9fdb67ffa9ce766af2f8889e960f629332772c119c4823', 'u4-wave-energy-through-area-07': '69235a7d4ac401665c81decf809e70f22f0a31a8ccefbc83d043e64e0b4494d4', 'u4-wave-energy-through-area-08': 'ffd9ce19ec933f9af3d48588d3637b1256861a826620f605866b7dc1237d20e3', 'u4-wave-energy-through-area-09': '4cf26e7937540ba355c27e7153f2ceeeb0079b1ffa03c9336c9fb62a16ebe479', 'u4-wave-energy-through-area-10': '3209775e14cd32e62ca9755866e4b56002633d957d342dd9f0f9e13a4222aef5', 'u4-wave-energy-through-area-11': 'd122e8b685635f9f6396ac2879a3aed0011a5463bb934e66d1a1f72cdc45a411', 'u4-wave-energy-through-area-12': 'bdb8ebc86fcfaa3d1d3d032b69cf1b6f5b4cd70888eee42d61d5db1f5ee5f405', 'u4-wave-energy-through-area-13': '8a7e75986a54943fe7e48345912a864ac304f9ae0d4963372d4f9341a73ac648', 'u4-wave-energy-through-area-14': '3c9acb889a70ff89b4c5372957a9a8a3a4227031da7b4459bb78027624191892', 'u4-wave-energy-through-area-15': 'a194db2442780fd8bc5d5224540cb6e485e8e92251e15c1a408ccc552ebbcbac', 'u4-wave-energy-through-area-16': 'acad7ce0645c0a692745b990a7e02fcfe4267255405d9148d5deaf7ef0281c06'}
