<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔄</span>
        <h1 class="text-3xl md:text-4xl font-bold">编解码工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持多种编码格式的编码和解码，包括Base64、Base32、URL编码和HTML实体编码
      </p>
    </div>

    <!-- 编解码类型选择 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl">选择编码类型</h2>
        <div class="tabs tabs-boxed w-full">
          <a 
            v-for="tab in encodingTabs" 
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
              <span class="label-text">请输入要{{ isEncodeMode ? '编码' : '解码' }}的内容</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full" 
              :placeholder="inputPlaceholder"
            ></textarea>
          </div>
          
          <!-- 编码/解码模式切换 -->
          <div class="form-control mt-4">
            <label class="label cursor-pointer">
              <span class="label-text">模式</span>
              <div class="flex items-center">
                <span class="mr-2">解码</span>
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary"
                  v-model="isEncodeMode"
                />
                <span class="ml-2">编码</span>
              </div>
            </label>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="clearInput">清空</button>
            <button 
              class="btn btn-primary" 
              @click="processText"
              :disabled="!canProcess"
              :class="{ 'loading': processing }"
            >
              {{ isEncodeMode ? '编码' : '解码' }}
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
                :disabled="!hasOutput"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="downloadOutput"
                :disabled="!hasOutput"
              >
                下载
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full" 
              placeholder="处理结果将显示在这里"
              readonly
            ></textarea>
          </div>
          
          <!-- 错误信息 -->
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <BaseIcon name="exclamation-circle" custom-class="stroke-current shrink-0 h-6 w-6" />
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            Base64 编码/解码
          </div>
          <div class="collapse-content"> 
            <p>Base64是一种基于64个可打印字符来表示二进制数据的编码方法。常用于在处理文本数据的场合，表示、传输、存储一些二进制数据。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>在HTML/CSS中嵌入小图片</li>
                <li>在URL中传递二进制数据</li>
                <li>电子邮件附件编码</li>
                <li>简单的数据混淆</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="collapse collapse-arrow bg-base-200 mt-2">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            Base32 编码/解码
          </div>
          <div class="collapse-content"> 
            <p>Base32是一种使用32个可打印字符（A-Z和2-7）来表示二进制数据的编码方法。相比Base64，Base32编码结果更长但更易于人工阅读和输入。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>需要人工输入的编码场景</li>
                <li>避免大小写敏感的场合</li>
                <li>某些特定系统的兼容性要求</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="collapse collapse-arrow bg-base-200 mt-2">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            URL 编码/解码
          </div>
          <div class="collapse-content"> 
            <p>URL编码（百分号编码）是一种统一资源定位器（URL）的编码机制。URL只能使用ASCII字符集来通过因特网进行发送，因此其他字符（如中文、特殊符号）都必须转换为有效的ASCII格式。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>在URL中传递参数</li>
                <li>处理包含特殊字符的URL</li>
                <li>确保URL在各种环境下的正确传输</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="collapse collapse-arrow bg-base-200 mt-2">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            HTML 实体编码/解码
          </div>
          <div class="collapse-content"> 
            <p>HTML实体编码是将HTML中的特殊字符转换为实体表示的过程，以避免这些字符被浏览器解析为HTML标签或特殊含义。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>在HTML中显示特殊字符</li>
                <li>防止XSS攻击</li>
                <li>在代码示例中显示HTML标签</li>
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
import { useEncodingConverterStore } from '@/store/modules/tools/encoding/EncodingConverter';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'EncodingConverterPage',
  meta: {
    tool: {
      id: 'encoding-converter',
      name: '编解码工具',
      description: '支持多种编码格式的编码和解码，包括Base64、Base32、URL编码和HTML实体编码',
      icon: '🔤',
      category: 'encoding',
      tags: ['base64', 'base32', 'url', 'html', '编码', '解码', '转换'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用store
const store = useEncodingConverterStore();
const {
  activeTab,
  isEncodeMode,
  inputText,
  outputText,
  processing,
  errorMessage,
  encodingTabs,
  activeTabName,
  inputPlaceholder,
  hasInput,
  hasOutput,
  canProcess,
  hasError
} = storeToRefs(store);

const {
  processText,
  clearInput,
  copyOutput,
  downloadOutput
} = store;
</script>