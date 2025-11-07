<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📋</span>
        <h1 class="text-3xl md:text-4xl font-bold">CSV转JSON</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        将CSV格式的数据转换为JSON格式，方便在Web应用中使用
      </p>
    </div>

    <!-- 输入区域 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">CSV数据</h2>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">输入CSV数据</span>
          </label>
          <textarea
            v-model="inputCsv"
            placeholder="请输入CSV数据..."
            class="textarea textarea-bordered h-32 w-full"
          ></textarea>
        </div>
        
        <!-- 分隔符选择 -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">分隔符</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <label class="label cursor-pointer">
              <input type="radio" v-model="delimiter" value="," class="radio radio-primary" />
              <span class="label-text ml-2">逗号 (,)</span>
            </label>
            <label class="label cursor-pointer">
              <input type="radio" v-model="delimiter" value=";" class="radio radio-primary" />
              <span class="label-text ml-2">分号 (;)</span>
            </label>
            <label class="label cursor-pointer">
              <input type="radio" v-model="delimiter" value="\t" class="radio radio-primary" />
              <span class="label-text ml-2">制表符 (\t)</span>
            </label>
            <label class="label cursor-pointer">
              <input type="radio" v-model="delimiter" value="|" class="radio radio-primary" />
              <span class="label-text ml-2">竖线 (|)</span>
            </label>
          </div>
        </div>
        
        <!-- 选项 -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">选项</span>
          </label>
          <div class="flex flex-wrap gap-4">
            <label class="label cursor-pointer">
              <input type="checkbox" v-model="hasHeader" class="checkbox checkbox-primary" />
              <span class="label-text ml-2">第一行是标题</span>
            </label>
            <label class="label cursor-pointer">
              <input type="checkbox" v-model="trimValues" class="checkbox checkbox-primary" />
              <span class="label-text ml-2">去除值两端空格</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">上传CSV文件</h2>
        <div class="form-control">
          <input
            type="file"
            @change="handleFileUpload"
            accept=".csv,.txt"
            class="file-input file-input-bordered file-input-primary w-full"
          />
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions justify-center mb-6">
      <button
        @click="convertToJson"
        class="btn btn-primary"
        :disabled="!inputCsv"
      >
        转换为JSON
      </button>
      <button
        @click="loadExample"
        class="btn btn-ghost"
      >
        加载示例
      </button>
      <button
        @click="clearAll"
        class="btn btn-ghost"
      >
        清空
      </button>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <div class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div v-if="outputJson" class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">JSON结果</h2>
          <div class="flex gap-2">
            <button
              @click="copyToClipboard(outputJson)"
              class="btn btn-sm btn-ghost"
            >
              复制结果
            </button>
            <button
              @click="downloadJson"
              class="btn btn-sm btn-ghost"
            >
              下载文件
            </button>
          </div>
        </div>
        
        <div class="form-control">
          <textarea
            v-model="outputJson"
            class="textarea textarea-bordered h-64 w-full font-mono text-sm"
            readonly
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-2">
          <p>CSV转JSON工具可以将CSV格式的数据转换为JSON格式，方便在Web应用中使用。</p>
          <p>使用方法：</p>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            <li>直接在文本框中输入CSV数据，或上传CSV文件</li>
            <li>选择正确的分隔符（默认为逗号）</li>
            <li>如果第一行是标题，请勾选"第一行是标题"选项</li>
            <li>点击"转换为JSON"按钮进行转换</li>
          </ol>
          <p>注意事项：</p>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            <li>确保CSV数据格式正确，每行字段数量一致</li>
            <li>如果数据中包含分隔符，请使用引号包围该字段</li>
            <li>转换后的JSON将保持原始数据的类型（数字、布尔值等）</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useCsvToJsonStore } from '@/store/modules/tools/converter/CsvToJson.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'CsvToJsonPage',
  meta: {
    tool: {
      id: 'csv-json',
      name: 'CSV转JSON',
      description: '将CSV格式的数据转换为JSON格式，方便在Web应用中使用',
      category: 'converter',
      icon: '📋',
      tags: ['csv', 'json', '转换', '数据'],
      keywords: ['csv', 'json', 'converter', 'data', '转换', '数据']
    }
  }
});

// 使用独立的store
const csvToJsonStore = useCsvToJsonStore();
const { 
  inputCsv, 
  outputJson, 
  errorMessage, 
  delimiter, 
  hasHeader, 
  trimValues,
  hasInput,
  hasOutput,
  hasError
} = storeToRefs(csvToJsonStore);

const { 
  convertToJson,
  handleFileUpload,
  loadExample,
  clearAll,
  copyToClipboard,
  downloadJson
} = csvToJsonStore;
</script>