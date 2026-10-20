# Quaderno scientifico canonico

Il kind `scientific-notebook` è riservato al comando che verifica originale,
proprietario ed edizione. Il salvataggio riusa ricevute e transazione canoniche;
la revisione usa CAS e mantiene immutabile il binding
(`lessonos/study/scientific_notebook.py:138`).

Lo stato v1 conserva titolo e annotazioni con pagina e rettangolo normalizzato
non ruotato. La validazione rifiuta campi estranei, geometrie fuori pagina,
Unicode invalido e budget superati; il testo è derivato, senza troncamento
(`lessonos/study/scientific_notebook.py:24`).

Schema 6: binding per risorsa e snapshot per revisione, con cascade sulle
identità canoniche (`lessonos/study/schema.sql:197`). Le API richiedono schema
pronto; l'inizializzazione esplicita rifiuta collisioni del kind legacy
(`lessonos/study/store.py:74`).

La lettura verifica prima il diritto alla revisione esatta e poi aggiunge lo
snapshot (`lessonos/study/store.py:374`). Una consegna del quaderno richiede
anche il suo originale (`lessonos/study/submissions.py:57`). Export include i
PDF necessari e verifica source coerente tra revisioni della stessa risorsa,
con integrità interna unsigned, non autenticità server
(`lessonos/study/portable.py:66`, `lessonos/study/portable.py:186`).

API, migrazione, evidenze REA e limiti:
`docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-CORE.md` (root del monorepo).
L'editor visuale è ora integrato nell'aula e in «Il mio lavoro», con note,
formule MathLive, geometria PDF, Undo isolato, salvataggio e riapertura. La
consegna collega la revisione salvata e il suo originale; il tutor legge lo
snapshot consegnato. Bozze non salvate solo in memoria, con avviso ed export.
Verifiche e limiti residui:
`docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-EDITOR.md`.
