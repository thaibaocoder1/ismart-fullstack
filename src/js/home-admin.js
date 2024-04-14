import productApi from './api/productsApi'
import userApi from './api/userApi'
import orderApi from './api/orderApi'
import orderDetailApi from './api/orderDetailApi'
import { toast, checkLogoutAccount, showSpinner, hideSpinner } from './utils'
import { Chart } from 'chart.js/auto'
;(Chart.defaults.font.family = 'SF Mono'),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.color = '#858796'

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
async function initChartRevenue() {
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
  // Bar Chart Example
  const element = document.getElementById('myAreaChart')
  const ctx = element.getContext('2d')
  const myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [
        {
          label: 'Doanh thu trong năm 2024',
          tension: 0.3,
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderColor: 'rgba(78, 115, 223, 1)',
          pointRadius: 3,
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointBorderColor: 'rgba(78, 115, 223, 1)',
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
          pointHitRadius: 10,
          pointBorderWidth: 2,
          fill: false,
          data: monthlyRevenue,
        },
      ],
    },
    options: {
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeOutExpo',
          from: 1,
          to: 0,
          loop: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0,
        },
      },
      legend: {
        display: false,
      },
      plugins: {
        tooltip: {
          backgroundColor: 'rgb(255,255,255)',
          bodyColor: '#858796',
          titleMarginBottom: 10,
          titleColor: '#6e707e',
          titleFontSize: 14,
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          intersect: false,
          mode: 'index',
          caretPadding: 10,
        },
      },
    },
  })
}
async function initChartOrder() {
  const res = await orderApi.getAll()
  if (res.success) {
    const statusCount = {
      3: 0,
      4: 0,
      5: 0,
    }
    const { orders } = res
    orders.forEach((order) => {
      const { status } = order
      if (status in statusCount) {
        statusCount[status]++
      }
    })
    const values = Object.values(statusCount)
    const ctx = document.getElementById('myPieChart')
    const myPieChart = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Thành công', 'Từ chối nhận hàng', 'Đã huỷ'],
        datasets: [
          {
            data: values,
            backgroundColor: ['#4e73df', '#36b9cc', '#ccc'],
            hoverBackgroundColor: ['#2e59d9', '#2c9faf', '#333'],
            hoverBorderColor: 'rgba(234, 236, 244, 1)',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          subtitle: {
            display: true,
            text: 'Biểu đồ thống kê đơn hàng',
            padding: '15',
          },
          tooltips: {
            backgroundColor: 'rgb(255,255,255)',
            bodyFontColor: '#858796',
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
          },
          legend: {
            display: false,
          },
        },
        cutout: 80,
      },
    })
  }
}
function checkUserCancelOrder(result) {
  let userID
  try {
    if (Array.isArray(result) && result.length > 0) {
      result.forEach(async (item) => {
        if (item.cancelCount >= 2) {
          userID = item.userID
          showSpinner()
          const res = await userApi.delete(item.userID)
          hideSpinner()
          if (res.success) {
            toast.success(res.message)
          } else {
            toast.error(res.message)
            return
          }
        }
      })
    }
    return userID
  } catch (error) {
    console.log(error)
  }
}
// main
;(async () => {
  if (window.location.pathname === '/admin/index.html') {
    await initChart({
      idElement: 'myChart',
    })
    await initChartRevenue()
    await initChartOrder()
  }
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
  const filteredUsers = sessionStorage.getItem('filteredUsers')
  const aggregatedOrders = {}
  const filterUserID = []
  const res = await orderApi.getAll()
  const { orders } = res
  orders.forEach((order) => {
    if (order.status === 5) {
      const { userID, cancelCount } = order
      if (aggregatedOrders[userID]) {
        aggregatedOrders[userID].cancelCount += cancelCount
      } else {
        aggregatedOrders[userID] = { userID, cancelCount }
      }
    }
  })
  const result = Object.values(aggregatedOrders)
  if (!filteredUsers) {
    const userID = checkUserCancelOrder(result)
    filterUserID.push(userID)
    sessionStorage.setItem('filteredUsers', JSON.stringify(filterUserID))
  } else {
    const filteredUsers = JSON.parse(sessionStorage.getItem('filteredUsers'))
    const resultApply = result.filter((item) => !filteredUsers.includes(item.userID))
    const userID = checkUserCancelOrder(resultApply)
    if (userID) {
      filteredUsers.push(userID)
      sessionStorage.setItem('filteredUsers', JSON.stringify(filteredUsers))
    }
  }
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('a#logout-btn')) {
      e.preventDefault()
      await checkLogoutAccount()
    } else if (target.closest('button#btn-statistical')) {
      try {
        showSpinner()
        const res = await productApi.getAll()
        const orderDetail = await orderDetailApi.getWithStatus()
        hideSpinner()
        if (res.success && orderDetail.success) {
          const { products } = res
          const { orders } = orderDetail
          const table = document.getElementById('table-statistical')
          const tableBody = table.querySelector('tbody')
          tableBody.textContent = ''
          products.forEach((item, index) => {
            const productSold = orders.find(
              (x) => x.orderID.status === 3 && x.productID === item._id,
            )
            const tableRow = document.createElement('tr')
            tableRow.innerHTML = `<th scope="row">${index + 1}</th>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${productSold ? productSold.quantity : 0}</td>`
            tableBody.appendChild(tableRow)
          })
        }
      } catch (error) {
        console.log(error)
      }
    } else if (target.closest('button#btn-export-csv')) {
      try {
        showSpinner()
        const res = await productApi.export()
        hideSpinner()
        if (res.success) {
          toast.success(res.message)
          const downloadLink = res.link
          const hiddenLink = document.createElement('a')
          hiddenLink.href = downloadLink
          hiddenLink.style.display = 'none'
          document.body.appendChild(hiddenLink)
          hiddenLink.click()
          document.body.removeChild(hiddenLink)
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else {
          toast.error(res.message)
          return
        }
      } catch (error) {
        console.log(error)
      }
    }
  })
})()
