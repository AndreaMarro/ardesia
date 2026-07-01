# ARDESIA — Personal aiOS per utente

Data: 2026-07-01
Stato: analisi critica iniziale

## Verdetto

L'idea di dare a ogni utente un piccolo aiOS personale e' coerente con ARDESIA, ma non va implementata come un vero sistema operativo. Va implementata come uno strato applicativo: profilo, memoria, grafo, tool, plugin, preferenze, workflow, permessi e integrazioni.

Formula consigliata:

```text
User aiOS = LessonOS personal kernel + memoria + plugin runtime + tool permissions + integration gateway.
```

## Perche' e' utile

Ogni docente o studente potrebbe avere un ambiente personale che ricorda:

- lezioni;
- appunti;
- materiali caricati;
- plugin usati;
- errori ricorrenti;
- preferenze;
- stile didattico;
- workflow;
- obiettivi;
- esercizi;
- student-pack.

Questo rende ARDESIA piu' di una lavagna: diventa un ambiente didattico personale.

## Ricerche correlate

### AIOS agiresearch

AIOS si presenta come AI Agent Operating System con kernel, SDK, gestione di LLM, memoria, storage, tool e agenti. Il concetto rilevante per ARDESIA non e' copiare il kernel, ma prendere l'idea di risorse agentiche gestite in modo standard: memoria, strumenti, scheduling, contesto, storage, agent hub.

### aiox-core

AIOX e' un framework di orchestrazione con agenti, workflow, installazione, doctor e squad. Utile come ispirazione per fabbrica, skill, workflow e health checks. Non e' un prodotto didattico.

### OpenHuman

OpenHuman e' rilevante per l'idea di AI personale con memoria locale, vault stile Obsidian, integrazioni gestite, model routing e interfaccia semplice. Licenza GPL-3.0: attenzione se si volesse riusare codice. Meglio studiare pattern, non copiare.

### TencentDB-Agent-Memory

TencentDB Agent Memory e' rilevante per memoria locale a livelli, context compression, import/export, skill generation e dashboard. Utile per ripensare AgentMemory di ARDESIA e per ogni user-aiOS.

### GitHub topic ai-operating-system

Il topic contiene molti progetti immaturi o speculativi. Da usare come scouting di pattern, non come dipendenza diretta.

## Architettura proposta

```text
User aiOS
├── Identity/Profile
├── LessonOS Graph
├── Long-term Memory
├── Short-term Context
├── Plugin Permissions
├── Tool Registry
├── Workflow State
├── Material Vault
├── Student/Teacher Mode
├── Integration Gateway FastAPI/MCP
└── Export/Import/Sync
```

## iPad feasibility

Fattibile su iPad come client, non come kernel pesante.

Su iPad deve vivere:

- lavagna;
- plugin UI;
- offline cache;
- appunti;
- export/import;
- sync controllato;
- interfaccia touch/Pencil.

Sul server o Mac mini devono vivere:

- indicizzazione pesante;
- OCR grande;
- agenti;
- build PDF;
- solver complessi;
- routing modelli;
- job batch.

Conclusione: iPad-first e' fattibile se l'aiOS personale e' cloud/local-hybrid, non tutto on-device.

## Multilingua

ARDESIA deve essere nativamente multilingue. Il personal aiOS deve salvare:

- lingua UI;
- lingua docente;
- lingua studente;
- preferenze terminologiche;
- traduzioni materiali;
- glossario personale;
- equivalenze tecniche.

Per elettrotecnica questo e' importante: termini come nodo, maglia, ramo, Thevenin, Norton, fasore devono avere glossari controllati.

## ChatGPT Apps e integrazioni

Il personal aiOS deve esporre strumenti via FastAPI/MCP:

- cerca nel grafo LessonOS;
- apri lezione;
- crea student-pack;
- risolvi circuito;
- genera prova;
- monta plugin;
- esporta PDF;
- aggiorna memoria.

Target integrazioni:

- ChatGPT Apps;
- Claude;
- Codex;
- Teams;
- Moodle;
- LMS;
- MCP;
- Vercel;
- GitHub.

## GDPR / privacy

Andrea dice no GDPR per ora, quindi non bloccare MVP. Ma non si puo' ignorare la privacy se il sistema salva dati studenti.

Regola MVP:

- nessun dato reale studente obbligatorio;
- local-first;
- export/delete;
- niente segreti nei log;
- niente PII nei repo;
- consenso e policy piu' avanti.

## Rischi

1. Overengineering: costruire un finto OS invece di una demo didattica.
2. Privacy: memoria personale senza governance.
3. Costi: agenti sempre accesi.
4. UX: sistema potente ma incomprensibile.
5. Licenze: OpenHuman GPL-3.0 e altri repo non copiabili liberamente.
6. iPad: limiti di runtime pesante.

## MVP consigliato

Non costruire subito un aiOS completo. Costruire:

```text
Personal Learning Kernel v0
```

Funzioni:

1. profilo utente;
2. grafo LessonOS personale;
3. memoria compatta;
4. plugin usati;
5. materiali caricati;
6. preferenze lingua;
7. export/import;
8. FastAPI endpoints;
9. primo tool ChatGPT/MCP read-only.

## COV

Fonti verificate online:

- agiresearch/AIOS;
- SynkraAI/aiox-core;
- tinyhumansai/openhuman;
- TencentCloud/TencentDB-Agent-Memory;
- GitHub topic ai-operating-system.

Non fatto:

- nessuna installazione;
- nessun codice copiato;
- nessuna dipendenza aggiunta;
- nessun deploy.
