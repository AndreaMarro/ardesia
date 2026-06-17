# DIRETTIVE DI ANDREA MARRO — PRIORITÀ ASSOLUTA
> Questo file viene letto dall'orchestratore all'inizio di OGNI ciclo.
> Le direttive qui hanno PRIORITÀ ASSOLUTA su tutto, tranne il Principio 0.
> Andrea può modificare questo file in qualsiasi momento — il cambiamento viene rilevato e applicato al ciclo successivo.
> Ultima modifica rilevata: vedere state/andrea-directives-hash.txt

---

## DIRETTIVE ATTIVE (2026-03-24)

### MODELLO
- Usa SEMPRE `claude-opus-4-6` — mai Sonnet, mai Haiku, mai altri modelli per il task principale.

### ZERO REGRESSIONI
- Zero regressioni. Se lo score composite scende anche di 0.001, rollback immediato con `git checkout -- .`
- Il pattern Karpathy keep/revert deve funzionare DAVVERO. Il sistema deve auto-correggersi.

### COV OBBLIGATORIA
- Chain of Verification (CoV) obbligatoria dopo OGNI task completato.
- Verifica sempre: build pass, score ≥ score_before, file corretti, Principio 0 rispettato.
- Non dichiarare "done" senza CoV eseguita.

### AUTO-ALLINEAMENTO CLAUDE + KIMI
- Claude (agente principale) e Kimi (ricerca parallela) si auto-allineano sul contesto condiviso.
- Kimi ricerca SEMPRE nella direzione indicata dalla metrica peggiore del ciclo corrente.
- I risultati di Kimi entrano nel prompt di Claude al ciclo successivo via parallel-research.json.
- Nessun coordinamento manuale necessario — il contesto fa da collante.

### INTERVENTO ANDREA
- Andrea può intervenire in qualsiasi momento modificando questo file.
- L'orchestratore rileva il cambiamento e adatta il comportamento immediatamente.
- Nessun riavvio necessario — il cambiamento viene applicato al ciclo successivo.

### RICERCA
- Le ricerche devono vertere su: difetti ELAB Tutor, innovazione EdTech, UX bambini/insegnanti, tecnologia scuole italiane (LIM, iPad, Chromebook).
- Kimi deve essere preparato con il contesto del progetto prima di ogni ricerca.
- Query dinamiche basate sulla metrica peggiore del ciclo (non lista statica).

### DEPLOY
- Il deploy deve essere automatico dopo ogni fix verificato (build pass + score non sceso).
- NETLIFY_AUTH_TOKEN deve essere configurato in automa/.env (Andrea deve generarlo).
- Senza deploy, i fix CSS/HTML non vengono misurati da evaluate.py.

### PROMPT
- I prompt devono seguire la struttura "Anatomy of a Claude Prompt":
  Task → Context Files → Reference → Success Brief → Rules → Plan → Output.
- Prompt concisi: < 1000 token di system prompt per ottimizzare i costi.

---

## COME AGGIUNGERE DIRETTIVE

Andrea può aggiungere sezioni in questo file in qualsiasi momento. Formato:

```
### NOME DIRETTIVA
- Descrizione concreta e operativa
- Max 3-5 bullet points
```

Le direttive vengono lette alla riga di `# DIRETTIVE ATTIVE` in poi.
La sezione `## COME AGGIUNGERE DIRETTIVE` viene ignorata dal parser.
