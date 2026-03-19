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

Imagine you're responsible for defending a region from incoming warheads.
Your systems inform you of 3 incoming missiles, and you have 7 interceptors
available to you. How do you allocate your interceptors such that you maximize
expected survival?

Recent events have brought the topic of missile defense back to the front
pages. The underlying computational challenge has been known since at least
1986. [This section needs to be completed]

## SSPK: How Good Is a Single Interceptor?

Single Shot Probability of Kill (SSPK) is the probability that an individual
interceptor successfully intercepts one warhead in a single engagement. SSPK
captures everything: sensor accuracy, guidance precision, interceptor quality,
etc.

Now let's consider a real-world missile defense system. The U.S. Ground-Based
Midcourse Defense (GMD) system uses Ground-Based Interceptors (GBIs) designed
to intercept ICBMs by direct collision at speeds exceeding 10 km/s.
Estimates place the GBI's SSPK at roughly 56%. Each GBI costs approximately $75
million, and as of recent public reporting, only 44 are deployed.

A 56% chance of success is better than a coin flip, but not by much. 

## Improving the Odds: Assign Multiple Interceptors per Warhead

If we assume that interceptor failures are **independent** — one interceptor
missing doesn't affect whether another hits — we can compute the probability of
at least one hit.

The probability that a single interceptor misses is:
$$
P(\text{miss}) = 1 - sspk
$$

If we fire $n$ interceptors independently, the probability that *all* of them miss is:
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
|:---:|:---:|
| 1 | 56.00% |
| 2 | 80.64% |
| 3 | 91.48% |
| 4 | 96.25% |
| 5 | 98.35% |

Note that the independence assumption we made above is optimistic, and may not
reflect reality. If interceptor failures are correlated (e.g., all interceptors
rely on the same radar that misidentifies a decoy as the real warhead), the
actual kill probability will be lower than this formula predicts.

Hence, for one warhead, a defender can launch 4 interceptors and have a 96%
chance of successfully intercepting the incoming warhead. But what if the
adversary fires more than one?

The following clip shows two interceptors engaging a single warhead — a real-world instance of the $n = 2$ row from the table above.

![Two interceptors engaging a single warhead](/images/two_interceptors_one_warhead.gif)

## Multiple Targets

Let's go back to our original example. That is, we have Suppose you have $W =
7$ interceptors and $T = 7$ incoming warheads. Warhead A is headed for a city
(high value), and warhead B is headed for an empty field (low value). How do
you split your interceptors?

If you assign 4 to A and 2 to B, you get a 96.25% chance of killing A and an
80.64% chance of killing B. If you assign 3 to each, both get 91.48%. The
"right" answer depends on the relative values of the targets and the SSPK of
each interceptor against each target.

Now scale this up. With 44 interceptors and 15 incoming warheads — each
potentially aimed at a different city, each with different estimated values,
and each interceptor having a different SSPK against each target depending on
geometry and timing — the number of possible assignments explodes
combinatorially. The optimal assignment is no longer obvious. It isn't even
tractable to find by exhaustive search.

## The Weapon-Target Assignment Problem

The **Weapon-Target Assignment (WTA)** problem formalizes this. Given:

- $W$ weapons (interceptors), indexed $i = 1, \ldots, W$
- $T$ targets (incoming warheads), indexed $j = 1, \ldots, T$
- A **value** $V_j > 0$ for each target (the damage it would cause if it survives)
- An **SSPK matrix** $p_{ij} \in [0, 1]$: the probability that weapon $i$ destroys target $j$
- Decision variables $x_{ij} \in \{0, 1\}$: whether weapon $i$ is assigned to target $j$

The objective is to minimize the **total expected surviving value**:

$$
\min \sum_{j=1}^{T} V_j \prod_{i=1}^{W} (1 - p_{ij})^{x_{ij}}
$$

subject to each weapon being assigned to exactly one target:

$$
\sum_{j=1}^{T} x_{ij} = 1, \quad \forall \, i = 1, \ldots, W
$$

(This formulation requires every weapon to be assigned; variants use $\leq 1$ to allow holding weapons in reserve.)

In words: for each target, the product term gives the probability that *every* interceptor assigned to it misses. Multiply by the target's value to get the expected damage from that target surviving. Sum over all targets, and you want to minimize this total.

The product in the objective makes this a **nonlinear integer program** — and that nonlinearity is part of what makes it hard.

## Why This Is NP-Complete

Lloyd and Witsenhausen proved in 1986 that the Weapon-Target Assignment problem
is NP-complete. Their paper, *"Weapons Allocation is NP-Complete,"* showed that
the decision version of WTA (is there an assignment with expected surviving
value at most $k$?) is NP-complete by reduction from 3-dimensional matching.

What does NP-complete mean in practical terms? It means:

The combinatorial intuition is straightforward. Each of $W$ weapons must be
assigned to one of $T$ targets, giving $T^W$ possible assignments. For a modest
scenario of 20 weapons and 20 targets, that's $20^{20} \approx 10^{26}$
possible assignments. Even at a billion evaluations per second, exhaustive
search would take over three billion years.

Missile defense decisions must be made in **minutes or seconds**.

## What This Means for the Real World

The NP-completeness of WTA has direct consequences for defense policy and strategy.

**Stockpile math.** If you need 4 interceptors per warhead for a 96% kill
probability, then 44 GBIs provide reliable defense against at most $
frac{44}{4} = 11$ ICBMs. That's a thin margin against any nuclear-armed
adversary.

**Saturation attacks.** An attacker who knows the defender has $W$ interceptors
and fires 4 per target needs only $\lfloor W/4 \rfloor + 1$ warheads to
guarantee that at least one gets through with high probability. The defender's
computational problem also gets harder: more targets means more possible
assignments.

**Decoys and countermeasures.** A single warhead can deploy dozens of decoys
that are difficult to distinguish from real warheads in the midcourse phase of
flight. This inflates the effective $T$ dramatically. The defender must either
treat every object as real — spreading interceptors thin — or solve a
discrimination problem that is itself extremely difficult.

**Cost asymmetry.** At \$75M per interceptor, the defense is far more expensive
than the offense. Adding 10 more interceptors costs \$750M. Adding 10 more
warheads (or decoys) costs a fraction of that. This asymmetry, compounded by
the computational intractability of optimal assignment, structurally favors the
offense.

## Conclusion

Defending against a single warhead is simple. Fire enough interceptors and the
kill probability approaches certainty. But the assignment problem across many
targets — deciding *which* interceptors to fire at *which* targets — is
fundamentally intractable. This isn't a limitation of current technology or
algorithms; it's a mathematical fact about the structure of the problem.

This shapes everything from procurement decisions to doctrine. Missile defense
is a hard problem. 

## References

1. S. P. Lloyd and H. S. Witsenhausen, "Weapons Allocation is NP-Complete," *Proceedings of the 1986 Summer Computer Simulation Conference*, 1986.
2. R. K. Ahuja, A. Kumar, K. C. Jha, and J. B. Orlin, "Exact and Heuristic Algorithms for the Weapon-Target Assignment Problem," *Operations Research*, vol. 55, no. 6, pp. 1136–1146, 2007.
3. "Weapon target assignment problem," *Wikipedia*. https://en.wikipedia.org/wiki/Weapon_target_assignment_problem
4. "Ground-based Midcourse Defense (GMD)," *CSIS Missile Defense Project*. https://missilethreat.csis.org/system/gmd/
