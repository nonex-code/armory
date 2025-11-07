import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * JSON格式化工具状态管理Store
 * 包含JSON格式化工具的状态和所有业务逻辑
 */
export const useJsonFormatterStore = defineStore('jsonFormatter', () => {
  // ========== 状态定义 ==========
  const inputJson = ref('');
  const outputJson = ref('');
  const jsonError = ref('');
  const indentChar = ref('2');
  
  // 示例JSON数据
  const exampleJson = `{
  "name": "WebTools",
  "version": "1.0.0",
  "description": "多功能开发工具集合",
  "tools": [
    {
      "id": "base64-encode",
      "name": "Base64编码",
      "category": "encoding",
      "enabled": true
    },
    {
      "id": "json-formatter",
      "name": "JSON格式化",
      "category": "format",
      "enabled": true
    }
  ],
  "settings": {
    "theme": "light",
    "language": "zh-CN",
    "autoSave": true
  }
}`;

  // ========== 计算属性 ==========
  const hasValidInput = computed(() => {
    return inputJson.value.trim() && !jsonError.value;
  });
  
  const hasOutput = computed(() => {
    return outputJson.value.trim();
  });

  // ========== 业务逻辑方法 ==========
  
  /**
   * 验证JSON格式
   * @returns {boolean} 验证是否通过
   */
  const validateJson = () => {
    if (!inputJson.value.trim()) {
      jsonError.value = '';
      return true;
    }
    
    try {
      JSON.parse(inputJson.value);
      jsonError.value = '';
      return true;
    } catch (error) {
      jsonError.value = `JSON格式错误: ${error.message}`;
      return false;
    }
  };

  /**
   * 格式化JSON
   */
  const formatJson = () => {
    if (!inputJson.value.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJson.value);
      const indent = indentChar.value === '\t' ? '\t' : ' '.repeat(parseInt(indentChar.value));
      outputJson.value = JSON.stringify(parsed, null, indent);
      return true;
    } catch (error) {
      jsonError.value = `JSON格式错误: ${error.message}`;
      return false;
    }
  };

  /**
   * 压缩JSON
   */
  const minifyJson = () => {
    if (!inputJson.value.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJson.value);
      outputJson.value = JSON.stringify(parsed);
      return true;
    } catch (error) {
      jsonError.value = `JSON格式错误: ${error.message}`;
      return false;
    }
  };

  /**
   * 验证并格式化JSON
   */
  const validateAndFormat = () => {
    if (!inputJson.value.trim()) return false;
    
    if (validateJson()) {
      return formatJson();
    }
    return false;
  };

  /**
   * 加载示例JSON
   */
  const loadExample = () => {
    inputJson.value = exampleJson;
    outputJson.value = '';
    jsonError.value = '';
  };

  /**
   * 清空输入和输出
   */
  const clearInput = () => {
    inputJson.value = '';
    outputJson.value = '';
    jsonError.value = '';
  };

  /**
   * 复制格式化结果到剪贴板
   * @returns {Promise<boolean>} 复制是否成功
   */
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(outputJson.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  /**
   * 下载格式化结果为JSON文件
   * @returns {boolean} 下载是否成功
   */
  const downloadResult = () => {
    try {
      const blob = new Blob([outputJson.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
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

  /**
   * 重置所有状态
   */
  const resetState = () => {
    inputJson.value = '';
    outputJson.value = '';
    jsonError.value = '';
    indentChar.value = '2';
  };

  return {
    // 状态
    inputJson,
    outputJson,
    jsonError,
    indentChar,
    
    // 计算属性
    hasValidInput,
    hasOutput,
    
    // 方法
    validateJson,
    formatJson,
    minifyJson,
    validateAndFormat,
    loadExample,
    clearInput,
    copyResult,
    downloadResult,
    resetState
  };
});