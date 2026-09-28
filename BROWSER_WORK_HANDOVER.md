# BOBS browser Work handover

Prepared for Jothish Babu Sadasivam on 28 September 2026. This document is sufficient to orient a new development session without the Codex conversation. Read it together with the source snapshot and the current repository handover.

## Current result and release boundary

The approved query1 implementation is finished and tested locally. The normal path now connects Idli production, required workforce, Reverse THP salary planning, daily labour, other operating-expense allocation and full-cost ideal pricing. No real Google operational records were edited during testing.

Implementation commit: `515148bb24c46ad58ef7950ad9f268dc44e0522b`.

Repository: https://github.com/jothish2000/BOBS-OUTLETS

Continuation branch: `codex/query1-guided-cost-flow`.

Branch URL: https://github.com/jothish2000/BOBS-OUTLETS/tree/codex/query1-guided-cost-flow

Source recovery baseline: `e83d940d7b45d023316924965568aa74072acfde`, also protected locally as `recovery/pre-query1-20260928`.

The query1 changes have NOT been merged into main or deployed to GitHub Pages. The published site therefore remains the preceding version. Local test success is not live verification or Owner acceptance. Before an Owner live test, review this branch, obtain the release decision, merge/publish it, confirm deployment and verify the served files. Do not begin new feature development by cloning main and overlooking this branch.

Live site: https://jothish2000.github.io/BOBS-OUTLETS/

Local checkout used for this work: `D:/BOBS-OUTLETS`. The browser session does not need that path if it has the source package or repository access.

## Start the next session with this prompt

Continue BOBS from the attached source snapshot and BROWSER_WORK_HANDOVER.md, using 111Q = 111Q5PVDDRT. First read AGENTS.md, OVERALL_DESIGN_MASTER_111Q.md and CODEX_HANDOVER_111Q_CURRENT.md fully. Inspect the current source and compare the continuation branch codex/query1-guided-cost-flow with main before editing. The query1 implementation is commit 515148bb24c46ad58ef7950ad9f268dc44e0522b; do not replace it with older main. Preserve Google-backed records, the shared Recipe Master, historic catalogue indices and code/data rollback separately. The approved implementation has passed its new local tests but is not deployed or Owner accepted. Summarize the actual release boundary, then help complete the release and numbered Owner retest before new development. If you cannot access GitHub, tools or Google data, use the attached source and state the specific limitation rather than inventing a successful read/write. Keep the handover updated during work and return an updated source checkpoint and handover before the session ends. Future development should not rely on a previous conversation or a laptop-local cache as the source of truth. Do not remove legacy localStorage or migrate data without an inspected and approved migration plan.

## Owner requirements and governance

The Owner supplied seven query1 requests: clarify the UUWP denominator and monetary base; preserve earlier recipe references; present reference quantities and intended production side by side with portion-size choices; explain staffing position reuse and shared preparation; use exact visible link labels; save covered normal workforce before salary calculation; and connect monthly salaries, daily labour, fixed expenses and ideal price.

The Owner approved the implementation and subsequently requested this portable handover for future browser Work development. Current task scope did not authorize a project-wide storage migration. The Owner uses the laptop. Do not repeat the device question unnecessarily within this continuation.

The repository master is version 3.1 dated 27 September 2026. Canonical 111Q is 111Q5PVDDRT: PRO, CON, COMPARE AND CONNECTIONS, OBSERVER and OWNER; developer continuity; dual business/software review; Tester stage; second review using actual results. This work used one assistant's separated reviews, not independent agents. The older owner-supplied master is preserved in the bundle for history; apply the current repository version and latest explicit Owner decisions when they supersede older notation.

Before another material change: inspect current code/data owners, explain the compact four-view review and dependency map, obtain the necessary scope decision, preserve recovery, implement, test and feed results back for Owner acceptance. Keep a running ledger, not an end-only summary. Never label a failed or unrun test passed.

## What changed

1. UUWP now shows actual leftovers as `70 unsold / 360 produced x 100 = 19.44%`, and explains that the percentage applies to Pricing COGS after spoilage. Existing UUWP mathematics was preserved. It was not silently replaced by the different 70/290 full-recovery uplift.
2. The outlet recipe editor displays intended production on the left and the preserved reference on the right. It supports 40, 45, 50, 55, 60 g and custom portion weights; a verified reference portion weight is required for size scaling. It does not assert that 50 g or a 120-piece batch is universally certified industry data.
3. A saved reference yield of 50 and an older guide yield of 120 can both be inspected. The user chooses which checked reference to use. Scaling into an outlet production plan does not replace the company reference. Existing guide ingredients and saved ingredient rates are retained as their respective sources; guide-only ingredients remain visible for explicit review.
4. Recipe quantity and portion changes require recalculation and confirmation. Food scales with quantity and portion weight; energy initially scales with reference batch count and remains editable for actual equipment use. Recipe yield, output target and steamer capacity remain different concepts.
5. Workload reload refreshes quantities from saved Method 2, correcting stale saved 15-piece plans when the current production is 360. Timings and position assignments are retained where appropriate. Assigned staff position and shared preparation batch name have explanations. Repeated shared keys are blocked for consolidation, instead of silently dropping a workload row.
6. Idli staffing saves the covered workforce before a salary amount is known. Staff Master shows Cook1 and Helper1 as required positions, distinct from actual employees. An emergency scenario does not silently erase the regular Helper salary requirement. Normal coverage is the first test; emergency backup is separate.
7. Reverse THP accepts desired take-home, employee deductions and employer additions as explicit monthly amounts. Employer cost equals all three; no statutory rates are invented. Existing employees use saved Staff Master CTC and HR outlet allocation. Product shares are explicit; the same employee cannot fund two positions in the plan.
8. Daily salary uses the actual calendar days in the business date's month: 28, 29, 30 or 31. This applies to the new guided cost flow and updated Staff/expense screens; it is not a claim that all older BOBS screens have been migrated.
9. Every other saved daily expense requires an allocation choice or an exclusion with a reason. Rent can be allocated; recipe LPG, energy and packing must not be charged again. Unknown expenses or salary inputs block completion instead of being guessed as zero.
10. The item editor has section 06 Full-cost Ideal Price Builder, after section 05 Direct-cost pricing provisions. It shows direct incurred cost, regular labour, additional support, other expenses, total cost, cost per produced unit, recovery cost per sold unit and suggested selling price. Stale quantity/date/recipe/salary/expense sources block an outdated final plan.
11. Changed saves use backup, fresh-source comparison and readback. Shared Recipe Master edits stage verified immutable chunks before switching the manifest. The existing staffing-status bridge syntax error was repaired. No automatic reseed or operational data correction runs on page load.

## Data ownership and formulas

Shared reference: COMPANY / RECIPE_MASTER / STANDARD_V1, with RECIPE_MASTER_CHUNKS when sharded. The guide seeds are reference material, not an operational backup.

Outlet production adjustments: outlet / METHOD2 / default / recipeOverrides. These store an explicitly reviewed outlet recipe and its shared-reference fingerprint. The shared reference remains authoritative and a changed fingerprint requires review. All Method 2 calculations use the effective recipe through method2-core.js. Overrides are not copied into every saved item draft.

Production quantities and sales: outlet / METHOD2 / default. Historical catalogue indices are preserved.

General workload timings: outlet / WORKLOAD_PLAN / default. Guided required workforce and salary allocations: outlet / WORKFORCE_PLAN / default. Older manual/emergency records: outlet / IDLI_SUPPORT / default. New guided readers take precedence when a workforce plan exists; the old path remains for compatibility.

Actual employees: COMPANY / STAFF_MASTER / default. Employee outlet shares: COMPANY / HR_OUTLET_ALLOCATION / default. Required positions are not fictitious employee records.

Other outlet daily expenses: outlet / FIXED_EXPENSES / default. No example rent, EB or LPG amounts are silently inserted for a missing record. Real employee expense totals stay separate from unfilled-position planning budgets. Allocation does not post a duplicate salary or expense to outlet accounts.

For an unfilled position: monthly employer cost = desired take-home + employee deductions + employer additions. Daily allocated labour = monthly employer cost / calendar days x Idli share. For an existing employee, also apply that employee's authoritative outlet allocation.

Full incurred cost = direct incurred production/sides/packing + allocated regular labour + allocated additional support + allocated other expenses. Per-produced cost divides this by produced quantity. Recovery per sold divides by sold quantity.

Full pricing base = existing direct pricing COGS after spoilage and UUWP + (allocated labour + support + other expenses) / sold quantity. Apply markup once, or divide by (1 - target margin). This preserves the existing direct-cost pricing policy; it does not add a second leftover-recovery surcharge. Zero sold cannot produce a valid price through division by zero.

## File map

- bobs-cost-flow.js: pure scaling, calendar, salary, allocation, fingerprints and full-cost formulas.
- bobs-verified-store.js: checked reads, backup/readback, stale-baseline guards and sharded recipe save.
- recipe-production-editor.js and recipe-cost-editor.html: outlet two-column reference/production screen.
- recipe-cost-editor.js: shared editing with verified sharded persistence and blank-input validation.
- method2-core.js: effective outlet recipes in the existing calculation owner; preserve commercial and packing rules.
- method2-item.js, method2-item.html and bobs-full-cost-reader.js: links, transparent UUWP and full-cost display.
- workload-planner.html, workload-core.js and workload-idli-bridge.js: source quantity refresh, labels, shared-batch protection and status bridge.
- idli-staffing.js and idli-staffing.html: coverage before salaries, required-position save, legacy flow retained.
- staff-required-positions.js and staff.html: show requirements separately from actual staff and calendar-day employee cost.
- reverse-thp.html and reverse-thp.js: salary inputs, existing-employee linkage, expense decisions and verified workforce costing.
- fixed-expenses.js and fixed-expenses.html: actual daily expenses, calendar staff costs, verified saves and return link.
- tests/query1-cost-flow.cjs and tests/query1-browser.cjs: new automated tests. The browser test uses isolated fake Google records and never real operating records.

## Actual test evidence

PASS: 11 new rule/persistence tests covering scaling, calendar months/leap year, explicit salary amounts, linked employee versus unfilled budget, duplicate employee rejection, expense decisions, stale sources, full-price arithmetic, duplicate shared-batch protection, backup failure, stale save and sharded recipe integrity.

PASS: full desktop Chrome flow with Idli plus production sambar and coconut chutney; preserve shared yield 50, explicitly use guide yield 120, calculate output 360; workload old 15 becomes 360; save covered workforce; Staff Master displays two required positions and zero fake employees; salaries 26000 and 13000 with explicit zero deductions/additions; September daily labour 1300; rent allocation 100; recipe LPG excluded; final price rendered; salary reload; expense save; stale expense and stale quantity blocks; zero browser runtime exceptions. Screenshots of recipe, salary and item screens were visually inspected.

PASS connected suites: test-idli-support.cjs; recipe standards (91 eligible catalogue recipes, 104 total recipes/condiments); recipe-master-sync.cjs; recipe-master-shards.cjs; method2-order-recovery.cjs; method2-selling-price.cjs (7 tests); equipment-planner-persistence.cjs (8 tests). Changed source syntax and git diff whitespace check passed.

Historical failures reproduced unchanged against both this implementation and baseline e83d940: method2-commerce.cjs line 22 expected 14, actual 26.222222222222225; method2-component-packing.cjs line 7 expected soldCost 17.9; method2-reconciliation.cjs line 21 expected false, actual true. These are not passing tests. They concern older expectations/rules and need a separate current-rule review; do not alter commercial formulas merely to make stale assertions green.

NOT RUN: live Google write/readback using real records, deployed query1 browser test, mobile UAT, every historical test, whole-project localStorage migration. Owner UAT acceptance is pending.

To reproduce the new checks: run `node --test tests/query1-cost-flow.cjs` and `node tests/query1-browser.cjs` from the repository root. The browser test needs Playwright and a compatible browser already provisioned in that environment. It uses Chrome on Windows and default Playwright Chromium elsewhere, with PLAYWRIGHT_PATH and BOBS_BROWSER_CHANNEL overrides. It writes screenshots only to ignored .tmp-query1. Do not make a failed environment setup look like a passing browser test.

## Numbered normal-flow retest

These steps apply to the new version after publication or an explicitly identified test preview. Do not test the old live site and assume missing controls are a new failure.

1. Open the updated BOBS site on the laptop and hard-refresh with Ctrl+Shift+R. Confirm the new version before editing real data.
2. In Method 2 select Idli and click Save & return to Method 2.
3. Open the Idli item editor. Choose Production Mode — Recipe Master.
4. Set Quantity per production batch to 120 and Number of production batches today to 3 for the intended 360-piece scenario. Keep equipment capacity realistic.
5. Enter SOLD TODAY as 290. Review the selected sides and their actual portion quantities and packing. Click SAVE THIS ITEM and wait for confirmed storage.
6. Click Idli – recipe & cost. Confirm Intended output quantity is 360 on the left.
7. On the right inspect Current saved Recipe Master and Preserved BOBS small-outlet reference. Choose the reference you have verified. A 50-versus-120 discrepancy is shown; no automatic restoration occurs.
8. Check Reference recipe yield. For a 120-piece reference and intended 360, the quantity factor is 3. A reference yield is not a steamer tray count.
9. Choose Intended cooked portion weight (g). Enter the verified Reference cooked portion weight (g). Do not assume 50 g without checking the recipe basis.
10. Click Calculate quantities from reference. Check rice, urad, every other ingredient, fuel quantity and rates. Changes to the target or reference require recalculation.
11. Tick I checked reference yield, portion assumptions, ingredient rates and energy use.
12. Click Save outlet production recipe & return to item. Wait for Outlet recipe saved and verified, then click Return to Method 2 item.
13. Review direct Actual COGS. For 360 produced and 290 sold, section 05 must show 70 / 360 and 19.44%, plus its monetary application base. Your direct cost depends on all saved ingredients, sides and packing.
14. Save the item if you changed any inputs. Return to Method 2 and click Workload & staffing plan.
15. Confirm Planned qty is 360. Review timing and equipment fields. Assigned staff position may be Cook1; the same position can only be reused when its timeline supports that use.
16. Leave Shared preparation batch name blank for ordinary Idli work. Use it only for a genuinely shared physical preparation batch, consolidated into one workload.
17. Click Calculate staffing. Then click Idli recommended team, emergency support & labour cost →.
18. Check Business date, Idlis produced, Steamer capacity, First batch ready and All parcels ready by. Review real side cooking/preparation/portioning/washing times. Do not enter zero merely to clear a warning.
19. Keep both the Cook and Helper checked for the normal test. Review all chronological duties and deadlines. Correct uncovered duties or unrealistic timings before continuing.
20. Tick the practical-review confirmation under section 4 only after the schedule is workable. In section 5 click Save covered workforce & continue to Staff Master.
21. In Staff Master inspect Required positions from approved workforce plans. Cook1 and Helper1 should appear there. The actual Staff list may still contain zero employees; that is not a lost workforce requirement.
22. Click Set salaries with Reverse THP & allocate full cost →.
23. For each unfilled position enter desired monthly take-home, employee deductions and employer additions, including explicit zero where applicable, plus the percentage allocated to Idli. For an existing employee select that employee and verify their saved CTC and HR outlet share instead.
24. Inspect daily cost. In September, example salaries 26000 and 13000 with no additions and 100% Idli allocation total 1300/day. These are test examples, not instructions to overwrite your real salary data.
25. Click Open outlet expenses if actual rent, EB or other daily costs are missing. Enter real amounts per day and click Save Expenses to Google. Wait for verified success.
26. Return to Reverse THP and click Reload saved expenses. For every row choose Allocate to Idli with its percentage and no-double-count confirmation, or Already counted / exclude with a reason. Exclude energy/packing already included in the recipe or packing calculation.
27. Review the full cost and price in section 4. Tick I reviewed salary, product shares and exclusions so each cost is counted once.
28. Click Save salaries, allocations & full-cost plan. Wait for the saved-and-read-back confirmation.
29. Click Open Idli full cost & Ideal Price Builder →. Inspect section 06 and compare direct cost, labour, additional support, other expenses and full-cost ideal selling price.
30. Reload and confirm the saved values persist. Record actual screen results before declaring acceptance. Do not count a stale or incomplete result as passed.
31. Only after the normal case passes, test Build emergency backup plan separately, including availability, coverage and additional payment. Restore regular team before leaving the normal baseline unless an emergency scenario is the intended saved plan.

## Post-test four-view review

PRO: The formerly broken workforce-to-salary transition now reaches a full-cost Idli price in the browser fixture. The shared recipe reference survives outlet scaling. CODE consequence: existing Method 2 calculations are reused instead of a separate competing recipe engine.

CON: Live persistence and Owner UAT remain unverified; three historical tests still fail. Reference weights, yields, salaries and rates require real business confirmation. CODE consequence: optimistic rereads and verified backups reduce overwrite risk but are not a server-side atomic compare-and-swap guarantee; oversized records are blocked rather than truncated.

COMPARE AND CONNECTIONS: Before, workload could show stale 15 and Staff Master had no carried requirement or salary transition. After, current production feeds saved required positions, salary planning and explicit expense allocation. CODE consequence: the new WORKFORCE_PLAN coexists with legacy IDLI_SUPPORT, while real employees, outlet expenses and shared references remain distinct owners.

OBSERVER: Exact navigation labels and save confirmations are documented. Required positions are clearly different from employees; pricing provisions are different from incurred costs. CODE consequence: browser load/runtime, save/reload and stale-data checks were exercised with fake records; this is not live verification.

OWNER: Release and normal-flow UAT are the next decisions. Future storage work must be reviewed separately rather than mixed into release of this completed flow.

## Continuity without a laptop cache

The new recipe/workforce/salary/expense data paths use Google records as durable owners. Source code belongs in the repository and portable snapshot. A conversation is not the source-code archive or database.

Legacy localStorage compatibility code still exists elsewhere, including Method 2 cache mirrors and older screens. It was not deleted or globally migrated. Current Staff navigation now points to the Google-backed fixed-expenses screen; old outlet-costing.html remains legacy code. A later storage audit should search localStorage, sessionStorage and IndexedDB; identify each reader/writer, durable owner and unsaved draft; preserve recoverable values; migrate only after verification; and test every connected reader before removal. Do not clear browser storage as a cleanup shortcut.

At every future checkpoint, write the branch/commit, changed files, data effects, tests actually run, release state, rollback and exact next command into CODEX_HANDOVER_111Q_CURRENT.md. Save/push the source or return an updated archive before ending the session. If credits stop, the next session starts from those artifacts. Uploading this package provides context; it does not automatically grant repository write permissions or access to Google records.

## Recovery and outstanding work

Code rollback: compare with baseline e83d940 and surgically revert the query1 implementation only after preserving newer work. Do not reset an unrelated branch or replace the whole repository.

Data rollback: separate from code. Changed saves create module-specific *_BACKUPS records. Shared recipe saves preserve the old manifest and verified immutable chunks. The source archive contains no Google database export; do not treat it as a backup of live payroll or operating data. Restoration needs inspection of the current Google record, its verified backup and an explicit Owner decision.

The packaged source is a snapshot, so compare it with current GitHub before resuming. Preserve the four owner-provided untracked documents in the local checkout; the package includes the relevant text masters without treating them as a reseed source.

Next executable development action: inspect this continuation branch and main, reproduce the new tests in the available environment, then complete the approved release decision and deployment verification. Run the numbered Owner normal-flow test next. Future work after acceptance includes a separate legacy-storage audit, review of the three historical failing tests, and any new workforce/equipment capabilities requested by the Owner. Do not claim that whole-outlet staffing optimization, automatic statutory payroll calculation, or all-product workforce salary planning were implemented here; the guided workforce/salary pilot is Idli, while the recipe reference/production editor framework is reusable across recipe-linked items.
