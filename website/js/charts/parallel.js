/* parallel.js — six-axis parallel coordinates over Stress, Screens, Caffeine,
   Activity, Sleep quality, Performance. RQ3 answer in one view: as you scan
   left-to-right, lifestyle inputs (stress, screens, caffeine) flow into the
   intermediate variable (sleep quality) and out the academic output. Lines
   are coloured by sleep quality on a single-hue Blues scale — the prototype
   used a rainbow which violated the perception lecture's ordinal rule. Each
   axis has a d3-brush; brushing any axis pushes a range into the global
   filter store as a chip, so dropdowns + brushes compose. Hover thickens a
   single line; jitter on the y position keeps the 996 lines visually
   distinguishable instead of collapsing onto five horizontal stripes. */

import { LABELS, SHORT, TITLES } from '../data.js';
import { COLORS, tooltip, setupSvg, styleAxis, fmtInt } from '../utils.js';
import { on, getFilteredRows, getAllRows, setBrush, getState } from '../state.js';

const DIMS = [
  { key: 'stress',      title: 'Stress',      reverse: true  },   // top = good
  { key: 'electronics', title: 'Screens',     reverse: true  },
  { key: 'caffeine',    title: 'Caffeine',    reverse: true  },
  { key: 'activity',    title: 'Activity',    reverse: false },
  { key: 'quality',     title: 'Sleep',       reverse: false },
  { key: 'performance', title: 'Grades',      reverse: false },
];

let _container;

export function initParallel(container) {
  _container = container;
  container.innerHTML = '';
  redraw();
  on('filter:change.parallel', redraw);
  window.addEventListener('resize', redraw);
}

function redraw() {
  if (!_container) return;
  const filtered = getFilteredRows();
  const all = getAllRows();
  const brushes = getState().brushFilters || {};

  // Generous top margin so the per-axis header stack (title + direction tag)
  // sits well clear of the polylines, and very large right margin so the
  // Sleep-quality legend has clear horizontal space from the Grades axis.
  const margin = { top: 84, right: 190, bottom: 34, left: 66 };
  const { svg, inner, width, height, outerW, outerH } = setupSvg(_container, {
    aspect: 0.5, minHeight: 420, maxHeight: 560, margin
  });

  if (all.length === 0) return;

  const xScale = d3.scalePoint().domain(DIMS.map(d => d.key)).range([0, width]).padding(0.08);

  // y scales: each axis maps 0..n-1 ord to height. Reverse if reverse=true so
  // "good" sits at the top of every axis (intuitive: high = good).
  const yScales = {};
  for (const d of DIMS) {
    const n = LABELS[d.key].length;
    const range = d.reverse ? [0, height] : [height, 0];
    yScales[d.key] = d3.scaleLinear().domain([0, n - 1]).range(range);
  }

  // jitter helps a 996-row dataset on a 5-step axis stay readable
  const jitterAmp = 6;
  const jitterFor = (r, key) => ((r.id * (key.length + 7)) % 17 - 8) / 8 * jitterAmp;

  const linePath = (r) => {
    return DIMS.map(d => {
      const y0 = yScales[d.key](r[d.key].ord);
      return [xScale(d.key), y0 + jitterFor(r, d.key)];
    });
  };
  const line = d3.line().curve(d3.curveMonotoneX);

  // background lines (everything not in current filter) — very faint
  const bgRows = all.filter(r => !filtered.includes(r));
  inner.append('g').attr('class','bg-lines')
    .selectAll('path').data(bgRows).join('path')
      .attr('d', r => line(linePath(r)))
      .attr('fill','none')
      .attr('stroke','rgba(28,25,23,0.06)')
      .attr('stroke-width', 0.6);

  // foreground lines
  const fg = inner.append('g').attr('class','fg-lines');
  fg.selectAll('path').data(filtered, r => r.id).join('path')
      .attr('d', r => line(linePath(r)))
      .attr('fill', 'none')
      .attr('stroke', r => COLORS.quality(r.quality.ord))
      .attr('stroke-width', 0.9)
      .attr('opacity', 0.28)
      .on('mouseover', function(e, r) {
        d3.select(this).raise().attr('stroke-width', 2.4).attr('opacity', 1);
        const lines = DIMS.map(d => `<div class="row"><span class="muted">${TITLES[d.key]}</span><strong>${r[d.key].raw}</strong></div>`).join('');
        tooltip.show(`<strong>Student #${r.id}</strong><br><span class="muted">${r.gender} · ${r.year.raw}</span>${lines}`, e);
      })
      .on('mousemove', e => tooltip.move(e))
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 0.9).attr('opacity', 0.28);
        tooltip.hide();
      });

  // axes
  const axisG = inner.append('g').attr('class','axes');
  DIMS.forEach((d, idx) => {
    const isFirst = idx === 0;
    const isLast  = idx === DIMS.length - 1;
    const ax = axisG.append('g')
      .attr('class','axis')
      .attr('transform', `translate(${xScale(d.key)},0)`);

    ax.append('line')
      .attr('y1', 0).attr('y2', height)
      .attr('stroke','rgba(28,25,23,0.22)').attr('stroke-width', 1);

    const n = LABELS[d.key].length;
    const ticks = d3.range(n);
    ax.append('g').attr('class','tick-dots').selectAll('circle')
      .data(ticks).join('circle')
        .attr('cy', t => yScales[d.key](t))
        .attr('r', 2.6).attr('fill','rgba(28,25,23,0.35)');

    // Tick labels: first axis labels go to the RIGHT (positive x), last axis
    // labels also go to the RIGHT so they don't collide with the dense
    // line-bundle on the left side of the final axis. Middle axes anchor
    // to the LEFT of their axis.
    const tickX      = (isFirst || isLast) ? 10 : -10;
    const tickAnchor = (isFirst || isLast) ? 'start' : 'end';
    ax.append('g').attr('class','tick-labels').selectAll('text')
      .data(ticks).join('text')
        .attr('x', tickX).attr('y', t => yScales[d.key](t))
        .attr('text-anchor', tickAnchor).attr('dy','0.35em')
        .style('font-size','11px')
        .style('font-weight','600')
        .style('font-family',"'Inter', sans-serif")
        .style('paint-order','stroke fill')
        .style('stroke','rgba(250,247,242,0.95)')
        .style('stroke-width','4px')
        .style('stroke-linejoin','round')
        .style('fill', 'var(--ink)')
        .text(t => SHORT[d.key][t]);

    // header label stack: axis title higher up, direction tag below it,
    // both kept well away from the polylines.
    const headerAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
    ax.append('text')
      .attr('class', 'pc-axis-title')
      .attr('y', -44).attr('text-anchor', headerAnchor)
      .style('fill','var(--ink)').style('font-size','12.5px').style('font-weight','700')
      .style('font-family',"'Inter', sans-serif")
      .text(d.title);

    ax.append('text')
      .attr('y', -26).attr('text-anchor', headerAnchor)
      .style('fill', d.reverse ? 'var(--accent3)' : 'var(--accent2)')
      .style('font-size','9.5px').style('font-weight','700')
      .style('letter-spacing','0.12em')
      .style('font-family',"'Inter', sans-serif")
      .text(d.reverse ? '↓ WORSE' : '↑ BETTER');
  });

  // brushes — one per axis. Drag a range to filter all charts globally.
  const brushG = inner.append('g').attr('class','brushes');
  for (const d of DIMS) {
    const n = LABELS[d.key].length;
    const yScale = yScales[d.key];
    const brush = d3.brushY()
      .extent([[-10, 0], [10, height]])
      .on('end', (ev) => {
        // ignore programmatic brush.move() (which has no sourceEvent) — those
        // would re-enter the filter pipeline and loop on every redraw.
        if (!ev.sourceEvent) return;
        if (!ev.selection) { setBrush(d.key, null); return; }
        const [a, b] = ev.selection;
        const v1 = yScale.invert(a), v2 = yScale.invert(b);
        const lo = Math.max(0, Math.floor(Math.min(v1, v2)));
        const hi = Math.min(n - 1, Math.ceil(Math.max(v1, v2)));
        setBrush(d.key, { minOrd: lo, maxOrd: hi });
      });

    const g = brushG.append('g').attr('class','brush')
      .attr('transform', `translate(${xScale(d.key)},0)`)
      .call(brush);

    // pre-paint existing brush if one is active (e.g. from URL hash on load)
    const br = brushes[d.key];
    if (br) {
      const a = yScale(br.minOrd), b = yScale(br.maxOrd);
      g.call(brush.move, [Math.min(a, b) - 0.5, Math.max(a, b) + 0.5]);
    }
  }

  // sleep-quality legend — pushed well to the right of the Grades axis so
  // its labels never collide with the rightmost tick labels.
  const legendX = outerW - margin.right + 70;
  const legendY0 = margin.top + 20;
  svg.append('text').attr('x', legendX).attr('y', legendY0 - 10)
    .style('fill','var(--ink)').style('font-size','11px').style('font-weight','700')
    .style('font-family',"'Inter', sans-serif")
    .text('Sleep quality');
  LABELS.quality.forEach((q, i) => {
    svg.append('rect').attr('x', legendX).attr('y', legendY0 + i*17)
      .attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', COLORS.quality(i))
      .attr('stroke', 'rgba(28,25,23,0.12)');
    svg.append('text').attr('x', legendX + 18).attr('y', legendY0 + 10 + i*17)
      .style('fill','var(--text)').style('font-size','11px')
      .style('font-family',"'Inter', sans-serif").text(q);
  });

  // small N count — sits above the axis title row in the new wider top band
  svg.append('text').attr('x', margin.left).attr('y', 22)
    .style('fill','var(--text2)').style('font-size','11px')
    .style('font-weight','500')
    .style('font-family',"'Inter', sans-serif")
    .text(`${fmtInt(filtered.length)} of ${fmtInt(all.length)} students shown`);
}
