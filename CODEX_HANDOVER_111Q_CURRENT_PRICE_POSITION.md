# BOBS METHOD 2 — 111Q CODEX HANDOVER — CURRENT SELLING PRICE POSITION

## Continuation point
Continue from repository HEAD after commit `194c4d233c4c0e132c11dca46d2a341cf9acd18c`.
Do not restart or redesign Method 2. Preserve the existing 111Q architecture, Google-backed current selling price, verified-save/backup/recovery mechanism, Actual COGS vs Ideal Pricing separation, packing ownership, and condiment quantity-served logic.

## Change completed
The duplicate read-only Ideal Pricing row:
`Current selling price — editable above ₹...`
has been removed.

The one authoritative editable control:
`Current selling price ₹ / sales unit — shared with selection screen`
has been moved into the Ideal Pricing Builder at the former comparison position, after the pricing output and before `Current vs ideal`.

There is still only ONE authoritative `#price` input. No pricing storage or save architecture was duplicated.

`Current vs ideal` continues to calculate from that same editable `d.price` value:
`current selling price - suggested/ideal selling price`.
Editing the box triggers the existing `changed() -> pull() -> calculate()` path, so the comparison updates from the same value.

## Files changed
- `method2-item.html`: moved the existing `#price` input; added `#currentVsIdeal`; cache-busted item JS.
- `method2-item.js`: removed duplicate read-only Current selling price output and renders Current vs ideal into `#currentVsIdeal`.

## Safety / 111Q constraints
- No Google data reset.
- No formula change to Actual COGS, spoilage, UUWP, suggested price, packing, recipes, or condiments.
- No change to current-price persistence: Selection screen and Item Editor remain linked to the same Google-backed current price.
- Existing backup/recovery architecture remains untouched.
- Known pre-change recovery point: commit `fd2aff997fed2a17233b83a1a845fdd30661f96f`.
- New implementation commits: `7e2d0512adde5dae24dd00ce76d2263f33e2c0c0`, then `194c4d233c4c0e132c11dca46d2a341cf9acd18c`.

## Next Codex action
First inspect repository HEAD and this handover. Do not repeat completed work. Run/extend existing Method 2 tests and browser-check the Ideal Pricing Builder:
1. exactly one editable Current selling price control;
2. no duplicate read-only Current selling price row;
3. changing Current selling price immediately changes Current vs ideal;
4. save/read-back still persists the shared Google-backed price;
5. Selection screen receives the saved price;
6. no regressions in Actual COGS, spoilage, UUWP, packing, or condiment calculations.
