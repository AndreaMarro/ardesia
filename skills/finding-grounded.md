# finding-grounded

Un finding con file:line sbagliato o evidenza allucinata costa quanto un CRITICO falso:
chi triaga deve ri-verificare tutto da zero. Il report H2 10:43 su lessonos@88c4619 aveva
3/3 finding con posizione errata e 1/3 interamente falso. `severita-verificata` calibra
la SEVERITÀ; questa skill calibra l'EVIDENZA: qui i finding erano 0-CRITICI ma non-grounded.

## When-to-apply

- In review/adversarial: prima di scrivere QUALUNQUE finding nel report, qualunque severità.
- In triage: quando un finding cita file:line che non matcha il codice a HEAD.
- Sempre quando leggi file lunghi con finestre limitate (Read con offset/limit).

## Checklist/Procedura

- [ ] **file:line verificato a HEAD, non a memoria**: dopo aver formulato il finding,
  `grep -n <simbolo> <file>` e conferma che la riga citata contenga davvero il costrutto.
  Esempio VERO (report 10:43 su 88c4619): "style.py:270 — open senza with" — la riga 270
  è dentro la frozenset `_WRITTEN_FORMAL`; l'`open().read()` reale è a
  `lessonos/style.py:469`. Finding sostanzialmente vero ma introvabile per chi triaga.
- [ ] **Il TUO read-window troncato NON è il file**: prima di scrivere "file troncato /
  sintassi invalida", prova meccanica obbligatoria: `python3 -m py_compile <file>` (o
  `tsc --noEmit`) oppure `wc -l` + lettura della CODA del file. Esempio VERO (stesso
  report): "tests/test_style.py:261 — `def test_on_real_corpus(s` troncato, sintassi
  invalida" — FALSO: il file compila, il test è completo a `tests/test_style.py:343-362`;
  la riga 261 è `density = _math_density(text)`. Era troncata la lettura, non il file.
- [ ] **Un finding falso sul gate è un'accusa grave**: "verificare che il gate 1685/0 sia
  stato eseguito su questo esatto codice" (stesso finding) insinuava un gate falso-verde
  partendo da evidenza allucinata. Accuse al gate richiedono la prova più forte di tutte:
  esegui tu il compile/collect prima di scriverle.
- [ ] **Niente flusso di coscienza nel report**: se mentre scrivi ti auto-smentisci, il
  finding muore lì o rinasce verificato. Esempio VERO (report 10:43 su studio@cb09e84,
  `src/design/icons.tsx:82`): "IconDot ignora props.size? No, corretto: ... ma lo spread
  è prima? No, è dopo" — tre ipotesi e due smentite pubblicate invece di una conclusione
  verificata. Il dubbio si risolve LEGGENDO, prima di scrivere.
- [ ] **Cita il simbolo, non solo la riga**: `style.py:469 (_clean… in derive_written_style)`
  sopravvive al drift di righe tra il commit recensito e HEAD; il numero nudo no.
- [ ] **Triage di finding non-matchanti**: prima grep del simbolo nel file (può essere
  drift di righe → finding valido, posizione stantia); se il costrutto non esiste affatto
  nel file → falso positivo, documenta la prova (file:line reale) come da severita-verificata.

## Origine-RETRO

- H2 adversarial 2026-06-12 10:43 su lessonos@88c4619: 3/3 finding con file:line errati
  (270→469, 385-400, 261→343); finding "test troncato" interamente falso — verificato
  dal coach 2026-06-12 (`py_compile` OK, 362 righe, test completo). Un tick di triage
  bruciato a smontarlo.
- H2 adversarial 2026-06-12 10:43 su studio@cb09e84: finding icons.tsx:82 pubblicato
  come flusso di coscienza con doppia auto-smentita inline.
- Classe distinta dalle 4 del giorno: affine a severità-mal-calibrata (stesso costo di
  triage) ma la severità era corretta — è l'evidenza a essere non-grounded. Nessuna
  skill esistente copre il grounding dei REPORT (grounding-check copre il codice).
