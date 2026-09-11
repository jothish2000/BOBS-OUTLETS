# BOBS FLOW — Canonical Business Flow

**Document version:** BOBS FLOW v1.0  
**Established:** 2026-09-11  
**Status:** Canonical reference for BOBS application design and 111Q changes

## 1. Purpose

BOBS is an outlet-level business planning and economics system. The application must complete the business analysis for one outlet through the same sequence before returning to the main BOBS Flow.

If multiple outlets are entered, **each outlet follows the same outlet-level sequence**. After all required outlet-level data is available, the company-level break-even analysis considers the combined data from all outlets.

## 2. Canonical BOBS Flow

**OUTLET SETUP**
→ **METHOD SELECTION**
→ **COGS-BASED OUTLET ANALYSIS / METHOD COMPARISON**
→ **STAFF MASTER + EMPLOYEE-TO-OUTLET ATTACHMENT**
→ **FIXED EXPENSES**
→ **BREAK-EVEN — PER OUTLET**
→ **BREAK-EVEN — OVERALL COMPANY**

## 3. Outlet-by-Outlet Rule

For Outlet 1:

1. Complete Outlet Setup.
2. Select/use the applicable analysis method(s).
3. Complete the simple COGS-based outlet analysis/comparison.
4. Complete Staff Master and attach employees to the outlet using the attachment code so salary cost can be allocated to that outlet.
5. Enter the outlet's fixed expenses, including rent and other applicable items.
6. Calculate break-even for that outlet.
7. Mark the outlet's work complete.
8. Return to the main BOBS Flow — **do not force the user into a "Next Outlet" step**.

For Outlet 2, Outlet 3, etc., repeat the **same sequence** independently.

## 4. Employee Attachment and Salary Allocation

Staff Master is a company-level employee master, but employees are attached to outlets using an outlet attachment/code. Salary cost must therefore be allocatable to the outlet(s) to which the employee is attached, according to the BOBS allocation rules.

## 5. Fixed Expenses

Fixed Expenses is an explicit stage of the BOBS Flow. It is where outlet-relevant fixed expenses are entered, including rent and other applicable recurring costs.

## 6. Break-Even

### Per Outlet

Each outlet must have its own break-even result based on that outlet's applicable sales, COGS/variable cost, allocated salary/HR cost, and fixed-expense data according to the BOBS costing rules.

### Overall Company

Overall Company Break-even is a separate final analysis. It must consider the combined data of **all completed outlets**, not only the first outlet and not an isolated single-outlet calculation.

## 7. Data Principle

Google Sheets / Data Vault is the permanent source of truth. Starting a new assessment or changing browser working state must never delete permanent outlet, staff, expense, method, costing, or break-even records.

## 8. 111Q Change-Control Rule

Every BOBS change made under 111Q must be recoverable.

- Preserve the previous known-good Git commit before a risky change.
- Make the smallest safe change necessary; avoid broad rewrites when a surgical fix is sufficient.
- Every meaningful change gets a Git commit with a clear version/change description.
- Maintain recognizable BOBS version/milestone numbers so a known-good state can be located quickly.
- Never reconstruct a previous working version from memory when Git history can restore it.
- Never use destructive data deletion as a normal rollback mechanism.
- Code rollback and data recovery are separate: Git protects application code; Google Sheets / Data Vault protects permanent business data.
- Before declaring a milestone complete, verify the affected flow and preserve that verified state as a known-good version.

## 9. Current Priority

The immediate implementation priority is to make the complete **one-outlet flow** work reliably from Outlet Setup through the outlet-level stages. Do not move ahead to unrelated modules until this foundation is stable.

## 10. Flow Completion Rule

The end of an outlet's complete workflow returns the user to the **main BOBS Flow**. It must not ask the user to continue to another outlet automatically.

The main BOBS Flow is the controller. The outlet is the unit of completion.
