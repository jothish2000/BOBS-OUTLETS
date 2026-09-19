# Method 2 Ideal Pricing Builder — 111Q recovery

Known-good parent before this change: `e17c851`.

Protected recovery references:

- Branch: `backup/111q-before-ideal-pricing-builder-20260919`
- Tag: `111q-before-ideal-pricing-builder-20260919`

The change is surgical: Method 1, existing Method 2 records, original catalogue prices,
current selling prices, editable pricing fields, Google read-back verification, backup/restore,
and concurrent overwrite protection remain in place.

Rollback the code by restoring the four affected production files from the protected commit:

```sh
git restore --source=e17c851 -- method2-core.js method2-item.html method2-item.js method2-workspace.css
```

Do not reset or overwrite Google/Data Vault records during code recovery.
