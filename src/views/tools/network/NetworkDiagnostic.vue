<template>
  <div class="network-diagnostic">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">网络诊断工具</h2>
        <p class="text-base-content/70">网络连接测试和诊断工具</p>
        
        <!-- 网络信息显示 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">在线状态</div>
              <div class="stat-value text-2xl" :class="isOnline ? 'text-success' : 'text-error'">
                {{ isOnline ? '在线' : '离线' }}
              </div>
            </div>
          </div>
          
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">连接类型</div>
              <div class="stat-value text-2xl">{{ connectionType || '未知' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Ping测试 -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">连通性测试 (Ping)</span>
          </label>
          <div class="flex gap-2">
            <input 
              v-model="pingTarget" 
              type="text" 
              placeholder="输入域名或IP地址" 
              class="input input-bordered flex-1"
            />
            <button 
              class="btn btn-primary" 
              @click="pingTest" 
              :disabled="!pingTarget || isPinging"
            >
              <BaseIcon name="wifi" custom-class="h-5 w-5 mr-2" />
              {{ isPinging ? '测试中...' : '测试' }}
            </button>
          </div>
          <label class="label">
            <span class="label-text-alt">通过 HTTP HEAD 请求探测目标是否可达（非 ICMP Ping）</span>
          </label>
        </div>
        
        <!-- Ping结果 -->
        <div v-if="pingResults.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Ping结果</h3>
          <div class="space-y-2">
            <div 
              v-for="(result, index) in pingResults" 
              :key="index"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="result.success ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'"
            >
              <div class="flex items-center">
                <BaseIcon 
                  :name="result.success ? 'check-circle' : 'x-circle'" 
                  :custom-class="result.success ? 'text-success h-5 w-5 mr-2' : 'text-error h-5 w-5 mr-2'" 
                />
                <span>{{ result.target }}</span>
              </div>
              <div class="text-right">
                <div class="font-medium">{{ result.success ? `${result.duration}ms` : (result.reason || '失败') }}</div>
                <div class="text-xs text-base-content/70">{{ result.timestamp }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 端口扫描 -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">端口扫描（HTTP 服务探测）</span>
          </label>
          <div class="flex gap-2">
            <input 
              v-model="scanHost" 
              type="text" 
              placeholder="主机名或IP地址" 
              class="input input-bordered flex-1"
            />
            <input 
              v-model="scanPorts" 
              type="text" 
              placeholder="端口范围 (如: 80-100)" 
              class="input input-bordered w-32"
            />
            <button 
              class="btn btn-primary" 
              @click="portScan" 
              :disabled="!scanHost || !scanPorts || isScanning"
            >
              <BaseIcon name="radar" custom-class="h-5 w-5 mr-2" />
              {{ isScanning ? '扫描中...' : '扫描' }}
            </button>
          </div>
          <label class="label">
            <span class="label-text-alt">受浏览器限制仅探测 HTTP/HTTPS 服务，非 HTTP 端口（如 SSH 22）即使开放也会显示"关闭"；单次最多 100 个端口</span>
          </label>
        </div>
        
        <!-- 端口扫描结果 -->
        <div v-if="scanResults.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold mb-3">端口扫描结果</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div 
              v-for="result in scanResults" 
              :key="result.port"
              class="p-2 rounded text-center"
              :class="result.open ? 'bg-success/20 text-success border border-success/30' : 'bg-base-200 text-base-content/50'"
            >
              <div class="font-mono text-sm">{{ result.port }}</div>
              <div class="text-xs">{{ result.open ? '开放' : '关闭' }}</div>
            </div>
          </div>
        </div>
        
        <!-- DNS查询 -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">DNS查询</span>
          </label>
          <div class="flex gap-2">
            <input 
              v-model="dnsQuery" 
              type="text" 
              placeholder="输入域名" 
              class="input input-bordered flex-1"
            />
            <button 
              class="btn btn-primary" 
              @click="dnsLookup" 
              :disabled="!dnsQuery || isDnsQuerying"
            >
              <BaseIcon name="globe" custom-class="h-5 w-5 mr-2" />
              {{ isDnsQuerying ? '查询中...' : '查询' }}
            </button>
          </div>
        </div>
        
        <!-- DNS查询结果 -->
        <div v-if="dnsResults" class="mb-6">
          <h3 class="text-lg font-semibold mb-3">DNS查询结果</h3>
          <div class="bg-base-200 p-4 rounded">
            <div class="space-y-2">
              <div><strong>域名:</strong> {{ dnsResults.domain }}</div>
              <div>
                <strong>IP地址:</strong>
                <span v-if="dnsResults.status === 'ok'">{{ dnsResults.allIps ? dnsResults.allIps.join(', ') : dnsResults.ip }}</span>
                <span v-else-if="dnsResults.status === 'not-found'" class="text-error">域名不存在 (NXDOMAIN)</span>
                <span v-else class="text-warning">该域名无 A 记录</span>
              </div>
              <div><strong>查询时间:</strong> {{ dnsResults.duration }}ms</div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button class="btn btn-outline" @click="clearAll">
            <BaseIcon name="trash" custom-class="h-5 w-5 mr-2" />
            清空结果
          </button>
          <button class="btn btn-outline" @click="runAllTests">
            <BaseIcon name="play" custom-class="h-5 w-5 mr-2" />
            运行所有测试
          </button>
        </div>
        
        <!-- 安全提示 -->
        <div class="alert alert-warning mt-4 text-sm">
          <BaseIcon name="warning" custom-class="h-5 w-5 shrink-0" />
          <span>请求直接由你的浏览器发出，可访问内网地址（如 127.0.0.1、192.168.x.x）。请勿在不可信环境对不明目标发起探测。</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'NetworkDiagnosticPage',
  meta: {
    tool: {
      id: 'network-diagnostic',
      name: '网络诊断工具',
      description: '网络连接诊断工具，支持Ping测试、端口扫描、DNS查询等网络诊断功能',
      icon: '🌐',
      category: 'network',
      tags: ['网络', '诊断', 'ping', '端口', 'dns'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 响应式数据
const isOnline = ref(navigator.onLine);
const connectionType = ref('');
const pingTarget = ref('');
const isPinging = ref(false);
const pingResults = ref([]);
const scanHost = ref('');
const scanPorts = ref('80-100');
const isScanning = ref(false);
const scanResults = ref([]);
const dnsQuery = ref('');
const isDnsQuerying = ref(false);
const dnsResults = ref(null);
const error = ref('');

// 监听网络状态变化
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (navigator.connection) {
    connectionType.value = navigator.connection.effectiveType;
  }
};

// 跟踪在途请求的 AbortController，组件卸载时统一中断
const activeControllers = new Set();

const trackController = (controller) => {
  activeControllers.add(controller);
  const cleanup = () => activeControllers.delete(controller);
  controller.signal.addEventListener('abort', cleanup, { once: true });
  return controller;
};

// Ping测试函数（HTTP 连通性探测：能建立 HTTP 连接即视为可达）
const pingTest = async () => {
  if (!pingTarget.value.trim()) return;
  
  isPinging.value = true;
  error.value = '';
  
  const target = pingTarget.value.startsWith('http') ? pingTarget.value : `https://${pingTarget.value}`;
  const controller = trackController(new AbortController());
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const startTime = Date.now();
  
  try {
    await fetch(target, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors'
    });
    
    const duration = Date.now() - startTime;
    
    pingResults.value.unshift({
      target: pingTarget.value,
      success: true,
      duration: duration,
      timestamp: new Date().toLocaleTimeString()
    });
    
  } catch (err) {
    pingResults.value.unshift({
      target: pingTarget.value,
      success: false,
      duration: 0,
      reason: err.name === 'AbortError' ? '超时（5秒无响应）' : '连接失败',
      timestamp: new Date().toLocaleTimeString()
    });
  } finally {
    clearTimeout(timeoutId);
    isPinging.value = false;
    // 限制结果列表长度
    pingResults.value = pingResults.value.slice(0, 20);
  }
};

// 端口扫描函数（HTTP 服务探测）
const portScan = async () => {
  if (!scanHost.value.trim() || !scanPorts.value.trim()) return;
  
  // 校验端口范围格式
  const portStr = scanPorts.value.trim();
  if (!/^\d+(-\d+)?$/.test(portStr)) {
    error.value = '端口范围格式不正确，请输入如 80 或 80-100';
    return;
  }
  
  const [startStr, endStr] = portStr.split('-');
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : start;
  
  if (start < 1 || end > 65535 || start > end) {
    error.value = '端口范围无效（范围 1-65535，起始端口不能大于结束端口）';
    return;
  }
  
  if (end - start + 1 > 100) {
    error.value = '单次扫描端口数不能超过 100 个，请缩小范围';
    return;
  }
  
  isScanning.value = true;
  error.value = '';
  scanResults.value = [];
  
  try {
    // 浏览器只能探测 HTTP/HTTPS 服务
    for (let port = start; port <= end; port++) {
      const controller = trackController(new AbortController());
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const startTime = Date.now();
      let open = false;
      
      try {
        const protocols = ['http', 'https'];
        for (const protocol of protocols) {
          try {
            await fetch(`${protocol}://${scanHost.value}:${port}`, {
              method: 'HEAD',
              signal: controller.signal,
              mode: 'no-cors'
            });
            open = true;
            break;
          } catch {
            // 继续尝试下一个协议
          }
        }
      } catch {
        // 单个端口探测失败不影响整体
      } finally {
        clearTimeout(timeoutId);
      }
      
      scanResults.value.push({
        port: port,
        open: open,
        duration: Date.now() - startTime
      });
    }
    
  } catch (err) {
    error.value = `端口扫描失败: ${err.message}`;
  } finally {
    isScanning.value = false;
  }
};

// DNS查询函数（DNS over HTTPS）
const dnsLookup = async () => {
  if (!dnsQuery.value.trim()) return;
  
  isDnsQuerying.value = true;
  error.value = '';
  
  const controller = trackController(new AbortController());
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const startTime = Date.now();
  
  try {
    // 使用 URLSearchParams 构造查询参数，避免特殊字符破坏 URL
    const params = new URLSearchParams({ name: dnsQuery.value.trim(), type: 'A' });
    const response = await fetch(`https://dns.google/resolve?${params}`, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`DNS 服务返回错误状态（HTTP ${response.status}${response.status === 429 ? '，请求过于频繁' : ''}）`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    if (data.Status === 3) {
      // NXDOMAIN：域名不存在
      dnsResults.value = {
        domain: dnsQuery.value,
        ip: null,
        duration: duration,
        status: 'not-found'
      };
    } else if (data.Answer && data.Answer.length > 0) {
      const ips = data.Answer
        .filter(item => item.type === 1)
        .map(item => item.data);
      dnsResults.value = {
        domain: dnsQuery.value,
        ip: ips[0] || null,
        allIps: ips,
        duration: duration,
        status: 'ok'
      };
    } else {
      dnsResults.value = {
        domain: dnsQuery.value,
        ip: null,
        duration: duration,
        status: 'no-record'
      };
    }
    
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'DNS 查询超时（8秒），请稍后重试';
    } else {
      error.value = `DNS查询失败: ${err.message}`;
    }
    dnsResults.value = null;
  } finally {
    clearTimeout(timeoutId);
    isDnsQuerying.value = false;
  }
};

// 运行所有测试
const runAllTests = async () => {
  if (pingTarget.value) await pingTest();
  if (scanHost.value && scanPorts.value) await portScan();
  if (dnsQuery.value) await dnsLookup();
};

// 清空所有结果
const clearAll = () => {
  pingResults.value = [];
  scanResults.value = [];
  dnsResults.value = null;
  error.value = '';
};

// 组件挂载时设置网络监听
onMounted(() => {
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  if (navigator.connection) {
    navigator.connection.addEventListener('change', updateOnlineStatus);
  }
});

// 组件卸载时移除监听并中断所有在途请求
onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  
  if (navigator.connection) {
    navigator.connection.removeEventListener('change', updateOnlineStatus);
  }
  
  activeControllers.forEach(controller => controller.abort());
  activeControllers.clear();
});
</script>

<style scoped>
.network-diagnostic {
  max-width: 1000px;
  margin: 0 auto;
}

.stats {
  background: transparent;
}

.stat {
  padding: 1rem;
}

.stat-value {
  font-size: 1.5rem;
}
</style>