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

// Translation map for scenario names
const scenarioTranslations: Record<string, string> = {
  '简单样式计算': 'Simple Style Calculation',
  '复杂样式计算': 'Complex Style Calculation',
  '大量样式计算': 'Large Style Calculation',
  '混合样式计算': 'Mixed Style Calculation',
  '阈值边界样式计算': 'Threshold Boundary Style Calculation'
}

const report = ref<BenchmarkReport | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Get report list
    const response = await fetch('/benchmark-reports/benchmark-reports-list.json')
    if (!response.ok) {
      throw new Error('Unable to retrieve report list')
    }
    
    const reportsList = await response.json()
    if (!reportsList || !reportsList.length) {
      throw new Error('No available reports found')
    }
    
    // Get the latest report (sorted by timestamp)
    const latestReport = reportsList[0]
    
    // Load report content
    const reportResponse = await fetch(`/benchmark-reports/${latestReport}`)
    if (!reportResponse.ok) {
      throw new Error('Unable to load report content')
    }
    
    report.value = await reportResponse.json()
    loading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error loading report'
    loading.value = false
  }
})

// Format number to two decimal places
function formatNumber(num: number): string {
  return num.toFixed(2)
}

// Translate scenario name if available
function translateScenario(name: string): string {
  return scenarioTranslations[name] || name
}
</script>

<template>
  <div class="benchmark-report">
    <div v-if="loading" class="loading">
      <p>Loading the latest benchmark report...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>Error loading report: {{ error }}</p>
    </div>
    
    <div v-else-if="report" class="report-content">
      <h2>Test Environment Information</h2>
      <div class="info">
        <div class="info-item">
          <strong>Environment:</strong> {{ report.environment === '浏览器' ? 'Browser' : report.environment }}
        </div>
        <div class="info-item">
          <strong>Worker Available:</strong> {{ report.workerAvailable ? 'Yes' : 'No' }}
        </div>
        <div class="info-item">
          <strong>Generated At:</strong> {{ report.generatedAt }}
        </div>
      </div>

      <h2>Test Results</h2>
      <table>
        <thead>
          <tr>
            <th>Test Scenario</th>
            <th>Iterations</th>
            <th>Style Count</th>
            <th>Worker Duration(ms)</th>
            <th>Main Thread Duration(ms)</th>
            <th>Comparison</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="result in report.testResults" :key="result.scenarioName">
            <td>{{ translateScenario(result.scenarioName) }}</td>
            <td>{{ result.iterations }}</td>
            <td>{{ result.stylesCount }}</td>
            <td>{{ formatNumber(result.workerDuration) }}</td>
            <td>{{ formatNumber(result.mainThreadDuration) }}</td>
            <td :class="result.fasterMethod === 'Worker' ? 'worker-faster' : 'main-thread-faster'">
              {{ result.fasterMethod === 'Worker' ? 'Worker' : 'Main Thread' }} faster by {{ formatNumber(result.percentageDifference) }}%
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Worker Unavailable Scenario Test</h3>
      <table>
        <thead>
          <tr>
            <th>Fallback Processing Duration(ms)</th>
            <th>Main Thread Duration(ms)</th>
            <th>Difference(ms)</th>
            <th>Difference Percentage</th>
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