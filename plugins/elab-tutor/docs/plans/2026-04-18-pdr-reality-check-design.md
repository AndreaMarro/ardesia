# PDR — Reality Check Fase 14 (8 audit live PASS/FAIL bloccanti pre v1.0)

**Target agent**: Claude Opus 4.7 via Managed Agent (Max #2, trigger manual)
**Durata stimata**: 24-40h (audit sequenziali)
**Trigger**: Andrea comando Telegram `/reality-check-start` quando v1.0 candidate
**Governance**: bloccante per launch v1.0 — 8/8 PASS obbligatorio

---

## 🎯 Obiettivo

Prima di dichiarare ELAB Tutor v1.0 "pronto per scuole", eseguire 8 audit live rigoriosi con criterio **PASS/FAIL esplicito**. Se anche **1/8 FAIL** → no launch, iterate fix.

**Principio Andrea**: "OGGETTIVAMENTE FUNZIONANTI AL 100 PER CENTO, NON COMPIACERMI".

---

## 📋 Gli 8 audit

### Audit 14.1 — TTS italiano quality blind listening

**Scope**: valutare qualità voce italiana di:
- F5-TTS (self-host RunPod) — ipotesi primary
- Kokoro 82M IT (self-host) — fallback
- Voxtral API (Mistral) — premium opzione
- Edge TTS Microsoft (già UP, baseline) — deep fallback

**Metodo**:
- 10 paragrafi UNLIM-style tratti da Vol 1 Cap 6-8
- Audio generato da tutti 4 sistemi
- **Blind listening test**: mescolare audio, far ascoltare a (a) te Andrea, (b) 2 docenti volontari, (c) Managed Agent con rubrica
- Rubrica 5 dimensioni: chiarezza, naturalezza, pronuncia italiana, emotività, intelligibilità bambini
- Score medio 1-10 per sistema

**PASS criteria**: winner ≥ 7.5/10 (test realistico).

**FAIL action**: se F5-TTS < 7.5 → switch Kokoro (se ≥ 7.5) → altrimenti Voxtral API ricorrente (€120/mese accettato come compromesso).

### Audit 14.2 — LLM multilingue preservation tone

**Scope**: Claude Sonnet 4.6 (se API usato) o Llama 3.3 70B (se self-host) mantiene Principio Zero v3 in 7 lingue.

**Metodo**:
- 10 prompt UNLIM-style × 7 lingue = 70 test
- Verifica: apertura "Ragazzi/Kids/Enfants/Kinder/Niños/يا أطفال/同学们", citazione libro, parola libro esatta (adattata lingua), analogia concreta
- Automated scoring via regex + semantic similarity

**PASS criteria**: 95%+ delle 70 risposte passano tutti check.

**FAIL action**: fine-tuning prompt per lingua debole, re-test.

### Audit 14.3 — Vision accuracy 20 circuiti ELAB

**Scope**: Qwen 2.5 VL 7B (RunPod) diagnosi corretta su 20 screenshot circuiti ELAB.

**Metodo**:
- 20 circuiti: 5 LED vario, 5 resistori vario, 5 pulsanti, 5 motore/servo
- Ogni circuito ha ground truth diagnosi (manual labeled Andrea)
- Prompt: "Cosa c'è di sbagliato?" o "Spiega questo circuito"
- Score accuracy

**PASS criteria**: accuracy ≥ 85% su 20 screenshot.

**FAIL action**: upgrade a Qwen VL 72B (A100 80GB necessaria) o Gemini 3.1 Pro API come fallback.

### Audit 14.4 — Wake word "Ehi UNLIM" accuracy

**Scope**: openWakeWord custom model "Ehi UNLIM" italiano.

**Metodo**:
- 100 audio sample: 50 positivi ("Ehi UNLIM" in contesti vari), 50 negativi (conversazione senza wake)
- Ambienti: aula silenziosa, aula rumorosa, ragazzi parlano
- Misurare True Positive Rate + False Positive Rate

**PASS criteria**: TPR ≥ 95% + FPR ≤ 5%.

**FAIL action**: re-train modello con più dati, adjust threshold.

### Audit 14.5 — OpenClaw penetration test

**Scope**: sicurezza OpenClaw su Hetzner CX52.

**Metodo**:
- Automated scan: nmap, nikto, sqlmap
- Manual test: bypass rate limit, SSRF, injection prompt
- Check CVE 138 lista mitigation

**PASS criteria**: zero vulnerabilità critical + zero high + <3 medium documentate.

**FAIL action**: hardening aggiuntivo, patch config, re-test.

### Audit 14.6 — Videocorsi HeyGen qualità italiana

**Scope**: avatar HeyGen "Prof ELAB" in 3 video campione.

**Metodo**:
- 3 video test (introduzione, esperimento, quiz)
- Review blind: 3 docenti volontari + te
- Rubrica: pronuncia, fluency, lip-sync, engagement, accessibilità

**PASS criteria**: score medio ≥ 8/10.

**FAIL action**: alternative Synthesia + Elai, confronto, pick winner.

### Audit 14.7 — Load test sintetico 100 users concorrenti 1h

**Scope**: sistema regge 100 users concorrenti per 1h.

**Metodo**:
- k6 script: 100 virtual users, scenario realistico
- Monitor: latency p95, error rate, cost

**PASS criteria**:
- p95 latency < 3s
- error rate < 1%
- cost < €5 per 1h test
- zero crash OpenClaw/Supabase

**FAIL action**: bottleneck analysis, scale-out tier.

### Audit 14.8 — GDPR audit completo minori

**Scope**: compliance GDPR Art. 8 (minori under 14 require parental consent).

**Metodo**:
- Review data flow (quale dato raccolto, da chi, dove storato, retention)
- Verify consent flow (parental + teacher doppio opt-in)
- Right-to-access, right-to-delete, right-to-portability funzionanti
- Privacy policy + ToS completi
- DPA templates per scuole
- Sub-processor list (Supabase, Vercel, Hetzner, RunPod, etc.)

**PASS criteria**: legal self-audit con checklist 50+ voci (basato su Garante Privacy Italia linee guida) → 100% compliance.

**FAIL action**: consulente legale GDPR (Andrea autorizza spese), iterate fino OK.

---

## 📋 Exit gate v1.0 launch

**Solo se 8/8 audit PASS**:
- [ ] Audit 14.1 TTS PASS
- [ ] Audit 14.2 LLM multilingue PASS
- [ ] Audit 14.3 Vision PASS
- [ ] Audit 14.4 Wake word PASS
- [ ] Audit 14.5 OpenClaw security PASS
- [ ] Audit 14.6 Videocorsi PASS
- [ ] Audit 14.7 Load test PASS
- [ ] Audit 14.8 GDPR PASS

Se 8/8 → Andrea riceve Telegram:
```
🎉 REALITY CHECK PASSED 8/8
ELAB Tutor v1.0 is production-ready.
Tap /launch-v1-0 to promote to prod.
```

Se <8/8 → report onesto `docs/audits/2026-XX-reality-check-FAIL.md` con lista issue e piano rimedio.

## 🚨 Principio Andrea applicato

> "OGGETTIVAMENTE FUNZIONANTI AL 100 PER CENTO, NON COMPIACERMI"

**Traduzione operativa**: Auditor agent è **severo**. Non mitiga per "quasi pronto". PASS solo se criteri quantitativi strict raggiunti. FAIL → iterate. No compromessi su "lo sistemiamo dopo".

---

**Gate v1.0 launch**: no 8/8 PASS, no vendita scuole. Fagherazzi e Omaric vedono prodotto solo post audit green.
