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

// ─── Thaana / MV Randhoo support ──────────────────────────────────────────────
//
// Phoneme mapping per the Comprehensive Orthographic Proposal for Lojban-Thaana.
// Unicode block U+0780–U+07BF (Thaana).
//
// Consonant bases (using literal Thaana characters for clarity):
//   p → ޕ (Paviyani)    t → ތ (Thaa)        k → ކ (Kaafu)
//   f → ފ (Faafu)       c → ޝ (Sheenu, [ʃ]) s → ސ (Seenu)
//   x → ޚ (Kha, [x])    b → ބ (Baa)         d → ދ (Dhaalu)
//   g → ގ (Gaafu)       v → ވ (Vaavu)        j → ޜ (Zhe, [ʒ])
//   z → ޒ (Zaviyani)    l → ލ (Laamu)        m → މ (Meemu)
//   n → ނ (Noonu)       r → ރ (Raa)         ' → ހ (Haa, glottal)
//
// Vowel diacritics (fili):
//   a → ަ (Abafili)     e → ެ (Ebefili)     i → ި (Ibifili)
//   o → ޮ (Obofili)     u → ު (Ubufili)     y → ̈ (Y-fili, schwa)
//
// Special:
//   sukun  ް  — marks a consonant with no following vowel (cluster or word-final)
//   Alifu  އ  — null carrier for word-initial / inter-vowel vowels
//   Yaa    ޔ  — i-glide base for rising diphthongs (ia, ie, …)
//   Wavu   ޥ  — u-glide base for rising diphthongs (ua, ue, …)

/** Thaana consonant bases for each Lojban phoneme */
const THAANA_CONSONANTS: Record<string, string> = {
  p: 'ޕ', // Paviyani
  t: 'ތ', // Thaa
  k: 'ކ', // Kaafu
  f: 'ފ', // Faafu
  c: 'ޝ', // Sheenu  (IPA [ʃ])
  s: 'ސ', // Seenu
  x: 'ޚ', // Kha     (IPA [x])
  b: 'ބ', // Baa
  d: 'ދ', // Dhaalu
  g: 'ގ', // Gaafu
  v: 'ވ', // Vaavu
  j: 'ޜ', // Zhe     (IPA [ʒ])
  z: 'ޒ', // Zaviyani
  l: 'ލ', // Laamu
  m: 'މ', // Meemu
  n: 'ނ', // Noonu
  r: 'ރ', // Raa
  "'": 'ހ', // Haa    (glottal glide / apostrophe)
};

/** Thaana vowel diacritics (fili) for each Lojban vowel */
const THAANA_FILI: Record<string, string> = {
  a: 'ަ', // Abafili  (above)
  e: 'ެ', // Ebefili  (above)
  i: 'ި', // Ibifili  (below)
  o: 'ޮ', // Obofili  (above)
  u: 'ު', // Ubufili  (below)
  y: '\u0308', // Y-fili: diaeresis/umlaut above — visually distinct dot-pair for schwa
};

/** Sukun — marks absence of a following vowel (cluster / word-final consonant) */
const SUKUN = 'ް';

/** Alifu — null carrier for word-initial or inter-vowel vowels */
const ALIFU = 'އ';

/** Yaa — semivowel base for i-glide rising diphthongs (ia, ie, io, iu, iy) */
const YAA = 'ޔ';

/** Wavu — semivowel base for u-glide rising diphthongs (ua, ue, ui, uo, uy) */
const WAVU = 'ޥ';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
const CONSONANTS_SET = new Set(Object.keys(THAANA_CONSONANTS));

/**
 * Convert Lojban Latin text into Thaana script (MV Randhoo / Lojban-Thaana
 * orthography).
 *
 * Handles:
 *  - All 17 Lojban consonants → native/extended Thaana bases
 *  - 6 vowels (a e i o u y) → fili diacritics on the preceding base
 *  - Word-initial vowels → Alifu carrier + fili
 *  - Falling diphthongs (ai, au, ei, oi) → primary fili + Alifu + secondary fili
 *  - Rising diphthongs (i+V, u+V) → Yaa/Wavu + fili  (analytical separation)
 *  - Consonant clusters → sukun on every cluster member
 *  - Apostrophe → Haa (ހ), period → Alifu+sukun (pause marker)
 */
export function latinToThaana(input: string): string {
  const normalised = input.toLowerCase().replace(/\./g, ' ').trim();
  return normalised
    .split(/(\s+)/) // preserve whitespace tokens
    .map((token) => (/\s+/.test(token) ? token : convertWordToThaana(token)))
    .join('');
}

function convertWordToThaana(word: string): string {
  if (!word) return '';

  const chars = Array.from(word);
  let out = '';
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1] ?? '';
    const afterNext = chars[i + 2] ?? '';

    // ── Rising diphthongs: i-glide  (i + another vowel) ──────────────────
    // "ia", "ie", "ii", "io", "iu", "iy" → Yaa + fili
    if (ch === 'i' && VOWELS.has(next)) {
      out += YAA + (THAANA_FILI[next] ?? next);
      i += 2;
      continue;
    }

    // ── Rising diphthongs: u-glide  (u + another vowel) ──────────────────
    // "ua", "ue", "ui", "uo", "uu", "uy" → Wavu + fili
    if (ch === 'u' && VOWELS.has(next)) {
      out += WAVU + (THAANA_FILI[next] ?? next);
      i += 2;
      continue;
    }

    // ── Lone vowels (word-initial or after a consonant cluster) ───────────
    if (VOWELS.has(ch)) {
      // Falling diphthong that is word-initial: "ai", "au", "ei", "oi"
      const isFalling =
        (ch === 'a' && (next === 'i' || next === 'u')) ||
        (ch === 'e' && next === 'i') ||
        (ch === 'o' && next === 'i');

      if (isFalling) {
        out += ALIFU + (THAANA_FILI[ch] ?? ch) + ALIFU + (THAANA_FILI[next] ?? next);
        i += 2;
        continue;
      }

      // Plain lone vowel → Alifu carrier + fili
      out += ALIFU + (THAANA_FILI[ch] ?? ch);
      i += 1;
      continue;
    }

    // ── Consonant ─────────────────────────────────────────────────────────
    if (CONSONANTS_SET.has(ch)) {
      const base = THAANA_CONSONANTS[ch];

      // Next char is a vowel that starts a falling diphthong:
      //   consonant + ai / au / ei / oi
      const isFallingAfterCons =
        VOWELS.has(next) &&
        ((next === 'a' && (afterNext === 'i' || afterNext === 'u')) ||
          (next === 'e' && afterNext === 'i') ||
          (next === 'o' && afterNext === 'i'));

      if (isFallingAfterCons) {
        // e.g. "lai" → ލ + aBAfili + Alifu + iBIfili
        out += base + (THAANA_FILI[next] ?? next) + ALIFU + (THAANA_FILI[afterNext] ?? afterNext);
        i += 3;
        continue;
      }

      // Consonant followed by a rising-diphthong glide: consonant gets sukun,
      // then Yaa/Wavu handles the glide in the next iteration.
      if (
        VOWELS.has(next) &&
        (next === 'i' || next === 'u') &&
        VOWELS.has(afterNext)
      ) {
        out += base + SUKUN;
        i += 1;
        continue;
      }

      // Plain consonant + vowel syllable
      if (VOWELS.has(next)) {
        out += base + (THAANA_FILI[next] ?? next);
        i += 2;
        continue;
      }

      // Consonant with no following vowel → sukun (cluster member or word-final)
      out += base + SUKUN;
      i += 1;
      continue;
    }

    // ── Passthrough ───────────────────────────────────────────────────────
    out += ch;
    i += 1;
  }

  return out;
}

export function preprocess({ text, font }: { text: string; font: string }): string {
  const zbalermornaFonts = [
    'crisa',
    'crisa-regular',
    'crisa-light',
    'vrude',
    'vrude-regular',
    'ritli-regular',
    'primihi-regular',
    'balvi-regular',
    'dunda-regular',
    'nerfopi-regular',
    'tanbo-regular',
    'fira-code-zlm',
    'manri',
    'drakono',
    'piper-karot',
    'tisna-bold'
  ];

  if (zbalermornaFonts.includes(font)) {
    const ot = "vlaza'umei";
    const rfs = text.split(' ').map((valsi: string) => {
      return { w: valsi, rfs: [] };
    });
    // The original code was returning string | string[] but joined by ' '.
    // We'll return string.
    return zbalermornaize({ w: '', ot, rfs });
  } else if (font === 'mv-randhoo') {
    return latinToThaana(text);
  } else if (['modzi', 'emoji'].includes(font)) {
    return modzi(text, false) as string;
  } else {
    return text;
  }
}
