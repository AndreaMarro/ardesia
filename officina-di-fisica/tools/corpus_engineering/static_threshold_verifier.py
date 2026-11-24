"""Independent reviewer of sixteen static-friction thresholds, not their author.

Derive the static admissible interval and equilibrium before any key comparison.
Candidate-authoring modules are deliberately never imported.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-03.json'
CANDIDATE_REF='074edec599dba58c33754ce643d1457d742342de'
FAMILY='static-threshold'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}
# Immutable edition fingerprints appended only after all records and SVG were read.


def oracle():
    mass,gravity,normal,mu,load,fs,limit=sp.symbols('mass gravity normal mu load fs limit',positive=True)
    # Vertical contact equilibrium and horizontal static equilibrium are separate.
    contact=sp.solve(sp.Eq(normal-mass*gravity,0),normal)[0]
    actual=-load
    capacity=mu*contact
    if actual.subs(load,4)!=-4 or not (abs(actual.subs(load,4))<10):raise ValueError('Static interval proof failed')
    inv_mu=sp.solve(sp.Eq(limit,capacity),mu)[0]
    inv_mass=sp.solve(sp.Eq(limit,capacity),mass)[0]
    def threshold(coefficient,m):return capacity.subs({mu:coefficient,mass:m,gravity:10})
    first,second=threshold(sp.Rational(1,2),2),threshold(1,3)
    k1,k2=sp.symbols('k1 k2',positive=True)
    if sp.cancel(capacity.subs({mu:k1*mu,mass:k2*mass})/capacity)!=k1*k2:raise ValueError('Scaling derivation failed')
    # Evaluate all symbolic alternatives, not merely a stored author key.
    options=[limit/(mass*gravity),limit/mass,mass*gravity/limit,limit*mass*gravity,limit/(2*mass*gravity)]
    if [i for i,v in enumerate(options) if sp.cancel(v-inv_mu)==0]!=[0]:raise ValueError('Inverse alternatives not unique')
    factors=[k1/k2,k2/k1,k1*k2,k1**2*k2,k1+k2]
    if [i for i,v in enumerate(factors) if sp.expand(v-k1*k2)==0]!=[2]:raise ValueError('Scaling alternatives not unique')
    c,d=sp.symbols('c d',real=True)
    cal=sp.solve([sp.Eq(c*first+d,21),sp.Eq(c*second+d,61)],(c,d))
    third=(11-cal[d])/cal[c]
    root=sp.solve(sp.Eq(capacity.subs(mu,mass/4),10).subs(gravity,10),mass)
    if root!=[2] or threshold(sp.Rational(1,2),root[0])!=10:raise ValueError('Positive mass branch failed')
    # Exact dimensional checks with rational SI magnitudes, including display gain.
    Q=SI.Quantity
    n=(Q(2,'kg')*Q(10,'m/s**2')).to('N')
    force=(Q(Fraction(1,2),'')*n).to('N')
    recovered=(Q(10,'N')/(Q(Fraction(1,2),'')*Q(10,'m/s**2'))).to('kg')
    gain=(Q(30,'')/force).to('1/N')
    if (n.magnitude,force.magnitude,recovered.magnitude,gain.magnitude)!=(20,10,2,3):raise ValueError('Rational SI force/inverse/gain failed')
    if threshold(sp.Rational(3,4),sp.Rational(5,2))!=sp.Rational(75,4):raise ValueError('Mean input diagnostic failed')
    return [first,'N',sp.Integer(4),'Si dimezza da 10 a 5 N',inv_mu.subs({limit:10,mass:2,gravity:10}),
       inv_mass.subs({limit:10,mu:sp.Rational(1,2),gravity:10}),threshold(sp.Rational(1,2),4)/first,20-first,
       'μ_s=F_max/(mg)','κ₁κ₂',second/first,(first+second)/2,sp.Rational(3,2),
       sp.Rational(90,3)/(3*10),third/(2*10),root[0]]

MANUAL=[
 'N=mg=2·10=20 N; massimo μ_sN=(1/2)20=10 N. f_s può avere modulo da0 a10, non è sempre10.',
 'μ_s puro; kg·m/s² è N. La soglia è una forza, non coefficiente o accelerazione.',
 'Quiete: P+f_s=0; P=+4 N→f_s=−4 N, modulo4<10 N ammesso. Il massimo non va sostituito alla forza effettiva.',
 'N20 N in entrambe: soglie (1/2)20=10 N e (1/4)20=5 N, rapporto1/2.',
 'μ_s=Fmax/(mg)=10/(2·10)=1/2, rapporto di forze puro. Si misura proprio la soglia.',
 'μ_sg=(1/2)10=5 m/s²; m=10 N/(5 m/s²)=2 kg.',
 'Masse2→4 kg→normali20→40 N→soglie10→20 N, rapporto2; a spinta4 N sotto entrambe le soglie f_s effettivo resterebbe4 N.',
 'Soglia corretta10 N; proposta20 N meno10 N=+10 N. Nessuna inversione dello scarto.',
 'Fmax=μ_smg, mg>0; dividere per mg isola μ_s. Una misura sottosoglia darebbe solo un limite inferiore al coefficiente.',
 'Fmax,B=(κ₁μ_s)(κ₂m)g; dividere perμ_smg dàκ₁κ₂, non una legge per attrito effettivo sotto soglia.',
 'Fmax,A=(1/2)2·10=10 N; Fmax,B=1·3·10=30 N; rapporto3=2·3/2.',
 'Media(10+30)/2=20 N. Ingressi medi μ3/4,m5/2 danno(3/4)(5/2)10=75/4 N, mentre20=80/4 N.',
 'Obiettivo3·10=30 N, μ_B1→m_B30/10=3 kg; m_B/m_A=3/2.',
 'Fref10 N,Sref30→c3 N⁻¹; S90→Fmax30 N; m3 kg→N30 N→μ_s1.',
 'ΔS61−21=40; ΔF30−10=20 N→c2 N⁻¹; d21−2·10=1; S11→F5 N→μ5/20=1/4.',
 'μ_s=m/(4 kg); Fmax=g m²/(4 kg)=10 N→m²=(4kg)(10N)/(10m/s²)=4kg². Rami±2 kg; solo+2 ammissibile, μ1/2.'
]
DISTRACTORS=[
 '20 N è la normale, non il massimo a μ1/2;4 N può essere un attrito effettivo sottosoglia ma non la capacità massima.',
 'kg massa, m/s² accelerazione, s durata,1 coefficiente puro; soloN dimensione di forza.',
 '0 non bilanciaP4;6 è10−4 riserva;10 a sinistra darebbe risultante−6 N;14 somma spinta e capacità senza ragione.',
 'Invarianza ignora μ diverso;20 raddoppia invece di dimezzare;0 e−5 violano capacità positiva.',
 'μ1/4→5N,1→20N,2→40N,5→100N. Nessun limite universale μ<1 richiesto dal modello.',
 'm1 kg darebbe massimo5N,4kg darebbe20N; unità N/(m/s²)=kg, nonN né rapporto puro.',
 '1/2 rapporto inverso;4 introduce quadrato;1 ignora capacità maggiore. Spinte uguali sottosoglia non sono il massimo.',
 '−10 invertirebbe sottrazione;20 ripete proposta; confondereN eFmax trascuraμ pur avendo entrambe unitàN.',
 'Fmax/m accelerazione; reciproco mg/Fmax puro ma sbagliato; prodotto forza²; divisore2 dimezza risultato senza base.',
 'κ₁/κ₂ eκ₂/κ₁ invertono un effetto; κ₁²κ₂ contaμ due volte; somma dà2 a identitàκ₁=κ₂=1.',
 '2 solo coefficiente,3/2 solo massa,1 ignora cambiamenti,6 introduce fattore2 extra.',
 '40 somma;10 o30 singola prova;75/4 prodotto ingressi medi diverso dalla semisomma20.',
 '3 triplica massa conμ giàdoppio→fattore6;2→fattore4;2/3 e1/2 non raggiungono soglia30N.',
 'LeggereS90 comeN darebbe μ3; togliere guadagno restituisce30N eμ1. μ1 èammesso, normale e massimo restano perpendicolari.',
 'μ1/2,1,2,1/8 conN20N dannoS21,41,81,6, non11; offsetnontrascurabile.',
 'Ramo negativo viola massa eμ positivi; relazione lineare dimenticherebbe secondo fattore m del vincolo.'
]
ASSUMPTIONS=['Riferimento inerziale; blocco fermo su piano orizzontale fisso, solo trazione orizzontale oltre peso e normale; contatto e assenza di altre azioni verticali, N=mg>0; modello statico |f_s|≤μ_sN, uguaglianza soltanto alla soglia.']*16
ASSUMPTIONS[2]='Riferimento inerziale, quiete dichiarata con sola spinta orizzontale4 N e attrito; capacità10 N nota, quindi equilibrio f_s=−4 N compatibile.'
ASSUMPTIONS[15]+=' Vincolo μ_s=m/(4kg) seleziona contatti di prove diverse; nessuna massa variabile dentro la prova.'
UNITS={n:'N' for n in range(1,17)}
UNITS.update({5:'',6:'kg',7:'',9:'',10:'',11:'',13:'',14:'',15:'',16:'kg'})
NUMERIC_UNITS={1:'N',6:'kg',7:'1',8:'N',11:'1',12:'N',14:'1',16:'kg'}
SUFFIX={3:' N'}


def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u2-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-');suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing unit')
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(want):errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'pedagogicalReview':'Riletti separatamente consegna, tutti i passaggi, hint, feedback e cinque alternative ove presenti; procedura manuale esatta e vincoli espliciti. '+MANUAL[n-1],
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (9,10) or (n==3 and FAMILY!='static-threshold') else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_Newton_contact_projection_or_elastic_model','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

REVIEWED_PACKAGE_SHA256='f9249be44941a2f75b0a81e88cad7407e4a8e15480327efeee53de8c046ad04f'
REVIEWED_BINDINGS_SHA256='49735225a28aa866da84f53c1a6e8ff31002863911c8d4a7392d06b64f6047fa'
REVIEWED_CANDIDATES={'AR-u2-static-threshold-01': '7ae0520b13792ea130265a970c7d5aba9f2468ae57d46b82f2581e4fcb74c182', 'AR-u2-static-threshold-02': '06eabf6ced8a02320c344e1736479ec9b151874015911a2abd023f2f1bd9c9d4', 'AR-u2-static-threshold-03': 'fe012c858f71c299ab2d3fbe922b0e530dfc82c5edf22e9e0abe266f3187e4d5', 'AR-u2-static-threshold-04': '7de29c55556febe306f1a9c5b6a755451d58f2ac53e3a985d390254e376d1b88', 'AR-u2-static-threshold-05': '795ac234cdafbf27702e5e7a92d9fc02993006dad59307d6168c347330a897cd', 'AR-u2-static-threshold-06': '196e4e9c375e565f335241735c2366e3a8794f7192fad1ae4b284c7337847e65', 'AR-u2-static-threshold-07': 'cef225f0b952ee48b8d64eede090763214db3c0136924c64ce1628c7613076b7', 'AR-u2-static-threshold-08': '1465bd3bb1c7a8250e4754adbda15c68f38ec44319ab5e2ec8d503689a5c006f', 'AR-u2-static-threshold-09': 'ac798d45bebe5c52d27b98d9c9370ea5183a05106401ed1d508dd91d2ebf3fe1', 'AR-u2-static-threshold-10': '4bb822c702ec76282c6176bf02638a86daf14f0b806afe5c70826e26b3af52a3', 'AR-u2-static-threshold-11': '7aaf5594863fd43269dc45b95d7a761b9e4b7975660a498b58043d30f2b8c060', 'AR-u2-static-threshold-12': '8051c4b75b6c24f05778046d849f952cd4ff552da4b2e8d824bf196f172952fd', 'AR-u2-static-threshold-13': '8dc4e34690b89dd75d8f35aa09dc8a7c887a82a943dc4c62ea379023ba8e7a23', 'AR-u2-static-threshold-14': '80d254c610981f5ecb64d0c32bedf4233bef6b5b1be2695ca6465c74c1cfc401', 'AR-u2-static-threshold-15': 'c4d515097e3ad91b4ae717292bceddc2d2cbb50bfda4e56241278f17acbd161f', 'AR-u2-static-threshold-16': '1b8beb389c6aa4fcd8377eee5fe21b7661433d842239397048652607137d5721'}
READ_SOURCE_SHA256={'u2-static-threshold-01': '66758b1e84949d00206b6cea5af6330c050d1083f35ae80ab6e4c8348482f190', 'u2-static-threshold-02': 'c630f1ec0e9d739f641061d7993f7bcd80fc61d3f8e005ab828eff4865511d82', 'u2-static-threshold-03': '634289547bf76b20ad96b662dec1e2af3fdf3fe6a2fe05bc461f4ca94b1bc4f5', 'u2-static-threshold-04': 'f0d44f49cafb9d44a87b91c81f1e1843159f5b26e36899995b9a739a5a7e5666', 'u2-static-threshold-05': '78d4b6bc1af7e6497d15d210dae0b7ae1f537cc905b6e6d59d7d39b621617a9c', 'u2-static-threshold-06': 'a42495ddcef88991dd91915e01f899d678ae38ae854169ad71f50fed64e25dd5', 'u2-static-threshold-07': '2fbdd2ff2578bbdc2e61bc5a2d5aa4a19540d7222e52e58ce8bf2b9dd6a7972f', 'u2-static-threshold-08': '20e323d01e41a1ac11a351aeaf9c634fbe1315d1a69eeb55518a955ecedb0ddd', 'u2-static-threshold-09': '782a4a99412a05d8f56d891bf3501e0928eeb2fc9b358545de982cff932bb957', 'u2-static-threshold-10': '6cc4a1fe6b848573c5453b4994ac522711409b802ddc1dbfc2ebf186a98625ea', 'u2-static-threshold-11': '0e42dd6cf63d9c5268542ba9942c9ec374f5ba023ad0f96f044dda4bcd0094ec', 'u2-static-threshold-12': '7efc1ff441433613fe7c1a15f0235357f6256b58cab08d98f0d51e679858b7f7', 'u2-static-threshold-13': 'cbec4dfce2d1f9d3b19ed62d969a153510eabd3b31490f91f205c1b09c5e48d3', 'u2-static-threshold-14': '7a78e79835fa282deff33188003233a737a36ad8fb39f6983d609122966f4175', 'u2-static-threshold-15': '5bbb1f7363a9e321806e4fd41e096fd87eb060c23631f4f2b85b8e5e6e063cb1', 'u2-static-threshold-16': '5a237e3818a33a7b0099de9f484950e9e7491a67caac4d3a004ade0b7ef1c61b'}
