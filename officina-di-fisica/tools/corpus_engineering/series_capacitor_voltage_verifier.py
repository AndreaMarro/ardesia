"""Independent source-first U6-04 laws; no candidate authoring imports.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='85dad5e28940ee486e847302a0d2a0d5fc88925e17115e897e3b5fb43184e35a'
CANDIDATE_REF='8e21066b36cb9b4390c0390f26d3295fdbd09ffc'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'sourcePath': 'content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkill': 'C4-L08', 'title': 'Mettere insieme i condensatori', 'lessonPrerequisites': ['C4-L07'], 'mappingReread': 'All80 metadata-only deltas read after comparing the full actual C4-L07 and C4-L08 lessons; previous mathematical proofs preserved separately.', 'gitPath': 'officina-di-fisica/content/C4.json'}
PRIMARY_SHA256='08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58'
FAMILY='series-capacitor-voltage'
BATCH='series-capacitor-voltage-222'
ASSET_NAME='series-capacitor-voltage-progressive.svg'
REVIEWED_PACKAGE_SHA256='4add556687f791773f554dcefcdf95f56fde8f0bddfa50a5c8ecfbf430726a9a'
REVIEWED_BINDINGS_SHA256='6330758a24849a466bbb68e5fe350cca6dcbf333668803447683c9e1d59593c0'
SOURCE_REFERENCE='Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.'
FALSE_PROOF='La somma C₁+C₂ uguale fra due preparazioni implica sempre uguale carica comune della serie.'
SVG_MUTATION=(b'width="180"', b'width="181"')
EXPECTED_MAPPING={1: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 2: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 3: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 4: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 5: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 6: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 7: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 8: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 9: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 10: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 11: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 12: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 13: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 14: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 15: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08']), 16: ('C4-L08', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07', 'C4-L08'])}
NUMERIC_UNITS={1: 'V', 5: 'μF', 6: 'μF', 14: 'μF'}
OPTION_SUFFIX={7: '', 8: ' V', 11: '', 12: ' V', 13: '', 15: ' μF'}
UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'microfarad', 6: 'microfarad', 7: 'dimensionless', 8: 'volt', 9: 'farad', 10: 'dimensionless', 11: 'dimensionless', 12: 'volt', 13: 'dimensionless', 14: 'microfarad', 15: 'microfarad', 16: 'dimensionless'}
MANUAL=['Il nodo interno neutro impone il medesimo modulo Q sulle armature dei due elementi. Poiché Q=12 C₁ C₂/(C₁+C₂), la tensione sul primo è V₁=Q/C₁=12 C₂/(C₁+C₂). Con 2 e 2 μF vale 6 V: al numeratore compare la capacità dell’altro elemento. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'V₁ è una differenza di potenziale e ha unità volt, V=J/C. Non è una carica né una capacità. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La somma delle tensioni è 12 V e Q è comune: V₁/V₂=C₂/C₁. Eliminando V₂ si trova V₁=12 C₂/(C₁+C₂), con 0<V₁<12 V per capacità positive. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'C₁ dimezzata diventa 1 μF, C₂ resta 2 μF. La tensione sul primo è 12·2/3=8 V, invece di 6 V. Non si dimezza V₁: diminuire C₁ aumenta la sua quota della tensione totale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da V₁(C₁+C₂)=12 C₂ ricavo C₁=C₂(12−V₁)/V₁. Inserendo C₂=2 μF e V₁=6 V ottengo 2 μF; il rapporto fra tensioni è adimensionale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Isolo l’altra capacità: C₂=C₁ V₁/(12−V₁). Con C₁=2 μF e V₁=6 V risulta 2 μF. Il denominatore richiede V₁<12 V e la positività richiede V₁>0. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'C₂, B=4 μF e C₁=2 μF danno V₁, B=12·4/6=8 V. Il rapporto rispetto ai 6 V iniziali è 4/3. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La proposta 12 V supera la soluzione 6 V di 6 V: proposta meno soluzione =+6 V. Non è il valore della seconda tensione richiesto per caso, ma uno scarto con ordine dichiarato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La prima capacità si ricava da C₁=C₂(E/V₁−1), E=12 V. Il dominio fisico è C₂>0 e 0<V₁<E; i bordi corrisponderebbero a elementi nulli o a limiti non finiti, esclusi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Sostituendo i fattori nelle due capacità, il rapporto di tensioni è κ₂(C₁+C₂)/(κ₁ C₁+κ₂ C₂). Una scalatura comune κ₁=κ₂ non cambia la divisione della tensione. Le cariche comuni entro una preparazione non sono necessariamente uguali fra preparazioni. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'In B con 3 e 1 μF, V₁=12·1/4=3 V. In A vale 6 V, perciò il rapporto B/A è 1/2. Il generatore rimane a 12 V, non la carica: Q passa da 12 a 9 μC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La media di 6 e 3 V è 9/2 V. Le capacità medie 5/2 e 3/2 μF sommano 4 μF e danno anch’esse 9/2 V: qui il denominatore costante rende la dipendenza affine lungo questi dati. Non è costante la capacità equivalente, né la carica. Controesempio: (1, 1) e (1, 3) μF danno 6 e 9 V, media 15/2 V; gli ingressi medi (1, 2) μF danno 8 V. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto 1/2 fissa V₁, B=3 V. Con C₁, B=3 μF: 3(3+C₂, B)=12 C₂, B, dunque C₂, B=1 μF. Rispetto a C₂, A=2 μF il fattore è 1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La lettura 18 a 6 V dà a=3 V⁻¹. D_B=9 indica V₁, B=3 V; con C₂, B=1 μF ricavo C₁, B=1·(12−3)/3=3 μF. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Le coppie 6 V→13 e 3 V→7 danno a=2 V⁻¹ e b=1. D_C=17 significa V₁, C=8 V. Con C₂, C=2 μF ottengo C₁, C=2(12−8)/8=1 μF. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con C₁=C₂ la tensione sul primo è sempre E/2=6 V, qualunque sia la comune capacità positiva finita. Restano infinite coppie continue della forma (c, c). Una misura aggiuntiva della carica fisserebbe c, ma qui non è assegnata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['12 V annulla caduta del secondo; 3 V richiederebbe C₁3 C₂.4 e 2 copiano capacità. La relazione è inversa fra caduta e propria capacità a Q comune.', 'A, μF, W e 1 indicano corrente, capacità, potenza e quota pura, non differenza di potenziale.', 'C₁ al numeratore dà V₂; reciproco supera E, rapporto senza totale perde capacità. Prodotto EC₁ C₂ ha VF².', '3 V segue C₁ direttamente, 6 ignora cambio, 12 annulla altra caduta, 4 V è V₂ finale invece diV₁.', 'C₁6 μF dà 3 V, 4 μF dà 4 V. Sottrarre capacità e tensione non è omogeneo. V₁0 escluso con componenti finiti positivi.', 'C₂4 μF dà 8 V, 1 μF dà 4 V. Sostituire E+V₁ dà 2/3 μF e non ricompone 6 V; V₁ E è confine escluso.', '3/4 reciproco, 2 segue solo C₂, 1/2 ne inverte effetto, 1 ignora il cambiamento.8 V resta sotto 12 V.', '−6 V inverte ordine, 12 copia proposta, 0 la accetta, 2 è rapporto puro.', 'Il più non isola C₁; rapporto invertito dà 1/3 μF nel controesempio 12 V/3 V/C₂1 μF, mentre corretto 3 μF. V₁/C₂ eC₂−V₁ dimensionalmente errati.', 'κ₁ al numeratore scala elemento sbagliato; prodotto perde somma, reciproco inverte B/A, quoziente dei fattori perde pesi.', '2 reciproco, 3/2 segue C₁, 1/3 usa il rapporto interno C₂/C₁, 1 ignora riparto variabile a somma comune.', '9 somma, 3/2 semidifferenza, 6 e 3 ripetono una prova. Coincidenza ai dati medi richiede qui somma 4 μF comune, non equivale a carica comune fra prove.', '2 reciproco, 1/3 confronta con C₁, B invece diC₂, A, 3/2 segue C₁, 1 conserva C₂ e produce 24/5 V.', '1/3 μF deriva da usare D9 come 9 V, non dal rapporto fisico decodificato.1 μF dà 6 V, 9 μF dà 6/5 V.', '14/17 μF omette l’offset e ricompone D18; 2 μF dà 13, 4 μF dà 9, 8 μF dà 29/5. UnμF ricompone D17.', 'Singole coppie sono esempi, non uniche; la risposta Nessuna coppia è confutata da esempi, qualunque coppia indipendente viola C₁=C₂. Refuso Una e frase Nessuna riletti finali.']
ASSUMPTIONS=['Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.', 'Serie inizialmente scarica con nodo intermedio neutro isolato, generatore 12 V e uscita orientata positiva sul primo condensatore. Carica comune entro una prova, non costante fra preparazioni. Entrambe le capacità finite positive impongono 0<V₁<12 V. S eS_B nel 10 sono somme ausiliarie, non capacità equivalenti. Media 12 condizionata dalla somma 4 μF comune, con controesempio indipendente; vincolo 16 lascia scala continua libera.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Prima inversa derivata e reinserita nella legge diretta. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Due configurazioni ricostruite prima del rapporto adimensionale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Ordine della differenza mantenuto e distinto dal rapporto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Entrambi gli ingressi nuovi usati prima del confronto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Guadagno strumentale rimosso prima dell’inversa fisica. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera. La competenza primaria effettiva è C4-L08 per reti di condensatori; C4-L07 è mantenuto come prerequisito.']
EXPECTED_IDS={'AR-u6-series-capacitor-voltage-05', 'AR-u6-series-capacitor-voltage-12', 'AR-u6-series-capacitor-voltage-15', 'AR-u6-series-capacitor-voltage-09', 'AR-u6-series-capacitor-voltage-14', 'AR-u6-series-capacitor-voltage-07', 'AR-u6-series-capacitor-voltage-11', 'AR-u6-series-capacitor-voltage-13', 'AR-u6-series-capacitor-voltage-03', 'AR-u6-series-capacitor-voltage-16', 'AR-u6-series-capacitor-voltage-01', 'AR-u6-series-capacitor-voltage-06', 'AR-u6-series-capacitor-voltage-10', 'AR-u6-series-capacitor-voltage-08', 'AR-u6-series-capacitor-voltage-04', 'AR-u6-series-capacitor-voltage-02'}
REVIEWED_CANDIDATES={'AR-u6-series-capacitor-voltage-01': '70707e1bdc24fc4e7dd48bc5128b566f9f122b8f9e8ff3ee99ef27d2329b6532', 'AR-u6-series-capacitor-voltage-02': 'e95dc4ec71c1812157c9e147e819fa7d64a2446de094eb7e27dd8ce03fa91631', 'AR-u6-series-capacitor-voltage-03': '952d6f0ae41a1e270153a3f20f91cde89c0b43240dc8b006cb8a861b2d686cdc', 'AR-u6-series-capacitor-voltage-04': 'cf90d24b5b4755e7d8f18b370792b6fa98cb6ed47f74560f8297dd57f94d5b5c', 'AR-u6-series-capacitor-voltage-05': 'c77349afa9ea1bd1000ac3528cc21e10015d946913b3d3d4ad3d8785023c4881', 'AR-u6-series-capacitor-voltage-06': '12fa56c563482c321ac4a9e3d09586e3907408ece23950a2f3b080e0a8309732', 'AR-u6-series-capacitor-voltage-07': '1f8bbd9e0d5fd6e64f835713ee1f06e6d4b6caaf982badb6d0839951f2df4e4a', 'AR-u6-series-capacitor-voltage-08': '70f6ecb53d7951db8cb10d423740f77dd92ceaec902c99975e875fc27cc1b497', 'AR-u6-series-capacitor-voltage-09': '26175a55317424275c618536eb09726271a5aaf50e899a39812b4e0dfc88b369', 'AR-u6-series-capacitor-voltage-10': '0a724b70b2079122cd7990e9bd4588a6772e892e1cd76166da59b078992a4eea', 'AR-u6-series-capacitor-voltage-11': '118b718f9b428dbba9cdb0c0b1e2388035a69581d1acbe3addc5bc4c1fd65a45', 'AR-u6-series-capacitor-voltage-12': '68a33b16be512ae3e20c85699c00d2a81ced32965f0ea37e62340f47440dfce4', 'AR-u6-series-capacitor-voltage-13': '4bf23b31d64576733a6abf270b51b35f06d806cb9b96057eabe7ef3d5c50fd23', 'AR-u6-series-capacitor-voltage-14': '46420189f96ca8613bf800b4f6b9f33aa487dce8a34a834002bc11d3a5e50dc9', 'AR-u6-series-capacitor-voltage-15': '725bc85571caa5b3eb504a4c8d9227b13f7218450b1e8b5d6fcf976461e87a21', 'AR-u6-series-capacitor-voltage-16': 'db1ef3f84855ddc252f80e3940613f71d5c7448d6b455f0b63ce33567c56e6e5'}
REQUIRED_RECTS={(Fraction(390, 1), Fraction(800, 1), Fraction(120, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(1350, 1), Fraction(180, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(1150, 1), Fraction(240, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(800, 1), Fraction(240, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(650, 1), Fraction(180, 1), Fraction(42, 1)), (Fraction(150, 1), Fraction(1250, 1), Fraction(120, 1), Fraction(42, 1)), (Fraction(330, 1), Fraction(650, 1), Fraction(180, 1), Fraction(42, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1540, 1))}
REQUIRED_PATHS={'M100 195H235M255 195H385M405 195H540', 'M255 170V220', 'M32 466H608', 'M405 170V220', 'M150 1120V1420', 'M385 170V220', 'M32 953H608', 'M235 170V220', 'M100 299V310H320V299M320 299V310H540V299'}
REQUIRED_CIRCLES={(Fraction(100, 1), Fraction(195, 1), Fraction(4, 1)), (Fraction(320, 1), Fraction(195, 1), Fraction(4, 1)), (Fraction(540, 1), Fraction(195, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
GEOMETRY_REVIEW='Letti XML e native completo 640×1540. Circuito con nodo M neutro e due parentesi di caduta non vettoriali. Barre centrali 6+6 V lunghe 180+180 e 8+4 V lunghe 240+120, scala 30 coordinate/V e totale 360, nessuna sovrapposizione di label. Ultime cadute 6/3/9/2 V lunghe 240/120/180 da x 150, scala 40 coordinate/V indipendente dal pannello centrale. Zero fuoriasse; casi centrale e finale esplicitamente distinti.'
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
    for suffix in (' μF',' μC',' μJ',' F',' mA',' W',' J',' s',' Ω',' V',' A',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Positive finite capacitances required')
    return sp.cancel(12*second/(first+second))

def inverse_first(voltage,second):
    voltage,second=map(_finite_exact,(voltage,second))
    if not 0<voltage<12 or second<=0:raise ValueError('Voltage must lie strictly between zero and12; positive finite capacitance required')
    return sp.cancel(second*(12-voltage)/voltage)

def inverse_second(voltage,first):
    voltage,first=map(_finite_exact,(voltage,first))
    if not 0<voltage<12 or first<=0:raise ValueError('Voltage must lie strictly between zero and12; positive finite capacitance required')
    return sp.cancel(first*voltage/(12-voltage))

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(first,second,k1,k2)<=0:raise ValueError('Positive finite inputs required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def constrained_value(common):
    common=_finite_exact(common)
    if common<=0:raise ValueError('Positive finite common capacitance required')
    return result(common,common)

@lru_cache(maxsize=1)
def oracle():
    c1,c2,e,q,u=sp.symbols('C1 C2 E Q U',positive=True)
    charge=sp.solve(sp.Eq(e,q/c1+q/c2),q)[0]
    assert sp.cancel(charge/c1-e*c2/(c1+c2))==0
    for variable,expected in [(c1,c2*(e-u)/u),(c2,c1*u/(e-u))]:
        sol=sp.solve(sp.Eq(u,e*c2/(c1+c2)),variable);assert len(sol)==1 and sp.cancel(sol[0]-expected)==0
    first=result(2,2);second=result(3,1);assert (first,second)==(6,3)
    assert SI.Quantity(12,'microcoulomb')/SI.Quantity(2,'microfarad')==SI.Quantity(6,'volt')
    assert result(sp.Rational(5,2),sp.Rational(3,2))==(first+second)/2
    assert (result(1,1)+result(1,3))/2==sp.Rational(15,2) and result(1,2)==8
    assert constrained_value(1)==constrained_value(3)==6
    fit=calibrate(first,second,18,9,13,7,17,'volt');assert fit==(3,1,3,8)
    return [first,'V','V₁ = E C₂ / (C₁ + C₂)','Da 6 a 8 V',inverse_first(first,2),inverse_second(first,2),scaled(2,2,1,2),12-first,'C₁ = C₂ (E − V₁) / V₁','κ₂ S / S_B',second/first,(first+second)/2,inverse_second(first/2,3)/2,inverse_first(fit[2],1),inverse_first(fit[3],2),'Infinite coppie positive con C₁ = C₂']
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_capacitor_node_charge_voltage_field_energy_inverse_and_calibration",
            "Pint_exact_capacitance_charge_voltage_energy_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-capacitor-networks-220-224-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-04","U2-01")
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
