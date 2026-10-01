# BOBS Recipe Master market-reference migration — 1 October 2026

## WACP intent before implementation
Owner approved promoting the audited BOBS market/small-hotel reference data into the operational Recipe Master so planned/standard COGS is calculated from corrected recipe quantities rather than known-wrong legacy values.

Recovery baseline: `main` at `ba4953057f2297e939adf9105c1f371073f19135`.
Working branch: `chatgpt/recipe-master-market-migration-20261001`.

Material actions intended:
1. Inspect current Recipe Master seed/storage/sync flow and identify the canonical operational recipe source used for COGS.
2. Add a controlled migration/normalization step that promotes audited market-reference recipe quantities/yield/process metadata into the operational Recipe Master baseline while preserving current supplier rates where a matching ingredient/unit exists.
3. Never overwrite outlet-specific Method-2 overrides or actual-production observations. Market reference remains benchmark; Recipe Master becomes approved operational standard; outlet/actual remains the third layer.
4. Create a pre-migration snapshot/rollback representation in source so the previous baseline can be reconstructed if required.
5. Directly calibrated recipes may replace known-wrong quantities/yields. Family-checked recipes may update only fields covered by the family reference; operation-specific fuel/oil/portion assumptions remain explicitly calibratable.
6. Preserve Google write safety: no silent page-load migration. Any persistent Google Recipe Master update must use the existing verified save/read-back path and be explicit/controlled.
7. Add regression tests proving (a) corrected operational master values, (b) supplier-rate preservation, (c) outlet overrides remain untouched, (d) rollback snapshot exists, and (e) Recipe Master/market-reference coverage remains complete.
8. Run the full Recipe Master standards, market-reference, Google read-back and shard-integrity CI before merge. Merge/deploy only if all gates pass.

Exact next action: inspect `recipe-master*`, seed, Google sync/store and costing integration files to determine the narrowest safe migration point before changing application logic.
