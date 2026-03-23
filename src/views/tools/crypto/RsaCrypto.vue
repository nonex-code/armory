<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔑</span>
        <h1 class="text-3xl md:text-4xl font-bold">RSA加密/解密</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        使用RSA非对称加密算法进行加密和解密，支持多种密钥长度、填充方式和哈希算法
      </p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">请输入需要加密或解密的文本</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-40 w-full font-mono text-sm" 
              placeholder="请输入需要加密或解密的文本..."
            ></textarea>
          </div>
        </div>
      </div>
      
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
                交换
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-40 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里..."
              readonly
            ></textarea>
          </div>
          
          <div v-if="processingInfo" class="mt-2 text-sm" :class="outputText.includes('错误') ? 'text-error' : 'text-success'">
            {{ processingInfo }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">加密参数设置</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">密钥长度</span>
            </label>
            <select v-model="keySize" class="select select-bordered">
              <option value="2048">2048位</option>
              <option value="3072">3072位</option>
              <option value="4096">4096位</option>
            </select>
            <label class="label">
              <span class="label-text-alt">更长的密钥更安全但速度较慢</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">填充方式</span>
            </label>
            <select v-model="padding" class="select select-bordered">
              <option value="OAEP">OAEP (推荐)</option>
              <option value="PKCS1_v1_5">PKCS#1 v1.5</option>
            </select>
            <label class="label">
              <span class="label-text-alt">OAEP更安全，PKCS#1 v1.5兼容性更好</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">哈希算法</span>
            </label>
            <select v-model="hashAlgorithm" class="select select-bordered">
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
            <label class="label">
              <span class="label-text-alt">OAEP填充使用的哈希算法</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">输出格式</span>
            </label>
            <select v-model="outputFormat" class="select select-bordered">
              <option value="base64">Base64</option>
              <option value="hex">十六进制</option>
            </select>
            <label class="label">
              <span class="label-text-alt">加密结果的输出格式</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">RSA密钥配置</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">RSA公钥 (用于加密)</span>
            </label>
            <textarea 
              v-model="publicKey"
              class="textarea textarea-bordered h-40 w-full font-mono text-xs" 
              placeholder="请输入RSA公钥或点击生成密钥对..."
            ></textarea>
            <div class="label justify-start gap-2">
              <button 
                class="btn btn-xs btn-ghost"
                @click="copyPublicKey"
                :disabled="!hasPublicKey"
              >
                复制公钥
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">RSA私钥 (用于解密)</span>
            </label>
            <textarea 
              v-model="privateKey"
              class="textarea textarea-bordered h-40 w-full font-mono text-xs" 
              placeholder="请输入RSA私钥或点击生成密钥对..."
            ></textarea>
            <div class="label justify-start gap-2">
              <button 
                class="btn btn-xs btn-ghost"
                @click="copyPrivateKey"
                :disabled="!hasPrivateKey"
              >
                复制私钥
              </button>
            </div>
          </div>
        </div>
        
        <div class="card-actions justify-center mt-6 flex-wrap">
          <button 
            class="btn btn-primary" 
            @click="encryptRSA"
            :disabled="!canEncrypt"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
            加密
          </button>
          <button 
            class="btn btn-secondary" 
            @click="decryptRSA"
            :disabled="!canDecrypt"
          >
            <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
            解密
          </button>
          <button 
            class="btn btn-outline" 
            @click="generateKeyPair"
            :disabled="isProcessing"
          >
            生成密钥对
          </button>
          <button 
            class="btn btn-outline btn-error" 
            @click="clearKeys"
          >
            清除密钥
          </button>
        </div>
      </div>
    </div>
    
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
              <p class="mb-2">RSA是一种非对称加密算法，使用公钥加密，私钥解密。</p>
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
              参数说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-2">
                <li><strong>密钥长度：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>2048位：标准安全强度，速度较快</li>
                    <li>3072位：高安全强度</li>
                    <li>4096位：最高安全强度，速度较慢</li>
                  </ul>
                </li>
                <li><strong>填充方式：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>OAEP：推荐使用，安全性更高</li>
                    <li>PKCS#1 v1.5：兼容性好，但存在安全风险</li>
                  </ul>
                </li>
                <li><strong>哈希算法：</strong>OAEP填充使用的哈希函数</li>
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
                <li>点击"生成密钥对"生成新的RSA密钥对，或手动输入已有的密钥</li>
                <li>在输入框中输入需要处理的文本</li>
                <li>选择加密参数（密钥长度、填充方式、哈希算法）</li>
                <li>点击"加密"使用公钥加密文本</li>
                <li>点击"解密"使用私钥解密文本</li>
                <li>请妥善保存私钥，解密时需要使用与加密时相同的参数</li>
              </ol>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              注意事项
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>解密时必须使用与加密时相同的填充方式和哈希算法</li>
                <li>RSA加密有数据长度限制，取决于密钥长度和填充方式</li>
                <li>2048位密钥使用OAEP+SHA-256最多可加密190字节</li>
                <li>对于大数据加密，建议使用混合加密方式</li>
                <li>请妥善保管私钥，泄露将导致数据安全问题</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning mt-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="ml-2">安全提示：私钥请妥善保存，不要在不安全的环境中传输或存储。本工具使用Web Crypto API实现真正的RSA加密。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useRsaCryptoStore } from '@/store/modules/tools/crypto/RsaCrypto.js';

defineOptions({
  name: 'RsaCryptoPage',
  meta: {
    tool: {
      id: 'rsa-crypto',
      name: 'RSA加密/解密工具',
      description: 'RSA非对称加密工具，支持RSA密钥生成、加密和解密操作，可设置密钥长度、填充方式和哈希算法',
      icon: '🔑',
      category: 'crypto',
      tags: ['rsa', '加密', '解密', '非对称', '安全', '公钥', '私钥'],
      enabled: true,
      isPopular: true,
      order: 3
    }
  }
});

const rsaCryptoStore = useRsaCryptoStore();
const { 
  inputText, 
  outputText, 
  publicKey, 
  privateKey,
  keySize,
  padding,
  hashAlgorithm,
  outputFormat,
  processingInfo,
  isProcessing,
  hasInput,
  hasOutput,
  hasPublicKey,
  hasPrivateKey,
  canEncrypt,
  canDecrypt
} = storeToRefs(rsaCryptoStore);

const { 
  generateKeyPair,
  encryptRSA, 
  decryptRSA,
  loadExample, 
  clearInput,
  clearKeys,
  copyResult, 
  copyPublicKey,
  copyPrivateKey,
  swapInputOutput
} = rsaCryptoStore;
</script>
