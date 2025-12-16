<template>
  <div class="sql-formatter-container">
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">SQL格式化工具</h1>
      <p class="text-gray-600 dark:text-gray-300 mt-1">格式化、压缩和美化您的SQL查询语句</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧输入区域 -->
      <div class="space-y-4">
        <!-- SQL输入区域 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">SQL输入</h2>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ inputLineCount }} 行
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ inputCharCount }} 字符
              </span>
            </div>
          </div>
          <div class="p-4">
            <div class="relative">
              <!-- 行号显示 -->
              <div class="absolute left-0 top-0 bottom-0 w-10 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-right pr-2 pt-2 select-none">
                <div 
                  v-for="(line, index) in inputLineCount" 
                  :key="index" 
                  class="text-xs text-gray-400 leading-6"
                >
                  {{ index + 1 }}
                </div>
              </div>
              
              <!-- SQL输入文本区域 -->
              <textarea
                v-model="inputSql"
                class="w-full h-64 pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="在此输入您的SQL语句..."
                @input="handleInputChange"
                @keydown="handleKeyDown"
                spellcheck="false"
              ></textarea>
            </div>
            
            <!-- 输入区域底部操作栏 -->
            <div class="flex justify-between items-center mt-3">
              <div class="flex items-center space-x-2">
                <button
                  @click="clearInput"
                  class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  清空
                </button>
                <button
                  @click="loadExample"
                  class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  加载示例
                </button>
              </div>
              
              <div class="flex items-center space-x-2">
                <label class="text-sm text-gray-600 dark:text-gray-400">SQL方言:</label>
                <select
                  v-model="selectedDialect"
                  @change="updateDialect(selectedDialect)"
                  class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option v-for="dialect in sqlDialects" :key="dialect.value" :value="dialect.value">
                    {{ dialect.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 格式化选项面板 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">格式化选项</h2>
            <button
              @click="toggleOptionsPanel"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg v-if="!showOptions" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div v-show="showOptions" class="p-4 space-y-4">
            <!-- 缩进选项 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  缩进类型
                </label>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="options.useTabs"
                      :value="false"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700 dark:text-gray-300">空格</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="options.useTabs"
                      :value="true"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700 dark:text-gray-300">制表符</span>
                  </label>
                </div>
              </div>
              
              <div v-if="!options.useTabs">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  缩进大小: {{ options.indentSize }} 个空格
                </label>
                <input
                  type="range"
                  v-model="options.indentSize"
                  min="2"
                  max="8"
                  class="w-full"
                >
              </div>
            </div>
            
            <!-- 关键字格式化 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                关键字大小写
              </label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="options.keywordCase"
                    value="upper"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700 dark:text-gray-300">大写 (UPPER)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="options.keywordCase"
                    value="lower"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700 dark:text-gray-300">小写 (lower)</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="options.keywordCase"
                    value="capitalize"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700 dark:text-gray-300">首字母大写 (Capitalize)</span>
                </label>
              </div>
            </div>
            
            <!-- 换行策略 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  查询间空行数: {{ options.linesBetweenQueries }}
                </label>
                <input
                  type="range"
                  v-model="options.linesBetweenQueries"
                  min="1"
                  max="5"
                  class="w-full"
                >
              </div>
            </div>
            
            <!-- 其他选项 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="options.semicolonNewline"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700 dark:text-gray-300">分号换行</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="options.denseOperators"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700 dark:text-gray-300">紧凑操作符</span>
              </label>
              
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="options.enableLiveFormat"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700 dark:text-gray-300">实时格式化</span>
              </label>
            </div>
            
            <!-- 配置操作 -->
            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div class="space-x-2">
                <button
                  @click="exportConfig"
                  class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  导出配置
                </button>
                <button
                  @click="showImportDialog = true"
                  class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  导入配置
                </button>
              </div>
              
              <button
                @click="resetOptions"
                class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                重置选项
              </button>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex space-x-4">
          <button
            @click="formatSql"
            :disabled="!hasInput || isFormatting"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg v-if="isFormatting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isFormatting ? '格式化中...' : '格式化' }}
          </button>
          
          <button
            @click="compressSql"
            :disabled="!hasInput || isFormatting"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <svg v-if="isFormatting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            压缩
          </button>
        </div>
      </div>
      
      <!-- 右侧结果区域 -->
      <div class="space-y-4">
        <!-- 格式化结果 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">格式化结果</h2>
            <div class="flex items-center space-x-2">
              <button
                v-if="hasOutput"
                @click="toggleViewMode"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {{ viewMode === 'result' ? '显示对比' : '显示结果' }}
              </button>
              <button
                v-if="hasOutput"
                @click="copyResult"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                复制
              </button>
            </div>
          </div>
          
          <div class="p-4">
            <!-- 标准结果视图 -->
            <div v-if="viewMode === 'result'" class="relative">
              <!-- 行号显示 -->
              <div v-if="hasOutput" class="absolute left-0 top-0 bottom-0 w-10 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-right pr-2 pt-2 select-none overflow-hidden">
                <div  
                  v-for="(line, index) in outputLineCount" 
                  :key="index" 
                  class="text-xs text-gray-400 leading-6"
                >
                  {{ index + 1 }}
                </div>
              </div>
              
              <!-- 结果显示区域 -->
              <div v-if="hasOutput" class="pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white font-mono text-sm overflow-auto max-h-64">
                <pre>{{ outputSql }}</pre>
              </div>
              
              <!-- 空状态 -->
              <div v-else class="flex items-center justify-center h-64 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900">
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">格式化结果将显示在这里</p>
                </div>
              </div>
            </div>
            
            <!-- 对比视图 -->
            <div v-else-if="viewMode === 'compare' && hasOutput" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 原始SQL -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原始SQL</h3>
                <div class="border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 p-2 overflow-auto max-h-64">
                  <pre class="text-xs text-gray-800 dark:text-white font-mono whitespace-pre-wrap">{{ inputSql }}</pre>
                </div>
              </div>
              
              <!-- 格式化后的SQL -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">格式化后SQL</h3>
                <div class="border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 p-2 overflow-auto max-h-64">
                  <pre class="text-xs text-gray-800 dark:text-white font-mono whitespace-pre-wrap">{{ outputSql }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div v-if="formatStats" class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-800 dark:text-white">统计信息</h2>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">原始大小:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.originalSize }} 字符</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">格式化大小:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.formattedSize }} 字符</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">原始行数:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.originalLines }} 行</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">格式化行数:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.formattedLines }} 行</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">格式化时间:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.formatTime }} 毫秒</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">压缩率:</span>
                <span class="ml-2 font-medium text-gray-800 dark:text-white">{{ formatStats.compressionRatio }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="formatError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">格式化错误</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{{ formatError.message }}</p>
                <p v-if="formatError.line" class="mt-1">行号: {{ formatError.line }}, 列号: {{ formatError.column }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 示例查询浮动面板 -->
    <div v-if="showExamplePanel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-800 dark:text-white">示例查询</h2>
          <button
            @click="showExamplePanel = false"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="p-4 overflow-auto max-h-[60vh]">
          <div class="mb-4 flex flex-wrap gap-2">
            <button
              v-for="dialect in sqlDialects"
              :key="dialect.value"
              @click="selectedExampleDialect = dialect.value"
              :class="[
                'px-3 py-1 text-sm rounded transition-colors',
                selectedExampleDialect === dialect.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ dialect.label }}
            </button>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto">
            <pre class="text-sm text-gray-800 dark:text-white font-mono whitespace-pre-wrap">{{ currentExample }}</pre>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button
              @click="useExample"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              使用此示例
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导入配置对话框 -->
    <div v-if="showImportDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-800 dark:text-white">导入配置</h2>
          <button
            @click="showImportDialog = false"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="p-4">
          <textarea
            v-model="importConfigText"
            class="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono text-sm"
            placeholder="在此粘贴配置JSON..."
          ></textarea>
          
          <div class="mt-4 flex justify-end space-x-2">
            <button
              @click="showImportDialog = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              @click="importConfig"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              导入
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useSqlFormatterStore } from '@/store/modules/tools/converter/SqlFormatter.js';
import { useToast } from '@/composables/useToast.js';

// 定义组件选项，确保keepalive能正常工作，并包含工具配置
defineOptions({
  name: 'SqlFormatterPage',
  meta: {
    tool: {
      id: 'sql-formatter',
      name: 'SQL格式化工具',
      description: 'SQL格式化和美化工具，支持多种SQL方言和自定义格式化选项',
      icon: '🗃️',
      category: 'data',
      tags: ['sql', '格式化', '美化', '缩进', '数据处理', '数据库'],
      enabled: true,
      isPopular: true,
      order: 1
    }
  }
});

// Toast
const { success: showSuccess, error: showError } = useToast();

// Store
const store = useSqlFormatterStore();

// 本地状态
const showOptions = ref(true);
const showExamplePanel = ref(false);
const showImportDialog = ref(false);
const viewMode = ref('result'); // 'result' 或 'compare'
const selectedExampleDialect = ref('sql');
const importConfigText = ref('');

// 格式化定时器ID（用于实时格式化）
let formatTimerId = null;

// 计算属性
const inputSql = computed({
  get: () => store.inputSql,
  set: (value) => store.inputSql = value
});

const outputSql = computed({
  get: () => store.outputSql,
  set: (value) => store.outputSql = value
});

const selectedDialect = computed({
  get: () => store.selectedDialect,
  set: (value) => store.selectedDialect = value
});

const options = computed({
  get: () => store.options,
  set: (value) => store.options = value
});

const isFormatting = computed(() => store.isFormatting);
const formatError = computed(() => store.formatError);
const formatStats = computed(() => store.formatStats);
const hasInput = computed(() => store.hasInput);
const hasOutput = computed(() => store.hasOutput);
const sqlDialects = computed(() => store.sqlDialects);
const currentExample = computed(() => {
  return store.exampleQueries[selectedExampleDialect.value] || store.exampleQueries.sql;
});

// 输入统计
const inputLineCount = computed(() => {
  return inputSql.value ? inputSql.value.split('\n').length : 0;
});

const inputCharCount = computed(() => {
  return inputSql.value ? inputSql.value.length : 0;
});

const outputLineCount = computed(() => {
  return outputSql.value ? outputSql.value.split('\n').length : 0;
});

// 方法
const formatSql = async () => {
  try {
    await store.formatSql();
    if (store.outputSql) {
      showSuccess('SQL格式化成功');
    }
  } catch (error) {
    showError('格式化失败: ' + error.message);
  }
};

const compressSql = async () => {
  try {
    await store.compressSql();
    if (store.outputSql) {
      showSuccess('SQL压缩成功');
    }
  } catch (error) {
    showError('压缩失败: ' + error.message);
  }
};

const clearInput = () => {
  store.clearInput();
};

const loadExample = () => {
  showExamplePanel.value = true;
};

const useExample = () => {
  store.loadExample();
  showExamplePanel.value = false;
  showSuccess('示例SQL已加载');
};

const copyResult = async () => {
  try {
    const success = await store.copyResult();
    if (success) {
      showSuccess('已复制到剪贴板');
    } else {
      showError('复制失败');
    }
  } catch (error) {
    showError('复制失败: ' + error.message);
  }
};

const updateDialect = (dialect) => {
  store.updateDialect(dialect);
};

const toggleOptionsPanel = () => {
  showOptions.value = !showOptions.value;
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'result' ? 'compare' : 'result';
};

const exportConfig = () => {
  const config = store.exportConfig();
  navigator.clipboard.writeText(config).then(() => {
    showSuccess('配置已复制到剪贴板');
  }).catch(() => {
    showError('复制配置失败');
  });
};

const importConfig = () => {
  try {
    const success = store.importConfig(importConfigText.value);
    if (success) {
      showSuccess('配置导入成功');
      showImportDialog.value = false;
      importConfigText.value = '';
    } else {
      showError('配置格式错误');
    }
  } catch (error) {
    showError('导入配置失败: ' + error.message);
  }
};

const resetOptions = () => {
  store.reset();
  showSuccess('选项已重置');
};

// 处理输入变化（用于实时格式化）
const handleInputChange = () => {
  if (options.value.enableLiveFormat && inputSql.value.trim()) {
    // 清除之前的定时器
    if (formatTimerId) {
      clearTimeout(formatTimerId);
    }
    
    // 设置新的定时器
    formatTimerId = setTimeout(() => {
      formatSql();
    }, options.value.liveFormatDelay);
  }
};

// 处理键盘事件（Tab键支持）
const handleKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // 插入制表符或空格
    const indentChar = options.value.useTabs ? '\t' : ' '.repeat(options.value.indentSize);
    
    inputSql.value = inputSql.value.substring(0, start) + indentChar + inputSql.value.substring(end);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + indentChar.length;
    }, 0);
  }
};

// 监听选项变化，实时格式化
watch(options, () => {
  if (options.value.enableLiveFormat && inputSql.value.trim()) {
    handleInputChange();
  }
}, { deep: true });

// 组件卸载时清除定时器
onUnmounted(() => {
  if (formatTimerId) {
    clearTimeout(formatTimerId);
  }
});
</script>

<style scoped>
.sql-formatter-container {
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

/* 自定义滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark .overflow-auto::-webkit-scrollbar-track {
  background: #374151;
}

.dark .overflow-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 动画效果 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sql-formatter-container {
    padding: 0.5rem;
  }
  
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>