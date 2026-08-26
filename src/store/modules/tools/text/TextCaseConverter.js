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
  
  // 分词：按大小写边界、空白、常见分隔符拆分单词（保留中文等非 ASCII 字符）
  const splitWords = (text) => {
    return text
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')       // camelCase 边界
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')    // 连续大写后接小写
      .split(/[\s_\-.,!?;:()\[\]{}'"`]+/)
      .filter(Boolean);
  };

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
        // 排除撇号后词首（don't → Don't 而不是 Don'T）
        result = text.toLowerCase().replace(/(^|\s)\w/g, char => char.toUpperCase());
        break;
      case 'sentencecase':
        result = text.toLowerCase().replace(/(^|[.!?]\s+)\w/g, match => match.toUpperCase());
        break;
      case 'camelcase': {
        const words = splitWords(text);
        result = words
          .map((word, index) => index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        break;
      }
      case 'pascalcase': {
        const words = splitWords(text);
        result = words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        break;
      }
      case 'snakecase':
        result = splitWords(text).join('_').toLowerCase();
        break;
      case 'kebabcase':
        result = splitWords(text).join('-').toLowerCase();
        break;
      case 'constantcase':
        result = splitWords(text).join('_').toUpperCase();
        break;
      case 'capitalcase':
        // 每个单词首字母大写，其余字母小写
        result = text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        break;
      case 'invertcase':
        result = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      default:
        // 未知类型不静默返回原文，给出提示
        console.warn(`未知的转换类型: ${conversionType.value}`);
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