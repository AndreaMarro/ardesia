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
CANDIDATE_REF='31face2d00ff2aa172edef0f5ff3f5e58e16dc1c'
PRIMARY_SHA256='51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C4.json', 'sourceSha256': '19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c', 'primarySkills': ['C4-L09'], 'actualLessonPrerequisites': {'C4-L09': ['C4-L02', 'C4-L05'], 'C4-L10': ['C4-L05', 'C4-L09']}, 'specialCasePrimarySkill': {}}
FAMILY='magnetic-orbit-period'
BATCH='magnetic-orbit-period-233'
ASSET_NAME='magnetic-orbit-period-progressive.svg'
REVIEWED_PACKAGE_SHA256='9fe3b66cc2ceb9377e9fcacf205ed5317ecde3133803fea74aa8e06b19a6b410'
REVIEWED_BINDINGS_SHA256='a0f39a1cfc3340c5bd7f4e14d841f14e96cc06011e65519471d60888f8c006e8'
SOURCE_REFERENCE='Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.'
FALSE_PROOF='Il tempo ridotto τ coincide con il periodo completo T_orbita perché il fattore due pi greco è trascurabile.'
SVG_MUTATION=(b'width="80"', b'width="81"')
SVG_LABEL_MUTATION=(b'T = \xcf\x80 s', b'T = 2\xcf\x80 s')
EXPECTED_MAPPING={1: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 2: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 3: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 4: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 5: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 6: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 7: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 8: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 9: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 10: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 11: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 12: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 13: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 14: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 15: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 16: ('C4-L09', ['C1-L001', 'C1-L002', 'C1-L003', 'C1-L004', 'C1-L005', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09'])}
NUMERIC_UNITS={5: 'mg', 6: 'T', 14: 'mg', 15: 'mg'}
OPTION_SUFFIX={1: ' s', 7: '', 8: ' s', 11: '', 12: ' s', 13: ''}
UNITS={1: 'second', 2: 'second', 3: 'meter/second', 4: 'second', 5: 'milligram', 6: 'tesla', 7: 'dimensionless', 8: 'second', 9: 'kilogram', 10: 'dimensionless', 11: 'dimensionless', 12: 'second', 13: 'dimensionless', 14: 'milligram', 15: 'milligram', 16: 'dimensionless'}
MANUAL=['Dalla forza centripeta si ha r=mv/(|q|B); dividendo la circonferenza 2πr per v si ottiene T_orbita=2πm/(|q|B). La variabile richiesta è τ=T_orbita/(2π)=m/(|q|B). Con m=10⁻⁶ kg, |q|=10⁻⁶ C e B=2 T, τ=1/2 s; il periodo completo è π s.', 'Il divisore 2π è adimensionale, quindi τ conserva la dimensione temporale del periodo e si esprime in secondi. Da m/(|q|B), usando T=kg/(C·s), si recupera s.', 'Questa domanda autonoma riguarda un elettrone lanciato esattamente parallelo al campo, non il moto perpendicolare della famiglia numerica. Il prodotto vettoriale v×B è nullo e la forza magnetica è zero anche se la carica è negativa. Nel modello senza altri campi il moto resta rettilineo uniforme parallelo a B; non esiste un’orbita circolare finita a cui applicare il periodo della famiglia.', 'A |q| e B fissi τ è proporzionale a m. La massa passa da 1 a 3 mg, quindi τ passa da 1/2 a 3/2 s, triplicando. Il periodo completo cambia con lo stesso fattore, ma non coincide con τ.', 'Da τ=m/(|q|B) ricavo m=|q|Bτ. La sostituzione (1 μC)(2 T)(1/2 s)=1 μC·T·s=10⁻⁶ kg=1 mg dà la massa positiva richiesta.', 'Isolo B=m/(|q|τ). Con m=1 mg, |q|=1 μC e τ=1/2 s risulta B=2 T. Le due potenze 10⁻⁶ di massa e carica si cancellano numericamente, non dimensionalmente.', 'Con massa fissata τ è inversamente proporzionale a B. Da 2 T a 1 T il valore passa da 1/2 s a 1 s; il rapporto τ_B/τ_A è 2. Non si usa il rapporto diretto dei campi.', 'Il corretto τ è 1/2 s. La proposta 1 s sovrastima di 1−1/2=+1/2 s. Questo è lo scarto della variabile τ, non del periodo completo T_orbita.', 'Moltiplicando τ=m/(|q|B) per |q|B si ottiene m=|q|Bτ. Per i valori normalizzati m/(mg)=[B/(T)][τ/(s)], grazie a |q|=1 μC. Omettere |q| nella legge delle grandezze fisiche produrrebbe dimensioni errate.', 'Nel rapporto fra prove |q| resta uguale; τ_B/τ_A=(κ₁m)/(κ₂B) diviso m/B=κ₁/κ₂. Le due prove restano perpendicolari e non relativistiche. Il fattore 2π non compare perché è già separato nella definizione di τ.', 'A dà τ_A=1/2 s; B con m=2 mg e B=1 T dà τ_B=2 s. Il rapporto è 2/(1/2)=4. Il raddoppio della massa e il dimezzamento del campo moltiplicano entrambi τ per due.', 'La media delle due letture 1/2 s e 2 s è 5/4 s. Il modello agli ingressi medi m=3/2 mg e B=3/2 T darebbe invece 1 s. La differenza media delle uscite meno uscita agli ingressi medi è 1/4 s. Non si confonde questa media tra prove col periodo di una sola orbita.', 'Si impone τ_B=4·(1/2 s)=2 s con m_B=2 mg. Da B=m/(|q|τ) risulta B_B=1 T. Rispetto a B_A=2 T il rapporto richiesto è 1/2.', 'Il riferimento ha τ=1/2 s e S=3/2, quindi a=3 unità strumentali/s. La nuova lettura S=6 corrisponde a τ=2 s. Con B=1 T, m=|q|Bτ=2 mg. La taratura precede l’inversione fisica.', 'I riferimenti sono (τ, S)=(1/2 s, 2) e (2 s, 5). La pendenza è (5−2)/(2−1/2)=2 unità strumentali/s e l’offset è 1. S_C=4 dà τ_C=(4−1)/2=3/2 s. Con B_C=2 T si ricava m_C=3 mg.', 'Il vincolo dimensionato m=(1/2 mg/T)B rende m/(|q|B)=1/2 s identicamente. La misura di τ non aggiunge un’equazione indipendente: esistono infinite coppie continue positive, per esempio (B, m)=(2 T, 1 mg) e (1 T, 1/2 mg). Si possono scegliere velocità perpendicolari non relativistiche; non si impongono conteggi interi a masse o campi.']
DISTRACTORS=['Un s ignora il campo 2 T; due s moltiplica anziché dividere per B; un quarto aggiunge un fattore due e zero viola masse e campi finiti positivi. Il periodo completo èπ s, nonτ.', 'Hz è inverso di tempo; m e T sono lunghezza e campo. Dividere per 2π non elimina l’unità secondo.', 'Cerchio o elica a raggio non nullo richiedono v_perp non nulla, esclusa dal prompt. Forza nulla non ferma una velocità iniziale e non aumenta la rapidità. Il segno negativo della carica non cambia il prodotto vettoriale nullo.', '1/6 s inverte la dipendenza da m; 9/2 applica il quadrato del fattore tre; 1/2 ignora la nuova massa e 3 s omette B 2 T. Si confrontano particelle preparate, non masse variabili nel tempo.', 'Un mezzo mg copia τ e darebbe 1/4 s; due mg omette il numero 1/2 diτ e dà 1 s. Omettere micro nella carica sovrastima la massa di 10⁶.', 'Un mezzo T moltiplica m perτ nei numeri, un T ignoraτ. Sostituire il periodo completo al tempo ridotto senza 2π cambia la legge.', 'Un mezzo segue direttamente B; quattro ne usa il quadrato, uno ignora la differenza e zero è escluso dal dominio positivo.', '−1/2 s inverte lo scarto; due è rapporto puro e un s copia proposta. Zero la accetta. Lo scarto conserva la dimensione temporale.', 'τ/(|q|B) ha s²/kg, |q|B/τ kg/s², Bτ/|q| kg/C².2π|q|Bτ ha la dimensione giusta ma introduce un fattore non previsto dalla definizione diτ.', 'Il prodotto rende diretta la dipendenza dal campo; il reciproco scambia A/B e il quadrato di massa cambia la legge. La somma dei fattori vale due per stati identici.', 'Un quarto inverte il confronto. Due segue un solo fattore e un mezzo copia B_B/B_A senza invertirlo. Uno confonde due effetti che si rinforzano con una compensazione.', 'Un s usa gli ingressi medi; 5/2 s somma senza mediare; 3/4 è semidifferenza. Zero non è una media di tempi positivi. Per il periodo completo medio servirebbe anche 2π.', 'Due inverte il campo richiesto; quattro copia il bersaglio temporale e uno mantiene il campo. Un quarto impone B_B 1/2 T eτ_B 4 s, non 2 s.', 'Sei mg tratta D 6 come 6 s e predice D 18. Un mezzo mg copiaτ_A e predice D 3/2 con B_B 1 T. Un mg ignora la preparazione nuova.', 'Quattro mg omette b e predice D 5; sei mg sottrae b ma salta a. Mezzo mg riusa un numero del riferimento senza decodificare C. Tre mg ricomponeτ_C 3/2 s eD 4.', 'Il campo si cancella nel rapporto imposto. Non nasce una quadratica con due radici e non è richiesto B intero. Le due coppie d’esempio non esauriscono il continuo delle possibilità.']
ASSUMPTIONS=['Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Elettrone con velocità iniziale non nulla esattamente parallela a B uniforme e statico, nessun campo elettrico o altra forza, radiazione trascurata. Non si ereditano perpendicolarità, |q|=1 μC o massa in mg degli altri quesiti. Forza nulla e velocità costante; nessun periodo di orbita circolare.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.', 'Modulo della carica 1 μC, massa positiva in mg, B uniforme positivo, velocità non nulla perpendicolare e regime non relativistico. Nessuna altra forza e radiazione trascurata. τ=T_orbita/(2π) è un tempo ridotto e non il periodo completo; masse diverse sono preparazioni distinte. Caso 03 autonomo: elettrone esattamente parallelo, forza nulla e moto rettilineo uniforme; non si applica il periodo di un cerchio inesistente. Vincolo 16 fissa m/B e lascia infinite coppie positive, non intere per necessità.']
PEDAGOGY=['Legge motivata prima della sostituzione, unità e variabile richiesta distinte.', 'Dimensione ricavata indipendentemente e prefissi distinti dalla dimensione fisica.', 'Legge fisica o caso autonomo riconosciuto dalle sue ipotesi, senza ereditare dati estranei.', 'Confronto controllato a parametro fissato, non evoluzione dinamica inventata.', 'Prima inversa ricavata e reinserita nella legge diretta.', 'Seconda inversa con denominatori positivi e distinzione fra modulo e verso.', 'Due uscite ricostruite prima del rapporto adimensionale.', 'Ordine dello scarto preservato, separato dal rapporto puro.', 'Inversa simbolica con coefficienti dimensionali espliciti.', 'Fattori inseriti nella legge effettiva prima di semplificare.', 'Entrambi gli ingressi nuovi considerati, senza inferenza da un solo cambiamento.', 'Media delle uscite distinta da modello agli ingressi medi e da media temporale.', 'Bersaglio quantitativo ricostruito prima dell’inversa e del rapporto richiesto.', 'Guadagno del display rimosso prima dell’inversa fisica.', 'Due riferimenti distinti ricostruiscono guadagno e offset senza arrotondamenti.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala continua.']
EXPECTED_IDS={'AR-u6-magnetic-orbit-period-06', 'AR-u6-magnetic-orbit-period-08', 'AR-u6-magnetic-orbit-period-13', 'AR-u6-magnetic-orbit-period-04', 'AR-u6-magnetic-orbit-period-01', 'AR-u6-magnetic-orbit-period-02', 'AR-u6-magnetic-orbit-period-07', 'AR-u6-magnetic-orbit-period-12', 'AR-u6-magnetic-orbit-period-16', 'AR-u6-magnetic-orbit-period-09', 'AR-u6-magnetic-orbit-period-05', 'AR-u6-magnetic-orbit-period-15', 'AR-u6-magnetic-orbit-period-03', 'AR-u6-magnetic-orbit-period-14', 'AR-u6-magnetic-orbit-period-11', 'AR-u6-magnetic-orbit-period-10'}
REVIEWED_CANDIDATES={'AR-u6-magnetic-orbit-period-01': '160e10f2b294be13284abcaf9b8d57870515da84d45af6bcda7b66ceb4ec042b', 'AR-u6-magnetic-orbit-period-02': '190debce429fa809aaf29524b1c4c09f4bfc2aa0b723272385b742db758f510e', 'AR-u6-magnetic-orbit-period-03': '3e2de09dea4e4f82cc356cab81c7fee4d1e910f5404b79fde2fae8c5c3dc2e78', 'AR-u6-magnetic-orbit-period-04': '00023bac414000b75ff528d2558092f004445781e82810b9b3620854a36ba888', 'AR-u6-magnetic-orbit-period-05': '4ee3cc2312f170ca3938e1df44754919ce31014952f1e8c10306e5aeaadf6426', 'AR-u6-magnetic-orbit-period-06': '74954160d9d441d23acf46fe2a41d318ca191903ac2d0a373c74480f17bcc30d', 'AR-u6-magnetic-orbit-period-07': '8bdc0b7a75efef87b17f44e0a2ed7e7a58b8dbf2be2cea57165dee1ebc156cde', 'AR-u6-magnetic-orbit-period-08': 'ce74f982f5c8b6027f3d808e6ef5517bd1edcee457f59833ccacc1232ca7aa03', 'AR-u6-magnetic-orbit-period-09': 'dc0b956b9885cbd008798b52b49195b8bfaa6c50d1e46c6fd66d9ae0ffbc039a', 'AR-u6-magnetic-orbit-period-10': '9437074fa7023b568b780eb5c8ab9ac5a630384291cf874454cb5bd8598999d3', 'AR-u6-magnetic-orbit-period-11': '8c567e964ae51f93ae1bcaf4910082780545c6f0730697b0f185080076c014c7', 'AR-u6-magnetic-orbit-period-12': 'f055ee29d88e79a6cd7d2f3b34cf04cce4c624172b2327f78ec59c5ff96f52e1', 'AR-u6-magnetic-orbit-period-13': '649949c61209891bc1d1b9b088c75f584b7a5c8a51094e808ed3af282f5ce3e2', 'AR-u6-magnetic-orbit-period-14': 'a161a519f97ad81a549586720f41f6e56abc03847851c21cd9a2db540708146a', 'AR-u6-magnetic-orbit-period-15': '260295adf84aaaa4a84afe83635972a8893f73d2d964c1bc805f37abf6607ca0', 'AR-u6-magnetic-orbit-period-16': '263685d0e1f67576c47970d6e095437e6a160118fd8d65e58b862975df8e6870'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(830, 1), Fraction(200, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(740, 1), Fraction(320, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(650, 1), Fraction(80, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z', 'M320 200A80 80 0 1 0 400 280'}
REQUIRED_CIRCLES={(Fraction(470, 1), Fraction(1240, 1), Fraction(5, 1)), (Fraction(320, 1), Fraction(280, 1), Fraction(80, 1)), (Fraction(310, 1), Fraction(1200, 1), Fraction(5, 1)), (Fraction(230, 1), Fraction(1120, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(320, 1), Fraction(360, 1), Fraction(450, 1), Fraction(360, 1)), (Fraction(150, 1), Fraction(1285, 1), Fraction(150, 1), Fraction(1030, 1)), (Fraction(145, 1), Fraction(1280, 1), Fraction(520, 1), Fraction(1280, 1))}
REQUIRED_SVG_TEXTS=('Il tempo di un’orbita magnetica', '1 · Periodo completo e tempo ridotto', 'm = 1 mg · |q| = 1 μC · B = 2 T', 'v', 'Un giro completo: T = π s', 'Tempo ridotto: τ = T/(2π) = 1/2 s', 'Il cerchio è schematico: il raggio non è dato.', '2 · Due preparazioni e la media', 'A: 1 mg, 2 T · B: 2 mg, 1 T', 'A', '1/2 s', 'B', '2 s', 'Media', '5/4 s', 'Barre di τ alla stessa scala; T = 2πτ.', '3 · Stessa massa e carica', '0', 'B (T)', 'τ (s)', '1', '1', '2', '1/2', '4', '1/4', 'Punti distinti, senza interpolazione lineare.', 'L’origine è degli assi: B = 0 non è ammesso.')
GEOMETRY_REVIEW='XML e PNG indipendente completo 640×1480 letti. Cerchio schematico, rapidità tangente e freccia di rotazione coerenti; nessun raggio numerico implicito. Etichette distinguono T=π s eτ=1/2 s. Barre da x 150 lunghe 80/320/200 rappresentanoτ1/2/2/5/4 s a scala 160 coordinate/s. Ultimi tre punti a massa 1 mg hanno origine(150, 1280), 80 coordinate/T e 160 coordinate/s, perτ1/1/2/1/4 s ai B 1/2/4 T. No interpolazione e B 0 escluso.'
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

def result(mass, field):
    """m in mg, B in T, |q|=1 microC; output tau=T/(2pi) in s."""
    mass=_finite_exact(mass,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(mass/field)
def inverse_first(tau, field):
    tau=_finite_exact(tau,positive=True);field=_finite_exact(field,positive=True)
    return sp.simplify(tau*field)
def inverse_second(tau, mass):
    tau=_finite_exact(tau,positive=True);mass=_finite_exact(mass,positive=True)
    return sp.simplify(mass/tau)
def scaled(mass, field, k1, k2):
    mass=_finite_exact(mass,positive=True);field=_finite_exact(field,positive=True)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True)
    return sp.simplify(k1/k2)
def full_period(tau):
    tau=_finite_exact(tau,positive=True)
    return 2*sp.pi*tau
def constrained_mass(field):
    field=_finite_exact(field,positive=True)
    return field/2

@lru_cache(maxsize=1)
def oracle():
    mass,charge,speed,field=sp.symbols('mass charge speed field',positive=True)
    radius=mass*speed/(charge*field);period=sp.simplify(2*sp.pi*radius/speed)
    assert period==2*sp.pi*mass/(charge*field)
    physical=(SI.Quantity(1,'milligram')/(SI.Quantity(1,'microcoulomb')*SI.Quantity(2,'tesla'))).to('second')
    first=result(1,2);second=result(2,1);assert sp.sympify(physical.magnitude)==first==sp.Rational(1,2) and second==2
    assert full_period(first)==sp.pi
    # Source03 is independent: parallel velocity has no Lorentz force, even for an electron.
    assert sp.Matrix([0,0,2]).cross(sp.Matrix([0,0,3]))==sp.zeros(3,1)
    fit=calibrate(first,second,sp.Rational(3,2),6,2,5,4,'second');assert fit==(3,1,2,sp.Rational(3,2))
    assert result(sp.Rational(3,2),sp.Rational(3,2))==1
    assert result(constrained_mass(3),3)==sp.Rational(1,2)
    expected=[first,'s','Prosegue in moto rettilineo uniforme parallelo al campo','Da 1/2 s a 3/2 s',inverse_first(first,2),inverse_second(first,1),result(1,1)/first,1-first,'m = |q| B τ','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(4*first,2)/2,inverse_first(fit[2],1),inverse_first(fit[3],2),'Infinite coppie positive']
    for n,value in {5:1,6:2,7:2,8:sp.Rational(1,2),11:4,12:sp.Rational(5,4),13:sp.Rational(1,2),14:2,15:3}.items():assert sp.simplify(expected[n-1]-value)==0
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
