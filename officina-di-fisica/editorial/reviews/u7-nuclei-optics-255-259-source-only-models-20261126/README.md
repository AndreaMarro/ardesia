# Source-only models: correction and genuine final execution

The first model run (session 14553) really exited 1. A structural equality compared a cancelled rational expression with an equivalent factored expression. It stopped before completing the 80 automated derivations. The first receipt in commit5c3af5ea was written prematurely with exit0: that claim is invalid and receives no credit. Its exact bytes remain in premature-invalid-positive-receipt.json and Git. The original terminal output was observed, but no original raw file had been captured.

The old model bytes are preserved in failed-initial-model.py.txt. A separate faithful reproduction of those bytes (session97048) genuinely exited1; its captured complete output is actual-old-model-negative-reproduction.txt. That later run is explicitly a reproduction, not a replacement for the original stream.

The only correction is to assert sp.cancel(left−right)==0. There is no floating tolerance, alternate answer, relaxed physical domain or swallowed exception. The corrected model genuinely completed all80 source-only derivations with exit0 in session27769. Its captured complete output is actual-successful-rerun-output.txt. The current receipt supersedes the invalid one explicitly and pins the corrected model.

No B255–259 candidate, options, keys, solution blocks, SVG or authoring code had been opened before this corrected freeze. The original prompt-only primary d0628ef6 remains unchanged. These model runs approve no candidate, no product UI and no human action.
