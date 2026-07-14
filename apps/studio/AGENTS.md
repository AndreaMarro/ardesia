# AGENTS.md — Ardesia Studio

> **Prima di operare:** leggere
> [`../../docs/adr/ADR-0004-ai-native-evidence-authority.md`](../../docs/adr/ADR-0004-ai-native-evidence-authority.md),
> [`../../docs/CANON-INDEX.md`](../../docs/CANON-INDEX.md) e l'`AGENTS.md` root.
> Riferimenti esterni e vecchi vault sono materiale storico, non fonte di verità.

## 1. Missione e confine

Ardesia Studio è la superficie iPad/Safari-first di cattura, continuità e
revisione. Il codice conserva ancora nomi storici come MAESTRO o LessonOS: non
rinominarli incidentalmente e non dedurne un'autorità separata.

La UI può:

- raccogliere eventi della lavagna, note, selezioni e input autorizzati;
- mostrare proiezioni deterministiche e stato reale della persistenza;
- presentare proposte AI citate e permettere decisioni esplicite del docente.

La UI non può assegnare autonomamente scope, attestare un claim, pubblicare un
artefatto o applicare una modifica alla lavagna. Queste operazioni attraversano
porte e command gateway del kernel.

## 2. Pipeline per ogni slice

`OBSERVE → BASELINE → PLAN → RED → WRITE → TARGETED_VERIFY → FULL_VERIFY → INDEPENDENT_REVIEW → CHECKPOINT`

- Una sola responsabilità osservabile e massimo cinque file di prodotto.
- Dopo due tentativi falliti sulla stessa `plan_version`, tornare a `OBSERVE` e
  ripianificare.
- Un edit successivo alla verifica invalida test e review precedenti.
- Il checkpoint registra SHA/base, diff, test prima/dopo, rischi, verdetto e
  prossimo passo; non dichiara completato ciò che non è stato provato.

## 3. Gate tecnici già verificati

- `tsc -b` è la fonte del typecheck; Vitest/esbuild non lo sostituiscono.
- Eseguire `npm run typecheck`, la suite Vitest deterministica e `npm run build`.
- Per la full suite Vitest usare il profilo seguente.

```text
--pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```
- `tsconfig` è strict: nessun import o parametro inutilizzato.
- `localStorage` è cache, mai fonte di verità.
- Eventi e replay non dipendono da `Math.random()` o `Date.now()` nel percorso
  deterministico.
- Per i blob binari usare `arrayBuffer`, mai `Blob.text()`.
- Le copie vendored del solver sono protette dal drift guard: non modificarle
  incidentalmente.
- Non riconciliare i due golden elettrici storici senza una decisione dedicata.
- Non modificare o aggirare `eval/gate.sh` per ottenere un verde artificiale.

## 4. Confini provider, privacy e audio

- Nessun segreto, service key o SDK di provider nel browser, nei componenti UI o
  nei moduli di dominio.
- I modelli sono accessibili soltanto tramite una porta provider-neutral e un
  adapter server-side; il test adapter resta deterministico.
- Gli output del modello sono `model-proposal`: forma strutturata non significa
  correttezza semantica.
- Audio disattivato per default, consent receipt esplicita e indicatore visibile.
- L'audio va trattato come potenzialmente multi-speaker anche con cuffie; non
  assumere mai che contenga soltanto la voce del docente.
- Raw audio escluso dalla persistenza ordinaria; nessun contenuto didattico reale
  o sensibile in log, error reporting o analytics. Fixture visuali e Storybook
  usano soltanto contenuti deterministici, sintetici o de-identificati e test-only.
- Cloud e replica non possono mascherare un fallimento locale né diventare
  autorità semantica.

## 5. Manutenibilità

- Nessun nuovo import di SDK o moduli di provider AI nel dominio o nella UI.
- Nessuna seconda definizione manuale di uno schema pubblico.
- Nessun nuovo file oltre 400 LOC senza eccezione motivata.
- Ogni compatibility shim dichiara proprietario, condizione e milestone di
  rimozione.
- Nessun TODO senza issue o decisione collegata.
- Ogni nuova dipendenza richiede approvazione esplicita e aggiornamento coerente
  di manifest e lockfile.
- Testare WebKit/iPad viewport; la prova finale del beta richiede anche iPad
  Safari reale, non soltanto emulazione desktop.
