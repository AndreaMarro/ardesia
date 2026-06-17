#!/usr/bin/env node
/**
 * Wiki L2 concept generator — Sprint Q4
 * Andrea Marro 2026-04-25
 *
 * Genera 25+ concept markdown in docs/unlim-wiki/concepts/ da Capitolo schema.
 * Skip esistenti (idempotent). PRINCIPIO ZERO: linguaggio plurale ragazzi.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CAPITOLI_DIR = join(ROOT, 'src/data/capitoli');
const CONCEPTS_DIR = join(ROOT, 'docs/unlim-wiki/concepts');
const TODAY = new Date().toISOString().slice(0, 10);

const CONCEPTS = [
  { id: 'led-rgb', title: 'LED RGB', volume: 1, page: 35, capId: 'v1-cap7', tags: ['led', 'rgb', 'colori'], analogia: 'È come 3 LED in uno: rosso, verde, blu. Combinandoli ottenete qualsiasi colore!', parametri: 'Anodo o catodo comune. 4 piedini: R, G, B, comune.', errori: ['polarita-led'] },
  { id: 'pulsante', title: 'Pulsante', volume: 1, page: 43, capId: 'v1-cap8', tags: ['pulsante', 'interruttore', 'input'], analogia: 'È come un campanello: schiacciate, suona; rilasciate, smette.', parametri: '4 piedini, 2 attivi quando premuto. NO/NC: Normally Open o Closed.', errori: ['pulsante-non-funziona'] },
  { id: 'potenziometro', title: 'Potenziometro', volume: 1, page: 57, capId: 'v1-cap9', tags: ['potenziometro', 'resistenza-variabile', 'analog'], analogia: 'È come una manopola del volume: girate, cambia.', parametri: '3 piedini. Posizioni 0-100% mappano resistenza variabile.', errori: ['potenziometro-cablaggio'] },
  { id: 'fotoresistore', title: 'Fotoresistore (LDR)', volume: 1, page: 81, capId: 'v1-cap10', tags: ['fotoresistore', 'ldr', 'sensore-luce'], analogia: 'È un occhio elettronico: più luce vede, meno resistenza ha.', parametri: 'Resistenza 1kΩ-10MΩ. 2 piedini non polarizzati.', errori: ['ldr-saturato'] },
  { id: 'cicalino', title: 'Cicalino piezo', volume: 1, page: 93, capId: 'v1-cap11', tags: ['cicalino', 'buzzer', 'audio'], analogia: 'È un altoparlante minuscolo: corrente entra, esce un BIIIP.', parametri: '2 piedini polarizzati (+/-). Tensione 3-12V.', errori: ['cicalino-no-suono'] },
  { id: 'interruttore-magnetico', title: 'Interruttore magnetico (reed switch)', volume: 1, page: 97, capId: 'v1-cap12', tags: ['reed', 'magnetico', 'sensore'], analogia: 'È un interruttore che si chiude quando un magnete si avvicina, come una calamita sul frigo.', parametri: '2 piedini non polarizzati. Distanza max 1-2 cm dal magnete.', errori: ['reed-non-chiude'] },
  { id: 'elettropongo', title: 'Elettropongo (pongo conduttivo)', volume: 1, page: 103, capId: 'v1-cap13', tags: ['elettropongo', 'pongo', 'creativita'], analogia: 'È pongo da modellare CHE conduce elettricità! Come fili morbidi.', parametri: 'Resistenza ~1kΩ/cm. Pongo conduttivo (sale) vs isolante (zucchero).', errori: ['pongo-mescolato-male'] },
  { id: 'breadboard', title: 'Breadboard', volume: 1, page: 21, capId: 'v1-cap4', tags: ['breadboard', 'cablaggio', 'base'], analogia: 'È una griglia di buchi collegati sotto. Non serve saldare, basta infilare.', parametri: '830 punti standard. Strisce rosse/blu (alimentazione) verticali. Righe a-e e f-j orizzontali.', errori: ['fili-righe-sbagliate'] },
  { id: 'batteria-9v', title: 'Batteria 9V', volume: 1, page: 25, capId: 'v1-cap5', tags: ['batteria', 'alimentazione', 'base'], analogia: 'È il serbatoio di energia del circuito. Spinge gli elettroni.', parametri: '9V tensione, ~500mAh capacità. Polo + (smaller terminal) e − (larger).', errori: ['polarita-invertita-batteria'] },
  { id: 'multimetro', title: 'Multimetro', volume: 2, page: 13, capId: 'v2-cap3', tags: ['multimetro', 'misura', 'strumento'], analogia: 'È il termometro del circuito: misura tensione, corrente, resistenza.', parametri: 'Voltmetro (V parallelo), Amperometro (A serie), Ohmmetro (Ω circuito spento).', errori: ['multimetro-fondo-scala'] },
  { id: 'condensatore', title: 'Condensatore', volume: 2, page: 63, capId: 'v2-cap7', tags: ['condensatore', 'capacita', 'filtro'], analogia: 'È una piccola batteria che si carica e scarica velocissimo.', parametri: 'Capacità in Farad (F). Valori tipici 1µF-1000µF. Polarizzato (elettrolitico) o no (ceramico).', errori: ['condensatore-polarita'] },
  { id: 'transistor', title: 'Transistor BJT', volume: 2, page: 75, capId: 'v2-cap8', tags: ['transistor', 'bjt', 'amplificatore'], analogia: 'È un interruttore comandato dalla corrente: piccola corrente apre porta a grande corrente.', parametri: '3 piedini: Base (B), Collettore (C), Emettitore (E). NPN o PNP. Guadagno hFE 50-300.', errori: ['transistor-piedini'] },
  { id: 'fototransistor', title: 'Fototransistor', volume: 2, page: 85, capId: 'v2-cap9', tags: ['fototransistor', 'sensore-luce', 'transistor'], analogia: 'È un occhio molto sensibile: la luce gli dà la base, e fa passare corrente.', parametri: '2 piedini. Reagisce a infrarossi e luce visibile.', errori: ['fototransistor-direzione'] },
  { id: 'motore-dc', title: 'Motore DC', volume: 2, page: 93, capId: 'v2-cap10', tags: ['motore', 'attuatore', 'dc'], analogia: 'È una giostra elettrica: corrente entra, asse gira.', parametri: '2 piedini. Inverti polarità → inverti rotazione. Attenzione: corrente alta richiede transistor o MOSFET.', errori: ['motore-stallo', 'motore-flyback'] },
  { id: 'diodo', title: 'Diodo', volume: 2, page: 103, capId: 'v2-cap11', tags: ['diodo', 'senso-unico', 'protezione'], analogia: 'È una strada a senso unico: corrente passa solo da Anodo a Catodo, mai contrario.', parametri: 'Anodo (lato lungo simbolo) → Catodo (lato fascia argento). Caduta tensione ~0.7V silicio, ~0.3V Schottky.', errori: ['diodo-invertito'] },
  { id: 'mosfet', title: 'MOSFET', volume: 2, page: 109, capId: 'v2-cap12', tags: ['mosfet', 'transistor', 'switch'], analogia: 'È un interruttore comandato dalla TENSIONE (a differenza del BJT che vuole corrente).', parametri: '3 piedini: Gate (G), Drain (D), Source (S). Tipico Vgs threshold 2-4V per logic-level.', errori: ['mosfet-non-conduce'] },
  { id: 'arduino', title: 'Arduino Nano R4', volume: 3, page: 37, capId: 'v3-cap4', tags: ['arduino', 'microcontrollore', 'piattaforma'], analogia: 'È un computer minuscolo che possiamo programmare. Ha cervello, occhi (input) e mani (output).', parametri: 'ATmega328p clock 16MHz. 14 pin digitali (D0-D13), 6 analogici (A0-A5). Tensione 5V.', errori: ['ide-non-trova-porta'] },
  { id: 'blink', title: 'Blink — primo programma', volume: 3, page: 47, capId: 'v3-cap5', tags: ['blink', 'led', 'tempo'], analogia: 'È come dire al LED: "lampeggia ogni secondo, come un cuore che batte".', parametri: 'pinMode(13, OUTPUT), digitalWrite(HIGH/LOW), delay(1000).', errori: ['delay-blocca'] },
  { id: 'pin-digitali', title: 'Pin digitali', volume: 3, page: 53, capId: 'v3-cap6', tags: ['digitale', 'high-low', 'arduino'], analogia: 'I pin digitali capiscono solo 2 cose: 0 (LOW, spento) o 1 (HIGH, acceso). Sono come interruttori.', parametri: '14 pin (D0-D13). 5V = HIGH, 0V = LOW. Configurabili INPUT, OUTPUT, INPUT_PULLUP.', errori: ['pin-floating'] },
  { id: 'pin-analogici', title: 'Pin analogici', volume: 3, page: 63, capId: 'v3-cap7', tags: ['analogico', 'analogread', 'sensori'], analogia: 'I pin analogici leggono valori graduali, da 0 a 1023. Come un termometro che mostra ogni grado.', parametri: '6 pin (A0-A5). analogRead() restituisce 0-1023 mappato su 0-5V. analogWrite() PWM 0-255.', errori: ['analogwrite-su-pin-non-pwm'] },
  { id: 'serial-monitor', title: 'Serial Monitor', volume: 3, page: 75, capId: 'v3-cap8', tags: ['serial', 'debug', 'arduino'], analogia: 'È la finestra di chat tra Arduino e voi. Arduino vi parla con Serial.println().', parametri: 'Serial.begin(9600) o 115200. Serial.print(), println(), read(). Serial.available() per leggere input.', errori: ['baud-rate-mismatch'] },
  { id: 'circuito-chiuso', title: 'Circuito chiuso', volume: 1, page: 27, capId: null, tags: ['fondamenti', 'corrente'], analogia: 'È come un circuito di Formula 1: la macchina (corrente) deve fare TUTTO il giro. Strada interrotta = ferma.', parametri: 'Tutti i collegamenti devono essere completi. Un solo filo staccato = circuito aperto = niente corrente.', errori: ['filo-staccato'] },
  { id: 'polarita', title: 'Polarità', volume: 1, page: 25, capId: null, tags: ['fondamenti', 'segno', '+', '-'], analogia: 'Le batterie e alcuni componenti hanno un + e un -. Come destra e sinistra, vanno collegati nel verso giusto.', parametri: 'Componenti polarizzati: LED, batteria, condensatore elettrolitico, diodo. Non polarizzati: resistore, fili, breadboard.', errori: ['polarita-led', 'polarita-invertita-batteria'] },
  { id: 'corrente', title: 'Corrente elettrica', volume: 1, page: 9, capId: null, tags: ['fondamenti', 'corrente', 'amper'], analogia: 'È un fiume di elettroni che scorre nei fili. Più elettroni passano = più corrente.', parametri: 'Misurata in Ampere (A) o milliampere (mA). I tipici LED usano ~20mA.', errori: ['corrente-eccessiva'] },
  { id: 'tensione', title: 'Tensione', volume: 1, page: 9, capId: null, tags: ['fondamenti', 'volt', 'differenza'], analogia: 'È la spinta che dà la batteria agli elettroni. Più Volt = più forza.', parametri: 'Misurata in Volt (V). Batteria 9V = 9V tensione. LED tipico richiede 2-3V.', errori: ['tensione-troppo-alta'] },
  { id: 'servo-motor', title: 'Servo motor', volume: 3, page: null, capId: 'v3-bonus-servo-sweep', tags: ['servo', 'motore', 'pwm'], analogia: 'È un motore che si gira a un angolo preciso (0-180°), come una porta che si apre solo metà.', parametri: '3 fili: rosso (+5V), nero (GND), arancione (segnale PWM). servo.attach(pin), servo.write(angle).', errori: ['servo-vibra'] },
  { id: 'lcd-display', title: 'LCD display 16x2', volume: 3, page: null, capId: 'v3-bonus-lcd-hello', tags: ['lcd', 'display', 'output'], analogia: 'È un piccolo schermo che mostra 2 righe da 16 caratteri. Come un orologio digitale.', parametri: '16 pin (o I2C 4 pin). Libreria LiquidCrystal.h. lcd.begin(16,2), lcd.print().', errori: ['lcd-nessun-testo'] },
];

function buildConceptMd(concept) {
  const espRefs = concept.capId ? `- Vedi Capitolo: \`${concept.capId}\`\n- File: \`src/data/capitoli/${concept.capId}.json\`` : '- Concept fondamentale (multi-Capitolo)';
  const errorRefs = (concept.errori ?? []).map((e) => `- \`errors/${e}.md\``).join('\n');
  return `---
id: ${concept.id}
type: concept
title: "${concept.title}"
locale: it
volume_ref: ${concept.volume}
pagina_ref: ${concept.page ?? 'null'}
created_at: ${TODAY}
updated_at: ${TODAY}
updated_by: scribe-q4
tags: [${concept.tags.join(', ')}]
---

## Definizione

${concept.title} — concetto base ELAB Tutor. ${concept.volume && concept.page ? `Vol.${concept.volume} pag.${concept.page}.` : ''}

## Analogia per la classe

Ragazzi, ${concept.analogia}

## Parametri tipici

${concept.parametri}

## Esperimenti correlati

${espRefs}

## Errori comuni

${errorRefs || '_(da documentare)_'}

## PRINCIPIO ZERO

Quando spiegate questo concetto alla classe:
- Parlate in plurale ("Vediamo insieme", "Provate")
- Citate ${concept.volume && concept.page ? `**Vol.${concept.volume} pag.${concept.page}**` : 'il volume di riferimento'}
- Max 60 parole + 1 analogia concreta
- NO comandi diretti al docente (questo è guida silenziosa per voi)
`;
}

let created = 0;
let skipped = 0;
for (const concept of CONCEPTS) {
  const file = join(CONCEPTS_DIR, `${concept.id}.md`);
  if (existsSync(file)) {
    skipped++;
    continue;
  }
  writeFileSync(file, buildConceptMd(concept), 'utf8');
  created++;
}

const all = readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.md')).length;
console.log(`[wiki-concepts] created ${created}, skipped ${skipped}, total ${all}`);
