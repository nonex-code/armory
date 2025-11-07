import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useRsaEncryptStore = defineStore('rsaEncrypt', () => {
  // 状态
  const inputText = ref('');
  const outputText = ref('');
  const publicKey = ref('');
  const privateKey = ref('');

  // 计算属性
  const hasInput = computed(() => !!inputText.value);
  const hasOutput = computed(() => !!outputText.value);
  const hasPublicKey = computed(() => !!publicKey.value);
  const hasPrivateKey = computed(() => !!privateKey.value);
  const canEncrypt = computed(() => hasInput.value && hasPublicKey.value);

  // 简化的RSA加密函数（仅用于演示）
  const encryptRSA = () => {
    try {
      // 这里使用一个简化的加密方式，实际RSA需要更复杂的实现
      // 在实际应用中，应该使用专业的加密库如JSEncrypt或Node.js的crypto模块
      if (!publicKey.value) {
        // 这里可以添加一个toast通知
        return;
      }

      // 模拟RSA加密（这不是真正的RSA加密）
      const encrypted = btoa(inputText.value + '|' + Date.now());
      outputText.value = encrypted;
    } catch (error) {
      outputText.value = '加密失败，请检查输入';
    }
  };

  // 生成密钥对（简化版，仅用于演示）
  const generateKeyPair = () => {
    try {
      // 这里生成的是模拟的密钥对，不是真正的RSA密钥
      // 在实际应用中，应该使用专业的加密库
      const timestamp = Date.now();
      const pubKey = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${timestamp}\n-----END PUBLIC KEY-----`;
      const privKey = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC${timestamp}\n-----END PRIVATE KEY-----`;
      
      publicKey.value = pubKey;
      privateKey.value = privKey;
    } catch (error) {
      // 这里可以添加一个toast通知
    }
  };

  // 加载示例
  const loadExample = () => {
    inputText.value = '这是一段需要加密的文本';
    publicKey.value = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890\n-----END PUBLIC KEY-----`;
  };

  // 清空输入
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
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

  // 复制私钥
  const copyPrivateKey = async () => {
    if (!privateKey.value) return;
    
    try {
      await navigator.clipboard.writeText(privateKey.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return {
    // 状态
    inputText,
    outputText,
    publicKey,
    privateKey,
    
    // 计算属性
    hasInput,
    hasOutput,
    hasPublicKey,
    hasPrivateKey,
    canEncrypt,
    
    // 方法
    encryptRSA,
    generateKeyPair,
    loadExample,
    clearInput,
    copyResult,
    copyPrivateKey
  };
});