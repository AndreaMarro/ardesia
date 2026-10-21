# PR 269 / PR 270 — verifica indipendente di compatibilità

Data: 2026-10-21. Verifica in sola lettura dei checkout dei worker. Nessun merge, generatore o full suite eseguito.

## SHA e dipendenza

- Base comune dichiarata: PR #268, `61e7f00be9fc4ecfdf5eb362275b3b8a566d92bf`.
- PR #269, esame persistente: `b9764d2e1785c26893f424ea547d2df081e0aca2`, 19 file modificati rispetto alla base.
- PR #270, banca: `e9c87b072913744f6cc6df21217b8856cddfef1f`, 86 file modificati rispetto alla base.
- Handoff della banca: `packs/semestre-filtro-2026-27/docs/INTEGRATION-VALIDATION-2026-10-21.md:85`, branch `codex/physics-bank-4000-20261021`, base `codex/ardesia-public-rea-20261020`. Il checkout locale è shallow; `git merge-base` non ha ricostruito l'antenato. Sono stati confrontati direttamente i tree degli SHA disponibili.

## Risultati

1. **Compatibilità testuale verificata.** L'unico file modificato da entrambe le PR è `services/study-api/study_api/app.py`. `git merge-file -p`, applicato ai tre blob esatti estratti dagli SHA sopra in una directory temporanea e senza modificare checkout o index, termina con codice 0 e nessun conflitto. Il risultato conserva le route esame e l'installazione delle route banca. Parsing Python del risultato PASS. Questo non dimostra compatibilità runtime dell'unione: suite, typecheck e migrazioni dell'unione restano NOT_RUN.

2. **Nessun adattatore banca → esame nelle due PR.** #269 `packages/engine/lessonos/study/exam.py:12–24,35–95` carica un pack fisso, esige `type: mcq`, quattro opzioni testuali, risposta indice intero e spiegazioni entro 4000 caratteri. #270 `packages/engine/lessonos/study/question_bank.py:242–280` usa `format: multiple_choice`, cinque opzioni A–E, risposta strutturata, metadati editoriali e soluzione discorsiva. Il probe su `u1-area-conversion-02` mantiene tutte le cinque opzioni: il validatore #269 restituisce realmente `exam_mcq_invalid` / 409. Il pack originale #269 è accettato dallo stesso validatore. Non è stato eliminato alcun distrattore per ottenere compatibilità.

3. **La banca è una capacità di pratica separata.** #270 `question_bank.py:358–463` seleziona 31 domande e corregge una risposta, ma dichiara `persisted: false`; `PhysicsQuestionBank.tsx:221` parla di tempo di riferimento e correzione dopo ogni risposta. Non crea tentativi persistenti, timer autoritativo, consegna unica, ricevuta o voce del diario. L'esame persistente #269 continua a caricare il proprio pack da 31 quesiti; applicare entrambe le PR non integra automaticamente i 4000 in quell'esame.

4. **CoursePack preservato, non ampliato a otto corsi.** #270 `catalog.py:10–13,30–37` mantiene i due pack esistenti e aggiunge `questionBankIds` al descrittore del corso Fisica. I JSON e gli SHA immutabili dei CoursePack restano invariati. `bank_for_edition` ricontrolla l'appartenenza e il descrittore dell'edizione prima della cache. I percorsi `sf-u1`…`sf-u7` e `sf-fisica-simulazioni` del manifest sono filtri della banca, come dichiara il README:107; non diventano CoursePack, quattro lezioni o nuove edizioni.

5. **Dipendenze isolate.** `sympy==1.14.0` e `jsonschema==4.23.0` sono in `bin/content/physics_bank/requirements.txt`, a supporto editoriale. La differenza non modifica lockfile o manifest delle dipendenze applicative. Il runtime usa JSON statici, Fraction e alias. Non è stato eseguito il generatore né una nuova acquisizione REA.

6. **Stato scientifico esplicito, con transizione ancora da progettare.** README e report mantengono `DRAFT`, revisore nullo e revisione scientifica umana NOT_RUN. Il caricatore #270 rifiuta attualmente record diversi da `DRAFT` / `reviewer: null`; questa PR non implementa la pipeline completa di approvazione/pubblicazione. I PASS nei report del worker sono evidenze dichiarate dal worker, non suite rieseguite in questa verifica.

## Artefatti della verifica

- `textual-compatibility.json`: elenco dei file, SHA, esito del confronto a tre vie.
- I tre blob `app.py` e l'anteprima a tre vie sono intermedi temporanei, non inclusi nella consegna: sono recuperabili con `git show <SHA>:services/study-api/study_api/app.py` usando gli SHA sopra.
- `contract-probe.json`: risultato del probe sul validatore esame e controllo sintattico dell'anteprima.

Nessuna modifica ai file dei worker. Nessun nuovo sottosistema completo acquisito.
