const { default: productApi } = await import('./api/productsApi')
import {
  formatCurrencyNumber,
  hideSpinner,
  showSpinner,
  renderListCategory,
  addCartToDom,
  addProductToCart,
  sweetAlert,
  displaySwiper,
  toast,
  initSearchForm,
  calcPrice,
  renderListProductSeller,
} from './utils'

async function renderListProductWithName({ idElement, tagName }) {
  const ulElement = document.querySelector(idElement)
  if (!ulElement) return
  ulElement.textContent = ''
  try {
    showSpinner()
    const data = await productApi.getByCatalog(tagName)
    hideSpinner()
    const { products } = data
    const productsSlice = products.slice(0, 8)
    if (productsSlice) {
      productsSlice.forEach((item) => {
        const liElement = document.createElement('li')
        liElement.dataset.id = item.id
        liElement.innerHTML = `
        <div class='product-sale'>
          <span>${item.discount}%</span>
        </div>
        <a href="product-detail.html?id=${item._id}" title="${item.name}" class="thumb">
        <img src="${item.thumb.fileName}" alt="${item.name}" />
        </a>
        <a href="product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
          item.name
        }</a>
        <div class="price" style="display: flex;">
          <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
          <span class="old">${formatCurrencyNumber(item.price)}</span>
        </div>
        <div class="action clearfix">
          <a href="cart.html" title="Thêm giỏ hàng" data-id=${
            item._id
          } class="add-cart fl-left">Thêm giỏ hàng</a>
          <a href="checkout.html" data-id=${
            item._id
          } title="Mua ngay" class="buy-now fl-right">Mua ngay</a>
        </div>`
        ulElement.appendChild(liElement)
      })
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

// main
;(async () => {
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
        idNumOrder: 'numOrder',
        idNum: '#num.numDesktop',
        idTotalPrice: 'totalPrice',
      })
      isCartAdded = true
    }
  }
  await renderListCategory('#listCategory')
  await renderListProductSeller('#listItemSeller')
  await displaySwiper('.swiper-wrapper')
  await renderListProductWithName({
    idElement: '#listProductPhone',
    tagName: 'dien-thoai',
  })
  await renderListProductWithName({
    idElement: '#listProductLaptop',
    tagName: 'laptop',
  })
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  // event delegations
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('.add-cart')) {
      e.preventDefault()
      const productID = target.dataset.id
      if (productID) {
        sweetAlert.success('Tuyệt vời!')
        cart = addProductToCart(productID, cart, infoUserStorage, 1)
      }
    } else if (target.matches('.buy-now')) {
      e.preventDefault()
      if (infoUserStorage && Object.keys(infoUserStorage).length > 0) {
        const productID = target.dataset.id
        showSpinner()
        const data = await productApi.getById(productID)
        const { product } = data
        hideSpinner()
        const priceProduct = calcPrice(product)
        if (productID) {
          cart = addProductToCart(productID, cart, infoUserStorage, 1)
          // set status buy now for product if user click buy now button in ui
          for (const item of cart) {
            if (item.productID === productID) {
              item['isBuyNow'] = true
              item['isChecked'] = true
              item['price'] = priceProduct
            }
          }
          localStorage.setItem('cart', JSON.stringify(cart))
          window.location.assign('/checkout.html')
        }
      } else {
        toast.error('Đăng nhập để mua sản phẩm')
        return
      }
    }
  })
})()
