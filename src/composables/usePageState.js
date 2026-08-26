import { reactive } from 'vue';

/**
 * 页面状态管理（带 localStorage 持久化）
 *
 * 用法：
 *   const { state, saveState, restoreState, resetState } = usePageState('key', {
 *     searchQuery: '',
 *     results: []
 *   });
 *
 * @param {string} key 状态标识，用于 localStorage 持久化键名
 * @param {Object} initialState 初始状态（会被浅拷贝为响应式对象）
 * @returns {{ state: Object, saveState: Function, restoreState: Function, resetState: Function }}
 */
export const usePageState = (key, initialState = {}) => {
  const storageKey = `pageState_${key}`;
  const state = reactive({ ...initialState });

  // 从 localStorage 恢复状态
  const restoreState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.assign(state, parsed);
        }
      }
    } catch (error) {
      console.warn(`恢复页面状态失败(${key}):`, error);
      // 清除无效的状态数据
      try {
        localStorage.removeItem(storageKey);
      } catch (e) { /* ignore */ }
    }
    return state;
  };

  // 保存状态到 localStorage
  const saveState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn(`保存页面状态失败(${key}):`, error);
    }
  };

  // 重置状态为初始值
  const resetState = () => {
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, { ...initialState });
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`清除页面状态失败(${key}):`, error);
    }
  };

  return {
    state,
    saveState,
    restoreState,
    resetState
  };
};
