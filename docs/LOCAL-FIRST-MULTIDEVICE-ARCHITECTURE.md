# LOCAL-FIRST MULTI-DEVICE ARCHITECTURE — written & firsthand-verified

Doc created at `/Users/andreamarro/VOLUME 3/docs/LOCAL-FIRST-MULTIDEVICE-ARCHITECTURE.md` (dated 2026-06-26, read-only audit, no mutations, no secret values printed). Every load-bearing claim is backed Claim→Evidence with commands I actually ran.

## Recommendation delivered
**Role-based split, NOT model-sharding/exo.** Heavy reasoning on the Mac hub (Ollama 7–14B + embeddings); light capture+recall on each iPad/iPhone (all-minilm 45MB + qwen2.5:1.5b + Apple Foundation Models). Tailscale mesh hub↔client; SQLite+markdown storage; L0→L1(atoms/method-graph)→L2(scenari)→L3(persona) memory; BM25+embeddings hybrid retrieval; deny-by-default egress; student data device-confined (GDPR); optional BYO-key cloud per tier. Includes the local-vs-BYO-key trade-off table and a risks table.

## Key firsthand verifications
- **Tailscale mesh live:** 3 nodes — macbook-air (100.112.91.7), mac-mini active/direct (100.124.198.59), iphone-13-pro enrolled (100.109.155.83). Client tier is a real node.
- **Hub models present:** `ollama list` / API → qwen2.5:7b (4.68GB), qwen3:4b, llava:7b (multimodal), qwen2.5:1.5b, all-minilm (45MB), galileo-brain-v13. "7–14B" grounded (7B live, same runtime).
- **Apple Foundation Models real:** `FoundationModels.framework` present, macOS 26.0.1 (Tahoe) — on-device FM path is not a roadmap item.
- **Egress guard proven:** selftest → baseline REACHABLE → strict deny BLOCKED → PASS exit 0. localonly profile → external 1.1.1.1 code=000 (blocked), loopback :3111 code=200 (reachable).
- **"Models smart enough" grounded in measured A/B:** iPad-grade (all-minilm 45MB + qwen2.5:1.5b) recall@10=0.475 / hit@10=1.0 / CoV 0% ≥ AgentMemory:3111 (0.442/0.917). Honest caveats carried (synthetic queries, noisy baseline pool, L1–L3 quality unmeasured).
- **Heavy engine hub-side:** ssh macmini → :8200 git_sha=98ac0f4 (==auto/main), 1224 segments, auth-gated. Web prod /health=200 (small public mirror, noted as not the local-first path).

## Why role-based, not sharding (in the doc)
Sharding a 14B across battery devices adds per-token Wi-Fi latency, makes one sleeping device a total-failure point, and streams raw activations (bigger PII blast radius). The student workload is capture+recall+light Q&A — already proven viable on-device — so heavy synthesis stays on the plugged-in hub (idle-gated, batch).

## Note
The PostToolUse semgrep hook error ("No SEMGREP_APP_TOKEN") is the known-innocuous spam documented in project memory; the file wrote successfully.