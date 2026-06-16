# Blocco-header SSOT da prependere a OGNI AGENTS.md — PROPOSTA O2 (NON deployata)

Scopo: rendere ogni `AGENTS.md` **esplicitamente subordinato** alla carta `ARDESIA-ALIGNMENT.md`, in modo
machine-parsable, cosi che un lint possa verificare "la leggono tutti". L'header e' idempotente:
se e' gia' presente (rilevato dai marcatori) NON va riaggiunto.

## A. Header da prependere (incollare come PRIMISSIME righe del file, prima del titolo)

```markdown
<!-- ARDESIA-SSOT-HEADER START — subordinato a ARDESIA-ALIGNMENT v=2026-06-15 -->
> **Questo file e' SUBORDINATO a `ARDESIA-ALIGNMENT.md` (la carta / SSOT).**
> In QUALSIASI conflitto vince la carta. Questo file descrive solo il *come* operativo,
> NON ridefinisce ruoli ne modelli.
> Ruoli e modelli (builder/brain/review/audit/research/adversarial): **vedi carta §2** —
> NON copiarli qui, potrebbero divergere. Routing effettivo: `routes.env` + `bin/route.sh`.
> builder del codice-prodotto = Claude opus-4-8 (-> sonnet); DeepSeek/Kimi = motore Hermes
> (orchestrazione/grind/test/fallback), NON builder principale. Precedenza: carta §0-bis.
<!-- ARDESIA-SSOT-HEADER END -->
```

(8 righe di contenuto tra i marcatori START/END, piu i 2 marcatori = blocco autocontenuto e rilevabile.)

## B. Riga-9 da RIFORMULARE in ciascun AGENTS.md (era la fonte della contraddizione)

**Testo attuale (STALE, identico in tutti e tre i file — contraddice carta §2 e routes.env):**
```
- **TU (DeepSeek v4-flash) = ORCHESTRATORE PRINCIPALE + BUILDER**: hai TOTALE conoscenza del progetto ...
```

**Testo proposto (riconciliato — preserva il ruolo operativo reale di Hermes):**
```
- **TU (Hermes su DeepSeek/Kimi) = ORCHESTRATORE del loop + MOTORE di grind/test/ricerca**: hai TOTALE
  conoscenza del progetto (`PLAN.md`, `project-wiki/`, `STATUS.md`, `RESEARCH.md`). Orienti, ricerchi,
  pianifichi a buon ritmo, scrivi test/grind e prototipi a basso valore cognitivo. **MA il codice-prodotto
  che entra nel build lo costruisce Claude opus** via `./bin/worker.sh opus "<spec>"` (carta §2):
  tu deleghi il BUILD e poi rivedi/integri. DeepSeek builda codice-prodotto SOLO come fallback quando
  TUTTI i Claude Max sono out. Il loop lo guidi TU, il build di prodotto NO.
```

Nota: le righe 10-11 (REVIEW = Claude Code decorrelato; ESCALATION build duro a `worker.sh opus`) restano
VALIDE e coerenti — anzi la riformulazione di riga-9 le rende coerenti col resto del file invece di
contraddirle (oggi riga-9 dice "scrivi TU il codice" ma riga-11 dice "delega il build duro a opus":
incoerenza interna gia' presente, non solo verso la carta).

## C. Perche' un header e non "copiare la tabella ruoli"
Copiare i modelli dentro ogni AGENTS.md ricrea il problema: due copie che divergono nel tempo (e' esattamente
come e' nata questa contraddizione). L'header **rimanda** alla carta e VIETA la ridichiarazione locale; il
lint controlla che nessun AGENTS.md riassegni il builder. Single source of truth reale, non duplicata.

## D. Proprieta dell'header (per il lint)
- Idempotente: presenza rilevata da `ARDESIA-SSOT-HEADER START`. Non duplicare.
- Versionato: `v=2026-06-15` deve combaciare con la versione corrente della carta (`ARDESIA-SSOT-CHARTER v=`).
  Disallineamento di versione = warning del lint (header stale).
- Posizione: PRIMA riga del file (prima del titolo `#`), cosi e' la prima cosa che il modello legge.
