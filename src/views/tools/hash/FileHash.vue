<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📄</span>
        <h1 class="text-3xl md:text-4xl font-bold">文件哈希计算</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        计算文件的MD5、SHA1、SHA256等多种哈希值，用于验证文件完整性和唯一性
      </p>
    </div>

    <!-- 文件上传区域 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">选择文件</h2>
        
        <div class="form-control">
          <input 
            type="file" 
            class="file-input file-input-bordered w-full"
            @change="fileHashStore.handleFileChange"
          />
        </div>
        
        <div v-if="selectedFile" class="mt-4">
          <div class="alert alert-success">
            <BaseIcon name="check-circle" custom-class="stroke-current shrink-0 h-6 w-6" />
            <div>
              <p>已选择: {{ selectedFile.name }}</p>
              <p class="text-xs">大小: {{ fileHashStore.formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 哈希算法选择 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">选择哈希算法</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label 
            v-for="algorithm in hashAlgorithms" 
            :key="algorithm.id"
            class="cursor-pointer"
          >
            <input 
              type="checkbox" 
              class="checkbox checkbox-sm mr-2"
              v-model="selectedAlgorithms"
              :value="algorithm.id"
            />
            <span class="label-text">{{ algorithm.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions justify-center mb-6">
      <button 
        class="btn btn-primary" 
        @click="handleCalculateHash"
        :disabled="!canCalculate || processing"
        :class="{ 'loading': processing }"
      >
        计算哈希值
      </button>
      <button 
        class="btn btn-outline" 
        @click="handleResetAll"
      >
        重置
      </button>
    </div>

    <!-- 结果显示区域 -->
    <div v-if="hasResults" class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title">计算结果</h2>
          <button 
            class="btn btn-sm btn-ghost" 
            @click="handleCopyAllResults"
          >
            复制全部
          </button>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="result in hashResults" 
            :key="result.algorithm"
            class="card bg-base-200"
          >
            <div class="card-body p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold">{{ result.name }}</h3>
                <button 
                  class="btn btn-xs btn-ghost" 
                  @click="handleCopyResult(result.hash)"
                >
                  复制
                </button>
              </div>
              <div class="font-mono text-xs break-all bg-base-100 p-2 rounded">
                {{ result.hash }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">文件哈希说明</h2>
        
        <div class="alert alert-info mb-4">
          <BaseIcon name="information-circle" custom-class="stroke-current shrink-0 w-6 h-6" />
          <div>
            <h3 class="font-bold">什么是文件哈希？</h3>
            <div class="text-xs">
              文件哈希是通过特定算法对文件内容计算得出的唯一字符串，可用于验证文件完整性和唯一性。
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-bold mb-2">使用场景：</h3>
            <ul class="list-disc list-inside text-sm space-y-1">
              <li>验证文件下载是否完整</li>
              <li>检查文件是否被篡改</li>
              <li>比较两个文件是否相同</li>
              <li>生成文件的唯一标识</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold mb-2">哈希算法对比：</h3>
            <ul class="list-disc list-inside text-sm space-y-1">
              <li><strong>MD5：</strong>速度快，但已不推荐用于安全场景</li>
              <li><strong>SHA-1：</strong>比MD5安全，但也存在弱点</li>
              <li><strong>SHA-256：</strong>目前广泛使用的安全算法</li>
              <li><strong>SHA-512：</strong>提供更高安全性，但计算较慢</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useFileHashStore } from '@/store/modules/tools/hash/FileHash.js';
import { useToast } from '@/composables/useToast.js';
import toolService from '@/services/toolService.js';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'FileHashPage',
  meta: {
    tool: {
      id: 'file-hash',
      name: '文件哈希计算',
      description: '计算文件的MD5、SHA1、SHA256等多种哈希值，用于验证文件完整性和唯一性',
      category: 'hash',
      icon: 'document-text',
      tags: ['文件哈希', 'MD5', 'SHA1', 'SHA256', '文件完整性', '验证'],
      keywords: ['文件哈希计算', '文件校验', 'MD5计算', 'SHA计算', '文件完整性验证']
    }
  }
});

// 使用独立的Pinia store
const fileHashStore = useFileHashStore();
const { 
  selectedFile,
  selectedAlgorithms,
  hashResults,
  processing,
  hashAlgorithms,
  hasFile,
  hasResults,
  canCalculate
} = storeToRefs(fileHashStore);

// 获取store中的方法
const {
  calculateHash,
  copyResult,
  copyAllResults,
  resetAll
} = fileHashStore;

// Toast提示和工具记录
const { showSuccess, showError } = useToast();

// 带提示功能的包装方法
const handleCalculateHash = async () => {
  try {
    await calculateHash();
    showSuccess('哈希计算成功！');
    toolService.recordToolUsage('file-hash', 'calculate');
  } catch (error) {
    showError(`哈希计算失败: ${error.message}`);
  }
};

const handleCopyResult = async (result) => {
  try {
    await copyResult(result);
    showSuccess('哈希值已复制到剪贴板');
    toolService.recordToolUsage('file-hash', 'copy');
  } catch (error) {
    showError('复制失败');
  }
};

const handleCopyAllResults = async () => {
  try {
    await copyAllResults();
    showSuccess('所有哈希值已复制到剪贴板');
    toolService.recordToolUsage('file-hash', 'copy-all');
  } catch (error) {
    showError('复制失败');
  }
};

const handleResetAll = () => {
  resetAll();
  showSuccess('已重置所有内容');
};
</script>