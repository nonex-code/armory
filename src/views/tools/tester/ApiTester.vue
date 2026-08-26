<template>
  <div class="api-tester">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">API测试工具</h2>
        <p class="text-base-content/70">发送HTTP请求并测试API接口</p>
        
        <!-- 请求配置区域 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 请求方法选择 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">请求方法</span>
            </label>
            <select v-model="requestMethod" class="select select-bordered">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          
          <!-- URL输入 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">请求URL</span>
            </label>
            <input 
              v-model="requestUrl" 
              type="text" 
              placeholder="https://api.example.com/endpoint" 
              class="input input-bordered"
            />
          </div>
        </div>
        
        <!-- 请求头 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">请求头</span>
            <button class="btn btn-xs btn-outline" @click="addHeader">添加</button>
          </label>
          <div class="space-y-2">
            <div 
              v-for="(header, index) in requestHeaders" 
              :key="index"
              class="flex gap-2"
            >
              <input 
                v-model="header.key" 
                placeholder="Header名称" 
                class="input input-bordered flex-1"
              />
              <input 
                v-model="header.value" 
                placeholder="Header值" 
                class="input input-bordered flex-1"
              />
              <button 
                class="btn btn-square btn-outline btn-error btn-sm" 
                @click="removeHeader(index)"
              >
                <BaseIcon name="trash" custom-class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- 请求体（仅POST/PUT/PATCH） -->
        <div v-if="['POST', 'PUT', 'PATCH'].includes(requestMethod)" class="form-control">
          <label class="label">
            <span class="label-text">请求体</span>
          </label>
          <textarea 
            v-model="requestBody" 
            class="textarea textarea-bordered h-32" 
            placeholder='{"key": "value"}'
          ></textarea>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button class="btn btn-primary" @click="sendRequest" :disabled="!requestUrl || isSending">
            <span v-if="isSending" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isSending ? '发送中...' : '发送请求' }}
          </button>
          <button class="btn btn-outline" @click="clearRequest" :disabled="isSending">
            <BaseIcon name="trash" custom-class="h-5 w-5 mr-2" />
            清空
          </button>
        </div>
        
        <!-- 安全提示 -->
        <div class="alert alert-warning mt-4 text-sm">
          <BaseIcon name="warning" custom-class="h-5 w-5 shrink-0" />
          <span>请求直接由你的浏览器发出（受 CORS 限制），可访问内网地址。请勿对未知目标发起请求。</span>
        </div>
        
        <!-- 响应结果 -->
        <div v-if="response" class="mt-6">
          <h3 class="text-lg font-semibold mb-3">响应结果</h3>
          
          <!-- 响应状态 -->
          <div class="flex items-center gap-4 mb-4">
            <div class="badge" :class="response.status >= 200 && response.status < 300 ? 'badge-success' : 'badge-error'">
              {{ response.status }} {{ response.statusText }}
            </div>
            <div class="text-sm text-base-content/70">
              耗时: {{ response.duration }}ms
            </div>
          </div>
          
          <!-- 响应头 -->
          <div class="collapse collapse-arrow border border-base-300">
            <input type="checkbox" />
            <div class="collapse-title font-medium">响应头</div>
            <div class="collapse-content">
              <pre class="text-sm bg-base-200 p-3 rounded">{{ formatHeaders(response.headers) }}</pre>
            </div>
          </div>
          
          <!-- 响应体 -->
          <div class="mt-4">
            <label class="label">
              <span class="label-text">响应体</span>
            </label>
            <pre class="text-sm bg-base-200 p-3 rounded max-h-64 overflow-auto">{{ response.data }}</pre>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="alert alert-error mt-4">
          <BaseIcon name="exclamation-triangle" custom-class="h-5 w-5" />
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'ApiTesterPage',
  meta: {
    tool: {
      id: 'api-tester',
      name: 'API测试工具',
      description: 'HTTP API测试工具，支持GET、POST、PUT、DELETE等请求方法，可设置请求头和参数',
      icon: '💻',
      category: 'developer',
      tags: ['api', 'http', '测试', '请求', '接口', '开发工具'],
      enabled: true,
      isPopular: true,
      order: 3
    }
  }
});

// 响应式数据
const requestMethod = ref('GET');
const requestUrl = ref('');
const requestHeaders = ref([
  { key: 'Content-Type', value: 'application/json' }
]);
const requestBody = ref('');
const response = ref(null);
const error = ref('');
const isSending = ref(false);

// 添加请求头
const addHeader = () => {
  requestHeaders.value.push({ key: '', value: '' });
};

// 删除请求头
const removeHeader = (index) => {
  requestHeaders.value.splice(index, 1);
};

// 发送请求
const sendRequest = async () => {
  if (!requestUrl.value.trim()) {
    error.value = '请输入请求URL';
    return;
  }

  // 校验并规范化 URL
  let url = requestUrl.value.trim();
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      error.value = '仅支持 http/https 协议的 URL';
      return;
    }
  } catch {
    error.value = 'URL 格式不正确';
    return;
  }

  error.value = '';
  response.value = null;
  isSending.value = true;

  // 请求超时（30秒）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const startTime = Date.now();
    
    // 构建请求头（使用 Headers 对象，避免 __proto__ 等特殊键污染）
    const headers = new Headers();
    requestHeaders.value.forEach(header => {
      if (header.key && header.value) {
        try {
          headers.append(header.key, header.value);
        } catch (e) {
          console.warn(`无效的请求头: ${header.key}`, e);
        }
      }
    });

    // 构建请求选项
    const options = {
      method: requestMethod.value,
      headers: headers,
      signal: controller.signal
    };

    // 添加请求体（如果适用）
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod.value) && requestBody.value) {
      options.body = requestBody.value;
    }

    // 发送请求
    const fetchResponse = await fetch(url, options);
    const endTime = Date.now();
    
    // 获取响应数据（限制响应体大小，防止超大响应卡死页面）
    const contentType = fetchResponse.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      try {
        data = await fetchResponse.json();
        data = JSON.stringify(data, null, 2);
      } catch {
        // JSON 解析失败：请求本身成功，响应内容非法
        const rawText = await fetchResponse.text();
        data = rawText.length > 0
          ? `[响应不是合法的 JSON，已按文本显示]\n${rawText}`
          : '[响应不是合法的 JSON，且内容为空]';
      }
    } else if (contentType.startsWith('image/') || contentType.startsWith('application/octet-stream') || contentType.includes('zip')) {
      // 二进制响应：不读取全文
      const blob = await fetchResponse.blob();
      data = `[二进制内容，大小 ${(blob.size / 1024).toFixed(1)} KB]`;
    } else {
      data = await fetchResponse.text();
      if (data.length > 2 * 1024 * 1024) {
        data = data.slice(0, 2 * 1024 * 1024) + '\n...[响应过大，已截断]';
      }
    }

    // 构建响应对象
    response.value = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: Object.fromEntries(fetchResponse.headers.entries()),
      data: data,
      duration: endTime - startTime
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = '请求超时（30秒无响应）';
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error.value = '请求失败：无法连接到目标地址（可能是网络问题、CORS 限制或地址无法访问）';
    } else {
      error.value = `请求失败: ${err.message}`;
    }
  } finally {
    clearTimeout(timeoutId);
    isSending.value = false;
  }
};

// 清空请求
const clearRequest = () => {
  requestUrl.value = '';
  requestHeaders.value = [{ key: 'Content-Type', value: 'application/json' }];
  requestBody.value = '';
  response.value = null;
  error.value = '';
};

// 格式化响应头
const formatHeaders = (headers) => {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
};
</script>

<style scoped>
.api-tester {
  max-width: 1000px;
  margin: 0 auto;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>