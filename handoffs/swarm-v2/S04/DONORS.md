# Riuso e decisioni

Nessuna nuova dipendenza, copia di sorgenti donor o asset esterno. Il consumer riusa `QuestionBank`, `ApprovalGate`, `studyRequest`, `QuestionBankReview`, permessi e sessioni Core. L'interprete aritmetico originale usa soltanto la libreria standard Python. La generazione precedente dichiara SymPy: questa sessione non chiama due volte quel generatore e non installa SymPy nel prodotto.

| Candidato | Fonte primaria riletta | Decisione per questo incremento | Limiti |
|---|---|---|---|
| Numbas | [Sito ufficiale](https://www.numbas.org.uk/), [documentazione](https://docs.numbas.org.uk/en/latest/) | Non adottato: la review corrente e l'audit non richiedono un secondo runtime di assessment | Apache2 dichiarata dal progetto; versione/pin, asset, closure e compatibilità non valutati. Nessun voto browser fidato introdotto |
| STACK | [Licenze](https://stack-assessment.org/Legal/Licenses/), [installazione](https://docs.stack-assessment.org/en/Installation/) | Non installato | GPLv3 del software e CC-BY-SA4 documentazione dichiarate dal progetto; integrazione con Maxima/Moodle non provata |
| PrairieLearn | [Repository ufficiale](https://github.com/PrairieLearn/PrairieLearn) | Riferimento per generatori; non incorporato | Pin/licenza/transitive da verificare prima di un'adozione. Nessun codice arbitrario HTML/JS/Python importato |
| DoenetML | [Repository ufficiale](https://github.com/Doenet/DoenetML) | Rinviato ai tipi di risposta mancanti | Nessuna versione/licenza verificata in questo incremento; nessuna pretesa di compatibilità |

Contenuti: 4 dossier e relativi transfer originali in `families.py`, DRAFT, senza firma umana. I record della banca e la consegna DeepSeek restano immutati. Il PDF ministeriale è usato per controllo di identità/provenienza; nessuna banca commerciale importata. Nessun dato esce dal runtime di audit, nessuna spesa o servizio nuovo.

Manutenzione: nuovi costrutti matematici richiedono test di dominio e limiti prima di essere dichiarati supportati. Rollback: rimuovere i due raccordi API/UI e i namespace nuovi; nessuna migrazione o dato persistente dell'audit da annullare. Le revisioni eventualmente salvate dal docente appartengono al ledger Core e vanno conservate.

REA: nessuna cattura o runtime donor eseguito; non necessario per il riuso di API/test già in-tree. Non si dichiarano risparmi moltiplicativi o esperimenti Numbas/STACK non eseguiti.
