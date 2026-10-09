// Manifest V3 Background Service Worker for Verify AI

const CONTEXT_MENU_ID = 'verify-ai-check-selection';
const PENDING_STORAGE_KEY = 'verifi_pending_check';

// 1. Setup Context Menus and Side Panel behavior on install
chrome.runtime.onInstalled.addListener(() => {
  // Ensure previous menu item removed to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Check with Verify AI',
      contexts: ['selection', 'link'],
    });
  });

  // Automatically open the side panel when the toolbar icon is clicked
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('Could not set sidePanel openPanelOnActionClick', err);
    });
  }
});

// 2. Action Toolbar click handler
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id && chrome.sidePanel) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (err) {
      console.warn('Failed to open side panel on action click', err);
    }
  }
});

// 3. Context Menu item click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
    const targetText = info.selectionText || info.linkUrl || '';
    const panelPromise = chrome.sidePanel?.open({ tabId: tab.id }).catch((err) => {
      console.warn('Failed to open side panel on context menu click', err);
    });

    if (targetText && chrome.storage?.session) {
      await chrome.storage.session.set({
        [PENDING_STORAGE_KEY]: {
          text: targetText,
          pageUrl: tab.url,
          timestamp: Date.now(),
        },
      });
    }

    await panelPromise;
  }
});

// 4. Keyboard command handler (Alt+Shift+V)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'check-selection') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const panelPromise = chrome.sidePanel?.open({ tabId: tab.id }).catch((err) => {
      console.warn('Failed to open side panel on command', err);
    });

    try {
      // Query content script for selection or nearest enclosing message body
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'GET_SELECTION_OR_MESSAGE',
      });

      if (response?.text && chrome.storage?.session) {
        await chrome.storage.session.set({
          [PENDING_STORAGE_KEY]: {
            text: response.text,
            pageUrl: response.pageUrl || tab.url,
            timestamp: Date.now(),
          },
        });
      }
    } catch {
      // Content script may not be loaded on internal pages (chrome://, about:blank)
    }

    await panelPromise;
  }
});
