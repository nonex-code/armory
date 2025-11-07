<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">📱</span>
        <h1 class="text-3xl md:text-4xl font-bold">二维码生成器</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        将文本、网址等内容转换为二维码图像
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">内容</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost"
                @click="handleLoadExample"
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
          
          <!-- 内容输入区域 -->
          <div class="form-control">
            <textarea
              v-model="qrContent"
              class="textarea textarea-bordered h-32 w-full font-mono text-sm" 
              placeholder="输入要生成二维码的内容（文本、网址等）..."
            ></textarea>
          </div>
          
          <!-- 二维码选项 -->
          <div class="mt-6">
            <h3 class="text-lg font-semibold mb-3">二维码选项</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">尺寸</span>
                </label>
                <select v-model="qrOptions.size" class="select select-bordered select-sm w-full">
                  <option value="128">小 (128x128)</option>
                  <option value="256" selected>中 (256x256)</option>
                  <option value="512">大 (512x512)</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">纠错级别</span>
                </label>
                <select v-model="qrOptions.errorCorrectionLevel" class="select select-bordered select-sm w-full">
                  <option value="L">低 (7%)</option>
                  <option value="M" selected>中 (15%)</option>
                  <option value="Q">较高 (25%)</option>
                  <option value="H">高 (30%)</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">前景色</span>
                </label>
                <input
                  v-model="qrOptions.color.dark"
                  type="color"
                  class="w-full h-10"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">背景色</span>
                </label>
                <input
                  v-model="qrOptions.color.light"
                  type="color"
                  class="w-full h-10"
                />
              </div>
            </div>
          </div>
          
          <!-- 生成按钮 -->
          <div class="card-actions justify-center mt-6">
            <button
              @click="handleGenerateQrCode"
              class="btn btn-primary"
              :disabled="!canGenerate"
            >
              <span v-if="isGenerating" class="loading loading-spinner loading-sm"></span>
              生成二维码
            </button>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">二维码</h2>
            <div class="flex gap-2">
              <button
                v-if="hasQrCode"
                @click="handleDownloadQrCode"
                class="btn btn-sm btn-primary"
              >
                下载
              </button>
              <button
                v-if="hasQrCode"
                @click="clearQrCode"
                class="btn btn-sm btn-ghost"
              >
                清空
              </button>
            </div>
          </div>
          
          <!-- 二维码显示区域 -->
          <div class="flex justify-center items-center h-96 bg-base-200 rounded-lg">
            <div v-if="isGenerating" class="flex flex-col items-center">
              <div class="loading loading-spinner loading-lg"></div>
              <span class="mt-4 text-sm">正在生成二维码...</span>
              <progress class="progress progress-primary w-64 mt-4" value="70" max="100"></progress>
            </div>
            <div v-else-if="hasQrCode" class="flex justify-center">
              <img :src="qrCodeUrl" alt="QR Code" class="max-w-full max-h-96" />
            </div>
            <div v-else class="text-center text-base-content/50">
              <span class="text-6xl mb-4 block">📱</span>
              <p>二维码将显示在这里</p>
            </div>
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
              <li>在输入框中输入要生成二维码的内容（文本、网址等）</li>
              <li>设置二维码选项：尺寸、纠错级别、颜色等</li>
              <li>点击"生成二维码"按钮</li>
              <li>查看生成的二维码，可以下载保存</li>
            </ol>
          </div>
          
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="font-bold">纠错级别说明</h3>
              <div class="text-sm">
                <p>纠错级别：二维码损坏时仍能读取的能力，级别越高容错能力越强但二维码越复杂</p>
                <p>建议：网址使用中等级别，重要信息使用高纠错级别</p>
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
import { useQrCodeGeneratorStore } from '@/store/modules/tools/generator/QrCodeGenerator';
import { useToast } from '@/composables/useToast';
import toolService from '@/services/toolService';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'QrCodeGeneratorPage',
  meta: {
    tool: {
      id: 'qr-code-generator',
      name: '二维码生成器',
      description: '二维码生成工具，支持文本、URL、联系方式等多种内容的二维码生成',
      icon: '🎨',
      category: 'generator',
      tags: ['二维码', '生成', '扫描', 'url', '文本', '内容生成'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用store
const store = useQrCodeGeneratorStore();
const {
  qrContent,
  qrOptions,
  qrCodeUrl,
  isGenerating,
  errorMessage,
  hasContent,
  hasQrCode,
  canGenerate
} = storeToRefs(store);

const {
  generateQrCode,
  downloadQrCode,
  copyQrCodeToClipboard,
  loadExample,
  clearInput,
  clearQrCode,
  clearAll,
  resetOptions
} = store;

// 使用提示
const { showToast } = useToast();

// 包装方法以添加提示和记录
const handleGenerateQrCode = async () => {
  const success = await generateQrCode();
  if (success) {
    showToast('二维码生成成功', 'success');
    toolService.recordToolUsage('qr-code-generator');
  } else {
    showToast(errorMessage.value || '生成失败', 'error');
  }
};

const handleDownloadQrCode = () => {
  const success = downloadQrCode();
  if (success) {
    showToast('二维码已下载', 'success');
  } else {
    showToast(errorMessage.value || '下载失败', 'error');
  }
};

const handleCopyQrCodeToClipboard = async () => {
  const success = await copyQrCodeToClipboard();
  if (success) {
    showToast('二维码已复制到剪贴板', 'success');
  } else {
    showToast(errorMessage.value || '复制失败', 'error');
  }
};

const handleLoadExample = async () => {
  const success = await loadExample();
  if (success) {
    showToast('示例已加载', 'success');
  } else {
    showToast(errorMessage.value || '加载示例失败', 'error');
  }
};
</script>