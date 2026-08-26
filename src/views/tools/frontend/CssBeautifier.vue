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
      icon: '🎨',
      category: 'data',
      tags: ['css', 'scss', 'less', '美化', '格式化', '前端', '开发工具'],
      enabled: true,
      isPopular: true,
      order: 5
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

// ============ CSS 安全处理工具 ============
// 保护注释/字符串/url() 内容，防止被格式化或压缩操作破坏

// 提取并保护 CSS 中不应被修改的内容
const protectCssContent = (css) => {
  const protectedParts = []; // { text, type }
  let result = '';
  let i = 0;
  
  const placeholder = () => `\u0000${protectedParts.length}\u0000`;
  
  while (i < css.length) {
    const ch = css[i];
    
    // 注释 /* ... */
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const endIndex = end === -1 ? css.length : end + 2;
      protectedParts.push({ text: css.slice(i, endIndex), type: 'comment' });
      result += placeholder();
      i = endIndex;
      continue;
    }
    
    // 字符串 "..." 或 '...'（含转义）
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length) {
        if (css[j] === '\\') { j += 2; continue; }
        if (css[j] === ch) { j++; break; }
        j++;
      }
      protectedParts.push({ text: css.slice(i, j), type: 'string' });
      result += placeholder();
      i = j;
      continue;
    }
    
    // url(...)（可能含引号与转义）
    if (/url\(/i.test(css.slice(i, i + 4))) {
      let j = i + 4;
      let depth = 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '\\') { j += 2; continue; }
        if (css[j] === '(') depth++;
        else if (css[j] === ')') depth--;
        j++;
      }
      protectedParts.push({ text: css.slice(i, j), type: 'url' });
      result += placeholder();
      i = j;
      continue;
    }
    
    result += ch;
    i++;
  }
  
  return { protectedCss: result, protectedParts };
};

// 还原占位符
const restoreCssContent = (css, protectedParts) => {
  return css.replace(/\u0000(\d+)\u0000/g, (_, index) => {
    const part = protectedParts[parseInt(index, 10)];
    return part ? part.text : '';
  });
};

// 移除注释（作用于保护列表，返回新的占位符串）
const stripComments = (protectedCss, protectedParts) => {
  return protectedCss.replace(/\u0000(\d+)\u0000/g, (match, index) => {
    const part = protectedParts[parseInt(index, 10)];
    return part && part.type === 'comment' ? '' : match;
  });
};

// CSS美化函数
const beautifyCss = () => {
  if (!cssInput.value) return
  
  try {
    let css = cssInput.value
    
    // 保护注释/字符串/url 内容
    const { protectedCss, protectedParts } = protectCssContent(css)
    let work = protectedCss
    
    // 移除注释（如需）
    if (formatOptions.removeComments) {
      work = stripComments(work, protectedParts)
    }
    
    // 归一化空白（占位符不受影响）
    work = work.replace(/\s+/g, ' ').trim()
    
    const indent = formatOptions.indentWithSpaces 
      ? ' '.repeat(Math.max(parseInt(formatOptions.indentSize) || 2, 1))
      : '\t'
    const maxLineLength = parseInt(formatOptions.maxLineLength) || 0
    
    let result = ''
    let indentLevel = 0
    let inRule = false
    let ruleProps = [] // 当前规则内的属性（prop, value, raw）
    
    const indentStr = () => indent.repeat(indentLevel)
    
    // 按结构字符分词（/ 不再作为分隔符，避免破坏 font: 12px/1.5 等）
    const tokens = work.split(/([{};])/)
    
    // 输出属性行（可选排序、超长折行）
    const flushRuleProps = () => {
      let props = ruleProps
      if (formatOptions.sortProperties) {
        props = [...props].sort((a, b) => a.prop.localeCompare(b.prop))
      }
      props.forEach(({ raw }) => {
        let line = raw
        if (maxLineLength > 0 && line.length > maxLineLength) {
          // 在逗号后折行（选择器列表/多值），续行追加缩进
          line = line.replace(/,\s*/g, `,\n${indentStr()}    `)
        }
        result += indentStr() + line + ';\n'
      })
      ruleProps = []
    }
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue
      
      if (token === '{') {
        // 前面已输出选择器/@规则，这里补上花括号
        result = result.replace(/\s*$/, '') + ' {\n'
        indentLevel++
        inRule = true
      } else if (token === '}') {
        if (inRule) {
          flushRuleProps()
        }
        indentLevel = Math.max(0, indentLevel - 1)
        result = result.replace(/\s*$/, '')
        result += '\n' + indentStr() + '}'
        if (formatOptions.newlineBetweenRules) {
          result += '\n\n'
        }
        inRule = false
      } else if (token === ';') {
        if (inRule) {
          // 规则内分号由 flushRuleProps 处理，这里忽略空分号
        }
      } else if (inRule) {
        // 属性（可能含多个冒号，如 filter: progid:...）
        const colonIndex = token.indexOf(':')
        if (colonIndex > 0) {
          const prop = token.slice(0, colonIndex).trim()
          const value = token.slice(colonIndex + 1).trim()
          if (prop) {
            ruleProps.push({ prop: prop.toLowerCase(), raw: `${prop}: ${value}` })
            continue
          }
        }
        ruleProps.push({ prop: '', raw: token })
      } else {
        // 选择器或@规则
        result += '\n' + indentStr() + token
      }
    }
    
    // 收尾：处理未闭合的规则
    if (inRule) {
      flushRuleProps()
    }
    
    cssOutput.value = restoreCssContent(result.trim(), protectedParts)
    outputMode.value = '美化'
    
  } catch (error) {
    cssOutput.value = '美化失败：' + (error?.message || error)
    outputMode.value = ''
  }
}

// CSS压缩函数
const minifyCss = () => {
  if (!cssInput.value) return
  
  try {
    let css = cssInput.value
    
    // 保护注释/字符串/url 内容
    const { protectedCss, protectedParts } = protectCssContent(css)
    
    // 移除注释
    let work = stripComments(protectedCss, protectedParts)
    
    // 归一化空白（占位符不受影响，字符串内容不被改写）
    work = work.replace(/\s+/g, ' ')
    
    // 结构性空白压缩（字符串/url 已受保护）
    work = work.replace(/\s*{\s*/g, '{')
    work = work.replace(/\s*}\s*/g, '}')
    work = work.replace(/\s*;\s*/g, ';')
    work = work.replace(/\s*,\s*/g, ',')
    work = work.replace(/\s*:\s*/g, ':')
    work = work.replace(/\s*>\s*/g, '>')
    
    // 移除最后一个分号
    work = work.replace(/;}/g, '}')
    
    cssOutput.value = restoreCssContent(work.trim(), protectedParts)
    outputMode.value = '压缩'
    
  } catch (error) {
    cssOutput.value = '压缩失败：' + (error?.message || error)
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