+++
title = "Getting Your Money's Worth: A Deep Dive into SIMD-Itertools vs. Itertools in Rust"
date = 2024-07-19
draft = true
summary = 'A detailed comparison between SIMD-Itertools and itertools in Rust, leveraging modern CPUs'
author = "Saveliy Yusufov"
math = "katex"
disableShare = true
+++

> *“I paid for these transistors and goshdarnit I will use them!”* 
> — [a user on the Arch Linux subreddit](https://www.reddit.com/r/archlinux/comments/18i2vb1/alhp_archlinux_recompiled_now_with_x8664v4_avx512/kdbljff/)

### Too Much Unused Parallelism on a Single Core

In a recent cppcast podcast, Mattias, aptly summarized the state of modern CPUs and SIMD: "there's too much unused parallelism on a single core". This idea encapsulates the drive behind an entire domain of performance optimization: vectorization. As the demands of software continue to rise, especially with the advent of machine learning and other compute-intensive applications, we need to leverage every bit of hardware capability available.

One area where this is particularly evident is in the realm of SIMD (Single Instruction, Multiple Data) processing. SIMD allows for parallelism within a single CPU core, enabling the simultaneous processing of multiple data points. However, as Matthias Kretz has pointed out, “there is too much unused parallelism on a single core,” highlighting that we still have a long way to go in fully utilizing our hardware’s potential.

### SIMD-Itertools: Harnessing Single Core Parallelism in Rust

In the Rust ecosystem, the new`SIMD-Itertools` library exemplifies the power of SIMD in action. By providing SIMD-optimized versions of common iterator operations, it significantly boosts performance on modern CPUs. Consider the `all_equal` function, which checks if all elements in a slice are the same. Here’s a simple benchmark comparing the performance of `SIMD-Itertools` to the standard `itertools` library:

```rust
use simd_itertools::AllEqualSimd;
use itertools::Itertools;
use std::time::Instant;

fn all_equal_f64_benchmark() {
    let sizes = vec![
        8 * 1024,            // 8 KiB
        32 * 1024,           // 32 KiB (L1 cache size)
        1 * 1024 * 1024,     // 1 MiB (L2 cache size)
        64 * 1024 * 1024,    // 64 MiB (L3 cache size)
        128 * 1024 * 1024,   // 128 MiB (exceeds L3 cache)
    ];

    for &size in &sizes {
        let mut v = vec![5.0; size / 8]; // Adjust for f64 (8 bytes per element)
        v[size / 8 - 1] = 32.456; // Change the last element

        // Benchmark all_equal_simd
        let start = Instant::now();
        let result_simd = v.iter().all_equal_simd();
        let duration_simd = start.elapsed();

        // Benchmark itertools all_equal
        let start = Instant::now();
        let result_itertools = v.iter().all_equal();
        let duration_itertools = start.elapsed();

        println!("Size: {} bytes", size);
        println!("  all_equal_simd: Result: {}, Time: {:?}", result_simd, duration_simd);
        println!("  itertools::all_equal: Result: {}, Time: {:?}", result_itertools, duration_itertools);
    }
}

fn main() {
    all_equal_f64_benchmark();
}
```

Performance Analysis

Results from running this benchmark demonstrate a significant performance gain with SIMD-Itertools:

For a slice of $1,000,000$ $\texttt{f64}$ elements, `all_equal_simd` achieves approximately $17.07$ $\text{Gelem/s}$, while the standard itertools version reaches only about $3.82$ $\text{Gelem/s}$.

This indicates that SIMD-Itertools is nearly 4.5 times faster, showcasing the efficiency of SIMD optimizations.

### Compiling for Performance

Both versions of the code were compiled for `x86-64-v4` using `RUSTFLAGS="-C target-cpu=x86-64-v4"`, yet the SIMD-itertools still outperforms what the compiler provides. This further underscores the necessity of manual optimization to fully exploit hardware capabilities. The practical takeaway here is clear: leveraging SIMD can lead to substantial performance improvements, but it often requires a deep understanding of both the hardware and the programming model.

### Detailed Performance Figures

When considering the throughput of 17.07 Gelem/s, it’s important to contextualize this within the hardware limits of the machine used. For instance, an AMD Ryzen 9 7950X with DDR5-6000 MHz memory can theoretically achieve memory bandwidths of up to 94.5 GB/s. Given that each f64 element is 8 bytes, the theoretical maximum throughput for this setup would be approximately:

$$ \text{Throughput} = \frac{94.5 \text{ GB/s}}{8 \text{ bytes/element}} = 11.8125 \text{ Gelem/s} $$

Achieving $17.07$ Gelem/s suggests that the SIMD optimizations are highly effective, allowing the code to operate close to the memory bandwidth limits, showcasing how well SIMD-Itertools leverages parallelism.

### Conclusion

As we move into an era where hardware improvements alone are no longer sufficient to drive software performance, it’s up to developers to embrace parallelism and optimization techniques. Tools like SIMD-Itertools provide a glimpse into what’s possible when we fully utilize the capabilities of modern 
CPUs.

### References

-	Hennessy, J. L., & Patterson, D. A. (2012). Computer Architecture: A Quantitative Approach (5th ed.). Morgan Kaufmann.
-	Matthias Kretz, “Too much unused parallelism on a single core.”