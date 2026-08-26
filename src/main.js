import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';
import toolService from './services/toolService.js';
import '@/assets/styles/main.scss';

// 初始化路由
import { initRoutes } from './router';

// 创建应用实例
const app = createApp(App)
  .use(router)
  .use(pinia);

// 初始化应用
let isInitialized = false;
const initApp = async () => {
  if (isInitialized) {
    return;
  }
  
  try {
    // 先初始化工具服务，确保菜单数据可用
    await toolService.init();
    
    // 先挂载应用，让用户能看到加载界面
    app.mount('#app');
    
    // 然后初始化路由
    await initRoutes();
    
    isInitialized = true;
    console.log('armory 应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
};

// 启动应用
initApp();