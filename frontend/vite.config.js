import { resolve } from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        account: resolve(__dirname, 'account.html'),
        updateInfo: resolve(__dirname, 'update-info.html'),
        orders: resolve(__dirname, 'orders.html'),
      },
    },
  },
})
