<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🌐</span>
        <h1 class="text-3xl md:text-4xl font-bold">IP地址查询</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        查询IP地址的地理位置、ISP信息、时区等详细信息
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-4xl mx-auto">
      <!-- 查询输入区域 -->
      <div class="card bg-base-100 shadow-lg mb-6">
        <div class="card-body">
          <h2 class="card-title mb-4">IP地址查询</h2>
          
          <div class="flex gap-4">
            <div class="form-control flex-1">
              <label class="label">
                <span class="label-text">IP地址或域名</span>
              </label>
              <input 
                v-model="queryInput"
                type="text" 
                class="input input-bordered" 
                placeholder="输入IP地址或域名，如：8.8.8.8 或 google.com"
                @keyup.enter="lookupIp"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">&nbsp;</span>
              </label>
              <button 
                class="btn btn-primary"
                @click="lookupIp"
                :disabled="!canLookup"
              >
                查询
              </button>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4">
            <button 
              class="btn btn-sm btn-ghost"
              @click="ipLookupStore.loadExample('8.8.8.8')"
            >
              示例：8.8.8.8
            </button>
            <button 
              class="btn btn-sm btn-ghost"
              @click="ipLookupStore.loadExample('google.com')"
            >
              示例：google.com
            </button>
            <button 
              class="btn btn-sm btn-ghost"
              @click="getMyIp"
            >
              查询本机IP
            </button>
          </div>
        </div>
      </div>
      
      <!-- 查询结果 -->
      <div v-if="result" class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title mb-6">查询结果</h2>
          
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">IP地址</div>
                <div class="stat-value text-primary">{{ result.ip }}</div>
                <div class="stat-desc">{{ result.type || 'IPv4' }}</div>
              </div>
            </div>
            
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">地理位置</div>
                <div class="stat-value text-secondary">{{ result.country || '未知' }}</div>
                <div class="stat-desc">{{ result.city || '未知城市' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 详细信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 网络信息 -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">网络信息</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">ISP：</span>
                    <span>{{ result.isp || '未知' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">组织：</span>
                    <span>{{ result.org || '未知' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">ASN：</span>
                    <span>{{ result.asn || '未知' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 地理位置信息 -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">地理位置</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">国家：</span>
                    <span>{{ result.country || '未知' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">城市：</span>
                    <span>{{ result.city || '未知' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">时区：</span>
                    <span>{{ result.timezone || '未知' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 坐标信息 -->
            <div v-if="result.lat && result.lon" class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">坐标信息</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">纬度：</span>
                    <span>{{ result.lat }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">经度：</span>
                    <span>{{ result.lon }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 其他信息 -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">其他信息</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">邮政编码：</span>
                    <span>{{ result.postal || '未知' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">地区：</span>
                    <span>{{ result.region || '未知' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 原始数据 -->
          <div class="mt-6">
            <details class="collapse collapse-arrow border border-base-300">
              <summary class="collapse-title text-xl font-medium">原始数据</summary>
              <div class="collapse-content">
                <pre class="bg-base-200 p-4 rounded-lg overflow-x-auto text-sm">{{ JSON.stringify(result, null, 2) }}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div v-if="error" class="alert alert-error mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center mt-6">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-2">正在查询中...</p>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">功能说明</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>查询IP地址的地理位置、ISP信息、时区等详细信息</li>
              <li>支持IPv4和IPv6地址查询</li>
              <li>支持域名解析，自动获取域名对应的IP地址</li>
              <li>可以查询本机公网IP地址</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">使用示例</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li><code>8.8.8.8</code> - Google DNS服务器</li>
              <li><code>2001:4860:4860::8888</code> - Google IPv6 DNS</li>
              <li><code>google.com</code> - 域名解析</li>
              <li><code>baidu.com</code> - 百度服务器IP</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">注意事项</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>查询结果基于公开的IP地理位置数据库</li>
              <li>某些IP地址可能无法获取完整的地理位置信息</li>
              <li>本机IP查询显示的是公网IP地址</li>
              <li>查询结果仅供参考</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useIpLookupStore } from '@/store/modules/tools/network/IpLookup';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'IpLookupPage',
  meta: {
    tool: {
      id: 'ip-lookup',
      name: 'IP地址查询工具',
      description: 'IP地址查询工具，支持查询IP地址的地理位置、ISP信息和归属地',
      icon: '🌐',
      category: 'network',
      tags: ['ip', '查询', '地理位置', '网络', '归属地'],
      enabled: true,
      isPopular: true,
      order: 2
    }
  }
})

// 使用store
const ipLookupStore = useIpLookupStore();

// 从store中解构状态和方法
const {
  queryInput,
  result,
  error,
  loading,
  canLookup
} = storeToRefs(ipLookupStore);

const {
  lookupIp,
  getMyIp
} = ipLookupStore;
</script>