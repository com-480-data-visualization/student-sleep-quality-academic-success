/* radar.js — Profiles in contrast. Two segment pickers let the user pin any
   two cohorts (by sleep quality, stress, year, gender …) and overlay their
   average lifestyle profile on five axes: Stress, Screens, Caffeine,
   Activity, Fatigue. Each axis is normalized to 0..1 (mean ord / (n-1)).
   Default comparison: "Very poor sleepers" vs "Very good sleepers" — the
   gap on stress and screen time is the takeaway.

   - Two colour-coded polygons, semi-transparent so overlap is readable.
   - Delta annotations next to each axis label show "+0.32" if Group A is
     higher on that axis than Group B (where "higher" = "worse" for the
     reversed axes, computed before normalisation flip).
   - Always uses dropdowns for the picker, never freeform: keeps the
     interaction simple and accessible. */

import { LABELS, levels, TITLES } from '../data.js';
import { tooltip, setupSvg, fmtPct } from '../utils.js';
import { on, getFilteredRows, getAllRows } from '../state.js';

const AXES = [
  { key: 'stress',      title: 'Stress',     direction: 'up=bad'  },
  { key: 'electronics', title: 'Screens',    direction: 'up=bad'  },
  { key: 'caffeine',    title: 'Caffeine',   direction: 'up=bad'  },
  { key: 'activity',    title: 'Activity',   direction: 'up=good' },
  { key: 'fatigue',     title: 'Fatigue',    direction: 'up=bad'  },
];

// Group definitions — each is a filter on a single field. The picker UI
// resolves to one of these definitions, plus an "All students" baseline.
const GROUP_DIMS = ['quality', 'performance', 'duration', 'stress', 'year', 'gender'];

const GROUP_A_COLOR = '#ea580c';  // brand orange — "bad" / focus side
const GROUP_B_COLOR = '#0e7490';  // deep teal — "good" / contrast side

let _container;
let groupA = { dim: 'quality', value: 'Very poor' };
let groupB = { dim: 'quality', value: 'Very good' };

export function initRadar(container) {
  _container = container;
  container.innerHTML = '';

  // Mount pickers above the chart area
  const card = document.getElementById('card-radar');
  if (card && !card.querySelector('.group-pickers')) {
    const pickers = document.createElement('div');
    pickers.className = 'group-pickers';
    pickers.innerHTML = pickerHTML('A', GROUP_A_COLOR) + pickerHTML('B', GROUP_B_COLOR);
    card.insertBefore(pickers, card.querySelector('.chart-area'));

    // populate dim dropdowns
    ['A','B'].forEach(side => {
      const dimSel = document.getElementById(`grp-${side}-dim`);
      dimSel.innerHTML = '';
      for (const d of GROUP_DIMS) {
        const opt = document.createElement('option');
        opt.value = d; opt.textContent = TITLES[d];
        dimSel.appendChild(opt);
      }
      dimSel.value = side === 'A' ? groupA.dim : groupB.dim;
      populateValueDropdown(side);
      dimSel.addEventListener('change', () => {
        const grp = side === 'A' ? groupA : groupB;
        grp.dim = dimSel.value;
        grp.value = LABELS[grp.dim][0];
        populateValueDropdown(side);
        redraw();
      });
      document.getElementById(`grp-${side}-val`).addEventListener('change', e => {
        const grp = side === 'A' ? groupA : groupB;
        grp.value = e.target.value;
        redraw();
      });
    });
  }

  redraw();
  on('filter:change.radar', redraw);
  window.addEventListener('resize', redraw);
}

function pickerHTML(side, color) {
  return `
    <div class="group-picker">
      <h4><span class="dot" style="background:${color}"></span>Group ${side}</h4>
      <div class="picker-row"><label>Dimension</label><select id="grp-${side}-dim"></select></div>
      <div class="picker-row"><label>Value</label><select id="grp-${side}-val"></select></div>
      <div class="pcount" id="grp-${side}-count"></div>
    </div>`;
}

function populateValueDropdown(side) {
  const grp = side === 'A' ? groupA : groupB;
  const valSel = document.getElementById(`grp-${side}-val`);
  valSel.innerHTML = '';
  for (const v of LABELS[grp.dim]) {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    valSel.appendChild(opt);
  }
  valSel.value = grp.value;
}

function matchGroup(rows, grp) {
  return rows.filter(r => {
    if (grp.dim === 'gender') return r.gender === grp.value;
    return r[grp.dim].raw === grp.value;
  });
}

function averages(rows) {
  // average ord for every axis, normalized to 0..1
  if (!rows.length) return AXES.map(() => 0);
  return AXES.map(ax => {
    const sum = d3.sum(rows, r => r[ax.key].ord);
    return sum / (rows.length * (levels(ax.key) - 1));
  });
}

function redraw() {
  if (!_container) return;
  const filtered = getFilteredRows();
  const all = getAllRows();
  // Groups select FROM the filtered pool (so the global filter intersects).
  const aRows = matchGroup(filtered, groupA);
  const bRows = matchGroup(filtered, groupB);

  // Update picker counts
  const aCount = document.getElementById('grp-A-count');
  const bCount = document.getElementById('grp-B-count');
  if (aCount) aCount.textContent = `${aRows.length} students (${fmtPct(aRows.length / Math.max(1, all.length))} of total)`;
  if (bCount) bCount.textContent = `${bRows.length} students (${fmtPct(bRows.length / Math.max(1, all.length))} of total)`;

  const margin = { top: 80, right: 110, bottom: 80, left: 110 };
  const { svg, inner, width, height, outerW, outerH } = setupSvg(_container, {
    aspect: 0.85, minHeight: 440, maxHeight: 580, margin
  });

  if (aRows.length === 0 && bRows.length === 0) {
    svg.append('text').attr('x', outerW/2).attr('y', outerH/2).attr('text-anchor','middle')
      .attr('fill','var(--text2)').style('font-style','italic')
      .text('Neither group matches the current filter.');
    return;
  }

  const cx = width / 2, cy = height / 2;
  const radius = Math.min(width, height) / 2 - 36;

  // grid: 4 rings + N spokes
  const ringSteps = [0.25, 0.5, 0.75, 1.0];
  const grid = inner.append('g').attr('class','radar-grid')
    .attr('transform', `translate(${cx},${cy})`);
  grid.selectAll('circle.ring').data(ringSteps).join('circle')
    .attr('class','ring').attr('r', d => d * radius)
    .attr('fill','none').attr('stroke','rgba(28,25,23,0.12)')
    .attr('stroke-dasharray', d => d === 1 ? '0' : '2 4');

  // ring labels at the top
  grid.selectAll('text.ring-lbl').data(ringSteps).join('text')
    .attr('class','ring-lbl').attr('x', 4).attr('y', d => -d * radius)
    .attr('fill','var(--text3)').style('font-size','9.5px')
    .style('font-weight','500').style('font-family',"'Inter', sans-serif")
    .text(d => `${(d*100).toFixed(0)}%`);

  // spokes only — labels are drawn after the polygons so they sit on top.
  const angle = (i) => -Math.PI/2 + (i / AXES.length) * Math.PI * 2;
  AXES.forEach((ax, i) => {
    const a = angle(i);
    const x = Math.cos(a) * radius, y = Math.sin(a) * radius;
    grid.append('line')
      .attr('x1', 0).attr('y1', 0).attr('x2', x).attr('y2', y)
      .attr('stroke','rgba(28,25,23,0.12)');
  });

  // polygons
  const aVals = averages(aRows);
  const bVals = averages(bRows);
  drawPolygon(grid, aVals, GROUP_A_COLOR, 'A');
  drawPolygon(grid, bVals, GROUP_B_COLOR, 'B');

  /* --- endpoint label stacks ---------------------------------------------
     For every axis we draw three lines of text, all anchored at the same x
     position (just outside the polygon vertex) and stacked vertically. Top
     vertex stacks UP (delta on top, axis title at bottom); bottom vertices
     stack DOWN. Side vertices stack the title at the vertex and place the
     direction tag below it / Δ above it, mirroring the layout. Each text
     line gets a thick cream halo so it never collides with grid rings. */
  AXES.forEach((ax, i) => {
    const a = angle(i);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    // Base position just outside the polygon vertex.
    const rBase = radius + 24;
    const cx = dx * rBase;
    const cy = dy * rBase;

    const anchor = Math.abs(dx) < 0.15 ? 'middle' : (dx > 0 ? 'start' : 'end');
    const isTop  = dy < -0.4;

    // Vertical layout of the three labels (title, direction tag, delta):
    //   - top vertex: stack UP → delta highest, title closest to vertex
    //   - bottom & side vertices: stack DOWN → title closest, delta furthest
    const lineGap = 15;
    let yTitle, yDir, yDelta;
    if (isTop) {
      yTitle = cy;
      yDir   = cy - lineGap;
      yDelta = cy - lineGap * 2;
    } else {
      yTitle = cy;
      yDir   = cy + lineGap;
      yDelta = cy + lineGap * 2;
    }

    // Axis title
    grid.append('text')
      .attr('x', cx).attr('y', yTitle).attr('dy','0.35em')
      .attr('text-anchor', anchor)
      .style('fill','var(--ink)').style('font-size','13px').style('font-weight','700')
      .style('font-family',"'Inter', sans-serif")
      .style('paint-order','stroke fill')
      .style('stroke','rgba(250,247,242,0.95)').style('stroke-width','3px')
      .style('stroke-linejoin','round')
      .text(ax.title);

    // Direction tag
    grid.append('text')
      .attr('x', cx).attr('y', yDir).attr('dy','0.35em')
      .attr('text-anchor', anchor)
      .style('fill', ax.direction === 'up=bad' ? 'var(--accent3)' : 'var(--accent2)')
      .style('font-size','9px').style('font-weight','700').style('letter-spacing','0.1em')
      .style('font-family',"'Inter', sans-serif")
      .style('paint-order','stroke fill')
      .style('stroke','rgba(250,247,242,0.95)').style('stroke-width','3px')
      .style('stroke-linejoin','round')
      .text(ax.direction === 'up=bad' ? 'OUTER = WORSE' : 'OUTER = BETTER');

    // Δ
    const delta = aVals[i] - bVals[i];
    if (Math.abs(delta) < 0.01) return;
    grid.append('text')
      .attr('x', cx).attr('y', yDelta).attr('dy','0.35em')
      .attr('text-anchor', anchor)
      .style('fill', delta > 0 ? GROUP_A_COLOR : GROUP_B_COLOR)
      .style('font-size','10.5px').style('font-weight','700')
      .style('font-family',"'JetBrains Mono', monospace")
      .style('paint-order','stroke fill')
      .style('stroke','rgba(250,247,242,0.95)').style('stroke-width','3px')
      .style('stroke-linejoin','round')
      .text(`Δ ${delta > 0 ? '+' : ''}${(delta * 100).toFixed(0)}%`);
  });

  // legend — sits at the very top of the SVG so the radar's top-vertex
  // label stack (Δ • OUTER = WORSE • Stress) has clear vertical space below.
  // B's x is computed from A's actual rendered width so long values like
  // "More than 8 hours (duration)" never overlap the B swatch.
  const lg = svg.append('g').attr('class','legend-g').attr('transform', `translate(${margin.left}, 12)`);
  function legendItem(g, x, color, text) {
    g.append('rect').attr('x', x).attr('y', 0).attr('width', 12).attr('height', 12).attr('rx', 3).attr('fill', color);
    const t = g.append('text').attr('x', x + 18).attr('y', 10).attr('fill', 'var(--ink)')
      .style('font-size','11.5px').style('font-weight','600')
      .style('font-family',"'Inter', sans-serif").text(text);
    return x + 18 + t.node().getComputedTextLength();
  }
  const aText = `Group A: ${groupA.value} (${groupA.dim})`;
  const bText = `Group B: ${groupB.value} (${groupB.dim})`;
  const aEnd  = legendItem(lg, 0, GROUP_A_COLOR, aText);
  legendItem(lg, aEnd + 32, GROUP_B_COLOR, bText);

  // helper anchor function for tooltip in vertex
  function drawPolygon(g, vals, color, label) {
    const pts = AXES.map((ax, i) => {
      const a = angle(i);
      const r = vals[i] * radius;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    const lineGen = d3.lineRadial()
      .angle((d, i) => (i / AXES.length) * Math.PI * 2)
      .radius((d) => d * radius);
    const path = lineGen.curve(d3.curveLinearClosed)(vals);
    g.append('path').attr('d', path)
      .attr('fill', color).attr('fill-opacity', 0.18)
      .attr('stroke', color).attr('stroke-width', 2.2)
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 0).transition().duration(500).attr('opacity', 1);

    // vertex dots + hover
    g.append('g').selectAll('circle.vtx').data(pts.map((p, i) => ({ p, i }))).join('circle')
      .attr('class', 'vtx')
      .attr('cx', d => d.p[0]).attr('cy', d => d.p[1]).attr('r', 4.5)
      .attr('fill', color).attr('stroke', '#ffffff').attr('stroke-width', 2)
      .on('mouseover', (e, d) => {
        const ax = AXES[d.i];
        const rows = label === 'A' ? aRows : bRows;
        tooltip.show(`
          <strong>${label === 'A' ? groupA.value : groupB.value}</strong>
          <span class="muted">(Group ${label})</span><br>
          <strong>${ax.title}</strong>: ${fmtPct(vals[d.i])}<br>
          <span class="muted">n = ${rows.length}</span>
        `, e);
      })
      .on('mousemove', e => tooltip.move(e))
      .on('mouseout', () => tooltip.hide());
  }
}
