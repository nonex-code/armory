import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// IP 归属地查询 API（https + CORS 免费开放，无需 token）
const IP_LOOKUP_API = 'https://ipwho.is/';

// 带超时的 fetch
const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`请求失败（HTTP ${response.status}）`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

export const useIpLookupStore = defineStore('ipLookup', () => {
  // 状态
  const queryInput = ref('');
  const result = ref(null);
  const error = ref('');
  const loading = ref(false);
  const history = ref([]);
  // 请求序号，防止并发查询时旧结果覆盖新结果
  let requestSeq = 0;
  
  // 计算属性
  const canLookup = computed(() => {
    return queryInput.value.trim().length > 0;
  });
  
  const hasHistory = computed(() => {
    return history.value.length > 0;
  });
  
  // 输入校验：IPv4 / IPv6 / 合法域名
  const validateInput = (input) => {
    // IPv4
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
      const parts = input.split('.');
      if (parts.every(part => {
        if (part.length > 1 && part.startsWith('0')) return false;
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      })) {
        return true;
      }
      throw new Error('IPv4 地址格式不正确（每段 0-255，不允许前导零）');
    }
    
    // IPv6（含缩写形式）
    if (input.includes(':')) {
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::$|^[0-9a-fA-F]{1,4}(::[0-9a-fA-F]{1,4})*$/;
      if (ipv6Regex.test(input)) {
        return true;
      }
      throw new Error('IPv6 地址格式不正确');
    }
    
    // 域名（RFC 1123 主机名）
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (domainRegex.test(input)) {
      return true;
    }
    
    throw new Error('请输入有效的 IPv4、IPv6 地址或域名');
  };
  
  // 规范化 API 返回的数据结构
  const normalizeResult = (data) => {
    if (!data || data.success === false) {
      throw new Error((data && data.message) || '未查询到该地址的归属地信息');
    }
    return {
      ip: data.ip,
      type: data.type || (data.ip && data.ip.includes(':') ? 'IPv6' : 'IPv4'),
      country: data.country || '未知',
      countryCode: data.country_code || '',
      city: data.city || '未知',
      isp: data.connection?.isp || data.isp || '未知',
      org: data.connection?.org || data.org || '',
      asn: data.connection?.asn ? `AS${data.connection.asn}` : '',
      timezone: data.timezone?.id || data.timezone || '',
      lat: data.latitude,
      lon: data.longitude,
      postal: data.postal || '',
      region: data.region || ''
    };
  };
  
  const addToHistory = (query, data) => {
    history.value.unshift({
      query,
      result: data,
      timestamp: new Date().toISOString()
    });
    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10);
    }
  };
  
  // 查询 IP 归属地（基于公开 API ipwho.is）
  const lookupIp = async () => {
    const input = queryInput.value.trim();
    if (!input) return;
    
    try {
      validateInput(input);
    } catch (validationError) {
      error.value = validationError.message;
      result.value = null;
      return;
    }
    
    loading.value = true;
    error.value = '';
    const seq = ++requestSeq;
    
    try {
      const data = await fetchWithTimeout(`${IP_LOOKUP_API}${encodeURIComponent(input)}`);
      
      // 只接受最后一次请求的结果
      if (seq !== requestSeq) return;
      
      const normalized = normalizeResult(data);
      result.value = normalized;
      addToHistory(input, normalized);
    } catch (err) {
      if (seq !== requestSeq) return;
      if (err.name === 'AbortError') {
        error.value = '查询超时，请检查网络后重试';
      } else {
        error.value = `查询失败：${err.message || '未知错误'}`;
      }
      result.value = null;
    } finally {
      if (seq === requestSeq) {
        loading.value = false;
      }
    }
  };
  
  // 查询本机公网IP
  const getMyIp = async () => {
    queryInput.value = '';
    loading.value = true;
    error.value = '';
    const seq = ++requestSeq;
    
    try {
      const data = await fetchWithTimeout(IP_LOOKUP_API);
      
      if (seq !== requestSeq) return;
      
      const normalized = normalizeResult(data);
      result.value = normalized;
      addToHistory(normalized.ip, normalized);
    } catch (err) {
      if (seq !== requestSeq) return;
      if (err.name === 'AbortError') {
        error.value = '获取本机IP超时，请检查网络后重试';
      } else {
        error.value = `获取本机IP失败：${err.message || '未知错误'}`;
      }
      result.value = null;
    } finally {
      if (seq === requestSeq) {
        loading.value = false;
      }
    }
  };
  
  // 清空查询结果
  const clearResult = () => {
    result.value = null;
    error.value = '';
  };
  
  // 清空历史记录
  const clearHistory = () => {
    history.value = [];
  };
  
  // 从历史记录中重新查询
  const lookupFromHistory = (historyItem) => {
    queryInput.value = historyItem.query;
    lookupIp();
  };
  
  // 加载示例
  const loadExample = (example) => {
    queryInput.value = example;
    lookupIp();
  };
  
  return {
    // 状态
    queryInput,
    result,
    error,
    loading,
    history,
    
    // 计算属性
    canLookup,
    hasHistory,
    
    // 方法
    lookupIp,
    getMyIp,
    clearResult,
    clearHistory,
    lookupFromHistory,
    loadExample
  };
});
