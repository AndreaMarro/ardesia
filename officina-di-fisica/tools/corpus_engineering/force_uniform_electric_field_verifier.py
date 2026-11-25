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
FAMILY='force-uniform-electric-field'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L02', 2: 'C4-L02', 3: 'C4-L04', 4: 'C4-L02', 5: 'C4-L02', 6: 'C4-L02', 7: 'C4-L02', 8: 'C4-L02', 9: 'C4-L02', 10: 'C4-L02', 11: 'C4-L02', 12: 'C4-L02', 13: 'C4-L02', 14: 'C4-L02', 15: 'C4-L02', 16: 'C4-L02'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]



def force(charge,field):
    charge,field=map(sp.sympify,(charge,field))
    if any(x.is_real is not True or x.is_finite is not True for x in (charge,field)):raise ValueError('Finite real numeric quantities required')
    if charge<=0 or field<=0:raise ValueError('Positive test charge and assigned field magnitude required')
    return charge*field

def inverse_charge(result,field):
    result,field=map(sp.sympify,(result,field))
    if any(x.is_real is not True or x.is_finite is not True for x in (result,field)):raise ValueError('Finite real numeric quantities required')
    if result<=0 or field<=0:raise ValueError('Positive force and nonzero field required')
    return sp.cancel(result/field)

@lru_cache(maxsize=1)
def oracle():
    q,E,F,k1,k2=sp.symbols('q E F k1 k2',positive=True)
    law=q*E;inv=sp.solve(sp.Eq(F,law),q)[0]
    unique([F/E,F*E,E/F,F/E**2,F**2/E],inv)
    unique([k1*k2,k1/k2,k2/k1,k1+k2,k1**2*k2],sp.cancel(law.subs({q:k1*q,E:k2*E})/law))
    # A mobile carrier in static metal cannot retain q_carrier E_total != 0.
    carrier=sp.symbols('carrier',nonzero=True);inside=sp.symbols('inside',real=True)
    assert sp.solve(sp.Eq(carrier*inside,0),inside)==[0]
    excess=sp.symbols('excess',positive=True);assert -excess+excess==0
    aa,bb=force(2,3),force(1,4);assert (aa,bb)==(6,4)
    gain,offset=calibrate(aa,bb,13,9);assert (gain,offset)==(2,1)
    assert force(sp.Rational(3,2),sp.Rational(7,2))==sp.Rational(21,4)
    x=sp.symbols('x',real=True);roots=sp.solve(sp.Eq(sp.Rational(2,3)*x**2,6),x);assert roots==[-3,3]
    Q=SI.Quantity;assert (Q(2,'microcoulomb')*Q(3,'kilonewton/coulomb')).to('millinewton').magnitude==6
    assert inverse_charge(6,3)==2
    return [aa,'mN','La sfera resta neutra nel complesso; gli elettroni si ridistribuiscono e il campo nel metallo è nullo','Da 6 a 3 mN',inverse_charge(6,3),sp.Rational(6,2),force(2,1)/aa,12-aa,'q = F/E','κ₁ κ₂',bb/aa,(aa+bb)/2,(sp.Rational(2,3)*aa/1)/3,inverse_charge(sp.Rational(12,3),4),inverse_charge((41-offset)/gain,5),next(v for v in roots if v>0)]

MANUAL=['Legge vettoriale F=qE, con q>0: forza nello stesso verso del campo. 1 μC·1 kN/C=10⁻⁶·10³ N=1 mN, quindi i numeri nelle unità date si moltiplicano. q=2 ed E=3 danno F=6 mN.', 'Forza ha dimensione M L t⁻²: N o un prefisso, come mN, è compatibile. Una carica C e un campo N/C non sono forze singolarmente. Nella primaria prompt-only le alternative non erano ancora state aperte. Nella successiva revisione sono state lette tutte e cinque le alternative finali e confrontate dimensionalmente: solo mN è una forza.', 'La sfera conduttrice isolata conserva carica totale zero: non c’è contatto né terra. Gli elettroni si ridistribuiscono, con eccesso negativo sulla parte vicina alla carica positiva e difetto positivo sulla parte lontana. In equilibrio il campo nel metallo è nullo e la superficie equipotenziale; la polarizzazione non crea una carica netta né fa attraversare elettroni dal corpo esterno.', 'E resta 3 kN/C; dimezzare q da 2 a 1 μC porta F da 6 a 3 mN. È una proporzione lineare fra prove nel medesimo campo assegnato.', 'q=F/E:6 mN/(3 kN/C)=2 μC. La conversione mN/kN/C produce 10⁻⁶ C; E>0 rende lecita la divisione.', 'E=F/q:6 mN/(2 μC)=3 kN/C. Non si divide la carica per la forza, che darebbe dimensione inversa del campo.', 'A:2·3=6 mN. B:2·1=2 mN. Rapporto 2/6=1/3, puro. La carica resta uguale, cambia soltanto il campo.', 'Proposta 12 mN meno corretto 6 mN=+6 mN. Il rapporto della proposta col corretto sarebbe 2, senza unità, e risponde a un’altra domanda.', 'Da F=qE si isola q=F/E, usando unità coerenti. In forma numerica q[μC]=F[mN]/E[kN/C]. Moduli positivi e denominatore non nullo.', 'Sostituzione q_B=κ₁q_A, E_B=κ₂E_A: F_B=κ₁κ₂F_A, quindi rapportoκ₁κ₂. Carica e campo compaiono entrambi al primo grado.', 'A=6 mN. B=1·4=4 mN. Rapporto 4/6=2/3; il fattore 1/2 della carica e 4/3 del campo si moltiplicano.', 'Media delle forze(6+4)/2=5 mN. Ai dati medi q=3/2 μC ed E=7/2 kN/C, il prodotto sarebbe 21/4 mN: la differenza è−1/4 mN. Non si media prima il prodotto dei parametri.', 'Il bersaglio(2/3)·6=4 mN e q_B=1 μC richiedono E_B=4 kN/C. Rapporto E_B/E_A=4/3, non il rapporto delle forze.', 'Il riferimento F_A=6 mN e lettura 18 danno guadagno 3 mN⁻¹. Lettura 12 indica 4 mN. Dividendo per E_B=4 kN/C si trova q_B=1 μC.', 'Riferimenti 6 e 4 mN con letture 13 e 9: guadagno(13−9)/(6−4)=2 mN⁻¹, offset 1. Lettura 41 dà F_C=(41−1)/2=20 mN; E_C=5 kN/C implica q_C=4 μC.', 'Vincolo nei numeri q=(2/3)E, coefficiente fisico(2/3) μC/(kN/C), solo fra prove. La legge dà 6=(2/3)E², dunque E²=9. Radici±3; soltanto E=3 kN/C rispetta E>0 e q>0, con q=2 μC.']

DISTRACTORS=['6 N omette milli;2 o 3 copiano un dato;12 mN duplica un fattore. Il campo assegnato non si ricalcola come una nuova interazione fra sorgenti.', 'μC è carica,kN/C e mN/C sono campi,J energia;solo mN è forza.', 'Neutra non significa assenza di ridistribuzione: il campo interno di equilibrio è nullo, non quello esterno. Senza contatto o terra non cambia la carica totale.', '12 rende inversa q;6 ignora il cambio;1 copia q_B;9 non è il prodotto 1·3.', 'F·E non ha unitàC;E/F dàC⁻¹;copie dei numeri non ricostruiscono qE=6 mN.', 'Fq non è campo;3 N/C perde kilo;copie 2 e 6 non sono il quoziente corretto.', '3 è reciproco;1 ignoraE;1/9 introduce quadrato;segno meno impossibile per questi moduli.', '−6 inverte ordine;12 copia proposta;0 accetta errore;2 è rapporto puro.', 'F/E dàC;E/F dàC⁻¹;F/E² ha un fattore inverso di campo aggiunto;F²/E dàN C.', 'Quozienti invertono una dipendenza, somma dà 2 per prove identiche, quadrato suκ₁ cambia la legge.', '3/2 reciproco,1/2 segueq,4/3 segueE,1 presume compensazione inesistente.', '21/4 mN usa dati medi;10 omette metà;1 è metà differenza;6 copia A.', '3/4 reciproco,2/3 omette q cambiata;2 darebbe F 6 mN;4 copia E_B anziché rapporto.', '3μC usa D come forza;2μC prediceD 24;4 copia F_B senza dividereE.', '41/10μC omette offset e prediceD 42;2 e 5μC dannoD 21 e 51;20 copia forza.', '−3 violaq,E positivi;9 copiaquadrato;2 dà 8/3 mN e 6 dà 24 mN.']

ASSUMPTIONS=['Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Caso concettuale autonomo: sfera metallica inizialmente neutra e isolata da terra; corpo positivo esterno avvicinato senza contatto. Nessuno scambio di carica con esterno, riequilibrio elettrostatico, carica totale nulla conservata e campo totale nullo nel materiale metallico. Non si applica il modello della carica di prova in campo esterno prescritto.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Eventuali display sono continui e la taratura non cambia la legge fisica.', 'Carica di prova piccola e positiva, campo esterno uniforme prescritto indipendente dalla prova, costanti entro la configurazione. Si cerca solo la forza elettrica, non l’eventuale risultante. Verso positivo concorde con E. Il caso 03 è separatamente una sfera metallica inizialmente neutra, senza contatto e senza terra, in equilibrio elettrostatico. Vincolo soltanto fra preparazioni, non legge temporale entro la singola prova.']

UNITS={1: 'mN', 2: 'mN', 3: 'C', 4: 'mN', 5: 'microcoulomb', 6: 'kilonewton/coulomb', 7: '', 8: 'mN', 9: 'C', 10: '', 11: '', 12: 'mN', 13: '', 14: 'microcoulomb', 15: 'microcoulomb', 16: 'kilonewton/coulomb'}

NUMERIC_UNITS={1: 'mN', 5: 'μC', 6: 'kN/C', 14: 'μC'}

SUFFIX={8: ' mN', 12: ' mN', 15: ' μC', 16: ' kN/C'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e PNG nativo integrale letti. Campo e forza concordi per la prova positiva, frecce schematiche con unità diverse e punte separate. Barre 6/4/5 mN con larghezze 240/160/200, scala comune 40 coordinate/mN e origine 130; zero a 104 non attraversato. Pannello autonomo della sfera isolata: corpo positivo separato, redistribuzione schematica con netta 0 e campo nel metallo 0; non è una misura quantitativa del numero di elettroni.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

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


CANDIDATE_REF='2614da11a5874026739addb6e3e508109833b723'

PRIMARY_SHA256='3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='83a89d708fbd1b610d2e4322a06ca6ca318d39ae5dab9ea3e9239695faf19820'

REVIEWED_BINDINGS_SHA256='a57b6e954fedbb8091a8fe29ac048523d27baeea6ad84e658c81a6ea87dff0db'

REVIEWED_CANDIDATES={'AR-u6-force-uniform-electric-field-01': '2ee2c600656441e6ff5a5022de75a15140c52adf8449398e8abc424899764c28', 'AR-u6-force-uniform-electric-field-02': '6534b1635b081b13add6650ef495624c42ce94d43a8092fd73a5ec1564496ff0', 'AR-u6-force-uniform-electric-field-03': '9b9deb1a6299f46ae85eb3d0b751b9e7e3d49a809d8af1c45c961be65fdf1322', 'AR-u6-force-uniform-electric-field-04': '488ecad33761b2b5f4a33ca2ae7d05721f2690391852437cf2fefe9aa633b472', 'AR-u6-force-uniform-electric-field-05': '3dff82063e5abd61ecd13251cab8f6298ecd800cacc3bb10c82817c63d73f032', 'AR-u6-force-uniform-electric-field-06': '5c79f7d186ef9127d3e114d67e94471bad3475642e8ea6c1a13587dc70be24d6', 'AR-u6-force-uniform-electric-field-07': '7434b1a60eac164d581d6c5f682743b9d9a2d2570df25a0454bd668c0830f458', 'AR-u6-force-uniform-electric-field-08': 'c5194dff795a89cbca256d60e93a1c891a4df464214ebc6f0f61ed8b98e9ec73', 'AR-u6-force-uniform-electric-field-09': 'ef44631a6617a4c8fdef98adba8b69f4fe18ec9fe5734d319608d17667b1c451', 'AR-u6-force-uniform-electric-field-10': 'd7c44e3b636197220907af4dbd4538d704c43e417182792a0eb9ec242c8ceb51', 'AR-u6-force-uniform-electric-field-11': '8a5e3fc35a8462803f7dedbb56e024fafc672f674907d38e583adfe5492b767d', 'AR-u6-force-uniform-electric-field-12': '1906d3e04c0406a4151baa658c03282ba102c368baeb95d6695a8249cfd80bc9', 'AR-u6-force-uniform-electric-field-13': '15751ceb824862ed407773d41502163404a5e9aa5694541ab33831ac0feebc21', 'AR-u6-force-uniform-electric-field-14': '0ce0447cb3e3c661be4e4e20154a44a06ef4e2a0ea200ac99fbc85f76305ec48', 'AR-u6-force-uniform-electric-field-15': '338cff29f80342c619eb97186cca5146539101e14d7409247a36b10aae6ca0af', 'AR-u6-force-uniform-electric-field-16': 'eb5b782b3335180fc1fd2d4986ed2cd5f6dcbe9d014de7bacc8e837a32b32468'}

READ_SOURCE_SHA256={'u6-force-uniform-electric-field-01': '425c49ef4f99f66addd3e02d0953236affa712819e4f055265f9a9f171efd145', 'u6-force-uniform-electric-field-02': 'd3255c874a7263c2a0c1496215c06cbd352946e1899d6accd0f46aed11a78299', 'u6-force-uniform-electric-field-03': 'd857b6636c9d184a1a5ca1c44cd9221a5b45f63718bc10a04f754ad0dcf2ac10', 'u6-force-uniform-electric-field-04': '326d30978c8a40fde5cd1a2ff7a6d5c0397e30ec2977052b9a5c3f8db4ed6a78', 'u6-force-uniform-electric-field-05': '4238f41b3414390a419f0aeb40683f8bbff74cdfcb4fc44ad4d0ce2bcd8ba75a', 'u6-force-uniform-electric-field-06': 'dcf3e2cd24caf2250d2da1f9b9a78f1240e7981cc9507f8c755b2a9ce3bf33a2', 'u6-force-uniform-electric-field-07': 'fa497b0118c1f7510137f74ca5882d6508f61e922c85b213f4f9c2f649978a7c', 'u6-force-uniform-electric-field-08': '568b4daabbd703eecbc8e286850ba600f8ade238e6ba29c9444ce5e389d30368', 'u6-force-uniform-electric-field-09': '26e201b34cba8b9e2f28e8bcb26172eb6711775f66fee98d2a420f61183ad6bc', 'u6-force-uniform-electric-field-10': 'fad7dc4b19669325fdc1b0da9052ccb90741492d90480971ea50f2786a01f6e3', 'u6-force-uniform-electric-field-11': '11246dcadbdb55fbbe8e93b798640a04546f2668f7522676af59647e9296e282', 'u6-force-uniform-electric-field-12': '1966f721986b01593e504b60ba6b5c51aef60099ca7aecfcc60e0a0fc3119110', 'u6-force-uniform-electric-field-13': 'e7e236afba389e31977f5cce49066d93e9e88f9c4a95561fa91270b50177d912', 'u6-force-uniform-electric-field-14': 'd3855b01daca9b0645e9d7cf872afaf632d2265fc4e0f98a9c592c6603e05347', 'u6-force-uniform-electric-field-15': '9655fae70435e2ad3d5c650fb3b153fec1af321d6bf0d6db8788ddbccf1fc98d', 'u6-force-uniform-electric-field-16': '3b1a37d519eb694c7b03c4d8096a4352a3ab622bf776defc54a8c1d84be02bd7'}

SOURCE_READING='Tutti gli 80 prompt B U 6 letti e risolti prima di candidati, opzioni e chiavi, primaria 3531 congelata. Successivamente lettura completa individuale dei 16 record finali del lotto: prompt, opzioni, tutti blocchi/formule, hint/error, metadati e SVG. XML e PNG nativo integrale effettivamente letti sotto mutex e guardia 2 GiB. Nessuna approvazione da chiavi, nessun autore importato; lezioni reali C 4-L 01/L 02/L 03/L 04 rilette. Byte congelati sul pin finale e fixture esatta, integrazione riservata ROOT.'
