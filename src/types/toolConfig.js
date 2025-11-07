/**
 * 工具配置类型定义
 * 定义工具组件中defineOptions应该包含的字段
 */

/**
 * 工具配置接口
 * @typedef {Object} ToolConfig
 * @property {string} id - 工具唯一标识符
 * @property {string} name - 工具显示名称
 * @property {string} description - 工具描述
 * @property {string} icon - 工具图标（emoji或图标类名）
 * @property {string} category - 工具分类ID
 * @property {string[]} tags - 工具标签，用于搜索
 * @property {boolean} [enabled=true] - 是否启用
 * @property {boolean} [isPopular=false] - 是否为热门工具
 * @property {number} [order=999] - 排序权重，数字越小越靠前
 */

/**
 * 工具分类配置接口
 * @typedef {Object} CategoryConfig
 * @property {string} id - 分类唯一标识符
 * @property {string} name - 分类显示名称
 * @property {string} icon - 分类图标（emoji或图标类名）
 * @property {string} description - 分类描述
 * @property {number} order - 排序权重，数字越小越靠前
 */

/**
 * 工具注册接口
 * @typedef {Object} ToolRegistration
 * @property {ToolConfig} config - 工具配置
 * @property {Function} component - 工具组件
 * @property {string} path - 工具路径
 */

/**
 * 示例工具组件defineOptions
 * 
 * defineOptions({
 *   name: 'EncodingConverterPage',
 *   meta: {
 *     tool: {
 *       id: 'encoding-converter',
 *       name: '编解码工具',
 *       description: '支持多种编码格式的编码和解码，包括Base64、Base32、URL编码和HTML实体编码',
 *       icon: '🔄',
 *       category: 'encoding',
 *       tags: ['base64', 'base32', 'url', 'html', '编码', '解码', '转换'],
 *       enabled: true,
 *       isPopular: true,
 *       order: 1
 *     }
 *   }
 * });
 */

export {};