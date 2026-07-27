---
id: ardesia-session-2-coderabbit-disposition-2026-07-27
type: evidence-ledger
status: MEASURED_PARTIAL_BLOCKED
project: ARDESIA
created: 2026-07-27
timezone: Europe/Rome
raw_root: external-receipt:coderabbit-review-6f75e80b
implementation_sha: e07486fff0a5318c8150289b433184b40119166c
x1_reviewed_head_sha: da3c592f3e7da7f30337b59d978af1e0fd80a9e3
terminal_exact_review_binding: EXTERNAL_KNOWLEDGE_RECEIPT_REQUIRED
review_runs: 22
raw_findings: 116
source_of_truth: false
---

# Sessione 2 — ledger CodeRabbit per-commento

Questo ledger è lo snapshot prodotto attraverso `R4` e include le review
CodeRabbit concluse per la Sessione 2 fino a quel ciclo:
due pass preliminari, dodici cicli canonici, il pass `T1`, due pass artifact,
una review full exact-diff e quattro pass di repair. Gli UUID raw, non i fingerprint
ripetuti, sono le chiavi primarie. Tentativi falliti, interrotti o rate-limited
non sono contati.

Disposition dopo la supersession STATUS nello stesso ciclo documentale:

| Stato | Totale |
|---|---:|
| `ACCEPT_FIXED` | 67 |
| `REJECT_INVALID` | 27 |
| `DEFERRED` | 22 |
| `PENDING` | 0 |
| **Totale finding raw** | **116** |

## Registry delle review concluse

| Ciclo | Review id | UTC | Finding | Head osservato | Base osservata |
|---|---:|---|---:|---|---|
| PRE-1 | `1785114999874` | 2026-07-27T01:16:39.874Z | 4 | `36e6753c` | `36e6753c` |
| PRE-2 | `1785115167748` | 2026-07-27T01:19:27.748Z | 5 | `36e6753c` | `36e6753c` |
| C1 | `1785119455274` | 2026-07-27T02:30:55.274Z | 9 | `f686ef2d` | `36e6753c` |
| C2 | `1785120637734` | 2026-07-27T02:50:37.734Z | 0 | `f686ef2d` | `f686ef2d` |
| C3 | `1785121238034` | 2026-07-27T03:00:38.034Z | 2 | `25c37a12` | `36e6753c` |
| C4 | `1785123099022` | 2026-07-27T03:31:39.022Z | 7 | `9af49956` | `36e6753c` |
| C5 | `1785124771531` | 2026-07-27T03:59:31.531Z | 16 | `8b448057` | `36e6753c` |
| C6 | `1785126129299` | 2026-07-27T04:22:09.299Z | 2 | `9fd8a2c1` | `8b448057` |
| C7 | `1785127090401` | 2026-07-27T04:38:10.401Z | 24 | `fe6a6779` | `9fd8a2c1` |
| C8 | `1785128554772` | 2026-07-27T05:02:34.772Z | 3 | `fe6a6779` | `fe6a6779` |
| C9 | `1785130010818` | 2026-07-27T05:26:50.818Z | 1 | `0b46f3ca` | `fe6a6779` |
| C10 | `1785131328639` | 2026-07-27T05:48:48.639Z | 1 | `a09e2a2a` | `0b46f3ca` |
| C11 | `1785132665906` | 2026-07-27T06:11:05.906Z | 2 | `a09e2a2a` | `a09e2a2a` |
| C12 | `1785133278520` | 2026-07-27T06:21:18.520Z | 2 | `f9d8608c` | `a09e2a2a` |
| T1 | `1785134931963` | 2026-07-27T06:48:51.963Z | 0 | `ad8f6f95` + staged patch | `f9d8608c` |
| A1 | `1785136537106` | 2026-07-27 | 1 | artifact worktree | implementation freeze |
| A2 | `1785136885675` | 2026-07-27 | 0 | artifact repair worktree | implementation freeze |
| X1 | `1785139145693` | 2026-07-27 | 32 | `da3c592f` | CLI `36e6753c`; internal metadata `e07486ff` |
| R1 | `1785140746441` | 2026-07-27 | 0 | `da3c592f` + broker patch | `da3c592f` |
| R2 | `1785141582523` | 2026-07-27 | 2 | `92209e1f` + identity patch | `92209e1f` |
| R3 | `1785142296375` | 2026-07-27 | 0 | `92209e1f` + repaired identity patch | `92209e1f` |
| R4 | `1785144255694` | 2026-07-27 | 3 | `0380b67c` + documentation patch | `0380b67c` |

`T1` copre soltanto la patch poi committata come `e07486ff`. Il diff del pass e
`git diff ad8f6f95..e07486ff` hanno SHA-256
`c342f1c618edcb7a4637e746e5c5fdedb1daa3ad827303eb16b21062f290f981`.
Non è una review completa del diff finale.

## Legenda test

- `NCR`: `NO_CAUSAL_RED_RECORDED`; non viene inventato TDD retroattivo.
- `G1`: gate sul freeze `e07486ff`: `npm run verify` verde
  (Engine `2044/7`, Studio `2034/5`, Vite `2667`), boundary gate verde e
  frozen gate `2035/0`.
- `STATIC`: decisione verificata sul sorgente/contratto; nessun test-after
  artificiale.
- `OPEN`: nessun fix in questa slice; il debito resta esplicito.

## Disposition per finding

| ID | Finding | Riproduzione | Rischio reale | Test prima | Fix | Test dopo | Decisione |
|---|---|---|---|---|---|---|---|
| PRE-1:`3f0f6883-0b49-450e-a426-c8b9bf47bcc1` | minor · `messages.ts` · commento wire version | la v1.2 è baseline storica intenzionale | sola ambiguità documentale | NCR | nessuno | STATIC | `REJECT_INVALID` |
| PRE-1:`26a4dd1e-657a-4946-966c-7b718067c883` | major · `messages.ts` · receipt senza evidenza risolvibile/producer SHA | receipt ispezionata staticamente | provenance non verificabile end-to-end | NCR | nessuno; richiede resolver | OPEN | `DEFERRED:COV5` |
| PRE-1:`03776dc7-c0ba-4a4a-b2d0-751525adc537` | major · `messages.ts` · describe senza receipt | `describe` precede load e non ha scene digest | comando non attestabile con scena | NCR | nessuno; decisione protocollo distinta | OPEN | `DEFERRED:DESCRIBE_RECEIPT` |
| PRE-1:`5379067f-c672-465d-bbb6-fc67777f7964` | trivial · `ToolHostSimulationBroker.test.ts` · fault injection a call-count | riordinare le chiamate altera il falsificatore | oracolo fragile | NCR | nessuno | OPEN | `DEFERRED:TEST_ORACLE` |
| PRE-2:`bcc4d839-98f2-4ab6-a385-481f4108850c` | minor · `capabilities.ts` · brand ELABTutor | il canon corrente autorizza `io.elab.tutor` pack | nessun difetto | NCR | nessuno | STATIC | `REJECT_INVALID` |
| PRE-2:`1d49cb20-2049-459a-8c2c-27f3cb7ca8ef` | major · `simulation.ts` · brand ELABTutor | nome utente e pack sono ratificati | nessun difetto | NCR | nessuno | STATIC | `REJECT_INVALID` |
| PRE-2:`31cec7ce-d6bd-4e37-84ff-7a07e9d5ddb1` | major · `simulation.ts` · divergenza wrapper/runtime su load fallito | runtime puro, commit stato+digest congiunto | nessuna divergenza concreta | NCR | nessuno | STATIC | `REJECT_INVALID` |
| PRE-2:`2fc4ab8f-6b10-4fa6-986d-927daf3418d1` | minor · `ToolHostSimulationBroker.test.ts` · silence race 50 ms | risposta oltre finestra produce falso verde | flake CI | NCR | nessuno | OPEN | `DEFERRED:TEST_TIMING` |
| PRE-2:`c6ef3a8b-ed5d-44b9-b602-b87b150050f2` | major · `ToolHostSimulationBroker.test.ts` · localStorage non stubbed | jsdom fornisce storage e hook lo isolano | nessun difetto corrente | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C1:`15b946b4-2b2f-4521-b765-6c200cec064d` | major · `caps/simulation.ts` · room requirement/commento v1.3 | invocati cinque metodi senza room | contratto ambiguo | NCR | `4675ea5f`, `9fd8a2c1` | G1 | `ACCEPT_FIXED` |
| C1:`1949ddc3-83f8-4bfe-a13d-365cd02bf577` | minor · `caps/simulation.ts` · applied senza shape guard | runtime malformed | TypeError/rollback ambiguo | NCR | `9af49956`, `df9ca94d` | G1 | `ACCEPT_FIXED` |
| C1:`4453357f-6342-4936-a7ca-7724aad06d0d` | major · `multiPostitWorkbenchModel.ts` · rimozione sceneDigest | marker v2 senza digest | bypass validazione | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C1:`5309596b-0323-4b00-a323-67257c2fa23a` | minor · `host.ts` · initial state ignorato | dipendenza restore incompleta | cold restore perso | NCR | `9af49956` | G1 | `ACCEPT_FIXED` |
| C1:`67ef393c-503e-4583-a813-7985aee07636` | minor · `SimulationPluginVertical.test.ts` · localStorage esplicito | jsdom lo fornisce già | sola portabilità teorica | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C1:`68d81834-30c6-43df-8c69-54d23c749314` | major · `caps/simulation.ts` · solve committa digest vecchio | provider muta topologia | receipt non rappresentativa | NCR | `9af49956` | G1 | `ACCEPT_FIXED` |
| C1:`bc2bbfaf-2fc9-4d51-86c0-5c2cd5199581` | minor · persistence test · manca digest rimosso | restore marker v2 incompleto | downgrade inosservato | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C1:`daf12a4e-5873-461d-907d-81048bcf13ec` | major · `ToolCanvasEmbeddable.tsx` · response stantia | cambio scena durante request | perdita edit recente | NCR | `25c37a12`, `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C1:`f44f82b5-3881-4fee-be4e-3525dd9e3237` | minor · `Room.tsx` · board guard fuori try | apiRef assente | errore non visibile | NCR | `25c37a12` | G1 | `ACCEPT_FIXED` |
| C3:`571794df-2525-44aa-a3db-ca2d6191cc49` | major · `caps/simulation.ts` · output runtime non clonati | runtime trattiene/muta payload | corruzione stato/receipt | NCR | `9af49956`, `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C3:`5e3aa8ed-c4fa-498d-b6c9-ffe065ee0777` | critical · `caps/simulation.ts` · solve result non validato | `null`/string/oggetto vuoto | TypeError e commit ambiguo | NCR | `9af49956` | G1 | `ACCEPT_FIXED` |
| C4:`69957748-96d8-4352-9948-6392f9f295e1` | trivial · browser test · schema literal | rinomina costante produttiva | test stantio | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C4:`9828df48-5400-46eb-b57b-982a8cb71e7e` | minor · workbench · null trattato come missing | digest esplicitamente null | proposta legittima dato invalido | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C4:`a76db42e-ada9-4224-84e8-ddbbbfc319bf` | trivial · persistence test · render solo non-null | link errato ma render esiste | falso verde | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C4:`b1fc2dc1-c965-4db9-941d-42e78669ea16` | minor · persistence test · expectedDigest undefined | fixture senza digest | uguaglianza vacua | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C4:`c05c6e59-3a4b-4812-bb44-3bf57d5a9d3e` | trivial · persistence test · non-promozione v1 | restore v1 malformato | input rifiutato potrebbe mutare | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C4:`c7111b6e-0027-4eab-b796-2a5b423688c2` | trivial · workbench · digest calcolato due volte | osservato path migrazione | solo costo marginale; defense-in-depth | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C4:`f21402e7-8a83-44a1-9f2c-2ad8c253c876` | trivial · browser test · schema/plugin hardcoded | cambiare identità esportata | drift test/produzione | NCR | `55a258ff` | G1 | `ACCEPT_FIXED` |
| C5:`08ada3c3-9c64-43f5-b05d-2eacb9996f4b` | trivial · workbench · cast migrazione | stato migrato incompleto | oggetto canonico invalido | NCR | `df9ca94d` | G1 | `ACCEPT_FIXED` |
| C5:`0dca4c69-f31d-4799-a3c8-b6c4f618cf53` | trivial · workbench · catch digest silenzioso | digest throw su input untrusted | logging proposto rompe guard no-throw | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C5:`197e353d-a9f8-491f-9edf-31ee66a5e80b` | trivial · room composition · stringify key-order | scene semanticamente uguali | stale spurio | NCR | `f9d8608c` | G1 | `ACCEPT_FIXED` |
| C5:`47603c18-2f04-4738-aec8-88bb57ca2b4b` | major · product spec · receipt frozen prematuro | doc letto prima di SHA/receipt | claim governance falso | NCR | `fe6a6779` | G1 | `ACCEPT_FIXED` |
| C5:`4a62c9e3-6547-4e5e-9b16-6a99b4bbbda7` | trivial · workbench · cache digest | oggetto mutabile | cache può validare hash stantio | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C5:`4d52a92c-cee0-4285-8ddb-ccf8e29f136f` | critical · room composition · guard accepted=false | schema success impone literal true | stato impossibile | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C5:`505a45e9-04ca-4221-9af6-db8d46218a8d` | minor · vertical test · producer dipende da `.git` | package senza checkout | falso fallimento build | NCR | `df9ca94d`, `fe6a6779` | G1 | `ACCEPT_FIXED` |
| C5:`5f31922a-c5f8-4147-adcc-2d7071d5013d` | trivial · registry · generic scene non type-safe | scena eterogenea incompatibile | type erasure boundary | NCR | nessuno; estrazione dedicata | OPEN | `DEFERRED:TYPED_SCENE` |
| C5:`7163580a-1113-4265-ba0a-7ef5e63d76c0` | trivial · vertical test · undefined non coperto | runtime restituisce undefined | guard regression | NCR | `df9ca94d` | G1 | `ACCEPT_FIXED` |
| C5:`8112dbe9-0c48-494a-a850-c5e5eb63720d` | trivial · broker test · room gate su un metodo | tutti i cinque metodi | provider raggiungibile | NCR | `df9ca94d`, `9fd8a2c1` | G1 | `ACCEPT_FIXED` |
| C5:`9e7f6363-c258-4dee-b779-a58246901d4f` | major · caps · scena meno strict del protocollo | scene malformed | host attesta input invalido | NCR | `9fd8a2c1` | G1 | `ACCEPT_FIXED` |
| C5:`c0e957e9-8730-4575-987b-8455ad5181e0` | trivial · persistence test · case senza nome | fallisce una mutazione parametrica | diagnostica runner | NCR | nessuno | OPEN | `DEFERRED:TEST_DIAGNOSTICS` |
| C5:`c71aa690-5b89-43e1-8706-c2c36a9e5958` | minor · architecture doc · metodi SDK errati | confronto con TOOL_METHODS | superficie capability falsa | NCR | `fe6a6779` | G1 | `ACCEPT_FIXED` |
| C5:`c7dc1e86-9665-44dc-9177-cec5e6fd70df` | trivial · room test · accepted=false | impossibile via schema reale | nessun caso reale | NCR | nessuno; broker reject coperto | STATIC | `REJECT_INVALID` |
| C5:`df71ee65-e063-43be-b9a0-a9a46b60c0e2` | trivial · vertical test · IDBKeyRange leak | descriptor preesistente | leak cross-test | NCR | `df9ca94d` | G1 | `ACCEPT_FIXED` |
| C5:`fdae73d7-d094-44fd-a074-f88cae6d3e9e` | trivial · browser test · guard/v1 stale | v1 con digest mismatch | incoerenza restore | NCR | `df9ca94d` | G1 | `ACCEPT_FIXED` |
| C6:`2b8f0579-1e59-4a9b-8d83-234a12e874ae` | minor · broker test · kind fallisce per id | connection id è opzionale | nessuna ambiguità | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C6:`ae432341-3998-481f-8cf5-fd1a2def73b8` | minor · vertical test · CI SHA salta Git | checkout + SHA iniettato | producer errato sfugge | NCR | `fe6a6779` | G1 | `ACCEPT_FIXED` |
| C7:`6b17e2c1-43cc-4eb0-884f-622ec4c81f72` | major · `ARDESIA-MAP.md` · autorità contraddittoria | banner storico seguito da clausola operativa | governance obsoleta | NCR | `1965e1fb` | STATIC | `ACCEPT_FIXED` |
| C7:`da88f77e-444c-48e9-a015-3597eeb3a8fd` | major · `CANON-INDEX.md` · autorità contraddittoria | banner non autoritativo seguito da autorità | canon stantio | NCR | `1965e1fb` | STATIC | `ACCEPT_FIXED` |
| C7:`572ac10b-b25e-4486-a8e4-73aa962a885c` | major · `STATUS.md` · conteggi cicli incoerenti | voci append-only con conteggi diversi | trace review ambiguo | NCR | supersession in questo ciclo documentale | diff corrente + G1 | `ACCEPT_FIXED` |
| C7:`46a185b5-f1e9-4ff7-a282-31ad227b36ec` | trivial · registry · envelope importato da `sim/core` | due fonti di tipo | drift protocollo | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C7:`6ca77744-3025-468d-b6c1-f842a16b65a2` | trivial · registry · generic per metodo non type-safe | signature resta generica | cast futuri | NCR | nessuno; richiede estrazione typed-scene | OPEN | `DEFERRED:TYPED_SCENE` |
| C7:`519a4e6c-cb45-430c-b572-38e840cbb339` | trivial · caps · isolare result/diagnostics | runtime trattiene payload | receipt mutabile tardivamente | NCR | `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C7:`eff9b9d2-18ef-4d9a-ab1b-3a39a70054c5` | trivial · browser test · separare scenari | test combinato | diagnostica runner | NCR | nessuno | OPEN | `DEFERRED:TEST_DIAGNOSTICS` |
| C7:`081f0497-11f3-4341-bb83-2817c3f6266b` | major · persistence · `allowMissingLink` asimmetrico | restore persisted è strict; renderer normalizzato è tolerant | proposta di uniformare romperebbe il contratto intenzionale | NCR | nessuno; asimmetria congelata da test `0b46f3ca` | STATIC + G1 | `REJECT_INVALID` |
| C7:`68e51b52-a981-4ff7-b032-a68d42f7b07b` | major · persistence test · link assente non coperto | nessun oracle sui due percorsi | regressione contrattuale | NCR | `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C7:`8f405081-acee-464e-960d-135a725618b5` | trivial · vertical test · event log Room A riusato in Room B | Room B non emetteva il proprio evento | falso isolamento LessonOS | NCR | `e07486ff` | G1 | `ACCEPT_FIXED` |
| C7:`dce2326e-ada3-400f-a1dc-ebdb5da2bad8` | trivial · vertical test · digest `00000000` non è stale reale | non era un digest precedente valido | TOCTOU non provato | NCR | `e07486ff` | G1 | `ACCEPT_FIXED` |
| C7:`05a7ac25-8e5c-4229-8386-27251f04c88e` | trivial · broker test · limiti hardcoded | cambio validator rende il test incoerente | drift boundary | NCR | `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C7:`0be06852-9591-4a47-9fa2-8c3a5604a206` | major · vertical test · matcher parziale su letture vuote | oggetti non vuoti potevano passare | falso verde | NCR | `e07486ff` | G1 | `ACCEPT_FIXED` |
| C7:`1d5e34e1-35ab-45b4-a425-b39d5e95e57d` | trivial · vertical test · tutte le evidenze `missing` | nessun resolver esiste nella slice | evoluzione futura richiederà cambio esplicito | NCR | nessuno; freeze CoV5 intenzionale | STATIC | `REJECT_INVALID` |
| C7:`419c4fac-62b4-42d7-b9ec-c00a03a9c7db` | minor · canvas · secondo gesto durante request | doppio connect | errore UX spurio | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C7:`61fa071d-747a-4389-b27c-a0806ea6f537` | trivial · composition · `JSON.stringify` key-order | scene semanticamente uguali | stale spurio | NCR | `f9d8608c` | G1 | `ACCEPT_FIXED` |
| C7:`37b76703-d91d-4890-bdb8-aa4fa356a1de` | trivial · canvas · `localScene` nelle dipendenze | cambio scena può rimontare il canvas | perdita viewport/selezione | NCR | solo ref render-side corretto in `a09e2a2a` | OPEN | `DEFERRED:NO_VIEWPORT_ORACLE` |
| C7:`828a3538-bce0-436a-af30-2297db26315e` | trivial · room test · isolamento con store distinti | configurazione non rappresentativa | falso isolamento per costruzione | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C7:`c43669fb-9c1e-4f4e-ba26-f8fc9c7b62e2` | major · composition · proiezione placement duplicata | regole runtime/UI divergenti | digest stale permanente | NCR | `f9d8608c` | G1 | `ACCEPT_FIXED` |
| C7:`47c59e0a-3dff-4ac2-b00c-1220b674f5de` | minor · `Room.tsx` · errore tecnico non localizzato | messaggio raw al docente | UX/i18n | NCR | nessuno; serve chiave locale, non literal | OPEN | `DEFERRED:I18N` |
| C7:`fa41c831-26f1-427a-a14a-13853f28c510` | trivial · room test · reject senza effetto visibile | provava solo assenza persist | falso verde UX | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C7:`ca7679f9-21b9-42c2-a2d1-23fcc4860679` | trivial · canvas · ref scritto durante render | render scartato altera stale guard | race concorrente | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C7:`dadf74f1-4646-4d94-978a-d6cc5e76a9be` | trivial · composition · manca guard `accepted` | schema impone literal `true`; broker lancia sul reject | stato irraggiungibile | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C7:`f220cc5c-167c-42b5-a73e-cd5ae00326bd` | major · composition · instance non room-scoped | stesso embed in due room | collisione audit/runtime | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C8:`0fdb66f0-ea6a-4a66-8f00-a1b18fa258d3` | minor · broker test · isolamento operazione in ingresso | runtime tratteneva il riferimento | mutazione tardiva | NCR | `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C8:`0f6d9394-51fa-4439-b9b3-2e9c03eee23e` | major · caps · commit prima del clone | `DataCloneError` dopo `_state` | commit parziale | NCR | `0b46f3ca` | G1 | `ACCEPT_FIXED` |
| C8:`2e7f53bc-a075-4512-b071-265385885029` | minor · persistence test · mismatch ID non isolato | assert esatto distingue già ID da link | nessuna ambiguità causale | NCR | nessuno | STATIC | `REJECT_INVALID` |
| C9:`45b0b6dd-1534-4c6c-943f-73b8df7a0a09` | major · canvas · edit concorrente perde wire | edit locale durante richiesta | wire confermato perso | NCR | `a09e2a2a` | G1 | `ACCEPT_FIXED` |
| C10:`4e63ece4-3eaa-4f1f-961e-cc1909d5dd1c` | critical · room test · dichiarazioni `cases` duplicate | sorgente e typecheck mostrano una sola dichiarazione | finding generato su una ricostruzione inesatta del diff | NCR | nessuno | STATIC + G1 | `REJECT_INVALID` |
| C11:`4a587626-c09a-49b4-a150-7467a9cb1ff0` | trivial · room test · manca collisione fori | nessun oracle su due placement stesso foro | regressione fisica | NCR | `f9d8608c` | G1 | `ACCEPT_FIXED` |
| C11:`41c6d038-6021-4cad-aaf7-10ffc5312a79` | major · montaggio projection · collisione fori non validata | valori foro duplicati | scena fisicamente invalida | NCR | `f9d8608c` | G1 | `ACCEPT_FIXED` |
| C12:`18b668d9-2a4d-491c-9487-69ac49bdfdcd` | major · engine `AGENTS.md` · istruzioni obsolete | AgentMemory/push/reset restavano operativi | violazione governance/dati | NCR | `1965e1fb` | STATIC | `ACCEPT_FIXED` |
| C12:`c36aa49b-57c8-4266-a828-8dd1fc2367db` | major · Studio `AGENTS.md` · istruzioni obsolete | code storiche restavano operative | scope errato | NCR | `1965e1fb` | STATIC | `ACCEPT_FIXED` |
| A1:`f20bce6c-1361-46e4-8c29-3f7285bc7f87` | major · artifact · path home assoluto | ispezione del ledger generato | username e infrastruttura locale nel tree | NCR | `da1d8d58` | A2: zero issue | `ACCEPT_FIXED` |
| X1:`94ec0813-0b25-4e40-882d-887046318eb0` | trivial · projection · `undefined` non equiparato | il confronto accetta solo valori JSON-plain | nessun difetto; accettarlo indebolirebbe il fail-closed | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`aac06d58-17d1-49a5-8c35-b1133f076b90` | major · Room · errore tecnico non localizzato | messaggio raw esposto alla UI | debito UX/i18n reale | NCR | nessuno; richiede `t(key)` | OPEN | `DEFERRED:I18N` |
| X1:`cae4c262-2fa1-4460-944d-d69aeed99dad` | minor · persistence test · cast diretto | errore di precondizione poco diagnostico | nessun falso verde corrente | NCR | nessuno; helper test-only | OPEN | `DEFERRED:TEST_DIAGNOSTICS` |
| X1:`63b328ae-5f25-4021-b531-b483831eed1e` | trivial · board test · schema da costante | lo stesso file congela già lo schema con literal indipendenti | nessun gap causale residuo | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`59846c6a-dca9-4508-ae14-c6514ba0957b` | minor · marker · array assenti normalizzati | contratto persistito richiede entrambi gli array | normalizzare la perdita indebolirebbe il gate | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`cf9d3aae-db4c-4a1f-a613-c8ff45156fd8` | trivial · browser test · schema workbench da costante | serializer e atteso condividevano la stessa fonte | drift di compatibilità non rilevato | NCR | literal indipendente in questo ciclo | test browser mirato + gate completo | `ACCEPT_FIXED` |
| X1:`5faae0be-d639-405e-a79a-d59fab913bf9` | trivial · browser test · scenari accorpati | fallimento precoce può nascondere rami successivi | solo diagnostica runner | NCR | nessuno; split futuro | OPEN | `DEFERRED:TEST_DIAGNOSTICS` |
| X1:`dfcd8688-2716-4096-87e0-95ba20f76d3f` | trivial · room test · commento sovra-ampio | wrapper finale usa un mock mentre i test precedenti sono reali | rischio di sovralettura dell'evidenza | NCR | nessuno; chiarire commento | OPEN | `DEFERRED:TEST_DOC` |
| X1:`a074639c-b161-4ac6-b1d1-5f18119f9b66` | trivial · room test · riordino chiavi non spiegato | oracle key-order esiste già | sola manutenibilità futura | NCR | nessuno; commento futuro | OPEN | `DEFERRED:TEST_DOC` |
| X1:`ee49a94c-6313-4b78-a2d6-6e372473dcd6` | trivial · canvas test · `rejectOccupiedHoles:false` | il caso è già coperto nel test montaggio libero | finding duplicato cross-file | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`4b937677-48d4-4867-8706-e63f973344d6` | major · canvas · receipt stantia non verificata semanticamente | scena cambiata mentre la request è pending | overwrite di una scena più nuova | NCR | `0380b67c` | test causale + gate completo | `ACCEPT_FIXED` |
| X1:`1e94547f-48db-4d49-9fa4-f51d1d65ba4b` | trivial · vertical test · manifest derivato | manifest completo già congelato da test indipendente | literal duplicato creerebbe seconda SoT | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`68aba5c0-ce2c-4b67-b35f-d80f294506d9` | minor · vertical test · helper a parametri posizionali | call site correnti coerenti | fragilità futura test-only | NCR | nessuno; options object futuro | OPEN | `DEFERRED:TEST_REFACTOR` |
| X1:`965c2dd9-9eb4-432d-8932-7c3bc337dea1` | major · vertical test · corrente LED baseline inutilizzata | short poteva lasciare invariati gli output elettrici | falso verde causale | NCR | `0380b67c` | oracle corrente causale + gate completo | `ACCEPT_FIXED` |
| X1:`b4aa8c07-c8b2-4fa7-a064-f983eb02efc3` | major · vertical test · target invalido troppo permissivo | qualunque `ERR.INTERNAL` soddisfaceva il test | crash non distintivo poteva passare | NCR | `0380b67c` | messaggio esatto + gate completo | `ACCEPT_FIXED` |
| X1:`7b468408-1379-4bb8-ab19-d5938b593369` | trivial · broker test · rami SDK mancanti | i rami richiesti sono già coperti nella verticale | duplicazione, non gap | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`f2b98b9c-b41a-4658-a665-1df44af865c1` | minor · marker · reader duplicato | due reader oggi coerenti e coperti v1/v2 | rischio di divergenza futura | NCR | nessuno; estrazione futura | OPEN | `DEFERRED:REFACTOR` |
| X1:`b1591b75-5270-499d-9170-465cab9ae6e1` | minor · digest · `trim()` non persistito | trim è solo predicato; il digest conserva la stringa raw | nessuna non-deterministicità | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`0495cadd-6069-4ecf-869d-5694aa854702` | trivial · composition · validazione con risultato scartato | la chiamata è un assert fail-closed | solo intento poco esplicito | NCR | nessuno; `void`/helper futuro | OPEN | `DEFERRED:CODE_CLARITY` |
| X1:`9203f76c-af29-43e5-bb4f-14b1e0605311` | trivial · composition · clone ridondante | scena e connessioni copiate due volte | micro-costo entro limiti correnti | NCR | nessuno; semplificazione futura | OPEN | `DEFERRED:PERFORMANCE` |
| X1:`f7d56fdb-2428-49b4-9bca-637928f4372d` | trivial · projection · placements non-array | il parser li rifiuta già e il test causale esiste | nessun bypass | NCR | nessuno | STATIC | `REJECT_INVALID` |
| X1:`65e602c6-2490-4c42-9a82-edea12e89197` | major · canvas · ID connessioni non riservati | una connection poteva collidere con un placement | throw durante render | NCR | `0380b67c` | test causalmente riservato + gate completo | `ACCEPT_FIXED` |
| X1:`9905b395-d481-4ccf-bc65-2577ac5dd46d` | major · canvas · ID da `length + 1` | add/add/delete/add riusava un ID vivo | identità wire duplicata | NCR | `0380b67c` | allocator max-suffix + gate completo | `ACCEPT_FIXED` |
| X1:`030143af-b58c-4fd3-a474-460a04f8b62d` | major · canvas · mount/operation error conflati | reject operativo modifica lo stato mount; retry resta possibile | UX/a11y ambigua | NCR | nessuno; slice UI Sessione 3 | OPEN | `DEFERRED:UI_A11Y` |
| X1:`dfbfa2f6-a987-4cef-8e56-c923215fc6d6` | major · broker · serializer prima del support check | runtime senza `applyOperation` poteva eseguire serializer | errore/side effect sbagliato | red causale registrato | `92209e1f` | test mirato + R1 zero | `ACCEPT_FIXED` |
| X1:`6b370d40-23b0-4de4-bd5b-c79b0c28576d` | minor · broker · live vs serialized ambiguo | runtime corrente usa stato lossless e cold restore è coperto | debito contrattuale, nessuna perdita corrente | NCR | nessuno; chiarimento contratto | OPEN | `DEFERRED:CONTRACT` |
| X1:`2abcc5c5-7bd0-43b4-9bca-637928f4372d` | major · broker · digest diverso attesta mutazione estranea | runtime malevolo poteva restituire altra topologia | receipt falsa | red causale registrato | `92209e1f` | verifica effetto esatto + R1 zero | `ACCEPT_FIXED` |
| X1:`de6eaf3f-87f7-4f18-831c-5fa7fd334e9e` | minor · host · room guard diagnostica tardiva | restore fallisce già chiuso tramite `_requireRoomId` | solo messaggio meno preciso | NCR | nessuno; guard esplicita futura | OPEN | `DEFERRED:DIAGNOSTICS` |
| X1:`358bccd9-07d5-46e0-a30b-e519b1c5823a` | major · registry · throw callback riclassificato come reject | mutazione già committata poteva apparire rifiutata | semantica atomica falsa | NCR | `0380b67c` | test callback + gate completo | `ACCEPT_FIXED` |
| X1:`366ab0be-7c59-4e6e-936c-69da202626a2` | major · evidence · TCE dichiarato byte-invariato | misura reale è `112384 → 111361` | claim di gate falso | NCR | misura corretta in questo ciclo | diffcheck + gate completo | `ACCEPT_FIXED` |
| X1:`a04bd2e8-c06e-48b6-87c9-332b88d98c40` | major · spec · CoV6 dichiarato verde prematuramente | review full aveva 32 issue e mancava il terminale | attestazione non supportata | NCR | CoV6 riportato pending in questo ciclo | ledger coerente + gate completo | `ACCEPT_FIXED` |
| X1:`998ceac5-854a-405e-a6c5-cc5bf40fe079` | major · map · infrastruttura privata storica | snapshot conteneva username, IP, host, porte e repo | esposizione nel tree corrente | NCR | tombstone in questo ciclo documentale | scansione tree/diff | `ACCEPT_FIXED` |
| R2:`9bbcee97-6fa0-4e28-a990-2a43f6e4efc9` | minor · canvas test · callback non osservata | test copriva write-back ma non invocazione callback | regressione API poteva passare | NCR | `0380b67c` | spy callback + R3 zero | `ACCEPT_FIXED` |
| R2:`f81bd269-c985-4101-b1de-c68fb8effbb9` | minor · vertical test · corrente mancante coalesciuta a zero | assenza dato poteva sembrare short fisico | falso verde numerico | NCR | `0380b67c` | assert presenza + R3 zero | `ACCEPT_FIXED` |
| R4:`0ba0b99e-ebed-40ac-ac0b-be157884ad33` | major · map · bonifica storica non definita | il tombstone distingueva tree e history senza criterio di completamento | copie e mirror potevano essere interpretati come già sanificati | NCR | procedura autorizzativa e verifica perimetro in questo ciclo | scansione diff + terminal exact review | `ACCEPT_FIXED` |
| R4:`466ee4d4-5c33-4ee2-8f0b-b3d03de41e7a` | minor · spec · review ID ambiguo | il numero `1785139145693` non era etichettato | provenienza confondibile con uno SHA | NCR | etichetta `X1` + `review ID` in questo ciclo | terminal exact review | `ACCEPT_FIXED` |
| R4:`838d0f0a-cd0d-45b6-81c3-9e8a1935202c` | major · flow · richiede identità byte-per-byte | il prompt ratifica non-growth e X1 aveva già corretto il claim byte-invariato | imporre identità contraddirebbe lo scope funzionale autorizzato | NCR | nessun indebolimento; vincolo non-growth chiarito | misura TCE + test dedicati | `REJECT_INVALID` |

## Tentativi non contati

Le invocazioni terminate per rate limit, base SHA non accettata, errore del
client o interruzione prima della produzione dei finding non sono review
concluse e non entrano né nelle 22 run né nei 116 finding. Il retry rate-limited
successivo a `R2` è quindi escluso. Le tracce sono preservate nei
log raw referenziati da `raw_root`; il path locale resta fuori dal repository e
non vengono promossi artificialmente a pass verdi.

## Debito differito

I ventidue finding differiti restano espliciti e non bloccano il freeze
parziale:

- `26a4dd1e…` — resolver CoV5 e provenance completa;
- `03776dc7…` — receipt per `describe`;
- `5379067f…` — fault injection indipendente dal call-count;
- `2fc4ab8f…` — oracolo senza finestra temporale fissa;
- `5f31922a…` — estrazione typed-scene;
- `c0e957e9…` — diagnostica dei casi parametrizzati;
- `6ca77744…` — generic method type-safe;
- `eff9b9d2…` — separazione dei tre scenari browser;
- `37b76703…` — refactor remount con oracolo viewport;
- `47c59e0a…` — errore Room localizzato via i18n;
- `aac06d58…` — seconda occorrenza dell'errore Room da localizzare;
- `cae4c262…` — helper diagnostico per il test persistence;
- `5faae0be…` — separazione degli scenari browser;
- `dfcd8688…` — commento che delimiti la porzione wrapper mockata;
- `a074639c…` — commento sull'oracolo di key-order;
- `68aba5c0…` — options object per l'helper test-only;
- `f2b98b9c…` — reader marker condiviso;
- `0495cadd…` — intenzione esplicita della validazione scartata;
- `9203f76c…` — eliminazione del clone ridondante;
- `030143af…` — stato UI/a11y separato per gli errori operativi;
- `6b370d40…` — contratto formale live/serialized;
- `de6eaf3f…` — room guard diagnostica anticipata.

## Review terminale

`T1`, `A2`, `R1` e `R3` sono pass incrementali puliti, non review dell’intero
intervallo. `X1` ha invece esaminato il diff esatto
`36e6753c… → da3c592f…`: 33 file, `+5443/-380`, SHA-256 binario
`6f642d68324572341974f3e891a66bef0435cd6fffc757868fb9c17eae338fd8`.
I 32 JSON raw hanno SHA-256 aggregato
`6d6012e7fddad2f0efe642b784c67225d37df951e1300b3f50c76bd49c044a3a`.
Il payload diff è risultato byte-per-byte uguale a Git; resta annotata
l’anomalia metadata: il review context CLI usa la base corretta `36e6753c…`,
mentre `git.json.baseCommitId` interno riporta `e07486ff…`.

I dodici issue accettati da `X1`, i due issue di repair `R2` e i due issue
validi di `R4` sono stati corretti; il terzo issue `R4` è rifiutato con il gate
ratificato e la misura TCE come evidenza. La successiva review full `X2`, i
relativi repair e il rerun terminale non vengono sommati a questo snapshot:
sono vincolati nella receipt Obsidian esterna insieme all’identità Git finale,
evitando che il ledger prodotto debba auto-descrivere una review del proprio
stesso commit. Questo file non anticipa un verde non ancora osservato.
