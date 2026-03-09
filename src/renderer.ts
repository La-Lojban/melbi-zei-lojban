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
  // container has p-4 (16px each side = 32px total); subtract padding so text fits exactly
  const containerPadding = 32;
  const containerWidth = container?.clientWidth ?? 300;
  const w = Math.max(containerWidth - containerPadding, 100);

  const isMobile = containerWidth <= 640;
  // On mobile: use a taller canvas (min height from viewport) so we can center and scale text
  const mobileMinHeight =
    isMobile ? Math.min(Math.round(window.innerHeight * 0.4), 360) : 0;

  // Small uniform padding above/below the text block (in logical px)
  let vPadding = Math.round(size * 0.3);

  const w_ = w * ratio;
  const scratchH = 4000 * ratio;
  canvas.width = w_;
  canvas.height = scratchH;
  canvas.style.width = `${w}px`;

  const processedText = preprocess({ text: (text || '').trim(), font: family });

  // Measure pass: get text block height at current size
  let { height: contentHeight } = canvasTxt.drawText(
    ctx,
    processedText,
    0,
    vPadding * ratio,
    w_,
    scratchH
  );

  let finalHeight = Math.max(contentHeight + vPadding * 2, 40);
  let drawSize = size;
  let useMiddle = false;

  if (isMobile && mobileMinHeight > 0 && finalHeight < mobileMinHeight) {
    finalHeight = mobileMinHeight;
    const targetContent = finalHeight * 0.9 - vPadding * 2;
    if (targetContent > contentHeight && contentHeight > 0) {
      const scale = Math.min(targetContent / contentHeight, 2);
      drawSize = Math.min(Math.round(size * scale), 200);
      drawSize = Math.max(drawSize, size);
      canvasTxt.fontSize = drawSize;
      canvasTxt.lineHeight = (fontDef.line || 1.2) * drawSize;
      vPadding = Math.round(drawSize * 0.3);
      const measureAgain = canvasTxt.drawText(
        ctx,
        processedText,
        0,
        vPadding * ratio,
        w_,
        scratchH
      );
      contentHeight = measureAgain.height;
    }
    useMiddle = true;
    canvasTxt.vAlign = 'middle';
  } else {
    canvasTxt.vAlign = 'top';
  }

  const finalHeight_ = Math.round(finalHeight * ratio);

  canvas.height = finalHeight_;
  canvas.style.height = `${finalHeight}px`;

  ctx.clearRect(0, 0, w_, finalHeight_);

  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, w_, finalHeight_);
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = 'black';
  if (useMiddle) {
    canvasTxt.drawText(ctx, processedText, 0, 0, w_, finalHeight_);
  } else {
    canvasTxt.drawText(ctx, processedText, 0, vPadding * ratio, w_, finalHeight_);
  }

  // Restore canvas-txt for next render (size/lineHeight set below on each call anyway)
  canvasTxt.fontSize = size;
  canvasTxt.lineHeight = (fontDef.line || 1.2) * size;
  canvasTxt.vAlign = 'top';

  // Update image
  image.src = canvas.toDataURL('image/webp', 1.0);
  image.style.width = `${w}px`;
  image.style.height = `${finalHeight}px`;

  // Hide skeleton and show image
  skeleton?.classList.add('hidden');
  image.classList.remove('hidden');
}
