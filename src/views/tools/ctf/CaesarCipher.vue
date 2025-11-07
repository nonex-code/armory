<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔐</span>
        <h1 class="text-3xl md:text-4xl font-bold">凯撒密码</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        使用凯撒密码对文本进行加密和解密，是一种简单的替换密码
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入文本</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost"
                @click="loadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost"
                @click="clearInput"
              >
                清空
              </button>
            </div>
          </div>
          
          <!-- 文本输入区域 -->
          <div class="form-control">
            <textarea
              v-model="inputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="在此输入需要加密或解密的文本..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">处理结果</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-primary" 
                @click="copyResult"
                :disabled="!hasOutput"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-secondary" 
                @click="swapInputOutput"
                :disabled="!hasOutput"
              >
                交换输入输出
              </button>
            </div>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm bg-base-200" 
              placeholder="处理结果将显示在这里..."
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 控制面板 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-4">加密参数</h2>
        
        <!-- 第一行控制 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- 偏移量 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">偏移量</span>
            </label>
            <div class="input-group">
              <input
                v-model.number="shift"
                type="number"
                class="input input-bordered flex-1"
                min="0"
                max="25"
              >
              <button 
                class="btn btn-square"
                @click="randomShift"
                title="随机偏移量"
              >
                <i class="bi bi-shuffle"></i>
              </button>
            </div>
          </div>
          
          <!-- 字符集 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">字符集</span>
            </label>
            <select v-model="charset" class="select select-bordered">
              <option value="uppercase">大写字母 (A-Z)</option>
              <option value="lowercase">小写字母 (a-z)</option>
              <option value="both">大小写字母 (A-Z, a-z)</option>
              <option value="alphabet">字母和数字 (A-Z, a-z, 0-9)</option>
              <option value="ascii">ASCII字符 (32-126)</option>
            </select>
          </div>
          
          <!-- 处理方式 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">处理方式</span>
            </label>
            <select v-model="processMode" class="select select-bordered">
              <option value="encrypt">加密</option>
              <option value="decrypt">解密</option>
              <option value="both">同时显示加密和解密</option>
            </select>
          </div>
        </div>
        
        <!-- 第二行控制 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- 保留大小写 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">保留大小写</span>
              <input
                v-model="preserveCase"
                class="checkbox checkbox-primary"
                type="checkbox"
                :disabled="charset !== 'both'"
              >
            </label>
          </div>
          
          <!-- 保留非字母字符 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">保留非字母字符</span>
              <input
                v-model="preserveNonAlpha"
                class="checkbox checkbox-primary"
                type="checkbox"
              >
            </label>
          </div>
          
          <!-- 显示字符频率分析 -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">显示字符频率分析</span>
              <input
                v-model="showFrequency"
                class="checkbox checkbox-primary"
                type="checkbox"
              >
            </label>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-center gap-2">
          <button 
            class="btn btn-primary" 
            @click="processText"
            :disabled="!canProcess"
          >
            处理文本
          </button>
          <button 
            class="btn btn-secondary" 
            @click="bruteForce"
            :disabled="!canProcess"
          >
            暴力破解
          </button>
          <button 
            class="btn btn-accent" 
            @click="frequencyAnalysis"
            :disabled="!canProcess"
          >
            频率分析
          </button>
        </div>
      </div>
    </div>
    
    <!-- 暴力破解结果 -->
    <div v-if="hasBruteForceResults" class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">暴力破解结果 (所有可能的偏移量)</h2>
        <div class="max-h-64 overflow-y-auto border border-base-300 rounded-lg p-2">
          <div 
            v-for="(result, index) in bruteForceResults" 
            :key="index"
            class="p-3 border-b border-base-200 cursor-pointer hover:bg-base-200"
            @click="selectBruteForceResult(result)"
          >
            <div class="font-bold">偏移量 {{ result.shift }}:</div>
            <div class="font-mono text-sm">{{ result.text.substring(0, 100) }}{{ result.text.length > 100 ? '...' : '' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 频率分析结果 -->
    <div v-if="hasFrequencyData" class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">字符频率分析</h2>
        <div class="h-10 border border-base-300 rounded-lg overflow-hidden flex">
          <div 
            v-for="(item, index) in frequencyData" 
            :key="index"
            class="flex items-center justify-center bg-primary text-primary-content font-bold text-xs transition-all hover:bg-primary-focus hover:z-10 hover:scale-y-110"
            :style="{ width: `${item.percentage}%` }"
            :title="`${item.char}: ${item.count}次 (${item.percentage}%)`"
          >
            {{ item.char }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            使用说明
          </div>
          <div class="collapse-content"> 
            <div class="space-y-4">
              <div>
                <h3 class="font-semibold text-lg mb-2">使用说明</h3>
                <ol class="list-decimal list-inside space-y-1 text-sm">
                  <li>在输入框中输入需要加密或解密的文本</li>
                  <li>设置偏移量（0-25之间的数字）</li>
                  <li>选择字符集和处理方式</li>
                  <li>点击"处理文本"按钮进行加密或解密</li>
                  <li>使用"暴力破解"尝试所有可能的偏移量</li>
                  <li>使用"频率分析"查看字符出现频率</li>
                </ol>
              </div>
              
              <div>
                <h3 class="font-semibold text-lg mb-2">凯撒密码说明</h3>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li><strong>凯撒密码</strong>是一种最简单的替换密码，通过将字母表中的每个字母移动固定位数来加密</li>
                  <li><strong>偏移量</strong>是字母移动的位置数，例如偏移量为3时，A变成D，B变成E</li>
                  <li><strong>字符集</strong>决定了哪些字符会被处理，可以选择只处理大写字母、小写字母或所有ASCII字符</li>
                  <li><strong>保留大小写</strong>选项在处理大小写字母时保持原始大小写</li>
                  <li><strong>保留非字母字符</strong>选项不对非字母字符进行转换</li>
                  <li><strong>暴力破解</strong>尝试所有可能的偏移量（1-25），帮助解密未知偏移量的文本</li>
                  <li><strong>频率分析</strong>统计字符出现频率，有助于破解密码</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-semibold text-lg mb-2">历史背景</h3>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li>凯撒密码以古罗马军事统帅尤利乌斯·凯撒命名</li>
                  <li>凯撒在其私人信件中使用这种密码，偏移量通常为3</li>
                  <li>虽然现在看来非常简单，但在当时是有效的加密方法</li>
                  <li>凯撒密码是更复杂替换密码的基础，如维吉尼亚密码</li>
                </ul>
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
import { useCaesarCipherStore } from '@/store/modules/tools/ctf/CaesarCipher';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'CaesarCipherPage',
  meta: {
    tool: {
      id: 'caesar-cipher',
      name: '凯撒密码工具',
      description: '凯撒密码加密和解密工具，支持自定义偏移量的字母替换加密',
      icon: '🔤',
      category: 'ctf',
      tags: ['凯撒密码', '加密', '解密', '偏移', '替换'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用store
const caesarCipherStore = useCaesarCipherStore();

// 从store中解构状态和方法
const {
  inputText,
  outputText,
  shift,
  charset,
  processMode,
  preserveCase,
  preserveNonAlpha,
  showFrequency,
  bruteForceResults,
  frequencyData,
  hasInput,
  hasOutput,
  canProcess,
  hasBruteForceResults,
  hasFrequencyData
} = storeToRefs(caesarCipherStore);

const {
  processText,
  randomShift,
  bruteForce,
  selectBruteForceResult,
  frequencyAnalysis,
  loadExample,
  clearInput,
  copyResult,
  swapInputOutput
} = caesarCipherStore;
</script>