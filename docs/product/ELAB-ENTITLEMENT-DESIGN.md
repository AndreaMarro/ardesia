# ELAB Entitlement scuola/classe — design v1 (2026-07-12)

Obiettivo C della sessione NOTTE-11. Core puro in
`apps/studio/src/entitlements/` (nessuna UI, nessuna rete), proprietà di
sicurezza blindate da `EntitlementCore.test.ts`.

## Modello (fonti: External Research Ledger NOTTE-11)

Catena ispirata a **Stripe Entitlements** (Feature `lookup_key` → Active
Entitlement → l'app RILEGGE lo stato, mai cache boolean) adattata al
local-first:

```text
license key ELAB-XXXX-XXXX-XXXX-XXXX          ← artefatto di DISTRIBUZIONE
  → redeemLicenseKey (one-time)
  → EntitlementRecord {schoolId, classId, featureLookupKey, expiresAt}
  → issueAccessToken → email (SOLO via EmailAdapter)
  → redeemAccessToken (one-time, TTL 15 min) → sessione NUOVA
```

Due livelli distinti (pattern classroom: Google Classroom code ≠ credenziale):
- **license key**: alfabeto senza ambigui (no 0/O/1/I/L), ~79 bit — comodità
  di distribuzione, MAI unico segreto di sessione;
- **access token**: 128-bit CSPRNG (OWASP ≥128 bit raccomandati), il vero
  confine di sicurezza.

## Proprietà (tutte con test falsificabile)

| # | Proprietà | Test |
|---|---|---|
| E1 | chiave/token mai in chiaro nello store (solo SHA-256) | dump store non contiene raw |
| E2 | token one-time (`used` al primo redeem) | replay → invalid |
| E3 | TTL 15 min (norma magic-link 10-15) | redeem tardivo → invalid |
| E4 | risposta errore IDENTICA per ogni causa (anti-enumeration) | unknown/replay/expired → stesso oggetto |
| E5 | revoca entitlement nega accesso e token | revoke → checkAccess false, token invalid |
| E6 | consegna token SOLO via EmailAdapter (mail-sink nei test) | sink cattura, store no |
| E7 | nessuna PII persistita (email mai nello store) | dump store non contiene email |
| — | confronto hash constant-time | `timingSafeEqualHex` |
| — | sessione nuova al redeem (anti-fixation) | sessionId ≠ token |

## Mini threat-model (STRIDE, superficie attuale = core locale)

| Minaccia | Vettore | Mitigazione v1 |
|---|---|---|
| Spoofing | indovinare chiave/token | entropia 79/128 bit + one-time + TTL |
| Tampering | modifica record nello store locale | FUORI SCOPE v1 (stesso trust del filesystem locale; licenza firmata ed25519 = slice futura per verifica offline tamper-evident) |
| Repudiation | — | eventi redeem/revoke loggabili nell'event-log (slice futura, senza token) |
| Information disclosure | token in log/URL/store | hash-only store, consegna solo via adapter, mai token in URL GET |
| DoS | flood redeem | rate-limit di superficie = slice futura (il core espone `now` iniettato, banale aggiungere contatore) |
| Elevation | riuso token dopo revoca | redeem ricontrolla l'entitlement attivo a OGNI redeem |

## Gate-Andrea dichiarati

- provider email REALE (adapter di produzione): nessuna email vera senza
  decisione esplicita + isolamento; oggi esiste solo `LocalMailSink`;
- licenza firmata ed25519 per offline tamper-evident (chiave di firma MAI
  nel client — lezione dev-key #119);
- qualunque superficie UI/route che esponga il redeem;
- integrazione marketplace/Stripe reale.

## Non-scope v1 (onestà)

Nessuna UI, nessuna route, nessun rate-limit di superficie, nessuna firma
offline, nessun consenso/PII studente (il modello usa solo schoolId/classId
pseudonimi). `checkAccess` copre un entitlement per scope (puntatore
`latest`): multi-entitlement per la stessa classe = slice futura.
