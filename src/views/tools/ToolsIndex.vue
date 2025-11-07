<template>
  <div class="tools-index">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">开发工具集合</h1>
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
        />
        <button class="btn btn-square btn-primary" @click="searchTools">
          <BaseIcon name="magnifying-glass" custom-class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- 工具分类卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="category in filteredCategories" 
        :key="category.id"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        @click="goToCategory(category.id)"
      >
        <div class="card-body">
          <div class="flex items-center mb-2">
            <BaseIcon :name="category.icon" custom-class="text-3xl mr-3" />
            <h2 class="card-title">{{ category.name }}</h2>
          </div>
          <p>{{ category.description }}</p>
          <div class="card-actions justify-end">
            <div class="badge badge-outline">{{ getToolCount(category.id) }} 个工具</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门工具 -->
    <div class="mt-8" v-if="popularTools.length > 0">
      <h2 class="text-2xl font-bold mb-4">热门工具</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="tool in popularTools" 
          :key="tool.id"
          class="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
          @click="goToTool(tool.path)"
        >
          <div class="card-body p-4">
            <div class="flex items-center">
              <BaseIcon :name="tool.icon" custom-class="text-2xl mr-2" />
              <h3 class="font-medium">{{ tool.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近使用 -->
    <div class="mt-8" v-if="recentTools.length > 0">
      <h2 class="text-2xl font-bold mb-4">最近使用</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="tool in recentTools" 
          :key="tool.id"
          class="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
          @click="goToTool(tool.path)"
        >
          <div class="card-body p-4">
            <div class="flex items-center">
              <BaseIcon :name="tool.icon" custom-class="text-2xl mr-2" />
              <h3 class="font-medium">{{ tool.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu.js';
import toolService from '@/services/toolService.js';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'ToolsIndexPage'
});

const router = useRouter();
const menuStore = useMenuStore();

// 响应式数据
const searchQuery = ref('');
const categories = ref([]);
const popularTools = ref([]);
const recentTools = ref([]);

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

// 跳转到分类页面
const goToCategory = (categoryId) => {
  router.push(`/tools/category/${categoryId}`);
};

// 跳转到工具页面
const goToTool = (toolPath) => {
  router.push(toolPath);
};

// 搜索工具
const searchTools = () => {
  if (!searchQuery.value.trim()) return;
  
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  });
};

// 初始化数据
const initData = () => {
  categories.value = toolService.getAllCategories();
  popularTools.value = toolService.getPopularTools();
  recentTools.value = toolService.getRecentTools();
};

// 组件挂载时初始化
onMounted(() => {
  initData();
});
</script>

<style scoped>
.tools-index {
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