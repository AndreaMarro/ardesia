---
id: ardesia-knowledge-operations
status: active
freshness: 2026-07-14T22:54:13+02:00
baseline_sha: ce89aec6b76bd99b8a885bbfe05804b221f5510f
owner: Andrea Marro
---

# Ardesia — operazioni knowledge, Obsidian e AgentMemory

## Decisione

La knowledge durevole è Markdown nello stesso Git del prodotto. Obsidian apre
`docs/` della working copy versionata; AgentMemory è un indice derivato e
ricostruibile. Nessun vault esterno, database di memoria o chat può sovrascrivere
ADR, schemi, test, CI o ricevute runtime.

## Inventario osservato il 14 luglio 2026

| Superficie | Inventario | Classificazione |
|---|---:|---|
| `docs/` versionato | 215 file, 196 Markdown | destinazione durevole |
| repository intero | 2.547 Markdown | corpus ampio, non tutto canonico |
| `ardesia-vault-local` | 118 file, 105 Markdown | sorgente di migrazione read-only |
| `ARDESIA-VAULT` | rimosso dal registro Obsidian | archivio legacy da classificare |
| `ardesia-wt/Ardesia` | rimosso dal registro Obsidian | vault incompleto/non canonico |

Snapshot del vault esterno: SHA-256 del seguente stream, eseguito dalla root
`ardesia-vault-local`. Ogni record interno è l'output testuale di
`shasum -a 256` (`hex`, due spazi, path relativo, LF); i path sono ordinati
bytewise e NUL-delimited prima dell'hash dei contenuti. Nessun file regolare è
escluso.

```sh
find . -type f -print0 \
  | LC_ALL=C sort -z \
  | while IFS= read -r -d '' vault_file; do
      /usr/bin/shasum -a 256 "$vault_file"
    done \
  | /usr/bin/shasum -a 256
```

Risultato:
`84e2d27584a42b27d4ad7e4e399550f10b05d3fe79f07c0ad5c045f81b5d6e15`.
Il digest prova l'identità osservata, non la correttezza delle note.

## Stato del cutover

1. **Preview:** creato `docs/00-INDEX.md` come candidato a unico ingresso.
2. **Preview:** configurazione Obsidian minimale in `docs/.obsidian`, senza Sync,
   Publish, audio recorder o plugin community.
3. **Preview applicata:** il registro locale contiene e apre soltanto la working
   copy di `docs/`; le tre registrazioni precedenti sono state rimosse.
4. **Transitorio:** i cinque file diventano versionati al commit locale. Dopo merge e
   checkout pulito, spostare l'apertura al percorso stabile
   `/Users/andreamarro/VOLUME 3/ardesia/docs` e verificare `00-INDEX`.
5. **Da fare per tranche:** classificare le 105 note esterne come
   `canonical-candidate | evidence | historical | duplicate | sensitive`.
6. **Da fare dopo classificazione:** importare solo ciò che ha provenienza e
   utilità corrente; aggiungere hash sorgente e `supersedes`; mai bulk-copy.
7. **Gate finale:** link risolti, metadata validi, nessun segreto/PII, Obsidian
   su percorso stabile, copie esterne classificate/read-only o fuori registro,
   e snapshot riproducibile.

### Rollback della preview locale

Trigger: `docs/00-INDEX.md` non apribile, più di un vault marcato `open`, file
Obsidian non ignorati in `git status`, oppure fallimento dei gate JSON/link.

1. nel registro locale rimuovere `open` da
   `ardesia-versioned-docs-20260714`;
2. ripristinare la registrazione `ardesia-local-20260712` sul target precedente
   `/Users/andreamarro/VOLUME 3/ardesia-vault-local` e marcarla `open: true`;
3. soltanto per eseguire il rollback, ripristinare la scrittura del proprietario
   con `chmod -R u+w '/Users/andreamarro/VOLUME 3/ardesia-vault-local'`;
4. verificare JSON valido, un solo `open`, presenza di `00-INDEX.md` nel target
   precedente e assenza di modifiche ai cinque file della slice.

Il rollback riapre la superficie precedente ma non le restituisce autorità: il
canone Git resta superiore e il finding viene registrato nel journal esterno.

## Protocollo Codex

### Ingresso

- leggere `docs/00-INDEX.md`, `docs/CANON-INDEX.md`, ADR corrente e ultimo
  checkpoint della slice;
- verificare Git live prima di fidarsi degli SHA nelle note;
- usare AgentMemory solo dopo health e freshness check.

### Uscita

- aggiornare decisione, prova e indice nella stessa slice del comportamento;
- registrare comandi conclusi, fallimenti e unknown senza contenuti sensibili;
- creare un solo puntatore AgentMemory se il servizio è sano e autenticato;
- se è degradato o non autenticato, non scrivere: Git+Markdown basta.

Schema minimo ammesso in AgentMemory:

```json
{
  "project": "ardesia",
  "commit_sha": "<sha>",
  "decision_id": "<optional-id>",
  "receipt_hash": "<hash>",
  "relative_path": "<repo-relative-path>",
  "status": "<terminal-state>"
}
```

Sono vietati audio, trascrizioni, nomi, email, room ID reali, prompt, diff,
segreti e contenuto di lezione.

## Google Drive personale

Drive personale è ammesso come destinazione esplicita di backup cifrato o di
export scelto dall'utente. Non è il journal autorevole, non sostituisce Git o il
kernel locale, non riceve segreti/provider cache e non introduce sync
bidirezionale automatico durante il founder beta. Un adapter Drive futuro deve
avere consent, scope minimo, receipt di upload/delete, hash e test di restore.

## Gate di manutenibilità

- massimo cinque file per tranche;
- niente rename massivi o cancellazioni durante la classificazione;
- un solo writer e un solo indice corrente;
- nessun plugin Obsidian o dipendenza senza ADR e approvazione;
- link GitHub-compatible preferiti ai wikilink per le pagine canoniche;
- link check e freshness check entrano in CI in una slice successiva;
- qualsiasi cutover del percorso deve avere rollback e verifica di apertura.
