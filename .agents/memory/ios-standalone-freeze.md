---
name: iOS installed-app (standalone) freeze
description: Why an installed home-screen web app can be frozen while the mobile browser works, and the fix.
---

# Symptom
User: the iOS "Add to Home Screen" (standalone) version is frozen — content/icons visible but nothing taps. The normal mobile browser works fine; backend mutations return 200; Playwright mobile e2e shows all taps working.

# Root cause
The app shipped with NO web app manifest, NO service worker, and NO `apple-mobile-web-app-*` meta tags. When iOS adds such a site to the home screen, the standalone webview is undefined and commonly launches into a **frozen static snapshot** of the last state instead of booting the live app — only in standalone, not in Safari/Chrome.

**Why:** iOS needs `apple-mobile-web-app-capable` / a manifest with `display: standalone` to treat the launch as a real app boot.

# Fix
- `index.html`: `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `<link rel="manifest">`, `<link rel="apple-touch-icon">`.
- `public/manifest.webmanifest`: `display: standalone`, `start_url`/`scope` `/`.
- Safe-area top inset on the immersive top bar to pair with `viewport-fit=cover`.

# How to apply
- This app deploys at its own domain ROOT (prod base `/`, confirmed `https://bimboy-studios.replit.app` serves `/assets/...`), so absolute paths (`/manifest.webmanifest`) are correct. If routing ever moves bimboy to a subpath, make `start_url`/`scope` base-path-aware.
- Already-installed users must **delete and re-add** the home-screen app once to clear the stale standalone shell before retesting.
- Optional polish (not required for the fix): PNG icons (180/192/512) for nicer install UX.
