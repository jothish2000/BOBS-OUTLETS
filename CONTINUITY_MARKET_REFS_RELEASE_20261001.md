# BOBS Market Recipe Master — final audit / release checkpoint — 1 October 2026

## RESULT recorded immediately after verification
Owner requested implementation of the full Recipe Master market/industrial-reference audit and use of that data on the right side of the Recipe Production editor.

Protected branch: `chatgpt/market-reference-calibration-20261001`.
Recovery baseline/main before this work: `7b25d42eca73221bc187cbe8a864091e33f6c367`.
No operational Google Recipe Master / Method-2 records were written during implementation or testing.

### Implemented
- Right side defaults to **BOBS researched market reference** for new plans; **Legacy saved Recipe Master** remains available separately and is not silently treated as market truth.
- Left side remains outlet intended production and scales ingredient quantities from the selected market reference.
- Current/saved supplier rates are overlaid separately from market recipe quantities, so recipe standardization is not confused with commodity-price assumptions.
- Added evidence, market family, confidence, audit status, basis and calibration notes to every market reference.
- Direct market corrections cover material outliers/families including Idli, Dosa, Medu Vada, Pongal, Kesari, Poori, Chapati, Curd Rice, key variety-rice families, Vegetable Biryani, Jalebi and Kachori.
- Family-checked references cover Bajji/Bonda/Pakoda, Upma, Appam/Idiyappam, Sundal, Samosa, bakery fast-food items, beverages, Sambar, Chutney and remaining generated recipes without falsely claiming universal direct industrial data.
- Poriyal recipes are included in the same right-side market-reference library and upgraded to the `PORIYAL` market family even when an entry already existed as a generic condiment.
- Idli 120 remains a practical commercial reference batch, not a universal standard; equipment capacity remains separate from culinary yield.

### Final automated evidence
GitHub Actions run `36804887778`, head `81b9f4f89a4a3859eef66cf47360d634f0e35d3a`: **SUCCESS**.
- Existing Recipe Master V2 structural audit: **PASS — 91 eligible catalogue recipes; 104 total standard recipes/condiments; all required production parameters complete.**
- Focused market calibration regression: **4/4 PASS.**
- Real-catalogue market integration: **PASS — 103 unique real market references; 20 directly calibrated; 83 family checked; no missing family/evidence/invalid rows.**
- Recipe Master Google read-back retry: **PASS.**
- Recipe Master sharded storage integrity: **PASS.**

The 103-vs-104 difference is a unique-name/reference count versus structural recipe/condiment rows; the integration test derives expected unique names from the actual guide + Poriyal sources and confirms no unique Recipe Master reference is missing from the market library.

## 111Q post-test review
- PRO: market data now drives the right-side reference instead of arbitrary legacy values; major overweight seeds were corrected and full catalogue coverage is enforced by CI.
- CON: family-checked values are not represented as universal industrial truth; serving size, taste, trimming loss, oil absorption, fuel and equipment-cycle energy still require outlet calibration where evidence is operation-specific.
- COMPARE/CONNECTIONS: Google Recipe Master, Method-2 overrides, equipment/workload timing and current supplier prices remain separate; no migration or business-record rewrite was introduced.
- OBSERVER: automated source/integration tests are green; live deployed browser/mobile UAT and live Google save/readback of an owner-selected recipe have not yet been performed for this new release.
- OWNER: this implementation follows the explicit request to implement the full audit and use market references on the right side.

## WACP release intent
Next material action: convert draft PR #9 to ready, merge the verified source into `main`, then verify Pages deployment and perform a **read-only** live Idli page check (no Google save) to confirm the right side loads BOBS market reference by default and the left side still receives intended production quantity. Record deployment/source/UAT boundary immediately after. Code rollback baseline remains the pre-work main commit above; data rollback is not required because no operational data migration/write is part of this release.