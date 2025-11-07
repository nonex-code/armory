/**
 * Pinia状态管理系统使用示例
 * 展示如何将Pinia状态管理系统集成到Vue组件中
 */

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
        <p>用户名: {{ userProfile.name }}</p>
        <p>邮箱: {{ userProfile.email }}</p>
        <p>年龄: {{ userProfile.age }}</p>
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
      <form class="demo-form">
        <div class="form-group">
          <label for="form-username">用户名:</label>
          <input 
            type="text" 
            id="form-username" 
            :value="formData.username" 
            @input="updateFormField('username', $event.target.value)"
          />
        </div>
        
        <div class="form-group">
          <label for="form-email">邮箱:</label>
          <input 
            type="email" 
            id="form-email" 
            :value="formData.email" 
            @input="updateFormField('email', $event.target.value)"
          />
        </div>
        
        <div class="form-group">
          <label for="form-message">留言:</label>
          <textarea 
            id="form-message" 
            :value="formData.message" 
            @input="updateFormField('message', $event.target.value)"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              :checked="formData.newsletter" 
              @change="updateFormField('newsletter', $event.target.checked)"
            />
            订阅新闻通讯
          </label>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="saveForm">保存表单</button>
          <button type="button" @click="resetForm">重置表单</button>
          <button type="button" @click="clearForm">清除表单</button>
        </div>
      </form>
    </div>
    
    <!-- UI状态示例 -->
    <div class="demo-section">
      <h3>UI状态管理</h3>
      <div class="ui-controls">
        <button @click="toggleTheme">切换主题 (当前: {{ isDarkTheme ? '深色' : '浅色' }})</button>
        <button @click="toggleSidebar">切换侧边栏 (当前: {{ sidebarCollapsed ? '收起' : '展开' }})</button>
        <button @click="addNotification">添加通知</button>
        <button @click="openModal">打开模态框</button>
      </div>
      
      <div class="notification-list">
        <h4>通知列表</h4>
        <div v-if="!hasNotifications" class="no-notifications">暂无通知</div>
        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
          <span :class="['notification-type', notification.type]">{{ notification.type }}</span>
          <span class="notification-message">{{ notification.message }}</span>
          <button @click="removeNotification(notification.id)" class="remove-btn">×</button>
        </div>
      </div>
      
      <div class="accordion-demo">
        <h4>折叠面板</h4>
        <div 
          v-for="(item, index) in accordionItems" 
          :key="index"
          class="accordion-item"
        >
          <div 
            class="accordion-header"
            @click="toggleAccordion(`demo-${index}`)"
          >
            {{ item.title }}
            <span :class="['accordion-icon', { expanded: getAccordionState(`demo-${index}`) }]">
              ▼
            </span>
          </div>
          <div v-show="getAccordionState(`demo-${index}`)" class="accordion-content">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 应用状态示例 -->
    <div class="demo-section">
      <h3>应用状态管理</h3>
      <div class="app-state">
        <p>加载状态: {{ isLoading ? '加载中' : '已完成' }}</p>
        <p>最后更新: {{ lastUpdated ? new Date(lastUpdated).toLocaleString() : '未知' }}</p>
        <p>错误信息: {{ error || '无' }}</p>
      </div>
      
      <div class="app-actions">
        <button @click="setLoading(true)">模拟加载</button>
        <button @click="setLoading(false)">停止加载</button>
        <button @click="setError('这是一个测试错误')">设置错误</button>
        <button @click="clearError">清除错误</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useFormStore } from '@/store/modules/forms';
import { useUIStore } from '@/store/modules/ui';

export default defineComponent({
  name: 'StateManagementDemo',
  setup() {
    // 获取stores
    const appStore = useAppStore();
    const formStore = useFormStore();
    const uiStore = useUIStore();
    
    // 基本状态
    const counter = ref(0);
    const userProfile = ref({
      name: '张三',
      email: 'zhangsan@example.com',
      age: 25
    });
    
    // 本地状态
    const userName = ref('');
    
    // 表单ID
    const formId = 'demo-form';
    
    // 计算属性
    const doubleCounter = computed(() => counter.value * 2);
    const userSummary = computed(() => `${userProfile.value.name} (${userProfile.value.email}) - ${userProfile.value.age}岁`);
    
    // 从stores获取状态
    const formData = computed(() => formStore.getFormState(formId));
    const isDarkTheme = computed(() => uiStore.isDarkTheme);
    const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);
    const notifications = computed(() => uiStore.notifications);
    const hasNotifications = computed(() => uiStore.hasNotifications);
    const isLoading = computed(() => appStore.isLoading);
    const error = computed(() => appStore.error);
    const lastUpdated = computed(() => appStore.lastUpdated);
    
    // 折叠面板数据
    const accordionItems = ref([
      { title: '面板1', content: '这是第一个面板的内容。' },
      { title: '面板2', content: '这是第二个面板的内容。' },
      { title: '面板3', content: '这是第三个面板的内容。' }
    ]);
    
    // 方法
    const increment = () => {
      counter.value++;
    };
    
    const decrement = () => {
      counter.value = Math.max(0, counter.value - 1);
    };
    
    const reset = () => {
      counter.value = 0;
    };
    
    const updateUserName = () => {
      if (userName.value.trim()) {
        userProfile.value = {
          ...userProfile.value,
          name: userName.value
        };
        userName.value = '';
      }
    };
    
    const randomizeUser = () => {
      const names = ['李四', '王五', '赵六', '钱七', '孙八'];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomAge = Math.floor(Math.random() * 50) + 18;
      
      userProfile.value = {
        name: randomName,
        email: `${randomName.toLowerCase()}@${randomDomain}`,
        age: randomAge
      };
    };
    
    // 表单方法
    const updateFormField = (fieldName, value) => {
      formStore.updateFormField(formId, fieldName, value);
    };
    
    const saveForm = () => {
      formStore.setFormState(formId, formData.value);
      uiStore.addNotification({
        message: '表单已保存',
        type: 'success'
      });
    };
    
    const resetForm = () => {
      formStore.resetFormState(formId, {
        username: '',
        email: '',
        message: '',
        newsletter: false
      });
    };
    
    const clearForm = () => {
      formStore.clearFormState(formId);
    };
    
    // UI状态方法
    const toggleTheme = () => {
      uiStore.toggleTheme();
    };
    
    const toggleSidebar = () => {
      uiStore.toggleSidebar();
    };
    
    const addNotification = () => {
      const types = ['info', 'success', 'warning', 'error'];
      const messages = [
        '这是一个信息通知',
        '操作成功完成',
        '请注意这个警告',
        '发生了一个错误'
      ];
      
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      uiStore.addNotification({
        message: randomMessage,
        type: randomType
      });
    };
    
    const removeNotification = (id) => {
      uiStore.removeNotification(id);
    };
    
    const openModal = () => {
      uiStore.openModal('demo-modal', {
        title: '示例模态框',
        content: '这是一个使用Pinia状态管理的模态框示例。'
      });
    };
    
    const toggleAccordion = (id) => {
      uiStore.toggleAccordion(id);
    };
    
    const getAccordionState = (id) => {
      return uiStore.getAccordionState(id);
    };
    
    // 应用状态方法
    const setLoading = (loading) => {
      appStore.setLoading(loading);
    };
    
    const setError = (errorMessage) => {
      appStore.setError(errorMessage);
    };
    
    const clearError = () => {
      appStore.clearError();
    };
    
    // 监听用户变化
    watch(userProfile, (newProfile) => {
      // 保存用户状态到应用store
      appStore.savePageState('userProfile', newProfile);
    }, { deep: true });
    
    // 监听计数器变化
    watch(counter, (newCounter) => {
      // 保存计数器状态到应用store
      appStore.savePageState('counter', newCounter);
    });
    
    // 初始化时恢复状态
    const savedUserProfile = appStore.getPageState('userProfile');
    if (savedUserProfile) {
      userProfile.value = savedUserProfile;
    }
    
    const savedCounter = appStore.getPageState('counter');
    if (savedCounter !== null) {
      counter.value = savedCounter;
    }
    
    return {
      // 状态
      counter,
      userProfile,
      userName,
      formData,
      isDarkTheme,
      sidebarCollapsed,
      notifications,
      hasNotifications,
      isLoading,
      error,
      lastUpdated,
      accordionItems,
      
      // 计算属性
      doubleCounter,
      userSummary,
      
      // 方法
      increment,
      decrement,
      reset,
      updateUserName,
      randomizeUser,
      updateFormField,
      saveForm,
      resetForm,
      clearForm,
      toggleTheme,
      toggleSidebar,
      addNotification,
      removeNotification,
      openModal,
      toggleAccordion,
      getAccordionState,
      setLoading,
      setError,
      clearError
    };
  }
});
</script>

<style scoped>
.state-management-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.user-profile, .user-actions, .app-state, .app-actions {
  margin-bottom: 15px;
}

.user-actions input {
  margin-right: 10px;
  padding: 5px;
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.ui-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.notification-list {
  margin-bottom: 20px;
}

.no-notifications {
  color: #666;
  font-style: italic;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.notification-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
}

.notification-type.info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.notification-type.success {
  background-color: #e8f5e9;
  color: #388e3c;
}

.notification-type.warning {
  background-color: #fff8e1;
  color: #f57c00;
}

.notification-type.error {
  background-color: #ffebee;
  color: #d32f2f;
}

.notification-message {
  flex: 1;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
}

.accordion-demo {
  margin-bottom: 20px;
}

.accordion-item {
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.accordion-header {
  padding: 10px;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-icon {
  transition: transform 0.3s;
}

.accordion-icon.expanded {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 10px;
  border-top: 1px solid #ddd;
}

button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>