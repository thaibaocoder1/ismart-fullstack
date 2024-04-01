import productApi from '../api/productsApi'
import { renderListProduct, renderPagination } from '../product'
import { calcPrice, formatCurrencyNumber } from './format'
import { hideSpinner, showSpinner } from './spinner'
import { toast } from './toast'
import debounce from 'lodash.debounce'

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
