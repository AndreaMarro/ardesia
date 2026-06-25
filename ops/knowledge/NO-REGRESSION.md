# NO-REGRESSION PROTOCOL (GSD context-packet pattern)
OBBLIGO per ogni worker/lane:
1. BEFORE: read ops/packets/<dated packet-in> + the relevant *-STATE.md (and ~/ardesia-vault deep SoT if needed).
2. WORK.
3. AFTER: write packet-out + bump the *-STATE.md last-verified + append REGRESSIONS.md (if applicable) + update AgentMemory (verified).
4. A2 verifies the knowledge update == real evidence (no false claims in the vault).
5. Knowledge-mismatch (vault says X, live says Y) -> BLOCK done, write REGRESSIONS, reconcile. Vault wins.

DECISIONS.md + REGRESSIONS.md = append-only (immutable history).
New packet: bash bin/new-packet.sh <lane>  (stamps a dated packet-in from the template).
