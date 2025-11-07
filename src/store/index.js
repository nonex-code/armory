import { createPinia } from 'pinia';

// 创建Pinia实例
export const pinia = createPinia();

// 导出默认的Pinia实例
export default pinia;

// 导入所有工具类store模块
export * from './modules/tools/index.js';