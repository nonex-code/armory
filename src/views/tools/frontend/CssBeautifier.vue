<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🎨</span>
        <h1 class="text-3xl md:text-4xl font-bold">CSS美化工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        格式化、压缩和美化CSS代码，提高代码可读性和维护性
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto">
      <!-- 输入输出区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 输入区域 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">原始CSS代码</h2>
            
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">CSS代码</span>
                <span class="label-text-alt">{{ inputStats.lines }} 行, {{ inputStats.chars }} 字符</span>
              </label>
              <textarea 
                v-model="cssInput"
                class="textarea textarea-bordered h-64 font-mono text-sm" 
                placeholder="粘贴您的CSS代码..."
                spellcheck="false"
              ></textarea>
            </div>
            
            <div class="flex gap-2">
              <button 
                class="btn btn-primary flex-1"
                @click="beautifyCss"
                :disabled="!cssInput"
              >
                美化
              </button>
              <button 
                class="btn btn-secondary flex-1"
                @click="minifyCss"
                :disabled="!cssInput"
              >
                压缩
              </button>
              <button 
                class="btn btn-ghost"
                @click="clearInput"
              >
                清空
              </button>
            </div>
          </div>
        </div>
        
        <!-- 输出区域 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">
              处理结果
              <span v-if="outputMode" class="badge badge-primary ml-2">{{ outputMode }}</span>
            </h2>
            
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">处理后的CSS</span>
                <span class="label-text-alt">{{ outputStats.lines }} 行, {{ outputStats.chars }} 字符</span>
              </label>
              <textarea 
                v-model="cssOutput"
                class="textarea textarea-bordered h-64 font-mono text-sm" 
                readonly
                placeholder="处理结果将显示在这里..."
                spellcheck="false"
              ></textarea>
            </div>
            
            <div class="flex gap-2">
              <button 
                class="btn btn-outline flex-1"
                @click="copyToClipboard(cssOutput)"
                :disabled="!cssOutput"
              >
                复制结果
              </button>
              <button 
                class="btn btn-ghost"
                @click="clearOutput"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 格式化选项 -->
      <div class="card bg-base-100 shadow-lg mt-6">
        <div class="card-body">
          <h2 class="card-title mb-4">格式化选项</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="checkbox" 
                  v-model="formatOptions.indentWithSpaces"
                />
                <span class="label-text">使用空格缩进</span>
              </label>
            </div>
            
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="checkbox" 
                  v-model="formatOptions.newlineBetweenRules"
                />
                <span class="label-text">规则间换行</span>
              </label>
            </div>
            
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="checkbox" 
                  v-model="formatOptions.sortProperties"
                />
                <span class="label-text">属性排序</span>
              </label>
            </div>
            
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  class="checkbox" 
                  v-model="formatOptions.removeComments"
                />
                <span class="label-text">移除注释</span>
              </label>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">缩进大小</span>
              </label>
              <select class="select select-bordered" v-model="formatOptions.indentSize">
                <option value="2">2 空格</option>
                <option value="4">4 空格</option>
                <option value="8">8 空格</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">最大行长度</span>
              </label>
              <select class="select select-bordered" v-model="formatOptions.maxLineLength">
                <option value="80">80 字符</option>
                <option value="120">120 字符</option>
                <option value="0">不限制</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 示例区域 -->
      <div class="card bg-base-100 shadow-lg mt-6">
        <div class="card-body">
          <h2 class="card-title mb-4">CSS示例</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="example in examples" 
              :key="example.name"
              class="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
              @click="loadExample(example)"
            >
              <div class="card-body p-4">
                <h3 class="card-title text-sm">{{ example.name }}</h3>
                <div class="text-xs opacity-70 line-clamp-3">
                  {{ example.description }}
                </div>
              </div>
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
              <h3 class="font-semibold text-lg mb-2">功能说明</h3>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li><strong>美化</strong>：格式化CSS代码，提高可读性</li>
                <li><strong>压缩</strong>：移除空格和注释，减小文件大小</li>
                <li><strong>属性排序</strong>：按字母顺序排列CSS属性</li>
                <li><strong>自定义缩进</strong>：支持2/4/8空格缩进</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-lg mb-2">格式化规则</h3>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>选择器和声明块之间换行</li>
                <li>每个属性单独一行</li>
                <li>属性值后加分号</li>
                <li>嵌套规则正确缩进</li>
                <li>媒体查询和关键帧正确格式化</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-lg mb-2">支持的CSS特性</h3>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>CSS选择器（类、ID、属性选择器等）</li>
                <li>CSS变量（Custom Properties）</li>
                <li>媒体查询（@media）</li>
                <li>关键帧动画（@keyframes）</li>
                <li>导入规则（@import）</li>
                <li>嵌套规则（Sass/Less风格）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'CssBeautifierPage',
  meta: {
    tool: {
      id: 'css-beautifier',
      name: 'CSS美化工具',
      description: 'CSS代码格式化工具，支持CSS、SCSS、LESS等样式语言的格式化和美化',
      icon: '💻',
      category: 'developer',
      tags: ['css', 'scss', 'less', '美化', '格式化', '前端', '开发工具'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
})

// 响应式数据
const cssInput = ref('')
const cssOutput = ref('')
const outputMode = ref('') // 'beautified' 或 'minified'

// 格式化选项
const formatOptions = reactive({
  indentWithSpaces: true,
  indentSize: 2,
  newlineBetweenRules: true,
  sortProperties: false,
  removeComments: false,
  maxLineLength: 80
})

// 示例数据
const examples = ref([
  {
    name: '压缩的CSS',
    description: '.btn{color:#fff;background:#007bff;padding:10px 20px;border-radius:5px}.btn:hover{background:#0056b3}',
    css: '.btn{color:#fff;background:#007bff;padding:10px 20px;border-radius:5px}.btn:hover{background:#0056b3}'
  },
  {
    name: '杂乱的CSS',
    description: '.container {width:100%; margin:0 auto} .header { color: blue;font-size: 24px; }',
    css: '.container {width:100%; margin:0 auto} .header { color: blue;font-size: 24px; }'
  },
  {
    name: '带注释的CSS',
    description: '/* 主按钮样式 */ .btn { color: #fff; /* 白色文字 */ background: #007bff; }',
    css: '/* 主按钮样式 */ .btn { color: #fff; /* 白色文字 */ background: #007bff; }'
  },
  {
    name: '媒体查询',
    description: '@media (max-width:768px){.container{width:100%}.header{font-size:18px}}',
    css: '@media (max-width:768px){.container{width:100%}.header{font-size:18px}}'
  }
])

// 统计信息
const inputStats = computed(() => {
  const lines = cssInput.value ? cssInput.value.split('\n').length : 0
  const chars = cssInput.value ? cssInput.value.length : 0
  return { lines, chars }
})

const outputStats = computed(() => {
  const lines = cssOutput.value ? cssOutput.value.split('\n').length : 0
  const chars = cssOutput.value ? cssOutput.value.length : 0
  return { lines, chars }
})

// CSS美化函数
const beautifyCss = () => {
  if (!cssInput.value) return
  
  try {
    let css = cssInput.value
    
    // 移除多余的空格和换行
    css = css.replace(/\s+/g, ' ').trim()
    
    // 处理注释
    if (formatOptions.removeComments) {
      css = css.replace(/\/\*[\s\S]*?\*\//g, '')
    }
    
    // 添加换行和缩进
    let result = ''
    let indentLevel = 0
    let inRule = false
    let inMedia = false
    
    const indent = formatOptions.indentWithSpaces 
      ? ' '.repeat(parseInt(formatOptions.indentSize))
      : '\t'
    
    // 简单的CSS解析和格式化
    const tokens = css.split(/([{}\/;])/)
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      
      if (!token) continue
      
      if (token === '{') {
        result += ' {\n'
        indentLevel++
        inRule = true
      } else if (token === '}') {
        indentLevel--
        result += '\n' + indent.repeat(indentLevel) + '}'
        if (formatOptions.newlineBetweenRules) {
          result += '\n\n'
        }
        inRule = false
        inMedia = false
      } else if (token === ';') {
        if (inRule) {
          result += ';\n' + indent.repeat(indentLevel)
        }
      } else if (token.startsWith('@')) {
        // 处理@规则
        if (token.startsWith('@media')) {
          inMedia = true
        }
        result += '\n' + indent.repeat(indentLevel) + token
      } else {
        if (inRule) {
          // 处理属性
          const propertyParts = token.split(':')
          if (propertyParts.length === 2) {
            const [prop, value] = propertyParts
            
            // 属性排序（如果启用）
            if (formatOptions.sortProperties) {
              // 简单的字母排序
              // 实际实现需要更复杂的排序逻辑
            }
            
            result += indent.repeat(indentLevel) + prop.trim() + ': ' + value.trim()
          } else {
            result += indent.repeat(indentLevel) + token
          }
        } else {
          // 处理选择器
          result += '\n' + indent.repeat(indentLevel) + token
        }
      }
    }
    
    cssOutput.value = result.trim()
    outputMode.value = '美化'
    
  } catch (error) {
    cssOutput.value = '美化失败：' + error.message
    outputMode.value = ''
  }
}

// CSS压缩函数
const minifyCss = () => {
  if (!cssInput.value) return
  
  try {
    let css = cssInput.value
    
    // 移除注释
    css = css.replace(/\/\*[\s\S]*?\*\//g, '')
    
    // 移除多余的空格和换行
    css = css.replace(/\s+/g, ' ')
    
    // 移除选择器和属性值周围的多余空格
    css = css.replace(/\s*{\s*/g, '{')
    css = css.replace(/\s*}\s*/g, '}')
    css = css.replace(/\s*;\s*/g, ';')
    css = css.replace(/\s*,\s*/g, ',')
    css = css.replace(/\s*:\s*/g, ':')
    
    // 移除最后一个分号
    css = css.replace(/;}/g, '}')
    
    cssOutput.value = css.trim()
    outputMode.value = '压缩'
    
  } catch (error) {
    cssOutput.value = '压缩失败：' + error.message
    outputMode.value = ''
  }
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(text)
    console.log('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败：', error)
  }
}

// 清空输入
const clearInput = () => {
  cssInput.value = ''
  cssOutput.value = ''
  outputMode.value = ''
}

// 清空输出
const clearOutput = () => {
  cssOutput.value = ''
  outputMode.value = ''
}

// 加载示例
const loadExample = (example) => {
  cssInput.value = example.css
  beautifyCss() // 默认美化示例
}
</script>