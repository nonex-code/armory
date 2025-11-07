import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useHtmlEncodeStore = defineStore('htmlEncode', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  
  // 计算属性
  const hasInput = computed(() => inputText.value.trim().length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canEncode = computed(() => hasInput.value);
  
  // HTML实体编码函数
  const encodeHtml = () => {
    try {
      // 创建一个临时元素来编码HTML
      const tempElement = document.createElement('div');
      tempElement.textContent = inputText.value;
      outputText.value = tempElement.innerHTML;
    } catch (error) {
      outputText.value = '编码失败，请重试';
    }
  };
  
  // 加载示例
  const loadExample = () => {
    inputText.value = '<div class="example">Hello & "World"!</div>';
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
  };
  
  // 复制结果
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  return {
    // 状态
    inputText,
    outputText,
    
    // 计算属性
    hasInput,
    hasOutput,
    canEncode,
    
    // 方法
    encodeHtml,
    loadExample,
    clearInput,
    copyResult
  };
});