<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔀</span>
        <h1 class="text-3xl md:text-4xl font-bold">通用格式转换器</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持文本大小写转换、空格处理、编码转换等通用格式处理功能
      </p>
    </div>

    <!-- 转换类型选择 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl">选择转换类型</h2>
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
              <span class="label-text">请输入要转换的{{ activeTabName }}内容</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              :placeholder="inputPlaceholder"
            ></textarea>
          </div>
          
          <!-- 转换选项 -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">转换选项</span>
            </label>
            <div class="flex flex-wrap gap-4">
              <!-- 大小写转换选项 -->
              <div v-if="activeTab === 'case'" class="flex flex-col gap-2">
                <label class="cursor-pointer">
                  <input 
                    type="radio" 
                    class="radio radio-sm mr-2"
                    value="lower"
                    v-model="caseOptions.targetCase"
                  />
                  <span class="label-text">小写</span>
                </label>
                <label class="cursor-pointer">
                  <input 
                    type="radio" 
                    class="radio radio-sm mr-2"
                    value="upper"
                    v-model="caseOptions.targetCase"
                  />
                  <span class="label-text">大写</span>
                </label>
                <label class="cursor-pointer">
                  <input 
                    type="radio" 
                    class="radio radio-sm mr-2"
                    value="title"
                    v-model="caseOptions.targetCase"
                  />
                  <span class="label-text">标题格式</span>
                </label>
                <label class="cursor-pointer">
                  <input 
                    type="radio" 
                    class="radio radio-sm mr-2"
                    value="sentence"
                    v-model="caseOptions.targetCase"
                  />
                  <span class="label-text">句子格式</span>
                </label>
              </div>
              
              <!-- 空格处理选项 -->
              <div v-if="activeTab === 'whitespace'" class="flex flex-col gap-2">
                <label class="cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm mr-2"
                    v-model="whitespaceOptions.trim"
                  />
                  <span class="label-text">去除首尾空格</span>
                </label>
                <label class="cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm mr-2"
                    v-model="whitespaceOptions.normalize"
                  />
                  <span class="label-text">标准化换行符</span>
                </label>
                <label class="cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm mr-2"
                    v-model="whitespaceOptions.removeExtraSpaces"
                  />
                  <span class="label-text">移除多余空格</span>
                </label>
              </div>
              
              <!-- 编码转换选项 -->
              <div v-if="activeTab === 'encoding'" class="flex flex-col gap-2">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">源编码</span>
                  </label>
                  <select v-model="encodingOptions.sourceEncoding" class="select select-bordered select-sm">
                    <option value="utf8">UTF-8</option>
                    <option value="base64">Base64</option>
                    <option value="url">URL编码</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">目标编码</span>
                  </label>
                  <select v-model="encodingOptions.targetEncoding" class="select select-bordered select-sm">
                    <option value="utf8">UTF-8</option>
                    <option value="base64">Base64</option>
                    <option value="url">URL编码</option>
                  </select>
                </div>
              </div>
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
              转换
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
        <h2 class="card-title">通用格式转换说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              大小写转换
            </div>
            <div class="collapse-content"> 
              <p>文本大小写转换工具支持多种大小写格式的转换，便于统一文本格式。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>小写转换：将所有字母转换为小写</li>
                  <li>大写转换：将所有字母转换为大写</li>
                  <li>标题格式：每个单词首字母大写</li>
                  <li>句子格式：每个句子首字母大写</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              空格处理
            </div>
            <div class="collapse-content"> 
              <p>空格处理工具可以清理和标准化文本中的空白字符，提高文本质量。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>去除首尾空格：移除文本开头和结尾的空白</li>
                  <li>标准化换行符：统一不同系统的换行符格式</li>
                  <li>移除多余空格：将连续多个空格合并为一个</li>
                  <li>提高文本可读性</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              编码转换
            </div>
            <div class="collapse-content"> 
              <p>编码转换工具支持不同字符编码格式之间的转换，便于数据交换和处理。</p>
              <div class="mt-2">
                <strong>功能特点：</strong>
                <ul class="list-disc list-inside mt-1 text-sm">
                  <li>UTF-8编码：标准Unicode编码格式</li>
                  <li>Base64编码：二进制数据文本化编码</li>
                  <li>URL编码：URL安全字符编码</li>
                  <li>支持双向转换</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="font-bold mb-2">使用场景：</h3>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li>统一文档格式和大小写规范</li>
            <li>清理从不同来源复制的文本内容</li>
            <li>数据预处理和标准化</li>
            <li>代码和配置文件的格式统一</li>
            <li>提高文本质量和可读性</li>
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
  inputText,
  outputText,
  processing,
  errorMessage,
  formatTabs,
  caseOptions,
  whitespaceOptions,
  encodingOptions,
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