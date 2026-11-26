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
CANDIDATE_REF='1116dd5cb24dc759e4b3882e3b433f29ac83748c'
PRIMARY_SHA256='51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkills': ['C4-L09'], 'actualLessonPrerequisites': {'C4-L09': ['C4-L02', 'C4-L05'], 'C4-L10': ['C4-L05', 'C4-L09']}, 'specialCasePrimarySkill': {}}
FAMILY='accelerated-magnetic-radius'
BATCH='accelerated-magnetic-radius-232'
ASSET_NAME='accelerated-magnetic-radius-progressive.svg'
REVIEWED_PACKAGE_SHA256='19706c07743154f6c3d1f1a86deaf82bc603c0687630672811f5398de279e596'
REVIEWED_BINDINGS_SHA256='5259751d3e9e9fc9ae826d560f16b30807013a52cb94fe857eeda5cefc6cb850'
SOURCE_REFERENCE='Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².'
FALSE_PROOF='Il campo magnetico nella seconda regione compie il lavoro positivo che genera l’energia cinetica orbitale.'
SVG_MUTATION=(b'r="100"', b'r="101"')
SVG_LABEL_MUTATION=(b'r = 4 m', b'r = 8 m')
EXPECTED_MAPPING={1: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 2: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 3: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 4: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 5: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 6: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 7: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 8: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 9: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 10: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 11: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 12: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 13: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 14: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 15: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09']), 16: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L004', 'C1-L005', 'C1-L007', 'C4-L01', 'C4-L02', 'C4-L03', 'C4-L09'])}
NUMERIC_UNITS={1: 'm', 5: 'V', 6: 'T', 14: 'V', 15: 'V'}
OPTION_SUFFIX={7: '', 8: ' m', 11: '', 12: ' m', 13: '', 16: ' T'}
UNITS={1: 'meter', 2: 'meter', 3: 'meter', 4: 'meter', 5: 'volt', 6: 'tesla', 7: 'dimensionless', 8: 'meter', 9: 'volt', 10: 'dimensionless', 11: 'dimensionless', 12: 'meter', 13: 'dimensionless', 14: 'volt', 15: 'volt', 16: 'tesla'}
MANUAL=['Nella regione elettrica il lavoro favorevole |q|U diventa energia cinetica da fermo: |q|U=mv²/2. Con |q|/m=1 C/kg e U=2 V si trova v=2 m/s. Nella regione magnetica distinta, r=mv/(|q|B); a B=1 T si ottiene r=2 m. Il campo magnetico non aggiunge energia cinetica.', 'La grandezza cercata è una lunghezza, espressa in metri. La legge combinata r=√(2 mU/|q|)/B ha dimensione di lunghezza; i coefficienti numerici assegnati non eliminano i fattori dimensionati.', 'Combino il bilancio elettrico da fermo con la forza centripeta: v=√(2|q|U/m), poi r=mv/(|q|B)=√(2 mU/|q|)/B. La radice positiva esprime una rapidità. Con u=U/(1 V), b=B/(1 T), il raggio normalizzato è r/(1 m)=√(2 u)/b, grazie al rapporto fisico |q|/m=1 C/kg.', 'Quadruplicare U da 2 a 8 V raddoppia v, perché v² è proporzionale a U. Con B=1 T il raggio raddoppia da 2 a 4 m. Il fattore quattro non va applicato direttamente al raggio.', 'Quadrando rB=√(2 mU/|q|) e isolando U: U=|q|r²B²/(2 m). Per r=2 m e B=1 T, con il rapporto assegnato, U=2 V. U>0 e B>0 rendono valida la selezione del ramo iniziale.', 'Dalla legge combinata B=√(2 mU/|q|)/r. Con U=2 V e r=2 m si trova B=1 T. Si sceglie il modulo positivo del campo, non una soluzione negativa introdotta elevando al quadrato.', 'A U invariata la rapidità di ingresso è uguale, mentre B raddoppia da 1 a 2 T. I raggi sono 2 e 1 m e il rapporto è 1/2. Il lavoro elettrico resta identico nelle due prove.', 'Il valore corretto è 2 m; quello proposto è 4 m. Lo scarto proposto meno corretto è +2 m. La sottrazione conserva l’unità di lunghezza.', 'Da r²B²=2 mU/|q| ottengo U=|q|r²B²/(2 m). In numeri normalizzati u=(r/(1 m))²b²/2. La dipendenza è quadratica sia nel raggio sia nel campo; il rapporto dimensionato |q|/m rimane nella legge fisica.', 'Per le due prove valide r_B/r_A=√(U_B/U_A)·B_A/B_B=√κ₁/κ₂. Questo confronto usa lo stesso rapporto |q|/m, partenza da fermo e regioni separate; non presuppone una forza magnetica che compia lavoro.', 'In A, r_A=√4/1=2 m. In B, U=1 V e B=2 T danno r_B=√2/2 m. Il rapporto è (√2/2)/2=√2/4. Si conserva il radicale esatto, senza conversione decimale.', 'Calcolo le due uscite 2 m e √2/2 m prima di farne la media: (2+√2/2)/2=1+√2/4 m. La risposta agli ingressi medi U=3/2 V e B=3/2 T sarebbe invece √3/(3/2)=2√3/3 m. Sono costruzioni diverse e non si sostituisce la seconda alla prima.', 'Il raggio richiesto è (√2/4)·2=√2/2 m. Con U_B=1 V, B_B=√2/(√2/2) T=2 T. Pertanto B_B/B_A=2. Il fattore cercato è razionale anche se il raggio intermedio è irrazionale.', 'Il riferimento r=2 m con S=6 dà a=3 unità strumentali/m. S=3√2/2 corrisponde a r=√2/2 m. Con B=2 T, U=|q|r²B²/(2 m)=1 V. Il radicale si elimina elevando esattamente al quadrato, non approssimandolo.', 'I riferimenti fisici hanno r_A=2 m e r_B=√2/2 m. La differenza delle letture è 4−√2 e quella dei raggi è (4−√2)/2 m; quindi a=2 unità strumentali/m e b=1. S_C=9 implica r_C=4 m; con B=1 T risulta U_C=8 V. La taratura coinvolge riferimenti algebrici esatti e non un arrotondamento razionale.', 'Il vincolo è lineare U=(2 V/T)B, non quadratico nel campo. Pongo b=B/(1 T)>0, allora u=2 b e r/(1 m)=√(4 b)/b=2/√b. La misura r=2 m impone √b=1, quindi B=1 T e U=2 V. La positività esclude B=0 e ogni ramo non fisico.']
DISTRACTORS=['Quattro m tratta v² come v. Un m richiederebbe U=1/2 V, non 2 V. Il magnete non può sostituire il lavoro elettrico iniziale.', 'V, m/s, T e J rappresentano tensione, rapidità, campo ed energia, non la lunghezza finale. αB ha s⁻¹.', '2αU senza radice è una velocità al quadrato. √(αU) perde il due energetico; omettere α al denominatore altera le dimensioni anche se il suo valore numerico è uno. Il reciproco non è un raggio.', 'Otto m applica direttamente il fattore quattro della tensione; uno inverte il raddoppio, due ignora la nuova U e sedici aggiunge una potenza ingiustificata.', 'Quattro V omette 1/2; un V usa il numero r invece di r² e restituisce r=√2 m. Otto V produce r 4 m. L’inversa deve restare nel modello classico.', 'Due T dà r 1 m; quattro T moltiplica i valori di v e r, −1 T non è un modulo ammesso. Il ramo B>0 va scelto esplicitamente.', 'Due inverte l’effetto di B, un quarto usa un quadrato, uno ignora B. Zero non è il raggio con velocità positiva e campo finito.', '−2 m inverte lo scarto; due puro è il rapporto. Quattro copia la proposta e zero la accetta senza applicare entrambe le leggi.', 'αBr/2 non contiene i quadrati della legge energetica. Omettere due raddoppia U; il reciproco ha V⁻¹. L’ultima formula scambia B e 1/B, senza isolare U.', 'κ₁/κ₂ perde la radice di U. Il prodotto rende diretto B, il reciproco scambia le prove e √(κ₁/κ₂) mette impropriamente anche B sotto radice.', '√2/2 segue solo il fattore della rapidità e ignora il campo doppio; 1/4 segue direttamente U.2√2 è il reciproco di√2/4 e uno ignora le due modifiche.', '2+√2/2 è la somma senza mediare; 1+√2/2 dimezza solo il primo addendo.2√3/3 usa gli ingressi medi. Tutte le somme sono parentetizzate prima dell’unità e zero non media due raggi positivi.', 'Mezzo inverte il rapporto; √2/2 copia le rapidità e√2/4 i raggi. Un fattore campo quattro implica B_B 4 T e r_B√2/4 m, metà del bersaglio.', 'Nove V usa il display come r, triplicando r e aumentando U di nove volte. Due V omette il fattore 1/2; mezzo V restituisce r 1/2 m, non√2/2 m.', '81/8 V omette b e predice D 10. Trentadue V sottrae b ma non divide per a prima del quadrato. Sedici V omette il fattore 1/2 energetico. La taratura esatta con due radicali dà a 2/m, b 1.', '−1 T viola il modulo e darebbe U negativa dal vincolo. Due T darebbe r√2 m, quattro T r 1 m. Il vincolo lineare e la misura fissano B, senza scala libera né radiceB 0 ammissibile.']
ASSUMPTIONS=['Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².', 'Rapporto α=|q|/m=1 C/kg dichiarato e dimensionato. Partenza da fermo e lavoro elettrico favorevole |q|U nella prima regione, poi solo B uniforme nella seconda regione separata, ingresso perpendicolare, radiazione e altre forze trascurate. Ogni preparazione e inversa resta non relativistica. La rapidità è la radice positiva di 2αU; il campo magnetico non fornisce lavoro. Radicali e tarature algebriche esatte: display continuo, nessun arrotondamento dei riferimenti. Vincolo 16 lineare U=(2 V/T)B, non U proporzionale a B².']
PEDAGOGY=['Legge motivata prima della sostituzione, unità e variabile richiesta distinte.', 'Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.', 'Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.', 'Confronto controllato a parametro fissato, non evoluzione dinamica inventata.', 'Prima inversa ricavata e reinserita nella legge diretta.', 'Seconda inversa con denominatori positivi e distinzione fra modulo e verso.', 'Due uscite ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto preservato, separato dal rapporto puro.', 'Inversa simbolica con coefficienti dimensionali espliciti.', 'Fattori inseriti nella legge effettiva prima di semplificare.', 'Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.', 'Media delle uscite distinta da modello agli ingressi medi e da media temporale.', 'Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.', 'Guadagno del display rimosso prima dell’inversa fisica.', 'Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.']
EXPECTED_IDS={'AR-u6-accelerated-magnetic-radius-15', 'AR-u6-accelerated-magnetic-radius-04', 'AR-u6-accelerated-magnetic-radius-08', 'AR-u6-accelerated-magnetic-radius-09', 'AR-u6-accelerated-magnetic-radius-10', 'AR-u6-accelerated-magnetic-radius-12', 'AR-u6-accelerated-magnetic-radius-01', 'AR-u6-accelerated-magnetic-radius-03', 'AR-u6-accelerated-magnetic-radius-14', 'AR-u6-accelerated-magnetic-radius-02', 'AR-u6-accelerated-magnetic-radius-06', 'AR-u6-accelerated-magnetic-radius-13', 'AR-u6-accelerated-magnetic-radius-16', 'AR-u6-accelerated-magnetic-radius-07', 'AR-u6-accelerated-magnetic-radius-05', 'AR-u6-accelerated-magnetic-radius-11'}
REVIEWED_CANDIDATES={'AR-u6-accelerated-magnetic-radius-01': '0abbd70174608c07c17dc2a33a26c2d8826080118b48dceab4de2ac9388e22d7', 'AR-u6-accelerated-magnetic-radius-02': '18e2deb222e3a4f59b7f0025a251b3cd9acc30b1d4f446d7bfc3286ac3b7422a', 'AR-u6-accelerated-magnetic-radius-03': 'f659b76512c42b95228ac77957f1ab27bb9b63a4045d8277e7637b8118f8ee1f', 'AR-u6-accelerated-magnetic-radius-04': '274b3083b8a35610d784fe2028ae2e51551cb93f89edcf0ec3406426fb9ba97e', 'AR-u6-accelerated-magnetic-radius-05': 'e15e68798e5f4f1c066c3f55887d6c375ed8256eb864eb17941a4ee7a1d91bfd', 'AR-u6-accelerated-magnetic-radius-06': '2e1acb2becb4ed109326dc3cab6a9ae10a88c7c2d4599343a02a66ebadf2dc35', 'AR-u6-accelerated-magnetic-radius-07': '4dfc8019995a3b99c4cda8ec304b3c3cc19c949e30e18a6ddf037fc54bfb6e5d', 'AR-u6-accelerated-magnetic-radius-08': 'b3e04d2f97a343da5660f827f1eddb2a5ef8900134d439cc19a5c38f5da4580e', 'AR-u6-accelerated-magnetic-radius-09': 'd05838e5a48c2ae75e2864241779f0d9beb516f923b7c62681f53f2849bf04d7', 'AR-u6-accelerated-magnetic-radius-10': '7e9c99e52c0580b20415d1e6e5e9277623994d4c7c7952b5be76f4305fe93577', 'AR-u6-accelerated-magnetic-radius-11': 'e7822717a1be4d6ed8a112eacb6ac7f5350eface97c1e89d796f1961f7d17091', 'AR-u6-accelerated-magnetic-radius-12': 'ca42df6ef3d70a5940bb577387aa14668e346a43bbb12d5d0d848f9821cb873d', 'AR-u6-accelerated-magnetic-radius-13': 'f485f78b7628b54f9ba15a02638ca84c3bf93430bbdfd66a679f2cdb11ddd368', 'AR-u6-accelerated-magnetic-radius-14': '6dfb2349893aec2d2f6eaed8c8b792fd6a20376dff688b9fe7ed7af58034f29a', 'AR-u6-accelerated-magnetic-radius-15': 'bd99ef51da80ac06b6c70188415ff28477dbb5359ecb728ce631491aab7a7b19', 'AR-u6-accelerated-magnetic-radius-16': '6103f69de02da53fa99e66036c2c80b59369933f05aff1524ea79ab6d633d5d8'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(440, 1), Fraction(720, 1), Fraction(100, 1)), (Fraction(310, 1), Fraction(1200, 1), Fraction(5, 1)), (Fraction(160, 1), Fraction(720, 1), Fraction(50, 1)), (Fraction(230, 1), Fraction(1120, 1), Fraction(5, 1)), (Fraction(470, 1), Fraction(1240, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(440, 1), Fraction(720, 1), Fraction(540, 1), Fraction(720, 1)), (Fraction(320, 1), Fraction(230, 1), Fraction(320, 1), Fraction(280, 1)), (Fraction(150, 1), Fraction(1285, 1), Fraction(150, 1), Fraction(1030, 1)), (Fraction(160, 1), Fraction(720, 1), Fraction(210, 1), Fraction(720, 1)), (Fraction(145, 1), Fraction(1280, 1), Fraction(520, 1), Fraction(1280, 1))}
REQUIRED_SVG_TEXTS=('Dall’energia elettrica al raggio', '1 · Due regioni, due calcoli', 'α = |q|/m = 1 C/kg', 'Regione elettrica: da fermo, lavoro |q|U', 'Con U = 2 V: v² = 2αU, quindi v = 2 m/s', 'Regione magnetica separata: B = 1 T', 'Ingresso perpendicolare: r = v/(αB) = 2 m', 'B cambia la direzione, senza lavoro su q.', 'Schema di calcolo, non disegno della traiettoria.', '2 · Stesso campo: B = 1 T', 'U = 2 V', 'U = 8 V', 'r = 2 m', 'r = 4 m', 'I raggi hanno la stessa scala; U è quadrupla.', '3 · Tre punti a U = 2 V', '0', 'B (T)', 'r (m)', '1', '2', '2', '1', '4', '1/2', 'Punti distinti, senza interpolazione lineare.', 'L’origine è degli assi: B = 0 non è ammesso.')
GEOMETRY_REVIEW='XML e PNG indipendente completo 640×1480 letti. Primo pannello è uno schema di calcolo, non traiettoria in campi sovrapposti. Cerchi con raggi 50/100 rappresentano 2/4 m a scala comune 25 coordinate/m per U 2/8 V e B 1 T. Grafico a U 2 V usa origine(150, 1280), 80 coordinate/T e 80 coordinate/m e tre punti r 2/1/1/2 m ai B 1/2/4 T, non interpolati linearmente.'
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

def result(voltage, field):
    """U in V, B in T, |q|/m=1 C/kg; separate acceleration then orbit."""
    voltage=_finite_exact(voltage,positive=True);field=_finite_exact(field,positive=True)
    return sp.sqrt(2*voltage)/field
def inverse_first(radius, field):
    radius=_finite_exact(radius,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(radius**2*field**2/2)
def inverse_second(radius, voltage):
    radius=_finite_exact(radius,positive=True);voltage=_finite_exact(voltage,positive=True)
    return sp.sqrt(2*voltage)/radius
def scaled(voltage, field, k1, k2):
    voltage=_finite_exact(voltage,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.sqrt(k1)/k2
def constrained_field(radius):
    """Source16 is U=(2 V/T)B, so r/(m)=2/sqrt(B/(T))."""
    radius=_finite_exact(radius,positive=True)
    return sp.simplify(4/radius**2)

@lru_cache(maxsize=1)
def oracle():
    alpha,U,B=sp.symbols('alpha U B',positive=True)
    speed=sp.sqrt(2*alpha*U);radius=sp.simplify(speed/(alpha*B))
    assert sp.simplify(radius**2-2*U/(alpha*B**2))==0
    physical_squared=(2*SI.Quantity(2,'volt')/(SI.Quantity(1,'coulomb/kilogram')*SI.Quantity(1,'tesla')**2)).to('meter**2')
    first=result(2,1);second=result(1,2)
    assert sp.sympify(physical_squared.magnitude)==first**2==4 and second==sp.sqrt(2)/2
    fit=calibrate(first,second,6,3*sp.sqrt(2)/2,5,1+sp.sqrt(2),9,'meter')
    assert all(sp.simplify(x-y)==0 for x,y in zip(fit,(3,1,sp.sqrt(2)/2,4)))
    assert result(sp.Rational(3,2),sp.Rational(3,2))==2*sp.sqrt(3)/3
    assert sp.simplify((first+second)/2-(1+sp.sqrt(2)/4))==0
    assert result(2*constrained_field(3),constrained_field(3))==3
    expected=[first,'m','r = √(2 α U) / (α B)','Da 2 m a 4 m',inverse_first(first,1),inverse_second(first,2),result(2,2)/first,4-first,'U = α B² r² / 2','√κ₁ / κ₂',second/first,(first+second)/2,inverse_second(sp.sqrt(2)*first/4,1),inverse_first(fit[2],2),inverse_first(fit[3],1),constrained_field(first)]
    for n,value in {5:2,6:1,7:sp.Rational(1,2),8:2,11:sp.sqrt(2)/4,12:1+sp.sqrt(2)/4,13:2,14:1,15:8,16:1}.items():assert sp.simplify(expected[n-1]-value)==0
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
