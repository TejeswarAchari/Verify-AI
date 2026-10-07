# Privacy Policy for Verify AI

**Effective Date:** October 2026  
**Version:** 1.0.0

Verify AI is built with an on-device, local-first architecture. It does not operate backend servers, does not track users, and does not collect telemetry.

---

## 1. What Data Is Stored and Where

All persistent data remains exclusively on your local device within Chrome Extension Storage (`chrome.storage.local` and `chrome.storage.session`):

| Data Type | Storage Location | Retention Period | Description |
| :--- | :--- | :--- | :--- |
| **Gemini API Key** | `chrome.storage.local` | Until manually removed | Stored locally to authenticate requests directly with Google AI Studio. |
| **Verification History** | `chrome.storage.local` | **24 hours maximum** | Last 100 analysis results. Automatically deleted after 24 hours. |
| **Pending Selections** | `chrome.storage.session` | Transient (seconds) | Temporary clipboard/context selections passed to the side panel; erased immediately upon consumption. |
| **Reported Patterns** | `chrome.storage.local` | Until manually cleared | Anonymized SHA-256 hashes of reported messages (`{ textHash, scamType, verdict, timestamp }`). **No raw text is stored.** |
| **Tour Status** | `chrome.storage.local` | Persistent | Boolean flag indicating whether the 3-step walkthrough has been completed. |

---

## 2. Automatic 24-Hour Expiry

To protect personal privacy:
- Every history record is stamped with a local creation timestamp (`createdAt`).
- Any entry older than 24 hours is automatically pruned whenever you open the side panel, view history, or every 10 minutes while the panel remains open.
- You can immediately delete all history or wipe all stored data at any time via **Settings &rarr; Data Management**.

---

## 3. What Is Sent to Google Gemini

When you analyze a message or link:
- Only the specific text or URL you explicitly choose to analyze is transmitted.
- Transmission occurs directly from your browser to Google AI Studio's secure API endpoint (`https://generativelanguage.googleapis.com/*`) over encrypted HTTPS.
- No third-party servers, intermediate proxies, trackers, cookies, or user identifiers are involved in the transmission.

---

## 4. Permissions Used

- `sidePanel`: Displays the dedicated 380px analysis interface beside active tabs.
- `contextMenus`: Adds the "Check with Verify AI" option when right-clicking selected text or links.
- `storage`: Saves your API key and 24-hour verification history locally on your device.
- `activeTab`: Reads selected text on the active tab only when you right-click or press `Alt+Shift+V`.
- Host permission for `https://generativelanguage.googleapis.com/*`: Enables direct, private communication with the Gemini API.

---

## 5. Contact & Auditing

Verify AI contains zero obfuscated or remote code. All bundled source code is inspectable directly in the unpacked extension directory.
