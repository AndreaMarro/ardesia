# Studio dependency policy

lock-only: npm install --package-lock-only --ignore-scripts --no-audit --no-fund
materialize: npm ci --ignore-scripts --no-audit --no-fund
Lifecycle scripts, optional omission, install fallback, wizard and generator use are forbidden.
Every dependency change requires authorization and an exact package/lock tranche.
Publication binding must use `--candidate-sha` equal to the exact final HEAD; the frozen oracle derives E and verifies every later descendant.
Evidence accepted before the current workflow anchor belongs to a prior epoch and must never be rebound with current provenance.
Within the current V5 epoch, the frozen workflow markers and the three policy runtime identity values must remain exactly equal.
