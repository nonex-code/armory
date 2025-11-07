<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Themes } from "@/utils/Themes.js";
import { useMenuStore } from '@/store/modules/menu.js';
import { useTabsStore } from '@/store/modules/tabs.js';
import TabsNavigation from "@/components/TabsNavigation.vue";
import BaseIcon from '@/components/BaseIcon.vue';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const tabsStore = useTabsStore();

// 搜索查询
const searchQuery = ref('');
const searchResults = ref([]);
const isSearchFocused = ref(false);
const searchInputRef = ref(null);

// 移动端菜单状态
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

// 下拉菜单交互状态
const activeDropdown = ref(null);
const dropdownTimeout = ref(null);
const isMouseInDropdown = ref(false);
const isMouseInTrigger = ref(false);

// 打开下拉菜单
const openDropdown = (categoryId) => {
  if (dropdownTimeout.value) {
    clearTimeout(dropdownTimeout.value);
    dropdownTimeout.value = null;
  }
  activeDropdown.value = categoryId;
};

// 关闭下拉菜单（带延迟）
const closeDropdown = (immediate = false) => {
  if (dropdownTimeout.value) {
    clearTimeout(dropdownTimeout.value);
    dropdownTimeout.value = null;
  }
  
  if (immediate) {
    activeDropdown.value = null;
    isMouseInDropdown.value = false;
    isMouseInTrigger.value = false;
  } else {
    dropdownTimeout.value = setTimeout(() => {
      if (!isMouseInDropdown.value && !isMouseInTrigger.value) {
        activeDropdown.value = null;
      }
      dropdownTimeout.value = null;
    }, 150); // 150ms 延迟关闭
  }
};

// 鼠标进入触发区域
const handleMouseEnterTrigger = (categoryId) => {
  isMouseInTrigger.value = true;
  openDropdown(categoryId);
};

// 鼠标离开触发区域
const handleMouseLeaveTrigger = () => {
  isMouseInTrigger.value = false;
  if (!isMouseInDropdown.value) {
    closeDropdown();
  }
};

// 鼠标进入下拉菜单内容区域
const handleMouseEnterDropdown = () => {
  isMouseInDropdown.value = true;
};

// 鼠标离开下拉菜单内容区域
const handleMouseLeaveDropdown = () => {
  isMouseInDropdown.value = false;
  if (!isMouseInTrigger.value) {
    closeDropdown();
  }
};

// 点击触发区域（切换展开/关闭）
const handleClickTrigger = (categoryId) => {
  if (activeDropdown.value === categoryId) {
    closeDropdown(true);
  } else {
    openDropdown(categoryId);
  }
};

// 检查下拉菜单是否展开
const isDropdownOpen = (categoryId) => {
  return activeDropdown.value === categoryId;
};

// 动态页面标题
const pageTitle = computed(() => {
  return route.meta?.title || 'WebTools';
});

// 检查分类是否处于激活状态
const isCategoryActive = (category) => {
  if (!category.children) return false;
  return category.children.some(child => route.path === child.path);
};

// 记录工具使用
const recordToolUsage = (toolId) => {
  menuStore.recordToolUsage(toolId);
};

// 搜索工具
const searchTools = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  searchResults.value = menuStore.searchMenuItems(searchQuery.value).slice(0, 5);
};

// 处理搜索结果点击
const handleSearchResultClick = (result) => {
  if (result.path) {
    router.push(result.path);
    searchQuery.value = '';
    searchResults.value = [];
    isSearchFocused.value = false;
    isMobileMenuOpen.value = false;
    recordToolUsage(result.id);
  }
};

// 处理滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

// 处理键盘快捷键
const handleKeydown = (event) => {
  // Ctrl/Cmd + K 打开搜索
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    searchInputRef.value?.focus();
  }
  
  // ESC 关闭搜索和移动菜单
  if (event.key === 'Escape') {
    isSearchFocused.value = false;
    isMobileMenuOpen.value = false;
  }
};

// 组件挂载时
onMounted(async () => {
  // 确保菜单只初始化一次
  if (!menuStore.initialized) {
    await menuStore.initMenu();
  }
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('keydown', handleKeydown);
});

// 组件卸载时
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('keydown', handleKeydown);
});

// 监听路由变化，更新激活的菜单项
watch(
  () => route.path,
  (newPath) => {
    menuStore.setActiveMenuItem(newPath);
    isMobileMenuOpen.value = false;
  },
  { immediate: true }
);

// 监听搜索查询变化
watch(searchQuery, searchTools);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-base-200">
    <!-- 顶部导航栏 -->
    <header 
      class="sticky top-0 z-40 transition-all duration-300 flex flex-col"
      :class="[
        'bg-base-100/95 backdrop-blur-md border-b border-base-300/50 shadow-sm',
        isScrolled ? 'shadow-md' : 'shadow-sm'
      ]"
    >
      <div class="container mx-auto px-3 py-2">
        <div class="flex items-center justify-between">
          <!-- Logo和主导航 -->
          <div class="flex items-center space-x-2 lg:space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold shadow-lg">
                W
              </div>
              <span class="text-sm font-semibold text-base-content hidden sm:block">WebTools</span>
            </div>
            
            <!-- 主导航菜单 - 桌面端 -->
            <nav class="hidden lg:flex items-center space-x-0.5">
              <ul class="flex items-center space-x-0.5">
                <!-- 首页 -->
                <li>
                  <router-link 
                    to="/" 
                    class="flex items-center px-2 py-1.5 rounded-md transition-all duration-200 group"
                    :class="{ 
                      'bg-primary text-primary-content shadow-sm': $route.path === '/',
                      'hover:bg-base-300/70': $route.path !== '/'
                    }"
                  >
                    <span class="text-base transition-transform duration-200 group-hover:scale-110">🏠</span>
                    <span class="ml-1 text-sm font-medium">首页</span>
                  </router-link>
                </li>
                
                <!-- 工具分类下拉菜单 -->
                <li class="relative" v-for="category in menuStore.getAllMenuItems" :key="category.id">
                  <div v-if="category.children && category.children.length > 0" class="relative">
                    <label 
                      tabindex="0" 
                      class="flex items-center px-2 py-1.5 rounded-md transition-all duration-200 cursor-pointer group whitespace-nowrap"
                      :class="{ 
                        'bg-primary text-primary-content shadow-sm': isCategoryActive(category),
                        'hover:bg-base-300/70': !isCategoryActive(category)
                      }"
                      @mouseenter="handleMouseEnterTrigger(category.id)"
                      @mouseleave="handleMouseLeaveTrigger"
                      @click="handleClickTrigger(category.id)"
                    >
                      <span class="text-base transition-transform duration-200 group-hover:scale-110">{{ category.icon }}</span>
                      <span class="ml-1 text-sm font-medium">{{ category.name }}</span>
                      <BaseIcon 
                        name="chevron-down" 
                        custom-class="h-3 w-3 ml-0.5 transition-transform duration-200"
                        :class="{ 'rotate-180': isDropdownOpen(category.id) }"
                      />
                    </label>
                    <ul 
                      v-show="isDropdownOpen(category.id)"
                      class="absolute left-0 top-full menu p-1.5 shadow-2xl bg-base-100/98 backdrop-blur-md rounded-lg min-w-max max-w-sm mt-1.5 z-50 border border-base-300/40 transition-all duration-300 ease-out"
                      :class="{ 
                        'opacity-100 scale-100 translate-y-0': isDropdownOpen(category.id),
                        'opacity-0 scale-95 -translate-y-2 pointer-events-none': !isDropdownOpen(category.id)
                      }"
                      @mouseenter="handleMouseEnterDropdown"
                      @mouseleave="handleMouseLeaveDropdown"
                    >
                      <div class="grid grid-cols-3 gap-0.5 min-w-0">
                        <li v-for="tool in category.children" :key="tool.id" class="min-w-0">
                          <router-link 
                            :to="tool.path"
                            class="flex items-center justify-center p-2.5 rounded-sm hover:bg-primary/10 hover:text-primary transition-all duration-150 text-center min-h-9 border border-transparent hover:border-primary/20 min-w-0"
                            :class="{ 'bg-primary/15 text-primary border-primary/30': $route.path === tool.path }"
                            @click="recordToolUsage(tool.id); closeDropdown(true)"
                          >
                            <span class="text-sm font-medium truncate leading-tight tracking-tight min-w-0">{{ tool.name }}</span>
                          </router-link>
                        </li>
                      </div>
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
          
          <!-- 右侧工具栏 -->
          <div class="flex items-center space-x-1">
            <!-- 搜索框 -->
            <div class="hidden md:block relative">
              <div class="form-control">
                <input 
                  ref="searchInputRef"
                  type="text" 
                  placeholder="搜索工具 (Ctrl+K)" 
                  class="input input-bordered input-xs bg-base-200/50 focus:bg-base-100 transition-colors duration-200 w-32 lg:w-40 pr-8"
                  v-model="searchQuery"
                  @focus="isSearchFocused = true"
                  @blur="() => setTimeout(() => isSearchFocused = false, 200)"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <BaseIcon name="magnifying-glass" custom-class="h-3 w-3 text-base-content/50" />
                </div>
              </div>
              
              <!-- 搜索结果下拉 -->
              <div v-if="isSearchFocused && searchResults.length > 0" class="absolute top-full mt-1 w-full bg-base-100/95 backdrop-blur-sm rounded-lg shadow-xl border border-base-300/30 z-50 overflow-hidden">
                <ul class="menu menu-compact p-1">
                  <li v-for="result in searchResults" :key="result.id">
                    <a 
                      class="flex items-center p-1.5 rounded hover:bg-base-300/50 transition-colors duration-200"
                      @click="handleSearchResultClick(result)"
                    >
                      <span class="text-base">{{ result.icon }}</span>
                      <div class="ml-2">
                        <span class="text-sm font-medium block">{{ result.name }}</span>
                        <span class="text-xs text-base-content/60 block truncate max-w-32">{{ result.parentName || '工具' }}</span>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- 主题切换 -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle">
                <span class="text-lg">🎨</span>
              </div>
              <ul tabindex="0" class="dropdown-content menu menu-sm bg-base-100/95 backdrop-blur-sm rounded-box shadow-lg border border-base-300/30 z-[9999] mt-2 p-2 w-40">
                <li v-for="t in Themes.availableThemes" :key="t.name">
                  <label class="flex items-center gap-2 btn btn-sm btn-block btn-ghost justify-start" :class="{ 'btn-active': Themes.currentTheme.value === t.name }">
                    <span v-if="t.icon" v-html="t.icon"></span>
                    <span v-else class="size-5"></span>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      class="theme-controller hidden"
                      :aria-label="t.name"
                      :value="t.name"
                      :checked="Themes.currentTheme.value === t.name"
                      @change="Themes.apply(t.name)"
                    />
                    {{ t.name }}
                  </label>
                </li>
              </ul>
            </div>
            
            <!-- 移动端菜单按钮 -->
            <div class="dropdown dropdown-end lg:hidden">
              <label 
                tabindex="0" 
                class="btn btn-ghost btn-xs btn-circle"
                @click="isMobileMenuOpen = !isMobileMenuOpen"
              >
                <BaseIcon name="menu" custom-class="h-4 w-4" />
              </label>
              
              <!-- 移动端菜单 -->
              <ul 
                tabindex="0" 
                class="menu menu-compact dropdown-content mt-2 p-2 shadow bg-base-100/95 backdrop-blur-sm rounded-box w-56 border border-base-300/30"
                :class="{ 'block': isMobileMenuOpen, 'hidden': !isMobileMenuOpen }"
              >
                <!-- 移动端搜索 -->
                <li class="mb-2">
                  <div class="form-control">
                    <div class="relative">
                      <input 
                        type="text" 
                        placeholder="搜索工具" 
                        class="input input-bordered input-xs w-full pr-8"
                        v-model="searchQuery"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <BaseIcon name="magnifying-glass" custom-class="h-3 w-3 text-base-content/50" />
                      </div>
                    </div>
                  </div>
                </li>
                

                
                <!-- 工具分类菜单 -->
                <li v-for="category in menuStore.getAllMenuItems" :key="category.id">
                  <details>
                    <summary class="flex items-center">
                      <span class="text-base mr-2">{{ category.icon }}</span>
                      <span class="text-sm">{{ category.name }}</span>
                    </summary>
                    <ul>
                      <li v-for="tool in category.children" :key="tool.id">
                        <router-link 
                          :to="tool.path"
                          class="flex items-center p-2 rounded hover:bg-base-300/50 transition-colors"
                          :class="{ 'bg-primary text-primary-content': $route.path === tool.path }"
                          @click="recordToolUsage(tool.id)"
                        >
                          <span class="text-sm font-medium truncate">{{ tool.name }}</span>
                        </router-link>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 标签导航集成到header区域 -->
      <TabsNavigation />
    </header>
    
    <!-- 主内容区域 -->
    <main class="flex-1 container mx-auto px-4 py-6 max-w-7xl">
      <!-- 页面标题和面包屑 -->
      <div class="mb-6" v-if="pageTitle && $route.path !== '/'">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-base-content mb-2">{{ pageTitle }}</h1>
            <div class="breadcrumbs text-sm">
              <ul>
                <li>
                  <router-link to="/" class="flex items-center">
                    <BaseIcon name="home" custom-class="h-4 w-4 mr-1" />
                    首页
                  </router-link>
                </li>
                <li v-if="route.meta?.category">
                  {{ route.meta.category }}
                </li>
                <li class="text-base-content/80">
                  {{ pageTitle }}
                </li>
              </ul>
            </div>
          </div>
          
          <!-- 最近使用工具 -->
          <div class="hidden lg:block" v-if="menuStore.getRecentTools.length > 0">
            <div class="text-sm font-medium text-base-content/70 mb-2">最近使用</div>
            <div class="flex space-x-2">
              <router-link 
                v-for="tool in menuStore.getRecentTools.slice(0, 3)" 
                :key="tool.id"
                :to="tool.path"
                class="btn btn-sm btn-ghost bg-base-100/70 border border-base-300/30 hover:bg-base-200/50 transition-all duration-200"
                @click="recordToolUsage(tool.id)"
              >
                <span class="text-lg">{{ tool.icon }}</span>
                <span class="ml-1">{{ tool.name }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>      
      <!-- 页面内容 -->
      <div class="animate-fade-in">
        <slot></slot>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="bg-base-100/80 backdrop-blur-sm border-t border-base-300/50 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-base-content/70 mb-2 md:mb-0">
            © 2023 WebTools - 为开发者打造的实用工具集合
          </div>
          <div class="flex space-x-4 text-sm">
            <a href="#" class="text-base-content/70 hover:text-primary transition-colors">关于</a>
            <a href="#" class="text-base-content/70 hover:text-primary transition-colors">帮助</a>
            <a href="#" class="text-base-content/70 hover:text-primary transition-colors">反馈</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* 自定义滚动条样式 */
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 桌面端风格下拉菜单优化样式 */
.dropdown-content {
  min-width: max-content;
  max-width: 320px;
  overflow: visible;
}

.dropdown-content .grid {
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  min-width: 0;
}

.dropdown-content .grid::-webkit-scrollbar {
  width: 4px;
}

.dropdown-content .grid::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-content .grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dropdown-content .grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dropdown-content .grid li {
  min-width: 0;
  width: 100%;
  transition: all 0.15s ease;
}

.dropdown-content .grid a {
  min-height: 2.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 0;
}

.dropdown-content .grid a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.dropdown-content .grid a:hover::before {
  left: 100%;
}

.dropdown-content .grid a:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.dropdown-content .grid a:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 0.05s;
}

/* 激活状态优化 */
.dropdown-content .grid a.bg-primary\/15 {
  box-shadow: 0 2px 6px rgba(var(--p) / 0.2);
  border-width: 1px;
}

/* 响应式调整 - 确保内容对齐 */
@media (max-width: 1024px) {
  .dropdown-content .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dropdown-content {
    max-width: 280px;
  }
}

@media (max-width: 768px) {
  .dropdown-content .grid {
    grid-template-columns: 1fr;
  }
  
  .dropdown-content .grid a {
    min-height: 2.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .dropdown-content {
    max-width: 240px;
  }
}
</style>