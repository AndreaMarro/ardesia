"""Independent source-first U6-03 laws; no candidate authoring imports.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
SOURCE_ONLY_MODELS_SHA256='97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f'
CANDIDATE_REF='156d5924c9bbdfd8fa815c1d3af49ffb9226f255'
PRIMARY_SHA256='5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509'
FAMILY='voltage-divider'
BATCH='voltage-divider-211'
ASSET_NAME='voltage-divider-progressive.svg'
REVIEWED_PACKAGE_SHA256='0c6256c6417c4ee7cb755df4b8ce46e7f2ee55922941f34d90390d6d2832ff0a'
REVIEWED_BINDINGS_SHA256='b85034135b1c45e08e7c6e0a6e5c96206ecd1ef6ea604d02dfd384009ab5cce2'
SOURCE_REFERENCE='Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.'
FALSE_PROOF='L’uscita aperta di un partitore resta uguale anche collegando qualsiasi carico fra M e B.'
SVG_MUTATION=(b'width="180"', b'width="181"')
EXPECTED_MAPPING={1: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 2: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 3: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 4: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 5: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 6: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 7: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 8: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 9: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 10: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 11: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 12: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 13: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 14: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 15: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 16: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06'])}
NUMERIC_UNITS={1: 'V', 5: 'Ω', 6: 'Ω', 14: 'Ω'}
OPTION_SUFFIX={7: '', 8: ' V', 11: '', 12: ' V', 13: '', 15: ' Ω'}
UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'ohm', 6: 'ohm', 7: 'dimensionless', 8: 'volt', 9: 'ohm', 10: 'dimensionless', 11: 'dimensionless', 12: 'volt', 13: 'dimensionless', 14: 'ohm', 15: 'ohm', 16: 'dimensionless'}
MANUAL=['Nel circuito a serie senza carico, I=12 V/(R₁+R₂) e V₂=IR₂. Con 2 Ω e 2 Ω, I 3 A e V₂6 V. Corrente comune e cadute positive sommate a 12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V₂ è una differenza di potenziale con unità V=J/C. Il rapporto di resistenze nella partizione è puro, quindi la dimensione resta quella della sorgente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dalla legge di Ohm in ciascun ramo in serie e Kirchhoff: V₂=(12 V)R₂/(R₁+R₂). L’assenza di carico al nodo intermedio è necessaria per questa forma; con entrambi i resistori positivi si ha 0<V₂<12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 V. B con R₁1 Ω, R₂2 Ω dà V₂=12·2/3=8 V. R₁ più piccola aumenta la corrente comune e la caduta sul resistore inferiore non modificato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R₁=R₂[(12 V)/V₂−1]. Con V₂6 V e R₂2 Ω si ottiene 2(2−1)=2 Ω. V₂ deve essere strettamente tra 0 e 12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V₂R₁=(12 V−V₂)R₂. Quindi R₂=V₂R₁/(12 V−V₂)=6·2/(12−6) Ω=2 Ω. Denominatore positivo nel dominio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 V; B con R₁2 Ω, R₂4 Ω dà 8 V. Rapporto 8/6=4/3, non raddoppio del solo resistore R₂ perché cambia anche il totale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Proposta 12 V meno corretta 6 V dà+6 V. Un resistore superiore positivo impedisce a V₂ di essere tutta la tensione della sorgente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V₂(R₁+R₂)=(12 V)R₂ dà R₁=R₂[(12 V)/V₂−1]. Il rapporto di tensioni è puro e il risultato è una resistenza positiva solo con 0<V₂<12 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Inserendo i fattori: V₂, B/V₂, A=κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂). Un fattore comune su entrambe le resistenze lascia la tensione divisa invariata; non si applica il sempliceκ₂/κ₁. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 V; B con R₁3 Ω, R₂1 Ω dà 3 V. Rapporto 1/2. La sorgente resta 12 V anche se cambia la corrente totale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media delle letture (6+3)/2=9/2 V. Qui gli ingressi medi R₁5/2 Ω, R₂3/2 Ω hanno somma 4 Ω come entrambe le prove e danno anch’essi 9/2 V. È una coincidenza condizionata al totale costante: A(1, 1) Ω dà 6 V e B(1, 3) Ω dà 9 V, media 15/2 V, mentre ingressi medi(1, 2) Ω darebbero 8 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio V₂, B=3 V. Con R₁, B 3 Ω, 3=(12)R₂/(3+R₂), quindi 9=9 R₂ nelle unità in ohm e R₂, B 1 Ω. Rapporto R₂, B/R₂, A=1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento 6 V→S 18 dà a 3 per volt. S 9 significa 3 V. Con R₂1 Ω, R₁=1(12/3−1) Ω=3 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 6 V→13 e 3 V→7: a=(13−7)/(6−3)=2 per volt, b=1. S 17 decodifica V₂, C 8 V. R₂, C 2 Ω impone R₁, C=2(12/8−1)=1 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo R₁=R₂>0 rende V₂6 V per ogni scala comune delle due resistenze. Infinite coppie positive continue; la misura è ridondante e non determina la corrente assoluta senza la scala resistiva. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Dodici V non lascia caduta al primo resistore positivo; 3 copia I, 4 copia Rtot, 2 copia un resistore. U=IR₂ dà 6 V.', 'A, Ω, W sono corrente, resistenza, potenza; uno è solo il rapporto resistivo. Il rapporto puro moltiplicato per E è ancora tensione.', 'R₁ al numeratore dà la caduta superiore. Invertire frazione supera E; solo R₁ al denominatore perde il totale. ER₁R₂ ha unità VΩ².', 'Tre dimezza U seguendo R₁ direttamente; 6 assume corrente fissata; 12 annulla la caduta superiore; 4 è invece la caduta finale su R₁.', 'R₁6Ω dà U3V, 4Ω dà 4V. La sottrazione fra tensione e resistenza non è omogenea; U0 esclude l’inversa con R₂ positivo.', 'R₂4Ω dà 8V, 1Ω dà 4V. Denominatore E+U darebbe 2/3Ω; U=E non può avere R₁>0 e R₂ finito.', '3/4 reciproco, due segue solo R₂, 1/2 ne inverte l’effetto, uno ignora modifica. U_B8V resta sotto 12V.', '−6V scambia ordine; 12 copia proposta, zero la accetta. Due è un rapporto puro senza unità volt.', 'E+U altera il raccoglimento; invertire rapporto delle tensioni non isola R₁. Con E12V, U3V, R₂1Ω il corretto è 3Ω e il distrattore dà 1/3Ω. U/R₂ ha A, R₂−U non è omogeneo.', 'κ₁ scala l’elemento errato al numeratore; prodotto omette il totale; reciproco scambia B/A; κ₂/κ₁ non descrive una somma. Scalatura comune dà uno.', 'Due reciproco, 3/2 segue R₁, 1/3 è rapporto interno R₂/R₁ e non uscita relativa fra prove. Uno ignora la ripartizione a totale costante.', 'Nove somma senza dimezzare, 3/2 è semidifferenza, 6 e 3 ripetono una lettura. Medie coincidono qui per il totale 4Ω, con controesempio separato esatto negli oracoli.', 'Due reciproco, 1/3 confonde rapporto di rami in B con rapporto fra prove, 3/2 segue solo R₁. R₂ invariato 2Ω darebbe 24/5V, non 3V.', '1/3Ω usa D9 come 9V; 1Ω dà 6V; 9Ω dà 6/5V. Il corretto 3Ω ricompone 3V e D9.', '14/17Ω omette b e restituisce D18; 2Ω dà 13, 4Ω dà 9, 8Ω dà 29/5. Un Ω riproduce 17.', 'Coppie singole sono esempi; qualunque scala comune positiva è ammessa, ma non resistori indipendenti. Una corrente misurata aggiungerebbe scala, non presente.']
ASSUMPTIONS=['Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.', 'Generatore ideale 12V, coppia in serie senza carico al nodo M, voltmetro ideale; corrente comune da A a B e uscita U=V_M−V_B positiva. Due resistori finiti positivi, 0<U<E; nessun controllo simultaneo della corrente. S, S_B sono somme resistive definite, non conduttanze. Preparazioni separate, display continuo e uguaglianza 16 con scala libera.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-voltage-divider-02', 'AR-u6-voltage-divider-05', 'AR-u6-voltage-divider-10', 'AR-u6-voltage-divider-13', 'AR-u6-voltage-divider-03', 'AR-u6-voltage-divider-16', 'AR-u6-voltage-divider-15', 'AR-u6-voltage-divider-01', 'AR-u6-voltage-divider-12', 'AR-u6-voltage-divider-08', 'AR-u6-voltage-divider-07', 'AR-u6-voltage-divider-04', 'AR-u6-voltage-divider-06', 'AR-u6-voltage-divider-09', 'AR-u6-voltage-divider-11', 'AR-u6-voltage-divider-14'}
REVIEWED_CANDIDATES={'AR-u6-voltage-divider-01': '08f2bce6c9aeb790efb1c9622ca2be47faa1cf7e8393b5dc9c0bd781899bfb31', 'AR-u6-voltage-divider-02': '9f43de84e2dcb5ebfd6f09391a7f0b258f72f6539684bd7fd3e788095874410e', 'AR-u6-voltage-divider-03': '751f886ca5cf2e989bed4f38589ee31856d0172289f7faa5e2a24e7e08b9588b', 'AR-u6-voltage-divider-04': 'fa2a4260625754ff46533b865faefdd28eb6d276955ef762c575433dd8598125', 'AR-u6-voltage-divider-05': '482573693c2dd3007db42e31f69425496f74b0bd2b9bbf56ffbdafbb8c16545d', 'AR-u6-voltage-divider-06': '027f146e26676ac9bd86b58b1ff9c1a14c2923686bf1a75cbbd831cb2cfd63fa', 'AR-u6-voltage-divider-07': '7e91d144b65bfdace8d9d0dc057274e09f09061cf4aaca65b94710ebb6515df3', 'AR-u6-voltage-divider-08': '0d5828b019d29592592cc302d3a5062e5f000bd9c32b1ec01423263fb75dda28', 'AR-u6-voltage-divider-09': 'bdfc23399d6d098c98004231ac7fab45a9dc861a498efcdf711d6f914c01e49c', 'AR-u6-voltage-divider-10': '7d693cb112d90361677475a5940c1ff7efd5b809897f531f3da1133aaebdb3b2', 'AR-u6-voltage-divider-11': '7471127861d3efe3afee6885c8f1a70acd02320a725677ef1acd0bb07886a183', 'AR-u6-voltage-divider-12': '38baaf1882ae13efc535769ab0e57464c586f6a0d95d4507e0e5ee540dd0446d', 'AR-u6-voltage-divider-13': '43771ba276b7f667088ee53275efa91f2bd5f9fbb84573a9732479dcf565e0f7', 'AR-u6-voltage-divider-14': '68c1268c5ee16ec669d671685f5b4c63fa9e46d4de928ee611a4e734f0dae612', 'AR-u6-voltage-divider-15': '268e0a8fb5f200374e9b892f663114058153b40e50abd9d79a3dbc4c02182d1b', 'AR-u6-voltage-divider-16': 'c0af4abe8491dff6c8ca4ae29f8479d15a8e0003ef4eddc040f12b7068606516'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1230, 1), Fraction(120, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(675, 1), Fraction(180, 1), Fraction(40, 1)), (Fraction(270, 1), Fraction(775, 1), Fraction(240, 1), Fraction(40, 1)), (Fraction(330, 1), Fraction(675, 1), Fraction(180, 1), Fraction(40, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(680, 1), Fraction(1600, 1)), (Fraction(150, 1), Fraction(1130, 1), Fraction(240, 1), Fraction(34, 1)), (Fraction(460, 1), Fraction(180, 1), Fraction(40, 1), Fraction(80, 1)), (Fraction(460, 1), Fraction(340, 1), Fraction(40, 1), Fraction(80, 1)), (Fraction(150, 1), Fraction(1330, 1), Fraction(180, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(775, 1), Fraction(120, 1), Fraction(40, 1))}
REQUIRED_PATHS={'M160 260V140H480V180M480 260V340M480 420V460H160V340M480 300H600M480 460H600'}
REQUIRED_CIRCLES={(Fraction(480, 1), Fraction(300, 1), Fraction(5, 1)), (Fraction(160, 1), Fraction(300, 1), Fraction(40, 1)), (Fraction(600, 1), Fraction(300, 1), Fraction(5, 1)), (Fraction(600, 1), Fraction(460, 1), Fraction(5, 1)), (Fraction(480, 1), Fraction(140, 1), Fraction(5, 1)), (Fraction(480, 1), Fraction(460, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1405, 1), Fraction(440, 1), Fraction(1405, 1)), (Fraction(150, 1), Fraction(845, 1), Fraction(545, 1), Fraction(845, 1)), (Fraction(150, 1), Fraction(1105, 1), Fraction(150, 1), Fraction(1405, 1))}
GEOMETRY_REVIEW='Circuito con generatore positivo in alto, R₁ sopra M, R₂ sotto M, morsetti M/B aperti e nessun corto o carico. Barre centrali cadute 6+6 e 4+8V lunghe 180+180 e 120+240, scala 30 unità/V. Ultime uscite 6/3/9/2V lunghe 240/120/180, scala 40 unità/V; B finale distinto da caso centrale. Zeri fuori assi e label non sovrapposte.'
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
    for suffix in (' mA',' W',' J',' s',' Ω',' V',' A',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(upper,lower):
    upper,lower=map(_rational_exact,(upper,lower))
    if min(upper,lower)<=0:raise ValueError('Positive passive resistances and unloaded node required')
    return Fraction((SI.Quantity(12,'volt')*lower/(upper+lower)).to('volt').magnitude)
def inverse_upper(total,lower):
    total,lower=map(_rational_exact,(total,lower))
    if not 0<total<12 or lower<=0:raise ValueError('Voltage strictly between zero and source,positive known resistor required')
    return lower*(12-total)/total
def inverse_lower(total,upper):
    total,upper=map(_rational_exact,(total,upper))
    if not 0<total<12 or upper<=0:raise ValueError('Voltage strictly between zero and source,positive known resistor required')
    return total*upper/(12-total)
def scaled(upper,lower,a,b):
    upper,lower,a,b=map(_rational_exact,(upper,lower,a,b))
    if min(upper,lower,a,b)<=0:raise ValueError('Positive preparation factors and resistors required')
    return result(a*upper,b*lower)/result(upper,lower)
def constrained_value(resistance):
    resistance=_rational_exact(resistance)
    if resistance<=0:raise ValueError('Positive common resistance required')
    return result(resistance,resistance)

@lru_cache(maxsize=1)
def oracle():
    a,b,u,e,k1,k2=sp.symbols('a b u e k1 k2',positive=True)
    _solutions=sp.solve(sp.Eq(u,e*b/(a+b)),a)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(b*(e-u)/u))==0
    _solutions=sp.solve(sp.Eq(u,e*b/(a+b)),b)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(a*u/(e-u)))==0
    assert sp.simplify((e*k2*b/(k1*a+k2*b))/(e*b/(a+b))-k2*(a+b)/(a*k1+b*k2))==0
    first=sp.Rational(result(2,2));second=sp.Rational(result(3,1));assert (first,second)==(6,3)
    fit=calibrate(first,second,18,9,13,7,17,'volt');assert fit==(3,1,3,8)
    assert result(Fraction(5,2),Fraction(3,2))==Fraction(9,2)
    assert (result(1,1)+result(1,3))/2==Fraction(15,2) and result(1,2)==8
    assert constrained_value(1)==constrained_value(3)==6
    return [first,'V','U = E R₂ / (R₁ + R₂)','Da 6 a 8 V',inverse_upper(first,2),inverse_lower(first,2),scaled(2,2,1,2),12-first,'R₁ = R₂ (E − U) / U','κ₂ S / S_B',second/first,(first+second)/2,inverse_lower(first/2,3)/2,inverse_upper(fit[2],1),inverse_upper(fit[3],2),'Infinite coppie positive con R₁ = R₂']
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_node_current_series_voltage_Joule_energy_integer_counts_inverse_and_calibration",
            "Pint_exact_resistance_current_voltage_power_energy_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-circuit-power-210-214-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-03","U2-01")
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
