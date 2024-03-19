import productApi from '../api/productsApi'
import { calcPrice, formatCurrencyNumber, shuffle } from './format'
import { hideSpinner, showSpinner } from './spinner'

export async function renderListProductSeller(selector) {
  const ulElement = document.querySelector(selector)
  if (!ulElement) return
  try {
    showSpinner()
    const data = await productApi.getAll()
    hideSpinner()
    const { products } = data
    const listProductApply = shuffle(products).slice(0, 5)
    if (Array.isArray(listProductApply) && listProductApply.length > 0) {
      listProductApply.forEach((item) => {
        const liElement = document.createElement('li')
        liElement.dataset.id = item.id
        liElement.classList.add('clearfix')
        liElement.innerHTML = `<a href="product-detail.html?id=${item._id}" title="${
          item.name
        }" class="thumb fl-left">
        <img src="/images/${item.thumb.fileName}" alt="${item.name}" />
        </a>
        <div class="info fl-right">
          <a href="product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
          item.name
        }</a>
          <div class="price">
            <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
            <span class="old">${formatCurrencyNumber(item.price)}</span>
          </div>
          <a href="checkout.html" data-id=${item._id} title="Mua ngay" class="buy-now">Mua ngay</a>
        </div>`
        ulElement.appendChild(liElement)
      })
    }
  } catch (error) {
    console.log('not data to display', error)
  }
}
