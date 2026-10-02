# BOBS / UDANE — CODEX CONTINUITY GUARD

This repository is an actively evolving production/business system. **Never start from scratch and never replace existing architecture merely because a cleaner rewrite seems easier.** Preserve user data, Google-backed state, historical catalogue indices, recovery points and previously approved business rules.

## Mandatory startup sequence for every Codex task

Before editing any file:

1. Fetch the current repository `main` HEAD.
2. Read `CODEX_HANDOVER_111Q_CURRENT.md` completely.
3. Read `OVERALL_DESIGN_MASTER_111Q.md` completely.
4. Inspect the actual current source files involved in the requested change.
5. If the handover's recorded HEAD is older than current `main`, inspect every intervening commit affecting the requested area before changing code.
6. Treat the current source + durable Google-backed data flow as the starting state. **Do not reconstruct from memory, an older handover, an earlier branch, or a generic template.**

## Canonical governance

Apply **111Q = 111QS5PVDDRT**.

- **S — Switch / execution-mode routing gate:** before material execution, route the current activity to the best mode and preserve continuity. Chat: architecture, UX, business rules, small diagnosis. Work: broad research, testing, browser/multi-step execution. Codex/Work: coding, repository/release, deep debugging, durable-data implementation. Before moving from an approved design into material development, surface a concise Switch-to-Work/Codex suggestion when it would materially improve execution and prepare a self-contained handover. The Owner may explicitly stay in Chat.
- **5PV:** PRO / CON / COMPARE & CONNECTIONS / OBSERVER / YOU-OWNER.
- **First D:** Developer/Codex handover continuity.
- **DR:** the first four perspectives inspect both business/logic and code/software effects.
- **T:** mandatory Tester stage after implementation.
- Feed real test evidence back through post-test 5PV-DR before declaring completion.
- The Owner is the final decision-maker for genuine business/architecture choices.


## 111QS mode-routing gate — mandatory

Before starting material implementation, classify the current step using the ten fixed categories in `OVERALL_DESIGN_MASTER_111Q.md`. Do not collapse them into a generic rule. If the task is market research, substantial coding, repository/release work, repeated testing, implementation of Google/durable-data architecture, implementation-time documentation, or deep debugging, prefer Work/Codex and surface a switch suggestion before development when beneficial.

Before a cross-mode handoff, record a Mode Handover Packet with current HEAD/recovery, approved rule, files/data owners, constraints, current status/tests and exact next step. A mode switch never authorizes destructive action and never bypasses Owner decisions.

## 111Q continuous continuity ledger — mandatory

111Q now requires **simultaneous documentation while implementation is happening**, not a handover written only at the end.

For every material work session, Codex/ChatGPT/developer must keep the repository continuity record current enough that another agent can resume after an abrupt credit/session stop. At each meaningful checkpoint record, in chronological order:

1. request/decision being implemented;
2. current HEAD / recovery point inspected;
3. files and authoritative data paths inspected;
4. exact business/architecture rule chosen;
5. files changed and what each change does;
6. persistence/migration implications;
7. test actually run and observed result;
8. failure/repair/retest when applicable;
9. deployment/live/UAT status without upgrading unverified states;
10. pending work and the **exact next executable step**.

Update `CODEX_HANDOVER_111Q_CURRENT.md` during the work cycle after material checkpoints, and always before stopping when possible. If work is interrupted before a final clean-up, the latest ledger entry is authoritative evidence of where to resume. Codex must follow this rule so normal ChatGPT can resume Codex work; normal ChatGPT must follow the same rule so Codex can resume chat work.

Do not write a fictional line-by-line narrative of keystrokes. Record every **material implementation/action/result** in execution order so continuity is technically useful and auditable.

## Non-destructive change rule

For every material change:

1. Inspect before edit.
2. Identify authoritative data owners, readers/writers, downstream calculations and persistence paths.
3. Create or confirm a recovery point before a risky/material change.
4. Prefer surgical edits over rewrites.
5. Preserve unrelated data and existing working features.
6. Do not delete, reset, re-seed, shrink or overwrite Google-backed operational records unless the Owner explicitly approved that exact destructive action and a verified backup exists.
7. Never treat missing/unknown data as zero merely to make a calculation complete.
8. Never silently change catalogue ordering/index semantics used by historical Method 2 records.
9. Never replace an existing recipe/master record with a smaller or incomplete seed.
10. When migration is required, merge forward loss-safely and retain a rollback/data-backup path.

## Conflict rule

If current source, current durable data, the current handover and an older document disagree:

1. Do not overwrite anything immediately.
2. Inspect git history and the current implementation path.
3. Prefer the most recent Owner-approved rule that is consistent with current source/data.
4. Surface any genuine unresolved conflict for Owner decision before a destructive or architecture-changing action.

## Completion rule — handover is mandatory

A material BOBS change is **not complete** until `CODEX_HANDOVER_111Q_CURRENT.md` is updated in the same work cycle.

The handover update must record at minimum:

- current/new HEAD or implementation commit(s);
- what changed and why;
- files/modules changed;
- business/architecture rule preserved or introduced;
- authoritative data/persistence implications;
- recovery point;
- tests actually run and their results;
- browser/live/UAT status using exact status language;
- known limitations/risks;
- exact next action.

Do not claim COMPLETE when the code changed but the handover was not updated.

## Mandatory status language

Distinguish clearly:

- DESIGNED
- OWNER APPROVED
- IMPLEMENTED
- CODE CHECKED
- AUTOMATED TESTED
- BROWSER TESTED
- DEPLOYED / PUBLISHED
- LIVE VERIFIED
- OWNER UAT ACCEPTED
- REGRESSION STATUS
- RECOVERY POINT AVAILABLE

If something was not actually performed, say `NOT RUN`, `NOT VERIFIED` or `BLOCKED`.

## BOBS invariants currently locked

- Recipe Master is the single source for recipe ingredients/yield/raw-material cost/direct production energy/timing/equipment/required role.
- Workload & Staffing reads timing from Recipe Master; do not create a second staffing recipe source.
- Owner update 25 Sep 2026: preserve the legacy direct Actual COGS subtotal, and expose a separate full item cost/pricing total with allocated regular labour and selected additional support. Never add these allocations again to the outlet expense ledger. Read the current handover for implementation boundaries.
- MENU -> ROLE -> POSITION -> PERSON.
- Vada/Snack Master is a separate specialist by default unless Owner explicitly approves multi-skilling.
- Reuse a position across dayparts only when timeline/capacity proves it.
- Shared preparation is counted once only when genuinely shared and selected as shared production.
- Idli/Vada must never use `COOKED_RICE_BASE`.
- Preserve the existing Idli ingredient formulation unless Owner explicitly approves replacement.
- New catalogue items must not shift historical Method 2 index meaning.

## Safe continuation command

When the Owner says something like `continue`, `go ahead`, `222`, `333`, `999` or asks Codex to continue BOBS, interpret it as:

> Continue from current HEAD. First read `AGENTS.md`, `CODEX_HANDOVER_111Q_CURRENT.md` and `OVERALL_DESIGN_MASTER_111Q.md`; inspect the current implementation and intervening commits; preserve data/recovery; extend the existing architecture rather than restarting it; test the actual result; then update `CODEX_HANDOVER_111Q_CURRENT.md` before declaring the material change complete.


## 111QS continuity gates
Follow universal master v4.1 sections 4A–4D: preserve Chat/Work routing, apply the Work-completion return gate, and proactively offer the complete fresh-conversation handover at an estimated 75–80% practical context capacity. This is best effort; no exact live percentage meter is available. Keep WACP contemporaneous. Latest Owner hierarchy for this item repair: Google BOBS_STANDARD_RECIPE, then audited market references; legacy Recipe Master is history/backup only, never an operational fallback.


## Owner communication override — 2 October 2026
Assume ChatGPT Windows Work mode on the Owner's laptop unless the Owner explicitly says they are on mobile. Do not ask laptop-or-phone confirmation. This supersedes the older personal device-question rule. Follow universal master v4.2 section 4E: selectable YES/NO mode gate, decision pending until explicit response; no timeout/default consent. Use supported mode transfer only after choice and handover; verify it. If popup persistence or mode switching is unavailable, disclose the limitation and preserve a replyable YES/NO choice rather than claiming a switch. These project instructions do not automatically change unrelated chats or local global settings.
