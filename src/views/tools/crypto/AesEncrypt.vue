<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔐</span>
        <h1 class="text-3xl md:text-4xl font-bold">AES加密/解密</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        使用AES算法对文本进行加密和解密处理，支持多种密钥长度和模式
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
            <label class="label">
              <span class="label-text">请输入需要加密或解密的文本</span>
            </label>
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
                class="btn btn-sm btn-ghost" 
                @click="copyResult"
                :disabled="!hasOutput"
              >
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
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
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里..."
              readonly
            ></textarea>
          </div>
          
          <!-- 处理信息 -->
          <div v-if="processingInfo" class="mt-2 text-sm text-base-content/70">
            {{ processingInfo }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加密参数设置 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">加密参数设置</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 密钥输入 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">密钥</span>
            </label>
            <div class="input-group">
              <input 
                v-model="secretKey"
                :type="showKey ? 'text' : 'password'"
                class="input input-bordered flex-1" 
                placeholder="输入加密密钥"
                :class="{ 'input-error': keyError }"
              >
              <button 
                class="btn btn-square btn-ghost"
                @click="toggleKeyVisibility"
              >
                <span v-if="showKey">👁️‍🗨️</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <label v-if="keyError" class="label">
              <span class="label-text-alt text-error">{{ keyError }}</span>
            </label>
          </div>
          
          <!-- 密钥长度 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">密钥长度</span>
            </label>
            <select v-model="keySize" class="select select-bordered">
              <option value="128">128位</option>
              <option value="192">192位</option>
              <option value="256">256位</option>
            </select>
          </div>
          
          <!-- 加密模式 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">加密模式</span>
            </label>
            <select v-model="mode" class="select select-bordered">
              <option value="CBC">CBC</option>
              <option value="ECB">ECB</option>
              <option value="CFB">CFB</option>
              <option value="OFB">OFB</option>
              <option value="CTR">CTR</option>
              <option value="GCM">GCM</option>
            </select>
          </div>
          
          <!-- 填充方式 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">填充方式</span>
            </label>
            <select v-model="padding" class="select select-bordered">
              <option value="Pkcs7">Pkcs7</option>
              <option value="Iso97971">Iso97971</option>
              <option value="AnsiX923">AnsiX923</option>
              <option value="Iso10126">Iso10126</option>
              <option value="ZeroPadding">ZeroPadding</option>
              <option value="NoPadding">NoPadding</option>
            </select>
          </div>
          
          <!-- 输出格式 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">输出格式</span>
            </label>
            <select v-model="outputFormat" class="select select-bordered">
              <option value="base64">Base64</option>
              <option value="hex">十六进制</option>
            </select>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-center mt-6">
          <button 
            class="btn btn-primary"
            @click="encryptText"
            :disabled="!canProcess"
          >
            加密
          </button>
          <button 
            class="btn btn-secondary"
            @click="decryptText"
            :disabled="!canProcess"
          >
            解密
          </button>
          <button 
            class="btn btn-outline" 
            @click="generateKey"
          >
            生成随机密钥
          </button>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              AES加密说明
            </div>
            <div class="collapse-content"> 
              <p class="mb-2"><strong>AES (Advanced Encryption Standard)</strong> 是一种对称加密算法</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>密钥长度：</strong>支持128、192和256位密钥长度</li>
                <li><strong>加密模式：</strong>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>CBC (Cipher Block Chaining): 需要初始化向量(IV)</li>
                    <li>ECB (Electronic Codebook): 不需要IV，但安全性较低</li>
                    <li>CFB/OFB/CTR: 流模式，适合流数据加密</li>
                    <li>GCM (Galois/Counter Mode): 提供认证加密</li>
                  </ul>
                </li>
                <li><strong>填充方式：</strong>用于填充数据块以满足加密算法要求</li>
                <li><strong>安全性提示：</strong>请妥善保管密钥，不要在不安全的环境中使用</li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              使用步骤
            </div>
            <div class="collapse-content"> 
              <ol class="list-decimal list-inside text-sm space-y-1">
                <li>在输入框中输入需要加密或解密的文本</li>
                <li>输入加密密钥，密钥长度应与所选密钥长度匹配</li>
                <li>选择加密模式、填充方式和输出格式</li>
                <li>点击"加密"按钮对文本进行加密</li>
                <li>点击"解密"按钮对文本进行解密</li>
                <li>可以复制结果或交换输入输出内容</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useAesEncryptStore } from '@/store/modules/tools/crypto/AesEncrypt.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'AesEncryptPage',
  meta: {
    tool: {
      id: 'aes-encrypt',
      name: 'AES加密工具',
      description: 'AES对称加密工具，支持AES加密和解密操作，可设置密钥和加密模式',
      icon: '🔒',
      category: 'crypto',
      tags: ['aes', '加密', '解密', '对称', '安全'],
      enabled: true,
      isPopular: true,
      order: 4
    }
  }
});

// 使用独立的store
const aesEncryptStore = useAesEncryptStore();
const { 
  inputText, 
  outputText, 
  secretKey, 
  showKey, 
  keyError, 
  keySize, 
  mode, 
  padding, 
  outputFormat, 
  processingInfo,
  hasInput,
  hasOutput,
  hasKey,
  canProcess
} = storeToRefs(aesEncryptStore);

const { 
  toggleKeyVisibility, 
  generateKey, 
  validateKey, 
  encryptText, 
  decryptText, 
  loadExample, 
  clearInput, 
  copyResult, 
  swapInputOutput 
} = aesEncryptStore;
</script>