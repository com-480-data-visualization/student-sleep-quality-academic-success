/* filterBar.js — builds the sticky filter bar UI and wires it to state.js.
   The bar offers six controls (gender, year, screens, caffeine, activity,
   stress); each emits filter:change through the global dispatcher. A live
   "N = 996 → N = 247" counter updates with every change. Brushed parallel-
   coordinates ranges appear as dismissible chips in the same row, providing
   one visual home for all active filters. */

import { LABELS, TITLES } from './data.js';
import {
  filterKeys, setFilter, setBrush, resetFilters, on, getState
} from './state.js';

const DROPDOWN_KEYS = ['gender', 'year', 'electronics', 'caffeine', 'activity', 'stress'];

export function initFilterBar() {
  const wrap = document.getElementById('filter-bar-wrap');
  const bar  = document.getElementById('filter-bar');
  if (!wrap || !bar) return;
  wrap.hidden = false;
  bar.innerHTML = '';

  DROPDOWN_KEYS.forEach((key, i) => {
    if (i > 0) {
      const div = document.createElement('div');
      div.className = 'filter-divider';
      bar.appendChild(div);
    }
    const group = document.createElement('div');
    group.className = 'filter-group';
    const lbl = document.createElement('label');
    lbl.htmlFor = `f-${key}`;
    lbl.textContent = TITLES[key];
    group.appendChild(lbl);

    const sel = document.createElement('select');
    sel.id = `f-${key}`;
    sel.setAttribute('aria-label', TITLES[key] + ' filter');
    const allOpt = document.createElement('option');
    allOpt.value = 'all'; allOpt.textContent = 'All';
    sel.appendChild(allOpt);
    LABELS[key].forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => setFilter(key, sel.value));
    group.appendChild(sel);
    bar.appendChild(group);
  });

  // brush chips container
  const chips = document.createElement('div');
  chips.className = 'brush-chips';
  chips.id = 'brush-chips';
  bar.appendChild(chips);

  // counter pill
  const pill = document.createElement('div');
  pill.className = 'count-pill identity';
  pill.id = 'count-pill';
  pill.innerHTML = `
    <span>N = <span class="from"></span></span>
    <span class="arrow">→</span>
    <span class="to"></span>
  `;
  bar.appendChild(pill);

  // download button
  const dl = document.createElement('button');
  dl.className = 'btn';
  dl.id = 'btn-download';
  dl.title = 'Download the currently filtered students as a CSV';
  dl.innerHTML = '⤓ CSV';
  bar.appendChild(dl);

  // reset
  const reset = document.createElement('button');
  reset.className = 'btn btn-primary';
  reset.id = 'btn-reset';
  reset.textContent = '↺ Reset';
  reset.addEventListener('click', () => {
    DROPDOWN_KEYS.forEach(k => { const el = document.getElementById(`f-${k}`); if (el) el.value = 'all'; });
    resetFilters();
  });
  bar.appendChild(reset);

  // subscribe — keep counter + chips synchronized
  on('filter:change.bar', ({ state }) => {
    updateCounter(state);
    renderChips(state);
    syncDropdowns(state);
  });
  // initial draw
  const st = getState();
  updateCounter(st); renderChips(st); syncDropdowns(st);
}

function updateCounter(state) {
  const pill = document.getElementById('count-pill');
  if (!pill) return;
  const identity = state.filteredN === state.totalN
    && Object.keys(state.brushFilters || {}).length === 0;
  pill.classList.toggle('identity', identity);
  pill.querySelector('.from').textContent = state.totalN.toLocaleString();
  pill.querySelector('.to').textContent   = state.filteredN.toLocaleString();
}

function renderChips(state) {
  const host = document.getElementById('brush-chips');
  if (!host) return;
  host.innerHTML = '';
  for (const [k, range] of Object.entries(state.brushFilters || {})) {
    const min = LABELS[k][range.minOrd];
    const max = LABELS[k][range.maxOrd];
    const text = (range.minOrd === range.maxOrd) ? min : `${min} → ${max}`;
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `<span>${TITLES[k]}: ${text}</span><span class="chip-close" aria-label="Remove brush">×</span>`;
    chip.querySelector('.chip-close').addEventListener('click', () => setBrush(k, null));
    host.appendChild(chip);
  }
}

function syncDropdowns(state) {
  for (const k of DROPDOWN_KEYS) {
    const el = document.getElementById(`f-${k}`);
    if (el && el.value !== state.filters[k]) el.value = state.filters[k];
  }
}
