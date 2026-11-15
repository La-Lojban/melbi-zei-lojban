import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToSundanese, preprocess } from '../src/lojban-utils.ts';

test('independent e/y and x letter follow the corrected mapping', () => {
  assert.equal(latinToSundanese('.e'), '\u1b86');
  assert.equal(latinToSundanese('.y'), '\u1b88');
  assert.equal(latinToSundanese('xa'), '\u1b8b');
  assert.equal(latinToSundanese('xu'), '\u1b8b\u1ba5');
});

test('falling diphthong offglides use independent i/u letters', () => {
  assert.equal(latinToSundanese('coi'), '\u1b8e\u1ba7\u1b84');
  assert.equal(latinToSundanese('loi'), '\u1b9c\u1ba7\u1b84');
  assert.equal(latinToSundanese('pei'), '\u1b95\u1ba6\u1b84');
  assert.equal(latinToSundanese('mai'), '\u1b99\u1b84');
  assert.equal(latinToSundanese('mau'), '\u1b99\u1b85');
  assert.equal(latinToSundanese('.au'), '\u1b83\u1b85');
  assert.equal(latinToSundanese('.ai'), '\u1b83\u1b84');
  assert.equal(latinToSundanese('.ei'), '\u1b86\u1b84');
  assert.equal(latinToSundanese('.oi'), '\u1b87\u1b84');
});

test('krulermorna glides: word-initial iu/ui first; Ciua → Ciwa', () => {
  assert.equal(latinToSundanese('ia'), '\u1b9a');
  assert.equal(latinToSundanese('ua'), '\u1b9d');
  assert.equal(latinToSundanese('iu'), '\u1b9a\u1ba5');
  assert.equal(latinToSundanese('ui'), '\u1b9d\u1ba4');
  // Word-initial iua → ɩua (iu + a), not iwa
  assert.equal(latinToSundanese('iua'), '\u1b9a\u1ba5\u1b83');
  assert.equal(latinToSundanese('biua'), '\u1b98\u1ba4\u1b9d');
  assert.equal(latinToSundanese('kiua'), '\u1b8a\u1ba4\u1b9d');
  // Word-initial uia → wia (ui + a)
  assert.equal(latinToSundanese('uia'), '\u1b9d\u1ba4\u1b83');
  assert.equal(latinToSundanese('cia'), '\u1b8e\u1baa\u1b9a');
  assert.equal(
    latinToSundanese('iuuinai'),
    latinToSundanese('iu ui nai').replace(/ /g, '')
  );
});

test('the reported greeting converts through the Sundanese renderer path', () => {
  const input = 'coi ro do ma nuzba i xu do nelci la lojban';
  const expected = [
    '\u1b8e\u1ba7\u1b84',
    '\u1b9b\u1ba7',
    '\u1b93\u1ba7',
    '\u1b99',
    '\u1b94\u1ba5\u1b90\u1baa\u1b98',
    '\u1b84',
    '\u1b8b\u1ba5',
    '\u1b93\u1ba7',
    '\u1b94\u1ba6\u1b9c\u1baa\u1b8e\u1ba4',
    '\u1b9c',
    '\u1b9c\u1ba7\u1b8f\u1baa\u1b98\u1b94\u1baa',
  ].join(' ');
  assert.equal(latinToSundanese(input), expected);
  assert.equal(preprocess({ text: input, font: 'sundanese' }), expected);
});
