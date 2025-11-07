<template>
  <div class="tools-category">
    <!-- 返回按钮 -->
    <div class="mb-4">
      <button class="btn btn-ghost btn-sm" @click="goBack">
        <BaseIcon name="arrow-left" custom-class="h-5 w-5 mr-1" />
        返回工具集合
      </button>
    </div>

    <!-- 分类信息 -->
    <div class="mb-6" v-if="category">
      <div class="flex items-center mb-2">
        <BaseIcon :name="category.icon" custom-class="text-4xl mr-3" />
        <div>
          <h1 class="text-3xl font-bold">{{ category.name }}</h1>
          <p class="text-base-content/70 mt-1">{{ category.description }}</p>
        </div>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="tool in tools" 
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

    <!-- 空状态 -->
    <div class="hero min-h-[400px] bg-base-200 rounded-lg" v-if="!category || tools.length === 0">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <BaseIcon name="archive-box" custom-class="h-24 w-24 mx-auto mb-4 text-base-content/50" />
          <h2 class="text-2xl font-bold mb-2">未找到工具</h2>
          <p class="text-base-content/70">该分类下暂无可用工具，请尝试其他分类。</p>
          <button class="btn btn-primary mt-4" @click="goBack">返回工具集合</button>
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
  name: 'ToolsCategoryPage'
});

const router = useRouter();
const route = useRoute();

// 使用页面状态管理
const { 
  state: pageState, 
  saveState, 
  restoreState 
} = usePageState(`category_${route.params.categoryId}`, {
  // 初始状态
  categoryId: '',
  category: null,
  tools: [],
  searchQuery: '',
  loading: false,
  error: null
});

// 使用状态管理中的数据
const categoryId = ref(pageState.categoryId || '');
const category = computed(() => pageState.category || null);
const tools = computed(() => pageState.tools || []);
const searchQuery = ref(pageState.searchQuery || '');
const loading = ref(pageState.loading || false);
const error = ref(pageState.error || null);

// 加载分类数据
const loadCategoryData = () => {
  // 获取分类信息
  category.value = toolService.getCategoryById(categoryId.value);
  
  // 获取分类下的工具
  tools.value = toolService.getToolsByCategory(categoryId.value);
};

// 监听路由参数变化
watch(
  () => route.params.categoryId,
  (newCategoryId) => {
    if (newCategoryId) {
      categoryId.value = newCategoryId;
      loadCategoryData();
    }
  },
  { immediate: true }
);

// 返回上一页
const goBack = () => {
  router.push('/tools');
};

// 跳转到工具页面
const goToTool = (toolPath) => {
  router.push(toolPath);
};

// 监听状态变化，自动保存
watch([
  searchQuery,
  () => category.value,
  () => tools.value
], () => {
  // 更新页面状态
  pageState.searchQuery = searchQuery.value;
  pageState.category = category.value;
  pageState.tools = tools.value;
  pageState.loading = loading.value;
  pageState.error = error.value;
  
  // 保存状态
  saveState();
}, { deep: true });

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 尝试恢复状态
    await restoreState();
    
    // 如果没有数据或分类ID不匹配，则加载新数据
    if (!category.value || categoryId.value !== route.params.categoryId) {
      categoryId.value = route.params.categoryId;
      await loadCategoryData();
    }
  } catch (err) {
    console.error('初始化失败:', err);
    error.value = '加载数据失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.tools-category {
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