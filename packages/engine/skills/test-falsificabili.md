# test-falsificabili

Ogni test deve poter FALLIRE se il bug che dichiara di prevenire esistesse. Chiude le
5 forme di "test-che-non-può-fallire" viste il 2026-06-11/12 (6 occorrenze in 2 giorni,
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
- [ ] **Determinismo = seconda istanza RICOSTRUITA**: `assert f(x) == f(x)` sulla stessa
  istanza in memoria non può mai fallire per una funzione pura — non testa il replay.
  Esempio VERO: `tests/test_status.py:138-149` (commit 32a7876) — `test_determinism` e
  `test_determinism_empty` chiamano `build_status_report(populated_store)` due volte
  sullo stesso store senza mutazione (H2 2026-06-12 04:55). Fix: serializza su disco,
  ricostruisci una SECONDA istanza store e confronta gli output cross-istanza.
- [ ] **Il test di regressione colpisce il RAMO del fix**: per ogni bugfix, il test deve
  (a) FALLIRE sul codice pre-fix (eseguilo mentalmente o con `git stash` sul fix) e
  (b) coprire OGNI ramo aggiunto dal fix — parametrizza le varianti edge. Esempio VERO:
  il fix 478f628 aggiunge `claim.excerpt is None or claim.excerpt == ""`
  (`lessonos/dispensa.py:475`) ma `test_excerpt_none_dropped`
  (`tests/test_dispensa.py:434`) copre solo `None`: il ramo `""` è scoperto e
  `excerpt="   "` passa ancora come verified (H2 2026-06-12 03:40, CRITICO).
  Fix: parametrizza `excerpt in (None, "", "   ")` → tutte droppate.

## Origine-RETRO

- H2 adversarial 2026-06-11 13:27 su lessonos@d044044: test tautologico per identità
  (`test_dispensa.py:525-535`).
- H2 adversarial 2026-06-11 13:27 su studio@74c8349: commento-contratto vs assert
  (`ReplayEngine.test.ts:139-143`).
- M1-3-FIX (5e7a536) + M1-4 warm-up (b17bc94): `assert ... or True` sempre verde
  (`test_teacher_book_renderer.py:340`) — stesso anti-pattern fixato 2 volte in 2 commit.
- Classe "test-che-non-possono-fallire" segnalata dal coach come ricorrente del giorno.
- H2 adversarial 2026-06-12 04:55 su lessonos@32a7876: determinismo same-instance
  tautologico (`test_status.py:138-149`) — la skill esisteva ma non copriva questa forma.
- H2 adversarial 2026-06-12 03:40 su lessonos@478f628 (CRITICO): test di regressione del
  fix false-verde non copre il ramo `excerpt == ""` aggiunto dal fix stesso — il bug
  originale (retro-review 02:13) era già rimasto "mai applicato" una volta; un test che
  non colpisce il fix lascia la porta aperta a una terza ricorrenza.
