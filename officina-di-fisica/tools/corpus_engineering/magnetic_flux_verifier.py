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
CANDIDATE_REF='022df919c10dcdf159007018cf0ce0adb089f33e'
PRIMARY_SHA256='51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkills': ['C4-L09', 'C4-L10'], 'actualLessonPrerequisites': {'C4-L09': ['C4-L02', 'C4-L05'], 'C4-L10': ['C4-L05', 'C4-L09']}, 'specialCasePrimarySkill': {'3': 'C4-L09'}}
FAMILY='magnetic-flux'
BATCH='magnetic-flux-234'
ASSET_NAME='magnetic-flux-progressive.svg'
REVIEWED_PACKAGE_SHA256='190ae80c9db40b516607382f819775962e7d610ec626f7aeabd20b5a4328ca35'
REVIEWED_BINDINGS_SHA256='f3ac740476518a32da1a99c6bcb6f6058f3f2fb5ecc6e9c16ad48f2cb16c29ab'
SOURCE_REFERENCE='B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.'
FALSE_PROOF='Il flusso attraverso qualsiasi superficie aperta è necessariamente nullo perché non esistono monopoli magnetici.'
SVG_MUTATION=(b'width="240"', b'width="241"')
SVG_LABEL_MUTATION=(b'\xce\xa6 = BA = 6 Wb.', b'\xce\xa6 = BA = 12 Wb.')
EXPECTED_MAPPING={1: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 2: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 3: ('C4-L09', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 4: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 5: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 6: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 7: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 8: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 9: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 10: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 11: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 12: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 13: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 14: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 15: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10']), 16: ('C4-L10', ['C1-L001', 'C1-L002', 'C4-L02', 'C4-L05', 'C4-L09', 'C4-L10'])}
NUMERIC_UNITS={1: 'Wb', 5: 'T', 6: 'm²', 12: 'Wb', 14: 'T', 15: 'T'}
OPTION_SUFFIX={7: '', 8: ' Wb', 11: '', 13: '', 16: ' m²'}
UNITS={1: 'weber', 2: 'weber', 3: 'weber', 4: 'weber', 5: 'tesla', 6: 'meter**2', 7: 'dimensionless', 8: 'weber', 9: 'tesla', 10: 'dimensionless', 11: 'dimensionless', 12: 'weber', 13: 'dimensionless', 14: 'tesla', 15: 'tesla', 16: 'meter**2'}
MANUAL=['Il flusso è Φ=∫B·n dA. Campo uniforme e normale concorde rendono cosθ=1, quindi Φ=BA=(2 T)(3 m²)=6 Wb. L’angolo nullo è quello con la normale, mentre il campo è perpendicolare al piano.', 'Il flusso magnetico si esprime in weber: Wb=T·m². Tesla misura il campo e m² l’area; il prodotto ha dimensione diversa da ciascuno dei due fattori.', 'Considerando interno ed esterno di un magnete a barra, le linee del campo si completano in anelli chiusi: all’esterno vanno dal polo nord al sud e all’interno ritornano dal sud al nord. Non iniziano né finiscono realmente sui poli. Il flusso netto su una superficie chiusa è nullo; questo non contraddice un flusso positivo attraverso una superficie aperta orientata. Riletta la qualificazione finale del percorso illustrato, distinta da una pretesa universale di linee finite chiuse.', 'Con area e orientazione fisse, Φ è proporzionale a B. Da 2 T a 1 T si passa da 6 a 3 Wb, cioè alla metà. Il segno resta positivo perché il campo resta concorde con la normale.', 'Isolo B=Φ/A. Con Φ=6 Wb e A=3 m² risulta B=2 T. L’area positiva evita la divisione per zero e la scelta della normale mantiene il campo concorde.', 'Da Φ=BA segue A=Φ/B. La sostituzione 6 Wb/(2 T)=3 m² restituisce l’area richiesta. Il campo assegnato è positivo e non nullo.', 'A B costante e normale invariata, il rapporto dei flussi coincide con quello delle aree: Φ_B/Φ_A=1/3. Le uscite sono 2 e 6 Wb. Il rapporto non ha unità e non introduce variazioni dell’angolo.', 'Il flusso corretto è 6 Wb. Con la convenzione proposto meno corretto, lo scarto è 12−6=+6 Wb. È una sovrastima del valore concorde, non un cambiamento della normale.', 'La legge generale è Φ=BA cosθ; qui θ=0 rispetto alla normale, perciò Φ=BA e B=Φ/A. Non si applica sinθ né si misura θ dal piano. Il dominio A>0 consente l’inversione.', 'Orientazione e uniformità sono preservate nei due stati. Dividendo (κ₁B)(κ₂A) per BA si ricava Φ_B/Φ_A=κ₁κ₂. La conclusione richiede lo stesso cosθ=1 in entrambe le prove.', 'In A il prodotto 2·3 dà 6 Wb; in B 1·4 dà 4 Wb. Il rapporto finale/iniziale è 4/6=2/3. Le due variazioni non si sommano: si moltiplicano nei rispettivi fattori.', 'Le due letture sono 6 e 4 Wb e la loro media aritmetica è 5 Wb. Usando invece i valori medi B=3/2 T e A=7/2 m², il modello darebbe 21/4 Wb. La differenza fra le due costruzioni è 5−21/4=−1/4 Wb. Il quesito richiede la prima.', 'Il nuovo flusso deve essere (2/3)·6=4 Wb. Con B_B=1 T si richiede A_B=4 m², quindi A_B/A_A=4/3. La normale resta concorde in entrambe le prove.', 'Il riferimento Φ=6 Wb con S=18 fissa a=3 unità strumentali/Wb. S=12 implica Φ=4 Wb. Con area 4 m², B=Φ/A=1 T. Non serve conoscere l’unità strumentale assoluta perché è coerente fra le prove.', 'I riferimenti Φ_A=6 Wb, S_A=13 e Φ_B=4 Wb, S_B=9 danno a=(13−9)/(6−4)=2 unità strumentali/Wb e b=1. La lettura 41 significa Φ_C=(41−1)/2=20 Wb. Con A_C=5 m² segue B_C=4 T.', 'Pongo a=A/(1 m²)>0. Il vincolo dimensionato B=(2/3 T/m²)A implica B/(T)=2 a/3. La misura Φ=6 Wb dà 6=(2/3)a², quindi a²=9 e a=3 nel dominio positivo. Si ottengono A=3 m² e B=2 T; la radice negativa non rappresenta un’area ammessa.']
DISTRACTORS=['Dodici aggiunge due superfici non assegnate; −6 Wb cambia la normale e zero scambia campo perpendicolare al piano con campo tangente. Con normale concorde il flusso è positivo 6 Wb.', 'T è il campo senza area; T/m² divide invece di moltiplicare. V e N sono tensione e forza. Wb=T·m² ha dimensione di flusso.', 'Fermare definitivamente le linee ai poli imita un campo con cariche magnetiche isolate. Eliminare l’interno o troncare al centro non completa il percorso; invertire entrambi i versi contraddice N/S. Il vincolo di flusso netto nullo è su superfici chiuse.', 'Dodici inverte la dipendenza da B; sei ignora la modifica. Zero richiederebbe B nullo o tangente, −3 un cambio di orientazione. Nessuno è il flusso concorde al nuovo campo 1 T.', 'Diciotto moltiplica invece di dividere. Il rapporto A/Φ ha T⁻¹, non T; sei copia il flusso e−2 non è un modulo nel dominio.', 'Dodici moltiplica, 1/3 inverte il rapporto, sei ignora B.√3 m sarebbe il lato di un eventuale quadrato, non l’area richiesta e neppure un dato necessario.', 'Tre inverte il confronto; 1/9 eleva nuovamente al quadrato un rapporto già di aree. Uno ignora l’area diversa e zero viola A>0.', '−6 inverte la sottrazione, due è rapporto puro, dodici ripete proposta e zero la accetta. Lo scarto deve conservare weber.', 'ΦA ha T·m⁴, A/Φ T⁻¹ e la radice T¹ᐟ². La formula con 2 A ricostruirebbe BA=Φ/2, non il flusso misurato; non esiste un fattore due nel modello di questa superficie.', 'Le divisioni rendono inverso uno dei due ingressi; κ₁² modifica la dipendenza lineare in B. La somma fallisce per fattori entrambi unitari, dando due invece di uno.', '3/2 inverte il rapporto, 1/2 segue solo B e 4/3 soloA. Una compensazione esatta al campo 1 T richiederebbe 6 m², non 4 m².', 'Dieci Wb somma senza mediare, 21/4 usa gli ingressi medi e uno è semidifferenza. Pesi statistici uguali non sono una divisione per un intervallo temporale.', '3/4 inverte il rapporto; 2/3 copia il fattore dei flussi. Un terzo implica A_B 1 m² eΦ_B 1 Wb; due implica A_B 6 m² eΦ_B 6 Wb, non 4.', 'Tre T usa D 12 come 12 Wb, quattro copia il numero del flusso e 2/3 copia il rapporto dei display senza l’area diversa. Un T dàΦ4 Wb eD 12.', '41/10 T omette b e predice D 42. Otto T sottrae b ma salta a; venti copiaΦ_C senza dividerlo per 5 m². Quattro T ricostruisce l’intera taratura.', 'La radice−3 m² è fuori dominio. Nove m² dà 54 Wb dal vincolo, due m²8/3 Wb. La misura e il vincolo fissano la scala e non lasciano infinite aree positive.']
ASSUMPTIONS=['B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'Caso autonomo del magnete a barra illustrato, linee seguite dentro e fuori e nessun monopolo. Il percorso disegnato chiude con versi N→S esterno e S→N interno. Il flusso nullo riguarda una superficie chiusa Σ, non l’area piana aperta degli altri record; non si afferma che ogni linea di ogni campo sia una curva finita chiusa.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.', 'B uniforme perpendicolare a superficie piana aperta, normale scelta concorde, θ=0 eΦ=BA>0. B e area positivi finiti; non si applica il flusso nullo di una superficie chiusa a questa superficie aperta. Caso 03 sul disegno elementare di un magnete a barra: proseguimento esterno N→S e interno S→N; non si generalizza ogni linea di ogni campo a curva finita chiusa. Medie di preparazioni, display continuo e vincolo B=(2/3 T/m²)A con radice di area positiva.']
PEDAGOGY=['Legge motivata prima della sostituzione, unità e variabile richiesta distinte.', 'Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.', 'Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.', 'Confronto controllato a parametro fissato, non evoluzione dinamica inventata.', 'Prima inversa ricavata e reinserita nella legge diretta.', 'Seconda inversa con denominatori positivi e distinzione fra modulo e verso.', 'Due uscite ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto preservato, separato dal rapporto puro.', 'Inversa simbolica con coefficienti dimensionali espliciti.', 'Fattori inseriti nella legge effettiva prima di semplificare.', 'Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.', 'Media delle uscite distinta da modello agli ingressi medi e da media temporale.', 'Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.', 'Guadagno del display rimosso prima dell’inversa fisica.', 'Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.']
EXPECTED_IDS={'AR-u6-magnetic-flux-14', 'AR-u6-magnetic-flux-05', 'AR-u6-magnetic-flux-01', 'AR-u6-magnetic-flux-06', 'AR-u6-magnetic-flux-03', 'AR-u6-magnetic-flux-07', 'AR-u6-magnetic-flux-12', 'AR-u6-magnetic-flux-04', 'AR-u6-magnetic-flux-09', 'AR-u6-magnetic-flux-13', 'AR-u6-magnetic-flux-15', 'AR-u6-magnetic-flux-16', 'AR-u6-magnetic-flux-10', 'AR-u6-magnetic-flux-08', 'AR-u6-magnetic-flux-11', 'AR-u6-magnetic-flux-02'}
REVIEWED_CANDIDATES={'AR-u6-magnetic-flux-01': 'bc58689247204e0b9ee215aad91c4f706a825e7fbf0bfe64f5e79f377b8371ed', 'AR-u6-magnetic-flux-02': 'd90ec472f3c833b7162fdd617baa983a7a68d41e47a949703eb7e01ccddfdd16', 'AR-u6-magnetic-flux-03': '93f830306ebf576fe1ba6e793c3a229eacf05636ae1d021f209acf858a99e5b1', 'AR-u6-magnetic-flux-04': '8459d850540b0af486bcc032a855c020c77d694bd9e3475b344ac640615fdc0b', 'AR-u6-magnetic-flux-05': 'd31160bd5809bcb511b8395901179102ea1bffca1a19874afe1795f8868956d2', 'AR-u6-magnetic-flux-06': '0aecb979547b5d70f92f90ae5bcb8d1e9645146d6f9c1f6caee7b476302cc2a8', 'AR-u6-magnetic-flux-07': '0285d5eee87454bd9b2dd534721c3036c8f71fa58a293ba98258d42e0897bec5', 'AR-u6-magnetic-flux-08': '149b6e31b5cc2c0691c017581fcd0c218831b21eddc859e051bb16274adb4b49', 'AR-u6-magnetic-flux-09': '0097aecfc40f9e6f49fb518cba3727b704643d01912e987b91675ace44d1e7aa', 'AR-u6-magnetic-flux-10': 'a810e7a0eb54a0fe09116440219146617261b211da2ef8b9d56a95eeb3061a9a', 'AR-u6-magnetic-flux-11': '195af0608567c3fc1a24ffea2bb82867456840f75c07dbd9d6b5026d6b74474d', 'AR-u6-magnetic-flux-12': '230bc71f3e1a198e3bda1c2b4ced76abd6902d80bcf7f1f71371792fed3721ce', 'AR-u6-magnetic-flux-13': 'c77e909ef2cff34e131b4b0add034dff26147de5287a683794baff0229c34bc7', 'AR-u6-magnetic-flux-14': '08f73f59aea316c317dc30ccd343eca8b8459e771a6734abb0477744fbf7a843', 'AR-u6-magnetic-flux-15': 'e2a26d8fbbba3fc4e30465802a28ed56123b66336f612a50ea43d6862eb76a66', 'AR-u6-magnetic-flux-16': '9a8609fc31eca9af561a6b6a28dab1b0da97158eb25c27e66a6f65156019b2d0'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1030, 1), Fraction(160, 1), Fraction(32, 1)), (Fraction(320, 1), Fraction(560, 1), Fraction(170, 1), Fraction(70, 1)), (Fraction(150, 1), Fraction(560, 1), Fraction(170, 1), Fraction(70, 1)), (Fraction(150, 1), Fraction(940, 1), Fraction(240, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1800, 1)), (Fraction(150, 1), Fraction(1120, 1), Fraction(200, 1), Fraction(32, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z', 'M150 310L410 310L490 370L230 370Z', 'M170 600V540Q320 430 470 540V600'}
REQUIRED_CIRCLES={(Fraction(150, 1), Fraction(1600, 1), Fraction(4, 1)), (Fraction(390, 1), Fraction(1420, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1605, 1), Fraction(150, 1), Fraction(1370, 1)), (Fraction(145, 1), Fraction(1600, 1), Fraction(520, 1), Fraction(1600, 1)), (Fraction(150, 1), Fraction(1600, 1), Fraction(390, 1), Fraction(1420, 1)), (Fraction(300, 1), Fraction(310, 1), Fraction(300, 1), Fraction(180, 1)), (Fraction(470, 1), Fraction(600, 1), Fraction(170, 1), Fraction(600, 1)), (Fraction(410, 1), Fraction(310, 1), Fraction(410, 1), Fraction(220, 1))}
REQUIRED_SVG_TEXTS=('Superficie orientata e flusso', '1 · Una superficie aperta orientata', 'B = 2 T', 'n positiva', 'A = 3 m²', 'B concorde a n: Φ = BA = 6 Wb.', '2 · La continuazione dentro il magnete', 'N', 'S', 'Esterno: N → S', 'Interno: S → N', 'Le due parti completano la linea illustrata.', 'Non si interrompe sui poli o nel materiale.', '3 · Due flussi e la media', 'A', '6 Wb', 'B', '4 Wb', 'Media', '5 Wb', 'Barre alla stessa scala; media con pesi uguali.', '4 · Solo B varia: A = 3 m²', '0', '2', '6', 'B (T)', 'Φ (Wb)', 'Relazione lineare; si mostra B positivo fino a 2 T.', 'L’origine è esclusa dal dominio B > 0.')
GEOMETRY_REVIEW='XML e PNG indipendente completo 640×1800 letti. Superficie aperta in proiezione, B e normale paralleli concordi e frecce schematiche di grandezze diverse. Nel magnete N sinistra, S destra: percorso esterno da(170, 600) sopra al magnete fino(470, 600), freccia interna daS aN. Barre da x 150 lunghe 240/160/200 per 6/4/5 Wb a 40 coordinate/Wb. Grafico finale origine(150, 1600), 120 coordinate/T e 30 coordinate/Wb con punto(390, 1420) perB 2 T, Φ6 Wb, A 3 m² fissa. Origine aperta e dominio positivo espliciti.'
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

def result(field, area):
    """B in T, A in m²; fixed concordant normal, theta=0, output Wb."""
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(field*area)
def inverse_first(flux, area):
    flux=_finite_exact(flux,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(flux/area)
def inverse_second(flux, field):
    flux=_finite_exact(flux,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(flux/field)
def scaled(field, area, k1, k2):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1*k2)
def constrained_area(flux):
    """B/(1 T)=(2/3)A/(1 m²), flux/(1 Wb)=(2/3)a²."""
    flux=_finite_exact(flux,positive=True)
    return sp.sqrt(3*flux/2)

@lru_cache(maxsize=1)
def oracle():
    field,area=sp.symbols('field area',positive=True)
    vector=sp.Matrix([0,0,field]);oriented_area=sp.Matrix([0,0,area]);assert vector.dot(oriented_area)==field*area
    # Uniform field through a closed box: opposite faces cancel, while an open face has positive flux.
    assert vector.dot(oriented_area)+vector.dot(-oriented_area)==0
    physical=(SI.Quantity(2,'tesla')*SI.Quantity(3,'meter**2')).to('weber')
    first=result(2,3);second=result(1,4);assert sp.sympify(physical.magnitude)==first==6 and second==4
    fit=calibrate(first,second,18,12,13,9,41,'weber');assert fit==(3,1,4,20)
    assert result(sp.Rational(3,2),sp.Rational(7,2))==sp.Rational(21,4)
    expected=[first,'Wb','Proseguono fuori da N a S e dentro da S a N, chiudendo il percorso illustrato','Da 6 Wb a 3 Wb',inverse_first(first,3),inverse_second(first,2),result(2,1)/first,12-first,'B = Φ / A','κ₁ κ₂',second/first,(first+second)/2,inverse_second(sp.Rational(2,3)*first,1)/3,inverse_first(fit[2],4),inverse_first(fit[3],5),constrained_area(first)]
    for n,value in {5:2,6:3,7:sp.Rational(1,3),8:6,11:sp.Rational(2,3),12:5,13:sp.Rational(4,3),14:1,15:4,16:3}.items():assert sp.simplify(expected[n-1]-value)==0
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
