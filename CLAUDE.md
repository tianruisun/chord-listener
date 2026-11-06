# chord-listener

In-browser PWA that listens to uploaded or recorded audio and estimates the chords, key and an easy capo position, for guitar players.

## Environments
- Production: https://tianrui-chord-listener.pages.dev   (branch main) (not live yet: waiting for Cloudflare setup)
- Test:       https://test.tianrui-chord-listener.pages.dev   (branch test) (not live yet: waiting for Cloudflare setup)
- Old address https://tianruisun.github.io/chord-listener/ is GitHub Pages from `main`, until NEW_REPO_SETUP.md Part 3.

## Tech
- Plain HTML/CSS/JS, no build step. Cloudflare build settings: preset None, no build command, output `/`.
- Version lives in: `version.js` (also names the offline cache `chords-<version>`, and lists the Production hosts)

## Tests
- Run all: `npm test`
- Run against Test site: `npm test -- --site=https://test.tianrui-chord-listener.pages.dev`

## Project rules (override the master rules)
- Languages: English only for now (the app has never had Chinese text).
- All audio stays in the browser: no upload to any server.
