import assert from 'node:assert/strict';
import { test } from 'node:test';
import { latinToMongolian, mongolianToLatin, preprocess } from '../src/lojban-utils.ts';

test('Mongolian alphabet has distinct reversible assignments', () => {
  const latin = "aeiouybcdfgjklmnprstvxz'";
  const mongolian = 'ᠠᠡᠢᠣᠤᠥᠪᠱᠳᠹᠭᠵᠺᠯᠮᠨᠫᠷᠰᠲᠸᠬᠽᠾ';
  assert.equal(latinToMongolian(latin), mongolian);
  assert.equal(mongolianToLatin(mongolian), latin);
  assert.equal(new Set(Array.from(mongolian)).size, latin.length);
});

test('restores stress, pauses, whitespace, literals and escape sequences exactly', () => {
  for (const input of [".i coi ro do\n la .DJOsef,in.  ", "hH '’ ~ ~~ ~Uᠠ ~Lᠪ", 'ᠠᠪ lojban 😀\t\r\n', 'iuuinai ai au ei oi', '']) {
    const encoded = latinToMongolian(input);
    assert.equal(mongolianToLatin(encoded), input);
    assert.equal(preprocess({ text: input, font: 'mongolian' }), encoded);
  }
});

test('round trips all combinations of mapped and reserved characters', () => {
  const chars = Array.from("aAzZ'~ULᠠᠪ .\n😀");
  for (const a of chars) for (const b of chars) for (const c of chars) {
    const input = a + b + c;
    assert.equal(mongolianToLatin(latinToMongolian(input)), input);
  }
});
