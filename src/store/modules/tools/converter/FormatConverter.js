import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFormatConverterStore = defineStore('formatConverter', () => {
  // 状态定义
  const activeTab = ref('json');
  const isFormatMode = ref(true); // true为格式化，false为压缩
  const sortKeys = ref(false); // JSON键排序
  const uppercaseKeywords = ref(false); // SQL关键字大写
  const inputText = ref('');
  const outputText = ref('');
  const processing = ref(false);
  const errorMessage = ref('');

  // 格式类型标签页
  const formatTabs = [
    { id: 'json', name: 'JSON', icon: '{}' },
    { id: 'xml', name: 'XML', icon: '📄' },
    { id: 'sql', name: 'SQL', icon: '🗃️' }
  ];

  // 计算属性
  const activeTabName = computed(() => {
    const tab = formatTabs.find(t => t.id === activeTab.value);
    return tab ? tab.name : '';
  });

  const inputPlaceholder = computed(() => {
    const action = isFormatMode.value ? '格式化' : '压缩';
    const type = activeTabName.value;
    return `在此输入需要${action}的${type}内容...`;
  });

  const hasInput = computed(() => !!inputText.value);
  const hasOutput = computed(() => !!outputText.value);
  const canProcess = computed(() => hasInput.value && !processing.value);

  // JSON 格式化/压缩
  const formatJson = (text) => {
    try {
      const json = JSON.parse(text);
      
      // 如果需要排序键
      if (sortKeys.value) {
        const sortedJson = sortObjectKeys(json);
        return JSON.stringify(sortedJson, null, 2);
      }
      
      return JSON.stringify(json, null, 2);
    } catch (error) {
      throw new Error('JSON格式错误: ' + error.message);
    }
  };

  const compressJson = (text) => {
    try {
      const json = JSON.parse(text);
      return JSON.stringify(json);
    } catch (error) {
      throw new Error('JSON格式错误: ' + error.message);
    }
  };

  // 递归排序对象键
  const sortObjectKeys = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => sortObjectKeys(item));
    } else if (obj !== null && typeof obj === 'object') {
      const sortedKeys = Object.keys(obj).sort();
      const sortedObj = {};
      
      for (const key of sortedKeys) {
        sortedObj[key] = sortObjectKeys(obj[key]);
      }
      
      return sortedObj;
    }
    
    return obj;
  };

  // XML 格式化/压缩
  const formatXml = (text) => {
    try {
      // 简单的XML格式化实现
      // 在实际项目中，可能需要使用更专业的XML解析库
      const formatted = text
        // 在开始标签前添加换行和缩进
        .replace(/></g, '>\n<')
        // 处理自闭合标签
        .replace(/(\s+)(\/>)/g, '$1$2')
        // 处理属性
        .replace(/(\w+)=/g, '\n    $1=');
      
      // 添加缩进
      let indentLevel = 0;
      const lines = formatted.split('\n');
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // 如果是结束标签，减少缩进
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indentedLine = '  '.repeat(indentLevel) + trimmed;
        
        // 如果是开始标签且不是自闭合标签，增加缩进
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indentLevel++;
        }
        
        return indentedLine;
      });
      
      return indentedLines.join('\n');
    } catch (error) {
      throw new Error('XML格式化失败: ' + error.message);
    }
  };

  const compressXml = (text) => {
    try {
      // 简单的XML压缩实现
      return text
        // 移除标签之间的空白
        .replace(/>\s+</g, '><')
        // 移除属性周围的空白
        .replace(/\s+=\s+/g, '=')
        // 移除行首行尾空白
        .replace(/^\s+|\s+$/gm, '');
    } catch (error) {
      throw new Error('XML压缩失败: ' + error.message);
    }
  };

  // SQL 格式化/压缩
  const formatSql = (text) => {
    try {
      // 简单的SQL格式化实现
      // 在实际项目中，可能需要使用更专业的SQL解析库
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
        'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
        'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        'UNION', 'VALUES', 'SET', 'LIMIT', 'OFFSET'
      ];
      
      let formatted = text;
      
      // 处理关键字大小写
      if (uppercaseKeywords.value) {
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          formatted = formatted.replace(regex, keyword);
        });
      }
      
      // 添加换行和缩进
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, '\n' + keyword);
      });
      
      // 清理多余的换行
      formatted = formatted.replace(/\n\s*\n/g, '\n');
      
      // 添加缩进
      const lines = formatted.split('\n');
      const indentedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // 如果是WHERE、AND、OR等，增加缩进
        if (/^(WHERE|AND|OR|ORDER BY|GROUP BY|HAVING)/i.test(trimmed)) {
          return '  ' + trimmed;
        }
        
        return trimmed;
      });
      
      return indentedLines.join('\n');
    } catch (error) {
      throw new Error('SQL格式化失败: ' + error.message);
    }
  };

  const compressSql = (text) => {
    try {
      // 简单的SQL压缩实现
      return text
        // 移除注释
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 移除多余空白
        .replace(/\s+/g, ' ')
        // 移除关键字周围的空格
        .replace(/\s*(,|=|<|>|!|\+|-|\*|\/)\s*/g, '$1')
        // 移除括号周围的空格
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        // 清理首尾空白
        .trim();
    } catch (error) {
      throw new Error('SQL压缩失败: ' + error.message);
    }
  };

  // 处理文本
  const processText = async () => {
    if (!inputText.value || !inputText.value.trim()) {
      return;
    }
    
    processing.value = true;
    errorMessage.value = '';
    
    try {
      let result = '';
      
      switch (activeTab.value) {
        case 'json':
          result = isFormatMode.value 
            ? formatJson(inputText.value) 
            : compressJson(inputText.value);
          break;
        case 'xml':
          result = isFormatMode.value 
            ? formatXml(inputText.value) 
            : compressXml(inputText.value);
          break;
        case 'sql':
          result = isFormatMode.value 
            ? formatSql(inputText.value) 
            : compressSql(inputText.value);
          break;
      }
      
      outputText.value = result;
      return true;
    } catch (error) {
      errorMessage.value = error.message;
      outputText.value = '';
      return false;
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
      a.download = `${activeTab.value}_${isFormatMode.value ? 'formatted' : 'compressed'}.txt`;
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
    activeTab.value = 'json';
    isFormatMode.value = true;
    sortKeys.value = false;
    uppercaseKeywords.value = false;
    inputText.value = '';
    outputText.value = '';
    processing.value = false;
    errorMessage.value = '';
  };

  return {
    // 状态
    activeTab,
    isFormatMode,
    sortKeys,
    uppercaseKeywords,
    inputText,
    outputText,
    processing,
    errorMessage,
    formatTabs,
    
    // 计算属性
    activeTabName,
    inputPlaceholder,
    hasInput,
    hasOutput,
    canProcess,
    
    // 方法
    formatJson,
    compressJson,
    sortObjectKeys,
    formatXml,
    compressXml,
    formatSql,
    compressSql,
    processText,
    clearInput,
    copyOutput,
    downloadOutput,
    reset
  };
});