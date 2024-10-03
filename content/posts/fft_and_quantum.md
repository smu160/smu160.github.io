+++
title = "From FFTs to Quantum Simulations: The Butterfly Connection"
date = 2024-07-24T20:02:58-04:00
draft = false
math = "katex"
disableShare = false
+++

### Introduction

For a while I have been working on a quantum state simulator, Spinoza. During the implementation
and performance tuning of the simulator, I encountered a memory access pattern that comes up often
in the context of DSP. Namely, the [butterfly, data-flow, diagram](https://en.wikipedia.org/wiki/Butterfly_diagram).

Just for context, I did not happen to cover the [FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform)
when I was in college. Some professors choose to cover that portion of CLRS
in their algorithms classes, and some don't. I was always intimidated and worried about the
amount of time it would take to even learn it.

It turns out that a visually stunning diagram that is almost easily
reproducible (at least from my unremarkable memory) is all to understand the
underlying mechanics of applying gates to qubits and applying the FFT to some
sequence of data.

Of course, the butterfly diagram is quite often used in
[books](https://www.amazon.com/Fast-Fourier-Transform-Introduction-Application/dp/013307496X)
that cover the FFT; however, there are very few resources that tie that same
diagram to quantum computing (or at least simulating a quantum computer on a
classical machine).

You should note I'm no quantum computing or DSP expert. I'm sure there a lot of
things that are hand wavy in this post.

So, let's dive in and see how the butterfly comes up in the world of DSP and in
quantum computing.

### Simulating a Quantum Computer on a Classical machine

Every quantum state of $n$ qubits has to be represented by
$2^{n}$ amplitudes. What are amplitudes? Complex numbers. Yes,
that's it.

What's a complex number? $z = a + ib$ such that $a \in \mathbb{R}, b \in \mathbb{R}$ and $i = \sqrt{-1}$

But let's just stick to the code perspective more. So, here's our amplitude/complex number in code.

```rust
# [derive(Debug)]
struct Amplitude {
    real: f64,
    imaginary: f64,
}
```

It's basically a 2D point on a plane. For here on out, we'll use the
[`Complex64`](https://docs.rs/num-complex/0.4.6/num_complex/type.Complex64.html)
type from the `num_complex` crate for convenience (all the arithmetic
operations for complex nums are already implemented by this crate).

So let's consider a quantum state composed of $3$ qubits.
That means we need $2^{3} = 8$ amplitudes.

```
[z0, z1, z2, z3, z4, z5, z6, z7]
```

That's all it is. Just an array of 8 complex numbers. The
data structure is simple. The computations we apply to it are where things
get a bit hairier.

In the quantum world, operations are applied using gates.
Specifically, a single-qubit gate is a $2 \times 2$ matrix.

Sweet. But how do we apply a $2 \times 2$ matrix to a quantum state composed of
8 amplitudes? Well you could build up a gigantic $2^{n} \times 2^{n}$ matrix
(just imagine how big this matrix needs to be if you wanted to do something
with 10 qubits). Clearly a quantum computer has much more power (for certain problems)
than a classical machine. But it doesn't have to be this bad from the space complexity
perspective.

You may already know that a $2\times 2$ matrix is usually applied to a $2 \times 1$
vector. This is where the butterfly comes in.

We're considering the case of $n = 3$ qubits. So let's apply a gate to qubit $0$.

In the case of target qubit 0,
We need to take every contiguous pair in our state, put it into the $2 \times 1$ vector,
and apply the matrix to it. Specifically, the pairs are:

```
z0, z1
z2, z3
z4, z5,
z6, z7
```

Target qubit 1?

```
z0, z2
z1, z3
z4, z6,
z5, z7
```

Target qubit 2?

```
z0, z4
z1, z5
z2, z6,
z3, z7
```

So let's put it all together now:

![quantum_butterfly](/images/quantum_butterfly.png)

Note how the column labeled qubit 0 shows us retrieving the pair
`(z2, z3)`, writing it to the $2 \times 1$ vector. Then we apply
the gate (i.e., the matrix) to that vector. The output is another
$2 \times 1$ vector whose values need to be overwrite `z2` and `z3`
in the array.

Now let's see tie this back to quantum computing simulators. We'll use IBM's
[Qiskit SDK](https://docs.quantum.ibm.com/guides/circuit-library) to create
a super simple quantum circuit that applies the hadamard gate to qubits $0, 1, 2$.  

```python
from qiskit import QuantumCircuit
 
num_qubits = 3
qc = QuantumCircuit(num_qubits)

for qubit in range(num_qubits):
    qc.h(qubit)
```

Qiskit provides a convenient way to visualize the quantum circuit which we use to visualize
this below.
![qiskit_circuit_diagram](/images/qc_3q_hadamard.png)

Finally, let's tie this back to our butterfly diagram.

![hadamard quantum butterfly](/images/hadamard_quantum_butterfly.png)

As it turns out, the overwhelming majority of high performance quantum state simulators
all use this data flow pattern as well.
