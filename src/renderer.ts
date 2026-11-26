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
  canvasTxt.lineHeight = Math.max(fontDef.line || 1.2, 1.35) * size;
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
  const padding = Math.max(16, Math.round(size * 0.5));
  const processedText = preprocess({ text: text || '', font: family });

  if (family === 'mongolian') {
    renderMongolian(ctx, canvas, processedText, width, size, padding, ratio);
    image.src = canvas.toDataURL('image/webp', 1.0);
    image.style.width = canvas.style.width;
    image.style.height = 'auto';
    skeleton?.classList.add('hidden');
    image.classList.remove('hidden');
    return;
  }

  // Measure and wrap in CSS pixels. Only the backing bitmap uses device pixels;
  // mixing the two made high-DPI previews much taller than the visible text.
  canvas.width = Math.ceil(width * ratio);
  canvas.height = 1;
  ctx.direction = family === 'brolermorna' ? 'rtl' : 'ltr';
  const { height: contentHeight } = canvasTxt.drawText(
    ctx, processedText, padding, padding, Math.max(1, width - 2 * padding), 1
  );
  const height = Math.max(Math.ceil(contentHeight + padding * 2), 40);

  canvas.height = Math.ceil(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);
  ctx.direction = family === 'brolermorna' ? 'rtl' : 'ltr';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  applyInkStyle(ctx, size);
  canvasTxt.drawText(ctx, processedText, padding, padding, Math.max(1, width - 2 * padding), height);

  image.src = canvas.toDataURL('image/webp', 1.0);
  image.style.width = `${width}px`;
  image.style.height = 'auto';

  skeleton?.classList.add('hidden');
  image.classList.remove('hidden');
}

// Mongolian fonts shape in logical text order. Rotate each complete line so
// shaping remains intact, and place columns from left to right.
function renderMongolian(
  ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string,
  width: number, size: number, padding: number, ratio: number
): void {
  ctx.font = `${size}px "mongolian"`;
  const limit = Math.max(size * 2, 600 - 2 * padding);
  const columns: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const part of paragraph.match(/\S+\s*|\s+/gu) ?? []) {
      if (line && ctx.measureText(line + part).width > limit) {
        columns.push(line);
        line = '';
      }
      // Break unusually long words only when necessary.
      for (const ch of Array.from(part)) {
        if (line && ctx.measureText(line + ch).width > limit) {
          columns.push(line);
          line = '';
        }
        line += ch;
      }
    }
    columns.push(line);
  }
  const lineStep = size * 1.5;
  const contentWidth = columns.length * lineStep;
  const actualWidth = Math.max(width, Math.ceil(contentWidth + 2 * padding));
  const contentHeight = Math.max(0, ...columns.map((line) => ctx.measureText(line).width));
  const height = Math.max(40, Math.ceil(contentHeight + 2 * padding));
  canvas.width = Math.ceil(actualWidth * ratio);
  canvas.height = Math.ceil(height * ratio);
  canvas.style.width = `${actualWidth}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, actualWidth, height);
  applyInkStyle(ctx, size);
  ctx.font = `${size}px "mongolian"`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const start = (actualWidth - contentWidth) / 2 + lineStep / 2;
  columns.forEach((line, i) => {
    ctx.save();
    ctx.translate(start + i * lineStep, padding);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
}

// A soft, close shadow adds depth without obscuring small marks or changing
// the script's shapes. Set this after resizing the canvas, which resets state.
function applyInkStyle(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = '#20262b';
  ctx.shadowColor = 'rgba(28, 35, 40, 0.18)';
  ctx.shadowBlur = Math.max(1, size * 0.035);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(0.5, size * 0.025);
}
