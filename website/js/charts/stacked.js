/* stacked.js — Sleep duration → Performance, 100%-stacked horizontal bars.
   RQ2 answer. Each bar is one duration bucket (<4h, 4–5h, 6–7h, 7–8h, >8h),
   segmented by self-rated performance (Poor → Excellent) using a single-hue
   Blues palette so the order is unambiguous. A toggle flips between absolute
   counts and proportions — the proportional view is the one that surfaces
   "more hours doesn't help": adjacent bars look almost identical, killing
   the "sleep more, do better" intuition. */

import { LABELS, SHORT, TITLES } from '../data.js';
import { COLORS, tooltip, setupSvg, styleAxis, fmtInt, fmtPct } from '../utils.js';
import { on, getFilteredRows } from '../state.js';

let mode = 'prop';     // 'prop' | 'abs'
let _container;

export function initStacked(container) {
  _container = container;
  container.innerHTML = '';

  const card = document.getElementById('card-stacked');
  if (card && !card.querySelector('.stacked-tools')) {
    // toolbar row: HTML legend on the left, toggle on the right — sits above the bars
    const tools = document.createElement('div');
    tools.className = 'stacked-tools';
    tools.innerHTML = `
      <div class="legend" id="stacked-legend"></div>
      <div class="toggle-group">
        <button data-mode="prop" class="active" aria-pressed="true">Proportion</button>
        <button data-mode="abs"  aria-pressed="false">Absolute</button>
      </div>
    `;
    const toggle = tools.querySelector('.toggle-group');
    toggle.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      mode = btn.dataset.mode;
      toggle.querySelectorAll('button').forEach(b => {
        const a = b.dataset.mode === mode;
        b.classList.toggle('active', a);
        b.setAttribute('aria-pressed', String(a));
      });
      redraw();
    });
    card.insertBefore(tools, card.querySelector('.chart-area'));

    // Populate the legend once — performance levels are stable across modes
    const lg = tools.querySelector('#stacked-legend');
    LABELS.performance.forEach((p, j) => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      item.innerHTML = `<span class="sw" style="background:${COLORS.performance(j)}"></span>${SHORT.performance[j]}`;
      lg.appendChild(item);
    });
  }

  redraw();
  on('filter:change.stacked', redraw);
  window.addEventListener('resize', redraw);
}

function redraw() {
  if (!_container) return;
  const rows = getFilteredRows();
  const margin = { top: 16, right: 28, bottom: 46, left: 78 };
  const { svg, inner, width, height, outerW, outerH } = setupSvg(_container, {
    aspect: 0.78, minHeight: 320, maxHeight: 460, margin
  });

  if (rows.length === 0) {
    svg.append('text')
      .attr('x', outerW/2).attr('y', outerH/2).attr('text-anchor','middle')
      .attr('fill','var(--text2)').style('font-style','italic')
      .text('No students match the current filter.');
    return;
  }

  // crosstab: duration (rows) × performance (segments)
  const durLabels = LABELS.duration, perfLabels = LABELS.performance;
  const D = durLabels.length, P = perfLabels.length;
  const matrix = Array.from({length: D}, () => new Array(P).fill(0));
  const totals = new Array(D).fill(0);
  for (const r of rows) { matrix[r.duration.ord][r.performance.ord]++; totals[r.duration.ord]++; }

  // scales
  const y = d3.scaleBand().domain(durLabels).range([0, height]).padding(0.18);
  const xMax = mode === 'prop' ? 1 : (d3.max(totals) || 1);
  const x = d3.scaleLinear().domain([0, xMax]).range([0, width]).nice();

  // axes
  const ay = inner.append('g')
    .call(d3.axisLeft(y).tickSize(0).tickFormat((d, i) => SHORT.duration[i]));
  styleAxis(ay); ay.select('.domain').remove();
  ay.selectAll('text').style('font-size','11.5px');

  const ax = inner.append('g').attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(mode === 'prop' ? d3.format('.0%') : fmtInt).tickSize(-height));
  styleAxis(ax); ax.select('.domain').remove();
  ax.selectAll('.tick line').attr('class','gridline');

  // axis titles
  inner.append('text').attr('class','axis-title')
    .attr('x', width/2).attr('y', height + 38).attr('text-anchor','middle')
    .text(mode === 'prop' ? 'Share of students at this duration' : 'Number of students');
  inner.append('text').attr('class','axis-title')
    .attr('transform', `translate(${-margin.left + 14},${height/2}) rotate(-90)`)
    .attr('text-anchor','middle').text(TITLES.duration + ' →');

  // bar segments
  inner.append('g').attr('class','segments').selectAll('g.bar')
    .data(durLabels.map((dur, i) => ({ dur, i, total: totals[i], row: matrix[i] })))
    .join('g').attr('class','bar')
      .each(function(bar) {
        const g = d3.select(this);
        let acc = 0;
        for (let j = 0; j < P; j++) {
          const v = bar.row[j];
          const start = mode === 'prop' ? (bar.total ? acc / bar.total : 0) : acc;
          const end   = mode === 'prop' ? (bar.total ? (acc + v) / bar.total : 0) : acc + v;
          g.append('rect')
            .attr('y', y(bar.dur)).attr('height', y.bandwidth())
            .attr('x', x(start)).attr('width', Math.max(0, x(end) - x(start)))
            .attr('fill', COLORS.performance(j))
            .attr('opacity', 0).transition().duration(500).delay(j*40)
            .attr('opacity', 1);
          acc += v;
        }
      });

  // overlay invisible bars for hover (one per duration row) — gives row-level tooltip
  inner.append('g').selectAll('rect.hover-row')
    .data(durLabels.map((dur, i) => ({ dur, i, total: totals[i], row: matrix[i] })))
    .join('rect').attr('class','hover-row')
      .attr('x', 0).attr('y', d => y(d.dur))
      .attr('width', width).attr('height', y.bandwidth())
      .attr('fill','transparent')
      .on('mouseover', (e, d) => {
        const parts = d.row.map((v, j) => {
          const pct = d.total ? v / d.total : 0;
          return `<div class="row"><span><span class="swatch" style="background:${COLORS.performance(j)}"></span>${perfLabels[j]}</span><strong>${fmtInt(v)} <span class="muted">(${fmtPct(pct)})</span></strong></div>`;
        }).join('');
        tooltip.show(`
          <strong>${d.dur}</strong><br>
          <span class="muted">${d.total} students</span>
          ${parts}
        `, e);
      })
      .on('mousemove', e => tooltip.move(e))
      .on('mouseout', () => tooltip.hide());

  // segment labels (only show if segment is wide enough to fit text)
  inner.append('g').selectAll('text.seg-label')
    .data(durLabels.flatMap((dur, i) => {
      let acc = 0;
      return perfLabels.map((pl, j) => {
        const v = matrix[i][j];
        const total = totals[i] || 1;
        const start = mode === 'prop' ? acc/total : acc;
        const end   = mode === 'prop' ? (acc + v)/total : acc + v;
        acc += v;
        const w = x(end) - x(start);
        return { dur, i, j, v, total, w, cx: x(start) + w/2, cy: y(dur) + y.bandwidth()/2 + 4 };
      });
    }))
    .join('text').attr('class','seg-label')
      .attr('x', d => d.cx).attr('y', d => d.cy)
      .attr('text-anchor','middle')
      .style('font-size','10.5px').style('pointer-events','none')
      .style('font-variant-numeric','tabular-nums')
      .style('fill', d => d.j <= 1 ? '#ffffff' : '#1c1917')  // dark blue segments → white text, paler segments → dark ink
      .text(d => {
        if (d.w < 32) return '';
        return mode === 'prop'
          ? (d.total ? fmtPct(d.v / d.total) : '')
          : (d.v || '');
      });

  // Legend now lives in the chart-card-tools HTML row above the bars.
}
