import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const adminDir = resolve(__dirname, 'admin')

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        update: resolve(__dirname, 'update.html'),
        updateInfo: resolve(__dirname, 'update-info.html'),
        register: resolve(__dirname, 'register.html'),
        recovery: resolve(__dirname, 'recovery.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        order: resolve(__dirname, 'order.html'),
        login: resolve(__dirname, 'login.html'),
        index: resolve(__dirname, 'index.html'),
        forgot: resolve(__dirname, 'forgot.html'),
        detailOrder: resolve(__dirname, 'detail-order.html'),
        contact: resolve(__dirname, 'contact.html'),
        confirm: resolve(__dirname, 'confirm.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        cart: resolve(__dirname, 'cart.html'),
        active: resolve(__dirname, 'active.html'),
        account: resolve(__dirname, 'account.html'),
        about: resolve(__dirname, 'about.html'),
        users: resolve(adminDir, 'users.html'),
        usersTrash: resolve(adminDir, 'users-trash.html'),
        'update-password': resolve(adminDir, 'update-password.html'),
        'update-info': resolve(adminDir, 'update-info.html'),
        product: resolve(adminDir, 'product.html'),
        orders: resolve(adminDir, 'order.html'),
        'login-admin': resolve(adminDir, 'login.html'),
        main: resolve(adminDir, 'index.html'),
        'edit-product': resolve(adminDir, 'edit-product.html'),
        'edit-category': resolve(adminDir, 'edit-category.html'),
        comment: resolve(adminDir, 'comment.html'),
        category: resolve(adminDir, 'category.html'),
        'add-product': resolve(adminDir, 'add-product.html'),
        'add-edit-user': resolve(adminDir, 'add-edit-user.html'),
        'add-category': resolve(adminDir, 'add-category.html'),
        'account-admin': resolve(adminDir, 'account.html'),
      },
    },
    target: 'esnext',
    proxy: {
      '/api': {
        target: 'https://backend-ismart.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
})
