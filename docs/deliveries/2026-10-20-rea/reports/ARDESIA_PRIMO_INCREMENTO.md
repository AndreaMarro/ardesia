# Ardesia — prima anteprima pubblica separata

20 ottobre 2026 · **Verificata in locale, non pubblicata**

L’anteprima è disponibile, mentre il processo locale rimane attivo, su
[127.0.0.1:5392](http://127.0.0.1:5392/).

Ho seguito le priorità iniziali dello ZIP: recupero del candidato, verifica
dell’hosting, separazione della pagina pubblica dalla sandbox e laboratorio
funzionante. Il lavoro riparte dal codice esistente di Ardesia.

## Risultato

La pagina pubblica ha ora un ingresso e un adapter HTTP dedicati. Presenta il
programma proposto e usa il calcolo Poiseuille del Core, senza aprire login,
database, area privata o raccolta contatti. Prezzo e calendario rimangono da
definire. La previsione scritta nel laboratorio resta nella memoria della pagina:
non viene inviata al server e si azzera al ricaricamento.

L’identità visiva esistente è conservata: fondo avorio, verde profondo,
tipografia editoriale, illustrazione scientifica originale e accento terracotta.
La sezione finale invita a un secondo esperimento. È stata aggiunta l’icona del
sito, la cui assenza era stata rilevata da REA come errore 404.

## Codice ed evidenze

- Repository: `AndreaMarro/ardesia`.
- Base: `d0235e8a9dbbccd6808741a087dd0359908feb2b`.
  La precedente PR 267 risulta chiusa senza merge; il codice è stato recuperato
  dal suo branch conservato.
- Nuovo commit locale: `9ad5b38e1892ff4a081ff2d5fad201926b7d8d23`.
- Branch: `codex/ardesia-public-rea-20261020`.
- Checkout: `/tmp/ardesia-public-rea-20261020`, collegato a `work/ardesia`.
- Consegna: `ARDESIA_PUBLIC_REA.zip` contiene patch, file modificati, screenshot,
  log, manifest e bundle REA. È un incremento del repository, non una copia
  autonoma dell’intero monorepo. La patch è disponibile anche separatamente.
- Nessun push, merge o deploy eseguito. Le dipendenze di prodotto e il lockfile
  sono invariati.

REA **6.7.0** è la versione stabile più recente rilevata su npm e nella
[release ufficiale](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0),
pubblicata il 18 ottobre 2026. È già registrata in Codex con Node 24.19.0.
È stato usato realmente tramite MCP stdio: inizializzazione, scoperta dei 207
tool, `capture_browser_scenario` ed `export_evidence_bundle`. Questo collegamento
non equivale all’aggiunta a caldo dei tool alla chat.

| Flusso | Osservazione nella base | Cambiamento verificato |
|---|---|---|
| Apertura pubblica | Ingresso condiviso con la sandbox e chiamata `/study/me` | Ingresso dedicato; sole API `/study/public/*` |
| Programma | `/study/course`, metadati dimostrativi | `/study/public/course`, programma proposto senza prezzo o date |
| Laboratorio | `/study/activities/evaluate` | Endpoint pubblico limitato a Poiseuille; stesso Core |
| Contatto | Form sintetico con dominio `.invalid` | Nessun form di raccolta e nessun invio di contatti |
| Errori | UI condivisa già dotata di stati di errore | Retry del programma e del calcolo; previsione conservata |
| Risposta tardiva | Protezione già presente nel laboratorio | Verificata anche sul nuovo ingresso pubblico |

Il manifest collega i bundle all’identità del sorgente e agli hash della build.
Gli hash di HTML, CSS, JavaScript e favicon catturati da REA coincidono con quelli
dei file effettivamente serviti.

Tutti i passi degli scenari REA si sono conclusi. La copertura globale resta
marcata **incompleta** dal provider: alcuni corpi delle richieste GET non sono
esposti. Il supplemento desktop conserva tutti i corpi delle risposte richieste,
compreso il JavaScript. Non si presume copertura di ogni percorso possibile,
né equivalenza dei corpi acquisiti con i byte originali sul canale di rete.

## Collaudo

| Verifica eseguita | Risultato |
|---|---|
| Suite HTTP completa dell’adapter Study | 214 test passati |
| Suite Web completa, un worker | 141 test passati |
| TypeScript e build pubblica | Passati |
| Chrome, 390 / 820 / 1440 px | Calcolo reale e layout senza overflow orizzontale |
| Pressione / portata fissata | Risultati numerici coerenti con lo stesso Core |
| Tastiera | Skip link, focus visibile, selettore e slider verificati |
| Movimento ridotto | Transizioni disattivate nella preferenza `reduce` |
| Errori 503 e risposta obsoleta | Recupero verificato con guasti di trasporto simulati |
| Persistenza | Nessun cookie o storage creato; azzeramento al reload verificato |
| Accessibilità automatica | Nessuna violazione nei controlli Axe WCAG A/AA selezionati |
| Zoom | Zoom CSS 200%, senza overflow; zoom nativo del browser non verificato |
| Console nella prova finale ordinaria | Nessun errore |

Due esecuzioni precedenti della suite Web hanno avuto timeout nei test di
sessione privata. Quel file passa isolato sulla base e sul candidato; l’esecuzione
completa finale passa senza modificare test o timeout. I log conservano anche
gli esiti precedenti.

Axe richiede una verifica manuale per i testi SVG. I rapporti delle coppie di
colori dichiarate sono 7,25:1 per l’illustrazione e 7,21:1 / 5,83:1 per il
laboratorio. Le sovrapposizioni del disegno non sono certificate dal controllo
automatico. Sono stati ispezionati gli screenshot; questo non prova una UI
“perfetta” né sostituisce un collaudo con utenti.

## Ripresa

Applicare `ARDESIA_PUBLIC_REA.patch` alla base indicata, oppure continuare dal
checkout locale. Nell’ambiente con le dipendenze del progetto:

```sh
npm run build:web:public
python bin/study-public/serve.py
```

Il server ascolta solo su `127.0.0.1:5392`. L’API ammette corpi fino a 4096 byte,
lettura entro 2 secondi e 120 richieste pubbliche al minuto per processo, condivise
fra tutti i visitatori. Non è una configurazione di protezione distribuita.

Il preflight Vercel del progetto `ardesia-lavagna` e del deployment indicato nello
ZIP restituisce **403 forbidden** nello scope `andreas-projects-6d4e9791`.
Non è disponibile una CLI Vercel già configurata come alternativa. Stato,
protezione, costi e rimozione del deployment precedente restano sconosciuti.
Prima della pubblicazione occorrono accesso verificato al progetto, configurazione
dell’hosting per questo adapter e approvazione del rilascio. Nessuna raccolta di
interesse reale è stata attivata.

Questo risultato chiude il primo incremento locale. Non certifica G0/G1,
Postgres/Supabase, l’intera area privata o gli sviluppi successivi dello ZIP.
