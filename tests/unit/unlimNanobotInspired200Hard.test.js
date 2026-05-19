import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../../src/utils/contentFilter', () => ({
  validateMessage: vi.fn(() => ({ allowed: true })),
  sanitizeOutput: vi.fn((text) => text),
}));

vi.mock('../../src/services/lessonPrepService', () => ({
  isLessonPrepCommand: vi.fn(() => false),
  getLessonSummary: vi.fn(),
  prepareLesson: vi.fn(),
}));

vi.mock('../../src/services/unlimContextCollector', () => ({
  collectFullContext: vi.fn(() => ({})),
}));

vi.mock('../../src/components/lavagna/intentsDispatcher', () => ({
  executeServerIntents: vi.fn(() => []),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import { __test__ } from '../../src/components/lavagna/useGalileoChat.js';
import {
  buildAgentDecisionSeed,
  recordUnlimEvent,
  resetUnlimSharedStateForTests,
} from '../../src/services/unlimSharedStateStore.js';

const operational = await import('../../supabase/functions/_shared/operational-response.ts');

function installApi(overrides = {}) {
  window.__ELAB_API = {
    play: vi.fn(() => ({ ok: true })),
    pause: vi.fn(() => ({ ok: true })),
    reset: vi.fn(() => ({ ok: true })),
    undo: vi.fn(() => ({ ok: true })),
    redo: vi.fn(() => ({ ok: true })),
    interact: vi.fn(() => ({ ok: true })),
    clearAll: vi.fn(() => ({ ok: true })),
    loadExperiment: vi.fn(() => ({ ok: true })),
    addWire: vi.fn(() => ({ id: 'wire-1' })),
    addComponent: vi.fn((type) => `${type}-new`),
    removeComponent: vi.fn(() => ({ ok: true })),
    removeWire: vi.fn(() => ({ ok: true })),
    moveComponent: vi.fn(() => ({ ok: true })),
    setComponentValue: vi.fn(() => ({ ok: true })),
    captureScreenshot: vi.fn(() => 'data:image/png;base64,abc'),
    getCircuitDescription: vi.fn(() => 'led1 collegato a r1, ritorno GND mancante'),
    getSimulatorContext: vi.fn(() => ({ circuit: { components: [{ id: 'led1', type: 'led' }] } })),
    compile: vi.fn(() => ({ success: true })),
    getEditorCode: vi.fn(() => 'void setup(){} void loop(){}'),
    setEditorCode: vi.fn(() => ({ ok: true })),
    appendEditorCode: vi.fn(() => ({ ok: true })),
    resetEditorCode: vi.fn(() => ({ ok: true })),
    showEditor: vi.fn(() => ({ ok: true })),
    hideEditor: vi.fn(() => ({ ok: true })),
    setEditorMode: vi.fn(() => ({ ok: true })),
    loadScratchWorkspace: vi.fn(() => ({ ok: true })),
    setBuildMode: vi.fn(() => ({ ok: true })),
    nextStep: vi.fn(() => ({ ok: true })),
    prevStep: vi.fn(() => ({ ok: true })),
    showBom: vi.fn(() => ({ ok: true })),
    showSerialMonitor: vi.fn(() => ({ ok: true })),
    serialWrite: vi.fn(() => ({ ok: true })),
    highlightPin: vi.fn(() => ({ ok: true })),
    unlim: {
      highlightComponent: vi.fn(() => ({ ok: true })),
      clearHighlights: vi.fn(() => ({ ok: true })),
      exportFumetto: vi.fn(() => ({ ok: true, format: 'pdf' })),
    },
    ...overrides,
  };
}

describe('UNLIM Nanobot/Galileo inspired 200 hard tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUnlimSharedStateForTests();
    installApi();
  });

  afterEach(() => {
    delete window.__ELAB_API;
  });

  const semaforoPrompts = [
    'Prepara il codice Arduino del semaforo e compila',
    'Scrivi codice Arduino per semaforo rosso giallo verde e compila',
    'Apri Arduino, prepara semaforo a tre LED e carica',
    'Codice semaforo traffic light Arduino, compilare',
    'Arduino: voglio il semaforo con rosso giallo verde',
    'Prepara sketch semaforo con pin rosso giallo verde',
    'Metti codice Arduino per traffic light e prova',
    'Fammi codice semaforo Arduino completo e compila',
    'Compila uno sketch Arduino per tre LED semaforo',
    'Prepara programma Arduino rosso giallo verde',
  ];

  semaforoPrompts.forEach((message, index) => {
    it(`001-010 semaforo non diventa Blink #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, null);

      expect(response?.source).toBe('direct-operational-arduino');
      expect(response?.response).toContain('[AZIONE:openeditor]');
      expect(response?.response).toContain('[AZIONE:switcheditor:arduino]');
      expect(response?.response).toContain('[AZIONE:setcode:');
      expect(response?.response).toContain('[AZIONE:loadexp:v3-cap6-semaforo]');
      expect(response?.response).toContain('pinMode(5, OUTPUT)');
      expect(response?.response).toContain('pinMode(6, OUTPUT)');
      expect(response?.response).toContain('pinMode(3, OUTPUT)');
      expect(response?.response).not.toContain('programma Blink');
    });
  });

  const blinkPrompts = [
    'Apri Arduino, metti il codice blink e compila',
    'Prepara codice Arduino per far lampeggiare il LED',
    'Scrivi sketch blink sul pin 13',
    'Fammi lampeggiare il LED con Arduino e compila',
    // iter 41 cleanup — original prompt 'Codice blink semplice, carica programma'
    // routes to direct-operational-experiment-nav by design (v67): bare 'blink'
    // keyword + nav verb 'carica' with NO 'arduino' keyword matches expNavBackup
    // in operational-response.ts. Updated prompt keeps Arduino code-prep intent
    // explicit (adds 'Arduino') so blinkPrompts still validate the arduino path.
    'Codice blink semplice Arduino, carica programma',
    'Arduino blink ogni secondo',
    'Prepara programma lampegg LED pin 13',
    'Metti codice per lampeggiare senza semaforo',
    'Compila blink Arduino',
    'Sketch Arduino blink led',
  ];

  blinkPrompts.forEach((message, index) => {
    it(`011-020 blink resta Blink #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, null);

      expect(response?.source).toBe('direct-operational-arduino');
      expect(response?.response).toContain('pinMode(13, OUTPUT)');
      expect(response?.response).toContain('digitalWrite(13, HIGH)');
      expect(response?.response).toContain('[AZIONE:setcode:');
      expect(response?.response).not.toContain('PIN_ROSSO');
    });
  });

  const scratchLoadPrompts = [
    'Apri Scratch e carica i blocchi per far lampeggiare il LED',
    'Prepara blocchi Scratch blink',
    'Metti i blocchi per lampeggiare',
    'Crea workspace Blockly per LED blink',
    'Scratch: carica blocchi digitalWrite e delay',
    'Voglio i blocchi gia pronti per il lampeggio',
    'Prepara blocchetti per LED pin 13',
    'Carica Scratch con accendi aspetta spegni',
    'Metti un programma a blocchi per blink',
    'Crea blocchi Arduino per accendere e spegnere',
  ];

  scratchLoadPrompts.forEach((message, index) => {
    it(`021-030 Scratch carica workspace quando richiesto #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, null);

      expect(response?.source).toBe('direct-operational-scratch');
      expect(response?.response).toContain('[AZIONE:openeditor]');
      expect(response?.response).toContain('[AZIONE:switcheditor:scratch]');
      expect(response?.response).toContain('[AZIONE:loadblocks:');
      expect(response?.response).toContain('arduino_pin_mode');
      expect(response?.response).toContain('arduino_digital_write');
      expect(response?.response).not.toContain('arduino_pinmode');
      expect(response?.response).not.toContain('arduino_digitalwrite');
    });
  });

  const scratchOpenPrompts = [
    'Apri Scratch',
    'Passa ai blocchi',
    'Mostrami Blockly',
    'Voglio editor blocchi',
    'Apri i blocchetti',
    'Fammi vedere Scratch senza caricare nulla',
    'Passa alla programmazione a blocchi',
    'Solo editor Scratch',
    'Blocchi per spiegare',
    'Apri workspace Scratch vuoto',
  ];

  scratchOpenPrompts.forEach((message, index) => {
    it(`031-040 Scratch apre editor senza inventare workspace #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, null);

      expect(response?.source).toBe('direct-operational-scratch');
      expect(response?.response).toContain('[AZIONE:openeditor]');
      expect(response?.response).toContain('[AZIONE:switcheditor:scratch]');
    });
  });

  const reportPrompts = [
    'Fammi il report fumetto della sessione',
    'Genera fumetto della lezione',
    'Report della sessione con cosa abbiamo fatto',
    'Mostra il fumetto della sessione',
    'Crea report della lezione',
    'Fammi riassunto fumetto sessione',
    'Apri report fumetto della sessione',
    'Voglio il report della lezione di oggi',
    'Fumetto sessione per la classe',
    'Prepara report sessione',
  ];

  reportPrompts.forEach((message, index) => {
    it(`041-050 report/fumetto usa export verificabile #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, null);

      expect(response?.source).toBe('direct-operational-report-comic');
      expect(response?.response).toContain('[AZIONE:exportfumetto:pdf]');
      expect(response?.response).not.toMatch(/ho generato|e' pronto|è pronto/i);
    });
  });

  const diagnosisCases = [
    ['Perche ora fa cosi?', 'led2 scollegato: ramo aperto', 'led2,r2'],
    ['Non funziona dopo il filo nuovo', 'r2 scollegato dal ritorno', 'r2'],
    ['Come mai e cambiato?', 'led1 polarita invertita', 'led1'],
    ['Il circuito e strano', 'r1 non collegato al GND', 'r1'],
    ['Aiuto non si accende', 'buzzer senza ritorno', 'buzzer'],
    ['Ora non va piu', 'btn1 flottante', 'btn1'],
    ['Perche si e spento?', 'nano GND non collegato', 'nano'],
    ['Cosa succede, e sbagliato?', 'led2 catodo aperto', 'led2'],
    ['Fa cosi dopo la modifica', 'r2 pin1 isolato', 'r2'],
    ['Non capisco perche non va', 'led1 senza resistore', 'led1,r1'],
  ];

  diagnosisCases.forEach(([message, error, ids], index) => {
    it(`051-060 diagnosi usa errore reale e highlight #${index + 1}`, () => {
      const response = operational.buildDirectOperationalResponse(message, {
        text: error,
        components: ids.split(',').map(id => ({ id, type: id.startsWith('r') ? 'resistor' : 'led', state: 'off' })),
        errors: [error],
      });

      expect(response?.source).toBe('direct-operational-diagnosis');
      expect(response?.response).toContain(error);
      expect(response?.response).toContain('[AZIONE:diagnose]');
      expect(response?.response).toContain('[AZIONE:highlight:');
    });
  });

  const nullPrompts = [
    'ciao',
    'che ore sono',
    'raccontami una storia non elettronica',
    'mi piace il blu',
    'ok grazie',
    'bene',
    'ripeti con parole diverse',
    'spiegami meglio senza azioni',
    'domanda generale',
    'parliamo dopo',
  ];

  nullPrompts.forEach((message, index) => {
    it(`061-070 non forza direct response quando non ha trigger operativo #${index + 1}`, () => {
      expect(operational.buildDirectOperationalResponse(message, null)).toBe(null);
    });
  });

  const actionSuccessCases = [
    ['[AZIONE:play]', 'play', () => expect(window.__ELAB_API.play).toHaveBeenCalled()],
    ['[AZIONE:pause]', 'pause', () => expect(window.__ELAB_API.pause).toHaveBeenCalled()],
    ['[AZIONE:reset]', 'reset', () => expect(window.__ELAB_API.reset).toHaveBeenCalled()],
    ['[AZIONE:undo]', 'undo', () => expect(window.__ELAB_API.undo).toHaveBeenCalled()],
    ['[AZIONE:redo]', 'redo', () => expect(window.__ELAB_API.redo).toHaveBeenCalled()],
    ['[AZIONE:clearall]', 'clearall', () => expect(window.__ELAB_API.clearAll).toHaveBeenCalled()],
    ['[AZIONE:highlight:led1,r1]', 'highlight:led1,r1', () => expect(window.__ELAB_API.unlim.highlightComponent).toHaveBeenCalledWith(['led1', 'r1'])],
    ['[AZIONE:loadexp:v1-cap6-esp1]', 'loadexp:v1-cap6-esp1', () => expect(window.__ELAB_API.loadExperiment).toHaveBeenCalledWith('v1-cap6-esp1')],
    ['[AZIONE:addcomponent:led:200:150]', 'addcomponent:led-new', () => expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('led', { x: 200, y: 150 })],
    ['[AZIONE:removecomponent:led1]', 'removecomponent:led1', () => expect(window.__ELAB_API.removeComponent).toHaveBeenCalledWith('led1')],
    ['[AZIONE:addwire:led1:anode:nano:D13]', 'addwire:led1:anode->nano:D13', () => expect(window.__ELAB_API.addWire).toHaveBeenCalledWith('led1:anode', 'nano:D13')],
    ['[AZIONE:removewire:2]', 'removewire:2', () => expect(window.__ELAB_API.removeWire).toHaveBeenCalledWith(2)],
    ['[AZIONE:setvalue:r1:resistance:330]', 'setvalue:r1:resistance:330', () => expect(window.__ELAB_API.setComponentValue).toHaveBeenCalledWith('r1', 'resistance', '330')],
    ['[AZIONE:screenshot]', 'screenshot', () => expect(window.__ELAB_API.captureScreenshot).toHaveBeenCalled()],
    ['[AZIONE:exportfumetto:png]', 'exportfumetto', () => expect(window.__ELAB_API.unlim.exportFumetto).toHaveBeenCalledWith({ format: 'png', source: 'unlim-action' })],
    ['[AZIONE:describe]', 'describe', () => expect(window.__ELAB_API.getCircuitDescription).toHaveBeenCalled()],
    ['[AZIONE:movecomponent:led1:300:220]', 'movecomponent:led1', () => expect(window.__ELAB_API.moveComponent).toHaveBeenCalledWith('led1', 300, 220)],
    ['[AZIONE:measure:led1:voltage]', 'measure:led1', () => expect(true).toBe(true)],
    ['[AZIONE:diagnose]', 'diagnose', () => expect(true).toBe(true)],
    ['[AZIONE:openeditor]', 'openeditor', () => expect(window.__ELAB_API.showEditor).toHaveBeenCalled()],
    ['[AZIONE:closeeditor]', 'closeeditor', () => expect(window.__ELAB_API.hideEditor).toHaveBeenCalled()],
    ['[AZIONE:switcheditor:scratch]', 'switcheditor:scratch', () => expect(window.__ELAB_API.setEditorMode).toHaveBeenCalledWith('scratch')],
    ['[AZIONE:getcode]', 'getcode', () => expect(window.__ELAB_API.getEditorCode).toHaveBeenCalled()],
    ['[AZIONE:resetcode]', 'resetcode', () => expect(window.__ELAB_API.resetEditorCode).toHaveBeenCalled()],
    ['[AZIONE:loadblocks:<xml><block type="arduino_delay"></block></xml>]', 'loadblocks', () => expect(window.__ELAB_API.loadScratchWorkspace).toHaveBeenCalled()],
    ['[AZIONE:fullscreenscratch]', 'fullscreenscratch', () => expect(window.__ELAB_API.setEditorMode).toHaveBeenCalledWith('scratch')],
    ['[AZIONE:exitscratchfullscreen]', 'exitscratchfullscreen', () => expect(window.__ELAB_API.hideEditor).toHaveBeenCalled()],
    ['[AZIONE:setbuildmode:passopasso]', 'setbuildmode:passopasso', () => expect(window.__ELAB_API.setBuildMode).toHaveBeenCalledWith('guided')],
    ['[AZIONE:nextstep]', 'nextstep', () => expect(window.__ELAB_API.nextStep).toHaveBeenCalled()],
    ['[AZIONE:prevstep]', 'prevstep', () => expect(window.__ELAB_API.prevStep).toHaveBeenCalled()],
  ];

  actionSuccessCases.forEach(([tag, expected, verify], index) => {
    it(`071-100 action bridge esegue tool Nanobot-style #${index + 1}`, () => {
      const result = __test__.executeActionTags(tag);

      expect(result).toContain(expected);
      verify();
    });
  });

  const actionMoreSuccessCases = [
    ['[AZIONE:showbom]', 'showbom', () => expect(window.__ELAB_API.showBom).toHaveBeenCalled()],
    ['[AZIONE:listcomponents]', 'listcomponents', () => expect(window.__ELAB_API.getCircuitDescription).toHaveBeenCalled()],
    ['[AZIONE:getstate]', 'getstate', () => expect(window.__ELAB_API.getSimulatorContext).toHaveBeenCalled()],
    ['[AZIONE:showserial]', 'showserial', () => expect(window.__ELAB_API.showSerialMonitor).toHaveBeenCalled()],
    ['[AZIONE:serialwrite:HELLO]', 'serialwrite', () => expect(window.__ELAB_API.serialWrite).toHaveBeenCalledWith('HELLO')],
    ['[AZIONE:highlightpin:nano:D13,nano:GND]', 'highlightpin:nano:D13,nano:GND', () => expect(window.__ELAB_API.highlightPin).toHaveBeenCalledWith(['nano:D13', 'nano:GND'])],
    ['[AZIONE:quiz:v1-cap6-esp1]', 'quiz:v1-cap6-esp1', () => expect(true).toBe(true)],
    ['[AZIONE:youtube:legge di ohm]', 'youtube:legge di ohm', () => expect(true).toBe(true)],
    ['[AZIONE:createnotebook:semiforo debug]', 'createnotebook', () => expect(true).toBe(true)],
    ['[AZIONE:openchat]', 'openchat', () => expect(true).toBe(true)],
    ['[AZIONE:closechat]', 'closechat', () => expect(true).toBe(true)],
    ['[AZIONE:openvolume:1:42]', 'openvolume:1:42', () => expect(true).toBe(true)],
    ['[AZIONE:opentab:manuale]', 'opentab:manuale', () => expect(true).toBe(true)],
    ['[AZIONE:appendcode:// test]', 'appendcode', () => expect(window.__ELAB_API.appendEditorCode).toHaveBeenCalledWith('// test')],
    ['[AZIONE:interact:btn1:press:true]', 'interact:btn1:press', () => expect(window.__ELAB_API.interact).toHaveBeenCalledWith('btn1', 'press', 'true')],
  ];

  actionMoreSuccessCases.forEach(([tag, expected, verify], index) => {
    it(`101-115 action bridge copre superficie ampia #${index + 1}`, () => {
      const result = __test__.executeActionTags(tag);

      expect(result).toContain(expected);
      verify();
    });
  });

  const verifierFailureCases = [
    ['loadExperiment', () => installApi({ loadExperiment: vi.fn(() => false) }), '[AZIONE:loadexp:v1-cap6-esp1]', 'loadexp:v1-cap6-esp1'],
    ['addWire false', () => installApi({ addWire: vi.fn(() => false) }), '[AZIONE:addwire:led1:anode:nano:D13]', 'addwire:led1:anode->nano:D13'],
    ['addWire null', () => installApi({ addWire: vi.fn(() => null) }), '[AZIONE:addwire:led1:anode:nano:D13]', 'addwire:led1:anode->nano:D13'],
    ['addWire ok false', () => installApi({ addWire: vi.fn(() => ({ ok: false })) }), '[AZIONE:addwire:led1:anode:nano:D13]', 'addwire:led1:anode->nano:D13'],
    ['addComponent null', () => installApi({ addComponent: vi.fn(() => null) }), '[AZIONE:addcomponent:led:200:150]', 'addcomponent:led-new'],
    ['compile false', () => installApi({ compile: vi.fn(() => false), getEditorCode: vi.fn(() => 'void setup(){}') }), '[AZIONE:compile]', 'compile'],
    ['compile success false', () => installApi({ compile: vi.fn(() => ({ success: false })), getEditorCode: vi.fn(() => 'void setup(){}') }), '[AZIONE:compile]', 'compile'],
    ['compile status error', () => installApi({ compile: vi.fn(() => ({ status: 'error' })), getEditorCode: vi.fn(() => 'void setup(){}') }), '[AZIONE:compile]', 'compile'],
    ['loadblocks false', () => installApi({ loadScratchWorkspace: vi.fn(() => false) }), '[AZIONE:loadblocks:<xml></xml>]', 'loadblocks'],
    ['loadblocks ok false', () => installApi({ loadScratchWorkspace: vi.fn(() => ({ ok: false })) }), '[AZIONE:loadblocks:<xml></xml>]', 'loadblocks'],
    ['export ok false', () => installApi({ unlim: { ...window.__ELAB_API.unlim, exportFumetto: vi.fn(() => ({ ok: false })) } }), '[AZIONE:exportfumetto:pdf]', 'exportfumetto'],
    ['invalid wire', () => installApi(), '[AZIONE:addwire:led1:anode]', 'addwire'],
    ['missing loadblocks payload', () => installApi(), '[AZIONE:loadblocks]', 'loadblocks'],
    ['missing setcode payload', () => installApi(), '[AZIONE:setcode]', 'setcode'],
    ['missing switcheditor mode', () => installApi(), '[AZIONE:switcheditor]', 'switcheditor'],
  ];

  verifierFailureCases.forEach(([name, setup, tag, forbidden], index) => {
    it(`116-130 verifier non dichiara azioni fallite #${index + 1} ${name}`, () => {
      setup();

      const result = __test__.executeActionTags(tag);

      expect(result.join('|')).not.toContain(forbidden);
    });
  });

  const aliasCases = [
    ['buzzer', 'buzzer-piezo'],
    ['cicalino', 'buzzer-piezo'],
    ['pulsante', 'push-button'],
    ['pushbutton', 'push-button'],
    ['fotoresistenza', 'photo-resistor'],
    ['photoresistor', 'photo-resistor'],
    ['ldr', 'photo-resistor'],
    ['batteria', 'battery9v'],
    ['battery', 'battery9v'],
    ['arduino', 'nano-r4'],
    ['nano', 'nano-r4'],
    ['led', 'led'],
    ['resistor', 'resistor'],
    ['motor-dc', 'motor-dc'],
    ['rgb-led', 'rgb-led'],
  ];

  aliasCases.forEach(([input, expected], index) => {
    it(`131-145 normalizza alias componenti da linguaggio classe #${index + 1}`, () => {
      expect(__test__.normalizeActionComponentType(input)).toBe(expected);
    });
  });

  const wireCases = [
    [['addwire', 'led1', 'anode', 'nano', 'D13'], ['led1:anode', 'nano:D13']],
    [['addwire', 'r1', 'pin1', 'led1', 'cathode'], ['r1:pin1', 'led1:cathode']],
    [['addwire', 'nano:GND', 'rail:-'], ['nano:GND', 'rail:-']],
    [['addwire', 'btn1', 'pin1', 'nano', 'D2'], ['btn1:pin1', 'nano:D2']],
    [['addwire', 'buzzer', 'positive', 'nano', 'D8'], ['buzzer:positive', 'nano:D8']],
  ];

  wireCases.forEach(([parts, expected], index) => {
    it(`146-150 normalizza fili quattro parti e pin completi #${index + 1}`, () => {
      expect(__test__.normalizeActionWirePins(parts)).toEqual(expected);
    });
  });

  const visualNarrativeCases = [
    ['guarda il circuito', true],
    ['analizza questo circuito', true],
    ['controlla se la breadboard e giusta', true],
    ['vedi lo schema e dimmi errore', true],
    ['riesci a vedere il circuito?', true],
    ['osserva la lavagna', true],
    ['screenshot del simulatore', true],
    ['foto del mio circuito', true],
    ['il circuito e corretto? guarda', true],
    ['schema breadboard errore', true],
    ['analizza immagine circuito', true],
    ['aggiungi un LED', false],
    ['collega led a nano D13', false],
    ['compila il codice', false],
    ['carica esperimento semaforo', false],
    ['apri Arduino', false],
    ['mostra il manuale', false],
    ['ferma la simulazione', false],
    ['pulisci tutto', false],
    ['guarda e aggiungi un LED', false],
    ['controlla e compila il codice', false],
  ];

  visualNarrativeCases.forEach(([message, expected], index) => {
    it(`151-170 visual trigger Pixtral-style non ruba azioni #${index + 1}`, () => {
      expect(__test__.shouldUseVisualNarrative(message)).toBe(expected);
    });
  });

  const agentActionCases = [
    'aggiungi un led',
    'metti un resistore',
    'collega il filo',
    'costruisci circuito led',
    'piazza un buzzer',
    'monta il semaforo',
    'togli il filo',
    'rimuovi led2',
    'sistema il circuito',
    'ripara errore',
    'avvia simulazione',
    'compila Arduino',
  ];

  agentActionCases.forEach((message, index) => {
    it(`171-182 AgentDecision action-first Nanobot #${index + 1}`, () => {
      const seed = buildAgentDecisionSeed({ message, simulatorContext: { circuit: { components: [{ id: 'led1' }], wires: [] } } });

      expect(seed.act.needed).toBe(true);
      expect(seed.act.requireVerifier).toBe(true);
    });
  });

  const agentVisionCases = [
    'guarda lo schermo',
    'vedi la foto',
    'analizza screenshot',
    'cosa c e nella lavagna',
    'controlla immagine',
    'osserva il mio circuito',
    'guarda la breadboard',
    'vedi errore sullo schema',
    'leggi questa schermata',
    'guarda questo disegno',
  ];

  agentVisionCases.forEach((message, index) => {
    it(`183-192 AgentDecision attiva vision quando serve Pixtral #${index + 1}`, () => {
      const seed = buildAgentDecisionSeed({ message, simulatorContext: {} });

      expect(seed.vision.needed).toBe(true);
    });
  });

  const agentClarifyCases = [
    'fai quella cosa',
    'metti quel coso',
    'sposta la cosa',
    'non so cosa fare con quello',
    'li vicino',
  ];

  agentClarifyCases.forEach((message, index) => {
    it(`193-197 AgentDecision chiarisce solo quando manca stato caldo #${index + 1}`, () => {
      const seed = buildAgentDecisionSeed({ message, simulatorContext: {} });

      expect(seed.clarify.needed).toBe(true);
    });
  });

  const agentNoClarifyCases = [
    ['quella cosa non va', { circuit: { components: [{ id: 'led1' }], wires: [] } }, null],
    ['li vicino al led', { circuit: { components: [{ id: 'led1' }], wires: [] } }, null],
    ['non so cosa fare ora', { editorCode: 'void setup(){}' }, null],
  ];

  agentNoClarifyCases.forEach(([message, simulatorContext, narrativeContext], index) => {
    it(`198-200 AgentDecision usa stato caldo invece di chiarire a vuoto #${index + 1}`, () => {
      const seed = buildAgentDecisionSeed({ message, simulatorContext, narrativeContext });

      expect(seed.clarify.needed).toBe(false);
    });
  });
});
