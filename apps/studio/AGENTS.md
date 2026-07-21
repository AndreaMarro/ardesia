# Studio dependency policy
lock-only: npm install --package-lock-only --ignore-scripts --no-audit --no-fund
materialize: npm ci --ignore-scripts --no-audit --no-fund
Lifecycle scripts, optional omission, install fallback, wizard and generator use are forbidden.
Every dependency change requires authorization and an exact package/lock tranche.
