# armory
![armory: Vite + Vue 3 + Sass + Tailwind 4 + DaisyUI 5](https://tpl-vue3-tailwind4-daisyui5.brown.sk/template-image.png)

这个项目使用现代Web技术构建，旨在创建一个功能强大的Web工具库。它基于[Vite + Vue 3模板](https://vite.new/vue)，但包含了一些额外的功能：

- ✅ [Vite](https://vite.dev/) 作为构建工具
- ✅ [Vue 3](https://vuejs.org/) 作为前端框架
- ✅ [Vue Router 4](https://router.vuejs.org/) 用于路由管理
- ✅ [Sass](https://sass-lang.com/) 用于样式编写
- ✅ [Tailwind CSS 4](https://tailwindcss.com/) 用于样式设计
- ✅ [DaisyUI 5](https://daisyui.com/) 提供额外的Tailwind CSS组件
- ✅ [PostCSS](https://postcss.org/) 用于通过JS插件转换CSS
- ✅ **主题配置**（浅色、深色等）
- ✅ **UI组件** 已预配置DaisyUI

### 演示
- 🌐 [https://armory.nonex.top/](https://armory.nonex.top/)

### 项目初始化
⏩ 克隆仓库：
```bash
git clone https://github.com/nonex-code/armory.git
```

⏩ 进入目录：
```bash
cd armory
```

⏩ 移除原有的 `.git` 目录（如果需要重新初始化git仓库）：
```bash
rm -rf .git
```

⏩ 安装依赖：
```bash
npm install
```

### 开发
- ⏩ 运行带有热更新的Vite开发服务器：`npm run dev`

### 生产
- ⏩ 构建项目：`npm run build`

### 桌面程序
本项目使用 [Tauri](https://tauri.app/) 框架提供跨平台桌面应用支持：

- ✅ 支持 Windows、macOS 和 Linux
- ✅ 轻量级，启动速度快
- ✅ 原生系统集成

#### 开发桌面程序
- ⏩ 运行桌面开发版本：`npm run tauri dev`

#### 构建桌面程序
- ⏩ 构建桌面应用：`npm run tauri build`
- 📦 构建产物位于：`src-tauri/target/release/`
  - Windows：`armory.exe`、MSI 和 NSIS 安装包
  - macOS：`armory.app` 应用和 DMG 安装包
  - Linux：可执行文件和包管理器安装包

#### 桌面程序特点
- 🎨 支持系统主题自动切换
- 💾 本地运行，无需网络连接
- 🔒 更高的安全性和性能
- 📱 统一的用户体验，与网页版本保持一致

### 文件夹结构
- 📁 `public/` - 静态文件
  - 📄 `logo.svg` - 项目品牌标识
- 📁 `src/` - 源代码
  - 📁 `assets/` - 静态资源
    - 📁 `icons/` - 图标
    - 📁 `images/` - 图片
    - 📁 `styles/` - 样式
        - 📁 `vendor/` - 第三方样式（Tailwind CSS、DaisyUI）
  - 📁 `components/` - Vue组件
  - 📁 `composables/` - Vue组合式API
  - 📁 `data/` - 静态数据
  - 📁 `layouts/` - 布局组件
  - 📁 `router/` - Vue Router配置
  - 📁 `services/` - 服务
  - 📁 `store/` - 状态管理
    - 📁 `modules/` - 模块化状态
      - 📁 `tools/` - 工具相关状态
  - 📁 `types/` - 类型定义
  - 📁 `utils/` - 工具函数
  - 📁 `views/` - Vue视图
    - � `error/` - 错误页面
    - 📁 `test/` - 测试页面
    - 📁 `tools/` - 工具页面
  - � `App.vue` - 根组件
  - 📄 `main.js` - 入口文件
- 📁 `src-tauri/` - Tauri桌面应用代码
  - 📁 `capabilities/` - Tauri能力配置
  - 📁 `icons/` - 桌面应用图标
  - 📁 `src/` - Rust源代码
  - 📄 `Cargo.toml` - Rust依赖配置
  - 📄 `tauri.conf.json` - Tauri配置文件

### GitHub Pages

模板包含一个用于部署到GitHub Pages的GitHub工作流。要启用GitHub Pages：

1. 访问您的仓库设置
2. 选择Pages部分
3. 在"构建和部署"区域，将源设置为"GitHub Actions"

### 添加新工具
本项目采用**自动工具注册机制**，无需手动配置路由和菜单。只需创建工具组件并添加必要的配置，系统会自动发现并注册工具。

#### 1. 创建工具视图组件
- 📁 路径：`src/views/tools/{category}/{ToolName}.vue`
- 📝 组件结构（含自动注册配置）：
```vue
<script setup>
import { ref, computed } from 'vue';

// 工具逻辑
const input = ref('');
const output = computed(() => {
  // 工具处理逻辑
  return input.value;
});
</script>

<script>
defineOptions({
  name: 'ToolName',
  meta: {
    tool: {
      id: 'tool-unique-id',           // 唯一工具ID
      name: '工具名称',                // 工具显示名称
      description: '工具描述',         // 工具功能说明
      icon: '🔧',                      // 工具图标
      category: 'category',            // 工具分类（见下方分类列表）
      tags: ['标签1', '标签2'],        // 搜索标签
      enabled: true,                   // 是否启用
      isPopular: false,                // 是否热门工具
      order: 999                       // 排序权重（越小越靠前）
    }
  }
});
</script>

<template>
  <div class="space-y-4">
    <!-- 工具界面 -->
    <div class="card">
      <div class="card-body">
        <h2 class="text-xl font-bold mb-4">工具名称</h2>
        <div class="space-y-4">
          <!-- 输入区域 -->
          <div>
            <label class="label">输入</label>
            <textarea v-model="input" class="textarea textarea-bordered w-full" placeholder="输入内容"></textarea>
          </div>
          <!-- 输出区域 -->
          <div>
            <label class="label">输出</label>
            <textarea v-model="output" class="textarea textarea-bordered w-full" readonly></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 2. 工具状态管理（可选）
对于复杂工具，建议创建状态管理：
- 📁 路径：`src/store/modules/tools/{category}/{ToolName}.js`
- 📝 状态管理结构：
```javascript
export default {
  namespaced: true,
  state: () => ({
    // 工具状态
    input: '',
    output: ''
  }),
  mutations: {
    setInput(state, value) {
      state.input = value;
    },
    setOutput(state, value) {
      state.output = value;
    }
  },
  actions: {
    process({ commit, state }) {
      // 工具处理逻辑
      const result = state.input;
      commit('setOutput', result);
    }
  }
};
```

#### 3. 自动注册机制
系统会自动：
- � 发现并加载 `src/views/tools/` 目录下的所有工具组件
- 📝 从组件的 `defineOptions.meta.tool` 中提取配置
- �️ 自动生成工具路由（路径格式：`/tools/{category}/{tool-name}`）
- 📋 自动生成菜单数据和搜索索引
- 🏷️ 支持工具分类和标签管理

#### 4. 工具开发最佳实践
- 🎨 遵循项目的UI设计规范，使用DaisyUI组件
- 🔧 将复杂逻辑封装到状态管理中
- 📱 确保工具界面响应式，适配不同屏幕尺寸
- ⚡ 优化工具性能，避免阻塞UI
- 📖 添加清晰的工具说明和使用示例
- 🌙 支持浅色/深色主题自动切换
- 📦 保持代码模块化和可维护性

#### 工具分类
项目支持以下工具分类：
- 📊 `converter` - 格式转换工具
- 🔒 `crypto` - 加密解密工具
- 🎯 `ctf` - 安全挑战工具
- 🔤 `encoding` - 编码转换工具
- 📝 `format` - 格式化工具
- 🔄 `generator` - 生成器工具
- 📈 `hash` - 哈希计算工具
- 🌐 `network` - 网络工具
- 🧪 `tester` - 测试工具
- 📄 `text` - 文本处理工具

#### 工具配置字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | String | ✅ | 唯一工具ID，建议使用小写字母和连字符 |
| `name` | String | ✅ | 工具显示名称 |
| `description` | String | ✅ | 工具功能说明，用于搜索和介绍 |
| `icon` | String | ✅ | 工具图标，支持emoji |
| `category` | String | ✅ | 工具分类，必须是支持的分类之一 |
| `tags` | Array | ✅ | 搜索标签数组 |
| `enabled` | Boolean | ❌ | 是否启用，默认为true |
| `isPopular` | Boolean | ❌ | 是否热门工具，默认为false |
| `order` | Number | ❌ | 排序权重，越小越靠前，默认为999 |

通过以上流程，您可以轻松地为项目添加新的功能工具，系统会自动处理注册和集成，保持代码结构的一致性和可维护性。