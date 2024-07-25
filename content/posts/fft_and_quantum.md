+++
title = "From FFTs to Quantum Simulations: The Butterfly Connection"
date = 2024-07-24T20:02:58-04:00
draft = true
math = "katex"
disableShare = false
+++

### Introduction

At first glance, Fast Fourier Transforms (FFT) and quantum state simulations might seem unrelated; however, they share a fascinating connection that has a beautiful visualization.

FFTs are widely used in digital signal processing to convert signals from the time domain to the frequency domain. Similarly, quantum state simulations, especially those involving the Quantum Fourier Transform (QFT), use similar mathematical principles to manipulate quantum states.

For software engineers familiar with implementing FFT, understanding this connection can provide new perspectives and offer a different angle to approach and comprehend quantum computing concepts. If you know how to implement the basic FFT, you already have a significant foundation for understanding quantum computing, particularly for simulating single qubit gates on a classical machine.

### FFT and the Butterfly Operation

The FFT algorithm is an efficient way to compute the Discrete Fourier Transform (DFT). The DFT converts a sequence of complex numbers in the time domain into another sequence of complex numbers in the frequency domain. The Cooley-Tukey FFT algorithm, the most commonly used FFT, reduces the computational complexity from $O(N^2)$ to $O(N \log N)$ by recursively breaking down the DFT into smaller DFTs.

A key component of the FFT is the butterfly operation. This operation combines pairs of elements in a manner that resembles the shape of a butterfly when drawn out in a flow graph.

#### Detailed Breakdown of the Butterfly Operation

The butterfly operation[^1] involves the following steps :

1. **Splitting**: Divide the data into smaller chunks.
2. **Twiddle Factors**: Multiply the data by complex exponential values known as twiddle factors.
3. **Combining**: Add and subtract the resulting values to form new pairs.

Here's a simple example using two complex numbers \(X\) and \(Y\):

1. Compute the sum: \(X + Y\)
2. Compute the difference multiplied by a twiddle factor \(W\): \((X - Y) \cdot W\)

These operations are performed recursively across the entire dataset.

#### FFT Butterfly Diagram

Here's how a simple FFT butterfly diagram looks:

![fft](../../fft_butterfly.pdf)

### Quantum State Simulations

Quantum computing operates on qubits, which are quantum analogs of classical bits. Unlike classical bits, qubits can exist in a superposition of states, represented by complex probability amplitudes. Quantum gates manipulate these states using unitary matrices.

#### Applying a Quantum Gate

Consider a simple quantum gate represented by a $2 \times2$ matrix:

\[ A = \begin{bmatrix}
u_{00} & u_{01} \\
u_{10} & u_{11}
\end{bmatrix} \]

When this gate is applied to a pair of qubits, the operation can be visualized as:

1. **Load**: Grab a pair of datapoints and insert them into a vector:
    $$v = \begin{bmatrix} z_{0} \\ z_{1} \end{bmatrix}$$
2. **Applying the Gate**: Multiply the pair by the unitary matrix.

\[ Av = 
\begin{bmatrix}
a_{00} & a_{01} \\
a_{10} & a_{11}
\end{bmatrix} 
\begin{bmatrix} z_{0} \\ z_{1} \end{bmatrix}
= \begin{bmatrix} z'_{0} \\ z'_{1} \end{bmatrix}
\]

3. **Store**: Update the values at index $0$ and $1$:

```python
state[0] = c_0
state[1] = c_1
```


This operation is strikingly similar to the FFT butterfly operation.

### Drawing the Connection

To illustrate how FFT butterfly operations and quantum state simulations are similar, let's compare their core operations.

#### FFT Butterfly Operation

1. **Input**: Complex numbers \(a_0, a_1, a_2, a_3\)
2. **Operation**:
   - Compute \(b_0 = a_0 + a_2\)
   - Compute \(b_1 = (a_1 + a_3) \cdot W\)
   - Compute \(b_2 = a_0 - a_2\)
   - Compute \(b_3 = (a_1 - a_3) \cdot W\)
3. **Output**: Transformed complex numbers \(b_0, b_1, b_2, b_3\)

#### Quantum Gate Operation

1. **Input**: Qubit states \(\psi_0, \psi_1\)
2. **Operation**:
   - Apply unitary matrix \(U\)
   - Compute new states:
     - \(\psi_0' = u_{00} \psi_0 + u_{01} \psi_1\)
     - \(\psi_1' = u_{10} \psi_0 + u_{11} \psi_1\)
3. **Output**: Transformed qubit states \(\psi_0', \psi_1'\)

### Computational Complexity

The IQFT (Forward FFT) is $O(n^2)$, where $n$ is the number of gates.

On the other hand, the FFT is $O(N \log N)$. Note that
$N = 2^n$. Thus, the 

### Practical Implications for Software Engineers

For software engineers familiar with FFT implementations, recognizing the similarity to quantum gate simulations can be enlightening. Here are some practical implications:

1. **Leveraging Existing Knowledge**:
   - If you know how to implement the basic FFT, you already have a significant foundation for understanding quantum computing, particularly for simulating single qubit gates on a classical machine. Understanding the butterfly operation in FFT provides a solid foundation for grasping the principles of quantum state manipulation. The recursive structure and parallelism in FFT can be directly applied to quantum algorithms.

2. **Optimization Techniques**:
   - Techniques used to optimize FFT implementations, such as efficient memory access patterns and SIMD (Single Instruction, Multiple Data) instructions, can also be beneficial when simulating quantum gates. This can lead to more efficient quantum simulators on classical hardware.

3. **Cross-Disciplinary Innovation**:
   - By drawing parallels between FFT and quantum simulations, engineers can explore new algorithms and optimization strategies that benefit both fields. This cross-disciplinary approach can lead to breakthroughs in digital signal processing and quantum computing.

### Conclusion

The FFT butterfly operation and quantum state simulations share a deep connection through their use of complex arithmetic, recursive structures, and parallelism. Both leverage the fundamental principles of linear algebra to transform data efficiently.

By understanding these similarities, software engineers can draw valuable insights and potentially innovate new techniques in both digital signal processing and quantum simulations. This cross-disciplinary perspective enriches our approach to problem-solving and highlights the underlying unity in seemingly disparate fields.

### References

- Cooley, J. W., & Tukey, J. W. (1965). An algorithm for the machine calculation of complex Fourier series. Mathematics of Computation, 19(90), 297-301.
- Nielsen, M. A., & Chuang, I. L. (2010). Quantum Computation and Quantum Information: 10th Anniversary Edition. Cambridge University Press.

[^1]: For the sake of simplicity, we only consider the Decimation-in-Time (DIT) FFT here. When it comes to the Decimation-in-Frequency FFT, The first stage of the FFT is equivalent
to applying a single qubit gate to qubit $n-1$. Similarly, the 1st stage is equivalent to applying a gate to qubit $n-2$, and so on.