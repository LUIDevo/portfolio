
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

The problem isn't reliability, it's resolution. The gap between a good and a bad
candidate is 15–20 points in a category. The gap I was creating by rewording — 1 to
5 points on the total — is the same size as the tool's jitter. So I can't show that
wording moved the score. Not because wording does nothing, but because any effect it
has is the same size as the coin-flip underneath it.

The jitter also wasn't spread evenly. The fuzziest judgments — bonus points and
open-source credit — swung the most, while concrete things like the skills list
barely moved. And my "optimized" resume, for what it's worth, didn't beat the
baseline at all; reordering and rewording actually *lowered* its open-source score.

## So can you game it?

Not really — not by rephrasing a fixed set of facts. The lever people assume exists
("use stronger language") turns out to be smaller than the machine's own run-to-run
randomness. If you want a higher score, the boring route wins by default: have
better facts.

Where I'd actually be cautious is the opposite direction. A real screening scores
each resume once, not ten times, and the fuzziest categories are the jumpiest — so a
borderline candidate's outcome can partly ride on which roll their single run lands
on. The tool is steady enough to rank people who are clearly different. It's the
close calls where the noise gets a vote.

## Caveats

One fictional candidate, one screener, ten runs each. The wording effects I saw are
suggestive, not established — which is sort of the point. If a wording trick can't
clear the tool's own noise floor in a controlled test, it isn't a trick you can
count on.
