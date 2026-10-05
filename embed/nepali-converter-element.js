/*!
 * <nepali-converter> web component. Drop-in converter for any website, no framework needed.
 * Requires src/nepali-converter.js to be loaded first.
 *
 *   <script src=".../src/nepali-converter.js"></script>
 *   <script src=".../embed/nepali-converter-element.js"></script>
 *   <nepali-converter mode="preeti-to-unicode" theme="auto" lang-ui="ne"></nepali-converter>
 *
 * Attributes: mode (roman-to-unicode | preeti-to-unicode | unicode-to-preeti | unicode-to-roman | slug),
 *             theme (auto | light | dark), lang-ui (en | ne), modes (comma list of tabs to show).
 * Events:     "convert" (detail: { mode, input, output }) after every conversion.
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || window.customElements.get('nepali-converter')) return;

  let LABELS = {
    en: {
      'roman-to-unicode': 'Roman → Unicode', 'preeti-to-unicode': 'Preeti → Unicode',
      'unicode-to-preeti': 'Unicode → Preeti', 'unicode-to-roman': 'Unicode → Roman', 'slug': 'URL slug',
      input: 'Input', output: 'Output', copy: 'Copy', copied: 'Copied', clear: 'Clear', modes: 'Conversion mode'
    },
    ne: {
      'roman-to-unicode': 'रोमन → युनिकोड', 'preeti-to-unicode': 'प्रीति → युनिकोड',
      'unicode-to-preeti': 'युनिकोड → प्रीति', 'unicode-to-roman': 'युनिकोड → रोमन', 'slug': 'URL स्लग',
      input: 'इनपुट', output: 'नतिजा', copy: 'कपी', copied: 'कपी भयो', clear: 'मेटाउनुहोस्', modes: 'रूपान्तरण प्रकार'
    }
  };

  let CSS = ':host{--nc-bg:#fff;--nc-surface:#f8fafc;--nc-text:#0f172a;--nc-muted:#475569;--nc-border:#cbd5e1;' +
    '--nc-primary:#b91c1c;--nc-on-primary:#fff;--nc-focus:#1d4ed8;display:block;font:16px/1.6 system-ui,sans-serif;color:var(--nc-text)}' +
    ':host([theme="dark"]){--nc-bg:#111827;--nc-surface:#0b1120;--nc-text:#e2e8f0;--nc-muted:#94a3b8;--nc-border:#334155;--nc-primary:#f87171;--nc-on-primary:#0b1120;--nc-focus:#93c5fd}' +
    '@media (prefers-color-scheme:dark){:host([theme="auto"]),:host(:not([theme])){--nc-bg:#111827;--nc-surface:#0b1120;--nc-text:#e2e8f0;--nc-muted:#94a3b8;--nc-border:#334155;--nc-primary:#f87171;--nc-on-primary:#0b1120;--nc-focus:#93c5fd}}' +
    '.box{background:var(--nc-bg);border:1px solid var(--nc-border);border-radius:12px;padding:12px}' +
    '.tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}' +
    'button{min-height:44px;padding:6px 12px;border-radius:8px;border:1px solid var(--nc-border);background:var(--nc-surface);color:var(--nc-text);font:inherit;font-size:14px;cursor:pointer}' +
    'button[aria-selected="true"],button.primary{background:var(--nc-primary);border-color:var(--nc-primary);color:var(--nc-on-primary)}' +
    'button:focus-visible,textarea:focus-visible{outline:3px solid var(--nc-focus);outline-offset:2px}' +
    '.grid{display:grid;gap:10px}@media (min-width:640px){.grid{grid-template-columns:1fr 1fr}}' +
    'label{display:block;font-weight:600;font-size:14px;margin-bottom:4px}' +
    'textarea{box-sizing:border-box;width:100%;min-height:150px;padding:10px;border-radius:8px;border:1px solid var(--nc-border);background:var(--nc-surface);color:var(--nc-text);' +
    'font:18px/1.7 "Noto Sans Devanagari","Kalimati","Mangal",system-ui,sans-serif;resize:vertical}' +
    '.row{display:flex;gap:6px;margin-top:6px}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}';

  let uid = 0;

  function NepaliConverterElement() {
    return Reflect.construct(HTMLElement, [], NepaliConverterElement);
  }
  NepaliConverterElement.prototype = Object.create(HTMLElement.prototype);
  NepaliConverterElement.prototype.constructor = NepaliConverterElement;
  Object.setPrototypeOf(NepaliConverterElement, HTMLElement);
  NepaliConverterElement.observedAttributes = ['mode', 'lang-ui'];

  NepaliConverterElement.prototype.connectedCallback = function () {
    if (this._ready) return;
    this._ready = true;
    this._id = 'nc' + (++uid);
    this.attachShadow({ mode: 'open' });
    this.render();
  };

  NepaliConverterElement.prototype.attributeChangedCallback = function () {
    if (this._ready) this.render();
  };

  NepaliConverterElement.prototype.render = function () {
    let N = window.NepaliConverter;
    let root = this.shadowRoot;
    let self = this;
    if (!N) {
      root.textContent = 'Load nepali-converter.js before nepali-converter-element.js';
      return;
    }
    let t = LABELS[this.getAttribute('lang-ui')] || LABELS.en;
    let allowed = (this.getAttribute('modes') || N.MODES.join(',')).split(',').map(function (m) { return m.trim(); })
      .filter(function (m) { return N.MODES.indexOf(m) !== -1; });
    if (!allowed.length) allowed = N.MODES.slice();
    let mode = allowed.indexOf(this.getAttribute('mode')) !== -1 ? this.getAttribute('mode') : allowed[0];
    let keep = root.querySelector('textarea') ? root.querySelector('textarea').value : '';
    root.textContent = '';

    let style = document.createElement('style');
    style.textContent = CSS;
    let box = document.createElement('div');
    box.className = 'box';
    let tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', t.modes);
    allowed.forEach(function (m) {
      let b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', m === mode ? 'true' : 'false');
      b.textContent = t[m];
      b.addEventListener('click', function () { self.setAttribute('mode', m); });
      tabs.appendChild(b);
    });
    if (allowed.length < 2) tabs.hidden = true;

    let grid = document.createElement('div');
    grid.className = 'grid';
    let inWrap = document.createElement('div');
    let outWrap = document.createElement('div');
    let inLabel = document.createElement('label');
    let outLabel = document.createElement('label');
    let input = document.createElement('textarea');
    let output = document.createElement('textarea');
    input.id = this._id + '-in';
    output.id = this._id + '-out';
    inLabel.htmlFor = input.id;
    outLabel.htmlFor = output.id;
    inLabel.textContent = t.input;
    outLabel.textContent = t.output;
    output.readOnly = true;
    input.spellcheck = false;
    input.value = keep;

    let row = document.createElement('div');
    row.className = 'row';
    let copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'primary';
    copy.textContent = t.copy;
    let clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = t.clear;
    let live = document.createElement('span');
    live.className = 'sr';
    live.setAttribute('role', 'status');

    function update() {
      output.value = N.convert(input.value, mode);
      self.dispatchEvent(new CustomEvent('convert', { detail: { mode: mode, input: input.value, output: output.value } }));
    }
    input.addEventListener('input', update);
    copy.addEventListener('click', function () {
      let ok = function () { live.textContent = t.copied; copy.textContent = t.copied; setTimeout(function () { copy.textContent = t.copy; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(output.value).then(ok); }
      else { output.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* user can copy manually */ } }
    });
    clear.addEventListener('click', function () { input.value = ''; update(); input.focus(); });

    inWrap.appendChild(inLabel); inWrap.appendChild(input);
    outWrap.appendChild(outLabel); outWrap.appendChild(output);
    row.appendChild(copy); row.appendChild(clear); row.appendChild(live);
    outWrap.appendChild(row);
    grid.appendChild(inWrap); grid.appendChild(outWrap);
    box.appendChild(tabs); box.appendChild(grid);
    root.appendChild(style); root.appendChild(box);
    update();
  };

  window.customElements.define('nepali-converter', NepaliConverterElement);
})();
