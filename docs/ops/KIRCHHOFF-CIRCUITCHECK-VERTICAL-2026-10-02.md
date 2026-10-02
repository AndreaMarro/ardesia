# CircuitCheck nella lavagna Ardesia — ricevuta locale 2026-10-02

## Confine

Questa modifica resta nel repository **privato** Ardesia. Il servizio
Kirchhoff/CircuitCheck resta nel suo repository separato: Ardesia non copia né
ricalcola la matematica elettrica. L'oggetto `io.ardesia.circuit-reasoning` usa
il registro degli embed esistente, la scena Excalidraw e il write-back ToolHost
con ownership `board.write(own-embeds)`. Il circuito, la prova ricevuta e il
tentativo sono stato del proprio oggetto nella scena. Non contengono foto,
chiavi o dati identificativi di studenti.

Il motore locale è raggiunto nello sviluppo tramite il proxy Vite same-origin
`/circuitcheck/api/*`. Avviare il servizio Kirchhoff separatamente e poi Studio
con `KIRCHHOFF_LOCAL_URL=http://127.0.0.1:<porta>`. L'opzione accetta soltanto
loopback HTTP con porta esplicita. Non esiste un endpoint CircuitCheck pubblico
configurato per lo Studio distribuito: il bottone mostra un errore se il
servizio non è disponibile. La fotografia resta nel percorso standalone di
Kirchhoff e non viene inoltrata automaticamente da Ardesia.

## Cosa è provato

- Un circuito DC non catalogato produce `42/5 V` tramite il servizio reale,
  passa dalla stessa verifica `electrical_claim=VERIFIED` e `backend=CLOSED`
  usata dalla vista standalone, e appare nell'oggetto lavagna.
- Un tentativo `R1+R2=11 Ω` riceve la diagnosi del primo errore: il valore
  corretto è `10 Ω`. Il risultato matematico arriva dal servizio Kirchhoff.
- Prima dell'evento di lezione, la scena viene scritta dal ToolHost e salvata
  immediatamente nello store. Ricaricare subito la pagina conserva circuito,
  prova e tentativo. Alla riapertura il risultato è marcato storico fino a un
  nuovo calcolo; la vecchia diagnosi non è esposta come corrente.
- Il log LessonOS riceve `circuit.proof.verified` e
  `circuit.trace.assessed`, entrambi attribuiti alla stanza e con evidenza
  `board:<embedId>`. Il secondo descrive il tentativo senza dichiarare che lo
  studente abbia completato l'esercizio o acquisito un concetto.
- Il test locale `e2e/circuit-check-live.spec.ts` esercita i due server reali,
  la UI, il salvataggio/riapertura e gli eventi attribuiti alla lezione. Esporta
  inoltre un vero `.lesson` e apre lo ZIP: `raw/board.excalidraw` contiene
  risposta esatta e tentativo, `raw/lessonos-events.jsonl` contiene i due tipi
  di evento. Il test è ignorato nei job senza i due URL espliciti.

## Limiti ancora aperti

- La validazione end-to-end di `.lesson` → Engine → materiale rivisto → PDF →
  recupero nella lezione successiva non è stata dimostrata. L'export `.lesson`
  e il suo contenuto sono verificati, ma il materiale pedagogico dell'Engine non proietta
  ancora diagrammi/equazioni CircuitCheck in una dispensa rivista.
- Il proxy è locale allo sviluppo. Una distribuzione necessita di un servizio
  autenticato, policy di rete e verifica con host reale prima di qualificare
  questa integrazione come disponibile fuori da questa macchina.
- I write-back delle bozze durante la digitazione seguono la persistenza
  ordinaria della lavagna. La barriera durevole esplicita copre prova e
  diagnosi prima dei relativi eventi, non equivale a una garanzia generale su
  tutti i plugin, tutte le schede o tutte le chiusure improvvise.
- L'oggetto importa il circuito come netlist; non trasforma automaticamente
  qualsiasi disegno Excalidraw in topologia elettrica. Il percorso manuale e
  la lavagna strutturata sono disponibili in Kirchhoff standalone.

## Riproduzione

1. Nel checkout Kirchhoff, avviare `uv run --no-sync python
   scripts/serve_student.py --port 43923`.
2. Nel checkout Ardesia, avviare `KIRCHHOFF_LOCAL_URL=http://127.0.0.1:43923
   npm run dev -- --host 127.0.0.1 --port 43920 --strictPort` da `apps/studio`.
3. Dalla lavagna usare «circuiti», inserire la netlist nel test live, risolvere,
   aggiungere il tentativo, verificare e ricaricare la pagina.
4. Gate automatizzato: `ARDESIA_STUDIO_E2E_BASE_URL=http://127.0.0.1:43920
   KIRCHHOFF_LOCAL_URL=http://127.0.0.1:43923 npx playwright test
   e2e/circuit-check-live.spec.ts` da `apps/studio`.

Nessun merge, push o deploy è implicato da questa ricevuta.
