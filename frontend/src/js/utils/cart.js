import productApi from '../api/productsApi'
import { formatCurrencyNumber } from './format'

export async function addCartToDom({ idListCart, cart, userID, idNumOrder, idNum, idTotalPrice }) {
  const listCartElement = document.getElementById(idListCart)
  const idNumOrderEl = document.getElementById(idNumOrder)
  const idNumEl = document.querySelector(idNum)
  const idTotalPriceEl = document.getElementById(idTotalPrice)
  if (!listCartElement || !idNumOrderEl || !idNumEl || !idTotalPriceEl) return
  listCartElement.innerHTML = ''
  let totalQuantity = 0
  let totalPrice = 0
  try {
    const listProduct = await productApi.getAll()
    cart?.forEach((item) => {
      if (item.userID === userID) {
        totalQuantity += item.quantity
        const liElement = document.createElement('li')
        liElement.classList.add('clearfix')
        const productIndex = listProduct.findIndex((x) => +x.id === item.productID)
        const productInfo = listProduct[productIndex]
        liElement.innerHTML = `<a href="" title="" class="thumb fl-left">
      <img src="public/images/${productInfo.thumb}" alt="${productInfo.name}" />
      </a>
      <div class="info fl-right">
        <a href="" title="" class="product-name">${productInfo.name}</a>
        <p class="price">${formatCurrencyNumber(
          (productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100,
        )}</p>
        <p class="qty">Số lượng: <span>${item.quantity}</span></p>
      </div>`
        listCartElement.appendChild(liElement)
        totalPrice =
          totalPrice +
          item.quantity *
            ((productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100)
      }
    })
    idNumOrderEl.innerHTML = `Có <span>${totalQuantity} sản phẩm</span> trong giỏ hàng`
    idNumEl.textContent = totalQuantity
    idTotalPriceEl.innerHTML = `${formatCurrencyNumber(totalPrice)}`
  } catch (error) {
    console.log('error', error)
  }
}
export function addProductToCart(productID, cart, infoUserStorage, quantity) {
  if (infoUserStorage.length === 1) {
    let cartItemIndex = cart.findIndex(
      (x) => x.productID === productID && x.userID === infoUserStorage[0].user_id,
    )
    if (cart.length <= 0) {
      cart = [
        {
          productID,
          quantity: quantity,
          userID: infoUserStorage[0].user_id,
        },
      ]
    } else if (cartItemIndex < 0) {
      cart.push({
        productID,
        quantity: quantity,
        userID: infoUserStorage[0].user_id,
      })
    } else {
      cart[cartItemIndex].quantity += quantity
    }
    addCartToDom({
      idListCart: 'listCart',
      cart,
      userID: infoUserStorage[0].user_id,
      idNumOrder: 'numOrder',
      idNum: '#num.numDesktop',
      idTotalPrice: 'totalPrice',
    })
  } else {
    const user = infoUserStorage.find((item) => item.roleID === 1)
    if (user) {
      let cartItemIndex = cart.findIndex(
        (x) => x.productID === productID && x.userID === user.user_id,
      )
      if (cart.length <= 0) {
        cart = [
          {
            productID,
            quantity: quantity,
            userID: user.user_id,
          },
        ]
      } else if (cartItemIndex < 0) {
        cart.push({
          productID,
          quantity: quantity,
          userID: user.user_id,
        })
      } else {
        cart[cartItemIndex].quantity += quantity
      }
    }
    addCartToDom({
      idListCart: 'listCart',
      cart,
      userID: user.user_id,
      idNumOrder: 'numOrder',
      idNum: '#num.numDesktop',
      idTotalPrice: 'totalPrice',
    })
  }
  addCartToStorage(cart)
  return cart
}
export function handleChangeQuantity(inputValue, cart, userID, productID) {
  const index = cart.findIndex((item) => +item.productID === productID && item.userID === userID)
  if (index >= 0) cart[index].quantity = inputValue
  addCartToStorage(cart)
  return cart
}
export function addCartToStorage(cartCopy) {
  localStorage.setItem('cart', JSON.stringify(cartCopy))
}
