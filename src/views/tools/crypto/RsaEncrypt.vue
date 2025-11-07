<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔑</span>
        <h1 class="text-3xl md:text-4xl font-bold">RSA加密</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        使用RSA算法对文本进行加密处理，支持生成密钥对和自定义公钥
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
              <span class="label-text">请输入需要加密的文本</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-32 w-full font-mono text-sm" 
              placeholder="请输入需要加密的文本..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">加密结果</h2>
            <button 
              class="btn btn-sm btn-ghost" 
              @click="copyResult"
              :disabled="!hasOutput"
            >
              复制结果
            </button>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-32 w-full font-mono text-sm" 
              placeholder="加密结果将显示在这里..."
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- RSA密钥配置 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">RSA密钥配置</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 公钥输入 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">RSA公钥</span>
            </label>
            <textarea 
              v-model="publicKey"
              class="textarea textarea-bordered h-32 w-full font-mono text-xs" 
              placeholder="请输入RSA公钥..."
            ></textarea>
            <label class="label">
              <span class="label-text-alt">用于加密文本的公钥</span>
            </label>
          </div>
          
          <!-- 私钥显示 -->
          <div class="form-control" v-if="privateKey">
            <label class="label">
              <span class="label-text">生成的私钥（请妥善保存）</span>
            </label>
            <textarea 
              v-model="privateKey"
              class="textarea textarea-bordered h-32 w-full font-mono text-xs" 
              readonly
            ></textarea>
            <label class="label">
              <span class="label-text-alt text-warning">请妥善保存私钥，用于解密</span>
            </label>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="card-actions justify-center mt-6">
          <button 
            class="btn btn-primary" 
            @click="encryptRSA"
            :disabled="!canEncrypt"
          >
            加密
          </button>
          <button 
            class="btn btn-outline" 
            @click="generateKeyPair"
          >
            生成密钥对
          </button>
          <button 
            v-if="hasPrivateKey"
            class="btn btn-outline btn-secondary" 
            @click="copyPrivateKey"
          >
            复制私钥
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
              RSA加密介绍
            </div>
            <div class="collapse-content"> 
              <p class="mb-2">RSA是一种非对称加密算法，使用公钥加密，私钥解密。此工具仅提供加密功能。</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>非对称加密：</strong>使用不同的密钥进行加密和解密</li>
                <li><strong>公钥：</strong>用于加密数据，可以公开分享</li>
                <li><strong>私钥：</strong>用于解密数据，必须保密</li>
                <li><strong>安全性：</strong>基于大数分解的数学难题</li>
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
                <li>在输入框中输入需要加密的文本</li>
                <li>输入RSA公钥或点击"生成密钥对"按钮生成新的密钥对</li>
                <li>点击"加密"按钮进行加密操作</li>
                <li>加密结果将显示在下方的输出框中</li>
                <li>如果生成了密钥对，请妥善保存私钥用于解密</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning mt-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="ml-2">注意：此工具仅用于演示目的，不建议在生产环境中使用。实际应用中请使用更安全的加密库。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useRsaEncryptStore } from '@/store/modules/tools/crypto/RsaEncrypt.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'RsaEncryptPage',
  meta: {
    tool: {
      id: 'rsa-encrypt',
      name: 'RSA加密工具',
      description: 'RSA非对称加密工具，支持RSA密钥生成、加密和解密操作',
      icon: '🔒',
      category: 'crypto',
      tags: ['rsa', '加密', '解密', '非对称', '安全'],
      enabled: true,
      isPopular: true,
      order: 3
    }
  }
});

// 使用独立的store
const rsaEncryptStore = useRsaEncryptStore();
const { 
  inputText, 
  outputText, 
  publicKey, 
  privateKey,
  hasInput,
  hasOutput,
  hasPublicKey,
  hasPrivateKey,
  canEncrypt
} = storeToRefs(rsaEncryptStore);

const { 
  encryptRSA, 
  generateKeyPair, 
  loadExample, 
  clearInput, 
  copyResult, 
  copyPrivateKey 
} = rsaEncryptStore;
</script>