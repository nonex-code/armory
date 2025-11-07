import { ref, computed } from 'vue';

// 页面状态管理
export const usePageState = () => {
  // 页面加载状态
  const isLoading = ref(false);
  
  // 页面错误状态
  const error = ref(null);
  
  // 页面数据
  const data = ref(null);
  
  // 计算属性
  const hasError = computed(() => error.value !== null);
  const hasData = computed(() => data.value !== null);
  
  // 设置加载状态
  const setLoading = (loading) => {
    isLoading.value = loading;
  };
  
  // 设置错误
  const setError = (errorMessage) => {
    error.value = errorMessage;
    isLoading.value = false;
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  // 设置数据
  const setData = (newData) => {
    data.value = newData;
    isLoading.value = false;
    error.value = null;
  };
  
  // 重置状态
  const reset = () => {
    isLoading.value = false;
    error.value = null;
    data.value = null;
  };
  
  // 执行异步操作
  const executeAsync = async (asyncFn) => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || '操作失败');
      throw err;
    }
  };
  
  return {
    // 状态
    isLoading,
    error,
    data,
    
    // 计算属性
    hasError,
    hasData,
    
    // 方法
    setLoading,
    setError,
    clearError,
    setData,
    reset,
    executeAsync
  };
};