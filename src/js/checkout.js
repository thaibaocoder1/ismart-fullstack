import orderApi from './api/orderApi'
import orderDetailApi from './api/orderDetailApi'
import productApi from './api/productsApi'
import {
  addCartToDom,
  calcPrice,
  formatCurrencyNumber,
  hideSpinner,
  initFormCheckout,
  initSearchForm,
  showSpinner,
  toast,
} from './utils'
import { checkLoginUser } from './utils/get-user'

function filterCart(cart) {
  if (!cart || cart.length === 0) return
  let cartApply = []
  for (const item of cart) {
    if (item.isBuyNow) {
      if (item.isChecked) {
        cartApply.push(item)
      } else {
        continue
      }
    } else {
      if (item.isChecked) {
        cartApply.push(item)
      } else {
        continue
      }
    }
  }
  return cartApply
}
function displayProductInCart({ idTable, idTotalPrice, cart, userID }) {
  const tableElement = document.getElementById(idTable)
  if (!tableElement) return
  const tableBodyEl = tableElement.getElementsByTagName('tbody')[0]
  if (!tableBodyEl) return
  tableBodyEl.textContent = ''
  let totalPrice = 0
  try {
    const cartApply = filterCart(cart)
    cartApply?.forEach(async (item) => {
      if (item.isBuyNow || item.isChecked) {
        showSpinner()
        const data = await productApi.getById(item.productID)
        hideSpinner()
        const { product } = data
        totalPrice += calcPrice(product) * item.quantity
        const tableRow = document.createElement('tr')
        tableRow.dataset.id = +item.productID
        tableRow.classList.add('cart-item')
        tableRow.innerHTML = `<td class="product-name">${
          product.name
        }<strong class="product-quantity">x ${item.quantity}</strong>
        </td>
        <td class="product-total">${formatCurrencyNumber(calcPrice(product))}</td>`
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
  if (orderData.success) {
    orderID = orderData.data._id
  }
  let cartApply = filterCart(cart)
  for (const item of cartApply) {
    const product = await productApi.getById(item.productID)
    const remainingQuantity = Number.parseInt(product.quantity)
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
      let product = {}
      const data = await productApi.getById(item.productID)
      if (data) {
        product = data.product
      }
      item['orderID'] = orderID
      item['price'] = calcPrice(product)
      const payload = {
        id: item.productID,
        quantity: Number.parseInt(product.quantity) - Number.parseInt(item.quantity),
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
    formValues['status'] = 1
    const res = await orderApi.getAll()
    if (res.success) {
      const { orders } = res
      if (Array.isArray(orders)) {
        if (orders.length === 0) {
          isOrder = await handleAddOrder(orderID, formValues, cart)
          orderID = null
        } else if (orders.length > 0) {
          isOrder = await handleAddOrder(orderID, formValues, cart)
          orderID = null
        }
        if (isOrder) {
          const newCart = cart.filter((item) => {
            if (item.isChecked || item.isBuyNow) return false
            return true
          })
          toast.success('Thanh toán thành công')
          localStorage.setItem('cart', JSON.stringify(newCart))
          setTimeout(() => {
            window.location.assign('/order.html')
          }, 500)
        }
      }
    }
  } catch (error) {
    toast.error(Error.name)
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
      initFormCheckout({
        idForm: '#formCheckout',
        cart,
        infoUserStorage,
        onSubmit: handleCheckoutFormSubmit,
      })
      displayProductInCart({
        idTable: 'tableCheckout',
        idTotalPrice: '#totalPriceCheckout',
        cart,
        userID: infoUserStorage.id,
      })
      isCartAdded = true
    }
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
})()
