import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useJsonFormatterStore = defineStore('jsonFormatter', () => {
  // 状态
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
  
  // 计算属性
  const hasInput = computed(() => inputJson.value.trim().length > 0);
  const hasOutput = computed(() => outputJson.value.length > 0);
  const hasError = computed(() => jsonError.value.length > 0);
  const canFormat = computed(() => hasInput.value && !hasError.value);
  const canMinify = computed(() => hasInput.value && !hasError.value);
  const canValidate = computed(() => hasInput.value);
  
  // 验证JSON
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
  
  // 格式化JSON
  const formatJson = () => {
    if (!inputJson.value.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJson.value);
      const indent = indentChar.value === '\t' ? '\t' : ' '.repeat(parseInt(indentChar.value));
      outputJson.value = JSON.stringify(parsed, null, indent);
      
      // 这里可以添加记录工具使用的逻辑
      // recordToolUsage('json-formatter');
    } catch (error) {
      jsonError.value = `JSON格式错误: ${error.message}`;
    }
  };
  
  // 压缩JSON
  const minifyJson = () => {
    if (!inputJson.value.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJson.value);
      outputJson.value = JSON.stringify(parsed);
      
      // 这里可以添加记录工具使用的逻辑
      // recordToolUsage('json-formatter');
    } catch (error) {
      jsonError.value = `JSON格式错误: ${error.message}`;
    }
  };
  
  // 验证并格式化JSON
  const validateAndFormat = () => {
    if (!inputJson.value.trim()) return;
    
    if (validateJson()) {
      formatJson();
    }
  };
  
  // 加载示例
  const loadExample = () => {
    inputJson.value = exampleJson;
    validateJson();
  };
  
  // 清空输入
  const clearInput = () => {
    inputJson.value = '';
    outputJson.value = '';
    jsonError.value = '';
  };
  
  // 复制结果
  const copyResult = () => {
    if (!outputJson.value) return;
    
    navigator.clipboard.writeText(outputJson.value)
      .then(() => {
        // 使用更友好的提示方式
        const notification = document.createElement('div');
        notification.className = 'toast toast-top toast-end';
        notification.innerHTML = `
          <div class="alert alert-success">
            <span>已复制到剪贴板</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };
  
  // 下载结果
  const downloadResult = () => {
    if (!outputJson.value) return;
    
    const blob = new Blob([outputJson.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return {
    // 状态
    inputJson,
    outputJson,
    jsonError,
    indentChar,
    
    // 计算属性
    hasInput,
    hasOutput,
    hasError,
    canFormat,
    canMinify,
    canValidate,
    
    // 方法
    validateJson,
    formatJson,
    minifyJson,
    validateAndFormat,
    loadExample,
    clearInput,
    copyResult,
    downloadResult
  };
});