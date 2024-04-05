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
import { checkLoginUser } from './utils/get-user'

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

async function renderListProductInCart({ idTable, cart }) {
  const tableElement = document.getElementById(idTable)
  if (!tableElement) return
  const tableBodyElement = tableElement.getElementsByTagName('tbody')[0]
  tableBodyElement.textContent = ''
  if (tableBodyElement) {
    showSpinner()
    const data = await productApi.getAll()
    hideSpinner()
    const { products: listProduct } = data
    let checkedProducts = cart.filter((item) => item.isChecked)
    updateTotal(checkedProducts)
    cart?.forEach((item) => {
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
            <img src="${productInfo.thumb.fileName}" alt="${productInfo.name}" />
          </a>
        </td>
        <td>
          <a href="/product-detail.html?id=${productInfo._id}" title="" class="name-product">${
        productInfo.name
      }</a>
        </td>
        <td>${formatCurrencyNumber(calcPrice(productInfo))}</td>
        <td>
          <input data-id="${item.productID}" type="number" name="num-order" value="${
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
    })
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
      renderListProductInCart({
        idTable: 'tableCart',
        cart,
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
        title: 'Xoá toàn bộ giỏ hàng?',
        text: 'Hành động này sẽ khiến tất cả sản phẩm bị xoá!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Huỷ bỏ',
        dangerMode: true,
      }).then(function (result) {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Xoá thành công!',
            text: 'Vào shop để chọn lại sản phẩm khác!',
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
          }
        })
        if (isAnyCheckboxChecked) {
          if (Object.keys(infoUserStorage).length > 0) {
            window.location.assign('checkout.html')
          } else {
            toast.error('Đăng nhập để thanh toán')
            setTimeout(() => {
              window.location.assign('/login.html')
            }, 500)
          }
        } else {
          toast.error('Chọn ít nhất một sản phẩm để thanh toán')
        }
      }
    } else if (e.target.closest('.del-product')) {
      e.preventDefault()
      const productID = e.target.closest('.del-product').dataset.id
      const productIndex = cart.findIndex((item) => item.productID === productID)
      const checkedProducts = cart.filter((item) => item.isChecked)
      if (productIndex >= 0) {
        Swal.fire({
          title: 'Xoá sản phẩm này?',
          text: 'Sản phẩm sẽ bị xoá khỏi giỏ hàng!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Huỷ bỏ',
        }).then(function (result) {
          if (result.isConfirmed) {
            Swal.fire({
              title: 'Xoá thành công sản phẩm!',
              text: 'Vào shop để chọn lại sản phẩm khác!',
              icon: 'success',
            }).then(async function () {
              cart.splice(productIndex, 1)
              localStorage.setItem('cart', JSON.stringify(cart))
              e.target.parentElement.parentElement.parentElement.remove()
              await addCartToDom({
                idListCart: 'listCart',
                cart,
                idNumOrder: 'numOrder',
                idNum: '#num.numDesktop',
                idTotalPrice: 'totalPrice',
              })
              updateTotal(checkedProducts)
              if (cart.length === 0) {
                toast.info('Giỏ hàng trống')
                setTimeout(() => {
                  window.location.reload()
                }, 500)
              }
            })
          }
        })
      }
    } else if (e.target.matches("input[type='number'].num-order")) {
      const inputValue = parseInt(+e.target.value, 10)
      console.log(inputValue)
      const productID = e.target.dataset.id
      const index = cart.findIndex((item) => item.productID === productID)
      const data = await productApi.getById(productID)
      const { product } = data
      const checkedProducts = cart.filter((item) => item.isChecked)
      if (inputValue === 0) {
        Swal.fire({
          title: 'Xoá sản phẩm này?',
          text: 'Sản phẩm sẽ bị xoá khỏi giỏ hàng!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Huỷ bỏ',
        }).then(function (result) {
          if (result.isConfirmed) {
            Swal.fire({
              title: 'Xoá thành công sản phẩm!',
              text: 'Vào shop để chọn lại sản phẩm khác!',
              icon: 'success',
            }).then(async function () {
              cart.splice(index, 1)
              e.target.parentElement.parentElement.remove()
              localStorage.setItem('cart', JSON.stringify(cart))
              updateTotal(checkedProducts)
              await addCartToDom({
                idListCart: 'listCart',
                cart,
                idNumOrder: 'numOrder',
                idNum: '#num.numDesktop',
                idTotalPrice: 'totalPrice',
              })
              if (cart.length === 0) {
                toast.info('Giỏ hàng trống')
                setTimeout(() => {
                  window.location.reload()
                }, 500)
              }
            })
          } else {
            e.target.value = 1
          }
        })
      }
      if (inputValue >= 1 && inputValue <= +product.quantity) {
        cart = handleChangeQuantity(inputValue, cart, productID)
        await addCartToDom({
          idListCart: 'listCart',
          cart,
          idNumOrder: 'numOrder',
          idNum: '#num.numDesktop',
          idTotalPrice: 'totalPrice',
        })
        updateTotal(checkedProducts)
        const productPrice = e.target.parentElement.parentElement.querySelector('#priceProduct')
        productPrice.innerHTML = `${formatCurrencyNumber(
          cart[index].quantity * calcPrice(product),
        )}`
      } else {
        toast.error('Số lượng đặt mua đã đạt tối đa')
        e.target.value = product.quantity
      }
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
    } else if (e.target.matches("input[name='product']")) {
      const cartFromStorage = JSON.parse(localStorage.getItem('cart'))
      let checkedProducts = cartFromStorage.filter((item) => item.isChecked)
      let totalTemp
      function updateTotalInner() {
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
      updateTotalInner()

      const checkbox = e.target
      const priceProduct = +checkbox.value
      const productID = checkbox.dataset.id

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
      updateTotalInner()
    }
  })
})()
