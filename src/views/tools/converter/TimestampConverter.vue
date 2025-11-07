<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">⏰</span>
        <h1 class="text-3xl md:text-4xl font-bold">时间戳转换</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        在时间戳和日期时间之间进行转换，支持秒和毫秒两种时间戳格式
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 时间戳转日期 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">时间戳转日期</h2>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">时间戳</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="timestampInput"
                type="number"
                placeholder="输入时间戳（秒或毫秒）"
                class="input input-bordered flex-1"
              />
              <div class="flex gap-2 items-center">
                <label class="label cursor-pointer">
                  <span class="label-text">秒</span>
                  <input type="radio" v-model="timestampUnit" value="seconds" class="radio radio-primary radio-sm" />
                </label>
                <label class="label cursor-pointer">
                  <span class="label-text">毫秒</span>
                  <input type="radio" v-model="timestampUnit" value="milliseconds" class="radio radio-primary radio-sm" />
                </label>
              </div>
            </div>
          </div>
          
          <div class="card-actions justify-center mt-4">
            <button
              @click="convertTimestampToDate"
              class="btn btn-primary"
              :disabled="!timestampInput"
            >
              转换
            </button>
          </div>
          
          <div v-if="dateResult" class="bg-base-200 p-4 rounded-lg mt-4">
            <h3 class="font-semibold mb-2">转换结果</h3>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">本地时间:</span> {{ dateResult.local }}</div>
              <div><span class="font-medium">UTC时间:</span> {{ dateResult.utc }}</div>
              <div><span class="font-medium">ISO格式:</span> {{ dateResult.iso }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日期转时间戳 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title">日期转时间戳</h2>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">日期时间</span>
            </label>
            <input
              v-model="datetimeInput"
              type="datetime-local"
              class="input input-bordered w-full"
            />
          </div>
          
          <div class="card-actions justify-center mt-4">
            <button
              @click="convertDateToTimestamp"
              class="btn btn-primary"
              :disabled="!datetimeInput"
            >
              转换
            </button>
          </div>
          
          <div v-if="timestampResult" class="bg-base-200 p-4 rounded-lg mt-4">
            <h3 class="font-semibold mb-2">转换结果</h3>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">秒时间戳:</span> {{ timestampResult.seconds }}</div>
              <div><span class="font-medium">毫秒时间戳:</span> {{ timestampResult.milliseconds }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前时间 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">当前时间</h2>
        <div class="flex justify-center">
          <button
            @click="getCurrentTime"
            class="btn btn-secondary"
          >
            获取当前时间
          </button>
        </div>
        
        <div v-if="currentTime" class="bg-base-200 p-4 rounded-lg mt-4">
          <h3 class="font-semibold mb-2">当前时间信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium">本地时间:</span> {{ currentTime.local }}</div>
            <div><span class="font-medium">UTC时间:</span> {{ currentTime.utc }}</div>
            <div><span class="font-medium">秒时间戳:</span> {{ currentTime.seconds }}</div>
            <div><span class="font-medium">毫秒时间戳:</span> {{ currentTime.milliseconds }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 mt-6">
      <button
        @click="copyTimestamp"
        class="btn btn-sm btn-primary"
        :disabled="!timestampResult"
      >
        复制时间戳
      </button>
      <button
        @click="copyDate"
        class="btn btn-sm btn-primary"
        :disabled="!dateResult"
      >
        复制日期
      </button>
      <button
        @click="clearAll"
        class="btn btn-sm btn-ghost"
      >
        清空所有
      </button>
    </div>

    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            使用说明
          </div>
          <div class="collapse-content"> 
            <div class="space-y-2">
              <p>时间戳转换工具可以在时间戳和日期时间之间进行转换，支持秒和毫秒两种时间戳格式。</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>时间戳转日期：输入时间戳，选择单位（秒或毫秒），点击转换按钮</li>
                <li>日期转时间戳：选择日期时间，点击转换按钮</li>
                <li>获取当前时间：点击"获取当前时间"按钮</li>
                <li>可以复制转换结果或清空所有内容</li>
              </ol>
              <div class="alert alert-info mt-2">
                <div class="text-sm">时间戳是指从1970年1月1日00:00:00 UTC到指定时间的秒数或毫秒数。</div>
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
import { useTimestampConverterStore } from '@/store/modules/tools/converter/TimestampConverter.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'TimestampConverterPage',
  meta: {
    tool: {
      id: 'timestamp-converter',
      name: '时间戳转换',
      description: '在时间戳和日期时间之间进行转换，支持秒和毫秒两种时间戳格式',
      category: 'converter',
      icon: 'clock',
      tags: ['时间戳', '日期', '时间', '转换'],
      keywords: ['timestamp', 'date', 'time', 'convert', 'unix', '时间戳', '日期转换']
    }
  }
});

// 使用独立的TimestampConverter store
const timestampConverterStore = useTimestampConverterStore();

// 从store中解构状态和方法
const { 
  timestampInput, 
  timestampUnit, 
  dateResult, 
  datetimeInput, 
  timestampResult, 
  currentTime,
  hasTimestampInput,
  hasDatetimeInput,
  hasDateResult,
  hasTimestampResult,
  hasCurrentTime
} = storeToRefs(timestampConverterStore);

const { 
  convertTimestampToDate, 
  convertDateToTimestamp, 
  getCurrentTime, 
  copyTimestamp, 
  copyDate, 
  clearAll 
} = timestampConverterStore;
</script>