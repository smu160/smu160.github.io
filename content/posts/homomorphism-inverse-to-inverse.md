+++
title = 'Homomorphism Inverse to Inverse'
date = 2021-01-13
draft = false
summary = "A beautiful proof and elegant proof covered in Abstract Algebra."
author = "Saveliy Yusufov"
math = "katex"
disableShare = true
+++

Group Homomorphism Maps Inverses to Inverses
============================================

We would like to show that given a homomorphism $f: G \\rightarrow H$, where $G$ and $H$ are groups, the identity maps to the identity. Namely, $f(e\_{G}) = e\_{H}$, where $e\_{G} \\in G$ and $e\_{H} \\in H$.

$$f(g e\_{G}) = f(g)f(e\_{G})$$

$$\\implies f(g) = f(g) f(e\_{G})$$

$$\\implies f(g)^{-1} f(g) = f(g)^{-1} f(g) f(e\_{G})$$

$$\\implies e\_{H} = f(e\_{G})$$

Let $f$ be a homomorphism from $G \\rightarrow H$, where $G$ and $H$ are groups. We want to show: $f(g^{-1}) = f^{-1}(g)$.

$$f(gg^{-1}) = f(g)f(g^{-1})$$

$$\\implies f(e\_{G}) = f(g)f(g^{-1})$$

$$f(g)^{-1} f(e\_{G}) = f(g)^{-1} f(g)f(g^{-1})$$

$$\\implies f(g)^{-1} f(e\_{G}) = f(g^{-1})$$

from the previous proof, we know $f(e\_{G}) = e\_{H}$. Namely, under $f$, the identity maps to the identity. Hence, we can say:

$$ f(g)^{-1} e\_{H}= f(g^{-1})$$

$$\\implies f(g)^{-1} = f(g^{-1})$$