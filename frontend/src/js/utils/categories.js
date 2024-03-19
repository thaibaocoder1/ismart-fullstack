import productApi from '../api/productsApi'
import categoryApi from '../api/categoryApi'
import { calcPrice, formatCurrencyNumber } from './format'
import { showSpinner, hideSpinner } from './spinner'
export async function renderListCategory(selector) {
  const ulElement = document.querySelector(selector)
  if (!ulElement) return
  ulElement.textContent = ''
  const catalogs = await categoryApi.getAll()
  const { catalogs: results } = catalogs
  if (Array.isArray(results) && results.length > 0) {
    results.forEach((item) => {
      const liElement = document.createElement('li')
      liElement.innerHTML = `<a href="/products.html?slug=${item.slug}" title="${item.title}">${item.title}</a>`
      ulElement.appendChild(liElement)
    })
  }
}
export async function renderListProductWithCateID({
  selector,
  selectorCount,
  productHeading,
  slug,
}) {
  const ulElement = document.querySelector(selector)
  const countProductEl = document.querySelector(selectorCount)
  const productHeadingEl = document.querySelector(productHeading)
  if (!ulElement || !productHeadingEl || !countProductEl) return
  ulElement.textContent = ''
  try {
    showSpinner()
    const data = await productApi.getAll()
    const categories = await categoryApi.getAll()
    hideSpinner()
    const { products } = data
    const { catalogs } = categories
    const category = catalogs.find((x) => x.slug === slug)
    catalogs.forEach((item) => {
      if (item.slug === slug) {
        productHeadingEl.innerText = item.title
      }
    })
    const listProductApply = products.filter(
      (item) => item.categoryID.toString() === category._id.toString(),
    )
    if (Array.isArray(listProductApply) && listProductApply.length > 0) {
      listProductApply.forEach((item) => {
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
              ? `<a href="/cart.html" title="Thêm giỏ hàng" data-id=${item._id} class="add-cart fl-left">Thêm giỏ hàng</a>
          <a title="Mua ngay"  data-id=${item._id} class="buy-now fl-right">Mua ngay</a>`
              : `<span>Hết hàng</span>`
          }
        </div>`
        ulElement.appendChild(liElement)
      })
      countProductEl.innerHTML = `Hiển thị ${listProductApply.length} trên ${data.results} sản phẩm`
    } else {
      const textElement = document.createElement('span')
      textElement.innerHTML = 'Sản phẩm đang phát triển!!!'
      ulElement.appendChild(textElement)
    }
  } catch (error) {
    console.log('not data to display', error)
  }
}
