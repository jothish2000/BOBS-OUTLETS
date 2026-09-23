# OVERALL DESIGN MASTER 111Q
## Universal Software / System Building Blueprint
### Canonical definition: **111Q = 111Q5PVDDRT**

**Owner / final decision-maker:** Jothish Babu Sadasivam  
**Version:** 3.0 — 23 September 2026  
**Purpose:** Portable blueprint for designing, changing, testing, recovering and handing over software, spreadsheets, automation, operational systems and AI-assisted projects across capable platforms.

## 1. Activation instruction
> Apply OVERALL DESIGN MASTER 111Q. Treat every reference to “111Q” as “111Q5PVDDRT”. Inspect the existing system before changing it. Use the five-person view: PRO, CON, COMPARE & CONNECTIONS, OBSERVER, and OWNER. The first four views have DUAL ROLE: each examines both business/logic and code/software architecture. The OWNER is the fifth and final decision-maker. Before implementation, create/maintain a developer-ready continuation handover so another AI/developer can inspect the current state instead of restarting or overwriting it. After approval, protect the current state, implement only the approved scope, then perform the mandatory TESTER stage. Feed actual test findings back through the five-person dual-role review before declaring completion. Distinguish implemented, code-checked, tested, deployed/live-verified and Owner-accepted. Preserve rollback. Finish every material change by updating the current handover so another AI can continue without rebuilding understanding from zero.

This master defines HOW to work. A project annex/handover defines WHAT the current project contains.

## 2. 111Q = 111Q5PVDDRT
- **5PV:** PRO → CON → COMPARE & CONNECTIONS → OBSERVER → YOU/OWNER.
- **First D — Developer/Codex handover:** preserve the current state, decisions, files, data ownership, recovery point, test evidence and exact next action so the next AI/developer continues from reality instead of starting over.
- **DR:** each of the first four views performs both Logic/Business analysis and Code/Software analysis.
- **T:** mandatory Tester stage after implementation, followed by a second evidence-based 5PV-DR.

## 3. Five-person dual-role board
| Seat | Logic / Business | Code / Software | Output |
|---|---|---|---|
| PRO | Purpose, benefits, accuracy, efficiency, user value | Safe reuse, maintainability, scalability, architectural benefit | Benefits, prerequisites, success criteria |
| CON | Wrong assumptions, confusion, misuse, edge cases, hidden cost | Regressions, broken links, corruption, double counting, stale data, security, migration/rollback risk | Failure cases, severity, safeguards |
| COMPARE & CONNECTIONS | Present vs proposed behaviour and alternatives | Trace inputs, formulas, storage, readers/writers, screens, reports, APIs, caches and downstream totals | Before/after map, compatibility/integration plan |
| OBSERVER | Terminology, ambiguity, usability, missing evidence, truthfulness | UI sequence, hidden dependencies, missing-data behaviour, auditability, performance, test/release readiness | Independent anomalies and readiness |
| YOU / OWNER | Decide priorities/trade-offs | Authorize scope, implementation, release or rollback | Approve / condition / revise / defer / reject |

## 4. Complete 111Q loop
**Proposal / observation → inspect current evidence → 5PV-DR → Owner decision → First-D handover/checkpoint → protect/backup → implement bounded scope → T tester stage → 5PV-DR AGAIN using actual test evidence → fix/retest if needed → Owner acceptance/release → update handover.**

Testing is not an appendix. Test evidence must feed back into PRO, CON, COMPARE, OBSERVER and OWNER before completion.

## 5. Connection discipline
Treat software as a dependency network, not isolated screens:
**Input/Master → Validation → Calculation Engine → Authoritative Storage → Screens/Reports/APIs → Downstream totals → Backup/Recovery/Audit.**

For each change trace authoritative owner, units, formulas, schema, writers/readers, caches, integrations, downstream effects, refresh behaviour, audit, migration and rollback. Avoid duplicate sources of truth, duplicate formula owners and UI-only patches.

## 6. Data truth
Distinguish INPUT, SOURCE and CALCULATED values. Missing/unknown/stale/not-applicable are not zero. Separate factual records from assumptions and provisions. Define units/currency/rounding/time boundaries. Protect writes and verify durable persistence/read-back where appropriate.

## 7. Protection and recovery
Preserve existing work and unrelated data. Establish a known-good code checkpoint before meaningful edits and verified data protection before destructive durable-data changes. If required backup verification fails, stop the destructive action. Keep code rollback and data rollback separate. Prefer surgical changes.

A newer AI/developer must **inspect current HEAD, current handover, current durable data path and intervening commits before editing**. Never restart from an older snapshot or replace working architecture merely because a rewrite is easier. Current code/data wins over stale memory; unresolved conflicts are surfaced for Owner decision before destructive change.

## 8. T — mandatory tester role
After implementation actively test the changed flow and reasonably connected areas.

### Load/runtime
Page/module loads; no stuck loading; scripts/resources work; runtime/syntax failures checked; refresh works.

### Navigation/links
Affected links, Back/Return/Next flows, routes and query parameters remain intact.

### UI/controls
Intended controls/labels visible or hidden correctly; no unintended duplicates/disappearances; responsive behaviour where relevant.

### Logic/calculation
Normal case, boundaries, zero vs missing, invalid input, propagation, units/rounding, no double counting.

### Persistence
Save, read-back, reopen/refresh, shared-value propagation, stale/concurrent write behaviour where relevant.

### Connected regression
Nearby modules, reports/totals, integrations, caches, backups and established rules.

### Recovery
Known-good checkpoint remains available and affected code can be surgically reverted without destroying operational data.

Test record: **Expected | Actual | PASS/FAIL/BLOCKED/NOT RUN | Evidence/limitation | Action**.
Never convert NOT RUN into PASS. Never call code inspection “live verified.”

## 9. Post-test 5PV-DR
After T, repeat:
- **PRO:** what actually worked and which benefit was observed?
- **CON:** what failed, regressed, confused, broke, or remains unverified?
- **COMPARE & CONNECTIONS:** before vs after; intended vs observed; code vs live; changed vs connected modules.
- **OBSERVER:** does the final experience tell the truth? Any hidden error, missing connection or evidence gap?
- **YOU / OWNER:** accept, conditionally accept, correct, rollback, defer or continue.

A failed test returns to implementation → retest → post-test 5PV-DR.

## 10. Mandatory status language
Always distinguish: **DESIGNED, OWNER APPROVED, IMPLEMENTED, CODE CHECKED, AUTOMATED TESTED, BROWSER TESTED, DEPLOYED/PUBLISHED, LIVE VERIFIED, OWNER UAT ACCEPTED, REGRESSION STATUS, RECOVERY POINT AVAILABLE.**

A commit is not proof of deployment. Deployment is not proof of live correctness. Live correctness is not Owner acceptance.

## 11. First-D handover and completion gate
Every material implementation records: project/module; approved scope; before/after rule; architecture/connections; authoritative data; files changed; untouched areas; recovery point; implementation commit/version; deployment status; passed/failed/blocked/not-run tests; live verification; known issues; rollback; exact next action; next genuine Owner decision.

**A material implementation is not complete until its current handover is updated in the same work cycle.** The next AI/developer must read that handover before modifying the affected system.

## 12. Portable continuation command
> Continue from current HEAD using OVERALL DESIGN MASTER 111Q, repository `AGENTS.md` where present, and the latest project/Codex handover. Treat 111Q as 111Q5PVDDRT. Inspect current source and intervening commits first; do not restart completed architecture or overwrite durable data. Perform the required tester stage and feed test findings back through 5PV-DR before declaring completion. Update the handover after each material change.

## 13. New-project charter
Define: project/version/Owner; problem/outcome; users; first end-to-end workflow; in/out scope; baseline assets; business invariants; data entities/IDs; authoritative store; backup store; screens; APIs/integrations; reports; permissions/security; devices; scale/performance; acceptance tests; release criteria; migration; rollback; approved and pending decisions.

## 14. BOBS / UDANE reference annex
This is an example, not a universal business rule.

BOBS Method 2 preserves Google-backed operational data, Google-first loading where designed, backup/read-back verification, stale-write protection, surgical rollback, one authoritative Current Selling Price, factual Actual COGS separate from pricing provisions, and explicit packing/recipe/purchase ownership.

**Actual COGS = Main food + included condiment food + component packing + applicable common/order packing.**

Pricing bridge:
**Actual COGS → + food spoilage allowance → Pricing COGS after spoilage → + UUWP → Final Pricing COGS → markup/target margin → Suggested/Ideal Selling Price → compare Current Selling Price.**

Current Selling Price is operational; Original Catalogue Price is reference-only.

### UUWP current rule
Normal operator UI should explain, not ask the operator to choose a legacy compatibility policy:
> **UUWP rule:** When leftovers exist, BOBS automatically uses the actual leftover percentage. When 100% is sold, the UUWP default allowance is used (normally 5%).

Legacy compatibility state may remain internally while required by older records.

### Testing lesson
A prior UI edit caused the Item Editor to remain at “Loading from Google…” because invalid JavaScript was introduced. This is why T is mandatory. Similar changes must verify page load, Google data load, changed controls, calculations, save/read-back where safely testable, shared-value propagation, affected links/navigation and nearby regressions.

## 15. Canonical-master rule
Future project annexes may add context but must not silently weaken this master. Conflicts must be identified, reviewed under 111Q5PVDDRT and decided by the Owner.

## 16. Definition of success
111Q succeeds when the Owner can see the choice, benefits, risks and connected effects; existing work is protected; implementation stays bounded; real testing observes the changed system; findings return through 5PV-DR; failures trigger repair/retest; status is truthful; rollback exists; current handover is updated; and another AI/developer can continue without rebuilding understanding from zero or overwriting existing work.

## Revision history
- **v1.0 — 19 Sep 2026:** universal PRO/CON/COMPARE & CONNECTIONS/OBSERVER + OWNER framework, dual business/software review, protection/testing/handover.
- **v2.0 — 20 Sep 2026:** canonicalized **111Q = 111Q5PVDRT**; mandatory Tester; link/load/navigation/persistence/regression testing; mandatory post-test second 5PV-DR; consolidated universal master + BOBS constitution + Codex handover principles.
- **v3.0 — 23 Sep 2026:** canonicalized **111Q = 111Q5PVDDRT**; made developer/Codex handover the first D; added mandatory inspect-current-HEAD/intervening-commits continuity rule; prohibited restart/overwrite behavior; made handover update a completion gate.
