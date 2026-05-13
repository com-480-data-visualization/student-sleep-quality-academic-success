/* main.js — entry point. Loads CSV → seeds state → wires the filter bar →
   initializes every chart. Each chart subscribes to filter:change itself,
   so this file stays small. */

import { loadData } from './data.js';
import { setRows, getFilteredRows } from './state.js';
import { initFilterBar } from './filterBar.js';
import { downloadCsv } from './utils.js';
import { initHeatmap } from './charts/heatmap.js';
import { initStacked } from './charts/stacked.js';
import { initParallel } from './charts/parallel.js';
import { initSankey }  from './charts/sankey.js';
import { initRadar }   from './charts/radar.js';
import { initScrolly } from './charts/scrolly.js';

async function boot() {
  try {
    const rows = await loadData('data/students.csv');
    setRows(rows);

    // hero counter
    const totalEl = document.getElementById('stat-n');
    if (totalEl) totalEl.textContent = rows.length.toLocaleString();

    // filter bar + chart inits
    initFilterBar();
    initHeatmap(document.getElementById('heatmap'));
    initStacked(document.getElementById('stacked'));
    initParallel(document.getElementById('parallel'));
    initSankey(document.getElementById('sankey'));
    initRadar(document.getElementById('radar'));
    initScrolly(rows);

    // Accessible labelling for every SVG root so screen readers know what's
    // inside without us repeating ourselves in each chart file.
    document.querySelectorAll('.chart-card').forEach(card => {
      const h3 = card.querySelector('h3');
      const sub = card.querySelector('.subtitle, .section-desc');
      const svg = card.querySelector('svg');
      if (svg && h3) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', h3.textContent + (sub ? '. ' + sub.textContent : ''));
      }
    });

    // download
    const dl = document.getElementById('btn-download');
    if (dl) dl.addEventListener('click', () => downloadCsv(getFilteredRows(), 'students-filtered.csv'));

    console.log('[main] boot OK');
  } catch (err) {
    console.error('[main] boot failed', err);
    document.body.insertAdjacentHTML('beforeend',
      `<div style="position:fixed;bottom:1rem;right:1rem;background:#ffffff;color:#1c1917;
        padding:0.9rem 1.1rem;border-radius:10px;font:0.85rem 'Inter',system-ui,sans-serif;
        border-left:3px solid #ea580c;box-shadow:0 12px 32px -10px rgba(28,25,23,0.18);
        max-width:380px;line-height:1.5">
        <strong style="color:#ea580c">Failed to load dataset.</strong><br>
        ${String(err).replace(/</g, '&lt;')}<br>
        <span style="color:#57534e;font-size:0.78rem">Are you running over a local server (python3 -m http.server)?</span>
      </div>`);
  }
}

document.addEventListener('DOMContentLoaded', boot);
