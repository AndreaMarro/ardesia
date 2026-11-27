"""Separate integrative C6 reviewer; frozen prompt-only model, never authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import json,xml.etree.ElementTree as ET
import sympy as sp
import pint,hypothesis
from .pipeline import digest,sha,git_bytes
from .review_contract import reviewed_rows
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
BATCH='cric-c6-integrative'
FAMILY='cric-c6-integrative'
OFFSET=0
ASSET_NAME='cric-c6-integrative-progressive.svg'
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATHS={'C6-Q001': 'officina-di-fisica/content/C6.json', 'C6-Q002': 'officina-di-fisica/content/C6.json', 'C6-Q003': 'officina-di-fisica/content/C6.json', 'C6-Q004': 'officina-di-fisica/content/C6.json', 'C6-Q005': 'officina-di-fisica/content/C6.json', 'C6-Q006': 'officina-di-fisica/content/C6.json', 'C6-Q007': 'officina-di-fisica/content/C6.json', 'C6-Q008': 'officina-di-fisica/content/C6.json', 'C6-Q009': 'officina-di-fisica/content/C6.json', 'C6-Q010': 'officina-di-fisica/content/C6.json', 'C6-Q011': 'officina-di-fisica/content/C6.json', 'C6-Q012': 'officina-di-fisica/content/C6.json', 'C6-AQ01': 'officina-di-fisica/content/lotto-001.json'}
SOURCE_FILE_SHA256={'officina-di-fisica/content/lotto-001.json': '71c563d3ea98f92602f04d1956df968bf125b85fad72521bd6742d8070e53e2a', 'officina-di-fisica/content/C6.json': '3f39318c261ec6ed7e68e06f2776dbfb6bce847ccd71cef6354cc5554699ac0c'}
MODEL_PATH='editorial/reviews/cric-c6-integrative-partial-independent-models.py'
MODEL_REF='1d7ff6d21044e7cd4fe62a6729117d5492ab4b0b'
PRIMARY_PATH='editorial/reviews/primary-cric-c6-integrative-partial-before-candidates-20261126.md'
PRIMARY_SHA256='8bb6f588e4ab2de5c93824c8681ad4a13ecd5d36e186b24e109ea5cc49630bda'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='cd4410e00907ce4dc77331d824a288e94602fff3d64e8ec7898cc63c95b3c689'
CANDIDATE_REF='7e29200577107eba178bbf54be775ec69628a5c2'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
EXPECTED_IDS={'C6-AQ01', 'C6-Q008', 'C6-Q006', 'C6-Q009', 'C6-Q004', 'C6-Q012', 'C6-Q003', 'C6-Q011', 'C6-Q005', 'C6-Q002', 'C6-Q007', 'C6-Q001', 'C6-Q010'}
ORDERED_IDS=['C6-Q001', 'C6-Q002', 'C6-Q003', 'C6-Q004', 'C6-Q005', 'C6-Q006', 'C6-Q007', 'C6-Q008', 'C6-Q009', 'C6-Q010', 'C6-Q011', 'C6-Q012', 'C6-AQ01']
INDEX={'C6-Q001': 0, 'C6-Q002': 1, 'C6-Q003': 2, 'C6-Q004': 3, 'C6-Q005': 4, 'C6-Q006': 5, 'C6-Q007': 6, 'C6-Q008': 7, 'C6-Q009': 8, 'C6-Q010': 9, 'C6-Q011': 10, 'C6-Q012': 11, 'C6-AQ01': 12}
REVIEWED_CANDIDATES={'C6-Q001': 'b0c63922bb0f3e09d47c1db9928edc24ecc2d28a2b12f1a1ad8a8dfb74cd6641', 'C6-Q002': 'c37d3af3dba19897572a82c5589fe6bd7dbdfd23de68a5645316c3ae1ef67a51', 'C6-Q003': '016b8335701f5407eddd9f2d7a9971b8ec5d7b87b4ba019db21454d914ff15a1', 'C6-Q004': '5ec86155f43c54097ca1691b20bbd946ef198f73ac9f021d7bd191160c145054', 'C6-Q005': '6c7a13fccf3fb6bfbb70e0078132028a244757f2c6c4b2bb0848c4627ceb4a6b', 'C6-Q006': 'bf1a0dcbae08ad283f5d7778108476cf4c3357fb10326d4cd819f3859600f68c', 'C6-Q007': '9d6afdf3f7d8c70ab5789d8dbda22e40aa881d63b4661bf54a15e8c129588149', 'C6-Q008': 'ad688ac24a7276ada499980be7777bcc68596b901fed5b0c943f9783457c670b', 'C6-Q009': '8d0f3546ff26c1fae49c65ba5b8c4986e95461604daf3f0ae1ad1f9c38467c60', 'C6-Q010': '2c115e287e305735eedbf022e98278d00ebce0b055b95864516a70b6da8358b3', 'C6-Q011': 'f4802561ce1c99cac7d2129fc3eefc82f06e2dd9f9f88ef3c37fb81faba24b4d', 'C6-Q012': 'cec5b2a8a80f8b335d0ba641cd8990c294f2e742f636f6e94295b0653b0e2792', 'C6-AQ01': '631db18afb6c47ec893ac56d4b524ed85a12949b4e315e712cf176272b311cf2'}
REVIEWED_PACKAGE_SHA256='dd17525b5a35246cd1c4a50e6a942089be77eea072b0ec94ff721cabe845d765'
REVIEWED_BINDINGS_SHA256='84d14ac47f8dd1d55f96ce712958daba426c079876b2dd0a1b77a8d8f7852f31'
EXPECTED_CONTEXT={'C6-Q001': {'id': 'C6-Q001', 'kind': 'question', 'course': 'C6', 'section': 'Orientarsi tra le misure', 'order': 1, 'skill': 'C6-L01', 'prerequisites': ['C1-L001', 'C1-L003'], 'family': 'il-passaggio-tra-due-strumenti', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q002': {'id': 'C6-Q002', 'kind': 'question', 'course': 'C6', 'section': 'Orientarsi tra le misure', 'order': 2, 'skill': 'C6-L01', 'prerequisites': ['C1-L001', 'C1-L003'], 'family': 'un-ordine-di-grandezza', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q003': {'id': 'C6-Q003', 'kind': 'question', 'course': 'C6', 'section': 'Portate, correnti e intensità', 'order': 3, 'skill': 'C6-L02', 'prerequisites': ['C6-L01', 'C2-L001', 'C4-L05', 'C5-L04'], 'family': 'un-nodo-con-memoria', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q004': {'id': 'C6-Q004', 'kind': 'question', 'course': 'C6', 'section': 'Portate, correnti e intensità', 'order': 4, 'skill': 'C6-L02', 'prerequisites': ['C6-L01', 'C2-L001', 'C4-L05', 'C5-L04'], 'family': 'una-misura-su-metallo', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q005': {'id': 'C6-Q005', 'kind': 'question', 'course': 'C6', 'section': 'Bilanci e trasformazioni', 'order': 5, 'skill': 'C6-L03', 'prerequisites': ['C6-L01', 'C6-L02', 'C1-L007', 'C3-L06', 'C4-L05'], 'family': 'due-letture-sul-calorimetro', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q006': {'id': 'C6-Q006', 'kind': 'question', 'course': 'C6', 'section': 'Bilanci e trasformazioni', 'order': 6, 'skill': 'C6-L03', 'prerequisites': ['C6-L01', 'C6-L02', 'C1-L007', 'C3-L06', 'C4-L05'], 'family': 'un-generatore-e-un-carico', 'difficulty': 3, 'exam': None, 'version': 1}, 'C6-Q007': {'id': 'C6-Q007', 'kind': 'question', 'course': 'C6', 'section': 'Rapporti e variazioni successive', 'order': 7, 'skill': 'C6-L04', 'prerequisites': ['C6-L01', 'C5-L07', 'C5-L08'], 'family': 'sostituire-solo-il-tratto', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q008': {'id': 'C6-Q008', 'kind': 'question', 'course': 'C6', 'section': 'Rapporti e variazioni successive', 'order': 8, 'skill': 'C6-L04', 'prerequisites': ['C6-L01', 'C5-L07', 'C5-L08'], 'family': 'il-rivelatore-guarda-piu-lontano', 'difficulty': 3, 'exam': None, 'version': 1}, 'C6-Q009': {'id': 'C6-Q009', 'kind': 'question', 'course': 'C6', 'section': 'Leggere le rappresentazioni', 'order': 9, 'skill': 'C6-L05', 'prerequisites': ['C6-L01', 'C6-L02', 'C1-L003', 'C3-L07'], 'family': 'un-rettangolo-orientato', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q010': {'id': 'C6-Q010', 'kind': 'question', 'course': 'C6', 'section': 'Leggere le rappresentazioni', 'order': 10, 'skill': 'C6-L05', 'prerequisites': ['C6-L01', 'C6-L02', 'C1-L003', 'C3-L07'], 'family': 'due-livelli-in-quiete', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q011': {'id': 'C6-Q011', 'kind': 'question', 'course': 'C6', 'section': 'Ripasso e trasferimento', 'order': 11, 'skill': 'C6-L06', 'prerequisites': ['C6-L01', 'C6-L02', 'C6-L03', 'C6-L04', 'C6-L05', 'C5-L10', 'C4-L06'], 'family': 'una-misura-che-non-basta', 'difficulty': 2, 'exam': None, 'version': 1}, 'C6-Q012': {'id': 'C6-Q012', 'kind': 'question', 'course': 'C6', 'section': 'Ripasso e trasferimento', 'order': 12, 'skill': 'C6-L06', 'prerequisites': ['C6-L01', 'C6-L02', 'C6-L03', 'C6-L04', 'C6-L05', 'C5-L10', 'C4-L06'], 'family': 'ripensare-una-previsione', 'difficulty': 3, 'exam': None, 'version': 1}, 'C6-AQ01': {'id': 'C6-AQ01', 'kind': 'question', 'course': 'C6', 'section': 'Approfondimenti trasversali', 'order': 302, 'skill': 'C6-L01', 'prerequisites': ['C2-L005', 'C3-L03'], 'family': 'portata-da-potenza-termica-e-salto-di-temperatura', 'difficulty': 3, 'exam': None, 'version': 1}}
MANUAL={'C6-Q001': 'Il primo sensore avvia e il secondo arresta: t=d/c=(3/10)/1500 s=1/5000 s=200 μs. Non compare il fattore due dell’eco. La distanza è il percorso effettivo nel mezzo e la velocità è assegnata costante.', 'C6-Q002': 'A=2·10⁻⁴ m², Δp=25000 Pa. La forza risultante delle due facce è Δp A=5 N, equivalente a m=F/g=1/2 kg con g assegnata. Non occorre sommare la pressione atmosferica comune sulle due facce; il dato è una differenza.', 'C6-Q003': 'Per un liquido incomprimibile, con portate volumetriche riferite allo stesso liquido, il flusso entrante 90 si ripartisce in 30, nell’accumulo laterale di 12 e nel terzo ramo. Quindi 90−30−12=48 mL/min. Non imporre stazionarietà dell’intero sistema: il serbatoio sta accumulando.', 'C6-Q004': 'In un minuto passa Q=12 C: I media=12/60 A=1/5 A. Se la caduta è 5 V costante nell’intervallo, P media=VQ/Δt=1 W. I dati non determinano una potenza istantanea se la corrente varia: una nuova edizione deve chiedere la media o dichiarare corrente costante.', 'C6-Q005': 'La diminuzione potenziale fornisce 30 J. Con ΔK=0, se questo è l’ingresso meccanico complessivo del sistema considerato, i 24 J registrati lasciano 30−24=6 J ad altri canali, compreso eventuale accumulo interno non misurato. Esplicitare che non sono presenti ulteriori apporti energetici al bilancio.', 'C6-Q006': 'Il ritorno allo stato iniziale annulla ΔU. Il lavoro netto prodotto è 900−600=300 J. La conversione elettrica all’80% ne rende 4/5·300=240 J. Il 20% restante del lavoro non va confuso con i 600 J ceduti direttamente dalla macchina.', 'C6-Q007': 'Nel modello laminare newtoniano sviluppato di Poiseuille, Q è proporzionale a Δp r⁴ a lunghezza e viscosità comuni positive. Raddoppiare r moltiplica il coefficiente per 16; per mantenere la stessa portata non nulla serve Δp₂/Δp₁=1/16. Il rapporto richiede Δp₁≠0; una preparazione a portata nulla lo renderebbe indefinito.', 'C6-Q008': 'Per emissione isotropa, stessa efficienza e piccola area normale, il tasso è proporzionale all’attività e a 1/r². Il secondo tasso è (1/2)(1/9)=1/18 del primo, perciò iniziale/finale=18. Attività e distanza iniziali devono essere positive, fondo e attenuazione sono esclusi dal prompt.', 'C6-Q009': 'Il primo intervallo trasporta (3/10)·4=6/5 C nel verso positivo; il secondo (−1/10)·5=−1/2 C. La somma algebrica è 7/10 C. Sommare i moduli produrrebbe 17/10 C e risponderebbe a un’altra domanda.', 'C6-Q010': 'Se il liquido è fermo, Δp=ρgΔh e ρ=2000/(10·1/4)=800 kg/m³. Il solo fatto che il tubo sia pieno non esclude contributi dinamici: una nuova edizione deve dire fluido fermo o specificare condizioni che cancellino quei contributi. Non assumere una legge idrostatica universale per ogni flusso.', 'C6-Q011': 'L’energia per fotone monocromatico è hf. Fra le due ipotesi date, osservare frequenza invariata (equivalentemente lunghezza d’onda invariata nello stesso mezzo) esclude un cambiamento di hf. Con geometria, risposta ed efficienza del sensore invariati, il livello maggiore si attribuisce allora al tasso di fotoni maggiore. La sola intensità non separa i due fattori.', 'C6-Q012': 'La potenza luminosa è (1/5)·5=1 W. Il rivelatore ne riceve 1/50 W; in 3 s riceve3/50 J=60 mJ. Le frazioni sono di energie o potenze successive, non vanno sommate; assumere regime e frazioni costanti durante i 3 s.', 'C6-AQ01': 'In regime stazionario e con le perdite e i contributi macroscopici esclusi, P=ṁ c ΔT. Quindi ṁ=8/(4000·1/2)=1/250 kg/s. Dividendo per ρ = 1000 kg/m³ si ottiene 1/250000 m³/s=4 mL/s. Il dato 8 W è già la potenza trasferita al liquido, senza introdurre un rendimento aggiuntivo.'}
READING_NOTES={'C6-Q001': 'Percorso diretto di 0,30 m, non eco;200 μs ricostruiscono 1500·200 e−6=0,30 m. Le conversioni in ms eμs non si scambiano.', 'C6-Q002': 'La differenza di pressione è già netta:25 kPa·2 cm²=5 N e massa equivalente 1/2 kg. Non aggiungere atmosfera né identificare numero della forza e massa.', 'C6-Q003': 'Il sistema include il serbatoio:90=30+48+12. Non imporre assenza di accumulo;60 omette il volume trattenuto e 72 ne inverte il segno.', 'C6-Q004': 'Tensione costante e 12 C in 60 s danno energia 60 J e potenza media 1 W. I dati non fissano una potenza istantanea; il finale chiede esplicitamente la media.', 'C6-Q005': 'ΔK nullo e nessun altro ingresso:30 J=24 J+6 J. La quota residua può trasferirsi o accumularsi, non identifica da sola un particolare elemento riscaldato.', 'C6-Q006': 'Ciclo chiuso:300 J all’albero, poi 80%→240 J elettrici.600 J già ceduti e 60 J persi dal generatore sono canali diversi; energia totale 900 J ricostruita.', 'C6-Q007': 'Poiseuille newtoniano laminare sviluppato con no-slip; portata positiva costante, viscosità e lunghezza comuni. Raggio doppio richiedeΔp diviso 16; zero escluso dal rapporto.', 'C6-Q008': 'Tasso proporzionale ad attività positiva e 1/r² con area/efficienza fisse: finale 1/18, rapporto richiesto iniziale/finale 18. Distanza e attività non si sommano.', 'C6-Q009': 'Aree orientate:0,30·4−0,10·5=7/10 C.17/10 somma moduli e−7/10 inverte il riferimento. Unità e durata del secondo tratto restano cinque secondi.', 'C6-Q010': 'Quiete e densità omogenea sono dichiarate:2000/(10·1/4)=800 kg/m³. Con 500 kg/m³ la pressione prevista sarebbe 1250 Pa; non applicare universalmente la legge a un flusso.', 'C6-Q011': 'Nel finale la misura è della potenza ottica incidente, non un segnale elettrico non calibrato. A f invariata hf è fisso, dunque P maggiore impone tasso fotonico maggiore. La primaria aveva richiesto controllare la risposta strumentale; la misura ottica esplicita risolve tale limite.', 'C6-Q012': 'Due frazioni successive:5·1/5·1/50·3=3/50 J=60 mJ.3000 mJ omette l’intercettazione,300 mJ omette la conversione elettricità-luce. Non sommare percentuali.', 'C6-AQ01': 'Potenza già trasferita all’acqua, regime stazionario senza altre variazioni o fasi:ṁ=8/(4000·1/2)=1/250 kg/s; dividereρ e convertire dà 4 mL/s. Risultato verificato con 4 g e 8 J.'}
GEOMETRY_REVIEW='Il nuovo SVG indipendente misura 640 × 2120 ed è stato letto integralmente in XML e nel PNG dopo exit 0. Le facce dei sensori sono a 140 e 500: il tratto di 360 coordinate rappresenta 30 cm in un solo verso. Le barre da 405, 135, 216 e 54 coordinate hanno origine comune e rappresentano 90 = 30 + 48 + 12 mL/min. Nel grafico della corrente, le basi 200/250 rappresentano 4/5 s e le altezze 90/30 rappresentano +0,30/−0,10 A; le aree orientate danno +1,2 − 0,5 = +0,7 C. Il pannello finale è schematico: 4 g di acqua ogni secondo, 8 J/s e aumento di 0,50 K con densità 1000 kg/m³. Nessuna indicazione è attraversata e non sono presenti testi tagliati.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('fill', '#272536'), ('font-family', 'Arial,sans-serif'), ('font-size', '21'), ('height', '2120'), ('role', 'img'), ('viewBox', '0 0 640 2120'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Quattro bilanci integrativi distinti'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Due sensori delimitano un solo tragitto di trenta centimetri in duecento microsecondi. Portate di novanta unità all’ingresso e trenta e quarantotto in uscita, con dodici trattenute nel serbatoio. Due aree orientate corrente-tempo, più un virgola due e meno zero virgola cinque coulomb, danno più zero virgola sette coulomb. Un bilancio separato scalda quattro grammi d’acqua di mezzo kelvin con otto joule ogni secondo.'), ('{http://www.w3.org/2000/svg}defs', (), ''), ('{http://www.w3.org/2000/svg}marker', (('id', 'green'), ('markerHeight', '8'), ('markerUnits', 'userSpaceOnUse'), ('markerWidth', '8'), ('orient', 'auto'), ('refX', '8'), ('refY', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M0 0L8 4L0 8Z'), ('fill', '#147c76')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '2120'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '55')), '1 · Un solo tratto fra due sensori'), ('{http://www.w3.org/2000/svg}text', (('x', '40'), ('y', '108')), 'Acqua: v = 1500 m/s ; strumenti fermi.'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#eee9da'), ('height', '160'), ('stroke', '#888'), ('width', '50'), ('x', '90'), ('y', '175')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#eee9da'), ('height', '160'), ('stroke', '#888'), ('width', '50'), ('x', '500'), ('y', '175')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 255H500'), ('marker-end', 'url(#green)'), ('stroke', '#147c76'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '115'), ('y', '155')), 'Avvio'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '525'), ('y', '155')), 'Arresto'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 350V375H500V350'), ('fill', 'none'), ('stroke', '#888')), ''), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '420')), '30 cm ; Δt = 200 μs'), ('{http://www.w3.org/2000/svg}path', (('d', 'M40 475H600'), ('stroke', '#cbc6bc')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '530')), '2 · Entrata, uscite e accumulo'), ('{http://www.w3.org/2000/svg}text', (('x', '40'), ('y', '580')), 'Portate in mL/min, sulla stessa scala.'), ('{http://www.w3.org/2000/svg}text', (('x', '50'), ('y', '650')), 'Entrata'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#6852a3'), ('height', '35'), ('width', '405'), ('x', '160'), ('y', '625')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '575'), ('y', '650')), '90'), ('{http://www.w3.org/2000/svg}text', (('x', '50'), ('y', '740')), 'Ramo 1'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#147c76'), ('height', '35'), ('width', '135'), ('x', '160'), ('y', '715')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '310'), ('y', '740')), '30'), ('{http://www.w3.org/2000/svg}text', (('x', '50'), ('y', '830')), 'Ramo 3'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#147c76'), ('height', '35'), ('width', '216'), ('x', '160'), ('y', '805')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '390'), ('y', '830')), '48'), ('{http://www.w3.org/2000/svg}text', (('font-size', '18'), ('x', '40'), ('y', '920')), 'Trattenuto'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#94631e'), ('height', '35'), ('width', '54'), ('x', '160'), ('y', '895')), ''), ('{http://www.w3.org/2000/svg}text', (('x', '230'), ('y', '920')), '12'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '985')), '90 = 30 + 48 + 12'), ('{http://www.w3.org/2000/svg}path', (('d', 'M40 1030H600'), ('stroke', '#cbc6bc')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1085')), '3 · La carica è un’area orientata'), ('{http://www.w3.org/2000/svg}text', (('x', '40'), ('y', '1140')), 'i (A)'), ('{http://www.w3.org/2000/svg}text', (('x', '530'), ('y', '1430')), 't (s)'), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 1400V1160M100 1290H575'), ('fill', 'none'), ('stroke', '#888')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#dceee9'), ('height', '90'), ('width', '200'), ('x', '100'), ('y', '1200')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#eee1c8'), ('height', '30'), ('width', '250'), ('x', '300'), ('y', '1290')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 1200H300V1320H550'), ('fill', 'none'), ('stroke', '#147c76'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 1200H85M100 1320H85M300 1290V1350M550 1290V1350'), ('fill', 'none'), ('stroke', '#aaa'), ('stroke-dasharray', '4 4')), ''), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'end'), ('x', '80'), ('y', '1208')), '+0,30'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'end'), ('x', '80'), ('y', '1328')), '−0,10'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'end'), ('x', '80'), ('y', '1285')), '0'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'end'), ('x', '80'), ('y', '1380')), '0'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '300'), ('y', '1380')), '4'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '550'), ('y', '1380')), '9'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '200'), ('y', '1245')), '+1,2 C'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '430'), ('y', '1270')), '−0,5 C'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '1480')), 'q netto = +0,7 C'), ('{http://www.w3.org/2000/svg}path', (('d', 'M40 1530H600'), ('stroke', '#cbc6bc')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '25'), ('font-weight', 'bold'), ('x', '40'), ('y', '1585')), '4 · La stessa acqua attraversa il banco'), ('{http://www.w3.org/2000/svg}text', (('font-size', '18'), ('x', '40'), ('y', '1640')), 'Regime stazionario; niente dispersioni o cambi di fase.'), ('{http://www.w3.org/2000/svg}rect', (('fill', '#eee9da'), ('height', '145'), ('rx', '8'), ('stroke', '#888'), ('width', '220'), ('x', '55'), ('y', '1710')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#dceee9'), ('height', '145'), ('rx', '8'), ('stroke', '#888'), ('width', '220'), ('x', '365'), ('y', '1710')), ''), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '165'), ('y', '1750')), 'Ingresso'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '165'), ('y', '1795')), '4 g ogni secondo'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '475'), ('y', '1750')), 'Uscita'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '475'), ('y', '1795')), 'Stessa massa'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '475'), ('y', '1830')), '+0,50 K'), ('{http://www.w3.org/2000/svg}path', (('d', 'M280 1780H360'), ('marker-end', 'url(#green)'), ('stroke', '#147c76'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '1920')), 'Il riscaldatore fornisce 8 J ogni secondo.'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '1980')), 'ρ = 1000 kg/m³ ; c = 4000 J/(kg K)'), ('{http://www.w3.org/2000/svg}text', (('text-anchor', 'middle'), ('x', '320'), ('y', '2040')), '4 g/s corrispondono a 4 mL/s'))
NUMERIC_UNITS={1: 'μs', 3: 'mL/min', 4: 'W', 5: 'J', 6: 'J', 8: '1', 10: 'kg/m³', 12: 'mJ', 13: 'mL/s'}
OPTION_SUFFIX={1: ' μs', 2: ' kg', 3: ' mL/min', 4: ' W', 5: ' J', 6: ' J', 7: '', 8: '', 9: ' C', 10: ' kg/m³', 12: ' mJ', 13: ' mL/s'}
UNITS={1: 'microsecond', 2: 'kilogram', 3: 'milliliter/minute', 4: 'watt', 5: 'joule', 6: 'joule', 7: 'dimensionless', 8: 'dimensionless', 9: 'coulomb', 10: 'kilogram/meter**3', 11: 'dimensionless', 12: 'millijoule', 13: 'milliliter/second'}
LESSON_REFERENCES={'C6-Q001': {'id': 'C6-L01', 'title': 'Dal dato al modello', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q002': {'id': 'C6-L01', 'title': 'Dal dato al modello', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q003': {'id': 'C6-L02', 'title': 'Segui ciò che attraversa la superficie', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q004': {'id': 'C6-L02', 'title': 'Segui ciò che attraversa la superficie', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q005': {'id': 'C6-L03', 'title': 'Dove finisce l’energia?', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q006': {'id': 'C6-L03', 'title': 'Dove finisce l’energia?', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q007': {'id': 'C6-L04', 'title': 'Riconoscere il fattore che si ripete', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q008': {'id': 'C6-L04', 'title': 'Riconoscere il fattore che si ripete', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q009': {'id': 'C6-L05', 'title': 'Pendenza, altezza o area?', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q010': {'id': 'C6-L05', 'title': 'Pendenza, altezza o area?', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q011': {'id': 'C6-L06', 'title': 'Ricostruire un ragionamento a distanza', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-Q012': {'id': 'C6-L06', 'title': 'Ricostruire un ragionamento a distanza', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}, 'C6-AQ01': {'id': 'C6-L01', 'title': 'Dal dato al modello', 'sourcePath': 'officina-di-fisica/content/C6.json', 'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d'}}
CONCEPT='Frequenza invariata e potenza ottica incidente maggiore'
REQUIRED_DOMAIN_FRAGMENTS={'C6-Q001': ['sensori fermi', 'velocità uniforme', 'ritardi degli strumenti'], 'C6-Q002': ['differenza di pressione uniforme'], 'C6-Q003': ['liquido incomprimibile', 'non ci sono altre entrate, uscite o perdite'], 'C6-Q004': ['mantiene una caduta', 'potenza elettrica media'], 'C6-Q005': ['velocità resta costante', 'non ci sono altre sorgenti'], 'C6-Q006': ['tornando allo stato iniziale', 'Non ci sono altri scambi'], 'C6-Q007': ['newtoniano', 'laminare stazionario sviluppato', 'aderenza alle pareti ferme', 'portata positiva'], 'C6-Q008': ['isotropicamente', 'attività positiva', 'r>0', 'efficienza invariata'], 'C6-Q009': ['stesso verso positivo'], 'C6-Q010': ['in quiete', 'densità costante'], 'C6-Q011': ['potenza ottica incidente'], 'C6-Q012': ['costantemente', 'mantiene questa frazione'], 'C6-AQ01': ['regime stazionario', 'Trascura dispersioni, cambiamenti di fase e variazioni di quota e velocità', 'costanti']}

def predictions():
    q=sp.Rational
    values={
        'C6-Q001':q(30,100)/1500*10**6,
        'C6-Q002':q(2,10**4)*25000/10,
        'C6-Q003':sp.Integer(90-30-12),
        'C6-Q004':q(12,60)*5,
        'C6-Q005':sp.Integer(30-24),
        'C6-Q006':sp.Integer(900-600)*q(4,5),
        'C6-Q007':q(1,2**4),
        'C6-Q008':sp.Integer(2*3**2),
        'C6-Q009':q(3,10)*4-q(1,10)*5,
        'C6-Q010':q(2000)/(10*q(1,4)),
        'C6-Q011':'Frequenza invariata, con geometria e risposta del sensore invariati',
        'C6-Q012':sp.Integer(5)*q(1,5)*q(1,50)*3*1000,
        'C6-AQ01':q(8)/(4000*q(1,2))/1000*10**6,
    }
    for value in values.values():
        if not isinstance(value,str):
            assert value.is_real is True and value.is_finite is True
            assert not value.has(sp.Float)
    return values

def dimensional_crosschecks():
    u=pint.UnitRegistry(non_int_type=Fraction)
    def quantity(n,unit):return u.Quantity(Fraction(n),unit)
    cases=[
        (quantity('3/10','m')/quantity(1500,'m/s'),'microsecond',Fraction(200)),
        (quantity(25000,'Pa')*quantity('1/5000','m^2')/quantity(10,'m/s^2'),'kg',Fraction(1,2)),
        (quantity(12,'C')/quantity(1,'minute')*quantity(5,'V'),'W',Fraction(1)),
        (quantity('3/10','A')*quantity(4,'s')-quantity('1/10','A')*quantity(5,'s'),'C',Fraction(7,10)),
        (quantity(2000,'Pa')/(quantity(10,'m/s^2')*quantity('1/4','m')),'kg/m^3',Fraction(800)),
        (quantity(5,'W')*Fraction(1,5)*Fraction(1,50)*quantity(3,'s'),'mJ',Fraction(60)),
        (quantity(8,'W')/(quantity(4000,'J/kg/K')*quantity('1/2','K'))/quantity(1000,'kg/m^3'),'mL/s',Fraction(4)),
    ]
    outputs=[]
    for value,unit,wanted in cases:
        converted=value.to(unit)
        assert isinstance(converted.magnitude,(int,Fraction))
        assert converted.magnitude==wanted
        outputs.append({'magnitude':str(converted.magnitude),'unit':unit})
    return outputs

def main():
    values=predictions()
    expected=[200,sp.Rational(1,2),48,1,6,240,sp.Rational(1,16),18,sp.Rational(7,10),800,60,4]
    assert [v for v in values.values() if not isinstance(v,str)]==expected
    dimensions=dimensional_crosschecks()
    print({'scope':'partial source-only practice preparation, no SCI credit','exactNumericDerivations':12,'distinctConceptualDerivations':1,'exactPintChecks':len(dimensions),'values':{k:str(v) for k,v in values.items()},'dimensions':dimensions})
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
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-').replace(',','.'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error

def _positive(value):
    value=_finite_exact(value)
    if value.is_positive is not True:raise ValueError('Positive exact domain required')
    return value

def _nonnegative(value):
    value=_finite_exact(value)
    if value.is_nonnegative is not True:raise ValueError('Nonnegative exact domain required')
    return value

def flight_time(distance,speed):return _positive(distance)/_positive(speed)
def pressure_mass(pressure,area,gravity):return _positive(pressure)*_positive(area)/_positive(gravity)
def outgoing_flow(incoming,branch,accumulated):return _nonnegative(_positive(incoming)-_nonnegative(branch)-_nonnegative(accumulated))
def fixed_voltage_power(charge,voltage,duration):return _positive(charge)*_positive(voltage)/_positive(duration)
def remaining_energy(available,measured):return _nonnegative(_nonnegative(available)-_nonnegative(measured))
def converted_cycle(hot,cold,efficiency):
    hot,cold,efficiency=_positive(hot),_nonnegative(cold),_nonnegative(efficiency)
    if cold>hot or efficiency>1:raise ValueError('Cycle output and efficiency outside admitted domain')
    return (hot-cold)*efficiency

def pressure_radius_ratio(radius_factor):return 1/_positive(radius_factor)**4
def count_reduction(activity_fraction,radius_factor):return _positive(radius_factor)**2/_positive(activity_fraction)
def signed_charge(first_current,first_time,second_current,second_time):return _finite_exact(first_current)*_positive(first_time)+_finite_exact(second_current)*_positive(second_time)
def hydrostatic_density(pressure,gravity,height):return _positive(pressure)/(_positive(gravity)*_positive(height))
def received_energy(power,efficiency,fraction,duration):
    power,efficiency,fraction,duration=_positive(power),_nonnegative(efficiency),_nonnegative(fraction),_positive(duration)
    if efficiency>1 or fraction>1:raise ValueError('Energy fractions outside [0,1]')
    return power*efficiency*fraction*duration

def heating_volume(power,specific_heat,temperature_increase,density):return _positive(power)/(_positive(specific_heat)*_positive(temperature_increase)*_positive(density))

@lru_cache(maxsize=1)
def oracle():
    main()
    values=predictions();q=sp.Rational
    witnesses={
      'C6-Q001':flight_time(q(3,10),1500)*10**6,
      'C6-Q002':pressure_mass(25000,q(2,10000),10),
      'C6-Q003':outgoing_flow(90,30,12),
      'C6-Q004':fixed_voltage_power(12,5,60),
      'C6-Q005':remaining_energy(30,24),
      'C6-Q006':converted_cycle(900,600,q(4,5)),
      'C6-Q007':pressure_radius_ratio(2),
      'C6-Q008':count_reduction(q(1,2),3),
      'C6-Q009':signed_charge(q(3,10),4,q(-1,10),5),
      'C6-Q010':hydrostatic_density(2000,10,q(1,4)),
      'C6-Q012':received_energy(5,q(1,5),q(1,50),3)*1000,
      'C6-AQ01':heating_volume(8,4000,q(1,2),1000)*10**6}
    for key,value in witnesses.items():assert sp.simplify(value-values[key])==0,key
    return [CONCEPT if key=='C6-Q011'else values[key]for key in ORDERED_IDS]

@lru_cache(maxsize=1)
def source_records():
    result={}
    for path in set(SOURCE_PATHS.values()):
        raw=git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,path)
        if sha(raw)!=SOURCE_FILE_SHA256[path]:raise ValueError('Pinned original source file changed')
        for row in json.loads(raw):
            if row['id']in EXPECTED_IDS and SOURCE_PATHS[row['id']]==path:result[row['id']]=row
    if set(result)!=EXPECTED_IDS:raise ValueError('Individual source path coverage incomplete')
    return result

def parse_option(number,option):
    if type(number)is not int or not 1<=number<=13 or not isinstance(option,str):raise ValueError('Reviewed option index and exact string required')
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required physical unit absent')
    return parse_literal(option.removesuffix(suffix)if suffix else option)

def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    for suffix,dimension,scale in [(' μs','time',sp.Rational(1,10**6)),(' µs','time',sp.Rational(1,10**6)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' g','mass',sp.Rational(1,1000)),(' kg','mass',sp.Integer(1)),(' mL/min','flow',sp.Rational(1,60000000)),(' mL/s','flow',sp.Rational(1,10**6)),(' cm³/s','flow',sp.Rational(1,10**6)),(' m³/s','flow',sp.Integer(1)),(' mJ','energy',sp.Rational(1,1000)),(' J','energy',sp.Integer(1)),(' mW','power',sp.Rational(1,1000)),(' W','power',sp.Integer(1)),(' mC','charge',sp.Rational(1,1000)),(' C','charge',sp.Integer(1)),(' kg/m³','density',sp.Integer(1)),(' g/cm³','density',sp.Integer(1000)),('','dimensionless',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix)if suffix else option)
        except(ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    actual=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in root.iter())
    if actual!=REQUIRED_GEOMETRY:raise ValueError('Independent physical scale or reviewed SVG quantity labels/accessibility changed')
    return GEOMETRY_REVIEW

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected astra/1')
    asset_root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();source=source_records();geometry=asset_geometry(asset_root);common=[];records=[]
    model=Path(__file__).resolve().parents[2]/MODEL_PATH
    literal_hash=sha(Path(exact_numbers.__file__).read_bytes())
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append('Independent frozen source-only model changed')
    if literal_hash!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append('Independent exact decoder changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Independent reviewed package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Independent reviewed binding edition changed')
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);key=row['id'];index=INDEX[key];number=index+1;original=source[key];context=EXPECTED_CONTEXT[key];provenance=b.get('provenance',{})
        for fragment in REQUIRED_DOMAIN_FRAGMENTS.get(key,[]):
            if fragment not in row.get('prompt',''):errors.append('Independent reviewed physical domain missing: '+fragment)
        if b.get('sourceId')!=key or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(original):errors.append('Independent pinned Git source binding mismatch')
        if(provenance.get('sourcePath')!=SOURCE_PATHS[key]or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=key or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=original['version']or type(provenance.get('sourceVersion'))is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved'or provenance.get('sourceProvenance')!=original.get('provenance')or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c6_integrative_authoring'or b.get('provenanceSha256')!=digest(provenance)or provenance.get('humanApproval')!='NOT_RUN'or provenance.get('status')!='DRAFT'or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        for field in('id','kind','course','section','order','skill','prerequisites','family','difficulty','exam'):
            if row.get(field)!=context.get(field)or type(row.get(field))is not type(context.get(field)):errors.append('Individual Cric identity/context mismatch: '+field)
        if(row.get('baseVersion')!=original['version']or row.get('version')!=original['version']+1 or type(row.get('baseVersion'))is not int or type(row.get('version'))is not int):errors.append('Individual Cric baseVersion/version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Actual skill and feedback target mismatch')
        wanted=expected[index];answer=row['answer'];value=answer['value']
        if isinstance(wanted,str):
            if value!=wanted:errors.append('Independent physical conceptual key mismatch')
        else:
            if answer['type']=='numeric'and type(value)is not int:errors.append('Independent numeric answer must preserve an exact integer JSON value')
            try:
                actual=parse_option(number,str(value))if answer['type']=='choice'else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append('Independent primary physical exact result mismatch')
            except(ValueError,TypeError):errors.append('Independent exact answer or physical unit invalid')
            if answer['type']=='choice':
                identities=[v for option in answer['options']if(v:=alternative_identity(option,number))is not None]
                if len(identities)!=len(set(identities)):errors.append('Equivalent exact numeric choices require editorial review')
        if answer['type']=='numeric'and(answer.get('unit')!=NUMERIC_UNITS.get(number)or answer.get('tolerance')!=0):errors.append('Independent numeric physical unit mismatch')
        records.append({'id':key,'sourceSha256':b['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'reviewDependencySha256':{'exact_arithmetic_literals.py':literal_hash},'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(wanted),'dimension':{str(k):str(v)for k,v in SI.Unit(UNITS[number]).dimensionality.items()},'manualArithmetic':MANUAL[key],'physicalAssumptions':READING_NOTES[key],'distractors':READING_NOTES[key],'pedagogicalReview':READING_NOTES[key],'assetReview':geometry if assets else'not attached to this record','verificationMode':'AI_CONCEPTUAL'if isinstance(wanted,str)else'EXACT_ORACLE','methods':['prompt_only_frozen_primary_and_identical_source_model_AST','exact_SymPy_and_Fraction_Pint_dimensions','separate_manual_original_final_distractor_lesson_and_full_SVG_review'],'lessonReference':LESSON_REFERENCES[key],'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return records

def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'reviewDependencySha256':{'exact_arithmetic_literals.py':sha(Path(exact_numbers.__file__).read_bytes())},'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__,'hypothesis':hypothesis.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),'source':{'commit':SOURCE_REF,'pathsById':SOURCE_PATHS,'sourceFileSha256':SOURCE_FILE_SHA256},'primaryBeforeCandidateKeys':{'path':PRIMARY_PATH,'sha256':PRIMARY_SHA256},'modelsBeforeCandidateKeys':{'path':MODEL_PATH,'sha256':INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,'commit':MODEL_REF},'modelFunctionBodies':'All frozen source-only model functions retain identical AST; separate typed SI-law witnesses and exact literal guard added afterward.'}
