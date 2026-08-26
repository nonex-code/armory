import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import CryptoJS from 'crypto-js';

export const useAesEncryptStore = defineStore('aesEncrypt', () => {
  const inputText = ref('');
  const outputText = ref('');
  const secretKey = ref('');
  const showKey = ref(false);
  const keyError = ref('');
  const processingInfo = ref('');
  const lastOperation = ref('');
  
  const keySize = ref('256');
  const mode = ref('CBC');
  const padding = ref('Pkcs7');
  const outputFormat = ref('base64');

  // crypto-js 不支持 GCM（CryptoJS.mode.GCM 不存在），若外部传入 GCM 则回退 CBC，避免静默降级
  if (mode.value === 'GCM') {
    mode.value = 'CBC';
  }
  const showAdvancedOptions = ref(false);
  const keyFormat = ref('utf8');
  const ivValue = ref('');
  const autoGenerateIv = ref(true);
  const showIv = ref(false);
  const lastGeneratedIv = ref('');
  
  const exampleText = '这是一段需要加密的敏感信息，包含重要数据。';
  
  const hasInput = computed(() => !!inputText.value.trim());
  const hasOutput = computed(() => !!outputText.value.trim());
  const hasKey = computed(() => !!secretKey.value.trim());
  const canProcess = computed(() => hasInput.value && hasKey.value && !keyError.value);
  const needsIv = computed(() => {
    return ['CBC', 'CFB', 'OFB', 'CTR'].includes(mode.value);
  });
  const hasIv = computed(() => !!ivValue.value.trim());
  
  watch([keySize, keyFormat], () => {
    if (secretKey.value) {
      validateKey();
    }
  });
  
  watch(mode, (newMode) => {
    if (newMode === 'ECB') {
      ivValue.value = '';
      lastGeneratedIv.value = '';
    }
  });
  
  const toggleKeyVisibility = () => {
    showKey.value = !showKey.value;
  };
  
  const toggleIvVisibility = () => {
    showIv.value = !showIv.value;
  };
  
  const toggleAdvancedOptions = () => {
    showAdvancedOptions.value = !showAdvancedOptions.value;
  };
  
  const generateKey = () => {
    const bits = parseInt(keySize.value);
    const bytes = bits / 8;
    const randomBytes = CryptoJS.lib.WordArray.random(bytes);
    secretKey.value = randomBytes.toString(CryptoJS.enc.Hex);
    keyFormat.value = 'hex';
    keyError.value = '';
    processingInfo.value = `已生成${bits}位随机密钥`;
  };
  
  const generateIv = () => {
    const ivLength = mode.value === 'GCM' ? 12 : 16;
    const randomIv = CryptoJS.lib.WordArray.random(ivLength);
    ivValue.value = randomIv.toString(CryptoJS.enc.Hex);
    lastGeneratedIv.value = ivValue.value;
    processingInfo.value = `已生成${ivLength * 8}位随机IV`;
  };
  
  const parseKey = () => {
    if (!secretKey.value) {
      return null;
    }
    
    try {
      switch (keyFormat.value) {
        case 'hex':
          return CryptoJS.enc.Hex.parse(secretKey.value);
        case 'base64':
          return CryptoJS.enc.Base64.parse(secretKey.value);
        case 'utf8':
        default:
          return CryptoJS.enc.Utf8.parse(secretKey.value);
      }
    } catch (error) {
      throw new Error('密钥格式解析失败，请检查密钥格式是否正确');
    }
  };
  
  const parseIv = () => {
    if (!ivValue.value) {
      return null;
    }
    
    try {
      return CryptoJS.enc.Hex.parse(ivValue.value);
    } catch (error) {
      throw new Error('IV格式解析失败，请使用十六进制格式');
    }
  };
  
  const validateKey = () => {
    if (!secretKey.value) {
      keyError.value = '请输入密钥';
      return false;
    }
    
    try {
      const key = parseKey();
      if (!key) {
        keyError.value = '密钥解析失败';
        return false;
      }
      
      const bits = parseInt(keySize.value);
      const requiredBytes = bits / 8;
      
      if (key.sigBytes < requiredBytes) {
        keyError.value = `密钥长度不足，${bits}位加密需要至少${requiredBytes}字节密钥，当前仅${key.sigBytes}字节`;
        return false;
      }
      
      keyError.value = '';
      return true;
    } catch (error) {
      keyError.value = error.message || '密钥格式无效';
      return false;
    }
  };
  
  const getCryptoMode = () => {
    const modes = {
      'CBC': CryptoJS.mode.CBC,
      'ECB': CryptoJS.mode.ECB,
      'CFB': CryptoJS.mode.CFB,
      'OFB': CryptoJS.mode.OFB,
      'CTR': CryptoJS.mode.CTR
    };
    const cryptoMode = modes[mode.value];
    if (!cryptoMode) {
      throw new Error(`不支持的加密模式: ${mode.value}`);
    }
    return cryptoMode;
  };
  
  const getCryptoPadding = () => {
    const paddings = {
      'Pkcs7': CryptoJS.pad.Pkcs7,
      'Iso97971': CryptoJS.pad.Iso97971,
      'AnsiX923': CryptoJS.pad.AnsiX923,
      'Iso10126': CryptoJS.pad.Iso10126,
      'ZeroPadding': CryptoJS.pad.ZeroPadding,
      'NoPadding': CryptoJS.pad.NoPadding
    };
    return paddings[padding.value] || CryptoJS.pad.Pkcs7;
  };
  
  const encryptText = () => {
    if (!validateKey()) return;
    if (!inputText.value) return;
    
    try {
      lastOperation.value = 'encrypt';
      const key = parseKey();
      
      const config = {
        mode: getCryptoMode(),
        padding: getCryptoPadding()
      };
      
      let iv = null;
      if (needsIv.value) {
        if (autoGenerateIv.value || !hasIv.value) {
          const ivLength = mode.value === 'GCM' ? 12 : 16;
          iv = CryptoJS.lib.WordArray.random(ivLength);
          lastGeneratedIv.value = iv.toString(CryptoJS.enc.Hex);
        } else {
          iv = parseIv();
        }
        config.iv = iv;
      }
      
      const encrypted = CryptoJS.AES.encrypt(inputText.value, key, config);
      
      let result;
      if (needsIv.value && iv) {
        const combined = iv.clone().concat(encrypted.ciphertext);
        result = outputFormat.value === 'base64' 
          ? combined.toString(CryptoJS.enc.Base64)
          : combined.toString(CryptoJS.enc.Hex);
      } else {
        result = outputFormat.value === 'base64' 
          ? encrypted.toString()
          : encrypted.ciphertext.toString(CryptoJS.enc.Hex);
      }
      
      outputText.value = result;
      processingInfo.value = `加密成功！使用${keySize.value}位密钥，${mode.value}模式，${padding.value}填充`;
    } catch (error) {
      outputText.value = `加密错误: ${error.message}`;
      processingInfo.value = '';
    }
  };
  
  const decryptText = () => {
    if (!validateKey()) return;
    if (!inputText.value) return;
    
    try {
      lastOperation.value = 'decrypt';
      const key = parseKey();
      
      const config = {
        mode: getCryptoMode(),
        padding: getCryptoPadding()
      };
      
      let ciphertext;
      if (outputFormat.value === 'hex') {
        ciphertext = CryptoJS.enc.Hex.parse(inputText.value.trim());
      } else {
        ciphertext = CryptoJS.enc.Base64.parse(inputText.value.trim());
      }
      
      if (needsIv.value) {
        const ivLength = mode.value === 'GCM' ? 12 : 16;
        
        if (ciphertext.sigBytes < ivLength) {
          throw new Error(`密文长度不足以包含IV，至少需要${ivLength}字节`);
        }
        
        const ivWords = ciphertext.words.slice(0, ivLength / 4);
        const iv = CryptoJS.lib.WordArray.create(ivWords, ivLength);
        ciphertext = CryptoJS.lib.WordArray.create(
          ciphertext.words.slice(ivLength / 4), 
          ciphertext.sigBytes - ivLength
        );
        
        config.iv = iv;
        lastGeneratedIv.value = iv.toString(CryptoJS.enc.Hex);
      }
      
      const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, config);
      
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText && decrypted.sigBytes > 0) {
        throw new Error('解密失败：可能是密钥错误或数据损坏');
      }
      
      outputText.value = decryptedText;
      processingInfo.value = `解密成功！使用${keySize.value}位密钥，${mode.value}模式，${padding.value}填充`;
    } catch (error) {
      outputText.value = `解密错误: ${error.message}`;
      processingInfo.value = '';
    }
  };
  
  const loadExample = () => {
    inputText.value = exampleText;
    generateKey();
    if (needsIv.value) {
      generateIv();
    }
  };
  
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    processingInfo.value = '';
    lastOperation.value = '';
    lastGeneratedIv.value = '';
  };
  
  const copyResult = async () => {
    if (!outputText.value) return;
    
    try {
      await navigator.clipboard.writeText(outputText.value);
      processingInfo.value = '结果已复制到剪贴板';
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  const swapInputOutput = () => {
    if (!outputText.value) return;
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    processingInfo.value = '';
    lastOperation.value = '';
  };
  
  return {
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
    lastOperation,
    
    showAdvancedOptions,
    keyFormat,
    ivValue,
    autoGenerateIv,
    showIv,
    lastGeneratedIv,
    
    hasInput,
    hasOutput,
    hasKey,
    canProcess,
    needsIv,
    hasIv,
    
    toggleKeyVisibility,
    toggleIvVisibility,
    toggleAdvancedOptions,
    generateKey,
    generateIv,
    validateKey,
    encryptText,
    decryptText,
    loadExample,
    clearInput,
    copyResult,
    swapInputOutput
  };
});
