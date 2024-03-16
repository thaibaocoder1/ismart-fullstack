import productApi from './api/productsApi'
import {
  formatCurrencyNumber,
  handleChangeQuantity,
  hideSpinner,
  initSearchForm,
  showSpinner,
  sweetAlert,
  toast,
} from './utils'

async function addCartToDom({ idListCart, cart, userID, idNumOrder, idNum, idTotalPrice }) {
  const listCartElement = document.getElementById(idListCart)
  const idNumOrderEl = document.getElementById(idNumOrder)
  const idNumEl = document.querySelector(idNum)
  const idTotalPriceEl = document.getElementById(idTotalPrice)
  if (!listCartElement || !idNumOrderEl || !idNumEl || !idTotalPriceEl) return
  listCartElement.textContent = ''
  let totalQuantity = 0
  let totalPrice = 0
  try {
    const listProduct = await productApi.getAll()
    cart.forEach((item) => {
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

function updateTotal(checkedProducts) {
  let totalTemp
  if (checkedProducts.length > 0) {
    totalTemp = checkedProducts.reduce((total, item) => {
      return total + item.quantity * item.price
    }, 0)
  } else {
    totalTemp = 0
  }
  document.getElementById('total-price').innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(
    totalTemp,
  )}</span>`
}

async function renderListProductInCart({ idTable, cart, idTotalPrice, infoUserStorage }) {
  const tableElement = document.getElementById(idTable)
  if (!tableElement) return
  const tableBodyElement = tableElement.getElementsByTagName('tbody')[0]
  tableBodyElement.textContent = ''
  if (tableBodyElement) {
    showSpinner()
    const products = await productApi.getAll()
    hideSpinner()
    let checkedProducts = cart.filter((item) => item.isChecked)
    updateTotal(checkedProducts)
    cart?.forEach((item) => {
      if (+item.userID === +infoUserStorage.user_id) {
        const tableRowElement = document.createElement('tr')
        const productIndex = products.findIndex((x) => +x.id === item.productID)
        const productInfo = products[productIndex]
        tableRowElement.innerHTML = `
        <td>
        <input type="checkbox" name="product" class="checkbox2" data-id="${
          item.productID
        }" data-price=${
          (productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100
        } value="${
          ((productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100) *
          item.quantity
        }" ${item.isChecked === true ? 'checked' : ''} />
        </td>
        <td>${productInfo.code}</td>
        <td>
          <a href="" title="" class="thumb">
            <img src="public/images/${productInfo.thumb}" alt="${productInfo.name}" />
          </a>
        </td>
        <td>
          <a href="/product-detail.html?id=${productInfo.id}" title="" class="name-product">${
          productInfo.name
        }</a>
        </td>
        <td>${formatCurrencyNumber(
          (productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100,
        )}</td>
        <td>
          <input min="1" data-id="${item.productID}" type="number" name="num-order" value="${
          item.quantity
        }" class="num-order" />
        </td>
        <td id="priceProduct">${formatCurrencyNumber(
          ((productInfo.price * (100 - Number.parseInt(productInfo.discount))) / 100) *
            item.quantity,
        )}</td>
        <td>
          <a href="" data-id="${
            item.productID
          }" title="" class="del-product"><i class="fa fa-trash-o"></i></a>
        </td>`
        tableBodyElement.appendChild(tableRowElement)
      }
    })
  }
}

// main
;(() => {
  // get cart from storage
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
          renderListProductInCart({
            idTable: 'tableCart',
            cart,
            idTotalPrice: 'total-price',
            infoUserStorage: infoUserStorage[0],
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
            renderListProductInCart({
              idTable: 'tableCart',
              cart,
              idTotalPrice: 'total-price',
              infoUserStorage: user,
            })
            isCartAdded = true
          }
        }
      }
    })
  } else {
    document.getElementById('btn-remove-product').hidden = true
  }
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  document.addEventListener('click', async function (e) {
    if (e.target.matches('#btn-buy-product')) {
      window.location.assign('/products.html')
    } else if (e.target.matches('#btn-remove-product')) {
      let newCart
      sweetAlert.error('Xoá toàn bộ giỏ hàng?')
      cart?.forEach(async (item) => {
        if (infoUserStorage.length === 1) {
          if (+item.userID === +infoUserStorage[0].user_id) {
            newCart = cart.filter((x) => x.userID !== +infoUserStorage[0].user_id)
            localStorage.setItem('cart', JSON.stringify(newCart))
          } else {
            const user = infoUserStorage.find((user) => user?.roleID === 1)
            if (user) {
              newCart = cart.filter((x) => x.userID !== +user.user_id)
              localStorage.setItem('cart', JSON.stringify(newCart))
            }
          }
        }
        const tableCartElement = document.getElementById('tableCart')
        const tbodyElement = tableCartElement.getElementsByTagName('tbody')[0]
        while (tbodyElement.firstChild) {
          tbodyElement.removeChild(tbodyElement.firstChild)
        }
        document.getElementById('btn-remove-product').hidden = true
      })
    } else if (e.target.matches('#checkout-cart')) {
      e.preventDefault()
      const listCheckbox = document.querySelectorAll("input[type='checkbox']")
      let isAnyCheckboxChecked = false
      if (cart.length === 0) {
        toast.error('Không có sản phẩm trong giỏ hàng')
      } else {
        listCheckbox.forEach((checkbox) => {
          if (checkbox.checked) {
            isAnyCheckboxChecked = true
            window.location.assign('/checkout.html')
          }
        })
        if (!isAnyCheckboxChecked) toast.error('Chọn 1 sản phẩm để thanh toán')
      }
    } else if (e.target.closest('.del-product')) {
      e.preventDefault()
      const productID = +e.target.closest('.del-product').dataset.id
      const productIndex = cart.findIndex((item) => +item.productID === productID)
      if (productIndex >= 0) {
        toast.info('Xoá sản phẩm thành công')
        cart.splice(productIndex, 1)
        localStorage.setItem('cart', JSON.stringify(cart))
        e.target.parentElement.parentElement.parentElement.remove()
        populateNewData()
        let totalTemp = 0
        if (cart.length > 0) {
          for (const item of cart) {
            if (item.isChecked || item.isBuyNow) {
              totalTemp = cart.reduce((total, item) => {
                return total + item.quantity * item.price
              }, 0)
            } else {
              totalTemp = 0
            }
          }
        }
        if (infoUserStorage.length === 1) {
          await addCartToDom({
            idListCart: 'listCart',
            cart,
            userID: infoUserStorage[0].user_id,
            idNumOrder: 'numOrder',
            idNum: '#num.numDesktop',
            idTotalPrice: 'totalPrice',
          })
        } else {
          const user = infoUserStorage.find((user) => user?.roleID === 1)
          if (user) {
            await addCartToDom({
              idListCart: 'listCart',
              cart,
              userID: user.user_id,
              idNumOrder: 'numOrder',
              idNum: '#num.numDesktop',
              idTotalPrice: 'totalPrice',
            })
          }
        }
        const totalPriceEl = document.getElementById('total-price')
        if (totalPriceEl) {
          totalPriceEl.innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(
            totalTemp,
          )}</span>`
        }
        if (cart.length === 0) {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }
    } else if (e.target.matches("input[type='number'].num-order")) {
      const inputValue = parseInt(+e.target.value, 10)
      const productID = +e.target.dataset.id
      const index = cart.findIndex((item) => +item.productID === productID)
      const product = await productApi.getById(productID)
      if (isNaN(inputValue) || inputValue < 0) {
        toast.error('Không được chỉnh về số âm')
      }
      if (infoUserStorage.length === 1) {
        cart = handleChangeQuantity(inputValue, cart, infoUserStorage.user_id, productID)
        await addCartToDom({
          idListCart: 'listCart',
          cart,
          userID: infoUserStorage.user_id,
          idNumOrder: 'numOrder',
          idNum: '#num.numDesktop',
          idTotalPrice: 'totalPrice',
        })
      } else {
        const user = infoUserStorage.find((user) => user?.roleID === 1)
        if (user) {
          cart = handleChangeQuantity(inputValue, cart, user.user_id, productID)
          await addCartToDom({
            idListCart: 'listCart',
            cart,
            userID: user.user_id,
            idNumOrder: 'numOrder',
            idNum: '#num.numDesktop',
            idTotalPrice: 'totalPrice',
          })
        }
      }
      const productPrice = e.target.parentElement.parentElement.querySelector('#priceProduct')
      productPrice.innerHTML = `${formatCurrencyNumber(
        cart[index].quantity * ((product.price * (100 - Number.parseInt(product.discount))) / 100),
      )}`
      const totalPriceEl =
        e.target.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
          '#total-price',
        )
      const checkedProductEl =
        e.target.parentElement.parentElement.querySelector("input[name='product']")
      let totalPayment = 0
      for (const item of cart) {
        if (item.isChecked || item.isBuyNow) {
          totalPayment += item.quantity * +item.price
        }
      }
      if (totalPriceEl) {
        for (const item of cart) {
          if (item.productID === productID) {
            const newValue = item.quantity * +checkedProductEl.dataset.price
            checkedProductEl.value = newValue
            if (item.isChecked || item.isBuyNow) {
              totalPayment += newValue - item.quantity * +item.price
              item.price = +checkedProductEl.dataset.price
              totalPriceEl.innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(
                totalPayment,
              )}</span>`
            }
          }
        }
      }
    } else if (e.target.matches("input[name='product']")) {
      const cartFromStorage = JSON.parse(localStorage.getItem('cart'))

      let checkedProducts = cartFromStorage.filter((item) => item.isChecked)
      let totalTemp
      function updateTotal() {
        if (checkedProducts.length > 0) {
          totalTemp = checkedProducts.reduce((total, item) => {
            return total + item.quantity * item.price
          }, 0)
        } else {
          totalTemp = 0
        }
        document.getElementById(
          'total-price',
        ).innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(totalTemp)}</span>`
      }
      updateTotal()

      const checkbox = e.target

      const priceProduct = +checkbox.value
      const productID = +checkbox.dataset.id
      const existingProduct = checkedProducts.find((item) => item.productID === productID)

      if (checkbox.checked) {
        if (!existingProduct) {
          const newItem = cartFromStorage.find((item) => item.productID === productID)
          checkedProducts.push(newItem)
        }
        totalTemp += priceProduct
      } else {
        totalTemp -= existingProduct ? existingProduct.quantity * existingProduct.price : 0

        if (existingProduct) {
          checkedProducts = checkedProducts.filter((item) => item.productID !== productID)
        }
      }

      const newCart = cartFromStorage.filter((item) => {
        if (item.productID === productID) {
          item.isChecked = checkbox.checked
          item.price = +checkbox.dataset.price
        }
        return item
      })

      localStorage.setItem('cart', JSON.stringify(newCart))
      updateTotal()
    }
  })
})()
