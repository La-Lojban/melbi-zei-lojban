import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToSundanese, preprocess } from '../src/lojban-utils.ts';

test('falling diphthongs encode vowel signs in Sundanese shaping order', () => {
  assert.equal(latinToSundanese('coi'), '\u1b8e\u1ba4\u1ba7');
  assert.equal(latinToSundanese('loi'), '\u1b9c\u1ba4\u1ba7');
  assert.equal(latinToSundanese('pei'), '\u1b95\u1ba6\u1ba4');
  assert.equal(latinToSundanese('mai'), '\u1b99\u1ba4');
  assert.equal(latinToSundanese('mau'), '\u1b99\u1ba5');
  assert.equal(latinToSundanese('.au'), '\u1b83\u1ba5');
});

test('the reported greeting converts through the Sundanese renderer path', () => {
  const input = 'coi ro do ma nuzba i xu do nelci la lojban';
  const expected = [
    '\u1b8e\u1ba4\u1ba7',
    '\u1b9b\u1ba7',
    '\u1b93\u1ba7',
    '\u1b99',
    '\u1b94\u1ba5\u1b90\u1baa\u1b98',
    '\u1b84',
    '\u1b8d\u1ba5',
    '\u1b93\u1ba7',
    '\u1b94\u1ba6\u1b9c\u1baa\u1b8e\u1ba4',
    '\u1b9c',
    '\u1b9c\u1ba7\u1b8f\u1baa\u1b98\u1b94\u1baa',
  ].join(' ');
  assert.equal(latinToSundanese(input), expected);
  assert.equal(preprocess({ text: input, font: 'sundanese' }), expected);
});
