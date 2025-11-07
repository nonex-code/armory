import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTextCaseConverterStore = defineStore('textCaseConverter', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  const conversionType = ref('uppercase');
  const preserveWhitespace = ref(true);
  const trimWhitespace = ref(false);
  
  // 示例文本
  const exampleText = 'Hello World! This is a sample text for case conversion.';
  
  // 计算属性
  const hasInput = computed(() => inputText.value.length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canConvert = computed(() => hasInput.value);
  const inputStats = computed(() => ({
    lines: inputText.value ? inputText.value.split('\n').length : 0,
    chars: inputText.value ? inputText.value.length : 0
  }));
  const outputStats = computed(() => ({
    lines: outputText.value ? outputText.value.split('\n').length : 0,
    chars: outputText.value ? outputText.value.length : 0
  }));
  
  // 大小写转换函数
  const convertCase = () => {
    if (!inputText.value) return;
    
    let text = inputText.value;
    
    // 处理空格选项
    if (trimWhitespace.value) {
      text = text.trim();
    }
    
    let result = '';
    
    switch (conversionType.value) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'titlecase':
        result = text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        break;
      case 'sentencecase':
        result = text.toLowerCase().replace(/(^|\.\s+|\?\s+|!\s+)\w/g, match => match.toUpperCase());
        break;
      case 'camelcase':
        result = text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^./, char => char.toLowerCase());
        break;
      case 'pascalcase':
        result = text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^./, char => char.toUpperCase());
        break;
      case 'snakecase':
        result = text.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        result = text.toLowerCase().replace(/\s+/g, '-');
        break;
      case 'constantcase':
        result = text.toUpperCase().replace(/\s+/g, '_');
        break;
      case 'capitalcase':
        result = text.replace(/\b\w/g, char => char.toUpperCase());
        break;
      case 'invertcase':
        result = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      default:
        result = text;
    }
    
    // 如果不保留空格，移除多余空格
    if (!preserveWhitespace.value) {
      result = result.replace(/\s+/g, ' ').trim();
    }
    
    outputText.value = result;
  };
  
  // 复制结果
  const copyResult = async () => {
    if (!outputText.value) return;
    
    try {
      await navigator.clipboard.writeText(outputText.value);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
  };
  
  // 清空输出
  const clearOutput = () => {
    outputText.value = '';
  };
  
  // 加载示例
  const loadExample = () => {
    inputText.value = exampleText;
    convertCase();
  };
  
  // 交换输入输出
  const swapInputOutput = () => {
    if (!outputText.value) return;
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
  };
  
  return {
    // 状态
    inputText,
    outputText,
    conversionType,
    preserveWhitespace,
    trimWhitespace,
    
    // 计算属性
    hasInput,
    hasOutput,
    canConvert,
    inputStats,
    outputStats,
    
    // 方法
    convertCase,
    copyResult,
    clearInput,
    clearOutput,
    loadExample,
    swapInputOutput
  };
});