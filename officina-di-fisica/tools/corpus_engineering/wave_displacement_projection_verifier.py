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
FAMILY='wave-displacement-projection'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={1: 'C5-L02', 2: 'C5-L02', 3: 'C5-L02', 4: 'C5-L02', 5: 'C5-L02', 6: 'C5-L02', 7: 'C5-L02', 8: 'C5-L02', 9: 'C5-L02', 10: 'C5-L02', 11: 'C5-L02', 12: 'C5-L02', 13: 'C5-L02', 14: 'C5-L02', 15: 'C5-L02', 16: 'C5-L02'}

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

    A,c,s,a,b=sp.symbols('A c s a b',positive=True)
    law=A*c
    inv=sp.solve(sp.Eq(s,law),A)[0];invc=sp.solve(sp.Eq(s,law),c)[0]
    ratio=sp.cancel(law.subs({A:a*A,c:b*c})/law)
    unique([A*c,A/c,c/A,A+c,A*c*c],law)
    unique([s/c,s*c,c/s,s/c**2,s+c],inv)
    unique([a*b,a/b,b/a,a*b*b,a+b],ratio)
    first,second=law.subs({A:4,c:sp.Rational(1,2)}),law.subs({A:3,c:1})
    gain,offset=calibrate(first,second,5,7);assert (gain,offset)==(2,1)
    roots=sp.solve(sp.Eq(2,law.subs(A,8*c)),c);assert roots==[sp.Rational(1,2)]
    assert sp.Rational(7,2)*sp.Rational(3,4)-(first+second)/2==sp.Rational(1,8)
    assert sp.simplify(inv.subs(s,law)-A)==0
    q=SI.Quantity;assert (q(4,'mm')*Fraction(1,2)).to('m').magnitude==Fraction(2,1000)
    assert (q(2,'mm')/q(4,'mm')).to('').magnitude==Fraction(1,2)
    return [first,'mm','s = A c_φ','Da 2 a 3 mm',inv.subs({s:2,c:sp.Rational(1,2)}),invc.subs({s:2,A:4}),law.subs({A:4,c:1})/first,4-first,'A = s / c_φ','κ₁ κ₂',second/first,(first+second)/2,invc.subs({s:sp.Rational(3,2)*first,A:3})/sp.Rational(1,2),inv.subs({s:9/(6/first),c:1}),inv.subs({s:(3-offset)/gain,c:1}),roots[0]]

MANUAL=['s=A cφ=4·1/2=2 mm. Controllo0<s≤A. La proiezione disegnata non è la traiettoria della particella.', 's ha dimensione L. cφ puro lascia unità di A, e solo mm fra le alternative è una lunghezza.', 'La legge s=A cosφ diventa s=A cφ perché il valore del coseno è già assegnato. Non si applica un secondo coseno.', 'A6 mm e coseno1/2 danno s3 mm, da2 mm: fattore3/2. È confronto fra prove, non evoluzione della stessa ampiezza nel tempo.', 'A=s/cφ=2/(1/2)=4 mm; maggiore o uguale allo spostamento come richiesto da0<cφ≤1.', 'cφ=s/A=2/4=1/2 puro, ammissibile. Coseno non identifica univocamente la fase, perché periodicità e parità lasciano fasi equivalenti.', 'Nuovo coseno1 a stessa A4 mm dà s4 mm, rapporto4/2=2. Il bordo superiore cφ1 è incluso.', 'Proposto4 mm meno corretto2 mm dà+2 mm. Il limite s≤A non basta a rendere giusta la proposta per il coseno assegnato.', 'Dividere s=A cφ per cφ>0 dà A=s/cφ, dimensione L. Il limite cφ≤1 garantisce A≥s; cφ0 escluso evita divisione indeterminata.', 'Nuovo prodottoκ₁A·κ₂cφ porta rapportoκ₁κ₂. Ancheκ₂cφ≤1 è richiesto: positività sola non garantisce il modello di un coseno.', 'A4,c1/2→s2 mm; B3,c1→s3 mm. Rapporto3/2: ampiezza minore può avere spostamento locale maggiore a fase diversa.', 'Media(2+3)/2=5/2 mm. Ingressi mediA7/2 mm,c3/4 danno21/8 mm; differenza21/8−20/8=1/8 mm. Il coseno medio non è una fase media univoca.', 'Target(3/2)·2=3 mm; con A_B3 mm si impone c_B1. Rapporto con c_A1/2 dà2, limite fisico raggiunto e non superato.', 'q=6/(2 mm)=3/mm. Lettura9 dà s_B3 mm; c_B1 significa A_B=s_B=3 mm. Nel riferimento iniziale s non coincideva con A.', 'q=(7−5)/(3−2) mm=2/mm,b1. S_C3 dà s_C(3−1)/2=1 mm e A_C1 mm perché c_C1. Controllo2·1+1=3.', 'A=(8 mm)cφ rende s=(8 mm)cφ²=2 mm. cφ²1/4, radice positiva1/2 ammessa; A4 mm e s2 mm ricostruiti.']
DISTRACTORS=['4 mm copia A,8 mm divide per c;1/2 è puro. Nessuna stima trigonometrica necessaria.', 'Hz frequenza,mm/s velocità,rad fase,mm² area; nessuna è lunghezza.', 'A/c supera A se c<1; c/A lunghezza inversa; A+c disomogenea; A c² cambia la legge e anche la gestione del segno fuori dal ramo.', '6 copia A,4/3 applica fattore inverso a s2,2 ignora cambiamento,9/2 applica(3/2)² al vecchio s.', '1 mm riproietta s,2 mm copia lo spostamento. Divisione per c strettamente positivo lecita.', '2 reciproco non può essere coseno reale;8 conserva area come prodotto invece del rapporto. Nessun angolo unico richiesto.', '1/2 reciproco,1 nessuna variazione,4 solo numero di mm finale,1/4 quadrato del reciproco.', '−2 ordine inverso,4 proposta,0 la accetta,6 somma. La fase assegnata non va adattata alla proposta.', 's c riproietta; c/s lunghezza inversa; s/c² altra legge; somma s+c non omogenea.', 'Quozienti rendono inverse dipendenze dirette; κ₁κ₂² introduce quadrato; somma2 per stati identici. Dominio impedisce c_B>1.', '2/3 reciproco,3/4 sola ampiezza,2 solo coseno,3 numero di mm finale.', '5 somma,1/2 semidifferenza,3 sola B.21/8 è prodotto delle medie diverso da media dei prodotti.', '1/2 reciproco,3/2 target,3/4 sola A;4 porterebbe nuovo coseno2 non reale.', '9 copia S,4 copia A iniziale. La fase al massimo non elimina la taratura del display.', '3 copia S,2 s_A,4 A_A.1/2 mm darebbeS2 con c1, nonS3; attribuzione finale riletta nel fix72861a39.', '−1/2 viola ramo positivo;1/4 è quadrato;2 impossibile;1 darebbe s8 mm. Coefficiente8 mm è lunghezza e la radice è su rapporto puro.']
ASSUMPTIONS=['Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.', 'Onda armonica lineare, coordinata locale in un punto/istante scelti; A>0 costante entro prova e0<cφ≤1 assegnato esatto. Quindi0<s≤A nel ramo, senza pretendere s positivo per tutto il ciclo. Coseno non determina fase assoluta unica.']
UNITS={1: 'mm', 2: 'mm', 3: 'mm', 4: 'mm', 5: 'mm', 6: '', 7: '', 8: 'mm', 9: 'mm', 10: '', 11: '', 12: 'mm', 13: '', 14: 'mm', 15: 'mm', 16: ''}
NUMERIC_UNITS={1: 'mm', 5: 'mm', 6: '1', 14: 'mm'}
SUFFIX={8: ' mm', 12: ' mm', 15: ' mm'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering integrale letti. Cerchio ausiliario r160 px a40 px/mm per A4 mm, proiezione80 px per s2 mm; punto(340,211.436) rispetto a centro(260,350) approssima solo disegno, non dati. Retta normalizzata da(100,1000) a(420,800), scale320 px/unità e200 px/unità, zero vuoto escluso e uno pieno incluso; punto c1/2 a(260,900). Barre120/180 px a60 px/mm danno2/3 mm. Nessuna traiettoria circolare o legge oraria nel grafico del parametro.'

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



CANDIDATE_REF='72861a391103ac1401565eef72bf2df93956faec'
SOURCE_READING='All 48 B145–147 U4-02 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A141–144 and already knows superposition laws; no claim of ignorance of the physics. All 16 final candidate records, every option, block, hint, feedback, metadata and caption read completely, with complete SVG XML structure and native rendering. Never imports authoring. Actual C5-L01/L02/L03/L05 and C1-L001 lessons reread. Edition 146 frequencies independently recalculated from its declared close-carrier parametrization; separate Doppler03/16 preserved. Edition147 frozen only after rereading final feedback15 at72861a39.'
REVIEWED_PACKAGE_SHA256='1f9c1dfc3d5b02b6873d2a801a1cb50f8245dab7d8659160095705616935d1c6'
REVIEWED_BINDINGS_SHA256='83bfdfa882f71ca26751500a8628fc31c21b4d17584084ffb3fc7db7f64df5a0'
REVIEWED_CANDIDATES={'AR-u4-wave-displacement-projection-01': '977cf5ce768b0722d231d16031a64d6e474192963df59e6d03f5a422fd85d9ed', 'AR-u4-wave-displacement-projection-02': '548f312715f9f8e7d2c99cc2552ebc200641ae87ae8c65222c3603a4ae34da13', 'AR-u4-wave-displacement-projection-03': '3ea12691ba690257a3b64f1c90d9a18dbffbbc2f0182eca0b30821f3e0fa01bb', 'AR-u4-wave-displacement-projection-04': '29225d3ba682bb6627e5caf9170c13b124a9799409ccecf544f2ee59456e8599', 'AR-u4-wave-displacement-projection-05': 'afa02e3ba9599f91b7d4ab5bf60aaa67b857f8ab167ac46a663b23eafa10fa40', 'AR-u4-wave-displacement-projection-06': '1f60cc970e244a02df730a3b8471c2723f60047aebb381d14edb878c28b8fa8b', 'AR-u4-wave-displacement-projection-07': 'c8e1f3ff29a6c84fcc09c1609508b6d17e449c168a49ff918fc88021b2c0f38f', 'AR-u4-wave-displacement-projection-08': '8d17afc588a31a4487178eca91383feefccb5a932bb031abbf415f44095b65c9', 'AR-u4-wave-displacement-projection-09': '3c2e8a06fe80e95059992b1036248eff7629917ad43ccaa52a2347be96547e91', 'AR-u4-wave-displacement-projection-10': 'f0950a1ccfdde3506609e29704312c5c0cff0bdf4893ed6a76b235c44f96c786', 'AR-u4-wave-displacement-projection-11': 'e10139436310cf9dfd67e19a5bd3f1efdc413b78ea04cd82d18ce63874f310df', 'AR-u4-wave-displacement-projection-12': 'feda1a363ed94b17c88317c7037f5473dddf4ac641eafe1e50cc519aff9ae57e', 'AR-u4-wave-displacement-projection-13': 'acaacfe8b3223a22ff0e8192e653447f2bae4673b7685bd0093df1d08f576ded', 'AR-u4-wave-displacement-projection-14': '5d08327aa4f98f6711776d01717ce4c9489838d62fdf3aa956e9c83a2bd3240e', 'AR-u4-wave-displacement-projection-15': '68832636982244f9a1615e321a448c529e7c276863bb1c0daa54d016a2be3556', 'AR-u4-wave-displacement-projection-16': '77cf81f5f380c6a2f6a8eb3ef45ed79391dcfe50eaeee9974a24a4a492df2815'}
READ_SOURCE_SHA256={'u4-wave-displacement-projection-01': 'd0745d8220f4fa5d264d3c43951125fa10e279d89bdf0b72f4eadfa40034b4e5', 'u4-wave-displacement-projection-02': 'fa86dc6d880a45efdc4da3c8afa5af47a2a614dc7f2e21aadf109d497599541e', 'u4-wave-displacement-projection-03': '741bf0721953c44b02ed61d3609d597ec6a0e9b8f2e9cdcb4d65fb08044d2002', 'u4-wave-displacement-projection-04': 'aee92d38e8bc3b632359493295ccc7b63ab87f44d550f7b7a8788aee3ad148bf', 'u4-wave-displacement-projection-05': 'cbc38fcb237cbd24828e5e0a49469714fc42e9cfa50d0231a878eefd20690578', 'u4-wave-displacement-projection-06': '7b19ee28b2e123ec979c8d333739973b28cf2f028c3e8667aa0ec42bddf93560', 'u4-wave-displacement-projection-07': 'cd435f966ff97f387eba1115f2db4f8a192cfc541ee1f2bf54ba1ddc960f0ca7', 'u4-wave-displacement-projection-08': 'ab6a5f95995183c2b840ae52d4b63aa02d7766c965b7fe4966fabbf2c7bc3a2d', 'u4-wave-displacement-projection-09': 'f92c383e977c68439a40c173c6ba58e904b0262ee07feea8928104c520aa009e', 'u4-wave-displacement-projection-10': 'f51c60027c71984373f2ad9c52ec9bd3204ba49a86da365754280f73f8da243d', 'u4-wave-displacement-projection-11': '00c11535fd977e0fd29c86ea1fb6b14846dca2047ef0d2f750e460548a122c24', 'u4-wave-displacement-projection-12': 'eb54a35d902541335d3fc1eb4a37a8a1efbc4ef193359aae84b3a9e6bdff760e', 'u4-wave-displacement-projection-13': '920b647a4647641fb7e88020a49550d03c3415545b10efdcda4f12dfdf8715ef', 'u4-wave-displacement-projection-14': '187d4d4f09da74cd61045e47bb7b26ce3c5d696982f27f0df75ac81e73d0a353', 'u4-wave-displacement-projection-15': '55ca1e023d25fe96a56e8e13459be890fffcf18221ba8f446beb4c9430976ddb', 'u4-wave-displacement-projection-16': '489e80215b33f7e8bc00ba1c7dd4de14894e6f835b8928925d0c6122aa5cce59'}
