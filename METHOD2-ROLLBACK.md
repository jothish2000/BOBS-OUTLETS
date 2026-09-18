# Method 2 release safeguards — 18 September 2026

## Saved business data

Pre-release backups are stored separately in the Google module METHOD2_BACKUPS. Backup payloads and identifying keys/hashes are not committed to this public repository. The release preflight reads back each backup and compares the full payload, then confirms the active record is unchanged. Missing records are not created or deleted.

Every save through the new Method 2 core first verifies a separate full-record backup, checks again for intervening changes, writes the active record, then verifies read-back. Backup failure blocks the active write. These protections do not retrofit already-open old tabs or unrelated legacy writers.

Recovery: open method2-recovery.html with the required outlet query parameter. Choose a backup, inspect its date/reason, optionally download its JSON, type the outlet ID and confirm. Restore replaces that outlet's complete Method 2 record, including changes made after the backup. It first backs up the current record, so restoration can itself be reversed by selecting that pre-restore backup after reloading recovery. Recipe Master, Method 1 and other outlets are not replaced. An initially absent/null record cannot be restored as a deletion.

Do not restore merely because a display looks wrong. Close editing tabs, reload Google data, and inspect first. Download a backup before recovery. Never clear Google data or use browser cache as the authoritative recovery source.

## Website code

The tag method2-before-order-packing-20260918 preserves published commit 383acda before this release. The release tag is method2-order-packing-20260918. Both keep prior upgrades and full Git history recoverable.

For code rollback, first inspect subsequent changes. In a clean checkout at the release commit, apply the inverse release delta as a NEW commit and deploy normally (no force push or hard reset):

```powershell
git diff --binary method2-order-packing-20260918 method2-before-order-packing-20260918 | git apply --index
git diff --cached --stat
git commit -m "Roll back shared packing release to verified prior website"
git push origin main
```

Do not apply blindly after later releases; reconcile later edits first. Code rollback does not restore Google data. If both are affected, recover the required outlet while the recovery page is still deployed, then roll back code. Download the selected backup before either operation.

## Verification and limits

Six automated suites cover component packing, both saved schemas, source combinations, selection/scroll behavior, Sold Today validation, original-recipe 200 ml sambar, unknown-field preservation, downstream shared totals, backup failure, stale writes, recovery and Chrome cache-free reload. Shared-packing layout was visually inspected at laptop width.

The Google API has no atomic compare-and-swap transaction. Read/compare/write safeguards and same-browser locks reduce conflicts but cannot guarantee against simultaneous writes from another device or old tab. Close old tabs and use one editor while testing. Backups are retained, not automatically pruned. The legacy daily break-even page still uses its browser mirror; this release does not convert it to Google-first persistence.
