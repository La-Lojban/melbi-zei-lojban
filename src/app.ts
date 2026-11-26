import { FONTS, UTF_COPY_FONTS, AppState } from './types';
import { renderToCanvas } from './renderer';
import { preloadFontsInBackground } from './font-loader';
import { preprocess } from './lojban-utils';

const STORAGE_KEY = 'melbi-zei-lojban-state';
const URL_PARAM_TEXT = 'text';
const URL_PARAM_FONT = 'font';
const URL_PARAM_SIZE = 'size';
const SIZE_MIN = 20;
const SIZE_MAX = 200;
const validFontValues = new Set(FONTS.map((f) => f.value));

const SAMPLE_TEXTS: { label: string; text: string }[] = [
  { label: 'Greeting', text: 'coi ro do ma nuzba' },
  { label: 'Hungry cows', text: ".ii .o'i mu xagji sofybakni cu zvati le purdi" },
  { label: 'Rising glides', text: 'iu ui nai' },
  { label: 'Glides jammed', text: 'iuuinai' },
  { label: 'Cmevla + commas', text: "kuln,r,kore'a" },
  { label: 'Diphthongs', text: 'coi pei doi .ui' },
  { label: 'Brivla with y', text: "sofybakni simyzu'e" },
];

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
  const clearTextBtn = document.getElementById('clear-text-btn') as HTMLButtonElement | null;
  const sampleMenuBtn = document.getElementById('sample-menu-btn') as HTMLButtonElement | null;
  const sampleMenu = document.getElementById('sample-menu');
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
  function syncClearButton(): void {
    const hasText = textInput.value.length > 0;
    if (!clearTextBtn) return;
    clearTextBtn.classList.toggle('hidden', !hasText);
    clearTextBtn.classList.toggle('inline-flex', hasText);
  }

  function setText(next: string): void {
    state.text = next;
    textInput.value = next;
    syncClearButton();
    triggerRender();
    schedulePersist();
  }

  function closeSampleMenu(): void {
    sampleMenu?.classList.add('hidden');
    sampleMenuBtn?.setAttribute('aria-expanded', 'false');
  }

  if (sampleMenu) {
    sampleMenu.innerHTML = SAMPLE_TEXTS.map(
      ({ label, text }) =>
        `<button type="button" role="menuitem" data-sample=${JSON.stringify(text)} class="block w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700">
          <span class="block font-medium text-slate-800 dark:text-slate-100">${label}</span>
          <span class="mt-0.5 block truncate font-mono text-xs text-slate-500 dark:text-slate-400">${text.replace(/</g, '&lt;')}</span>
        </button>`
    ).join('');
  }

  textInput.addEventListener('input', (e) => {
    state.text = (e.target as HTMLInputElement).value;
    syncClearButton();
    triggerRender();
    schedulePersist();
  });

  clearTextBtn?.addEventListener('click', () => setText(''));

  sampleMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = sampleMenu?.classList.contains('hidden');
    if (open) {
      sampleMenu?.classList.remove('hidden');
      sampleMenuBtn.setAttribute('aria-expanded', 'true');
    } else {
      closeSampleMenu();
    }
  });

  sampleMenu?.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((item) => {
    item.addEventListener('click', () => {
      const text = item.dataset.sample ?? '';
      closeSampleMenu();
      setText(text);
    });
  });

  syncClearButton();

  fontSelect.addEventListener('change', (e) => {
    state.family = (e.target as HTMLSelectElement).value;
    syncCopyControls();
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

  const copyImageBtn = document.getElementById('copy-image-btn') as HTMLButtonElement | null;
  const copyMenuBtn = document.getElementById('copy-menu-btn') as HTMLButtonElement | null;
  const copyMenu = document.getElementById('copy-menu');
  const copyImageLabel = document.getElementById('copy-image-label');
  const copyMenuLabel = document.getElementById('copy-menu-label');

  function supportsTextCopy(family: string): boolean {
    return UTF_COPY_FONTS.has(family);
  }

  function syncCopyControls(): void {
    const utf = supportsTextCopy(state.family);
    // Don't leave both `hidden` and `inline-flex` on the same node — in
    // Tailwind they fight over `display` and `inline-flex` often wins.
    for (const [btn, show] of [
      [copyImageBtn, !utf],
      [copyMenuBtn, utf],
    ] as const) {
      if (!btn) continue;
      btn.classList.toggle('hidden', !show);
      btn.classList.toggle('inline-flex', show);
    }
    closeCopyMenu();
  }

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
    syncCopyControls();
    triggerRender();
  });

  themeToggle?.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
  });

  function closeCopyMenu(): void {
    copyMenu?.classList.add('hidden');
    copyMenuBtn?.setAttribute('aria-expanded', 'false');
  }

  function openCopyMenu(): void {
    copyMenu?.classList.remove('hidden');
    copyMenuBtn?.setAttribute('aria-expanded', 'true');
  }

  async function copyAsImage(): Promise<void> {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) throw new Error('Could not export canvas');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }

  async function copyAsText(): Promise<void> {
    const converted = preprocess({
      text: state.text || '',
      font: state.family,
    });
    await navigator.clipboard.writeText(converted);
  }

  function flashCopyLabel(ok: boolean): void {
    const utf = supportsTextCopy(state.family);
    const label = utf ? copyMenuLabel : copyImageLabel;
    if (!label) return;
    const idle = utf ? 'Copy' : 'Copy as image';
    label.textContent = ok ? 'Copied!' : 'Copy failed';
    window.setTimeout(() => {
      label.textContent = idle;
    }, 1500);
  }

  copyImageBtn?.addEventListener('click', async () => {
    try {
      await copyAsImage();
      flashCopyLabel(true);
    } catch {
      flashCopyLabel(false);
    }
  });

  copyMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (copyMenu?.classList.contains('hidden')) openCopyMenu();
    else closeCopyMenu();
  });

  copyMenu?.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((item) => {
    item.addEventListener('click', async () => {
      const mode = item.dataset.copy;
      closeCopyMenu();
      try {
        if (mode === 'text') await copyAsText();
        else await copyAsImage();
        flashCopyLabel(true);
      } catch {
        flashCopyLabel(false);
      }
    });
  });

  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    const copyWrap = document.getElementById('copy-controls');
    const sampleWrap = document.getElementById('sample-controls');
    if (copyWrap && !copyWrap.contains(target)) closeCopyMenu();
    if (sampleWrap && !sampleWrap.contains(target)) closeSampleMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCopyMenu();
      closeSampleMenu();
    }
  });

  syncCopyControls();

  // Re-wrap after a viewport resize or phone rotation, including when the
  // preview was previously rendered at a much narrower width.
  const container = document.getElementById('render-container');
  if (container) {
    let previousWidth = container.clientWidth;
    new ResizeObserver(() => {
      const width = container.clientWidth;
      if (width !== previousWidth) {
        previousWidth = width;
        triggerRender();
      }
    }).observe(container);
  }

  // Initial render, then warm the other faces one at a time.
  setTimeout(() => {
    triggerRender();
    preloadFontsInBackground(state.family);
  }, 500);

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
