import canvasTxt from './canvas-txt';
import { preprocess } from './lojban-utils';
import { FontDef } from './types';
import { loadFont } from './font-loader';

interface RenderOptions {
  text: string;
  size: number;
  family: string;
  fonts: FontDef[];
}

// A slow font download must not overwrite a more recent text/size change.
const renderVersions = new WeakMap<HTMLCanvasElement, number>();

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options: RenderOptions
): Promise<void> {
  const version = (renderVersions.get(canvas) ?? 0) + 1;
  renderVersions.set(canvas, version);
  const { text, size, family, fonts } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const skeleton = document.getElementById('skeleton-div');

  // Keep the previous image visible while the next font loads.
  const isInitialLoad = !image.src || image.src === window.location.href || image.src.length < 100;
  if (isInitialLoad) {
    skeleton?.classList.remove('hidden');
    image.classList.add('hidden');
  }

  await loadFont(family);
  if (renderVersions.get(canvas) !== version) return;

  const fontDef = fonts.find((f) => f.value === family) || fonts[0];
  canvasTxt.lineHeight = (fontDef.line || 1.2) * size;
  canvasTxt.fontSize = size;
  canvasTxt.font = family;
  canvasTxt.vAlign = 'top';
  canvasTxt.align = 'center';

  const ratio = window.devicePixelRatio || 1;
  const container = document.getElementById('render-container');
  const containerStyle = container ? getComputedStyle(container) : null;
  const horizontalPadding = containerStyle
    ? parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight)
    : 32;
  const width = Math.max((container?.clientWidth ?? 300) - horizontalPadding, 1);
  const padding = Math.round(size * 0.3);
  const processedText = preprocess({ text: (text || '').trim(), font: family });

  // Measure and wrap in CSS pixels. Only the backing bitmap uses device pixels;
  // mixing the two made high-DPI previews much taller than the visible text.
  canvas.width = Math.ceil(width * ratio);
  canvas.height = 1;
  ctx.direction = family === 'brolermorna' ? 'rtl' : 'ltr';
  const { height: contentHeight } = canvasTxt.drawText(
    ctx, processedText, 0, padding, width, 1
  );
  const height = Math.max(Math.ceil(contentHeight + padding * 2), 40);

  canvas.height = Math.ceil(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);
  ctx.direction = family === 'brolermorna' ? 'rtl' : 'ltr';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'black';
  canvasTxt.drawText(ctx, processedText, 0, padding, width, height);

  image.src = canvas.toDataURL('image/webp', 1.0);
  image.style.width = `${width}px`;
  image.style.height = 'auto';

  skeleton?.classList.add('hidden');
  image.classList.remove('hidden');
}
