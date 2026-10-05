'use strict';
// Run with: node --test   (Node 18+, no dependencies)
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../src/nepali-converter.js');
const fx = require('./fixtures.json');

const nfc = (s) => s.normalize('NFC');

test('Preeti -> Unicode matches known spellings', () => {
  for (const [preeti, unicode] of Object.entries(fx.preeti_to_unicode)) {
    assert.equal(N.preetiToUnicode(preeti), nfc(unicode), `preeti "${preeti}"`);
  }
});

test('Unicode -> Preeti -> Unicode round-trips', () => {
  for (const unicode of Object.values(fx.preeti_to_unicode)) {
    assert.equal(N.preetiToUnicode(N.unicodeToPreeti(unicode)), nfc(unicode), `round trip "${unicode}"`);
  }
});

test('Unicode -> Preeti produces the canonical key sequence', () => {
  assert.equal(N.unicodeToPreeti('नेपाल'), 'g]kfn');
  assert.equal(N.unicodeToPreeti('धर्म'), 'wd{');
  assert.equal(N.unicodeToPreeti('विद्यार्थी'), 'ljBfyL{');
  assert.equal(N.unicodeToPreeti('२०८१'), '@)*!');
  assert.equal(N.unicodeToPreeti('2081'), '@)*!');
  assert.equal(N.unicodeToPreeti('2081', { digits: 'keep' }), '2081');
});

test('Romanized -> Unicode', () => {
  for (const [roman, unicode] of Object.entries(fx.roman_to_unicode)) {
    assert.equal(N.romanToUnicode(roman), nfc(unicode), `roman "${roman}"`);
  }
  assert.equal(N.romanToUnicode('2081', { digits: 'keep' }), '2081');
});

test('Unicode -> Roman and slugs', () => {
  for (const [unicode, roman] of Object.entries(fx.unicode_to_roman)) {
    assert.equal(N.unicodeToRoman(unicode), roman, `roman of "${unicode}"`);
  }
  for (const [text, slug] of Object.entries(fx.slug)) assert.equal(N.slugify(text), slug);
  assert.ok(N.slugify('नेपाल '.repeat(40), 30).length <= 30);
});

test('Digits and lakh/crore number formatting', () => {
  for (const [input, output] of Object.entries(fx.format_number)) assert.equal(N.formatNumber(input), output);
  assert.equal(N.formatNumber('12345', { digits: 'english' }), '12,345');
  assert.equal(N.formatNumber(5, { decimals: 2, digits: 'english' }), '5.00');
  assert.equal(N.toEnglishDigits('२०८१'), '2081');
  assert.throws(() => N.formatNumber('abc'), TypeError);
});

test('Script detection', () => {
  assert.equal(N.detect('g]kfn ;/sf/sf] sfo{qmd').type, 'preeti');
  assert.equal(N.detect('नेपाल सरकार').type, 'unicode');
  assert.equal(N.detect('mero naam pradip ho').type, 'roman');
  assert.equal(N.detect('This is an English sentence about food').type, 'roman');
  assert.equal(N.detect('   ').type, 'empty');
});

test('Stats count graphemes, words and lines', () => {
  assert.deepEqual(N.stats('नमस्ते संसार\nदोस्रो'), { characters: 10, words: 3, lines: 2 });
  assert.deepEqual(N.stats(''), { characters: 0, words: 0, lines: 0 });
});

test('Edge cases never throw', () => {
  for (const fn of [N.preetiToUnicode, N.unicodeToPreeti, N.romanToUnicode, N.unicodeToRoman, N.slugify]) {
    assert.equal(fn(''), '');
    assert.equal(typeof fn(null), 'string');
    assert.equal(typeof fn(undefined), 'string');
  }
  assert.equal(N.romanToUnicode('{unclosed brace'), 'unclosed brace');
  assert.throws(() => N.convert('x', 'nope'), /Unknown mode/);
});
