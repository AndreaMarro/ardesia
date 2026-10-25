# 4. Monorepo, backend, frontend e distribuzione

## Scelta architetturale
Un **monolite modulare** prima di microservizi numerosi. Contratti condivisi, servizi strettamente necessari e responsabilità chiare. Nuova superficie in `apps/web`, librerie riusate dal vecchio Studio e LessonOS canonico conservato. Non attivare una seconda app con il proprio login/grafo/quiz engine concorrente.

Struttura obiettivo (percorsi nuovi sono PROPOSTI, non già presenti):
```text
apps/
  web/                 # Next.js: catalogo, area personale, regia; client board lazy
  studio/              # baseline storica e adattamento; niente copie parallele
packages/
  contracts/           # schemi versionati; codice TS/Python generato dove appropriato
  domain/              # regole pure: corsi, revisioni, policy, morphism
  ui/                  # componenti professionali e design token
  board/               # estrazione mirata Excalidraw + post-it e bridge
  integrations/        # Calendar/MCP/export/LMS, senza diritti oltre il Core
  engine/              # LessonOS Python esistente
services/
  api/                 # Render HTTPS: Core API/MCP, adapter scientifici
  worker/              # processi fuori richiesta: ASR, feedback, export
supabase/
  migrations/          # fonte unica schema e policy
  tests/               # RLS, transazioni, accessi e regressioni
content/
  physics-filter/      # programma/attività originali/rubriche, versionati
  analysis1/           # prima estensione di corso: Taylor/limiti
factory/
  rea/                 # SOLO strumenti di sviluppo; mai nel bundle studenti
  receipts/            # evidenze sintetiche e riproducibili
infra/                 # piano Vercel/Render e mapping env; niente segreti
```
Non creare ogni cartella vuota come deliverable. Ogni nuova directory nasce dalla task che produce un comportamento. Manager workspace/lockfile già scelti nel repo restano finché non c’è ragione misurata di cambiarli; niente upgrade generale insieme al primo corso.

## Compiti dei servizi
**Vercel:** rendering pubblico, sessioni UI, accesso applicazione, asset statici; pagine pubbliche prerender/cache, pagine personali mai condivise in cache pubblica. Board e strumenti scientifici importati solo quando richiesti. Niente bundle di tutti i manuali, simulatori e font storici al primo caricamento. Next.js è la scelta per la nuova app, non una prescrizione a migrare tutto Studio.

**Supabase:** Auth, Postgres, Storage privato, Realtime autorizzato e coda pgmq se scelta. Una fonte di migrazioni; niente Prisma più Drizzle più SQL divergenti. Le policy non possono basarsi su metadata modificabili dall’utente. Le view esposte devono rispettare RLS; grant non equivalgono a policy. Tutte le tabelle esposte hanno RLS e test. Service-role solo in processi privilegiati strettamente circoscritti, mai nel browser o in log.

**Render:** un web service autenticato per API scientifica e MCP; un worker per job lunghi. Il worker non riceve traffico browser. I servizi Render possono comunicare privatamente nel perimetro supportato; Vercel e Supabase non sono automaticamente in quella rete. Vercel invoca HTTPS pubblico autenticato, non hostname interno Render. Configurazione prod/staging distinta.

**Kirchhoff:** dipendenza fissata a release/commit verificato del repository canonico, con adapter dei contratti. Non rifare circuit solver in TypeScript per comodità. CI cross-repo verifica le capability effettive. Le funzioni non supportate sono esplicitamente rifiutate o passano al tutor.

## Upload e job
1. Client chiede autorizzazione e limiti per il tipo di file.
2. Carica direttamente su Storage privato con chiave univoca; niente proxy dei grandi file via Function Vercel.
3. Finalizzazione server verifica esistenza/size/content type/signature/hash e ownership. Un upload incompleto non diventa SUBMITTED.
4. Transazione registra ResourceVersion/evento/outbox. La risposta conferma l’ack persistito.
5. Worker acquisisce lease, esegue job con limiti e pubblica esito idempotente.
6. UI riceve stato o fa poll autorizzato e può continuare a lavorare.

In G0 configurazioni conservative: immagine 10 MiB, PDF 20 MiB/40 pagine, audio domanda 120 secondi/15 MiB; video e registrazioni intere della lezione rinviati a job e policy dedicate. Limiti proposti, non limiti dichiarati del provider. La UI li mostra prima del caricamento. I formati realmente decodificabili sono enumerati; formato non supportato genera errore utile e conserva possibilità di riprovare.

Retry del job non equivale a «exactly once» degli effetti: chiave unica `(job_kind, source_version, pipeline_version)` e comando di commit separato. Timeout e fallimenti non duplicano feedback. Cache e chunk audio trattati come dati personali; cancellazione propagata.

## Stato dei servizi collegati in questa sessione
- Supabase: 5 progetti individuati, uno attivo (`elab-unlim`), quattro inattivi. Nessuna tabella personale letta o modificata. Non riutilizzare per default un database ELAB per il nuovo servizio.
- Vercel: la query per Ardesia ha restituito almeno 5 progetti; elenco team vuoto ma progetti accessibili. Progetto noto `ardesia-lavagna`; occorre riconciliare root/ref/domain prima di modificare. Nessun deploy nuovo effettuato.
- Render: un workspace individuato; lista servizi bloccata dalla richiesta di conferma del workspace. Non selezionarlo implicitamente. Questo è un prerequisito di deployment, non una ragione per bloccare demo locale e piano.
- GitHub: main Ardesia e Kirchhoff riletti; nessuna integrazione automatica delle PR solo perché la CI storica era verde.

## Gate deployment
Prima preview isolata con dati sintetici, nessun bucket prod. Verificare repo, root, SHA, comandi, runtime, regioni, environment, OAuth redirect allowlist e funzioni disponibili. I costi di nuovi piani/workers/progetti vanno quotati e autorizzati; non presupporre piano gratuito commerciale idoneo. Deploy prod solo dopo gate, backup e owner approval; no bypass delle branch protection. Preview automatiche di PR possono essere pubbliche: controllare la connessione prima del push.

La configurazione Render finale si genera con Blueprint, valida con CLI/versione effettiva e si conserva in Git. I servizi non ricevono nomi/ID indovinati. I link indicati nella UI devono corrispondere a risorse realmente esistenti. Fonti: vercel-limit/vercel-mono, render-worker/render-network, supa-storage/supa-queue/Supabase skill e preflight connettori.
