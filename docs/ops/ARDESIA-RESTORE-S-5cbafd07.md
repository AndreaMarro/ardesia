# Restore S — risultato circoscritto, prova reale locale

**PROVED_SCOPED_SYNTHETIC_LOGICAL_FULL_STACK_RESTORE** sul prodotto `5cbafd072504cb4603bf0daa903472fa0f528247`. G0/G1 globali **NOT_CERTIFIED**. I15oggetti storici mancanti restano **OPEN**, senza eliminazioni o riclassificazioni. Nessuno dei14account originali utilizzato.

## Cosa è stato effettivamente eseguito

Nuova sorgente con quattro identità GoTrue reali, cluster PG, Auth, Storage, REST e gateway propri. Due iscrizioni tramite offerta con preview/revisione/confirm e hold/confirm HTTP. Il solo mappingAuth→principal usa il confine operatore già presente; membership/consegne/receipt non sono fabbricati conSQL. Tutti i comandi didattici passano da StudyHTTP reale.

Testo v1 consegnato e v2 successiva privata; PNG213B, PDF470B e MP33779B realmente validati e riletti con hash uguale; due viste sullo stesso pin storico; feedback del tutor sintetico; diario proposta→conferma→transfer distinto assegnato→consegna→practice→verifica. La revisione è un attore test automatizzato, non una prova umana/scientifica. PDF vuoto ha needs_clarification, audio asr_not_run; nessuna OCR/ASR/AI live.

Il backup è coordinato con Study/gateway/Auth/Storage/REST spenti. Le83tabelle dei domini public/Auth/Storage/private e le relazioni/ruoli/policy sono uguali prima e dopo la finestra. DumpDB, ruoli senza password, config/realm privati e file Storage conservati. Poi anche DB source spento.

Il target nasce in un altro cluster e volumi vuoti. Restore fail-fast e confronto83tabelle, ownerDB, attributi dei ruoli, membership e policy **prima** di avviare Auth/Storage. File fisici ripristinati e confrontati. Solo dopo si avviano servizi e app. Source è rimasta spenta durante tutte le prove target.

## Esiti osservati

| Prova | Risultato |
|---|---|
| Inventario source completo |3assetCore /3oggettiStorage /3file, hash e size esatti, zero missing/extras |
| Stato al cutoff |4Authusers,4identities,13sessioni;2consegne,3revisioni,1layout con2viste |
| Target prima dei servizi |83tabelle e metadata ruoli/membership/policy uguali; zero errori restore ignorati |
| Source, primo target, dopo restart, target ricostruito |43check registrati ciascuno, proiezioni JSON e bytes dei quattro attori identici senza normalizzazione |
| Auth/Storage diretti |Freshlogin dei4userId ripristinati; owner/tutor leggono bytes esatti; peer/altro tutor negati |
| Revoca |Solo peer target revocato; vecchio cookie401; altri3attori attivi |
| Clone sacrificabile degradato |3Core /2Storage dopo rimozione intenzionale di1oggetto; owner/tutor503provider_unavailable, nessun byte inventato |
| Seconda ricostruzione completa |Nuovi volumi, backup invariato; torna3/3/3 e43check, proiezioni uguali |
| Protezioni launcher |7unitPASS: nomi/label/endpoint/DBscope/headroom |
| Provenienza codice |416blob produzione uguali alGit5cb;150filetest archiviati esclusi dal secondo hash; nessun edit prodotto |
| Cleanup |Solo2namespace nuovi rimossi, container/reti/volumi assenti e6porte chiuse;5container originali ancora running |

Le43voci sono elencate integralmente in `evidence/assertion-inventory-43.json` e nei quattro file `*-http.json`. Una voce comprende quattro loginAuth+cookieexchange;43non significa43singole richieste. Il tutor non riceve il testo v2 privato in nessuna delle quattro proiezioni.

## Hash e inputs privati

- `private/before-backup-projections.json`: 35784B, SHA256 `9499323c38c64dd5c6ffa09be321564df6badaaf311555cbbe676bb493666cdf`.
- `private/after-restore-projections.json`: 35784B, SHA256 `9499323c38c64dd5c6ffa09be321564df6badaaf311555cbbe676bb493666cdf`.
- `private/after-restart-projections.json`: 35784B, SHA256 `9499323c38c64dd5c6ffa09be321564df6badaaf311555cbbe676bb493666cdf`.
- `private/final-reconstructed-projections.json`: 35784B, SHA256 `9499323c38c64dd5c6ffa09be321564df6badaaf311555cbbe676bb493666cdf`.

Tutti e quattro i file raw sono identici byte per byte. Hash canonico e inventario delle voci HTTP sono separati nel JSON; nessun valore temporale rimosso per produrre uguaglianza.

I backup sono sotto `private/backup/` e le credenziali sintetiche sotto `private/accounts.json`: servono al replay, non vanno pubblicati. Hash e dimensioni della coppia DB/Storage, ruolo/config e baseline in `evidence/backup-manifest.json`. Non sono backup della sorgente originale.

- `source-db-before.json`: 43181B, SHA256 `c18d7b4d7af0e2f36deae6fc2fac92d57a83f42a6f3fc225ea498fb98f52b10d`.
- `database.dump`: 459205B, SHA256 `171d8d9e7f3fd6db228bd724983b3958fed2591257ad7059a774a290b68e3635`.
- `service-config.json`: 5386B, SHA256 `7b06df80c120d29fba8e2ed4ef5d1473ab9145623136dad7d099bef1920fc7ce`.
- `roles-no-passwords.sql`: 5519B, SHA256 `a543d3ed16cb0b1cb3dfab8364a0644bd5fedcda7859377e665efb363de14df7`.
- `storage.tar.gz`: 4025B, SHA256 `2db82db694cf696c3afee973e038a7823c413fd507f35679de9f2bdc8b71f8b3`.

## Provenienza e limiti

Prova logica su servizi/volumi indipendenti nella stessa VM Docker locale. Nessuna prova di perdita dell’host/VM, RTO, capacità o altro provider. Immagini5pinnate, pull=never, namespace nuovi e binding127.0.0.1. Le reti sono bridge dedicate, non airgap. Nessuna configurazione provider/SMTP/pagamento, nessun cloud e nessuna spesa.

Il database Auth è confrontato al cutoff prima dello startup. I login successivi creano intenzionalmente nuove sessioni nel target: non si dichiara uguaglianza delle tabelle operative Auth dopo quei login. Si provano password/identità ripristinate e enforcement sessione reale, non ogni JWTstorico.

Notebook export/inspect funziona nel Core restaurato e mantiene exactrefs, ma la verifica è interna e unsigned; non attribuisce ACL o autorità canonica a un file importato. BrowserUI non eseguita in S.

Gli errori del runner sono conservati: bridge internal senza portpublish, owner configKong, race readiness iniziale, DTOhold.id, server temporaneo initdb e wrapperPID1, deadlinecoldAPI. La ricostruzione completa finale termina exit0. Nessun errore DBrestore ignorato o gate indebolito.

Una verifica larga dei file si è bloccata in letturefilesystem inDocuments; due processi verificatori propri interrotti, causa non accertata. La verifica conclusa copre tutti416file produzione selezionati rispetto ai blobGit;150filetest rimangono archiviati direttamente daGit ma non rivendicati come riletti indipendentemente. I file vuoti sono verificati con size0+blobGitvuoto.

Il codice/harness è solo nel work privato. Nessuna modifica repo/Core/API/schema/UI, nessun commit/push. Le correzioni del launcher durante la prova sono dichiarate in `report.json`, non attribuite a bug prodotto.

## Replay e stato finale

`README.md` documenta comandi/allowlist. Dopo cleanup si può ricreare SOLO target con `snapshot.py restore`, mantenendo source assente, poi capture e dispose target. Il backup non viene sovrascritto. Un nuovo run genesis richiede una nuova workspace/runId; non riusare questi account sui servizi originali.

Risorse nuove rimosse; backup/evidenze/config conservati privati0700/0600. Il cleanup non ferma VM o stack originale, non usa wildcard/prune e non rimuove immagini. `evidence/cleanup.json` contiene metadata di stato, non letture SQL degli originali. Il runner non ha contattato API5324/gateway54331/DB54332 né autenticato alcun account originale.

Esito utile: la procedura S di DB+Auth+Storage funziona per un input noto completo. Il recupero storico H restaPARTIAL e i15missing restano aperti; S non promuove G0/G1 globali.
