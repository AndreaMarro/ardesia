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
FAMILY='hydraulic-stroke'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    ai,ao,di,do=sp.symbols('ai ao di do',positive=True)
    # Rigid filled circuit: integrate constant piston area over its finite travel.
    s=sp.Symbol('travel',real=True)
    left=sp.integrate(ai,(s,0,di));right=sp.integrate(ao,(s,0,do))
    law=sp.solve(sp.Eq(left,right),di)[0]
    inverse=sp.solve(sp.Eq(di,law),ai)[0]
    inverse_out=sp.solve(sp.Eq(di,law),do)[0]
    a,b=sp.symbols('a b',positive=True)
    ratio=sp.simplify(law.subs({ai:a*ai,do:b*do})/law)
    if law!=ao*do/ai or inverse!=ao*do/di or ratio!=b/a:raise ValueError('Independent finite-volume and inverse/scaling failed')
    for options,want in [([ao*do/ai,ai*do/ao,2*ao*do/ai,ao*do/(2*ai),ao/ai],law),([ao*do/di,ao*di/do,do/di,2*ao*do/di,ao*do/(2*di)],inverse),([b/a,a*b,a/b,b*b/a,a+b],ratio)]:
        if [i for i,v in enumerate(options) if sp.simplify(v-want)==0]!=[0]:raise ValueError('Finite-volume symbolic alternatives not unique')
    f=lambda area,output_stroke:law.subs({ai:area,do:output_stroke,ao:20})
    A,B=f(2,1),f(4,3)
    q,d=sp.symbols('q d',real=True)
    cal=sp.solve([sp.Eq(q*A+d,21),sp.Eq(q*B+d,31)],(q,d))
    C=(11-cal[d])/cal[q]
    if (cal[q],cal[d],C)!=(2,1,5):raise ValueError('Finite stroke affine calibration failed')
    if f(3,2)-(A+B)/2!=sp.Rational(5,6):raise ValueError('Stroke nonlinear mean counterexample failed')
    c=sp.Symbol('c',positive=True)
    constrained=sp.simplify(law.subs(ai,c*do))
    if constrained!=ao/c or constrained.subs({ao:20,c:2})!=10:raise ValueError('Dimensional area-stroke non-identifiability failed')
    U=SI.Quantity
    volume=(U(20,'cm**2')*U(1,'cm')).to('cm**3')
    travel=(volume/U(2,'cm**2')).to('cm')
    area=(volume/U(10,'cm')).to('cm**2')
    c_unit=(U(2,'cm**2')/U(1,'cm')).to('cm')
    invariant=(U(20,'cm**2')/c_unit).to('cm')
    if (volume.magnitude,travel.magnitude,area.magnitude,c_unit.magnitude,invariant.magnitude)!=(20,10,2,2,10):raise ValueError('Pint Fraction finite volume/inverse coefficient units failed')
    # Initially equal vertical contact levels separate by di+do, not do alone.
    if A+1!=11:raise ValueError('Final level difference independent of volume conservation failed')
    return [A,'cm','d_i=A_o d_o/A_i','Da 10 a 5 cm',inverse.subs({ao:20,do:1,di:10}),inverse_out.subs({ai:2,di:10,ao:20}),f(2,2)/A,20-A,'A_i=A_o d_o/d_i','κ₂ / κ₁',B/A,(A+B)/2,sp.Integer(3),inverse.subs({ao:20,do:3,di:15}),inverse.subs({ao:20,do:1,di:C}),'Infinite']

MANUAL=['VolumeuscitaAo do=20cm²·1cm=20cm³. Areaingresso2cm²→di20/2=10cm. Nessunbisognodipressione ocarico.', 'Volume/area=L³/L²=L. cm³/cm²=cm;distanza diversa daarea/volume/pressioneforza.', 'Integrandoareecostantisullecorsefinite:Ai di=Ao do→di=Ao do/Ai. Valido conrigidità,assenzaaccumuli/perdite egas,entrocorse disponibili.', 'Volumeuscitafisso20cm³. Ai2→4cm²→di10→5cm,inversamentel’area.', 'Ai=Ao do/di=20cm³/10cm=2cm²,nessunaradice inun’area giàincognitalineare.', 'IngressoAi di2·10=20cm³;do=20cm³/20cm²=1cm. Forzedisollevamentononassegnate.', 'Aido2cm,raddoppiavolume20→40cm³ aAifissa2cm²;di10→20cm,rapporto2.', 'Proposta20cm−corretta10cm=+10cm;volumeeccedente20cm³nonhaaccumulo previstonelcircuito.', 'Dividerecontinuitàperdi>0→Ai=Ao do/di. Numerovolume20nonpuòsostituireunitàareaAo20cm².', 'Aoscostante,diB=Aοκ2doA/(κ1AiA);rapportoκ2/κ1. I fattoripositive ecorseammesse.', 'Adi20/2=10cm;Bdi20·3/4=15cm;rapporto15/10=3/2.', '(10+15)/2=25/2cm. IngressimediAi3cm²,do2cm→40/3cm;differenza40/3−25/2=5/6cm.', 'TargetdiB15cm,AiB4cm²→volume60cm³;Ao20cm²→doB3cm,rapportoa1cm=3.', 'c30/(10cm)=3cm⁻¹;S45→di15cm;volumeuscita20·3=60cm³→Ai60/15=4cm².', 'ΔS10/Δdi5cm→c2cm⁻¹,d1. C(11−1)/2=5cm;volume20cm³→Ai4cm².', 'Ai=c do,c2cm:di=Ao do/(c do)=Ao/c=10cm perognido>0ammesso. Infinitecoppiecontinue: (2cm²,1cm),(4cm²,2cm);zeroescluso,coeffcientelunghezza.']
DISTRACTORS=['di1cmcederebbe2cm³non20;corseugualisoloseareeuguali. Continuitànondetermina lavoro.', 'cm²area,cm³volume,Papressione,Nforza;solocmlunghezza.', 'Rapportoinversovolumeingressotroppopiccolo;2e1/2violanouguaglianza;Ao/Aisenzacorsaèpuro.', '20effettodirettoinveceinverso,10ignoracambio,5/2dimezzaduevolte,zeronontrasferiscevolume.', 'do/dièpuro,mancaAo;nessunraggiosenzaformaaspecificata.', 'do10cmrichiede200cm³;1/10inverteunasecondavolta,datovero1cm.', '1/2reciproco,4quadratoassente,1ignora,−2nonmodulopositivo.', '−10ordineinvertito,20proposta,0accetta,5doppia metà.', 'Ao di/doinverterapporto,do/disoloèpuro,2e1/2alteranovolume.', 'Prodottoareaeffettodiretto,κ1/κ2inversione,κ2²quadratoassente,somma2peridentici.', '2/3reciproco,3solodo,1/2soloAi,15numerocorsaBnonrapporto.', '25somma,25/4doppia metà,40/3ingressimedi,5differenza.', 'Fattore3/2solo do noncompensaAisecondadoppia;3ricostruiscevolumerichiesto60cm³.', 'S45comecm→Ai4/3cm²;corretto4cm²·15cm=60cm³.', 'Ai2,3,5,8cm²con do1dannoS21,43/3,9,6;solo4dà11.', 'Unica/due finite ignoranoscalacontinua;nessuna contraddiceesempi;coppi nullaesclusadadominio. Finitaampiezza dicorsa puòlasciareintervallopositivocontinuoinfinito.']
ASSUMPTIONS=['Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. ', 'Circuitorigido completamente pieno diliquidoincomprimibile,nessunaperdita,gas intrappolato odeformazioneaccumulatrice. Areecostanti,Ao20cm²,Ai>0,corsefinitepositivediingressoversoliquido edoall’uscitasollevata,entrospazidisponibili. Volumeingresso tuttoall’uscita;pressioni/carichinondati,quote possono cambiare. Ai=(2cm)dolegaapparati,nonareavariabiledurantelacorsadelmedesimopistone;intervallipositividicorsaammessi.']
UNITS={1: 'cm', 2: 'cm', 3: 'cm', 4: 'cm', 5: 'cm**2', 6: 'cm', 7: '', 8: 'cm', 9: 'cm**2', 10: '', 11: '', 12: 'cm', 13: '', 14: 'cm**2', 15: 'cm**2', 16: ''}
NUMERIC_UNITS={1: 'cm', 5: 'cm²', 6: 'cm', 13: '1', 14: 'cm²'}
SUFFIX={8: ' cm', 12: ' cm', 15: ' cm²'}
SVG_REVIEW='XML e rendering completo letti: graficiarea×corsa,assi10px/cm²orizzontale e20px/cmverticale. Ingresso20×200px per2cm²·10cm;uscita200×20px per20cm²·1cm,entrambi4000px²rappresentano20cm³. Barredelvolume200pxciascuna a10px/cm³. Quoteinizialiy1250;ingressofimaley1450(−10cm),uscitay1230(+1cm),dislivello220px/20=11cm. Frecceinpathseparati;nessunuguaglianzalavorifinitiasserta.'

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
          'methods':['SymPy_independent_hydrostatic_equilibrium_or_pressure_integral_or_volume_conservation','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='85d93ec'
SOURCE_READING='All80original prompts individually read before candidate solutions, except accidental first07901 full-row display including key disclosed; that direct result independently rederived from equal-level hydrostatics. All16final candidate records, alternatives, feedback and SVG read before freezing; never imports authoring.'
REVIEWED_PACKAGE_SHA256='68e212f3521a5ff681741c94ec457c62da2c37c697869054735d08be8f0ba501'
REVIEWED_BINDINGS_SHA256='29e73b3b5fee7c3c522358ebf505ce2746a2a3e5b9b0721f072d7db42f3a3d53'
REVIEWED_CANDIDATES={'AR-u3-hydraulic-stroke-01': 'f7f6bf7e55c5b4bb5af006cc455da5f4f7b6a429c3d36194de683a0bec8d49fb', 'AR-u3-hydraulic-stroke-02': '5c8c85966bedcfff4ebf55df299a63c9cb86f1a80bba920a2c89b18b36f36a64', 'AR-u3-hydraulic-stroke-03': '917fbee84bb47d73d4cefc60987f0a6a5a1daa6fc22397aced6440489ad5da6f', 'AR-u3-hydraulic-stroke-04': 'fb83c2e69c74fadba1fdb88f6168b5ca845ae2dcc981df420ce640997534fdc5', 'AR-u3-hydraulic-stroke-05': '7c43d5e15d7c3c949cf0ab35fe557ecf57952c9fa5037e90af85cf12101a41ad', 'AR-u3-hydraulic-stroke-06': '2fb7885e335497b08edf887e0d185efa9bd5341a273fd40f60916e2bce1a5a93', 'AR-u3-hydraulic-stroke-07': 'e91b8f0ea65c08fc94f2d2dfba586527a0bde09ed131190cc85de429fe0d3411', 'AR-u3-hydraulic-stroke-08': '0ddb2890313f4845f3c2cf9992359aa60433d8e2b71c82a41561497c4be5445b', 'AR-u3-hydraulic-stroke-09': 'ec98e420d387069b06e2e056ab38d9c8533b8b1c72dc4eedf146673540eb640e', 'AR-u3-hydraulic-stroke-10': '1428b37e3a9dfabce3f00975eb7cf1da1dc215c6fd96b2981adaeaf03c90f0ca', 'AR-u3-hydraulic-stroke-11': 'f0effaae9c9921175beb95e6fbb1ca4818fe521221ba3583ef036148b6215c33', 'AR-u3-hydraulic-stroke-12': '39c81df1fbd9bb488c4f0ec77726c72b67cff3409f782123e25564553afa9d89', 'AR-u3-hydraulic-stroke-13': 'd4392752754a56a0639e9281162f6ee390d917df2c5badcc78f3c284593ca9fb', 'AR-u3-hydraulic-stroke-14': 'bfb0d792c50d909f797497bdc3d78be628cc29e34a6bf7ba9b5030d35656a00f', 'AR-u3-hydraulic-stroke-15': 'ff6e8d4e470672560bdc036c3793d83069c7687c047e95ed260ab91535c26c0d', 'AR-u3-hydraulic-stroke-16': '8b82630a3b35a31e13ca7c8f9ff930bd89fa15f14997665aaa42c3c866cb0f36'}
READ_SOURCE_SHA256={'u3-hydraulic-stroke-01': 'fb6136573f6429678b6d6fdefe58116f87a63c17f3b02529d11ea3d827fcd9ef', 'u3-hydraulic-stroke-02': '3bab67644704721d7760501df831d5d430f010cb0ef2ef2eb406c420a0f7c8bb', 'u3-hydraulic-stroke-03': '1f0d62a9c84926c6ab2d489799c9522c869538b01f0d8887a754e97bec94009d', 'u3-hydraulic-stroke-04': '688658d0f6e3db39e5ac9b0a7474693fb8de838c77301c56a989456cfafebed6', 'u3-hydraulic-stroke-05': '24f8211373f9129912a8be85864aca0f18edc5d9f7c93c348c7f2d341cb041f3', 'u3-hydraulic-stroke-06': '97eceda69200c6ab114b8fc7ea305643ee6021e2612c1b63497abc5dfbcdf26d', 'u3-hydraulic-stroke-07': '193329d94278125b7ffb7e78a2a74c7de13e305578284c073c33357765ca69b2', 'u3-hydraulic-stroke-08': '280c57453f2a9b263bbfea7a1be0535c24e6eafba00468c9f109dda363b738ef', 'u3-hydraulic-stroke-09': '72037d8a14221dd5644ef2a6e2d531f1c1a165d788ffdaf7504a04c615a73aa5', 'u3-hydraulic-stroke-10': '7460e4bdf12725c1071cd1bed3d8b8dde23abb32b1cbc594f67ebf73df02ec78', 'u3-hydraulic-stroke-11': '8d4186e03bac0aeba8edecd6767425710a9220782451cb2c81f1d32741c4d5bf', 'u3-hydraulic-stroke-12': 'b031eaebd314ea52aada5348e092e6d3ee407ecad2a86bf0796cb5f7f043e383', 'u3-hydraulic-stroke-13': '09352050c02bd917be6329670b78bd504a3a2efc5196dc9918128ce614acb332', 'u3-hydraulic-stroke-14': 'f44549c2d8658791a621ab0502ab3f608b1ca18d9f7c56a56301eb2dad65266d', 'u3-hydraulic-stroke-15': 'ba0786c342905b1f0316aeaa4f657b1e6c80916b787bfc19e22e20c1f2a6be33', 'u3-hydraulic-stroke-16': 'dd3de2558fe218106f8ccad9ab5f69b047577828310f12931a7488d1044ddb84'}
