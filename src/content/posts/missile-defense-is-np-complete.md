---
title: "Missile Defense is NP-Complete"
date: 2026-03-05
draft: false
math: "katex"
summary: "Why optimally assigning interceptors to incoming warheads is computationally intractable, and what that means for the real world."
description: "Exploring the Weapon-Target Assignment problem: how missile defense connects to NP-completeness, SSPK probability calculations, and why saturation attacks exploit computational limits."
author: "Saveliy Yusufov"
tags: ["optimization", "NP-complete", "combinatorics", "operations-research", "probability"]
categories: ["Algorithms", "Optimization"]
toc: true
---

Recent events have put missile defense back into the public spotlight. The
debate tends to center on interceptor stockpiles and budget. At times, I have
found myself a bit exasperated reading some of the commentary. So, this post is
about something more fundamental: the math of the allocation problem itself. 

Imagine you're responsible for defending a region from incoming nuclear
warheads. Your systems inform you of 3 incoming missiles, and you have 7
interceptors available to you. The question you would find yourself asking is
how do you allocate your interceptors such that you *maximize* expected survival?
Before we can even attempt to answer this, we need to get our bearings.

## SSPK: How Good Is a Single Interceptor?

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
not by much. 

## Improving the Odds: Assign Multiple Interceptors per Warhead

First and foremost, let's assume that interceptor failures are **independent**.
That is, one interceptor missing doesn't affect whether another is able to
achieve a successful hit. 

Note that the independence assumption is optimistic and may not reflect
reality. If interceptor failures are correlated (e.g., all interceptors rely on
the same tracking data and misidentify a decoy as the real warhead), the actual
kill probability will be lower than what this formula predicts.

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

Here's how the kill probability scales with additional interceptors:

| Interceptors ($n$) | $P(\text{kill})$ |
|:---:               |:---:|
| 1                  | 56.00% |
| 2                  | 80.64% |
| 3                  | 91.48% |
| 4                  | 96.25% |
| 5                  | 98.35% |

<figure>
  <img
  src="/images/two_interceptors_one_warhead.gif"
  alt="Two Interceptors, One Warhead">
  <figcaption>Two interceptors engaging a single warhead in a recent conflict</figcaption>
</figure>


Hence, for one warhead, a defender can launch $4$ interceptors and have a 96%
chance of successfully intercepting the incoming warhead. 

This is already starting to sound quite costly and inefficient, right? At a
cost of \$75M per interceptor, you'd need to expend **\$300M** in order to have,
at best, a 96% chance of interception.

But those numbers are optimistic. Here's why.

## $P(\text{track})$: What SSPK Doesn't Capture

The formula $P(\text{kill}) = 1 - (1 - sspk)^n$ assumes you've already
successfully detected the incoming warhead, tracked it with enough precision to
commit an interceptor, correctly classified it as a real warhead (i.e., not a
decoy), and that your command and control systems are functional. In reality,
all of these steps can fail. If any of those steps fail, it doesn't matter how
many interceptors you are willing to expend.

Wilkerson formalizes this with a probability $P(\text{track})$ that captures
the entire detection-tracking-classification-C2 pipeline [5]. The comprehensive
kill probability becomes:

$$
K_w = P(\text{track}) \times \left[1 - (1 - sspk)^n\right]
$$

This is a *common mode* factor: if the target is never detected or is
misclassified as debris, every interceptor assigned to it fails — their
failures are no longer independent. The independence assumption from
the previous section is conditional upon successful tracking.

Here's what the kill probability table looks like when $P(\text{track}) < 1$:

| Interceptors ($n$) | $P(\text{track}) = 1.0$ | $P(\text{track}) = 0.95$ | $P(\text{track}) = 0.90$ |
|:---:|:---:|:---:|:---:|
| 1 | 56.00% | 53.20% | 50.40% |
| 2 | 80.64% | 76.61% | 72.58% |
| 3 | 91.48% | 86.91% | 82.33% |
| 4 | 96.25% | 91.44% | 86.63% |
| 5 | 98.35% | 93.43% | 88.52% |

At $P(\text{track}) = 0.90$, the "96% kill probability" with 4 interceptors
drops to under 87%. Even 5 interceptors — \$375M — only reach 89%, still short
of what the idealized model achieves with just 3.

Wilkerson's analysis finds that for national missile defense to achieve 80%
confidence of destroying all warheads against even modest attacks (4–20 reentry
vehicles), $P(\text{track})$ must exceed **0.978**. Below that threshold, no
amount of SSPK improvement is sufficient. This is an extraordinarily high bar
-- the entire pipeline (i.e., detection, tracking, classification, etc.) must
work nearly perfectly, nearly every time.

The kill probabilities in the previous section are best-case numbers. The
effective kill probability in the real world is always lower, because
$P(\text{track})$ is always less than 1.

Now what if your adversary fires more than one?

## Multiple Targets

Now suppose you have $I = 7$ interceptors and $W = 3$ incoming warheads, as in
our opening scenario. The warheads have different targets: warhead A is headed
for a major city, warhead B for a military base, and warhead C for an empty
field. How should you allocate your interceptors?

| Allocation | $P(\text{kill A})$ | $P(\text{kill B})$ | $P(\text{kill C})$ |
|:---|:---:|:---:|:---:|
| 4 to $A$, 2 to $B$, 1 to $C$ | 96.25% | 80.64% | 56.00% |
| 3 to $A$, 3 to $B$, 1 to $C$ | 91.48% | 91.48% | 56.00% |
| 3 to $A$, 2 to $B$, 2 to $C$ | 91.48% | 80.64% | 80.64% |
| 2 to $A$, 2 to $B$, 3 to $C$ | 80.64% | 80.64% | 91.48% |

The "right" allocation depends on the relative values of the targets.
Protecting the city at 96% while leaving the empty field at 56% might be
optimal.

Now let's scale this up. Assume an inventory of $44$ interceptors and $15$
incoming warheads. Each warhead is aimed at a different city, each with
different estimated values, and each interceptor has a different SSPK against
each warhead -- depending on geometry and timing. Then, the number of possible
assignments explodes combinatorially. The optimal assignment is no longer
obvious. 

## The Weapon-Target Assignment Problem

The allocation problem above has a formal name: the Weapon-Target Assignment (WTA) problem. Here is the standard formulation.

Given:

$I$ weapons (interceptors), indexed $i = 1, \ldots, I$

$W$ targets (incoming warheads), indexed $j = 1, \ldots, W$

A **value** $V_j > 0$ for each warhead (the value of the asset that warhead $j$ threatens)

An **SSPK matrix** $p_{ij} \in [0, 1]$: the probability that interceptor $i$ destroys warhead $j$

Decision variables $x_{ij} \in \{0, 1\}$: whether interceptor $i$ is assigned to warhead $j$

The objective is to maximize the **total expected survival value**:

$$
\max \sum_{j=1}^{W} V_j \left(1 - \prod_{i=1}^{I} (1 - p_{ij})^{x_{ij}}\right)
$$

subject to each interceptor being assigned to exactly one warhead:

$$
\sum_{j=1}^{W} x_{ij} = 1, \quad \forall \, i = 1, \ldots, I
$$

(This formulation commits all interceptors. A variant using $\leq 1$ allows holding reserves, which may be preferable in multi-wave scenarios.)

Put simply: for each warhead, the product $\prod_{i=1}^{I}(1 -
p_{ij})^{x_{ij}}$ gives the probability that *every* interceptor assigned to it
misses. Taking that product and subtracting it from $1$ gives the probability
that at least one interceptor hits (i.e., the warhead is successfully
intercepted). Multiply by $V_j$ to get the expected value saved by defending
that target. Sum over all targets, and you want to maximize this total.

Note that a more complete model would multiply each term by $P(\text{track})_j$ — the common-mode detection-tracking-classification factor developed in the previous section — but the standard WTA formulation assumes perfect tracking.

In 1986, Lloyd and Witsenhausen proved that the decision version of WTA is
NP-complete by reduction from 3-dimensional matching [1]. Hence, in theory,
there is no known algorithm that finds the optimal assignment in time that
scales polynomially with the number of weapons and targets. In practice, real
systems use heuristic and approximate algorithms that find good-enough
solutions quickly [2].

## Real World Implications

### Stockpile arithmetic & attrition
If you need 4 interceptors per warhead for a 96% chance of intercepting an
incoming nuclear warhead, then 44 GBIs *may* provide reliable defense against
at most $\frac{44}{4} = 11$ ICBMs. That's a thin margin against any
nuclear-armed adversary. Wilkerson's model makes this even starker. That is,
defending against just 20 warheads in barrage mode requires **113
interceptors** (at $P(\text{track}) = 0.99$, $sspk = 0.70$) — far exceeding the
current inventory. Even shoot-look-shoot, the most efficient firing doctrine,
requires 47 [5].

### Saturation attacks
If the defender must allocate 4 interceptors per warhead for a 96% probability
of successful interception, an attacker needs only $\lfloor I/4 \rfloor + 1$
warheads to guarantee that at least one gets through with high probability. The
defender's computational problem also gets harder: more targets means more
possible assignments.

### Decoys and countermeasures
A single warhead can deploy many decoys that are difficult to distinguish from
the real warheads. Wilkerson formalizes this with classification
probabilities: let $P_{ww}$ be the probability a warhead is correctly
classified as a warhead, and $P_{dw}$ be the probability a decoy is
*mis*classified as a warhead (a Type II error) [5]. The apparent number of
warheads the defense must engage is:

$$
W^* = W \cdot P_{ww} + D \cdot P_{dw}
$$

where $W$ is the true warhead count and $D$ is the number of decoys. If
discrimination is poor (i.e., $P_{dw}$ is close to $1.0$), the defense must
engage nearly every object. With $P(\text{track}) = 0.99$, $sspk = 0.70$, and a
requirement of 80% confidence that all warheads are destroyed: 10 warheads
accompanied by just 10 decoys already demands **73 interceptors** in barrage
mode [5].

Each undiscriminated decoy is another warhead in the WTA formulation. Decoys
don't just spread interceptors thin -- they inflate $W$, and
increase the complexity of the allocation problem.

### Cost Asymmetry
At \$75M per interceptor, the defense is far more expensive than the offense.
Adding 10 more interceptors costs \$750M. Adding 10 more warheads and/or decoys
costs a fraction of that. This asymmetry, compounded by the computational
intractability of optimal assignment, structurally favors the offense.

## Discussion

At current scales, the missile defense allocation problem is solvable.
A WTA instance with 44 interceptors and 12 warheads has roughly
$44 \times 12 = 528$ binary decision variables — well within the range that
modern MIP solvers handle in seconds. This is true, and beside
the point. The computational difficulty of WTA isn't what makes missile defense
hard today. Rather, the stockpile arithmetic alone is damning enough. What
NP-completeness tells you is how the problem scales, and the scaling is
asymmetric in a way that permanently favors the offense.

The number of feasible assignments for a WTA instance is $W^I$: each of $I$
interceptors can be assigned to any of $W$ warheads. For the current GMD
inventory, that is $12^{44} \approx 10^{47}$ possible assignments. Scale to a
future architecture with 500 interceptors and 200 threat objects and the space
becomes $200^{500} \approx 10^{1150}$. Each additional warhead or
undiscriminated decoy the attacker adds multiplies the defender's solution
space by a factor of $\left(\frac{W+1}{W}\right)^I$. The offense scales
linearly; the defense scales combinatorially.

This asymmetry is structural. The U.S. is now considering a continental
missile defense shield [4] with cost estimates ranging from \$175 billion to
\$3.6 trillion [6].
The math reviewed here is unclassified. The formulations are public. The
constraints they impose don't require a security clearance to understand.

## References

1. S. P. Lloyd and H. S. Witsenhausen, "Weapons Allocation is NP-Complete," *Proceedings of the 1986 Summer Computer Simulation Conference*, 1986.
2. R. K. Ahuja, A. Kumar, K. C. Jha, and J. B. Orlin, "Exact and Heuristic Algorithms for the Weapon-Target Assignment Problem," *Operations Research*, vol. 55, no. 6, pp. 1136–1146, 2007.
3. "Ground-based Midcourse Defense (GMD)," *CSIS Missile Defense Project*. https://missilethreat.csis.org/system/gmd/
4. "Golden Dome," *CSIS Missile Defense Project*. https://missilethreat.csis.org/system/golden-dome/
5. D. A. Wilkerson, "A Simple Model for Calculating Ballistic Missile Defense Effectiveness," Center for International Security and Cooperation, Stanford University, August 1998.
6. T. Harrison, "Build Your Own Golden Dome: A Framework for Understanding Costs, Choices, and Tradeoffs," American Enterprise Institute, 2025.
