import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig(({mode}) => ({
    base: process.env.BASE_URL,
	plugins: [
		vue(), 
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
			manifest: {
				name: 'Web Tools Armory',
				short_name: 'Armory',
				description: 'A powerful web tools armory built with Vite + Vue 3',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: '/vite.svg',
						sizes: '192x192',
						type: 'image/svg+xml'
					},
					{
						src: '/vite.svg',
						sizes: '512x512',
						type: 'image/svg+xml'
					},
					{
						src: '/vite.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 30 * 24 * 60 * 60
							}
						}
					}
				]
			}
		})
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
		// host: "0.0.0.0",
		// port:9001,
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
