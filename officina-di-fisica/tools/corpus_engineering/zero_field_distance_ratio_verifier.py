"""Independent source-first U6-02 laws; no candidate authoring imports.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
CANDIDATE_REF='feeca959f020b5daba38bbec50e0dc14fb3aa88e'
PRIMARY_SHA256='d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6'
FAMILY='zero-field-distance-ratio'
BATCH='zero-field-distance-ratio-200'
ASSET_NAME='zero-field-distance-ratio-progressive.svg'
REVIEWED_PACKAGE_SHA256='0e6193f95594c5fdf80a7f95e697a7c8a29d66e28880c892fbf7dcef76037259'
REVIEWED_BINDINGS_SHA256='43516b4b6f7eb4a12b03c4fd6d775acd06d364e9dec8faa51dfc7f8f6f370486'
SOURCE_REFERENCE='Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.'
FALSE_PROOF='Al punto nullo il rapporto dei moduli dei due campi è zero.'
SVG_MUTATION=(b'width="80"', b'width="81"')
EXPECTED_MAPPING={1: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 2: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 3: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 4: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 5: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 6: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 7: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 8: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 9: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 10: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 11: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 12: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 13: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 14: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 15: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 16: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02'])}
NUMERIC_UNITS={5: 'nC', 6: 'nC', 11: '1', 14: 'nC'}
OPTION_SUFFIX={1: '', 7: '', 8: '', 12: '', 13: '', 15: ' nC'}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'nanocoulomb', 6: 'nanocoulomb', 7: 'dimensionless', 8: 'dimensionless', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'nanocoulomb', 15: 'nanocoulomb', 16: 'nanocoulomb'}
MANUAL=['Fra sorgenti positive i due campi hanno versi opposti. L’annullamento impone kQ₁/d₁²=kQ₂/d₂², dunque η=d₁/d₂=√(Q₁/Q₂)>0. Per 1 e 4 nC, η=√(1/4)=1/2; il punto è più vicino alla carica minore. A separazione L>0 fissata si avrebbe d₁=Lη/(1+η), d₂=L/(1+η), entrambe positive. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto di due distanze è adimensionale: m/m=1. Non si assegna una stringa fra alternative non ancora lette; la dimensione è quella di un numero puro. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il bilancio dei moduli dei campi opposti dà Q₁/d₁²=Q₂/d₂². Quindi η²=Q₁/Q₂ e η=√(Q₁/Q₂), radice positiva perché d₁, d₂ sono distanze. Il fattore k si cancella e le cariche si esprimono nella stessa unità. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'η_A=√(1/4)=1/2; con Q₁=9 nC e Q₂=4 nC, η_B=√(9/4)=3/2. Il rapporto cresce di 3, non di 9; il punto di campo nullo resta interno. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo Q₁=η²Q₂. Con η=1/2 e Q₂=4 nC si ha Q₁=(1/4)4=1 nC. Reinserendo si ritrova il rapporto positivo 1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo Q₂=Q₁/η². Con Q₁=1 nC e η=1/2 si ottiene Q₂=4 nC. Richiede η>0 e sorgente nota positiva. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'η_A=1/2; con Q₁=Q₂=1 nC si ha η_B=1, quindi η_B/η_A=2. Il punto è al centro soltanto nella seconda configurazione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La proposta η=1 supera il risultato corretto 1/2 di+1/2, numero puro. Non si tratta del rapporto proposta/corretta, che vale 2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da η²=Q₁/Q₂ segue Q₁=η²Q₂, dove η=d₁/d₂. In forma geometrica Q₁=Q₂(d₁/d₂)². Unità di carica e dominio positivo rispettati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Sostituendo Q₁, B=κ₁Q₁, A e Q₂, B=κ₂Q₂, A, si trova η_B/η_A=√(κ₁/κ₂). Il rapporto non richiede la distanza totale tra le sorgenti, ma richiede entrambe positive. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà η_A=1/2. B con 4 e 1 nC dà η_B=2. Il rapporto tra uscite è 4; cambiare entrambe le cariche moltiplica il rapporto delle cariche per 16 e quello delle distanze per 4. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media delle letture=(1/2+2)/2=5/4. Le cariche medie sono entrambe 5/2 nC e darebberoη=1, distinto. Sono due prove statistiche, non quattro sorgenti presenti insieme. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il bersaglio èη_B=4·(1/2)=2. Con Q₁, B=4 nC, Q₂, B=Q₁, B/η_B²=1 nC. Il rapporto richiesto Q₂, B/Q₂, A=1/4. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimentoη_A=1/2 e S_A=3/2: gain a=3 nella scala strumentale. S_B=6 decodificaη_B=2; con Q₂, B=1 nC, Q₁, B=η_B²Q₂, B=4 nC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti η_A=1/2, η_B=2 e letture 2, 5: a=(5−2)/(2−1/2)=2, b=2−2(1/2)=1. S_C=7/3 dà η_C=(7/3−1)/2=2/3. Q₂, C=9 nC impone Q₁, C=(4/9)9=4 nC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo Q₁=Q₂/4 rendeη=√(1/4)=1/2 per ogni Q₂>0. La misura è ridondante: infinite coppie positive nel modello continuo, per esempio(1, 4)nC e(2, 8)nC. Per ciascuna coppia e una separazione fissata esiste un solo punto interno, ma il rapporto non identifica la scala delle cariche. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['1/4 è r², 2 è reciproco di r e 4 è reciproco di r²; 1 porrebbe il punto al centro con moduli diversi.', 'Metri e m² non sono rapporto puro; N/C campo, C carica. Unità 1 non impone valore 1.', 'Rapporto senza radice confonde r con r², inversi scambiano d₁/d₂ e prodotto Q₁Q₂ è dimensionato.', '9/2 usa Q₁ linearmente; 1/6 inverte effetto; 1/2 ignora cambio; 3/4 non è radice di 9/4.', '2 nC omette quadrato; 16 divide invece di moltiplicare; 1/4 copia r²; 0 escluso. Al punto nullo si annulla somma vettoriale, non rapporto dei moduli.', '1/4 nC moltiplica per r²; 2 usa r; 1 nC richiederebbe r 1; carica negativa esclusa.', '1/2 reciproco, 4 rapporto dei quadrati, 1/4 inverso di quello; 1 ignora cambio.', '−1/2 ordine invertito, 1 proposta, 0 accetta errore, 2 rapporto non differenza.', 'Q₂r perde una potenza; Q₂/r² scambia rapporto; r²/Q₂ ha C⁻¹ e radicale Q₂r ha C^1/2.', 'Senza radice manca la legge quadratica del campo; reciproco inverte; prodotto rende direttoQ₂; radice su un solo fattore incompleta.', '2 copia r_B; 1/4 reciproco; 16 confronta quadrati; negativo confonde distanze e componenti.', '1 ai dati medi; 5/2 somma, 3/4 semidifferenza, 2 solo B.', '4 reciproco; 1/2 perde quadrato inverso; 2 copia r_B; 1 lascia Q₂ invariata.', '36 nC usa D come r; 2 nC omette quadrato; 1 copia Q₂ noto.', '49/4 omette offset e predice 10/3; 6 usa r anziché r²; 9 nC dàD3; 1 nC dàD5/3.', 'Coppie singole solo esempi; Q₁, Q₂ non sono liberi indipendentemente. Misura ridondante, cariche nulle escluse.']
ASSUMPTIONS=['Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.', 'Sorgenti puntiformi positive fisse nel vuoto, separazione L>0 e punto strettamente interno. Campi opposti con moduli uguali; d₁, d₂>0 e somma L. Il rapporto puro usa la radice positiva e non richiede un valore numerico di k. Preparazioni statiche distinte, display continuo con guadagno positivo, scala delle cariche macroscopica continua.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa o angolo autonomo con dominio e orientazione espliciti.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-zero-field-distance-ratio-01', 'AR-u6-zero-field-distance-ratio-06', 'AR-u6-zero-field-distance-ratio-07', 'AR-u6-zero-field-distance-ratio-10', 'AR-u6-zero-field-distance-ratio-11', 'AR-u6-zero-field-distance-ratio-02', 'AR-u6-zero-field-distance-ratio-03', 'AR-u6-zero-field-distance-ratio-14', 'AR-u6-zero-field-distance-ratio-16', 'AR-u6-zero-field-distance-ratio-15', 'AR-u6-zero-field-distance-ratio-09', 'AR-u6-zero-field-distance-ratio-08', 'AR-u6-zero-field-distance-ratio-12', 'AR-u6-zero-field-distance-ratio-04', 'AR-u6-zero-field-distance-ratio-13', 'AR-u6-zero-field-distance-ratio-05'}
REVIEWED_CANDIDATES={'AR-u6-zero-field-distance-ratio-01': '3561bc94197294d46ed8d7197435b02bbad10428cf6472b84553bc91d32ca14c', 'AR-u6-zero-field-distance-ratio-02': '172fcf9dfb326c4c2ca2cf5844a03a63b5e1809be270af70cb84560cf23c828a', 'AR-u6-zero-field-distance-ratio-03': 'fa6f29cfbd1ac02c845d1522e7bb536ca5ee83af5619eadb6d12868c6c9ea298', 'AR-u6-zero-field-distance-ratio-04': '0077cf369327d4065f2f68c76b356a87f278e3bec58c16d2f5bac9f6393e5cab', 'AR-u6-zero-field-distance-ratio-05': 'be82e6cb75f21fc27b11fa6e276b4eae8378d9f540503013d93daa99499b4684', 'AR-u6-zero-field-distance-ratio-06': '2ac61917e77d338300df75ca54be935eae3c0af940c058c00c331335abd7f4d9', 'AR-u6-zero-field-distance-ratio-07': '8bc7483ca4c77ae7eef3625d6565ab274102a484c67cad17f5c9469979032549', 'AR-u6-zero-field-distance-ratio-08': '19026e150992acdcdaa2e829d73f7a55d6fd34cefb31d7ff8fcd6de44e779b7a', 'AR-u6-zero-field-distance-ratio-09': 'd1355234483cd5065afe5f29767023e473792c21fbecbaf4b9d9bb81574181c2', 'AR-u6-zero-field-distance-ratio-10': 'ae434dd99a07bdbe1db04525870811c90b260404bae6d2b2e34578f4dc4df25d', 'AR-u6-zero-field-distance-ratio-11': '46dc32dca0e33b50d6b9e561434000db13afb32f3b04bb5f21a8f805543b95ef', 'AR-u6-zero-field-distance-ratio-12': '08e81df816e5e9154cf3154f5eeda2e9bdc31b956e23a3f2d04fc9f523087894', 'AR-u6-zero-field-distance-ratio-13': 'b8b53d3385b89191872672df4130c18a4e87db17923fd320662465f4814ddd32', 'AR-u6-zero-field-distance-ratio-14': '17a738b119fae5fa02334747c6e4b739b64e63b6fc2abfad787516b89242e4be', 'AR-u6-zero-field-distance-ratio-15': '7507cf8acd9fbc1b5561ce3478f00d24b66bb71fff4f346e8fd9dda95b534473', 'AR-u6-zero-field-distance-ratio-16': '993be0daba9f59894e2e0df0d80467731cc26e342d7e6d48d2a04d0dfd3d8884'}
REQUIRED_RECTS={(Fraction(130, 1), Fraction(1170, 1), Fraction(200, 1), Fraction(38, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1450, 1)), (Fraction(130, 1), Fraction(1010, 1), Fraction(80, 1), Fraction(38, 1)), (Fraction(130, 1), Fraction(1090, 1), Fraction(320, 1), Fraction(38, 1))}
REQUIRED_PATHS={'M140 739V755M380 739V755M500 739V755M140 747H500', 'M32 908H608', 'M260 220H170', 'M140 220H500', 'M140 293V309M260 293V309M500 293V309M140 301H500', 'M32 456H608', 'M260 220H350', 'M380 655H470', 'M130 983V1250', 'M140 655H500', 'M380 655H290', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(500, 1), Fraction(220, 1), Fraction(23, 1)), (Fraction(380, 1), Fraction(655, 1), Fraction(5, 1)), (Fraction(140, 1), Fraction(220, 1), Fraction(23, 1)), (Fraction(260, 1), Fraction(220, 1), Fraction(5, 1)), (Fraction(500, 1), Fraction(655, 1), Fraction(23, 1)), (Fraction(140, 1), Fraction(655, 1), Fraction(23, 1))}
GEOMETRY_REVIEW='Letti XML e rendering finale integrali: sorgenti a x 140/500, separazione 360 per 3 m. P_A x 260 dà d₁120, d₂240; P_B x 380 scambia le distanze. Frecce opposte lunghe 90 da P, stessa scala relativa per i due campi, distinta da quella spaziale. Etichette finali soltanto E₁/E₂ e moduli uguali: nessun k numerico implicito. Barre r 1/2, 2, 5/4 lunghe 80/320/200 da x 130, fattore 160. Zeri e label leggibili fuori assi.'
DECIMAL_REGRESSION_NUMBER=1

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
    for suffix in (' N/C',' nC',' mC',' ms',' mm²',' Ω',' V',' A',' m','°',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=tuple(_finite_exact(x) for x in (first,second))
    first,second=map(_rational_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Positive point sources required')
    quotient=(SI.Quantity(first,'nanocoulomb')/SI.Quantity(second,'nanocoulomb')).to('dimensionless')
    return sp.sqrt(sp.Rational(quotient.magnitude))
def inverse_first(ratio,second):
    ratio,second=tuple(_finite_exact(x) for x in (ratio,second))
    ratio=_finite_exact(ratio);second=_rational_exact(second)
    if ratio.is_positive is not True or second<=0:raise ValueError('Positive distance ratio and known source required')
    return sp.cancel(second*ratio**2)
def inverse_second(ratio,first):
    ratio,first=tuple(_finite_exact(x) for x in (ratio,first))
    ratio=_finite_exact(ratio);first=_rational_exact(first)
    if ratio.is_positive is not True or first<=0:raise ValueError('Positive distance ratio and known source required')
    return sp.cancel(first/ratio**2)
def scaled(first,second,a,b):
    first,second,a,b=tuple(_finite_exact(x) for x in (first,second,a,b))
    a,b=map(_rational_exact,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return sp.simplify(result(a*first,b*second)/result(first,second))
def positions(first,second,separation):
    first,second,separation=tuple(_finite_exact(x) for x in (first,second,separation))
    separation=_rational_exact(separation)
    if separation<=0:raise ValueError('Positive source separation required')
    ratio=result(first,second)
    return sp.cancel(separation*ratio/(1+ratio)),sp.cancel(separation/(1+ratio))
def constrained_value(second):
    second=_finite_exact(second)
    second=_rational_exact(second)
    if second<=0:raise ValueError('Positive source scale required')
    return result(second/4,second)
@lru_cache(maxsize=1)
def oracle():
    k,q1,q2,d1,d2,r=sp.symbols('k q1 q2 d1 d2 r',positive=True)
    cancellation=sp.Eq(k*q1/(r*d2)**2,k*q2/d2**2)
    assert sp.solve(cancellation,r)==[sp.sqrt(q1)/sp.sqrt(q2)]
    assert sp.solve(sp.Eq(r*r,q1/q2),q1)==[q2*r*r]
    assert sp.solve(sp.Eq(r*r,q1/q2),q2)==[q1/(r*r)]
    first=result(1,4);second=result(4,1);assert (first,second)==(sp.Rational(1,2),2)
    fit=calibrate(first,second,sp.Rational(3,2),6,2,5,sp.Rational(7,3),'dimensionless');assert fit==(3,1,2,sp.Rational(2,3))
    assert positions(1,4,3)==(1,2) and positions(4,1,3)==(2,1)
    assert result(sp.Rational(5,2),sp.Rational(5,2))==1
    assert constrained_value(4)==constrained_value(6)==sp.Rational(1,2)
    return [first,'1','r = √(Q₁/Q₂)','Da 1/2 a 3/2',inverse_first(first,4),inverse_second(first,1),scaled(1,4,1,sp.Rational(1,4)),1-first,'Q₁ = Q₂ r²','√(κ₁/κ₂)',second/first,(first+second)/2,inverse_second(4*first,4)/4,inverse_first(fit[2],1),inverse_first(fit[3],9),'Infinite coppie positive']
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_cancellation_vector_norm_current_Ohm_resistivity_inverse_and_calibration",
            "Pint_exact_charge_time_current_field_resistivity_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-circuits-200-204-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-02","U2-01")
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
