import toolRegistrar, { toolCategories } from './toolRegistrar.js';

/**
 * 工具管理服务
 * 负责处理工具配置的加载、操作和状态管理
 * 现在使用工具注册器从组件defineOptions中获取配置信息
 */
class ToolService {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化工具服务
   */
  async init() {
    if (this.initialized) {
      console.log('工具服务已经初始化，跳过');
      return;
    }

    try {
      console.log('开始初始化工具服务...');
      // 初始化工具注册器
      await toolRegistrar.init();
      this.initialized = true;
      console.log('工具服务初始化完成，共注册', toolRegistrar.getAllTools().length, '个工具');
    } catch (error) {
      console.error('工具服务初始化失败:', error);
    }
  }

  /**
   * 获取所有启用的工具
   * @returns {Array} 工具列表
   */
  getAllTools() {
    return toolRegistrar.getEnabledTools();
  }

  /**
   * 获取所有启用的分类
   * @returns {Array} 分类列表
   */
  getAllCategories() {
    return toolRegistrar.getEnabledCategories();
  }

  /**
   * 获取所有工具分类（包括没有启用的）
   * @returns {Array} 分类列表
   */
  getAllToolCategories() {
    return toolCategories;
  }

  /**
   * 根据分类获取工具
   * @param {string} categoryId 分类ID
   * @returns {Array} 工具列表
   */
  getToolsByCategory(categoryId) {
    return toolRegistrar.getToolsByCategory(categoryId);
  }

  /**
   * 根据路径获取工具
   * @param {string} path 工具路径
   * @returns {Object|null} 工具对象
   */
  getToolByPath(path) {
    return toolRegistrar.getToolByPath(path);
  }

  /**
   * 根据ID获取工具
   * @param {string} id 工具ID
   * @returns {Object|null} 工具对象
   */
  getToolById(id) {
    return toolRegistrar.getToolById(id);
  }

  /**
   * 搜索工具
   * @param {string} query 搜索关键词
   * @returns {Array} 匹配的工具列表
   */
  searchTools(query) {
    return toolRegistrar.searchTools(query);
  }

  /**
   * 获取热门工具（可根据使用频率等指标排序）
   * @param {number} limit 返回数量限制
   * @returns {Array} 热门工具列表
   */
  getPopularTools(limit = 6) {
    return toolRegistrar.getPopularTools(limit);
  }

  /**
   * 获取最近使用的工具（从localStorage读取）
   * @param {number} limit 返回数量限制
   * @returns {Array} 最近使用的工具列表
   */
  getRecentTools(limit = 5) {
    try {
      const recentToolIds = JSON.parse(localStorage.getItem('recentTools') || '[]');
      const recentTools = [];
      
      for (const id of recentToolIds) {
        const tool = toolRegistrar.getToolById(id);
        if (tool) {
          recentTools.push(tool);
        }
        if (recentTools.length >= limit) break;
      }
      
      return recentTools;
    } catch (error) {
      console.error('获取最近使用工具失败:', error);
      return [];
    }
  }

  /**
   * 记录工具使用
   * @param {string} toolId 工具ID
   */
  recordToolUsage(toolId) {
    try {
      let recentToolIds = JSON.parse(localStorage.getItem('recentTools') || '[]');
      
      // 移除已存在的相同工具ID
      recentToolIds = recentToolIds.filter(id => id !== toolId);
      
      // 添加到开头
      recentToolIds.unshift(toolId);
      
      // 限制数量
      recentToolIds = recentToolIds.slice(0, 10);
      
      localStorage.setItem('recentTools', JSON.stringify(recentToolIds));
    } catch (error) {
      console.error('记录工具使用失败:', error);
    }
  }

  /**
   * 清除最近使用记录
   */
  clearRecentTools() {
    try {
      localStorage.removeItem('recentTools');
    } catch (error) {
      console.error('清除最近使用记录失败:', error);
    }
  }

  /**
   * 获取工具统计信息
   * @returns {Object} 统计信息
   */
  getToolStats() {
    const tools = toolRegistrar.getEnabledTools();
    const categories = toolRegistrar.getEnabledCategories();
    
    return {
      totalTools: tools.length,
      totalCategories: categories.length,
      toolsByCategory: categories.reduce((acc, category) => {
        acc[category.id] = toolRegistrar.getToolsByCategory(category.id).length;
        return acc;
      }, {})
    };
  }

  /**
   * 生成菜单数据
   * @returns {Array} 菜单数据
   */
  generateMenuData() {
    return toolRegistrar.generateMenuData();
  }

  /**
   * 生成路由配置
   * @returns {Array} 路由配置
   */
  generateRoutes() {
    return toolRegistrar.generateRoutes();
  }
}

// 创建单例实例
const toolService = new ToolService();

export default toolService;