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
| [ADR-0002](adr/ADR-0002-agentmemory-memory-plane.md) | PROPOSED | Evidenza architetturale; non decisione ratificata |
| [ARCHITECTURE-CANON](ARCHITECTURE-CANON.md) | LEGACY / DA RIVERIFICARE | Inventario storico e ipotesi |
| [PRODUCT-CANON](PRODUCT-CANON.md) | LEGACY / DA RIVERIFICARE | Evidenza di prodotto, non ordine corrente |
| [PLUGIN-MARKETPLACE-CANON](PLUGIN-MARKETPLACE-CANON.md) | LEGACY / DA RIVERIFICARE | Analisi del confine plugin |
| [ELAB-AS-PLUGIN-CANON](ELAB-AS-PLUGIN-CANON.md) | LEGACY / DA RIVERIFICARE | Analisi della separazione ELAB |
| [ELAB-SCENE-FORGE-CANON](ELAB-SCENE-FORGE-CANON.md) | LEGACY / DA RIVERIFICARE | Evidenza di dominio ELAB |

`docs/vault/ARDESIA-MAP.md` e vault esterni non sono fonti operative. Devono essere
archiviati o riallineati in una slice dedicata; fino ad allora ogni loro istruzione
in conflitto è storica.

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

1. riallineare o archiviare la mappa vault obsoleta;
2. rendere automatico in CI il controllo di puntatori e formule canoniche;
3. creare la linea d'integrazione verificata dei candidati locali;
4. consolidare i contratti pubblici e poi migrare il kernel senza big-bang.
