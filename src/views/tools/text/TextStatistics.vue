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
              @input="analyzeText"
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
              <div class="stat-value text-primary">{{ statistics.characters }}</div>
              <div class="stat-desc">包含空格</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">字符数</div>
              <div class="stat-value text-secondary">{{ statistics.charactersNoSpaces }}</div>
              <div class="stat-desc">不含空格</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">单词数</div>
              <div class="stat-value text-accent">{{ statistics.words }}</div>
              <div class="stat-desc">英文单词</div>
            </div>
            
            <div class="stat">
              <div class="stat-title">行数</div>
              <div class="stat-value text-info">{{ statistics.lines }}</div>
              <div class="stat-desc">文本行数</div>
            </div>
          </div>
          
          <!-- 详细统计 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">句子数</div>
                <div class="stat-value">{{ statistics.sentences }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">段落数</div>
                <div class="stat-value">{{ statistics.paragraphs }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">空格数</div>
                <div class="stat-value">{{ statistics.spaces }}</div>
              </div>
            </div>
            
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">字母数</div>
                <div class="stat-value">{{ statistics.letters }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">数字数</div>
                <div class="stat-value">{{ statistics.digits }}</div>
              </div>
              
              <div class="stat">
                <div class="stat-title">标点数</div>
                <div class="stat-value">{{ statistics.punctuations }}</div>
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
                  <tr v-for="(freq, char) in statistics.charFrequency" :key="char">
                    <td class="font-mono">{{ char === ' ' ? '[空格]' : char === '\n' ? '[换行]' : char }}</td>
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
            <div class="text-4xl font-bold text-primary">{{ statistics.readingTime }}</div>
            <div class="text-sm text-base-content/70">阅读时间(分钟)</div>
          </div>
          
          <!-- 平均单词长度 -->
          <div class="text-center">
            <div class="text-4xl font-bold text-secondary">{{ statistics.avgWordLength }}</div>
            <div class="text-sm text-base-content/70">平均单词长度</div>
          </div>
          
          <!-- 平均句子长度 -->
          <div class="text-center">
            <div class="text-4xl font-bold text-accent">{{ statistics.avgSentenceLength }}</div>
            <div class="text-sm text-base-content/70">平均句子长度</div>
          </div>
        </div>
        
        <!-- 文本密度 -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ statistics.letterDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">字母密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ statistics.digitDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">数字密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ statistics.punctuationDensity.toFixed(2) }}%</div>
            <div class="text-sm text-base-content/70">标点密度</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">{{ statistics.spaceDensity.toFixed(2) }}%</div>
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
import { ref, watch } from 'vue'
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

// 使用store
const store = useTextStatisticsStore()
const { 
  inputText, 
  showAdvancedStats, 
  showCharacterFrequency, 
  showWordFrequency,
  hasInput,
  basicStats,
  advancedStats,
  characterFrequency,
  wordFrequency
} = storeToRefs(store)

// 统计计算（兼容现有模板）
const statistics = ref({
  characters: 0,
  charactersNoSpaces: 0,
  words: 0,
  lines: 0,
  sentences: 0,
  paragraphs: 0,
  spaces: 0,
  letters: 0,
  digits: 0,
  punctuations: 0,
  readingTime: 0,
  avgWordLength: 0,
  avgSentenceLength: 0,
  letterDensity: 0,
  digitDensity: 0,
  punctuationDensity: 0,
  spaceDensity: 0,
  charFrequency: {}
})

// 监听输入文本变化，更新统计信息
watch(inputText, (newText) => {
  if (!newText.trim()) {
    statistics.value = {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
      spaces: 0,
      letters: 0,
      digits: 0,
      punctuations: 0,
      readingTime: 0,
      avgWordLength: 0,
      avgSentenceLength: 0,
      letterDensity: 0,
      digitDensity: 0,
      punctuationDensity: 0,
      spaceDensity: 0,
      charFrequency: {}
    }
    return
  }
  
  // 基础统计
  const characters = newText.length
  const charactersNoSpaces = newText.replace(/\s/g, '').length
  const words = newText.trim() ? newText.trim().split(/\s+/).length : 0
  const lines = newText.split('\n').length
  const spaces = (newText.match(/\s/g) || []).length
  
  // 句子统计（以.?!结尾）
  const sentences = (newText.match(/[^.!?]*[.!?]/g) || []).length
  
  // 段落统计（以空行分隔）
  const paragraphs = newText.split(/\n\s*\n/).filter(p => p.trim()).length
  
  // 字符类型统计
  const letters = (newText.match(/[a-zA-Z]/g) || []).length
  const digits = (newText.match(/\d/g) || []).length
  const punctuations = (newText.match(/[^\w\s]/g) || []).length
  
  // 阅读时间估算（平均阅读速度：200-250词/分钟）
  const readingTime = Math.ceil(words / 200)
  
  // 平均单词长度
  const avgWordLength = words > 0 ? (charactersNoSpaces / words).toFixed(1) : 0
  
  // 平均句子长度
  const avgSentenceLength = sentences > 0 ? (words / sentences).toFixed(1) : 0
  
  // 密度计算
  const letterDensity = characters > 0 ? (letters / characters) * 100 : 0
  const digitDensity = characters > 0 ? (digits / characters) * 100 : 0
  const punctuationDensity = characters > 0 ? (punctuations / characters) * 100 : 0
  const spaceDensity = characters > 0 ? (spaces / characters) * 100 : 0
  
  // 字符频率分析
  const charFrequency = {}
  const totalChars = characters
  
  for (let char of newText) {
    if (!charFrequency[char]) {
      charFrequency[char] = { count: 0, percentage: 0 }
    }
    charFrequency[char].count++
  }
  
  // 计算百分比
  Object.keys(charFrequency).forEach(char => {
    charFrequency[char].percentage = (charFrequency[char].count / totalChars) * 100
  })
  
  // 按频率排序
  const sortedFrequency = Object.entries(charFrequency)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10) // 只显示前10个
    .reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
  
  statistics.value = {
    characters,
    charactersNoSpaces,
    words,
    lines,
    sentences,
    paragraphs,
    spaces,
    letters,
    digits,
    punctuations,
    readingTime,
    avgWordLength,
    avgSentenceLength,
    letterDensity,
    digitDensity,
    punctuationDensity,
    spaceDensity,
    charFrequency: sortedFrequency
  }
}, { immediate: true })

// 分析文本
const analyzeText = () => {
  // 监听器会自动处理
}
</script>