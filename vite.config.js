import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({mode}) => ({
    base: process.env.BASE_URL,
	plugins: [
		vue(), 
		tailwindcss()
	],
	css: {
		devSourcemap: mode === "development",
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server:{
		host: "0.0.0.0",
		port:9000,
		// Vite 4+ 使用此配置来处理前端路由刷新问题
		// 确保所有路由都回退到index.html
		strictPort: true,
		// 处理前端路由刷新
		proxy: {
			// 开发服务器代理配置
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			}
		}
	},
	// 构建配置
	build: {
		// 配置rollup选项，确保单页应用路由正常工作
		rollupOptions: {
			input: {
				main: './index.html'
			}
		}
	}
}))
