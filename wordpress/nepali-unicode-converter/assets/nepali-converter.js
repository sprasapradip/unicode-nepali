/*!
 * Nepali Unicode Converter v2.0.0
 * Preeti <-> Unicode, Romanized -> Unicode, Unicode -> Roman/slug, Nepali digits.
 * Zero dependencies. Works in browsers (window.NepaliConverter) and Node (require).
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NepaliConverter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let VERSION = '2.0.0';

  // Unicode ranges and classes ---------------------------------------------------------------
  let CONS = 'क-हक़-य़';           // क..ह plus precomposed nukta letters
  let MATRA = 'ा-ौॢॣ';             // ा..ौ, vocalic matras
  let CLUSTER = '(?:[' + CONS + ']़?्)*[' + CONS + ']़?(?:्[रय])?';
  let DEV_DIGITS = '०१२३४५६७८९';

  // Preeti -> Unicode ------------------------------------------------------------------------
  // Multi-character sequences first (longest match wins), then single keys.
  let PREETI_MAP = {
    // glyph combinations built with the "m" hook, vowels written as a + bar, nukta letters
    'k|m': 'फ्र', 'em': 'झ', 'km': 'फ', 'Qm': 'क्त', 'qm': 'क्र', 'N˜': 'ल',
    '6«': 'ट्र', '7«': 'ठ्र', '8«': 'ड्र', '9«': 'ढ्र', '8Þ': 'ड़', '9Þ': 'ढ़',
    'cf‘': 'ऑ', 'c‘f': 'ऑ', 'cf}': 'औ', 'cf]': 'ओ', 'cf': 'आ', 'O{': 'ई', 'pm': 'ऊ', 'P]': 'ऐ', 'f‘': 'ॉ',
    // symbols and digits (Preeti types Devanagari digits with Shift)
    'ç': 'ॐ', '˜': 'ऽ', '.': '।', ')': '०', '!': '१', '@': '२', '#': '३', '$': '४',
    '%': '५', '^': '६', '&': '७', '*': '८', '(': '९',
    // conjunct keys
    '¡': 'ज्ञ्', '¢': 'द्घ', '1': 'ज्ञ', '2': 'द्द', '4': 'द्ध', '>': 'श्र', '?': 'रु', '§': 'ट्ट',
    '°': 'ड्ढ', '¶': 'ठ्ठ', '¿': 'रू', 'Å': 'हृ', 'Ë': 'ङ्ग', 'Ì': 'न्न', 'Í': 'ङ्क', 'Î': 'ङ्ख',
    'Ý': 'ट्ठ', 'å': 'द्व', 'Ø': '्य', '|': '्र', 'q': 'त्र', 'Q': 'त्त', 'Œ': 'त्त्', 'I': 'क्ष्', 'B': 'द्य',
    // consonants (uppercase = half form)
    'S': 'क्', 's': 'क', 'V': 'ख्', 'v': 'ख', 'U': 'ग्', 'u': 'ग', '3': 'घ', 'ª': 'ङ',
    'R': 'च्', 'r': 'च', '5': 'छ', 'H': 'ज्', 'h': 'ज', '‰': 'झ्', '´': 'झ', '~': 'ञ्', '`': 'ञ',
    '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण्', 'T': 'त्', 't': 'त', 'Y': 'थ्', 'y': 'थ',
    'b': 'द', 'W': 'ध्', 'w': 'ध', 'G': 'न्', 'g': 'न', 'K': 'प्', 'k': 'प', 'ˆ': 'फ्', 'A': 'ब्',
    'a': 'ब', 'E': 'भ्', 'e': 'भ', 'D': 'म्', 'd': 'म', 'o': 'य', '/': 'र', 'N': 'ल्', 'n': 'ल',
    'J': 'व्', 'j': 'व', 'Z': 'श्', 'z': 'श', 'i': 'ष्', ':': 'स्', ';': 'स', 'X': 'ह्', 'x': 'ह',
    // independent vowels
    'c': 'अ', 'O': 'इ', 'p': 'उ', 'C': 'ऋ', 'P': 'ए',
    // vowel signs and modifiers
    'f': 'ा', 'l': 'ि', 'L': 'ी', "'": 'ु', '"': 'ू', '[': 'ृ', ']': 'े', '}': 'ै',
    '+': 'ं', 'F': 'ँ', 'M': 'ः', '\\': '्', '{': 'र्', 'Þ': '़',
    // punctuation that Preeti moves to other keys
    '=': '.', '_': ')', '-': '(', 'Ö': '=', 'Ù': ';', '<': '?', '÷': '/', 'Ú': '’', 'Û': '!', 'Ü': '%'
  };

  // Unicode -> Preeti -----------------------------------------------------------------------
  // Full consonant -> key. Letters without a dedicated key are written as half form + "f" bar.
  let FULL_KEY = {
    'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª', 'च': 'r', 'छ': '5', 'ज': 'h', 'झ': 'em', 'ञ': '`',
    'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0f', 'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
    'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd', 'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j', 'श': 'z',
    'ष': 'if', 'स': ';', 'ह': 'x'
  };
  let HALF_KEY = {
    'क': 'S', 'ख': 'V', 'ग': 'U', 'च': 'R', 'ज': 'H', 'झ': '‰', 'ञ': '~', 'ण': '0', 'त': 'T', 'थ': 'Y',
    'ध': 'W', 'न': 'G', 'प': 'K', 'फ': 'ˆ', 'ब': 'A', 'भ': 'E', 'म': 'D', 'ल': 'N', 'व': 'J', 'श': 'Z',
    'ष': 'i', 'स': ':', 'ह': 'X'
  };
  let UNICODE_MAP = (function () {
    let m = {
      'क्ष्': 'I', 'क्ष': 'If', 'त्र': 'q', 'त्त्': 'Œ', 'त्त': 'Q', 'ज्ञ्': '¡', 'ज्ञ': '1', 'द्द': '2',
      'द्ध': '4', 'श्र': '>', 'द्य': 'B', 'रु': '?', 'रू': '¿', 'हृ': 'Å', 'ट्ट': '§', 'ड्ढ': '°',
      'ठ्ठ': '¶', 'ङ्ग': 'Ë', 'न्न': 'Ì', 'ङ्क': 'Í', 'ङ्ख': 'Î', 'ट्ठ': 'Ý', 'द्व': 'å', 'द्घ': '¢',
      'क्र': 'qm', 'क्त': 'Qm', 'फ्र': 'k|m', 'ट्र': '6«', 'ठ्र': '7«', 'ड्र': '8«', 'ढ्र': '9«',
      'ड़': '8Þ', 'ढ़': '9Þ',
      'ॐ': 'ç', 'ऽ': '˜', '।': '.', '॥': '..',
      'अ': 'c', 'आ': 'cf', 'इ': 'O', 'ई': 'O{', 'उ': 'p', 'ऊ': 'pm', 'ऋ': 'C', 'ए': 'P', 'ऐ': 'P]',
      'ओ': 'cf]', 'औ': 'cf}', 'ऑ': 'cf‘',
      'ा': 'f', 'ि': 'l', 'ी': 'L', 'ु': "'", 'ू': '"', 'ृ': '[', 'े': ']', 'ै': '}', 'ो': 'f]', 'ौ': 'f}',
      'ॉ': 'f‘', 'ं': '+', 'ँ': 'F', 'ः': 'M', '्': '\\', '़': 'Þ', '्य': 'Ø', '्र': '|',
      '.': '=', '(': '-', ')': '_', '=': 'Ö', ';': 'Ù', '?': '<', '/': '÷', '’': 'Ú', "'": 'Ú', '!': 'Û', '%': 'Ü'
    };
    Object.keys(FULL_KEY).forEach(function (c) {
      m[c] = FULL_KEY[c];
      if (HALF_KEY[c]) {
        m[c + '्'] = HALF_KEY[c];
      } else if (!m[c + '्']) {
        m[c + '्'] = FULL_KEY[c] + '\\';
      }
      if (!m[c + '्र']) m[c + '्र'] = FULL_KEY[c] + '|';
    });
    for (let d = 0; d < 10; d++) m[DEV_DIGITS[d]] = ')!@#$%^&*('[d];
    return m;
  })();

  // Romanized -> Unicode --------------------------------------------------------------------
  let R_CONS = {
    'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'Ng': 'ङ', 'ch': 'च', 'chh': 'छ', 'Ch': 'छ', 'c': 'च',
    'j': 'ज', 'jh': 'झ', 'Ny': 'ञ', 'T': 'ट', 'Th': 'ठ', 'D': 'ड', 'Dh': 'ढ', 'N': 'ण', 't': 'त',
    'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न', 'p': 'प', 'ph': 'फ', 'f': 'फ', 'b': 'ब', 'bh': 'भ',
    'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 'sh': 'श', 'Sh': 'ष', 's': 'स',
    'h': 'ह', 'x': 'क्ष', 'ksh': 'क्ष', 'tr': 'त्र', 'gy': 'ज्ञ', 'q': 'क', 'z': 'ज'
  };
  let R_VOWEL = {  // [independent, sign]
    'a': ['अ', ''], 'aa': ['आ', 'ा'], 'A': ['आ', 'ा'], 'i': ['इ', 'ि'], 'ii': ['ई', 'ी'], 'ee': ['ई', 'ी'],
    'I': ['ई', 'ी'], 'u': ['उ', 'ु'], 'uu': ['ऊ', 'ू'], 'oo': ['ऊ', 'ू'], 'U': ['ऊ', 'ू'], 'Ri': ['ऋ', 'ृ'],
    'e': ['ए', 'े'], 'ai': ['ऐ', 'ै'], 'o': ['ओ', 'ो'], 'au': ['औ', 'ौ'], 'ou': ['औ', 'ौ']
  };
  let R_SIGN = { 'M': 'ं', '~': 'ँ', 'H': 'ः', 'OM': 'ॐ', '..': '..', '.': '।', '|': '।' };

  // Unicode -> Roman --------------------------------------------------------------------------
  let ROMAN_CONS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
    'ञ': 'ny', 'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd',
    'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r',
    'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'क़': 'q', 'ख़': 'kh', 'ग़': 'g',
    'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f', 'य़': 'y'
  };
  ROMAN_CONS = (function (src) {
    let out = {};
    Object.keys(src).forEach(function (k) { out[k.normalize ? k.normalize('NFC') : k] = src[k]; });
    return out;
  })(ROMAN_CONS);
  let ROMAN_VOWEL = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai',
    'ओ': 'o', 'औ': 'au', 'ऑ': 'o', 'ा': 'aa', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o'
  };

  // Helpers -----------------------------------------------------------------------------------
  function str(text) {
    if (text === null || text === undefined) return '';
    return String(text);
  }

  function longestMatchTranslate(text, map) {
    let keys = Object.keys(map);
    let maxLen = 0;
    keys.forEach(function (k) { if (k.length > maxLen) maxLen = k.length; });
    let out = '';
    let i = 0;
    while (i < text.length) {
      let hit = false;
      for (let len = Math.min(maxLen, text.length - i); len > 0; len--) {
        let chunk = text.substr(i, len);
        if (Object.prototype.hasOwnProperty.call(map, chunk)) {
          out += map[chunk];
          i += len;
          hit = true;
          break;
        }
      }
      if (!hit) {
        out += text[i];
        i += 1;
      }
    }
    return out;
  }

  // Public API --------------------------------------------------------------------------------

  /** Convert text typed in the Preeti font into Nepali Unicode. */
  function preetiToUnicode(text) {
    let s = str(text)
      .replace(/'m/g, "m'").replace(/"m/g, 'm"').replace(/\]m/g, 'm]');  // matra typed before the hook
    s = longestMatchTranslate(s, PREETI_MAP);
    s = s.replace(/्ा/g, '');                                    // half form + bar = full letter
    s = s.replace(new RegExp('ि(' + CLUSTER + ')', 'g'), '$1ि');  // ि is typed before its cluster
    s = s.replace(/ाे/g, 'ो').replace(/ाै/g, 'ौ')  // ा+े=ो, ा+ै=ौ
      .replace(/अा/g, 'आ').replace(/आे/g, 'ओ').replace(/आै/g, 'औ')
      .replace(/एे/g, 'ऐ');
    // Reph: Preeti types र् after the syllable it sits on; Unicode stores it first.
    s = s.replace(new RegExp('(' + CLUSTER + '[' + MATRA + ']*[ंँ]?)र्', 'g'), 'र्$1');
    s = s.replace(/([ंँ])([ा-ौ])/g, '$2$1');           // matra before anusvara/candrabindu
    return s.normalize ? s.normalize('NFC') : s;
  }

  /**
   * Convert Nepali Unicode into Preeti-font text.
   * options.digits: 'devanagari' (default) maps 0-9 to Preeti's Devanagari digit keys; 'keep' leaves them.
   */
  function unicodeToPreeti(text, options) {
    let opts = options || {};
    let s = str(text).normalize ? str(text).normalize('NFC') : str(text);
    if (opts.digits !== 'keep') s = toNepaliDigits(s);
    // Reph moves after its syllable, then ि moves before its cluster (Preeti's visual order).
    s = s.replace(new RegExp('र्(' + CLUSTER + '[' + MATRA + ']*[ंँ]?)', 'g'), '$1{');
    s = s.replace(new RegExp('(' + CLUSTER + ')ि', 'g'), 'ि$1');
    return longestMatchTranslate(s, Object.assign({}, UNICODE_MAP, { '{': '{' }));
  }

  let ROMAN_TABLES = [R_SIGN, R_CONS, R_VOWEL];  // 0 sign, 1 consonant, 2 vowel

  /** Longest Romanized token at position `at`: { table, key } or null. */
  function matchRoman(s, at) {
    for (let len = Math.min(3, s.length - at); len > 0; len--) {
      let chunk = s.substr(at, len);
      for (let t = 0; t < ROMAN_TABLES.length; t++) {
        if (Object.prototype.hasOwnProperty.call(ROMAN_TABLES[t], chunk)) return { table: t, key: chunk };
      }
    }
    let lower = s[at].toLowerCase();
    if (lower !== s[at]) {
      for (let u = 1; u < ROMAN_TABLES.length; u++) {
        if (Object.prototype.hasOwnProperty.call(ROMAN_TABLES[u], lower)) return { table: u, key: lower };
      }
    }
    return null;
  }

  /**
   * Transliterate Romanized Nepali into Unicode.
   * Text inside {braces} is kept as-is. "\" forces a halant. options.digits: 'devanagari' (default) | 'keep'.
   */
  function romanToUnicode(text, options) {
    let opts = options || {};
    let s = str(text);
    let out = '';
    let afterConsonant = false;
    let i = 0;
    while (i < s.length) {
      let ch = s[i];
      if (ch === '{') {
        let end = s.indexOf('}', i + 1);
        if (end === -1) end = s.length;
        out += s.slice(i + 1, end);
        i = end + 1;
        afterConsonant = false;
        continue;
      }
      if (ch === '\\') {
        if (afterConsonant) out += '्';
        afterConsonant = false;
        i += 1;
        continue;
      }
      let m = matchRoman(s, i);
      if (!m) {
        out += (/[0-9]/.test(ch) && opts.digits !== 'keep') ? DEV_DIGITS[+ch] : ch;
        afterConsonant = false;
        i += 1;
        continue;
      }
      let table = ROMAN_TABLES[m.table];
      if (m.table === 1) {                     // consonant
        if (afterConsonant) out += '्';
        out += table[m.key];
        afterConsonant = true;
      } else if (m.table === 2) {              // vowel
        out += afterConsonant ? table[m.key][1] : table[m.key][0];
        afterConsonant = false;
      } else {                                 // sign / punctuation
        out += table[m.key];
        afterConsonant = false;
      }
      i += m.key.length;
    }
    return out;
  }

  /** Approximate Latin transliteration of Nepali Unicode (useful for URLs, search, filenames). */
  function unicodeToRoman(text) {
    let s = str(text).normalize ? str(text).normalize('NFC') : str(text);
    let units = [];  // {c: consonant roman, v: vowel roman|null (null = inherent), halant}
    let out = '';

    function flush() {
      for (let k = 0; k < units.length; k++) {
        let u = units[k];
        if (u.raw !== undefined) { out += u.raw; continue; }
        out += u.c;
        if (u.halant) continue;
        if (u.v !== null) { out += u.v; continue; }
        let next = units[k + 1];
        let prev = units[k - 1];
        let isLast = !next || next.raw !== undefined;
        // Final schwa is silent ("nepal"), except after a conjunct ("kshetra") or य ("vidyalaya").
        let schwaDrop = isLast && k > 0 && prev && prev.raw === undefined && !prev.halant && u.c !== 'y';
        // Delete a medial schwa between a full vowel and a consonant that carries its own vowel sign.
        if (!schwaDrop && prev && prev.raw === undefined && prev.v && next && next.raw === undefined && next.v) {
          schwaDrop = true;
        }
        if (!schwaDrop) out += 'a';
      }
      units = [];
    }

    for (let i = 0; i < s.length; i++) {
      let ch = s[i];
      if (s[i + 1] === '\u093C' && ROMAN_CONS[ch + '\u093C']) { ch += '\u093C'; i += 1; }
      if (ROMAN_CONS[ch]) {
        units.push({ c: ROMAN_CONS[ch], v: null, halant: false });
      } else if (ch === '्' && units.length && units[units.length - 1].c !== undefined) {
        units[units.length - 1].halant = true;
      } else if (/[ा-ौृ]/.test(ch) && units.length && units[units.length - 1].c !== undefined) {
        units[units.length - 1].v = ROMAN_VOWEL[ch] || '';
      } else if (ROMAN_VOWEL[ch]) {
        units.push({ c: '', v: ROMAN_VOWEL[ch], halant: false });
      } else if (ch === 'ं' || ch === 'ँ') {
        units.push({ raw: 'n' });
      } else if (ch === 'ः') {
        units.push({ raw: 'h' });
      } else if (ch === '़') {
        // stray nukta: ignore
      } else if (DEV_DIGITS.indexOf(ch) !== -1) {
        flush();
        out += String(DEV_DIGITS.indexOf(ch));
      } else if (ch === '।' || ch === '॥') {
        flush();
        out += '.';
      } else {
        flush();
        out += ch;
      }
    }
    flush();
    return out.replace(/aa/g, 'a');
  }

  /** URL slug from Nepali (or mixed) text, e.g. "नेपाल समाचार" -> "nepal-samachar". */
  function slugify(text, maxLength) {
    let limit = maxLength || 80;
    let slug = unicodeToRoman(text).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (slug.length > limit) slug = slug.slice(0, limit).replace(/-[^-]*$/, '');
    return slug;
  }

  function toNepaliDigits(text) {
    return str(text).replace(/[0-9]/g, function (d) { return DEV_DIGITS[+d]; });
  }

  function toEnglishDigits(text) {
    return str(text).replace(/[०-९]/g, function (d) { return String(DEV_DIGITS.indexOf(d)); });
  }

  /** Format a number with Nepali (lakh/crore) grouping: 1234567.5 -> "१२,३४,५६७.५". */
  function formatNumber(value, options) {
    let opts = options || {};
    let raw = toEnglishDigits(str(value)).replace(/,/g, '').trim();
    if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new TypeError('formatNumber expects a numeric value');
    let negative = raw[0] === '-';
    if (negative) raw = raw.slice(1);
    let parts = raw.split('.');
    let intPart = parts[0];
    let last3 = intPart.slice(-3);
    let rest = intPart.slice(0, -3);
    let grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
    if (typeof opts.decimals === 'number') {
      let frac = (parts[1] || '').padEnd(opts.decimals, '0').slice(0, opts.decimals);
      parts[1] = frac;
    }
    let result = (negative ? '-' : '') + grouped + (parts[1] ? '.' + parts[1] : '');
    return opts.digits === 'english' ? result : toNepaliDigits(result);
  }

  /**
   * Guess what a text is written in: 'unicode', 'preeti', 'roman' or 'empty'.
   * Returns { type, confidence } where confidence is 0..1.
   */
  function detect(text) {
    let s = str(text).trim();
    if (!s) return { type: 'empty', confidence: 1 };
    let dev = (s.match(/[ऀ-ॿ]/g) || []).length;
    let letters = (s.match(/[A-Za-zऀ-ॿ]/g) || []).length || 1;
    if (dev / letters > 0.3) return { type: 'unicode', confidence: Math.min(1, dev / letters) };
    let latin = (s.match(/[A-Za-z]/g) || []).length || 1;
    let bar = (s.match(/f/g) || []).length / latin;
    let inWord = (s.match(/[A-Za-z][\]\[\{\}'";|\\][A-Za-z]/g) || []).length;
    let words = s.split(/\s+/).length;
    let score = Math.min(1, bar * 6) * 0.6 + Math.min(1, inWord / Math.max(1, words) * 2) * 0.4;
    return score >= 0.35 ? { type: 'preeti', confidence: +score.toFixed(2) }
      : { type: 'roman', confidence: +(1 - score).toFixed(2) };
  }

  /** Character (grapheme), word and line counts that are correct for Devanagari. */
  function stats(text) {
    let s = str(text);
    let graphemes;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      graphemes = Array.from(new Intl.Segmenter('ne', { granularity: 'grapheme' }).segment(s)).length;
    } else {
      graphemes = s.replace(/[ऀ-ःऺ-ॏ॑-ॗॢॣ]/g, '').length;
    }
    let trimmed = s.trim();
    return {
      characters: graphemes,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: s ? s.split(/\r\n|\r|\n/).length : 0
    };
  }

  /** Convert by mode name; used by the UI, CLI and embeds. */
  function convert(text, mode, options) {
    switch (mode) {
      case 'preeti-to-unicode': return preetiToUnicode(text);
      case 'unicode-to-preeti': return unicodeToPreeti(text, options);
      case 'roman-to-unicode': return romanToUnicode(text, options);
      case 'unicode-to-roman': return unicodeToRoman(text);
      case 'slug': return slugify(text);
      default: throw new Error('Unknown mode: ' + mode);
    }
  }

  return {
    VERSION: VERSION,
    MODES: ['roman-to-unicode', 'preeti-to-unicode', 'unicode-to-preeti', 'unicode-to-roman', 'slug'],
    convert: convert,
    preetiToUnicode: preetiToUnicode,
    unicodeToPreeti: unicodeToPreeti,
    romanToUnicode: romanToUnicode,
    unicodeToRoman: unicodeToRoman,
    slugify: slugify,
    toNepaliDigits: toNepaliDigits,
    toEnglishDigits: toEnglishDigits,
    formatNumber: formatNumber,
    detect: detect,
    stats: stats
  };
});
