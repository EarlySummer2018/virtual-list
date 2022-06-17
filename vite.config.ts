import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from "vite-plugin-mock"
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
  viteMockServe({
    mockPath: "./mock/", //mock文件地址 
    logger: false, //是否在控制台显示请求日志 
    supportTs: true //打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件 
  }),
  viteCompression()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/main.scss";'
      }
    }
  }
})
