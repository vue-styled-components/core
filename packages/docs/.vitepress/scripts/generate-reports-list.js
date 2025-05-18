import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 生成基准测试报告列表并写入JSON文件
 */
function generateReportsList() {
  // 获取当前文件的目录
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  // 基准测试报告目录
  const reportsDir = path.resolve(__dirname, '../../../../worker-benchmark/benchmark-reports')
  // 输出目录
  const outputDir = path.resolve(__dirname, '../../public/benchmark-reports')
  // 输出文件
  const outputFile = path.resolve(outputDir, 'benchmark-reports-list.json')

  try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 读取报告目录
    const files = fs.readdirSync(reportsDir)

    // 筛选JSON文件
    const jsonFiles = files.filter(file => file.endsWith('.json'))

    // 按照时间戳排序 (降序，最新的在前)
    jsonFiles.sort((a, b) => {
      const timeA = a.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0] || ''
      const timeB = b.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0] || ''
      return timeB.localeCompare(timeA)
    })

    // 将报告列表写入JSON文件
    fs.writeFileSync(outputFile, JSON.stringify(jsonFiles, null, 2))
    console.log(`报告列表已写入: ${outputFile}`)

    // 复制报告文件到输出目录
    jsonFiles.forEach((file) => {
      const sourcePath = path.join(reportsDir, file)
      const destPath = path.join(outputDir, file)
      fs.copyFileSync(sourcePath, destPath)
      console.log(`已复制报告: ${file}`)
    })
  }
  catch (error) {
    console.error('生成报告列表时出错:', error)
  }
}

// 执行生成报告列表
generateReportsList()
