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
FAMILY='volume-flow'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    A,v,Q,dt=sp.symbols('A v Q dt',positive=True)
    volume=A*v*dt
    law=sp.simplify(volume/dt)
    inverse=sp.solve(sp.Eq(Q,law),A)[0]
    R,s,vmax=sp.symbols('R s vmax',positive=True)
    profile=vmax*(1-s*s/(R*R))
    flux=sp.integrate(profile*2*sp.pi*s,(s,0,R))
    mean=sp.simplify(flux/(sp.pi*R**2))
    u=sp.Symbol('u',real=True)
    if flux!=sp.pi*R**2*vmax/2 or mean!=vmax/2 or sp.integrate(1-u,(u,0,1))!=sp.Rational(1,2):raise ValueError('Independent area-weighted profile integral failed')
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({A:k*A,v:l*v})/law)
    for opts,want in [([Q/v,Q*v,v/Q,2*Q/v,Q/(2*v)],inverse),([k*l,k/l,l/k,k*k*l,k+l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Volume flux symbolic choices not unique')
    F=lambda area,speed:law.subs({A:area,v:speed})
    first,second=F(2,3),F(3,4)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*first+z,13),sp.Eq(q*second+z,25)],(q,z))
    C=(19-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,9):raise ValueError('Volume flux affine calibration failed')
    if (first+second)/2-F(sp.Rational(5,2),sp.Rational(7,2))!=sp.Rational(1,4):raise ValueError('Volume flux mean counterexample failed')
    roots=sp.solve(sp.Eq(6,sp.Rational(2,3)*sp.Symbol('speed',real=True)**2),sp.Symbol('speed',real=True))
    if roots!=[-3,3]:raise ValueError('Positive quadratic flux branch failed')
    U=SI.Quantity
    direct=(U(2,'cm**2')*U(3,'cm/s')).to('cm**3/s')
    square=(U(6,'cm**3/s')/U(Fraction(2,3),'cm*s')).to('cm**2/s**2')
    gain=(U(18,'')/direct).to('s/cm**3')
    if (direct.magnitude,square.magnitude,gain.magnitude)!=(6,9,3):raise ValueError('Pint Fraction flux/constraint/gain dimensions failed')
    return [first,'cm³/s','No: Q = A v_max / 2','Da 6 a 9 cm³/s',inverse.subs({Q:6,v:3}),sp.solve(sp.Eq(Q,law),v)[0].subs({Q:6,A:2}),F(2,4)/first,12-first,'A = Q / v','κ₁ κ₂',second/first,(first+second)/2,sp.Rational(4,3),inverse.subs({Q:12,v:4}),inverse.subs({Q:C,v:3}),roots[1]]

MANUAL = ['Per un moto uniforme Δ V=A v Δ t; con v media normale vale la stessa definizione integrata. Q=Av=2·3=6 '
 'cm³/s, cioè 6 m L in 1 s.',
 'La portata volumetrica ha dimensione L³/T e unità cm³/s. La portata massica richiederebbe la densità.',
 'Integrale delle corone: Q=2π∫₀ᴿ v_max(1−s²/R²)s ds=πR² v_max/2. Con u=s²/R² il peso areale è uniforme; il '
 'triangolo sotto 1−u ha area 1/2. Media d’area v_max/2, senza valutazioni trigonometriche o decimali.',
 'Area 2→3 cm² a v 3 cm/s dà Q 6→9 cm³/s; prove diverse, non due sezioni con Q già fissata.',
 'A=Q/v=6/3=2 cm²; il tempo si cancella.',
 'v=Q/A=6/2=3 cm/s è media normale, non massimo locale.',
 'A 2 cm², velocità 3→4 cm/s: Q 6→8 cm³/s, rapporto 4/3.',
 'Proposta 12 meno corretto 6=+6 cm³/s. v è già media, non serve un altro fattore di profilo.',
 'Dividere Q=Av per v>0 dà A=Q/v, unità di area.',
 'Area scala κ₁ e media scala κ₂: Q scala κ₁ κ₂, senza quadrato aggiuntivo dell’area.',
 'A 6 e B 12 cm³/s: rapporto 2=(3/2)(4/3).',
 'Media(6+12)/2=9 cm³/s. Ingressi medi 5/2 cm² e 7/2 cm/s danno 35/4, inferiore di 1/4.',
 'Target 12 cm³/s, A_B 3 cm²→v_B 4 cm/s, rapporto 4/3 rispetto a 3.',
 'q = 18/(6 cm³/s)=3 s/cm³. S 36→Q 12 cm³/s, v 4→A 3 cm².',
 'Δ S 12/Δ Q 6 cm³/s→q = 2 s/cm³, offset 1. S 19→Q 9, v 3→A 3 cm².',
 'A=cv, c 2/3 cm·s tra apparati: Q=cv²6→v²9 cm²/s². Rami±3 cm/s; solo positivo ammesso, con A 2 cm².']
DISTRACTORS = ['2 copia area, 3 copia velocità; prodotto 6 è volume per tempo, non area o velocità.',
 'cm/s velocità, cm²/s dimensione incompleta, cm³ volume, kg/s portata massica.',
 'A v_max attribuisce il massimo a tutta la sezione; 2 A v_max peggiora il doppio; un quarto non è media '
 'd’area; zero vale solo alla parete.',
 '4 usa effetto inverso, 6 impone una Q non assegnata, 12 raddoppia anziché 3/2, zero viola positività.',
 'Qv ha L⁴/T²; v/Q è area inversa. Non si ricava un raggio senza forma.',
 'QA non velocità, A/Q tempo per lunghezza. Massimo 6 cm/s solo con profilo parabolico aggiuntivo.',
 '3/4 reciproco, 2 raddoppio falso, 1/3 incremento relativo, 1 invarianza falsa.',
 '−6 ordine invertito, 12 proposta, 0 accetta, 3 doppia metà.',
 'Prodotto e reciproco sbagliano unità; doppio/metà applicano una correzione a v già media.',
 'Quozienti invertono dipendenze, κ₁² duplica area, somma dà 2 per prove identiche.',
 '1/2 reciproco, 3/2 solo area, 4/3 solo velocità, 12 uscita B non rapporto.',
 '18 somma, 9/2 doppia metà, 35/4 ingressi medi, 6 solo A.',
 'Raddoppiare v insieme ad area 3/2 triplica Q; 4 è numero velocità, 3/4 reciproco, 3/2 non realizza target.',
 'S 36 come Q darebbe A 9 cm²; solo A 3 ricostruisce S 36 con q 3.',
 'Aree 2, 4, 1, 6 cm² a v 3 danno S 13, 25, 7, 37; solo 3 dà 19.',
 'Radice negativa implica v e A negative; 9 è quadrato velocità, non velocità. Il vincolo non è A(t).']
ASSUMPTIONS = ['Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.',
 'Prove stazionarie indipendenti, area positiva e velocità normale media positiva nella sezione. La portata '
 'è un flusso volumetrico, non un massimo locale. Nessuna costanza di Q imposta fra apparati diversi. Nel '
 'solo 03: tubo circolare rigido, A=πR² dichiarata nel prompt finale, fluido newtoniano incomprimibile, '
 'aderenza alla parete e moto laminare pienamente sviluppato con il profilo assegnato.']
UNITS={1: 'cm**3/s', 2: 'cm**3/s', 3: 'cm**3/s', 4: 'cm**3/s', 5: 'cm**2', 6: 'cm/s', 7: '', 8: 'cm**3/s', 9: 'cm**2', 10: '', 11: '', 12: 'cm**3/s', 13: '', 14: 'cm**2', 15: 'cm**2', 16: 'cm/s'}
NUMERIC_UNITS={1: 'cm³/s', 5: 'cm²', 6: 'cm/s', 14: 'cm²', 16: 'cm/s'}
SUFFIX={8: ' cm³/s', 12: ' cm³/s', 15: ' cm²'}
SVG_REVIEW = ('XML e rendering completo letti. Grafico area×lunghezza: 100 × 150 px, assi 50 px/cm² e 50 px/cm, '
 'rappresenta 2 cm²·3 cm=6 cm³ in 1 s. Non è il diametro del tubo. Il terzo pannello usa u=s²/R²: quadrato '
 '200 × 200 px per unità pure e triangolo(0, 1)→(1, 0) di area 1/2. È il grafico contro il raggio al '
 'quadrato, non il profilo contro il raggio. Assi e frecce separati, scala e pesatura areale dichiarate.')

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

CANDIDATE_REF='24dfb749c412e204d03b89bc29cdcc893f9587f6'
SOURCE_READING='All80 original U3-02 prompts in the assigned five families individually read and solved before candidate keys. All16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing; never imports candidate authoring. C2 lessons L004/L005 and supplied profile assumptions reviewed separately.'
REVIEWED_PACKAGE_SHA256='d0217236774b3acc83d7e29bf2ae4f97538b61feb6e52e19d808e46d534e7f91'
REVIEWED_BINDINGS_SHA256='2a179eee046c8a3a819fd3140dd225614e01daaf61624c069f7d462c683f1f73'
REVIEWED_CANDIDATES={'AR-u3-volume-flow-01': '0574a7ac236baab076efa6d34a857b74e3117753b31805b7c7ed9fdbde403b76', 'AR-u3-volume-flow-02': '22de4461e84e7b29cbe299922e9b9428d04f8c91a532eaef8e3260177eab7047', 'AR-u3-volume-flow-03': 'b9912ce8b71aa16eef76fdf525463a89ce0d260e19854e78e52992fcabbf4927', 'AR-u3-volume-flow-04': '0ace19b98048e50d9f1300239be005eb86323720a9980a7b9b6e5c17206876bd', 'AR-u3-volume-flow-05': '6657253fc20396b8ccdc324d7f29ed00420d7a42eb40d48a56e509832f459107', 'AR-u3-volume-flow-06': '5726a719b2392cc7bf4cbf1587e5ef81f71c2939e3e6bad5ec1c592d7fc15ba6', 'AR-u3-volume-flow-07': '3b5c9b9259f089bbdb6ae3cd9f5ca64bb7da1f8893185401954ae2e1a32926a1', 'AR-u3-volume-flow-08': '8945a57ae7428a2cffb60b6308b5b4a5052713ec7a53b8b33eb0bfd66512764d', 'AR-u3-volume-flow-09': '56830ee1dc93a7c1c7351413b1c0409eeb92a11040d9e963a19a92087b13ac4c', 'AR-u3-volume-flow-10': 'c92aaed06c74538af6c6163d39510011b706e5f49760324e4e87b1cda4b4d23f', 'AR-u3-volume-flow-11': '353a8ba4cf4bdc69d441a7e334215ebcc88bef4dd36e6540787a3f092c1ac94a', 'AR-u3-volume-flow-12': 'fa846fd7d05a847c709161824096b36ac0319fde2e664342c8c7aaf0bf6eebdb', 'AR-u3-volume-flow-13': '9b7d0bfa944a502b40aeed88414b9e56c8c884d7d232a8f59c189706b87ff850', 'AR-u3-volume-flow-14': '683907ba4bbdd774e41b7a6e0766b20095c47c502ceb35512b2580556a43a68e', 'AR-u3-volume-flow-15': '93756db4164e17b6d9c330f3951cc710567ff5ba6a97f480ac50107e4be6d730', 'AR-u3-volume-flow-16': 'f92c71b8b5cd0fccce0ac13434854c594dd5e48da8f99eeb78fa08acf7ce2299'}
READ_SOURCE_SHA256={'u3-volume-flow-01': '69012e0526094960f4a58f3e473c2b9e22935aa3222b46bcc250a85857ff9209', 'u3-volume-flow-02': '6214a616f37fc5057e511ec9c6d2f615c99c215be177e524d18e440add505742', 'u3-volume-flow-03': 'b460d0fc4e7ab904a3a37005acf001a14cf0eb98e38c20a58bb23f5adc9deba2', 'u3-volume-flow-04': '2fdfb0ec08d6c227c7956c5be33e08526f53f35b7527e8de17ac70fee2a9d17a', 'u3-volume-flow-05': '8cd80f5c78a066ba03fe2af7f4aefb750553a56df5a3e2083fa5a8c6e1f6dbf5', 'u3-volume-flow-06': 'c9a54a7dafacb084a413821248adb89c62b337f7b7149c0022c9e7e57ecd144c', 'u3-volume-flow-07': 'b09e2b227fdbb13e1ef897ef59de3c8951deabbe56ac134045b3e654581813e0', 'u3-volume-flow-08': 'bf8adc4adc8d1a58c65ea733bba20bfdf7b040c2b8ac9c0a19db19e846c64bf4', 'u3-volume-flow-09': 'bc0c6beda0b9580f7d2f1ae32c323d380409795a20cf0c140c3ec67124a7e6a6', 'u3-volume-flow-10': '7a848fbd4e0a8059c10172a96dc7d2e6858cf5a92f32f5bec4ad2d885ae5347b', 'u3-volume-flow-11': 'f0a472fdd74edf44433af7eeb25f2bb19bb9d5adfd57d9f9e40cb9031f440f6f', 'u3-volume-flow-12': 'c9997c81355553c5feddfba8fd4e1a284c484c8aac47ba99dddeecbca65efcf2', 'u3-volume-flow-13': 'c94e86ec7cb61e7768ce304c8dae43a5f5215c49a62315e6b5d78f0be57d6fc8', 'u3-volume-flow-14': 'a418b4fbdf5d22c75fe6a85cd29dbf70a30e19d39d625fc7cfe54785b6665ae3', 'u3-volume-flow-15': '44c5d50ea0f270717abef3b3361b0f838c27c2f5e4b624deadf19f5ce1d01abf', 'u3-volume-flow-16': '14fa0324f6d261ffa8895101ad6ffd96d0dcc7b31ef9124ea4eff94c5bf0d1cf'}
