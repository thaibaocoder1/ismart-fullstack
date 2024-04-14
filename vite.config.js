import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        ...getClientFiles(),
      },
    },
    target: 'esnext',
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
function getAdminFiles() {
  const adminDir = resolve(__dirname, 'admin')
  const entries = {}
  const files = glob.sync(`${adminDir}/*.html`)
  files.forEach((file) => {
    let fileName = file.split('/').pop().replace('.html', '')
    if (fileName === 'index') {
      fileName = 'main'
    }
    const camelCaseName = kebabToCamelCase(fileName)
    entries[camelCaseName] = resolve(__dirname, file)
  })
  return entries
}
function getClientFiles() {
  const clientDir = resolve(__dirname)
  const entries = {}
  const files = glob.sync(`${clientDir}/*.html`)

  files.forEach((file) => {
    let fileName = file.split('/').pop().replace('.html', '')
    if (fileName === 'index') {
      fileName = 'main'
    }
    const camelCaseName = kebabToCamelCase(fileName)
    entries[camelCaseName] = resolve(__dirname, file)
  })

  return entries
}
function kebabToCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, char) => char.toUpperCase())
}
