# Verify AI — Chrome Side-Panel Extension (Manifest V3)

Verify AI is a modern Chrome side-panel extension that analyzes selected text, emails, and links to explain whether they are legitimate or a scam. It operates entirely as a local Chrome side panel, utilizing a Gemini Flash model with calibrated structured JSON outputs.

---

## 1. Extension Build Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate Vector & PNG Icons
Pre-generated icons are located in `public/icons/`. To regenerate them at any time:
```bash
npm run generate-icons
```

### Step 3: Build Production Unpacked Bundle
```bash
npm run build
```
This produces the complete, unpacked extension in the **`dist/`** directory containing:
- `manifest.json` (Tightened Manifest V3 specification)
- `sidepanel.html` (React side-panel application entry point)
- `background.js` (MV3 service worker for context menus, commands, and side panel routing)
- `content.js` (DOM text and enclosing message extractor)
- `icons/` (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`, and `icon.svg`)
- `assets/` (Strict CSP-compliant bundled scripts and stylesheets, zero remote code)

---

## 2. How to Load in Google Chrome

1. Open Google Chrome.
2. In the address bar, navigate to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click the **Load unpacked** button.
5. In the file picker, select the **`dist`** directory in this project root.
6. **Verify AI** is now installed and ready to use.

---

## 3. Storage Architecture & 24-Hour Expiry

Verify AI is built with privacy-by-design principles:
- **On-Device Storage Adapter (`src/services/store.ts`)**: In the extension, data is saved into `chrome.storage.local` (and `chrome.storage.session` for transient clipboard handoffs). In the browser dev preview, an automatic fallback adapter uses `localStorage` without breaking runtime isolation.
- **Strict 24-Hour Expiry**:
  - Every verification record stores a millisecond timestamp (`createdAt`).
  - Entries older than 24 hours (`Date.now() - createdAt > 86,400,000 ms`) are automatically purged:
    1. Whenever the side panel is opened.
    2. Whenever the History tab is read.
    3. On an automatic 10-minute interval while the side panel remains open.
  - A maximum cap of 100 entries is enforced at all times.
- **Session Queue Clearing**: When a selection is sent via the context menu or keyboard shortcut, it is consumed by the side panel and immediately wiped from `chrome.storage.session` to prevent double analysis or stale re-use.
- **Anonymized Pattern Registry**: The "Report this pattern" feature saves only cryptographic SHA-256 hashes (`textHash`). No raw message text is ever logged or exported.

---

## 4. First-Run Tour

On first launch, an inline 3-step walkthrough appears inside the panel:
- **Step 1**: Add and test your Google AI Studio API key with instant verification feedback.
- **Step 2**: Learn the three ways to check content (Right-click, `Alt+Shift+V`, or manual paste).
- **Step 3**: Understand the verdict score, inline numbered superscripts, and action imperatives.

You can dismiss the tour at any time, or replay it from **Settings &rarr; Data Management &rarr; Replay**.

---

## 5. Before Publishing to the Chrome Web Store Checklist

Before submitting the extension to the Chrome Web Store Developer Dashboard:

- [ ] **Run Clean Build**: Execute `npm run clean && npm run build` and ensure `dist/` builds with zero errors.
- [ ] **Validate Manifest V3**: Confirm `dist/manifest.json` has `manifest_version: 3`, name `"Verify AI"`, and description under 132 characters.
- [ ] **Minimum Chrome Version**: Verify `"minimum_chrome_version": "116"` for universal `chrome.sidePanel.open` support.
- [ ] **Host Permissions Justification**: Ensure `host_permissions` contains only `https://generativelanguage.googleapis.com/*` (for Gemini API calls).
- [ ] **Permissions Justification**:
  - `sidePanel`: Required to display the side-panel companion UI.
  - `contextMenus`: Required for right-click "Check with Verify AI".
  - `storage`: Required for local on-device storage of user settings and 24h history.
  - `activeTab`: Required to inspect selected text on the user's active page.
- [ ] **Single Purpose Compliance**: Ensure listing copy accurately describes Verify AI's single purpose: *Scam and phishing explanation for selected text and links*.
- [ ] **Privacy Policy**: Link `PRIVACY.md` in your Chrome Web Store store listing submission.
- [ ] **ZIP Archive**: Compress the contents of the `dist` directory into `verify-ai-extension-v1.0.0.zip` (do not zip the parent folder, zip the contents directly).

---

## 6. License & Security

- **Strict CSP**: Zero remote script tags, zero `eval`, zero inline scripts. Fonts are bundled locally.
- **Network Boundaries**: No external analytics, trackers, or telemetry. Outbound network traffic is limited exclusively to `https://generativelanguage.googleapis.com/*`.
