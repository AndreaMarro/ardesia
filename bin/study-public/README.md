# Anteprima pubblica Ardesia

Superficie locale separata dalla sandbox privata. Riusa il laboratorio
Poiseuille del Core e la UI Web esistente, con un ingresso dedicato.

## Avvio

Dalla radice del repository, con le dipendenze Node e Python del progetto:

```sh
npm run build:web:public
python bin/study-public/serve.py
```

Aprire `http://127.0.0.1:5392/`. La porta può essere cambiata con `--port`.
Il server serve frontend e API dallo stesso indirizzo e si lega solo al loopback.
Non eseguire il seed della sandbox per questa anteprima.

## Contratto

- `GET /study/public/course`: programma proposto, senza prezzo o date approvati.
- `POST /study/public/activities/evaluate`: solo `poiseuille-v1`, raggio relativo
  fra 0,5 e 2, pressione o portata fissata. Usa `evaluate_activity` del Core.
- Corpo JSON fino a 4096 byte, lettura entro 2 secondi, 120 richieste pubbliche
  al minuto per processo. Il limite è condiviso e in memoria, senza identificare
  il visitatore; non è un limite distribuito.
- Nessun database, sessione, login, raccolta contatti o invio della previsione.
  La previsione resta nella memoria della pagina e si perde al ricaricamento.
- I percorsi `/study/*` diversi dai due endpoint rispondono con un errore JSON,
  anche se è presente il frontend statico.

Questa modifica non abilita la sandbox sintetica per la produzione.
Il build standard `build:web` conserva il suo ingresso originale.
Una pubblicazione richiede ancora il preflight del progetto di destinazione,
la configurazione dell'hosting per questo adapter e l'approvazione del rilascio.
Non è stata modificata la configurazione Vercel del repository.

## Verifica eseguita il 20 ottobre 2026

- 214 test dell'adapter HTTP, inclusi 26 nuovi casi per questa superficie.
- 141 test Web; esecuzione finale con un worker. Due esecuzioni precedenti hanno
  avuto timeout intermittenti nei test di sessione privata; il file isolato passa
  sulla base e sul candidato. Non sono stati modificati quei test o i timeout.
- TypeScript e build pubblica superati.
- Chrome 155, viewport 390/820/1440, calcolo reale nei due vincoli, tastiera,
  movimento ridotto, ricaricamento, assenza di storage e invio della previsione.
- Errori 503 e risposta obsoleta verificati con intercettazione del trasporto.
  Layout verificato anche con zoom CSS 200%, non con lo zoom nativo del browser.
- Axe: nessuna violazione rilevata nei controlli WCAG A/AA selezionati.
  Il contrasto dei testi SVG resta indicato come verifica manuale dallo strumento.

REA 6.7.0 è stato usato via MCP stdio con `capture_browser_scenario` ed
`export_evidence_bundle`. Riferimenti della build pubblica finale:

- 390 px: `ev_395214fa598042b2175c6abd5e0a0be438c72b24314c46d07e40780e974c2fae`
- 820 px: `ev_1265a3961dad1994b62600a5cf9041c6320b387c4b929fdf2b0fa92ce22f1614`
- 1440 px, incluso JavaScript distribuito:
  `ev_a89cd638ecaf3cf06d58f438ff1b96763f15f1533c15ba564bdc1743bf8ef173`

REA marca la copertura globale degli eventi come incompleta: alcuni corpi di
richieste GET non sono esposti dal browser; non si presume la loro assenza.
Tutti i passi richiesti sono completati. DOM, CSS, JavaScript e risposte API sono
conservati nelle evidenze consegnate, con i limiti del provider.
Questi controlli non certificano l'intera Ardesia o l'idoneità alla produzione.
