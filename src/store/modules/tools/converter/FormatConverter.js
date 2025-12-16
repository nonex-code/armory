import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFormatConverterStore = defineStore('formatConverter', () => {
  // 状态定义
  const activeTab = ref('case');
  const inputText = ref('');
  const outputText = ref('');
  const processing = ref(false);
  const errorMessage = ref('');
  
  // 转换选项
  const caseOptions = ref({
    targetCase: 'lower', // lower, upper, title, sentence
    preserveAcronyms: true
  });
  
  const whitespaceOptions = ref({
    trim: true,
    normalize: true,
    removeExtraSpaces: true
  });
  
  const encodingOptions = ref({
    sourceEncoding: 'utf8',
    targetEncoding: 'utf8'
  });

  // 转换类型标签页
  const formatTabs = [
    { id: 'case', name: '大小写转换', icon: '🔤' },
    { id: 'whitespace', name: '空格处理', icon: '␣' },
    { id: 'encoding', name: '编码转换', icon: '🔣' }
  ];

  // 计算属性
  const activeTabName = computed(() => {
    const tab = formatTabs.find(t => t.id === activeTab.value);
    return tab ? tab.name : '';
  });

  const inputPlaceholder = computed(() => {
    const type = activeTabName.value;
    return `在此输入需要${type}的文本内容...`;
  });

  const hasInput = computed(() => !!inputText.value);
  const hasOutput = computed(() => !!outputText.value);
  const canProcess = computed(() => hasInput.value && !processing.value);

  // 大小写转换
  const convertCase = (text) => {
    try {
      const { targetCase, preserveAcronyms } = caseOptions.value;
      
      switch (targetCase) {
        case 'lower':
          return text.toLowerCase();
        case 'upper':
          return text.toUpperCase();
        case 'title':
          return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        case 'sentence':
          return text.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => {
            return p1 + p2.toUpperCase();
          });
        default:
          return text;
      }
    } catch (error) {
      throw new Error('大小写转换失败: ' + error.message);
    }
  };

  // 空格处理
  const processWhitespace = (text) => {
    try {
      const { trim, normalize, removeExtraSpaces } = whitespaceOptions.value;
      let result = text;
      
      if (trim) {
        result = result.trim();
      }
      
      if (normalize) {
        // 标准化换行符
        result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      }
      
      if (removeExtraSpaces) {
        // 移除多余空格
        result = result.replace(/\s+/g, ' ');
      }
      
      return result;
    } catch (error) {
      throw new Error('空格处理失败: ' + error.message);
    }
  };

  // 编码转换
  const convertEncoding = (text) => {
    try {
      const { sourceEncoding, targetEncoding } = encodingOptions.value;
      
      if (sourceEncoding === targetEncoding) {
        return text;
      }
      
      // 简单的编码转换实现
      // 在实际项目中，可能需要使用更专业的编码转换库
      if (sourceEncoding === 'utf8' && targetEncoding === 'base64') {
        return btoa(unescape(encodeURIComponent(text)));
      }
      
      if (sourceEncoding === 'base64' && targetEncoding === 'utf8') {
        return decodeURIComponent(escape(atob(text)));
      }
      
      if (sourceEncoding === 'utf8' && targetEncoding === 'url') {
        return encodeURIComponent(text);
      }
      
      if (sourceEncoding === 'url' && targetEncoding === 'utf8') {
        return decodeURIComponent(text);
      }
      
      return text;
    } catch (error) {
      throw new Error('编码转换失败: ' + error.message);
    }
  };

  // 处理文本
  const processText = () => {
    processing.value = true;
    errorMessage.value = '';
    
    try {
      if (!inputText.value.trim()) {
        outputText.value = '';
        return;
      }
      
      let result;
      
      switch (activeTab.value) {
        case 'case':
          result = convertCase(inputText.value);
          break;
        case 'whitespace':
          result = processWhitespace(inputText.value);
          break;
        case 'encoding':
          result = convertEncoding(inputText.value);
          break;
        default:
          result = inputText.value;
      }
      
      outputText.value = result;
    } catch (error) {
      errorMessage.value = error.message;
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
  const copyOutput = async () => {
    if (outputText.value) {
      try {
        await navigator.clipboard.writeText(outputText.value);
        return true;
      } catch (error) {
        console.error('复制失败:', error);
        return false;
      }
    }
    return false;
  };

  // 下载输出
  const downloadOutput = () => {
    if (!outputText.value) return false;
    
    try {
      const blob = new Blob([outputText.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab.value}_converted.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      return false;
    }
  };

  // 重置为初始状态
  const reset = () => {
    activeTab.value = 'case';
    inputText.value = '';
    outputText.value = '';
    processing.value = false;
    errorMessage.value = '';
  };

  return {
    // 状态
    activeTab,
    inputText,
    outputText,
    processing,
    errorMessage,
    formatTabs,
    caseOptions,
    whitespaceOptions,
    encodingOptions,
    
    // 计算属性
    activeTabName,
    inputPlaceholder,
    hasInput,
    hasOutput,
    canProcess,
    
    // 方法
    convertCase,
    processWhitespace,
    convertEncoding,
    processText,
    clearInput,
    copyOutput,
    downloadOutput,
    reset
  };
});