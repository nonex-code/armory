<template>
  <div class="data-validator">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">数据验证工具</h2>
        <p class="text-base-content/70">验证各种数据格式的有效性</p>
        
        <!-- 输入区域 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">输入数据</span>
          </label>
          <textarea 
            v-model="inputData" 
            class="textarea textarea-bordered h-32" 
            placeholder="请输入需要验证的数据..."
          ></textarea>
        </div>
        
        <!-- 验证类型选择 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">验证类型</span>
          </label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="email" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">邮箱</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="phone" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">手机号</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="url" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">URL</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="json" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">JSON</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="ip" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">IP地址</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="date" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">日期</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="number" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">数字</span>
            </label>
            <label class="cursor-pointer label justify-start gap-2">
              <input 
                type="checkbox" 
                v-model="validationTypes" 
                value="all" 
                class="checkbox checkbox-primary" 
              />
              <span class="label-text">全部验证</span>
            </label>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button class="btn btn-primary" @click="validateData">
            <BaseIcon name="check-circle" custom-class="h-5 w-5 mr-2" />
            验证数据
          </button>
          <button class="btn btn-outline" @click="clearData">
            <BaseIcon name="trash" custom-class="h-5 w-5 mr-2" />
            清空
          </button>
        </div>
        
        <!-- 验证结果 -->
        <div v-if="validationResults.length > 0" class="mt-6">
          <h3 class="text-lg font-semibold mb-3">验证结果</h3>
          <div class="space-y-2">
            <div 
              v-for="result in validationResults" 
              :key="result.type"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="result.isValid ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'"
            >
              <div class="flex items-center">
                <BaseIcon 
                  :name="result.isValid ? 'check-circle' : 'x-circle'" 
                  :custom-class="result.isValid ? 'text-success h-5 w-5 mr-2' : 'text-error h-5 w-5 mr-2'" 
                />
                <span>{{ result.type }}验证</span>
              </div>
              <span :class="result.isValid ? 'text-success' : 'text-error'">
                {{ result.isValid ? '通过' : '失败' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项
const props = defineProps({
  toolId: {
    type: String,
    default: 'data-validator'
  }
});

// 定义工具配置
defineOptions({
  name: 'DataValidatorPage',
  meta: {
    tool: {
      id: 'data-validator',
      name: '数据验证工具',
      description: '数据验证工具，支持验证JSON、XML、YAML等数据格式的合法性和完整性',
      category: 'data',
      icon: '📊',
      tags: ['数据', '验证', 'json', 'xml', 'yaml', '数据处理'],
      enabled: true,
      isPopular: true,
      order: 6
    }
  }
});

// 响应式数据
const inputData = ref('');
const validationTypes = ref(['email', 'phone', 'url']);
const validationResults = ref([]);

// 监听全选选项
watch(() => validationTypes.value.includes('all'), (isAllSelected) => {
  if (isAllSelected) {
    validationTypes.value = ['email', 'phone', 'url', 'json', 'ip', 'date', 'number', 'all'];
  }
});

// 验证函数
const validateData = () => {
  if (!inputData.value.trim()) {
    validationResults.value = [];
    return;
  }

  const results = [];
  const data = inputData.value.trim();

  // 邮箱验证
  if (validationTypes.value.includes('email')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    results.push({
      type: '邮箱',
      isValid: emailRegex.test(data)
    });
  }

  // 手机号验证（中国）
  if (validationTypes.value.includes('phone')) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    results.push({
      type: '手机号',
      isValid: phoneRegex.test(data)
    });
  }

  // URL验证
  if (validationTypes.value.includes('url')) {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    results.push({
      type: 'URL',
      isValid: urlRegex.test(data)
    });
  }

  // JSON验证
  if (validationTypes.value.includes('json')) {
    try {
      JSON.parse(data);
      results.push({
        type: 'JSON',
        isValid: true
      });
    } catch {
      results.push({
        type: 'JSON',
        isValid: false
      });
    }
  }

  // IP地址验证
  if (validationTypes.value.includes('ip')) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(data)) {
      const parts = data.split('.');
      const isValid = parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
      });
      results.push({
        type: 'IP地址',
        isValid: isValid
      });
    } else {
      results.push({
        type: 'IP地址',
        isValid: false
      });
    }
  }

  // 日期验证
  if (validationTypes.value.includes('date')) {
    const date = new Date(data);
    results.push({
      type: '日期',
      isValid: date.toString() !== 'Invalid Date'
    });
  }

  // 数字验证
  if (validationTypes.value.includes('number')) {
    results.push({
      type: '数字',
      isValid: !isNaN(parseFloat(data)) && isFinite(data)
    });
  }

  validationResults.value = results;
};

// 清空数据
const clearData = () => {
  inputData.value = '';
  validationResults.value = [];
};

// 自动验证
watch(inputData, (newValue) => {
  if (newValue.trim()) {
    validateData();
  } else {
    validationResults.value = [];
  }
});
</script>

<style scoped>
.data-validator {
  max-width: 800px;
  margin: 0 auto;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}
</style>