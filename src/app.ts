import { FONTS, AppState } from './types';
import { renderToCanvas } from './renderer';

const STORAGE_KEY = 'melbi-zei-lojban-state';
const URL_PARAM_TEXT = 'text';
const URL_PARAM_FONT = 'font';
const URL_PARAM_SIZE = 'size';
const SIZE_MIN = 20;
const SIZE_MAX = 200;
const validFontValues = new Set(FONTS.map((f) => f.value));

function getStateFromURL(): Partial<Pick<AppState, 'text' | 'family' | 'size'>> {
  const params = new URLSearchParams(window.location.search);
  const out: Partial<Pick<AppState, 'text' | 'family' | 'size'>> = {};
  const text = params.get(URL_PARAM_TEXT);
  if (text != null) {
    try {
      out.text = decodeURIComponent(text);
    } catch {
      out.text = text;
    }
  }
  const font = params.get(URL_PARAM_FONT);
  if (font != null && validFontValues.has(font)) out.family = font;
  const sizeParam = params.get(URL_PARAM_SIZE);
  if (sizeParam != null) {
    const n = parseInt(sizeParam, 10);
    if (!Number.isNaN(n) && n >= SIZE_MIN && n <= SIZE_MAX) out.size = n;
  }
  return out;
}

function getStateFromStorage(): Partial<Pick<AppState, 'text' | 'family' | 'size'>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Pick<AppState, 'text' | 'family' | 'size'>> = {};
    if (typeof parsed.text === 'string') out.text = parsed.text;
    if (typeof parsed.family === 'string' && validFontValues.has(parsed.family)) out.family = parsed.family;
    if (typeof parsed.size === 'number' && parsed.size >= SIZE_MIN && parsed.size <= SIZE_MAX) out.size = parsed.size;
    return out;
  } catch {
    return {};
  }
}

function saveStateToStorage(state: Pick<AppState, 'text' | 'family' | 'size'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      text: state.text,
      family: state.family,
      size: state.size,
    }));
  } catch {
    // ignore quota or disabled storage
  }
}

function pushStateToURL(state: Pick<AppState, 'text' | 'family' | 'size'>): void {
  const params = new URLSearchParams(window.location.search);
  if (state.text) params.set(URL_PARAM_TEXT, state.text);
  else params.delete(URL_PARAM_TEXT);
  params.set(URL_PARAM_FONT, state.family);
  params.set(URL_PARAM_SIZE, String(state.size));
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({ melbiZei: true }, '', url);
}

function mergeInitialState(
  url: Partial<Pick<AppState, 'text' | 'family' | 'size'>>,
  storage: Partial<Pick<AppState, 'text' | 'family' | 'size'>>,
  defaults: Pick<AppState, 'text' | 'family' | 'size'>
): Pick<AppState, 'text' | 'family' | 'size'> {
  return {
    text: url.text ?? storage.text ?? defaults.text,
    family: url.family ?? storage.family ?? defaults.family,
    size: url.size ?? storage.size ?? defaults.size,
  };
}

const state: AppState = {
  text: '',
  size: 50,
  family: 'emoji',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
};

export function initApp(): void {
  const textInput = document.getElementById('text-input') as HTMLInputElement;
  const sampleTextBtn = document.getElementById('sample-text-btn');
  const fontSelect = document.getElementById('font-select') as HTMLSelectElement;
  const sizeSlider = document.getElementById('size-slider') as HTMLInputElement;
  const sizeValueDisplay = document.getElementById('size-value');
  const themeToggle = document.getElementById('theme-toggle');
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  const image = document.getElementById('result-image') as HTMLImageElement;

  // Initialize UI: populate font selector
  FONTS.forEach((f) => {
    const option = document.createElement('option');
    option.value = f.value;
    option.textContent = f.name;
    fontSelect.appendChild(option);
  });

  // Load state: URL params override localStorage, then defaults (so shared links work)
  const urlState = getStateFromURL();
  const storageState = getStateFromStorage();
  const defaults = { text: '', family: 'emoji', size: 50 };
  const initial = mergeInitialState(urlState, storageState, defaults);
  state.text = initial.text;
  state.family = initial.family;
  state.size = initial.size;

  // Apply to DOM and sync URL + storage so they match initial state
  textInput.value = state.text;
  fontSelect.value = state.family;
  sizeSlider.value = state.size.toString();
  if (sizeValueDisplay) sizeValueDisplay.textContent = `${state.size}px`;
  pushStateToURL(state);
  saveStateToStorage(state);

  applyTheme(state.theme);

  // Persist state to URL and localStorage (debounced for text to avoid spam)
  let persistTimeout: number | null = null;
  function schedulePersist() {
    if (persistTimeout) window.clearTimeout(persistTimeout);
    persistTimeout = window.setTimeout(() => {
      persistTimeout = null;
      pushStateToURL(state);
      saveStateToStorage(state);
    }, 400);
  }
  function persistImmediate() {
    if (persistTimeout) {
      window.clearTimeout(persistTimeout);
      persistTimeout = null;
    }
    pushStateToURL(state);
    saveStateToStorage(state);
  }

  // Event Listeners
  textInput.addEventListener('input', (e) => {
    state.text = (e.target as HTMLInputElement).value;
    triggerRender();
    schedulePersist();
  });

  sampleTextBtn?.addEventListener('click', () => {
    state.text = 'coi ro do ma nuzba';
    textInput.value = state.text;
    triggerRender();
    schedulePersist();
  });

  fontSelect.addEventListener('change', (e) => {
    state.family = (e.target as HTMLSelectElement).value;
    triggerRender();
    persistImmediate();
  });

  sizeSlider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    state.size = val;
    if (sizeValueDisplay) sizeValueDisplay.textContent = `${val}px`;
    triggerRender();
    persistImmediate();
  });

  // Back/forward: restore state from URL and re-render
  window.addEventListener('popstate', () => {
    const urlState = getStateFromURL();
    if (urlState.text !== undefined) state.text = urlState.text;
    if (urlState.family !== undefined) state.family = urlState.family;
    if (urlState.size !== undefined) state.size = urlState.size;
    textInput.value = state.text;
    fontSelect.value = state.family;
    sizeSlider.value = state.size.toString();
    if (sizeValueDisplay) sizeValueDisplay.textContent = `${state.size}px`;
    saveStateToStorage(state);
    triggerRender();
  });

  themeToggle?.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
  });

  // Initial render
  setTimeout(() => triggerRender(), 500);

  let renderTimeout: number | null = null;
  function triggerRender() {
    if (renderTimeout) window.clearTimeout(renderTimeout);
    renderTimeout = window.setTimeout(async () => {
      await renderToCanvas(canvas, image, {
        text: state.text,
        size: state.size,
        family: state.family,
        fonts: FONTS
      });
    }, 100);
  }
}

function applyTheme(theme: 'light' | 'dark'): void {
  const html = document.documentElement;
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  
  if (theme === 'dark') {
    html.classList.add('dark');
    lightIcon?.classList.add('hidden');
    darkIcon?.classList.remove('hidden');
  } else {
    html.classList.remove('dark');
    lightIcon?.classList.remove('hidden');
    darkIcon?.classList.add('hidden');
  }
}
