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


---

## 111Q5PV-DR UPDATE — UUWP POLICY UI

### Implementation
Commit `bd1fc6f5e46870307a4d1234e47bfc8ce23fcbb6` hides the operator-facing **UUWP application rule** selector while preserving the existing `#uuwpPolicy` control as a hidden compatibility field. This avoids breaking the current Item Editor field/show/pull/event wiring or older saved values.

The Ideal Pricing Builder now visibly explains the operational rule:

> **UUWP rule:** When leftovers exist, BOBS automatically uses the actual leftover percentage. When 100% is sold, the UUWP default allowance above is used (default 5%).

It also states that UUWP is a pricing allowance only and does not change Actual COGS.

### 111Q5PV-DR rationale
- **PRO / logic:** the automatic rule remains visible and understandable.
- **PRO / software:** legacy policy state remains available internally.
- **CON addressed / logic:** the operator no longer has to choose a technical compatibility policy.
- **CON addressed / software:** no deletion/migration of old `uuwpPolicy` data was attempted.
- **COMPARE:** informational rule label replaces an unnecessary operational selector.
- **OBSERVE:** current `method2-core.js` calculation already applies actual leftover % when unsold quantity is positive and the default UUWP % when fully sold.
- **YOU / owner decision:** hide the selector; retain its compatibility plumbing.

### Intentionally untouched
No changes to Actual COGS, spoilage, UUWP calculation formula, pricing formula, Google save/read architecture, packing, recipes, condiments, or current selling price persistence.

### Recovery
Pre-change recovery point for this UI adjustment is the parent of `bd1fc6f...`. Earlier known-good Method 2 checkpoint remains `fd2aff997fed2a17233b83a1a845fdd30661f96f`.

### Verification status
- **Implemented:** YES.
- **Code-path inspection:** YES — the existing JS still expects `#uuwpPolicy`, therefore the field was hidden rather than physically removed.
- **Automated/browser tested:** NOT YET.
- **Live GitHub Pages verified:** NOT YET.

### Exact next Codex action
Continue from current HEAD. First browser-check that the Item Editor loads, the UUWP policy dropdown is no longer visible, the UUWP explanatory notice is visible, saved items still load/save, and UUWP calculation remains: actual leftover % when leftovers exist; default allowance when fully sold. Then continue normal 111Q5PV-DR work without redesigning Method 2.


---

## GOVERNANCE MASTER UPGRADE — 20 SEP 2026

The canonical working definition is now **111Q = 111Q5PVDRT**.

Repository master: `OVERALL_DESIGN_MASTER_111Q.md`

This consolidates the earlier Universal 111Q Master, BOBS 111Q Constitution/Codex handover principles, and the latest Owner-approved upgrades:
- 5PV = PRO / CON / COMPARE & CONNECTIONS / OBSERVER / OWNER;
- DR = every analytical view examines both logic/business and code/software;
- T = mandatory post-implementation tester role;
- T explicitly checks affected page/site loading, links/navigation, UI, calculations, persistence/read-back, connected regressions and recovery;
- test evidence must be fed back through a SECOND 5PV-DR before completion;
- status must distinguish implementation, code check, testing, browser/live verification and Owner UAT;
- every material change updates the continuation handover.

Future Codex sessions should read `OVERALL_DESIGN_MASTER_111Q.md` first and treat the project handover as the current BOBS state annex.
