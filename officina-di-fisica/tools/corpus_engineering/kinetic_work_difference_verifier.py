"""Independent kinetic-work review from Newton power and endpoint energies."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
CANDIDATE_REF='5759eaceae1509c93086999cb096e835ccb7b641'
FAMILY='kinetic-work-difference'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}'for n in range(1,17)}


def oracle():
    mass,vi,vf,W=sp.symbols('mass vi vf W',positive=True)
    t=sp.Symbol('t',real=True);vx=sp.Function('vx')(t);vy=sp.Function('vy')(t)
    velocity=sp.Matrix([vx,vy]);power=(mass*velocity.diff(t)).dot(velocity)
    K=mass*velocity.dot(velocity)/2
    if sp.simplify(sp.diff(K,t)-power)!=0:raise ValueError('Newton vector work-energy derivative failed')
    u=sp.Symbol('u',real=True)
    law=sp.integrate(mass*u,(u,vi,vf))
    if law!=mass*(vf**2-vi**2)/2 and sp.expand(law-mass*(vf**2-vi**2)/2)!=0:raise ValueError('Endpoint kinetic energy failed')
    inverse_vf=sp.sqrt(vi**2+2*W/mass);inverse_vi=sp.sqrt(vf**2-2*W/mass)
    if sp.expand(law.subs(vf,inverse_vf)-W)!=0 or sp.expand(law.subs(vi,inverse_vi)-W)!=0:raise ValueError('Independent speed inverses failed')
    def work(final,initial):return law.subs({mass:2,vf:final,vi:initial})
    first,second=work(4,1),work(6,2)
    q=sp.Symbol('q',positive=True)
    inverses=[sp.sqrt(vi**2-q),sp.sqrt(vi**2+q),-sp.sqrt(vi**2+q),2*sp.sqrt(vi**2+q),sp.sqrt(vi**2+q)/2]
    if [i for i,v in enumerate(inverses)if sp.simplify(v-sp.sqrt(vi**2+q))==0]!=[1]:raise ValueError('Inverse speed alternatives not unique')
    a,b=sp.symbols('a b',positive=True);D=vf**2-vi**2;DB=(a*vf)**2-(b*vi)**2
    ratio=sp.cancel(law.subs({vf:a*vf,vi:b*vi})/law)
    if sp.cancel(ratio-DB/D)!=0:raise ValueError('Difference-of-squares scaling failed')
    scales=[a*b,a/b,DB/D,D/DB,2*DB/D]
    if [i for i,v in enumerate(scales)if sp.cancel(v-ratio)==0]!=[2]:raise ValueError('Kinetic ratio alternatives not unique')
    if sp.cancel(ratio.subs(b,a)-a**2)!=0:raise ValueError('Common speed scaling must be quadratic')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,31),sp.Eq(gain*second+offset,65)],(gain,offset));decoded=(71-cal[offset])/cal[gain]
    real_vi=sp.Symbol('real_vi',real=True)
    roots=sp.solve(sp.Eq(15*real_vi**2,15),real_vi)
    if roots!=[-1,1] or work(4,1)!=15 or work(8,2)!=60:raise ValueError('Kinetic constrained speed branches failed')
    Q=SI.Quantity
    initial=(Q(2,'kg')*Q(1,'m/s')**2/2).to('J');final=(Q(2,'kg')*Q(4,'m/s')**2/2).to('J')
    measured=final-initial;inverse_squared=(Q(4,'m/s')**2-2*Q(15,'J')/Q(2,'kg')).to('m**2/s**2')
    gain_si=(Q(45,'')/measured).to('1/J')
    if (initial.magnitude,final.magnitude,measured.magnitude,inverse_squared.magnitude,gain_si.magnitude)!=(1,16,15,1,3):raise ValueError('Exact Pint kinetic energy/speed/gain dimensions failed')
    if work(5,sp.Rational(3,2))!=sp.Rational(91,4) or (first+second)/2!=sp.Rational(47,2):raise ValueError('Kinetic input-mean diagnostic failed')
    return [first,'J',sp.Integer(4),'Da 15 a 35 J',inverse_vf.subs({vi:1,W:15,mass:2}),inverse_vi.subs({vf:4,W:15,mass:2}),
      work(4,2)/first,30-first,'v_f=√(v_i²+q)','D_B / D_A',second/first,(first+second)/2,
      inverse_vi.subs({vf:6,W:sp.Rational(32,15)*first,mass:2}),inverse_vf.subs({vi:2,W:32,mass:2}),
      inverse_vf.subs({vi:1,W:decoded,mass:2}),sp.Integer(1)]
MANUAL=[
 'm2kg→m/2=1kg. K_i=1J,K_f=16J; W=K_f−K_i=15J, non(4−1)²=9J.',
 'Massa per velocità² dàkgm²/s²=J; differenza di energie conserva unità anche se negativa.',
 'W=K_f−K_i→K_f=K_i+W=10−6=4J≥0. Caso distinto dai problemi W>0; W<−10J sarebbe incompatibile con K_i10J.',
 'v_i1 restaK_i1J; v_f4→6 dàK_f16→36J, lavori15→35J. Non proporzionalità lineare a rapidità.',
 'v_f²=v_i²+2W/m=1+15=16m²/s²; radice positiva4m/s. Wjoule non sommabile senza2/m.',
 'v_i²=v_f²−2W/m=16−15=1m²/s²; radice positiva1m/s. Radicando>0 perché si esclude partenzaferma.',
 'v_f4,K_f16; v_i1→2,K_i1→4J; W15→12J e rapporto12/15=4/5.',
 'Wcorretto15J;proposta30J−15J=+15J. Il mezzo mancante spiega proposta.',
 'q=2W/m>0 inunità velocità²; q=v_f²−v_i²→v_f=√(v_i²+q)>v_i, ramo positivo.',
 'D_A=v_f²−v_i²>0,D_B=κ₁²v_f²−κ₂²v_i²>0. Massae mezzo comuni si cancellano, rapportoD_B/D_A; perκ₁=κ₂κ ritornaκ².',
 'A16−1=15J;B36−4=32J; rapporto32/15 puro esatto.',
 'Media(15+32)/2=47/2J. Medie rapidità5 e3/2 danno25−9/4=91/4J, diverso da94/4J; scarto3/4J.',
 'Target(32/15)15=32J; K_f36J→K_i4J→v_i2m/s, rapporto a1m/s iniziale2.',
 'Wref15,S45→c3J⁻¹;S96→W32J;K_i4J→K_f36J→v_f6m/s.',
 'ΔS65−31=34,ΔW32−15=17J→c2J⁻¹;d1;S71→W35J;K_i1J→K_f36J→v_f6m/s.',
 'v_f4v_i→W=(m/2)(16−1)v_i²=(15kg)v_i². W15J→v_i²1m²/s²;rami±1,solo+1rapida ammissibile,v_f4m/s.'
]
DISTRACTORS=[
 '16J ometteK_i,9J quadratodifferenza,30J omettemezzo. Sommalavori non singolaforza.',
 'N forza,W wattpotenza,kgm/s quantitàdimoto,m/s²accelerazione,nonenergia.',
 '−6copiaW,−4 energiaimpossibile,16ignora segnolavoro,6solo moduloW;K_f4J valido.',
 '45/2 scala15 per6/4;30raddoppioarbitrario,15invarianza,0ignoraK_fmaggiore.',
 '16confondequadrato,√15 ometteinizio;−4 nonrapidità e non soluzione positiva richiesta.',
 '4ripetev_f;radicenegativa nonrapidità;somma15anzichésottrazionerenderebbeiniziale piùenergetico malgréWpositivo.',
 '5/4inverso;2solov_i,1/2inversasemplice;1/5diminuzionerelativa3/15 nonrapportofinale.',
 '30ripete,−15ordineinverso,15/2ulterioremetà,14/16 noncalcoloesatto.',
 'Menosottoradicedescriveperdita,nonWpositivo;negativa nonrapidità;doppia/metàfalliscono sostituzione.',
 'κ₁κ₂prodotto non differenzaquadrati;κ₁/κ₂ nonmodello;D_A/D_Binverso,2extraconta mezzo una volta. Entrambedomini v_f>v_i eκ₁v_f>κ₂v_i necessari.',
 '15/32inverso,9/4soliquadratifinali,2arrotondamentoindebito,16/15dimezzaworkB.',
 '47somma,47/4divideancora,17differenza,91/4risultatosuidati medi,nonsemisomma.',
 '−2nonrapidità,4quadrato nonvalore,vi1darebbeW35non32. vi2<vf6 validodominio.',
 'S96nonJ,36nonrapidità,√32 ometteK_i4J;36−4=32J eS96 controlli.',
 'v_f3,5,7,12 dannoS17,49,97,287;solo6dà71. Primaoffset/lavoro/K_i,poiradice.',
 '0dàW0,−1nonrapidità,2dàvf8 eW60J,1/2dàvf2 eW15/4J. Unicitàramopositivo.'
]
ASSUMPTIONS=['Punto materiale classico non relativistico di massa costante2kg nel riferimento inerziale; lavoro totale di tutte le forze. Rapidità v_f>v_i>0 nei casi positivi, energie cinetiche nonnegative; non si deducono tempi o accelerazione dagli estremi.']*16
ASSUMPTIONS[2]='Caso autonomo con Wtot−6J e K_i10J; massa classica costante, riferimento inerziale, lavoro totale; K_f≥0. Non si applica il dominio W>0 degli altri esempi.'
ASSUMPTIONS[9]+=' Ancheκ₁v_f>κ₂v_i>0, quindi entrambe differenze positive e rapporto definito.'
UNITS={n:'J'for n in range(1,17)}
UNITS.update({5:'m/s',6:'m/s',7:'',9:'m/s',10:'',11:'',13:'',14:'m/s',15:'m/s',16:'m/s'})
NUMERIC_UNITS={1:'J',5:'m/s',6:'m/s',8:'J',13:'1',14:'m/s',16:'m/s'}
SUFFIX={3:' J',12:' J',15:' m/s'}

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
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_Newton_power_derivative_and_endpoint_work','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

REVIEWED_PACKAGE_SHA256='8c7bcb619c7963ef3867f588eda3dd407a4c88ca50b5ee96c1d2154f0f5dcfe5'
REVIEWED_BINDINGS_SHA256='faeafa9b8ac41babc1da62e497ed1f6b360ea9f7c1a05ada6221426d3ed1e22f'
REVIEWED_CANDIDATES={'AR-u2-kinetic-work-difference-01': '3bedf49a0113808f91a63eab828d3290f5ab8af5b609bc27119de57c2bff6ab8', 'AR-u2-kinetic-work-difference-02': '058ba395e60d660ecef4c6b0ae35629ff3207378b95ff41755c106f55b0620cd', 'AR-u2-kinetic-work-difference-03': '8b5767a22c54891204507e3c74a5c5237ff257e5b791a23d5bd7f7784b7c7e88', 'AR-u2-kinetic-work-difference-04': '5f70a963d4230a7eb2bf81dd791880714215d67ad2f8687321658ed728fed24a', 'AR-u2-kinetic-work-difference-05': '5b3a27405498677c78c15c7982986f17e56c3f21c90258f9fa271907c5b3f16b', 'AR-u2-kinetic-work-difference-06': '64c5126a6fbb5ff36697ac92ca8ff682f2131e4c16148a0b77d0d2164d94ea6c', 'AR-u2-kinetic-work-difference-07': '3196b5b4fa25f9db91b8d284976249c84619766a7996667b6b8292a1b1064c8c', 'AR-u2-kinetic-work-difference-08': 'e2f0d347fbf5c4491fad216778a02298c578ce8d71bde3c8e8d669c68c7f4dc6', 'AR-u2-kinetic-work-difference-09': 'd78a232067985e60cecca8e88505ba78879f5e8ed55ca3578bb6410814201d02', 'AR-u2-kinetic-work-difference-10': '8b1c68106e9b502a5b52fc778da41d0ea1001dd88c978184007c304709720042', 'AR-u2-kinetic-work-difference-11': 'c3c3571bfe21bae008649225c7b2b1ac6b4a86f2a59e2aa5715c60d4632968e6', 'AR-u2-kinetic-work-difference-12': 'ebbf07d8c3f4c94d8e934503bdea9524e68645697a22d4b0db0f1e3991f56e2a', 'AR-u2-kinetic-work-difference-13': 'e90f340b8d25b9a5749b97abcc7295de0fe0078670d2dd0300d303cbf0d50e40', 'AR-u2-kinetic-work-difference-14': '120acdee8198be312252c5770b2e9f6483b5b114ec424a45be57c3daa9336688', 'AR-u2-kinetic-work-difference-15': 'fed0e764b586d03862fe455a3c2d62290a7444c6e21e62aab12ada64189beac5', 'AR-u2-kinetic-work-difference-16': 'bebbccfdb9339603423844476c74ee222e64821631de386ba0e3c336b303d071'}
READ_SOURCE_SHA256={'u2-kinetic-work-difference-01': 'd2fd08d9d42d6f733038dca845c44b4f4d2bf5e7ae8a4a8d1cb1d35e4a12ebfa', 'u2-kinetic-work-difference-02': '999488ce53cb14478c18344c3d4ed1f76ac03051c86d7403771db5f7de60b06b', 'u2-kinetic-work-difference-03': 'fb20492663147eba6c95c6fc4ce8ad5a3825fd3b6b9b7ada1c1555de3a82dce6', 'u2-kinetic-work-difference-04': 'b8c925e9e3bf2afa9399941a60b26a861d837478cda7972cf9451d4c17d3265d', 'u2-kinetic-work-difference-05': 'c23c723d6100858267ca958b194f6f871b5bd7babe9ab1a79766d7ad7441d387', 'u2-kinetic-work-difference-06': 'e80e089c16a6844dca4cc32425224e0edba66dd53ed4b23a592ded4894c527eb', 'u2-kinetic-work-difference-07': '79abf08c02a348b235cf4b19b71c22dcf52de410ce8305d0590b7309c6ba451f', 'u2-kinetic-work-difference-08': '09e1a609d65d4afda35a099c0a7ab3eb862088cb926eae5277841e0c58b59b26', 'u2-kinetic-work-difference-09': '6478c14c8107375916ffa44cc26cecbce1c7b6b91a4eb48af0c93c2efa4f458a', 'u2-kinetic-work-difference-10': '3e0e0a3311d3a2810272f88f297e0c2331edc0875c43573852f998afdb42b96d', 'u2-kinetic-work-difference-11': '6eb7a4e0b8e4545613a4cd4702a905f2698cb2f35dd4d927715684bfe60d25b3', 'u2-kinetic-work-difference-12': 'ab02f42489b7b58980c9e615b7aa1c397d420292cd258804508c2645481c91b2', 'u2-kinetic-work-difference-13': '61b1d614806c8eaeb3d88c06ea536f9aaadaa5c31b1f2a8779ec109016495e50', 'u2-kinetic-work-difference-14': '22d5f7daac503ef8ed0998f82d27db16f3d87cbe15e58e3c74a5c08338813760', 'u2-kinetic-work-difference-15': 'b7a458ceb2fba46260b364dd581f7cdb49e531ae2027ab37bf46223969297c35', 'u2-kinetic-work-difference-16': '8af29df8cf7544d1ea14759e8f91c54364dbfc0bdd78cd0da1700b4327ec4bf4'}
