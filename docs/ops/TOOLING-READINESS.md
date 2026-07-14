---
id: ardesia-tooling-readiness
status: active
freshness: 2026-07-14T23:28:39+02:00
baseline_sha: a7167657ba027e957731775895911d2428036071
authority: operational-snapshot
---

# Ardesia — tooling readiness e registro delle fonti esterne

Questo documento assegna una sola responsabilità a ogni strumento e impedisce
che un account SaaS, una nota o un report diventino una nuova fonte di verità.
È uno snapshot: prima di agire vanno verificati repository, configurazione live,
SHA e stato del provider.

## Stato osservato

| Strumento | Stato | Responsabilità ammessa | Prossimo gate |
|---|---|---|---|
| GitHub Actions | `PARTIAL` | test, build, controlli e ricevute legate allo SHA | colmare la matrice CI senza job fittizi |
| Obsidian | `ACTIVE_LOCAL` | interfaccia sulla knowledge Markdown versionata | cutover stabile soltanto dopo merge |
| AgentMemory | `DEGRADED / NO-WRITE` | futura cache di puntatori ricostruibili | heap, auth, isolamento, versioni e golden recall verdi |
| Storybook | `ABSENT / DEPENDENCY_GATE` | laboratorio di stati UI isolati | approvazione dipendenze e slice di configurazione |
| Chromatic | `ABSENT / EXTERNAL_GATE` | diff visuale di fixture de-identificate | Storybook stabile, account e secret approvati |
| Sentry | `ABSENT` | errori e performance tecniche redatte | `ErrorReporterPort` e test deny-by-default |
| PostHog | `ABSENT` | eventi prodotto allowlisted | `TelemetryPort`, consenso e progetto UE dedicato |
| Vercel | `PARTIAL / DRIFT_RISK` | preview e promozione dello stesso artefatto Studio | release manifest e exact-SHA proof |
| Render | `DEFERRED` | eventuale workload backend lungo misurato | ADR solo se Vercel non soddisfa un requisito reale |
| CodeRabbit | `DEFERRED / ADVISORY_ONLY` | secondo parere automatico sulle PR | auth, qualità misurata e nessuna autorità di merge |
| Google Drive personale | `OPTIONAL_EXPORT` | backup cifrato o export scelto dall'utente | mai journal primario o autorità semantica |

Nel candidato non risultano dipendenze o configurazioni di Storybook,
Chromatic, Sentry o PostHog. `vercel.json` costruisce soltanto Studio. I file
Render osservati appartengono a sottosistemi ELAB legacy, non al runtime core di
Ardesia. Nessuno di questi fatti autorizza account, secret o deploy.

## Sequenza operativa proposta

1. Rendere onesta la copertura GitHub Actions e legare ogni prova allo SHA.
2. Introdurre le porte vendor-neutral di error reporting e telemetria.
3. Configurare Storybook in una slice approvata; aggiungere le stories in slice
   successive di massimo cinque file.
4. Attivare Chromatic prima come advisory e renderlo required soltanto dopo una
   baseline approvata e stabile.
5. Collegare Sentry con payload redatti e synthetic error.
6. Collegare PostHog in opt-out, con allowlist e progetto UE separato.
7. Rendere riproducibile Vercel con artefatto, release SHA e rollback provati.
8. Valutare Render solo davanti a un requisito misurato non coperto da Vercel.

Ogni numero è una PR separata, con un solo writer, massimo cinque file di
prodotto, test prima/dopo e review indipendente. Nuove dipendenze, account,
secret, required checks, deploy e promozioni sono `HUMAN_GATE`.

## Piano Vercel

Vercel è il candidato primario per Studio e, solo se compatibile, per endpoint
server-side brevi. La configurazione deve convergere su:

- progetti Studio e API distinti ma un solo `release-manifest.json` con commit,
  tree, build input hash, schema e ambiente;
- development, preview e production separati;
- CLI pinning in CI e build preceduta dai gate cumulativi;
- preview da artefatto prebuilt; staging production con dominio non spostato;
- promozione dello stesso deployment verificato, senza rebuild;
- beta reale su origine stabile, non su URL preview variabili;
- secret soltanto server-side e accesso client bloccato per naming e test;
- smoke test, Sentry synthetic error, rollback e kill switch dopo il deploy;
- promozione production, dominio e rollback distruttivo sempre umani.

La procedura futura deve usare le primitive ufficiali equivalenti a
`vercel deploy --prebuilt`, staging con `--prod --skip-domain` e
`vercel promote`. Prima dell'adozione va verificata la compatibilità degli
environment di build con gli artefatti prebuilt.

## Piano Render

Render non è un secondo default. È ammesso soltanto se un ADR dimostra un
workload concreto, per esempio worker persistente o job lungo, che non può
essere eseguito in modo affidabile nel profilo Vercel scelto. L'ADR deve
quantificare durata, concorrenza, costo, regione, egress, recovery e on-call.

Se approvato:

- un solo servizio per responsabilità, definito da blueprint versionato;
- deploy dallo stesso SHA e dallo stesso release manifest di Studio;
- health/readiness separati, timeout e rollback provati;
- secret nel provider, mai in repo o build log;
- dati UE e retention verificati prima di dati reali;
- nessun deploy hook pubblico come autorità di release;
- workflow beta di Render usati solo dopo verifica di maturità e fallback.

In assenza di tale prova lo stato resta `DEFERRED`: duplicare runtime, log,
secret e procedure ridurrebbe la manutenibilità senza beneficio dimostrato.

## Google Drive personale

Drive può essere una destinazione opzionale scelta da Andrea per export o
backup, non uno storage sincrono del journal. Il percorso ammissibile è:

- bundle già validato, minimizzato e cifrato lato client;
- selezione esplicita di cosa esportare, senza raw audio o segreti;
- nome file pseudonimo e hash registrato in una receipt locale;
- chiave generata fuori da Drive, custodita separatamente e mai nella receipt;
- `key_id`, algoritmo e versione registrati per consentire rotazione controllata;
- upload revocabile, con retention e cancellazione provate;
- restore che passa dallo stesso validatore ostile del bundle locale;
- prova periodica decrypt-and-restore su campione, dopo ogni rotazione chiave;
- errore Drive non blocca la lezione e non viene mascherato come backup riuscito.

L'API Drive, OAuth, cartella e policy di condivisione richiedono un gate umano.
Il filesystem sincronizzato di Drive non viene usato come database IndexedDB,
lock distribuito, source of truth o sostituto di Supabase recovery.

## Registro dei link e delle proposte ricevute

Sono stati riesaminati i sei allegati testuali forniti in questa task. La
classificazione seguente evita sia l'adozione per entusiasmo sia la perdita di
idee utili.

| Famiglia / fonti | Decisione | Motivo e uso ammesso |
|---|---|---|
| [Loop Engineering](https://github.com/cobusgreyling/loop-engineering) e guide di Lush Binary, Tosea, Developers Digest, Lenny | `ADOPT_AS_PROCESS` | ciclo osservabile, headroom e checkpoint; nessuna dipendenza runtime |
| Documentazione Codex su `AGENTS.md`, skill, subagent e non-interactive mode | `ADOPT_WITH_LOCAL_GUARDRAILS` | istruzioni locali e ricevute prevalgono; nessuna automazione esterna implicita |
| [Structured Outputs OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs) | `ADOPT_BEHIND_PORT` | garantisce forma, non verità; citazioni, eval e decisione docente restano obbligatorie |
| [Storybook](https://github.com/storybookjs/storybook), documentazione e `awesome-storybook` | `ADOPT_OFFICIAL_CORE` | usare documentazione ufficiale; liste community solo per discovery |
| [Chromatic](https://github.com/apps/chromatic-com), setup app e snapshot docs | `ADOPT_AFTER_STORYBOOK` | fixture sintetiche, token CI, advisory prima di required |
| CodeRabbit settings e install links | `HOLD` | possibile review supplementare; mai reviewer unico, writer o merge authority |
| plugin Obsidian `brain`, `codex-ai-agent`, `codex-panel`, `codex-obsidian` e topic plugin | `REJECT_FOR_NOW` | il vault Git funziona senza plugin; supply chain e autorità aggiuntiva non giustificate |
| `token-optimizer`, `headroom-desktop`, topic token optimization e guida community | `BENCHMARK_ONLY_IF_NEEDED` | nessuna dipendenza Ardesia; adottare solo con collo di bottiglia e benchmark riproducibile |
| TencentDB Agent Memory e `openhuman` | `ALTERNATIVE_CANDIDATE` | valutabili solo con benchmark contro il protocollo pointer-only e decisione di uscita da AgentMemory |
| repository/skill community GDPR ed EU AI Act | `DISCOVERY_NOT_AUTHORITY` | non sono consulenza o fonte normativa; claim legali solo da testo ufficiale e autorità competenti |
| AI agent directory, blog Obsidian automation e community OpenAI | `DISCOVERY_ONLY` | idee da trasformare in ipotesi e test, non requisiti |
| WWC/IES evidence standards | `RESEARCH_INPUT` | utile al disegno H3 futuro; non dimostra efficacia di Ardesia |
| redirect pubblicitari Google | `IGNORE` | URL instabili, tracciati e non probatori |

La lista non autorizza clone, installazioni o trasmissione di dati. Ogni
candidato futuro richiede owner, problema misurato, threat model minimo,
licenza, attività del progetto, strategia di rimozione e test comparativo.

## Criterio di uscita

Questo audit è concluso quando i quattro piani collegati sono versionati. Non
equivale a `ENGINEERING_READY`: quello richiede le implementazioni, i test live,
gli account approvati e tutti i gate 1–7 del piano di prodotto.
