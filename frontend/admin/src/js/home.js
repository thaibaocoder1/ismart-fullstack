import productApi from '../../../src/js/api/productsApi'
import userApi from '../../../src/js/api/userApi'
import orderApi from '../../../src/js/api/orderApi'
import orderDetailApi from '../../../src/js/api/orderDetailApi'
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
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Số lượng sản phẩm', 'Số lượng tài khoản', 'Số lượng đơn hàng'],
        datasets: [
          {
            label: 'Thống kê',
            data: [products.results, users.results, orders.results],
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
async function initChartOrder({ idElement }) {
  const element = document.getElementById(idElement)
  if (!element) return
  const monthlyRevenue = []
  const res = await orderDetailApi.getWithStatus()
  const { orders } = res
  for (let i = 1; i <= 12; i++) {
    const ordersInMonth = orders.filter((order) => {
      const orderMonth = new Date(order.createdAt).getMonth() + 1
      return orderMonth === i
    })
    const totalRevenueInMonth = ordersInMonth.reduce(
      (total, order) => total + order.price * order.quantity,
      0,
    )
    monthlyRevenue.push(totalRevenueInMonth)
  }
  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]
  const ctx = element.getContext('2d')
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [
        {
          label: 'Doanh thu trong năm',
          data: monthlyRevenue,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
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
}
// main
;(async () => {
  await initChart({
    idElement: 'myChart',
  })
  await initChartOrder({
    idElement: 'myChartOrder',
  })
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
