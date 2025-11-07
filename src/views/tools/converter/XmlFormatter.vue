<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📄</span>
        <h1 class="text-3xl md:text-4xl font-bold">XML格式化</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        格式化和验证XML数据，使其更易读和维护
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入XML数据</h2>
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
          
          <!-- XML输入区域 -->
          <div class="form-control">
            <textarea
              v-model="inputXml"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="请输入需要格式化的XML数据..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">格式化结果</h2>
            <button 
              class="btn btn-sm btn-primary" 
              @click="copyResult"
              :disabled="!hasOutput"
            >
              复制结果
            </button>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputXml"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm bg-base-200" 
              placeholder="格式化结果将显示在这里..."
              readonly
            ></textarea>
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
            <label class="label cursor-pointer">
              <span class="label-text">缩进</span>
              <input type="checkbox" v-model="options.indent" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">自闭合标签</span>
              <input type="checkbox" v-model="options.selfClosing" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">属性换行</span>
              <input type="checkbox" v-model="options.attributesBreak" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">移除注释</span>
              <input type="checkbox" v-model="options.removeComments" class="checkbox checkbox-primary" />
            </label>
          </div>
        </div>
        
        <!-- 缩进大小 -->
        <div class="form-control mt-4 max-w-xs">
          <label class="label">
            <span class="label-text">缩进大小</span>
          </label>
          <select v-model="options.indentSize" class="select select-bordered">
            <option value="2">2个空格</option>
            <option value="4">4个空格</option>
            <option value="8">8个空格</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-center gap-2 mt-6">
          <button 
            class="btn btn-primary" 
            @click="formatXml"
            :disabled="!hasInput"
          >
            格式化
          </button>
          <button 
            class="btn btn-secondary" 
            @click="compressXml"
            :disabled="!hasInput"
          >
            压缩
          </button>
          <button 
            class="btn btn-accent" 
            @click="validateXml"
            :disabled="!hasInput"
          >
            验证
          </button>
        </div>
      </div>
    </div>
    
    <!-- 验证结果 -->
    <div v-if="validationResult" class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">验证结果</h2>
        <div class="alert" :class="validationResult.isValid ? 'alert-success' : 'alert-error'">
          <div>
            <h3 class="font-bold">{{ validationResult.isValid ? 'XML格式正确' : 'XML格式错误' }}</h3>
            <div class="text-sm">{{ validationResult.message }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            使用说明
          </div>
          <div class="collapse-content"> 
            <div class="space-y-2">
              <p>XML格式化工具可以帮助您美化和验证XML数据，使其更易读和维护。</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>在输入框中输入需要格式化的XML数据</li>
                <li>根据需要选择格式化选项</li>
                <li>点击"格式化"按钮进行格式化，或点击"压缩"按钮压缩XML</li>
                <li>点击"验证"按钮检查XML格式是否正确</li>
                <li>格式化结果将显示在下方的输出框中</li>
                <li>可以点击"复制结果"按钮复制格式化后的XML</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useXmlFormatterStore } from '@/store/modules/tools/converter/XmlFormatter.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'XmlFormatterPage',
  meta: {
    tool: {
      id: 'xml-formatter',
      name: 'XML格式化工具',
      description: 'XML格式化和美化工具，支持XML代码的缩进、语法高亮和验证',
      icon: '📊',
      category: 'data',
      tags: ['xml', '格式化', '美化', '缩进', '验证', '数据处理'],
      enabled: true,
      isPopular: true,
      order: 2
    }
  }
});

// 使用独立的store
const xmlFormatterStore = useXmlFormatterStore();
const { 
  inputXml, 
  outputXml, 
  validationResult, 
  options,
  hasInput,
  hasOutput,
  hasValidationResult
} = storeToRefs(xmlFormatterStore);

const { 
  loadExample, 
  clearInput, 
  formatXml, 
  compressXml, 
  validateXml, 
  copyResult
} = xmlFormatterStore;
</script>