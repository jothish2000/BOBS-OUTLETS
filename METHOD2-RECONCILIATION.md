# Method 2 reconciliation — 18 September 2026

Status: local tested implementation, awaiting the user's mixed-product common-bag allocation choice and visual acceptance. Not yet published.

Both source histories are retained in Git. No Method 1 files or calculations were changed. No live Google data was migrated, reset, or written during this work.

## Preserved and adapted

- Original Recipe Master ingredients, rates and recipe editing remain separate from outlet packing.
- Canonical General... recipe aliases are supported without merging Rice Sambar with Idli Sambar.
- Main products and sides independently support production or supplier unit/batch costing.
- Sides & Extras keeps its published category, saved order/indices and name-based selections; 200 ml separately sold sambar uses the original recipe.
- Unknown saved fields, old supplier schemas, confirmed Google read-back and stale-write checks are preserved.
- Existing UUWP policies are retained; new items offer the all-source rule.
- New products no longer silently load a catalogue purchase estimate as the supplier rate.
- Purchase availability is visibly entered as sales units per purchased lot × lots, distinct from the supplier's costing batch.

## Packing compatibility

The latest remote schema uses itemPackaging/itemPackingPer for the main component, condiment packaging/packingPer, and top-level packaging/packingPer for common packing. The earlier local schema used top-level packing for the main component.

Readers distinguish these layouts and normalize only the in-memory draft. New explicit saves use packingSchemaVersion 3 with mainPacking and commonPacking objects, retaining inactive rows. Published itemPackaging and common packaging fields are mirrored. Unrelated records are never reconstructed from a subset.

Main food + main packing and each side's food + side packing are charged once. Common packing is added once; food spoilage never multiplies packing. The separate consolidated packing summary is informational, not another addend. Whole final containers are charged with ceiling(sold/sharing count).

The first heading is 01 · Product name. The main packing module is inside that product section.

Common packing currently supports assigning a shared bag to one product only. A separate question asks whether mixed-product bags should instead be entered once at outlet/order level. No cross-product allocation percentage or assumed order count has been invented.

## Downstream audit

An older COGS enhancement used catalogue estimates and overwrote modern totals after page load. It now skips modern itemEditors records. Outlet Analysis uses saved component-inclusive totalSoldCogs for modern records. The existing browser compatibility mirror now includes Method 2 daily sales and cost for the legacy daily break-even page; Google remains authoritative for Method 2.

The legacy daily break-even page itself still reads its existing browser snapshot and is not converted to a new persistence architecture in this packing change.

## Tests

Run node tests/method2-component-packing.cjs, node tests/method2-reconciliation.cjs, node tests/method2-workspace.cjs, node tests/method2-selection.cjs and node tests/method2-commerce.cjs.

They cover arithmetic, odd quantities, main/side/common combinations, disabled packing retention, both saved packing schemas, supplier batches, standalone sides, aliases, selection stability, persistence, unrelated metadata, stale writes, failed save/readback, cache-free reload, popup closing, delayed loading, and downstream COGS.

Browser suites use Chrome with mock Google responses. Generated screenshots are test artifacts, not production assets.
