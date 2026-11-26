"""Independent source-first nuclear laws; no candidate authoring imports.
All 80 source-prompt derivations and five numerical models frozen before candidate reading.
Complete final text, distractors, physical hypotheses and full native SVG read separately.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc'
CANDIDATE_REF='5a55fce680ea1b430045fd56a3f27a313924f250'
PRIMARY_SHA256='51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L08', 'actualLessonPrerequisites': {'C5-L08': []}, 'title': 'Una popolazione di nuclei che cambia nel tempo'}
FAMILY='radioactive-decayed-count'
BATCH='radioactive-decayed-count-252'
ASSET_NAME='radioactive-decayed-count-progressive.svg'
REVIEWED_PACKAGE_SHA256='8898126192678877582ebdd5d44720920d6ece85d049dd19a5c204d4293f2514'
REVIEWED_BINDINGS_SHA256='11c67558c42d85b12b481635057bf1af7808e3857c93e79a7e568ea3a0b1c504'
SOURCE_REFERENCE='Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.'
FALSE_PROOF='Il cumulativo dei genitori trasformati diminuisce con il tempo come il numero residuo.'
SVG_MUTATION=(b'width="160"', b'width="161"')
SVG_LABEL_MUTATION=(b'Ogni barra intera vale 64 milioni di genitori.', b'Ogni barra intera vale 65 milioni di genitori.')
EXPECTED_MAPPING={1: ('C5-L08', ['C1-L001', 'C5-L08']), 2: ('C5-L08', ['C1-L001', 'C5-L08']), 3: ('C5-L08', ['C1-L001', 'C5-L08']), 4: ('C5-L08', ['C1-L001', 'C5-L08']), 5: ('C5-L08', ['C1-L001', 'C5-L08']), 6: ('C5-L08', ['C1-L001', 'C5-L08']), 7: ('C5-L08', ['C1-L001', 'C5-L08']), 8: ('C5-L08', ['C1-L001', 'C5-L08']), 9: ('C5-L08', ['C1-L001', 'C5-L08']), 10: ('C5-L08', ['C1-L001', 'C5-L08']), 11: ('C5-L08', ['C1-L001', 'C5-L08']), 12: ('C5-L08', ['C1-L001', 'C5-L08']), 13: ('C5-L08', ['C1-L001', 'C5-L08']), 14: ('C5-L08', ['C1-L001', 'C5-L08']), 15: ('C5-L08', ['C1-L001', 'C5-L08']), 16: ('C5-L08', ['C1-L001', 'C5-L08'])}
NUMERIC_UNITS={1: '10⁶ nuclei', 5: '10⁶ nuclei', 6: 'h', 14: '10⁶ nuclei', 15: '10⁶ nuclei', 16: 'h'}
OPTION_SUFFIX={7: '', 8: ' milioni di nuclei', 11: '', 12: ' milioni di nuclei', 13: ''}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'dimensionless', 6: 'hour', 7: 'dimensionless', 8: 'dimensionless', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'hour'}
MANUAL=['Conservo i genitori originari: N_dec=N₀−N=N₀(1−2^(−t/T½)). Dopo 1 h resta metà di 64, quindi sono decaduti 32 milioni; non aggiungo le trasformazioni dei figli.', 'È un conteggio cumulativo di genitori trasformati, quindi numero puro etichettato nuclei, eventualmente 10⁶ nuclei. Bq è invece un tasso e non il cumulativo.', 'La popolazione residua èN₀ 2^(−t/T½). La sottraggo dalla popolazione iniziale: N_dec=N₀[1−2^(−t/T½)]. Per t>0 è strettamente fra 0 eN₀ e cresce versoN₀ senza superarlo. Riletto finale 5 a 55 fce 6: il prompt non fornisce più la stessa legge richiesta nella scelta; soluzione e chiave identiche. Nel finale il prompt non anticipa più la formula che lo studente deve riconoscere.', 'A 1 h il fattore trasformato è 1/2. Dimezzare N₀ dimezza N_dec da 32 a 16 milioni: la dipendenza dalla popolazione iniziale è lineare.', 'Divido il cumulativo per la frazione trasformata: N₀=32/(1−1/2)=64 milioni. Il denominatore non è la frazione residua per tempi generali, benché coincida qui a un’emivita.', '32/64=1/2 è la frazione già trasformata, perciò la frazione residua è ancora 1/2. Quindi t=1 h. In generale t=−T½ log₂(1−N_dec/N₀), con 0<N_dec<N₀.', 'A 1 h N_dec=32; a 2 h 64(1−1/4)=48 milioni. Il rapporto è 48/32=3/2, distinto dal rapporto dei residui 1/2.', 'Il proposto 64 meno il corretto 32 vale+32 milioni. A un tempo finito nel modello esponenziale non sono ancora trasformati tutti i genitori in media.', 'Isolo N₀=N_dec/[1−2^(−t/T½)]. Con t>0 il denominatore èpositivo e minore di 1. Scrivere t nell’esponente richiede che sia il suo valore numerico in unità T½.', 'Il rapporto èκ₁[1−2^(−κ₂t/T½)]/[1−2^(−t/T½)]. Non è il rapporto delle frazioni residue: occorre preservare entrambi i termini 1−esponenziale.', 'A ha 32 milioni trasformati; B ne ha 32·3/4=24. Il rapporto è 24/32=3/4, dato il dimezzamento di N₀ e l’aumento del tempo.', 'La media è(32+24)/2=28 milioni. Le medie degli ingressi 48 milioni e 3/2 h darebbero 48−12√2 milioni, non 28; si mediano le letture già calcolate. Riletto anche il solo distrattore con parentesi(48−12√2) nel finale 5 a 55 fce 6, chiave e formule identiche.', 'Il target è(3/4)·32=24 milioni. Con N₀, B 32 la frazione trasformata deve essere 3/4, dunque residua 1/4 e t_B=2 h. Il rapporto dei tempi è 2.', 'Il guadagno è 96/32=3. La nuova lettura 72 dàN_dec 24 milioni. A 2 h la frazione trasformata è 3/4, dunque N₀=24·4/3=32 milioni.', 'Riferimenti fisici 32 e 24 milioni: a=(65−49)/(32−24)=2 e b=1. La lettura 33 dà 16 milioni trasformati; con 1 h N₀=32 milioni.', 'Fra i due istanti si trasformano 14−12=2 milioni. In una emivita questi sono metà dei genitori ancora presenti al primo istante, che sono quindi 4 milioni. N₀=12+4=16; la frazione residua 4/16=1/4 impone t=2 h. Controllo all’ora 3: 16−2=14 milioni.']
DISTRACTORS=['64 conta anche i sopravvissuti, 16 non è il cumulativo a un’ora e zero ignora le trasformazioni. Residuo e cumulativo coincidono soltanto al dato di un’emivita.', 'Bq e nuclei/s sono tassi; s è tempo e J energia. Il cumulativo conta eventi senza dividerli per una durata.', 'Il solo esponenziale è il residuo. Il segno più e la divisione superano l’inizio; la legge lineare nel tempo non satura al conteggio iniziale.', '64 inverte il fattore del campione iniziale; 8 aggiunge una perdita e 32 ignora il nuovo inizio. Zero non è il valore medio con dati positivi.', '16 ripete il fattore trasformato, 32 presume tutto trasformato e 128 produrrebbe 64. Al tempo zero l’inversa divide per zero ed è esclusa.', 'Due ore danno 48 milioni, tempo zero ne dà zero, mezz’ora dà 64−32√2. Il logaritmo richiede il complemento fra zero e uno.', '2/3 inverte B/A; 1/2 confronta i residui; due assume una crescita lineare temporale e uno ignora l’intervallo ulteriore.', '−32 inverte la sottrazione; due è rapporto, 64 la proposta e zero una sua accettazione. Lo scarto è fra due cumulativi nella stessa scala.', 'Moltiplicare per il complemento riduce ancora il conteggio. N_dec 2^u inverte il residuo e coincide solo a u=1; reciproci e durata lineare non ricostruiscono l’inizio.', 'I soli fattori κ non conservano il complemento. κ₁q^(κ₂−1) è il rapporto dei residui; il reciproco scambia A e B.', 'Un mezzo segue solo l’inizio; 3/2 solo la frazione trasformata; 4/3 è il reciproco e uno presume una compensazione inesatta.', '56 somma, quattro prende la semidifferenza e 24 ripete B. 48−12√2 è il modello agli ingressi medi; 400 e 288 distinguono esattamente i quadrati rilevanti.', 'Un’ora darebbe 16 milioni. Un mezzo inverte le durate; 3/4 copia il target delle uscite e 3/2 il rapporto delle frazioni trasformate.', '96 milioni segue sia dal display non decodificato sia dall’uso del residuo 1/4 e predice D=216. Ventiquattro non ricostruisce ancora l’inizio.', '33 milioni omette b e predice D=34; 64 omette g dopo b; 16 è il cumulativo, non la popolazione iniziale.', 'Un’ora dal campione ricostruito darebbe 8 milioni; quattro ore ne darebbero 15. Il rapporto 14/12 non è una frazione di sopravvivenza.']
ASSUMPTIONS=['Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Unico genitore chiuso con emivita 1 h, nessuna produzione, soli genitori originari e nessun contributo dei figli. Cumulativo medio strettamente fra zero e inizio a tempo positivo finito. Il caso 16 ricostruisce anche N₀; non si interpreta il cumulativo come attività.', 'Caso autonomo: emivita 1 h assegnata, N₀ ignoto e due cumulativi medi 12/14 milioni a distanza 1 h. Niente contributi dei figli. n₀ e u=t/(1 h) ora definiti prima dell’uso nel finale 5 a 55 fce 6.']
PEDAGOGY=['Legge motivata e valore medio distinto da singolo esito.', 'Unità ricostruita e conteggio distinto dal tasso.', 'Caso autonomo o legge riconosciuta senza risposta già anticipata.', 'Confronto controllato a un parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con denominatori e domini verificati.', 'Due uscite calcolate prima del rapporto.', 'Differenza ordinata distinta dal rapporto puro.', 'Inversa simbolica e dimensioni esplicite.', 'Fattori nella legge effettiva, non in un’analogia impropria.', 'Entrambi i nuovi ingressi considerati.', 'Media delle uscite e ammissibilità degli ingressi medi distinte.', 'Bersaglio ricostruito prima dell’inversa.', 'Guadagno rimosso prima del bilancio fisico.', 'Due riferimenti distinti identificano guadagno e offset.', 'Vincolo o caso autonomo risolto prima di decidere unicità e dominio.']
EXPECTED_IDS={'AR-u7-radioactive-decayed-count-07', 'AR-u7-radioactive-decayed-count-04', 'AR-u7-radioactive-decayed-count-01', 'AR-u7-radioactive-decayed-count-09', 'AR-u7-radioactive-decayed-count-16', 'AR-u7-radioactive-decayed-count-03', 'AR-u7-radioactive-decayed-count-02', 'AR-u7-radioactive-decayed-count-05', 'AR-u7-radioactive-decayed-count-06', 'AR-u7-radioactive-decayed-count-13', 'AR-u7-radioactive-decayed-count-15', 'AR-u7-radioactive-decayed-count-12', 'AR-u7-radioactive-decayed-count-10', 'AR-u7-radioactive-decayed-count-08', 'AR-u7-radioactive-decayed-count-14', 'AR-u7-radioactive-decayed-count-11'}
REVIEWED_CANDIDATES={'AR-u7-radioactive-decayed-count-01': 'ec0dfede164b0fed2f940b80b5e9eddfe1c1da8dec4cb6fe0f1dd4eec2daebc1', 'AR-u7-radioactive-decayed-count-02': 'e2faabaebfeb9eed2d759b038435ae3542f51c4eb2e2a91411d2267ffbd67d75', 'AR-u7-radioactive-decayed-count-03': '95f17cf147229e51becfa0410a4f26579b1d5d60fd87d63b9e173e9c95b5112d', 'AR-u7-radioactive-decayed-count-04': '92693c2279b91c16ff2c86912b4520e0724f9cf5a9232ec3960368b196aba802', 'AR-u7-radioactive-decayed-count-05': 'ee6b352fb3f07c9fa171c5076435912f79a4321dacf6b834cf66c08dd0a666e4', 'AR-u7-radioactive-decayed-count-06': '6d2da4698302da76b85975aee2644cb4a0d36b7f0695594bff57a951eebf4d00', 'AR-u7-radioactive-decayed-count-07': 'd60d235537077dbdabe29b659a082384a324fcf49e3e602005edc21039761dbd', 'AR-u7-radioactive-decayed-count-08': 'd41cc3aeaa427c09df4d0cd72d7102b8f8e73954ddf9b28d46cd480595e0b434', 'AR-u7-radioactive-decayed-count-09': '933a33d0d9a0514686c18e3e0d6bf03c887e3b3f5165870f7ac09a0d508f581b', 'AR-u7-radioactive-decayed-count-10': 'b96f0223e518d8954cec3b9ca7ab154b2fce38dc85f7cdb0989e8af6d5a5df1f', 'AR-u7-radioactive-decayed-count-11': 'afa54bf77af3e4e310f5aa4df0bfd8207246074899b1e9f474132683c812bc61', 'AR-u7-radioactive-decayed-count-12': '2c5409026d931fce3ee87fc3c7d6add7e833d9e86fe5e2efd2e472d8fa2c7ef7', 'AR-u7-radioactive-decayed-count-13': '65d79cb7b0410a66f4fcc18d267f1e25fc1ac68e81fdb2d6722481eb02c90381', 'AR-u7-radioactive-decayed-count-14': '79b4fa66d247058d4e96a7afab6d9644103cc0ebc6256f9fa1f23c8defb7d0e8', 'AR-u7-radioactive-decayed-count-15': '0d9018f5ffa300db84314a0a7769e175905bcf48f7217b363c23ff454f9f2ea8', 'AR-u7-radioactive-decayed-count-16': '5e15255a20fb522fedfaf6316c9365bb9dfa0edcb39715215f84a0d114ba4168'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1600, 1)), (Fraction(310, 1), Fraction(200, 1), Fraction(160, 1), Fraction(30, 1)), (Fraction(230, 1), Fraction(320, 1), Fraction(240, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(200, 1), Fraction(160, 1), Fraction(30, 1)), (Fraction(230, 1), Fraction(1230, 1), Fraction(240, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1350, 1), Fraction(40, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(320, 1), Fraction(80, 1), Fraction(30, 1)), (Fraction(190, 1), Fraction(1350, 1), Fraction(280, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1230, 1), Fraction(80, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z', 'M150.0000 1000.0000 L152.7500 994.5026 L155.5000 989.0996 L158.2500 983.7895 L161.0000 978.5706 L163.7500 973.4413 L166.5000 968.4001 L169.2500 963.4456 L172.0000 958.5762 L174.7500 953.7904 L177.5000 949.0869 L180.2500 944.4641 L183.0000 939.9208 L185.7500 935.4555 L188.5000 931.0669 L191.2500 926.7537 L194.0000 922.5147 L196.7500 918.3484 L199.5000 914.2537 L202.2500 910.2294 L205.0000 906.2742 L207.7500 902.3869 L210.5000 898.5664 L213.2500 894.8116 L216.0000 891.1213 L218.7500 887.4943 L221.5000 883.9297 L224.2500 880.4263 L227.0000 876.9831 L229.7500 873.5991 L232.5000 870.2731 L235.2500 867.0044 L238.0000 863.7917 L240.7500 860.6343 L243.5000 857.5311 L246.2500 854.4812 L249.0000 851.4838 L251.7500 848.5378 L254.5000 845.6424 L257.2500 842.7968 L260.0000 840.0000 L262.7500 837.2513 L265.5000 834.5498 L268.2500 831.8947 L271.0000 829.2853 L273.7500 826.7206 L276.5000 824.2001 L279.2500 821.7228 L282.0000 819.2881 L284.7500 816.8952 L287.5000 814.5434 L290.2500 812.2321 L293.0000 809.9604 L295.7500 807.7277 L298.5000 805.5335 L301.2500 803.3769 L304.0000 801.2573 L306.7500 799.1742 L309.5000 797.1269 L312.2500 795.1147 L315.0000 793.1371 L317.7500 791.1935 L320.5000 789.2832 L323.2500 787.4058 L326.0000 785.5606 L328.7500 783.7472 L331.5000 781.9649 L334.2500 780.2132 L337.0000 778.4916 L339.7500 776.7995 L342.5000 775.1366 L345.2500 773.5022 L348.0000 771.8959 L350.7500 770.3172 L353.5000 768.7656 L356.2500 767.2406 L359.0000 765.7419 L361.7500 764.2689 L364.5000 762.8212 L367.2500 761.3984 L370.0000 760.0000 L372.7500 758.6256 L375.5000 757.2749 L378.2500 755.9474 L381.0000 754.6426 L383.7500 753.3603 L386.5000 752.1000 L389.2500 750.8614 L392.0000 749.6440 L394.7500 748.4476 L397.5000 747.2717 L400.2500 746.1160 L403.0000 744.9802 L405.7500 743.8639 L408.5000 742.7667 L411.2500 741.6884 L414.0000 740.6287 L416.7500 739.5871 L419.5000 738.5634 L422.2500 737.5573 L425.0000 736.5685 L427.7500 735.5967 L430.5000 734.6416 L433.2500 733.7029 L436.0000 732.7803 L438.7500 731.8736 L441.5000 730.9824 L444.2500 730.1066 L447.0000 729.2458 L449.7500 728.3998 L452.5000 727.5683 L455.2500 726.7511 L458.0000 725.9479 L460.7500 725.1586 L463.5000 724.3828 L466.2500 723.6203 L469.0000 722.8709 L471.7500 722.1344 L474.5000 721.4106 L477.2500 720.6992 L480.0000 720.0000'}
REQUIRED_CIRCLES={(Fraction(150, 1), Fraction(1000, 1), Fraction(4, 1)), (Fraction(370, 1), Fraction(760, 1), Fraction(5, 1)), (Fraction(480, 1), Fraction(720, 1), Fraction(5, 1)), (Fraction(260, 1), Fraction(840, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(260, 1), Fraction(994, 1), Fraction(260, 1), Fraction(1006, 1)), (Fraction(145, 1), Fraction(1000, 1), Fraction(550, 1), Fraction(1000, 1)), (Fraction(144, 1), Fraction(840, 1), Fraction(156, 1), Fraction(840, 1)), (Fraction(480, 1), Fraction(994, 1), Fraction(480, 1), Fraction(1006, 1)), (Fraction(150, 1), Fraction(1005, 1), Fraction(150, 1), Fraction(630, 1)), (Fraction(144, 1), Fraction(760, 1), Fraction(156, 1), Fraction(760, 1)), (Fraction(144, 1), Fraction(720, 1), Fraction(156, 1), Fraction(720, 1)), (Fraction(370, 1), Fraction(994, 1), Fraction(370, 1), Fraction(1006, 1))}
REQUIRED_SVG_TEXTS=('Genitori rimasti e già trasformati', '1 · Stessi 64 milioni, due complementi', 'Blu: residui · Ocra: genitori trasformati', '1 h', '32', '32', '2 h', '16', '48', 'Ogni barra intera vale 64 milioni di genitori.', '2 · Cumulativo con N₀ = 64 milioni', 'N_dec (milioni)', 't (h)', '1', '32', '2', '48', '3', '56', '0', '3 · Altro campione: cumulativi 12 e 14', 'Totale iniziale ricostruito: 16 milioni', 't', '4', '12', 't + 1 h', '2', '14', 'Le barre complete hanno origine e scala comuni.', 'L’ora aggiuntiva trasforma metà dei 4 milioni', 'ancora presenti al primo tempo.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1600 letti per intero. Primo pannello a scala5 per milione, segmenti160+160 e80+240, entrambi totali64. Curva origine(150,1000),110 coordinate/h e5 per milione: c=64(1−2^(−t/h)), punti32/48/56 a y840/760/720. Terzo pannello a scala20 per milione: residui4/2 e cumulativi12/14, somme320 uguali per16. Nessuna sovrapposizione residua.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
import sympy as sp

def _finite_exact(value):
    if isinstance(value,(float,bool)):
        raise ValueError('exact finite real input required')
    try:
        value=sp.sympify(value,strict=True)
    except (TypeError,ValueError,sp.SympifyError) as error:
        raise ValueError('invalid exact input') from error
    if value.atoms(sp.Float) or value.free_symbols or value.is_number is not True or value.is_real is not True or value.is_finite is not True:
        raise ValueError('exact finite real input required')
    return value

def _positive(value):
    value=_finite_exact(value)
    if value.is_positive is not True:
        raise ValueError('positive input required')
    return value

def _integer(value):
    value=_positive(value)
    if value.is_integer is not True:
        raise ValueError('positive integer count required')
    return value

def calibrate(y1,s1,y2,s2,snew):
    y1,y2=map(_positive,(y1,y2))
    s1,s2,snew=map(_finite_exact,(s1,s2,snew))
    if sp.simplify(y2-y1)==0:
        raise ValueError('two distinct physical references required')
    gain=_positive(sp.simplify((s2-s1)/(y2-y1)))
    offset=_finite_exact(sp.simplify(s1-gain*y1))
    output=_positive(sp.simplify((snew-offset)/gain))
    return gain,offset,output

def solve(n0,t,half=1):
    n0,t,half=map(_positive,(n0,t,half))
    return sp.simplify(n0*(1-sp.Pow(2,-t/half)))

def inverse_first(output,t,half=1):
    output,t,half=map(_positive,(output,t,half))
    return sp.simplify(output/(1-sp.Pow(2,-t/half)))

def inverse_second(output,n0,half=1):
    output,n0,half=map(_positive,(output,n0,half))
    if sp.simplify(n0-output).is_positive is not True:
        raise ValueError('cumulative parent count strictly below initial count')
    return _positive(sp.simplify(-half*sp.log(1-output/n0)/sp.log(2)))

def infer_time(c1,c2,interval=1,half=1):
    c1,c2,interval,half=map(_positive,(c1,c2,interval,half))
    increment=_positive(sp.simplify(c2-c1))
    remaining=_positive(sp.simplify(increment/(1-sp.Pow(2,-interval/half))))
    n0=_positive(sp.simplify(c1+remaining))
    return inverse_second(c1,n0,half),n0
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    units={' milioni di nuclei':('nuclear_count',sp.Integer(10**6)),
      ' nuclei':('nuclear_count',sp.Integer(1)),
      ' Bq':('rate',sp.Integer(1)),' s⁻¹':('rate',sp.Integer(1)),
      ' nuclei/s':('rate',sp.Integer(1)),
      ' h':('time',sp.Integer(3600)),' s':('time',sp.Integer(1)),
      '':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

@lru_cache(maxsize=1)
def oracle():
    n0,t,rate=sp.symbols('n0 t rate',positive=True)
    transformed=n0*(1-sp.exp(-rate*t))
    assert sp.simplify(sp.diff(transformed,t)-rate*n0*sp.exp(-rate*t))==0
    assert SI.Quantity(1,'hour').to('minute').magnitude==60
    first=solve(64,1);second=solve(32,2);assert(first,second)==(32,24)
    fit=calibrate(first,65,second,49,33);assert fit==(2,1,16)
    elapsed,origin=infer_time(12,14);assert(elapsed,origin)==(2,16)
    expected=[first,'nuclei, conteggio adimensionale','c = n₀ (1 − 2^(−u))','Da 32 a 16 milioni di nuclei',inverse_first(first,1),inverse_second(first,64),solve(64,2)/first,64-first,'N₀ = N_dec / (1 − 2^(−u))','κ₁ (1 − q^κ₂) / (1 − q)',second/first,(first+second)/2,inverse_second(sp.Rational(3,4)*first,32),inverse_first(sp.Rational(72,3),2),inverse_first(fit[2],1),elapsed]
    for k,v in {1:32,5:64,6:1,7:sp.Rational(3,2),8:32,11:sp.Rational(3,4),12:28,13:2,14:32,15:32,16:2}.items():assert sp.simplify(expected[k-1]-v)==0
    assert sp.simplify(solve(48,sp.Rational(3,2))-(48-12*sp.sqrt(2)))==0
    return expected
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
    if tuple(e.text or '' for e in root.iter() if e.tag.endswith('text'))!=REQUIRED_SVG_TEXTS:
        raise ValueError('Independent physical scale or reviewed SVG quantity labels changed')
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
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u7-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C5" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_parent_decay_derivative_cumulative_complement_activity_weighted_mixture_integer_nuclear_bookkeeping_and_calibration",
            "Pint_exact_time_half_life_hour_second_Bq_inverse_time_count_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u7-nuclear-250-254-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"aca104f3"},"postReadNumericGuardHardening":"Only sympify strict=True added after candidate reading to reject strings without evaluation; all constitutive/inverse/calibration function AST bodies remain identical to pre-key snapshot. Snapshot preserved unchanged.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/u7-nuclei-250-254-primary-source-only-20261126.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U7-02","U2-01")
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
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed['records']) if r['answer']['type']=='numeric')
    row=changed['records'][idx];row['answer']['value']=float(row['answer']['value'])
    links[idx]['candidateSha256']=digest(row);bad=retoken(changed,links,row['id'])
    if bad['ok'] or 'Independent numeric answer must preserve an exact integer JSON value' not in bad['errors']:
        raise AssertionError('Binary float numeric key accepted after all edition guards replaced')
    cases.append({'case':'numeric_JSON_binary_float_rebound_and_retokenized','id':bad['id'],'rejectedBy':bad['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    uploaded=next(a for a in changed['assets'] if a['name']==ASSET_NAME)
    raw=base64.b64decode(uploaded['data']);before,after=SVG_LABEL_MUTATION;assert before in raw;raw=raw.replace(before,after,1)
    previous=uploaded['id'];uploaded.update(id=sha(raw),data=base64.b64encode(raw).decode())
    for row,b in zip(changed['records'],links):
        for block in row['blocks']:
            if block.get('src')=='/asset/'+previous:block['src']='/asset/'+uploaded['id']
        if ASSET_NAME in b.get('assetChecksums',{}):b['assetChecksums'][ASSET_NAME]=uploaded['id']
        b['candidateSha256']=digest(row)
    with tempfile.TemporaryDirectory(prefix='independent-nuclear-label-mutation-') as directory:
        home=Path(directory)
        for a in changed['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
        tokens={r['id']:s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as error:
                if 'reviewed SVG quantity labels' not in str(error):raise
                cases.append({'case':'wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced','rejectedBy':str(error)})
            else:raise AssertionError('Wrong quantitative label accepted after hostile rebinding')
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
