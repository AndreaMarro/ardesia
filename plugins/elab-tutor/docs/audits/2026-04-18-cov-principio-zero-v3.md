# CoV — Chain of Verification completa 18/04/2026 sera

**Data**: 18/04/2026
**Scope**: verificare onestamente TUTTO il lavoro fatto oggi 18/04 + Principio Zero v3 allineamento
**Governance**: `docs/GOVERNANCE.md` regole 1-5

---

## 📋 Commit del giorno 18/04/2026

| SHA | Messaggio | Verifica |
|-----|-----------|----------|
| `4d12f33` | feat(unlim): Principio Zero esplicito system prompt | Pre-Principio-Zero v3 — da rivedere |
| `1d17ede` | fix(unlim): disable Gemini 2.5 thinking | ✅ corretto, non tocca PZ |
| `f3798a9` | docs(claude-md): bug #2 UNLIM RISOLTO | ✅ ma claim "RISOLTO" era prematuro rispetto a PZ v3 |
| `44677ff` | fix(unlim): correggi tono Principio Zero — parla ALLA CLASSE | ⚠️ parziale, NON allinea completamente a PZ v3 del tuo ultimo messaggio |
| *(staged)* | fix(unlim): Principio Zero v3 — UNLIM prepara contenuto, docente veicola | ⏳ in corso (questo commit) |

## 🎯 Principio Zero v3 (versione completa Andrea 18/04/2026)

> CHIUNQUE accendendo ELAB Tutor deve essere in grado, SENZA conoscenze pregresse, di spiegare ai ragazzi.
>
> - Il docente apre ELAB, sceglie la lezione
> - UNLIM prepara il contenuto in modo quasi invisibile — linguaggio 10-14 anni, basato su volumi + storia sessioni
> - Il contenuto è utile a tutta la classe — il docente lo proietta sulla LIM
> - I ragazzi vedono sulla LIM, lavorano sui kit fisici
> - Il docente non deve studiare, non deve interpretare — UNLIM ha già fatto il lavoro
> - UNLIM non si rivolge al docente con "fai questo". Produce contenuto nel linguaggio dei ragazzi che il docente veicola naturalmente.

## 🔍 Analisi honest BASE_PROMPT pre-v3 fix vs v3

| Aspetto | Pre-v3 (44677ff) | v3 corretto |
|---------|------------------|-------------|
| Framing iniziale | "Sei il tutor... Aiuti ragazzi" | **"Prepari contenuto... docente proietta"** |
| Ruolo UNLIM | Conversational (dialogo con studenti) | **Content generator (quasi invisibile)** |
| Docente | "Attiva/pausa UNLIM" | **"Non deve studiare ne' interpretare"** |
| Esperimenti | Nessuna menzione continuità | **"Narrativa continua capitolo, non card isolate"** |
| Storia classi | Non menzionata | **"Basato su storia sessioni precedenti"** |

**Ammissione onesta**: il commit 44677ff era allineato al tuo messaggio precedente ("UNLIM parla alla classe") MA non era allineato al Principio Zero v3 più completo ("UNLIM prepara contenuto quasi invisibile"). Ho proceduto troppo velocemente — il `f3798a9` che dichiarava "bug #2 RISOLTO 18/04" era prematuro.

## ✅ Fix v3 applicato adesso

File `supabase/functions/_shared/system-prompt.ts`:

1. **Linea 14** (primo paragrafo): cambiato da "Sei UNLIM, il tutor... Aiuti ragazzi..." a "Sei UNLIM, il generatore di contenuto didattico. Il tuo ruolo: PREPARI contenuto nel linguaggio 10-14 anni basandoti sui volumi ELAB e la storia delle sessioni. Il docente sceglie la lezione, tu prepari, il docente proietta sulla LIM. Il docente NON deve studiare ne' interpretare."

2. **Sezione PRINCIPIO ZERO** (linee 78-88): riscritta con il flusso v3:
   - 1. Docente sceglie lezione
   - 2. UNLIM prepara contenuto
   - 3. Docente proietta sulla LIM
   - 4. Ragazzi vedono + lavorano kit fisici

3. **Aggiunto paragrafo ESPERIMENTI NON SONO BLOCCHETTI STACCATI** che istruisce Gemini a mantenere continuità narrativa del capitolo.

**Commit pianificato**: `fix(unlim): Principio Zero v3 - UNLIM prepara contenuto, docente veicola naturalmente`

## 🧪 CoV Verifiche richieste

### Verifica 1 — Vitest baseline 3× (CoV rule)

**Scope**: dopo aver modificato `supabase/functions/_shared/system-prompt.ts` (file che NON è incluso nei test vitest che sono tutti frontend React/Vite), la baseline 12056 non deve regredire.

```
Run 1/3: [in corso background]
Run 2/3: [pending dopo 1]
Run 3/3: [pending dopo 2]
```

Gate: 3/3 devono dare ≥ 12056 test PASS, altrimenti revert.

### Verifica 2 — Build check

```
npm run build
```

Gate: success, bundle size ≤ 90000 KB.

### Verifica 3 — Deploy Supabase + test live Principio Zero v3

Dopo commit + push + deploy Supabase Edge Function:

```bash
curl -sS -X POST \
  "https://vxvqalmxqtezvgiboxyv.supabase.co/functions/v1/unlim-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ANON>" \
  -H "apikey: <ANON>" \
  -H "Origin: https://www.elabtutor.school" \
  --data @/tmp/test-principio-zero.json
```

Gate: risposta deve:
- Iniziare con "Ragazzi," (plurale inclusivo)
- Citare "Vol. 1 pagina 29"
- Contenere "470 Ohm" (parola libro)
- NON dire "Docente, leggi..."
- Stile contenuto-pronto (non meta-istruzione)

## 🚨 Audit esperimenti non fattibili (incompleto, da fare)

**Tuo feedback**: "alcune cose tipo il robot non sono oggettivamente fattibili... inventare altro"

Scansione preliminare `src/data/experiments-vol3.js`:
- `v3-extra-servo-sweep` linea 4946: servomotore SG90 — **fattibile se kit include servo** (da verificare)
- Altri esperimenti "robot" — **audit completo da fare**

**Task pending** (non faccio ora, documento per sessione successiva):
- Sessione audit dedicata: leggo 92 esperimenti totali, verifico fattibilità con kit fisico ELAB (filiera Omaric)
- Output: `docs/audits/2026-04-XX-esperimenti-fattibilita.md` con lista rosso/giallo/verde
- Per ogni rosso: proposta alternativa fattibile

**Reason non faccio ora**: serve confronto con Giovanni Fagherazzi / Omaric per sapere cosa effettivamente il kit contiene. Non posso decidere da solo quali esperimenti sono fattibili.

## 📋 TODO post-CoV

- [x] Fix BASE_PROMPT Principio Zero v3 applicato
- [ ] Vitest 3× PASS (in corso)
- [ ] Build check
- [ ] Commit fix v3
- [ ] Deploy Supabase Edge Function
- [ ] Test live verifica tono "prepara contenuto"
- [ ] Push origin
- [ ] Audit esperimenti fattibili (sessione dedicata con Andrea + Omaric)
- [ ] Aggiornare CLAUDE.md bug #2 — da "RISOLTO" a "RISOLTO v3 (verificato live)"

## 🎓 Lezione onesta

**Cosa ho sbagliato oggi**:
1. Commit 44677ff — corretto rispetto al feedback immediato ma NON completo rispetto al Principio Zero v3 che tu hai poi precisato.
2. Commit f3798a9 — ho dichiarato "RISOLTO" prematuramente. Una dichiarazione "RISOLTO" richiede PZ v3 completo + audit esperimenti + CoV live.
3. Ho iniziato a scrivere PDR (GOVERNANCE.md, PDR3 VPS) **prima di chiudere il loop Principio Zero**. Avrei dovuto prima assicurare PZ v3 = OK, poi scrivere PDR che dipendono da PZ corretto.

**Cosa cambio subito**:
- Pattern: ogni fix produzione → CoV 3× + test live + audit report PRIMA di dichiarare "done"
- Non procedere con PDR nuovi finche' PZ v3 non è verificato live (Telegram/curl)

---

**Firma**: Claude Opus 4.7 (via Max #1), 18/04/2026 sera
**Andrea approvazione richiesta**: leggere questo report + verificare Principio Zero v3 è allineato al tuo intento
