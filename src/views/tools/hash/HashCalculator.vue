<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">#️⃣</span>
        <h1 class="text-3xl md:text-4xl font-bold">哈希计算工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        计算文本或文件的MD5、SHA1、SHA256等多种哈希值，支持多种哈希算法
      </p>
    </div>

    <!-- 输入类型选择 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl">选择输入类型</h2>
        <div class="tabs tabs-boxed w-full">
          <a 
            class="tab flex-1" 
            :class="{ 'tab-active': inputType === 'text' }"
            @click="inputType = 'text'"
          >
            <span class="mr-2">📝</span>
            文本输入
          </a>
          <a 
            class="tab flex-1" 
            :class="{ 'tab-active': inputType === 'file' }"
            @click="inputType = 'file'"
          >
            <span class="mr-2">📄</span>
            文件上传
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
            <div class="badge badge-outline">{{ inputType === 'text' ? '文本' : '文件' }}</div>
          </div>
          
          <!-- 文本输入区域 -->
          <div v-if="inputType === 'text'" class="form-control">
            <label class="label">
              <span class="label-text">请输入要计算哈希值的文本</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full" 
              placeholder="在此输入文本..."
            ></textarea>
          </div>
          
          <!-- 文件上传区域 -->
          <div v-else class="form-control">
            <label class="label">
              <span class="label-text">请选择要计算哈希值的文件</span>
            </label>
            <input 
              type="file" 
              class="file-input file-input-bordered w-full"
              @change="hashCalculatorStore.handleFileChange"
            />
            <div v-if="uploadedFile" class="mt-4">
              <div class="alert alert-success">
                <BaseIcon name="check-circle" custom-class="stroke-current shrink-0 h-6 w-6" />
                <div>
                  <p>已上传: {{ uploadedFile.name }}</p>
                  <p class="text-xs">大小: {{ hashCalculatorStore.formatFileSize(uploadedFile.size) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 哈希算法选择 -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">选择哈希算法</span>
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label 
                v-for="algorithm in hashAlgorithms" 
                :key="algorithm.value"
                class="cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm mr-2"
                  v-model="selectedAlgorithms"
                  :value="algorithm.value"
                />
                <span class="label-text">{{ algorithm.label }}</span>
              </label>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="handleClearInput">清空</button>
            <button 
              class="btn btn-primary" 
              @click="handleCalculateHash"
              :disabled="!canCalculate || processing"
              :class="{ 'loading': processing }"
            >
              计算哈希
            </button>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">哈希结果</h2>
            <button 
              class="btn btn-sm btn-ghost" 
              @click="handleCopyAllResults"
              :disabled="!hasResults"
            >
              复制全部
            </button>
          </div>
          
          <!-- 哈希结果 -->
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-if="!hasResults && !processing" class="text-center py-8 text-base-content/50">
              哈希计算结果将显示在这里
            </div>
            
            <div v-else-if="processing" class="text-center py-8">
              <span class="loading loading-spinner loading-lg"></span>
              <p class="mt-2">正在计算哈希值...</p>
            </div>
            
            <div v-else>
              <div 
                v-for="(result, algorithm) in hashResults" 
                :key="algorithm"
                class="card bg-base-200 mb-3"
              >
                <div class="card-body p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold">{{ hashCalculatorStore.getAlgorithmLabel(algorithm) }}</h3>
                    <button 
                      class="btn btn-xs btn-ghost" 
                      @click="handleCopyResult(result)"
                    >
                      复制
                    </button>
                  </div>
                  <div class="font-mono text-xs break-all bg-base-100 p-2 rounded">
                    {{ result }}
                  </div>
                </div>
              </div>
            </div>
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
        <h2 class="card-title">哈希算法说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              MD5
            </div>
            <div class="collapse-content"> 
              <p>MD5是一种广泛使用的密码散列函数，可以产生出一个128位（16字节）的散列值。MD5已不适用于安全性要求高的场合，但仍然适用于文件校验等非加密场景。</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              SHA-1
            </div>
            <div class="collapse-content"> 
              <p>SHA-1是一种密码散列函数，可以产生出一个160位（20字节）的散列值。由于安全性问题，不推荐用于安全性要求高的场合。</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              SHA-256
            </div>
            <div class="collapse-content"> 
              <p>SHA-256是SHA-2算法的一种，可以产生出一个256位（32字节）的散列值。目前广泛用于各种安全应用和协议中。</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              SHA-512
            </div>
            <div class="collapse-content"> 
              <p>SHA-512是SHA-2算法的一种，可以产生出一个512位（64字节）的散列值。相比SHA-256，它提供了更高的安全性，但计算速度较慢。</p>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="font-bold mb-2">使用场景：</h3>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li>验证文件完整性，确保文件在传输过程中未被篡改</li>
            <li>密码存储（加盐哈希）</li>
            <li>数字签名</li>
            <li>数据去重</li>
            <li>区块链技术中的区块标识</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useHashCalculatorStore } from '@/store/modules/tools/hash/HashCalculator.js';
import { useToast } from '@/composables/useToast.js';
import toolService from '@/services/toolService.js';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'HashCalculatorPage',
  meta: {
    tool: {
      id: 'hash-calculator',
      name: '哈希计算器',
      description: '计算文本的多种哈希值，包括MD5、SHA-1、SHA-256、SHA-512等',
      icon: '🔒',
      category: 'crypto',
      tags: ['hash', 'md5', 'sha1', 'sha256', 'sha512', '哈希', '加密'],
      enabled: true,
      isPopular: true,
      order: 2
    }
  }
});

// 使用Pinia store
const hashCalculatorStore = useHashCalculatorStore();
const { success: showSuccess, error: showError } = useToast();

// 从store中解构状态
const {
  inputType,
  inputText,
  uploadedFile,
  selectedAlgorithms,
  hashResults,
  processing,
  errorMessage,
  isFileLoading,
  hashAlgorithms,
  hasInput,
  hasResults,
  canCalculate
} = storeToRefs(hashCalculatorStore);

// 带提示功能的包装方法
const handleCalculateHash = async () => {
  try {
    await hashCalculatorStore.calculateHash();
    if (hashCalculatorStore.hasResults) {
      showSuccess('哈希计算成功！');
      toolService.recordToolUsage('hash-calculator', 'calculate');
    }
  } catch (error) {
    showError(`哈希计算失败: ${error.message}`);
  }
};

const handleClearInput = () => {
  hashCalculatorStore.clearInput();
  showSuccess('已清空所有内容');
};

const handleCopyResult = (text) => {
  hashCalculatorStore.copyResult(text);
  showSuccess('已复制到剪贴板');
  toolService.recordToolUsage('hash-calculator', 'copy');
};

const handleCopyAllResults = () => {
  hashCalculatorStore.copyAllResults();
  showSuccess('已复制所有结果到剪贴板');
  toolService.recordToolUsage('hash-calculator', 'copy-all');
};

const handleDownloadResults = () => {
  hashCalculatorStore.downloadResults();
  showSuccess('已下载结果文件');
  toolService.recordToolUsage('hash-calculator', 'download');
};
</script>