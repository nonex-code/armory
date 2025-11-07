<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📝</span>
        <h1 class="text-3xl md:text-4xl font-bold">JSON格式化</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        格式化和验证JSON数据，支持美化、压缩和语法检查
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入JSON</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost"
                @click="loadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost"
                @click="clearInput"
              >
                清空
              </button>
            </div>
          </div>
          
          <!-- JSON输入区域 -->
          <div class="form-control">
            <textarea
              v-model="inputJson"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="在此输入JSON数据..."
              @input="validateJson"
            ></textarea>
          </div>
          
          <!-- 错误信息 -->
          <div v-if="jsonError" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ jsonError }}</span>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">格式化结果</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="copyResult"
                :disabled="!outputJson"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="downloadResult"
                :disabled="!outputJson"
              >
                下载
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputJson"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="格式化结果将显示在这里"
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 控制选项 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">缩进字符</span>
            </label>
            <select v-model="indentChar" class="select select-bordered select-sm">
              <option value="2">2个空格</option>
              <option value="4">4个空格</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          
          <div class="flex gap-2 mt-6">
            <button 
              class="btn btn-primary" 
              @click="formatJson"
              :disabled="!inputJson || jsonError"
            >
              格式化
            </button>
            <button 
              class="btn btn-secondary" 
              @click="minifyJson"
              :disabled="!inputJson || jsonError"
            >
              压缩
            </button>
            <button 
              class="btn btn-info" 
              @click="validateAndFormat"
              :disabled="!inputJson"
            >
              验证并格式化
            </button>
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
              <li>在输入框中粘贴或输入JSON数据</li>
              <li>选择缩进字符类型（空格或Tab）</li>
              <li>点击"格式化"按钮美化JSON格式</li>
              <li>点击"压缩"按钮去除多余空格和换行</li>
              <li>点击"验证并格式化"自动验证并格式化JSON</li>
              <li>可以复制或下载格式化后的结果</li>
            </ol>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">JSON格式说明</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>JSON (JavaScript Object Notation) 是一种轻量级的数据交换格式</li>
              <li>它基于JavaScript语言的一个子集，但是完全独立于语言</li>
              <li>JSON使用完全独立于语言的文本格式，这些特性使JSON成为理想的数据交换语言</li>
              <li>易于人阅读和编写，同时也易于机器解析和生成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useJsonFormatterStore } from '@/store/modules/tools/converter/JsonFormatter.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'JsonFormatterPage',
  meta: {
    tool: {
      id: 'json-formatter',
      name: 'JSON格式化',
      description: '格式化和验证JSON数据，支持美化、压缩和语法检查',
      category: 'converter',
      icon: '📝',
      tags: ['json', '格式化', '美化', '压缩', '验证'],
      keywords: ['json', 'formatter', 'beautify', 'minify', 'validate', '格式化', '美化', '压缩', '验证']
    }
  }
});

// 使用独立的JsonFormatter store
const jsonFormatterStore = useJsonFormatterStore();

// 从store中解构状态和方法
const { 
  inputJson, 
  outputJson, 
  jsonError, 
  indentChar,
  hasValidInput,
  hasOutput
} = storeToRefs(jsonFormatterStore);

const { 
  validateJson, 
  formatJson, 
  minifyJson, 
  validateAndFormat, 
  loadExample, 
  clearInput, 
  copyResult, 
  downloadResult 
} = jsonFormatterStore;
</script>