<script setup>
import { useRoute } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import EnhancedKeepAlive from "@/components/EnhancedKeepAlive.vue";
import { ref, watch } from "vue";

const route = useRoute();
const isLoading = ref(false);

// 监听路由变化显示加载状态
watch(() => route.fullPath, () => {
  isLoading.value = true;
  
  // 减少页面加载时间，避免被误认为是整页刷新
  setTimeout(() => {
    isLoading.value = false;
  }, 150);
}, { immediate: true });
</script>

<template>
  <div>
    <DefaultLayout>
      <EnhancedKeepAlive 
        transition-name="fade" 
        :max-cache-size="20" 
        :auto-cache="true"
      />
    </DefaultLayout>
  </div>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>