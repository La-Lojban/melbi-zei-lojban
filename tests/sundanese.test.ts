import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToSundanese, preprocess } from '../src/lojban-utils.ts';

/**
 * Chart: su'unda selyle'u co lojbo
 * Tables: zunsna / salsna / karsna / minle'u karsna (+ footnote examples).
 */

test('chart zunsna: consonants with inherent a', () => {
  const pairs: [string, string][] = [
    ['ka', 'ᮊ'],
    ['ga', 'ᮌ'],
    ['ca', 'ᮎ'],
    ['ja', 'ᮏ'],
    ['ta', 'ᮒ'],
    ['da', 'ᮓ'],
    ['na', 'ᮔ'],
    ['pa', 'ᮕ'],
    ['ba', 'ᮘ'],
    ['ma', 'ᮙ'],
    ['ra', 'ᮛ'],
    ['la', 'ᮜ'],
    ['sa', 'ᮞ'],
    ['fa', 'ᮖ'],
    ['xa', 'ᮋ'],
    ['va', 'ᮗ'],
    ['za', 'ᮐ'],
    ["'a", 'ᮠ'],
  ];
  for (const [latin, expected] of pairs) {
    assert.equal(latinToSundanese(latin), expected, latin);
  }
});

test('chart salsna: rising glides ia / ua', () => {
  assert.equal(latinToSundanese('ia'), 'ᮚ');
  assert.equal(latinToSundanese('ua'), 'ᮝ');
});

test('chart karsna: independent vowels after pause', () => {
  assert.equal(latinToSundanese('.a'), 'ᮃ');
  assert.equal(latinToSundanese('.y'), 'ᮈ');
  assert.equal(latinToSundanese('.i'), 'ᮄ');
  assert.equal(latinToSundanese('.e'), 'ᮆ');
  assert.equal(latinToSundanese('.u'), 'ᮅ');
  assert.equal(latinToSundanese('.o'), 'ᮇ');
});

test("chart minle'u karsna: vowel signs on ka", () => {
  assert.equal(latinToSundanese('ka'), 'ᮊ');
  assert.equal(latinToSundanese('ky'), 'ᮊᮨ');
  assert.equal(latinToSundanese('ki'), 'ᮊᮤ');
  assert.equal(latinToSundanese('ke'), 'ᮊᮦ');
  assert.equal(latinToSundanese('ku'), 'ᮊᮥ');
  assert.equal(latinToSundanese('ko'), 'ᮊᮧ');
});

test('chart footnotes: pamaeh, .au, loi', () => {
  // bare consonant uses pamaeh (᮪)
  assert.equal(latinToSundanese('d'), 'ᮓ᮪');
  // falling diphthong offglide = independent vowel letter
  assert.equal(latinToSundanese('.au'), 'ᮃᮅ');
  assert.equal(latinToSundanese('loi'), 'ᮜᮧᮄ');
});

test('chart-related falling diphthongs', () => {
  assert.equal(latinToSundanese('coi'), 'ᮎᮧᮄ');
  assert.equal(latinToSundanese('pei'), 'ᮕᮦᮄ');
  assert.equal(latinToSundanese('mai'), 'ᮙᮄ');
  assert.equal(latinToSundanese('mau'), 'ᮙᮅ');
  assert.equal(latinToSundanese('.ai'), 'ᮃᮄ');
  assert.equal(latinToSundanese('.ei'), 'ᮆᮄ');
  assert.equal(latinToSundanese('.oi'), 'ᮇᮄ');
});

test('krulermorna glides: word-initial iu/ui first; Ciua → Ciwa', () => {
  assert.equal(latinToSundanese('iu'), 'ᮚᮥ');
  assert.equal(latinToSundanese('ui'), 'ᮝᮤ');
  assert.equal(latinToSundanese('iua'), 'ᮚᮥᮃ');
  assert.equal(latinToSundanese('biua'), 'ᮘᮤᮝ');
  assert.equal(latinToSundanese('kiua'), 'ᮊᮤᮝ');
  assert.equal(latinToSundanese('uia'), 'ᮝᮤᮃ');
  assert.equal(latinToSundanese('cia'), 'ᮎ᮪ᮚ');
  assert.equal(
    latinToSundanese('iuuinai'),
    latinToSundanese('iu ui nai').replace(/ /g, '')
  );
});

test('greeting converts through the Sundanese renderer path', () => {
  const input = 'coi ro do ma nuzba i xu do nelci la lojban';
  const expected = [
    'ᮎᮧᮄ',
    'ᮛᮧ',
    'ᮓᮧ',
    'ᮙ',
    'ᮔᮥᮐ᮪ᮘ',
    'ᮄ',
    'ᮋᮥ',
    'ᮓᮧ',
    'ᮔᮦᮜ᮪ᮎᮤ',
    'ᮜ',
    'ᮜᮧᮏ᮪ᮘᮔ᮪',
  ].join(' ');
  assert.equal(latinToSundanese(input), expected);
  assert.equal(preprocess({ text: input, font: 'sundanese' }), expected);
});
