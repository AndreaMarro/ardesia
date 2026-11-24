"""Independent sixteen-case review of the linear spring law and restoring sign.

Derive from the quadratic elastic potential, then take a magnitude; never
imports authoring modules or accepts a stored answer as its own proof.
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
CANDIDATE_REF='2ad5a41ba9f1604027574245a0beba81a4a8fb83'
FAMILY='hooke-force'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}


def oracle():
    k,ell,F=sp.symbols('k ell F',positive=True)
    x=sp.Symbol('x',real=True)
    potential=k*x**2/2
    component=-sp.diff(potential,x)
    if component!=-k*x or component.subs(x,ell)!=-k*ell or component.subs(x,-ell)!=k*ell:raise ValueError('Restoring sign for extension/compression failed')
    magnitude=sp.simplify(sp.Abs(component).subs(sp.Abs(x),ell))
    if magnitude!=k*ell:raise ValueError('Positive magnitude derivation failed')
    inverse_k=sp.solve(sp.Eq(F,magnitude),k)[0]
    inverse_ell=sp.solve(sp.Eq(F,magnitude),ell)[0]
    def force(stiffness,length):return magnitude.subs({k:stiffness,ell:length})
    first,second=force(2,2),force(4,4)
    k1,k2=sp.symbols('k1 k2',positive=True)
    ratio=sp.cancel(magnitude.subs({k:k1*k,ell:k2*ell})/magnitude)
    if ratio!=k1*k2:raise ValueError('Spring force scaling failed')
    energy_ratio=sp.cancel(potential.subs({k:k1*k,x:k2*x})/potential)
    if energy_ratio!=k1*k2**2:raise ValueError('Force/energy distractor diagnostic failed')
    direct=[-k*ell,k*ell,k/ell,ell/k,k*ell**2]
    inverses=[F*ell,ell/F,F/ell,-F/ell,F/ell**2]
    scalings=[k1/k2,k2/k1,k1*k2,k1*k2**2,k1+k2]
    for opts,want,index in [(direct,magnitude,1),(inverses,inverse_k,2),(scalings,ratio,2)]:
        if [i for i,v in enumerate(opts) if sp.cancel(v-want)==0]!=[index]:raise ValueError('Spring symbolic choices not unique')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,9),sp.Eq(gain*second+offset,33)],(gain,offset))
    third=(17-cal[offset])/cal[gain]
    # The cross-trial constraint k=alpha*ell has alpha=1 N/m².
    root=sp.solve(sp.Eq(magnitude.subs(k,ell),4),ell)
    if root!=[2]:raise ValueError('Only positive magnitude root allowed')
    Q=SI.Quantity
    length=Q(200,'cm').to('m')
    measured=(Q(2,'N/m')*length).to('N')
    stiffness=(measured/Q(200,'cm')).to('N/m')
    otherunit=stiffness.to('N/cm')
    gain_units=(Q(12,'')/measured).to('1/N')
    quad=(Q(4,'N')/Q(1,'N/m**2')).to('m**2')
    if (length.magnitude,measured.magnitude,stiffness.magnitude,otherunit.magnitude,gain_units.magnitude,quad.magnitude)!=(2,4,2,Fraction(1,50),3,4):raise ValueError('Exact rational spring SI conversion/gain/constraint failed')
    if force(3,3)!=9 or (first+second)/2!=10:raise ValueError('Mean of products diagnostic failed')
    return [first,'N','F=kℓ','Raddoppia da 4 a 8 N',inverse_k.subs({F:4,ell:2}),
       inverse_ell.subs({F:4,k:2}),force(2,4)/first,8-first,'k=F/ℓ','κ₁ κ₂',second/first,
       (first+second)/2,(4*first/4)/2,(48/sp.Integer(3))/4,third/2,root[0]]

MANUAL=[
 '200cm/100=2m; F=(2N/m)(2m)=4N. Per x+2m la componente−kx=−4N; modulo4N. Usare200 come metri darebbe400N.',
 'k inN/m eℓ inmetri: unitàN. [k]=M/T², [kℓ]=ML/T²; energia richiederebbe un altro fattorelunghezza.',
 'Fx=−kx da forza di richiamo nel modello lineare; modulo|Fx|=k|x|=kℓ conk>0. Siax+2 siax−2 conk2 danno modulo4N e segni opposti.',
 'ℓ2m fissato,k2→4 N/m: F4→8N, rapporto2. Si confrontano molle/costanti distinte, non stessa costante variabile durante deformazione.',
 'ℓ200cm=2m; k=F/ℓ=4N/(2m)=2N/m. InN/cm vale4/200=1/50 N/cm; moltiplicare per100 ricostruisce2N/m.',
 'ℓ=F/k=4N/(2N/m)=2m=200cm. È deformazione dalla lunghezza naturale, non lunghezza totale.',
 'Stessak2N/m: F_A4N,F_B8N→rapporto2. Energia crescerebbe di4 perché dipende daℓ², ma non forza.',
 'ℓ200cm=2m,F4N; proposta8 meno4=+4N. Errorecentimetri darebbe400N e non coincide con proposta8.',
 'F=kℓ conℓ>0→k=F/ℓ>0, unitàN/m. Con componenti orientate sarebbe invecek=−Fx/x.',
 'F_B=(κ₁k)(κ₂ℓ)→rapportoκ₁κ₂. Energia quadraticainℓ avrebbeκ₁κ₂², diversa grandezza.',
 'A2·2=4N,B4·4=16N→rapporto4, non16N; fattori2·2.',
 'Media(4+16)/2=10N. kmedio3N/m,ℓmedia3m darebbero9N, non10N. Intensità inprovedistinte, non risultante.',
 'TargetF_B4·4=16N,k_B4N/m→ℓ_B4m; suℓ_A2m rapporto2.',
 'Fref4N,Sref12→c3N⁻¹;S48→F16N;ℓ4m→k4N/m. Inavanti4·4=16,S48.',
 'ΔS33−9=24,ΔF16−4=12N→c2N⁻¹;d1;S17→F8N;ℓ2m→k4N/m.',
 'k=αℓ conα1N/m² tra prove→F=αℓ²;ℓ²4N/(1N/m²)=4m². Rami±2m, moduloℓ>0 seleziona2m e k2N/m; xnegativo non significaℓnegativo.'
]
DISTRACTORS=[
 'F_x−4N non è modulo negativo;400N nasce dal mancato passaggio cm→m. Scala100 evidente nel fattore200/100.',
 'N/m unitàcostante,m deformazione,J energia,1numero puro; soloN forza.',
 '−kℓ negativo impossibile permodulo; k/ℓ haN/m²,ℓ/k m²/N,kℓ² energia. Segnorichiamo rimane inFx.',
 '16raddoppierebbe ancheℓ;2Ninvertirebbe rigidezza;invarianza ignoraknuova;modulonegativo impossibile.',
 '1/50N/cm è esattamente2N/m; copiare1/50 inN/m introducefattore100errato. Nonforzaallungamento ma rapporto.',
 'Possibilex−2m incompressione conservaℓ2m. SenzaL0 non si ricavalunghezzafinale; ℓnonL.',
 '4 confondequadratoenergia,1/2rapporto inverso. Entrambeconfigurazioni esplicitamenteelastichelineari.',
 '−4ordineinverso;8ripeteproposta;400erroreconversionediverso. Scartodimoduli noncomponenteorientata.',
 'Fℓ energia,ℓ/F cedevolezza(1/rigidezza),−F/ℓ negativo,F/ℓ² unitàN/m² inveceN/m.',
 'Quozientiinvertonounfattore;κ₁κ₂² energia,nonforza;somma2allidentità invece1. Forze diestremidiversi nonsono sommate.',
 '2 consideraunfattore;8propriodellenergia quandoanchekraddoppia;16èmoduloB nonrapporto.',
 '20somma,4o16singolemisure,9prodottodati medi. Nessun segnovettorialedamediare.',
 'ℓquadrupla conkraddoppiata→Fottupla;ℓinvariata→Fdoppia;4mnuovi nonrapporto4.',
 'S48comeforzaSI→k12N/m invece4; la taratura nonestende validitàfisicadelregimelineare.',
 'k2,3,5,8N/m aℓ2m dannoS9,13,21,33;solo4dà17. Rapportoletturegrezzenontoglieoffset.',
 '−2m vietato permodulo e renderebbeknegativo nelvincolo; compressionex<0 haℓ|x|>0 e nonforniscealtroℓfisico.'
]
ASSUMPTIONS=['Molla ideale lineare, k>0 costante nella prova e deformazione dal riferimento naturale entro regime elastico dichiarato; ℓ=|x|>0, F modulo positivo, componente Fx=−kx. Costante e deformazione espresse inunitàcompatibili, nessuna confusionelunghezzatotale/deformazione.']*16
ASSUMPTIONS[15]+=' Relazione k=(1N/m²)ℓ seleziona molle/configurazioni di prove diverse: non una rigidezza variabile conℓ nella stessa prova.'
UNITS={n:'N' for n in range(1,17)}
UNITS.update({5:'N/m',6:'m',7:'',9:'N/m',10:'',11:'',13:'',14:'N/m',15:'N/m',16:'m'})
NUMERIC_UNITS={1:'N',5:'N/m',6:'m',7:'1',8:'N',11:'1',12:'N',13:'1',14:'N/m',16:'m'}
SUFFIX={15:' N/m'}


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

REVIEWED_PACKAGE_SHA256='71108cf0adca5da59d9948bcb69cdfc04b2dae10d8b732297012cc8989b7ea76'
REVIEWED_BINDINGS_SHA256='b42a99f64a004bcf4dc99ebd050f83a4db63557354d936c36ba78ba7d265b96e'
REVIEWED_CANDIDATES={'AR-u2-hooke-force-01': '97ca54fa7dde575fd0713474d01d13048e3a8f4e56079fac955355e94e8b4885', 'AR-u2-hooke-force-02': 'e7fb8047879a67fb3f19802e6e0392563951c4a88c8965f30076a47f4612d3f0', 'AR-u2-hooke-force-03': '2e4d2c1bddd6542a73f56015b90e5c6ef7316a3366f167bce63639574d2e660a', 'AR-u2-hooke-force-04': '13debe906d09ddad2ae57525e1adfc68210affaa64bda02b99038d872136aeb4', 'AR-u2-hooke-force-05': '06230113c71f2fd5f7ec32c3ae1605983ec9ff46fe0552ac47885e489ec887e2', 'AR-u2-hooke-force-06': '093b76c8ccd6338ca57b5ac25b6bcfd565fe15bd53017f758a15aa6d6ab52fc5', 'AR-u2-hooke-force-07': '84bca87ac7f243d7a0e91b8875ab03ced468e6250b712bc667c076c9b32ccf14', 'AR-u2-hooke-force-08': 'f0213f85fbafa4cbe7b135324522023ab4d4ef4cdbd5e0e6c6a8e0a123ad6e69', 'AR-u2-hooke-force-09': '745195d876296aa0d55ce20867c74338a9cb4cfd6a4886443662de33b20bc8fa', 'AR-u2-hooke-force-10': '4e29362401f684597acf5916437db2f0f667516a836cb187a37d7392bc2caaf9', 'AR-u2-hooke-force-11': 'a3e7da26db0f8d6bbc27622ad1331e1fa89513b43cb1f9c36f88ecc464726a4b', 'AR-u2-hooke-force-12': 'c52a281986de1ee7b09d12252eb2b1556ebea8f42c0dc5b657f618cc8195cff9', 'AR-u2-hooke-force-13': 'a470e0f5cf6880a3433d3a34348b616c0ae0f90281dbc401f4a0572d0b6bf614', 'AR-u2-hooke-force-14': 'ae949fda6b712dd06ad05491b24cc68ab92b3b522c7eaca1ca9ab93ab268d3a7', 'AR-u2-hooke-force-15': '592b5b27aa9b753bb45f9a1ac89395d985f3f19876232861a74c5ce2b1c5ff63', 'AR-u2-hooke-force-16': '86da49946fb556d40af501f3417f134cca5d4ae61a08635f883547c800740041'}
READ_SOURCE_SHA256={'u2-hooke-force-01': '34231602d8b9a6d44548e9694d4a2a70d99140e060dcb2ec24dd288d6ea0f9a8', 'u2-hooke-force-02': '465c222bf1e84ab2f2b1860c5812dba2793663b3b4d1f092badec2cbddec6a62', 'u2-hooke-force-03': '42f3aab4a543a8fd1a595294110586003ab3ff21ecb6452e0781ea98bb4e1912', 'u2-hooke-force-04': '1ba6c96e9f3cb80d2de4f7075bfee6fd65fba06c8e4637f07e902f15ba5d2754', 'u2-hooke-force-05': 'e0775e432d237255e82c077be403639e6a4fe981df7b9846769272abc5eb66c6', 'u2-hooke-force-06': '7fcf8ed97aec1e037f46be9d255f7e5a6119c43ccb7f2d6122d7e2d192b3e430', 'u2-hooke-force-07': 'ec5c7f22e5f72bfceee0a1f6d9b557be1b7673e3d20b421d31af582037e55eda', 'u2-hooke-force-08': 'd4913f006703d224f064733598ea2013d07a6a4325d7c41dfebad6e3ed7c4cf2', 'u2-hooke-force-09': 'a68011a69549ba196cb71e15459b01054a1c9f4c0a0e3ec06e634cd36f80af19', 'u2-hooke-force-10': '5143c7e087ba9e69e03581c3531a1c603e91e215d01872113f496ba4b806dfd5', 'u2-hooke-force-11': 'c63d95414f5ce7dc3d698dca0f5e07a40f06caaa75627844e52f46d8e17c04b8', 'u2-hooke-force-12': '59932dc01f9e4410bc0b1d80ef9af6f69894cade9cdb0b11293bf944fe44a9dc', 'u2-hooke-force-13': '8d1b4c10414fc07e9eff85ba115521e7a277750594a6eddc31ec58dd0e53a5ec', 'u2-hooke-force-14': 'd1b87e52642aabb9913647ddaf70de6aa8e63ab608ef5e9fa0962ec9e8e34ea5', 'u2-hooke-force-15': 'd3729b0c0d5ab5ae70a4d589f6d1ed10df0fa541c188d2cf643d886cc58d4716', 'u2-hooke-force-16': '2d829b836423b4f8f1a7f9786f2910bdee8f69abdfbdaf354fc1d82f0b451b33'}
