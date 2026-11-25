"""Independent full-record fluid review; never imports candidate authoring."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-02.json'
FAMILY='hydrostatic-weighing'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    wa,wi,rc,rw,g,V=sp.symbols('wa wi rc rw g V',positive=True)
    equations=[sp.Eq(wa,rc*g*V),sp.Eq(wi+rw*g*V,wa)]
    law=sp.solve(equations,(rc,V),dict=True)[0][rc]
    inv=sp.solve(sp.Eq(rc,law),wa)[0]
    inverse_i=sp.solve(sp.Eq(rc,law),wi)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.factor(law.subs({wa:k*wa,wi:l*wi})/law)
    if sp.simplify(law-rw*wa/(wa-wi))!=0 or inv!=rc*wi/(rc-rw):raise ValueError('Independent hydrostatic weighing elimination failed')
    for opts,want in [([rw*wa/(wa-wi),rw*wi/wa,rw*wa/wi,rw*(wa-wi)/wa,rw*wa/(wa+wi)],law),([rc*wi/(rc-rw),rc*wi/rw,rw*wi/(rc-rw),(rc-rw)*wi/rc,rc*wi/(rc+rw)],inv),([ratio,k/l,k*l,1/ratio,(wa-wi)/(k*wa-l*wi)],ratio)]:
        if [i for i,v in enumerate(opts) if sp.simplify(v-want)==0]!=[0]:raise ValueError('Weighing symbolic alternatives not unique')
    F=lambda a,i:law.subs({rw:1,wa:a,wi:i})
    A,B=F(10,5),F(20,15)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,5),sp.Eq(q*B+z,9)],(q,z))
    C=(sp.Rational(11,3)-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,sp.Rational(4,3)):raise ValueError('Weighing affine calibration failed')
    if (A+B)/2!=F(15,10):raise ValueError('Equal measured buoyancy mean coincidence failed')
    if (F(10,5)+F(30,10))/2==F(20,sp.Rational(15,2)):raise ValueError('General nonlinear mean counterexample failed')
    if sp.simplify(law.subs(wa,2*wi)-2*rw)!=0:raise ValueError('Weighing scale non-identifiability failed')
    U=SI.Quantity
    buoyancy=U(10,'N')-U(5,'N')
    volume=(buoyancy/(U(1,'kg/L')*U(10,'m/s**2'))).to('L')
    mass=(U(10,'N')/U(10,'m/s**2')).to('kg')
    density=(mass/volume).to('kg/L')
    gain=(U(6,'')/density).to('L/kg')
    inverse_weight=(U(4,'kg/L')*U(15,'N')/(U(4,'kg/L')-U(1,'kg/L'))).to('N')
    if (volume.magnitude,mass.magnitude,density.magnitude,gain.magnitude,inverse_weight.magnitude)!=(Fraction(1,2),1,2,3,20):raise ValueError('Pint Fraction weighing force/volume/density inverse failed')
    return [A,'kg/L','ρ_c = ρ_w W_a / (W_a − W_i)','Da 2 a 4/3 kg/L',inv.subs({rc:2,rw:1,wi:5}),inverse_i.subs({rc:2,rw:1,wa:10}),F(10,1)/A,4-A,'W_a = ρ_c W_i / (ρ_c − ρ_w)','κ₁ D / D_B',B/A,(A+B)/2,sp.Integer(3),inv.subs({rc:4,rw:1,wi:15}),inv.subs({rc:C,rw:1,wi:5}),'Infinite']

MANUAL = ['In aria W_a=ρ_c gV; in acqua W_i+ρ_w gV=W_a. Si elimina V e g: ρ_c=ρ_w W_a/(W_a−W_i). Differenza 5 N, '
 'rapporto 10/5=2, densità 2 kg/L.',
 'Il rapporto di forze è puro ma moltiplica ρ_w: unità kg/L=1000 kg/m³. Non si perde la dimensione perché il '
 'numero di ρ_w è 1.',
 'La differenza delle pesate è la spinta, non il peso residuo. Peso/spinta =ρ_c/ρ_w; il confronto è fra '
 'masse nello stesso volume.',
 'A: spinta 5 N, densità 2. B: 20−5=15 N, densità 20/15=4/3 kg/L. Corpi distinti; un peso maggiore non '
 'ordina da solo la densità.',
 'R=ρ_c/ρ_w=2. R(W_a−W_i)=W_a→W_a=R W_i/(R−1)=10 N>5 N.',
 'Spinta=(ρ_w/ρ_c)W_a=5 N; W_i=10−5=5 N, tensione positiva.',
 'B con W_a 10, W_i 1 ha spinta 9 N e ρ_c 10/9 kg/L. Rapporto a 2 kg/L=(10/9)/2=5/9.',
 'Proposta 4 meno corretta 2=+2 kg/L. Controprova: ρ_c 4 con W_a 10 darebbe spinta 5/2 N e W_i 15/2 N, non '
 '5.',
 'Raccogliendo W_a si ottiene (ρ_c−ρ_w)W_a=ρ_c W_i; inversa ρ_c W_i/(ρ_c−ρ_w), valida per ρ_c>ρ_w.',
 'Denominatori D=W_a−W_i e D_B=κ₁ W_a−κ₂ W_i positivi. Rapporto κ₁ D/D_B. Se κ₁=κ₂, la densità resta uguale.',
 'A 10−5=5 N e B 20−15=5 N: spinta e volume uguali. Densità 2→4 kg/L, rapporto 2.',
 'Media(2+4)/2=3 kg/L; letture medie 15, 10 N danno ancora 3 perché entrambe le differenze valgono 5 N. '
 'Nonlinearità generale: coppie (10, 5) e (30, 10) danno media 7/4, mentre ingressi medi 20, 15/2 danno 8/5.',
 'Target 4 kg/L, W_a B 20 N→spinta 5 N, W_i B 15 N; rapporto a 5 N uguale 3.',
 'q = 6/(2 kg/L)=3 L/kg; S 12→ρ_c 4 kg/L. W_i 15 N→W_a 4·15/(4−1)=20 N.',
 'q = 2 L/kg, offset 1; S 11/3→ρ_c=(11/3−1)/2=4/3 kg/L. W_i 5 N→W_a=(4/3)·5/(1/3)=20 N.',
 'W_a=2 W_i rende ρ_c=2 ρ_w per ogni W_i>0. Infinite coppie: 10/5 e 20/10 N. La misura non determina peso, '
 'volume o scala.']
DISTRACTORS = ['W_i non è nuova gravità né risultante; peso reale invariato, tensione e spinta sostengono insieme.',
 'N forza, L/kg reciproco densità, kg massa, N/L forza per volume; solo kg/L è densità.',
 'W_a/W_i coincide nel caso 10/5 ma non è la legge: 20/15 darebbe 4/3 invece di 4. Rapporti invertiti/somma '
 'portano sotto ρ_w.',
 '4 segue solo numeratore, 2 ignora nuova spinta, 1 richiede W_i 0, 1/2 richiede sostegno verso basso.',
 'R W_i coincide numericamente a R = 2 ma non sostituisce l’inversa generale R/(R−1); il denominatore '
 'contiene W_a.',
 '10 N ignora la spinta, zero è ρ_c=ρ_w, tensione negativa fuori dominio.',
 '9/5 reciproco, 1/5 e 5 seguono soltanto tensioni, 1 ignora il volume cambiato.',
 '−2 ordine invertito, 4 proposta, 0 accetta, 1 doppia metà.',
 'ρ_c W_i/ρ_w omette raccoglimento; ρ_w nel numeratore altera equazione; ultime forme danno W_a<W_i.',
 'κ₁/κ₂ ignora sottrazione, prodotto ingiustificato, reciproco scambia stati, D/D_B omette κ₁.',
 '1/2 reciproco, 3 solo tensione, 4 densità B, non il rapporto, 1 spinta uguale non implica peso uguale.',
 '6 somma, 3/2 doppia metà, 2 e 4 singole prove. Coincidenza con le medie deve essere ammessa e motivata, non '
 'negata.',
 '2 segue il peso, 1/3 reciproco, 4 numero densità, 1 dà densità 4/3 anziché 4.',
 'S 12 scambiata per rapporto densità darebbe 180/11 N; guadagno va rimosso.',
 'Con W_i 5 N, W_a 10, 15, 25 N darebbero S 5, 4, 7/2. W_a 5 annulla spinta e denominatore; solo 20 dà 11/3.',
 'Una coppia richiede misura aggiuntiva; due esempi non limitano la scala; nessuna falsa; zero escluso.']
ASSUMPTIONS = ['Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.',
 'Corpo omogeneo impermeabile sospeso fermo, senza appoggi o contatti con fondo e pareti. In aria si '
 'trascura la spinta e W_a=mg; in acqua omogenea 1 kg/L la completa immersione dà lettura di tensione W_i. '
 'Bolle e tensioni superficiali sul corpo escluse, stessa gravità nelle due pesate. Dominio W_a>W_i>0, '
 'equivalente a corpo più denso dell’acqua. Preparazioni diverse possono usare corpi diversi.']
UNITS={1: 'kg/L', 2: 'kg/L', 3: 'kg/L', 4: 'kg/L', 5: 'N', 6: 'N', 7: '', 8: 'kg/L', 9: 'N', 10: '', 11: '', 12: 'kg/L', 13: '', 14: 'N', 15: 'N', 16: ''}
NUMERIC_UNITS={1: 'kg/L', 5: 'N', 6: 'N', 14: 'N'}
SUFFIX={8: ' kg/L', 12: ' kg/L', 15: ' N'}
SVG_REVIEW = ('XML e rendering completo letti. In aria: tensione 10 N e peso 10 N, freccia 200 px ciascuna a 20 px/N. In '
 'acqua: tensione 5 N e spinta 5 N, 100 px ciascuna contro peso 10 N di 200 px. Ogni freccia ha un proprio '
 'path; sono proiezioni separate. Barre peso/spinta 200/100 px. Con g 10 m/s², spinta 5 N→volume 1/2 L e '
 'peso 10 N→massa 1 kg. Ultimo esempio 20/10 N raddoppia volume e massa, non la densità 2 kg/L.')

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
                f=Fraction(raw)
                if sp.Rational(f.numerator,f.denominator)!=want:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError,ZeroDivisionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_buoyancy_equilibrium_or_flux_integral_or_mass_continuity','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='092b90b'
SOURCE_READING='All80 original U3-02 prompts in the assigned five families individually read and solved before candidate keys. All16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing; never imports candidate authoring. C2 lessons L004/L005 and supplied profile assumptions reviewed separately.'
REVIEWED_PACKAGE_SHA256='a9a4f7956b4abcab26e3cd680979305872c68ad94d8d7962d3ca43167d9c7e96'
REVIEWED_BINDINGS_SHA256='852e21c7456f85c11c65cf59d035f295cb48d32c484ac33ee1abf79c0f36295d'
REVIEWED_CANDIDATES={'AR-u3-hydrostatic-weighing-01': '20a7947e8578c1030335c4f8f272d266b40ed3990f6f213972cb722d773dd9e5', 'AR-u3-hydrostatic-weighing-02': '76287fe154a98d2461ef6ab541bbfca13aceec166e4bc110b0af2a69f36fdc9c', 'AR-u3-hydrostatic-weighing-03': '97a2c349b6dd937ee591cedbe7333b763a697057b468364b998b173aeea0abb1', 'AR-u3-hydrostatic-weighing-04': '62e2286f07adbdff1364920376b8c5c41097fea1d86829246d1f7ca0e2538555', 'AR-u3-hydrostatic-weighing-05': 'ab27650b723ee6966f625e82e91ae375bc286d8a6a406898e0a494c58f6194e3', 'AR-u3-hydrostatic-weighing-06': 'c372e3f83d610cca59c8290e325c36252b5ccdd1c51c8758e41c5db2f010594f', 'AR-u3-hydrostatic-weighing-07': '3d8ed80259f0aa9958d5fbaebcdac9502cc77e21171136505953c6e79e85b6fd', 'AR-u3-hydrostatic-weighing-08': 'fb0b19065fa745ba4f1be7eab6c573c497b49baef0217513bb1306a04e4c268a', 'AR-u3-hydrostatic-weighing-09': '74f88ba8fb85d025fb09855ec691c6fe35aeb06704eaa1d8dea061f6a97d6176', 'AR-u3-hydrostatic-weighing-10': '87692d40d3c3407cb6f0cfef7fd056080bb0703a7a3eff55c3c70ac25f26d69c', 'AR-u3-hydrostatic-weighing-11': '59a69f52da2db98f57024c5cedbce328b5e0773b563de66e970dac5a769d3f9e', 'AR-u3-hydrostatic-weighing-12': '88298c4b5f8e488e7eadbda51fd78ef08d76208c08c7dd165dbcab046c4e3fd7', 'AR-u3-hydrostatic-weighing-13': '47c2f81dbd7edff55b72e6a30e998d54f7a9abb6ecdc76563cfb8be27b1c9b8b', 'AR-u3-hydrostatic-weighing-14': 'c39e732c882937eeb08fe4b4f6f16009ce426b6d783759a0ea475e41cdb33474', 'AR-u3-hydrostatic-weighing-15': '2ecc0bee0a5c7da35ff95f211628d55877af9a4c5af48c6792471ec51a5db6e8', 'AR-u3-hydrostatic-weighing-16': '8c9ab2cabbcfa206a45393e189891505e387ebbed67a87aff68d5ada9b27354f'}
READ_SOURCE_SHA256={'u3-hydrostatic-weighing-01': '462fe07458e7a5a48a5236079841c11e863fdb304597fa3b35d4b0dece3219f8', 'u3-hydrostatic-weighing-02': '7ba7d3381f0139dcba836ce8049f768e9f03c7f7d268d4ef3cfb471b84c97b27', 'u3-hydrostatic-weighing-03': 'e1389baa7a88864bf893d9781e536d72dbee18c4ce0c8e778be753c3a89f24fd', 'u3-hydrostatic-weighing-04': '71ff3e46a8ea86e6ee6aeac958ee7a4b1fe012c72a59f9537dad40fdf6e1c294', 'u3-hydrostatic-weighing-05': '07535384e05934f9082015450f3d0ea2c7166e5da8953e6232afddfa7bfdb2c8', 'u3-hydrostatic-weighing-06': '6a66e0467f6f593f419c4f775982422ee76af836b777200e7d7fb2bc94c0aa62', 'u3-hydrostatic-weighing-07': '54984169eaefb4148ea92bfc9818c06532761ac9d178d6b81d4a5125b9f48e01', 'u3-hydrostatic-weighing-08': '467af4c6a3017dbc46c96ef06299490c2eafca5aaa05ba1162a20ade920545cf', 'u3-hydrostatic-weighing-09': '07fdb5351b6ee89210814b7e2e31ce71a6d641fe8439720bc4002397c4c02c2e', 'u3-hydrostatic-weighing-10': 'e359dc5ce31f28b30626bb8b8c0c55b5bcfa801bb8a498d5564025e6c4c83a9d', 'u3-hydrostatic-weighing-11': 'b675264845f987f37611b03dc92e6fcf6821f008d65443feaa928cd734f1dae7', 'u3-hydrostatic-weighing-12': 'e1230024b53c167671bc8610f2c535e4d915d0b076e01c38c76483d175bec05e', 'u3-hydrostatic-weighing-13': '3d3769ce9caedfc41af5956ca2be9d2a5545970693707a18cef91ebde57c3aad', 'u3-hydrostatic-weighing-14': '559d78acef7b8590526c25fce653a9d486ef8874d4fb98f5e7f813eaef7c788e', 'u3-hydrostatic-weighing-15': '5a3433fcdfd13c3fe70325b2e299f72042f9c3b5fe8204609ce7e51fbf0aa8b8', 'u3-hydrostatic-weighing-16': '3369f754f4bae7f00d55285e6f3ba241b0d03198df1e0cbf640639198705d208'}
