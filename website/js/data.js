/* data.js — single source of truth for dataset structure
   Loads the raw CSV (996 rows, 16 columns including timestamp), normalizes each
   row into { key: { raw, ord } } so that charts can sort/scale by ordinal index
   while still showing original labels in tooltips. Every value seen in the
   dataset is whitelisted below — unknown values trigger a console warning and
   the offending row is skipped (we never silently coerce). */

// Exact CSV headers — column 3 has a trailing space in the source file; preserved literally.
export const RAW_COLS = Object.freeze({
  year:          '1. What is your year of study?',
  gender:        '2. What is your gender?',
  fallAsleep:    '3. How often do you have difficulty falling asleep at night? ',
  duration:      '4. On average, how many hours of sleep do you get on a typical day?',
  wakeNight:     '5. How often do you wake up during the night and have trouble falling back asleep?',
  quality:       '6. How would you rate the overall quality of your sleep?',
  concentration: '7. How often do you experience difficulty concentrating during lectures or studying due to lack of sleep?',
  fatigue:       '8. How often do you feel fatigued during the day, affecting your ability to study or attend classes?',
  missClass:     '9. How often do you miss or skip classes due to sleep-related issues (e.g., insomnia, feeling tired)?',
  assignImpact:  '10. How would you describe the impact of insufficient sleep on your ability to complete assignments and meet deadlines?',
  electronics:   '11. How often do you use electronic devices (e.g., phone, computer) before going to sleep?',
  caffeine:      '12. How often do you consume caffeine (coffee, energy drinks) to stay awake or alert?',
  activity:      '13. How often do you engage in physical activity or exercise?',
  stress:        '14. How would you describe your stress levels related to academic workload?',
  performance:   '15. How would you rate your overall academic performance (GPA or grades) in the past semester?',
});

// Ordinal arrays in ASCENDING order — index = ord. Categorical fields (gender) are listed as 2 hues.
export const LABELS = Object.freeze({
  year:          ['First year','Second year','Third year','Graduate student'],
  gender:        ['Female','Male'],
  fallAsleep:    ['Never','Rarely (1-2 times a week)','Sometimes (3-4 times a week)','Often (5-6 times a week)','Every night'],
  duration:      ['Less than 4 hours','4-5 hours','6-7 hours','7-8 hours','More than 8 hours'],
  wakeNight:     ['Never','Rarely (1-2 times a week)','Sometimes (3-4 times a week)','Often (5-6 times a week)','Every night'],
  quality:       ['Very poor','Poor','Average','Good','Very good'],
  concentration: ['Never','Rarely','Sometimes','Often','Always'],
  fatigue:       ['Never','Rarely','Sometimes','Often','Always'],
  missClass:     ['Never','Rarely (1-2 times a month)','Sometimes (1-2 times a week)','Often (3-4 times a week)','Always'],
  assignImpact:  ['No impact','Minor impact','Moderate impact','Major impact','Severe impact'],
  electronics:   ['Never','Rarely (1-2 times a week)','Sometimes (3-4 times a week)','Often (5-6 times a week)','Every night'],
  caffeine:      ['Never','Rarely (1-2 times a week)','Sometimes (3-4 times a week)','Often (5-6 times a week)','Every day'],
  activity:      ['Never','Rarely (1-2 times a week)','Sometimes (3-4 times a week)','Often (5-6 times a week)','Every day'],
  stress:        ['No stress','Low stress','High stress','Extremely high stress'],
  performance:   ['Poor','Below Average','Average','Good','Excellent'],
});

// Compact tick labels for tight axes.
export const SHORT = Object.freeze({
  year:          ['Y1','Y2','Y3','Grad'],
  gender:        ['F','M'],
  fallAsleep:    ['Never','Rarely','Sometimes','Often','Every night'],
  duration:      ['<4h','4–5h','6–7h','7–8h','>8h'],
  wakeNight:     ['Never','Rarely','Sometimes','Often','Every night'],
  quality:       ['V.Poor','Poor','Avg','Good','V.Good'],
  concentration: ['Never','Rarely','Sometimes','Often','Always'],
  fatigue:       ['Never','Rarely','Sometimes','Often','Always'],
  missClass:     ['Never','Rarely','Sometimes','Often','Always'],
  assignImpact:  ['None','Minor','Moderate','Major','Severe'],
  electronics:   ['Never','Rarely','Sometimes','Often','Every night'],
  caffeine:      ['Never','Rarely','Sometimes','Often','Every day'],
  activity:      ['Never','Rarely','Sometimes','Often','Every day'],
  stress:        ['None','Low','High','Extreme'],
  performance:   ['Poor','Below','Avg','Good','Excel'],
});

// Friendly axis titles.
export const TITLES = Object.freeze({
  year:          'Year of study',
  gender:        'Gender',
  fallAsleep:    'Difficulty falling asleep',
  duration:      'Sleep duration',
  wakeNight:     'Night awakenings',
  quality:       'Sleep quality',
  concentration: 'Concentration difficulty',
  fatigue:       'Daytime fatigue',
  missClass:     'Missed classes',
  assignImpact:  'Impact on assignments',
  electronics:   'Electronics before bed',
  caffeine:      'Caffeine consumption',
  activity:      'Physical activity',
  stress:        'Stress level',
  performance:   'Academic performance',
});

// raw → integer ord lookup, built once.
export const ORD = Object.freeze(
  Object.fromEntries(
    Object.entries(LABELS).map(([k, arr]) => [k, Object.fromEntries(arr.map((v, i) => [v, i]))])
  )
);

// All keys that map to {raw, ord} structures.
const ORDINAL_KEYS = Object.keys(LABELS).filter(k => k !== 'gender');

// --- public API ---
let _cache = null;

export async function loadData(csvPath = 'data/students.csv') {
  if (_cache) return _cache;
  const raw = await d3.csv(csvPath);
  const out = [];
  let dropped = 0;
  const drops = {};
  raw.forEach((r, i) => {
    const row = { id: i };
    let bad = null;

    // gender is categorical
    const g = (r[RAW_COLS.gender] || '').trim();
    if (LABELS.gender.indexOf(g) < 0) bad = `gender=${JSON.stringify(g)}`;
    else row.gender = g;

    // year + 13 ordinals
    if (!bad) for (const k of ORDINAL_KEYS) {
      const v = (r[RAW_COLS[k]] || '').trim();
      const ord = ORD[k][v];
      if (ord === undefined) { bad = `${k}=${JSON.stringify(v)}`; break; }
      row[k] = { raw: v, ord };
    }

    if (bad) {
      dropped++;
      drops[bad] = (drops[bad] || 0) + 1;
    } else {
      out.push(row);
    }
  });

  if (dropped) {
    console.warn(`[data] dropped ${dropped} row(s) with unknown values`);
    console.table(drops);
  }
  console.log(`[data] loaded ${out.length} clean rows / ${raw.length} total`);
  _cache = out;
  return out;
}

/* Convenience: how many ordinal levels does a key have? */
export const levels = (key) => LABELS[key].length;
