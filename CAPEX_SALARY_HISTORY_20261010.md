# Capital expenditure and salary history — 10 October 2026

### LIVE — capital expenditure and saved salary changes, 10 October 2026

Owner's extension is implemented, tested, deployed and live-read verified. Runtime e74a6b28722f61d3d013b9ab39a6881c8eff1562 (PR64), source dd30e41ed5df9d9eb2ccfadec52ae6dee1ebb2a7; Pages38057376901 succeeded. All50 changed web files match the live deployment. Final native Edge read-only check succeeded outside the restricted Windows sandbox:0 JavaScript errors,0 business writes,2 automatic non-GET attempts blocked. Mobile390px pages fit; live screenshots inspected. The earlier sandbox Edge launch timed out and logged a Windows encryption error; that failure is retained, not relabelled as a pass. One shell probe also failed with runner spawn_ready; later probes succeeded.

Open https://jothish2000.github.io/BOBS-OUTLETS/capital-expenditure.html?outlet=1 . Review/save the asset master first, then enter supplier purchase prices and select any additional purchase costs, review and Save. Current outlet1 correctly reports that assets/product shares need review, so no capital total is invented. The asset page loaded real Google records. The salary-history page for baseline-Mandatory1 correctly reports no saved package yet. From an actual position choose Review/edit salary package → View saved salary changes. Every successful salary save keeps full additions/deductions/benefit choices in Google; previous versions, including removed components, are retained in verified backups. A salary proposal and its application to outlet/employee costs remain distinct.

Google database remains19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8. New plan: CAPITAL_EXPENDITURE/default per outlet. Asset identity/needed/owned quantities remain in ASSET_MASTER; purchase quotes do not overwrite its depreciation basis. Capital purchases do not enter WORKING_CAPITAL, daily expenses or Ideal Price Builder. Salary history reads OUTLET_SALARY_PACKAGES and its existing BACKUPS chain; no competing salary database or live-data migration. Backend index rows28–30 link these modules and this continuation.

Validation: local new core/history8/8, connected57/57, updated roadmap6/6; hosted CI53/53 +27/27 +24/24, standalone checks, both Chrome save/return/mobile journeys and all4 PR checks passed. Local extended Edge salary/history/capex journey passed. Broader local Edge regression timed out twice at the first item-page load; the identical source/script passed fully in hosted Chrome. No real employee, outlet salary, asset or capital-budget save was used as a test. Owner UAT and actual input/save acceptance remain PENDING.

Post-test four views, one assistant: PRO—observed purchase totals, saved component differences, Google-backed reopening and live loading; CON—real owner financial entry/save remains to be accepted and local Edge timeouts are recorded; COMPARE—asset values and daily funding stay independent from purchase quotes, and existing return/roadmap flows passed CI; OBSERVER—missing/stale records show a next action rather than a false zero or tick. Scope and tested publication were Owner-authorized; this does not claim Owner acceptance.

Continuation: repo D:/BOBS-OUTLETS, branch codex/capex-salary-history-20261010; implementation dd30e41, runtime/main merge e74a6b. This following documentation commit changes only handovers/report. Fetch current origin/main before further work. Preserve old divergent local main and seven owner untracked files. Code recovery: remote recovery/pre-capex-salary-history-20261010 at de9ee4f. Existing Google per-record backups are separate; reverting code must not restore/delete Google records. Proposed additional whole-vault copy was rejected by automatic approval review because destination access was not established; it was not made or retried elsewhere. No restore performed.

Exact next Owner action: save reviewed outlet assets, open the capital page and verify the intended quote/budget; save a real salary package when ready, then inspect View saved salary changes. For a correction, capture the page/outlet and expected/actual result. Continue in the current Codex conversation; no mode transfer or synchronization is claimed. Final evidence: work/capex-history-live-verification.json, capex-live-mobile.png, salary-history-live-mobile.png and isolated capex/history screenshots. Google Sheet QA uses exact native readback and format fields; authenticated Sheets-render screenshot QA was not performed.

Earlier checkpoint statements below are historical and superseded by this LIVE entry.

### Deployed checkpoint — capital expenditure and salary history

PR64 merged runtime e74a6b28722f61d3d013b9ab39a6881c8eff1562, implementation dd30e41ed5df9d9eb2ccfadec52ae6dee1ebb2a7. Pages38057376901 build/report/deploy succeeded. All8 merge workflows succeeded. All50 changed live root web files match the tested source. Native live Google page reads are still running at this checkpoint; do not claim their result yet.

All4 PR checks passed: Vault38056779598, quantity38056779537, preservation38056779516, workload38056779605. Vault job114226781959 logs verify53/53 +27/27 +24/24, standalone checks, both hosted Chrome journeys and syntax checks. The same-source extended Edge capital/salary journey passed locally. The broader local verify-vault-browser run timed out twice at initial item-page load; this is recorded as TIMEOUT, not PASS. The identical full browser script passed in hosted Chrome (nested returns, outlet workforce/salary/ideal flow and roadmap). No product error was established from the local timeout; no code was changed to conceal it.

Google BOBS_BACKEND rows28–30 were added and exactly read back with capital, existing salary-backup and continuation links. Status is currently publication in progress. No operational salary/asset/capital rows were written by verification. Whole-vault copy rejection remains recorded; no copy or workaround attempted.

Next executable action: collect live verification session74892 and work/capex-history-live-verification.json, inspect live mobile screenshots; then update the three documentation statuses and both handovers and publish the documentation-only result. Owner acceptance remains pending. Code recovery: remote recovery/pre-capex-salary-history-20261010 at de9ee4f. No data restore authorized or performed.

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
