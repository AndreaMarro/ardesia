# Ardesia + Kirchhoff — software locale e checkpoint

Data: 3 ottobre 2026. **Mandato complessivo incompleto.** La consegna corrente è descritta nel
[report completo](REPORT-CONSEGNA-ARDESIA-KIRCHHOFF-2026-10-03.md), con pubblicazione
sulle PR #259 e #17. Le sezioni seguenti conservano i checkpoint intermedi.

## Avvio

Da questo repository, con gli ambienti già presenti:

```sh
bash bin/dev-laboratory.sh --check
bash bin/dev-laboratory.sh
```

Il comando apre Studio su `http://127.0.0.1:5199`, Kirchhoff su
`http://127.0.0.1:43921` e il servizio lavagna su `http://127.0.0.1:4318`.
Tenere aperto il terminale; Ctrl+C ferma i tre processi avviati. Non avviare una
seconda copia sulle stesse porte. Non vengono installate dipendenze.

Per un checkout diverso impostare `KIRCHHOFF_DIR`; `KIRCHHOFF_PYTHON` permette
di scegliere un ambiente Python già pronto. Studio richiede i suoi `node_modules`
esistenti. La pagina autonoma e la MCP App di Kirchhoff richiedono la build web:
`cd web && npm run build` dalla radice Kirchhoff. Il servizio locale usa il
checkout corrente; non aggiorna la preview pubblicata in precedenza.

Le stanze sono salvate fuori dal repository, in
`~/.local/share/ardesia/room-sync`; `ROOM_SYNC_DATA_DIR` cambia il percorso.
Ogni processo deve avere una directory dati esclusiva. I dati locali di Studio
rimangono nel browser o nella cartella scelta dall'utente.

## Prima lezione riproducibile

1. Aprire Studio, dare un nome alla lezione e premere **Avvia lezione condivisa**.
2. Premere **circuiti**. Nell'editor dei componenti scegliere continua, aggiungere
   due resistori da 3 Ω e 6 Ω fra i nodi `a` e `0`, quindi chiedere la resistenza
   equivalente fra `a` e `0`. Rivedere i collegamenti, confermare e premere
   **Risolvi e verifica**. È disponibile anche l'ingresso da foto o ritaglio della
   lavagna; la trascrizione rimane modificabile prima della conferma.

   Nel pannello esperto facoltativo lo stesso circuito si scrive così:

   ```text
   R1 a 0 3 ohm
   R2 a 0 6 ohm
   ? resistance a 0
   ```

   Il risultato è **2 Ω**. Il pannello indica l'ambito delle sottoprove di porta;
   non attribuisce una certificazione completa alla derivazione originale.
3. **Condivisione e appunti → Invita a scrivere** crea un accesso revocabile.
   Aprirlo in un altro profilo del browser sulla stessa macchina. Un invito
   **a osservare** rimane in sola lettura anche cambiando i parametri della vista.
4. Disegnare da entrambe le finestre. **Annulla il mio intervento** conserva
   i contributi altrui. Durante una disconnessione la proposta locale rimane
   recuperabile; un conflitto sullo stesso oggetto richiede una scelta visibile.
5. Gli **appunti personali** rimangono sul dispositivo e hanno un export proprio.
   Non sono inclusi nella sincronizzazione della lavagna.
6. Aprire **Materiali → Esporta .lesson**. In un browser vuoto importare il file,
   aprire la lezione e il recap stampabile. Disegno, prova, scopo e riferimenti
   restano nel bundle; una prova riaperta richiede un nuovo calcolo per essere
   presentata come verificata nella sessione attuale.
7. **Continuità** riprende le sessioni e gli esercizi registrati. Non deduce
   automaticamente attività didattiche da segni arbitrari sulla lavagna.

Avviare una condivisione da una lavagna già esistente crea una **nuova lezione**
con copia della scena. Le evidenze precedenti non vengono attribuite alla nuova
lezione: ricalcolare il circuito lì per registrarne l'evento.

## Kirchhoff AC e MCP

È disponibile una lezione RLC a singola frequenza con generatori sinusoidali
indipendenti di tensione e corrente. Esempio:

```text
@ac 100 rad/s
V1 a 0 10 volt 30deg
R1 a b 3 ohm
L1 b c 1/25 henry
C1 c 0 1/100 farad
? current R1
```

La corrente è `(5/6 + 5/6*sqrt(3)) + j*(5/6 - 5/6*sqrt(3)) A`.
MNA e tableau indipendente confrontano tutti i rami, con controlli delle leggi
dei componenti e dei residui. Il contratto è `PHASOR_PATHS_CROSSCHECKED`,
`product_verified=false`; convenzione `exp(+j*omega*t)`. Inserire
`@amplitude rms` oppure `@amplitude peak` subito dopo `@ac` per dichiarare la
scala dei fasori. Senza dichiarazione resta `unspecified`; non viene inferita
dalle immagini. PDF, quaderno, focus del componente
e recap conservano la convenzione dichiarata.

Per la potenza complessa sostituire l'ultima riga con `? power V1` e dichiarare
`@amplitude rms` o `@amplitude peak`. Il risultato distingue **P in W** e **Q in
var**, con convenzione passiva: positivo significa assorbito. Per lo stesso
esempio, con ampiezze di picco, il generatore ha `S = -25/3 - j25/3 VA`.
Il fattore `1/2` viene applicato solo al caso di picco. La seconda via usa il
prodotto rettangolare indipendente; il bilancio considera tutti i rami.
Il contratto è `PHASOR_POWER_CROSSCHECKED`, sempre `product_verified=false`.
La potenza viaggia anche nel `.lesson` Ardesia, nel recap e nel riferimento al
componente; non è trattata come un fasore di tensione o corrente.

Il server MCP Kirchhoff si avvia dal suo checkout con
`.venv/bin/python -m kirchhoff.api.mcp_server`. La MCP App è inclusa nella
wheel/sdist e la build rifiuta risorse mancanti o obsolete. È stata esercitata
con l'SDK Apps in un host locale di prova. L'accettazione in un host esterno
specifico resta separata.

Ardesia espone inoltre un vero server MCP stdio per leggere e modificare una
stanza configurata: [contratto e configurazione](../../services/room-sync/README.md).
Usa il medesimo servizio HTTP della lavagna. Il token è una configurazione del
processo, mai un argomento del tool. Di default espone solo la lettura; l'utente
abilita le mutazioni nella configurazione del server. Revoca, versioni degli
oggetti, conflitti e annullamento rimangono controllati dal servizio canonico.

## Correzioni rese necessarie dalle prove reali

- Il salvataggio di un embed attende sia la scena sia il journal, evitando un
  bundle incompleto dopo un ricalcolo seguito subito da reload/export.
- Materiali, Continuità e dashboard separano l'identità della lezione dai
  parametri di accesso nel fragment; il grant non diventa un percorso su disco.
- Il bundle rinumera soltanto le posizioni degli eventi esportati della lezione.
  Identità, payload e prove restano invariati; il log sorgente non viene riscritto
  e la validazione rigorosa dell'import resta attiva.
- Ogni nuova sessione scrive il proprio documento canonico a partire dal vero
  evento di avvio. Continuità inizializza l'archivio prima di leggere i file;
  conserva gli avvisi sulla persistenza del browser, senza promuoverla a un
  archivio autorevole. Le sessioni storiche prive del documento non vengono inventate.
- Il bundle schema 2 conserva tutti i documenti di sessione originali, con
  inventario e hash; il lettore accetta ancora lo schema 1. Un vecchio ZIP non
  può usare percorsi canonici per scrivere sessioni appartenenti ad altre lezioni.
- La conversione decimale AC usa intervalli razionali e precisione adattiva.
  Valori esatti quasi compensati non diventano falsi zeri nel risultato mostrato.
- Un retry dopo conferma persa usa la versione applicata dall'operazione stessa,
  evitando di sovrascrivere una successiva modifica di un altro partecipante.
- Continuità risolve il riferimento alla prova CircuitCheck solo se scena,
  evento, hash, sessione e build coincidono. Non risolve una revisione storica
  del disegno usando la sola scena corrente; gli avvisi sulla cache restano.

## Decisioni rispetto al mandato

| Richiesta / fonte | Implementazione ed evidenza | Limite |
| --- | --- | --- |
| Lavagna condivisa, 00/01 | Servizio persistente e UI; due contesti browser, offline, revoca, conflitto, undo | Accettazione loopback, nessun deploy remoto |
| Artefatti portabili e continuità, 01/03 | `.lesson` con scena/eventi, focus/scopo, import in browser vuoto e recap | Event log didattico locale, non replica multiutente completa |
| Integrazioni bidirezionali e MCP, 00/01 | CircuitCheck HTTP/MCP/App; tool MCP della stessa lavagna | Host Apps esterno e integrazioni istituzionali aperti |
| Copertura Kirchhoff, 01/03 | Porta DC in Ardesia, lezione AC servita, oracoli indipendenti | Tutte le 21 famiglie restano nella matrice; nessuna parità dichiarata |
| AutoCircuits, 02 | PDF reale recuperato dal form pubblico; tensione e corrente DC confrontate con Kirchhoff e oracolo Fraction indipendente | Un solo circuito; nessuna parità sulle 21 famiglie |
| Materiale autorizzato, 00/01 | Inventario privato; esercizio 11.17 in Kirchhoff e Ardesia, `.lesson` riaperto a freddo, PDF e quaderno | Trascrizione manuale non confermata dall'utente; non equivale ad accettazione dell'intero corpus o del riconoscimento foto |

AutoCircuits descrive [le 21 famiglie](https://autocircuits.org/autocir_specs.html).
L'ingresso [SPICE-like randomizza i valori numerici](https://autocircuits.org/autocir_spice_help.html):
i numeri sottoposti non possono essere trattati come un oracolo esterno invariato.
Il PDF effettivamente restituito usa `V1 = 7,8 V`, `R1 = 3,8 Ω` e `R2 = 3,3 Ω`.
Kirchhoff e l'oracolo indipendente producono `1287/355 V` e `78/71 A`, coerenti
con `3,625 V` e `1,099 A` pubblicati a tre decimali. PDF, risposte HTTP,
trascrizione e confronto sono in `MATJOURNEY/evidence-20261003/autocircuits-live/`.
I due tentativi precedenti nel browser non avevano restituito un PDF recuperabile;
il successivo accesso al form HTTP ha acquisito questa evidenza esterna puntuale.

## Checkpoint per continuare

Baseline: Ardesia `4d79a1148465c49a99522854db8851f7020048b3`;
Kirchhoff `60c72bb46ee2bdf22fa888c94dfaf2a9d0fa06ae`. Le modifiche successive
sono nel working tree e vanno conservate. Gate e hash finali sono nella receipt
locale `MATJOURNEY/evidence-20261003/mandate-receipt.md`.

La matrice Kirchhoff `docs/takeover/coverage-2026-10-02.json`, aggiornata al
3 ottobre, rimane `TARGET_INCOMPLETE`. Il relativo handoff AC è
`docs/takeover/HANDOFF_AC_2026-10-03.md` nel checkout Kirchhoff.

Gap di implementazione ancora aperti: ProofSession canonica di ogni passaggio
AC, famiglie dinamiche e trifase, percorso servito per generatori controllati e
operazionali, equivalenti Thévenin/Norton AC e due porte, StudentTrace AC, replica della memoria didattica
fra partecipanti, integrazioni istituzionali e collaborazione remota operativa.
Questi sono lavoro da fare; non sono bloccati da un'autorizzazione presunta.

Accettazioni esterne mancanti: host MCP App reale, riconoscimento delle immagini
private mediante provider autorizzato, confronto AutoCircuits oltre il primo
caso DC e intero corpus. Non inviare fonti private per superare questi limiti senza la
relativa autorizzazione.

Limiti locali: un processo per directory del servizio, capability link senza
account verificati, nessun ripristino del token proprietario, salvataggio offline
limitato dalla quota del browser, isolamento di più schede con lo stesso grant
non accettato. Redo condiviso non disponibile. L'audio/video e i servizi remoti
non sono attivati da questo launcher.

Continuità mantiene lo stato «degradata» sulla cache del browser e segnala i
riferimenti per cui manca ancora un resolver. I file originali di sessione,
scena e journal sono recuperabili e verificati nel roundtrip; questo non li
promuove automaticamente a memoria didattica certificata. L'import ha compensazione
dei guasti verificata, ma non è ancora certificata un'unica transazione esclusiva
contro le modifiche simultanee da altre schede.

## Incremento: originali, algebra e impedenza AC

**Materiali** importa un PDF locale e permette di scegliere le pagine da portare
sulla lavagna. Lo schema `.lesson` 3 conserva anche i byte del documento originale,
con hash e collegamento fra pagina e fonte. Gli schemi 1 e 2 restano leggibili.
Limiti: 20 MiB per PDF, 100 MiB complessivi e 32 documenti distinti per lezione;
reimportare lo stesso documento non consuma un'altra posizione. Dopo una riapertura
in un browser vuoto, il pannello della pagina permette di recuperare l'originale.
La pagina condivisa da sola non autorizza l'invio dell'intero documento.

Il comando **grafico** inserisce una funzione quadratica modificabile; copie
indipendenti, export SVG e riapertura nel `.lesson` sono verificati.

Per una prima impedenza AC usare l'editor con pulsazione 2 rad/s: R1 da `p` ad `a`
vale 3 Ω, L1 da `a` a `0` vale 2 H. Chiedere l'impedenza fra `p` e `0`: il risultato
è **3 + j4 Ω**. Il metodo spegne le sorgenti indipendenti e introduce una corrente
di prova di 1 A. Vengono mostrati circuito connesso, equazioni e passaggi algebrici.
Il percorso comprende app, MCP App in host locale di prova, lavagna Ardesia, PDF,
quaderno e `.lesson` riaperti. Il confronto indipendente dei risultati resta distinto
dalla certificazione canonica completa, ancora da realizzare.

Se i sorgenti Python cambiano mentre il server è aperto, calcolo ed export vengono
fermati con la richiesta di riavvio. Questo impedisce di attribuire al vecchio
processo l'identità del codice appena modificato.


## Consegna finale del 3 ottobre: Laplace e PDF condiviso

Laplace è ora servito tramite editor, HTTP/MCP, App locale, Ardesia, PDF e quaderno.
Esempio: regime Laplace, R1 da a a0 pari a3Ω, L1 da a a0 pari a2H, corrente
iniziale L1 = −2A a0−, domanda corrente di L1. Risposta: −2/(s+3/2) A·s.
Non viene calcolata la funzione del tempo. Il PDF originale è condiviso solo
con un gesto esplicito; la copia viewer portabile dichiara l'assenza della
cronologia remota. Studio2434/0, Kirchhoff2517/0, build e percorsi browser verdi.
Vedere il report completo per la matrice15PARTIAL/6NOT_SUPPORTED e l'audit
supplementare Laplace non acquisito. Nessuna accettazione di host App esterno.
