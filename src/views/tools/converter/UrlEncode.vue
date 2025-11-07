<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔗</span>
        <h1 class="text-3xl md:text-4xl font-bold">URL编码/解码</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        对URL进行编码和解码处理，支持UTF-8编码格式，确保URL在网络传输中的正确性
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入</h2>
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
          
          <!-- 文本输入区域 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">请输入需要编码或解码的URL或文本</span>
            </label>
            <textarea 
              v-model="inputUrl"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="在此输入URL或文本..."
            ></textarea>
          </div>
          
          <!-- 编码选项 -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">编码方式</span>
            </label>
            <select v-model="encodingType" class="select select-bordered w-full">
              <option value="uri">完整URI编码</option>
              <option value="uriComponent">URI组件编码</option>
              <option value="form">表单编码</option>
            </select>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button 
              class="btn btn-primary" 
              @click="encodeUrl"
              :disabled="!inputUrl"
            >
              URL编码
            </button>
            <button 
              class="btn btn-secondary" 
              @click="decodeUrl"
              :disabled="!inputUrl"
            >
              URL解码
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
                @click="copyResult"
                :disabled="!outputUrl"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="swapInputOutput"
                :disabled="!outputUrl"
              >
                交换输入输出
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputUrl"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里..."
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              编码方式说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>完整URI编码：</strong>对整个URI进行编码，不编码保留字符如:/?#[]@!$&'()*+,;=</li>
                <li><strong>URI组件编码：</strong>对URI的一部分进行编码，编码更多特殊字符</li>
                <li><strong>表单编码：</strong>使用application/x-www-form-urlencoded格式，空格编码为+</li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              URL编码应用场景
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>在URL中传递包含特殊字符的参数</li>
                <li>处理包含非ASCII字符的URL</li>
                <li>防止URL注入攻击</li>
                <li>确保URL在网络传输中的正确性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUrlEncodeStore } from '@/store/modules/tools/converter/UrlEncode.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'UrlEncodePage',
  meta: {
    tool: {
      id: 'url-encode',
      name: 'URL编码/解码',
      description: '对URL进行编码和解码处理，支持UTF-8编码格式',
      icon: '🔗',
      category: 'converter',
      tags: ['url', '编码', '解码', '转换'],
      enabled: true,
      isPopular: false,
      order: 2
    }
  }
});

// 使用独立的UrlEncode store
const urlEncodeStore = useUrlEncodeStore();

// 从store中解构状态和方法
const { 
  inputUrl, 
  outputUrl, 
  encodingType,
  hasInput,
  hasOutput
} = storeToRefs(urlEncodeStore);

const { 
  encodeUrl, 
  decodeUrl, 
  loadExample, 
  clearInput, 
  copyResult, 
  swapInputOutput 
} = urlEncodeStore;
</script>