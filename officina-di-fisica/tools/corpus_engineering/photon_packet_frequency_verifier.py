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
CANDIDATE_REF='02e5712bb4f356fdb93b45a35ee4fe15008d56cc'
PRIMARY_SHA256='8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L07', 'actualLessonPrerequisites': {'C5-L06': ['C5-L02', 'C5-L04'], 'C5-L07': ['C5-L06']}}
FAMILY='photon-packet-frequency'
BATCH='photon-packet-frequency-241'
ASSET_NAME='photon-packet-frequency-progressive.svg'
REVIEWED_PACKAGE_SHA256='dec2dc1d416173565e85734bfed27c715fe0d039298b59c48f8c99e261c23d30'
REVIEWED_BINDINGS_SHA256='7b81f5265c4be9b4d4e0f9dee67fa910aaa17163b73e9ab4c8e10e3ae8d67abb'
SOURCE_REFERENCE='Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.'
FALSE_PROOF='A frequenza fissa raddoppiare il numero di fotoni quadruplica l’energia del pacchetto.'
SVG_MUTATION=(b'width="66"', b'width="67"')
SVG_LABEL_MUTATION=(b'E = 33q_E', b'E = 34q_E')
EXPECTED_MAPPING={1: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 2: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 3: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 4: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 5: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 6: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 7: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 8: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 9: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 10: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 11: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 12: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 13: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 14: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 15: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07']), 16: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L06', 'C5-L07'])}
NUMERIC_UNITS={1: '10⁻²⁰ J', 5: '1', 6: '10¹⁴ Hz', 14: '1', 15: '1'}
OPTION_SUFFIX={7: '', 8: 'q_E', 11: '', 12: '', 13: '', 16: ''}
UNITS={1: 'joule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'dimensionless', 6: 'hertz', 7: 'dimensionless', 8: 'joule', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'hertz'}
MANUAL=['Per N fotoni monocromatici E=Nhf. Con il valore assegnato h=(33/5)×10⁻³⁴ J s e f=f₁₄×10¹⁴ s⁻¹, E/(10⁻²⁰ J)=(33/5)Nf₁₄. Per N=5 e f₁₄=1 si ottiene 33, cioè 33×10⁻²⁰ J. h è un valore di esercizio, non una ridefinizione della costante esatta SI.', 'L’energia ha unità joule, J=kg·m²/s². Il fattore 10⁻²⁰ cambia il numero con cui si esprime l’energia, non la dimensione.', 'Nel vuoto E_fotone=hf cresce con f e diminuisce con λ₀. L’ordine crescente della sequenza spettrale è radio, microonde, infrarosso, visibile, ultravioletto, raggi X, gamma, per le bande effettivamente confrontate. Nessuna opzione ancora aperta; sarà necessario leggere quali bande siano proposte.', 'Raddoppiare il conteggio N da 5 a 10 a frequenza invariata raddoppia E: da 33 a 66 unità di 10⁻²⁰ J. Entrambi i conteggi sono interi positivi.', 'N=E/(hf). Nelle unità del problema N=5·33/(33·1)=5. Si verifica anche l’integralità: non basta ottenere un numero reale positivo.', 'f₁₄=5[E/(10⁻²⁰ J)]/(33 N). Con E normalizzata 33 e N=5, f₁₄=1; la frequenza fisica è 10¹⁴ Hz.', 'A conteggio N=5 fissato, f₁₄ passa da 1 a 2 e l’energia da 33 a 66; E_B/E_A=2.', 'La proposta 66 meno il corretto 33 dà +33 unità di 10⁻²⁰ J. È uno scarto energetico, non il rapporto due.', 'N=E/(hf), oppure 5 e/(33 f₁₄) con e=E/(10⁻²⁰ J). Il risultato deve essere intero positivo nel modello di pacchetto assegnato.', 'E_B/E_A=κ₁κ₂ per la bilinearità. I conteggi N_A e κ₁N_A devono essere interi positivi; κ₁ può essere razionale se il prodotto resta intero. Nessun vincolo intero sulla frequenza.', 'A=33 e B=(33/5)·10·2=132 nelle unità d’energia assegnate. Rapporto 4: entrambi gli ingressi hanno raddoppiato.', 'Media delle due energie: (33+132)/2=165/2 unità. I parametri medi sarebbero N=15/2 e f₁₄=3/2, con uscita formale 297/4: il conteggio medio non intero non descrive un singolo pacchetto ammissibile. Anche formalmente differisce dalla media delle uscite.', 'Il fattore obiettivo 4 è prodotto di N_B/N_A=2 e f_B/f_A. Ne segue f_B/f_A=2.', 'E_A normalizzata 33 e S_A=99 danno a=3 per unità normalizzata d’energia. S=396 dà e=132; f₁₄=2 impone N=5·132/(33·2)=10, intero positivo.', 'I riferimenti energetici sono 33 e 132, con S=67 e 265. Il guadagno è 198/99=2 e l’offset 1. S_C=133 dà e_C=66; a f₁₄=1 il conteggio è N=10, intero.', 'Il vincolo N=5 f₁₄, espresso con variabile di frequenza normalizzata, dà e=33 f₁₄². Da e=33 segue f₁₄²=1; il ramo positivo è f₁₄=1 e N=5. La radice negativa viola anche il conteggio positivo.']
DISTRACTORS=['33/5 è l’energia numerica del singolo fotone, 66 raddoppia il pacchetto e 165 omette il divisore 5. N 5 e u 1 danno 33 q_E.', 'J è energia; Hz, W, s sono frequenza, potenza, tempo. e è puro ma E non perde la sua dimensione con la normalizzazione.', 'Radio, infrarosso, visibile, ultravioletto sono ordinate per f crescente e quindi hf crescente. Le altre sequenze invertono o scambiano bande. Non si richiede una separazione universale fra X e gamma.', '33/2 inverte N; 132 quadruplica invece di raddoppiare.330=33·10 omette il divisore 5 della forma normalizzata, 33 ignora il nuovo conteggio.', 'Uno omette il 5 della normalizzazione; 33 copia e e 10 predice 66, non 33. Il risultato fisico deve essere intero.', 'U 5 darebbe e 165, u 1/5 darebbe 33/5; 33 copia e senza l’inversa. Il coefficiente u 1 corrisponde a f 10¹⁴Hz.', '1/2 inverte il confronto, 4 introduce un quadrato, 1 ignora f e 5 copia N, che si cancella. Frequenza doppia ed N fisso danno energia doppia.', '−33 q_E cambia l’ordine; 2 è rapporto, 66 q_E proposta e 0 q_E l’accetta. Lo scarto energetico è 33 q_E.', 'Ehf ha J², hf/E è reciproco di N, Ef/h ha T⁻² e E/f ha J·s. Soltanto E/(hf) conta fotoni.', 'I quozienti invertono un fattore diretto; N² non è somma di energie identiche e la somma dei fattori fallisce per entrambi uguali a 1. Si richiede κ₁N_A intero, non κ₁ intero per ogni prova.', '1/4 è il reciproco, 2 segue solo uno dei due raddoppiamenti e 1 presume una compensazione.10 è il nuovo conteggio, non un rapporto di energie.', '297/4 è un’estensione formale agli ingressi medi con N 15/2 non ammissibile come pacchetto.165 è somma, 99/2 semidifferenza, 132 solo B. Media delle energie 165/2 non impone un pacchetto col conteggio medio.', '1/2 inverte la frequenza, 4 ignora il conteggio doppio, 1 darebbe 66 anziché 132 e 5 copia N_A. Il bersaglio richiede frequenza doppia.', 'N 30 usa D 396 come e e predice D 1188. N 20 omette u 2, N 5 ripete il riferimento. La taratura produce N 10 intero.', 'Omettere b dà N 665/66 e predice D 134 anziché 133. N 20 omette il guadagno dopo b; N 5 dà D 67. Il conteggio 10 ricostruisce l’intera taratura.', 'U−1 viola f>0 e N>0, 5 dà e 825 e 1/5 dà 33/25 con N 1. La radice positiva 1 dà N 5; il dato assoluto fissa la scala.']
ASSUMPTIONS=['Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Caso autonomo: confronto energetico dei fotoni di quattro bande convenzionali radio, infrarosso, visibile e ultravioletto nel vuoto. Energia hf crescente con f; nessun confronto universale X/gamma o di potenza complessiva.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.', 'Fotoni monocromatici con N intero positivo; f=u 10¹⁴Hz, u puro positivo. h assegnato 6.6×10⁻³⁴Js mantenuto nel modello. E=e q_E con q_E=10⁻²⁰J; e e display sono puri, energia E dimensionata. Le medie sono fra pacchetti, non nuove prove con conteggio frazionario. Caso 03 autonomo di quattro bande convenzionali, senza confronto universale X/gamma.']
PEDAGOGY=['Legge motivata e unità normalizzate distinte dalle grandezze fisiche.', 'Dimensione ricostruita e prefisso distinto dall’unità fisica.', 'Caso autonomo o legge riconosciuta dalle ipotesi effettive.', 'Confronto controllato a un solo parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con dominio e unità verificati.', 'Due uscite ricostruite prima del rapporto puro.', 'Differenza ordinata distinta da un rapporto.', 'Inversa simbolica con dimensioni e dominio.', 'Fattori inseriti nella legge effettiva, senza analogie improprie.', 'Entrambi gli ingressi considerati nel nuovo stato.', 'Media delle uscite distinta dagli ingressi medi.', 'Bersaglio ricostruito prima dell’inversa.', 'Taratura rimossa prima dell’inversa fisica.', 'Guadagno e offset identificati da due riferimenti distinti.', 'Vincolo sostituito prima di decidere numero e dominio delle soluzioni.']
EXPECTED_IDS={'AR-u7-photon-packet-frequency-04', 'AR-u7-photon-packet-frequency-01', 'AR-u7-photon-packet-frequency-06', 'AR-u7-photon-packet-frequency-07', 'AR-u7-photon-packet-frequency-12', 'AR-u7-photon-packet-frequency-03', 'AR-u7-photon-packet-frequency-05', 'AR-u7-photon-packet-frequency-16', 'AR-u7-photon-packet-frequency-14', 'AR-u7-photon-packet-frequency-13', 'AR-u7-photon-packet-frequency-10', 'AR-u7-photon-packet-frequency-15', 'AR-u7-photon-packet-frequency-02', 'AR-u7-photon-packet-frequency-08', 'AR-u7-photon-packet-frequency-11', 'AR-u7-photon-packet-frequency-09'}
REVIEWED_CANDIDATES={'AR-u7-photon-packet-frequency-01': 'bb8c19c81706e10f7298bfe621e807e8d3bfde8ae6a09cad33f63f203950e560', 'AR-u7-photon-packet-frequency-02': '8b0d30f0e04545ae89e35feb0bb2d1a2e02341415c27558336d6a8e21e4746ef', 'AR-u7-photon-packet-frequency-03': '693f179adf8569ad875ace05be4fe9f6b81364649d71ff082d9c3e905bfdef0c', 'AR-u7-photon-packet-frequency-04': 'f443f263704644d83773fbce915b40f017fbfb137671b50005ea3b7c7b06be20', 'AR-u7-photon-packet-frequency-05': '9266521ee2ea6586c79bf8eb3e0a90b02c3b1651542f0ff4557ea275721900a5', 'AR-u7-photon-packet-frequency-06': '30b4bd95e002ef3cad71edd1eb9be5b18407a6bc390102d950192995d8d998e0', 'AR-u7-photon-packet-frequency-07': 'e95ab4eb855fdb913c3b0bbe60ad742eff0a521089cb0e3fabbbf8d818282705', 'AR-u7-photon-packet-frequency-08': '0d28652a3b49c97c414961b7354fa49e9b80bd1ecb9f4fd61b3fa8f7e0c452d0', 'AR-u7-photon-packet-frequency-09': 'c7dbe024227407fb8f12da38e750ce182d57babdb4a9aab255509069dd02cff4', 'AR-u7-photon-packet-frequency-10': 'f2a86f6b25d943d0d686409345ac0b840bab066760a08dc533f93a03500f04bd', 'AR-u7-photon-packet-frequency-11': '0602b282066669810bd16209c9346f9b5c218a02000224cf3f7da124439fcf6e', 'AR-u7-photon-packet-frequency-12': 'e5809710c0263752cce528ceff800ead3340b2582d5aeb6100e650d328362841', 'AR-u7-photon-packet-frequency-13': '0910864a7301978b2da749edabbffa51f25a8f4598449ebf7a0ba5ce64979aff', 'AR-u7-photon-packet-frequency-14': '6a49f7719b9c5c1df6417bf15f8f93d8840ca1d8641e87dea2b9d0bf898928eb', 'AR-u7-photon-packet-frequency-15': 'd12272027cc6d1aea292b10102f6250dd34bb9569da4fdfe2a914dfd0770eea7', 'AR-u7-photon-packet-frequency-16': '0a8a6f721fea0b2e20388fced41c29ec076ac91aeea662b6d017cce7ce70098d'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1260, 1), Fraction(165, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1150, 1), Fraction(264, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1040, 1), Fraction(66, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(420, 1), Fraction(330, 1), Fraction(10, 1)), (Fraction(210, 1), Fraction(330, 1), Fraction(10, 1)), (Fraction(490, 1), Fraction(220, 1), Fraction(10, 1)), (Fraction(280, 1), Fraction(220, 1), Fraction(10, 1)), (Fraction(210, 1), Fraction(220, 1), Fraction(10, 1)), (Fraction(210, 1), Fraction(375, 1), Fraction(10, 1)), (Fraction(490, 1), Fraction(330, 1), Fraction(10, 1)), (Fraction(280, 1), Fraction(330, 1), Fraction(10, 1)), (Fraction(420, 1), Fraction(375, 1), Fraction(10, 1)), (Fraction(350, 1), Fraction(220, 1), Fraction(10, 1)), (Fraction(490, 1), Fraction(375, 1), Fraction(10, 1)), (Fraction(420, 1), Fraction(220, 1), Fraction(10, 1)), (Fraction(280, 1), Fraction(375, 1), Fraction(10, 1)), (Fraction(350, 1), Fraction(330, 1), Fraction(10, 1)), (Fraction(350, 1), Fraction(375, 1), Fraction(10, 1))}
REQUIRED_LINES={(Fraction(320, 1), Fraction(630, 1), Fraction(320, 1), Fraction(690, 1))}
REQUIRED_SVG_TEXTS=('Energia per fotone e per pacchetto', '1 · Stessa frequenza, più fotoni', 'u = 1: energia per fotone (33/5)q_E', 'q_E = 10⁻²⁰ J', 'N = 5', 'N = 10', 'E = 33q_E', 'E = 66q_E', 'Il conteggio cambia; hf resta uguale.', '2 · Isolare il conteggio', 'Energia totale: E = N E_γ', 'Energia di un fotone: E_γ = hf', 'N = E / E_γ: deve essere intero positivo.', 'Non si identifica il display continuo con N.', '3 · Due pacchetti e la media', 'A: N = 5, u = 1 · B: N = 10, u = 2', 'A', '33q_E', 'B', '132q_E', 'Media', '(165/2)q_E', 'Barre energetiche alla stessa scala.', 'N medio = 15/2 non è un pacchetto ammesso.')
GEOMETRY_REVIEW='XML and full 640×1480 native read. First group has five identical schematic photon dots, second has ten; fixed frequency u=1 gives 33 q_E and 66 q_E. Central arrow is a logical guide, not a physical vector with a scale. Final bars fromx 150 have lengths 66, 264, 165 for energies 33, 132, 165/2 q_E, common 2 coordinates/q_E. Labels and margins clear; no overlaps, cropping or scale inconsistency.'
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

def _count(value):
    value=_finite_exact(value,positive=True)
    if value.is_integer is not True:raise ValueError('A positive integer photon count is required')
    return value
def result(count,frequency):
    count=_count(count);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(sp.Rational(33,5)*count*frequency)
def inverse_first(energy,frequency):
    energy=_finite_exact(energy,positive=True);frequency=_finite_exact(frequency,positive=True)
    return _count(sp.simplify(5*energy/(33*frequency)))
def inverse_second(energy,count):
    energy=_finite_exact(energy,positive=True);count=_count(count)
    return sp.simplify(5*energy/(33*count))
def scaled(count,frequency,k1,k2):
    count=_count(count);frequency=_finite_exact(frequency,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_count(k1*count)
    return sp.simplify(k1*k2)
def constrained_frequency(energy):
    energy=_finite_exact(energy,positive=True);frequency=sp.sqrt(energy/33);_count(5*frequency)
    return frequency

@lru_cache(maxsize=1)
def oracle():
    h=SI.Quantity(Fraction(33,5*10**34),'joule*second')
    physical=(5*h*SI.Quantity(10**14,'hertz')).to('joule')
    first=result(5,1);second=result(10,2)
    assert sp.sympify(physical.magnitude)*10**20==first==33 and second==132
    fit=calibrate(first,second,99,396,67,265,133,'dimensionless');assert fit==(3,1,132,66)
    expected=[first,'J','Radio → infrarosso → visibile → ultravioletto','Da 33q_E a 66q_E',inverse_first(first,1),inverse_second(first,5),result(5,2)/first,66-first,'N = E / (h f)','κ₁ κ₂',second/first,(first+second)/2,inverse_second(4*first,10),inverse_first(fit[2],2),inverse_first(fit[3],1),constrained_frequency(33)]
    for n,value in {5:5,6:1,7:2,8:33,11:4,12:sp.Rational(165,2),13:2,14:10,15:10,16:1}.items():assert sp.simplify(expected[n-1]-value)==0
    assert sp.Rational(33,5)*sp.Rational(15,2)*sp.Rational(3,2)==sp.Rational(297,4)
    try:result(sp.Rational(15,2),sp.Rational(3,2))
    except ValueError:pass
    else:raise AssertionError('Formal mean count must not be a physical packet')
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
