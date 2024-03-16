import productApi from '../api/productsApi'
import { formatCurrencyNumber } from './format'
import { hideSpinner, showSpinner } from './spinner'
import { toast } from './toast'
import debounce from 'lodash.debounce'

export async function renderListProductSearch(listProduct, search) {
  if (!search || !listProduct || listProduct.length === 0) return
  search.textContent = ''
  listProduct.forEach((item) => {
    const searchItem = document.createElement('search')
    searchItem.classList.add('search-item')
    searchItem.innerHTML = `<figure class="search-thumb">
    <a href="/product-detail.html?id=${item.id}">
      <img src="public/images/${item.thumb}" alt="${item.name}" class="search-img" />
    </a>
    </figure>
    <div class="search-content">
      <h3 class="search-name">
        <a href="/product-detail.html?id=${item.id}">${item.name}</a>
      </h3>
      <div class="search-price">
        <span>${formatCurrencyNumber(
          item.price * ((100 - Number.parseInt(item.discount)) / 100),
        )}</span>
        <span style="font-size: 12px;">Giảm ${item.discount}%</span>
      </div>
    </div>`
    search.appendChild(searchItem)
  })
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
    let productApply = []
    if (value.length === 0) {
      search.textContent = ''
      await renderListProductSearch(productApply, search)
    } else {
      const products = await productApi.getAll()
      productApply = products.filter((item) =>
        item?.name.toLowerCase().includes(value.toLowerCase()),
      )
      await renderListProductSearch(productApply, search)
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
  if (selectEl) {
    selectEl.addEventListener('change', async function (e) {
      showSpinner()
      const products = await productApi.getAll()
      hideSpinner()
      let productApply = []
      let productClone = [...products]
      if (searchValueUrl && searchValueUrl !== null) {
        productClone = products.filter((item) =>
          item?.name.toLowerCase().includes(searchValueUrl.toLowerCase()),
        )
      }
      const value = +e.target.value
      switch (value) {
        case 1:
          productApply = productClone.sort((a, b) => {
            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()
            return nameB > nameA ? -1 : 1
          })
          break
        case 2:
          productApply = productClone.sort((a, b) => {
            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()
            return nameB > nameA ? 1 : -1
          })
          break
        case 3:
          productApply = productClone.sort((a, b) => {
            const priceA = a.price * ((100 - Number.parseInt(a.discount)) / 100)
            const priceB = b.price * ((100 - Number.parseInt(b.discount)) / 100)
            return priceB - priceA
          })
          break
        case 4:
          productApply = productClone.sort((a, b) => {
            const priceA = a.price * ((100 - Number.parseInt(a.discount)) / 100)
            const priceB = b.price * ((100 - Number.parseInt(b.discount)) / 100)
            return priceA - priceB
          })
          break
        default:
          break
      }
      await onChange?.(productApply)
    })
  }
}

const filters = {
  priceMin: null,
  priceMax: null,
  brand: null,
}

function handleRadioChange(event, filterType) {
  const value = event.target.value

  if (filterType === 'price') {
    const minMax = value.split('-')
    filters.priceMin = minMax[0] ? parseInt(minMax[0]) : null
    filters.priceMax = minMax[1] ? parseInt(minMax[1]) : null
  } else {
    filters[filterType] = value
  }

  return filters
}

export function initFilterPrice({ idForm, onChange }) {
  const form = document.getElementById(idForm)
  if (!form) return
  const listRadio = form.querySelectorAll("input[type='radio']")
  if (listRadio) {
    ;[...listRadio].forEach((radio) => {
      radio.addEventListener('click', async function (e) {
        showSpinner()
        const products = await productApi.getAll()
        hideSpinner()
        let productApply = []
        const filterType = e.target.name.split('-')[1]
        handleRadioChange(e, filterType)
        if (Object.values(filters).every((value) => value !== null)) {
          productApply = products.filter((item) => {
            const price = item.price * ((100 - Number.parseInt(item.discount)) / 100)
            const priceCondition = price >= filters.priceMin && price <= filters.priceMax
            const brandCondition = item?.name.toLowerCase().includes(filters.brand.toLowerCase())
            return priceCondition && brandCondition
          })
        } else {
          if (filters.brand) {
            const brandName = filters.brand
            productApply = products.filter((item) =>
              item?.name.toLowerCase().includes(brandName.toLowerCase()),
            )
          } else {
            productApply = products.filter((item) => {
              const price = item.price * ((100 - Number.parseInt(item.discount)) / 100)
              const priceCondition = price >= filters.priceMin && price <= filters.priceMax
              return priceCondition
            })
          }
        }
        await onChange?.(productApply)
      })
    })
  }
}
