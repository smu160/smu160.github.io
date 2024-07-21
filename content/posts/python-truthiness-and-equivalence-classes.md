+++
title = 'Python Truthiness and Equivalence Classes: A Mathematical Perspective'
date = 2023-11-30T09:33:02-05:00
draft = false
math = "katex"
disableShare = true
+++

#### Introduction

Recently, I ran into a bug in Rust while I was checking if bits were set in a `u64`.

```rust
fn is_bit_set(n: u64, k: usize) -> bool {
   n & (1 << k) == 1
}
```

Let's run it on some input and see what happens.
```rust
fn is_bit_set(n: u64, k: usize) -> bool {
   (n & (1 << k)) == 1
}

fn main() {
   let n = 51;

   for k in 0..6 {
      println!("{}", is_bit_set(n, k));
   }
}
```
```
true
false
false
false
false
false
```
This makes no sense. We know the binary representation of `51` is `110011`,
so we expect to see:
```
true
true
false
false
true
true
```
Let's print out the values of `n & (1 << k)`.
```rust
fn main() {
   let n = 51;

   for k in 0..6 {
      println!("{}", n & (1 << k));
   }
}
```
```
1
2
0
0
16
32
```
As soon as we look at the output, the pattern should start to stand out to us.
The issue is that taking an integer `n` and applying a bitwise `and` operation to it does not evaluate to
either a `0` or a `1`. The result will always be some value greater `0` if the `k`th bit is set,
and it will be `0` is the `k`th bit is *not* set. Okay, cool. How do we fix it?
```rust
fn is_bit_set(n: u64, k: usize) -> bool {
   (n & (1 << k)) != 0
}
```
That's it!

What if we still want to check if it's equal to one? Well, we can just shift
the integer to the right by `k` bits and check if the rightmost bit is now `1`
```rust
fn is_bit_set(n: u64, k: usize) -> bool {
   ((n >> k) & 1) == 1
}
```
This solution always works if you check that it's not zero.

I know what you're thinking, this post is supposed to be about Python and math.
Why am I reading about bit manipulation and Rust? Let's explore that now.

I've been used to doing bit manipulation in Python. Here's our first implementation
rewritten in Python:
```python
def is_bit_set(n, k):
   n & (1 << k)
```

Now if you have a conditional such as:
```python
if is_bit_set(n, k):
# do stuff
```
it just works. Why?

### Python Values and Truthiness

In Python, every value has an associated truth value, determining whether it evaluates to `True` or `False` in a boolean
context. Here are some general principles:

1. **Numerical Values:**
   - Equivalence Class: Non-zero values.
   - `True` when the value is non-zero.
   - `False` when the value is zero.

```python
# x is some numerical type
if x:
   print("yes") # x is non-zero
else:
   print("no") # x is zero
```

2. **Sequence Types (Strings, Lists, Tuples, Sets, etc.):**
   - Equivalence Class: Non-empty sequences.
   - `True` when the sequence has elements.
   - `False` when the sequence is empty.

```python
# s is a string
if s:
   print("yes") # s is a non-empty string
else:
   print("no") # s is the empty string
```

3. **NoneType:**
   - Equivalence Class: The singleton `None`.
   - `False` when the value is `None`.
   - `True` for any other value.

```python
# v is either None or some object
if v:
   print("yes") # v is not None
else:
   print("no") # v is None
```

Now remember our initial example of `is_bit_set`?
```python
def is_bit_set(n, k):
   n & (1 << k)
```
The return value here is an `int`. In the case that the `k`th bit is set,
the return value is some non-zero integer. Otherwise, the return value is `0`.
Given what we now know about truthy values in Python, this example should
make more sense. Namely, this solution works just fine in Python because
non-zero values simply evaluate to `True` (i.e., the `k`th bit is set).
On the other hand, zero just evaluated to `False` (i.e., the `k`th bit is *not* set).


### Equivalence Classes in Mathematics

Now how is this all related to math? Equivalence classes are sets that group elements based on some equivalence relation.
Elements within the same equivalence class are considered equivalent according to that relation. The concept is often
introduced with the canonical example of modular arithmetic.

Let's take the case of mod $2$. Given an integer $x$, we divide
$x$ by $2$, and we create a set using the square brackets, $[x]$.

It follows that in the case of mod $2$, we have boxes labeled $0$ and $1$.
The box labeled 0 we have all multiples of $2$. More formally, we define it
as all integers of the form $2k + 1$, where $k \in \mathbb{Z}$. The box
labeled $1$ containers all integers of the form $2k + 1$, where $k \in \mathbb{Z}$:

$[0] = \\{\ldots, -6, -4, -2, 0, 2, 4, 6, \ldots\\}$

$[1] = \\{\ldots, -5, -3, -1, 1, 3, 5, 7, \ldots\\}$

Both of these boxes are equivalence classes. How? Well two integers are *equivalent* [modulo $2$], if they are in the
same box. Moreover, every integer is in some box, and no integer is in more than one box ---
the boxes *partition* the integers.

### Connection Between Python and Equivalence Classes

The connection between Python values and equivalence classes lies in the idea of grouping values based on their shared
characteristics:

1. **Numerical Values:**
   - `True` when the value is non-zero.
   - `False` when the value is zero.
   - **Equivalence Class**: Non-zero values.

2. **Sequence Types (Strings, Lists, Tuples, Sets, etc.):**
   - `True` when the sequence has elements.
   - `False` when the sequence is empty.
   - **Equivalence Class**: Non-empty sequences.

3. **NoneType:**
   - `False` when the value is `None`.
   - `True` for any other value.
   - **Equivalence Class**: The singleton `None`.

This parallels the mathematical concept of equivalence classes, where elements within a class share a certain
equivalence relation. In Python, the equivalence relation is often a specific property of the values, such as
non-emptiness for sequences.

By recognizing and utilizing these equivalence classes, programmers can write more concise and expressive
(i.e., pythonic) code. In fact, PEP 8, the style guide for Python, recommends the use of the fact that empty sequences
are `False` [[3]](https://peps.python.org/pep-0008/#programming-recommendations).

In summary, the connection between Python values and equivalence classes lies in the grouping of values based on shared
characteristics. This creates a natural and intuitive way to handle boolean evaluations in code.
