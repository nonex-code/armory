import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTimestampConverterStore = defineStore('timestampConverter', () => {
  // 状态定义
  const timestampInput = ref('');
  const timestampUnit = ref('seconds'); // 'seconds' 或 'milliseconds'
  const dateResult = ref(null);
  const datetimeInput = ref('');
  const timestampResult = ref(null);
  const currentTime = ref(null);

  // 计算属性
  const hasTimestampInput = computed(() => !!timestampInput.value);
  const hasDatetimeInput = computed(() => !!datetimeInput.value);
  const hasDateResult = computed(() => !!dateResult.value && !dateResult.value.error);
  const hasTimestampResult = computed(() => !!timestampResult.value && !timestampResult.value.error);
  const hasCurrentTime = computed(() => !!currentTime.value);

  // 时间戳转日期
  const convertTimestampToDate = () => {
    if (!timestampInput.value) {
      return;
    }

    try {
      let timestamp = parseInt(timestampInput.value);
      
      // 根据单位转换
      if (timestampUnit.value === 'seconds') {
        timestamp *= 1000; // 转换为毫秒
      }
      
      const date = new Date(timestamp);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        throw new Error('无效的时间戳');
      }
      
      dateResult.value = {
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        iso: date.toISOString()
      };
    } catch (error) {
      dateResult.value = {
        error: error.message
      };
    }
  };

  // 日期转时间戳
  const convertDateToTimestamp = () => {
    if (!datetimeInput.value) {
      return;
    }

    try {
      const date = new Date(datetimeInput.value);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        throw new Error('无效的日期');
      }
      
      timestampResult.value = {
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime()
      };
    } catch (error) {
      timestampResult.value = {
        error: error.message
      };
    }
  };

  // 获取当前时间
  const getCurrentTime = () => {
    const now = new Date();
    
    currentTime.value = {
      local: now.toLocaleString(),
      utc: now.toUTCString(),
      seconds: Math.floor(now.getTime() / 1000),
      milliseconds: now.getTime()
    };
  };

  // 复制时间戳
  const copyTimestamp = async () => {
    if (!timestampResult.value || timestampResult.value.error) {
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(timestampResult.value.seconds);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 复制日期
  const copyDate = async () => {
    if (!dateResult.value || dateResult.value.error) {
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(dateResult.value.local);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  };

  // 清空所有
  const clearAll = () => {
    timestampInput.value = '';
    dateResult.value = null;
    datetimeInput.value = '';
    timestampResult.value = null;
    currentTime.value = null;
  };

  // 重置为初始状态
  const reset = () => {
    clearAll();
    timestampUnit.value = 'seconds';
  };

  return {
    // 状态
    timestampInput,
    timestampUnit,
    dateResult,
    datetimeInput,
    timestampResult,
    currentTime,
    
    // 计算属性
    hasTimestampInput,
    hasDatetimeInput,
    hasDateResult,
    hasTimestampResult,
    hasCurrentTime,
    
    // 方法
    convertTimestampToDate,
    convertDateToTimestamp,
    getCurrentTime,
    copyTimestamp,
    copyDate,
    clearAll,
    reset
  };
});