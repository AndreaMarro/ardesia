"""Distinct individual reviewer; no authoring import and no human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import radiation_attenuation_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    if raw=='e':return sp.E
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
FAMILY='optical-depth'
EXPECTED_IDS={'AR-u7-optical-depth-04', 'AR-u7-optical-depth-03', 'AR-u7-optical-depth-07', 'AR-u7-optical-depth-14', 'AR-u7-optical-depth-05', 'AR-u7-optical-depth-15', 'AR-u7-optical-depth-13', 'AR-u7-optical-depth-02', 'AR-u7-optical-depth-06', 'AR-u7-optical-depth-10', 'AR-u7-optical-depth-12', 'AR-u7-optical-depth-08', 'AR-u7-optical-depth-16', 'AR-u7-optical-depth-11', 'AR-u7-optical-depth-09', 'AR-u7-optical-depth-01'}
REVIEWED_SKILLS={1: 'C5-L07', 2: 'C5-L07', 3: 'C5-L06', 4: 'C5-L07', 5: 'C5-L07', 6: 'C5-L07', 7: 'C5-L07', 8: 'C5-L07', 9: 'C5-L07', 10: 'C5-L07', 11: 'C5-L07', 12: 'C5-L07', 13: 'C5-L07', 14: 'C5-L07', 15: 'C5-L07', 16: 'C5-L07'}

@lru_cache(maxsize=1)
def oracle():
    t,d,k1,k2=sp.symbols('tau d k1 k2',positive=True)
    unique([t/d,t*d,d/t,sp.exp(-t)/d,-t/d],t/d)
    unique([k1*k2,k1/k2,k2/k1,k1*k1*k2,k1+k2],k1*k2)
    d=model.primary_only_derivations()[247]
    out=[d[n]for n in range(1,17)]
    out[1]='1, adimensionale'
    out[3]='Da 2 a 6'
    out[8]='μ = τ / d'
    out[9]='κ₁ κ₂'
    return out

MANUAL=['La profondità ottica τ=μd è pura perché cm⁻¹·cm=1. Con μ 1 cm⁻¹, d 2 cm valeτ 2. Il flusso relativo èexp(−τ), ma non è richiesto valutarne un decimale.', 'τ=μd puro, distinto da trasmittanza e^-τ. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.', 'Caso autonomo di mezzo ideale trasparente: n=√(ε_r μ_r), con entrambe le quantità relative pure. Il prodotto 9·1=9 ha radice positiva 3, dunque n 3. La permeabilità relativa μ_r non è il coefficiente di attenuazione μ degli altri quesiti.', 'A d 2 cm fissato, μ 1→3 cm⁻¹ portaτ 2→6, fattore 3. Si confrontano preparazioni con coefficienti diversi, ciascuno omogeneo e costante nel proprio strato.', 'Isolo μ=τ/d. Con τ 2, d 2 cm: μ 1 cm⁻¹. τ è puro, così l’unità inversa di lunghezza rimane nel risultato.', 'Isolo d=τ/μ. τ 2 diviso 1 cm⁻¹ dà 2 cm. Il coefficiente finito positivo consente la divisione; τ non è già uno spessore geometrico.', 'A:τ 1·2=2. B:τ 1·1=1. Rapportoτ_B/τ_A=1/2, diretto nel rapporto delle lunghezze a μ invariato.', 'Propostaτ 4 meno correttoτ 2=+2, numero puro. Non si aggiunge cm allo scarto di profondità ottica.', 'Da τ=μd divido per d>0: μ=τ/d, unitàcm⁻¹. La relazione I/I₀=e⁻ᵗᵃᵘ descrive una trasmissione, non sostituisce τ con I nella medesima inversa.', 'Tra prove μ_B=κ₁μ_A e d_B=κ₂d_A: τ_B/τ_A=κ₁κ₂. I fattori sono positivi e le quantità fisiche mantengono le proprie unità; non compare una radice o un quoziente.', 'A:τ 2. B:τ 2·3=6. Rapporto 6/2=3. Il coefficiente doppio e lo spessore 3/2 volte maggiore danno 2·3/2=3.', 'Media(2+6)/2=4. Ai dati medi μ 3/2 cm⁻¹, d 5/2 cm la profondità sarebbe 15/4. La media delle uscite supera il prodotto delle medie di 1/4, esatto.', 'Il bersaglio è 3·2=6. Con μ_B 2 cm⁻¹ occorre d_B 3 cm; rapporto d_B/d_A=3/2. Non si copia il fattore 3 della profondità come quello della sola lunghezza.', 'Riferimentoτ 2 e lettura 6→guadagno 3. Nuova lettura 18→τ 6; d 3 cm dà μ=6/(3 cm)=2 cm⁻¹. Display e τ sono entrambi puri ma non numericamente identici senza decodifica.', 'Riferimentiτ 2, 6 e letture 5, 13 danno guadagno 2 e offset 1. Lettura 9→τ 4; d 1 cm implica μ 4 cm⁻¹. Non entra l’offset nel prodotto fisico μd.', 'Il vincolo μ=[(1/2)cm⁻²]d lega grandezze con unità diverse. Con x=d/(1 cm)>0, μ/(1 cm⁻¹)=x/2 eτ=x²/2. La misuraτ 2 dàx²4: radici±2, soltanto x 2 ammessa. d 2 cm e μ 1 cm⁻¹.']

DISTRACTORS=['τ 2=1·2.4 quadrato, 1/2 reciproco, cm lunghezza, e^-2 trasmittanza.', 'Unità 1; cm d, cm^-1 μ, W/m² I, s tempo.', 'n 3=√(9·1).9 omette radice, 1/3 reciproco, −3 ramo escluso.', 'τ 2→6 lineareμ.2/3 inverso, 18 quadrato, 2 ignora, 3 copiaμ.', 'μ 1 cm^-1=2/2 cm; 4→τ 8, 2→4, 1/2→1.', 'd 2 cm; 1/2→τ 1/2, 1→1, 4→4.', '1/2=1/2.2 reciproco, 1/4 quadrato, 1 ignora, e è rapporto trasmittanze.', '+2=4−2.−2 ordine, 4 proposta, 1/2 rapporto inverso, 0 accetta.', 'τ/d dimensioneL^-1; τd e d/τ sonoL; exp(-τ)/d ha giusta dimensione ma diversa legge; −τ/d negativo.', 'κ₁κ₂ diretto. Quozienti invertono una variabile, κ₁² aggiunge potenza, somma 2 a fattori 1.', '3=6/2.1/3 reciproco, 2 soloμ, 3/2 solod, 6 finale.', '4 media 2/6; 15/4 dati medi, 8 somma, 2/6 una prova.', 'dB 3 cm rapporto 3/2; 2/3 reciproco, 3 copiaτtarget, 2 copianuovoμ, 1→τ 4.', 'g 3, D 18→τ 6, d 3→μ 2.6→D 54, 1→9, 3→27.', 'g 2, b 1, D 9→τ 4, d 1→μ 4.9/2 ometteb eD 10; 8 ometteg; 9 copia lettura.', 'x²4 e dpositivo→2 cm.−2 escluso, 4→τ 8, 1→1/2. Vincolo quadratico non ridondante.']

ASSUMPTIONS=['Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.', 'Mezzo ideale trasparente, indice positivo n=√(ε_r μ_r) fornito, ε_r 9 e μ_r 1 relativi puri. μ_r permeabilità distinta dal coefficiente di attenuazione.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.', 'Attenuazione lineare omogenea, μ e d finiti positivi, τ=μd puro distinto dalla trasmittanza exp(-τ). I parametri possono cambiare fra lastre, non dentro la medesima lastra. Il 03 è autonomo su indice positivo trasparente e parametri relativi.']

UNITS={1: '', 2: '', 3: '', 4: '', 5: '1/centimeter', 6: 'centimeter', 7: '', 8: '', 9: '1/centimeter', 10: '', 11: '', 12: '', 13: '', 14: '1/centimeter', 15: '1/centimeter', 16: 'centimeter'}

NUMERIC_UNITS={1: '1', 3: '1', 5: 'cm⁻¹', 6: 'cm', 14: 'cm⁻¹', 15: 'cm⁻¹', 16: 'cm'}

SUFFIX={}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='XML e nuovo native completo 640 × 1580 letti. Spessori 160 e 240 coordinate danno 2 e 3 cm con scala 80; le intensità non sono codificate dal colore. Barre 100/300/200 perτ 2/6/4, scala 50. Curva di preparazioni vincolate: x=150+120 d[cm], y=1460−70 τ; punti a d 1/2/3 dannoτ 1/2, 2, 9/2. Punto(390, 1320)=(2 cm, 2); origine aperta esclusa. L’asse non attraversa cifre o etichette.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'EXACT_MANUAL_CALCULATION'}

CANDIDATE_REF='539e12af7cb128b8d7748915424b37c8ab988ac1'

PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'

REVIEWED_MODEL_SHA256='c74b1d7f639531452c09fc4dc017b6c42d6ca298f58957e09e372092f0ca4b47'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='503cf8b020c36720168b05ddebcf366bb38f60f865da12932e3097ff927794c4'

REVIEWED_BINDINGS_SHA256='f3dff7ff1bf7c9bb13614548d670391c8a4f97c1b4ee8db406658b2909d9b4f3'

REVIEWED_CANDIDATES={'AR-u7-optical-depth-01': '1783a6dfcd81ee368f6ef91931ac7d083d2061f033522d9ccdad6c7e55db91ee', 'AR-u7-optical-depth-02': '2c7c196c650ff1c581b7e045943406361da7dfc36fb8c3331e94b583278678f6', 'AR-u7-optical-depth-03': 'c871061c79db91e415f392aad4d4a2d576574b2d028d2439b8489cae394eadb0', 'AR-u7-optical-depth-04': 'e20a90a6bda0adaa46690024af1d9f4db7b66a7e0fb9c01c274adffda907da9c', 'AR-u7-optical-depth-05': '2a1ae436cf991255f38caebd35ff59905e83613b64def74e0c4caf15f85ee7e8', 'AR-u7-optical-depth-06': '3204d125c2d23a09796f2bc696239f805e51e02a4df03927b2b9a5a5bbe61bbe', 'AR-u7-optical-depth-07': '07c775f6340437b177e4cadb95d8e1fcf1b2ec4bb942ff9a6b9e98a1bfe4675b', 'AR-u7-optical-depth-08': '53a8a50a9d1f178e7cd20ae5ce9e087939898e932d93c5c1692e0f61f000adc2', 'AR-u7-optical-depth-09': '38703cc25bb641f4ff7f7000b1d77b7b406c774d8caafc1ed7e9a0b49a277bb6', 'AR-u7-optical-depth-10': '6b34b1b0be18f0c17226cf11833d9613b29311ded369e430346f5f15144536e4', 'AR-u7-optical-depth-11': 'f1fb494b0e7c568cdb695db2db4d7348927e5a284763bce1212952d308c3c4f9', 'AR-u7-optical-depth-12': '354439a47f483cf7cf11ae95ca25b77eb45e5e392d1bdca29642a6701394a588', 'AR-u7-optical-depth-13': 'bea732131a95051a00cb8f56605c8f5aa3123f36d91c0b531e255883b740a19b', 'AR-u7-optical-depth-14': '55d3a99afa04d60fa477007889864d2c48de47c8ae165719b9ba2687445c3b12', 'AR-u7-optical-depth-15': '4bc45c1089ad812038363fe342d5fc9cc657a8335c5bc8d04b832bc6f1d3a0cc', 'AR-u7-optical-depth-16': '993e5b2aeab4fc03d71c7c488e640be938c288a9250a8e99c3167b0b8d886418'}

READ_SOURCE_SHA256={'u7-optical-depth-01': '3e7735618af635d3465b2c374c48b12224d467ee73f351dc695c3dd936ad8482', 'u7-optical-depth-02': '0b73d662235d5d91c51e5d8718326e487e167bb7b276e96d7779b9555e32ba75', 'u7-optical-depth-03': 'bcfaa24cf11e1fb1bca0b8307f069a8e1afd8dbd511ccedc5c05aff0f6f25594', 'u7-optical-depth-04': '435a21d0c13cbabf5d648de5be367b028c69b37bc4bf362c7bbb2f2310d555e1', 'u7-optical-depth-05': '00493ba5ee4ce6bc4ee7200fd69f462c10105e3140ba829b91ef0f6465991b28', 'u7-optical-depth-06': 'af98a213231edb440956271299f8629f5fd6727832e8c469c975a7cd5bc0cfd3', 'u7-optical-depth-07': '1ada098d2a5cef10c0da95a14d1d6e4b1fc70d41998c9951cd1c9346e0314417', 'u7-optical-depth-08': '1608bfef29363f183e93945b8402c9867e322b203b0af5d595d7167893c131f4', 'u7-optical-depth-09': 'd0106ba81880b16ab86fe0546bd6bc898756a9dbf108773ebcd9f0210266d1cd', 'u7-optical-depth-10': 'a191b545301e9412badb10ada532bacbb4ded092a86228fbf83e7f090ba1df1c', 'u7-optical-depth-11': 'f1e743796b3d3dbe4b9b6f29da812e6017924ed591d10b159ee78936e2cbc08d', 'u7-optical-depth-12': '6be434d90fa4dcd3f199649eb24b2f352b8f387c75f00f1c7b1962cb3d91001f', 'u7-optical-depth-13': '91b25f7b0015bb8b57095a5224440fcf456fc5914c86c409dd38599e67f77e0b', 'u7-optical-depth-14': '089f7fa859b9912cba78c0cffbafc3544acac2e259512e82a33a85afa82769bf', 'u7-optical-depth-15': '8496bcafcf798b914e544411c0eff57e3a5a12b5973c31b125d38cdc9f54151e', 'u7-optical-depth-16': '48b638bc9569da007520ab75e5c925bdaf190905742fb165f13068ecb21b3b10'}

SOURCE_READING='Tutti80 originali derivati individualmente nella primaria6ead prima di qualsiasi candidata; modelli scritti ed eseguiti sul commit24cf4060 prima di opzioni/chiavi/blocchi/SVG B. Poi tutti16 record di questa famiglia letti integralmente, tutte alternative e cinque figure XML/native nuove lette. Fix autore riletti prima di freeze. Nessun modulo autore o primaria B aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
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
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
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
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_Planck_Beer_and_optical_depth_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
