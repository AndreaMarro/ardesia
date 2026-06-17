# ELAB — Lista Fondamentali Mancanti (Session 46)
> Livello: **ottimo lavoro in fase di sviluppo** — cose che servono per passare a prodotto finito.

---

### FONDAMENTALE MANCANTE #1
- **Cosa**: Accessibilità WCAG 2.1 AA — mancano `aria-live` regions, focus management, screen reader testing
- **Perché è fondamentale**: Scuole pubbliche italiane sono obbligate per legge (L. 4/2004 "Stanca") a usare software accessibile. Senza WCAG AA, le scuole NON possono adottare ELAB ufficialmente
- **Effort**: 8-12 ore (audit axe-core + fix focus traps + aria-live su simulatore + test NVDA/VoiceOver)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #2
- **Cosa**: Performance audit — nessun LCP/FID/CLS misurato, ElabTutorV4 chunk 3.5MB
- **Perché è fondamentale**: Scuole hanno connessioni lente (2-5 Mbps condivisi). 3.5MB di JS = 5-14 secondi di caricamento. Google penalizza Core Web Vitals scarsi nel ranking
- **Effort**: 6-8 ore (Lighthouse audit + lazy split ElabTutorV4 + preload critical path + image optimization)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #3
- **Cosa**: SEO su sito pubblico — nessun sitemap.xml, robots.txt generico, meta descriptions mancanti su 8/24 pagine, nessun schema.org markup
- **Perché è fondamentale**: "ELAB elettronica ragazzi" su Google restituisce 0 risultati ELAB. Senza SEO, il sito è invisibile ai genitori che cercano kit educativi
- **Effort**: 4-6 ore (sitemap.xml + robots.txt + meta descriptions + schema.org EducationalOrganization + Product)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #4
- **Cosa**: Analytics — nessun Google Analytics / Plausible / Matomo installato
- **Perché è fondamentale**: Zero dati su: quanti visitatori, da dove arrivano, dove abbandonano, quali esperimenti sono più usati. Senza dati, ogni decisione di prodotto è un tiro al buio
- **Effort**: 2 ore (Plausible script tag su tutte le pagine + dashboard eventi custom per simulatore)
- **Priorità**: P0

### FONDAMENTALE MANCANTE #5
- **Cosa**: Onboarding primo uso — nessun tutorial interattivo, nessun walkthrough per docenti
- **Perché è fondamentale**: Un docente che apre ELAB Tutor per la prima volta vede 15+ bottoni senza spiegazione. Se non capisce in 30 secondi, chiude e non torna. Il setup wizard in TeacherDashboard esiste ma è incompleto
- **Effort**: 6-8 ore (react-joyride o custom step-by-step per: primo login, primo esperimento, prima simulazione, primo quiz)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #6
- **Cosa**: Error handling utente — errori API mostrati come alert() raw o console.error silenti
- **Perché è fondamentale**: Quando Notion API va in 503, lo studente vede "Errore" senza contesto. Serve un toast system con messaggi human-friendly e retry automatico
- **Effort**: 4-6 ore (toast component + error boundary wrapper + retry logic su API calls + offline detection)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #7
- **Cosa**: Offline capability (PWA) — il simulatore non funziona senza connessione
- **Perché è fondamentale**: Laboratori scolastici hanno WiFi instabile. Se la rete cade durante una lezione, 25 studenti bloccati. Il simulatore è 100% client-side e POTREBBE funzionare offline
- **Effort**: 8-12 ore (service worker + cache manifest + offline mode flag + sync quando torna online)
- **Priorità**: P2

### FONDAMENTALE MANCANTE #8
- **Cosa**: Data export per docenti — nessun modo di esportare progressi studenti in CSV/PDF
- **Perché è fondamentale**: I docenti devono rendicontare le attività al dirigente scolastico. Senza export, devono copiare manualmente da schermo. Questo è un deal-breaker per l'adozione scolastica
- **Effort**: 4-6 ore (CSV export da TeacherDashboard + PDF report con @react-pdf già installato)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #9
- **Cosa**: Documentazione docenti — nessuna guida d'uso, FAQ, video tutorial
- **Perché è fondamentale**: Senza documentazione, ogni docente che adotta ELAB genera supporto 1:1 via email. Non scala. Una guida PDF + 3 video tutorial coprono il 90% delle domande
- **Effort**: 6-8 ore (guida Notion/PDF 10 pagine + 3 video screencast da 3 min ciascuno)
- **Priorità**: P1

### FONDAMENTALE MANCANTE #10
- **Cosa**: Feedback loop — nessun modo per studenti/docenti di segnalare bug o suggerire miglioramenti dall'app
- **Perché è fondamentale**: I bug vengono scoperti in classe ma non arrivano allo sviluppatore. Un bottone "Segnala problema" con screenshot automatico + contesto esperimento è il minimo
- **Effort**: 3-4 ore (bottone feedback nel simulatore + form modale + invio a Notion DB o email)
- **Priorità**: P2

### FONDAMENTALE MANCANTE #11
- **Cosa**: E2E Test Suite — zero test automatizzati, tutto verificato manualmente
- **Perché è fondamentale**: Ogni deploy rischia regressioni. Session 43 ha rotto ShowcasePage con l'obfuscamento. Con Playwright, 10 test critici impediscono il 90% delle regressioni
- **Effort**: 8-12 ore (Playwright setup + 10 test: login, carica esperimento, simula circuito, quiz, chat, mobile)
- **Priorità**: P2

### FONDAMENTALE MANCANTE #12
- **Cosa**: Notion STUDENT_TRACKING DB non configurato — teacher-student features disabilitate
- **Perché è fondamentale**: Tutta l'area docente (progressi studenti, assegnazioni, valutazioni) è morta. Il codice c'è ma il backend è scollegato
- **Effort**: 1-2 ore (condividere DB Notion con integration + verificare endpoints)
- **Priorità**: P0

---

## RIEPILOGO PER PRIORITÀ

| Priorità | # | Items |
|----------|---|-------|
| **P0** | 2 | Analytics (#4), STUDENT_TRACKING DB (#12) |
| **P1** | 7 | WCAG (#1), Performance (#2), SEO (#3), Onboarding (#5), Error handling (#6), Data export (#8), Docs docenti (#9) |
| **P2** | 3 | PWA Offline (#7), Feedback loop (#10), E2E Tests (#11) |

**Effort totale stimato**: ~65-90 ore (7-10 sessioni full)

---
*Generato: 25 Febbraio 2026 — Session 46*
