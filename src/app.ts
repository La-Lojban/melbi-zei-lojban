import { FONTS, AppState } from './types';
import { renderToCanvas } from './renderer';

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

  // Initialize UI components
  // Populate font selector
  FONTS.forEach((f) => {
    const option = document.createElement('option');
    option.value = f.value;
    option.textContent = f.name;
    fontSelect.appendChild(option);
  });
  
  // Set initial values
  textInput.value = state.text;
  fontSelect.value = state.family;
  sizeSlider.value = state.size.toString();
  if (sizeValueDisplay) sizeValueDisplay.textContent = `${state.size}px`;
  
  applyTheme(state.theme);

  // Event Listeners
  textInput.addEventListener('input', (e) => {
    state.text = (e.target as HTMLInputElement).value;
    triggerRender();
  });

  sampleTextBtn?.addEventListener('click', () => {
    state.text = 'coi ro do ma nuzba';
    textInput.value = state.text;
    triggerRender();
  });

  fontSelect.addEventListener('change', (e) => {
    state.family = (e.target as HTMLSelectElement).value;
    triggerRender();
  });

  sizeSlider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    state.size = val;
    if (sizeValueDisplay) sizeValueDisplay.textContent = `${val}px`;
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
