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
- 🌐 [https://armory.example.com/](https://armory.example.com/)（可用时替换为实际演示URL）

### 项目初始化
⏩ 克隆仓库：
```bash
git clone https://gitcode.com/yuzus/armory.git
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

### 文件夹结构
- 📁 `public/` - 静态文件
- 📁 `src/` - 源代码
  - 📁 `assets/` - 静态资源
    - 📁 `images/` - 图片
    - 📁 `styles/` - 样式
        - 📁 `vendor/` - 第三方样式（Tailwind CSS、DaisyUI）
  - 📁 `components/` - Vue组件
  - 📁 `router/` - Vue Router配置
  - 📁 `views/` - Vue视图
  - 📄 `App.vue` - 根组件
  - 📄 `main.js` - 入口文件

### GitHub Pages

模板包含一个用于部署到GitHub Pages的GitHub工作流。要启用GitHub Pages：

1. 访问您的仓库设置
2. 选择Pages部分
3. 在"构建和部署"区域，将源设置为"GitHub Actions"

### 待办事项
- [ ] 🕘 添加单元测试
- [ ] 🕘 最小化模板（不包含额外功能）
