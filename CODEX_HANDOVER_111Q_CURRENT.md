# BOBS / UDANE — CURRENT 111Q CODEX HANDOVER

**Date:** 23 Sep 2026  
**Repository:** `jothish2000/BOBS-OUTLETS`  
**Current main HEAD at handover creation:** `c289cea2336226b9589b50c08ae5a190582fd71a`

## 0. READ THIS FIRST

Continue from the current repository HEAD. **Do not restart architecture or rebuild already-completed Method 2 / Recipe Master work.** Inspect current source before editing.

Canonical working rule for this project is now:

**111Q = 111Q5PVDDRT**

- **5PV:** PRO / CON / COMPARE & CONNECTIONS / OBSERVER / YOU-OWNER.
- **First D:** universal Developer/Codex handover.
- **DR:** first four views inspect both business/logic and code/software.
- **T:** mandatory Tester stage after implementation.
- Test evidence must feed back through 5PV-DR before completion.
- Owner is the final decision-maker.

`OVERALL_DESIGN_MASTER_111Q.md` currently still says `111Q5PVDRT`; treat the above `111Q5PVDDRT` as the newer Owner-approved governance until that master is updated.

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
- `bobs-config.js` — now contains safe snack-catalogue extension logic to avoid shifting historical Method-2 snack indices when adding Onion/Vazhakkai Bajji.

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

## 8. RECOVERY POINTS

Important recovery refs:

- `recovery/pre-condiment-labour-recipes-v1` -> `ce7ba3c8ec3d5a679635fa5976ca3edd641ad304`
- `recovery/pre-small-outlet-recipe-standard-v1` -> `28d2849a15ce7aa7eb41db8395b9192d948c275f`
- `recovery/pre-full-small-outlet-recipe-upgrade-v2` -> `c5417212119d785bee680b5ee8a8f3c3b404a632`
- `recovery/pre-workload-timeline-fix-v2` -> `a2fab90f3b084a5230883b0bdb2f5d043fa78fca`

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

- **DESIGNED:** YES — current small-outlet recipe + staffing architecture.
- **OWNER APPROVED:** YES for small-batch strategy, unified Recipe Master, energy in recipe COGS, separate Vada specialist logic and Cook1+Helper1-first staffing test.
- **IMPLEMENTED:** YES for current recipe/cost/timing/catalogue code described above.
- **CODE CHECKED:** source inspected.
- **AUTOMATED TESTED:** NOT VERIFIED for the complete latest full-upgrade chain. Do not rely on prose claims without reproducible test evidence.
- **BROWSER TESTED:** NOT RUN for the latest full Recipe Master migration.
- **DEPLOYED / PUBLISHED:** repository main contains the implementation; GitHub Pages live state must still be checked.
- **LIVE VERIFIED:** NOT YET for the latest full Recipe Master migration.
- **OWNER UAT ACCEPTED:** NOT YET.
- **RECOVERY POINT AVAILABLE:** YES.

Never convert code inspection into browser/live verification.

## 13. EXACT NEXT CODEX ACTION

1. Fetch current `main` HEAD; if it differs from the HEAD above, inspect all intervening commits before changing anything.
2. Read this handover + `OVERALL_DESIGN_MASTER_111Q.md`; use the newer `111Q5PVDDRT` rule stated here.
3. Browser/UAT test `recipe-master.html` on GitHub Pages:
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
4. Verify Method 2 item selection still maps historical snack selections correctly after Onion/Vazhakkai additions.
5. Upgrade Workload & Staffing so selected parent products expand to linked condiment workloads and detailed active/passive stages can be scheduled without simply summing elapsed time.
6. Build the Owner-requested **Cook1 + Helper1 whole-day timeline** using Recipe Master timings.
7. Feed actual tester findings through post-test 5PV-DR.
8. If any latest full-upgrade test fails, repair/retest before calling the work complete.
9. Update this handover after each material implementation.

## 14. DO NOT CHANGE WITHOUT OWNER DECISION

- Do not overwrite the existing Idli ingredient recipe merely to match a seed recipe.
- Do not merge Vada Master into Tiffin Cook by default.
- Do not include labour/fixed expense inside Actual COGS.
- Do not double-count shared condiment/shared-base work.
- Do not shift historical Method 2 catalogue indices.
- Do not infer Cook2 automatically from total labour minutes; run capacity/timeline first.
- Do not silently treat guide rates/batch assumptions as measured outlet truth.

## 15. PORTABLE CONTINUATION COMMAND

> Continue BOBS from current HEAD using `CODEX_HANDOVER_111Q_CURRENT.md` and `OVERALL_DESIGN_MASTER_111Q.md`. Apply canonical 111Q as **111Q5PVDDRT**. Inspect existing source and Google-backed data flow before edits. Preserve recovery. Do not restart completed architecture. Test the latest Recipe Master migration and connected Method 2 flow first, then continue linked-condiment workload scheduling and the Cook1 + Helper1 whole-day staffing plan. Report exact implementation/test/live/UAT status; never call untested work complete.
