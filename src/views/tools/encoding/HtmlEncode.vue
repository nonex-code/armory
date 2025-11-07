<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🌐</span>
        <h1 class="text-3xl md:text-4xl font-bold">HTML实体编码</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        将文本转换为HTML实体编码，用于在HTML中安全显示特殊字符
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
              <span class="label-text">请输入需要编码的文本</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="请输入需要编码的文本..."
            ></textarea>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button 
              class="btn btn-primary" 
              @click="encodeHtml"
              :disabled="!canEncode"
            >
              编码
            </button>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输出</h2>
            <button 
              class="btn btn-sm btn-ghost" 
              @click="copyResult"
              :disabled="!hasOutput"
            >
              复制结果
            </button>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="编码结果将显示在这里..."
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
              HTML实体编码介绍
            </div>
            <div class="collapse-content"> 
              <p class="mb-2">HTML实体编码是一种将特殊字符转换为HTML实体的方法，用于在HTML中显示特殊字符。</p>
              <p class="mb-2">常见HTML实体：</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>&lt; → &amp;lt;</li>
                <li>&gt; → &amp;gt;</li>
                <li>&amp; → &amp;amp;</li>
                <li>" → &amp;quot;</li>
                <li>' → &amp;apos;</li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              使用场景
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>在HTML中显示特殊字符</li>
                <li>防止XSS攻击</li>
                <li>在代码示例中显示HTML标签</li>
                <li>在表单中显示用户输入的特殊字符</li>
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
import { useHtmlEncodeStore } from '@/store/modules/tools/encoding/HtmlEncode';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'HtmlEncodePage',
  meta: {
    tool: {
      id: 'html-encode',
      name: 'HTML实体编码',
      description: '将文本转换为HTML实体编码，用于在HTML中安全显示特殊字符',
      category: 'encoding',
      icon: 'code-bracket',
      tags: ['HTML', '实体编码', 'XSS防护', '特殊字符'],
      keywords: ['html', 'encode', 'entity', 'xss', 'html实体编码', '特殊字符']
    }
  }
});

// 使用store
const store = useHtmlEncodeStore();
const {
  inputText,
  outputText,
  hasInput,
  hasOutput,
  canEncode
} = storeToRefs(store);

const {
  encodeHtml,
  loadExample,
  clearInput,
  copyResult
} = store;
</script>