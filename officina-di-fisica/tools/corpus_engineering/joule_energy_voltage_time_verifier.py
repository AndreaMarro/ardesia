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
FAMILY='joule-energy-voltage-time'
BATCH='joule-energy-voltage-time-214'
ASSET_NAME='joule-energy-voltage-time-progressive.svg'
REVIEWED_PACKAGE_SHA256='4331f2badf008f46941287a4de941c1b519e42f3425a6430976a1ecb6a3bbf1e'
REVIEWED_BINDINGS_SHA256='b342008ce68aa1c6ae710e85ab734e61bb093b391b0cdd83d99dc8f8fb9d4237'
SOURCE_REFERENCE='R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.'
FALSE_PROOF='Nel vincolo fra preparazioni V=αT,la tensione deve necessariamente crescere come ατ dentro ogni singola prova.'
SVG_MUTATION=(b'width="300"', b'width="301"')
EXPECTED_MAPPING={1: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 2: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 3: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 4: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 5: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 6: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 7: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 8: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 9: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 10: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 11: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 12: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 13: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 14: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 15: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06']), 16: ('C4-L06', ['C1-L001', 'C1-L007', 'C4-L03', 'C4-L05', 'C4-L06'])}
NUMERIC_UNITS={1: 'J', 5: 'V', 6: 's', 14: 'V'}
OPTION_SUFFIX={7: '', 8: ' J', 11: '', 12: ' J', 13: '', 15: ' V', 16: ' s'}
UNITS={1: 'joule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'volt', 6: 'second', 7: 'dimensionless', 8: 'joule', 9: 'volt', 10: 'dimensionless', 11: 'dimensionless', 12: 'joule', 13: 'dimensionless', 14: 'volt', 15: 'volt', 16: 'second'}
MANUAL=['A tensione costante sul resistore R 2 Ω, P=V²/R e l’energia trasferita nel tempo è E=Pt. Con 2 V e 3 s, P 2 W e E 6 J. Il resistore è ideale a R costante; nessun riscaldamento modifica qui R. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'L’energia ha unità J=W·s=V²s/Ω. Non è watt: quello è il tasso di trasferimento, mentre E integra quel tasso per la durata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da P=VI=V²/R e V, R costanti nell’intervallo, E=∫Pdt=V²t/(2 Ω). In unità numeriche V in volt e t in secondi, E in joule vale V_num²t_num/2; il 2 rappresenta una resistenza, non un puro coefficiente fisico universale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 J; B con 1 V e 3 s dà 3/2 J. Tensione dimezzata riduce P ed E a un quarto a durata fissata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V=√(ER/t), positivo. Con E 6 J, R 2 Ω, t 3 s si ottiene√4 V=2 V. Unità J·Ω/s=V² prima della radice. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 't=ER/V²=(6 J·2 Ω)/(4 V²)=3 s. Durata positiva perché E, R, V² sono positivi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 J; B con 2 V e 5 s dà 10 J. Rapporto 10/6=5/3, lineare nella durata a tensione fissa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Proposta 12 J meno corretto 6 J dà+6 J. Dodici J corrisponderebbero, per esempio, al doppio della durata a tensione 2 V, non alle condizioni assegnate. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da E=V²t/R segue V=√(ER/t)>0. Sostituisco R=2 Ω mantenendone la dimensione; non scrivo una radice di 2 E/t priva della resistenza dimensionata quando si ragiona in unità fisiche. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'E_B/E_A=κ₁²κ₂, perché R non cambia e la durata entra linearmente. Un fattore comuneκ agli ingressi dàκ³, nonκ². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 J; B a 4 V per 2 s dà 16 J. Rapporto 16/6=8/3. Il fattore quattro della tensione al quadrato moltiplica 2/3 dalla durata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media (6+16)/2=11 J. Ai dati medi V 3 V, t 5/2 s si avrebbe 9·(5/2)/2=45/4 J, diverso da 44/4 J. Uguale peso delle due uscite, non tensione efficace di un’unica forma variabile. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio E_B=(8/3)6=16 J. A V_B 4 V, t_B=E_BR/V_B²=2 s; t_B/t_A=2/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento 6 J→18 dà gain 3 per joule. S 48 decodifica 16 J. Con t_B 2 s e R 2 Ω, V_B√16=4 V, ramo positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 6 J→13 e 16 J→33 danno a 2 per joule e b 1. S 37 decodifica E_C 18 J; con t_C 1 s, R 2 Ω si trova V_C√36=6 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo V=(2/3 V/s)t produce E=(2/9 J/s³)t³. Con E 6 J, t³=27 s³ e t 3 s, unica durata positiva; V 2 V. La durata non può essere una radice negativa o un valore di tensione scambiato per secondi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['12J omette divisore R2Ω, due copia P, tre T, 2/3 inverte tempo. W·s ricostruisce 6J.', 'W tasso, V tensione, s tempo, Ω resistenza: l’energia haJ. Serve la durata per integrare P costante.', 'VT/R perde V e nonenergia; T al denominatore inverte effetto; R al numeratore usa altra legge; T² non è potenza costante.', 'TreJ segue Vlinearmente, sei ignora; 12/24 invertono variazione. UnV al quadrato su 2Ω dà 1/2W e per 3 s dà 3/2J.', 'Quattro V copia V² e dà 24J; −2 fuori dominio; 6V dà 54J. Unità sotto radice V² e segno positivo entrambi necessari.', 'Sei s dà 12J; 3/2 s omette R e dà 3J; 2 s copia P e dà 4J. Energia su potenza restituisce durata.', '3/5 reciproco, 25/9 quadra T, uno ignora, due nonsegue 5/3. E èlineare inT quando Vcostante.', '−6J scambia ordine, 12 copia proposta, zeroaccetta. Due èrapporto puro, non energia.', 'ER/T èV²; ET/R haC² e sua radice carica. R/(ET) haC⁻² e radice C⁻¹. Ramo negativo non ammesso per caduta Vpositiva.', 'κ₁κ₂ perde V; κ₁²/κ₂ inverte T; κ₁κ₂² quadra T anziché V; κ₂/κ₁² inverteeffetto V. R invariata cancella.', '3/8 reciproco, 4/3 segue Vlineare, 2/3 solo T, 4 solo V². Corretti 8W per 2 s danno 16J.', '45/4 usa ingressi medi, 22 somma, 5 semidifferenza, 16 singola B. La legge ai dati medi supera 11J di 1/4J.', '3/2 reciproco, 8/3 copiaenergie, 4 copiapotenze.1/3 darebbe 1 s e 8J. Corretto 2 s su 3 s è 2/3.', '16V copia V² e dà 256J; 2V dà 4J eD12; 8V dà 64J eD192. Gain rimosso prima di radice.', '√37V ometteoffset e predice D38; 18 copia E, 36V², 3V dà 9/2J eD10. Non occorre valutare√37 decimale.', '27 copiacubo, duecopiatensione, −3 s viola durata positiva. Cubica strettamente crescente fissa 3 s; V(τ)=ατ sarebbe un altro protocollo e introdurrebbe diverso integrale.']
ASSUMPTIONS=['R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.', 'R2Ω mantenuta, ogni V positiva costante nel proprio intervallo T positivo finito; tempo internoτ da 0 aT. Energia elettrica totale convertita non necessariamente trattenuta. Rapporto fra preparazioni distinto da legge V(τ). Nel 16 V=αT è una preparazione di ampiezza costante, non una rampa. Display continuo, radice positiva con capacità di controllo esatto del quadrato.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-joule-energy-voltage-time-10', 'AR-u6-joule-energy-voltage-time-08', 'AR-u6-joule-energy-voltage-time-05', 'AR-u6-joule-energy-voltage-time-06', 'AR-u6-joule-energy-voltage-time-03', 'AR-u6-joule-energy-voltage-time-09', 'AR-u6-joule-energy-voltage-time-02', 'AR-u6-joule-energy-voltage-time-12', 'AR-u6-joule-energy-voltage-time-15', 'AR-u6-joule-energy-voltage-time-11', 'AR-u6-joule-energy-voltage-time-14', 'AR-u6-joule-energy-voltage-time-16', 'AR-u6-joule-energy-voltage-time-04', 'AR-u6-joule-energy-voltage-time-13', 'AR-u6-joule-energy-voltage-time-07', 'AR-u6-joule-energy-voltage-time-01'}
REVIEWED_CANDIDATES={'AR-u6-joule-energy-voltage-time-01': 'd1238a2e4101de7feda6014a34b019b9db1046c0fb7173cdbf2a6bcf41e73e9d', 'AR-u6-joule-energy-voltage-time-02': '22e07eb470e9a6bd94261693b83537d3c4240f99565867379c2050f48a3447b9', 'AR-u6-joule-energy-voltage-time-03': '207fc5cd38338eb3431729c32d789f1b1b08228cf908d2b32d34ee04c742bd09', 'AR-u6-joule-energy-voltage-time-04': '37e58a7e798ec5377d6b439cb1f4aa4ae6019850f52b2eceb5c00ae49b6cf388', 'AR-u6-joule-energy-voltage-time-05': 'eea94be5d87c71faf4b0fc98887cf80f60735d23a72ac9cad76de9402459296b', 'AR-u6-joule-energy-voltage-time-06': 'e8737e553922e1207908b86ff9e3eb88f41920e2c74676d3ffdab10045d2153f', 'AR-u6-joule-energy-voltage-time-07': '95cda1b05ad9448605ab5fb05ac7067dd5766ef6d901b4da3c9f16a991f823a2', 'AR-u6-joule-energy-voltage-time-08': '59e4109609562a13a8c555fc52e837dfced2af1f82754eccb06aa43bd9b8e593', 'AR-u6-joule-energy-voltage-time-09': '5a38fc5a1368faaff18c891eed46d3cc4db79ab4c33c9d93243ee8e7fd5f953c', 'AR-u6-joule-energy-voltage-time-10': '6655e0a5ba471965a9fb0aaab46b957b6c0f285b3be0baaee103fe518c6db13b', 'AR-u6-joule-energy-voltage-time-11': '8f71e31b73b27e070f04d3dd644f70b572ea2b9940ee03f7d6fef4946feaabe6', 'AR-u6-joule-energy-voltage-time-12': '5afbfa597987126991bca077fbd37f81b1d46062ef737932f1acde8d05cb6174', 'AR-u6-joule-energy-voltage-time-13': '3714fef1321760a2d76b0bfd618d724a4726bdd73d13c40391d4cde7ac917406', 'AR-u6-joule-energy-voltage-time-14': '6468d593d6a4cfa2501d5335d3414e0ee9177d597964827aca36002c3d77af1b', 'AR-u6-joule-energy-voltage-time-15': '4bdf8c168a918ba471fa8e2f547673c7118da508974fa5a2824ea37cc2046e05', 'AR-u6-joule-energy-voltage-time-16': '44d548b941771e0f57506ffe68f8e3f143f5eee4fcddb1591245a1707c34c9d1'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1130, 1), Fraction(120, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1330, 1), Fraction(220, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1230, 1), Fraction(320, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(680, 1), Fraction(1570, 1)), (Fraction(100, 1), Fraction(280, 1), Fraction(300, 1), Fraction(120, 1))}
REQUIRED_PATHS={'M100 170V400H530', 'M100 620V880H540', 'M100 880L400 640'}
REQUIRED_CIRCLES={(Fraction(100, 1), Fraction(880, 1), Fraction(4, 1)), (Fraction(400, 1), Fraction(640, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1110, 1), Fraction(150, 1), Fraction(1400, 1)), (Fraction(150, 1), Fraction(1400, 1), Fraction(510, 1), Fraction(1400, 1))}
GEOMETRY_REVIEW='Rettangolo P(τ) alto 2W, largo 3 s: coordinatex 100..400, y 280..400, scale 100 unità/s e 60 unità/W, area 6J. Retta E(τ)M100880L400640 per 0≤τ≤3 s, scale 100 unità/s e 40 unità/J, estremo 6J, origine internaτ0 ammessa. Barre E6/16/11J lunghe 120/320/220, scala 20 unità/J; B haV4V eT2 s, distinta dalla retta. Nessuna label attraversata.'
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

def result(voltage,duration):
    voltage,duration=map(_rational_exact,(voltage,duration))
    if min(voltage,duration)<=0:raise ValueError('Positive maintained voltage and duration required')
    return Fraction((SI.Quantity(voltage,'volt')**2*SI.Quantity(duration,'second')/SI.Quantity(2,'ohm')).to('joule').magnitude)
def inverse_voltage(energy,duration):
    energy,duration=map(_finite_exact,(energy,duration))
    if energy.is_positive is not True or duration.is_positive is not True:raise ValueError('Positive energy and duration required')
    return sp.sqrt(2*energy/duration)
def inverse_duration(energy,voltage):
    energy,voltage=map(_rational_exact,(energy,voltage))
    if min(energy,voltage)<=0:raise ValueError('Positive energy and maintained voltage required')
    return 2*energy/voltage**2
def scaled(voltage,duration,a,b):
    voltage,duration,a,b=map(_rational_exact,(voltage,duration,a,b))
    if min(voltage,duration,a,b)<=0:raise ValueError('Positive factors and states required')
    return result(a*voltage,b*duration)/result(voltage,duration)
def constrained_duration(energy):
    energy=_finite_exact(energy)
    if energy.is_positive is not True:raise ValueError('Positive energy required')
    return sp.real_root(9*energy/2,3)

@lru_cache(maxsize=1)
def oracle():
    e,v,t,r=sp.symbols('E V T R',positive=True)
    assert sp.integrate(v*v/r,(sp.Symbol('tau'),0,t))==t*v*v/r
    _solutions=sp.solve(sp.Eq(e,v*v*t/r),v)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(sp.sqrt(e)*sp.sqrt(r)/sp.sqrt(t)))==0
    _solutions=sp.solve(sp.Eq(e,v*v*t/r),t)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(e*r/(v*v)))==0
    first=sp.Rational(result(2,3));second=sp.Rational(result(4,2));assert (first,second)==(6,16)
    fit=calibrate(first,second,18,48,13,33,37,'joule');assert fit==(3,1,16,18)
    assert result(3,Fraction(5,2))==Fraction(45,4)
    assert constrained_duration(6)==3 and result(2,3)==6
    return [first,'J','E = V² T / R','Da 6 a 3/2 J',inverse_voltage(first,3),inverse_duration(first,2),scaled(2,3,1,Fraction(5,3)),12-first,'V = √(E R / T)','κ₁² κ₂',second/first,(first+second)/2,inverse_duration(Fraction(8,3)*first,4)/3,inverse_voltage(fit[2],2),inverse_voltage(fit[3],1),constrained_duration(first)]
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
