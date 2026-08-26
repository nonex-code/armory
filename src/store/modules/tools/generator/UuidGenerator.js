import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUuidGeneratorStore = defineStore('uuidGenerator', () => {
  // 状态
  const uuidVersion = ref('v4');
  const generateCount = ref(1);
  const formatCase = ref('lower');
  const generatedUuids = ref([]);
  const isGenerating = ref(false);

  // 计算属性
  const hasGeneratedUuids = computed(() => generatedUuids.value.length > 0);

  // 获取加密安全随机字节（非安全上下文时降级）
  const getRandomBytes = (length) => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return crypto.getRandomValues(new Uint8Array(length));
    }
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  };

  const toHex = (value, length) => value.toString(16).padStart(length, '0');

  // 生成UUID v1（RFC 4122：1582-10-15 起 100ns 间隔时间戳 + 时钟序列 + 节点）
  const generateUuidV1 = () => {
    // 1582-10-15 与 Unix 纪元(1970-01-01)之间的毫秒差
    const GREGORIAN_OFFSET = 12219292800000n;
    const timestamp100ns = (BigInt(Date.now()) + GREGORIAN_OFFSET) * 10000n;

    const timeLow = Number(timestamp100ns & 0xffffffffn);
    const timeMid = Number((timestamp100ns >> 32n) & 0xffffn);
    const timeHiAndVersion = Number((timestamp100ns >> 48n) & 0x0fffn) | 0x1000;

    const clockBytes = getRandomBytes(2);
    const clockSeq = (((clockBytes[0] << 8) | clockBytes[1]) & 0x3fff) | 0x8000;

    // 节点标识：6 字节随机数（设置组播位，避免与真实 MAC 冲突）
    const nodeBytes = getRandomBytes(6);
    nodeBytes[0] = (nodeBytes[0] | 0x01) & 0xfd;
    const node = Array.from(nodeBytes).map(b => toHex(b, 2)).join('');

    return `${toHex(timeLow, 8)}-${toHex(timeMid, 4)}-${toHex(timeHiAndVersion, 4)}-${toHex(clockSeq, 4)}-${node}`;
  };

  // 生成UUID v4（RFC 4122：完全随机，版本位/变体位）
  const generateUuidV4 = () => {
    const bytes = getRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
    const hex = Array.from(bytes).map(b => toHex(b, 2)).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  // 生成UUID
  const generateUuids = async () => {
    isGenerating.value = true;
    generatedUuids.value = [];

    try {
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 钳制生成数量，防止手输超大值
      const count = Math.min(Math.max(parseInt(generateCount.value, 10) || 1, 1), 100);
      
      // 生成UUID
      const newUuids = [];
      for (let i = 0; i < count; i++) {
        let uuid;
        
        if (uuidVersion.value === 'v1') {
          uuid = generateUuidV1();
        } else {
          uuid = generateUuidV4();
        }
        
        // 应用格式
        if (formatCase.value === 'upper') {
          uuid = uuid.toUpperCase();
        }
        
        newUuids.push(uuid);
      }
      
      generatedUuids.value = newUuids;
      return newUuids;
    } catch (error) {
      console.error('UUID生成失败:', error);
      throw error;
    } finally {
      isGenerating.value = false;
    }
  };

  // 复制单个UUID
  const copyUuid = async (uuid) => {
    try {
      await navigator.clipboard.writeText(uuid);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      throw err;
    }
  };

  // 复制所有UUID
  const copyAllUuids = async () => {
    try {
      const text = generatedUuids.value.join('\n');
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      throw err;
    }
  };

  // 下载UUID文件
  const downloadUuids = () => {
    try {
      const text = generatedUuids.value.join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `uuids_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      throw error;
    }
  };

  // 清空结果
  const clearResults = () => {
    generatedUuids.value = [];
  };

  // 重置选项
  const resetOptions = () => {
    uuidVersion.value = 'v4';
    generateCount.value = 1;
    formatCase.value = 'lower';
    generatedUuids.value = [];
  };

  return {
    // 状态
    uuidVersion,
    generateCount,
    formatCase,
    generatedUuids,
    isGenerating,
    
    // 计算属性
    hasGeneratedUuids,
    
    // 方法
    generateUuids,
    generateUuidV1,
    generateUuidV4,
    copyUuid,
    copyAllUuids,
    downloadUuids,
    clearResults,
    resetOptions
  };
});