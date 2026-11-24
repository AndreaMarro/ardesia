"""Independent review of16 gravitational-energy editions, not candidate author.

Derivation starts from the signed scalar product of uniform weight with an
arbitrary piecewise displacement; authoring modules are never imported.
"""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
FAMILY='gravitational-energy'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}


def oracle():
    m,g,h,U=sp.symbols('m g h U',positive=True)
    y0,y1,y2,y3,x0,x1,x2,x3=sp.symbols('y0 y1 y2 y3 x0 x1 x2 x3',real=True)
    points=[(x0,y0),(x1,y1),(x2,y2),(x3,y3)]
    weight=sp.Matrix([0,-m*g])
    work=sum(weight.dot(sp.Matrix([b[0]-a[0],b[1]-a[1]])) for a,b in zip(points,points[1:]))
    if sp.expand(work+m*g*(y3-y0))!=0 or sp.expand(work.subs(y3,y0))!=0:raise ValueError('Uniform gravity telescoping path proof failed')
    law=sp.simplify(-work.subs(y3,y0+h))
    if law!=m*g*h:raise ValueError('Potential change must oppose gravitational work')
    inverse_m=sp.solve(sp.Eq(U,law),m)[0]
    inverse_h=sp.solve(sp.Eq(U,law),h)[0]
    def energy(mass,height):return law.subs({m:mass,h:height,g:10})
    first,second=energy(2,2),energy(4,4)
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({m:a*m,h:b*h})/law)
    inverse_options=[U*g*h,g*h/U,U/(g*h),U/(2*g*h),2*U/(g*h)]
    scale_options=[a/b,b/a,a*b,a+b,a*b**2]
    for options,want,index in [(inverse_options,inverse_m,2),(scale_options,ratio,2)]:
        if [i for i,v in enumerate(options) if sp.cancel(v-want)==0]!=[index]:raise ValueError('Gravitational symbolic alternatives not unique')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,81),sp.Eq(gain*second+offset,321)],(gain,offset))
    third=(161-cal[offset])/cal[gain]
    # Cross-trial constraint m=c*h with c=1kg/m, not varying mass in one lift.
    real_h=sp.Symbol('real_h',real=True)
    roots=sp.solve(sp.Eq(10*real_h**2,40),real_h)
    if roots!=[-2,2] or [r for r in roots if r>0]!=[2]:raise ValueError('Both algebraic height branches must be checked')
    Q=SI.Quantity
    weight_si=(Q(2,'kg')*Q(10,'m/s**2')).to('N')
    increase=(weight_si*Q(2,'m')).to('J')
    recovered=(increase/(Q(10,'m/s**2')*Q(2,'m'))).to('kg')
    display_gain=(Q(120,'')/increase).to('1/J')
    squared=(Q(40,'J')/(Q(1,'kg/m')*Q(10,'m/s**2'))).to('m**2')
    if (weight_si.magnitude,increase.magnitude,recovered.magnitude,display_gain.magnitude,squared.magnitude)!=(20,40,2,3,4):raise ValueError('Pint exact gravity work/inverse/gain/constraint failed')
    if energy(3,3)!=90 or (first+second)/2!=100:raise ValueError('Mean of products diagnostic failed')
    return [first,'J','Zero','Da 40 a 80 J',inverse_m.subs({U:40,g:10,h:2}),
      inverse_h.subs({U:40,m:2,g:10}),energy(2,4)/first,80-first,'m=U/(gh)','κ₁ κ₂',
      second/first,(first+second)/2,(4*first/(4*10))/2,(480/sp.Integer(3))/(10*4),third/(10*2),sp.Integer(2)]

MANUAL=[
 'Asse verticale verso alto, peso−mg. Wg=−mgh=−2·10·2=−40J; incrementoU=−Wg=+40J. Non richiede conoscere velocità o lavoro di altri agenti.',
 'mgh:kg·(m/s²)·m=kgm²/s²=N·m=J. gconserva unità anche se suo numero vale10.',
 'Suogni tratto Wg=−mg(y_j−y_i); sommare telescopa a−mg(y_f−y_i). Sulcircuitoy_f=y_i→zero, indipendentemente da lunghezzapercorso/durata.',
 'h2m,g10 comuni,m2→4kg:U40→80J. Incrementi non quote assolute o lavoroesterno necessariamente.',
 'm=U/(gh)=40J/[(10m/s²)(2m)]=40/20kg=2kg; peso20N distinto.',
 'mg20N;h=U/(mg)=40J/20N=2m; differenza diquota, non quotaarrivo assoluta.',
 'm2kg,g10,h2→4m:U40→80J;rapporto2. Lineare in h, non h².',
 'CorrettoU40J,proposto80J;scarto80−40=+40J. Segnoscarto diverso da segnoWg.',
 'U=mgh congh>0→m=U/(gh)>0;dimensione massa. Nessunmezzo della cinetica nella leggegravitazionale.',
 'Secondomassaκ₁m,secondodislivelloκ₂h→U_Bκ₁κ₂mgh;rapportoκ₁κ₂,stessog.',
 'U_A40J,U_B4·10·4=160J;rapporto160/40=4=2·2.',
 'Media(40+160)/2=100J;dati medi m3kg,h3m danno90J,diverso. 100 tra40e160, senzaarrotondamenti.',
 'TargetU_B4·40=160J,m_B4kg→peso40N,h_B4m;h_B/h_A4/2=2.',
 'Uref40J,Sref120→c3J⁻¹;S480→U160J;h4m→m160/(10·4)=4kg.',
 'ΔS321−81=240,ΔU160−40=120J→c2J⁻¹;d81−2·40=1;S161→U80J;h2→m80/20=4kg.',
 'm=ch,c1kg/m costante fra prove→U=cgh². h²40J/[(1kg/m)(10m/s²)]=4m²;rami±2m,solo+2 ammissibile,m2kg,U40J.'
]
DISTRACTORS=[
 '−40J è lavoro delpeso,nonincrementoU;forzeesterne possonoanchecambiareK,nessuna uguaglianza automatica con lavorodiunagente.',
 'N forza,W energia/tempo,kg massa,m lunghezza:nessunaunità di energia eccettoJ.',
 'Positivo/negativosemprecontraddiconotelescope;mgperlunghezzasomma moduliignorandosegno;durata nonmodificaforza conservativa. Attritoeventuale noncompreso.',
 '160raddoppiaancheh;20proporzionalitàinversa;invarianza/zeroignorano massamaggiore e dislivellopositivo.',
 'Peso20N nonmassa;moltiplicareghnonisola edàdimensionierrate. Sostituzione2·10·2=40.',
 'Quotafinaleassoluta richiedequota iniziale;lunghezzapercorso puòessere maggioreh senza cambiareU.',
 '1/2inverte;4quadratoassente;1ignora hnuovo;−2incompatibile dueaumentipositivi.',
 '−40ordineinverso,80ripeteproposta,20dimezza;80Urichiederebberaddoppioindebitomoh.',
 'Ughdimensionisbagliate,gh/Uinversomassa;U/(2gh)metà e2U/(gh)doppio nonricostruiscono U.',
 'Quozientiinvertonounfattore;somma2allidentità;quadratoκ₂nonpresente in campouniforme.',
 '2consideraunsoloingresso;160JenergiaBnonrapporto;inverso1/4 nonrichiesto.',
 '200somma,50altradivisione,90prodottodati medi,99/101nonsemisomma esatta.',
 'hquadruplo emdoppia→Uottupla;hcostante→Udoppia;4mnuovi nonrapporto4.',
 '480comeJ→m12kg,guadagnospurio3;4kg riproduceU160eS480.',
 'm2,3,5,8kgah2m→S81,121,201,321;solo4dà161. Rapportoletturegrezzenoneliminaoffset.',
 'h−2m renderebbeanchenegativamnelvincolo;h4confondenumeroquadrato;h1o3dannoU10o90J.'
]
ASSUMPTIONS=['Campo gravitazionale uniforme e costante,g>0,m>0 costante durante il percorso, incremento diquota h>0. U indica differenza di energia potenziale, non quotaassoluta né lavoro totale di tutte le forze; gravitàconservativa.']*16
ASSUMPTIONS[2]='Percorso chiuso, massa e campo uniformecostanti: lavoro della sola gravità. Altre forze,attriti e durata non entrano nella quantitàrichiesta.'
ASSUMPTIONS[15]+=' m=(1kg/m)h lega provediverse, non massa che cresce durante una salita. Ramo positivo imposto sia da h sia da m.'
UNITS={n:'J' for n in range(1,17)}
UNITS.update({5:'kg',6:'m',7:'',9:'kg',10:'',11:'',13:'',14:'kg',15:'kg',16:'m'})
NUMERIC_UNITS={1:'J',5:'kg',6:'m',8:'J',11:'1',12:'J',13:'1',14:'kg',16:'m'}
SUFFIX={15:' kg'}


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
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_weight_scalar_product_and_telescoping_path','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='5479d83a74833d8803040e0e3def07c56a1153ae'
REVIEWED_PACKAGE_SHA256='5578d368be8b7ed9105f9dbe1191476b6de4056990a0a81fd55b7e825dedd1aa'
REVIEWED_BINDINGS_SHA256='371616e822437073d445449dbc62311582fc6b0fc1f64d15bac3f442540289fe'
REVIEWED_CANDIDATES={'AR-u2-gravitational-energy-01': '826192a13367f517bad04b85a8e142ecf5e483717d74c3a0f1b209e9f23ca0d7', 'AR-u2-gravitational-energy-02': '5970f521974af63905f22dc38f8a03fe55d2e3807df9febc190fea2ec2b9bb37', 'AR-u2-gravitational-energy-03': '640c86ad5d81c2a22834f2f4e7d3b4ba981e0e29b0c1b986a10d2599699d166b', 'AR-u2-gravitational-energy-04': '3fb65faeb3499d136522cf63407b83641871b37ceb038f353c4c8fa899706576', 'AR-u2-gravitational-energy-05': 'bcf64399243e7763c8c95a1e9b03e3e7ba3894e26fc5a95141bcbd3530a4cebb', 'AR-u2-gravitational-energy-06': '413bf790cca7a17d59712e6753d8bcf6e7e7448200bfb75c85f0d872bcb51993', 'AR-u2-gravitational-energy-07': 'f40c560ba06f0dd0c37fb3bdc772f1fa86392f3667299f75a0a3d970c1a2bb34', 'AR-u2-gravitational-energy-08': '3e34e082a5d77e4afc14c1f67b313b68ee5483dc9e313aa3f470e9d6845c16ab', 'AR-u2-gravitational-energy-09': 'f1fffa7e34d29c4e0552540e841f3c68afc9ef2956a241fd414332fa1d942121', 'AR-u2-gravitational-energy-10': '8aa86e1efe6752ddeea0e966025c89e1f254558a3dd86c968f1bbeb6aca71493', 'AR-u2-gravitational-energy-11': '2757197f66196e054f04eeeb9fb4091d220d2323cb799ec298c4228aa244f87f', 'AR-u2-gravitational-energy-12': 'd18f10c54e59d4058c1bca9e5a77d55d82003b760876dab81dfb8aac51695681', 'AR-u2-gravitational-energy-13': '8d1fcdecccdc8ed2324a51a806bed53043f3193932d4112abd9fccc1f3941e2b', 'AR-u2-gravitational-energy-14': 'a938a78e40afcbd74093d8269c167a739e9db45ceeb744cb8cb8b5f9a3cd5a55', 'AR-u2-gravitational-energy-15': '3238a46e3797708281cc6d2c1c11365aee59995c4a0bf5b6b78f4e749c7893a4', 'AR-u2-gravitational-energy-16': '7c2483864af645616d2a3c601f785c37383c0726b47c81ac35576324b0499755'}
READ_SOURCE_SHA256={'u2-gravitational-energy-01': 'bb80ba9af7c0a9d253bfedf2a658b11e2f1c4c66b3a6f85b0232b076967f6feb', 'u2-gravitational-energy-02': 'fbbe104f3990fb6981e04c8311e988389131d0cf0504cfb131277028fc6cc049', 'u2-gravitational-energy-03': '0b2280c88dbcf4f85783f5a5b0c8338800904ec10a1eb58c267ce397e95b3c41', 'u2-gravitational-energy-04': '8523066fa16085f29022858bd93ae83e3f8d5a5effd572a67a466b4fabfd4a22', 'u2-gravitational-energy-05': '02de4d453ffe65c1d0e30b66690eac437b485fe05e43b0ecf98fa82b893dcfb9', 'u2-gravitational-energy-06': 'e223022f9cb5ef59a64531c4427ff71670ff9a603d3af879a211501666ac495e', 'u2-gravitational-energy-07': 'd022c37d3b52a8f6f446a3694efc5d99a89e31160177d72115ed9f9115f75e4b', 'u2-gravitational-energy-08': '6827722b018e954ed45b663476bfda693248f8c7d996121c9112a433caa9200d', 'u2-gravitational-energy-09': '2c4bff6a5f99cd2c5c53cbd1526cdbf7db0534189c59b8ee50c6ab1370cee6c4', 'u2-gravitational-energy-10': 'c667286a0b775880c8a0700b2418712c08df71414cfdc143f42ef3e40b5c66e3', 'u2-gravitational-energy-11': 'b2ddf4bf39e500c5837a1323571a21e8395cf77afec593a40718e8e918adb28d', 'u2-gravitational-energy-12': '45ad58565d9d8fdaaec5bc4f8ee8a92f76a8e5a3897c75fa8919c91b66612207', 'u2-gravitational-energy-13': '89e2e5870aea5dcb090c57b4bf7bdd050507f937e7dc93e311cf6b4b16a4ee3d', 'u2-gravitational-energy-14': '74d366eebc72b121bcd39c78c2c433326a3bb2147648fbd99ced55453c527d75', 'u2-gravitational-energy-15': 'c5d506c759d0a84abe7f07dfc49ac70d23f8f8356ea80519eae5c809b89b4975', 'u2-gravitational-energy-16': 'cdb2568f6a339a61cc0b96ff0fb4b511d2eec8bdcbe382bc1852b772fa18cd3f'}
