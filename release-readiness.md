# Release Readiness Checklist

Use this before pushing `v25.1` / Phase 1.5 changes.

## GitHub Push Preflight

- Confirm Monika has approved the current local preview.
- Confirm no new feature work is bundled into the release.
- Confirm `dist/` is synced with root files:
  - `index.html`
  - `app.js`
  - `styles.css`
  - `manifest.webmanifest`
  - `sw.js`
  - config / adapter JSON and JS files
- Run syntax checks:
  - `node --check app.js`
  - `node --check drive-targets.config.js`
  - `node --check flowyear-standby-phrases.adapter.js`
  - `node --check api/drive-draft.js`
- Search for forbidden or stale UI copy:
  - `阿知在等妳`
  - `炸毛`
  - `Quick doors`
  - `read-only mock`
  - `Monika 今日狀態`
- Confirm no frontend Drive write path is active:
  - no `saveDraft`
  - no frontend call to `/api/drive-draft`
  - no `files.create`

## Pages Deployment Checklist

- Upload / deploy the contents of `dist/`.
- Confirm `dist/sw.js` has the intended cache name.
- Confirm `dist/manifest.webmanifest` uses:
  - `name`: `Monika & Azhi Universe OS`
  - `short_name`: `M × A OS`
  - icons from `assets/icons/icon-192.png` and `icon-512.png`
- Confirm the deployed URL loads:
  - `/?v=25`
  - `/?door=cam&v=25`
  - `/?door=diary&v=25`
  - `/?door=book&v=25`
  - `/?door=dog&v=25`

## Cache Clear Steps

- Hard refresh the browser after deployment.
- If stale UI appears, clear site data for the GitHub Pages origin.
- On mobile, remove the old PWA icon and reinstall if the name or icon remains stale.
- If the service worker keeps old assets, bump the cache name in `sw.js` and reload twice.

## PWA Install Re-check

- Home screen name shows `M × A OS`.
- Browser title shows `Monika & Azhi Universe OS`.
- Footer shows `Monika & Azhi Universe OS — We being.`
- Standby shows one light observation before opening the panel.
- Opening the panel hides the standby observation.
- Cam does not show draft preview or folderId.
- Diary / Book / Dog still only create local draft preview.

## Icon Verification

- `index.html` favicon uses `assets/icons/icon-192.png?v=25` and `icon-512.png?v=25`.
- `manifest.webmanifest` icons use only `assets/icons/icon-192.png?v=25` and `icon-512.png?v=25`.
- `.bubble-toggle` uses `assets/icons/icon-192.png?v=25`.
- No `icon.svg` or old crop is used as app identity.

## Rollback Note

If deployment shows stale icons, broken layout, or wrong routing, roll back by redeploying the previous known-good `dist/` package. Do not hotfix by adding new modes, Drive writes, or new data flows during rollback.
