# Catalog identity pipeline


The pipeline validates the 30-file traffic-pack checksum before writing a run.

- `--skip-hashes` builds a deterministic metadata inventory without reading audio bytes.
- `--catalog-only --skip-hashes` writes the local source/creator manifest while external backup access is unavailable; it never promotes a DSP identity.
- `--full-negative-fingerprint` is required before a candidate becomes verified or a planned release is cleared.
- `--copy-release-assets` copies exact WAV masters for the six planned releases into the private run folder.

Set `CATALOG_RUN_STAMP` for reproducible run paths. Set `CATALOG_EXTERNAL_ENUM_TIMEOUT_MS` to bound Google Drive enumeration; timeout errors are `blocked_external_data`.
