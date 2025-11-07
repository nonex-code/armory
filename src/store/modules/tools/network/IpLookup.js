import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useIpLookupStore = defineStore('ipLookup', () => {
  // 状态
  const queryInput = ref('');
  const result = ref(null);
  const error = ref('');
  const loading = ref(false);
  const history = ref([]);
  
  // 计算属性
  const canLookup = computed(() => {
    return queryInput.value.trim().length > 0;
  });
  
  const hasHistory = computed(() => {
    return history.value.length > 0;
  });
  
  // 模拟IP查询（实际项目中应该调用API）
  const lookupIp = async () => {
    if (!canLookup.value) return;
    
    loading.value = true;
    error.value = '';
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const input = queryInput.value.trim();
      
      // 模拟不同的查询结果
      if (input === '8.8.8.8') {
        result.value = {
          ip: '8.8.8.8',
          type: 'IPv4',
          country: '美国',
          city: '芒廷维尤',
          isp: 'Google LLC',
          org: 'Google LLC',
          asn: 'AS15169',
          timezone: 'America/Los_Angeles',
          lat: 37.4056,
          lon: -122.0775,
          postal: '94043',
          region: '加利福尼亚'
        };
      } else if (input === 'google.com') {
        result.value = {
          ip: '142.250.191.206',
          type: 'IPv4',
          country: '美国',
          city: '芒廷维尤',
          isp: 'Google LLC',
          org: 'Google LLC',
          asn: 'AS15169',
          timezone: 'America/Los_Angeles',
          lat: 37.4056,
          lon: -122.0775,
          postal: '94043',
          region: '加利福尼亚'
        };
      } else if (input === '1.1.1.1') {
        result.value = {
          ip: '1.1.1.1',
          type: 'IPv4',
          country: '美国',
          city: '洛杉矶',
          isp: 'Cloudflare, Inc.',
          org: 'APNIC and Cloudflare DNS Resolver project',
          asn: 'AS13335',
          timezone: 'America/Los_Angeles',
          lat: 34.0522,
          lon: -118.2437,
          postal: '90001',
          region: '加利福尼亚'
        };
      } else {
        // 随机生成模拟数据
        const countries = ['中国', '美国', '日本', '德国', '英国', '法国', '加拿大', '澳大利亚'];
        const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];
        const isps = ['中国电信', '中国联通', '中国移动', 'Google LLC', 'Cloudflare, Inc.', 'Amazon.com, Inc.'];
        
        result.value = {
          ip: input.includes('.') ? input : '192.168.1.1',
          type: 'IPv4',
          country: countries[Math.floor(Math.random() * countries.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          isp: isps[Math.floor(Math.random() * isps.length)],
          org: isps[Math.floor(Math.random() * isps.length)],
          asn: `AS${Math.floor(Math.random() * 100000)}`,
          timezone: 'Asia/Shanghai',
          lat: 39.9042 + (Math.random() - 0.5) * 10,
          lon: 116.4074 + (Math.random() - 0.5) * 10,
          postal: '100000',
          region: '北京'
        };
      }
      
      // 添加到历史记录
      history.value.unshift({
        query: input,
        result: result.value,
        timestamp: new Date().toISOString()
      });
      
      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value = history.value.slice(0, 10);
      }
      
    } catch (err) {
      error.value = '查询失败：' + err.message;
      result.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  // 查询本机IP
  const getMyIp = async () => {
    queryInput.value = '';
    loading.value = true;
    error.value = '';
    
    try {
      // 模拟获取本机IP
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟本机IP（实际项目中应该调用API）
      result.value = {
        ip: '192.168.1.100',
        type: 'IPv4',
        country: '中国',
        city: '北京',
        isp: '中国电信',
        org: '中国电信',
        asn: 'AS4134',
        timezone: 'Asia/Shanghai',
        lat: 39.9042,
        lon: 116.4074,
        postal: '100000',
        region: '北京'
      };
      
    } catch (err) {
      error.value = '获取本机IP失败：' + err.message;
    } finally {
      loading.value = false;
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