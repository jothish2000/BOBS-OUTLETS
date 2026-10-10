# Salary summary redesign — 10 October 2026

### Published salary-summary replacement — live browser check pending

PR66 merged as8505980ac9ce78f9b182feaa57a2d04a2684147a; Pages38070574003 succeeded. Final headc428c18 hosted checks passed (62+27+24 tests, connected Chrome and salary/capital journeys, quantity and syntax); the merge commit checks also passed. All16 changed web files match the live served source. The local live Edge launch timed out before opening a page, so it does not establish live interaction success. A bounded hosted Chrome read-only check is being added: GET/HEAD only, temporary unsaved THP1500 position, no Save click and no real Google writes.

The old THP form and parent breakdown are replaced with summary/component links/CTC. Google saves and historical records remain protected. Code recovery is recovery/pre-salary-summary-20261010 at82f79a8; Google data recovery is separate. Owner acceptance remains pending.


## Approved scope and review
Owner approved replacing the previous THP form with a summary-first popup: enter THP in the outlet position, open Review/edit salary package, see earnings/deductions/employer expenses/CTC, edit linked components, recalculate, then verified Google save and return. Laptop confirmed. The four views are one assistant's separated passes, not delegated agents.

| View | Business and software conclusion |
|---|---|
| PRO | A visible reconciled package makes total staffing cost understandable; reuse the existing salary engine and Google writer. |
| CON | Unknown coverage must not look accepted; previews carry explicit assumptions, final save requires reviewed eligibility. No universal DA/HRA government percentage is invented. |
| COMPARE & CONNECTIONS | Google THP_NORMS → individual package → OUTLET_SALARY_PACKAGES/history → outlet budget or linked STAFF_MASTER → labour allocation/Ideal Price Builder. Preserve historical snapshots and downstream totals. |
| OBSERVER | Loading failures need visible recovery; component edits need immediate feedback and a summary before the final review. |

Mode: Codex implementation/testing/release; no mode transfer. Recovery base 82f79a8867f36f2f6a7f54d1c55bd8a371716eca, branch recovery/pre-salary-summary-20261010; implementation branch codex/salary-summary-20261010. Remote main fetched and no source changes intervened since the previous release. Seven owner untracked files preserved. Current handover entries and relevant salary history inspected; the entire 341,850-byte historical ledger was not reread line by line. Both original masters and ledger retained.

## Data and protection
Keep schema2 salary records compatible. DA is an optional package field; old packages without it retain their exact calculated shape. A first-open preview may use clearly labelled coverage assumptions; it never saves or marks a plan accepted. The official reference stays distinct from a company-selected amount/rate. DA defaults to excluded/no verified applicable government rate, not a fictitious statutory percentage. No government payroll-rate change or Google migration is in scope.

Existing verified writer protects previous full packages in OUTLET_SALARY_PACKAGES_BACKUPS and reads back saves. Code recovery does not restore/delete Google records. No new whole-vault copy or real employee test writes. Popup draft handoff uses same-origin messages/BroadcastChannel, not permanent local storage or salary values in URLs.

## Checkpoint
OWNER APPROVED; IMPLEMENTATION IN PROGRESS. Tests/deployment/live verification NOT RUN for the redesign. The earlier diagnostic native Edge launch timed out before opening the page; the Owner's exact inactive-control failure was not reproduced. Code inspection found the disabled load gate, a short opener-only handoff, and offscreen error feedback. Next: replace the form, add resilient handoff and component editors, test preview/reconciliation/legacy packages/save-reopen/failures, then publish and verify live.


### Tested checkpoint — salary summary

New summary/core/DOM tests8/8 and existing salary/capital/history19/19 passed; connected outlet/roadmap/read/return tests70/70 passed. First native journey completed edit/save/reopen/history but its conditional test init failed to remove window.opener; changed fixture to force an opener-less browser property. Next fixture salary crossed the ESI ceiling and correctly blocked save; test now explicitly checks that warning/no write and confirms continuing coverage. Final browser run pending. Earlier guessed quantity-script/workflow paths were absent (NOT RUN), then located actual tests/quantity-number-format.cjs. Native mobile screenshots inspected; excluded extras grouped after this review. No real Google writes.

Current source removes the old long form, provides linked component dialogs and summary totals, allows optional DA without changing old saved calculation shapes, and sends same-origin draft requests/replies plus save acknowledgement. Failed/missing sources have a visible Retry. Owner exact in-app failure was not independently reproduced; missing-opener and failed-read cases are tested directly. Government references remain the current Google snapshot; no new applicable DA notification verified or fabricated. Implementation remains unpublished. Next: final native/quantity result, hosted CI/Pages, live read-only check and both handovers.

### Release candidate — salary summary

Final isolated native Edge journey PASS: summary/component edit/save/reopen/history; missing-opener handoff and acknowledged return; parent working-day draft retained; ESI ceiling warning before explicit continuation; stale-rule save rejection; capital/assets/working-capital regressions; mobile layouts; zero runtime errors. Actual quantity-number-format test PASS (aliases/precision/non-mutation/page availability/affected syntax). Local focused27 plus connected70 tests passed. A final load-failure guard was added afterward; the hosted run will verify the complete committed source before merge.

Post-test four views (one assistant): PRO—summary and net/CTC reconciliation observed; CON—DA source remains unverified for the specific role/outlet and Owner financial UAT remains pending; COMPARE—existing package shapes, protected Google saves and downstream cost separation retained; OBSERVER—provisional eligibility and excluded components are clearly labelled, error/retry and parent draft continuity exercised. Owner authorized the bounded live release. Deployment/live verification remain PENDING. Next: publish PR, require hosted checks, merge, verify Pages/served source/real read-only popup, and update both handovers.

Release review adjustment: parent acknowledgement budget raised to80 seconds to cover the existing two-attempt Google reads, including linked-employee reload; Return is disabled while a protected save is in flight. This prevents a short timeout navigating an opener-less popup away before the original outlet draft applies the verified package. Hosted checks must cover this final source.

### Hosted test repair — salary summary

PR66 head1867f01: hosted non-browser groups61/61,27/27,24/24 and standalone checks passed; Chrome regression failed because it still clicked the intentionally removed .fundingPreview summary control. Syntax step was skipped, not passed. Updated that assertion to require the replacement salary-summary entry point/CTC and absence of the old breakdown. The separate new browser journey tests actual component edit/save/reopen. Runtime21b9af6 also extends parent acknowledgement to80 seconds for real Google retries and disables Return during an in-flight protected save. Final hosted retest, merge, deployment and live verification pending. Recovery82f79a8 remains remote; no business-data writes.

### Hosted checkbox stability repair

At0dcb2a0 the complete connected Chrome outlet/roadmap journey passed, but the salary journey failed when an eligibility checkbox click did not retain its state. Local Edge had passed. Removed the unnecessary full summary rebuild on eligibility change, preserving the checkbox position and expanded component rows; the eligibility state and preview validation still update. Added a regression asserting checked state and retained summary nodes. Do not relabel the failed hosted run as a pass. Final hosted retest still required.

### Salary editor state ownership repair

The hosted Chrome checkbox failure persisted after removing the summary redraw. Source inspection found that the generic transition guard restores prior checkbox values after component Apply intentionally clears eligibility/review. The salary window now uses the existing BOBS_OWNED_EDITOR mechanism (also used by the recipe editor), so its controller owns draft/review state. Verified Google saves, stale checks, history backups and beforeunload protection remain in the salary controller. Added native assertions that the owned editor loads without the generic restoration guard. Final hosted retest required; no real business writes.

Local post-repair summary tests9/9 PASS. Native Edge retest could not start (browser launch timeout); not counted as a pass. The laptop command runner also reported a pipe-in connection timeout. Hosted Chrome is the release gate for the final repair.
