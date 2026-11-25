"""Independent source-first U6-04 laws; no candidate authoring imports.
Signatures identify the complete final text and full native SVG read separately.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='85dad5e28940ee486e847302a0d2a0d5fc88925e17115e897e3b5fb43184e35a'
CANDIDATE_REF='8e21066b36cb9b4390c0390f26d3295fdbd09ffc'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'sourcePath': 'content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L08', 'title': 'Mettere insieme i condensatori', 'lessonPrerequisites': ['C4-L07'], 'mappingReread': 'All80 metadata-only deltas read after comparing the full actual C4-L07 and C4-L08 lessons; previous mathematical proofs preserved separately.', 'gitPath': 'officina-di-fisica/content/C4.json'}
PRIMARY_SHA256='08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58'
FAMILY='parallel-capacitors'
BATCH='parallel-capacitors-220'
ASSET_NAME='parallel-capacitors-progressive.svg'
REVIEWED_PACKAGE_SHA256='a31307872f8195a5004f77850f8f18d9a79fe39a1b9f78f55662f2b2f7d12b7c'
REVIEWED_BINDINGS_SHA256='ba09e504bf76aa60121df9aef1de936c16fbf524bd239efb7fc0d9f0dc756153'
SOURCE_REFERENCE='Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.'
FALSE_PROOF='Per ricavare la tensione assestata a polarità opposte si sommano sempre i moduli delle cariche iniziali.'
SVG_MUTATION=(b'width="200"', b'width="201"')
EXPECTED_MAPPING={1: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 2: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 3: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 4: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 5: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 6: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 7: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 8: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 9: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 10: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 11: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 12: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 13: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 14: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 15: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 16: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08'])}
NUMERIC_UNITS={1: 'μF', 5: 'μF', 14: 'μF'}
OPTION_SUFFIX={6: ' V', 7: '', 8: ' μF', 11: '', 12: ' μF', 13: '', 15: ' μF', 16: ' μF'}
UNITS={1: 'microfarad', 2: 'farad', 3: 'farad', 4: 'farad', 5: 'microfarad', 6: 'volt', 7: 'dimensionless', 8: 'microfarad', 9: 'farad', 10: 'dimensionless', 11: 'dimensionless', 12: 'microfarad', 13: 'dimensionless', 14: 'microfarad', 15: 'microfarad', 16: 'microfarad'}
MANUAL=['Le due capacità vedono la medesima tensione V; la carica del nodo comune è Q=(C₁+C₂)V, quindi C_eq=C₁+C₂. Con 2 e 3 μF si ottiene 5 μF. La relazione equivalente resta definita anche se la particolare tensione applicata è nulla. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La capacità è carica divisa per differenza di potenziale: [C_eq]=C/V=F. Il prefisso micro cambia il numero, non la dimensione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Fra gli stessi due nodi le tensioni sono uguali; sommando le cariche dei due rami si ricava C_eq=C₁+C₂. Non si sommano le inverse, proprie della connessione in serie. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dimezzare C₁ da 2 a 1 μF lascia C₂ a 3 μF. La nuova capacità equivalente è 1+3=4 μF, rispetto ai 5 μF iniziali: non si dimezza l’intera rete. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo C₁ nella somma: C₁=C_eq−C₂. Il dato 5 μF meno 3 μF restituisce 2 μF; la positività richiede C_eq>C₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Conservo la carica del nodo che unisce la piastra positiva del primo condensatore alla piastra negativa del secondo. Le cariche iniziali hanno segno opposto: (1 μF)(6 V)−(2 μF)(3 V)=0 μC. Dopo il transitorio (C₁+C₂)V_f=0, dunque V_f=0 V. Non si conserva l’energia del solo campo: i 18+9=27 μJ iniziali sono trasferiti durante il transitorio. L’ipotesi di stato finale assestato non equivale a un transitorio ideale privo di dissipazione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La rete B ha 2+1=3 μF contro i 5 μF di A. Il rapporto richiesto è C_eq, B/C_eq, A=3/5, adimensionale e minore di uno. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La soluzione è 5 μF; lo scarto con segno proposta meno soluzione è 10−5=+5 μF. Non prendo il valore assoluto prima di stabilire l’ordine della sottrazione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dalla carica totale ricavo C₁=C_eq−C₂. Il dominio con entrambi i condensatori presenti è C₂>0 e C_eq>C₂; l’uguaglianza al bordo darebbe C₁=0, escluso. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Sostituisco separatamente C₁, B=κ₁ C₁, A e C₂, B=κ₂ C₂, A. Il rapporto vale (κ₁ C₁, A+κ₂ C₂, A)/(C₁, A+C₂, A), media dei fattori pesata dalle capacità positive. Per κ₁=κ₂=κ si riduce a κ, non al prodotto dei fattori. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'In B la somma è 3+5=8 μF; in A è 2+3=5 μF. Il rapporto è 8/5. Ogni preparazione conserva la topologia in parallelo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Le due uscite sono 5 e 8 μF; la media aritmetica è 13/2 μF. Le capacità medie sono 5/2 e 4 μF e sommano anch’esse 13/2 μF, perché la legge è lineare in entrambi gli ingressi. È una media di due prove, non la capacità di quattro elementi fisicamente collegati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto di uscite 8/5, moltiplicato per i 5 μF di A, impone C_eq, B=8 μF. Sottraggo C₁, B=3 μF: C₂, B=5 μF. Rispetto a C₂, A=3 μF il fattore è 5/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La taratura D=aC_eq senza offset dà a=15/(5 μF)=3 μF⁻¹. D=24 corrisponde a 8 μF. Tolto C₂=5 μF resta C₁=3 μF; D è una lettura, non una capacità. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dai riferimenti (5 μF, 11) e (8 μF, 17) ricavo a=2 μF⁻¹ e b=1. D_C=5 significa C_eq, C=(5−1)/2=2 μF. Con C₂, C=1 μF risulta C₁, C=1 μF; l’offset va sottratto prima della divisione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con C₁=(2/3)C₂ la somma diventa (5/3)C₂=5 μF. C₂=3 μF e C₁=2 μF: una sola coppia positiva, perché il vincolo di rapporto e il valore della somma fissano anche la scala. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Il valore 6/5 μF deriva dalla serie, non dal parallelo; 6 è il prodotto di numeri di capacità, non una capacità ottenuta da somma; 2 e 3 omettono un ramo.', 'C, V, J e 1 sono carica, tensione, energia e rapporto puro. La definizione Q/V ha dimensione farad anche dopo prefisso micro.', 'La frazione prodotto/somma vale per serie neutra; differenza non assicura capacità passiva. Reciproci hanno F⁻¹ e prodotto F².', '5/2 dimezza anche il ramo mantenuto.5 ignora la modifica, 6 contraddice la diminuzione e 1 omette il secondo ramo.', '8 μF come incognita ricompone 11 μF; 5 ricompone 8 μF. Il dominio richiede S maggiore del noto, non solo positivo.', '4 V ignora il segno delle cariche e usa 12 μC/3 μF.−4 V inverte quella somma errata; 3 e 6 V copiano preparazioni. La somma orientata corretta è 0 μC.', '5/3 è il reciproco; 1/3 segue solo il ramo cambiato; 3 copia un numero in μF anziché il rapporto.1 ignora la modifica.', '−5 μF inverte l’ordine, 10 copia proposta, 0 la accetta.2 è rapporto puro, non differenza.', 'S+C₂ non isola un addendo; C₂−S è negativo nel dominio, S/C₂ puro e differenza dei reciproci ha F⁻¹.', 'Prodotto e rapporto dei soli fattori perdono i pesi; reciproco scambia B/A; somma dei fattori fallisce per prove identiche.', '5/8 reciproco; 3/2 e 5/3 seguono un solo componente.2 richiederebbe 10 μF, non 8 μF.', '13 somma senza mediare, 3/2 è semidifferenza, 5 e 8 ripetono una sola uscita. Coincidenza ai dati medi discende dalla linearità.', '3/5 reciproco, 8/5 copia bersaglio totale, 3/2 segue C₁. C₂ invariata darebbe totale 6 μF, non 8.', '19 μF ricava capacità da lettura non decodificata e predice 72.8 μF copia totale; 5 copia noto. Solo 3 ricompone 24.', '3/2 μF omette offset e predice 6; 2 μF dà 7, 4 μF dà 11, 5 μF dà 13. Un μF ricompone D5.', '2 μF è C₁, 5 il totale, −3 viola positività; infinite coppie ignorerebbe la somma misurata che fissa la scala.']
ASSUMPTIONS=['Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.', 'Due capacità positive finite fra gli stessi nodi con tensione comune positiva. S è capacità equivalente, non carica netta dell’intero sistema. Caso 06 autonomo: generatori rimossi, polarità opposte e resistenza positiva per stato finale assestato; riferimento V_A−V_B orientato. La conservazione riguarda il futuro nodo e ammette tensione finale zero. Statistiche di preparazioni distinte, display continuo e vincolo 16 con scala determinata.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Prima inversa derivata e reinserita nella legge diretta. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Due configurazioni ricostruite prima del rapporto adimensionale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Ordine della differenza mantenuto e distinto dal rapporto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Entrambi gli ingressi nuovi usati prima del confronto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Guadagno strumentale rimosso prima dell’inversa fisica. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.']
EXPECTED_IDS={'AR-u6-parallel-capacitors-16', 'AR-u6-parallel-capacitors-10', 'AR-u6-parallel-capacitors-08', 'AR-u6-parallel-capacitors-14', 'AR-u6-parallel-capacitors-07', 'AR-u6-parallel-capacitors-02', 'AR-u6-parallel-capacitors-09', 'AR-u6-parallel-capacitors-05', 'AR-u6-parallel-capacitors-01', 'AR-u6-parallel-capacitors-11', 'AR-u6-parallel-capacitors-06', 'AR-u6-parallel-capacitors-15', 'AR-u6-parallel-capacitors-03', 'AR-u6-parallel-capacitors-13', 'AR-u6-parallel-capacitors-12', 'AR-u6-parallel-capacitors-04'}
REVIEWED_CANDIDATES={'AR-u6-parallel-capacitors-01': '1a73ff3b5338fb5c63c7b7bc64a36d621118e18818f2dcb424df55bf1ca09447', 'AR-u6-parallel-capacitors-02': 'ca86a1479703eda20eda63ecc9047fa28e29fd7d3769196b29636a6688c387c4', 'AR-u6-parallel-capacitors-03': 'afbb57b5eca26e65dfe729ae91005914376f3dc1b5542e54d377b4be9eaa600c', 'AR-u6-parallel-capacitors-04': '671a7231b277624067ccc39d914c24d7e4ae29ef380fbe1cb71c5f57c1965030', 'AR-u6-parallel-capacitors-05': '9395bac4a8ab3a12ab4b5e890411b0680080d27f59dfa75ba7cef8fbe73726be', 'AR-u6-parallel-capacitors-06': '73d50077e5ded516dfd4486fb5942b15115f5728f77871893dbb84c37d327658', 'AR-u6-parallel-capacitors-07': '30165d0785d40c0b93e2c6c38ca8f9518002f8e9b7c801d7637dbb17df480cbe', 'AR-u6-parallel-capacitors-08': '88d007857f620e764626f71e67ba35eab0d97838015db30454d059f31bcddcd1', 'AR-u6-parallel-capacitors-09': '7ec0b797cfe7c30e765ac62cf231ddc9f04066cfe5f46775321f1b76f158acbf', 'AR-u6-parallel-capacitors-10': '1555ecdb709ac75185389494f31eddf9682c5939777aa2312b606f5addc2a413', 'AR-u6-parallel-capacitors-11': '546e2ea1f7478ccfb453bcff75bc7b66d14e9ab849c443a56dd57a6ecc866e53', 'AR-u6-parallel-capacitors-12': '16e3a04879cbff8918374611a7f0a738ca168bcbcd5123f14348259942596ae4', 'AR-u6-parallel-capacitors-13': '79b879b26bd6a9bbfe9a6ab06acf61360a74e606649bfaf0ca7720419806ad95', 'AR-u6-parallel-capacitors-14': '096894d60fd3713f7afd043bdfddf4c2c0e1ff8fe2719382cd5b2226b1830977', 'AR-u6-parallel-capacitors-15': 'dad4ed88f762735c2ac43694f7c08d48ce141e5bd0e652ee3adee1d33d2b6204', 'AR-u6-parallel-capacitors-16': '3115656beae990ca01bcfae34588dbf80439fef95039df43e7412d106e77a701'}
REQUIRED_RECTS={(Fraction(240, 1), Fraction(620, 1), Fraction(70, 1), Fraction(120, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1500, 1)), (Fraction(420, 1), Fraction(740, 1), Fraction(70, 1), Fraction(120, 1)), (Fraction(150, 1), Fraction(1250, 1), Fraction(320, 1), Fraction(40, 1)), (Fraction(150, 1), Fraction(1330, 1), Fraction(260, 1), Fraction(40, 1)), (Fraction(150, 1), Fraction(1170, 1), Fraction(200, 1), Fraction(40, 1))}
REQUIRED_PATHS={'M290 290V340M310 290V340', 'M110 195V315M530 195V315', 'M110 195H290M310 195H530', 'M110 315H290M310 315H530', 'M32 1030H608', 'M290 170V220M310 170V220', 'M32 475H608', 'M180 600V880M180 740H545', 'M150 1150V1400'}
REQUIRED_CIRCLES={(Fraction(110, 1), Fraction(195, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(315, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(315, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(195, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
GEOMETRY_REVIEW='XML e nuovo native indipendente completo 640×1500 letti dopo 831 f 2 c 4. Due condensatori fra gli stessi nodi, schema non quantitativo dei simboli. Pannello centrale cariche orientate+6/−6 μC: barre di 120 coordinate sopra e sotto lo zero a 740, scala 20 coordinate/μC. Pannello finale somme 5/8/13/2 μF: barre 200/320/260 da x 150, scala 40 coordinate/μF. Testo con somme parentetizzate prima diμF riletto; attributi e geometrie identici alla prima edizione. Nessuna etichetta attraversata da assi.'
DECIMAL_REGRESSION_NUMBER=7

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def _finite_exact(value):
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
    first,second,reference_reading,new_reading,reading_a,reading_b,third_reading=map(
        _rational_exact,(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading))
    if first<=0 or second<=0 or first==second:
        raise ValueError('Two distinct positive finite physical calibration references required')
    if not isinstance(unit,str) or not unit:
        raise ValueError('Explicit physical unit required for calibration')
    gain=sp.Rational(reference_reading)/first
    affine_gain=sp.Rational(reading_b-reading_a)/(second-first)
    if gain<=0 or affine_gain<=0:
        raise ValueError('Positive finite proportional and affine calibration gains required')
    offset=sp.cancel(reading_a-affine_gain*first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    third=sp.cancel((third_reading-offset)/affine_gain)
    if decoded<=0 or third<=0:
        raise ValueError('Decoded physical calibration values must be strictly positive')
    physical=(SI.Quantity(reference_reading,'')/SI.Quantity(first,unit)).to('1/('+unit+')')
    if sp.simplify(sp.Rational(physical.magnitude)-gain)!=0:
        raise ValueError('Independent calibration dimensions inconsistent')
    return gain,offset,decoded,third
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def alternative_identity(option):
    if not isinstance(option,str):raise ValueError('Exact option string required')
    for suffix in (' μF',' μC',' μJ',' F',' mA',' W',' J',' s',' Ω',' V',' A',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if first<=0 or second<=0:raise ValueError('Positive finite capacitances required')
    return first+second

def inverse_component(total,known):
    total,known=map(_finite_exact,(total,known))
    if known<=0 or total<=known:raise ValueError('Equivalent must exceed known positive component')
    return total-known

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def opposite_voltage(first,voltage1,second,voltage2):
    first,voltage1,second,voltage2=map(_finite_exact,(first,voltage1,second,voltage2))
    if min(first,voltage1,second,voltage2)<=0:raise ValueError('Positive finite initial magnitudes and capacities required')
    return sp.cancel((first*voltage1-second*voltage2)/(first+second))

def constrained_second(total):
    total=_finite_exact(total)
    if total<=0:raise ValueError('Positive finite total required')
    return 3*total/5

@lru_cache(maxsize=1)
def oracle():
    c1,c2,v,q,s=sp.symbols('C1 C2 V Q S',positive=True)
    assert sp.expand(c1*v+c2*v-(c1+c2)*v)==0
    assert sp.solve(sp.Eq(s,c1+c2),c1)==[s-c2]
    first=result(2,3);second=result(3,5);assert (first,second)==(5,8)
    assert inverse_component(first,3)==2 and constrained_second(first)==3
    assert opposite_voltage(1,6,2,3)==0
    assert opposite_voltage(1,2,1,1)==sp.Rational(1,2)
    assert opposite_voltage(1,1,2,3)==-sp.Rational(5,3)
    initial_energy=sp.Rational(1,2)*(1*6**2+2*3**2);assert initial_energy==27
    q_si=(SI.Quantity(1,'microfarad')*SI.Quantity(6,'volt')-SI.Quantity(2,'microfarad')*SI.Quantity(3,'volt')).to('microcoulomb');assert q_si.magnitude==0
    total=SI.Quantity(1,'microfarad')+SI.Quantity(2,'microfarad');assert (q_si/total).to('volt').magnitude==0
    fit=calibrate(first,second,15,24,11,17,5,'microfarad');assert fit==(3,1,8,2)
    assert result(sp.Rational(5,2),4)==(first+second)/2
    return [first,'F','S = C₁ + C₂','Da 5 a 4 μF',inverse_component(first,3),opposite_voltage(1,6,2,3),scaled(2,3,1,sp.Rational(1,3)),10-first,'C₁ = S − C₂','(κ₁ C₁ + κ₂ C₂) / S',second/first,(first+second)/2,inverse_component(sp.Rational(8,5)*first,3)/3,inverse_component(fit[2],5),inverse_component(fit[3],1),constrained_second(first)]
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_capacitor_node_charge_voltage_field_energy_inverse_and_calibration",
            "Pint_exact_capacitance_charge_voltage_energy_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-capacitor-networks-220-224-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-04","U2-01")
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
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
