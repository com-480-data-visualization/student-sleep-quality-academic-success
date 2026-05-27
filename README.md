# Project of Data Visualization (COM-480)


| Student's name     | SCIPER |
| ------------------ | ------ |
| Ali Benchekroun    | 329911 |
| Elias Rafoul       | 359387 |
| Hana El Moutaoukil | 340995 |


[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> We use the *[Student Insomnia and Educational Outcomes](https://data.mendeley.com/datasets/5mvrx4v62z/3)* dataset, a survey-based dataset exploring the relationship between sleep habits, lifestyle factors, and academic performance among students.
>
> The dataset contains approximately 996 responses and 16 variables (Version2), collected through a structured questionnaire. It includes demographic information (year of study, gender), sleep-related indicators (sleep duration, difficulty falling asleep, sleep quality), lifestyle factors (screen usage before sleep, caffeine consumption, physical activity), and academic outcomes such as concentration difficulties, class attendance, and self-reported academic performance.
>
> This dataset is well suited for visualization, as it captures multiple interacting factors that influence student wellbeing and academic success. Its structure enables the analysis of relationships between sleep habits, lifestyle behaviors, and educational outcomes.
>
> Regarding data quality, the dataset mainly consists of categorical and ordinal survey responses (e.g., Never, Rarely, Sometimes, Often, Always). Some preprocessing will therefore be necessary to encode these responses numerically or ensure consistent ordering for analysis. Minor cleaning may also be required to standardize categories and remove potential inconsistencies.
>
> Overall, the dataset requires moderate preprocessing but provides a rich set of variables for exploring behavioral patterns among students.

### Problematic

> Sleep deprivation and insomnia are increasingly reported among university students and are often associated with reduced cognitive performance, fatigue, and decreased academic productivity. However, the relationship between sleep habits and educational outcomes is complex and influenced by several behavioral and lifestyle factors.
>
> The goal of this project is to investigate how sleep patterns and insomnia symptoms relate to students’ academic functioning and daily academic behaviors. Rather than focusing only on sleep duration, we aim to analyze how multiple factors interact, including sleep quality, night-time awakenings, lifestyle habits, and cognitive consequences such as fatigue or concentration difficulties.
>
> More specifically, the project will explore the following questions :
>
> - Do students reporting poor sleep quality or insomnia symptoms also report greater academic difficulties?
> - Is there a relationship between sleep duration and perceived academic performance?
> - How do life style behaviors such as screen usage before sleep, caffeine consumption, or stress levels correlate with sleep disturbances?

### Exploratory Data Analysis

> The dataset used in this project contains 996 student survey responses and 16 variables related to sleep behavior, lifestyle habits, and academic outcomes.
>
> The first step of the exploratory analysis consisted of inspecting the dataset structure and identifying variable types. Most variables correspond to ordinal categorical responses, such as frequency scales (e.g., Never, Rarely, Sometimes, Often, Always) or quality assessments (e.g., Poor, Average, Good, Excellent). These responses require ordering and encoding to enable meaningful comparisons and visualization.
>
> Initial preprocessing steps include checking for missing values, standardizing categorical responses, and ordering ordinal variables according to their natural scale.
>
> Basic descriptive analysis shows that sleep-related issues are common among respondents. Many students report difficulties falling asleep, frequent awakenings, and reduced sleep quality. Similarly, a large proportion reports daytime fatigue and concentration difficulties.
>
> Early exploratory analysis suggests several relationships worth investigating: shorter sleep duration is associated with higher fatigue; poor sleep quality is linked to concentration difficulties; and higher stress levels and screen usage before sleep may correlate with insomnia symptoms.
>
> These preliminary observations indicate that the dataset contains meaningful patterns linking sleep habits, life style behaviors, and academic outcomes. The next step is to design visualizations that clearly highlight these relationships and allow effective comparisons.

### Related work

> The dataset is hosted on Mendeley Data as the *[Student Insomnia and Educational Outcomes](https://data.mendeley.com/datasets/5mvrx4v62z/3)* dataset (published on 16 May 2025). It is intended for statistical and machine-learning analyses linking sleep, stress, lifestyle habits, and academic outcomes. This indicates that the dataset has already been used for quantitative analysis, but also suggests potential for more accessible visual exploration.
>
> A recent study, [“A Psychometric Framework for Modeling the Impact of Insomnia on Academic Performance”](https://www.sciencedirect.com/science/article/pii/S2667343625000228), uses this dataset for predictive modeling, clustering, and feature importance analysis. The authors report a significant negative correlation between sleep disturbances and GPA, and identify sleep-onset difficulty, perceived stress, and caffeine consumption as key predictors of academic decline.
>
> Our approach differs in both purpose and format. Instead of building predictive models, we aim to design an interactive visualization that helps users explore relationships between sleep, lifestyle, stress, and academic outcomes. The objective is not to predict performance, but to make these relationships easier to interpret through visual exploration.
>
> For visual inspiration, we draw on two examples. First, [Our World in Data’s Time Use](https://ourworldindata.org/time-use) page illustrates how clean layouts and clear comparisons can effectively present behavioral patterns. Second, the CMU project [Exploring Sleep Patterns and Academic Performance](https://www.stat.cmu.edu/capstoneresearch/spring2024/315files_s24/team15.html) demonstrates how visual tools such as density plots and correlation views can highlight relationships between sleep variables and academic performance.
>
> Our contribution is therefore to transform a dataset mainly used for statistical analysis into a more intuitive and accessible visual exploration of student sleep habits and academic functioning.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**

**Live preview (via raw.githack.com):** [https://raw.githack.com/com-480-data-visualization/student-sleep-quality-academic-success/main/website-m2/index.html](https://raw.githack.com/com-480-data-visualization/student-sleep-quality-academic-success/main/website-m2/index.html)

Milestone 2 report: `[milestones/Reports/ReportMilestone2.pdf](milestones/Reports/ReportMilestone2.pdf)`

Source in repo: `[website-m2/index.html](website-m2/index.html)`

## Milestone 3 (29th May, 5pm)

**80% of the final grade**

**Live website (using Github Pages):** [https://com-480-data-visualization.github.io/student-sleep-quality-academic-success/](https://com-480-data-visualization.github.io/student-sleep-quality-academic-success/)

Source in repo: `[website/index.html](website/index.html)`.

**Process book:** `[milestones/Reports/ProcessBook.pdf](milestones/Reports/ProcessBook.pdf)` (LaTeX source: `[milestones/Reports/ProcessBook.tex](milestones/Reports/ProcessBook.tex)`)

**Screencast (watch on YouTube):** [https://youtu.be/fPZ7k1cgDO0](https://youtu.be/fPZ7k1cgDO0)

**Screencast (download from repo):** `[milestones/Reports/ScreencastStudentSleep.mov](https://github.com/com-480-data-visualization/student-sleep-quality-academic-success/raw/main/milestones/Reports/ScreencastStudentSleep.mov)` (32 MB — click to download).

### The story

Sleep deprivation is the usual explanation for student under-performance — but in this dataset the picture is sharper and stranger. **90 % of the 996 students get at least seven hours per night, yet 46 % rate their sleep "very poor" or "poor", 93 % report "high" or "extremely high" stress, and 88 % rate their academic performance "below average" or "poor".** Only four percent reach "good" or "excellent". The takeaway isn't *sleep more*; it's that **hours are not the same as rest**, and the variables that actually move the needle are sleep quality, stress, screen time and physical activity. The site opens with a six-step scrollytelling sequence that demonstrates this paradox, then hands control to the reader for free exploration.

### Repository structure

```
.
├── README.md                                ← this file (Milestones 1, 2, 3)
├── data/                                    ← raw dataset (.csv)
├── milestones/
│   ├── Instructions/                        ← official briefs from the course (.pdf)
│   └── Reports/
│       ├── ReportMilestone2.pdf             ← graded Milestone 2 report
│       ├── ProcessBook.pdf                  ← Milestone 3 process book
│       └── ProcessBook.tex                  ← LaTeX source for the process book
├── website-m2/
│   └── index.html                           ← original Milestone 2 prototype (archived)
└── website/                                 ← Milestone 3 site (rebuilt from scratch)
    ├── index.html                           ← entry point — single-page app
    ├── css/{base,layout,components}.css     ← design tokens, page layout, UI parts
    ├── js/
    │   ├── main.js                          ← boot: load data, init charts, wire filters
    │   ├── data.js                          ← CSV parser + ordinal value whitelist
    │   ├── state.js                         ← filter store + d3.dispatch event bus
    │   ├── filterBar.js                     ← sticky filter UI
    │   ├── utils.js                         ← tooltip, color scales, CSV download
    │   └── charts/
    │       ├── scrolly.js                   ← Act 1 beeswarm + scroll observer
    │       ├── heatmap.js                   ← RQ1, with chi-square residual toggle
    │       ├── stacked.js                   ← RQ2, 100 %-stacked horizontal bar
    │       ├── parallel.js                  ← RQ3, 6-axis parallel coordinates
    │       ├── sankey.js                    ← Duration → Quality → Performance flow
    │       └── radar.js                     ← Act 3 group comparison
    ├── data/students.csv                    ← copy of the dataset used at runtime
    └── assets/favicon.svg
```

### Local setup

The site is plain HTML + ES modules — no build step.

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

You need a local server (not `file://`) because the page fetches `data/students.csv` over HTTP.

### Tech stack

- **D3.js v7** — every chart (scales, layouts, transitions, brushes, force simulation).
- **d3-sankey v0.12** — flow diagram.
- **Vanilla JS ES modules** — `<script type="module">`, no bundler, no framework.
- **Plain CSS** — design tokens in `:root`, three small stylesheets.
- **Fraunces / Inter / JetBrains Mono** — Google Fonts (editorial serif headlines, modern sans body, monospace data labels).

### Features

- **Act 1 — Scrollytelling.** Sticky D3 beeswarm with 996 dots; six steps re-group and re-colour the same cohort to demonstrate the paradox (sleep enough → quality terrible → stress universal → performance bad → hours don't predict grades). A gradient legend strip inside the canvas labels the active colour encoding at every step.
- **Act 2 — Dashboard.** Sleep quality × performance heatmap with a chi-square residual toggle, sleep duration → performance 100 %-stacked bar with proportion/absolute toggle, six-axis parallel coordinates with per-axis brushing, and a Sankey diagram tracing duration → quality → performance flow. All four charts share a single filter store; brushing an axis on the parallel coords applies a chip to the filter bar that every other chart respects.
- **Act 3 — Profiles in contrast.** Two-group radar over five lifestyle axes with paired pickers; the default compares very-poor sleepers with very-good sleepers, and any other split is one dropdown away.
- **Shared filter bar.** Six dropdowns (gender, year, screens, caffeine, activity, stress) plus a live N counter, a "share my view" URL hash, a CSV export of the current filtered cohort, and a reset button.
- **Accessibility.** Every SVG root carries a role and an aria-label, every interactive control gets a visible focus ring, and no chart uses a rainbow palette — ordinal data is encoded with single-hue sequential scales per the course's perception guidelines.
- **Responsive.** Single-column collapse at 980 px, tighter padding at 640 px.

## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

