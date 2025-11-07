import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEncodingConverterStore = defineStore('encodingConverter', () => {
  // 状态
  const activeTab = ref('base64');
  const isEncodeMode = ref(true); // true为编码，false为解码
  const inputText = ref('');
  const outputText = ref('');
  const processing = ref(false);
  const errorMessage = ref('');
  
  // 编码类型标签页
  const encodingTabs = [
    { id: 'base64', name: 'Base64', icon: '🔤' },
    { id: 'base32', name: 'Base32', icon: '🔢' },
    { id: 'url', name: 'URL', icon: '🔗' },
    { id: 'html', name: 'HTML实体', icon: '🌐' }
  ];
  
  // 计算属性
  const activeTabName = computed(() => {
    const tab = encodingTabs.find(t => t.id === activeTab.value);
    return tab ? tab.name : '';
  });
  
  const inputPlaceholder = computed(() => {
    const action = isEncodeMode.value ? '编码' : '解码';
    const type = activeTabName.value;
    return `在此输入需要${type}${action}的内容...`;
  });
  
  const hasInput = computed(() => inputText.value.trim().length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canProcess = computed(() => hasInput.value && !processing.value);
  const hasError = computed(() => errorMessage.value.length > 0);
  
  // Base32 编码字符集
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  
  // Base64 编码/解码
  const base64Encode = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };
  
  const base64Decode = (text) => {
    return decodeURIComponent(escape(atob(text)));
  };
  
  // Base32 编码/解码
  const base32Encode = (text) => {
    const bytes = new TextEncoder().encode(text);
    let bits = '';
    let result = '';
    
    // 将字节转换为二进制字符串
    for (let i = 0; i < bytes.length; i++) {
      bits += bytes[i].toString(2).padStart(8, '0');
    }
    
    // 将二进制字符串按5位分组，转换为Base32字符
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.substr(i, 5).padEnd(5, '0');
      const index = parseInt(chunk, 2);
      result += base32Chars[index];
    }
    
    // 添加填充字符
    const padding = (8 - (bits.length % 40)) % 8;
    if (padding > 0) {
      result = result.slice(0, -padding) + '='.repeat(padding);
    }
    
    return result;
  };
  
  const base32Decode = (text) => {
    // 移除填充字符
    const cleanText = text.replace(/=/g, '');
    let bits = '';
    
    // 将Base32字符转换为5位二进制
    for (let i = 0; i < cleanText.length; i++) {
      const index = base32Chars.indexOf(cleanText[i].toUpperCase());
      if (index === -1) {
        throw new Error('无效的Base32字符');
      }
      bits += index.toString(2).padStart(5, '0');
    }
    
    // 将二进制字符串按8位分组，转换为字节
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        const byte = parseInt(bits.substr(i, 8), 2);
        bytes.push(byte);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
  
  // URL 编码/解码
  const urlEncode = (text) => {
    return encodeURIComponent(text);
  };
  
  const urlDecode = (text) => {
    return decodeURIComponent(text);
  };
  
  // HTML 实体编码/解码
  const htmlEncode = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const htmlDecode = (text) => {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
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
        case 'base64':
          result = isEncodeMode.value 
            ? base64Encode(inputText.value) 
            : base64Decode(inputText.value);
          break;
        case 'base32':
          result = isEncodeMode.value 
            ? base32Encode(inputText.value) 
            : base32Decode(inputText.value);
          break;
        case 'url':
          result = isEncodeMode.value 
            ? urlEncode(inputText.value) 
            : urlDecode(inputText.value);
          break;
        case 'html':
          result = isEncodeMode.value 
            ? htmlEncode(inputText.value) 
            : htmlDecode(inputText.value);
          break;
      }
      
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
    a.download = `${activeTab.value}_${isEncodeMode.value ? 'encoded' : 'decoded'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return {
    // 状态
    activeTab,
    isEncodeMode,
    inputText,
    outputText,
    processing,
    errorMessage,
    encodingTabs,
    
    // 计算属性
    activeTabName,
    inputPlaceholder,
    hasInput,
    hasOutput,
    canProcess,
    hasError,
    
    // 方法
    processText,
    clearInput,
    copyOutput,
    downloadOutput
  };
});