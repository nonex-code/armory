import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUrlParserStore = defineStore('urlParser', () => {
  // 状态
  const urlInput = ref('');
  const parsedUrl = ref(null);
  const error = ref('');
  const history = ref([]);
  
  // 计算属性
  const canParse = computed(() => {
    return urlInput.value.trim().length > 0;
  });
  
  const hasHistory = computed(() => {
    return history.value.length > 0;
  });
  
  // URL解析函数
  const parseUrl = () => {
    if (!canParse.value) return;
    
    error.value = '';
    
    try {
      const url = urlInput.value.trim();
      
      // 确保URL有协议前缀
      let urlToParse = url;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ftp://')) {
        urlToParse = 'https://' + url;
      }
      
      const urlObj = new URL(urlToParse);
      
      parsedUrl.value = {
        href: urlObj.href,
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        host: urlObj.host,
        searchParams: Object.fromEntries(urlObj.searchParams),
        isValid: true
      };
      
      // 添加到历史记录
      history.value.unshift({
        url: url,
        parsed: parsedUrl.value,
        timestamp: new Date().toISOString()
      });
      
      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value = history.value.slice(0, 10);
      }
      
    } catch (err) {
      error.value = 'URL解析失败：请输入有效的URL地址';
      parsedUrl.value = null;
    }
  };
  
  // 清空输入
  const clearInput = () => {
    urlInput.value = '';
    parsedUrl.value = null;
    error.value = '';
  };
  
  // 清空历史记录
  const clearHistory = () => {
    history.value = [];
  };
  
  // 从历史记录中重新解析
  const parseFromHistory = (historyItem) => {
    urlInput.value = historyItem.url;
    parseUrl();
  };
  
  // URL编码/解码功能
  const encodeUrl = () => {
    if (!canParse.value) return;
    
    try {
      urlInput.value = encodeURIComponent(urlInput.value);
      parseUrl();
    } catch (err) {
      error.value = 'URL编码失败';
    }
  };
  
  const decodeUrl = () => {
    if (!canParse.value) return;
    
    try {
      urlInput.value = decodeURIComponent(urlInput.value);
      parseUrl();
    } catch (err) {
      error.value = 'URL解码失败';
    }
  };
  
  // 示例URL
  const loadExample = (type = 'basic') => {
    const examples = {
      basic: 'https://www.example.com/path/to/page?query=value#section',
      complex: 'https://user:pass@sub.example.com:8080/path/file.html?param1=value1&param2=value2#fragment',
      simple: 'example.com/path',
      search: 'https://www.google.com/search?q=javascript+url+parser'
    };
    
    urlInput.value = examples[type] || examples.basic;
    parseUrl();
  };
  
  return {
    // 状态
    urlInput,
    parsedUrl,
    error,
    history,
    
    // 计算属性
    canParse,
    hasHistory,
    
    // 方法
    parseUrl,
    clearInput,
    clearHistory,
    parseFromHistory,
    encodeUrl,
    decodeUrl,
    loadExample
  };
});