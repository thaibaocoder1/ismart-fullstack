import productApi from './api/productsApi'
import {
  formatCurrencyNumber,
  hideSpinner,
  showSpinner,
  renderListCategory,
  renderListProductWithCateID,
  addCartToDom,
  sweetAlert,
  addProductToCart,
  toast,
  initSearchForm,
  initFormFilter,
  initFilterPrice,
  calcPrice,
} from './utils'

async function renderListProduct({ selector, selectorCount, searchValueUrl }) {
  const ulElement = document.querySelector(selector)
  const countProductEl = document.querySelector(selectorCount)
  if (!ulElement || !countProductEl) return
  ulElement.textContent = ''
  try {
    showSpinner()
    const data = await productApi.getAll()
    hideSpinner()
    const { products } = data
    let dataApply = []
    if (searchValueUrl !== null) {
      dataApply = data.filter((item) =>
        item?.name.toLowerCase().includes(searchValueUrl.toLowerCase()),
      )
    }
    if (dataApply.length > 0) {
      dataApply.forEach((item) => {
        const liElement = document.createElement('li')
        liElement.dataset.id = item._id
        liElement.innerHTML = `
        <div class='product-sale'>
          <span>${item.discount}%</span>
        </div>
        <a href="product-detail.html?id=${item._id}" title="" class="thumb">
          <img src="/images/${item.thumb.fileName}" alt="${item.name}" />
        </a>
        <a href="/product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
          item.name
        }</a>
        <div class="price">
          <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
          <span class="old">${formatCurrencyNumber(item.price)}</span>
        </div>
        <div class="action clearfix action--custom">
          ${
            Number.parseInt(item.quantity) > 0 && Number.parseInt(item.status) === 1
              ? `<a href="cart.html" title="Thêm giỏ hàng" data-id=${item._id} class="add-cart fl-left">Thêm giỏ hàng</a>
                <a title="Mua ngay" data-id=${item._id} style="cursor: pointer;" class="buy-now fl-right">Mua ngay</a>`
              : `<span>Hết hàng</span>`
          }
        </div>`
        ulElement.appendChild(liElement)
      })
      countProductEl.innerHTML = `Hiển thị ${dataApply.length} trên ${dataApply.length} sản phẩm`
    } else {
      products.forEach((item) => {
        const liElement = document.createElement('li')
        liElement.dataset.id = item._id
        liElement.innerHTML = `
        <div class='product-sale'>
          <span>${item.discount}%</span>
        </div>
        <a href="product-detail.html?id=${item._id}" title="${item.name}" class="thumb">
          <img src="/images/${item.thumb.fileName}" alt="${item.name}" />
        </a>
        <a href="/product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
          item.name
        }</a>
        <div class="price">
          <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
          <span class="old">${formatCurrencyNumber(item.price)}</span>
        </div>
        <div class="action clearfix action--custom">
          ${
            Number.parseInt(item.quantity) > 0 && Number.parseInt(item.status) === 1
              ? `<a href="cart.html" title="Thêm giỏ hàng" data-id=${item._id} class="add-cart fl-left">Thêm giỏ hàng</a>
          <a title="Mua ngay" data-id=${item._id} style="cursor: pointer;" class="buy-now fl-right">Mua ngay</a>`
              : `<span>Hết hàng</span>`
          }
        </div>`
        ulElement.appendChild(liElement)
      })
      countProductEl.innerHTML = `Hiển thị ${data.results} trên ${data.results} sản phẩm`
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function renderListFilter(value) {
  const ulElement = document.querySelector('#listProduct')
  const countProductEl = document.querySelector('#countProduct')
  ulElement.textContent = ''
  value.forEach((item) => {
    const liElement = document.createElement('li')
    liElement.dataset.id = item._id
    liElement.innerHTML = `
    <div class='product-sale'>
      <span>${item.discount}%</span>
    </div>
    <a href="product-detail.html?id=${item._id}" title="" class="thumb">
      <img src="/images/${item.thumb.fileName}" alt="${item.name}" />
    </a>
    <a href="/product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
      item.name
    }</a>
    <div class="price">
      <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
      <span class="old">${formatCurrencyNumber(item.price)}</span>
    </div>
    <div class="action clearfix action--custom">
      ${
        Number.parseInt(item.quantity) > 0 && Number.parseInt(item.status) === 1
          ? `<a href="cart.html" title="Thêm giỏ hàng" data-id=${item._id} class="add-cart fl-left">Thêm giỏ hàng</a>
      <a title="Mua ngay" data-id=${item._id} style="cursor: pointer;" class="buy-now fl-right">Mua ngay</a>`
          : `<span>Hết hàng</span>`
      }
    </div>`
    ulElement.appendChild(liElement)
  })
  countProductEl.innerHTML = `Hiển thị ${value.length} trên ${value.length} sản phẩm`
}
// main
;(() => {
  renderListCategory('#listCategory')
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
  // get params from URL
  const searchParams = new URLSearchParams(location.search)
  if (Boolean(searchParams.get('slug'))) {
    renderListProductWithCateID({
      selector: '#listProduct',
      selectorCount: '#countProduct',
      productHeading: '#productHeading',
      slug: searchParams.get('slug'),
    })
  } else {
    renderListProduct({
      selector: '#listProduct',
      selectorCount: '#countProduct',
      searchValueUrl: searchParams.get('searchTerm'),
    })
  }
  if (Boolean(searchParams.get('searchTerm'))) {
    const searchValueUrl = searchParams.get('searchTerm')
    initSearchForm({
      idForm: 'searchForm',
      idElement: 'searchList',
      searchValueUrl,
    })
    // form filter
    initFormFilter({
      idForm: 'formFilter',
      searchValueUrl,
      onChange: renderListFilter,
    })
  } else {
    initSearchForm({
      idForm: 'searchForm',
      idElement: 'searchList',
    })
    // form filter
    initFormFilter({
      idForm: 'formFilter',
      onChange: renderListFilter,
    })
  }
  // init filter price
  initFilterPrice({
    idForm: 'formFilterPrice',
    onChange: renderListFilter,
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
