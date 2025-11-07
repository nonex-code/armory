<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔗</span>
        <h1 class="text-3xl md:text-4xl font-bold">URL编码/解码</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        对URL进行编码和解码操作，支持URL安全字符处理
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto">
      <!-- 输入输出区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 编码区域 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">URL编码</h2>
            
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">原始文本</span>
              </label>
              <textarea 
                v-model="encodeInput"
                class="textarea textarea-bordered h-32" 
                placeholder="输入需要编码的URL或文本..."
              ></textarea>
            </div>
            
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">编码选项</span>
              </label>
              <div class="flex flex-wrap gap-4">
                <label class="cursor-pointer label justify-start gap-2">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm" 
                    v-model="encodeOptions.encodeSpace"
                  />
                  <span class="label-text">编码空格为%20</span>
                </label>
                <label class="cursor-pointer label justify-start gap-2">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm" 
                    v-model="encodeOptions.encodeAll"
                  />
                  <span class="label-text">编码所有字符</span>
                </label>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">编码结果</span>
              </label>
              <textarea 
                v-model="encodeOutput"
                class="textarea textarea-bordered h-32 font-mono text-sm" 
                readonly
                placeholder="编码结果将显示在这里..."
              ></textarea>
            </div>
            
            <div class="flex gap-2 mt-4">
              <button 
                class="btn btn-primary flex-1"
                @click="performEncode"
                :disabled="!encodeInput"
              >
                编码
              </button>
              <button 
                class="btn btn-outline"
                @click="copyToClipboard(encodeOutput)"
                :disabled="!encodeOutput"
              >
                复制结果
              </button>
              <button 
                class="btn btn-ghost"
                @click="clearEncode"
              >
                清空
              </button>
            </div>
          </div>
        </div>
        
        <!-- 解码区域 -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">URL解码</h2>
            
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">编码文本</span>
              </label>
              <textarea 
                v-model="decodeInput"
                class="textarea textarea-bordered h-32 font-mono text-sm" 
                placeholder="输入需要解码的URL编码文本..."
              ></textarea>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">解码结果</span>
              </label>
              <textarea 
                v-model="decodeOutput"
                class="textarea textarea-bordered h-32" 
                readonly
                placeholder="解码结果将显示在这里..."
              ></textarea>
            </div>
            
            <div class="flex gap-2 mt-4">
              <button 
                class="btn btn-secondary flex-1"
                @click="performDecode"
                :disabled="!decodeInput"
              >
                解码
              </button>
              <button 
                class="btn btn-outline"
                @click="copyToClipboard(decodeOutput)"
                :disabled="!decodeOutput"
              >
                复制结果
              </button>
              <button 
                class="btn btn-ghost"
                @click="clearDecode"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 示例区域 -->
      <div class="card bg-base-100 shadow-lg mt-6">
        <div class="card-body">
          <h2 class="card-title mb-4">编码示例</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="example in examples" 
              :key="example.name"
              class="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
              @click="loadExample(example)"
            >
              <div class="card-body p-4">
                <h3 class="card-title text-sm">{{ example.name }}</h3>
                <div class="text-xs opacity-70">
                  <div class="truncate">{{ example.original }}</div>
                  <div class="truncate font-mono">{{ example.encoded }}</div>
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
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">URL编码说明</h3>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li><strong>标准编码</strong>：只编码URL中的特殊字符（如空格、&、=等）</li>
                <li><strong>编码空格为%20</strong>：将空格字符编码为%20而不是+</li>
                <li><strong>编码所有字符</strong>：对所有字符进行百分号编码</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-lg mb-2">常见应用场景</h3>
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>处理URL中的中文字符和特殊字符</li>
                <li>构建API请求参数</li>
                <li>处理表单数据提交</li>
                <li>编码查询字符串参数</li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-semibold text-lg mb-2">编码规则</h3>
              <table class="table table-zebra table-sm w-full">
                <thead>
                  <tr>
                    <th>字符</th>
                    <th>编码</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>空格</td>
                    <td>%20 或 +</td>
                    <td>取决于编码选项</td>
                  </tr>
                  <tr>
                    <td>&</td>
                    <td>%26</td>
                    <td>URL参数分隔符</td>
                  </tr>
                  <tr>
                    <td>=</td>
                    <td>%3D</td>
                    <td>键值对分隔符</td>
                  </tr>
                  <tr>
                    <td>?</td>
                    <td>%3F</td>
                    <td>查询字符串开始</td>
                  </tr>
                  <tr>
                    <td>#</td>
                    <td>%23</td>
                    <td>锚点标识</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUrlEncoderStore } from '@/store/modules/tools/network/UrlEncoder';
import { watch } from 'vue';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'UrlEncoderPage',
  meta: {
    tool: {
      id: 'url-encoder',
      name: 'URL编码工具',
      description: 'URL编码和解码工具，支持URL参数和路径的编码转换',
      icon: '🔤',
      category: 'encoding',
      tags: ['url', '编码', '解码', '转换'],
      enabled: true,
      isPopular: true,
      order: 3
    }
  }
})

// 使用store
const urlEncoderStore = useUrlEncoderStore();

// 从store中解构状态和方法
const {
  encodeInput,
  encodeOutput,
  decodeInput,
  decodeOutput,
  encodeOptions,
  examples,
  canEncode,
  canDecode,
  hasEncodeOutput,
  hasDecodeOutput
} = storeToRefs(urlEncoderStore);

const {
  performEncode,
  performDecode,
  copyToClipboard,
  clearEncode,
  clearDecode,
  loadExample
} = urlEncoderStore;

// 监听编码输入变化，自动编码
watch(encodeInput, (newVal) => {
  if (newVal) {
    performEncode();
  } else {
    encodeOutput.value = '';
  }
});

// 监听解码输入变化，自动解码
watch(decodeInput, (newVal) => {
  if (newVal) {
    performDecode();
  } else {
    decodeOutput.value = '';
  }
});
</script>