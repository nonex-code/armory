<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔑</span>
        <h1 class="text-3xl md:text-4xl font-bold">JWT解析</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        解析JWT令牌，查看头部、载荷和签名信息
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title mb-4">JWT令牌</h2>
        
        <!-- JWT输入区域 -->
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
        
        <!-- 解析按钮 -->
        <div class="card-actions justify-center mb-6">
          <button 
            class="btn btn-primary" 
            @click="parseJWT"
            :disabled="!canParse"
          >
            解析JWT
          </button>
        </div>
        
        <!-- 解析结果区域 -->
        <div v-if="parsedHeader || parsedPayload" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 头部信息 -->
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
          
          <!-- 载荷信息 -->
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
        
        <!-- 签名信息 -->
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
        
        <!-- 时间信息 -->
        <div class="card bg-base-200 mt-6" v-if="timeInfo">
          <div class="card-body">
            <h3 class="card-title mb-4">时间信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="stat">
                <div class="stat-title">签发时间 (iat)</div>
                <div class="stat-value text-lg">{{ timeInfo.iat || 'N/A' }}</div>
                <div class="stat-desc">{{ timeInfo.iatFormatted || 'N/A' }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">过期时间 (exp)</div>
                <div class="stat-value text-lg">{{ timeInfo.exp || 'N/A' }}</div>
                <div class="stat-desc">{{ timeInfo.expFormatted || 'N/A' }}</div>
              </div>
            </div>
            <div class="alert mt-4" :class="timeInfo.isExpired ? 'alert-warning' : 'alert-success'">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6" :class="timeInfo.isExpired ? 'text-warning' : 'text-success'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span class="ml-2">{{ timeInfo.isExpired ? '令牌已过期' : '令牌有效' }}</span>
              </div>
            </div>
          </div>
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
              使用步骤
            </div>
            <div class="collapse-content"> 
              <ol class="list-decimal list-inside text-sm space-y-1">
                <li>在输入框中粘贴JWT令牌</li>
                <li>点击"解析JWT"按钮</li>
                <li>查看解析后的头部、载荷和签名信息</li>
                <li>检查时间信息以确认令牌是否有效</li>
                <li>使用复制按钮可以复制各部分内容</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="alert alert-warning mt-4">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="ml-2">注意：此工具仅在本地解析JWT，不会将令牌发送到任何服务器。但请注意不要在生产环境中使用敏感令牌。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useJwtParseStore } from '@/store/modules/tools/crypto/JwtParse.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'JwtParsePage',
  meta: {
    tool: {
      id: 'jwt-parse',
      name: 'JWT解析器',
      description: 'JWT令牌解析和验证工具，支持解析JWT头部、载荷和签名信息',
      icon: '🔒',
      category: 'crypto',
      tags: ['jwt', 'token', '解析', '验证', '安全'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用独立的store
const jwtParseStore = useJwtParseStore();
const { 
  jwtToken, 
  parsedHeader, 
  parsedPayload, 
  signature, 
  timeInfo,
  hasToken,
  hasHeader,
  hasPayload,
  hasSignature,
  hasTimeInfo,
  canParse
} = storeToRefs(jwtParseStore);

const { 
  parseJWT, 
  loadExample, 
  clearToken, 
  copyHeader, 
  copyPayload, 
  copySignature 
} = jwtParseStore;
</script>