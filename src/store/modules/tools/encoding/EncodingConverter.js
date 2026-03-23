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
    return decodeURIComponent(escape(atob(str)));
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
    
    const padding = (8 - (bits.length % 40)) % 8;
    if (padding > 0) {
      result = result.slice(0, -padding) + '='.repeat(padding);
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
      return Array.from(text)
        .map(char => {
          const code = char.charCodeAt(0);
          return '%' + code.toString(16).toUpperCase().padStart(2, '0');
        })
        .join('');
    }
    
    let result = encodeURIComponent(text);
    if (urlOptions.value.encodeSpace) {
      result = result.replace(/%20/g, '%20');
    } else {
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
    return div.innerHTML;
  };
  
  const htmlDecode = (text) => {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
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
    const hexStr = text.replace(/[\s:]/g, '');
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
  
  const swapInputOutput = () => {
    if (!outputText.value) return;
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    isEncodeMode.value = !isEncodeMode.value;
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
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
  }, { deep: true });
  
  watch(inputText, () => {
    if (autoConvert.value && inputText.value.trim()) {
      processText();
    }
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
