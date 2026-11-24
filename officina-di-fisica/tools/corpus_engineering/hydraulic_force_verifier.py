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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-01.json'
FAMILY='hydraulic-force'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    fi,fo,ai,ao,p,si,so=sp.symbols('fi fo ai ao p si so',positive=True)
    # Two piston balances share gauge pressure only at equal level.
    solved=sp.solve([sp.Eq(fi,p*ai),sp.Eq(fo,p*ao)],(fo,p))
    law=solved[fo]
    inverse=sp.solve(sp.Eq(fo,law),fi)[0]
    out_area=sp.solve(sp.Eq(fo,law),ao)[0]
    stroke=sp.solve(sp.Eq(ai*si,ao*so),so)[0]
    local_work=sp.simplify(fi*si-law*stroke)
    if law!=fi*ao/ai or inverse!=fo*ai/ao or local_work!=0:raise ValueError('Independent Pascal and local volume derivation failed')
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.simplify(law.subs({fi:a*fi,ao:b*ao})/law)
    if ratio!=a*b or sp.simplify(stroke.subs(ao,10*ai)-si/10)!=0:raise ValueError('Force-area and local displacement ratios failed')
    for options,want in [([fo*ai/ao,fo*ao/ai,fo/ao,2*fo*ai/ao,fo*ai/(2*ao)],inverse),([a*b,a/b,b/a,a+b,a*b*b],ratio)]:
        if [i for i,v in enumerate(options) if sp.simplify(v-want)==0]!=[0]:raise ValueError('Pascal symbolic distractors not unique')
    f=lambda force,area:law.subs({fi:force,ao:area,ai:1})
    A,B=f(2,5),f(3,4)
    q,d=sp.symbols('q d',real=True)
    cal=sp.solve([sp.Eq(q*A+d,21),sp.Eq(q*B+d,25)],(q,d))
    C=(31-cal[d])/cal[q]
    if (cal[q],cal[d],C)!=(2,1,15):raise ValueError('Hydraulic load affine calibration failed')
    if f(sp.Rational(5,2),sp.Rational(9,2))-(A+B)/2!=sp.Rational(1,4):raise ValueError('Hydraulic force nonlinear mean counterexample failed')
    area_real=sp.Symbol('area_real',real=True)
    roots=sp.solve(sp.Eq(10,sp.Rational(2,5)*area_real**2),area_real)
    if roots!=[-5,5]:raise ValueError('Squared area inverse branches failed')
    U=SI.Quantity
    pressure=(U(2,'N')/U(1,'cm**2')).to('kPa')
    output=(pressure*U(5,'cm**2')).to('N')
    area_square=(U(10,'N')*U(1,'cm**2')/U(Fraction(2,5),'N/cm**2')).to('cm**4')
    gain=(U(30,'')/U(10,'N')).to('1/N')
    if (pressure.magnitude,output.magnitude,area_square.magnitude,gain.magnitude)!=(20,10,25,3):raise ValueError('Pint Fraction Pascal force and squared area units failed')
    # Finite vertical strokes require gravity of the moved liquid as well.
    # This intentionally asserts no finite work equality from continuity alone.
    return [A,'N','ds_o=ds_i/10','Da 10 a 15 N',inverse.subs({fo:10,ai:1,ao:5}),out_area.subs({ai:1,fo:10,fi:2}),f(2,4)/A,20-A,'F_i=F_o A_i/A_o','κ₁ κ₂',B/A,(A+B)/2,sp.Rational(4,5),inverse.subs({fo:12,ai:1,ao:4}),inverse.subs({fo:C,ai:1,ao:5}),roots[1]]

MANUAL=['Sovrapressionecomune p=Fi/Ai,pari quota e atmosfera comune. Fi2N/Ai1cm²20kPa;Fo=pAo=10N conAo5cm². Risultantepistonefermozero,nonFo.', 'Fo=Fi(Ao/Ai):rapportodiareepuro,unitàN. cm²si converteinm²confattore1/10000che si cancellafraaree.', 'All’istantedipariquota Fo/Fi=Ao/Ai=10. Continuitàinfinitesima Aidsi=Aodso→dso=dsi/10. Lavori localiFi dsi=Fo dso allo stessoistante,non uguaglianza di dueprodottiforza-costante sucorseverticalifinite.', 'Rapportoareefisso5:Fi2→3NproduceFo10→15N,statiequilibratidistinti.', 'Fi=FoAi/Ao=10·1/5=2N;areafisicaAi resta anche se numerouno.', 'Ao=AiFo/Fi=1cm²·10/2=5cm²>Ai;nonunraggio.', 'StessaFi2N,stessaAi1cm²→p20kPa. Ao5→4cm²produceFo10→8N,rapporto4/5.', 'Proposta20−corretta10=+10N.20Nsu5cm²darebbe40kPaincompatibilecon20kPaall’ingresso.', 'FoAi=FiAo→Fi=FoAi/Ao,rapportoareepuro;Fo/Aoèpressionenonforza.', 'Fi scalaκ1,Aoscalaκ2,Aifissa→rapportoprodottoκ1κ2;nonquadratoextra diun’area.', 'A2·5=10N,B3·4=12N,rapporto12/10=6/5.', '(10+12)/2=11N. Ingressimedi5/2N e9/2cm²danno45/4N,scarto1/4N,prodottocongiunto noncommutaconmedia.', 'Target(6/5)10=12N,FiB3N→AoB4cm²,rapporto4/5rispettoA5cm².', 'c30/(10N)=3N⁻¹,S36→Fo12N;Ai/Ao1/4→Fi3N.', 'ΔS4/ΔFo2N→c2N⁻¹,d1. SC31→Fo15N,Ao5cm²→Fi3N.', 'Fi=cAo,c2/5N/cm² tra stati→Fo=cAo²/Ai. Ao²FoAi/c25cm⁴→±5cm²;solo5area eFi2Npositive,maggioredell’ingresso.']
DISTRACTORS=['Fi=Fo nonseguepressioniuguali;20Nfattoredueextra;Foècaricoequilibrabile,nonrisultantesulfermo.', 'Papressione,cm²area,kgmassa,Jlavoro;Nforza.', 'dso10dsi,uguale,100dsi genererebberovolume,zerononricevequelloceduto. Non confonderecontinuitàlocalecorlavorofinito inquotevariabili.', '20raddoppioarbitrario,20/3effettoinverso,10ignoraFi,zeroconflittopressione.', '50Nmoltiplirapportoareeinverso;Fo/Ao da solo nondàFi.', '5cm²area non5cm,rapportoaree nonrapporto diraggi;formequalunque.', '5/4reciproco,2fattoreassente,1pressioneinvariante scambiata perforzainvariante,negativononmodulopositivo.', '−10ordineinvertito,20proposta,0accetta,5doppia metà.', 'RapportoAo/Aiinverso,soloFo/Ao unitàpressione,doppio/metànonbilanciano.', 'Quozientiinvertono dipendenze,sommadà2perstatidentici,κ2²duplicaareacomeraggio.', '5/6reciproco,3/2soloFi,4/5soloAo,12numeroForzaBnonrapporto.', '22somma,11/2doppia metà,45/4ingressimedi,12singolaB.', '5/4inverso,6/5targetforza,3/2fattoreFi,4areaincm²nonrapportoa5.', 'S36comeforzadàFi9N;solo3Nricostruisce36conguadagno3.', 'Fi6,3/2,4,2NconAo5produconoS61,16,41,21;solo3dà31.', '−5area ecariconegativi;25èquadratoarea,unitàcm⁴noncm²;nessunaradiceperraggio.']
ASSUMPTIONS=['Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. Spostamentiinfinitesimipositiviall’istantediquoteuguali;corsefinitepossonocambiarequoteeenergia potenzialedelliquido. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. ', 'Circuito pieno senza perdite,liquido incomprimibile,pistoni ideali senza massa/attrito. Statiequilibriolabinerziale,contattiallastessaquota,atmosferaesterna comune;Fi,Focarichinettiequilibratipositivi,Ai1cm²,Ao>Ai. Nessuna pressioneincrementataperaree,solo forza. VincoloFi=(2/5N/cm²)Ao fraequilibri,areacostanteentrociascunostato.']
UNITS={1: 'N', 2: 'N', 3: 'cm', 4: 'N', 5: 'N', 6: 'cm**2', 7: '', 8: 'N', 9: 'N', 10: '', 11: '', 12: 'N', 13: '', 14: 'N', 15: 'N', 16: 'cm**2'}
NUMERIC_UNITS={1: 'N', 5: 'N', 6: 'cm²', 14: 'N', 16: 'cm²'}
SUFFIX={8: ' N', 12: ' N', 15: ' N'}
SVG_REVIEW='XML e rendering completo letti: rettangoli40×40e200×40px a40px/cm rappresentano1e5cm². Contattiallastessaquota820,forzaingresso40pxper2N euscita200pxper10Na20px/N,versiingresso/erogazioneopposti. Circuitoschematico nonprofiloinscala dellearee giàdichiarate. Ultimopannelloaltrorapporto10,ds_i200px=10δ,ds_o20px=δ a20px/δ;ognifrecciapathseparato. Esplicitonessunalavorofinito dedottodacontinuità.'

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
          'verificationMode':'AI_CONCEPTUAL_WITH_SPECIFIC_PHYSICS_PROOF' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_hydrostatic_equilibrium_or_pressure_integral_or_volume_conservation','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='ac70cc8'
SOURCE_READING='All80original prompts individually read before candidate solutions, except accidental first07901 full-row display including key disclosed; that direct result independently rederived from equal-level hydrostatics. All16final candidate records, alternatives, feedback and SVG read before freezing; never imports authoring.'
REVIEWED_PACKAGE_SHA256='d4a97dcd0645d16ff0bb7809ae447c623f01543c26fca8cc4ed1ad8a71a6a1a7'
REVIEWED_BINDINGS_SHA256='02b7006ecc1bdf17cfa0d06ec8c999cd25b1cf8c708463c4ca3fd6fa7e579608'
REVIEWED_CANDIDATES={'AR-u3-hydraulic-force-01': 'bdd4a51afc557921274b6321eb9598eb9949cdc6d066887175352db257d9c59c', 'AR-u3-hydraulic-force-02': '33a42675eaa5a5276ee7fe52b7f09bc2f804153fee235f928fad79581adba4cc', 'AR-u3-hydraulic-force-03': '6ce3a1f23204a3599088fecbf75cbe66733f3c8bd3260c3930aff86475d83c51', 'AR-u3-hydraulic-force-04': '952c7b284a8b6787a8eb1d5bd4171c7481234e5725493e0138c80d1407b8feab', 'AR-u3-hydraulic-force-05': '23c16448631d9d0a169e653f1a9e17281305eb46b2c3468fd72270afac65b408', 'AR-u3-hydraulic-force-06': 'ebae64c5ed5eb88b913212489a0a1086ac9be341f9a4be0e8dbbf79b506a1a06', 'AR-u3-hydraulic-force-07': '12c307b371ae9e136c406f38f8db53e7ae5f65f2957fa36f11036371c09268b5', 'AR-u3-hydraulic-force-08': '9b5e746a4b22d7fceb8797ed898d9bae1df71b36a2eeb9161bfbf355b7bb7fee', 'AR-u3-hydraulic-force-09': '2eb2f54c0500bb4ad59208769b9b6baa8a4c6f4a48b240820670781f6056dca2', 'AR-u3-hydraulic-force-10': '491b1ac81144d1f2ce07b17508213e16de503da3fab998c4bcb2e821a11df717', 'AR-u3-hydraulic-force-11': '0b6e63e7a1e155e460ec8a3348e6e4a2481f9a7d55199d9ac2bd7b18307351c5', 'AR-u3-hydraulic-force-12': '756645972cbf55a4288936756a8ec289201fa9c2aeff4d738e11d7be1c27158f', 'AR-u3-hydraulic-force-13': 'b063fce22944f67f4044317e2bcc5dcb9e29fb64c9337cefea43064377af30b4', 'AR-u3-hydraulic-force-14': '9f11a3a037c3d03cbb2ee34e051480007eb8cee37fcc5da2a015a3e691d831ba', 'AR-u3-hydraulic-force-15': '71ac39166bff0edd56570f320ebc975e8b89862585d3facdf7ce3590c165eb89', 'AR-u3-hydraulic-force-16': 'e3e3e665848fcee52124eaa0ab71afca4d4efec31d7c21426367caa58f11b96f'}
READ_SOURCE_SHA256={'u3-hydraulic-force-01': '7d158c9a509f56cd70110e3bba31f7c0fb3d8d86c4a1bfd3278de41e4e842e50', 'u3-hydraulic-force-02': 'bda903fa8052ea1c6f3cb218bb055ebc78a6a1afd5bf361e837d8fbf23738823', 'u3-hydraulic-force-03': '856adfc023ba6fb6598b0efe4012092dd51997e9ad07293fb8c45baa0635c6b4', 'u3-hydraulic-force-04': '4455320ba1e3ca26a495f18512521fd62a46d6ac54f992492a0708d6ee4acdb5', 'u3-hydraulic-force-05': '1d3933ed27db9386cd71648d55ad065fae380a86d0872ec5299233277c576f9b', 'u3-hydraulic-force-06': '40b8e7c899ecaf53d0c092626714ebf7a04a357a1a072546cd3b4c6175e8d524', 'u3-hydraulic-force-07': '3fa0a1aebcc1442811374a02eb294cb676af3a65872e1e704732dd7e6f9dc337', 'u3-hydraulic-force-08': 'e4f65c16cc66331f3b5e3b774ba8dec3abe41d6bf43ddef31394dc7195de0098', 'u3-hydraulic-force-09': '868908ffa6c7aa8263237b2ffde918482768e4da2ae2a6dd4c5315fffe262c14', 'u3-hydraulic-force-10': 'e8e22410007460d0f356d62f513358e2f0770d0c99685050b15d713cac1c9ef0', 'u3-hydraulic-force-11': 'fd306f19b38cdb682eb1a3d2ec603139662e3c2fced4b9d1e2b9e12bb8eaf1a5', 'u3-hydraulic-force-12': 'def1e85a0a0e331df66fd03f333744749d9f599560c4a3d60820a096b1fcbc2b', 'u3-hydraulic-force-13': '5837350f69817bd932313b03059a908c9771823c40bc6987184d23676c630c3c', 'u3-hydraulic-force-14': '8005c388e12f9a9ffe7e60fce4bf970822cab220166e8115827762505d06f1a3', 'u3-hydraulic-force-15': 'fa5063aab2dbcd85bf59938d6e03517f1198719ddca407df63feb94a25c83a11', 'u3-hydraulic-force-16': '6861df989ac05e2e825151f8131d82b8b825ac7999b55e9dbff7c6fabb1c9bd1'}
