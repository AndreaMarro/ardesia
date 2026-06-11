# test-falsificabili

Ogni test deve poter FALLIRE se il bug che dichiara di prevenire esistesse. Chiude le
3 forme di "test-che-non-può-fallire" viste il 2026-06-11 (4 occorrenze in un giorno,
2 repo) NON coperte da test-determinism (che copre SHA/`>=`) né da grounding-check
(che copre tautologia-da-mock).

## When-to-apply

- Ogni nuovo test o test modificato nel diff.
- In review: per ogni `assert`, chiediti "se introduco il bug dichiarato nel nome/commento
  del test, questo assert fallisce?" Se la risposta è no o "dipende dall'ordine", è un finto test.

## Checklist/Procedura

- [ ] **Niente assert mascherati**: nessun `assert X or True`, `assert X or <fallback-vero>`,
  `assertTrue(True)`. Esempio VERO: `tests/test_teacher_book_renderer.py:340` aveva
  `assert "0" not in md or True` (sempre verde) — fixato in 5e7a536 e b17bc94 con assert
  strutturale ("Total teachers: 0" + righe tabella).
- [ ] **Niente pass-per-coincidenza**: se il test verifica che il codice SCELGA un oggetto
  tra candidati, i candidati devono essere DISTINGUIBILI dal comportamento testato (nomi/
  campi diversi), non solo per identità Python. Esempio VERO: `tests/test_dispensa.py:525-535`
  in d044044 — `test_concept_without_citations_skipped` usava due concetti entrambi
  `name="Energia"`: l'`assert is good_cit` passava anche per ordine di iterazione, non
  distingueva "skip per mancanza citazioni" da "scelto perché iterato per ultimo".
  Fix: nomi diversi (`EnergiaGhost` vs `EnergiaReal`) così solo il matching corretto passa.
- [ ] **Commento = assert**: il commento/nome del test non deve dichiarare un contratto
  che l'assert non verifica. Esempio VERO (studio@74c8349): `ReplayEngine.test.ts:139-143`
  — commento "attivi r1 e d1" ma assert `toHaveLength(1)`; il commento descriveva la
  specifica, l'assert l'implementazione (sbagliata). Se spec e implementazione divergono,
  il test va scritto sulla SPEC e deve fallire — o la spec va corretta esplicitamente.
- [ ] **Prova di rottura mentale**: prima di committare un test, individua la singola
  riga di produzione che il test protegge e chiediti cosa succede se la inverti/rimuovi
  (es. togli un `continue`, inverti un confronto). Se nessun assert fallirebbe, il test
  non protegge niente: rinforzalo o eliminalo.
- [ ] **Un assert sul VALORE, non solo sulla forma**: `toHaveLength(n)` / `len(x)==n`
  da solo non basta quando conta QUALE elemento c'è: aggiungi assert su id/nome
  dell'elemento atteso (`assert result[0].name == "EnergiaReal"`).

## Origine-RETRO

- H2 adversarial 2026-06-11 13:27 su lessonos@d044044: test tautologico per identità
  (`test_dispensa.py:525-535`).
- H2 adversarial 2026-06-11 13:27 su studio@74c8349: commento-contratto vs assert
  (`ReplayEngine.test.ts:139-143`).
- M1-3-FIX (5e7a536) + M1-4 warm-up (b17bc94): `assert ... or True` sempre verde
  (`test_teacher_book_renderer.py:340`) — stesso anti-pattern fixato 2 volte in 2 commit.
- Classe "test-che-non-possono-fallire" segnalata dal coach come ricorrente del giorno.
