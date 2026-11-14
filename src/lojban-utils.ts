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

/**
 * la krulermorna as implemented in La-Lojban/lojban (`src/ceha/vrici.ts`):
 * i/u glides become ɩ/w, and the four falling diphthongs become single letters.
 * Kept separate from {@link krulermorna}, which the Zbalermorna path depends on.
 */
export function krulermornaOfficial(text: string): string {
  return text
    .toLowerCase()
    .replace(/h/g, "'")
    .replace(/([ptkflscmxbdgvrzjnaeiouy.\s])u([aeiouy])/g, '$1w$2')
    .replace(/([ptkflscmxbdgvrzjnaeiouy.\s])i([aeiouy])/g, '$1ɩ$2')
    .replace(/^u([aeiouy])/g, 'w$1')
    .replace(/^i([aeiouy])/g, 'ɩ$1')
    .replace(/au/g, 'ḁ')
    .replace(/ai/g, 'ą')
    .replace(/ei/g, 'ę')
    .replace(/oi/g, 'ǫ');
}

function applyMap(text: string, pairs: [string, string][]): string {
  const ordered = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let out = '';
  let i = 0;
  while (i < text.length) {
    const hit = ordered.find(([from]) => text.startsWith(from, i));
    if (hit) {
      out += hit[1];
      i += hit[0].length;
    } else {
      out += text[i];
      i += 1;
    }
  }
  return out;
}

/**
 * Greek edition of la krulermorna.
 * Letter pairs from https://mw.lojban.org/papri/Talk:la_krulermorna
 * after the La-Lojban krulermorna rewrite (glides and falling diphthongs).
 *
 * y (schwa) is not on that page; it is written ϋ so it stays distinct from υ.
 * c is /ʃ/, so it is the Greek letter sho ϸ rather than the talk page's ϸϡ.
 * Apostrophe + diphthong takes rough breathing on the diphthong letter
 * (ᾁ ᾑ ᾡ ἇ), matching the listed 'V breathing vowels.
 */
export function latinToKrulermornaGreek(input: string): string {
  const kruler = krulermornaOfficial(input);
  return applyMap(kruler, [
    ["'ą", 'ᾁ'],
    ["'ę", 'ᾑ'],
    ["'ǫ", 'ᾡ'],
    ["'ḁ", 'ἇ'],
    ["'a", 'ἁ'],
    ["'e", 'ἑ'],
    ["'i", 'ἱ'],
    ["'o", 'ὁ'],
    ["'u", 'ὑ'],
    ['ą', 'ᾳ'],
    ['ę', 'ῃ'],
    ['ǫ', 'ῳ'],
    ['ḁ', 'ᾶ'],
    ['ɩ', 'ι'],
    ['w', 'υ'],
    ['a', 'α'],
    ['e', 'ε'],
    ['i', 'ι'],
    ['o', 'ο'],
    ['u', 'υ'],
    ['y', 'ϋ'],
    ['b', 'β'],
    ['c', 'ϸ'],
    ['d', 'δ'],
    ['f', 'φ'],
    ['g', 'γ'],
    ['j', 'ζζ'],
    ['k', 'κ'],
    ['l', 'λ'],
    ['m', 'μ'],
    ['n', 'ν'],
    ['p', 'π'],
    ['r', 'ρ'],
    ['s', 'σ'],
    ['t', 'τ'],
    ['v', 'ϝ'],
    ['x', 'χ'],
    ['z', 'ζ'],
  ]);
}

/**
 * Cyrillic edition of la krulermorna.
 * Vowels, falling diphthongs, and i/u-glides from
 * https://mw.lojban.org/papri/Talk:la_krulermorna (Cyrillic edition).
 * Consonants follow `rukylermorna` in La-Lojban/lojban, which that page does not list.
 *
 * Open cells on the talk page: y is ы (the first of ы/ъ); iy is йы.
 */
export function latinToKrulermornaCyrillic(input: string): string {
  const kruler = krulermornaOfficial(input);
  return applyMap(kruler, [
    ['ą', 'ай'],
    ['ę', 'эй'],
    ['ǫ', 'ой'],
    ['ḁ', 'аў'],
    ['ɩa', 'я'],
    ['ɩe', 'е'],
    ['ɩi', 'ї'],
    ['ɩo', 'ё'],
    ['ɩu', 'ю'],
    ['ɩy', 'йы'],
    ['wa', 'ўа'],
    ['we', 'ўэ'],
    ['wi', 'ўи'],
    ['wo', 'ўо'],
    ['wu', 'ўу'],
    ['wy', 'ўы'],
    ['ɩ', 'й'],
    ['w', 'ў'],
    ['a', 'а'],
    ['e', 'э'],
    ['i', 'и'],
    ['o', 'о'],
    ['u', 'у'],
    ['y', 'ы'],
    ['f', 'ф'],
    ['v', 'в'],
    ['x', 'х'],
    ['s', 'с'],
    ['z', 'з'],
    ['c', 'ш'],
    ['j', 'ж'],
    ['p', 'п'],
    ['b', 'б'],
    ['t', 'т'],
    ['d', 'д'],
    ['k', 'к'],
    ['g', 'г'],
    ['l', 'л'],
    ['r', 'р'],
    ['m', 'м'],
    ['n', 'н'],
  ]);
}

/**
 * Coptic orthography: one Coptic letter per Lojban phoneme (Unicode Coptic block).
 * c → ϣ (shei, /ʃ/), j → ϫ (gangia), x → ϧ (khei), ' → ϩ (hori), f → ϥ (fei).
 * v is ⲃ plus diaeresis so it stays distinct from b ⲃ. y is ⲏ, distinct from e ⲉ.
 * Diphthongs stay letter sequences (ⲁⲓ, ⲁⲩ, …).
 */
const COPTIC_MAP: [string, string][] = [
  ['a', 'ⲁ'],
  ['e', 'ⲉ'],
  ['i', 'ⲓ'],
  ['o', 'ⲟ'],
  ['u', 'ⲩ'],
  ['y', 'ⲏ'],
  ['b', 'ⲃ'],
  ['c', 'ϣ'],
  ['d', 'ⲇ'],
  ['f', 'ϥ'],
  ['g', 'ⲅ'],
  ['j', 'ϫ'],
  ['k', 'ⲕ'],
  ['l', 'ⲗ'],
  ['m', 'ⲙ'],
  ['n', 'ⲛ'],
  ['p', 'ⲡ'],
  ['r', 'ⲣ'],
  ['s', 'ⲥ'],
  ['t', 'ⲧ'],
  ['v', 'ⲃ\u0308'],
  ['x', 'ϧ'],
  ['z', 'ⲍ'],
  ["'", 'ϩ'],
];

export function latinToCoptic(input: string): string {
  return applyMap(input.toLowerCase().replace(/h/g, "'"), COPTIC_MAP);
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

// ─── Sundanese / su'unda selyle'u co lojbo ────────────────────────────────────
//
// Aksara Sunda orthography for Lojban (Unicode Sundanese block U+1B80–U+1BBF).
//
// zunsna (consonant bases, inherent a):
//   k ᮊ  g ᮌ  c ᮎ  j ᮏ  t ᮒ  d ᮓ  n ᮔ
//   p ᮕ  b ᮘ  m ᮙ  f ᮖ  v ᮗ  x ᮍ  s ᮞ  z ᮐ
//   r ᮛ  l ᮜ  ' ᮠ
//   (x uses nga ᮍ per the chart; v uses va ᮗ)
//
// salsna (rising-glide bases):
//   i-glide ᮚ (ya)   u-glide ᮝ (wa)
//
// karsna (independent vowels):
//   .a ᮃ  .i ᮄ  .u ᮅ  .e ᮈ  .o ᮇ  .y ᮉ
//
// minle'u karsna (vowel signs on a consonant):
//   a (inherent)  y ᮨ  i ᮤ  e ᮦ  u ᮥ  o ᮧ
//
// pamaéh ᮪ kills the inherent vowel (clusters / final consonants).
// Syllable-final glides use the same vowel signs as medial vowels
// (e.g. .au → ᮃᮥ, loi → ᮜᮤᮧ). Encode vowel signs in shaping order:
// left (e), above (i), then right (o), rather than pronunciation order.

const SUNDANESE_CONSONANTS: Record<string, string> = {
  k: 'ᮊ',
  g: 'ᮌ',
  c: 'ᮎ',
  j: 'ᮏ',
  t: 'ᮒ',
  d: 'ᮓ',
  n: 'ᮔ',
  p: 'ᮕ',
  b: 'ᮘ',
  m: 'ᮙ',
  f: 'ᮖ',
  v: 'ᮗ',
  x: 'ᮍ',
  s: 'ᮞ',
  z: 'ᮐ',
  r: 'ᮛ',
  l: 'ᮜ',
  "'": 'ᮠ',
};

/** Independent vowel letters (word-initial / after pause). */
const SUNDANESE_INDEPENDENT: Record<string, string> = {
  a: 'ᮃ',
  i: 'ᮄ',
  u: 'ᮅ',
  e: 'ᮈ',
  o: 'ᮇ',
  y: 'ᮉ',
};

/**
 * Vowel signs. `a` is inherent (empty string).
 * y uses pamepet; e uses panaelaeng (left); o uses panolong (right).
 */
const SUNDANESE_VOWEL_SIGN: Record<string, string> = {
  a: '',
  y: 'ᮨ',
  i: 'ᮤ',
  e: 'ᮦ',
  u: 'ᮥ',
  o: 'ᮧ',
};

const SUNDANESE_PAMAEH = '᮪';
const SUNDANESE_YA = 'ᮚ';
const SUNDANESE_WA = 'ᮝ';

const SUNDANESE_VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
const SUNDANESE_CONS = new Set(Object.keys(SUNDANESE_CONSONANTS));

function isFallingDiphthong(first: string, second: string): boolean {
  return (
    (first === 'a' && (second === 'i' || second === 'u')) ||
    (first === 'e' && second === 'i') ||
    (first === 'o' && second === 'i')
  );
}

/**
 * Convert Lojban Latin text into Sundanese script
 * (su'unda selyle'u co lojbo).
 */
export function latinToSundanese(input: string): string {
  const normalised = input
    .toLowerCase()
    .replace(/h/g, "'")
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalised
    .split(/(\s+)/)
    .map((token) => (/\s+/.test(token) ? token : convertWordToSundanese(token)))
    .join('');
}

function convertWordToSundanese(word: string): string {
  if (!word) return '';

  const chars = Array.from(word.replace(/,/g, ''));
  let out = '';
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1] ?? '';
    const afterNext = chars[i + 2] ?? '';

    // Rising i-glide: ia ie ii io iu iy → ya + vowel sign
    if (ch === 'i' && SUNDANESE_VOWELS.has(next)) {
      out += SUNDANESE_YA + (SUNDANESE_VOWEL_SIGN[next] ?? '');
      i += 2;
      continue;
    }

    // Rising u-glide: ua ue ui uo uu uy → wa + vowel sign
    if (ch === 'u' && SUNDANESE_VOWELS.has(next)) {
      out += SUNDANESE_WA + (SUNDANESE_VOWEL_SIGN[next] ?? '');
      i += 2;
      continue;
    }

    // Independent / lone vowels (incl. falling diphthongs)
    if (SUNDANESE_VOWELS.has(ch)) {
      if (isFallingDiphthong(ch, next)) {
        out +=
          (SUNDANESE_INDEPENDENT[ch] ?? ch) + (SUNDANESE_VOWEL_SIGN[next] ?? '');
        i += 2;
        continue;
      }
      out += SUNDANESE_INDEPENDENT[ch] ?? ch;
      i += 1;
      continue;
    }

    // Consonant
    if (SUNDANESE_CONS.has(ch)) {
      const base = SUNDANESE_CONSONANTS[ch];

      // Consonant + falling diphthong: cai / kau / kei / koi
      if (SUNDANESE_VOWELS.has(next) && isFallingDiphthong(next, afterNext)) {
        // Sundanese shaping expects left signs before above signs, and
        // above signs before right signs. Only oi reverses phonetic order.
        const signs = next === 'o' ? [afterNext, next] : [next, afterNext];
        out += base + signs.map((vowel) => SUNDANESE_VOWEL_SIGN[vowel]).join('');
        i += 3;
        continue;
      }

      // Consonant before rising glide: mark pamaéh, let glide handle next
      if (
        SUNDANESE_VOWELS.has(next) &&
        (next === 'i' || next === 'u') &&
        SUNDANESE_VOWELS.has(afterNext)
      ) {
        out += base + SUNDANESE_PAMAEH;
        i += 1;
        continue;
      }

      // Plain CV
      if (SUNDANESE_VOWELS.has(next)) {
        out += base + (SUNDANESE_VOWEL_SIGN[next] ?? '');
        i += 2;
        continue;
      }

      // Cluster member / word-final consonant
      out += base + SUNDANESE_PAMAEH;
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

// ─── Tibetan / utco ───────────────────────────────────────────────────────────
//
// Ported from la sutysisku (`ceha.tibetan`). Runs krulermorna first, then maps
// to Tibetan script with subjoined consonants and vowel signs.

/** krulermorna as used by sutysisku's Tibetan path (glides + falling diphthongs). */
function krulermornaForTibetan(text: string): string {
  return text
    .replace(/\./g, '')
    .replace(/(?<=[aeiouy])u([aeiouy])/g, 'w$1')
    .replace(/(?<=[aeiouy])i([aeiouy])/g, 'ɩ$1')
    .replace(/u([aeiouy])/g, 'w$1')
    .replace(/i([aeiouy])/g, 'ɩ$1')
    .replace(/au/g, 'ḁ')
    .replace(/ai/g, 'ą')
    .replace(/ei/g, 'ę')
    .replace(/oi/g, 'ǫ');
}

/**
 * Convert Lojban Latin text into Tibetan script (utco).
 * Source: `@sutysisku/sutysisku` `ceha.tibetan`, with particle matching
 * and word-initial diphthong carriers applied before/after krulermorna
 * so `sei` / `.au` etc. survive diphthong folding.
 */
export function latinToTibetan(input: string): string {
  let text = ' ' + input.toLowerCase().replace(/h/g, "'");

  // Discourse particles → Tibetan punctuation (before krulermorna folds ei/oi)
  text = text.replace(/\b(?<!')i(?!')\b/g, '།');
  text = text.replace(/\bce'o(?!')\b/g, '༉');
  text = text.replace(/\bni'o(?!')\b/g, '༈');
  text = text.replace(/\bsei(?!')\b/g, '༓');
  text = text.replace(/\btoi(?!')\b/g, '༻');
  text = text.replace(/\bto(?!')\b/g, '༺');
  text = text.replace(/\ble(?!')\b/g, '༼');
  text = text.replace(/\bku(?!')\b/g, '༽');

  text = krulermornaForTibetan(text);

  // Avoid clusters of more than 2 consonants
  text = text.replace(
    /([bdgjvzcfkpstxlmnr][bdgjvzcfkpstxlmnr])([bdgjvzcfkpstxlmnr])/g,
    '$1-$2'
  );

  // Basic consonants (ZWSP marks “open for vowel / subjoin”)
  text = text.replace(/b/g, 'བ\u200b');
  text = text.replace(/c/g, 'ཤ\u200b');
  text = text.replace(/d/g, 'ད\u200b');
  text = text.replace(/f/g, 'ཕ༹\u200b');
  text = text.replace(/g/g, 'ག\u200b');
  text = text.replace(/'/g, 'ཧ\u200b');
  text = text.replace(/ɩ/g, 'ཡ\u200b');
  text = text.replace(/j/g, 'ཞ\u200b');
  text = text.replace(/k/g, 'ཀ\u200b');
  text = text.replace(/l/g, 'ལ\u200b');
  text = text.replace(/m/g, 'མ\u200b');
  text = text.replace(/n/g, 'ན\u200b');
  text = text.replace(/p/g, 'པ\u200b');
  // a-chen carrier for word-initial vowels and folded diphthongs
  text = text.replace(/ (?=[aeiouyąḁęǫ])/g, 'ཨ\u200b');
  text = text.replace(/r/g, 'ར\u200b');
  text = text.replace(/s/g, 'ས\u200b');
  text = text.replace(/t/g, 'ཏ\u200b');
  text = text.replace(/v/g, 'བ༹\u200b');
  text = text.replace(/w/g, 'ཝ\u200b');
  text = text.replace(/x/g, 'ཁ༹\u200b');
  text = text.replace(/z/g, 'ཟ\u200b');

  text = text.replace(/ཏ\u200bཤ\u200b/g, 'ཅ\u200b'); // tc
  text = text.replace(/ད\u200bཞ\u200b/g, 'ཇ\u200b'); // dj
  text = text.replace(/ཏ\u200bས\u200b/g, 'ཙ\u200b'); // ts
  text = text.replace(/ད\u200bཟ\u200b/g, 'ཛ\u200b'); // dz

  // Subjoined forms
  text = text.replace(/\u200bཀ/g, 'ྐ'); // k
  text = text.replace(/\u200bག/g, 'ྒ'); // g
  text = text.replace(/\u200bཅ/g, 'ྕ'); // tc
  text = text.replace(/\u200bཇ/g, 'ྗ'); // dj
  text = text.replace(/\u200bཏ/g, 'ྟ'); // t
  text = text.replace(/\u200bད/g, 'ྡ'); // d
  text = text.replace(/\u200bན/g, 'ྣ'); // n
  text = text.replace(/\u200bཔ/g, 'ྤ'); // p
  text = text.replace(/\u200bབ/g, 'ྦ'); // b
  text = text.replace(/\u200bམ/g, 'ྨ'); // m
  text = text.replace(/\u200bཙ/g, 'ྩ'); // ts
  text = text.replace(/\u200bཛ/g, 'ྫ'); // dz
  text = text.replace(/\u200bཝ/g, 'ྭ'); // w
  text = text.replace(/\u200bཟ/g, 'ྯ'); // z
  text = text.replace(/\u200bཡ/g, 'ྱ'); // ɩ
  text = text.replace(/\u200bར/g, 'ྲ'); // r
  text = text.replace(/\u200bལ/g, 'ླ'); // l
  text = text.replace(/\u200bས/g, 'ྶ'); // s

  // Vowels
  text = text.replace(/\u200ba/g, '');
  text = text.replace(/\u200bi/g, 'ི');
  text = text.replace(/\u200bu/g, 'ུ');
  text = text.replace(/\u200be/g, 'ེ');
  text = text.replace(/\u200bo/g, 'ོ');
  text = text.replace(/\u200bą/g, 'ཱི'); // ai
  text = text.replace(/\u200bḁ/g, 'ཱུ'); // au
  text = text.replace(/\u200bę/g, 'ིེ'); // ei
  text = text.replace(/\u200bǫ/g, 'ིོ'); // oi
  text = text.replace(/\u200by/g, 'ོེ'); // y

  // Mark cmevla / coda endings
  text = text.replace(/\u200b/g, '྄');

  // Exchange tsa-phru and vowel signs
  text = text.replace(/(\u0f39)((\u0f7a|\u0f72|\u0f7c|\u0f74)+)/g, '$2$1');

  text = text.replace(/0/g, '༠');
  text = text.replace(/1/g, '༡');
  text = text.replace(/2/g, '༢');
  text = text.replace(/3/g, '༣');
  text = text.replace(/4/g, '༤');
  text = text.replace(/5/g, '༥');
  text = text.replace(/6/g, '༦');
  text = text.replace(/7/g, '༧');
  text = text.replace(/8/g, '༨');
  text = text.replace(/9/g, '༩');

  text = text.replace(/-/g, '');

  return text.trim();
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
  } else if (font === 'sundanese') {
    return latinToSundanese(text);
  } else if (font === 'tibetan') {
    return latinToTibetan(text);
  } else if (font === 'krulermorna-greek') {
    return latinToKrulermornaGreek(text);
  } else if (font === 'krulermorna-cyrillic') {
    return latinToKrulermornaCyrillic(text);
  } else if (font === 'coptic') {
    return latinToCoptic(text);
  } else if (['modzi', 'emoji'].includes(font)) {
    return modzi(text, false) as string;
  } else {
    return text;
  }
}
