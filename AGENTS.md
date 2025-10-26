# Repository Guidelines

## Project Structure & Module Organization
Work Dashboard ships as a static single-page app served from `index.html`, styled via `style.css`, with legacy helpers in `script.js`. ES modules in `src/` hold app logic: `src/core/` manages state, utilities, and card lifecycle; `src/cards/` contains one file per dashboard widget (kebab-case filenames, re-exported in `src/cards/index.js`); `src/main.js` bootstraps cards and settings. Browser specs reside in `tests/`, with reports under `playwright-report/` and reusable fixtures governed by `playwright.config.js`.

## Build, Test, and Development Commands
- `npm test`: Runs the full Playwright suite in headless mode; automatically serves the app on `http://localhost:8080`.
- `npm run test:headed`: Opens Playwright in headed browsers to reproduce UI issues.
- `npm run test:ui`: Launches the Playwright Test UI for focused debugging.
- `npm run serve`: Spins up `python3 -m http.server 8000` for manual smoke checks; use `python3 -m http.server 8080` if you need parity with the test base URL.

## Coding Style & Naming Conventions
Use 4-space indentation and modern ES module syntax (`import`/`export`). Keep card modules focused on self-contained behavior and expose setup functions via named exports. Favor camelCase for functions and DOM IDs, kebab-case for filenames, and leave user-facing text in Korean unless you have localized alternatives. Run `npx playwright install` once per machine if browsers are missing.

## Testing Guidelines
Playwright v1.55 powers all specs (`tests/*.spec.js`). Name new files `<feature>.spec.js` and co-locate helpers in the same folder when they are spec-specific. Maintain coverage for critical flows: card registration, settings modal, and persistence interactions. Target fixes or features with `npx playwright test tests/bookmark-manager.spec.js --headed` before PRs, and attach updated HTML reports from `playwright-report/` when relevant.

## Commit & Pull Request Guidelines
Follow the existing history: start messages with an imperative verb, optionally in Korean when it clarifies the feature (e.g., `개선: 카드 드래그 상태 저장`). Reference affected cards or modules in the subject. PRs should describe scope, highlight UX-visible changes with screenshots or short clips, link related issues, and list manual/automated checks (`npm test`, browser used). Tag reviewers who own the impacted modules in `src/core/` or `src/cards/`.
