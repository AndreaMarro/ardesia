# SCHEMA.md — Contratto dati e grounding di LessonOS (M0)

Regole di manutenzione del motore semantico. Si applica a ogni job che produce o
aggiorna grafo/riepiloghi. È la fonte di verità per i contratti; il codice li
implementa, questo documento li spiega.

## 1. Il filo verticale

```
sorgente            raw (immutabile)          derived (rigenerabile)
audio docente   ->  ASR .jsonl          \
lavagna .lesson ->  events.jsonl         >-> segments -> capsule -> graph -> summary
                    session.yaml        /              (db: segments/capsule/graph)  (wiki)
```

Due ingressi, **stesso percorso a valle**:
- **ASR**: `lessonos/asr/adapter.py` (`ingest_asr_jsonl`) — audio trascritto → Segment.
- **Lavagna**: `lessonos/ingest/bundle.py` (`journal_to_segments`) — testo scritto
  sulla lavagna (ogni `element` Excalidraw di tipo `text`) → Segment.

Da `segments` in poi la pipeline è identica per entrambi.

## 2. Contratto `seg_id` (UNICO)

- Formato: `<lesson_id>#s<N>`, **1-indexed** (`#s1` è il primo segmento).
- Vale OVUNQUE: adapter ASR, journal lavagna, citazioni della capsule, righe
  `evidence`, link nei riepiloghi.
- `#s0` è **vietato** (era un off-by-one storico; i runner falliscono se lo trovano).

## 3. Grounding — la regola anti-falso-verde (`lessonos/graph/grounding.py`)

- Una citazione è **VERIFICATA** ⟺ ha un `excerpt` non vuoto che è una
  **sottostringa verbatim** del testo del segmento citato.
- `excerpt` assente o non riparabile ⇒ citazione **unverified** ⇒ **esclusa** dai
  riepiloghi (mai mostrata come grounding; mai un link `[seg_id]` nudo).
- Soglia di accettazione: se **> 20%** delle citazioni di una lezione sono
  unverified, l'accettazione **FALLISCE** (`assert_grounding_threshold`,
  `MAX_UNVERIFIED_RATIO = 0.20`, `>` stretto).
- Verifica sui dati reali: `bin/verify-grounding.sh --all` (exit 1 se sotto soglia).
- Storia: la Terza lezione passò con 80/80 evidence NULL spacciate per genuine.
  Questa regola rende quel falso-verde un FAIL duro.

## 4. raw immutabile / derived rigenerabile (Karpathy)

- `raw/` — audio, `events.jsonl`, ASR `.jsonl`, `.lesson` — **mai editati**.
  Fonte di verità. Il corpus reale vive fuori dal repo (gitignored): **path sì,
  contenuto no nei commit**.
- `derived/` — `db/lessonos.db` (segments, capsule, graph, evidence), `wiki/*.md`
  (riepiloghi) — **interamente rigenerabili** da `raw/` + codice.
- Conseguenza: **upgrade del modello LLM = rigenerazione gratuita** dei derived,
  zero perdita. Non si edita un derived a mano; si rigenera.

## 5. Pipeline (moduli)

| Stadio | Modulo | Note |
|--------|--------|------|
| segments | `asr/adapter.py` · `ingest/bundle.py` | seg_id 1-indexed |
| capsule | `capsule/assembly.py` | **windowed** (`window_size=100`); merge cross-window: concept dedup-per-nome + union citazioni, ex/q/hw dedup-per-testo |
| extraction | `capsule/extraction.py` | excerpt **obbligatorio** nel prompt; `_repair_excerpt` snap a substring o None |
| graph | `graph/writer.py` | proiezione pura **ZERO LLM**, grounding validato, DELETE+INSERT in transazione atomica, no cross-lesson |
| summary | `summarizer.py` | prompt **bounded** (top-40 concetti) anti-troncamento; parse `strict=False`; citazioni **resilienti** (ripara/esclude, mai crash) |

## 6. GDPR (Mode A)

- Solo microfono del docente, **default OFF**, consenso registrato in
  `session.yaml` (`audioConsent`).
- Audio **mai** in cloud; nessuna voce di studenti/minori; nessuno speaker-embedding.
- Revoca del consenso ⇒ i dati audio non devono **esistere** (cancellazione, non
  solo filtro in export).
- `ingest_bundle` **rifiuta** un `.lesson` che contiene `raw/audio/*` con
  `audioConsent != true` (integrità del bundle).

## 7. Come si verifica

- **Gate** (frozen, non modificabile dai builder): `eval/gate.sh` (pytest).
  Verde = exit 0 AND passed non regredisce.
- **Grounding reale**: `bin/verify-grounding.sh --all`.
- **Runner end-to-end**:
  - `bin/run_lesson_full.sh <lezione>` — ASR → capsule → grafo → riepilogo (full).
  - `bin/ingest-bundle.sh <file.lesson> <lesson_id>` — lavagna → … → riepilogo.
  - `bin/run_summary_only.sh <lezione>` — rigenera solo il riepilogo da capsule nel DB.

## 8. Manutenzione

- **Aggiungere una lezione**: trascrivi l'audio → `run_lesson_full.sh`; oppure
  esporta il `.lesson` dalla lavagna → `ingest-bundle.sh`. I runner auto-gate su
  grounding (>20% NULL) e seg_id 1-indexed: falliscono da soli se sgarrano.
- **Upgrade modello**: cambia provider/model, **rigenera i derived** da `raw/`.
- **Mai** contenuto del corpus nei commit; **mai** toccare `eval/gate.sh` dai builder;
  una citazione senza excerpt verbatim non è grounding.
