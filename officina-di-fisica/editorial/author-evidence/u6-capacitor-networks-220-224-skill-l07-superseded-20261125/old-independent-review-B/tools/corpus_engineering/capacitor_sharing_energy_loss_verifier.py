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
CANDIDATE_REF='ff9f3090a3523db3728fc3c398165b24d17921bb'
PRIMARY_SHA256='08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58'
FAMILY='capacitor-sharing-energy-loss'
BATCH='capacitor-sharing-energy-loss-224'
ASSET_NAME='capacitor-sharing-energy-loss-progressive.svg'
REVIEWED_PACKAGE_SHA256='3290115edf3ce88cac12fed2153f6e35e27c3426af14e9785657ee84ba482bd1'
REVIEWED_BINDINGS_SHA256='51eed2f4f883175b764ec1145fd9599b31ea3d7800f7c738761552a47db15470'
SOURCE_REFERENCE='Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.'
FALSE_PROOF='La diminuzione positiva dell’energia del campo significa che energia totale è distrutta nel collegamento.'
SVG_MUTATION=(b'width="400"', b'width="401"')
EXPECTED_MAPPING={1: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 2: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 3: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 4: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 5: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 6: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 7: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 8: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 9: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 10: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 11: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 12: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 13: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 14: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 15: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07']), 16: ('C4-L07', ['C1-L001', 'C1-L007', 'C4-L01', 'C4-L03', 'C4-L04', 'C4-L07'])}
NUMERIC_UNITS={1: 'μJ', 5: 'V', 6: 'V', 14: 'V'}
OPTION_SUFFIX={7: '', 8: ' μJ', 11: '', 12: ' μJ', 13: '', 15: ' V', 16: ' V'}
UNITS={1: 'microjoule', 2: 'joule', 3: 'joule', 4: 'joule', 5: 'volt', 6: 'volt', 7: 'dimensionless', 8: 'microjoule', 9: 'volt', 10: 'dimensionless', 11: 'dimensionless', 12: 'microjoule', 13: 'dimensionless', 14: 'volt', 15: 'volt', 16: 'volt'}
MANUAL=['I condensatori hanno identica capacità C e tensioni concordi V₁>V₂>0. La carica totale impone V_f=(V₁+V₂)/2. Sottraendo U_f=C(V₁+V₂)²/4 da U_i=C(V₁²+V₂²)/2 ottengo ΔU=C(V₁−V₂)²/4. Con C=1 μF, 4 e 2 V, ΔU=1 μJ; U_i=10 μJ e U_f=9 μJ. La diminuzione del campo è trasferita in altre forme, non energia totale distrutta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Una diminuzione di energia si misura in joule. F·V²=(C/V)V²=C·V=J; usando μF e V il numero è in μJ. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La legge è ΔU=C(V₁−V₂)²/4. Deriva insieme dalla conservazione della carica e dalla differenza fra energie iniziale e finale, non da conservazione dell’energia elettrostatica. Il generatore non alimenta la redistribuzione. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Portare V₁ da 4 a 6 V con V₂=2 V raddoppia il divario da 2 a 4 V. La diminuzione di energia cresce da 1 a 4 μJ perché dipende dal quadrato del divario, non dal solo valore di V₁. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da (V₁−V₂)²=4ΔU/C scelgo V₁−V₂=+2√(ΔU/C), imposto dall’ordine V₁>V₂. Quindi V₁=V₂+2√(ΔU/C)=2+2=4 V. Il ramo negativo darebbe 0 V e contraddirebbe le ipotesi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Per ricavare V₂ scelgo V₂=V₁−2√(ΔU/C)=4−2=2 V. Occorre 0<ΔU<C V₁²/4 affinché 0<V₂<V₁; al bordo superiore V₂ sarebbe zero, escluso. Il segno più imporrebbe V₂>V₁. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con V₁=4 V e V₂, B=1 V, il divario è 3 V e ΔU_B=9/4 μJ. Dividendo per ΔU_A=1 μJ si ottiene 9/4. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La proposta 2 μJ meno il risultato 1 μJ produce +1 μJ. Si conserva il segno dello scarto secondo la definizione del quesito. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'L’inversa è V₁=V₂+2√(ΔU/C). La radice ha unità volt perché ΔU/C ha unità V²; il ramo positivo del divario è scelto dalla condizione V₁>V₂>0, non solo dalla possibilità algebrica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto vale [(κ₁V₁−κ₂V₂)/(V₁−V₂)]². I due confronti devono rispettare V₁>V₂>0 e κ₁V₁>κ₂V₂>0: fattori singolarmente positivi non garantiscono l’ordine. Il denominatore non è nullo; l’uguaglianza delle tensioni è fuori dominio del rapporto assegnato. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'In A il divario è 2 V e ΔU_A=1 μJ; in B 8−4=4 V e ΔU_B=4 μJ. Il rapporto è 4. È raddoppiato il divario, non soltanto una capacità. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La media delle uscite è (1+4)/2=5/2 μJ. Le tensioni medie 6 e 3 V danno invece 9/4 μJ. La differenza è 1/4 μJ: il quadrato rende la legge non lineare. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto 4 fissa ΔU_B=4 μJ, quindi il divario positivo è 2√4=4 V. Con V₁, B=8 V ottengo V₂, B=4 V e il fattore rispetto ai 2 V di A è 2. Il ramo opposto violerebbe l’ordine. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La taratura proporzionale è a=3 μJ⁻¹. D_B=12 indica ΔU_B=4 μJ; il divario è 4 V. Con V₂, B=4 V risulta V₁, B=8 V, unica soluzione ordinata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dai riferimenti 1 μJ→3 e 4 μJ→9 si trova a=2 μJ⁻¹ e b=1. D_C=3/2 dà ΔU_C=(3/2−1)/2=1/4 μJ. Il divario è 2√(1/4)=1 V e V₂, C=1 V implica V₁, C=2 V. Tutti i passaggi sono esatti e non richiedono approssimare una radice. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con V₁=2 V₂, il divario è V₂ e ΔU=C V₂²/4. Il dato 1 μJ con C=1 μF dà V₂²=4 V². Scelgo V₂=2 V e V₁=4 V perché entrambe devono essere positive e ordinate. La radice negativa non è un’altra preparazione ammessa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Due μJ raddoppia il saldo. Nove e dieci μJ sono energie finale e iniziale, non la differenza. −1 μJ è invece U_f−U_i, definizione di segno opposta.', 'W è energia per tempo; C, F e V sono carica, capacità e tensione. Capacità per tensione al quadrato dà energia, senza divisione per una durata.', 'Denominatore due raddoppia L. Il quadrato della somma dà U_f, la differenza dei quadrati darebbe 3 μJ nel caso 4 e 2 V. Una sola potenza della differenza dà carica, non energia.', 'Due μJ usa dipendenza lineare dal divario. 3/2 μJ segue soltanto V₁; uno non aggiorna, nove non è il saldo. È il divario a raddoppiare da 2 a 4 V.', 'Due V copia il divario, zero usa il ramo che viola V₁>V₂; sei V darebbe L=4 μJ. Il ramo è fissato dall’ordine delle due tensioni.', 'Sei V ha lo stesso divario in modulo ma scambia l’ordine. Quattro V rende L nullo; zero V raggiunge il limite superiore di L e non è positivo. Solo due V soddisfa misura e dominio.', '4/9 reciproco, 1/2 segue la sola V₂, due il suo reciproco, uno ignora. Il divario diventa 3 V e non 1 V.', '−1 μJ scambia l’ordine dello scarto, due μJ copia proposta, zero la accetta. Due puro è un rapporto, non differenza di energie.', 'La radice negativa viola V₁>V₂; radice senza V₂ ricava soltanto il divario. Senza radice si sommano V² e V, e il dimezzamento finale non segue dall’equazione.', 'Rapporto semplice omette quadrato. Prodotto dei fattori e loro quoziente non scalano una differenza con due pesi; ultimo rapporto è inverso. Entrambi gli ordini positivi sono necessari.', 'Due segue il divario linearmente; un quarto è reciproco, un mezzo scala inversamente e uno ignora il divario raddoppiato. Il saldo quadruplica.', '9/4 μJ usa gli ingressi medi, cinque somma le uscite, 3/2 è semidifferenza, quattro ripete B. Il saldo medio non è energia finale del campo.', 'Un mezzo è reciproco, quattro copia il fattore dei saldi, 3/2 non dà il divario richiesto. Uno lascia V₂, B=2 V e produrrebbe L_B=9 μJ, non quattro.', 'Quattro V confonde divario o V₂ con V₁ e dà saldo nullo. Dodici V produce L=16 μJ e D=48, sei V produce L=1 μJ e D=3.', '(1+√3) V omette l’offset e usa L=3/4 μJ; un V dà saldo nullo, tre V dà D=3, quattro V dà D=11/2. Le unità sono applicate all’intera somma parentetizzata.', 'Quattro V è la tensione maggiore della soluzione. −2 V viola positività; un V dà L=1/4 μJ. Il dato assoluto di energia fissa la scala lasciata libera dal solo rapporto.']
ASSUMPTIONS=['Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.', 'Due condensatori lineari identici da 1 μF, tensioni iniziali ordinate V₁>V₂>0 e polarità concordi. Generatori scollegati e resistenza positiva per il transitorio; induttanza e radiazione trascurate nel modello concentrato. La carica si conserva sul nodo, non l’energia del solo campo: L=U_i−U_f>0 viene convertita in calore. Le scalature mantengono l’ordine in entrambe le prove. L’inversa per V₂ richiede il limite stretto L<C V₁²/4. Medie statistiche e display continui, radici fisiche positive.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o vincolo riconosciuti nel contesto esplicito e motivati dalla carica e dai nodi; compito guidato, non richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; eventuale ramo fisico e limiti della misura.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-capacitor-sharing-energy-loss-06', 'AR-u6-capacitor-sharing-energy-loss-04', 'AR-u6-capacitor-sharing-energy-loss-03', 'AR-u6-capacitor-sharing-energy-loss-02', 'AR-u6-capacitor-sharing-energy-loss-01', 'AR-u6-capacitor-sharing-energy-loss-10', 'AR-u6-capacitor-sharing-energy-loss-11', 'AR-u6-capacitor-sharing-energy-loss-12', 'AR-u6-capacitor-sharing-energy-loss-13', 'AR-u6-capacitor-sharing-energy-loss-14', 'AR-u6-capacitor-sharing-energy-loss-16', 'AR-u6-capacitor-sharing-energy-loss-15', 'AR-u6-capacitor-sharing-energy-loss-05', 'AR-u6-capacitor-sharing-energy-loss-07', 'AR-u6-capacitor-sharing-energy-loss-09', 'AR-u6-capacitor-sharing-energy-loss-08'}
REVIEWED_CANDIDATES={'AR-u6-capacitor-sharing-energy-loss-01': '2d405ced5ed3f21fa3eaf408f430e346eaceb3529ab6d75ab0ad91644ee3c4bf', 'AR-u6-capacitor-sharing-energy-loss-02': '1fe13d90a360195f1b689422d420bc6f51fc2466d664ea6db607523f79402876', 'AR-u6-capacitor-sharing-energy-loss-03': 'ba0d3813e58f35125f5fc8cb047b01b6c75b01995745af7a92c773646de1d35c', 'AR-u6-capacitor-sharing-energy-loss-04': 'df10993e3cd7fb0e9a90a98023b7064b023e7f84ff05661c43d0c34e3fd12e19', 'AR-u6-capacitor-sharing-energy-loss-05': '46427b45bb707efa052c6c62344cc3d80f345cf706082a211767276b487e0c31', 'AR-u6-capacitor-sharing-energy-loss-06': 'dcfa1a038687a846d9ba33b16c1b58f3a8df33e35a2cb564b64f4cf9baa548a2', 'AR-u6-capacitor-sharing-energy-loss-07': 'e3e57a0aa6ed6abd7c2c92858d9c9cb277a85facff9b1656cff2b689cdb6c52e', 'AR-u6-capacitor-sharing-energy-loss-08': '020b018561c8878dd0eb44eb3211afd4eb99868e937a3aa56acb45f3f49a7855', 'AR-u6-capacitor-sharing-energy-loss-09': '1adf0cfaca29a84d30226d91a811733b0ef5cb279ebe7e9293e7e0108173bb94', 'AR-u6-capacitor-sharing-energy-loss-10': '791e7405319283a9db09f0b89a895facdd9bc32caa190026e70ce72630d51a46', 'AR-u6-capacitor-sharing-energy-loss-11': 'bfac6150e1fc8d41060a2a654917759d9a8fd7a355bb15563ccf7f3bec5bd15b', 'AR-u6-capacitor-sharing-energy-loss-12': '486939805ff496956882c26bfd2fb58d3ec60fd653ca816806aa40d783cdbaae', 'AR-u6-capacitor-sharing-energy-loss-13': '1a59383d0c27fde0f03362e87dc6459220b93c417ce7f7ded793dc3f89c2c287', 'AR-u6-capacitor-sharing-energy-loss-14': '7f6dadb51325a0bb91a4858dab94ce3536769ff4815ddf5b982f380ed2c051cd', 'AR-u6-capacitor-sharing-energy-loss-15': '387c17bb698d604be5d3d737cac5a937d22f793944f1ebcdee7d50e17d2b3c19', 'AR-u6-capacitor-sharing-energy-loss-16': '9a0bf7c7740cda0ef72df7514be64c15a8c4bb8007f3a08977fa7381e1f2f798'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(610, 1), Fraction(400, 1), Fraction(44, 1)), (Fraction(150, 1), Fraction(765, 1), Fraction(360, 1), Fraction(44, 1)), (Fraction(510, 1), Fraction(765, 1), Fraction(40, 1), Fraction(44, 1)), (Fraction(150, 1), Fraction(1170, 1), Fraction(80, 1), Fraction(44, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1650, 1)), (Fraction(150, 1), Fraction(1280, 1), Fraction(320, 1), Fraction(44, 1)), (Fraction(150, 1), Fraction(1390, 1), Fraction(200, 1), Fraction(44, 1))}
REQUIRED_PATHS={'M110 230V350M530 230V350', 'M110 230H290M310 230H530', 'M110 350H290M310 350H530', 'M32 999H608', 'M32 473H608', 'M150 1140V1480', 'M310 205V255', 'M290 205V255', 'M290 325V375', 'M310 325V375'}
REQUIRED_CIRCLES={(Fraction(110, 1), Fraction(230, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(350, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(230, 1), Fraction(4, 1)), (Fraction(530, 1), Fraction(350, 1), Fraction(4, 1))}
REQUIRED_LINES=set()
GEOMETRY_REVIEW='XML, PNG autore e nuovo native indipendente completo 640×1650 letti; quest’ultimo è terminato realmente exit 0 senza interventi o interruzioni. Circuito finale con due rami da 1 μF, ciascuno con 3 μC sul nodo A e tensione comune 3 V. Bilancio centrale: barra iniziale 10 μJ lunga 400; finale campo 9 μJ lungo 360 più calore 1 μJ lungo 40, scala 40 coordinate/μJ. Ultime conversioni 1/4/5/2 μJ in barre 80/320/200 da x 150, scala 80 coordinate/μJ. Origini e label non attraversate da assi, grandezze e scale dei due pannelli distinte.'
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
    for suffix in (' μF',' μC',' μJ',' F',' mA',' W',' J',' s',' Ω',' V',' A',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=map(_finite_exact,(first,second))
    if not first>second>0:raise ValueError('Finite voltages must satisfy first>second>0')
    return (first-second)**2/4

def inverse_first(loss,second):
    loss,second=map(_finite_exact,(loss,second))
    if min(loss,second)<=0:raise ValueError('Positive finite loss and lower voltage required')
    return second+2*sp.sqrt(loss)

def inverse_second(loss,first):
    loss,first=map(_finite_exact,(loss,first))
    if first<=0 or not 0<loss<first**2/4:raise ValueError('Strict upper loss bound required for positive lower voltage')
    return first-2*sp.sqrt(loss)

def scaled(first,second,k1,k2):
    first,second,k1,k2=map(_finite_exact,(first,second,k1,k2))
    if min(k1,k2)<=0:raise ValueError('Positive finite scaling factors required')
    return sp.cancel(result(k1*first,k2*second)/result(first,second))

def constrained_second(loss):
    loss=_finite_exact(loss)
    if loss<=0:raise ValueError('Positive finite energy loss required')
    return 2*sp.sqrt(loss)

@lru_cache(maxsize=1)
def oracle():
    capacitance,high,low,loss=sp.symbols('C V1 V2 L',positive=True)
    final_voltage=(high+low)/2
    initial_energy=capacitance*(high**2+low**2)/2
    final_energy=capacitance*final_voltage**2
    assert sp.expand(initial_energy-final_energy-capacitance*(high-low)**2/4)==0
    roots=sp.solve(sp.Eq(loss,(high-low)**2/4),high)
    assert any(sp.simplify(root-(low+2*sp.sqrt(loss)))==0 for root in roots)
    roots=sp.solve(sp.Eq(loss,(high-low)**2/4),low)
    assert any(sp.simplify(root-(high-2*sp.sqrt(loss)))==0 for root in roots)
    first=result(4,2);second=result(8,4);assert (first,second)==(1,4)
    before=(SI.Quantity(1,'microfarad')*(SI.Quantity(4,'volt')**2+SI.Quantity(2,'volt')**2)/2).to('microjoule')
    after=(SI.Quantity(2,'microfarad')*SI.Quantity(3,'volt')**2/2).to('microjoule')
    assert before.magnitude==10 and after.magnitude==9 and (before-after).magnitude==1
    fit=calibrate(first,second,3,12,3,9,sp.Rational(3,2),'microjoule');assert fit==(3,1,4,sp.Rational(1,4))
    assert result(6,3)==sp.Rational(9,4)
    assert constrained_second(1)==2
    return [first,'J','L = C (V₁ − V₂)² / 4','Da 1 a 4 μJ',inverse_first(first,2),inverse_second(first,4),scaled(4,2,1,sp.Rational(1,2)),2-first,'V₁ = V₂ + √(4 L / C)','(Δ_B / Δ)²',second/first,(first+second)/2,inverse_second(4*first,8)/2,inverse_first(fit[2],4),inverse_first(fit[3],1),constrained_second(first)]
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
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
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
