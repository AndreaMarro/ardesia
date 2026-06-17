# CRITICAL Security Alert — Supabase Access Token Exposed in Git

**Date:** 2026-04-23
**Severity:** P0 (secret exposed in public git history)
**Discovered by:** `scripts/coherence-check.mjs` C5 pattern scan
**Status:** action required from Andrea (developer credentials)

---

## Finding

Secret pattern `sbp_REVOKED_20260423_REDACTED` (Supabase Access Token format) found in git-tracked files:

```
docs/SESSION-COMPLETE-02-APR-2026.md
docs/plans/2026-04-18-PDR-v3-DEFINITIVO.md
docs/prompts/2026-04-18-RALPH-LOOP-DEFINITIVO.md
docs/prompts/PROMPT-BACKEND-SESSIONE-NEXT.md
docs/prompts/PROMPT-DEBUG-TOTALE-NOTTURNO.md
docs/prompts/PROMPT-FRONTEND-SESSIONE-NEXT.md
docs/prompts/PROMPT-SESSIONE-LAVAGNA-PDF-PENNA.md
docs/prompts/RALPH-LOOP-NEXT-SESSION.md
docs/prompts/SESSIONE-2-NANOBOT-POLISH.md
docs/prompts/SESSIONE-3-ONBOARDING-COLLAB.md
scripts/upload-chunks-supabase.py
```

**Presente in git history su**:
- `refs/heads/feature/watchdog-draft` (commit 7ca9eb6)
- `refs/heads/session/2026-04-17-pdr-v3-prep` (commit 5a94adf)

Questo significa che anche se removiamo dalle HEAD, il token è ancora estraibile da `git log -p` o `git show <commit>`.

---

## Impatto

- `sbp_*` token ha privilegi management + deploy Edge Functions
- Chi ha cloned il repo (collaboratori, agent, attacker) PUÒ deployare funzioni arbitrarie, leggere DB, modificare RLS
- Potenziale vettore per bypass GDPR (deploy Edge Function hostile che legge tabelle dati minori)

---

## Azioni richieste da Andrea (NON eseguibili da me)

### 1. Rotazione immediata (oggi)

```
Login Supabase dashboard →
  Account Settings → Access Tokens →
  Revoke sbp_REVOKED_20260423_REDACTED →
  Generate new token
```

### 2. Aggiorna dove usato (locale + CI)

```bash
# Locale
echo "export SUPABASE_ACCESS_TOKEN=sbp_<NEW>" >> ~/.zshrc
source ~/.zshrc

# GitHub Actions (se presente)
gh secret set SUPABASE_ACCESS_TOKEN -b "sbp_<NEW>"

# Vercel env (se deploy usa supabase CLI)
vercel env add SUPABASE_ACCESS_TOKEN
```

### 3. Rimuovi dai file git-tracked (PR separata)

Per ogni file elencato sopra:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
sed -i '' 's/sbp_REVOKED_20260423_REDACTED/sbp_REDACTED_ROTATED/g' <file>
git add <file>
```
Poi commit + PR: `security: remove leaked SUPABASE_ACCESS_TOKEN from docs (rotated upstream)`.

### 4. Pulisci git history (opzionale ma raccomandato)

Solo se decisi che serve pulire completamente (complica la history, force-push su main):
```bash
# BFG Repo-Cleaner (più veloce di filter-branch)
brew install bfg
cd /tmp && git clone --mirror git@github.com:AndreaMarro/elab-tutor.git
cd elab-tutor.git
bfg --replace-text <(echo 'sbp_REVOKED_20260423_REDACTED==>sbp_REDACTED') .
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

⚠️ ROMPE tutti i clone esistenti. Collaboratori devono re-clonare.

Alternativa lazy ma accettabile: rotazione (step 1) basta, la history contiene token MORTO.

---

## Prevenzione futura

### Pre-commit hook secret scanning (da integrare)

Add to `.husky/pre-commit`:
```bash
# Block commit se pattern secret nel diff
if git diff --cached | grep -qE "sbp_[a-zA-Z0-9_-]{30,}|sk-ant-[a-zA-Z0-9_-]{20,}|eyJhbGciOiJ[A-Za-z0-9_-]{40,}"; then
  echo "ABORT: potential secret detected in staged changes"
  echo "Review diff + rotate if real secret before committing"
  exit 1
fi
```

### .gitignore aggiunta

Aggiungi a `.gitignore`:
```
# Files che historically contengono secret pasted
docs/prompts/*SESSIONE*.md
docs/prompts/*PROMPT-*.md
# Eccezione: template e spec (niente valori reali)
!docs/prompts/*template*.md
```

Alternativa MIGLIORE: convention → le session prompt files vanno in `docs/private/` gitignored.

### Coherence check pre-push

`scripts/coherence-check.mjs` è ora runnable. Aggiungi a `.husky/pre-push`:
```bash
node scripts/coherence-check.mjs || {
  echo "Coherence check FAILED — fix before pushing"
  exit 1
}
```

---

## Onestà

- Ho scoperto il leak via script che ho appena scritto (prima run)
- Il coherence check SCORE = 7/8 passes + 1 critical fail (è il job, ha funzionato)
- Andrea deve rotate il token prima di ogni altra azione critica
- Rimozione da git history è opzionale — rotazione basta per security effective

**Il leak è già pubblico. La rotazione lo rende impotente.**
