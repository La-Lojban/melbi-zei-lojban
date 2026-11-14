import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToBrolermorna, preprocess } from '../src/lojban-utils.ts';

test('PDF consonant and short-vowel mappings', () => {
  assert.equal(latinToBrolermorna("pa ta ka fa sa ca ba da ga va za ja ma na la ra xa 'a"),
    'פַ תַ כַ טַ סַ שַ בַ דַ גַ עַ זַ צַ מַ נַ לַ רַ חַ הַ');
  assert.equal(latinToBrolermorna('a e i o u y'), 'אַ אֶ אִ אָ אֻ אְ');
});

test('diphthongs, rising glides and final cmevla letters', () => {
  assert.equal(latinToBrolermorna('ai ei oi au ia ua'), 'אַי אֶי אָי אַו יַ וַ');
  assert.equal(latinToBrolermorna('.ap. .ak. .aj. .am. .an. .ax.'),
    '.אַף. .אַך. .אַץ. .אַם. .אַן. .אַק.');
  assert.equal(latinToBrolermorna('.ii'), '.יִ');
});

test('PDF examples use holam only for brivla schwa', () => {
  assert.equal(latinToBrolermorna('ry.'), 'רְ.');
  assert.equal(latinToBrolermorna('sofybakni'), 'סָטֹבַכנִ');
  assert.equal(latinToBrolermorna('simyzu\'e'), 'סִמֹזֻהֶ');
});

test('explicit stress, punctuation and whitespace survive preprocessing', () => {
  assert.equal(latinToBrolermorna('bA'), 'בַ֫');
  const input = 'coi ro do\n.i mi';
  assert.equal(preprocess({ text: input, font: 'brolermorna' }), 'שָי רָ דָ\n.אִ מִ');
});
