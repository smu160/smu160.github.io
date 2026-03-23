---
title: "Missile Defense is NP-Complete"
date: 2026-03-05
draft: false
math: "katex"
summary: "Why optimally assigning interceptors to incoming warheads is computationally intractable, and what that means for the real world."
description: "Exploring the Weapon-Target Assignment problem: how missile defense connects to NP-completeness, SSPK probability calculations, and how saturation attacks exploit computational limits."
author: "Saveliy Yusufov"
tags: ["optimization", "NP-complete", "missile-defense", "operations-research", "probability"]
categories: ["Algorithms", "Optimization"]
toc: true
---

Imagine you're responsible for defending a region from incoming nuclear
warheads. Your systems inform you of 3 incoming missiles, and you have 7
interceptors available to you. The question you would find yourself asking is
how do you allocate your interceptors such that you *maximize* expected survival?
It turns out that this allocation problem is NP-complete. But before we get to
why, we need to understand how unreliable a single intercept actually is.

## SSPK: How good is a single interceptor?

Single Shot Probability of Kill (SSPK) is the probability that an individual
interceptor successfully intercepts one warhead in a single engagement. SSPK
captures *almost* everything: sensor accuracy, guidance precision, interceptor
quality, etc.

Now, let's consider a real-world missile defense system. The U.S. Ground-Based
Midcourse Defense (GMD) system uses Ground-Based Interceptors (GBIs) designed
to intercept ICBMs. Estimates place the GBI's SSPK at roughly 56%, based on the
system's intercept test record [3]. Each GBI costs approximately $75 million,
and as of 2024, 44 are reportedly deployed across Alaska and California [3].

Hence, a single GBI that costs $75 million offers a 56% chance of successfully
intercepting an incoming nuclear warhead. That's better than a coin flip, but
not by much. Note that SSPK figures derived from controlled flight tests are
generally more favorable than what would be expected under real operational
conditions.

## Improving the Odds: Assign Multiple Interceptors per Warhead
<figure>
  <img
  src="/images/two_interceptors_one_warhead.gif"
  alt="Two interceptors assigned to one warhead">
  <figcaption>Two interceptors engaging a single warhead in a recent conflict [11]</figcaption>
</figure>

First and foremost, let's assume that interceptor failures are **independent**.
That is, one interceptor missing doesn't affect whether another is able to
achieve a successful hit. 

Now, we can compute the probability of at least one interceptor successfully
knocking out an incoming nuclear warhead.

The probability that a single interceptor misses is:
$$
P(\text{miss}) = 1 - sspk
$$

If you fire $n$ interceptors independently, the probability that *all* of them miss is:
$$
P(\text{all miss}) = (1 - sspk)^{n}
$$

Therefore the probability that at least one interceptor kills the target is:
$$
P(\text{kill} \mid n \text{ interceptors}) = 1 - (1 - sspk)^{n}
$$

Using the publicly available information about the U.S. GMD, we set

$sspk = 0.56$ and $n = 4$, which gives us
$$
P(\text{kill}) = 1 - (1 - 0.56)^{4} \approx 0.9625 \approx 96\%
$$

Note that the independence assumption is optimistic and may not reflect
reality. If interceptor failures are correlated (e.g., all interceptors rely on
the same tracking data and misidentify a decoy as the real warhead), the actual
probability of successful intercept will be lower than what this formula
predicts.

Here's how the kill probability scales with additional interceptors:

| Interceptors ($n$) | $P(\text{kill})$ |
|:---:               |:---:|
| 1                  | 56.00% |
| 2                  | 80.64% |
| 3                  | 91.48% |
| 4                  | 96.25% |
| 5                  | 98.35% |


Hence, for one warhead, a defender can launch $4$ interceptors and have a 96%
chance of successfully intercepting the incoming warhead. 

Unfortunately, those numbers are optimistic.

## $P(\text{track})$: What SSPK Doesn't Capture

You can't hit what you can't see. The formula $P(\text{kill}) = 1 - (1 -
sspk)^n$ assumes you've already successfully detected the incoming warhead,
tracked it with enough precision to commit an interceptor, correctly classified
it as a real warhead (i.e., not a decoy), and that your command & control
systems are functional. In reality, all of these steps can fail. In that case,
it doesn't matter how many more interceptors you are willing to expend.

Wilkening (1998) formalizes this concept with a probability
$P(\text{track})$ that captures the entire
detection-tracking-classification-command&control pipeline [5]. The
comprehensive kill probability becomes:

$$
K_w = P(\text{track}) \times \left[1 - (1 - sspk)^n\right]
$$

This is a *common mode* factor. That is, if the target is never detected or is
misclassified as debris, then every interceptor assigned to it fails. The
independence assumption from the previous section is conditional upon
successful tracking.

Here's what the kill probability table looks like when $P(\text{track}) < 1$:

| Interceptors ($n$) | $P(\text{track}) = 1.0$ | $P(\text{track}) = 0.95$ | $P(\text{track}) = 0.90$ |
|:---:|:---:|:---:|:---:|
| 1 | 56.00% | 53.20% | 50.40% |
| 2 | 80.64% | 76.61% | 72.58% |
| 3 | 91.48% | 86.91% | 82.33% |
| 4 | 96.25% | 91.44% | 86.63% |
| 5 | 98.35% | 93.43% | 88.52% |

At $P(\text{track}) = 0.90$, the "96% kill probability" with 4 interceptors
drops to under 87%. Even an allocation of 5 interceptors reaches only 89%, still short
of what the idealized model achieves with just 3.

Wilkening's analysis shows that for national missile defense to achieve 80%
confidence of destroying all warheads against even modest attacks (4–20 reentry
vehicles), you need $P(\text{track}) > 0.978$. Below that threshold, no
amount of SSPK improvement is sufficient. This is an extraordinarily high bar
-- the entire pipeline (i.e., detection, tracking, classification, etc.) must
work nearly perfectly, nearly every time.

Hence, the probabilities of successful interception in the previous section are
best case. The effective kill probability in the real world is always
lower, because $P(\text{track})$ is always less than 1.

And $P(\text{track})$ is not just passively less than $1$ -- an adversary will
actively try to drive it toward zero. Recent events have demonstrated this
directly. Namely, missile defense radars have been successfully targeted and
destroyed in the (as of today's date) active conflict, eliminating tracking
coverage for entire regions [7][8][9]. These sensors cost hundreds of
millions to billions of dollars each. Destroying or degrading them doesn't just
reduce $P(\text{track})$ -- it can eliminate it entirely for the coverage area
those radars served. No amount of interceptors can compensate for a tracking
pipeline that no longer exists.

This tracking issue also comes up in one of the more [pernicious software
bugs](https://www.youtube.com/watch?v=_Dbd3z8t9qc) of all time -- the 1991
Patriot missile failure. A cumulative fixed-point truncation error in the
system's clock caused the tracking radar to look in the wrong part of the sky,
and the incoming Scud missile was never tracked. Twenty-eight servicemembers
were killed. The interceptors were physically capable, but $P(\text{track})$
was effectively zero.

For now, let's assume we have great tracking. What happens when the adversary
fires more than one missile?

## Multiple Incoming Missiles

You have $I = 7$ interceptors and $W = 3$ incoming warheads, as in
our opening scenario. We'll also leave out the $P(\text{track})$ and consider
the idealized case. The warheads have different targets: warhead $A$ is headed
for a major city, warhead $B$ for an airport, and warhead $C$ for a military
base. How should you allocate your interceptors?

| Allocation | $P(\text{kill A})$ | $P(\text{kill B})$ | $P(\text{kill C})$ |
|:---|:---:|:---:|:---:|
| 4 to $A$, 2 to $B$, 1 to $C$ | 96.25% | 80.64% | 56.00% |
| 3 to $A$, 3 to $B$, 1 to $C$ | 91.48% | 91.48% | 56.00% |
| 3 to $A$, 2 to $B$, 2 to $C$ | 91.48% | 80.64% | 80.64% |
| 2 to $A$, 2 to $B$, 3 to $C$ | 80.64% | 80.64% | 91.48% |

The "right" allocation depends on the relative values of the targets.

Now let's scale this up. Assume an inventory of $44$ interceptors and $15$
incoming warheads. Each warhead is aimed at a different city, each with
different estimated values, and each interceptor has a different SSPK against
each warhead -- depending on geometry, timing, and type of interceptor. Then,
the number of possible assignments explodes combinatorially.

## The Weapon-Target Assignment Problem

The allocation problem above has a formal name: the Weapon-Target Assignment
(WTA) problem. Note that the formulation uses per-pair probabilities $p_{ij}$,
which naturally accommodate heterogeneous interceptor types. For example, the U.S. missile
defense architecture includes GBIs for midcourse ICBM intercept, THAAD and
SM-3 for regional and exoatmospheric defense, SM-6 for terminal-phase
engagements, and Patriot PAC-3 for short-range point defense. A GBI engaging an
ICBM in midcourse will have a different SSPK than a THAAD interceptor engaging
the same target in its terminal phase. These differences are encoded in the
data (the $p_{ij}$ matrix), not in the formulation structure. Interceptor-target
pairings that are physically infeasible (e.g., a Patriot engaging an ICBM in
midcourse) are represented by $p_{ij} = 0$.

Given:

$I$ interceptors (weapons), indexed $i = 1, \ldots, I$

$W$ warheads (targets), indexed $j = 1, \ldots, W$

A **value** $V_j > 0$ for each warhead (the value of the asset that warhead $j$ threatens)

An **SSPK matrix** $p_{ij} \in [0, 1]$: the probability that interceptor $i$ destroys warhead $j$

Decision variables $x_{ij} \in \{0, 1\}$: whether interceptor $i$ is assigned to warhead $j$

The objective is to maximize the **total expected value of successfully defended assets**:

$$
\max \sum_{j=1}^{W} V_j \left(1 - \prod_{i=1}^{I} (1 - p_{ij})^{x_{ij}}\right)
$$

subject to each interceptor being assigned to at most one warhead:

$$
\sum_{j=1}^{W} x_{ij} \leq 1, \quad \forall \, i = 1, \ldots, I
$$

(Using $\leq 1$ rather than $= 1$ allows holding interceptors in reserve, which is preferable in multi-wave scenarios or when using a shoot-look-shoot doctrine.)

Put simply: for each warhead, the product $\prod_{i=1}^{I}(1 -
p_{ij})^{x_{ij}}$ gives the probability that *every* interceptor assigned to it
misses. Taking that product and subtracting it from $1$ gives the probability
that at least one interceptor hits (i.e., the warhead is successfully
intercepted). Multiply by $V_j$ to get the expected value saved by defending
that target. Sum over all targets, and you want to maximize this total.

This is the *static* WTA -- a single-stage commitment of all assignments before
any engagement results are observed. The *dynamic* WTA, where assignments are
revised as intercept results and new threats arrive, is operationally more
realistic and computationally harder.

Note that a more complete model would multiply each term by $P(\text{track})_j$
-- the common-mode detection-tracking-classification factor developed in the
previous section -- but the standard WTA formulation assumes perfect tracking.

In 1986, Lloyd and Witsenhausen proved that the decision version of the WTA
problem is NP-complete [1]: given a threshold $T$, determining whether there
exists a feasible assignment with total expected value saved $\geq T$ is
NP-complete. (The corresponding optimization problem is NP-hard.)

Why is this hard? In a linear assignment problem (e.g., assign workers to
tasks to minimize total cost), the value of each assignment is independent of
every other -- the cost of assigning worker $i$ to task $j$ doesn't change
based on other assignments. Despite having $n!$ feasible solutions, this
structure allows polynomial-time algorithms like the Hungarian method. WTA
breaks this property. The product terms in the objective mean that the marginal
value of assigning an additional interceptor to a target *depends on how many
are already assigned there* -- there are diminishing returns. This couples all
assignments together: you cannot evaluate one assignment without knowing the
rest. This nonlinearity destroys the decomposition properties that make the
linear assignment problem tractable.

And $W$ is likely larger than the number of real warheads. A single warhead can
deploy many decoys that are difficult to distinguish from real reentry vehicles
in the midcourse phase. Wilkening formalizes this with classification
probabilities [5]: let $P_{ww}$ be the probability a warhead is correctly
classified as a warhead, and $P_{dw}$ be the probability a decoy is
*mis*classified as a warhead. The effective number of targets the defense must
engage becomes:

$$
W^* = W \cdot P_{ww} + D \cdot P_{dw}
$$

where $D$ is the number of decoys. If discrimination is poor ($P_{dw}$ close to
$1.0$), every decoy looks like a warhead. Each undiscriminated decoy is another
column in the SSPK matrix, another target in the WTA objective function -- it
inflates $W$ and directly increases the complexity of the allocation problem.

What NP-completeness tells you is how the problem *scales*, and the scaling is
asymmetric in a way that structurally favors the offense. The attacker can
always add a warhead or decoy at marginal cost. Moreover, even with an oracle
that solves WTA instantly and to global optimality, the inputs to the oracle
are bound to be imperfect. Hence, the "optimal" solution is likely to be
sub-optimal in terms of the defense.

That said, NP-completeness does not mean practically unsolvable. Modern exact
algorithms can solve WTA instances far beyond operationally relevant scales.
Bertsimas and Paskov (2025) developed a branch-price-and-cut algorithm that
exploits the problem's structure through decomposition, solving instances with
10,000 weapons and 10,000 targets to provable optimality in under 7 minutes on
a laptop [10]. Instances with 1,000 targets and 1,500 weapons solve in
seconds. For comparison, the prior state-of-the-art timed out at 2 hours for
problems with more than 400 weapons. This is a common phenomenon in
combinatorial optimization: many NP-hard problems are routinely solved to
optimality at practical scales using modern solvers and decomposition
techniques.

## Discussion

To recap, let's plug in the real numbers once more. If you need 4 interceptors
per warhead for a 96% chance of interception, then 44 GBIs provide reliable
defense against at most $\frac{44}{4} = 11$ ICBMs. That is the entire U.S.
ground-based midcourse defense against the ICBM threat. GMD was sized to
counter a limited rogue-state threat -- not a peer arsenal -- but even against
that design scenario, the margins are thin. Wilkening's model makes
this starker: defending against 20 warheads in barrage mode requires **113
interceptors** (at $P(\text{track}) = 0.99$, $sspk = 0.70$) -- far exceeding
the current inventory. Even shoot-look-shoot, the most efficient firing
doctrine, requires 47 [5]. An attacker needs only $\lfloor I/4 \rfloor + 1$
warheads to ensure at least one faces fewer than 4 interceptors. With the
current inventory, that threshold is 12. Add decoys, and things degenerate
fast. For example, a barrage of 10 warheads accompanied by just 10 decoys
already demands **73 interceptors**, with the $P(\text{track})$ and $sspk$
values from above [5].

Directed energy has been proposed as a more cost-effective and reliable
alternative. Laser interceptors dramatically reduce the per-shot cost, which
does address the cost asymmetry. Nevertheless, directed energy introduces its
own constraints. Coverage requires enough platforms in the right places;
atmospheric absorption and scattering degrade beam effectiveness from
ground-based systems, which is why the recently proposed "Golden Dome" project
emphasizes satellite constellations [4]. In addition,
each laser must dwell on a target long enough to ensure a successful
interception. Against a salvo, dwell time turns missile defense into a
scheduling problem: which targets to engage, in what order, for how long, given
that every second spent on one target is a second unavailable for another. This
is a different optimization problem, but it has the same flavor, and its own
set of issues with respect to scaling.

In practice, real missile defense architectures are layered: boost-phase,
midcourse, and terminal-phase interceptors each get an engagement opportunity,
and the kill probabilities compound across layers. Layering improves overall
effectiveness, but it also multiplies the complexity of the allocation problem
-- each layer solves its own WTA, and the layers interact because a miss in one
creates demand in the next.

Finally, the analysis above treats missile defense as a one-sided optimization,
but it is fundamentally a game. Just as the defender solves WTA to maximize
expected survival, the attacker solves its own allocation problem --
distributing warheads and decoys across targets to *minimize* the defender's
expected survival. The attacker has structural advantages: they choose the
problem size (how many warheads and decoys to deploy), they can observe the
defense architecture before committing, and they move first. The defender must
prepare for a range of possible attacks; the attacker need only optimize
against the defense that exists.

## References

1. S. P. Lloyd and H. S. Witsenhausen, "Weapons Allocation is NP-Complete," *Proceedings of the 1986 Summer Computer Simulation Conference*, 1986.
2. R. K. Ahuja, A. Kumar, K. C. Jha, and J. B. Orlin, "Exact and Heuristic Algorithms for the Weapon-Target Assignment Problem," *Operations Research*, vol. 55, no. 6, pp. 1136–1146, 2007.
3. "Ground-based Midcourse Defense (GMD)," *CSIS Missile Defense Project*. https://missilethreat.csis.org/system/gmd/
4. "Golden Dome," *CSIS Missile Defense Project*. https://missilethreat.csis.org/system/golden-dome/
5. D. A. Wilkening, "A Simple Model for Calculating Ballistic Missile Defense Effectiveness," Center for International Security and Cooperation, Stanford University, August 1998.
6. T. Harrison, "Build Your Own Golden Dome: A Framework for Understanding Costs, Choices, and Tradeoffs," American Enterprise Institute, 2025.
7. "Iranian Attacks on Critical Missile Defense Radars Are a Wake-Up Call," *The War Zone*, 2026. https://www.twz.com/news-features/iranian-attacks-on-critical-missile-defense-radars-are-a-wake-up-call
8. "Iran Hits Key US Radar, Deepening Gulf Missile Defense Woes," *Bloomberg*, 2026. https://www.bloomberg.com/news/articles/2026-03-06/iran-hits-key-us-radar-deepening-gulf-missile-defense-woes
9. "Iran Strikes U.S. Military Communication Infrastructure in Mideast," *The New York Times*, 2026. https://www.nytimes.com/2026/03/03/world/middleeast/iran-strikes-us-military-communication-infrastructure-in-mideast.html
10. D. Bertsimas and A. Paskov, "Solving Large-Scale Weapon Target Assignment Problems in Seconds Using Branch-Price-And-Cut," *Naval Research Logistics*, vol. 72, pp. 735–749, 2025.
11. "Israeli civilian films double-team interception," *r/CombatFootage*, 2025. https://www.reddit.com/r/CombatFootage/comments/1rrqklj/israeli_civilian_films_doubleteam_interception_of/
