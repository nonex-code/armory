import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useEncodingConverterStore = defineStore('encodingConverter', () => {
  const activeTab = ref('base64');
  const isEncodeMode = ref(true);
  const inputText = ref('');
  const outputText = ref('');
  const processing = ref(false);
  const errorMessage = ref('');
  const autoConvert = ref(false);
  
  const urlOptions = ref({
    encodeSpace: false,
    encodeAll: false
  });
  
  const hexOptions = ref({
    uppercase: false,
    separator: 'space'
  });
  
  const unicodeOptions = ref({
    format: 'escape'
  });
  
  const base64Options = ref({
    urlSafe: false
  });
  
  const encodingTabs = [
    { id: 'base64', name: 'Base64', icon: '🔤', description: 'Base64 编码/解码' },
    { id: 'base32', name: 'Base32', icon: '🔢', description: 'Base32 编码/解码' },
    { id: 'url', name: 'URL', icon: '🔗', description: 'URL 编码/解码' },
    { id: 'html', name: 'HTML实体', icon: '🌐', description: 'HTML 实体编码/解码' },
    { id: 'hex', name: 'Hex', icon: '🔢', description: '十六进制编码/解码' },
    { id: 'unicode', name: 'Unicode', icon: '🌏', description: 'Unicode 编码/解码' }
  ];
  
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
  
  const showOptions = computed(() => {
    return ['url', 'hex', 'unicode', 'base64'].includes(activeTab.value);
  });
  
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  
  const base64Encode = (text) => {
    let result = btoa(unescape(encodeURIComponent(text)));
    if (base64Options.value.urlSafe) {
      result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return result;
  };
  
  const base64Decode = (text) => {
    let str = text;
    if (base64Options.value.urlSafe || str.indexOf('-') !== -1 || str.indexOf('_') !== -1) {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
    }
    try {
      const decoded = atob(str);
      try {
        return decodeURIComponent(escape(decoded));
      } catch (e) {
        throw new Error('解码结果不是有效的 UTF-8 文本（可能为二进制数据，文本解码仅支持 UTF-8）');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('UTF-8')) throw e;
      throw new Error('输入包含无效的 Base64 字符');
    }
  };
  
  const base32Encode = (text) => {
    const bytes = new TextEncoder().encode(text);
    let bits = '';
    let result = '';
    
    for (let i = 0; i < bytes.length; i++) {
      bits += bytes[i].toString(2).padStart(8, '0');
    }
    
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.substr(i, 5).padEnd(5, '0');
      const index = parseInt(chunk, 2);
      result += base32Chars[index];
    }
    
    // 按 RFC 4648 计算 padding：每 8 个字符一组，不足补 '='
    const charCount = Math.ceil(bits.length / 5);
    const padding = (8 - (charCount % 8)) % 8;
    if (padding > 0) {
      result += '='.repeat(padding);
    }
    
    return result;
  };
  
  const base32Decode = (text) => {
    const cleanText = text.replace(/=/g, '');
    let bits = '';
    
    for (let i = 0; i < cleanText.length; i++) {
      const index = base32Chars.indexOf(cleanText[i].toUpperCase());
      if (index === -1) {
        throw new Error('无效的Base32字符');
      }
      bits += index.toString(2).padStart(5, '0');
    }
    
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        const byte = parseInt(bits.substr(i, 8), 2);
        bytes.push(byte);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
  
  const urlEncode = (text) => {
    if (urlOptions.value.encodeAll) {
      // 按 UTF-8 字节做百分号编码，保证非 ASCII 字符（中文/emoji）与标准解码器互操作
      const bytes = new TextEncoder().encode(text);
      return Array.from(bytes)
        .map(byte => '%' + byte.toString(16).toUpperCase().padStart(2, '0'))
        .join('');
    }
    
    let result = encodeURIComponent(text);
    if (!urlOptions.value.encodeSpace) {
      result = result.replace(/%20/g, '+');
    }
    return result;
  };
  
  const urlDecode = (text) => {
    let str = text.replace(/\+/g, ' ');
    return decodeURIComponent(str);
  };
  
  const htmlEncode = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    // 补充转义单引号，防止用于单引号包裹的属性时破坏边界
    return div.innerHTML.replace(/'/g, '&#39;');
  };
  
  const htmlDecode = (text) => {
    // 使用 textarea 按 raw text 解析：只解码实体，不创建任何元素，避免 XSS
    const ta = document.createElement('textarea');
    ta.innerHTML = text;
    return ta.value;
  };
  
  const hexEncode = (text) => {
    const bytes = new TextEncoder().encode(text);
    const separator = hexOptions.value.separator === 'none' ? '' : 
                      hexOptions.value.separator === 'colon' ? ':' : ' ';
    
    let result = Array.from(bytes)
      .map(byte => {
        const hex = byte.toString(16);
        return hexOptions.value.uppercase ? hex.toUpperCase().padStart(2, '0') : hex.padStart(2, '0');
      })
      .join(separator);
    
    return result;
  };
  
  const hexDecode = (text) => {
    // 兼容 0x/0X 前缀（如 "0x41 0x42"）
    const hexStr = text.replace(/[\s:]/g, '').replace(/0[xX]/g, '');
    if (!/^[0-9a-fA-F]*$/.test(hexStr)) {
      throw new Error('无效的十六进制字符');
    }
    if (hexStr.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须为偶数');
    }
    const bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
      bytes.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  };
  
  const unicodeEncode = (text) => {
    const format = unicodeOptions.value.format;
    
    return Array.from(text)
      .map(char => {
        const code = char.codePointAt(0);
        
        switch (format) {
          case 'escape':
            if (code > 0xFFFF) {
              return `\\u{${code.toString(16).toUpperCase()}}`;
            }
            return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
          case 'html':
            return `&#${code};`;
          case 'hex':
            // 大于 0xFF 的码点不能用 \xXX 表示（会破坏往返解码），改用 \uXXXX
            if (code > 0xFF) {
              return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
            }
            return `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`;
          case 'codepoint':
            return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
          default:
            return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
        }
      })
      .join('');
  };
  
  const unicodeDecode = (text) => {
    return text
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => 
        String.fromCodePoint(parseInt(hex, 16))
      )
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/&#(\d+);/g, (_, code) => 
        String.fromCodePoint(parseInt(code, 10))
      )
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => 
        String.fromCodePoint(parseInt(hex, 16))
      )
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/U\+([0-9a-fA-F]{4,})/g, (_, hex) => 
        String.fromCodePoint(parseInt(hex, 16))
      );
  };
  
  const processText = async () => {
    if (!inputText.value || !inputText.value.trim()) {
      outputText.value = '';
      errorMessage.value = '';
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
        case 'hex':
          result = isEncodeMode.value 
            ? hexEncode(inputText.value) 
            : hexDecode(inputText.value);
          break;
        case 'unicode':
          result = isEncodeMode.value 
            ? unicodeEncode(inputText.value) 
            : unicodeDecode(inputText.value);
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
  
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    errorMessage.value = '';
  };
  
  const copyOutput = async () => {
    if (outputText.value) {
      try {
        await navigator.clipboard.writeText(outputText.value);
        return true;
      } catch (err) {
        console.error('复制失败:', err);
        return false;
      }
    }
    return false;
  };
  
  const downloadOutput = () => {
    if (!outputText.value) return false;
    
    try {
      const blob = new Blob([outputText.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab.value}_${isEncodeMode.value ? 'encoded' : 'decoded'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 延迟回收，避免下载尚未开始时 URL 已被释放
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      return false;
    }
  };
  
  const switchTab = (tabId) => {
    activeTab.value = tabId;
    outputText.value = '';
    errorMessage.value = '';
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
  };
  
  const toggleMode = () => {
    isEncodeMode.value = !isEncodeMode.value;
    outputText.value = '';
    errorMessage.value = '';
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
  };
  
  // 防抖定时器：避免大文本/高频输入时同步转换卡死 UI
  let debounceTimer = null;
  // 交换输入输出时抑制 watch 触发的一次多余转换
  let suppressNextWatch = false;

  const scheduleAutoConvert = () => {
    if (!autoConvert.value || !inputText.value.trim()) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => processText(), 200);
  };

  const swapInputOutput = () => {
    if (!outputText.value) return;
    const temp = inputText.value;
    suppressNextWatch = true;
    isEncodeMode.value = !isEncodeMode.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    errorMessage.value = '';
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
  };
  
  const toggleAutoConvert = () => {
    autoConvert.value = !autoConvert.value;
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
  };
  
  watch([urlOptions, hexOptions, unicodeOptions, base64Options], () => {
    scheduleAutoConvert();
  }, { deep: true });
  
  watch(inputText, () => {
    if (suppressNextWatch) {
      suppressNextWatch = false;
      return;
    }
    scheduleAutoConvert();
  });
  
  return {
    activeTab,
    isEncodeMode,
    inputText,
    outputText,
    processing,
    errorMessage,
    autoConvert,
    encodingTabs,
    urlOptions,
    hexOptions,
    unicodeOptions,
    base64Options,
    
    activeTabName,
    inputPlaceholder,
    hasInput,
    hasOutput,
    canProcess,
    hasError,
    showOptions,
    
    processText,
    clearInput,
    copyOutput,
    downloadOutput,
    switchTab,
    toggleMode,
    swapInputOutput,
    toggleAutoConvert
  };
});
