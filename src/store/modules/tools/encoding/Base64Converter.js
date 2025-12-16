import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBase64ConverterStore = defineStore('base64Converter', () => {
  // 状态
  const isEncodeMode = ref(true); // true为编码，false为解码
  const inputText = ref('');
  const outputText = ref('');
  const processing = ref(false);
  const errorMessage = ref('');
  
  // 计算属性
  const hasInput = computed(() => inputText.value.trim().length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canProcess = computed(() => hasInput.value && !processing.value);
  const hasError = computed(() => errorMessage.value.length > 0);
  
  // Base64 编码/解码
  const base64Encode = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };
  
  const base64Decode = (text) => {
    return decodeURIComponent(escape(atob(text)));
  };
  
  // 处理文本
  const processText = async () => {
    if (!inputText.value || !inputText.value.trim()) {
      return;
    }
    
    processing.value = true;
    errorMessage.value = '';
    
    try {
      const result = isEncodeMode.value 
        ? base64Encode(inputText.value) 
        : base64Decode(inputText.value);
      
      outputText.value = result;
    } catch (error) {
      errorMessage.value = `${isEncodeMode.value ? '编码' : '解码'}失败: ${error.message}`;
      outputText.value = '';
    } finally {
      processing.value = false;
    }
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    errorMessage.value = '';
  };
  
  // 复制输出
  const copyOutput = () => {
    if (outputText.value) {
      navigator.clipboard.writeText(outputText.value)
        .then(() => {
          // 这里可以添加一个toast通知
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
  };
  
  // 下载输出
  const downloadOutput = () => {
    if (!outputText.value) return;
    
    const blob = new Blob([outputText.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base64_${isEncodeMode.value ? 'encoded' : 'decoded'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 切换编码/解码模式
  const toggleMode = () => {
    isEncodeMode.value = !isEncodeMode.value;
    // 切换模式时清空输出
    outputText.value = '';
    errorMessage.value = '';
  };
  
  return {
    // 状态
    isEncodeMode,
    inputText,
    outputText,
    processing,
    errorMessage,
    
    // 计算属性
    hasInput,
    hasOutput,
    canProcess,
    hasError,
    
    // 方法
    processText,
    clearInput,
    copyOutput,
    downloadOutput,
    toggleMode
  };
});