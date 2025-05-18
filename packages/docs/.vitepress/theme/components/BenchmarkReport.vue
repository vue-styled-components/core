<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

interface FallbackTest {
  duration: number
  mainThreadDuration: number
  difference: number
  differencePercentage: number
}

interface BenchmarkReport {
  environment: string
  workerAvailable: boolean
  testResults: TestResult[]
  generatedAt: string
  fallbackTest: FallbackTest
}

const report = ref<BenchmarkReport | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // 获取报告列表
    const response = await fetch('/benchmark-reports/benchmark-reports-list.json')
    if (!response.ok) {
      throw new Error('无法获取报告列表')
    }
    
    const reportsList = await response.json()
    if (!reportsList || !reportsList.length) {
      throw new Error('没有找到可用的报告')
    }
    
    // 获取最新的报告（按时间戳排序）
    const latestReport = reportsList[0]
    
    // 加载报告内容
    const reportResponse = await fetch(`/benchmark-reports/${latestReport}`)
    if (!reportResponse.ok) {
      throw new Error('无法加载报告内容')
    }
    
    report.value = await reportResponse.json()
    loading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载报告时出错'
    loading.value = false
  }
})

// 格式化数字，保留两位小数
function formatNumber(num: number): string {
  return num.toFixed(2)
}
</script>

<template>
  <div class="benchmark-report">
    <div v-if="loading" class="loading">
      <p>正在加载最新的基准测试报告...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>加载报告时出错: {{ error }}</p>
    </div>
    
    <div v-else-if="report" class="report-content">
      <h2>测试环境信息</h2>
      <div class="info">
        <div class="info-item">
          <strong>运行环境:</strong> {{ report.environment }}
        </div>
        <div class="info-item">
          <strong>Worker可用:</strong> {{ report.workerAvailable ? '是' : '否' }}
        </div>
        <div class="info-item">
          <strong>生成时间:</strong> {{ report.generatedAt }}
        </div>
      </div>

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
          <tr v-for="result in report.testResults" :key="result.scenarioName">
            <td>{{ result.scenarioName }}</td>
            <td>{{ result.iterations }}</td>
            <td>{{ result.stylesCount }}</td>
            <td>{{ formatNumber(result.workerDuration) }}</td>
            <td>{{ formatNumber(result.mainThreadDuration) }}</td>
            <td :class="result.fasterMethod === 'Worker' ? 'worker-faster' : 'main-thread-faster'">
              {{ result.fasterMethod }} 快 {{ formatNumber(result.percentageDifference) }}%
            </td>
          </tr>
        </tbody>
      </table>

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
            <td>{{ formatNumber(report.fallbackTest.duration) }}</td>
            <td>{{ formatNumber(report.fallbackTest.mainThreadDuration) }}</td>
            <td>{{ formatNumber(report.fallbackTest.difference) }}</td>
            <td>{{ formatNumber(report.fallbackTest.differencePercentage) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.benchmark-report {
  background-color: var(--report-bg-color);
  border-radius: var(--report-border-radius);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--report-shadow);
}
.loading, .error {
  text-align: center;
  padding: 30px;
  font-style: italic;
  color: #666;
}
.error {
  color: var(--report-warning-color);
}
.info {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.info-item {
  background-color: var(--report-card-bg);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: var(--report-shadow);
  margin: 5px;
  flex: 1;
  min-width: 200px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: var(--report-card-bg);
  box-shadow: var(--report-shadow);
  border-radius: 6px;
  overflow: hidden;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--report-border-color);
}
th {
  background-color: var(--report-header-bg);
  color: var(--report-header-color);
}
tr:hover {
  background-color: var(--report-hover-color);
}
.worker-faster {
  color: var(--report-success-color);
  font-weight: bold;
}
.main-thread-faster {
  color: var(--report-warning-color);
  font-weight: bold;
}
</style> 