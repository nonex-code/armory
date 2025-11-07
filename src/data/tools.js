/**
 * 工具配置文件 - 新系统版本
 * 
 * 注意：此文件已完全迁移到新的工具注册系统
 * 新工具应通过在组件中使用 defineOptions 添加 meta.tool 配置来注册
 * 
 * 新系统示例：
 * defineOptions({
 *   name: 'ToolName',
 *   meta: {
 *     tool: {
 *       id: 'tool-id',
 *       name: '工具名称',
 *       description: '工具描述',
 *       category: 'category-id',
 *       icon: 'icon-name',
 *       tags: ['标签1', '标签2'],
 *       keywords: ['关键词1', '关键词2']
 *     }
 *   }
 * });
 * 
 * 工具注册系统会自动发现和注册带有 defineOptions.meta.tool 配置的组件
 * 详见 src/services/toolRegistrar.js
 */

// 此文件现在仅用于导出工具分类配置
// 所有工具配置已迁移到各自的组件中

// 工具分类配置 - 10个边界清晰的固定分类体系
export const toolCategories = [
  {
    id: 'encoding',
    name: '编码解码',
    icon: '🔤',
    description: '字符编码、URL编码、Base64等编码解码工具',
    order: 1
  },
  {
    id: 'crypto',
    name: '加密安全',
    icon: '🔐',
    description: '加密解密、哈希计算、数字签名等安全工具',
    order: 2
  },
  {
    id: 'data',
    name: '数据处理',
    icon: '📊',
    description: '数据格式转换、验证、清洗和格式化工具',
    order: 3
  },
  {
    id: 'text',
    name: '文本编辑',
    icon: '📝',
    description: '文本处理、格式化、统计和转换工具',
    order: 4
  },
  {
    id: 'network',
    name: '网络工具',
    icon: '🌐',
    description: '网络诊断、API测试、端口扫描等网络相关工具',
    order: 5
  },
  {
    id: 'developer',
    name: '开发工具',
    icon: '💻',
    description: '前端开发、代码格式化、正则表达式等开发工具',
    order: 6
  },
  {
    id: 'generator',
    name: '内容生成',
    icon: '🎲',
    description: '密码、颜色、二维码、UUID等内容生成工具',
    order: 7
  },
  {
    id: 'ctf',
    name: 'CTF工具',
    icon: '🎯',
    description: 'CTF竞赛专用工具，如密码学、隐写术等',
    order: 8
  },
  {
    id: 'utility',
    name: '实用工具',
    icon: '🛠️',
    description: '时间戳转换、单位换算等日常实用工具',
    order: 9
  },
  {
    id: 'analysis',
    name: '分析工具',
    icon: '🔍',
    description: '数据统计、性能分析、日志分析等分析工具',
    order: 10
  }
];

// 所有工具相关功能请使用 toolService 中的方法