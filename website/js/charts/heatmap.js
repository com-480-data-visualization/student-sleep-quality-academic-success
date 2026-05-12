/* heatmap.js — Sleep quality (rows) × Academic performance (columns).
   RQ1 answer.  Encoding: cell fill = count (Blues, ordinal) or chi-square
   standardized residual (RdBu, diverging) under the "residuals" toggle. The
   residual mode makes the off-diagonal "low quality routes to low
   performance" pattern jump out — positive cells (more than expected if the
   two were independent) get a saturated red, the rest pale toward blue.
   Hover: row + column highlight, tooltip with absolute count, row %, col %. */

import { LABELS, SHORT, TITLES } from '../data.js';
import { COLORS, tooltip, crossTab, residuals, setupSvg, styleAxis, fmtInt, fmtPct } from '../utils.js';
import { on, getFilteredRows } from '../state.js';

let mode = 'count';     // 'count' | 'residual'
let _container;

export function initHeatmap(container) {
  _container = container;
  container.innerHTML = '';

  // toolbar
  const head = document.querySelector('#card-heatmap .chart-card-head');
  if (head && !head.querySelector('.toggle-group')) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-group';
    toggle.innerHTML = `
      <button data-mode="count" class="active" aria-pressed="true">Counts</button>
      <button data-mode="residual" aria-pressed="false">Residuals</button>`;
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
    head.appendChild(toggle);
  }

  redraw();
  on('filter:change.heatmap', redraw);
  window.addEventListener('resize', redraw);
}

function redraw() {
  if (!_container) return;
  const rows = getFilteredRows();
  const margin = { top: 30, right: 40, bottom: 60, left: 110 };
  const { svg, inner, width, height, outerW, outerH } = setupSvg(_container, {
    aspect: 0.62, minHeight: 320, maxHeight: 460, margin
  });

  if (rows.length === 0) {
    svg.append('text')
      .attr('x', outerW/2).attr('y', outerH/2)
      .attr('text-anchor', 'middle').attr('fill', 'var(--text2)')
      .style('font-style','italic').text('No students match the current filter.');
    return;
  }

  const ct = crossTab(rows, 'quality', 'performance');
  const res = residuals(ct);
  const rLabels = LABELS.quality;       // rows: V.poor → V.good
  const cLabels = LABELS.performance;   // cols: Poor → Excellent

  const x = d3.scaleBand().domain(cLabels).range([0, width]).padding(0.06);
  const y = d3.scaleBand().domain(rLabels).range([0, height]).padding(0.06);

  // Color scale per mode
  let color, getVal, formatVal;
  if (mode === 'count') {
    const max = d3.max(ct.matrix.flat()) || 1;
    color     = d3.scaleSequential(d3.interpolateBlues).domain([0, max]);
    getVal    = (i, j) => ct.matrix[i][j];
    formatVal = (v) => fmtInt(v);
  } else {
    const ext = d3.max(res.flat(), d => Math.abs(d)) || 1;
    color     = COLORS.diverging(ext);
    getVal    = (i, j) => res[i][j];
    formatVal = (v) => (v >= 0 ? '+' : '') + v.toFixed(1);
  }

  // axes
  const ax = inner.append('g').attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0).tickFormat((d, i) => SHORT.performance[i]));
  styleAxis(ax); ax.select('.domain').remove();
  ax.selectAll('text').style('font-size', '11.5px');

  const ay = inner.append('g')
    .call(d3.axisLeft(y).tickSize(0));
  styleAxis(ay); ay.select('.domain').remove();
  ay.selectAll('text').style('font-size', '11.5px');

  // cells
  const cellsData = [];
  for (let i = 0; i < rLabels.length; i++) {
    for (let j = 0; j < cLabels.length; j++) {
      cellsData.push({ i, j, row: rLabels[i], col: cLabels[j], v: getVal(i, j), count: ct.matrix[i][j] });
    }
  }

  inner.append('g').attr('class', 'cells')
    .selectAll('rect.cell').data(cellsData).join('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d.col)).attr('y', d => y(d.row))
      .attr('width', x.bandwidth()).attr('height', y.bandwidth())
      .attr('rx', 6)
      .attr('fill', d => color(d.v))
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 1.5)
      .on('mouseover', (e, d) => {
        const rowTot = ct.rowTotals[d.i] || 1;
        const colTot = ct.colTotals[d.j] || 1;
        const rPct = d.count / rowTot;
        const cPct = d.count / colTot;
        inner.selectAll('rect.cell').attr('opacity', c => (c.i === d.i || c.j === d.j) ? 1 : 0.3);
        tooltip.show(`
          <strong>${d.row}</strong> sleep × <strong>${d.col}</strong> performance<br>
          <span class="muted">${mode === 'count' ? 'Students' : 'Residual (σ)'}:</span>
          <strong>${formatVal(d.v)}</strong>
          ${mode === 'residual' ? `<br><span class="muted">Count: ${d.count}</span>` : ''}
          <br><span class="muted">${fmtPct(rPct)} of "${d.row}" sleepers</span>
          <br><span class="muted">${fmtPct(cPct)} of "${d.col}" performers</span>
        `, e);
      })
      .on('mousemove', e => tooltip.move(e))
      .on('mouseout', () => { inner.selectAll('rect.cell').attr('opacity', 1); tooltip.hide(); })
      .attr('opacity', 0).transition().duration(500).attr('opacity', 1);

  // cell labels
  inner.append('g').attr('class', 'cell-labels').selectAll('text')
    .data(cellsData).join('text')
      .attr('x', d => x(d.col) + x.bandwidth()/2)
      .attr('y', d => y(d.row) + y.bandwidth()/2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px').style('pointer-events', 'none')
      .style('font-variant-numeric','tabular-nums')
      .style('fill', d => labelColor(d.v, mode, color))
      .text(d => mode === 'count' ? (d.count || '·') : formatVal(d.v));

  // axis titles
  inner.append('text').attr('class', 'axis-title')
    .attr('x', width / 2).attr('y', height + 38).attr('text-anchor', 'middle')
    .text(TITLES.performance + ' →');
  inner.append('text').attr('class', 'axis-title')
    .attr('transform', `translate(${-margin.left + 14},${height/2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text(TITLES.quality + ' →');

  drawLegend(svg, color, ct, mode, outerW, outerH);
}

function labelColor(v, mode, color) {
  // pick white or dark-ink text for legibility on the chosen fill
  const c = d3.color(color(v));
  if (!c) return 'var(--text2)';
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return l < 150 ? '#ffffff' : '#1c1917';
}

function drawLegend(svg, color, ct, mode, W, H) {
  const lw = 200, lh = 8;
  const lx = W - lw - 20, ly = 12;
  const grad = svg.append('defs').append('linearGradient')
    .attr('id', `heatmap-grad-${mode}`)
    .attr('x1', 0).attr('x2', 1).attr('y1', 0).attr('y2', 0);

  const stops = d3.range(0, 1.01, 0.05);
  const domain = color.domain();
  stops.forEach(t => {
    const v = domain[0] + t * (domain[domain.length-1] - domain[0]);
    grad.append('stop').attr('offset', `${t*100}%`).attr('stop-color', color(v));
  });

  svg.append('rect').attr('x', lx).attr('y', ly).attr('width', lw).attr('height', lh).attr('rx', 2)
    .attr('fill', `url(#heatmap-grad-${mode})`);

  const lblFill = '#57534e';
  if (mode === 'count') {
    svg.append('text').attr('x', lx).attr('y', ly - 4).attr('fill', lblFill).style('font-size', '10px').text('Few');
    svg.append('text').attr('x', lx + lw).attr('y', ly - 4).attr('text-anchor', 'end').attr('fill', lblFill).style('font-size', '10px').text('Many');
    svg.append('text').attr('x', lx + lw / 2).attr('y', ly + lh + 12).attr('text-anchor', 'middle')
      .attr('fill', lblFill).style('font-size', '10px').text(`Students in cell (max ${d3.max(ct.matrix.flat())})`);
  } else {
    const ext = Math.max(...color.domain().map(Math.abs));
    svg.append('text').attr('x', lx).attr('y', ly - 4)
      .attr('fill', lblFill).style('font-size', '10px').style('font-weight','600')
      .text(`−${ext.toFixed(1)}σ`);
    svg.append('text').attr('x', lx + lw).attr('y', ly - 4)
      .attr('text-anchor', 'end').attr('fill', lblFill).style('font-size', '10px').style('font-weight','600')
      .text(`+${ext.toFixed(1)}σ`);
    // Split the explanation into two end-anchored labels so neither can
    // overflow the chart card.
    svg.append('text').attr('x', lx).attr('y', ly + lh + 14)
      .attr('fill', lblFill).style('font-size', '10px')
      .text('← less than expected');
    svg.append('text').attr('x', lx + lw).attr('y', ly + lh + 14)
      .attr('text-anchor', 'end').attr('fill', lblFill).style('font-size', '10px')
      .text('more than expected →');
  }
}
