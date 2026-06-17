# lessonos-grounding-check

Invariante anti-allucinazione per LessonOS: ogni claim nel codice deve essere fondato
su dati reali (fixture, store segmenti, test non-tautologici). Pattern #1 nei review —
formalizzato per prevenire regressioni di grounding.

## When-to-apply

- Prima di ogni commit, su qualunque diff che genera o usa citazioni (Lesson Capsule,
  Path Memory, Didactic Delta, mock payload).
- In review: come checklist adversariale per rilevare grounding falso (seg_id
  fabbricati, excerpt inventati, test tautologici, docstring con claim non verificabili).

## Checklist/Procedura

- [ ] Ogni `Citation.seg_id` nel codice di produzione risolve a un Segment persistito nello Store (altrimenti `ValueError`).
- [ ] Ogni `Citation.excerpt` (se non None) è substring **verbatim** del testo del segmento target.
- [ ] I mock payloads (`_LESSON_MOCKS`, fixture di test) usano seg_id reali dalle fixture, non inventati.
- [ ] I test NON asseriscono valori che il mock restituisce per costruzione (tautologico): assert il VALORE o verifica la risoluzione a segmento reale.
- [ ] Il prompt LLM espone solo dati ingeriti (seg_id+testo) — nessun seg_id fabbricabile.
- [ ] `ValueError` su seg_id penzolante / segmento non ingerito: la funzione fallisce, non produce claim non verificati.
- [ ] Ogni docstring che cita un paper/modello/autore ha URL o DOI verificabile ("ispirato a FSRS" senza citazione = falso).
- [ ] Ogni lookup per-concept normalizza il case su entrambi i lati (`.lower()` su chiave e dizionario) tramite funzione centralizzata.
- [ ] Excerpt matching è case-sensitive: attenzione a "Derivata" vs "derivata" nelle fixture.
- [ ] Edge cases coperti: seg_id inesistente → ValueError; excerpt None → accettato; citazioni multiple risolvono indipendentemente.

## Origine-RETRO

- RETRO #3: grounding verification (seg_id fabbricati, excerpt matching, test tautologici) = pattern #1 nei review feedback (>=4 osservazioni).
- RETRO #4: docstring/claim inventati (pattern 3x); `>=` su conteggi deterministici (3x); normalizzazione case-insensitive (2x).
- RETRO #5: grounding excerpt non verificato in test (pattern 3x).
- Skill originaria: `~/.hermes/skills/software-development/lessonos-grounding-check/SKILL.md` (esterna al repo, non auto-caricata) — migrata qui per chiudere il loop.
