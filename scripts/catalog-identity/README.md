# Catalog identity pipeline


The pipeline validates the 30-file traffic-pack checksum before writing a run.

- `--skip-hashes` builds a deterministic metadata inventory without reading audio bytes.
- `--catalog-only --skip-hashes` writes the local source/creator manifest while external backup access is unavailable; it never promotes a DSP identity.
- `--full-negative-fingerprint` is required before a candidate becomes verified or a planned release is cleared.
- `--copy-release-assets` copies exact WAV masters for the six planned releases into the private run folder.

Set `CATALOG_RUN_STAMP` for reproducible run paths. The backup path is read with the same deterministic Node walker as the official masters; unavailable or placeholder files fail as `blocked_external_data` rather than producing empty matches.

For a Drive-synced catalog that is slow to read, set `CATALOG_EXTERNAL_ROOT` to a verified local staging copy, `CATALOG_TRAFFIC_PACK` to the original traffic-pack root, and `CATALOG_DRIVE_PACK` to a local output root. `CATALOG_HASH_CONCURRENCY` defaults to `4`. Copy only the resulting run files back to Drive; never upload raw audio from this pipeline.
