---
id: ardesia-night-profile-v1-template
status: active-template
schema: night-profile/v1
authority: operational-template
---

# Ardesia — template canonico `NightProfileV1`

Questo documento definisce il formato versionato e diffabile dell'overlay
giornaliero. L'esempio sottostante è un **template sintetico**, non un profilo
reale, non una decisione e non una ricevuta. Un profilo compilato descrive il
lavoro locale proponibile per un giorno; non concede autorità di scrittura,
pubblicazione, deploy, uso di segreti o trattamento di dati.

## Eccezione bootstrap del 15 luglio 2026

Il questionario soci è stato creato prima di questo template come eccezione
bootstrap una tantum. Non si crea né si ricostruisce retroattivamente un overlay
del 2026-07-15. Il primo profilo futuro può usare `GENESIS`; deve spiegare che
inizia la lineage senza attribuire decisioni o attività ai giorni precedenti.

## Esempio JSON parseabile

I marker delimitano l'unico payload di esempio controllabile automaticamente.
Ogni valore `EXAMPLE_*`, `2099-01-01`, hash di soli zero e path segnaposto deve
essere sostituito nell'istanza reale.

<!-- NIGHT_PROFILE_V1_EXAMPLE_START -->
```json
{
  "schema_version": "night-profile/v1",
  "record_kind": "TEMPLATE_EXAMPLE_NOT_AN_OVERLAY",
  "date": "2099-01-01",
  "profile_id": "EXAMPLE-night-profile-2099-01-01-pv1",
  "plan_id": "ARDESIA-FOUNDING-PLAN-1-9-v1",
  "plan_version": 1,
  "current_gate": "1-canon-baseline-source-of-truth",
  "previous_profile_sha256": "GENESIS",
  "previous_verified_root": {
    "path": "/ABSOLUTE/PATH/TO/PREVIOUS-ROOT.json",
    "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
  },
  "canonical_profile_sha256": "COMPUTE_AFTER_OMITTING_THIS_FIELD",
  "delta_reasons": [
    {
      "field": "*",
      "reason": "GENESIS: first future profile in this lineage; not a 2026-07-15 backfill."
    }
  ],
  "work_portfolio": {
    "core_delivery": 50,
    "reuse_research_verification": 30,
    "falsifiable_innovation": 20,
    "total": 100,
    "mandatory_overhead_outside_percentages": [
      "CoV",
      "privacy",
      "security",
      "receipts",
      "shutdown"
    ]
  },
  "model_routing": {
    "sol_max_approx_percent": 50,
    "terra_max_approx_percent": 30,
    "sol_ultra_cap_percent": 20,
    "unused_ultra_is_not_spent_artificially": true,
    "note": "Model routing is independent from the exact work_portfolio control."
  },
  "roles": [
    {
      "id": "controller",
      "role": "convergence-controller",
      "repository_writer": true
    },
    {
      "id": "reviewer",
      "role": "independent-verifier",
      "repository_writer": false
    }
  ],
  "scope": {
    "allowed_paths": [
      "docs/00-INDEX.md"
    ],
    "forbidden_paths": [
      ".env",
      "package.json"
    ]
  },
  "hypotheses": [
    {
      "id": "H1",
      "statement": "The selected slice closes one observable gap without widening authority.",
      "metric": "binary_acceptance_gates_passed",
      "direction": "increase",
      "threshold": "all declared gates pass on the exact candidate",
      "stop_condition": "stop on identity drift, lock mismatch, scope escape or any failed hard gate",
      "rollback": "revert only the owned candidate diff without destructive Git operations"
    }
  ],
  "vendor_capabilities": {
    "github_actions": {
      "status": "BLOCKED_EXTERNAL",
      "evidence": ["EXAMPLE: no exact-SHA remote run"],
      "authority_current": "read-only observation only",
      "cost_verified_zero": true,
      "project": "AndreaMarro/ardesia",
      "region": "provider-managed",
      "technical_prerequisite": ["published exact candidate SHA"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "no external state changed",
      "terms_or_spend": "none"
    },
    "coderabbit": {
      "status": "LOCAL_ONLY",
      "evidence": ["EXAMPLE: bounded local advisory review only"],
      "authority_current": "advisory; never merge authority",
      "cost_verified_zero": true,
      "project": "local exact diff",
      "region": "UNKNOWN",
      "technical_prerequisite": ["secret and lesson-content scan green"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "EXISTING_APPROVED_REFERENCE_OR_NONE",
      "rollback": "discard advisory result; no champion mutation",
      "terms_or_spend": "none"
    },
    "storybook": {
      "status": "LOCAL_ONLY",
      "evidence": ["EXAMPLE: local deterministic build only"],
      "authority_current": "local inspection only",
      "cost_verified_zero": true,
      "project": "Ardesia Studio",
      "region": "local",
      "technical_prerequisite": ["Ardesia-specific stories; no generated samples"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "remove only the owned isolated configuration",
      "terms_or_spend": "none"
    },
    "chromatic": {
      "status": "BLOCKED_EXTERNAL",
      "evidence": ["EXAMPLE: compromised credential rotation required"],
      "authority_current": "no upload",
      "cost_verified_zero": false,
      "project": "NOT_CONFIGURED",
      "region": "UNKNOWN",
      "technical_prerequisite": ["credential rotation", "approved secret", "de-identified fixtures"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "ROTATION_REQUIRED_NEVER_VALUE",
      "rollback": "disable upload and remove owned configuration",
      "terms_or_spend": "none"
    },
    "sentry": {
      "status": "NOT_CONFIGURED",
      "evidence": ["EXAMPLE: no dedicated Ardesia project proof"],
      "authority_current": "none",
      "cost_verified_zero": false,
      "project": "NOT_CONFIGURED",
      "region": "UNKNOWN",
      "technical_prerequisite": ["redacted synthetic error", "release equals SHA"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "remove owned adapter/configuration and revoke approved reference",
      "terms_or_spend": "none"
    },
    "posthog": {
      "status": "NOT_CONFIGURED",
      "evidence": ["EXAMPLE: no dedicated Ardesia project proof"],
      "authority_current": "none",
      "cost_verified_zero": false,
      "project": "NOT_CONFIGURED",
      "region": "UNKNOWN",
      "technical_prerequisite": ["allowlisted synthetic events", "autocapture and replay denied"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "remove owned adapter/configuration and revoke approved reference",
      "terms_or_spend": "none"
    },
    "vercel": {
      "status": "LOCAL_ONLY",
      "evidence": ["EXAMPLE: versioned local configuration without exact-artifact preview"],
      "authority_current": "local inspection only",
      "cost_verified_zero": false,
      "project": "NOT_LINKED_OR_VERIFIED",
      "region": "UNKNOWN",
      "technical_prerequisite": ["legacy_egress_disabled=true", "same verified artifact without rebuild"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "remove preview alias or restore the previous verified artifact after human gate",
      "terms_or_spend": "none"
    },
    "render": {
      "status": "NOT_CONFIGURED",
      "evidence": ["EXAMPLE: no core API or worker assignment"],
      "authority_current": "none",
      "cost_verified_zero": false,
      "project": "NOT_CONFIGURED",
      "region": "UNKNOWN",
      "technical_prerequisite": ["architecture assignment", "legacy_egress_disabled=true", "health and rollback proof"],
      "synthetic_only_no_pii": true,
      "deny_by_default": true,
      "secret_reference": "NONE",
      "rollback": "remove only the owned staging service after human gate",
      "terms_or_spend": "none"
    }
  },
  "immutable_clauses": {
    "north_star": "Ardesia è AI-native nell'esperienza, evidence-authoritative nella verità e deterministica nell'autorità.",
    "authority_boundary": "Models may propose; the deterministic kernel controls identity, scope, consent, persistence, provenance, deletion, replay, decisions and application.",
    "safety_boundary": "No push, PR, merge, deploy, production action, account or secret mutation, spend, new terms, real lesson data, PII or weakened gate without its explicit authority.",
    "founding_plan": "ARDESIA-FOUNDING-PLAN-1-9-v1",
    "reordering_rule": "The overlay may reorder only independent safe local backlog inside current_gate; it never changes safety, authority, the north star, the evidence-authoritative direction or founding-plan gates 1-9."
  },
  "executable_next_prompt": {
    "single_objective": "EXAMPLE: close one binary gap inside current_gate",
    "allowed_paths": ["docs/00-INDEX.md"],
    "red": "EXAMPLE: reproducible failing condition before write",
    "green": "EXAMPLE: deterministic acceptance on the exact candidate",
    "stop_conditions": ["identity drift", "lock mismatch", "scope escape", "hard gate failure"],
    "rollback": "revert only the owned diff non-destructively; never reset hard or clean"
  }
}
```
<!-- NIGHT_PROFILE_V1_EXAMPLE_END -->

## Regole normative di istanziazione

1. Un profilo reale sostituisce `record_kind` con `NIGHT_PROFILE`, compila tutti
   i segnaposto e usa una data ISO reale. Il template non vale come profilo.
2. `previous_profile_sha256` è un digest SHA-256 lowercase di 64 caratteri.
   `GENESIS` è ammesso soltanto per il primo profilo futuro della lineage e
   richiede una ragione esplicita; non autorizza il backfill del 2026-07-15.
3. `previous_verified_root.path` è assoluto e punta alla root regolare verificata;
   il relativo hash è sempre un digest lowercase di 64 caratteri.
4. `delta_reasons` contiene una voce non vuota per ogni campo cambiato rispetto
   al profilo precedente. Solo `GENESIS` può usare `field: "*"`.
5. Il portfolio di lavoro è esatto: `50 + 30 + 20 = 100`. CoV, privacy,
   sicurezza, ricevute e shutdown restano overhead obbligatorio esterno. Il
   routing dei modelli è un controllo distinto e non modifica queste quote.
6. Sono ammessi da uno a tre ruoli, con ID unici ed esattamente un writer.
7. `allowed_paths` contiene da uno a cinque file repository-relative, NFC,
   unici e ordinati per byte UTF-8; vieta glob, traversal, directory e symlink.
   `forbidden_paths` è non vuoto e disgiunto dopo la stessa normalizzazione.
8. Ogni ipotesi ha ID, metrica, direzione, soglia, stop condition e rollback
   non distruttivo. Un campo mancante rende il profilo invalido.
9. Ogni vendor usa esclusivamente `VERIFIED_ACTIVE`, `LOCAL_ONLY`,
   `BLOCKED_EXTERNAL` o `NOT_CONFIGURED` e compila evidenza, autorità, costo,
   progetto, regione, prerequisito, synthetic/no-PII, deny-by-default,
   riferimento al secret, rollback e termini/spesa. Il riferimento identifica
   un secret approvato o `NONE`: non contiene mai il valore.
10. Le cinque `immutable_clauses` coincidono esattamente con il template. Un
    profilo non può rinumerare il piano, attenuare l'autorità deterministica o
    trasformare evidenze e proposte in verità per dichiarazione.
11. `executable_next_prompt` mantiene un solo obiettivo, scope, RED, GREEN,
    stop e rollback. Ogni run ri-osserva stato live: l'overlay non è autorità.

## Hash canonico e lineage

Per evitare un self-hash circolare, il digest di un profilo reale si calcola
così:

1. estrarre il solo oggetto JSON delimitato dai marker del profilo reale;
2. verificare schema e regole normative;
3. rimuovere la chiave top-level `canonical_profile_sha256`;
4. serializzare l'oggetto come JSON UTF-8 compatto con chiavi ricorsivamente
   ordinate, array invariati e un solo LF finale (equivalente a `jq -cS`);
5. calcolare SHA-256 lowercase di quei byte e inserirlo nel campo rimosso;
6. ripetere estrazione e calcolo: il valore deve coincidere prima dell'uso.

Il path, l'hash della root verificata precedente, l'hash del profilo precedente
e le ragioni del delta rendono la lineage ricostruibile. Una modifica del
template richiede un successore versionato; non riscrive profili passati.

## Gate deterministico minimo

Il checker accetta un'istanza nominale e deve rifiutare almeno: portfolio diverso
da 100; zero o due writer; overlap fra path ammessi e vietati; prior hash o
ragione mancanti; enum vendor invalido; stop o rollback assenti; piano
rinumerato; north star o confine di autorità indeboliti. Dati mancanti o non
parseabili falliscono chiuso.

## Non-claim

Questo template non prova capacità runtime, consenso dei soci, stato dei vendor,
CI remota, founder beta, efficacia pedagogica o sicurezza operativa. Registra
un piano falsificabile; Git, test, receipt e decisioni umane conservano la loro
autorità separata.
