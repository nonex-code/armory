<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🔄</span>
        <h1 class="text-3xl md:text-4xl font-bold">编解码工具</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        支持多种编码格式的编码和解码，包括Base64、Base32、URL、HTML实体、Hex和Unicode编码
      </p>
    </div>

    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">选择编码类型</h2>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
          <button 
            v-for="tab in store.encodingTabs" 
            :key="tab.id"
            class="btn btn-sm md:btn-md"
            :class="activeTab === tab.id ? 'btn-primary' : 'btn-ghost'"
            @click="handleSwitchTab(tab.id)"
          >
            <span class="mr-1">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body py-3">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="form-control">
              <label class="label cursor-pointer gap-2">
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary toggle-sm"
                  :checked="autoConvert"
                  @change="handleToggleAutoConvert"
                />
                <span class="label-text">实时转换</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-base-content/70">当前模式:</span>
            <div class="badge" :class="isEncodeMode ? 'badge-primary' : 'badge-secondary'">
              {{ isEncodeMode ? '编码' : '解码' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showOptions" class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body py-3">
        <div class="flex flex-wrap items-center gap-4">
          <Base64Options 
            v-if="activeTab === 'base64'" 
            :options="base64Options"
          />
          <UrlOptions 
            v-if="activeTab === 'url'" 
            :options="urlOptions"
          />
          <HexOptions 
            v-if="activeTab === 'hex'" 
            :options="hexOptions"
          />
          <UnicodeOptions 
            v-if="activeTab === 'unicode'" 
            :options="unicodeOptions"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入</h2>
            <div class="flex items-center gap-2">
              <div class="badge badge-outline">{{ activeTabName }}</div>
              <div class="badge badge-ghost">{{ isEncodeMode ? '待编码' : '待解码' }}</div>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">请输入要{{ isEncodeMode ? '编码' : '解码' }}的内容</span>
              <span class="label-text-alt text-base-content/50">{{ inputText.length }} 字符</span>
            </label>
            <textarea 
              v-model="inputText"
              class="textarea textarea-bordered h-48 w-full font-mono text-sm" 
              :placeholder="inputPlaceholder"
            ></textarea>
          </div>
          
          <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div class="form-control">
              <label class="label cursor-pointer gap-3">
                <span class="label-text">解码</span>
                <input 
                  type="checkbox" 
                  class="toggle toggle-primary"
                  :checked="isEncodeMode"
                  @change="handleToggleMode"
                />
                <span class="label-text">编码</span>
              </label>
            </div>
            
            <button 
              class="btn btn-outline btn-sm" 
              @click="handleSwapInputOutput"
              :disabled="!hasOutput"
            >
              <BaseIcon name="arrows-up-down" custom-class="h-4 w-4 mr-1" />
              交换
            </button>
          </div>
          
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-ghost" @click="handleClearInput">清空</button>
            <button 
              class="btn btn-primary" 
              @click="handleProcessText"
              :disabled="!canProcess"
            >
              <span v-if="processing" class="loading loading-spinner loading-sm"></span>
              {{ isEncodeMode ? '编码' : '解码' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输出</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost" 
                @click="handleCopyOutput"
                :disabled="!hasOutput"
              >
                <BaseIcon name="clipboard" custom-class="h-4 w-4 mr-1" />
                复制
              </button>
              <button 
                class="btn btn-sm btn-ghost" 
                @click="handleDownloadOutput"
                :disabled="!hasOutput"
              >
                <BaseIcon name="download" custom-class="h-4 w-4 mr-1" />
                下载
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">处理结果</span>
              <span class="label-text-alt text-base-content/50">{{ outputText.length }} 字符</span>
            </label>
            <textarea 
              v-model="outputText"
              class="textarea textarea-bordered h-48 w-full font-mono text-sm" 
              placeholder="处理结果将显示在这里"
              readonly
            ></textarea>
          </div>
          
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <BaseIcon name="exclamation-circle" custom-class="h-5 w-5" />
            <span>{{ errorMessage }}</span>
          </div>
          
          <div v-else-if="hasOutput" class="alert alert-success mt-4">
            <BaseIcon name="check-circle" custom-class="h-5 w-5" />
            <span>{{ isEncodeMode ? '编码' : '解码' }}成功</span>
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
            <div class="collapse-title font-medium">
              🔤 Base64 编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">Base64是一种基于64个可打印字符来表示二进制数据的编码方法。</p>
              <div class="mt-2 text-sm">
                <strong>选项说明：</strong>
                <ul class="list-disc list-inside mt-1">
                  <li><strong>URL安全模式</strong>：将+和/替换为-和_，适用于URL场景</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title font-medium">
              🔢 Base32 编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">Base32使用32个可打印字符（A-Z和2-7）来表示二进制数据，更易于人工阅读和输入。</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title font-medium">
              🔗 URL 编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">URL编码将特殊字符转换为%XX格式。</p>
              <div class="mt-2 text-sm">
                <strong>选项说明：</strong>
                <ul class="list-disc list-inside mt-1">
                  <li><strong>空格编码为%20</strong>：默认将空格编码为+，勾选后编码为%20</li>
                  <li><strong>编码所有字符</strong>：对所有字符进行百分号编码</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title font-medium">
              🌐 HTML 实体编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">将HTML特殊字符转换为实体表示，防止XSS攻击。</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title font-medium">
              🔢 Hex 十六进制编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">将二进制数据转换为十六进制字符串。</p>
              <div class="mt-2 text-sm">
                <strong>选项说明：</strong>
                <ul class="list-disc list-inside mt-1">
                  <li><strong>大写</strong>：输出大写十六进制字符</li>
                  <li><strong>分隔符</strong>：选择字节间的分隔方式</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" /> 
            <div class="collapse-title font-medium">
              🌏 Unicode 编码/解码
            </div>
            <div class="collapse-content"> 
              <p class="text-sm">将字符转换为Unicode码点表示。</p>
              <div class="mt-2 text-sm">
                <strong>格式说明：</strong>
                <ul class="list-disc list-inside mt-1">
                  <li><strong>\uXXXX</strong>：JavaScript转义格式</li>
                  <li><strong>&amp;#XXXX;</strong>：HTML实体格式</li>
                  <li><strong>\xXX</strong>：十六进制转义格式</li>
                  <li><strong>U+XXXX</strong>：Unicode码点格式</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useEncodingConverterStore } from '@/store/modules/tools/encoding/EncodingConverter.js';
import { useToast } from '@/composables/useToast.js';
import toolService from '@/services/toolService.js';
import BaseIcon from '@/components/BaseIcon.vue';
import Base64Options from './components/Base64Options.vue';
import UrlOptions from './components/UrlOptions.vue';
import HexOptions from './components/HexOptions.vue';
import UnicodeOptions from './components/UnicodeOptions.vue';

defineOptions({
  name: 'EncodingConverterPage',
  meta: {
    tool: {
      id: 'encoding-converter',
      name: '编解码工具',
      description: '支持多种编码格式的编码和解码，包括Base64、Base32、URL、HTML实体、Hex和Unicode编码',
      icon: '🔄',
      category: 'encoding',
      tags: ['base64', 'base32', 'url', 'html', 'hex', 'unicode', '编码', '解码', '转换'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

const store = useEncodingConverterStore();
const { success: showSuccess, error: showError } = useToast();

const {
  activeTab,
  isEncodeMode,
  inputText,
  outputText,
  processing,
  errorMessage,
  autoConvert,
  activeTabName,
  inputPlaceholder,
  hasInput,
  hasOutput,
  canProcess,
  showOptions,
  urlOptions,
  hexOptions,
  unicodeOptions,
  base64Options
} = storeToRefs(store);

const handleSwitchTab = (tabId) => {
  store.switchTab(tabId);
  toolService.recordToolUsage('encoding-converter', `switch-${tabId}`);
};

const handleToggleMode = () => {
  store.toggleMode();
  toolService.recordToolUsage('encoding-converter', 'toggle-mode');
};

const handleToggleAutoConvert = () => {
  store.toggleAutoConvert();
  if (store.autoConvert) {
    showSuccess('已开启实时转换');
  }
};

const handleProcessText = async () => {
  try {
    await store.processText();
    if (store.hasOutput) {
      showSuccess(`${store.isEncodeMode ? '编码' : '解码'}成功！`);
      toolService.recordToolUsage('encoding-converter', store.isEncodeMode ? 'encode' : 'decode');
    }
  } catch (error) {
    showError(`处理失败: ${error.message}`);
  }
};

const handleClearInput = () => {
  store.clearInput();
  showSuccess('已清空所有内容');
};

const handleCopyOutput = async () => {
  const success = await store.copyOutput();
  if (success) {
    showSuccess('已复制到剪贴板');
    toolService.recordToolUsage('encoding-converter', 'copy');
  } else {
    showError('复制失败');
  }
};

const handleDownloadOutput = () => {
  store.downloadOutput();
  showSuccess('已下载结果文件');
  toolService.recordToolUsage('encoding-converter', 'download');
};

const handleSwapInputOutput = () => {
  store.swapInputOutput();
  showSuccess('已交换输入输出');
  toolService.recordToolUsage('encoding-converter', 'swap');
};
</script>
