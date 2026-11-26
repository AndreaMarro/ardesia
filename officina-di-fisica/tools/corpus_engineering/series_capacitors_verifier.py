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
FAMILY='series-capacitors'
BATCH='series-capacitors-221'
ASSET_NAME='series-capacitors-progressive.svg'
REVIEWED_PACKAGE_SHA256='42f3dfcd4a3afb795c5c550c8bd6729664836ff47ae0b47166af3ad22bdb2de0'
REVIEWED_BINDINGS_SHA256='04f23fcb87a54d18a5174c80d60116db027d461bc775e75fbb0fbb12f24f886d'
SOURCE_REFERENCE='Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.'
FALSE_PROOF='Nel regime finale una corrente continua di conduzione non nulla attraversa il dielettrico ideale.'
SVG_MUTATION=(b'width="160"', b'width="161"')
EXPECTED_MAPPING={1: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 2: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 3: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 4: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 5: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 6: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 7: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 8: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 9: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 10: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 11: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 12: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 13: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 14: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 15: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 16: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08'])}
NUMERIC_UNITS={1: 'μF', 5: 'μF', 14: 'μF'}
OPTION_SUFFIX={6: '', 7: '', 8: ' μF', 11: '', 12: ' μF', 13: '', 15: ' μF', 16: ' μF'}
UNITS={1: 'microfarad', 2: 'farad', 3: 'coulomb', 4: 'farad', 5: 'microfarad', 6: 'dimensionless', 7: 'dimensionless', 8: 'microfarad', 9: 'farad', 10: 'dimensionless', 11: 'dimensionless', 12: 'microfarad', 13: 'dimensionless', 14: 'microfarad', 15: 'microfarad', 16: 'microfarad'}
MANUAL=['Il nodo intermedio inizialmente neutro e isolato impone uguali moduli delle cariche. La tensione totale è Q/C₁+Q/C₂, quindi C_eq=C₁ C₂/(C₁+C₂). Due capacità da 2 μF danno 4/4=1 μF, inferiore a ciascuna. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Anche una capacità equivalente si misura in farad: F=C/V. La topologia cambia la relazione numerica, non la dimensione fisica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Le cariche sui lati del nodo intermedio devono compensarsi. Segue 1/C_eq=1/C₁+1/C₂, ossia C_eq=C₁ C₂/(C₁+C₂), con C₁, C₂ positive. La somma diretta sarebbe la legge del parallelo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'C₁ diventa 1 μF e C₂ resta 2 μF. C_eq=(1·2)/(1+2)=2/3 μF, contro 1 μF iniziale. La variazione di un solo elemento non scala l’intera rete dello stesso fattore. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo C₁: C_eq(C₁+C₂)=C₁ C₂, dunque C₁=C_eq C₂/(C₂−C_eq). Con C_eq=1 μF e C₂=2 μF ottengo 2 μF. Il denominatore è positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con due elementi da 2 μF il serie vale 1 μF e il parallelo 4 μF: C_par/C_ser=4. Qui si confrontano coefficienti equivalenti di due topologie; non è assegnato un protocollo di commutazione che permetta ulteriori conclusioni su carica o energia conservata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Per C₁=2 μF e C₂, B=1 μF risulta C_eq, B=2/3 μF. Divido per C_eq, A=1 μF e ottengo il rapporto puro 2/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Lo scarto proposta meno soluzione è 2−1=+1 μF. L’unità rimane quella della capacità, non un rapporto puro. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La formula inversa è C₁=S C₂/(C₂−S), con S=C_eq. Per capacità finite positive occorre 0<S<C₂. Il bordo S=C₂ non dà una capacità finita; S maggiore di C₂ imporrebbe un elemento negativo, fuori modello. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Applicando i due fattori si trova C_eq, B=κ₁κ₂ C₁ C₂/(κ₁ C₁+κ₂ C₂). Dividendo per l’uscita A resta κ₁κ₂(C₁+C₂)/(κ₁ C₁+κ₂ C₂). Se entrambi i fattori sono κ il risultato è κ, coerente con l’omogeneità di grado uno. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La preparazione A con 2 e 2 μF vale 1 μF; B con 3 e 6 μF vale 18/9=2 μF. Il rapporto di uscite è 2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La media delle uscite è (1+2)/2=3/2 μF. Le medie degli ingressi sono 5/2 e 4 μF; la loro capacità in serie sarebbe 10/(13/2)=20/13 μF. La differenza è −1/26 μF: la legge non è lineare e le due operazioni non commutano. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto 2 impone in B C_eq=2 μF. Con C₁, B=3 μF risolvo 2(3+C₂, B)=3 C₂, B e trovo 6 μF. Il fattore richiesto rispetto ai 2 μF iniziali è 3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La lettura 3 associata a 1 μF stabilisce a=3 μF⁻¹. La lettura 6 indica C_eq=2 μF; con C₂=6 μF l’inversa dà C₁=(2·6)/(6−2)=3 μF. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'I riferimenti 1 μF→3 e 2 μF→5 danno a=2 μF⁻¹ e b=1. D_C=2 corrisponde a S=1/2 μF. Con C₂=1 μF, C₁=(1/2)/(1−1/2)=1 μF, nel dominio S<C₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo C₁=C₂ riduce l’equivalente a C₂/2. Il valore 1 μF impone C₁=C₂=2 μF. La soluzione è unica e positiva, non un’intera famiglia di scale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['4 μF è parallelo, 2 un solo elemento, 1/2 divide due volte. Serie positiva deve risultare minore di ciascun componente.', 'F⁻¹ misura 1/S, non S; C, V e 1 hanno altre dimensioni. Il reciproco della somma è indispensabile.', 'Tensioni ed energie non coincidono in generale per capacità diverse; la connessione non rende uguali le capacità. Il distrattore finale non nullo è impossibile; il precedente zero in entrambi era una seconda risposta vera e non è congelato.', '1/2 μF scala un solo fattore senza aggiornare la somma; 3 è parallelo, 1 ignora modifica, 2 copia ramo.', 'La sottrazione semplice è inversa del parallelo. C₁1 μF darebbe 2/3 μF, non 1. S=C₂ non ha soluzione finita positiva.', '2 omette il dimezzamento della serie, 1/4 reciproco, 1/2 considera una sola topologia, 1 ignora i collegamenti.', '3/2 reciproco, 1/2 segue un solo componente, 2 ne inverte l’effetto, 1 ignora. Prodotto e somma nuovi danno 2/3.', '−1 scambia ordine, 2 μF copia proposta, 0 la accetta; 2 puro è rapporto e non scarto.', 'Denominatore con più altera algebra, quello S−C₂ rende incognita negativa. Differenza semplice non inverte serie; C₂/S puro.', 'Solo prodotto omette denominatore, rapporto dei fattori perde pesi, T_B/T è scalatura del parallelo. Ultima opzione reciproca.', '1/2 reciproco, 3/2 segue C₁, 3 segue C₂, 9/4 è rapporto delle somme. Equivalente B2 μF resta sotto 3 μF.', '20/13 applica legge agli ingressi medi, 3 somma, 1/2 semidifferenza, 2 ripete B. Scarto fra 20/13 e 3/2 è 1/26.', '1/3 reciproco, 2 copia raddoppio di equivalente, 3/2 segue C₁, 6 copia C₂, B inμF senza normalizzare al 2 μF iniziale.', '2 μF come C₁ dàS3/2 μF; 6 μF dàS3 μF eD9. D6 preso come S6 μF cade nel confine non finito.', '1/2 μF copia equivalente e dà 1/3; 2 μF produce D7/3, 3 μF produce D5/2. La soluzione positiva esiste, omissioneoffset dà confine spurio.', '1 copia S e dimezza ancora l’equivalente; 1/2 divide invece di moltiplicare, negativo viola passività. Misura fissa la scala del vincolo uguale.']
ASSUMPTIONS=['Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.', 'Capacità finite positive inizialmente scariche; nodo intermedio isolato inizialmente neutro. Moduli di carica uguali e cadute additive nel finale elettrostatico a tensione positiva. Nessuna corrente di conduzione non nulla nel dielettrico ideale. Caso 06 confronto separato di topologie, senza assunzioni di conservazione durante una commutazione. Inverse richiedono 0<S<C_noto. Display continuo, medie statistiche e scala fissata dalla capacità equivalente nel 16.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Prima inversa derivata e reinserita nella legge diretta. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Due configurazioni ricostruite prima del rapporto adimensionale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Ordine della differenza mantenuto e distinto dal rapporto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Entrambi gli ingressi nuovi usati prima del confronto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Guadagno strumentale rimosso prima dell’inversa fisica. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.']
EXPECTED_IDS={'AR-u6-series-capacitors-07', 'AR-u6-series-capacitors-10', 'AR-u6-series-capacitors-08', 'AR-u6-series-capacitors-12', 'AR-u6-series-capacitors-06', 'AR-u6-series-capacitors-13', 'AR-u6-series-capacitors-01', 'AR-u6-series-capacitors-02', 'AR-u6-series-capacitors-11', 'AR-u6-series-capacitors-15', 'AR-u6-series-capacitors-14', 'AR-u6-series-capacitors-16', 'AR-u6-series-capacitors-03', 'AR-u6-series-capacitors-09', 'AR-u6-series-capacitors-04', 'AR-u6-series-capacitors-05'}
REVIEWED_CANDIDATES={'AR-u6-series-capacitors-01': '8ed2012cf1c10058f48c827560aaac28cf866cf9e7630af00ef1521e173bce84', 'AR-u6-series-capacitors-02': '85eec09e1d55f736ab98482ac094f02073fd9c854e09b2b38d9bf431a1638638', 'AR-u6-series-capacitors-03': 'c907d8dcda961d137444daee932dcbade7421b848b0d3c26d8879d9334d4c4c7', 'AR-u6-series-capacitors-04': '1917586ccf5f5f7bc1a8b595efe968d9900ab36cdf29e817bec3dea1ceb0c503', 'AR-u6-series-capacitors-05': 'e3b878b507b393cf2497a89e7f4b7ac556432b296061adf1c76b26451877f450', 'AR-u6-series-capacitors-06': 'f1f8486cf57a2d4ba3c1418d1eea3322c265ba6b64eea351a3c1c8f7d338001d', 'AR-u6-series-capacitors-07': 'a509c53a354d75bd81b868dc601f438de71241d701e228581bc4c1eda6517a9a', 'AR-u6-series-capacitors-08': '7fe9a09e85f80aafa52902661797fdb95a61461587e038e46609a8a3a9315cdc', 'AR-u6-series-capacitors-09': 'cf2318355fe5d250bc304f24f1ae56073f7890b63acbd8f831d5a99ddb5c701f', 'AR-u6-series-capacitors-10': '15792cd959dd1ee956a539751d09ec368234aafdb54c8dd78d829263baf406da', 'AR-u6-series-capacitors-11': '3a6fe504fdc8374c977776b4fd157c420e9c4f3d2ade8cd891fece60683c9067', 'AR-u6-series-capacitors-12': '1184374ac8f5fd89c7c8ec19bf51a7373a8367f2c64e97932b91cdb725197133', 'AR-u6-series-capacitors-13': '27f36d85903ac651ef9754a804ebbe44b8ae7edc982a8635bcab948c887eea04', 'AR-u6-series-capacitors-14': '1b7afc280afad95ef6e5ad9cced9b3655b6d93cab83f81727859cbc023a1b454', 'AR-u6-series-capacitors-15': 'b55be9f4b390a10dbd83f633d70ae0792438f42344f2218ef78c4509ce00c325', 'AR-u6-series-capacitors-16': 'd567dab91c42ebb4ebb0df30403bf22363b6c2c8acae1506d890416a81a14592'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1280, 1), Fraction(320, 1), Fraction(44, 1)), (Fraction(150, 1), Fraction(1160, 1), Fraction(160, 1), Fraction(44, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1660, 1)), (Fraction(150, 1), Fraction(1400, 1), Fraction(240, 1), Fraction(44, 1))}
REQUIRED_PATHS={'M100 195H235M255 195H385M405 195H540', 'M255 170V220', 'M32 974H608', 'M405 170V220', 'M290 625V675', 'M290 755V805', 'M385 170V220', 'M110 650H290M310 650H530', 'M310 625V675', 'M235 170V220', 'M150 1130V1510', 'M32 460H608', 'M310 755V805', 'M110 650V780M530 650V780', 'M110 780H290M310 780H530'}
REQUIRED_CIRCLES={(Fraction(530, 1), Fraction(780, 1), Fraction(4, 1)), (Fraction(320, 1), Fraction(195, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(650, 1), Fraction(4, 1)), (Fraction(100, 1), Fraction(195, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(780, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(650, 1), Fraction(4, 1)), (Fraction(540, 1), Fraction(195, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
GEOMETRY_REVIEW='Letti XML e native completo 640×1660: primo circuito in serie con nodi A/M/B e cariche+Q/−Q sul nodo intermedio; assi e fili non attraversano label. Secondo circuito parallelo separato, stessi due 2 μF. Barre inferiori 1/2/3/2 μF lunghe 160/320/240 da x 150, scala 160 coordinate/μF. Zero posto a sinistra fuori asse. Nessuna commutazione temporale dedotta dai due circuiti.'
DECIMAL_REGRESSION_NUMBER=8

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
    return sp.cancel(first*second/(first+second))

def inverse_component(total,known):
    total,known=map(_finite_exact,(total,known))
    if total<=0 or known<=total:raise ValueError('Equivalent must lie strictly between zero and known capacitance')
    return sp.cancel(total*known/(known-total))

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def topology_ratio(first,second):
    first,second=map(_finite_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Positive finite capacitances required')
    return sp.cancel((first+second)/result(first,second))

def constrained_second(total):
    total=_finite_exact(total)
    if total<=0:raise ValueError('Positive finite total required')
    return 2*total

@lru_cache(maxsize=1)
def oracle():
    c1,c2,q,v,s=sp.symbols('C1 C2 Q V S',positive=True)
    vtotal=q/c1+q/c2
    assert sp.cancel(q/vtotal-c1*c2/(c1+c2))==0
    sol=sp.solve(sp.Eq(s,c1*c2/(c1+c2)),c1);assert len(sol)==1 and sp.cancel(sol[0]-s*c2/(c2-s))==0
    first=result(2,2);second=result(3,6);assert (first,second)==(1,2)
    assert topology_ratio(2,2)==4 and topology_ratio(1,2)==sp.Rational(9,2)
    assert result(sp.Rational(5,2),4)==sp.Rational(20,13)
    assert result(sp.Rational(5,2),4)-(first+second)/2==sp.Rational(1,26)
    assert SI.Quantity(Fraction(1,2)+Fraction(1,2),'1/microfarad').to('1/farad').magnitude==10**6
    fit=calibrate(first,second,3,6,3,5,2,'microfarad');assert fit==(3,1,2,sp.Rational(1,2))
    return [first,'F','La carica su ciascuna armatura','Da 1 a 2/3 μF',inverse_component(first,2),topology_ratio(2,2),scaled(2,2,1,sp.Rational(1,2)),2-first,'C₁ = S C₂ / (C₂ − S)','κ₁ κ₂ T / T_B',second/first,(first+second)/2,inverse_component(2*first,3)/2,inverse_component(fit[2],6),inverse_component(fit[3],1),constrained_second(first)]
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
