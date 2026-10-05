/*!
 * Nepali Unicode Converter - web app controller
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
 */
(function () {
  'use strict';

  let N = window.NepaliConverter;
  let MAX_FILE_BYTES = 2 * 1024 * 1024;
  let HISTORY_KEY = 'nuc-history';
  let HISTORY_LIMIT = 10;

  let MODES = {
    'roman-to-unicode': {
      input: 'Romanized text', output: 'Nepali Unicode', inPh: 'mero naam pradiip ho', outPh: 'मेरो नाम प्रदीप हो',
      inNe: false, outNe: true, reverse: 'unicode-to-roman', short: 'Roman → Unicode'
    },
    'preeti-to-unicode': {
      input: 'Preeti text', output: 'Nepali Unicode', inPh: 'g]kfn ;/sf/', outPh: 'नेपाल सरकार',
      inNe: false, outNe: true, reverse: 'unicode-to-preeti', short: 'Preeti → Unicode'
    },
    'unicode-to-preeti': {
      input: 'Nepali Unicode', output: 'Preeti text (paste into a document set in the Preeti font)',
      inPh: 'नेपाल सरकार', outPh: 'g]kfn ;/sf/', inNe: true, outNe: false, reverse: 'preeti-to-unicode',
      short: 'Unicode → Preeti'
    },
    'unicode-to-roman': {
      input: 'Nepali Unicode', output: 'Roman (approximate)', inPh: 'नमस्ते नेपाल', outPh: 'namaste nepal',
      inNe: true, outNe: false, reverse: 'roman-to-unicode', short: 'Unicode → Roman'
    },
    'slug': {
      input: 'Nepali title', output: 'URL slug', inPh: 'नेपालको राजनीतिक समाचार', outPh: 'nepalko-rajnitik-samachar',
      inNe: true, outNe: false, reverse: null, short: 'URL slug'
    }
  };

  let $ = function (id) { return document.getElementById(id); };
  let el = {
    input: $('input'), output: $('output'), inLabel: $('input-label'), outLabel: $('output-label'),
    inStats: $('input-stats'), outStats: $('output-stats'), status: $('status'), notice: $('detect-notice'),
    noticeText: $('detect-text'), noticeBtn: $('detect-switch'), swap: $('swap'), copy: $('copy'),
    download: $('download'), clear: $('clear'), file: $('file'), inplace: $('opt-inplace'),
    digits: $('opt-digits'), keepHistory: $('opt-history'), history: $('history'),
    historyClear: $('history-clear'), theme: $('theme-toggle'), panel: $('converter'),
    numIn: $('num-input'), numOut: $('num-output'), numEnglish: $('num-english')
  };
  let tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  let mode = 'roman-to-unicode';
  let suggestedMode = null;

  // Storage that never throws (private mode, blocked cookies, quota).
  let store = {
    get: function (key, fallback) {
      try { let v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    }
  };

  function announce(message) {
    el.status.textContent = '';
    window.setTimeout(function () { el.status.textContent = message; }, 30);
  }

  function describe(stats) {
    let plural = function (n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); };
    return plural(stats.characters, 'character') + ' · ' + plural(stats.words, 'word');
  }

  function options() {
    return { digits: el.digits.checked ? 'devanagari' : 'keep' };
  }

  function run() {
    let text = el.input.value;
    let out = '';
    try {
      out = N.convert(text, mode, options());
    } catch (err) {
      out = '';
      announce('Conversion failed: ' + err.message);
    }
    el.output.value = out;
    el.inStats.textContent = describe(N.stats(text));
    el.outStats.textContent = describe(N.stats(out));
    suggest(text);
  }

  function suggest(text) {
    suggestedMode = null;
    if (text.trim().length >= 6) {
      let found = N.detect(text).type;
      if (found === 'preeti' && mode !== 'preeti-to-unicode') {
        suggestedMode = 'preeti-to-unicode';
        el.noticeText.textContent = 'This looks like Preeti text.';
      } else if (found === 'unicode' && (mode === 'roman-to-unicode' || mode === 'preeti-to-unicode')) {
        suggestedMode = 'unicode-to-preeti';
        el.noticeText.textContent = 'This is already Nepali Unicode.';
      }
    }
    el.noticeBtn.textContent = suggestedMode ? 'Switch to ' + MODES[suggestedMode].short : 'Switch mode';
    el.notice.classList.toggle('show', !!suggestedMode);
  }

  function setMode(next, keepText) {
    if (!MODES[next]) return;
    mode = next;
    let meta = MODES[next];
    tabs.forEach(function (t) {
      let on = t.getAttribute('data-mode') === next;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) el.panel.setAttribute('aria-labelledby', t.id);
    });
    el.inLabel.textContent = meta.input;
    el.outLabel.textContent = meta.output;
    el.input.placeholder = meta.inPh;
    el.output.placeholder = meta.outPh;
    el.input.classList.toggle('ne', meta.inNe);
    el.output.classList.toggle('ne', meta.outNe);
    el.swap.disabled = !meta.reverse;
    el.inplace.disabled = next !== 'roman-to-unicode';
    if (!keepText) el.input.value = '';
    try {
      let url = new URL(window.location.href);
      url.searchParams.set('mode', next);
      window.history.replaceState(null, '', url);
    } catch (e) { /* file:// or sandboxed frame */ }
    run();
  }

  function swap() {
    let meta = MODES[mode];
    if (!meta.reverse) return;
    let out = el.output.value;
    setMode(meta.reverse, true);
    el.input.value = out;
    run();
    announce('Direction swapped to ' + MODES[mode].short);
  }

  // History ---------------------------------------------------------------------------------
  function saveHistory() {
    if (!el.keepHistory.checked || !el.input.value.trim()) return;
    let items = store.get(HISTORY_KEY, []).filter(function (h) { return !(h.mode === mode && h.input === el.input.value); });
    items.unshift({ mode: mode, input: el.input.value.slice(0, 5000), t: Date.now() });
    store.set(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
    renderHistory();
  }

  function renderHistory() {
    let items = store.get(HISTORY_KEY, []);
    el.history.textContent = '';
    if (!items.length) {
      let li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Conversions you copy or download appear here.';
      el.history.appendChild(li);
      return;
    }
    items.forEach(function (h) {
      if (!MODES[h.mode]) return;
      let li = document.createElement('li');
      let b = document.createElement('button');
      b.type = 'button';
      b.textContent = MODES[h.mode].short + ': ' + h.input.replace(/\s+/g, ' ').slice(0, 80);
      b.addEventListener('click', function () { setMode(h.mode, true); el.input.value = h.input; run(); el.input.focus(); });
      li.appendChild(b);
      el.history.appendChild(li);
    });
  }

  // Actions ---------------------------------------------------------------------------------
  function copyOutput() {
    let text = el.output.value;
    if (!text) { announce('Nothing to copy yet'); return; }
    let done = function () { announce('Copied to clipboard'); el.copy.firstChild.textContent = 'Copied '; saveHistory();
      window.setTimeout(function () { el.copy.firstChild.textContent = 'Copy '; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      el.output.select();
      try { document.execCommand('copy'); done(); } catch (e) { announce('Select the text and press Ctrl+C to copy'); }
    }
  }

  function downloadOutput() {
    if (!el.output.value) { announce('Nothing to download yet'); return; }
    let blob = new Blob(['﻿' + el.output.value], { type: 'text/plain;charset=utf-8' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nepali-' + mode + '.txt';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    saveHistory();
    announce('Download started');
  }

  function openFile() {
    let f = el.file.files && el.file.files[0];
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) { announce('File is larger than 2 MB. Split it and try again.'); el.file.value = ''; return; }
    let reader = new FileReader();
    reader.onload = function () { el.input.value = String(reader.result).replace(/^﻿/, ''); run(); announce('Loaded ' + f.name); };
    reader.onerror = function () { announce('Could not read ' + f.name); };
    reader.readAsText(f, 'utf-8');
    el.file.value = '';
  }

  // Type-in-place: convert the word just finished in Romanized mode.
  function onInput(e) {
    if (el.inplace.checked && mode === 'roman-to-unicode' && e && e.inputType === 'insertText' &&
        /^[\s.,?!;:]$/.test(e.data || '')) {
      let caret = el.input.selectionStart;
      let before = el.input.value.slice(0, caret);
      let m = before.match(/([^\s]*[A-Za-z~\\][^\s]*?)([\s.,?!;:])$/);
      if (m && m[1].indexOf('{') === -1) {
        let converted = N.romanToUnicode(m[1] + (m[2] === '.' ? '.' : ''), options()) + (m[2] === '.' ? '' : m[2]);
        let start = caret - m[0].length;
        el.input.value = el.input.value.slice(0, start) + converted + el.input.value.slice(caret);
        let pos = start + converted.length;
        el.input.setSelectionRange(pos, pos);
      }
    }
    run();
  }

  // Theme -------------------------------------------------------------------------------------
  function effectiveTheme() {
    let t = document.documentElement.dataset.theme;
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeButton() {
    let next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    el.theme.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    el.theme.textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
  }

  // Number formatter --------------------------------------------------------------------------
  function formatNumber() {
    let v = el.numIn.value.trim() || '1234567.50';
    try {
      el.numOut.textContent = N.formatNumber(v, { digits: el.numEnglish.checked ? 'english' : 'nepali' });
    } catch (e) {
      el.numOut.textContent = 'Enter a number such as 1234567.50';
    }
  }

  // Wiring ------------------------------------------------------------------------------------
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setMode(t.getAttribute('data-mode'), false); });
    t.addEventListener('keydown', function (e) {
      let d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      let next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      setMode(next.getAttribute('data-mode'), false);
    });
  });
  el.input.addEventListener('input', onInput);
  el.input.addEventListener('blur', saveHistory);
  el.digits.addEventListener('change', run);
  el.swap.addEventListener('click', swap);
  el.copy.addEventListener('click', copyOutput);
  el.download.addEventListener('click', downloadOutput);
  el.clear.addEventListener('click', function () { el.input.value = ''; run(); el.input.focus(); announce('Cleared'); });
  el.file.addEventListener('change', openFile);
  el.noticeBtn.addEventListener('click', function () { if (suggestedMode) setMode(suggestedMode, true); });
  el.historyClear.addEventListener('click', function () { store.set(HISTORY_KEY, []); renderHistory(); announce('History cleared'); });
  el.keepHistory.addEventListener('change', function () { store.set('nuc-keep-history', el.keepHistory.checked); });
  el.theme.addEventListener('click', function () {
    let next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('nuc-theme', next); } catch (e) { /* ignore */ }
    syncThemeButton();
  });
  el.numIn.addEventListener('input', formatNumber);
  el.numEnglish.addEventListener('change', formatNumber);
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); copyOutput(); }
    if (e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); swap(); }
  });

  el.keepHistory.checked = store.get('nuc-keep-history', true) !== false;
  let initial = 'roman-to-unicode';
  try { initial = new URL(window.location.href).searchParams.get('mode') || initial; } catch (e) { /* ignore */ }
  setMode(MODES[initial] ? initial : 'roman-to-unicode', false);
  renderHistory();
  syncThemeButton();
  formatNumber();

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
