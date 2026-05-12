/* state.js — central filter store + d3.dispatch event bus.
   Every chart subscribes via state.on('filter:change', fn) and receives the
   currently filtered rows. We also keep an additive "brushFilters" map (axis
   ranges contributed by the parallel-coordinates brush) so that a brush on
   any chart funnels into the same downstream pipeline. URL hash mirrors the
   active filter so "share my view" is a copy-paste. */

import { LABELS } from './data.js';

const dispatcher = d3.dispatch('filter:change', 'brush:change', 'select:change');

// Dropdown filter keys — these correspond to UI controls in the filter bar.
const FILTER_KEYS = ['gender', 'year', 'electronics', 'caffeine', 'activity', 'stress'];

const _state = {
  rows: [],                                  // all clean rows
  filters: Object.fromEntries(FILTER_KEYS.map(k => [k, 'all'])),
  brushFilters: {},                          // key -> {minOrd, maxOrd}
  hovered: null,                             // for cross-chart highlight
};

export function setRows(rows) {
  _state.rows = rows;
  readHash();                                // restore filter state if URL has it
  emit();
}

export function setFilter(key, value) {
  _state.filters[key] = value;
  writeHash();
  emit();
}

export function resetFilters() {
  for (const k of FILTER_KEYS) _state.filters[k] = 'all';
  _state.brushFilters = {};
  writeHash();
  emit();
}

export function setBrush(key, range) {     // range = null clears
  if (range === null) delete _state.brushFilters[key];
  else _state.brushFilters[key] = range;
  emit();
}

export function clearBrushes() {
  _state.brushFilters = {};
  emit();
}

export function getState() {
  return {
    filters: { ..._state.filters },
    brushFilters: { ..._state.brushFilters },
    totalN: _state.rows.length,
    filteredN: applyFilters(_state.rows).length,
  };
}

export function getFilteredRows() { return applyFilters(_state.rows); }
export function getAllRows()      { return _state.rows.slice(); }

export function on(type, fn)     { dispatcher.on(type, fn); }
export function emitHover(payload){ dispatcher.call('select:change', null, payload); }

// ---------- internals ----------
function applyFilters(rows) {
  return rows.filter(r => {
    for (const k of FILTER_KEYS) {
      const v = _state.filters[k];
      if (v === 'all') continue;
      if (k === 'gender') { if (r.gender !== v) return false; }
      else                 { if (r[k].raw !== v) return false; }
    }
    for (const [k, range] of Object.entries(_state.brushFilters)) {
      const ord = r[k].ord;
      if (ord < range.minOrd || ord > range.maxOrd) return false;
    }
    return true;
  });
}

function emit() {
  const rows = applyFilters(_state.rows);
  dispatcher.call('filter:change', null, { rows, state: getState() });
}

// ---------- URL hash sync ----------
function writeHash() {
  const parts = [];
  for (const k of FILTER_KEYS) {
    const v = _state.filters[k];
    if (v !== 'all') parts.push(`${k}=${encodeURIComponent(v)}`);
  }
  const hash = parts.length ? '#' + parts.join('&') : '#';
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function readHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return;
  raw.split('&').forEach(part => {
    const [k, v] = part.split('=');
    if (!k) return;
    if (FILTER_KEYS.includes(k)) {
      const dv = decodeURIComponent(v || '');
      if (k === 'gender' && LABELS.gender.includes(dv)) _state.filters[k] = dv;
      else if (LABELS[k] && LABELS[k].includes(dv))     _state.filters[k] = dv;
    }
  });
}

// expose key list for the UI builder
export const filterKeys = FILTER_KEYS.slice();
