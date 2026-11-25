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
from . import dielectric_lorentz_review_models as model
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'
FAMILY='dielectric-isolated-voltage'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L07', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    V0,V,k,k1,k2,C0=sp.symbols('V0 V k k1 k2 C0',positive=True)
    law=V0/k
    assert sp.solve(sp.Eq(C0*V0,k*C0*V),V)[0]==law
    unique([k*V,V/k,k/V,k*V**2,V-k],sp.solve(sp.Eq(V,V0/k),V0)[0])
    unique([k1/k2,k1*k2,k2/k1,k1/k2**2,k1+k2],sp.cancel(law.subs({V0:k1*V0,k:k2*k})/law))
    assert model.isolated_voltage(12,2)==6 and model.initial_voltage(6,2)==12 and model.dielectric_ratio(12,6)==2
    d=model.primary_only_derivations()[225];out=[d[i]for i in range(1,17)]
    out[1]='V';out[2]='La carica libera su ciascuna armatura';out[3]='Da 6 V a 1/2 V';out[8]='V₀ = κ V';out[9]='κ₁ / κ₂';out[15]='Infinite coppie continue con κ≥1'
    return out

MANUAL=['Il generatore scollegato non può scambiare carica libera con le armature ideali: il modulo Q su ciascuna resta fisso. Inserimento completo e geometria invariata danno C=κC₀. Da V=Q/C e Q=C₀V₀ segue V=V₀/κ. Con 12 V e κ=2: V=6 V. Non si impone la vecchia tensione dopo lo scollegamento.', 'Si cerca una tensione, dimensione energia per carica e unità volt, V=J/C. Un prefisso modifica la scala e non la dimensione. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'L’isolamento elettrico delle singole armature fissa la loro carica libera, non la tensione e non l’energia del campo. La neutralità complessiva del condensatore da sola non basterebbe a fissare il modulo sulle piastre. Un dielettrico ideale può polarizzarsi senza fornire un canale di conduzione fra esse. C può crescere e V diminuire; eventuali aspetti meccanici richiedono un bilancio distinto.', 'Con κ=2 fissato, V è lineare in V₀. Il riferimento dà 12/2=6 V; il preparato con V₀=1 V dà 1/2 V. Il rapporto finale/iniziale delle due uscite è 1/12. Sono preparazioni con cariche iniziali diverse, ciascuna poi isolata.', 'V=V₀/κ si moltiplica per κ: V₀=κV. Con V=6 V e κ=2 si trova V₀=12 V. κ è puro, finito e almeno uno; la tensione iniziale risulta positiva e non minore di quella finale.', 'Da κV=V₀ si ricava κ=V₀/V=12/6=2, adimensionale. Serve V>0 e deve risultare κ≥1: una misura V>V₀ sarebbe incompatibile col modello dichiarato, non un ramo alternativo da accettare.', 'A dà V_A=12/2=6 V. B con κ=1 dà V_B=12 V, cioè assenza di incremento dielettrico della capacità. Rapporto V_B/V_A=2. Il confine κ=1 è ammesso e non è un denominatore nullo.', 'Il corretto è 6 V; la proposta è 12 V. Scarto proposto meno corretto=+6 V. Il rapporto due sarebbe puro e risponderebbe a un’altra domanda; la tensione proposta conserva impropriamente il valore precedente l’inserimento.', 'Parto da V=V₀/κ. Moltiplicando per κ finito positivo segue V₀=κV, con unità V. La carica libera resta fissata durante l’inserimento, perciò non si usa la legge di un condensatore ancora collegato al generatore.', 'Stati A e B sono preparazioni separate: V_A=V₀/κ e V_B=(κ₁V₀)/(κ₂κ). Dividendo le due espressioni positive si ottiene V_B/V_A=κ₁/κ₂. Oltre ai fattori positivi, occorre κ_A≥1 e κ_B=κ₂κ_A≥1; κ₂ non deve necessariamente essere almeno uno.', 'A: 12/2=6 V. B: 9/3=3 V. Rapporto 3/6=1/2, puro. Il fattore 3/4 dell’ingresso V₀ e il fattore inverso 2/3 della costante dielettrica si moltiplicano.', 'Le due letture fisiche sono 6 V e 3 V. Media con pesi uguali=(6+3)/2=9/2 V. Ai dati medi V₀=21/2 V e κ=5/2, la legge darebbe 21/5 V, non 9/2 V; la differenza è 3/10 V esatta. Non è richiesta alcuna approssimazione decimale.', 'L’uscita bersaglio è (1/2)·6 V=3 V. Con V₀,B=9 V, κ_B=9/3=3. Rapporto κ_B/κ_A=3/2, compatibile con entrambi i domini κ≥1. Non si copia il rapporto delle tensioni finali come rapporto dei dielettrici.', 'Il riferimento V=6 V con lettura 18 fissa a_cal=3 unità strumentali per volt. Lettura 9 decodifica V=3 V. Per κ=3 l’inversa restituisce V₀=κV=9 V. Il numero strumentale non è direttamente la tensione fisica.', 'Riferimenti: V_A=6 V e V_B=3 V; letture 13 e 7. Guadagno a_cal=(13−7)/(6−3)=2 unità/V e offset b_cal=1. Lettura 5 implica V_C=(5−1)/2=2 V; κ_C=4 dà V₀,C=8 V. Prima si sottrae l’offset, poi si divide per il guadagno.', 'Il vincolo fisico è V₀=(6 V)κ. Inserito nella legge dà V=6 V per ogni κ≥1 finito. La misura è ridondante: infinite coppie (V₀,κ)=(6 κ V,κ), ad esempio (6 V,1) e (12 V,2), ma non soltanto queste. Non si ammette il ramo 0<κ<1.']

DISTRACTORS=['6 V segue la carica libera fissata. 24 V moltiplica per κ, 12 V impone il generatore, 3 V divide due volte. Non si conserva la sola carica netta zero per dedurre V.', 'V è tensione. C carica, F capacità, J energia e T campo magnetico. J/C=V, mentre κ non porta unità. Le cinque alternative sono state aperte soltanto dopo la primaria.', 'È fissata per isolamento la carica libera su ciascuna armatura. Con κ>1 C e permittività aumentano, V e U del campo diminuiscono. Il limite κ=1 non trasforma quelle grandezze nella quantità fissata dall’isolamento.', 'A dà 6 V e B 1/2 V. Due V applica la dipendenza diretta; uno ignora la divisione di B per κ; sei copia A e dodici è la tensione iniziale A. Il fattore B/A è 1/12.', 'κV=12 V. Tre V ripete la divisione, sei omette il dielettrico; 36 V darebbe 18 V dopo inserimento. V₀≥V perché κ≥1.', 'κ=12/6=2. Un mezzo viola κ≥1; sei copia il valore numerico finale e 72 forma un prodotto di tensioni. Il valore è puro.', 'B con κ=1 ha V=12 V, quindi rapporto due. Mezzo è reciproco, quattro quadra, uno ignora κ. Zero non segue né Q=C₀V₀ positivo né C finita.', 'Proposta 12 meno corretto 6=+6 V. −6 scambia ordine; due è rapporto; 12 copia proposta; zero confonde netta neutra con tensione nulla.', 'V₀=κV deriva da Q invariata e C=κC₀. V/κ è ancora diretta; κ/V ha V⁻¹, κV² ha V² e V−κ sottrae dimensioni incompatibili.', 'κ₁/κ₂: il primo parametro è al numeratore e il secondo al denominatore. Prodotto e reciproco cambiano dipendenza; κ₂² aggiunge una potenza; somma dà due per prove identiche. κ_B resta≥1.', 'V_A=6 V e V_B=3 V: rapporto 1/2. Due reciproco, 3/4 sola preparazione iniziale, 3/2 solo κ senza invertirlo; uno presume compensazione.', 'Media 9/2 V, distinta da 21/5 V ai dati medi, scarto 3/10 V. Nove è somma, 3/2 semidifferenza e zero usa netta neutra al posto di una tensione fra piastre.', 'Bersaglio 3 V e V₀, B 9 V richiedono κ_B 3: rapporto 3/2. 2/3 reciproco, 1/2 copia bersaglio, 3/4 segue solo V₀; due darebbe 9/4 V.', 'Guadagno 3 V⁻¹, lettura 9 dà 3 V, κ 3 ricostruisce 9 V iniziali. 27 salta il guadagno, 1 divide ancora per κ, 3 si ferma all’uscita finale.', 'Guadagno 2 V⁻¹ e offset 1: lettura 5 dà 2 V, κ 4 dà V₀8 V. Dieci omette offset e predice D 6; sedici omette guadagno; due omette l’inversa fisica.', 'Il parametro si cancella: V=6 V per ogni κ≥1. Esempi κ 1, 3/2, 2 con V₀6, 9, 12 V sono distinti. Nessuna quadratica né conteggio intero; scegliere κ 2 senza dato è arbitrario.']

ASSUMPTIONS=['Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.', 'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.']

UNITS={1: 'volt', 2: 'volt', 3: '', 4: 'volt', 5: 'volt', 6: '', 7: '', 8: 'volt', 9: 'volt', 10: '', 11: '', 12: 'volt', 13: '', 14: 'volt', 15: 'volt', 16: ''}

NUMERIC_UNITS={1: 'V', 5: 'V', 6: '1', 14: 'V', 15: 'V'}

SUFFIX={8: ' V', 12: ' V'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML completo e PNG nativo 640 × 1480 letti: sezioni schematiche, Q 12 μC su entrambi gli stati, C 1→2 μF, V 12→6 V. Barre origine 150 con larghezze 240/120/180 per 6/3/9/2 V, scala comune 40 coordinate/V. Grafico indipendente x=150+(80/3)V₀, y=1300−(80/3)V, retta fino(470, 1140)=(12, 6)V con κ 2. Origine 0 è limite, zeri 132 a sinistra, punte e label non coperte.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}

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
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='4f908dc4dbbcdba0eebc8ecbd8a249b7c328f789'

PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'

REVIEWED_MODEL_SHA256='42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='138f7466149c2d0c23d001b8f506228ed274364fe2676f829e77f85302ecf991'

REVIEWED_BINDINGS_SHA256='6d85b4aef117211f90750d1599a6feab925d7530262f308e379741c9bdab84de'

REVIEWED_CANDIDATES={'AR-u6-dielectric-isolated-voltage-01': '10a21d3c00b267237d80d2787bdbc916ead3d3213a6d2440f1e66d7640abe66b', 'AR-u6-dielectric-isolated-voltage-02': '8f802b4314fd0302a6b914e26ae4dff5feaa99845c3475319ec28f54af0d921e', 'AR-u6-dielectric-isolated-voltage-03': 'c63d5cbda444e76ec468d091b433d068dd0548ca19fe9130152bc7d23a252de8', 'AR-u6-dielectric-isolated-voltage-04': '0561f6b7ea0733001e5cdafdbc344c9f0055d4550e4e64c7e8f0f7244e4b0235', 'AR-u6-dielectric-isolated-voltage-05': '17ed2850bf2cef2bcfd82f408f53175e31b7c6359d0baac1d6cb9dc9bc30839e', 'AR-u6-dielectric-isolated-voltage-06': 'cbec571a31ab4dd8c36985e448cf86b45bb39fa6ccf3785c6d41805f514e9076', 'AR-u6-dielectric-isolated-voltage-07': 'c0a40f37b3b120559be498f2652886b7125b9db23ee15b942961e67f6754df1e', 'AR-u6-dielectric-isolated-voltage-08': 'bd883574efb9a172c4915b446e38c3d5c0a015d7add3ba1d82237406919e8f4e', 'AR-u6-dielectric-isolated-voltage-09': 'c52009d6cf1dafea2cdd47d566e2ca571473dc49fec8c57ec46238a9409ac755', 'AR-u6-dielectric-isolated-voltage-10': '3ca4654cdbc04b7d51db844c08345cacba2d881cae81ffb27eae55639d8865f6', 'AR-u6-dielectric-isolated-voltage-11': 'a3830c43508fe3dd522abc308197457b7fbd94198064b603277c2c6e3026d4b6', 'AR-u6-dielectric-isolated-voltage-12': '214a9b495ebb0ef744be44459d9c1f5a79ab2f1b62fbf5fce1939c279c712b33', 'AR-u6-dielectric-isolated-voltage-13': 'f8ff0c28b67868da0b7d520aa57b038854aedf107121245c0656795600b3275c', 'AR-u6-dielectric-isolated-voltage-14': '65d113dc29228c65ae213dab4c0781fddd5d2b1ae1fe1d5565cd40ec020d0d68', 'AR-u6-dielectric-isolated-voltage-15': '5ba2a0f58513865dd94df8d8ce231e832fb76382a9c72ae4150a802b414dd1ff', 'AR-u6-dielectric-isolated-voltage-16': '2896399bd8ca6c914f89c81b9b0e40d96c257422b056f2cecf85aafb092c8649'}

READ_SOURCE_SHA256={'u6-dielectric-isolated-voltage-01': 'f9f1c2ead8b383acb204772e9d21580255a52814a3940a08ffcebfdb82bdd9e1', 'u6-dielectric-isolated-voltage-02': '643e2705df16f9c05e22c0066d01bd9acc3c4ef8367c33a03a08469f2e3f7fb7', 'u6-dielectric-isolated-voltage-03': '6758a992021f59863cf0f2e98c2701a6f27a0bc6e097dda58cd6432356c7cd0a', 'u6-dielectric-isolated-voltage-04': '14cadc7e999f55c15079a0b6ad107726db5856b7b0cfc6707e140a2fd841481d', 'u6-dielectric-isolated-voltage-05': '6ea09b71034ca51cbb869cf001935d464c49956d1ce8b48f8daf29242d50db1a', 'u6-dielectric-isolated-voltage-06': '99aae21ab8b39f7627b0f175a5a4d443b49974b7468e4471fce25b4273aac84f', 'u6-dielectric-isolated-voltage-07': '72382bbeb5f2b6262c5e41624b173e52bf20f562e498238cc2fc69b0de10e2b4', 'u6-dielectric-isolated-voltage-08': '25c6ed92b329bb2afc37c303c12e17e9cfcf3f55bd12fc80272a0c608443c074', 'u6-dielectric-isolated-voltage-09': 'f0037d908673c5b1e5b6097d5483eff096a369884d85022f07cc3c2c24109e1e', 'u6-dielectric-isolated-voltage-10': '9ec80763dcf3a14d420be477cc075f2ae1fa18cd198257d7e0fc987f2f6e6c0c', 'u6-dielectric-isolated-voltage-11': '0bd2f77670ebc1f0072643cc634d8277a5e263d03388d3ae9090fe6a5fe94012', 'u6-dielectric-isolated-voltage-12': 'fc21a6bc29d84911eed0fff6b967c779c821c4623aeaee60f6d26f49b02a566b', 'u6-dielectric-isolated-voltage-13': '6e47aff32b4cf1c4627a6d4fce871bd384b05227718c4515b272b43b8aca8a66', 'u6-dielectric-isolated-voltage-14': 'a8dca5b83eb6640560d0bad5d6fa41fcd2816d573295277f07867a8dd516fb54', 'u6-dielectric-isolated-voltage-15': 'f6467a4083caf129e01bfa27610925cf5cbc6b58029ba69d538deffad1f35c0c', 'u6-dielectric-isolated-voltage-16': '4c196e71597380590f362f3d876f1f004b22709a78ef0bb2da5f3eec76249d6b'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'
