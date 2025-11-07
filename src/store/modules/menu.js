import { defineStore } from 'pinia';
import toolService from '@/services/toolService.js';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    // 导航菜单项
    navItems: [],
    // 当前激活的菜单项
    activeMenuItem: '',
    // 最近使用的工具
    recentTools: [],
    // 菜单是否已初始化
    initialized: false
  }),

  getters: {
    // 获取所有菜单项
    getAllMenuItems: (state) => {
      return state.navItems;
    },
    
    // 获取展开的菜单项
    getExpandedMenuItems: (state) => {
      return state.navItems.filter(item => item.children && item.children.length > 0);
    },
    
    // 获取当前激活的菜单项
    getActiveMenuItem: (state) => {
      return state.activeMenuItem;
    },
    
    // 获取最近使用的工具
    getRecentTools: (state) => {
      return state.recentTools;
    },
    
    // 获取扁平化的菜单项（包括子菜单）
    getFlatMenuItems: (state) => {
      const flatItems = [];
      
      for (const item of state.navItems) {
        // 添加父级菜单项
        if (item.path) {
          flatItems.push({
            id: item.id,
            name: item.name,
            path: item.path,
            icon: item.icon,
            description: item.description
          });
        }
        
        // 添加子菜单项
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            flatItems.push({
              id: child.id,
              name: child.name,
              path: child.path,
              icon: child.icon,
              description: child.description,
              parentName: item.name
            });
          }
        }
      }
      
      return flatItems;
    }
  },

  actions: {
    // 初始化菜单
    async initMenu() {
      // 防止重复初始化
      if (this.initialized) {
        console.log('菜单已经初始化，跳过重复初始化');
        return;
      }
      
      // 确保工具服务已初始化
      if (!toolService.initialized) {
        await toolService.init();
      }
      
      // 清空现有菜单项，确保不会重复添加
      this.navItems = [];
      
      this.loadMenuFromConfig();
      this.loadRecentTools();
      this.initialized = true;
      console.log('菜单初始化完成');
    },
    
    // 重置菜单初始化状态（用于需要强制重新初始化的情况）
    resetMenuInitialization() {
      this.initialized = false;
      console.log('菜单初始化状态已重置');
    },
    
    // 强制重新初始化菜单
    forceReinitMenu() {
      this.resetMenuInitialization();
      this.initMenu();
    },
    
    // 从配置加载菜单
    loadMenuFromConfig() {
      try {
        this.navItems = toolService.generateMenuData();
      } catch (error) {
        console.error('加载菜单配置失败:', error);
        this.navItems = [];
      }
    },
    
    // 加载最近使用的工具
    loadRecentTools() {
      try {
        this.recentTools = toolService.getRecentTools();
      } catch (error) {
        console.error('加载最近使用工具失败:', error);
        this.recentTools = [];
      }
    },
    
    // 记录工具使用
    recordToolUsage(toolId) {
      toolService.recordToolUsage(toolId);
      this.loadRecentTools();
    },
    
    // 设置当前激活的菜单项
    setActiveMenuItem(path) {
      this.activeMenuItem = path;
    },
    
    // 查找菜单项
    findMenuItem(path) {
      for (const item of this.navItems) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const found = item.children.find(child => child.path === path);
          if (found) return found;
        }
      }
      return null;
    },
    
    // 获取菜单项的父级
    getParentMenuItem(path) {
      for (const item of this.navItems) {
        if (item.children) {
          const found = item.children.find(child => child.path === path);
          if (found) return item;
        }
      }
      return null;
    },
    
    // 搜索菜单项
    searchMenuItems(query) {
      if (!query.trim()) return [];
      
      const results = [];
      const lowerQuery = query.toLowerCase();
      
      for (const item of this.navItems) {
        // 搜索父级菜单
        if (item.name.toLowerCase().includes(lowerQuery) || 
            item.description?.toLowerCase().includes(lowerQuery)) {
          results.push({
            ...item,
            type: 'category'
          });
        }
        
        // 搜索子菜单
        if (item.children) {
          for (const child of item.children) {
            if (child.name.toLowerCase().includes(lowerQuery) || 
                child.description?.toLowerCase().includes(lowerQuery)) {
              results.push({
                ...child,
                parentName: item.name,
                type: 'tool'
              });
            }
          }
        }
      }
      
      return results;
    }
  }
});