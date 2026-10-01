# Method 2 → Workload & Staffing flow gate — 1 October 2026

## WACP intent before implementation
Owner observed that after completing Idli production setup/packing and saving, embedded Method 2 returned to the summary and the Page Guide incorrectly instructed the user to use the outer `Save & Continue`, bypassing the intended Workload & Staffing stage.

Recovery baseline: `main` at `68de30585edb936b159c3ac10a4afc708bf1bb71`.
Working branch: `chatgpt/method2-workload-gate-20261001`.

Material actions intended:
1. Inspect Method 2 summary/Page Guide, outer flow Save & Continue gate, and WORKLOAD_PLAN persistence/completion semantics.
2. Change the embedded Method 2 guide so once selected items + shared packing are complete, production menus advance to **Workload & Staffing** instead of prematurely telling the user to finish Method 2.
3. Add a real completion gate: if one or more selected items are in Production mode, outer Method 2 Save & Continue must remain blocked until a saved Google WORKLOAD_PLAN is owner-reviewed, calculation-complete, and covers the current production items/quantities.
4. Do not require workload planning when all selected items are Purchased mode.
5. Make workload save notify the Method 2 summary so it can refresh automatically; keep manual Reload Google records as fallback.
6. Preserve all existing Method 2 item/packing review checks and Google-first behavior. Do not alter recipe, pricing, Recipe Master, Method-2 quantities, staffing calculations, or operational data automatically.
7. Add focused regression tests for: production blocked without workload, production allowed with matching owner-reviewed workload, stale quantity blocked, and all-purchased flow allowed without workload.
8. Run the relevant Method 2/workload tests and connected audits before merge. Record result immediately after testing.

111Q pre-implementation review:
- PRO: restores the intended guided sequence and prevents accidental completion before staffing analysis.
- CON: a gate can frustrate users if it cannot explain exactly what is missing; therefore the guide/status must identify Workload & Staffing and provide a direct link.
- COMPARE/CONNECTIONS: Method 2 remains owner of menu/mode/quantity; WORKLOAD_PLAN remains owner of production timing/staffing analysis. The gate only verifies consistency; it does not duplicate staffing calculations.
- OBSERVER: the screenshot shows item setup is complete but flow state is not operationally complete because workload/staffing has not been reviewed.
- OWNER: explicit instruction is to rectify the flow.

Exact next action: implement the narrow workload-completion check in `method2-list.js`, update the Page Guide, and add workload-save notification before touching the outer flow or tests.