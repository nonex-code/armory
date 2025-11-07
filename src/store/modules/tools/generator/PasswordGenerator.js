import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePasswordGeneratorStore = defineStore('passwordGenerator', () => {
  // 状态
  const passwordLength = ref(16);
  const generateCount = ref(5);
  const generatedPasswords = ref([]);
  const isGenerating = ref(false);
  const passwordStrength = ref(null);
  const options = ref({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false
  });

  // 计算属性
  const hasSelectedOptions = computed(() => {
    return options.value.uppercase || options.value.lowercase || 
           options.value.numbers || options.value.symbols;
  });

  const hasGeneratedPasswords = computed(() => {
    return generatedPasswords.value.length > 0;
  });

  // 获取字符集
  const getCharset = () => {
    let charset = '';
    
    if (options.value.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.value.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.value.numbers) charset += '0123456789';
    if (options.value.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    return charset;
  };

  // 生成密码
  const generatePasswords = async () => {
    if (!hasSelectedOptions.value) {
      return false;
    }

    isGenerating.value = true;
    generatedPasswords.value = [];

    try {
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const charset = getCharset();
      const passwords = [];
      
      for (let i = 0; i < generateCount.value; i++) {
        let password = '';
        for (let j = 0; j < passwordLength.value; j++) {
          password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        passwords.push(password);
      }
      
      generatedPasswords.value = passwords;
      return true;
    } catch (error) {
      console.error('密码生成失败:', error);
      return false;
    } finally {
      isGenerating.value = false;
    }
  };

  // 复制单个密码
  const copyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  };

  // 复制所有密码
  const copyAllPasswords = async () => {
    const text = generatedPasswords.value.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  };

  // 下载密码文件
  const downloadPasswords = () => {
    try {
      const text = generatedPasswords.value.join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `passwords_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      return false;
    }
  };

  // 检查密码强度
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = '';
    
    // 长度评分
    if (password.length < 8) {
      feedback += '密码太短，建议至少8位。';
    } else if (password.length < 12) {
      score += 1;
      feedback += '密码长度适中，建议更长一些。';
    } else {
      score += 2;
    }
    
    // 字符类型评分
    let hasUpper = /[A-Z]/.test(password);
    let hasLower = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    const charTypes = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    score += charTypes;
    
    if (charTypes < 3) {
      feedback += ' 建议包含更多类型的字符。';
    }
    
    // 设置强度文本
    let strengthText = '很弱';
    if (score >= 2 && score < 4) strengthText = '弱';
    else if (score >= 4 && score < 6) strengthText = '一般';
    else if (score >= 6 && score < 8) strengthText = '强';
    else if (score >= 8) strengthText = '很强';
    
    passwordStrength.value = {
      score: Math.min(score, 5),
      text: strengthText,
      feedback: feedback || '密码强度良好。'
    };
  };

  // 获取强度样式类
  const getStrengthClass = (score) => {
    if (score <= 1) return 'text-error';
    if (score <= 2) return 'text-warning';
    if (score <= 3) return 'text-info';
    return 'text-success';
  };

  // 获取强度条样式类
  const getStrengthBarClass = (score) => {
    if (score <= 1) return 'bg-error';
    if (score <= 2) return 'bg-warning';
    if (score <= 3) return 'bg-info';
    return 'bg-success';
  };

  // 清空结果
  const clearResults = () => {
    generatedPasswords.value = [];
    passwordStrength.value = null;
  };

  // 重置选项
  const resetOptions = () => {
    options.value = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false
    };
    passwordLength.value = 16;
    generateCount.value = 5;
    clearResults();
  };

  return {
    // 状态
    passwordLength,
    generateCount,
    generatedPasswords,
    isGenerating,
    passwordStrength,
    options,
    
    // 计算属性
    hasSelectedOptions,
    hasGeneratedPasswords,
    
    // 方法
    generatePasswords,
    copyPassword,
    copyAllPasswords,
    downloadPasswords,
    checkPasswordStrength,
    getStrengthClass,
    getStrengthBarClass,
    clearResults,
    resetOptions
  };
});