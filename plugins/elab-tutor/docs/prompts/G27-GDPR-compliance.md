# G27 — GDPR + COMPLIANCE

## OBIETTIVO: GDPR da 1/10 a 6/10. Documentazione per vendita PA.

## CONTESTO
Senza GDPR, nessuna scuola pubblica puo' acquistare via MePa.
Server attuali: Render (USA), Vercel (USA), n8n Hostinger.
Target: Mistral (EU) come provider AI GDPR-compliant.

## TASK
1. DPIA draft (Data Protection Impact Assessment) (4h)
   - Documentare TUTTI i flussi dati: cosa, dove, per quanto
   - localStorage: sessioni, memoria studente, preferenze
   - Nanobot Render: testo + immagini inviate per analisi AI
   - n8n Hostinger: webhook per analytics
   - Vercel: hosting frontend (no dati utente)
   - Brain VPS: modello locale (nessun dato esce)
   - Rischio per categoria: basso/medio/alto
   - Misure di mitigazione per ogni rischio

2. Valutazione Mistral EU (2h)
   - Ricercare Mistral API: Zero Data Retention policy
   - Costo stimato per 1000 studenti/mese
   - Latenza comparata con DeepSeek/Groq
   - Piano migrazione: nanobot → Mistral per risposte in produzione

3. Flussi dati documentati (2h)
   - Diagramma: utente → frontend → nanobot → AI → frontend
   - Quali dati: testo (domande), immagini (screenshot), metadata (experimentId)
   - Dove: localStorage (device), Render (cloud USA), Hostinger (analytics)
   - Retention: localStorage = infinito, Render = nessun storage, Hostinger = ?

4. Consenso minori Art. 8 GDPR (2h)
   - In Italia: <14 anni serve consenso genitoriale
   - Workflow: scuola firma contratto → copre consenso per tutti gli studenti
   - Alternativa: "modalita' anonima" senza raccolta dati personali
   - Implementare flag `anonymousMode` che disabilita analytics + session sync

5. Privacy policy aggiornata (2h)
   - Aggiornare /privacy con tutti i provider
   - Linguaggio chiaro (non legalese) per dirigenti scolastici
   - Sezione specifica "Dati dei minori"

## VERIFICA
- Documento DPIA completo in docs/compliance/DPIA.md
- Valutazione Mistral in docs/compliance/mistral-evaluation.md
- Privacy policy aggiornata e deployata
- Flag anonymousMode implementato (anche se non ancora attivato)

## NOTE
- Questa sessione NON tocca codice del simulatore
- Focus: documentazione, ricerca, policy
- Usare /firecrawl per ricerca Mistral GDPR
- Usare /search per PNRR requisiti privacy scuole
