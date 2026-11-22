CREATE TABLE IF NOT EXISTS run_policies (
    run TEXT PRIMARY KEY REFERENCES runs(id),
    policy TEXT NOT NULL
);
