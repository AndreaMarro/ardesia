# ELAB — Audit Totale con Doppio CoVe
## © Andrea Marro — 10/02/2026

---

## Come usare questo prompt

Copia-incolla questo intero file come prompt in una **nuova sessione Claude Code**.
Il prompt guida Claude attraverso un audit completo e onesto di tutti e 3 i sistemi ELAB,
usando il metodo **Doppio CoVe** (Chain of Verification sulla Chain of Verification stessa).

---

## PROMPT INIZIA QUI

---

Sei un auditor tecnico incaricato di valutare ONESTAMENTE lo stato di 3 sistemi interconnessi del progetto ELAB. Non minimizzare nulla, non nascondere problemi, non essere diplomatico. Servono fatti crudi.

### I 3 SISTEMI

| Sistema | Path locale | URL produzione | Stack |
|---------|-------------|----------------|-------|
| **Sito Pubblico** | `/Users/andreamarro/VOLUME 3/newcartella/` | https://funny-pika-3d1029.netlify.app | HTML/CSS/JS statico + Netlify Functions |
| **Tutor "Galileo"** | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/` | https://elab-builder.vercel.app | React 19 + Vite + Vercel |
| **Admin Panel** | Dentro entrambi i progetti (vedi sotto) | stesse URL (sezioni protette) | React (tutor) + HTML (sito) |

### CONTESTO CRITICO (da sessioni precedenti — VERIFICARE, NON DARE PER SCONTATO)

Queste affermazioni provengono da sessioni precedenti. La tua prima azione è **verificarle una per una** perché potrebbero essere false o obsolete:

1. Stripe è stato "completamente rimosso" → **FALSO.** Ci sono ancora 8+ file con riferimenti Stripe nel sito Netlify, e `stripeService` esportato da `notionService.js` nel tutor
2. "67 esperimenti funzionano nel simulatore" → **PARZIALMENTE VERO.** I dati ci sono (38+18+11) ma i file `.hex` per Vol3 NON ESISTONO (directory `public/hex/` è vuota)
3. "Wokwi completamente rimosso" → **QUASI VERO.** Rimangono: `wokwiId` nei dati legacy, `findExperimentByWokwiId()` wrapper deprecated, commenti nei file nuovi
4. "Build senza errori" → **VERO.** 484 moduli, 0 errori. Ma chunks > 500kB (warning Vite)
5. "Admin panel collegato a Notion" → **VERO.** Ma il sito ha ANCHE un admin separato (`admin.html` + `netlify/functions/admin.js`)
6. `ElabSimulatorV3.jsx` è ancora nel codebase ma NON è importato da nessuno → file orfano
7. Ci sono 161 `console.log/warn/error` nel codebase tutor (30 file)
8. `localhost:8000` hardcodato come fallback in 3 file (CodeEditor, ManualViewer, useFunctionGemma)
9. `EditorShell.jsx.bak` — file backup non eliminato
10. Le canonical URL nel sito puntano a `elab.school` ma il sito è deployato su `funny-pika-3d1029.netlify.app`

---

## FASE 1: CoVe PRIMARIO — Audit Sistematico

Esegui queste 12 verifiche in ordine. Per ognuna:
- **LEGGI** i file reali (non fidarti del contesto sopra)
- **TESTA** con tool concreti (grep, glob, build, fetch URL)
- **REGISTRA** il risultato con severità: 🔴 CRITICO / 🟠 MEDIO / 🟡 BASSO / 🟢 OK

### CHECK 1: Integrità Build Tutor
```
cd "/Users/andreamarro/VOLUME 3/manuale/elab-builder" && npm run build 2>&1
```
- Compila? Quanti moduli? Errori? Warning?
- Dimensione bundle totale (JS + CSS)?

### CHECK 2: File .hex per Vol3
```
ls -la "/Users/andreamarro/VOLUME 3/manuale/elab-builder/public/hex/"
```
- La directory esiste? È vuota?
- Quanti file `.hex` sono referenziati in `experiments-vol3.js`?
- Se mancanti: **Vol3 Arduino è NON FUNZIONANTE**

### CHECK 3: Stripe — Davvero Rimosso?
```
grep -r "stripe\|Stripe" "/Users/andreamarro/VOLUME 3/newcartella/" --include="*.html" --include="*.js" --include="*.css" -l
grep -r "stripe\|Stripe" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/" -l
```
- Elencare OGNI file che ancora contiene Stripe
- Distinguere: commento residuo vs codice attivo vs import funzionale

### CHECK 4: Riferimenti a localhost in produzione
```
grep -rn "localhost\|127\.0\.0\.1" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/" --include="*.js" --include="*.jsx"
```
- Ogni localhost che finisce in bundle di produzione è un BUG
- Verificare se sono fallback condizionali o hard reference

### CHECK 5: Console.log in produzione
```
grep -rc "console\.\(log\|warn\|error\|debug\)" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/" --include="*.js" --include="*.jsx" | sort -t: -k2 -rn | head -20
```
- Conteggio totale
- Top 10 file con più console statements
- Quanti sono `console.error` (accettabili) vs `console.log` (da rimuovere)?

### CHECK 6: File Orfani nel Tutor
Cerca file che NON sono importati da nessun altro file:
- `ElabSimulatorV3.jsx` — è importato da qualcuno?
- `EditorShell.jsx.bak` — perché esiste ancora?
- Qualsiasi file `.old`, `.bak`, `.backup` nel src/

### CHECK 7: Link Rotti nel Sito Netlify
Per OGNI pagina HTML in `/Users/andreamarro/VOLUME 3/newcartella/*.html`:
- Estrarre tutti gli `href` e `src` interni
- Verificare che i file target esistano
- Focus su: `/kit/volume-1.html`, `/kit/volume-2.html`, `/kit/volume-3.html`

### CHECK 8: Canonical URL vs URL Reale
```
grep -rn "canonical\|og:url" "/Users/andreamarro/VOLUME 3/newcartella/" --include="*.html"
```
- Le canonical URL puntano a `elab.school`?
- Il sito reale è su `funny-pika-3d1029.netlify.app`
- Questo è un problema SEO?

### CHECK 9: Sicurezza Admin
- Il pannello admin del sito (`admin.html`) è accessibile senza login?
- Ci sono credenziali hardcodate?
- Il pannello admin del tutor (`AdminPage.jsx`) controlla `isAdmin`?
- Ci sono token/hash esposti nel codice sorgente?

### CHECK 10: Webhook e API Raggiungibili
```
# Test che i webhook n8n rispondano (senza inviare dati reali)
curl -s -o /dev/null -w "%{http_code}" https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat
curl -s -o /dev/null -w "%{http_code}" https://n8n.srv1022317.hstgr.cloud/webhook/elab-license
curl -s -o /dev/null -w "%{http_code}" https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin
```
- I webhook rispondono o danno timeout/404?
- Se down: QUALE parte dell'app si rompe?

### CHECK 11: Esperimenti — Coerenza Dati
```
# Verifica conteggi
grep -c "id:" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/data/experiments-vol1.js"
grep -c "id:" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/data/experiments-vol2.js"
grep -c "id:" "/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/data/experiments-vol3.js"
```
- Vol1 = 38? Vol2 = 18? Vol3 = 11? Totale = 67?
- Tutti i `simulationMode` corretti? (vol1+vol2 = "circuit", vol3 = "avr")
- Tutti i tipi componente esistono nel registry? (confronto con `registry.js`)

### CHECK 12: Coerenza Cross-Sistema
- Il sito pubblico linka al tutor? (`beta-test.html` → `elab-builder.vercel.app`?)
- Il tutor linka al sito? (pulsante "Acquista su Amazon" → link Amazon reali?)
- L'admin del sito e l'admin del tutor condividono gli stessi DB Notion?
- Ci sono ID Notion duplicati o in conflitto?

---

## FASE 2: CoVe SECONDARIO — Verifica della Verifica

Dopo aver completato tutti i 12 check, applica il **Meta-CoVe** — verifica che la tua stessa verifica sia stata onesta e completa.

### META-CHECK A: Ho davvero letto i file?
Per ogni check dove hai riportato un risultato, rispondi:
- Ho effettivamente usato `Read`, `Grep`, `Glob`, `Bash`, o `WebFetch`?
- O ho dato per scontato qualcosa dal contesto fornito?
- Se ho assunto: RIPETI il check con tool reali

### META-CHECK B: Ho minimizzato qualcosa?
Rileggi i tuoi risultati e chiediti:
- C'è un problema che ho classificato 🟡 BASSO che in realtà è 🟠 MEDIO o peggio?
- Ho evitato di menzionare qualcosa di scomodo?
- Il "contesto critico" sopra è CONFERMATO o SMENTITO dai miei test reali?

### META-CHECK C: Ho verificato entrambe le direzioni?
Per ogni "OK" riportato:
- Ho provato a ROMPERE il sistema? (non solo confermato che funziona)
- Esempio: "Build OK" — ma ho provato a importare un file orfano per vedere se rompe?
- Esempio: "Admin protetto" — ma ho provato ad accedere senza token?

### META-CHECK D: Contraddizioni interne
Cerca contraddizioni nel tuo stesso report:
- "Stripe rimosso" ma "stripeService esportato" → contraddizione?
- "67 esperimenti" ma "hex mancanti" → funzionano davvero 67?
- "Build 0 errori" ma "file orfani" → il tree-shaking li esclude o sono nel bundle?

---

## FASE 3: Report Finale — Onestà Radicale

Produci un report con questa struttura ESATTA:

### A. TABELLA PROBLEMI (ordinata per severità)

| # | Severità | Sistema | Problema | File/URL | Impatto Utente | Fix Stimato |
|---|----------|---------|----------|----------|----------------|-------------|
| 1 | 🔴 | ... | ... | ... | ... | ... |

### B. COSA FUNZIONA DAVVERO (provato, non assunto)
Lista SOLO le cose che hai VERIFICATO funzionare con tool reali.

### C. COSA NON FUNZIONA (provato, non assunto)
Lista SOLO le cose che hai VERIFICATO essere rotte.

### D. ZONA GRIGIA (non verificabile da CLI)
Cose che richiedono test manuale nel browser:
- Il simulatore si apre davvero?
- L'AI risponde?
- Il login funziona?

### E. STRATEGIA IN 3 FASI

#### Fase 1: Hotfix (blockers per produzione) — Target: 1 sessione
Elenca SOLO i fix che IMPEDISCONO l'uso dell'app. Max 5 item.

#### Fase 2: Pulizia (debito tecnico) — Target: 1-2 sessioni
Elenca il debito tecnico che non blocca ma degrada. Max 10 item.

#### Fase 3: Evoluzione (miglioramenti) — Target: futuro
Elenca miglioramenti non urgenti ma importanti. Max 5 item.

### F. DECISIONI CHE SERVONO DA ANDREA
Elenca le domande che SOLO il proprietario può rispondere:
- Il dominio `elab.school` è stato acquistato? Se sì, le canonical URL vanno bene. Se no, vanno cambiate.
- Vol3 deve funzionare subito? Se no, mostrare "Coming Soon" nel simulatore è accettabile.
- I due admin panel (sito + tutor) sono entrambi necessari o uno è ridondante?
- Il numero WhatsApp (+39-346-8093661) è corretto e attivo?
- L'email `elab.vendite@gmail.com` è monitorata?

---

## NOTE SUL METODO DOPPIO CoVe

Il **Doppio CoVe** funziona così:

```
CoVe Livello 1 (Primario):
  Per ogni affermazione → Generare domanda di verifica → Eseguire verifica → Registrare

CoVe Livello 2 (Meta):
  Per ogni verifica del Livello 1 → "Ho davvero verificato?" → "Ho minimizzato?" → Correggere

Risultato: Le bugie si eliminano in L1, le omissioni in L2.
```

Il bias naturale di un AI assistant è:
- Minimizzare problemi per non "deludere"
- Classificare come BASSO cose che sono MEDIE
- Dire "quasi pronto" quando non lo è
- Confermare ciò che il contesto suggerisce senza verificare

Il Doppio CoVe contrasta TUTTI questi bias. Usalo.

---

## FINE PROMPT
