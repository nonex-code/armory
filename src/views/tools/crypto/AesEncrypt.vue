<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔐</span>
        <h1 class="text-3xl md:text-4xl font-bold">AES加密/解密</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        使用AES算法对文本进行加密和解密处理，支持多种密钥长度、加密模式和填充方式
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
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="在此输入需要加密或解密的文本..."
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
                交换输入输出
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里..."
              readonly
            ></textarea>
          </div>
          
          <div v-if="processingInfo" class="mt-2 text-sm" :class="outputText.includes('错误') ? 'text-error' : 'text-success'">
            {{ processingInfo }}
          </div>
          
          <div v-if="lastGeneratedIv && lastOperation === 'encrypt'" class="mt-2 text-sm text-base-content/70">
            <span class="font-medium">使用的IV：</span>
            <code class="bg-base-200 px-1 rounded">{{ lastGeneratedIv }}</code>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-6">基本参数设置</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">密钥</span>
              <span class="label-text-alt">
                <button class="btn btn-xs btn-link p-0" @click="generateKey">生成随机密钥</button>
              </span>
            </label>
            <div class="join w-full">
              <input 
                v-model="secretKey"
                :type="showKey ? 'text' : 'password'"
                class="input input-bordered join-item flex-1" 
                placeholder="输入加密密钥"
                :class="{ 'input-error': keyError }"
              >
              <button 
                class="btn btn-square btn-ghost join-item"
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
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">密钥长度</span>
            </label>
            <select v-model="keySize" class="select select-bordered">
              <option value="128">128位 (16字节)</option>
              <option value="192">192位 (24字节)</option>
              <option value="256">256位 (32字节)</option>
            </select>
            <label class="label">
              <span class="label-text-alt">密钥越长安全性越高</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">加密模式</span>
            </label>
            <select v-model="mode" class="select select-bordered">
              <option value="CBC">CBC (密码块链接模式)</option>
              <option value="ECB">ECB (电子密码本模式)</option>
              <option value="CFB">CFB (密码反馈模式)</option>
              <option value="OFB">OFB (输出反馈模式)</option>
              <option value="CTR">CTR (计数器模式)</option>
              <option value="GCM">GCM (伽罗瓦/计数器模式)</option>
            </select>
            <label class="label">
              <span class="label-text-alt">推荐使用CBC或GCM模式</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">填充方式</span>
            </label>
            <select v-model="padding" class="select select-bordered">
              <option value="Pkcs7">Pkcs7 (推荐)</option>
              <option value="Iso97971">Iso97971</option>
              <option value="AnsiX923">AnsiX923</option>
              <option value="Iso10126">Iso10126</option>
              <option value="ZeroPadding">ZeroPadding</option>
              <option value="NoPadding">NoPadding</option>
            </select>
            <label class="label">
              <span class="label-text-alt">Pkcs7是最常用的填充方式</span>
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
              <span class="label-text-alt">加密结果的编码格式</span>
            </label>
          </div>
        </div>
        
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
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <div class="flex items-center justify-between cursor-pointer" @click="toggleAdvancedOptions">
          <h2 class="card-title">高级选项</h2>
          <span class="text-2xl transition-transform" :class="showAdvancedOptions ? 'rotate-180' : ''">▼</span>
        </div>
        
        <div v-show="showAdvancedOptions" class="mt-4 space-y-6">
          <div class="divider mt-0"></div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="form-control">
              <label class="label">
                <span class="label-text">密钥格式</span>
              </label>
              <select v-model="keyFormat" class="select select-bordered">
                <option value="utf8">UTF-8 字符串</option>
                <option value="hex">十六进制</option>
                <option value="base64">Base64</option>
              </select>
              <label class="label">
                <span class="label-text-alt">选择密钥的输入格式</span>
              </label>
            </div>
            
            <div class="form-control" v-if="needsIv">
              <label class="label">
                <span class="label-text">IV初始化向量</span>
                <span class="label-text-alt">
                  <button class="btn btn-xs btn-link p-0" @click="generateIv">生成IV</button>
                </span>
              </label>
              <div class="join w-full">
                <input 
                  v-model="ivValue"
                  :type="showIv ? 'text' : 'password'"
                  class="input input-bordered join-item flex-1 font-mono text-sm" 
                  placeholder="十六进制格式"
                  :disabled="autoGenerateIv"
                >
                <button 
                  class="btn btn-square btn-ghost join-item"
                  @click="toggleIvVisibility"
                >
                  <span v-if="showIv">👁️‍🗨️</span>
                  <span v-else>👁️</span>
                </button>
              </div>
              <label class="label">
                <span class="label-text-alt">{{ mode === 'GCM' ? '12字节(96位)' : '16字节(128位)' }}</span>
              </label>
            </div>
            
            <div class="form-control" v-if="needsIv">
              <label class="label cursor-pointer justify-start">
                <input type="checkbox" v-model="autoGenerateIv" class="checkbox checkbox-sm mr-2" />
                <span class="label-text">自动生成IV</span>
              </label>
              <label class="label">
                <span class="label-text-alt">加密时自动生成随机IV，解密时从密文中提取</span>
              </label>
            </div>
          </div>
          
          <div class="alert alert-info">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div class="text-sm">
                <p class="font-medium">IV说明：</p>
                <p>初始化向量(IV)用于增加加密的随机性。在CBC、CFB、OFB、CTR和GCM模式下需要IV。IV不需要保密，但每次加密应使用不同的IV。本工具会将IV附加到密文前面，解密时自动提取。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">参数说明文档</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              密钥长度说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-2">
                <li><strong>128位 (16字节)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>AES-128，安全性足够大多数应用</li>
                    <li>处理速度最快</li>
                    <li>密钥：16个ASCII字符或32个十六进制字符</li>
                  </ul>
                </li>
                <li><strong>192位 (24字节)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>AES-192，高安全级别</li>
                    <li>处理速度适中</li>
                    <li>密钥：24个ASCII字符或48个十六进制字符</li>
                  </ul>
                </li>
                <li><strong>256位 (32字节)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>AES-256，最高安全级别</li>
                    <li>处理速度较慢</li>
                    <li>密钥：32个ASCII字符或64个十六进制字符</li>
                    <li>推荐用于高敏感数据</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              加密模式说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-2">
                <li><strong>CBC (密码块链接模式)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>最常用的模式，需要IV</li>
                    <li>相同明文块产生不同密文块</li>
                    <li>适合文件加密</li>
                  </ul>
                </li>
                <li><strong>ECB (电子密码本模式)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>不需要IV，但安全性较低</li>
                    <li>相同明文块产生相同密文块</li>
                    <li>不推荐用于敏感数据</li>
                  </ul>
                </li>
                <li><strong>CFB/OFB/CTR：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>流密码模式，需要IV</li>
                    <li>适合流数据加密</li>
                    <li>CTR支持并行处理</li>
                  </ul>
                </li>
                <li><strong>GCM (伽罗瓦/计数器模式)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>认证加密，提供数据完整性验证</li>
                    <li>推荐用于网络通信</li>
                    <li>IV长度通常为12字节</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              填充方式说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-2">
                <li><strong>Pkcs7 (推荐)：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>最常用的填充方式</li>
                    <li>兼容性好，安全性高</li>
                    <li>适用于大多数场景</li>
                  </ul>
                </li>
                <li><strong>Iso97971 / AnsiX923 / Iso10126：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>标准填充方式</li>
                    <li>特定场景使用</li>
                  </ul>
                </li>
                <li><strong>ZeroPadding：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>用零字节填充</li>
                    <li>可能影响原始数据</li>
                  </ul>
                </li>
                <li><strong>NoPadding：</strong>
                  <ul class="list-disc list-inside ml-4">
                    <li>不进行填充</li>
                    <li>数据长度必须是块大小的倍数</li>
                  </ul>
                </li>
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
                <li>输入加密密钥，或点击"生成随机密钥"</li>
                <li>选择密钥长度（需与密钥实际长度匹配）</li>
                <li>选择加密模式和填充方式</li>
                <li>如需自定义IV，展开高级选项进行设置</li>
                <li>点击"加密"按钮对文本进行加密</li>
                <li>点击"解密"按钮对密文进行解密</li>
                <li>解密时需使用相同的密钥、模式和填充方式</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning mt-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="ml-2">安全提示：请妥善保管密钥，解密时必须使用与加密时相同的密钥、模式和填充方式。ECB模式安全性较低，不推荐用于敏感数据。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useAesEncryptStore } from '@/store/modules/tools/crypto/AesEncrypt.js';

defineOptions({
  name: 'AesEncryptPage',
  meta: {
    tool: {
      id: 'aes-encrypt',
      name: 'AES加密工具',
      description: 'AES对称加密工具，支持AES加密和解密操作，可自定义密钥长度、加密模式、填充方式等高级参数',
      icon: '🔐',
      category: 'crypto',
      tags: ['aes', '加密', '解密', '对称', '安全', '对称加密'],
      enabled: true,
      isPopular: true,
      order: 4
    }
  }
});

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
  lastOperation,
  lastGeneratedIv,
  showAdvancedOptions,
  keyFormat,
  ivValue,
  autoGenerateIv,
  showIv,
  hasInput,
  hasOutput,
  hasKey,
  canProcess,
  needsIv
} = storeToRefs(aesEncryptStore);

const { 
  toggleKeyVisibility, 
  toggleIvVisibility,
  toggleAdvancedOptions,
  generateKey, 
  generateIv,
  validateKey, 
  encryptText, 
  decryptText, 
  loadExample, 
  clearInput, 
  copyResult, 
  swapInputOutput 
} = aesEncryptStore;
</script>
