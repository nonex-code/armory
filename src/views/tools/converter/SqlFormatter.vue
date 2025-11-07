<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center mb-2">
        <span class="text-4xl mr-3">🗃️</span>
        <h1 class="text-3xl md:text-4xl font-bold">SQL格式化</h1>
      </div>
      <p class="text-base-content/70 max-w-2xl mx-auto">
        格式化和美化SQL语句，使其更易读和维护
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">输入SQL语句</h2>
            <div class="flex gap-2">
              <button 
                class="btn btn-sm btn-ghost"
                @click="loadExample"
              >
                加载示例
              </button>
              <button 
                class="btn btn-sm btn-ghost"
                @click="clearInput"
              >
                清空
              </button>
            </div>
          </div>
          
          <!-- SQL输入区域 -->
          <div class="form-control">
            <textarea
              v-model="inputSql"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm" 
              placeholder="请输入需要格式化的SQL语句..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">格式化结果</h2>
            <button 
              class="btn btn-sm btn-primary" 
              @click="copyResult"
              :disabled="!outputSql"
            >
              复制结果
            </button>
          </div>
          
          <!-- 输出内容 -->
          <div class="form-control">
            <textarea 
              v-model="outputSql"
              class="textarea textarea-bordered h-64 w-full font-mono text-sm bg-base-200" 
              placeholder="格式化结果将显示在这里"
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 格式化选项 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title mb-4">格式化选项</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">关键字大写</span>
              <input type="checkbox" v-model="options.uppercase" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">缩进</span>
              <input type="checkbox" v-model="options.indent" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">换行</span>
              <input type="checkbox" v-model="options.lineBreak" class="checkbox checkbox-primary" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">逗号前换行</span>
              <input type="checkbox" v-model="options.commaFirst" class="checkbox checkbox-primary" />
            </label>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-center gap-2 mt-6">
          <button 
            class="btn btn-primary" 
            @click="formatSql"
            :disabled="!inputSql"
          >
            格式化
          </button>
          <button 
            class="btn btn-secondary" 
            @click="compressSql"
            :disabled="!inputSql"
          >
            压缩
          </button>
        </div>
      </div>
    </div>
    
    <!-- 工具说明 -->
    <div class="card bg-base-100 shadow-lg mt-6">
      <div class="card-body">
        <h2 class="card-title">使用说明</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">使用方法</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm">
              <li>在输入框中输入需要格式化的SQL语句</li>
              <li>根据需要选择格式化选项</li>
              <li>点击"格式化"按钮进行格式化，或点击"压缩"按钮压缩SQL</li>
              <li>格式化结果将显示在下方的输出框中</li>
              <li>可以点击"复制结果"按钮复制格式化后的SQL</li>
            </ol>
          </div>
          
          <div>
            <h3 class="font-semibold text-lg mb-2">格式化选项说明</h3>
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li><strong>关键字大写：</strong>将SQL关键字转换为大写形式</li>
              <li><strong>缩进：</strong>为SQL语句添加适当的缩进，提高可读性</li>
              <li><strong>换行：</strong>在关键字和子句之间添加换行</li>
              <li><strong>逗号前换行：</strong>将逗号放在行首，便于长列表的阅读</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useSqlFormatterStore } from '@/store/modules/tools/converter/SqlFormatter.js';

// 定义组件选项，确保keepalive能正常工作
defineOptions({
  name: 'SqlFormatterPage',
  meta: {
    tool: {
      id: 'sql-formatter',
      name: 'SQL格式化',
      description: '格式化和美化SQL语句，使其更易读和维护，支持多种格式化选项',
      category: 'converter',
      icon: 'database',
      tags: ['SQL', '格式化', '数据库', '美化'],
      keywords: ['sql', 'formatter', 'database', 'format', 'sql格式化']
    }
  }
});

// 使用独立的store
const sqlFormatterStore = useSqlFormatterStore();
const { 
  inputSql, 
  outputSql, 
  options,
  hasInput,
  hasOutput
} = storeToRefs(sqlFormatterStore);

const { 
  formatSql, 
  compressSql, 
  loadExample, 
  clearInput, 
  copyResult
} = sqlFormatterStore;
</script>