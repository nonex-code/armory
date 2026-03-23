import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useRsaCryptoStore = defineStore('rsaCrypto', () => {
  const inputText = ref('');
  const outputText = ref('');
  const publicKey = ref('');
  const privateKey = ref('');
  const keySize = ref('2048');
  const padding = ref('OAEP');
  const hashAlgorithm = ref('SHA-256');
  const outputFormat = ref('base64');
  const processingInfo = ref('');
  const isProcessing = ref(false);
  const generatedKeyPair = ref(null);

  const hasInput = computed(() => !!inputText.value.trim());
  const hasOutput = computed(() => !!outputText.value.trim());
  const hasPublicKey = computed(() => !!publicKey.value.trim());
  const hasPrivateKey = computed(() => !!privateKey.value.trim());
  const canEncrypt = computed(() => hasInput.value && hasPublicKey.value && !isProcessing.value);
  const canDecrypt = computed(() => hasInput.value && hasPrivateKey.value && !isProcessing.value);

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const arrayBufferToHex = (buffer) => {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hexToArrayBuffer = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  };

  const getAlgorithmParams = (forKeyGeneration = false) => {
    const hash = hashAlgorithm.value;
    const name = padding.value === 'OAEP' ? 'RSA-OAEP' : 'RSAES-PKCS1-v1_5';
    
    if (forKeyGeneration) {
      return {
        name: name,
        modulusLength: parseInt(keySize.value),
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: hash
      };
    }
    
    if (padding.value === 'OAEP') {
      return {
        name: 'RSA-OAEP',
        hash: hash
      };
    }
    
    return {
      name: 'RSAES-PKCS1-v1_5'
    };
  };

  const exportPublicKey = async (key) => {
    const exported = await crypto.subtle.exportKey('spki', key);
    const base64 = arrayBufferToBase64(exported);
    return formatPEM(base64, 'PUBLIC KEY');
  };

  const exportPrivateKey = async (key) => {
    const exported = await crypto.subtle.exportKey('pkcs8', key);
    const base64 = arrayBufferToBase64(exported);
    return formatPEM(base64, 'PRIVATE KEY');
  };

  const formatPEM = (base64, label) => {
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
  };

  const parsePEM = (pem) => {
    const pemContents = pem
      .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/, '')
      .replace(/-----END (PUBLIC|PRIVATE) KEY-----/, '')
      .replace(/\s/g, '');
    return pemContents;
  };

  const importPublicKey = async (pem) => {
    try {
      const base64 = parsePEM(pem);
      const binaryKey = base64ToArrayBuffer(base64);
      
      const algorithm = getAlgorithmParams();
      
      return await crypto.subtle.importKey(
        'spki',
        binaryKey,
        {
          name: algorithm.name,
          hash: algorithm.hash || hashAlgorithm.value
        },
        false,
        ['encrypt']
      );
    } catch (error) {
      throw new Error('公钥格式无效: ' + error.message);
    }
  };

  const importPrivateKey = async (pem) => {
    try {
      const base64 = parsePEM(pem);
      const binaryKey = base64ToArrayBuffer(base64);
      
      const algorithm = getAlgorithmParams();
      
      return await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
          name: algorithm.name,
          hash: algorithm.hash || hashAlgorithm.value
        },
        false,
        ['decrypt']
      );
    } catch (error) {
      throw new Error('私钥格式无效: ' + error.message);
    }
  };

  const generateKeyPair = async () => {
    try {
      isProcessing.value = true;
      processingInfo.value = '正在生成密钥对...';
      
      const algorithm = getAlgorithmParams(true);
      
      const keyPair = await crypto.subtle.generateKey(
        algorithm,
        true,
        ['encrypt', 'decrypt']
      );
      
      generatedKeyPair.value = keyPair;
      
      publicKey.value = await exportPublicKey(keyPair.publicKey);
      privateKey.value = await exportPrivateKey(keyPair.privateKey);
      
      processingInfo.value = `密钥对生成成功！密钥长度: ${keySize.value}位，填充方式: ${padding.value}，哈希算法: ${hashAlgorithm.value}`;
    } catch (error) {
      processingInfo.value = `生成密钥对失败: ${error.message}`;
      throw error;
    } finally {
      isProcessing.value = false;
    }
  };

  const encryptRSA = async () => {
    if (!inputText.value || !publicKey.value) return;
    
    try {
      isProcessing.value = true;
      processingInfo.value = '正在加密...';
      
      const key = await importPublicKey(publicKey.value);
      const algorithm = getAlgorithmParams();
      
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText.value);
      
      const encrypted = await crypto.subtle.encrypt(
        algorithm,
        key,
        data
      );
      
      if (outputFormat.value === 'base64') {
        outputText.value = arrayBufferToBase64(encrypted);
      } else {
        outputText.value = arrayBufferToHex(encrypted);
      }
      
      processingInfo.value = `加密成功！使用${keySize.value}位密钥，${padding.value}填充，${hashAlgorithm.value}哈希`;
    } catch (error) {
      outputText.value = `加密错误: ${error.message}`;
      processingInfo.value = '';
    } finally {
      isProcessing.value = false;
    }
  };

  const decryptRSA = async () => {
    if (!inputText.value || !privateKey.value) return;
    
    try {
      isProcessing.value = true;
      processingInfo.value = '正在解密...';
      
      const key = await importPrivateKey(privateKey.value);
      const algorithm = getAlgorithmParams();
      
      let encryptedData;
      if (outputFormat.value === 'base64') {
        encryptedData = base64ToArrayBuffer(inputText.value.trim());
      } else {
        encryptedData = hexToArrayBuffer(inputText.value.trim());
      }
      
      const decrypted = await crypto.subtle.decrypt(
        algorithm,
        key,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      outputText.value = decoder.decode(decrypted);
      
      processingInfo.value = `解密成功！使用${keySize.value}位密钥，${padding.value}填充，${hashAlgorithm.value}哈希`;
    } catch (error) {
      outputText.value = `解密错误: ${error.message}。请确保私钥、填充方式和哈希算法与加密时一致。`;
      processingInfo.value = '';
    } finally {
      isProcessing.value = false;
    }
  };

  const loadExample = () => {
    inputText.value = '这是一段需要RSA加密的敏感信息。RSA是一种非对称加密算法，使用公钥加密，私钥解密。';
  };

  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    processingInfo.value = '';
  };

  const clearKeys = () => {
    publicKey.value = '';
    privateKey.value = '';
    generatedKeyPair.value = null;
    processingInfo.value = '';
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

  const copyPublicKey = async () => {
    if (!publicKey.value) return;
    
    try {
      await navigator.clipboard.writeText(publicKey.value);
      processingInfo.value = '公钥已复制到剪贴板';
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const copyPrivateKey = async () => {
    if (!privateKey.value) return;
    
    try {
      await navigator.clipboard.writeText(privateKey.value);
      processingInfo.value = '私钥已复制到剪贴板';
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
  };

  return {
    inputText,
    outputText,
    publicKey,
    privateKey,
    keySize,
    padding,
    hashAlgorithm,
    outputFormat,
    processingInfo,
    isProcessing,
    generatedKeyPair,
    
    hasInput,
    hasOutput,
    hasPublicKey,
    hasPrivateKey,
    canEncrypt,
    canDecrypt,
    
    generateKeyPair,
    encryptRSA,
    decryptRSA,
    loadExample,
    clearInput,
    clearKeys,
    copyResult,
    copyPublicKey,
    copyPrivateKey,
    swapInputOutput
  };
});
