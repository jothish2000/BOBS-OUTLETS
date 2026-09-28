# BOBS 111Q continuity — 28 September 2026 — Idli full-price continuation

## 10:36 IST recovery checkpoint — INTENT BEFORE IMPLEMENTATION

Owner asked to continue the interrupted morning BOBS session. The supplied checkpoint says the local morning implementation had already reached these observed states before the previous session exhausted credits:

- the complete test produced an Idli full price including daily labour and rent;
- the full-price result became blocked when the saved expense record changed;
- an existing Workload page status-panel browser error was repaired and the normal flow then passed without browser errors;
- one final test with sambar and chutney included was pending;
- the shared Recipe Master reference remained preserved while outlet production adjustments were saved separately;
- the final interrupted command was adding a Method 2 item label distinction between `Recipe Master COGS` and `Outlet production COGS` when an outlet recipe override exists.

### Current repository reality inspected before any code edit

- Remote `main` HEAD inspected: `e83d940d7b45d023316924965568aa74072acfde`.
- The 28 Sep morning work is not present on remote `main`; remote main still contains yesterday's older Idli support reader and no `recipeOverrides` references.
- Read and obeyed `AGENTS.md`, `OVERALL_DESIGN_MASTER_111Q.md`, and the relevant current handover sections.
- Recovery ref created before reconstruction: `recovery/pre-idli-full-price-recovery-20260928` at `e83d940d7b45d023316924965568aa74072acfde`.
- Active reconstruction branch: `chatgpt/idli-full-price-continuation-20260928`.

### Existing authoritative paths confirmed

- Recipe Master remains the authoritative shared recipe source: `COMPANY / RECIPE_MASTER / STANDARD_V1`.
- Method 2 outlet state remains outlet-specific and must not overwrite the shared Recipe Master.
- Accepted Idli labour/support remains `IDLI_SUPPORT / default`; `IDLI_SUPPORT_BACKUPS` remains its backup path.
- Fixed expenses remain outlet `FIXED_EXPENSES / default` and include HR-derived staff expense separately.
- Legacy/direct Actual COGS must remain separate from labour/fixed-expense recovery pricing; salary/support must not be double-counted into the expense ledger.

### Recovery limitation

The interrupted morning code existed only in the owner's local Codex workspace and was not pushed to GitHub. ChatGPT cannot read that laptop-local worktree through the GitHub connector. Therefore reconstruction must be bounded to behaviour explicitly present in the owner's checkpoint plus current approved architecture; no destructive data rewrite or speculative migration is allowed.

### 5PV-DR before reconstruction

- **PRO:** recovering the missing delta on a branch restores the already-tested direction without touching live Google data or main.
- **CON:** blindly copying only the final label command would be incomplete because remote main has no `recipeOverrides`; the expense freshness rule and workload repair must be recovered coherently.
- **COMPARE & CONNECTIONS:** current chain is Recipe Master -> Method 2 direct COGS -> Workload/Idli support -> labour-inclusive item layer -> Fixed Expenses/outlet economics. The new full-price layer must read existing authoritative records, not become a second expense or recipe master.
- **OBSERVER:** remote main and the owner's local morning checkpoint differ. Status must remain `RECOVERY / IMPLEMENTATION IN PROGRESS`, not `COMPLETE` or `LIVE VERIFIED`.
- **OWNER:** owner instruction is to continue the interrupted work under 111Q.

### Exact next executable action

Inspect the current expense, Idli support, Method 2 and workload readers/writers, recover the smallest compatible full-price/freshness interface, then add tests before changing production-facing files. The sambar/chutney case and exact COGS-source labels are mandatory acceptance checks. No Google operational record will be written during reconstruction tests.
