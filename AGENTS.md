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

Apply **111Q = 111Q5PVDDRT**.

- **5PV:** PRO / CON / COMPARE & CONNECTIONS / OBSERVER / YOU-OWNER.
- **First D:** Developer/Codex handover continuity.
- **DR:** the first four perspectives inspect both business/logic and code/software effects.
- **T:** mandatory Tester stage after implementation.
- Feed real test evidence back through post-test 5PV-DR before declaring completion.
- The Owner is the final decision-maker for genuine business/architecture choices.

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

