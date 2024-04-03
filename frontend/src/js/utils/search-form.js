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
    listProduct.forEach((item) => {
      const searchItem = document.createElement('search')
      search.style.height = `${listProduct.length > 0 ? '200px' : '0px'}`
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
    if (value.length === 0) {
      search.textContent = ''
      await renderListProductSearch(listProduct, search)
    } else {
      const res = await productApi.getAll()
      if (res.success) {
        const { products } = res
        listProduct = products.filter((item) =>
          item?.name.toLowerCase().includes(value.toLowerCase()),
        )
      }
      await renderListProductSearch(listProduct, search)
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
      const res = await productApi.getAll(params)
      let productApply = []
      let productClone = [...res.products]
      if (searchValueUrl && searchValueUrl !== null) {
        productClone = products.filter((item) =>
          item?.name.toLowerCase().includes(searchValueUrl.toLowerCase()),
        )
      }
      const value = e.target.value

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
    combinedParams.set('page', 1)
    showSpinner()
    const data = await productApi.getAll(combinedParams)
    hideSpinner()
    const { products, pagination, allProducts } = data
    renderListProduct({
      selector: '#listProduct',
      selectorCount: '#countProduct',
      products,
      allProducts,
      pagination,
      searchValueUrl: combinedParams.get('searchTerm'),
    })
    renderPagination(pagination)
  }
}

function resetFilters() {
  document
    .querySelectorAll('input[name="brand"]:checked')
    .forEach((checkbox) => (checkbox.checked = false))
  document.querySelector('input[name="min-price"]').value = ''
  document.querySelector('input[name="max-price"]').value = ''
}
