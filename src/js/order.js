import orderApi from './api/orderApi'
import orderDetailApi from './api/orderDetailApi'
import productApi from './api/productsApi'
import {
  addCartToDom,
  displayTextStatus,
  formatCurrencyNumber,
  hideSpinner,
  initSearchForm,
  showSpinner,
  toast,
} from './utils'
import dayjs from 'dayjs'
import { checkLoginUser } from './utils/get-user'

function displayTagLink(ulElement) {
  ulElement.textContent = ''
  const infoArr = ['Cập nhật thông tin', 'Quản lý đơn hàng', 'Đăng xuất']
  for (let i = 0; i < infoArr.length; ++i) {
    const liElement = document.createElement('li')
    liElement.innerHTML = `<a href="#" title="${infoArr[i]}">${infoArr[i]}</a>`
    ulElement.appendChild(liElement)
  }
}
async function renderInfoAccount({ idElement, infoUserStorage, divInfoLeft }) {
  const ulElement = document.getElementById(idElement)
  const divInfoLeftEl = document.getElementById(divInfoLeft)
  if (!ulElement || !divInfoLeftEl) return
  if (Object.keys(infoUserStorage).length === 0) {
    divInfoLeftEl.classList.add('is-hide')
    userAvatarEl.classList.add('is-hide')
  } else {
    displayTagLink(ulElement)
  }
}
async function handleCancelOrder(orderID) {
  if (!orderID) return
  let isSuccess = false
  try {
    showSpinner()
    const res = await orderApi.getById(orderID)
    const orderDetail = await orderDetailApi.getById(orderID)
    hideSpinner()
    if (res.success && orderDetail.success) {
      const { order } = res
      const orderStatus = +order.status
      if (orderStatus === 1) {
        const data = {
          status: 4,
          id: orderID,
        }
        await orderApi.update(data)
        for (const item of orderDetail.orders) {
          const { productID, quantity } = item
          const productInfo = await productApi.getById(productID._id)
          const { product } = productInfo
          const payload = {
            id: productID._id,
            quantity: Number.parseInt(product.quantity) + quantity,
          }
          await productApi.update(payload)
        }
        isSuccess = true
      }
    } else {
      toast.error('Có lỗi trong khi huỷ đơn hàng!')
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
  return isSuccess
}
function handleOnClick() {
  // add event for element render after dom
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches("a[title='Đăng xuất']")) {
      localStorage.removeItem('accessToken')
      toast.info('Chuyển đến trang đăng nhập')
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 500)
    } else if (target.matches("a[title='Cập nhật thông tin']")) {
      window.location.assign('/update-info.html')
    } else if (target.matches("a[title='Quản lý đơn hàng']")) {
      window.location.assign('/order.html')
    } else if (target.matches('#orderDetail')) {
      const modal = document.getElementById('modal')
      if (!modal) return
      const modalBody = modal.querySelector('.modal-body')
      const tableBody = modalBody.querySelector('tbody')
      const orderID = target.dataset.id
      showSpinner()
      const res = await orderDetailApi.getById(orderID)
      hideSpinner()
      if (res.success) {
        modal && modal.classList.add('is-show')
        const { orders } = res
        tableBody.textContent = ''
        if (Array.isArray(orders) && orders.length > 0) {
          orders.forEach((item, index) => {
            const tableRow = document.createElement('tr')
            tableRow.innerHTML = `<th scope="row">${index + 1}</th>
            <td>${item.productID.name}</td>
            <td><img src="${item.productID.thumb.fileName}" class="img-thumbnail" alt="${
              item.productID.name
            }" style="width: 100px; height: 100px; object-fit: cover;"></td>
            <td>${item.quantity}</td>
            <td>${formatCurrencyNumber(item.price)}</td>
            <td>${formatCurrencyNumber(item.price * item.quantity)}</td>`
            tableBody.appendChild(tableRow)
          })
        }
      }
    } else if (target.matches('#cancelOrder')) {
      const orderID = target.dataset.id
      const modal = document.getElementById('modal-cancel')
      modal && modal.classList.add('is-show')
      modal.dataset.order = orderID
    } else if (target.closest('.btn-confirm')) {
      const modal = document.getElementById('modal-cancel')
      const orderID = modal.dataset.order
      const isCancel = await handleCancelOrder(orderID)
      if (isCancel) {
        toast.success('Huỷ đơn hàng thành công')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } else if (target.matches('.modal')) {
      const modal = document.getElementById('modal')
      modal && modal.classList.remove('is-show')
    } else if (target.closest('.btn-close')) {
      const modal = document.getElementById('modal')
      modal && modal.classList.remove('is-show')
    }
  })
}
function displayStatus(status) {
  if (!status) return
  if (+status !== 1) {
    return 'disabled'
  }
  return ''
}
async function renderListOrder({ idTable, infoUserStorage }) {
  const table = document.getElementById(idTable)
  if (!table) return
  const tbodyEl = table.getElementsByTagName('tbody')[0]
  if (!tbodyEl) return
  try {
    showSpinner()
    const res = await orderApi.getAll()
    hideSpinner()
    if (res.success) {
      const { orders } = res
      if (Object.keys(infoUserStorage).length > 0 && orders.length > 0) {
        const userID = infoUserStorage.id
        const listOrderApply = orders.filter((order) => order.userID === userID)
        if (listOrderApply.length === 0) {
          toast.info('Bạn chưa có đơn hàng nào')
          return
        }
        listOrderApply.forEach((item, index) => {
          const tableRow = document.createElement('tr')
          tableRow.dataset.id = item._id
          tableRow.innerHTML = `<th scope="row">${index + 1}</th>
          <td>${item.fullname}</td>
          <td>${item.email}</td>
          <td>0${item.phone}</td>
          <td>${dayjs(item.orderDate).format('DD/MM/YYYY HH:mm:ss')}</td>
          <td>
            <button type="button" class="btn btn-primary btn--style" id="orderDetail" data-id="${
              item._id
            }">Chi tiết</button>
            <button type="button" id="cancelOrder" data-id="${
              item._id
            }" class="btn btn-danger btn--style" ${displayStatus(item.status)}>${displayTextStatus(
            item.status,
          )}</button>
          </td>`
          tbodyEl.appendChild(tableRow)
        })
      } else {
        toast.info('Bạn chưa có đơn hàng nào')
        return
      }
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
// main
;(() => {
  // get cart from localStorage
  let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  let infoUserStorage = checkLoginUser() || {}
  let isCartAdded = false
  if (Array.isArray(cart) && cart.length > 0) {
    if (!isCartAdded) {
      addCartToDom({
        idListCart: 'listCart',
        cart,
        idNumOrder: 'numOrder',
        idNum: '#num.numDesktop',
        idTotalPrice: 'totalPrice',
      })
      isCartAdded = true
    }
  }
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  renderInfoAccount({
    idElement: 'accountUser',
    infoUserStorage,
    divInfoLeft: 'listOrderUser',
  })
  renderListOrder({
    idTable: 'listOrderUser',
    infoUserStorage,
  })
  handleOnClick()
})()
