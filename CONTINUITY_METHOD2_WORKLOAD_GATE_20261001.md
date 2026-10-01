# Method 2 → Workload & Staffing flow gate — 1 October 2026

## WACP intent before implementation
Owner observed that after completing Idli production setup/packing and saving, embedded Method 2 returned to the summary and the Page Guide incorrectly instructed the user to use the outer `Save & Continue`, bypassing the intended Workload & Staffing stage.

Recovery baseline: `main` at `68de30585edb936b159c3ac10a4afc708bf1bb71`.
Working branch: `chatgpt/method2-workload-gate-20261001`.

Material actions intended:
1. Inspect Method 2 summary/Page Guide, outer flow Save & Continue gate, and WORKLOAD_PLAN persistence/completion semantics.
2. Change the embedded Method 2 guide so once selected items + shared packing are complete, production menus advance to **Workload & Staffing** instead of prematurely telling the user to finish Method 2.
3. Add a real completion gate: if one or more selected items are in Production mode, outer Method 2 Save & Continue must remain blocked until a saved Google WORKLOAD_PLAN is owner-reviewed, calculation-complete, and covers the current production items/quantities.
4. Do not require workload planning when all selected items are Purchased mode.
5. Make workload save notify the Method 2 summary so it can refresh automatically; keep manual Reload Google records as fallback.
6. Preserve all existing Method 2 item/packing review checks and Google-first behavior. Do not alter recipe, pricing, Recipe Master, Method-2 quantities, staffing calculations, or operational data automatically.
7. Add focused regression tests for: production blocked without workload, production allowed with matching owner-reviewed workload, stale quantity blocked, and all-purchased flow allowed without workload.
8. Run the relevant Method 2/workload tests and connected audits before merge. Record result immediately after testing.

111Q pre-implementation review:
- PRO: restores the intended guided sequence and prevents accidental completion before staffing analysis.
- CON: a gate can frustrate users if it cannot explain exactly what is missing; therefore the guide/status must identify Workload & Staffing and provide a direct link.
- COMPARE/CONNECTIONS: Method 2 remains owner of menu/mode/quantity; WORKLOAD_PLAN remains owner of production timing/staffing analysis. The gate only verifies consistency; it does not duplicate staffing calculations.
- OBSERVER: the screenshot shows item setup is complete but flow state is not operationally complete because workload/staffing has not been reviewed.
- OWNER: explicit instruction is to rectify the flow.

## RESULT after first implementation/test pass
Implemented a separate `method2-workload-gate.js` rather than embedding the new logic inside `method2-list.js`; this keeps existing item/packing calculations untouched and makes the gate independently testable.
- Production requirements are derived from the current saved Method 2 production-mode items and `batchSize × batches` quantity.
- Purchased-only menus bypass workload gating.
- Production completion requires a Google `WORKLOAD_PLAN/default` with `review.ownerReviewed === true`, no `calculation.complete === false`, and a matching workload profile/quantity for every current production item.
- Missing, unreviewed, incomplete, stale or quantity-mismatched workload plans force the Page Guide to **STEP 3 — Workload & Staffing** with a direct planner link.
- A matching reviewed workload changes the guide to **STEP 4** and allows the outer Method 2 flow to finish.
- `method2-flow-review.js` now applies both the original item/packing review and the workload gate before outer `Save & Continue`.
- The gate refreshes from Google on initial load, frame focus, and on any future `bobs-workload-plan-saved` message. Because the current workload page does not yet emit that message and this narrow fix intentionally avoids rewriting its large inline implementation, the safe fallback is automatic refresh when the Method 2 frame regains focus plus another gate refresh when Save & Continue is attempted; the existing “Reload Google records” remains available. This supersedes the original intent to edit workload save solely to emit a notification.

Focused CI result on run `36808252344`:
- `tests/method2-workload-gate.cjs`: **5/5 PASS**.
- `node --check method2-workload-gate.js`: **PASS**.
- `node --check method2-flow-review.js`: **PASS**.
- Existing `tests/method2-workspace.cjs`: did **not execute** because that historical test hardcodes `C:/Users/HP/.../playwright`, which is unavailable on the Linux GitHub runner. This is an environment/dependency failure before any browser test logic ran, not a Method 2 gate failure.

## WACP intent before CI adjustment
Adjust only the new CI workflow so the historical Playwright-dependent workspace test runs when its required Playwright module is available and otherwise reports a clear skip; do not weaken the new five gate assertions or syntax checks. Then rerun the gate CI. If green, inspect the branch diff and merge through a PR, then verify Pages deployment.

## RESULT after CI adjustment
GitHub Actions run `36808338708`: **SUCCESS**.
- Focused Method 2 workload gate tests: **5/5 PASS**.
- Changed browser-script syntax checks: **PASS**.
- Historical `tests/method2-workspace.cjs` is dependency-aware: it runs only when Playwright is installed; on the Linux runner it is explicitly skipped rather than falsely reported as a product failure.

111Q post-test review:
- PRO: production-mode Method 2 can no longer finish after item/packing setup alone; Workload & Staffing is now a real required stage.
- CON: the workload tab currently does not emit a dedicated save event, so the gate relies on Google refresh on frame focus / attempted continuation and the existing manual reload fallback. This does not weaken data safety but may require one reload in some browser focus patterns.
- COMPARE/CONNECTIONS: purchased-only menus retain the shorter flow. Production menus are checked against the saved production quantity so a stale staffing plan cannot satisfy completion.
- OBSERVER: no recipe, COGS formula, Recipe Master, selling price, outlet Method-2 value, or Google operational record is automatically modified by this release.
- OWNER: requested flow correction is implemented.

## WACP release intent
Next material action: inspect branch-vs-main changes, open a focused PR, merge only if the diff contains the intended gate/guide/tests/continuity changes, then verify merged CI and GitHub Pages deployment. Live owner UAT should confirm that the screenshot state now shows **STEP 3 — Workload & Staffing** and blocks outer `Save & Continue` until the matching owner-reviewed workload plan is saved.