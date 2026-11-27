"""Distinct source-first C5 review; concepts separately read; no authoring imports."""
from fractions import Fraction
from functools import lru_cache
import json,re,xml.etree.ElementTree as ET
from pathlib import Path
import sympy as sp
import pint,hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C5.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='0908ada36b1ff643d239adf7d25e636eeefd4cc7b21053ac6b6b6a53c75317b8'
MODEL_PATH='editorial/reviews/cric-c5-001-050-independent-models.py'
MODEL_REF='18fd1cd488c90f4d294e4cfc6fb361be9a042d88'
PRIMARY_PATH='editorial/reviews/primary-cric-c5-001-050-before-candidates-20261126.md'
PRIMARY_SHA256='27a0255c29f25dd30e89b343b8a1a1268bc76fbbdd8551d2cc8c83f9db569059'
CANDIDATE_REF='637af6f6dda9e7c8a58869ca0d3b92d284e3dee2'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L02', 'title': 'Una fotografia e un cronometro raccontano due cose diverse', 'actualLessonPrerequisites': ['C5-L01']}
FAMILY='cric-c5-l02'
BATCH='cric-c5-l02'
ASSET_NAME='cric-c5-l02-progressive.svg'
OFFSET=10
REVIEWED_PACKAGE_SHA256='037d37781615de8bc4e404e3be5eb5e855b8aada120fbdea0c35b6137cc74cbc'
REVIEWED_BINDINGS_SHA256='d8cfe5e10410a0c00e5a60ccec8b17d3df03cbe3a52aeb10934585c36744a353'
EXPECTED_IDS={'C5-Q011', 'C5-Q012', 'C5-Q014', 'C5-Q017', 'C5-Q019', 'C5-Q013', 'C5-Q018', 'C5-Q016', 'C5-Q020', 'C5-Q015'}
REVIEWED_CANDIDATES={'C5-Q011': '8d52bf10ddae0bfb371fa2d636fe83ded21acafc67cb0ff57161d8a0db2c33a2', 'C5-Q012': 'aae5991f0bdc02bdfe1a094b17c3190f1a5d310e269698a2fa6d09f4f2679e41', 'C5-Q013': 'd2e6cb4a92c8933c96f9b6e6335ecd0cf3c7909cd24e8141718d6bff2fcc4276', 'C5-Q014': '2fd4a255d84f08c33052e62f71f01128baaa4bd447cbfaad032eec21154fd3ed', 'C5-Q015': '5504dc14f5d600809ee9873f8b92cf52bdaf07f3cd29a5d438f6fb14bbe404a0', 'C5-Q016': '23f6422183a7996fc8969e124f8f55a04fb947a02c1a535137664c2f9249ef8f', 'C5-Q017': '284a5f1d1e475f6f05cde745416dd413cc3290d0a63fbf46b1c272608962ea89', 'C5-Q018': '3636baeae6feecfe939e28208c2fba16142703428657f707c3faaa9941b55d34', 'C5-Q019': 'd5cc187005caff60e5e4e24ab2fe961430ec26868b8361d6fc20dd9cd677655e', 'C5-Q020': 'd6c6036241aff3fe5d73bcc874a3d4e91fe2676f9efc31e86d55c9082672a57a'}
EXPECTED_CONTEXT={'C5-Q011': {'id': 'C5-Q011', 'kind': 'question', 'course': 'C5', 'order': 11, 'skill': 'C5-L02', 'family': 'cresta-e-valle-adiacente', 'difficulty': 1, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q012': {'id': 'C5-Q012', 'kind': 'question', 'course': 'C5', 'order': 12, 'skill': 'C5-L02', 'family': 'etichetta-del-sensore', 'difficulty': 1, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q013': {'id': 'C5-Q013', 'kind': 'question', 'course': 'C5', 'order': 13, 'skill': 'C5-L02', 'family': 'londa-trasporta-il-segno', 'difficulty': 1, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q014': {'id': 'C5-Q014', 'kind': 'question', 'course': 'C5', 'order': 14, 'skill': 'C5-L02', 'family': 'sfasamento-fra-sensori', 'difficulty': 2, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q015': {'id': 'C5-Q015', 'kind': 'question', 'course': 'C5', 'order': 15, 'skill': 'C5-L02', 'family': 'ritardo-di-arrivo', 'difficulty': 2, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q016': {'id': 'C5-Q016', 'kind': 'question', 'course': 'C5', 'order': 16, 'skill': 'C5-L02', 'family': 'frequenza-imposta', 'difficulty': 2, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q017': {'id': 'C5-Q017', 'kind': 'question', 'course': 'C5', 'order': 17, 'skill': 'C5-L02', 'family': 'ricostruire-il-numero-donda', 'difficulty': 2, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q018': {'id': 'C5-Q018', 'kind': 'question', 'course': 'C5', 'order': 18, 'skill': 'C5-L02', 'family': 'strati-daria-nel-condotto', 'difficulty': 1, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q019': {'id': 'C5-Q019', 'kind': 'question', 'course': 'C5', 'order': 19, 'skill': 'C5-L02', 'family': 'fase-seguita-a-tempo-crescente', 'difficulty': 3, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}, 'C5-Q020': {'id': 'C5-Q020', 'kind': 'question', 'course': 'C5', 'order': 20, 'skill': 'C5-L02', 'family': 'fotografia-senza-cronometro', 'difficulty': 2, 'prerequisites': ['C5-L01'], 'exam': None, 'version': 1}}
NUMERIC_UNITS={11: 'cm', 15: 'm/s'}
OPTION_SUFFIX={14: ' rad', 16: '', 17: ' rad/m', 19: ' m'}
UNITS={11: 'centimeter', 12: 'dimensionless', 13: 'dimensionless', 14: 'radian', 15: 'meter/second', 16: 'dimensionless', 17: 'radian/meter', 18: 'dimensionless', 19: 'meter', 20: 'dimensionless'}
MANUAL=['Fra cresta e valle immediatamente successiva corre metà lunghezza d’onda. Quindi λ=2·18=36 cm. Si legge una distanza nello spazio, non una durata.', 'La distanza fra massimi consecutivi sul grafico temporale nello stesso punto è il periodo. L’unità è millisecondi; una lunghezza d’onda richiederebbe invece un’ascissa spaziale.', 'Per un impulso localizzato ideale che riporta la corda all’equilibrio, la macchia oscilla con l’elemento materiale e poi torna nella posizione di riposo, senza seguire il massimo lungo la corda. È distinta la propagazione della deformazione dal trasporto materiale nel modello trasversale lineare.', 'La differenza di fase spaziale ha modulo kΔx=2πΔx/λ=2π(0,12/0,48)=π/2 rad. Il rapporto delle lunghezze è 1/4. Si confronta lo stesso istante e si assume la stessa onda progressiva.', 'La velocità media del massimo è (1,60−0,40)/(0,24−0,16)=1,20/0,08=15 m/s verso x crescente. Una velocità media non richiede di assumere velocità istantanea costante.', 'A velocità di propagazione invariata, λ=v/f. Triplicando f, la distanza fra massimi adiacenti diventa un terzo; non si triplica la velocità se il mezzo resta quello dichiarato.', 'k=2π/λ=2π/(5/2)=4π/5 rad/m. Il radiante è adimensionale in SI, ma scriverlo chiarisce che k moltiplica una lunghezza per costruire una fase.', 'È un’onda longitudinale. Il moto oscillatorio locale è parallelo alla propagazione; il grafico della pressione non è una traiettoria trasversale delle particelle d’aria.', 'La fase costante di una cresta soddisfa 6x−12t=costante, quindi dx/dt=12/6=2 m/s verso x positivo. In 0,30 s si sposta di 3/5 m=0,60 m. Non si usa il coefficiente 12 direttamente come velocità.', 'Con scala spaziale calibrata si può misurare direttamente λ, e anche A se è nota la scala dello spostamento verticale. Una sola istantanea non determina periodo, frequenza, velocità o verso della propagazione senza altri dati. La futura scelta deve essere controllata perché λ e A possono essere entrambe grandezze geometriche osservabili.']
READING_NOTES=['La separazione cresta-valle è mezza lunghezza, non ampiezza verticale; raddoppiare 18 cm produce 36 cm.', 'Un sensore fisso misura separazioni temporali; pressione in pascal è ordinata, non distanza spaziale o traiettoria.', 'La macchia segue la porzione materiale e torna al riposo nel modello trasversale lineare senza residuo; il massimo della forma prosegue.', 'La separazione vale un quarto di ciclo, cioè π/2 rad; 1/4 senza 2π non è il valore in radianti.', 'Dividere differenze dà 1,20/0,08=15 m/s; 20 usa posizione finale senza sottrarre il primo evento.', 'A v costante λ è inversa di f; triplicare entrambi darebbe fattore nove nel prodotto, non v fissata.', 'k=2π/λ=4π/5 rad/m; 2/5 è il numero di cicli per metro, reciproci e prodotti hanno altra dipendenza.', 'La geometria del moto materiale parallelo al vettore di propagazione definisce longitudinale, non un’onda stazionaria.', 'La fase costante impone 6Δx=12Δt: verso positivo, 0,60 m; invertire il rapporto dà 0,15 m.', 'Una fotografia calibrata nello spazio offre λ; senza tempi o dinamica non dà f, T o velocità. Ampiezza possibile ma assente fra le scelte.']
GEOMETRY_REVIEW='PNG640×1560 e XML completi: creste a150/510 e valle330 rappresentano0/36/18 cm, scala10/cm e ordinata schematica. Cerchio di fase a320,850 r110 e arco r60 indicano un quarto di giro, non moto materiale. Retta delle differenze da140,1430 a500,1190 rappresenta1,20 m in0,08 s; punto medio0,60 m/0,04 s. Zeri, testi e punte leggibili.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('height', '1560'), ('role', 'img'), ('viewBox', '0 0 640 1560'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Spazio dell’onda, fase e propagazione della cresta'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Una sinusoide ha creste separate da trentasei centimetri e valle intermedia a diciotto. Un cerchio di fase mostra un quarto di giro, non il moto della corda. Il grafico finale delle differenze mostra uno spostamento di uno virgola venti metri in zero virgola zero otto secondi.'), ('{http://www.w3.org/2000/svg}defs', (), ''), ('{http://www.w3.org/2000/svg}marker', (('id', 'tip'), ('markerHeight', '6'), ('markerWidth', '6'), ('orient', 'auto'), ('refX', '9'), ('refY', '5'), ('viewBox', '0 0 10 10')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M0 0L10 5L0 10Z'), ('fill', 'context-stroke')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '1560'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}g', (('fill', '#202c39'), ('font-family', 'Arial, sans-serif')), '\n'), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '52')), '1. Una fotografia misura distanze'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '95')), 'Cresta, valle e cresta nello stesso istante.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M100 150V445M100 280H560'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}polyline', (('fill', 'none'), ('points', '150.000000,190.000000 152.250000,190.069387 154.500000,190.277440 156.750000,190.623839 159.000000,191.108049 161.250000,191.729325 163.500000,192.486707 165.750000,193.379029 168.000000,194.404914 170.250000,195.562780 172.500000,196.850842 174.750000,198.267114 177.000000,199.809413 179.250000,201.475359 181.500000,203.262385 183.750000,205.167735 186.000000,207.188471 188.250000,209.321476 190.500000,211.563463 192.750000,213.910974 195.000000,216.360390 197.250000,218.907933 199.500000,221.549676 201.750000,224.281545 204.000000,227.099327 206.250000,229.998679 208.500000,232.975129 210.750000,236.024088 213.000000,239.140855 215.250000,242.320624 217.500000,245.558491 219.750000,248.849465 222.000000,252.188471 224.250000,255.570360 226.500000,258.989917 228.750000,262.441871 231.000000,265.920898 233.250000,269.421634 235.500000,272.938681 237.750000,276.466617 240.000000,280.000000 242.250000,283.533383 244.500000,287.061319 246.750000,290.578366 249.000000,294.079102 251.250000,297.558129 253.500000,301.010083 255.750000,304.429640 258.000000,307.811529 260.250000,311.150535 262.500000,314.441509 264.750000,317.679376 267.000000,320.859145 269.250000,323.975912 271.500000,327.024871 273.750000,330.001321 276.000000,332.900673 278.250000,335.718455 280.500000,338.450324 282.750000,341.092067 285.000000,343.639610 287.250000,346.089026 289.500000,348.436537 291.750000,350.678524 294.000000,352.811529 296.250000,354.832265 298.500000,356.737615 300.750000,358.524641 303.000000,360.190587 305.250000,361.732886 307.500000,363.149158 309.750000,364.437220 312.000000,365.595086 314.250000,366.620971 316.500000,367.513293 318.750000,368.270675 321.000000,368.891951 323.250000,369.376161 325.500000,369.722560 327.750000,369.930613 330.000000,370.000000 332.250000,369.930613 334.500000,369.722560 336.750000,369.376161 339.000000,368.891951 341.250000,368.270675 343.500000,367.513293 345.750000,366.620971 348.000000,365.595086 350.250000,364.437220 352.500000,363.149158 354.750000,361.732886 357.000000,360.190587 359.250000,358.524641 361.500000,356.737615 363.750000,354.832265 366.000000,352.811529 368.250000,350.678524 370.500000,348.436537 372.750000,346.089026 375.000000,343.639610 377.250000,341.092067 379.500000,338.450324 381.750000,335.718455 384.000000,332.900673 386.250000,330.001321 388.500000,327.024871 390.750000,323.975912 393.000000,320.859145 395.250000,317.679376 397.500000,314.441509 399.750000,311.150535 402.000000,307.811529 404.250000,304.429640 406.500000,301.010083 408.750000,297.558129 411.000000,294.079102 413.250000,290.578366 415.500000,287.061319 417.750000,283.533383 420.000000,280.000000 422.250000,276.466617 424.500000,272.938681 426.750000,269.421634 429.000000,265.920898 431.250000,262.441871 433.500000,258.989917 435.750000,255.570360 438.000000,252.188471 440.250000,248.849465 442.500000,245.558491 444.750000,242.320624 447.000000,239.140855 449.250000,236.024088 451.500000,232.975129 453.750000,229.998679 456.000000,227.099327 458.250000,224.281545 460.500000,221.549676 462.750000,218.907933 465.000000,216.360390 467.250000,213.910974 469.500000,211.563463 471.750000,209.321476 474.000000,207.188471 476.250000,205.167735 478.500000,203.262385 480.750000,201.475359 483.000000,199.809413 485.250000,198.267114 487.500000,196.850842 489.750000,195.562780 492.000000,194.404914 494.250000,193.379029 496.500000,192.486707 498.750000,191.729325 501.000000,191.108049 503.250000,190.623839 505.500000,190.277440 507.750000,190.069387 510.000000,190.000000'), ('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M150 190V445M330 370V445M510 190V445'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '68'), ('y', '153')), 'y'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '537'), ('y', '318')), 'x (cm)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '137'), ('y', '473')), '0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '316'), ('y', '473')), '18'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '496'), ('y', '473')), '36'), ('{http://www.w3.org/2000/svg}path', (('d', 'M150 490V510H510V490'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '252'), ('y', '543')), 'λ = 36 cm'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '568'), ('y2', '568')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '623')), '2. Un quarto di giro di fase'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '666')), 'Separazione dei punti: Δx = λ/4.'), ('{http://www.w3.org/2000/svg}circle', (('cx', '320'), ('cy', '850'), ('fill', 'none'), ('r', '110'), ('stroke', '#899a9f'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M320 850H430'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#26728d'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M320 850V740'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#4e876d'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M380 850A60 60 0 0 0 320 790'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '446'), ('y', '860')), 'φ₁ = 0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '228'), ('y', '719')), 'φ₂ = π/2'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '353'), ('y', '779')), 'π/2'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1000')), 'Cerchio della fase, non traiettoria materiale.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1033'), ('y2', '1033')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '1088')), '3. La pendenza segue la cresta'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1131')), 'Differenze rispetto al primo evento.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1180V1430H555'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1430L500 1190'), ('fill', 'none'), ('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1190H500V1430M140 1310H320V1430'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1178')), 'Δx (m)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '79'), ('y', '1199')), '1,20'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '79'), ('y', '1319')), '0,60'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '105'), ('y', '1465')), '0'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '295'), ('y', '1465')), '0,04'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '475'), ('y', '1465')), '0,08'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '495'), ('y', '1503')), 'Δt (s)'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1540')), '1,20 m in 0,08 s: velocità media 15 m/s.'))
REQUIRED_DOMAIN_FRAGMENTS={'C5-Q011': [], 'C5-Q012': [], 'C5-Q013': ['senza lasciare deformazione residua'], 'C5-Q014': [], 'C5-Q015': [], 'C5-Q016': ['positiva e costante'], 'C5-Q017': [], 'C5-Q018': [], 'C5-Q019': [], 'C5-Q020': []}
CONCEPTS={12: 'Il periodo', 13: 'Torna alla posizione di equilibrio iniziale', 18: 'Longitudinale', 20: 'La lunghezza d’onda'}
KNOWN_OPTIONS={16: {'Diventa un terzo': '1/3', 'Triplica': '3', 'Diventa un nono': '1/9', 'Resta uguale': '1'}}

def source_only_predictions():
 q=sp.Rational
 return {'C5-Q001':7,'C5-Q002':(q(85,100)-q(10,100))/5,'C5-Q003':1/(2*q(18,1000)),
 'C5-Q006':3*sp.pi/(2*sp.pi),'C5-Q009':sp.sqrt(4),'C5-Q011':2*18,
 'C5-Q014':2*sp.pi*q(12,100)/q(48,100),'C5-Q015':(q(160,100)-q(40,100))/(q(24,100)-q(16,100)),
 'C5-Q017':2*sp.pi/q(25,10),'C5-Q019':q(12,6)*q(30,100),'C5-Q021':q(12,10)+q(8,10),
 'C5-Q023':abs(5-3),'C5-Q025':q(3)-q(5,2),'C5-Q027':q(2)**2,'C5-Q029':q(102,100)/340*1000,
 'C5-Q031':q(12,1000)/(3*q(2,10000)),'C5-Q032':q(2,2**2),'C5-Q033':q(80,100)*sp.sqrt(9),
 'C5-Q037':4*q(2,10),'C5-Q038':q(3),'C5-Q039':5*4*sp.cos(sp.pi/3),'C5-Q041':q(1,10**12)*10**5*10**6,
 'C5-Q043':10*sp.log(q(1,100))/sp.log(10),'C5-Q045':2*q(51)/q(30,100),
 'C5-Q048':q(1480,1000),'C5-Q050':10*sp.log(3)/sp.log(10)}

def dimensional_crosschecks():
 q=Fraction;u=lambda value,unit:SI.Quantity(q(value),unit)
 return [u(q(3,4),'second')/5,1/u(36,'millisecond'),u(q(6,5),'meter')/u(q(2,25),'second'),u(4,'watt')*u(2,'millisecond')/u(10,'millisecond'),u(102,'meter')/u(q(3,10),'second'),u(1480,'meter/second')/u(1,'kilohertz'),u(12,'millijoule')/(u(3,'second')*u(2,'centimeter**2')),u(5,'watt/meter**2')*u(4,'meter**2')*q(1,2)]

def main():
 q=sp.Rational;values=source_only_predictions();expected={1:7,2:q(3,20),3:q(250,9),6:q(3,2),9:2,11:36,14:sp.pi/2,15:15,17:4*sp.pi/5,19:q(3,5),21:2,23:2,25:q(1,2),27:4,29:3,31:20,32:q(1,2),33:q(12,5),37:q(4,5),38:3,39:10,41:q(1,10),43:-20,45:340,48:q(37,25),50:10*sp.log(3)/sp.log(10)}
 for value in values.values():
  expr=sp.sympify(value);assert expr.is_real is True and expr.is_finite is True and not expr.has(sp.Float)
 for n,wanted in expected.items():assert sp.simplify(values[f'C5-Q{n:03}']-wanted)==0,(n,values[f'C5-Q{n:03}'],wanted)
 for x,unit,wanted in zip(dimensional_crosschecks(),['second','hertz','meter/second','watt','meter/second','meter','watt/meter**2','watt'],[Fraction(3,20),Fraction(250,9),15,Fraction(4,5),340,Fraction(37,25),20,10]):assert isinstance(x.to(unit).magnitude,(int,Fraction)) and x.to(unit).magnitude==wanted
 assert sp.log(3)/sp.log(10)>0
 print('50_PROMPTS_INDIVIDUALLY_DERIVED;26_EXACT_NUMERIC_SYMBOLIC_CHECKS;8_PINT_CHECKS;NO_CANDIDATE_KEYS_OPENED;NO_CANDIDATE_SCI_PASS',flush=True)
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
@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
KNOWN_MATH={'π':sp.pi,'2π':2*sp.pi,'π/2':sp.pi/2,'π/4':sp.pi/4,'5/(4π)':5/(4*sp.pi),'4π/5':4*sp.pi/5,'5π':5*sp.pi,'4π':4*sp.pi,'20 log₁₀(3)':20*sp.log(3)/sp.log(10),'10 log₁₀(1/3)':-10*sp.log(3)/sp.log(10),'10 log₁₀(3)':10*sp.log(3)/sp.log(10)}
def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_MATH:return _finite_exact(KNOWN_MATH[raw])
    return parse_literal(raw)
def parse_option(number,option):
    if type(number)is not int or not OFFSET<number<=OFFSET+10 or not isinstance(option,str):raise ValueError('Reviewed option ID and string required')
    if option in KNOWN_OPTIONS.get(number,{}):return parse_literal(KNOWN_OPTIONS[number][option])
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required literal physical unit absent')
    return mapped_literal(option.removesuffix(suffix)if suffix else option)
def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    if number in KNOWN_OPTIONS and option in KNOWN_OPTIONS[number]:return 'normalized',parse_option(number,option)
    for suffix,dimension,scale in [(' μW/m²','intensity',sp.Rational(1,10**6)),(' W/m²','intensity',sp.Integer(1)),(' mW','power',sp.Rational(1,1000)),(' W','power',sp.Integer(1)),(' rad/m','wavenumber',sp.Integer(1)),(' rad','phase',sp.Integer(1)),(' Hz','frequency',sp.Integer(1)),(' periodi','count',sp.Integer(1)),(' m/s','speed',sp.Integer(1)),(' mm','length',sp.Rational(1,1000)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' dB','level',sp.Integer(1)),('','normalized',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix)if suffix else option)
        except (ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    main()
    values=source_only_predictions();physics.check_independent_laws(values);values['C5-Q016']=sp.Rational(1,3)
    return [CONCEPTS[n]if n in CONCEPTS else values[f'C5-Q{n:03}']for n in range(OFFSET+1,OFFSET+11)]
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    actual=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in root.iter())
    if actual!=REQUIRED_GEOMETRY:raise ValueError('Independent physical scale or reviewed SVG quantity labels/accessibility changed')
    return GEOMETRY_REVIEW
from . import cric_c5_wave_physics as physics
WAVE_PHYSICS_SHA256='93914663cf78ebfeca77636e9817dd6c77435641de4a9e83c3140df24909ea27'
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    if sha(Path(physics.__file__).read_bytes())!=WAVE_PHYSICS_SHA256:common.append("Independent wave-law dependency edition mismatch")
    model=Path(__file__).resolve().parents[2]/"editorial/reviews/cric-c5-001-050-independent-models.py"
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append("Independent frozen model edition mismatch")
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"][-3:]);source_id=row["id"]
        source=originals[source_id];provenance=b.get('provenance',{})
        for fragment in REQUIRED_DOMAIN_FRAGMENTS.get(source_id,()):
            if fragment not in row.get('prompt',''):errors.append('Independent reviewed physical domain condition missing: '+fragment)
        if b.get('sourceId')!=source_id or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(source):errors.append('Independent pinned Git source binding mismatch')
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c5_l02_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        context=EXPECTED_CONTEXT[row['id']]
        for field in ('id','kind','course','order','skill','family','difficulty','prerequisites','exam'):
            if row.get(field)!=context.get(field) or type(row.get(field)) is not type(context.get(field)):errors.append('Individual Cric identity, context or protected exam mismatch: '+field)
        if row.get('baseVersion')!=source['version'] or row.get('version')!=source['version']+1 or type(row.get('baseVersion')) is not int or type(row.get('version')) is not int:errors.append('Individual Cric baseVersion or version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Independent reviewed course or actual lesson mapping mismatch')
        wanted=expected[number-OFFSET-1];value=row["answer"]["value"]
        if row["answer"]["type"]=="numeric" and type(value) is not int:
            errors.append("Independent numeric answer must preserve an exact integer JSON value")
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent physical conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option,number)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-OFFSET-1],"physicalAssumptions":READING_NOTES[number-OFFSET-1],"distractors":READING_NOTES[number-OFFSET-1],
          "pedagogicalReview":READING_NOTES[number-OFFSET-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_frozen_prompt_only_wave_models_and_separate_concepts",
            "Pint_exact_wave_dimensions_and_Fraction_lexemes","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes()),"cric_c5_wave_physics.py":sha(Path(physics.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":"Fifty original prompts derived before candidate answers; final cohort fully read separately."},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/cric-c5-001-050-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"18fd1cd488c90f4d294e4cfc6fb361be9a042d88"},"modelFunctionBodies":"All functions in the frozen source-only C5 model retain identical AST. Generic finite/exact literal guards are reused unchanged from the earlier independent C2 verifier.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/primary-cric-c5-001-050-before-candidates-20261126.md","sha256":PRIMARY_SHA256}}
