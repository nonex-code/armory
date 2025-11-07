<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">🔍 正则表达式测试</h1>
      <p class="text-lg text-base-content/70">测试和调试正则表达式</p>
    </div>

    <div class="space-y-6">
      <!-- 正则表达式输入 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">正则表达式</h2>
          <div class="flex items-center space-x-2">
            <span class="text-lg font-mono">/</span>
            <input
              v-model="regexPattern"
              type="text"
              placeholder="输入正则表达式，如: ^[a-zA-Z]+$"
              class="flex-1 input input-bordered font-mono"
            />
            <span class="text-lg font-mono">/</span>
            <input
              v-model="regexFlags"
              type="text"
              placeholder="gim"
              class="w-16 input input-bordered font-mono text-center"
            />
          </div>
        </div>
      </div>

      <!-- 测试文本 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">测试文本</h2>
          <textarea
            v-model="testText"
            placeholder="输入要测试的文本..."
            class="textarea textarea-bordered h-32 w-full"
          ></textarea>
        </div>
      </div>

      <!-- 正则选项 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">正则选项</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">全局 (g)</span>
                <input type="checkbox" v-model="flags.g" @change="regexTesterStore.updateFlags" class="checkbox checkbox-primary" />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">忽略大小写 (i)</span>
                <input type="checkbox" v-model="flags.i" @change="regexTesterStore.updateFlags" class="checkbox checkbox-primary" />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">多行 (m)</span>
                <input type="checkbox" v-model="flags.m" @change="regexTesterStore.updateFlags" class="checkbox checkbox-primary" />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Unicode (u)</span>
                <input type="checkbox" v-model="flags.u" @change="regexTesterStore.updateFlags" class="checkbox checkbox-primary" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="flex justify-center">
        <button
          @click="handleTestRegex"
          class="btn btn-primary btn-lg"
          :disabled="!regexPattern || !testText"
        >
          测试正则
        </button>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" class="space-y-6">
        <!-- 匹配结果 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">匹配结果</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="stat">
                <div class="stat-title">匹配状态</div>
                <div class="stat-value" :class="testResult.isValid ? 'text-success' : 'text-error'">
                  {{ testResult.isValid ? '有效' : '无效' }}
                </div>
              </div>
              <div class="stat">
                <div class="stat-title">匹配数量</div>
                <div class="stat-value">{{ testResult.matches.length }}</div>
              </div>
            </div>
            
            <!-- 匹配项列表 -->
            <div v-if="testResult.matches.length > 0" class="mt-6">
              <h3 class="font-semibold mb-3">匹配项</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(match, index) in testResult.matches"
                  :key="index"
                  class="bg-base-200 p-3 rounded-lg"
                >
                  <div class="font-mono">{{ match.value }}</div>
                  <div class="text-sm opacity-70">位置: {{ match.index }}-{{ match.index + match.value.length }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 高亮显示 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">高亮显示</h2>
            <div class="bg-base-200 p-4 rounded-lg whitespace-pre-wrap" v-html="highlightedText"></div>
          </div>
        </div>

        <!-- 分组捕获 -->
        <div v-if="testResult.groups && testResult.groups.length > 0" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">分组捕获</h2>
            <div class="space-y-2">
              <div
                v-for="(group, index) in testResult.groups"
                :key="index"
                class="bg-base-200 p-3 rounded-lg"
              >
                <div class="font-medium">组 {{ index + 1 }}: {{ group.pattern || '匿名组' }}</div>
                <div class="font-mono">{{ group.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常用正则表达式 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">常用正则表达式</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="preset in commonRegex"
              :key="preset.name"
              @click="handleApplyPreset(preset)"
              class="p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
            >
              <div class="font-medium">{{ preset.name }}</div>
              <div class="text-sm font-mono opacity-70">{{ preset.pattern }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-2">
        <button
          @click="handleCopyRegex"
          class="btn btn-primary"
          :disabled="!regexPattern"
        >
          复制正则
        </button>
        <button
          @click="handleClearAll"
          class="btn btn-ghost"
        >
          清空
        </button>
      </div>

      <!-- 工具说明 -->
      <div class="collapse collapse-arrow bg-base-100 shadow-xl">
        <input type="checkbox" />
        <div class="collapse-title text-lg font-medium">
          📖 使用说明
        </div>
        <div class="collapse-content">
          <div class="space-y-4">
            <p>正则表达式测试工具可以帮助您测试和调试正则表达式。</p>
            <div class="space-y-2">
              <h3 class="font-medium">使用步骤：</h3>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>在正则表达式输入框中输入正则表达式模式</li>
                <li>在测试文本框中输入要测试的文本</li>
                <li>选择正则选项：全局、忽略大小写、多行、Unicode</li>
                <li>点击"测试正则"按钮查看匹配结果</li>
                <li>查看匹配项、高亮显示和分组捕获</li>
                <li>可以使用常用正则表达式快速应用预设模式</li>
              </ol>
            </div>
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 class="font-bold">正则选项说明：</h3>
                <div class="text-sm">
                  <div>g - 全局匹配，查找所有匹配项</div>
                  <div>i - 忽略大小写</div>
                  <div>m - 多行模式，^和$匹配每行的开始和结束</div>
                  <div>u - Unicode模式，正确处理Unicode字符</div>
                </div>
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
import { useRegexTesterStore } from '@/store/modules/tools/tester/RegexTester.js';
import { useToast } from '@/composables/useToast.js';
import toolService from '@/services/toolService.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'RegexTesterPage',
  meta: {
    tool: {
      id: 'regex-tester',
      name: '正则表达式测试',
      description: '强大的正则表达式测试工具，支持实时测试、高亮显示、分组捕获和常用正则表达式预设',
      category: 'tester',
      icon: 'regex',
      tags: ['正则', '测试', '调试', '匹配'],
      keywords: ['正则表达式', 'regex', '模式匹配', '文本处理', '字符串匹配']
    }
  }
});

// 使用Pinia store
const regexTesterStore = useRegexTesterStore();
const { success: showSuccess, error: showError, warning: showWarning } = useToast();

// 从store中解构状态
const {
  regexPattern,
  regexFlags,
  testText,
  testResult,
  flags,
  commonRegex,
  highlightedText
} = storeToRefs(regexTesterStore);

// 带提示功能的包装方法
const handleTestRegex = () => {
  if (!regexPattern.value) {
    showWarning('请输入正则表达式');
    return;
  }
  
  if (!testText.value) {
    showWarning('请输入测试文本');
    return;
  }
  
  regexTesterStore.testRegex();
  
  if (regexTesterStore.testResult?.isValid) {
    showSuccess('正则表达式测试成功');
    toolService.recordToolUsage('regex-tester', 'test');
  } else {
    showError(regexTesterStore.testResult?.error || '正则表达式测试失败');
  }
};

const handleApplyPreset = (preset) => {
  regexTesterStore.applyPreset(preset);
  showSuccess(`已应用预设模式: ${preset.name}`);
  toolService.recordToolUsage('regex-tester', 'apply-preset');
};

const handleCopyRegex = () => {
  const success = regexTesterStore.copyRegex();
  if (success) {
    showSuccess('正则表达式已复制到剪贴板');
    toolService.recordToolUsage('regex-tester', 'copy');
  } else {
    showError('复制失败');
  }
};

const handleClearAll = () => {
  regexTesterStore.clearAll();
  showSuccess('已清空所有内容');
};
</script>