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

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options: RenderOptions
): Promise<void> {
  const { text, size, family, fonts } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const skeleton = document.getElementById('skeleton-div');
  
  // Only show skeleton if image is currently empty or it's the first render
  // to avoid flickering on subsequent font/text changes
  const isInitialLoad = !image.src || image.src === window.location.href || image.src.length < 100;
  
  if (isInitialLoad) {
    skeleton?.classList.remove('hidden');
    image.classList.add('hidden');
  }

  // Load font if not cached
  await loadFont(family);

  const fontDef = fonts.find((f) => f.value === family) || fonts[0];
  
  // Set canvas-txt properties
  canvasTxt.lineHeight = (fontDef.line || 1.2) * size;
  canvasTxt.fontSize = size;
  canvasTxt.font = family;
  canvasTxt.vAlign = 'top';
  canvasTxt.align = 'center';

  const ratio = window.devicePixelRatio || 1;
  const container = document.getElementById('render-container');
  const w = (container?.clientWidth || 300) - 20;
  
  // Initial height
  let h = 100;

  const w_ = w * ratio;
  const h_ = h * ratio;

  canvas.width = w_;
  canvas.height = h_;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const processedText = preprocess({ text: (text || '').trim(), font: family });

  // First pass to get height
  const { height } = canvasTxt.drawText(ctx, processedText, 0, size / 3, w_, h_);

  // Adjust height and redraw
  const finalHeight = Math.max(height + (size * 2) / 3, 50);
  const finalHeight_ = finalHeight * ratio;

  canvas.height = finalHeight_;
  canvas.style.height = `${finalHeight}px`;
  
  // Redraw with correct height
  ctx.clearRect(0, 0, w_, finalHeight_);
  
  // Draw background (white)
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w_, finalHeight_);
  ctx.globalCompositeOperation = 'source-over';

  // Fill text
  ctx.fillStyle = 'black'; // Text is always black on white canvas for export
  canvasTxt.drawText(ctx, processedText, 0, size / 3, w_, finalHeight_);

  // Update image
  image.src = canvas.toDataURL('image/webp', 1.0);
  image.style.width = `${w}px`;
  image.style.height = `${finalHeight}px`;

  // Hide skeleton and show image
  skeleton?.classList.add('hidden');
  image.classList.remove('hidden');
}
