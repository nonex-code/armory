import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCaesarCipherStore = defineStore('caesarCipher', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  const shift = ref(3);
  const charset = ref('both');
  const processMode = ref('encrypt');
  const preserveCase = ref(true);
  const preserveNonAlpha = ref(true);
  const showFrequency = ref(false);
  const bruteForceResults = ref([]);
  const frequencyData = ref([]);
  
  // 示例文本
  const exampleText = 'The quick brown fox jumps over the lazy dog.';
  
  // 计算属性
  const hasInput = computed(() => inputText.value.length > 0);
  const hasOutput = computed(() => outputText.value.length > 0);
  const canProcess = computed(() => hasInput.value);
  const hasBruteForceResults = computed(() => bruteForceResults.value.length > 0);
  const hasFrequencyData = computed(() => frequencyData.value.length > 0);
  
  // 获取字符集
  const getCharset = () => {
    switch (charset.value) {
      case 'uppercase':
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      case 'lowercase':
        return 'abcdefghijklmnopqrstuvwxyz';
      case 'both':
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      case 'alphabet':
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      case 'ascii':
        // ASCII可打印字符 (32-126)
        let asciiChars = '';
        for (let i = 32; i <= 126; i++) {
          asciiChars += String.fromCharCode(i);
        }
        return asciiChars;
      default:
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }
  };
  
  // 凯撒密码处理函数
  const caesarCipher = (text, shiftValue, isDecrypt = false) => {
    const chars = getCharset();
    let result = '';
    
    // 如果是解密，反转偏移量
    if (isDecrypt) {
      shiftValue = chars.length - shiftValue;
    }
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let processedChar = char;
      
      // 检查是否需要处理此字符
      let shouldProcess = false;
      if (preserveNonAlpha.value && !/[A-Za-z0-9]/.test(char)) {
        shouldProcess = false;
      } else if (charset.value === 'uppercase' && /[A-Z]/.test(char)) {
        shouldProcess = true;
      } else if (charset.value === 'lowercase' && /[a-z]/.test(char)) {
        shouldProcess = true;
      } else if (charset.value === 'both' && /[A-Za-z]/.test(char)) {
        shouldProcess = true;
      } else if (charset.value === 'alphabet' && /[A-Za-z0-9]/.test(char)) {
        shouldProcess = true;
      } else if (charset.value === 'ascii') {
        shouldProcess = true;
      }
      
      if (shouldProcess) {
        const isUpper = char === char.toUpperCase() && /[A-Z]/.test(char);
        const isLower = char === char.toLowerCase() && /[a-z]/.test(char);
        
        // 获取字符在字符集中的位置
        let index = -1;
        if (charset.value === 'uppercase' && isUpper) {
          index = chars.indexOf(char);
        } else if (charset.value === 'lowercase' && isLower) {
          index = chars.indexOf(char);
        } else if (charset.value === 'both') {
          index = chars.indexOf(char);
        } else if (charset.value === 'alphabet') {
          index = chars.indexOf(char);
        } else if (charset.value === 'ascii') {
          index = chars.indexOf(char);
        }
        
        if (index !== -1) {
          // 应用偏移
          let newIndex = (index + shiftValue) % chars.length;
          if (newIndex < 0) newIndex += chars.length;
          
          processedChar = chars[newIndex];
          
          // 保留大小写
          if (preserveCase.value && charset.value === 'both') {
            if (isUpper && processedChar === processedChar.toLowerCase()) {
              processedChar = processedChar.toUpperCase();
            } else if (isLower && processedChar === processedChar.toUpperCase()) {
              processedChar = processedChar.toLowerCase();
            }
          }
        }
      }
      
      result += processedChar;
    }
    
    return result;
  };
  
  // 处理文本
  const processText = () => {
    if (!inputText.value) return;
    
    const isDecrypt = processMode.value === 'decrypt';
    const encrypted = caesarCipher(inputText.value, shift.value, isDecrypt);
    
    if (processMode.value === 'both') {
      const decrypted = caesarCipher(inputText.value, shift.value, true);
      outputText.value = `加密结果: ${encrypted}\n\n解密结果: ${decrypted}`;
    } else {
      outputText.value = encrypted;
    }
    
    // 显示频率分析
    if (showFrequency.value) {
      calculateFrequency();
    }
  };
  
  // 随机偏移量
  const randomShift = () => {
    shift.value = Math.floor(Math.random() * 25) + 1;
  };
  
  // 暴力破解
  const bruteForce = () => {
    if (!inputText.value) return;
    
    bruteForceResults.value = [];
    
    for (let i = 1; i < 26; i++) {
      const result = caesarCipher(inputText.value, i, true);
      bruteForceResults.value.push({
        shift: i,
        text: result
      });
    }
  };
  
  // 选择暴力破解结果
  const selectBruteForceResult = (result) => {
    outputText.value = result.text;
    shift.value = result.shift;
  };
  
  // 频率分析
  const frequencyAnalysis = () => {
    if (!inputText.value) return;
    
    calculateFrequency();
  };
  
  // 计算字符频率
  const calculateFrequency = () => {
    if (!inputText.value) return;
    
    const charCount = {};
    const totalChars = inputText.value.length;
    
    // 统计每个字符的出现次数
    for (const char of inputText.value) {
      if (/[a-zA-Z]/.test(char)) {
        const upperChar = char.toUpperCase();
        charCount[upperChar] = (charCount[upperChar] || 0) + 1;
      }
    }
    
    // 转换为数组并排序
    frequencyData.value = Object.entries(charCount)
      .map(([char, count]) => ({
        char,
        count,
        percentage: Math.round((count / totalChars) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  // 加载示例
  const loadExample = () => {
    inputText.value = exampleText;
    processText();
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    bruteForceResults.value = [];
    frequencyData.value = [];
  };
  
  // 复制结果
  const copyResult = () => {
    if (!outputText.value) return;
    
    navigator.clipboard.writeText(outputText.value)
      .then(() => {
        // 可以添加一个toast通知
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  // 交换输入输出
  const swapInputOutput = () => {
    if (!outputText.value) return;
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    bruteForceResults.value = [];
    frequencyData.value = [];
  };
  
  return {
    // 状态
    inputText,
    outputText,
    shift,
    charset,
    processMode,
    preserveCase,
    preserveNonAlpha,
    showFrequency,
    bruteForceResults,
    frequencyData,
    
    // 计算属性
    hasInput,
    hasOutput,
    canProcess,
    hasBruteForceResults,
    hasFrequencyData,
    
    // 方法
    processText,
    randomShift,
    bruteForce,
    selectBruteForceResult,
    frequencyAnalysis,
    loadExample,
    clearInput,
    copyResult,
    swapInputOutput
  };
});