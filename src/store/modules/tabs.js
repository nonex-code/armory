import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from './menu';

// 页面状态缓存
const pageStateCache = new Map();

export const useTabsStore = defineStore('tabs', () => {
  const route = useRoute();
  const router = useRouter();
  
  // 选项卡列表
  const tabs = ref([]);
  
  // 当前激活的选项卡
  const activeTab = ref('');
  
  // 获取当前路由对应的选项卡key
  const getTabKey = (route) => {
    return route.fullPath;
  };
  
  // 判断是否为首页路由（路由 name 为 'Home'，注入的首页标签 name 为 'home'，统一大小写比较）
  const isHomeRoute = (routeOrTab) => {
    return routeOrTab?.name && String(routeOrTab.name).toLowerCase() === 'home';
  };
  
  // 添加或更新选项卡
  const addOrUpdateTab = (route, componentInstance = null) => {
    const tabKey = getTabKey(route);
    const existingTabIndex = tabs.value.findIndex(tab => tab.key === tabKey);
    
    if (existingTabIndex === -1) {
      // 新选项卡
      const newTab = {
        key: tabKey,
        title: route.meta?.title || '未命名',
        path: route.fullPath,
        name: route.name,
        icon: getMenuIcon(route.path),
        closable: !isHomeRoute(route), // 首页不可关闭
        createdAt: Date.now()
      };
      
      // 如果是首页，确保它在第一位
      if (isHomeRoute(route)) {
        // 检查首页是否已存在
        const homeIndex = tabs.value.findIndex(tab => isHomeRoute(tab));
        if (homeIndex === -1) {
          tabs.value.unshift(newTab);
        }
      } else {
        // 如果首页不存在，先添加首页
        const homeIndex = tabs.value.findIndex(tab => isHomeRoute(tab));
        if (homeIndex === -1) {
          tabs.value.unshift({
            key: '/',
            title: '首页',
            path: '/',
            name: 'home',
            icon: '🏠',
            closable: false,
            createdAt: Date.now() - 1 // 确保首页的创建时间更早
          });
        }
        tabs.value.push(newTab);
      }
    }
    
    // 保存页面状态
    if (componentInstance) {
      savePageState(tabKey, componentInstance);
    }
    
    // 激活当前选项卡
    activeTab.value = tabKey;
    
    // 保存标签页状态
    saveTabsState(tabs.value, activeTab.value);
  };
  
  // 根据路径获取菜单图标
  const getMenuIcon = (path) => {
    const menuStore = useMenuStore();
    
    // 检查getFlatMenuItems方法是否存在
    if (typeof menuStore.getFlatMenuItems !== 'function') {
      console.warn('getFlatMenuItems方法不存在，使用默认图标');
      return '📄';
    }
    
    // 检查菜单是否已初始化
    if (!menuStore.getAllMenuItems || menuStore.getAllMenuItems.length === 0) {
      console.warn('菜单尚未初始化，使用默认图标');
      return '📄';
    }
    
    const flatItems = menuStore.getFlatMenuItems();
    const menuItem = flatItems.find(item => item.path === path);
    return menuItem?.icon || '📄';
  };
  
  // 保存页面状态
  const savePageState = (tabKey, state) => {
    // 保存状态数据
    const stateData = {
      // 保存时间戳
      savedAt: Date.now(),
      // 保存的状态数据
      data: state || {},
      // 保存路由信息
      route: {
        path: route.fullPath,
        name: route.name,
        params: route.params,
        query: route.query
      }
    };
    
    pageStateCache.set(tabKey, stateData);
    
    // 同时保存到localStorage，以便页面刷新后恢复
    try {
      localStorage.setItem(`pageState_${tabKey}`, JSON.stringify(stateData));
    } catch (error) {
      console.error('保存状态到localStorage失败:', error);
    }
    
    console.log(`已保存页面状态: ${tabKey}`);
  };
  
  // 恢复页面状态
  const restorePageState = (tabKey) => {
    // 先从内存中恢复
    let stateData = pageStateCache.get(tabKey);
    
    // 如果内存中没有，尝试从localStorage恢复
    if (!stateData) {
      try {
        const savedState = localStorage.getItem(`pageState_${tabKey}`);
        if (savedState) {
          stateData = JSON.parse(savedState);
          // 将恢复的状态也保存到内存缓存中
          pageStateCache.set(tabKey, stateData);
        }
      } catch (error) {
        console.error('从localStorage恢复状态失败:', error);
      }
    }
    
    if (stateData) {
      console.log(`恢复页面状态: ${tabKey}`);
      return stateData.data;
    }
    return null;
  };
  
  // 清除页面状态
  const clearPageState = (tabKey) => {
    if (pageStateCache.has(tabKey)) {
      pageStateCache.delete(tabKey);
    }
    
    // 同时清除localStorage中的状态
    try {
      localStorage.removeItem(`pageState_${tabKey}`);
    } catch (error) {
      console.error('清除localStorage中的状态失败:', error);
    }
    
    console.log(`已清除页面状态: ${tabKey}`);
  };
  
  // 初始化时恢复所有保存的状态
  const initializePageStates = () => {
    try {
      // 遍历localStorage中所有页面状态
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pageState_')) {
          const tabKey = key.substring(10); // 移除'pageState_'前缀
          try {
            const stateData = JSON.parse(localStorage.getItem(key));
            if (stateData && stateData.data) {
              pageStateCache.set(tabKey, stateData);
            }
          } catch (error) {
            console.error(`恢复页面状态失败: ${tabKey}`, error);
            // 清除无效的状态数据
            localStorage.removeItem(key);
          }
        }
      }
      console.log('已从localStorage恢复所有页面状态');
    } catch (error) {
      console.error('初始化页面状态失败:', error);
    }
  };
  
  // 关闭选项卡
  const closeTab = (tabKey) => {
    const index = tabs.value.findIndex(tab => tab.key === tabKey);
    if (index !== -1) {
      // 移除状态缓存
      clearPageState(tabKey);
      
      tabs.value.splice(index, 1);
      
      // 如果关闭的是当前激活的选项卡，需要激活另一个选项卡
      if (activeTab.value === tabKey) {
        if (tabs.value.length > 0) {
          // 优先激活前一个选项卡，如果没有则激活后一个
          const newActiveIndex = Math.max(0, index - 1);
          switchToTab(tabs.value[newActiveIndex].key);
        } else {
          // 如果没有选项卡了，跳转到首页
          router.push('/');
        }
      }
      
      // 保存标签页状态
      saveTabsState(tabs.value, activeTab.value);
      
      console.log(`已关闭标签页: ${tabKey}`);
    }
  };
  
  // 关闭其他选项卡
  const closeOtherTabs = (keepTabKey) => {
    const tabsToKeep = tabs.value.filter(tab => 
      tab.key === keepTabKey || !tab.closable
    );
    
    // 移除不需要的选项卡的状态缓存
    tabs.value.forEach(tab => {
      if (!tabsToKeep.some(keepTab => keepTab.key === tab.key)) {
        clearPageState(tab.key);
      }
    });
    
    tabs.value = tabsToKeep;
    
    // 确保当前激活的选项卡没有被关闭
    if (!tabs.value.some(tab => tab.key === activeTab.value)) {
      activeTab.value = tabs.value[0]?.key || '';
    }
    
    // 保存标签页状态
    saveTabsState(tabs.value, activeTab.value);
  };
  
  // 关闭所有选项卡
  const closeAllTabs = () => {
    // 只保留不可关闭的选项卡（如首页）
    const remainingTabs = tabs.value.filter(tab => !tab.closable);
    
    // 清除所有可关闭选项卡的状态缓存
    tabs.value.forEach(tab => {
      if (tab.closable) {
        clearPageState(tab.key);
      }
    });
    
    tabs.value = remainingTabs;
    
    // 跳转到首页
    if (remainingTabs.length === 0) {
      router.push('/');
    } else {
      activeTab.value = remainingTabs[0].key;
      router.push(remainingTabs[0].path);
    }
    
    // 保存标签页状态
    saveTabsState(tabs.value, activeTab.value);
  };
  
  // 切换到指定选项卡
  const switchToTab = (tabKey) => {
    const tab = tabs.value.find(t => t.key === tabKey);
    if (tab) {
      activeTab.value = tabKey;
      
      // 保存标签页状态
      saveTabsState(tabs.value, activeTab.value);
      
      router.push(tab.path);
    }
  };
  
  // 计算属性：当前激活的选项卡
  const currentTab = computed(() => {
    return tabs.value.find(tab => tab.key === activeTab.value);
  });
  
  // 保存标签页状态到localStorage
  const saveTabsState = (tabs, activeTab) => {
    try {
      const state = {
        tabs: tabs,
        activeTab: activeTab,
        savedAt: Date.now()
      };
      localStorage.setItem('tabsState', JSON.stringify(state));
    } catch (error) {
      console.error('保存标签页状态失败:', error);
    }
  };
  
  // 从localStorage恢复标签页状态
  const restoreTabsState = () => {
    try {
      const savedState = localStorage.getItem('tabsState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('恢复标签页状态失败:', error);
    }
    return null;
  };
  
  // 初始化：确保首页选项卡存在并恢复所有保存的状态
  const initialize = () => {
    // 恢复标签页状态
    const tabsState = restoreTabsState();
    if (tabsState && tabsState.tabs && tabsState.tabs.length > 0) {
      tabs.value = tabsState.tabs;
      activeTab.value = tabsState.activeTab;
      
      // 确保首页存在且在第一位
      const homeIndex = tabs.value.findIndex(tab => isHomeRoute(tab));
      if (homeIndex === -1) {
        // 如果首页不存在，添加到第一位
        tabs.value.unshift({
          key: '/',
          title: '首页',
          path: '/',
          name: 'home',
          icon: '🏠',
          closable: false,
          createdAt: Date.now() - 1
        });
      } else if (homeIndex > 0) {
        // 如果首页不在第一位，将其移动到第一位
        const homeTab = tabs.value.splice(homeIndex, 1)[0];
        tabs.value.unshift(homeTab);
      }
    } else {
      // 如果没有保存的状态，确保首页选项卡存在
      if (tabs.value.length === 0) {
        addOrUpdateTab({ 
          fullPath: '/', 
          meta: { title: '首页' },
          name: 'home'
        });
      }
    }
    
    // 初始化页面状态
    initializePageStates();
  };
  
  return {
    tabs,
    activeTab,
    currentTab,
    addOrUpdateTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    switchToTab,
    savePageState,
    restorePageState,
    clearPageState,
    initializePageStates,
    initialize
  };
});