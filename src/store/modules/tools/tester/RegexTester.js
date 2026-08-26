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

  // HTML 转义（用于安全高亮，防止 XSS）
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 计算属性
  const commonRegex = computed(() => commonPatterns.value);

  const highlightedText = computed(() => {
    if (!testResult.value || !testResult.value.isValid || !testResult.value.matches.length) {
      // 无匹配时也要转义，防止原文中的 HTML 被 v-html 执行
      return escapeHtml(testText.value);
    }
    
    // 按原文本区间分段构建：先转义再插入 mark，避免 index 偏移与 XSS
    const matches = [...testResult.value.matches].sort((a, b) => a.index - b.index);
    let result = '';
    let cursor = 0;
    
    matches.forEach(match => {
      if (match.index > cursor) {
        result += escapeHtml(testText.value.slice(cursor, match.index));
      }
      result += `<mark class="bg-yellow-300 text-black">${escapeHtml(match.value)}</mark>`;
      cursor = match.index + match.value.length;
    });
    
    if (cursor < testText.value.length) {
      result += escapeHtml(testText.value.slice(cursor));
    }
    
    return result;
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

  // 粗略检测潜在的灾难性回溯模式（嵌套量词），仅作提示
  const detectReDoSRisk = (pattern) => {
    // 如 (a+)+、(a*)*、([ab]+)* 等嵌套量词结构
    if (/\([^()]*[+*][^()]*\)\s*[+*?]/.test(pattern)) {
      return true;
    }
    // 如 a** 或 a*+ 等
    if (/[+*?]\s*[+*?]/.test(pattern)) {
      return true;
    }
    return false;
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
      const MAX_MATCHES = 1000;
      const MAX_TEXT_LENGTH = 100000; // 100KB 上限，防止大文本 + 复杂正则卡死页面
      
      const text = testText.value.length > MAX_TEXT_LENGTH
        ? testText.value.slice(0, MAX_TEXT_LENGTH)
        : testText.value;
      
      if (flags.value.g) {
        let truncated = false;
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (matches.length >= MAX_MATCHES) {
            truncated = true;
            break;
          }
        }
        if (truncated) {
          testResult.value = {
            isValid: true,
            matches,
            groups: [],
            error: null,
            truncated: true
          };
          return;
        }
      } else {
        match = regex.exec(text);
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
        const namedGroups = matches[0].groups;
        for (let i = 0; i < namedGroups.length; i++) {
          groups.push({
            pattern: `组 ${i + 1}`,
            value: namedGroups[i]
          });
        }
        // 命名分组（如果存在）
        if (matches[0].groups.groups && typeof matches[0].groups.groups === 'object') {
          // exec 的命名分组在 match.groups 中，但这里保存的是 slice(1) 数组，命名分组无法直接获取
        }
      }
      
      const riskWarning = detectReDoSRisk(regexPattern.value)
        ? '该正则包含嵌套量词，对较长文本可能造成性能问题，建议简化。'
        : null;
      
      testResult.value = {
        isValid: true,
        matches,
        groups,
        error: riskWarning
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
    // 自动测试由 watch 触发，避免重复执行
  };

  // 复制正则表达式（async + 非安全上下文降级）
  const copyRegex = async () => {
    if (!regexPattern.value) return false;
    
    const regexWithFlags = `/${regexPattern.value}/${regexFlags.value}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(regexWithFlags);
      } else {
        // 非安全上下文（http）降级方案
        const textarea = document.createElement('textarea');
        textarea.value = regexWithFlags;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) return false;
      }
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
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

  // 同步标志状态：复选框 ↔ 手输 flags 单一数据源
  let syncingFlags = false;

  watch(flags, () => {
    if (syncingFlags) return;
    updateFlags();
  }, { deep: true });

  watch(regexFlags, (val) => {
    syncingFlags = true;
    flags.value = {
      g: val.includes('g'),
      i: val.includes('i'),
      m: val.includes('m'),
      u: val.includes('u')
    };
    syncingFlags = false;
  });

  // 监听正则表达式或测试文本变化，自动测试（防抖，避免每击键触发）
  let testTimer = null;
  watch([regexPattern, regexFlags, testText], () => {
    clearTimeout(testTimer);
    testTimer = setTimeout(() => {
      if (regexPattern.value && testText.value) {
        testRegex();
      }
    }, 300);
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