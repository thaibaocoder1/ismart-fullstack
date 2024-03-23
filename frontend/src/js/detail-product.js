import productApi from './api/productsApi'
import commentApi from './api/commentApi'
import userApi from './api/userApi'
import {
  addCartToDom,
  addProductToCart,
  calcPrice,
  checkStatus,
  renderListCategory,
  formatCurrencyNumber,
  hideSpinner,
  initSearchForm,
  initSwiper,
  showSpinner,
  sweetAlert,
  toast,
} from './utils'
import { initProductComment } from './utils'
import dayjs from 'dayjs'

async function renderDetailProduct({
  boxIDRight,
  boxIDLeft,
  boxIDDesc,
  breadcrumbTitle,
  productID,
}) {
  const infoProductRight = document.getElementById(boxIDRight)
  const infoProductLeft = document.getElementById(boxIDLeft)
  const infoProductDesc = document.getElementById(boxIDDesc)
  const breadcrumbTitleEl = document.getElementById(breadcrumbTitle)
  if (!infoProductRight || !infoProductLeft || !breadcrumbTitle || !infoProductDesc) return
  try {
    showSpinner()
    const data = await productApi.getById(productID)
    hideSpinner()
    const { product } = data
    const mainImg = infoProductLeft.querySelector('#zoom')
    if (!mainImg) return
    mainImg.src = `/images/${product.thumb.fileName}`
    mainImg.setAttribute('data-zoom-image', `/images/${product.thumb.fileName}`)
    mainImg.style = `width: 340px; height: 340px; display: block; object-fit: contain;`
    breadcrumbTitleEl.innerText = product.name
    infoProductRight.innerHTML = `<h3 class="product-name">${product.name}</h3>
    <div class="desc">
      <p>${product.description}</p>
    </div>
    <div class="num-product">
      <span class="title">Trạng thái: </span>
      <span class="status">${checkStatus(product)}</span>
    </div>
    <div class="num-product">
      <span class="title">Số lượng: </span>
      <span>${Number.parseInt(product.status) === 0 ? 0 : product.quantity} sản phẩm</span>
    </div>
    <p class="price">${formatCurrencyNumber(calcPrice(product))}</p>
    <div id="num-order-wp">
      <span id="minus"><i class="fa fa-minus"></i></span>
      <input type="text" value="1" data-quantity="1" name="num-order" id="num-order" />
      <span id="plus"><i class="fa fa-plus"></i></span>
    </div>
    <button data-id=${product._id} title="Thêm giỏ hàng" class="add-cart" ${
      Number.parseInt(product.quantity) > 0 && Number.parseInt(product.status) === 1
        ? ''
        : 'disabled'
    }>Thêm giỏ hàng</button>
    <button data-id=${product._id} title="Mua ngay" class="buy-now add-cart--fast" ${
      Number.parseInt(product.quantity) > 0 && Number.parseInt(product.status) === 1
        ? ''
        : 'disabled'
    }>Mua ngay</button>`
    infoProductDesc.innerHTML = `<p>${product.description}</p>`
    // fetch list product same category
    await renderListProductSameCategory({
      idElement: 'listProductSame',
      swiperWrapper: '.swiper-wrapper',
      categoryID: product.categoryID._id,
      productID,
    })
  } catch (err) {
    console.log('failed to fetch detail product', err)
  }
}
async function renderListProductSameCategory({ idElement, swiperWrapper, categoryID, productID }) {
  const divElement = document.getElementById(idElement)
  if (!divElement) return
  const swiperWrapperEl = divElement.querySelector(swiperWrapper)
  if (!swiperWrapperEl) return
  try {
    const data = await productApi.getAll()
    const { products } = data
    const listProductSame = products.filter(
      (item) => item.categoryID.toString() === categoryID && item._id.toString() !== productID,
    )
    listProductSame.forEach((item) => {
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
        <a href="/cart.html" title="Thêm giỏ hàng" id="btn-cart" data-id=${
          item._id
        } class="btn-custom add-cart fl-left">Thêm giỏ hàng</a>
        <a href="checkout.html" data-id=${
          item._id
        } title="Mua ngay" id="btn-buynow" class="btn-custom buy-now fl-right">Mua ngay</a>
      </div>`
      swiperWrapperEl.appendChild(divElement)
      initSwiper()
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

async function renderListComment({ idElement, productID }) {
  const commentList = document.getElementById(idElement)
  if (!commentList) return
  commentList.textContent = ''
  try {
    showSpinner()
    const res = await commentApi.getAll()
    hideSpinner()
    const { comments } = res
    if (comments.length > 0) {
      const commentApply = comments.filter((comment) => comment.productID === productID)
      const commentSort = commentApply.sort((a, b) => b.id - a.id)
      commentSort?.forEach(async (item) => {
        const commentItem = document.createElement('div')
        commentItem.classList.add('comment-item')
        const userInfo = await userApi.getById(item.userID)
        const { user } = userInfo
        commentItem.innerHTML = `<figure class="comment-thumb">
      <img
        src="${user?.imageUrl}"
        alt="${user?.username}"
        class="comment-img"
      />
    </figure>
    <div class="comment-content">
      <div class="comment-top">
        <h3 class="comment-author">${user?.username}</h3>
        <time class="comment-date">${dayjs(item?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</time>
      </div>
      <p class="comment-desc">${item?.text}</p>
    </div>`
        commentList.appendChild(commentItem)
      })
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

async function handleOnSubmitForm(value, productID, userID) {
  try {
    const data = {
      productID,
      userID,
      text: value,
    }
    showSpinner()
    const addComment = await commentApi.add(data)
    hideSpinner()
    if (addComment.success) toast.success('Bình luận thành công')
    setTimeout(() => {
      window.location.assign(`product-detail.html?id=${productID}`)
    }, 500)
  } catch (error) {
    toast.error('Có lỗi trong khi xử lý')
  }
}

// main
;(() => {
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
  renderListCategory('#listCategory')
  const searchParams = new URLSearchParams(location.search)
  const productID = searchParams.get('id')
  if (!productID) return
  renderDetailProduct({
    boxIDRight: 'infoProductRight',
    boxIDLeft: 'infoProductLeft',
    boxIDDesc: 'infoProductDesc',
    breadcrumbTitle: 'breadcrumb-title',
    productID,
  })
  initProductComment({
    idForm: 'formComment',
    infoUserStorage,
    productID,
    onSubmit: handleOnSubmitForm,
  })
  renderListComment({
    idElement: 'comments',
    productID,
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
        const numOrderEl = target.previousElementSibling?.querySelector("[name='num-order']")
        let quantity = 1
        if (numOrderEl) {
          quantity = +numOrderEl.dataset.quantity
        }
        cart = addProductToCart(productID, cart, infoUserStorage, quantity)
        toast.success('Thêm sản phẩm thành công')
        setTimeout(() => {
          window.location.assign(`/product-detail.html?id=${productID}`)
        }, 500)
      }
    } else if (target.closest('#minus')) {
      const parent = target.closest('#num-order-wp')
      if (!parent) return
      const numOrderDetail = parent.querySelector('#num-order')
      if (+numOrderDetail.value <= 1) {
        numOrderDetail.value = 1
        toast.error('Số lượng tối thiểu là 1')
      } else {
        numOrderDetail.value--
        numOrderDetail.dataset.quantity = numOrderDetail.value--
      }
    } else if (target.closest('#plus')) {
      const parent = target.closest('#num-order-wp')
      if (!parent) return
      const numOrderDetail = parent.querySelector('#num-order')
      if (+numOrderDetail.value >= 1) {
        numOrderDetail.value++
        numOrderDetail.dataset.quantity = +numOrderDetail.value
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
