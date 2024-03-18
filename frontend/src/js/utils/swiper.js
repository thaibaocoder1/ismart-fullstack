import Swiper from 'swiper'
import 'swiper/css'
import productApi from '../api/productsApi'
import { calcPrice, formatCurrencyNumber } from './format'
export async function displaySwiper(selector) {
  const sliderWrapper = document.querySelector(selector)
  if (!sliderWrapper) return
  const data = await productApi.getAll()
  const { products } = data
  const productApply = products.slice(0, 8)
  productApply.forEach((item) => {
    const divElement = document.createElement('div')
    divElement.classList.add('swiper-slide', 'swiper-slide--custom')
    divElement.dataset.id = item._id
    divElement.innerHTML = `
    <a href="product-detail.html?id=${item._id}" title="${item.name}" class="thumb">
    <img src="/images/${item.thumb.fileName}" alt="${item.name}" />
    </a>
    <a href="product-detail.html?id=${item._id}" title="${item.name}" class="product-name">${
      item.name
    }</a>
    <div class="price">
      <span class="new">${formatCurrencyNumber(calcPrice(item))}</span>
      <span class="old">${formatCurrencyNumber(item.price)}</span>
    </div>
    <div class="action clearfix">
      <a href="cart.html" title="Thêm giỏ hàng" id="btn-cart" data-id=${
        item._id
      } class="btn-custom add-cart fl-left">Thêm giỏ hàng</a>
      <a href="checkout.html" title="Mua ngay" id="btn-buynow" class="btn-custom buy-now fl-right">Mua ngay</a>
    </div>`
    sliderWrapper.appendChild(divElement)
  })
}
export function initSwiper() {
  const swiper = new Swiper('.swiper', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  })
}
document.addEventListener('DOMContentLoaded', () => {
  initSwiper()
})
