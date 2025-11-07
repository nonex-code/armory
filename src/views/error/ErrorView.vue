<template>
  <div class="error-page">
    <div class="container">
      <div class="error-content">
        <div class="error-icon">
          <BaseIcon name="warning" :size="80" color="#F56C6C" />
        </div>
        
        <h1 class="error-title">出现错误</h1>
        
        <p class="error-message">
          抱歉，系统遇到了一些问题。请稍后再试或联系管理员。
        </p>
        
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            返回首页
          </el-button>
          <el-button @click="goBack">
            返回上一页
          </el-button>
        </div>
        
        <div v-if="showDetails" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <div class="error-info">
                <p><strong>错误代码：</strong>{{ errorCode || '未知' }}</p>
                <p><strong>错误信息：</strong>{{ errorMessage || '未知错误' }}</p>
                <p><strong>发生时间：</strong>{{ errorTime || new Date().toLocaleString() }}</p>
                <p><strong>用户代理：</strong>{{ navigator.userAgent }}</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <div class="help-section">
          <h3>需要帮助？</h3>
          <p>如果您持续遇到此问题，请尝试以下解决方案：</p>
          <ul>
            <li>清除浏览器缓存和Cookie</li>
            <li>检查网络连接是否正常</li>
            <li>尝试使用其他浏览器</li>
            <li>联系技术支持：support@webtools.com</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'ErrorPage'
});

// 路由实例
const router = useRouter();

// 响应式数据
const errorCode = ref('');
const errorMessage = ref('');
const errorTime = ref('');
const showDetails = ref(false);

// 组件挂载时获取错误信息
onMounted(() => {
  // 从路由参数或全局状态获取错误信息
  const route = router.currentRoute.value;
  
  if (route.query.code) {
    errorCode.value = route.query.code;
  }
  
  if (route.query.message) {
    errorMessage.value = decodeURIComponent(route.query.message);
  }
  
  if (route.query.time) {
    errorTime.value = new Date(parseInt(route.query.time)).toLocaleString();
  } else {
    errorTime.value = new Date().toLocaleString();
  }
  
  // 如果有错误信息，显示详情
  if (errorCode.value || errorMessage.value) {
    showDetails.value = true;
  }
});

// 返回首页
const goHome = () => {
  router.push('/');
};

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.error-page {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.error-content {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  margin-bottom: 20px;
}

.error-title {
  font-size: 2rem;
  color: #303133;
  margin-bottom: 16px;
}

.error-message {
  font-size: 1.1rem;
  color: #606266;
  margin-bottom: 30px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.error-details {
  margin-bottom: 30px;
  text-align: left;
}

.error-info {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.error-info p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.help-section {
  text-align: left;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.help-section h3 {
  font-size: 1.2rem;
  color: #303133;
  margin-bottom: 10px;
}

.help-section p {
  color: #606266;
  margin-bottom: 10px;
}

.help-section ul {
  padding-left: 20px;
}

.help-section li {
  color: #606266;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .error-content {
    padding: 20px;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 200px;
  }
}
</style>