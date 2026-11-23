CREATE TABLE engine_releases(
    id TEXT NOT NULL,
    version TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    PRIMARY KEY(id, version)
);
