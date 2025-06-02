<script setup lang="ts">
import styled from '@vue-styled-components/core'
import { ref, reactive, computed, onMounted } from 'vue'

// 调试状态
const debugState = reactive({
  showStyleSheets: false,
  showComponentTree: false,
  showCacheInfo: false,
  showPerformanceLogs: false,
  highlightComponents: false,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error'
})

// 模拟数据
const styleSheets = ref([
  {
    id: 'styled-1',
    componentName: 'Button',
    rules: 'padding: 0.75rem 1.5rem; background: #007bff; color: white;',
    hash: 'sc-abc123',
    usageCount: 15
  },
  {
    id: 'styled-2',
    componentName: 'Card',
    rules: 'background: white; border-radius: 12px; padding: 1.5rem;',
    hash: 'sc-def456',
    usageCount: 8
  },
  {
    id: 'styled-3',
    componentName: 'Container',
    rules: 'max-width: 1200px; margin: 0 auto; padding: 0 1rem;',
    hash: 'sc-ghi789',
    usageCount: 3
  }
])

const componentTree = ref([
  {
    name: 'App',
    type: 'component',
    children: [
      {
        name: 'ThemeProvider',
        type: 'provider',
        props: { theme: 'light' },
        children: [
          {
            name: 'AppContainer',
            type: 'styled',
            hash: 'sc-app-123',
            children: [
              {
                name: 'Header',
                type: 'styled',
                hash: 'sc-header-456'
              },
              {
                name: 'MainContent',
                type: 'styled',
                hash: 'sc-main-789',
                children: [
                  {
                    name: 'Sidebar',
                    type: 'styled',
                    hash: 'sc-sidebar-abc'
                  },
                  {
                    name: 'ContentArea',
                    type: 'styled',
                    hash: 'sc-content-def'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
])

const cacheInfo = ref({
  totalEntries: 156,
  hitRate: 87.5,
  missRate: 12.5,
  memoryUsage: '2.3MB',
  entries: [
    {
      key: 'Button-primary-large',
      hash: 'sc-abc123',
      hits: 45,
      lastAccess: new Date(Date.now() - 1000 * 60 * 5),
      size: '1.2KB'
    },
    {
      key: 'Card-default',
      hash: 'sc-def456',
      hits: 23,
      lastAccess: new Date(Date.now() - 1000 * 60 * 2),
      size: '0.8KB'
    },
    {
      key: 'Container-responsive',
      hash: 'sc-ghi789',
      hits: 12,
      lastAccess: new Date(Date.now() - 1000 * 60 * 10),
      size: '0.5KB'
    }
  ]
})

const performanceLogs = ref([
  {
    timestamp: new Date(Date.now() - 1000 * 30),
    level: 'info',
    message: 'Component Button rendered in 2.3ms',
    details: { renderTime: 2.3, cacheHit: true }
  },
  {
    timestamp: new Date(Date.now() - 1000 * 45),
    level: 'warn',
    message: 'Cache miss for component Card',
    details: { componentName: 'Card', props: { variant: 'outline' } }
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60),
    level: 'debug',
    message: 'Theme context updated',
    details: { oldTheme: 'light', newTheme: 'dark' }
  },
  {
    timestamp: new Date(Date.now() - 1000 * 90),
    level: 'error',
    message: 'Failed to parse CSS rule',
    details: { rule: 'invalid-property: value;', component: 'CustomButton' }
  }
])

// 样式化组件
const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .card-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
  }
`

const DebugSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #007bff;
`

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0.5rem 0;
  
  .keyword { color: #f56565; }
  .string { color: #68d391; }
  .number { color: #fbb6ce; }
  .comment { color: #a0aec0; font-style: italic; }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background: #f7fafc;
    font-weight: 600;
    color: #2d3748;
  }
  
  tr:hover {
    background: #f7fafc;
  }
`

const TreeNode = styled('div', {
  level: Number
})`
  margin-left: ${props => props.level * 1.5}rem;
  padding: 0.25rem 0;
  
  .node-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #e2e8f0;
    }
  }
  
  .node-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }
  
  .node-name {
    font-weight: 500;
    color: #2d3748;
  }
  
  .node-type {
    font-size: 0.75rem;
    color: #718096;
    background: #e2e8f0;
    padding: 0.125rem 0.375rem;
    border-radius: 12px;
  }
  
  .node-hash {
    font-size: 0.75rem;
    color: #4a5568;
    font-family: monospace;
  }
`

const LogEntry = styled('div', {
  level: String
})`
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 6px;
  border-left: 4px solid ${props => {
    switch (props.level) {
      case 'error': return '#f56565'
      case 'warn': return '#ed8936'
      case 'info': return '#4299e1'
      case 'debug': return '#38b2ac'
      default: return '#a0aec0'
    }
  }};
  background: ${props => {
    switch (props.level) {
      case 'error': return '#fed7d7'
      case 'warn': return '#feebc8'
      case 'info': return '#bee3f8'
      case 'debug': return '#b2f5ea'
      default: return '#f7fafc'
    }
  }};
  
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .log-level {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: ${props => {
      switch (props.level) {
        case 'error': return '#c53030'
        case 'warn': return '#c05621'
        case 'info': return '#2b6cb0'
        case 'debug': return '#2c7a7b'
        default: return '#4a5568'
      }
    }};
  }
  
  .log-timestamp {
    font-size: 0.75rem;
    color: #718096;
  }
  
  .log-message {
    font-weight: 500;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
  
  .log-details {
    font-size: 0.875rem;
    color: #4a5568;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.5rem;
    border-radius: 4px;
    font-family: monospace;
  }
`

const ToggleButton = styled('button', {
  active: Boolean
})`
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  background: ${props => props.active ? '#007bff' : '#e2e8f0'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`

// 计算属性
const filteredLogs = computed(() => {
  const levels = ['debug', 'info', 'warn', 'error']
  const currentLevelIndex = levels.indexOf(debugState.logLevel)
  return performanceLogs.value.filter(log => 
    levels.indexOf(log.level) >= currentLevelIndex
  )
})

// 方法
const toggleSection = (section: keyof typeof debugState) => {
  debugState[section] = !debugState[section]
}

const clearLogs = () => {
  performanceLogs.value = []
}

const exportDebugInfo = () => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    styleSheets: styleSheets.value,
    componentTree: componentTree.value,
    cacheInfo: cacheInfo.value,
    performanceLogs: performanceLogs.value,
    debugState: debugState
  }
  
  const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debug-info-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const renderTreeNode = (node: any, level = 0): any => {
  return {
    ...node,
    level,
    children: node.children?.map((child: any) => renderTreeNode(child, level + 1))
  }
}

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString()
}
</script>

<template>
  <div>
    <Card>
      <div class="card-header">🔧 调试面板</div>
      <div style="color: #666; line-height: 1.6;">
        <p>提供详细的调试信息和开发工具，帮助分析和优化 vue-styled-components 的使用。</p>
      </div>
    </Card>

    <!-- 调试控制 -->
    <Card>
      <div class="card-header">调试控制</div>
      <div style="margin: 1rem 0;">
        <ToggleButton 
          :active="debugState.showStyleSheets"
          @click="toggleSection('showStyleSheets')"
        >
          样式表信息
        </ToggleButton>
        <ToggleButton 
          :active="debugState.showComponentTree"
          @click="toggleSection('showComponentTree')"
        >
          组件树
        </ToggleButton>
        <ToggleButton 
          :active="debugState.showCacheInfo"
          @click="toggleSection('showCacheInfo')"
        >
          缓存信息
        </ToggleButton>
        <ToggleButton 
          :active="debugState.showPerformanceLogs"
          @click="toggleSection('showPerformanceLogs')"
        >
          性能日志
        </ToggleButton>
        <ToggleButton 
          :active="debugState.highlightComponents"
          @click="toggleSection('highlightComponents')"
        >
          高亮组件
        </ToggleButton>
      </div>
      
      <div style="margin: 1rem 0; display: flex; gap: 1rem; align-items: center;">
        <label style="font-weight: 500;">日志级别:</label>
        <select 
          v-model="debugState.logLevel" 
          style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
        
        <button 
          @click="clearLogs"
          style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          清除日志
        </button>
        
        <button 
          @click="exportDebugInfo"
          style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          导出调试信息
        </button>
      </div>
    </Card>

    <!-- 样式表信息 -->
    <Card v-if="debugState.showStyleSheets">
      <div class="card-header">📄 样式表信息</div>
      <DebugSection>
        <p>当前页面中所有 styled-components 生成的样式表：</p>
        <Table>
          <thead>
            <tr>
              <th>组件名</th>
              <th>样式哈希</th>
              <th>使用次数</th>
              <th>样式规则</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sheet in styleSheets" :key="sheet.id">
              <td><strong>{{ sheet.componentName }}</strong></td>
              <td><code>{{ sheet.hash }}</code></td>
              <td>{{ sheet.usageCount }}</td>
              <td>
                <CodeBlock>{{ sheet.rules }}</CodeBlock>
              </td>
            </tr>
          </tbody>
        </Table>
      </DebugSection>
    </Card>

    <!-- 组件树 -->
    <Card v-if="debugState.showComponentTree">
      <div class="card-header">🌳 组件树</div>
      <DebugSection>
        <p>当前页面的组件层次结构：</p>
        <div style="font-family: monospace; background: white; padding: 1rem; border-radius: 4px; border: 1px solid #e2e8f0;">
          <template v-for="node in componentTree" :key="node.name">
            <TreeNode :level="0">
              <div class="node-content">
                <span class="node-icon">📦</span>
                <span class="node-name">{{ node.name }}</span>
                <span class="node-type">{{ node.type }}</span>
                <span v-if="node.hash" class="node-hash">{{ node.hash }}</span>
              </div>
              
              <template v-if="node.children">
                <template v-for="child in node.children" :key="child.name">
                  <TreeNode :level="1">
                    <div class="node-content">
                      <span class="node-icon">{{ child.type === 'styled' ? '🎨' : child.type === 'provider' ? '🔧' : '📦' }}</span>
                      <span class="node-name">{{ child.name }}</span>
                      <span class="node-type">{{ child.type }}</span>
                      <span v-if="child.hash" class="node-hash">{{ child.hash }}</span>
                      <span v-if="child.props" style="font-size: 0.75rem; color: #718096;">{{ JSON.stringify(child.props) }}</span>
                    </div>
                    
                    <template v-if="child.children">
                      <template v-for="grandchild in child.children" :key="grandchild.name">
                        <TreeNode :level="2">
                          <div class="node-content">
                            <span class="node-icon">{{ grandchild.type === 'styled' ? '🎨' : '📦' }}</span>
                            <span class="node-name">{{ grandchild.name }}</span>
                            <span class="node-type">{{ grandchild.type }}</span>
                            <span v-if="grandchild.hash" class="node-hash">{{ grandchild.hash }}</span>
                          </div>
                          
                          <template v-if="grandchild.children">
                            <template v-for="greatgrandchild in grandchild.children" :key="greatgrandchild.name">
                              <TreeNode :level="3">
                                <div class="node-content">
                                  <span class="node-icon">🎨</span>
                                  <span class="node-name">{{ greatgrandchild.name }}</span>
                                  <span class="node-type">{{ greatgrandchild.type }}</span>
                                  <span v-if="greatgrandchild.hash" class="node-hash">{{ greatgrandchild.hash }}</span>
                                </div>
                              </TreeNode>
                            </template>
                          </template>
                        </TreeNode>
                      </template>
                    </template>
                  </TreeNode>
                </template>
              </template>
            </TreeNode>
          </template>
        </div>
      </DebugSection>
    </Card>

    <!-- 缓存信息 -->
    <Card v-if="debugState.showCacheInfo">
      <div class="card-header">💾 缓存信息</div>
      <DebugSection>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #007bff;">{{ cacheInfo.totalEntries }}</div>
            <div style="color: #666;">总缓存条目</div>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #28a745;">{{ cacheInfo.hitRate }}%</div>
            <div style="color: #666;">命中率</div>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #ffc107;">{{ cacheInfo.memoryUsage }}</div>
            <div style="color: #666;">内存使用</div>
          </div>
        </div>
        
        <Table>
          <thead>
            <tr>
              <th>缓存键</th>
              <th>样式哈希</th>
              <th>命中次数</th>
              <th>最后访问</th>
              <th>大小</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in cacheInfo.entries" :key="entry.key">
              <td><code>{{ entry.key }}</code></td>
              <td><code>{{ entry.hash }}</code></td>
              <td>{{ entry.hits }}</td>
              <td>{{ formatTimestamp(entry.lastAccess) }}</td>
              <td>{{ entry.size }}</td>
            </tr>
          </tbody>
        </Table>
      </DebugSection>
    </Card>

    <!-- 性能日志 -->
    <Card v-if="debugState.showPerformanceLogs">
      <div class="card-header">📊 性能日志</div>
      <DebugSection>
        <p>显示级别: <strong>{{ debugState.logLevel.toUpperCase() }}</strong> 及以上 ({{ filteredLogs.length }} 条记录)</p>
        
        <div style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
          <LogEntry 
            v-for="(log, index) in filteredLogs" 
            :key="index"
            :level="log.level"
          >
            <div class="log-header">
              <span class="log-level">{{ log.level }}</span>
              <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.details" class="log-details">
              {{ JSON.stringify(log.details, null, 2) }}
            </div>
          </LogEntry>
        </div>
        
        <div v-if="filteredLogs.length === 0" style="text-align: center; color: #666; padding: 2rem;">
          暂无 {{ debugState.logLevel.toUpperCase() }} 级别的日志记录
        </div>
      </DebugSection>
    </Card>

    <!-- 开发工具 -->
    <Card>
      <div class="card-header">🛠️ 开发工具</div>
      <DebugSection>
        <h4 style="margin: 0 0 1rem 0;">有用的调试技巧：</h4>
        <ul style="line-height: 1.8; color: #4a5568;">
          <li><strong>检查样式生成：</strong> 在浏览器开发者工具中查看 &lt;style&gt; 标签</li>
          <li><strong>性能分析：</strong> 使用 Performance 面板监控渲染性能</li>
          <li><strong>缓存调试：</strong> 观察缓存命中率，优化样式复用</li>
          <li><strong>主题调试：</strong> 检查 ThemeProvider 的上下文传递</li>
          <li><strong>样式冲突：</strong> 使用浏览器工具检查 CSS 优先级</li>
        </ul>
        
        <h4 style="margin: 2rem 0 1rem 0;">常用调试代码：</h4>
        <CodeBlock>
<span class="comment">// 在组件中添加调试信息</span>
<span class="keyword">const</span> DebugButton = styled.button`
  <span class="comment">/* 添加边框来可视化组件边界 */</span>
  border: <span class="number">2</span>px solid red !important;
  
  <span class="comment">/* 在控制台输出样式信息 */</span>
  <span class="keyword">&amp;:hover</span> {
    <span class="comment">/* 使用 console.log 调试 */</span>
  }
`

<span class="comment">// 检查主题上下文</span>
<span class="keyword">const</span> theme = useTheme()
console.log(<span class="string">'Current theme:'</span>, theme)

<span class="comment">// 性能监控</span>
<span class="keyword">import</span> { performanceMonitor } <span class="keyword">from</span> <span class="string">'@vue-styled-components/core'</span>
performanceMonitor.printReport()
        </CodeBlock>
      </DebugSection>
    </Card>
  </div>
</template>