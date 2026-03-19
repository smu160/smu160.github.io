---
title: "Homomorphism Inverse to Inverse"
date: 2021-01-13
draft: false
summary: "An elegant proof from Abstract Algebra showing that group homomorphisms preserve inverses."
description: "A proof that group homomorphisms map identity to identity and inverses to inverses, fundamental results in abstract algebra."
author: "Saveliy Yusufov"
math: "katex"
tags: []
---

Group Homomorphism Maps Inverses to Inverses
============================================

We would like to show that given a homomorphism $f: G \rightarrow H$, where $G$ and $H$ are groups, the identity maps to the identity. Namely, $f(e_{G}) = e_{H}$, where $e_{G} \in G$ and $e_{H} \in H$.

$$
f(g e_{G}) = f(g)f(e_{G})
$$

$$
\implies f(g) = f(g) f(e_{G})
$$

$$
\implies f(g)^{-1} f(g) = f(g)^{-1} f(g) f(e_{G})
$$

$$
\implies e_{H} = f(e_{G})
$$

Let $f$ be a homomorphism from $G \rightarrow H$, where $G$ and $H$ are groups. We want to show: $f(g^{-1}) = f^{-1}(g)$.

$$
f(gg^{-1}) = f(g)f(g^{-1})
$$

$$
\implies f(e_{G}) = f(g)f(g^{-1})
$$

$$
f(g)^{-1} f(e_{G}) = f(g)^{-1} f(g)f(g^{-1})
$$

$$
\implies f(g)^{-1} f(e_{G}) = f(g^{-1})
$$

from the previous proof, we know $f(e_{G}) = e_{H}$. Namely, under $f$, the identity maps to the identity. Hence, we can say:

$$
f(g)^{-1} e_{H}= f(g^{-1})
$$

$$
\implies f(g)^{-1} = f(g^{-1})
$$
