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
CANDIDATE_REF='b1e53a7b327d73d535357d58b347441a931a8fd0'
PRIMARY_SHA256='d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6'
FAMILY='orthogonal-electric-fields'
BATCH='orthogonal-electric-fields-201'
ASSET_NAME='orthogonal-electric-fields-progressive.svg'
REVIEWED_PACKAGE_SHA256='47d361526f3ce4666d1645a75b88eadd021ebfb3f362dead45154738fb0178dc'
REVIEWED_BINDINGS_SHA256='0f529ce48c45d7817c8b69316b08f5d4f94e23c97c475c59c8f969c3951325b6'
SOURCE_REFERENCE='Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.'
FALSE_PROOF='Per contributi elettrici perpendicolari il modulo totale è sempre la somma E₁+E₂.'
SVG_MUTATION=(b'width="120"', b'width="121"')
EXPECTED_MAPPING={1: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 2: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 3: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 4: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 5: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 6: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 7: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 8: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 9: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 10: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 11: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 12: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 13: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 14: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 15: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 16: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02'])}
NUMERIC_UNITS={1: 'N/C', 5: 'N/C', 13: '1', 14: 'N/C'}
OPTION_SUFFIX={6: '°', 7: '', 8: ' N/C', 11: '', 12: ' N/C', 15: ' N/C', 16: ' N/C'}
UNITS={1: 'newton/coulomb', 2: 'newton/coulomb', 3: 'newton/coulomb', 4: 'newton/coulomb', 5: 'newton/coulomb', 6: 'degree', 7: 'dimensionless', 8: 'newton/coulomb', 9: 'newton/coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton/coulomb', 13: 'dimensionless', 14: 'newton/coulomb', 15: 'newton/coulomb', 16: 'newton/coulomb'}
MANUAL=['Sovrapposizione vettoriale: E²=E₁²+E₂² perché il prodotto scalare dei contributi è zero. Con 3 e 4 N/C, E²=9+16=25 (N/C)² e il modulo positivo è 5 N/C. Sommare 3+4 darebbe un risultato valido per contributi paralleli concordi, non per questi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il modulo della risultante è ancora un campo: N/C, equivalente a V/m. Proiezioni e somma vettoriale conservano la dimensione di campo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dal teorema di Pitagora per componenti ortogonali, E=√(E₁²+E₂²)>0. Entrambi i quadrati hanno unità(N/C)² e la radice restituisceN/C; non occorre conoscere la posizione delle sorgenti per questa somma locale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 5 N/C. B con E₁=1 ed E₂=4 N/C dà√17 N/C, esatto. Poiché 16<17<25, si ha 4<√17<5 e il campo totale diminuisce. Non si approssima la radice né si forza una terna pitagorica non presente nei dati. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'E₁=√(E²−E₂²), ramo strettamente positivo se E>E₂>0. Con 5 e 4 N/C, E₁=√(25−16)=3 N/C. La radice negativa non è un modulo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Caso autonomo di direzione: vettore(3, 3)N/C nel primo quadrante. tanθ=E_y/E_x=1 e 0<θ<90°, quindiθ=45°=π/4 rad rispetto a+x verso+y. Il modulo 3√2 N/C è una grandezza diversa dall’angolo richiesto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 5 N/C; B con 3 e 1 N/C dà√10 N/C. Rapporto E_B/E_A=√10/5, esatto e minore di 1. Non si riduce il problema al rapporto del soloE₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il campo corretto è 5 N/C e la proposta 10 N/C; scarto ordinato=10−5=+5 N/C. Il rapporto 2 è adimensionale e non lo scarto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo E₁²=E²−E₂² e prendo E₁=√(E²−E₂²)>0. La soluzione richiede E>E₂>0; all’uguaglianza il primo modulo sarebbe zero ed è escluso dal dominio. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Inserendo i fattori nei due quadrati: E_B/E_A=√[(κ₁²E₁²+κ₂²E₂²)/(E₁²+E₂²)]. I fattori positivi non permettono di separare una radice di somma in una somma di radici. Un fattore comuneκ dàκ. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A è la terna 3, 4, 5; B è 5, 12, 13 perché 25+144=169. Rapporto 13/5, adimensionale e non il rapporto delle singole componenti. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media delle due letture=(5+13)/2=9 N/C. Ai contributi medi E₁=4, E₂=8 N/C si otterrebbe√80=4√5 N/C; è diverso da 9 perché 80<81. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio E_B=(13/5)5=13 N/C. Con E₁, B=5 N/C, E₂, B=√(169−25)=12 N/C. Rapporto E₂, B/E₂, A=12/4=3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 5 N/C e S 15, quindi a=3 nella scala strumentale perN/C. S 39 significa E_B=13 N/C. Con E₂, B=12 N/C, E₁, B=√(169−144)=5 N/C. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 5 e 13 N/C con S 11 e 27 danno a=(27−11)/(13−5)=2, b=1. S 21 decodifica E_C=(21−1)/2=10 N/C. Con E₂, C=8 N/C, E₁, C=√(100−64)=6 N/C. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'E₁=(3/4)E₂ rende E=√(9/16+1)E₂=(5/4)E₂ per E₂>0. Misura 5 N/C determina E₂=4 N/C e E₁=3 N/C. Unica coppia positiva; non una famiglia libera dopo la misura. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['7 somma, 1 sottrae moduli, 25 copia quadrato e 12 prodotto senza legge vettoriale.', 'N forza, C carica, J energia, V potenziale; campoN/C=V/m.', 'Somma/differenza sono collineari, senza radice campo²; √(E₁E₂) non norma vettoriale.', '5/3 riduce tutta risultante; 5 ignora modifica, 3 sottrae moduli, 17 omette radice; √17 esatto fra 4 e 5.', '1 sottrae 5−4; 9 omette radice; √41 somma quadrati nell’inversa; negativa non modulo.', '0°/90° ignorano una componente, 180° è−x e 30° non biseca il retto.', '1/5 scarta componente 3, 1/2 non ha quadrato 2/5; 2 cresce nonostante norma diminuita; 5/√10 reciproco.', '−5 inverte, 10 proposta, 0 accetta, 2 rapporto puro.', 'E−E₂ è caso concorde; somma quadrati non isola; senza radice unità campo² e E₂/E puro.', 'Somma normalizzata non norma; κ devono andare al quadrato; meno non Pitagora; scambiareκ cambia i pesi e non legge generale.', '5/13 reciproco; 5/3 soloE₁; 3 soloE₂; 169/25 quadrati delle norme.', '4√5 norma alle componenti medie; 18 somma, 4 semidifferenza, 13 solo B.', '1/3 reciproco, 9 quadrati dei cateti; 13/5 norma e 12 catetoB non rapporto.', '1 sottrae 13−12; 25 copia quadrato; 39 usato comeE conserva erroneamente guadagno.', '2 sottrae 10−8; 10 norma totale; 36 quadrato; √57 dànorma 11 eD23, confutazione esatta.', '3 altrocateto; 5 norma; −4 escluso; misura fissa scala dopo rapporto.']
ASSUMPTIONS=['Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.', 'Due contributi positivi statici esattamente ortogonali nello stesso punto; +x e+y lungo i due contributi. Si cerca modulo della somma, non somma dei moduli o forza. Caso 06 direzione con componenti uguali, primo quadrante. Inversa richiede totale maggiore del cateto noto. Normalizzazioni a, b del 10 pure e a²+b²=1. Display continuo e fattori positivi.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa o angolo autonomo con dominio e orientazione espliciti.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-orthogonal-electric-fields-14', 'AR-u6-orthogonal-electric-fields-13', 'AR-u6-orthogonal-electric-fields-03', 'AR-u6-orthogonal-electric-fields-16', 'AR-u6-orthogonal-electric-fields-02', 'AR-u6-orthogonal-electric-fields-07', 'AR-u6-orthogonal-electric-fields-08', 'AR-u6-orthogonal-electric-fields-10', 'AR-u6-orthogonal-electric-fields-11', 'AR-u6-orthogonal-electric-fields-15', 'AR-u6-orthogonal-electric-fields-06', 'AR-u6-orthogonal-electric-fields-04', 'AR-u6-orthogonal-electric-fields-01', 'AR-u6-orthogonal-electric-fields-05', 'AR-u6-orthogonal-electric-fields-09', 'AR-u6-orthogonal-electric-fields-12'}
REVIEWED_CANDIDATES={'AR-u6-orthogonal-electric-fields-01': '3fd5d250e9950fb6f99efc3a173ca80116e921e4174a314e0eb8beef615c9f5b', 'AR-u6-orthogonal-electric-fields-02': '60fd345acf6937f27b779b396ae2eda255dbcc2150eb93ce9f8837aad0952044', 'AR-u6-orthogonal-electric-fields-03': '1fe09dc762351d126a2ff9f4f354b32f36f604a110968e1583395213346c3796', 'AR-u6-orthogonal-electric-fields-04': '8d06b0dbcf99c1ab53a8f5978dd59abcaaa7f1c144554eb593f002fe826b7f34', 'AR-u6-orthogonal-electric-fields-05': '992fcb4c432385097e3009958bdecf591ab49249d0ee1b6ac784ab49dd4898fe', 'AR-u6-orthogonal-electric-fields-06': '6c85672435bc366dc0cd5a270e7134549aedae46f8e03d55bbb5a7cd4b6e7dec', 'AR-u6-orthogonal-electric-fields-07': 'c1880fb1633e3bba29642134d53d8c130b2f8184c2c103dd2eb3bee27ab0a862', 'AR-u6-orthogonal-electric-fields-08': '70c6d0a43f37459100d34ef057189347bf81e8da46fbb8bc43fa707ce93195d7', 'AR-u6-orthogonal-electric-fields-09': '03d436931d00b0c4d74d38a55d237ead8bedbe77dcc3fde562ebaf691243f090', 'AR-u6-orthogonal-electric-fields-10': '5845805d19cbf61f9678d93897c25903e18dea97e5e6d9ce3238e96612aab3b5', 'AR-u6-orthogonal-electric-fields-11': 'f44fdf6795321f71c88cae90e21aca510f14f1c1d558a4340d88cfea9a3857b9', 'AR-u6-orthogonal-electric-fields-12': 'd456c2e4531d3699f8b6f2418492c420a46146470bb848a16a3d342cb37b942c', 'AR-u6-orthogonal-electric-fields-13': 'a5a3057f30cf8ba839e249c602525b8a30e22ddfaf84ce849a35d366b0dd0640', 'AR-u6-orthogonal-electric-fields-14': '6ecf06818bfa6700b36ac7c3e0bd4a71e16cb2d1563fa6b6bd3cd33f23904938', 'AR-u6-orthogonal-electric-fields-15': '38beb99b376961e476ca6ca1360991591bdc4e94910397fa9d0c5e56624eb0fd', 'AR-u6-orthogonal-electric-fields-16': '3793f54632d70af37f0a8b8255b509b6f2069696276964626c8ac0bf1a995dd4'}
REQUIRED_RECTS={(Fraction(130, 1), Fraction(1345, 1), Fraction(312, 1), Fraction(38, 1)), (Fraction(130, 1), Fraction(1425, 1), Fraction(216, 1), Fraction(38, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1720, 1)), (Fraction(130, 1), Fraction(1265, 1), Fraction(120, 1), Fraction(38, 1))}
REQUIRED_PATHS={'M170 1005L380 795', 'M130 1237V1507', 'M380 1005V795H170', 'M230 1005A60 60 0 0 0 212.426 962.574', 'M170 1005V795', 'M160 470V150', 'M0 0L10 5L0 10Z', 'M160 470L400 150', 'M160 447H183V470', 'M32 620H608', 'M32 1162H608', 'M170 1005H380', 'M160 470H400', 'M400 470V150H160'}
REQUIRED_CIRCLES={(Fraction(160, 1), Fraction(470, 1), Fraction(4, 1))}
GEOMETRY_REVIEW='XML e immagini integrali letti. Primo triangolo cateti 240/320 e diagonale 400, scala 80 unità intrinseche/(N/C), angolo retto e vettori nello stesso punto. Secondo cateti 210/210 con scala 70, diagonale 45°; arco r 60 fra 0 e 45°, non traiettoria. Barre 5/13/9 N/C lunghe 120/312/216 da x 130, fattore 24. Nessuna intersezione residua di label con frecce.'
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
    for suffix in (' N/C',' nC',' mC',' ms',' mm²',' Ω',' V',' A',' m','°',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=tuple(_finite_exact(x) for x in (first,second))
    first,second=map(_rational_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Two positive perpendicular field components required')
    squares=(SI.Quantity(first,'newton/coulomb')**2+SI.Quantity(second,'newton/coulomb')**2).to('(newton/coulomb)**2')
    return sp.sqrt(sp.Rational(squares.magnitude))
def inverse_component(total,known):
    total,known=tuple(_finite_exact(x) for x in (total,known))
    total,known=map(_finite_exact,(total,known))
    if total.is_positive is not True or known.is_positive is not True or not total>known:
        raise ValueError('Total strictly larger than the known positive component required')
    return sp.sqrt(sp.simplify(total**2-known**2))
def scaled(first,second,a,b):
    first,second,a,b=tuple(_finite_exact(x) for x in (first,second,a,b))
    a,b=map(_rational_exact,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return sp.simplify(result(a*first,b*second)/result(first,second))
def constrained(total):
    total=_finite_exact(total)
    total=_rational_exact(total)
    if total<=0:raise ValueError('Positive total field required')
    return 4*total/5
@lru_cache(maxsize=1)
def oracle():
    total,first,second=sp.symbols('E E1 E2',positive=True)
    assert sp.solve(sp.Eq(total**2,first**2+second**2),first)==[sp.sqrt(total**2-second**2)]
    initial=result(3,4);final=result(5,12);assert (initial,final)==(5,13)
    assert result(1,4)==sp.sqrt(17) and result(3,1)==sp.sqrt(10)
    fit=calibrate(initial,final,15,39,11,27,21,'newton/coulomb');assert fit==(3,1,13,10)
    assert inverse_component(fit[3],8)==6
    assert sp.atan(1)==sp.pi/4
    angle=sp.cancel(sp.atan(1)*180/sp.pi);assert angle==45
    assert result(4,8)==4*sp.sqrt(5) and (4*sp.sqrt(5))**2==80
    return [initial,'N/C','E = √(E₁² + E₂²)','Da 5 a √17 N/C',inverse_component(initial,4),angle,result(3,1)/initial,10-initial,'E₁ = √(E² − E₂²)','√(κ₁² a² + κ₂² b²)',final/initial,(initial+final)/2,inverse_component(sp.Rational(13,5)*initial,5)/4,inverse_component(fit[2],12),inverse_component(fit[3],8),constrained(5)]
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
