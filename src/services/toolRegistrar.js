/**
 * 工具注册器
 * 负责自动发现和注册带有defineOptions的工具组件
 */

// 从tools.js导入工具分类配置
import { toolCategories } from '@/data/tools.js';

// 工具注册表
const toolRegistry = new Map();

/**
 * 从组件中提取工具配置
 * @param {Object} component - Vue组件
 * @returns {Object|null} 工具配置
 */
function extractToolConfig(component) {
  // 尝试从组件的 __vccOpts 中获取配置
  if (component.__vccOpts && component.__vccOpts.meta && component.__vccOpts.meta.tool) {
    return component.__vccOpts.meta.tool;
  }
  
  // 尝试从组件的 options 中获取配置
  if (component.options && component.options.meta && component.options.meta.tool) {
    return component.options.meta.tool;
  }
  
  // 尝试从组件本身获取配置
  if (component.meta && component.meta.tool) {
    return component.meta.tool;
  }
  
  // 尝试从组件的 __hmrId 中获取配置（用于开发环境）
  if (component.__hmrId) {
    if (component.__asyncResolved && component.__asyncResolved.meta && component.__asyncResolved.meta.tool) {
      return component.__asyncResolved.meta.tool;
    }
    if (component.__asyncResolved && component.__asyncResolved.__vccOpts && component.__asyncResolved.__vccOpts.meta && component.__asyncResolved.__vccOpts.meta.tool) {
      return component.__asyncResolved.__vccOpts.meta.tool;
    }
  }
  
  // 尝试从组件的 setup 函数中获取配置
  if (component.setup && component.__type && component.__type.__options && component.__type.__options.meta && component.__type.__options.meta.tool) {
    return component.__type.__options.meta.tool;
  }
  
  // 尝试从组件的 __asyncResolved 中获取配置
  if (component.__asyncResolved) {
    if (component.__asyncResolved.__vccOpts && component.__asyncResolved.__vccOpts.meta && component.__asyncResolved.__vccOpts.meta.tool) {
      return component.__asyncResolved.__vccOpts.meta.tool;
    }
    if (component.__asyncResolved.meta && component.__asyncResolved.meta.tool) {
      return component.__asyncResolved.meta.tool;
    }
  }
  
  // 尝试从组件的 render 函数中获取配置
  if (component.render && component.render.__vccOpts && component.render.__vccOpts.meta && component.render.__vccOpts.meta.tool) {
    return component.render.__vccOpts.meta.tool;
  }
  
  return null;
}

/**
 * 验证工具配置
 * @param {Object} config - 工具配置
 * @param {Array} categories - 可用的分类列表
 * @returns {boolean} 是否有效
 */
function validateToolConfig(config, categories) {
  // 检查必需字段
  const requiredFields = ['id', 'name', 'description', 'icon', 'category', 'tags'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`工具配置缺少必需字段: ${field}`);
      return false;
    }
  }

  // 检查分类是否存在
  const categoryExists = categories.some(cat => cat.id === config.category);
  if (!categoryExists) {
    console.error(`工具配置使用了无效的分类: ${config.category}`);
    return false;
  }

  return true;
}

/**
 * 从文件路径生成工具路径
 * @param {string} filePath - 文件路径
 * @returns {string} 工具路径
 */
function generateToolPath(filePath) {
  return filePath
    .replace(/^.*src\/views\/tools\//, '/tools/')
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '');
}

/**
 * 创建工具对象
 * @param {Object} config - 工具配置
 * @param {Object} component - Vue组件
 * @param {string} path - 工具路径
 * @returns {Object} 工具对象
 */
function createTool(config, component, path) {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    icon: config.icon,
    category: config.category,
    tags: config.tags,
    component,
    path,
    enabled: config.enabled !== undefined ? config.enabled : true,
    isPopular: config.isPopular !== undefined ? config.isPopular : false,
    order: config.order !== undefined ? config.order : 999
  };
}

/**
 * 工具注册器类
 */
class ToolRegistrar {
  constructor() {
    this.tools = [];
    this.initialized = false;
  }

  /**
   * 注册工具
   * @param {Object} toolConfig - 工具配置
   * @param {Function} component - 工具组件
   * @param {string} path - 工具路径
   */
  register(toolConfig, component, path) {
    // 检查工具是否已经注册，防止重复注册
    if (toolRegistry.has(toolConfig.id)) {
      console.warn(`工具 ${toolConfig.id} 已存在，跳过重复注册`);
      return false;
    }

    // 验证工具配置
    if (!this.validateToolConfig(toolConfig)) {
      console.error('工具配置无效:', toolConfig);
      return false;
    }

    // 创建工具对象
    const tool = {
      ...toolConfig,
      component,
      path,
      // 确保默认值
      enabled: toolConfig.enabled !== undefined ? toolConfig.enabled : true,
      isPopular: toolConfig.isPopular !== undefined ? toolConfig.isPopular : false,
      order: toolConfig.order !== undefined ? toolConfig.order : 999
    };

    // 添加到注册表
    toolRegistry.set(toolConfig.id, tool);
    this.tools.push(tool);

    return true;
  }

  /**
   * 验证工具配置
   * @param {Object} config - 工具配置
   * @returns {boolean} 是否有效
   */
  validateToolConfig(config) {
    const requiredFields = ['id', 'name', 'description', 'icon', 'category', 'tags'];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        console.error(`缺少必需字段: ${field}`);
        return false;
      }
    }

    // 检查分类是否存在
    const categoryExists = toolCategories.some(cat => cat.id === config.category);
    if (!categoryExists) {
      console.error(`无效的分类: ${config.category}`);
      return false;
    }

    return true;
  }

  /**
   * 获取所有工具
   * @returns {Array} 工具列表
   */
  getAllTools() {
    return [...this.tools];
  }

  /**
   * 获取启用的工具
   * @returns {Array} 启用的工具列表
   */
  getEnabledTools() {
    return this.tools.filter(tool => tool.enabled);
  }

  /**
   * 根据分类获取工具
   * @param {string} categoryId - 分类ID
   * @returns {Array} 工具列表
   */
  getToolsByCategory(categoryId) {
    return this.tools.filter(tool => tool.category === categoryId && tool.enabled);
  }

  /**
   * 根据ID获取工具
   * @param {string} id - 工具ID
   * @returns {Object|null} 工具对象
   */
  getToolById(id) {
    return toolRegistry.get(id) || null;
  }

  /**
   * 根据路径获取工具
   * @param {string} path - 工具路径
   * @returns {Object|null} 工具对象
   */
  getToolByPath(path) {
    // 移除查询参数和哈希，只保留路径部分
    const cleanPath = path.split('?')[0].split('#')[0];
    
    // 首先尝试精确匹配
    const exactMatch = this.tools.find(tool => tool.path === cleanPath);
    if (exactMatch) {
      return exactMatch;
    }
    
    // 如果精确匹配失败，尝试路径包含匹配
    const pathMatch = this.tools.find(tool => cleanPath.startsWith(tool.path));
    if (pathMatch) {
      return pathMatch;
    }
    
    // 如果路径包含匹配也失败，尝试更宽松的匹配
    const looseMatch = this.tools.find(tool => {
      const toolPathParts = tool.path.split('/').filter(Boolean);
      const inputPathParts = cleanPath.split('/').filter(Boolean);
      
      // 检查路径部分是否匹配
      return toolPathParts.every((part, index) => 
        inputPathParts[index] === part
      );
    });
    
    return looseMatch || null;
  }

  /**
   * 获取启用的分类（只返回有启用工具的分类）
   * @returns {Array} 分类列表
   */
  getEnabledCategories() {
    const enabledCategoryIds = [...new Set(this.getEnabledTools().map(tool => tool.category))];
    return toolCategories
      .filter(category => enabledCategoryIds.includes(category.id))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * 搜索工具
   * @param {string} query - 搜索关键词
   * @returns {Array} 匹配的工具列表
   */
  searchTools(query) {
    if (!query.trim()) return this.getEnabledTools();
    
    const lowerQuery = query.toLowerCase();
    return this.getEnabledTools().filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取热门工具
   * @param {number} limit - 返回数量限制
   * @returns {Array} 热门工具列表
   */
  getPopularTools(limit = 6) {
    return this.getEnabledTools()
      .filter(tool => tool.isPopular)
      .sort((a, b) => a.order - b.order)
      .slice(0, limit);
  }

  /**
   * 生成菜单数据
   * @returns {Array} 菜单数据
   */
  generateMenuData() {
    return this.getEnabledCategories().map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      children: this.getToolsByCategory(category.id).map(tool => ({
        id: tool.id,
        name: tool.name,
        path: tool.path,
        icon: tool.icon,
        description: tool.description
      }))
    }));
  }

  /**
   * 生成路由配置
   * @returns {Array} 路由配置
   */
  generateRoutes() {
    return this.getEnabledTools().map(tool => ({
      path: tool.path,
      name: tool.id,
      component: tool.component,
      meta: {
        title: tool.name,
        description: tool.description,
        category: tool.category,
        icon: tool.icon,
        tags: tool.tags,
        keepAlive: true // 启用页面状态保持
      }
    }));
  }

  /**
   * 初始化工具注册器
   */
  async init() {
    // 加强初始化状态检查，防止重复初始化
    if (this.initialized) {
      return;
    }

    try {
      // 清空现有工具列表，确保不会重复添加
      this.tools = [];
      toolRegistry.clear();
      
      // 使用eager模式动态导入所有工具组件
      const toolModules = import.meta.glob('@/views/tools/**/*.vue', { eager: true });
      
      // 遍历所有工具组件
      for (const path in toolModules) {
        try {
          // 获取组件
          const module = toolModules[path];
          const component = module.default;
          
          // 从路径生成工具路径
          const toolPath = generateToolPath(path);
          
          // 从组件中提取工具配置
          const toolConfig = extractToolConfig(component);
          
          // 如果找到工具配置，则注册工具
          if (toolConfig && validateToolConfig(toolConfig, toolCategories)) {
            // 创建工具对象
            const tool = createTool(toolConfig, component, toolPath);
            
            // 添加到注册表
            toolRegistry.set(toolConfig.id, tool);
            this.tools.push(tool);
          }
        } catch (error) {
          console.error(`加载工具组件失败: ${path}`, error);
        }
      }
      
      // 按order排序
      this.tools.sort((a, b) => a.order - b.order);
      
      this.initialized = true;
      console.log(`工具注册器初始化完成，共注册 ${this.tools.length} 个工具`);
    } catch (error) {
      console.error('工具注册器初始化失败:', error);
    }
  }
}

// 创建单例实例
const toolRegistrar = new ToolRegistrar();

// 导出toolCategories和toolRegistrar
export { toolCategories };
export default toolRegistrar;