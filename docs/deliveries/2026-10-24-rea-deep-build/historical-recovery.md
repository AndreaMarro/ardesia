# Recupero storico e licenze — verifica breve del 24 ottobre 2026

Base esaminata: `f456ade218acee1a8b65f5dc24e9220681658b11` (#298), ramo `codex/ardesia-convergence-rea-deep-20261024`. Solo letture e due chiamate del parser in memoria; nessuna suite pesante, modifica prodotto, commit, push o modifica ad altri repository. Le capacità sotto non sono tutte raggiungibili dalla UI attuale. Costi **basso/medio/alto** sono stime relative di integrazione, non ore misurate.

## Decisione immediata

**Recuperare selettivamente #248–258; non creare un secondo ingest o una seconda memoria.** Il P0 visuale/bridge non deve attendere Engine ingest. #248 contiene davvero il giunto manifest/journal v2, ma il suo reader non è sicuro da dichiarare compatibile con AUDIO-V2 senza un incremento esplicito. #257 contiene già la correzione del digest per identità di lezione, assente nella base attuale. Kirchhoff offre StudentTrace e ProofSession reali, con limiti diversi da una correzione generale dello studente.

## Fonti e livello della verifica

Letti: coordinamento umano; AGENTS root; CURRENT generato il `2026-10-24T14:02:16+02:00` come **snapshot**, senza rigenerarlo per questo incarico read-only; CANON-INDEX, addenda Product/Architecture, canoni Plugin/ELAB e Scene Forge; mappa, loop, NEXT, ultima voce RUNLOG e addendum memoria; ADR-0004; consegne convergence/audio-v2 e review `PRO_ADVERSARIAL_REVIEW_GPT61_2026-10-24.md`. I vecchi percorsi separati dei canoni di giugno sono storici, come chiarisce l'addendum corrente.

Metadata PR: `pr-history.json` fornito dal root (45 record), confrontato con oggetti e ancestry Git locali. Ho letto codice e diff mirati, **non rieseguito** le suite storiche o tutte le integrazioni. I conteggi dei vecchi README/PR restano dichiarazioni dei loro autori. Nessuna lettura integrale di chat è rivendicata; questo rapporto non usa turni assistant placeholder come prova.

## Primo gate: #248 provato prima di nuova ingest

Donor: [#248](https://github.com/AndreaMarro/ardesia/pull/248), `5a040b6b5edfb26372c3fc65f8e4483d14418166`, **non antenato** della base. `packages/engine/lessonos/ingest/bundle.py` aggiunge allowlist esatta per `manifest.json`, controllo duplicati, inventario bytes/SHA-256, identità lezione e normalizzazione `journal.element.add/update/delete` v2. I test conservano legacy, mismatch, hash, delete/re-add, timestamp fuori ordine e casi malformati.

Controprova indipendente sul bundle reale sintetico già consegnato, `docs/deliveries/2026-10-24-audio-v2/evidence/browser/final/lesson-a.lesson`:

| Parser | Esito osservato adesso |
| --- | --- |
| Base #298 | `ValueError unsafe bundle member (ZipSlip/out-of-scope): 'manifest.json'` |
| Modulo #248 caricato in memoria, senza scriverlo nel prodotto | **Accetta** il bundle; estrae 2 segmenti testo; `audio_members=0` |

Il manifest dichiara `compatibility.minimumReaderSchemaVersion: 2`. #248 non legge quel gate; individua solo `raw/audio/*`, mentre i due file effettivi sono sotto `raw/<lesson>/<session>/audio/`. La sua accettazione non dimostra ingest AUDIO-V2, comprensione dei marker audio o controllo del consenso di ogni sessione. L'inventario hash non sostituisce tali semantiche.

Minimo recupero: portare adapter e regressioni #248 **insieme**, aggiungere prima di qualunque persistenza il rifiuto di reader non supportato; solo dopo implementare il contratto reader 2 con sessioni/recording/ref/version e revoca. Conservare l'inventario completo, identità, duplicati e path ostili. L'ingest testuale e ASR sono capacità distinte; #248 non trascrive audio. Costo medio; rischio alto di falso successo se si allarga solo l'allowlist.

Riproduzione breve dalla root del checkout (nessuna inferenza):

```python
import subprocess, sys, types
sys.path.insert(0, "packages/engine")
from lessonos.ingest.bundle import read_bundle
p = "docs/deliveries/2026-10-24-audio-v2/evidence/browser/final/lesson-a.lesson"
# read_bundle(p) -> ValueError su manifest.json nella base
m = types.ModuleType("historical_bundle")
sys.modules[m.__name__] = m
exec(compile(subprocess.check_output([
    "git", "show", "5a040b6b:packages/engine/lessonos/ingest/bundle.py"
]), "historical_bundle", "exec"), m.__dict__)
c = m.read_bundle(p)
print(c.manifest["compatibility"], len(c.audio_members))
print(len(m.journal_to_segments(c.events_jsonl, c.manifest["lessonId"])))
```

Usato `PYTHONDONTWRITEBYTECODE=1 packages/engine/.venv/bin/python`, senza chiamare capsule/router/provider.

## Capacità: cosa recuperare e cosa non promettere

Tutti i path senza repository indicato sono in `AndreaMarro/ardesia` alla base #298. Lo SHA breve nella seconda colonna è l'ultimo commit che modifica il file nella base; la base completa sopra fissa i byte esaminati.

| Capacità e codice reale | Pin e stato verificato | Perché non equivale alla UI/head desiderata; minimo recupero | Costo/rischio |
| --- | --- | --- | --- |
| LessonGraph: `packages/engine/lessonos/graph/builder.py`; Studio `src/lessonos/materializer.ts` e `src/design/LessonGraphCanvas.tsx` | Engine `c4327c31`, Studio materializer `18a95aff`; funzioni pure e tipi reali. Canvas consumato da TeacherDashboardView. | Non manca il grafo. Engine capsule e grafo Studio da eventi sono domini di provenienza diversi; collegare vista al sottoinsieme autorizzato, mantenendo la fonte canonica. | Basso/medio; rischio di inventare equivalenza fra citation segmento ed EvidenceRef. |
| PathMemory: `packages/engine/lessonos/graph/path_memory.py` | `c4327c31`; `build_path_memory`, feedback e pianificazione reali; chiamato da pipeline e CLI. | Consumer Engine esiste, non una carriera autenticata dello studente Web. Riutilizzare proiezione con identità e fonti autorizzate, senza nuova tabella concorrente. | Medio; stato derivato/retention non prova mastery. |
| DidacticDelta: `graph/didactic_delta.py` | `c4327c31`; diff fra due PathMemory; pipeline/CLI lo invocano. | Non è un servizio pubblico già collegato ai tentativi Study. Esporre una proiezione solo dopo mapping delle versioni e degli osservati. | Medio; rischio di trasformare differenze di contenuto in diagnosi personale. |
| LearningDebt: `graph/learning_debt.py`; Studio `src/lessonos/learningDebtProjection.ts` | Engine `c4327c31`; ledger reale; Studio proietta osservazione/correzione/ricorrenza e filtra studentId se richiesto. | Esistono due proiezioni con scopi distinti; non due autorità da fondere. Conservare eventi, criterio di attribuzione e riapertura dell'errore. | Medio; rischio privacy/attribuzione di eventi senza studente. |
| Capsule: `packages/engine/lessonos/capsule/assembly.py` | `c4327c31`; assemble/load/persist reali con citazioni e grounding. | Segmentation/extraction attraversano Router; default mock e test non provano semantica audio. Nel mandato ZERO-LLM nessun live call è autorizzato. Recupero: parser e fonti, poi proposta esterna/revisione se autorizzata. | Medio/alto; qualità, costi provider e semantica non dimostrati. |
| Digest: Studio `src/lessonos/studyDigest.ts`; donor Engine `ingest/lessonos_snapshot.py` | Studio `18a95aff`; #250 `f2c9563a`, #251 `415bc116`, #252 `bfc09878` aggiungono proiezione deterministica e hardening, assente dall'Engine attuale. | Studio corrente usa finestra timestamp + fallback log globale. #257 `1c3f546a` ha già `buildLessonStudyDigest(readEnvelopesByLesson)` e rimuove quella attribuzione per tempi. Portare consumer/query e test insieme, preservando refs e ordine. | Basso/medio; gate obbligatorio A/B con tempi sovrapposti, lezione senza start, delayed read e nessun fallback globale. |
| SummaryPack: `packages/engine/lessonos/summarizer.py` | `c4327c31`; pack markdown e citazioni reali; narrativa passa da Router. #254 `dfb801cf` aggiunge `render_structured_appendix` puro per soluzioni estratte/errori digest; #255 `7af8f51c` export browser-PDF. | Appendice deterministica non rende deterministica tutta la narrativa e una soluzione estratta non è scientificamente verificata. Recuperare l'appendice separatamente, labels di provenienza e omissioni comprese. | Medio; citation vera non implica correttezza scientifica. |
| StudentPack: Studio `src/lessonos/studentPackArtifact.ts` | `29dd8251`; schema `ardesia.studentpack/1`, build/parse, azioni Genera/Esporta in TeacherDashboardView reali. | Artefatto di candidati errore+evidenze, non corso adattivo o distribuzione autenticata già pronta. Riutilizzare formato e UI esistenti con scope/revisione. | Basso; non inserire dati personali o promesse di apprendimento nel file. |
| ToolHost: Studio `src/toolhost/host.ts`, panelHost/livePostitHost | `ad488612`; host reale, firma/capability/sessione; consumer correnti presenti. | Il claim storico «unmounted» è superato per questi consumer, non un invito a bypassare firma via demo srcDoc. Nessun host nuovo necessario al bridge Web↔Studio. | Basso se riuso; alto se si importa intera auth/memoria ELAB. |
| StudentTrace e ProofSession | Kirchhoff main `b35a8b5da0616f00a7764397bda0e6b95aca3c95`, verificato con `git ls-remote`; blob `student_trace.py` `77e3743d…`, `domain/proof/session.py` `93602712…` letti via connector. | Trace `student-trace.v1` lega 1–32 passi semantici al fingerprint netlist; primo errore provato o non valutabile, nessun profilo persistente. Proof `proof-session.v0.2` proietta run certificata per riferimento, pubblicazione CLOSED, non Product Verified. Recupero via port versionata, senza copiare identità/registro. | Medio/alto; DC certificato, AC/Laplace e metodi incerti non sono la stessa garanzia. |

## Topologia PR e recupero selettivo

| Gruppo | Verifica Git/metadata e decisione |
| --- | --- |
| #241 `fd36665f` | Closed, non merged e non antenato: proposta documentale native spatial, non capacità ratificata né motivo di rifare Excalidraw. |
| #248, #250–255 | Tutte closed non merged, non antenate; codice locale disponibile. #249 non è nei metadata recuperati: nessuna capacità le viene attribuita. Conservare hardening #252 e integrità re-ingest #253, non solo il primo projector #250. |
| #256 `705284ac`, #257 `1c3f546a`, #258 `f155d37f` | Closed non merged e non antenate: candidato integrazione/materiali, correzione memory scope, poi integrity export. I file consumer possono differire dai primitivi presenti nella base. Riprendere i delta e i test discriminanti, non lo stack intero. |
| #259 `50aed925` | Closed non merged, non antenata: shared lesson/PDF/CircuitCheck DC/AC/Laplace. La base non contiene i moduli CircuitCheck Studio di quel ramo. Recupero adapter/contratto specialistico dopo P0, non import della seconda app. |
| #264–298 | Non sono un blocco unico: #264/#265 sono laterali; #266/#267 chiuse ma head antenate; #268–290 in gran parte antenate, **#271 non lo è**. #291/#293/#295 sono audit/RFC laterali e #296 indice laterale, non capacità app ereditate. #297/#298 sono antenate. #292/#294 sono issue, non record PR da inventare. |

La metadata open/closed non prova da sola presenza/assenza: sopra è indicata separatamente l'ancestry. Un file presente non prova un journey né il passaggio dei gate nel nuovo candidato.

## Repository e licenze: solo ciò che è osservato

- `~/maestro-studio`, `~/lessonos`, `~/kirchhoff`: assenti sul filesystem attuale. Non sono stati ricreati. Il codice canonico locale e Git soddisfano il confronto Studio/Engine; Kirchhoff è stato letto tramite GitHub.
- `~/ardesia-knowledge` esiste a `627b8ffa361245645d57f4303e40bdc642561edc`: verificato solo Git, **nessun corpus letto/copiato**. Resta fonte privata editoriale, non codice da riversare nel repo pubblico.
- `~/VOLUME 3/PRODOTTO/elab-builder` esiste a `7681789d4037c6f1be239ca3f91c29d55e207976`. Package letto: `private: true`, `license: UNLICENSED`. Nessuna licenza globale di riuso viene dedotta dalla proprietà/accessibilità. Donor mirati CircuitSolver/renderer/AVR secondo canone; non auth, memoria, app shell o corpus dei volumi.
- Ardesia: nessuna LICENSE generale trovata dalla ricerca dei file di licenza nel checkout; package root/Studio sono private. Kirchhoff: directory root e pyproject letti senza licenza generale dichiarata. «Repository pubblico» non viene trattato come concessione di licenza; prima di redistribuire estrazioni servono diritti e attribuzioni dei file effettivi.
- Kirchhoff `docs/01-fonti-esterne.md` letto via GitHub (blob `4eff5541…`) **riferisce** CGHD e Digitize-HCD CC-BY-4.0; esclude Fiore NC-SA e Image2Net NC-ND; JUHCCR non verificato. Questa sessione non ha scaricato dataset né riconfermato quelle licenze alle fonti primarie: non è un clearance nuovo.
- Le avvertenze storiche su PyMuPDF/Ultralytics/Marker/Fritzing/CircuitJS sono una lista di verifica, non un parere legale universale da copiare. Nessuna di queste dipendenze è necessaria al recupero testuale #248 o al bridge P0. Prima di adozione: pin versione, licenza codice/pesi/dati separata, NOTICE e confine di distribuzione; altrimenti usare i primitivi già presenti.

Kirchhoff README e consegna 16 ottobre letti: dichiarano 15 PARTIAL/6 NOT_SUPPORTED/0 COMPLETE e conteggi su `a3eb02bb…`; **non rieseguiti né attribuiti a b35a8b5**. L'API MCP corrente importa `create_lesson` e `diagnose_payload` (blob `6a1cad5e…`), quindi esiste una radice riusabile; la compatibilità con host MCP reale resta da provare.

## Gate che decide il recupero successivo

1. **Adesso:** P0 pubblico/privato e bridge, senza aspettare Engine. Origine/source/channel, risposta obsoleta e consenso/revoca vanno provati nel candidato degli autori; non introdurre una nuova autorità.
2. **Primo recupero materiale:** regressione digest A/B contro il consumer attuale; riprendere #257 se si espone recap/materiale nel journey. Nessuna inferenza di identità dai tempi.
3. **Poi Engine:** RED con il bundle AUDIO-V2 reale e reader unsupported prima di scritture; recupero #248+#252+#253 e sole estensioni reader 2 necessarie. Fresh store e store già popolato, mismatch/hash/corruzione/revoca e rollback devono preservare lo stato precedente.
4. **Kirchhoff:** adapter a SHA/schema fissati, StudentTrace con fingerprint errato/reading ambiguo/metodo alternativo e proof CLOSED distinto da Claim VERIFIED. Nessuna promessa di copertura universale o sostituzione del Core Study.

Disponibile alla review indipendente funzionale/visuale del candidato; nessun mio edit prodotto in questo incremento.
