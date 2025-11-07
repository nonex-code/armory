import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import CryptoJS from 'crypto-js';

export const useAesEncryptStore = defineStore('aesEncrypt', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  const secretKey = ref('');
  const showKey = ref(false);
  const keyError = ref('');
  const keySize = ref('256');
  const mode = ref('CBC');
  const padding = ref('Pkcs7');
  const outputFormat = ref('base64');
  const processingInfo = ref('');
  
  // 示例文本
  const exampleText = '这是一段需要加密的敏感信息，包含重要数据。';
  
  // 计算属性
  const hasInput = computed(() => !!inputText.value.trim());
  const hasOutput = computed(() => !!outputText.value.trim());
  const hasKey = computed(() => !!secretKey.value.trim());
  const canProcess = computed(() => hasInput.value && hasKey.value && !keyError.value);
  
  // 切换密钥可见性
  const toggleKeyVisibility = () => {
    showKey.value = !showKey.value;
  };
  
  // 生成随机密钥
  const generateKey = () => {
    const bits = parseInt(keySize.value);
    const bytes = bits / 8;
    const randomBytes = CryptoJS.lib.WordArray.random(bytes);
    secretKey.value = randomBytes.toString(CryptoJS.enc.Hex);
    keyError.value = '';
  };
  
  // 验证密钥
  const validateKey = () => {
    if (!secretKey.value) {
      keyError.value = '请输入密钥';
      return false;
    }
    
    const bits = parseInt(keySize.value);
    const requiredBytes = bits / 8;
    
    // 检查密钥长度
    let keyBytes;
    try {
      if (outputFormat.value === 'hex') {
        keyBytes = CryptoJS.enc.Hex.parse(secretKey.value);
      } else {
        keyBytes = CryptoJS.enc.Base64.parse(secretKey.value);
      }
    } catch (error) {
      keyError.value = '密钥格式无效';
      return false;
    }
    
    if (keyBytes.sigBytes < requiredBytes) {
      keyError.value = `密钥长度不足，${bits}位加密需要至少${requiredBytes}字节密钥`;
      return false;
    }
    
    keyError.value = '';
    return true;
  };
  
  // 加密文本
  const encryptText = () => {
    if (!validateKey()) return;
    if (!inputText.value) return;
    
    try {
      // 准备密钥
      let key;
      try {
        key = CryptoJS.enc.Hex.parse(secretKey.value);
      } catch (error) {
        // 如果不是十六进制，尝试直接作为字符串处理
        key = CryptoJS.enc.Utf8.parse(secretKey.value);
      }
      
      // 准备配置
      const config = {
        mode: getCryptoMode(),
        padding: getCryptoPadding()
      };
      
      // 对于CBC模式，生成随机IV
      if (mode.value === 'CBC') {
        const iv = CryptoJS.lib.WordArray.random(16);
        config.iv = iv;
      }
      
      // 加密
      let encrypted;
      if (mode.value === 'GCM') {
        // GCM模式需要特殊处理
        const iv = CryptoJS.lib.WordArray.random(12);
        encrypted = CryptoJS.AES.encrypt(inputText.value, key, {
          iv: iv,
          mode: CryptoJS.mode.GCM,
          padding: CryptoJS.pad.Pkcs7
        });
        
        // 将IV和加密数据组合
        const combined = iv.clone().concat(encrypted.ciphertext);
        outputText.value = outputFormat.value === 'base64' 
          ? combined.toString(CryptoJS.enc.Base64)
          : combined.toString(CryptoJS.enc.Hex);
      } else {
        encrypted = CryptoJS.AES.encrypt(inputText.value, key, config);
        outputText.value = outputFormat.value === 'base64' 
          ? encrypted.toString()
          : encrypted.ciphertext.toString(CryptoJS.enc.Hex);
      }
      
      processingInfo.value = `加密成功！使用${keySize.value}位密钥，${mode.value}模式`;
    } catch (error) {
      outputText.value = `加密错误: ${error.message}`;
      processingInfo.value = '';
    }
  };
  
  // 解密文本
  const decryptText = () => {
    if (!validateKey()) return;
    if (!inputText.value) return;
    
    try {
      // 准备密钥
      let key;
      try {
        key = CryptoJS.enc.Hex.parse(secretKey.value);
      } catch (error) {
        // 如果不是十六进制，尝试直接作为字符串处理
        key = CryptoJS.enc.Utf8.parse(secretKey.value);
      }
      
      // 准备配置
      const config = {
        mode: getCryptoMode(),
        padding: getCryptoPadding()
      };
      
      // 准备密文
      let ciphertext;
      if (outputFormat.value === 'hex') {
        ciphertext = CryptoJS.enc.Hex.parse(inputText.value);
      } else {
        ciphertext = CryptoJS.enc.Base64.parse(inputText.value);
      }
      
      // 对于CBC模式，提取IV
      if (mode.value === 'CBC') {
        if (ciphertext.sigBytes < 16) {
          throw new Error('密文长度不足以包含IV');
        }
        const iv = CryptoJS.lib.WordArray.create(ciphertext.words.slice(0, 4));
        ciphertext = CryptoJS.lib.WordArray.create(ciphertext.words.slice(4), ciphertext.sigBytes - 16);
        config.iv = iv;
      }
      
      // 对于GCM模式，提取IV
      if (mode.value === 'GCM') {
        if (ciphertext.sigBytes < 12) {
          throw new Error('密文长度不足以包含IV');
        }
        const iv = CryptoJS.lib.WordArray.create(ciphertext.words.slice(0, 3));
        ciphertext = CryptoJS.lib.WordArray.create(ciphertext.words.slice(3), ciphertext.sigBytes - 12);
        config.iv = iv;
      }
      
      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        CryptoJS.lib.CipherParams.create({ ciphertext }),
        key,
        config
      );
      
      outputText.value = decrypted.toString(CryptoJS.enc.Utf8);
      processingInfo.value = `解密成功！使用${keySize.value}位密钥，${mode.value}模式`;
    } catch (error) {
      outputText.value = `解密错误: ${error.message}`;
      processingInfo.value = '';
    }
  };
  
  // 获取加密模式
  const getCryptoMode = () => {
    switch (mode.value) {
      case 'CBC': return CryptoJS.mode.CBC;
      case 'ECB': return CryptoJS.mode.ECB;
      case 'CFB': return CryptoJS.mode.CFB;
      case 'OFB': return CryptoJS.mode.OFB;
      case 'CTR': return CryptoJS.mode.CTR;
      case 'GCM': return CryptoJS.mode.GCM;
      default: return CryptoJS.mode.CBC;
    }
  };
  
  // 获取填充方式
  const getCryptoPadding = () => {
    switch (padding.value) {
      case 'Pkcs7': return CryptoJS.pad.Pkcs7;
      case 'Iso97971': return CryptoJS.pad.Iso97971;
      case 'AnsiX923': return CryptoJS.pad.AnsiX923;
      case 'Iso10126': return CryptoJS.pad.Iso10126;
      case 'ZeroPadding': return CryptoJS.pad.ZeroPadding;
      case 'NoPadding': return CryptoJS.pad.NoPadding;
      default: return CryptoJS.pad.Pkcs7;
    }
  };
  
  // 加载示例
  const loadExample = () => {
    inputText.value = exampleText;
    generateKey();
  };
  
  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    processingInfo.value = '';
  };
  
  // 复制结果
  const copyResult = async () => {
    if (!outputText.value) return;
    
    try {
      await navigator.clipboard.writeText(outputText.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  // 交换输入输出
  const swapInputOutput = () => {
    if (!outputText.value) return;
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    processingInfo.value = '';
  };
  
  return {
    // 状态
    inputText,
    outputText,
    secretKey,
    showKey,
    keyError,
    keySize,
    mode,
    padding,
    outputFormat,
    processingInfo,
    
    // 计算属性
    hasInput,
    hasOutput,
    hasKey,
    canProcess,
    
    // 方法
    toggleKeyVisibility,
    generateKey,
    validateKey,
    encryptText,
    decryptText,
    loadExample,
    clearInput,
    copyResult,
    swapInputOutput
  };
});