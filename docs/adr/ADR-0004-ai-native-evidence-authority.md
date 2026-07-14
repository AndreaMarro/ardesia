# ADR-0004 — Ardesia AI-native con verità fondata sulle evidenze e autorità deterministica

- **Stato**: ACCEPTED
- **Data**: 2026-07-14
- **Ratifica**: Andrea Marro
- **Sostituisce**: ogni uso normativo di `ZERO-LLM in prodotto`

## Contesto

Ardesia deve comprendere ciò che avviene durante e fra le lezioni, generare
contenuti utili secondo il metodo del docente e conservare continuità verificabile.
Un sistema soltanto deterministico non interpreta adeguatamente audio, note,
lavagna e connessioni pedagogiche. Un sistema nel quale il modello possiede anche
l'autorità operativa confonde probabilità con verità e rende scope, consenso,
replay e cancellazione non affidabili.

Nel repository coesistevano due ordini incompatibili: `ZERO-LLM in prodotto` e una
visione AI-native. Questa ambiguità impediva di valutare correttamente sia il codice
esistente sia le nuove slice.

## Decisione

> **Ardesia è AI-native nell'esperienza, evidence-authoritative nella verità e deterministica nell'autorità.**

`ZERO-LLM` viene ristretto a **zero model-authoritative writes**. Il modello è
centrale nell'interpretazione e nella generazione, ma non acquisisce autorità su
stato, identità o azioni.

### Il modello può

- comprendere audio autorizzato, trascrizioni, note, lavagna e output dei plugin;
- riconoscere e collegare concetti, esempi, possibili errori e metodo del docente;
- collegare più lezioni e proporre open loop;
- generare recap, esercizi, verifiche, answer key e piani successivi;
- proporre contenuti live on-demand e patch reversibili della lavagna.

Ogni risultato è una proposta tipizzata, citata, versionata e revisionabile,
legata all'esatto manifest di evidenze usato. Uno structured output prova la forma,
non la correttezza semantica.

### Il kernel governa

- identità e scope;
- sequenze e idempotenza;
- consenso, privacy e retention;
- persistenza, hash e provenienza;
- revoca, cancellazione, replay e recovery;
- registrazione delle decisioni;
- applicazione reversibile dei comandi.

Plugin e modelli non scelgono scope, privacy o autorità. L'host li assegna e il
kernel li valida.

## Classi di autorità

```ts
type AuthorityClass =
  | "observed"
  | "deterministic-derived"
  | "model-proposal"
  | "teacher-attested";
```

- `observed`: evidenza acquisita con produttore, scope, tempo e hash.
- `deterministic-derived`: proiezione ricostruibile dallo stesso journal.
- `model-proposal`: interpretazione o contenuto proposto dal modello.
- `teacher-attested`: affermazione esplicitamente attestata dal docente.

L'attestazione prova la decisione del docente e la sua provenienza; non trasforma
automaticamente la proposizione in verità oggettiva o in evidenza indipendente.

## Azioni semanticamente distinte

Le seguenti operazioni non possono essere accorpate in un unico booleano o click
implicito:

1. `accept`: il docente accetta una proposta come base di lavoro;
2. `attest`: il docente attesta esplicitamente un'affermazione; la receipt conserva
   autore, tempo, scope e provenienza di quella decisione;
3. `save`: il sistema crea un artefatto persistito;
4. `publish`: l'artefatto diventa visibile al destinatario autorizzato;
5. `apply`: un command gateway modifica uno stato operativo, con receipt e undo.

Una proposta accettata non è automaticamente attestata, salvata, pubblicata o
applicata.

## Disponibilità e fallback

La cattura locale, il journal, le proiezioni deterministiche e la riapertura della
lezione devono funzionare senza provider. Se modello o rete non sono disponibili:

- nessun evento della lezione viene perso o attribuito altrove;
- le proposte AI restano assenti o in coda con stato esplicito;
- non avviene alcun fallback silenzioso che simuli persistenza o verifica;
- il successivo retry conserva manifest, idempotenza e provenienza.

## Confini tecnici e di sicurezza

- Founder beta iPad/Safari-first, single-writer e senza editing concorrente
  multi-device.
- Chiamate modello tramite adapter server-side dietro una porta provider-neutral.
- Nessuna chiave segreta raggiunge browser, repository, Obsidian o AgentMemory.
- Nessun import provider nei moduli di dominio o nella UI.
- Telemetria ed error reporting ricevono soltanto proprietà allowlisted e redatte,
  mai contenuto didattico.
- Audio disattivato per default, consenso esplicito e trattamento come possibile
  sorgente multi-speaker.
- AgentMemory è indice derivato e ricostruibile; Git, schemi, journal e receipt
  conservano le rispettive autorità.

## Ordine delle fonti di verità

1. guardrail di sicurezza non negoziabili;
2. decisioni umane esplicite correnti, `AGENTS.md` applicabili e ADR `ACCEPTED`;
3. ref Git remoto e risultati CI riferiti all'esatto SHA candidato;
4. codice, schemi e test versionati a quello SHA;
5. ricevute runtime legate allo stesso SHA;
6. Markdown versionato aperto tramite Obsidian;
7. AgentMemory e handoff come cache ricostruibile.

Una chat, un deploy senza release SHA, un worktree locale non pubblicato o un vault
divergente non possono dichiarare implementata una capacità.

## Conseguenze

- I percorsi deterministici già esistenti restano controllo, fallback e fondazione;
  non vengono rimossi per introdurre il modello.
- Prompt, modello, retrieval e schema diventano input versionati e sottoposti a
  eval continue.
- Ogni provider è sostituibile senza cambiare dominio o UI.
- I confini toccati migrano incrementalmente verso `domain → kernel → application
  → adapters → ui`; nessun big-bang refactor.
- Le vecchie specifiche restano evidenza storica finché non vengono riallineate o
  archiviate esplicitamente.

## Non-goal e onestà dello stato

Questo ADR decide il north star e i confini. Non afferma che l'attuale codice
implementi già contratti, isolamento IndexedDB, verticale AI, cloud, telemetria o
founder beta. Ciascuna capacità richiede una slice, test e receipt propri.

Il beta di Andrea potrà produrre evidenza su affidabilità e utilità per il suo
workflow. Non dimostrerà da solo efficacia pedagogica generalizzabile.

## Gate di conformità

Una slice conforme a questa decisione deve provare almeno che:

- nessun output del modello viene applicato senza decisione e command receipt;
- ogni claim fattuale accettabile risolve evidenze nello scope dichiarato;
- provider indisponibile degrada a capture-only senza perdita della lezione;
- il client riceve soltanto contenuto autorizzato e nello scope necessario;
  segreti e contenuto didattico restano esclusi da log, telemetria e memory-plane;
- test e documentazione canonica descrivono lo stesso comportamento allo stesso
  SHA.
