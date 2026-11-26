"""Independent source-first radiation laws; no candidate authoring imports.
All 80 source-prompt derivations and five numerical models frozen before candidate reading.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94'
CANDIDATE_REF='cc8048ccac91fc31f3601cb72ac1f579d743dc0c'
PRIMARY_SHA256='8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L06', 'actualLessonPrerequisites': {'C5-L06': ['C5-L02', 'C5-L04'], 'C5-L07': ['C5-L06']}}
FAMILY='em-wave-field-power'
BATCH='em-wave-field-power-243'
ASSET_NAME='em-wave-field-power-progressive.svg'
REVIEWED_PACKAGE_SHA256='45acd692402263d016af395839f20f5a70b7a9c6efb75873dd4a5c60b2d47b92'
REVIEWED_BINDINGS_SHA256='d7c73ce4964c9a2cc0f348b2b782b2a847f6965306304edb210c961d3deb9284'
SOURCE_REFERENCE='Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.'
FALSE_PROOF='La potenza media della superficie è lineare nel picco E₀ a parità di area e impedenza.'
SVG_MUTATION=(b'width="30"', b'width="31"')
SVG_LABEL_MUTATION=(b'P = IA = 3/10 W', b'P = IA = 3/5 W')
EXPECTED_MAPPING={1: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 2: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 3: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 4: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 5: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 6: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 7: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 8: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 9: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 10: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 11: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 12: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 13: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 14: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 15: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 16: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06'])}
NUMERIC_UNITS={5: 'V/m', 6: 'cm²', 14: 'V/m', 15: 'V/m'}
OPTION_SUFFIX={1: ' W', 7: '', 8: ' W', 11: '', 12: ' W', 13: '', 16: ' cm²'}
UNITS={1: 'watt', 2: 'watt', 3: 'dimensionless', 4: 'watt', 5: 'volt/meter', 6: 'centimeter**2', 7: 'dimensionless', 8: 'watt', 9: 'volt/meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'volt/meter', 15: 'volt/meter', 16: 'centimeter**2'}
MANUAL=['Per un’onda piana armonica E₀ è ampiezza di picco. L’intensità media assegnata è E₀²/(2 Z₀), Z₀=375 Ω assunto. E₀=150 V/m dà I=22500/750=30 W/m²; A=100 cm²=1/100 m². P=IA=3/10 W. Nella formula con area numerica in cm² il denominatore è 7 500 000.', 'La potenza è energia per tempo e si esprime in watt, W=J/s. Campo elettrico, area e intensità hanno unità diverse.', 'In un’onda elettromagnetica piana nel vuoto E e B sono ortogonali fra loro e alla direzione di propagazione; E×B indica il verso del flusso energetico. Non sono due campi longitudinali.', 'Raddoppiare E₀ da 150 a 300 V/m, a area fissa, quadruplica E₀² e P: da 3/10 a 6/5 W. Il coefficiente un mezzo non si rimuove perché E₀ è di picco.', 'E₀=√(2 Z₀P/A_SI). Con P=3/10 W e A=1/100 m², E₀²=22500 (V/m)². Ampiezza positiva E₀=150 V/m.', 'A_SI=2 Z₀P/E₀²=750·(3/10)/22500=1/100 m², cioè 100 cm². La conversione d’area è quadratica. Riletto il fix243-06: 10cm² è ancora un’area, ma darebbe soltanto3/100W. Primo testo e formule invariati; cambiato soltanto il feedback e binding. SVG identico, nativo mantenuto sul suo vero ref precedente senza retag.', 'A campo invariato, raddoppiare l’area da 100 a 200 cm² raddoppia P; rapporto 2, nel modello di illuminazione uniforme normale.', 'Il corretto è 3/10 W e il proposto 3/5 W. Proposto meno corretto=3/10 W positivo.', 'Inversa fisica E₀=√(2 Z₀P/A_SI), radice positiva. In valori normalizzati E₀/(V/m)=√[7 500 000 P_W/A_cm²]. Non sommo le due radici di una semplice ampiezza.', 'P_B/P_A=κ₁²κ₂ per ampiezza di campo e area. I fattori sono positivi; non è κ₁κ₂ perché l’intensità è quadratica nell’ampiezza.', 'A=3/10 W. B=300²·200/7 500 000=12/5 W. Rapporto 8, dato da quattro sul campo e due sull’area.', 'Media uscite=(3/10+12/5)/2=27/20 W. Gli ingressi medi E₀=225 V/m e A=150 cm² darebbero 81/80 W. La differenza media uscite meno modello agli ingressi medi è 27/80 W.', 'Target 8, con rapporto di ampiezza 2, richiede rapporto aree 8/2²=2.', 'Il riferimento P_A=3/10 W e S_A=9/10 dà guadagno 3 per watt. S=36/5 dà P=12/5 W; A=200 cm² impone E₀²=90000, cioè E₀=300 V/m.', 'Riferimenti P_A=3/10 W e P_B=12/5 W. ΔS=21/5 e ΔP=21/10 W danno a=2 per watt, b=1. S_C=17/5 dà P_C=6/5 W; A=100 cm² implica E₀=300 V/m.', 'Con A numerica in cm² e E₀ numerica in V/m, E₀=(3/2)A. Sostituendo P=3 A³/10 000 000 W. P=3/10 W impone A³=1 000 000; radice cubica positiva A=100 cm² ed E₀=150 V/m. Il vincolo è fra preparazioni e ha coefficiente dimensionato.']
DISTRACTORS=['3/5 W omette il 2 medio, 30 W copia il valore di intensità e 3000 W usa 100 m² anziché 100 cm². Dati positivi escludono zero.', 'W/m² è intensità prima dell’area, V/m campo, J energia e 1 numero puro. La media temporale non cambia la dimensione di potenza.', 'E e B sono trasversali e ortogonali, E×B nel verso energetico quando non nulli. Le opzioni longitudinali e verso opposto non valgono per la singola onda piana nel vuoto; campi nulli in un istante non invertono la propagazione.', '3/5 W tratta E linearmente, 3/20 W lo rende inverso, 3/10 W ignora E e 12/5 W cambia anche l’area non modificata qui. Campo doppio dà 6/5 W.', '22500 è il quadrato del valore del campo, −150 viola il picco positivo e 300 V/m dà 6/5 W. Il campo non è il suo valore quadratico.', '1/100 è il numero in m², non cm². Il feedback 06 finale riletto confuta 10 cm² conP 3/100 W invece di attribuirgli unità di lunghezza; 200 cm² dà 3/5 W. Nessuna radice serve per A.', '1/2 inverte il confronto, 4 quadra l’area, 1 ignora la variazione e 0 viola positività. L’area è lineare a campo fisso.', '−3/10 W inverte lo scarto, 2 è rapporto, 3/5 W proposta e 0 l’accetta. La differenza corretta 3/10 W deriva da entrambe le potenze nella stessa unità.', '2 Z₀P/A senza radice dà E₀²; omettere il 2 riduce E₀ di√2. A al numeratore modifica le dimensioni e l’ultimo reciproco ha unità inversa di campo.', 'κ₁κ₂ perde il quadrato, κ₁/κ₂ inverte l’area, κ₂/κ₁² rende inverso il campo. La somma non restituisce uno per fattori unitari.', '1/8 è reciproco, 4 segue solo il campo, 2 solo l’area e 1 ignora entrambi. P 3/10 e 12/5 W danno 8.', '81/80 W è il modello ai dati medi, 27/10 W somma, 21/20 W semidifferenza, 12/5 W solo B. La differenza corretta media uscite meno modello medio è 27/80 W.', '1/2 inverte il rapporto; 8 copia il target e 4 il fattore d’intensità. Area fissa darebbe 4 P_A, non 8 P_A.', 'D preso come P darebbe 300√3 V/m e non ricostruirebbe la lettura.150 V/m alla nuova area darebbeP 3/5 W, D 9/5. Il guadagno precede la radice.', 'Offset ignorato dàP 17/10 W e D 22/5 anziché 17/5. Guadagno ignorato dopo b dà 300√2 V/m; 150 V/m ripete D 8/5. Ramo positivo 300 V/m.', '−100 cm² viola il dominio; 150 cm² nel vincolo implica 225 V/m e 81/80 W; 10000 cm² implicherebbe potenza 3·10⁵W. Il cubo crescente positivo seleziona 100 cm² una volta sola.']
ASSUMPTIONS=['Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Caso autonomo: singola onda piana progressiva nel vuoto, E e B trasversali e ortogonali, E×B nel verso energetico quando i campi non sono nulli. Il nodo temporale non cambia il verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.', 'Onda piana armonica nel vuoto, superficie uniformemente illuminata normale alla propagazione. E₀ è picco positivo, non efficace; I=E₀²/(2 Z₀) media armonica e P=IA potenza incidente. Z₀=375 ohm prescritto, conversione 1 cm²=10⁻⁴m². Nessuna assunzione di assorbimento integrale della superficie. Caso 03 autonomo su vettori trasversali, nodo temporale distinto dal verso di propagazione.']
PEDAGOGY=['Legge motivata e unità normalizzate distinte dalle grandezze fisiche.', 'Dimensione ricostruita e prefisso distinto dall’unità fisica.', 'Caso autonomo o legge riconosciuta dalle ipotesi effettive.', 'Confronto controllato a un solo parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con dominio e unità verificati.', 'Due uscite ricostruite prima del rapporto puro.', 'Differenza ordinata distinta da un rapporto.', 'Inversa simbolica con dimensioni e dominio.', 'Fattori inseriti nella legge effettiva, senza analogie improprie.', 'Entrambi gli ingressi considerati nel nuovo stato.', 'Media delle uscite distinta dagli ingressi medi.', 'Bersaglio ricostruito prima dell’inversa.', 'Taratura rimossa prima dell’inversa fisica.', 'Guadagno e offset identificati da due riferimenti distinti.', 'Vincolo sostituito prima di decidere numero e dominio delle soluzioni.']
EXPECTED_IDS={'AR-u7-em-wave-field-power-11', 'AR-u7-em-wave-field-power-08', 'AR-u7-em-wave-field-power-07', 'AR-u7-em-wave-field-power-13', 'AR-u7-em-wave-field-power-06', 'AR-u7-em-wave-field-power-02', 'AR-u7-em-wave-field-power-10', 'AR-u7-em-wave-field-power-14', 'AR-u7-em-wave-field-power-05', 'AR-u7-em-wave-field-power-16', 'AR-u7-em-wave-field-power-09', 'AR-u7-em-wave-field-power-04', 'AR-u7-em-wave-field-power-03', 'AR-u7-em-wave-field-power-15', 'AR-u7-em-wave-field-power-12', 'AR-u7-em-wave-field-power-01'}
REVIEWED_CANDIDATES={'AR-u7-em-wave-field-power-01': 'cdb35f66820ef21b2ecf262f64fa3bbd1454d604e595ab767c96e55ef0cd3a87', 'AR-u7-em-wave-field-power-02': 'aacd1f95f9bf8cc12e6a9c886e56c4924c7a68ae3d7176648be0de18a9e2780d', 'AR-u7-em-wave-field-power-03': '34621a626c66e5e80f2edd9ebf7cd285d61d6b3c1c5f78022ef2221dbd22703c', 'AR-u7-em-wave-field-power-04': '52fbc2610146f8ca39b614e4b4979a68096af669c4d2625a70301cf1fc4429fe', 'AR-u7-em-wave-field-power-05': '370dc65bbc27d2f4d611f3d0ddcac9501ce50b87a0797d3feeddcb53273759a2', 'AR-u7-em-wave-field-power-06': 'f080b01908a73c94f99dfaf42b42193aababc2063408373a2cc39ce8e2bb48d9', 'AR-u7-em-wave-field-power-07': '9c67d74023db547e465024554ff2dedf3475bd1f82dd37ad8af26c6e71f5bffa', 'AR-u7-em-wave-field-power-08': 'f37714b96315ca29c25cd7423612f3c8278cbbc353eb8cb7262bc99a8487e73f', 'AR-u7-em-wave-field-power-09': 'e864adc45d4d787cfafa0bf772c78b5c83489e53234f2127cd7f6a247069fcf9', 'AR-u7-em-wave-field-power-10': '26a7de5602f88589a20bac490a974a75262943b4ee60ff990e18cee358e7abaa', 'AR-u7-em-wave-field-power-11': '0f6cdd889f5a58f370fa6e2baf584968045186515e9be6918f79fd892b28cea8', 'AR-u7-em-wave-field-power-12': 'c8f2166cad88720bf4fb5e9a82ee321ce2b9e63aab109fd97cae7dded995f4d1', 'AR-u7-em-wave-field-power-13': 'ad81c9cfe5f8024e7f4f79f71259eca4b9287df4b8a2f741b063203c8d695767', 'AR-u7-em-wave-field-power-14': 'a7391d8c7ffc2fa58617b5aa2e5133395a68f887a7f33a18c380478dc9d20261', 'AR-u7-em-wave-field-power-15': '256b61cca4b8bacfa535a2e3fd05be90e5a3c3ac9f2f69f7f4ff121d34aa4712', 'AR-u7-em-wave-field-power-16': '5125369f8cf3d7cfca73011b4e9705b9255177889301320288f033aa8b887713'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(960, 1), Fraction(30, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1070, 1), Fraction(240, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1180, 1), Fraction(135, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(260, 1), Fraction(280, 1), Fraction(12, 1)), (Fraction(260, 1), Fraction(280, 1), Fraction(4, 1))}
REQUIRED_LINES={(Fraction(280, 1), Fraction(280, 1), Fraction(450, 1), Fraction(280, 1)), (Fraction(260, 1), Fraction(260, 1), Fraction(260, 1), Fraction(150, 1))}
REQUIRED_SVG_TEXTS=('Campi, intensità e potenza media', '1 · Un istante dell’onda piana', 'E', 'S', 'B uscente', 'Versi schematici: E × B indica S.', '2 · Intensità media e area', 'E₀ = 150 V/m · Z₀ = 375 Ω', 'I = E₀²/(2Z₀) = 30 W/m²', 'A = 100 cm² = (1/100) m²', 'P = IA = 3/10 W', 'E₀ è il picco; il fattore 2 include la media.', '3 · Due potenze e la loro media', 'A: 150 V/m, 100 cm² · B: 300 V/m, 200 cm²', 'A', '3/10 W', 'B', '12/5 W', 'Media', '27/20 W', 'Le barre hanno la stessa scala di potenza.', 'In B cambiano sia il picco sia l’area.', 'Non si usa il quadrato di un campo medio.')
GEOMETRY_REVIEW='XML and full 640×1480 native read. E upward and B out of plane give rightward Poynting direction; arrows schematic with unlike physical units, not comparative lengths. Peak field 150 V/m withZ 0375 ohm yields 30 W/m² and 100 cm²→1/100 m². Final bars fromx 150 have lengths 30, 240, 135 for 3/10, 12/5, 27/20 W at common 100 coordinates/W. Labels clear and no geometry/unit mismatch.'
DECIMAL_REGRESSION_NUMBER=7

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
    # Explicitly reviewed spellings for the autonomous speed item, not a general parser.
    if FAMILY=='wavelength-in-medium' and number==4:
        known={'2 × 10⁸ m/s':sp.Integer(200000000),'(9/2)× 10⁸ m/s':sp.Integer(450000000),
          '3 × 10⁸ m/s':sp.Integer(300000000),'(3/2)× 10⁸ m/s':sp.Integer(150000000),'0 m/s':sp.Integer(0)}
        if option not in known:raise ValueError('Unreviewed exact speed spelling')
        return known[option]
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    if option in {'2 × 10⁸ m/s','(9/2)× 10⁸ m/s','3 × 10⁸ m/s','(3/2)× 10⁸ m/s','0 m/s'} and FAMILY=='wavelength-in-medium':
        return 'speed',parse_option(4,option)
    units={' nm':('length',sp.Rational(1,10**9)),' m':('length',sp.Integer(1)),
      ' cm²':('area',sp.Rational(1,10**4)),' m²':('area',sp.Integer(1)),
      ' W':('power',sp.Integer(1)),' pW':('power',sp.Rational(1,10**12)),
      ' J':('energy',sp.Integer(1)),'q_E':('energy',sp.Rational(1,10**20)),
      'q_R':('rate',sp.Integer(10**6)),' s⁻¹':('rate',sp.Integer(1)),
      ' V/m':('electric_field',sp.Integer(1)),' m/s':('speed',sp.Integer(1)),
      ' Hz':('frequency',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

def result(field,area):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    return sp.simplify(field**2*area/7500000)
def inverse_first(power,area):
    power=_finite_exact(power,positive=True);area=_finite_exact(area,positive=True)
    return sp.sqrt(7500000*power/area)
def inverse_second(power,field):
    power=_finite_exact(power,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(7500000*power/field**2)
def scaled(field,area,k1,k2):
    field=_finite_exact(field,positive=True);area=_finite_exact(area,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1**2*k2)
def constrained_area(power):
    power=_finite_exact(power,positive=True)
    return sp.real_root(sp.Rational(10000000,3)*power,3)

@lru_cache(maxsize=1)
def oracle():
    phase=sp.symbols('phase',real=True)
    assert sp.integrate(sp.cos(phase)**2,(phase,0,2*sp.pi))/(2*sp.pi)==sp.Rational(1,2)
    physical=(SI.Quantity(150,'volt/meter')**2/(2*SI.Quantity(375,'ohm'))*SI.Quantity(100,'centimeter**2')).to('watt')
    first=result(150,100);second=result(300,200)
    assert sp.sympify(physical.magnitude)==first==sp.Rational(3,10) and second==sp.Rational(12,5)
    assert sp.Matrix([0,1,0]).cross(sp.Matrix([0,0,1]))==sp.Matrix([1,0,0])
    fit=calibrate(first,second,sp.Rational(9,10),sp.Rational(36,5),sp.Rational(8,5),sp.Rational(29,5),sp.Rational(17,5),'watt')
    assert fit==(3,1,sp.Rational(12,5),sp.Rational(6,5))
    expected=[first,'W','E e B sono perpendicolari fra loro ed entrambi trasversali alla propagazione','Da 3/10 W a 6/5 W',inverse_first(first,100),inverse_second(first,150),result(150,200)/first,sp.Rational(3,5)-first,'E₀ = √(2 Z₀ P / A)','κ₁² κ₂',second/first,(first+second)/2,inverse_second(8*first,300)/100,inverse_first(fit[2],200),inverse_first(fit[3],100),constrained_area(first)]
    for n,value in {5:150,6:100,7:2,8:sp.Rational(3,10),11:8,12:sp.Rational(27,20),13:2,14:300,15:300,16:100}.items():assert sp.simplify(expected[n-1]-value)==0
    assert result(225,150)==sp.Rational(81,80)
    assert result(150,10)==sp.Rational(3,100) # independent reread of corrected distractor06
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
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u7-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C5" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_phase_continuity_Planck_photon_rate_harmonic_average_Poynting_balance_inverse_and_calibration",
            "Pint_exact_wavelength_energy_frequency_power_area_intensity_rate_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u7-radiation-240-244-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"f5ab7a660506550ea5220cce3e4ba8e3e15584b3"},"primaryBeforeCandidateKeys":{"path":"editorial/reviews/u7-radiation-240-244-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U7-01","U2-01")
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
    with tempfile.TemporaryDirectory(prefix='independent-radiation-label-mutation-') as directory:
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
