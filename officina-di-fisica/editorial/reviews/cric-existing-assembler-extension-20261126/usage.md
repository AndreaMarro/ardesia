# Existing assembler: Cric editions

Use `assemble_family(..., source_origin="cric", source_ids=["C1-Q001", "C1-Q002"], source_path="officina-di-fisica/content/C1.json")` with one separately authored task per source ID. Read original metadata from the frozen source commit. The existing helper preserves ID/course/skill and protected exam metadata and derives each original version individually. It rejects identity, edition or exam rebinding through overrides.

The default Ardesia call is unchanged. Cric selection is bounded to1–100 unique existing questions; no source key is used to approve an answer. This helper only assembles `astra/1`; use the existing importer, registry, independent verifiers and editorial gates. `promptBlocks` from a prior prompt are replaced with the new prompt; supply newly authored supplements explicitly through overrides when needed. All previous editions remain in the source and canonical version store.

This technical change earns zero scientific question credit and zero publication credit.
