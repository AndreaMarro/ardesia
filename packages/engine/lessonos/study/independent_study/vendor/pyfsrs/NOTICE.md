# py-fsrs scheduler adoption

Copyright(c)2022 Open Spaced Repetition. MIT license in LICENSE is preserved verbatim.
Source: https://github.com/open-spaced-repetition/py-fsrs/tree/9446cb06605c597a063aeee49f7d188d42e34dc2 , tagv6.3.2.

Adopted the complete scheduler subsystem with card/rating/state/review-log, serialization and replay/rescheduling. Numerical algorithms and default weights are unchanged. Imports are relative to avoid a global fsrs package; typing.Self replaces typing_extensions.Self because Ardesia requires Python>=3.12. No runtime dependency was added.

The package entry point exposes the adopted scheduler API. Optimizer/training and heavy optional dependencies, real-person review-log CSV and logo/assets were not acquired. The41 basic scheduler contracts are reused; the optional Optimizer-loader contract is outside this adopted scope, not claimed PASS. Original and adapted hashes are recorded in PROVENANCE.json. The original test source remains available at the pinned upstream URL.

Maintenance: update the immutable pin only with upstream contracts and Core/UI/receipt/reopen/revocation regression. Rollback the feature hook while preserving versioned resources and receipts; never reset an unknown persisted scheduler silently.
