# Google Classroom Integration — Guida Tecnica per ELAB

> Research Report — ELAB Researcher Agent — 09/04/2026 17:25
> Topic: Come integrare ELAB con Google Classroom (gap competitivo #1)

---

## 1. Perche' Google Classroom

Dalla competitive analysis (report #16): TUTTI i competitor principali (TinkerCAD, Arduino Cloud) hanno Google Classroom integration. ELAB no. Nelle scuole italiane, Google Workspace for Education e' dominante. Senza integrazione, il docente deve gestire studenti in 2 sistemi separati.

---

## 2. Le 3 Opzioni di Integrazione

### Opzione A: Share to Classroom Button (FACILE — raccomandata per MVP)

**Cos'e'**: Un bottone nel sito ELAB che condivide un link direttamente in Google Classroom come assignment.
**Effort**: 2-4 ore.
**Come funziona**:
1. Includere lo script JS di Google
2. Aggiungere un bottone "Condividi su Google Classroom" nell'interfaccia docente
3. Il docente clicca → si apre popup → sceglie classe → assignment creato con link ELAB

**Pro**: Nessuna OAuth, nessun marketplace submission, nessun review. Funziona subito.
**Contro**: Unidirezionale (ELAB→Classroom). Non legge dati da Classroom. No grading sync.

**Implementazione**:
```html
<script src="https://apis.google.com/js/platform.js" async defer></script>
<div class="g-sharetoclassroom"
     data-size="32"
     data-url="https://www.elabtutor.school/#/experiment/v1-cap6-esp1"
     data-title="ELAB: Accendi il tuo primo LED"
     data-body="Esperimento di elettronica con simulatore Arduino">
</div>
```

Fonte: [Google Classroom Share Button](https://developers.google.com/classroom/tutorials/assignment-workflows)

### Opzione B: Classroom API (MEDIO — per sync bidirezionale)

**Cos'e'**: Integrazione REST API per leggere classi, creare assignment, sincronizzare voti.
**Effort**: 2-4 settimane.
**Requisiti**:
- Google Cloud Project con Classroom API abilitata
- OAuth 2.0 consent screen (sensitive scopes → richiede verifica 3-5 giorni)
- Scopes necessari: `classroom.courses.readonly`, `classroom.coursework`, `classroom.rosters.readonly`

**Funzionalita'**:
- Importare lista studenti da Google Classroom
- Creare assignment con link ELAB
- Sincronizzare voti/progressi → Google Classroom gradebook
- SSO via Google (login con account scolastico)

**Pro**: Bidirezionale. Il docente gestisce tutto da Google Classroom.
**Contro**: Richiede OAuth verification, richiede privacy review, 2-4 settimane di sviluppo.

Fonte: [Classroom API Overview](https://developers.google.com/classroom), [Auth Scopes](https://developers.google.com/workspace/classroom/guides/auth)

### Opzione C: Classroom Add-on (DIFFICILE — per integrazione nativa)

**Cos'e'**: ELAB appare come app nativa dentro Google Classroom, in un iframe.
**Effort**: 4-8 settimane.
**Requisiti**:
- Tutto dell'Opzione B +
- 5 iframe types (Discovery, Teacher View, Student View, etc.)
- Google Workspace Marketplace submission e review
- OAuth verified + Trust & Safety review
- **SOLO per scuole con Teaching and Learning Upgrade o Education Plus** (tier a pagamento)

**Funzionalita'**:
- ELAB appare come "attachment" negli assignment
- Studenti aprono ELAB senza uscire da Classroom
- Voti sincronizzati automaticamente

**Pro**: Esperienza nativa, il massimo dell'integrazione.
**Contro**: 4-8 settimane, marketplace review, limitato ai tier a pagamento di Google.

Fonte: [Add-on Requirements](https://developers.google.com/workspace/classroom/add-ons/requirements), [iframe Details](https://developers.google.com/workspace/classroom/add-ons/developer-guides/iframes), [Review Process](https://developers.google.com/workspace/classroom/add-ons/developer-guides/review-process-overview)

---

## 3. LTI NON e' un'opzione

Google Classroom **NON supporta LTI** (nessuna versione: 1.1, 1.3, Advantage). Questo e' confermato da Edlink e dalla documentazione ufficiale. Se ELAB volesse supportare LTI per altri LMS (Moodle, Canvas, Blackboard), servirebbe un'integrazione separata.

Fonte: [Edlink: Google Classroom LTI](https://ed.link/community/does-google-support-lti-1-3-lti-advantage/), [API vs LTI](https://ed.link/community/api-vs-lti-for-google-classroom/)

---

## 4. Alternativa: Edlink Unified API

Se ELAB vuole integrare non solo Google Classroom ma anche Clever, Schoology, Canvas, etc., esiste **Edlink** — una unified API che astrae le differenze tra LMS. Un'unica integrazione copre 10+ piattaforme.

**Pro**: Un'integrazione = tutti gli LMS. SSO, roster sync, grading sync.
**Contro**: Costo aggiuntivo (Edlink pricing non pubblico). Dependency esterna.

Fonte: [Edlink Unified API](https://ed.link/community/should-i-integrate-with-the-google-classroom-api-or-the-edlink-unified-api/)

---

## 5. Raccomandazione per ELAB

### Fase 1 (SUBITO — 2-4 ore): Share to Classroom Button
- Aggiungere bottone "Condividi su Google Classroom" nella dashboard docente
- Zero OAuth, zero review, funziona subito
- Il docente puo' assegnare esperimenti ELAB come compiti in Classroom
- **Questo da solo elimina il gap competitivo piu' visibile**

### Fase 2 (Maggio 2026 — 2-4 settimane): Classroom API
- Google SSO (login con account scolastico Google)
- Import roster (lista studenti) da Classroom
- Sync voti progressi → gradebook
- Richiede: Google Cloud Project + OAuth verification

### Fase 3 (Settembre 2026 — 4-8 settimane): Classroom Add-on
- Solo se le vendite lo giustificano
- Richiede marketplace submission + review
- Limitato ai tier a pagamento

---

## 6. Action Items Concreti

### Immediati (1 giorno)
1. Creare Google Cloud Project per ELAB
2. Abilitare Classroom API
3. Implementare Share to Classroom button (2-4h)
4. Testare con account Google Workspace for Education

### Entro Maggio
5. OAuth consent screen + verification
6. SSO Google per login docenti/studenti
7. Import roster API
8. Grading sync (progressi ELAB → Classroom gradebook)
