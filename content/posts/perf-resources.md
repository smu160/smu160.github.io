+++
title = 'Perf Resources'
date = 2024-09-14T15:32:55-04:00
draft = false
description = "A comprehensive list of resources for optimizing code with a bit of focus on Rust."
tags = ["rust", "performance", "optimization", "resources", "guide", "performance-analysis", "tuning", "SIMD", "HFT", "HPC"]
+++

## General

### Rust Specific

* [The Rust Performance Book](https://nnethercote.github.io/perf-book)

(great starting point for beginners and those new to Rust)

* [How to avoid bounds checks in Rust (without unsafe!)](https://shnatsel.medium.com/how-to-avoid-bounds-checks-in-rust-without-unsafe-f65e618b4c1e)

### Performance Cheat Sheets

* [Latency Numbers Every Programmer Should Know](https://gist.github.com/jboner/2841832)
* [Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)

### Open Source Books

* [Algorithms for Modern Hardware](https://en.algorithmica.org/hpc/)
* [Performance Analysis and Tuning on Modern CPUs](https://faculty.cs.niu.edu/~winans/notes/patmc.pdf)

### Memory

[Array of Structs vs. Struct of Arrays](https://github.com/tim-harding/soa-rs?tab=readme-ov-file#what-is-soa)

[Data alignment for speed: myth or reality?](https://lemire.me/blog/2012/05/31/data-alignment-for-speed-myth-or-reality/)

### Floats

1. [Taming Float Sums](https://orlp.net/blog/taming-float-sums/)

## Tools and Libraries

### Profiling

* [Samply](https://github.com/mstange/samply)

### Benchmarking

1. [Criterion.rs](https://bheisler.github.io/criterion.rs/book/)
2. [Divan](https://github.com/nvzqz/divan)

### Multithreading

* [Rayon](https://docs.rs/rayon)
* [crossbeam](https://crates.io/crates/crossbeam)

### SIMD

#### Crates

* [Portable SIMD API](https://rust-lang.github.io/portable-simd/core_simd/simd/index.html)
* [soa-rs](https://github.com/tim-harding/soa-rs)
* [SIMD-itertools](https://github.com/LaihoE/SIMD-itertools)

#### Vectorized Solutions

* [Parallel Prefix Sum with Simd](https://www.adms-conf.org/2020-camera-ready/ADMS20_05.pdf)

## Domain Specific Resources

### HFT

* [When a Microsecond Is an Eternity: High Performance Trading Systems in C++”](https://www.youtube.com/watch?v=NH1Tta7purM)

### FFT

* [Construction of a High-Performance FFT](https://edp.org/work/Construction.pdf)
* [Mixed Data Layout Kernels for Vectorized Complex Arithmetic](https://spiral.ece.cmu.edu/pub-spiral/pubfile/hpec_2017_tp_288.pdf)
* [Notes on FFTs: for implementers](https://fgiesen.wordpress.com/2023/03/19/notes-on-ffts-for-implementers/)
