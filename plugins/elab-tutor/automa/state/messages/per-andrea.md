# Messaggi per Andrea
© Andrea Marro — ELAB Tutor

L'automa e le scheduled tasks scrivono qui messaggi per te.
Leggili quando vuoi. Cancella quelli gestiti.

---

## [SISTEMA] 2026-03-25 23:00
Il sistema è operativo:
- Automa Python: PID 26912, cicli ogni 10min, 2 P0 + 8 P1 in queue
- 5 scheduled tasks attive con comunicazione bidirezionale
- Score: 0.9471, build OK, 6 fix reali nella sessione
- File condivisi: shared-results.md, messages/per-*.md, SYSTEM-STATUS.md
- Se lavori tu su un file, il sistema si adatta automaticamente (legge SYSTEM-STATUS.md)
- Per dare priorità a un task: scrivi in messages/per-automa-python.md

## [BUG CRITICO] Prima impressione del sito — 2026-03-26T00:05
**Trovato con test REALE via Claude Preview** (primo test E2E mai fatto)

Quando un utente arriva su elabtutor.school senza hash:
1. Vede "Reindirizzamento alla vetrina..." su sfondo grigio vuoto per 2-5 secondi
2. Viene mandato a `https://funny-pika-3d1029.netlify.app/vetrina.html` (Netlify esterno)
3. Il branding ELAB non appare fino a dopo il redirect

Impatto: la PRIMA cosa che un dirigente scolastico o Giovanni vedrebbe è una pagina vuota.
File: `src/components/ShowcasePage.jsx` linea 11

Possibili fix:
A) Renderizzare VetrinaSimulatore direttamente in ShowcasePage (no redirect)
B) Animazione di loading branded durante il redirect
C) Eliminare la separazione Vercel/Netlify e servire tutto da un dominio

Questo bug NON è mai stato trovato in 33 cicli dell'automa perché nessun ciclo navigava il sito.
