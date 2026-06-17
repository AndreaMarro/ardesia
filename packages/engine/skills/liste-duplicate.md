# liste-duplicate

Una lista/costante/funzione duplicata in due punti = due fonti di verità che driftano
in silenzio: chi aggiorna la prima copia non sa che esiste la seconda. Il caso peggiore
è la copia che SHADOWA l'originale: un bugfix applicato alla copia sbagliata è un fix
che non esiste. Classe ricorrente del 2026-06-11/12 (3 occorrenze, 2 repo) — unica
delle 4 del giorno senza skill dedicata fino ad ora.

## When-to-apply

- Ogni diff che aggiunge una lista letterale, una costante magica o un helper "locale".
- Ogni script bash con heredoc Python/SQL: il posto classico dove la lista si duplica.
- In review: qualunque diff che AGGIUNGE una seconda copia di qualcosa che esiste già.

## Checklist/Procedura

- [ ] **Una lista vive in UN solo punto**; ogni altro consumer la importa o la legge
  (env, import, variabile). Esempio VERO: `bin/run_all_teacher_books.sh` duplicava i
  10 TEACHERS nell'array bash E nel heredoc Python — dedup in 33f38ff: `export TEACHERS`
  + `os.environ['TEACHERS'].split()` con `exit(1)` se vuoto. Prima del fix, aggiungere
  un teacher all'array bash NON lo aggiungeva al run Python.
- [ ] **Mai due definizioni della stessa funzione (module-level + nested)**: la copia
  nested SHADOWA quella module-level e il fix applicato a una sola copia non vale.
  Esempio VERO: `lessonos/capsule/extraction.py:67` (pre-9369536) — copia nested morta
  di `_negation_preserved` dentro `_repair_excerpt` shadowava la module-level: il fix
  word-boundary (bypass 'non'⊂'nonostante', retro-review MAJOR) sarebbe stato
  inefficace se applicato solo fuori. Rimossa in 9369536: una sola implementazione.
- [ ] **Valori magici ripetuti → costante nominata unica**. Esempio VERO (H2 adversarial
  2026-06-12 14:38 su studio@215d1f2): `src/index.css:288` — breakpoint 768px duplicato
  in 4 regole `@media`; fix indicato: `--st-mobile-bp` come fonte unica.
- [ ] **Prima di duplicare "per comodità"**: chiediti chi aggiorna la seconda copia
  quando la prima cambia. La risposta vera è: nessuno. Estrai, importa, o leggi da env.
- [ ] **Grep pre-commit sul diff**: se il diff aggiunge una lista/funzione, grep del
  primo elemento o del nome (`grep -rn "<nome>" lessonos/ bin/ tests/`) e verifica che
  non esista già altrove. Due hit = dedup PRIMA di committare.
- [ ] **In review è MAJOR anche a test verdi**: una seconda copia introdotta non rompe
  nulla oggi; il costo arriva al primo drift, quando le due copie divergono in silenzio.

## Origine-RETRO

- Classe "liste-duplicate" segnalata dal coach tra le 4 ricorrenti del 2026-06-11/12 —
  unica senza skill (severita-verificata la cita come "fixata puntualmente in
  33f38ff/9369536", ma il fix puntuale non previene la prossima duplicazione).
- 33f38ff (2026-06-11 13:34): TEACHERS duplicata bash array + heredoc Python in
  `bin/run_all_teacher_books.sh` — item M1-3b.
- 9369536 (2026-06-11 22:08): copia nested morta di `_negation_preserved` in
  `extraction.py:67` shadowava la module-level — retro-review MAJOR 1+2.
- H2 adversarial 2026-06-12 14:38 su studio@215d1f2: 768px duplicato in 4 regole CSS —
  terza occorrenza, cross-repo: il pattern ricorre, per convenzione README (>=2) DEVE
  essere skill.
