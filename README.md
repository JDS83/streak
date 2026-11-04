# Streak

[![Tests](https://github.com/JDS83/streak/actions/workflows/test.yml/badge.svg)](https://github.com/JDS83/streak/actions/workflows/test.yml)

A private daily habit tracker. Each day you mark it **Good** or **Bad**, and
Streak shows how many good days in a row you have. It's a small installable
web app (PWA). It has no account, no server and no tracking, and all data
stays on your device.

## Features

- **Current streak:** consecutive good days, counted back from yesterday.
- **Best streak ever:** your longest run of good days.
- **Milestones:** shows progress toward the next goal (3 days, 1 week,
  2 weeks, then 1–6, 9 and 12 months). When you reach one, a silent toast
  appears with confetti (skipped if the system is set to reduce motion).
- **Calendar:** tap any past day to set it to Good or Bad. Tap the same
  button again to clear it. Today and future days unlock only after they
  have fully passed.
- **Backup:** export your data to a `.json` file and import it again to
  restore it or move it to a new phone. Import checks the file first, then
  lets you either merge it into your existing data or replace all of it.
- **Works offline:** a service worker caches the app, so it can be installed
  to the home screen and used without a connection.

## Running it

It's plain HTML and JavaScript, with no build step and no dependencies.
Service workers need `http://localhost` or HTTPS, so serve the folder
instead of opening the file directly:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

To use it on a phone, host the folder on any static HTTPS host (for example
GitHub Pages) and choose "Add to Home Screen".

## Data

Days are stored in the browser's `localStorage` under the key
`streak.days.v1`. The data is a map from `YYYY-MM-DD` dates to `"good"` or
`"bad"`. Backup files use the same format:

```json
{
  "2026-11-01": "good",
  "2026-11-02": "bad"
}
```

Clearing the browser's site data deletes your history, so export a backup
regularly.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | The app: UI, styles, storage, import/export, celebrations |
| `streak.js` | Pure streak logic (metrics, milestones, backup validation), shared with the tests |
| `sw.js` | Service worker for offline caching |
| `manifest.webmanifest`, `icon.svg` | PWA install metadata and icon |
| `test.html` | Tests for `streak.js`, run in the browser |
| `run-tests.sh` | Runs `test.html` in headless Chrome under several timezones |

## Tests

Open `test.html` in a browser, or run it headless:

```sh
./run-tests.sh                   # Jerusalem, London, New York, Sydney, UTC
./run-tests.sh Asia/Jerusalem    # one or more specific timezones
```

The tests run in several timezones to catch daylight-saving bugs, because
those days are 23 or 25 hours long. The script needs Chrome or Chromium. Set
`CHROME=/path/to/chrome` if it isn't found automatically.

GitHub Actions runs the same script on every push to `main` and on every
pull request.
