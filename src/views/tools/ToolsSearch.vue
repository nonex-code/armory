<template>
  <div class="tools-search">
    <!-- 搜索栏 -->
    <div class="form-control mb-6">
      <div class="input-group">
        <input 
          type="text" 
          placeholder="搜索工具..." 
          class="input input-bordered flex-1"
          v-model="searchQuery"
          @keyup.enter="search"
        />
        <button class="btn btn-square btn-primary" @click="search">
          <BaseIcon name="magnifying-glass" custom-class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchQuery">
      <h2 class="text-2xl font-bold mb-4" v-if="searchResults.length > 0">
        搜索结果 ({{ searchResults.length }})
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="searchResults.length > 0">
        <div 
          v-for="tool in searchResults" 
          :key="tool.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          @click="goToTool(tool.path)"
        >
          <div class="card-body">
            <div class="flex items-center mb-2">
              <BaseIcon :name="tool.icon" custom-class="text-3xl mr-3" />
              <h2 class="card-title">{{ tool.name }}</h2>
            </div>
            <p>{{ tool.description }}</p>
            <div class="card-actions justify-end">
              <div class="badge badge-primary" v-if="tool.isPopular">热门</div>
              <div class="badge badge-outline">{{ tool.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div class="hero min-h-[400px] bg-base-200 rounded-lg" v-else>
        <div class="hero-content text-center">
          <div class="max-w-md">
            <BaseIcon name="magnifying-glass" custom-class="h-24 w-24 mx-auto mb-4 text-base-content/50" />
            <h2 class="text-2xl font-bold mb-2">未找到相关工具</h2>
            <p class="text-base-content/70">尝试使用不同的关键词进行搜索。</p>
            <button class="btn btn-primary mt-4" @click="goToTools">浏览所有工具</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门工具 -->
    <div v-else>
      <h2 class="text-2xl font-bold mb-4">热门工具</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="tool in popularTools" 
          :key="tool.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          @click="goToTool(tool.path)"
        >
          <div class="card-body">
            <div class="flex items-center mb-2">
              <BaseIcon :name="tool.icon" custom-class="text-3xl mr-3" />
              <h2 class="card-title">{{ tool.name }}</h2>
            </div>
            <p>{{ tool.description }}</p>
            <div class="card-actions justify-end">
              <div class="badge badge-primary">热门</div>
              <div class="badge badge-outline">{{ tool.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import toolService from '@/services/toolService.js';
import { usePageState } from '@/composables/usePageState.js';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'ToolsSearchPage'
});

const router = useRouter();
const route = useRoute();

// 使用页面状态管理
const { 
  state: pageState, 
  saveState, 
  restoreState 
} = usePageState(`search_${route.query.q}`, {
  // 初始状态
  searchQuery: '',
  searchResults: [],
  loading: false,
  error: null,
  hasSearched: false
});

// 使用状态管理中的数据
const searchQuery = ref(pageState.searchQuery || '');
const searchResults = computed(() => pageState.searchResults || []);
const loading = ref(pageState.loading || false);
const error = ref(pageState.error || null);
const hasSearched = ref(pageState.hasSearched || false);
const popularTools = ref([]);

// 监听路由查询参数变化
watch(
  () => route.query.q,
  (query) => {
    if (query) {
      searchQuery.value = query;
      search();
    }
  },
  { immediate: true }
);

// 搜索工具
const search = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  searchResults.value = toolService.searchTools(searchQuery.value);
  
  // 更新URL查询参数
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  });
};

// 跳转到工具页面
const goToTool = (toolPath) => {
  router.push(toolPath);
};

// 跳转到工具集合页面
const goToTools = () => {
  router.push('/tools');
};

// 初始化数据
const initData = () => {
  popularTools.value = toolService.getPopularTools();
};

// 监听状态变化，自动保存
watch([
  searchQuery,
  () => searchResults.value,
  hasSearched
], () => {
  // 更新页面状态
  pageState.searchQuery = searchQuery.value;
  pageState.searchResults = searchResults.value;
  pageState.loading = loading.value;
  pageState.error = error.value;
  pageState.hasSearched = hasSearched.value;
  
  // 保存状态
  saveState();
}, { deep: true });

// 生命周期钩子
onMounted(async () => {
  try {
    // 从路由参数获取搜索关键词
    if (route.query.q) {
      searchQuery.value = route.query.q;
      await performSearch();
    }
    
    // 尝试恢复状态
    await restoreState();
    
    // 如果有搜索关键词但没有结果，则执行搜索
    if (searchQuery.value && searchResults.value.length === 0 && !hasSearched.value) {
      await performSearch();
    }
  } catch (err) {
    console.error('初始化失败:', err);
    error.value = '初始化失败，请刷新页面重试';
  }
});
</script>

<style scoped>
.tools-search {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>