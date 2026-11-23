/* Build Italian speech from the rendered editorial blocks. No remote voice is selected. */
const vendor = '/vendor/sre-4.1.5/';
let engine;

// Editorial reading of this exact published expression. An edited formula goes back to MathML.
const echo = String.raw`s=v\Delta t,\qquad d_{\rm eco}=\frac{s}{2}`;
const echoReading = 'Il cammino totale, esse, è la velocità di propagazione per il tempo di andata e ritorno. La distanza del riflettore è il cammino totale diviso per due.';

async function mathReader() {
  if (!engine) {
    engine = (async () => {
      const packs = new Map(await Promise.all(['base','it'].map(async locale => {
        const response = await fetch(vendor + 'mathmaps/' + locale + '.json');
        if (!response.ok) throw Error('Regole di lettura non disponibili.');
        const source = await response.text();
        if (!Object.keys(JSON.parse(source)).length) throw Error('Regole di lettura vuote.');
        return [locale, source];
      })));
      const options = {
        locale: 'it', defaultLocale: 'it', domain: 'mathspeak', style: 'default',
        custom: async locale => {
          if (!packs.has(locale)) throw Error('Lingua non installata.');
          return packs.get(locale);
        },
      };
      if (!window.SRE) {
        window.SREfeature = { ...options, json: location.origin + vendor + 'mathmaps' };
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = vendor + 'sre.js';
          script.onload = resolve;
          script.onerror = () => { script.remove(); reject(Error('Motore di lettura non disponibile.')); };
          document.head.append(script);
        });
      }
      await window.SRE.setupEngine(options);
      await window.SRE.engineReady();
      return window.SRE;
    })().catch(error => { engine = undefined; throw error; });
  }
  return engine;
}

export function italianVoice(voices) {
  return Array.from(voices).find(voice => voice.localService === true && /^it(?:[-_]|$)/i.test(voice.lang));
}

export async function transcript(scope) {
  const paragraphs = [];
  for (const node of scope.children) {
    if (node.hidden) continue;
    const math = node.querySelector('math');
    let words;
    if (math) {
      const tex = math.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
      words = tex === echo ? echoReading : (await mathReader()).toSpeech(math.outerHTML);
      if (!words.trim()) throw Error('La formula richiede il MathML disponibile nel testo.');
    } else if (node.matches('.math')) {
      throw Error('La formula non è disponibile per la lettura a voce. Consulta il testo.');
    } else {
      const editorial = node.querySelector('figcaption, p') || node;
      words = editorial.innerText.trim();
    }
    if (words) paragraphs.push(words);
  }
  return paragraphs;
}

export function speechChunks(paragraphs) {
  // Short utterances also work with voices that stop in the middle of long passages.
  const chunks = [];
  for (const paragraph of paragraphs) {
    let part = '';
    for (const word of paragraph.split(/\s+/u)) {
      if (part && part.length + word.length > 200) { chunks.push(part); part = ''; }
      part += (part ? ' ' : '') + word;
      if (/[.!?]$/u.test(word)) { chunks.push(part); part = ''; }
    }
    if (part) chunks.push(part);
  }
  return chunks;
}

export function narrator(synth, utterance, update) {
  let generation = 0;
  let talking = false;
  function stop() {
    generation++;
    if (talking) synth?.cancel();
    talking = false;
  }
  async function play(scope) {
    stop();
    const token = generation;
    const voice = italianVoice(synth?.getVoices() || []);
    if (!voice || !utterance) { update('Voce italiana locale non disponibile.', false); return; }
    update('Preparazione dell’ascolto…', true);
    try {
      const chunks = speechChunks(await transcript(scope));
      let i = 0;
      function next() {
        if (token !== generation) return;
        if (i >= chunks.length) { talking = false; update('Ascolto terminato.', false); return; }
        const sentence = new utterance(chunks[i++]);
        sentence.lang = voice.lang;
        sentence.voice = voice;
        sentence.onend = next;
        sentence.onerror = () => {
          if (token === generation) { stop(); update('Ascolto interrotto. Puoi leggere la trascrizione.', false); }
        };
        talking = true;
        update('Ascolto in corso.', true);
        synth.speak(sentence);
      }
      next();
    } catch {
      if (token === generation) update('Ascolto non disponibile. Puoi riprovare o leggere il testo.', false);
    }
  }
  return { play, stop };
}
