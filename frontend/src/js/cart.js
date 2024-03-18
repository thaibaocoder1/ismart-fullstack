import productApi from './api/productsApi'
import {
  addCartToDom,
  calcPrice,
  formatCurrencyNumber,
  handleChangeQuantity,
  hideSpinner,
  initSearchForm,
  showSpinner,
  sweetAlert,
  toast,
} from './utils'
import Swal from 'sweetalert2'

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
  const totalPriceEl = document.getElementById(idTotalPrice)
  if (!tableElement || !totalPriceEl) return
  const tableBodyElement = tableElement.getElementsByTagName('tbody')[0]
  tableBodyElement.textContent = ''
  if (tableBodyElement) {
    showSpinner()
    const data = await productApi.getAll()
    hideSpinner()
    const { products: listProduct } = data
    let checkedProducts = cart.filter((item) => item.isChecked)
    updateTotal(checkedProducts)
    let total = 0
    cart?.forEach((item) => {
      if (item.userID === infoUserStorage.id) {
        const tableRowElement = document.createElement('tr')
        const productIndex = listProduct.findIndex((x) => x._id.toString() === item.productID)
        const productInfo = listProduct[productIndex]
        tableRowElement.innerHTML = `
        <td>
        <input type="checkbox" name="product" class="checkbox2" data-id="${
          item.productID
        }" data-price=${calcPrice(productInfo)} value="${calcPrice(productInfo) * item.quantity}" ${
          item.isChecked === true ? 'checked' : ''
        } />
        </td>
        <td>${productInfo.code}</td>
        <td>
          <a href="product-detail.html?id=${productInfo._id}" title="${
          productInfo.name
        }" class="thumb">
            <img src="/images/${productInfo.thumb.fileName}" alt="${productInfo.name}" />
          </a>
        </td>
        <td>
          <a href="/product-detail.html?id=${productInfo._id}" title="" class="name-product">${
          productInfo.name
        }</a>
        </td>
        <td>${formatCurrencyNumber(calcPrice(productInfo))}</td>
        <td>
          <input min="1" data-id="${item.productID}" type="number" name="num-order" value="${
          item.quantity
        }" class="num-order" />
        </td>
        <td id="priceProduct">${formatCurrencyNumber(calcPrice(productInfo) * item.quantity)}</td>
        <td>
          <a href="" data-id="${
            item.productID
          }" title="" class="del-product"><i class="fa fa-trash-o"></i></a>
        </td>`
        tableBodyElement.appendChild(tableRowElement)
        total += item.quantity * calcPrice(productInfo)
        totalPriceEl.innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(total)}</span>`
      }
    })
  }
}

// main
;(() => {
  // get cart from localStorage
  let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  let infoUserStorage = localStorage.getItem('accessToken')
    ? JSON.parse(localStorage.getItem('accessToken'))
    : {}
  let isCartAdded = false
  if (Array.isArray(cart) && cart.length > 0) {
    if (!isCartAdded) {
      addCartToDom({
        idListCart: 'listCart',
        cart,
        userID: infoUserStorage.id,
        idNumOrder: 'numOrder',
        idNum: '#num.numDesktop',
        idTotalPrice: 'totalPrice',
      })
      renderListProductInCart({
        idTable: 'tableCart',
        cart,
        idTotalPrice: 'total-price',
        infoUserStorage,
      })
      isCartAdded = true
    }
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
      const tableCartElement = document.getElementById('tableCart')
      const tbodyElement = tableCartElement.getElementsByTagName('tbody')[0]
      const totalPriceEl = document.getElementById('total-price')

      Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this imaginary file!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        dangerMode: true,
      }).then(function (result) {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Shortlisted!',
            text: 'Candidates are successfully shortlisted!',
            icon: 'success',
          }).then(function () {
            localStorage.removeItem('cart')

            while (tbodyElement.firstChild) {
              tbodyElement.removeChild(tbodyElement.firstChild)
            }
            totalPriceEl.innerHTML = `Tổng thanh toán: <span>${formatCurrencyNumber(0)}</span>`
            document.getElementById('btn-remove-product').hidden = true
            window.location.reload()
          })
        }
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
