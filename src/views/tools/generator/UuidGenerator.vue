<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🆔</span>
        <h1 class="text-3xl md:text-4xl font-bold">UUID生成器</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        生成通用唯一标识符(UUID)，支持v1和v4两种版本
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 选项区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">生成选项</h2>
            <button 
              class="btn btn-sm btn-ghost"
              @click="handleResetOptions"
            >
              重置
            </button>
          </div>
          
          <!-- UUID版本选择 -->
          <div class="space-y-4">
            <h3 class="font-semibold">UUID版本</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">UUID v1 (基于时间)</span>
                  <input type="radio" v-model="uuidVersion" value="v1" class="radio radio-primary" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">UUID v4 (随机)</span>
                  <input type="radio" v-model="uuidVersion" value="v4" class="radio radio-primary" />
                </label>
              </div>
            </div>
          </div>
          
          <!-- 生成数量 -->
          <div class="mt-6">
            <h3 class="font-semibold mb-2">生成数量</h3>
            <div class="flex items-center space-x-2">
              <input
                v-model="generateCount"
                type="number"
                min="1"
                max="100"
                class="input input-bordered w-20"
              />
              <span class="text-sm">个UUID</span>
            </div>
          </div>
          
          <!-- 格式选项 -->
          <div class="mt-6">
            <h3 class="font-semibold mb-2">格式选项</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">大写</span>
                  <input type="radio" v-model="formatCase" value="upper" class="radio radio-primary" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">小写</span>
                  <input type="radio" v-model="formatCase" value="lower" class="radio radio-primary" />
                </label>
              </div>
            </div>
          </div>
          
          <!-- 生成按钮 -->
          <div class="card-actions justify-center mt-6">
            <button
              @click="handleGenerateUuids"
              class="btn btn-primary"
              :disabled="isGenerating"
            >
              <span v-if="isGenerating" class="loading loading-spinner loading-sm"></span>
              生成UUID
            </button>
          </div>
        </div>
      </div>
      
      <!-- 结果区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">生成结果</h2>
            <div class="flex gap-2">
              <button
                @click="handleCopyAllUuids"
                class="btn btn-sm btn-primary"
                :disabled="!hasGeneratedUuids"
              >
                复制全部
              </button>
              <button
                @click="handleDownloadUuids"
                class="btn btn-sm btn-secondary"
                :disabled="!hasGeneratedUuids"
              >
                下载文件
              </button>
              <button
                @click="handleClearResults"
                class="btn btn-sm btn-ghost"
                :disabled="!hasGeneratedUuids"
              >
                清空结果
              </button>
            </div>
          </div>
          
          <!-- UUID列表 -->
          <div v-if="hasGeneratedUuids" class="bg-base-200 p-3 rounded-lg max-h-64 overflow-y-auto">
            <div class="space-y-2">
              <div
                v-for="(uuid, index) in generatedUuids"
                :key="index"
                class="flex items-center justify-between p-2 bg-base-100 rounded"
              >
                <span class="font-mono text-sm">{{ uuid }}</span>
                <button
                  @click="handleCopyUuid(uuid)"
                  class="btn btn-xs btn-ghost"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="flex flex-col items-center justify-center h-64 bg-base-200 rounded-lg">
            <span class="text-6xl mb-4">🆔</span>
            <p class="text-base-content/50">生成的UUID将显示在这里</p>
          </div>
          
          <!-- 进度指示器 -->
          <div v-if="isGenerating" class="mt-4">
            <div class="flex items-center justify-center space-x-2">
              <div class="loading loading-spinner loading-sm"></div>
              <span class="text-sm">正在生成UUID...</span>
            </div>
            <progress class="progress progress-primary w-full mt-2" value="70" max="100"></progress>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">使用方法</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>选择UUID版本：v1基于时间戳和MAC地址，v4使用随机数</li>
              <li>设置生成数量（1-100个）</li>
              <li>选择格式：大写或小写</li>
              <li>点击"生成UUID"按钮</li>
              <li>查看生成结果，可以单独复制、复制全部或下载为文件</li>
            </ol>
          </div>
          
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="font-bold">UUID版本说明</h3>
              <div class="text-sm">
                <p>UUID v1：基于时间戳和节点ID(MAC地址)，保证唯一性但可能泄露信息</p>
                <p>UUID v4：使用随机或伪随机数，几乎不可能重复，不泄露信息</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUuidGeneratorStore } from '@/store/modules/tools/generator/UuidGenerator';
import { useToast } from '@/composables/useToast';
import toolService from '@/services/toolService';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'UuidGeneratorPage',
  meta: {
    tool: {
      id: 'uuid-generator',
      name: 'UUID生成器',
      description: 'UUID生成工具，支持生成多种版本的UUID标识符',
      icon: '🎨',
      category: 'generator',
      tags: ['uuid', '生成', '标识符', '唯一', '随机', '内容生成'],
      enabled: true,
      isPopular: true,
      order: 2
    }
  }
});

// 使用独立的Pinia store
const uuidGeneratorStore = useUuidGeneratorStore();
const { 
  uuidVersion,
  generateCount,
  formatCase,
  generatedUuids,
  isGenerating,
  hasGeneratedUuids
} = storeToRefs(uuidGeneratorStore);

// 获取store中的方法
const {
  generateUuids,
  copyUuid,
  copyAllUuids,
  downloadUuids,
  clearResults,
  resetOptions
} = uuidGeneratorStore;

// Toast提示
const { showSuccessToast, showErrorToast } = useToast();

// 带提示功能的包装方法
const handleGenerateUuids = async () => {
  try {
    await generateUuids();
    showSuccessToast(`成功生成 ${generatedUuids.value.length} 个UUID`);
    toolService.recordToolUsage('uuid-generator', 'generate', { count: generatedUuids.value.length });
  } catch (error) {
    showErrorToast('UUID生成失败');
  }
};

const handleCopyUuid = async (uuid) => {
  try {
    await copyUuid(uuid);
    showSuccessToast('UUID已复制到剪贴板');
  } catch (error) {
    showErrorToast('复制失败');
  }
};

const handleCopyAllUuids = async () => {
  try {
    await copyAllUuids();
    showSuccessToast(`已复制 ${generatedUuids.value.length} 个UUID到剪贴板`);
  } catch (error) {
    showErrorToast('复制失败');
  }
};

const handleDownloadUuids = () => {
  try {
    downloadUuids();
    showSuccessToast('UUID文件下载成功');
  } catch (error) {
    showErrorToast('下载失败');
  }
};

const handleClearResults = () => {
  clearResults();
  showSuccessToast('已清空生成结果');
};

const handleResetOptions = () => {
  resetOptions();
  showSuccessToast('已重置为默认选项');
};
</script>