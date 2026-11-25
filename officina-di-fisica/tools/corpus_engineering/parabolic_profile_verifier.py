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
FAMILY='parabolic-profile'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L007'

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

    V,u,v,k,l=sp.symbols('V u v k l',positive=True)
    # Given axisymmetric no-slip profile, checked independently by cross-section integral.
    law=V*(1-u*u);area_mean=2*sp.integrate(law*u,(u,0,1))
    if area_mean!=V/2:raise ValueError('Independent parabolic area mean failed')
    inv=sp.solve(sp.Eq(v,law),V)[0]
    ratio=sp.simplify(law.subs({V:k*V,u:l*u})/law)
    unique([v/(1-u*u),v*(1-u*u),v/(1-u),v/u**2,sp.sqrt(v/(1-u*u))],inv)
    unique([k*(1-l*l*u*u)/(1-u*u),k*(1-u*u)/(1-l*l*u*u),k*l*l,k/l**2,(1-l*l*u*u)/(1-u*u)],ratio)
    f=lambda maximum,relative:law.subs({V:maximum,u:relative})
    a,b=sp.Rational(1,2),sp.Rational(1,3)
    first,second=f(4,a),f(9,b)
    gain,offset=calibrate(first,second,7,17);C=(sp.Rational(29,2)-offset)/gain
    if (gain,offset,C)!=(2,1,sp.Rational(27,4)):raise ValueError('Independent parabolic affine calibration failed')
    if (first+second)/2-f(sp.Rational(13,2),sp.Rational(5,12))!=sp.Rational(37,288):raise ValueError('Independent local-speed mean failed')
    x=sp.Symbol('x',real=True);poly=8*x**3-8*x+3
    if sp.expand((2*x-1)*(4*x*x+2*x-3))!=poly:raise ValueError('Independent factorization failed')
    roots=sp.solve(poly,x);accepted=[z for z in roots if z>0 and z<1]
    if len(accepted)!=2 or set(accepted)!={a,(sp.sqrt(13)-1)/4}:raise ValueError('Independent interior root filtering failed')
    if not (sp.Integer(3)<sp.sqrt(13)<4):raise ValueError('Independent manual radical bound failed')
    t=sp.Symbol('t',nonnegative=True)
    # XML control points: exact polynomial parameterization, not just 3 sampled points.
    px=100*(1-t)**2+2*250*(1-t)*t+400*t*t
    py=290*(1-t)**2+2*290*(1-t)*t+530*t*t
    if sp.simplify((530-py)/60-f(4,(px-100)/300))!=0:raise ValueError('Independent SVG profile curve failed')
    if SI.Quantity(1,'cm/s').to('m/s').magnitude!=Fraction(1,100):raise ValueError('Independent speed conversion failed')
    return [first,'cm/s','Sull’asse v=v_max; alla parete v=0','Da 3 a 27/4 cm/s',inv.subs({v:3,u:a}),sp.sqrt(1-sp.Rational(3,4)),f(4,b)/first,6-first,'v_max = v / (1 − u²)','κ₁ D / U',second/first,(first+second)/2,b/a,inv.subs({v:24/(9/first),u:b}),inv.subs({v:C,u:a}),'Due']

MANUAL=['u=1/2 dà u²=1/4 e 1−u²=3/4. V=4 cm/s produce v=3 cm/s, fra zero e V.', 'u=s/R è puro; v mantiene unità cm/s e dimensione L/T. 1 cm/s=10⁻² m/s. Nessun calcolo numerico autonomo richiesto.', 'Profilo esteso ai bordi: u=0 dà v=V sull’asse; u=1 dà v=0 per aderenza alla parete. La media d’area è V/2 da integrale 2∫₀¹ V(1−u²)u du.', 'Fattore locale 3/4 invariato: V=4→9 dà v=3→27/4 cm/s; confronti fra regimi stazionari.', 'V=v/(1−u²)=3/(3/4)=4 cm/s. Denominatore positivo per u<1; V supera la misura locale.', 'u²=1−v/V=1−3/4=1/4. Radice positiva u=1/2 perché s è distanza; negativo non è coordinata radiale ammessa.', 'B a u=1/3: v=4(1−1/9)=32/9 cm/s. Rapporto con 3: 32/27.', 'Proposta 6 supera già V=4; corretto 3 e scarto con segno 6−3=+3 cm/s.', 'Dividere v=V(1−u²) per la parentesi positiva: V=v/(1−u²). Non si estrae la radice di V, che compare alla prima potenza.', 'U=1−u_A², D=1−κ₂²u_A². v_B=κ₁V_A D e v_A=V_A U danno κ₁D/U; dominio κ₂u_A<1.', 'B: V=9, u=1/3, v=9·8/9=8 cm/s. A=3; rapporto 8/3.', 'Media (3+8)/2=11/2 cm/s. Ingressi medi V=13/2, u=5/12 danno (13/2)(119/144)=1547/288; 11/2 meno questo valore è 37/288 cm/s.', 'Target v_B=(8/3)3=8 e V_B=9: u_B²=1/9, u_B=1/3. Rapporto (1/3)/(1/2)=2/3.', 'Gain 9/(3 cm/s)=3 s/cm. S_B=24 dà v_B=8; V_B=8/(8/9)=9 cm/s.', 'Gain (17−7)/(8−3)=2 s/cm, z=1. S_C=29/2 dà v_C=(27/2)/2=27/4; V_C=(27/4)/(3/4)=9 cm/s.', 'V=(8 cm/s)u: 8 u³−8 u +3=0=(2 u −1)(4 u²+2 u −3). Radici 1/2,(√13−1)/4,−(1+√13)/4. 3<√13<4 prova 1/2<u_b<3/4; due distinte interne e una negativa. Conteggio due, senza decimalizzare radicali.']
DISTRACTORS=['2 cm/s usa la riduzione lineare 1−u; 4 ignora la posizione; zero colloca il punto alla parete.', 'cm è lunghezza; 1 unità di u; s/cm velocità inversa; cm²/s ha una lunghezza di troppo.', 'Invertire i limiti contraddice l’aderenza. Valori uguali indicano un profilo piatto; V/2 è media d’area, non massimo.', '4/3 applica il rapporto inverso 4/9 alla velocità iniziale 3. 9 copia il massimo; invariata e zero ignorano le condizioni.', 'Moltiplicare ancora per 3/4 produce 9/4 cm/s, inferiore al locale e quindi impossibile come massimo.', '1/4 è u²; la distanza dimensionale s non è identificata senza R. Il ramo negativo non è una distanza radiale.', '27/32 è il reciproco; 8/9 il fattore locale di B; 2/3 il rapporto delle distanze; 1 ignora lo spostamento.', '−3 inverte l’ordine; 6 copia la proposta; 0 la accetta; 3/2 dimezza lo scarto.', 'Moltiplicare riduce ancora. 1−u e u² omettono parti del profilo; la radice finale ha dimensione errata.', 'U/D inverte la geometria; i semplici fattori di κ₂ ignorano il termine uno. D/U omette il cambiamento del massimo.', '3/8 è il reciproco; 9/4 segue solo i massimi; 32/27 segue solo i fattori locali; 8 è la velocità numerica.', '11 è somma; 11/4 dimezza ancora; 1547/288 usa ingressi medi; 5 è differenza.', '3/2 è il reciproco; 1/3 è la coordinata B; 8/3 il target di velocità; 4/9 il quadrato del rapporto delle coordinate.', '24 è il display e 8 la velocità locale. Occorre ancora dividere per 8/9 per ricostruire il massimo.', 'Massimi 4,8,27/4,18 cm/s danno letture 7,13,89/8,28 a u=1/2; solo 9 cm/s dà 29/2.', 'Una soluzione tronca dopo il primo fattore; tre conta la radice negativa. Nessuna e infinite contraddicono la fattorizzazione e la cubica non nulla.']
ASSUMPTIONS=['Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.', 'Tubo diritto rigido circolare, liquido newtoniano incomprimibile, laminare stazionario pienamente sviluppato, parete ferma e no-slip. Profilo assegnato v=V(1−u²), V>0, u=s/R distanza radiale pura. Numeri interni 0<u<1, asse/parete come limiti espliciti; vincoli fra prove e non nel tempo.']
UNITS={1: 'cm/s', 2: 'cm/s', 3: 'cm/s', 4: 'cm/s', 5: 'cm/s', 6: '', 7: '', 8: 'cm/s', 9: 'cm/s', 10: '', 11: '', 12: 'cm/s', 13: '', 14: 'cm/s', 15: 'cm/s', 16: ''}
NUMERIC_UNITS={1: 'cm/s', 5: 'cm/s', 6: '1', 14: 'cm/s'}
SUFFIX={8: ' cm/s', 12: ' cm/s', 15: ' cm/s'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Profilo origine(100,530), scale u 300 px/unità e v 60 px/(cm/s). Bezier P 0(100,290), P 1(250,290), P 2(400,530): u=t, v=4−4 t², quindi passa esattamente per(1/2,3), non interpolazione arbitraria. Quattro celle uguali mostrano 3/4, dichiarate non aree del tubo. Pannello distinto vincolo V=8 u e v=3, fattorizzazione e due radici interne con bound 3<√13<4, massimi diversi fra prove.'

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


CANDIDATE_REF='f5c8b2b9cca71bee24d17eed6078d9c86c250080'
SOURCE_READING='All80 original U3-04 prompts in B112–116 individually read from pinned Git source and derivations persisted before candidate packages were opened. No numeric result or key was handed off before source-first derivation for this family. All16 final candidates, every option, formula, hint, feedback and figure caption read in full; scientific SVG XML and full native rendering read. Never imports candidate authoring. Real C2-L005/L006/L007/L008/L009 lessons reread during this U3-04 work.'
REVIEWED_PACKAGE_SHA256='9786abf87ab2e62952c501aa4a59b49b732c26c7aa8c3301301461cc81d445a4'
REVIEWED_BINDINGS_SHA256='b9b01bf5c51245149a7a57be592a4a845414317ef3f87c980d3a360c92996626'
REVIEWED_CANDIDATES={'AR-u3-parabolic-profile-01': '14e58634aaf849aba495bf436fe3024149c8d63e956128cecb0bc4e7489a89ca', 'AR-u3-parabolic-profile-02': 'dfc7094cbed97628011285f9f76d783c73f632fd13827d6a86c9ace2d1943642', 'AR-u3-parabolic-profile-03': 'f4b02ac0270157697abfd653d4d537b4ac750f59d207ac0cbb6f6ec898255eb3', 'AR-u3-parabolic-profile-04': '4a419a528586b5b1731744106b16a580afed6df4409fc32ecac11f3e436b22f3', 'AR-u3-parabolic-profile-05': '4de54769fb7bba0a090c85701c021428ebcd74fddb2226b103b41cb376226724', 'AR-u3-parabolic-profile-06': '1e032a3d918ba9cf3e8222087894770fc3cbf57eb37dfe58b080dcf1ac7b5a4b', 'AR-u3-parabolic-profile-07': 'f2f296fa1cc4e21e5a8d097892969b2485353e0bc2a9cd228436a53b61bb0042', 'AR-u3-parabolic-profile-08': '68bb1c3d137fd79ceb6d9806b58456246703cb39bb804062060ba8f5c59b1fe2', 'AR-u3-parabolic-profile-09': 'ab5010b4103f197282f232ce1e1a91f5812c99014065d0d774fd72c94be99f50', 'AR-u3-parabolic-profile-10': '1cfb7aac2d752de0d5f1ef2d1c9918cfe1e7de3f5302fbd7fea11e7787461aa4', 'AR-u3-parabolic-profile-11': '2bfb051b04c680a457fadcac82f7a376f9f4659b2ecf14175fc12e5972706aa2', 'AR-u3-parabolic-profile-12': 'f16d41b90123e5863edaabc32f39db14af0a201edd1ef36d2f1bfecba293e56f', 'AR-u3-parabolic-profile-13': '2264f9c2ce5d2d1df455ea9b4642b4bac17f0b736e7c6fc873568c5f11b81392', 'AR-u3-parabolic-profile-14': 'ab1eba608c0cda3a1d722ca1993b31bc5aa3e96ff2542f1f70723b7c6bff2ec8', 'AR-u3-parabolic-profile-15': '9f1bf047480a5666c97a100c7fe600156e8332eb3646dd163b578f59600563dd', 'AR-u3-parabolic-profile-16': '764f3de39dd893c92d5156f3d348d85d0085671b8c6481aa3c4801ec578ba1b1'}
READ_SOURCE_SHA256={'u3-parabolic-profile-01': 'da563baf963bd74c5576de0bb15c4ce81355c879f3c794fb80957aebed56ba56', 'u3-parabolic-profile-02': '366f6239e7568ff923ec70034e3cca14fa1b02ecdbe8676df4f5d0da2e798139', 'u3-parabolic-profile-03': '3caf3d8af61c15e4789fdf815c7890ccec8aefa07942eb404876a47fbf561af6', 'u3-parabolic-profile-04': '322242d7e161412fbb810323cc9f3f7c0168556aa1cd769c3139a4ee746a09a8', 'u3-parabolic-profile-05': 'c358c9cce9c48778566a9c30e155d7d9f0bb3f23f4962345241327599d0bd767', 'u3-parabolic-profile-06': '997789d82766fd067cea00204744715c0f226a0b8cf38cfbaeab9ae6e3807570', 'u3-parabolic-profile-07': 'dba1fc19d578a859f48a454d9a06f143076602ef13a85e48c877ee6eca3b95aa', 'u3-parabolic-profile-08': '1762b495d584df190aa73ac7975136e52971120214d2c8a678e3d5a00ae9e25a', 'u3-parabolic-profile-09': '5f435d52ba6330efd461cc8443067b5ac90554f660f4c23c5731d390b1f1a761', 'u3-parabolic-profile-10': 'dfce39cf5f0731c05f96f8905a82b0793cae29d7a8b0291d18043c9e3670a930', 'u3-parabolic-profile-11': '20b4a5af50b3d89066e6b0f02e92af55c94b60f51a9578a5a344e387620aceed', 'u3-parabolic-profile-12': '897cadcd28dc70136beefe23f25354ac1a6bc3b8457453f2427bd61cc19f40a0', 'u3-parabolic-profile-13': '558cd575e01d0935318edfff49a053909342291f9be1656a7861016a1dc9ea10', 'u3-parabolic-profile-14': '1c613c48093b4e5310b7f8fcc340fb5273ccf08b113ff84634ec8e32b4631768', 'u3-parabolic-profile-15': '3d0b4380d23b83c8769c2625f534e314c63f8c830e6e236fb41fa9af99476b86', 'u3-parabolic-profile-16': '0c94c84895539e3ca9c6eb7f47f9b361d089756801b0b51ac91038bf2de15c82'}
