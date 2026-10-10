# Google-backed THP integration — 10 October 2026

## Scope and design

Owner-approved Change 2: planned mandatory, production and rider positions accept monthly take-home pay only. The existing role/count/shift picker remains. The active backend is the existing BOBS Data Vault; historical BOBS Sales Log remains a labelled reference. No competing operational database or employee import was created.

Dependency: owner HR workbook → Google HR_NORMS → COMPANY/THP_NORMS/default → planned salary and employer cost → outlet daily pools (31 days) → saved item allocations → Ideal Price Builder → outlet/company review.

Reviews were one assistant's separate PRO, CON, COMPARE & CONNECTIONS and OBSERVER passes. No independent agent review is claimed.

## Google source and ownership

- Active Vault: https://docs.google.com/spreadsheets/d/19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8/edit
- BOBS_BACKEND: gid111051020 — index with active records, historical sources and recovery links.
- HR_NORMS: gid111051021 — 30 company planning parameters, exact source cells and source hashes; edit column B.
- HR_THP_CALCULATOR: gid111051022 — formula-based example; B3 is example THP, not an employee save.
- BOBS_MODULE_DATA row187: COMPANY / THP_NORMS / default. Column G is formula-backed JSON using HR_NORMS!F6:F35.
- BOBS SALES LOG: https://docs.google.com/spreadsheets/d/1BWCKCL9nJUpgDpJNyBhsB9BtDJb19g_I9mBvtXSQMCw/edit
- Pre-change recovery copy: https://docs.google.com/spreadsheets/d/1O1TJ5U0SLCi1rU4uAA_0aiq-v0Tk2BYPIQRr37bVskQ/edit

The Vault already contains outlet, recipe, staff, item, expense and snapshot records. The backend index makes their storage and historical status visible; it does not claim every legacy workbook/tab has been migrated or every current outlet plan is complete. Actual company Staff Master/default was not populated from a legacy outlet staff-list or workbook examples.

## HR reference fidelity

Source: BOBS_HR_Engine_v0_5_21_EXCEL2010_REBUILT.xls, S01_ASSUMPTIONS and S13_REVERSE_THP, cross-checked with v0_5_20 XLSX and v0_5_21 guide. Original files were read-only.

- XLS SHA256: 28744736828c2cf6090eba4e1c90118172536f98508102939dd8422a5ba829ee
- XLSX SHA256: 160468299a33cd9841348c9aad6cbe80b57b9e8bdb5e20ce20f227a5057e6f5c
- Guide SHA256: a80cd3c7ed18c4dd2a483b3d6ecb82bf906b20502d0cb55cd9bd6c932b2dc635
- Engine: HR_0_5_21_THP_FIX1; schema: BOBS_THP_NORMS_V1.
- Parameters: basicPct, hraPct, employeePfRate, employerPfRate, professionalTax, leavePct, tolerance, medicalAnnual, termAnnual, mealPerDay, mealDays, bonusEligible, bonusRate, bonusGrossMonths, pfMode, pfCeiling, epsRate, edliRate, adminRate, higherWage, benefit1, deduction1, benefit2, deduction2, benefit3, deduction3, benefit4, deduction4, benefit5, deduction5.

Correction: original reverse gross omitted optional employee deductions although the subsequent net calculation subtracted them. Reverse gross now includes those deductions so net equals target THP. Original files were not edited.
The source's S01 B15 legacy Other Employer Benefits field is not part of its active S13 true-CTC formula; the five active benefits are used. Cover sums are not premiums. PF modes use the configured rate cells; no current statutory/legal certification is implied by importing the owner's assumptions.
Daily expense uses31 days. Meal benefit uses its separate26 working-day assumption. ₹15,000 target → ₹16,170.2127659574 gross → ₹22,290.6382978723 monthly employer cost → ₹719.052848318463/day; net variance0.

## Saved-data behavior

- Planned positions save salaryBasis, exact norms snapshot/fingerprint and component breakdown with the outlet record.
- Linked actual employees retain their saved employer package and HR outlet share.
- Missing/invalid norms block calculation instead of inventing zero amounts.
- Save re-reads the norms. Changed source assumptions require review; downstream costs and progress ticks cannot treat stale affected salaries as complete.
- Existing protected save/read-back and backup behavior is retained. This is not a claim of atomic transactions across modules.
- Reopening salary planning previews current company assumptions; an explicit reviewed save is required.
- Google norms are authoritative; no browser-cache fallback for salary assumptions was added.

The module's created/updated timestamps record registration. Direct Sheet edits change the formula JSON and its fingerprint; consumers use that fingerprint rather than timestamps for salary freshness.

## Tester and release evidence

- 32 focused local tests PASS.
- CI node groups32+27+24 =83 tests PASS, plus standalone source/preservation/handoff checks and full isolated Chrome journey.
- Local Edge journey PASS: THP-only inputs, stale-norm save rejection with zero writes, saved source fingerprint, salary return to original item, retained price, allocations/ideal price and ten-stage roadmap.
- Four PR58 checks PASS. Both applicable PR59 checks PASS. Code PR58: https://github.com/jothish2000/BOBS-OUTLETS/pull/58
- Code commit84c0c05a1b1aa32369ca5c3d5f3e98bf2e56c1e7; merge968f282e67cf3d9db00c0c74f0fb50592ec3a125.
- Pages runs38038419306 and38039071816 build/deploy PASS. All44 changed served runtime files match the final repaired release db9c5e02465bb6f9bda341bbef231583079ebb54.
- Native Google read-back and deployed moduleGet API PASS; all30 parameters match source. Three new tabs have zero effective-value formula errors; title/header/wrapping/number formats inspected through API. Authenticated Sheets screenshot QA was unavailable, so no pixel-perfect claim.
- Initial JSON helper output had trailing decimal points for integers. It failed JSON parsing, was corrected and reverified before registering the machine record.
- The first live run FAILED to open the breakdown on the first click after typing. Input blur rebuilt the clicked element. PR59 caches unchanged previews and retains expansion on real edits; its native regression passes. Fix commit86248ee3f308d91ed81d08a96dca8a567c0471c2; merged db9c5e02465bb6f9bda341bbef231583079ebb54. https://github.com/jothish2000/BOBS-OUTLETS/pull/59
- Live Edge recheck PASS: first click opens the breakdown; Google-backed THP15000 shows monthlyCTC22290.64/daily719.05; no editable deduction/addition fields;390px layout fits; Google records page reads the norms successfully. Desktop/mobile screenshots visually inspected. Zero runtime errors and zero business writes; three automatic snapshot POST attempts were blocked. No owner save was performed.
- Actual employee hiring, payroll payment and owner business saves were NOT performed as tests. Owner acceptance remains pending.

## Second four-view review

| View | Business/logic result | Software/data result |
| --- | --- | --- |
| PRO | One THP input now produces the full planned employer expense. | Google/JS source example agrees; verified save retains provenance. |
| CON | Company assumptions may differ from an existing employee contract. | Linked actual staff packages stay authoritative; no sample employee import. |
| COMPARE & CONNECTIONS | Costs flow through mandatory/production/rider budgets and item shares. | Norm changes require review across salary, allocations, ideal prices and roadmap. |
| OBSERVER | Owner can inspect the breakdown and source Sheet before saving. | Failed/fixed checks, CI, deployment and live evidence are distinct; Owner acceptance is not assumed. |

## Recovery and continuation

Code recovery branch recovery/pre-google-thp-20261010 points to8679fe611a3bbe56ac31694b4b451bdbace581cd and is pushed. A code rollback would use a reviewed revert PR; it does not restore Google data.
The Google recovery copy was created and key records read back; restoration was NOT RUN. Do not replace the active Vault with the old copy, because subsequent live records may exist. Review any data repair separately and preserve newer records.

Continue from main and read this report plus both sections in111QS_HANDOVER_CURRENT.md. For a separate phone ChatGPT Work chat, provide the master and current handover; local Codex preferences do not synchronize automatically.

### Laptop checkout continuation note — 10 October 2026

The laptop's local main branch has separate older history. A fast-forward-only attempt refused the divergence; no merge, rebase or reset was performed on that history. The checkout was restored to codex/thp-final-record-20261010 and fast-forwarded to the verified remote release. Continue on that release branch or create a new branch from fetched origin/main. Do not treat the older local main as the live source. The seven pre-existing owner untracked reference files remain preserved. This workspace note changes no runtime or Google business records.
