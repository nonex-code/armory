<template>
  <div class="state-management-demo">
    <h2>Pinia状态管理系统示例</h2>
    
    <!-- 基本状态使用示例 -->
    <div class="demo-section">
      <h3>基本状态管理</h3>
      <p>计数器: {{ counter }}</p>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="reset">重置</button>
    </div>
    
    <!-- 复杂状态示例 -->
    <div class="demo-section">
      <h3>复杂状态管理</h3>
      <div class="user-profile">
        <p>用户名: {{ userProfile?.name || '未知' }}</p>
        <p>邮箱: {{ userProfile?.email || '未知' }}</p>
        <p>年龄: {{ userProfile?.age || '未知' }}</p>
      </div>
      <div class="user-actions">
        <input v-model="userName" placeholder="输入用户名" />
        <button @click="updateUserName">更新用户名</button>
        <button @click="randomizeUser">随机用户</button>
      </div>
    </div>
    
    <!-- 计算状态示例 -->
    <div class="demo-section">
      <h3>计算状态</h3>
      <p>双倍计数: {{ doubleCounter }}</p>
      <p>用户信息摘要: {{ userSummary }}</p>
    </div>
    
    <!-- 表单状态示例 -->
    <div class="demo-section">
      <h3>表单状态管理</h3>
      <div class="form-example">
        <input v-model="formData.name" placeholder="姓名" />
        <input v-model="formData.email" placeholder="邮箱" />
        <textarea v-model="formData.message" placeholder="留言"></textarea>
        <button @click="saveForm">保存表单</button>
        <button @click="resetForm">重置表单</button>
      </div>
      <div v-if="formStore.getFormState('exampleForm')">
        <p>已保存的表单数据: {{ JSON.stringify(formStore.getFormState('exampleForm')) }}</p>
      </div>
    </div>
    
    <!-- UI状态示例 -->
    <div class="demo-section">
      <h3>UI状态管理</h3>
      <div class="ui-controls">
        <button @click="toggleTheme">切换主题 (当前: {{ uiStore.theme }})</button>
        <button @click="toggleSidebar">切换侧边栏 ({{ uiStore.sidebarCollapsed ? '收起' : '展开' }})</button>
        <button @click="showNotification">显示通知</button>
      </div>
      <div v-if="uiStore.notifications.length > 0" class="notifications">
        <div v-for="notification in uiStore.notifications" :key="notification.id" class="notification">
          {{ notification.message }}
        </div>
      </div>
    </div>
    
    <!-- 应用状态示例 -->
    <div class="demo-section">
      <h3>应用状态管理</h3>
      <div class="app-controls">
        <button @click="toggleLoading">切换加载状态</button>
        <button @click="setError">设置错误</button>
        <button @click="clearError">清除错误</button>
      </div>
      <div class="app-status">
        <p>加载状态: {{ appStore.isLoading ? '加载中' : '已完成' }}</p>
        <p v-if="appStore.error">错误信息: {{ appStore.error }}</p>
        <p>用户偏好: {{ JSON.stringify(appStore.userPreferences) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/store/modules/app.js';
import { useFormStore } from '@/store/modules/forms.js';
import { useUIStore } from '@/store/modules/ui.js';

export default defineComponent({
  name: 'StateManagementDemo',
  setup() {
    // 初始化stores
    const appStore = useAppStore();
    const formStore = useFormStore();
    const uiStore = useUIStore();
    
    // 基本状态管理
    const counter = computed(() => appStore.pageStates.counter || 0);
    const increment = () => {
      appStore.setPageState('counter', (counter.value || 0) + 1);
    };
    const decrement = () => {
      appStore.setPageState('counter', Math.max(0, (counter.value || 0) - 1));
    };
    const reset = () => {
      appStore.setPageState('counter', 0);
    };
    
    // 复杂状态管理
    const userProfile = computed(() => appStore.pageStates.userProfile || {
      name: '张三',
      email: 'zhangsan@example.com',
      age: 25
    });
    
    // 本地状态
    const userName = ref('');
    
    const updateUserName = () => {
      if (userName.value.trim()) {
        appStore.setPageState('userProfile', {
          ...userProfile.value,
          name: userName.value
        });
        userName.value = '';
      }
    };
    
    const randomizeUser = () => {
      const names = ['李四', '王五', '赵六', '钱七', '孙八'];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomAge = Math.floor(Math.random() * 50) + 18;
      
      appStore.setPageState('userProfile', {
        name: randomName,
        email: `${randomName.toLowerCase()}@${randomDomain}`,
        age: randomAge
      });
    };
    
    // 计算状态
    const doubleCounter = computed(() => (counter.value || 0) * 2);
    const userSummary = computed(() => {
      if (!userProfile.value) return '未知用户';
      return `${userProfile.value.name || '未知'} (${userProfile.value.email || '未知'}) - ${userProfile.value.age || '未知'}岁`;
    });
    
    // 表单状态管理
    const formData = ref({
      name: '',
      email: '',
      message: ''
    });
    
    const saveForm = () => {
      formStore.setFormState('exampleForm', formData.value);
    };
    
    const resetForm = () => {
      formData.value = {
        name: '',
        email: '',
        message: ''
      };
      formStore.clearFormState('exampleForm');
    };
    
    // UI状态管理
    const toggleTheme = () => {
      uiStore.setTheme(uiStore.theme === 'light' ? 'dark' : 'light');
    };
    
    const toggleSidebar = () => {
      uiStore.toggleSidebar();
    };
    
    const showNotification = () => {
      uiStore.addNotification({
        type: 'info',
        message: '这是一个测试通知',
        duration: 3000
      });
    };
    
    // 应用状态管理
    const toggleLoading = () => {
      appStore.setLoading(!appStore.isLoading);
    };
    
    const setError = () => {
      appStore.setError('这是一个测试错误');
    };
    
    const clearError = () => {
      appStore.clearError();
    };
    
    // 初始化
    onMounted(() => {
      // 初始化计数器
      if (counter.value === undefined) {
        appStore.setPageState('counter', 0);
      }
      
      // 初始化用户资料
      if (!appStore.pageStates.userProfile) {
        appStore.setPageState('userProfile', {
          name: '张三',
          email: 'zhangsan@example.com',
          age: 25
        });
      }
    });
    
    return {
      // 状态
      counter,
      userProfile,
      doubleCounter,
      userSummary,
      formData,
      userName,
      appStore,
      formStore,
      uiStore,
      
      // 方法
      increment,
      decrement,
      reset,
      updateUserName,
      randomizeUser,
      saveForm,
      resetForm,
      toggleTheme,
      toggleSidebar,
      showNotification,
      toggleLoading,
      setError,
      clearError
    };
  }
});
</script>

<style scoped>
.state-management-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.user-profile {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.user-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-actions input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-example {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.form-example input,
.form-example textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.ui-controls,
.app-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.app-status {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.notifications {
  margin-top: 10px;
}

.notification {
  padding: 8px 12px;
  background-color: #e3f2fd;
  border-radius: 4px;
  margin-bottom: 5px;
}

button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

button:hover {
  background-color: #45a049;
}
</style>