const NAME_KEY = 'newtab_name';

// --- onboarding ---

(function () {
  const onboarding = document.getElementById('onboarding');
  const input = document.getElementById('onboarding-input');

  if (localStorage.getItem(NAME_KEY)) {
    onboarding.classList.add('hidden');
    return;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = input.value.trim();
      if (!name) return;
      localStorage.setItem(NAME_KEY, name);
      onboarding.classList.add('done');
      setTimeout(() => onboarding.classList.add('hidden'), 500);
    }
  });
})();

const DEFAULT_LINKS = [
  { name: 'github', url: 'https://github.com', icon: 'github-logo' },
  { name: 'youtube', url: 'https://youtube.com', icon: 'youtube-logo' },
  { name: 'reddit', url: 'https://reddit.com', icon: 'reddit-logo' },
];

const STORAGE_KEY = 'newtab_links';

const ALL_ICONS = [
  'github-logo','youtube-logo','reddit-logo','discord-logo','twitch-logo',
  'twitter-logo','linkedin-logo','slack-logo','facebook-logo','snapchat-logo',
  'instagram-logo','tiktok-logo','pinterest-logo','dribbble-logo','figma-logo',
  'spotify-logo','apple-logo','google-logo','amazon-logo','steam-logo',
  'paypal-logo','stripe-logo',
  'globe','house','bookmark','link','compass','magnifying-glass','map-pin',
  'envelope','chat-circle','phone','bell','megaphone','paper-plane-tilt',
  'music-note','play-circle','video-camera','camera','image','microphone','headphones',
  'terminal','code','brackets-curly','database','git-branch','bug','robot',
  'cpu','monitor','desktop','command',
  'calendar','check-circle','clock','note','notepad','list-checks',
  'clipboard-text','kanban','target','chart-line','chart-bar','presentation',
  'folder','file','cloud','download','upload','hard-drive','archive',
  'user','users','heart','star','hand-waving','smiley',
  'shopping-cart','credit-card','wallet','currency-dollar','receipt','storefront','tag',
  'gear','lightning','lock','shield','key','fire','leaf','sun','moon',
  'rocket','airplane','car','train','bicycle','game-controller','paint-brush',
  'book','graduation-cap','trophy','flag','cube','eye','wrench',
  'newspaper','radio','broadcast','wifi','bluetooth','battery',
  'flask','atom','plant','tree','mountains','wave-triangle',
  'book-open','notepad',
];

// --- icon auto-detect for new links ---

const ICON_MAP = {
  'github.com': 'github-logo', 'youtube.com': 'youtube-logo',
  'reddit.com': 'reddit-logo', 'discord.com': 'discord-logo',
  'discord.gg': 'discord-logo', 'twitch.tv': 'twitch-logo',
  'twitter.com': 'twitter-logo', 'x.com': 'twitter-logo',
  'linkedin.com': 'linkedin-logo', 'slack.com': 'slack-logo',
  'facebook.com': 'facebook-logo', 'snapchat.com': 'snapchat-logo',
  'instagram.com': 'instagram-logo', 'tiktok.com': 'tiktok-logo',
  'spotify.com': 'spotify-logo', 'open.spotify.com': 'spotify-logo',
  'store.steampowered.com': 'steam-logo', 'steam.com': 'steam-logo',
  'mail.google.com': 'envelope', 'gmail.com': 'envelope',
  'outlook.com': 'envelope', 'hey.com': 'envelope', 'app.hey.com': 'envelope',
  'news.ycombinator.com': 'code', 'stackoverflow.com': 'code',
  'localhost': 'terminal', 'maps.google.com': 'map-pin',
  'drive.google.com': 'cloud', 'dropbox.com': 'cloud',
  'chatgpt.com': 'chat-circle', 'claude.ai': 'chat-circle',
  'figma.com': 'figma-logo', 'dribbble.com': 'dribbble-logo',
  'pinterest.com': 'pinterest-logo',
};

function guessIconForUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (ICON_MAP[hostname]) return ICON_MAP[hostname];
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const parent = parts.slice(-2).join('.');
      if (ICON_MAP[parent]) return ICON_MAP[parent];
    }
  } catch { /* ignore */ }
  return 'globe';
}

// --- clock & greeting ---

function getName() {
  return localStorage.getItem(NAME_KEY) || '';
}

function getGreeting() {
  const name = getName();
  const h = new Date().getHours();
  const d = new Date().getDay();

  // early morning 4-6
  if (h >= 4 && h < 6) {
    const opts = [
      `you're up early, ${name}`,
      `early bird, ${name}`,
      `couldn't sleep, ${name}?`,
      `the quiet hours, ${name}`,
    ];
    return opts[d % opts.length];
  }
  // morning 6-12
  if (h >= 6 && h < 12) {
    const opts = [
      `good morning, ${name}`,
      `morning, ${name}`,
      `rise and shine, ${name}`,
      `fresh start, ${name}`,
      `let's go, ${name}`,
    ];
    return opts[d % opts.length];
  }
  // afternoon 12-17
  if (h >= 12 && h < 17) {
    const opts = [
      `good afternoon, ${name}`,
      `afternoon, ${name}`,
      `hope it's a good one, ${name}`,
      `keeping at it, ${name}`,
    ];
    return opts[d % opts.length];
  }
  // evening 17-21
  if (h >= 17 && h < 21) {
    const opts = [
      `good evening, ${name}`,
      `evening, ${name}`,
      `winding down, ${name}?`,
      `hope today was good, ${name}`,
    ];
    return opts[d % opts.length];
  }
  // night 21-4
  const opts = [
    `still going, ${name}?`,
    `late night, ${name}`,
    `burning the midnight oil, ${name}`,
    `don't stay up too late, ${name}`,
    `goodnight soon, ${name}`,
  ];
  return opts[d % opts.length];
}

function formatTime() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return { time: `${h}:${m}`, period };
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function updateTime() {
  document.getElementById('greeting').textContent = getGreeting();
  const { time, period } = formatTime();
  const clock = document.getElementById('clock');
  clock.textContent = time;
  const sup = document.createElement('span');
  sup.className = 'period';
  sup.textContent = period;
  clock.appendChild(sup);
  document.getElementById('date').textContent = formatDate();
}

updateTime();
setInterval(updateTime, 1000);

// --- links ---

function loadLinks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const links = JSON.parse(raw);
      // migrate old links without icon field
      return links.map(l => ({ ...l, icon: l.icon || guessIconForUrl(l.url) }));
    } catch { /* ignore */ }
  }
  return DEFAULT_LINKS;
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function renderLinks() {
  const container = document.getElementById('links');
  while (container.firstChild) container.removeChild(container.firstChild);
  const links = loadLinks();
  links.forEach(({ name, url, icon }) => {
    const a = document.createElement('a');
    a.href = url;

    const img = document.createElement('img');
    img.src = `icons/${icon}-fill.svg`;
    img.className = 'link-icon';
    img.alt = '';

    const label = document.createElement('span');
    label.textContent = name;

    a.appendChild(img);
    a.appendChild(label);
    container.appendChild(a);
  });
}

renderLinks();

// --- icon picker ---

let activePicker = null;

function closePicker() {
  if (activePicker) {
    activePicker.remove();
    activePicker = null;
  }
}

function openPicker(iconBtn, row) {
  closePicker();

  const picker = document.createElement('div');
  picker.className = 'icon-picker';

  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'icon-picker-search';
  search.placeholder = 'search icons...';
  picker.appendChild(search);

  const grid = document.createElement('div');
  grid.className = 'icon-picker-grid';
  picker.appendChild(grid);

  function renderIcons(filter) {
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    const filtered = filter
      ? ALL_ICONS.filter(i => i.replace(/-/g, ' ').includes(filter.toLowerCase()))
      : ALL_ICONS;
    filtered.forEach(iconName => {
      const btn = document.createElement('button');
      btn.className = 'icon-picker-item';
      btn.title = iconName.replace(/-/g, ' ');
      const img = document.createElement('img');
      img.src = `icons/${iconName}-fill.svg`;
      img.alt = '';
      btn.appendChild(img);
      btn.addEventListener('click', () => {
        row.dataset.icon = iconName;
        const preview = iconBtn.querySelector('img');
        preview.src = `icons/${iconName}-fill.svg`;
        closePicker();
        saveFromEditor();
        renderLinks();
      });
      grid.appendChild(btn);
    });
  }

  renderIcons('');
  search.addEventListener('input', () => renderIcons(search.value));

  document.body.appendChild(picker);
  activePicker = picker;

  // position near the button
  const rect = iconBtn.getBoundingClientRect();
  picker.style.top = Math.min(rect.top, window.innerHeight - picker.offsetHeight - 8) + 'px';
  picker.style.left = Math.max(8, rect.left - picker.offsetWidth - 8) + 'px';

  search.focus();

  // close on outside click (next tick)
  setTimeout(() => {
    const onClickOutside = (e) => {
      if (!picker.contains(e.target)) {
        closePicker();
        document.removeEventListener('click', onClickOutside);
      }
    };
    document.addEventListener('click', onClickOutside);
  }, 0);
}

// --- editor ---

const editor = document.getElementById('editor');
const editorList = document.getElementById('editor-list');
const editToggle = document.getElementById('edit-toggle');
const editorClose = document.getElementById('editor-close');
const addLinkBtn = document.getElementById('add-link');

function openEditor() {
  closePicker();
  const links = loadLinks();
  while (editorList.firstChild) editorList.removeChild(editorList.firstChild);
  links.forEach((link) => addEditorRow(link.name, link.url, link.icon));
  editor.classList.remove('hidden');
}

function closeEditor() {
  closePicker();
  saveFromEditor();
  renderLinks();
  editor.classList.add('hidden');
}

function addEditorRow(name = '', url = '', icon = 'globe') {
  const row = document.createElement('div');
  row.className = 'editor-row';
  row.dataset.icon = icon;

  const iconBtn = document.createElement('button');
  iconBtn.className = 'editor-icon-btn';
  const iconImg = document.createElement('img');
  iconImg.src = `icons/${icon}-fill.svg`;
  iconImg.alt = '';
  iconBtn.appendChild(iconImg);
  iconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPicker(iconBtn, row);
  });

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'name-input';
  nameInput.placeholder = 'name';
  nameInput.value = name;

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.className = 'url-input';
  urlInput.placeholder = 'https://...';
  urlInput.value = url;

  // auto-detect icon when url changes (only if still default globe)
  urlInput.addEventListener('change', () => {
    if (row.dataset.icon === 'globe') {
      const guessed = guessIconForUrl(urlInput.value);
      row.dataset.icon = guessed;
      iconImg.src = `icons/${guessed}-fill.svg`;
    }
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-link';
  removeBtn.textContent = '\u00d7';
  removeBtn.addEventListener('click', () => {
    row.remove();
    saveFromEditor();
    renderLinks();
  });

  row.append(iconBtn, nameInput, urlInput, removeBtn);
  editorList.appendChild(row);
}

function saveFromEditor() {
  const rows = editorList.querySelectorAll('.editor-row');
  const links = [];
  rows.forEach(row => {
    const name = row.querySelector('.name-input').value.trim();
    const url = row.querySelector('.url-input').value.trim();
    const icon = row.dataset.icon || 'globe';
    if (name && url) {
      links.push({ name, url: url.startsWith('http') ? url : `https://${url}`, icon });
    }
  });
  saveLinks(links);
}

editToggle.addEventListener('click', openEditor);
editorClose.addEventListener('click', closeEditor);
addLinkBtn.addEventListener('click', () => addEditorRow());

// --- wave mode toggle ---

const waveModeBtns = document.querySelectorAll('.wave-mode-btn');
const savedWaveMode = localStorage.getItem('newtab_wave_mode') || 'vertical';

waveModeBtns.forEach(btn => {
  btn.classList.toggle('active', btn.dataset.mode === savedWaveMode);
  btn.addEventListener('click', () => {
    waveModeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    localStorage.setItem('newtab_wave_mode', btn.dataset.mode);
    if (typeof setWaveMode === 'function') setWaveMode(btn.dataset.mode);
  });
});

// --- background picker ---

const BG_KEY = 'newtab_bg';
const bgOptions = document.querySelectorAll('.bg-option');
const bgWatermark = document.getElementById('bg-watermark');
const savedBg = localStorage.getItem(BG_KEY) || 'none';

function applyBackground(bg) {
  while (bgWatermark.firstChild) bgWatermark.removeChild(bgWatermark.firstChild);
  if (bg === 'none') {
    bgWatermark.style.opacity = '0';
    document.body.style.backgroundColor = '#0a0a0a';
  } else {
    const img = document.createElement('img');
    img.src = `backgrounds/${bg}.jpg`;
    img.alt = '';
    bgWatermark.appendChild(img);
    bgWatermark.style.opacity = '';
    document.body.style.backgroundColor = '#000';
  }
}

applyBackground(savedBg);

bgOptions.forEach(btn => {
  btn.classList.toggle('active', btn.dataset.bg === savedBg);
  btn.addEventListener('click', () => {
    bgOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    localStorage.setItem(BG_KEY, btn.dataset.bg);
    applyBackground(btn.dataset.bg);
  });
});

document.addEventListener('click', (e) => {
  if (!editor.classList.contains('hidden') && !editor.contains(e.target) && e.target !== editToggle && !editToggle.contains(e.target)) {
    closeEditor();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (activePicker) {
      closePicker();
    } else if (!editor.classList.contains('hidden')) {
      closeEditor();
    } else if (historyPanel.classList.contains('open')) {
      historyPanel.classList.remove('open');
    }
  }
});

// --- history ---

const historyPanel = document.getElementById('history-panel');
const historyToggle = document.getElementById('history-toggle');
const historyList = document.getElementById('history-list');

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
  } catch { /* ignore */ }
  return null;
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function buildHistoryDOM(items) {
  while (historyList.firstChild) historyList.removeChild(historyList.firstChild);

  items.forEach(item => {
    const a = document.createElement('a');
    a.href = item.url;
    a.className = 'history-item';
    a.dataset.url = item.url;

    const ytId = getYouTubeId(item.url);

    if (ytId) {
      const thumb = document.createElement('img');
      thumb.className = 'history-thumb';
      thumb.src = `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`;
      thumb.alt = '';
      thumb.loading = 'lazy';
      a.appendChild(thumb);
    }

    const text = document.createElement('div');
    text.className = 'history-item-text';

    const title = document.createElement('span');
    title.className = 'history-item-title';
    title.textContent = item.title || item.url;
    text.appendChild(title);

    if (!ytId) {
      const url = document.createElement('span');
      url.className = 'history-item-url';
      try {
        url.textContent = new URL(item.url).hostname.replace(/^www\./, '');
      } catch {
        url.textContent = item.url;
      }
      text.appendChild(url);
    }

    a.appendChild(text);

    const time = document.createElement('span');
    time.className = 'history-item-time';
    time.textContent = timeAgo(item.lastVisitTime);
    a.appendChild(time);

    historyList.appendChild(a);
  });
}

function filterHistoryDOM(filter) {
  const items = historyList.querySelectorAll('.history-item');
  items.forEach(item => {
    const show = matchesFilter(item.dataset.url, filter);
    item.style.display = show ? '' : 'none';
  });
}

function loadHistory() {
  if (chrome && chrome.history) {
    chrome.history.search({
      text: '',
      maxResults: 80,
      startTime: Date.now() - (7 * 24 * 60 * 60 * 1000),
    }, (results) => {
      cachedHistory = results.filter(r =>
        r.url && !r.url.startsWith('chrome') && !r.url.startsWith('brave')
      );
      buildHistoryDOM(cachedHistory);
      filterHistoryDOM(currentFilter);
    });
  }
}

let currentFilter = 'all';
let cachedHistory = [];

const FILTER_DOMAINS = {
  youtube: ['youtube.com', 'youtu.be'],
  social: ['reddit.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'discord.com', 'snapchat.com', 'linkedin.com'],
  dev: ['github.com', 'gitlab.com', 'stackoverflow.com', 'stackexchange.com', 'npmjs.com', 'dev.to', 'medium.com', 'codepen.io'],
  news: ['news.ycombinator.com', 'techcrunch.com', 'theverge.com', 'arstechnica.com', 'bbc.com', 'cnn.com', 'reuters.com', 'nytimes.com'],
};

function matchesFilter(url, filter) {
  if (filter === 'all') return true;
  const domains = FILTER_DOMAINS[filter];
  if (!domains) return true;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return domains.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filter);
  });
  filterHistoryDOM(filter);
}

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => applyFilter(pill.dataset.filter));
});

historyToggle.addEventListener('click', () => {
  const isOpen = historyPanel.classList.toggle('open');
  if (isOpen) loadHistory();
});

