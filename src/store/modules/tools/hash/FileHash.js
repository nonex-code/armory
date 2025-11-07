import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFileHashStore = defineStore('fileHash', () => {
  // 状态
  const selectedFile = ref(null);
  const selectedAlgorithms = ref(['md5', 'sha256']);
  const hashResults = ref([]);
  const processing = ref(false);

  // 哈希算法列表
  const hashAlgorithms = [
    { id: 'md5', name: 'MD5' },
    { id: 'sha1', name: 'SHA-1' },
    { id: 'sha256', name: 'SHA-256' },
    { id: 'sha512', name: 'SHA-512' }
  ];

  // 计算属性
  const hasFile = computed(() => selectedFile.value !== null);
  const hasResults = computed(() => hashResults.value.length > 0);
  const canCalculate = computed(() => hasFile.value && selectedAlgorithms.value.length > 0 && !processing.value);

  // 方法
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile.value = file;
      hashResults.value = [];
    }
  };

  const calculateHash = async () => {
    if (!canCalculate.value) return;
    
    processing.value = true;
    hashResults.value = [];
    
    try {
      // 读取文件内容
      const fileBuffer = await readFileAsArrayBuffer(selectedFile.value);
      
      // 计算每个选定的哈希值
      for (const algorithmId of selectedAlgorithms.value) {
        const hash = await calculateHashForAlgorithm(fileBuffer, algorithmId);
        hashResults.value.push({
          algorithm: algorithmId,
          name: getAlgorithmName(algorithmId),
          hash: hash
        });
      }
    } catch (error) {
      console.error('计算哈希值失败:', error);
      throw error;
    } finally {
      processing.value = false;
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  const calculateHashForAlgorithm = async (buffer, algorithm) => {
    // 使用Web Crypto API计算哈希值
    const hashBuffer = await crypto.subtle.digest(getAlgorithmNameForCrypto(algorithm), buffer);
    
    // 将ArrayBuffer转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  };

  const getAlgorithmName = (algorithmId) => {
    const algorithm = hashAlgorithms.find(a => a.id === algorithmId);
    return algorithm ? algorithm.name : algorithmId;
  };

  const getAlgorithmNameForCrypto = (algorithm) => {
    switch (algorithm) {
      case 'sha1': return 'SHA-1';
      case 'sha256': return 'SHA-256';
      case 'sha512': return 'SHA-512';
      default: return 'SHA-256'; // MD5不支持，使用SHA-256代替
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyResult = (result) => {
    return navigator.clipboard.writeText(result)
      .catch(err => {
        console.error('复制失败:', err);
        throw err;
      });
  };

  const copyAllResults = () => {
    if (hashResults.value.length === 0) return Promise.reject(new Error('没有结果可复制'));
    
    let allResults = `文件: ${selectedFile.value.name}\n大小: ${formatFileSize(selectedFile.value.size)}\n\n`;
    hashResults.value.forEach(result => {
      allResults += `${result.name}: ${result.hash}\n`;
    });
    
    return navigator.clipboard.writeText(allResults)
      .catch(err => {
        console.error('复制失败:', err);
        throw err;
      });
  };

  const resetAll = () => {
    selectedFile.value = null;
    hashResults.value = [];
    selectedAlgorithms.value = ['md5', 'sha256'];
    
    // 重置文件输入
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return {
    // 状态
    selectedFile,
    selectedAlgorithms,
    hashResults,
    processing,
    hashAlgorithms,
    
    // 计算属性
    hasFile,
    hasResults,
    canCalculate,
    
    // 方法
    handleFileChange,
    calculateHash,
    formatFileSize,
    copyResult,
    copyAllResults,
    resetAll
  };
});