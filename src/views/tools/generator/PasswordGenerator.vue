<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔑</span>
        <h1 class="text-3xl md:text-4xl font-bold">密码生成器</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        生成安全随机密码，支持自定义密码选项和强度分析
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 密码选项区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">密码选项</h2>
            <button 
              class="btn btn-sm btn-ghost"
              @click="resetOptions"
            >
              重置
            </button>
          </div>
          
          <!-- 字符类型选项 -->
          <div class="space-y-4">
            <h3 class="font-semibold">字符类型</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">包含大写字母 (A-Z)</span>
                  <input type="checkbox" v-model="options.uppercase" class="checkbox checkbox-primary" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">包含小写字母 (a-z)</span>
                  <input type="checkbox" v-model="options.lowercase" class="checkbox checkbox-primary" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">包含数字 (0-9)</span>
                  <input type="checkbox" v-model="options.numbers" class="checkbox checkbox-primary" />
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">包含特殊字符 (!@#$%^&*)</span>
                  <input type="checkbox" v-model="options.symbols" class="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
          </div>
          
          <!-- 密码长度 -->
          <div class="mt-6">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-semibold">密码长度</h3>
              <span class="badge badge-primary">{{ passwordLength }}</span>
            </div>
            <input
              v-model="passwordLength"
              type="range"
              min="4"
              max="64"
              class="w-full"
            />
            <div class="flex justify-between text-xs mt-1">
              <span>4</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>
          
          <!-- 生成数量 -->
          <div class="mt-6">
            <h3 class="font-semibold mb-2">生成数量</h3>
            <div class="flex items-center space-x-2">
              <input
                v-model="generateCount"
                type="number"
                min="1"
                max="20"
                class="input input-bordered w-20"
              />
              <span class="text-sm">个密码</span>
            </div>
          </div>
          
          <!-- 生成按钮 -->
          <div class="card-actions justify-center mt-6">
              <button
                @click="handleGeneratePasswords"
                class="btn btn-primary"
                :disabled="!hasSelectedOptions || isGenerating"
              >
                <span v-if="isGenerating" class="loading loading-spinner loading-sm"></span>
                生成密码
              </button>
            </div>
        </div>
      </div>
      
      <!-- 生成结果区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">生成结果</h2>
            <div class="flex gap-2">
              <button
                @click="handleCopyAllPasswords"
                class="btn btn-sm btn-primary"
                :disabled="!hasGeneratedPasswords"
              >
                复制全部
              </button>
              <button
                @click="handleDownloadPasswords"
                class="btn btn-sm btn-secondary"
                :disabled="!hasGeneratedPasswords"
              >
                下载文件
              </button>
              <button
                @click="clearResults"
                class="btn btn-sm btn-ghost"
                :disabled="!hasGeneratedPasswords"
              >
                清空结果
              </button>
            </div>
          </div>
          
          <!-- 密码列表 -->
          <div v-if="hasGeneratedPasswords" class="bg-base-200 p-3 rounded-lg max-h-64 overflow-y-auto">
            <div class="space-y-2">
              <div
                v-for="(password, index) in generatedPasswords"
                :key="index"
                class="flex items-center justify-between p-2 bg-base-100 rounded"
              >
                <span class="font-mono text-sm">{{ password }}</span>
                <div class="flex space-x-1">
                  <button
                    @click="handleCopyPassword(password)"
                    class="btn btn-xs btn-ghost"
                  >
                    复制
                  </button>
                  <button
                    @click="checkPasswordStrength(password)"
                    class="btn btn-xs btn-ghost"
                  >
                    强度
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="flex flex-col items-center justify-center h-64 bg-base-200 rounded-lg">
            <span class="text-6xl mb-4">🔑</span>
            <p class="text-base-content/50">生成的密码将显示在这里</p>
          </div>
          
          <!-- 密码强度检查结果 -->
          <div v-if="passwordStrength" class="mt-4 bg-base-200 p-3 rounded-lg">
            <h3 class="text-sm font-medium mb-2">密码强度分析</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>强度等级:</span>
                <span :class="getStrengthClass(passwordStrength.score)">{{ passwordStrength.text }}</span>
              </div>
              <div class="w-full bg-base-300 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :class="getStrengthBarClass(passwordStrength.score)"
                  :style="{ width: `${passwordStrength.score * 20}%` }"
                ></div>
              </div>
              <div class="text-xs opacity-70">
                {{ passwordStrength.feedback }}
              </div>
            </div>
          </div>
          
          <!-- 进度指示器 -->
          <div v-if="isGenerating" class="mt-4">
            <div class="flex items-center justify-center space-x-2">
              <div class="loading loading-spinner loading-sm"></div>
              <span class="text-sm">正在生成密码...</span>
            </div>
            <progress class="progress progress-primary w-full mt-2" value="70" max="100"></progress>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">使用方法</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>选择密码包含的字符类型（大写字母、小写字母、数字、特殊字符）</li>
              <li>设置密码长度（4-64位）</li>
              <li>设置生成数量（1-20个）</li>
              <li>点击"生成密码"按钮</li>
              <li>查看生成结果，可以复制、检查强度或下载为文件</li>
            </ol>
          </div>
          
          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div>
              <h3 class="font-bold">安全提示</h3>
              <div class="text-sm">
                <p>请妥善保管生成的密码，建议使用密码管理器存储重要密码。</p>
                <p>不要在不安全的网络环境下传输或存储密码。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { usePasswordGeneratorStore } from '@/store/modules/tools/generator/PasswordGenerator';
import { useToast } from '@/composables/useToast';
import toolService from '@/services/toolService';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'PasswordGeneratorPage',
  meta: {
    tool: {
      id: 'password-generator',
      name: '密码生成器',
      description: '密码生成工具，支持生成安全、随机的密码，可自定义长度和字符类型',
      icon: '🎨',
      category: 'generator',
      tags: ['密码', '生成', '安全', '随机', '强度', '内容生成'],
      enabled: true,
      isPopular: true,
      order: 3
    }
  }
});

// 使用store
const store = usePasswordGeneratorStore();
const {
  passwordLength,
  generateCount,
  generatedPasswords,
  isGenerating,
  passwordStrength,
  options,
  hasSelectedOptions,
  hasGeneratedPasswords
} = storeToRefs(store);

const {
  generatePasswords,
  copyPassword,
  copyAllPasswords,
  downloadPasswords,
  checkPasswordStrength,
  getStrengthClass,
  getStrengthBarClass,
  clearResults,
  resetOptions
} = store;

// 使用提示
const { showToast } = useToast();

// 包装方法以添加提示和记录
const handleGeneratePasswords = async () => {
  const success = await generatePasswords();
  if (success) {
    showToast('密码生成成功', 'success');
    toolService.recordToolUsage('password-generator');
  } else {
    showToast('请至少选择一种字符类型', 'warning');
  }
};

const handleCopyPassword = async (password) => {
  const success = await copyPassword(password);
  if (success) {
    showToast('密码已复制到剪贴板', 'success');
  } else {
    showToast('复制失败', 'error');
  }
};

const handleCopyAllPasswords = async () => {
  const success = await copyAllPasswords();
  if (success) {
    showToast('所有密码已复制到剪贴板', 'success');
  } else {
    showToast('复制失败', 'error');
  }
};

const handleDownloadPasswords = () => {
  const success = downloadPasswords();
  if (success) {
    showToast('密码文件已下载', 'success');
  } else {
    showToast('下载失败', 'error');
  }
};
</script>