# Dispatch Policy — ELAB Autoresearch Loop

**Data**: 24/03/2026

## Comandi Disponibili

| Comando | Effetto | Chi può usarlo |
|---------|---------|----------------|
| `STATUS` | Stato loop + budget + composite | Umano |
| `SCORE` | Dettaglio last-eval.json | Umano |
| `QUEUE` | Lista task pending/active/done | Umano |
| `RESULTS` | Storico results.tsv | Umano |
| `LOG` | Ultimi 30 righe log | Umano |
| `NOW` | Cosa sta facendo il loop adesso | Umano |
| `NEXT` | Prossimo task pianificato | Umano |
| `BLOCKERS` | Lista blocker attivi | Umano |
| `COST` | Budget consumato oggi/mese | Umano |
| `RISKS` | Top 5 rischi attivi | Umano |
| `REPORT <tema>` | Report su tema specifico | Umano |
| `INSERT <task>` | Aggiungi task alla coda | Umano |
| `DROP <task>` | Rimuovi task dalla coda | Umano |
| `ESCALATE <task>` | Promuovi task a P0 | Umano |
| `FREEZE <area>` | Blocca modifiche su area | Umano |
| `RESUME <area>` | Sblocca area | Umano |
| `OVERRIDE <ordine>` | Ordine diretto, priorità massima | Umano |
| `PAUSE` | Pausa temporanea (riprende con RESUME) | Umano |
| `HALT` | Stop completo (richiede riavvio) | Umano |

## Regole

1. **L'umano ha SEMPRE priorità**. Qualsiasi ordine via dispatch interrompe il ciclo corrente.
2. **HALT** = crea file `automa/HALT`. Il loop controlla prima di ogni ciclo.
3. **PAUSE** = il loop aspetta. Non perde stato. Riprende con RESUME.
4. **OVERRIDE** = il loop esegue l'ordine nel prossimo ciclo, ignorando la coda.
5. **INSERT** con priorità P0 = diventa prossimo task.
6. Il loop **non risponde** a dispatch durante l'esecuzione di Claude headless. Risponde alla fine del ciclo.
7. Ogni risposta del loop include: composite attuale, task corrente, budget residuo.
8. Se il budget giornaliero > €1, il loop rallenta (pause 60s invece di 30s).
9. Se il budget mensile > €40, il loop passa a solo AUDIT e RESEARCH (no IMPROVE).

## Monitoraggio

```bash
# Stato rapido
bash automa/dispatch.sh status

# Score dettagliato
bash automa/dispatch.sh score

# Coda task
bash automa/dispatch.sh queue

# Log in tempo reale
tail -f automa/logs/loop-*.log

# Ferma il loop
bash automa/dispatch.sh halt
# oppure: touch automa/HALT
```

## Escalation Automatica

Il loop auto-escala a HALT se:
- Build fallisce 2 volte consecutive
- Composite scende > 0.05 in un ciclo
- Budget giornaliero > €2
- Errore Python non gestito

Il loop auto-escala a umano se:
- Task fallisce 3 volte consecutive
- Nessun check passa
- Nanobot/Vercel/Brain irraggiungibili
