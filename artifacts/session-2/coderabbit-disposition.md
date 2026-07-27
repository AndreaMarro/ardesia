---
id: ardesia-session-2-coderabbit-disposition-2026-07-27
type: evidence-ledger
status: MEASURED_PARTIAL_BLOCKED
project: ARDESIA
created: 2026-07-27
timezone: Europe/Rome
raw_root: external-receipt:coderabbit-review-6f75e80b
implementation_sha: e07486fff0a5318c8150289b433184b40119166c
review_runs: 15
raw_findings: 78
source_of_truth: false
---

# Sessione 2 — ledger CodeRabbit per-commento

Questo ledger include tutte le review CodeRabbit concluse per la Sessione 2:
due pass preliminari, dodici cicli canonici e il pass incrementale terminale
`T1`. Gli UUID raw, non i fingerprint ripetuti, sono le chiavi primarie.
Tentativi falliti, interrotti o rate-limited non sono contati.

Disposition dopo la supersession STATUS nello stesso ciclo documentale:

| Stato | Totale |
|---|---:|
| `ACCEPT_FIXED` | 50 |
| `REJECT_INVALID` | 18 |
| `DEFERRED` | 10 |
| `PENDING` | 0 |
| **Totale finding raw** | **78** |

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

## Tentativi non contati

Le invocazioni terminate per rate limit, base SHA non accettata, errore del
client o interruzione prima della produzione dei finding non sono review
concluse e non entrano né nelle 15 run né nei 78 finding. Sono preservate nei
log raw referenziati da `raw_root`; il path locale resta fuori dal repository e
non vengono promossi artificialmente a pass verdi.

## Debito differito

I dieci finding differiti restano espliciti e non bloccano il freeze parziale:

- `26a4dd1e…` — resolver CoV5 e provenance completa;
- `03776dc7…` — receipt per `describe`;
- `5379067f…` — fault injection indipendente dal call-count;
- `2fc4ab8f…` — oracolo senza finestra temporale fissa;
- `5f31922a…` — estrazione typed-scene;
- `c0e957e9…` — diagnostica dei casi parametrizzati;
- `6ca77744…` — generic method type-safe;
- `eff9b9d2…` — separazione dei tre scenari browser;
- `37b76703…` — refactor remount con oracolo viewport;
- `47c59e0a…` — errore Room localizzato via i18n.

## Review terminale

`T1` è un pass incrementale pulito, non la review dell’intero intervallo.
La review CodeRabbit sul diff esatto fra base autorizzata e SHA documentale
finale viene eseguita dopo il commit di questo ledger. Il suo esito, insieme
alla riclassificazione di ogni eventuale nuovo finding, è vincolato nella
receipt Obsidian esterna; questo file non anticipa un verde non ancora
osservato.
