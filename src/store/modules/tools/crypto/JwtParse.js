import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useJwtParseStore = defineStore('jwtParse', () => {
  // 状态
  const jwtToken = ref('');
  const parsedHeader = ref(null);
  const parsedPayload = ref(null);
  const signature = ref('');
  const timeInfo = ref(null);

  // 计算属性
  const hasToken = computed(() => !!jwtToken.value);
  const hasHeader = computed(() => !!parsedHeader.value);
  const hasPayload = computed(() => !!parsedPayload.value);
  const hasSignature = computed(() => !!signature.value);
  const hasTimeInfo = computed(() => !!timeInfo.value);
  const canParse = computed(() => hasToken.value);

  // 示例JWT
  const exampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  // 解析JWT
  const parseJWT = () => {
    try {
      // 清空之前的结果
      parsedHeader.value = null;
      parsedPayload.value = null;
      signature.value = '';
      timeInfo.value = null;
      
      // 分割JWT
      const parts = jwtToken.value.split('.');
      
      if (parts.length !== 3) {
        throw new Error('无效的JWT格式');
      }
      
      // 解析Header
      try {
        parsedHeader.value = JSON.parse(atob(parts[0]));
      } catch (e) {
        console.error('解析Header失败:', e);
      }
      
      // 解析Payload
      try {
        parsedPayload.value = JSON.parse(atob(parts[1]));
        
        // 提取时间信息
        extractTimeInfo();
      } catch (e) {
        console.error('解析Payload失败:', e);
      }
      
      // 获取签名
      signature.value = parts[2];
    } catch (error) {
      console.error('JWT解析失败:', error);
      // 这里可以添加一个toast通知
    }
  };

  // 提取时间信息
  const extractTimeInfo = () => {
    if (!parsedPayload.value) return;
    
    const now = Math.floor(Date.now() / 1000);
    const iat = parsedPayload.value.iat;
    const exp = parsedPayload.value.exp;
    
    timeInfo.value = {
      iat: iat ? new Date(iat * 1000).toLocaleString() : null,
      iatFormatted: iat ? getRelativeTime(iat * 1000) : null,
      exp: exp ? new Date(exp * 1000).toLocaleString() : null,
      expFormatted: exp ? getRelativeTime(exp * 1000) : null,
      isExpired: exp ? now > exp : null
    };
  };

  // 获取相对时间
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 0) {
      return `${Math.abs(Math.floor(diff / 1000 / 60))} 分钟后`;
    }
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} 天前`;
    } else if (hours > 0) {
      return `${hours} 小时前`;
    } else if (minutes > 0) {
      return `${minutes} 分钟前`;
    } else {
      return `${seconds} 秒前`;
    }
  };

  // 加载示例
  const loadExample = () => {
    jwtToken.value = exampleJwt;
    parseJWT();
  };

  // 清空令牌
  const clearToken = () => {
    jwtToken.value = '';
    parsedHeader.value = null;
    parsedPayload.value = null;
    signature.value = '';
    timeInfo.value = null;
  };

  // 复制头部
  const copyHeader = async () => {
    if (!parsedHeader.value) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedHeader.value, null, 2));
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 复制载荷
  const copyPayload = async () => {
    if (!parsedPayload.value) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedPayload.value, null, 2));
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 复制签名
  const copySignature = async () => {
    if (!signature.value) return;
    
    try {
      await navigator.clipboard.writeText(signature.value);
      // 这里可以添加一个toast通知
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return {
    // 状态
    jwtToken,
    parsedHeader,
    parsedPayload,
    signature,
    timeInfo,
    
    // 计算属性
    hasToken,
    hasHeader,
    hasPayload,
    hasSignature,
    hasTimeInfo,
    canParse,
    
    // 方法
    parseJWT,
    loadExample,
    clearToken,
    copyHeader,
    copyPayload,
    copySignature
  };
});