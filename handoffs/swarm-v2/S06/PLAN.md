# S06 — piano esecutivo

Spec: MANDATE.md adottato dalla richiesta «esegui». Base 37e0fe82. Implementazione inline nella chat assegnata. Nessun nuovo framework, provider AI o dipendenza; routing e shared API ai rispettivi owner.

1. [ ] Dominio: catalogo sui soli esempi consentiti e Taylor già registrato; fonte immutabile, percorso in risorsa privata Core, CAS/idempotenza, tentativi canonici e ripresa derivata dalle ricevute. Test RED/GREEN per perdita risposta, riapertura, permessi e assistenza.
2. [ ] UI: obiettivo e motivo espliciti, diagnostica, spiegazione/simulazione, prova, indizi graduati, recupero fonte, problema diverso, ripasso modificabile, contestazione e aiuto docente. Input e cache offline minimizzati e isolati; stato dispositivo distinto da ricevuta.
3. [ ] Consumer reale: adapter HTTP dedicato con autenticazione Core e aggancio concordato; browser con server/SQLite reali, chiusura/riapertura, seconda sessione, rete e revoca.
4. [ ] Verifica: suite proporzionate, typecheck, prova visuale desktop/mobile, review del confine. PR unica e handoff con SHA/prove/limiti. S00 integra e distribuisce; nessun DONE anticipato.

Scelte: snapshot in risorse Core esistenti, non un secondo registro. Un risultato numerico non valuta il ragionamento né prova mastery. Scheduler trasparente a intervalli configurabili; ts-fsrs resta candidato non adottato finché manca un bisogno giustificato. Le38 qualitative non sono sbloccate con mock score. Tutti i materiali attuali sono DRAFT e non si inventa approvazione.
