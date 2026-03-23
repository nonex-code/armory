<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">🎨 颜色选择器</h1>
      <p class="text-lg text-base-content/70">选择颜色并转换为不同格式</p>
    </div>

    <div class="space-y-6">
      <!-- 颜色选择器 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">颜色选择器</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <input
                v-model="selectedColor"
                type="color"
                class="w-20 h-20 rounded-lg cursor-pointer"
              />
              <input
                v-model="selectedColor"
                type="text"
                placeholder="#000000"
                class="flex-1 input input-bordered input-lg font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色格式显示 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">颜色格式</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">HEX</span>
              </label>
              <div class="flex space-x-2">
                <input
                  :value="colorFormats.hex"
                  readonly
                  class="flex-1 input input-bordered font-mono"
                />
                <button
                  @click="copyToClipboard(colorFormats.hex)"
                  class="btn btn-primary"
                >
                  复制
                </button>
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">RGB</span>
              </label>
              <div class="flex space-x-2">
                <input
                  :value="colorFormats.rgb"
                  readonly
                  class="flex-1 input input-bordered font-mono"
                />
                <button
                  @click="copyToClipboard(colorFormats.rgb)"
                  class="btn btn-primary"
                >
                  复制
                </button>
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">RGBA</span>
              </label>
              <div class="flex space-x-2">
                <input
                  :value="colorFormats.rgba"
                  readonly
                  class="flex-1 input input-bordered font-mono"
                />
                <button
                  @click="copyToClipboard(colorFormats.rgba)"
                  class="btn btn-primary"
                >
                  复制
                </button>
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">HSL</span>
              </label>
              <div class="flex space-x-2">
                <input
                  :value="colorFormats.hsl"
                  readonly
                  class="flex-1 input input-bordered font-mono"
                />
                <button
                  @click="copyToClipboard(colorFormats.hsl)"
                  class="btn btn-primary"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色预览 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">颜色预览</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-medium mb-2">实色预览</h3>
              <div
                class="h-32 rounded-lg border-2 border-base-300 shadow-inner"
                :style="{ backgroundColor: selectedColor }"
              ></div>
            </div>
            <div>
              <h3 class="font-medium mb-2">透明度预览</h3>
              <div class="relative h-32 rounded-lg border-2 border-base-300 overflow-hidden">
                <div class="absolute inset-0 bg-checkerboard"></div>
                <div
                  class="absolute inset-0"
                  :style="{ backgroundColor: colorFormats.rgba }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 透明度调节 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">透明度调节</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="font-medium">透明度: {{ Math.round(opacity * 100) }}%</span>
              <span class="text-sm text-base-content/70">{{ opacity.toFixed(2) }}</span>
            </div>
            <input
              v-model="opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="range range-primary"
            />
            <div class="flex justify-between text-xs text-base-content/60">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设颜色 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">预设颜色</h2>
          <div class="grid grid-cols-8 md:grid-cols-16 gap-2">
            <button
              v-for="color in presetColors"
              :key="color"
              @click="selectPresetColor(color)"
              class="w-10 h-10 rounded-lg border-2 border-base-300 hover:border-primary transition-colors shadow-sm"
              :style="{ backgroundColor: color }"
              :title="color"
            ></button>
          </div>
        </div>
      </div>

      <!-- 最近使用的颜色 -->
      <div v-if="hasRecentColors" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">最近使用的颜色</h2>
          <div class="grid grid-cols-8 md:grid-cols-16 gap-2">
            <button
              v-for="color in recentColors"
              :key="color"
              @click="selectPresetColor(color)"
              class="w-10 h-10 rounded-lg border-2 border-base-300 hover:border-primary transition-colors shadow-sm"
              :style="{ backgroundColor: color }"
              :title="color"
            ></button>
          </div>
        </div>
      </div>

      <!-- 颜色调色板 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">颜色调色板</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">色相</label>
              <div class="h-8 rounded-lg" :style="getHueGradient()"></div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">饱和度</label>
              <div class="h-8 rounded-lg" :style="getSaturationGradient()"></div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">亮度</label>
              <div class="h-8 rounded-lg" :style="getLightnessGradient()"></div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">RGB</label>
              <div class="h-8 rounded-lg" :style="getRgbGradient()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具说明 -->
      <div class="collapse collapse-arrow bg-base-100 shadow-xl">
        <input type="checkbox" />
        <div class="collapse-title text-lg font-medium">
          📖 使用说明
        </div>
        <div class="collapse-content">
          <div class="space-y-4">
            <p>颜色选择器工具可以帮助您选择颜色并转换为不同格式。</p>
            <div class="space-y-2">
              <h3 class="font-medium">使用步骤：</h3>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>使用颜色选择器选择颜色，或直接输入HEX颜色值</li>
                <li>调整透明度滑块设置颜色透明度</li>
                <li>查看不同格式的颜色值：HEX、RGB、RGBA、HSL</li>
                <li>点击"复制"按钮复制所需格式的颜色值</li>
                <li>使用预设颜色快速选择常用颜色</li>
                <li>查看颜色调色板了解颜色的不同维度</li>
              </ol>
            </div>
            <div class="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>提示：最近使用的颜色会自动保存，方便您重复使用。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useColorPickerStore } from '@/store/modules/tools/generator/ColorPicker';
import { useToast } from '@/composables/useToast';
import toolService from '@/services/toolService';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'ColorPickerPage',
  meta: {
    tool: {
      id: 'color-picker',
      name: '颜色选择器',
      description: '颜色选择工具，支持RGB、HEX、HSL等多种颜色格式的选取和转换',
      icon: '🎨',
      category: 'generator',
      tags: ['颜色', '选择', 'rgb', 'hex', 'hsl', '开发工具'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// 使用store
const store = useColorPickerStore();
const {
  selectedColor,
  opacity,
  recentColors,
  presetColors,
  hasRecentColors,
  colorFormats
} = storeToRefs(store);

const {
  selectPresetColor,
  addToRecentColors,
  getHueGradient,
  getSaturationGradient,
  getLightnessGradient,
  getRgbGradient
} = store;

// 使用提示
const { showToast } = useToast();

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板', 'success');
    toolService.recordToolUsage('color-picker');
  } catch (error) {
    showToast('复制失败', 'error');
  }
};
</script>

<style scoped>
.bg-checkerboard {
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}
</style>