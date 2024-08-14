document.getElementById('save').addEventListener('click', () => {
  const language = document.getElementById('language').value;
  const enabled = document.getElementById('enabled').checked;
  const rate = parseFloat(document.getElementById('rate').value);
  const pitch = parseFloat(document.getElementById('pitch').value);
  chrome.storage.sync.set({ language, enabled, rate, pitch });
});

document.getElementById('toggle').addEventListener('click', () => {
  chrome.storage.sync.get('enabled', ({ enabled }) => {
    chrome.storage.sync.set({ enabled: !enabled });
  });
});

chrome.storage.sync.get(['language', 'enabled', 'rate', 'pitch'], ({ language, enabled, rate, pitch }) => {
  document.getElementById('language').value = language || 'ru';
  document.getElementById('enabled').checked = enabled || false;
  document.getElementById('rate').value = rate || 1.1;
  document.getElementById('pitch').value = pitch || 1.0;
});