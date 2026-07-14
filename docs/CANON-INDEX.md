# ARDESIA — Canon Index

- **Aggiornato:** 2026-07-14
- **Stato:** indice operativo; non certifica che il codice implementi già il
  north star.
- **Prima lettura:**
  [`ADR-0004 — AI-native, evidence-authoritative, deterministic authority`](adr/ADR-0004-ai-native-evidence-authority.md).

## Ordine delle fonti

1. Guardrail di sicurezza non negoziabili della macchina.
2. Decisioni umane esplicite correnti, `AGENTS.md` applicabili e ADR con stato
   `ACCEPTED`.
3. Ref Git remoto e risultati CI riferiti all'esatto SHA candidato.
4. Codice, schemi e test versionati a quello SHA.
5. Ricevute runtime legate allo stesso release SHA.
6. Markdown versionato, usato da Obsidian come interfaccia umana.
7. AgentMemory, handoff e altri indici derivati e ricostruibili.

Un claim documentale in conflitto con codice e test allo stesso SHA è un gap da
correggere, non un motivo per descrivere come implementato ciò che non lo è.

## Decisione north-star

Ardesia è **AI-native nell'esperienza, evidence-authoritative nella verità e
deterministica nell'autorità**.

La vecchia formula `ZERO-LLM` conserva un solo significato ammesso: **zero
model-authoritative writes**. Non vieta l'uso centrale del modello per comprendere
e proporre; vieta che il modello governi identità, scope, consenso, persistenza,
provenienza, replay, decisioni e applicazione.

## Gate automatico e ricevuta di ratifica

governance_receipt_version: 1
north_star_adr_policy: immutable
governance_gate_ci: enabled
north_star: Ardesia è AI-native nell'esperienza, evidence-authoritative nella verità e deterministica nell'autorità.

La CI root verifica entrypoint, puntatori, formule obsolete e il digest UTF-8
dell'ADR ratificato dopo la sola normalizzazione dei terminatori a LF. Il digest
autorevole vive soltanto nel gate: questo `ADR-0004` north-star è immutabile e
una decisione nuova richiede un nuovo ADR ratificato che lo sostituisca. Gli
altri ADR non sono digest-pinned da questo gate. I puntatori canonici usano
soltanto la forma inline esatta
`[label](percorso/relativo.md)`, senza HTML, escape CommonMark, angle bracket,
reference-style, encoding, query o titolo, nelle prime 24 righe dell'entrypoint;
la label deve contenere almeno una lettera o un numero Unicode e il link non può
essere inglobato in un autolink GFM;
frontmatter, esempi, commenti HTML/Obsidian, il blocco storico
`claude-mem-context` e blocchi di codice non conferiscono autorità. Inline code
su più righe, fence non top-level, delimitatori matematici e sintassi template
con `<` fuori da codice e commenti sono fuori dal subset canonico. Ogni target locale deve risolvere a un
file esistente nel repository e non può tornare alle copie legacy del vault. I
link pericolosi vengono scansionati in tutto il testo operativo, anche oltre le
prime 24 righe; gli schemi bare `file`, `javascript`, `data`, `vscode` e
`obsidian` sono vietati. Il gate prova coerenza documentale sintattica
all'esatto SHA, non ratifica umana, implementazione del comportamento nel prodotto
o assenza di ogni possibile parafrasi contraddittoria. Review e protezione del
branch restano il confine di fiducia per modificare il gate.

Il gate combina una lista minima di entrypoint obbligatori, che rende visibile
una loro cancellazione, con la discovery dinamica in ogni directory non
ignorata dei basename `AGENTS.md`, `CLAUDE.md`, `AUTOPILOT.md`, `GOVERNANCE.md`
e `CODEX-WORKFLOW.md`. Ogni `AGENTS.md` deve puntare all'ADR north-star e a
questo indice; gli altri documenti vengono sottoposti alla scansione di
sicurezza e contraddizione senza acquisire autorità per il solo nome. Per tutti
questi documenti le forme di link renderizzabili ma non canoniche sono rifiutate,
i target inline sono validati e symlink o risoluzioni fuori repository non
possono entrare nel gate all'esatto SHA.
`COORDINATION.md` e `STATUS.md` descrivono storia o stato e non sono fonti di
regole operative; ricevute runtime e checkpoint mantengono invece il posto
assegnato loro nell'ordine delle fonti.

## Snapshot verificato, non release implicita

Al 2026-07-14 la baseline remota ratificata osservata è
`origin/main@91ec22eda16cf4ed12e14c565358dedc3656979f`. Questo valore è uno snapshot:
ogni run deve aggiornare i ref e registrare lo SHA effettivo prima di usarlo.

Commit o worktree locali senza branch remoto, PR e CI allo stesso SHA sono
materiale di integrazione, non release. Un deploy non legato al release SHA non è
prova del candidato corrente.

## Documenti e stato di autorità

| Documento | Stato | Uso corretto |
|---|---|---|
| [ADR-0004](adr/ADR-0004-ai-native-evidence-authority.md) | **ACCEPTED** | North star, autorità e confine AI/kernel |
| [ADR-0003](adr/ADR-0003-led-stress-zones.md) | ACCEPTED / NON PINNED | Decisione ELAB sulle zone di stress LED; fuori dal digest di questo gate |
| [ADR-0002](adr/ADR-0002-agentmemory-memory-plane.md) | PROPOSED | Evidenza architetturale; non decisione ratificata |
| [ADR-0001](adr/ADR-0001-toolhost-origin-binding.md) | PROPOSED | Decisione ToolHost ancora aperta |
| [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md) | LEGACY / DA RIVERIFICARE | Inventario storico e ipotesi |
| [PRODUCT-CANON](PRODUCT-CANON.md) | LEGACY / DA RIVERIFICARE | Evidenza di prodotto, non ordine corrente |
| [PLUGIN-MARKETPLACE-CANON](PLUGIN-MARKETPLACE-CANON.md) | LEGACY / DA RIVERIFICARE | Analisi del confine plugin |
| [ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md) | LEGACY / DA RIVERIFICARE | Analisi della separazione ELAB |
| [ELAB-SCENE-FORGE-CANON](ELAB-SCENE-FORGE-CANON.md) | LEGACY / DA RIVERIFICARE | Evidenza di dominio ELAB |
| [`../ARDESIA-MAP.md`](../ARDESIA-MAP.md) | CURRENT / NAVIGATION ONLY | Mappa dei percorsi, senza stato live o autorità normativa |
| [`vault/ARDESIA-MAP.md`](vault/ARDESIA-MAP.md) | ARCHIVED / NO AUTHORITY | Puntatore compatibile alla storia della vecchia mappa vault |

La vecchia `docs/vault/ARDESIA-MAP.md` è ora un puntatore archiviato: il corpo
precedente resta nella storia Git. I vault esterni non sono fonti operative e
devono essere classificati e resi read-only prima del cutover Obsidian.

## Verità operativa e knowledge

- Il monorepo all'esatto SHA è la sola base operativa comune per codice, contratti
  e test. Copie esterne possono fornire storia, non prevalenza.
- Git + Markdown è la knowledge durevole. Obsidian deve aprire la stessa directory
  versionata, non mantenerne una copia divergente.
- AgentMemory conserva soltanto indici e puntatori ricostruibili a SHA, decision ID
  e receipt hash; mai audio, trascrizioni, nomi o contenuto didattico.
- Ogni checkpoint aggiorna decisione, stato e indice insieme al comportamento che
  documenta.

## Invarianti di governo

- `accept`, `attest`, `save`, `publish` e `apply` sono azioni distinte.
- Una decisione del docente non trasforma automaticamente una proposizione in
  verità oggettiva.
- Le proposte del modello sono tipizzate, citate, revisionabili e legate a un
  manifest di input.
- Il prodotto continua la cattura locale quando provider o cloud non sono
  disponibili.
- Nessun segreto raggiunge browser, Git, Obsidian o AgentMemory.
- Nessun push diretto su `main`, auto-merge, deploy o trattamento di dati reali
  senza gate umano.
- Manutenibilità, ordine e coerenza sono gate bloccanti, non lavori finali.

## Debito esplicito successivo a questo indice

1. collegare Obsidian alla directory versionata e archiviare read-only le copie
   esterne dopo classificazione;
2. creare la linea d'integrazione verificata dei candidati locali;
3. consolidare i contratti pubblici e poi migrare il kernel senza big-bang;
4. introdurre un manifest di digest se il pinning deve estendersi ad altri ADR.
