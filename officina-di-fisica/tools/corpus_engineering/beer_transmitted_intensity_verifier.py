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
FAMILY='beer-transmitted-intensity'
EXPECTED_IDS={'AR-u7-beer-transmitted-intensity-05', 'AR-u7-beer-transmitted-intensity-14', 'AR-u7-beer-transmitted-intensity-11', 'AR-u7-beer-transmitted-intensity-09', 'AR-u7-beer-transmitted-intensity-07', 'AR-u7-beer-transmitted-intensity-02', 'AR-u7-beer-transmitted-intensity-10', 'AR-u7-beer-transmitted-intensity-16', 'AR-u7-beer-transmitted-intensity-04', 'AR-u7-beer-transmitted-intensity-12', 'AR-u7-beer-transmitted-intensity-06', 'AR-u7-beer-transmitted-intensity-08', 'AR-u7-beer-transmitted-intensity-03', 'AR-u7-beer-transmitted-intensity-01', 'AR-u7-beer-transmitted-intensity-15', 'AR-u7-beer-transmitted-intensity-13'}
REVIEWED_SKILLS={1: 'C5-L07', 2: 'C5-L07', 3: 'C5-L07', 4: 'C5-L07', 5: 'C5-L07', 6: 'C5-L07', 7: 'C5-L07', 8: 'C5-L07', 9: 'C5-L07', 10: 'C5-L07', 11: 'C5-L07', 12: 'C5-L07', 13: 'C5-L07', 14: 'C5-L07', 15: 'C5-L07', 16: 'C5-L07'}

@lru_cache(maxsize=1)
def oracle():
    I,m,d,k1,k2,delta=sp.symbols('I m d k1 k2 delta',positive=True)
    unique([I*sp.exp(m*d),I*sp.exp(-m*d),sp.exp(m*d)/I,I*m*d,I/(m*d)],I*sp.exp(m*d))
    unique([k1*2**(-delta),k1*k2,k1/k2,2**(-k1*delta),k1+k2],k1*2**(-delta))
    d=model.primary_only_derivations()[246]
    out=[d[n]for n in range(1,17)]
    out[1]='W/m²'
    out[2]='Minore tasso di fotoni, stessa energia di ciascun fotone trasmesso'
    out[3]='Da 32 a 16 mW/m²'
    out[8]='I₀ = I exp(μd)'
    out[9]='κ₁ 2^(−δ)'
    return out

MANUAL=['Pongo x=d/(1 cm)>0. Con μ=(ln 2)cm⁻¹, μd=x ln 2 e I=I₀exp(−x ln 2)=I₀2⁻ˣ. Per I₀64 mW/m², x 1, I=64/2=32 mW/m². Non serve il valore decimale di ln 2; il modello ha radiazione monocromatica, mezzo omogeneo e nessuna riflessione o sorgente interna.', 'Intensità W/m², potenza per area normale al fascio. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.', 'Nel modello di puro assorbimento monocromatico, diminuisce il flusso di fotoni trasmessi, mentre i fotoni rimasti mantengono la frequenza e l’energia hν della componente trasmessa nel mezzo considerato. Non si descrive un progressivo impoverimento energetico di ogni fotone. Non aggiungo emissione, conversioni di frequenza o selezione spettrale non dichiarate.', 'A d 1 cm fissato la trasmissione è 1/2. I₀64→32 mW/m² porta I 32→16 mW/m²: dipendenza lineare da I₀, non dalla potenza nell’esponente dello spessore.', 'I=I₀2⁻ˣ dà I₀=I 2ˣ. Con I 32 mW/m², x 1 si ritrova I₀64 mW/m². Si richiede I₀>I per d>0 e μ>0.', 'Dalla frazione I/I₀=32/64=1/2 riconosco 2⁻ˣ=2⁻¹, quindi x 1 e d 1 cm. In generale x=log₂(I₀/I); il ramo d>0 richiede 0<I<I₀. Nessun logaritmo approssimato.', 'A I₀64 invariato, d 1→2 cm dà I 32→16 mW/m². Rapporto 1/2: lo spessore doppio aggiunge un altro fattore 1/2, non divide linearmente una formula I∝1/d.', 'Proposto 64 meno corretto 32=+32 mW/m². Sessantaquattro è l’intensità incidente, prima dell’assorbimento. Il rapporto 2 sarebbe puro e non lo scarto.', 'Isolo I₀=Iexp(μd)=I 2ˣ, con x=d/(1 cm). Nell’esponente si usa la profondità ottica adimensionale μd; non il valore di una lunghezza con unità ignorate. I, I₀ positive e I₀>I per d>0.', 'Da I_B=κ₁I₀ exp(−μκ₂d) e I_A=I₀exp(−μd), il rapporto èκ₁exp[−μ(κ₂−1)d]=κ₁2^{−(κ₂−1)x}. La scalatura dello spessore non produce semplicemente 1/κ₂; entrambi i processi mantengono stesso μ.', 'A:64/2=32 mW/m². B:32/4=8 mW/m². Rapporto 8/32=1/4. Il dimezzamento di I₀ e l’ulteriore dimezzamento dovuto allo spessore si moltiplicano.', 'Media(32+8)/2=20 mW/m². Agli ingressi medi I₀48, d 3/2 cm il modello darebbe 48/2^{3/2}=12√2 mW/m². È un valore esatto diverso:20>12√2 perché 400>288. Lo spessore medio 3/2 cm è fisicamente ammesso, ma non realizza la media delle uscite.', 'Bersaglio(1/4)·32=8 mW/m², nuova I₀32. Quindi 2⁻ˣ=8/32=1/4=2⁻²: d_B 2 cm e rapporto d_B/d_A=2. La potenza di due rende l’inversa manuale esatta.', 'Riferimento I 32 e lettura 96: guadagno 3 per(mW/m²). Lettura 24→I 8 mW/m². Con d 2 cm, I₀=8·4=32 mW/m². Non si usa il display 24 direttamente come intensità.', 'Riferimenti I 32, 8 e letture 65, 17 danno guadagno(65−17)/(32−8)=2 e offset 1. Lettura 33→I 16 mW/m²; d 1 cm richiede I₀32 mW/m². Primo offset, poi guadagno, poi inversa.', 'Caso autonomo: metà area attraversa d, metà d+1 cm. Con x=d/(1 cm), intensità media raccolta=[64·2⁻ˣ+64·2^{−x−1}]/2=48·2⁻ˣ. La lettura 6 impone 2ˣ=8, x 3, d 3 cm. Le due zone trasmettono 8 e 4 mW/m² con media 6. Sono percorsi affiancati in parallelo sulle aree, non due strati attraversati in successione.']

DISTRACTORS=['32=64/2; 64 ignora, 128 amplifica, 16 richiede 2 cm.', 'W/m² potenza per area; W totale, J energia, m^-1 coefficiente, s^-1 tasso.', 'Rimozione di fotoni diretti con hf invariata; flusso areale cala. Frequenza dimezzata e perdita continua cambierebbero il modello, energia superstiti non cresce e h non dipende da d.', '32→16 a stessa frazione 1/2.64 inverte, 8 applica dimezzamento extra, 32 ignora, zero non segue ingresso positivo.', 'I₀64; 16 riattenua, 32 richiedeμd 0, 128 prediceI 64.', 'd 1 cm dal rapporto 2.2→16, 1/2→32√2, 0→64 mW/m².', '1/2=16/32.2 reciproco, 1/4 IB/I₀, 1 ignora, 0 perdita additiva errata.', '+32 mW/m²=64−32; −32 ordine, 2 rapporto, 64 proposta, 0 accetta.', 'Iexpμd: segno contrario riattenua, 1/I inverso dimensionale, μd e 1/(μd) non esponenziali.', 'κ₁2^-δ; κ₁κ₂ eκ₁/κ₂ sono false leggi lineari in d; spostareκ₁ in esponente alteraμ; somma fallisce caso identico.', '1/4=8/32.4 reciproco, 1/2 una sola variazione, 1/8 IB/I₀A, 1 ignora.', '20 media 32/8; 12√2 ingressi medi, 40 somma, 12 semidifferenza, 8 B.', 'dB 2 cm, rapporto 2.1→I 16, 4→2; 1/2 reciproco, 1/4 copia target.', 'g 3, D 24→I 8, d 2→I₀32.96 prediceD 72, 8→D 6, 128→D 96.', 'g 2, b 1, D 33→I 16, d 1→I₀32.33 prediceD 34, 64 ometteg, 16 copia uscita.', 'Vie metàarea: (8+4)/2=6 a d 3 cm; 2→12, 4→3. Attenuare dmedio non è media delle uscite.']

ASSUMPTIONS=['Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.', 'Assorbimento del fascio monocromatico diretto, nessun contributo secondario raccolto. Frequenza invariata dei fotoni trasmessi; flusso areale è ṅ_A, con unità s^-1 m^-2.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Fascio diretto monocromatico, incidenza normale, strato omogeneo soltanto assorbente, μ=(ln 2)cm⁻¹ costante, d>0. Nessuna riflessione o radiazione secondaria raccolta; fascio incidente positivo. Nel 16 aree uguali affiancate, non strati successivi.', 'Due metà uguali della sezione, stesso ingresso uniforme 64 mW/m²; percorsi d e d+1 cm affiancati, μln 2/cm, rivelatore integra intera area. Nessun mescolamento laterale.']

UNITS={1: 'milliwatt/meter**2', 2: 'watt/meter**2', 3: 'watt/meter**2', 4: 'watt/meter**2', 5: 'milliwatt/meter**2', 6: 'centimeter', 7: '', 8: 'watt/meter**2', 9: 'watt/meter**2', 10: '', 11: '', 12: 'watt/meter**2', 13: '', 14: 'milliwatt/meter**2', 15: 'milliwatt/meter**2', 16: 'centimeter'}

NUMERIC_UNITS={1: 'mW/m²', 5: 'mW/m²', 6: 'cm', 14: 'mW/m²', 15: 'mW/m²', 16: 'cm'}

SUFFIX={8: ' mW/m²', 12: ' mW/m²'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e nuovo native completo 640 × 1600 letti. Barre 320/160/80/40 da 150 per 64/32/16/8 mW/m², scala 5 coordinate/(mW/m²). Curva x=150+110 d[cm], y=1010−5 I[mW/m²]: punti(150, 690), (260, 850), (370, 930), (480, 970) seguono 64·2^-d. Pannello delle due aree ha riquadri uguali 210 × 80, uscite 8/4 e barre 240/120/180 per 8/4/6 alla stessa scala 30. La via più spessa non è in serie.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'NO_STUDENT_CALCULATION'}

CANDIDATE_REF='539e12af7cb128b8d7748915424b37c8ab988ac1'

PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'

REVIEWED_MODEL_SHA256='c74b1d7f639531452c09fc4dc017b6c42d6ca298f58957e09e372092f0ca4b47'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='85d65913662196431d8c5b0c6e50871f00889958b943d085bf4e6a2e217d6168'

REVIEWED_BINDINGS_SHA256='4b2dc46140ccc363476df18cc55185d916e99bc18cae90d4bc322e856bd28478'

REVIEWED_CANDIDATES={'AR-u7-beer-transmitted-intensity-01': '131c0d84cd80421555630895d280239bd032fded1a162d817813fc44ceaa758f', 'AR-u7-beer-transmitted-intensity-02': '6a43b9c019924d8ffa6d7a74f3e6eb8b3677ec9064d6b7363577a698906bcb7c', 'AR-u7-beer-transmitted-intensity-03': '8444b8205de2efff15971e17afd9f9cd57078278b8ec257a0ba5097cabb7270c', 'AR-u7-beer-transmitted-intensity-04': '437a5961bc00152bd99a5b124a0f3a77861b5c8e834bff3e9d1576feb7556680', 'AR-u7-beer-transmitted-intensity-05': '1824981fe9918e30af99137dbef2ec5a41fd486ac2dbc90fa36cba6ba97ffa8e', 'AR-u7-beer-transmitted-intensity-06': 'dcb4e4d57776b6060da2ffb2ad4a5764fcdc3252e5dd21012288bd54ff73f938', 'AR-u7-beer-transmitted-intensity-07': '33336f4725bcda703253e30967306143ba180207392ce7c96b3dc4b9f50a8556', 'AR-u7-beer-transmitted-intensity-08': '997d1cede3c4240140b9cd2af9838e2ef2dc4694987fb7ae58d371ce4b495f23', 'AR-u7-beer-transmitted-intensity-09': '730252ec635cd5154a72a55557d549ec10860eb5cfa9879e77778a5054acc461', 'AR-u7-beer-transmitted-intensity-10': '8cb04a354f746f759b7893f2dd48e67236d9a9b6ea1c24cd3a4aa668b035bb17', 'AR-u7-beer-transmitted-intensity-11': 'eae324acbca8e06608c0c205fed5b30cbce5aaa8da7f4a0d163bf461d9dd9e73', 'AR-u7-beer-transmitted-intensity-12': '162d0bfc18997f54a91525c0298baf274786c4282247fc9473f0c7f602eb86d4', 'AR-u7-beer-transmitted-intensity-13': 'bd48303074c7dacb3ed15ac3edfe8c03e6fbd15db30ab11a9452f7f211c08557', 'AR-u7-beer-transmitted-intensity-14': 'd0abf1839f803fdb19e78c18b76c0cf3f6f1c9d72feef758f25b26878361c912', 'AR-u7-beer-transmitted-intensity-15': 'adbdb53b4cf01b8d310b38e62276018599599c01a0e37ebe165a5dbc0951daf6', 'AR-u7-beer-transmitted-intensity-16': 'eddd61acdc6389cfbd8b7aab6f8efed252fee88fdda8ce690a6ea2d7c8574bcb'}

READ_SOURCE_SHA256={'u7-beer-transmitted-intensity-01': 'b8b092b735bf27f04745aedd61f8313d05c4ae661928d22485446870078ac70e', 'u7-beer-transmitted-intensity-02': 'bdff9a07842749fb8b2fce75655da4af531490b27953264f49d7ab952c62f478', 'u7-beer-transmitted-intensity-03': '1ee5109e710a86e6210a8c552d7df05920caafc717fd68258311718febc85a58', 'u7-beer-transmitted-intensity-04': 'ddc98e76ddafb7c7a8eea63ae5e98eafdf4c0ec8abc400ebb71d6a997915bfac', 'u7-beer-transmitted-intensity-05': 'b01397b9da1ec623bdbd15bafb283270d09da48477dc4d7011de2a7e3ce02011', 'u7-beer-transmitted-intensity-06': 'f86be70ac8a02e27d3b04f88a3cd38029a752cb271d8bea0f287e852671d4b83', 'u7-beer-transmitted-intensity-07': '76aff2f7613c3c968d7f1b93f86df03d576386100c589d2d1a7add520df90a5d', 'u7-beer-transmitted-intensity-08': '900e5e222cde41b714c939d639795690dffecad4f7995afeb853a988f46c602c', 'u7-beer-transmitted-intensity-09': 'ac593898f134942339b3156ccae4cf598a466c0619c4e414f5e4d7a551b5eb27', 'u7-beer-transmitted-intensity-10': '19a5fcb36827fa7e1cbe811aa664dbd3ac4890f3e690d6c3f2cd8cf94544397b', 'u7-beer-transmitted-intensity-11': '739095b8a5c9761670fa448560d6f1b1735345e638d0fe2e1d66786b7178cd38', 'u7-beer-transmitted-intensity-12': '9e5e092beb295894770b91899504512ddfe65b05d29e70697cf03b62c54a385d', 'u7-beer-transmitted-intensity-13': '858b362921114ba4a240fc055da3f16d44c6c4853303d845536d93f7d1602be9', 'u7-beer-transmitted-intensity-14': 'acdd08c43f472700efb9680a08a9e88727b130178ce0a90a2218bec0e2cbe5bb', 'u7-beer-transmitted-intensity-15': 'bb79c8ffcb0c159b091891f6be1bc0ad0fd0f44bc5f02c230eb9458a67e78c2c', 'u7-beer-transmitted-intensity-16': 'e0e0aa49881eec389e336ee2cbcfd32054d7a099f33341d4759d247ab797113a'}

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
