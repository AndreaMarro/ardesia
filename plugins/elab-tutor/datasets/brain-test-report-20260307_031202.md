
======================================================================
  GALILEO BRAIN TEST REPORT
  Model: gemma2:2b
  Date: 2026-03-07 03:12:02
======================================================================

  OVERALL: 11/120 (9.2%) — Grade: F
  JSON Valid: 117/120 (97.5%)
  Avg Latency: 6557ms

  CATEGORY                   PASS TOTAL     PCT  BAR
  ------------------------------------------------------------
  action                        0    41    0.0%  [--------------------]
  circuit                       0    16    0.0%  [--------------------]
  code                          3     8   37.5%  [+++++++-------------]
  edge                          0    18    0.0%  [--------------------]
  navigation                    0    12    0.0%  [--------------------]
  tutor                         4    14   28.6%  [+++++---------------]
  vision                        4    11   36.4%  [+++++++-------------]

  METRICS:
  Intent accuracy:       28/120 (23.3%)
  Action accuracy:       44/120 (36.7%)
  needs_llm accuracy:    59/120 (49.2%)
  Response non-empty:   111/120 (92.5%)
  Hint non-empty:       117/120 (97.5%)

  LATENCY:
  Min: 3290ms | P50: 6356ms | P95: 10944ms | Max: 16311ms

  FAILED TESTS (109):
  ------------------------------------------------------------
  E001 [action/play]:
    Input:   Avvia la simulazione
    Reason:  INTENT:navigation!=action, ACTIONS:['[ACTION:start_simulation]']!=['[AZIONE:play]'], EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['[ACTION:start_simulation]'], needs_llm=False
  E002 [action/play]:
    Input:   Fai partire il circuito
    Reason:  INTENT:circuit!=action, ACTIONS:['[AZIONE:power_on]', '[AZIONE:start_simulation]']!=['[AZIONE:play]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE:power_on]', '[AZIONE:start_simulation]'], needs_llm=True
  E003 [action/play]:
    Input:   Start
    Reason:  INTENT:navigation!=action, ACTIONS:['[INTENT:show_circuit_v1-cap6-esp1]', '[INTENT:start_experiment]']!=['[AZIONE:play]']
    Got:     intent=navigation, actions=['[INTENT:show_circuit_v1-cap6-esp1]', '[INTENT:start_experiment]'], needs_llm=False
  E004 [action/play]:
    Input:   dai corrente
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:tag1] [AZIONE:tag2]', '[AZIONE:tag3]']!=['[AZIONE:play]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag1] [AZIONE:tag2]', '[AZIONE:tag3]'], needs_llm=True
  E005 [action/pause]:
    Input:   Ferma la simulazione
    Reason:  INTENT:navigation!=action, ACTIONS:['stop']!=['[AZIONE:pause]'], EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['stop'], needs_llm=False
  E006 [action/pause]:
    Input:   Stop
    Reason:  INTENT:navigation!=action, ACTIONS:['[INTENT:stop]']!=['[AZIONE:pause]']
    Got:     intent=navigation, actions=['[INTENT:stop]'], needs_llm=False
  E007 [action/pause]:
    Input:   metti in pausa
    Reason:  INTENT:navigation!=action, ACTIONS:['[PAUSE]']!=['[AZIONE:pause]']
    Got:     intent=navigation, actions=['[PAUSE]'], needs_llm=False
  E008 [action/reset]:
    Input:   Resetta tutto
    Reason:  INTENT:circuit!=action, ACTIONS:['[AZIONE:reset_circuit]', '[AZIONE:set_volume 0]']!=['[AZIONE:reset]']
    Got:     intent=circuit, actions=['[AZIONE:reset_circuit]', '[AZIONE:set_volume 0]'], needs_llm=False
  E009 [action/reset]:
    Input:   ricomincia da capo
    Reason:  INTENT:navigation!=action, EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['[AZIONE:reset]', '[AZIONE:start_experiment]'], needs_llm=False
  E010 [action/clearall]:
    Input:   Cancella tutto dalla breadboard
    Reason:  INTENT:navigation!=action, ACTIONS:['clear_breadboard']!=['[AZIONE:clearall]'], EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['clear_breadboard'], needs_llm=False
  E011 [action/clearall]:
    Input:   Svuota il circuito
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:svuota_circuito]', '[AZIONE:elimina_componente:led1]']!=['[AZIONE:clearall]']
    Got:     intent=navigation, actions=['[AZIONE:svuota_circuito]', '[AZIONE:elimina_componente:led1]'], needs_llm=False
  E012 [action/clearall]:
    Input:   togli tutto
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:tag1]']!=['[AZIONE:clearall]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag1]'], needs_llm=True
  E013 [action/compile]:
    Input:   Compila il codice
    Reason:  INTENT:code!=action, ACTIONS:['[INTENT:compila_codice led1 resistor1]', '[INTENT:compila_codice led1 resistor1 volume_attivo 1]']!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[INTENT:compila_codice led1 resistor1]', '[INTENT:compila_codice led1 resistor1 volume_attivo 1]'], needs_llm=True
  E014 [action/compile]:
    Input:   verifica se funziona il programma
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE: tag led1]', '[AZIONE: tag resistor1]']!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: tag led1]', '[AZIONE: tag resistor1]'], needs_llm=True
  E015 [action/diagnose]:
    Input:   Cosa c'e che non va nel circuito?
    Reason:  INTENT:tutor!=action, ACTIONS:['[AZIONE: verifica la presenza di un resistor e un LED nel circuito]', '[AZIONE: spiega che il resistor limita la corrente al LED]']!=['[AZIONE:diagnose]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=['[AZIONE: verifica la presenza di un resistor e un LED nel circuito]', '[AZIONE: spiega che il resistor limita la corrente al LED]'], needs_llm=True
  E016 [action/diagnose]:
    Input:   diagnostica i collegamenti
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:visualizza_schematica]', '[AZIONE:collegamento_led1_resistor1]']!=['[AZIONE:diagnose]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[AZIONE:visualizza_schematica]', '[AZIONE:collegamento_led1_resistor1]'], needs_llm=True
  E017 [action/quiz]:
    Input:   Fammi un quiz
    Reason:  INTENT:tutor!=action, ACTIONS:['[INTENT:quiz_componente]', '[INTENT:circuit_design]']!=['[AZIONE:quiz]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=['[INTENT:quiz_componente]', '[INTENT:circuit_design]'], needs_llm=True
  E018 [action/quiz]:
    Input:   Testami sull'esperimento
    Reason:  INTENT:navigation!=action, ACTIONS:['[INTENT:v1-cap6-esp1]', '[ACTION:test]']!=['[AZIONE:quiz]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[INTENT:v1-cap6-esp1]', '[ACTION:test]'], needs_llm=True
  E019 [circuit/single_placement]:
    Input:   Metti un LED sulla breadboard
    Reason:  INTENT:navigation!=circuit, ACTIONS:['[AZIONE:inserisci led1 nella breadboard]']!=['[INTENT:*]']
    Got:     intent=navigation, actions=['[AZIONE:inserisci led1 nella breadboard]'], needs_llm=False
  E020 [circuit/single_placement]:
    Input:   Aggiungi un resistore
    Reason:  INTENT:code!=circuit, ACTIONS:['aggiungiResistore(resistore1)']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['aggiungiResistore(resistore1)'], needs_llm=True
  E021 [circuit/single_placement]:
    Input:   Piazza un buzzer
    Reason:  ACTIONS:['place_component(buzzer)']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['place_component(buzzer)'], needs_llm=True
  E022 [circuit/single_placement]:
    Input:   Voglio un condensatore
    Reason:  INTENT:code!=circuit, ACTIONS:["[AZIONE:tag_componente 'condensatore']"]!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=["[AZIONE:tag_componente 'condensatore']"], needs_llm=True
  E023 [circuit/single_placement]:
    Input:   metti un potenz
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:tag1]']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag1]'], needs_llm=True
  E024 [circuit/single_placement]:
    Input:   inserisci fotoresistenza
    Reason:  INTENT:code!=circuit, ACTIONS:['inserisciResistore(resistore1)']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['inserisciResistore(resistore1)'], needs_llm=True
  E025 [circuit/single_placement]:
    Input:   aggiungi un servo motore
    Reason:  INTENT:navigation!=circuit, ACTIONS:['add servo motor to circuit']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['add servo motor to circuit'], needs_llm=True
  E026 [circuit/multi_component]:
    Input:   Costruisci un circuito con LED e resistore
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:tag_led1]', '[AZIONE:tag_resistor1]']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag_led1]', '[AZIONE:tag_resistor1]'], needs_llm=True
  E027 [circuit/multi_component]:
    Input:   Metti un LED, un resistore e un pulsante
    Reason:  ACTIONS:['[AZIONE: aggiungi componente led1]', '[AZIONE: aggiungi componente resistor1]', '[AZIONE: aggiungi componente pulsante]']!=['[INTENT:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE: aggiungi componente led1]', '[AZIONE: aggiungi componente resistor1]', '[AZIONE: aggiungi componente pulsante]'], needs_llm=True
  E028 [circuit/multi_component]:
    Input:   Costruisci il circuito del semaforo con 3 LED
    Reason:  ACTIONS:['[AZIONE:tag1:LED1:pin1]', '[AZIONE:tag2:Resistor1:pin2]']!=['[INTENT:*]']
    Got:     intent=circuit, actions=['[AZIONE:tag1:LED1:pin1]', '[AZIONE:tag2:Resistor1:pin2]'], needs_llm=True
  E029 [circuit/wiring]:
    Input:   Collega il LED al pin D3
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:tag led1 pinD3]', '[AZIONE:tag resistor1 pinD4]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag led1 pinD3]', '[AZIONE:tag resistor1 pinD4]'], needs_llm=True
  E030 [circuit/wiring]:
    Input:   Metti un filo dall'anodo del LED a W_D5
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:connect pin1 to W_D5]', '[AZIONE:tag2]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:connect pin1 to W_D5]', '[AZIONE:tag2]'], needs_llm=True
  E031 [circuit/wiring]:
    Input:   Collega il catodo del LED a GND
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:tag1] led1.cathode <- GND']!=['[AZIONE:addwire:*]']
    Got:     intent=code, actions=['[AZIONE:tag1] led1.cathode <- GND'], needs_llm=False
  E032 [circuit/wiring]:
    Input:   connetti il resistore al bus positivo
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE: connettere pin1 a resistor1]', '[AZIONE: tag2]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: connettere pin1 a resistor1]', '[AZIONE: tag2]'], needs_llm=True
  E033 [circuit/wiring]:
    Input:   collega pin1 del pushbutton a 5V
    Reason:  ACTIONS:['[AZIONE:connect pin1 to 5V]', '[AZIONE:tag circuit v1-cap6-esp1]']!=['[AZIONE:addwire:*]']
    Got:     intent=circuit, actions=['[AZIONE:connect pin1 to 5V]', '[AZIONE:tag circuit v1-cap6-esp1]'], needs_llm=False
  E034 [navigation/loadexp]:
    Input:   Carica l'esperimento del primo LED
    Reason:  INTENT:code!=navigation, ACTIONS:['[AZIONE: tag_led1]', '[AZIONE: power_on]']!=['[AZIONE:loadexp:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: tag_led1]', '[AZIONE: power_on]'], needs_llm=True
  E035 [navigation/loadexp]:
    Input:   Apri il capitolo 7 esperimento 2
    Reason:  ACTIONS:['[ACTION:next_chapter]']!=['[AZIONE:loadexp:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[ACTION:next_chapter]'], needs_llm=True
  E036 [navigation/loadexp]:
    Input:   carica v1-cap8-esp3
    Reason:  INTENT:code!=navigation, ACTIONS:['[INTENT:load_circuit v1-cap8-esp3]', '[INTENT:set_volume 1]']!=['[AZIONE:loadexp:v1-cap8-esp3]']
    Got:     intent=code, actions=['[INTENT:load_circuit v1-cap8-esp3]', '[INTENT:set_volume 1]'], needs_llm=False
  E037 [navigation/opentab]:
    Input:   Apri il simulatore
    Reason:  ACTIONS:['open_simulator']!=['[AZIONE:opentab:simulator]']
    Got:     intent=navigation, actions=['open_simulator'], needs_llm=False
  E038 [navigation/opentab]:
    Input:   Vai al manuale
    Reason:  ACTIONS:['open_manual']!=['[AZIONE:opentab:manual]']
    Got:     intent=navigation, actions=['open_manual'], needs_llm=False
  E039 [navigation/opentab]:
    Input:   Mostrami i video
    Reason:  INTENT:vision!=navigation, ACTIONS:[]!=['[AZIONE:opentab:video]'], NEEDS_LLM:True!=False
    Got:     intent=vision, actions=[], needs_llm=True
  E040 [navigation/opentab]:
    Input:   Apri la lavagna
    Reason:  ACTIONS:['open_lavanag']!=['[AZIONE:opentab:canvas]']
    Got:     intent=navigation, actions=['open_lavanag'], needs_llm=False
  E041 [navigation/opentab]:
    Input:   apri editor
    Reason:  ACTIONS:['open_editor']!=['[AZIONE:opentab:editor]'], EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['open_editor'], needs_llm=False
  E042 [navigation/openvolume]:
    Input:   Vai al volume 2
    Reason:  ACTIONS:['set_volume:2']!=['[AZIONE:openvolume:2]']
    Got:     intent=navigation, actions=['set_volume:2'], needs_llm=False
  E043 [navigation/openvolume]:
    Input:   Apri il volume 3
    Reason:  ACTIONS:['set_volume:3']!=['[AZIONE:openvolume:3]']
    Got:     intent=navigation, actions=['set_volume:3'], needs_llm=False
  E044 [code/compile]:
    Input:   Compila e verifica
    Reason:  INTENT:code!=action, ACTIONS:['[ACTION:compila_circuit]', '[ACTION:verifica_circuit]']!=['[AZIONE:compile]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[ACTION:compila_circuit]', '[ACTION:verifica_circuit]'], needs_llm=True
  E045 [code/setcode]:
    Input:   Scrivi il codice per accendere il LED sul pin 13
    Reason:  ACTIONS:['[AZIONE: tag_led1]', '[AZIONE: set_pin_value 13, HIGH]']!=['[AZIONE:setcode:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: tag_led1]', '[AZIONE: set_pin_value 13, HIGH]'], needs_llm=True
  E046 [code/setcode]:
    Input:   Programma il blink del LED
    Reason:  ACTIONS:['[AZIONE: tag led1 resistor1]', '[AZIONE: set pin 1 to HIGH]']!=['[AZIONE:setcode:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: tag led1 resistor1]', '[AZIONE: set pin 1 to HIGH]'], needs_llm=True
  E049 [code/scratch]:
    Input:   Apri l'editor a blocchi
    Reason:  INTENT:navigation!=code, NEEDS_LLM:False!=True, EMPTY_RESPONSE_WHEN_NO_LLM
    Got:     intent=navigation, actions=['open_editor'], needs_llm=False
  E051 [action/interact]:
    Input:   Premi il pulsante
    Reason:  INTENT:button!=action, ACTIONS:['[AZIONE:premia_pulsante]']!=['[AZIONE:interact:*]'], NEEDS_LLM:True!=False
    Got:     intent=button, actions=['[AZIONE:premia_pulsante]'], needs_llm=True
  E052 [action/interact]:
    Input:   Accendi il LED
    Reason:  INTENT:code!=action, ACTIONS:['digitalWrite(led1, HIGH)']!=['[AZIONE:interact:*]']
    Got:     intent=code, actions=['digitalWrite(led1, HIGH)'], needs_llm=False
  E053 [action/interact]:
    Input:   Ruota il potenziometro a meta
    Reason:  INTENT:circuit!=action, ACTIONS:['[AZIONE: set_voltage_potentiometer_value 10]', '[AZIONE: turn_on_led1]']!=['[AZIONE:interact:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE: set_voltage_potentiometer_value 10]', '[AZIONE: turn_on_led1]'], needs_llm=True
  E054 [action/interact]:
    Input:   Spegni il LED
    Reason:  INTENT:code!=action, ACTIONS:['digitalWrite(led1, LOW)']!=['[AZIONE:interact:*]']
    Got:     intent=code, actions=['digitalWrite(led1, LOW)'], needs_llm=False
  E055 [action/highlight]:
    Input:   Dov'e il LED?
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:visualizza_componente led1]']!=['[AZIONE:highlight:*]']
    Got:     intent=navigation, actions=['[AZIONE:visualizza_componente led1]'], needs_llm=False
  E056 [action/highlight]:
    Input:   Evidenzia il resistore
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:tag_resistore1]']!=['[AZIONE:highlight:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[AZIONE:tag_resistore1]'], needs_llm=True
  E057 [action/highlight]:
    Input:   Mostrami dov'e il buzzer
    Reason:  INTENT:navigation!=action, ACTIONS:['[INTENT:find_buzzer]']!=['[AZIONE:highlight:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[INTENT:find_buzzer]'], needs_llm=True
  E058 [action/measure]:
    Input:   Quanti volt ci sono sul LED?
    Reason:  INTENT:code!=action, ACTIONS:['[INTENT:getVoltageLed1]', '[INTENT:circuit_check]']!=['[AZIONE:measure:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[INTENT:getVoltageLed1]', '[INTENT:circuit_check]'], needs_llm=True
  E059 [action/measure]:
    Input:   Misura la corrente nel circuito
    Reason:  INTENT:code!=action, ACTIONS:['[INTENT:measure_current]', '[ACTION:read_voltage]']!=['[AZIONE:measure:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[INTENT:measure_current]', '[ACTION:read_voltage]'], needs_llm=True
  E060 [action/setvalue]:
    Input:   Cambia il resistore a 470 ohm
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:modifica_resistore 470 ohm]']!=['[AZIONE:setvalue:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:modifica_resistore 470 ohm]'], needs_llm=True
  E061 [action/setvalue]:
    Input:   Metti la resistenza a 1K
    Reason:  JSON_PARSE_FAILED
  E062 [action/movecomponent]:
    Input:   Sposta il LED piu a destra
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:move_right_led1]']!=['[AZIONE:movecomponent:*]']
    Got:     intent=navigation, actions=['[AZIONE:move_right_led1]'], needs_llm=False
  E063 [action/movecomponent]:
    Input:   Metti il resistore in alto
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:move_component_up resistor1]', '[AZIONE:set_volume_attivo 1]']!=['[AZIONE:movecomponent:*]']
    Got:     intent=code, actions=['[AZIONE:move_component_up resistor1]', '[AZIONE:set_volume_attivo 1]'], needs_llm=False
  E064 [action/removewire]:
    Input:   Rimuovi il filo rosso
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:elimina_filo1]']!=['[AZIONE:removewire:*]']
    Got:     intent=navigation, actions=['[AZIONE:elimina_filo1]'], needs_llm=False
  E065 [action/removewire]:
    Input:   Scollega il LED dalla breadboard
    Reason:  INTENT:circuit!=action, ACTIONS:['[AZIONE:scollegare_led_breadboard]']!=['[AZIONE:removewire:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE:scollegare_led_breadboard]'], needs_llm=True
  E066 [action/removecomponent]:
    Input:   Rimuovi il LED
    Reason:  INTENT:code!=action, ACTIONS:['REMOVE:led1']!=['[AZIONE:removecomponent:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['REMOVE:led1'], needs_llm=True
  E067 [action/removecomponent]:
    Input:   Togli il buzzer dal circuito
    Reason:  INTENT:code!=action, ACTIONS:['remove buzzer']!=['[AZIONE:removecomponent:*]']
    Got:     intent=code, actions=['remove buzzer'], needs_llm=False
  E068 [action/removecomponent]:
    Input:   Elimina il resistore
    Reason:  INTENT:code!=action, ACTIONS:['removeResistor(resistor1)']!=['[AZIONE:removecomponent:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['removeResistor(resistor1)'], needs_llm=True
  E069 [action/youtube]:
    Input:   Cerca un video sul LED
    Reason:  INTENT:vision!=action, ACTIONS:['[VIDEO:search_led]']!=['[AZIONE:youtube:*]'], NEEDS_LLM:True!=False
    Got:     intent=vision, actions=['[VIDEO:search_led]'], needs_llm=True
  E070 [action/youtube]:
    Input:   Mostrami un tutorial sui resistori
    Reason:  INTENT:code!=action, ACTIONS:['[INTENT:descrivi_resistore]', '[INTENT:esempio_resistore]']!=['[AZIONE:youtube:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[INTENT:descrivi_resistore]', '[INTENT:esempio_resistore]'], needs_llm=True
  E071 [action/createnotebook]:
    Input:   Crea un taccuino per questa lezione
    Reason:  INTENT:tutor!=action, ACTIONS:['[ACTION:creare_taccuino]', '[ACTION:aggiungi_contenuto_taccuino]']!=['[AZIONE:createnotebook:*]'], NEEDS_LLM:True!=False
    Got:     intent=tutor, actions=['[ACTION:creare_taccuino]', '[ACTION:aggiungi_contenuto_taccuino]'], needs_llm=True
  E072 [tutor/explanation]:
    Input:   Come funziona un LED?
    Reason:  INTENT:vision!=tutor
    Got:     intent=vision, actions=['[AZIONE:descrivi come funziona un LED con resistor]', '[AZIONE:visualizza diagramma di circuito per LED]'], needs_llm=True
  E073 [tutor/explanation]:
    Input:   Cos'e una resistenza?
    Reason:  INTENT:code!=tutor
    Got:     intent=code, actions=['[INTENT:define_resistenza]'], needs_llm=True
  E075 [tutor/explanation]:
    Input:   Come funziona un circuito serie?
    Reason:  INTENT:circuit!=tutor
    Got:     intent=circuit, actions=['[AZIONE:descrivi_circuito_serie]', '[AZIONE:visualizza_circuito_serie]'], needs_llm=True
  E076 [tutor/explanation]:
    Input:   A cosa serve il diodo?
    Reason:  INTENT:code!=tutor
    Got:     intent=code, actions=['[AZIONE:descrivi_funzione_diodo]'], needs_llm=True
  E078 [tutor/explanation]:
    Input:   Come si calcola la corrente?
    Reason:  INTENT:code!=tutor
    Got:     intent=code, actions=['[AZIONE:calcola_corrente]', '[AZIONE:circuit_diagram]'], needs_llm=True
  E079 [tutor/greeting]:
    Input:   Ciao Galileo!
    Reason:  INTENT:vision!=tutor, NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E081 [tutor/off_topic]:
    Input:   Che tempo fa oggi?
    Reason:  INTENT:vision!=tutor, NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E083 [tutor/off_topic]:
    Input:   Chi ha vinto la partita ieri?
    Reason:  INTENT:vision!=tutor, NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E086 [vision/direct]:
    Input:   Analizza la mia breadboard
    Reason:  INTENT:navigation!=vision
    Got:     intent=navigation, actions=['[AZIONE:visualizza_breadboard]', '[AZIONE:identifica_componenti]'], needs_llm=True
  E087 [vision/direct]:
    Input:   Controlla il mio lavoro
    Reason:  INTENT:code!=vision
    Got:     intent=code, actions=['[AZIONE: tag led1]', '[AZIONE: tag resistor1]'], needs_llm=True
  E090 [vision/implicit]:
    Input:   E' corretto quello che ho fatto?
    Reason:  INTENT:tutor!=vision
    Got:     intent=tutor, actions=['[AZIONE:verifica_circuit_v1-cap6-esp1]', '[AZIONE:check_components_led1, resistor1]'], needs_llm=True
  E091 [vision/implicit]:
    Input:   Ho montato bene il circuito?
    Reason:  INTENT:navigation!=vision
    Got:     intent=navigation, actions=['[AZIONE:visualizza_circuito]', '[AZIONE:verifica_connessione]'], needs_llm=True
  E092 [vision/debug]:
    Input:   Il LED non si accende, guarda il circuito
    Reason:  INTENT:navigation!=vision
    Got:     intent=navigation, actions=['[INTENT:check_circuit]', '[INTENT:show_circuit]'], needs_llm=True
  E093 [edge/multi_intent]:
    Input:   Metti un LED, collegalo a D3 e avvia la simulazione
    Reason:  INTENT:code!=circuit
    Got:     intent=code, actions=['[AZIONE: tag_led1]', '[AZIONE: connect_resistor1_to_D3]'], needs_llm=False
  E094 [edge/multi_intent]:
    Input:   Aggiungi un buzzer e fallo suonare
    Reason:  INTENT:code!=circuit, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:aggiungi_componente buzzer]', '[AZIONE:collegamento_pin1 buzzer pin2]'], needs_llm=True
  E095 [edge/typo]:
    Input:   costrusci un cirquito con un leddd
    Reason:  NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE:tag led1 resistor1]', '[AZIONE:add 2]'], needs_llm=True
  E096 [edge/typo]:
    Input:   aviva la simulazzione
    Reason:  INTENT:circuit!=action, ACTIONS:['power_on']!=['[AZIONE:play]']
    Got:     intent=circuit, actions=['power_on'], needs_llm=False
  E097 [edge/ambiguous]:
    Input:   metti una lucina
    Reason:  INTENT:code!=circuit, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:switch led1 ON]'], needs_llm=True
  E098 [edge/ambiguous]:
    Input:   aggiungi un ronzatore
    Reason:  INTENT:code!=circuit, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:AggiungiRonzatore]'], needs_llm=True
  E099 [edge/negation]:
    Input:   Non avviare la simulazione
    Reason:  INTENT:navigation!=action
    Got:     intent=navigation, actions=[], needs_llm=False
  E100 [edge/conditional]:
    Input:   Se il circuito e' giusto, avvia la simulazione
    Reason:  INTENT:circuit!=action
    Got:     intent=circuit, actions=['[AZIONE:tag led1 resistor1]', '[AZIONE:start_simulation]'], needs_llm=True
  E101 [edge/replacement]:
    Input:   Sostituisci il LED con un buzzer
    Reason:  INTENT:code!=circuit, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag1] Sostituzione del LED con un buzzer.', '[AZIONE:tag2] Aggiungere il buzzer al circuito.'], needs_llm=True
  E102 [edge/quantity]:
    Input:   Metti 3 LED rossi
    Reason:  INTENT:code!=circuit, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: aggiungi_led 1, LED1]', '[AZIONE: aggiungi_resistore 1, Resistore1]'], needs_llm=True
  E103 [edge/invalid_pin]:
    Input:   Collega il LED al pin D99
    Reason:  JSON_PARSE_FAILED
  E104 [edge/question_action]:
    Input:   Come funziona un LED? Mettine uno sulla breadboard
    Reason:  INTENT:code!=tutor
    Got:     intent=code, actions=['[ACTION:tag_circuit led1 resistor1]', '[INTENT:build circuit]'], needs_llm=True
  E105 [edge/bus_connection]:
    Input:   Collega il resistore al bus positivo
    Reason:  INTENT:code!=circuit, ACTIONS:['[AZIONE:connetti_resistore_bus_positivo]', '[AZIONE:visualizza_schematica]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:connetti_resistore_bus_positivo]', '[AZIONE:visualizza_schematica]'], needs_llm=True
  E106 [edge/wing_pin]:
    Input:   Connetti al pin W_D10
    Reason:  INTENT:navigation!=circuit, ACTIONS:['[AZIONE:connect W_D10 to pin W_D10]', '[AZIONE:check connection]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[AZIONE:connect W_D10 to pin W_D10]', '[AZIONE:check connection]'], needs_llm=True
  E107 [edge/partial_removal]:
    Input:   Rimuovi solo il resistore, lascia il LED
    Reason:  INTENT:code!=action, ACTIONS:['[AZIONE:tag1: rimuovi resistor1]', '[AZIONE:tag2: lascia led1]']!=['[AZIONE:removecomponent:*]'], NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE:tag1: rimuovi resistor1]', '[AZIONE:tag2: lascia led1]'], needs_llm=True
  E108 [edge/empty_context]:
    Input:   Collega il LED
    Reason:  INTENT:code!=circuit
    Got:     intent=code, actions=['[AZIONE:connetti_led_a_resistore]', '[AZIONE:collegamento_led_a_resistore]'], needs_llm=True
  E109 [navigation/loadexp]:
    Input:   voglio fare l'esperimento col pulsante
    Reason:  INTENT:circuit!=navigation, ACTIONS:['[AZIONE:connetti_pulsante_led1]', '[AZIONE:attiva_volume]']!=['[AZIONE:loadexp:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE:connetti_pulsante_led1]', '[AZIONE:attiva_volume]'], needs_llm=True
  E110 [navigation/loadexp]:
    Input:   carica il primo esperimento del volume 2
    Reason:  JSON_PARSE_FAILED
  E111 [circuit/wiring]:
    Input:   Collega W_A0 del potenziometro al bus negativo
    Reason:  ACTIONS:['[AZIONE:connect W_A0 to bus negative]', '[AZIONE:check connection]']!=['[AZIONE:addwire:*]'], NEEDS_LLM:True!=False
    Got:     intent=circuit, actions=['[AZIONE:connect W_A0 to bus negative]', '[AZIONE:check connection]'], needs_llm=True
  E112 [action/play]:
    Input:   Vai!
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:turn_on_led1]', '[AZIONE:connect_resistor1_to_led1]']!=['[AZIONE:play]'], NEEDS_LLM:True!=False
    Got:     intent=navigation, actions=['[AZIONE:turn_on_led1]', '[AZIONE:connect_resistor1_to_led1]'], needs_llm=True
  E113 [action/clearall]:
    Input:   pulisci
    Reason:  INTENT:navigation!=action, ACTIONS:['[AZIONE:move_to_led1]', '[AZIONE:move_to_resistor1]']!=['[AZIONE:clearall]']
    Got:     intent=navigation, actions=['[AZIONE:move_to_led1]', '[AZIONE:move_to_resistor1]'], needs_llm=False
  E114 [tutor/explanation]:
    Input:   Perche servono le resistenze con i LED?
    Reason:  INTENT:code!=tutor
    Got:     intent=code, actions=['[AZIONE:tag1:Spiega la funzione delle resistenze con i LED]', '[AZIONE:tag2:Descrivi come le resistenze limitano il flusso di corrente]'], needs_llm=True
  E115 [tutor/explanation]:
    Input:   Cosa succede se collego il LED al contrario?
    Reason:  INTENT:circuit!=tutor
    Got:     intent=circuit, actions=['[AZIONE:tag_led_polarity]', '[AZIONE:check_circuit_flow]'], needs_llm=True
  E116 [vision/direct]:
    Input:   Dai un'occhiata a quello che ho costruito
    Reason:  NEEDS_LLM:False!=True
    Got:     intent=vision, actions=[], needs_llm=False
  E117 [vision/action_chain]:
    Input:   Guarda il circuito e se e' sbagliato corregilo
    Reason:  INTENT:code!=vision
    Got:     intent=code, actions=['[AZIONE: tag led1 resistor1]', '[AZIONE: check circuit]'], needs_llm=True
  E118 [edge/multi_intent]:
    Input:   Rimuovi tutto, metti un LED con resistore e avvia
    Reason:  INTENT:code!=action, NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[AZIONE: tag_circuit led1 resistor1]', '[AZIONE: power_on]'], needs_llm=True
  E119 [code/setcode]:
    Input:   Scrivi void setup con Serial.begin(9600)
    Reason:  NEEDS_LLM:True!=False
    Got:     intent=code, actions=['[INTENT:code_setup]', '[ACTION:write_code]'], needs_llm=True
  E120 [edge/greeting_then_action]:
    Input:   Ciao! Puoi accendere il LED?
    Reason:  INTENT:code!=action
    Got:     intent=code, actions=['[AZIONE: tag led1]', '[AZIONE: power on]'], needs_llm=False

  WEAK AREAS ANALYSIS:
  ------------------------------------------------------------
  action: 0% — needs 41 more correct
    Failure breakdown: {'INTENT': 40, 'ACTIONS': 39, 'EMPTY_RESPONSE_WHEN_NO_LLM': 4, 'NEEDS_LLM': 23, 'JSON_PARSE_FAILED': 1}
  circuit: 0% — needs 16 more correct
    Failure breakdown: {'INTENT': 11, 'ACTIONS': 16, 'NEEDS_LLM': 12}
  navigation: 0% — needs 12 more correct
    Failure breakdown: {'INTENT': 4, 'ACTIONS': 11, 'NEEDS_LLM': 4, 'EMPTY_RESPONSE_WHEN_NO_LLM': 1, 'JSON_PARSE_FAILED': 1}
  edge: 0% — needs 18 more correct
    Failure breakdown: {'INTENT': 16, 'NEEDS_LLM': 10, 'ACTIONS': 4, 'JSON_PARSE_FAILED': 1}
  tutor: 29% — needs 10 more correct
    Failure breakdown: {'INTENT': 10, 'NEEDS_LLM': 3}
  vision: 36% — needs 7 more correct
    Failure breakdown: {'INTENT': 6, 'NEEDS_LLM': 1}
  code: 38% — needs 5 more correct
    Failure breakdown: {'INTENT': 2, 'ACTIONS': 3, 'NEEDS_LLM': 5, 'EMPTY_RESPONSE_WHEN_NO_LLM': 1}

  RECOMMENDATIONS:
  ------------------------------------------------------------
  [CRITICAL] 3 responses had invalid JSON — retrain with stricter JSON enforcement
  [HIGH] Intent confusion matrix: {'?->navigation': 25, '?->circuit': 9, '?->code': 44, '?->tutor': 4, '?->vision': 6, '?->button': 1, '?->?': 3}
  -> Add more examples for confused intent pairs in training data
  [HIGH] Action tag accuracy below 90% — add more tag-specific examples
  [MEDIUM] Average latency 6557ms is high — consider smaller quantization or GPU

======================================================================