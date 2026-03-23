<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🖼️</span>
        <h1 class="text-3xl md:text-4xl font-bold">图片编解码工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持图片与Base64编码的相互转换，可上传图片进行编码，也可解码Base64字符串为图片
      </p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入</h2>
            <div class="flex gap-2">
              <button 
                v-if="currentMode === 'decode'"
                class="btn btn-sm btn-ghost"
                @click="handleLoadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost"
                @click="handleClearAll"
              >
                清空
              </button>
            </div>
          </div>
          
          <div class="tabs tabs-boxed w-full mb-4">
            <a 
              class="tab flex-1" 
              :class="{ 'tab-active': currentMode === 'decode' }"
              @click="isEncodeMode = false"
            >
              <span class="mr-2">🔓</span>
              Base64解码
            </a>
            <a 
              class="tab flex-1" 
              :class="{ 'tab-active': currentMode === 'encode' }"
              @click="isEncodeMode = true"
            >
              <span class="mr-2">🔒</span>
              图片编码
            </a>
          </div>
          
          <div v-if="currentMode === 'encode'" class="form-control">
            <label class="label">
              <span class="label-text">上传图片</span>
            </label>
            <div 
              class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all"
              :class="[
                isDragging 
                  ? 'border-primary bg-primary/10' 
                  : 'border-base-300 hover:bg-base-200'
              ]"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                class="hidden"
                @change="handleFileUpload"
              />
              <span class="text-5xl mb-3 block">📁</span>
              <p class="text-base-content/70">点击或拖拽图片到此处上传</p>
              <p class="text-xs text-base-content/50 mt-2">支持JPG、PNG、GIF、WebP等格式，最大20MB</p>
            </div>
            
            <div v-if="imagePreview" class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold">图片预览</h3>
                <button 
                  class="btn btn-xs btn-ghost btn-circle"
                  @click="clearImage"
                >
                  ✕
                </button>
              </div>
              <div class="relative w-full h-48 overflow-hidden rounded-lg border border-base-300 bg-base-200">
                <img 
                  :src="imagePreview" 
                  alt="预览" 
                  class="w-full h-full object-contain"
                />
              </div>
              
              <div v-if="imageInfo" class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="bg-base-200 rounded px-2 py-1">
                  <span class="text-base-content/60">尺寸:</span>
                  <span class="ml-1">{{ imageInfo.width }} × {{ imageInfo.height }}</span>
                </div>
                <div class="bg-base-200 rounded px-2 py-1">
                  <span class="text-base-content/60">大小:</span>
                  <span class="ml-1">{{ imageInfo.formattedSize }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="imagePreview" class="mt-4 space-y-3">
              <h3 class="text-sm font-semibold">编码选项</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text text-xs">输出格式</span>
                  </label>
                  <select v-model="outputFormat" class="select select-bordered select-sm w-full">
                    <option v-for="fmt in supportedFormats" :key="fmt.value" :value="fmt.value">
                      {{ fmt.label }}
                    </option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text text-xs">输出选项</span>
                  </label>
                  <label class="cursor-pointer flex items-center h-8">
                    <input type="checkbox" v-model="includeDataPrefix" class="checkbox checkbox-sm mr-2" />
                    <span class="text-xs">包含Data URL前缀</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="form-control">
            <label class="label">
              <span class="label-text">输入Base64字符串</span>
            </label>
            <textarea 
              v-model="base64Input"
              class="textarea textarea-bordered h-48 w-full font-mono text-sm" 
              placeholder="在此输入Base64编码的图片字符串..."
            ></textarea>
            <label class="label">
              <span class="label-text-alt text-base-content/50">
                支持带或不带 data:image/xxx;base64, 前缀
              </span>
            </label>
          </div>
          
          <div class="card-actions justify-end mt-6">
            <button 
              class="btn btn-primary" 
              @click="handleProcessImage"
              :disabled="!canProcess"
            >
              <span v-if="processing" class="loading loading-spinner loading-sm"></span>
              {{ currentMode === 'encode' ? '编码' : '解码' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输出</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="handleCopyOutput"
                :disabled="!hasOutput"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-primary" 
                @click="handleDownloadOutput"
                :disabled="!hasOutput"
              >
                下载
              </button>
            </div>
          </div>
          
          <div v-if="processing" class="flex flex-col justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg"></span>
            <p class="mt-4 text-sm text-base-content/70">
              {{ currentMode === 'encode' ? '正在编码...' : '正在解码...' }}
            </p>
          </div>
          
          <template v-else-if="hasOutput">
            <div v-if="currentMode === 'encode' && base64Output" class="form-control">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold">Base64编码结果</h3>
                <div class="text-xs text-base-content/60">
                  {{ formatFileSize(base64Output.length) }} 字符
                </div>
              </div>
              <textarea 
                :value="base64Output"
                class="textarea textarea-bordered h-56 w-full font-mono text-xs" 
                readonly
              ></textarea>
            </div>
            
            <div v-else-if="currentMode === 'decode' && decodedImage" class="form-control">
              <h3 class="text-sm font-semibold mb-2">解码图片</h3>
              <div class="relative w-full h-64 overflow-hidden rounded-lg border border-base-300 bg-base-200">
                <img 
                  :src="decodedImage" 
                  alt="解码结果" 
                  class="w-full h-full object-contain"
                />
              </div>
              
              <div v-if="imageInfo" class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div class="bg-base-200 rounded px-2 py-1">
                  <span class="text-base-content/60">尺寸:</span>
                  <span class="ml-1">{{ imageInfo.width }} × {{ imageInfo.height }}</span>
                </div>
                <div class="bg-base-200 rounded px-2 py-1">
                  <span class="text-base-content/60">比例:</span>
                  <span class="ml-1">{{ imageInfo.aspectRatio }}</span>
                </div>
                <div class="bg-base-200 rounded px-2 py-1">
                  <span class="text-base-content/60">格式:</span>
                  <span class="ml-1">{{ imageInfo.type?.toUpperCase() }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="flex flex-col justify-center items-center h-64 text-base-content/50">
            <span class="text-6xl mb-4">🖼️</span>
            <p>{{ currentMode === 'encode' ? '上传图片后点击编码' : '输入Base64字符串后点击解码' }}</p>
          </div>
          
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold text-lg mb-2">图片编码 (Base64)</h3>
            <p class="text-sm text-base-content/70 mb-3">将图片转换为Base64编码字符串，常用于在网页中直接嵌入图片。</p>
            <ul class="list-disc list-inside text-sm space-y-1 text-base-content/70">
              <li>在HTML/CSS中嵌入小图片</li>
              <li>在JSON/XML等文本格式中包含图片数据</li>
              <li>简单的数据传输和存储</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">Base64解码 (图片)</h3>
            <p class="text-sm text-base-content/70 mb-3">将Base64编码字符串转换为图片，可查看或下载解码后的图片文件。</p>
            <ul class="list-disc list-inside text-sm space-y-1 text-base-content/70">
              <li>查看或提取Base64编码的图片</li>
              <li>验证Base64图片编码的正确性</li>
              <li>将Base64数据转换为可编辑的图片文件</li>
            </ul>
          </div>
        </div>
         <div class="mt-4 p-4 bg-base-200 rounded-lg">
              <strong class="text-sm font-semibold">支持的图片前缀：</strong>
              <p class="text-xs mt-2 text-base-content/70">请在输入Base64字符串时，根据图片类型添加对应的前缀：</p>
              <div class="mt-2 space-y-1 text-xs font-mono">
                <div class="flex items-center">
                  <span class="text-primary">data:image/png;base64,</span>
                  <span class="ml-2 text-base-content/60">PNG格式</span>
                </div>
                <div class="flex items-center">
                  <span class="text-primary">data:image/jpeg;base64,</span>
                  <span class="ml-2 text-base-content/60">JPEG格式</span>
                </div>
                <div class="flex items-center">
                  <span class="text-primary">data:image/gif;base64,</span>
                  <span class="ml-2 text-base-content/60">GIF格式</span>
                </div>
                <div class="flex items-center">
                  <span class="text-primary">data:image/webp;base64,</span>
                  <span class="ml-2 text-base-content/60">WebP格式</span>
                </div>
                <div class="flex items-center">
                  <span class="text-primary">data:image/bmp;base64,</span>
                  <span class="ml-2 text-base-content/60">BMP格式</span>
                </div>
                <div class="flex items-center">
                  <span class="text-primary">data:image/tiff;base64,</span>
                  <span class="ml-2 text-base-content/60">TIFF格式</span>
                </div>
              </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useImageEncodeStore } from '@/store/modules/tools/encoding/ImageEncode';
import { useToast } from '@/composables/useToast';
import toolService from '@/services/toolService';

defineOptions({
  name: 'ImageEncodePage',
  meta: {
    tool: {
      id: 'image-encode',
      name: '图片编解码工具',
      description: '支持图片与Base64编码的相互转换，可上传图片进行编码，也可解码Base64字符串为图片',
      icon: '🖼️',
      category: 'encoding',
      tags: ['图片', 'base64', '编码', '解码', '转换'],
      enabled: true,
      isPopular: false,
      order: 5
    }
  }
});

const store = useImageEncodeStore();
const { showToast } = useToast();

const {
  currentMode,
  imagePreview,
  processing,
  errorMessage,
  base64Output,
  decodedImage,
  canProcess,
  hasOutput,
  imageInfo,
  outputFormat,
  includeDataPrefix,
  supportedFormats,
  base64Input,
  isEncodeMode
} = storeToRefs(store);

const fileInput = ref(null);
const isDragging = ref(false);

watch(() => isEncodeMode.value, () => {
  store.clearAll();
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    store.handleFileUpload(file);
    if (!store.errorMessage) {
      showToast('图片上传成功', 'success');
    }
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    store.handleFileUpload(file);
    if (!store.errorMessage) {
      showToast('图片上传成功', 'success');
    }
  } else {
    showToast('请上传图片文件', 'error');
  }
};

const handleProcessImage = async () => {
  await store.processImage();
  if (store.hasOutput) {
    showToast(store.currentMode === 'encode' ? '编码成功' : '解码成功', 'success');
    toolService.recordToolUsage('image-encode');
  } else if (store.errorMessage) {
    showToast(store.errorMessage, 'error');
  }
};

const handleClearAll = () => {
  store.clearAll();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  showToast('已清空所有内容', 'success');
};

const clearImage = () => {
  store.clearImage();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleCopyOutput = async () => {
  if (store.currentMode === 'encode') {
    const success = await store.copyBase64();
    if (success) {
      showToast('已复制到剪贴板', 'success');
      toolService.recordToolUsage('image-encode', 'copy');
    } else {
      showToast('复制失败', 'error');
    }
  } else {
    showToast('图片模式下请右键另存', 'info');
  }
};

const handleDownloadOutput = () => {
  let success = false;
  if (store.currentMode === 'encode') {
    success = store.downloadBase64();
  } else {
    success = store.downloadImage();
  }
  
  if (success) {
    showToast('下载成功', 'success');
    toolService.recordToolUsage('image-encode', 'download');
  } else {
    showToast('下载失败', 'error');
  }
};

const handleLoadExample = () => {
  store.loadExample();
  showToast('示例已加载', 'success');
};
</script>
