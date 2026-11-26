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
FAMILY='radioactive-survivors'
BATCH='radioactive-survivors-250'
ASSET_NAME='radioactive-survivors-progressive.svg'
REVIEWED_PACKAGE_SHA256='04a1fcb02bc28d7bd3d7ab89515b4801eeaf4d124cd6144642c84be846b76da6'
REVIEWED_BINDINGS_SHA256='2fb8a0a76ad976d8e060c6b4ae3a6f19420e57e006bce4cad184acebc17e2a1d'
SOURCE_REFERENCE='Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.'
FALSE_PROOF='A popolazione iniziale fissata, due emivite lasciano lo stesso numero medio di genitori di una emivita.'
SVG_MUTATION=(b'width="320"', b'width="321"')
SVG_LABEL_MUTATION=(b'64 milioni', b'65 milioni')
EXPECTED_MAPPING={1: ('C5-L08', ['C1-L001', 'C5-L08']), 2: ('C5-L08', ['C1-L001', 'C5-L08']), 3: ('C5-L08', ['C1-L001', 'C5-L08']), 4: ('C5-L08', ['C1-L001', 'C5-L08']), 5: ('C5-L08', ['C1-L001', 'C5-L08']), 6: ('C5-L08', ['C1-L001', 'C5-L08']), 7: ('C5-L08', ['C1-L001', 'C5-L08']), 8: ('C5-L08', ['C1-L001', 'C5-L08']), 9: ('C5-L08', ['C1-L001', 'C5-L08']), 10: ('C5-L08', ['C1-L001', 'C5-L08']), 11: ('C5-L08', ['C1-L001', 'C5-L08']), 12: ('C5-L08', ['C1-L001', 'C5-L08']), 13: ('C5-L08', ['C1-L001', 'C5-L08']), 14: ('C5-L08', ['C1-L001', 'C5-L08']), 15: ('C5-L08', ['C1-L001', 'C5-L08']), 16: ('C5-L08', ['C1-L001', 'C5-L08'])}
NUMERIC_UNITS={1: '10⁶ nuclei', 5: '10⁶ nuclei', 6: 'h', 14: '10⁶ nuclei', 15: '10⁶ nuclei', 16: '10⁶ nuclei'}
OPTION_SUFFIX={7: '', 8: ' milioni di nuclei', 11: '', 12: ' milioni di nuclei', 13: ''}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'dimensionless', 6: 'hour', 7: 'dimensionless', 8: 'dimensionless', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'dimensionless'}
MANUAL=['Per un solo genitore senza apporto, ciascuna emivita dimezza il valore medio. Pongo x=t/(1 h): N=N₀ 2^(−x). Con x=1, 64/2=32 milioni. Il valore medio non è la garanzia che ogni singolo campione dia esattamente quel conteggio.', 'N è un conteggio di nuclei: dimensionalmente è un numero puro, con etichetta nuclei o multipli come 10⁶ nuclei. Bq invece misura trasformazioni per secondo e non una popolazione.', 'Dopo due ore il numero medio di nuclei genitori non decaduti è metà del valore iniziale. Non significa che tutti decadano dopo due ore, né che un singolo nucleo abbia una scadenza deterministica.', 'A tempo identico il fattore esponenziale è identico. Portare N₀ da 64 a 32 milioni moltiplica N per 1/2: da 32 a 16 milioni.', 'Da N=N₀/2 con t=1 h moltiplico entrambi i membri per 2: N₀=2 N=64 milioni. Popolazione iniziale maggiore del residuo, come richiesto da t>0.', '32/64=1/2=2^(−x), dunque x=1 e t=1 h. Più in generale t=T½ log₂(N₀/N), positivo soltanto per 0<N<N₀.', 'A pari N₀ il rapporto è 2^(−2)/2^(−1)=1/2. Le letture sono 16 e 32 milioni: il tempo raddoppiato non dimezza sempre N per una legge inversa, qui aggiunge una sola emivita.', 'Il proposto 64 meno il corretto 32 vale+32 milioni. Il segno positivo indica una sovrastima; non si prende il valore assoluto senza richiesta.', 'Moltiplico N=N₀ 2^(−t/T½) per 2^(t/T½): N₀=N 2^(t/T½). L’esponente è adimensionale; con t numerico in ore e T½=1 h si abbrevia N 2^t.', 'Il quoziente completo è κ₁ 2^(−(κ₂−1)t/T½). Non diventa κ₁/κ₂: il tempo entra in un esponente. Entrambe le preparazioni devono conservare t>0 e popolazione positiva.', 'A dà 32 milioni; B dà 32/4=8 milioni. Quindi N_B/N_A=8/32=1/4: si compongono dimezzamento della popolazione e un’ulteriore emivita.', 'Le uscite indipendenti sono 32 e 8 milioni; media 20. Agli ingressi medi 48 milioni e 3/2 h si ottiene 12√2, diverso da 20. La legge è lineare in N₀ ma esponenziale nel tempo: la parola bilineare nella primaria congelata era impropria, qui corretta senza cambiare alcun conto o modificare la primaria.', 'Il target è 32/4=8 milioni. Con N₀, B=32 occorre 2^(−x_B)=1/4, dunque t_B=2 h e t_B/t_A=2.', 'Il riferimento fisico è 32 milioni: il guadagno è 96/32=3 unità strumentali per milione. La nuova lettura 24 corrisponde a 8 milioni residui; a 2 h N₀=4·8=32 milioni.', 'Le uscite fisiche dei riferimenti sono 32 e 8 milioni. Sottraggo: a=(65−17)/(32−8)=2, poi b=65−2·32=1. La prova 33 dàN=(33−1)/2=16 milioni e a 1 h N₀=32 milioni.', 'Fra 1 e 3 h il rapporto residuo è 12/48=1/4: due ore sono due emivite, dunque T½=1 h. Retrocedendo dall’ora 1 all’origine moltiplico 48 per 2: N₀=96 milioni. È una ricostruzione di medie esponenziali, non una misura certa di singole vite. Riletto 5 a 55 fce 6: sola definizione n₀ nel primo testo; altre 15, chiavi, formule eSVG identici.']
DISTRACTORS=['64 omette il dimezzamento; 128 richiederebbe apporti; 16 appartiene a due emivite. Il valore atteso non è un conteggio deterministico.', 'Bq e nuclei/s sono tassi, s tempo e J energia. Nuclei o milioni di nuclei etichettano un conteggio adimensionale.', 'Una scadenza uguale per ogni nucleo è falsa; dopo quattro ore resta un quarto in media. Attività e popolazione si dimezzano senza nuova produzione.', '64 inverte la dipendenza dall’inizio; 8 aggiunge una perdita; 32 ignora il nuovo ingresso. Il modello non dà zero a tempo finito.', '16 ripete il dimezzamento anziché invertirlo; 32 come inizio richiederebbe tempo nullo; 128 darebbe 64 milioni dopo un’ora.', 'Due ore danno 16 milioni; mezz’ora dà 32√2 milioni. Un tempo positivo richiede un residuo strettamente fra zero e inizio.', 'Due inverte B/A; 1/4 confronta B con N₀; uno ignora l’ora aggiuntiva e zero confonde media esponenziale e scomparsa completa.', '−32 inverte la sottrazione; due è un rapporto; 64 ripete la proposta e zero non la confronta col modello.', 'Il segno negativo riapplica il decadimento. Il reciproco del conteggio e le espressioni lineari nel tempo non ricostruiscono N₀.', 'Prodotti e quozienti dei soli fattori non conservano l’esponenziale. κ₁ scala l’inizio e non l’emivita; la somma fallisce per prove identiche.', 'Un mezzo trascura una delle due modifiche; quattro inverte il rapporto; un ottavo usa N₀, A al denominatore. Le uscite sono 8 e 32.', '40 somma, 12 prende la semidifferenza e 8 ripete B. 12√2 è il modello agli ingressi medi, distinto dalla media 20.', 'Un’ora dà 16 milioni e quattro ore ne danno 2. Un mezzo inverte le durate; un quarto copia il fattore delle uscite.', '96 milioni da display non decodificato darebbe D=72. Otto è il residuo, non l’inizio; 128 darebbe D=96.', '33 milioni omette l’offset e predice D=34; 64 omette il guadagno dopo b; 16 si ferma al residuo.', '48 copia la prima misura; 192 darebbe 96 milioni all’ora uno. Il ramo q negativo non è una frazione di sopravvivenza.']
ASSUMPTIONS=['Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Caso autonomo: un solo genitore con emivita 2 h, senza nuova produzione. Metà residuo medio ogni 2 h; non una scadenza deterministica di ogni nucleo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Un solo radionuclide genitore chiuso, senza apporti. Numero medio residuo distinto da un singolo conteggio. Tempi positivi finiti normalizzati a 1 h, salvo caso 03 con 2 h e caso 16 a emivita ignota. Display continui e preparazioni distinte; non si scambia residuo e cumulativo.', 'Caso autonomo con emivita ignota costante e misure medie a 1 h e 3 h. q è la frazione oraria positiva minore di uno. n₀=N₀/(10⁶ nuclei) è definito nel finale 5a55fce6; non si importa l’emivita di un’ora dal prefisso degli altri quesiti.']
PEDAGOGY=['Legge motivata e valore medio distinto da singolo esito.', 'Unità ricostruita e conteggio distinto dal tasso.', 'Caso autonomo o legge riconosciuta senza risposta già anticipata.', 'Confronto controllato a un parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con denominatori e domini verificati.', 'Due uscite calcolate prima del rapporto.', 'Differenza ordinata distinta dal rapporto puro.', 'Inversa simbolica e dimensioni esplicite.', 'Fattori nella legge effettiva, non in un’analogia impropria.', 'Entrambi i nuovi ingressi considerati.', 'Media delle uscite e ammissibilità degli ingressi medi distinte.', 'Bersaglio ricostruito prima dell’inversa.', 'Guadagno rimosso prima del bilancio fisico.', 'Due riferimenti distinti identificano guadagno e offset.', 'Vincolo o caso autonomo risolto prima di decidere unicità e dominio.']
EXPECTED_IDS={'AR-u7-radioactive-survivors-08', 'AR-u7-radioactive-survivors-12', 'AR-u7-radioactive-survivors-16', 'AR-u7-radioactive-survivors-03', 'AR-u7-radioactive-survivors-07', 'AR-u7-radioactive-survivors-06', 'AR-u7-radioactive-survivors-13', 'AR-u7-radioactive-survivors-15', 'AR-u7-radioactive-survivors-09', 'AR-u7-radioactive-survivors-04', 'AR-u7-radioactive-survivors-05', 'AR-u7-radioactive-survivors-01', 'AR-u7-radioactive-survivors-11', 'AR-u7-radioactive-survivors-02', 'AR-u7-radioactive-survivors-14', 'AR-u7-radioactive-survivors-10'}
REVIEWED_CANDIDATES={'AR-u7-radioactive-survivors-01': '487d3e4db069f8e1ab3bfce73556fa5554ec22e7c33fd008d6814c170ac1230a', 'AR-u7-radioactive-survivors-02': '1f43b26ca09a6a589b71882fed2f7f8c5f2160c284671f13f056f2201c084625', 'AR-u7-radioactive-survivors-03': 'da38914dd03a70b887de5ee89cf88481140d5a54e0b50d4a8afbd86f02977b0c', 'AR-u7-radioactive-survivors-04': '3e5bbadb7c3682936ef4e1ec600f147d632e527bfdb5d0af640dcedbc7f5ea0a', 'AR-u7-radioactive-survivors-05': '3e5b9f3d6a357a579f8923bdc9a1302a546a37b197723b832c8abba098050b81', 'AR-u7-radioactive-survivors-06': 'dda5941e499df483cf99e1977bcb32a9d26d7962aa03a764b53f13143470e519', 'AR-u7-radioactive-survivors-07': 'f8fad40cc80fad6df52a4d4d4c6833fcc9f2dde7ccc1708db6a328c374ddd1c5', 'AR-u7-radioactive-survivors-08': '605175debe8d21c31f261ed9fe66dc2295f6876473aea97d921658a111149f58', 'AR-u7-radioactive-survivors-09': '8fdff3c1bbf38a08d2f955fd238f150bdfebc3f548ed422fd2a2ccc7e7cc7316', 'AR-u7-radioactive-survivors-10': 'a715ca617745edfcf475e5442f9e56acc4bd669b71c3529b43dde8158878b5fd', 'AR-u7-radioactive-survivors-11': '41d3e30b8d0252daf474531e1e8196f4c9da0bde20a0f1bcd0c5d5cf71c7a687', 'AR-u7-radioactive-survivors-12': 'bdd6f4d8bb2153b1fb631f11237956b10f0ef0cf5cd9edd3825558f608ecb5f7', 'AR-u7-radioactive-survivors-13': '9750f056a42f89dde2f6d38cd8523b8b9cbfc4b4b844e5994298acf8d015f408', 'AR-u7-radioactive-survivors-14': 'c89f4b5bc83dc55765dc2edd7c943f818065e9e0d9764dc925e0a39ca0bf6133', 'AR-u7-radioactive-survivors-15': 'db237e7b46dd94ecfd25ecdf2728746e18db399a5d7c1ec2c0439db861bba8ce', 'AR-u7-radioactive-survivors-16': '6c44658239d41fdb1e1914d0d73ebac03ee120876d45f535af7e32189d06a269'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1600, 1)), (Fraction(150, 1), Fraction(300, 1), Fraction(80, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(160, 1), Fraction(320, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1220, 1), Fraction(288, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(370, 1), Fraction(40, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1320, 1), Fraction(144, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1420, 1), Fraction(36, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(230, 1), Fraction(160, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z', 'M150.0000 680.0000 L152.7500 685.4974 L155.5000 690.9004 L158.2500 696.2105 L161.0000 701.4294 L163.7500 706.5587 L166.5000 711.5999 L169.2500 716.5544 L172.0000 721.4238 L174.7500 726.2096 L177.5000 730.9131 L180.2500 735.5359 L183.0000 740.0792 L185.7500 744.5445 L188.5000 748.9331 L191.2500 753.2463 L194.0000 757.4853 L196.7500 761.6516 L199.5000 765.7463 L202.2500 769.7706 L205.0000 773.7258 L207.7500 777.6131 L210.5000 781.4336 L213.2500 785.1884 L216.0000 788.8787 L218.7500 792.5057 L221.5000 796.0703 L224.2500 799.5737 L227.0000 803.0169 L229.7500 806.4009 L232.5000 809.7269 L235.2500 812.9956 L238.0000 816.2083 L240.7500 819.3657 L243.5000 822.4689 L246.2500 825.5188 L249.0000 828.5162 L251.7500 831.4622 L254.5000 834.3576 L257.2500 837.2032 L260.0000 840.0000 L262.7500 842.7487 L265.5000 845.4502 L268.2500 848.1053 L271.0000 850.7147 L273.7500 853.2794 L276.5000 855.7999 L279.2500 858.2772 L282.0000 860.7119 L284.7500 863.1048 L287.5000 865.4566 L290.2500 867.7679 L293.0000 870.0396 L295.7500 872.2723 L298.5000 874.4665 L301.2500 876.6231 L304.0000 878.7427 L306.7500 880.8258 L309.5000 882.8731 L312.2500 884.8853 L315.0000 886.8629 L317.7500 888.8065 L320.5000 890.7168 L323.2500 892.5942 L326.0000 894.4394 L328.7500 896.2528 L331.5000 898.0351 L334.2500 899.7868 L337.0000 901.5084 L339.7500 903.2005 L342.5000 904.8634 L345.2500 906.4978 L348.0000 908.1041 L350.7500 909.6828 L353.5000 911.2344 L356.2500 912.7594 L359.0000 914.2581 L361.7500 915.7311 L364.5000 917.1788 L367.2500 918.6016 L370.0000 920.0000 L372.7500 921.3744 L375.5000 922.7251 L378.2500 924.0526 L381.0000 925.3574 L383.7500 926.6397 L386.5000 927.9000 L389.2500 929.1386 L392.0000 930.3560 L394.7500 931.5524 L397.5000 932.7283 L400.2500 933.8840 L403.0000 935.0198 L405.7500 936.1361 L408.5000 937.2333 L411.2500 938.3116 L414.0000 939.3713 L416.7500 940.4129 L419.5000 941.4366 L422.2500 942.4427 L425.0000 943.4315 L427.7500 944.4033 L430.5000 945.3584 L433.2500 946.2971 L436.0000 947.2197 L438.7500 948.1264 L441.5000 949.0176 L444.2500 949.8934 L447.0000 950.7542 L449.7500 951.6002 L452.5000 952.4317 L455.2500 953.2489 L458.0000 954.0521 L460.7500 954.8414 L463.5000 955.6172 L466.2500 956.3797 L469.0000 957.1291 L471.7500 957.8656 L474.5000 958.5894 L477.2500 959.3008 L480.0000 960.0000'}
REQUIRED_CIRCLES={(Fraction(480, 1), Fraction(960, 1), Fraction(5, 1)), (Fraction(370, 1), Fraction(920, 1), Fraction(5, 1)), (Fraction(150, 1), Fraction(680, 1), Fraction(5, 1)), (Fraction(260, 1), Fraction(840, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(260, 1), Fraction(994, 1), Fraction(260, 1), Fraction(1006, 1)), (Fraction(150, 1), Fraction(994, 1), Fraction(150, 1), Fraction(1006, 1)), (Fraction(145, 1), Fraction(1000, 1), Fraction(550, 1), Fraction(1000, 1)), (Fraction(144, 1), Fraction(960, 1), Fraction(156, 1), Fraction(960, 1)), (Fraction(144, 1), Fraction(840, 1), Fraction(156, 1), Fraction(840, 1)), (Fraction(144, 1), Fraction(680, 1), Fraction(156, 1), Fraction(680, 1)), (Fraction(150, 1), Fraction(1005, 1), Fraction(150, 1), Fraction(630, 1)), (Fraction(144, 1), Fraction(920, 1), Fraction(156, 1), Fraction(920, 1)), (Fraction(480, 1), Fraction(994, 1), Fraction(480, 1), Fraction(1006, 1)), (Fraction(370, 1), Fraction(994, 1), Fraction(370, 1), Fraction(1006, 1))}
REQUIRED_SVG_TEXTS=('Quanti genitori rimangono in media', '1 · Valori medi a intervalli di un’emivita', '0 h', '64 milioni', '1 h', '32 milioni', '2 h', '16 milioni', '3 h', '8 milioni', 'T½ = 1 h · nessun nuovo genitore', '2 · Curva del solo campione N₀ = 64 milioni', 'N (milioni)', 't (h)', '0', '64', '1', '32', '2', '16', '3', '8', '3 · Altro campione: due misure e l’inizio', 'L’emivita inizialmente non è nota.', '0 h', '96 milioni', '1 h', '48 milioni', '3 h', '12 milioni', 'Blu: misure · Ocra: valore iniziale ricostruito', 'Il rapporto su 2 h dà q² = 1/4, quindi q = 1/2.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1600 letti per intero. Prime barre da x150 a scala5 coordinate per milione:320/160/80/40 per64/32/16/8. Curva origine(150,1000),110 coordinate/h e5 per milione, N=64·2^(−t/h), punti t0/1/2/3 a y680/840/920/960. Pannello finale di altro campione a scala3 per milione:288/144/36 per96/48/12. Nessuna etichetta attraversata, assi/legende completi.'
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
    return sp.simplify(n0*sp.Pow(2,-t/half))

def inverse_first(output,t,half=1):
    output,t,half=map(_positive,(output,t,half))
    return sp.simplify(output*sp.Pow(2,t/half))

def inverse_second(output,n0,half=1):
    output,n0,half=map(_positive,(output,n0,half))
    if sp.simplify(n0-output).is_positive is not True:
        raise ValueError('strictly positive finite elapsed time requires output<n0')
    return _positive(sp.simplify(half*sp.log(n0/output)/sp.log(2)))

def infer_origin(t1,y1,t2,y2):
    t1,y1,t2,y2=map(_positive,(t1,y1,t2,y2))
    if sp.simplify(t2-t1).is_positive is not True or sp.simplify(y1-y2).is_positive is not True:
        raise ValueError('ordered times and declining populations required')
    half=_positive(sp.simplify((t2-t1)*sp.log(2)/sp.log(y1/y2)))
    return half,inverse_first(y1,t1,half)
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
    n0,time,rate=sp.symbols('n0 time rate',positive=True)
    population=n0*sp.exp(-rate*time)
    assert sp.simplify(sp.diff(population,time)+rate*population)==0
    ratio=(SI.Quantity(1,'hour')/SI.Quantity(1,'hour')).to('dimensionless')
    assert ratio.magnitude==1 and SI.Quantity(1,'hour').to('second').magnitude==3600
    first=solve(64,1);second=solve(32,2)
    assert first==32 and second==8
    fit=calibrate(first,65,second,17,33);assert fit==(2,1,16)
    found_half,found_origin=infer_origin(1,48,3,12);assert(found_half,found_origin)==(1,96)
    expected=[first,'nuclei, conteggio adimensionale','Dopo 2 h resta in media metà dei genitori iniziali','Da 32 a 16 milioni di nuclei',inverse_first(first,1),inverse_second(first,64),solve(64,2)/first,64-first,'N₀ = N 2^u','κ₁ 2^(−δ)',second/first,(first+second)/2,inverse_second(first/4,32),inverse_first(sp.Rational(24,3),2),inverse_first(fit[2],1),found_origin]
    for n,v in {1:32,5:64,6:1,7:sp.Rational(1,2),8:32,11:sp.Rational(1,4),12:20,13:2,14:32,15:32,16:96}.items():assert sp.simplify(expected[n-1]-v)==0
    assert sp.simplify(solve(48,sp.Rational(3,2))-12*sp.sqrt(2))==0
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
