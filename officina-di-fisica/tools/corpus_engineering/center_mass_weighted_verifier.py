"""Independent per-ID review, distinct from candidate author. No authoring import."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-05.json'
FAMILY='center-mass-weighted'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    M,m,d,X=sp.symbols('M m d X',positive=True)
    x0,x1,shift=sp.symbols('x0 x1 shift',real=True)
    # Definition from first mass moment, not a memorized output list.
    moment=M*x0+m*x1
    center=moment/(M+m)
    if sp.simplify(center.subs({x0:x0-shift,x1:x1-shift})-(center-shift))!=0:raise ValueError('Weighted translation covariance failed')
    law=center.subs({x0:0,x1:d})
    im=sp.solve(sp.Eq(X,law),m)[0]
    idistance=sp.solve(sp.Eq(X,law),d)[0]
    if sp.simplify(im-M*X/(d-X))!=0 or sp.cancel(sp.diff(law,m)-M*d/(M+m)**2)!=0:raise ValueError('Weighted inverse/monotonicity proof failed')
    # Newton sum: internal spring force cancels for unequal masses too.
    f,E1,E2=sp.symbols('f E1 E2',real=True)
    a1=(E1+f)/M;a2=(E2-f)/m
    if sp.simplify((M*a1+m*a2)/(M+m)-(E1+E2)/(M+m))!=0:raise ValueError('Internal force cancellation failed')
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({m:a*m,d:b*d})/law)
    inverse_opts=[M*X/(d-X),M*X/(d+X),M*(d-X)/X,X/(d-X),2*M*X/(d-X)]
    scale_opts=[a*b*(M+m)/(M+a*m),a*b,a/b,a*b*(M+a*m)/(M+m),b/a]
    for opts,want in [(inverse_opts,im),(scale_opts,ratio)]:
        if [i for i,v in enumerate(opts) if sp.cancel(v-want)==0]!=[0]:raise ValueError('Weighted symbolic alternatives not unique as general laws')
    def position(mass,distance):return law.subs({M:2,m:mass,d:distance})
    A,B=position(2,2),position(4,4)
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,3),sp.Eq(gain*B+offset,sp.Rational(19,3))],(gain,offset))
    C=(sp.Rational(11,3)-cal[offset])/cal[gain]
    u=sp.Symbol('u',real=True)
    roots=sp.solve(sp.Eq(u*u/(u+2),1),u)
    if roots!=[-1,2] or (A+B)/2-position(3,3)!=sp.Rational(1,30):raise ValueError('Weighted constraint/mean proof failed')
    Q=SI.Quantity
    cm=(Q(2,'kg')*Q(2,'m')/(Q(2,'kg')+Q(2,'kg'))).to('m')
    mass=(Q(2,'kg')*Q(Fraction(4,3),'m')/(Q(2,'m')-Q(Fraction(4,3),'m'))).to('kg')
    gain_si=(Q(Fraction(10,3),'')/Q(Fraction(5,3),'m')).to('1/m')
    constraint=(Q(1,'kg/m')*Q(2,'m')).to('kg')
    if (cm.magnitude,mass.magnitude,gain_si.magnitude,constraint.magnitude)!=(1,4,2,2):raise ValueError('Pint Fraction weighted CM dimensions failed')
    return [A,'m','Ha velocità costante, eventualmente nulla','Da 1 a 4/3 m',im.subs({M:2,X:1,d:2}),idistance.subs({M:2,X:1,m:2}),position(2,4)/A,2-A,'m=MX/(d−X)','κ₁ κ₂ T_A / T_B',B/A,(A+B)/2,(sp.Rational(8,3)*A*(2+4)/4)/2,im.subs({M:2,X:sp.Rational(8,3),d:4}),im.subs({M:2,X:C,d:2}),sp.Integer(2)]

MANUAL=['Massa totale2+2=4kg; momento primo2kg·0+2kg·2m=4kgm; X=4/4=1m. Prima massa resta nel denominatore.', 'Numeratore kg·m e denominatore kg: X ha lunghezza m; non massa, velocità, forza o rapporto puro.', 'Somma Newton: M a1=E1+f,m a2=E2−f; massa totale per a_CM=E1+E2=0. Quindi V_CM costante, eventualmente zero; una molla può cambiare il moto relativo.', 'A:X=2·2/(2+2)=1m; B:X=4·2/(2+4)=4/3m. 4/3>1,ma<2. Non raddoppia perché cresce anche massa totale.', 'X(M+m)=md→MX=m(d−X)→m=MX/(d−X). 0<X<d. Numeri2·1/(2−1)=2kg.', 'd=X(M+m)/m=1m·4kg/2kg=2m. Il centro è a metà soltanto grazie alle masse uguali.', 'Masse uguali immutate: X_A=1m,X_B=2m; rapporto2/1=2, puro e nello stesso riferimento.', 'Centro corretto1m; scarto proposto2−corretto1=+1m. Non cambia il significato della coordinata.', 'Raccogli m:MX=m(d−X),m=MX/(d−X). Positività e massa finita richiedono0<X<d; M mantiene kg.', 'X_A=md/T_A,X_B=κ1κ2md/T_B; rapportoκ1κ2 T_A/T_B. T_A=M+m,T_B=M+κ1m; M resta fissata.', 'A=1m,B=4·4/(2+4)=8/3m; rapporto8/3. Numeratore quadruplo,massa totale da4a6.', 'Media(1+8/3)/2=(3/3+8/3)/2=11/6m. Ingressi medi3kg,3m danno9/5m; differenza(55−54)/30=1/30m.', 'Target X_B=8/3m,m_B4kg: d_B=X_B·6/4=4m; d_B/d_A=4/2=2.', 'Ref X1m,S3→c3m⁻¹. S8→X8/3m; d−X=4/3m,m=2·(8/3)/(4/3)=4kg.', 'ΔS19/3−3=10/3,ΔX8/3−1=5/3m→c2m⁻¹; a1. X_C=(11/3−1)/2=4/3m,m_C=2·(4/3)/(2−4/3)=4kg.', 'm=ad,a1kg/m; X(M+ad)=ad². Con d=u m: u²−u−2=(u−2)(u+1)=0. Radici2,−1; solo d2m,m2kg sono positive e danno X1m.']
DISTRACTORS=['X2m ignora M;0 ignora m. Con entrambe positive centro strettamente interno,qui a metà.', 'kg massa,m/s velocità,N forza,1 puro; soltanto m ha dimensione di posizione.', 'Oscillazione necessaria del centro e accelerazione della massa minore confondono moto relativo e globale; sempre fermo richiederebbe V_CM iniziale nulla; massa maggiore non crea forza esterna.', '2m raddoppia il solo numeratore,1m ignora nuova massa,2/3m inverte effetto,zero impossibile con md>0.', 'Più al denominatore dà2/3kg e fallisce sostituzione; peso o prodotto non isolano m.', '1m confonde coordinata con separazione; punto medio lecito perché masse uguali.', '1/2 inverte,4 introduce quadrato,1 ignora nuova d,−2 impossibile con coordinate positive.', '−1 ordine inverso,2 ripete proposta,1/2 dimezza ancora,zero accetta errore.', 'MX/(d+X) segno errato; M(d−X)/X reciproco, può coincidere solo per dati speciali non identità; X/(d−X) puro;2MX/(d−X) raddoppia.', 'κ1κ2 ignora nuova massa totale; T_B/T_A inverso; κ1/κ2 eκ2/κ1 non seguono il modello. Alternative distinte come leggi generali pur coincidendo in sottocasi.', '3/8 reciproco,4 ignora denominatore,2 segue solo d,4/3 segue solo m.', '11/3 somma,11/12 ulteriore metà,9/5 risposta agli ingressi medi,5/3 differenza. Fra11/6e9/5 confronto55contro54.', '8/3 segue solo uscita;4 è distanza non rapporto; nessun raddoppio ulteriore necessario.', 'S8 trattato come8m supera d4 e genera massa negativa,diagnosi di taratura mancante.4kg ricostruisce entrambi i dati.', 'Masse2,3,5,8kg a d2 danno X1,6/5,10/7,8/5m e S3,17/5,27/7,21/5; nessuna11/3. Rapporto letture non elimina offset.', '−1m produce massa negativa;−2 non è neppure radice;1o3m danno1/3o9/5m per X. Non semplice radice±2 perché termine lineare.']
ASSUMPTIONS=['Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Sistema delle due masse e molla ideale massless; riferimento inerziale, risultante esterna orizzontale nulla e masse costanti. Le forze interne si cancellano, la velocità iniziale del centro non è imposta.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Inversa 0<X<d; M=2kg positiva e finita.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Inversa 0<X<d; M=2kg positiva e finita.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Vincolo m=(1kg/m)d fra configurazioni, non variazione durante una prova; radici alternative verificate e solo positiva ammessa.']
UNITS={1: 'm', 2: 'm', 3: 'm/s', 4: 'm', 5: 'kg', 6: 'm', 7: '', 8: 'm', 9: 'kg', 10: '', 11: '', 12: 'm', 13: '', 14: 'kg', 15: 'kg', 16: 'm'}
NUMERIC_UNITS={1: 'm', 5: 'kg', 6: 'm', 8: 'm', 13: '1', 14: 'kg', 16: 'm'}
SUFFIX={12: ' m', 15: ' kg'}

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
         'methods':['SymPy_independent_mass_moments_and_Newton_sum','SymPy_origin_translation_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='ad30c44e979bc4b59847658440c4d65f59f3d8df'
REVIEWED_PACKAGE_SHA256='3fcfa919bbc853338850231a471d0f09be8a0f569eea92dff1593f2cd1ef1d02'
REVIEWED_BINDINGS_SHA256='9aa5b5b7483589b83e487457fa3e9c41e1381b1927fb5a1cbe251a83683b48b1'
REVIEWED_CANDIDATES={'AR-u2-center-mass-weighted-01': 'c4b3b6899eb5d216350d823ba9576192757e8435d4e872633b88f6bbaacff292', 'AR-u2-center-mass-weighted-02': 'daf1717b6923a8d4ae8c7a4581ea223369ce3b42774bf202e5117761417d4041', 'AR-u2-center-mass-weighted-03': 'aa373dcdad5e6f8d44c58305a0d4d1ed9145fc4176ff023cdc3bc72c062d021c', 'AR-u2-center-mass-weighted-04': 'f46745da7659b01168cee93afce0fa06d39f6fc38eff6414c3bf255b1596be3f', 'AR-u2-center-mass-weighted-05': 'd319c9a8ae5fe4002836562bc45ae2104ed4169b8d1aa9cb23e87be535003e18', 'AR-u2-center-mass-weighted-06': 'c64e188893023d4b4bdbae879207654eebc81e031055c750a2fa07999b7d0824', 'AR-u2-center-mass-weighted-07': '18c581ff9ea4a9920c34e5e81e076eea19933cd1319d9707183fdb241cd849f8', 'AR-u2-center-mass-weighted-08': '42926c872424e25fa3d54ddd2e7947a455301b76cdc1e3d1abbf5ea54d0aa351', 'AR-u2-center-mass-weighted-09': 'd2c3cbbb0dab830be210bc58fb55665422c6cfe5e1b2d8645926285e54009f47', 'AR-u2-center-mass-weighted-10': 'b77e194ac30a50ae55ba51b9764ca08ed6c0e991655836c484d3bbafb8e91a94', 'AR-u2-center-mass-weighted-11': '9e7d8b15e20647c92ff7e727a210003baf74c86f6da34d6c68f67cc8b5386b20', 'AR-u2-center-mass-weighted-12': '7a32250da2d98febd68ac25c93e347032cb2a7aa0ba8e47191b08fb7ca02a951', 'AR-u2-center-mass-weighted-13': '83ba981643fb25606294ec94d222e14d7278341243f5708c9a9c7548ddf55625', 'AR-u2-center-mass-weighted-14': 'bc8853b7ce1d7db00050d5bf2d9148958fece4f62b2b00da2c951bf3b9991dda', 'AR-u2-center-mass-weighted-15': 'dd83a2344bb83ec95c9748e0eec62a6544cb4d7cc6d2f3a78d3ed6e3d039535e', 'AR-u2-center-mass-weighted-16': '7ed4c6930a9bfaa9bffaa37ee0f66fd62f8355b8fdda241d16598a12dadee997'}
READ_SOURCE_SHA256={'u2-center-mass-weighted-01': 'bcc8623ed971a842b16b9514fe98cc67ce9a9dc8565d01e06a28f9837c888bf8', 'u2-center-mass-weighted-02': '8a7dc7dc53a62d2e09626eb0bc9501a4a7a9ff8541afdb17c76ab45210385fa2', 'u2-center-mass-weighted-03': '815faf1f8234a52df51acd59f1de775ef48427d1b1aa2bf71a34c9d63eaab457', 'u2-center-mass-weighted-04': '1e84b1a3d01125b9cebf7a5e96bead70751fd3c7af445928bdde98eb2876ab9b', 'u2-center-mass-weighted-05': 'afcc86b4a15eb6453efdf2e1d713e557baa1950007aa04d3eb67840a67bdb7eb', 'u2-center-mass-weighted-06': '79cf8aa0f6f9e63d2fad7de7089826d19818837d169d72ddea8fc378293dbba7', 'u2-center-mass-weighted-07': 'b8d014efa9be91d97ced976e8684a87a9530043254225273ae993e942807781a', 'u2-center-mass-weighted-08': '30334658b22acbc9793508728176496c45232701675575c5fdae2d31c41cf9e7', 'u2-center-mass-weighted-09': '8ada7bcc4ab746cd6f0baa569fa13b1ced0875fe553481067cc1f185d2165b75', 'u2-center-mass-weighted-10': 'e998a06863ea020f98185b0a0a801553b3d1c5d21cc9ebfb977f06aa846d1176', 'u2-center-mass-weighted-11': 'c80ed059a2d7da7868426f5dcf9b9ba951b226308bea15be3d81c1d2c86012ae', 'u2-center-mass-weighted-12': 'b6a18b98de6cd80fbf4de0234dd0da424e6fe722c772436d6862072e9bacd832', 'u2-center-mass-weighted-13': '9afaa17af5f397c4f668e7c37528c814332c8edab7a1e6494114ec5c0b95aad0', 'u2-center-mass-weighted-14': 'f481270e291eadc6c1ccd6c9cb9e345f865dfe0ba21597be5270f116503f5842', 'u2-center-mass-weighted-15': '5486c7c027471dcaac2b57133262658bdca8a325088f74e9837ad09e2a654b41', 'u2-center-mass-weighted-16': '4406ba69b08541ca866ce70ba506ebf98ab7bcc45da827cbd65360ce170e3a4c'}
