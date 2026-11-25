"""Independent source-first U5-03 phase-process review; no authoring imports."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-03.json'
FAMILY='subzero-ice-melting'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:"C3-L04" for n in range(1,17)}
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


def heat(mass,interval):
    mass,interval=map(sp.sympify,(mass,interval))
    if mass<=0 or not 0<interval<sp.Rational(27315,100):raise ValueError('Ice mass positive and initial absolute temperature above zero required')
    return mass*(2*interval+300)
def inverse_mass(energy,interval):
    if energy<=0:raise ValueError('Positive absorption required')
    return sp.cancel(energy/heat(1,interval))
@lru_cache(maxsize=1)
def oracle():
    m,c,d,L,E,a,b,z=sp.symbols('m c d L E a b z',positive=True)
    law=sp.integrate(m*c,(z,0,d))+m*L
    assert sp.expand(law-m*(c*d+L))==0
    inv=sp.solve(sp.Eq(E,law),m)[0]
    ratio=sp.cancel(law.subs({m:a*m,d:b*d})/law)
    unique([m*(c*d+L),m*(c*d-L),m*c*d+L,m*L,c*d+L],law)
    unique([E/(c*d+L),E*(c*d+L),(c*d+L)/E,E/(c*d),E/L],inv)
    unique([a*(c*b*d+L)/(c*d+L),a*b,a/b,a+b,(c*b*d+L)/(c*d+L)],ratio)
    A,B=heat(1,10),heat(2,20);gain,offset=calibrate(A,B,641,1361);assert (gain,offset)==(2,1)
    theta=sp.symbols('theta',real=True);roots=sp.solve(sp.Eq(sp.Rational(1,10)*theta*(2*theta+300),320),theta);assert roots==[-160,10]
    assert heat(1,10)==320 and heat(2,20)==680 and heat(sp.Rational(3,2),15)==495
    assert inverse_mass(640,10)==2 and SI.Quantity(2,'J/g/K').to('J/kg/K').magnitude==2000
    assert (SI.Quantity(1,'g')*SI.Quantity(320,'J/g')).to('J').magnitude==320
    return [A,'J','Q = m (c_i θ + L_f)','Da 320 a 640 J',inverse_mass(A,10),(A-300)/2,heat(1,20)/A,640-A,'m = Q / (c_i θ + L_f)','κ₁ (c_i κ₂ θ_A + L_f) / (c_i θ_A + L_f)',B/A,(A+B)/2,((sp.Rational(17,8)*A/2-300)/2)/10,inverse_mass(2040/(960/A),20),inverse_mass((1281-offset)/gain,10),next(r for r in roots if r>0)]

MANUAL=['Il grammo assorbe 2·10=20 J prima della fusione e 300 J durante la fase: Q=320 J. Il secondo tratto è a temperatura costante.', 'La somma di due trasferimenti energetici è in joule: g·J/(g K)·K e g·J/g danno entrambi J; W richiederebbe una durata.', 'Integrare mc_i dT fra −θ e 0 dà mc_iθ; fondere l’intera massa aggiunge mL_f. Quindi Q=m(c_iθ+L_f), positivo nei due tratti.', 'Con θ=10 K fisso, il costo è 320 J/g. Una massa da 1 a 2 g porta Q da 320 a 640 J: dipendenza lineare, nessun quadrato.', 'm=Q/(c_iθ+L_f)=320/(20+300)=1 g. Il denominatore è 320 J/g e non una capacità specifica in J/(g K).', 'Q/m−L_f=320−300=20 J/g. Dividendo per c_i=2 J/(g K) si ottiene θ=10 K, sotto il limite assoluto del modello.', 'A richiede 320 J; a massa uguale B con θ=20 K richiede 340 J. Rapporto 340/320=17/16, non 2: il costo latente non raddoppia.', 'La proposta è 640 J e il valore corretto 320 J: proposta meno corretto è +320 J. Il segno si riferisce allo scarto.', 'Dal bilancio Q=m(c_iθ+L_f), dividere per l’energia positiva richiesta da un grammo dà m=Q/(c_iθ+L_f).', 'Sostituire m_B=κ₁m_A, θ_B=κ₂θ_A prima del rapporto: κ₁(c_iκ₂θ_A+L_f)/(c_iθ_A+L_f). Nessuna legge temporale implicita.', 'A: 1 g, 10 K dà 320 J. B: 2 g, 20 K dà 680 J. Rapporto 680/320=17/8; controllati entrambi i contributi.', 'Media delle energie (320+680)/2=500 J. Con ingressi medi 3/2 g e 15 K si ottiene 495 J, differenza esatta 5 J.', 'Il bersaglio 17/8 di 320 J è 680 J. Con 2 g servono 340 J/g: θ_B=(340−300)/2=20 K, rapporto 2.', 'A: Q=320 J, S=960 dà q=3 J⁻¹. B: S=2040 dà Q=680 J. A θ=20 K il costo è 340 J/g: massa 2 g.', 'Riferimenti 320 e 680 J con letture 641 e 1361: q=720/360=2 J⁻¹, b=1. S_C=1281 dà Q_C=640 J; a 10 K massa 2 g.', 'Fra preparazioni m=(1/10 g/K)θ. Il bilancio a Q=320 J diventa x²+150x−1600=0, x=θ/K. Si cercano due interi di prodotto −1600 e somma 150: 160 e −10. Quindi (x−10)(x+160)=0, con radici 10 e −160; soltanto 10 dà θ>0 e m>0, massa 1 g.']

DISTRACTORS=['300 J e 20 J omettono un tratto; 280 J sottrae due assorbimenti; 640 J duplica la massa.', 'J/(g K), J/g e K sono capacità specifica, costo specifico e intervallo; W richiede tempo.', 'Il segno meno non descrive due assorbimenti; omettere massa da un termine altera le unità.', '320 J ignora il cambio di massa; 1280 J usa il quadrato; zero è impossibile con massa positiva.', 'Solo L_f dà 16/15 g; solo c_iθ dà 16 g. Nessuno ricostruisce i due tratti.', 'Usare tutto Q come sensibile dà 160 K; il reciproco scambia energia specifica e intervallo.', '2 perde il costo latente; 16/17 è il reciproco; 1 ignora il sensibile cambiato.', 'Segno inverso produce −320 J; copiare la proposta dà 640 J; accettarla dà zero.', 'Q/(c_iθ+L_f) è massa; prodotti o reciproci non soddisfano la legge e spesso cambiano dimensione.', 'κ₁κ₂ moltiplicherebbe anche la parte latente per κ₂; rapporto solo dei fattori perde la somma.', '2 considera solo la massa; 17/16 solo l’intervallo; 8/17 capovolge B/A.', '495 J usa ingressi medi; 1000 J non dimezza; 180 J è metà della differenza.', '17/8 è rapporto di energie, non intervalli; 1 omette il cambio di θ.', 'Omettere q porta massa 6 g; il guadagno positivo deve convertire il display prima dell’inversa.', 'Omettere b dà 1281/640 g e predice S=1282, non 1281. 4 g e 1 g non soddisfano la nuova lettura.', 'La radice −160 rende massa negativa; 20 K dà Q=680 J sotto il vincolo, 320 K viola anche il limite assoluto.']

ASSUMPTIONS=['Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Guadagni e offset del display, quando presenti, convertono letture continue e non impongono integrità numerica.', 'Massa positiva di ghiaccio inizialmente a −θ °C, con 0<θ<273,15 K; fusione completa a 0 °C a pressione atmosferica. Coefficienti ideali prescritti c_i=2 J/(g K), L_f=300 J/g, costanti nel campo considerato. Recipiente e dispersioni trascurati, massa conservata, nessun riscaldamento successivo del liquido. Il vincolo confronta preparazioni diverse, non modifica massa o coefficienti nel tempo interno della singola prova.']

UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'g', 6: 'K', 7: '', 8: 'J', 9: 'g', 10: '', 11: '', 12: 'J', 13: '', 14: 'g', 15: 'g', 16: 'K'}

NUMERIC_UNITS={1: 'J', 5: 'g', 6: 'K', 14: 'g'}

SUFFIX={8: ' J', 12: ' J', 15: ' g', 16: ' K'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='SVG completo letto in XML e rendering nativo a piena altezza. Curva Q/T con coordinate (100,320)→(120,220)→(420,220): 1 coordinata/J e 10 coordinate/K rappresentano 20 J sensibili e 300 J latenti. Barre 24/360/384 per 20/300/320 J, scala comune 6/5; confronto 192/408/300 per 320/680/500 J, scala 3/5. Assi fisici e riferimento Celsius espliciti, nessuna pretesa di pixel fisici dopo resize.'

NON_NUMERIC_DISTRACTORS={}

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


CANDIDATE_REF='5579fe2187e28f34c6dfa8632c07113f46610559'

SOURCE_READING='Primaria indipendente di tutti gli 80 prompt U5-03, prima di candidati, opzioni o chiavi: SHA256 ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9. Fonte intera pin 5cf, SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Dopo la primaria, tutti i 16 candidati del lotto letti integralmente, ogni blocco, formula, opzione, hint e feedback, metadati e didascalie. Derivazioni ricontrollate sui dati finali; SVG XML e rendering nativo integrali letti. Catalogo reale C3-L01/L03/L04 verificato. Nessun authoring importato; autore e revisore distinti. ROOT identico ai byte finali B 9d647bca e, per 17309, 5579fe21.'

REVIEWED_PACKAGE_SHA256='899079e9619ab86278ffdda891211d2f9a1eed76bd370b7f94f5c40e0ca0a326'

REVIEWED_BINDINGS_SHA256='feeef92a7d7e4bb8dda9d22f3cb17f0e08777e1c8f39cfd922a92167eabafd41'

REVIEWED_CANDIDATES={'AR-u5-subzero-ice-melting-01': '476eb1b0d571602aeab598ffacffa628713e0ddb30598375b86f421e78176eb9', 'AR-u5-subzero-ice-melting-02': 'eaf3cc6054ec2428b8fdf59c6e751bf4a7e499ea4777de9bb0d295daddc877c9', 'AR-u5-subzero-ice-melting-03': '13ecb6ea5a3672ed462d98f6dece7d2ecc062a307cf069fd12f019539f1d8e21', 'AR-u5-subzero-ice-melting-04': '3b82f5c30c240539596427ef5debdebe8b23825826fb97f2749bb3dde5eb1eb2', 'AR-u5-subzero-ice-melting-05': '644092ac92fb6a8c1ae0d52b315ccab4ebb1e49e302ed5f34edd1f363235fdb4', 'AR-u5-subzero-ice-melting-06': '1e01a120dfcc1e52f5a01f6a28953500308dcfeff1f8f2a9b8647125c66892b3', 'AR-u5-subzero-ice-melting-07': 'a7560484b4d61fc1e9f275a1ad49b9b52ef776e5705e9f6a32d265a07979dba0', 'AR-u5-subzero-ice-melting-08': 'c66c5cf249da92382384b65dc5d212f72d2d6db4f8a73c3543ce793a7ca1e993', 'AR-u5-subzero-ice-melting-09': '34b3214463610fcc558eafb86ec330bfc916ca0fbae11f83658c97e2f03d5218', 'AR-u5-subzero-ice-melting-10': 'fc2d897c2b4cc55881fb66b3e23a12100fb69bc71ddaf06c652b12b577b3beb8', 'AR-u5-subzero-ice-melting-11': '6334112d6d16f1dbc2d3785dcf59fd9732510256b61a981d765790edb5adc3b0', 'AR-u5-subzero-ice-melting-12': 'fa9ed296069a75fe2e2061a8e869da12c954db9c3a8accfcc87901a3151babe1', 'AR-u5-subzero-ice-melting-13': '7ad302895082d69279e22a540f0e2285cb89105b07b39b08fab2ee252e456328', 'AR-u5-subzero-ice-melting-14': 'a3a09ee965b62ba221ae2d6a21a62c3f80e617a282098103f2ed84603f182534', 'AR-u5-subzero-ice-melting-15': '6e3ff514f514c9cb1141de73a1d54142747f3e3df049b43f3aa9dd6c0d516f2f', 'AR-u5-subzero-ice-melting-16': 'd69f0455c77748bd3319f4dbd38b62d0104e5e14b5274e0a833c028288d99442'}

READ_SOURCE_SHA256={'u5-subzero-ice-melting-01': '3c8ca6d2476b638149b3c844d22fd709e5085ed516402afcdcb6defa006a0732', 'u5-subzero-ice-melting-02': '69979f28adc83fa8e30c96dfa8995e267855ae8848f21c0cb949415171bd3c17', 'u5-subzero-ice-melting-03': '2de8757c2507788ca170c20e96f3929006ec50ca03e4d4cab0828e2ce2384bae', 'u5-subzero-ice-melting-04': '1d045487d62818566bc6deea692c9bd067701d19f21cfc5bb77125aec80bed5c', 'u5-subzero-ice-melting-05': 'c83ce9bde355c0acae35cb3ae75610668959ef0ff4b35bac172619a1bc48eb07', 'u5-subzero-ice-melting-06': '3340cce98c4e0fe482f57b8d5a6b31976afd0e4afeeeebcb5aac9f29b17a9685', 'u5-subzero-ice-melting-07': '32f96e14c3158ceb9525eb15cca46c92a30e876bc834aa9e9fe386a789d476c5', 'u5-subzero-ice-melting-08': '4e26f60eab87134dca867de92da149cf91ade9631b6202b690dde2f5cbcb60b4', 'u5-subzero-ice-melting-09': 'ba250e33d79728afcfd8f64f2d0668266e8f4069e48558092c2bb2d132874ac0', 'u5-subzero-ice-melting-10': '6c86da77b75516b4a23811871ec0872e13b13aa1afeb43496e13f9b7851e9ac2', 'u5-subzero-ice-melting-11': '28c629288c6b6a871d96b74504c60773696d5ce79fbcaf258325ca2df40025b5', 'u5-subzero-ice-melting-12': '62aac9b7f8cc5be6c97e9ea25a1817a2dc6ede4f426128ee49cbc35b4abfc50b', 'u5-subzero-ice-melting-13': '4eb36f1ebc5e31e8122b27418fdde7aef5c7e2d30ec80ae6b478559a182846bb', 'u5-subzero-ice-melting-14': '0d570fc03888d726c5c0812de61e2e00a85fc751f00f7aa88cca3850b9015a7c', 'u5-subzero-ice-melting-15': 'c381ad8a04a0ccef2c1543214d69df5a64f655c353efda21a2dc121add53e5b9', 'u5-subzero-ice-melting-16': '56d9dbb8e354506288d9e8d5346a0de6e2dfcc38cabcd3db148cc8adeaf0caea'}
