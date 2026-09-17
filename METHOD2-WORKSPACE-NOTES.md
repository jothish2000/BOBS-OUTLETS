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

Method 2 renders and calculates only selected rows. It no longer reloads on window focus. Confirmed-save messages or an explicit Reload trigger refresh; request generations prevent an older slow response from replacing newer data. Recipe Master is not requested by the selection pages or an empty working list.

The Idli packing setup uses one empty sambar pouch and one aluminium container shared by two idlis. Supplier prices remain user-entered. Each component shows quantity × price ÷ sharing count. For example, ₹1 + ₹3 shared by 2 = ₹2 per idli; 600 sold allocates ₹1,200. The food inside the pouch stays under Condiments. Existing saved packing is not automatically converted or overwritten.

Run node tests/method2-selection.cjs for the new selection, slow-response, focus/scroll, shared-packing and data-preservation browser tests.

Run node tests/method2-workspace.cjs with Playwright available (PLAYWRIGHT_PATH can override the bundled module path). The test uses a simulated Google endpoint and makes no live business-data writes.
