#!/usr/bin/env node
/*
 * nepali-convert: command-line Nepali text converter (no dependencies).
 *
 *   nepali-convert <mode> [file ...]      read files (or stdin) and print converted text
 *   nepali-convert detect [file]          print unicode | preeti | roman
 *   nepali-convert number <value>         format with lakh/crore grouping
 *
 * Modes: roman-to-unicode, preeti-to-unicode, unicode-to-preeti, unicode-to-roman, slug
 * Options: --digits=keep  keep 0-9 instead of Devanagari digits
 *          -o FILE        write to FILE instead of stdout
 * Exit codes: 0 ok, 1 conversion error, 2 usage error.
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
 */
'use strict';
const fs = require('fs');
const path = require('path');
const N = require(path.join(__dirname, '..', 'src', 'nepali-converter.js'));

function usage(code) {
  const msg = `Usage: nepali-convert <mode|detect|number> [files...] [--digits=keep] [-o out.txt]
Modes: ${N.MODES.join(', ')}
Examples:
  nepali-convert preeti-to-unicode old-notice.txt -o notice-unicode.txt
  echo "mero naam pradiip ho" | nepali-convert roman-to-unicode
  nepali-convert number 1234567.5`;
  (code ? process.stderr : process.stdout).write(msg + '\n');
  process.exit(code);
}

const args = process.argv.slice(2);
if (!args.length || args.includes('-h') || args.includes('--help')) usage(args.length ? 0 : 2);
if (args.includes('-v') || args.includes('--version')) { process.stdout.write(N.VERSION + '\n'); process.exit(0); }

const command = args.shift();
let outFile = null;
const opts = {};
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o') outFile = args[++i];
  else if (args[i].startsWith('--digits=')) opts.digits = args[i].split('=')[1];
  else files.push(args[i]);
}

function readInput() {
  if (!files.length) return fs.readFileSync(0, 'utf8');
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

try {
  let result;
  if (command === 'number') {
    if (!files.length) usage(2);
    result = N.formatNumber(files[0], { digits: opts.digits === 'keep' ? 'english' : 'nepali' });
  } else if (command === 'detect') {
    result = N.detect(readInput()).type;
  } else if (N.MODES.includes(command)) {
    result = N.convert(readInput().replace(/^﻿/, ''), command, opts);
  } else {
    process.stderr.write(`Unknown mode "${command}"\n`);
    usage(2);
  }
  if (outFile) fs.writeFileSync(outFile, result, 'utf8');
  else process.stdout.write(result.endsWith('\n') ? result : result + '\n');
} catch (err) {
  process.stderr.write(`error: ${err.message}\n`);
  process.exit(err.code === 'ENOENT' ? 2 : 1);
}
