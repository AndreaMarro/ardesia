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
FAMILY='constriction-velocity'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    A1,A2,v1,v2,rho=sp.symbols('A1 A2 v1 v2 rho',positive=True)
    law=sp.solve(sp.Eq(rho*A1*v1,rho*A2*v2),v2)[0]
    inv=sp.solve(sp.Eq(v2,law),A1)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({A1:k*A1,A2:l*A2})/law)
    for opts,want in [([v1*A1/A2,v1*A2/A1,v1*A1*A2,2*v1*A1/A2,v1],law),([A2*v2/v1,A2*v1/v2,v2/v1,A2*v2,2*A2*v2/v1],inv),([k/l,k*l,l/k,k*k/l,k+l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Independent mass continuity symbolic choices not unique')
    F=lambda inlet,outlet:law.subs({v1:2,A1:inlet,A2:outlet})
    A,B=F(4,2),F(3,1)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,9),sp.Eq(q*B+z,13)],(q,z))
    C=(7-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,3):raise ValueError('Constricted flow affine calibration failed')
    if (A+B)/2-F(sp.Rational(7,2),sp.Rational(3,2))!=sp.Rational(1,3):raise ValueError('Continuity mean counterexample failed')
    if law.subs(A1,2*A2)!=2*v1:raise ValueError('Continuity area scale non-identifiability failed')
    if (4*2,3*2)!=(8,6):raise ValueError('Distinct apparatus rates must not be equated')
    U=SI.Quantity
    rate=(U(4,'cm**2')*U(2,'cm/s')).to('cm**3/s')
    speed=(rate/U(2,'cm**2')).to('cm/s')
    area=(U(1,'cm**2')*U(6,'cm/s')/U(2,'cm/s')).to('cm**2')
    gain=(U(12,'')/speed).to('s/cm')
    if (rate.magnitude,speed.magnitude,area.magnitude,gain.magnitude)!=(8,4,3,3):raise ValueError('Pint Fraction continuous flux/speed/inverse/gain failed')
    return [A,'cm/s','v₂ = v₁ A₁ / A₂','Da4 a3 cm/s',inv.subs({v1:2,A2:2,v2:4}),sp.solve(sp.Eq(v2,law),A2)[0].subs({A1:4,v1:2,v2:4}),F(4,1)/A,8-A,'A₁ = A₂ v₂ / v₁','κ₁ / κ₂',B/A,(A+B)/2,sp.Rational(1,2),inv.subs({A2:1,v2:6,v1:2}),inv.subs({A2:2,v2:C,v1:2}),'Infinite']

MANUAL = ['Continuità di massa senza accumuli: ρ A₁ v₁=ρ A₂ v₂. Densità comune si cancella: Q 4·2=8 cm³/s, v₂8/2=4 '
 'cm/s.',
 'Rapporto aree puro, velocitàv₂ in cm/s come v₁. Portata volumetrica distinta dalla velocità.',
 'Dal volume di controllo stazionario si ricava v₂=v₁ A₁/A₂. La viscosità non invalida la massa conservata; '
 'pressione non determinata da questa sola legge.',
 'Fra apparati A₁4→3 cm², v₁2 cm/s fissata: Q 8→6 cm³/s. A₂2 cm²→v₂4→3 cm/s. Q uguale entro il singolo tubo, '
 'non fra gli apparati.',
 'A₁=A₂ v₂/v₁=2·4/2=4 cm², area già assegnata come grandezza.',
 'Q 8 cm³/s, v₂4 cm/s→A₂2 cm².',
 'A₁4, v₁2 fissati mantengono Q 8. A₂2→1 cm² producev₂4→8 cm/s, rapporto 2.',
 'Proposta 8 meno corretta 4=+4 cm/s. La proposta a valle richiederebbe Q 16 contro ingresso 8.',
 'A₂ v₂=A₁ v₁→A₁=A₂ v₂/v₁, rapporto velocità puro. v₁ è 2 cm/s, non numero 2 privo di unità.',
 'Scalature delle aree: rapporto v₂ B/v₂ A=κ₁/κ₂ con v₁ comune. Le Q possono cambiare se cambia A₁.',
 'A: v₂4 e Q 8; B: v₂6 e Q 6. Rapporto velocità 3/2 pur con portata B minore.',
 'Media(4+6)/2=5 cm/s. Aree medie 7/2 e 3/2 cm² danno 14/3 cm/s, differenza 1/3.',
 'Target 6 cm/s, A₁ B 3 cm²→Q_B 6 cm³/s, A₂ B 1 cm²; rapporto a 2 cm² uguale 1/2.',
 'q = 12/(4 cm/s)=3 s/cm. S 18→v₂6 cm/s, A₂1→A₁3 cm².',
 'q = 2 s/cm, offset 1. S 7→v₂3 cm/s, A₂2→Q 6 cm³/s e A₁3 cm².',
 'A₁=2 A₂→v₂=2 v₁=4 cm/s per ogni A₂>0. Infinite coppie 4/2 e 8/4 cm²; Q 8 e 16 cm³/s diverse. Una misura di '
 'Q fisserebbe la scala.']
DISTRACTORS = ['v₂2 farebbe uscire 4 cm³/s contro 8 entranti; nessun accumulo disponibile.',
 'cm³/s portata, cm² area, s/cm velocità inversa, kg/s portata massica.',
 'Aree invertite rallentano erroneamente il tratto stretto; prodotto altera dimensioni; fattore 2 extra; v₁ '
 'uguale solo per aree uguali.',
 '16/3 inverte il fattore 3/4; 4 mantiene una Q non assegnata fra apparati; 6 è portata numerica, zero non '
 'positivo.',
 'A₂ v₁/v₂ darebbe 1 cm² insufficiente; nessun quadrato di aree già note.',
 '8 non area; 8 cm² a 4 cm/s richiederebbe 32 cm³/s.',
 '1/2 verso opposto, 4 confonde area con raggio, 8 velocità B non rapporto, 1 viola Q comune.',
 '−4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza ancora.',
 'Rapporto velocità invertito errato; v₂/v₁ solo è puro; A₂ v₂ portata; 2 extra non giustificato.',
 'Prodotto effetto diretto errato su A₂; reciproco scambia apparati; κ₁² duplica area; somma non 1 per '
 'identici.',
 '2/3 reciproco, 3/4 solo ingresso, 2 solo uscita, 6 velocità numerica B.',
 '10 somma, 5/2 doppia metà, 14/3 ingressi medi, 2 differenza.',
 '2 reciproco, 3/2 seguev₂ invece inversa area; 3/4 darebbev₂4; 1 darebbev₂3, non 6.',
 'S 18 come velocità darebbe A₁9 cm², triplicando Q; guadagno e offset vanno distinti.',
 'Con A₂2, aree d’ingresso 2, 4, 1, 6 cm² danno S 5, 9, 3, 13; solo 3 dà 7.',
 'Due esempi non significano solo due coppie; zero vietato. La scala richiede Q o una delle aree.']
ASSUMPTIONS = ['Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.',
 'Liquido omogeneo incomprimibile in tubo rigido, moto stazionario senza rami, perdite o accumuli. Aree '
 'positive e velocità normali medie nel medesimo verso del flusso; profilo locale non necessariamente '
 'uniforme. In ciascun apparato v₁=2 cm/s è mantenuta. Q è comune alle sezioni dello stesso tubo, ma può '
 'cambiare fra apparati con A₁ diversa. Non si inferisce il salto di pressione senza un modello energetico '
 'aggiuntivo.']
UNITS={1: 'cm/s', 2: 'cm/s', 3: 'cm/s', 4: 'cm/s', 5: 'cm**2', 6: 'cm**2', 7: '', 8: 'cm/s', 9: 'cm**2', 10: '', 11: '', 12: 'cm/s', 13: '', 14: 'cm**2', 15: 'cm**2', 16: ''}
NUMERIC_UNITS={1: 'cm/s', 5: 'cm²', 6: 'cm²', 14: 'cm²'}
SUFFIX={8: ' cm/s', 12: ' cm/s', 15: ' cm²'}
SVG_REVIEW = ('XML e rendering completo letti. Canale rettangolare con profondità fuori foglio 1 cm: altezze 4 e 2 cm, '
 '200 e 100 px a 50 px/cm, danno aree 4 e 2 cm². Frecce 80 e 160 px a 40 px/(cm/s), ognuna in path distinto. '
 'Grafici area×avanzamento: 80 × 80 e 40 × 160 px, assi 20 px/cm² e 40 px/cm, entrambi 6400 px² per 8 cm³ in '
 '1 s. Ultimo pannello apparati distinti: Q 8 e 6 cm³/s, barre 160 e 120 px a 20 px/(cm³/s). Non è applicata '
 'una falsa Q costante fra apparati.')

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

CANDIDATE_REF='07ea648f480e7027702d8340968d21d50884dac6'
SOURCE_READING='All80 original U3-02 prompts in the assigned five families individually read and solved before candidate keys. All16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing; never imports candidate authoring. C2 lessons L004/L005 and supplied profile assumptions reviewed separately.'
REVIEWED_PACKAGE_SHA256='4709b9b4a6b9ac5f3099603d4090a6b844ddd54162e698e65d35cfaa2a51983b'
REVIEWED_BINDINGS_SHA256='81c4550d001fa3230f9ed6684816071ed275d3adbae9619fd2d9caa30ddfc887'
REVIEWED_CANDIDATES={'AR-u3-constriction-velocity-01': '1849e45412ba86f31705d5d0060e05f1fc40edc9d2e4af0ab1f82149c4c22b96', 'AR-u3-constriction-velocity-02': '92a85b77095ece939aa81e05ec53064047152f82030cfb37d852064866e8bd26', 'AR-u3-constriction-velocity-03': '50bc96a0e9364231a677cbc6b8829d2c6060976e94b83b7728d302b40951d803', 'AR-u3-constriction-velocity-04': 'd3d24eaef265e03b3d531574bf5421c37f85a6b1e2b059467c1097d4d5d5e17b', 'AR-u3-constriction-velocity-05': 'a34d676da313b337a01378aa5a3a03655185bd9a7242ab23622cf801521ff929', 'AR-u3-constriction-velocity-06': 'ad4bc5d8732c202ee13abf5a009c1b6debdbf0bb4472b9f25cd8ed955c112f99', 'AR-u3-constriction-velocity-07': 'e20224ef7ba631696138128b240b0013f1ce7f13c27c7b356f21bc0c09c503aa', 'AR-u3-constriction-velocity-08': '9e99b4b633581ed258a2ccad6de25228e68a6c5d76405735f82aa7dc64ca8fc1', 'AR-u3-constriction-velocity-09': '035d4ad453859b7e6fdcd10013f84a2908e12976a5b1b6928cd521e048ac4934', 'AR-u3-constriction-velocity-10': '78472034ceec225fa6ea2ca6a8e941b7785be3d9792136b13a50b63c706edf54', 'AR-u3-constriction-velocity-11': 'f5c56f814797dcae9a2a3092ad048fb5ee2dba7cda8ec594d895b74649498f55', 'AR-u3-constriction-velocity-12': 'f4e024eea279088aa3eda738beb80ce48bfcba6949ff7893cc17cb30295a033e', 'AR-u3-constriction-velocity-13': '2b04962702d28534c984db07dbec1d3f71798192c09d09523be0acc5f90da85f', 'AR-u3-constriction-velocity-14': '039400252f21b0bf1a639c83576bc9e11c0146f7eff3a488f57458b7fa233251', 'AR-u3-constriction-velocity-15': 'fb955b7944a9d3b69b0d7942b8acd2ab87dcd2a8d4d43311ccaf1f7c02499051', 'AR-u3-constriction-velocity-16': '27906cfa388b32db35d077c7622653b23aecde624e6ac5c0da86cd05bd92ce2c'}
READ_SOURCE_SHA256={'u3-constriction-velocity-01': '15f718b25c7b7d6042d6e68d843987be2de58f0fa9e6f275bdc6d0b0072b38f6', 'u3-constriction-velocity-02': '617b135a4500d98cfda1117bc63d8bc2f755548bd185ea14a416c9c84430cf3c', 'u3-constriction-velocity-03': '1fa6957dc84aa304dbd43f71a87aac11d5c051f974d769cd63ca88241a57a62a', 'u3-constriction-velocity-04': '613add58e902de58f8f1b59d369f2c7ed47195e32634a2ee29c5bcf45bc68778', 'u3-constriction-velocity-05': 'bdf6a29c44f4fdd198a1ccf14d13c6a6c9a2979e29b30e9c6d0060c422d4af16', 'u3-constriction-velocity-06': '1acf2e539a2dc3aafc60234392b1274ca4d266c7d4b6738963fa1094b83ea5f4', 'u3-constriction-velocity-07': '04bb965a3cf4c70006c65e5433bfdfc3fc94b7c937dd77b948df25991e069fdc', 'u3-constriction-velocity-08': '8cf8473c994e3b00953a28d5c285ea849d21342a018e63ef52ee98667f0b257c', 'u3-constriction-velocity-09': 'd41bbece934d0b8c8b7c415a4488124d6267339506deb69a67e42f513b1c15a4', 'u3-constriction-velocity-10': '0bdebcd42d0fb9864bbf9f70788af718d3ba5638140d9fac4b87543e324abf1a', 'u3-constriction-velocity-11': 'e61e0a44f807d7b4198f7102701434ef03a3000b6812421ae9de083675293ac0', 'u3-constriction-velocity-12': '2ef4ab1c694f68079afe2c83c5f5b71f9be3c78aad71b4c932019aec0609547e', 'u3-constriction-velocity-13': '1932568ded81850f989e7cceaed9b9075dbb136811e09828a582810f7555bd53', 'u3-constriction-velocity-14': 'f520210adb153c30b2c475714227828579b141db743953ff466c7e7bbb725d46', 'u3-constriction-velocity-15': '013def642b7f6c90b3909210186d8f22a8b714d0774ba623e42e781b3d3452de', 'u3-constriction-velocity-16': 'a4b24fcc6d15320ee8d9ebb586d46e460dd305599f5a275c95ea418915d22758'}
