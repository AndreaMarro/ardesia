"""Independent per-ID review, distinct from candidate author. No authoring import."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
import re
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-06.json'
FAMILY='elastic-target-speed'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    m,M,u=sp.symbols('m M u',positive=True)
    w,V=sp.symbols('w V',real=True)
    momentum=sp.Eq(m*u,m*w+M*V)
    kinetic=sp.Eq(m*u**2,m*w**2+M*V**2)
    branches=sp.solve([momentum,kinetic],(w,V))
    effective=[(q,v) for q,v in branches if v!=0]
    if len(effective)!=1 or (u,0) not in branches:raise ValueError('Both collision branches must be represented')
    incident,law=effective[0]
    if sp.simplify(law-incident-u)!=0:raise ValueError('Effective branch must separate with reversed relative velocity')
    if sp.simplify(2*u-law-2*M*u/(m+M))!=0:raise ValueError('Target upper domain must be strict for finite positive masses')
    inverse_m=sp.solve(sp.Eq(V,law),m)[0]
    inverse_u=sp.solve(sp.Eq(V,law),u)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({m:a*m,u:b*u})/law)
    for opts,want,index in [([2*m*u/(m+M),m*u/(m+M),4*m*u/(m+M),2*m*u/M,-2*m*u/(m+M)],law,0),
       ([M*V/(2*u-V),M*V/(u-V),M*V/(2*u+V),M*V/(V-2*u),2*M*V/(2*u-V)],inverse_m,0),
       ([a*b*(m+M)/(a*m+M),a*b,b*(a*m+M)/(m+M),(a*m+M)/(a*b*(m+M)),2*a*b*(m+M)/(a*m+M)],ratio,0)]:
        if [i for i,x in enumerate(opts) if sp.cancel(x-want)==0]!=[index]:raise ValueError('Elastic symbolic alternatives not unique as general laws')
    def target(mass,speed):return law.subs({M:2,m:mass,u:speed})
    A,B=target(2,2),target(4,4)
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,5),sp.Eq(gain*B+offset,sp.Rational(35,3))],(gain,offset))
    C=(sp.Rational(19,3)-cal[offset])/cal[gain]
    x=sp.Symbol('x',real=True)
    roots=sp.solve(sp.Eq(2*x*x/(x+2),2),x)
    if roots!=[-1,2] or (A+B)/2-target(3,3)!=sp.Rational(1,15):raise ValueError('Elastic constrained roots/mean diagnostic failed')
    U=SI.Quantity
    target_si=(2*U(4,'kg')*U(2,'m/s')/(U(4,'kg')+U(2,'kg'))).to('m/s')
    incoming=U(Fraction(2,3),'m/s');outgoing=target_si
    p=(U(4,'kg')*incoming+U(2,'kg')*outgoing).to('kg*m/s')
    energy=(U(4,'kg')*incoming**2/2+U(2,'kg')*outgoing**2/2).to('J')
    inferred=(U(2,'kg')*U(Fraction(8,3),'m/s')/(2*U(2,'m/s')-U(Fraction(8,3),'m/s'))).to('kg')
    if (target_si.magnitude,p.magnitude,energy.magnitude,inferred.magnitude)!=(Fraction(8,3),8,8,4):raise ValueError('Pint Fraction elastic two-body p/K/inverse dimensions failed')
    return [A,'m/s','V=2mu/(m+M)','Da 2 a 8/3 m/s',inverse_m.subs({M:2,V:2,u:2}),inverse_u.subs({M:2,V:2,m:2}),target(2,4)/A,4-A,'m=MV/(2u−V)','κ₁ κ₂ S / S_B',B/A,(A+B)/2,inverse_u.subs({M:2,V:sp.Rational(8,3)*A,m:4})/2,inverse_m.subs({M:2,V:sp.Rational(16,3),u:4}),inverse_m.subs({M:2,V:C,u:2}),sp.Integer(2)]

MANUAL=['Sistemaentrambi,p/Kconservati. Masseuguali2kg,u2→w0,V2; p_i=p_f4kgm/s,K_i=K_f4J. Sono velocità componenti assegnate,non velocità comune.', '2m/(m+M) puro,moltiplicato u in m/s→V m/s;unità nonvaria conconvenzionedelsegno.', 'p:m(u−w)=MV;energia:m(u−w)(u+w)=MV². NelramoeffettivoV>0 dividere dàu+w=V; sostituzione→V2mu/(m+M),wV−u. Altro ramoV0,wu nontrasferisceimpulso e nonsepara dopo collisione.', 'm2→4kg,u2,M2→V2→8/3m/s,w_B2/3. p_B4·2/3+2·8/3=8,K_B8/9+64/9=8J. V>u lecito,maV<2u.', 'V(m+M)=2mu→m=MV/(2u−V),0<V<2u. DatiM2,V2,u2→m2kg. V2u limite di massa infinita,oltre massanegativa.', 'u=V(m+M)/(2m)=2m/s,con masseuguali w0 e tutto p/K trasferito albersaglio.', 'm=M2costanti,u2→4→V2→4,rapporto2;energiaquadrupla nonvelocitàquadrupla.', 'Vcorretto2,proposto4→scarto+2m/s. Bersaglio solo a4 avrebbe16J>4Jiniziali.', 'm=MV/(2u−V);M resta dimensionale,denominatorepositivo,unitàkg. Segno e coefficiente2 essenziali.', 'V_A2mu/S,V_B2κ1κ2mu/S_B→rapportoκ1κ2S/S_B,S=m+M,S_Bκ1m+M;M invariata.', 'V_A2m/s,V_B2·4·4/6=16/3m/s;rapporto8/3,puro.', 'Media(2+16/3)/2=11/3m/s. Ingressimedim3kg,u3→18/5m/s;differenza(55−54)/15=1/15m/s.', 'TargetV_B(8/3)·2=16/3,m_B4→u_B=(16/3)·6/8=4m/s,rapporto2.', 'q6/2=3s/m,S16→V16/3,u4→denominatore8−16/3=8/3,m=2·(16/3)/(8/3)=4kg.', 'ΔS35/3−5=20/3,ΔV16/3−2=10/3m/s→q2s/m,offset1;SC19/3→V8/3,u2→m4kg.', 'm=cu,c1kg s/m tra prove;u=x(1m/s)→2=2x²/(x+2),x²−x−2=(x−2)(x+1)=0. Radici2,−1;solo u2m/s,m2kgpositive.']
DISTRACTORS=['Anelastico darebbeVcomune1m/s eKpersa;qui4Jconservati e incidentefermo.', 'kgm/s quantitàdimoto,Jenergia,Nforza,mlunghezza;unica m/s.', 'Anelastico manca2;4mu/(m+M)doppio,2mu/Mdenominatoreparziale,negativoviolaverso. V0wuramo senza contatto effettivo.', 'Vnonraddoppiaperchédenominatorecresce;1inverso,2ignora,zeroimpossibile;V8/3<4limitepositivo.', 'u−Vdenominatorezero perquestidati e formulaanelastica;2u−Vpositivo;V≥2u nonmassafinitapositiva.', '4omette2,1conta2duevolte,0nonpinizialepositivo.', '4rapportodienergie,1/2inverso,1ignora,−2signoincompatibile.', '−2ordineinverso,4proposta,0accetta,1dimezza;energiaproposta impossibile.', 'u−Vformulaanelastica,piùsegnoerrato,V−2unegativa,2MVdoppiomassainversa.', 'Prodottoignoramassatotale;S_B/Sinvertel’effetto;reciprocoinverteuscite;2extra noncancella. κ1=1→κ2.', '3/8reciproco,4ignora somma masse,2solou,16/3valoreBnonrapporto.', '22/3somma,11/6doppiametà,18/5ingressimedi,8/3rapportononmedia.', 'uB2dàV8/3metàtarget;8/3fattoreuscitanonrapportoingresso.', 'S16comeV16>2u8inammissibile;4kgconw4/3,V16/3 riproducep16,K32J.', 'm2,3,5,8kg au2 dannoS5,29/5,47/7,37/5;solom4dà19/3. Rapportiletture noneliminanooffset.', '−1radiceesatta ma m/u negativi;−2nonradice;1o3nonriproduconodataV2. Massafissa rendequadraticononsimmetrico.']
ASSUMPTIONS=['Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso. Inversa0<V<2u necessaria per massafinitapositiva.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso. Inversa0<V<2u necessaria per massafinitapositiva.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso.', 'Urtofrontale elastico effettivo,classico,inriferimento inerziale. Sistema entrambi,massepositivecostanti,M2kg inizialmenteferma,impulso/lavoro esterni trascurabili,p eKtotaliconservati,+xnelversou>0. V>0componente bersaglio,walgebrica incidente;ramononinterazione escluso. m=(1kg s/m)u tra prove,non massa variabile durantelurto;dueradici alternative esaminate.']
UNITS={1: 'm/s', 2: 'm/s', 3: 'm/s', 4: 'm/s', 5: 'kg', 6: 'm/s', 7: '', 8: 'm/s', 9: 'kg', 10: '', 11: '', 12: 'm/s', 13: '', 14: 'kg', 15: 'kg', 16: 'm/s'}
NUMERIC_UNITS={1: 'm/s', 5: 'kg', 6: 'm/s', 13: '1', 14: 'kg', 16: 'm/s'}
SUFFIX={8: ' m/s', 12: ' m/s', 15: ' kg'}

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
                if len(raw)>80:raise ValueError('too long')
                raw=raw.replace('√2','sqrt(2)')
                raw=re.sub(r'(?<=\d)(?=sqrt\()', '*',raw)
                if not re.fullmatch(r'(?:[0-9\s+*/().-]|sqrt)+',raw):raise ValueError('unsupported exact literal')
                if sp.simplify(sp.sympify(raw,locals={'sqrt':sp.sqrt})-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
            except (ValueError,TypeError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'pedagogicalReview':'Riletti separatamente consegna, tutti i passaggi, hint, feedback e cinque alternative ove presenti; procedura manuale esatta e vincoli espliciti. '+MANUAL[n-1],
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_work_integral_or_collision_conservation','SymPy_inverse_scaling_affine_radicals_and_physical_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

CANDIDATE_REF='45e860fd4ce439fa9b7b3f0840d9f9dac13c982f'
REVIEWED_PACKAGE_SHA256='9b210596db11aa2a7f9e75fdf2b6bfd8594ed7811821843536a942eb966290d9'
REVIEWED_BINDINGS_SHA256='bb75a5473d93dc6f9829fe3b469f16d7aa61b6a4db51b38cf72d540e04be00f7'
REVIEWED_CANDIDATES={'AR-u2-elastic-target-speed-01': 'c860445894d442f036c472be80bfe7dbbc168492bf168dff1571eda548d65f0e', 'AR-u2-elastic-target-speed-02': '573ca98de6292ffa95ad6ed4bbb2d2b854ce3a525b5322f25b62d5f0de8efcbc', 'AR-u2-elastic-target-speed-03': 'b179120beae38a2b615f6cb08333fd659ef7c0aaf2ddf47996023ca6b25b4283', 'AR-u2-elastic-target-speed-04': 'bd0c41c37cf800128720cbd6db9484b99b9a2623f8a9832164d6849911d24ae6', 'AR-u2-elastic-target-speed-05': '6636daac59d847534d30f5d1a45b6613a5489441c3656dcc5cefa1d10b9145b2', 'AR-u2-elastic-target-speed-06': 'd7f6834473fce02275164da6e049cf316274e0e553c98b437d7bed83870d3f97', 'AR-u2-elastic-target-speed-07': '6d499964dfde25c9f608784c4245141d00f93bc7c65d91e119bc5c99c4acda37', 'AR-u2-elastic-target-speed-08': '111c8547e541aeddd4847a8bc0dce0f575a101d6a269e66e1b52ac16da73a47b', 'AR-u2-elastic-target-speed-09': '1743ff7dda53d32fbef226c2c477b42334793ba24be4ff9fdb91ed367a2f73d1', 'AR-u2-elastic-target-speed-10': '908355b7d662bb22c034f4ecf2f97094b6acf9e38a8169eb9d89396027189fc2', 'AR-u2-elastic-target-speed-11': '5bef527a09e1f57332a1fcb2796c0f510fc02e9f644c9fb559ed057ca4f6a5e7', 'AR-u2-elastic-target-speed-12': '88752bfcbf7d5a0bf83945343483dbafa1758b86cf9221588db4a4532fc53163', 'AR-u2-elastic-target-speed-13': '46c2d7d580de60e6dccdbffd6dc512d63211157df3af5b6dc3ae837ffe6b7a9d', 'AR-u2-elastic-target-speed-14': '1b73aa0b879963999e6fe1169f0af07652e8e2b7caea8780cd84afad2ac4f352', 'AR-u2-elastic-target-speed-15': '96d71372f874f92f4ad7ddde620a9008b82c75386af4ec39dae777179af7d082', 'AR-u2-elastic-target-speed-16': '1d2643768e0291f3be33979b691ebf52d653c95d7d57f24d135c94a2d6710451'}
READ_SOURCE_SHA256={'u2-elastic-target-speed-01': 'b6c1b37e1ac2c87cf7e78af3c0c068c61a818a5214215e7ff33dcfe25ecb38f1', 'u2-elastic-target-speed-02': 'f202cab30285eea13e0fd24572d367a970a131f49dccd5933b09a9fdb6f39a7b', 'u2-elastic-target-speed-03': '4ee211c62354c72d9b812adeae41daa7b2a795c846315145ddd0c18725bca548', 'u2-elastic-target-speed-04': 'b5c15534bcb95d8c841637990e51fc034398ef43da0e36e4c3ae3c12a0655aa6', 'u2-elastic-target-speed-05': '8b10ad79d0bf80a19641fc8bfb05ade2f4026884d82d107068a7755fcb42a177', 'u2-elastic-target-speed-06': 'b5494260cbf04ad6d655f884e998e69ebf064d96e0300582dbc4437c01129454', 'u2-elastic-target-speed-07': 'e1d811087393d32eef62411f88392a1ee3a98e0597aa46b5f3c49d8805ea99bd', 'u2-elastic-target-speed-08': '9129d558c01336efa3e39c0bde260a55ab659a023c22fa3817818413257cea63', 'u2-elastic-target-speed-09': '87454251beb57f4a1116f8fb3f2caed4ea653f80adc8eb00f45143c0e3500bc6', 'u2-elastic-target-speed-10': '825e9514232d0b539495f42de95134e1750a6895024c37de4eaf9ecbbdaca9ff', 'u2-elastic-target-speed-11': 'a14b1b7e24794926a896439b9ec4a7acb04399c2388efdc150cad5bd2e68412e', 'u2-elastic-target-speed-12': '9b718ae077b6314f2b6ce185d28a714c0ace4d31ff39aabaa9b57974a8826cfa', 'u2-elastic-target-speed-13': '59780102e13b325f5d9f16a6cf8a8c23fa43d17eca5107fe7c9e6b11d227ce99', 'u2-elastic-target-speed-14': '9c4b6670f188f64a6cf1d1c660152ee528e61b3a5e1a6b9f413b88844ec9f78a', 'u2-elastic-target-speed-15': '6c8a38fee4b96525d8bd2309f91769cb42f65ce5e294d1a2e3b8d8357e5fd6cc', 'u2-elastic-target-speed-16': 'bc913ed554ca199367c54ec1cde26569fe2a80b236351b8d2a0ea353051ea09e'}
