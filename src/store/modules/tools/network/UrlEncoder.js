import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';

export const useUrlEncoderStore = defineStore('urlEncoder', () => {
  // 状态
  const encodeInput = ref('');
  const encodeOutput = ref('');
  const decodeInput = ref('');
  const decodeOutput = ref('');
  
  // 编码选项
  const encodeOptions = reactive({
    encodeSpace: false,
    encodeAll: false
  });
  
  // 示例数据
  const examples = ref([
    {
      name: '中文URL',
      original: 'https://example.com/search?q=中文测试',
      encoded: 'https://example.com/search?q=%E4%B8%AD%E6%96%87%E6%B5%8B%E8%AF%95'
    },
    {
      name: '带空格的URL',
      original: 'https://example.com/path with spaces',
      encoded: 'https://example.com/path%20with%20spaces'
    },
    {
      name: '特殊字符',
      original: 'name=John Doe&age=30&city=New York',
      encoded: 'name=John%20Doe&age=30&city=New%20York'
    },
    {
      name: '查询参数',
      original: '?filter=price>100&sort=desc',
      encoded: '%3Ffilter%3Dprice%3E100%26sort%3Ddesc'
    },
    {
      name: '邮箱地址',
      original: 'user@example.com',
      encoded: 'user%40example.com'
    },
    {
      name: '文件路径',
      original: '/path/to/文件 名称.txt',
      encoded: '/path/to/%E6%96%87%E4%BB%B6%20%E5%90%8D%E7%A7%B0.txt'
    }
  ]);
  
  // 计算属性
  const canEncode = computed(() => encodeInput.value.length > 0);
  const canDecode = computed(() => decodeInput.value.length > 0);
  const hasEncodeOutput = computed(() => encodeOutput.value.length > 0);
  const hasDecodeOutput = computed(() => decodeOutput.value.length > 0);
  
  // URL编码函数
  const encodeURIComponentSafe = (str, options = {}) => {
    if (!str) return '';
    
    if (options.encodeAll) {
      // 编码所有字符
      return encodeURIComponent(str);
    } else {
      // 只编码URL不安全字符
      let encoded = encodeURIComponent(str);
      
      // 处理空格编码选项
      if (options.encodeSpace) {
        encoded = encoded.replace(/\+/g, '%20');
      }
      
      return encoded;
    }
  };
  
  // URL解码函数
  const decodeURIComponentSafe = (str) => {
    if (!str) return '';
    
    try {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (error) {
      // 如果解码失败，尝试逐字符解码
      let result = '';
      let i = 0;
      
      while (i < str.length) {
        if (str[i] === '%' && i + 2 < str.length) {
          const hex = str.substring(i + 1, i + 3);
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            result += String.fromCharCode(parseInt(hex, 16));
            i += 3;
          } else {
            result += str[i];
            i += 1;
          }
        } else {
          result += str[i];
          i += 1;
        }
      }
      
      return result;
    }
  };
  
  // 执行编码
  const performEncode = () => {
    if (!encodeInput.value) return;
    
    try {
      encodeOutput.value = encodeURIComponentSafe(encodeInput.value, encodeOptions);
    } catch (error) {
      encodeOutput.value = '编码失败：' + error.message;
    }
  };
  
  // 执行解码
  const performDecode = () => {
    if (!decodeInput.value) return;
    
    try {
      decodeOutput.value = decodeURIComponentSafe(decodeInput.value);
    } catch (error) {
      decodeOutput.value = '解码失败：' + error.message;
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加复制成功的提示
      console.log('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败：', error);
    }
  };
  
  // 清空编码区域
  const clearEncode = () => {
    encodeInput.value = '';
    encodeOutput.value = '';
  };
  
  // 清空解码区域
  const clearDecode = () => {
    decodeInput.value = '';
    decodeOutput.value = '';
  };
  
  // 加载示例
  const loadExample = (example) => {
    encodeInput.value = example.original;
    decodeInput.value = example.encoded;
    
    // 自动执行编码解码
    performEncode();
    performDecode();
  };
  
  // 交换编码解码区域
  const swapEncodeDecode = () => {
    const tempInput = encodeInput.value;
    const tempOutput = encodeOutput.value;
    
    encodeInput.value = decodeInput.value;
    encodeOutput.value = decodeOutput.value;
    decodeInput.value = tempInput;
    decodeOutput.value = tempOutput;
  };
  
  return {
    // 状态
    encodeInput,
    encodeOutput,
    decodeInput,
    decodeOutput,
    encodeOptions,
    examples,
    
    // 计算属性
    canEncode,
    canDecode,
    hasEncodeOutput,
    hasDecodeOutput,
    
    // 方法
    performEncode,
    performDecode,
    copyToClipboard,
    clearEncode,
    clearDecode,
    loadExample,
    swapEncodeDecode
  };
});