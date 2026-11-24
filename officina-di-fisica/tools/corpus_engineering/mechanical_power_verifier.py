"""Independent instantaneous mechanical-power review, not candidate author."""
from fractions import Fraction
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-04.json'
CANDIDATE_REF='13e5c50700d9bd0ee69b340202e69d411a6f9c82'
FAMILY='mechanical-power'
EXPECTED_IDS={f'AR-u2-{FAMILY}-{n:02}'for n in range(1,17)}


def oracle():
    F,v,P=sp.symbols('F v P',positive=True)
    t,u=sp.symbols('t u',real=True);x=sp.Function('x')(t);force=sp.Function('force')
    work=sp.Integral(force(u),(u,0,x))
    if sp.diff(work,t)!=force(x)*sp.diff(x,t):raise ValueError('Variable force work derivative chain failed')
    law=sp.Matrix([F,0]).dot(sp.Matrix([v,0]))
    if law!=F*v:raise ValueError('Instantaneous parallel vector scalar product failed')
    invF=sp.solve(sp.Eq(P,law),F)[0];invv=sp.solve(sp.Eq(P,law),v)[0]
    def power(force,speed):return law.subs({F:force,v:speed})
    first,second=power(2,2),power(4,4)
    a,b=sp.symbols('a b',positive=True);ratio=sp.cancel(law.subs({F:a*F,v:b*v})/law)
    for options,want,index in [([P*v,v/P,P/v,2*P/v,P/(2*v)],invF,2),([a/b,b/a,a*b,a+b,a*b**2],ratio,2)]:
        if [i for i,z in enumerate(options)if sp.cancel(z-want)==0]!=[index]:raise ValueError('Power symbolic alternatives not unique')
    gain,offset=sp.symbols('gain offset',real=True)
    cal=sp.solve([sp.Eq(gain*first+offset,9),sp.Eq(gain*second+offset,33)],(gain,offset));third=(17-cal[offset])/cal[gain]
    real_v=sp.Symbol('real_v',real=True)
    roots=sp.solve(sp.Eq(real_v**2,4),real_v)
    if roots!=[-2,2]or[r for r in roots if r>0]!=[2]:raise ValueError('Power positive-speed branch failed')
    Q=SI.Quantity
    measured=(Q(2,'N')*Q(2,'m/s')).to('W');gain_si=(Q(12,'')/measured).to('1/W')
    traction=(Q(5,'N')*(Q(4,'m')/Q(2,'s'))).to('W');work_si=(Q(5,'N')*Q(4,'m')).to('J')
    square=(Q(4,'W')/Q(1,'N*s/m')).to('m**2/s**2')
    if (measured.magnitude,gain_si.magnitude,traction.magnitude,work_si.magnitude,square.magnitude)!=(4,3,10,20,4):raise ValueError('Pint exact power/traction/gain/constraint failed')
    if power(3,3)!=9 or (first+second)/2!=10:raise ValueError('Power input-mean diagnostic failed')
    if (first+3*second)/4!=13:raise ValueError('Statistical mean versus time-weighted mean diagnostic failed')
    # Constant speed permits cancelling forces; their individual powers need not vanish.
    if sp.Matrix([5,0]).dot(sp.Matrix([2,0]))!=10 or sp.Matrix([-5,0]).dot(sp.Matrix([2,0]))!=-10:raise ValueError('Traction versus resultant power failed')
    return [first,'W',sp.Integer(10),'Da 4 a 8 W',invF.subs({P:4,v:2}),invv.subs({P:4,F:2}),power(2,4)/first,8-first,
      'F=P/v','κ₁ κ₂',second/first,(first+second)/2,(4*first/4)/2,(48/sp.Integer(3))/4,invF.subs({P:third,v:2}),sp.Integer(2)]
MANUAL=[
 'P=F·v, angolo0→Fv=2N·2m/s=4J/s=4W. Istantanea; nessunaenergia totale senza intervallo.',
 'N·m/s=J/s=W, dimensioneML²/T³. Wattunità non letteraWdel lavorousataaltrove.',
 'Moto rettilineo uniforme: v4m/2s=2m/s. Trazione5N→P10W; suo lavoro20J/2s=10W. Altraforza−5N darebbe−10W e potenzatotale0, nonpotenzatrazione0.',
 'v2m/s comune,F2→4N→P4→8W; condizioniistantanee assegnate, nonaffermazione divelocitàfuturainvariata.',
 'F=P/v=4W/(2m/s)=2N, divisione ammessa v>0.',
 'v=P/F=4W/2N=2m/s. Solo modulo; non direzionevettoriale completa.',
 'F2N,v2→4m/s→P4→8W,rapporto2. Nonenergiesudurate nonassegnate.',
 'Pcorretta2·2=4W;proposta8−4=+4W. Nessunadurataperenergiaassegnata.',
 'P=Fv→F=P/v, unità W/(m/s)=N;vpositivo.',
 'F_Bκ₁F_A,v_Bκ₂v_A→P_B/P_Aκ₁κ₂. Angoloconcordeuguale1,rapportoistantaneo.',
 'P_A4W,P_B16W→rapporto4,non16W.',
 'Media aritmeticaugualepeso(4+16)/2=10W;medieingressi3,3→9W. Nonmediatemporale: con durate1s e3s siavrebbe(4+48)/4=13W, dationonassegnati.',
 'TargetP16W,F_B4N→v_B4m/s;su2m/sinizialirapporto2.',
 'Pref4W,Sref12→c3W⁻¹;S48→P16W;v4m/s→F4N.',
 'ΔS33−9=24,ΔP16−4=12W→c2W⁻¹;d1;S17→P8W;v2m/s→F4N.',
 'F=av,a1N·s/m→P=av²=4W→v²4m²/s²;rami±2,solo+2moduloammesso,F2N. Vincolosceltoistantaneo, nonfrenaturadisegno negativo.'
]
DISTRACTORS=[
 '4W nonenergia4J;Psoloquesta forza,nonnecessariamentesommadipotenzeditutteleforze.',
 'J energia,N forza,m/s velocità,kg massa;soloWpotenza. Ilsecondo aldenominatore nonva perso.',
 '0potenzarisultanteaseKcostante,nontrazione;20JnonW;5/2omettedistanza,40moltiplicadurata invece didividerelavoro.',
 '16raddoppiaanchev;2dipendenzainversa;0richiedefattorenullooangoloretto,noncasoassegnato.',
 'Pvnonisola,4ripetenumeroPnonforza;controllo2N·2m/s=4W. v0vietatoperinversa.',
 '4ripeteP,1/2inverte;massaeaccelerazionenonnecessarieperquestacondizioneistantanea.',
 '1/2inverso,4quadratoenergia nonpotenza,1ignora cambiamento,−2richiedesegnoopposto nonconcorde.',
 '−4ordineinverso,8proposta,2altradivisione,5/3scartiarbitrari. Differenzaconservawatt.',
 'Pvdimensioneerrata,v/Pinversoforza;2extraometànonricostruisconoP. Nessunmezzocinetico.',
 'Quozientiinvertonoeffetto;somma2allidentità;κ₁κ₂²mettequadratononpresente. Nonintegralenergetico.',
 '2unsoloingresso,16potenzaB,8quadratoextravelocità,1/4inverso.',
 '20somma,5divideduevolte,9ingressimedi,11nonsemisomma. Tempi noninferibili dai valori di velocità.',
 'vinvariata→P8W;vquadrupla→P32W;4m/snuovi nonrapporto4.',
 'S48comeW→F12N;4N·4m/s=16W eS48controllano entrambi passaggi.',
 'F2,3,5,8N av2→S9,13,21,33;solo4dà17. Offsetvaeliminato primadellinversa.',
 '−2nonmoduloeFnegativo nelvincolo;4quadratononvalore;v1o3dannoP1o9W. Noncorrisponde aforzafrenante senza nuova convenzione.'
]
ASSUMPTIONS=['Riferimento inerziale; potenza istantanea della forza assegnata al suo punto di applicazione; F,v>0 paralleli e concordi. Nessuna uguaglianza imposta con potenza totale né energia suintervallo; i confronti sono fra condizioniistantanee.']*16
ASSUMPTIONS[2]+=' Moto rettilineo uniforme4m in2s, trazione5N costante; altri contributi possono compensarne lapotenza, Kcostante nonrende nullala singola potenza.'
ASSUMPTIONS[11]+=' Media statistica conugualepeso, nonmediatemporale senza durate.'
ASSUMPTIONS[15]+=' Coefficientea1N·s/m collega modulidelle condizioniistantanee selezionate, conramopositivo perF e v.'
UNITS={n:'W'for n in range(1,17)}
UNITS.update({5:'N',6:'m/s',7:'',9:'N',10:'',11:'',13:'',14:'N',15:'N',16:'m/s'})
NUMERIC_UNITS={1:'W',5:'N',6:'m/s',8:'W',11:'1',12:'W',13:'1',14:'N',16:'m/s'}
SUFFIX={3:' W',15:' N'}

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
         'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (9,10) else 'EXACT_MANUAL_CALCULATION',
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_independent_work_time_derivative_and_vector_power','SymPy_inverse_scaling_affine_and_branches','Pint_Fraction_exact_SI_dimensions','separate_per_ID_manual_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'All16original source rows and all16candidate records independently read; full solutions/options/feedback and scientific SVG frozen after separate physical derivation'}}

REVIEWED_PACKAGE_SHA256='03e032b3993b8889abaf4530fc1eff60d6c859be9d37b44c2c0c93363964c523'
REVIEWED_BINDINGS_SHA256='e325dc49d64fa06f774075b4b99c49e7a750d9eed7ee3a7996373507f448ee7d'
REVIEWED_CANDIDATES={'AR-u2-mechanical-power-01': '03863a1a6c14f5c2ca64fc2a84cfe9bca781ab3e76ccab7084c56cca6b058c24', 'AR-u2-mechanical-power-02': 'd70756506e0d70b7b7a72ac078761168e6df5921b077b04395ab59bf0fec307c', 'AR-u2-mechanical-power-03': '198650a795f6e25962d32dbb277a3ea984422f2bd7ada2a38617a403f423b02f', 'AR-u2-mechanical-power-04': '29ba8cb22354a3d6ab0d8027271d771b9534a722211b02a418bc9a160a6a1a55', 'AR-u2-mechanical-power-05': '3ecfdc6513c919acce3558c8a752cfa9240934e5be5ec5e2eb11f299caca5ff3', 'AR-u2-mechanical-power-06': '8a52c5d6f723ed3990b6b3b992174a23bbd566e5ae2cedbe1d39174a640b5fe3', 'AR-u2-mechanical-power-07': 'a1bcb88d7f490a1bbdb870774d9b89bfc52307c1debe082ce4162860b8fc60ef', 'AR-u2-mechanical-power-08': '8d28b6c6f6b23253c40b55bf132be9569a0688a8cc26bdebde9e952d129f449c', 'AR-u2-mechanical-power-09': '7805f0ed141e949671e12e02f5014c40c6f81e603eea58cf77892b77232584da', 'AR-u2-mechanical-power-10': '5b602af9642f9bca7230cbc1e5516bbe3e7c674301dfac29371cea89cd45f557', 'AR-u2-mechanical-power-11': '62ca1ff4c38f41f2f2482e197ea3a3bc7fb2b1b25d6da6658522de0273ac3c0e', 'AR-u2-mechanical-power-12': '3b1678a48eb63849a23c5c3e2d535fcf8f73d0511dd7cee5eb4bbc0d106da4fb', 'AR-u2-mechanical-power-13': '33ae538f753bd553591c8f1511f344e7ecceb565cfdeeebfe0745d59258edd83', 'AR-u2-mechanical-power-14': '2060f4d8b07eddd24a9dfe3b1615bac63251fd687e3cfdcb1084cfc364f1ad92', 'AR-u2-mechanical-power-15': '3d3a81a858c6d76dc8319af63dd5a990ed8f6870abc10ba70de31b81a52b5351', 'AR-u2-mechanical-power-16': '139f51a65649cd1a7d6e0d055d0fe469d7549601b8195232e34ea2f9a2cf063e'}
READ_SOURCE_SHA256={'u2-mechanical-power-01': 'ecbca5a00455c987e5188a64aaae09f295a8335866d8cdbd7b1972313ab2f80e', 'u2-mechanical-power-02': '493f62dbb2db773837402477122520ab8154d3f36cf6dee49d1214a5c12b1499', 'u2-mechanical-power-03': '8d6a7f36c80ff9060041da358aca6b48642d4fdcec7d7658b5a3376edbf7632f', 'u2-mechanical-power-04': 'bb47bba4e4712eeb66404de435438176bb05dce743bf60ea55bf18b67a97b98d', 'u2-mechanical-power-05': '1dd0df2335e8c715b181e1a3094e5d18169ea8467939845e561ec01432abc218', 'u2-mechanical-power-06': '2b62546f83ea4d6378199315469c4eeebc50f8bfc4ef25619127b00c55f7b31b', 'u2-mechanical-power-07': 'b0ef32b31d34c6bdec99b5005faf7c8522c55027030201ad4a3f70bf6f4a491b', 'u2-mechanical-power-08': '62b36be9ff3452fcb5ab7599fb7f5bd42be5ef28c9abf1830f5e883935daed48', 'u2-mechanical-power-09': '6c80ec120b1785677e10b8d39822569b5dfd09a7c52355d73ccdbc9271626f14', 'u2-mechanical-power-10': '85bc2f4c25990973d775c96a8d4019266c30abb72da2869cac7eac96419f68e9', 'u2-mechanical-power-11': '9cf245df83c14da48837bd56cd6b79f74f5d9c83f1920d79b02906d9548d90ba', 'u2-mechanical-power-12': '585c1d5040e85bed88891cc2cf6144fd4bad479465ab6dc2f9491255e44acf7e', 'u2-mechanical-power-13': 'dcd5063799d12eb5adf38e0faa68200cee900f8dbec7eb51fc50098890b9e5f7', 'u2-mechanical-power-14': '72db3750b0eb440783fa1a3afde59013b61cec907d8a312b4a3b1d9ee071d34a', 'u2-mechanical-power-15': '21677cd10cdc2f6c4bb2d78b1f924b60977927d28b48b975c1ee061e8b2efa70', 'u2-mechanical-power-16': 'a52235bb1064811c38537ab62a7be425e5cefd3728dd85ae751119cc127f70d4'}
