const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

interface Line {
  text: string;
  x: number;
  y: number;
}

interface Layout {
  lines: Line[];
  width: number;
  height: number;
  size: number;
  font: string;
}

function wrap(
  text: string,
  limit: number,
  width: (text: string) => number,
  breakWords: boolean,
): string[] | null {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r\n?|\n/)) {
    let line = '';
    let previousEnd = 0;
    for (const { 0: word, index } of paragraph.matchAll(/\S+/gu)) {
      const gap = line ? paragraph.slice(previousEnd, index) : '';
      previousEnd = index + word.length;
      if (line && width(line + gap + word) <= limit) {
        line += gap + word;
        continue;
      }
      if (line) lines.push(line);
      if (width(word) <= limit) {
        line = word;
        continue;
      }
      if (!breakWords) return null;

      line = '';
      for (const { segment } of graphemes.segment(word)) {
        if (line && width(line + segment) > limit) {
          lines.push(line);
          line = '';
        }
        line += segment;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  leading: number,
  availableWidth: number,
  vertical: boolean,
): Layout {
  const maxHeight = Math.min(420, Math.max(180, availableWidth * (vertical ? 0.95 : 0.6)));
  ctx.textAlign = vertical ? 'left' : 'center';
  ctx.textBaseline = 'alphabetic';

  function measure(size: number, breakWords = false): Layout | null {
    const padding = Math.max(12, Math.ceil(size * 0.24));
    const font = `${size}px "${family}"`;
    ctx.font = font;
    const limit = Math.max(1, (vertical ? maxHeight : availableWidth) - padding * 2);
    const wrapped = wrap(text, limit, (line) => ctx.measureText(line).width, breakWords);
    if (!wrapped) return null;

    // Crop to the shaped glyphs, including marks and overhangs. The bounds
    // swap axes after a clockwise rotation for Mongolian columns.
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    const lines: Line[] = [];
    for (const [index, line] of wrapped.entries()) {
      if (!line) continue;
      const baseline = index * size * leading;
      const metrics = ctx.measureText(line);
      const { actualBoundingBoxLeft: l, actualBoundingBoxRight: r,
        actualBoundingBoxAscent: a, actualBoundingBoxDescent: d } = metrics;
      const x = vertical ? baseline : 0;
      const y = vertical ? 0 : baseline;
      left = Math.min(left, x - (vertical ? d : l));
      right = Math.max(right, x + (vertical ? a : r));
      top = Math.min(top, y - (vertical ? l : a));
      bottom = Math.max(bottom, y + (vertical ? r : d));
      lines.push({ text: line, x, y });
    }
    if (!lines.length) return { lines, size, font, width: Math.min(availableWidth, 96), height: 40 };
    for (const line of lines) {
      line.x += padding - left;
      line.y += padding - top;
    }
    return {
      lines, size, font,
      width: Math.ceil(right - left + padding * 2),
      height: Math.max(40, Math.ceil(bottom - top + padding * 2)),
    };
  }

  const minSize = 20;
  let best = measure(minSize, true)!;
  if (!best.lines.length) return best;

  // Keep fitting within the preview as long as text remains readable. For
  // very long input, retain the minimum size and allow the image to grow.
  let low = minSize;
  let high = 96;
  while (low <= high) {
    const size = Math.floor((low + high) / 2);
    const layout = measure(size);
    if (layout && layout.width <= availableWidth && layout.height <= maxHeight) {
      best = layout;
      low = size + 1;
    } else {
      high = size - 1;
    }
  }
  return best;
}
