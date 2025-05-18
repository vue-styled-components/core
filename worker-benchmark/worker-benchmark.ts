import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import { calculateStylesInWorker, terminateWorker } from '../packages/core/src/utils/worker'

// 为Node.js环境提供浏览器API模拟
if (typeof window === 'undefined') {
  // 模拟全局performance对象
  globalThis.performance = performance as unknown as Performance

  // 模拟Worker API
  class NodeWorker {
    constructor() {
      console.warn('模拟Worker API在Node环境')
    }

    postMessage() {}
    terminate() {}
  }

  globalThis.Worker = NodeWorker as any
  globalThis.window = { Worker: NodeWorker } as any
}

// 定义测试样式数据生成函数
function generateSimpleStyles(count = 5): any[] {
  return Array.from({ length: count }).map((_, i) => `color: red; margin: ${i}px;`)
}

function generateComplexStyles(count = 20): any[] {
  return Array.from({ length: count }).map((_, i) => `
    color: ${i % 2 ? 'red' : 'blue'};
    background: ${i % 3 ? 'white' : 'black'};
    padding: ${i * 2}px;
    margin: ${i}px;
    font-size: ${12 + i}px;
    border: ${i % 4 + 1}px solid ${i % 2 ? 'black' : 'gray'};
    border-radius: ${i * 2}px;
    display: flex;
    align-items: ${i % 3 ? 'center' : 'flex-start'};
    justify-content: ${i % 2 ? 'center' : 'flex-end'};
    flex-direction: ${i % 2 ? 'row' : 'column'};
    position: ${i % 5 ? 'relative' : 'absolute'};
    opacity: ${0.5 + i * 0.01};
    transform: scale(${1 + i * 0.1});
    transition: all ${0.2 + i * 0.1}s;
  `)
}

// 模拟主线程样式计算函数
function calculateStylesInMainThread(
  cssWithExpression: any[],
  _context: Record<string, any>,
): Promise<{ result: string[], tailwindClasses: string[] }> {
  // 简化版的样式处理逻辑，类似于worker中的实现
  const tailwindClasses: string[] = []
  const result = cssWithExpression.map(style => typeof style === 'string' ? style : '')

  return Promise.resolve({ result, tailwindClasses })
}

// 性能测试函数
async function measurePerformance(
  label: string,
  styles: any[],
  iterations: number,
  useWorker: boolean,
): Promise<{ label: string, duration: number, workerStatus: string }> {
  const context = { theme: { colors: { primary: 'blue' } } }
  const start = performance.now()

  for (let i = 0; i < iterations; i++) {
    if (useWorker) {
      await calculateStylesInWorker(styles, context)
    }
    else {
      await calculateStylesInMainThread(styles, context)
    }
  }

  const end = performance.now()
  const duration = end - start

  return {
    label,
    duration,
    workerStatus: useWorker ? 'Worker' : '主线程',
  }
}

// 结果类型定义
interface TestResult {
  scenarioName: string
  iterations: number
  stylesCount: number
  workerDuration: number
  mainThreadDuration: number
  fasterMethod: string
  percentageDifference: number
  timestamp: string
}

interface BenchmarkReport {
  environment: string
  workerAvailable: boolean
  testResults: TestResult[]
  fallbackTest?: {
    duration: number
    mainThreadDuration: number
    difference: number
    differencePercentage: number
  }
  generatedAt: string
}

// 生成JSON报告
function generateJsonReport(report: BenchmarkReport): void {
  const reportDir = path.join(process.cwd(), 'benchmark-reports')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')
  const filePath = path.join(reportDir, `benchmark-report-${timestamp}.json`)

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2))
  console.warn(`JSON报告已生成: ${filePath}`)
}

// 生成HTML报告
function generateHtmlReport(report: BenchmarkReport): void {
  const reportDir = path.join(process.cwd(), 'benchmark-reports')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')
  const filePath = path.join(reportDir, `benchmark-report-${timestamp}.html`)

  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Worker vs 主线程性能基准测试报告</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .info {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .info-item {
      background-color: #fff;
      padding: 10px 15px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin: 5px;
      flex: 1;
      min-width: 200px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e1e1e1;
    }
    th {
      background-color: #3498db;
      color: white;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .chart-container {
      height: 400px;
      margin-top: 30px;
    }
    .footer {
      margin-top: 30px;
      color: #7f8c8d;
      font-size: 0.9em;
      text-align: center;
    }
    .worker-faster {
      color: #27ae60;
      font-weight: bold;
    }
    .main-thread-faster {
      color: #e74c3c;
      font-weight: bold;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Worker vs 主线程样式计算性能基准测试报告</h1>
  
  <div class="container">
    <h2>测试环境信息</h2>
    <div class="info">
      <div class="info-item">
        <strong>运行环境:</strong> ${report.environment}
      </div>
      <div class="info-item">
        <strong>Worker可用:</strong> ${report.workerAvailable ? '是' : '否'}
      </div>
      <div class="info-item">
        <strong>生成时间:</strong> ${report.generatedAt}
      </div>
    </div>
  </div>

  <div class="container">
    <h2>测试结果</h2>
    <table>
      <thead>
        <tr>
          <th>测试场景</th>
          <th>迭代次数</th>
          <th>样式数量</th>
          <th>Worker耗时(ms)</th>
          <th>主线程耗时(ms)</th>
          <th>结果比较</th>
        </tr>
      </thead>
      <tbody>
        ${report.testResults.map(result => `
          <tr>
            <td>${result.scenarioName}</td>
            <td>${result.iterations}</td>
            <td>${result.stylesCount}</td>
            <td>${result.workerDuration.toFixed(2)}</td>
            <td>${result.mainThreadDuration.toFixed(2)}</td>
            <td class="${result.fasterMethod === 'Worker' ? 'worker-faster' : 'main-thread-faster'}">
              ${result.fasterMethod} 快 ${result.percentageDifference.toFixed(2)}%
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${report.fallbackTest
      ? `
    <h3>Worker不可用场景测试</h3>
    <table>
      <thead>
        <tr>
          <th>回退处理耗时(ms)</th>
          <th>主线程耗时(ms)</th>
          <th>差异(ms)</th>
          <th>差异百分比</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${report.fallbackTest.duration.toFixed(2)}</td>
          <td>${report.fallbackTest.mainThreadDuration.toFixed(2)}</td>
          <td>${report.fallbackTest.difference.toFixed(2)}</td>
          <td>${report.fallbackTest.differencePercentage}%</td>
        </tr>
      </tbody>
    </table>
    `
      : ''}
    
    <div class="chart-container">
      <canvas id="performanceChart"></canvas>
    </div>
  </div>
  
  <div class="footer">
    <p>此报告由 vue-styled-components 基准测试工具自动生成</p>
  </div>

  <script>
    // 绘制性能比较图表
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const labels = ${JSON.stringify(report.testResults.map(r => r.scenarioName))};
    const workerData = ${JSON.stringify(report.testResults.map(r => r.workerDuration))};
    const mainThreadData = ${JSON.stringify(report.testResults.map(r => r.mainThreadDuration))};
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Worker耗时(ms)',
            data: workerData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: '主线程耗时(ms)',
            data: mainThreadData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '耗时(毫秒)'
            }
          },
          x: {
            title: {
              display: true,
              text: '测试场景'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Worker vs 主线程性能比较',
            font: {
              size: 16
            }
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  </script>
</body>
</html>
  `

  fs.writeFileSync(filePath, htmlContent)
  console.warn(`HTML报告已生成: ${filePath}`)
}

// 执行所有基准测试并输出结果
async function runAllBenchmarks(): Promise<void> {
  // 存储原始Worker
  const originalWorker = typeof window !== 'undefined' ? window.Worker : undefined

  // 创建报告对象
  const report: BenchmarkReport = {
    environment: typeof window !== 'undefined' ? '浏览器' : 'Node.js',
    workerAvailable: typeof Worker !== 'undefined',
    testResults: [],
    generatedAt: new Date().toLocaleString(),
  }

  try {
    // 测试场景配置
    const testScenarios = [
      {
        name: '简单样式计算',
        styles: generateSimpleStyles(5),
        iterations: 100,
      },
      {
        name: '复杂样式计算',
        styles: generateComplexStyles(20),
        iterations: 50,
      },
      {
        name: '大量样式计算',
        styles: generateComplexStyles(100),
        iterations: 10,
      },
      {
        name: '混合样式计算',
        styles: [
          ...generateSimpleStyles(10),
          ...generateComplexStyles(15),
          ...generateSimpleStyles(5),
          ...generateComplexStyles(10),
        ],
        iterations: 20,
      },
      {
        name: '阈值边界样式计算',
        styles: generateSimpleStyles(10), // 阈值为10
        iterations: 50,
      },
    ]

    console.warn('====== Worker vs 主线程样式计算性能基准测试 ======')
    console.warn('测试环境:', report.environment)
    console.warn('Worker可用:', report.workerAvailable ? '是' : '否')
    console.warn('======================================')

    // 运行每个测试场景
    for (const scenario of testScenarios) {
      console.warn(`\n[测试] ${scenario.name} (${scenario.iterations} 次迭代)`)
      console.warn(`样式数量: ${scenario.styles.length}`)

      // 使用Worker测试
      const workerResult = await measurePerformance(
        scenario.name,
        scenario.styles,
        scenario.iterations,
        true,
      )

      // 使用主线程测试
      const mainThreadResult = await measurePerformance(
        scenario.name,
        scenario.styles,
        scenario.iterations,
        false,
      )

      // 比较结果
      const ratio = mainThreadResult.duration / workerResult.duration
      const faster = ratio > 1 ? 'Worker' : '主线程'
      const percentage = Math.abs((ratio - 1) * 100)

      console.warn(`结果:`)
      console.warn(`- Worker: ${workerResult.duration.toFixed(2)}ms`)
      console.warn(`- 主线程: ${mainThreadResult.duration.toFixed(2)}ms`)
      console.warn(`- ${faster} 快 ${percentage.toFixed(2)}%`)
      console.warn('--------------------------------------')

      // 添加到报告
      report.testResults.push({
        scenarioName: scenario.name,
        iterations: scenario.iterations,
        stylesCount: scenario.styles.length,
        workerDuration: workerResult.duration,
        mainThreadDuration: mainThreadResult.duration,
        fasterMethod: faster,
        percentageDifference: percentage,
        timestamp: new Date().toISOString(),
      })
    }

    // 测试Worker不可用的情况
    if (typeof window !== 'undefined') {
      console.warn('\n[测试] Worker不可用场景')

      // 模拟Worker不可用
      window.Worker = undefined as any

      const complexStyles = generateComplexStyles(20)
      const iterations = 50

      const fallbackResult = await measurePerformance(
        'Worker不可用回退',
        complexStyles,
        iterations,
        true,
      )

      const mainThreadResult = await measurePerformance(
        '主线程',
        complexStyles,
        iterations,
        false,
      )

      const diff = Math.abs(mainThreadResult.duration - fallbackResult.duration)
      const diffPercentage = (diff / Math.min(mainThreadResult.duration, fallbackResult.duration) * 100)

      console.warn(`结果:`)
      console.warn(`- 回退处理: ${fallbackResult.duration.toFixed(2)}ms`)
      console.warn(`- 主线程: ${mainThreadResult.duration.toFixed(2)}ms`)
      console.warn(`- 差异: ${diff.toFixed(2)}ms (${diffPercentage.toFixed(2)}%)`)
      console.warn('======================================')

      // 添加到报告
      report.fallbackTest = {
        duration: fallbackResult.duration,
        mainThreadDuration: mainThreadResult.duration,
        difference: diff,
        differencePercentage: Number.parseFloat(diffPercentage.toFixed(2)),
      }
    }

    // 生成报告
    generateJsonReport(report)
    generateHtmlReport(report)
  }
  finally {
    // 恢复原始Worker并释放资源
    if (typeof window !== 'undefined') {
      window.Worker = originalWorker as any
    }
    terminateWorker()
  }
}

// 如果这个文件是直接运行的，执行基准测试
if (typeof require !== 'undefined' && require.main === module) {
  runAllBenchmarks().catch((error) => {
    console.error('基准测试运行错误:', error)
  })
}
// 导出函数供其他模块使用
export {
  calculateStylesInMainThread,
  generateComplexStyles,
  generateSimpleStyles,
  measurePerformance,
  runAllBenchmarks,
}
