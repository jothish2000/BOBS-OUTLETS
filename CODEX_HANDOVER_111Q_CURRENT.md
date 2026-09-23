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
- Test evidence must feed back through 5PV-DR before completion.
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
