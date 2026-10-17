# Ardesia

**Lavagna didattica local-first con memoria verificabile e strumenti ampliabili.**

Ardesia nasce come ambiente di lavoro di chi insegna: la lezione si svolge sulla lavagna, i materiali restano recuperabili, le osservazioni e correzioni hanno provenienza, e le attività significative alimentano una Continuità utile per riprendere lo studio. Gli strumenti specializzati si installano come plugin; programmi, esercizi e modalità di valutazione vivono in CoursePack versionati, non nel nucleo del prodotto.

**Promessa da verificare con utenti reali:** meno passaggi per docente e studente, più facilità nel correggere, riprendere e riutilizzare il lavoro didattico. Nessun claim di efficacia o prodotto completo prima di collaudo indipendente.

## Come usare e costruire il prodotto

- **Studio** — apps/studio: React, Excalidraw e interfaccia a tre superfici: Lezione, Continuità, Materiali.
- **Engine** — packages/engine: LessonOS, eventi, proiezioni, memoria e pipeline di materiali.
- **Core MCP** — interfacce con permessi e input/output versionati verso capacità di Engine/Studio; la copertura MCP completa e remota è ancora da consolidare, non una release certificata.
- **Plugin e CoursePack** — strumenti riusabili e programmi indipendenti dal core. Il primo verticale attivo di progettazione è la Fisica del semestre aperto Medicina 2026/27; la specifica è in docs/product/ARDESIA-MEDICINA-2026-27-RFC.md e il manifest *DRAFT* in packs/semestre-filtro-2026-27/.
- **Fabbrica** — ops/ e bin/: pipeline di sviluppo, prove, audit, revisione. Gli strumenti di sviluppo non vanno confusi con il prodotto distribuito.

### Avvio tecnico e prove

- Studio: npm --prefix apps/studio run dev
- Test Studio: npm --prefix apps/studio test
- Build Studio: npm --prefix apps/studio run build
- Verifica Engine: bash packages/engine/eval/gate.sh
- Controlli monorepo: npm run verify
- Stato generato, quando ambiente e dipendenze lo consentono: python3 bin/state/project_state.py

**Regola operativa:** nessun merge a main o deploy automatico senza autorizzazione e gate. I rami archiviati non equivalgono a funzionalità presenti in main. I contenuti di studenti e tutor non vanno nei repository, negli artifact pubblici o nei test.

## Identità e modello economico

Core universale, SaaS per tutor, possibilità di pacchetti editoriali e marketplace di metodi e contenuti. La direzione storica prevede **zero trattenute sulle lezioni**, un costo SaaS indicativo di circa **15 euro/mese** e un modello marketplace **70/30**: sono punti di partenza da validare su costi, contratti e mercato, **non prezzi o servizi attualmente disponibili**.

Le capacità IA sono opzionali e instradabili verso modelli locali o provider esterni previa autorizzazione: possono proporre letture, spiegazioni, classificazioni e correzioni, ma la verifica e l'eventuale approvazione restano attribuite a strumenti deterministici e al docente. La revisione di contratti più antichi che richiedevano zero LLM va gestita esplicitamente, senza aggirarne di nascosto i gate.

## Architettura stabile

**Core → Plugin → CoursePack → Workflow.** La memoria didattica è un flusso append-only; dashboard, timeline, suggerimenti e grafi sono proiezioni ricostruibili, non archivi paralleli. Il MCP è un'interfaccia al Core con permessi, provenance, audit e limiti, non una fonte alternativa di verità.

## Stato e fonti

Questo README dichiara la direzione di prodotto, **non** attesta una V1 pronta. Per lo stato osservabile leggere il commit di main, le PR e i check; per il piano verificabile del verticale Medicina la RFC dedicata. Codice e documentazione storici rimangono conservati nella genealogia Git: la sospensione di un vecchio verticale non implica la cancellazione di contributi, licenze o evidenze.

Nessuna affiliazione al Ministero dell'Università e della Ricerca, a un ateneo o a un organismo d'esame è dichiarata o implicita.
