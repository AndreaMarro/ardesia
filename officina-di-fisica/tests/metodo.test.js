import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document ??= { querySelector: () => null };

const { metodoContent, metodoModuli, sprintContent } = await import('../static/js/metodo.js');

test('ogni microcorso presenta formule inverse, tre disegni successivi e esercizio senza calcolatrice', () => {
  assert.deepEqual(metodoModuli, ['C1', 'C2', 'C3', 'C4', 'C5']);
  for (const id of metodoModuli) {
    const html = metodoContent(id);
    assert.match(html, /Formule inverse e lettura dei grafici/, id);
    assert.equal((html.match(/data-tex=/g) || []).length, 5, 'cinque passaggi algebrici per ' + id);
    assert.equal((html.match(/<svg /g) || []).length, 3, 'tre disegni progressivi per ' + id);
    assert.equal((html.match(/class="method-figure"/g) || []).length, 3, 'tre figure con didascalie per ' + id);
    assert.equal((html.match(/class="method-step"/g) || []).length, 5, 'cinque passaggi discorsivi per ' + id);
    assert.match(html, /Prova senza calcolatrice/, id);
    assert.match(html, /Trucco che evita errori/, id);
    assert.ok(!/NaN|undefined|\[object Object\]/.test(html), 'nessun dato non valido per ' + id);
  }
});

test('le cinque pagine trattano aspetti fisici distinti e controlli non confondibili', () => {
  assert.match(metodoContent('C1'), /pendenza del grafico spazio-tempo/);
  assert.match(metodoContent('C2'), /raggio.*alla quarta|quarta potenza/s);
  assert.match(metodoContent('C3'), /grafico p–V|diagramma p–V/);
  assert.match(metodoContent('C4'), /reciproco|1\/R/);
  assert.match(metodoContent('C5'), /fra due creste|distanza fra le creste/);
});

test('l’indice C6 collega tutti i cinque microcorsi senza duplicarne le schede', () => {
  const html = metodoContent('C6');
  for (const id of metodoModuli) assert.ok(html.includes('corso/' + id + '/metodo'));
});

test('l’ingresso sprint distingue diagnosi, allenamento e simulazione normativa', () => {
  const html = sprintContent();
  assert.match(html, /Preparazione rapida all’esame/);
  assert.match(html, /31 quesiti e 50 minuti/);
  assert.match(html, /21 a scelta/);
  assert.match(html, /10 a completamento/);
  assert.match(html, /MUR|Ministero/);
  assert.ok(html.includes('allenamento/C6'));
  for (const id of metodoModuli) assert.ok(html.includes('corso/' + id + '/esercizi'));
});
