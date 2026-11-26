"""Independent source-first magnetic laws; no candidate authoring imports.
All80 source-prompt derivations and five numerical models frozen before candidate reading.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='e2acf441bb9b7fc3e67c2bc103e6dce9c9790b571610e6838da30c3debbcba4b'
CANDIDATE_REF='1e4dbef27eb0d7e6046e109328081eb974578a21'
PRIMARY_SHA256='51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkills': ['C4-L09'], 'actualLessonPrerequisites': {'C4-L09': ['C4-L02', 'C4-L05'], 'C4-L10': ['C4-L05', 'C4-L09']}, 'specialCasePrimarySkill': {}}
FAMILY='magnetic-circle-radius'
BATCH='magnetic-circle-radius-231'
ASSET_NAME='magnetic-circle-radius-progressive.svg'
REVIEWED_PACKAGE_SHA256='ff8fbc79bb58db0976ce3bcf6d5219b2976cf9a7c84c25e7b0f3aae779ab5848'
REVIEWED_BINDINGS_SHA256='133f7cb307de69e3aa53ccc1171ed9eb4b0e2420ccea0985616fa220f0782c91'
SOURCE_REFERENCE='Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.'
FALSE_PROOF='Il campo magnetico da solo aumenta l’energia cinetica della particella mentre ne curva la velocità.'
SVG_MUTATION=(b'r="80"', b'r="81"')
SVG_LABEL_MUTATION=(b'r = 2 m', b'r = 3 m')
EXPECTED_MAPPING={1: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 2: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 3: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 4: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 5: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 6: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 7: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 8: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 9: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 10: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 11: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 12: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 13: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 14: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 15: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 16: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09'])}
NUMERIC_UNITS={1: 'm', 5: 'm/s', 6: 'T', 14: 'm/s', 15: 'm/s'}
OPTION_SUFFIX={7: '', 8: ' m', 11: '', 12: ' m', 13: ''}
UNITS={1: 'meter', 2: 'meter', 3: 'meter', 4: 'meter', 5: 'meter/second', 6: 'tesla', 7: 'dimensionless', 8: 'meter', 9: 'meter/second', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter', 13: 'dimensionless', 14: 'meter/second', 15: 'meter/second', 16: 'dimensionless'}
MANUAL=['La forza magnetica perpendicolare ha modulo |q|vB ed è centripeta: |q|vB=mv²/r. Poiché v>0, r=mv/(|q|B). Qui m=10⁻⁶ kg e |q|=10⁻⁶ C, quindi m/|q|=1 kg/C; con v=2 m/s e B=1 T si ottiene r=2 m.', 'Il raggio è una lunghezza, dunque l’unità dimensionalmente pertinente è il metro. Da mv/(|q|B), usando T=kg/(C·s), si ottiene m. Un prefisso non modifica questa dimensione.', 'La forza qv×B cambia verso cambiando il segno di q, mentre il suo modulo è uguale. Le due traiettorie hanno lo stesso raggio mv/(|q|B), ma curvatura e verso di rotazione opposti rispetto al campo. Non è assegnata una posizione iniziale comune: non la si aggiunge per fissare i centri. Se fosse comune anche la posizione, i centri sarebbero sui lati opposti della tangente iniziale. Il candidato dichiara ora anche il punto iniziale comune. La formula finale limita esplicitamente F₋(0)=−F₊(0): a un quarto di giro le velocità sono diverse e le forze possono coincidere. Il ramo iniziale è stato riletto dopo il fix1e4dbef2.', 'A massa, modulo della carica e B costanti, r è lineare nella rapidità. Da 2 a 3 m/s il raggio passa da 2 a 3 m: il fattore è 3/2. Il campo magnetico devia la velocità senza aumentarne il modulo durante ciascuna prova.', 'Da r=mv/(|q|B) segue v=|q|Br/m. Inserendo r=2 m, B=1 T e m/|q|=1 kg/C si ricava v=2 m/s. Tutti i dati sono positivi, coerenti con il ramo del modulo della velocità.', 'Isolo B=mv/(|q|r). Con v=2 m/s e r=2 m si ottiene B=1 T. Il raggio positivo evita la divisione per zero e il modulo B è positivo.', 'A v fissata il raggio varia inversamente con B: r_B/r_A=B_A/B_B=1/2. I due raggi sono rispettivamente 2 m e 1 m. Aumentare il campo accresce la curvatura, non il raggio.', 'La legge fisica dà r=2 m. Lo scarto con la convenzione richiesta è 4−2=+2 m. Il segno indica una sovrastima del raggio proposto.', 'La relazione centripeta si riduce, per v>0, a r=mv/(|q|B); moltiplico per |q|B/m e ottengo v=|q|Br/m. L’identità numerica v/(m/s)=[r/(m)][B/(T)] vale grazie al rapporto assegnato m/|q|, non autorizza a eliminare le dimensioni di quel rapporto nella legge fisica.', 'La massa e il modulo della carica si cancellano nel rapporto dei due raggi. Resta (κ₁v)/(κ₂B) diviso v/B, cioè κ₁/κ₂. Entrambe le prove devono mantenere velocità perpendicolare e regime non relativistico.', 'Il raggio iniziale è 2/1=2 m; quello finale è 6/2=3 m nelle unità normalizzate assegnate. Il rapporto è 3/2. I fattori separati danno lo stesso controllo: 3/2 per la rapidità e il campo combinati, cioè 3 diviso 2.', 'Le letture fisiche sono 2 e 3 m: la media è 5/2 m. Il modello valutato invece su v medio 4 m/s e B medio 3/2 T dà 8/3 m. La differenza fra media delle letture e valore agli ingressi medi è 5/2−8/3=−1/6 m; i due procedimenti non coincidono.', 'Si vuole r_B=(3/2)·2 m=3 m con v_B=6 m/s. Da B=mv/(|q|r) segue B_B=2 T. Poiché B_A=1 T, il rapporto B_B/B_A è 2. Sostituire questo campo nel modello restituisce il raggio richiesto.', 'La lettura di riferimento S=6 corrisponde a r=2 m: a=3 unità strumentali/m. S=9 implica r=3 m. Con B=2 T, v=|q|Br/m=6 m/s. Non si identifica la lettura strumentale con un raggio prima della taratura.', 'Dai punti (r, S)=(2 m, 5), (3 m, 7) si ottiene a=(7−5)/(3−2)=2 unità strumentali/m e b=1. La lettura 3 implica r=(3−1)/2=1 m. A B=1 T si ricava v=1 m/s. I riferimenti hanno raggi distinti, quindi la taratura affine è determinata.', 'Il vincolo dimensionato v=(2 m·s⁻¹·T⁻¹)B rende r=2 m identicamente per tutti i B positivi compatibili col regime non relativistico. La misura è dunque ridondante e restano infinite coppie continue: per esempio (B, v)=(1 T, 2 m/s) e (2 T, 4 m/s). Non sono conteggi interi e non si pretende validità non relativistica a velocità arbitrariamente grandi.']
DISTRACTORS=['Quattro m mantiene v² ma perde il fattore v del lato magnetico; uno omette il valore due della velocità. Il raggio geometrico non diventa negativo cambiando il segno della carica.', 'Il quoziente mv/(|q|B) è una lunghezza, non un tempo, campo, forza o velocità. L’unità kg/s al denominatore cancella quella della quantità di moto lasciando metri.', 'Il segno cambia il prodotto vettoriale, non |q| nella legge del raggio. Alla partenza le velocità sono uguali e le forze opposte; non si estende F₋=−F₊ a tutti gli istanti. La potenza q(v×B)·v è nulla, quindi nessun aumento della rapidità.', '9/2 m applica il quadrato di 3/2; 4/3 inverte l’effetto, due ignora la nuova v e sei non deriva dal fattore assegnato. Il campo devia, non prepara da solo una velocità maggiore.', 'Un mezzo m/s è reciproco numerico e non ricostruisce r. Quattro m/s dà r=4 m. Omettere |q|/m lascia Br con dimensione T·m.', 'Due T produce r=1 m; quattro T moltiplica v e r nei numeri invece di formare il rapporto. Il modulo del raggio non determina un segno per B.', 'Due inverte B/A, 1/4 importa un quadrato, uno ignora il campo e zero non è possibile con dati finiti positivi. Le rapidità sono identiche nelle due preparazioni.', '−2 m inverte lo scarto, due è rapporto puro, quattro copia la proposta e zero la accetta. La differenza firmata non è una curvatura orientata.', 'mr/(|q|B) ha m·s; mB/(|q|r) non è velocità; |q|B/(mr) ha 1/(m·s) e m/(|q|Br) ha s/m. Massa e carica non si eliminano dimensionalmente perché i loro valori numerici coincidono.', 'Il prodotto rende diretto il campo, il reciproco inverte il rapporto e κ₁² cambia la legge lineare in v. La somma fallisce per fattori entrambi unitari.', 'Due terzi è reciproco, tre segue solo la rapidità, mezzo solo il campo e uno presume compensazione. Raggi 2/3 m producono il rapporto 3/2.', '8/3 m usa i dati medi, cinque somma senza mediare e mezzo è semidifferenza. Zero non è la media di lunghezze positive e non si sta mediando il segno di due cariche.', 'Mezzo inverte il campo richiesto; 3/2 copia i raggi e tre la variazione di v. B invariato darebbe r 6 m, non 3 m. Il nuovo campo ricostruito è 2 T.', 'Diciotto m/s usa D 9 come 9 m. Tre copia il numero del raggio e due riusa la velocità iniziale, che a B 2 T darebbe D 3.', '3/2 m/s omette b e predice D 4; due sottrae b senza dividere per a; tre copia il display e predice D 7. La velocità corretta dà D 3.', 'La variabile B si cancella perché il dato r 2 m ripete il vincolo v/B. Non nasce una quadratica né una condizione di integralità dei campi. Infinite coppie sono compatibili anche in un intervallo di velocità molto piccole rispetto a c.']
ASSUMPTIONS=['Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Caso autonomo: uguali masse positive e moduli di carica, cariche opposte e stessa velocità iniziale perpendicolare a B uniforme, partenza dallo stesso punto. Le forze sono opposte a t=0, non necessariamente durante l’intera evoluzione. I numeri 1 mg e 1 μC degli altri quesiti non sono dati imposti a questo confronto simbolico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.', 'Particella ideale non relativistica con massa 1 mg=10⁻⁶ kg e |q|=1 μC=10⁻⁶ C, velocità perpendicolare a B uniforme e sola forza magnetica, radiazione trascurata. Il rapporto m/|q| è 1 kg/C, non un numero puro: r=v/B è soltanto una forma numerica normalizzata. Raggio positivo e velocità positiva finite. Caso 03 autonomo: cariche opposte da stesso punto e stessa velocità iniziale; forze opposte soltanto a t=0, raggi uguali per l’intero moto. Medie e vincoli fra preparazioni, non campo che compie lavoro; infinite coppie 16 entro il regime classico.']
PEDAGOGY=['Legge motivata prima della sostituzione, unità e variabile richiesta distinte.', 'Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.', 'Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.', 'Confronto controllato a parametro fissato, non evoluzione dinamica inventata.', 'Prima inversa ricavata e reinserita nella legge diretta.', 'Seconda inversa con denominatori positivi e distinzione fra modulo e verso.', 'Due uscite ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto preservato, separato dal rapporto puro.', 'Inversa simbolica con coefficienti dimensionali espliciti.', 'Fattori inseriti nella legge effettiva prima di semplificare.', 'Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.', 'Media delle uscite distinta da modello agli ingressi medi e da media temporale.', 'Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.', 'Guadagno del display rimosso prima dell’inversa fisica.', 'Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.']
EXPECTED_IDS={'AR-u6-magnetic-circle-radius-10', 'AR-u6-magnetic-circle-radius-05', 'AR-u6-magnetic-circle-radius-11', 'AR-u6-magnetic-circle-radius-04', 'AR-u6-magnetic-circle-radius-13', 'AR-u6-magnetic-circle-radius-14', 'AR-u6-magnetic-circle-radius-12', 'AR-u6-magnetic-circle-radius-06', 'AR-u6-magnetic-circle-radius-01', 'AR-u6-magnetic-circle-radius-07', 'AR-u6-magnetic-circle-radius-08', 'AR-u6-magnetic-circle-radius-02', 'AR-u6-magnetic-circle-radius-09', 'AR-u6-magnetic-circle-radius-15', 'AR-u6-magnetic-circle-radius-03', 'AR-u6-magnetic-circle-radius-16'}
REVIEWED_CANDIDATES={'AR-u6-magnetic-circle-radius-01': 'd33843f957bdebd6745e5b8a80f1be360c576cd812351fe648ee90fb13e7b3a9', 'AR-u6-magnetic-circle-radius-02': 'ba2f707435da623f90d9fd186d372d49c144a16b2b37458e8d582ea19ba10a49', 'AR-u6-magnetic-circle-radius-03': 'bf4c637c31529608a4f6819e0069270b5ffd4360867f18ad63c56b175b43d14b', 'AR-u6-magnetic-circle-radius-04': '9841b3a0ee1fcf9a660a4ee2f4be427124ed83b363b1ced8a02d09cc576857e2', 'AR-u6-magnetic-circle-radius-05': '6a206e03f69ba380a7a28eabc674bc322aa04777c79d57355783dc96819402e9', 'AR-u6-magnetic-circle-radius-06': '155f4184c21cde1b286e3dbb91dd33fb563d7d8b5d0400ebcd76a7eaadfaf873', 'AR-u6-magnetic-circle-radius-07': '820e65be2399fdf8aede363e078fc1b36c925e1dbd70aa275a410f0b971abb13', 'AR-u6-magnetic-circle-radius-08': 'e4cef658717f2e4e0ddb9cce67fb8b34cb645109d4685be927e08716d5f1c3a5', 'AR-u6-magnetic-circle-radius-09': '69f6fcb96c637a71fd317881ead3b25e06cf3308a3aea9ff3974f666e47479c1', 'AR-u6-magnetic-circle-radius-10': '6a498f7ce052e44756e4b3c9e5c2bb7ac4495284a99c0886b0266404fa015033', 'AR-u6-magnetic-circle-radius-11': '7c634b54a3682c88c322d1511391dd5f07cf776d6aca4faee7fc9e86a2affd2d', 'AR-u6-magnetic-circle-radius-12': 'f45d02e3c509c107e63c7c4ecc092a1b87ee7d6faef7e1c10429a1bd4a846310', 'AR-u6-magnetic-circle-radius-13': 'fac2b496a09a7f46eaee9bcb3dcd1c79c3ee34c960cd61ae625b50410c21611b', 'AR-u6-magnetic-circle-radius-14': '5dd0c7606c6413c6d32b18c9b534384f9b79cc2591158a4b77215e35618e2c6e', 'AR-u6-magnetic-circle-radius-15': '95d247f6c8a89cbf62230eaaaac7809efaeb168fd73c304dcfd11332e196b4f9', 'AR-u6-magnetic-circle-radius-16': '57b3566aa2ad5370bed9e8715888ba69739e3608d7290095395c1e44e4c393ad'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z', 'M88 238L112 262M88 262L112 238'}
REQUIRED_CIRCLES={(Fraction(310, 1), Fraction(1200, 1), Fraction(5, 1)), (Fraction(180, 1), Fraction(710, 1), Fraction(80, 1)), (Fraction(230, 1), Fraction(1120, 1), Fraction(5, 1)), (Fraction(300, 1), Fraction(360, 1), Fraction(8, 1)), (Fraction(440, 1), Fraction(710, 1), Fraction(40, 1)), (Fraction(470, 1), Fraction(1240, 1), Fraction(5, 1)), (Fraction(300, 1), Fraction(280, 1), Fraction(3, 1)), (Fraction(300, 1), Fraction(280, 1), Fraction(80, 1)), (Fraction(100, 1), Fraction(250, 1), Fraction(18, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1285, 1), Fraction(150, 1), Fraction(1030, 1)), (Fraction(310, 1), Fraction(360, 1), Fraction(450, 1), Fraction(360, 1)), (Fraction(440, 1), Fraction(710, 1), Fraction(480, 1), Fraction(710, 1)), (Fraction(145, 1), Fraction(1280, 1), Fraction(520, 1), Fraction(1280, 1)), (Fraction(180, 1), Fraction(710, 1), Fraction(260, 1), Fraction(710, 1)), (Fraction(300, 1), Fraction(280, 1), Fraction(380, 1), Fraction(280, 1))}
REQUIRED_SVG_TEXTS=('Il raggio magnetico e il campo', '1 · Esempio illustrato con q positiva', 'm = 1 mg · |q| = 1 μC', 'r = 2 m', '+', 'v = 2 m/s', 'B = 1 T', 'entrante', 'v è tangente; il raggio parte dal centro.', 'Invertire q inverte la curvatura, non il raggio.', '2 · Stessa rapidità: v = 2 m/s', 'B = 1 T', 'B = 2 T', 'r = 2 m', 'r = 1 m', 'I due raggi hanno una scala comune.', '3 · Tre punti a v = 2 m/s', '0', '1', '2', '4', '2', '1', '1/2', 'B (T)', 'r (m)', 'Punti distinti, senza interpolazione lineare.', 'L’origine è degli assi: B = 0 non è ammesso.')
GEOMETRY_REVIEW='XML e PNG indipendente completo 640×1480 letti. Nella vista con q positiva, B entrante e punto in basso, la tangente v verso destra dà forza centripeta verso il centro soprastante. Cerchi 80 e 40 rappresentano 2 m e 1 m con scala comune 40 coordinate/m. Grafico con origine(150, 1280), 80 coordinate/T e 80 coordinate/m: punti(230, 1120), (310, 1200), (470, 1240) per B 1/2/4 T, r 2/1/1/2 m. Nessuna interpolazione lineare dichiarata; B 0 escluso.'
DECIMAL_REGRESSION_NUMBER=7

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def _finite_exact(value,positive=False):
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
    if positive and exact.is_positive is not True:raise ValueError('Strict positive finite real exact physical magnitude required')
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
    values=tuple(_finite_exact(x) for x in (first,second,reference_reading,new_reading,reading_a,reading_b,third_reading))
    first,second,reference_reading,new_reading,reading_a,reading_b,third_reading=values
    if first.is_positive is not True or second.is_positive is not True or sp.simplify(first-second)==0:
        raise ValueError('Two distinct positive finite physical calibration references required')
    if not isinstance(unit,str) or not unit:raise ValueError('Explicit physical unit required for calibration')
    try:SI.Unit(unit)
    except Exception as error:raise ValueError('Known physical unit required for calibration') from error
    gain=sp.simplify(reference_reading/first)
    affine_gain=sp.simplify((reading_b-reading_a)/(second-first))
    _finite_exact(gain,positive=True);_finite_exact(affine_gain,positive=True)
    offset=sp.simplify(reading_a-affine_gain*first)
    decoded=sp.simplify(new_reading/gain);third=sp.simplify((third_reading-offset)/affine_gain)
    _finite_exact(offset);_finite_exact(decoded,positive=True);_finite_exact(third,positive=True)
    physical=(SI.Quantity(reference_reading,'')/SI.Quantity(first,unit)).to('1/('+unit+')')
    if sp.simplify(sp.sympify(physical.magnitude)-gain)!=0:raise ValueError('Independent exact calibration dimensions inconsistent')
    return gain,offset,decoded,third
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    # Explicit relevant SI-prefix table, no second arithmetic parser or arbitrary unit evaluator.
    units={' m/s':('velocity',sp.Integer(1)),' cm/s':('velocity',sp.Rational(1,100)),
      ' mN':('force',sp.Rational(1,1000)),' N':('force',sp.Integer(1)),
      ' cm':('length',sp.Rational(1,100)),' m':('length',sp.Integer(1)),
      ' mg':('mass',sp.Rational(1,10**6)),' kg':('mass',sp.Integer(1)),
      ' m²':('area',sp.Integer(1)),' cm²':('area',sp.Rational(1,10**4)),
      ' T':('field',sp.Integer(1)),' mT':('field',sp.Rational(1,1000)),
      ' Wb':('flux',sp.Integer(1)),' mWb':('flux',sp.Rational(1,1000)),
      ' s':('time',sp.Integer(1)),' ms':('time',sp.Rational(1,1000)),
      ' V':('voltage',sp.Integer(1)),' A':('current',sp.Integer(1)),
      '':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

def result(speed, field):
    """v in m/s, B in T; m/|q|=1 kg/C, perpendicular classical motion."""
    speed=_finite_exact(speed,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(speed/field)
def inverse_first(radius, field):
    radius=_finite_exact(radius,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(radius*field)
def inverse_second(radius, speed):
    radius=_finite_exact(radius,positive=True);speed=_finite_exact(speed,positive=True)
    return sp.simplify(speed/radius)
def scaled(speed, field, k1, k2):
    speed=_finite_exact(speed,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def constrained_speed(field):
    """A relation between preparations, not acceleration within one orbit."""
    field=_finite_exact(field,positive=True)
    return 2*field

@lru_cache(maxsize=1)
def oracle():
    mass,charge,speed,field,radius=sp.symbols('mass charge speed field radius',positive=True)
    law=sp.solve(sp.Eq(charge*speed*field,mass*speed**2/radius),radius)[0]
    assert sp.simplify(law-mass*speed/(charge*field))==0
    physical=(SI.Quantity(1,'milligram')*SI.Quantity(2,'meter/second')/(SI.Quantity(1,'microcoulomb')*SI.Quantity(1,'tesla'))).to('meter')
    first=result(2,1);second=result(6,2);assert sp.sympify(physical.magnitude)==first==2 and second==3
    # At t=0 equal velocities give opposite forces. A quarter orbit later they need not.
    initial=sp.Matrix([1,0,0]);B=sp.Matrix([0,0,-1])
    plus=initial.cross(B);minus=-initial.cross(B);assert plus==-minus and plus.dot(initial)==0
    later_plus=sp.Matrix([0,1,0]).cross(B);later_minus=-sp.Matrix([0,-1,0]).cross(B)
    assert later_plus==later_minus and later_plus!=-later_minus
    fit=calibrate(first,second,6,9,5,7,3,'meter');assert fit==(3,1,3,1)
    assert result(4,sp.Rational(3,2))==sp.Rational(8,3)
    assert result(constrained_speed(sp.Rational(3,2)),sp.Rational(3,2))==2
    expected=[first,'m','Stesso raggio e curvature iniziali opposte','Da 2 m a 3 m',inverse_first(first,1),inverse_second(first,2),result(2,2)/first,4-first,'v = |q| B r / m','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(sp.Rational(3,2)*first,6),inverse_first(fit[2],2),inverse_first(fit[3],1),'Infinite coppie positive nel regime non relativistico']
    for n,value in {5:2,6:1,7:sp.Rational(1,2),8:2,11:sp.Rational(3,2),12:sp.Rational(5,2),13:2,14:6,15:1}.items():assert sp.simplify(expected[n-1]-value)==0
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_Lorentz_Newton_electric_work_cyclotron_period_flux_inverse_and_exact_algebraic_calibration",
            "Pint_exact_force_mass_charge_length_field_voltage_flux_time_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u6-magnetism-230-234-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"6da7f76086995a8297ac10bfe608354c6a77a91b"},"primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-magnetism-induction-230-234-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-05","U2-01")
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
    with tempfile.TemporaryDirectory(prefix='independent-magnetism-label-mutation-') as directory:
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
