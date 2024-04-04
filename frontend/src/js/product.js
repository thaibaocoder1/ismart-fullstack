import {
  formatCurrencyNumber,
  hideSpinner,
  showSpinner,
  renderListCategory,
  addCartToDom,
  sweetAlert,
  addProductToCart,
  toast,
  initSearchForm,
  initFormFilter,
  calcPrice,
  initFilterProduct,
} from './utils'
import productApi from './api/productsApi'

async function renderListProduct({
  selector,
  selectorCount,
  products,
  allProducts,
  pagination,
  searchValueUrl,
}) {
  const ulElement = document.querySelector(selector)
  const countProductEl = document.querySelector(selectorCount)
  if (!ulElement || !countProductEl) return
  ulElement.textContent = ''
  try {
    let dataApply = []
    if (searchValueUrl !== null) {
      dataApply = allProducts.filter((item) =>
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
          <img src="${item.thumb.fileName}" alt="${item.name}" />
        </a>
        <a href="product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
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
      if (products.length > 0) {
        products.forEach((item) => {
          const liElement = document.createElement('li')
          liElement.dataset.id = item._id
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
        countProductEl.innerHTML = `Hiển thị ${products.length} trên ${pagination.totalRows} sản phẩm`
      } else {
        toast.info('Sản phẩm đang phát triển')
        const textElement = document.createElement('span')
        textElement.innerHTML = 'Sản phẩm đang phát triển!!!'
        ulElement.appendChild(textElement)
      }
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
      <img src="${item.thumb.fileName}" alt="${item.name}" />
    </a>
    <a href="product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
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
function renderPagination(pagination) {
  if (!pagination) return
  const { currentPage, totalRows, limit } = pagination
  const totalPages = Math.ceil(totalRows / limit)
  const ulPagination = document.getElementById('pagination')
  ulPagination.dataset.totalPages = totalPages
  ulPagination.dataset.page = currentPage
  if (currentPage <= 1) ulPagination.firstElementChild?.classList.add('disabled')
  else ulPagination.firstElementChild?.classList.remove('disabled')

  if (currentPage >= totalPages) ulPagination.lastElementChild?.classList.add('disabled')
  else ulPagination.lastElementChild?.classList.remove('disabled')
}
async function handleFilterChange(filterName, filterValue) {
  const url = new URL(window.location)
  url.searchParams.set(filterName, filterValue)
  history.pushState({}, '', url)
  const data = await productApi.getWithParams(url.searchParams)
  const { products, pagination, allProducts } = data
  await renderListProduct({
    selector: '#listProduct',
    selectorCount: '#countProduct',
    products,
    allProducts,
    pagination,
    searchValueUrl: url.searchParams.get('searchTerm'),
  })
  renderPagination(pagination)
}
function handlePrevClick(e) {
  e.preventDefault()
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const page = Number.parseInt(ulPagination.dataset.page) || 1
  if (page <= 1) return
  handleFilterChange('page', page - 1)
}
function handleNextClick(e) {
  e.preventDefault()
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const page = Number.parseInt(ulPagination.dataset.page) || 1
  const totalPages = Number.parseInt(ulPagination.dataset.totalPages)
  if (page >= totalPages) return
  handleFilterChange('page', page + 1)
}
function initPagination() {
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const prevLink = ulPagination.firstElementChild?.firstElementChild
  if (prevLink) {
    prevLink.addEventListener('click', handlePrevClick)
  }
  const nextLink = ulPagination.lastElementChild?.lastElementChild
  if (nextLink) {
    nextLink.addEventListener('click', handleNextClick)
  }
}
function initURL() {
  if (window.location.pathname === '/products.html') {
    const url = new URL(window.location)
    if (!url.searchParams.get('page')) url.searchParams.set('page', 1)
    if (!url.searchParams.get('limit')) url.searchParams.set('limit', 4)
    history.pushState({}, '', url)
  }
}
// main
;(async () => {
  initURL()
  const params = new URLSearchParams(window.location.search)
  // init pagination
  initPagination()
  showSpinner()
  const data = await productApi.getWithParams(params)
  hideSpinner()
  const { products, pagination, allProducts } = data
  await renderListProduct({
    selector: '#listProduct',
    selectorCount: '#countProduct',
    products,
    allProducts,
    pagination,
    searchValueUrl: params.get('searchTerm'),
  })
  renderPagination(pagination)
  await renderListCategory('#listCategory')
  // init filter product
  initFilterProduct('btn-filter')
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

  if (Boolean(params.get('searchTerm'))) {
    const searchValueUrl = params.get('searchTerm')
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
