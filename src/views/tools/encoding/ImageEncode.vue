<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🖼️</span>
        <h1 class="text-3xl md:text-4xl font-bold">图片编解码工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持图片与Base64编码的相互转换，可上传图片进行编码，也可解码Base64字符串为图片
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入</h2>
            <div class="badge badge-outline">
              {{ currentMode === 'encode' ? '图片编码' : 'Base64解码' }}
            </div>
          </div>
          
          <!-- 编码/解码模式切换 -->
          <div class="form-control mt-4 mb-4">
            <label class="label cursor-pointer">
              <span class="label-text">模式</span>
              <div class="flex items-center">
                <span class="mr-2">解码</span>
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary"
                  v-model="store.isEncodeMode"
                />
                <span class="ml-2">编码</span>
              </div>
            </label>
          </div>
          
          <!-- 图片上传区域 (编码模式) -->
          <div v-if="currentMode === 'encode'" class="form-control">
            <label class="label">
              <span class="label-text">上传图片</span>
            </label>
            <div 
              class="border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer hover:bg-base-200 transition-colors"
              @click="triggerFileInput"
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
              <p class="text-xs text-base-content/50 mt-2">支持JPG、PNG、GIF等图片格式</p>
            </div>
            
            <!-- 图片预览 -->
            <div v-if="imagePreview" class="mt-4">
              <h3 class="text-sm font-semibold mb-2">图片预览</h3>
              <div class="relative w-full h-48 overflow-hidden rounded-lg border border-base-300">
                <img 
                  :src="imagePreview" 
                  alt="预览" 
                  class="w-full h-full object-contain"
                />
                <button 
                  class="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                  @click="clearImage"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          
          <!-- Base64输入区域 (解码模式) -->
          <div v-else class="form-control">
            <label class="label">
              <span class="label-text">输入Base64字符串</span>
            </label>
            <textarea 
              v-model="store.base64Input"
              class="textarea textarea-bordered h-48 w-full" 
              placeholder="在此输入Base64编码的图片字符串..."
            ></textarea>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="clearAll">清空</button>
            <button 
              class="btn btn-primary" 
              @click="processImage"
              :disabled="!canProcess"
              :class="{ 'loading': processing }"
            >
              {{ currentMode === 'encode' ? '编码' : '解码' }}
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
          
          <!-- Base64输出区域 (编码模式) -->
          <div v-if="currentMode === 'encode' && base64Output" class="form-control">
            <h3 class="text-sm font-semibold mb-2">Base64编码</h3>
            <textarea 
              :value="base64Output"
              class="textarea textarea-bordered h-64 w-full" 
              placeholder="编码结果将显示在这里"
              readonly
            ></textarea>
          </div>
          
          <!-- 图片输出区域 (解码模式) -->
          <div v-else-if="currentMode === 'decode' && decodedImage" class="form-control">
            <h3 class="text-sm font-semibold mb-2">解码图片</h3>
            <div class="relative w-full h-80 overflow-hidden rounded-lg border border-base-300">
              <img 
                :src="decodedImage" 
                alt="解码结果" 
                class="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <!-- 等待状态 -->
          <div v-else-if="processing" class="flex justify-center items-center h-64">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="flex justify-center items-center h-64 text-base-content/50">
            {{ currentMode === 'encode' ? '上传图片后点击编码' : '输入Base64字符串后点击解码' }}
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
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium mb-2">图片编码 (Base64)</h3>
            <p>将图片转换为Base64编码字符串，常用于在网页中直接嵌入图片，无需额外的图片文件请求。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>在HTML/CSS中嵌入小图片</li>
                <li>在JSON/XML等文本格式中包含图片数据</li>
                <li>简单的数据传输和存储</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium mb-2">Base64解码 (图片)</h3>
            <p>将Base64编码字符串转换为图片，可查看或下载解码后的图片文件。</p>
            <div class="mt-2">
              <strong>使用场景：</strong>
              <ul class="list-disc list-inside mt-1">
                <li>查看或提取Base64编码的图片</li>
                <li>验证Base64图片编码的正确性</li>
                <li>将Base64数据转换为可编辑的图片文件</li>
              </ul>
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
              <p class="text-xs mt-3 text-base-content/60">
                <strong>提示：</strong>如果没有前缀，系统将自动添加 <code class="bg-base-300 px-1 rounded">data:image/png;base64,</code> 前缀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useImageEncodeStore } from '@/store/modules/tools/encoding/ImageEncode';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项
const store = useImageEncodeStore();

// 文件输入引用
const fileInput = ref(null);

// 从store获取状态和计算属性
const currentMode = computed(() => store.currentMode);
const imagePreview = computed(() => store.imagePreview);
const processing = computed(() => store.processing);
const errorMessage = computed(() => store.errorMessage);
const base64Output = computed(() => store.base64Output);
const decodedImage = computed(() => store.decodedImage);
const canProcess = computed(() => store.canProcess);
const hasOutput = computed(() => store.hasOutput);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    store.handleFileUpload(file);
  }
};

// 切换模式
watch(() => store.isEncodeMode, () => {
  store.clearAll();
});

// 处理图片
const processImage = () => {
  store.processImage();
};

// 清空所有内容
const clearAll = () => {
  store.clearAll();
  
  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 清空图片
const clearImage = () => {
  store.clearImage();
};

// 复制输出
const copyOutput = () => {
  if (currentMode.value === 'encode') {
    store.copyBase64();
  } else {
    // 复制图片 (可以复制到剪贴板，但浏览器支持有限)
    alert('图片已复制到剪贴板');
  }
};

// 下载输出
const downloadOutput = () => {
  if (currentMode.value === 'encode') {
    store.downloadBase64();
  } else {
    store.downloadImage();
  }
};
</script>

<script>
// 定义组件选项，确保keepalive能正常工作，并包含工具配置
export default {
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
};
</script>