# BOBS Data Architecture — Google-First Rule

**Version:** BOBS DATA v2.5  
**Date:** 2026-09-11

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
| Method 1 | `BOBS_MODULE_DATA` / `METHOD1` / outlet | Google-first |
| Method 2 | `BOBS_MODULE_DATA` / `METHOD2` / outlet | Legacy UI still being migrated; sync bridge writes to Google |
| Outlet Analysis | Reads `METHOD1` + `METHOD2` from Data Vault | Google-first |
| Staff Master | `BOBS_MODULE_DATA` / `STAFF_MASTER` / `COMPANY` | Google-first |
| HR Outlet Allocation | `BOBS_MODULE_DATA` / `HR_OUTLET_ALLOCATION` / `COMPANY` | Google-first |
| Fixed Expenses | `BOBS_MODULE_DATA` / `FIXED_EXPENSES` / outlet | Google-first |
| Asset Master | `BOBS_MODULE_DATA` / `ASSET_MASTER` / outlet | To be built before the page is considered complete |
| Break-even modules | Must read permanent outlet/module records; migration/verification required before completion | Pending audit |

## 4. New-page rule

No new BOBS page is considered complete unless its business data has:

1. A named Google module or dedicated Google sheet.
2. A stable `outletId` or `COMPANY` scope.
3. A defined `recordKey`.
4. Google-first loading.
5. Google save/update behavior.
6. No permanent browser storage dependency.

## 5. Compatibility bridge

`bobs-config.js` currently routes legacy "Sync to Google Sheet" POST payloads for Method 2 and other older module pages into `moduleSave`. This protects permanent storage while pages are migrated.

The compatibility bridge is **not** the final architecture. The final state is Google-first read + Google-first write with no browser persistence.

## 6. Change control

This architecture is part of the BOBS 111Q change-control system. Each migration is committed separately so the immediately previous known-good Git state remains recoverable.

Do not delete Google records as a code rollback mechanism. Git rollback restores application code; Google Data Vault protects business data.
