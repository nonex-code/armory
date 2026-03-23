import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import CryptoJS from 'crypto-js';

export const useJwtParseStore = defineStore('jwtParse', () => {
  const activeTab = ref('decode');
  
  const jwtToken = ref('');
  const parsedHeader = ref(null);
  const parsedPayload = ref(null);
  const signature = ref('');
  const timeInfo = ref(null);
  const parseError = ref('');
  
  const generateHeader = ref({
    alg: 'HS256',
    typ: 'JWT'
  });
  const generatePayload = ref('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const secretKey = ref('');
  const showKey = ref(false);
  const generatedToken = ref('');
  const generateError = ref('');
  
  const advancedOptions = ref({
    expiresIn: '',
    notBefore: '',
    issuer: '',
    subject: '',
    audience: '',
    jwtId: '',
    customHeaderFields: ''
  });
  
  const verifySecretKey = ref('');
  const showVerifyKey = ref(false);
  const verifyResult = ref(null);
  
  const exampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const hasToken = computed(() => !!jwtToken.value);
  const hasHeader = computed(() => !!parsedHeader.value);
  const hasPayload = computed(() => !!parsedPayload.value);
  const hasSignature = computed(() => !!signature.value);
  const hasTimeInfo = computed(() => !!timeInfo.value);
  const canParse = computed(() => hasToken.value);
  const canGenerate = computed(() => {
    try {
      JSON.parse(generatePayload.value);
      return !!secretKey.value;
    } catch {
      return false;
    }
  });
  const canVerify = computed(() => hasToken.value && !!verifySecretKey.value);

  const base64UrlEncode = (str) => {
    let base64;
    if (typeof str === 'object') {
      base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(str)));
    } else {
      base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64));
  };

  const parseJWT = () => {
    parseError.value = '';
    parsedHeader.value = null;
    parsedPayload.value = null;
    signature.value = '';
    timeInfo.value = null;
    verifyResult.value = null;
    
    try {
      const parts = jwtToken.value.trim().split('.');
      
      if (parts.length !== 3) {
        throw new Error('无效的JWT格式，JWT应包含三部分（header.payload.signature）');
      }
      
      try {
        const headerStr = base64UrlDecode(parts[0]);
        parsedHeader.value = JSON.parse(headerStr);
      } catch (e) {
        throw new Error('Header解析失败：无效的Base64Url编码或JSON格式');
      }
      
      try {
        const payloadStr = base64UrlDecode(parts[1]);
        parsedPayload.value = JSON.parse(payloadStr);
        extractTimeInfo();
      } catch (e) {
        throw new Error('Payload解析失败：无效的Base64Url编码或JSON格式');
      }
      
      signature.value = parts[2];
    } catch (error) {
      parseError.value = error.message;
      console.error('JWT解析失败:', error);
    }
  };

  const extractTimeInfo = () => {
    if (!parsedPayload.value) return;
    
    const now = Math.floor(Date.now() / 1000);
    const iat = parsedPayload.value.iat;
    const exp = parsedPayload.value.exp;
    const nbf = parsedPayload.value.nbf;
    
    timeInfo.value = {
      iat: iat ? new Date(iat * 1000).toLocaleString() : null,
      iatFormatted: iat ? getRelativeTime(iat * 1000) : null,
      exp: exp ? new Date(exp * 1000).toLocaleString() : null,
      expFormatted: exp ? getRelativeTime(exp * 1000) : null,
      nbf: nbf ? new Date(nbf * 1000).toLocaleString() : null,
      nbfFormatted: nbf ? getRelativeTime(nbf * 1000) : null,
      isExpired: exp ? now > exp : null,
      isNotValidYet: nbf ? now < nbf : null
    };
  };

  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const seconds = Math.floor(absDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} 天后`;
      if (hours > 0) return `${hours} 小时后`;
      if (minutes > 0) return `${minutes} 分钟后`;
      return `${seconds} 秒后`;
    }
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小时前`;
    if (minutes > 0) return `${minutes} 分钟前`;
    return `${seconds} 秒前`;
  };

  const generateJWT = () => {
    generateError.value = '';
    generatedToken.value = '';
    
    try {
      let payload;
      try {
        payload = JSON.parse(generatePayload.value);
      } catch (e) {
        throw new Error('Payload格式无效，请输入有效的JSON');
      }
      
      if (!secretKey.value) {
        throw new Error('请输入密钥');
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      if (advancedOptions.value.expiresIn) {
        payload.exp = now + parseTimeOffset(advancedOptions.value.expiresIn);
      }
      if (advancedOptions.value.notBefore) {
        payload.nbf = now + parseTimeOffset(advancedOptions.value.notBefore);
      }
      if (!payload.iat) {
        payload.iat = now;
      }
      if (advancedOptions.value.issuer) {
        payload.iss = advancedOptions.value.issuer;
      }
      if (advancedOptions.value.subject) {
        payload.sub = advancedOptions.value.subject;
      }
      if (advancedOptions.value.audience) {
        payload.aud = advancedOptions.value.audience;
      }
      if (advancedOptions.value.jwtId) {
        payload.jti = advancedOptions.value.jwtId;
      }
      
      const header = { ...generateHeader.value };
      
      if (advancedOptions.value.customHeaderFields) {
        try {
          const customFields = JSON.parse(advancedOptions.value.customHeaderFields);
          Object.assign(header, customFields);
        } catch (e) {
          throw new Error('自定义Header字段格式无效');
        }
      }
      
      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));
      const message = `${headerB64}.${payloadB64}`;
      
      const signatureB64 = signMessage(message, secretKey.value, header.alg);
      
      generatedToken.value = `${message}.${signatureB64}`;
    } catch (error) {
      generateError.value = error.message;
      console.error('JWT生成失败:', error);
    }
  };

  const parseTimeOffset = (offset) => {
    const match = offset.match(/^(\d+)([smhd]?)$/);
    if (!match) {
      throw new Error('时间偏移格式无效，例如: 3600, 1h, 1d');
    }
    
    const value = parseInt(match[1]);
    const unit = match[2] || 's';
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return value;
    }
  };

  const signMessage = (message, key, algorithm) => {
    let hash;
    
    switch (algorithm) {
      case 'HS256':
        hash = CryptoJS.HmacSHA256(message, key);
        break;
      case 'HS384':
        hash = CryptoJS.HmacSHA384(message, key);
        break;
      case 'HS512':
        hash = CryptoJS.HmacSHA512(message, key);
        break;
      default:
        throw new Error(`不支持的算法: ${algorithm}，目前仅支持HS256、HS384、HS512`);
    }
    
    const signature = CryptoJS.enc.Base64.stringify(hash);
    return signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const verifyJWT = () => {
    verifyResult.value = null;
    
    try {
      if (!parsedHeader.value || !parsedPayload.value) {
        parseJWT();
        if (parseError.value) return;
      }
      
      const parts = jwtToken.value.trim().split('.');
      const message = `${parts[0]}.${parts[1]}`;
      const expectedSignature = signMessage(message, verifySecretKey.value, parsedHeader.value.alg);
      
      const isValid = expectedSignature === parts[2];
      
      let status = 'valid';
      let message_text = '签名验证通过';
      
      if (!isValid) {
        status = 'invalid';
        message_text = '签名验证失败：签名不匹配';
      } else if (timeInfo.value?.isExpired) {
        status = 'expired';
        message_text = '签名验证通过，但令牌已过期';
      } else if (timeInfo.value?.isNotValidYet) {
        status = 'not_valid_yet';
        message_text = '签名验证通过，但令牌尚未生效';
      }
      
      verifyResult.value = {
        isValid,
        status,
        message: message_text,
        algorithm: parsedHeader.value.alg
      };
    } catch (error) {
      verifyResult.value = {
        isValid: false,
        status: 'error',
        message: `验证失败: ${error.message}`,
        algorithm: parsedHeader.value?.alg || 'unknown'
      };
    }
  };

  const loadExample = () => {
    jwtToken.value = exampleJwt;
    parseJWT();
  };

  const loadGenerateExample = () => {
    generateHeader.value = {
      alg: 'HS256',
      typ: 'JWT'
    };
    generatePayload.value = JSON.stringify({
      sub: '1234567890',
      name: 'John Doe',
      admin: true,
      iat: Math.floor(Date.now() / 1000)
    }, null, 2);
    secretKey.value = 'your-256-bit-secret';
    advancedOptions.value = {
      expiresIn: '1h',
      notBefore: '',
      issuer: 'webtools',
      subject: 'user-auth',
      audience: 'webtools-users',
      jwtId: '',
      customHeaderFields: ''
    };
  };

  const clearToken = () => {
    jwtToken.value = '';
    parsedHeader.value = null;
    parsedPayload.value = null;
    signature.value = '';
    timeInfo.value = null;
    parseError.value = '';
    verifyResult.value = null;
  };

  const clearGenerate = () => {
    generateHeader.value = {
      alg: 'HS256',
      typ: 'JWT'
    };
    generatePayload.value = '{\n  \n}';
    secretKey.value = '';
    generatedToken.value = '';
    generateError.value = '';
    advancedOptions.value = {
      expiresIn: '',
      notBefore: '',
      issuer: '',
      subject: '',
      audience: '',
      jwtId: '',
      customHeaderFields: ''
    };
  };

  const copyHeader = async () => {
    if (!parsedHeader.value) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedHeader.value, null, 2));
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const copyPayload = async () => {
    if (!parsedPayload.value) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedPayload.value, null, 2));
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const copySignature = async () => {
    if (!signature.value) return;
    try {
      await navigator.clipboard.writeText(signature.value);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const copyGeneratedToken = async () => {
    if (!generatedToken.value) return;
    try {
      await navigator.clipboard.writeText(generatedToken.value);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const useGeneratedToken = () => {
    if (!generatedToken.value) return;
    jwtToken.value = generatedToken.value;
    activeTab.value = 'decode';
    parseJWT();
  };

  const toggleKeyVisibility = () => {
    showKey.value = !showKey.value;
  };

  const toggleVerifyKeyVisibility = () => {
    showVerifyKey.value = !showVerifyKey.value;
  };

  const generateRandomKey = () => {
    const bytes = CryptoJS.lib.WordArray.random(32);
    secretKey.value = bytes.toString(CryptoJS.enc.Hex);
  };

  return {
    activeTab,
    jwtToken,
    parsedHeader,
    parsedPayload,
    signature,
    timeInfo,
    parseError,
    generateHeader,
    generatePayload,
    secretKey,
    showKey,
    generatedToken,
    generateError,
    advancedOptions,
    verifySecretKey,
    showVerifyKey,
    verifyResult,
    hasToken,
    hasHeader,
    hasPayload,
    hasSignature,
    hasTimeInfo,
    canParse,
    canGenerate,
    canVerify,
    parseJWT,
    generateJWT,
    verifyJWT,
    loadExample,
    loadGenerateExample,
    clearToken,
    clearGenerate,
    copyHeader,
    copyPayload,
    copySignature,
    copyGeneratedToken,
    useGeneratedToken,
    toggleKeyVisibility,
    toggleVerifyKeyVisibility,
    generateRandomKey
  };
});
