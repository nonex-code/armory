import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUrlEncodeStore = defineStore('urlEncode', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  
  // 示例文本
  const exampleText = 'https://example.com/search?q=URL编码测试&参数=值&特殊符号=@#$%';
  
  // 计算属性
  const hasInput = computed(() => inputText.value.trim().length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canEncode = computed(() => hasInput.value);
  
  // URL编码
  const encodeUrl = () => {
    try {
      if (!inputText.value.trim()) {
        // 这里可以添加一个toast通知
        return;
      }
      
      // 执行URL编码
      outputText.value = encodeURIComponent(inputText.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('URL编码失败:', error);
      outputText.value = '编码失败: ' + error.message;
    }
  };
  
  // URL解码
  const decodeUrl = () => {
    try {
      if (!inputText.value.trim()) {
        // 这里可以添加一个toast通知
        return;
      }
      
      // 执行URL解码
      outputText.value = decodeURIComponent(inputText.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('URL解码失败:', error);
      outputText.value = '解码失败: ' + error.message;
    }
  };
  
  // 加载示例
  const loadExample = () => {
    inputText.value = exampleText;
    outputText.value = '';
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
    encodeUrl,
    decodeUrl,
    loadExample,
    clearInput,
    copyResult
  };
});