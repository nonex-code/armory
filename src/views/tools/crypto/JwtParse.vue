<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔑</span>
        <h1 class="text-3xl md:text-4xl font-bold">JWT工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        JWT令牌解析、生成与验证工具，支持多种签名算法和高级选项
      </p>
    </div>

    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div role="tablist" class="tabs tabs-boxed bg-base-200 mb-6">
          <a 
            role="tab" 
            class="tab" 
            :class="{ 'tab-active': activeTab === 'decode' }"
            @click="activeTab = 'decode'"
          >
            解析JWT
          </a>
          <a 
            role="tab" 
            class="tab" 
            :class="{ 'tab-active': activeTab === 'generate' }"
            @click="activeTab = 'generate'"
          >
            生成JWT
          </a>
        </div>

        <div v-if="activeTab === 'decode'">
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">请输入JWT令牌</span>
            </label>
            <textarea 
              v-model="jwtToken"
              class="textarea textarea-bordered h-24 w-full font-mono text-sm" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            ></textarea>
            <div class="flex gap-2 mt-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="loadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="clearToken"
              >
                清空
              </button>
            </div>
          </div>

          <div class="card-actions justify-center mb-6">
            <button 
              class="btn btn-primary" 
              @click="parseJWT"
              :disabled="!canParse"
            >
              解析JWT
            </button>
          </div>

          <div v-if="parseError" class="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ parseError }}</span>
          </div>

          <div v-if="parsedHeader || parsedPayload" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card bg-base-200" v-if="parsedHeader">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">Header</h3>
                  <button 
                    class="btn btn-sm btn-ghost" 
                    @click="copyHeader"
                  >
                    复制
                  </button>
                </div>
                <pre class="text-xs overflow-auto bg-base-300 p-3 rounded">{{ JSON.stringify(parsedHeader, null, 2) }}</pre>
              </div>
            </div>
            
            <div class="card bg-base-200" v-if="parsedPayload">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">Payload</h3>
                  <button 
                    class="btn btn-sm btn-ghost" 
                    @click="copyPayload"
                  >
                    复制
                  </button>
                </div>
                <pre class="text-xs overflow-auto bg-base-300 p-3 rounded">{{ JSON.stringify(parsedPayload, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="card bg-base-200 mt-6" v-if="signature">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title">Signature</h3>
                <button 
                  class="btn btn-sm btn-ghost" 
                  @click="copySignature"
                >
                  复制
                </button>
              </div>
              <div class="font-mono text-xs break-all bg-base-300 p-3 rounded">{{ signature }}</div>
            </div>
          </div>

          <div class="card bg-base-200 mt-6" v-if="timeInfo">
            <div class="card-body">
              <h3 class="card-title mb-4">时间信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="stat bg-base-300 rounded-lg" v-if="timeInfo.iat">
                  <div class="stat-title">签发时间 (iat)</div>
                  <div class="stat-value text-lg">{{ timeInfo.iat }}</div>
                  <div class="stat-desc">{{ timeInfo.iatFormatted }}</div>
                </div>
                <div class="stat bg-base-300 rounded-lg" v-if="timeInfo.exp">
                  <div class="stat-title">过期时间 (exp)</div>
                  <div class="stat-value text-lg">{{ timeInfo.exp }}</div>
                  <div class="stat-desc">{{ timeInfo.expFormatted }}</div>
                </div>
                <div class="stat bg-base-300 rounded-lg" v-if="timeInfo.nbf">
                  <div class="stat-title">生效时间 (nbf)</div>
                  <div class="stat-value text-lg">{{ timeInfo.nbf }}</div>
                  <div class="stat-desc">{{ timeInfo.nbfFormatted }}</div>
                </div>
              </div>
              <div class="alert mt-4" :class="timeInfo.isExpired ? 'alert-warning' : timeInfo.isNotValidYet ? 'alert-info' : 'alert-success'">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span class="ml-2">
                    <template v-if="timeInfo.isExpired">令牌已过期</template>
                    <template v-else-if="timeInfo.isNotValidYet">令牌尚未生效</template>
                    <template v-else>令牌有效</template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-base-200 mt-6" v-if="parsedHeader">
            <div class="card-body">
              <h3 class="card-title mb-4">签名验证</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">验证密钥</span>
                  </label>
                  <div class="input-group">
                    <input 
                      v-model="verifySecretKey"
                      :type="showVerifyKey ? 'text' : 'password'"
                      class="input input-bordered flex-1" 
                      placeholder="输入密钥验证签名"
                    >
                    <button 
                      class="btn btn-square btn-ghost"
                      @click="toggleVerifyKeyVisibility"
                    >
                      <span v-if="showVerifyKey">👁️‍🗨️</span>
                      <span v-else>👁️</span>
                    </button>
                  </div>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">&nbsp;</span>
                  </label>
                  <button 
                    class="btn btn-secondary" 
                    @click="verifyJWT"
                    :disabled="!canVerify"
                  >
                    验证签名
                  </button>
                </div>
              </div>
              
              <div v-if="verifyResult" class="mt-4">
                <div class="alert" :class="{
                  'alert-success': verifyResult.status === 'valid',
                  'alert-error': verifyResult.status === 'invalid',
                  'alert-warning': verifyResult.status === 'expired',
                  'alert-info': verifyResult.status === 'not_valid_yet'
                }">
                  <div class="flex items-center">
                    <svg v-if="verifyResult.isValid" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="ml-2">
                      <div>{{ verifyResult.message }}</div>
                      <div class="text-xs opacity-70">算法: {{ verifyResult.algorithm }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'generate'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card bg-base-200">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">Header配置</h3>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">算法 (alg)</span>
                    </label>
                    <select v-model="generateHeader.alg" class="select select-bordered">
                      <option value="HS256">HS256 (HMAC SHA-256)</option>
                      <option value="HS384">HS384 (HMAC SHA-384)</option>
                      <option value="HS512">HS512 (HMAC SHA-512)</option>
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">类型 (typ)</span>
                    </label>
                    <select v-model="generateHeader.typ" class="select select-bordered">
                      <option value="JWT">JWT</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">密钥配置</h3>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">签名密钥</span>
                  </label>
                  <div class="input-group">
                    <input 
                      v-model="secretKey"
                      :type="showKey ? 'text' : 'password'"
                      class="input input-bordered flex-1" 
                      placeholder="输入签名密钥"
                    >
                    <button 
                      class="btn btn-square btn-ghost"
                      @click="toggleKeyVisibility"
                    >
                      <span v-if="showKey">👁️‍🗨️</span>
                      <span v-else>👁️</span>
                    </button>
                  </div>
                  <div class="label">
                    <span class="label-text-alt">
                      <button class="link link-primary" @click="generateRandomKey">生成随机密钥</button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card bg-base-200 mt-6">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title">Payload配置</h3>
                <button 
                  class="btn btn-sm btn-ghost" 
                  @click="loadGenerateExample"
                >
                  加载示例
                </button>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Payload (JSON格式)</span>
                </label>
                <textarea 
                  v-model="generatePayload"
                  class="textarea textarea-bordered h-40 w-full font-mono text-sm" 
                  placeholder='{"sub": "1234567890", "name": "John Doe"}'
                ></textarea>
              </div>
            </div>
          </div>

          <div class="collapse collapse-arrow bg-base-200 mt-6">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              高级选项
            </div>
            <div class="collapse-content">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">过期时间 (exp)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.expiresIn"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="例如: 1h, 1d, 3600"
                  >
                  <label class="label">
                    <span class="label-text-alt">相对当前时间的偏移量</span>
                  </label>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">生效时间 (nbf)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.notBefore"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="例如: 5m, 300"
                  >
                  <label class="label">
                    <span class="label-text-alt">相对当前时间的偏移量</span>
                  </label>
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">签发者 (iss)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.issuer"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="例如: myapp"
                  >
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">主题 (sub)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.subject"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="例如: user-auth"
                  >
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">受众 (aud)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.audience"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="例如: myapp-users"
                  >
                </div>
                
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">JWT ID (jti)</span>
                  </label>
                  <input 
                    v-model="advancedOptions.jwtId"
                    type="text" 
                    class="input input-bordered" 
                    placeholder="唯一标识符"
                  >
                </div>
              </div>
              
              <div class="form-control mt-4">
                <label class="label">
                  <span class="label-text">自定义Header字段 (JSON格式)</span>
                </label>
                <textarea 
                  v-model="advancedOptions.customHeaderFields"
                  class="textarea textarea-bordered h-20 w-full font-mono text-sm" 
                  placeholder='{"kid": "key-id-123"}'
                ></textarea>
              </div>
            </div>
          </div>

          <div class="card-actions justify-center mt-6">
            <button 
              class="btn btn-primary"
              @click="generateJWT"
              :disabled="!canGenerate"
            >
              生成JWT
            </button>
            <button 
              class="btn btn-ghost"
              @click="clearGenerate"
            >
              清空
            </button>
          </div>

          <div v-if="generateError" class="alert alert-error mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ generateError }}</span>
          </div>

          <div class="card bg-base-200 mt-6" v-if="generatedToken">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title">生成的JWT</h3>
                <div class="flex gap-2">
                  <button 
                    class="btn btn-sm btn-ghost" 
                    @click="copyGeneratedToken"
                  >
                    复制
                  </button>
                  <button 
                    class="btn btn-sm btn-primary" 
                    @click="useGeneratedToken"
                  >
                    使用此令牌解析
                  </button>
                </div>
              </div>
              <div class="font-mono text-xs break-all bg-base-300 p-3 rounded">{{ generatedToken }}</div>
            </div>
          </div>
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
              JWT介绍
            </div>
            <div class="collapse-content"> 
              <p class="mb-2">JWT (JSON Web Token) 是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>Header：</strong>包含令牌类型和签名算法</li>
                <li><strong>Payload：</strong>包含声明（用户信息和元数据）</li>
                <li><strong>Signature：</strong>用于验证消息的完整性</li>
                <li><strong>无状态：</strong>不需要在服务器端存储会话信息</li>
              </ul>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              支持的算法
            </div>
            <div class="collapse-content"> 
              <p class="mb-2">目前支持以下HMAC签名算法：</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>HS256：</strong>HMAC SHA-256，最常用的算法</li>
                <li><strong>HS384：</strong>HMAC SHA-384，更高安全性</li>
                <li><strong>HS512：</strong>HMAC SHA-512，最高安全性</li>
              </ul>
              <p class="mt-2 text-sm text-base-content/70">注意：RS256等非对称算法暂不支持</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              高级选项说明
            </div>
            <div class="collapse-content"> 
              <ul class="list-disc list-inside text-sm space-y-1">
                <li><strong>exp (过期时间)：</strong>令牌过期的时间戳或偏移量</li>
                <li><strong>nbf (生效时间)：</strong>令牌开始生效的时间</li>
                <li><strong>iss (签发者)：</strong>令牌签发者的标识</li>
                <li><strong>sub (主题)：</strong>令牌的主题</li>
                <li><strong>aud (受众)：</strong>令牌的目标受众</li>
                <li><strong>jti (JWT ID)：</strong>令牌的唯一标识符</li>
              </ul>
              <p class="mt-2 text-sm text-base-content/70">时间偏移量格式：数字+单位(s/m/h/d)，如 1h、30m、1d</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title text-lg font-medium">
              使用步骤
            </div>
            <div class="collapse-content"> 
              <ol class="list-decimal list-inside text-sm space-y-1">
                <li>选择"解析JWT"或"生成JWT"标签页</li>
                <li>解析：粘贴JWT令牌，点击解析查看详情</li>
                <li>生成：配置Header、Payload和密钥，点击生成</li>
                <li>验证：解析后输入密钥验证签名有效性</li>
                <li>使用复制按钮可以复制各部分内容</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning mt-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="ml-2">注意：此工具仅在本地处理JWT，不会将令牌发送到任何服务器。但请注意不要在生产环境中使用敏感令牌。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useJwtParseStore } from '@/store/modules/tools/crypto/JwtParse.js';

defineOptions({
  name: 'JwtParsePage',
  meta: {
    tool: {
      id: 'jwt-parse',
      name: 'JWT工具',
      description: 'JWT令牌解析、生成与验证工具，支持多种签名算法和高级选项',
      icon: '🔑',
      category: 'crypto',
      tags: ['jwt', 'token', '解析', '生成', '验证', '安全'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

const jwtParseStore = useJwtParseStore();
const { 
  activeTab,
  jwtToken, 
  parsedHeader, 
  parsedPayload, 
  signature, 
  timeInfo,
  parseError,
  generateHeader,
  generatePayload,
  secretKey,
  showKey,
  generatedToken,
  generateError,
  advancedOptions,
  verifySecretKey,
  showVerifyKey,
  verifyResult,
  hasToken,
  hasHeader,
  hasPayload,
  hasSignature,
  hasTimeInfo,
  canParse,
  canGenerate,
  canVerify
} = storeToRefs(jwtParseStore);

const { 
  parseJWT,
  generateJWT,
  verifyJWT,
  loadExample,
  loadGenerateExample,
  clearToken,
  clearGenerate,
  copyHeader, 
  copyPayload, 
  copySignature,
  copyGeneratedToken,
  useGeneratedToken,
  toggleKeyVisibility,
  toggleVerifyKeyVisibility,
  generateRandomKey
} = jwtParseStore;
</script>
