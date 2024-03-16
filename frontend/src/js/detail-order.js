import userApi from './api/userApi'
import orderDetailApi from './api/orderDetailApi'
import {
  addCartToDom,
  formatCurrencyNumber,
  hideSpinner,
  initSearchForm,
  showSpinner,
  toast,
} from './utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import productApi from './api/productsApi'
dayjs.extend(relativeTime)
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
  if (infoUserStorage.length === 0) {
    divInfoLeftEl.classList.add('is-hide')
    userAvatarEl.classList.add('is-hide')
  }
  for (const user of infoUserStorage) {
    if (user.access_token) {
      displayTagLink(ulElement)
    }
    break
  }
}

function handleOnClick() {
  // add event for element render after dom
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches("a[title='Đăng xuất']")) {
      const infoUserStorage = JSON.parse(localStorage.getItem('user_info'))
      if (infoUserStorage.length === 1) {
        localStorage.removeItem('user_info')
      } else {
        infoUserStorage.splice(0, 1)
        localStorage.setItem('user_info', JSON.stringify(infoUserStorage))
      }
      toast.info('Chuyển đến trang đăng nhập')
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 2000)
    } else if (target.matches("a[title='Cập nhật thông tin']")) {
      window.location.assign('/update-info.html')
    } else if (target.matches("a[title='Quản lý đơn hàng']")) {
      window.location.assign('/order.html')
    } else if (target.matches('#orderDetail')) {
      const orderID = +target.dataset.id
      window.location.assign(`/detail-order.html?id=${orderID}`)
    }
  })
}

function displayStatus(status) {
  if (!status) return
  if (+status !== 1) {
    return 'hidden'
  }
  return ''
}

async function renderListOrder({ idTable, infoUserStorage, orderID }) {
  const table = document.getElementById(idTable)
  if (!table) return
  const tbodyEl = table.getElementsByTagName('tbody')[0]
  if (!tbodyEl) return
  try {
    showSpinner()
    const orderDetail = await orderDetailApi.getAll()
    hideSpinner()
    if (infoUserStorage.length === 1) {
      const user = infoUserStorage[0]
      const listOrderApply = orderDetail.filter((order) => order.orderID === orderID)
      if (listOrderApply.length === 0) {
        toast.info('Bạn chưa mua đơn hàng nào')
        return
      }
      listOrderApply.forEach(async (item, index) => {
        const infoProduct = await productApi.getById(item.productID)
        const tableRow = document.createElement('tr')
        const price =
          infoProduct.price * ((100 - Number.parseInt(infoProduct.discount)) / 100) * item.quantity
        tableRow.innerHTML = `<th scope="row">${index + 1}</th>
        <td>${item.orderID}</td>
        <td>${item.userID}</td>
        <td><a href="/product-detail.html?id=${infoProduct.id}">${infoProduct.name}</a></td>
        <td>
          <img src="/public/images/${infoProduct.thumb}" alt="${
          infoProduct.name
        }" style="width: 150px;
          height: 150px; object-fit: cover;" />
        </td>
        <td>${formatCurrencyNumber(price)}</td>
        <td>${item.quantity}</td>
       `
        tbodyEl.appendChild(tableRow)
      })
    } else {
      const user = infoUserStorage.find((user) => user?.roleID === 1)
      if (user) {
        const listOrderApply = orderDetail.filter((order) => order.orderID === orderID)
        if (listOrderApply.length === 0) {
          toast.info('Bạn chưa mua đơn hàng nào')
          return
        }
        listOrderApply.forEach(async (item, index) => {
          const infoProduct = await productApi.getById(item.productID)
          const tableRow = document.createElement('tr')
          const price =
            infoProduct.price *
            ((100 - Number.parseInt(infoProduct.discount)) / 100) *
            item.quantity
          tableRow.innerHTML = `<th scope="row">${index + 1}</th>
        <td>${item.orderID}</td>
        <td>${item.userID}</td>
        <td><a href="/product-detail.html?id=${infoProduct.id}">${infoProduct.name}</a></td>
        <td>
          <img src="/public/images/${infoProduct.thumb}" alt="${
            infoProduct.name
          }" style="width: 150px;
          height: 150px; object-fit: cover;" />
        </td>
        <td>${formatCurrencyNumber(price)}</td>
        <td>${item.quantity}</td>
       `
          tbodyEl.appendChild(tableRow)
        })
      }
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
// main
;(() => {
  // get cart from localStorage
  let cart = localStorage.getItem('cart') !== null ? JSON.parse(localStorage.getItem('cart')) : []
  let infoUserStorage =
    localStorage.getItem('user_info') !== null ? JSON.parse(localStorage.getItem('user_info')) : []
  let isCartAdded = false
  if (Array.isArray(cart) && cart.length > 0) {
    cart.forEach((item) => {
      if (infoUserStorage.length === 1) {
        if (item.userID === infoUserStorage[0].user_id && !isCartAdded) {
          addCartToDom({
            idListCart: 'listCart',
            cart,
            userID: infoUserStorage[0].user_id,
            idNumOrder: 'numOrder',
            idNum: '#num.numDesktop',
            idTotalPrice: 'totalPrice',
          })
          isCartAdded = true
        }
      } else {
        const user = infoUserStorage.find((user) => user?.roleID === 1)
        if (user) {
          if (item.userID === user.user_id && !isCartAdded) {
            addCartToDom({
              idListCart: 'listCart',
              cart,
              userID: user.user_id,
              idNumOrder: 'numOrder',
              idNum: '#num.numDesktop',
              idTotalPrice: 'totalPrice',
            })
            isCartAdded = true
          }
        }
      }
    })
  }
  renderInfoAccount({
    idElement: 'accountUser',
    infoUserStorage,
    divInfoLeft: 'listOrderUser',
  })
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  const searchParams = new URLSearchParams(location.search)
  const orderID = +searchParams.get('id')
  if (orderID) {
    renderListOrder({
      idTable: 'listOrderUser',
      infoUserStorage,
      orderID,
    })
  }
  handleOnClick()
})()
