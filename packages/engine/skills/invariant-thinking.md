# SKILL: invariant-thinking — pensare per invarianti (da errori REALI 10/06, lessonos)

Applica OGNI item al diff:
- [ ] **Scrittura su grafo/store**: chiediti SEMPRE (1) può entrare un dato di un'ALTRA lezione? (cross-lesson contamination: il grounding accettava segmenti verbatim di lezioni diverse); (2) la sequenza è ATOMICA? (delete+insert senza transazione = grafo corrotto su crash); (3) il rebuild da raw/ resta identico?
- [ ] **Garanzie nostre vs garanzie delle dipendenze**: testa il NOSTRO contratto (usiamo una transazione?), non la dipendenza matura (il rollback su SIGKILL è di SQLite). Non scrivere test che danno fiducia sul pezzo sbagliato.
- [ ] **Verifica meccanica ≠ verifica di senso**: un check "la citazione risolve + excerpt è substring" è aggirabile da output nonsense con citazioni valide. Dove l'output è generato da LLM, aggiungi UN test deterministico mock (input fisso → output atteso fisso) e riporta esempi VERI in STATUS per il giudizio umano.
- [ ] **Path in script**: mai interpolare path utente in stringhe Python/SQL inline (injection/SyntaxError con apostrofi) — passa via env/parametri.
- [ ] **STATUS onesto**: VERIFICATO (file esiste, test eseguito, output letto) separato da ATTESO. "Output atteso" non è un risultato.
