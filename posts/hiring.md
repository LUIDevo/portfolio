
# Can you talk your way past an AI resume screener?

AI tools score resumes and rank candidates now. With people, you can nudge an
impression with the right words. I wanted to know if the same trick works on the
model: can you raise your score just by *how* you write, without changing a single
fact?

Recently, there has been a rise in the usage of AI agents in many fields, including hiring. These AI tools are now integrated in some companies, and are able to score resumes and rank candidates.
With people, you can change their impression of you with the right words. So, I wanted to see if you can use those same tricks on an AI hiring agent; are you able to raise your score by just *how* you write, without changing a single fact?

## The setup

I used the system prompt from HiringAgent, an AI resume screener that was recently
open-sourced. It scores a resume out of 120 across four categories — open source,
projects, work experience, technical skills - plus bonus points. I wrote one
fictional candidate: a second-year CS student with an internship, two projects, and
a few open-source contributions. Then I rewrote the same resume using only different wording and keeping the general details. 

I need to write more about the system prompt

- R0 — honest, plainly written. The baseline.
- R1–R4 — the same facts with steadily more adjectives.
- A "mirror" version that echoed the scorer's own vocabulary back at it.
- An "optimized" version — my best attempt at a resume tuned for AI screeners in general.

Each resume was scored 10 times in one batch, because there were variations in model score between each run.

## What I expected

I expected that using adjectives could slightly tip the model to rate the resume higher. After a certain density of adjectives, eventually the model would catch on to the unnaturalness of the writing, and start adding deductions and viewing the resume negatively.

## What actually happened

The density of verbage didn't make much of a difference. For most runs, it hardly changed the score from the baseline. The lightest and densest resumes landed within a point of each other, and I coudn't confidently say they beat the baseline.
However, two versions did "substantially" beat the baseline. The mirror, and R3. 

When I scored the *identical* baseline twice, the two batches came back at 77.1 and 74.9. The same resume was measured twice, but both batches returned different numbers.

I first thought that the tool was unreliable. But after looking closer at the categorical scores, I saw that most categories only moves by a single point every run. Every category was reasonably similar between runs, which means that the system prompt was doing its job. The prompt could still differentiate a weak candidate from a strong one.

By looking into the system prompt, it's easy to see why this occurs. The prompt defines a "low score" by the range 1-9, while it classifies a "high score" by 20-30. So it's not unreasonable for the model to have varying ranges between run to run, because the prompt doesn't clearly definte the difference between a 3 and an 8, both are classified as weak. This also made it clear for my experiment. If I were to accurately see if I could change the models score, then I would have to measure it hundreds if not 1000s of times. And judging from my results, the scores would barely pass the baseline in any meaningful way considering one more "strong project" is 20-30 points. 

The variation wasn't even either. The noisest judgements were bonus points and open-source credit, while the skills list hardly budged. 

Suprisingly, my "optimized" resume didn't beat the baseline at all.

## So can you game it?

My experiment was far from conclusive due to the small sample size. But from what I could gather, changing the words and adding adjectives doesn't meaningfully change the resume score. My largest results on average upped the score by 3 points, while one strong project could net you an extra 20 or 30 points. However, sometimes even the smallest factor can make a big difference. In comparison to other factors 3 points doesn't make much difference, but side by side to another candidate, 3 points can make all the difference.
