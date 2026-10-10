# Salary packages, assets and daily working capital — 10 October 2026

## Approved scope and pre-implementation review

Owner approved the salary popup and recommendations, government-sourced defaults with labels and permitted increases, then requested an asset master, product-only pricing depreciation and daily working-capital planning. Laptop Codex confirmed. Four review passes are one assistant's separated passes, not delegated agents. Base main4029c5b8cab28a86099f736e9a49deabf0df87de; working branch codex/salary-packages-capital-20261010; recovery/pre-salary-packages-capital-20261010. Older local main and seven owner reference files are preserved.

| View | Business | Software/data |
|---|---|---|
| PRO | Individual salary choices; assets inform investment and product prices; daily funding follows the selected menu. | Extend existing Google module store, THP engine, recipe equipment links and selected-item calculations. |
| CON | Consolidated pay is not a statutory exemption; shared staff/assets must not be charged repeatedly. | Validate eligibility and permitted rates; preserve snapshots, stale checks and protected save/readback. |
| COMPARE & CONNECTIONS | Capital purchase, noncash depreciation and operating cash are distinct. | Google norms/rules -> salary packages -> approved positions -> allocations/prices. Recipe/menu -> assets -> Ideal Price Builder only. Menu/recipes/staff -> working-capital plan. |
| OBSERVER | Missing salaries, quantities, asset costs and funding inputs remain unknown. | New screens have explicit Save; opening never creates operational records. Saved drafts are distinct from accepted outlet plans. |

Government contribution rates and wage limits carry source links and verification dates. Company perks, insurance, leave and bonus costing provisions are not relabelled statutory rates. Consolidated pay can clear optional company provisions; it cannot automatically exempt PF/ESI/leave. Higher voluntary benefits are shown separately where statutory contribution rates are fixed.

Asset master: stable asset IDs per outlet, recipe/equipment associations, owned/planned quantities, reviewed cost/residual/useful-life/operating-days assumptions and explicit product shares. Straight-line economic depreciation for pricing; not a tax depreciation filing. No asset values are invented. Shared asset shares cannot exceed100%. Purchase cash informs capex; depreciation enters only the Ideal Price Builder and does not mutate direct COGS or the expense ledger.

Daily working-capital plan: selected saved items/quantities -> direct production/purchase/packing requirements + current required workforce and reviewed operating funding. Show a daily cost provision separately from cash actually required, accounting for explicitly entered stock coverage, supplier credit, payroll/payment timing, available cash and receipts available before spending. Depreciation and asset purchases are excluded from working capital; asset capex is linked separately. No automatic loan or spending transaction.

## Work mode handover

### LIVE — salary packages, assets and working capital, 10 October 2026

PR62 is merged and live: runtime314f844854cbeb94e84616cc9e26a5f02309031d, Pages38053374157 succeeded. All49 changed runtime files match the live site. Government-reference fields are now connected to the existing Google THP_NORMS record; all30 company parameters are preserved and17 new reference fields passed native/API readback. No real employee salary, asset or working-capital records were saved during verification.

Owner next: open outlet baseline, select required positions, then **Review / edit salary package** for each. Enter THP, review eligibility and company benefits, recalculate and save; return and save the outlet plan. Use **Asset master & capital expenditure** to enter actual machinery assumptions and product shares. Then review today's menu workforce/salaries and open **Daily working capital**. The live outlet currently has no saved mandatory position available for a salary-popup test and its workforce is not current; working capital correctly shows an incomplete staffing message. No total or completion tick was invented. Full popup save/return was tested against isolated Google fixtures.

Live links: https://jothish2000.github.io/BOBS-OUTLETS/outlet-plan.html?stage=baseline&outlet=1 ; https://jothish2000.github.io/BOBS-OUTLETS/asset-master.html?outlet=1 ; https://jothish2000.github.io/BOBS-OUTLETS/working-capital.html?outlet=1 . Backend and records: https://docs.google.com/spreadsheets/d/19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8/edit#gid=111051020 . Owner acceptance pending; implementation/deployment/live verification complete. Earlier entries below are historical checkpoints.


Historical initial checkpoint: implementation started, not deployed. Existing live salary integration from PR58/59 remains authoritative. New design approved; operational data unchanged at this checkpoint. Existing equipment planner reads a legacy recipe master; new asset screen must use BOBS_OPERATIONAL_RECIPES and preserve EQUIPMENT_PLAN as a legacy planning source. Existing Vault19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8 is reused. No competing database or sample employees/assets.

## Codex handover

### LIVE technical continuation — salary/capital release

Current runtime314f844854cbeb94e84616cc9e26a5f02309031d (PR62). Corrected release head a86369a5d64a5a6c26d08edbbcb4246d61750ca0 passed all4 PR checks: Vault38053297461, quantity38053297603, recipe preservation38053297517 and workload38053297493. Pages build/deploy38053374157 passed. Local focused44/44, existing regressions51/51, return15/15, standalone suites and both native browser journeys passed. First quantity CI failure (missing formatter) was fixed before merge. Live49/49 runtime matches;0 JavaScript errors;0 business writes;2 automatic snapshot POST attempts blocked. Salary source/API checked with actual Google norms; no saved position existed for a live popup, so full popup save/return evidence is isolated-browser only.

Google activation: BOBS_MODULE_DATA!G187 preserves the original30-parameter formula and appends payrollRules from HR_STATUTORY_RULES!F2; E187 updated. HR_STATUTORY_RULES gid111051023 stores17 sourced fields, with native JSON readback equality and live rates checked. Backup copy17XQD1h_m11pBIqdtt5p_WirQlIVK8z0lxkYkSeTzIz0 and remote recovery/pre-salary-packages-capital-20261010 (4029c5b) remain available. No restore executed. Reverting code does not restore Google records/formulas. Compare later owner edits before any rollback.

Next work is Owner UAT and real staffing/asset/funding entry, not automatic data creation. Existing legacy salary snapshots require review against changed norms. Maintain both handover sections and the backend index. Preserve the seven pre-existing untracked owner reference files and divergent old local main. Local live evidence: C:/Users/HP/Documents/Codex/2026-10-07/continu/work/capital-live-verification.json and mobile screenshots. This documentation is the portable handover; unrelated chats do not automatically inherit it.


Inspect current sources before each edit. Key owners: bobs-outlet-flow-core.js (salary/positions), bobs-outlet-plan.js (baseline/salary), bobs-item-full-cost.js (Ideal Price Builder), bobs-verified-store.js (protected saves), equipment-planner-core.js (requirement suggestions), BOBS_OPERATIONAL_RECIPES (current recipes). Additive Google module records must preserve existing values. Current tests for this change NOT RUN; deployment/live verification/Owner acceptance NOT RUN. Exact next: implement salary package calculation and popup, add focused regression tests; then asset/working-capital modules and connected read-only pricing integration. Code recovery separate from Google data recovery.

## Implementation checkpoint — verification in progress

Salary, asset and working-capital pages and source validation implemented. One new calculation fixture failure was corrected (test selected the wrong optional component); 11/11 new calculation tests then passed. Existing read/editor/cost regressions: 51/51 passed. Browser verification remains in progress; initial harness issues (popup about:blank timing and transition-snapshot counting) corrected. No test is called passed before successful completion.

Google recovery copy verified: https://docs.google.com/spreadsheets/d/17XQD1h_m11pBIqdtt5p_WirQlIVK8z0lxkYkSeTzIz0/edit . Restore NOT RUN. Added HR_STATUTORY_RULES to existing Vault;17 generated JSON fields read back exactly. Initial whole-number JSON formatting error repaired before activation. Active THP_NORMS source remains unchanged at this checkpoint. No operational salary/asset/funding records created. BOBS_BACKEND rows23–27 record current status for phone continuation.


## Tester findings and second four-view review

- Salary/asset/funding calculations and full-price isolation passed. A ₹36/day machinery allowance changed the fixture ideal price from ₹34.375 to ₹40 while full incurred operating cost remained ₹200.
- Existing read/editor/cost unit group51/51 passed; focused outlet/salary/capital group and standalone handoff/workload/recipe suites passed. Native Edge tests passed salary popup proposal -> parent draft retained -> baseline save, official defaults, consolidated benefit selection, reopen, stale-rule rejection, asset and funding save/reopen,390px layouts. Existing nested recipe -> item -> flow and workforce/salary/roadmap journey passed. All writes were isolated fixtures; no production business writes.
- Initial failures were a wrong component index in a test, missing local JSDOM_PATH, popup about:blank timing, wrong save-button selector and counting automatic transition snapshots as operational writes. Corrected tests then passed. Initial new Sheet helper produced invalid JSON for whole numbers; fixed and read back17 matching fields before activation. The first browser timeout was a harness selector error, not a reproduced application save failure.
- Tests also prompted stronger fail-closed asset evaluation, stable control IDs, a consolidated cash-allowance correction and validation of actual employee packages. Working-capital provenance includes calculated raw-material/packing lines, so purchase/packing changes invalidate saved funding.

| Second view | Evidence / residual limit |
|---|---|
| PRO | Salary popup and Google-backed plans complete the requested costing and funding path; native save/return passed. |
| CON | Rates alone cannot establish employee eligibility, wage bases, local tax or leave/bonus entitlement. These require explicit review. Source changes intentionally invalidate accepted salaries. |
| COMPARE & CONNECTIONS | Tests confirm asset depreciation changes pricing only; capex and cash funding remain separate. Whole-outlet labour is counted once. |
| OBSERVER | No real payroll/asset/funding records were invented. Protected saves are optimistic and capped at45k. Source links are checked as of10 October2026; no automatic statutory-update service is claimed. Owner acceptance pending. |

## Official references and accounting interpretation

- Standard PF12%, eligible reduced category10%, EPS8.33%, EDLI0.5%, administration0.5%: https://www.epfindia.nic.in/site_docs/PDFs/MiscPDFs/ContributionRate.pdf . Administration is a per-person provision; establishment minimum needs separate allocation.
- Revised EPFO ceiling₹25,000 effective17 September2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2313790&lang=2&reg=48 . PIB text was read; linked Gazette PDF itself was not read. Additional official announcement: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310973&lang=1&reg=3 . These pages link EPF/EPS/EDLI coverage to applicable scheme provisions; individual membership is explicitly reviewed.
- ESI employee0.75%, employer3.25%, general eligibility ceiling₹21,000 and daily employee exemption₹176: https://www.esic.gov.in/attachments/publicationfile/b830b6c5a968aae81fdbc3a09e9063fb.pdf . Official portal rounding evidence: https://portal.esic.gov.in/InsuranceGlobalWebV4/ESICInsurancePortal/Documents/consolidated_mc_%26_edit_mc_helpfile.pdf . Covered employees above the general ceiling require continuing-period confirmation. Special eligibility cases require payroll review.
- Wage/coverage context: https://www.labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf . Company basic/HRA/leave/bonus provisions are not universal statutory entitlements.
- Capital purchase/noncash allowance distinction follows cash-flow treatment; the asset price allowance is economic straight-line planning, not tax depreciation: https://www.mca.gov.in/Ministry/pdf/INDAS7.pdf .

## Rollback and limitations

Code rollback: revert this release through Git and redeploy its predecessor; recovery branch points to4029c5b. Data rollback is separate: new proposals/assets/funding records have verified per-record backups when replacing existing records. The prechange full Vault copy above is available for owner-approved recovery. No restoration test or destructive restore was run. Reverting code does not undo saved records or the Google THP_NORMS formula. Restore only the intended record/formula after comparing later owner edits; never replace the whole live Vault automatically.

Google Sheet formula/value/format QA used bounded API reads, wrapped rows, frozen headers and a hidden JSON helper column. No authenticated rendered-Sheets screenshot inspection was available. Browser fixtures and mobile app screenshots were inspected separately. Deployment and live verification were pending at that historical checkpoint; see the current LIVE handovers above.
PR62 first quantity CI run failed because salary-editor.html omitted the shared formatter script. Added the existing formatter; no quantity or salary arithmetic changed. The failure is retained as evidence and the revised head must pass before merge.


## Final release review and Owner acceptance

One assistant's final PRO/CON/COMPARE/OBSERVER passes: the requested pages are live and Google-connected; no required personal eligibility/asset inputs were guessed; machinery pricing stays separate from operating cost and cash funding; incomplete real staffing stays visibly incomplete. All four corrected-head PR checks and Pages passed. Live read-only verification found no JavaScript errors and wrote no business records. Code, API source and local/native checks complete. Owner acceptance and real business data entry remain pending.

Google backend index rows23–27 link the live pages and this release report; the dual handover URLs remain the canonical continuation entrypoints. No download or manual replacement is needed to use these live pages.
