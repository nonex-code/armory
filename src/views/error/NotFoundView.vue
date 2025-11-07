<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'NotFoundPage'
});

const router = useRouter();

// 返回首页
const goToHome = () => {
  router.push('/');
};

// 添加页面进入动画效果
onMounted(() => {
  setTimeout(() => {
    document.querySelector('.error-container')?.classList.add('animate-fade-in');
  }, 100);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-base-100 to-base-200">
    <div class="error-container w-full max-w-md text-center opacity-0 transition-all duration-1000">
      <!-- 错误代码 -->
      <div class="text-[120px] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
        404
      </div>
      
      <!-- 错误信息 -->
      <h1 class="text-2xl font-bold text-base-content mb-4">页面不存在</h1>
      <p class="text-base-content/60 mb-8">
        您访问的页面可能已被删除、移动或暂时不可用
      </p>
      
      <!-- 装饰图形 -->
      <div class="relative h-40 mb-10">
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full animate-ping"></div>
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 flex items-center justify-center">
          <div class="text-6xl">🔍</div>
        </div>
      </div>
      
      <!-- 返回首页按钮 -->
      <button 
        @click="goToHome"
        class="btn btn-primary btn-lg transition-all hover:scale-105"
      >
        返回首页
      </button>
      
      <!-- 辅助信息 -->
      <p class="text-xs text-base-content/40 mt-8">
        错误代码: 404 | 时间: {{ new Date().toLocaleString() }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.animate-fade-in {
  opacity: 1 !important;
}

@keyframes ping {
  75%, 100% {
    transform: translateX(-50%) scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.hover\:scale-105 {
  transition: transform 0.2s;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>