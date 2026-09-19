# Method 2 selling-price recovery

Pre-change recovery branch: `backup/method2-price-before-hardening-20260919`
Pre-change commit: `77e32ffbeddc01e577638ac1e115432b4bf9d766`

Code rollback: revert the single commit introducing this file. Preserve unrelated later work; do not reset main or force-push. A code rollback does not restore Google data.

Data recovery: use the existing Method 2 recovery interface or M2.backups(outlet) to select an outlet-specific snapshot. Read and preview its contents and the current outlet record, then call M2.restore(outlet, backupKey, expectedCurrentRecord). Restore rejects a changed baseline and backs up the current record before replacing it. This restores the whole Method 2 outlet record, so review later non-price edits before restoring.

Selection changes and edited prices use one Method 2 write, preceded by a verified METHOD2_BACKUPS snapshot. A failed backup prevents the operational write. Read-back verifies the selection save token. Only changed price inputs are submitted; blank unchanged catalogue prices remain unset.

Concurrency: client baseline and pre-write checks reject observed conflicts. They are not a server-side atomic compare-and-swap; a cross-device change during the final check/write interval remains possible.

Validation: node --test tests/method2-selling-price.cjs. Tests use simulated Google persistence. Live authenticated Google round-trip verification remains pending.
