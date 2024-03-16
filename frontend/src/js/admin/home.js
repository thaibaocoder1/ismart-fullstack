import productApi from '../api/productsApi'
import userApi from '../api/userApi'
import orderApi from '../api/orderApi'
import { toast, checkLogoutAccount, showSpinner, hideSpinner } from '../utils'
import { Chart } from 'chart.js/auto'

function checkRoleAccount(infoUserStorage) {
  const hasRoleID2 = infoUserStorage.some((user) => user?.roleID === 2)
  if (hasRoleID2) {
    if (window.location.pathname === '/admin/index.html')
      toast.success('Chào mừng admin đã đăng nhập!')
  } else {
    window.location.assign('/admin/login.html')
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
;(() => {
  initChart({
    idElement: 'myChart',
  })
  let infoUserStorage =
    localStorage.getItem('user_info') !== null ? JSON.parse(localStorage.getItem('user_info')) : []
  if (infoUserStorage.length === 0) {
    window.location.assign('/admin/login.html')
  } else {
    checkRoleAccount(infoUserStorage)
  }
  document.addEventListener('click', function (e) {
    const { target } = e
    if (target.matches("a[title='Thoát']")) {
      e.preventDefault()
      checkLogoutAccount()
    }
  })
})()
