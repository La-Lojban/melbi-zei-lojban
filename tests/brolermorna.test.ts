import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToBrolermorna, preprocess } from '../src/lojban-utils.ts';

test('PDF consonant and short-vowel mappings', () => {
  assert.equal(latinToBrolermorna("pa ta ka fa sa ca ba da ga va za ja ma na la ra xa 'a"),
    'פַ תַ כַ טַ סַ שַ בַ דַ גַ עַ זַ צַ מַ נַ לַ רַ חַ הַ');
  assert.equal(latinToBrolermorna('a e i o u y'), 'אַ אֶ אִ אׇ אֻ אְ');
});

test('diphthongs, rising glides and final cmevla letters', () => {
  assert.equal(latinToBrolermorna('ai ei oi au ia ua'), 'אַי אֶי אׇי אַו יַ וַ');
  assert.equal(latinToBrolermorna('ii iu ui uu'), 'יִ יֻ וִ וֻ');
  // Word-initial iu/ui bind first: iua → ɩua, uia → wia; after C, Ciua → Ciwa
  assert.equal(latinToBrolermorna('iua'), 'יֻאַ');
  assert.equal(latinToBrolermorna('uia'), 'וִאַ');
  assert.equal(latinToBrolermorna('biua'), 'בִוַ');
  assert.equal(latinToBrolermorna('kiua'), 'כִוַ');
  assert.equal(latinToBrolermorna('biu kui'), 'ביֻ כוִ');
  // iu+ui+nai — spaced and concatenated must match (modulo spaces)
  assert.equal(latinToBrolermorna('iuuinai'), 'יֻוִנַי');
  assert.equal(latinToBrolermorna('iu ui nai'), 'יֻ וִ נַי');
  assert.equal(latinToBrolermorna('iuuinai'), latinToBrolermorna('iu ui nai').replace(/ /g, ''));
  // Final forms only before `.` (cmevla end), never before `,`
  assert.equal(latinToBrolermorna('.ap. .ak. .aj. .am. .an. .ax.'),
    '.אַף. .אַך. .אַץ. .אַם. .אַן. .אַק.');
  assert.equal(latinToBrolermorna("kuln,r,kore'a"), 'כֻלנ,ר,כׇרֶהַ');
  assert.equal(latinToBrolermorna('kuln'), 'כֻלנ');
  assert.equal(latinToBrolermorna('.ii'), '.יִ');
});

test('PDF examples use holam only for brivla schwa', () => {
  assert.equal(latinToBrolermorna('ry.'), 'רְ.');
  assert.equal(latinToBrolermorna('sofybakni'), 'סׇטֹבַכנִ');
  assert.equal(latinToBrolermorna('simyzu\'e'), 'סִמֹזֻהֶ');
});

test('explicit stress, punctuation and whitespace survive preprocessing', () => {
  assert.equal(latinToBrolermorna('bA'), 'בַ֫');
  const input = 'coi ro do\n.i mi';
  assert.equal(preprocess({ text: input, font: 'brolermorna' }), 'שׇי רׇ דׇ\n.אִ מִ');
});
