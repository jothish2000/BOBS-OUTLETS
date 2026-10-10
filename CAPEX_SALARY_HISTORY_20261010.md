# Capital expenditure and salary history — 10 October 2026

111QS =111QS5PVDRT, master v5.0. Four views below are one assistant's separated business/software passes. Owner requested a dedicated capital-expense module and Google capture of salary additions, deductions, benefits and removals; laptop Codex confirmed. This is the approved bounded scope, including normal tested live publication under the standing release rule.

| View | Business | Software / data |
|---|---|---|
| PRO | Equipment purchase list and total money needed; inspect saved salary changes. | Reuse saved ASSET_MASTER and the existing verified Google salary records/backups. |
| CON | Owned/shared machines must not be bought twice; missing prices are unknown. | Validate unique asset IDs, quantities, source freshness, failed reads/writes and backup continuity. |
| COMPARE & CONNECTIONS | Separate purchase quotes from the value used for product depreciation. | ASSET_MASTER → CAPITAL_EXPENDITURE → roadmap; salary package → verified backup chain → history viewer. No new salary formula owner. |
| OBSERVER | Show saved/provisional/incomplete status and the next action plainly. | Read-only history; no operational writes on load. Desktop/mobile and save/reopen evidence required. |

## Scope and dependency map

- Existing Google Data Vault remains the database. No migration, deletion or sample employee/asset writes.
- Capital expenditure lists every saved asset once: required, already owned, to buy, reviewed purchase price per unit, equipment subtotal and selected extra purchase costs (tax not already in the quote, delivery, installation and other explained costs). Owned-only rows have zero purchase cost. No default tax percentage or invented supplier quote.
- Save CAPITAL_EXPENDITURE/default per outlet with reviewed inputs, asset source snapshot/stamp and calculated result. A changed asset/menu requires review again. Optional extra costs default excluded; selected amounts must be explicit.
- Purchase cost does not alter ASSET_MASTER depreciation basis, Ideal Price Builder, operating expenses or WORKING_CAPITAL. The asset master remains the only machine/quantity owner.
- Salary editor already saves the full package, calculated breakdown and company norm snapshot in OUTLET_SALARY_PACKAGES. Linked employees additionally update STAFF_MASTER on explicit save; planned positions still require parent outlet-plan review/save.
- Existing BOBS_VERIFIED.save writes and verifies the old version under OUTLET_SALARY_PACKAGES_BACKUPS/before-<new saveToken> before replacing the current record. Follow this chain for a readable history, including excluded/removed components. New saves add a hasPrevious marker so a missing expected backup is reported as incomplete history. Do not duplicate salary history into a competing source.

## Section 1 — Work mode handover

Implementation started; NOT YET DEPLOYED or TESTED for this extension. Live prior release remains PR62 runtime314f844, latest repository main de9ee4f. Planned URL: https://jothish2000.github.io/BOBS-OUTLETS/capital-expenditure.html?outlet=1 . Salary history will open from each salary editor. Current Google backend: https://docs.google.com/spreadsheets/d/19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8/edit#gid=111051020 . No new real business records are to be created by verification. Owner UAT pending.

## Section 2 — Codex handover

Repository D:/BOBS-OUTLETS; branch codex/capex-salary-history-20261010 starts at fetched origin/main de9ee4f66625972c80184ebe06dc82b260ea975e. Intervening PR63 is docs-only, no runtime diff. Local recovery/pre-capex-salary-history-20261010 points to that base. Old divergent local main and seven owner untracked files preserved. Prior whole-vault backup17XQD1h_m11pBIqdtt5p_WirQlIVK8z0lxkYkSeTzIz0 exists; no restore or destructive data change planned. Code rollback and Google recovery are separate.

Inspected current master, project annex, latest dual handovers and relevant historical ledger entries; the 331KB chronological ledger remains preserved (not every historical line was re-read). No substantive design conflict found. Current user-supplied device-confirmation rule takes precedence over older laptop-default clauses.

Next executable work: add capex calculation/page, integrate links and roadmap; expose existing salary backup history and company-component removal; run focused and connected browser tests before publication. Update this record and both current handovers at each checkpoint. Google index rows28 onward were empty in bounded read; re-read before adding documentation links. Native API range/format verification is available; authenticated Sheets screenshot verification has not been performed.

## Test / release evidence

New code checks, automated tests, browser tests, deployment and live verification: NOT RUN at this checkpoint. Owner acceptance: PENDING.

### Implementation checkpoint and protection exception

Added capital budget core/page, source freshness and persisted-total validation; linked asset/working-capital/item/roadmap screens. Added salary company-component removal and history from the existing verified backup chain, with missing-backup errors. New salary saves carry hasPrevious. First unit run found an incomplete test fixture (mock M2 omitted recipe()); corrected it to use the actual Method2 core. Retest pending. No pass claimed for that run.

Automatic approval review rejected a proposed full-vault copy to folder1CWQJnrD3QWyupWgAT2-SeYT0en3KWiL- because destination access was not established and full-payload copying there was not explicitly authorized. No copy was created and no alternate copy attempted. Unaffected implementation continues; existing protected per-record saves/backups remain. Only additive backend index rows are planned; no destructive Google action needs a new whole-workbook backup. Recovery branch was successfully pushed.

Next: focused unit tests and isolated native browser save/history/capex/stale-source checks. Live and Owner acceptance still pending.

### Tested release candidate — 10 October 2026

IMPLEMENTED / CODE CHECKED / AUTOMATED TESTED / ISOLATED BROWSER TESTED. DEPLOYMENT and LIVE VERIFICATION pending. New core/history tests8/8 passed after replacing the incomplete fixture; connected groups57/57 passed; updated roadmap group6/6 passed including current/stale/read-error capex completion. Existing salary/asset tests11/11 and item builder4/4 passed in the first combined run; quantity formatter/syntax suite passed. The first run had5 failed fixture tests (M2.recipe absent), explicitly repaired/retested, not counted as passes.

Native Edge isolated Google journey passed: add/remove salary components, old package preserved in verified backup, two readable historical versions, parent drafts retained, salary norms stale guard; capital quote₹70,000 +delivery₹1,000 saved/reopened at₹71,000; changed owned quantity rejects save without writes; ASSET_MASTER unchanged by capital save, working-capital inputs exclude machine cost. Four390px layouts fit and screenshots inspected. No real operational Google writes. History date presentation changed to readable IST after inspection; final syntax/browser checks included in release verification.

Second four-view review (one assistant): PRO—observed totals/history/save-reopen match intended flow; CON—real owner records are deliberately not test-written and Owner UAT remains pending; COMPARE—purchase quote changes leave asset depreciation and operating funding unchanged; OBSERVER—stale/missing records show incomplete states, partial employee application reports the already-saved proposal, and Google backup rejection is recorded. Current scope already authorizes tested publication.

Recovery source de9ee4f and remote recovery/pre-capex-salary-history-20261010 are available. Proposed whole-vault copy rejected; no copy, no destructive data changes. Existing record-level backups/readback/stale protection used unchanged. Next: publish branch/PR, wait for checks, merge, verify Pages and live served sources/read-only Google load, then finalize both handovers and additive backend index links.
