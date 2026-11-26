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
CANDIDATE_REF='6529aca9064bbd93fbf343f0d9c504beaf08ec57'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L05', 'title': 'Ascoltare il mezzo, la sorgente e il ricevitore', 'actualLessonPrerequisites': ['C5-L02', 'C5-L04']}
FAMILY='cric-c5-l05'
BATCH='cric-c5-l05'
ASSET_NAME='cric-c5-l05-progressive.svg'
OFFSET=40
REVIEWED_PACKAGE_SHA256='d23e601397aa37f2e2573669a3ee33f6fc29978b707cba04de18eccfb33c0749'
REVIEWED_BINDINGS_SHA256='486e0fc771632a71bd66ab4b8ffec4bbe1391fc4d2af9d416c0aa7fe13b11c52'
EXPECTED_IDS={'C5-Q047', 'C5-Q042', 'C5-Q044', 'C5-Q048', 'C5-Q049', 'C5-Q050', 'C5-Q043', 'C5-Q041', 'C5-Q045', 'C5-Q046'}
REVIEWED_CANDIDATES={'C5-Q041': '3b70673a6d37a6d967e76f3fcd93b7f0fffd392e1000153e0984f04013a248df', 'C5-Q042': '439667f7bfc5b6a5059c71f7a7c54838d37347c68f450ab3f9c6dcdd52562d73', 'C5-Q043': '000906ee455d43c97d4b548fe59a1f9677f64fb8f13a0bbd37a110e255d27310', 'C5-Q044': 'd68fa7dd9b4112871e1723485dd8594520f59628f533e231bd5a1d5803f53215', 'C5-Q045': 'bf940f7c36df248cde53fd5d6c38ab2c66f9acc685002fe7dcf6869fbf7584b4', 'C5-Q046': 'ee36a95897a1018f21c31a51c1121105ad99ff888b49ffc8670c2d497a545a8a', 'C5-Q047': '429718b73de43cc854d588aa55c9cfcff183c264080ebea5fa58f9a46f812df6', 'C5-Q048': '6fa0202ad75368e3dd22da1f1e5c57db831815881d4f659e662d00765f5f8a62', 'C5-Q049': 'c4c93f59b5b91033cc4951ea5d45d626784784973883ca94e160f98eae0ebed5', 'C5-Q050': '3edcf793947468f0a7991f29c8d29e184d6f8b0aa299342c508f7ca1f59f755f'}
EXPECTED_CONTEXT={'C5-Q041': {'id': 'C5-Q041', 'kind': 'question', 'course': 'C5', 'order': 41, 'skill': 'C5-L05', 'family': 'intensita-dal-livello-sonoro', 'difficulty': 1, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 2}, 'C5-Q042': {'id': 'C5-Q042', 'kind': 'question', 'course': 'C5', 'order': 42, 'skill': 'C5-L05', 'family': 'il-significato-di-zero-decibel', 'difficulty': 1, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q043': {'id': 'C5-Q043', 'kind': 'question', 'course': 'C5', 'order': 43, 'skill': 'C5-L05', 'family': 'decibel-dopo-attenuazione', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q044': {'id': 'C5-Q044', 'kind': 'question', 'course': 'C5', 'order': 44, 'skill': 'C5-L05', 'family': 'due-suoni-alla-stessa-intensita', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q045': {'id': 'C5-Q045', 'kind': 'question', 'course': 'C5', 'order': 45, 'skill': 'C5-L05', 'family': 'velocita-del-suono-da-uneco', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q046': {'id': 'C5-Q046', 'kind': 'question', 'course': 'C5', 'order': 46, 'skill': 'C5-L05', 'family': 'sorgente-che-supera-losservatore', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q047': {'id': 'C5-Q047', 'kind': 'question', 'course': 'C5', 'order': 47, 'skill': 'C5-L05', 'family': 'ricevitore-in-moto', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q048': {'id': 'C5-Q048', 'kind': 'question', 'course': 'C5', 'order': 48, 'skill': 'C5-L05', 'family': 'frequenza-oltre-uninterfaccia', 'difficulty': 2, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q049': {'id': 'C5-Q049', 'kind': 'question', 'course': 'C5', 'order': 49, 'skill': 'C5-L05', 'family': 'soglia-convenzionale', 'difficulty': 1, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}, 'C5-Q050': {'id': 'C5-Q050', 'kind': 'question', 'course': 'C5', 'order': 50, 'skill': 'C5-L05', 'family': 'tre-sorgenti-incoerenti', 'difficulty': 3, 'prerequisites': ['C5-L02', 'C5-L04'], 'exam': None, 'version': 1}}
NUMERIC_UNITS={43: 'dB', 45: 'm/s'}
OPTION_SUFFIX={41: ' μW/m²', 48: ' m', 50: ' dB'}
UNITS={41: 'microwatt/meter**2', 42: 'dimensionless', 43: 'dimensionless', 44: 'dimensionless', 45: 'meter/second', 46: 'dimensionless', 47: 'dimensionless', 48: 'meter', 49: 'dimensionless', 50: 'dimensionless'}
MANUAL=['Da β=10 log₁₀(I/I₀), 50 dB implica I/I₀=10⁵. Quindi I=10⁻⁷ W/m²=(1/10) µW/m². Il riferimento resta quello assegnato; il rapporto non è 50.', 'Zero decibel significa I/I₀=1, dunque I=I₀, non intensità nulla. Senza fissare un riferimento numerico ulteriore, la risposta fisica è il valore di riferimento non nullo.', 'La variazione è 10 log₁₀(I_f/I_i)=10 log₁₀(1/100)=−20 dB. L’uso di un coefficiente 20 si riferirebbe invece a un rapporto di ampiezze nelle condizioni appropriate, non al rapporto di intensità già dato.', 'No. Il livello percepito dipende anche dalla frequenza e dalla sensibilità dell’ascoltatore; identica intensità fisica non determina da sola identica sensazione sonora. Non si inferiscono condizioni cliniche dal solo confronto.', 'Il tempo dell’eco include andata e ritorno tra sorgente e parete. La distanza percorsa è 2·51=102 m, perciò v=102/0,30=340 m/s. Dividere la sola distanza della parete per il tempo darebbe metà della velocità.', 'Nel consueto modello Doppler subsonico in aria ferma, la frequenza ricevuta è maggiore di quella emessa durante l’avvicinamento e minore durante l’allontanamento. Per sorgente radiale con 0<v_s<c si usa f_avv=f₀c/(c−v_s) e f_all=f₀c/(c+v_s). Non si estendono queste formule a una sorgente supersonica senza riconsiderare il modello.', 'Nel modello classico di ricevitore ideale non perturbativo che si muove verso la sorgente ferma, incontra più fronti al secondo e riceve una frequenza maggiore. La lunghezza d’onda nell’aria resta quella fissata dalla sorgente e dal mezzo, anche se cambia il ritmo di incontro del ricevitore.', 'Attraverso l’interfaccia stazionaria la frequenza resta 1,00 kHz=1000 Hz. Nell’acqua λ=v/f=1480/1000=37/25 m=1,48 m. Cambia la lunghezza d’onda insieme alla velocità, non la frequenza.', 'L’unità usuale del livello di intensità sonora è il decibel. Il livello è logaritmico e distinto dall’intensità fisica misurata in W/m².', 'Per sorgenti indipendenti il termine di interferenza si annulla sulla media e le intensità si sommano: I_tot=3I, con I positivo. L’aumento esatto del livello è 10 log₁₀3 dB=10 ln3/ln10 dB, positivo. Non è un intero né un decimale finito esatto: senza logaritmi numerici il risultato va mantenuto simbolico o va dichiarata una parametrizzazione manuale nella nuova candidata.']
READING_NOTES=['50/10=5 e I=10⁵·10⁻¹²=10⁻⁷ W/m²=0,1 μW/m²;10 μW/m² sarebbe70 dB.', 'Logaritmo nullo significa rapporto uno e I=I₀>0; I=0 è fuori dominio, non0 dB.', 'Un centesimo=10⁻² dà−20 dB; invertire il rapporto cambia segno e omettere dieci dà−2.', 'Uguale intensità e riferimento danno uguale livello fisico ma non obbligano uguale percezione a frequenze diverse.', 'L’eco compie102 m in0,30 s:340 m/s;170 dimentica ritorno e680 conterebbe quattro tratte.', 'Sorgente subsonica con velocità radiali non nulle: avvicinamento aumenta e allontanamento diminuisce la frequenza ricevuta.', 'Il ricevitore va incontro ai fronti già emessi; cambia ritmo degli incontri, non frequenza della sorgente o velocità rispetto all’aria.', 'Interfaccia fissa conserva1000 Hz:λ=1480/1000=1,48 m; uso di1 Hz dà1480 m e doppio prefisso0,00148 m.', 'dB significa decibel; hertz, pascal e joule sono altre grandezze e W/m² misura I, non il suo livello.', 'Le tre intensità incoerenti sommano3I: incremento esatto10 log10 3 positivo;30 dB richiederebbe1000I, non3I.']
GEOMETRY_REVIEW='PNG640×1580 e XML completi: tabella0/10/50 dB corrisponde a1/10/100000 volteI₀; frecce sono corrispondenze e non scala lineare. Due percorsi di350 coordinate rappresentano51 m ciascuno con punte opposte visibili. Sinusoide di pressione con creste180/476, distanza296 per1,48 m; pressione schematica non traiettoria materiale. Tutto dentro il riquadro.'
REQUIRED_GEOMETRY=(('{http://www.w3.org/2000/svg}svg', (('aria-labelledby', 'title desc'), ('height', '1580'), ('role', 'img'), ('viewBox', '0 0 640 1580'), ('width', '640')), '\n'), ('{http://www.w3.org/2000/svg}title', (('id', 'title'),), 'Scala in decibel, tragitto dell’eco e onda nell’acqua'), ('{http://www.w3.org/2000/svg}desc', (('id', 'desc'),), 'Una tabella collega zero, dieci e cinquanta decibel a uno, dieci e centomila volte il riferimento. L’eco percorre due tratte di cinquantuno metri. L’onda in acqua conserva frequenza mille hertz e ha creste separate da uno virgola quarantotto metri; l’altezza è una pressione schematica, non uno spostamento materiale.'), ('{http://www.w3.org/2000/svg}defs', (), ''), ('{http://www.w3.org/2000/svg}marker', (('id', 'tip'), ('markerHeight', '6'), ('markerWidth', '6'), ('orient', 'auto'), ('refX', '9'), ('refY', '5'), ('viewBox', '0 0 10 10')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M0 0L10 5L0 10Z'), ('fill', 'context-stroke')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#fffdf7'), ('height', '1580'), ('width', '640')), ''), ('{http://www.w3.org/2000/svg}g', (('fill', '#202c39'), ('font-family', 'Arial, sans-serif')), '\n'), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '52')), '1. Il livello confronta intensità'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '95')), 'Riferimento positivo: I₀ = 10⁻¹² W/m².'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '65'), ('y', '191')), 'Livello'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '360'), ('y', '191')), 'Intensità'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '78'), ('y', '258')), '0 dB'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '382'), ('y', '258')), 'I₀'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '78'), ('y', '338')), '10 dB'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '382'), ('y', '338')), '10I₀'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '78'), ('y', '418')), '50 dB'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '382'), ('y', '418')), '10⁵I₀'), ('{http://www.w3.org/2000/svg}path', (('d', 'M205 250H330'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M205 330H330'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M205 410H330'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '492')), '50 dB → 10⁵I₀ = 10⁻⁷ W/m².'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '535')), 'Quindi I = 0,10 μW/m².'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '570'), ('y2', '570')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '625')), '2. L’eco conta entrambe le tratte'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '668')), 'Sorgente e microfono nello stesso punto.'), ('{http://www.w3.org/2000/svg}circle', (('cx', '110'), ('cy', '830'), ('fill', '#dceaf0'), ('r', '35'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}rect', (('fill', '#986c35'), ('height', '190'), ('width', '18'), ('x', '525'), ('y', '730')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M160 780H510'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M510 880H160'), ('fill', 'none'), ('marker-end', 'url(#tip)'), ('stroke', '#a1473c'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '264'), ('y', '752')), '51 m'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '264'), ('y', '921')), '51 m'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '38'), ('y', '972')), 'microfono'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '500'), ('y', '972')), 'parete'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1020')), '102 m in 0,30 s → velocità 340 m/s.'), ('{http://www.w3.org/2000/svg}line', (('stroke', '#b8c4ca'), ('x1', '32'), ('x2', '608'), ('y1', '1053'), ('y2', '1053')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '27'), ('font-weight', 'bold'), ('x', '32'), ('y', '1108')), '3. La lunghezza d’onda in acqua'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1151')), 'Frequenza trasmessa: 1,00 kHz.'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1195')), 'Pressione: scala verticale schematica.'), ('{http://www.w3.org/2000/svg}path', (('d', 'M140 1300H560'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}polyline', (('fill', 'none'), ('points', '180.000000,1240.000000 181.850000,1240.046258 183.700000,1240.184960 185.550000,1240.415893 187.400000,1240.738700 189.250000,1241.152883 191.100000,1241.657805 192.950000,1242.252686 194.800000,1242.936609 196.650000,1243.708520 198.500000,1244.567228 200.350000,1245.511410 202.200000,1246.539609 204.050000,1247.650240 205.900000,1248.841590 207.750000,1250.111823 209.600000,1251.458980 211.450000,1252.880984 213.300000,1254.375642 215.150000,1255.940649 217.000000,1257.573593 218.850000,1259.271955 220.700000,1261.033117 222.550000,1262.854363 224.400000,1264.732885 226.250000,1266.665786 228.100000,1268.650086 229.950000,1270.682726 231.800000,1272.760570 233.650000,1274.880416 235.500000,1277.038994 237.350000,1279.232977 239.200000,1281.458980 241.050000,1283.713573 242.900000,1285.993278 244.750000,1288.294581 246.600000,1290.613932 248.450000,1292.947756 250.300000,1295.292454 252.150000,1297.644411 254.000000,1300.000000 255.850000,1302.355589 257.700000,1304.707546 259.550000,1307.052244 261.400000,1309.386068 263.250000,1311.705419 265.100000,1314.006722 266.950000,1316.286427 268.800000,1318.541020 270.650000,1320.767023 272.500000,1322.961006 274.350000,1325.119584 276.200000,1327.239430 278.050000,1329.317274 279.900000,1331.349914 281.750000,1333.334214 283.600000,1335.267115 285.450000,1337.145637 287.300000,1338.966883 289.150000,1340.728045 291.000000,1342.426407 292.850000,1344.059351 294.700000,1345.624358 296.550000,1347.119016 298.400000,1348.541020 300.250000,1349.888177 302.100000,1351.158410 303.950000,1352.349760 305.800000,1353.460391 307.650000,1354.488590 309.500000,1355.432772 311.350000,1356.291480 313.200000,1357.063391 315.050000,1357.747314 316.900000,1358.342195 318.750000,1358.847117 320.600000,1359.261300 322.450000,1359.584107 324.300000,1359.815040 326.150000,1359.953742 328.000000,1360.000000 329.850000,1359.953742 331.700000,1359.815040 333.550000,1359.584107 335.400000,1359.261300 337.250000,1358.847117 339.100000,1358.342195 340.950000,1357.747314 342.800000,1357.063391 344.650000,1356.291480 346.500000,1355.432772 348.350000,1354.488590 350.200000,1353.460391 352.050000,1352.349760 353.900000,1351.158410 355.750000,1349.888177 357.600000,1348.541020 359.450000,1347.119016 361.300000,1345.624358 363.150000,1344.059351 365.000000,1342.426407 366.850000,1340.728045 368.700000,1338.966883 370.550000,1337.145637 372.400000,1335.267115 374.250000,1333.334214 376.100000,1331.349914 377.950000,1329.317274 379.800000,1327.239430 381.650000,1325.119584 383.500000,1322.961006 385.350000,1320.767023 387.200000,1318.541020 389.050000,1316.286427 390.900000,1314.006722 392.750000,1311.705419 394.600000,1309.386068 396.450000,1307.052244 398.300000,1304.707546 400.150000,1302.355589 402.000000,1300.000000 403.850000,1297.644411 405.700000,1295.292454 407.550000,1292.947756 409.400000,1290.613932 411.250000,1288.294581 413.100000,1285.993278 414.950000,1283.713573 416.800000,1281.458980 418.650000,1279.232977 420.500000,1277.038994 422.350000,1274.880416 424.200000,1272.760570 426.050000,1270.682726 427.900000,1268.650086 429.750000,1266.665786 431.600000,1264.732885 433.450000,1262.854363 435.300000,1261.033117 437.150000,1259.271955 439.000000,1257.573593 440.850000,1255.940649 442.700000,1254.375642 444.550000,1252.880984 446.400000,1251.458980 448.250000,1250.111823 450.100000,1248.841590 451.950000,1247.650240 453.800000,1246.539609 455.650000,1245.511410 457.500000,1244.567228 459.350000,1243.708520 461.200000,1242.936609 463.050000,1242.252686 464.900000,1241.657805 466.750000,1241.152883 468.600000,1240.738700 470.450000,1240.415893 472.300000,1240.184960 474.150000,1240.046258 476.000000,1240.000000'), ('stroke', '#26728d'), ('stroke-width', '4')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M180 1240V1430M476 1240V1430'), ('fill', 'none'), ('stroke', '#304d63'), ('stroke-dasharray', '7 7'), ('stroke-width', '2')), ''), ('{http://www.w3.org/2000/svg}path', (('d', 'M180 1430V1450H476V1430'), ('fill', 'none'), ('stroke', '#986c35'), ('stroke-width', '3')), ''), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '240'), ('y', '1490')), 'λ = 1,48 m'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '533'), ('y', '1390')), 'x'), ('{http://www.w3.org/2000/svg}text', (('font-size', '23'), ('x', '32'), ('y', '1540')), 'v = 1480 m/s; f = 1000 Hz.'))
REQUIRED_DOMAIN_FRAGMENTS={'C5-Q041': [], 'C5-Q042': ['I₀ è positivo'], 'C5-Q043': ['intensità positiva'], 'C5-Q044': [], 'C5-Q045': [], 'C5-Q046': ['subsonica', 'velocità radiali non nulle'], 'C5-Q047': ['positiva minore'], 'C5-Q048': ['interfaccia fissa e lineare'], 'C5-Q049': [], 'C5-Q050': ['positiva I', 'media nulla']}
CONCEPTS={42: 'L’intensità positiva I₀', 44: 'No: la sensibilità dell’udito dipende anche dalla frequenza', 46: 'Prima superiore, poi inferiore a quella emessa', 47: 'Incontra più fronti nell’unità di tempo', 49: 'Decibel'}
KNOWN_OPTIONS={}

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
        if (provenance.get('sourcePath')!=SOURCE_PATH or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=source_id or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=source['version'] or type(provenance.get('sourceVersion')) is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved' or provenance.get('sourceProvenance')!=source.get('provenance') or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c5_l05_authoring' or b.get('provenanceSha256')!=digest(provenance) or provenance.get('humanApproval')!='NOT_RUN' or provenance.get('status')!='DRAFT' or provenance.get('independentReview')!='NOT_RUN'):
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
