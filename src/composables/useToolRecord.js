import { ref } from 'vue';

// 工具记录状态管理
export const useToolRecord = () => {
  const records = ref([]);
  
  // 添加工具使用记录
  const addRecord = (toolId, toolName, inputData, outputData) => {
    const record = {
      id: Date.now() + Math.random(),
      toolId,
      toolName,
      timestamp: new Date().toISOString(),
      inputData,
      outputData
    };
    
    records.value.unshift(record);
    
    // 限制记录数量，最多保存50条
    if (records.value.length > 50) {
      records.value = records.value.slice(0, 50);
    }
    
    return record.id;
  };
  
  // 删除记录
  const removeRecord = (id) => {
    const index = records.value.findIndex(record => record.id === id);
    if (index !== -1) {
      records.value.splice(index, 1);
      return true;
    }
    return false;
  };
  
  // 清空所有记录
  const clearAllRecords = () => {
    records.value = [];
  };
  
  // 获取特定工具的记录
  const getToolRecords = (toolId) => {
    return records.value.filter(record => record.toolId === toolId);
  };
  
  // 获取最近的记录
  const getRecentRecords = (count = 10) => {
    return records.value.slice(0, count);
  };
  
  // 导出记录
  const exportRecords = () => {
    return JSON.stringify(records.value, null, 2);
  };
  
  // 导入记录
  const importRecords = (data) => {
    try {
      const importedRecords = typeof data === 'string' ? JSON.parse(data) : data;
      if (Array.isArray(importedRecords)) {
        records.value = [...importedRecords, ...records.value];
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入记录失败:', error);
      return false;
    }
  };
  
  return {
    records,
    addRecord,
    removeRecord,
    clearAllRecords,
    getToolRecords,
    getRecentRecords,
    exportRecords,
    importRecords
  };
};