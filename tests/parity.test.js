'use strict';
// Cross-language parity: the PHP port must match the JavaScript library byte for byte.
// Skipped automatically when php is not installed.
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const N = require('../src/nepali-converter.js');
const fx = require('./fixtures.json');

const php = spawnSync('php', ['-v']);
const hasPhp = php.status === 0;

const corpus = [
  ...Object.keys(fx.preeti_to_unicode).map((text) => ({ mode: 'preeti-to-unicode', text })),
  ...Object.values(fx.preeti_to_unicode).map((text) => ({ mode: 'unicode-to-preeti', text })),
  ...Object.values(fx.preeti_to_unicode).map((text) => ({ mode: 'unicode-to-roman', text })),
  ...Object.values(fx.preeti_to_unicode).map((text) => ({ mode: 'slug', text })),
  ...Object.keys(fx.roman_to_unicode).map((text) => ({ mode: 'roman-to-unicode', text })),
  { mode: 'preeti-to-unicode', text: 'g]kfn ;/sf/sf] cfly{s jif{ @)*! ÷*@ sf] ah]6 tyf sfo{qmd' },
  { mode: 'unicode-to-preeti', text: 'नेपाल सरकारको आर्थिक वर्ष २०८१/८२ को बजेट तथा कार्यक्रम, 100% सफल!' },
  { mode: 'roman-to-unicode', text: 'hamro {Sprasa HR} le 21 waTaa riporT dinchha. dhanyabaad!' },
];

test('PHP port output is identical to JavaScript', { skip: !hasPhp && 'php not installed' }, () => {
  const run = spawnSync('php', [path.join(__dirname, 'php', 'convert.php')], { input: JSON.stringify(corpus), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const phpOut = JSON.parse(run.stdout);
  corpus.forEach((c, i) => {
    assert.equal(phpOut[i], N.convert(c.text, c.mode), `${c.mode}: ${c.text}`);
  });
});
