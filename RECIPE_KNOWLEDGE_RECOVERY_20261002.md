# Google recipe knowledge preservation — 2 October 2026

## Current execution status
Live initialization run37046744914 succeeded on 2 October 2026 with full-content readback: 103 records in each of the three layers, historical104 recipes preserved, and Idli yield120/1.6kg rice confirmed. Twelve raw historical recovery records and eight complete calibrated-library archive chunks were verified. Independent verification and live browser read are pending.

## Data owners
The existing Google Data Vault spreadsheet remains authoritative. Logical records are stored in its BOBS_MODULE_DATA worksheet, under COMPANY:
- RECIPE_MARKET_EVIDENCE: researched evidence labels, URLs and provenance.
- RECIPE_CALIBRATION: BOBS batch/yield decisions, confidence, basis and calibration notes.
- BOBS_STANDARD_RECIPE: calibrated operational recipes, including ingredients, quantities, units, prices and recipe metadata.
- RECIPE_MASTER / STANDARD_V1 and RECIPE_MASTER_CHUNKS: historical data, preserved as history, never an operational fallback.
Outlet METHOD2 records and recipeOverrides are separate and are not written by this initialization.

The calibrated library has 103 unique references: 20 directly calibrated and 83 family checked. Family-checked references are not represented as individually proven production measurements.

## Google recovery location
Module: RECIPE_KNOWLEDGE_BACKUPS
Recovery key: PRESERVE_20261002_37045857257

On successful completion its BOBS_RECIPE_PRESERVATION_V1 index identifies:
1. legacyCopies: complete nested raw historical manifest and chunks, including unrecognized fields.
2. referenceCopies: complete calibrated source-library records before historical prices are overlaid.
3. knowledgeManifests: exact manifests pointing to the fully verified evidence/calibration/standard chunks.
4. previousManifests: the inspected empty active state before initialization.

The original historical records are retained. New chunk keys are unique and old copies are not removed. A partial interrupted attempt may have individual copies without the final index; inspect the actual inventory rather than interpreting this as completion.

## Verification and recovery procedure
Read current main, AGENTS.md, OVERALL_DESIGN_MASTER_111Q.md and CODEX_HANDOVER_111Q_CURRENT.md.
Run the read-only verification script once its publication result is recorded. It compares full saved content and reconstructs all three layers from archived references plus preserved historical records, rather than trusting only counts.
Before any restoration, compare the current active pointers and preserve newer records. Restoration is a separate Owner-approved operation; never blindly rerun initialization or move an active pointer to an older version.
The initializer blocks existing active or partial knowledge. The initial-publication page also blocks those states. Complete saved recipes must use a separately reviewed revision process.

## Limits
Client rereads are optimistic checks, not an atomic cross-device lock.
Copies in the same spreadsheet protect against ordinary recipe-update/republication loss; they are not an independent backup against deletion or loss of access to the entire spreadsheet.
Evidence records preserve source descriptions and links, not copies of external publishers' complete articles.
Source-code rollback does not restore Google data. Keep code and data recovery separate.
No backend Apps Script deployment or fractional-capacity repair is part of this work.
