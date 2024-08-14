
    chrome.runtime.onInstalled.addListener(() => {
      chrome.storage.sync.set({ language: 'ru', enabled: true });
    });
    