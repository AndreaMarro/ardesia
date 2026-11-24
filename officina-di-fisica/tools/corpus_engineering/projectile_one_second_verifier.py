"""Separate reviewer: integrate vertical acceleration, then audit all16 read tasks.

No candidate-authoring import. Edition hashes are frozen after individual reading
and rereading the separate author's correction of the tau definitions in12/13.
"""
from fractions import Fraction
import json
from pathlib import Path
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json'
CANDIDATE_REF='e7a3f0b941ff35ffcc6bf32e852c3d191619168a'
EXPECTED_IDS={f'AR-u2-projectile-one-second-{n:02}' for n in range(1,17)}
REVIEWED_PACKAGE_SHA256='7fece1a6f7d2503324d10f96b886b9ca7fe3570fc6c1c05a396e4303d10e0db2'
REVIEWED_BINDINGS_SHA256='810ca6ff07e50fa64a40bdc4fcea88e4e879274fa9a484a392e4b2bb9e0f154f'
REVIEWED_CANDIDATES={
 "AR-u2-projectile-one-second-01": "e3bafa71dec0ccc3dd751737e42541fec588009e4965d3718afd74da745a5155",
 "AR-u2-projectile-one-second-02": "085d750822fc308de45765eaf3604878a7f1934f94dbaac64e27b536585d8522",
 "AR-u2-projectile-one-second-03": "b48a4d21965cf7d89a0bffa917b6fc1d89d2a8bda7e23eaec1e1cbae3649fe9e",
 "AR-u2-projectile-one-second-04": "0e8890cbffca2df911060cc1fd270e830775c00c45fbff02da41feb3c8b69656",
 "AR-u2-projectile-one-second-05": "badfb90da5a4594c2942dc0115d940c2f0b1af8de491df8201678a0ff88aa982",
 "AR-u2-projectile-one-second-06": "8262ced781ef939f4cebad384654cfdbae24116183c44279a49db11c6ad80dd4",
 "AR-u2-projectile-one-second-07": "30c1dbcb030a35befd2a815d4889425f5fc286a8c56ad7fc0c15b155259aee35",
 "AR-u2-projectile-one-second-08": "5a24ce4963b86b64f0da8ef970b75b24996c9268942f3802e0bce62bd911b20e",
 "AR-u2-projectile-one-second-09": "58b75e0f1b495b4a9a44ea86e1acd67f9a97fe1e008bea7234b01e95a46b746d",
 "AR-u2-projectile-one-second-10": "a54a83dd7c19d6549357de28d0fe32a72737e1c4193eace386e855584e144eb4",
 "AR-u2-projectile-one-second-11": "333e91ef73bcd70f81659b3d2d008148501dbafe038c1afcd2ac61628aa57065",
 "AR-u2-projectile-one-second-12": "1b85ca53d04dfa108f2811c13555f8fd97e4558f569234a9ef394a2b3a775dcd",
 "AR-u2-projectile-one-second-13": "554dac2275da59f05e5f8fcbf75751e7a97c9890921ec17ddfbfebafb7c357f1",
 "AR-u2-projectile-one-second-14": "d1cf9e771f4ef144b0e645389d23ac8e7967bb93ca438f89eaad87c0b4257869",
 "AR-u2-projectile-one-second-15": "05c7d0568002b871c949defd4bc46610ee50f467a714d49f4e0920da38c23e9d",
 "AR-u2-projectile-one-second-16": "6f2de64ab54075c0ed52871c2aed3841a8c9020570d44f87076aaf1513121809"
}

# Original row digests independently compared with the pinned Git blob before freeze.
READ_SOURCE_SHA256={
 "u2-projectile-one-second-01": "c3f762a2974bc858e6625e0f80bf1fb64bc37d06dc9afad64ded6fc1cec8b48e",
 "u2-projectile-one-second-02": "5385afea983f0a6f7f96c3b55bb5dee4ef76017a2c5432041634850de782e0e2",
 "u2-projectile-one-second-03": "3f494b2b1a9c780c070d4019e9d73c220042b3b8bdd9b12dbb7c9be56050919a",
 "u2-projectile-one-second-04": "baefd4e681b55a2cae2dec54a602b6bf3b0033476ecf4baeea181c757584bbf5",
 "u2-projectile-one-second-05": "79c1ee6c4661f287f907fa3bcfd8ad3c50e53a5cf0d2a294810c6525eb6913e9",
 "u2-projectile-one-second-06": "fa4ffc6fe3cb575a80034f6addb546e0fa002d08b302984cf21242d277aadd80",
 "u2-projectile-one-second-07": "047ce95369b8858b5de697c54c0e35569fae26043fd186db657ffc0758f19311",
 "u2-projectile-one-second-08": "44022e57a42ba13b20cb44444e20c95ee84730f8839033bc2fe6ffdc49c05fc1",
 "u2-projectile-one-second-09": "b0a05ea6a3f3b72066f54c70dab125fa588707a870eca94feecf880f8e3deb3e",
 "u2-projectile-one-second-10": "3f1d8a4ed582e3a50a71a5fdb5019ff4429a68258fcc2936788e34e5abda5362",
 "u2-projectile-one-second-11": "bc3cb89c36d63da89e8ad5bd8c495baa4ddb6a0290f492e6fe1aa916413f90fa",
 "u2-projectile-one-second-12": "4afe2bde9741cfc6a76ce2ff9e484763fcfd9c4942d107f65838d6b68e9da674",
 "u2-projectile-one-second-13": "b15c2569cf46fa60b6fff1c5ea45dc98fcb4537179f771134f948f12a595bcf0",
 "u2-projectile-one-second-14": "170315aaaa8a6d1c244c802179cc30076d10d97cd8547e155fe2003897892c36",
 "u2-projectile-one-second-15": "d0fb161dbd31a61c736ff15bb8268dc45372644db64c7b84c9216f122f5e8cdf",
 "u2-projectile-one-second-16": "d71c01791220de1faff8cb5b4033672d4ffed60d715f1536581324cc6b9594d3"
}

def oracle():
    t=sp.Symbol('t',nonnegative=True)
    g,w,tau=sp.symbols('g w tau',positive=True)
    H=sp.Symbol('H',positive=True)
    # Independently integrate a_y=-g with v_y(0)=w and relative y(0)=0.
    velocity=w+sp.integrate(-g,(t,0,t))
    relative=sp.integrate(velocity,(t,0,tau))
    if sp.simplify(relative-(w*tau-g*tau**2/2))!=0:raise ValueError('Vertical integration failed')
    inverse_g=sp.solve(sp.Eq(relative,H),g)[0]
    inverse_w=sp.solve(sp.Eq(relative,H),w)[0]
    def h(gg,ww):return relative.subs({g:gg,w:ww,tau:1})
    first,second=h(2,4),h(4,6)
    k1,k2=sp.symbols('k1 k2',positive=True)
    scaled=sp.cancel(relative.subs({g:k1*g,w:k2*w})/relative)
    if sp.simplify(scaled-(k2*w*tau-k1*g*tau**2/2)/(w*tau-g*tau**2/2))!=0:raise ValueError('Independent difference scaling failed')
    Q=SI.Quantity
    measured=(Q(4,'m/s')*Q(1,'s')-Q(Fraction(1,2),'')*Q(2,'m/s**2')*Q(1,'s')**2).to('m').magnitude
    inverse_units=(2*(Q(6,'m/s')*Q(1,'s')-Q(4,'m'))/Q(1,'s')**2).to('m/s**2').magnitude
    display_gain=(Q(9,'')/Q(3,'m')).to('1/m')
    if display_gain.magnitude!=3:raise ValueError('Pint display gain dimensions failed')
    if sp.Rational(measured)!=first or inverse_units!=4:raise ValueError('Pint length/inverse dimensions failed')
    c,d=sp.symbols('c d',real=True)
    calibration=sp.solve([sp.Eq(c*first+d,7),sp.Eq(c*second+d,9)],(c,d))
    recovered=(5-calibration[d])/calibration[c]
    new_w=inverse_w.subs({g:4,H:sp.Rational(4,3)*first,tau:1})
    constrained=sp.solve(sp.Eq(relative.subs({g:w/2,tau:1}),3),w)[0]
    # A positive height need not have positive endpoint velocity: counterexample.
    if not (h(4,3)>0 and velocity.subs({w:3,g:4,t:1})<0):raise ValueError('Height/velocity distinction failed')
    # SVG Q(200,620) control point yields exact quadratic, not an arbitrary arc.
    u=sp.Symbol('u',real=True)
    svg_y=(1-u)**2*700+2*(1-u)*u*620+u**2*580
    if sp.expand((700-svg_y)/40-(4*u-u**2))!=0:raise ValueError('Read SVG quadratic disagrees with integrated trajectory')
    return [first,'m','H=wτ−gτ²/2','Diminuisce da 3 a 2 m',
      inverse_g.subs({w:4,H:3,tau:1}),inverse_w.subs({g:2,H:3,tau:1}),
      h(2,6)/first,6-first,'g=2(wτ−H)/τ²','(κ₂wτ−κ₁gτ²/2)/(wτ−gτ²/2)',
      second/first,(first+second)/2,new_w/4,
      inverse_g.subs({w:6,H:12/(9/first),tau:1}),
      inverse_g.subs({w:4,H:recovered,tau:1}),constrained]

MANUAL=[
 'Integrale di4−2t su0..1:4−1=3m; trapezio velocita(4+2)*1/2=3m; vfinale2m/s,apice2s non1s.',
 '(L/T)T=L e(L/T2)T2=L, quindi differenza espressa in metri.',
 'ay=−g;integrazione due volte da condizioni iniziali produce H=wτ−gτ2/2;H>0 equivale w>gτ/2,non w>gτ.',
 'wτ4m fisso; perdite gτ2/2=1e2m,quote3e2m; inB vfinale0 ma quota2m.',
 'wτ−H=4−3=1m; g=2*1/(1s)2=2m/s2,con0<H<wτ.',
 'wτ=H+gτ2/2=3+1=4m; diviso1s da4m/s; H/τ3m/s e media,non iniziale.',
 'H_A4−1=3m,H_B6−1=5m,rapporto5/3 puro.',
 'Hcorretto3m;proposta6m,scarto6−3=+3m;6 supera persino quota uniforme4m.',
 'Isolare gτ2/2=wτ−H,poi moltiplicare2/dividereτ2; numeratore positivo e unitaL/T2.',
 'Sostituire gBκ1g,wBκ2w nella differenza e dividere perHA>0. Seκ1=κ2=k rapporto k,non1.',
 'HA4−1=3m,HB6−2=4m,rapporto4/3.',
 'Media(3+4)/2=7/2m; linearita aτ1s: wmedio5,gmedio3→5−3/2=7/2,coincidenza prevista dalla legge.',
 'TargetHB(4/3)*3=4m;gB4→perdita2m;wB(4+2)/1=6m/s;rapporto6/4=3/2.τdefinito esplicitamente nel fix.',
 'HA3m,c9/3=3m−1;S12→H4m;w6→g2*(6−4)=4m/s2;Hpositivo e inferiore6m.',
 'c(9−7)/(4−3)=2m−1,d7−2*3=1;S5→HC(5−1)/2=2m;g2*(4−2)=4m/s2.',
 'g=w/(2s);aτ1s H=w*1s−w*(1s)2/(4s)=(3/4)w*1s;w4H/(3s)=4m/s,g2m/s2 unico positivo.',
]
DISTRACTORS=[
 'Somma perdita→5m;perdita senza mezzo→2m; usare velocita finale2m/s come quota confonde dimensioni.',
 'm/s velocita,m/s2 accelerazione,s durata,1 conteggio; nessuna delle quattro e una quota.',
 'Piu implica accelerazione alta; senza1/2 doppia perdita;solo gτ2/2 caduta dafermo;w−g/2 e dimensionalmente incompatibile.',
 'Zero e vfinaleB,non quota;5m usa segno gravita errato;−2m non deriva dal percorso;H_A non e altezza massimaA4m.',
 'Omettere2→g1;invertire differenza→gnegativo;H/(wτ) numero puro.',
 '3m/s media non iniziale;2m/s sottrae invece di recuperare perdita;nessun periodo o quota massima usati.',
 '3/2 rapporto soli w;2/3 inverso di quel rapporto errato;2 incremento2m trattato come fattore;1 ignora cambiamento.',
 '−3 ordine inverso;6 ripeteproposta;6puo derivare da wτ+gτ2 con due errori insieme.',
 'Differenza inversa cambia segno;senza2 dimezza;somma non e perdita;quozienteH/(wτ) adimensionale.',
 'κ2/κ1 e reciproco ignorano pesi dei termini;κ1κ2 non scala differenza correttamente;κ2−κ1 da0aidentita.',
 '3/2 solo componenti;2 solo campi;3/4 inverso;3 prodotto fattori anziche differenze.',
 '3e4 singolauscita;7 somma;5m omette perdita media3/2m;media non temporale interna al volo.',
 '4/3 trasferisce rapportoH a w;2 darebbeHB6m;2/3 riducew;1 lasciaHB2m.',
 'S12come12m produrrebbe gnegativo;guadagno3m−1 non e una quota;controlloS3*4=12.',
 'g1,2,6,8 dannoH7/2,3,1,0m e letture8,7,3,1;solo g4restituisceS5.',
 'H=wτ ignora gravita;perdita meta invecequarto usa g=w/(1s);relazione fra prove non campo variabile neltempo.',
]
ASSUMPTIONS=['Riferimento verticale inerziale,alto positivo,g>0 uniforme costante in ogni prova,aria e urti assenti durante τ=1s;w e componente verticale iniziale,non rapidita totale.']*16
ASSUMPTIONS[2]+=' H>0 non impone salita allistantefinale;controesempio w3,g4,τ1 daH1m evfinale−1m/s.'
ASSUMPTIONS[8]+=' Inversa del modulo fisico con0<H<wτ.'
ASSUMPTIONS[9]+=' κ1,κ2>0 e le due quote positive;parametri cambiano soltanto fra prove.'
ASSUMPTIONS[11]+=' Uguale peso statistico;nessuna media temporale di H.'
ASSUMPTIONS[13]+=' Lettura nella stessa scala,c>0,offset nullo;conversione S→H prima di invertireg.'
ASSUMPTIONS[14]+=' c>0,dcostante;due quote distinte identificano guadagno/offset.'
ASSUMPTIONS[15]+=' Coefficiente1/(2s)dimensionale lega prove con campi costanti;unica soluzione positiva.'
UNITS={n:'m' for n in range(1,17)}
UNITS.update({5:'m/s**2',6:'m/s',7:'',9:'m/s**2',10:'',11:'',13:'',14:'m/s**2',15:'m/s**2',16:'m/s'})
NUMERIC_UNITS={1:'m',5:'m/s²',6:'m/s',8:'m',14:'m/s²',16:'m/s'}
SUFFIX={12:' m',15:' m/s²'}


def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed projectile package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed projectile binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u2-projectile-one-second-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned projectile source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent projectile conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-');suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing unit')
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(want):errors.append('Independent projectile integrated result mismatch')
            except (ValueError,TypeError):errors.append('Independent projectile exact answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent projectile numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_integrate_ay_then_vy','SymPy_independent_inverse_and_affine_calibration','Pint_Fraction_exact_dimensions','separate_full_statement_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Derived from acceleration integration after reading16originals; all16candidates read,12/13reread after tau fix; SVG parabola,area,andscales independently checked'}}
