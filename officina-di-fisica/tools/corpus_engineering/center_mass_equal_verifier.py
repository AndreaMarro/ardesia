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
FAMILY='center-mass-equal'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    m=sp.Symbol('m',positive=True)
    x1,x2,X,shift=sp.symbols('x1 x2 X shift',real=True)
    # Equal positive mass moment divided by total mass.
    law=sp.cancel((m*x1+m*x2)/(2*m))
    inverse=sp.solve(sp.Eq(X,law),x1)[0]
    translated=sp.expand(law.subs({x1:x1-shift,x2:x2-shift}))
    if sp.expand(translated-law+shift)!=0 or inverse!=2*X-x2:raise ValueError('Equal CM translation/inverse proof failed')
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({x1:a*x1,x2:b*x2})/law)
    for opts,want in [([law,x1+x2,(x2-x1)/2,(x1+x2)/4,sp.Integer(0)],law),
      ([2*X-x2,X-x2,2*X+x2,(2*X-x2)/2,4*X-2*x2],inverse),
      ([(a*x1+b*x2)/(x1+x2),a*b,a/b,(x1+x2)/(a*x1+b*x2),(a*x1+b*x2)/(2*x1+2*x2)],ratio)]:
        if [i for i,v in enumerate(opts) if sp.cancel(v-want)==0]!=[0]:raise ValueError('Equal CM symbolic alternatives not unique as general laws')
    def position(p,q):return law.subs({x1:p,x2:q})
    A,B=position(2,2),position(4,4)
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,5),sp.Eq(gain*B+offset,9)],(gain,offset))
    C=(7-cal[offset])/cal[gain]
    p,q,r,s=sp.symbols('p q r s',real=True)
    if sp.expand((position(p,q)+position(r,s))/2-position((p+r)/2,(q+s)/2))!=0:raise ValueError('Linear mean identity failed')
    if sp.solve(sp.Eq(law.subs(x1,x2),2),x2)!=[2]:raise ValueError('Equal coordinates constraint failed')
    Q=SI.Quantity
    center=((Q(2,'kg')*Q(4,'m')+Q(2,'kg')*Q(8,'m'))/Q(4,'kg')).to('m')
    new_center=(center-Q(3,'m')).to('m')
    known_gain=(Q(6,'')/Q(2,'m')).to('1/m')
    inferred=(2*Q(3,'m')-Q(2,'m')).to('m')
    if (center.magnitude,new_center.magnitude,known_gain.magnitude,inferred.magnitude)!=(6,3,3,4):raise ValueError('Pint Fraction equal CM translation/gain dimensions failed')
    return [A,'m','X=(x₁+x₂)/2','Da 2 a 3 m',inverse.subs({X:2,x2:2}),position(4,8)-3,position(2,4)/A,4-A,'x₁=2X−x₂','(κ₁ x₁ + κ₂ x₂) / (x₁ + x₂)',B/A,(A+B)/2,inverse.subs({X:2*A,x2:4})/2,inverse.subs({X:12/(sp.Integer(6)/A),x2:4}),inverse.subs({X:C,x2:2}),sp.Integer(2)]

MANUAL=['X=(m·2+m·2)/(2m)=(2+2)/2=2m. Punti materiali coincidenti ammessi nel modello dichiarato.', 'Semisomma di coordinate con unità m, divisa per2 puro: dimensione L, unità m.', 'Masse positive uguali: (mx1+mx2)/(m+m)=(x1+x2)/2. Semidifferenza è metà separazione orientata, non coordinata.', 'A(2+2)/2=2m,B(4+2)/2=3m: muovere una massa di2m muove il centro di1m, riferimento fisso.', '2X=x1+x2→x1=2X−x2=4−2=2m; dominio scelto2X>x2.', 'Vecchio centro(4+8)/2=6m. Nuova origine3m a destra: coordinate1,5m; centro(1+5)/2=3m,anche6−3=3m. Separazione4m invariata.', 'X_A2m,X_B3m; rapporto3/2. Raddoppiare il solo x2 non raddoppia la somma con x1 fisso.', 'Corretto2m,proposto4m: scarto4−2=+2m. Separazione delle masse è invece0.', 'Moltiplicare per2 e sottrarre x2 dà x1=2X−x2. Positività nel dominio scelto richiede2X>x2; coordinate negative in altri riferimenti ammesse.', 'Rapporto di due semisomme cancella2: (κ1x1+κ2x2)/(x1+x2). Seκ1=κ2=κ si riduce aκ,nonκ².', 'Entrambe le coordinate da2a4m: centri2e4m,rapporto2; legge lineare,non prodotto.', 'Media(2+4)/2=3m. Media degli ingressi3,3m dà3m: uguaglianza esatta per linearità della semisomma.', 'Target X_B4m,x1B4m: x2B=2·4−4=4m; rapporto al precedente2m=2.', 'Ref X2m,S6→c3m⁻¹; S12→X4m; x1=2·4−4=4m. Lettura12 non è coordinata12m.', 'ΔS9−5=4,ΔX4−2=2m→c2m⁻¹;a1. S7→X3m;x1=2·3−2=4m. Alternative2,3,5,8m dannoS5,6,8,11.', 'x1=x2→X=(x2+x2)/2=x2=2m; unica coppiax1=x2=2m. Vincolo lineare,nessuna radice o ramo negativo.']
DISTRACTORS=['4m somma,1m doppia divisione. Coincidenza dei punti materiali non impone separazione artificiale.', 'kg,m/s,N,1 non sono lunghezza; unità non muta col segno della coordinata.', 'Somma raddoppia; semidifferenza è semiseparazione e manca origine; quarto dimezza,zero non legge generale. Presenti soltanto cinque alternative distinte come funzioni.', '4m segue solo primo corpo;2m ignora movimento;1m inverte;zero non media4e2.', 'X−x2=0 omette raddoppio e non ricostruisce X2; segno positivo richiesto esplicitamente.', '9m aggiunge origine anziché sottrarla;6 vecchio centro;5 secondo punto nuovo;2 semidistanza. Nessuno spostamento reale dei corpi.', '2 segue solo x2,2/3 inverte,1/2 diminuisce,1 ignora. Rapporto coordinate non invariante per cambio origine.', '−2 ordine inverso,4 proposta,1 doppia divisione,3 non differenza. Scarto≠separazione0.', 'X−x2 omette2;2X+x2 segno;mezzo ulteriore dimezza;4X−2x2 raddoppia. Inverse distinte in generale.', 'κ1κ2 errato prodotto,κ1/κ2 effetto inverso,reciproco scambia prove,denominatore2x1+2x2 conserva mezzo spurio. Subcaso fattori comuni discrimina.', '4 moltiplica due raddoppi invece sommarli;1/2 reciproco.4m coordinata B non rapporto.', '6 somma,3/2 doppia metà,2e4 singole prove. Non sostenuta falsa differenza fra medie per modello lineare.', 'x2 invariato2 dàX3,non4;4m uscita coordinata non rapporto4. Dominio positivo soddisfatto.', 'UsareS12come12m dàx1=20m,errore di unità e guadagno; x1=4 ricostruisce centro4 eS12.', '2,3,5,8m danno S5,6,8,11; solo4m dà7. Rapporti grezzi conservano offset.', '4m omette denominatore,1m divide ancora,−2 viola misura positiva,3 riproduceX3 e non2.']
ASSUMPTIONS=['Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Punti materiali coincidenti ammessi esplicitamente,senza vincolo di volume.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse uguali immobili negli stessi punti fisici: cambia soltanto origine di+3m,verso invariato. Coordinate nuove si ottengono sottraendo3m; nessuna traslazione fisica delle masse.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Nel dominio positivo scelto 2X>x2; non vincolo universale di positività delle coordinate.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo.', 'Masse puntiformi positive e costanti nella configurazione. Coordinate sullo stesso asse e origine; centro come media pesata, coordinate non moduli. Confronti tra prove non legge di massa variabile nel tempo. Vincolo x1=x2,unica equazione lineare;nessuna massa dipende dal tempo.']
UNITS={1: 'm', 2: 'm', 3: 'm', 4: 'm', 5: 'm', 6: 'm', 7: '', 8: 'm', 9: 'm', 10: '', 11: '', 12: 'm', 13: '', 14: 'm', 15: 'm', 16: 'm'}
NUMERIC_UNITS={1: 'm', 5: 'm', 6: 'm', 8: 'm', 11: '1', 12: 'm', 13: '1', 14: 'm', 16: 'm'}
SUFFIX={15: ' m'}

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

CANDIDATE_REF='bdc66e619c2abc330ccfa86d42fc0151e0112c13'
REVIEWED_PACKAGE_SHA256='8f276792cb91b7943bbf78b43f1a328380cce2b2e466f2ef7105443bfb4e28b4'
REVIEWED_BINDINGS_SHA256='ed41d135627535b832a5158abbf90b3e7795192f4153b1df47604954085baf89'
REVIEWED_CANDIDATES={'AR-u2-center-mass-equal-01': '543e3242ce499261c84cc89c32e30e7dc26d25b2ebe61bf86d36d38701821167', 'AR-u2-center-mass-equal-02': 'bffb4209f926658a9298dd48fe9394fd034ef0d421468544bd613421645f2174', 'AR-u2-center-mass-equal-03': 'f1070aaae85347f17a4dcc86d684dee17f10ff718313495dfecc407e57d6fdda', 'AR-u2-center-mass-equal-04': '41a0ea6e7b9ff4ab11988d04a06ca1b6cdacc94d26b7ee83c763aec79a9ed70c', 'AR-u2-center-mass-equal-05': 'e93d3bb7af56d579431325e8e21ff4f32a6a0972ebeaacb17d73ab3fdb7180c3', 'AR-u2-center-mass-equal-06': '21279c319c2756e0d3e6cb94f38cb125097d801fd6b5e23e667effbc0b2b282d', 'AR-u2-center-mass-equal-07': '867b91c6145d2c3b395cbc37185a680caa2bb5072ad514ab9a033e4f14cce0ec', 'AR-u2-center-mass-equal-08': '41eb6c61a0cdabfe0d9edbf5eea961de6e519f37304aeb52f9dfc7a572333c21', 'AR-u2-center-mass-equal-09': '6cb9b487f463fbd5a6d1528cf9d35cd7d9a892cc0ca8fe915c991ff6ac065950', 'AR-u2-center-mass-equal-10': '4f18c5782fc63c15a2129683832adea34a24830effb86d995a52ef128e670f75', 'AR-u2-center-mass-equal-11': '170d5f0891c50d2336b479e1bee1e7a867aa30650b678ed68b94476beb7c88ab', 'AR-u2-center-mass-equal-12': '39e47d3418b4eb2c53904742338e181ce2713744e95d424ec0c79f81e30ffb04', 'AR-u2-center-mass-equal-13': '40136fe96d05736e71d65718fe7ed4d6f0c98354fd5d928589233841e21b5640', 'AR-u2-center-mass-equal-14': '8607035ca9d6b4d03fee950f049b5d80d4dbd71c302869c8754fb7f58848c4f8', 'AR-u2-center-mass-equal-15': '4c2d90d3c4cae9cb88480c374bb261fe425d80be6152edfbce1fb3bcc6bd012a', 'AR-u2-center-mass-equal-16': 'f416cc423adf09b40eb3ed6a37aa0a32f7e668ab6f3562fdbad27d815adca986'}
READ_SOURCE_SHA256={'u2-center-mass-equal-01': '0db1bafabdfcc1d85d7034795418d3579ea3382869d8d43a7e31ca12b8a8cc16', 'u2-center-mass-equal-02': '8ac8168d5270f1b6db978395ff7b809352636f2f34a611b7329345c9fcb01773', 'u2-center-mass-equal-03': '541f1542824a77b8e9e1ef93ea437e9df859450e4eeb0280876bec0b752a183e', 'u2-center-mass-equal-04': '25b00924ae9643360340bf128dd22381b7fb23481c4d9b244fbead0246755a78', 'u2-center-mass-equal-05': 'cff8fe9807f27119bd36619e52e1ae0507a6ce6a657d0c6a9ad0689286ec9a2e', 'u2-center-mass-equal-06': '985908fc1291f6be390123649dd75f4789c70697eeec2e9d6020c25c9dc1e9e9', 'u2-center-mass-equal-07': '5352ab41e848a7cdb8d860803fefa4b59b4c89156dd692b28abbbe26b2294b48', 'u2-center-mass-equal-08': 'c0767745a9b05bfdf36e8f371cca458c8bb029947cfd468ce2d337cff0205d66', 'u2-center-mass-equal-09': '92e21b7698bd3302707973aadaf720c7a6ffa70d54f14f25f550a97a2dc76163', 'u2-center-mass-equal-10': '7ab05717a8bd776f51ede47afefcf07bb83c8ccf63699b22c79941132dc7716c', 'u2-center-mass-equal-11': 'b664a92b52f44b61a463d91af5a873873d419f61e0ac27628dde56bd23de8678', 'u2-center-mass-equal-12': 'b9803529514b190dfe53150a14683e6c958b9feacb2dd9a26048362ca31e7e98', 'u2-center-mass-equal-13': '36840536964005b4b3508b94eb31e0ee08b847610bc8f752f193001b88dadc13', 'u2-center-mass-equal-14': '725ea35e755654e2469a934f7842d9237ff8926fd88da178a75ab608b942e6d7', 'u2-center-mass-equal-15': '63d29287080dc3323d1fe697be7501688cbf2f7de77f584d7aff1f564ab5fabf', 'u2-center-mass-equal-16': '91b6e369490fbb394b6d9cdd408ce24cfd15d4b429076dc7d5c18702629f8d0d'}
