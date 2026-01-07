import { createRouter, createWebHistory } from 'vue-router';
import toolService from '@/services/toolService.js';

// 基础路由配置
const baseRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/tools/category/:categoryId',
    name: 'ToolsCategory',
    component: () => import('@/views/tools/ToolsCategory.vue'),
    meta: { title: '工具分类' }
  },
  {
    path: '/search',
    name: 'ToolsSearch',
    component: () => import('@/views/tools/ToolsSearch.vue'),
    meta: { title: '工具搜索' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/views/error/ErrorView.vue'),
    meta: { title: '错误' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
];

// 标记路由是否已初始化
let routesInitialized = false;

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 动态添加工具路由
export const addToolRoutes = async () => {
  // 防止重复初始化
  if (routesInitialized) {
    console.log('工具路由已初始化，跳过重复添加');
    return;
  }
  
  try {
    console.log('开始添加工具路由...');
    // 确保工具服务已初始化
    if (!toolService.initialized) {
      await toolService.init();
    }
    
    // 获取工具路由
    const toolRoutes = toolService.generateRoutes();
    console.log('获取到的工具路由数量:', toolRoutes.length);
    
    // 添加工具路由到根路由
    toolRoutes.forEach(route => {
      // 检查路由是否已存在，防止重复添加
      if (!router.hasRoute(route.name)) {
        router.addRoute(route);
        console.log(`已添加工具路由: ${route.name} (${route.path})`);
      } else {
        console.log(`路由 ${route.name} 已存在，跳过添加`);
      }
    });
    
    // 标记为已初始化
    routesInitialized = true;
    console.log(`已添加 ${toolRoutes.length} 个工具路由`);
  } catch (error) {
    console.error('添加工具路由失败:', error);
  }
};

// 初始化路由
export const initRoutes = async () => {
  await addToolRoutes();
};

// 立即初始化工具路由
initRoutes().catch(error => {
  console.error('初始化工具路由失败:', error);
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - armory`;
  } else {
    document.title = 'armory';
  }
  
  // 检查是否是工具路由
  if (to.path.startsWith('/tools/')) {
    try {
      // 检查当前路由列表是否为空（即工具路由是否已初始化）
      if (!routesInitialized) {
        console.log('路由守卫: 工具路由未初始化，开始初始化');
        await toolService.init();
        await addToolRoutes();
        
        // 重新初始化后，检查工具是否存在
        const tool = toolService.getToolByPath(to.path);
        if (tool) {
          // 如果工具存在，重新导航以触发新添加的路由
          console.log('路由守卫: 工具存在，重新导航');
          next({ path: to.path, force: true });
          return;
        } else {
          // 如果工具不存在，跳转到404
          console.log('路由守卫: 工具不存在，跳转到404');
          next({ name: 'NotFound' });
          return;
        }
      }
      
      // 如果路由已初始化，检查工具是否存在
      const tool = toolService.getToolByPath(to.path);
      if (!tool) {
        console.log('路由守卫: 工具不存在，跳转到404');
        next({ name: 'NotFound' });
        return;
      }
      
    } catch (error) {
      console.error('路由守卫: 初始化工具服务失败', error);
      next({ name: 'Error' });
      return;
    }
  }
  
  // 如果是404路由，先检查是否是工具路由
  if (to.name === 'NotFound' && to.path.startsWith('/tools/')) {
    console.log('路由守卫: 检测到工具路径被匹配到404，尝试重新初始化');
    
    try {
      // 确保工具服务已初始化
      if (!toolService.initialized) {
        await toolService.init();
      }
      
      // 检查工具是否存在
      const tool = toolService.getToolByPath(to.path);
      if (tool) {
        // 如果工具存在，说明路由可能未正确添加，重新初始化路由
        if (!routesInitialized) {
          await addToolRoutes();
        }
        
        // 重新导航到工具路径
        console.log('路由守卫: 工具存在，重新导航到工具页面');
        next({ path: to.path, force: true });
        return;
      }
    } catch (error) {
      console.error('路由守卫: 处理404工具路径失败', error);
    }
  }
  
  next();
});

export default router;
