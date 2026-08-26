import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import CryptoJS from 'crypto-js';

export const useHashCalculatorStore = defineStore('hashCalculator', () => {
  // 状态
  const inputType = ref('text'); // 'text' 或 'file'
  const inputText = ref('');
  const uploadedFile = ref(null);
  const selectedAlgorithms = ref(['md5', 'sha256']); // 默认选择MD5和SHA256
  const hashResults = ref({});
  const processing = ref(false);
  const errorMessage = ref('');
  // 文件是否正在读取中（防止读取完成前误算旧数据）
  const isFileLoading = ref(false);
  // 文件字节内容（按二进制读取，保证任意文件哈希正确）
  const fileWordArray = ref(null);
  
  // 哈希算法列表
  const hashAlgorithms = ref([
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' },
    { value: 'sha3', label: 'SHA-3' }
  ]);
  
  // 计算属性
  const hasInput = computed(() => {
    if (inputType.value === 'text') return !!inputText.value.trim();
    return !!uploadedFile.value;
  });
  
  const hasResults = computed(() => {
    return Object.keys(hashResults.value).length > 0;
  });
  
  const canCalculate = computed(() => {
    if (!selectedAlgorithms.value.length) return false;
    if (inputType.value === 'file') {
      // 文件模式下必须等文件读取完成，避免算到旧数据
      return !!uploadedFile.value && !isFileLoading.value && !!fileWordArray.value;
    }
    return !!inputText.value.trim();
  });
  
  // 方法
  // 处理文件变化
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      uploadedFile.value = null;
      fileWordArray.value = null;
      isFileLoading.value = false;
      return;
    }
    
    uploadedFile.value = file;
    readUploadedFile();
  };
  
  // 读取上传的文件（按二进制读取，哈希结果与 md5sum 等命令行工具一致）
  const readUploadedFile = () => {
    if (!uploadedFile.value) return;
    
    isFileLoading.value = true;
    errorMessage.value = '';
    fileWordArray.value = null;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        fileWordArray.value = CryptoJS.lib.WordArray.create(bytes);
        isFileLoading.value = false;
      } catch (error) {
        isFileLoading.value = false;
        errorMessage.value = `文件读取失败: ${error.message}`;
      }
    };
    reader.onerror = () => {
      isFileLoading.value = false;
      fileWordArray.value = null;
      errorMessage.value = '文件读取失败，请重试';
    };
    reader.readAsArrayBuffer(uploadedFile.value);
  };
  
  // 计算哈希值
  const calculateHash = async () => {
    if (!canCalculate.value) {
      if (inputType.value === 'file' && isFileLoading.value) {
        errorMessage.value = '文件正在读取中，请稍候...';
      } else {
        errorMessage.value = '请输入文本或上传文件';
      }
      return;
    }
    
    if (selectedAlgorithms.value.length === 0) {
      errorMessage.value = '请至少选择一种哈希算法';
      return;
    }
    
    processing.value = true;
    errorMessage.value = '';
    hashResults.value = {};
    
    try {
      // 模拟异步处理
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = {};
      // 文件模式使用按字节读取的内容，文本模式使用字符串
      const source = inputType.value === 'file' ? fileWordArray.value : inputText.value;
      
      // 计算每种选定的哈希算法
      for (const algorithm of selectedAlgorithms.value) {
        let hash;
        
        switch (algorithm) {
          case 'md5':
            hash = CryptoJS.MD5(source).toString();
            break;
          case 'sha1':
            hash = CryptoJS.SHA1(source).toString();
            break;
          case 'sha256':
            hash = CryptoJS.SHA256(source).toString();
            break;
          case 'sha512':
            hash = CryptoJS.SHA512(source).toString();
            break;
          case 'sha3':
            hash = CryptoJS.SHA3(source).toString();
            break;
          default:
            continue;
        }
        
        results[algorithm] = hash;
      }
      
      hashResults.value = results;
    } catch (error) {
      errorMessage.value = `计算哈希值失败: ${error.message}`;
    } finally {
      processing.value = false;
    }
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    uploadedFile.value = null;
    fileWordArray.value = null;
    isFileLoading.value = false;
    hashResults.value = {};
    errorMessage.value = '';
  };
  
  // 复制单个结果
  const copyResult = (text) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('复制失败:', err);
    });
  };
  
  // 复制所有结果
  const copyAllResults = () => {
    let allResults = '';
    
    for (const [algorithm, result] of Object.entries(hashResults.value)) {
      const label = getAlgorithmLabel(algorithm);
      allResults += `${label}: ${result}\n`;
    }
    
    navigator.clipboard.writeText(allResults).catch(err => {
      console.error('复制失败:', err);
    });
  };
  
  // 下载结果
  const downloadResults = () => {
    let content = '';
    
    for (const [algorithm, result] of Object.entries(hashResults.value)) {
      const label = getAlgorithmLabel(algorithm);
      content += `${label}: ${result}\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hash_results_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 获取算法标签
  const getAlgorithmLabel = (algorithm) => {
    const algo = hashAlgorithms.value.find(a => a.value === algorithm);
    return algo ? algo.label : algorithm.toUpperCase();
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    // 状态
    inputType,
    inputText,
    uploadedFile,
    selectedAlgorithms,
    hashResults,
    processing,
    errorMessage,
    isFileLoading,
    hashAlgorithms,
    
    // 计算属性
    hasInput,
    hasResults,
    canCalculate,
    
    // 方法
    handleFileChange,
    calculateHash,
    clearInput,
    copyResult,
    copyAllResults,
    downloadResults,
    getAlgorithmLabel,
    formatFileSize
  };
});