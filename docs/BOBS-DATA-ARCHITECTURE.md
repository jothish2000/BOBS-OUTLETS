# BOBS Data Architecture — Google-First Rule

**Version:** BOBS DATA v2.7  
**Date:** 2026-09-12

## 1. Permanent rule

Every BOBS business-data page must have a permanent Google Sheets / Data Vault record. Browser `localStorage`, `sessionStorage`, IndexedDB, or browser cache must never be treated as permanent business storage.

The permanent hierarchy is:

`GitHub application code → Google Sheets / Data Vault → page working view`

A page may hold values in JavaScript memory while the page is open, but the permanent record belongs in Google.

## 2. Data Vault mechanism

The generic `BOBS_MODULE_DATA` store is the permanent Google equivalent for module records that do not require a dedicated master sheet.

Records are addressed by:

- `outletId`
- `module`
- `recordKey`

Core outlet master data remains in `OUTLET_MASTER`.

## 3. Current module mapping

| Page / module | Permanent Google record | Status |
|---|---|---|
| Outlet Setup | `OUTLET_MASTER` | Google-first |
| Method 1 | `BOBS_MODULE_DATA` / `METHOD1` / outlet | Google-first; edits auto-save to Google |
| Method 2 | `BOBS_MODULE_DATA` / `METHOD2` / outlet | Google-first recovery + automatic Google persistence bridge |
| Method 2 condiment selections | Inside the outlet's `METHOD2` record under `condiments[category::itemIndex]` | Google-persisted through the existing Method 2 save bridge |
| Recipe Master | `BOBS_MODULE_DATA` / `RECIPE_MASTER` / `COMPANY` / `STANDARD_V1` | Unified Google-first master |
| Itemwise COGS | Reads Recipe Master + actual Method 2 condiment selections | Google-first calculation |
| Production COGS | Reads outlet Method 2 + Recipe Master; includes selected condiment COGS | Google-first calculation |
| COGS Outlet Analysis | Reads `METHOD1` + `METHOD2` from Data Vault; selected outlets only | Google-first |
| Staff Master | `BOBS_MODULE_DATA` / `STAFF_MASTER` / `COMPANY` | Google-first |
| HR Outlet Allocation | `BOBS_MODULE_DATA` / `HR_OUTLET_ALLOCATION` / `COMPANY` | Google-first |
| Fixed Expenses | `BOBS_MODULE_DATA` / `FIXED_EXPENSES` / outlet | Google-first |
| Asset Master | `BOBS_MODULE_DATA` / `ASSET_MASTER` / outlet | To be built before the page is considered complete |
| Break-even modules | Must read permanent outlet/module records; migration/verification required before completion | Pending audit |

## 4. Outlet tagging rule

Method records are never one shared browser-level record. Each method is stored separately by outlet:

- Outlet 1 + `METHOD1` + `default`
- Outlet 1 + `METHOD2` + `default`
- Outlet 2 + `METHOD1` + `default`
- Outlet 2 + `METHOD2` + `default`

This prevents Method 1/Method 2 data for one outlet from overwriting another outlet's analysis.

## 5. Method 2 condiment rule

The existing Method 2 366-item production/calculation engine is not replaced. An additive layer reads the unified Recipe Master and, for production-tagged eligible items, allows the user to record what was actually supplied:

- Select/remove condiment recipes.
- Use Recipe Master standard serving quantity when a default association exists.
- Enter/edit a serving quantity when no default association exists.
- Record the unit and serving basis (for example, `per 5 idlies`).
- Record the day's controlled vegetable choice for sambar recipes where the Recipe Master exposes vegetable options.
- Store the selections under the existing Method 2 record rather than creating a second browser-level data store.

The itemwise COGS page uses the actual Method 2 selection when present. For older Method 2 records that do not yet contain a condiment selection, it falls back to the Recipe Master's stored default association. An explicitly empty selection means no condiment is supplied.

Production COGS aggregates the primary Recipe Master cost plus selected condiment recipe costs. Missing recipes remain `INPUT REQUIRED` and are never silently treated as zero.

## 6. COGS review rule

After the completed outlet-level method stage, BOBS opens the COGS Outlet Analysis stage.

- If only one permanent outlet exists, show that outlet only.
- If multiple permanent outlets exist, start with the current outlet and ask which other existing outlets should be reviewed/compared.
- Comparison is therefore user-selected, not an automatic dump of every outlet.
- Missing COGS inputs are shown as `INPUT REQUIRED`, not as a misleading zero.

## 7. New-page rule

No new BOBS page is considered complete unless its business data has:

1. A named Google module or dedicated Google sheet.
2. A stable `outletId` or `COMPANY` scope.
3. A defined `recordKey`.
4. Google-first loading.
5. Google save/update behavior.
6. No permanent browser storage dependency.

## 8. Compatibility bridge

Some legacy page calculations still use browser working state while the page is open, but the authoritative recovery and permanent save path is Google/Data Vault. This is a migration bridge, not permission to treat browser storage as permanent business storage.

The target final architecture remains Google-first read + Google-first write with no browser persistence dependency.

## 9. Change control

This architecture is part of the BOBS 111Q change-control system. Each migration is committed separately so the immediately previous known-good Git state remains recoverable.

Do not delete Google records as a code rollback mechanism. Git rollback restores application code; Google Data Vault protects business data.
