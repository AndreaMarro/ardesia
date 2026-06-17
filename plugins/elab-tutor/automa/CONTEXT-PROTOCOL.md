# PROTOCOLLO CONTESTO — Obbligatorio per OGNI agente

PRIMA di qualsiasi azione, leggi questi file IN ORDINE.
Se non li leggi, lavorerai senza contesto e produrrai lavoro inutile.

## 0. MASTER PLAN + VISIONE (LEGGI PRIMA DI TUTTO)
Leggi: `automa/MASTER-PLAN.md` — il piano operativo con Fasi 0-4, assegnazione lavoro, gate
Leggi: `automa/context/PRODUCT-VISION.md`
- I 6 problemi strutturali del prodotto
- I 3 pezzi per UNLIM completo (volumi, lezione, inline)
- Le priorità P0/P1
- I test di verità (ogni modifica deve superarli)
- Le linee di ricerca
OGNI azione deve servire questa visione. Se non la serve → non farla.

## 1. CHI SEI E COSA VUOI IL COMMITTENTE
Leggi: `automa/context/ELAB-COMPLETE-CONTEXT.md` (primi 4000 char)
- Chi sono i committenti (Omaric, Franzoso, Fagherazzi)
- Il Principio Zero (Prof.ssa Rossi, 52 anni, LIM, 5 secondi)
- Cosa vuole Andrea (insegnante inesperto spiega subito)

## 2. COSA HANNO FATTO GLI ALTRI AGENTI
Leggi: `automa/state/shared-results.md` (ultime 50 righe)
- Ogni agente appende qui i suoi risultati
- Se un altro agente ha trovato un bug → verificalo o fixalo
- Se un altro agente ha proposto un fix → non ripetere lo stesso lavoro

## 3. COSA HA FATTO L'AUTOMA
Leggi: `automa/state/lessons.jsonl` (ultime 10 righe)
- Ogni ciclo dell'automa produce una lesson
- Se l'automa ha fixato qualcosa → non rifarlo
- Se l'automa ha fallito → prova un approccio diverso

## 4. SCORE ATTUALE
Leggi: `automa/state/last-eval.json`
- composite, build_pass, ipad_compliance, lighthouse_perf
- Se lo score è sceso → priorità = capire perché

## 5. STATO SISTEMA
Leggi: `automa/state/state.json` (solo le sezioni loop + build + bugs)
- Il loop è vivo o morto?
- Build passa o no?
- Quali bug sono aperti?

## 6. CODA LAVORO
```bash
ls automa/queue/pending/ | head -10
ls automa/queue/active/
```
- Cosa c'è da fare?
- Cosa è già in lavorazione?

## 7. GIT RECENTE
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && git log --oneline -5
```
- Cosa è cambiato di recente?

## 8. STORIA DEL PROGETTO
Leggi: `automa/context/project-history.md` (primi 2000 char)
- Da dove viene il progetto (S4→S119→Automa)
- Lezione critica S9.5: "score 7.9 era falso, CoV rivelò 18 bug nascosti"
- Il sistema ha già avuto score gonfiati e cicli vuoti — non ripetere

## 9. PRINCIPI PEDAGOGICI
Leggi: `automa/context/teacher-principles.md`
- Reggio Emilia, Montessori, Freire, effetto Protégé
- Galileo = libro intelligente, NON professore sostitutivo
- L'insegnante impara MENTRE insegna

## 10. PERCORSO VOLUMI
Leggi: `automa/context/volume-path.md`
- Vol1 SCOPERTA (38 esp), Vol2 COMPRENSIONE (18 esp), Vol3 CREAZIONE (6 esp AVR)
- Vocabolario progressivo: Cap 6 non può usare "resistenza", Cap 9 non può usare "condensatore"

## COLLEGAMENTO TRA AGENTI
- TU non lavori da solo. Ci sono altri agenti che lavorano in parallelo.
- LEGGI shared-results.md per sapere cosa hanno trovato gli altri.
- Se un altro agente ha trovato un bug → tu verifichi se è fixato.
- Se un altro agente ha proposto un fix → tu non rifai lo stesso lavoro.
- Se l'automa ha completato un task → tu costruisci SOPRA quel lavoro.
- Se l'automa ha fallito un task → tu provi un approccio diverso.
- OGNI tuo risultato diventa contesto per gli altri nel ciclo successivo.

## DOPO IL LAVORO
1. Scrivi risultati in `automa/state/shared-results.md` (APPENDI, non sovrascrivere)
2. Se hai trovato un bug che non puoi fixare → crea task in `automa/queue/pending/`
3. Se hai fixato qualcosa → `npm run build` per verificare
4. Se build fallisce → `git checkout -- .` per revertire

## PATH
Usa sempre: `export PATH="/opt/homebrew/bin:/usr/local/bin:/Users/andreamarro/.npm-global/bin:$PATH"`
Il progetto è in: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
