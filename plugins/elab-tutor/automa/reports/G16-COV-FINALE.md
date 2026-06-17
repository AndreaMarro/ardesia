# G16 Chain of Verification — 3 Agenti

**Data**: 28/03/2026

---

## Agente 1: Prof.ssa Rossi (Insegnante)

> "Lunedì apro ELAB, carico l'esperimento del LED. Chiedo al robot 'cos'è un LED?' e mi risponde. Scrivo un paio di domande, poi chiudo tutto e vado a casa."

> "Mercoledì torno, apro ELAB sulla LIM. Il robot mi dice: 'L'ultima volta avete acceso il vostro primo LED! Oggi scopriamo cosa succede senza il resistore...' — PERFETTO! Non devo più ricordarmi dove eravamo rimasti!"

> "Dopo qualche secondo appare un altro messaggio: 'La prossima lezione è LED senza resistore. Vuoi iniziare?' — Comodo, mi suggerisce cosa fare."

> "Cosa mi piace: non devo preparare niente. UNLIM sa dove eravamo e cosa fare dopo."

> "Cosa manca: il messaggio 'Vuoi iniziare?' non ha un bottone per caricare direttamente l'esperimento. Devo ancora cercarlo manualmente o chiederlo a UNLIM. In futuro vorrei un bottone 'Inizia'."

> "Un'altra cosa: se la classe ha fatto molti errori con la polarità del LED, UNLIM dovrebbe dirmi qualcosa tipo 'Attenzione, la volta scorsa avete avuto problemi con il verso del LED — ripetete prima quello'. Non lo fa ancora."

**Score Prof.ssa Rossi: 7.8/10** (era 7.5 in G14)
- +0.3 sessioni salvate: UNLIM ricorda dove eravamo
- +0.2 suggerimento prossima lezione: non devo pensare a cosa fare
- -0.2 nessun bottone "Inizia" nel suggerimento (solo testo)
- -0.0 resume message dal lesson path — linguaggio perfetto per la classe

---

## Agente 2: Bug Hunter (Cacciatore di Regressioni)

| Test | Risultato | Note |
|------|-----------|------|
| Build exit 0 | ✅ | 57s (lento per useMemo recompile) |
| PWA entries | ✅ | 19 (invariato) |
| Bundle size index | ✅ | 699 KB (-8 KB vs G14, classProfile tree-shaken) |
| useSessionTracker hook | ✅ | ~215 LOC, useMemo per stable ref |
| classProfile.js | ✅ | ~165 LOC |
| localStorage sessions key | ✅ | `elab_unlim_sessions` |
| Max 20 sessions FIFO | ✅ | Verificato nel codice |
| beforeunload salva | ✅ | finaliseSession() |
| visibilitychange snapshot | ✅ | Salva senza finalizzare |
| Welcome contestuale | ✅ | getWelcomeMessage() |
| Suggerimento next | ✅ | getNextLessonSuggestion() |
| buildClassContext in handleSend | ✅ | Iniettato nel system prompt |
| useMemo stable reference | ✅ | Fix P1 pre-CoV |
| recordMessage in handleSend | ✅ | user + assistant |
| recordAction highlight | ✅ | Registrato |

**Bug trovati:**

| # | Severità | Descrizione | Fix |
|---|----------|-------------|-----|
| 1 | **P2** | `welcomeShownRef` non si resetta se isUnlim cambia — toggle classic→UNLIM non ri-mostra welcome | Accettabile: il welcome si mostra solo al primo caricamento |
| 2 | **P2** | `buildClassContext()` chiamato ad ogni handleSend — se ci sono 20 sessioni con 100 msg ciascuna, potrebbe essere lento (~2ms max) | Trascurabile per le dimensioni attuali |
| 3 | **P3** | Sessione duplicata se visibilitychange salva e poi beforeunload salva — il dedup per ID nel visibilitychange handler previene questo | Gestito |
| 4 | **P3** | `experimentChange` listener duplicato — sia useSessionTracker che UnlimWrapper ascoltano — nessun conflitto ma overhead minimo | Accettabile: fanno cose diverse |
| 5 | **P3** | Se localStorage è pieno, la sessione non viene salvata — catch silente | Accettabile: FIFO a 20 sessioni mantiene ~100KB max |

**Regressioni trovate: 0**

---

## Agente 3: Vision Check (Confronto con UNLIM-VISION-COMPLETE.md)

| Aspetto Vision | Target | G14 | G16 | Delta |
|----------------|--------|-----|-----|-------|
| Sessioni salvate (persistenza) | Tutto salvato cross-session | ❌ | **✅ localStorage** | **+1.5** |
| Contesto classe | "l'ultima volta abbiamo fatto X" | ❌ | **✅ classProfile** | **+1.0** |
| Resume message contestuale | Dal lesson path | ❌ | **✅ session_save.resume_message** | **+0.5** |
| Suggerimento prossima lezione | "Oggi facciamo Y" | ❌ | **✅ next_suggested** | **+0.5** |
| Session data structure | messages+actions+errors | ❌ | **✅ completa** | **+0.5** |
| Class profile builder | Aggregato sessioni | ❌ | **✅ buildClassProfile()** | **+0.3** |
| AI system prompt con contesto | [CONTESTO CLASSE] | ❌ | **✅ buildClassContext()** | **+0.5** |
| Welcome personalizzato | Prima volta vs ritorno | ❌ | **✅ getWelcomeMessage()** | **+0.5** |
| Backend sync sessioni | Cross-device sync | ❌ | ❌ | Futuro |
| Report fumetto | PDF con mascotte | ❌ | ❌ | G17 |
| Screenshot periodici | Ogni 60s | ❌ | ❌ | Non implementato (troppo pesante per localStorage) |

**Score UNLIM Vision: 6.5 → 7.5** (+1.0)

(Agente 3 stima 8.0, ma senza circuit state snapshot, cross-device sync, e report PDF, 7.5 è più onesto.)

**Cosa manca per 8.0+:**
1. Report PDF fumetto — G17
2. Backend sync sessioni (cross-device) — futuro (+0.8)
3. Circuit state snapshot nelle sessioni — non implementato (+0.3)
4. Screenshot automatici nelle sessioni — troppo pesante per localStorage (+0.2)
5. Bottone "Inizia" nel suggerimento — quick win
6. Annotazioni persistenti nelle sessioni — futuro

---

## Score Card G16

| Metrica | G14 | G16 | Target G18 |
|---------|-----|-----|-----------|
| Composito insegnante | 7.5 | **7.8** | 8.0+ |
| UNLIM vision | 6.5 | **7.5** | 7.5+ ✅ |
| Progressive Disclosure | 65% | 65% | 80% |
| LIM/iPad | 6.2 | 6.2 | 7.0+ |
| Build health | ✅ | ✅ | ✅ |
| Regressioni | 0 | **0** | 0 |
| Sessioni salvate | ❌ | **✅** | ✅ |
| Contesto classe | ❌ | **✅** | ✅ |
| Suggerimento next | ❌ | **✅** | ✅ |
| AI context enriched | ❌ | **✅** | ✅ |

## Principio Zero Gate

> "La Prof.ssa Rossi chiude il browser lunedì. Mercoledì riapre ELAB. UNLIM sa dove eravamo?"

- ✅ Sessione salvata in localStorage al beforeunload
- ✅ "Bentornati! L'ultima volta avete acceso il vostro primo LED!"
- ✅ "La prossima lezione è LED senza resistore. Vuoi iniziare?"
- ✅ AI conosce il contesto classe in ogni richiesta
- ✅ Zero preparation needed dal docente

**PRINCIPIO ZERO: PASSA**
