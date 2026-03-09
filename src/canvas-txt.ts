import { split } from 'emoji-aware';

// Hair space character for precise justification
const SPACE = '\u200a';

interface DrawTextResult {
  height: number;
}

export interface CanvasTxtConfig {
  debug: boolean;
  align: 'left' | 'center' | 'right';
  vAlign: 'top' | 'middle' | 'bottom';
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  fontVariant: string;
  font: string;
  lineHeight: number | null;
  justify: boolean;
}

const canvasTxt = {
  debug: false,
  align: 'center' as 'left' | 'center' | 'right',
  vAlign: 'middle' as 'top' | 'middle' | 'bottom',
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: null as number | null,
  justify: false,

  drawText: function (
    ctx: CanvasRenderingContext2D,
    mytext: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): DrawTextResult {
    // Parse all to integers
    [x, y, width, height] = [x, y, width, height].map((el) =>
      parseInt(el.toString())
    );

    if (width <= 0 || height <= 0 || this.fontSize <= 0) {
      return { height: 0 };
    }

    // End points
    const xEnd = x + width;
    const yEnd = y + height;

    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this;
    const fontParts = [fontStyle, fontVariant, fontWeight, `${fontSize}px`, `"${font}"`].filter(
      (part) => part && part.trim()
    );
    const style = fontParts.join(' ');
    ctx.font = style;

    let txtY = y + height / 2 + parseInt(this.fontSize.toString()) / 2;
    let textanchor: number;

    if (this.align === 'right') {
      textanchor = xEnd;
      ctx.textAlign = 'right';
    } else if (this.align === 'left') {
      textanchor = x;
      ctx.textAlign = 'left';
    } else {
      textanchor = x + width / 2;
      ctx.textAlign = 'center';
    }

    const temptextarray = mytext.split('\n');
    const textarray: string[] = [];
    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0;

    temptextarray.forEach((txtt) => {
      let textwidth = ctx.measureText(txtt).width;
      if (textwidth <= width) {
        textarray.push(txtt);
      } else {
        let temptext = txtt;
        const linelen = width;
        let textlen: number;
        let textpixlen: number;
        let texttoprint: string;

        while (ctx.measureText(temptext).width > linelen) {
          textlen = 0;
          textpixlen = 0;
          texttoprint = '';
          while (textpixlen < linelen) {
            textlen++;
            texttoprint = split(temptext).slice(0, textlen).join('');
            textpixlen = ctx.measureText(texttoprint).width;
          }
          // Remove last character that was out of the box
          textlen--;
          texttoprint = split(temptext).slice(0, textlen).join('');

          // Ensurs a new line only happens at a space
          const backup = textlen;
          if (split(temptext).slice(textlen, textlen + 1).join('') !== ' ') {
            while (
              split(temptext).slice(textlen, textlen + 1).join('') !== ' ' &&
              textlen !== 0
            ) {
              textlen--;
            }
            if (textlen === 0) {
              textlen = backup;
            }
            texttoprint = split(temptext).slice(0, textlen).join('');
          }

          texttoprint = this.justify
            ? this.justifyLine(ctx, texttoprint, spaceWidth, SPACE, width)
            : texttoprint;

          temptext = split(temptext).slice(textlen).join('');
          textarray.push(texttoprint);
        }
        if (ctx.measureText(temptext).width > 0) {
          textarray.push(temptext);
        }
      }
    });

    const charHeight = this.lineHeight
      ? this.lineHeight
      : this.getTextHeight(ctx, mytext, style);

    const vheight = charHeight * (textarray.length - 1);
    const negoffset = vheight / 2;

    let debugY = y;
    if (this.vAlign === 'top') {
      txtY = y + this.fontSize;
    } else if (this.vAlign === 'bottom') {
      txtY = yEnd - vheight;
      debugY = yEnd;
    } else {
      debugY = y + height / 2;
      txtY -= negoffset;
    }

    textarray.forEach((txtline) => {
      txtline = txtline.trim();
      ctx.fillText(txtline, textanchor, txtY);
      txtY += charHeight;
    });

    if (this.debug) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00909e';
      ctx.strokeRect(x, y, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f6d743';
      ctx.beginPath();
      ctx.moveTo(textanchor, y);
      ctx.lineTo(textanchor, yEnd);
      ctx.stroke();

      ctx.strokeStyle = '#ff6363';
      ctx.beginPath();
      ctx.moveTo(x, debugY);
      ctx.lineTo(xEnd, debugY);
      ctx.stroke();
    }

    return { height: vheight + charHeight };
  },

  getTextHeight: function (
    ctx: CanvasRenderingContext2D,
    text: string,
    style: string
  ): number {
    const previousTextBaseline = ctx.textBaseline;
    const previousFont = ctx.font;

    ctx.textBaseline = 'bottom';
    ctx.font = style;
    const { actualBoundingBoxAscent: height } = ctx.measureText(text);

    ctx.textBaseline = previousTextBaseline;
    ctx.font = previousFont;

    return height;
  },

  justifyLine: function (
    ctx: CanvasRenderingContext2D,
    line: string,
    spaceWidth: number,
    spaceChar: string,
    width: number
  ): string {
    const text = line.trim();
    const lineWidth = ctx.measureText(text).width;
    const nbSpaces = text.split(/\s+/).length - 1;
    const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth);

    if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text;

    const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces);
    let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum;

    const spaces = [];
    for (let i = 0; i < nbSpacesMinimum; i++) {
      spaces.push(spaceChar);
    }
    const str_spaces = spaces.join('');

    return text.replace(/\s+/g, (match) => {
      const allSpaces = extraSpaces > 0 ? str_spaces + spaceChar : str_spaces;
      extraSpaces--;
      return match + allSpaces;
    });
  },
};

export default canvasTxt;
