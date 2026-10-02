# IDLI OWNER RETEST GUIDES PUBLISHED — 29 September 2026
Owner explicitly approved uploading the two HTML guide files to the public BOBS repository. Commit 70e27a130bbf882428193d20c3b4d417e65db739 changed only method2-item.html and recipe-cost-editor.html. Pages deployment #665 (run 36515114220) succeeded. Read-only live Idli item loaded Google data; its collapsible guide displays steps 1–5/13 and 360 produced/70 leftover. The Idli recipe link opened the recipe page, whose collapsible guide displays steps 6–12 and preserved saved yield 50 versus guide yield 120. Static markup/labels and diff checks passed. No operational Google writes. Owner input/save UAT and mobile confirmation are pending. PRO: guide is visible; CON: save not tested; COMPARE: no calculation or data migration; OBSERVER: follow actual Owner results before acceptance. Recovery code baseline 232f520; Google backups separate. Next: Owner follows the in-page normal flow and reports any deviation, then proceeds to handover steps 14–31.

---

# QUERY1 RELEASE STATUS — 28 September 2026, Browser Work
Owner approved publication in conversation. PR #2 merged the three query1 commits, including final source 612719bc, into main as merge commit 7c27767fd4ed92cd7643e8751f70b54c0e15e53f. Pages workflow run 36463118723 completed successfully; Recipe Master standards audit run 36463119345 completed successfully. Local rerun: query1 12/12, selling price 7/7, equipment persistence 8/8 PASS. Fresh isolated browser fixture BLOCKED by absent Playwright Chromium. Read-only deployed Idli editor loaded Google-backed 360 produced/290 sold and showed UUWP 70/360=19.44%, no save. One served recipe-production-editor.js matched the source snapshot byte-for-byte; full served-file audit NOT RUN. Live Google write/readback and Owner numbered UAT NOT RUN. No business records were edited. Code recovery baseline e83d940, continuation branch retained. Data recovery requires inspecting module backups separately. Next exact step: Owner performs numbered normal-flow retest in BROWSER_WORK_HANDOVER.md on the published site, records observed values; repair any failures before new development. Post-test 111Q: PRO release and read-only load observed; CON real persistence/mobile acceptance outstanding; COMPARE source merged without schema migration; OBSERVER no live-save claim; OWNER publication approved, UAT decision pending.

---

# BROWSER WORK HANDOVER READY — 28 September 2026

Owner has decided to continue future development in browser Work. Initial query1 implementation 515148bb24c46ad58ef7950ad9f268dc44e0522b plus the final native-unit link correction are on codex/query1-guided-cost-flow. Use the latest branch or final package SOURCE_MANIFEST.json sourceCommit. Implementation is finished and locally tested. Read BROWSER_WORK_HANDOVER.md and START_HERE_BROWSER_WORK.md for portable startup, complete file/data map, test evidence, numbered retest and remaining release boundary.

IMPLEMENTED / CODE CHECKED / NEW AUTOMATED TESTS / DESKTOP BROWSER TEST: PASS. Twelve new tests; complete Idli+sambar+chutney browser workflow, salary reload, verified expense save, stale quantity/expense blocks, zero runtime errors. Connected passes and three baseline-reproduced historical failures are recorded in the portable handover. Existing main/live release e83d940 was not changed. QUERY1 DEPLOYMENT / LIVE GOOGLE WRITE / OWNER UAT: NOT RUN / PENDING. No operational Google writes, no global localStorage migration. Recovery e83d940 remains intact.

Post-test review (single-assistant passes): PRO—observed source-to-full-price flow works; CON—live persistence, reference calibration and old regression failures remain; COMPARE—new WORKFORCE_PLAN requirements and salaries extend existing METHOD2 without inventing employees or duplicating expense owners; OBSERVER—exact labels and truthful test/release boundaries preserved. Owner release/UAT are next decisions. Do not continue new features on older main without importing this branch.

Next executable step: open continuation branch or attached source, compare main, reproduce checks, complete release decision and deployment/source verification, then numbered Owner normal-flow retest. Keep code rollback separate from Google backups. Future storage removal requires its own inventory, migration review, verified backups and connected tests.

---
# ACTIVE IMPLEMENTATION — 28 September 2026: Owner query1 approved
Owner approved necessary changes after seven-point query review. Baseline e83d940; preserve existing untracked owner documents and Google records. Single-assistant PRO/CON/COMPARE/OBSERVER review presented in chat; scope approved by Owner.
INTENT BEFORE IMPLEMENTATION: (1) explicit UUWP numerator/denominator and rupee base; (2) dual-column shared reference versus outlet production recipe, portion size and proportional ingredients without rewriting shared reference; (3) verified sharded shared-recipe save, outlet overrides through protected METHOD2 records; (4) source-quantity refresh and plain-language workload help; (5) save covered workforce before salaries, expose required positions in Staff Master; (6) reverse take-home planning with explicit employee deductions/employer additions (no invented statutory rates), calendar-day daily cost; (7) explicit labour and non-duplicate operating-expense allocations into full-cost price, separate from legacy direct COGS. Normal case before emergency testing.
Data map: shared Recipe Master manifest/chunks -> METHOD2 recipeOverrides -> saved production quantities -> IDLI_SUPPORT workforce decision -> WORKFORCE_PLAN positions/salary/product allocation -> FIXED_EXPENSES selected daily rows -> full-cost price reader. Actual employee records remain distinct from unfilled required positions. No automatic reseed, operational data correction, or migration on page load. All changed writes require backup/readback and stale-baseline check. User selects a preserved reference before replacing an outlet recipe calculation.
Recovery: local branch recovery/pre-query1-20260928 at e83d940. Code rollback separate from Google records. Tests: scaling/yield/units, calendar months/leap year, reverse THP arithmetic, no double count, stale/failed backup, normal save-reload flow, stale quantity, browser desktop/mobile fixtures and read-only live verification after publication.
Exact next action: implement pure calculation/storage helpers, then integrate recipe and workforce screens; log each checkpoint and actual failures.
---
# RELEASE VERIFIED — 27 September 2026

Owner approved publication in Codex. Approved repair implementation: 1f794fb; published release: f7fa794 (normal fast-forward to main).

- OWNER RELEASE APPROVED: YES.
- IMPLEMENTED / CODE CHECKED / AUTOMATED TESTED: YES; prior local evidence below preserved.
- GitHub Equipment planner regression: PASS, run 36334316243, https://github.com/jothish2000/BOBS-OUTLETS/actions/runs/36334316243.
- Pages deployment: SUCCESS, run 36334315853, https://github.com/jothish2000/BOBS-OUTLETS/actions/runs/36334315853.
- LIVE SOURCE VERIFIED: served equipment-planner.js matches the approved local source after newline normalization.
- BROWSER TESTED: local Chrome fixture load, edit, save and reload PASS; zero-rate total PASS; 390px viewport fits with internal table scrolling.
- LIVE READ-ONLY VERIFIED: deployed equipment planner outlet=1 loads 1 selected item / 2 equipment rows, correct Method 2 Back link, no captured runtime exceptions.
- LIVE GOOGLE SAVE/READBACK: NOT RUN; no operational records changed during release verification.
- OWNER UAT ACCEPTED: PENDING; publication approval is not a completed UAT.

Post-release four-view review (one assistant's separated passes): PRO—approved save safeguards are deployed and planner loads; CON—live persistence and full capacity/Asset Master remain unverified/unimplemented; COMPARE & CONNECTIONS—same Recipe Master and outlet data modules, no data migration, served code matches approval; OBSERVER—mock save testing and live read-only testing remain explicitly distinct. Owner's release decision was approval.

Protection: source recovery remains 6eda291; code rollback is surgical and must not restore/delete Google records. Four untracked owner documents remain untouched. Local stale main was preserved; active branch is codex/equipment-verification-20260927 in D:/BOBS-OUTLETS.

Next action: Owner tests intended real equipment values via Save and Reload and reports outcome. Then continue the compact 111Q review for ready-time/cycle scheduling and Asset Master matching. Do not regard AUTO's static one-unit suggestion as proven capacity, or manual owned quantity as Asset Master integration. Historical release-pending/local statements below are superseded by this section.

Ledger intent before this update: record actual successful CI, deployment, source comparison and live browser results, then publish this documentation-only continuation record. No additional application change or Google data write.

---
# RELEASE IN PROGRESS — Owner approved publication

Owner explicitly approved publishing the tested Equipment Planner repair. INTENT: publish local implementation 1f794fb and handover checkpoint 5d9255b through a normal fast-forward push to main, check equipment CI and Pages deployment, compare served source, and browser-test deployed load read-only. Remote main was verified at 6eda291 immediately before release; tracked worktree clean. Recovery baseline remains 6eda291. Preserve all four untracked owner documents. No operational Google writes are part of publication; live save/readback and Owner UAT stay pending until performed with intended owner values.

Next executable action: push approved source and this write-ahead release record, then inspect Actions and live source. Earlier LOCAL / approval-pending statements below are historical.

---
# ACTIVE CONTINUATION — 27 September 2026: Equipment Planner verification and save repair

This section supersedes earlier verification statuses below. Work is LOCAL on `codex/equipment-verification-20260927`, based on `6eda291db88c20a459ded1b3ba44e244f6991125`. The configured C: workspace was missing; actual checkout is `D:/BOBS-OUTLETS`. Old local main `b43fc2e` and four untracked owner documents were preserved. Owner confirmed Codex is used on the laptop only.

## Recovered checkpoint and current scope
- Current GitHub source genuinely contains the initial Equipment Planner. Existing engine regression passed locally and GitHub run 36292898858 is SUCCESS.
- Pages deployment run 36292932895 is SUCCESS at 6eda291.
- Read-only live Chrome load of equipment-planner.html?outlet=1 PASSED: one selected Method 2 item, two equipment rows, correct outlet-preserving Back link, no Runtime.exceptionThrown events. No live Save was clicked.
- Ready-time/cycle scheduling remains NOT IMPLEMENTED. Existing-owned quantity is manually entered; full Asset Master matching is NOT IMPLEMENTED. Holding rules are partial name-based rules, not a complete compatibility/capacity assessment. LPG aggregation, automatic equipment-cost allocation, and blueprint remain pending.
- AUTO currently assumes one shared unit; no capacity proof. Do not describe it as a verified practical setup. INDIVIDUAL is still preserved and engine behavior was not changed in this repair.

## Repair intent / implementation
The Owner requested autonomous continuation from the actual unfinished checkpoint. Verification reproduced seven first-slice defects before repair. Bounded correction to existing behavior, not a new architecture: prevent save after failed/incomplete loading, prevent overlapping load/save, detect stale equipment plans before/after backup, verify backup before operational write, verify full saved payload (including electricity rate), retain zero rate, reject invalid numeric inputs. Preserve outlet EQUIPMENT_PLAN/default and EQUIPMENT_PLAN_BACKUPS storage, unknown/unrendered owner decisions, and existing formulas.

Files: equipment-planner.js, equipment-planner.html, tests/equipment-planner-persistence.cjs, .github/workflows/equipment-planner.yml, scripts/verify-equipment-browser.cjs, this handover, CODEX_RECOVERY_20260927.md.

## Actual Tester evidence
- Baseline new persistence tests: 7 FAIL / 1 PASS; failures recorded in the chronological ledger below.
- Final persistence tests: 8 PASS / 0 FAIL, including zero-rate visible total after reload.
- Existing equipment engine regression: PASS.
- Connected tests: 9 PASS / 0 FAIL (seven shared-price protections, recipe sharding, recipe read-back).
- equipment-planner.js JavaScript syntax: PASS. git diff --check: PASS after extra EOF blank lines were removed.
- Actual local Chrome page with mocked Google adapter: PASS loading 3 selected items / 4 equipment rows, input/change/save/reload, zero rate; 390px viewport document width 390px with internally scrollable table. This is browser testing with mock persistence, NOT live Google save verification.
- Deployed prior code read-only live load: PASS as described above. New repair DEPLOYED: NO. Live save/readback: NOT RUN. Owner UAT acceptance: PENDING.

## Post-test four-view review — one assistant's separated passes
| View | Business / logic | Software / data |
|---|---|---|
| PRO | Zero-rate costing and explicit save outcomes now work | Eight targeted safety cases and connected regressions pass |
| CON | Capacity/sharing and Asset Master gaps remain | Optimistic rereads are not atomic compare-and-swap; live repair save unverified |
| COMPARE & CONNECTIONS | Same equipment decisions, quantities and estimates | Same Google modules and Recipe Master; stronger load/backup/readback guards |
| OBSERVER | No live/UAT claim inferred from fake-adapter tests | Desktop browser and narrow viewport checked; deployed source remains the old version |

## Protection / exact next action
Recovery source: 6eda291. Code rollback is a surgical restoration of affected planner files from that commit; preserve all continuity records and owner documents. No operational Google records were written, so no data rollback is required for this work. Do not restore business data as part of code rollback.

Next executable action: Owner reviews/accepts the tested bounded repair for publication under the master's release gate. After authorized publication, verify new deployed source and perform controlled outlet-plan save/readback only with the intended real owner values; record actual backup/readback and UAT outcome. Then present the next compact scheduling/Asset Master proposal, including process expansion, compatible fixed stations, ready times/cycles, units/capacity, theoretical vs practical equipment quantities, and persistent INDIVIDUAL authority. Do not restart Recipe Master or replace Google data.

Detailed write-ahead intent, results and repair notes are in the Live continuation ledger at the end of this file and CODEX_RECOVERY_20260927.md.

---
# ACTIVE HANDOVER ADDENDUM — 27 September 2026: Method 2 Equipment / Asset Planner + continuous 111Q ledger

This addendum is newer than all sections below and must be read first.

## Owner decisions captured
- The minute Method 2 items are selected, BOBS should derive the equipment needed from the selected menu and Recipe Master/process requirements.
- Equipment planning covers the full lifecycle, not cooking alone: PREP, PRODUCTION, HOLDING, DISPLAY, COLD STORAGE, SERVICE, CLEANING and COMMON UTILITY.
- Post-cooking holding is part of the process and cost. Examples: Idli hot box; powered snack/puff warmer; refrigerated display/cold holding where applicable.
- Sharing is an **economy suggestion only**, never a gap filler.
- Sharing must not depend on physically shifting a burner/stove/equipment between workstations, disruptive cleaning/changeover, or avoidable manpower movement.
- Owner controls each shareable equipment group with AUTO / SHARED / INDIVIDUAL. INDIVIDUAL is authoritative when selected and must drive quantity/CAPEX/space/utilities downstream.
- Existing owned assets must reduce the purchase gap; equipment required and equipment to purchase are separate concepts.
- 111Q = 111Q5PVDDRT now additionally requires a **continuous repository implementation ledger** updated during material work so Codex and normal ChatGPT can resume each other after credit/session exhaustion.

## Continuous implementation ledger — execution order
1. Recovered latest BOBS context and verified repository `jothish2000/BOBS-OUTLETS`.
2. Inspected current `main` before edits. Starting HEAD for this change: `b8796a87c54fd47323193387716165da244d4398`.
3. Read current `AGENTS.md`, this handover, Method 2 source, workload source and `OVERALL_DESIGN_MASTER_111Q.md`.
4. Confirmed latest Recipe Master architecture is V2 sharded Google storage (104 recipes / 11 chunks in the prior verified handover); this change does not replace or shrink it.
5. Created recovery branch `recovery/pre-equipment-planner-111q-20260927` at starting HEAD `b8796a87...`.
6. Added `equipment-planner-core.js`: derives production equipment from Recipe Master, adds post-cooking holding/display/cold-storage rules, consolidates compatible fixed equipment groups, applies owner AUTO/SHARED/INDIVIDUAL decisions, existing-owned quantity, CAPEX gap and electricity estimates.
7. Added `equipment-planner.html`: mobile-usable Equipment & Asset Planner UI with EB rate, source items, owner sharing decision, final quantity, owned quantity, buy gap, CAPEX, watts, hours/day and daily electricity.
8. Added `equipment-planner.js`: reads Method 2 + logical Recipe Master, persists owner decisions separately under outlet `EQUIPMENT_PLAN/default`, backs up the prior equipment plan before save, and verifies Google read-back.
9. Updated `method2.html` to expose **Equipment & assets** directly from the Method 2 workspace.
10. Updated `AGENTS.md` so Codex/ChatGPT must document material implementation actions/results during work, not only at the end.
11. Updated `OVERALL_DESIGN_MASTER_111Q.md` to v3.1 with the same bidirectional cross-AI continuity ledger rule.
12. Stabilized equipment decision IDs so saved owner choices survive menu changes when the same equipment group remains.
13. Added `tests/equipment-planner.cjs` covering Vada+Bonda fixed frying-station consolidation, SHARED vs INDIVIDUAL quantity/CAPEX behavior, and powered Puff warmer energy.
14. Added `.github/workflows/equipment-planner.yml` to run the regression automatically.
15. Equipment planner regression for commit `5a11063545259352b5a02b3ec87604c59a0d2835` completed **SUCCESS**. It verified Vada+Bonda fixed frying-station consolidation, SHARED vs INDIVIDUAL final quantity/CAPEX behavior, and powered Puff warmer electricity. Pages deployment for that functional commit was still **IN PROGRESS** at the latest check; browser/live verification remains NOT YET.

## Architecture / data ownership
`Method 2 selection -> logical Recipe Master V2 -> equipment-planner-core -> owner equipment decisions -> EQUIPMENT_PLAN Google module -> CAPEX / utility summary`.

Recipe Master remains authoritative for production recipe/process equipment. `EQUIPMENT_PLAN` owns outlet-specific asset/sharing decisions and planning assumptions. It does not rewrite Recipe Master or Method 2 item costing yet.

## Current scope boundaries
Implemented now:
- menu-driven production equipment derivation;
- holding/display/cold-storage additions for currently encoded rules;
- owner AUTO/SHARED/INDIVIDUAL override;
- existing-owned quantity and purchase gap;
- CAPEX estimate;
- powered equipment daily kWh/cost estimate;
- separate Google persistence + backup/read-back;
- Method 2 navigation;
- continuous 111Q/Codex continuity rule.

Not yet implemented:
- rigorous ready-time/cycle scheduler proving simultaneous burner demand;
- full Asset Master with serial/model/location/useful life/maintenance/space dimensions;
- LPG capacity/running-cost aggregation from equipment plan (recipe direct LPG remains in Recipe Master);
- kitchen blueprint/zone placement;
- automatic feed of equipment depreciation/holding electricity into item cost;
- compatibility matrix for temperature/humidity/odour/tray capacity beyond current conservative group rules;
- live owner UAT.

## 111Q status at this checkpoint
- DESIGNED: YES.
- OWNER APPROVED: YES — explicit owner direction in chat.
- IMPLEMENTED: YES for the first Equipment/Asset Planner slice above.
- CODE CHECKED: YES for inspected/changed source paths.
- AUTOMATED TESTED: PASS — `tests/equipment-planner.cjs` / GitHub Actions success on `5a110635...`.
- BROWSER TESTED: NOT YET.
- DEPLOYED / PUBLISHED: PENDING Pages workflow at ledger write time.
- LIVE VERIFIED: NOT YET.
- OWNER UAT ACCEPTED: NOT YET.
- REGRESSION STATUS: automated equipment-engine regression PASS; browser/live checks pending.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-equipment-planner-111q-20260927`.

## 5PV-DR checkpoint
- PRO: equipment appears immediately from the selected menu and includes holding assets, so CAPEX/power planning starts from the actual operating menu.
- CON: first slice uses conservative equipment aliases/holding rules and does not yet prove peak simultaneous demand; AUTO must therefore remain a suggestion.
- COMPARE & CONNECTIONS: previously Recipe Master equipment was descriptive; now it feeds an outlet equipment plan without changing Recipe Master or current COGS.
- OBSERVER: owner override is visible and persisted; sharing warning explicitly prohibits moving equipment/changeover-driven economy.
- OWNER: approved direction is implemented as the first slice; further scheduler/Asset Master integration remains continuation work.

## Exact next executable action
1. Re-check GitHub Actions for `Equipment planner regression` at commit `5a110635...`; if FAIL, inspect logs, repair and retest before proceeding.
2. Confirm Pages deploy for the latest functional commit is green.
3. Browser-test live `method2.html?outlet=1` -> **Equipment & assets** -> `equipment-planner.html?outlet=1`.
4. Verify actual selected menu imports; confirm Vada+Bonda offers sharing but INDIVIDUAL changes final quantity/CAPEX; confirm Puff produces powered 3-rack warmer; save and reload Google read-back.
5. Then extend from static equipment grouping to ready-time/cycle capacity scheduling and full Asset Master/space/LPG/maintenance fields. Do not make sharing mandatory.

---

# ACTIVE HANDOVER ADDENDUM — 26 September 2026: Recipe Master V2 live Google storage / sharded master

This addendum is newer than all sections below and must be read first.

## Trigger / owner observation
- Owner opened the live `recipe-master.html` and saw only the static Recipe Master shell with status `READING GOOGLE...`; no recipes appeared.
- This was treated as a live defect, not user error. The actual deployed page was reproduced in headless Chrome before changing storage.

## Root cause proven
- First browser reproduction reached `SAFE MODE — Migration save was sent but read-back did not match` after the existing recovery snapshot was created.
- Cache-versioning and repeated Google read-back were corrected first, but Google still returned the old master. This proved the issue was not only stale browser cache/read timing.
- Direct live Google inspection showed the legacy Recipe Master was about **44,859 JSON characters** with 97 recipes.
- Generated V2 with full ingredients/timing/stage metadata was about **319,812 JSON characters**. Even a metadata-reduced candidate remained about **90,382 characters**.
- Therefore the previous architecture — one logical Recipe Master stored as one Data Vault/Google Sheet record/cell — could not safely hold the V2 master.

## Implemented storage architecture
- The user-facing and business architecture remains **one Recipe Master**. Physical Google storage is now sharded transparently.
- Active authoritative pointer remains `COMPANY / RECIPE_MASTER / STANDARD_V1` and is now a small manifest when V2 is active.
- Immutable recipe chunks are stored under `COMPANY / RECIPE_MASTER_CHUNKS / <versioned token key>`.
- `recipe-master-shards.js` owns pure split/manifest/chunk/assembly/integrity rules.
- `bobs-google-data.js` now exposes `getRawModule()` and transparently reassembles a sharded Recipe Master from the manifest for all normal consumers.
- `method2-core.js` routes `RECIPE_MASTER` reads through that reassembling data layer, so downstream Method 2 / Item COGS sees the same logical master and does not need to know about shards.
- `recipe-master.html` writes each chunk, read-back verifies it, and **only after every chunk is verified** switches `STANDARD_V1` to the new manifest. A failed chunk never activates a partial master.
- Manual Recipe Master edits use the same new-version/chunk-set + manifest-switch mechanism.
- Existing recovery snapshot logic remains. Old immutable chunk sets are not destructively overwritten.
- V2 reload is now idempotent: if the active master has the current standard/schema and sharded storage marker, normal refresh only reads it. Future standards changes must bump `BOBS_SMALL_OUTLET_STANDARD_VERSION` before migration.
- While Google is being checked, Recipe Master shows all reference standards read-only rather than presenting an empty page.

## Live migration evidence
- Recovery branch before the live-read repair: `recovery/pre-recipe-master-live-read-fix-20260926` at `d2a4ad4189e52ee752a1ba28560f34a9b9ea78b9`.
- Live browser migration completed with status: **`Google master upgraded + verified`**.
- Independent Google verification after migration:
  - `standardVersion = 2026-09-SMALL-OUTLET-V2`
  - `schemaVersion = 3.0-SMALL-OUTLET-STANDARD`
  - `storageMode = SHARDED_RECIPE_MASTER_V2`
  - `recipeCount = 104`
  - `11` verified chunks
  - manifest about `1,293` JSON characters
  - chunk sizes approx. `26,278` to `32,001` JSON characters
- Direct reassembly verified all **104 recipes** and confirmed Idli, Idli Sambar, Coconut Chutney, Rice Sambar and Potato Poriyal were present.

## Final regression evidence
- Normal deployed Recipe Master reload: **PASS** with exact status `Google master loaded — current standard verified`; it did not create a fresh migration.
- Deployed `recipe-item-cogs.html` Idli test: **PASS** with `Permanent Google Recipe Master read successfully`; the sharded Recipe Master is transparent to downstream COGS reading.
- Direct Google manifest after the reload remained V2 / sharded / 104 recipes / 11 chunks.
- Permanent CI now runs:
  1. `tests/recipe-standards-v2.cjs` — all eligible recipes/condiments complete;
  2. `tests/recipe-master-sync.cjs` — stale/transient read-back retry and blocked mismatch;
  3. `tests/recipe-master-shards.cjs` — chunk size, assembly and corruption/incomplete-set rejection.
- Temporary diagnostic and one-time patch workflows were removed after evidence was captured.

## 111Q status
- DESIGNED: YES.
- OWNER APPROVED: YES — full Recipe Master standardisation was explicitly requested; owner then supplied the live failure screenshot.
- IMPLEMENTED: YES.
- CODE CHECKED: YES.
- AUTOMATED TESTED: PASS — recipe completeness + read-back + sharding integrity.
- BROWSER TESTED: PASS — live GitHub Pages Recipe Master migration, normal reload and downstream Item COGS browser tests.
- DEPLOYED / PUBLISHED: YES.
- LIVE VERIFIED: YES — Google master V2 manifest/chunks independently queried and reconstructed.
- OWNER UAT ACCEPTED: NOT YET — owner still needs to hard-refresh their own browser and confirm the populated screen.
- REGRESSION STATUS: PASS for normal Recipe Master reload, active manifest integrity and downstream Item COGS Recipe Master read.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-recipe-master-live-read-fix-20260926`, earlier `recovery/pre-recipe-standard-v2-20260926`, plus Google recovery snapshots/chunk immutability.

## Post-test 5PV-DR
- PRO: full V2 data now persists without hitting the one-record size ceiling; activation is atomic at the manifest-pointer level after chunk verification.
- CON: reads now require multiple Google chunk requests, so Recipe Master can take several seconds to fully load; UI preview/status makes that explicit.
- COMPARE & CONNECTIONS: Catalogue -> Recipe Master V2 logical master -> manifest/chunks -> transparent BOBS_DATA assembly -> Method 2 / Workload & Staffing / Item COGS. Business modules still consume one logical Recipe Master.
- OBSERVER: incomplete/corrupt chunk sets throw an integrity error instead of silently returning partial recipes; unknown timing remains unknown, never zero.
- OWNER: hard-refresh the same Recipe Master page. Expected steady-state status is `Google master loaded — current standard verified` with recipe cards visible.

## Exact next action
1. Owner presses `Ctrl + Shift + R` on `recipe-master.html` (or closes/reopens it if Chrome retains the old page instance).
2. Wait for the Google read to finish. Expected final status: **`Google master loaded — current standard verified`** and populated recipe cards.
3. Search `Idli Sambar` and confirm its ingredient/timing record is visible.
4. Return to `idli-staffing.html?outlet=1` and refresh. Its selected-side timing should now come from Recipe Master; do not preserve an arbitrary manual `4`/`0` minute value when the master timing is available.
5. Continue Cook 1 + Helper 1 coverage -> labour allocation -> labour-inclusive Idli cost / ideal price, then expand the general staged workload engine while preserving Vada specialist logic and shared-side deduplication.


---

# ACTIVE HANDOVER ADDENDUM — 26 September 2026: Recipe Master V2 full production standardisation

This addendum is newer than all sections below and must be read first.

## Owner direction
- Owner instructed BOBS to load **all production recipes and all condiments/sides**, not only Idli, with a complete small-outlet reference planning standard: ingredients, yield, preparation/setup/active/passive/finish/cleanup timing, role, equipment, helper work and directly attributable LPG/electricity.
- Do not describe the minute values as a universal or certified industry time. They are conservative **reference small-outlet planning standards** for workload/costing, to be calibrated with actual outlet trials.
- Missing/unknown timing is never zero. Recipe Master remains the single source used by Workload & Staffing.
- Existing owner-entered ingredient rates are preserved where ingredient identity matches; Idli's existing formulation/yield remains specially protected by the existing migration logic.

## Implementation
- Pre-change recovery branch: `recovery/pre-recipe-standard-v2-20260926` at `bb508341a88d7d7f5f2e7089d0cc4ef4fc588b0b`.
- `poriyal-recipes.js` now provides the V2 completeness layer over every BOBS guide recipe and poriyal and bumps the standard to `2026-09-SMALL-OUTLET-V2`.
- Every seed now carries/validates: positive yield/unit; explicit ingredient/direct-energy rows; pre-preparation, setup, active, equipment/passive, finish and cleanup minutes; required role; equipment; parallelisation flag; helper-eligible work; staged production metadata; direct-energy type; calibration metadata and completeness flags.
- User-facing planning metadata explicitly says values are reference planning standards and must be calibrated; planning minutes are not proof of food-safety compliance.
- Existing explicit standards include Idli Sambar, Rice Sambar, Coconut Chutney, Pudina Chutney, Tomato Chutney and all current Poriyals. The audit found one remaining generic seed, `Variety Rice Combo`; it was replaced with an explicit reference ingredient/timing formulation rather than allowing `Mixed variety-rice seasonings` to enter costing.
- `tests/recipe-standards-v2.cjs` audits the real catalogue and fails when an eligible produced item has no recipe or any standard lacks yield, ingredient rows, direct energy, timing, role/equipment, production stages, helper work, V2 version/completeness, or contains known generic placeholder ingredient labels.
- `.github/workflows/recipe-standards-v2.yml` runs that audit automatically when recipe/catalogue standards change.

## Migration / data safety
- The existing `recipe-master.html` Google-first migration remains the writer. Because V2 changes `BOBS_SMALL_OUTLET_STANDARD_VERSION`, opening/refeshing Recipe Master causes the normal migration comparison to see the older Google master as stale.
- Before a material migration, the page creates a Google recovery snapshot; it then writes the merged master and performs read-back verification.
- Existing unrelated Google recipes are retained. Matching old ingredient rates are retained. Idli's old ingredient formulation/yield is retained while missing timing/energy metadata is upgraded.
- Source deployment does **not** itself prove that the user's Google Recipe Master has migrated. Owner/browser must open Recipe Master and observe the Google upgraded + verified status before calling the live master V2.

## Tester evidence
- First new audit run correctly FAILED on `Variety Rice Combo: generic placeholder ingredient`; this was repaired rather than bypassed.
- A later run reached the recipe PASS but the Node harness then failed on a browser-only `document.createElement` microtask. The harness was corrected without weakening recipe assertions.
- Final automated audit at commit `45ee9a8f63493526711005aa63b3e31aa5902acc`: **PASS — 91 eligible catalogue recipes; 104 total standard recipes/condiments; all required production parameters complete.**
- GitHub Pages build for `45ee9a8f63493526711005aa63b3e31aa5902acc`: SUCCESS.
- GitHub Pages deploy for `45ee9a8f63493526711005aa63b3e31aa5902acc`: SUCCESS.

## 111Q status
- DESIGNED: YES.
- OWNER APPROVED: YES — explicit request to standardise all recipes/condiments.
- IMPLEMENTED: YES for source Recipe Master V2 standards/audit.
- CODE CHECKED: YES — source and migration connections inspected.
- AUTOMATED TESTED: PASS — 91 eligible catalogue recipes / 104 total standards and condiments.
- BROWSER TESTED: NOT YET for the V2 Google migration.
- DEPLOYED / PUBLISHED: YES — Pages build/deploy green.
- LIVE VERIFIED: NOT YET — Google Recipe Master must still migrate/read back in the owner's browser.
- OWNER UAT ACCEPTED: NOT YET.
- REGRESSION STATUS: V2 audit green; existing non-destructive Recipe Master merge and Idli-protection rules retained.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-recipe-standard-v2-20260926` plus Recipe Master's own pre-migration Google recovery snapshot.

## Post-test 5PV-DR
- PRO: BOBS now has a complete schedulable/costable reference record for every current eligible production recipe rather than allowing blank timings to leak into staffing.
- CON: reference ingredient quantities, yield, timing and energy remain planning values until calibrated from the actual outlet; they must not be presented as measured truth.
- COMPARE & CONNECTIONS: catalogue -> Recipe Master V2 -> Google migration/readback -> Workload & Staffing -> role/position/labour allocation -> labour-inclusive product cost / ideal price. Direct RM/fuel/packing COGS remains separate from allocated labour.
- OBSERVER: automated audit blocks missing recipes/parameters and known generic placeholders; missing data is not converted to zero.
- OWNER: next action is one live Recipe Master migration/readback check, then return to Idli staffing and confirm Idli Sambar timing loads automatically before saving the staffing plan.

## Exact next action
1. Owner hard-refreshes/opens `recipe-master.html` and waits for the status to report Google master **upgraded + verified** (or current V2 verified). Do not proceed through a SAFE MODE/error.
2. Check representative records: Idli formulation preserved; Idli Sambar/Coconut Chutney have timing; snack opening batches and Poriyals remain present; no duplicate recipes.
3. Reload `idli-staffing.html?outlet=1`. The selected-side timing should now calculate from Recipe Master; do not keep an arbitrary manual 4/0 minute value.
4. Complete Cook 1 + Helper 1 coverage and labour allocation, save only after the timeline is valid, then verify labour-inclusive Idli cost / ideal price.
5. Continue the general Workload & Staffing engine using the new staged Recipe Master data; preserve specialist Vada logic and shared-side deduplication.


---

# ACTIVE HANDOVER ADDENDUM — 26 September 2026: Guided Idli staffing flow / timing clarity

This addendum is newer than all sections below and must be read first.

## Owner direction
- The Idli staffing page must guide the user through the actual operating sequence instead of exposing technical field names or expecting the user to infer the flow.
- The highlighted timing area was confusing because it mixed Recipe Master timing, manual planning allowances and final acceptance checks without explaining what to do.
- User-facing language must not expose internal names such as `sideMinutes`.
- Missing production timing must remain **unknown / incomplete**, never silently become zero.
- The normal path is: production target -> timing review -> Cook 1 + Helper 1 coverage -> emergency support only if required -> labour cost -> save.

## Implementation
- Recovery branch before this change: `recovery/pre-idli-guide-wording-20260926`.
- `idli-staffing.html` now contains a prominent, mobile-safe, open-by-default 5-step Page Guide:
  1. confirm production target and deadline;
  2. review recipe/production timings without guessing missing values;
  3. review Cook 1 + Helper 1 coverage;
  4. add emergency/rotational support only when normal coverage is insufficient;
  5. review labour cost and save.
- Every guide step contains an **Expected result** block.
- STEP 2 links directly to Recipe Master when a production-side timing is missing.
- The former `Review preparation assumptions` area is now `STEP 2 — Review production timings`; labels explain ingredient prep, side portioning and washing in normal language.
- `idli-staffing.js` now tells the user whether production-side timing was loaded from Recipe Master, whether no production-side cooking is required, or exactly which selected side is missing timing.
- `idli-support-core.js` no longer emits `Enter sideMinutes; missing timing is not zero.` It now explains that selected side-dish cooking time is missing, where to complete it, and that 0 must only be used when the work genuinely does not apply.
- The acceptance confirmation now reads as a plain-language check that timings and assignments are practical for the outlet, including equipment, other duties and rest.
- User-facing `pilot` wording was removed from the active Idli page where it could be mistaken for a module name.
- Existing staffing calculations, Google storage, backup/readback logic, coverage rules, direct COGS and labour-allocation semantics were not intentionally changed.

## Commits / release evidence
- `b021fb1bbfb2fb099802302c82fd6ce1f2566ea5` — visible 5-step Idli Page Guide and clearer timing labels/help.
- `b1b6a71abdad8ddff959e0a48e4197edf4f73e88` — plain-language timing/acceptance validation.
- `7217bc626e1a7adcec3ecaaeaa94d9c8f0b307e2` — Recipe Master timing-source guidance and removal of active `pilot` wording.
- GitHub Actions build for `7217bc626e1a7adcec3ecaaeaa94d9c8f0b307e2`: SUCCESS.
- GitHub Pages deploy for `7217bc626e1a7adcec3ecaaeaa94d9c8f0b307e2`: SUCCESS.

## 111Q status
- DESIGNED: YES.
- OWNER APPROVED: YES — Owner explicitly instructed implementation after reviewing the confusing live screen.
- IMPLEMENTED: YES.
- CODE CHECKED: YES — current HTML/core/JS inspected after edits; Pages build succeeded.
- AUTOMATED TESTED: NOT RUN specifically for this wording/guide change. Existing Idli-support automated tests predate this UI wording change; do not relabel them as a new test run.
- BROWSER TESTED: PRE-CHANGE owner screenshot reviewed; POST-CHANGE owner/browser observation still pending.
- DEPLOYED / PUBLISHED: YES.
- LIVE VERIFIED: NOT YET by Owner after refresh.
- OWNER UAT ACCEPTED: NOT YET.
- REGRESSION STATUS: build/deploy green; no intentional formula/storage changes.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-idli-guide-wording-20260926`.

## Post-change 5PV-DR
- PRO: the page now explains what the user must do, where timing comes from, what completion looks like and when emergency support is actually needed.
- CON: prep/portion/wash remain explicit planning allowances until observed outlet timings or richer Recipe Master stage data replace them.
- COMPARE & CONNECTIONS: Recipe Master timing -> staffing timeline -> position coverage -> labour allocation -> labour-inclusive Idli cost is now visible as one guided flow.
- OBSERVER: missing production-side timing remains blocking/incomplete and is not converted to 0.
- OWNER: refresh the live Idli staffing page and confirm the new guide/labels are understandable before broadening the same guided pattern to other staffing pages.

## Exact next action
1. Owner refreshes `idli-staffing.html?outlet=1` and visually checks the Page Guide plus STEP 2 timing area.
2. If any production-side timing is blank, follow the new Recipe Master link and complete the missing timing rather than entering an artificial zero.
3. Review the resulting Cook 1 + Helper 1 chronological coverage table; use emergency support only when a duty remains uncovered.
4. After UAT, continue the broader staffing-cost architecture: general Method 2 production items -> Recipe Master timing -> role/position requirement -> allocated labour -> labour-inclusive product cost -> ideal price, while preserving direct RM/fuel/packing COGS and preventing salary/support double counting.
5. Keep this handover current after each material implementation.

---

# ACTIVE HANDOVER ADDENDUM — 26 September 2026: Page Guide + Method 2 staffing next-step

This addendum is newer than all sections below and must be read first.

## Owner direction
- BOBS must guide a first-time user page-by-page with a visible `Step → Expected result → Next action` pattern instead of relying on small explanatory subtitles.
- The guide must advance according to saved state. It must not keep telling the user to select items after the selection is already saved.
- On Method 2, once selected items are fully completed, the next guided action is **Workload & Staffing Plan** because menu staffing/role/position/labour allocation is needed before labour-inclusive product costing and ideal pricing.
- Pricing architecture direction: preserve existing direct RM + directly attributable fuel/energy + packing/condiment COGS as factual/legacy direct COGS. Add allocated staffing/labour as a separate labour-inclusive product-cost layer used for ideal-price calculations. Do not double-count the same salary/support payment in both item allocation and outlet expense totals.

## Page Guide implementation
- Recovery before guide visibility work: `recovery/pre-page-guide-visibility-20260926`.
- Recovery before Method 2 state-aware guide: `recovery/pre-method2-guide-flow-20260926`.
- `style.css` now makes existing shared-header guidance visually prominent and contains reusable Page Guide styles for Step / Expected Result / warning patterns.
- `method2.html` now has a prominent mobile-safe Page Guide card rather than a static small header sentence.
- `method2-list.js` advances the guide from current Google-backed state:
  1. no selected items → **STEP 1: choose categories & items**;
  2. selected but incomplete items / shared packing → **STEP 2: complete selected item setup**;
  3. all selected item inputs complete → **STEP 3: open Workload & Staffing Plan**.
- STEP 3 explicitly explains that staffing produces role/position/labour allocation that can feed labour-inclusive product cost and ideal price while preserving direct RM/fuel/packing COGS.
- The guide includes a visible action link to the correct next page and an Expected Result block.

## Commits / release evidence
- `8e985db878120961c2e50e7261b80fab4bf39582` — shared guide visibility / reusable guide styling.
- `9e75e70ef92268dd6555eb362e0c540a86b6c5cb` — Method 2 Page Guide visual component.
- `1cd758a1959457576e1d8b2d19183bea5c32463a` — state-aware Method 2 guide progression through staffing.
- GitHub Actions build for `1cd758a1959457576e1d8b2d19183bea5c32463a`: SUCCESS.
- GitHub Pages deploy for `1cd758a1959457576e1d8b2d19183bea5c32463a`: SUCCESS.

## 111Q status for this guide change
- DESIGNED: YES.
- OWNER APPROVED: YES — Owner explicitly requested visible guides and the staffing-next costing flow.
- IMPLEMENTED: YES.
- CODE CHECKED: current `method2-list.js` and `method2.html` inspected after commit; Pages build passed.
- AUTOMATED TESTED: NOT RUN for the new state-aware UI guide.
- BROWSER TESTED: Owner supplied the pre-change browser screenshot; post-change browser observation still pending.
- DEPLOYED / PUBLISHED: YES.
- LIVE VERIFIED: NOT YET for the new state-aware guide behavior.
- OWNER UAT ACCEPTED: NOT YET.
- REGRESSION STATUS: no Method 2 costing formula/storage was changed by this guide implementation; navigation guidance only.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-method2-guide-flow-20260926` plus earlier recovery refs.

## Post-change 5PV-DR
- PRO: the next action is visible and changes with saved progress, reducing user confusion.
- CON: Method 2 currently guides into staffing, but general multi-item labour allocation beyond the Idli support path still requires further implementation.
- COMPARE & CONNECTIONS: Method 2 selection/setup now explicitly connects to Recipe/COGS → Workload & Staffing → labour-inclusive product cost → ideal price instead of leaving Workload & Staffing as an unexplained toolbar link.
- OBSERVER: guide state is derived from selected items, saved confirmation, missing cost inputs and shared packing; incomplete data is not treated as complete.
- OWNER: after visual UAT, continue toward staffing-cost allocation in item costing/ideal pricing without mutating legacy direct COGS.

## Exact next action
1. Owner refreshes the live Method 2 page after Idli is selected/saved and confirms the guide now advances to STEP 3 when item setup is complete.
2. If the page still shows STEP 2, inspect the exact remaining incomplete input rather than bypassing validation.
3. Continue Workload & Staffing architecture so selected production items/linked condiments generate role/position/labour requirements from Recipe Master timing.
4. Then expose the saved allocated labour below direct RM/fuel/packing cost in the item pricing view as **Labour-inclusive product cost** and use that for ideal-price guidance. Preserve direct Actual COGS separately and prevent salary/support double counting in outlet expenses.
5. Update this handover after each material implementation.

---

# ACTIVE HANDOVER ADDENDUM — 25 September 2026: Workload → Idli staffing bridge

This addendum is newer than the Idli pilot section below and must be read first.

## Owner direction
- Owner is continuing BOBS development from a phone in ChatGPT rather than waiting for Codex credits/workstation access.
- Continue the existing 111Q5PVDDRT implementation from current `main`; do not restart the design or duplicate existing Google-backed staffing/cost records.

## Material bridge change
- Pre-change recovery branch: `recovery/pre-idli-bridge-20260925` at `8d7c3b7832fb4a0ff6310473f4c75b4211d4cf80`.
- `workload-idli-bridge.js` added as a READ-ONLY bridge on `workload-planner.html`.
- `bobs-config.js` now loads that bridge only when the current page is `workload-planner.html`.
- The bridge reads the existing authoritative `IDLI_SUPPORT / default` record; it does not create another staffing/support ledger and does not write Google data.
- It displays one of: no plan, DRAFT, ACCEPTED, COVERAGE STILL OPEN, or QUANTITY CHANGED.
- It exposes phone-friendly navigation to Idli staffing/emergency support, current Idli item full-cost page (when selected), and outlet fixed expenses.
- It compares saved staffing quantity with the current selected Method 2 Production Idli quantity and warns rather than silently treating stale labour allocation as current.
- Pending/uncovered support remains visually incomplete; existing `idli-support-core.js` remains the authority for whether acceptance is allowed.

## Commits / release evidence
- `6ecfd09a1baa190c680e380b459848d25a5a98dc` — create `workload-idli-bridge.js`.
- `a0946336482113a36d967b0df82fc4d59958facb` — load bridge from `bobs-config.js` on Workload Planner only.
- GitHub Actions build for `a0946336482113a36d967b0df82fc4d59958facb`: SUCCESS.
- GitHub Pages deploy for `a0946336482113a36d967b0df82fc4d59958facb`: SUCCESS.

## 111Q status for this bridge
- DESIGNED: YES.
- OWNER APPROVED: YES — Owner instructed continued bridge/site development.
- IMPLEMENTED: YES.
- CODE CHECKED: source inspected; GitHub Pages build passed. Local Node syntax execution was BLOCKED by this session's container network isolation, so do not describe that as a passed local runtime test.
- AUTOMATED TESTED: no new bridge-specific browser automation; existing Idli support core automated tests remain from prior implementation.
- BROWSER TESTED: NOT RUN in this session because the available web fetcher could not access the GitHub Pages URL.
- DEPLOYED / PUBLISHED: YES — GitHub Pages deployment successful.
- LIVE VERIFIED: NOT VERIFIED.
- OWNER UAT ACCEPTED: NOT YET.
- REGRESSION STATUS: build/deploy green; runtime navigation/data rendering still requires phone/browser observation.
- RECOVERY POINT AVAILABLE: YES — `recovery/pre-idli-bridge-20260925`.

## Post-change 5PV-DR
- PRO: gives the Owner a visible, phone-friendly continuity bridge from workload planning to staffing, item cost and expenses without introducing a duplicate source of truth.
- CON: status rendering depends on runtime Google reads and therefore cannot be called live verified from build success alone.
- COMPARE & CONNECTIONS: before, Workload Planner had only a one-way link to the Idli pilot; after, it reads the authoritative saved status and provides connected links to staffing, labour-inclusive item cost and outlet expenses.
- OBSERVER: stale quantity is surfaced as a warning; draft or uncovered records are never presented as complete.
- OWNER: continue building; browser/UAT observations can be supplied from the phone while development proceeds.

## Exact next action
1. On the live Workload Planner, visually confirm the new bridge card/status and the three navigation paths.
2. If runtime behavior is correct, proceed to the next architecture gap: expand selected parent products to linked condiment workloads and then move toward the Cook1 + Helper1 whole-day timeline using Recipe Master timings.
3. Do not expand the Idli pilot into other dishes by copying assumptions; reuse Recipe Master timing/role/equipment data and preserve specialist Vada logic.
4. Update this handover again after the next material implementation.

---

# ACTIVE HANDOVER — 25 September 2026: Idli staffing / extra support pilot

Read this section first. It supersedes conflicting older business directions in the historical handover below.

## Owner-approved scope and decisions
- Latest request: take the reviewed interactive Idli staffing/emergency/payment design into the BOBS GitHub Pages site; provide automatic Codex continuity. Idli first; remaining Method 2 production items later.
- Roles → positions → people. Recommend positions before employee names. Cook 1 + Helper 1 is the initial Idli planning team, NOT a proven industry headcount or whole-outlet staffing result.
- The Owner does not want trial-and-error staffing or opportunistic gap filling. Use sourced/reference workflows, quantities, equipment, attention, realistic allowances, attendance and deadlines. Unknown timing must be explicit, never zero.
- Regular team has checked Cook/Helper selections and YES/NO acceptance. Removing a position exposes uncovered duties. Emergency plan can transfer compatible prep/cleanup to Cook 1, reserve cooking windows, and request bounded support for portioning/packing.
- Temporary = additional substitute; rotational = existing employee moved from another position. Payment is a separate choice. Rotational source must be identified. Availability pending means UNCOVERED in red, and acceptance is blocked.
- Hourly extra, fixed extra, or existing salary/no extra. Hourly payment supports actual duration, ceil whole hours, minimum hours. 80 min × ₹100 with 2-hour minimum = ₹200. Rates are owner inputs, not statutory payroll calculations.
- One-off date vs recurring end date/occurrences/trading days; include/exclude extra from Idli allocation. Existing salary is not removed automatically during absence. Full extra payment belongs once in outlet expenses; product allocation is not a second expense.
- NEW Owner rule supersedes old labour-exclusion rule for presentation/pricing: retain legacy direct food/energy/packing Actual COGS, and additionally show full labour-inclusive item cost and ideal price. Do not mutate legacy direct-cost expense aggregates to double-count salary.

## Current implementation (release validation in progress)
- Recovery baseline: `2d6b1425391562fe52460872f13f18d2592106b7` (main before this work). Revert changed code surgically; never restore Google state by reverting source.
- `idli-staffing.html`, `idli-staffing.js`: linked live-page pilot importing saved selected Production Idli quantity/capacity, sides and Recipe Master timing; previous saved Idli stage model is reused. Builds chronological assignments, regular/emergency selection, red uncovered status, paid-hours quote, direct + regular + additional cost preview, accepted/draft save.
- `idli-support-core.js`: pure build/assess/payment/effectivity logic; reserved supervision windows, deadline/overlap checks; additional support interval; Google save backup + optimistic reread + token readback.
- `idli-support-readers.js`: projections into item full cost and outlet expense line. One authoritative record; no duplicate expense ledger.
- `workload-planner.html`: link to Idli pilot, preserving existing popup and workload profiles.
- `method2-item.html/js`: load accepted support record; show full labour-inclusive cost/price alongside existing direct calculation. No change to direct `M2.calculate.final`, `actualDayCost`, or the existing saved direct-cost economics.
- `fixed-expenses.html`: derive a protected `source: IDLI_SUPPORT` line; remove/replace it on refresh so repeated save/load cannot accumulate duplicates. Recurring = monthly support amount / trading days; one-off = exact current business date. Persist through existing Save Expenses action for downstream readers. No automatic employee/payroll mutation.
- `test-idli-support.cjs`: run with `node test-idli-support.cjs` from repository root.

## Authoritative storage
`IDLI_SUPPORT / default` per outlet is the active accepted or draft plan. `IDLI_SUPPORT_BACKUPS / <token>` contains prior records. Accepted records carry business date, optional end date, input plan, role allocation, quote, task calculation and token. Draft status deactivates cost. Source quantity and selected-side fingerprint protect the item reader against a stale plan. A single active plan is supported; dated historical reporting/parallel scenarios still need expansion.

No operational Google records were intentionally edited as part of implementation tests. Live save/read-back status must be recorded after testing; do not imply passing if only fake adapter tests ran.

## Important remaining limits / next work
1. This is an Idli planning pilot, not a certified industry workforce optimizer. Proposed two positions are checked against entered task windows; automatic minimal headcount search is NOT implemented. Do not call this complete for all dishes.
2. Side cooking duration is imported from complete Recipe Master timing and scaled by quantity/yield; absent timing blocks generation until supplied. Prep/portion/wash/packing inputs and existing detailed Idli defaults are explicit scenario assumptions. Do not market them as measured industry standards.
3. Regular allocated labour is an explicit batch input. Role/position CTC → automatic allocation and reverse take-home payroll integration remain pending. No staff/payroll records are created here.
4. Rotational availability is owner-confirmed, not yet automatically checked against a full outlet roster. Previous-day rest/skills/equipment review remains explicit.
5. Same-day reserved windows detect overlap; they deliberately do not pack work into passive gaps. Whole-day lunch integration and other production dishes are next phases after Idli UAT.
6. Full labour-inclusive price is shown separately; existing direct pricing remains for compatibility. Downstream break-even uses the saved expenses line, not the item labour allocation. Final cross-report reconciliation still needs verification.
7. Google backend has no proven atomic compare-and-swap. Client reread/token protections reduce stale writes, but do not guarantee cross-device race exclusion.

## Tests / 111Q evidence before publishing
DESIGNED / OWNER APPROVED: YES for reviewed flow. IMPLEMENTED: local files ready. CODE CHECKED: changed JS/HTML parse. AUTOMATED TESTED: PASS payment modes, missing/zero, reserved duties, pending→confirmed coverage, short window, deadlines, date/quantity, recurring expense, backup/readback and stale-save fake adapter. BROWSER TESTED / DEPLOYED / LIVE VERIFIED: pending this release. OWNER UAT ACCEPTED: NOT YET. Existing Recipe Master migration UAT remains NOT RUN.
Post-test 5PV: PRO—explicit roles, coverage and cost; CON—reference timing/roster/payroll limits; CONNECTIONS—one support record feeds item pricing and expense projection; OBSERVER—unknowns block or remain labelled, no fixed 80-minute assumption; OWNER—requested deployment, later UAT required.

## Exact continuation
Fetch main; read AGENTS + this latest section + universal design master. Inspect current live changes, run support tests. First finish any release validation listed above. Then let Owner exercise Idli accept/save/reload and support payment before expanding. Do not restart the mockups or replace Method 2 / Recipe Master. Keep the handover current after every material change.

---
# Historical handover (23 Sep; superseded where explicitly stated above)

# BOBS / UDANE — CURRENT 111Q CODEX HANDOVER

**Date:** 23 Sep 2026  
**Repository:** `jothish2000/BOBS-OUTLETS`  
**Latest material HEAD before this handover update:** `3476850b800c55fed40683a9dc80214705f8c794`

## 0. READ THIS FIRST

Continue from the **current repository HEAD**. **Do not restart architecture, do not rebuild already-completed Method 2 / Recipe Master work, and do not overwrite existing durable data merely because a rewrite is easier.** Inspect current source before editing.

Repository-root `AGENTS.md` is now the mandatory Codex startup/continuity instruction. Codex must read:

1. `AGENTS.md`
2. `CODEX_HANDOVER_111Q_CURRENT.md`
3. `OVERALL_DESIGN_MASTER_111Q.md`
4. the actual current source files involved in the requested task
5. any intervening commits when the handover's recorded HEAD is older than current `main`

Canonical working rule:

**111Q = 111Q5PVDDRT**

- **5PV:** PRO / CON / COMPARE & CONNECTIONS / OBSERVER / YOU-OWNER.
- **First D:** universal Developer/Codex handover continuity.
- **DR:** first four views inspect both business/logic and code/software.
- **T:** mandatory Tester stage after implementation.
- Test evidence must feed back through post-test 5PV-DR before completion.
- Owner is the final decision-maker.

`OVERALL_DESIGN_MASTER_111Q.md` has now been upgraded to v3.0 and also uses `111Q5PVDDRT`.

### Mandatory continuity/completion rule

A material BOBS change is **not complete** until `CODEX_HANDOVER_111Q_CURRENT.md` is updated in the same work cycle. This applies whether the change was made from ChatGPT, Codex or another capable development agent.

The next agent must inspect the present state first and extend it. It must not start from memory, an old branch, an older handover or a generic replacement implementation.

## 1. CURRENT OWNER-APPROVED BUSINESS ARCHITECTURE

BOBS designs an outlet from the intended menu:

`Outlet Setup -> Method 2 menu -> production quantity -> Recipe Master -> batch/equipment/labour -> staff position requirement -> Staff Master/person -> labour cost -> outlet economics -> break-even.`

Locked principles:

1. **One Recipe Master is the single source** for recipe ingredients, yield, raw-material costing, directly attributable production fuel/energy, preparation timing, equipment timing and required role.
2. Workload & Staffing must **read timing from the same Recipe Master recipe**; never maintain a separate staffing recipe.
3. **Actual COGS** contains food/raw material + directly attributable recipe energy/fuel + applicable packing/condiments. Labour and fixed expenses remain outside Actual COGS and belong in outlet economics.
4. Menu staffing rule is **MENU -> ROLE -> POSITION -> PERSON**. Positions remain even if an employee changes.
5. Vada/Snack Master is a separate specialist by default. Do not silently treat the Tiffin Cook as the Vada Master.
6. Same Cook position may be reused across morning/lunch only when timeline/capacity proves it.
7. Shared preparation is counted once only when genuinely shared and Owner chooses shared production.
8. Idli/Vada must never use `COOKED_RICE_BASE`.

## 2. CURRENT SMALL-OUTLET RECIPE STANDARD

The Owner explicitly requested conservative opening batches for a first-time small outlet. Recipes must scale later, but current defaults are intentionally small.

Representative opening standards now encoded:

- Vada: **50 pieces**.
- Bonda: **50 pieces**.
- Onion Bajji: **30 pieces**.
- Vazhakkai Bajji: **30 pieces**.
- Bread Bajji: **30 pieces**.
- Other fried snack lines: generally **30 pieces** unless product-specific logic says otherwise.
- Sandwich / roll / puff: generally **20 pieces**.
- Hot beverage standard: generally **20 cups**.
- Cold beverage production: generally small 10-20 serving batches.
- Idli: preserve the existing operational Idli recipe; standard steamer capacity/timing data is attached without replacing the saved Idli formulation.
- Variety rice: small initial batch, generally **25 servings/packets per rice type**.
- Poriyal: standardised around **6 kg cooked**, approximately 100 portions at 60 g.

These are planning standards, not immutable production truth. Actual outlet trial production must later calibrate yield, oil absorption, LPG consumption and RM rates.

## 3. RECIPE DATA SCHEMA / EXPECTED FIELDS

Current standard recipe records may contain:

```text
name
kind
category
yieldQty
yieldUnit
ingredients[]
guideDailyQty
standardVersion
standardSource
sharedBase
condiments[]
productionTiming {
  prePreparationMin,
  setupMin,
  activeMinPerCycle,
  machineMinPerCycle,
  finishMinPerCycle,
  cleanupMin,
  role,
  equipment,
  canParallelize,
  prePreparationNote
}
fuel { type, usageKg/ratePerKg OR electricity metadata }
helperEligible[]
planningNote / guideNote
```

Direct energy is also represented as costable ingredient rows such as:

- `LPG fuel`, quantity in kg, rate per kg;
- `Electricity`, quantity in kWh, rate per kWh.

Current seed planning rates include commercial LPG derived from ₹2,916.50 / 19 kg and EB planning rate ₹11/kWh. These are editable planning rates and must later be replaced by actual invoice/outlet rates when available.

## 4. RECIPE MASTER MIGRATION RULES

`recipe-master.html` now performs a safer standards migration:

- merge current BOBS small-outlet seed recipes into Google Recipe Master;
- preserve existing matching ingredient rates where applicable;
- preserve existing unrelated recipes;
- specially protect Idli so its existing ingredient formulation/yield is not replaced merely because the standard seed changes;
- add missing Idli timing/energy fields around the preserved recipe;
- create a Google recovery snapshot before a material standards migration;
- show raw-material cost, energy cost, total batch cost, unit cost and timing/lead-time information.

**Never replace the whole Google Recipe Master with a smaller seed list.**

## 5. CURRENT PRODUCTION RECIPE FILES

Material files:

- `recipe-guide-seeds.js` — current small-outlet standard recipes for eligible production items across Snacks, Hot Beverages, Cold Beverages, Breakfast and Lunch. Includes ingredients, batch sizes, timing, role/equipment and direct LPG/electricity inputs.
- `poriyal-recipes.js` — Cabbage, Carrot, Beans, Beetroot, Carrot-Beans and Potato Poriyal standards; ~6 kg yield with labour/timing and LPG.
- `recipe-master.html` — Google-first master, migration/backup/read-back architecture, ingredient editor, costing display and timing display.
- `shared_data.js` — legacy catalogue/source data. Historical array index stability matters to Method 2.
- `bobs-config.js` — contains safe snack-catalogue extension logic to avoid shifting historical Method-2 snack indices when adding Onion/Vazhakkai Bajji.
- `AGENTS.md` — repository-level Codex continuity/non-destructive startup rule.
- `OVERALL_DESIGN_MASTER_111Q.md` — universal 111Q v3.0 governance.
- `CODEX_HANDOVER_111Q_CURRENT.md` — living latest-state project handover and completion gate.

## 6. CONDIMENT / SIDE ARCHITECTURE

Current intended condiment production model:

### Tiffin / Idli
`Idli -> Idli Sambar + Coconut Chutney`

### Lunch
Selected lunch rice products may include:
`Rice Sambar + Potato Poriyal`

Other existing Poriyal recipes are also available through unified Recipe Master / side logic:

- Cabbage Poriyal
- Carrot Poriyal
- Beans Poriyal
- Beetroot Poriyal
- Carrot Beans Poriyal
- Potato Poriyal

Do not double-count the same accompaniment when one shared batch serves multiple selected items.

## 7. RECENT MATERIAL COMMITS

Recent recipe/staffing-related implementation chain:

- `af2dbe3358b9a54b98cf399622ceda7998b24042` — condiment labour timing + Potato Poriyal metadata.
- `7e9fd81215b84d633fa81b54c1e19b2ef65a9627` — timing/energy display in Recipe Master.
- `420db64a0f94e2f903be77211ada035f275ad9c4` — existing Poriyals loaded into unified Recipe Master.
- `1e286480efdd5fb32f8876cb58a8955b438b988c` — Vada guide recipe/costing/specialist labour upgrade.
- `28d2849a15ce7aa7eb41db8395b9192d948c275f` — Vada production metadata merged safely into Recipe Master.
- `1e59bbdb35ea17e37016eac51fd8a428d2398858` — Onion Bajji added to snacks catalogue.
- `c5417212119d785bee680b5ee8a8f3c3b404a632` — initial small-outlet snack batch standardisation.
- `69f14370e07d66fb07f32f02bcade1c2b2d3cca5` — production recipes upgraded broadly to small-outlet standards with energy COGS.
- `25cc4562350a8923491a323c22cc813e3a73afce` — Poriyal batches standardised with labour + LPG COGS.
- `d22ae884c0d0271ca26bbe101910788e95762578` — Recipe Master upgraded to small-outlet standards, fuel-inclusive COGS and safer migration.
- `81627ebc1002cf5bb260b46495a9fd3293db03f3` — migration hardened and total lead-time display added.
- `c289cea2336226b9589b50c08ae5a190582fd71a` — Onion/Vazhakkai catalogue extension made index-safe.
- `bef88c07b5619c523fe9c5cb4d204261fe9d9209` — living current Codex handover created.
- `a613271ead4e31669ddb415af186c7be41b2ecce` — repository-root `AGENTS.md` continuity/non-destructive guard added.
- `3476850b800c55fed40683a9dc80214705f8c794` — universal 111Q master upgraded to `111Q5PVDDRT` and handover-completion gate.

## 8. RECOVERY POINTS

Important recovery refs:

- `recovery/pre-condiment-labour-recipes-v1` -> `ce7ba3c8ec3d5a679635fa5976ca3edd641ad304`
- `recovery/pre-small-outlet-recipe-standard-v1` -> `28d2849a15ce7aa7eb41db8395b9192d948c275f`
- `recovery/pre-full-small-outlet-recipe-upgrade-v2` -> `c5417212119d785bee680b5ee8a8f3c3b404a632`
- `recovery/pre-workload-timeline-fix-v2` -> `a2fab90f3b084a5230883b0bdb2f5d043fa78fca`
- `recovery/pre-codex-continuity-guard-v1` -> `bef88c07b5619c523fe9c5cb4d204261fe9d9209`

Use surgical rollback. Do not overwrite operational Google data while reverting code.

## 9. WORKLOAD / STAFFING STATUS

Existing workload implementation:

- `workload-core.js` computes cycles, equipment minutes, active minutes and elapsed production window.
- `workload-planner.html` imports selected Method 2 items and Recipe Master timing.
- production window is separated from active human labour and equipment occupancy.
- stale invalid `COOKED_RICE_BASE` is sanitised for Idli/Vada.

### IMPORTANT CURRENT LIMITATION

The scheduler is still simplified. It treats a recipe as one contiguous production window:

`setup + cycles(active + machine + finish) + cleanup`

It does **not yet** create a detailed per-stage/per-cycle Gantt that can place other active work into passive machine periods.

Therefore it cannot yet rigorously prove that Cook1 can perform Idli + Sambar + Chutney + Lunch by using steamer passive gaps. It also does not yet fully expand parent products into linked condiment workloads automatically.

## 10. OWNER'S CURRENT STAFFING DIRECTION

For the next staffing exercise, test **Cook1 + Helper1 first** before recommending Cook2.

The intended logic is:

- Cook1 handles skilled cooking and specialist Tiffin/Lunch tasks.
- Helper1 can wash, peel, cut, carry, clean, portion and pack where recipe metadata marks helper-eligible tasks.
- passive steamer/boiling/cooking periods should be usable for compatible work.
- only recommend Cook2 if skilled active-work overlap / ready-by time proves Cook1 + Helper1 insufficient.
- do not create separate morning and lunch cooks simply because the same role appears in two dayparts.

Owner has not yet locked the final whole-day Cook1 + Helper1 schedule.

## 11. PENDING WHOLE-DAY PRODUCTION TEST

Menu scenario under discussion:

### Morning
- 360 Idlis
- Idli Sambar
- Coconut Chutney

### Lunch
100 packets total:
- 25 Sambar Rice
- 25 Lemon Rice
- 25 Curd Rice
- 25 Pudina/Mint Rice

plus:
- 100 small Rice Sambar portions
- 100 Potato Poriyal portions

### Snacks opening-batch example
- 50 Vada
- 50 Bonda
- 30 Bread Bajji
- 30 Vazhakkai Bajji
- 30 Onion Bajji

A lunch **ready-by time** is still required before final Cook1 capacity can be decided.

## 12. TEST / RELEASE STATUS — BE PRECISE

At this handover:

- **DESIGNED:** YES — current small-outlet recipe + staffing architecture and Codex continuity architecture.
- **OWNER APPROVED:** YES for small-batch strategy, unified Recipe Master, energy in recipe COGS, separate Vada specialist logic, Cook1+Helper1-first staffing test, and inspect-before-edit continuity/data-loss prevention.
- **IMPLEMENTED:** YES for current recipe/cost/timing/catalogue code and repository-level Codex continuity guard.
- **CODE CHECKED:** YES for the continuity documents/configuration; recipe source previously inspected.
- **AUTOMATED TESTED:** NOT VERIFIED for the complete latest full recipe-upgrade chain.
- **BROWSER TESTED:** NOT RUN for the latest full Recipe Master migration.
- **DEPLOYED / PUBLISHED:** repository main contains the continuity implementation; GitHub Pages runtime is not relevant to `AGENTS.md` behavior itself.
- **LIVE VERIFIED:** NOT YET for the latest full Recipe Master migration.
- **OWNER UAT ACCEPTED:** NOT YET for the latest full Recipe Master migration.
- **REGRESSION STATUS:** continuity change is documentation/instruction-layer only; no production calculation code was changed by this continuity implementation.
- **RECOVERY POINT AVAILABLE:** YES — `recovery/pre-codex-continuity-guard-v1` plus earlier module recovery refs.

Never convert code inspection into browser/live verification.

## 13. EXACT NEXT CODEX ACTION

1. Fetch current `main` HEAD and read `AGENTS.md` first.
2. Read this handover and `OVERALL_DESIGN_MASTER_111Q.md` v3.0.
3. If current `main` is newer than the material HEAD recorded above, inspect intervening commits before changing anything.
4. Browser/UAT test `recipe-master.html` on GitHub Pages:
   - page loads;
   - Google Recipe Master loads;
   - migration backup is created before standards upgrade;
   - migration/read-back succeeds;
   - Idli existing formulation is preserved;
   - Vada 50, Bonda 50, Onion Bajji 30, Vazhakkai Bajji 30, Bread Bajji 30 are present with ingredient/timing/energy data;
   - poriyals are present;
   - energy contributes to batch COGS exactly once;
   - no duplicate recipes appear;
   - save/reopen/read-back works.
5. Verify Method 2 item selection still maps historical snack selections correctly after Onion/Vazhakkai additions.
6. Upgrade Workload & Staffing so selected parent products expand to linked condiment workloads and detailed active/passive stages can be scheduled without simply summing elapsed time.
7. Build the Owner-requested **Cook1 + Helper1 whole-day timeline** using Recipe Master timings.
8. Feed actual tester findings through post-test 5PV-DR.
9. If any latest full-upgrade test fails, repair/retest before calling the work complete.
10. **Update this handover after every material implementation before declaring completion.**

## 14. DO NOT CHANGE WITHOUT OWNER DECISION

- Do not overwrite the existing Idli ingredient recipe merely to match a seed recipe.
- Do not merge Vada Master into Tiffin Cook by default.
- Do not include labour/fixed expense inside Actual COGS.
- Do not double-count shared condiment/shared-base work.
- Do not shift historical Method 2 catalogue indices.
- Do not infer Cook2 automatically from total labour minutes; run capacity/timeline first.
- Do not silently treat guide rates/batch assumptions as measured outlet truth.
- Do not reset/shrink/replace Google-backed operational data to make a new implementation easier.
- Do not start from an old handover/branch when current HEAD contains newer work.

## 15. PORTABLE CONTINUATION COMMAND

> Continue BOBS from current HEAD. Read `AGENTS.md`, `CODEX_HANDOVER_111Q_CURRENT.md` and `OVERALL_DESIGN_MASTER_111Q.md` first. Apply canonical 111Q as **111Q5PVDDRT**. Inspect the current source, durable Google-backed data flow and intervening commits before edits. Preserve recovery and existing data. Extend the existing architecture instead of restarting it. Test the actual result and update `CODEX_HANDOVER_111Q_CURRENT.md` before declaring any material change complete.


---
## Live continuation ledger — 27 Sep 2026 laptop Codex
INTENT recorded before branch preparation in CODEX_RECOVERY_20260927.md. RESULT: recovered current source at 6eda291 on codex/equipment-verification-20260927; stale local main and untracked owner documents retained. No operational data writes. Next: run equipment/connected tests and verify deployment; log findings before repairs.


Verification checkpoint: existing equipment regression PASS locally (node tests/equipment-planner.cjs). GitHub API confirms regression run 36292898858 SUCCESS and Pages run 36292932895 SUCCESS at 6eda291. Browser/live save NOT RUN. Source review found Save active before load, unverified backup writes, no baseline stale-save guard, readback checks decisions only, and zero EB rate replaced with 11 by UI. INTENT: reproduce persistence/UI defects with isolated fake-adapter tests; no Google writes. If reproduced, repair bounded first-slice lifecycle using existing backup/readback/optimistic reread pattern; preserve schema/owner decisions. Scheduler and Asset Master expansion deferred until this verification checkpoint is reliable.


TEST RESULT: new isolated persistence suite reproduced 7 failures / 8 tests: failed-load save, stale overwrite, unverified backup, backup-window race, EB-rate readback mismatch, zero rate, invalid rate. Baseline normal-save test passed. INTENT BEFORE REPAIR: gate save until complete load; snapshot baseline separately; verify backup before write; reread baseline after backup; verify full submitted payload; preserve zero and reject invalid numeric inputs; block overlapping load/save. Use optimistic protection only, not an atomic concurrency claim. Add tests to existing CI. No Google data mutation.


IMPLEMENTATION RESULT: equipment-planner.js now gates load/save, preserves independent baseline, verifies backup and full plan payload, and validates form numbers; equipment-planner.html disables Save initially; CI includes persistence tests. Existing equipment derivation and owner modes unchanged. Next: syntax check and run persistence plus existing engine regressions; repair actual failures.


Inspection during retest: render retained its old zero-rate fallback because the scripted replacement did not match. INTENT: correct render to use the validated saved rate and strengthen zero-rate test with a powered Puff fixture and visible total assertion. This is a repair of the same recorded defect.


RETEST RESULT: all 8 persistence tests PASS, including powered Puff zero-rate display. JavaScript syntax PASS. git diff --check reported only extra blank lines at EOF; INTENT: normalize those endings. Next: headless Chrome fixture checks (mock Google only), then read-only deployed planner load; preserve distinction from live save/readback. Computer Use skill read but its required node_repl tool is unavailable; native Chrome headless CDP used for web testing instead, not Windows UI automation.



FINAL CHECKPOINT INTENT: preserve verified local implementation in a Git commit containing only the seven task files listed above. Do not stage the four owner-supplied untracked documents. Publication remains pending Owner release decision. Browser result: local fixture PASS; deployed prior code read-only PASS; live Google writes NOT RUN. Exact next action: review/publish bounded repair, then live verification and scheduler scope review.


CHECKPOINT RESULT: implementation and verification committed locally as 1f794fb (Protect equipment planner load and verified saves), seven intended files only. No push or deployment performed. Next action remains Owner release decision on this tested repair. This documentation-only follow-up records the immutable implementation checkpoint.



RELEASE RESULT: normal push to origin/main succeeded at f7fa794, preserving remote history. Deployment/CI verification in progress. Exact next action: confirm Actions completion, compare served planner source, run read-only live browser check.




CHECKPOINT 1 RESULT: added pure cost/storage helpers, outlet recipe override integration in shared Method 2 calculations, explicit UUWP basis, and dual-column production editor. Shared recipe editing now uses verified immutable chunks plus backup before activation, correcting the old direct oversized-master write path. No operational data changed. Next: test these rules and integrate workforce/salary/expense pages.


CHECKPOINT 2 RESULT: staffing now has separate covered-workforce save before salary; required positions appear in Staff Master without creating employees. Reverse THP page calculates employer cost from explicit monthly amounts, uses actual calendar days, supports existing-employee linkage, and requires explicit expense allocation/exclusion. Normal flow and manual/emergency flow separated. Next: connect full-cost reader and outlet staff-expense projection, refresh workload quantities and add regression/browser coverage.


Query1 integration checkpoint: recipe and workforce pages written; integration script stopped on a versioned script tag anchor. No data writes. Repair exact anchor, then integrate daily expenses and test; implementation remains unverified.

Query1 checkpoint 3: exact script anchor repaired; full-cost reader integrated, source quantities imported, duplicate shared workloads blocked, fixed-expense calendar division and verified saves added. Required positions remain distinct from employees. No live operational writes. Next: syntax, pure rules, save failure/conflict tests, and browser fixture end-to-end; NOT RUN until results below.

Query1 Tester checkpoint: syntax 17 scripts PASS; nine new pure/persistence tests PASS; Idli support, recipe standards (104), recipe sync, recipe shards, Method2 order recovery PASS. Browser fixture setup missing queueMicrotask repaired; floating-point assertion corrected to tolerance (39000/30 equals 1299.9999999999998 across positions). Browser reaches workforce and salary save. Existing method2-commerce and component-packing fail unchanged at baseline e83d940 as well as current; NOT marked passed. Next finish browser end-to-end, stale guards and recipe-shard save tests.

Browser checkpoint: all new screen transitions and final price passed, but runtime exception detected in pre-existing workload-idli-bridge.js (missing closing brace in findIdli). Repairing that connected bridge and showing new workforce state. Eleven new rule/store tests PASS, 7 selling-price and 8 equipment persistence tests PASS. Reconciliation test also failed and baseline comparison pending. No live data writes.

Query1 final implementation checkpoint: all 11 new pure/store tests PASS; end-to-end desktop Chrome test PASS with saved 50 yield preserved, selected 120 reference scaled to 360, sambar/chutney, stale workload15 corrected, covered workforce -> required positions -> Reverse THP -> calendar-day salaries -> rent/excluded LPG -> full-price display; salary reload, expense save, stale expense and stale quantity guards PASS; zero runtime errors. Visual review of recipe columns, salary page and full-cost item performed. Three historical suites (commerce/component-packing/reconciliation) fail identically at baseline e83d940; not new failures and not marked passed. Workload bridge missing brace and recipe editor missing core dependency repaired during tests. Owner now requests portable browser-Work handover; no whole-project localStorage migration authorized or performed. Next: commit tested source, export portable source/111Q/handover package, document exact deployment state and next action.

Final portable-source audit: recipe link target for a separately sold side now converts sales-pack quantity to native recipe output (for example 10 x 200 ml = 2 L), rather than labelling 10 packs as 10 L. Idli piece output remains unchanged. Pure and complete browser tests rerun before final export.

FINAL TESTED HANDOVER: native recipe link regression PASS; total 12 new tests PASS; complete Idli+sides browser test rerun PASS with zero runtime exceptions. Final package exports the source commit, handovers, 111Q references and original query; every packaged file is SHA-256 checked. Source and handover branch are on GitHub; main remains e83d940. No release or Google-data write performed. Exact next action remains release decision/deployment verification, then Owner normal UAT in browser Work.

## 29 September 2026 — Method 2 Page Guide clarity, intent
Owner screenshot of outlet-method-flow embedded Method 2 Page Guide shows STEP 2 ambiguous: “Complete the selected item setup” and “Review selected items” do not say that the button scrolls to the table and that each row has “Edit item ↗”. Current main d7b9c18 inspected: method2-list.js setGuide/render/open, method2.html selectedCard and Overall COGS links, outlet-method-flow iframe. INTENT: replace the vague instruction with exact click sequence and a distinct shared-packing-only action; keep existing data readers, calculations and navigation intact. Code recovery d7b9c18; no Google write. Tester will check both guide branches and links, then record results before publication. Four-view: PRO clearer mobile next action; CON avoid claiming scroll opens editor; COMPARE item and shared packing blockers differ; OBSERVER expected result and next button must match actual UI. Owner requests this clarity correction.
IMPLEMENTATION RESULT: method2-list.js now gives the selected-item scroll/button/edit/save/reload sequence when items remain incomplete, and a separate Overall COGS link when only shared packing is incomplete. No calculation or persistence code changed. INTENT: run syntax/diff checks and inspect rendered Page Guide behavior before release.
TEST INSPECTION: syntax and diff checks PASS. Found a connected UI inconsistency: incomplete recipe/packing cost can be counted by guide while table status still says “Saved to Google”. INTENT: make the row status explicitly “Cost inputs incomplete — edit item” when calculation reports missing inputs, and mention it in guide, without changing saved data or cost calculation. Then rerun checks.
RETEST RESULT: JavaScript syntax and git diff whitespace checks PASS. The table now marks missing cost inputs explicitly; the guide points to that exact row status and “Edit item ↗”. Item-incomplete and shared-packing-only branches are distinct. No live Google save/readback was run. INTENT: publish this one JS file with Owner-requested guide correction, verify Pages and read-only live text, then update repository handover. If external upload is blocked, preserve the checkpoint and report exact status.

OWNER STEER / BUTTON AUDIT: Owner asks to remove redundant controls only after checking their links and data consequences. Inspected embedded `outlet-method-flow.html` and standalone `method2.html`: the parent “Save & Continue” invokes `BOBS_METHOD2_REVIEW()` before saving the outlet method summary; the inner “Review Sold Today” invokes the same validator but does not save the summary. INTENT: hide only the inner Review button for `flow=1`; retain it standalone and retain the review dialog/validator for the parent gate. Keep the guide’s scroll link because it reaches the selected-item table, while each row’s Edit button opens the editor. Tailor guide copy to the embedded next action and correct the pending-cancel status display. No Google writes, localStorage removal, catalogue or Recipe Master changes.
LOCAL RESULT: Embedded guide now names “Go to selected items ↓”, row “Edit item ↗”, editor “SAVE THIS ITEM”, optional “Reload Google records”, and the parent “Save & Continue”. Shared-packing branch names “Open Overall COGS ↗”. Complete embedded branch points to parent “Save & Continue”; standalone branch retains staffing action. `#review` is hidden only when `flow=1`; validator and dialog still run from parent. Existing selection browser test gains assertions for standalone/embedded review visibility, guide target and embedded next action. JavaScript syntax and diff checks pass. Browser test could not launch: this runtime has no Chrome at `/opt/google/chrome/chrome`; no live browser, Google data read/write, Pages deployment or Owner acceptance claimed. Checkpoint branch `codex/guide-clarity` from main `d7b9c18` remains local pending browser verification and release. Next: run the browser test where Chrome exists, check embedded first guide and standalone review, publish only after verification, then numbered Owner retest.

RELEASE INTENT — Owner explicitly authorized immediate publication on 29 September 2026 and will do Owner retest after it goes live. Local source checkpoint `577eef7bad95073b61174a1d25f43db43b44c4db`; remote main verified `d7b9c18bffb054cf2100603e3b9ab2da2efa1d95`. INTENT: push this three-file checkpoint through the normal repository review/merge path, monitor CI and Pages, compare served JS and inspect embedded versus standalone live controls without changing Google records. Recovery baseline `d7b9c18`; data rollback separate. If automated browser test cannot run in the available environment, state that boundary precisely and use read-only live inspection, never claim Owner acceptance. Next: publish and record actual outcome.

RELEASE RESULT — Shell `git push` failed because no GitHub username/token was available there. Signed-in browser uploaded `method2-list.js` and this handover to branch `codex/guide-clarity-browser-20260929` as `32595dfd`; the focused `tests/method2-selection.cjs` assertions were added as `b3f79c3`. PR #3 merged into main at `db8a5faa6e75544dd6ee07ddf229c84eddde8f60` on 29 September 2026. Pages run #667 (`36520924428`) completed successfully. Read-only live `method2.html?outlet=1` loaded Google-backed one selected Idli row and showed the new STEP 2 wording; standalone “Review Sold Today” remained visible. In the real `outlet-method-flow.html` iframe for Outlet 1 Rasipuram, the guide displayed the exact selected-item/Edit/SAVE sequence, expected “Save & Continue”, and the duplicate inner Review button was absent. Clicking parent “Save & Continue” while Idli Sold Today remained unconfirmed opened the existing review dialog with “Idli — Sold Today needs confirmation” and did not proceed. No business value was entered or saved, no Recipe Master change, and no localStorage migration. Focused browser automation is committed but its Node suite was not executed here because local Chrome is absent. Owner numbered UAT and real save/readback remain pending. INTENT: publish this release-result handover entry, verify the documentation commit, then give Owner exact numbered retest steps. Source rollback baseline `d7b9c18`; business-data recovery remains separate.

## 29 September 2026 — One-item Method 2 selection delay, intent
Owner screenshot of `method2-select.html?outlet=1&cat=Breakfast%20Catalogue` at “Saving selection and verifying Google…” with exactly Idli selected; window eventually closes. Source main `bf7bd22` inspected: `method2-select.js` calls `M2.saveSelection` on every Save, even when selected indices and prices equal the loaded Google baseline. `method2-core.js` serially reads current METHOD2, saves and verifies a backup, rereads METHOD2, posts the whole record, then verifies readback. The count of selected items does not reduce those round trips. INTENT: add an explicit no-change fast path only when a persisted category selection exists and its selected item identities and all prices exactly match the loaded baseline. Skip Google writes/backups for that case and return immediately; retain full guarded write/readback for actual changes. Test no-op versus changed selection and price, including legacy implicit selection. Recovery baseline `bf7bd22`; no operational Google writes or migration. Five views: PRO avoids needless wait/backups; CON actual changed saves remain network-bound; COMPARE existing selection tokens/indices and price values; OBSERVER do not infer a safe no-op from visual checkbox count alone; OWNER asked to reduce delay without weakening recovery.

IMPLEMENTATION RESULT: `method2-select.js` now compares the checked persisted category indices (or saved side names) and edited price inputs to the loaded Google baseline. A genuine no-change action returns to Method 2 (or another category) immediately without backup/write/readback; an implicit legacy selection with no explicit saved category and any changed selection or price retains the original protected save path. No Google request or storage schema was changed. INTENT: add a focused regression to the existing selection browser test for no-op (zero writes) and changed price (writes), then run available checks. Do not treat syntax as browser test.

TEST RESULT / RELEASE INTENT: Existing selection browser suite now asserts that reopening an already saved two-item category and pressing Save causes zero additional METHOD2 reads/writes and closes; its existing changed-selection and failed-write checks remain. `node --check` for both changed JS files and `git diff --check` PASS. Local Chrome remains absent, so browser suite execution is blocked here. The current no-op check is deliberately limited to an explicit saved category; the screenshot alone cannot prove whether the Owner's one Idli was newly selected or already saved. INTENT: checkpoint the three-file change, publish through review on top of main `bf7bd22` under Owner's continued BOBS publication instruction, verify served source and repeat-save behavior read-only, then update release status. If browser or repository publication fails, preserve checkpoint and state exact boundary. No operational Google write or data migration in this release work.

RELEASE RESULT — One-item selection latency: PR #4 merged to main as `25e8189bc8c5cb4afa68ebb573b4cd6b9e7e1c42` on 29 September 2026. Branch `codex/selection-save-latency-browser-20260929` included `method2-select.js`, this handover, and `tests/method2-selection.cjs`. Pages run #669 (`36597311370`) was in progress at first inspection. The change skips Google backup/write/readback only when an explicitly persisted category selection and all price inputs match the loaded baseline; initial or changed saves remain serial and Google verified. Focused test source asserts no METHOD2 read/write on a repeat no-change Save, but local Chrome absence prevented executing its browser suite. No operational Google write, Recipe Master edit, catalogue-index migration, or localStorage change was performed. INTENT: verify Pages and live served script read-only, publish this result to main, then ask Owner to time two cases separately: first actual change and second unchanged repeat Save. Do not infer that screenshot showed the no-change case. Source rollback baseline `bf7bd22`; data restoration remains independent.

POST-RELEASE VERIFICATION — Pages runs #669 (`36597311370`) for PR #4 merge and #670 (`36597713419`) for this handover commit both completed successfully. Cloud browser navigation to `https://jothish2000.github.io/BOBS-OUTLETS/method2-select.js` returned `net::ERR_BLOCKED_BY_CLIENT`, so live served JavaScript and operational no-op timing were not observed in this session. Do not claim Owner acceptance. Current remote main after handover was `618b9821ad45ca975fb8e3e045b12b2956735c8f`; final documentation update will advance it. Owner retest: use Chrome on the published outlet flow; save one actual changed selection while timing the “Saving selection and verifying Google…” state, then reopen the same category without altering a checkbox or price and click Save again while timing the return. Report both durations and any status/error. If the first remains slow, measure Google request timing before changing the backup/write/readback protection. No business-data write was made for this verification.

GUIDE CLARITY INTENT — Owner identified the actual STEP 2 on-page paragraph as confusing. Current main `1cf2f9908d2ed31189fe1ed1ffc7c29b111539d7`; inspect `method2-list.js` render and `method2.html` guide/table controls. INTENT: replace the status-list-heavy paragraph with direct click instructions naming the selected item row, “Edit item ↗”, editor “SAVE THIS ITEM”, “Reload Google records” if needed, and parent “Save & Continue” only after completion. Preserve status semantics and navigation; no Google, Recipe Master, catalogue, or localStorage mutation. Recovery baseline `1cf2f99`. Five views: PRO simpler next click; CON avoid hiding incomplete items; COMPARE embedded and standalone flows; OBSERVER single Idli should name Idli; OWNER requested precise UI guidance. Next: make surgical guide text change, syntax/diff check and inspect rendered labels, then record actual result.

GUIDE CLARITY LOCAL RESULT — `method2-list.js` now names the first incomplete selected item and directs “Go to selected items ↓” → that row’s “Edit item ↗” → editor “SAVE THIS ITEM”; it separately says “Reload Google records” only if the row remains stale, and names parent “Save & Continue” only after selected items and shared packing are complete. Other incomplete items remain counted. `tests/method2-selection.cjs` assertion follows the new wording. `node --check` on both changed JS files and `git diff --check` PASS. Browser regression NOT RUN here because local Chrome is unavailable; Owner UAT NOT ACCEPTED. INTENT: checkpoint, publish under prior Owner authorization for guide wording via GitHub review, verify Pages, update this ledger with actual result. No operational data or schema touched.

GUIDE CLARITY RELEASE RESULT — PR #5 merged the three-file guide change to main as `928614e6ef16b3255b6718ae5b5548108be7adc3` on 29 September 2026. GitHub Pages run #672 (`36603517788`) was in progress at first inspection. The published source branch contains only `method2-list.js`, `tests/method2-selection.cjs`, and this handover; persistence and review controls were unchanged. Local JavaScript syntax and diff checks passed; focused Chrome suite NOT RUN locally. Live rendered guide / Owner UAT NOT VERIFIED yet. INTENT: check Pages result and publish this release-result ledger, then Owner reopens outlet Method 2 and confirms the Idli-specific next-click text. Source rollback baseline `1cf2f99`; business data rollback separate. No Google operational write, Recipe Master edit, catalogue index change, or localStorage migration.

METHOD 2 READ ERROR INTENT — Owner screenshot after saving Idli shows embedded `method2.html` status “Google Data Vault timeout” while Page Guide remains “Loading… / Checking your saved Method 2 progress…”. Current main `b528f8b0a63adcb3963057de0f15a2b7490380b6` inspected. `bobs-google-data.js` rejects JSONP read after 12 seconds; `method2-list.js` catch updates status only, leaving initial guide indefinitely. The selection window already closed; do not infer its write failed or succeeded from this later read timeout. INTENT: expose a clear read-failed guide and a retry action using existing `reload()` without any write or cache fallback, keep parent Save & Continue blocked until a verified load, then check syntax and rendered behavior if browser permits. Recovery baseline `b528f8b`; no Google, Recipe Master, catalogue, or localStorage mutation. Five views: PRO actionable retry; CON backend may remain slow; COMPARE selection save versus later Method 2 read; OBSERVER no success inference from closed window; OWNER sees next button without ambiguity.

METHOD 2 READ ERROR LOCAL RESULT — `method2-list.js` changes the Page Guide to CHECKING GOOGLE on each read, shows GOOGLE READ FAILED with the actual status error visible above it, and offers “Retry Google read” wired to existing `reload()`. No stale/cache fallback or read timeout change; parent validation still requires `ready`. `node --check method2-list.js` and `git diff --check` PASS. Local browser suite and live Google read NOT RUN; screenshot itself proves the prior 12-second JSONP timeout, not the new behavior. INTENT: publish bounded UI repair via GitHub review using prior Owner release authorization, verify Pages, then record the result. If retry times out again, investigate backend latency/network separately before altering verified save safety.

METHOD 2 READ ERROR RELEASE RESULT — PR #6 merged the two-file repair into main at `99daced89b197ce384f62cade6417e58e451de75` on 29 September 2026. Pages run #674 (`36610323883`) was in progress at first check. The guide now distinguishes a Google read failure from selection save and presents a direct retry, with no Google write or local-cache fallback. Local syntax/diff checks PASS; browser suite and live Google read NOT RUN. Owner must click retry on the published page and observe whether Idli loads; if timeout recurs, report exact error/time so the Data Vault request can be investigated. Source rollback baseline `b528f8b`; business data recovery separate. Next: verify Pages status, publish this actual-result note, and ask Owner to retry read once without reselecting/saving Idli.

ITEM EDITOR READ TIMEOUT INTENT — Owner screenshot 30 September 2026 at `method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production` shows “Google Data Vault timeout”, editor form hidden, no retry control. This is a separate screen from the Method 2 Page Guide repaired in PR #6. Current main `7b4c7dfac7a18958098662ed8c4a2e009f4a5ee5` inspected: `method2-item.js` starts simultaneous METHOD2 + shared sharded Recipe Master reads; catch only writes status, leaving form hidden. JSONP read times out after 12 seconds. INTENT: add a visible Retry Google read button to the item editor, reissue the same read-only initialization without writes or cache fallback, prevent overlapping retries, and show a specific error explaining not to save/reselect. Version the editor script URL so current Chrome gets the new code. No backend-alternate URL is established; do not pretend direct navigation can bypass the same Google service. Recovery baseline `7b4c7df`; Google records, shared Recipe Master, historical indices, and legacy localStorage untouched. Five views: PRO one-click recovery; CON repeated timeout remains backend/network investigation; COMPARE item editor differs from Method 2 guide; OBSERVER blank editor is a failed read, not proof of failed selection save; OWNER needs a clear button/URL to continue. Next: implement, check syntax/DOM source, record result, publish under continued Owner authorization, verify Pages, request read-only Owner retry.

ITEM EDITOR READ RETRY LOCAL RESULT — `method2-item.html` now exposes a hidden-until-error “Retry Google read” button and versions the script URL; `method2-item.js` turns the initial read into guarded `loadEditor()`, shows the actual failure and retry button, prevents overlapping retries, clears rebuilt condiment choices on retry, and keeps the editor form hidden until verified METHOD2 + Recipe Master reads finish. No read from stale cache, no write, and no alternate endpoint introduced. `node --check method2-item.js` and `git diff --check` PASS; browser suite NOT RUN because local Chrome is absent. A repeated timeout across list and editor suggests Data Vault/network latency but its cause is NOT VERIFIED. INTENT: checkpoint and publish this bounded read-only recovery UI through GitHub review under continued Owner publication authorization, confirm Pages; then Owner retries once and reports result before business edits. Code rollback baseline `7b4c7df`; data rollback separate.

ITEM EDITOR READ RETRY RELEASE RESULT — PR #7 merged the three-file repair into main as `16b73b9594a941b6c82956f8b7db25371b7bbe7b` on 30 September 2026. Pages run #676 (`36617734621`) was in progress at first inspection. The editor displays “Retry Google read” only after a failed read; retry is read-only, retains the saved-data gate, and does not create a new Google endpoint. Syntax/diff checks PASS; browser fixture, live read success, and Owner UAT NOT VERIFIED. INTENT: verify Pages, publish this result note, then Owner reloads the exact Idli editor URL and clicks Retry Google read once if needed. A repeated timeout requires diagnosing the shared Apps Script Data Vault rather than saving or reseeding anything. Recovery source `7b4c7df`; data rollback remains separate.


SOLD TODAY PLACEMENT INTENT — 30 September 2026 (111Q5PVDDRT). Owner approved one editable Sold Today input in the supply/quantity section, visible in Production and Purchased modes; bottom totals remain read-only. Git fetch blocked by unavailable browser-proxy; GitHub browser commits confirmed current main 7b1840d70741349a655ba21fbe364563542aaf71 matches local origin/main. Full AGENTS, universal master and handover read; inspected method2-item.html/js, method2-item-ux-v2.js and workspace CSS. Fresh branch from that main; recovery is that immutable commit. PRO clearer quantity sequence; CON avoid duplicate IDs or mode-hidden mandatory input; COMPARE ID-based pull/input/save/validation remain unchanged; OBSERVER do not conflate displayed calculations with confirmed Google save; OWNER approves layout only. INTENT: move existing sold/soldUnit/soldError label after quantitySummary, outside mode-hidden fields and before packing, add explicit 0/missing guidance, retain bottom Save and status. No schema/formula/cache migration or Google write. Then validate structure, unchanged JS connections and available runtime checks; publish under ongoing authorization if checks permit. Save verification recovery/guide redesign and backend timeout diagnosis remain separate pending work.

IMPLEMENTATION RESULT — Moved only the existing Sold Today label/input/unit/error markup into #soldTodayFields after #quantitySummary, before packing; retained IDs, attributes, listeners and bottom save/status. Help explicitly distinguishes blank from 0. #soldTodayFields is outside Production/Purchased hidden controls; original bottom totals unchanged. INTENT: verify parsed DOM containment/order and single IDs, unchanged runtime source, syntax and diff; do not run a Google save for a layout change.

TEST RESULT / RELEASE INTENT — Parsed HTML checks PASS: exactly one sold/soldUnit/soldError, same editor form/fieldset, unchanged input attributes except help reference, after quantitySummary/before mainPacking, outside mode-hidden controls, absent from savebar. method2-item.js, core and UX source are unchanged; syntax and diff checks PASS. No new permanent test for this reversible markup move. Browser interaction/live Google save NOT RUN; previous timeout and save-confirmation defects remain unresolved. Post-test PRO quantity grouping verified in source; CON runtime/mobile pending; COMPARE persistence and calculation paths byte-unchanged; OBSERVER no claim of Google success; OWNER layout approved, UAT pending. INTENT: publish the two-file layout/handover patch via GitHub UI, observe Pages, attempt read-only live check. Numbered Owner retest: (1) open Production, Sold Today after quantity summary; (2) enter intended quantity and check totals; (3) switch Purchased, Sold Today stays visible and keeps value; (4) switch back, quantity retained; (5) clear and Save must request Sold Today; (6) restore intended figures and save only if actual inputs are correct, accept only Verified in Google. No test write by agent.

RELEASE RESULT — PR #8 merged two files into main at 237b5d30c658714e13adabac34ba150d161d97a7. Browser branch commits: layout 7df2caaf9f440718e1ed06300da487ef83c60e52; handover 1fef796c8b0fc9400dffe5f72ae82e44c6dd7731. GitHub browser confirmed no conflicts before merge. IMPLEMENTED/CODE CHECKED; Pages/live/Owner UAT pending. INTENT: inspect Pages result and attempt deployed read-only editor load; record actual boundary, publish updated ledger and checkpoint. Source rollback 7b1840d; data rollback separate, no operational writes.

LIVE CHECK RESULT / MODE TEST INTENT — Pages #678 run 36625478028 build/deploy succeeded. Deployed editor loaded Google read-only; DOM confirms one #sold in #soldTodayFields and none in savebar. INTENT: switch this agent-opened editor Production -> Purchased -> Production without changing quantities or saving, check Sold Today visibility/value and read-only summary, then inspect screenshot. No Google write; discard agent-only unsaved mode changes after test.

LIVE MODE RETEST RESULT — Deployed Idli editor loaded Google successfully in this observation (not proof timeout is resolved). Production: 360 made/290 sold, single Sold Today visible after quantity summary. Switched Purchased without save: capacity hidden, Sold Today visible/value 290, bottom summary 290. Switched back: capacity visible, Sold Today visible/value 290 and bottom totals return to production commitment. Screenshot sold-today-live-20260930.jpg captured. No Save clicked, no Google write; agent-only mode edits are discarded on closing test tab. BROWSER TESTED/LIVE VERIFIED for desktop placement and mode retention; mobile and actual save/readback NOT RUN, Owner UAT pending. Existing mandatory missing/zero/over-supply checks remain source-unchanged. Other requested guide/save-verification redesign and timeout diagnosis remain pending and must not be claimed delivered. INTENT: publish this release-result ledger on main and create source checkpoint with manifest naming remote release and local source commit. Next executable step: Owner refreshes editor and follows numbered placement retest above; then resume actual unconfirmed-save diagnosis before adding new cost features.


## 1 October 2026 — Method 2 outlet handoff repair, WACP intent
Owner requested continue the exact Idli Purchase/Production navigation repair and test before merge. Baseline/recovery: immutable main 67611fbf8df41f7c5187395ee358864e8a41750d. Startup AGENTS/master/handover and involved source/history inspected. Live parent loads Outlet 1 Rasipuram; iframe is method2.html?flow=1 (no outlet), list resolves outlet via mutable localStorage, while Equipment link is actually equipment-planner.html?outlet= (blank). Idli row loaded from Google with Production/290 sold. Thus missing explicit route context is proven, not a Google read failure. No operational write.
5PV single-assistant passes: PRO explicit outlet preserves handoff; CON avoid expanding into storage/formula changes or claiming whole flow broken; COMPARE selector/editor already carry outlet, iframe must carry same owner; OBSERVER live Equipment blank confirms downstream consequence; OWNER continue authorizes bounded repair/test/merge.
INTENT: create recovery/task refs; add current outlet to Method 2 iframe only, retain flow=1, popup and Method 1 behavior; exercise Idli mode route in focused fixture and live read-only where available. Existing saved Google data and persistence rules preserved. Browser binding of opened selector failed with locale-override protocol error, so that popup interaction is BLOCKED until a usable test browser exists. Next: recovery refs, surgical iframe edit, record result immediately, then tests.

HANDOFF IMPLEMENTATION RESULT — Recovery ref exists locally and remotely at 67611fb. Changed only loadMethod Method 2 iframe URL to include encoded current().id; Method 1 route and existing popup/selection/editor mode handling retained. This gives inline Equipment link and list/workload consumers explicit outlet context. No schema, Google or costing write. INTENT: run focused route regression for outlets 1/2/special ID, both Idli modes, selected row context, selection saved message and blocked popup recovery, plus connected existing rules. Check actual browser availability; record failures honestly before release.

TESTER CHECKPOINT / REPAIR INTENT — New tests/method2-outlet-handoff.cjs runs actual parent/list/editor scripts in jsdom against isolated records and checks both modes and wrong-global-outlet context. First run failed in harness: separate jsdom eval calls do not share top-level lexical outlets/idx, so injected fixture did not populate actual handler closure. No application failure inferred. INTENT: inject fixture setter within the same lexical eval as parent script, then rerun. Browser Chromium download returned invalid archive; cancelled retries. Live popup binding remains protocol-blocked.

HARNESS RESULT / NEXT INTENT — Fixture setter edit introduced one excess closing parenthesis; syntax failed before execution. Correct that test-only typo and rerun, keeping production patch unchanged.

TESTER RESULT / NEXT INTENT — Actual parent route tests now PASS for 1/2/encoded IDs, blocked popup and Method 1. List fixture stopped because shared_data exports CAT_ORDER lexically in a different eval scope. Expose existing catalogue constants on fixture window after their source evaluation, matching browser global visibility, then rerun list/editor tests. No product change.

FINAL LOCAL TEST RESULT / RELEASE INTENT — Isolated jsdom execution PASS: actual parent route handlers for outlets 1/2/encoded ID, matching selector URL, blocked popup message, unchanged Method 1 URL; actual Method 2 row -> Purchase and Production -> actual Idli editor initialization for outlets 1/2, correct cost link, mode visibility and Sold Today 290 retained, wrong global outlet 999 ignored. jsdom dependency installed only in /tmp/bobs-handoff; reproduce JSDOM_PATH=<jsdom module> node tests/method2-outlet-handoff.cjs. Connected workload gate 5/5 and selling-price 7/7 PASS; syntax/diff PASS. No Google test write. Post-test PRO outlet context now consistently explicit; CON jsdom is not Chromium and live save/mobile UAT not run; COMPARE existing modes/prices/workload safeguards preserved; OBSERVER live pre-change blank Equipment outlet proves consequence; OWNER continuation authorizes bounded repair/merge, acceptance pending. INTENT: publish three-file surgical patch via task branch/PR, confirm current main unchanged before merge, then verify Pages and live iframe/Idli handoff read-only. Local recovery and remote recovery branch at 67611fb available.

RELEASE RESULT / VERIFICATION INTENT — PR #12 source c33f52f48dcb25e07befd753353c15bf5665c8ec merged cleanly into main 022033951ccdaa963c6c5b72c494ccd11a51661a. Three files: iframe URL, focused DOM regression, continuity handover. Main remained baseline 67611fb before merge. No applicable GitHub checks existed on PR head; local actual-script tests and 12 connected rule tests passed before merge. DEPLOYMENT/LIVE POST-FIX: pending. INTENT: inspect Pages run at merge SHA; reload deployed parent and verify explicit iframe outlet and Equipment link; follow Idli mode/Edit via read-only UI, never save test values to Google. Then publish actual status and exact Owner retry steps. Recovery remains remote recovery/pre-method2-outlet-handoff-20261001 at 67611fb.

DEPLOYMENT RESULT / LIVE TEST INTENT — Pages run 36901853074 at merge 0220339 completed SUCCESS. Live pre-refresh Purchase choice -> Edit opened exact URL method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=purchased. Agent parent was reloaded to new deployment; Google outlet read pending. INTENT: verify served inline route and new iframe outlet=1; inspect correct Equipment outlet; open Production Idli route. Test opens edit windows and sets local pending-edit state only; no item save or Google write. Clear that agent-only pending state using existing Keep saved version when test is over. Next publish final handover status.

LIVE RESULT / FINAL HANDOVER INTENT — Deployed inline script contains explicit Method 2 route; browser clicked Method 2 and observed method2.html?flow=1&outlet=1. Equipment link now equipment-planner.html?outlet=1 (previously blank), plus selector/Overall/Staffing all outlet=1. Google selected Idli loaded with 290 sold. Actual live dropdown/Edit opened purchased URL; after deployment Production dropdown/Edit reused same named window with URL method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production. Existing Keep saved version confirmed and row returned to Saved to Google, clearing test-only pending state. No operational save. Popup editor contents could not be bound due browser locale-override protocol error; route observations are verified, editor full initialization in both modes verified only in isolated DOM.
Status: IMPLEMENTED/CODE CHECKED/AUTOMATED DOM TESTED/DEPLOYED/LIVE ROUTE VERIFIED. Pages 36901853074 SUCCESS. Workload 5/5 + selling-price 7/7 PASS. Chromium fixture NOT RUN (invalid download); popup rendered editor/mobile/live save-readback/Owner UAT NOT VERIFIED. Recovery 67611fb retained remotely; surgical rollback affects only iframe URL, preserving records. Post-test PRO blank-outlet link corrected live; CON mobile/persistence acceptance outstanding; COMPARE both mode routes preserve outlet/category/index; OBSERVER distinguishes route evidence from editor/save evidence; OWNER UAT pending.
INTENT: persist this release record on main, verify remote content SHA; exact next Owner action: refresh supplied outlet flow -> Method 2 -> return from category selector -> choose Idli Purchase or Production in selected row -> Edit item; verify Outlet 1 and chosen mode. Equipment & assets must retain Outlet 1. Save only intended operating figures and require Verified in Google. Backend timeouts, recipe calibration and workload owner-review remain existing separate tasks.

## 1 October 2026 — Owner-reported selection skips item setup, WACP intent
Owner screenshot read successfully from attached scratch PNG (shows saved Idli in Breakfast selector); Owner reports next guidance goes straight to Workload instead of mode/quantity/Sold Today. Startup current main d26131b inspected; earlier route fix/source and handover read. Proven source defect: workload gate writes STEP 3/4 independently of list readiness/incomplete item setup and mutation-observes guide, so it can overwrite STEP 2. Reopening unchanged saved Idli emits no selection event, so existing completed values immediately skip review.
5PV: PRO restore operator sequence; CON do not reset Google records or force tests into real quantities; COMPARE selection -> item mode/supply/Sold Today -> staffing uses produced quantity, not sold-only; OBSERVER old saved record is not current review; OWNER requests repair under continued 111Q authorization.
INTENT: recovery at d26131b; mark setup review on selection return including no-change path; keep item guide/table first while review/load/incomplete inputs pending; give list a read-only item-completion predicate and render event; workload guide must respect that predicate and use render events instead of self-mutating observer; completion gate must short-circuit item failure. Preserve existing editor/mode/persistence, Google backups and all calculations. Test actual selector/list/gate together with complete saved Idli, incomplete/missing reads, both mode handoffs and workload continuation. Exact next: surgical edits then immediate result ledger.

SETUP-FIRST IMPLEMENTATION RESULT — Selector return now always notifies item review (including unchanged/no-write selection); standalone return carries setup=1. List stores outlet-local session review state, shows mode/quantity/Sold Today review before staffing, clears review only on item-save notification or explicit Keep saved version, and exposes read-only item-completion + render event. Workload guide respects completion and uses render event instead of mutating/observing its own guide. Parent completion short-circuits failed item review. Script versions synchronized across Method 2/selector/config. No Google schema/write, costing or staffing calculation change. INTENT: actual selector/list/gate regression including saved complete Idli and both editor modes, failed item reads, incomplete inputs, gate preservation, then publish only after observed passes.

INTEGRATION CHECK / REFINEMENT INTENT — Syntax/diff checks PASS. Inspection found pending editor opens must immediately redraw item-first guidance, and item saves/mode changes must refresh workload requirements instead of reusing previous gate requirements. INTENT: render after opening item, refresh gate on list-render event; consume standalone setup=1 into session state and remove only that transient query flag so subsequent reload after review does not restart it. No operational data mutation.

TESTER RESULT / RETEST INTENT — Actual saved-complete Idli -> unchanged selector Save -> list STEP 2 -> both editor modes PASS, no writes; staffing guide no longer overwrites setup. Final complete-plan assertion raced a still-active async refresh triggered by prior review. INTENT: wait for that isolated refresh to settle before changing fixture plan, rerun all integration assertions and connected checks. Product unchanged for this harness timing repair.

FINAL INTEGRATION RESULT / POLISH INTENT — Actual selector/list/workload gate integration PASS: no-change selection forces STEP 2 with mode/quantity/Sold Today, both modes pass their route, item-save reaches staffing using 360 produced vs 290 sold, reviewed workload completes, blank Sold Today and Google-read failure cannot be overridden. Earlier outlet/editor DOM suite PASS; workload 5/5 + price 7/7 PASS; no test Google writes. INTENT: clarify guide expected next stage (packing/staffing before completion), update prior browser assertion for explicit mode choice, add standalone setup/keep-saved path regression and rerun; no formula/data edits.

POLISHED RETEST / CI INTENT — All five setup-flow groups PASS including standalone setup=1 consumption and explicit Keep saved version; existing actual-route/editor tests remain passing. INTENT: add these two jsdom integrations to existing Method 2 gate CI using pinned jsdom 30.1.1 in runner temp, and trigger workflow for selection/list changes. Then publish PR, await mandatory CI, merge, verify live no-change selection -> setup guide. This makes the previously missed integrated handoff a permanent regression.

PR RESULT / RELEASE INTENT — Source 755527414fa936e584fa7bd01d0b63509a828086 published on codex/method2-setup-before-workload-20261001; PR #13 created. Push CI 36903959146 completed SUCCESS, including new pinned jsdom selector/list/gate and earlier route/editor integrations; PR CI 36903966435 initially in progress. INTENT: await PR CI success and verify base remains d26131b, merge approved bounded fix, verify Pages and live unchanged Idli selection return. No live Google writes; recovery remains d26131b.

MERGE RESULT / LIVE VERIFICATION INTENT — PR #13 merged after both push and PR Method 2 gate CI SUCCESS (36903959146 / 36903966435); base d26131b and expected head 7555274 verified. Deployment is pending. INTENT: inspect Pages at merge SHA, then open exact Breakfast selector without changing inputs, verify no-change return presents item setup rather than staffing; no Google test save. Record truthful live state and publish final handover.

DEPLOYMENT RESULT / LIVE CHECK INTENT — PR #13 merge 67a925ccbd471b3ad90d5e1691acbf8745dc0381 passed merge gate CI 36904079044; Pages 36904078680 completed SUCCESS. Live selector reload now serves method2-select.js?v=setup-first-v2. INTENT: wait for verified existing Google selection, click unchanged Save & return without touching checkbox/price, observe STEP 2 and Idli mode row in returned workspace; no operational write expected from verified no-change path. Then publish actual result ledger.

LIVE SETUP-FIRST RESULT / FINAL RECORD INTENT — Pages 36904078680 SUCCESS at merge 67a925c; merge gate CI 36904079044 SUCCESS. Agent opened exact Breakfast selector read-only, Google loaded one saved Idli; no checkbox/price changed. Clicked unchanged Save selection & return: redirected to method2.html?outlet=1 (setup flag correctly consumed). After Google load, live guide remains STEP 2 and explicitly names Idli -> Purchase/Production Mode -> Edit item -> supply quantity -> Sold Today -> Save This Item; action is #selectedCard, not staffing. Idli row shows Review Purchase/Production and today’s quantities with dropdown, Edit and Keep saved version. Previously gate showed STEP 3 staffing on this same saved state. No changed-selection or item Google save; unchanged path is source/fixture-verified no-write.
Status IMPLEMENTED/CODE CHECKED/AUTOMATED DOM TESTED/CI PASS/DEPLOYED/LIVE SELECTOR RETURN VERIFIED. Browser normal return + actual selected row verified; mobile and real item-save/readback not run. Production staffing requirement remains 360 produced in fixture, distinct from 290 sold. Post-test PRO intended next page/controls observed live; CON actual operating save/mobile remain Owner UAT; COMPARE item review now takes precedence over stale staffing guidance; OBSERVER prior route fix alone did not solve this, repaired actual guide owner; OWNER acceptance pending. Recovery remote recovery/pre-method2-setup-before-workload-20261001 at d26131b.
INTENT: publish this actual release ledger on main, verify content, then give exact Owner retry: refresh selector/outlet flow -> save Idli selection -> Go to selected items -> Idli Mode Purchase/Production -> Edit item -> intended supply and Sold Today -> SAVE THIS ITEM / Verified in Google -> remaining packing/workload. Keep saved version explicitly accepts existing mode/quantities; it does not overwrite or delete Google data. No other feature expansion in this repair.


## 2 October 2026 — Recipe Cost Editor unusable top Recipe control, WACP intent
Owner supplied live screenshot and exact URL for Idli production recipe editor. Observed production-mode page exposes the legacy top-level `Recipe <select id="recipe">` as a tiny disabled/blank-looking control while the actual editable reference-source selector lives inside the two-column production editor. The same route carries `qty=360`; target quantity must be visible immediately and remain 360 once Google-backed recipe/state load completes.
5PV: PRO remove misleading unusable control and make current recipe identity explicit; CON do not enable cross-recipe switching from an item-specific route or alter recipe/master persistence; COMPARE production route should display fixed selected item + editable Reference source, while non-outlet shared Recipe Master editor keeps its existing recipe selector; OBSERVER screenshot proves current production UX is misleading even though the route identifies Idli; OWNER requested immediate fix.
INTENT BEFORE IMPLEMENTATION: recovery branch `recovery/pre-recipe-selector-fix-20261002` preserves main 39cacde741701a31c2d0809892b39ac2919aa667. On task branch, in production mode only, replace/hide the legacy selector presentation with a clear static current-recipe display sourced from the URL/item and loaded master; keep the internal select for existing code but not as an unusable user control. Preload `targetQty` from positive `qty` URL before async Google reads, then confirm loaded show() preserves it. Do not change reference scaling, saved source choice, Google schema/writes, costing, or shared Recipe Master editor behavior. Add/adjust focused regression evidence, then record results before PR/merge.

IMPLEMENTATION RESULT — Production mode now hides the legacy top Recipe dropdown instead of presenting a disabled blank-looking control. It inserts a clear static `Recipe: <item>` display, initially from the route and then from the loaded Recipe Master. The real `Reference source` selector in the right-hand Small-hotel reference panel remains the editable source choice. The positive `qty` route value is copied into Intended output quantity immediately after the production UI is built and show() reaffirms it after Google-backed load; shared Recipe Master (no outlet) behavior is untouched. No persistence/schema/formula change. INTENT: inspect resulting source/syntax and add focused regression coverage for production-mode static recipe identity + qty=360 while preserving non-outlet selector behavior, then run available CI before release.

REGRESSION COVERAGE RESULT / RELEASE INTENT — Added `tests/recipe-production-ux.cjs` to lock the production-mode UX boundary: non-outlet shared Recipe Master keeps its selector; outlet production mode hides the misleading legacy selector, shows fixed recipe identity, keeps the actual Reference source selector, and prefills/preserves positive URL qty. Updated Method 2 CI to trigger on recipe production files, run the focused regression, and syntax-check recipe-production-editor.js. Local container execution was unavailable because the runtime could not resolve github.com, so no local PASS is claimed. INTENT: open focused PR from task branch, require GitHub Actions result before merge; if green, merge, verify Pages deployment and then inspect the exact live Idli URL read-only for Recipe: Idli and Intended output 360. No Google save during verification.

CI FAILURE / REPAIR INTENT — PR #14 workflow run 36972264620 failed only in the syntax-check step because the workflow edit accidentally wrote a literal `\n` inside the shell line, producing a bogus filename `method2-flow-review.jsn`. Existing Method 2 workload 5/5, setup-before-workload integration, and outlet handoff tests all passed before that failure. The intended new focused recipe UX step was also not inserted because the string replacement missed the exact workflow text. No application defect is inferred from this CI failure. INTENT: repair only the workflow YAML to use separate shell lines, explicitly add the recipe UX test step, then let PR CI rerun. Application source remains unchanged during this correction.

CI PASS / MERGE INTENT — PR #14 run 36972336329 completed SUCCESS after workflow wiring repair. Existing Method 2 workload gate and selector/list integrations passed; focused recipe production UX regression passed; recipe-production-editor.js syntax check passed. Application source did not change during CI repair. INTENT: merge PR #14 at current head 29ae9194a76b277d4bb67204ff08c15c0c6b7465 only if head is unchanged, then verify Pages deployment and exact live Idli URL read-only. No Google save/write during verification.

MERGE / DEPLOYMENT RESULT — PR #14 merged as 5a4c0d9b895227da58c1aaec5e908ebf2bea0b0e. Post-merge Recipe Master standards audit 36972397821 SUCCESS; Method 2 workload gate audit 36972397802 SUCCESS; GitHub Pages deployment 36972397067 SUCCESS. Main source inspection confirms production mode hides the legacy Recipe dropdown, renders a fixed current-recipe display, and preloads positive URL qty into targetQty. The exact live GitHub Pages URL could not be fetched by the separate web fetcher in this session (DisabledError), so no rendered-live-browser claim is made beyond successful Pages deployment and merged source verification. Owner retest: hard-refresh the exact Idli URL; expected top control is no longer the tiny blank Recipe dropdown, instead a clear Recipe: Idli label appears, and Intended output quantity should show 360. The editable Reference source selector remains in Small-hotel reference. Recovery branch remains recovery/pre-recipe-selector-fix-20261002 at pre-fix main 39cacde741701a31c2d0809892b39ac2919aa667.


## 2 October 2026 — Recipe editor Google Vault retry
Owner requested an explicit retry in the Recipe Cost Editor status area whenever a Google Data Vault timeout/read failure appears. The Data Vault remains the authoritative source; this must be a fresh read attempt, never a silent local-cache fallback.
5PV: PRO gives a direct recovery action; CON stale browser data must not be substituted; COMPARE retrying the authoritative read is safer than adding a second source; OBSERVER timeout means read status is unknown; OWNER requests the retry control.
INTENT: from current main dd60aa030e275e1fb4260035396fe93a1315031a, add a hidden `Read again from Google Data Vault` button in production recipe mode, show it only when the initial authoritative load fails, keep Save disabled, and make the button start a fresh page/read cycle without saving. Hide it after successful load. Preserve the already-merged fixed Recipe identity, qty=360 handoff, calculations, persistence and write safeguards. Recovery branch: `recovery/pre-recipe-google-retry-20261002`.

TEST RESULT / RELEASE INTENT — Method 2 workload gate audit run 36972836046 completed SUCCESS at head 42e24759a6b9c08a57bf91c6a9cc0210422342f0. The focused recipe UX regression now verifies the timeout/read-failure recovery control, while existing recipe identity, qty handoff, Reference source and shared-selector checks remain green. Syntax and connected Method 2 tests passed; no operational Google write occurred. INTENT: open a focused PR, merge only if diff is bounded to retry UX/test/continuity, then verify Pages deployment. Recovery remains `recovery/pre-recipe-google-retry-20261002` at dd60aa030e275e1fb4260035396fe93a1315031a.


## 2 October 2026 — Small-hotel reference readability
Owner clarified that the issue is not whether evidence links are numbered; the mandatory requirement is readability in the right-side `Small-hotel reference` panel. The current Basis/confidence and source links run too continuously.
5PV: PRO separate basis/confidence and each evidence source into readable blocks; CON do not change reference data, source URLs, selection logic, or costing; COMPARE spacing/numbering is presentation only; OBSERVER mobile readability matters more than decorative density; OWNER says numbering is welcome but optional.
INTENT: from main 16fa1b8610f654a87cbb89ffa0533ac562aec23e, keep the same evidence content but render a distinct Basis / confidence line followed by individually spaced source rows, numbered when multiple sources exist. Add lightweight mobile-safe CSS only inside the production editor. Preserve all recipe/reference calculations, Google reads/writes, and source URLs. Add focused regression coverage and merge only after CI passes. Recovery branch: `recovery/pre-reference-readability-20261002`.

IMPLEMENTATION / TEST RESULT — The right-side Small-hotel reference evidence now renders the Basis / Confidence as its own line and every evidence source as a separate spaced row with a line break before the link. When more than one source exists, rows are numbered for easier scanning; numbering is not required for a single source. Source labels/URLs, reference-selection logic, calculations and persistence are unchanged. Method 2 workload gate audit run 36973552109 completed SUCCESS at head a6f328107e669369f33386f1150662ee54795d43; connected recipe UX and syntax checks passed. No Google write occurred. INTENT: open focused PR, confirm bounded diff, merge if PR CI remains green, then verify Pages deployment. Recovery remains `recovery/pre-reference-readability-20261002`.


## 2 October 2026 — Google-backed recipe knowledge chain
Owner approved making the full Recipe Knowledge chain permanent in Google: (1) published market evidence, (2) BOBS calibration / small-hotel benchmark decision, (3) approved BOBS standard recipe, with outlet production scaling continuing in Method 2. Owner explicitly ruled that the old Recipe Master is backup/history only and must never be an operational fallback because it contains known flawed quantities; if a Google standard is unavailable, fallback must be the audited market-reference library, not the legacy master.
5PV: PRO preserves the expensive research/calibration work independently of GitHub and makes the operational standard reconstructible; CON avoid destructive rewrite or accidental use of flawed legacy quantities; COMPARE separate Evidence -> Calibration -> Standard -> Outlet production ownership while keeping current supplier-rate preservation during one-time conversion; OBSERVER the existing migration helper already preserves rates and backup safety but the research/calibration layers are source-code-only; OWNER approved implementation.
INTENT: from main f2c3b4c3030e8bcdf0a2adb7c73611b3d9742946 create three Google-backed COMPANY modules: RECIPE_MARKET_EVIDENCE, RECIPE_CALIBRATION, BOBS_STANDARD_RECIPE. Add a sharded/versioned store helper to build these records from the audited market library, preserving matching legacy ingredient rates only into the new standard during controlled migration. Change the migration page so it first creates/verifies a permanent legacy Recipe Master backup, then stages/verifies all three Google modules and activates their manifests; do NOT overwrite or delete the old Recipe Master. Update production recipe runtime so operational recipe quantities come from Google BOBS_STANDARD_RECIPE when available, otherwise from the audited market library; never fall back to the legacy Recipe Master. Existing outlet METHOD2 recipeOverrides remain the Google-backed outlet production layer. Add focused regression tests and workflow coverage. No live Google production write will be claimed from repository implementation alone; the deployed migration page remains the explicit user-confirmed write boundary. Recovery branch: recovery/pre-google-recipe-knowledge-20261002.

TEST FAILURE / REPAIR INTENT — The new production architecture intentionally removed the old `saved -> legacy Recipe Master` fallback, but `tests/market-reference-calibration.cjs` still asserted that obsolete behavior. Method 2 focused UX is now green after its expectations were updated; the Google-knowledge unit test had a CommonJS identifier collision (`module`) and was corrected. INTENT: update only the outdated market-calibration integration assertion to require Google BOBS Standard first, audited market fallback second, and no legacy operational fallback; do not weaken the existing quantity/evidence calibration checks. Then rerun both Recipe Master migration audit and Method 2 workload gate before release.

IMPLEMENTATION / TEST RESULT — Google Recipe Knowledge V1 is implemented on the task branch. Added sharded/versioned COMPANY modules `RECIPE_MARKET_EVIDENCE`, `RECIPE_CALIBRATION`, and `BOBS_STANDARD_RECIPE`; controlled migration creates and verifies a permanent legacy Recipe Master history snapshot, stages/verifies all three knowledge layers, activates Evidence then Calibration then Standard, and never overwrites/deletes the legacy master. The standard copies only matching ingredient+unit rates from legacy during migration; legacy yields/quantities are never promoted. Production runtime now reads Google `BOBS_STANDARD_RECIPE` first and, if unavailable, falls back only to the audited source market library. The legacy Recipe Master option was removed from production costing and is labelled backup-only. Existing outlet `METHOD2.recipeOverrides` remains the Google outlet-production layer. Recipe Master market migration audit run 36977558772 SUCCESS at fc64a61b769e2131cbf1f3e930d704964e75bbf8, including new Google knowledge store test, existing standards/calibration/catalogue/readback/shard checks, and production UX. Method 2 workload gate was also SUCCESS at 8be6c353a190e52caea93c16e5bbb5ca3d3cedf2 after the production UX assertions were updated. No live Google business-data migration was executed from this chat; deployment will expose the explicit confirmed migration button. INTENT: compare branch to main, open focused PR, require PR CI green, merge, verify Pages deployment, then give Owner the exact one-time Google migration click/status needed to persist the three layers. Recovery: recovery/pre-google-recipe-knowledge-20261002.


## 2 October 2026 — 111QS mode-routing gate
Owner approved adding an explicit mode-routing rule to the universal 111Q method so Chat is used for fast owner/architecture decisions and Work/Codex is suggested before material implementation/research/testing/repository execution. Canonical notation becomes **111QS5PVDDRT**, where **S = Switch / execution-mode routing gate**.
INTENT BEFORE CHANGE: update the universal master and repository guard so every 111Q task first classifies the current step: (1) Architecture = Chat; (2) UX = Chat; (3) Business rules = Chat; (4) Market research = Work; (5) Coding = Codex/Work; (6) Repository/release = Codex/Work; (7) Testing = Work; (8) Google/data architecture = Chat first, Work for implementation; (9) Documentation/continuity = Work/Codex during execution; (10) Debugging = Chat for small diagnosis, Work/Codex for deep tracing. Before crossing from decision/design into material development, the assistant must surface a compact **Switch to Work/Codex** recommendation when the task is better suited there, and prepare a self-contained handover containing current HEAD/recovery, approved rule, files/data owners, constraints, tests, exact next action, and 111Q/WACP requirements. The Owner may explicitly stay in Chat; S is a routing/suggestion gate, not a forced transfer. Preserve all existing 5PV/DD/RT/WACP rules. Recovery branch: recovery/pre-111qs-mode-routing-20261002.

IMPLEMENTATION RESULT — Universal master upgraded to **v4.0 / 111QS5PVDDRT**. Added the fixed ten-activity routing table, pre-development switch trigger, Owner override to remain in Chat, and mandatory Mode Handover Packet. `AGENTS.md` now enforces the same S gate for repository agents. Existing 5PV, DD, RT, WACP, recovery and Owner-decision rules remain intact. This is governance/documentation only; no application runtime or Google business data changed. INTENT: compare bounded diff, open documentation PR, merge if clean, then use 111QS as the canonical meaning of “111Q” going forward.

## 2 October 2026 — Vault repair and capacity gate: WACP intent
Owner confirmed laptop; explicitly authorized documentation, bounded timeout/source-hierarchy repair, tests, PR/merge/deploy/live verification. Fetched main 13213bf. Isolated branch codex/vault-timeout-20261002; recovery/pre-vault-timeout-20261002 preserves baseline. Original checkout and owner documents preserved. Managed worktree tool unavailable for projectless chat; isolated clone used.
Before edits: extend master v4.0 with best-effort capacity and return gates. Then repair read-only retries, single-record Apps Script reads, optional-read isolation, and Method 2 item load/refresh/save hierarchy: Google BOBS_STANDARD_RECIPE -> audited market references -> never legacy Recipe Master. Preserve METHOD2 overrides, Google authority, backup/readback, quantities, indices and cost formulas. No destructive migration or test overwrites of operational records.
Inspected shared reader, item editor, production recipe editor, knowledge store, verified store, full-cost reader and both Apps Script module readers. Confirmed single 12s JSONP attempt, full payload-range scan, awaited optional reads before show(), and three legacy recipe read sites. Single-assistant four-view review presented; explicit task authorizes this bounded scope/release. Backend deployment must be verified independently of Pages.
Exact live URL: https://jothish2000.github.io/BOBS-OUTLETS/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production
Mode Work/Codex. Recovery is code-only; never restore/delete Google data during code rollback. Repair tests/deployment/live/UAT: NOT RUN. Next: documentation checks, then isolated regressions and runtime repair.
IMPLEMENTATION CHECKPOINT: master v4.1 gates saved; shared reader now retries only idempotent reads twice (12s then 24s, 600ms backoff), cleans failed scripts and tolerates late callbacks. Both backend copies read identity columns then matching payload only, without persistent row cache. New operational recipe loader uses Google standard plus audited market fallback only. Item load/refresh/save use it; optional labour/support loads run after editor opens. Initial/failed load controls remain disabled. No Google writes. Tests NOT RUN; next syntax, targeted transport/backend/DOM tests and regressions.
TEST CHECKPOINT: 7/8 focused transport/backend/hierarchy tests passed; combined Apps Script fixture failed because its own ensureSheets_ replaced the injected stub (SpreadsheetApp unavailable). Harness correction sets the stub after evaluating the actual script; no product change. Interactive browser tool failed to initialize twice. DOM tests running; live status remains NOT VERIFIED.
RETEST CHECKPOINT: transport/backend/hierarchy now 8/8 PASS. First DOM run 1/4 PASS; three failures traced to fixture using Breakfast Catalogue|0 instead of canonical itemEditors key Breakfast Catalogue::0. Correcting fixture without weakening assertions; existing outlet-handoff fixture updated for operational recipe loader and accurate optional render interface. No production change from harness repairs.
TEST CHECKPOINT: connected tests 25/25 PASS (query1 costing/store, selling price, workload, shared packing/recovery including Chrome); knowledge-store and production UX PASS; outlet handoff DOM PASS both modes/outlets. New editor suite 2/4 PASS before fixture corrections: saved sold field is string by existing schema; purchase mode fixture used only 3 purchased units against 290 sold. Correct test types and purchase quantity, retain assertions. Chrome observed read retry/optional isolation PASS; save/reload retest pending.
RETEST RESULT: corrected editor DOM 4/4 PASS. Actual Chrome retry/optional isolation PASS, but real click Save did not reach verified state; investigating form/browser validation before release. No live writes; release held pending diagnosis. Permanent CI added for focused tests, connected DOM/costing regressions and Chrome mock persistence.
CHROME DIAGNOSIS: actual click Save blocked by unchanged method2-item-ux-v2.js deriving maxBatchesDay=1000/120=8.333333333333334 into integer-step input. No writes occurred. This is a pre-existing capacity-validation limitation outside the timeout/source repair; source file unchanged versus 13213bf. Use established 1440 capacity fixture for targeted save/readback; do not claim fractional-capacity case passed. Record for next bounded correction.
FINAL LOCAL TEST / RELEASE INTENT: transport/backend/hierarchy 8/8 PASS; editor DOM 4/4 PASS; connected 25/25 PASS; actual Chrome mocked retry, optional failure isolation, protected backup/save/readback/reload and 390px viewport PASS with zero runtime errors using capacity1440. Selector/list/workload integration, outlet handoff both modes, recipe knowledge/production UX/readback/shards and real market catalogue (103 references) PASS. Syntax/diff checks PASS. Single-assistant post-test review: PRO observed usable read recovery and standard hierarchy; CON Apps Script deployment and live persistence not verified, baseline fractional max-batches validation remains; COMPARE no schema or data migration, existing overrides/stale guards preserved; OBSERVER mock/browser evidence distinct from live/UAT. Owner authorization covers PR/merge/deploy, acceptance remains pending. Interactive browser and desktop node helpers crash on initialization, so authenticated backend publication currently blocked. Exact next: commit/push bounded branch, obtain PR CI, merge only passing scope, verify Pages/live read-only; provide backend surgical function update if access remains unavailable. No operational Google test writes.
PR/CI CHECKPOINT: PR #19 created at 0bb3ceb, recovery branch pushed. Vault CI 37022844596 passed every runtime/Chrome test but failed final diff check because default shallow checkout lacks HEAD^. WACP repair intent: fetch-depth 2, preserving all assertions. Existing Method2 gate CI 37022845058 SUCCESS. Fresh read-only old live editor loaded (intermittent fault); observed legacy manifest plus 11 chunk reads and serial support reads. No live writes. Next rerun CI, merge exact passing head, verify Pages/new live source.

## 2 October 2026 — PR #19 merged; frontend deployed; backend verification pending
PR #19 merged exact passing head 9e634445b369f8fdcd9a37b0d808790171719614 into main as 39bdbcbee9a4fe28a4fa1f3855532cad59e24157. Pages build/deployment 37023632707 SUCCESS. Post-merge Vault read reliability 37023634151, Method 2 gate 37023633585, Recipe standards 37023633851 and market migration audit 37023633986 all SUCCESS. Universal master v4.1 includes approved capacity and return gates.
PRE-MERGE real live read-only Chrome loaded the old editor and confirmed legacy manifest/11 chunk reads. POST-MERGE served-file comparison and live editor test are NOT VERIFIED: after Owner said continue, the command runner failed with helper_sandbox_lock_failed / SetNamedSecurityInfoW error 5; browser controller timed out/reset; alternate web fetch could not access the Pages URLs. Do not convert successful Pages deployment into live functional verification. All isolated local and CI test evidence above remains valid. No operational Google writes or migration occurred.
Apps Script getModuleData_ optimization is committed in both source variants but NOT DEPLOYED to the existing Google web app. Interactive browser and desktop helper initialization failed. Prepared local outputs UNIVERSAL_111QS_v4.1.md, Apps-Script-read-repair.gs (only the replacement function), and BACKEND_DEPLOYMENT_PENDING.md. Preserve the actual deployed backend code/version before surgical replacement; do not overwrite its other functions from older repository source, change spreadsheet/deployment URL/access, or delete records.
Latest Owner request: continue the fix; laptop confirmation remains current. Mode Work/Codex. Asked Owner for read-only hard-refresh status while execution tools are unavailable. Owner response/UAT pending. Exact live URL: https://jothish2000.github.io/BOBS-OUTLETS/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production
Next executable action: regain working browser/command access, verify the four served frontend files against 39bdbcb, observe normal/cold live load and source provenance, deploy only the reviewed backend function into the existing Apps Script project after code checkpoint, then verify backend reads. Live Save/readback requires intended Owner values and verified protection; NOT RUN. Separate existing fractional max-batches validation finding remains unresolved, not a passed test. Recovery remote recovery/pre-vault-timeout-20261002 at13213bf; code rollback and data rollback separate.
111QS return gate: Continue in Work while backend deployment/live verification remains. Recommend Return to Chat once the next step is Owner review/UAT discussion. Capacity gate remains best effort, with no invented exact context percentage. This entry records actual release results and the current execution blocker; no completion or Owner acceptance claimed.


## 2 October 2026 — Owner-requested item status guide clarity
WACP INTENT / OWNER APPROVED: laptop; replace dense status paragraph with plain source explanation and three numbered next steps before Owner refresh/UAT. Current main 5c80d8a36b8743f8bf1fdfb43df4180dc9d6ff84 inspected. Recovery branch recovery/pre-item-guide-20261002 at this HEAD; task codex/item-guide-clarity-20261002. Single-assistant PRO/CON/COMPARE/OBSERVER review: clearer guidance; keep panel compact and source wording accurate; existing loader -> presentation -> existing cost links/save controls; no new persistence, calculations or Google writes. Existing governance/source/handover read. User screenshot is evidence of loaded fallback, not independent live verification. Implement page-scoped guide, update it with source/mode changes, preserve live error/status messages and verified-save guard. Tests NOT RUN. Next implement then CI DOM/browser checks and PR/release. Backend deployment and fractional-capacity issue remain separate pending items.
IMPLEMENTATION CHECKPOINT: status separated from source explanation and three next steps; mode-sensitive cost link reuses existing URL/quantity logic; guide stays hidden until required reads succeed; refreshed sources update through existing calculate path. Corrected remaining production dropdown wording to BOBS Standard Recipe. DOM coverage added for Google/fallback/purchase, three steps, mode change, link identity and zero load writes. Local command/browser helpers unavailable; CI tests pending, not claimed passed. Next PR CI.

TEST / RELEASE CHECKPOINT: PR #20 https://github.com/jothish2000/BOBS-OUTLETS/pull/20 merged tested head2502a4befa3cf54651a137e88af78ffab58bb5eb into main dcc7a6b9e65abb4ba7686fbc9200155527534e2d. Branch CI37037839709 and PR CI37037859140 SUCCESS; postmerge reliability37038049284 SUCCESS. Tests include source/mode guide states, three steps, correct existing cost link, required-error hidden guide and no initial writes; existing transport/backend/editor/connected regressions and isolated Chrome save/readback/reload passed, syntax/whitespace passed. Single-assistant post-test PRO: clearer, actionable guidance; CON: actual live visual check blocked by browser helper crash; COMPARE: same data/save paths, no migration or operational writes; OBSERVER: isolated browser evidence is not live UAT. Owner acceptance pending. Pages37038048815 currently in progress; next check deployment result then ask Owner to refresh and inspect guide. Recovery pre-item-guide branch retained. Separate backend deployment and fractional-capacity issue still pending. Mode return recommendation: Chat for Owner guide review/UAT; Work for remaining backend implementation.

DEPLOYMENT RESULT: Pages37038048815 SUCCESS for dcc7a6b. Guide frontend PUBLISHED. Independent live visual verification NOT VERIFIED (browser controller trusted Node process exited unexpectedly); Owner guide UAT next. Exact URL remains the Idli production editor above. Laptop step: Ctrl+Shift+R, inspect source explanation and three numbered actions, report wording/layout/result before any unintended data save. Broader backend work is not declared complete.


## 2 October 2026 — 111QS v4.2 Owner communication correction
WACP INTENT / OWNER APPROVED: Owner explicitly replaces repeated device confirmation with default ChatGPT Windows Work mode on laptop, mobile only when explicitly stated. Also requires persistent selectable YES/NO mode gate and mode transfer according to answer. Inspected current main 8b4461c0c3ed54aec577e96a3782201ac43f49d8, universal master, AGENTS and handover. Recovery recovery/pre-111qs-v42-20261002. Documentation-only; no product/Google data changes.
IMPLEMENTED: universal master v4.2 section4E and project AGENTS override. Preserve routing/return/capacity gates; decision cannot expire or infer consent, no finalization that dismisses asynchronous choice, persistent text fallback if host cannot retain popup. YES requires handover + supported transfer + verified destination; NO stays current mode. Single-assistant review: PRO fewer interruptions and explicit control; CON popup lifecycle/transfer not controllable with available tools; COMPARE replaces old device question while preserving mode routing; OBSERVER distinguish documented requirement from actual host capability. Local exec failed helper_sandbox_lock_failed/SetNamedSecurityInfoW5, so local personal/global AGENTS and local master copies NOT UPDATED; repository copy is durable, current conversation follows explicit Owner instruction. OpenAI docs skill file could not be read through failed filesystem tool; official documentation fallback used. No available tool exposes popup persistence or direct Chat/Work transfer; automatic mode switch NOT IMPLEMENTED or VERIFIED. Text consistency checks performed before commit; app popup behaviour NOT TESTED. BOBS backend deployment remains pending. Next: use default laptop context without questioning; honour explicit mode decision via supported controls or state limitation and supply handover. Local global-rule reconciliation awaits working filesystem access; do not claim cross-chat synchronization.


## 2 October 2026 — BOBS recipe-source wording clarification
WACP INTENT / OWNER APPROVED: Owner explicitly chose Codex on laptop and authorized bounded wording correction, tests, PR/merge/publication. Current main 3a1bf2357e2789b97a2b6925c9c8e41c4107dc85 verified through GitHub connector; full repository AGENTS, v4.2 universal master and continuation history read. Intervening commit from 8b4461c is governance only. Local shell remains unreliable (helper_sandbox_lock_failed / SetNamedSecurityInfoW 5); original and previous isolated checkouts are not modified. Separate remote task branch codex/recipe-source-wording-20261002; recovery/pre-recipe-source-wording-20261002 preserves baseline and prior recovery refs remain intact.
Single-assistant PRO/CON/COMPARE & CONNECTIONS/OBSERVER passes: make BOBS ownership and Google Sheets storage explicit; never infer deletion from read failure/empty results; collection success cannot establish this item's source; retain numbered steps, mode-sensitive links, verified save and unsaved reminder. Dependency map: COMPANY/BOBS_STANDARD_RECIPE manifests/chunks -> operational loader merging standard then prepared market references -> item-specific guide; METHOD2 outlet overrides/costing/save protection unchanged. Scope is presentation and minimal read-only provenance metadata, no formula, schema, migration, operational writes or new Google search. Categories 5 code, 6 release, 7 testing, 9 continuity apply in explicitly selected Codex; no new architecture/UX/business/research/data design or deep debugging scope.
Tests NOT RUN. Exact next: implement accurate loaded/fallback/mixed/unavailable messages, add focused state regressions, run existing CI including isolated Chrome; merge only passing reviewed scope and verify Pages separately from live/UAT. Backend deployment and fractional capacity1000/batch120 remain pending; isolated save uses capacity1440 and does not prove fractional case. Code rollback is surgical from recovery; Google-data recovery remains separate.

IMPLEMENTATION CHECKPOINT: bobs-operational-recipes.js exposes retrieved standard record references for read-only provenance; recipe order/fallback unchanged. method2-item.js matches the current item with existing M2.recipe and checks actual record membership, reporting loaded BOBS standard from Google Sheets, prepared-market fallback, or neither available. Updates occur on load, source refresh and save-time reread. Purchase wording, numbered steps/direct links, verified-save text and unsaved reminder preserved. method2-item.html versions both changed scripts. Focused editor regressions cover failed/null/empty/mixed/no-item reads and successful item with other fallback recipes. The local full v2.0 master eventually read successfully; latest explicitly approved repository v4.2 governs newer routing/continuity requirements. No operational Google changes. Tests pending CI; next publish branch implementation and PR, inspect actual results before merge.

TEST / MERGE RESULT: PR #21 https://github.com/jothish2000/BOBS-OUTLETS/pull/21 merged passing implementation head 6086f11a04d9dfac9e9cfd7e55f05d8c96c99f1b as f2c6fc46e2d5f36726e4433357949c8c355df765. Branch run37041693147 and PR run37041698560 SUCCESS. Job110953107929 logs confirm 15/15 focused transport/backend/editor tests (including seven editor groups), 24/24 connected costing/price/workload tests, outlet-handoff and setup-first DOM integrations, knowledge-store and production UX PASS. Isolated Chrome network retry/optional failures and protected mock save/readback/reload/narrow viewport PASS, zero runtime errors, capacity1440 fixture; fractional-capacity case NOT PASSED. Syntax/whitespace PASS. Diff reviewed: five files, no business-data changes.
Post-test single-assistant review: PRO observed accurate item-specific source wording across success/fallback/mixed/missing states; CON live visual/Google persistence still unverified and backend/capacity issues remain; COMPARE recipe ordering, calculations, overrides, links and protected writes preserved with connected regressions passing; OBSERVER CI mock success is not live/UAT acceptance. Owner release explicitly authorized; UAT PENDING. New-session browser initialization attempt failed with trusted Node process exited unexpectedly; computer-use skill read also blocked by shell sandbox failure. Local tests NOT RUN; CI evidence above is actual execution. Next: verify Pages publication/postmerge CI, attempt served-file read-only check, then record outcome and present laptop UAT plus explicit YES/NO return gate. No operational Google write, no data restoration.

PUBLICATION RESULT / MODE HANDOVER: Pages run37041963142 SUCCESS at documentation HEAD357d3e9e6326ef57c365788fdbb0b08f9432bb93, containing PR21 application merge f2c6fc46e2d5f36726e4433357949c8c355df765. Earlier merge Pages run37041898686 was cancelled/superseded, not passed. Postmerge Vault reliability37041899037 SUCCESS. Existing recovery/pre-vault-timeout-20261002=13213bfc, recovery/pre-item-guide-20261002=5c80d8a3, recovery/pre-111qs-v42-20261002=8b4461c0 and new recovery/pre-recipe-source-wording-20261002=3a1bf235 verified intact. Browser initialization failed; separate web served-JS fetch was inaccessible. Independent live visual/source verification NOT VERIFIED; live operational save/readback NOT RUN; Owner UAT PENDING. No operational Google data changed. This final documentation update does not change application code.
Exact page/module: https://jothish2000.github.io/BOBS-OUTLETS/method2-item.html?outlet=1&cat=Breakfast+Catalogue&i=0&mode=production . Laptop UAT: Ctrl+Shift+R; read source box (BOBS ownership / Google Sheets / previously prepared fallback); check three steps and recipe review link, with no save needed for wording review. Source load success is item-specific; unavailable does not prove deletion. Approved bounded wording implementation/test/merge/publication finished; Owner acceptance and independent live verification pending. Next executable action is Owner visual wording review. Backend actual deployed-code preservation then surgical optimization deployment, normal/cold live reads/intended protected save, and separate capacity1000/120 validation remain pending, not taken up here.
111QS v4.2 return recommendation: Chat for Owner UAT/discussion; explicit selectable YES—Return to Chat / NO—Stay in Codex offered. Decision PENDING until explicit response, no timeout/silence consent. No supported automatic Chat transfer control available; a popup is not a mode switch. If YES, supply this self-contained packet/master/latest handover through manual Chat continuation; if NO, stay in current Codex without expanding scope. Authority remains Google Sheets COMPANY/BOBS_STANDARD_RECIPE plus outlet METHOD2 overrides; audited prepared market fallback only, never legacy Recipe Master. Code rollback from new recovery must remain separate from data rollback. Receiving chat must inspect current main/AGENTS/master/handover/source and preserve four-view review, WACP, Tester/status distinctions and Owner gates.

OWNER RETURN-GATE DECISION: Owner explicitly selected YES — Return to Chat. Automatic transfer is unavailable and has NOT occurred. Approved next action: manual Chat handover for guide review/UAT, using this latest repository handover and universal master v4.2. No new implementation/backend/capacity scope authorized by the mode choice. Laptop remains confirmed. Wording release/test/publication evidence above stands; Owner visual acceptance remains pending.


## 2 October 2026 — Google recipe preservation: Owner-approved audit and completion
WACP INTENT: Owner requests actual inspection and ensuring market evidence, BOBS calibration and revised standards are permanently recorded in Google Sheets with recovery. Base main 3c39e0268e1f4a865122dde76c5af89044d5b6f0; recovery/pre-google-recipe-preservation-20261002; task codex/google-recipe-preservation-20261002. Governance and full handover previously read this conversation; main unchanged since prior diagnosis. Current loader, knowledge builder, migration page and data adapter inspected. Existing publisher verifies backup/chunk counts and tokens but not complete content equality; it builds from reference library plus historical prices and could replace newer active knowledge on rerun. Do not run it blindly.
Single-assistant four-view review: PRO durable evidence/calibration/standard chain; CON protect newer saved records and prevent partial activation; COMPARE Google COMPANY knowledge modules -> outlet METHOD2 overrides, legacy master history only; OBSERVER full readback and recovery required, no promise of absolute immunity to later data loss. Owner authorizes preservation; material replacement conflicts require specific review. Local exec and browser initialization still fail. First bounded action: read-only GitHub-runner audit using existing endpoint, logging only structural status/counts/Idli comparison booleans, never raw saved records/prices. No Google write code in audit. Next inspect actual read results, then prepare protected reconciliation appropriate to evidence. Backend/capacity issues remain separate. Audit NOT RUN at this write-ahead checkpoint.

LIVE AUDIT RESULT: GitHub run37044815146 reached the actual existing Data Vault: calibration ACTIVE_V1 absent, standard ACTIVE_V1 absent, historical Recipe Master present/sharded with104 records; evidence read HTTP500 so state UNKNOWN, not absent. No writes. Audit returned failure appropriately. NEXT INTENT: retry idempotent reads with bounded retry; inventory the three module records to detect partial publication; validate all historical chunks without logging recipe contents or prices. Do not publish while any state/recovery read remains unknown.

READ-ONLY RETEST RESULT: run37045143128 SUCCESS, job110964592700: all three COMPANY modules have absent ACTIVE_V1 and zero stored records. Historical Recipe Master104 records fully reconstructed from11 valid chunks. This establishes missing publication in the inspected live store, not wrong ingredient quantities causing a reader rejection. No Google writes.
PROTECTED INITIALIZATION INTENT under Owner's explicit go-ahead: create only the verified-empty three modules using current calibrated library; preserve historical master raw manifest/chunks and complete source market library in RECIPE_KNOWLEDGE_BACKUPS with exact full-content readback. Stage each new layer with full-content equality, preserve immutable recovery index, reread historical baseline and pending active pointers, activate Evidence then Calibration then Standard last, and reload/compare every record. Existing active/partial module records block this initializer; no replacement/reseed/deletion. Preserve valid matching historical prices while refusing to turn blank historical prices into zero. No METHOD2/outlet/backend changes. Single-assistant PRO durable chain; CON intermittent reads/concurrent writers and future whole-file deletion remain risks, no absolute no-loss guarantee; COMPARE existing storage/module architecture retained with stronger verification; OBSERVER full-content matches required instead of count-only backup claims. First run fake-adapter protection tests and real-catalogue audits with no live-write workflow step. Next enable the already-authorized initialization only after observed test passes; stop if live state has changed.

PRE-WRITE TEST RESULT / EXECUTION INTENT: run37045688255 SUCCESS; eight protection tests PASS, Google knowledge store PASS, real catalogue103 references PASS (20 directly calibrated /83 family checked, distinctions retained), four market calibration tests PASS, runner/client syntax PASS. Added sharded-history and concurrent-pointer tests for the actual live shape; workflow must pass all tests before any live write. Owner request already authorizes recording these missing layers. Enable one bounded initializer on task-branch push only, with explicit write-scope token, COMPANY-only whitelist, serial workflow concurrency, no automatic write retries. It rechecks all three empty modules, backs up full historical raw records/reference library, stages/verifies full content, activates standard last and verifies all records. If interrupted, leave recoverable staged records and stop; never delete/reseed/replay blindly. Live initialization NOT RUN at this checkpoint. Exact next: monitor test-gated live run and record actual recovery key/counts/full readback outcome.

LIVE EXECUTION CHECKPOINT: run37045857257 at99453b9 passed all safety/catalogue tests (including sharded-history/concurrent activation tests); protected live step is in progress. Actual completion NOT YET verified. Prepared initial-publication UI guard that checks active pointers and module inventories on comparison and again before any write, blocking existing or partial knowledge. Removing automatic live-write step from future workflow versions; the already-running authorized job retains its pinned version. Future CI is fake-adapter tests only. Next monitor live completion, test the UI protection, then independently reload all layers and live editor read-only before reporting durability.

LIVE INITIALIZATION FAILURE / READ-ONLY DIAGNOSIS INTENT: run37045857257 failed with Google read HTTP404 at18:16:20Z, before the initializer emitted the first fully-backed-up checkpoint. No activation was reached in its sequential control flow. Do not claim preserved/published data or replay writes. Potential partial RECIPE_KNOWLEDGE_BACKUPS records use tokenPRESERVE_20261002_37045857257 and must be inspected and retained. Independently audit all three inventories, historical chunks and attempt backup keys now. UI protection CI37046173199 passed12 tests plus existing knowledge/catalogue/calibration checks. Exact next: inspect audit results, identify whether any snapshot was saved and verify its full contents before any resumption.

POST-FAILURE LIVE AUDIT: run37046481129 SUCCESS. All three active modules remain empty (zero records); historical104/11 remains valid. Four exact-attempt backup keys legacy_0 throughlegacy_3 exist under tokenPRESERVE_20261002_37045857257. No staged/active knowledge was written. Resume intent: retain original token, accept existing backup key only when complete nested content exactly matches current historical source, never overwrite a differing copy; stage still requires empty active modules. Added resume/collision test, progress per backup, and five bounded idempotent-read attempts with module/key failure context. No write retries. Test-gated resume is authorized completion of same missing-layer request, not a replacement of operational recipes. Next verify test result and full live completion; remove live workflow step again once pinned run starts.

LIVE PUBLICATION SUCCESS: protected resume run37046744914, job110969946712 at2499b4add2a173fc742db793e620877c0b289d74 SUCCESS. All13 safety/page tests plus catalogue checks passed before live step. Logs verify12 historical raw recovery records (manifest+11 chunks),8 full reference-library archive chunks,103 evidence records,103 calibration records and103 standard records. Every saved payload compared in full; historical source reread unchanged. Three manifests activated with standard last; final full records compared. Recovery index COMPANY/RECIPE_KNOWLEDGE_BACKUPS/PRESERVE_20261002_37045857257. Idli standard yield120 and calibrated rice1.6kg verified. No METHOD2/outlet write. Historical104 count versus103 references is retained deliberately: historical dataset stays intact, not shrunk/replaced.
NEXT INDEPENDENT VERIFICATION INTENT: new read-only run reconstructs all three layers from saved historical copies+source reference archive, compares against active Google records and approved source library, then actual headless Chrome live Idli cold/reload with all non-GET requests blocked. Permanent CI37046819849(push)/37046913952(PR) green; draft PR22 captures safeguards/docs. Exact next: inspect independent results; merge tested initial-publication guard, verify Pages, record status and Owner UAT. Same-spreadsheet recovery protects update loss, not whole-spreadsheet deletion/access loss; no absolute future-no-loss guarantee. External source links retained, not whole publisher articles.

INDEPENDENT LIVE VERIFICATION / RELEASE INTENT: read-only run37047881137 job110973694286 SUCCESS at2c30870183a403cf4ca8ae929f081ae3b09ba0e9. Independent reconstruction verifies all103 evidence,103 calibration and103 standard records by full content, full103 archived references equal approved source library, historical104 records unchanged, Idli120 reference and360/120=3 scaling confirmed. Actual live Chrome cold load and reload both show BOBS standard recipe loaded from Google Sheets, editor visible, three guide steps and correct Idli/outlet1 recipe link; all non-GET requests blocked and zero captured runtime errors. No live item-save/UAT acceptance claimed.
Second single-assistant four-view review: PRO intended durable chain and actual live standard source observed; CON initial HTTP404 required safe resume, same-sheet backup is not whole-file-loss protection and backend/capacity remain pending; COMPARE103 calibrated references saved in each knowledge layer while104 historical recipes remain untouched, existing METHOD2 scaling/overrides unchanged; OBSERVER full-content tests and independent Google read/live DOM evidence are separate from Owner visual/quantity acceptance. User explicitly authorized durability work and continues Codex; next publish tested initial-publication guard and recovery instructions through PR22 then Pages verification. Automatic live write steps have been removed from permanent workflow. Recovery refs and data archive remain available; do not restore business data via code rollback.

RELEASE RESULT — 3 October 2026 IST (2 October UTC): PR22 merged tested head699c2943ffa82b9a498a0b31e4b426aa04a2ef57 into main dafb30fb15b1ca5f45e5dcb1da4832101a4b3b4b. PR safety37048287626 SUCCESS; postmerge preservation safety37049171403 and existing market migration audit37049171460 SUCCESS. Pages37049170056 SUCCESS: initial-publication guard and recovery instructions PUBLISHED. Independent live data and Idli cold/reload verification37047881137 PASS as above; Owner visual/quantity acceptance PENDING, live intended-value item-save NOT RUN. No automatic live-write step remains in permanent CI. This documentation-only result update changes no application/Google data.
Completion for approved scope:103 evidence +103 calibration +103 revised standards permanently saved in existing Google Data Vault BOBS_MODULE_DATA logical modules; full103 source reference archive and104 historical recipes retained/verified, recovery keyPRESERVE_20261002_37045857257. Existing standard publication cannot silently rerun over active/partial knowledge. Complete recovery map in RECIPE_KNOWLEDGE_RECOVERY_20261002.md. Same-spreadsheet recovery is not independent whole-spreadsheet backup; deletion/access-loss protection remains a separate backup task, no absolute immunity promised. Backend optimization deployment and capacity1000/120 remain pending; neither was silently repaired.
Return-gate decision: Owner's later explicit decision to continue in Codex supersedes the earlier YES-to-Chat choice; remain in Codex, no transfer attempted or claimed. Next action: Owner opens exact Idli production URL above, Ctrl+Shift+R, confirms BOBS standard recipe loaded from Google Sheets and reviews recipe; no save needed for this source check. Continue implementation only for separately taken-up pending scope. Code rollback/recovery branch pre-google-recipe-preservation retains3c39e026; Google data recovery requires explicit review and preserves newer records, never follows automatically from a source revert.


## 3 October 2026 — Stale publication-page loading message
WACP INTENT: Owner reports persistent Loading text in separate Chrome on recipe-master-market-migrate.html after SAFE MODE reports existing knowledge. Current main b7d487dabda2dea55bf9e418a5d1d29f16b189c9 inspected; current governance/master and source checked, prior full handover read retained in this conversation. Code checkpoint is this immutable main SHA; existing recovery branches and Google archive PRESERVE_20261002_37045857257 remain unchanged. Scope: bounded status correction, no Google writes or recipe changes. Category5/6/7/9 implementation, release, tests and continuity remain Codex per Owner choice. Single-assistant PRO clear finished state; CON do not imply a read failure proves missing/deleted records or a complete integrity audit; COMPARE load -> read-only empty-knowledge guard -> summary/status/buttons, publication guard and data owners unchanged; OBSERVER screenshot identifies stale summary, not elapsed network-time cause. Fix initial/loading/stopped summary and disable overlapping reloads; verify actual inline script existing/partial/failed/success/reload states, then PR/merge/Pages. Backend optimization and fractional capacity remain pending. Tests/publication NOT RUN at intent checkpoint.

IMPLEMENTATION CHECKPOINT: page now replaces initial/progress summary with a stopped/blocked explanation on every load failure, including existing or partial knowledge; says only this read-only check sent no write. Reload button is disabled while checking and concurrent calls return. Detailed SAFE MODE reason and publication protection retained. Added inline-script tests for error recovery and overlapping reload plus final summary assertions for existing/partial knowledge. No data/backend/schema changes. Next execute preservation safety CI and inspect results before release.

TEST / RELEASE RESULT: PR23 head974df0c5c68354dd32cadb570693955a06d142f5 passed push37052620001 and PR37052645302:15 preservation/page tests, Google knowledge-store test,103-reference audit and4 calibration tests. Actual inline page script tested with mock DOM/data; not a live browser result. Diff reviewed: only page load feedback, targeted tests, handover. PR23 merged8eef32bba4c3053246b135e7d6cca1a3b1bc1693. Postmerge safety37052754276 and market audit37052754366 SUCCESS. Pages37052753110 SUCCESS: correction PUBLISHED. Independent served-page web read unavailable; live Chrome verification NOT RUN in this correction, Owner UAT PENDING. No Google write performed.
Post-test single-assistant review: PRO blocked/failed checks clear pending summary in observed tests; CON actual network-delay cause and Owner Chrome appearance unverified; COMPARE existing/partial-data publication guard and recipes unchanged, overlapping reads prevented; OBSERVER current check alone does not verify completeness of all saved knowledge. Backend optimization and fractional capacity remain pending. Next exact step: Owner hard-refreshes https://jothish2000.github.io/BOBS-OUTLETS/recipe-master-market-migrate.html in separate Chrome, expects Check stopped / Initial publication is blocked with detailed saved-knowledge reason and disabled publish button. Existing old tab cannot update itself; no republishing needed. Remain Codex under Owner's explicit later choice; no mode transfer claimed. Code rollback is surgical revert of PR23, independent of Google data recovery. This final documentation update changes no application behavior.


## 3 October 2026 — Novice explanation for initial recipe setup
WACP INTENT: Owner explicitly requests the on-site explanation of why/when first-time saving is used and what publishing means. Previous screenshot confirms PR23 stale-loading correction visible in Owner Chrome, not full recipe integrity/Owner business acceptance. Current main e69837a652943ba3dcfe3603d383d39112918d4d is code recovery checkpoint; master v4.2/governance/full handover read earlier in this ongoing conversation remain applicable. Current page and tests reread. Scope: plain-language first-time setup guide, save/recheck labels, existing/partial/read-error explanations and normal editing next steps. No Google writes, backend deployment, recipe/schema/capacity change. Single-assistant PRO novice understands purpose; CON existing pointer is not proof all setup complete; COMPARE guard -> message/guide only, Google authoritative data and writer protections preserved; OBSERVER avoid SAFE MODE jargon and explain public-publishing ambiguity explicitly requested by Owner. Categories5/6/7/9 stay Codex per Owner decision. Tests and release pending. Next implement bounded guide and run preservation tests.

IMPLEMENTATION CHECKPOINT: added three-step novice guide explaining purpose, Google Sheets meaning of publish, daily editing/unsaved edits, first-time save and separate approved shared-standard revision. Renamed page/buttons; classified existing records with a message code, preserving guard order and conditions. Existing pointer means records found, not setup complete. Failed/partial checks give next actions. Confirmation text explains actual save; save failure warns against blind retry. No persistence logic changed. Tests cover existing/partial/error/retry states and novice wording. Next run CI before merge/publication.

TEST / RELEASE RESULT: PR24 headfff164a04a295749dba10bc1afcddcc971b74345 passed push37054784210 and PR37054830203. Logs show16 preservation/page tests PASS, knowledge-store test PASS,103-reference audit PASS,4 calibration tests PASS; actual inline script with mocked DOM/data, not live browser. Reviewed three-file diff. PR24 merged80d69a94165fa441b4bef04555948024e411f40c. Postmerge safety37054910655 and market audit37054910570 SUCCESS; Pages37054909734 SUCCESS: novice guide PUBLISHED. No Google data changed. Live visual verification and Owner acceptance for this wording PENDING; prior screenshot only verifies earlier loading correction.
Post-test single-assistant four-view review: PRO existing-record guidance and novice explanations pass; CON full saved-library completeness is deliberately not inferred from one pointer, real browser layout not checked this turn; COMPARE publication conditions and storage/writes unchanged, existing/partial/read-error/retry guard tests pass; OBSERVER first-time setup separated from everyday editing and approved shared-standard revision with understandable next actions. Backend deployment, fractional capacity1000/120 and independent whole-spreadsheet backup remain pending. Next: Owner Ctrl+Shift+R on https://jothish2000.github.io/BOBS-OUTLETS/recipe-master-market-migrate.html and reads What is this page for / three steps / Saved recipe records found. No save required for review. Remain Codex per Owner's explicit current choice; no transfer claimed. Code recovery is pre-change e69837a; Google data recovery remains separate and is not needed for this guide-only release.


## 3 October 2026 — Recipe setup presentation and button help
WACP INTENT: Owner requests visible explanation of recheck button and more presentable novice setup/testing page. Main7e38aa376ab7ec77ba32bb62ce5f6583d26a4cbf inspected, immutable code recovery checkpoint; existing Google recovery unchanged. Governance v4.2/full handover previously read in ongoing conversation; source/shared styles inspected now. Scope: layout, grouped plain-language explanations, result first, optional recheck help and first-save help; no loader/save/data changes. Single-assistant PRO easy next action; CON avoid completeness or write claims for read-only recheck; COMPARE existing load/guard -> presentation only; OBSERVER separate daily work from one-time setup, readable narrow layout. Owner explicitly authorized page clarity/presentation. Tests/release pending. Next implement then run state regressions and isolated browser layout checks; no live Google writes.

IMPLEMENTATION: result-first layout, three short next steps, separate optional/read-only check and first-save cards with aria-describedby help, supplementary setup/revision details, responsive styles scoped to this page. Existing script/guards unchanged. Added isolated Chrome viewport/recheck/no-write/no-overflow check to preservation CI, network blocked and mock saved record used. Next inspect actual CI results before release. Live Google/Owner visual verification not performed.

TEST / RELEASE RESULT: initial run37056070551 passed; review corrected button font declaration and included browser-script path in CI triggers. Final push37056207353 and PR37056213682 PASS:16 preservation/page tests,4 calibration tests, knowledge-store and103-reference checks; isolated Chrome1366/615/390px PASS actual inline script + styles with mock saved record and all external requests blocked. Recheck increments reads, zero writes, existing-data save disabled, accessible help association, result before actions, no horizontal overflow/runtime errors. Screenshots are CI artifacts, not visually inspected by assistant. PR25 merged11903542ec9874aab42d2a5ab55f14ffa9f394a3; Pages37056395823 SUCCESS, postmerge safety37056396616 and market audit37056396539 SUCCESS. PUBLISHED; live visual and Owner UAT PENDING. No Google data writes, backend/schema changes.
Post-test single-assistant PRO isolated browser observes clear grouping/read-only action behavior; CON live appearance and Owner novice usability acceptance pending, network delay not repaired by styling; COMPARE original loader and publication guards unchanged, state regressions pass; OBSERVER supplementary details expandable, result/next action first, disabled-save reason visible and optional recheck explained. Next Owner Ctrl+Shift+R at https://jothish2000.github.io/BOBS-OUTLETS/recipe-master-market-migrate.html and reviews result / three next steps / optional check card. Backend optimization, fractional capacity1000/120 and independent spreadsheet backup remain pending. Remain Codex per explicit Owner preference; no transfer claimed. Code rollback from7e38aa3 is separate from Google recovery; this release needs no data rollback.


## 3 October 2026 — Enforce historical Recipe Master read-only
WACP INTENT: Owner flags Save button on historical recipe-master.html as an overwrite hazard. Source inspection at5b7a347a6d404819179b30ee6146f6145651093a found manual save plus automatic seed migration/initial creation targeting COMPANY/RECIPE_MASTER/STANDARD_V1 and legacy chunk/backup modules, not BOBS_STANDARD_RECIPE. Current adapter reconstructs sharded history with integrity checks via getModule; retain it. Approved history-only architecture requires removing all page write paths, seed fallback and edit controls, preserving saved records/search/viewing. Single-assistant PRO protect history; CON do not claim modern standards overwritten without evidence, empty/failed read not deletion; COMPARE legacy read -> display only, separate calibrated standards/outlet METHOD2 unchanged; OBSERVER novice explanation and no false seed-as-history preview. Category5/6/7/9 Codex continues under Owner choice. Existing code SHA is checkpoint; Google archive unchanged. No live writes authorized/needed. Tests/implementation pending; next remove page mutation code and verify current/older/missing/failed/sharded scenarios without writes.

IMPLEMENTATION CHECKPOINT: removed all manual-save, backup/write, automatic-upgrade, initialization and seed-merging paths from historical page, and unused seed/shared/write-helper imports. Retained existing adapter getModule for verified shard reconstruction, saved record rendering/timing/cost display and filters. Ingredients/yield now text; no add/remove/save controls. Empty/failed reads show no seeds and perform no writes. Added isolated Chrome checks for current/older/sharded-result/missing/failed/malformed records, preserved values and working filters. Shared adapter unchanged; sharded-result case exercises returned shape, not adapter reconstruction. Next execute CI; no live Google read/write this change yet.

TEST / RELEASE RESULT: push37057743739 and PR37057786296 PASS at39c7c6c9465484cb30bf83f45978c80d036b3468. Six isolated Chrome historical scenarios(current, older version, sharded-result shape, missing, failed, malformed) PASS:zero writes, returned records unchanged, no card inputs/selects/buttons; normal search/category filters pass. All16 preservation/page tests,4 calibration tests, knowledge/catalogue checks and three setup-page viewport tests PASS. Four-file diff reviewed; all historical page save/auto-create/auto-upgrade paths removed. PR26 merged e3e68360bb150afd9aa5c7e023255efccd7803a8. Postmerge standards37057971313 and safety37057971545 PASS; Pages37057970939 SUCCESS. PUBLISHED; live Google page read/visual verification NOT RUN for this change; Owner UAT PENDING. No Google data modified or restored.
Post-test single-assistant PRO read-only behavior demonstrated across six cases; CON old already-open tabs still carry prior code until refreshed, no evidence provided that calibrated standards were overwritten; COMPARE legacy viewer reads only COMPANY/RECIPE_MASTER/STANDARD_V1 through unchanged shard-aware adapter, operational calibrated standards and outlet recipes untouched; OBSERVER current/legacy wording now distinct and missing/failed reads never create seed records. Next Owner hard-refreshes https://jothish2000.github.io/BOBS-OUTLETS/recipe-master.html (Ctrl+Shift+R), confirms Historical Recipe Master · Read only and no Save/Add/Remove/edit fields; retain search/filter. Refresh/close any other old historical tabs before further use. Code checkpoint5b7a347 and Google recovery remain separate; reverting this protection would reintroduce legacy writes and is not recommended without review. Backend optimization, fractional capacity1000/120 and independent spreadsheet backup remain pending. Owner continues Codex; no mode transfer claimed.


## 3 October 2026 — Explain production preview beside Save
WACP INTENT: Owner asks to validate purpose of Preview only — save when checked, retain if needed, clarify and place with associated button. Main2cd2939a10f011588abae117a9b02253bb8a700c checkpoint; current HTML/router/production source and tests inspected, governance v4.2/full handover read earlier in ongoing conversation. It is dynamic productionStatus set after scaling, also used for errors/save verification, not disposable label. Scale only creates preview; confirmed checkbox and signature gate save; verified outlet METHOD2 write is separate from shared standards. Single-assistant PRO clarify unsaved/review/save steps; CON preserve status/errors and guards, no unsupported saved claims; COMPARE calculate -> preview -> review checkbox -> verified save -> return link, storage unchanged; OBSERVER put button and live status together with persistent review instruction. Approved bounded wording/layout task, Codex continues. No Google writes. Next implement and test initial preview, unchecked/stale blocking, save result/error and changed-edit messaging using isolated browser. Backend/capacity issues remain pending.

IMPLEMENTATION: grouped review checkbox, persistent plain-language instructions, Save and live productionStatus together; status uses flex layout beside Save when space permits and stays in same group when narrow. Replaced vague preview text; edits reset checkbox as before and now explicitly replace any stale saved message with unsaved/recalculate guidance. Calculations/signature guard/save verification unchanged. Production script cache version updated. Added isolated browser checks with actual cost-flow/production scripts and mock store at1366/615/390px; no live data writes. Next run tests and inspect results.

TEST / RELEASE RESULT: implementation3df7383e306808e08afb26f06e3baf6793f87fb2 push safety37059016009 and PR safety37059060678 PASS; workload37059016108/37059060652 PASS. Isolated Chrome1366/615/390px exercises actual production/cost-flow scripts with mocked storage: preview explicit not saved, checkbox alone zero saves, unchecked/stale signature block, mocked save success and return link, edit resets/status, failed save status PASS. Connected16 preservation/page tests,4 calibration tests, existing UX assertions/setup/history browser checks PASS. Save handler text confirmed unchanged. PR27 merged269971452561f5b5761d5abcf7b3f70c0fdbde31; Pages37059198942 SUCCESS. Postmerge safety37059199562, standards37059199530, workload37059199615 and market37059199627 SUCCESS. PUBLISHED; live Google save NOT RUN, live visual/Owner acceptance PENDING. No Google data changed.
Post-test single-assistant PRO preview/review/save purpose retained and explicit; CON browser checks are isolated mocked storage, not live save or visual acceptance; COMPARE original calculation/signature/save handler unchanged, new messages prevent stale saved claim after edits; OBSERVER status remains next to Save within a single wrapping group, with checkbox explanation and preserved failure/verified-return statuses. Narrow screens may wrap within the group. Next Owner preserve unsaved edits before refresh; then Ctrl+Shift+R on recipe-cost-editor.html?item=Idli&outlet=1&qty=360&cat=Breakfast+Catalogue&i=0 and review grouped instructions/status. No live save needed for wording review. Separate non-outlet legacy recipe-cost-editor path still exists; it was inspected but not altered in this bounded task (prior read-only fix applies recipe-master.html). Backend optimization, fractional capacity and independent spreadsheet backup pending. Remain Codex per Owner choice; code checkpoint2cd2939 is separate from Google recovery.


## 3 October 2026 — Highlight production controls named in the guide
WACP INTENT: Owner requests bold Reference recipe yield and consistent emphasis for guide-mentioned controls. Current main9b49258fda9fa818e5a77dd0f469a7139fcc3d49/source/guide inspected; governance retained from ongoing session. Small cosmetic scope: production labels bold with light visual grouping; Calculate/Save bold; input values normal weight; guide terminology aligned. Single-assistant PRO easier scanning; CON avoid bolding all content; COMPARE CSS only, no calculations/save/data changes; OBSERVER consistent field/action emphasis. Existing immutable HEAD is code checkpoint, data recovery untouched. Next implement scoped HTML CSS then existing CI/browser regressions. No new bespoke tests needed for this cosmetic change; live visual acceptance pending.

IMPLEMENTATION / TEST / RELEASE: scoped production labels now bold/dark green with pale background and left accent; input/select values normal weight; Calculate and Save visually emphasized. Guide uses exact output/portion label text. Two-file diff reviewed, production JS unchanged. PR28 headea7f97aa642ca24add798fd35e8bf9c45039d578 passed push37060014562/37060014470 and PR37060025865/37060025869 (preservation/browser and workload). Merged30ae9eace8e80c16ca467a8b9e71f26148686af4. Pages37060141260 SUCCESS; postmerge preservation37060141662, workload37060141739, standards37060141724 and market37060141697 SUCCESS. Existing isolated browser scenarios executed; no new cosmetic-only tests. Live visual/Owner acceptance PENDING, no live Google write. Post-test single-assistant PRO consistent guide/control emphasis implemented; CON actual appearance requires Owner review; COMPARE no calculations/save/field values changed; OBSERVER labels distinguished from entered values. Next preserve unsaved edits before Ctrl+Shift+R on Idli recipe cost editor, then inspect Reference recipe yield/portion labels and Calculate/Save. Remain Codex per Owner preference. Backend/capacity/independent backup and separately noted non-outlet legacy edit path remain pending; code/data recovery separate.


## 3 October 2026 — Portion calculation feedback, provenance and precision
WACP INTENT: Owner requests two-decimal display, honest portion source, reference before intended weight, adjacent Calculate, explicit chosen output weight and responsive result/error. Main1ae25fd079839de8ff4afc747bb0abcdb943961b checkpoint; production flow/source library/tests inspected, v4.2 governance retained. Code shows custom grams ignored unless custom selected and calculation status distant; actual browser failure not yet reproduced. Source Idli portionGrams50 is BOBS calibration without specific universal-industry-weight proof; label saved standard/prepared fallback and calibration accurately. Single-assistant PRO explicit local calculation/output choice; CON never round tiny ingredient into zero or claim proven industry weight; COMPARE reference remains denominator, selected intended weight is one output target, recipe scaling/save architecture unchanged; OBSERVER visible adjacent completion/error, stale marker and route to results. Implement two-decimal display with exact unedited values retained and sub-kg/sub-L quantities shown in g/ml with rate-unit labels. No live Google write or recipe standard changes. Owner seven requested improvements authorize bounded flow repair; backend/capacity issues pending. Next implement and test50->100->110g, reference mode, invalid inputs, tiny quantities/precision and mock save/readback/reopen.

IMPLEMENTATION CHECKPOINT: reference weight precedes intended; honest per-source BOBS calibration note; custom typing selects custom; Calculate moved beside choices with local working/completion/error and chosen-output summary, stale marker and jump to review/save. Food uses one chosen output weight versus baseline, fuel remains batch-scaled. Two-decimal display retains raw values until actual edit; small kg/L quantities shown as g/ml, rate units explicitly unchanged. Save format unchanged. Extended existing isolated browser tests for100/110g, reference mode, invalid/missing baseline, tiny qty conversions and exact mock payload. Tests pending; no live Google writes.

REVIEW CHECKPOINT: added mock reopen verification for saved110g choice/360 output and precision; successful save now clears adjacent not-saved calculation message as well. Missing baseline source note clarified. Initial CI pending; no pass claimed yet. Next inspect final CI/browser results, repair failures if any before merge.

TEST / RELEASE RESULT: initial safety37064939292/37064993776 and workload37064939453/37064993721 PASS. Final heada683834db2118f38bbc747f6f58e8492fa711f14 safety37065117200/37065122094 and workload37065117272/37065122031 PASS. Existing16 preservation/page and4 calibration tests plus connected store/catalogue/history/setup/UX checks PASS. Isolated Chrome1366/615/390px verifies reference before intended, adjacent Calculate, custom auto-selection, 360 output100g food2x (rice9.60kg) /110g2.2x (10.56kg), fuel remains0.60kg for360, reference mode, blank custom/missing baseline errors, unchecked/stale save blocking, exact tiny-qty save (0.0352kg for480 at110g), mock saved payload/reopen110g scaled back to360, changed edit/error status. No live Google writes. Original browser failure not independently reproduced; known custom-selection/distant feedback issues addressed. No new claim of universal industry weight.
PR29 merged93013437d780668796da3974755e17ef0f5be4f4; Pages37065244786 SUCCESS. Postmerge safety37065245505, workload37065245509, market37065245367 and standards37065245433 SUCCESS. PUBLISHED; live visual/real Google save and Owner UAT PENDING. Single-assistant post-test PRO tested visible selection/calculation/save/reopen; CON actual cooked yield still needs trial and live visual pending, two-decimal display retains exact untouched numbers; COMPARE existing C.scale/business fuel rule and outlet save schema preserved, presentation quantity units converted only for display; OBSERVER raw rate units stated and saved/calculated/stale/error messages distinct. Exact next: preserve unsaved edits then hard refresh Idli recipe-cost-editor URL, review source, enter100 custom grams with50 reference, Calculate, see chosen100g and2.00x, View calculated quantities and Save for review; saving remains explicit and verified. Backend optimization, fractional capacity1000/120, independent whole-sheet backup and separately noted non-outlet legacy writer remain pending. Code checkpoint1ae25fd is separate from data recovery. Stay Codex per Owner preference, no mode transfer claimed.


## 3 October 2026 — Three-decimal recipe display
WACP INTENT: Owner requests three decimal places to keep small recipe quantities visible. Current maind29d8f737b138f48aba7a6b576d280debdfb9262/source/tests inspected; governance from ongoing session retained. Bounded display change: formatting2->3, corresponding guide and browser expectations; exact calculation/save values remain untouched, g/ml display conversions retained. Single-assistant PRO more visible precision; CON never round saved quantities; COMPARE formatter only, no recipe/schema/Google changes; OBSERVER confirm display and existing exact mock save/reopen assertions. Immutable HEAD is code checkpoint; Google recovery separate. Next implement and run existing browser/regression suite, then release. No live Google write.


THREE-DECIMAL RESULT: PR30 merged30b8e1239496deeb2394b14976c75dc37f4145e8. Production editor displays quantities, rates, costs and calculated summaries to three decimals; small kg/L quantities remain displayed as g/ml. Calculation and saved-value precision unchanged. Branch safety37065998988/37065996172 and workload37065999068/37065996193 PASS, including isolated Chrome tests at1366/615/390px and exact mock save/reopen. Postmerge safety37066322518, workload37066322574, standards37066322546 and market37066322595 PASS. Pages37066321615 SUCCESS: PUBLISHED. Independent live visual and Owner acceptance PENDING; no live Google writes. One-assistant post-test PRO clearer small quantities; CON display remains rounded, raw calculation/save values preserved; COMPARE formatting-only and existing unit conversion; OBSERVER browser assertions and exact saved-value checks pass. Owner laptop next: preserve unsaved edits, Ctrl+Shift+R the recipe cost editor and inspect three-decimal values. Existing backend/capacity/whole-sheet backup/legacy-writer follow-ups remain pending. Stay Codex per latest Owner preference.
