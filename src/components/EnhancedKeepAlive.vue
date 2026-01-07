<template>
  <router-view v-slot="{ Component, route }">
    <transition 
      :name="transitionName" 
      mode="default"
      @before-enter="handleBeforeEnter"
      @enter="handleEnter"
      @after-enter="handleAfterEnter"
      @before-leave="handleBeforeLeave"
      @leave="handleLeave"
      @after-leave="handleAfterLeave"
    >
      <keep-alive :include="cachedComponents" :max="maxCacheSize">
        <component 
          :is="Component" 
          :key="getComponentKey(route)"
          ref="componentRef"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useKeepAliveStore } from '@/store/modules/keepAlive';

const props = defineProps({
  // 过渡动画名称
  transitionName: {
    type: String,
    default: 'fade'
  },
  // 最大缓存数量
  maxCacheSize: {
    type: Number,
    default: 20
  },
  // 是否自动缓存所有组件
  autoCache: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'component-cached',
  'component-activated',
  'component-deactivated',
  'cache-cleared'
]);

const route = useRoute();
const keepAliveStore = useKeepAliveStore();

// 组件引用
const componentRef = ref(null);

// 当前组件key
const currentComponentKey = ref('');

// 获取已缓存的组件列表
const cachedComponents = computed(() => {
  return keepAliveStore.getCachedComponents;
});

// 获取组件key
const getComponentKey = (route) => {
  return keepAliveStore.getComponentKey(route);
};

// 处理过渡动画事件
const handleBeforeEnter = (el) => {
  // 可以在这里添加进入前的动画逻辑
};

const handleEnter = (el, done) => {
  // 可以在这里添加进入中的动画逻辑
  done();
};

const handleAfterEnter = (el) => {
  // 可以在这里添加进入后的动画逻辑
};

const handleBeforeLeave = (el) => {
  // 可以在这里添加离开前的动画逻辑
};

const handleLeave = (el, done) => {
  // 可以在这里添加离开中的动画逻辑
  done();
};

const handleAfterLeave = (el) => {
  // 可以在这里添加离开后的动画逻辑
};

// 监听路由变化
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      const newComponentKey = getComponentKey(route);
      
      // 如果启用自动缓存，添加新组件到缓存列表
      if (props.autoCache && !keepAliveStore.isComponentCached(newComponentKey)) {
        keepAliveStore.addComponentToCache(newComponentKey);
      }
      
      // 设置当前激活的组件
      keepAliveStore.setActiveComponent(newComponentKey);
    }
  }
);

// 组件挂载时初始化
onMounted(() => {
  // 初始化组件状态
  keepAliveStore.initializeComponentStates();
  
  // 添加当前路由对应的组件到缓存
  const componentKey = getComponentKey(route);
  if (props.autoCache && !keepAliveStore.isComponentCached(componentKey)) {
    keepAliveStore.addComponentToCache(componentKey);
  }
  
  // 设置当前激活的组件
  keepAliveStore.setActiveComponent(componentKey);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  // 保存当前组件状态
  if (componentRef.value) {
    keepAliveStore.saveComponentInstance(currentComponentKey.value, componentRef.value);
  }
});

// 手动清除缓存的方法
const clearCache = (componentKey) => {
  if (componentKey) {
    keepAliveStore.removeComponentFromCache(componentKey);
  } else {
    keepAliveStore.clearAllCache();
  }
  
  emit('cache-cleared', componentKey);
};

// 手动保存组件状态
const saveComponentState = (componentKey) => {
  const key = componentKey || currentComponentKey.value;
  if (componentRef.value) {
    keepAliveStore.saveComponentInstance(key, componentRef.value);
  }
};

// 暴露方法给父组件
defineExpose({
  clearCache,
  saveComponentState,
  getCacheStats: keepAliveStore.getCacheStats,
  getCachedComponents: keepAliveStore.getCachedComponents,
  currentComponentKey: computed(() => currentComponentKey.value)
});
</script>

<style scoped>
/* 默认过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>