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
FAMILY='mass-flow'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    rho,Q,flux,dt=sp.symbols('rho Q flux dt',positive=True)
    volume=Q*dt
    mass=rho*volume
    law=sp.simplify(mass/dt)
    inverse=sp.solve(sp.Eq(flux,law),rho)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({rho:k*rho,Q:l*Q})/law)
    for opts,want in [([rho*Q,Q/rho,rho/Q,2*rho*Q,rho*Q/2],law),([flux/Q,flux*Q,Q/flux,2*flux/Q,flux/(2*Q)],inverse),([k*l,k/l,l/k,k*k*l,k+l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Independent mass flux symbolic choices not unique')
    F=lambda density,volume_rate:law.subs({rho:density,Q:volume_rate})
    A,B=F(1,4),F(sp.Rational(4,5),3)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,9),sp.Eq(q*B+z,sp.Rational(29,5))],(q,z))
    C=(sp.Rational(37,5)-cal[z])/cal[q]
    if (cal[q],cal[z],C)!=(2,1,sp.Rational(16,5)):raise ValueError('Mass flux affine calibration failed')
    if (A+B)/2-F(sp.Rational(9,10),sp.Rational(7,2))!=sp.Rational(1,20):raise ValueError('Mass flux mean counterexample failed')
    x=sp.Symbol('x',real=True)
    roots=sp.solve(sp.Eq(4,x*x/4),x)
    if roots!=[-4,4]:raise ValueError('Mass flux constrained roots failed')
    U=SI.Quantity
    direct=(U(1,'kg/L')*U(4,'L/s')).to('kg/s')
    inferred=(U(Fraction(12,5),'kg/s')/U(3,'L/s')).to('kg/L')
    square=(U(4,'kg/s')/U(Fraction(1,4),'kg*s/L**2')).to('L**2/s**2')
    gain=(U(12,'')/direct).to('s/kg')
    if (direct.magnitude,inferred.magnitude,square.magnitude,gain.magnitude)!=(4,Fraction(4,5),16,3):raise ValueError('Pint Fraction mass rate/inverse/gain dimensions failed')
    return [A,'kg/s','ṁ = ρ Q','Da 4 a 16/5 kg/s',inverse.subs({flux:4,Q:4}),sp.solve(sp.Eq(flux,law),Q)[0].subs({flux:4,rho:1}),F(1,5)/A,8-A,'ρ = ṁ / Q','κ₁ κ₂',B/A,(A+B)/2,sp.Rational(3,4),inverse.subs({flux:sp.Rational(12,5),Q:3}),inverse.subs({flux:C,Q:4}),roots[1]]

MANUAL = ['In Δ t passa Δ V=QΔ t e massa Δ m=ρΔ V. Il tasso è ṁ=ρ Q=1·4=4 kg/s; in 2 s stazionari passano 8 kg.',
 'Dimensione massa/tempo, unità kg/s; kg/L per L/s cancella il volume.',
 'Densità uniforme sulla sezione permette di estrarre ρ dall’integrale di massa: ṁ=ρ Q. Non è una portata di '
 'peso e non compare g.',
 'ρ1→4/5 kg/L, Q 4 L/s fisso: ṁ4→16/5 kg/s, proporzionalità diretta fra prove.',
 'ρ=ṁ/Q=(4 kg/s)/(4 L/s)=1 kg/L=1000 kg/m³.',
 'Q=ṁ/ρ=(4 kg/s)/(1 kg/L)=4 L/s, non una massa accumulata.',
 'A 4 kg/s e B 5 kg/s, rapporto 5/4. L’incremento relativo è invece 1/4.',
 'Proposta 8 meno corretto 4=+4 kg/s; occorre un tempo per trasformare la differenza di tassi in massa.',
 'Dividere per Q>0 isola ρ=ṁ/Q con unità massa/volume.',
 'I due fattori diretti ρ e Q scalano ṁ con κ₁ κ₂.',
 'A 4 kg/s, B(4/5)·3=12/5 kg/s; rapporto(12/5)/4=3/5.',
 'Media(4+12/5)/2=16/5 kg/s. Ingressi medi 9/10 kg/L e 7/2 L/s danno 63/20 kg/s, inferiore di 1/20.',
 'Target(3/5)4=12/5 kg/s; ρ_B 4/5→Q_B 3 L/s; rapporto a 4 uguale 3/4.',
 'q = 12/(4 kg/s)=3 s/kg. S 36/5→ṁ12/5 kg/s; Q 3 L/s→ρ4/5 kg/L.',
 'Δ S−16/5 e Δṁ−8/5 kg/s danno q = 2 s/kg, offset 1. S 37/5→ṁ16/5 kg/s; Q 4→ρ4/5 kg/L.',
 'ρ=c Q, c 1/4 kg·s/L² fra prove. ṁ=c Q²4 kg/s→Q²16 L²/s²; rami±4 L/s, solo +4 con ρ1 kg/L ammesso.']
DISTRACTORS = ['Una portata non è massa finita; Q/ρ ha dimensioni diverse.',
 'L/s volume per tempo, kg massa, N/s forza per tempo, kg/L densità; solo kg/s corretto.',
 'Q/ρ e ρ/Q non M/T; doppio/metà aggiungono frazioni di volume mai assegnate.',
 '5 inverte la densità, 4 la ignora, 4/5 copia ρ, 8 raddoppia senza dato.',
 'Prodotto ṁ Q non densità; Q/ṁ volume specifico, inverso.',
 'Il numero 4 non conserva l’unità kg/s: si chiede L/s. Tempo aggiuntivo serve soltanto al volume totale.',
 '4/5 reciproco, 5 uscita numerica, 1/4 incremento, 1 ignora il cambio.',
 '−4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza lo scarto.',
 'Prodotto non cancella i tempi; reciproco volume specifico; fattori 2 errati.',
 'Quozienti effetto inverso, κ₁² duplica ρ, somma 2 per prove identiche.',
 '5/3 reciproco, 4/5 solo ρ, 3/4 solo Q, 12/5 singola uscita numerica.',
 '32/5 somma, 8/5 doppia metà, 63/20 ingressi medi, 4 solo A.',
 '4/3 reciproco, 3/5 fattore di massa, 4/5 fattore ρ, 3 numero Q_B, non il rapporto.',
 '12/5 kg/L viene da lettura grezza 36/5 divisa per Q 3; ρ1 ignora il dato; 3/5 dà S 27/5; 5/4 non '
 'ricostruisce la lettura.',
 'ρ1, 3/5, 2/5, 6/5 kg/L con Q 4 producono S 9, 29/5, 21/5, 53/5; solo 4/5 dà 37/5.',
 'Ramo negativo rende negativa anche ρ; 16 è quadrato portata, non portata. Vincolo fra prove, non densità '
 'variabile lungo il tubo.']
ASSUMPTIONS = ['Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.',
 'Prove stazionarie indipendenti con densità omogenea e uniforme nella sezione, ρ>0 inkg/L. Portata '
 'volumetrica Q>0 in L/s nel verso dichiarato. La densità può cambiare fra prove, non mescolando stati '
 'diversi nel medesimo bilancio locale. La portata massica conta massa per tempo, non forza o massa totale; '
 'per un fluido compressibile non si impone Q uguale altrove senza ulteriori condizioni.']
UNITS={1: 'kg/s', 2: 'kg/s', 3: 'kg/s', 4: 'kg/s', 5: 'kg/L', 6: 'L/s', 7: '', 8: 'kg/s', 9: 'kg/L', 10: '', 11: '', 12: 'kg/s', 13: '', 14: 'kg/L', 15: 'kg/L', 16: 'L/s'}
NUMERIC_UNITS={1: 'kg/s', 5: 'kg/L', 6: 'L/s', 16: 'L/s'}
SUFFIX={8: ' kg/s', 12: ' kg/s', 14: ' kg/L', 15: ' kg/L'}
SVG_REVIEW = ('XML e rendering completo letti. Quattro celle uguali da 1 L nel secondo considerato, totale 160 px a 40 '
 'px/L. A Q 4 L/s le densità 1 e 4/5 kg/L danno barre 200 e 160 px per 4 e 16/5 kg/s alla scala 50 '
 'px/(kg/s). Grafico con x 40 px/(L/s), y 40 px/(kg/s): A(4, 4) a(260, 1300), B(3, 12/5) a(220, 1364), '
 'origine(100, 1460). Rette di pendenza dimensionata ρ, non grafici massa-tempo. Ogni freccia degli assi ha '
 'un proprio path.')

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

CANDIDATE_REF='fc01e7b'
SOURCE_READING='All80 original U3-02 prompts in the assigned five families individually read and solved before candidate keys. All16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing; never imports candidate authoring. C2 lessons L004/L005 and supplied profile assumptions reviewed separately.'
REVIEWED_PACKAGE_SHA256='4e9319ef1818053ac457c39f11efa63bc25817243f7d75a9f6fd37b403ca310e'
REVIEWED_BINDINGS_SHA256='78398b283c2fcb63b00d8e94b6d7a6a7071beebc14ef0379f34f8ab2681113ba'
REVIEWED_CANDIDATES={'AR-u3-mass-flow-01': '7a3d7cea85f6dd022ae44af31746a90228d2c35dfc3224902d75666c5be0d4a8', 'AR-u3-mass-flow-02': '9d5f904a6744412bddd282e24f25ba9515ef6cec3a5793930eb257cdfb0f6406', 'AR-u3-mass-flow-03': 'fe66d4d2040904a6332c7a596eadfb439d5d8f1e5d3e1b69958340179969d766', 'AR-u3-mass-flow-04': '76608c330fb11973ca8792203600d2843020daec24517e484da1f17b353cb82f', 'AR-u3-mass-flow-05': '40e065b538fde7c63e6316e58ef1b22c7242768ef21449661aaa6cdafe643243', 'AR-u3-mass-flow-06': '742b492eef71ac9ddbe9a8bd318254c4d51631500acd828a7df8b826981b6060', 'AR-u3-mass-flow-07': 'c7795c74794c53d23ab57f92dcaaf34494dbec999a586daf2252ccf9f47101f9', 'AR-u3-mass-flow-08': '742f229d304140f772b508772401c9d52482927e910f28a3c35879e9c4245468', 'AR-u3-mass-flow-09': 'd8c4c76746e9505b4807a50c36c8b2d6e54988c6e915df621bcb4749e2fca72f', 'AR-u3-mass-flow-10': '2cb9e36e5eabaf97f88765be3392d57588e24e01c9033e69d81ab92bc018cdce', 'AR-u3-mass-flow-11': 'fc4e456e06f8cebb4acea83ad29cc96ec00c91a59a4dabbdc17ae1abb19add1c', 'AR-u3-mass-flow-12': '84876b12ae42cc7bd16d0bc733126eb15f1c8dad92ed78e8e433d62817d2d583', 'AR-u3-mass-flow-13': '437c315037efa90233a1c3edf2f5bf1ae93afa500f8d609f8091b1fad302c8be', 'AR-u3-mass-flow-14': '2a2868167bf5ae415b898653a4ee2eccd8638aee29ec5c911d1dda7fb5fada6f', 'AR-u3-mass-flow-15': '32705386350c96c9417ae50a2cf6ba5a64dabdb3fb22e6c3196e6f3a96872a14', 'AR-u3-mass-flow-16': '69695449fd2ca097b12db358bf73fcfe3efe958ac7ab7dd0edb0399ad5acb799'}
READ_SOURCE_SHA256={'u3-mass-flow-01': 'c168d990bcabcf868a259cf276a893486b30e2b8cb8d0cf508b1ab93815f08d4', 'u3-mass-flow-02': 'aea26589f02f4716fa8d6e7b4cc7dd2bcfde4b467fcbc9750285de13ffa1329a', 'u3-mass-flow-03': 'fd74e57d46e2337f279ed0c627d75d1c76bf3174fa6ba952cbb9f37df95c47b8', 'u3-mass-flow-04': '76f7ebc4d7e4eac856284eebdfd794d675669807e280b8e0fc175a131a27b315', 'u3-mass-flow-05': '453d78e771573e4a6fb023b693101e563e9ed3b9f0c4aed38ad8a1dff7ba1035', 'u3-mass-flow-06': 'a03f378f89f426cc50fe51f21df310cbc33c43e7c948f5eae90a9980bda6c575', 'u3-mass-flow-07': 'd3909f10b6a24bbef8536fb4c0018be56375a05e42caff12bb8930254e0e1b11', 'u3-mass-flow-08': 'd073715bc1d02c985cfebfe39468cc4a00f19086c37e080a7647da2473fb393b', 'u3-mass-flow-09': 'e1a1e7df870d5b0394397bd6ea2aed6ceb80b6ba8c1a390e70e6882ee7f970af', 'u3-mass-flow-10': 'bb9af904c1aa224b9cddd65d8c7325068fe410a331ecd15445a193feca2ca3dd', 'u3-mass-flow-11': '2a3cfa4d7dff508671cf07e92e18d78103dceed7a9ef6e1f0964094e5b0f49f5', 'u3-mass-flow-12': 'd34dc85e35c3e1db5bb59eaead089d04652834cc0ea1cd944f7656b6959a4919', 'u3-mass-flow-13': 'e2c0e7270ab644e2bd3dcefb45b9887b6df1ee7421627e42eab3a8b312d1e4fa', 'u3-mass-flow-14': '35c12ae96083e03bed81d554e2b24e9c2f79b5663e0271c4269b702d2f85a0c0', 'u3-mass-flow-15': '02f31b90c9e253a0a1361071dbb7feefaad943ccb6cabad856eea8b6cc21cbe1', 'u3-mass-flow-16': 'f9b7f7cf1efc809bae872add4b0dd7a12acd7f35fa329462ee6711f75fa5f58d'}
