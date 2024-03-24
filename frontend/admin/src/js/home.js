import productApi from '../../../src/js/api/productsApi'
import userApi from '../../../src/js/api/userApi'
import orderApi from '../../../src/js/api/orderApi'
import { toast, checkLogoutAccount, showSpinner, hideSpinner } from '../../../src/js/utils'
import { Chart } from 'chart.js/auto'

async function checkRoleAccount(infoUserStorage) {
  const { id } = infoUserStorage
  try {
    showSpinner()
    const data = await userApi.verify(id)
    hideSpinner()
    if (data.success) {
      const { user } = data
      if (user.role === 'User') {
        window.location.assign('login.html')
      }
    }
    return true
  } catch (error) {
    console.log('Error', error)
  }
}
async function initChart({ idElement }) {
  const element = document.getElementById(idElement)
  if (!element) return
  const ctx = element.getContext('2d')
  try {
    showSpinner()
    const products = await productApi.getAll()
    const users = await userApi.getAll()
    const orders = await orderApi.getAll()
    hideSpinner()
    const productCount = products.length
    const userCount = users.length
    const orderCount = orders.length
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Số lượng sản phẩm', 'Số lượng tài khoản', 'Số lượng đơn hàng'],
        datasets: [
          {
            label: 'Thống kê',
            data: [productCount, userCount, orderCount],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
            borderRadius: 10,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    toast.error('Có lỗi trong khi xử lý dữ liệu')
  }
}
// main
;(async () => {
  // initChart({
  //   idElement: 'myChart',
  // })
  let infoUserStorage = localStorage.getItem('accessTokenAdmin')
    ? JSON.parse(localStorage.getItem('accessTokenAdmin'))
    : {}
  if (Object.keys(infoUserStorage).length === 0) {
    window.location.assign('/admin/login.html')
  } else {
    const result = await checkRoleAccount(infoUserStorage)
    if (result && window.location.pathname === '/admin/index.html') {
      toast.success('Chào mừng admin đăng nhập')
    }
  }
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('a#logout-btn')) {
      e.preventDefault()
      await checkLogoutAccount()
    }
  })
})()
