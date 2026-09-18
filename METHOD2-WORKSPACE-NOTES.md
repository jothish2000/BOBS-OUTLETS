# Method 2 item workspace

The Method 2 list opens one full-page editor window per item. It does not load the old production/condiment/input-fix runtimes. The previous page is retained as method2-legacy.html for reference, not linked as a user workflow.

## Persistence and validation

- Saved business records are read from Google Data Vault, METHOD2/default, per outlet.
- Save reads the latest record, merges only the selected item, and confirms the saved token by reading Google back. Browser storage is a compatibility mirror, not authoritative.
- Existing unrelated fields, items and recipes are preserved. A browser-local pre-v4 copy is retained when available.
- Unsaved edits are explicitly labelled; closing the editor warns. Save This Item is required for permanent storage.
- Blank Sold Today blocks save. Zero always asks for confirmation. Legacy and previous-day quantities require confirmation. Save & Continue reviews selected, unfinished or unconfirmed items; unused catalogue rows are not compulsory.
- Cross-window changes to the same item block overwriting. Web Locks serialize saves in the same browser. The Apps Script endpoint does not provide an atomic compare-and-swap contract, so simultaneous saves from different devices cannot be fully serialized by this client.

## Cost basis

Recipe cost is sum(quantity × rate) divided by the recipe yield. Grams and kg, and ml and litres, convert explicitly; mass-to-volume conversions are rejected. Rice servings and piece-count sales both use count-based yields.

Purchased sides use separate supplier rates. Packing is allocated per sales unit using units per parcel. Per-unit COGS, sold-quantity COGS, sales and base food commitment are separate. UUWP remains a pricing allowance; markup is applied to COGS including applicable UUWP.

## Poriyal templates

Five recipe-inspired, editable templates are offered: cabbage, carrot, beans, beetroot, carrot–beans. They are added to the shared Google Recipe Master individually only when the user fills rates and saves the recipe. No existing master is bulk-replaced or seeded.

References:

- [Cabbage — Dassana Amit](https://www.vegrecipesofindia.com/cabbage-poriyal-recipe/)
- [Carrot — Dassana Amit](https://www.vegrecipesofindia.com/carrot-poriyal-recipe/)
- [Beans — Dassana Amit](https://www.vegrecipesofindia.com/french-beans-poriyal-recipe/)
- [Beetroot — Dassana Amit](https://www.vegrecipesofindia.com/beetroot-poriyal/)
- [Carrot–beans — Rekha Shivakumar](https://www.reshkitchen.com/carrot-beans-poriyal)

These references support recipe styles, not commercial market rates or a universal serving standard. Formulations, gram conversions, cooked yields and the 50 g rice-side allowance are planning assumptions. Check the actual cooked yield in the kitchen. Enter invoice rates and fuel costs; blank prices deliberately keep COGS incomplete. Ingredient costs omitted from a recipe are not included.

## Regression test

### Category selection and shared packing update

The outlet Method 2 button now opens method2-select.html as a separate window. Each category has its own URL and checkbox table. Category selections are stored in the same Google METHOD2 record under selection[category], verified by read-back, without deleting deselected item data. Existing saved items remain selected until that category is explicitly reviewed.

Method 2 renders and calculates only selected rows. It no longer reloads on window focus. Confirmed-save messages or an explicit Reload trigger refresh; request generations prevent an older slow response from replacing newer data. The Sides & Extras selection page reads the original Recipe Master; other category selection pages and an empty working list avoid that read.

Packing now belongs to each item and condiment. The Idli preset adds only an aluminium box shared by two idlis. Add the sambar pouch under Sambar, with its own sharing count. A ₹3 box and ₹1 pouch, each shared by two idlis, cost ₹2 per idli and ₹1,200 for 600 sold. Whole partially filled sets are charged. Each owner can choose no extra packing or supplier-included packing; inactive material rows remain saved. Existing legacy packing stays under its original owner with a review notice.

The reconciled version retains the published Sides & Extras category, name-based selections, sideCatalog order, recipe aliases, supplier unit/batch inputs, and supplier conflict checks. It reads both supplier schemas, retains unknown metadata, and mirrors old supplier fields on explicit saves. Existing items retain the known-leftovers UUWP exemption through an editable policy; new items default to all-source UUWP. No automatic data migration or Google write occurs on page load. Outlet-analysis and recipe-master upgrades from the remote history remain unchanged.

Additional tests: node tests/method2-commerce.cjs, node tests/method2-component-packing.cjs, and node tests/method2-reconciliation.cjs. The reconciliation test includes saved records in the published schema, unchanged unrelated records, legacy supplier fields, stable side indices, and stale-save rejection.

Run node tests/method2-selection.cjs for the new selection, slow-response, focus/scroll, shared-packing and data-preservation browser tests.

Run node tests/method2-workspace.cjs with Playwright available (PLAYWRIGHT_PATH can override the bundled module path). The test uses a simulated Google endpoint and makes no live business-data writes.
