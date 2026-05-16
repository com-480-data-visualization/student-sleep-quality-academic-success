# Screencast script — COM-480 Milestone 3

**Target duration:** 2:00 (hard limit per brief)
**Estimated:** ~1:59 at 140 wpm (278 words total)
**Format:** Talking-head + screen demo, with picture-in-picture during demo segments.
**Language:** English.

---

## Beat-by-beat breakdown

| Time | On screen | Voice-over |
|---|---|---|
| **0:00–0:10** | Camera full screen (presenter face) | "Nine out of ten students sleep more than seven hours a night. Yet nearly nine out of ten rate their academic performance as poor. So what's really going on?" |
| **0:10–0:13** | Cut → site landing page, beeswarm forming | "To find out, we built an interactive story around 996 student survey responses." |
| **0:13–0:22** | Scroll: beeswarm grouped by **sleep duration** — most in 7h+ zone | "Watch what happens when we look at the same students through four lenses. By sleep duration — most are fine." |
| **0:22–0:30** | Scroll: regroup by **sleep quality** — reds dominate | "By sleep quality — nearly half rate it 'very poor'." |
| **0:30–0:38** | Scroll: regroup by **stress** — universal red | "By stress — almost everyone is overwhelmed." |
| **0:38–0:45** | Scroll: regroup by **performance** — tiny green slice | "And by self-reported performance — only 4% say they're doing well. Same students. Same hours of sleep. Completely different stories." |
| **0:45–0:52** | Scroll to dashboard, 4 charts visible | "So we built a dashboard to explore why. Four linked views, one filter system." |
| **0:52–1:02** | Hover heatmap | "The heatmap shows that sleep quality — not duration — is the strongest predictor of grades." |
| **1:02–1:14** | **Brush** an axis on parallel coordinates (e.g. stress=high) | "But you don't have to take our word for it. Brush any axis here — and every other chart updates to match your selection." |
| **1:14–1:22** | Sankey reconfigures; click a chip in the filter bar | "Want to compare male and female students? High-stress against low-stress? One click in the filter bar." |
| **1:22–1:25** | Highlight URL bar updating | "And the URL saves your view, so you can share what you found." |
| **1:25–1:30** | Scroll to Act 3; radar appears | "Finally, we asked: what separates good sleepers from bad ones?" |
| **1:30–1:42** | Static shot on radar: two contrasting polygons | "Side by side, the answer is clear. Good sleepers exercise more and stare at screens less. Bad sleepers carry more stress and more caffeine." |
| **1:42–1:45** | Radar remains on screen | "It's lifestyle — not bedtime." |
| **1:45–1:48** | **Cut** radar → camera full screen (presenter face) | "That's our story." |
| **1:48–1:56** | Camera | "996 students, one paradox, and a dashboard you can use to explore your own sleep habits." |
| **1:56–2:00** | Overlay: site URL displayed | "Link's below. Sleep well." |

---

## Voice-over text (continuous, for teleprompter)

Nine out of ten students sleep more than seven hours a night. Yet nearly nine out of ten rate their academic performance as poor. So what's really going on?

To find out, we built an interactive story around 996 student survey responses. Watch what happens when we look at the same students through four lenses. By sleep duration — most are fine. By sleep quality — nearly half rate it "very poor". By stress — almost everyone is overwhelmed. And by self-reported performance — only 4% say they're doing well. Same students. Same hours of sleep. Completely different stories.

So we built a dashboard to explore why. Four linked views, one filter system. The heatmap shows that sleep quality — not duration — is the strongest predictor of grades. But you don't have to take our word for it. Brush any axis here — and every other chart updates to match your selection. Want to compare male and female students? High-stress against low-stress? One click in the filter bar. And the URL saves your view, so you can share what you found.

Finally, we asked: what separates good sleepers from bad ones? Side by side, the answer is clear. Good sleepers exercise more and stare at screens less. Bad sleepers carry more stress and more caffeine. It's lifestyle — not bedtime.

That's our story. 996 students, one paradox, and a dashboard you can use to explore your own sleep habits. Link's below. Sleep well.

---

## Recording notes

- **Pacing target:** 140 wpm. Run a dry timing test before recording — if you cross 2:05, trim filler words; if you finish under 1:50, slow down or add a breath.
- **Tools:** Loom (simplest), OBS Studio (free, native PiP), or QuickTime + iMovie.
- **Presenter on camera:** TBD by team.
- **Screen rehearsal:** scroll through the site at video speed before recording — confirm the scrollytelling transitions trigger cleanly and the brush propagation works as expected.
- **Final delivery:** upload to YouTube (unlisted), paste link into the README at the "Screencast" section.

## Source data verified against site

- 90% sleep ≥ 7h, 46% rate sleep poor/very poor, 93% high/extremely high stress, 88% perform below average/poor, 4% good/excellent — see README "The story" section.
- Radar axes (Stress, Screens, Caffeine, Activity, Fatigue) and "stress + screens" gap takeaway — confirmed in `website/js/charts/radar.js` header comment.
