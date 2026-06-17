# ELAB Tutor - Security Checklist
## Pre-Production Security Validation

**Data:** 15/02/2026  
**Versione:** 1.0  
**Status:** 🔴 DA COMPLETARE

---

## 📋 Istruzioni

1. Verificare ogni item prima del deploy in produzione
2. Se contrassegnato come [CRITICAL], il deploy è bloccato fino a risoluzione
3. Documentare eventuali eccezioni con giustificazione
4. Firmare alla fine della checklist

---

## 🔐 AUTENTICAZIONE E AUTORIZZAZIONE

### JWT Implementation
- [ ] [CRITICAL] Access token scadenza ≤ 15 minuti
- [ ] [CRITICAL] Refresh token in httpOnly cookie (non JS-accessible)
- [ ] [CRITICAL] JWT secret memorizzato solo server-side
- [ ] [CRITICAL] Algoritmo RS256 (non HS256)
- [ ] [HIGH] Token rotation implementato
- [ ] [HIGH] Blacklist token al logout
- [ ] [MEDIUM] Secure storage su client (sessionStorage, non localStorage per token)

### Password Security
- [ ] [CRITICAL] Hash bcrypt server-side (cost factor ≥ 12)
- [ ] [CRITICAL] Nessuna password in plaintext nel codice
- [ ] [CRITICAL] Nessuna password in localStorage/sessionStorage
- [ ] [HIGH] Password policy: min 8 char, 1 maiuscola, 1 numero, 1 speciale
- [ ] [HIGH] Rate limiting: max 5 tentativi / 15 minuti
- [ ] [MEDIUM] Account lockout dopo 10 tentativi falliti
- [ ] [MEDIUM] Password reset con token sicuro (scadenza 1 ora)

### Session Management
- [ ] [CRITICAL] Session timeout inattiva (30 minuti)
- [ ] [HIGH] Regenerazione session ID dopo login
- [ ] [HIGH] Invalidazione session lato server al logout
- [ ] [MEDIUM] Notifica email su login da nuovo dispositivo

---

## 🛡️ CIFRATURA E PROTEZIONE DATI

### Dati Sensibili
- [ ] [CRITICAL] confusioneLog cifrato con AES-256-GCM
- [ ] [CRITICAL] Chiave derivata con PBKDF2 (≥ 100k iterazioni)
- [ ] [CRITICAL] IV e salt random per ogni encryption
- [ ] [CRITICAL] Dati in transit su HTTPS (TLS 1.3)
- [ ] [HIGH] Certificate pinning (opzionale ma consigliato)
- [ ] [HIGH] No dati sensibili in URL (query params)
- [ ] [MEDIUM] Secure backup con cifratura a riposo

### LocalStorage Security
- [ ] [HIGH] Solo dati non sensibili in localStorage
- [ ] [HIGH] Dati sensibili solo cifrati
- [ ] [MEDIUM] Prefisso namespace per evitare collisioni
- [ ] [LOW] Pulizia dati al logout

---

## 🧒 GDPR-K E COPPA COMPLIANCE

### Verifica Età
- [ ] [CRITICAL] Verifica età prima della registrazione
- [ ] [CRITICAL] <16 anni: richiesto consenso parentale
- [ ] [CRITICAL] <13 anni: consenso COPPA verificato
- [ ] [HIGH] Blocco registrazione <8 anni
- [ ] [HIGH] Solo mese/anno nascita (no giorno specifico)

### Consenso Parentale
- [ ] [CRITICAL] Email al genitore con link conferma
- [ ] [CRITICAL] Checkbox "Sono il genitore/tutore legale"
- [ ] [CRITICAL] Documentazione consenso conservata
- [ ] [HIGH] Link scadenza 7 giorni
- [ ] [HIGH] Possibilità revoca consenso
- [ ] [MEDIUM] Area genitori per gestione consenso

### Diritto all'Oblio (Art. 17)
- [ ] [CRITICAL] Bottone "Elimina tutti i miei dati"
- [ ] [CRITICAL] Cancellazione completa localStorage
- [ ] [CRITICAL] Chiamata API per cancellazione server
- [ ] [HIGH] Email conferma eliminazione
- [ ] [HIGH] Multi-step confirmation (type "ELIMINA")
- [ ] [MEDIUM] Audit log cancellazione

### Diritti Utente
- [ ] [HIGH] Accesso ai dati (Art. 15)
- [ ] [HIGH] Rettifica dati (Art. 16)
- [ ] [HIGH] Portabilità dati (Art. 20) - formato JSON
- [ ] [MEDIUM] Limitazione trattamento (Art. 18)
- [ ] [MEDIUM] Opposizione (Art. 21)

### Privacy by Design
- [ ] [HIGH] Data minimization - solo dati necessari
- [ ] [HIGH] Pseudonimizzazione ID utente
- [ ] [HIGH] No fingerprinting invasivo
- [ ] [MEDIUM] Retention policy: max 2 anni inattività
- [ ] [MEDIUM] Anonimizzazione analytics

---

## 🌐 WEB SECURITY

### XSS Prevention
- [ ] [CRITICAL] Sanitizzazione input con DOMPurify
- [ ] [CRITICAL] No innerHTML con dati utente
- [ ] [CRITICAL] Content Security Policy (CSP) header
- [ ] [HIGH] Output encoding per React
- [ ] [MEDIUM] HttpOnly cookie dove possibile

### CSRF Protection
- [ ] [CRITICAL] CSRF token su form e API state-changing
- [ ] [CRITICAL] SameSite cookie attribute (Strict o Lax)
- [ ] [HIGH] Verifica Origin/Referer header

### Injection Prevention
- [ ] [CRITICAL] No eval() o Function() con input utente
- [ ] [CRITICAL] Parameterized queries (se DB)
- [ ] [HIGH] Validazione tipo input
- [ ] [MEDIUM] Whitelist caratteri permessi

### Clickjacking
- [ ] [CRITICAL] X-Frame-Options: DENY o SAMEORIGIN
- [ ] [HIGH] CSP frame-ancestors directive

### Security Headers
- [ ] [CRITICAL] Strict-Transport-Security (HSTS)
- [ ] [CRITICAL] X-Content-Type-Options: nosniff
- [ ] [HIGH] Referrer-Policy: strict-origin-when-cross-origin
- [ ] [MEDIUM] Permissions-Policy per features

---

## 🔍 MONITORAGGIO E LOGGING

### Audit Trail
- [ ] [HIGH] Log accessi admin
- [ ] [HIGH] Log modifiche dati utente
- [ ] [HIGH] Log tentativi autenticazione falliti
- [ ] [MEDIUM] Log esportazione dati
- [ ] [MEDIUM] Log eliminazione dati
- [ ] [LOW] Retention log: 90 giorni

### Monitoring
- [ ] [MEDIUM] Alert su anomalie accesso
- [ ] [MEDIUM] Rate limiting alert
- [ ] [MEDIUM] Failed login alert

---

## 🧪 TESTING E VALIDAZIONE

### Test di Sicurezza
- [ ] [CRITICAL] Security audit script eseguito (`node scripts/security-audit.js`)
- [ ] [CRITICAL] Nessuna issue CRITICAL rilevata
- [ ] [HIGH] Penetration testing base completato
- [ ] [HIGH] Test XSS automatizzati
- [ ] [MEDIUM] Test rate limiting
- [ ] [MEDIUM] Test session management

### Test Compliance
- [ ] [HIGH] Test flusso consenso parentale
- [ ] [HIGH] Test verifica età
- [ ] [HIGH] Test diritto all'oblio
- [ ] [MEDIUM] Test esportazione dati

---

## 📧 CONFIGURAZIONE EMAIL

### SMTP Setup
- [ ] [CRITICAL] Provider email configurato (SendGrid/Mailgun)
- [ ] [CRITICAL] DKIM e SPF configurati
- [ ] [HIGH] Email da dominio verificato
- [ ] [HIGH] Template email testati
- [ ] [MEDIUM] Rate limiting invio email

### Template Email
- [ ] [CRITICAL] Template consenso parentale
- [ ] [CRITICAL] Template conferma consenso
- [ ] [CRITICAL] Template eliminazione dati
- [ ] [HIGH] Template export dati pronto

---

## 🚀 DEPLOYMENT

### Environment Variables
- [ ] [CRITICAL] VITE_N8N_AUTH_URL configurato
- [ ] [CRITICAL] VITE_N8N_GDPR_URL configurato
- [ ] [CRITICAL] VITE_SENDGRID_API_KEY o VITE_MAILGUN_API_KEY
- [ ] [HIGH] Nessun secret in repository
- [ ] [HIGH] .env in .gitignore

### Build
- [ ] [CRITICAL] Build produzione senza errori
- [ ] [HIGH] Minification e obfuscation
- [ ] [HIGH] Source maps rimosse (opzionale)
- [ ] [MEDIUM] Bundle size ottimizzato

### Infrastruttura
- [ ] [CRITICAL] HTTPS obbligatorio
- [ ] [HIGH] Redirect HTTP → HTTPS
- [ ] [HIGH] Security headers configurati su Vercel/vercel.json
- [ ] [MEDIUM] CDN con security features

---

## 📋 DOCUMENTAZIONE

### Legale
- [ ] [CRITICAL] Privacy Policy aggiornata e pubblicata
- [ ] [CRITICAL] Privacy Policy: DPO nominato e contattabile
- [ ] [CRITICAL] Privacy Policy: diritti utente chiari
- [ ] [HIGH] Termini di Servizio pubblicati
- [ ] [MEDIUM] Cookie Policy

### Tecnica
- [ ] [HIGH] Security Implementation Document completato
- [ ] [HIGH] README con istruzioni sicurezza
- [ ] [MEDIUM] Incident Response Plan

---

## ✅ FIRMA E APPROVAZIONE

**Responsabile Tecnico:** ___________________ **Data:** ___________

**DPO / Responsabile Privacy:** ___________________ **Data:** ___________

**Project Manager:** ___________________ **Data:** ___________

---

## 📝 NOTE E ECCEZIONI

**Issue Note:**
- Issue #1: ___________________________
- Issue #2: ___________________________
- Issue #3: ___________________________

**Eccezioni Approvate:**
1. ___________________________________
   Giustificazione: ___________________
   
2. ___________________________________
   Giustificazione: ___________________

---

**Last Updated:** 15/02/2026  
**Next Review:** [Data prossima revisione]
