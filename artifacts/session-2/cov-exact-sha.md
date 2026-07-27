---
id: ardesia-session-2-cov-exact-sha-handoff-2026-07-27
type: evidence-handoff
status: MEASURED_PARTIAL_BLOCKED
project: ARDESIA
created: 2026-07-27
timezone: Europe/Rome
product_base_sha: 36e6753cc55c114cb1c0815a7e2f8911a0b71dc7
implementation_sha: e07486fff0a5318c8150289b433184b40119166c
implementation_tree: 21263254b9936141bbad5c791acbd607ac643cf2
final_product_binding: EXTERNAL_KNOWLEDGE_RECEIPT_REQUIRED
source_of_truth: false
---

# Sessione 2 — CoV exact-SHA handoff

Questo artifact congela il freeze implementativo e i gate osservati prima del
commit documentale. Un file Git non può contenere il proprio futuro commit SHA
senza auto-riferimento: il product SHA/tree comprensivo degli artifact viene
quindi legato dalla decisione e dal receipt exact-SHA nel repository Knowledge.
Nessun placeholder viene poi presentato come hash misurato.

## Lineage

| Campo | Valore |
|---|---|
| Base autorizzata | `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7` |
| Tree base | `4dc0f51de8c706d7b7cbb2b6e9b314f169a926fb` |
| Freeze implementativo | `e07486fff0a5318c8150289b433184b40119166c` |
| Tree implementativo | `21263254b9936141bbad5c791acbd607ac643cf2` |
| Binding prodotto finale | receipt Knowledge esterno, dopo commit e gate finali |
| Azioni esterne | nessun push, PR, merge o deploy |

## Gate sul freeze implementativo

Tutti i comandi seguenti sono stati eseguiti sul checkout pulito
`e07486fff0a5318c8150289b433184b40119166c`.

| Gate | Esito osservato |
|---|---|
| `npm run verify` | verde; Engine `2044 passed, 7 skipped`; Studio `2034 passed, 5 skipped`; typecheck verde; build Vite `2667` moduli |
| `python3 bin/ci/elab_boundary_gate.py` | verde; `12` offender baseline, `0` nuovi, `packs/ clean` |
| `bash apps/studio/eval/gate.sh` | `{"passed":2035,"failed":0,"exit":0}` |
| `git diff --check` | verde |
| manifest/lock diff dalla base | `0` file |
| `ToolCanvasEmbeddable.tsx` | `112384 → 111130` byte, delta `-1254` |
| CodeRabbit `T1` | zero finding sulla patch `ad8f6f95..e07486ff`; diff SHA-256 `c342f1c618edcb7a4637e746e5c5fdedb1daa3ad827303eb16b21062f290f981` |

I gate finali sul commit comprensivo degli artifact e la review CodeRabbit
exact-diff vengono registrati nel receipt Knowledge; non sono anticipati qui.

## Claim ammesso

**Partial simulation harness**: una sola mutazione live `connect-wire` attraversa
Room, SDK 1.4, MessageChannel, ToolHost, runtime/provider reale e `board.write`,
con receipt room/instance/digest, diagnostica provider-derived, cold reopen,
export/import, isolamento e LessonOS derivato dal log.

La fixture montata è
`apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json`
(`v1-cap6-esp1`), con provenance `candidate` e `visualMatch: unknown`.
Le evidence ref restano `resolution: missing`.

## CoV

| CoV | Stato al freeze |
|---|---|
| CoV-0 | `GREEN_MEASURED` |
| CoV-1 | `GREEN_CAUSAL_RED_TO_GREEN` |
| CoV-2 | `GREEN_BOUNDED` |
| CoV-3 | `GREEN_BOUNDED` |
| CoV-4 | `GREEN_BOUNDED` |
| CoV-5 | `BLOCKED_EVIDENCE_RESOLUTION_MISSING` |
| CoV-6 | `PENDING_FINAL_EXACT_DIFF_REVIEW` |
| CoV-7 | `GREEN_PRODUCT_LOCAL_PENDING_EXTERNAL_BINDING` |
| DoD | `PARTIAL_BLOCKED` |

## Falsificatori e debito

- Qualunque claim `verified`, `beta`, `plugin complete`, manual fidelity o
  Tinkercad parity falsifica il receipt.
- Qualunque reading non provider-derived falsifica CoV-3.
- Qualunque identità room/tool/instance fidata dal canvas falsifica CoV-2.
- Qualunque cross-room/cross-instance mutation falsifica CoV-4.
- Component add/move, layout e wire edit/delete restano fuori dal broker live.
- `v3-cap6-esp4` resta un target bloccato senza fixture montata o sintetizzata.
- Al freeze implementativo `e07486ff`, i dieci finding CodeRabbit deferiti
  restano debito esplicito nel ledger.

## Rollback e Sessione 3

Rollback: revert chirurgico dei commit locali in ordine inverso e riesecuzione
degli stessi gate; nessuna migrazione distruttiva.

La Sessione 3 può alimentare con dati reali soltanto stato
pending/accepted/rejected di `connect-wire`, receipt, digest, diagnostica
provider, provenance `candidate`/`missing`, cold restore/import e errori
fail-closed. Non può mostrare badge di fedeltà o parità.
