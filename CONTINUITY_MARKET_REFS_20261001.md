# BOBS market-reference calibration — 1 October 2026

## WACP intent before implementation
Owner clarified that the right side of the two-column Recipe Cost / Production editor must represent a researched small-hotel market reference recipe, not an arbitrary batch size and not the legacy shared Recipe Master merely because it is already saved. The left side remains outlet-specific intended production (for example 360 idlis from the Method-2 plan), scaled from the chosen market reference and then calibrated by actual outlet yield.

Starting source: main `7b25d42eca73221bc187cbe8a864091e33f6c367`.
Recovery: main remains untouched until review/merge; working branch is `chatgpt/market-reference-calibration-20261001`.

Material actions intended:
1. Add a separate market-reference calibration layer instead of rewriting Google Recipe Master records on page load.
2. Make the two-column editor prefer the researched BOBS market reference when one exists; retain the saved Recipe Master only as a legacy/comparison source.
3. Correct Idli reference data from the current owner-originated 120-piece seed / overweight ingredient assumption using published recipe evidence plus current commercial-equipment evidence. Equipment capacity and culinary recipe yield remain separate fields.
4. Add source/basis/confidence metadata so BOBS never labels an engineering assumption as an industry standard.
5. Apply reference metadata across every generated in-house guide recipe; direct researched overrides receive MARKET_RESEARCHED status while uncalibrated families remain clearly marked ENGINEERING_ESTIMATE until evidence is added.
6. Preserve outlet Method-2 saved overrides, shared Recipe Master, Google data, selling prices and prior backups. No automatic migration or Google write.
7. Add focused regression coverage for default reference selection, Idli scaling and preservation of the legacy saved master.

Research checkpoint before code:
- Current commercial idli steamers are offered in several capacities, including compact 54, 90/120 and 96/120 ranges; therefore 120 is a common market size but not a universal standard.
- Published regular-idli recipes give roughly 30 idlis from about 2 cups rice + 120 g urad dal, materially below the existing BOBS 3.5 kg rice + 0.9 kg urad seed for 120 idlis.
- Published hotel-style/restaurant-style references also support family-level calibration for dosa, medu vada, pongal, chutney and rice dishes.

Exact next step: implement the non-destructive market-reference layer and wire it into the recipe production editor, then record actual test results here before any PR/merge.

## Implementation result
- Added `recipe-market-references.js` as a non-destructive overlay on `BOBS_GUIDE_RECIPES`; Google Recipe Master is not mutated.
- Every generated reference now receives an evidence state. Unresearched values are `ENGINEERING_ESTIMATE` / LOW confidence instead of being presented as industry standards.
- Idli is `MARKET_RESEARCHED` / HIGH confidence for food quantities and equipment-range evidence: 120-piece reference; 1.60 kg idli rice; 0.48 kg urad; 0.08 kg thick poha; fenugreek and salt; existing LPG value retained only as a clearly provisional engineering estimate pending actual steamer/fuel calibration.
- Commercial equipment evidence is kept separate from culinary yield: current examples include compact 54, 90, 96 and 120-idli machines. The UI explicitly states that 120 is a practical market reference, not a universal standard.
- Dosa, Vada, Pongal, Curd Rice and hotel-style Chutney families carry published evidence metadata; their remaining unverified serving/fuel/oil assumptions are called out for outlet calibration.
- `recipe-cost-editor.html` loads the market layer after the old guide seeds and its test guide now describes market-vs-legacy behavior.
- `recipe-production-editor.js` uses `BOBS_MARKET_REFERENCES` first, defaults new plans to the market reference where available, keeps the legacy saved Recipe Master as an alternate source, displays evidence/basis/confidence/source links, and stores the market-reference version with outlet overrides. Existing saved explicit source choices remain respected.
- Added `tests/market-reference-calibration.cjs` for non-destructive Idli recalibration, evidence status coverage and market-reference default wiring.

## Verification boundary
Source files were re-read from the working branch after writes. A local runtime attempt could not execute because the isolated container has no DNS/network access to clone GitHub; therefore the new Node regression has NOT yet been executed in this environment. No Google operational write, migration, live-save test or production deployment was performed. Main remains untouched.

111Q review: PRO — right/left architecture now matches owner intent and avoids legacy data masquerading as market reference. CON — the full catalogue is not yet individually researched; uncalibrated recipes are intentionally marked engineering estimates rather than falsely promoted. COMPARE — Google Recipe Master and Method-2 persistence remain separate; market references are a read-only overlay. OBSERVER — Idli food quantities are materially corrected, while fuel/energy still needs actual equipment trial data. OWNER decision still required before merge/release.

Exact next step: review diff/PR, then continue evidence-backed calibration family-by-family before promoting each remaining ENGINEERING_ESTIMATE recipe to MARKET_RESEARCHED. Do not bulk-label old seeds as industry standard without evidence.

## FULL RECIPE MASTER MARKET AUDIT — owner continuation request
Owner has now explicitly asked to continue implementation and audit **all in-house recipes**, because the Recipe Master was originally intended to contain industrial/market-level standard recipe data. This supersedes the earlier Idli-first stopping point.

### WACP intent before this audit pass
1. Treat the current generated Recipe Master values as candidates, not truth. Compare each recipe family against published standardized/hotel/restaurant recipe evidence and commercial equipment realities.
2. Use a family-calibrated market reference for every in-house recipe on the right side. Do not let an old saved Recipe Master row become the default merely because it exists.
3. Separate four concerns: (a) culinary ingredient ratio/yield, (b) serving/portion policy, (c) equipment capacity/process time, and (d) actual supplier rates/fuel consumption. Only (a) and evidence-backed parts of (b)/(c) are market references; rates remain owner/current-supplier data.
4. Calibrate high-volume BOBS families first: Idli/Dosa/Appam, Vada/Bonda/Bajji/Pakoda, Upma/Pongal/Poori/Chapati, Sambar/Chutney, variety rice/curd rice/biryani, tea/coffee/cold beverages, sandwiches/puffs/rolls/samosa/kachori/jalebi. Any recipe without a defensible direct source will inherit a documented family ratio and MEDIUM confidence, not a false HIGH-confidence label.
5. Standardized recipe records must carry yield, portion, ingredient weights, process/equipment and evidence status. Current food-service standardization guidance explicitly requires these fields and also warns that a recipe standardized for one operation can require adaptation to another operation.
6. Preserve Google Recipe Master, Method-2 overrides and business data. This pass changes only the read-only market-reference overlay, its UI/audit metadata and tests until release is verified.
7. Add a complete audit summary to the reference library (`auditStatus`, `family`, `evidenceBasis`, `calibrationNotes`) so future UAT can see which recipe was directly researched versus family-derived.

### Research checkpoint for this audit pass
- Quantity-food-production guidance: standardized commercial recipes require ingredient weights/volumes, serving size, yield, cooking time/temperature and equipment; recipe enlargement uses desired yield/current yield factor, but operational verification is still required.
- Idli: commercial equipment is sold across many capacities; 120 is one practical commercial size, not a culinary standard.
- Medu vada: published reference ~14 vada from 200 g urad dal.
- Poori: published reference ~25–30 poori from 360 g atta.
- Chapati/roti: published reference ~15 from 360 g atta.
- Ven pongal: published reference 3 servings from 100 g rice + 60 g moong dal.
- Upma: common published breakfast reference uses ~1 cup rava for 2–3 servings depending style.
- Curd rice: published reference 3 servings from 100 g rice + 250 g curd.
- Lemon/tamarind/tomato/coconut rice and restaurant vegetable biryani references provide per-serving raw-rice and seasoning ratios suitable for family calibration.

Exact next action: expand `recipe-market-references.js` from Idli-first calibration into a full family audit/normalization layer; then strengthen tests to fail if any generated in-house reference lacks a market family, audit status or evidence basis.

## Full-audit implementation + CI result
- Expanded the market-reference layer to cover every generated in-house recipe with an explicit market family and audit state. High-evidence families now receive direct quantity corrections; families without sufficiently specific evidence retain a transparent family-calibrated reference rather than being falsely called universal industry standards.
- Material direct corrections include Idli, Dosa variants, Medu Vada, Pongal, Kesari, Poori (explicit 3-piece serving assumption), Chapati, Curd Rice, Lemon/Tamarind/Tomato/Coconut Rice, Vegetable Biryani, Jalebi and Kachori. Bajji/Bonda/Pakoda, Upma, Appam/Idiyappam, Sundal, Samosa, bakery fast-food, beverages, Sambar and Chutney are family-checked with explicit confidence/basis notes.
- Added `BOBS_MARKET_REFERENCE_AUDIT` and version `2026-10-01-MARKET-V2`.
- Strengthened `tests/market-reference-calibration.cjs` so known overweight seeds are caught and every generated reference must have family, audit status, evidence basis, calibration note and evidence.
- Updated Recipe Master CI to run the market audit together with the existing structural, Google read-back and sharded-storage tests.
- CI initially caught three implementation typos in array filters; each was repaired on the protected branch before release. This validated the new gate rather than bypassing it.
- Final branch commit `62b3816aee17f0fc58c8a901532a1de2274ba76b`; GitHub Actions run `36804505217`: **SUCCESS**. Steps passing: existing production-recipe audit, market-reference calibration audit, Recipe Master Google read-back retry, and sharded-storage integrity. The existing audit still reports **91 eligible catalogue recipes / 104 total standard recipes and condiments, all required production parameters complete**.
- Main/live remains unchanged; no Google operational records were written by this audit.

### WACP next verification intent
Before merge/release, add one real-catalogue integration test that loads the actual `shared_data.js` + `recipe-guide-seeds.js` + market overlay (rather than only the synthetic focused fixture) and asserts that the full generated market library has no missing family/evidence, no invalid/non-positive yield or ingredient quantities, and the known direct corrections survive on the actual catalogue. Then rerun CI and record the exact totals/result before release.

## FINAL RESULT LINK
The real-catalogue/Poriyal integration, final green CI, 111Q post-test review and release intent are recorded in `CONTINUITY_MARKET_REFS_RELEASE_20261001.md`. Final verified integration result: **103 unique real market references; 20 directly calibrated; 83 family checked; zero missing family/evidence/invalid rows**. GitHub Actions run `36804887778` passed all five audit/persistence steps on source commit `81b9f4f89a4a3859eef66cf47360d634f0e35d3a`. The subsequent continuity-only commits do not change application/runtime behavior.