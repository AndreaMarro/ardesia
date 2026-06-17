import { describe, it, expect } from 'vitest';

/**
 * 30 domande UNLIM — verifica qualita risposte simulate
 * Categorie: facili, medie (azioni), difficili (catene+debug)
 */

const QUESTIONS = [
  { q: 'Cosa e un LED?', tags: [], maxW: 60 },
  { q: 'Perche serve il resistore?', tags: [], maxW: 60 },
  { q: 'Cosa e la breadboard?', tags: [], maxW: 60 },
  { q: 'Come funziona la batteria?', tags: [], maxW: 60 },
  { q: 'Cosa significa polarita?', tags: [], maxW: 60 },
  { q: 'A cosa serve il filo?', tags: [], maxW: 60 },
  { q: 'Cosa e un circuito?', tags: [], maxW: 60 },
  { q: 'Come si accende il LED?', tags: [], maxW: 60 },
  { q: 'Cosa fa il pulsante?', tags: [], maxW: 60 },
  { q: 'Cosa e Arduino?', tags: [], maxW: 60 },
  { q: 'Avvia la simulazione', tags: ['play'], maxW: 30 },
  { q: 'Mostrami il LED', tags: ['highlight'], maxW: 30 },
  { q: 'Carica il primo esperimento', tags: ['loadexp'], maxW: 30 },
  { q: 'Ferma tutto', tags: ['pause'], maxW: 30 },
  { q: 'Compila il codice', tags: ['compile'], maxW: 30 },
  { q: 'Annulla', tags: ['undo'], maxW: 20 },
  { q: 'Resetta il circuito', tags: ['reset'], maxW: 30 },
  { q: 'Premi il pulsante', tags: ['interact'], maxW: 30 },
  { q: 'Cambia il resistore a 220 ohm', tags: ['setvalue'], maxW: 30 },
  { q: 'Pulisci tutto', tags: ['clearall'], maxW: 20 },
  { q: 'Costruisci un circuito con LED', tags: ['clearall', 'addcomponent'], maxW: 60 },
  { q: 'Il LED non si accende', tags: ['highlight'], maxW: 60 },
  { q: 'Spiega la legge di Ohm', tags: [], maxW: 60 },
  { q: 'Confronta serie e parallelo', tags: ['loadexp'], maxW: 60 },
  { q: 'Costruisci e avvia', tags: ['addcomponent', 'play'], maxW: 60 },
  { q: 'Cosa fa digitalWrite 13 HIGH?', tags: [], maxW: 60 },
  { q: 'Debug: buzzer non suona', tags: ['describe', 'highlight'], maxW: 60 },
  { q: 'Carica semaforo e avvialo', tags: ['loadexp', 'play'], maxW: 30 },
  { q: 'Aggiungi potenziometro e ruotalo', tags: ['addcomponent', 'interact'], maxW: 40 },
  { q: 'Fai screenshot', tags: ['screenshot'], maxW: 20 },
];

const RESPONSES = [
  'Un LED e come una lampadina piccola che si accende solo nel verso giusto. Ha due gambe: la lunga e il piu.',
  'Il resistore protegge il LED! Senza, troppa corrente lo brucia. Come un rubinetto che regola il flusso.',
  'La breadboard e un piano di lavoro con fori collegati. Ci infili i componenti senza saldare.',
  'La batteria spinge gli elettroni nel circuito, come una pompa spinge acqua nei tubi.',
  'Polarita significa che ogni componente ha un verso giusto. Il piu va al piu, il meno al meno.',
  'Il filo e la strada dove passa la corrente. Collega i componenti tra loro.',
  'Un circuito e un percorso chiuso dove la corrente scorre dalla batteria ai componenti e torna.',
  'Per accendere il LED serve collegarlo alla batteria con un resistore, rispettando la polarita.',
  'Il pulsante e un interruttore: quando lo premi chiudi il circuito e la corrente passa.',
  'Arduino e un piccolo computer che puoi programmare per controllare LED, motori e sensori!',
  'Avvio la simulazione! [AZIONE:play]',
  'Ecco il LED evidenziato! [AZIONE:highlight:led1]',
  'Carico il primo esperimento! [AZIONE:loadexp:v1-cap6-esp1]',
  'Fermo tutto! [AZIONE:pause]',
  'Compilo il codice! [AZIONE:compile]',
  'Annullato! [AZIONE:undo]',
  'Resetto! [AZIONE:reset]',
  'Premo il pulsante! [AZIONE:interact:btn1:press]',
  'Cambio il resistore! [AZIONE:setvalue:r1:resistance:220]',
  'Pulisco tutto! [AZIONE:clearall]',
  'Costruisco! [AZIONE:clearall] [AZIONE:addcomponent:led:200:150] [AZIONE:addcomponent:resistor:200:200]',
  'Il LED sembra collegato al contrario! [AZIONE:highlight:led1]',
  'La legge di Ohm dice: V = I x R. Con 9V e 470 ohm, la corrente e circa 19mA.',
  'Ti mostro la differenza! [AZIONE:loadexp:v1-cap8-esp1]',
  'Aggiungo un LED e avvio! [AZIONE:addcomponent:led:200:150] [AZIONE:play]',
  'digitalWrite accende il pin 13: manda 5V al LED collegato li.',
  'Controlliamo... [AZIONE:describe] Il buzzer potrebbe essere al contrario [AZIONE:highlight:buzzer1]',
  'Carico il semaforo e avvio! [AZIONE:loadexp:v3-cap6-semaforo] [AZIONE:play]',
  'Aggiungo potenziometro e lo ruoto! [AZIONE:addcomponent:potentiometer:300:200] [AZIONE:interact:pot1:rotate:128]',
  'Ecco la foto! [AZIONE:screenshot]',
];

function extractTags(text) {
  const regex = /\[AZIONE:([^\]]+)\]/gi;
  const tags = [];
  let m;
  while ((m = regex.exec(text)) !== null) tags.push(m[1].split(':')[0].toLowerCase());
  return tags;
}

function countWords(text) {
  return text.replace(/\[AZIONE:[^\]]+\]/gi, '').trim().split(/\s+/).filter(w => w.length > 0).length;
}

describe('UNLIM 30 Domande — Qualita Risposte', () => {
  QUESTIONS.forEach((q, i) => {
    it(`${i + 1}. "${q.q}"`, () => {
      const resp = RESPONSES[i];
      const tags = extractTags(resp);
      const words = countWords(resp);

      for (const t of q.tags) expect(tags).toContain(t);
      expect(words).toBeLessThanOrEqual(q.maxW);
      expect(words).toBeGreaterThanOrEqual(1);
    });
  });
});
