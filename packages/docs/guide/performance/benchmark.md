---
outline: deep
---

# Performance Benchmark Report

Vue Styled Components has been deeply optimized for style processing performance. Through comparative testing between Web Worker and main thread modes, you can intuitively understand performance in different scenarios.

## Latest Benchmark Report

The following is the latest benchmark report showing the performance comparison between Worker mode and main thread mode in different scenarios:

<BenchmarkReportEn />

## Test Scenario Analysis

### Simple Style Calculation
In simple style calculation scenarios, the main thread mode typically shows better performance. This is because the computational load of simple style calculations is small, and the communication overhead of the Worker thread becomes a performance bottleneck.

### Complex Style Calculation
As the complexity of style calculations increases, Worker mode begins to show advantages, with performance improvements of around 50%.

### Large Style Calculation
When processing a large number of styles, the advantage of Worker mode is very significant, with performance improvements of several times.

### Mixed Style Calculation
In complex scenarios mixing multiple styles, the performance improvement of Worker mode is most significant, being potentially tens or even hundreds of times faster than the main thread.

### Threshold Boundary Style Calculation
When the number and complexity of styles are at the threshold boundary, Worker mode still maintains a performance advantage.

## Conclusion

Based on the test results, the following conclusions can be drawn:

1. For simple style calculations (fewer than 10 styles), the main thread mode is more efficient
2. For complex or large style calculations, Worker mode can significantly improve performance
3. In extremely complex style calculation scenarios, the performance advantage of Worker mode is most obvious
4. Even when Worker is unavailable, the fallback mechanism can provide good performance

## How to Benefit from the Report

Through the benchmark report, you can better understand the performance of Vue Styled Components in different scenarios and optimize your application accordingly:

- For simple components and few styles, you can disable Worker mode to reduce unnecessary communication overhead
- For complex components and many styles, ensure Worker mode is enabled to fully leverage performance advantages
- Choose the most suitable style processing strategy based on your application characteristics and target devices 