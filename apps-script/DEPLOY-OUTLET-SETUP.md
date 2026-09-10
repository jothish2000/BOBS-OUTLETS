# BOBS Google-first Apps Script deployment

This folder is the deploy-ready Apps Script backend used by Outlet Setup.

## Important
GitHub changes do **not** publish a new Google Apps Script deployment automatically. The live `/exec` URL must be redeployed in the existing Apps Script project.

## Files to use in ONE Apps Script project
1. `01_Config.gs`
2. `02_WebAPI.gs`
3. `03_OutletMaster.gs`
4. `04_ModuleData.gs`
5. `05_Snapshots.gs`

These files use spreadsheet ID:
`19E32HO9npGZugzpzVm4UvxA40A001GRDVRsBtHy-FR8`

The permanent outlet sheet is:
`OUTLET_MASTER`

## Required deployment
In the existing Google Apps Script project behind the BOBS web-app URL:
- replace the old backend code with these five files;
- keep the same spreadsheet ID above;
- Deploy → Manage deployments;
- edit the existing Web app deployment;
- Execute as: Me;
- Who has access: Anyone;
- Deploy a new version.

Do not delete or clear any Google Sheet.

## Required browser test
Open the deployed `/exec` URL with:
`?action=outletList&callback=testBobsOutlet`

A successful response must begin with:
`testBobsOutlet(`

and contain:
- outletId `1`, name `RASIPURAM`, code `RSP`
- outletId `2`, name `GURUSAMYPALAYAM`, code `GP`

Only after this test succeeds should Outlet Setup be tested again on GitHub Pages.
