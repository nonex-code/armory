<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import toolService from '@/services/toolService.js';
import BaseIcon from '@/components/BaseIcon.vue';

const router = useRouter();

// 响应式数据
const searchQuery = ref('');
const categories = ref([]);
const selectedCategory = ref(null);
const searchResults = ref([]);
const popularTools = ref([]);
const recentTools = ref([]);
const loading = ref(false);
const error = ref(null);

// 页面状态
const pageState = ref({
  searchQuery: '',
  selectedCategory: null,
  categories: [],
  popularTools: [],
  recentTools: [],
  searchResults: [],
  loading: false,
  error: null
});

// 保存状态到localStorage
const saveState = () => {
  try {
    localStorage.setItem('indexPageState', JSON.stringify(pageState.value));
  } catch (err) {
    console.warn('保存状态失败:', err);
  }
};

// 从localStorage恢复状态
const restoreState = async () => {
  try {
    const savedState = localStorage.getItem('indexPageState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      searchQuery.value = parsedState.searchQuery || '';
      selectedCategory.value = parsedState.selectedCategory || null;
      categories.value = parsedState.categories || [];
      popularTools.value = parsedState.popularTools || [];
      recentTools.value = parsedState.recentTools || [];
      searchResults.value = parsedState.searchResults || [];
      loading.value = parsedState.loading || false;
      error.value = parsedState.error || null;
    }
  } catch (err) {
    console.warn('恢复状态失败:', err);
  }
};

// 计算属性
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(query) || 
    category.description.toLowerCase().includes(query)
  );
});

// 获取分类下的工具数量
const getToolCount = (categoryId) => {
  return toolService.getToolsByCategory(categoryId).length;
};

// 获取分类下的工具列表
const getToolsByCategory = (categoryId) => {
  return toolService.getToolsByCategory(categoryId);
};

// 根据ID获取分类信息
const getCategoryById = (categoryId) => {
  return categories.value.find(category => category.id === categoryId);
};

// 跳转到分类页面
const goToCategory = (categoryId) => {
  // 不再跳转到分类页面，而是在首页展示该分类下的所有工具
  selectedCategory.value = categoryId;
  // 清除搜索，确保显示分类内容
  searchQuery.value = '';
  searchResults.value = [];
};

// 跳转到工具页面
const goToTool = (toolPath) => {
  router.push(toolPath);
};

// 搜索工具
const searchTools = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  searchResults.value = toolService.searchTools(searchQuery.value);
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  selectedCategory.value = null; // 同时清除选中的分类
};

// 记录工具使用
const recordToolUsage = (toolId) => {
  toolService.recordToolUsage(toolId);
};

// 初始化数据
const initData = () => {
  console.log('开始初始化首页数据...');
  categories.value = toolService.getAllCategories();
  console.log('获取到的分类:', categories.value);
  popularTools.value = toolService.getPopularTools(8);
  console.log('获取到的热门工具:', popularTools.value);
  recentTools.value = toolService.getRecentTools(5);
  console.log('获取到的最近使用工具:', recentTools.value);
};

// 监听状态变化，自动保存
watch([
  searchQuery,
  selectedCategory,
  () => categories.value,
  () => popularTools.value,
  () => recentTools.value,
  () => searchResults.value
], () => {
  // 更新页面状态
  pageState.searchQuery = searchQuery.value;
  pageState.selectedCategory = selectedCategory.value;
  pageState.categories = categories.value;
  pageState.popularTools = popularTools.value;
  pageState.recentTools = recentTools.value;
  pageState.searchResults = searchResults.value;
  pageState.loading = loading.value;
  pageState.error = error.value;
  
  // 保存状态
  saveState();
}, { deep: true });

// 组件挂载时初始化
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 尝试恢复状态
    await restoreState();
    
    // 如果没有数据，则加载新数据
    if (categories.value.length === 0) {
      initData();
    }
  } catch (err) {
    console.error('初始化失败:', err);
    error.value = '加载数据失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-base-content">WebTools</h1>
      <p class="text-base-content/70 mt-2">一站式开发工具平台，提供编码、加密、格式转换等多种实用工具</p>
    </div>

    <!-- 搜索栏 -->
    <div class="form-control mb-6">
      <div class="input-group">
        <input 
          type="text" 
          placeholder="搜索工具..." 
          class="input input-bordered flex-1"
          v-model="searchQuery"
          @keyup.enter="searchTools"
        />
        <button class="btn btn-square btn-primary" @click="searchTools">
          <BaseIcon name="magnifying-glass" custom-class="h-6 w-6" />
        </button>
        <button v-if="searchQuery" class="btn btn-square btn-ghost" @click="clearSearch">
          <BaseIcon name="x-mark" custom-class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchQuery" class="mb-6">
      <h2 class="text-xl font-bold mb-4" v-if="searchResults.length > 0">
        搜索结果 ({{ searchResults.length }})
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="searchResults.length > 0">
        <div 
          v-for="tool in searchResults" 
          :key="tool.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
          @click="goToTool(tool.path)"
        >
          <div class="card-body">
            <div class="flex items-center mb-2">
                <BaseIcon :name="tool.icon" custom-class="text-3xl mr-3" />
                <h2 class="card-title">{{ tool.name }}</h2>
              </div>
            <p class="text-sm">{{ tool.description }}</p>
            <div class="card-actions justify-end mt-2">
              <div class="badge badge-primary" v-if="tool.isPopular">热门</div>
              <div class="badge badge-outline">{{ tool.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div class="hero min-h-[200px] bg-base-200 rounded-lg" v-else>
        <div class="hero-content text-center">
          <div class="max-w-md">
            <BaseIcon name="magnifying-glass" custom-class="h-16 w-16 mx-auto mb-4 text-base-content/50" />
            <h2 class="text-xl font-bold mb-2">未找到相关工具</h2>
            <p class="text-base-content/70">尝试使用不同的关键词进行搜索。</p>
            <button class="btn btn-primary mt-4" @click="clearSearch">清除搜索</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具分类展示 -->
    <div v-if="!searchQuery && !selectedCategory">
      <!-- 分类卡片 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">工具分类</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="category in filteredCategories" 
            :key="category.id"
            class="bg-base-100 rounded-xl p-4 shadow-md border border-base-300/30 transition-all hover:shadow-lg scale-95 hover:scale-100 cursor-pointer"
            @click="goToCategory(category.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-2xl mb-2">
                  <BaseIcon :name="category.icon" custom-class="inline-block" />
                </div>
                <div class="text-sm font-medium text-base-content">{{ category.name }}</div>
                <div class="text-xs text-base-content/60 mt-1">{{ category.description }}</div>
                <div class="text-xs text-base-content/50 mt-2">{{ getToolCount(category.id) }} 个工具</div>
              </div>
              <div class="text-base-content/40">
              <BaseIcon name="chevron-right" custom-class="h-5 w-5" />
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类下的工具展示 -->
      <div class="mb-8" v-for="category in filteredCategories" :key="`tools-${category.id}`">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold flex items-center">
              <span class="text-xl mr-2">
                <BaseIcon :name="category.icon" custom-class="inline-block" />
              </span>
              {{ category.name }}
            </h3>
            <button class="btn btn-sm btn-ghost" @click="goToCategory(category.id)">
              查看全部
              <BaseIcon name="chevron-right" custom-class="h-4 w-4 ml-1" />
            </button>
          </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div 
            v-for="tool in getToolsByCategory(category.id).slice(0, 4)" 
            :key="tool.id"
            class="bg-base-100 rounded-lg p-3 shadow-sm border border-base-300/20 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer"
            @click="goToTool(tool.path)"
          >
            <div class="flex items-center">
              <BaseIcon :name="tool.icon" custom-class="text-xl mr-2" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ tool.name }}</div>
                <div class="text-xs text-base-content/60 truncate">{{ tool.description }}</div>
              </div>
              <div class="ml-1" v-if="tool.isPopular">
                <div class="badge badge-primary badge-xs">热门</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门工具和最近使用 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 热门工具 -->
        <div class="bg-base-100 rounded-xl p-4 shadow-md border border-base-300/30">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-semibold flex items-center">
              <span class="text-lg mr-2">🔥</span>
              热门工具
            </h3>
          </div>
          <div class="space-y-2">
            <div 
              v-for="tool in popularTools.slice(0, 5)" 
              :key="tool.id"
              class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
              @click="goToTool(tool.path)"
            >
              <span class="text-xl mr-3">{{ tool.icon }}</span>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ tool.name }}</div>
                <div class="text-xs text-base-content/60">{{ tool.description }}</div>
              </div>
              <div class="badge badge-outline badge-xs">{{ tool.category }}</div>
            </div>
          </div>
        </div>

        <!-- 最近使用 -->
        <div class="bg-base-100 rounded-xl p-4 shadow-md border border-base-300/30" v-if="recentTools.length > 0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-semibold flex items-center">
              <span class="text-lg mr-2">🕒</span>
              最近使用
            </h3>
          </div>
          <div class="space-y-2">
            <div 
              v-for="tool in recentTools" 
              :key="tool.id"
              class="flex items-center p-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
              @click="goToTool(tool.path)"
            >
              <span class="text-xl mr-3">{{ tool.icon }}</span>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ tool.name }}</div>
                <div class="text-xs text-base-content/60">{{ tool.description }}</div>
              </div>
              <div class="badge badge-outline badge-xs">{{ tool.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类详情展示 -->
    <div v-if="selectedCategory && !searchQuery">
      <!-- 返回按钮和分类标题 -->
      <div class="flex items-center mb-6">
        <button class="btn btn-sm btn-ghost mr-3" @click="selectedCategory = null">
          <BaseIcon name="chevron-left" custom-class="h-5 w-5" />
          返回
        </button>
        <h2 class="text-xl font-bold flex items-center">
          <span class="text-xl mr-2">{{ getCategoryById(selectedCategory)?.icon }}</span>
          {{ getCategoryById(selectedCategory)?.name }}
        </h2>
      </div>

      <!-- 分类描述 -->
      <div class="bg-base-100 rounded-xl p-4 shadow-md border border-base-300/30 mb-6">
        <p class="text-sm text-base-content/70">{{ getCategoryById(selectedCategory)?.description }}</p>
        <p class="text-xs text-base-content/50 mt-2">共 {{ getToolCount(selectedCategory) }} 个工具</p>
      </div>

      <!-- 分类下的所有工具 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div 
          v-for="tool in getToolsByCategory(selectedCategory)" 
          :key="tool.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
          @click="goToTool(tool.path)"
        >
          <div class="card-body">
            <div class="flex items-center mb-2">
              <span class="text-3xl mr-3">{{ tool.icon }}</span>
              <h2 class="card-title">{{ tool.name }}</h2>
            </div>
            <p class="text-sm">{{ tool.description }}</p>
            <div class="card-actions justify-end mt-2">
              <div class="badge badge-primary" v-if="tool.isPopular">热门</div>
              <div class="badge badge-outline">{{ tool.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>