/* sankey.js — flow Sleep duration → Sleep quality → Academic performance.
   The visual punchline of the dataset: most of the "7-8h" and ">8h" mass
   funnels through "Very poor" / "Poor" quality and finally lands at "Poor"
   performance. The Sankey makes the cross-tabulation impossible to dismiss
   as a coincidence — you can literally trace the cohort that gets the hours
   but reports the worst grades.

   - Nodes are coloured by their column's ordinal palette (Purples for
     duration, Blues for quality, Blues again for performance).
   - Hover a node or link to highlight every link that participates in that
     student's path; the rest fade to 0.15 opacity.
   - We rebuild the graph on every filter:change because filtered cohorts
     can produce empty links that d3-sankey otherwise treats as 0-width. */

import { LABELS, SHORT, TITLES } from '../data.js';
import { COLORS, tooltip, setupSvg, fmtInt, fmtPct } from '../utils.js';
import { on, getFilteredRows } from '../state.js';

let _container;

export function initSankey(container) {
  _container = container;
  container.innerHTML = '';
  redraw();
  on('filter:change.sankey', redraw);
  window.addEventListener('resize', redraw);
}

function nodeColor(n) {
  if (n.layer === 0) return COLORS.duration(n.ord);
  if (n.layer === 1) return COLORS.quality(n.ord);
  return COLORS.performance(n.ord);
}

function redraw() {
  if (!_container) return;
  const rows = getFilteredRows();
  const margin = { top: 18, right: 110, bottom: 22, left: 92 };
  const { svg, inner, width, height, outerW, outerH } = setupSvg(_container, {
    aspect: 0.78, minHeight: 340, maxHeight: 460, margin
  });
  if (!rows.length) {
    svg.append('text').attr('x', outerW/2).attr('y', outerH/2).attr('text-anchor','middle')
      .attr('fill','var(--text2)').style('font-style','italic')
      .text('No students match the current filter.');
    return;
  }

  // ---- build graph ----
  const dur = LABELS.duration, qual = LABELS.quality, perf = LABELS.performance;
  const nodes = [];
  const idx = {};
  const push = (name, layer, ord, key) => {
    const id = `${key}::${name}`;
    if (idx[id] != null) return idx[id];
    idx[id] = nodes.length;
    nodes.push({ id, name, layer, ord, key });
    return nodes.length - 1;
  };
  dur.forEach((n, i)  => push(n, 0, i, 'duration'));
  qual.forEach((n, i) => push(n, 1, i, 'quality'));
  perf.forEach((n, i) => push(n, 2, i, 'performance'));

  const linkMap = new Map();
  for (const r of rows) {
    const a = idx[`duration::${r.duration.raw}`];
    const b = idx[`quality::${r.quality.raw}`];
    const c = idx[`performance::${r.performance.raw}`];
    const k1 = `${a}->${b}`, k2 = `${b}->${c}`;
    linkMap.set(k1, (linkMap.get(k1) || 0) + 1);
    linkMap.set(k2, (linkMap.get(k2) || 0) + 1);
  }
  const links = [];
  for (const [k, v] of linkMap) {
    const [s, t] = k.split('->').map(Number);
    links.push({ source: s, target: t, value: v });
  }

  // ---- layout ----
  const sankeyGen = d3.sankey()
    .nodeWidth(14)
    .nodePadding(8)
    .extent([[0, 0], [width, height]])
    .nodeSort(null);

  const graph = sankeyGen({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d })),
  });

  // ---- draw links ----
  const linkG = inner.append('g').attr('class','sankey-links').attr('fill','none');
  linkG.selectAll('path').data(graph.links).join('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke', d => {
      // gradient between source and target hues
      const id = `lg-${d.source.index}-${d.target.index}`;
      const grad = inner.append('defs').append('linearGradient')
        .attr('id', id)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', d.source.x1).attr('x2', d.target.x0);
      grad.append('stop').attr('offset','0%').attr('stop-color', nodeColor(d.source));
      grad.append('stop').attr('offset','100%').attr('stop-color', nodeColor(d.target));
      return `url(#${id})`;
    })
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('opacity', 0.55)
    .on('mouseover', function(e, d) {
      linkG.selectAll('path').attr('opacity', 0.1);
      d3.select(this).attr('opacity', 1).raise();
      const sName = d.source.name, tName = d.target.name;
      tooltip.show(`
        <strong>${sName}</strong> → <strong>${tName}</strong><br>
        <span class="muted">Students:</span> <strong>${fmtInt(d.value)}</strong>
        <span class="muted">(${fmtPct(d.value / rows.length)} of cohort)</span>
      `, e);
    })
    .on('mousemove', e => tooltip.move(e))
    .on('mouseout', function() {
      linkG.selectAll('path').attr('opacity', 0.55);
      tooltip.hide();
    });

  // ---- draw nodes ----
  const nodeG = inner.append('g').attr('class','sankey-nodes');
  const node = nodeG.selectAll('g.node').data(graph.nodes).join('g').attr('class','node');
  node.append('rect')
    .attr('x', d => d.x0).attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0).attr('height', d => Math.max(1, d.y1 - d.y0))
    .attr('fill', d => nodeColor(d))
    .attr('rx', 2)
    .on('mouseover', function(e, n) {
      const involved = new Set();
      linkG.selectAll('path').attr('opacity', l => {
        const hit = (l.source.index === n.index || l.target.index === n.index);
        if (hit) involved.add(l.value);
        return hit ? 1 : 0.1;
      });
      tooltip.show(`
        <strong>${n.name}</strong><br>
        <span class="muted">${TITLES[n.key]}</span><br>
        <span class="muted">Total students:</span> <strong>${fmtInt(n.value)}</strong>
        <span class="muted">(${fmtPct(n.value / rows.length)})</span>
      `, e);
    })
    .on('mousemove', e => tooltip.move(e))
    .on('mouseout', () => { linkG.selectAll('path').attr('opacity', 0.55); tooltip.hide(); });

  // node labels — left of layer 0 nodes, right of layer 2 nodes, center for
  // middle. Every label uses dark ink with a thick cream halo, which stays
  // legible on every blue / purple node fill (the previous "white text on
  // dark blue" branch made Good and V.Good vanish against the cream halo).
  node.append('text')
    .attr('x', d => d.layer === 0 ? d.x0 - 6 : d.layer === 2 ? d.x1 + 6 : (d.x0 + d.x1)/2)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('text-anchor', d => d.layer === 0 ? 'end' : d.layer === 2 ? 'start' : 'middle')
    .attr('dy','0.35em')
    .style('font-size','11.5px')
    .style('font-weight','700')
    .style('font-family',"'Inter', sans-serif")
    .style('paint-order','stroke fill')
    .style('stroke','rgba(250,247,242,0.95)')
    .style('stroke-width','4px')
    .style('stroke-linejoin','round')
    .style('fill', '#1c1917')
    .style('pointer-events','none')
    .text(d => {
      const short = SHORT[d.key]?.[d.ord] ?? d.name;
      return `${short}`;
    });

  // column headers — short single-word labels keep them inside their column
  const headers = [
    { x: 0,        anchor: 'start',  text: 'Duration' },
    { x: width/2,  anchor: 'middle', text: 'Quality' },
    { x: width,    anchor: 'end',    text: 'Performance' }
  ];
  inner.append('g').selectAll('text.col-h').data(headers).join('text')
    .attr('class','col-h')
    .attr('x', d => d.x).attr('y', -8)
    .attr('text-anchor', d => d.anchor)
    .style('fill','var(--accent)').style('font-size','10.5px')
    .style('font-weight','700').style('font-family',"'Inter', sans-serif")
    .style('letter-spacing','0.18em').style('text-transform','uppercase')
    .text(d => d.text);
}

