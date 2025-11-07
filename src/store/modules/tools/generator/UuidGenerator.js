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

  // 生成UUID v1
  const generateUuidV1 = () => {
    // 简化的v1 UUID生成（实际应用中应使用更精确的方法）
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    // 构建v1 UUID格式
    const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHiAndVersion = (((timestamp >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    const clockSeqAndReserved = (0x8000 | (Math.random() * 0x3fff)).toString(16).padStart(4, '0');
    const node = random.substring(0, 12).padStart(12, '0');
    
    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqAndReserved}-${node}`;
  };

  // 生成UUID v4
  const generateUuidV4 = () => {
    // 生成v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 生成UUID
  const generateUuids = async () => {
    isGenerating.value = true;
    generatedUuids.value = [];

    try {
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 生成UUID
      const newUuids = [];
      for (let i = 0; i < generateCount.value; i++) {
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