document.addEventListener('DOMContentLoaded', () => {
  const keyInput = document.getElementById('api-key-input');
  const tierSelect = document.getElementById('tier-select');
  const status = document.getElementById('status-msg');

  chrome.storage.local.get(['apiKey', 'userTier'], (data) => {
    if (data.apiKey) keyInput.value = data.apiKey;
    if (data.userTier) tierSelect.value = data.userTier;
  });

  document.getElementById('save-key').onclick = () => {
    chrome.storage.local.set({ apiKey: keyInput.value.trim() }, () => {
      status.textContent = '✓ API key saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  };

  document.getElementById('save-tier').onclick = () => {
    chrome.storage.local.set({ userTier: tierSelect.value }, () => {
      status.textContent = '✓ Plan saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  };

  document.getElementById('open-panel-btn').onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      // Check if tab is a valid page
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        status.textContent = '⚠ Go to a webpage first!';
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, () => {
        chrome.tabs.sendMessage(tab.id, { type: 'OPEN_PANEL' });
        window.close();
      });
    });
  };
});