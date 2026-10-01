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
