<script setup>
import { onMounted, watch, nextTick, ref, onUnmounted } from 'vue';
import { useTabsStore } from '@/store/modules/tabs';
import { useMenuStore } from '@/store/modules/menu';
import { useRoute } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';

const tabsStore = useTabsStore();
const menuStore = useMenuStore();
const route = useRoute();

// 滚动状态
const isScrolled = ref(false);
const tabsNavigationRef = ref(null);

// 监听路由变化，自动添加选项卡
watch(() => route.fullPath, (newPath) => {
  if (route.name && route.meta?.title) {
    // 确保首页始终存在且在第一位
    const homeTab = {
      key: '/',
      title: '首页',
      path: '/',
      name: 'home',
      icon: '🏠',
      closable: false,
      createdAt: Date.now() - 1
    };
    
    // 检查首页是否存在
    const hasHomeTab = tabsStore.tabs.some(tab => tab.name === 'home');
    if (!hasHomeTab) {
      tabsStore.tabs.unshift(homeTab);
    }
    
    // 添加或更新当前路由的选项卡
    tabsStore.addOrUpdateTab(route);
    
    // 确保首页始终在第一位
    const homeIndex = tabsStore.tabs.findIndex(tab => tab.name === 'home');
    if (homeIndex > 0) {
      const homeTab = tabsStore.tabs.splice(homeIndex, 1)[0];
      tabsStore.tabs.unshift(homeTab);
    }
  }
}, { immediate: true });

// 初始化选项卡
onMounted(async () => {
  try {
    // 确保菜单存储已初始化，防止重复初始化
    if (!menuStore.initialized) {
      await menuStore.initMenu();
    }
    
    // 等待下一个tick，确保菜单数据已加载
    await nextTick();
    
    // 只有在菜单已初始化后才初始化标签页
    if (menuStore.initialized) {
      tabsStore.initialize();
    }
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
  } catch (error) {
    console.error('初始化选项卡时发生错误:', error);
  }
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 处理滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
  
  // 更新tabs-navigation的scrolled类
  if (tabsNavigationRef.value) {
    if (isScrolled.value) {
      tabsNavigationRef.value.classList.add('scrolled');
    } else {
      tabsNavigationRef.value.classList.remove('scrolled');
    }
  }
};

// 关闭选项卡
const handleCloseTab = (tabKey, event) => {
  event.stopPropagation();
  tabsStore.closeTab(tabKey);
};

// 关闭其他选项卡
const handleCloseOtherTabs = (tabKey, event) => {
  event.stopPropagation();
  tabsStore.closeOtherTabs(tabKey);
};

// 关闭所有选项卡
const handleCloseAllTabs = () => {
  tabsStore.closeAllTabs();
};

// 切换标签页
const switchTab = (tabKey) => {
  // 保存当前标签页的状态
  if (tabsStore.activeTab && tabsStore.activeTab !== tabKey) {
    // 触发当前组件保存状态
    window.dispatchEvent(new CustomEvent('savePageState', { 
      detail: { tabKey: tabsStore.activeTab } 
    }));
  }
  
  // 切换到新标签
  tabsStore.switchToTab(tabKey);
  
  // 恢复新标签页的状态
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('restorePageState', { 
      detail: { tabKey: tabKey } 
    }));
  }, 100);
};
</script>

<template>
  <div ref="tabsNavigationRef" class="tabs-navigation bg-base-100/80 backdrop-blur-sm border-b border-base-300/60 shadow-sm">
    <div class="flex items-center px-3 min-h-8">
      <!-- 选项卡列表 -->
      <div class="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        <div 
          v-for="tab in tabsStore.tabs" 
          :key="tab.key"
          @click="switchTab(tab.key)"
          class="flex items-center gap-1.5 px-2 py-1 mx-0.5 rounded-t-md rounded-b-sm cursor-pointer transition-colors duration-150 text-xs min-w-max tab-item mt-1"
          :class="{
            'bg-primary text-primary-content shadow-sm border-t-2 border-l-2 border-r-2 border-primary': tabsStore.activeTab === tab.key,
            'bg-base-200/60 text-base-content border-t border-l border-r border-base-300/40': tabsStore.activeTab !== tab.key
          }"
        >
          <!-- 选项卡图标 -->
          <span class="text-sm">{{ tab.icon }}</span>
          
          <!-- 选项卡标题 -->
          <span class="font-medium truncate max-w-28" :title="tab.title">{{ tab.title }}</span>
          
          <!-- 关闭按钮 -->
          <button 
            v-if="tab.closable"
            @click="handleCloseTab(tab.key, $event)"
            class="ml-0.5 opacity-60 hover:opacity-100 transition-all duration-200 tab-close-btn"
            :class="{ 'text-primary-content': tabsStore.activeTab === tab.key }"
            :title="`关闭 ${tab.title}`"
          >
            <BaseIcon name="x" custom-class="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
      
      <!-- 选项卡操作菜单 -->
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-xs transition-colors duration-200">
            <BaseIcon name="menu" custom-class="w-3.5 h-3.5" />
          </label>
        <ul tabindex="0" class="dropdown-content menu menu-xs bg-base-100/95 backdrop-blur-sm rounded-lg border border-base-300/30 z-[9999] mt-2 w-36 p-1 shadow-xl dropdown-menu">
          <li>
            <a @click="handleCloseOtherTabs(tabsStore.activeTab, $event)" class="text-warning hover:text-warning transition-colors">
              <BaseIcon name="chevron-down" custom-class="w-3 h-3" />
              📌 关闭其他
            </a>
          </li>
          <li>
            <a @click="handleCloseAllTabs" class="text-error hover:text-error transition-colors">
              <BaseIcon name="x" custom-class="w-3 h-3" />
              🗑️ 关闭所有
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    transition: all 0.3s ease;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }

  .tab-item {
    transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
    border-bottom: 1px solid transparent;
  }

  .tab-item:hover {
    border-color: rgba(var(--fallback-p, var(--p)) / 0.5) !important;
    border-bottom-color: rgba(var(--fallback-p, var(--p)) / 0.3) !important;
  }

  .tab-item:active {
    border-color: rgba(var(--fallback-p, var(--p)) / 0.7) !important;
    border-bottom-color: rgba(var(--fallback-p, var(--p)) / 0.5) !important;
  }

  .tab-close-btn {
    transition: opacity 0.15s ease, transform 0.15s ease;
    opacity: 0.6;
  }

  .tab-close-btn:hover {
    opacity: 1;
    transform: scale(1.05);
  }

  .dropdown-menu {
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

.tabs-navigation {
  position: relative;
  width: 100%;
  border-top: 2px solid rgba(var(--fallback-bc, var(--bc)) / 0.25);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to bottom, 
    rgba(var(--fallback-b1, var(--b1)) / 0.85), 
    rgba(var(--fallback-b1, var(--b1)) / 0.7)
  );
  backdrop-filter: blur(12px);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

/* 滚动状态下的增强效果 */
.tabs-navigation.scrolled {
  border-top: 2px solid rgba(var(--fallback-bc, var(--bc)) / 0.3);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.15);
  background: linear-gradient(to bottom, 
    rgba(var(--fallback-b1, var(--b1)) / 0.9), 
    rgba(var(--fallback-b1, var(--b1)) / 0.75)
  );
}

/* 焦点状态下的增强效果 */
.tabs-navigation:focus-within {
  border-top: 2px solid rgba(var(--fallback-p, var(--p)) / 0.5);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    0 6px 20px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(var(--fallback-p, var(--p)) / 0.2);
}
</style>