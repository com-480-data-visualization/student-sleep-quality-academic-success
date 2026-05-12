/* scrolly.js — Act 1 scrollytelling beeswarm.

   One dot per student (996 total). A d3.forceSimulation reshuffles the
   cohort across the visible svg as the user scrolls, with smooth ~750 ms
   transitions on both colour and target position. Steps are detected by
   IntersectionObserver — sticky chart on the right of the page stays in
   place while the prose steps scroll past on the left.

   Step plan:
     0 — single cluster, neutral colour ("here are 996 students")
     1 — clustered by sleep duration, neutral colour ("they sleep enough")
     2 — same x by duration, recoloured by quality ("but quality is bad")
     3 — same x by duration, recoloured by stress
     4 — same x by duration, recoloured by performance
     5 — clustered by performance, coloured by duration (final reveal:
         duration buckets are evenly spread across performance) */

import { LABELS, levels, TITLES, SHORT } from '../data.js';
import { COLORS, tooltip } from '../utils.js';

const NEUTRAL = '#ea580c';   // brand orange — bold on cream paper

/* Build a CSS linear-gradient from a sequential d3 scale, sampled at n+1 stops. */
function gradientStops(scale, n) {
  const stops = [];
  for (let i = 0; i <= n; i++) {
    stops.push(`${scale(i)} ${(i / n) * 100}%`);
  }
  return stops.join(', ');
}

const STEPS = [
  { groupBy: null,         colorBy: () => NEUTRAL,
    title: '996 students surveyed',
    caption: 'Each dot = one student. The story starts here.',
    legend: null },
  { groupBy: 'duration',   colorBy: () => NEUTRAL,
    title: 'Grouped by sleep duration',
    caption: 'Most of the cohort lands in the "7–8 hours" or "more than 8 hours" buckets.',
    legend: null },
  { groupBy: 'duration',   colorBy: (r) => COLORS.quality(r.quality.ord),
    title: 'Re-coloured by sleep quality',
    caption: 'Same population, same buckets — colour now encodes self-rated quality (darker blue = better).',
    legend: { key: 'Sleep quality', low: 'Very poor', high: 'Very good',
              scale: COLORS.quality, n: 4 } },
  { groupBy: 'duration',   colorBy: (r) => COLORS.stress(r.stress.ord),
    title: 'Re-coloured by stress',
    caption: 'Orange = high stress. Almost everyone sits at "high" or "extremely high".',
    legend: { key: 'Stress', low: 'No stress', high: 'Extreme',
              scale: COLORS.stress, n: 3 } },
  { groupBy: 'duration',   colorBy: (r) => COLORS.performance(r.performance.ord),
    title: 'Re-coloured by academic performance',
    caption: '88% report "poor" or "below average". The grade distribution looks the same in every duration column.',
    legend: { key: 'Performance', low: 'Poor', high: 'Excellent',
              scale: COLORS.performance, n: 4 } },
  { groupBy: 'performance', colorBy: (r) => COLORS.duration(r.duration.ord),
    title: 'Now grouped by performance, coloured by duration',
    caption: 'Look at the spread of purple (sleep duration) within every performance column — duration tells us nothing about grades.',
    legend: { key: 'Sleep duration', low: '< 4h', high: '> 8h',
              scale: COLORS.duration, n: 4 } },
];

let _rows, _simulation, _circles, _stepIndex = -1, _svg, _W = 600, _H = 480;

export function initScrolly(rows) {
  _rows = rows;

  const svgEl = document.getElementById('scrolly-svg');
  if (!svgEl) return;
  _svg = d3.select(svgEl);

  const measure = () => {
    const r = svgEl.getBoundingClientRect();
    _W = Math.max(280, r.width);
    _H = Math.max(280, r.height);
    _svg.attr('viewBox', `0 0 ${_W} ${_H}`);
  };
  measure();

  // Initial random scatter
  rows.forEach(r => {
    r.x = _W/2 + (Math.random()-0.5) * Math.min(_W, _H) * 0.4;
    r.y = _H/2 + (Math.random()-0.5) * _H * 0.6;
  });

  // dots
  _svg.selectAll('*').remove();
  const g = _svg.append('g').attr('class','dots');
  _circles = g.selectAll('circle').data(rows, r => r.id).join('circle')
    .attr('r', radiusForCount(rows.length, _W, _H))
    .attr('fill', NEUTRAL)
    .attr('cx', r => r.x).attr('cy', r => r.y)
    .attr('opacity', 0.88)
    .attr('stroke','rgba(28,25,23,0.18)').attr('stroke-width', 0.4)
    .on('mouseover', function(e, r) {
      d3.select(this).attr('stroke','#1c1917').attr('stroke-width', 1.5).attr('r', 6);
      tooltip.show(`
        <strong>Student #${r.id}</strong><br>
        <span class="muted">${r.gender} · ${r.year.raw}</span><br>
        <span class="muted">Duration:</span> ${r.duration.raw}<br>
        <span class="muted">Quality:</span> ${r.quality.raw}<br>
        <span class="muted">Stress:</span> ${r.stress.raw}<br>
        <span class="muted">Performance:</span> ${r.performance.raw}
      `, e);
    })
    .on('mousemove', e => tooltip.move(e))
    .on('mouseout', function() {
      d3.select(this).attr('stroke','rgba(28,25,23,0.18)').attr('stroke-width', 0.4).attr('r', radiusForCount(rows.length, _W, _H));
      tooltip.hide();
    });

  _simulation = d3.forceSimulation(rows)
    .alphaDecay(0.04)
    .force('x', d3.forceX(_W/2).strength(0.06))
    .force('y', d3.forceY(_H/2).strength(0.18))
    .force('collide', d3.forceCollide().radius(radiusForCount(rows.length, _W, _H) + 0.6).iterations(2))
    .on('tick', () => _circles.attr('cx', r => r.x).attr('cy', r => r.y));

  // group axis labels container
  _svg.append('g').attr('class','group-axis');

  // observe steps
  const steps = document.querySelectorAll('#scrolly-steps .scrolly-step');
  const obs = new IntersectionObserver((entries) => {
    let active = null;
    entries.forEach(e => {
      if (e.isIntersecting) {
        active = +e.target.dataset.step;
      }
    });
    if (active === null) return;
    steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === active));
    applyStep(active);
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0.0 });

  steps.forEach(s => obs.observe(s));

  // initial step
  applyStep(0);

  window.addEventListener('resize', () => {
    measure();
    applyStep(_stepIndex >= 0 ? _stepIndex : 0);
  });
}

function radiusForCount(n, w, h) {
  // pick a radius so the packed cluster fills a good fraction of the canvas
  const area = w * h;
  return Math.max(2.6, Math.min(6.5, Math.sqrt(area / n) * 0.21));
}

function applyStep(idx) {
  if (idx === _stepIndex) return;
  _stepIndex = idx;
  const step = STEPS[idx];

  // headers
  const t = document.getElementById('scrolly-title');
  const c = document.getElementById('scrolly-caption');
  if (t) t.textContent = step.title;
  if (c) c.textContent = step.caption;

  // color legend (visible only when this step has a colour encoding)
  updateColorLegend(step.legend);

  // recolour with transition
  _circles.transition().duration(700).attr('fill', step.colorBy);

  // group-axis labels
  drawGroupAxis(step.groupBy);

  // force layout: x by group, y by lane
  if (step.groupBy) {
    const key = step.groupBy;
    const n = levels(key);
    const xCenters = d3.range(n).map(i => marginLeft() + (i + 0.5) * (innerWidth_() / n));
    _simulation
      .force('x', d3.forceX(r => xCenters[r[key].ord]).strength(0.18))
      .force('y', d3.forceY(_H / 2 + 16).strength(0.06))
      .alpha(0.7).restart();
  } else {
    _simulation
      .force('x', d3.forceX(_W / 2).strength(0.06))
      .force('y', d3.forceY(_H / 2).strength(0.18))
      .alpha(0.7).restart();
  }
}

function marginLeft() { return 24; }
function marginRight() { return 24; }
function innerWidth_() { return _W - marginLeft() - marginRight(); }

function updateColorLegend(legend) {
  const root = document.getElementById('scrolly-legend');
  if (!root) return;
  if (!legend) { root.hidden = true; return; }
  root.hidden = false;
  document.getElementById('sl-key').textContent  = legend.key;
  document.getElementById('sl-low').textContent  = legend.low;
  document.getElementById('sl-high').textContent = legend.high;
  const bar = document.getElementById('sl-bar');
  bar.style.background = `linear-gradient(to right, ${gradientStops(legend.scale, legend.n)})`;
}

function drawGroupAxis(key) {
  const ax = _svg.select('g.group-axis');
  ax.selectAll('*').remove();
  if (!key) return;

  const n = levels(key);
  const labels = SHORT[key];
  const w = innerWidth_();
  const yLine = _H - 18;
  const yLbl  = _H - 4;

  // top label
  ax.append('text')
    .attr('x', _W/2).attr('y', 14).attr('text-anchor','middle')
    .style('fill','var(--accent)').style('font-size','10px')
    .style('font-weight','700')
    .style('text-transform','uppercase').style('letter-spacing','0.16em')
    .text(`Grouped by ${TITLES[key].toLowerCase()}`);

  // bucket labels along the bottom
  for (let i = 0; i < n; i++) {
    const x = marginLeft() + (i + 0.5) * (w / n);
    ax.append('text')
      .attr('x', x).attr('y', yLbl).attr('text-anchor','middle')
      .style('fill','var(--text)').style('font-size','11px')
      .style('font-weight','600').style('font-family',"'Inter', sans-serif")
      .text(labels[i]);
  }
}
