import { modzi } from 'lojban';

export function krulermorna(t: string): string {
  return t
    .replace(/\./g, '')
    .replace(/^/, '.')
    .toLowerCase()
    .replace(/([aeiou.])u([aeiou])/g, '$1w$2')
    .replace(/([aeiou.])i([aeiou])/g, '$1ɩ$2')
    .replace(/au/g, 'ḁ')
    .replace(/ai/g, 'ą')
    .replace(/ei/g, 'ę')
    .replace(/oi/g, 'ǫ')
    .replace(/\./g, '');
}

export function cohukrulermorna(t: string): string {
  return t
    .replace(/w/g, 'u')
    .replace(/ɩ/g, 'i')
    .replace(/ḁ/g, 'au')
    .replace(/ą/g, 'ai')
    .replace(/ę/g, 'ei')
    .replace(/ǫ/g, 'oi');
}

const UNICODE_START = 0xed80;
const lerfu_index = "ptkflscmx.' 1234bdgvrzjn`-,~    aeiouy    qw    AEIOUY";

export function latinToZbalermorna(c: string): string {
  if ((c.codePointAt(0) ?? 0) >= 0xed80) {
    return c ?? '';
  }
  if (c === ' ') return ' ';
  if (c === 'h' || c === 'H') c = "'";
  if (lerfu_index.includes(c))
    return String.fromCodePoint(UNICODE_START + lerfu_index.indexOf(c));
  else if (lerfu_index.includes(c.toLowerCase()))
    return String.fromCodePoint(
      UNICODE_START + lerfu_index.indexOf(c.toLowerCase())
    );
  if (c === '\n') return '\n';
  if (c === '\t') return '\t';
  return c;
}

export function zbalermornaize({
  w,
  ot,
  rfs,
}: {
  w: string;
  ot: string;
  rfs: any[];
}): string {
  let word = krulermorna(w);
  if (ot === "vlaza'umei") {
    return rfs.map((def) => zbalermornaize(def)).join(' ');
  }
  word = word
    .split(/(?=[ɩw])/)
    .map((spisa: string) =>
      cohukrulermorna(spisa)
        .split('')
        .map((lerfu: string) => latinToZbalermorna(lerfu))
        .join('')
    )
    .join('');
  return word.replace(/,/g, '');
}

export function preprocess({ text, font }: { text: string; font: string }): string {
  if (['crisa', 'vrude', 'vrude-regular'].includes(font)) {
    const ot = "vlaza'umei";
    const rfs = text.split(' ').map((valsi: string) => {
      return { w: valsi, rfs: [] };
    });
    // The original code was returning string | string[] but joined by ' '.
    // We'll return string.
    return zbalermornaize({ w: '', ot, rfs });
  } else if (['modzi', 'emoji'].includes(font)) {
    return modzi(text, false) as string;
  } else {
    return text;
  }
}
