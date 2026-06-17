
======================================================================
  GALILEO BRAIN TEST REPORT
  Model: galileo-brain
  Date: 2026-03-07 13:21:01
======================================================================

  OVERALL: 23/120 (19.2%) — Grade: F
  JSON Valid: 120/120 (100.0%)
  Avg Latency: 6160ms

  CATEGORY                   PASS TOTAL     PCT  BAR
  ------------------------------------------------------------
  action                        1    41    2.4%  [--------------------]
  circuit                       0    16    0.0%  [--------------------]
  code                          3     8   37.5%  [+++++++-------------]
  edge                          4    18   22.2%  [++++----------------]
  navigation                    0    12    0.0%  [--------------------]
  tutor                        13    14   92.9%  [++++++++++++++++++--]
  vision                        2    11   18.2%  [+++-----------------]

  METRICS:
  Intent accuracy:       72/120 (60.0%)
  Action accuracy:       47/120 (39.2%)
  needs_llm accuracy:    97/120 (80.8%)
  Response non-empty:   120/120 (100.0%)
  Hint non-empty:       120/120 (100.0%)

  LATENCY:
  Min: 2801ms | P50: 4476ms | P95: 11437ms | Max: 111524ms

  FAILED TESTS (97):
  ------------------------------------------------------------
  E001 [action/play]:
    Input:   Avvia la simulazione
    Reason:  ACTIONS:['[AZIONE:avviaSimulator]']!=['[AZIONE:play]']
    Got:     intent=action, actions=['[AZIONE:avviaSimulator]'], needs_llm=False
  E002 [action/play]:
    Input:   Fai partire il circuito
    Reason:  ACTIONS:['[AZIONE:esperimento1-start]']!=['[AZIONE:play]']
    Got:     intent=action, actions=['[AZIONE:esperimento1-start]'], needs_llm=False
  E003 [action/play]:
    Input:   Start
    Reason:  ACTIONS:['[AZIONE:esperimento:start]']!=['[AZIONE:play]']
    Got:     intent=action, actions=['[AZIONE:esperimento:start]'], needs_llm=False
  E004 [action/play]:
    Input:   dai corrente
    Reason:  ACTIONS:['[AZIONE:voltage1]']!=['[AZIONE:play]']
    Got:     intent=action, actions=['[AZIONE:voltage1]'], needs_llm=False
  E005 [action/pause]:
    Input:   Ferma la simulazione
    Reason:  ACTIONS:['[AZIONE:stopSimulation]']!=['[AZIONE:pause]']
    Got:     intent=action, actions=['[AZIONE:stopSimulation]'], needs_llm=False
  E006 [action/pause]:
    Input:   Stop
    Reason:  ACTIONS:['[AZIONE:stop]']!=['[AZIONE:pause]']
    Got:     intent=action, actions=['[AZIONE:stop]'], needs_llm=False
  E008 [action/reset]:
    Input:   Resetta tutto
    Reason:  INTENT:navigation!=action
    Got:     intent=navigation, actions=['[AZIONE:reset]'], needs_llm=False
  E009 [action/reset]:
    Input:   ricomincia da capo
    Reason:  INTENT:navigation!=action
    Got:     intent=navigation, actions=['[AZIONE:reset]'], needs_llm=False
  E010 [action/clearall]:
    Input:   Cancella tutto dalla breadboard
    Reason:  ACTIONS:['[AZIONE:reset]']!=['[AZIONE:clearall]']
    Got:     intent=action, actions=['[AZIONE:reset]'], needs_llm=False
  E011 [action/clearall]:
    Input:   Svuota il circuito
    Reason:  ACTIONS:['[AZIONE:clear]']!=['[AZIONE:clearall]']
    Got:     intent=action, actions=['[AZIONE:clear]'], needs_llm=False
  E012 [action/clearall]:
    Input:   togli tutto
    Reason:  ACTIONS:['[AZIONE:reset]']!=['[AZIONE:clearall]']
    Got:     intent=action, actions=['[AZIONE:reset]'], needs_llm=False
  E013 [action/compile]:
    Input:   Compila il codice
    Reason:  INTENT:code!=action, ACTIONS:[]!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True
  E014 [action/compile]:
    Input:   verifica se funziona il programma
    Reason:  INTENT:code!=action, ACTIONS:[]!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True
  E015 [action/diagnose]:
    Input:   Cosa c'e che non va nel circuito?
    Reason:  ACTIONS:['[AZIONE:led1]']!=['[AZIONE:diagnose]']
    Got:     intent=action, actions=['[AZIONE:led1]'], needs_llm=False
  E016 [action/diagnose]:
    Input:   diagnostica i collegamenti
    Reason:  ACTIONS:['[AZIONE:checkConnections]']!=['[AZIONE:diagnose]']
    Got:     intent=action, actions=['[AZIONE:checkConnections]'], needs_llm=False
  E017 [action/quiz]:
    Input:   Fammi un quiz
    Reason:  INTENT:tutor!=action, ACTIONS:[]!=['[AZIONE:quiz]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=[], needs_llm=True
  E018 [action/quiz]:
    Input:   Testami sull'esperimento
    Reason:  INTENT:tutor!=action, ACTIONS:[]!=['[AZIONE:quiz]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=[], needs_llm=True
  E019 [circuit/single_placement]:
    Input:   Metti un LED sulla breadboard
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:led1]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:led1]'], needs_llm=False
  E020 [circuit/single_placement]:
    Input:   Aggiungi un resistore
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:resistor]']!=['[INTENT:*]']
    Got:     intent=code, actions=['[AZIONE:resistor]'], needs_llm=False
  E021 [circuit/single_placement]:
    Input:   Piazza un buzzer
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:buzzer1]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:buzzer1]'], needs_llm=False
  E022 [circuit/single_placement]:
    Input:   Voglio un condensatore
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:condensatore1]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:condensatore1]'], needs_llm=False
  E023 [circuit/single_placement]:
    Input:   metti un potenz
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:pot1]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:pot1]'], needs_llm=False
  E024 [circuit/single_placement]:
    Input:   inserisci fotoresistenza
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:photoresistor]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:photoresistor]'], needs_llm=False
  E025 [circuit/single_placement]:
    Input:   aggiungi un servo motore
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:aggiungi servo motore]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:aggiungi servo motore]'], needs_llm=False
  E026 [circuit/multi_component]:
    Input:   Costruisci un circuito con LED e resistore
    Reason:  ACTIONS:['[AZIONE:connect-led1-pin1-resistor1-pin2]', '[AZIONE:connect-resistor1-pin1-power1]', '[AZIONE:connect-resistor1-pin2-ground1]']!=['[INTENT:*]']
    Got:     intent=circuit, actions=['[AZIONE:connect-led1-pin1-resistor1-pin2]', '[AZIONE:connect-resistor1-pin1-power1]', '[AZIONE:connect-resistor1-pin2-ground1]'], needs_llm=False
  E027 [circuit/multi_component]:
    Input:   Metti un LED, un resistore e un pulsante
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:led1]', '[AZIONE:resistor1]', '[AZIONE:pushbutton1]']!=['[INTENT:*]']
    Got:     intent=action, actions=['[AZIONE:led1]', '[AZIONE:resistor1]', '[AZIONE:pushbutton1]'], needs_llm=False
  E028 [circuit/multi_component]:
    Input:   Costruisci il circuito del semaforo con 3 LED
    Reason:  ACTIONS:['[AZIONE:esp1-cap6-esp2]']!=['[INTENT:*]'], NEEDS_LLM:False!=True
    Got:     intent=circuit, actions=['[AZIONE:esp1-cap6-esp2]'], needs_llm=False
  E029 [circuit/wiring]:
    Input:   Collega il LED al pin D3
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect-led1-D3]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect-led1-D3]'], needs_llm=False
  E030 [circuit/wiring]:
    Input:   Metti un filo dall'anodo del LED a W_D5
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect led1-anodo W_D5]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect led1-anodo W_D5]'], needs_llm=False
  E031 [circuit/wiring]:
    Input:   Collega il catodo del LED a GND
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect-led1-catodo-GND]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect-led1-catodo-GND]'], needs_llm=False
  E032 [circuit/wiring]:
    Input:   connetti il resistore al bus positivo
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect resistor1 bus+]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect resistor1 bus+]'], needs_llm=False
  E033 [circuit/wiring]:
    Input:   collega pin1 del pushbutton a 5V
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect-pin1-to-bus1-5V]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect-pin1-to-bus1-5V]'], needs_llm=False
  E034 [navigation/loadexp]:
    Input:   Carica l'esperimento del primo LED
    Reason:  ACTIONS:['[NAVIGAZIONE:v1-cap6-esp1]']!=['[AZIONE:loadexp:*]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v1-cap6-esp1]'], needs_llm=False
  E035 [navigation/loadexp]:
    Input:   Apri il capitolo 7 esperimento 2
    Reason:  ACTIONS:['[NAVIGAZIONE:v1-cap7-esp2]']!=['[AZIONE:loadexp:*]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v1-cap7-esp2]'], needs_llm=False
  E036 [navigation/loadexp]:
    Input:   carica v1-cap8-esp3
    Reason:  ACTIONS:[]!=['[AZIONE:loadexp:v1-cap8-esp3]']
    Got:     intent=navigation, actions=[], needs_llm=False
  E037 [navigation/opentab]:
    Input:   Apri il simulatore
    Reason:  ACTIONS:['[NAVIGAZIONE:simulator]']!=['[AZIONE:opentab:simulator]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:simulator]'], needs_llm=False
  E038 [navigation/opentab]:
    Input:   Vai al manuale
    Reason:  ACTIONS:['[NAVIGAZIONE:v1-cap6-esp1]']!=['[AZIONE:opentab:manual]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v1-cap6-esp1]'], needs_llm=False
  E039 [navigation/opentab]:
    Input:   Mostrami i video
    Reason:  ACTIONS:['[NAVIGAZIONE:video]']!=['[AZIONE:opentab:video]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:video]'], needs_llm=False
  E040 [navigation/opentab]:
    Input:   Apri la lavagna
    Reason:  ACTIONS:['[NAVIGAZIONE:apri-whiteboard]']!=['[AZIONE:opentab:canvas]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:apri-whiteboard]'], needs_llm=False
  E041 [navigation/opentab]:
    Input:   apri editor
    Reason:  ACTIONS:['[NAVIGAZIONE:editor]']!=['[AZIONE:opentab:editor]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:editor]'], needs_llm=False
  E042 [navigation/openvolume]:
    Input:   Vai al volume 2
    Reason:  ACTIONS:['[NAVIGATION:volume2]']!=['[AZIONE:openvolume:2]']
    Got:     intent=navigation, actions=['[NAVIGATION:volume2]'], needs_llm=False
  E043 [navigation/openvolume]:
    Input:   Apri il volume 3
    Reason:  ACTIONS:['[NAVIGAZIONE:volume3]']!=['[AZIONE:openvolume:3]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:volume3]'], needs_llm=False
  E044 [code/compile]:
    Input:   Compila e verifica
    Reason:  INTENT:code!=action, ACTIONS:[]!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True
  E045 [code/setcode]:
    Input:   Scrivi il codice per accendere il LED sul pin 13
    Reason:  ACTIONS:[]!=['[AZIONE:setcode:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True
  E046 [code/setcode]:
    Input:   Programma il blink del LED
    Reason:  ACTIONS:[]!=['[AZIONE:setcode:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True
  E049 [code/scratch]:
    Input:   Apri l'editor a blocchi
    Reason:  INTENT:navigation!=code, NEEDS_LLM:False!=True
    Got:     intent=navigation, actions=['[NAVIGAZIONE:editor]'], needs_llm=False
  E051 [action/interact]:
    Input:   Premi il pulsante
    Reason:  ACTIONS:['[AZIONE:button1.press]']!=['[AZIONE:interact:*]']
    Got:     intent=action, actions=['[AZIONE:button1.press]'], needs_llm=False
  E052 [action/interact]:
    Input:   Accendi il LED
    Reason:  ACTIONS:['[AZIONE:led1-toggle]']!=['[AZIONE:interact:*]']
    Got:     intent=action, actions=['[AZIONE:led1-toggle]'], needs_llm=False
  E053 [action/interact]:
    Input:   Ruota il potenziometro a meta
    Reason:  ACTIONS:['[AZIONE:pot1-setPosition:0.5]']!=['[AZIONE:interact:*]']
    Got:     intent=action, actions=['[AZIONE:pot1-setPosition:0.5]'], needs_llm=False
  E054 [action/interact]:
    Input:   Spegni il LED
    Reason:  ACTIONS:['[AZIONE:led1-off]']!=['[AZIONE:interact:*]']
    Got:     intent=action, actions=['[AZIONE:led1-off]'], needs_llm=False
  E055 [action/highlight]:
    Input:   Dov'e il LED?
    Reason:  INTENT:navigation!=action, ACTIONS:[]!=['[AZIONE:highlight:*]']
    Got:     intent=navigation, actions=[], needs_llm=False
  E056 [action/highlight]:
    Input:   Evidenzia il resistore
    Reason:  INTENT:vision!=action, ACTIONS:[]!=['[AZIONE:highlight:*]']
    Got:     intent=vision, actions=[], needs_llm=False
  E057 [action/highlight]:
    Input:   Mostrami dov'e il buzzer
    Reason:  INTENT:navigation!=action, ACTIONS:[]!=['[AZIONE:highlight:*]']
    Got:     intent=navigation, actions=[], needs_llm=False
  E058 [action/measure]:
    Input:   Quanti volt ci sono sul LED?
    Reason:  ACTIONS:['[AZIONE:led1-voltage]']!=['[AZIONE:measure:*]']
    Got:     intent=action, actions=['[AZIONE:led1-voltage]'], needs_llm=False
  E059 [action/measure]:
    Input:   Misura la corrente nel circuito
    Reason:  ACTIONS:['[AZIONE:amperemeter]']!=['[AZIONE:measure:*]']
    Got:     intent=action, actions=['[AZIONE:amperemeter]'], needs_llm=False
  E060 [action/setvalue]:
    Input:   Cambia il resistore a 470 ohm
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:resistor1-value=470]']!=['[AZIONE:setvalue:*]']
    Got:     intent=code, actions=['[AZIONE:resistor1-value=470]'], needs_llm=False
  E061 [action/setvalue]:
    Input:   Metti la resistenza a 1K
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:resistor1-value=1000]']!=['[AZIONE:setvalue:*]']
    Got:     intent=code, actions=['[AZIONE:resistor1-value=1000]'], needs_llm=False
  E062 [action/movecomponent]:
    Input:   Sposta il LED piu a destra
    Reason:  INTENT:navigation!=action, ACTIONS:['[NAVIGAZIONE:led1]']!=['[AZIONE:movecomponent:*]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:led1]'], needs_llm=False
  E063 [action/movecomponent]:
    Input:   Metti il resistore in alto
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:resistor1-position:top]']!=['[AZIONE:movecomponent:*]']
    Got:     intent=navigation, actions=['[AZIONE:resistor1-position:top]'], needs_llm=False
  E064 [action/removewire]:
    Input:   Rimuovi il filo rosso
    Reason:  ACTIONS:['[AZIONE:removeWire:wire1]']!=['[AZIONE:removewire:*]']
    Got:     intent=action, actions=['[AZIONE:removeWire:wire1]'], needs_llm=False
  E065 [action/removewire]:
    Input:   Scollega il LED dalla breadboard
    Reason:  ACTIONS:['[AZIONE:disconnect-led1]']!=['[AZIONE:removewire:*]']
    Got:     intent=action, actions=['[AZIONE:disconnect-led1]'], needs_llm=False
  E066 [action/removecomponent]:
    Input:   Rimuovi il LED
    Reason:  ACTIONS:['[AZIONE:remove-led1]']!=['[AZIONE:removecomponent:*]']
    Got:     intent=action, actions=['[AZIONE:remove-led1]'], needs_llm=False
  E067 [action/removecomponent]:
    Input:   Togli il buzzer dal circuito
    Reason:  ACTIONS:['[AZIONE:remove buzzer1]']!=['[AZIONE:removecomponent:*]']
    Got:     intent=action, actions=['[AZIONE:remove buzzer1]'], needs_llm=False
  E068 [action/removecomponent]:
    Input:   Elimina il resistore
    Reason:  ACTIONS:['[AZIONE:removeComponent:resistor1]']!=['[AZIONE:removecomponent:*]']
    Got:     intent=action, actions=['[AZIONE:removeComponent:resistor1]'], needs_llm=False
  E069 [action/youtube]:
    Input:   Cerca un video sul LED
    Reason:  INTENT:navigation!=action, ACTIONS:[]!=['[AZIONE:youtube:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=[], needs_llm=True
  E070 [action/youtube]:
    Input:   Mostrami un tutorial sui resistori
    Reason:  INTENT:tutor!=action, ACTIONS:[]!=['[AZIONE:youtube:*]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=[], needs_llm=True
  E071 [action/createnotebook]:
    Input:   Crea un taccuino per questa lezione
    Reason:  ACTIONS:['[AZIONE:crea_taccuino]']!=['[AZIONE:createnotebook:*]']
    Got:     intent=action, actions=['[AZIONE:crea_taccuino]'], needs_llm=False
  E083 [tutor/off_topic]:
    Input:   Chi ha vinto la partita ieri?
    Reason:  INTENT:navigation!=tutor, NEEDS_LLM:False!=True
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v1-cap8-esp3]'], needs_llm=False
  E084 [vision/direct]:
    Input:   Cosa vedi nel mio circuito?
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E086 [vision/direct]:
    Input:   Analizza la mia breadboard
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E087 [vision/direct]:
    Input:   Controlla il mio lavoro
    Reason:  INTENT:code!=vision
    Got:     intent=code, actions=[], needs_llm=True
  E088 [vision/canvas]:
    Input:   Guarda cosa ho disegnato
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E089 [vision/canvas]:
    Input:   Analizza il mio schema
    Reason:  INTENT:action!=vision, NEEDS_LLM:False!=True
    Got:     intent=action, actions=['[AZIONE:analizza-schema]'], needs_llm=False
  E090 [vision/implicit]:
    Input:   E' corretto quello che ho fatto?
    Reason:  INTENT:tutor!=vision
    Got:     intent=tutor, actions=[], needs_llm=True
  E091 [vision/implicit]:
    Input:   Ho montato bene il circuito?
    Reason:  INTENT:action!=vision, NEEDS_LLM:False!=True
    Got:     intent=action, actions=['[AZIONE:check-circuit]'], needs_llm=False
  E092 [vision/debug]:
    Input:   Il LED non si accende, guarda il circuito
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E093 [edge/multi_intent]:
    Input:   Metti un LED, collegalo a D3 e avvia la simulazione
    Reason:  INTENT:action!=circuit
    Got:     intent=action, actions=['[AZIONE:led]'], needs_llm=False
  E094 [edge/multi_intent]:
    Input:   Aggiungi un buzzer e fallo suonare
    Reason:  INTENT:action!=circuit
    Got:     intent=action, actions=['[AZIONE:connect-buzzer]', '[AZIONE:activate-buzzer]'], needs_llm=False
  E096 [edge/typo]:
    Input:   aviva la simulazzione
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:avviaSimulator]']!=['[AZIONE:play]']
    Got:     intent=navigation, actions=['[AZIONE:avviaSimulator]'], needs_llm=False
  E097 [edge/ambiguous]:
    Input:   metti una lucina
    Reason:  INTENT:action!=circuit
    Got:     intent=action, actions=['[AZIONE:led1]'], needs_llm=False
  E098 [edge/ambiguous]:
    Input:   aggiungi un ronzatore
    Reason:  INTENT:action!=circuit
    Got:     intent=action, actions=['[AZIONE:buzzer1]'], needs_llm=False
  E099 [edge/negation]:
    Input:   Non avviare la simulazione
    Reason:  INTENT:navigation!=action
    Got:     intent=navigation, actions=[], needs_llm=False
  E100 [edge/conditional]:
    Input:   Se il circuito e' giusto, avvia la simulazione
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=action, actions=['[AZIONE:avviaSimulator]'], needs_llm=False
  E101 [edge/replacement]:
    Input:   Sostituisci il LED con un buzzer
    Reason:  INTENT:action!=circuit
    Got:     intent=action, actions=['[AZIONE:rimuovi-led1]', '[AZIONE:aggiungi-buzzer]'], needs_llm=False
  E102 [edge/quantity]:
    Input:   Metti 3 LED rossi
    Reason:  INTENT:code!=circuit
    Got:     intent=code, actions=['[AZIONE:led1]', '[AZIONE:led2]', '[AZIONE:led3]'], needs_llm=False
  E103 [edge/invalid_pin]:
    Input:   Collega il LED al pin D99
    Reason:  INTENT:action!=circuit, NEEDS_LLM:False!=True
    Got:     intent=action, actions=['[AZIONE:connect-led1-D99]'], needs_llm=False
  E105 [edge/bus_connection]:
    Input:   Collega il resistore al bus positivo
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect-resistor1-to-bus+]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect-resistor1-to-bus+]'], needs_llm=False
  E106 [edge/wing_pin]:
    Input:   Connetti al pin W_D10
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:connect-led1-W_D10]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:connect-led1-W_D10]'], needs_llm=False
  E107 [edge/partial_removal]:
    Input:   Rimuovi solo il resistore, lascia il LED
    Reason:  ACTIONS:['[AZIONE:removeComponent:resistor1]']!=['[AZIONE:removecomponent:*]']
    Got:     intent=action, actions=['[AZIONE:removeComponent:resistor1]'], needs_llm=False
  E108 [edge/empty_context]:
    Input:   Collega il LED
    Reason:  INTENT:action!=circuit, NEEDS_LLM:False!=True
    Got:     intent=action, actions=['[AZIONE:led1-connect]'], needs_llm=False
  E109 [navigation/loadexp]:
    Input:   voglio fare l'esperimento col pulsante
    Reason:  ACTIONS:['[NAVIGAZIONE:v1-cap6-esp2]']!=['[AZIONE:loadexp:*]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v1-cap6-esp2]'], needs_llm=False
  E110 [navigation/loadexp]:
    Input:   carica il primo esperimento del volume 2
    Reason:  ACTIONS:['[NAVIGAZIONE:v2-cap1-esp1]']!=['[AZIONE:loadexp:*]']
    Got:     intent=navigation, actions=['[NAVIGAZIONE:v2-cap1-esp1]'], needs_llm=False
  E111 [circuit/wiring]:
    Input:   Collega W_A0 del potenziometro al bus negativo
    Reason:  INTENT:action!=circuit, ACTIONS:['[AZIONE:bus-connect]']!=['[AZIONE:addwire:*]']
    Got:     intent=action, actions=['[AZIONE:bus-connect]'], needs_llm=False
  E112 [action/play]:
    Input:   Vai!
    Reason:  ACTIONS:['[AZIONE:esperimento1-cap6-esp1-start]']!=['[AZIONE:play]']
    Got:     intent=action, actions=['[AZIONE:esperimento1-cap6-esp1-start]'], needs_llm=False
  E113 [action/clearall]:
    Input:   pulisci
    Reason:  ACTIONS:['[AZIONE:reset]']!=['[AZIONE:clearall]']
    Got:     intent=action, actions=['[AZIONE:reset]'], needs_llm=False
  E116 [vision/direct]:
    Input:   Dai un'occhiata a quello che ho costruito
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E119 [code/setcode]:
    Input:   Scrivi void setup con Serial.begin(9600)
    Reason:  NEEDS_LLM:True!=False
    Got:     intent=code, actions=[], needs_llm=True

  WEAK AREAS ANALYSIS:
  ------------------------------------------------------------
  circuit: 0% — needs 16 more correct
    Failure breakdown: {'INTENT': 14, 'ACTIONS': 16, 'NEEDS_LLM': 1}
  navigation: 0% — needs 12 more correct
    Failure breakdown: {'ACTIONS': 12}
  action: 2% — needs 40 more correct
    Failure breakdown: {'ACTIONS': 38, 'INTENT': 15, 'NEEDS_LLM': 6}
  vision: 18% — needs 9 more correct
    Failure breakdown: {'NEEDS_LLM': 7, 'INTENT': 4}
  edge: 22% — needs 14 more correct
    Failure breakdown: {'INTENT': 12, 'ACTIONS': 4, 'NEEDS_LLM': 3}
  code: 38% — needs 5 more correct
    Failure breakdown: {'INTENT': 2, 'ACTIONS': 3, 'NEEDS_LLM': 5}
  tutor: 93% — needs 1 more correct
    Failure breakdown: {'INTENT': 1, 'NEEDS_LLM': 1}

  RECOMMENDATIONS:
  ------------------------------------------------------------
  [HIGH] Intent confusion matrix: {'?->navigation': 11, '?->code': 8, '?->tutor': 4, '?->action': 24, '?->vision': 1}
  -> Add more examples for confused intent pairs in training data
  [HIGH] Action tag accuracy below 90% — add more tag-specific examples
  [MEDIUM] Average latency 6160ms is high — consider smaller quantization or GPU

======================================================================