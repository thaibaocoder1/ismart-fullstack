import productApi from '../api/productsApi'
import { calcPrice, formatCurrencyNumber } from './format'
import { hideSpinner, showSpinner } from './spinner'
import { toast } from './toast'
import debounce from 'lodash.debounce'

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
async function handleFilterChange(combinedParams) {
  const url = new URL(window.location)
  const data = await productApi.getWithParams(combinedParams)
  console.log(data)
  console.log(combinedParams.get('brand'))
  const { products, pagination, allProducts } = data
  console.log(products)
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
function handlePrevClick(combinedParams) {
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const page = Number.parseInt(combinedParams.get('page')) || 1
  if (page <= 1) return
  handleFilterChange(combinedParams, page - 1)
}
function handleNextClick(combinedParams) {
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const page = Number.parseInt(combinedParams.get('page')) || 1
  const totalPages = Number.parseInt(ulPagination.dataset.totalPages)
  if (page >= totalPages) return
  console.log(page)
  return
  handleFilterChange(combinedParams, page + 1)
}
function initPagination(combinedParams) {
  const ulPagination = document.getElementById('pagination')
  if (!ulPagination) return
  const prevLink = ulPagination.firstElementChild?.firstElementChild
  if (prevLink) {
    prevLink.addEventListener('click', (e) => {
      e.preventDefault()
      handlePrevClick(combinedParams)
    })
  }
  const nextLink = ulPagination.lastElementChild?.lastElementChild
  if (nextLink) {
    nextLink.addEventListener('click', (e) => {
      e.preventDefault()
      handleNextClick(combinedParams)
    })
  }
}
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
export async function renderListProductSearch(listProduct, search) {
  if (!search || listProduct.length === 0) return
  search.textContent = ''
  if (listProduct.length > 0) {
    search.classList.add('is-has-product')
    listProduct.forEach((item) => {
      const searchItem = document.createElement('search')
      searchItem.classList.add('search-item')
      searchItem.innerHTML = `<figure class="search-thumb">
    <a href="product-detail.html?id=${item._id}">
      <img src="${item.thumb.fileName}" alt="${item.name}" class="search-img" />
    </a>
    </figure>
    <div class="search-content">
      <h3 class="search-name">
        <a href="product-detail.html?id=${item._id}">${item.name}</a>
      </h3>
      <div class="search-price">
        <span>${formatCurrencyNumber(calcPrice(item))}</span>
        <span style="font-size: 12px;">Giảm ${item.discount}%</span>
      </div>
    </div>`
      search.appendChild(searchItem)
    })
  }
}

export function initSearchForm({ idForm, idElement, searchValueUrl }) {
  const form = document.getElementById(idForm)
  const search = document.getElementById(idElement)
  if (!form || !search) return
  const searchTerm = form.querySelector("[name='searchTerm']")
  if (searchValueUrl && searchValueUrl.length > 0) {
    searchTerm.value = searchValueUrl
  }
  const debounceSearch = debounce(async (e) => {
    const { target } = e
    const value = target.value
    let listProduct = []
    const res = await productApi.getAll()
    if (value.length === 0) {
      search.classList.remove('is-has-product')
    } else {
      if (res.success) {
        const { products } = res
        listProduct = products.filter((item) =>
          item?.name.toLowerCase().includes(value.toLowerCase()),
        )
        await renderListProductSearch(listProduct, search)
      }
    }
  }, 500)
  searchTerm.addEventListener('input', debounceSearch)
  form.addEventListener('submit', function (e) {
    const searchValue = this.elements['searchTerm'].value
    if (searchValue === '' && window.location.pathname === '/index.html') {
      e.preventDefault()
      toast.error('Phải nhập vào thông tin tìm kiếm')
    }
  })
}
async function handleChange(params, searchValueUrl, value) {
  const res = await productApi.getWithParams(params)
  let productApply = []
  let productClone = [...res.products]
  if (searchValueUrl && searchValueUrl !== null) {
    productClone = products.filter((item) =>
      item?.name.toLowerCase().includes(searchValueUrl.toLowerCase()),
    )
  }
  switch (value) {
    case 'discount':
      productApply = productClone.sort((a, b) => b.discount - a.discount)
      break
    case 'decrease':
      productApply = productClone.sort((a, b) => {
        const priceA = calcPrice(a)
        const priceB = calcPrice(b)
        return priceB - priceA
      })
      break
    case 'increase':
      productApply = productClone.sort((a, b) => {
        const priceA = calcPrice(a)
        const priceB = calcPrice(b)
        return priceA - priceB
      })
      break
    default:
      productApply = productClone
      break
  }
  return productApply
}
export function initFormFilter({ idForm, searchValueUrl, onChange }) {
  const form = document.getElementById(idForm)
  if (!form) return
  const selectEl = form.querySelector("[name='select']")
  form.addEventListener('submit', function (e) {
    e.preventDefault()
  })
  const params = new URLSearchParams(window.location.search)
  if (selectEl) {
    selectEl.addEventListener('change', async function (e) {
      let value = e.target.value
      const productApply = await handleChange(params, searchValueUrl, value)
      if (productApply.length > 0) {
        toast.success('Filter success')
      }
      await onChange?.(productApply)
    })
  }
}
export function initFilterProduct(selector) {
  const button = document.getElementById(selector)
  if (!button) return
  const modalFilter = document.getElementById('filter-wrapper')
  const applyBtn = document.getElementById('apply-btn')
  const resetBtn = document.getElementById('reset-btn')

  applyBtn.addEventListener('click', applyFilters)
  resetBtn.addEventListener('click', resetFilters)
  button.addEventListener('click', (e) => {
    modalFilter && modalFilter.classList.add('is-active')
  })
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-wrapper')) {
      modalFilter && modalFilter.classList.remove('is-active')
    }
  })
}
async function applyFilters() {
  const brandFilters = document.querySelectorAll('input[name="brand"]:checked')
  const minPrice = document.querySelector('input[name="min-price"]').value
  const maxPrice = document.querySelector('input[name="max-price"]').value

  const queryParams = {}

  if (brandFilters.length > 0) {
    const brands = []
    brandFilters.forEach((filter) => brands.push(filter.value))
    queryParams.brand = brands.join(',')
  }

  if (minPrice !== '') {
    queryParams.minPrice = minPrice
  } else {
    queryParams.minPrice = 1
  }

  if (maxPrice !== '') {
    queryParams.maxPrice = maxPrice
  }

  if (Number(minPrice) > Number(maxPrice)) {
    toast.error('Kiểm tra lại khoảng giá tìm kiếm!')
    return
  }

  if (queryParams) {
    const searchParams = new URLSearchParams(location.search)
    const combinedParams = new URLSearchParams(searchParams)
    Object.entries(queryParams).forEach(([key, value]) => {
      combinedParams.append(key, value)
    })
    if (combinedParams.get('brand')) {
      combinedParams.set('page', 1)
    }
    showSpinner()
    const data = await productApi.getWithParams(combinedParams)
    hideSpinner()
    const { products, pagination, allProducts } = data
    if (products.length > 0) {
      toast.success('Filter success')
    } else {
      toast.error('Not found')
    }
    await renderListProduct({
      selector: '#listProduct',
      selectorCount: '#countProduct',
      products,
      allProducts,
      pagination,
      searchValueUrl: combinedParams.get('searchTerm'),
    })
    renderPagination(pagination)
    initPagination(combinedParams)
  }
}
function resetFilters() {
  document
    .querySelectorAll('input[name="brand"]:checked')
    .forEach((checkbox) => (checkbox.checked = false))
  document.querySelector('input[name="min-price"]').value = ''
  document.querySelector('input[name="max-price"]').value = ''
}
