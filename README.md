# Project of Data Visualization (COM-480)

| Student's name     | SCIPER |
| ------------------ | ------ |
| Ali Benchekroun    | 329911 |
| Elio Rafoul        | 359387 |
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
> The dataset contains approximately 996 responsesa nd 16 variables (Version2), collected through a structured questionnaire. It includes demographic information (year of study, gender), sleep-related indicators (sleep duration, difficulty falling asleep, sleep quality), lifestyle factors (screen usage before sleep, caffeine consumption, physical activity), and academic outcomes such as concentration difficulties, class attendance, and self-reported academic performance.
>
> This dataset is well suited for visualization, as it captures multiple interacting factors that influence student wellbeing and academic success. Its structure enables the analysis of relationships between sleep habits, lifestyle behaviors, and educational outcomes.
>
> Regarding data quality, the dataset mainly consists of categorical and ordinal survey responses (e.g., Never, Rarely, Sometimes, Often, Always). Some preprocessing will therefore be necessary to encode these responses numerically or ensure consistent ordering for analysis. Minor cleaning may also be required to standardize categories and remove potential inconsistencies.
>
> Overall, the dataset requires moderate preprocessing but provides a rich set of variables for exploring behavioral patterns among students

### Problematic

> Sleep deprivation and insomnia are increasingly reported among university students and are often associated with reduced cognitive performance, fatigue, and decreased academic productivity. However, the relationship between sleep habits and educational outcomes is complex and influenced by several behavioral and lifestyle factors.** **
>
> The goal of this project is to investigate how sleep patterns and insomnia symptoms relate to students’ academic functioning and daily academic behaviors. Rather than focusing only on sleep duration, we aim to analyze how multiple factors interact, including sleep quality, night-time awakenings, lifestyle habits, and cognitive consequences such as fatigue or concentration difficulties.
>
> More specifically, the project will explore the following questions :
>
> * Do students reporting poor sleep quality or insomnia symptoms also report greater academic difficulties?
> * Is there a relationship between sleep duration and perceived academic performance?
> * How do life style behaviors such as screen usage before sleep, caffeine consumption, or stress levels correlate with sleep disturbances?

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

## Milestone 3 (29th May, 5pm)

**80% of the final grade**

## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone
