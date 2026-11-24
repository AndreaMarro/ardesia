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
FAMILY='vertical-wall-force'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    b,h,r,g,z,F=sp.symbols('b h r g z F',positive=True)
    # Sum local normal pressures, not bottom pressure over the entire wall.
    law=sp.integrate(r*g*z*b,(z,0,h))
    if sp.simplify(law-r*g*b*h**2/2)!=0:raise ValueError('Hydrostatic wall integral failed')
    first_moment=sp.integrate(z*r*g*z*b,(z,0,h))
    center=sp.simplify(first_moment/law)
    if center!=2*h/3 or center==h/2:raise ValueError('Pressure mean and force line of action distinction failed')
    invb=sp.solve(sp.Eq(F,law),b)[0]
    invh=sp.solve(sp.Eq(F,law),h)[0]
    a,c=sp.symbols('a c',positive=True)
    ratio=sp.simplify(law.subs({b:a*b,h:c*h})/law)
    if invb!=2*F/(r*g*h**2) or sp.simplify(invh**2-2*F/(r*g*b))!=0 or ratio!=a*c*c:raise ValueError('Wall inverse/scaling failed')
    for options,want in [([2*F/(r*g*h*h),F/(r*g*h*h),4*F/(r*g*h*h),2*F/(r*g*h),r*g*h*h/(2*F)],invb),([a*c*c,a*c,a*a*c,a/c**2,c**2/a],ratio)]:
        if [i for i,v in enumerate(options) if sp.simplify(v-want)==0]!=[0]:raise ValueError('Wall symbolic distractors not unique')
    f=lambda width,depth:law.subs({r:1000,g:10,b:width,h:depth})/1000
    A,B=f(2,2),f(1,4)
    q,d=sp.symbols('q d',real=True)
    cal=sp.solve([sp.Eq(q*A+d,81),sp.Eq(q*B+d,161)],(q,d))
    C=(41-cal[d])/cal[q]
    if (cal[q],cal[d],C)!=(2,1,20):raise ValueError('Wall force affine calibration failed')
    if f(sp.Rational(3,2),3)-(A+B)/2!=sp.Rational(15,2):raise ValueError('Wall nonlinear mean counterexample failed')
    constrained=sp.solve(sp.Eq(law.subs({r:1000,g:10,b:h}),40000),h)
    if constrained!=[2]:raise ValueError('Positive cubic wall branch failed')
    U=SI.Quantity
    mean=(U(1000,'kg/m**3')*U(10,'m/s**2')*U(2,'m')/2).to('kPa')
    total=(mean*U(2,'m')*U(2,'m')).to('kN')
    width=(2*U(40,'kN')/(U(1000,'kg/m**3')*U(10,'m/s**2')*U(2,'m')**2)).to('m')
    height_squared=(2*U(40,'kN')/(U(1000,'kg/m**3')*U(10,'m/s**2')*U(2,'m'))).to('m**2')
    cube=(2*U(40,'kN')/(U(1000,'kg/m**3')*U(10,'m/s**2'))).to('m**3')
    if (mean.magnitude,total.magnitude,width.magnitude,height_squared.magnitude,cube.magnitude)!=(10,40,2,4,8):raise ValueError('Pint Fraction integral/inverse powers failed')
    return [A,'kN','La pressione varia con la profondità e quella sul fondo è il massimo.','Da 40 a 20 kN',invb.subs({F:40000,r:1000,g:10,h:2}),invh.subs({F:40000,r:1000,g:10,b:2}),f(2,4)/A,80-A,'b=2F/(ρgh²)','κ₁ κ₂²',B/A,(A+B)/2,sp.Integer(2),invb.subs({F:80000,r:1000,g:10,h:4}),invb.subs({F:C*1000,r:1000,g:10,h:2}),constrained[0]]

MANUAL=['z verso il basso,p_rel=ρgz. Integrale0→h p_rel b dz=ρgbh²/2. b2,h2→media10kPa,area4m²,F40kN. Pressione fondo20kPa non uniforme.', 'Pa·m²=N;1kN1000N. Non è un calcolo numerico autonomo: riconoscimento della forza,distinta da pressione e lavoro.', 'Ogni striscia senteρgz,profilo triangolare. Media(0+ρgh)/2,integrale metà delrettangolomassimo. Normali orizzontali. Puntoapplicazione dalla prima area2h/3nonprofonditàdellapressionemediah/2;figura nonloassegna.', 'h2m invariata→media10kPa. Larghezza2→1m,area4→2m²,F40→20kN.', 'b=2F/(ρgh²)=80000/(1000·10·4)=2m;coefficiente20kN/m.', 'h²=2F/(ρgb)=80000/20000=4m²,radici±2m;solo+2profonditàpositiva.', 'h2→4:media10→20kPa earea4→8m²,F40→160kN,rapporto4.', '80−40=+40kN. Origineproposta:profilorettangolare massimoinvece triangolare.', '2F=ρgbh²,divisione perρgh²positivo→b2F/(ρgh²),unitàlunghezza.', 'bscalaκ1,hscalaκ2→Fscalaκ1κ2²;altezza agisce suarea epressmedia.', 'A40kN,B5·1·16=80kN. Rapporto2=(1/2)·2²;areeentrambe4m² ma pressionimediadifferenti.', '(40+80)/2=60kN. Ingressimedi b3/2m,h3m→135/2kN;diff15/2kN,non60.', 'Target80kN,b1m→h²16m²,h4mpositivo;rapportoa2m=2.', 'c120/(40kN)=3kN⁻¹,S240→80kN;h4m,coeff80kN/m→b1m.', 'ΔS80/ΔF40kN→c2kN⁻¹,d1. SC41→FC20kN;h2m→b1m.', 'b=h tra configurazioni→F=ρgh³/2;h³2·40000/10000=8m³→h2m,b2m. Cubica strettamentecrescente,unaradicereale ammessa.']
DISTRACTORS=['80kNmassimosuarea,nonmedia;atmosferacomunesi cancella,forzeorizzontali.', 'Pa pressione,kgmassa,mlunghezza,Jlavoro;solo kNforza.', 'Forzeverticali,noforza,pressionenettanulla,atmosferaraddoppiata:tuttifalsi nelbilanciointegrato. Pressionefondomassimo,nonmedia.', '10doppio dimezzamento,80inverteeffetto,40ignoralarghezza,0violaareapositiva.', 'F/pressione darebbearea,nonlarghezza;senza1/2b1mnonriproduce40kN.', '4m²èquadrato,−2mfuoridominio;conversione40kN40000Nnecessaria.', '2contaunosolo deidueeffetti,1/4reciproco,8fattoreextra,1ignora.', '−40ordineinvertito,80proposta,0accetta,20dimezzaerrore.', 'Metà/doppiodelcoefnonisolano b;h1produrrebbearea,reciprocoinversalunghezza.', 'κ1κ2ignoraunh,κ1²κ2quadratovariabilesbagliata;quozientieffettoinverso.', '1soloareeuguali;4soloaltezza,1/2sololarghezza;2ricostruisceentrambe.', '120somma,30doppia metà,135/2ingressimedi,40singolaA.', '4numeroaltezzaametri,nonrapporto;h2su b1darebbe20non80.', 'S240comeforzadarebbeb3m; b1media20kPasuarea4m²produce80kN.', 'b2dàS81,b1/2dà21,zeronegativifuoridominio;solo1dà41.', '−2geometrianegativanonradicecubicapositiva;h1/h4danno5/320kN. 8m³nonm².']
ASSUMPTIONS=['Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. ', 'Parete rettangolare verticalelarghezzacostante,b,h>0,bordobagnatosuperiorealpelo libero,acqua1000kg/m³ inquiete,g10uniforme. Stessaatmosfera sulla superficie elatoesternoasciutto,cancellata per forzanetta. Pressionerelativalocaleρgz,zversoilbasso;normaliorizzontali. Vincolob=hfraassetti,larghezzaealtezzacostanti inciascunostato.']
UNITS={1: 'kN', 2: 'kN', 3: 'kN', 4: 'kN', 5: 'm', 6: 'm', 7: '', 8: 'kN', 9: 'm', 10: '', 11: '', 12: 'kN', 13: '', 14: 'm', 15: 'm', 16: 'm'}
NUMERIC_UNITS={1: 'kN', 5: 'm', 6: 'm', 11: '1', 13: '1', 14: 'm', 16: 'm'}
SUFFIX={8: ' kN', 12: ' kN', 15: ' m'}
SVG_REVIEW='XML e rendering completo letti: fronte200×200px a100px/m,area4m². Profiloprofondità200px per2m,segmenti20/40/60/80px per5/10/15/20kPaa4px/kPa,ogni freccia inpathseparato. Forzatotale40kNproiettata separatamentelunga200pxa5px/kN,nessunpuntoapplicazioneassegnatoallamezzaprofondità.'

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

CANDIDATE_REF='995d230'
SOURCE_READING='All80original prompts individually read before candidate solutions, except accidental first07901 full-row display including key disclosed; that direct result independently rederived from equal-level hydrostatics. All16final candidate records, alternatives, feedback and SVG read before freezing; never imports authoring.'
REVIEWED_PACKAGE_SHA256='00724e5f7e5d4b1642b07cfff207472f0bec27d2d78b94634428c24c3b61d95f'
REVIEWED_BINDINGS_SHA256='12f2bafcf738e139775d0c6adc0fef7e47b516ce65373de99b01217182629d41'
REVIEWED_CANDIDATES={'AR-u3-vertical-wall-force-01': '882b591437689036e5bcb692b9ad51a27870931ab177b5666e339c1e8fde7b0c', 'AR-u3-vertical-wall-force-02': '1bed533acca7434e0d3bcdeb0f6d5cc9b19763ad01244656b27702a79a03f07b', 'AR-u3-vertical-wall-force-03': 'e767112e73fab9a3bc0ce06871e475e17738d21da114466b692f3f876bc59b3e', 'AR-u3-vertical-wall-force-04': 'b74e33cd435779daa65f8c2001ce3414453d80d54beee92a14f0b1ba6f5ce561', 'AR-u3-vertical-wall-force-05': 'abf2984cbd1a2558521aff03ea2b4d6c8924d1841434c35906ad0b5d137efcf2', 'AR-u3-vertical-wall-force-06': '20b51eb7a47fa7fab69b5ba3cfce5d369580c20d9a0cff493e370f4ee0124413', 'AR-u3-vertical-wall-force-07': '8a65b100314e222ca79946fddeb503245681bba7c9299ab634ece380e33dd388', 'AR-u3-vertical-wall-force-08': '9a2310448a1187cc8f7f53d4aafc284afff284cbdf050323ccb0a545cafe12db', 'AR-u3-vertical-wall-force-09': '36675eeb3e84d41a60392415bfcc474dcf3de9d8c7f3cf7b481f9f4a0c946213', 'AR-u3-vertical-wall-force-10': '3e5f2c6a98ec8c3be881d65f4c51060b532365113b0f480a9bb198aab0904bf2', 'AR-u3-vertical-wall-force-11': '1f22caf80672cbbfc051e7bf8406f94e80e476b43bad5991d9abe2f444a0a1a5', 'AR-u3-vertical-wall-force-12': '61d4c2c261dbea85166c10be3347e91510df1f2dc4dd68dbdaeab8c7a4cc328a', 'AR-u3-vertical-wall-force-13': '12097df6eda317e99bb06c2d88ae4d7a9723c7eee6689d83845172f03f677107', 'AR-u3-vertical-wall-force-14': '82cb5561d8dc8d12e95567ada3fdabddb5da85d0df2710b640d16bc28b1b6f8a', 'AR-u3-vertical-wall-force-15': '811ae09400fb685afbecec0572b7d0a144aa116c89a6c9ab57d08ee638505411', 'AR-u3-vertical-wall-force-16': 'a3bfcbfb7472b62d1a1d3aa1edde3c358c3f5d3f60c5ec1b0b90808a2b457c91'}
READ_SOURCE_SHA256={'u3-vertical-wall-force-01': '54f45e05b6265677a97de56c1b873a261bef1928c9f96aa0fa038c20e02e84db', 'u3-vertical-wall-force-02': '88c97f32edf23254ce20e6130e6260c741d8b8f80746b5dc85f9f5d86ada8076', 'u3-vertical-wall-force-03': '0798189a4ea865cf260891306cbec4778d007b891be0446002e4c328241c7c43', 'u3-vertical-wall-force-04': 'ebd04587acafd34c126a2335b3bdebf563fd55895d24d4093f952a9ecbae723e', 'u3-vertical-wall-force-05': '5b6f6b65128764903ee47af334991fe743e5c3da59d5f50b0d8e8ce575842059', 'u3-vertical-wall-force-06': '8662c0a9eae8b5c0baebeed18298e5791b51483fe34fb77b493fcaa78fde5ba0', 'u3-vertical-wall-force-07': '290426d8aacc1f44ca5a20f3cd0d46fbe18bf3e100fe552ee6a617c7412985f2', 'u3-vertical-wall-force-08': 'cc6f37666b1c0773447bd8c612966cfc62bc36909d8a4de2f938b0c0deeb9f18', 'u3-vertical-wall-force-09': 'bc7f62275107cf9c734817c37b5ac22478418c602b75b150522aec7a912598b9', 'u3-vertical-wall-force-10': 'c92f212163baf77e025161414b6e202ca53e11d95cb807a529f2eb57a1c8822b', 'u3-vertical-wall-force-11': 'bb5dbb43630fcda6fd62a490e7bb52d57c6458e230720fca4cc5982ea3bf9a78', 'u3-vertical-wall-force-12': '31f15dfaaba3057ff917dbc5e636aededfb4b61d4ba0502b6a9478f72b2319a7', 'u3-vertical-wall-force-13': '4e999413f64dcd83fddf1966cfeda076ed9105e7412aaf0618504d987506ed40', 'u3-vertical-wall-force-14': 'fb63bfe39ca897febfa7792f8139e922a5520e7fa52166f8862ba6f27ee3e2f6', 'u3-vertical-wall-force-15': '344019511e9e2ba290bff1e9040a5b596331533548c261c873ae44cd35245835', 'u3-vertical-wall-force-16': '58dd4b5002395ea5e197a35e167d283a0b75be8ac131ca284a3b4ab967727dde'}
