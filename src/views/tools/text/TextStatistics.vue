<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📊</span>
        <h1 class="text-3xl md:text-4xl font-bold">文本统计</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        分析文本的统计信息，包括字符数、单词数、行数等详细统计
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入文本</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost"
                @click="store.loadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost"
                @click="store.clearInput"
              >
                清空
              </button>
            </div>
          </div>
          
          <!-- 文本输入区域 -->
          <div class="form-control">
            <textarea
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="在此输入需要统计的文本..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 统计结果区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title mb-6">统计结果</h2>
          
          <!-- 基础统计 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="stat">
              <div class="stat-title">字符数</div>
              <div class="stat-value text-primary">{{ stats.characters }}</div>
              <div class="stat-desc">包含空格</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">字符数</div>
              <div class="stat-value text-secondary">{{ stats.charactersNoSpaces }}</div>
              <div class="stat-desc">不含空格</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">单词数</div>
              <div class="stat-value text-accent">{{ stats.words }}</div>
              <div class="stat-desc">英文单词 + 中文字符</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">行数</div>
              <div class="stat-value text-info">{{ stats.lines }}</div>
              <div class="stat-desc">文本行数</div>
            </div>
          </div>
          
          <!-- 详细统计 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">句子数</div>
                <div class="stat-value">{{ stats.sentences }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">段落数</div>
                <div class="stat-value">{{ stats.paragraphs }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">空格数</div>
                <div class="stat-value">{{ stats.spaces }}</div>
              </div>
            </div>
            
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">字母数</div>
                <div class="stat-value">{{ stats.letters }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">数字数</div>
                <div class="stat-value">{{ stats.digits }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">标点数</div>
                <div class="stat-value">{{ stats.punctuations }}</div>
              </div>
            </div>
          </div>
          
          <!-- 频率分析 -->
          <div class="mt-6">
            <h3 class="font-semibold text-lg mb-4">字符频率</h3>
            <div class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>字符</th>
                    <th>出现次数</th>
                    <th>频率(%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="charFrequency.length === 0">
                    <td colspan="3" class="text-center text-base-content/50">暂无数据</td>
                  </tr>
                  <tr v-for="freq in charFrequency" :key="freq.char">
                    <td class="font-mono">{{ freq.char === ' ' ? '[空格]' : freq.char === '\n' ? '[换行]' : freq.char === '\t' ? '[制表符]' : freq.char }}</td>
                    <td>{{ freq.count }}</td>
                    <td>{{ freq.percentage.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 额外统计信息 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">详细分析</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 阅读时间 -->
          <div class="text-center">
            <div class="text-4xl font-bold text-primary">{{ stats.readingTime }}</div>
            <div class="text-sm text-base-content/70">阅读时间(分钟)</div>
          </div>
          
          <!-- 平均单词长度 -->
          <div class="text-center">
            <div class="text-4xl font-bold text-secondary">{{ stats.avgWordLength }}</div>
            <div class="text-sm text-base-content/70">平均单词长度</div>
          </div>
          
          <!-- 平均句子长度 -->
          <div class="text-center">
            <div class="text-4xl font-bold text-accent">{{ stats.avgSentenceLength }}</div>
            <div class="text-sm text-base-content/70">平均句子长度</div>
          </div>
        </div>
        
        <!-- 文本密度 -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ stats.letterDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">字母密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ stats.digitDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">数字密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ stats.punctuationDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">标点密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ stats.spaceDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">空格密度</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">统计指标说明</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li><strong>字符数(含空格)</strong>：文本中所有字符的数量，包括空格和标点</li>
              <li><strong>字符数(不含空格)</strong>：文本中所有字符的数量，不包括空格</li>
              <li><strong>单词数</strong>：英文单词的数量，以空格分隔</li>
              <li><strong>行数</strong>：文本的行数，以换行符分隔</li>
              <li><strong>句子数</strong>：以句号、问号、感叹号分隔的句子数量</li>
              <li><strong>段落数</strong>：以空行分隔的段落数量</li>
              <li><strong>阅读时间</strong>：基于平均阅读速度估算的阅读时间</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">使用场景</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>文章长度分析和优化</li>
              <li>代码注释统计</li>
              <li>文档质量评估</li>
              <li>文本内容分析</li>
              <li>写作辅助工具</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useTextStatisticsStore } from '@/store/modules/tools/text/TextStatistics.js'

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'TextStatisticsPage',
  meta: {
    tool: {
      id: 'text-statistics',
      name: '文本统计分析工具',
      description: '文本统计分析工具，支持统计字符数、单词数、行数、阅读时间等文本指标',
      icon: '📊',
      category: 'analysis',
      tags: ['文本', '统计', '分析', '字符', '单词', '分析工具'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
})

// 使用store（统计逻辑统一在 store 中计算）
const store = useTextStatisticsStore()
const { 
  inputText,
  hasInput,
  basicStats: stats,
  characterFrequency
} = storeToRefs(store)

// 始终显示字符频率统计
store.showCharacterFrequency = true
</script>