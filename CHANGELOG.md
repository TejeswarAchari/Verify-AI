# Changelog

All notable changes to **Verify AI** are documented in this file.

## [1.0.0] - 2026-10-07

### Added
- **Production Chrome Side-Panel Extension**: Built on Manifest V3 with a dedicated 380px vertical side-panel interface.
- **Calibrated Gemini Flash Analysis**: Real-time intent and context analysis powered by `gemini-2.5-flash` with structured JSON output and automatic retry.
- **Client-Side Pre-Inspection**: Static heuristic detection for Punycode (`xn--`), IP hosts, URL shorteners, and mixed-script Cyrillic homoglyphs.
- **24-Hour History Expiry**: Automatic lifecycle pruning on open, read, and 10-minute intervals, with a strict 100-record cap.
- **First-Run Inline Tour**: Lightweight 3-step walkthrough covering API key setup, selection checks, and verdict interpretations.
- **Context Menu & Shortcut Routing**: Right-click "Check with Verify AI" and `Alt+Shift+V` shortcut with automated fallback for Gmail and WhatsApp Web message containers.
- **Local Threat Pattern Registry**: SHA-256 anonymized pattern reporting with zero raw text persistence.
- **Strict CSP & Local Bundling**: Zero remote scripts, zero remote fonts, zero `eval`, and fully local icon assets.
