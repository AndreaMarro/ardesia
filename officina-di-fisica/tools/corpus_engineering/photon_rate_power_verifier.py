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
CANDIDATE_REF='482111220cd352709a44d2150f3e9cda0773c4fc'
PRIMARY_SHA256='8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L07', 'actualLessonPrerequisites': {'C5-L06': ['C5-L02', 'C5-L04'], 'C5-L07': ['C5-L06']}}
FAMILY='photon-rate-power'
BATCH='photon-rate-power-242'
ASSET_NAME='photon-rate-power-progressive.svg'
REVIEWED_PACKAGE_SHA256='9829abe567e88421e759d66ed4a8bbaf9a44b4ecedefdd2df78cbe20bdf237b1'
REVIEWED_BINDINGS_SHA256='435916ffa490fa3a72874746ec5b187e28273bb39e34652d6552fb53ed62502d'
SOURCE_REFERENCE='Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.'
FALSE_PROOF='A potenza fissata raddoppiare la frequenza raddoppia il numero medio di fotoni al secondo.'
SVG_MUTATION=(b'width="250"', b'width="251"')
SVG_LABEL_MUTATION=(b'50 milioni/s', b'51 milioni/s')
EXPECTED_MAPPING={1: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 2: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 3: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 4: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 5: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 6: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 7: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 8: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 9: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 10: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 11: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 12: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 13: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 14: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 15: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07']), 16: ('C5-L07', ['C1-L001', 'C5-L02', 'C5-L04', 'C5-L06', 'C5-L07'])}
NUMERIC_UNITS={1: '10⁶ s⁻¹', 5: 'pW', 6: '10¹⁵ Hz', 14: 'pW', 15: 'pW'}
OPTION_SUFFIX={7: '', 8: 'q_R', 11: '', 12: '', 13: ''}
UNITS={1: '1/second', 2: '1/second', 3: 'joule', 4: '1/second', 5: 'picowatt', 6: 'hertz', 7: 'dimensionless', 8: '1/second', 9: 'watt', 10: 'dimensionless', 11: 'dimensionless', 12: '1/second', 13: 'dimensionless', 14: 'picowatt', 15: 'picowatt', 16: 'dimensionless'}
MANUAL=['Per fotoni monocromatici P=dotN·hf. h f=(33/5)×10⁻¹⁹ J per f₁₅=1, e 33 pW=33×10⁻¹² J/s. Quindi dotN=5×10⁷ s⁻¹=50 milioni al secondo. In generale dotN/(10⁶ s⁻¹)=50 P_pW/(33 f₁₅). È un tasso medio, non un conteggio istantaneo obbligatoriamente intero.', 'Un tasso di numero di fotoni ha dimensione T⁻¹ e unità s⁻¹. Il fotone è un conteggio, mentre il prefisso milioni cambia la scala numerica.', 'Nel modello elementare a singolo fotone conta l’energia del singolo fotone E=hf, confrontata con la soglia di ionizzazione. Aumentare soltanto il numero di fotoni sotto soglia non rende energeticamente possibile quell’evento a un fotone; non si escludono qui processi multifotonici fuori modello.', 'A f fissata, raddoppiare P da 33 a 66 pW raddoppia il tasso medio da 50 a 100 milioni/s.', 'Isolo P=dotN hf. Con tasso normalizzato 50 e f₁₅=1, P_pW=(33/50)·50=33.', 'Isolo f₁₅=50 P_pW/(33 q), q=dotN/(10⁶ s⁻¹). Con P=33 e q=50 si ha f₁₅=1.', 'A potenza costante, raddoppiare la frequenza dimezza il tasso: q_A=50, q_B=25, rapporto 1/2.', 'Proposto 100 meno corretto 50 dà +50 milioni/s. La frequenza non è cambiata nel confronto di scarto.', 'P=dotN hf. Nella forma numerica P_pW=(33/50)qf₁₅; si moltiplica per f, non si divide nuovamente.', 'Il rapporto fra tassi è κ₁/κ₂. P, f>0 in entrambe le preparazioni; non occorre che dotN normalizzato sia un intero perché è una media di eventi per unità di tempo.', 'A=50; B=50/(33·2)=25/33 milioni/s. Il rapporto è 1/66. La potenza B è 1 pW, non 66 pW: serve rileggere questo dato autonomamente.', 'Media uscite: (50+25/33)/2=1675/66 milioni/s. Agli ingressi medi P=17 pW e f₁₅=3/2, il modello dà 1700/99 milioni/s. La differenza è 1625/198 milioni/s, dunque mediare ingressi non sostituisce la procedura richiesta.', 'Rapporto target 1/66=(P_B/P_A)/(f_B/f_A)=(1/33)/(f_B/f_A): f_B/f_A=2.', 'Il riferimento q=50 e S=150 dà guadagno 3. S=25/11 implica q=25/33; con f₁₅=2 si ricava P=(33/50)(25/33)·2=1 pW.', 'Riferimenti q_A=50, q_B=25/33 e letture 101, 83/33. ΔS=−3250/33 e Δq=−1625/33 danno a=2, b=1. S_C=201 dà q_C=100; f₁₅=1 implica P_C=66 pW.', 'Il vincolo numerico P_pW=33 f₁₅ rende q=50 per ogni f₁₅>0. La misura è ridondante: infinite coppie continue positive potenza/frequenza, nessuna quantizzazione del tasso medio imposta.']
DISTRACTORS=['100 raddoppia 50, 33 copia p e 5 perde un fattore 10 nella scala del tasso. P/(hf) ha s⁻¹ e dà 50 milioni/s.', 'J, W, s sono energia, potenza, tempo; 1 è adatto a r. Tasso e frequenza condividono dimensioneT⁻¹ ma non significato.', 'Potenza, tasso, durata e area non sostituiscono hf nel bilancio energetico del singolo evento. Non si invocano processi multifotonici; sopra soglia non si garantisce assorbimento certo.', '25 inverte P, 200 applica un quadrato, 66 copia p_B e 50 ignora il cambiamento. Il denominatore hf rimane fisso.', '50 copia r senza energia per fotone; 66 pW dà r 100 e 33/2 pW r 25. Serve moltiplicare il tasso per hf.', 'U 2 darebbe r 25 e u 1/2 darebbe r 100 a 33 pW. U 33 copia p senza risolvere la relazione.', '2 rende diretto l’effetto di f; 1/4 introduce un quadrato e 1 ignora il raddoppio. Potenza positiva e f finita escludono zero.', '−50 q_R scambia l’ordine, 2 è rapporto, 100 q_R proposta e 0 q_R l’accetta. L’uscita è un tasso, non una potenza.', 'dotN/(hf) ha 1/(J·s); hf/dotN haJ·s. I fattori h e f si moltiplicano a dotN per ricostruire una potenza.', 'Prodotto e reciproco confondono la dipendenza inversa da f; κ₂² aggiunge una potenza assente e la somma fallisce per stati identici. Nessuna integralità è richiesta al tasso medio.', '66 inverte il rapporto, 1/33 considera solo P, 1/2 solo f e 1 nessuno. I due tassi 50 e 25/33 danno 1/66 senza arrotondare a conteggi.', '1700/99 usa gli ingressi medi; 1675/33 è somma, 1625/66 semidifferenza e 25/33 solo B. La media richiesta 1675/66 differisce dal modello ai dati medi.', '1/2 inverte il confronto, 66 ignora il cambio di potenza e 1/33 copia il suo rapporto. A frequenza invariata B avrebbe r 50/33, doppio del bersaglio.', '3 pW tratta D come r e predice 75/11. Mezzo pW perde u_B 2 dopo la taratura; 33 pW ripete A. Il tasso resta continuo e la frazione del display è ammessa.', '6633/100 pW omette b e predice D 202; 132 pW omette il guadagno dopo b e 33 pW predice D 101. P 66 pW ricostruisce D 201.', 'Una o due coppie richiederebbero un dato indipendente; gli esempi smentiscono nessuna coppia.50 è il valore normalizzato del tasso, non il numero di coppie. P=33 u pW con ogni u>0 lascia una famiglia continua.']
ASSUMPTIONS=['Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Evento elementare di assorbimento a un solo fotone: hf rispetto alla soglia di ionizzazione è condizione energetica necessaria. Nessuna ipotesi su potenza 33 pW o frequenza 10¹⁵Hz, nessuna certezza di assorbimento e nessuna estensione a eventi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.', 'Sorgente monocromatica, potenza media P e frequenza positive finite. h prescritto. p=P/pW, u=f/10¹⁵Hz, r=dotN/(10⁶s⁻¹) sono puri; dotN è un tasso medio continuo, non un conteggio intero. Caso 03 a un solo fotone: hf confrontata con la soglia è condizione energetica necessaria, non garanzia di ogni evento. Nessuna generalizzazione a processi multifotonici.']
PEDAGOGY=['Legge motivata e unità normalizzate distinte dalle grandezze fisiche.', 'Dimensione ricostruita e prefisso distinto dall’unità fisica.', 'Caso autonomo o legge riconosciuta dalle ipotesi effettive.', 'Confronto controllato a un solo parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con dominio e unità verificati.', 'Due uscite ricostruite prima del rapporto puro.', 'Differenza ordinata distinta da un rapporto.', 'Inversa simbolica con dimensioni e dominio.', 'Fattori inseriti nella legge effettiva, senza analogie improprie.', 'Entrambi gli ingressi considerati nel nuovo stato.', 'Media delle uscite distinta dagli ingressi medi.', 'Bersaglio ricostruito prima dell’inversa.', 'Taratura rimossa prima dell’inversa fisica.', 'Guadagno e offset identificati da due riferimenti distinti.', 'Vincolo sostituito prima di decidere numero e dominio delle soluzioni.']
EXPECTED_IDS={'AR-u7-photon-rate-power-12', 'AR-u7-photon-rate-power-11', 'AR-u7-photon-rate-power-06', 'AR-u7-photon-rate-power-07', 'AR-u7-photon-rate-power-16', 'AR-u7-photon-rate-power-02', 'AR-u7-photon-rate-power-04', 'AR-u7-photon-rate-power-10', 'AR-u7-photon-rate-power-08', 'AR-u7-photon-rate-power-09', 'AR-u7-photon-rate-power-03', 'AR-u7-photon-rate-power-01', 'AR-u7-photon-rate-power-05', 'AR-u7-photon-rate-power-13', 'AR-u7-photon-rate-power-15', 'AR-u7-photon-rate-power-14'}
REVIEWED_CANDIDATES={'AR-u7-photon-rate-power-01': '220e022c01fbd427acfa7f6b40cff943f32f45c777ae76507671832f949f0cb8', 'AR-u7-photon-rate-power-02': '50681311dd27eda92c20f8f45e34abb2452278a9438eb617fce61dbc1f0e51f3', 'AR-u7-photon-rate-power-03': 'df23b2ed45d657026bf32442ee9cea78b62ff3482cfe2364fe8227039a8c55d8', 'AR-u7-photon-rate-power-04': 'c56f48aec9d0990a48b40ab03b798537fc5c5cff333c925595c2eb6cac3a949e', 'AR-u7-photon-rate-power-05': 'f1a23f6de3ef38804935172588a02f0fa321656a2cd9cbcfa33bb2a8f5bcbe6e', 'AR-u7-photon-rate-power-06': '580bab7a74db2f9929ab11d28dfd5bbaf5092aa25a72f979a20889fa1ce49173', 'AR-u7-photon-rate-power-07': '23eb4188802ad3755ca115d47b051194c05ef59e5a3530d181a4c956dc9d7c56', 'AR-u7-photon-rate-power-08': '0d2580be4975105bf5d284cbb1a29c2ceff799dc640f1cc13bf39505e853168b', 'AR-u7-photon-rate-power-09': '2922d4c9767bbd7de95c34d8e8aa5d4ea040519189907920a40efbc0980de47e', 'AR-u7-photon-rate-power-10': '670e4dc049b7ac8571f30adce088eedd939891c0dd8acd7a7bea06d3969f2289', 'AR-u7-photon-rate-power-11': 'adb22bcb162722dcc3e68038075973afac15faddb6e2ca309f61e6c4f9d28336', 'AR-u7-photon-rate-power-12': '0f265b5c8837ef1ca5dc2aeeb89c3bffce8c93cb8db63f5557e4e984b19cb074', 'AR-u7-photon-rate-power-13': '12266883b0120c9df60a91552ebce3973f2d20c55de3942e5deaf12d7cd4cc8a', 'AR-u7-photon-rate-power-14': 'c47c819a39849be3055065493526e6dd5e316e53f5e7cdc9e6dff8b6f13954bf', 'AR-u7-photon-rate-power-15': 'a3b665b96b89f8bf9e5e3f40edc742a9614d213fbd491a7718be10c86618c500', 'AR-u7-photon-rate-power-16': '238e3df6be8e796de530dd818c36f2866caf9afcac2aa3b1b39b2c528d23cacb'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(680, 1), Fraction(250, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(800, 1), Fraction(125, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(480, 1), Fraction(1030, 1), Fraction(5, 1)), (Fraction(150, 1), Fraction(1280, 1), Fraction(4, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1280, 1), Fraction(480, 1), Fraction(1030, 1)), (Fraction(150, 1), Fraction(1285, 1), Fraction(150, 1), Fraction(1010, 1)), (Fraction(320, 1), Fraction(240, 1), Fraction(320, 1), Fraction(310, 1)), (Fraction(145, 1), Fraction(1280, 1), Fraction(550, 1), Fraction(1280, 1))}
REQUIRED_SVG_TEXTS=('Dalla potenza al tasso di fotoni', '1 · Energia per fotone e potenza', 'f = 10¹⁵ Hz · P = 33 pW', 'hf = (33/5)·10⁻¹⁹ J', 'Ṅ = P / (hf) = 50 milioni/s', 'È un tasso medio, non la frequenza del campo.', 'h è il valore prescritto dal quesito.', '2 · Stessa potenza, frequenza doppia', 'P = 33 pW in entrambe le prove', 'u = 1', '50 milioni/s', 'u = 2', '25 milioni/s', 'Barre di tasso con origine e scala comuni.', '3 · Frequenza fissata: f = 10¹⁵ Hz', '0', '33', '50', 'P (pW)', 'Ṅ (milioni/s)', 'Il tasso medio è proporzionale alla potenza.', 'L’origine è un limite dei dati positivi.')
GEOMETRY_REVIEW='XML and full 640×1480 native read. At equal 33 pW, bars 250/125 at originx 150 represent 50/25 million photons/s with 5 coordinates per million/s. The logical arrow separates power from per-photon energy. Fixed-frequency graph origin 150, 1280 has 10 coordinates/pW horizontally and 5 coordinates/(million/s) vertically; endpoint 480, 1030 gives 33 pW, 50 million/s. Open origin and labels outside axes; no clipping/overlap or scale defect.'
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

def result(power,frequency):
    power=_finite_exact(power,positive=True);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(50*power/(33*frequency))
def inverse_first(rate,frequency):
    rate=_finite_exact(rate,positive=True);frequency=_finite_exact(frequency,positive=True)
    return sp.simplify(33*rate*frequency/50)
def inverse_second(rate,power):
    rate=_finite_exact(rate,positive=True);power=_finite_exact(power,positive=True)
    return sp.simplify(50*power/(33*rate))
def scaled(power,frequency,k1,k2):
    power=_finite_exact(power,positive=True);frequency=_finite_exact(frequency,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def constrained_power(frequency):
    return 33*_finite_exact(frequency,positive=True)

@lru_cache(maxsize=1)
def oracle():
    h=SI.Quantity(Fraction(33,5*10**34),'joule*second')
    physical=(SI.Quantity(33,'picowatt')/(h*SI.Quantity(10**15,'hertz'))).to('1/second')
    first=result(33,1);second=result(1,2)
    assert sp.sympify(physical.magnitude)/10**6==first==50 and second==sp.Rational(25,33)
    fit=calibrate(first,second,150,sp.Rational(25,11),101,sp.Rational(83,33),201,'dimensionless')
    assert fit==(3,1,sp.Rational(25,33),100)
    expected=[first,'s⁻¹','L’energia hf del singolo fotone rispetto alla soglia di ionizzazione','Da 50q_R a 100q_R',inverse_first(first,1),inverse_second(first,33),result(33,2)/first,100-first,'P = Ṅ h f','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(first/66,1),inverse_first(fit[2],2),inverse_first(fit[3],1),'Infinite coppie continue']
    for n,value in {5:33,6:1,7:sp.Rational(1,2),8:50,11:sp.Rational(1,66),12:sp.Rational(1675,66),13:2,14:1,15:66}.items():assert sp.simplify(expected[n-1]-value)==0
    assert result(17,sp.Rational(3,2))==sp.Rational(1700,99)
    assert result(constrained_power(sp.Rational(1,3)),sp.Rational(1,3))==50
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
