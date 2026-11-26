"""Independent source-first magnetic laws; no candidate authoring imports.
All80 source-prompt derivations and five numerical models frozen before candidate reading.
Complete final text, distractors, physical hypotheses and full native SVG read separately.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
import hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b'
CANDIDATE_REF='b3e15de8c92ed04ae12fcf83a41dc581b480a196'
PRIMARY_SHA256='51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkills': ['C4-L09'], 'actualLessonPrerequisites': {'C4-L09': ['C4-L02', 'C4-L05'], 'C4-L10': ['C4-L05', 'C4-L09']}, 'specialCasePrimarySkill': {}}
FAMILY='force-current-wire'
BATCH='force-current-wire-230'
ASSET_NAME='force-current-wire-progressive.svg'
REVIEWED_PACKAGE_SHA256='1b84eb48f67e15465f23e1d9a7c78cfd5bdaa568e13c38edebb5044bab01b2e8'
REVIEWED_BINDINGS_SHA256='6bf66128427c3566c3bb2ad81c2487025ef48b483ded9f0261aca87a72be56a0'
SOURCE_REFERENCE='Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.'
FALSE_PROOF='Il modulo della forza sul tratto rettilineo raddoppia se si dimezza la corrente a campo e geometria fissati.'
SVG_MUTATION=(b'width="300"', b'width="301"')
SVG_LABEL_MUTATION=(b'F = 60 mN', b'F = 600 mN')
EXPECTED_MAPPING={1: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 2: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 3: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 4: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 5: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 6: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 7: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 8: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 9: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 10: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 11: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 12: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 13: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 14: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 15: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 16: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09'])}
NUMERIC_UNITS={1: 'mN', 5: 'A', 6: 'cm', 14: 'A', 15: 'A'}
OPTION_SUFFIX={7: '', 8: ' mN', 11: '', 12: ' mN', 13: '', 16: ' cm'}
UNITS={1: 'millinewton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'ampere', 6: 'centimeter', 7: 'dimensionless', 8: 'millinewton', 9: 'ampere', 10: 'dimensionless', 11: 'dimensionless', 12: 'millinewton', 13: 'dimensionless', 14: 'ampere', 15: 'ampere', 16: 'centimeter'}
MANUAL=['La forza sul tratto rettilineo è il modulo di Iℓ×B: F=BIL perché filo e campo sono perpendicolari. Convertendo 3 cm in 3/100 m, F=1·2·3/100 N=6/100 N=60 mN. È la forza sul segmento, non necessariamente la risultante su un circuito chiuso.', 'Una forza si esprime in newton: N=kg·m/s². Il millinewton è 10⁻³ N e conserva la stessa dimensione. Tesla, ampere e lunghezza compaiono nel prodotto BIL, non sono separatamente unità di forza.', 'Il prodotto vettoriale dà F=BIL sin 90°=BIL. Se i simboli denotano i soli valori numerici nelle unità richieste, F/(mN)=10[I/(A)][L/(cm)]. Il fattore 10 nasce da 10⁻² m/cm e 10³ mN/N; non è un fattore fisico adimensionale da usare indiscriminatamente con simboli SI.', 'A B e L fissati, F è proporzionale a I. Passando da 2 A a 1 A si passa da 60 mN a 30 mN: F_B/F_A=1/2. La linearità riguarda il modulo nelle condizioni perpendicolari assegnate.', 'Da F=BIL si ottiene I=F/(BL). In SI, I=(60/1000 N)/[(1 T)(3/100 m)]=2 A. Il denominatore è positivo e non nullo nel dominio dichiarato.', 'Isolo L=F/(BI). La sostituzione dà (60/1000 N)/[(1 T)(2 A)]=3/100 m=3 cm. La conversione finale è necessaria perché il quesito chiede centimetri.', 'Con B e I invariati il rapporto delle forze coincide con quello delle lunghezze: F_B/F_A=L_B/L_A=1/3. Separatamente si trovano 20 mN e 60 mN; il rapporto non ha unità.', 'Il valore fisico corretto è 60 mN. Lo scarto ordinato come proposto meno corretto è 120−60=+60 mN. Il segno positivo identifica la sovrastima, non una direzione spaziale della forza.', 'Dividendo F=BIL per BL, positivo, si ottiene I=F/(BL). Per i valori numerici normalizzati si ha I/(A)=[F/(mN)]/{10[L/(cm)]}. Scrivere soltanto F/L con grandezze fisiche ometterebbe B e altererebbe le dimensioni.', 'Nei due stati B, orientazione e geometria rettilinea restano le stesse. Dividendo B(κ₁I)(κ₂L) per BIL si cancellano tutti i parametri originari e resta κ₁κ₂. I fattori sono positivi e il denominatore è non nullo.', 'Calcolo prima entrambe le forze: F_A=10·2·3=60 mN e F_B=10·1·4=40 mN. Il rapporto F_B/F_A è 40/60=2/3. La variazione della lunghezza impedisce di usare soltanto il rapporto delle correnti.', 'Le due letture sono 60 e 40 mN e hanno uguale peso: la media è (60+40)/2=50 mN. Come controllo di non linearità congiunta, il modello agli ingressi medi I=3/2 A e L=7/2 cm dà 10·(3/2)·(7/2)=105/2 mN; media delle uscite meno questo valore è −5/2 mN. Non si scambiano i due procedimenti.', 'La forza richiesta è (2/3)·60=40 mN. Con I_B=1 A, 10·1·L_B/(cm)=40 impone L_B=4 cm. Il rapporto cercato è 4/3; sostituendo si recupera esattamente il fattore 2/3 nell’uscita.', 'Il riferimento dà F=60 mN e S=180, quindi il guadagno è 3 unità strumentali per mN. La nuova lettura S=120 corrisponde a F=40 mN; con L=4 cm, I=40/(10·4) A=1 A. Le unità strumentali restano le medesime, non sono implicitamente newton.', 'I riferimenti fisici sono 60 e 40 mN. Sottraendo le due equazioni di taratura: 121−81=a(60−40), dunque a=2 unità strumentali/mN; b=121−2·60=1 unità strumentale. S_C=401 dà F_C=(401−1)/2=200 mN. Con L_C=5 cm si ricava I_C=200/(10·5)=4 A.', 'Pongo l=L/(1 cm)>0; il vincolo dimensionato è I=(2/3 A/cm)L e quindi I/(A)=2 l/3. La legge normalizzata dà 60=10·(2 l/3)l=(20/3)l², perciò l²=9. Il dominio seleziona l=3, cioè L=3 cm e I=2 A. La radice negativa è estranea al ramo fisico.']
DISTRACTORS=['Sei mN perde un fattore dieci nella conversione complessiva; 6000 mN corrisponde a usare 3 m invece di 3 cm. Centoventi aggiunge un fattore due. Calcolo SI indipendente: 2·3/100 N=60 mN.', 'A, T, J e C sono corrente, campo, energia e carica. mN è un prefisso di newton e mantiene la dimensione di forza. Il lavoro richiederebbe anche lo spostamento orientato.', 'Il fattore dieci nasce dalla conversione di centimetri in metri e newton in mN. Dividere per i o λ inverte una dipendenza diretta; i² introduce una diversa legge, non giustificata dal filo in campo esterno fissato.', 'Centoventi inverte la proporzionalità, quindici applica il quadrato di 1/2, sessanta ignora il nuovo I e zero viola I>0 e perpendicolarità.', 'Venti A omette dieci nella forma numerica. Un mezzo A ricostruisce 15 mN, sessanta A confonde il numero di forza con una corrente prima dell’inversa.', 'Trenta cm omette il coefficiente dieci e dà 600 mN. Un terzo cm dà 20/3 mN; due cm dà 40 mN. Tre cm ricostruisce esattamente il dato.', 'Tre è il rapporto inverso; 1/9 e nove importano un quadrato, uno ignora la lunghezza diversa. I due moduli verificati sono 20 e 60 mN.', '−60 mN scambia l’ordine, due è il rapporto puro, 120 copia la proposta e zero la accetta. Nessuno rappresenta lo scarto richiesto di 60 mN.', 'FL/B ha A·m², BL/F A⁻¹, F/B A·m e F/(BL²) A/m. Solo F/(BL) isola una corrente nel dominio positivo.', 'I quozienti rendono inverso un fattore diretto. κ₁² modifica la legge, mentre κ₁+κ₂ dà due in prove identiche. Il rapporto corretto è il prodotto dei fattori.', '3/2 è reciproco; 1/2 segue solo I e 4/3 solo L. Uno non ricostruisce i prodotti 60 e 40 mN.', '105/2 mN usa gli ingressi medi, cento è la somma e dieci la semidifferenza. Zero non media questi due moduli positivi. La differenza dal valore ai dati medi è −5/2 mN.', '3/4 inverte il rapporto, 2/3 copia il bersaglio della forza e 1/2 segue il solo I. Sei cm, implicati dal fattore due, darebbe 60 mN, non 40.', 'Tre A usa il display 120 come 120 mN. Quaranta copia la forza decodificata e 1/4 A dà F=10 mN e D=30. L’uscita positiva da decodificare è 40 mN.', '401/100 A omette l’offset e produce D=402. Otto A omette il guadagno dopo aver sottratto b. Duecento A copia il numero di forza senza dividere per BL.', 'La radice −3 cm è esclusa dal modulo positivo. Nove cm dà 540 mN dal vincolo, due cm dà 80/3 mN. Il dato assoluto F fissa la scala e non lascia infinite lunghezze.']
ASSUMPTIONS=['Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.', 'Tratto rettilineo finito e interamente immerso in campo esterno uniforme di modulo 1 T, corrente continua positiva mantenuta, angolo retto. La forza richiesta è quella magnetica sul tratto, non la risultante con altre forze o sull’intero circuito. L è in centimetri e F in millinewton, mentre F=BIL usa unità coerenti; il coefficiente normalizzato dieci conserva la provenienza dimensionale. Medie e vincoli descrivono preparazioni distinte, display continuo adimensionale.']
PEDAGOGY=['Legge motivata prima della sostituzione, unità e variabile richiesta distinte.', 'Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.', 'Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.', 'Confronto controllato a parametro fissato, non evoluzione dinamica inventata.', 'Prima inversa ricavata e reinserita nella legge diretta.', 'Seconda inversa con denominatori positivi e distinzione fra modulo e verso.', 'Due uscite ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto preservato, separato dal rapporto puro.', 'Inversa simbolica con coefficienti dimensionali espliciti.', 'Fattori inseriti nella legge effettiva prima di semplificare.', 'Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.', 'Media delle uscite distinta da modello agli ingressi medi e da media temporale.', 'Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.', 'Guadagno del display rimosso prima dell’inversa fisica.', 'Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.']
EXPECTED_IDS={'AR-u6-force-current-wire-04', 'AR-u6-force-current-wire-02', 'AR-u6-force-current-wire-05', 'AR-u6-force-current-wire-06', 'AR-u6-force-current-wire-16', 'AR-u6-force-current-wire-11', 'AR-u6-force-current-wire-10', 'AR-u6-force-current-wire-01', 'AR-u6-force-current-wire-13', 'AR-u6-force-current-wire-07', 'AR-u6-force-current-wire-09', 'AR-u6-force-current-wire-15', 'AR-u6-force-current-wire-14', 'AR-u6-force-current-wire-12', 'AR-u6-force-current-wire-03', 'AR-u6-force-current-wire-08'}
REVIEWED_CANDIDATES={'AR-u6-force-current-wire-01': '2effafaf995615de7333fe5bee2a9340f3d0ed7f95e23835eb226196345ed2d7', 'AR-u6-force-current-wire-02': '9cfa0fd3656207a35d0f0386e403cf88ecf662b6ebe8d1dde9e03140ffc71b05', 'AR-u6-force-current-wire-03': '8656786ccab58e6d93ddaa2d9a7ebe2e39e5f16cea6ec6ec57074f3866225e0e', 'AR-u6-force-current-wire-04': 'f9918a710d5427611d659bc4ecc8d46cec9a58a08c2af4fbef010ec140d8c398', 'AR-u6-force-current-wire-05': '91fefc29d5e79ad98ee3e51e684706de1d9b26d90b8b5b26ebcf68019f95ab09', 'AR-u6-force-current-wire-06': '05e71dc52dac30f4b65b030aa70d0325da3d177464b0e4ee826eb73235fcbd21', 'AR-u6-force-current-wire-07': 'c819b58cc7501eff1c1743a7fe5fee2410cde2f0e8082aba61a99d1df25eec58', 'AR-u6-force-current-wire-08': '926e2d4f2b3658807888b1cbd07269d8ccb5d4b3cf20f79da7e4e169bddf965b', 'AR-u6-force-current-wire-09': '2e890bd02bcf846f0a93e49aeb345f31372bdc61aa13de0ab503d1daa8f1c114', 'AR-u6-force-current-wire-10': 'd091df13b8f05cc268382f1605645fd0b36060197d59f5ed4271bdc6b326b842', 'AR-u6-force-current-wire-11': '03db89f52d08a9905802b3dbbacdafc62b7664feb56337d05b69bab13ffae7f2', 'AR-u6-force-current-wire-12': 'd983190e98afe155cbbe3304610353cc71ea02578df223b067f19e223186ad90', 'AR-u6-force-current-wire-13': 'a8035ed3ce084f7f7c16b7082159e1eebda24f4d955e3cf34f9a85bd4e9835f5', 'AR-u6-force-current-wire-14': '7bcc5a9c893a36f0a48eb7146272fd4c6e5f3c3f59b8e36a7213edf755d25d28', 'AR-u6-force-current-wire-15': '8c288847571a3665478ed9d12981bc033ff6fb5df5498f755e12b54cfc921a5f', 'AR-u6-force-current-wire-16': 'b0345e39976d7e48cbc71a44e09aade768a43638b3beb689c13ff476603c3f8c'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(600, 1), Fraction(300, 1), Fraction(27, 1)), (Fraction(150, 1), Fraction(770, 1), Fraction(250, 1), Fraction(27, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1)), (Fraction(150, 1), Fraction(685, 1), Fraction(200, 1), Fraction(27, 1))}
REQUIRED_PATHS={'M88 288L112 312M88 312L112 288', 'M0 0L8 4L0 8Z', 'M200 345V365M460 345V365M200 355H460'}
REQUIRED_CIRCLES={(Fraction(100, 1), Fraction(300, 1), Fraction(18, 1)), (Fraction(430, 1), Fraction(1120, 1), Fraction(4, 1)), (Fraction(150, 1), Fraction(1300, 1), Fraction(4, 1))}
REQUIRED_LINES={(Fraction(330, 1), Fraction(300, 1), Fraction(330, 1), Fraction(165, 1)), (Fraction(150, 1), Fraction(1305, 1), Fraction(150, 1), Fraction(1040, 1)), (Fraction(200, 1), Fraction(300, 1), Fraction(460, 1), Fraction(300, 1)), (Fraction(145, 1), Fraction(575, 1), Fraction(145, 1), Fraction(825, 1)), (Fraction(150, 1), Fraction(1300, 1), Fraction(430, 1), Fraction(1120, 1)), (Fraction(145, 1), Fraction(1300, 1), Fraction(520, 1), Fraction(1300, 1)), (Fraction(220, 1), Fraction(240, 1), Fraction(450, 1), Fraction(240, 1))}
REQUIRED_SVG_TEXTS=('Corrente, tratto immerso e forza', '1 · B = 1 T, perpendicolare al filo', 'I = 2 A', 'F = 60 mN', 'B entrante', 'L = 3 cm', 'La lunghezza orientata segue la corrente.', 'Frecce schematiche: grandezze con unità diverse.', '2 · Due letture e la loro media', 'A', '60 mN', 'B', '40 mN', 'media', '50 mN', 'A: I = 2 A, L = 3 cm · B: I = 1 A, L = 4 cm', '3 · Solo L = 3 cm e B = 1 T', '0', '2', '60', 'I (A)', 'F (mN)', 'Tratto mostrato: 0 < I ≤ 2 A.', 'Barre e grafico hanno scale indipendenti.')
GEOMETRY_REVIEW='XML e PNG indipendente completo 640×1480 letti. I verso destra e B entrante danno F verso l’alto; vettori di grandezze diverse dichiarati schematici. Barre da x 150 lunghe 300/200/250 rappresentano 60/40/50 mN a 5 coordinate/mN. Grafico con origine(150, 1300), 140 coordinate/A e 3 coordinate/mN: punto(430, 1120) per I 2 A, F 60 mN; origine aperta e dominio 0<I≤2 A. Scale dei due pannelli quantitative esplicitamente distinte.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def _finite_exact(value,positive=False):
    """Accept explicit finite real exact numbers, never binary floats or symbols."""
    if type(value) is int:
        exact=sp.Integer(value)
    elif isinstance(value,Fraction):
        exact=sp.Rational(value.numerator,value.denominator)
    elif isinstance(value,sp.Expr):
        exact=value
    else:
        raise ValueError('Finite real exact numeric input required; binary floats are forbidden')
    if (exact.is_number is not True or exact.free_symbols or exact.atoms(sp.Float)
        or exact.is_real is not True or exact.is_finite is not True):
        raise ValueError('Finite real exact numeric input required; binary floats are forbidden')
    if positive and exact.is_positive is not True:raise ValueError('Strict positive finite real exact physical magnitude required')
    return exact
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    values=tuple(_finite_exact(x) for x in (first,second,reference_reading,new_reading,reading_a,reading_b,third_reading))
    first,second,reference_reading,new_reading,reading_a,reading_b,third_reading=values
    if first.is_positive is not True or second.is_positive is not True or sp.simplify(first-second)==0:
        raise ValueError('Two distinct positive finite physical calibration references required')
    if not isinstance(unit,str) or not unit:raise ValueError('Explicit physical unit required for calibration')
    try:SI.Unit(unit)
    except Exception as error:raise ValueError('Known physical unit required for calibration') from error
    gain=sp.simplify(reference_reading/first)
    affine_gain=sp.simplify((reading_b-reading_a)/(second-first))
    _finite_exact(gain,positive=True);_finite_exact(affine_gain,positive=True)
    offset=sp.simplify(reading_a-affine_gain*first)
    decoded=sp.simplify(new_reading/gain);third=sp.simplify((third_reading-offset)/affine_gain)
    _finite_exact(offset);_finite_exact(decoded,positive=True);_finite_exact(third,positive=True)
    physical=(SI.Quantity(reference_reading,'')/SI.Quantity(first,unit)).to('1/('+unit+')')
    if sp.simplify(sp.sympify(physical.magnitude)-gain)!=0:raise ValueError('Independent exact calibration dimensions inconsistent')
    return gain,offset,decoded,third
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    # Explicit relevant SI-prefix table, no second arithmetic parser or arbitrary unit evaluator.
    units={' m/s':('velocity',sp.Integer(1)),' cm/s':('velocity',sp.Rational(1,100)),
      ' mN':('force',sp.Rational(1,1000)),' N':('force',sp.Integer(1)),
      ' cm':('length',sp.Rational(1,100)),' m':('length',sp.Integer(1)),
      ' mg':('mass',sp.Rational(1,10**6)),' kg':('mass',sp.Integer(1)),
      ' m²':('area',sp.Integer(1)),' cm²':('area',sp.Rational(1,10**4)),
      ' T':('field',sp.Integer(1)),' mT':('field',sp.Rational(1,1000)),
      ' Wb':('flux',sp.Integer(1)),' mWb':('flux',sp.Rational(1,1000)),
      ' s':('time',sp.Integer(1)),' ms':('time',sp.Rational(1,1000)),
      ' V':('voltage',sp.Integer(1)),' A':('current',sp.Integer(1)),
      '':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

def result(current, length):
    """I in A, L in cm, B=1 T; output F in mN from B I (L/100)."""
    current=_finite_exact(current,positive=True);length=_finite_exact(length,positive=True)
    return sp.simplify(10*current*length)
def inverse_first(force, length):
    force=_finite_exact(force,positive=True);length=_finite_exact(length,positive=True)
    return sp.simplify(force/(10*length))
def inverse_second(force, current):
    force=_finite_exact(force,positive=True);current=_finite_exact(current,positive=True)
    return sp.simplify(force/(10*current))
def scaled(current, length, k1, k2):
    current=_finite_exact(current,positive=True);length=_finite_exact(length,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1*k2)
def constrained_length(force):
    """I/(1 A)=(2/3)L/(1 cm), hence F/(1 mN)=(20/3)l²."""
    force=_finite_exact(force,positive=True)
    return sp.sqrt(3*force/20)

@lru_cache(maxsize=1)
def oracle():
    i,l,b=sp.symbols('i l b',positive=True)
    vector=sp.Matrix([l,0,0]).cross(sp.Matrix([0,0,-b]))*i
    assert vector==sp.Matrix([0,b*i*l,0])
    physical=(SI.Quantity(1,'tesla')*SI.Quantity(2,'ampere')*SI.Quantity(Fraction(3,100),'meter')).to('millinewton')
    first=result(2,3);second=result(1,4)
    assert sp.sympify(physical.magnitude)==first==60 and second==40
    fit=calibrate(first,second,180,120,121,81,401,'millinewton')
    assert fit==(3,1,40,200)
    assert (first+second)/2==50 and result(sp.Rational(3,2),sp.Rational(7,2))==sp.Rational(105,2)
    expected=[first,'mN','f = 10 i λ','Da 60 mN a 30 mN',inverse_first(first,3),inverse_second(first,2),result(2,1)/first,120-first,'I = F / (B L)','κ₁ κ₂',second/first,(first+second)/2,inverse_second(sp.Rational(2,3)*first,1)/3,inverse_first(fit[2],4),inverse_first(fit[3],5),constrained_length(first)]
    for n,value in {5:2,6:3,7:sp.Rational(1,3),8:60,11:sp.Rational(2,3),12:50,13:sp.Rational(4,3),14:1,15:4,16:3}.items():assert sp.simplify(expected[n-1]-value)==0
    return expected
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
    if tuple(e.text or '' for e in root.iter() if e.tag.endswith('text'))!=REQUIRED_SVG_TEXTS:
        raise ValueError('Independent physical scale or reviewed SVG quantity labels changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u6-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C4" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
        if row["answer"]["type"]=="numeric" and type(value) is not int:
            errors.append("Independent numeric answer must preserve an exact integer JSON value")
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent physical conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_Lorentz_Newton_electric_work_cyclotron_period_flux_inverse_and_exact_algebraic_calibration",
            "Pint_exact_force_mass_charge_length_field_voltage_flux_time_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u6-magnetism-230-234-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"6da7f76086995a8297ac10bfe608354c6a77a91b"},"primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-magnetism-induction-230-234-primary-source-only.md","sha256":PRIMARY_SHA256}}
def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e or "exact answer or physical unit invalid" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-05","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "physical scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["independentReview"]="PASS_AI"
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed self-certified author provenance accepted")
    cases.append({"case":"author_self_certification_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    # Exactly distinguish near-integer/quarter decimal lexemes after every edition guard is replaced.
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=DECIMAL_REGRESSION_NUMBER-1;row=changed['records'][idx];n=idx+1;wanted=sp.Rational(oracle()[idx])
    scale=10**18;integer=wanted*scale
    assert integer.is_Integer and integer>=0
    quotient,remainder=divmod(int(integer)+1,scale)
    decimal=f"{quotient}.{remainder:018d}"+OPTION_SUFFIX[n]
    previous=row['answer']['value'];row['answer']['value']=decimal
    row['answer']['options']=[decimal if o==previous else o for o in row['answer']['options']]
    links[idx]['candidateSha256']=digest(row);result=retoken(changed,links,row['id'])
    if result['ok'] or 'Independent primary physical exact result mismatch' not in result['errors']:
        raise AssertionError('Near-correct decimal rounded into the accepted exact answer')
    cases.append({'case':'decimal_lexeme_below_float_ulp_rebound_and_retokenized','id':row['id'],'lexeme':decimal,'rejectedBy':result['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed['records']) if r['answer']['type']=='numeric')
    row=changed['records'][idx];row['answer']['value']=float(row['answer']['value'])
    links[idx]['candidateSha256']=digest(row);bad=retoken(changed,links,row['id'])
    if bad['ok'] or 'Independent numeric answer must preserve an exact integer JSON value' not in bad['errors']:
        raise AssertionError('Binary float numeric key accepted after all edition guards replaced')
    cases.append({'case':'numeric_JSON_binary_float_rebound_and_retokenized','id':bad['id'],'rejectedBy':bad['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    uploaded=next(a for a in changed['assets'] if a['name']==ASSET_NAME)
    raw=base64.b64decode(uploaded['data']);before,after=SVG_LABEL_MUTATION;assert before in raw;raw=raw.replace(before,after,1)
    previous=uploaded['id'];uploaded.update(id=sha(raw),data=base64.b64encode(raw).decode())
    for row,b in zip(changed['records'],links):
        for block in row['blocks']:
            if block.get('src')=='/asset/'+previous:block['src']='/asset/'+uploaded['id']
        if ASSET_NAME in b.get('assetChecksums',{}):b['assetChecksums'][ASSET_NAME]=uploaded['id']
        b['candidateSha256']=digest(row)
    with tempfile.TemporaryDirectory(prefix='independent-magnetism-label-mutation-') as directory:
        home=Path(directory)
        for a in changed['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
        tokens={r['id']:s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as error:
                if 'reviewed SVG quantity labels' not in str(error):raise
                cases.append({'case':'wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced','rejectedBy':str(error)})
            else:raise AssertionError('Wrong quantitative label accepted after hostile rebinding')
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
