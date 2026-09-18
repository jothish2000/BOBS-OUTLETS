# Purchase, production and separately sold sides

Implemented 2026-09-18. Browser regression coverage is in tests/method2-commerce.cjs. No sample ingredient prices or recipe quantities were imported. Standalone sambar starts at 200 ml; other standalone side portion sizes and prices must be entered.

## Separate source from sale role

Every product and attached side independently chooses Production or Purchase.
New sides can default to the main item's source; changing the main item must not silently replace existing side choices or rates.
Production links to its Recipe Master. Purchase links to its Purchase Master.
Use the same stable product identity for a side sold separately and included with another item; do not duplicate recipes, procurement, or stock.

Add a Sides & Extras catalogue beside Breakfast, Lunch, Namkeen and Biscuits.
An attached side has an editable portion and cost, but no independent selling price.
A separately sold side has its own sales quantity, serving/pack size, selling price, packing and UUWP allowance.
Example: Sambar, 200 ml portion, selling price ₹20 (illustrative and editable). Price alone does not establish how much food was delivered.

## Purchase Master

Choose individual unit / bulk batch. Enter quantity, unit, total paid, supplier and date.
Derive a normalized rate: rupees per piece, ml or gram; retain entered batch details and rate precision.
120 idlis costing ₹840 = ₹7 per idli.
10 L sambar costing ₹600 = ₹0.06/ml; a 20 ml included portion costs ₹1.20.
Production uses verified recipe yield and ingredient rates instead.
Default portions remain editable planning values, not claimed universal industry standards.
Do not silently convert grams to ml without an explicit density.
Separate quantity purchased/produced from quantity sold and quantity used as included sides.

## Packing, allowance and pricing

Packing is owned by each main item and each included condiment. Each owner chooses additional packing required, no extra packing, or included in its supplier price (Purchase only). Inactive material rows are retained. New components require an explicit choice.

Each owner's sets = ceiling(sold main sales units / sales units sharing its set). Charge those whole sets once; divide by sold units for the consolidated per-unit figure. With no sold quantity, show nominal packing per unit. Food-only spoilage excludes packaging. Right-hand component totals include food and that component's packing, with no additional packing addend.

An Idli preset creates one aluminium box shared by two idlis, not a side pouch. Side pouches belong to their sides; a shared carry bag must be assigned to only one owner. Legacy packing remains under its existing main owner with a review notice, not silently redistributed or duplicated. Canonical Google item records retain component ownership; the legacy packing mirror records owner metadata and aggregate allocations.

All main products, regardless of source, have visible packing and UUWP controls.
Whole parcels retain the cost of a partially filled final parcel.
Food inside a pouch is not also counted as packaging.
Charge a shared pouch or allowance once, not again through each linked component.
UUWP is a pricing allowance; show it separately from actual procurement expense and observed waste.
The editable UUWP policy supports both all-source pricing and the published known-production-leftovers exemption. Existing saved items retain the exemption; new items default to all-source pricing. Saved business records are not bulk-rewritten. Direct sold COGS excludes this allowance.

Offer a clearly named pricing basis: Markup on cost or Target gross margin.
Markup price = adjusted unit cost × (1 + markup/100).
Margin price = adjusted unit cost ÷ (1 - margin/100), with margin below 100%.
Keep actual selling price editable. Catalogue reference prices need source/date or a clear unverified-estimate label.
Included sides have no separate revenue; separately sold sides do.

## Persistence and rollout

Google remains authoritative; verify read-back before reporting saved.
Preserve existing rates, item keys and history. No automatic overwrite of live records.
Sides catalogue entries retain the published Sides & Extras category and sideCatalog order, alongside enriched sideCatalogue metadata. Name-based selections and existing indices are preserved. Recipe reordering cannot reassign saved item indices. Purchase Masters share the same Google record and browser write lock; stale purchase edits block saving. Both published batchQty/batchCost/unitCost and normalized qty/total schemas are supported.
Overall COGS shows side quantities included with products and quantities separately sold, grouped by recipe name, source and unit. This is a derived usage summary, not a stock ledger. Availability entered for standalone sides is only the stock allocated to separate sales. No duplicated procurement/receipt is recorded.
Test piece and mass/volume batches, zero/blank inputs, all four hybrid combinations, source switches, mixed standalone/bundled consumption, packing and UUWP double counting, and cache-free reload.
