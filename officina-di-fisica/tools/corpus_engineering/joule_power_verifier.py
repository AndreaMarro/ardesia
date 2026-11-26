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
FAMILY='joule-power'
BATCH='joule-power-213'
ASSET_NAME='joule-power-progressive.svg'
REVIEWED_PACKAGE_SHA256='e7af67da73664708d09fd4ef8005dd8303439dd0ebc44bec2228556daf4b1494'
REVIEWED_BINDINGS_SHA256='d303c79919a27a64b0777fa9b5e2456ab31e77a806ba984b4e6177675d1f4fa8'
SOURCE_REFERENCE='Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.'
FALSE_PROOF='A corrente fissata,raddoppiare la resistenza dimezza sempre la potenza dissipata.'
SVG_MUTATION=(b'width="240"', b'width="241"')
EXPECTED_MAPPING={1: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 2: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 3: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 4: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 5: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 6: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 7: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 8: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 9: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 10: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 11: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 12: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 13: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 14: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 15: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 16: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06'])}
NUMERIC_UNITS={1: 'W', 5: 'A', 6: 'Ω', 14: 'A'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: ' W', 13: '', 15: ' A', 16: ' Ω'}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'ampere', 6: 'ohm', 7: 'dimensionless', 8: 'dimensionless', 9: 'ampere', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'ampere', 15: 'ampere', 16: 'ohm'}
MANUAL=['Potenza elettrica entrante nel resistore passivo: P=VI. Per Ohm V=RI, quindi P=I²R. Con 2 A e 3 Ω si ha P=4·3=12 W. È conversione di energia elettrica in energia interna, non una quantità di calore contenuta nel corpo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La potenza ha unità W=J/s=V·A=A²Ω. La potenza e l’energia hanno dimensioni diverse; un intervallo sarebbe necessario per ricavare energia. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Un resistore ohmico a R costante soddisfa V=RI e P=VI=I²R. Il segno è positivo nella convenzione passiva; un’eventuale corrente orientata negativa darebbe ancora I²R, ma qui I>0 è assegnata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 12 W; B a 1 A con 3 Ω dà 3 W. Dimezzare I riduce la potenza a un quarto, non a metà. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'I=√(P/R), ramo positivo assegnato. Con 12 W e 3 Ω, I=√4 A=2 A. La radice negativa non è ammessa dal dominio della corrente qui dichiarato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R=P/I²=12 W/(4 A²)=3 Ω. Non si divide per I una sola volta: quello darebbe una tensione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 12 W; B con I 2 A e R 1 Ω dà 4 W. Rapporto 1/3 a corrente mantenuta; la dipendenza inversa da R varrebbe a tensione mantenuta, altro controllo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Caso autonomo: utilizzatori in parallelo allo stesso 12 V. I_A=P_A/V=18/12 A=3/2 A, I_B=6/12 A=1/2 A. Rapporto I_A/I_B=3. Non è lo scarto proposto/corretto del modello principale e non richiede che i carichi siano resistori ohmici. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da P=I²R segue I=√(P/R)>0. W/Ω ha unità A² e la radice restituisce ampere. La forma I=P/V è pure valida se si assume noto V, ma l’inversa in termini di P, R usa la radice. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'P_B/P_A=(κ₁I)²κ₂R/(I²R)=κ₁²κ₂. Il quadrato investe soltanto il fattore della corrente e un fattore comuneκ sui due ingressi dàκ³. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 12 W; B con 1 A e 4 Ω dà 4 W. Rapporto 1/3: il fattore 1/4 dalla corrente compensa solo in parte il fattore 4/3 di R. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media (12+4)/2=8 W. Ai dati medi I 3/2 A, R 7/2 Ω si avrebbe(9/4)(7/2)=63/8 W, distinto da 64/8 W. Le prove sono pesate ugualmente e non sono due resistori simultanei. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio P_B=(1/3)12=4 W. Con I_B 1 A, R_B 4 Ω e R_B/R_A=4/3. Si isola prima la resistenza dopo aver fissato la corrente nuova. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento 12 W→36 dà gain 3 per watt. S 12 decodifica P_B 4 W. Con R_B 4 Ω si ha I_B√(4/4)=1 A, ramo positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 12 W→25 e 4 W→9 danno a 2 per watt e b 1. S 37 decodifica P_C=(37−1)/2=18 W. R_C 2 Ω impone I_C√9=3 A. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo dimensionato I=(2/3 A/Ω)R dà P=(4/9 A²/Ω²)R³. In unità ohm si trova R³=27 Ω³ e quindi R 3 Ω, unica radice positiva; I 2 A. La radice cubica reale di 27 è unica e positiva; nessun secondo ramo reale negativo soddisfa questa equazione. Il dominio R>0 è preservato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Sei da IR è volt; 4 copia I², 18 usa IR², 36 quadra entrambi i parametri. Solo I²R ricompone 12W.', 'J energia, V tensione, Ω resistenza, A corrente. Potenza W=J/s non si confonde con energia trasferita.', 'IR ha V; IR² dipendenza errata daR; I²/R dimensioni non W; R/I² non derivato daVI. Passivo significa P positiva con riferimenti coerenti.', 'Sei applica legge lineare in I, 12 ignora, 24 e 48 invertono riduzione. Anche V cambia da 6 a 3V, non è tenuta fissa.', 'Quattro A copia I² e dà 48W; −2 è verso e non modulo. Sei A dà 108W. R/P non ha A².', 'Sei Ω divide una volta e dà 24W; 48 moltiplica per I²; 1/3Ω dà 4/3W. I=0 e P0 non determinerebbero R.', 'Tre sarebbe diverso controllo V costante; uno ignora R, 1/9 e 9 inventano R². A corrente fissata la legge è diretta in R.', '1/3 inverte A/B; due non segue 18/6; 12 copia V; uno presuppone correnti uguali. Differenza 1A è altro compito. P=VI comune dà 3.', 'P/R è I², √(PR) è V, R/P è A⁻²; il ramo negativo non è modulo. La radice corretta ha A.', 'κ₁κ₂ perde I, κ₁²/κ₂ scambia controllo, κ₂²κ₁ scambia esponenti, κ₂/κ₁² rende inverso I.', 'Tre reciproco, 1/2 segue I, 4/3 segue R, 2/3 omette il quadrato della corrente. Il prodotto corretto è(1/4)(4/3)=1/3.', '63/8 usa ingressi medi; 16 somma, 4 e 12 singole prove. Non è una media temporale senza durate assegnate.', '3/4 reciproco, 1/3 copia P, 2 usa solo inverso diI. Quattro copia il numero di R_B in ohm senza dividerlo per 3Ω.', '√3A usa D12 come W, 2A dà 16W eD48, 4A dà 64W. Decodificare P4W prima di estrarre radice con R4Ω.', '37/4 usa I² ricavato senzaoffset come corrente; 9A dà 162W, 18A copia numero P; 1A ricompone D5. TreA ricompone D37.', '27 copia cubo, 2Ω dà 32/9W, −3 viola passività e segno di I. Cubica strettamente crescente su dominio positivo, fissa R3Ω.']
ASSUMPTIONS=['Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.', 'Resistore ohmico passivo con R mantenuta finita positiva entro prova; corrente continua di modulo positivo che entra nel morsetto alto. P convertita termicamente non impone aumento di temperatura; può esserci scambio esterno. Caso 08 autonomo su carichi assorbenti alla stessa tensione 12V e P=VI, senza richiedere carichi ohmici uguali. Display continuo e vincolo dimensionato 16 fra preparazioni, non rampa.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Caso08 autonomo: rapporto di correnti daP=VI con tensione comune, non scarto di proposta; carichi non necessariamente ohmici.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-joule-power-06', 'AR-u6-joule-power-07', 'AR-u6-joule-power-02', 'AR-u6-joule-power-09', 'AR-u6-joule-power-13', 'AR-u6-joule-power-03', 'AR-u6-joule-power-01', 'AR-u6-joule-power-12', 'AR-u6-joule-power-05', 'AR-u6-joule-power-15', 'AR-u6-joule-power-11', 'AR-u6-joule-power-08', 'AR-u6-joule-power-10', 'AR-u6-joule-power-14', 'AR-u6-joule-power-04', 'AR-u6-joule-power-16'}
REVIEWED_CANDIDATES={'AR-u6-joule-power-01': 'f9a8f5a818c7a765bcd893fc72d5be3fb2459e6724ee5e4fc02119126d6d4a41', 'AR-u6-joule-power-02': '2f89c774f829f42e7b0892aa862f43d518351d23aad24fd33484310c568c3a19', 'AR-u6-joule-power-03': 'a9b3f75e8fc290a21f4ef6286b085fed4bb171956e468603dd7f7cb77a9a6e48', 'AR-u6-joule-power-04': '0f65f50a8fef8490249d0ee846243eb68f4e5a596e0b64315902d3ec59bcde70', 'AR-u6-joule-power-05': '0baf9bf758bd0753daf9f2aaa8aa042609db12f43425630743e0c2f4611cd630', 'AR-u6-joule-power-06': 'd85ddeba1a3228250ab83ac1edef46d789865943b183b62cd319ee0de79b83ec', 'AR-u6-joule-power-07': '0aac144cba878c8532d24b202bcd6d73ce8f43b5444ceaba26e877b4ab118af3', 'AR-u6-joule-power-08': '27f3cd13ec0289c892f46b6e0e4c5094532570c5e8c82993bbc7f33cb22ed2e3', 'AR-u6-joule-power-09': 'b84472142a9ec8b659e1ad50c299a2e5d10e24bd02db836551fd041581bb29b0', 'AR-u6-joule-power-10': 'bb96cf9fa64826ea357c304eb0f1cff56a883ba07975257f0caa3e8ac1e48d99', 'AR-u6-joule-power-11': 'baad55928eb177f8a070d3f051f6e0422516a97771dd17abbaa1a6cd5058c0c5', 'AR-u6-joule-power-12': 'aa6f886dec7b220ec2726aae6572dca6c17c859e0d55f0f0c9f8faa266f3f05f', 'AR-u6-joule-power-13': 'ccf354d58d8f8b3e64f6892838ee33634f7a93e59388234c8d9c50f73265a188', 'AR-u6-joule-power-14': '2586ed1acd015d2146da885030247d0c6161fead57b37513020f413fb7330678', 'AR-u6-joule-power-15': '6027bf4f2a317177e1231cf79e2d7b6f1c57249f57c059cfdcdc3269dee61c45', 'AR-u6-joule-power-16': 'd70a4f3adbc0bc03e16973cce1eb542ca4e59c5d08e348932606ca351a025bce'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1260, 1), Fraction(160, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1060, 1), Fraction(240, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1160, 1), Fraction(80, 1), Fraction(34, 1)), (Fraction(270, 1), Fraction(200, 1), Fraction(140, 1), Fraction(60, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(680, 1), Fraction(1540, 1))}
REQUIRED_PATHS={'M100 550V800H540', 'M240 740Q310 680 380 560', 'M100 230H270M410 230H580'}
REQUIRED_CIRCLES={(Fraction(240, 1), Fraction(740, 1), Fraction(5, 1)), (Fraction(580, 1), Fraction(230, 1), Fraction(5, 1)), (Fraction(380, 1), Fraction(560, 1), Fraction(5, 1)), (Fraction(100, 1), Fraction(230, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1330, 1), Fraction(450, 1), Fraction(1330, 1)), (Fraction(150, 1), Fraction(1040, 1), Fraction(150, 1), Fraction(1330, 1))}
GEOMETRY_REVIEW='Schema A(+) a sinistra, B(−) a destra, resistore 3Ω e corrente entrante dal lato A secondo testo. Parabola esatta P=3I² per 1≤I≤2: I=1+u, x 240+140 u, y 740−120 u−60 u², daM240740Q310680380560; origine degli assi 100800, scale 140 unità/A e 20 unità/W. Punti 3/12W corretti, label 3W fuori curva. Barre 12/4/8W lunghe 240/80/160, scala 20 unità/W; B haR4Ω separato.'
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

def result(current,resistance):
    current,resistance=map(_rational_exact,(current,resistance))
    if min(current,resistance)<=0:raise ValueError('Positive constant current and passive ohmic resistance required')
    return Fraction((SI.Quantity(current,'ampere')**2*SI.Quantity(resistance,'ohm')).to('watt').magnitude)
def inverse_current(power,resistance):
    power,resistance=map(_finite_exact,(power,resistance))
    if power.is_positive is not True or resistance.is_positive is not True:raise ValueError('Positive power and resistance required')
    return sp.sqrt(power/resistance)
def inverse_resistance(power,current):
    power,current=map(_rational_exact,(power,current))
    if min(power,current)<=0:raise ValueError('Positive power and nonzero positive current required')
    return power/current**2
def scaled(current,resistance,a,b):
    current,resistance,a,b=map(_rational_exact,(current,resistance,a,b))
    if min(current,resistance,a,b)<=0:raise ValueError('Positive factors and passive state required')
    return result(a*current,b*resistance)/result(current,resistance)
def parallel_load_current_ratio(first_power,second_power,voltage):
    first_power,second_power,voltage=map(_rational_exact,(first_power,second_power,voltage))
    if min(first_power,second_power,voltage)<=0:raise ValueError('Positive load powers and common nonzero voltage required')
    first=(SI.Quantity(first_power,'watt')/SI.Quantity(voltage,'volt')).to('ampere')
    second=(SI.Quantity(second_power,'watt')/SI.Quantity(voltage,'volt')).to('ampere')
    return Fraction((first/second).to('dimensionless').magnitude)
def constrained_resistance(power):
    power=_finite_exact(power)
    if power.is_positive is not True:raise ValueError('Positive power required')
    return sp.real_root(9*power/4,3)

@lru_cache(maxsize=1)
def oracle():
    p,i,r=sp.symbols('P I R',positive=True)
    _solutions=sp.solve(sp.Eq(p,i*i*r),i)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(sp.sqrt(p)/sp.sqrt(r)))==0
    _solutions=sp.solve(sp.Eq(p,i*i*r),r)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(p/(i*i)))==0
    first=sp.Rational(result(2,3));second=sp.Rational(result(1,4));assert (first,second)==(12,4)
    fit=calibrate(first,second,36,12,25,9,37,'watt');assert fit==(3,1,4,18)
    assert result(Fraction(3,2),Fraction(7,2))==Fraction(63,8)
    assert parallel_load_current_ratio(18,6,12)==3
    assert constrained_resistance(12)==3 and result(2,3)==12
    return [first,'W','P = I² R','Da 12 a 3 W',inverse_current(first,3),inverse_resistance(first,2),scaled(2,3,1,Fraction(1,3)),parallel_load_current_ratio(18,6,12),'I = √(P/R)','κ₁² κ₂',second/first,(first+second)/2,inverse_resistance(first/3,1)/3,inverse_current(fit[2],4),inverse_current(fit[3],2),constrained_resistance(first)]
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
