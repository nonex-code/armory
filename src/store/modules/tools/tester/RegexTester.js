import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useRegexTesterStore = defineStore('regexTester', () => {
  // 状态
  const regexPattern = ref('');
  const regexFlags = ref('g');
  const testText = ref('');
  const testResult = ref(null);
  const flags = ref({
    g: true,
    i: false,
    m: false,
    u: false
  });

  // 常用正则表达式模式
  const commonPatterns = ref([
    { name: '邮箱', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { name: '手机号', pattern: '^1[3-9]\\d{9}$' },
    { name: 'URL', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
    { name: 'IPv4地址', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
    { name: '身份证号', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$' },
    { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '^\\d+$' },
    { name: '英文字母', pattern: '^[a-zA-Z]+$' },
    { name: '用户名', pattern: '^[a-zA-Z0-9_-]{3,16}$' },
    { name: '密码', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$' }
  ]);

  // 计算属性
  const commonRegex = computed(() => commonPatterns.value);

  const highlightedText = computed(() => {
    if (!testResult.value || !testResult.value.isValid || !testResult.value.matches.length) {
      return testText.value;
    }
    
    let highlighted = testText.value;
    const matches = [...testResult.value.matches].sort((a, b) => b.index - a.index);
    
    matches.forEach(match => {
      const before = highlighted.substring(0, match.index);
      const matched = highlighted.substring(match.index, match.index + match.value.length);
      const after = highlighted.substring(match.index + match.value.length);
      highlighted = `${before}<mark class="bg-yellow-300 text-black">${matched}</mark>${after}`;
    });
    
    return highlighted;
  });

  // 方法
  // 更新正则标志
  const updateFlags = () => {
    let newFlags = '';
    if (flags.value.g) newFlags += 'g';
    if (flags.value.i) newFlags += 'i';
    if (flags.value.m) newFlags += 'm';
    if (flags.value.u) newFlags += 'u';
    regexFlags.value = newFlags;
  };

  // 测试正则表达式
  const testRegex = () => {
    if (!regexPattern.value) {
      testResult.value = {
        isValid: false,
        matches: [],
        groups: [],
        error: '请输入正则表达式'
      };
      return;
    }

    if (!testText.value) {
      testResult.value = {
        isValid: false,
        matches: [],
        groups: [],
        error: '请输入测试文本'
      };
      return;
    }

    try {
      const regex = new RegExp(regexPattern.value, regexFlags.value);
      const matches = [];
      let match;
      
      if (flags.value.g) {
        while ((match = regex.exec(testText.value)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testText.value);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      // 提取分组信息
      const groups = [];
      if (matches.length > 0 && matches[0].groups.length > 0) {
        for (let i = 0; i < matches[0].groups.length; i++) {
          groups.push({
            pattern: `组 ${i + 1}`,
            value: matches[0].groups[i]
          });
        }
      }
      
      testResult.value = {
        isValid: true,
        matches,
        groups,
        error: null
      };
    } catch (error) {
      testResult.value = {
        isValid: false,
        matches: [],
        groups: [],
        error: error.message
      };
    }
  };

  // 应用预设模式
  const applyPreset = (preset) => {
    regexPattern.value = preset.pattern;
    // 自动测试
    if (testText.value) {
      testRegex();
    }
  };

  // 复制正则表达式
  const copyRegex = () => {
    if (!regexPattern.value) return false;
    
    const regexWithFlags = `/${regexPattern.value}/${regexFlags.value}`;
    return navigator.clipboard.writeText(regexWithFlags)
      .then(() => true)
      .catch(() => false);
  };

  // 清空所有内容
  const clearAll = () => {
    regexPattern.value = '';
    regexFlags.value = 'g';
    testText.value = '';
    testResult.value = null;
    flags.value = {
      g: true,
      i: false,
      m: false,
      u: false
    };
  };

  // 监听标志变化
  watch(flags, updateFlags, { deep: true });

  // 监听正则表达式或测试文本变化，自动测试
  watch([regexPattern, regexFlags, testText], () => {
    if (regexPattern.value && testText.value) {
      testRegex();
    }
  });

  return {
    // 状态
    regexPattern,
    regexFlags,
    testText,
    testResult,
    flags,
    commonPatterns,
    
    // 计算属性
    commonRegex,
    highlightedText,
    
    // 方法
    updateFlags,
    testRegex,
    applyPreset,
    copyRegex,
    clearAll
  };
});