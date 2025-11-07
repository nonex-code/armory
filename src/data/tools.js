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

// 工具分类配置 - 保留集中配置，因为分类相对稳定
export const toolCategories = [
  {
    id: 'encoding',
    name: '编码转换',
    icon: '🔄',
    description: '各种编码格式转换工具',
    order: 1
  },
  {
    id: 'crypto',
    name: '加密解密',
    icon: '🔐',
    description: '各种加密解密算法工具',
    order: 2
  },
  {
    id: 'hash',
    name: '哈希计算',
    icon: '#️⃣',
    description: '各种哈希算法计算工具',
    order: 3
  },
  {
    id: 'converter',
    name: '格式转换',
    icon: '🔀',
    description: '各种数据格式转换工具',
    order: 4
  },
  {
    id: 'ctf',
    name: 'CTF工具',
    icon: '🎯',
    description: 'CTF竞赛常用工具',
    order: 5
  },
  {
    id: 'text',
    name: '文本处理',
    icon: '📝',
    description: '文本处理相关工具',
    order: 6
  },
  {
    id: 'network',
    name: '网络工具',
    icon: '🌐',
    description: '网络相关工具',
    order: 7
  },
  {
    id: 'frontend',
    name: '前端工具',
    icon: '🎨',
    description: '前端开发常用工具',
    order: 8
  },
  {
    id: 'test',
    name: '测试工具',
    icon: '🧪',
    description: '开发和测试相关工具',
    order: 9
  },
  {
    id: 'generator',
    name: '生成器',
    icon: '🎲',
    description: '各种内容生成工具',
    order: 10
  },
  {
    id: 'tester',
    name: '测试工具',
    icon: '🧪',
    description: '各种测试和验证工具',
    order: 11
  }
];

// 所有工具相关功能请使用 toolService 中的方法