import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 组件实例缓存
const componentCache = new Map();

// 组件状态缓存
const componentStateCache = new Map();

// 最大缓存数量
const MAX_CACHE_SIZE = 20;

export const useKeepAliveStore = defineStore('keepalive', () => {
  // 已缓存的组件列表
  const cachedComponents = ref([]);
  
  // 当前激活的组件
  const activeComponent = ref('');
  
  // 获取当前路由对应的组件key
  const getComponentKey = (route) => {
    return route.fullPath;
  };
  
  // 检查组件是否已缓存
  const isComponentCached = (componentKey) => {
    return cachedComponents.value.includes(componentKey);
  };
  
  // 添加组件到缓存
  const addComponentToCache = (componentKey) => {
    if (!isComponentCached(componentKey)) {
      // 如果缓存已满，移除最早缓存的组件
      if (cachedComponents.value.length >= MAX_CACHE_SIZE) {
        const oldestKey = cachedComponents.value.shift();
        removeComponentFromCache(oldestKey);
      }
      
      cachedComponents.value.push(componentKey);
      console.log(`组件已添加到缓存: ${componentKey}`);
    }
  };
  
  // 从缓存中移除组件
  const removeComponentFromCache = (componentKey) => {
    const index = cachedComponents.value.indexOf(componentKey);
    if (index !== -1) {
      cachedComponents.value.splice(index, 1);
    }
    
    // 清理组件实例缓存
    if (componentCache.has(componentKey)) {
      componentCache.delete(componentKey);
    }
    
    // 清理组件状态缓存
    if (componentStateCache.has(componentKey)) {
      componentStateCache.delete(componentKey);
    }
    
    // 同时清除localStorage中的缓存
    try {
      localStorage.removeItem(`keepalive_${componentKey}`);
      localStorage.removeItem(`keepalive_state_${componentKey}`);
    } catch (error) {
      console.error('清除localStorage中的组件缓存失败:', error);
    }
    
    console.log(`组件已从缓存中移除: ${componentKey}`);
  };
  
  // 保存组件实例
  const saveComponentInstance = (componentKey, instance) => {
    if (!instance) return;
    
    try {
      // 保存组件实例的引用
      componentCache.set(componentKey, instance);
      
      // 提取并保存组件状态
      const stateData = extractComponentState(instance, componentKey);
      componentStateCache.set(componentKey, stateData);
      
      // 同时保存到localStorage，以便页面刷新后恢复
      localStorage.setItem(`keepalive_state_${componentKey}`, JSON.stringify(stateData));
      
      console.log(`组件实例已保存: ${componentKey}`);
    } catch (error) {
      console.error('保存组件状态失败:', error);
    }
  };
  
  // 恢复组件实例
  const restoreComponentInstance = (componentKey) => {
    // 先从内存中恢复
    let instance = componentCache.get(componentKey);
    let stateData = componentStateCache.get(componentKey);
    
    // 如果内存中没有状态，尝试从localStorage恢复
    if (!stateData) {
      try {
        const savedState = localStorage.getItem(`keepalive_state_${componentKey}`);
        if (savedState) {
          stateData = JSON.parse(savedState);
          // 将恢复的状态也保存到内存缓存中
          componentStateCache.set(componentKey, stateData);
        }
      } catch (error) {
        console.error('从localStorage恢复组件状态失败:', error);
      }
    }
    
    return {
      instance,
      stateData
    };
  };
  
  // 提取组件状态
  const extractComponentState = (instance, componentKey) => {
    const stateData = {
      savedAt: Date.now(),
      componentKey: componentKey
    };
    
    try {
      // 提取响应式数据
      if (instance.setupState) {
        stateData.setupState = {};
        
        // 遍历setupState中的所有属性
        Object.keys(instance.setupState).forEach(key => {
          const value = instance.setupState[key];
          
          // 只序列化可序列化的数据
          if (isSerializable(value)) {
            stateData.setupState[key] = value;
          }
        });
      }
      
      // 提取data选项中的数据
      if (instance.data) {
        stateData.data = {};
        Object.keys(instance.data).forEach(key => {
          const value = instance.data[key];
          
          // 只序列化可序列化的数据
          if (isSerializable(value)) {
            stateData.data[key] = value;
          }
        });
      }
      
      // 提取props
      if (instance.props) {
        stateData.props = {};
        Object.keys(instance.props).forEach(key => {
          const value = instance.props[key];
          
          // 只序列化可序列化的数据
          if (isSerializable(value)) {
            stateData.props[key] = value;
          }
        });
      }
      
    } catch (error) {
      console.error('提取组件状态时出错:', error);
    }
    
    return stateData;
  };
  
  // 检查数据是否可序列化
  const isSerializable = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
    if (value instanceof Date) return true;
    if (Array.isArray(value)) return value.every(item => isSerializable(item));
    if (typeof value === 'object') {
      // 检查是否是普通对象
      if (value.constructor === Object || value.constructor === Array) {
        return Object.values(value).every(item => isSerializable(item));
      }
      // 排除Vue实例、DOM节点等不可序列化的对象
      return false;
    }
    return false;
  };
  
  // 应用组件状态
  const applyComponentState = (instance, stateData) => {
    if (!instance || !stateData) return;
    
    try {
      // 恢复setupState中的数据
      if (stateData.setupState && instance.setupState) {
        Object.keys(stateData.setupState).forEach(key => {
          if (key in instance.setupState) {
            instance.setupState[key] = stateData.setupState[key];
          }
        });
      }
      
      // 恢复data选项中的数据
      if (stateData.data && instance.data) {
        Object.keys(stateData.data).forEach(key => {
          if (key in instance.data) {
            instance.data[key] = stateData.data[key];
          }
        });
      }
      
      // 恢复props
      if (stateData.props && instance.props) {
        Object.keys(stateData.props).forEach(key => {
          if (key in instance.props) {
            instance.props[key] = stateData.props[key];
          }
        });
      }
      
      console.log('组件状态已恢复');
    } catch (error) {
      console.error('应用组件状态时出错:', error);
    }
  };
  
  // 初始化时恢复所有保存的组件状态
  const initializeComponentStates = () => {
    try {
      // 遍历localStorage中所有组件状态
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('keepalive_state_')) {
          const componentKey = key.substring(16); // 移除'keepalive_state_'前缀
          try {
            const stateData = JSON.parse(localStorage.getItem(key));
            if (stateData) {
              componentStateCache.set(componentKey, stateData);
              
              // 如果组件不在缓存列表中，添加进去
              if (!isComponentCached(componentKey)) {
                cachedComponents.value.push(componentKey);
              }
            }
          } catch (error) {
            console.error(`恢复组件状态失败: ${componentKey}`, error);
            // 清除无效的状态数据
            localStorage.removeItem(key);
          }
        }
      }
      console.log('已从localStorage恢复所有组件状态');
    } catch (error) {
      console.error('初始化组件状态失败:', error);
    }
  };
  
  // 清除所有缓存
  const clearAllCache = () => {
    // 清除内存缓存
    componentCache.clear();
    componentStateCache.clear();
    cachedComponents.value = [];
    
    // 清除localStorage中的缓存
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('keepalive_') || key.startsWith('keepalive_state_'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('清除localStorage中的组件缓存失败:', error);
    }
    
    console.log('已清除所有组件缓存');
  };
  
  // 获取缓存统计信息
  const getCacheStats = () => {
    return {
      cachedCount: cachedComponents.value.length,
      maxCacheSize: MAX_CACHE_SIZE,
      memoryUsage: componentCache.size,
      stateMemoryUsage: componentStateCache.size
    };
  };
  
  // 设置当前激活的组件
  const setActiveComponent = (componentKey) => {
    activeComponent.value = componentKey;
  };
  
  // 计算属性：获取所有已缓存的组件
  const getCachedComponents = computed(() => {
    return cachedComponents.value;
  });
  
  // 计算属性：获取当前激活的组件
  const getActiveComponent = computed(() => {
    return activeComponent.value;
  });
  
  return {
    // 状态
    cachedComponents,
    activeComponent,
    
    // 方法
    getComponentKey,
    isComponentCached,
    addComponentToCache,
    removeComponentFromCache,
    saveComponentInstance,
    restoreComponentInstance,
    applyComponentState,
    initializeComponentStates,
    clearAllCache,
    getCacheStats,
    setActiveComponent,
    
    // 计算属性
    getCachedComponents,
    getActiveComponent
  };
});