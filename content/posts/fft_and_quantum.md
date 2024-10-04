+++
title = "From FFTs to Quantum Simulations: The Butterfly Connection"
date = 2024-07-24T20:02:58-04:00
draft = false
math = "katex"
disableShare = false
+++

### Introduction

For a while I have been working on a quantum state simulator,
[Spinoza](https://github.com/QuState/spinoza). During the implementation and
performance tuning of the simulator, I encountered a memory access pattern that
comes up often in the context of DSP. Namely, the [butterfly, data-flow,
diagram](https://en.wikipedia.org/wiki/Butterfly_diagram). Working on Spinoza
brought me to the realization that by understanding a rudimentary
implementation of a quantum state simulator (i.e., how we access memory to
apply gates to respective qubits), we are also able to understand and implement
the Fast Fourier Transform (FFT).

Just for context, I did not happen to cover the
[FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform) when I was in
college. Some professors choose to cover that portion of CLRS in their
algorithms classes, and some don't. I was always intimidated and worried about
the amount of time it would take to even learn it.

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

But let's just stick to the code perspective more. So, here's our
amplitude/complex number in code.

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

![hadamard quantum butterfly](/images/hadamard_quantum_butterfly.png)

Note how we replace the $2 \times 2$ matrix (i.e., the single-qubit gate) with the actual underlying
matrix of the [hadamard gate](https://www.quantum-inspire.com/kbase/hadamard/). Now, all corresponding
pairs of complex numbers must be multiplied by the hadamard gate. Since our defined circuit
applies hadamard to all $3$ qubits, we follow the exact data flow as shown in the above diagram.

Finally, let's look at a slightly larger example where $n = 4$ (i.e., a system of 4 qubits), so we
have a state composed of $2^{4} = 16$ amplitudes.

![butterfly_diagram_chunks](/images/butterfly_chunks.png)

1. The 0th row can be thought of as an array composed of $8$ chunks.
2. The 1st row can be thought of as an array composed of $4$ chunks.
3. The 2nd row can be thought of as an array composed of $2$ chunks.
3. The 3rd row can be thought of as an array composed of $1$ chunk.

A pattern starts to emerge. Let's unpack that a bit.

The first row corresponds to the memory access patterns required
to apply a single-qubit gate to target qubit $0$.
Note how each chunk is composed of $2$ amplitudes, and each of those amplitudes
corresponds to being on the left/right side of the chunk, or 0 side and 1 side.

The second row corresponds to the memory access patterns required
to apply a single-qubit gate to target qubit $1$.
Note how each chunk is composed of $4$ amplitudes, and the chunk can be bisected
at the midpoint to give us two 0-side amplitudes and two 1-side amplitudes.
corresponds to being on the left/right side of the chunk, or 0 side and 1 side.

The third row corresponds to the memory access patterns required
to apply a single-qubit gate to target qubit $2$.
Note how each chunk is composed of $8$ amplitudes, and the chunk can be bisected
at the midpoint to give us four 0-side amplitudes and four 1-side amplitudes.
corresponds to being on the left/right side of the chunk, or 0 side and 1 side.

The fourth row corresponds to the memory access patterns required
to apply a single-qubit gate to target qubit $3$.
Note how each chunk is composed of $16$ amplitudes, and the chunk can be bisected
at the midpoint to give us eight 0-side amplitudes and eight 1-side amplitudes.
corresponds to being on the left/right side of the chunk, or 0 side and 1 side.

So given a state composed of $n$ qubits, we have $2^{n} = N$ complex nums.
For a given qubit (i.e., 0, 1, 2, 3), we have a *stride* of $2^{t}$, and the
size of each chunk at a given stride is $2 \cdot 2^{t} = 2^{t+1}$.

```rust
pub fn apply_gate(state: &mut QuantumState, gate: [[f64; 2]; 2], target_qubit: usize) {
    let stride = 1 << target_qubit; // 2^{t}
    let chunk_size = 2 * distance; // 2^{t+1}

    let a = Complex64::new(gate[0][0], 0.0);
    let b = Complex64::new(gate[1][0], 0.0);
    let c = Complex64::new(gate[0][1], 0.0);
    let d = Complex64::new(gate[1][1], 0.0);

    for chunk in state.amplitudes.chunks_exact_mut(chunk_size) {
        let (side0, side1) = chunk.split_at_mut(distance);

        for (x, y) in side0.iter_mut().zip(side1.iter_mut()) {
            let u = *x * a + *y * b;
            let w = *x * c + *y * d;
            *x = u;
            *y = w;
        }
    }
}
```

This is exactly the code one needs to apply *any* single qubit gate to a
quantum state vector. Note how simple it is, especially when utilizing Rust's
[`std::slice`](https://doc.rust-lang.org/std/slice/index.html) utilities.

Now that we discussed how to utilize the butterfly diagram in order to
implement a rudimentary quantum state simulator, let's turn to the
Fast Fourier Transform (FFT).

### Deriving the FFT from the Quantum State Simulator

This post is not meant to discuss the theoretical aspects or the background of
the FFT. There are a few amazing videos you can watch that cover the FFT. I'd
highly reccomend the videos by
[Vertiasium](https://www.youtube.com/watch?v=nmgFG7PUHfo), as well as
[Reducible](https://youtu.be/h7apO7q16V0?si=xfwCJTorF2U7KJ2J).
Rather, we want to look at the underlying mechanics of the FFT implementation.

So let's look at the famous butterfly diagram that always comes up in the context
of the FFT.

![FFT-Butterfly-Diagram](/images/DIT-Radix-2-FFT.png)
Image source: *Optimized hardware implementation of FFT processor* by Al Sallab et al.

Does this look familiar? It's pretty much the same exact diagram as we
illustrated above, except we see these factors in the digram, $W^{k}_{N}$.
These are known as [*twiddle
factors*](https://en.wikipedia.org/wiki/Twiddle_factor).

> A twiddle factor, in fast Fourier transform (FFT) algorithms, is any of the
> trigonometric constant coefficients that are multiplied by the data in the
> course of the algorithm. This term was apparently coined by Gentleman & Sande
> in 1966, and has since become widespread in thousands of papers of the FFT
> literature.

Note how instead of qubits, each vertical column in this diagram is known as a
*stage*. Given a sequence of data of length $2^{n} = N$, there will always be
$\log_{2}{N} = n$ stages in the FFT.

Since we are only considering mechanics and implementation details, just
note that rather than using a $2 \times 2$ matrix that's applied to all
pairs, we need to make sure each pair is multiplied by its respective
twiddle factor.

Now this section is about to become quite short. Why? Because we already did
pretty much 90% of the work to be able to implement the FFT when we implemented
our function that applies a single-qubit gate to a quantum state.

```rust
pub fn fft_dit(state: &mut QuantumState) {
    let n = state.len().ilog2();
    for stage in 0..n {
        let stride = 1 << stage; // 2^{t}
        let chunk_size = 2 * distance; // 2^{t+1}

        for chunk in state.amplitudes.chunks_exact_mut(chunk_size) {
            let (side0, side1) = chunk.split_at_mut(distance);

            for (a, b) in side0.iter_mut().zip(side1.iter_mut()) {
                let a_1 = *a + *b * w;
                let b_1 = *a - *b * w;
                *a = a_1;
                *b = b_1;
            }
        }
  }
}
```

The computations in the inner-most loop are even simpler than what we encountered
in the quantum state simulation computations. The only question you may have at
this point is how we can derive that twiddle factor, `w` to finish this implementation
of the Decimation-in-Time Radix-2 Cooley-Tukey FFT algorithm.
