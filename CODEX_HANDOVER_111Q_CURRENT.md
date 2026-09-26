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

