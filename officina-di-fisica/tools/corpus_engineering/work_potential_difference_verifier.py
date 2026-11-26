"""Independent source-first electric review; no candidate authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
FAMILY='work-potential-difference'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L03', 2: 'C4-L03', 3: 'C4-L03', 4: 'C4-L03', 5: 'C4-L03', 6: 'C4-L03', 7: 'C4-L03', 8: 'C4-L03', 9: 'C4-L03', 10: 'C4-L03', 11: 'C4-L03', 12: 'C4-L03', 13: 'C4-L03', 14: 'C4-L03', 15: 'C4-L03', 16: 'C4-L03'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]



def work(charge,drop):
    charge,drop=map(sp.sympify,(charge,drop))
    if any(x.is_real is not True or x.is_finite is not True for x in (charge,drop)):raise ValueError('Finite real numeric quantities required')
    if charge.is_real is not True or drop.is_real is not True:raise ValueError('Real signed charge and potential drop required')
    return charge*drop

def inverse_charge(result,drop):
    result,drop=map(sp.sympify,(result,drop))
    if any(x.is_real is not True or x.is_finite is not True for x in (result,drop)):raise ValueError('Finite real numeric quantities required')
    if result<=0 or drop<=0:raise ValueError('Positive work and drop for the common positive-charge inverse required')
    return sp.cancel(result/drop)

@lru_cache(maxsize=1)
def oracle():
    q,Va,Vb,D,W,k1,k2=sp.symbols('q Va Vb D W k1 k2',real=True)
    energy_change=q*(Vb-Va);law=-energy_change;assert sp.expand(law-q*(Va-Vb))==0
    positive=q*D;unique([positive,-positive,q/D,D/q,q*D**2],positive)
    unique([W/D,W*D,D/W,W/D**2,W**2/D],sp.solve(sp.Eq(W,positive),q)[0])
    unique([k1*k2,k1/k2,k2/k1,k1+k2,k1*k2**2],sp.cancel(positive.subs({q:k1*q,D:k2*D})/positive))
    shift=sp.symbols('shift',real=True);assert sp.expand(law.subs({Va:Va+shift,Vb:Vb+shift})-law)==0
    aa,bb=work(2,3),work(1,5);assert (aa,bb)==(6,5)
    assert work(-1,-5)==5 # charge in units e, drop in kV -> energy in keV
    gain,offset=calibrate(aa,bb,13,11);assert (gain,offset)==(2,1)
    assert work(sp.Rational(3,2),4)==6
    x=sp.symbols('x',real=True);roots=sp.solve(sp.Eq(sp.Rational(2,3)*x**2,6),x);assert roots==[-3,3]
    Q=SI.Quantity;assert (Q(2,'microcoulomb')*Q(3,'volt')).to('microjoule').magnitude==6
    assert Q(1,'kiloelectronvolt').to('electronvolt').magnitude==1000
    assert inverse_charge(6,3)==2
    return [aa,'μJ','W = q δ','Da 6 a 3 μJ',inverse_charge(6,3),sp.Rational(6,2),work(2,1)/aa,work(-1,-5),'q = W/δ','κ₁ κ₂',bb/aa,(aa+bb)/2,(sp.Rational(5,6)*aa/1)/3,inverse_charge(sp.Rational(15,3),5),inverse_charge((17-offset)/gain,2),next(v for v in roots if v>0)]

MANUAL=['In elettrostatica U=qV e W_campo=−ΔU=q(V_A−V_B). Con carica positiva e caduta positiva il lavoro è positivo. μC·V=μJ:2·3=6 μJ.', 'Il lavoro è energia, dimensione M L² t⁻²: J o μJ sono compatibili. Volt è energia per carica, coulomb è carica. Nella primaria prompt-only le alternative non erano ancora state aperte. Nella successiva revisione sono state lette tutte e cinque le alternative finali e confrontate dimensionalmente: solo μJ è energia.', 'La caduta definita è ΔV=V_A−V_B, quindi W=qΔV, non−qΔV. μC e volt danno direttamente μJ nei numeri. Il campo elettrostatico rende il lavoro indipendente dal cammino, fissati gli estremi.', 'A caduta 3 V, q da 2 a 1 μC dà W da 6 a 3 μJ. La variazione di energia potenziale è invece−W in ciascuna prova.', 'q=W/ΔV=6 μJ/(3 V)=2 μC. Divisione per caduta positiva, non per il potenziale assoluto di uno dei due punti.', 'ΔV=W/q=6 μJ/(2 μC)=3 V. La caduta è V_A−V_B; non va scambiata con V_B−V_A senza cambiare segno della legge.', 'A:6 μJ. B:2 μC·1 V=2 μJ. Rapporto W_B/W_A=1/3.', 'Caso autonomo dell’elettrone: q=−e, V_i=−2 kV e V_f=+3 kV. V_i−V_f=−5 kV, perciò W=(−e)(−5 kV)=+5 keV. Parte da fermo e lavora solo il campo: K_f=5 keV. L’energia potenziale diminuisce di 5 keV; non si usa il ramo di carica positiva del prefisso degli altri ID.', 'Isolare q da W=qΔV dà q=W/ΔV. Con W>0 e ΔV>0 la carica risultante è positiva. Volt=J/C garantisce che J/V=C.', 'W_B/W_A=(κ₁q·κ₂ΔV)/(qΔV)=κ₁κ₂. I fattori positivi conservano il verso della caduta e il segno del lavoro del ramo dichiarato.', 'A=6 μJ; B=1 μC·5 V=5 μJ. Rapporto 5/6, con entrambi i cambiamenti inclusi.', 'Media(6+5)/2=11/2 μJ. Ai dati medi q=3/2 μC e ΔV=4 V il prodotto dà 6 μJ, non 11/2: differenza−1/2 μJ.', 'Bersaglio(5/6)·6=5 μJ. Con q_B=1 μC occorre ΔV_B=5 V, quindi rapporto con 3 V iniziali 5/3.', 'Fattore strumentale 18/(6 μJ)=3 μJ⁻¹. Lettura 15 indica 5 μJ; con caduta 5 V segue q=1 μC.', 'Riferimenti W_A=6 e W_B=5 μJ, letture 13 e 11: guadagno 2 μJ⁻¹, offset 1. Lettura 17 dà 8 μJ. Caduta 2 V: q_C=4 μC.', 'Vincolo numerico q=(2/3)ΔV, coefficiente fisico(2/3) μC/V. Misura 6 μJ impone 6=(2/3)ΔV², dunque ΔV²=9. Solo ΔV=3 V positivo, con q=2 μC; radice−3 viola entrambi i moduli positivi.']

DISTRACTORS=['−6μJ èΔU_e,nonW;copie 2 o 3 ignorano prodotto;6 J perde micro.', 'μC carica,V potenziale,N/C campo,W come unità è potenza;μJ energia.', '−qδ èΔU_e;quozienti q/δ eδ/q non sono energie;δ² aggiunge un volt.', '12 inverte q;6 ignora cambio;1 copiaq_B;−3 èΔU_e e nonW.', 'Wδ non ècarica;δ/W dàC⁻¹;segno meno estraneo alla caduta giàpositiva.', 'Micro nei due fattori del rapporto si cancella:3μV non è 3 V;−3 V èdifferenza finale−iniziale.', '3 reciproco;1 ignora caduta;1/9 aggiunge quadrato;segno meno incompatibile conq,δ positivi.', '−5 keV èΔU_e e nonK_f;1 keV sottrae i moduli 3−2;3 o 2 copiano un estremo.', 'W/δ dàC;Wδ introduceV;δ/W dàC⁻¹;W²/δ haJ C.', 'Quozienti invertono una dipendenza;somma dà 2 per prove uguali;quadratoδ non è nella legge.', '6/5 reciproco;1/2 segueq;5/3 segueδ;1 nonricostruisce 6 e 5μJ.', '6μJ èmodello dei dati medi oA;11 non dimezza;1/2 èmetà differenza;5 copiaB.', '3/5 reciproco;5/6 ignoraq dimezzata;2 dà 6μJ;5 copiaδ_B.', '3μC usa D comeμJ;2μC dàD 30;5 copia lavoro senza dividerlo perδ.', '17/4μC ometteb e prediceD 18;2,8,1μC prediconoD 9,33,5.', '−3 V dàq negativa;9 copiaquadrato;2 V dà 8/3μJ;6 V dà 24μJ.']

ASSUMPTIONS=['Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Caso autonomo dell’elettrone q=−e, con e>0: parte da fermo a −2 kV e arriva a +3 kV sotto la sola forza elettrostatica. Il lavoro del campo è tutta la variazione di energia cinetica. Non si impongono qui q>0 o caduta positiva del modello comune. Energia richiesta in keV, senza inferire una velocità né usare una formula cinetica non relativistica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Campo elettrostatico non alterato apprezzabilmente dal corpo, caduta δ=V_A−V_B>0 e q>0 nei quesiti comuni. W è il lavoro del solo campo, non automaticamente ΔK se vi sono altri lavori. Caso 08 autonomo: elettrone q=−e da fermo e sola forza elettrostatica, con estremi−2 e+3 kV. Nessuna formula cinetica non relativistica necessaria per la sua energia. Vincolo soltanto fra preparazioni, non legge temporale entro la singola prova.']

UNITS={1: 'microjoule', 2: 'microjoule', 3: 'microjoule', 4: 'microjoule', 5: 'microcoulomb', 6: 'V', 7: '', 8: 'kiloelectronvolt', 9: 'C', 10: '', 11: '', 12: 'microjoule', 13: '', 14: 'microcoulomb', 15: 'microcoulomb', 16: 'V'}

NUMERIC_UNITS={1: 'μJ', 5: 'μC', 6: 'V', 14: 'μC'}

SUFFIX={8: ' keV', 12: ' μJ', 15: ' μC', 16: ' V'}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='XML e PNG nativo integrale letti. Schemi di estremi con frecce di passaggio dichiarate schematiche, non traiettorie o campo uniforme. Primo pannello 3 V→0 V conq 2μC:ΔU−6μJ eW+6μJ, senza inferire automaticamenteΔK. Barre 6/5/11/2μJ larghezze 240/200/220, scala 40 coordinate/μJ e origine 130. Ultimo pannello elettrone−2 kV→+3 kV:K_i 0,K_f 5 keV e due segni negativi nel lavoro. Zeri ed etichette liberi.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u6-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C4' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='8f5df28d5865c6a832330b387bdcfc515d1bbfa1'

PRIMARY_SHA256='3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='8bc362d4e7a672b7e45ee916402d5f10aed3c7347570324f784da274fc2494ed'

REVIEWED_BINDINGS_SHA256='2d08c715c5f29796914534b39244ed2f0ace11e8157d92603d8b6dd4e3a6f490'

REVIEWED_CANDIDATES={'AR-u6-work-potential-difference-01': 'fda05238be3907614a77c4049205ee91f4408fd8ddbb36be3e637099b641cb01', 'AR-u6-work-potential-difference-02': '2d8a486610ea3bc7d039994362fb6cbbe70c389155373116b597ee42f732ba7a', 'AR-u6-work-potential-difference-03': '5d3ad0650e7c4420887584d0fd17ef352fae6476e70d72a4eecf12d4288b9e62', 'AR-u6-work-potential-difference-04': '18e649abdef9d1f68eee6fb7ca88d0c7752ce55fae63a646bfe85dedb201bf5e', 'AR-u6-work-potential-difference-05': '1496e89a7e4eaed700f8066661f76253af619d49eda74ee2a2d2717c06bcfc8c', 'AR-u6-work-potential-difference-06': '58543d286b83d753c0d816b143b0f042bd41e0b75326e94a4eb7702c0e922c15', 'AR-u6-work-potential-difference-07': '9a5f539650e73d5884e0fd7e187bf8ad87846f20481103b77dd9e087d98352f1', 'AR-u6-work-potential-difference-08': 'c15358b8f758c22bc3d7efda7bf70152859852790204bf130d6bba37d5b3027f', 'AR-u6-work-potential-difference-09': 'c5a03cf65f6c5dd1923d26f505c0b76fbd6ac55f3c8ab0632d026c30b7d457a7', 'AR-u6-work-potential-difference-10': '37e23d40a97f847a06116495e41577017b8767540727c303faa1eca0137898de', 'AR-u6-work-potential-difference-11': 'ee89c6afd5ff72d78a729ac3c52c2523e845465db8dab8def5b98c08072849c7', 'AR-u6-work-potential-difference-12': '637a0d168743efb6dc7dfb74e5ef2c2011bf1b9897a961b125bbbc2963d2b8a0', 'AR-u6-work-potential-difference-13': '28b53038d34d4d1e12f0d4e02bb79634a4db65c8fc206344ad296e4743b170eb', 'AR-u6-work-potential-difference-14': '2b7033df867cd6a1a3a61f8594ccd97d7dbdd2f253b6368a891f9e2306ff237f', 'AR-u6-work-potential-difference-15': 'f6dd44be92fcde2f909c957944e2df83500c8094f0c5cadcfcfe87b2d10b10fb', 'AR-u6-work-potential-difference-16': '8b1cdc24066991d1eb75a28e14e670b6a3d9671d9ce92d6d2e819cba34cb977c'}

READ_SOURCE_SHA256={'u6-work-potential-difference-01': 'c3f8f90062aad869b28f0d7271263a7b4952c2355c06bae81255b7c12bb5122b', 'u6-work-potential-difference-02': '5f7e9cbd96f8fc7b80ded1396b4f5dad979ccda83843b81f34aee0f7f80f75c8', 'u6-work-potential-difference-03': '4cd296e200231839d2abbca1bec7676d3a5c5b19943eb708175e1d73b9f37b2a', 'u6-work-potential-difference-04': '01712cb1e0d6daf78f15062531d8d12ed7e2d950562c6f6f380ea1707f6cc5c8', 'u6-work-potential-difference-05': '7338b73009344238b87b734f4566d535b645fc3ccd184a35ab0053abbe29b7a2', 'u6-work-potential-difference-06': '9cf251e89631599cbcb6e09408246e0520bb486ae8ae39482e4d01264d0afd1f', 'u6-work-potential-difference-07': '7775c3f0f3e55b6459d2749a3fcb44503314392552cabeb141dff9f313bbf0c9', 'u6-work-potential-difference-08': '4db6c8204a9e898b26603db284d300680057fa7742c027f2ded6c5095474e5e9', 'u6-work-potential-difference-09': '74c3f0a34038eceb2a975338f291e4b81f728ab9fec7d7591e0ff851151044ce', 'u6-work-potential-difference-10': '0289f3097ef9b855ff2db819474ee4f96e9c9a61c8632c1463ee2deb51db9f13', 'u6-work-potential-difference-11': '6c22466bf3c9bd696065122a0fd4349db0cfef2ab58cac0daed2b874bec124f0', 'u6-work-potential-difference-12': '194373166f817a646493ad14726fdf3c581cde7c7eae1e690a4ee1e8534c6fc8', 'u6-work-potential-difference-13': '516f9366121e8e81d5584d1a3027a30482dfc6ba0b16d44891e4d211f6369875', 'u6-work-potential-difference-14': '551d4af1072f6993231a8860ff68db2da991e7df8bb1ff1ef6ad515a23a893a8', 'u6-work-potential-difference-15': '8dfda80ee2b718e2476f2a1551825f2bc1484eef35787495da9c8c5ca86d0d42', 'u6-work-potential-difference-16': '6ab420e4e3252aa24dfcca70037097b71959ac6670ed29914a2aa7d5d76f082a'}

SOURCE_READING='Tutti gli 80 prompt B U 6 letti e risolti prima di candidati, opzioni e chiavi, primaria 3531 congelata. Successivamente lettura completa individuale dei 16 record finali del lotto: prompt, opzioni, tutti blocchi/formule, hint/error, metadati e SVG. XML e PNG nativo integrale effettivamente letti sotto mutex e guardia 2 GiB. Nessuna approvazione da chiavi, nessun autore importato; lezioni reali C 4-L 01/L 02/L 03/L 04 rilette. Byte congelati sul pin finale e fixture esatta, integrazione riservata ROOT.'
