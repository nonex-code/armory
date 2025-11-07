<template>
  <div class="base64-tool">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">Base64编码/解码工具</h2>
        <p class="text-base-content/70">Base64编码和解码，支持文本和文件</p>
        
        <!-- 操作模式选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">操作模式</span>
          </label>
          <div class="flex gap-4">
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="operationMode" 
                value="encode" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">编码</span>
            </label>
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="operationMode" 
                value="decode" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">解码</span>
            </label>
          </div>
        </div>
        
        <!-- 输入类型选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">输入类型</span>
          </label>
          <div class="flex gap-4">
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="inputType" 
                value="text" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">文本</span>
            </label>
            <label class="cursor-pointer label">
              <input 
                type="radio" 
                v-model="inputType" 
                value="file" 
                class="radio radio-primary" 
              />
              <span class="label-text ml-2">文件</span>
            </label>
          </div>
        </div>
        
        <!-- 文本输入区域 -->
        <div v-if="inputType === 'text'" class="form-control">
          <label class="label">
            <span class="label-text">{{ operationMode === 'encode' ? '原始文本' : 'Base64编码文本' }}</span>
          </label>
          <textarea 
            v-model="inputText" 
            class="textarea textarea-bordered h-32" 
            :placeholder="operationMode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64文本...'"
          ></textarea>
        </div>
        
        <!-- 文件输入区域 -->
        <div v-if="inputType === 'file'" class="form-control">
          <label class="label">
            <span class="label-text">选择文件</span>
          </label>
          <input 
            type="file" 
            @change="handleFileSelect" 
            class="file-input file-input-bordered w-full" 
          />
          <div v-if="selectedFile" class="mt-2 text-sm text-base-content/70">
            已选择: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button 
            class="btn btn-primary" 
            @click="processBase64" 
            :disabled="!hasInput"
          >
            <BaseIcon 
              :name="operationMode === 'encode' ? 'arrow-up' : 'arrow-down'" 
              custom-class="h-5 w-5 mr-2" 
            />
            {{ operationMode === 'encode' ? '编码' : '解码' }}
          </button>
          <button class="btn btn-outline" @click="clearAll">
            <BaseIcon name="trash" custom-class="h-5 w-5 mr-2" />
            清空
          </button>
          <button 
            v-if="outputText" 
            class="btn btn-outline" 
            @click="copyToClipboard"
          >
            <BaseIcon name="clipboard" custom-class="h-5 w-5 mr-2" />
            复制
          </button>
        </div>
        
        <!-- 输出结果 -->
        <div v-if="outputText" class="mt-6">
          <h3 class="text-lg font-semibold mb-3">
            {{ operationMode === 'encode' ? '编码结果' : '解码结果' }}
          </h3>
          <div class="form-control">
            <textarea 
              v-model="outputText" 
              class="textarea textarea-bordered h-32" 
              readonly
            ></textarea>
          </div>
          <div class="mt-2 text-sm text-base-content/70">
            结果长度: {{ outputText.length }} 字符
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="alert alert-error mt-4">
          <BaseIcon name="exclamation-triangle" custom-class="h-5 w-5" />
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'Base64ToolPage',
  meta: {
    tool: {
      id: 'base64-tool',
      name: 'Base64工具',
      description: 'Base64编码和解码工具，支持文本和文件的Base64转换',
      icon: '🔤',
      category: 'encoding',
      tags: ['base64', '编码', '解码', '转换'],
      enabled: true,
      isPopular: true,
      order: 2
    }
  }
});

// 响应式数据
const operationMode = ref('encode');
const inputType = ref('text');
const inputText = ref('');
const selectedFile = ref(null);
const outputText = ref('');
const error = ref('');

// 计算属性：是否有输入
const hasInput = computed(() => {
  if (inputType.value === 'text') {
    return inputText.value.trim().length > 0;
  } else {
    return selectedFile.value !== null;
  }
});

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    error.value = '';
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Base64处理函数
const processBase64 = async () => {
  error.value = '';
  outputText.value = '';

  try {
    if (inputType.value === 'text') {
      // 文本处理
      if (operationMode.value === 'encode') {
        // Base64编码
        outputText.value = btoa(unescape(encodeURIComponent(inputText.value)));
      } else {
        // Base64解码
        outputText.value = decodeURIComponent(escape(atob(inputText.value)));
      }
    } else {
      // 文件处理
      if (!selectedFile.value) {
        throw new Error('请选择文件');
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (operationMode.value === 'encode') {
            // 文件编码为Base64
            const base64 = e.target.result.split(',')[1]; // 移除data:前缀
            outputText.value = base64;
          } else {
            // Base64解码为文件内容（文本文件）
            const base64Data = inputText.value;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            outputText.value = decoder.decode(bytes);
          }
        } catch (err) {
          error.value = `处理失败: ${err.message}`;
        }
      };

      reader.onerror = () => {
        error.value = '文件读取失败';
      };

      if (operationMode.value === 'encode') {
        reader.readAsDataURL(selectedFile.value);
      } else {
        // 解码模式下，需要先读取输入文本
        if (!inputText.value.trim()) {
          throw new Error('请输入Base64编码文本');
        }
        reader.readAsText(selectedFile.value);
      }
    }
  } catch (err) {
    error.value = `处理失败: ${err.message}`;
  }
};

// 清空所有
const clearAll = () => {
  inputText.value = '';
  selectedFile.value = null;
  outputText.value = '';
  error.value = '';
  // 重置文件输入
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.value = '';
  }
};

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    // 可以添加成功提示
    console.log('复制成功');
  } catch (err) {
    error.value = '复制失败';
  }
};

// 监听输入类型变化时清空文件选择
watch(inputType, (newType) => {
  if (newType === 'text') {
    selectedFile.value = null;
  }
});
</script>

<style scoped>
.base64-tool {
  max-width: 800px;
  margin: 0 auto;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.file-input {
  cursor: pointer;
}
</style>