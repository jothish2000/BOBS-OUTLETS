# Complete BOBS flow — approved 11 October 2026
Status: implemented locally; final tests/publication/live verification pending. Owner accepted scope and normal live delivery. One assistant performs the four separate review passes; no independent agents claimed.

Outlet setup and shifts → fixed expenses / minimum mandatory roles → company-norm salary packages → method choice → selected menu → per-item capacity and existing/proposed equipment → intended quantity and deadline → recipe/yield/portions/sides → production time assessment → combined shared-equipment and staff assessment → delivery/riders → Reverse THP → item allocations and asset depreciation in Section06 → ideal price and break-even → working capital and capital purchases → actual Sold Today / saved item → outlet analysis → next outlet / company review.

## Authoritative owners and dependencies

| Record | Owner / effect |
|---|---|
| OUTLET_BASELINE / FIXED_EXPENSES | Shifts, mandatory positions and selected outlet expenses; existing verified writer |
| METHOD2 | Selected catalogue indices, intended inputs and separately confirmed actual quantities; no reordering or invented sales |
| BOBS_STANDARD_RECIPE / audited references | Recipe yield, ingredients, starting timings and roles; recipe yield is not equipment capacity |
| ASSET_MASTER | One asset/group ID, owned/proposed counts, reviewed valuation and product depreciation shares |
| OUTLET_PRODUCTION_PLAN | New additive record: per-item reviewed quantities and recipe fingerprints; processes link exact equipment unit slots and shared preparation IDs; whole-menu source fingerprint |
| OUTLET_STAFFING | Active task intervals, reviewed shared skill/availability, additional positions, rider choices; fingerprint of accepted production plan |
| THP_NORMS / STAFF_MASTER / HR allocations | Existing salary package rules and employee cost; one employee cannot fund duplicate positions |
| OUTLET_COST_ALLOCATIONS | Existing item shares plus break-even fixed/variable behavior and explicit assumption review |
| CAPITAL_EXPENDITURE / WORKING_CAPITAL | Existing purchase funding and daily cash planning; no depreciation in operating cash |

A new machine is proposed until owned quantity says otherwise. Its cost/residual/life remain blank until reviewed in Asset Master. Equipment references are sizes, not brand purchase recommendations. Planned staff are positions, not hired employees. No source records are automatically seeded on page load.

Time: capacity determines cycles. Setup/loading/unloading/cleaning and supervised intervals occupy a worker. Machine running and optional passive holding occupy equipment. Compatible common preparation quantities sum only after explicit shared-ID review; separate recipes continue to own their food requirements. Shared machines alone do not merge food. Dependencies and deadlines are checked. A shared person requires approved skills, availability, active-work and attendance-span limits; breaks exclude assignment. No universal safe shift length is inferred.

## Reference evidence (checked 11 October 2026)

- Steamer size options, manufacturer: https://www.fiduciasteamcookingplant.com/products/commercial-idli-steamer/4 (60 and120 piece examples are editable planning references).
- Grinder input specification: https://www.sowbaghyagrinder.com/sowbaghya-ss-conventional-wet-grinder-5l (5L drum example, separate3kg rice or1kg dal input limits; never infer batter yield).
- Vessel versus raw-input distinction: https://cuckooindia.in/products/cuckoo-rice-cooker-cr-1713 . No cooked-rice output inferred.
- Break-even relationship: https://legacy.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point . Fixed costs / contribution; the application states allocated item scope, constant menu mix and cost assumptions.

## Break-even

Contribution per sold unit = current price − reviewed direct variable food/packing − variable shared-expense allowance. Fixed allocated daily expenses and salaries are counted once. Cash break-even excludes depreciation; pricing break-even adds machinery depreciation once. Discrete units round upward. Nonpositive contribution has no finite break-even. Blank inputs or unreviewed classifications stay pending. This is a constant-unit-cost scenario; actual batch commitments and whole packing sets can differ. Spoilage/UUWP and target profit are not charged twice as expenses.

## Protection and rollout

Recovery code ref: recovery/pre-complete-flow-20261011 at0c89d1c1ba79eecca19667927f81f5c76e26eebd. Existing protected saves back up/read back individual records; optimistic protection is not atomic server CAS. Multi-record plan saves report confirmed partial results and retain drafts on failure. No operational migration or real business writes during testing. Code rollback and Google record recovery are separate. Existing unknown fields and unrelated records are retained.

Tests observed so far:64 model/DOM regressions passed after repairing initial shared-skill alias failure. Later integration changes, native browser and live verification pending. Both continuation handovers carry the same state.
