---
id: ardesia-agentmemory-health
status: active
freshness: 2026-07-14T23:18:04+02:00
authority: runtime-snapshot
---

# AgentMemory — stato operativo per Ardesia

## Verdetto

**DEGRADED / NO-WRITE.** Il servizio risponde, ma non supera il gate Ardesia
per sicurezza, coerenza delle versioni, headroom e qualità del richiamo. Git,
Markdown versionato e ricevute restano il percorso operativo. AgentMemory non
blocca il prodotto e non riceve nuovi ricordi finché tutti i gate sotto sono
verdi.

“Healthy” nell'endpoint descrive la raggiungibilità tecnica del worker, non
l'idoneità a custodire knowledge Ardesia.

## Evidenza osservata il 14 luglio 2026

Prove eseguite in sola lettura, salvo una ricerca semantica stretta che non ha
creato memoria. Nessun restart, compaction, import, forget o modifica al
servizio.

| Segnale | Evidenza | Valutazione |
|---|---|---|
| `GET /agentmemory/livez` | `status: ok` | verde soltanto per liveness |
| Health | circuit breaker chiuso; KV `0.37 ms` | verde |
| Heap | 156,267,288 / 162,103,296 byte, circa 96% | rosso; target `<85%` |
| RSS | 477,888,512 byte, circa 456 MiB | osservare dopo remediation |
| Summarizer | 18 successi, 931 fallimenti su 949 chiamate | rosso |
| Versioni | servizio `0.9.27`, worker `0.11.2` | rosso |
| REST auth | liveness, health e search accettati senza credenziale | rosso |
| Trasporto locale | solo tunnel SSH loopback su `127.0.0.1:3111` | non sostituisce auth |
| MCP osservato | lancio con `npx -y @agentmemory/mcp` | rosso; non pinning |
| File env | `~/.agentmemory/.env` ora `0600` | verde locale |
| Context injection | servizio effettivo `false`, sorgente locale di restart `enabled` | rosso; riavvio può cambiare policy |
| Wire contract | `/remember` richiede `content` e non conserva i sette campi logici come campi top-level | rosso; adapter assente |
| Isolamento | recall restituisce record legacy; `project` non filtra i risultati observation | rosso |
| Recall corrente | risultati con score circa `0.007` e contenuto non pertinente al canone corrente | rosso |

È stato letto soltanto il booleano non segreto di context injection; valori
segreti non sono stati stampati. Il permesso `0600` è l'unico hardening locale
applicato in questa sessione. L'endpoint effettivo espone inoltre graph,
consolidation e auto-compress disattivati e provider `noop`.

## Policy immediata

- nessun `remember`, auto-import, transcript capture o context injection;
- nessun audio, trascrizione, nome, email, prompt, diff o contenuto didattico;
- recall solo manuale, stretto e non autorevole quando serve diagnosticare;
- ogni risultato viene ignorato se non risolve un SHA e una ricevuta correnti;
- niente restart, upgrade, auth change o pinning senza finestra separata,
  backup, rollback e gate umano;
- fallback immediato a `docs/00-INDEX.md`, Git e journal esterno.

## Gate per passare a pointer-only

Tutti obbligatori:

1. endpoint mutativi e di ricerca rifiutano richieste senza autenticazione;
2. service e worker convergono; il client MCP usa una versione compatibile
   approvata e pinning riproducibile, senza `npx -y`;
3. heap resta sotto l'85% durante una finestra di osservazione di 15 minuti;
4. circuit breaker resta chiuso e non compaiono nuovi burst di errori;
5. i flag effettivi e tutte le sorgenti di restart mantengono injection,
   auto-import, graph, consolidation e auto-compress disattivati;
6. una istanza/namespace fisicamente pulita contiene solo record pointer V1;
   il solo campo `project` non soddisfa questo gate;
7. un adapter versionato serializza il record logico nel wire contract
   installato e supera schema, round-trip e malformed-record test;
8. un golden set versionato recupera almeno 9 puntatori su 10 nei top-3, con
   zero record legacy, cross-project, malformed, superseded o withdrawn;
9. un canary pointer-only viene scritto, letto e risolto all'esatto commit;
10. export e delete del canary sono provati con ricevute e senza payload
    residuo dopo la finestra di consistenza dichiarata.

Solo dopo questi gate AgentMemory può indicizzare il formato definito in
[AGENTMEMORY-SEMANTIC-PROTOCOL](AGENTMEMORY-SEMANTIC-PROTOCOL.md).

## Limiti della prova

Non sono stati eseguiti penetration test, upgrade, misure remote dei listener,
test mutativi o un ciclo completo remember/delete. Il verdetto è quindi
conservativo: sufficiente per vietare la scrittura, non per diagnosticare la
causa primaria del 96% di heap o dei 931 fallimenti.
