# Canonical byte equivalence for nine legacy metadata refs

All nine current committed verifier files, candidate packages and bindings are byte-identical to the known canonical PR363 merge tree `831b73fa71076b2e9b363006ffd94a350f22fe90`: 27 exact file comparisons. Their pinned canonical JSON package/bindings digests also match the verifier constants, parsed without importing the modules.

Within the explicitly checked first-parent canonical merge chain, seven families first match at PR356 (`0b5f3a8bce91f1c9aa9ac273829bc6c67e72023c`); projectile-one-second and frequency-count first match at PR357 (`6ab24b975686fbfc72c1adefdad6845c48b1ce4d`). Each file SHA-256 and Git blob OID is in audit.json.

This identifies available canonical trees with the same bytes. It does not recover an unavailable original author commit, establish authorship, rewrite metadata, execute a scientific verifier or grant new credit. No fetch or upload occurred during the audit. The PR363 tree is a historical known canonical merge, not a claim about the current remote tip. The nine prior remote-fetch failures remain documented.

The included script is a read-only audit, not a new acceptance pipeline. It rejects uncommitted comparison targets, a mismatch in any of the three files or a mismatch with the frozen package/bindings digest constants. It performed no model imports or runtime changes. Activity credit 0; human NOT_RUN; publication NONE.
