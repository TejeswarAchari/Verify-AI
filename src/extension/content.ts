// Minimal Content Script for Verify AI Chrome Extension
// Listens for selection requests and extracts message body on webmail/chat interfaces

interface ExtractionResponse {
  text: string;
  pageUrl: string;
  timestamp: number;
}

function findEnclosingMessage(): string {
  // Check active element or focus first
  const activeEl = document.activeElement;

  // 1. WhatsApp Web selectors
  const waSelectors = [
    '[data-pre-plain-text]',
    '.copyable-text[data-pre-plain-text]',
    'div[class*="message-in"] div[class*="selectable-text"]',
    'div[class*="message-out"] div[class*="selectable-text"]',
    'div[data-testid="msg-container"]',
  ];

  for (const sel of waSelectors) {
    if (activeEl && activeEl.closest(sel)) {
      const text = activeEl.closest(sel)?.textContent?.trim();
      if (text) return text;
    }
    const all = document.querySelectorAll(sel);
    if (all.length > 0) {
      // Pick the last message in view
      const last = all[all.length - 1];
      const text = last.textContent?.trim();
      if (text) return text;
    }
  }

  // 2. Gmail message body selectors
  const gmailSelectors = [
    '.a3s.aiL', // Standard email message body container
    'div[role="listitem"] .ii.gt', // Expanded email in thread
    '.adn.ads .ii.gt',
    'div[aria-label*="Message Body" i]',
  ];

  for (const sel of gmailSelectors) {
    if (activeEl && activeEl.closest(sel)) {
      const text = activeEl.closest(sel)?.textContent?.trim();
      if (text) return text;
    }
    const matches = document.querySelectorAll(sel);
    if (matches.length > 0) {
      // Pick the currently active or newest email in thread
      const newest = matches[matches.length - 1];
      const text = newest.textContent?.trim();
      if (text) return text;
    }
  }

  // 3. Generic article or message container
  const genericSelectors = [
    '[role="article"]',
    'article',
    '[data-qa="message_content"]', // Slack Web
    '[data-tid="chat-pane-message"]', // Teams Web
  ];

  for (const sel of genericSelectors) {
    if (activeEl && activeEl.closest(sel)) {
      const text = activeEl.closest(sel)?.textContent?.trim();
      if (text) return text;
    }
  }

  return '';
}

function getSelectedOrEnclosingText(): string {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 0) {
    return selection;
  }

  // When selection is empty, inspect nearest enclosing message
  return findEnclosingMessage();
}

chrome.runtime.onMessage.addListener(
  (
    message: { action: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtractionResponse) => void
  ) => {
    if (message.action === 'GET_SELECTION_OR_MESSAGE') {
      const extractedText = getSelectedOrEnclosingText();
      sendResponse({
        text: extractedText,
        pageUrl: window.location.href,
        timestamp: Date.now(),
      });
    }
    return true;
  }
);
