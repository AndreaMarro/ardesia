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
CANDIDATE_REF='351f28ae64d0a66d79ca010abbd51ef7bfa6ce63'
PRIMARY_SHA256='08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58'
FAMILY='capacitor-charge-sharing'
BATCH='capacitor-charge-sharing-223'
ASSET_NAME='capacitor-charge-sharing-progressive.svg'
REVIEWED_PACKAGE_SHA256='8556df13689c91a228c1fb4d58aea1e886289542143c6ceb63162ba46ce63728'
REVIEWED_BINDINGS_SHA256='6b35a3545ea6e2da20caadd6137b1c58c6810e52ea04ff3c4677be0839851ef3'
SOURCE_REFERENCE='C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.'
FALSE_PROOF='Nel collegamento assestato si conserva sempre l’energia del solo campo dei due condensatori.'
SVG_MUTATION=(b'width="360"', b'width="361"')
EXPECTED_MAPPING={1: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 2: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 3: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 4: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 5: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 6: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 7: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 8: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 9: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 10: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 11: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 12: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 13: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 14: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 15: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 16: ('C4-L07', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07'])}
NUMERIC_UNITS={1: 'V', 5: 'V', 6: 'μF', 14: 'V'}
OPTION_SUFFIX={7: '', 8: ' V', 11: '', 12: ' V', 13: '', 15: ' V', 16: ' μF'}
UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'volt', 6: 'microfarad', 7: 'dimensionless', 8: 'volt', 9: 'volt', 10: 'dimensionless', 11: 'dimensionless', 12: 'volt', 13: 'dimensionless', 14: 'volt', 15: 'volt', 16: 'microfarad'}
MANUAL=['Il generatore è stato rimosso. La carica totale del nodo positivo è C₀ V₀ e nello stato finale vale (C₀+C)V_f; quindi V_f=C₀ V₀/(C₀+C). Con C₀=2 μF, V₀=6 V e C=2 μF risulta 3 V. Lo stato assestato presuppone il transitorio dissipativo; non conservo l’energia del solo campo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La grandezza finale è una differenza di potenziale, dunque volt. Nella formula il rapporto di capacità è puro e moltiplica V₀. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Conservo la carica del conduttore formato unendo le armature concordi: C₀ V₀=(C₀+C)V_f. Il secondo elemento inizialmente scarico contribuisce alla capacità finale ma non alla carica iniziale. Per C, C₀, V₀ positivi segue 0<V_f<V₀. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Portare V₀ da 6 a 8 V, con entrambe le capacità 2 μF, cambia V_f da 3 a 4 V: la dipendenza da V₀ è lineare a capacità fissate. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Ricavo la tensione iniziale da V₀=V_f(C₀+C)/C₀. Con V_f=3 V, C=C₀=2 μF, ottengo 6 V. Non basta copiare la tensione dopo la redistribuzione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Ricavo C=C₀(V₀/V_f−1). Con C₀=2 μF, V₀=6 V e V_f=3 V trovo 2 μF. Per il secondo elemento positivo finito il dominio è 0<V_f<V₀; al bordo V_f=V₀ l’elemento aggiunto avrebbe C=0. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riducendo C da 2 a 1 μF, V_f=2·6/3=4 V. Il rapporto rispetto ai 3 V iniziali è 4/3: minore capacità totale a carica iniziale fissata produce maggiore tensione finale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La proposta 6 V meno la soluzione 3 V dà +3 V. Il segno dipende dall’ordine assegnato, non da una convenzione sulla carica delle armature. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'L’inversa per V₀ è V₀=V_f(1+C/C₀). Il fattore è maggiore di uno e adimensionale; la tensione iniziale deve superare quella finale nel modello con il secondo condensatore inizialmente scarico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'C₀ rimane fissata. Se V₀, B=κ₁ V₀, A e C_B=κ₂ C_A, il rapporto V_f, B/V_f, A è κ₁(C₀+C_A)/(C₀+κ₂ C_A). Non si scala anche C₀ senza che il testo lo dica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La prova A dà 3 V. In B V₀=12 V e C=4 μF: V_f=2·12/6=4 V. Il rapporto di uscite è 4/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La media delle tensioni finali è (3+4)/2=7/2 V. Gli ingressi medi V₀=9 V e C=3 μF darebbero 18/5 V; la differenza media delle uscite meno uscita agli ingressi medi è −1/10 V. La legge contiene un denominatore variabile. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto 4/3 applicato ai 3 V di A impone V_f, B=4 V. Con V₀, B=12 V, C_B=2(12/4−1)=4 μF. Rispetto ai 2 μF di A, il fattore è 2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La taratura D=aV_f ha a=9/(3 V)=3 V⁻¹. D_B=12 significa V_f, B=4 V. Con C_B=4 μF, V₀, B=4(2+4)/2=12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'I riferimenti 3 V→7 e 4 V→9 fissano a=2 V⁻¹ e b=1. D_C=13 significa V_f, C=6 V. Con C_C=3 μF si richiede V₀, C=6(2+3)/2=15 V, superiore a quella finale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Pongo c=C/(1 μF)>0. Il vincolo V₀=(3 V/μF)C dà V₀/(1 V)=3 c, quindi V_f/(1 V)=6 c/(2+c). Il dato 3 V impone 6 c=3(2+c), da cui c=2 e V₀=6 V. Una sola coppia positiva, senza radici spurie. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Sei volt imporrebbe il generatore ancora collegato. Dodici copia una carica in μC come tensione; 3/2 V divide due volte e zero confonde il nodo positivo con la carica netta complessiva.', 'C, F, J e 1 indicano carica, capacità, energia e rapporto puro. Q divisa per la capacità totale ha unità volt.', 'V₀ invariata richiederebbe un generatore oppure C=0, escluso. La frazione inversa supera V₀. Usare C al numeratore assegna carica iniziale al condensatore scarico; (C₀+C)V₀ è una carica.', 'Otto volt copia l’ingresso B; tre ignora il cambiamento, 3/2 dimezza ancora e sei copia l’ingresso A. La capacità finale resta 4 μF ma la carica iniziale cambia fra preparazioni.', 'Tre volt copia la tensione finale; 3/2 V ripete la frazione diretta e darebbe V_f=3/4 V. Dodici volt copia il numero della carica iniziale e darebbe V_f=6 V.', 'Quattro μF omette il termine meno uno e darebbe V_f=2 V. Un μF darebbe V_f=4 V. Il confine V_f=V₀ impone C=0, fuori dal modello con secondo componente positivo.', '3/4 è il reciproco. Due usa erroneamente solo 1/C e omette C₀; un mezzo segue C direttamente e uno ignora il cambiamento. I quattro volt restano sotto i sei volt iniziali.', '−3 V scambia l’ordine dello scarto; sei copia la proposta e zero la accetta. Due è un rapporto puro e non una differenza di tensioni.', 'La frazione inversa errata riduce V₀ invece di ricostruirla. C/C₀ omette l’addendo fisso. Gli ultimi quozienti hanno unità F/V e V/F, diverse dal volt.', 'κ₂ al numeratore scala l’ingresso sbagliato. Il prodotto perde il denominatore, il reciproco inverte B/A e κ₁/κ₂ ignora il termine C₀ che resta fissato.', '3/4 è il reciproco; due segue soltanto V₀. Un mezzo usa 1/C ignorando C₀ e uno presume una compensazione impedita dal termine fisso della capacità iniziale.', '18/5 V usa gli ingressi medi. Sette somma le uscite, un mezzo è la semidifferenza e quattro ripete B. La differenza rispetto ai dati medi è 1/10 V, calcolata esattamente.', 'Un mezzo inverte il rapporto; 4/3 copia quello delle tensioni finali e 3/4 il suo reciproco. Quattro copia il valore numerico di C_B in μF senza normalizzarlo ai 2 μF iniziali.', 'Quattro volt copia la tensione finale. Trentasei usa D=12 come tensione finale e ricostruisce D=36; otto volt darebbe D=8. La coincidenza numerica fra D=12 e V₀=12 V è contingente.', '65/4 V omette l’offset e ricostruisce D=14. Sei volt copia V_f; trenta omette il guadagno e tredici copia la lettura strumentale. Ogni esito è confutato reinserendolo nella legge.', 'C=1 μF darebbe V_f=2 V e C=3 μF darebbe 18/5 V. −2 μF viola la positività e annulla il denominatore. Infinite soluzioni non seguono da questo vincolo con C₀ fissato.']
ASSUMPTIONS=['C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.', 'C₀ fissato 2 μF, inizialmente carico, seconda capacità C positiva scarica. Generatori scollegati, conservazione della carica algebrica del futuro nodo e resistenza positiva per transitorio assestato. Energia del campo può essere convertita in calore; non ne è imposta conservazione. Tensione finale strettamente fra 0 eV₀. C₀ non viene scalato nel 10, preparazioni distinte, display continuo, vincolo 16 dimensionato e non ridondante.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-capacitor-charge-sharing-07', 'AR-u6-capacitor-charge-sharing-02', 'AR-u6-capacitor-charge-sharing-05', 'AR-u6-capacitor-charge-sharing-11', 'AR-u6-capacitor-charge-sharing-14', 'AR-u6-capacitor-charge-sharing-01', 'AR-u6-capacitor-charge-sharing-04', 'AR-u6-capacitor-charge-sharing-13', 'AR-u6-capacitor-charge-sharing-10', 'AR-u6-capacitor-charge-sharing-15', 'AR-u6-capacitor-charge-sharing-06', 'AR-u6-capacitor-charge-sharing-09', 'AR-u6-capacitor-charge-sharing-16', 'AR-u6-capacitor-charge-sharing-08', 'AR-u6-capacitor-charge-sharing-12', 'AR-u6-capacitor-charge-sharing-03'}
REVIEWED_CANDIDATES={'AR-u6-capacitor-charge-sharing-01': '1b3c22aacaff7c255de9f776d214c8966e2a9bff8b1fc70c04262e24d52687ec', 'AR-u6-capacitor-charge-sharing-02': 'dc97d2e67e6564816f223fd5ceead4750db8f7cca27ca448f4afcc5aa3a42e05', 'AR-u6-capacitor-charge-sharing-03': 'f14342df25070bfc44775d626b6b04a7047b4b9bcc6497fb20a4167b73d71ff9', 'AR-u6-capacitor-charge-sharing-04': '816034de1162c6d24db19ffbd1624f140e3691cd2e5d0d1d978985745984e5bc', 'AR-u6-capacitor-charge-sharing-05': '18f31907d423853083f24dd524fdd1bff4a70575450e57b1a12f091ca469932e', 'AR-u6-capacitor-charge-sharing-06': 'b859d2d86e57ec59e9ac412b7069fb00db0b16d31c62202ac8c2300101bfd28d', 'AR-u6-capacitor-charge-sharing-07': '26cf4e0a356ef93627ac28a5079f4ebc202804bb29db570abe4cd3c58c544824', 'AR-u6-capacitor-charge-sharing-08': 'daca7bb343966bd965a0b9b860dfd969ff0a4fbac44d0f27e8b390da74961c1a', 'AR-u6-capacitor-charge-sharing-09': '84b6edc8e0bf11de37af87de7ced2b1b80d70d0a0a0eedc00bd19b722f6387da', 'AR-u6-capacitor-charge-sharing-10': 'caf16fe3b70caef0313a76aeae5fdafaf0eea739aa4d3d7bc2ec8c0b9901a96c', 'AR-u6-capacitor-charge-sharing-11': '3ff79e8fc93429014b0b5ad1b22575b9ef1234e97eca10662a7e8b5033bb6f2d', 'AR-u6-capacitor-charge-sharing-12': '6996c3aece447990aef9bb7c051bb19938b0153d5af91ae7d1108e2ab21647b3', 'AR-u6-capacitor-charge-sharing-13': '2d3fa13fe843f7ff85dbbdc125b28a6cfe9dd204fb99d8edf4455aabfb7a0903', 'AR-u6-capacitor-charge-sharing-14': 'dd67d0fb4879c8fd382e30f58522f9d22c419d9d65e06b141c391bd7552e1a4d', 'AR-u6-capacitor-charge-sharing-15': 'a17e91bb71b4df35924f103447b30203f83a3674415e47acea3ea3abfd300140', 'AR-u6-capacitor-charge-sharing-16': 'ccc3941cf7b511d122521368f8ca06d5595ee29b65854a7bc639395751cc508a'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1160, 1), Fraction(240, 1), Fraction(42, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1580, 1)), (Fraction(150, 1), Fraction(1360, 1), Fraction(280, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(1260, 1), Fraction(320, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(155, 1), Fraction(360, 1), Fraction(42, 1))}
REQUIRED_PATHS={'M310 755V805', 'M32 454H608', 'M150 1130V1440', 'M310 625V675', 'M290 755V805', 'M110 650H290M310 650H530', 'M290 625V675', 'M110 650V780M530 650V780', 'M32 997H608', 'M150 130V325', 'M110 780H290M310 780H530'}
REQUIRED_CIRCLES={(Fraction(530, 1), Fraction(780, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(650, 1), Fraction(4, 1)), (Fraction(150, 1), Fraction(270, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(780, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(650, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
GEOMETRY_REVIEW='XML e native indipendente completo 640×1580 letti. Prima: barra carica 12 μC lunga 360 da x 150, scala 30 coordinate/μC; secondo elemento scarico è punto allo zero. Circuito finale con entrambi i rami agli stessi nodi, cariche 6+6 μC e tensione comune 3 V. Ultime uscite 3/4/7/2 V in barre 240/320/280 da x 150, scala 80 coordinate/V. Origini fuori dagli assi, tutte label leggibili; scala delle cariche distinta da quella delle tensioni.'
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

def result(initial,added):
    initial,added=map(_finite_exact,(initial,added))
    if min(initial,added)<=0:raise ValueError('Positive finite voltage and added capacitance required')
    return sp.cancel(2*initial/(2+added))

def inverse_first(final,added):
    final,added=map(_finite_exact,(final,added))
    if min(final,added)<=0:raise ValueError('Positive finite final voltage and capacitance required')
    return sp.cancel(final*(2+added)/2)

def inverse_second(final,initial):
    final,initial=map(_finite_exact,(final,initial))
    if not 0<final<initial:raise ValueError('Final voltage must lie strictly between zero and initial voltage')
    return sp.cancel(2*(initial/final-1))

def scaled(initial,added,k1,k2):
    initial,added,k1,k2=map(_finite_exact,(initial,added,k1,k2))
    if min(initial,added,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*initial,k2*added)/result(initial,added))

def constrained_second(final):
    final=_finite_exact(final)
    if not 0<final<6:raise ValueError('Constrained voltage must lie strictly between zero and6')
    return sp.cancel(2*final/(6-final))

@lru_cache(maxsize=1)
def oracle():
    c0,c,v0,vf=sp.symbols('C0 C V0 Vf',positive=True)
    solution=sp.solve(sp.Eq(c0*v0,(c0+c)*vf),vf);assert len(solution)==1 and sp.cancel(solution[0]-c0*v0/(c0+c))==0
    for variable,expected in [(v0,vf*(c0+c)/c0),(c,c0*(v0/vf-1))]:
        solution=sp.solve(sp.Eq(vf,c0*v0/(c0+c)),variable);assert len(solution)==1 and sp.cancel(solution[0]-expected)==0
    first=result(6,2);second=result(12,4);assert (first,second)==(3,4)
    q=SI.Quantity(2,'microfarad')*SI.Quantity(6,'volt');assert q.to('microcoulomb').magnitude==12
    final=(q/SI.Quantity(4,'microfarad')).to('volt');assert final.magnitude==3
    initial_energy=SI.Quantity(2,'microfarad')*SI.Quantity(6,'volt')**2/2
    final_energy=SI.Quantity(4,'microfarad')*final**2/2
    assert initial_energy.to('microjoule').magnitude==36 and final_energy.to('microjoule').magnitude==18
    assert result(9,3)==sp.Rational(18,5) and (first+second)/2==sp.Rational(7,2)
    fit=calibrate(first,second,9,12,7,9,13,'volt');assert fit==(3,1,4,6)
    assert constrained_second(3)==2 and result(3*2,2)==3
    return [first,'V','V_f = C₀ V₀ / (C₀ + C)','Da 3 a 4 V',inverse_first(first,2),inverse_second(first,6),scaled(6,2,1,sp.Rational(1,2)),6-first,'V₀ = V_f (C₀ + C) / C₀','κ₁ S / S_B',second/first,(first+second)/2,inverse_second(sp.Rational(4,3)*first,12)/2,inverse_first(fit[2],4),inverse_first(fit[3],3),constrained_second(first)]
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
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
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
