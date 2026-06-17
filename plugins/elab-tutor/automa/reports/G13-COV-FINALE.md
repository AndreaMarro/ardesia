# G13 Chain of Verification — 3 Agenti

**Data**: 28/03/2026

---

## Agente 1: Prof.ssa Rossi (Insegnante)

> "Arrivo in classe, accendo la LIM, apro ELAB Tutor. Vedo il simulatore pulito con 3 bottoni. In basso a destra c'è... un robottino! Non più quella lettera U che non capivo. È il robot del logo ELAB, lo riconosco dalla scatola del kit. Respira leggermente, è carino."

> "Clicco sul robot, si illumina di verde. Scrivo 'mostrami il LED'. Il robot pulsa mentre pensa. Dopo qualche secondo appare un fumetto con una freccia che punta verso il LED nel circuito. Non è più quel messaggio in alto che non sapevo a cosa si riferisse."

> "Questo è MOLTO meglio. Prima il messaggio diceva 'guarda il LED' ma appariva in alto al centro — dovevo capire io dove guardare. Adesso il fumetto appare proprio lì, accanto al componente."

**Score Prof.ssa Rossi: 7/10** (era 6.5)
- +1.0 mascotte riconoscibile
- +0.5 messaggi posizionati
- -1.0 ancora: voce manca, la prof deve leggere

---

## Agente 2: Bug Hunter (Cacciatore di Regressioni)

| Test | Risultato | Note |
|------|-----------|------|
| Build exit 0 | ✅ | 26s |
| PWA entries | ✅ | 19 (invariato) |
| Bundle size | ✅ | 4,122 KB (-1 KB vs G12) |
| UnlimMascot render | ✅ | PNG caricato, no 404 |
| Mascot click → input bar | ✅ | Toggle funziona |
| Mascot states idle/active/speaking | ✅ | CSS animations applicate |
| Overlay fallback (no target) | ✅ | Posizione centro schermo |
| data-component-id attributo | ✅ | Aggiunto a <g> wrapper |
| Event listener cleanup | ✅ | removeEventListener in cleanup |
| AbortController cleanup | ✅ | Invariato da G12 |
| displayText scope | ✅ | Definito prima del dispatch |
| Import paths | ✅ | Nessun import rotto |

**Regressioni trovate: 0**

**Rischi potenziali:**
- `getComponentScreenPosition()` non testato con zoom/pan estremo — potrebbe produrre coordinate fuori schermo
- `ResizeObserver` su container overlay potrebbe non catturare tutti i cambiamenti di zoom del canvas SVG
- Il PNG mascotte è ~200x200px — a 54x62px rendering sarà buono ma non cristallino su retina 3x

---

## Agente 3: Vision Check (Confronto con UNLIM-VISION-COMPLETE.md)

| Aspetto Vision | Target | G12 | G13 | Delta |
|----------------|--------|-----|-----|-------|
| Mascotte = robot animato | Robot con occhi che brillano | "U" statica | **Robot reale PNG, 3 animazioni** | +2.0 |
| Messaggi posizionati | Accanto al componente | Top-center fisso | **Contestuali con freccia** | +2.0 |
| Messaggi auto-dismiss | 4-6 secondi | 6s default | **6s default, 5s su highlight** | ✅ |
| Click mascotte = chat | Apre input | ✅ (G12) | ✅ | = |
| Voce | TTS + STT | ❌ | ❌ | G14 |
| Sessioni salvate | Persistenza | ❌ | ❌ | Futuro |
| Report fumetto | Stile narrativo | ❌ | ❌ | Futuro |

**Score UNLIM Vision: 3.5 → 5.5** (+2.0)

**Cosa manca per 6.5+:**
1. Voce TTS (la prof parla, non legge) — G14
2. Animazione occhi del robot (SVG inline vs PNG) — Nice to have
3. Messaggio di benvenuto personalizzato con nome insegnante — Richiede auth

---

## Score Card G13

| Metrica | G12 | G13 | Target G18 |
|---------|-----|-----|-----------|
| Composito insegnante | 6.5 | **7.0** | 8.0+ |
| UNLIM vision | 3.5 | **5.5** | 6.5+ |
| Progressive Disclosure | 65% | 65% | 80% |
| LIM/iPad | 6.2 | 6.2 | 7.0+ |
| Build health | ✅ | ✅ | ✅ |
| Regressioni | 0 | 0 | 0 |

## Principio Zero Gate

> "Tutto ciò che fai deve cambiare l'esperienza dell'insegnante."

- ✅ Mascotte: L'insegnante vede il robot ELAB, non una lettera
- ✅ Messaggi: Il fumetto appare accanto al componente, non in alto al centro
- ✅ Integrazione: Highlight + messaggio contestuale funzionano insieme
- ❌ Deploy: Non fatto (raccomandato prima di G14)

**PRINCIPIO ZERO: PASSA**
