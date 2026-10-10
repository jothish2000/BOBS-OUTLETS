# Approved outlet-first BOBS flow —10 October2026

Owner approved implementation in Codex on laptop after collecting intended changes1–4.

Outlet count/names -> shifts -> selected outlet expenses and minimum cashier/sales coverage -> method choice -> selected menu and quantities -> item delivery choice -> combined recipe-based workload and proposed positions -> Owner acceptance -> Reverse THP salary budgets -> original item Ideal Price Builder -> saved shared-cost allocations and price comparison -> outlet review -> company review.

## Data owners

All new records use existing Google Data Vault MODULE_DATA routing. No backend deployment or automatic operational migration is needed. Existing records remain intact.

| Record | Scope | Purpose |
|---|---|---|
| Outlet master | Outlet | Names and shift timings |
| OUTLET_BASELINE/default | Outlet | Working days, selected expense inputs, minimum counter positions/budgets, shift fingerprint |
| FIXED_EXPENSES/default | Outlet | Selected daily expense lines; monthly inputs/basis retained |
| OUTLET_ITEM_REQUIREMENTS/default | Outlet | Stable Method2 item keys and explicit delivery/no-delivery, shared rider IDs |
| OUTLET_STAFFING/default | Outlet | Accepted positions, reserved task windows, source fingerprints and reviewed monthly salary inputs |
| OUTLET_COST_ALLOCATIONS/default | Outlet | Item shares, exclusions and confirmations; stable item keys |
| METHOD_FLOW/default | Outlet | Verified method continuation decisions and Method1 markup/source fingerprint |
| OUTLET_REVIEW/default | Outlet | Reviewed current analysis signature and totals |
| FLOW_REVIEW/default | Company | Current outlet-review signatures and final company confirmation |
| STAFF_MASTER / HR_OUTLET_ALLOCATION | Company | Actual employees and authoritative outlet salary shares; remain separate from unfilled required positions |

Every protected save uses prior-baseline reread, verified backup for existing records, second stale check and full read-back through BOBS_VERIFIED. Cross-record writes are not atomic; a partial baseline save stays incomplete and must be reviewed before retry. No real Google business writes are performed by automated/live read-only testing.

## Cost rules

New monthly budgets use Owner31-day divisor. Rider transport default amount3000 requires explicit monthly/daily basis; it is per distinct rider, separate from salary. Unticked item delivery excludes rider salary/transport for that item. Shared rider IDs are counted once in the outlet pool. No amount is inferred from missing data.

Direct Actual COGS remains unchanged. Full item price adds allocated labour and selected overhead once using existing C.fullCost markup/margin and spoilage/UUWP rules. Percentage allocations across selected items cannot exceed100%; zero allocations require reasons. Unallocated pool balances remain included in outlet totals and are visible in analysis. Existing appointed staff not funding a planned position remain an explicit authoritative HR cost pool, preventing silent omission.

Staff recommendations are planning proposals from sourced timing/role/quantity and entered start times, not certified staffing minima. Compatible nonoverlapping tasks can share a position; specialist roles remain separate. Equipment conflicts/outside-shift duties block workforce acceptance. Non-recipe preparation/packing/cleaning must be entered and reviewed; no implicit zero-work assumption.

## Continuation

Inspect current code and CODEX_HANDOVER_111Q_CURRENT.md / both111QS_HANDOVER_CURRENT.md sections. No automatic phone-chat synchronization. Source recovery: recovery/pre-outlet-first-flow-20261010 at31538a297a1b201a1224de9566fbc533f7dff588. Code rollback is separate from Google data recovery. Implementation and tests are recorded in chronological checkpoints; live release and Owner UAT are separate statuses.


Final followup: baseline edits opened from an item return to that parent after verified save. Cost-only baseline changes require item allocation review without restarting coverage. Rider transport has its own inclusion checkbox; unticked transport leaves selected rider salary included. Read-only rider charges appear in the expense checklist. Standalone selected side slots preserve saved ordering.


Release verified: PR54 merge6acebff3dfde422d0fcba76fe212e789b4e23238; final CI and Pages SUCCESS,55 served assets match, live read-only checks PASS with zero operational writes. Owner real-value entry, calibration and UAT acceptance remain pending. See both current handover sections for exact continuation.
