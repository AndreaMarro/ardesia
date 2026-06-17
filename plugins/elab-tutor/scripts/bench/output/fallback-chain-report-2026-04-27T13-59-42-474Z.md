# Fallback Chain Bench Report
Generated: 2026-04-27T13:59:42.606Z
Calls: 10 (10 baseline + 0 extras)
Threshold gate_accuracy: 1

## Aggregates
- gate_accuracy: 100.0% (0 violations)
- audit_log_completeness: 100.0%
- anonymization_rate: 100.0%
- avg_transit_latency_ms: 329
- avg_total_latency_ms: 5300
- provider_distribution: {"gemini-flash-lite":2,"none":1,"together":6,"runpod":1}

## Honesty caveat
Synthetic baseline scenarios — live replay requires Supabase together_audit_log query.
Hard rule validated: gate_runtime='student' MUST NOT route to Together.

Verdict: **PASS**