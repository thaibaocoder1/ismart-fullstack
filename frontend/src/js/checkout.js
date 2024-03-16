import orderApi from './api/orderApi'
import orderDetailApi from './api/orderDetailApi'
import productApi from './api/productsApi'
import {
  addCartToDom,
  formatCurrencyNumber,
  hideSpinner,
  initFormCheckout,
  initSearchForm,
  showSpinner,
  toast,
} from './utils'

function displayProductInCart({ idTable, idTotalPrice, cart, userID }) {
  const tableElement = document.getElementById(idTable)
  if (!tableElement) return
  const tableBodyEl = tableElement.getElementsByTagName('tbody')[0]
  if (!tableBodyEl) return
  tableBodyEl.textContent = ''
  let totalPrice = 0
  try {
    cart?.forEach(async (item) => {
      if (item.isBuyNow || (item.isChecked && item.userID === userID)) {
        showSpinner()
        const product = await productApi.getById(+item.productID)
        hideSpinner()
        totalPrice +=
          ((product.price * (100 - Number.parseInt(product.discount))) / 100) * item.quantity
        const tableRow = document.createElement('tr')
        tableRow.dataset.id = +item.productID
        tableRow.classList.add('cart-item')
        tableRow.innerHTML = `<td class="product-name">${
          product.name
        }<strong class="product-quantity">x ${item.quantity}</strong>
      </td>
      <td class="product-total">${formatCurrencyNumber(
        (product.price * (100 - Number.parseInt(product.discount))) / 100,
      )}</td>`
        tableBodyEl.appendChild(tableRow)
        const totalPriceEl = tableElement.querySelector(idTotalPrice)
        if (totalPriceEl) totalPriceEl.textContent = formatCurrencyNumber(totalPrice)
      }
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleAddOrder(orderID, formValues, cart) {
  let isOrder = true
  let isFlag = false
  const errorLog = {}
  const orderData = await orderApi.add(formValues)
  orderID = orderData.id
  let cartApply = cart.filter((item) => item.isChecked || item.isBuyNow)
  for (const item of cartApply) {
    const product = await productApi.getById(item.productID)
    const remainingQuantity = +product.quantity
    isOrder = item.quantity > remainingQuantity ? false : true
    if (isOrder === false) {
      isFlag = true
      errorLog['product'] = product
    }
  }
  if (isFlag) {
    toast.error(
      `Sản phẩm ${errorLog?.product.name} chỉ còn ${errorLog?.product.quantity}. Vui lòng kiểm tra lại số lượng`,
    )
    const tableRow = document.querySelector(
      `#tableCheckout tbody tr[data-id='${errorLog?.product.id}']`,
    )
    if (tableRow) {
      tableRow.classList.add('is-out-quantity')
      await orderApi.delete(orderID)
    }
  } else {
    for (const item of cartApply) {
      const product = await productApi.getById(item.productID)
      item['orderID'] = orderID
      item['price'] = (product.price * (100 - Number.parseInt(product.discount))) / 100
      const payload = {
        id: item.productID,
        quantity: +product.quantity - item.quantity,
      }
      await productApi.update(payload)
      await orderDetailApi.add(item)
    }
  }
  return isOrder
}
async function handleCheckoutFormSubmit(formValues, userID, cart) {
  let orderID = null
  let isOrder = null
  try {
    formValues['userID'] = userID
    formValues['orderDate'] = new Date().getTime()
    formValues['status'] = 1
    const listOrder = await orderApi.getAll()
    if (Array.isArray(listOrder)) {
      if (listOrder.length === 0) {
        isOrder = await handleAddOrder(orderID, formValues, cart)
        orderID = null
      } else if (listOrder.length > 0) {
        isOrder = await handleAddOrder(orderID, formValues, cart)
        orderID = null
      }
    }
    if (isOrder) {
      const newCart = cart.filter((item) => {
        if (item.userID === userID && (item.isChecked || item.isBuyNow)) return false
        return true
      })
      toast.success('Thanh toán thành công')
      localStorage.setItem('cart', JSON.stringify(newCart))
      setTimeout(() => {
        window.location.assign('/order.html')
      }, 2000)
    }
  } catch (error) {
    console.log('failed to checkout', error)
  }
}
// main
;(() => {
  let cart = localStorage.getItem('cart') !== null ? JSON.parse(localStorage.getItem('cart')) : []
  let infoUserStorage =
    localStorage.getItem('user_info') !== null ? JSON.parse(localStorage.getItem('user_info')) : []
  let isCartAdded = false
  if (Array.isArray(cart) && cart.length > 0) {
    cart.forEach((item) => {
      if (infoUserStorage.length === 1) {
        const infoUser = infoUserStorage[0]
        if (item.userID === infoUserStorage[0].user_id && !isCartAdded) {
          addCartToDom({
            idListCart: 'listCart',
            cart,
            userID: infoUserStorage[0].user_id,
            idNumOrder: 'numOrder',
            idNum: '#num.numDesktop',
            idTotalPrice: 'totalPrice',
          })
          initFormCheckout({
            idForm: '#formCheckout',
            cart,
            infoUserStorage: infoUser,
            onSubmit: handleCheckoutFormSubmit,
          })
          displayProductInCart({
            idTable: 'tableCheckout',
            idTotalPrice: '#totalPriceCheckout',
            cart,
            userID: infoUserStorage[0].user_id,
          })
          isCartAdded = true
        }
      } else {
        const user = infoUserStorage.find((user) => user.roleID === 1)
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
            initFormCheckout({
              idForm: '#formCheckout',
              cart,
              infoUserStorage: user,
              onSubmit: handleCheckoutFormSubmit,
            })
            displayProductInCart({
              idTable: 'tableCheckout',
              idTotalPrice: '#totalPriceCheckout',
              cart,
              userID: user.user_id,
            })
            isCartAdded = true
          }
        }
      }
    })
  } else {
    document.addEventListener('click', function (e) {
      const { target } = e
      if (target.matches('#order-now')) {
        e.preventDefault()
        toast.error('Không có sản phẩm trong giỏ hàng')
      }
    })
  }
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  document.addEventListener('DOMContentLoaded', function () {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`
        document.querySelector("input[name='address']").value = googleMapsLink
      },
      function (error) {
        toast.info('Bật vị trí để có thể nhập địa chỉ nhanh hơn')
      },
    )
  })
})()
