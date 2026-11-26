"""Independent source-first geometrical optics; no candidate authoring imports.
All 16 source-prompt derivations and one numerical model frozen before candidate reading.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-03.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='2fcf6f43cabea0f67e852a7474ac006f46b66895650211bdf44ed004b7aaec9d'
CANDIDATE_REF='f014882a58a3b721aed71e98201b0c6496dcf104'
PRIMARY_SHA256='91220f73e8017e5d93177938133c038760e8f8a53a1521decfe907b72d089f55'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L10', 'actualLessonPrerequisites': {'C5-L10': ['C5-L09']}, 'title': 'Costruire l’immagine di una lente sottile'}
FAMILY='lens-magnification'
BATCH='lens-magnification-260'
ASSET_NAME='lens-magnification-progressive.svg'
REVIEWED_PACKAGE_SHA256='0674351fdaea9901fd6b5837abcc123e65f0360a315e16d56ceea35c0d7d6884'
REVIEWED_BINDINGS_SHA256='b7a9c1e84ef7b31a56af27221a95da7f8d1c7922e453f12e7e5193fd481ed66b'
SOURCE_REFERENCE='Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.'
FALSE_PROOF='Aumentando liberamente q e p la focale rimane sempre la stessa.'
SVG_MUTATION=(b'width="240"', b'width="241"')
SVG_LABEL_MUTATION=(b'M = 2', b'M = 3')
EXPECTED_MAPPING={1: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 2: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 3: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 4: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 5: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 6: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 7: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 8: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 9: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 10: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 11: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 12: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 13: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 14: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 15: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10']), 16: ('C5-L10', ['C1-L001', 'C1-L002', 'C5-L09', 'C5-L10'])}
NUMERIC_UNITS={1: '1', 5: 'cm', 6: 'cm', 14: 'cm', 15: 'cm'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: '', 13: ''}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'centimeter', 6: 'centimeter', 7: 'dimensionless', 8: 'dimensionless', 9: 'centimeter', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'centimeter', 15: 'centimeter', 16: 'dimensionless'}
MANUAL=['Dai triangoli simili il raggio centrale dà m=−q/p. Con q=6 cm e p=3 cm, m=−2 e M=2. I coniugati richiedono f=2 cm; p>f e q>f. Il segno negativo descrive l’inversione.', 'Il rapporto fra altezze o fra distanze espresse nella stessa unità elimina la lunghezza. M è puro, con unità 1; non è una lunghezza o un angolo.', 'Per oggetto reale e immagine reale p,q sono positivi. m=−q/p è negativo e M positivo. Ciò non impone M=1: è una proprietà di orientamento, non di dimensione.', 'A dà M=6/3=2, B dà 9/3=3. Il rapporto è 3/2. Le focali compatibili sono 2 cm e 9/4 cm, quindi preparazioni distinte come esplicitamente dichiarato.', 'Isolo q=Mp e sostituisco M=2,p=3 cm: q=6 cm. Reinserire 6/3 ricostruisce 2; l’inversa conserva l’unità di p.', 'Isolo p=q/M con M>0. Sei centimetri divisi per due danno 3 cm. q/p=2 conferma il dato, mentre p=12 cm darebbe 1/2.', 'A ha M=2. B mantiene q=6 cm ma raddoppia p a 6 cm: M_B=1 e rapporto B/A=1/2. La focale B è 3 cm, distinta da quella A.', 'Lo scarto proposto meno corretto è 4−2=+2, puro. Il rapporto proposto/corretto coincide qui numericamente con 2 ma non sostituisce l’operazione richiesta.', 'Da M=q/p moltiplico entrambi i membri per p>0: q=Mp. La sostituzione M=2,p=3 cm dà 6 cm; M/p avrebbe dimensione inversa di una lunghezza.', 'Divido M_B=(κ₁q)/(κ₂p) per M_A=q/p: rimane κ₁/κ₂. Tutti i fattori sono positivi. La focale compatibile di ogni prova deve essere ricostruita, non mantenuta implicitamente fissa.', 'B dà 9/6=3/2, A dà 2. Il confronto delle uscite è (3/2)/2=3/4. Il solo aumento di q non basta a far crescere M, perché raddoppia p.', 'La media delle due uscite è (2+3/2)/2=7/4. Il rapporto degli ingressi medi è (15/2)/(9/2)=5/3 e differisce di 1/12. La legge non è affine congiuntamente in q e p.', 'Il bersaglio è (3/4)·2=3/2. Con q_B=9 cm, p_B=9/(3/2)=6 cm. Divido per p_A=3 cm: il rapporto richiesto è 2.', 'Il riferimento M=2,D=6 identifica g=3. La lettura 9/2 corrisponde a M_B=3/2. Moltiplicando per p_B=6 cm ricostruisco q_B=9 cm.', 'Dai riferimenti (M,D)=(2,5),(3/2,4), g=(5−4)/(2−3/2)=2 e b=1. D=7 dà M=3; p=3 cm implica q=9 cm. Guadagno e offset sono operazioni di lettura separate dalla legge ottica.', 'Il vincolo q=2p rende M=2 identicamente per ogni p>0. Esempi p=3 e p=6 cm danno q=6 e q=12 cm. La focale varia come 2p/3: infinite coppie continue, non una stessa lente invariata.']
DISTRACTORS=['Un mezzo è il reciproco; meno due conserva m invece di M. Sei copia q in cm e quattro quadra il rapporto.', 'cm e cm² sono dimensioni geometriche; cm⁻¹ un’inversa e i gradi un angolo. Nessuna descrive il rapporto delle altezze.', 'M positivo non implica immagine diritta. Un modulo negativo è impossibile; dimensione uguale richiede q=p e le unità non cambiano il segno.', '4/3 viene da 2·6/9, cioè variazione inversa da q; 9 copia una distanza, 2 ignora il cambiamento e −3 è m_B.', '3/2 cm darebbe M=1/2, 3 cm darebbe 1 e 12 cm darebbe 4. Il ramo negativo è escluso dalla geometria reale.', '12 cm darebbe M=1/2 e 6 cm darebbe 1. p=0 annulla il denominatore e non è ammesso.', 'Due inverte il confronto, uno copia solo B, un quarto quadra il fattore e tre copia la vecchia distanza.', 'Meno due inverte l’ordine; quattro ripete la proposta; 1/2 è corretto/proposto e zero accetta la proposta falsa.', 'p/M conserva la dimensione ma non la legge; M/p ha dimensione L⁻¹, M²p introduce un fattore in più e −Mp ha segno incompatibile.', 'Il prodotto tratta direttamente il denominatore; il reciproco scambia i ruoli. κ₁² non compare e la somma vale due per prove identiche.', '4/3 è reciproco, 3/2 copia solo il nuovo modulo o il fattore di q, 2 segue direttamente p e 1 presume compensazione.', '5/3 usa gli ingressi medi, 7/2 somma senza mediare, 1/4 è metà della differenza e 2 ripete soltanto A.', '1/2 inverte le distanze, 3/4 copia le uscite, 3/2 il modulo e 1 lascia p=3 cm, con M_B=3 invece del target.', '27 cm usa D come M e predice D=27. Quattro divide p per M, mentre 3/2 copia il modulo puro.', '21/2 cm omette b e dà D=8; 18 omette g dopo b. Tre centimetri copia M e produce D=3.', 'Una o due coppie non esauriscono il continuo. Nessuna coppia è confutata dagli esempi; scegliere q indipendente da p viola il vincolo. Fissare f sarebbe un dato ulteriore.']
ASSUMPTIONS=['Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.', 'Lente sottile convergente nello stesso mezzo, regime parassiale, oggetto e immagine reali con p,q,h_o finiti positivi. m=−q/p e M=|m|. Preparazioni distinte con f=pq/(p+q), quindi p>f e q>f; nessuna focale comune implicita. Display continuo distinto dalle grandezze e riferimenti non degeneri.']
PEDAGOGY=['Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.', 'Ogni risultato è stato derivato dal prompt, poi confrontato con svolgimento, opzioni, unità e ipotesi della versione finale.']
EXPECTED_IDS={'AR-u7-lens-magnification-01', 'AR-u7-lens-magnification-13', 'AR-u7-lens-magnification-07', 'AR-u7-lens-magnification-14', 'AR-u7-lens-magnification-09', 'AR-u7-lens-magnification-11', 'AR-u7-lens-magnification-08', 'AR-u7-lens-magnification-03', 'AR-u7-lens-magnification-12', 'AR-u7-lens-magnification-16', 'AR-u7-lens-magnification-05', 'AR-u7-lens-magnification-04', 'AR-u7-lens-magnification-15', 'AR-u7-lens-magnification-10', 'AR-u7-lens-magnification-02', 'AR-u7-lens-magnification-06'}
REVIEWED_CANDIDATES={'AR-u7-lens-magnification-01': 'e25e2c4dcec45ea8312db28bb6c2dfdd060e305425a5938d1347936a24794457', 'AR-u7-lens-magnification-02': '316802da73fa66203f1d60be23f069475342d8b40ed1d3445887bc6579d0b4d9', 'AR-u7-lens-magnification-03': '139e7b800dd01df6502197d8aa5f7510ff7449e2003f479e8866d6b74ea65974', 'AR-u7-lens-magnification-04': '656f0b82b202737473458cbd1d7b3ff308c11b38a6580388b3928967aead2347', 'AR-u7-lens-magnification-05': '740ba7cf66cc65e9b5e2d1c95b10e39f65f3b62521ab375fef539fb566867ada', 'AR-u7-lens-magnification-06': '70ca3e750607d45c47d01104f3b9225b9497018026596febce7b3ccfc5caee7c', 'AR-u7-lens-magnification-07': '01990013d369aa3da7ead790630f2415fbcd6b8216d6ae7b59fc89a84c813187', 'AR-u7-lens-magnification-08': '6290d456c3ffae0634bbd85920ff8a38ac17b3b0c33911ea7dd757bf68291008', 'AR-u7-lens-magnification-09': '6fe4af45b35097070b10e3e199dab6209f8f7378ad43696f7ad87ebd04077e34', 'AR-u7-lens-magnification-10': 'e6b0c04f641e472b609894387224ef24b4723163745798ae6915b0b47472fe79', 'AR-u7-lens-magnification-11': '623c18a4de480a6fded60d8dc970f858279ff5a41ecfe882c4a6cde531c62275', 'AR-u7-lens-magnification-12': '0dcf3dde8a10434dddd0a949836803b1bc4ce6c773df2d452331c287faa751a8', 'AR-u7-lens-magnification-13': '601177d58d41bae32a37b69490c441556275b34aa148592b711b6e42151085be', 'AR-u7-lens-magnification-14': '968d00554d7f1492e2dc1fb9b96d1463e1f34d49d1dc8c06f2ef68a061b67a28', 'AR-u7-lens-magnification-15': '2a9afb3b258ced3e68c83736213583029b5826a7d314991cd7bc67ee9da55fe6', 'AR-u7-lens-magnification-16': '9c822c04474fee84aa06a9554c1c41c646befc125ccf22ee95cc603b57efb815'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1740, 1)), (Fraction(155, 1), Fraction(750, 1), Fraction(240, 1), Fraction(30, 1)), (Fraction(155, 1), Fraction(850, 1), Fraction(180, 1), Fraction(30, 1)), (Fraction(155, 1), Fraction(950, 1), Fraction(210, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M560 300V360', 'M160 1580L520 1220', 'M110 270L590 366', 'M0 0L10 5L0 10Z', 'M110 300V270', 'M110 270H260', 'M260 270L590 369'}
REQUIRED_CIRCLES={(Fraction(340, 1), Fraction(1400, 1), Fraction(4, 1)), (Fraction(220, 1), Fraction(1520, 1), Fraction(4, 1)), (Fraction(160, 1), Fraction(1580, 1), Fraction(5, 1)), (Fraction(520, 1), Fraction(1220, 1), Fraction(4, 1)), (Fraction(360, 1), Fraction(300, 1), Fraction(3, 1)), (Fraction(160, 1), Fraction(300, 1), Fraction(3, 1)), (Fraction(260, 1), Fraction(300, 1), Fraction(3, 1))}
REQUIRED_LINES={(Fraction(340, 1), Fraction(1574, 1), Fraction(340, 1), Fraction(1586, 1)), (Fraction(220, 1), Fraction(1574, 1), Fraction(220, 1), Fraction(1586, 1)), (Fraction(160, 1), Fraction(1580, 1), Fraction(160, 1), Fraction(1200, 1)), (Fraction(154, 1), Fraction(1520, 1), Fraction(166, 1), Fraction(1520, 1)), (Fraction(154, 1), Fraction(1400, 1), Fraction(166, 1), Fraction(1400, 1)), (Fraction(260, 1), Fraction(510, 1), Fraction(560, 1), Fraction(510, 1)), (Fraction(154, 1), Fraction(1220, 1), Fraction(166, 1), Fraction(1220, 1)), (Fraction(160, 1), Fraction(1580, 1), Fraction(580, 1), Fraction(1580, 1)), (Fraction(110, 1), Fraction(435, 1), Fraction(260, 1), Fraction(435, 1)), (Fraction(45, 1), Fraction(300, 1), Fraction(600, 1), Fraction(300, 1)), (Fraction(260, 1), Fraction(185, 1), Fraction(260, 1), Fraction(405, 1)), (Fraction(520, 1), Fraction(1574, 1), Fraction(520, 1), Fraction(1586, 1))}
REQUIRED_SVG_TEXTS=('Modulo positivo, immagine capovolta', '1 · p = 3 cm, q = 6 cm, f = 2 cm', 'Altezze amplificate; distanze assiali in cm.', 'F', 'O', 'F′', 'h_o = 1 mm', 'h_i = −2 mm', 'p = 3 cm', 'q = 6 cm', 'm = −2 · M = 2 · i segni hanno ruoli distinti.', '2 · Due moduli e la loro media', 'A', '2', 'B', '3/2', 'media', '7/4', 'A: q = 6 cm, p = 3 cm · B: q = 9 cm, p = 6 cm', 'Barre pure con origine e scala comuni.', '3 · q = 2 p: una famiglia di preparazioni', '1', '2', '3', '6', '6', '12', '0', 'q (cm)', 'p (cm)', '(3 cm, 6 cm)', 'p > 0; M = 2. La focale cambia come f = 2 p/3.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1740 letti interamente. Primo pannello: scala assiale 50 coordinate/cm, lente x260, oggetto x110 e immagine x560, focali x160/360. Altezze 30 e60 coordinate per1 e2mm: amplificazione verticale6 rispetto alla scala assiale, uguale per entrambe. Raggi centrali e parallelo attraverso F′ si incontrano (560,360). Barre M2,3/2,7/4 lunghe240,180,210 da stessa origine. Grafico finale x160+60p e y1580−30q, quindi retta q=2p, origine esclusa, punti(1,2),(3,6),(6,12); scale assi differenti fisicamente etichettate. Nessuna label tagliata o attraversata rilevata.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
import sympy as sp
def _finite_exact(value):
    if isinstance(value, (float, bool)):
        raise ValueError('exact finite real input required')
    try:
        value = sp.sympify(value,strict=True)
    except (TypeError, ValueError, sp.SympifyError) as error:
        raise ValueError('invalid exact input') from error
    if value.atoms(sp.Float) or value.free_symbols or value.is_number is not True or (value.is_real is not True) or (value.is_finite is not True):
        raise ValueError('exact finite real input required')
    return value
def _positive(value):
    value = _finite_exact(value)
    if value.is_positive is not True:
        raise ValueError('positive input required')
    return value
def calibrate(y1, s1, y2, s2, snew):
    y1, y2 = map(_positive, (y1, y2))
    s1, s2, snew = map(_finite_exact, (s1, s2, snew))
    if sp.simplify(y2 - y1) == 0:
        raise ValueError('two distinct physical references required')
    gain = _positive(sp.simplify((s2 - s1) / (y2 - y1)))
    offset = _finite_exact(sp.simplify(s1 - gain * y1))
    output = _positive(sp.simplify((snew - offset) / gain))
    return (gain, offset, output)

def solve(q,p):
    q,p=map(_positive,(q,p))
    return sp.simplify(q/p)

def inverse_first(output,p):
    output,p=map(_positive,(output,p))
    return sp.simplify(output*p)

def inverse_second(output,q):
    output,q=map(_positive,(output,q))
    return sp.simplify(q/output)

def compatible_focal(q,p):
    q,p=map(_positive,(q,p))
    return sp.simplify(q*p/(q+p))

def scaled(q,p,k1,k2):
    q,p,k1,k2=map(_positive,(q,p,k1,k2))
    return sp.simplify(solve(k1*q,k2*p)/solve(q,p))

def constrained_pair(p):
    p=_positive(p)
    q=2*p
    return q,p,solve(q,p),compatible_focal(q,p)
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    units={' cm':('length',sp.Rational(1,100)),' mm':('length',sp.Rational(1,1000)),' m':('length',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    length=(SI.Quantity(6,'centimeter')/SI.Quantity(3,'centimeter')).to('dimensionless')
    first=solve(6,3);second=solve(9,6)
    assert length.magnitude==first==2 and second==sp.Rational(3,2)
    assert compatible_focal(6,3)==2 and compatible_focal(9,6)==sp.Rational(18,5)
    fit=calibrate(first,5,second,4,7);assert fit==(2,1,3)
    expected=[first,'1, adimensionale','L’immagine è capovolta: m è negativo, mentre M è positivo','Da 2 a 3',inverse_first(2,3),inverse_second(2,6),solve(6,6)/first,4-first,'q = M p','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(3*first/4,9)/3,inverse_first(sp.Rational(9,2)/3,6),inverse_first(fit[2],3),'Infinite coppie positive con q = 2 p']
    for n,value in {1:2,5:6,6:3,7:sp.Rational(1,2),8:2,11:sp.Rational(3,4),12:sp.Rational(7,4),13:2,14:9,15:9}.items():assert sp.simplify(expected[n-1]-value)==0
    assert solve(sp.Rational(15,2),sp.Rational(9,2))==sp.Rational(5,3)
    assert (first+second)/2-sp.Rational(5,3)==sp.Rational(1,12)
    for p in (sp.Rational(1,10),1,3,6):
        q,p,M,f=constrained_pair(p);assert M==2 and 1/f==1/p+1/q and p>f and q>f
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_signed_magnification_similar_triangles_conjugate_focal_compatibility_inverse_calibration",
            "Pint_exact_length_ratio_cm_m_mm_dimensionless_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u7-lens-260-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"e17b880c"},"postReadNumericGuardHardening":"All constitutive, inverse, calibration and exact finite guard function bodies are identical to the actual pre-key snapshot from first version.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/u7-lens-260-primary-source-only-20261126.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U7-03","U2-01")
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
    with tempfile.TemporaryDirectory(prefix='independent-nuclear-label-mutation-') as directory:
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
