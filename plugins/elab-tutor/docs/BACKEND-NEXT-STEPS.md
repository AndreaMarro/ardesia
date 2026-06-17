# Backend — Next Steps to Reach 8.5/10

## Current Score: 7.3/10 (composito)
| Area | Score | Blocker |
|------|:-----:|---------|
| API Quality | 8.0 | - |
| Security | 7.5 | VPS URL hardcoded fallback |
| Code Quality | 7.5 | Some `any` casts |
| RAG Accuracy | 7.0 | No Italian stemming |
| **GDPR** | **6.5** | **Consent not enforced, Gemini data processing** |

## To reach 8.5 — GDPR must go from 6.5 to 8.5

### Step 1: Supabase Auth Integration (GDPR → 7.5)
- Enable Supabase Auth (email or magic link)
- Students join via class code → teacher approves
- Before chat: query `parental_consents` for authenticated user
- Block chat if no consent found → show "Chiedi al tuo insegnante"
- **Effort**: ~4h | **Impact**: +1.0 GDPR score

### Step 2: Gemini Data Processing Agreement (GDPR → 8.0)
- Sign Google Cloud DPA for Gemini API usage
- Document in privacy policy that data is processed by Google
- Add data processing record in GDPR audit log
- **Effort**: ~2h (administrative) | **Impact**: +0.5 GDPR score

### Step 3: Italian Stemmer for RAG (RAG → 8.0)
- Option A: Snowball stemmer (npm package, convert to Deno)
- Option B: Simple Italian suffix stripping (custom, ~50 rules)
- Option C: Use Gemini embeddings only (requires pgvector setup)
- **Effort**: ~3h | **Impact**: +1.0 RAG score

### Step 4: Image PII Pre-check (GDPR → 8.5)
- Before forwarding images to Gemini, run a lightweight check
- Option: Use Gemini itself to check for PII in image ("Does this contain faces/names?")
- Block or warn if PII detected
- **Effort**: ~2h | **Impact**: +0.5 GDPR score

### Total effort to 8.5: ~11h
