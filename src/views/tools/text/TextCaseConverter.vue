<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔤</span>
        <h1 class="text-3xl md:text-4xl font-bold">大小写转换</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        将文本转换为不同的大小写格式，支持大写、小写、首字母大写等
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
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-sm btn-ghost">加载示例</div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li v-for="(example, index) in examples" :key="index">
                    <a @click="loadExampleItem(example)">{{ example.name }}</a>
                  </li>
                </ul>
              </div>
              <button 
                class="btn btn-sm btn-ghost"
                @click="clearInput"
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
              placeholder="在此输入需要转换的文本..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">转换结果</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="copyResult"
                :disabled="!hasOutput"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="swapInputOutput"
                :disabled="!hasOutput"
              >
                交换
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="转换结果将显示在这里"
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 转换选项 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">转换选项</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 大写转换 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">大写</span>
              <input 
                type="radio" 
                name="caseType" 
                value="uppercase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 小写转换 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">小写</span>
              <input 
                type="radio" 
                name="caseType" 
                value="lowercase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 首字母大写 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">首字母大写</span>
              <input 
                type="radio" 
                name="caseType" 
                value="capitalcase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 标题格式 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">标题格式</span>
              <input 
                type="radio" 
                name="caseType" 
                value="titlecase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 驼峰命名 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">驼峰命名</span>
              <input 
                type="radio" 
                name="caseType" 
                value="camelcase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 蛇形命名 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">蛇形命名</span>
              <input 
                type="radio" 
                name="caseType" 
                value="snakecase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 烤肉串命名 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">烤肉串命名</span>
              <input 
                type="radio" 
                name="caseType" 
                value="kebabcase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
          
          <!-- 句子格式 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">句子格式</span>
              <input 
                type="radio" 
                name="caseType" 
                value="sentencecase" 
                v-model="conversionType" 
                class="radio radio-primary"
              />
            </label>
          </div>
        </div>
        
        <!-- 额外选项 -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">保留空白字符</span>
              <input 
                type="checkbox" 
                v-model="preserveWhitespace" 
                class="checkbox checkbox-primary"
              />
            </label>
          </div>
          
          <div class="form-control">
            <div class="label">
              <span class="label-text">转换实时生效</span>
            </div>
            <span class="text-xs text-base-content/60">输入或选择转换类型后自动更新结果</span>
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
            <h3 class="font-semibold text-lg mb-2">使用方法</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>在输入框中粘贴或输入需要转换的文本</li>
              <li>选择需要的大小写转换类型</li>
              <li>转换结果会实时更新</li>
              <li>可以复制或交换输入输出内容</li>
            </ol>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">转换类型说明</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li><strong>大写</strong>：将所有字母转换为大写</li>
              <li><strong>小写</strong>：将所有字母转换为小写</li>
              <li><strong>首字母大写</strong>：每个单词的首字母大写</li>
              <li><strong>标题格式</strong>：每个单词的首字母大写，忽略冠词和介词</li>
              <li><strong>驼峰命名</strong>：camelCase格式，第一个单词小写，后续单词首字母大写</li>
              <li><strong>蛇形命名</strong>：snake_case格式，单词间用下划线连接</li>
              <li><strong>烤肉串命名</strong>：kebab-case格式，单词间用连字符连接</li>
              <li><strong>句子格式</strong>：仅第一个单词的首字母大写</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useTextCaseConverterStore } from '@/store/modules/tools/text/TextCaseConverter';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'TextCaseConverterPage',
  meta: {
    tool: {
      id: 'text-case-converter',
      name: '文本大小写转换器',
      description: '文本大小写转换工具，支持大写、小写、首字母大写、驼峰命名等多种格式转换',
      icon: '📝',
      category: 'text',
      tags: ['文本', '大小写', '转换', '驼峰', '命名', '文本编辑'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
})

// 使用store
const textCaseConverterStore = useTextCaseConverterStore();

// 从store中解构状态和方法
const {
  inputText,
  outputText,
  conversionType,
  preserveWhitespace,
  trimWhitespace,
  hasInput,
  hasOutput,
  canConvert,
  inputStats,
  outputStats
} = storeToRefs(textCaseConverterStore);

const {
  convertCase,
  copyResult,
  clearInput,
  clearOutput,
  loadExample,
  swapInputOutput
} = textCaseConverterStore;

// 示例数据
const examples = ref([
  { name: 'Hello World', text: 'Hello World' },
  { name: 'user name example', text: 'user name example' },
  { name: 'first_name_last_name', text: 'first_name_last_name' },
  { name: 'HTML Parser Tool', text: 'HTML Parser Tool' }
])

// 加载示例
const loadExampleItem = (example) => {
  inputText.value = example.text
  convertCase()
}

// 监听输入变化，自动转换
watch(inputText, (newVal) => {
  if (newVal) {
    convertCase()
  } else {
    outputText.value = ''
  }
})

// 监听转换类型变化，自动转换
watch(conversionType, () => {
  if (inputText.value) {
    convertCase()
  }
})
</script>