# Quaderno scientifico — riapertura delle versioni esportate

Incremento locale del 20 ottobre 2026, base `12296e6be225be7571be88ca55b67bd3fd30784d`.
Il formato Core già conservava PDF, snapshot, coordinate e formule. La preview
li scartava, mostrando soltanto testo e allegati. Questo incremento conserva
il modello e usa lo stesso lettore della versione canonica per aprire una
revisione esatta del file in «Il mio lavoro» e nei materiali del tutor.

## Confini

`NotebookPanel` conserva il file JSON originale per il download e per POST
`/notebook/inspect`. Non parse/riserializza il corpo: coordinate Python `1.0`
e `-0.0` perderebbero la rappresentazione numerica e potrebbero invalidare gli
hash canonici. Il parser di presentazione lavora su una copia interpretata;
non sostituisce il controllo Core e non tenta di riprodurne la serializzazione.

La riapertura richiede attualmente API e sessione valide per l'ispezione.
Dopo questa verifica, il PDF viene decodificato dal file locale. Il percorso
non fa GET di risorse o originali, non cerca la head e non salva, consegna o
importa permessi. È lettura locale dopo ispezione online, non un'app offline.
Un file internamente integro non attesta autore, ruolo, corso o ricevuta canonica.

`scientificNotebookSnapshot.ts` definisce il modello condiviso e valida forma,
Unicode, testo derivato, pagine, geometria e budget. `notebookPreview.ts` conserva
edizione, snapshot e byte degli asset; rifiuta duplicati discordanti, asset ID
duplicati e cambiamenti di binding/kind tra revisioni della stessa risorsa.
Campi assenti nei precedenti bundle non scientifici rimangono compatibili.

`NotebookReading` è un componente senza sessione o accesso remoto. Riceve stato,
revisione e un input binario neutro `{blob}`; non crea un falso
`VerifiedOriginalAsset`, il cui descrittore proviene dal Core autorizzato.
`NotebookEditor` continua a verificare quel descrittore prima di usare il lettore.
Il renderer opzionale iniettato da Web evita una dipendenza Studio → Web;
Studio autonomo conserva il fallback testuale e il download.

## Identità e lifecycle

Una sola coppia resourceId/revisionId è aperta per volta. Il decoder seleziona
l'assetId dello snapshot, controlla MIME, byte dichiarati/effettivi e SHA-256
reale contro il digest incluso. Nessun fallback a un altro PDF con lo stesso
fingerprint o alla prima voce dell'archivio. Prima dell'overlay PDF.js deve
confermare il pageCount dichiarato. Note e formule statiche rimangono separate
dal percorso di editing/Undo e dalla tastiera MathLive.

Chiusura e cambio selezione smontano il lettore e revocano il suo URL di download.
Cambio file/sessione invalida la generazione e annulla le richieste; risultati
ritardati di file.text, digest, worker e rendering non ripubblicano la vecchia
preview. Il digest non è interrompibile: si ignora il risultato dopo l'abort.
I controlli di cleanup del worker già presenti in PdfReader vengono riusati.

Budget: file 96 MiB; asset totali 50 MiB nel Core; PDF selezionato 20 MiB e 20
pagine; 200 annotazioni; 20.000 codepoint derivati; stato 160 KiB. Non sono una
garanzia assoluta sulla memoria interna di PDF.js. Il parser conserva lo snapshot
anche quando manca il PDF, ma l'ispezione Core corrente rifiuta tale file:
il test del modello non dimostra un fallback raggiungibile nell'intero flusso.

## REA e ricostruzione

Configurazione esistente riusata: REA 6.7.0, MCP stdio, inventario reale di 207
tool. La verifica npm del 20 ottobre indica ancora solo il tag latest 6.7.0;
release ufficiale del 18 ottobre. Non è stata ripetuta l'installazione.

AFFiNE guest: profilo Chrome nuovo e posseduto dalla prova, documento sintetico
originale. REA ha creato titolo e nota, osservato la loro persistenza tra
navigazioni e aperto il menu Export. La cattura iniziale con Dismiss è fallita
perché il controllo non era disponibile dopo la navigazione; lo scenario
corretto senza quell'azione è riuscito. L'ultimo approfondimento del sottomenu
è fallito per timeout della scoperta CDP, ed è conservato come errore.
Nessuna prova di import PDF, download dell'export o reimport di AFFiNE.
`capture_browser_scenario` 6.7.0 non offre un'azione di upload file.
Le catture di rete restano parziali. Identità, passi e limiti:
`notebook-portable/affine-evidence-index.json`.

Il lettore locale viene preparato dal test harness con una fixture sintetica;
REA lo osserva passivamente, acquisendo struttura, script e screenshot. Questa
osservazione non viene descritta come un upload o una riapertura eseguiti da REA.
Acquisizione riuscita: 510 nodi DOM, 513 nodi di accessibilità, 11 script,
un worker PDF e screenshot del viewport. `inspect_web_page` dichiara
policy_filtered/attach_limited: nessuna richiesta nel periodo osservato e
nessuna disponibilità del traffico precedente. I CSS calcolati non sono
acquisiti da questa cattura; sorgenti CSS e layout sono verificati separatamente.
Lo screenshot è completo solo entro il viewport. Il bundle contiene tre
Evidence; identità e limiti sono in `notebook-portable/local-evidence-index.json`.
Gli schemi reali, le risposte complete e gli script sono nella consegna.
Nessun codice o asset AFFiNE è integrato nel prodotto. Si riusano PDF.js,
MathLive e DOMPurify già fissati e attribuiti nella consegna precedente.

## Verifiche e limiti

Esiti puntuali e identità della build: `notebook-portable/verification.json`.
Review del design, review UI con probe isolati e review indipendente del parser
sono conservate nella stessa directory. Il wrapper esterno review.sh non è
presente su questa macchina; tali review non sono un'esecuzione del wrapper.

Il roundtrip usa utenti sintetici e API SQLite reali: V1 consegnata, V2 privata,
export di studente e tutor, chiusura browser e riavvio API, nuova sessione e
riapertura del file. Le prove distinguono byte raw, JSON normalizzato rifiutato,
revisione selezionata, rete, pagine/formule, corruzione, cleanup e responsive.
Il primo controllo a 390 px ha trovato un overflow di 155 px causato dal
SHA dell'originale; `overflow-wrap: anywhere` sul pannello consente il ritorno
a capo senza nascondere il contenuto o alterare il canvas. Il delta CSS è stato
riletto indipendentemente sul sorgente; la nuova prova browser conferma scrollWidth uguale alla viewport a 390/820/1440 px.

Il primo gate Studio ha riportato 2155 passati e 2 falliti in file non modificati
(PluginWindow ed ElabV1Cap6Esp1Fixture); i relativi 11 test sono poi passati in
isolamento. Non è stata stabilita una causa certa del primo fallimento.
Il secondo gate congelato è fallito: 2156 passati, 1 fallito (no-emoji.test.ts, STACK_TRACE_ERROR senza elenco di caratteri); replay non eseguito. Causa non accertata. Script e flag invariati. Dopo due fallimenti si conserva il checkpoint senza commit, in accordo con AGENTS Studio §5.
Il primo harness export ha completato tutte le asserzioni e chiuso i browser,
ma il processo Node ha richiesto SIGTERM: non se ne dichiara exit 0. Report e
sequenza di riavvio sono conservati, insieme ai tentativi non riusciti.
Nessun risultato dei test Core/API precedenti è contato come nuova esecuzione.

Restano la parità completa con un workflow esterno di PDF annotato e reimport,
riapertura senza server, Safari/Firefox, touch/penna, screen reader e prestazioni
con 200 formule. Le bozze non salvate dell'editor continuano a essere in memoria.
Il lavoro complessivo, SYS-01 e SYS-02..08 restano aperti; nessuna certificazione
di UI perfetta, G0/G1 o rilascio. Nessun push, merge, deploy o messaggio esterno.
