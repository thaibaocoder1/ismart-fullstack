import productApi from '../api/productsApi'
import { calcPrice, formatCurrencyNumber } from './format'

export async function addCartToDom({ idListCart, cart, idNumOrder, idNum, idTotalPrice }) {
  const listCartElement = document.getElementById(idListCart)
  const idNumOrderEl = document.getElementById(idNumOrder)
  const idNumEl = document.querySelector(idNum)
  const idTotalPriceEl = document.getElementById(idTotalPrice)
  if (!listCartElement || !idNumOrderEl || !idNumEl || !idTotalPriceEl) return
  listCartElement.innerHTML = ''
  let totalQuantity = 0
  let totalPrice = 0
  try {
    const data = await productApi.getAll()
    const { products: listProduct } = data
    cart?.forEach((item) => {
      totalQuantity += item.quantity
      const liElement = document.createElement('li')
      liElement.classList.add('clearfix')
      const productIndex = listProduct.findIndex((x) => x._id.toString() === item.productID)
      const productInfo = listProduct[productIndex]
      liElement.innerHTML = `<a href="product-detail.html?id=${item._id}" title="${
        productInfo.name
      }" class="thumb fl-left">
        <img src="${productInfo.thumb.fileName}" alt="${productInfo.name}" />
        </a>
        <div class="info fl-right">
          <a href="product-detail.html?id=${item._id}" title="${
        productInfo.name
      }" class="product-name">${productInfo.name}</a>
          <p class="price">${formatCurrencyNumber(calcPrice(productInfo))}</p>
          <p class="qty">Số lượng: <span>${item.quantity}</span></p>
        </div>`
      listCartElement.appendChild(liElement)
      totalPrice += item.quantity * calcPrice(productInfo)
    })
    idNumOrderEl.innerHTML = `Có <span>${totalQuantity} sản phẩm</span> trong giỏ hàng`
    idNumEl.textContent = totalQuantity
    idTotalPriceEl.innerHTML = `${formatCurrencyNumber(totalPrice)}`
  } catch (error) {
    console.log('Error', error)
  }
}
export function addProductToCart(productID, cart, infoUserStorage, quantity) {
  if (infoUserStorage) {
    let cartItemIndex = cart.findIndex((x) => x.productID === productID)
    if (cart.length <= 0) {
      cart = [
        {
          productID,
          quantity: quantity,
          userID: infoUserStorage.id,
        },
      ]
    } else if (cartItemIndex < 0) {
      cart.push({
        productID,
        quantity: quantity,
        userID: infoUserStorage.id,
      })
    } else {
      cart[cartItemIndex].quantity += quantity
    }
  }
  addCartToDom({
    idListCart: 'listCart',
    cart,
    idNumOrder: 'numOrder',
    idNum: '#num.numDesktop',
    idTotalPrice: 'totalPrice',
  })
  addCartToStorage(cart)
  return cart
}
export function handleChangeQuantity(inputValue, cart, productID) {
  const index = cart.findIndex((item) => item.productID === productID)
  if (index >= 0) {
    cart[index].quantity = inputValue
    addCartToStorage(cart)
  }
  return cart
}
export function addCartToStorage(cart) {
  localStorage.setItem('cart', JSON.stringify(cart))
}
