# Raccordo Shell → Root S00 / S05 / S06

Base8e0737b1, PR308 giàMERGED e postmergeCI40247327806SUCCESS. Questo delta non attiva feature nel Root e non modifica auth/API/persistenza.

## API implementata e consumer che manca

`ShellProps.enabledViews?: readonly View[]` controlla quali destinazioni montate vengono pubblicizzate da nav e commandpalette. Se omesso, defaultlegacy esatto delle7route già implementate nell’App. Una lista esplicitamente vuota rende vuota la lista di sezioni; non diventa fallbacklegacy. Ordine delle voci canonico, non l'ordine dell'input.

`View` aggiunge soltanto i dueID con consumer concreti:

- `independent-study` → IndependentStudy S06/PR309, solo studente. Etichetta “Studio autonomo”, descrizione “Obiettivo, pratica e ripasso”.
- `memory` → consumer S05/PR315, studente e docente, anche senza edizioni. Etichetta e descrizione proposte dall’owner S05 nel commento6405296890.

Entrambe assenti per default. Il filtro di ruolo continua anche se Root include un ID improprio per il ruolo. Questa lista è disponibilitàUI, non permessi o featureflag autorevoli. Root deve fare mount ed eseguire controlli reali prima di abilitare; backend resta autorevole. Il filtro non revoca o cancella dati della feature: lifecycle e fallback della route rimangono nel Root/consumer.

`legacyViews` viene esportato dallo stesso entry `components/Shell` per evitare una seconda lista nel consumer. `Shell`, `ShellProps` e `View` mantengono gli import precedenti. Nessun array globale mutabile, nuova dipendenza o richiesta HTTP.

## Raccordo proposto a S00, non applicato qui

Dopo il mount reale e l'aggiunta a initialView/router dei soli ID disponibili:

```tsx
import { Shell, legacyViews, type View } from './components/Shell';
const mountedViews: readonly View[] = [...legacyViews, 'memory', 'independent-study'];
// Il ruolo filtra comunque Studio autonomo. Questo non sostituisce ACL/owner.
<Shell {...existingShellProps} enabledViews={mountedViews}>{mountedContent}</Shell>
```

Il nome mountedViews nel frammento è illustrativo; il consumer deve riusare la propria lista canonica delle route montate. Non abilitare tutti gli ID con `Object.keys` o dal ruolo: le7route legacy restano l'unico default finché il Root non compone davvero i nuovi consumer.

S05: mantenere Shell come re-export, non ripristinare la vecchia implementazione in PR315. L'entry memoria prima del gate edizioni è del Root/S05; la nav non richiede un'edizione.

S06: sostituire il main interno di IndependentStudy con section/article etichettato; la Shell possiede già il main. Fonte del finding: lettura del consumer, non browser eseguito.

## Test e limiti

Cinque test puri: defaultlegacy per ruolo, opt-instudente, esclusione tutor, lista vuota, memoria per entrambi senza corsi. TreRED iniziali→4GREEN; memoryRED→5GREEN. Test consumerShell: opt-in limita nav e ricerca, attivazione restituisce lo stessoID al callback,1PASS. Nessun browser/build/tsc durante lo slot S00; prove complete rinviate al runner CI e alla composizione reale. Nessun risultato remoto o nuovo consumer montato attestato da queste unità.

ComponentiFeedback comuni: delega richiesta, non ancora ricevuta; file intatto in questo delta. SourceStatus restaunknown se l'API garantisce solo revisione esatta, senza attestare attualità. Adozione S01/S06/S08 rimane checkpoint separato con prova reale dell'owner.
