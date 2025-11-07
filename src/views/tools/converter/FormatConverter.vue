<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔀</span>
        <h1 class="text-3xl md:text-4xl font-bold">格式化工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持多种数据格式的格式化和美化，包括JSON、XML和SQL，提供语法高亮和错误检查
      </p>
    </div>

    <!-- 格式类型选择 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl">选择格式类型</h2>
        <div class="tabs tabs-boxed w-full">
          <a 
            v-for="tab in formatTabs" 
            :key="tab.id"
            class="tab flex-1" 
            :class="{ 'tab-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </a>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入</h2>
            <div class="badge badge-outline">{{ activeTabName }}</div>
          </div>
          
          <!-- 文本输入区域 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">请输入要{{ isFormatMode ? '格式化' : '压缩' }}的{{ activeTabName }}内容</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              :placeholder="inputPlaceholder"
            ></textarea>
          </div>
          
          <!-- 格式化选项 -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">选项</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm mr-2"
                  v-model="isFormatMode"
                />
                <span class="label-text">{{ isFormatMode ? '格式化' : '压缩' }}</span>
              </label>
              
              <label v-if="activeTab === 'json'" class="cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm mr-2"
                  v-model="sortKeys"
                />
                <span class="label-text">排序键</span>
              </label>
              
              <label v-if="activeTab === 'sql'" class="cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm mr-2"
                  v-model="uppercaseKeywords"
                />
                <span class="label-text">关键字大写</span>
              </label>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="clearInput">清空</button>
            <button 
              class="btn btn-primary" 
              @click="processText"
              :disabled="!inputText || processing"
              :class="{ 'loading': processing }"
            >
              {{ isFormatMode ? '格式化' : '压缩' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输出</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="copyOutput"
                :disabled="!outputText"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="downloadOutput"
                :disabled="!outputText"
              >
                下载
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里"
              readonly
            ></textarea>
          </div>
          
          <!-- 错误信息 -->
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">格式化说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              JSON 格式化
            </div>
            <div class="collapse-content"> 
              <p>JSON (JavaScript Object Notation) 是一种轻量级的数据交换格式。格式化后的JSON具有清晰的缩进和换行，便于阅读和调试。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>美化JSON结构，添加缩进</li>
                  <li>语法验证和错误提示</li>
                  <li>支持键排序</li>
                  <li>压缩JSON，移除空格</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              XML 格式化
            </div>
            <div class="collapse-content"> 
              <p>XML (eXtensible Markup Language) 是一种标记语言，用于存储和传输数据。格式化后的XML具有清晰的层级结构。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>美化XML结构，添加缩进</li>
                  <li>保持属性和内容的完整性</li>
                  <li>处理CDATA和注释</li>
                  <li>压缩XML，移除多余空格</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              SQL 格式化
            </div>
            <div class="collapse-content"> 
              <p>SQL (Structured Query Language) 是用于管理关系数据库的语言。格式化后的SQL具有清晰的语句结构和关键字高亮。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>美化SQL语句，添加缩进</li>
                  <li>关键字大小写转换</li>
                  <li>对齐列表和条件</li>
                  <li>压缩SQL，移除多余空格</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="font-bold mb-2">使用场景：</h3>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li>美化和格式化配置文件</li>
            <li>调试和阅读API响应数据</li>
            <li>代码审查和文档编写</li>
            <li>数据交换和传输前的格式准备</li>
            <li>减少文件大小，提高传输效率</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useFormatConverterStore } from '@/store/modules/tools/converter/FormatConverter.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'FormatConverterPage',
  meta: {
    tool: {
      id: 'format-converter',
      name: '格式转换器',
      description: '支持多种数据格式之间的转换，包括JSON、XML、YAML、CSV等格式',
      icon: '📊',
      category: 'data',
      tags: ['json', 'xml', 'yaml', 'csv', '格式', '转换', '数据处理'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用独立的store
const formatConverterStore = useFormatConverterStore();
const { 
  activeTab,
  isFormatMode,
  sortKeys,
  uppercaseKeywords,
  inputText,
  outputText,
  processing,
  errorMessage,
  formatTabs,
  activeTabName,
  inputPlaceholder,
  hasInput,
  hasOutput,
  canProcess
} = storeToRefs(formatConverterStore);

const { 
  processText,
  clearInput,
  copyOutput,
  downloadOutput
} = formatConverterStore;
</script>