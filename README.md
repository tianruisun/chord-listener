# Chord Listener
Upload audio or record from the mic; the app estimates the chords, key and an easy capo position, entirely in your browser (no server, no API key).

Hosted on Cloudflare Pages: `main` is Production (https://chord-listener.pages.dev) and `test` is the Test app (https://test.chord-listener.pages.dev, with a red TEST badge). Changes reach them only through the release process; nobody pushes by hand. The version lives in `version.js`, which also names the offline cache.

Tests: `npm test` (see `tests/README.md`).

Only use audio you own or have the right to use. Detection handles major/minor chords and is approximate.
