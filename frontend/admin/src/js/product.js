import categoryApi from '../../../src/js/api/categoryApi'
import productApi from '../../../src/js/api/productsApi'
import {
  calcPrice,
  checkStatus,
  formatCurrencyNumber,
  hideSpinner,
  initSearchInput,
  showSpinner,
  toast,
} from '../../../src/js/utils'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

async function renderListProductAdmin({ idElement, data }) {
  const table = document.getElementById(idElement)
  if (!table) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  tbody.textContent = ''
  try {
    if (Array.isArray(data) && data.length > 0) {
      data?.forEach((item, index) => {
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.code}</span></td>
      <td>
        <div class="tbody-thumb">
          <img src="${item.thumb.fileName}" alt="${item.name}" style="width: 100%;
          height: 100%; object-fit: contain;" />
        </div>
      </td>
      <td>
        <div class="tb-title fl-left">
          <a href="/product-detail.html?id=${item._id}" title="${item.name}">${item.name}</a>
        </div>
      </td>
      <td><span class="tbody-text">${formatCurrencyNumber(calcPrice(item))}</span></td>
      <td><span class="tbody-text">${item.quantity}</span></td>
      <td><span class="tbody-text">${checkStatus(item)}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY')}</span></td>
      <td><span class="tbody-text">${dayjs(item.updatedAt).format('DD/MM/YYYY')}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" id="editProduct" data-id="${
          item._id
        }" onclick='window.location.assign("/admin/edit-product.html?id=${
          item._id
        }")' style="color: #fff; background-position: unset;">Chỉnh sửa</button>
      </td>`
        tbody.appendChild(tableRow)
      })
    } else {
      showSpinner()
      const data = await productApi.getAll()
      hideSpinner()
      const { products, productsSold } = data
      products?.forEach((item, index) => {
        const quantitySold = productsSold
          .filter((x) => x.orderID.status === 3 && x.productID === item._id)
          .reduce((total, item) => {
            return total + item.quantity
          }, 0)
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.code}</span></td>
      <td>
        <div class="tbody-thumb">
          <img src="${item.thumb.fileName}" alt="${item.name}" style="width: 100%;
          height: 100%; object-fit: contain;" />
        </div>
      </td>
      <td>
        <div class="tb-title fl-left">
          <a href="/product-detail.html?id=${item._id}" title="${item.name}">${item.name}</a>
        </div>
      </td>
      <td><span class="tbody-text">${formatCurrencyNumber(calcPrice(item))}</span></td>
      <td><span class="tbody-text">${item.quantity}</span></td>
      <td><span class="tbody-text">${checkStatus(item)}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY')}</span></td>
      <td><span class="tbody-text">${dayjs(item.updatedAt).format('DD/MM/YYYY')}</span></td>
      <td><span class="tbody-text">${quantitySold}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" id="editProduct" data-id="${
          item._id
        }" style="color: #fff; background-position: unset;">Chỉnh sửa</button>
      </td>`
        tbody.appendChild(tableRow)
      })
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const data = await productApi.getAll()
  const { products } = data
  const productApply = products.filter((product) =>
    diacritics.remove(product?.name.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  productApply?.forEach((item, index) => {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `
    <td><span class="tbody-text">${index + 1}</span></td>
    <td><span class="tbody-text">${item.code}</span></td>
    <td>
      <div class="tbody-thumb">
        <img src="${item.thumb.fileName}" alt="${item.name}" style="width: 100%;
        height: 100%; object-fit: contain;" />
      </div>
    </td>
    <td>
      <div class="tb-title fl-left">
        <a href="/product-detail.html?id=${item._id}" title="${item.name}">${item.name}</a>
      </div>
    </td>
    <td><span class="tbody-text">${formatCurrencyNumber(calcPrice(item))}</span></td>
    <td><span class="tbody-text">${item.quantity}</span></td>
    <td><span class="tbody-text">${checkStatus(item)}</span></td>
    <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY')}</span></td>
    <td><span class="tbody-text">${dayjs(item.updatedAt).format('DD/MM/YYYY')}</span></td>
    <td>
      <button class="btn btn-primary" id="editProduct" onclick='window.location.assign("/admin/edit-product.html?id=${
        item._id
      }")' data-id="${item._id}" style="color: #fff; background-position: unset;">Chỉnh sửa</button>
    </td>`
    tbodyEl.appendChild(tableRow)
  })
}
async function renderListActions({ idElement }) {
  const selectElement = document.getElementById(idElement)
  if (!selectElement) return
  try {
    showSpinner()
    const res = await categoryApi.getAll()
    hideSpinner()
    if (res.success) {
      const { catalogs } = res
      selectElement.textContent = ''
      catalogs.forEach((item) => {
        const optionEl = document.createElement('option')
        optionEl.value = item.slug
        optionEl.text = item.title
        selectElement.appendChild(optionEl)
      })
    }
  } catch (error) {
    console.log('Error', error)
  }
}
async function initFilterForm({ selector }) {
  const form = document.querySelector(selector)
  if (!form) return
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const selectElement = form.elements['actions']
    const optionList = selectElement.options
    const index = selectElement.selectedIndex
    const slug = optionList[index].value
    if (slug) {
      try {
        showSpinner()
        const res = await productApi.getByCatalog(slug)
        hideSpinner()
        if (res.success) {
          const { products } = res
          toast.info('Lọc thành công')
          await renderListProductAdmin({
            idElement: 'listProductTable',
            data: products,
          })
        } else {
          toast.info('Danh mục chưa có sản phẩm')
          return
        }
      } catch (error) {
        console.log('Error', error)
      }
    }
  })
}

// main
;(async () => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listProductTable',
    onChange: handleFilterChange,
  })
  await renderListActions({
    idElement: 'actions',
  })
  await initFilterForm({
    selector: '.form-actions',
  })
  await renderListProductAdmin({
    idElement: 'listProductTable',
    data: [],
  })
  const buttonProducts = document.querySelectorAll('button#editProduct')
  if (buttonProducts) {
    buttonProducts.forEach((button) => {
      button.addEventListener('click', function () {
        const productID = button.dataset.id
        window.location.assign(`/admin/edit-product.html?id=${productID}`)
      })
    })
  }
})()
