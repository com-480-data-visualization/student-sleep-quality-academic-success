/* utils.js — shared helpers: tooltip singleton, color scales (single-hue
   sequential for ordinal data per the course palette rules), debounce, CSV
   download. All charts read color through these helpers so palette tweaks
   propagate everywhere. */

import { LABELS, levels } from './data.js';

// ---------- shared tooltip ----------
const tipEl = (() => {
  let el = document.getElementById('tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tooltip';
    el.className = 'tooltip';
    el.setAttribute('role', 'tooltip');
    document.body.appendChild(el);
  }
  return el;
})();

export const tooltip = {
  show(html, ev) {
    tipEl.innerHTML = html;
    tipEl.style.opacity = 1;
    this.move(ev);
  },
  move(ev) {
    const pad = 14;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY - h - pad;
    if (x + w > window.innerWidth - 8)  x = ev.clientX - w - pad;
    if (y < 8)                          y = ev.clientY + pad;
    tipEl.style.left = x + 'px';
    tipEl.style.top  = y + 'px';
  },
  hide() { tipEl.style.opacity = 0; }
};

// ---------- color scales ----------
/* Course rule: ordinal → single-hue sequential. On the light theme we clamp
   the d3 interpolators away from their pale endpoint, so even the lowest
   ord step has enough contrast against the cream paper. The helper below
   wraps a d3 sequential interpolator and rebases its [0, n-1] input to
   [START, 1] of the underlying t-axis. */
function seq(interpolator, n, start = 0.22, end = 0.95) {
  return d3.scaleLinear()
    .domain([0, n - 1])
    .range([start, end])
    .clamp(true)
    .interpolate(() => (t) => interpolator(t));
}

export const COLORS = {
  // Ordinal (single-hue sequential, clamped for light bg)
  quality:     seq(d3.interpolateBlues,    levels('quality')),
  performance: seq(d3.interpolateBlues,    levels('performance')),
  stress:      seq(d3.interpolateOranges,  levels('stress'),  0.28, 0.92),
  duration:    seq(d3.interpolatePurples,  levels('duration')),
  caffeine:    seq(d3.interpolateReds,     levels('caffeine'), 0.28, 0.92),
  electronics: seq(d3.interpolateGreys,    levels('electronics'), 0.25, 0.85),
  activity:    seq(d3.interpolateGreens,   levels('activity'), 0.25, 0.85),
  fatigue:     seq(d3.interpolateOrRd,     levels('fatigue'), 0.25, 0.88),

  // Categorical (2–4 hues max) — brand-coherent
  gender: { Female: '#ea580c', Male: '#0e7490' },     // orange ↔ teal
  year:   d3.scaleOrdinal()
    .domain(LABELS.year)
    .range(['#ea580c', '#0e7490', '#15803d', '#7c3aed']),

  // Diverging (e.g. chi-square residuals on the heatmap)
  diverging: (extent) => d3.scaleDiverging(d3.interpolateRdBu).domain([extent, 0, -extent]),
};

// Convenience accessors that lift a domain-0..n-1 ord into the scale’s range.
export const cQuality     = (ord) => COLORS.quality(ord);
export const cPerformance = (ord) => COLORS.performance(ord);
export const cStress      = (ord) => COLORS.stress(ord);
export const cDuration    = (ord) => COLORS.duration(ord);

// ---------- generic helpers ----------
export function debounce(fn, ms = 120) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* Counts rows by an ordinal key. Returns Array of {ord, raw, count} sorted by ord. */
export function countBy(rows, key) {
  const arr = LABELS[key].map((raw, ord) => ({ ord, raw, count: 0 }));
  for (const r of rows) arr[r[key].ord].count++;
  return arr;
}

/* Cross-tab two ordinal keys. Returns {matrix:[[count]], rowTotals, colTotals, total}. */
export function crossTab(rows, rowKey, colKey) {
  const R = LABELS[rowKey].length, C = LABELS[colKey].length;
  const matrix    = Array.from({ length: R }, () => new Array(C).fill(0));
  const rowTotals = new Array(R).fill(0);
  const colTotals = new Array(C).fill(0);
  for (const r of rows) {
    const i = r[rowKey].ord, j = r[colKey].ord;
    matrix[i][j]++; rowTotals[i]++; colTotals[j]++;
  }
  return { matrix, rowTotals, colTotals, total: rows.length };
}

/* Chi-square standardized residuals — used for heatmap "expected vs actual" toggle. */
export function residuals(ct) {
  const { matrix, rowTotals, colTotals, total } = ct;
  const R = matrix.length, C = matrix[0].length;
  const res = Array.from({ length: R }, () => new Array(C).fill(0));
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const exp = (rowTotals[i] * colTotals[j]) / total;
      res[i][j] = exp > 0 ? (matrix[i][j] - exp) / Math.sqrt(exp) : 0;
    }
  }
  return res;
}

/* Build an SVG inside a container; returns { svg, inner, width, height, margin }.
   Charts call this in their redraw() so they re-measure on resize. */
export function setupSvg(container, { aspect = 0.55, minHeight = 220, maxHeight = 520, margin = { top: 24, right: 24, bottom: 44, left: 56 } } = {}) {
  const w = container.clientWidth || 600;
  const h = Math.max(minHeight, Math.min(maxHeight, Math.round(w * aspect)));
  d3.select(container).selectAll('svg').remove();
  const svg = d3.select(container).append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('role', 'img');
  const inner = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  return { svg, inner, width: w - margin.left - margin.right, height: h - margin.top - margin.bottom, outerW: w, outerH: h, margin };
}

/* Standardized axis call (handles dark theme, no domain stroke) */
export function styleAxis(g) {
  g.classed('axis', true);
  g.selectAll('text').style('font-family', "'Inter', sans-serif");
}

/* Download a JS array of rows as a CSV file. */
export function downloadCsv(rows, filename = 'students-filtered.csv') {
  if (!rows.length) return;
  // Flatten {raw,ord} → raw for export
  const keys = Object.keys(rows[0]).filter(k => k !== 'id');
  const lines = [keys.join(',')];
  for (const r of rows) {
    lines.push(keys.map(k => {
      const v = r[k] && typeof r[k] === 'object' ? r[k].raw : r[k];
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Light formatter: 0.123 → "12.3%" */
export const fmtPct = (x) => (x * 100).toFixed(x < 0.1 ? 1 : 0) + '%';
export const fmtInt = d3.format(',');
