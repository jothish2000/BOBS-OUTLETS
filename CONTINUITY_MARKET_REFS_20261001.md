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
