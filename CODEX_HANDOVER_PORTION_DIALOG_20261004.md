# BOBS portion-review dialogue — laptop continuation

Owner requested implementation from mobile, with contemporaneous 111QS5PVDDRT/WACP documentation. Full chronological entries are in CODEX_HANDOVER_111Q_CURRENT.md under 4 October 2026. Read AGENTS.md and OVERALL_DESIGN_MASTER_111Q.md before continuing.

## Implemented locally
Branch: codex/portion-review-dialog-20261004.
Baseline/recovery: 3edff461c57952cda98c6bdb05c9105a8719840c; local branch recovery/pre-portion-dialog-20261004.

recipe-production-editor.js now opens a native modal at the existing calculate-first guard (early checkbox/Space/Enter, early Save, Go to reference). It explains reference cooked grams, intended cooked grams, why Calculate determines ingredients, current intended quantity, then section1 manual review. Review/Close/Escape returns to the existing highlighted reference and Calculate focus. No automatic calculation/confirmation/save. No load/typing popup. Native modal with bounded responsive scrolling. Recipe HTML cache key and in-page guide updated. Existing Chrome regression extended; isolated DOM test and CI entry added.

Google BOBS Standard first, audited fallback, METHOD2 recipeOverrides and verified saves are unchanged. No operational Google writes or migration. Do not reset records or undo the earlier packing repair. Other outstanding backend/capacity/backup/legacy issues remain out of scope.

## Evidence and limits
- IMPLEMENTED / CODE CHECKED: YES, locally.
- AUTOMATED TESTED: quantity formatting/availability/script syntax, recipe UX static checks,19 connected cost-flow/selling-price tests PASS. Real-editor DOM integration PASS for blocked pointer/keyboard/save/navigation, dismissal focus, no unintended writes/calculation/input changes,100g explicit scale and480 target relock.
- BROWSER TESTED: BLOCKED locally; Chrome absent and browser download returned invalid archive. DOM test stubs native dialog platform methods and is not visual/accessibility proof. Existing scripts/verify-production-save-guidance.cjs covers1366/615/390px; must pass in Chrome/CI.
- PUBLISHED / LIVE VERIFIED: NO. Automatic approval review rejected GitHub push because explicit publication authorization was not present. No alternative publishing route attempted.
- OWNER UAT: PENDING. No claim of laptop/repository synchronization.

## Exact next actions
1. Obtain explicit Owner approval to publish this change. Do not interpret the rejected push as successful.
2. Fetch latest remote main and compare with baseline; retain concurrent changes. Apply provided patch to baseline/new branch if this local branch is unavailable. Inspect changes before committing.
3. Run node tests/portion-review-dialog.cjs with jsdom26.1.0 installed; run scripts/verify-production-save-guidance.cjs with Playwright1.58.2 and Chrome available. Require native browser PASS before merge. Review resulting CI and repair/retest any failures under WACP.
4. Once authorized, publish branch/PR through normal repository workflow, merge only after checks, verify Pages deployment and served source; update full handover with real commit/run IDs and statuses.
5. Mobile UAT: open linked Idli recipe page with qty360; attempt review checkbox before Calculate; read dialogue; press Review portion sizes; inspect both weights; Calculate; return to section1 and tick manually. Check Close/Escape on desktop. Only save if the intended real recipe values are correct.

URL: https://jothish2000.github.io/BOBS-OUTLETS/recipe-cost-editor.html?item=Idli&outlet=1&qty=360&cat=Breakfast+Catalogue&i=0

Rollback: surgically revert this dialogue/cache/guide change against baseline; never restore or erase Google data as code rollback.
