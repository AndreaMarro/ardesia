# ORDER R003 — Fix GDPR: parent_email in chiaro in localStorage

**ID**: R003
**Priorità**: P2
**Effort stimato**: 30-60 min
**Creato**: 2026-04-06
**Fonte**: RESEARCH-GDPR-YAML-CURRICULUM-2026-04-06.md

---

## Problema

In `src/services/gdprService.js`, la funzione `requestParentalConsent()` salva l'email del genitore in chiaro in `localStorage`:

```javascript
// gdprService.js ~line 328-332
saveConsent({
    status: 'parental_sent',
    childAge: data.childAge,
    parentEmail: data.parentEmail,  // ← EMAIL IN CHIARO in localStorage
    sentAt: new Date().toISOString(),
});
```

Questo viola GDPR Art. 5(1)(f) che richiede appropriate misure di sicurezza per i dati personali.

---

## Fix Richiesto

**File da modificare**: `src/services/gdprService.js`

### Opzione preferita: Salva solo email mascherata

```javascript
// Aggiungi helper (già presente in ConsentBanner.jsx — riusa la logica)
function maskEmail(email) {
    return email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) =>
        a + '*'.repeat(Math.min(b.length, 5)) + c
    );
}

// In requestParentalConsent():
saveConsent({
    status: 'parental_sent',
    childAge: data.childAge,
    parentEmailMasked: maskEmail(data.parentEmail),  // ← solo masked
    sentAt: new Date().toISOString(),
});
```

### Controlla anche

1. `ConsentBanner.jsx` — verifica che `parentEmail` letto da localStorage sia usato solo per display (già mascherato) e non per operazioni sensibili
2. `getConsentStatus()` — se legge `parentEmail` da localStorage, aggiornare il field name a `parentEmailMasked`

---

## Test da Eseguire

1. Flow completo ConsentBanner: inserisci email → submit → apri DevTools → localStorage → verifica che NON ci sia l'email in chiaro
2. `npm test -- --run` — nessun test rotto

---

## File Critici

- `src/services/gdprService.js` — modifica principale
- `src/components/common/ConsentBanner.jsx` — adatta se legge `parentEmail` da localStorage

---

## Criteri di Successo

- `localStorage` non contiene più l'email in chiaro del genitore
- I test passano
- Il ConsentBanner mostra ancora l'email mascherata nella UI (funzionalità invariata)
