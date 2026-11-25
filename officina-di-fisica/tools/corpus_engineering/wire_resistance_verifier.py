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
CANDIDATE_REF='5852f02d884d6ca3196cfc0d3e5bb1fcefb29334'
PRIMARY_SHA256='d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6'
FAMILY='wire-resistance'
BATCH='wire-resistance-204'
ASSET_NAME='wire-resistance-progressive.svg'
REVIEWED_PACKAGE_SHA256='5d3ffc0df0948fcfad2272fa5b33bb233a20c6a119fcaf6729f6caa22ad52781'
REVIEWED_BINDINGS_SHA256='015f11ff9449b1009fcade2993971236fc07e4a776a6e88798e6b35388e1486d'
SOURCE_REFERENCE='Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.'
FALSE_PROOF='L’area di un millimetro quadrato si converte in metri quadrati moltiplicando per10⁻³.'
SVG_MUTATION=(b'width="80"', b'width="81"')
EXPECTED_MAPPING={1: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 2: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 3: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 4: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 5: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 6: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 7: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 8: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 9: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 10: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 11: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 12: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 13: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 14: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 15: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 16: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05'])}
NUMERIC_UNITS={1: 'Ω', 5: 'm', 6: 'mm²', 11: '1', 14: 'm'}
OPTION_SUFFIX={7: '', 8: ' Ω', 12: ' Ω', 13: '', 15: ' m'}
UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm', 4: 'ohm', 5: 'meter', 6: 'millimeter**2', 7: 'dimensionless', 8: 'ohm', 9: 'meter', 10: 'dimensionless', 11: 'dimensionless', 12: 'ohm', 13: 'dimensionless', 14: 'meter', 15: 'meter', 16: 'meter'}
MANUAL=['Seconda legge di Ohm: R=ρL/A, filo uniforme a temperatura fissata. A=2 mm²=2·10⁻⁶ m², L 100 m e ρ2·10⁻⁸ Ω·m danno R=(2·10⁻⁸·100)/(2·10⁻⁶)=1 Ω. Area ha conversione quadratica del millimetro. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La resistenza ha unità Ω=V/A. Nella legge(Ω·m)·m/m² rimaneΩ; resistività ha inveceΩ·m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con ℓ=L/(1 m), a=A/(1 mm²), R/(1 Ω)=(2·10⁻⁸/10⁻⁶)ℓ/a=ℓ/(50 a). Il coefficiente 1/50 incorpora la conversione mm²→m² e la resistività assegnata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 1 Ω con 100 m. B con 1 m e stessa sezione 2 mm² dà 1/100 Ω; dipendenza lineare daL, non daL². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'L=RA/ρ. ConR 1 Ω eA 2·10⁻⁶ m² si haL 100 m. Nelle unità numeriche ℓ=50 a(R/Ω)=100. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A=ρL/R=2·10⁻⁸·100/1 m²=2·10⁻⁶ m²=2 mm². L’area richiesta non è un diametro o raggio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A con 100 m e 2 mm² dà 1 Ω; B a 1 mm² dà 2 Ω. Rapporto 2: dimezzare area raddoppiaR aL e ρ fissati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Corretto 1 Ω, proposta 2 Ω: scarto+1 Ω. Il rapporto 2 non ha unità di resistenza. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'DaR=ρL/A segue L=RA/ρ, dominio R, A, ρ positivi. In unità dichiarate L/(1 m)=50(R/Ω)[A/(1 mm²)]. Non si usa la stessa formula numerica con A immessa inm². Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'L_B=κ₁L_A eA_B=κ₂A_A aρ invariata danno R_B/R_A=κ₁/κ₂. Non si impone volume costante in questa famiglia di fili indipendenti. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 1 Ω; B con 200 m e 1 mm² dà 200/50=4 Ω. Rapporto 4, fattore 2 dalla lunghezza e 2 dall’inverso dell’area. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media=(1+4)/2=5/2 Ω. Ai dati medi L 150 m eA 3/2 mm² si avrebbe 150/[50·(3/2)]=2 Ω, distinto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio 4 Ω. ConL_B 200 m serve A_B=200/(50·4)=1 mm². Rapporto A_B/A_A=1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento 1 Ω eS 3: a_cal 3 nella scala strumentale perΩ. S 12 decodificaR_B 4 Ω; A_B 1 mm² implicaL_B=50·4·1=200 m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 1 e 4 Ω, letture 3 e 9: a_cal=(9−3)/(4−1)=2, b_cal 1. S_C 26/25 dà R_C=(26/25−1)/2=1/50 Ω. ConA_C 1 mm², L_C=50·(1/50)·1=1 m. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo nelle unità dichiarate L/(1 m)=50[A/(1 mm²)] corrisponde aL=(50 m/mm²)A. Sostituendo nella legge si haR 1 Ω per ogniA>0. Infinite coppie positive continue, per esempio(100 m, 2 mm²) e(50 m, 1 mm²); misura ridondante, non un conteggio intero di resistori. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Usare A=2 m² dà 10⁻⁶ Ω; la conversione lineare del mm² dà 10⁻³ Ω. Due Ω omette il divisore dell’area e cento copia L.', 'Ω·m misura ρ, m lunghezza, A corrente e V tensione. Il simbolo A della sezione è distinto dall’unità ampere.', 'ρA/L ha unità Ω·m²; il reciproco di ρ altera la dipendenza dal materiale. Il prodotto con A inverte la legge e L² è assente.', '100 Ω inverte la dipendenza; uno ignora la modifica. 1/50 Ω omette l’area numerica due e 1/2 non riduce di cento volte.', '50 m omette l’area numerica due; 200 m darebbero 2 Ω. Moltiplicare per ρ non isola L e altera le dimensioni.', '1/2 mm² darebbe 4 Ω. Due m² perde il fattore 10⁶ della conversione e 4 mm² darebbero 1/2 Ω.', '1/2 rende diretta la dipendenza da A; uno ignora la modifica. Quattro introduce un quadrato e il negativo contraddice resistenze passive positive.', '−1 Ω inverte l’ordine; due Ω copia la proposta, zero la accetta. Due puro è una grandezza diversa dallo scarto.', 'Rρ/A ha unità Ω²/m, ρA/R ha m³ e R/(ρA) ha m⁻³. RAρ non è una lunghezza; tutte le alternative ricomposte nella legge falliscono.', 'Il prodotto rende diretta A, il reciproco inverte B/A. κ₂² confonde un fattore d’area con un fattore lineare; κ₁² inventa una dipendenza quadratica da L.', 'Due considera un solo cambiamento; 1/4 inverte B/A e uno presume una compensazione. Entrambi i cambiamenti aumentano la resistenza.', 'Due Ω usa i dati medi, cinque somma, 3/2 è semidifferenza e quattro copia B. Serie e parallelo di fili sarebbero altri esperimenti.', 'Due inverte il rapporto; 1/4 ignora L raddoppiata. Quattro copia il bersaglio e uno darebbe 2 Ω. I fattori due della lunghezza e dell’inverso dell’area si moltiplicano.', '600 m usa D come ohm; quattro copia R e cinquanta il coefficiente numerico di conversione. ρ resta fissata.', '26 m omette b, due m non divide per il guadagno. 1/50 copia il numero della resistenza e 50 m ignora il piccolo eccesso sopra l’offset.', 'Le coppie singole sono esempi; L e A devono restare legate dal rapporto assegnato. Non si impone un volume conservato fra le preparazioni.']
ASSUMPTIONS=['Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.', 'Filo omogeneo uniforme con ρ=2·10⁻⁸ Ω·m a temperatura fissata; L>0 e A>0, con l’area in mm² convertita quadraticamente in SI. I parametri sono assegnati fra preparazioni, senza volume conservato implicito. Il guadagno a_cal è distinto dall’area normalizzata a. Nel caso 16 L=(50 m/mm²)A rende la misura ridondante e non descrive l’allungamento del medesimo filo a volume costante.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa o angolo autonomo con dominio e orientazione espliciti.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-wire-resistance-01', 'AR-u6-wire-resistance-13', 'AR-u6-wire-resistance-02', 'AR-u6-wire-resistance-12', 'AR-u6-wire-resistance-14', 'AR-u6-wire-resistance-16', 'AR-u6-wire-resistance-03', 'AR-u6-wire-resistance-10', 'AR-u6-wire-resistance-04', 'AR-u6-wire-resistance-15', 'AR-u6-wire-resistance-06', 'AR-u6-wire-resistance-09', 'AR-u6-wire-resistance-08', 'AR-u6-wire-resistance-05', 'AR-u6-wire-resistance-11', 'AR-u6-wire-resistance-07'}
REVIEWED_CANDIDATES={'AR-u6-wire-resistance-01': '05ddea2cd3ae204c1d1e3df3881bde6e7691602f2931c8c6fcc248bd0d559c08', 'AR-u6-wire-resistance-02': 'bd9aff05ddb0f4e638cb2b8665b167e0f427422fef883ee09ffd81383f0d735a', 'AR-u6-wire-resistance-03': 'e46ed9fb51953fc67ea70ab3f457ee5ad7b8cdc8bd53e225536f6d344f273209', 'AR-u6-wire-resistance-04': 'a2f953c147c8ba23e5e2dae73b32ee839beb1f0b814698138540e584ec052196', 'AR-u6-wire-resistance-05': '7dca87781606c1b197424cf0e37c6ec529e3f79a009ed554045cc01827243324', 'AR-u6-wire-resistance-06': '83162f529e47524b74ad54d8ba4e6fe83bd87c74c471d38a5021b3b338065456', 'AR-u6-wire-resistance-07': 'c4b8f125479d6b187d82f6b0f82fbc09b9de3bbcf306dd0a3a7fdc9e9d154c6b', 'AR-u6-wire-resistance-08': '6beba3557e9b7b2addadba9a91fe505bfc2d05e052549c060198c5db1b8e6bab', 'AR-u6-wire-resistance-09': '79b3d38b799ff681cd98f1cdfa33b849efc1788ac0c766045a783a5cdefedfe4', 'AR-u6-wire-resistance-10': '4b36a284b57054c65b1dd4cbf2d482ba7205a874c33a3fc65932a1d226ab576e', 'AR-u6-wire-resistance-11': 'ce809940da763df394cf3c5a8feda33500da2198d298121f15ac3bed2c809da3', 'AR-u6-wire-resistance-12': 'c9e3651d57d25af4fb06431fff331d2ed83fee570e325d9858ef73a9f2614c5f', 'AR-u6-wire-resistance-13': '58af4b04ad70eb4c54747520a1ed17447e3af16fc4d85c299518b15f8d463861', 'AR-u6-wire-resistance-14': 'e0600cb4d8985056356efe82be278499d58d9870bf78efea5503ab892428d12c', 'AR-u6-wire-resistance-15': 'e6238dfd8c07dfe19be66e2a5b10b9b16439eb5bbc124e05a8aad8ffd8f9fa2e', 'AR-u6-wire-resistance-16': '60e863d3fbdb5c6d9b7cc2bbd8cfe26b09c3c05d8fe16b0b8031a426c2fc5442'}
REQUIRED_RECTS={(Fraction(100, 1), Fraction(180, 1), Fraction(300, 1), Fraction(45, 1)), (Fraction(130, 1), Fraction(1220, 1), Fraction(200, 1), Fraction(38, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1460, 1)), (Fraction(130, 1), Fraction(1060, 1), Fraction(80, 1), Fraction(38, 1)), (Fraction(130, 1), Fraction(1140, 1), Fraction(320, 1), Fraction(38, 1))}
REQUIRED_PATHS={'M100 252V268M400 252V268M100 260H400', 'M32 960H608', 'M130 850V570M130 850H565', 'M130 1035V1300', 'M32 435H608', 'M130 850L530 610', 'M130 730H330V850M130 610H530V850'}
REQUIRED_CIRCLES={(Fraction(130, 1), Fraction(850, 1), Fraction(4, 1)), (Fraction(330, 1), Fraction(730, 1), Fraction(5, 1)), (Fraction(530, 1), Fraction(610, 1), Fraction(5, 1)), (Fraction(520, 1), Fraction(202, 1), Fraction(33, 1))}
GEOMETRY_REVIEW='XML e rendering integrale: filo e sezione sono due viste schematiche con scale indipendenti dichiarate; conversione 2 mm²→2·10⁻⁶m². RettaR(L) conarea 2 mm² fissata, da(0, 0) aperto a(200 m, 2Ω), scale 2 unità/m e 120 unità/Ω, punto 100 m/1Ω. Origine aperta indica limiteL→0, fuori dominioL>0. Barre 1/4/5/2Ω lunghe 80/320/200, scala 80; provaB area 1 mm² distinta dalla retta.'
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
    for suffix in (' N/C',' nC',' mC',' ms',' mm²',' Ω',' V',' A',' m','°',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(length,area):
    length,area=tuple(_finite_exact(x) for x in (length,area))
    length,area=map(_rational_exact,(length,area))
    if min(length,area)<=0:raise ValueError('Positive uniform wire length and section area required')
    rho=SI.Quantity(Fraction(2,10**8),'ohm*meter')
    return Fraction((rho*SI.Quantity(length,'meter')/SI.Quantity(area,'millimeter**2')).to('ohm').magnitude)
def inverse_length(resistance,area):
    resistance,area=tuple(_finite_exact(x) for x in (resistance,area))
    resistance,area=map(_rational_exact,(resistance,area))
    if min(resistance,area)<=0:raise ValueError('Positive wire resistance and section required')
    return 50*resistance*area
def inverse_area(resistance,length):
    resistance,length=tuple(_finite_exact(x) for x in (resistance,length))
    resistance,length=map(_rational_exact,(resistance,length))
    if min(resistance,length)<=0:raise ValueError('Positive resistance and length required')
    return length/(50*resistance)
def scaled(length,area,a,b):
    length,area,a,b=tuple(_finite_exact(x) for x in (length,area,a,b))
    a,b=map(_rational_exact,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return result(a*length,b*area)/result(length,area)
def constrained_value(area):
    area=_finite_exact(area)
    area=_rational_exact(area)
    if area<=0:raise ValueError('Positive section required')
    return result(50*area,area)
@lru_cache(maxsize=1)
def oracle():
    r,rho,l,a=sp.symbols('r rho length area',positive=True)
    law=sp.Eq(r,rho*l/a)
    assert sp.solve(law,l)==[a*r/rho] and sp.solve(law,a)==[l*rho/r]
    assert SI.Quantity(1,'millimeter**2').to('meter**2').magnitude==Fraction(1,10**6)
    first=sp.Rational(result(100,2));second=sp.Rational(result(200,1));assert (first,second)==(1,4)
    fit=calibrate(first,second,3,12,3,9,sp.Rational(26,25),'ohm');assert fit==(3,1,4,sp.Rational(1,50))
    assert result(150,sp.Rational(3,2))==2 and constrained_value(1)==constrained_value(2)==1
    return [first,'Ω','R = ρ L / A','Da 1 a 1/100 Ω',inverse_length(first,2),inverse_area(first,100),scaled(100,2,1,sp.Rational(1,2)),2-first,'L = R A / ρ','κ₁/κ₂',second/first,(first+second)/2,inverse_area(4*first,200)/2,inverse_length(fit[2],1),inverse_length(fit[3],1),'Infinite coppie positive']
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
