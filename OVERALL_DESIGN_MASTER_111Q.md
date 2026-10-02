# OVERALL DESIGN MASTER 111Q
## Universal Software / System Building Blueprint
### Canonical definition: **111Q = 111QS5PVDDRT**

**Owner / final decision-maker:** Jothish Babu Sadasivam  
**Version:** 4.2 — 2 October 2026
**Purpose:** Portable blueprint for designing, changing, testing, recovering and handing over software, spreadsheets, automation, operational systems and AI-assisted projects across capable platforms.

## 1. Activation instruction
> Apply OVERALL DESIGN MASTER 111Q. Treat every reference to “111Q” as “111QS5PVDDRT”. Inspect the existing system before changing it. Use the five-person view: PRO, CON, COMPARE & CONNECTIONS, OBSERVER, and OWNER. The first four views have DUAL ROLE: each examines both business/logic and code/software architecture. The OWNER is the fifth and final decision-maker. Before implementation, create/maintain a developer-ready continuation handover so another AI/developer can inspect the current state instead of restarting or overwriting it. After approval, protect the current state, implement only the approved scope, then perform the mandatory TESTER stage. Feed actual test findings back through the five-person dual-role review before declaring completion. Distinguish implemented, code-checked, tested, deployed/live-verified and Owner-accepted. Preserve rollback. Finish every material change by updating the current handover so another AI can continue without rebuilding understanding from zero.

This master defines HOW to work. A project annex/handover defines WHAT the current project contains.

## 2. 111Q = 111QS5PVDDRT
- **S — Switch / execution-mode routing gate:** before material execution, classify the current work and recommend the best execution mode. Chat is preferred for rapid Owner discussion, architecture, UX and business-rule decisions; Work/Codex is preferred for broad research, multi-file implementation, repository/release operations, repeated testing, deep debugging and contemporaneous implementation documentation. When a task crosses from decision/design into material execution, surface a concise **Switch to Work/Codex** suggestion when appropriate and prepare a self-contained continuation handover before the switch. The Owner may explicitly remain in Chat; S guides routing and continuity, it does not remove Owner control.
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
**Proposal / observation → S mode-routing check → inspect current evidence → 5PV-DR → Owner decision → S execution handoff check → First-D handover/checkpoint → protect/backup → implement bounded scope → T tester stage → 5PV-DR AGAIN using actual test evidence → fix/retest if needed → Owner acceptance/release → update handover.**

### 4A. S — mode-routing rule
Use this routing table without consolidating the ten activities:

1. **Architecture / system design → Chat.** Use Chat for fast Owner reasoning, alternatives, dependencies and approval. Switch to Work/Codex only when implementation begins.
2. **Feature / UX design → Chat.** Use Chat for layout, workflow and mobile/clarity decisions. Switch to Work/Codex for multi-page implementation.
3. **Business-rule design → Chat.** Use Chat for formulas, examples, edge cases and Owner approval. Switch after the rule is locked.
4. **Market research → Work.** Prefer Work for multi-source/catalogue-wide research, evidence capture and structured comparison. Small one-off research questions may stay in Chat.
5. **Code changes → Codex/Work.** Prefer Codex for repository software edits; Work is suitable when coding is combined with browser/research/file operations. Tiny surgical fixes may remain in Chat if the Owner prefers.
6. **Repository / release → Codex/Work.** Branching, recovery, PR, CI, merge and deployment verification should normally run as one execution chain.
7. **Testing → Work.** Prefer Work for repeated run → inspect → repair → rerun loops and browser/cloud testing. Owner mobile/UAT observations return to Chat for discussion.
8. **Google / durable-data architecture → Chat first, Work for implementation.** Source-of-truth/schema/migration ownership is an Owner architecture decision; implementation, migration guards and read-back verification belong in Work/Codex.
9. **Documentation / continuity → Work/Codex automatically during execution.** WACP/First-D records must be written contemporaneously. Chat still records material actions when Chat itself performs implementation.
10. **Debugging → Chat for small diagnosis; Work/Codex for deep tracing.** Screenshot/simple symptom diagnosis can stay in Chat; multi-file/browser/state/persistence tracing should trigger a switch suggestion.

### 4B. Mandatory switch suggestion trigger
Before beginning material development in Chat, evaluate whether the next action is primarily an execution task under items 4–9 or deep item 10. If yes, and Work/Codex would materially reduce manual turn-by-turn supervision, surface a compact suggestion such as **“Switch to Work/Codex for implementation.”** Do not interrupt trivial edits or force a switch when Chat can safely finish the bounded task faster.

When switching, prepare a **Mode Handover Packet** containing:
- current project/module and exact goal;
- current repository HEAD/branch and recovery point where relevant;
- approved Owner rule/decision and any unresolved decision;
- files/modules and authoritative data owners;
- non-negotiable invariants and destructive-action prohibitions;
- work already completed and truthful status;
- tests already run/results;
- exact next executable action;
- required 111QS/WACP/5PV/DD/RT behavior.

The handover must be usable without rereading the prior chat. If Work/Codex can directly access the same repository/context, still record the handover in the repository continuity log before the material switch when practical.

Testing is not an appendix. Test evidence must feed back into PRO, CON, COMPARE, OBSERVER and OWNER before completion.

### 4C. Work-completion return gate
At the end of Work/Codex execution, inspect the exact next step. Recommend **Return to Chat** when it is Owner review/UAT discussion, architecture, UX or business-rule decisions. Recommend **Continue in Work/Codex** when implementation, debugging, testing, research or release execution remains. Include the exact current URL/page/module, completion/pending status, evidence and next action. Obtain the Owner's choice before a mode transfer; a recommendation does not itself move or synchronize a conversation. Preserve the existing Chat ↔ Work mode gate.

### 4D. Conversation Capacity Gate — best-effort 75–80%
During software-development conversations, proactively warn the Owner when the conversation appears to be around **75–80% of practical context capacity**, before continuity degrades, and offer a fresh-conversation handover. This is a **best-effort threshold**, based on conversation length and context pressure. There is **no exact live context-percentage meter available**; never invent a measured percentage. Prefer early handover to context loss.

Use this warning, filling all fields with current facts or explicitly marking unavailable/not applicable:

> **111QS — Conversation capacity warning**<br>
> This conversation appears close to its practical context capacity. This is a best-effort estimate, not a measured percentage. I recommend a fresh conversation with a continuity handover.<br>
> **Project:** [project]<br>
> **Exact current URL / page / module:** [full URL and module]<br>
> **Current mode:** [Chat / Work / Codex]<br>
> **Current task:** [bounded objective]<br>
> **Complete / pending:** [truthful status]<br>
> **Repository / HEAD / branch / recovery:** [verified refs where relevant; code and data protection separately]<br>
> **Approved decisions:** [scope and conditions]<br>
> **Tests / status:** [actual PASS, FAIL, BLOCKED, NOT RUN; deployment/live/UAT separately]<br>
> **Unresolved issues:** [risks, blockers, open decisions]<br>
> **Exact next executable step:** [one concrete action]<br>
> **111QS / WACP rules:** [current master/version; inspect source; four dual-role reviews; Owner decisions; write-ahead intent and contemporaneous results; protection; Tester and second review; mode/return gates; handover location]<br>
> **Prepare handover to a new conversation? — YES / NO**

If YES, prepare a self-contained handover containing all these fields plus relevant files and authoritative data owners. Update the current continuity ledger before transfer. The receiving conversation must inspect current evidence and resume from the recorded next step rather than restart architecture. If NO, keep the ledger current and continue within approved scope. These rules do not automatically synchronize unrelated chats, services or computers; supply the master and handover there. Preserve all three gates: Chat ↔ Work routing, Work-completion return, and conversation capacity.

### 4E. Owner device default and explicit mode-choice gate
**Owner instruction, 2 October 2026:** “I will explicitly tell ChatGPT I am on my mobile; otherwise I am always using Work mode in the ChatGPT Windows software on my laptop.”

Assume the Owner is using ChatGPT Windows Work mode on their laptop unless they explicitly say they are on mobile. Do not ask “laptop or phone?” at the start of requests. This replaces the earlier personal communication preference requiring device confirmation. Tailor steps to the laptop by default. Record an actual confirmed mode transfer separately; the default is not evidence that a transfer occurred.

For every recommended Chat ↔ Work transfer, including the Work-completion return gate:
- Present a selectable YES / NO choice naming the destination: for example, “Return to Chat for review/UAT? YES — Return to Chat; NO — Stay in Work.” Plain informational text alone does not satisfy this gate.
- Keep the decision pending until the Owner explicitly responds. Required UX: the choice remains available while the Owner is away or using another app, with no expiry, automatic dismissal, preselected-option submission or automatic transfer. Silence, elapsed time and a vanished popup are not an answer.
- Use a persistent, blocking choice when the host provides one. With an asynchronous choice, do not immediately finalize the turn in a way that dismisses the choice. Wait for the explicit answer before doing work dependent on the transfer. If the host removes or cannot persist the popup, disclose this limitation, retain the pending decision and provide the same YES / NO choice in the conversation so the Owner can answer later; do not repeatedly flash transient prompts.
- YES authorizes the named mode transfer. Save the Mode Handover Packet and use a supported host mode-transfer action when available. Verify the destination before saying the switch occurred. If no such control is available, say so and provide the minimal supported manual handoff; a question tool is not itself a mode-switch tool.
- NO retains the current mode and continues only the previously authorized scope. Do not interpret NO as authorization for unrelated work.
- Preserve the routing table, Work-completion gate, best-effort capacity gate and WACP. These written rules cannot themselves modify the host application's popup lifecycle, add unavailable mode controls or synchronize settings across unrelated conversations/devices.

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

## 12. Continuous cross-AI implementation ledger
111Q documentation is simultaneous with implementation, not only an end-of-session summary. After each material checkpoint, the repository handover records the request/decision, inspected HEAD/recovery point, files/data paths inspected, rule implemented, files changed, persistence effect, test/result, repair/retest if any, truthful release status, pending work and exact next executable action. This is mandatory in both directions: Codex documents so normal ChatGPT can resume after credit/session exhaustion, and normal ChatGPT documents so Codex can resume without reconstructing work from chat history. Record material actions/results in execution order; do not pad the ledger with meaningless keystroke narration.

## 13. Portable continuation command
> Continue from current HEAD using OVERALL DESIGN MASTER 111Q, repository `AGENTS.md` where present, and the latest project/Codex handover. Treat 111Q as 111QS5PVDDRT. Inspect current source and intervening commits first; do not restart completed architecture or overwrite durable data. Perform the required tester stage and feed test findings back through 5PV-DR before declaring completion. Update the handover after each material change.

## 14. New-project charter
Define: project/version/Owner; problem/outcome; users; first end-to-end workflow; in/out scope; baseline assets; business invariants; data entities/IDs; authoritative store; backup store; screens; APIs/integrations; reports; permissions/security; devices; scale/performance; acceptance tests; release criteria; migration; rollback; approved and pending decisions.

## 15. BOBS / UDANE reference annex
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

## 16. Canonical-master rule
Future project annexes may add context but must not silently weaken this master. Conflicts must be identified, reviewed under 111QS5PVDDRT and decided by the Owner.

## 17. Definition of success
111Q succeeds when the Owner can see the choice, benefits, risks and connected effects; existing work is protected; implementation stays bounded; real testing observes the changed system; findings return through 5PV-DR; failures trigger repair/retest; status is truthful; rollback exists; current handover is updated; and another AI/developer can continue without rebuilding understanding from zero or overwriting existing work.

## Revision history
- **v1.0 — 19 Sep 2026:** universal PRO/CON/COMPARE & CONNECTIONS/OBSERVER + OWNER framework, dual business/software review, protection/testing/handover.
- **v2.0 — 20 Sep 2026:** canonicalized **111Q = 111Q5PVDRT**; mandatory Tester; link/load/navigation/persistence/regression testing; mandatory post-test second 5PV-DR; consolidated universal master + BOBS constitution + Codex handover principles.
- **v3.0 — 23 Sep 2026:** canonicalized **111Q = 111Q5PVDDRT**; made developer/Codex handover the first D; added mandatory inspect-current-HEAD/intervening-commits continuity rule; prohibited restart/overwrite behavior; made handover update a completion gate.\n- **v3.1 — 27 Sep 2026:** made the repository handover a continuous cross-AI implementation ledger updated during material work, so Codex and normal ChatGPT can resume each other after abrupt credit/session stops.
- **v4.0 — 2 Oct 2026:** canonicalized **111Q = 111QS5PVDDRT**; added **S = Switch / execution-mode routing gate**, a ten-activity Chat/Work/Codex routing rule, mandatory pre-development switch suggestion when beneficial, and a self-contained Mode Handover Packet for cross-mode continuation.

- **v4.1 — 2 Oct 2026:** Owner-approved best-effort 75–80% Conversation Capacity Gate and complete warning/handover fields; explicit Work-completion return gate; existing routing and 5PV/DD/RT/WACP retained. No exact live context meter claimed.

- **v4.2 — 2 Oct 2026:** Owner defaults to ChatGPT Windows Work on laptop unless mobile explicitly stated; removed recurring device question. Mode gate requires explicit selectable YES/NO, pending decision until response, persistent-choice requirement and truthful host-capability fallback; never imply a choice popup itself switched mode.
