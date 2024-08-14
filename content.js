let videoPlayer = document.querySelector('video');
let observer;
let subtitles = [];
let isSpeaking = false;
let speechQueue = [];
let selectedVoice;
let language = 'ru';
function processSpeechQueue() {
  if (speechQueue.length === 0) {
    isSpeaking = false;
    return;
  }

  let nextText = speechQueue.shift();

  // Удаляем технические символы и лишние пробелы
  nextText = nextText.replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();

  if (nextText.length === 0) {
    processSpeechQueue();
    return;
  }

  let speechInstance = new SpeechSynthesisUtterance(nextText);
  speechInstance.voice = selectedVoice;
  speechInstance.lang = language;
  speechInstance.rate = 1.1; // Немного снизим скорость для более естественного звучания
  speechInstance.pitch = 1.0;

  // Добавим небольшую паузу между фразами
  speechInstance.onstart = () => {
    isSpeaking = true;
    videoPlayer.volume = 0.3;
  };

  speechInstance.onend = () => {
    isSpeaking = false;
    videoPlayer.volume = 1.0;
    setTimeout(processSpeechQueue, 100); // Небольшая пауза между фразами
  };

  speechSynthesis.speak(speechInstance);
}
function setVoiceSettings() {
  const voices = window.speechSynthesis.getVoices();
  selectedVoice = voices.find(voice => voice.lang.startsWith(language) && voice.name.includes('Natural')) ||
    voices.find(voice => voice.lang.startsWith(language)) ||
    voices[0];
}

// Обновим функцию initVoices
function initVoices() {
  setVoiceSettings();
  window.speechSynthesis.onvoiceschanged = setVoiceSettings;
}
function initVoices() {
  const voices = window.speechSynthesis.getVoices();
  selectedVoice = voices.find(voice => voice.lang.startsWith(language)) || voices[0];
}

window.speechSynthesis.onvoiceschanged = initVoices;

chrome.storage.sync.get(['language', 'enabled'], ({ language: storedLanguage, enabled }) => {
  if (storedLanguage) language = storedLanguage;
  initVoices();
  if (enabled) {
    startObserving();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.language) {
    language = changes.language.newValue;
    initVoices();
  }
  if (changes.enabled) {
    changes.enabled.newValue ? startObserving() : stopObserving();
  }
});

function startObserving() {
  const subtitleContainer = document.querySelector('.ytp-caption-window-container');
  if (subtitleContainer) {
    observer = new MutationObserver(handleMutations);
    observer.observe(subtitleContainer, { childList: true, subtree: true });
  }
}

function stopObserving() {
  if (observer) {
    observer.disconnect();
  }
  speechSynthesis.cancel();
  isSpeaking = false;
  speechQueue = [];
}

function handleMutations(mutations) {
  mutations.forEach(mutation => {
    const textContent = mutation.target.innerText.trim();
    if (textContent && !subtitles.includes(textContent)) {
      subtitles.push(textContent);
      queueSpeech(textContent);
    }
  });
}

function queueSpeech(text) {
  speechQueue.push(text);
  if (!isSpeaking) {
    processSpeechQueue();
  }
}

function processSpeechQueue() {
  if (speechQueue.length === 0) {
    isSpeaking = false;
    return;
  }

  const nextText = speechQueue.shift();
  let speechInstance = new SpeechSynthesisUtterance(nextText);
  speechInstance.voice = selectedVoice;
  speechInstance.lang = language;
  speechInstance.rate = 1.2;
  speechInstance.pitch = 1.0;

  speechInstance.onstart = () => {
    isSpeaking = true;
    videoPlayer.volume = 0.3;
  };

  speechInstance.onend = () => {
    isSpeaking = false;
    videoPlayer.volume = 1.0;
    processSpeechQueue();
  };

  speechSynthesis.speak(speechInstance);
}

videoPlayer.addEventListener('pause', () => {
  speechSynthesis.pause();
});

videoPlayer.addEventListener('play', () => {
  speechSynthesis.resume();
});

videoPlayer.addEventListener('seeked', () => {
  speechSynthesis.cancel();
  isSpeaking = false;
  speechQueue = [];
});
let rate = 1.1;
let pitch = 1.0;

chrome.storage.sync.get(['language', 'enabled', 'rate', 'pitch'], ({ language: storedLanguage, enabled, storedRate, storedPitch }) => {
  if (storedLanguage) language = storedLanguage;
  if (storedRate) rate = storedRate;
  if (storedPitch) pitch = storedPitch;
  initVoices();
  if (enabled) {
    startObserving();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.language) {
    language = changes.language.newValue;
    initVoices();
  }
  if (changes.enabled) {
    changes.enabled.newValue ? startObserving() : stopObserving();
  }
  if (changes.rate) {
    rate = changes.rate.newValue;
  }
  if (changes.pitch) {
    pitch = changes.pitch.newValue;
  }
});

// В функции processSpeechQueue:
speechInstance.rate = rate;
speechInstance.pitch = pitch;