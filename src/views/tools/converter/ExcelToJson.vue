<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📊</span>
        <h1 class="text-3xl md:text-4xl font-bold">Excel转JSON</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        将Excel文件中的数据转换为JSON格式，方便在Web应用中使用
      </p>
    </div>

    <!-- 文件上传区域 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">选择Excel文件</h2>
        
        <div class="form-control">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".xlsx,.xls"
            class="file-input file-input-bordered file-input-primary w-full"
          />
        </div>
        
        <div v-if="selectedFile" class="mt-4">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p>已选择: {{ selectedFile.name }}</p>
              <p class="text-xs">大小: {{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
        
        <div class="card-actions justify-end mt-4">
          <button
            @click="clearFile"
            class="btn btn-ghost"
          >
            清空
          </button>
        </div>
      </div>
    </div>

    <!-- 转换选项 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">转换选项</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">包含表头</span>
              <input type="checkbox" v-model="options.header" class="checkbox checkbox-primary" />
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">空值处理</span>
            </label>
            <select v-model="options.nullHandling" class="select select-bordered select-sm">
              <option value="null">null</option>
              <option value="empty">空字符串</option>
              <option value="omit">忽略</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">缩进</span>
            </label>
            <select v-model="options.indent" class="select select-bordered select-sm">
              <option value="2">2个空格</option>
              <option value="4">4个空格</option>
              <option value="compact">紧凑</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">工作表</span>
            </label>
            <select v-model="selectedSheet" class="select select-bordered select-sm">
              <option v-for="(sheet, index) in sheetNames" :key="index" :value="index">
                {{ sheet }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 转换按钮 -->
    <div class="card-actions justify-center mb-6">
      <button
        @click="convertToJson"
        class="btn btn-primary"
        :disabled="!selectedFile || isConverting"
      >
        <span v-if="isConverting" class="loading loading-spinner loading-sm"></span>
        转换为JSON
      </button>
    </div>

    <!-- 结果显示区域 -->
    <div v-if="outputJson" class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">JSON结果</h2>
          <div class="flex gap-2">
            <button
              @click="copyResult"
              class="btn btn-sm btn-ghost"
            >
              复制结果
            </button>
            <button
              @click="downloadResult"
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

    <!-- 进度条 -->
    <div v-if="isConverting" class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-center space-x-2">
          <div class="loading loading-spinner loading-sm"></div>
          <span class="text-sm">正在转换...</span>
        </div>
        <progress class="progress progress-primary w-full mt-2" value="70" max="100"></progress>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <ol class="list-decimal list-inside space-y-1 text-sm">
          <li>点击"选择Excel文件"按钮选择需要转换的Excel文件</li>
          <li>根据需要设置转换选项</li>
          <li>如果Excel文件有多个工作表，可以选择要转换的工作表</li>
          <li>点击"转换为JSON"按钮开始转换</li>
          <li>转换完成后，可以复制结果或下载为JSON文件</li>
        </ol>
        
        <div class="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="font-bold">注意</h3>
            <div class="text-xs">
              此工具使用浏览器内置的API处理Excel文件，大文件处理可能较慢。建议文件大小不超过10MB。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useExcelToJsonStore } from '@/store/modules/tools/converter/ExcelToJson.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'ExcelToJsonPage',
  meta: {
    tool: {
      id: 'excel-json',
      name: 'Excel转JSON',
      description: '将Excel文件中的数据转换为JSON格式，方便在Web应用中使用',
      category: 'converter',
      icon: '📊',
      tags: ['excel', 'json', '转换', '数据'],
      keywords: ['excel', 'json', 'converter', 'data', '转换', '数据']
    }
  }
});

// 使用独立的store
const excelToJsonStore = useExcelToJsonStore();
const { 
  fileInput,
  selectedFile,
  sheetNames,
  selectedSheet,
  outputJson,
  isConverting,
  options,
  hasFile,
  hasOutput,
  canConvert
} = storeToRefs(excelToJsonStore);

const { 
  handleFileChange,
  clearFile,
  formatFileSize,
  convertToJson,
  copyResult,
  downloadResult
} = excelToJsonStore;
</script>