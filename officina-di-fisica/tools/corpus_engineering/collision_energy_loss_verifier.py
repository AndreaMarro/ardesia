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
FAMILY='collision-energy-loss'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}' for n in range(1,17)}

def oracle():
    m,u,V,E=sp.symbols('m u V E',positive=True)
    final=sp.solve(sp.Eq(m*u,2*m*V),V)[0]
    initial_K=m*u**2/2
    final_K=(2*m)*final**2/2
    law=sp.simplify(initial_K-final_K)
    if final!=u/2 or law!=m*u**2/4 or sp.simplify(law/initial_K)!=sp.Rational(1,2):raise ValueError('Sticking equal-mass p/K difference proof failed')
    inverse_m=sp.solve(sp.Eq(E,law),m)[0]
    inverse_u=sp.solve(sp.Eq(E,law),u)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.cancel(law.subs({m:a*m,u:b*u})/law)
    for opts,want,index in [([m*u**2/4,m*u**2/2,m*u**2/8,sp.Integer(0),m*u/4],law,0),
      ([4*E/u**2,2*E/u**2,E/(4*u**2),4*E/u,u**2/(4*E)],inverse_m,0),
      ([a*b*b,a*b,a*a*b,a/(b*b),b*b/a],ratio,0)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[index]:raise ValueError('Collision-loss symbolic alternatives not unique as general laws')
    def energy(mass,speed):return law.subs({m:mass,u:speed})
    A,B=energy(2,2),energy(4,4)
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*A+offset,5),sp.Eq(gain*B+offset,33)],(gain,offset))
    C=(9-cal[offset])/cal[gain]
    coefficient=sp.Symbol('coefficient',positive=True)
    constrained=law.subs(m,coefficient*u)
    if sp.diff(constrained,u)!=3*coefficient*u**2/4:raise ValueError('Positive cubic monotonicity proof failed')
    real_u=sp.Symbol('real_u',real=True)
    if sp.solve(sp.Eq(real_u**3/4,2),real_u)!=[2]:raise ValueError('Cubic has one real positive speed')
    U=SI.Quantity
    initial=(U(2,'kg')*U(2,'m/s')**2/2).to('J')
    remaining=(U(4,'kg')*U(1,'m/s')**2/2).to('J')
    lost=(initial-remaining).to('J')
    inferred=(4*U(4,'J')/U(2,'m/s')**2).to('kg')
    cubed=(4*U(2,'J')/U(1,'kg*s/m')).to('m**3/s**3')
    if (initial.magnitude,remaining.magnitude,lost.magnitude,inferred.magnitude,cubed.magnitude)!=(4,2,2,4,8):raise ValueError('Pint Fraction collision loss/inverse/cubic dimensions failed')
    if (A+B)/2-energy(3,3)!=sp.Rational(9,4):raise ValueError('Nonlinear energy mean diagnostic failed')
    return [A,'J','E=mu²/4','Da 2 a 4 J',inverse_m.subs({E:2,u:2}),inverse_u.subs({E:2,m:2}),energy(2,4)/A,4-A,'m=4E/u²','κ₁ κ₂²',B/A,(A+B)/2,inverse_u.subs({E:8*A,m:4})/2,inverse_m.subs({E:48/(sp.Integer(6)/A),u:4}),inverse_m.subs({E:C,u:2}),sp.Integer(2)]

MANUAL=['p_i=mu,p_f=2mV→V=u/2=1m/s. Ki=mu²/2=4J,Kf=(2m)V²/2=2J,E=Ki−Kf=2J>0. ΔK−2J,ΔUint+2J nello stesso sistema chiuso.', 'mu² ha kgm²/s²=J. Differenza Ki−Kf mantiene unitàenergia;Epositivo non potenza.', 'V=u/2 da p. Kf=mu²/4,Ki=mu²/2→E=mu²/4=Ki/2;non tutta energia cinetica iniziale scompare dal moto.', 'Entrambe lemasse uguali2→4kg,u2:Vcomune1inentrambi,maKi4→8J,Kf2→4J,E2→4J.', 'm=4E/u²=8J/(4m²/s²)=2kg ciascuno;massafinaletotale4kg distinta.', 'u²=4E/m=4m²/s²;rami±2m/s,solo+2modulo positivo;Vcomune1m/s.', 'm2fissa,u2→4→E2→8J;rapporto4,mentrefrazioneE/Ki resta1/2.', 'CorrettoE2J,proposto4J→scarto+2J. Kfresta2J,non interadiminuzione4.', 'E=mu²/4→m=4E/u²,u>0. Quantità richiesta massa diciascun corpo,non gruppo.', 'm_Bκ1m e u_Bκ2u→E_Bκ1κ2²E_A;ambeduecorpi mantengono uguale massa dentro ciascuna prova.', 'A2J,B4·16/4=16J,rapporto8=2·2².', 'Media(2+16)/2=9J;ingressi medi m3,u3→27/4J,differenza9/4J. Risultati di prove distinte.', 'TargetE_B8·2=16J,m_B4→u_B²4·16/4=16m²/s²,u_B4m/s;rapporto2. Massa dàfattore2,restantefattore4dalu².', 'q6/2=3J⁻¹,S48→E16J,u4→m4E/u²=64/16=4kg ciascuno.', 'q(33−5)/(16−2)=28/14=2J⁻¹,offset1. SC9→E4J,u2→m4kg. Massafinaletotale8kg.', 'm=cu,c1kg s/m tra prove→E=cu³/4. u³=4E/c=8m³/s³→u2m/s,m2kg;unicità per cubo strettamente crescente su u>0.']
DISTRACTORS=['4Jiniziale nonperdita;0confondemomento conK;energiatotaleinternapiùcineticaconservata.', 'Nforza,kgm/s quantitàdimoto,m/svelocità,Wpotenza;unicaJenergia.', 'mu²/2tuttacinetica,m u²/8metàulteriore,0noperdita,mu/4momentononenergia.', '8J KinizialeBnonE;1inverso,2invarianza confondeVuguale conenergiauguale,0incompatibileurtounito conu>0.', '2E/u²massa1kgfallisceE2;massacongiunta4kg nonquantitàrichiesta;quadratomancanteunitàerrata.', '4valoreu²nonu;−2modulonegativo;direzione inizialegiàconvenzionedichiarata.', '2lineareinvecequadrato,1/4reciproco,1frazionepersacostante nonvalorecostante,8EBnonrapporto.', '−2ordineinverso,4proposta,0accetta,1doppiametà;ΔKnegativa maEpositiva.', '2E/u²inversaKi nonE;E/(4u²)1/16massa,4E/uunitàerrata,reciprocoinversomassa.', 'κ1κ2dimenticau²,κ1²κ2assegnaquadratoamassa,divisioniinvertonoeffettidiretti.', '4solou,2solom,16valoreB,1/8reciproco.', '18somma,9/2doppiametà,27/4inputmedi,8metàsoloEB.', '4rapportou²,8rapportoE,uinvariata→E4Jnon16. Raddoppiouforniscefattore4necessario dopomassadoppia.', 'S48come48J→m12kg;massacongiunta8kg nonsingola4;calibrazionecorretta restituisce48.', 'm2,3,5,8kgau2→S5,7,11,17;solom4dà9. Offsetnoncancellatodarapportogrezzo.', '−2cuboemassanegativi,4→E16J,1→E1/4J,nonradicequadrata;massanonindipendente dalvincolo.']
ASSUMPTIONS=['Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E. La massa cambiafra prove perentrambi icorpi,mantengono uguaglianza.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E.', 'Sistema entrambi i corpi,masseuguali m>0 costanti,bersaglioinizialmentefermo,incidente+uconu>0,riferimentoinerziale,classico,urtocompletamenteanelastico. Impulso/lavoroesternitrascurati e nessuna energia esce;E=Ki−Kf>0,ΔK=−E,incrementointerno+E. m=(1kg s/m)u tra prove,cubo positivo,nonmassa chevaria duranteurtostesso.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'kg', 6: 'm/s', 7: '', 8: 'J', 9: 'kg', 10: '', 11: '', 12: 'J', 13: '', 14: 'kg', 15: 'kg', 16: 'm/s'}
NUMERIC_UNITS={1: 'J', 5: 'kg', 6: 'm/s', 11: '1', 13: '1', 14: 'kg', 16: 'm/s'}
SUFFIX={8: ' J', 12: ' J', 15: ' kg'}

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

CANDIDATE_REF='d2d21137991401944e957ff45e811f3733d20a25'
REVIEWED_PACKAGE_SHA256='d9c68570c590102f6d954a01f8974e8397e0013241c3d4a80d521697e4b80724'
REVIEWED_BINDINGS_SHA256='e5700ceaf268ba16b65b5f90b5e608b18d62f42ce6615afc54ab388db14584a5'
REVIEWED_CANDIDATES={'AR-u2-collision-energy-loss-01': '5e452018df64fb91ab1189ebb1499f3e95bd70a9a65e5be53a32216adef04dd3', 'AR-u2-collision-energy-loss-02': 'b33fc851ac1556952ab579b0c707b16eca6dd07f3f0e70219c5720b51ec6891a', 'AR-u2-collision-energy-loss-03': '0bbf8cac43209880994893a5f96681571b21e2bcba532e8c7fe57edf79cab581', 'AR-u2-collision-energy-loss-04': '74adc3537a0659c629180ed70e88a4722a317aebf5067f0af412adcaadf1e028', 'AR-u2-collision-energy-loss-05': 'bb11a09388d6431b3449def06b65c3a8a67d5ea5ba7cb18aad2093ad3bb1f304', 'AR-u2-collision-energy-loss-06': '367eaa636c49d6ad73d7364b655bdd96136216cc30a05dee3c5440da3cf56916', 'AR-u2-collision-energy-loss-07': 'd5de2a02f794c69e8cc437378993cef21bc3ae89cbdc8a418d818d7d1f6a9c68', 'AR-u2-collision-energy-loss-08': 'cce36be4901692eb777cdeac56708bb372cfbd9f5c7999441fdac2218fefddce', 'AR-u2-collision-energy-loss-09': '51d6e8260b7c0fca9bf83477675ff621a087844fed8529068ccdc38b7ae73f91', 'AR-u2-collision-energy-loss-10': '98dd157b3d71a0f0a38221f0aa1b926707c09ec845c0df28ab9d33d48a130c0e', 'AR-u2-collision-energy-loss-11': '97d18999264a03aef35d2b6725e350eae253d8aee0db0e1c7ccff17bd777a09f', 'AR-u2-collision-energy-loss-12': 'd4a1ee85c59aa7d047a8b4803f02482fc265521bc31c17c317be1b26ce008186', 'AR-u2-collision-energy-loss-13': '52962aa4a0dbf98086266a8fed4a5910597133b73c2602d3b1efbed5337c1d5e', 'AR-u2-collision-energy-loss-14': 'dba7e0f3963b8086b27829cffc6598dd9853cff0d2a47da6202205936e63bb32', 'AR-u2-collision-energy-loss-15': '74586630d00b60ef6d4f385211602dc6ea0f8b7b8fbaa87fdd47218edce30b21', 'AR-u2-collision-energy-loss-16': '35624d6ef4a4a691ab073d367cf16bf024ffc946a46c414443ca8887f80a469b'}
READ_SOURCE_SHA256={'u2-collision-energy-loss-01': 'e8bb4f0691f0c25f57e8638a0604a302939893efd1683b08490b5ac5ea8c1a1a', 'u2-collision-energy-loss-02': 'a3c420cd083c6c6ebdc38d298fccf71ee98c6128f2ba897dfbb25f509e248d92', 'u2-collision-energy-loss-03': '987f23a1674477da4bdb179668942f12a190ccc0fd876315b546a24de04f580e', 'u2-collision-energy-loss-04': '7eeb03e203c89396d897f1921a7cc1e2ffd734acbae7aa7ffbbfe6f1fdea74f0', 'u2-collision-energy-loss-05': 'e1428caf46206f9fa63804349be3b8b764a68ec58ef724401e0a83cf69c7e01e', 'u2-collision-energy-loss-06': '26d81a4c252847746ce726d861a7f33a2692cb1de8735100c6fe679d70fa3984', 'u2-collision-energy-loss-07': '266ef924ccd6e77b43fb7a20e341786cd30f013dd08e5a9b670ea2dea2cfe46e', 'u2-collision-energy-loss-08': '7c409ee8b3a4eef985105f85b27eb2392071188eb74cdbab314746e69a280e9d', 'u2-collision-energy-loss-09': '3d7f308e45686eabec85bbb2699a02310e374a918a71abe14ffd4e041e6df56c', 'u2-collision-energy-loss-10': 'ac8c3741eda0f050a8abc40d47765c8595f7119042b6abe928b87d45d07befcc', 'u2-collision-energy-loss-11': '66f3a09eb70450aacf72e2663ddbc39a1b3c3f436b3952ae901f4cbb656f4f4a', 'u2-collision-energy-loss-12': 'f7103ba2d008c53470aa46ce41bf6091d3f578cc621a57057f4c99054baabec3', 'u2-collision-energy-loss-13': 'fe73091bb3a470501c9a8cf6b60cb354cf6a071a2c42271ff5122dda9f727c13', 'u2-collision-energy-loss-14': '79dc7d620fb5120ca456b02510098446069588e4e67463382f8c1f02f140ab22', 'u2-collision-energy-loss-15': '0f259363c42f0bafede8c5530433ad8f6caae871a1dd9da270e84d290148c86a', 'u2-collision-energy-loss-16': 'c6d594e14bfffd20bcb47dcba50fd9b91499dcdbdad64d011a04432c6deffd0b'}
