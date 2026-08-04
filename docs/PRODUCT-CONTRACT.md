# ARDESIA — Product Contract

Stato: **CURRENT**.

Questo contratto non crea requisiti. Espone in forma corta gli invarianti che il
PRD definisce e rinvia alle sue sezioni normative senza duplicarne il testo. Dove
contratto e PRD divergono, il testo che vale è il PRD: qui la divergenza è un
difetto di questo file, non una deroga.

**Fonte normativa.** Il PRD definitivo è
`10-Requirements/2026-08-02-PRD-ARDESIA-DEFINITIVO.md` — non in questo repository:
vive nel repository separato del vault `ARDESIA-KNOWLEDGE` — con SHA-256
`5c1b346805dc4f1a0bfa8224ed01b56d8a0f4fcc97c3b6caafa2c677f529ad83`. I riferimenti
`§n` di questo documento puntano alle sezioni di quel file a quella SHA: se la SHA
cambia, i riferimenti vanno riverificati prima di essere citati.

## Ordine delle fonti (PRD §1.1)

1. decisioni esplicite più recenti di Andrea Marro;
2. il PRD e le decisioni correnti nel vault;
3. contratti e capitolati verificabili nel vault;
4. evidenze misurate nel repository e in produzione;
5. ricerche esterne primarie;
6. ricostruzioni, proposte e documenti archiviati.

Una chat, un README, una PR aperta o una schermata non prevalgono su una decisione
diretta più recente. Il software esistente descrive lo stato, non restringe la
visione.

## Clausole

| ID | Invariante | Fonte PRD |
|---|---|---|
| `PC-AUTH-001` | Il PRD con SHA congelato prevale su README, mappe, canon storici, chat e stato generato; lo stato osservato non diventa requisito. | §1.1-1.3, §29 |
| `PC-AUD-001` | ARDESIA è per tutti; i ruoli sono contestuali, non identità permanenti. | §3.1-3.3 |
| `PC-R1-001` | R1 comprende iPad nativo e browser/PWA di prima classe, Notebook e Whiteboard distinti con kernel condiviso e conversione senza perdita, Goodnotes parity completa su entrambe, Foglietto come nome corrente, LessonOS e marketplace universale. La matrice assegna le capacità al tipo pertinente senza trasformare un documento nel travestimento dell'altro. | §5.1, §6.3-6.5, §8 |
| `PC-AI-001` | L'AI è obbligatoria per il funzionamento pieno; senza AI resta operativo il nucleo documentale enumerato dal PRD. Ogni scrittura AI segue proposta, fonti/ragionamento, diff semantico, preview, conferma, commit atomico, undo, evento e receipt. Nessun documento può ridurre LessonOS a chat o dichiarare ARDESIA zero-LLM. | §11.1-11.4 |
| `PC-OBJ-001` | OOP+LEGO: nel Workspace sono fratelli NotebookDocument, WhiteboardDocument, PluginInstance/Foglietti, LinkedView, Collegamenti, Pack, Workflow, Session, EventLog, LessonOS scope e ACL/Policy/Provenance. Identità, proiezione e stato effimero sono distinti; Core/Plugin/Pack/Workflow non è una catena lineare esclusiva. | §4.6, §6.1-6.8 |
| `PC-PRIV-001` | Profili separati per contesto: personale privato; tutor vede soltanto la relazione; minori con visibilità genitoriale regolata; scuola conserva profili classe/scuola e non profila longitudinalmente il singolo alunno. | §11.7, §12 |
| `PC-MKT-001` | Un solo marketplace R1; contenuti gratuiti o venduti; venditore riceve il prezzo senza commissione ARDESIA; pagamenti tutor-allievo esterni; ricavo da piani, visibilità e strumenti maggiori con placement regolato. | §14.1, §14.5-14.9, §20 |
| `PC-INT-001` | Integrazioni provider-neutral con ChatGPT, Claude, Teams e sistemi equivalenti; scritture esterne preview/confirm/apply, ricevuta e revoca. | §8.3, §15 |
| `PC-R2-001` | R2 è immediatamente successiva: Simulation ed ELABTutor; UNLIM solo dentro ELABTutor; parità Tinkercad e uguaglianza certificata di montaggi, descrizioni, comportamenti e risultati ai libri ELAB. | §5.2, §16-18, §24 |
| `PC-TRUTH-001` | Claim di parity, certificazione, disponibilità o stato richiedono l'oracolo previsto; i gap restano gap e vengono segnalati ad Andrea. | §1.3, §8.1-8.2, §18, §25-26 |

## Cosa non è autorità

Nessuno di questi artefatti definisce scope, sequenza o economia, e nessuno di
essi può essere citato per contraddire una clausola:

- **README.md** — presentazione e navigazione del monorepo.
- **ARDESIA-MAP.md** — struttura del codice; dice dove sta cosa, non cosa è dovuto.
- **docs/CANON-INDEX.md** e i cinque canon del 23 giugno — archivio storico, con
  valore tecnico e nessuna autorità corrente.
- **docs/vault/ARDESIA-MAP.md** — snapshot storico di governance, non entry point
  operativo.
- **Chat e trascrizioni dell'assistente** — non sono decisioni.
- **Receipt e artefatti di run** — registrano ciò che è stato osservato.
- **Stato generato** — è una misura, non un requisito.

Un documento che si dichiara autorità non lo diventa: l'autorità è definita in
`PC-AUTH-001` e nell'ordine delle fonti sopra.

## Uso operativo

Un piano, una PR o una review che tocca il prodotto cita l'ID `PC-*` pertinente
**e** la sezione PRD che quell'ID indica. L'ID è un indice, non una scorciatoia:
non sostituisce la citazione della fonte, perché un contratto corto può invecchiare
mentre il PRD resta il testo lungo che decide.

Se un lavoro non trova un `PC-*` che lo copra, il caso appartiene al PRD e va
portato al PRD, non risolto allargando questo file.

Ordine di lettura consigliato per orientarsi — è un ordine di **costo**, non di
autorità: stato generato, questo contratto, PRD, `ARDESIA-MAP.md` per la struttura,
`docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md` per il processo.

## Stato vs requisito

Lo stato osservato è un fatto misurato a una data e a uno SHA; non equivale a un
requisito soddisfatto (PRD §1.2). Questo contratto non contiene stato: lo stato si
legge, e si legge generato.

```bash
python3 bin/state/project_state.py --print
```

`--print` scrive il JSON sullo standard output e **non tocca il disco**. Lo stesso
comando senza quel flag scrive invece due file: una vista CURRENT.md sotto
`docs/ops/` per la lettura umana e il JSON sotto `artifacts/state/` per le macchine.
Nessuno dei due è tracciato: sono gitignorati di proposito, perché uno stato
committato invecchia e ridiventa la fonte stale che il generatore esiste per
rimuovere.

Perciò: una clausola non si dichiara soddisfatta perché il codice sembra farlo.
`PC-TRUTH-001` richiede l'oracolo previsto, e un gap che resta gap è un risultato
corretto.

## Aggiornamento

Questo file cambia soltanto per uno di questi due motivi:

1. il PRD cambia — e allora servono la nuova SHA-256, la riverifica di ogni `§n`
   citato qui e la decision note prevista dalla regola di manutenzione (§29);
2. Andrea registra una decisione esplicita più recente — e allora la decisione
   entra prima nel vault, poi qui.

Ogni aggiornamento deve riallineare, nella stessa modifica, i cinque entry point del
monorepo: `docs/PRODUCT-CONTRACT.md`, `README.md`, `docs/CANON-INDEX.md`,
`ARDESIA-MAP.md`, `AGENTS.md`. Un contratto aggiornato con entry point non allineati
ricrea l'autorità concorrente che questo documento esiste per eliminare.

La regola nasce con un'eccezione, ed è meglio dichiararla che scriverla e violarla
in silenzio: quando questo contratto è stato introdotto, `AGENTS.md` **non** è stato
riallineato, perché modificarlo richiede un'autorizzazione dedicata. Finché resta
così, quel file non rinvia a nessuna clausola `PC-*` e conserva un guardrail che
`PC-AI-001` supera. È una contraddizione aperta e registrata, non una svista.

Non si aggiorna questo file per farlo combaciare con ciò che il codice fa oggi.
