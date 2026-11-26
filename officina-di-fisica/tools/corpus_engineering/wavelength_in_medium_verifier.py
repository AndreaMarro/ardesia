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
CANDIDATE_REF='00d4ac919f3c9a04a4f619d27d702dc0063b708e'
PRIMARY_SHA256='8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L06', 'actualLessonPrerequisites': {'C5-L06': ['C5-L02', 'C5-L04'], 'C5-L07': ['C5-L06']}}
FAMILY='wavelength-in-medium'
BATCH='wavelength-in-medium-240'
ASSET_NAME='wavelength-in-medium-progressive.svg'
REVIEWED_PACKAGE_SHA256='dda2bcf552a3ef992fb0e9a9bcdac5773d210ebe731d8f9563b86dd5ecdcd026'
REVIEWED_BINDINGS_SHA256='a7a706ffa2eb01a305e720b758b55e91224bb6f3fda3ebafccb208c7cf199af7'
SOURCE_REFERENCE='Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.'
FALSE_PROOF='La frequenza si dimezza entrando nel mezzo di indice due, mentre la lunghezza d’onda resta uguale.'
SVG_MUTATION=(b'width="135"', b'width="136"')
SVG_LABEL_MUTATION=(b'300 nm', b'301 nm')
EXPECTED_MAPPING={1: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 2: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 3: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 4: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 5: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 6: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 7: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 8: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 9: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 10: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 11: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 12: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 13: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 14: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 15: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06']), 16: ('C5-L06', ['C1-L001', 'C1-L002', 'C5-L02', 'C5-L04', 'C5-L06'])}
NUMERIC_UNITS={1: 'nm', 5: 'nm', 6: '1', 14: 'nm', 15: 'nm'}
OPTION_SUFFIX={7: '', 8: ' nm', 11: '', 12: ' nm', 13: ''}
UNITS={1: 'nanometer', 2: 'meter', 3: 'dimensionless', 4: 'meter/second', 5: 'nanometer', 6: 'dimensionless', 7: 'dimensionless', 8: 'nanometer', 9: 'nanometer', 10: 'dimensionless', 11: 'dimensionless', 12: 'nanometer', 13: 'dimensionless', 14: 'nanometer', 15: 'nanometer', 16: 'dimensionless'}
MANUAL=['All’interfaccia ferma la frequenza è conservata. Da v=c/n e λ=v/f, mentre λ₀=c/f, segue λ=λ₀/n. Con 600 nm e n=2 si ottiene 300 nm; λ resta positiva e non supera λ₀ per n≥1.', 'La lunghezza d’onda ha dimensione di lunghezza L. Metro, e relativi prefissi come nm, sono dimensionalmente adatti; frequenza e velocità hanno dimensioni diverse. Non servono opzioni per stabilire questa dimensione.', 'La frequenza, fissata dall’oscillazione della sorgente, resta invariata attraverso una superficie ferma fra mezzi trasparenti stazionari. Cambiano velocità di fase e lunghezza d’onda; la direzione può cambiare ma non è necessario a incidenza normale.', 'Dalla definizione n=c/v, v=c/n=(3×10⁸ m/s)/(3/2)=2×10⁸ m/s. Questo è un caso autonomo: l’indice è assegnato e non si ricava dalla geometria.', 'Inverto λ=λ₀/n moltiplicando per l’indice: λ₀=nλ. Quindi 2·300 nm=600 nm. L’indice non ha unità.', 'Isolo n=λ₀/λ: 600 nm/300 nm=2. Il risultato è adimensionale e soddisfa n≥1.', 'A vale 600/2=300 nm; B vale 600/(3/2)=400 nm. Il rapporto B/A è 4/3. Ridurre n aumenta λ a λ₀ costante.', 'Il valore corretto è 300 nm e la proposta è 600 nm. Lo scarto ordinato proposto meno corretto è +300 nm, una sovrastima.', 'λ₀=nλ è l’inversa simbolica. Il prodotto ha dimensione L; dividere nuovamente per n non ricostruisce λ₀.', 'Sostituendo λ₀, B=κ₁λ₀, A e n_B=κ₂n_A si trova λ_B/λ_A=κ₁/κ₂. Occorre conservare n_A≥1 e κ₂n_A≥1, non soltanto κ₂>0.', 'A=300 nm, B=800/(3/2)=1600/3 nm. Il rapporto è (1600/3)/300=16/9, senza arrotondare.', 'Le due uscite sono 300 e 1600/3 nm; la media con pesi uguali è 1250/3 nm. Gli ingressi medi darebbero 700/(7/4)=400 nm: differenza media uscite meno modello agli ingressi medi 50/3 nm. Non si confondono i procedimenti.', 'Il bersaglio è (16/9)·300=1600/3 nm. Con λ₀, B=800 nm, n_B=800/(1600/3)=3/2; n_B/n_A=3/4, entrambi ammissibili.', 'Il riferimento λ=300 nm e S=900 dà a=3 unità strumentali/nm. S=1600 implica λ=1600/3 nm; con n=3/2, λ₀=800 nm.', 'I riferimenti sono λ_A=300 nm e λ_B=1600/3 nm. ΔS=1400/3 e Δλ=700/3 nm, dunque a=2 per nm e b=1. S_C=801 implica λ_C=400 nm; n=2 dà λ₀, C=800 nm.', 'Il vincolo dimensionato λ₀=(300 nm)n rende λ=300 nm per ogni n≥1. La misura è ridondante; infinite coppie continue λ₀=300 n nm, n≥1, non una scala unica.']
DISTRACTORS=['1200 nm usa nλ₀ invece di λ₀/n; 600 nm conserva la lunghezza nel mezzo e 150 nm divide per n due volte. Indice finito e λ₀>0 escludono zero.', 'Hz è frequenza, m/s velocità, s periodo; n è puro ma la divisione per n non elimina la dimensione L di λ.', 'All’interfaccia ferma resta la frequenza. λ e velocità variano con il mezzo; intensità e ampiezza possono cambiare per riflessione e impedenza anche in trasparenza.', 'Moltiplicare c per 3/2 dà 9/2×10⁸m/s; ignorare n dà 3×10⁸. Copiare il valore 3/2 dell’indice nella velocità non risolve n=c/v. Zero è impossibile con c>0 e n finito.', '150 nm ripete la divisione; 300 nm omette n e 1200 nm lo applica due volte. Solo 600/2=300 nm ricostruisce la misura.', '1/2 inverte λ₀/λ e viola n≥1.300 e 600 sono valori numerici delle lunghezze, non il rapporto puro; la legge non richiede radici.', '3/4 segue n_B/n_A senza invertirlo. Le due uscite 300/400 nm impongono 4/3; 2, 1/2 e 1 non confrontano questi dati.', '−300 nm scambia l’ordine, 2 è rapporto, 600 nm proposta e 0 nm l’accetta. La differenza corretta è positiva 300 nm.', 'n/λ ha L⁻¹ e nλ² ha L²; λ−n mescola una lunghezza e un numero puro. λ/n ripete la legge diretta invece di isolarne λ₀.', 'Il prodotto rende diretta la dipendenza da n; reciproco scambia i due stati e il quadrato cambia la legge. κ₂n_A≥1 è richiesto anche per κ₂<1.', '9/16 è il reciproco di 16/9, 4/3 considera un solo effetto e 3/4 il rapporto diretto degli indici. I due effetti si rinforzano, non si compensano.', '400 nm valuta gli ingressi medi, 2500/3 nm somma, 350/3 nm semidifferenza e 1600/3 nm solo B. Media uscite 1250/3 nm e modello ai dati medi 400 nm differiscono di 50/3 nm.', '4/3 inverte il rapporto degli indici; 16/9 e 9/16 riguardano il bersaglio di λ. n_B=2 darebbe 400 nm, non 1600/3 nm.', '2400 nm usa D come λ e poi moltiplica per n; 1600 nm copia il display e 600 nm il vecchio riferimento. La taratura 3 nm⁻¹ precede l’inversa.', 'Omettere b dà λ₀=801 nm e quindi D=802, non 801. Sottrarre b ma omettere il guadagno dà λ₀=1600 nm e predice D=1601. Fermarsi a 400 nm confonde λ nel mezzo con λ₀ nel vuoto: con n=2 occorre ancora raddoppiare.', 'Un numero finito di coppie richiederebbe un altro dato indipendente. Gli esempi n 1 e 2 smentiscono nessuna coppia; indici reali n≥1 sono ammessi, senza integralità.']
ASSUMPTIONS=['Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Caso autonomo aria/vetro: luce monocromatica e interfaccia trasparente stazionaria; continuità temporale della frequenza. Non si impone assenza di riflessione né invariabilità dell’intensità trasmessa.', 'Caso autonomo: n=3/2 e c=3×10⁸m/s come dato assegnato; velocità di fase c/n. Non servono λ₀600 nm, numero di fotoni o velocità di gruppo.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.', 'Radiazione monocromatica, interfaccia e mezzo trasparenti stazionari. Indice di fase finito n≥1, velocità c/n alla frequenza considerata, frequenza conservata attraverso ciascun passaggio. Fra preparazioni la sorgente può cambiare; non si impone la stessa frequenza a λ₀ diverse. λ₀>0 e λ>0, medie statistiche e display continui. I casi 03/04 sono autonomi.']
PEDAGOGY=['Legge motivata e unità normalizzate distinte dalle grandezze fisiche.', 'Dimensione ricostruita e prefisso distinto dall’unità fisica.', 'Caso autonomo o legge riconosciuta dalle ipotesi effettive.', 'Confronto controllato a un solo parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con dominio e unità verificati.', 'Due uscite ricostruite prima del rapporto puro.', 'Differenza ordinata distinta da un rapporto.', 'Inversa simbolica con dimensioni e dominio.', 'Fattori inseriti nella legge effettiva, senza analogie improprie.', 'Entrambi gli ingressi considerati nel nuovo stato.', 'Media delle uscite distinta dagli ingressi medi.', 'Bersaglio ricostruito prima dell’inversa.', 'Taratura rimossa prima dell’inversa fisica.', 'Guadagno e offset identificati da due riferimenti distinti.', 'Vincolo sostituito prima di decidere numero e dominio delle soluzioni.']
EXPECTED_IDS={'AR-u7-wavelength-in-medium-10', 'AR-u7-wavelength-in-medium-04', 'AR-u7-wavelength-in-medium-12', 'AR-u7-wavelength-in-medium-09', 'AR-u7-wavelength-in-medium-15', 'AR-u7-wavelength-in-medium-14', 'AR-u7-wavelength-in-medium-05', 'AR-u7-wavelength-in-medium-01', 'AR-u7-wavelength-in-medium-08', 'AR-u7-wavelength-in-medium-16', 'AR-u7-wavelength-in-medium-06', 'AR-u7-wavelength-in-medium-02', 'AR-u7-wavelength-in-medium-11', 'AR-u7-wavelength-in-medium-07', 'AR-u7-wavelength-in-medium-13', 'AR-u7-wavelength-in-medium-03'}
REVIEWED_CANDIDATES={'AR-u7-wavelength-in-medium-01': '9f047c4b1c06df1cb60233542046645cc11a14fb8cd9d47746ff1c0559a5870a', 'AR-u7-wavelength-in-medium-02': 'f3c8117c285c14bf133389c1988cf2ad344ca4f61309a1a8e452dac6e47235bf', 'AR-u7-wavelength-in-medium-03': 'f27165c1777cdf83109120cc79f07e3c957750678fbd2cd109ba2c9b325d1a94', 'AR-u7-wavelength-in-medium-04': '9d5d3d2d7d7a16f5117e165920d2392471890574b83d8f5f370637842fd959e0', 'AR-u7-wavelength-in-medium-05': 'af9ad6d439699810a46eac111fdd525227c57a8e344b69273356e61b9da219fc', 'AR-u7-wavelength-in-medium-06': '8e8823a90aa48c03b473bda62e799ddd8599b46fcf38b6fb7d9f2126a96e728d', 'AR-u7-wavelength-in-medium-07': '0f8bc41b1a31af7e3c5ddbc2d805d9a928aab7f1e72d671b33958592c6efd7f2', 'AR-u7-wavelength-in-medium-08': 'bf3c1652209f6e51d5f7cf2e8d07567eaaf4fbc01d2bec64f1dea7ffb87d5a60', 'AR-u7-wavelength-in-medium-09': '32bed9304e2767ac8fd00058a67fbeb8cb0920196b934922627c05c57d06f2aa', 'AR-u7-wavelength-in-medium-10': '18fd829d691b831c866270070f5513d3e39cb915249e1ed9cc1baeb2d1641f07', 'AR-u7-wavelength-in-medium-11': 'b9f454b233c186124c374c25f2c04993b44c55d0fe84e03ea36281d532529236', 'AR-u7-wavelength-in-medium-12': 'c089d5ea71056aee28830c134bdf4cdbaabc08471511cffcbcc13de3e0c875ff', 'AR-u7-wavelength-in-medium-13': '4cdba59e8ae4f2530b9aaac1b923ee022c161b8cbc02ab1f40ab772d596cc30c', 'AR-u7-wavelength-in-medium-14': 'cfbef301a25cff3741c16be6a83148af8da81194b99f33ca674f71844fb20614', 'AR-u7-wavelength-in-medium-15': 'b08cc567ffe41b58e67ec57843e2e3a859cb9c1b332eb83cb9d6e48bbd8d8a17', 'AR-u7-wavelength-in-medium-16': '84a4c4bbd0d633667a0a7156ea553b1e8bc907d95c186be5f7a44246564ff775'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(830, 1), Fraction(375, 2), Fraction(32, 1)), (Fraction(150, 1), Fraction(650, 1), Fraction(135, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1)), (Fraction(150, 1), Fraction(740, 1), Fraction(240, 1), Fraction(32, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(450, 1), Fraction(1130, 1), Fraction(5, 1)), (Fraction(150, 1), Fraction(1280, 1), Fraction(4, 1))}
REQUIRED_LINES={(Fraction(420, 1), Fraction(340, 1), Fraction(420, 1), Fraction(390, 1)), (Fraction(150, 1), Fraction(1280, 1), Fraction(550, 1), Fraction(1080, 1)), (Fraction(330, 1), Fraction(228, 1), Fraction(330, 1), Fraction(242, 1)), (Fraction(330, 1), Fraction(165, 1), Fraction(330, 1), Fraction(215, 1)), (Fraction(240, 1), Fraction(403, 1), Fraction(240, 1), Fraction(417, 1)), (Fraction(150, 1), Fraction(165, 1), Fraction(150, 1), Fraction(215, 1)), (Fraction(150, 1), Fraction(403, 1), Fraction(150, 1), Fraction(417, 1)), (Fraction(150, 1), Fraction(1285, 1), Fraction(150, 1), Fraction(1030, 1)), (Fraction(150, 1), Fraction(228, 1), Fraction(150, 1), Fraction(242, 1)), (Fraction(150, 1), Fraction(410, 1), Fraction(240, 1), Fraction(410, 1)), (Fraction(510, 1), Fraction(340, 1), Fraction(510, 1), Fraction(390, 1)), (Fraction(150, 1), Fraction(340, 1), Fraction(150, 1), Fraction(390, 1)), (Fraction(240, 1), Fraction(340, 1), Fraction(240, 1), Fraction(390, 1)), (Fraction(330, 1), Fraction(340, 1), Fraction(330, 1), Fraction(390, 1)), (Fraction(150, 1), Fraction(235, 1), Fraction(330, 1), Fraction(235, 1)), (Fraction(510, 1), Fraction(165, 1), Fraction(510, 1), Fraction(215, 1)), (Fraction(145, 1), Fraction(1280, 1), Fraction(560, 1), Fraction(1280, 1))}
REQUIRED_SVG_TEXTS=('Lunghezza d’onda nel mezzo', '1 · Due regioni, stessa frequenza', 'Vuoto: λ₀ = 600 nm', 'Mezzo con n = 2: λ = 300 nm', '600 nm', '300 nm', 'Fronti di fase alla stessa scala spaziale.', '2 · Due preparazioni e la media', 'A: 600 nm, n = 2 · B: 800 nm, n = 3/2', 'A', '300 nm', 'B', '1600/3 nm', 'Media', '1250/3 nm', 'Barre di λ con origine e scala comuni.', '3 · Solo λ₀ varia, n = 2', 'A', '0', '600', '300', 'λ₀ (nm)', 'λ (nm)', 'La relazione è λ = λ₀/2 a questo indice.', 'L’origine è un limite: si richiede λ₀ > 0.')
GEOMETRY_REVIEW='XML and full 640×1480 native read. Phase-front spacing 180/90 represents 600/300 nm with common 0.3 coordinates/nm. Bars 135/240/187.5 represent 300, 1600/3, 1250/3 nm with common 0.45 coordinates/nm and originx 150. Graph origin 150, 1280 has 0.5 coordinates/nm on both axes, A at 450, 1130 represents 600 nm, 300 nm withn 2; open origin and no label/path overlap.'
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

def _index(value):
    value=_finite_exact(value,positive=True)
    if sp.simplify(value-1).is_nonnegative is not True:raise ValueError('Phase index at least one required by the assigned model')
    return value
def result(vacuum_wavelength,index):
    vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True);index=_index(index)
    return sp.simplify(vacuum_wavelength/index)
def inverse_first(wavelength,index):
    wavelength=_finite_exact(wavelength,positive=True);index=_index(index)
    return sp.simplify(wavelength*index)
def inverse_second(wavelength,vacuum_wavelength):
    wavelength=_finite_exact(wavelength,positive=True);vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True)
    return _index(sp.simplify(vacuum_wavelength/wavelength))
def scaled(vacuum_wavelength,index,k1,k2):
    vacuum_wavelength=_finite_exact(vacuum_wavelength,positive=True);index=_index(index)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_index(k2*index)
    return sp.simplify(k1/k2)
def constrained_vacuum_wavelength(index):
    return 300*_index(index)

@lru_cache(maxsize=1)
def oracle():
    vacuum,index,frequency=sp.symbols('vacuum index frequency',positive=True)
    assert sp.simplify((vacuum*frequency/index)/frequency-vacuum/index)==0
    physical=(SI.Quantity(600,'nanometer')/2).to('nanometer')
    first=result(600,2);second=result(800,sp.Rational(3,2))
    assert sp.sympify(physical.magnitude)==first==300 and second==sp.Rational(1600,3)
    phase_speed=(SI.Quantity(3*10**8,'meter/second')/sp.Rational(3,2)).to('meter/second')
    assert phase_speed.magnitude==2*10**8
    fit=calibrate(first,second,900,1600,601,sp.Rational(3203,3),801,'nanometer')
    assert fit==(3,1,sp.Rational(1600,3),400)
    expected=[first,'nm','La frequenza',sp.Integer(2*10**8),inverse_first(first,2),inverse_second(first,600),result(600,sp.Rational(3,2))/first,600-first,'λ₀ = n λ','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(sp.Rational(16,9)*first,800)/2,inverse_first(fit[2],sp.Rational(3,2)),inverse_first(fit[3],2),'Infinite coppie continue']
    for n,value in {5:600,6:2,7:sp.Rational(4,3),8:300,11:sp.Rational(16,9),12:sp.Rational(1250,3),13:sp.Rational(3,4),14:800,15:800}.items():assert sp.simplify(expected[n-1]-value)==0
    assert (first+second)/2-result(700,sp.Rational(7,4))==sp.Rational(50,3)
    assert result(constrained_vacuum_wavelength(sp.Rational(3,2)),sp.Rational(3,2))==300
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
